
from playwright.sync_api import sync_playwright
import os

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Subscribe to console events
        page.on("console", lambda msg: print(f"CONSOLE: {msg.text}"))
        page.on("pageerror", lambda exc: print(f"PAGE ERROR: {exc}"))

        # Open the local file
        url = f"file://{os.path.abspath('index.html')}"
        print(f"Navigating to {url}")
        page.goto(url)

        # Check if title exists
        print(f"Title: {page.title()}")

        # Wait a bit for JS to execute
        page.wait_for_timeout(2000)

        # Check for tiles
        tiles = page.locator(".tile").count()
        print(f"Tiles found: {tiles}")

        # Take screenshot
        page.screenshot(path="debug_screenshot.png")

        browser.close()

if __name__ == "__main__":
    run()
