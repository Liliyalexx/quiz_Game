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
let questions = []; 
let score = 0;
let timer;
let selectedCharacter = "🐶"; 
let isFetching = false; 

/*-------------------------------- Helper Functions --------------------------------*/

function showMessage(message) {
    messageContainer.textContent = message;
    setTimeout(() => {
        messageContainer.textContent = ""; 
    }, 2000);
}


function getCategoryId(category) {
    return categoryMap[category] || 9; 
}


function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}


function dingSound() {
    let ding = new Audio('sounds/bright-notifications-151766.mp3');
    ding.play();
}


function wrongSound() {
    let wrong = new Audio('sounds/wrong-answer-21-199825.mp3');
    wrong.play();
}


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

function startQuiz() {
    if (questions.length === 0) {
        showMessage("No questions available. Please generate questions first.");
        return;
    }
    currentQuestionIndex = 0;
    score = 0;
    nextButton.innerHTML = "Next";
    
  const resultMessage = document.getElementById("result-message");
  resultMessage.style.display = "none";


  generateQuestionButton.style.display = "none";


  nextButton.style.display = "none"; 
    showQuestion();
}

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

function handleNextButton() {
    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) {
        showQuestion();
    } else {
        showScore();
        
    }
}

function showScore() {
    resetState();
    let userScore = `You scored ${score} out of ${questions.length}.`;
    questionElement.innerHTML = userScore;
    questionElement.style.textAlign = "center";
    nextButton.innerHTML = "Play Again?";
    nextButton.style.display = "block";
    backgroundMusic.pause(); 

const resultMessage = document.getElementById("result-message");
resultMessage.style.display = "block"; 

if (score >= questions.length * 0.7) { 
  resultMessage.textContent = "Congratulations! You won! 🎉";
  resultMessage.style.color = "#08853e"; 
} else { 
  resultMessage.textContent = "Sorry, you lost. Try again! 😢";
  resultMessage.style.color = "#c54205";
}

// Add event listener for the "Play Again" button
nextButton.removeEventListener("click", handleNextButton);
nextButton.addEventListener("click", resetGame); 
}

function resetGame() {
    window.location.reload();
    questions = [];
    currentQuestionIndex = 0;
    score = 0;

    characterSelection.style.display = "block"; 
    document.getElementById("quiz-controls").style.display = "block"; 
    generateQuestionButton.style.display = "block"; 
    nextButton.style.display = "none";
  
    const resultMessage = document.getElementById("result-message");
    resultMessage.style.display = "none";
  }

/*-------------------------------- Timer Functions --------------------------------*/

function startTimer() {
    character.style.animation = 'none';
    void character.offsetWidth; 
    character.style.animation = 'moveCharacter 20s linear forwards';

    timer = setTimeout(() => {
        handleTimeOut();
    }, 20000); 
}
function handleTimeOut() {
    if (questions.length > 0) {
        wrongSound();
        disableAllButtons();
        nextButton.style.display = "block";
    }
}
function resetState() {
    clearTimeout(timer);
    character.style.animation = 'none';
    nextButton.style.display = "none";
    while (answerButtons.firstChild) {
        answerButtons.removeChild(answerButtons.firstChild);
    }
}
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
animalOptions.forEach(option => {
    option.addEventListener("click", () => {
        animalOptions.forEach(opt => opt.classList.remove("selected"));
        option.classList.add("selected");
        selectedCharacter = option.getAttribute("data-emoji");
        characterElement.textContent = selectedCharacter;
    });
});
startQuizButton.addEventListener("click", () => {
    board.style.display = "block";
    characterElement.textContent = selectedCharacter;
    startQuizButton.style.display = "none";
    nextButton.style.display = "block";
    startQuiz();
});

nextButton.addEventListener("click", () => {
    if (currentQuestionIndex < questions.length) {
        handleNextButton();
    } else {
        startQuiz();
        
    }
});

generateQuestionButton.addEventListener("click", generateAndAddQuestions);

muteButton.addEventListener('click', toggleMute);

window.addEventListener("load", () => {
    startBackgroundMusic();
});

document.addEventListener("click", () => {
    if (backgroundMusic.paused) {
        startBackgroundMusic();
    }
});

