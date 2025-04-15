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
    { 
      title: "Not Like Us - Kendrick Lamar", trackUri: "soundcloud.com/kendrick-lamar-music/not-like-us?si=be16dfa95a1a4f4f9c886ec8b586d639&utm_source=clipboard&utm_medium=text&utm_campaign=social_sharing", art: "https://i1.sndcdn.com/artworks-UPEAvUqrkz6a-0-t500x500.jpg"
    },
    { 
      title: "Beat It - Michael Jackson", trackUri: "soundcloud.com/mjimmortal/beat-it-single-version?si=2ca0baf6a17f45718d7f0613462462ba&utm_source=clipboard&utm_medium=text&utm_campaign=social_sharing", art: "https://i.scdn.co/image/ab67616d0000b273de437d960dda1ac0a3586d97" 
    },
    { 
      title: "Hotel California - The Eagles", trackUri: "soundcloud.com/eaglesofficial/eagles-hotel-california?si=53592bade0a0470ebfe256b0aa777983&utm_source=clipboard&utm_medium=text&utm_campaign=social_sharing", art: "https://i1.sndcdn.com/artworks-YFRPbwj60arT-0-t500x500.jpg" 
    },
    { 
      title: "Blinding Lights - The Weeknd", trackUri: "soundcloud.com/theweeknd/blinding-lights?si=a15d3b0f786d4b3aac4b8e1f20d69e98&utm_source=clipboard&utm_medium=text&utm_campaign=social_sharing", art: "https://i.scdn.co/image/ab67616d0000b2738863bc11d2aa12b54f5aeb36" 
    },
    { 
      title: "Bad Guy - Billie Eilish", trackUri: "soundcloud.com/billieeilish/bad-guy?si=78fcf1cf37a04cb7934fb2fa65f1ebda&utm_source=clipboard&utm_medium=text&utm_campaign=social_sharing", art: "https://i1.sndcdn.com/artworks-tmxRIlncrsjv-0-t500x500.jpg" 
    },
    { 
      title: "Humble - Kendrick Lamar", trackUri: "soundcloud.com/kendrick-lamar-music/humble?si=9aecc4a5c98344d9b29a87e33a3a2d69&utm_source=clipboard&utm_medium=text&utm_campaign=social_sharing", art: "https://i1.sndcdn.com/artworks-yqTGeeaL2BRc-0-t500x500.jpg" 
    },
    { 
      title: "Starboy - The Weeknd", trackUri: "soundcloud.com/theweeknd/starboy?si=f4d076c03f0442aca0d8c3fdb4afebee&utm_source=clipboard&utm_medium=text&utm_campaign=social_sharing", art: "https://i.scdn.co/image/ab67616d0000b2734718e2b124f79258be7bc452" 
    },
    { 
      title: "Levitating - Dua Lipa", trackUri: "soundcloud.com/dualipa/levitating?si=0b5ce5dfc8c345a4b8f78eb2afb30b72&utm_source=clipboard&utm_medium=text&utm_campaign=social_sharing", art: "https://i.scdn.co/image/ab67616d0000b273d4daf28d55fe4197ede848be" 
    },
  ];

  const guessableSongTitles = [
    "Real Love Baby - Father John Misty",
    "Ring of Fire - Johnny Cash",
    "Hotel California - Eagles",
    "Beat It - Michael Jackson",
    "Blinding Lights - The Weeknd",
    "Bad Guy - Billie Eilish",
    "Humble - Kendrick Lamar",
    "Starboy - The Weeknd",
    "Levitating - Dua Lipa",
    "Not Like Us - Kendrick Lamar",
    "Purple Haze - Jimi Hendrix",
    "Bohemian Rhapsody - Queen",
    "Imagine - John Lennon",
    "Hey Jude - The Beatles",
    "Wonderwall - Oasis",
    "Smells Like Teen Spirit - Nirvana",
    "Rolling in the Deep - Adele",
    "Dancing Queen - ABBA",
    "Sweet Child O' Mine - Guns N' Roses",
    "Lose Yourself - Eminem",
    "Uptown Funk - Mark Ronson ft. Bruno Mars",
    "Like a Rolling Stone - Bob Dylan",
    "Shape of You - Ed Sheeran",
    "Thriller - Michael Jackson",
    "Every Breath You Take - The Police",
    "I Will Always Love You - Whitney Houston",
    "Shake It Off - Taylor Swift",
    "Superstition - Stevie Wonder",
    "Bohemian Like You - The Dandy Warhols",
    "Happy - Pharrell Williams",
    "Someone Like You - Adele",
    "Born to Run - Bruce Springsteen",
    "Take On Me - A-ha",
    "Viva La Vida - Coldplay",
    "Let It Be - The Beatles",
    "Africa - Toto",
    "No Woman, No Cry - Bob Marley & The Wailers",
    "Call Me Maybe - Carly Rae Jepsen",
    "Stayin' Alive - Bee Gees",
    "Poker Face - Lady Gaga",
    "Wake Me Up - Avicii",
    "Shallow - Lady Gaga & Bradley Cooper",
    "We Will Rock You - Queen",
    "Gangnam Style - PSY",
    "Shape of You - Ed Sheeran",
    "Despacito - Luis Fonsi & Daddy Yankee",
    "Clocks - Coldplay",
    "Halo - Beyoncé",
    "Sorry - Justin Bieber",
    "Old Town Road - Lil Nas X",
    "Blurred Lines - Robin Thicke ft. Pharrell",
    "All of Me - John Legend",
    "Chandelier - Sia"
];
const songTitles = Array.from(new Set([...allSongs.map(song => song.title), ...guessableSongTitles]));
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

