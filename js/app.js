/*-------------------------------- Constants --------------------------------*/
const topicToCategory = {
    "AI": "Science: Computers",
    "History": "History",
    "Science": "Science & Nature",
    "Geography": "Geography",
    "Art": "Art",
    "Sports": "Sports",
    "Animals": "Animals", 
    "Biology": "Biology"
};

const categoryMap = {
    "Science: Computers": 18,
    "History": 23,
    "Science & Nature": 17,
    "Geography": 22,
    "Art": 25,
    "Sports": 21,
};
/*------------------------ Cached Element References ------------------------*/

const messageContainer = document.getElementById("message-container");
const timerBar = document.querySelector('.timer-bar');
const character = document.querySelector('.character');
const questionElement = document.getElementById("question");
const answerButtons = document.getElementById("answer");
const nextButton = document.getElementById("next-btn");
const characterSelection = document.getElementById("character-selection");
const animalOptions = document.querySelectorAll(".animal-option");
const startQuizButton = document.getElementById("start-quiz");
const board = document.querySelector(".board");
const characterElement = document.querySelector(".character");
const topicInput = document.getElementById("topic-input");
const generateQuestionButton = document.getElementById("generate-question-btn");
const backgroundMusic = document.getElementById("background-music");
const muteButton = document.getElementById("mute-btn");

/*-------------------------------- State Variables --------------------------------*/
let currentQuestionIndex = 0;
let questions = []; // Store AI-generated questions
let score = 0;
let timer;
let selectedCharacter = "🐶"; // Default character
let isFetching = false; // Flag to prevent multiple simultaneous requests
/*-------------------------------- Functions --------------------------------*/

/*-------------------------------- Helper Functions --------------------------------*/
// Display a message in the message container
function showMessage(message) {
    messageContainer.textContent = message;
    setTimeout(() => {
        messageContainer.textContent = ""; // Clear the message after 3 seconds
    }, 2000);
}

// Helper function to get the category ID from the category name
function getCategoryId(category) {
    return categoryMap[category] || 9; // Default to General Knowledge if category not found
}

// Shuffle an array (used for randomizing answers)
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Play a "ding" sound for correct answers
function dingSound() {
    let ding = new Audio('sounds/bright-notifications-151766.mp3');
    ding.play();
}

// Play a "wrong" sound for incorrect answers
function wrongSound() {
    let wrong = new Audio('sounds/wrong-answer-21-199825.mp3');
    wrong.play();
}

// Toggle background music mute state
function toggleMute() {
    if (backgroundMusic.muted) {
        backgroundMusic.muted = false;
        muteButton.textContent = '🔊';
    } else {
        backgroundMusic.muted = true;
        muteButton.textContent = "🔇";
    }
}

/*-------------------------------- Core Quiz Functions --------------------------------*/

// Fetch AI-generated questions from the API
async function fetchQuestions(topic) {
    try {
        const category = topicToCategory[topic];
        if (!category) {
            throw new Error("Invalid topic selected.");
        }
        const response = await fetch(`https://opentdb.com/api.php?amount=10&category=${getCategoryId(category)}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch question: ${response.statusText}`);
        }
        const data = await response.json();
        if (data.response_code !== 0) {
            throw new Error("Failed to fetch questions: API returned an error");
        }
        const filteredQuestions = data.results.filter((question) => question.category === category);
        if (filteredQuestions.length === 0) {
            throw new Error(`No questions found for the topic: ${topic}`);
        }
        return data.results.map((questionData) => ({
            question: questionData.question,
            answers: [
                { text: questionData.correct_answer, correct: true },
                ...questionData.incorrect_answers.map((answer) => ({ text: answer, correct: false })),
            ],
        }));
    } catch (error) {
        console.error("Error fetching question:", error);
        showMessage("Failed to fetch question. Please try again.");
        return null;
    }
}

// Generate 10 new questions and start the quiz
async function generateAndAddQuestions() {
    const topic = topicInput.value.trim();
    if (!topic) {
        showMessage("Please enter a topic");
        return;
    }
    const newQuestions = await fetchQuestions(topic);
    if (newQuestions) {
        questions = newQuestions;
    }
    setTimeout(() => {
        isFetching = false;
    }, 5000); // 5-second delay
}

