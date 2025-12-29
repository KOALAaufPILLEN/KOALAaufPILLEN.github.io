from playwright.sync_api import sync_playwright

def verify_ui_fixes():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1280, "height": 720})

        page.goto("file:///app/index.html")

        # Close Greeting
        if page.is_visible("#greetBack"):
            page.click("#greetPlay")
            page.wait_for_timeout(500)

        # Check Top Row Elements
        # Should have Zoom Slider and Diff Pills
        zoom = page.locator(".topRow #zoomSlider")
        diff = page.locator(".topRow #diffPills")

        print(f"TopRow Zoom Count: {zoom.count()}")
        print(f"TopRow Diff Count: {diff.count()}")

        if zoom.count() == 0 or diff.count() == 0:
            print("FAILURE: Zoom or Diff missing from Top Row")

        # Open Menu
        page.click("#btnMenu")
        page.wait_for_timeout(500)

        # Check Menu Luvvies
        menu_grid = page.locator("#menuLuvGrid .luvCard")
        count = menu_grid.count()
        print(f"Menu Luvvies Count: {count}")

        if count > 0:
            # Click first card
            menu_grid.first.click()
            page.wait_for_timeout(500)

            # Check Bio Visibility
            bio = page.locator("#infoBack")
            menu = page.locator("#settingsBack")

            bio_z = bio.evaluate("el => getComputedStyle(el).zIndex")
            menu_z = menu.evaluate("el => getComputedStyle(el).zIndex") # Modals usually have high z

            print(f"Bio Z-Index: {bio_z}")
            # print(f"Menu Z-Index: {menu_z}") # .modalBack has 99998

            if int(bio_z) > 99998:
                 print("SUCCESS: Bio is above Menu.")
            else:
                 print("FAILURE: Bio might be behind Menu.")

        page.screenshot(path="/app/verification/ui_fixes.png")
        browser.close()

if __name__ == "__main__":
    verify_ui_fixes()
