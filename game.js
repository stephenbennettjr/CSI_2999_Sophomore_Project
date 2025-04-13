let player = null;
let iframe = document.getElementById('sc-player');
let widget = SC.Widget(iframe);

const playButton = document.querySelector('.play-button');
const pauseButton = document.querySelector('.pause-button');
const neutralButton = document.querySelector('.neutral-button');
const startTime = document.querySelector('.start-time');
const endTime = document.querySelector('.end-time');
const progBarColor = document.querySelector('.progress-bar-fill');
const rewindButton = document.querySelector('.rewind-button');

// songs to test
const allSongs = [
  { title: "Not Like Us", trackUri: "soundcloud.com/kendrick-lamar-music/not-like-us?si=be16dfa95a1a4f4f9c886ec8b586d639&utm_source=clipboard&utm_medium=text&utm_campaign=social_sharing"},
  { title: "Beat It", trackUri: "soundcloud.com/mjimmortal/beat-it-single-version?si=2ca0baf6a17f45718d7f0613462462ba&utm_source=clipboard&utm_medium=text&utm_campaign=social_sharing"},
  { title: "Hotel California", trackUri: "soundcloud.com/eaglesofficial/eagles-hotel-california?si=53592bade0a0470ebfe256b0aa777983&utm_source=clipboard&utm_medium=text&utm_campaign=social_sharing"},
];

let availableSongs = [];
let gameState = {
    currentGuess: 1,
    maxGuess: 5,
    blurValues: [0.3, 0.25, 0.2, 0.15, 0.1],
    lengthValues: [1000, 2000, 7000, 11000, 15000],
    currentBlur: 0.3,
    attempts: 1,
    score: 0,
    secretSong: null,
    deviceId: null,
    currentPercent: 0,
    segmentStart: 0,
    isTransitioning: false,
    isPlaying: false
};

// Calculate the start and end time of the current segment
function getSegmentBoundaries() {
    const segmentStart = gameState.attempts > 1 ? gameState.lengthValues[gameState.attempts - 2] : 0;
    const segmentEnd = gameState.lengthValues[gameState.attempts - 1];
    return { start: segmentStart, end: segmentEnd };
}

function play() {
    const { start } = getSegmentBoundaries();
    widget.getPosition(currentPos => {
        // Only seek if we're outside the current segment
        if (currentPos < start) {
            widget.seekTo(start);
        }
        widget.play();
        gameState.isPlaying = true;
        playButton.style.display = 'none';
        pauseButton.style.display = 'block';
        neutralButton.style.display = 'none';
    });
}

function pause() {
    widget.pause();
    gameState.isPlaying = false;
    pauseButton.style.display = 'none';
    playButton.style.display = 'block';
    neutralButton.style.display = 'none';
}

function newRound() {
    widget.pause();
    gameState.isPlaying = false;
    widget.seekTo(0);
}

function resetPlayStatus() {
    const { start } = getSegmentBoundaries();
    widget.pause();
    gameState.isPlaying = false;
    
    setTimeout(() => {
        widget.seekTo(start);
        pauseButton.style.display = 'none';
        playButton.style.display = 'block';
        neutralButton.style.display = 'none';
    }, 50);
}

function resetAvailableSongs() {
    // Create a fresh copy of the songs list
    availableSongs = [...allSongs]; // Using spread operator for a proper clone
    console.log("Available songs reset:", availableSongs);
}

// Chooses a random song
function chooseSecretSong() {
    if (availableSongs.length === 0) {
        resetAvailableSongs();
    }
    
    const randomIndex = Math.floor(Math.random() * availableSongs.length);
    const selectedSong = availableSongs.splice(randomIndex, 1)[0];
    
    console.log("Selected song:", selectedSong.title);
    console.log("Remaining songs:", availableSongs);
    
    return selectedSong;
}

function updateUI() {
    document.getElementById('album-art').style.filter = `blur(${gameState.currentBlur}rem)`;
    document.getElementById('attempts').textContent = gameState.attempts;
    document.getElementById('score').textContent = gameState.score;
    // For testing: display the current song title.
    document.getElementById('song-title').textContent = `Current Song (testing): ${gameState.secretSong.title}`;
    
    updateSegmentLights(gameState.attempts);
    
    // Update the start and end time displays
    const { start, end } = getSegmentBoundaries();
    const segmentLength = end - start;
    endTime.textContent = "0:" + (Math.floor(segmentLength/1000)).toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false});
    startTime.textContent = "0:00";
    
    // Reset progress bar
    progBarColor.style.width = '0%';
}

//updates segment lights to inactive or active
function updateSegmentLights(currentAttempt) {
    const segments = document.querySelectorAll('.element-select');

    segments.forEach(segment => {
        segment.classList.add('inactive');
        segment.classList.remove('active');
    });

    if (currentAttempt <= gameState.maxGuess) {
        segments[currentAttempt - 1].classList.add('active');
        segments[currentAttempt - 1].classList.remove('inactive');
    }
}

