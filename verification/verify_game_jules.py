from playwright.sync_api import sync_playwright
import os

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        # Load local file
        url = "file://" + os.path.abspath("index_test-jules.html")
        print(f"Loading {url}")
        page.goto(url)

        # Wait for board to generate
        page.wait_for_selector("#board")
        page.wait_for_timeout(2000) # Wait for fade in / animation

        # Take screenshot of the game board area
        # We want to verify:
        # 1. Tiles have jelly backgrounds (tinted)
        # 2. Characters are inside
        # 3. Luvvies look correct (not broken)

        # Screenshot full page to catch toasts/overlays
        page.screenshot(path="verification/game_state.png", full_page=True)

        # Try to find a tile and click it to trigger "jelly" anim?
        # Hard to capture animation in static screenshot, but we can verify the DOM structure
        # Check if tiles have "background-image" set in style
        tile = page.locator(".tile").first
        style = tile.get_attribute("style") or ""
        # Check internal plate style for bg-image
        plate = tile.locator(".plate")
        plate_style = plate.get_attribute("style") or ""
        print(f"Tile Plate Style: {plate_style}")

        browser.close()

if __name__ == "__main__":
    run()
