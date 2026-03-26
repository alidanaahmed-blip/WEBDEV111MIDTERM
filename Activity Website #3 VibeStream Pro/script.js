// ============ AUTHENTICATION FUNCTIONS ============

// Toggle between login and signup forms
function toggleSignup(event) {
    event.preventDefault();
    const loginBox = document.getElementById('loginBox');
    const signupBox = document.getElementById('signupBox');
    
    if (loginBox && signupBox) {
        const isLoginHidden = loginBox.style.display === 'none';
        loginBox.style.display = isLoginHidden ? 'block' : 'none';
        signupBox.style.display = isLoginHidden ? 'none' : 'block';
        
        // Scroll to top of form
        const formContainer = document.querySelector('.form-container');
        if (formContainer) {
            formContainer.scrollIntoView({ behavior: 'smooth' });
        }
    }
}

// Handle Login
function handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    
    if (!email || !password) {
        alert('Please fill in all fields');
        return;
    }

    if (!email.includes('@')) {
        alert('Please enter a valid email');
        return;
    }

    if (password.length < 4) {
        alert('Password must be at least 4 characters');
        return;
    }

    // Store user session
    localStorage.setItem('userEmail', email);
    localStorage.setItem('isLoggedIn', 'true');
    
    // Hide login and show main content
    const loginContainer = document.getElementById('loginContainer');
    const mainContent = document.getElementById('mainContent');
    
    if (loginContainer && mainContent) {
        loginContainer.style.display = 'none';
        mainContent.style.display = 'block';
        
        // Reset navigation
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.classList.remove('active');
        });
        if (navLinks[0]) {
            navLinks[0].classList.add('active');
        }
    }
}

// Handle Sign Up
function handleSignup(event) {
    event.preventDefault();
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const password = document.getElementById('signupPassword').value.trim();
    const confirmPassword = document.getElementById('confirmPassword').value.trim();
    
    if (!name || !email || !password || !confirmPassword) {
        alert('Please fill in all fields');
        return;
    }

    if (!email.includes('@')) {
        alert('Please enter a valid email');
        return;
    }

    if (password.length < 6) {
        alert('Password must be at least 6 characters');
        return;
    }

    if (password !== confirmPassword) {
        alert('Passwords do not match');
        return;
    }

    // Store user data
    localStorage.setItem('userName', name);
    localStorage.setItem('userEmail', email);
    localStorage.setItem('isLoggedIn', 'true');
    
    // Hide login and show main content
    const loginContainer = document.getElementById('loginContainer');
    const mainContent = document.getElementById('mainContent');
    
    if (loginContainer && mainContent) {
        loginContainer.style.display = 'none';
        mainContent.style.display = 'block';
        
        // Reset navigation
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.classList.remove('active');
        });
        if (navLinks[0]) {
            navLinks[0].classList.add('active');
        }
    }
}

// Check if user is logged in on page load
function checkLogin() {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    
    const loginContainer = document.getElementById('loginContainer');
    const mainContent = document.getElementById('mainContent');
    
    // Check if we're on a page that has login/main content (home.html)
    if (loginContainer && mainContent) {
        if (isLoggedIn) {
            loginContainer.style.display = 'none';
            mainContent.style.display = 'block';
        } else {
            loginContainer.style.display = 'flex';
            mainContent.style.display = 'none';
        }
    } else {
        // On gallery, about, contact pages - redirect if not logged in
        if (!isLoggedIn) {
            window.location.href = 'home.html';
        }
    }
}

