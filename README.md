# Social Feed Sidebar for VS Code

A VS Code extension that lets you browse Instagram reels, YouTube shorts, and X (Twitter) feeds while coding. Stay connected to social media without leaving your coding environment!

![Social Feed Sidebar Screenshot](docs/screenshot.png)

## Features

- **Vertical sidebar** for browsing social media content
- **Support for multiple platforms**:
  - Instagram reels
  - YouTube shorts
  - X (Twitter) feeds
- **Auto-scrolling** with adjustable speed control
- **Login functionality** to connect to your social accounts
- **Cross-platform support** for Windows, Mac, and Linux

## Installation

### From VS Code Marketplace

1. Open VS Code
2. Go to Extensions (Ctrl+Shift+X)
3. Search for "Social Feed Sidebar"
4. Click Install

### From VSIX file

1. Download the .vsix file from the releases
2. Open VS Code
3. Go to Extensions (Ctrl+Shift+X)
4. Click on "..." at the top of the Extensions panel
5. Select "Install from VSIX..."
6. Choose the downloaded file

## Usage

1. Click on the Social Feed icon in the activity bar (side panel with icons)
2. Connect your social media accounts
3. Browse content from Instagram, YouTube, or X
4. Toggle auto-scroll and adjust speed as needed

## Twitter/X Integration

This extension includes special integration with Twitter's API. See [TWITTER_SETUP.md](TWITTER_SETUP.md) for setup instructions.

## Development

### Prerequisites

- Node.js and npm
- VS Code
- Git

### Setup

```bash
# Clone the repository
git clone https://github.com/your-username/vscode-social-feed-sidebar.git
cd vscode-social-feed-sidebar

# Install dependencies
npm install

# Open in VS Code
code .
```

### Running & Debugging

Press F5 in VS Code to launch a new window with the extension loaded.

### Building

```bash
npm run vscode:prepublish
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT

## Author

VibeCode Team 