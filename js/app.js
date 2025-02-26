/*-------------------------------- Constants --------------------------------*/
const topicToCategory = {
    "AI": "Science: Computers",
    "History": "History",
    "Science": "Science & Nature",
    "Geography": "Geography",
    "Art": "Art",
    "Sports": "Sports",
    "Animals": "Animals", 
    "Biology":"Biology"
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
const topicInput = document.getElementById("topic-input");
const generateQuestionButton = document.getElementById("generate-question-btn");
const backgroundMusic = document.getElementById("background-music"); // Background music
const characterElement = document.querySelector(".character"); // Timer character
const quizControls = document.getElementById("quiz-controls"); 

let currentQuestionIndex = 0;
let questions = []; // Store AI-generated questions
let score = 0;
let timer;
let selectedCharacter = "🐶"; // Default character

/*-------------------------------- Functions --------------------------------*/

// Display a message in the message container
function showMessage(message) {
    messageContainer.textContent = message;
    setTimeout(() => {
        messageContainer.textContent = ""; // Clear the message after 3 seconds
    }, 10000);
}

// Fetch AI-generated question
async function fetchQuestions(topic) {
    try {
        // Map the user's topic to the API category
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
        // Format the questions for your quiz
        const formattedQuestions = data.results.map((questionData) => {
            return {
                question: questionData.question,
                answers: [
                    { text: questionData.correct_answer, correct: true },
                    ...questionData.incorrect_answers.map((answer) => ({ text: answer, correct: false })),
                ],
            };
        });
        return formattedQuestions;
    } catch (error) {
        console.error("Error fetching question:", error);
        showMessage("Failed to fetch question. Please try again.");
        return null;
    }
}

// Helper function to get the category ID from the category name
function getCategoryId(category) {
    const categoryMap = {
        "Science: Computers": 18,
        "History": 23,
        "Science & Nature": 17,
        "Geography": 22,
        "Art": 25,
        "Sports": 21,
    };
    return categoryMap[category] || 9; // Default to General Knowledge if category not found
}

// Generate 10 new questions and start the quiz
let isFetching = false; // Flag to prevent multiple simultaneous requests

async function generateAndAddQuestions() {
    const topic = topicInput.value.trim();
    if (!topic) {
        showMessage("Please enter a topic");
        return;
    }

    const newQuestions = await fetchQuestions(topic);
    if (newQuestions) {
        questions = newQuestions; 
        startQuiz(); 
    }
    // Add a delay before allowing another request
    setTimeout(() => {
        isFetching = false;
    }, 5000); // 5-second delay
}

function startQuiz() {
    if (questions.length === 0) {
        showMessage("No questions available. Please generate questions first.");
        return;
        
    }
     // Hide the "Start Quiz" button, topic input, and "Generate Question" button
     startQuizButton.style.display = "none";
     topicInput.style.display = "none";
     generateQuestionButton.style.display = "none";

     // Show the quiz board
    board.style.display = "block";
    nextButton.style.display = "block";

    // Reset quiz state
    currentQuestionIndex = 0;
    score = 0;
    nextButton.innerHTML = "Next";
 
    showQuestion();
    
}

function showQuestion() {
    resetState();
    startTimer();
    let currentQuestion = questions[currentQuestionIndex];
    let questionNo = currentQuestionIndex + 1;
    questionElement.innerHTML = questionNo + ". " + currentQuestion.question;

    // Shuffle the answers to randomize their order
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

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function startTimer() {
    character.style.animation = 'none';
    void character.offsetWidth; // Force reflow to restart animation
    character.style.animation = 'moveCharacter 20s linear forwards';

    timer = setTimeout(() => {
        handleTimeOut();
    }, 2000); // 20 seconds timer
}

function handleTimeOut() {
    if (questions.length > 0) { // Only play sound if the quiz is active
        wrongSound();
        disableAllButtons();
        nextButton.style.display = "block";
    }
}

// Function to disable all answer buttons
function disableAllButtons() {
    Array.from(answerButtons.children).forEach(button => {
        button.disabled = true;
    });
}

function resetState() {
    clearTimeout(timer);
    character.style.animation = 'none';
    nextButton.style.display = "none";
    while (answerButtons.firstChild) {
        answerButtons.removeChild(answerButtons.firstChild);
    }
}

function dingSound() {
    let ding = new Audio('sounds/bright-notifications-151766.mp3');
    ding.play();
}

function wrongSound() {
    let wrong = new Audio('sounds/wrong-answer-21-199825.mp3');
    wrong.play();
}

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

function showScore() {
    resetState();
    let userScore = `You scored ${score} out of ${questions.length}.`;
    questionElement.innerHTML = userScore;
    questionElement.style.textAlign = "center"; 
    nextButton.innerHTML = "Play Again?";
    nextButton.style.display = "block";
    // backgroundMusic.pause(); // Pause joyful music
    // Reset the UI to its initial state
    document.getElementById("quiz-controls").style.display = "block";
    document.getElementById("start-quiz").style.display = "block";
    board.style.display = "none";
}

function handleNextButton() {
    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) {
        showQuestion();
    } else {
        showScore();
    }
}

/*----------------------------- Event Listeners -----------------------------*/
nextButton.addEventListener("click", () => {
    if (currentQuestionIndex < questions.length) {
        handleNextButton();
    } else {
        // Reset the quiz
        questions = []; // Clear the questions array
        startQuiz(); // Restart the quiz
    }
});


document.addEventListener("DOMContentLoaded", () => {
    backgroundMusic.play(); // Start background music when the page loads
});

// Event Listeners for Animal Selection
animalOptions.forEach(option => {
    option.addEventListener("click", () => {
        // Remove selected class from all options
        animalOptions.forEach(opt => opt.classList.remove("selected"));
        // Add selected class to the clicked option
        option.classList.add("selected");
        // Update the selected character
        selectedCharacter = option.getAttribute("data-emoji");
        characterElement.textContent = selectedCharacter;
    });
});

// Event Listener for Generate Questions Button
generateQuestionButton.addEventListener("click", generateAndAddQuestions);

// Event Listener for Start Quiz Button
startQuizButton.addEventListener("click", () => {
    startQuiz();
    board.style.display = "block";
    character.textContent = selectedCharacter;
    startTimer();
    // Start the quiz
    backgroundMusic.play()
   
    
});
