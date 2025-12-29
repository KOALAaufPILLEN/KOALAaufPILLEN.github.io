from playwright.sync_api import sync_playwright
import os

def verify_logo():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1280, "height": 720})

        # Load the file locally
        page.goto("file:///app/index.html")

        # Wait for logo
        try:
            page.wait_for_selector("#mainLogo", timeout=5000)
            is_visible = page.is_visible("#mainLogo")
            print(f"Main Logo visible: {is_visible}")

            src = page.get_attribute("#mainLogo", "src")
            print(f"Main Logo src: {src}")

            if not is_visible or not src:
                print("FAILURE: Main Logo problem!")

        except Exception as e:
            print(f"FAILURE: {e}")

        # Take screenshot
        page.screenshot(path="/app/verification/logo_verification.png")
        browser.close()

if __name__ == "__main__":
    verify_logo()
