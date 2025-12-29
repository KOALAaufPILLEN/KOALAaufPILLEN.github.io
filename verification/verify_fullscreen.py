from playwright.sync_api import sync_playwright
import os

def verify_frontend():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1280, "height": 720})

        # Load the file locally (using /app since that's the CWD)
        page.goto("file:///app/index.html")

        # Wait for board to load
        page.wait_for_selector("#board")

        # Toggle Fullscreen (simulate by adding class)
        page.evaluate("document.body.classList.add('fs')")
        page.evaluate("layoutBoard()")

        # Check if .below is hidden
        is_hidden = page.evaluate("getComputedStyle(document.querySelector('.below')).display === 'none'")
        print(f"Sidebar hidden: {is_hidden}")

        if not is_hidden:
            print("FAILURE: Sidebar is visible in fullscreen!")

        # Take screenshot
        page.screenshot(path="/app/verification/fullscreen_layout.png")
        browser.close()

if __name__ == "__main__":
    verify_frontend()
