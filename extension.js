const vscode = require('vscode');
const path = require('path');
const fs = require('fs');

// Try to load Twitter auth modules but don't fail if they're missing
let twitterAuth;
let twitterDebug;
try {
  twitterAuth = require('./auth/twitter');
} catch (error) {
  console.error('Failed to load Twitter auth module:', error.message);
}

try {
  twitterDebug = require('./twitter-debug');
} catch (error) {
  console.error('Failed to load Twitter debug module:', error.message);
}

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  // Show clear notification when extension activates
  vscode.window.showInformationMessage('Social Feed Sidebar activated! Click the icon in the sidebar.');
  console.log('Social Feed Sidebar is now active!');

  // Register the command to open the sidebar
  let disposable = vscode.commands.registerCommand('social-feed-sidebar.openSidebar', () => {
    SocialMediaPanel.createOrShow(context.extensionUri);
  });

  context.subscriptions.push(disposable);

  // Register a simple test command
  let testCommand = vscode.commands.registerCommand('social-feed-sidebar.showMessage', () => {
    vscode.window.showInformationMessage('Social Feed Sidebar Test Command Working!');
  });

  context.subscriptions.push(testCommand);

  // Register URI handler for OAuth callbacks
  const uriHandler = vscode.window.registerUriHandler({
    handleUri: async (uri) => {
      if (uri.path === '/auth/callback') {
        try {
          await twitterAuth.handleCallback(uri, context);
          vscode.window.showInformationMessage('Successfully logged in to Twitter!');
          
          // Notify the webview that authentication was successful
          if (SocialFeedViewProvider.currentProvider) {
            SocialFeedViewProvider.currentProvider.webview.postMessage({
              command: 'loginSuccess',
              service: 'x'
            });
          }
        } catch (error) {
          vscode.window.showErrorMessage(`Twitter authentication failed: ${error.message}`);
        }
      }
    }
  });

  context.subscriptions.push(uriHandler);

  // Register view provider for social content
  const provider = new SocialFeedViewProvider(context.extensionUri, context);
  SocialFeedViewProvider.currentProvider = provider;
  
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      "social-feed-content",
      provider,
      {
        webviewOptions: {
          retainContextWhenHidden: true
        }
      }
    )
  );

  // Add this after the testCommand registration in the activate function
  let twitterLoginCommand = vscode.commands.registerCommand('social-feed-sidebar.testTwitterLogin', async () => {
    vscode.window.showInformationMessage('Testing Twitter login...');
    
    try {
      // Try the simplified debug version first
      if (twitterDebug) {
        const authUrl = await twitterDebug.testAuth(context);
        
        // Open browser for user to authenticate
        vscode.window.showInformationMessage('Opening browser for Twitter authentication (debug mode)');
        await vscode.env.openExternal(vscode.Uri.parse(authUrl.url));
        return;
      }
      
      // Fall back to regular version if debug isn't available
      if (!twitterAuth) {
        vscode.window.showErrorMessage('Twitter auth module not loaded properly. Please check extension logs.');
        return;
      }
      
      // Try to get an auth URL
      const authUrl = twitterAuth.getAuthUrl(context);
      
      // Open browser for user to authenticate
      vscode.window.showInformationMessage('Opening browser for Twitter authentication');
      await vscode.env.openExternal(vscode.Uri.parse(authUrl.url));
      
    } catch (error) {
      vscode.window.showErrorMessage(`Twitter login error: ${error.message}`);
      console.error('Twitter login error:', error);
    }
  });

  context.subscriptions.push(twitterLoginCommand);
}

/**
 * Webview View Provider for Social Media Feed
 */
class SocialFeedViewProvider {
  static currentProvider = undefined;

  constructor(extensionUri, context) {
    this.extensionUri = extensionUri;
    this.context = context;
  }

