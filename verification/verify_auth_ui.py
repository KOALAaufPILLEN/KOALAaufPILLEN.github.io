from playwright.sync_api import sync_playwright
import os

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Load local file
        cwd = os.getcwd()
        page.goto(f"file://{cwd}/index.html")

        # Close Greeting First (it intercepts clicks)
        try:
             # Wait for greeting and click "Spielen" or "Anleitung"
             page.click("#greetPlay", timeout=5000)
             print("Greeting closed")
        except:
             print("No greeting found or failed to close")

        # Now click Menu button
        page.click("#btnMenu")

        # Wait for modal to appear
        page.wait_for_selector("#settingsBack", state="visible")

        # Take screenshot of the menu
        page.screenshot(path="verification/auth_ui.png")

        browser.close()

if __name__ == "__main__":
    run()
