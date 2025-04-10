let player = null;
let iframe   =  document.getElementById('sc-player');
let widget   =  SC.Widget(iframe);


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
    secretSong: null,  // Will be set to one of the song objects
    deviceId: null,
    currentPercent: 0
};

function play() {
    widget.bind(SC.Widget.Events.READY, () => {
        playButton.style.display = 'none';
        pauseButton.style.display = 'block';
        neutralButton.style.display = 'none';
        widget.play();
    });
    
}

function pause() {
    pauseButton.style.display = 'none';
    playButton.style.display = 'block';
    neutralButton.style.display = 'none';
    widget.pause();
    
}

function newRound() {
    widget.pause();

    setTimeout(() => {
        widget.getPosition((currentPos) => {
            widget.seekTo(0);
        });
    }, 150);
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
    neutralButton.style.display = 'none';
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
    newRound();
    
    progBarColor.style.width = `0%`;
    gameState.currentGuess = 1;
    gameState.attempts = 1;
    gameState.currentBlur = gameState.blurValues[0];
    
    // Choose a new song (without repeats) and store it.
    const nextSong = chooseSecretSong();
    gameState.secretSong = nextSong;
    
    // Update UI immediately with the new song info.
    updateUI();
    widget.load(`${gameState.secretSong.trackUri}`);
    
    widget.bind(SC.Widget.Events.READY, () => {
        playButton.style.display = 'block'; 
        neutralButton.style.display = 'none';
        pauseButton.style.display = 'none';
    });
}

// Checks the user's guess, updates attempts or score, and calls newSong() if correct.
function checkGuess(guess) {
    if (guess.trim().toLowerCase() === gameState.secretSong.title.trim().toLowerCase()) {
        
        playButton.style.display = 'none';
        pauseButton.style.display = 'none';
        neutralButton.style.display = 'block';
        alert("Correct Guess!");
        newSong();
        gameState.score += 500;
        document.getElementById('score').textContent = gameState.score;
        
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
