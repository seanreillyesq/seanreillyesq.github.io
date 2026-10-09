#!/usr/bin/env python3
"""Content lint and link check for the Jekyll blog (standard library only).

Usage: python3 scripts/lint-site.py --source . --site _site [--strict]

Prints findings as "LEVEL path: message". Exits 1 if any FAIL is found
(with --strict, WARN findings count as FAIL), otherwise 0.
"""
import argparse
import glob
import os
import re
import sys
import urllib.parse
from html.parser import HTMLParser

# Checks listed here report WARN instead of FAIL until the existing content
# has been cleaned up. Remove a name from this set to promote the check.
# Run with --strict to treat every WARN as FAIL.
WARN_CHECKS = {"banned"}

BANNED_WORDS = [
    "delve", "leverage", "tapestry", "multifaceted", "transformative",
    "navigate", "robust", "comprehensive",
]
BANNED_PHRASES = [
    "it's worth noting", "let's dive in", "in conclusion", "to summarise",
]
POST_NAME_RE = re.compile(r"^\d{4}-\d{2}-\d{2}-[a-z0-9]+(?:-[a-z0-9]+)*\.md$")
FRONT_RE = re.compile(r"\A---[ \t]*\r?\n(.*?\r?\n)---[ \t]*\r?\n?", re.S)

findings = []


def report(check, path, message):
    level = "WARN" if check in WARN_CHECKS else "FAIL"
    findings.append((level, path, message))


def parse_front_matter(text):
    """Return (dict, body) or (None, text) if there is no front matter.

    Minimal parser: top-level `key: value` pairs and `- item` lists.
    """
    m = FRONT_RE.match(text)
    if not m:
        return None, text
    data = {}
    key = None
    for raw in m.group(1).splitlines():
        if not raw.strip() or raw.lstrip().startswith("#"):
            continue
        if raw[0] in " \t-" and key is not None:
            item = raw.strip()
            if item.startswith("- "):
                if not isinstance(data[key], list):
                    data[key] = []
                data[key].append(item[2:].strip().strip("'\""))
            continue
        km = re.match(r"^([A-Za-z0-9_-]+)\s*:\s*(.*)$", raw)
        if not km:
            raise ValueError("cannot parse line: %r" % raw)
        key, val = km.group(1), km.group(2).strip()
        if len(val) >= 2 and val[0] == val[-1] and val[0] in "'\"":
            val = val[1:-1]
        data[key] = val
    return data, text[m.end():]


def check_dashes(rel, body):
    for ch, name in (("—", "em dash"), ("–", "en dash")):
        n = body.count(ch)
        if n:
            report("dashes", rel, "%d %s(s) in body (U+%04X); use a plain hyphen" % (n, name, ord(ch)))


def check_banned(rel, body):
    lower = body.lower().replace("’", "'")
    for w in BANNED_WORDS:
        n = len(re.findall(r"\b%s\b" % re.escape(w), lower))
        if n:
            report("banned", rel, "banned word %r x%d" % (w, n))
    for p in BANNED_PHRASES:
        n = lower.count(p)
        if n:
            report("banned", rel, "banned phrase %r x%d" % (p, n))


def check_source(source):
    posts = sorted(glob.glob(os.path.join(source, "_posts", "*.md")))
    pages = sorted(glob.glob(os.path.join(source, "*.html")))
    for path in posts + pages:
        rel = os.path.relpath(path, source)
        is_post = path in posts
        with open(path, encoding="utf-8") as f:
            text = f.read()
        try:
            fm, body = parse_front_matter(text)
        except ValueError as e:
            report("frontmatter", rel, "front matter does not parse: %s" % e)
            continue
        if fm is None:
            if is_post:
                report("frontmatter", rel, "no front matter")
            continue  # root html without front matter is not a Jekyll page

        if is_post:
            if not POST_NAME_RE.match(os.path.basename(path)):
                report("filename", rel, "filename must match YYYY-MM-DD-kebab-case-slug.md")
            for k in ("title", "date", "categories"):
                if not fm.get(k):
                    report("frontmatter", rel, "missing required front matter: %s" % k)
            if fm.get("layout") != "post":
                report("frontmatter", rel, "layout must be 'post' (got %r)" % fm.get("layout"))
            if str(fm.get("hidden", "")).lower() == "true" and fm.get("robots") != "noindex":
                report("hidden-noindex", rel, "hidden: true without robots: noindex")
            check_banned(rel, body)

        check_dashes(rel, body)

        img = fm.get("header-img")
        if img:
            target = os.path.join(source, img.lstrip("/"))
            if not os.path.isfile(target):
                report("header-img", rel, "header-img %r does not exist" % img)


class RefParser(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.refs = []      # (tag, url)
        self.bad_alt = []   # src of images lacking alt

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == "a" and a.get("href"):
            self.refs.append(("a", a["href"]))
        elif tag == "img":
            if a.get("src"):
                self.refs.append(("img", a["src"]))
            if not (a.get("alt") or "").strip():
                self.bad_alt.append(a.get("src") or "(no src)")

    handle_startendtag = handle_starttag


def resolves(site, url_path):
    p = urllib.parse.unquote(url_path).lstrip("/")
    full = os.path.normpath(os.path.join(site, p))
    if not full.startswith(os.path.normpath(site)):
        return False
    if os.path.isfile(full):
        return True
    return os.path.isdir(full) and os.path.isfile(os.path.join(full, "index.html"))


def check_site(site):
    if not os.path.isdir(site):
        report("site", site, "built site directory not found; run the Jekyll build first")
        return
    for root, _dirs, files in os.walk(site):
        for name in files:
            if not name.endswith(".html"):
                continue
            path = os.path.join(root, name)
            rel = os.path.relpath(path, site)
            with open(path, encoding="utf-8", errors="replace") as f:
                parser = RefParser()
                parser.feed(f.read())
            seen = set()
            for tag, url in parser.refs:
                url = url.strip()
                if not url.startswith("/") or url.startswith("//"):
                    continue
                parts = urllib.parse.urlsplit(url)
                if parts.path.startswith("/files/") or parts.path == "/files":
                    continue
                if (tag, parts.path) in seen:
                    continue
                seen.add((tag, parts.path))
                if not resolves(site, parts.path):
                    check = "broken-img" if tag == "img" else "broken-link"
                    report(check, rel, "%s %s does not resolve in built site" % (
                        "<img src>" if tag == "img" else "<a href>", url))
            for src in parser.bad_alt:
                report("alt", rel, "<img> without non-empty alt: %s" % src)


def main():
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("--source", default=".", help="repository root")
    ap.add_argument("--site", default="_site", help="built Jekyll output")
    ap.add_argument("--strict", action="store_true", help="promote WARN to FAIL")
    args = ap.parse_args()

    check_source(args.source)
    check_site(args.site)

    if args.strict:
        findings[:] = [("FAIL",) + f[1:] for f in findings]
    for level, path, msg in sorted(findings, key=lambda f: (f[0] != "FAIL", f[1], f[2])):
        print("%s %s: %s" % (level, path, msg))
    fails = sum(1 for f in findings if f[0] == "FAIL")
    warns = len(findings) - fails
    print("Summary: %d failure(s), %d warning(s)" % (fails, warns))
    return 1 if fails else 0


if __name__ == "__main__":
    sys.exit(main())
