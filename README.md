# Social Feed Sidebar for VS Code

A VS Code extension that lets you browse Instagram reels, YouTube shorts, and X (Twitter) feeds while coding. Stay connected to social media without leaving your coding environment!

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

## Login & Authentication

This extension uses secure authentication to connect to your social media accounts. Your credentials are never stored locally and the extension uses official APIs to access content.

## Privacy

This extension only fetches content from platforms you've explicitly connected. No data is collected or shared with third parties.

## Development

### Building from source

```bash
git clone https://github.com/your-username/social-feed-sidebar.git
cd social-feed-sidebar
npm install
```

### Testing the extension

Press F5 in VS Code to launch a new window with the extension loaded.

### Packaging the extension

```bash
npm install -g @vscode/vsce
vsce package
```

## Known Issues

- This is a demo version with simulated content
- API integration with social media platforms is not fully implemented

## Roadmap

- Add support for more social media platforms
- Implement proper API integration with Instagram, YouTube, and X
- Add options to filter content by keywords or hashtags
- Support for posting directly from VS Code

## License

MIT

## Author

VibeCode Team 