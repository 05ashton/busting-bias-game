/*
Busting Bias Game - Final Version
Author: Ashton Curl
Year: 2025

Features:
✔ Click, Swipe, or Use Arrow Keys to choose
✔ Animated word transitions & shake effect
✔ Sound effects for correct/incorrect answers
✔ Game Over screen with restart option
✔ Local storage saves responses
*/

document.addEventListener('DOMContentLoaded', () => {

  // === Grab all elements from the HTML ===
  const stimulus = document.getElementById('stimulus');     // Word shown to user
  const feedback = document.getElementById('feedback');     // Shows ✔ or ✘
  const leftButton = document.getElementById('left-button');
  const rightButton = document.getElementById('right-button');
  const scoreDisplay = document.getElementById('score');
  const restartButton = document.getElementById('restart');
  const gameOverMsg = document.getElementById('game-over');

  // === Sound Effects ===
  const correctSound = document.getElementById('correct-sound');
  const incorrectSound = document.getElementById('incorrect-sound');

  // === Game Data ===
  const originalStimuli = [
      { word: 'Apple', correct: 'left' },
      { word: 'Banana', correct: 'right' },
      { word: 'Dog', correct: 'right' },
      { word: 'Car', correct: 'left' }
  ];
  let stimuli = [];        // Holds randomized word order
  let currentIndex = 0;    // Tracks current word
  let score = 0;           // Tracks player score
  let responses = [];      // Stores all player answers

  // === Shuffle the words randomly ===
  function shuffleArray(array) {
      return array.sort(() => Math.random() - 0.5);
  }

  // === Start or Restart the Game ===
  function initGame() {
      stimuli = shuffleArray([...originalStimuli]); // Make a shuffled copy
      currentIndex = 0;
      score = 0;
      responses = [];
      leftButton.disabled = false;
      rightButton.disabled = false;
      restartButton.style.display = 'none';
      gameOverMsg.style.display = 'none';
      updateScoreDisplay();
      showNextStimulus();
  }

  // === Display the Next Word with Animation ===
  function showNextStimulus() {
      if (currentIndex < stimuli.length) {
          // Remove old animations first
          stimulus.classList.remove('slide-in-left', 'slide-in-right', 'shake');

          // Pick animation based on correct category (for fun!)
          const animClass = (stimuli[currentIndex].correct === 'left')
              ? 'slide-in-left'
              : 'slide-in-right';

          // Force browser to reflow before re-adding class
          void stimulus.offsetWidth;

          // Add animation and show the word
          stimulus.classList.add(animClass);
          stimulus.textContent = stimuli[currentIndex].word;
      } else {
          endGame(); // If no more words, show Game Over screen
      }
  }

  // === Show Feedback (✔ or ✘) ===
  function showFeedback(isCorrect) {
      feedback.textContent = isCorrect ? '✔' : '✘';
      feedback.className = isCorrect ? 'correct' : 'incorrect';
      feedback.style.display = 'block';

      // Play correct/incorrect sounds
      isCorrect ? correctSound.play() : incorrectSound.play();

      // Shake animation if incorrect
      if (!isCorrect) {
          stimulus.classList.add('shake');
          setTimeout(() => stimulus.classList.remove('shake'), 400);
      }

      // Hide feedback and move to next word after short delay
      setTimeout(() => {
          feedback.style.display = 'none';
          currentIndex++;
          showNextStimulus();
      }, 600);
  }

  // === Handle User's Answer ===
  function handleResponse(choice) {
      if (currentIndex >= stimuli.length) return; // Do nothing if game ended

      const wordObj = stimuli[currentIndex];
      const isCorrect = (choice === wordObj.correct);

      // Update score if correct
      if (isCorrect) score++;
      updateScoreDisplay();

      // Save this answer locally
      saveResponse({ word: wordObj.word, choice, isCorrect });

      // Show feedback animation and icon
      showFeedback(isCorrect);
  }

  // === Update Score Display ===
  function updateScoreDisplay(final = false) {
      scoreDisplay.textContent = final
          ? `Final Score: ${score} / ${stimuli.length}`
          : `Score: ${score}`;
  }

  // === Save User Responses to Local Storage ===
  function saveResponse(response) {
      responses.push(response);
      localStorage.setItem('gameData', JSON.stringify(responses));
  }

  // === Game Over Screen ===
  function endGame() {
      stimulus.textContent = '🎉 Game Over!';
      updateScoreDisplay(true);
      leftButton.disabled = true;
      rightButton.disabled = true;
      gameOverMsg.textContent = `You scored ${score} out of ${stimuli.length}!`;
      gameOverMsg.style.display = 'block';
      restartButton.style.display = 'inline-block';
  }

  // === Restart Button ===
  restartButton.addEventListener('click', initGame);

  // === Button Clicks ===
  leftButton.addEventListener('click', () => handleResponse('left'));
  rightButton.addEventListener('click', () => handleResponse('right'));

  // === Keyboard Support (Arrow Keys) ===
  document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') handleResponse('left');
      if (e.key === 'ArrowRight') handleResponse('right');
  });

  // === Swipe Support (Touch Devices) ===
  let touchStartX = 0, touchEndX = 0;
  stimulus.addEventListener('touchstart', (e) => touchStartX = e.changedTouches[0].screenX);
  stimulus.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      const swipe = touchEndX - touchStartX;
      if (Math.abs(swipe) > 30) handleResponse(swipe > 0 ? 'right' : 'left');
  });

  // === Start the Game on Page Load ===
  initGame();
});