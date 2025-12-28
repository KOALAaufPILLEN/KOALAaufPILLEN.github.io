from playwright.sync_api import sync_playwright
import os

def verify_ui():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        cwd = os.getcwd()
        url = f"file://{cwd}/index.html"

        # 1. Mobile Portrait
        context_mobile = browser.new_context(
            viewport={"width": 390, "height": 844},
            is_mobile=True,
            has_touch=True
        )
        page_mobile = context_mobile.new_page()
        page_mobile.goto(url)

        # Close Greeting if present
        if page_mobile.locator("#greetBack").is_visible():
            page_mobile.click("#greetPlay")
            page_mobile.wait_for_selector("#greetBack", state="hidden")

        page_mobile.wait_for_selector("#board")

        # Force a toast via JS to verify position
        page_mobile.evaluate("toast('Test Toast', 'Mobile Position Check')")
        page_mobile.wait_for_timeout(500)

        page_mobile.screenshot(path="verification/mobile_portrait.png")
        print("Mobile screenshot saved.")

        # 2. Desktop
        context_desktop = browser.new_context(
            viewport={"width": 1920, "height": 1080}
        )
        page_desktop = context_desktop.new_page()
        page_desktop.goto(url)

        if page_desktop.locator("#greetBack").is_visible():
             page_desktop.click("#greetPlay")
             page_desktop.wait_for_selector("#greetBack", state="hidden")

        page_desktop.wait_for_selector("#board")

        # Trigger via JS to be safe
        page_desktop.evaluate("toast('Test Toast', 'Desktop Position Check')")
        page_desktop.wait_for_timeout(500)

        page_desktop.screenshot(path="verification/desktop.png")
        print("Desktop screenshot saved.")

        browser.close()

if __name__ == "__main__":
    verify_ui()
