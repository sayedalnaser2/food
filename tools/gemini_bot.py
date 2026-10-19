#!/usr/bin/env python3
"""Generate recipe photos by driving the Gemini website in a visible browser, signed in as YOU.

Read this first
- Automating the Gemini web app is against Google's terms and can get your account limited. You run this at
  your own risk, on your own account, and you can stop it any time (Ctrl+C).
- It has not been tested against the live site (the page layout changes often). If a step fails, the script
  says which one; the selectors are all in the SELECTORS block below.
- It does NOT try to hide that it is automated, solve captchas or bypass limits. If Gemini shows a captcha,
  a sign-in block or an image limit, the script stops and tells you.

Setup (once)
    pip install playwright pillow
    playwright install chromium          # or use --channel chrome with Google Chrome installed

Run (from the repo root)
    python tools/gemini_bot.py --list photos/prompts.json --to 103
The first run opens a browser. Sign in to Gemini yourself, then press Enter in the terminal. The login is kept in
.gemini-profile/ so you only do this once. Photos are saved to photos/<id>.jpg and photos/index.json is updated.
Re-running skips recipes that already have a photo.
"""
import argparse, base64, io, json, random, re, sys, time
from pathlib import Path

from playwright.sync_api import sync_playwright, TimeoutError as PWTimeout

GEMINI_URL = "https://gemini.google.com/app"
SELECTORS = {
    # the prompt box (try each in order)
    "prompt_box": ["rich-textarea .ql-editor", "div[role='textbox'][contenteditable='true']", "div.ql-editor[contenteditable='true']"],
    # generated images inside the latest response
    "result_img": ["model-response img", "message-content img", ".response-container img", "img.image"],
}
STOP_TEXT = re.compile(r"(reached (your|the) limit|limit on (creating|generating) images|come back (later|tomorrow)|try again (later|tomorrow)|unusual traffic|captcha|verify (it'?s|you are) you)", re.I)


def find(page, key, timeout=0):
    end = time.time() + timeout
    while True:
        for sel in SELECTORS[key]:
            loc = page.locator(sel)
            if loc.count():
                return loc
        if time.time() >= end:
            return None
        page.wait_for_timeout(500)


def blocked_text(page):
    try:
        m = STOP_TEXT.search(page.inner_text("body", timeout=3000))
        return m.group(0) if m else None
    except Exception:
        return None


def big_image_src(page, before):
    """Return the src of a newly generated, fully loaded image (>=300px) or None."""
    imgs = find(page, "result_img")
    if not imgs:
        return None
    for i in range(imgs.count() - 1, -1, -1):
        h = imgs.nth(i)
        try:
            info = h.evaluate("e => ({src: e.currentSrc || e.src, w: e.naturalWidth, h: e.naturalHeight, ok: e.complete})")
        except Exception:
            continue
        if info["ok"] and info["w"] >= 300 and info["src"] and info["src"] not in before:
            return info["src"], i
    return None


def fetch_bytes(page, src):
    """Download the image using the signed-in page itself (cookies included)."""
    b64 = page.evaluate(
        """async (u) => { const r = await fetch(u, {credentials: 'include'}); const b = new Uint8Array(await r.arrayBuffer());
           let s = ''; for (let i = 0; i < b.length; i += 0x8000) s += String.fromCharCode.apply(null, b.subarray(i, i + 0x8000));
           return btoa(s); }""", src)
    return base64.b64decode(b64)


def to_jpeg(data, size=640):
    try:
        from PIL import Image
    except ImportError:
        return data
    im = Image.open(io.BytesIO(data)).convert("RGB")
    s = min(im.size)
    l, t = (im.width - s) // 2, (im.height - s) // 2
    im = im.crop((l, t, l + s, t + s)).resize((size, size))
    out = io.BytesIO()
    im.save(out, "JPEG", quality=82)
    return out.getvalue()


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--list", default="photos/prompts.json")
    ap.add_argument("--out", default="photos")
    ap.add_argument("--from", dest="start", type=int, default=1)
    ap.add_argument("--to", type=int, default=0)
    ap.add_argument("--channel", default="", help="use an installed browser, e.g. chrome or msedge")
    ap.add_argument("--timeout", type=int, default=120, help="seconds to wait for each image")
    ap.add_argument("--pause", type=float, default=6, help="average seconds to wait between recipes")
    args = ap.parse_args()

    prompts = json.loads(Path(args.list).read_text(encoding="utf-8"))
    prompts = prompts[args.start - 1 : args.to or None]
    out = Path(args.out)
    out.mkdir(exist_ok=True)
    idx_path = out / "index.json"
    have = set(json.loads(idx_path.read_text())) if idx_path.exists() else set()
    have |= {p.stem for p in out.glob("*.jpg")}
    todo = [p for p in prompts if p["id"] not in have]
    print(f"{len(todo)} to do, {len(prompts) - len(todo)} already have photos.")
    if not todo:
        return

    with sync_playwright() as pw:
        kw = {"channel": args.channel} if args.channel else {}
        ctx = pw.chromium.launch_persistent_context(".gemini-profile", headless=False, viewport={"width": 1200, "height": 900}, **kw)
        page = ctx.pages[0] if ctx.pages else ctx.new_page()
        page.goto(GEMINI_URL)
        input("Sign in to Gemini in the browser window if needed, then press Enter here to start… ")
        done = failed = 0
        try:
            for n, p in enumerate(todo, 1):
                page.goto(GEMINI_URL)
                box = find(page, "prompt_box", timeout=30)
                if not box:
                    sys.exit("Could not find the prompt box. Update SELECTORS['prompt_box'] for the current Gemini layout.")
                reason = blocked_text(page)
                if reason:
                    sys.exit(f"Stopped: the page says '{reason}'. Fix it in the browser, then run again.")
                before = set()
                imgs = find(page, "result_img")
                if imgs:
                    before = {imgs.nth(i).evaluate("e => e.currentSrc || e.src") for i in range(imgs.count())}
                box.first.click()
                page.keyboard.insert_text("Create an image: " + p["prompt"])
                page.keyboard.press("Enter")
                got, end = None, time.time() + args.timeout
                while time.time() < end:
                    got = big_image_src(page, before)
                    if got:
                        page.wait_for_timeout(1500)  # let it finish rendering
                        got = big_image_src(page, before) or got
                        break
                    reason = blocked_text(page)
                    if reason:
                        sys.exit(f"Stopped after {done} images: the page says '{reason}'. Run again later.")
                    page.wait_for_timeout(1500)
                if not got:
                    failed += 1
                    print(f"[{n}/{len(todo)}] {p['id']}: no image appeared in {args.timeout}s, skipped")
                    continue
                data = to_jpeg(fetch_bytes(page, got[0]))
                (out / f"{p['id']}.jpg").write_bytes(data)
                have.add(p["id"])
                idx_path.write_text(json.dumps(sorted(have)))
                done += 1
                print(f"[{n}/{len(todo)}] {p['id']}: saved ({len(data) // 1024} KB)")
                page.wait_for_timeout(int(1000 * random.uniform(args.pause * 0.5, args.pause * 1.5)))
        except KeyboardInterrupt:
            print("Stopped by you.")
        finally:
            print(f"Done: {done} saved, {failed} skipped. Run again to continue.")
            ctx.close()


if __name__ == "__main__":
    main()
