# Obsidian - WhatsApp Chat Viewer

![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)

**Obsidian** is a privacy-first, client-side tool to visualize WhatsApp chat exports. It transforms raw `.txt` and `.zip` files into a beautiful, searchable, and responsive interface that looks just like the real app—without your data ever leaving your device.

> **Privacy Notice:** This application runs entirely in your browser using the HTML5 FileReader API. No data is uploaded to any server.

## Features

- **Zero-Upload Privacy:** All processing happens client-side. Your chat logs stay on your device.
- **Format Support:** Drag & drop `.txt` files or `.zip` archives directly from WhatsApp.
- **Search Engine:** Real-time message search with highlighting and navigation.
- **Analytics Dashboard:** View message statistics, top senders, and activity breakdowns.
- **Themes:** Toggle between **Dark Mode** (default) and Light Mode.
- **Responsive Design:** Works seamlessly on Desktop, Tablet, and Mobile.

## Usage

### 1. Export your Chat
1. Open a chat in WhatsApp on your phone.
2. Tap the three dots (⋮) > **More** > **Export Chat**.
3. Select **"Without Media"** (recommended for speed) or "Include Media".
4. Save the `.zip` or `.txt` file to your computer.

### 2. Run the Viewer
Since this is a client-side app, you can run it instantly:

**Option A: Run Locally**
1. Clone the repository:
   ```bash
   git clone https://github.com/parassharma2306/obsidian.git
   ```
Simply open index.html in your web browser. (No Node.js or server required!)

**Option B: Host it yourself**
 You can upload these files to GitHub Pages, Netlify, or Vercel for a private, personal hosted version.

## Built With
Vanilla JavaScript (ES6) - Core logic and parsing.

CSS3 - Custom variables and glassmorphism UI.

JSZip - For handling .zip uploads.

Phosphor Icons - For the beautiful iconography.

## Contributing
Contributions are welcome! If you have ideas for features (like better media handling or voice note support), feel free to fork the repo and submit a Pull Request.

1. Fork the Project

2. Create your Feature Branch (git checkout -b feature/AmazingFeature)

3. Commit your Changes (git commit -m 'Add some AmazingFeature')

4. Push to the Branch (git push origin feature/AmazingFeature)

5. Open a Pull Request

## License
Distributed under the MIT License. See LICENSE for more information.

## Author
Paras Sharma

Website: [parassharma.com](https://parassharma.com)

GitHub: [@parassharma2306](https://github.com/ParasSharma2306)

## Live Demo

Try the app instantly in your browser

### [obsidian.parassharma.in](https://obsidian.parassharma.in)


**Note:** This project is not affiliated with or endorsed by WhatsApp Inc.