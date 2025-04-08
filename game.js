let gameState = {
    currentGuess: 1,
    maxGuess: 5,
    blurValues: [0.3, 0.25, 0.2, 0.15, 0.1],
    currentBlur: 0.3,
    attempts: 1,
    score: 0
};

function initializeGame() {
    gameState.currentGuess = 1;
    gameState.currentBlur = gameState.blurValues[0];
    gameState.attempts = 1;
    
    // update ui
    document.getElementById('album-art').style.filter = `blur(${gameState.currentBlur}rem)`;
    document.getElementById('attempts').textContent = gameState.attempts;
    document.getElementById('score').textContent = '0';
    
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

function checkGuess(guess) {
    if (gameState.attempts <= gameState.maxGuess) {
        if (gameState.attempts < gameState.maxGuess) {
            gameState.attempts++;
            gameState.currentGuess = gameState.attempts;
            gameState.currentBlur = gameState.blurValues[gameState.attempts - 1];
            document.getElementById('album-art').style.filter = `blur(${gameState.currentBlur}rem)`;
            document.getElementById('attempts').textContent = gameState.attempts;
            updateSegmentLights(gameState.attempts);
        } else {

            updateSegmentLights(gameState.maxGuess);
            setTimeout(() => {
                alert('Game Over!');
                initializeGame();
            }, 100);
        }
    }
}

//starts game on page load
document.addEventListener('DOMContentLoaded', function() {
    initializeGame();
    
    document.getElementById('guess-button').addEventListener('click', function() {
        const guess = document.getElementById('guess').value;
        if (guess.trim() !== '') {
            checkGuess(guess);
            document.getElementById('guess').value = ''; // clear input
        }
    });

    document.getElementById('guess').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            const guess = this.value;
            if (guess.trim() !== '') {
                checkGuess(guess);
                this.value = ''; // clear input
            }
        }
    });
}); 
