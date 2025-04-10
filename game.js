let player = null;
let iframe   =  document.getElementById('sc-player');
let widget   =  SC.Widget(iframe);


const playButton = document.querySelector('.play-button');
const pauseButton = document.querySelector('.pause-button');
const startTime = document.querySelector('.start-time');
const endTime = document.querySelector('.end-time');
const progBarColor = document.querySelector('.progress-bar-fill');
const rewindButton = document.querySelector('.rewind-button');

// songs to test
const allSongs = [
  { title: "Real Love Baby", trackUri: "soundcloud.com/fatherjohnmisty/real-love-baby-1?si=5c58fd2c9ec64aeba56bddf5ebaa9e4e&utm_source=clipboard&utm_medium=text&utm_campaign=social_sharing" },
  { title: "Welcome Home Warrior", trackUri: "soundcloud.com/clppng/welcome-home-warrior-feat?si=b94e397a860c42e2a325f71969326189&utm_source=clipboard&utm_medium=text&utm_campaign=social_sharing" },
  { title: "Not Like Us", trackUri: "soundcloud.com/kendrick-lamar-music/not-like-us?si=be16dfa95a1a4f4f9c886ec8b586d639&utm_source=clipboard&utm_medium=text&utm_campaign=social_sharing"},
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
    secretSong: null,  // Will be set to one of the song objects
    deviceId: null,
    currentPercent: 0
};

function play() {
    playButton.style.display = 'none';
    pauseButton.style.display = 'block';
    widget.play();
}

function pause() {
    pauseButton.style.display = 'none';
    playButton.style.display = 'block';
    widget.pause();
    
}

function resetPlayStatus() {
    widget.pause();

    setTimeout(() => {
        widget.getPosition((currentPos) => {
            widget.seekTo(0);
        });
    }, 150);

    pauseButton.style.display = 'none';
    playButton.style.display = 'block';
}


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
    resetPlayStatus();
    progBarColor.style.width = `0%`;
    gameState.currentGuess = 1;
    gameState.attempts = 1;
    gameState.currentBlur = gameState.blurValues[0];
    
    // Choose a new song (without repeats) and store it.
    const nextSong = chooseSecretSong();
    gameState.secretSong = nextSong;
    
    // Update UI immediately with the new song info.
    updateUI();
    iframe.src = `https://w.soundcloud.com/player/?url=https%3A//${gameState.secretSong.trackUri}`;
    // Wait briefly before starting playback to ensure the state updates.

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
    progBarColor.style.width = `0%`;
    startTime.textContent = "0:00"
    resetPlayStatus();
    resetAvailableSongs();
    newSong();
}




//starts game on page load
document.addEventListener('DOMContentLoaded', function() {
    initializeGame();


    const intervalCheck = setInterval(checkTimer, 10);



    function checkTimer() {
        widget.getPosition(function(currentPos) {
            widget.isPaused(function(pauseState) {
                
                if (currentPos <= gameState.lengthValues[gameState.attempts-1]) {
                    startTime.textContent = "0:" + (Math.floor(currentPos/1000)).toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false});
                    gameState.currentPercent = (currentPos/gameState.lengthValues[gameState.attempts-1]*100);
                    progBarColor.style.width = `${gameState.currentPercent}%`;
                }
                if (currentPos >= (gameState.lengthValues[gameState.attempts-1]) && !pauseState ) {
                    resetPlayStatus();
                }
                endTime.textContent = "0:" + (gameState.lengthValues[gameState.attempts-1]/1000).toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false});
        
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
        widget.seekTo(0);
    });
});