// Show Home
function showHome(event) {
    if (event) {
        event.preventDefault();
    }
    
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.classList.remove('active');
    });
    
    if (event && event.target) {
        event.target.classList.add('active');
    } else if (navLinks[0]) {
        navLinks[0].classList.add('active');
    }
    
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Logout function
function logout(event) {
    if (event) {
        event.preventDefault();
    }
    
    const confirmLogout = confirm('Are you sure you want to log out?');
    
    if (confirmLogout) {
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userName');
        localStorage.removeItem('isLoggedIn');
        
        const loginContainer = document.getElementById('loginContainer');
        const mainContent = document.getElementById('mainContent');
        
        // If on home.html, show login form
        if (loginContainer && mainContent) {
            mainContent.style.display = 'none';
            loginContainer.style.display = 'flex';
            
            // Reset forms
            const loginForm = document.getElementById('loginForm');
            const signupForm = document.getElementById('signupForm');
            
            if (loginForm) loginForm.reset();
            if (signupForm) signupForm.reset();
            
            // Show login form
            const loginBox = document.getElementById('loginBox');
            const signupBox = document.getElementById('signupBox');
            
            if (loginBox && signupBox) {
                loginBox.style.display = 'block';
                signupBox.style.display = 'none';
            }
        } else {
            // On other pages, redirect to home
            window.location.href = 'home.html';
        }
    }
}

// ============ GALLERY FUNCTIONS ============

let currentSongIndex = 0;
let allSongs = [];

// Play song function
function playSong(event) {
    event.preventDefault();
    
    const card = event.target.closest('.music-card');
    if (!card) return;
    
    const title = card.dataset.title;
    const artist = card.dataset.artist;
    const audioSrc = card.dataset.audio;
    const albumArt = card.dataset.album || (card.querySelector('img') ? card.querySelector('img').src : 'album1.jpg');
    
    if (!audioSrc) {
        alert('Audio file not available for this song');
        return;
    }

    const player = document.getElementById('audioPlayerElement');
    const playerTitle = document.getElementById('playerTitle');
    const playerArtist = document.getElementById('playerArtist');
    const playerAlbumArt = document.getElementById('playerAlbumArt');
    const audioPlayerDiv = document.getElementById('audioPlayer');
    
    if (player && playerTitle && playerArtist && playerAlbumArt && audioPlayerDiv) {
        player.src = audioSrc;
        playerTitle.textContent = title;
        playerArtist.textContent = artist;
        playerAlbumArt.src = albumArt;
        
        audioPlayerDiv.classList.add('active');
        
        player.play().catch(err => {
            console.error('Error playing audio:', err);
            alert('Error playing audio. Please check if the file exists.');
        });
        
        const allCards = document.querySelectorAll('.music-card');
        currentSongIndex = Array.from(allCards).indexOf(card);
        allSongs = Array.from(allCards);
    }
}

// Close player
function closePlayer() {
    const player = document.getElementById('audioPlayerElement');
    const audioPlayerDiv = document.getElementById('audioPlayer');
    
    if (player) {
        player.pause();
        player.currentTime = 0;
    }
    
    if (audioPlayerDiv) {
        audioPlayerDiv.classList.remove('active');
    }
}

// Next song
function nextSong() {
    const allCards = document.querySelectorAll('.music-card');
    const visibleCards = Array.from(allCards).filter(card => card.style.display !== 'none');
    
    if (visibleCards.length === 0) return;
    
    currentSongIndex = (currentSongIndex + 1) % visibleCards.length;
    
    const mockEvent = {
        target: {
            closest: () => visibleCards[currentSongIndex]
        },
        preventDefault: () => {}
    };
    
    playSong(mockEvent);
}

// Previous song
function previousSong() {
    const allCards = document.querySelectorAll('.music-card');
    const visibleCards = Array.from(allCards).filter(card => card.style.display !== 'none');
    
    if (visibleCards.length === 0) return;
    
    currentSongIndex = (currentSongIndex - 1 + visibleCards.length) % visibleCards.length;
    
    const mockEvent = {
        target: {
            closest: () => visibleCards[currentSongIndex]
        },
        preventDefault: () => {}
    };
    
    playSong(mockEvent);
}