//Alert Functions
function showSuccessAlert(songTitle, trackUri) {
  hideAllAlerts();
  
  const successAlert = document.getElementById('successAlert');
  const albumArt = document.getElementById('alert-album-art');
  const songTitleEl = document.getElementById('alert-song-title');
  const artistEl = document.getElementById('alert-artist');
  
  const artist = extractArtistFromUri(trackUri);

  songTitleEl.textContent = songTitle;
  artistEl.textContent = artist;
  
  const gameAlbumArt = document.getElementById('album-art');
  if (gameAlbumArt) {
    const style = window.getComputedStyle(gameAlbumArt);
    albumArt.style.backgroundImage = style.backgroundImage;
    albumArt.style.filter = 'blur(0)'; // Make sure it's not blurred in the alert
  }
  
  const artUrl = gameState.secretSong.art;

  if (artUrl) {
    albumArt.style.backgroundImage = `url(${artUrl})`;
    albumArt.style.backgroundSize = 'cover';
    albumArt.style.backgroundPosition = 'center';
    albumArt.style.filter = 'blur(0)';
  }

  successAlert.style.display = 'flex';
  
  // Setup share button
  const shareButton = document.getElementById('share-song');
  shareButton.onclick = function() {
    window.open('https://' + trackUri, '_blank');
  };
  
  const closeButton = document.getElementById('close-success-alert');
  closeButton.onclick = function() {
    closeAlert(successAlert);
  };

  setTimeout(function() {
    closeAlert(successAlert);
  }, 6000);
}

// Function to show game over alert
function showGameOverAlert(songTitle, trackUri) {
  hideAllAlerts();
  
  const gameOverAlert = document.getElementById('gameOverAlert');
  const albumArt = document.getElementById('game-over-album-art');
  const songTitleEl = document.getElementById('game-over-song-title');
  const artistEl = document.getElementById('game-over-artist');
  const messageEl = document.getElementById('game-over-message');
  
  const artist = extractArtistFromUri(trackUri);
  
  songTitleEl.textContent = songTitle;
  artistEl.textContent = artist;
  messageEl.textContent = `The correct song was: ${songTitle}`;
  
  const gameAlbumArt = document.getElementById('album-art');

  const artUrl = gameState.secretSong.art;
  if (artUrl) {
    albumArt.style.backgroundImage = `url(${artUrl})`;
    albumArt.style.backgroundSize = 'cover';
    albumArt.style.backgroundPosition = 'center';
    albumArt.style.filter = 'blur(0)';
  }

  gameOverAlert.style.display = 'flex';
  
  const closeButton = document.getElementById('close-game-over-alert');
  closeButton.onclick = function() {
    closeAlert(gameOverAlert);
  };
  setTimeout(function() {
    closeAlert(gameOverAlert);
  }, 6000);
}

function extractArtistFromUri(trackUri) {
  const parts = trackUri.split('/');
  if (parts.length > 1) {
    let artistName = parts[1];
    const artistMap = {
      'kendrick-lamar-music': 'Kendrick Lamar',
      'mjimmortal': 'Michael Jackson',
      'eaglesofficial': 'Eagles'
    };
    return artistMap[artistName] || artistName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }
  return 'Unknown Artist';
}

function closeAlert(alertElement) {
  alertElement.classList.add('alert-hide');
  setTimeout(function() {
    alertElement.style.display = 'none';
    alertElement.classList.remove('alert-hide');
  }, 300);
}

// hide all alerts
function hideAllAlerts() {
  const alerts = document.querySelectorAll('.custom-alert');
  alerts.forEach(alert => {
    alert.style.display = 'none';
    alert.classList.remove('alert-hide');
  });
}

function getSegmentBoundaries() {
    const segmentStart = gameState.attempts > 1 ? gameState.lengthValues[gameState.attempts - 2] : 0;
    const segmentEnd = gameState.lengthValues[gameState.attempts - 1];
    return { start: segmentStart, end: segmentEnd };
}

