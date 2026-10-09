#!/usr/bin/env python3
"""Content lint and link check for the Jekyll site (standard library only).

Usage: python3 scripts/lint-site.py --source . --site _site [--strict]

Exit 0 when there are no FAIL findings, 1 otherwise. WARN findings are
printed but only fatal with --strict. To promote a check from WARN to FAIL
permanently, move its name out of WARN_CHECKS below (or pass --strict).
"""
import argparse
import glob
import os
import re
import sys
from html.parser import HTMLParser
from urllib.parse import unquote, urlsplit

# Checks that currently warn only because existing content still fails them.
WARN_CHECKS = {"banned-words"}

BANNED_WORDS = [
    "delve", "leverage", "tapestry", "multifaceted", "transformative",
    "navigate", "robust", "comprehensive",
]
BANNED_PHRASES = [
    "It's worth noting", "Let's dive in", "In conclusion", "To summarise",
]
FILENAME_RE = re.compile(r"^\d{4}-\d{2}-\d{2}-[a-z0-9]+(?:-[a-z0-9]+)*\.md$")
DASH_RE = re.compile("[–—]")

findings = []


def report(check, path, message):
    level = "WARN" if check in WARN_CHECKS else "FAIL"
    findings.append((level, path, message))


def split_front_matter(text):
    """Return (front_matter_text, body) or (None, text) if no front matter."""
    if text.startswith("﻿"):
        text = text[1:]
    m = re.match(r"---[ \t]*\r?\n(.*?)\r?\n---[ \t]*(?:\r?\n|$)(.*)", text, re.S)
    if not m:
        return None, text
    return m.group(1), m.group(2)


def parse_front_matter(fm):
    """Minimal YAML subset: scalars, block lists, inline lists, quotes."""
    data = {}
    key = None
    for lineno, raw in enumerate(fm.splitlines(), 1):
        if not raw.strip() or raw.lstrip().startswith("#"):
            continue
        item = re.match(r"^\s*-\s*(.*)$", raw)
        if item and key is not None and (raw.startswith(" ") or raw.startswith("-")):
            if not isinstance(data.get(key), list):
                if data.get(key) not in (None, ""):
                    raise ValueError("line %d: list item under scalar key '%s'" % (lineno, key))
                data[key] = []
            data[key].append(strip_quotes(item.group(1)))
            continue
        m = re.match(r"^([A-Za-z0-9_-]+)\s*:\s*(.*)$", raw)
        if not m:
            if raw.startswith(" ") and key is not None:
                continue  # continuation of a multi-line scalar
            raise ValueError("line %d: cannot parse '%s'" % (lineno, raw.strip()))
        key, val = m.group(1), m.group(2).strip()
        if val.startswith("[") and val.endswith("]"):
            data[key] = [strip_quotes(v.strip()) for v in val[1:-1].split(",") if v.strip()]
        elif val in ("|", ">", "|-", ">-"):
            data[key] = ""
        else:
            data[key] = strip_quotes(val)
    return data


def strip_quotes(v):
    v = v.strip()
    if len(v) >= 2 and v[0] == v[-1] and v[0] in "\"'":
        return v[1:-1]
    return v


def is_true(v):
    return str(v).strip().lower() == "true"


def lint_source(source):
    files = sorted(glob.glob(os.path.join(source, "_posts", "*.md")))
    pages = sorted(glob.glob(os.path.join(source, "*.html")))
    for path in files + pages:
        rel = os.path.relpath(path, source)
        is_post = path in files
        with open(path, encoding="utf-8") as fh:
            text = fh.read()
        fm_text, body = split_front_matter(text)
        if fm_text is None:
            if is_post:
                report("front-matter", rel, "no front matter")
            continue  # root html without front matter is not a Jekyll page
        try:
            fm = parse_front_matter(fm_text)
        except ValueError as exc:
            report("front-matter", rel, "front matter does not parse: %s" % exc)
            continue

        if is_post:
            if not FILENAME_RE.match(os.path.basename(path)):
                report("filename", rel, "filename must match YYYY-MM-DD-kebab-case-slug.md")
            for field in ("title", "date", "categories"):
                if not fm.get(field):
                    report("front-matter", rel, "missing front matter field '%s'" % field)
            if fm.get("layout") != "post":
                report("front-matter", rel, "layout must be 'post'")
            if is_true(fm.get("hidden")) and str(fm.get("robots", "")).strip() != "noindex":
                report("hidden-noindex", rel, "hidden: true without robots: noindex")

        img = fm.get("header-img")
        if img and isinstance(img, str):
            target = os.path.join(source, img.lstrip("/"))
            if not os.path.isfile(target):
                report("header-img", rel, "header-img '%s' does not exist" % img)

        for n, line in enumerate(body.splitlines(), 1):
            if DASH_RE.search(line):
                report("dashes", rel, "em or en dash in body (line %d)" % n)
        if is_post:
            for word in BANNED_WORDS:
                if re.search(r"\b%s\b" % re.escape(word), body, re.I):
                    report("banned-words", rel, "banned word '%s'" % word)
            for phrase in BANNED_PHRASES:
                pat = re.escape(phrase).replace("'", "['’]")
                if re.search(pat, body, re.I):
                    report("banned-words", rel, "banned phrase '%s'" % phrase)


class LinkParser(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.refs = []
        self.bad_alt = 0

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == "a" and a.get("href"):
            self.refs.append(a["href"])
        elif tag == "img":
            if a.get("src"):
                self.refs.append(a["src"])
            if not (a.get("alt") or "").strip():
                self.bad_alt += 1

    handle_startendtag = handle_starttag


def resolves(site, url_path):
    p = os.path.join(site, unquote(url_path).lstrip("/"))
    if url_path.endswith("/"):
        return os.path.isfile(os.path.join(p, "index.html"))
    return (os.path.isfile(p) or os.path.isfile(os.path.join(p, "index.html"))
            or os.path.isfile(p + ".html"))


def lint_site(site):
    for dirpath, _, names in os.walk(site):
        for name in sorted(names):
            if not name.endswith(".html"):
                continue
            path = os.path.join(dirpath, name)
            rel = os.path.relpath(path, site)
            parser = LinkParser()
            with open(path, encoding="utf-8", errors="replace") as fh:
                parser.feed(fh.read())
            seen = set()
            for ref in parser.refs:
                ref = ref.strip()
                if not ref.startswith("/") or ref.startswith("//"):
                    continue
                url_path = urlsplit(ref).path
                if not url_path or url_path.startswith("/files/") or url_path in seen:
                    continue
                seen.add(url_path)
                if not resolves(site, url_path):
                    report("broken-link", "_site/" + rel, "broken internal reference %s" % url_path)
            if parser.bad_alt:
                report("img-alt", "_site/" + rel, "%d img tag(s) with missing or empty alt" % parser.bad_alt)


def main():
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("--source", default=".")
    ap.add_argument("--site", default="_site")
    ap.add_argument("--strict", action="store_true", help="promote WARN to FAIL")
    args = ap.parse_args()
    if args.strict:
        WARN_CHECKS.clear()
    if not os.path.isdir(args.site):
        print("FAIL %s: site directory not found (run the Jekyll build first)" % args.site)
        return 1
    lint_source(args.source)
    lint_site(args.site)
    for level, path, message in findings:
        print("%s %s: %s" % (level, path, message))
    fails = sum(1 for f in findings if f[0] == "FAIL")
    warns = len(findings) - fails
    print("%d failure(s), %d warning(s)" % (fails, warns))
    return 1 if fails else 0


if __name__ == "__main__":
    sys.exit(main())
