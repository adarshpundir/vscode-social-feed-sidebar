// Get VS Code API instance
// @ts-ignore
const vscode = acquireVsCodeApi();

// Track login states
const loginState = {
  instagram: false,
  youtube: false,
  x: false
};

// Store current feed data
let currentFeedData = {
  instagram: [],
  youtube: [],
  x: []
};

// Current active service
let currentService = 'instagram';

// Auto-scroll settings
let isAutoScrolling = false;
let autoScrollInterval = null;
let scrollSpeed = 5;
const scrollSpeedFactor = 0.5; // Lower = slower

// DOM elements
const elements = {
  loginButtons: {},
  tabButtons: {},
  feedContainer: null,
  autoScrollCheckbox: null,
  scrollSpeedInput: null
};

// Initialize the UI
function init() {
  // Capture DOM elements
  elements.loginButtons = {
    instagram: document.getElementById('instagram-login'),
    youtube: document.getElementById('youtube-login'),
    x: document.getElementById('x-login')
  };
  
  elements.tabButtons = Array.from(document.querySelectorAll('.tab-button'));
  elements.feedContainer = document.getElementById('feed-container');
  elements.autoScrollCheckbox = document.getElementById('auto-scroll');
  elements.scrollSpeedInput = document.getElementById('scroll-speed');
  
  // Set up click event listeners for login buttons
  for (const service in elements.loginButtons) {
    elements.loginButtons[service].addEventListener('click', () => {
      if (loginState[service]) {
        // Logout
        vscode.postMessage({
          command: 'logout',
          service: service
        });
      } else {
        // Login
        vscode.postMessage({
          command: 'login',
          service: service
        });
      }
    });
  }
  
  // Set up click event listeners for tab buttons
  elements.tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      const service = button.getAttribute('data-service');
      switchTab(service);
    });
  });
  
  // Set up auto-scroll checkbox
  elements.autoScrollCheckbox.addEventListener('change', () => {
    if (elements.autoScrollCheckbox.checked) {
      startAutoScroll();
    } else {
      stopAutoScroll();
    }
  });
  
  // Set up scroll speed input
  elements.scrollSpeedInput.addEventListener('input', () => {
    scrollSpeed = parseInt(elements.scrollSpeedInput.value);
    if (isAutoScrolling) {
      restartAutoScroll();
    }
  });
  
  // Initial tab loading
  switchTab('instagram');
}

// Handle messages from the extension
window.addEventListener('message', event => {
  const message = event.data;
  
  switch (message.command) {
    case 'loginSuccess':
      handleLoginSuccess(message.service);
      break;
    case 'logoutSuccess':
      handleLogoutSuccess(message.service);
      break;
    case 'feedLoaded':
      handleFeedLoaded(message.service, message.data);
      break;
  }
});

// Handle successful login
function handleLoginSuccess(service) {
  loginState[service] = true;
  updateLoginButton(service);
  
  // Load feed for the service
  vscode.postMessage({
    command: 'loadFeed',
    service: service
  });
  
  // Switch to the tab
  switchTab(service);
}

// Handle successful logout
function handleLogoutSuccess(service) {
  loginState[service] = false;
  updateLoginButton(service);
  
  // Clear feed data
  currentFeedData[service] = [];
  
  // If current tab is the logged out service, refresh view
  if (currentService === service) {
    renderFeed();
  }
}

// Update login button appearance
function updateLoginButton(service) {
  const button = elements.loginButtons[service];
  
  if (loginState[service]) {
    button.textContent = `Disconnect ${capitalizeFirstLetter(service)}`;
    button.classList.add('logged-in');
  } else {
    button.textContent = capitalizeFirstLetter(service);
    button.classList.remove('logged-in');
  }
}

// Handle feed data loading
function handleFeedLoaded(service, data) {
  currentFeedData[service] = data;
  
  // If current tab is the updated service, refresh view
  if (currentService === service) {
    renderFeed();
  }
}

// Switch between tabs
function switchTab(service) {
  currentService = service;
  
  // Update tab button styles
  elements.tabButtons.forEach(button => {
    if (button.getAttribute('data-service') === service) {
      button.classList.add('active');
    } else {
      button.classList.remove('active');
    }
  });
  
  // Render feed for selected service
  renderFeed();
  
  // If not logged in to this service, try to load feed anyway
  // (This will show login prompt if needed)
  if (!loginState[service] && currentFeedData[service].length === 0) {
    vscode.postMessage({
      command: 'loadFeed',
      service: service
    });
  }
  
  // Reset auto-scroll when switching tabs
  if (isAutoScrolling) {
    restartAutoScroll();
  }
}

