# Windows 95 Homepage

A browser-based recreation of the Windows 95 desktop experience, built with plain HTML, CSS, and JavaScript — no frameworks or dependencies required.

## File Structure

```
web/
├── index.html       — Main page: desktop, windows, taskbar, start menu
├── style.css        — All styling: Win95 visual theme, layout, components
├── script.js        — All interactivity: windows, drag, start menu, minesweeper
└── media/
    ├── background.jpg   — Desktop wallpaper image
    └── button.jpg       — Custom Start button image
```

## Features

### Desktop
- Teal desktop background using `background.jpg` as wallpaper (`center/cover`)
- Clickable desktop icons arranged in a column along the left side
- Double-click any icon to open its corresponding window

### Windows
Each window is a `.win95-window` div with:
- **Title bar** — gradient blue bar with icon, title, and minimize/maximize/close buttons
- **Menu bar** — non-functional visual menu items (File, Edit, etc.)
- **Content area** — unique content per window
- **Status bar** — bottom info strip (where applicable)

Available windows:

| Window | ID | Description |
|---|---|---|
| My Computer | `win-mycomputer` | Shows drive and system icons |
| Notepad | `win-notepad` | Fully editable `<textarea>` |
| Recycle Bin | `win-recycle` | Empty bin message |
| Minesweeper | `win-minesweeper` | Playable game (see below) |
| Internet Explorer | `win-internet` | Static IE splash page with toolbar |

### Window Management (`script.js`)

**Opening** — `openWindow(name)` shows the window, creates a taskbar button, and brings it to front.

**Closing** — `closeWindow(id)` hides the window and removes its taskbar button.

**Minimizing** — `minimizeWindow(id)` hides the window but keeps its taskbar button.

**Maximizing** — `maximizeWindow(id)` toggles between full viewport size and the window's original position/size. Original dimensions are stored in `data-` attributes.

**Z-index / focus** — `bringToFront(id)` increments a global `zCounter` and assigns it to the window, ensuring the last-clicked window is always on top.

**Dragging** — `dragStart`, `dragMove`, `dragEnd` implement mouse-based dragging via `mousedown` on the title bar. Movement is clamped to the viewport so windows cannot be dragged off-screen.

### Taskbar
- Fixed to the bottom of the screen, 28px tall
- **Start button** — uses `button.jpg` as its image; toggles the start menu on click
- **Window buttons** — one button per open window; clicking minimizes/restores/focuses
- **Clock** — live time updated every second via `setInterval`

### Start Menu
- Opens above the taskbar when Start is clicked
- Left sidebar with "Windows 95" text rotated vertically
- Menu items with hover-triggered submenus (Programs, Documents, Settings)
- Clicking outside the menu closes it (document `mousedown` listener)
- **Shut Down** opens a modal dialog with three options:
  - *Shut down* — replaces the page with a "safe to turn off" screen
  - *Restart* — calls `location.reload()`
  - *MS-DOS mode* — replaces the page with a blinking DOS prompt

### Minesweeper (`script.js`)

A fully playable 9×9 game with 10 mines.

- **Safe first click** — mines are placed after the first click, guaranteeing the clicked cell and all its neighbours are mine-free
- **Flood fill** — clicking an empty cell (value 0) recursively reveals all connected empty cells and their numbered borders
- **Right-click flagging** — toggles a flag on unrevealed cells; mine counter updates accordingly
- **Timer** — starts on first click, stops on win or loss, capped at 999
- **Win detection** — triggers when the only unrevealed cells remaining are exactly the mines
- **Face button** — resets the game; shows 😵 on loss and 😎 on win

## Styling Approach (`style.css`)

The classic Win95 look is achieved without any images for UI chrome — purely CSS:

- **Raised/sunken borders** — two-tone `border-color` using `#fff` and `#808080` (`border-color: #fff #808080 #808080 #fff` = raised; reversed = sunken)
- **Title bar gradient** — `linear-gradient(to right, #000080, #1084d0)`
- **Desktop background** — `background.jpg` applied to `body` with `center/cover`
- **Scrollbars** — styled via `::-webkit-scrollbar` pseudo-elements to match the beveled Win95 look
- **Submenus** — hidden by default (`display:none`), revealed on parent hover via CSS

## Customisation

### Change the wallpaper
Replace `media/background.jpg` with any image file and update the filename in `style.css`:
```css
body {
  background: #008080 url('media/your-image.jpg') center/cover no-repeat;
}
```

### Change the Start button
Replace `media/button.jpg` with any image and update the `src` in `index.html`:
```html
<img src="media/your-button.jpg" alt="Start" style="height:18px;width:auto;display:block;">
```

### Add a new window
1. Add a desktop icon in `index.html` with `ondblclick="openWindow('mywindow')"`.
2. Add a `<div class="win95-window" id="win-mywindow" style="display:none;">` with the standard title bar, menu bar, and content structure.
3. Add an entry to the `windowTitles` object in `script.js`:
   ```js
   'win-mywindow': '🗂️ My Window Title',
   ```

## Browser Compatibility

Works in any modern browser (Chrome, Firefox, Edge, Safari). No build step, no server required — open `index.html` directly in a browser.
