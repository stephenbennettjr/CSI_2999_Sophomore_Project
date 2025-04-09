let player = null;
let spotifyToken = null;

// songs to test
const allSongs = [
  { title: "Sunflower", trackUri: "spotify:track:3KkXRkHbMCARz0aVfEt68P" },
  { title: "Hey Jude", trackUri: "spotify:track:6dGnYIeXmHdcikdzNNDMm2" },
  { title: "Bohemian Rhapsody", trackUri: "spotify:track:1AhDOtG9vPSOmsWgNW0BEY" },
  { title: "Hotel California", trackUri: "spotify:track:40riOy7x9W7GXjyGp4pjAv" },
  { title: "Stairway to Heaven", trackUri: "spotify:track:5CQ30WqJwcep0pYcV4AMNc" }
];

let availableSongs = [];
let gameState = {
    currentGuess: 1,
    maxGuess: 5,
    blurValues: [0.3, 0.25, 0.2, 0.15, 0.1],
    currentBlur: 0.3,
    attempts: 1,
    score: 0,
    secretSong: null,  // Will be set to one of the song objects
    deviceId: null
};
function resetAvailableSongs() {
    // Create a fresh copy of the songs list.
    availableSongs = allSongs.slice();
}

// Chooses a random song
function chooseSecretSong() {
    if (availableSongs.length === 0) {
        resetAvailableSongs();
    }
    const randomIndex = Math.floor(Math.random() * availableSongs.length);
    // prevent repeats
    return availableSongs.splice(randomIndex, 1)[0];
}
function updateUI() {
    document.getElementById('album-art').style.filter = `blur(${gameState.currentBlur}rem)`;
    document.getElementById('attempts').textContent = gameState.attempts;
    document.getElementById('score').textContent = gameState.score;
    // For testing: display the current song title.
    document.getElementById('song-title').textContent = `Current Song (testing): ${gameState.secretSong.title}`;
    document.querySelectorAll('.element-select').forEach((element, index) => {
        if (index === 0) {
            element.classList.add('active');
            element.classList.remove('inactive');
        } else {
            element.classList.add('inactive');
            element.classList.remove('active');
        }
    });
}
// Sets up a new song round.
function newSong() {
    gameState.currentGuess = 1;
    gameState.attempts = 1;
    gameState.currentBlur = gameState.blurValues[0];
    
    // Choose a new song (without repeats) and store it.
    const nextSong = chooseSecretSong();
    gameState.secretSong = nextSong;
    
    // Update UI immediately with the new song info.
    updateUI();
    
    // Wait briefly before starting playback to ensure the state updates.
    setTimeout(() => {
        if (player && spotifyToken && gameState.deviceId) {
            playSong(nextSong.trackUri);
        }
    }, 500);
}

// Checks the user's guess, updates attempts or score, and calls newSong() if correct.
function checkGuess(guess) {
    if (guess.trim().toLowerCase() === gameState.secretSong.title.trim().toLowerCase()) {
        alert("Correct Guess!");
        gameState.score += 500;
        document.getElementById('score').textContent = gameState.score;
        newSong();
        return;
    }
    
    if (gameState.attempts < gameState.maxGuess) {
        gameState.attempts++;
        gameState.currentBlur = gameState.blurValues[gameState.attempts - 1];
        document.getElementById('album-art').style.filter = `blur(${gameState.currentBlur}rem)`;
        document.getElementById('attempts').textContent = gameState.attempts;
        updateSegmentLights(gameState.attempts);
    } else {
        updateSegmentLights(gameState.maxGuess);
        setTimeout(() => {
            alert('Game Over! The correct song was: ' + gameState.secretSong.title);
            initializeGame();
        }, 100);
    }
}

// Resets the overall game state.
function initializeGame() {
    gameState.score = 0;
    resetAvailableSongs();
    newSong();
}

// Retrieves the Spotify access token from the URL.
function getAccessToken() {
    let hash = window.location.hash.substring(1);
    let params = new URLSearchParams(hash);
    let token = params.get('access_token');
    if (!token) {
        token = new URLSearchParams(window.location.search).get('access_token');
    }
    return token;
}

// Starts playback of a song using the Spotify Web API.
function playSong(trackUri) {
    if (!spotifyToken || !gameState.deviceId) return;
    const url = `https://api.spotify.com/v1/me/player/play?device_id=${gameState.deviceId}`;
    fetch(url, {
        method: 'PUT',
        headers: {
           'Content-Type': 'application/json',
           'Authorization': `Bearer ${spotifyToken}`
        },
        body: JSON.stringify({ uris: [trackUri] })
    })
    .then(response => {
        if (response.ok) {
            console.log("Playback started for new song.");
        } else {
            console.error("Failed to start playback, status:", response.status, response.statusText);
        }
    })
    .catch(error => {
        console.error("Error starting playback:", error);
    });
}

// Transfers playback to the specified device.
function transferPlayback(deviceId, token) {
    fetch('https://api.spotify.com/v1/me/player', {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ device_ids: [deviceId] })
    })
    .then(response => {
        if (response.ok) {
            console.log('Playback transferred to device:', deviceId);
        } else {
            console.error('Failed to transfer playback:', response.status, response.statusText);
        }
    })
    .catch(error => {
        console.error('Error in transferPlayback:', error);
    });
}

// Spotify Web Playback SDK initialization.
window.onSpotifyWebPlaybackSDKReady = () => {
    spotifyToken = getAccessToken();
    console.log("Spotify token:", spotifyToken);
    player = new Spotify.Player({
        name: "Guess the Game Player",
        getOAuthToken: cb => { cb(spotifyToken); },
        volume: 0.5
    });
    
    player.connect().then(success => {
        if (success) {
            console.log("Player connected successfully");
        }
    });
    
    player.addListener('ready', ({ device_id }) => {
        console.log("Spotify Player is ready with Device ID", device_id);
        gameState.deviceId = device_id;
        transferPlayback(device_id, spotifyToken);
        // Start the first song.
        newSong();
    });
    
    player.addListener('not_ready', ({ device_id }) => {
        console.log("Device went offline", device_id);
    });
    
    player.addListener('initialization_error', ({ message }) => {
        console.error("Initialization Error:", message);
    });
    
    player.addListener('authentication_error', ({ message }) => {
        console.error("Authentication Error:", message);
    });
    
    player.addListener('account_error', ({ message }) => {
        console.error("Account Error:", message);
    });
};

//starts game on page load
document.addEventListener('DOMContentLoaded', function() {
    initializeGame();
    
    document.getElementById('guess-button').addEventListener('click', () => {
        const guess = document.getElementById('guess').value;
        if (guess.trim() !== "") {
            checkGuess(guess);
            document.getElementById('guess').value = "";
        }
    });
    
    document.getElementById('guess').addEventListener('keypress', e => {
        if (e.key === 'Enter') {
            const guess = document.getElementById('guess').value;
            if (guess.trim() !== "") {
                checkGuess(guess);
                document.getElementById('guess').value = "";
            }
        }
    });
});
