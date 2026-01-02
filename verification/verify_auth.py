
from playwright.sync_api import sync_playwright
import os
import time

def run():
    cwd = os.getcwd()
    file_url = f"file://{cwd}/index_test.html"

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto(file_url)

        # 1. Close the Greeting Modal first (it intercepts clicks)
        # Wait for greeting modal to be visible
        try:
            page.wait_for_selector("#greetPlay", timeout=5000)
            page.click("#greetPlay")
            time.sleep(1) # Wait for fade out
        except:
            print("Greeting modal not found or skipped")

        # 2. Now open Settings
        page.click("#btnMenu")
        page.wait_for_selector("#authSection")

        # 3. Screenshot
        page.screenshot(path="verification/auth_ui.png")
        browser.close()

if __name__ == "__main__":
    run()
