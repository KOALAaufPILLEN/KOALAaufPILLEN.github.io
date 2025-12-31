
from playwright.sync_api import sync_playwright
import os

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        # Load local index.html
        path = os.path.abspath("index.html")
        page.goto(f"file://{path}")

        # Click Play to enter game
        page.click("#greetPlay")

        # Wait for board
        page.wait_for_selector("#board")

        # Take screenshot of game running
        page.screenshot(path="verification/game_running.png")
        browser.close()

if __name__ == "__main__":
    run()
