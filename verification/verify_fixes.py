from playwright.sync_api import sync_playwright
import os

def verify_fixes():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Use a mobile-like viewport for height constraints check
        page = browser.new_page(viewport={"width": 390, "height": 844})

        page.goto("file:///app/index.html")
        page.wait_for_selector("#board")

        # 1. Verify Dark Overlay Exists
        overlay = page.locator("#darkOverlay")
        print(f"Overlay exists: {overlay.count() > 0}")

        # 2. Verify Fullscreen Scaling (Height constraint)
        page.evaluate("document.body.classList.add('fs')")
        page.evaluate("layoutBoard()")

        # Get board size
        board_box = page.locator("#board").bounding_box()
        wrap_box = page.locator("#boardWrap").bounding_box()

        print(f"Board Height: {board_box['height']}, Wrap Height: {wrap_box['height']}")

        # Board should fit within wrap (minus padding)
        if board_box['height'] > wrap_box['height']:
            print("WARNING: Board might be overflowing vertically!")
        else:
            print("Board fits vertically.")

        page.screenshot(path="/app/verification/fixes_verification.png")
        browser.close()

if __name__ == "__main__":
    verify_fixes()
