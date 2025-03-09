const vscode = require('vscode');
// Wrapped in try-catch to provide better error messages if modules are missing
try {
  const { TwitterApi } = require('twitter-api-v2');
  const keytar = require('keytar');
  const crypto = require('crypto');
  const { URI } = require('vscode-uri');
} catch (error) {
  console.error('Failed to load modules for Twitter integration:', error.message);
  // We'll handle this gracefully in the code
}

// Replace these with your Twitter Developer credentials
const TWITTER_CLIENT_ID = 'tEX4ZJ5ImyqjinLOUoBZpt7d7';
const TWITTER_CLIENT_SECRET = 'iSjzlzDm3MGd8iRTju7uJ8Ba5c7tcaLwkDA50MSaQq3QbGbBnO';
const TWITTER_CALLBACK_URL = 'vscode://social-feed-sidebar/auth/callback';

// Service name for keytar
const SERVICE_NAME = 'vscode-social-feed-twitter';

// Generate a random state for OAuth security
function generateState() {
  return crypto.randomBytes(16).toString('hex');
}

// Store token in secure storage
async function storeToken(token) {
  await keytar.setPassword(SERVICE_NAME, 'twitter_token', JSON.stringify(token));
}

// Get token from secure storage
async function getToken() {
  const tokenStr = await keytar.getPassword(SERVICE_NAME, 'twitter_token');
  return tokenStr ? JSON.parse(tokenStr) : null;
}

// Delete token from secure storage
async function deleteToken() {
  return await keytar.deletePassword(SERVICE_NAME, 'twitter_token');
}

// Create a client for Twitter API
function createClient(token) {
  return new TwitterApi(token);
}

// Get user authentication URL
function getAuthUrl(context) {
  const client = new TwitterApi({
    clientId: TWITTER_CLIENT_ID,
    clientSecret: TWITTER_CLIENT_SECRET
  });
  
  const state = generateState();
  
  // Store state for verification
  context.globalState.update('twitter_auth_state', state);
  
  return client.generateOAuth2AuthLink(TWITTER_CALLBACK_URL, {
    scope: ['tweet.read', 'users.read', 'offline.access'],
    state
  });
}

// Handle auth callback
async function handleCallback(uri, context) {
  const query = new URLSearchParams(uri.query);
  const code = query.get('code');
  const state = query.get('state');
  
  // Verify state to prevent CSRF attacks
  const savedState = context.globalState.get('twitter_auth_state');
  if (state !== savedState) {
    throw new Error('Invalid state parameter');
  }
  
  const client = new TwitterApi({
    clientId: TWITTER_CLIENT_ID,
    clientSecret: TWITTER_CLIENT_SECRET
  });
  
  const { accessToken, refreshToken } = await client.loginWithOAuth2({
    code,
    redirectUri: TWITTER_CALLBACK_URL,
    codeVerifier: context.globalState.get('twitter_code_verifier'),
  });
  
  // Store tokens
  await storeToken({ accessToken, refreshToken });
  
  return client.readWrite;
}

// Fetch tweets from timeline
async function fetchTweets(count = 10) {
  const token = await getToken();
  if (!token) {
    throw new Error('Not authenticated');
  }
  
  const client = createClient(token.accessToken);
  const timeline = await client.v2.homeTimeline({
    max_results: count,
    'tweet.fields': ['created_at', 'public_metrics', 'text'],
    expansions: ['author_id'],
    'user.fields': ['profile_image_url', 'username', 'name']
  });
  
  // Format tweets for the UI
  return timeline.data.data.map(tweet => {
    const user = timeline.data.includes.users.find(user => user.id === tweet.author_id);
    return {
      id: tweet.id,
      text: tweet.text,
      likes: tweet.public_metrics.like_count,
      retweets: tweet.public_metrics.retweet_count,
      created_at: tweet.created_at,
      url: `https://twitter.com/${user.username}/status/${tweet.id}`,
      author: {
        name: user.name,
        username: user.username,
        profile_image_url: user.profile_image_url
      }
    };
  });
}

module.exports = {
  getAuthUrl,
  handleCallback,
  getToken,
  deleteToken,
  fetchTweets
}; 