function play() {
    const { start } = getSegmentBoundaries();
    widget.getPosition(currentPos => {
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
    availableSongs = [...allSongs]; 
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
    const albumArtElement = document.getElementById('album-art');
    albumArtElement.style.filter = `blur(${gameState.currentBlur}rem)`;
    
    // Ensure album art is set
    albumArtElement.style.backgroundImage = `url(${gameState.secretSong.art})`;
    albumArtElement.style.backgroundSize = 'cover';
    albumArtElement.style.backgroundPosition = 'center';
    
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
    gameState.lastErrorShown = false;  // Reset error tracking
    
    // Choose a new song (without repeats) and store it.
    const nextSong = chooseSecretSong();
    gameState.secretSong = nextSong;
    
    // Update album art
    const albumArtElement = document.getElementById('album-art');
    albumArtElement.style.backgroundImage = '';
    
    void albumArtElement.offsetWidth;
    
    albumArtElement.style.backgroundImage = `url(${gameState.secretSong.art})`;
    albumArtElement.style.backgroundSize = 'cover';
    albumArtElement.style.backgroundPosition = 'center';
    albumArtElement.style.filter = `blur(${gameState.currentBlur}rem)`;
    
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

function showSuccessAlert(songTitle, trackUri) {
    hideAllAlerts();
    
    const successAlert = document.getElementById('successAlert');
    const albumArt = document.getElementById('alert-album-art');
    const songTitleEl = document.getElementById('alert-song-title');
    const artistEl = document.getElementById('alert-artist');
    
    const artist = extractArtistFromUri(trackUri);
    
    songTitleEl.textContent = songTitle;
    artistEl.textContent = artist;
    
    // Set the album art
    const gameAlbumArt = document.getElementById('album-art');
    if (gameAlbumArt) {
      const style = window.getComputedStyle(gameAlbumArt);
      albumArt.style.backgroundImage = style.backgroundImage;
      albumArt.style.filter = 'blur(0)'; // Make sure it's not blurred in the alert
    }
    successAlert.style.display = 'flex';
    const shareButton = document.getElementById('share-song');
    shareButton.onclick = function() {
      window.open('https://' + trackUri, '_blank');
    };
    

    const closeButton = document.getElementById('close-success-alert');
    closeButton.onclick = function() {
      closeAlert(successAlert);
    };
    

    setTimeout(function() {
      closeAlert(successAlert);
    }, 6000);
  }
  
  function checkGuess(guess) {
      gameState.isTransitioning = true;
      
      if (guess.trim().toLowerCase() === gameState.secretSong.title.trim().toLowerCase()) {
          playButton.style.display = 'none';
          pauseButton.style.display = 'none';
          neutralButton.style.display = 'block';
          widget.pause();
          gameState.isPlaying = false;
          gameState.lastErrorShown = false;
          
          setTimeout(() => {
              // Show success alert
              showSuccessAlert(gameState.secretSong.title, gameState.secretSong.trackUri);
              gameState.score += 500;
              newSong();
              gameState.isTransitioning = false;
          }, 50);
          return;
      }
      
      if (gameState.attempts < gameState.maxGuess) {
          widget.getPosition(currentPos => {
              const attemptsLeft = gameState.maxGuess - gameState.attempts;
              if (!gameState.lastErrorShown || gameState.attempts >= gameState.maxGuess - 1) {
                        const guessInput = document.getElementById('guess');
                         guessInput.classList.add('wrong-answer');
                            setTimeout(() => {
                                        guessInput.classList.remove('wrong-answer');
                                    }, 800);
              } 
              
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
          
          // Reset error tracking
          gameState.lastErrorShown = false;
          
          setTimeout(() => {
              // Show game over alert
              showGameOverAlert(gameState.secretSong.title, gameState.secretSong.trackUri);
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


//Autocomplete code

// take guess element, autocomplete list element, and all song titles as consts
const inputElement = document.getElementById('guess');
const autocompleteList = document.getElementById('autocomplete-list');


//listen for input
inputElement.addEventListener('input', function() {
  //make the input lowercase  
  const inputValue = this.value.toLowerCase();
    //clear previous suggestions  
  autocompleteList.innerHTML = ''; 
  //if empty, show nothing
    if (!inputValue) {
        return; 
    }

    // songs filtered if the title has the input text, slice to show only 4 songs
    const filteredSuggestions = songTitles.filter(title => 
        title.toLowerCase().includes(inputValue)
    ).slice(0,4);

    
    //iterate over each and create a pop up for each
    filteredSuggestions.forEach(suggestion => {
        const listItem = document.createElement('li');
        listItem.textContent = suggestion;
        listItem.addEventListener('click', function() {
            inputElement.value = suggestion; //if clicked, set guess to suggestion
            autocompleteList.innerHTML = ''; //clear suggestion list at this point
        });
        autocompleteList.appendChild(listItem);
    });
});

//close when lost focus
inputElement.addEventListener('blur', function() {
    setTimeout(() => autocompleteList.innerHTML = '', 150); //delay in case of click
});
