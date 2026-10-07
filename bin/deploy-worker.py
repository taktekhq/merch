#!/usr/bin/env python3
"""Deploy the earned checkout Worker for taktek.io/merch and taktekbot.com/merch.

    bin/deploy-worker.py deploy             # bundle both store.json files, upload, print the URL
    bin/deploy-worker.py set-secret NAME    # value on stdin: STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, PRINTFUL_TOKEN
    bin/deploy-worker.py status             # bindings, no secret values

Code comes from ../earned/worker (github.com/taktekhq/earned). Cloudflare token: taktekbot secret
cloudflare-taktekbot-api-token. Orders stay Printful drafts until CONFIRM_ORDERS is "true".
"""
import json, os, ssl, subprocess, sys, urllib.error, urllib.request, uuid

ACCOUNT = "5f012a200d9622ea6aecef1a02693e26"
WORKER = "taktek-merch"
HERE = os.path.dirname(os.path.abspath(__file__))
SITE = os.path.dirname(HERE)
EARNED = os.path.join(SITE, "..", "earned")
STORES = [os.path.join(SITE, "store.json"), os.path.expanduser("~/work/taktekbot-builds/merch/store.json")]
BOT = os.path.expanduser("~/work/taktekhq/taktekbot")
TLS = ssl.create_default_context(cafile="/etc/ssl/cert.pem")
VARS = {"ALLOWED_ORIGINS": "https://taktek.io,https://taktekbot.com", "CONFIRM_ORDERS": "false",
        "SHIP_COUNTRIES": "US,CA,GB,IE,FR,DE,NL,BE,ES,IT,PT,AT,CH,SE,DK,NO,FI,PL,AU,NZ,AE,LB"}
_token = None


def token():
    global _token
    if _token is None:
        _token = subprocess.run([f"{BOT}/bin/get", "cloudflare-taktekbot-api-token"], capture_output=True, check=True).stdout.decode().strip()
    return _token


def cf(method, path, body=None, content_type="application/json"):
    if isinstance(body, (dict, list)): body = json.dumps(body).encode()
    req = urllib.request.Request(f"https://api.cloudflare.com/client/v4/accounts/{ACCOUNT}{path}", data=body, method=method,
                                 headers={"Authorization": f"Bearer {token()}", "Content-Type": content_type})
    try:
        with urllib.request.urlopen(req, context=TLS, timeout=60) as r: out = json.load(r)
    except urllib.error.HTTPError as e:
        raw = e.read().decode(errors="replace").replace(token(), "<token>")
        try: out = json.loads(raw)
        except ValueError: sys.exit(f"HTTP {e.code} on {method} {path}\n{raw}")
    if not out.get("success"): sys.exit(f"{method} {path} failed: {json.dumps(out.get('errors'))}")
    return out["result"]


def multipart(parts):
    b = uuid.uuid4().hex; body = b""
    for name, filename, ctype, data in parts:
        body += (f"--{b}\r\nContent-Disposition: form-data; name=\"{name}\"; filename=\"{filename}\"\r\n"
                 f"Content-Type: {ctype}\r\n\r\n").encode() + data + b"\r\n"
    return body + f"--{b}--\r\n".encode(), f"multipart/form-data; boundary={b}"


def deploy():
    import tempfile
    tmp = tempfile.mkdtemp()
    subprocess.run(["node", os.path.join(EARNED, "worker", "make-catalog.mjs"), "--out", os.path.join(tmp, "catalog.js"), *STORES], check=True)
    files = {"index.js": os.path.join(EARNED, "worker", "src", "index.js"), "catalog.js": os.path.join(tmp, "catalog.js")}
    meta = {"main_module": "index.js", "compatibility_date": "2026-09-01",
            "bindings": [{"type": "plain_text", "name": k, "text": v} for k, v in VARS.items()],
            "keep_bindings": ["secret_text"]}
    parts = [("metadata", "blob", "application/json", json.dumps(meta).encode())]
    for name, path in files.items():
        parts.append((name, name, "application/javascript+module", open(path, "rb").read()))
    existing = {s["id"] for s in cf("GET", "/workers/scripts")}
    cf("PUT", f"/workers/scripts/{WORKER}", *multipart(parts))
    if WORKER not in existing:
        cf("POST", f"/workers/scripts/{WORKER}/subdomain", {"enabled": True, "previews_enabled": False})
    sub = cf("GET", "/workers/subdomain")["subdomain"]
    print(f"deployed https://{WORKER}.{sub}.workers.dev")


def set_secret(name):
    value = sys.stdin.read().strip()
    if not value: sys.exit("no value on stdin")
    cf("PUT", f"/workers/scripts/{WORKER}/secrets", {"name": name, "text": value, "type": "secret_text"})
    print(f"set secret {name}")


def status():
    for b in cf("GET", f"/workers/scripts/{WORKER}/settings").get("bindings", []):
        print(b["type"], b["name"], b.get("text", "") if b["type"] == "plain_text" else "")


if __name__ == "__main__":
    a = sys.argv[1:]
    if a[:1] == ["deploy"]: deploy()
    elif a[:1] == ["set-secret"] and len(a) == 2: set_secret(a[1])
    elif a[:1] == ["status"]: status()
    else: sys.exit(__doc__)