// Filter gallery by genre
function filterGallery(genre) {
    const cards = document.querySelectorAll('.music-card');
    const buttons = document.querySelectorAll('.filter-btn');
    
    // Update active button
    buttons.forEach(btn => {
        btn.classList.remove('active');
    });
    
    if (event && event.target) {
        event.target.classList.add('active');
    }
    
    // Animate and filter cards
    cards.forEach((card, index) => {
        const cardGenre = card.getAttribute('data-genre');
        const shouldShow = genre === 'all' || cardGenre === genre;
        
        if (shouldShow) {
            card.style.display = 'block';
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'scale(1)';
            }, index * 50);
        } else {
            card.style.opacity = '0';
            card.style.transform = 'scale(0.9)';
            setTimeout(() => {
                card.style.display = 'none';
            }, 300);
        }
    });
}

// Initialize play buttons
function initializePlayButtons() {
    const playButtons = document.querySelectorAll('.play-btn');
    playButtons.forEach(btn => {
        btn.addEventListener('click', playSong);
    });
}

// ============ CONTACT FUNCTIONS ============

// Handle Contact Form
function handleContact(event) {
    event.preventDefault();
    const name = document.getElementById('contactName').value.trim();
    const email = document.getElementById('contactEmail').value.trim();
    const subject = document.getElementById('subject').value.trim();
    const message = document.getElementById('message').value.trim();
    
    if (!name || !email || !subject || !message) {
        showFormMessage('Please fill in all fields', 'error');
        return;
    }

    if (!email.includes('@')) {
        showFormMessage('Please enter a valid email', 'error');
        return;
    }

    // Simulate sending message
    showFormMessage('Thank you for your message! We will get back to you soon.', 'success');
    
    // Reset form
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.reset();
    }
    
    // Clear message after 5 seconds
    setTimeout(() => {
        showFormMessage('', '');
    }, 5000);
}

// Show form message
function showFormMessage(message, type) {
    const formMessage = document.getElementById('formMessage');
    if (formMessage) {
        formMessage.textContent = message;
        formMessage.className = type;
    }
}

// ============ PAGE LOAD FUNCTIONS ============

document.addEventListener('DOMContentLoaded', function() {
    // Check login status on every page
    checkLogin();
    
    // Initialize play buttons if on gallery page
    initializePlayButtons();
});

// ============ NAVIGATION HELPERS ============

// Navigate to different sections (for pages with multiple sections)
function navigateTo(section, event) {
    if (event) {
        event.preventDefault();
    }
    
    // Hide all sections
    const sections = document.querySelectorAll('.page-section');
    sections.forEach(sec => {
        sec.classList.add('hidden-section');
    });
    
    // Show selected section
    const targetSection = document.getElementById(section);
    if (targetSection) {
        targetSection.classList.remove('hidden-section');
    }
    
    // Update active nav link
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.classList.remove('active');
    });
    
    const activeLink = document.querySelector(`a[href="#${section}"]`);
    if (activeLink) {
        activeLink.classList.add('active');
    }
    
    // Scroll to top
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}


function isUserLoggedIn() {
    return localStorage.getItem('isLoggedIn') === 'true';
}

function getCurrentUserEmail() {
    return localStorage.getItem('userEmail') || 'Guest';
}
function getCurrentUserName() {
    return localStorage.getItem('userName') || 'User';
}

function clearUserData() {
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    localStorage.removeItem('isLoggedIn');
}


window.onerror = function(msg, url, lineNo, columnNo, error) {
    console.error('Error:', msg, 'at', url, ':', lineNo, ':', columnNo);
    return false;
};


function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

function toggleMobileMenu() {
    const navMenu = document.querySelector('.nav-menu');
    if (navMenu) {
        navMenu.style.display = navMenu.style.display === 'none' ? 'flex' : 'none';
    }
}

