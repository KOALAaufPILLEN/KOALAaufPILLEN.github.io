from playwright.sync_api import sync_playwright
import os

def verify_gameplay():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        cwd = os.getcwd()
        url = f"file://{cwd}/index.html"

        def get_moves(page):
            return int(page.locator("#uiMoves").inner_text())

        page = browser.new_page()
        page.goto(url)
        if page.locator("#greetBack").is_visible():
            page.click("#greetPlay")

        page.wait_for_timeout(1000)

        initial_moves = get_moves(page)
        print(f"Initial Moves: {initial_moves}")

        # 1. Test Normal Drag Cost
        # Sanitize board
        page.evaluate("""
            for(let r=0; r<rows; r++) for(let c=0; c<cols; c++) grid[r][c] = makeTile(r,c,'normal:A');
            grid[5][5] = makeTile(5,5, 'normal:B');
            grid[5][6] = makeTile(5,6, 'normal:A');
            grid[5][7] = makeTile(5,7, 'normal:A');
            grid[5][8] = makeTile(5,8, 'normal:A');
            layoutBoard();
            ui.board.innerHTML = '';
            for(let r=0;r<rows;r++) for(let c=0;c<cols;c++) {
               if(grid[r][c]) {
                   const el = createTileEl(grid[r][c]);
                   tileEls.set(grid[r][c].id, el);
                   ui.board.appendChild(el);
               }
            }
        """)

        # Get start pos
        start_handle = page.evaluate_handle("tileEls.get(grid[5][5].id)")
        start_box = start_handle.bounding_box()
        start_x = start_box['x'] + start_box['width']/2
        start_y = start_box['y'] + start_box['height']/2
        cell_step = start_box['width'] + 8

        page.mouse.move(start_x, start_y)
        page.mouse.down()
        page.mouse.move(start_x + cell_step, start_y)
        page.wait_for_timeout(150)
        page.mouse.move(start_x + 2*cell_step, start_y)
        page.wait_for_timeout(150)
        page.mouse.move(start_x + 3*cell_step, start_y)
        page.wait_for_timeout(150)
        page.mouse.up()

        final_moves = get_moves(page)
        print(f"Final Moves (Normal): {final_moves}")
        assert final_moves == initial_moves - 3, f"Expected {initial_moves-3}, got {final_moves}"
        print("✅ Normal Drag Cost Verified")

        # 2. Test Mellow Drag
        page.reload()
        if page.locator("#greetBack").is_visible():
            page.click("#greetPlay")
        page.wait_for_timeout(1000)
        initial_moves = get_moves(page)

        # Sanitize
        page.evaluate("""
            for(let r=0; r<rows; r++) for(let c=0; c<cols; c++) grid[r][c] = makeTile(r,c,'normal:A');
            grid[5][5] = makeTile(5,5, 'mellow:P');
            grid[5][6] = makeTile(5,6, 'normal:A');
            layoutBoard();
            ui.board.innerHTML = '';
            for(let r=0;r<rows;r++) for(let c=0;c<cols;c++) {
               if(grid[r][c]) {
                   const el = createTileEl(grid[r][c]);
                   tileEls.set(grid[r][c].id, el);
                   ui.board.appendChild(el);
               }
            }
        """)

        start_handle = page.evaluate_handle("tileEls.get(grid[5][5].id)")
        start_box = start_handle.bounding_box()
        start_x = start_box['x'] + start_box['width']/2
        start_y = start_box['y'] + start_box['height']/2

        page.mouse.move(start_x, start_y)
        page.mouse.down()
        page.mouse.move(start_x + cell_step, start_y)
        page.wait_for_timeout(150)
        page.mouse.up()

        final_moves_mellow = get_moves(page)
        print(f"Final Moves (Mellow): {final_moves_mellow}")
        assert final_moves_mellow == initial_moves, f"Expected {initial_moves}, got {final_moves_mellow}"
        print("✅ Mellow Drag Cost Verified (Free)")

        # 3. Mellow Merge
        page.evaluate("""
            for(let r=0;r<rows;r++) for(let c=0;c<cols;c++) grid[r][c]=null;
            ui.board.innerHTML='';
            tileEls.clear();

            grid[0][0] = makeTile(0,0,'mellow:P');
            grid[0][1] = makeTile(0,1,'mellow:P');
            grid[1][0] = makeTile(1,0,'mellow:P');
            grid[1][1] = makeTile(1,1,'mellow:P');

            [grid[0][0],grid[0][1],grid[1][0],grid[1][1]].forEach(t=>{
               const el = createTileEl(t);
               tileEls.set(t.id,el);
               ui.board.appendChild(el);
            });
            layoutBoard();
            resolveAll();
        """)
        page.wait_for_timeout(1000)
        page.screenshot(path="verification/mellow_lord.png")
        if page.locator(".bigMellow").count() > 0:
            print("✅ Mellow Merge Verified")
        else:
            raise Exception("Mellow Merge Failed")

        # 4. FS UI
        page.evaluate("document.body.classList.add('fs')")
        page.wait_for_timeout(500)
        page.screenshot(path="verification/fullscreen_hud.png")

        browser.close()

if __name__ == "__main__":
    verify_gameplay()