// Sets up a new song round.
function newSong() {
    newRound();
    
    progBarColor.style.width = `0%`;
    gameState.currentGuess = 1;
    gameState.attempts = 1;
    gameState.currentBlur = gameState.blurValues[0];
    gameState.isPlaying = false;
    
    // Choose a new song (without repeats) and store it.
    const nextSong = chooseSecretSong();
    gameState.secretSong = nextSong;
    
    console.log("Loading new song:", gameState.secretSong.title);
    
    // Update UI immediately with the new song info.
    widget.load(`https://${gameState.secretSong.trackUri}`, {
        callback: function() {
            console.log("Song loaded successfully");
            updateUI();
            playButton.style.display = 'block'; 
            neutralButton.style.display = 'none';
            pauseButton.style.display = 'none';
        }
    });
}

// Checks the user's guess, updates attempts or score, and calls newSong() if correct.
function checkGuess(guess) {
    gameState.isTransitioning = true;
    
    if (guess.trim().toLowerCase() === gameState.secretSong.title.trim().toLowerCase()) {
        playButton.style.display = 'none';
        pauseButton.style.display = 'none';
        neutralButton.style.display = 'block';
        widget.pause();
        gameState.isPlaying = false;
        
        setTimeout(() => {
            alert("Correct Guess!");
            gameState.score += 500;
            newSong();
            gameState.isTransitioning = false;
        }, 50);
        return;
    }
    
    if (gameState.attempts < gameState.maxGuess) {
        // Get current position before changing attempt
        widget.getPosition(currentPos => {
            // Update game state to next attempt
            gameState.attempts++;
            gameState.currentBlur = gameState.blurValues[gameState.attempts - 1];
            
            // Update UI elements
            document.getElementById('album-art').style.filter = `blur(${gameState.currentBlur}rem)`;
            document.getElementById('attempts').textContent = gameState.attempts;
            updateSegmentLights(gameState.attempts);
            
            // Get new segment boundaries
            const { start, end } = getSegmentBoundaries();
            const segmentLength = end - start;
            
            // Update time displays
            endTime.textContent = "0:" + (Math.floor(segmentLength/1000)).toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false});
            startTime.textContent = "0:00";
            
            // Reset progress bar
            progBarColor.style.width = '0%';
            
            // Auto-play the new segment
            widget.seekTo(start);
            
            // Play the new segment automatically
            setTimeout(() => {
                widget.play();
                gameState.isPlaying = true;
                playButton.style.display = 'none';
                pauseButton.style.display = 'block';
                neutralButton.style.display = 'none';
                gameState.isTransitioning = false;
            }, 100);
        });
    } else {
        updateSegmentLights(gameState.maxGuess);
        widget.pause();
        gameState.isPlaying = false;
        
        setTimeout(() => {
            alert('Game Over! The correct song was: ' + gameState.secretSong.title);
            initializeGame();
            gameState.isTransitioning = false;
        }, 100);
    }
}

// Resets the overall game state.
function initializeGame() {
    gameState.score = 0;
    gameState.isPlaying = false;
    resetAvailableSongs(); // Make sure this happens before newSong
    newSong();
}

//starts game on page load
document.addEventListener('DOMContentLoaded', function() {
    initializeGame();

    const intervalCheck = setInterval(checkTimer, 10);

    function checkTimer() {
        if (gameState.isTransitioning) return;

        widget.getPosition(function(currentPos) {
            widget.isPaused(function(pauseState) {
                const { start, end } = getSegmentBoundaries();
                
                // Update progress only if we're within the segment
                if (currentPos >= start && currentPos <= end) {
                    const relativePos = currentPos - start;
                    const segmentLength = end - start;
                    
                    // Format time display (MM:SS)
                    const seconds = Math.floor(relativePos/1000);
                    startTime.textContent = "0:" + seconds.toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false});
                    
                    // Update progress bar
                    gameState.currentPercent = (relativePos/segmentLength*100);
                    progBarColor.style.width = `${Math.min(gameState.currentPercent, 100)}%`;
                }
                
                // Handle segment end
                if (currentPos >= end && !pauseState && !gameState.isTransitioning) {
                    gameState.isTransitioning = true;
                    
                    // If at the end of the segment, pause and reset to start of segment
                    setTimeout(() => {
                        widget.seekTo(start);
                        widget.pause();
                        gameState.isPlaying = false;
                        pauseButton.style.display = 'none';
                        playButton.style.display = 'block';
                        neutralButton.style.display = 'none';
                        gameState.isTransitioning = false;
                    }, 50);
                }
            });
        });
    }

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
    
    playButton.addEventListener('click', function() {
        play();
    });

    pauseButton.addEventListener('click', function() {
        pause();
    });

    rewindButton.addEventListener('click', function() {
        const { start } = getSegmentBoundaries();
        widget.seekTo(start);
    });
});
