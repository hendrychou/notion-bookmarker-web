"""
Backend API for Notion Bookmarker Visualizer
Runs as a standalone HTTP server on this VPS.
Proxies Notion API calls — keeps the API key server-side.
"""
import json
import os
import urllib.request
import http.server
import functools

# ── Config ──────────────────────────────────────────────
HOST = "0.0.0.0"
PORT = 8765

# Load Notion API key
env_path = os.path.expanduser("~/.hermes/.env")
if os.path.exists(env_path):
    with open(env_path) as f:
        for line in f:
            line = line.strip()
            if "=" in line and not line.startswith("#"):
                k, v = line.split("=", 1)
                os.environ[k.strip()] = v.strip()

NOTION_KEY = os.environ.get("NOTION_API_KEY")
if not NOTION_KEY:
    raise RuntimeError("NOTION_API_KEY not found")

NOTION_API = "https://api.notion.com/v1"
NOTION_HEADERS = {
    "Authorization": f"Bearer {NOTION_KEY}",
    "Notion-Version": "2025-09-03",
    "Content-Type": "application/json",
}

# ── Data sources (cached in-memory) ────────────────────
RESOURCE_DB = "5f5f7af5-e2fc-4f80-bfdd-4f53b3ccef6a"
CATEGORY_DB = "ca350287-d8df-4e40-acec-e2623ad66441"

_cache = {"resources": None, "categories": None}


def notion_get(path, body=None):
    """Call Notion API."""
    req = urllib.request.Request(
        f"{NOTION_API}/{path}",
        data=json.dumps(body).encode() if body else None,
        headers=NOTION_HEADERS,
        method="POST" if body else "GET",
    )
    with urllib.request.urlopen(req, timeout=15) as resp:
        return json.loads(resp.read())


def fetch_all_resources():
    """Paginate through all Resource True entries."""
    results = []
    cursor = None
    while True:
        body = {"page_size": 100}
        if cursor:
            body["start_cursor"] = cursor
        data = notion_get(f"data_sources/{RESOURCE_DB}/query", body)
        results.extend(data.get("results", []))
        if not data.get("has_more"):
            break
        cursor = data.get("next_cursor")
    return results


def fetch_categories():
    """Get all Resource Categories."""
    data = notion_get(f"data_sources/{CATEGORY_DB}/query", {"page_size": 100})
    out = []
    for r in data.get("results", []):
        name = "".join(
            t.get("plain_text", "")
            for t in r.get("properties", {}).get("Name", {}).get("title", [])
        )
        out.append({"id": r["id"], "name": name})
    return out


def parse_resource(page):
    """Extract clean resource data from a Notion page."""
    props = page.get("properties", {})

    def rt(key):
        return "".join(
            t.get("plain_text", "")
            for t in props.get(key, {}).get("rich_text", [])
        )

    name = "".join(
        t.get("plain_text", "")
        for t in props.get("Name", {}).get("title", [])
    )

    url_prop = props.get("URL", {})
    if url_prop.get("type") == "url":
        url = url_prop.get("url", "") or ""
    else:
        url = rt("URL")

    summary = rt("Summary")
    status = props.get("Status", {}).get("status", {}).get("name", "")
    pinned = props.get("Pinned", {}).get("checkbox", False)
    date = ""
    if props.get("Date", {}).get("date"):
        date = props.get("Date", {}).get("date", {}).get("start", "")

    cats = [c["id"] for c in props.get("Category", {}).get("relation", [])]

    icon = page.get("icon", {})
    if icon and icon.get("type") == "emoji":
        emoji = icon.get("emoji", "🔖")
    else:
        emoji = "🔖"

    return {
        "id": page["id"],
        "name": name or "Untitled",
        "url": url,
        "summary": summary,
        "status": status,
        "pinned": pinned,
        "date": date,
        "categories": cats,
        "emoji": emoji,
        "notion_url": page.get("public_url") or page.get("url", ""),
    }


def load_data():
    """Fetch and cache all data."""
    resources = fetch_all_resources()
    _cache["resources"] = [parse_resource(r) for r in resources]

    cats = fetch_categories()
    cat_map = {c["id"]: c["name"] for c in cats}
    # Attach category names to each resource
    for r in _cache["resources"]:
        r["category_names"] = [cat_map.get(c, "Unknown") for c in r["categories"]]
    _cache["categories"] = cats
    return _cache


# ── HTTP Handler ───────────────────────────────────────
class APIHandler(http.server.BaseHTTPRequestHandler):
    """Simple JSON API server."""

    def _json(self, data, status=200):
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()
        self.wfile.write(json.dumps(data).encode())

    def do_OPTIONS(self):
        self._json({})

    def do_GET(self):
        path = self.path.rstrip("/")

        if path == "/api/resources":
            self._json(_cache.get("resources", []))

        elif path == "/api/categories":
            self._json(_cache.get("categories", []))

        elif path.startswith("/api/resource/"):
            rid = path.split("/")[-1]
            for r in (_cache.get("resources") or []):
                if r["id"] == rid:
                    self._json(r)
                    return
            self._json({"error": "not found"}, 404)

        elif path == "/api/stats":
            res = _cache.get("resources", [])
            self._json({
                "total": len(res),
                "pinned": sum(1 for r in res if r["pinned"]),
                "active": sum(1 for r in res if r["status"] == "Active"),
                "archived": sum(1 for r in res if r["status"] == "Archieved"),
                "categories": len(_cache.get("categories", [])),
            })

        elif path == "/api/refresh":
            try:
                load_data()
                self._json({"ok": True, "total": len(_cache.get("resources", []))})
            except Exception as e:
                self._json({"error": str(e)}, 500)

        else:
            self._json({"error": "not found"}, 404)

    def log_message(self, format, *args):
        # Quiet server
        pass


def main():
    print(f"Loading data from Notion...")
    data = load_data()
    print(f"  {len(data['resources'])} resources loaded")
    print(f"  {len(data['categories'])} categories loaded")

    server = http.server.HTTPServer((HOST, PORT), APIHandler)
    print(f"\n🚀 API server running at http://{HOST}:{PORT}")
    print(f"   GET /api/resources     — all resources")
    print(f"   GET /api/categories    — all categories")
    print(f"   GET /api/resource/:id  — single resource")
    print(f"   GET /api/stats         — stats summary")
    print(f"   GET /api/refresh       — reload from Notion")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down...")
        server.shutdown()


if __name__ == "__main__":
    main()
