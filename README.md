# Beyond the Job Title Bingo

A mobile-friendly, static bingo game based on the "Beyond the Job Title" activity card.

## Files

- `index.html` — game structure
- `css/style.css` — visual design and mobile layout
- `js/script.js` — bingo logic, QR modal, local saving and sharing

## Run locally

Open `index.html` in a browser, or use the Live Server extension in VS Code.

## Publish free with GitHub Pages

1. Create a public GitHub repository named `beyond-job-title-bingo`.
2. Push these files to the `main` branch.
3. In the repository, open **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Choose `main` and `/(root)`, then save.
6. GitHub will show the live public URL.

The QR function must be used after the site is published, because a phone cannot access a local `file://` path on your computer.

## Edit the statements

Open `js/script.js` and modify the `activities` list near the top. The game needs 24 activity statements plus the fixed middle free space to create a 5 × 5 Bingo board.
