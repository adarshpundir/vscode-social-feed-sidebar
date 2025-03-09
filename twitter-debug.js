/**
 * Simplified Twitter Authentication Debug Module
 * 
 * This is a minimal version that doesn't require external dependencies
 * for debugging and demonstration purposes only.
 * 
 * IMPORTANT SETUP:
 * 1. Go to https://developer.twitter.com/en/portal/dashboard
 * 2. Create or use an existing app
 * 3. Go to "Keys and tokens" tab
 * 4. Copy your API Key and API Secret
 * 5. Paste them below (replace YOUR_API_KEY_HERE and YOUR_API_SECRET_HERE)
 * 6. Make sure your app has a callback URL: vscode://social-feed-sidebar/auth/callback
 */
const vscode = require('vscode');

// Put your Twitter API credentials here
const TWITTER_CLIENT_ID = 'tEX4ZJ5ImyqjinLOUoBZpt7d7';
const TWITTER_CLIENT_SECRET = 'iSjzlzDm3MGd8iRTju7uJ8Ba5c7tcaLwkDA50MSaQq3QbGbBnO';

// Twitter OAuth 2.0 endpoints
const TWITTER_AUTH_URL = 'https://twitter.com/i/oauth2/authorize';
const TWITTER_CALLBACK_URL = 'vscode://social-feed-sidebar/auth/callback';

/**
 * Get a simplified authentication URL for Twitter
 * This doesn't require external libraries
 */
function getSimpleAuthUrl() {
  // Generate a random state to protect against CSRF
  const state = Math.random().toString(36).substring(2, 15);
  
  // Create a URL with required OAuth 2.0 parameters
  const url = new URL(TWITTER_AUTH_URL);
  url.searchParams.append('response_type', 'code');
  url.searchParams.append('client_id', TWITTER_CLIENT_ID);
  url.searchParams.append('redirect_uri', TWITTER_CALLBACK_URL);
  url.searchParams.append('scope', 'tweet.read users.read offline.access');
  url.searchParams.append('state', state);
  url.searchParams.append('code_challenge', 'challenge'); // Simplified
  url.searchParams.append('code_challenge_method', 'plain');
  
  return {
    url: url.toString(),
    state: state
  };
}

/**
 * Test the Twitter authentication setup
 */
async function testAuth(context) {
  try {
    console.log('Starting Twitter authentication test');
    
    if (!TWITTER_CLIENT_ID || TWITTER_CLIENT_ID === 'tEX4ZJ5ImyqjinLOUoBZpt7d7') {
      throw new Error('Twitter Client ID (API Key) not configured in twitter-debug.js');
    }
    
    const authUrl = getSimpleAuthUrl();
    console.log('Generated auth URL:', authUrl.url);
    
    // Store state for verification later
    context.globalState.update('twitter_auth_state', authUrl.state);
    
    return authUrl;
  } catch (error) {
    console.error('Twitter auth test error:', error);
    throw error;
  }
}

module.exports = {
  testAuth,
  getSimpleAuthUrl
}; 