  resolveWebviewView(webviewView, context, token) {
    this.webview = webviewView.webview;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this.extensionUri]
    };

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

    // Handle messages from the webview
    webviewView.webview.onDidReceiveMessage(message => {
      switch (message.command) {
        case 'login':
          this._handleLogin(message.service);
          return;
        case 'logout':
          this._handleLogout(message.service);
          return;
        case 'loadFeed':
          this._loadFeed(message.service);
          return;
        case 'alert':
          vscode.window.showInformationMessage(message.text);
          return;
      }
    });
  }

  async _handleLogin(service) {
    if (service === 'x') {
      try {
        // Get auth URL from Twitter
        const authUrl = twitterAuth.getAuthUrl(this.context);
        
        // Open browser for user to authenticate
        vscode.env.openExternal(vscode.Uri.parse(authUrl.url));
        
        vscode.window.showInformationMessage('Please complete authentication in your browser');
      } catch (error) {
        vscode.window.showErrorMessage(`Failed to start Twitter authentication: ${error.message}`);
      }
    } else {
      // For other services, keep the mock implementation for now
      this.webview.postMessage({
        command: 'loginSuccess',
        service: service
      });
      
      vscode.window.showInformationMessage(`Successfully logged into ${service}`);
    }
  }

  async _handleLogout(service) {
    if (service === 'x') {
      try {
        // Remove stored credentials
        await twitterAuth.deleteToken();
        
        this.webview.postMessage({
          command: 'logoutSuccess',
          service: service
        });
        
        vscode.window.showInformationMessage(`Logged out of ${service}`);
      } catch (error) {
        vscode.window.showErrorMessage(`Error logging out: ${error.message}`);
      }
    } else {
      // For other services, keep the mock implementation
      this.webview.postMessage({
        command: 'logoutSuccess',
        service: service
      });
      
      vscode.window.showInformationMessage(`Logged out of ${service}`);
    }
  }

  async _loadFeed(service) {
    if (service === 'x') {
      try {
        // Check if user is authenticated
        const token = await twitterAuth.getToken();
        
        if (!token) {
          this.webview.postMessage({
            command: 'feedLoaded',
            service: service,
            data: [],
            error: 'Not authenticated'
          });
          return;
        }
        
        // Fetch tweets from Twitter
        const tweets = await twitterAuth.fetchTweets(20);
        
        this.webview.postMessage({
          command: 'feedLoaded',
          service: service,
          data: tweets
        });
      } catch (error) {
        vscode.window.showErrorMessage(`Error loading Twitter feed: ${error.message}`);
        
        this.webview.postMessage({
          command: 'feedLoaded',
          service: service,
          data: [],
          error: error.message
        });
      }
    } else {
      // For other services, use mock data
      const mockData = {
        instagram: [
          { id: 1, url: 'https://example.com/video1.mp4', thumbnail: 'https://example.com/thumb1.jpg', title: 'Instagram Reel 1' },
          { id: 2, url: 'https://example.com/video2.mp4', thumbnail: 'https://example.com/thumb2.jpg', title: 'Instagram Reel 2' }
        ],
        youtube: [
          { id: 'abc123', url: 'https://youtube.com/watch?v=abc123', thumbnail: 'https://example.com/yt1.jpg', title: 'YouTube Short 1' },
          { id: 'def456', url: 'https://youtube.com/watch?v=def456', thumbnail: 'https://example.com/yt2.jpg', title: 'YouTube Short 2' }
        ]
      };
      
      this.webview.postMessage({
        command: 'feedLoaded',
        service: service,
        data: mockData[service] || []
      });
    }
  }

  _getHtmlForWebview(webview) {
    // Get path to media files
    const scriptPath = webview.asWebviewUri(vscode.Uri.joinPath(this.extensionUri, 'media', 'main.js'));
    const stylePath = webview.asWebviewUri(vscode.Uri.joinPath(this.extensionUri, 'media', 'style.css'));

    // Create HTML for the webview
    return `<!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Social Media Feed</title>
      <link href="${stylePath}" rel="stylesheet">
    </head>
    <body>
      <div class="container">
        <div class="login-section">
          <h2>Connect Your Accounts</h2>
          <div class="social-buttons">
            <button id="instagram-login" class="social-button instagram">Instagram</button>
            <button id="youtube-login" class="social-button youtube">YouTube</button>
            <button id="x-login" class="social-button x">Connect X/Twitter</button>
          </div>
          <p class="login-instruction">👆 Click a button above to connect your account</p>
        </div>
        
        <div class="tabs">
          <button class="tab-button active" data-service="instagram">Instagram</button>
          <button class="tab-button" data-service="youtube">YouTube</button>
          <button class="tab-button" data-service="x">X</button>
        </div>
        
        <div class="content">
          <div id="feed-container" class="feed-container">
            <!-- Feed content will be populated here -->
            <div class="loading-text">Connect an account to view your feed</div>
          </div>
          
          <div class="controls">
            <label>
              <input type="checkbox" id="auto-scroll" checked>
              Auto-scroll
            </label>
            <div class="speed-control">
              <span>Speed:</span>
              <input type="range" id="scroll-speed" min="1" max="10" value="5">
            </div>
          </div>
        </div>
      </div>
      <script src="${scriptPath}"></script>
    </body>
    </html>`;
  }
}

/**
 * Full Panel Implementation for future enhancements
 */
class SocialMediaPanel {
  static currentPanel = undefined;
  static viewType = "socialMediaView";

  static createOrShow(extensionUri) {
    const column = vscode.window.activeTextEditor
      ? vscode.window.activeTextEditor.viewColumn
      : undefined;

    // If we already have a panel, show it
    if (SocialMediaPanel.currentPanel) {
      SocialMediaPanel.currentPanel._panel.reveal(column);
      return;
    }

    // Otherwise, create a new panel
    const panel = vscode.window.createWebviewPanel(
      SocialMediaPanel.viewType,
      "Social Media Feed",
      column || vscode.ViewColumn.One,
      {
        enableScripts: true,
        localResourceRoots: [extensionUri]
      }
    );

    SocialMediaPanel.currentPanel = new SocialMediaPanel(panel, extensionUri);
  }

  constructor(panel, extensionUri) {
    this._panel = panel;
    this._extensionUri = extensionUri;
    this._disposables = [];

    // Set the webview's initial html content
    this._update();

    // Listen for when the panel is disposed
    // This happens when the user closes the panel or when the panel is closed programmatically
    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

    // Handle messages from the webview
    this._panel.webview.onDidReceiveMessage(
      message => {
        switch (message.command) {
          case 'alert':
            vscode.window.showInformationMessage(message.text);
            return;
        }
      },
      null,
      this._disposables
    );
  }

  dispose() {
    SocialMediaPanel.currentPanel = undefined;

    // Clean up our resources
    this._panel.dispose();

    while (this._disposables.length) {
      const x = this._disposables.pop();
      if (x) {
        x.dispose();
      }
    }
  }

  _update() {
    const webview = this._panel.webview;
    this._panel.webview.html = this._getHtmlForWebview(webview);
  }

  _getHtmlForWebview(webview) {
    // Similar to the one in SocialFeedViewProvider
    const scriptPath = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'main.js'));
    const stylePath = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'style.css'));

    return `<!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Social Media Feed</title>
      <link href="${stylePath}" rel="stylesheet">
    </head>
    <body>
      <div class="container">
        <h1>Social Media Feed</h1>
        <p>This is a panel view of the social media feed. Use the sidebar for a more compact experience.</p>
      </div>
      <script src="${scriptPath}"></script>
    </body>
    </html>`;
  }
}

function deactivate() {}

module.exports = {
  activate,
  deactivate
}; 