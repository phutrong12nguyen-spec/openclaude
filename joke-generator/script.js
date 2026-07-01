// ==================== STATE MANAGEMENT ====================
let currentJoke = null;
let currentFilter = 'all';
let favorites = JSON.parse(localStorage.getItem('jokeGenseFavorites')) || [];
let history = JSON.parse(localStorage.getItem('jokeGenHistory')) || [];
let stats = JSON.parse(localStorage.getItem('jokeGenStats')) || {
    viewed: 0,
    favorites: 0,
    shares: 0
};

// ==================== DOM ELEMENTS ====================
const getJokeBtn = document.getElementById('getJokeBtn');
const copyBtn = document.getElementById('copyBtn');
const shareBtn = document.getElementById('shareBtn');
const jokeContent = document.getElementById('jokeContent');
const jokeType = document.getElementById('jokeType');
const filterBtns = document.querySelectorAll('.filter-btn');
const jokesViewed = document.getElementById('jokesViewed');
const favoritesCount = document.getElementById('favoritesCount');
const sharesCount = document.getElementById('sharesCount');
const favoritesList = document.getElementById('favoritesList');
const historyList = document.getElementById('historyList');
const toast = document.getElementById('toast');

// ==================== INITIALIZE ====================
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

function initializeApp() {
    updateStats();
    renderFavorites();
    renderHistory();
    setupEventListeners();
    console.log('Joke Generator initialized!');
}

// ==================== EVENT LISTENERS ====================
function setupEventListeners() {
    getJokeBtn.addEventListener('click', fetchJoke);
    copyBtn.addEventListener('click', copyJoke);
    shareBtn.addEventListener('click', shareJoke);
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            filterBtns.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentFilter = e.target.dataset.filter;
            fetchJoke();
        });
    });
}

// ==================== FETCH JOKE ====================
async function fetchJoke() {
    getJokeBtn.disabled = true;
    jokeContent.innerHTML = '<p class="loading">Loading a joke...</p>';
    
    try {
        // Build API URL based on filter
        let apiUrl = 'https://v2.jokeapi.dev/joke/';
        
        if (currentFilter === 'all') {
            apiUrl += 'Any';
        } else if (currentFilter === 'general') {
            apiUrl += 'General';
        } else if (currentFilter === 'programming') {
            apiUrl += 'Programming';
        } else if (currentFilter === 'knock-knock') {
            apiUrl += 'Knock-Knock';
        }
        
        // Add parameters
        apiUrl += '?format=json&safe-mode';
        
        console.log('Fetching from:', apiUrl);
        
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Joke data:', data);
        
        if (data.error) {
            showToast('No joke found. Try another category!', 'warning');
            jokeContent.innerHTML = '<p class="loading">Try another category or filter!</p>';
            return;
        }
        
        currentJoke = data;
        displayJoke(data);
        addToHistory(data);
        updateStats('viewed');
        
    } catch (error) {
        console.error('Error fetching joke:', error);
        showToast('Error loading joke. Please try again!', 'error');
        jokeContent.innerHTML = '<p class="loading">Failed to load joke. Please try again.</p>';
    } finally {
        getJokeBtn.disabled = false;
    }
}

// ==================== DISPLAY JOKE ====================
function displayJoke(joke) {
    let jokeText = '';
    
    if (joke.type === 'single') {
        jokeText = joke.joke;
    } else if (joke.type === 'twopart') {
        jokeText = `${joke.setup}<br><br>${joke.delivery}`;
    }
    
    jokeContent.innerHTML = `<p>${jokeText}</p>`;
    jokeType.textContent = formatJokeType(joke.category);
    
    // Add animation
    jokeContent.style.animation = 'none';
    setTimeout(() => {
        jokeContent.style.animation = 'fadeIn 0.5s ease';
    }, 10);
}

function formatJokeType(type) {
    const typeMap = {
        'General': '😄 General',
        'Programming': '💻 Programming',
        'Knock-Knock': '🚪 Knock-Knock',
        'Any': '🎲 Any'
    };
    return typeMap[type] || type;
}