function closeMobileMenu() {
    const navMenu = document.querySelector('.nav-menu');
    if (navMenu && window.innerWidth < 768) {
        navMenu.style.display = 'none';
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const navLinks = document.querySelectorAll('.nav-menu a');
    navLinks.forEach(link => {
        link.addEventListener('click', closeMobileMenu);
    });
});

function searchMusic(query) {
    const cards = document.querySelectorAll('.music-card');
    const lowerQuery = query.toLowerCase();
    
    cards.forEach(card => {
        const title = card.querySelector('h3').textContent.toLowerCase();
        const artist = card.querySelector('p').textContent.toLowerCase();
        
        if (title.includes(lowerQuery) || artist.includes(lowerQuery)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}


document.addEventListener('keydown', function(event) {
    const player = document.getElementById('audioPlayerElement');
    if (!player) return;
    
    switch(event.code) {
        case 'Space':
            
            event.preventDefault();
            if (player.paused) {
                player.play();
            } else {
                player.pause();
            }
            break;
        case 'ArrowRight':
            event.preventDefault();
            nextSong();
            break;
        case 'ArrowLeft':
            event.preventDefault();
            previousSong();
            break;
    }
});


document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href !== '#' && href !== '') {
            e.preventDefault();
            const element = document.querySelector(href);
            if (element) {
                element.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }
    });
});


function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function isStrongPassword(password) {
    return password.length >= 6;
}


function saveToStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch (error) {
        console.error('Error saving to storage:', error);
        return false;
    }
}

function getFromStorage(key) {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
    } catch (error) {
        console.error('Error getting from storage:', error);
        return null;
    }
}

function fadeIn(element, duration = 300) {
    element.style.opacity = '0';
    element.style.display = 'block';
    
    setTimeout(() => {
        element.style.transition = `opacity ${duration}ms`;
        element.style.opacity = '1';
    }, 10);
}

function fadeOut(element, duration = 300) {
    element.style.transition = `opacity ${duration}ms`;
    element.style.opacity = '0';
    
    setTimeout(() => {
        element.style.display = 'none';
    }, duration);
}

console.log('Jammaze script loaded successfully!');
function playPlaylist(){

const firstSong = document.querySelector(".track-row");

if(firstSong){
const mockEvent={
target:{
closest:()=>firstSong
},
preventDefault:()=>{}
};

playSong(mockEvent);
}

}
function playSong(event){

event.stopPropagation();

const card = event.target.closest(".music-card");

const title = card.dataset.title;
const artist = card.dataset.artist;
const audioSrc = card.dataset.audio;

const player = document.getElementById("audioPlayerElement");

player.src = audioSrc;
player.play();

document.getElementById("playerTitle").textContent = title;
document.getElementById("playerArtist").textContent = artist;

}
function addToPlaylist(event){

event.stopPropagation();

const card = event.target.closest(".music-card");

const song = {
title: card.dataset.title,
artist: card.dataset.artist,
audio: card.dataset.audio,
album: card.dataset.album
};

let playlist = JSON.parse(localStorage.getItem("playlist")) || [];

playlist.push(song);

localStorage.setItem("playlist", JSON.stringify(playlist));

alert(song.title + " added to playlist!");

}
function loadPlaylist(){

const container = document.querySelector(".playlist-tracks");

if(!container) return;

let playlist = JSON.parse(localStorage.getItem("playlist")) || [];

container.innerHTML = "";

playlist.forEach((song,index)=>{

container.innerHTML += `

<div class="track-row music-card"
data-title="${song.title}"
data-artist="${song.artist}"
data-audio="${song.audio}"
onclick="playSong(event)">

<span class="track-num">${index+1}</span>

<img src="${song.album}" class="track-img">

<div class="track-info">
<h3>${song.title}</h3>
<p>${song.artist}</p>
</div>

</div>

`;

});

}

document.addEventListener("DOMContentLoaded", loadPlaylist);
function stopSong(){

const player = document.getElementById("audioPlayerElement");

player.pause();
player.currentTime = 0;

}