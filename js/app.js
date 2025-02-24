/*-------------------------------- Constants --------------------------------*/


/*------------------------ Cached Element References ------------------------*/
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
 
let currentQuestionIndex = 0;
let questions = []; // Store AI-generated questions
let score = 0;
let timer;
let selectedCharacter = "🐶"; // Default character
/*-------------------------------- Functions --------------------------------*/

// Fetch AI-generated question
async function fetchQuestions(topic) {
    try {
        const response = await fetch('https://opentdb.com/api.php?amount=10');
        if (!response.ok) {
            throw new Error(`Failed to fetch question: ${response.statusText}`);
        }

        const data = await response.json();
        if (data.response_code !== 0) {
            throw new Error("Failed to fetch questions: API returned an error");
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
        alert("Failed to fetch question. Please try again.");
        return null;
    }
}


// Generate 10 new questions and start the quiz
async function generateAndAddQuestions() {
    const topic = topicInput.value.trim();
    if (!topic) {
        alert("Please enter a topic");
        return;
    }

    const newQuestions = await fetchQuestions(topic);
    if (newQuestions) {
        questions = newQuestions; 
        startQuiz(); 
    }
}

function startQuiz() {
    if (questions.length === 0) {
        alert("No questions available. Please generate questions first.");
        return;
    }
    currentQuestionIndex = 0;
    score = 0;
    nextButton.innerHTML = "Next";
    showQuestion();
}

function showQuestion(){
    resetState();
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

    startTimer();
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}
function startTimer() {
    character.style.animation = 'moveCharacter 20m liner forwars';
    timer = setTimeOut(() => {
        handleTimeOut();
    }, 10000000);
}

function handleTimeOut() {
    wrongSound();
    disableAllButtons();
    nextButton.style.display = "Block";
}

function resetState(){
    nextButton.style.display = "none";
    while(answerButtons.firstChild){
        answerButtons.removeChild(answerButtons.firstChild);
    }
}

function dingSound(){
    let ding = new Audio ('sounds/bright-notifications-151766.mp3');
    ding.play();
}

function wrongSound(){
    let wrong = new Audio ('sounds/wrong-answer-21-199825.mp3');
    wrong.play();
}


function selectAnswer(e){
    const selectedBtn = e.target;
    const isCorrect = selectedBtn.dataset.correct === "true";
    if(isCorrect){
        dingSound();
        selectedBtn.classList.add("correct"); 
        score++;
    }else{
        wrongSound();
        selectedBtn.classList.add("incorrect");
    }
    Array.from(answerButtons.children).forEach(button => {
        if(button.dataset.correct === "true"){
            button.classList.add("correct");
        }
        button.disabled = true;
    });
    nextButton.style.display = "block";

}


function showScore(){
    resetState();
    let userScore = `You scored ${score} out of ${questions.length}.`;
    questionElement.innerHTML = userScore;
    questionElement.style.textAlign = "center"; // Align the text at the center
    nextButton.innerHTML = "Play Again?";
    nextButton.style.display = "block";
    
}


function handleNextButton(){
    currentQuestionIndex++;
    if(currentQuestionIndex < questions.length){
        showQuestion();
    }else{
        showScore();
    }
}

/*----------------------------- Event Listeners -----------------------------*/
nextButton.addEventListener("click", ()=>{
    if(currentQuestionIndex < questions.length){
        handleNextButton();
    }else{
        startQuiz();
    }
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
    });
});

//AI
generateQuestionButton.addEventListener("click", generateAndAddQuestions);

// Event Listener for Start Quiz Button
startQuizButton.addEventListener("click", () => {
    // Hide character selection screen
    characterSelection.style.display = "none";
    // Show quiz board
    board.style.display = "block";
    // Set the selected character
    characterElement.textContent = selectedCharacter;
    // Start the quiz
    startQuiz();
});


startQuiz();