// ==================== COPY JOKE ====================
function copyJoke() {
    if (!currentJoke) {
        showToast('No joke to copy!', 'warning');
        return;
    }
    
    let jokeText = '';
    if (currentJoke.type === 'single') {
        jokeText = currentJoke.joke;
    } else if (currentJoke.type === 'twopart') {
        jokeText = `${currentJoke.setup}\n\n${currentJoke.delivery}`;
    }
    
    navigator.clipboard.writeText(jokeText).then(() => {
        showToast('✓ Joke copied to clipboard!', 'success');
        copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
        setTimeout(() => {
            copyBtn.innerHTML = '<i class="fas fa-copy"></i> Copy';
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy:', err);
        showToast('Failed to copy joke', 'error');
    });
}

// ==================== SHARE JOKE ====================
function shareJoke() {
    if (!currentJoke) {
        showToast('No joke to share!', 'warning');
        return;
    }
    
    let jokeText = '';
    if (currentJoke.type === 'single') {
        jokeText = currentJoke.joke;
    } else if (currentJoke.type === 'twopart') {
        jokeText = `${currentJoke.setup}\n${currentJoke.delivery}`;
    }
    
    const shareText = `Check out this joke: "${jokeText}" 😄`;
    
    // Check if Web Share API is available
    if (navigator.share) {
        navigator.share({
            title: 'Check out this joke!',
            text: jokeText
        }).then(() => {
            showToast('Joke shared successfully!', 'success');
            updateStats('shares');
        }).catch(err => console.error('Share failed:', err));
    } else {
        // Fallback: Copy to clipboard with share message
        navigator.clipboard.writeText(shareText).then(() => {
            showToast('Share text copied to clipboard!', 'success');
            updateStats('shares');
        }).catch(err => {
            showToast('Could not share joke', 'error');
        });
    }
}

// ==================== FAVORITES MANAGEMENT ====================
function toggleFavorite(joke) {
    const jokeId = getJokeId(joke);
    const index = favorites.findIndex(j => getJokeId(j) === jokeId);
    
    if (index > -1) {
        favorites.splice(index, 1);
        showToast('Removed from favorites', 'warning');
    } else {
        favorites.push(joke);
        showToast('Added to favorites! ❤️', 'success');
        updateStats('favorites');
    }
    
    localStorage.setItem('jokeGenseFavorites', JSON.stringify(favorites));
    renderFavorites();
    updateStats();
}

function getJokeId(joke) {
    return `${joke.category}-${joke.type}-${joke.joke || joke.setup}`;
}

function renderFavorites() {
    if (favorites.length === 0) {
        favoritesList.innerHTML = '<p class="empty-message">No favorites yet. Click the heart to save jokes!</p>';
        return;
    }
    
    favoritesList.innerHTML = favorites.map((joke, index) => {
        const jokeText = joke.type === 'single' 
            ? joke.joke 
            : `${joke.setup} - ${joke.delivery}`;
        
        return `
            <div class="favorite-item">
                <div class="favorite-item-content">
                    <p class="favorite-item-text">${jokeText}</p>
                </div>
                <div class="favorite-actions">
                    <button class="icon-btn" onclick="copyFavoriteJoke(${index})" title="Copy">
                        <i class="fas fa-copy"></i>
                    </button>
                    <button class="icon-btn active" onclick="removeFavorite(${index})" title="Remove">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function copyFavoriteJoke(index) {
    const joke = favorites[index];
    const jokeText = joke.type === 'single' 
        ? joke.joke 
        : `${joke.setup}\n\n${joke.delivery}`;
    
    navigator.clipboard.writeText(jokeText).then(() => {
        showToast('Favorite joke copied!', 'success');
    }).catch(() => {
        showToast('Failed to copy', 'error');
    });
}

function removeFavorite(index) {
    favorites.splice(index, 1);
    localStorage.setItem('jokeGenseFavorites', JSON.stringify(favorites));
    renderFavorites();
    updateStats();
    showToast('Removed from favorites', 'warning');
}

// ==================== HISTORY MANAGEMENT ====================
function addToHistory(joke) {
    const maxHistoryItems = 10;
    
    // Avoid duplicates at the top
    if (history.length > 0) {
        const lastJoke = history[0];
        if (getJokeId(lastJoke) === getJokeId(joke)) {
            return;
        }
    }
    
    history.unshift(joke);
    history = history.slice(0, maxHistoryItems);
    localStorage.setItem('jokeGenHistory', JSON.stringify(history));
    renderHistory();
}

function renderHistory() {
    if (history.length === 0) {
        historyList.innerHTML = '<p class="empty-message">No history yet.</p>';
        return;
    }
    
    historyList.innerHTML = history.map((joke, index) => {
        const jokeText = joke.type === 'single' 
            ? joke.joke 
            : `${joke.setup} - ${joke.delivery}`;
        
        return `
            <div class="history-item">
                <div class="history-item-content">
                    <p class="history-item-text">${jokeText}</p>
                </div>
                <div class="favorite-actions">
                    <button class="icon-btn ${isFavorited(joke) ? 'active' : ''}" 
                            onclick="toggleHistoryFavorite(${index})" title="Add to favorites">
                        <i class="fas fa-heart"></i>
                    </button>
                    <button class="icon-btn" onclick="copyHistoryJoke(${index})" title="Copy">
                        <i class="fas fa-copy"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function isFavorited(joke) {
    return favorites.some(j => getJokeId(j) === getJokeId(joke));
}

function toggleHistoryFavorite(index) {
    toggleFavorite(history[index]);
    renderHistory();
}

function copyHistoryJoke(index) {
    const joke = history[index];
    const jokeText = joke.type === 'single' 
        ? joke.joke 
        : `${joke.setup}\n\n${joke.delivery}`;
    
    navigator.clipboard.writeText(jokeText).then(() => {
        showToast('Joke copied!', 'success');
    }).catch(() => {
        showToast('Failed to copy', 'error');
    });
}

// ==================== STATISTICS ====================
function updateStats(action = null) {
    if (action === 'viewed') {
        stats.viewed++;
    } else if (action === 'favorites') {
        stats.favorites++;
    } else if (action === 'shares') {
        stats.shares++;
    }
    
    localStorage.setItem('jokeGenStats', JSON.stringify(stats));
    renderStats();
}

function renderStats() {
    jokesViewed.textContent = stats.viewed;
    favoritesCount.textContent = favorites.length;
    sharesCount.textContent = stats.shares;
}

// ==================== TOAST NOTIFICATIONS ====================
function showToast(message, type = 'info') {
    toast.textContent = message;
    toast.className = `toast show ${type}`;
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// ==================== KEYBOARD SHORTCUTS ====================
document.addEventListener('keydown', (e) => {
    // Press 'J' to get a joke
    if (e.key === 'j' || e.key === 'J') {
        if (!getJokeBtn.disabled) {
            fetchJoke();
        }
    }
    
    // Press 'C' to copy
    if ((e.ctrlKey || e.metaKey) && (e.key === 'b' || e.key === 'B')) {
        e.preventDefault();
        if (currentJoke) {
            copyJoke();
        }
    }
});

// ==================== INITIALIZE ON LOAD ====================
console.log('Joke Generator script loaded!');