window.onload = function() {
    // Fetching the JSON data containing the questions
    fetch('questions.json')
        .then(response => response.json())
        .then(data => {
            const selectedQuestions = getRandomQuestions(data, 50);  // Get 50 random questions
            displayQuestions(selectedQuestions);

            document.getElementById('submit-btn').addEventListener('click', function() {
                const scoreData = calculateScore(selectedQuestions);
                displayResult(scoreData.correctAnswers, scoreData.totalCorrectOptions);
                displayCorrectAnswers(selectedQuestions, scoreData.userAnswers);
            });
        })
        .catch(error => {
            console.error('Error loading the JSON file:', error);
        });
};

// Get 50 random questions
function getRandomQuestions(questions, num) {
    const shuffled = questions.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, num);
}

// Display the questions on the webpage
function displayQuestions(questions) {
    const quizQuestionsDiv = document.getElementById('quiz-questions');
    quizQuestionsDiv.innerHTML = '';  // Clear any existing content

    questions.forEach((q, index) => {
        const correctAnswersCount = q.answer.split(",").length;  // Get the number of correct answers
        const isMultipleChoice = correctAnswersCount > 1;  // Check if it's a multiple-answer question
        const questionHtml = `
            <div class="mb-3" id="question-${index}">
                <h5>Q${index + 1}: ${q.question} ${isMultipleChoice ? `<span class="text-danger">(Select ${correctAnswersCount} options)</span>` : ''}</h5>
                <div>
                    ${q.options.map((option, i) => `
                        <div class="form-check">
                            <input class="form-check-input" type="${isMultipleChoice ? 'checkbox' : 'radio'}" name="question-${index}" id="question-${index}-option-${i}" value="${String.fromCharCode(97 + i)}">
                            <label class="form-check-label" for="question-${index}-option-${i}">
                                ${String.fromCharCode(97 + i)}. ${option}
                            </label>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        quizQuestionsDiv.innerHTML += questionHtml;

        // If multiple-choice, restrict to only allow selecting the exact number of options
        if (isMultipleChoice) {
            const checkboxes = document.querySelectorAll(`input[name="question-${index}"]`);
            checkboxes.forEach(checkbox => {
                checkbox.addEventListener('change', function() {
                    const selectedCheckboxes = document.querySelectorAll(`input[name="question-${index}"]:checked`);
                    if (selectedCheckboxes.length > correctAnswersCount) {
                        checkbox.checked = false;  // Uncheck if more than the allowed options are selected
                        alert(`You can only select ${correctAnswersCount} options for this question.`);
                    }
                });
            });
        }
    });
}

// Calculate the score based on the selected answers
function calculateScore(questions) {
    let correctAnswers = 0;
    let totalCorrectOptions = 0;  // Total correct options across all questions
    let userAnswers = [];  // To store user's selected answers for each question

    questions.forEach((q, index) => {
        const correctAnswersArray = q.answer.split(",");  // Convert the correct answer to an array
        const selectedOptions = Array.from(document.querySelectorAll(`input[name="question-${index}"]:checked`))
            .map(option => option.value);  // Get all selected options

        userAnswers.push(selectedOptions);  // Store the user’s selected options

        totalCorrectOptions += correctAnswersArray.length;  // Total number of correct options for the question
        
        // Check if selected answers match the correct answers (considering order doesn't matter)
        if (arraysEqual(selectedOptions, correctAnswersArray)) {
            correctAnswers += correctAnswersArray.length;  // Add the correct answers count
        }
    });

    return { correctAnswers, totalCorrectOptions, userAnswers };
}

// Helper function to compare two arrays regardless of the order
function arraysEqual(arr1, arr2) {
    return arr1.sort().join(',') === arr2.sort().join(',');
}

// Display the result and pass/fail status
function displayResult(correctAnswers, totalCorrectOptions) {
    const resultDiv = document.getElementById('result');
    const percentage = (correctAnswers / totalCorrectOptions) * 100;
    const passOrFail = percentage >= 90 ? "Pass" : "Fail";
    
    resultDiv.innerHTML = `
        <h3>Your Score: ${correctAnswers}/${totalCorrectOptions} (${percentage.toFixed(2)}%)</h3>
        <h4>Status: ${passOrFail}</h4>
    `;
}

// Display correct answers after submission with color coding
function displayCorrectAnswers(questions, userAnswers) {
    questions.forEach((q, index) => {
        const correctAnswers = q.answer.split(",");  // Convert correct answer to array
        const questionDiv = document.querySelector(`#question-${index}`);

        q.options.forEach((option, i) => {
            const optionElement = document.querySelector(`#question-${index}-option-${i}`);
            const userSelected = userAnswers[index].includes(String.fromCharCode(97 + i));  // Check if user selected the option
            const isCorrectAnswer = correctAnswers.includes(String.fromCharCode(97 + i));  // Check if this is a correct answer
            
            if (isCorrectAnswer) {
                optionElement.nextElementSibling.style.color = userSelected ? 'green' : 'red';  // Correct if selected green, missed red
            } else if (userSelected && !isCorrectAnswer) {
                optionElement.nextElementSibling.style.color = 'red';  // Incorrect selection
            }
        });

        const answerHtml = `<p><strong>Correct Answer:</strong> ${correctAnswers.map(answer => `${answer}. ${q.options[answer.charCodeAt(0) - 97]}`).join(', ')}</p>`;
        questionDiv.innerHTML += answerHtml;  // Append the correct answer to each question
    });
}
