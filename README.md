# Obsidian - WhatsApp Chat Viewer

![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)

Obsidian is a privacy-first WhatsApp export viewer.
It parses exported `.txt` files (or `.zip` files that contain a `.txt`) directly in your browser and renders a WhatsApp-like chat UI with search and analytics.

## Privacy

- All parsing is local in the browser.
- No server upload is required.
- Your chat file never leaves your machine unless you choose to host/modify the app yourself.

## Current Features

- Import WhatsApp exports from `.txt` and `.zip`.
- Robust line parser with multiline message continuation support.
- Message list rendering with grouped bubbles and date separators.
- Real-time message search with highlight and up/down navigation.
- Jump-to-date action from the header menu.
- Analytics drawer for total message count, media-omitted count, and sender distribution.
- Dark/light theme toggle.
- Responsive desktop/mobile layout.

## Limitations

- Media files are not rendered inline from export text.
- Missing attachments are shown as `[Media omitted]`.
- Date-jump accuracy depends on date markers and locale format in the export.
- Voice note/audio playback is not implemented.

## Quick Start

1. Export a chat from WhatsApp.
2. Choose `Without Media` for faster parsing (recommended).
3. Open this project and load `index.html` in a browser.
4. Enter your display name exactly as it appears in the chat export.
5. Upload the `.txt` or `.zip` and click `Load Chat`.

## Local Development

This project has no build step.

Option A: open `index.html` directly.

Option B: serve statically (recommended for consistent browser behavior):

```bash
# Python 3
python -m http.server 8080
```

Then open `http://localhost:8080`.

## Tech Stack

- Vanilla JavaScript (ES6)
- CSS3
- [JSZip](https://stuk.github.io/jszip/) for `.zip` parsing
- [Phosphor Icons](https://phosphoricons.com/)

## Notes

- User-generated message content is HTML-escaped before rendering.
- External links are opened with `rel="noopener noreferrer"`.
- Search query regex is escaped to prevent invalid regex crashes.
- Menu interactions and date-jump fallbacks handle older browser behavior.

## Contributing

1. Fork the repository.
2. Create a branch: `git checkout -b feature/your-feature`.
3. Commit changes: `git commit -m "feat: add your feature"`.
4. Push branch and open a Pull Request.

## License

Distributed under the MIT License. See [LICENSE](LICENSE) for more information.

## Author

Paras Sharma

- Website: [parassharma.com](https://parassharma.com)
- GitHub: [@parassharma2306](https://github.com/ParasSharma2306)

## Live Demo

[obsidian.parassharma.in](https://obsidian.parassharma.in)

Note: This project is not affiliated with or endorsed by WhatsApp Inc.