// Start the quiz
function startQuiz() {
    if (questions.length === 0) {
        showMessage("No questions available. Please generate questions first.");
        return;
    }
    currentQuestionIndex = 0;
    score = 0;
    nextButton.innerHTML = "Next";
    showQuestion();
}

// Display the current question
function showQuestion() {
    resetState();
    startTimer();
    let currentQuestion = questions[currentQuestionIndex];
    let questionNo = currentQuestionIndex + 1;
    questionElement.innerHTML = questionNo + ". " + currentQuestion.question;

    const shuffledAnswers = shuffleArray(currentQuestion.answers);
    shuffledAnswers.forEach((answer) => {
        const button = document.createElement("button");
        button.innerHTML = answer.text;
        button.classList.add("btn");
        answerButtons.appendChild(button);
        if (answer.correct) {
            button.dataset.correct = answer.correct;
        }
        button.addEventListener("click", selectAnswer);
    });
}

// Handle user answer selection
function selectAnswer(e) {
    const selectedBtn = e.target;
    const isCorrect = selectedBtn.dataset.correct === "true";
    if (isCorrect) {
        dingSound();
        selectedBtn.classList.add("correct");
        score++;
    } else {
        wrongSound();
        selectedBtn.classList.add("incorrect");
    }
    Array.from(answerButtons.children).forEach(button => {
        if (button.dataset.correct === "true") {
            button.classList.add("correct");
        }
        button.disabled = true;
    });
    nextButton.style.display = "block";
}

// Handle the "Next" button click
function handleNextButton() {
    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) {
        showQuestion();
    } else {
        showScore();
        
    }
}

// Show the final score
function showScore() {
    resetState();
    let userScore = `You scored ${score} out of ${questions.length}.`;
    questionElement.innerHTML = userScore;
    questionElement.style.textAlign = "center";
    nextButton.innerHTML = "Play Again?";
    nextButton.style.display = "block";
    backgroundMusic.pause(); // Pause joyful music
}


/*-------------------------------- Timer Functions --------------------------------*/

// Start the timer for the current question
function startTimer() {
    character.style.animation = 'none';
    void character.offsetWidth; // Force reflow to restart animation
    character.style.animation = 'moveCharacter 20s linear forwards';

    timer = setTimeout(() => {
        handleTimeOut();
    }, 20000); // 20 seconds timer
}

// Handle timer timeout
function handleTimeOut() {
    if (questions.length > 0) {
        wrongSound();
        disableAllButtons();
        nextButton.style.display = "block";
    }
}

// Reset the timer and UI state
function resetState() {
    clearTimeout(timer);
    character.style.animation = 'none';
    nextButton.style.display = "none";
    while (answerButtons.firstChild) {
        answerButtons.removeChild(answerButtons.firstChild);
    }
}
// Background Music Autoplay Handling
function startBackgroundMusic() {
    backgroundMusic.play()
      .then(() => {
        console.log("Background music started.");
      })
      .catch((error) => {
        console.error("Failed to start background music:", error);
        showMessage("Click anywhere to start background music.");
      });
  }
/*----------------------------- Event Listeners -----------------------------*/
// Event Listeners for Animal Selection
animalOptions.forEach(option => {
    option.addEventListener("click", () => {
        // Remove selected class from all options
        animalOptions.forEach(opt => opt.classList.remove("selected"));
        // Add selected class to the clicked option
        option.classList.add("selected");
        // Update the selected character
        selectedCharacter = option.getAttribute("data-emoji");
        // Update the character in the timer
        characterElement.textContent = selectedCharacter;
    });
});
// Start Quiz Button
startQuizButton.addEventListener("click", () => {
    board.style.display = "block";
    characterElement.textContent = selectedCharacter;
    startQuizButton.style.display = "none";
    nextButton.style.display = "block";
    startQuiz();
});

// Next Button
nextButton.addEventListener("click", () => {
    if (currentQuestionIndex < questions.length) {
        handleNextButton();
    } else {
        startQuiz();
        
    }
});

// Generate Questions Button
generateQuestionButton.addEventListener("click", generateAndAddQuestions);

// Mute Button
muteButton.addEventListener('click', toggleMute);

// Background Music Autoplay Handling
window.addEventListener("load", () => {
    startBackgroundMusic();
});

document.addEventListener("click", () => {
    if (backgroundMusic.paused) {
        startBackgroundMusic();
    }
});

