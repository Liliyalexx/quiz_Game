/*-------------------------------- Constants --------------------------------*/
// const questions = [
//     {
//         question: "Who is considered the father of Artificial Intelligence?",
//         answers: [
//             {text: "Alan Turing", correct: false},
//             {text: "John McCarthy", correct: true},
//             {text: "Elon Musk", correct: false},
//             {text: "Geoffrey Hinton", correct: false},
//         ]
//     },
//     {
//         question: "What does AI stand for?",
//         answers: [
//             {text: "Automated Intelligence", correct: false},
//             {text: "Artificial Innovation", correct: false},
//             {text: "Artificial Intelligence", correct: true},
//             {text: "Automated Interaction", correct: false},
//         ]        
//     },
//     {
//         question: "Which type of AI is capable of performing a specific task but lacks general intelligence?",
//         answers: [
//             {text: "Artificial General Intelligence (AGI)", correct: false},
//             {text: "Artificial Super Intelligence (ASI)", correct: false},
//             {text: "Narrow AI (ANI)", correct: true},
//             {text: "Strong AI", correct: false},
//         ]        
//     },
//     {
//         question: "Which AI model is commonly used for natural language processing?",
//         answers: [
//             {text: "Convolutional Neural Network (CNN)", correct: false},
//             {text: "Recurrent Neural Network (RNN)", correct: false},
//             {text: "Transformer Model", correct: true},
//             {text: "Decision Tree", correct: false},
//         ]        
//     },
//     {
//         question: "What is the name of the AI that defeated a world champion in the board game Go?",
//         answers: [
//             {text: "DeepMind AI", correct: false},
//             {text: "AlphaGo", correct: true},
//             {text: "OpenAI Five", correct: false},
//             {text: "IBM Watson", correct: false},
//         ]        
//     },
//     {
//         question: "Which company created the GPT (Generative Pre-trained Transformer) series of AI models?",
//         answers: [
//             {text: "Google", correct: false},
//             {text: "OpenAI", correct: true},
//             {text: "Microsoft", correct: false},
//             {text: "IBM", correct: false},
//         ]        
//     },
//     {
//         question: "Which AI approach mimics the way the human brain processes information?",
//         answers: [
//             {text: "Rule-Based Systems", correct: false},
//             {text: "Neural Networks", correct: true},
//             {text: "Expert Systems", correct: false},
//             {text: "Genetic Algorithms", correct: false},
//         ]        
//     },
//     {
//         question: "Which term describes AI systems that improve performance over time by learning from data?",
//         answers: [
//             {text: "Deep Learning", correct: false},
//             {text: "Reinforcement Learning", correct: false},
//             {text: "Machine Learning", correct: true},
//             {text: "Expert Systems", correct: false},
//         ]        
//     },
//     {
//         question: "Which AI algorithm is commonly used for image recognition?",
//         answers: [
//             {text: "Random Forest", correct: false},
//             {text: "K-Means Clustering", correct: false},
//             {text: "Convolutional Neural Networks (CNNs)", correct: true},
//             {text: "Support Vector Machines (SVMs)", correct: false},
//         ]        
//     },
//     {
//         question: "Which of the following is a major ethical concern regarding AI?",
//         answers: [
//             {text: "Too much automation", correct: false},
//             {text: "Bias in decision-making", correct: true},
//             {text: "High electricity usage", correct: false},
//             {text: "Slow processing speed", correct: false},
//         ]        
//     }
// ];



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
async function fetchQuestion(topic) {
    try {
        const response = await fetch("http://localhost:5501/generate-question", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ topic }),
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch question: ${response.statusText}`);
        }

        const data = await response.json();
        return {
            question: data.question,
            answers: data.options.map((option, index) => ({
                text: option,
                correct: index === data.options.indexOf(data.correctAnswer),
            })),
        };
    } catch (error) {
        console.error("Error fetching question:", error);
        alert("Failed to fetch question. Please try again.");
        return null;
    }
}

// Generate a new question and add it to the quiz
async function generateAndAddQuestion() {
    const topic = topicInput.value.trim();
    if (!topic) {
        alert("Please enter a topic");
        return;
    }

    const newQuestion = await fetchQuestion(topic);
    if (newQuestion) {
        questions.push(newQuestion);
        showQuestion();
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

    currentQuestion.answers.forEach(answer => {
        const button = document.createElement("button");
        button.innerHTML = answer.text;
        button.classList.add("btn");
        answerButtons.appendChild(button);
        if(answer.correct){
            button.dataset.correct = answer.correct;
        }
        button.addEventListener("click", selectAnswer);
    });

    startTimer();
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
generateQuestionButton.addEventListener("click", generateAndAddQuestion);

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