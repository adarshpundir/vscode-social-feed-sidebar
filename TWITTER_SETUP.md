# Twitter API Integration Setup

This guide explains how to set up Twitter (X) API credentials to use real Twitter data in the Social Feed Sidebar extension.

## Step 1: Create a Twitter Developer Account

1. Go to [Twitter Developer Portal](https://developer.twitter.com/en/portal/dashboard)
2. Sign in with your Twitter (X) account
3. Apply for developer access if you don't have it yet

## Step 2: Create a Project and App

1. In the Developer Portal, create a new Project
2. Create a new App within that Project
3. Set your App permissions to Read-only
4. Set the App type to Web App

## Step 3: Set up Authentication Settings

1. In your App settings, go to the "Authentication settings" section
2. Enable OAuth 2.0
3. Add the following redirect URL: `vscode://social-feed-sidebar/auth/callback`
4. Save your changes

## Step 4: Get Your API Keys

1. Go to the "Keys and tokens" section
2. Copy your:
   - Client ID
   - Client Secret

## Step 5: Update the Extension Code

1. Open `auth/twitter.js` in the extension code
2. Replace the placeholder credentials:

```javascript
// Replace these with your Twitter Developer credentials
const TWITTER_CLIENT_ID = 'YOUR_CLIENT_ID';
const TWITTER_CLIENT_SECRET = 'YOUR_CLIENT_SECRET';
```

## Step 6: Install Required Packages

Run the following command in your extension directory:

```bash
npm install twitter-api-v2 keytar vscode-uri oauth-1.0a crypto-js
```

## Notes

- The Twitter API has rate limits. For production use, you'll need to add rate limiting handling.
- Twitter API access may require a paid subscription depending on your usage level.
- Keep your API keys confidential and never commit them to public repositories. 