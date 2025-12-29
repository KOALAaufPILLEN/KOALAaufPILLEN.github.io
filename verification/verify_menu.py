from playwright.sync_api import sync_playwright

def verify_menu_and_overlay():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1280, "height": 720})
        page.on("console", lambda msg: print(f"Console: {msg.text}"))
        page.on("pageerror", lambda exc: print(f"Page Error: {exc}"))

        page.goto("file:///app/index.html")

        # Close Greeting if present
        if page.is_visible("#greetBack"):
            print("Closing Greeting...")
            page.click("#greetPlay")
            page.wait_for_timeout(500)

        # Check Menu Button
        btn = page.locator("#btnMenu")
        print(f"Btn Menu Visible: {btn.is_visible()}")
        btn.click()

        # Check Settings Modal
        page.wait_for_timeout(500)

        modal = page.locator("#settingsBack")
        display = modal.evaluate("el => getComputedStyle(el).display")
        print(f"Modal Display: {display}")

        if display == 'flex':
            print("SUCCESS: Menu opened.")
        else:
            print("FAILURE: Menu did not open.")

        # Check overlay
        ov = page.locator("#darkOverlay")
        print(f"Overlay Exists: {ov.count() > 0}")

        page.screenshot(path="/app/verification/menu_check.png")
        browser.close()

if __name__ == "__main__":
    verify_menu_and_overlay()
