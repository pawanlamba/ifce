function renderQuiz(questions) {
    const quizContainer = document.getElementById('quiz-questions');

    questions.forEach((q, index) => {
        const card = document.createElement('div');
        card.className = 'card p-4';

        const questionTitle = document.createElement('h5');
        questionTitle.textContent = `${index + 1}. ${q.Question}`;
        card.appendChild(questionTitle);

        const optionsGroup = document.createElement('div');
        optionsGroup.className = 'mt-3';

        for (let i = 1; i <= 4; i++) {
            const optionId = `q${index}_opt${i}`;
            const wrapper = document.createElement('div');
            wrapper.className = 'form-check';

            const input = document.createElement('input');
            input.className = 'form-check-input';
            input.type = 'radio';
            input.name = `question${index}`;
            input.id = optionId;
            input.value = i;
            input.onclick = () => handleAnswer(input, q, index);

            const label = document.createElement('label');
            label.className = 'form-check-label option-label';
            label.htmlFor = optionId;
            label.textContent = q[i];

            wrapper.appendChild(input);
            wrapper.appendChild(label);
            optionsGroup.appendChild(wrapper);
        }

        const feedback = document.createElement('div');
        feedback.className = 'feedback text-muted';
        feedback.id = `feedback${index}`;

        card.appendChild(optionsGroup);
        card.appendChild(feedback);
        quizContainer.appendChild(card);
    });
};

function handleAnswer(input, question, index) {
    const selected = input.value;
    const feedback = document.getElementById(`feedback${index}`);
    const options = document.getElementsByName(`question${index}`);

    options.forEach(opt => opt.disabled = true); // Disable all options

    const labels = Array.from(document.querySelectorAll(`input[name="question${index}"]`)).map(input => {
        return document.querySelector(`label[for="${input.id}"]`);
    });

    if (selected === question.correct) {
        input.nextElementSibling.classList.add('correct');
        score++;
        document.getElementById('score').textContent = score;
    } else {
        input.nextElementSibling.classList.add('incorrect');
        const correctInput = Array.from(options).find(opt => opt.value === question.correct);
        if (correctInput) {
            correctInput.nextElementSibling.classList.add('correct');
        }
    }
    // Handle Percentage
    answered++;
    score_percent = (score / answered * 100.0).toFixed(2);
    incorrect = answered - score;
    document.getElementById('incorrect').textContent = incorrect;
    document.getElementById('answered').textContent = answered;
    document.getElementById('score_percent').textContent = score_percent;

    // if all questions are answered then clear the timer
    if (answered >= ques_cnt) {clearInterval(timerInterval)};

    feedback.textContent = "Correct Answer: " + question.correct + ",Explanation: " + question.reason;
};

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    // Generate a random index from 0 to i
    const j = Math.floor(Math.random() * (i + 1));

    // Swap elements at indices i and j
    [array[i], array[j]] = [array[j], array[i]]; // Using array destructuring for swapping
  }
  return array;
};

function shuffleAndUpdate(questionDict) {
  /**
   * Shuffles the answer options ('1', '2', '3', '4') in an object and updates the 'correct' key.
   *
   * @param {Object} questionDict - An object with keys 'Question', '1', '2', '3', '4', 'correct', and 'reason'.
   * @returns {Object} The modified object with shuffled answer options and updated 'correct' key.
   */

  const options = ['1', '2', '3', '4'];
  const correctAnswer = questionDict[questionDict['correct']];

  // Create an array of values and shuffle it
  const values_old = options.map(key => questionDict[key]);
  const values = shuffleArray(values_old);

  // Update the object with the shuffled values and update 'correct' key
  options.forEach((key, index) => {
    questionDict[key] = values[index];
    if (values[index] === correctAnswer) {
      questionDict['correct'] = key;
    }
  });

  return questionDict;
};

function selectRandomElements(arr, n) {
  if (n > arr.length) {
    throw new Error("Cannot select more elements than available in the array.");
  }

  // Create a shallow copy of the array to avoid modifying the original
  let shuffledArray = [...arr];
  shuffledArray = shuffleArray(shuffledArray)

  // Return the first 'n' elements from the shuffled array
  return shuffledArray.slice(0, n);
};

function selectBatchElements(arr, n, batch_size) {
  if (n*batch_size > arr.length) {
  // set the values to beginning of the array
  n=0
  }
  // Return the sliced array
  begin_idx = n*batch_size
  end_idx = begin_idx + batch_size
  console.log("Index of Test:", begin_idx, end_idx)
  return arr.slice(begin_idx, end_idx);
};

function show_quiz(url, qid, rand) {
    if (url) {
      fetch(url)
        .then(response => {
          if (!response.ok) throw new Error("Network response was not ok");
          return response.json();
        })
        .then(json => {
          // select random Sequential questions
          if (rand) {
          console.log("True:",rand)
          questions = selectRandomElements(json, 20);
          } else {
          console.log("False:",rand)
          questions = selectBatchElements(json, qid, 20);
          };
          // render questions
          quesCnt = questions.length
          renderQuiz(questions)

          // set timer vars clear
          clearInterval(timerInterval);
          timeLeft = 72*ques_cnt + 30; // Allocate 72 seconds for each questions
          startTimer()
        })
        .catch(err => {
          console.error("Error fetching or parsing JSON:", err);
          document.getElementById('ErrorBox').textContent = 'Error fetching data.';
        });
    } else {
      document.getElementById('ErrorBox').textContent = 'Missing JSON URL parameter.';
    }
};

// Start the timer
function startTimer() {
    timerInterval = setInterval(() => {
        timeLeft--;
        document.getElementById('timer-text').textContent = formatSecondsToHHMMSS(timeLeft);
        //if (timeLeft <= -72*ques_cnt) {
        //    clearInterval(timerInterval);
        //}
    }, 1000);
};

// Formatting Function
function formatSecondsToHHMMSS(totalSeconds) {
    const abs_sec = Math.abs(totalSeconds)
    const hours = Math.floor(abs_sec / 3600);
    const minutes = Math.floor((abs_sec % 3600) / 60);
    const seconds = abs_sec % 60;

    // Pad single-digit numbers with a leading zero
    const paddedHours = String(hours).padStart(2, '0') + 'h';
    const paddedMinutes = String(minutes).padStart(2, '0') + 'm';
    const paddedSeconds = String(seconds).padStart(2, '0') + 's';

    let time_str = ""
    if (minutes>0 && paddedHours>0){
        time_str =  `${paddedHours} : ${paddedMinutes} : ${paddedSeconds}`;
    } else if (minutes>0){
        time_str =  `${paddedMinutes} : ${paddedSeconds}`;
    } else {
        time_str =  `${paddedSeconds}`;
    }

    if (totalSeconds<0){
        time_str = `${time_str} OverTime !!`;
    }
    return time_str
};