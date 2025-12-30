
from playwright.sync_api import sync_playwright
import os

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        # Open the local file
        page.goto(f"file://{os.path.abspath('index.html')}")

        # Check if title exists
        print(f"Title: {page.title()}")

        # Wait for board to appear
        try:
            page.wait_for_selector("#board", state="visible", timeout=3000)
            print("Board found.")
        except:
            print("Board NOT found.")

        # Check for tiles
        tiles = page.locator(".tile").count()
        print(f"Tiles found: {tiles}")

        # Take screenshot
        page.screenshot(path="screenshot_check.png")

        browser.close()

if __name__ == "__main__":
    run()