// Render feed based on current service
function renderFeed() {
  const feedContainer = elements.feedContainer;
  feedContainer.innerHTML = '';
  
  const items = currentFeedData[currentService];
  
  if (!loginState[currentService]) {
    feedContainer.innerHTML = `
      <div class="loading-text">
        Connect your ${capitalizeFirstLetter(currentService)} account to view your feed
      </div>
    `;
    return;
  }
  
  if (!items || items.length === 0) {
    feedContainer.innerHTML = `<div class="loading-text">Loading ${capitalizeFirstLetter(currentService)} feed...</div>`;
    return;
  }
  
  // Render different content based on service type
  switch (currentService) {
    case 'instagram':
    case 'youtube':
      renderVideoFeed(items);
      break;
    case 'x':
      renderTweetFeed(items);
      break;
  }
}

// Render video feed (Instagram/YouTube)
function renderVideoFeed(items) {
  const feedContainer = elements.feedContainer;
  
  items.forEach(item => {
    const itemElement = document.createElement('div');
    itemElement.className = 'feed-item';
    
    itemElement.innerHTML = `
      <div class="video-item">
        <img src="${item.thumbnail}" alt="${item.title}">
        <div class="play-button"></div>
      </div>
      <div class="video-info">
        <h3>${item.title}</h3>
      </div>
    `;
    
    // Add click event to redirect to video
    itemElement.addEventListener('click', () => {
      vscode.postMessage({
        command: 'alert',
        text: `Opening ${currentService} video in browser...`
      });
      
      // In a real extension, this would open the video in a browser
      // window.open(item.url, '_blank');
    });
    
    feedContainer.appendChild(itemElement);
  });
}

// Render tweet feed (X)
function renderTweetFeed(items) {
  const feedContainer = elements.feedContainer;
  
  if (!items || items.length === 0) {
    feedContainer.innerHTML = `<div class="loading-text">No tweets available. Try refreshing.</div>`;
    return;
  }
  
  items.forEach(item => {
    const itemElement = document.createElement('div');
    itemElement.className = 'feed-item tweet-item';
    
    // Check if we have the new Twitter API format
    if (item.author) {
      // New Twitter API format
      itemElement.innerHTML = `
        <div class="tweet-header">
          <img src="${item.author.profile_image_url}" class="tweet-avatar" alt="${item.author.name}">
          <div class="tweet-author">
            <div class="tweet-name">${item.author.name}</div>
            <div class="tweet-username">@${item.author.username}</div>
          </div>
        </div>
        <p class="tweet-text">${formatTweetText(item.text)}</p>
        <div class="tweet-info">
          ${item.likes} likes · ${item.retweets} retweets
        </div>
      `;
    } else {
      // Old mock format
      itemElement.innerHTML = `
        <p class="tweet-text">${formatTweetText(item.text)}</p>
        <div class="tweet-info">
          ${item.likes} likes
        </div>
      `;
    }
    
    // Add click event to redirect to tweet
    itemElement.addEventListener('click', () => {
      vscode.postMessage({
        command: 'alert',
        text: 'Opening X post in browser...'
      });
      
      // In a real extension, this would open the tweet in a browser
      // window.open(item.url, '_blank');
    });
    
    feedContainer.appendChild(itemElement);
  });
}

// Format tweet text (add links for hashtags, etc.)
function formatTweetText(text) {
  // Convert hashtags to links
  return text.replace(/#(\w+)/g, '<span style="color: var(--vscode-textLink-foreground);">#$1</span>');
}

// Start auto-scrolling
function startAutoScroll() {
  isAutoScrolling = true;
  
  if (autoScrollInterval) {
    clearInterval(autoScrollInterval);
  }
  
  autoScrollInterval = setInterval(() => {
    const container = elements.feedContainer;
    container.scrollTop += scrollSpeed * scrollSpeedFactor;
    
    // If we've scrolled to the bottom, go back to top
    if (container.scrollTop + container.clientHeight >= container.scrollHeight) {
      container.scrollTop = 0;
    }
  }, 30);
}

// Stop auto-scrolling
function stopAutoScroll() {
  isAutoScrolling = false;
  
  if (autoScrollInterval) {
    clearInterval(autoScrollInterval);
    autoScrollInterval = null;
  }
}

// Restart auto-scroll (used when changing speed or tabs)
function restartAutoScroll() {
  stopAutoScroll();
  startAutoScroll();
}

// Helper function to capitalize first letter
function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', init);

// Start auto-scroll if checkbox is checked
if (elements.autoScrollCheckbox && elements.autoScrollCheckbox.checked) {
  startAutoScroll();
} 