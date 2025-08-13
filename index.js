// DOM element variables
const addTaskBtn = document.getElementById('addTaskBtn');
const taskInput = document.getElementById('taskInput');
const taskList = document.getElementById('task-list');
const startBtn = document.getElementById('start-btn');
const pauseBtn = document.getElementById('pause-btn');
const resetBtn = document.getElementById('reset-btn');

//TODO- refactor
const xpBar = document.getElementById('xp-bar');
const xpText = document.getElementById('xp-text');
const levelDisplay = document.getElementById('level-display');

let timer;
let isRunning = false;
let timeLeftInSeconds = 25 * 60;

// XP and Level variables
let currentLevel = parseInt(localStorage.getItem('currentLevel')) || 1;
let currentXP = parseInt(localStorage.getItem('currentXP')) || 0;
let xpToLevelUp = parseInt(localStorage.getItem('xpToLevelUp')) || 100;

async function setBackground() {
    try {
        const response = await fetch("https://apis.scrimba.com/unsplash/photos/random?orientation=landscape&query=space");
        if (!response.ok) {
            throw new Error("Failed to fetch background image");
        }
        const data = await response.json();
        document.body.style.backgroundImage = `url(${data.urls.regular})`;
        document.getElementById("author").textContent = `By: ${data.user.name}`;
    } catch (err) {
        console.error(err);
        document.body.style.backgroundImage = `url(https://images.unsplash.com/photo-1560008511-11c63416e52d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwyMTEwMjl8MHwxfHJhbmRvbXx8fHx8fHx8fDE2MjI4NDIxMTc&ixlib=rb-1.2.1&q=80&w=1080)`;
        document.getElementById("author").textContent = `By: Dodi Achmad`;
    }
}

function getCurrentTime() {
    const date = new Date();
    document.getElementById("time").textContent = date.toLocaleTimeString("en-us", {
        timeStyle: "short"
    });
}

async function fetchWeather() {
    try {
        const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject);
        });
        const response = await fetch(`https://apis.scrimba.com/openweathermap/data/2.5/weather?lat=${position.coords.latitude}&lon=${position.coords.longitude}&units=imperial`);
        if (!response.ok) {
            throw new Error("Weather data not available");
        }
        const data = await response.json();
        const iconUrl = `http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
        document.getElementById("weather").innerHTML = `
            <img src=${iconUrl} />
            <p class="weather-temp">${Math.round(data.main.temp)}º</p>
            <p class="weather-city">${data.name}</p>
        `;
    } catch (err) {
        console.error(err);
    }
}

function getDailyQuote() {
    fetch("quotes.json")
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            const randomIndex = Math.floor(Math.random() * data.length);
            const quote = data[randomIndex];
            const quoteText = document.getElementById("quote-text");
            const quoteAuthor = document.getElementById("quote-author");
            
            quoteText.textContent = `"${quote.text}"`; 
            quoteAuthor.textContent = `- ${quote.author || 'Unknown'}`; 
        })
        .catch(error => {            console.error('Error fetching quote:', error);
            // Fallback quote
            document.getElementById("quote-text").textContent = `"The impediment to action advances action. What stands in the way becomes the way."`;
            document.getElementById("quote-author").textContent = `- Marcus Aurelius`;
        });
}

function updateTimerDisplay() {
    const minutes = Math.floor(timeLeftInSeconds / 60);
    const seconds = timeLeftInSeconds % 60;
    const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    document.getElementById("timer-display").textContent = formattedTime;
}

function startTimer() {
    if (!isRunning) {
        isRunning = true;
        timer = setInterval(() => {
            if (timeLeftInSeconds > 0) {
                timeLeftInSeconds--;
                updateTimerDisplay();
            } else {
                clearInterval(timer);
                isRunning = false;
                alert("Time's up! Take a break.");
            }
        }, 1000);
    }
}

function pauseTimer() {
    clearInterval(timer);
    isRunning = false;
}

function resetTimer() {
    clearInterval(timer);
    isRunning = false;
    timeLeftInSeconds = 25 * 60;
    updateTimerDisplay();
}

// Local Storage Functions
function saveTasks(tasks) {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function deleteTask(index) {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks.splice(index, 1);
    saveTasks(tasks);
    
    // Add XP when a task is deleted
    addXP(10); // Grant 10 XP for each completed task
    
    renderTasksFromLocalStorage();
}

function renderTasksFromLocalStorage() {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    taskList.innerHTML = '';
    if (tasks.length > 0) {
        tasks.forEach((taskTitle, index) => {
            const li = document.createElement('li');
            const span = document.createElement('span');
            span.textContent = taskTitle;
            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = '✖';
            deleteBtn.classList.add('delete-btn');
            deleteBtn.addEventListener('click', () => deleteTask(index));
            
            li.appendChild(span);
            li.appendChild(deleteBtn);
            taskList.appendChild(li);
        });
    } else {
        taskList.innerHTML = '<li>No quests found.</li>';
    }
}

function handleAddTask() {
    const taskTitle = taskInput.value.trim();
    if (taskTitle === '') {
        return;
    }
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks.push(taskTitle);
    saveTasks(tasks);
    taskInput.value = '';
    renderTasksFromLocalStorage();
}

// XP Bar Functions
function addXP(amount) {
    currentXP += amount;
    
    while (currentXP >= xpToLevelUp) {
        currentXP -= xpToLevelUp;
        currentLevel++;
        xpToLevelUp = Math.floor(xpToLevelUp * 1.1); // Increase XP needed by 10%
    }
    
    localStorage.setItem('currentLevel', currentLevel);
    localStorage.setItem('currentXP', currentXP);
    localStorage.setItem('xpToLevelUp', xpToLevelUp);
    
    updateXPBar();
}

function updateXPBar() {
    const xpPercentage = (currentXP / xpToLevelUp) * 100;
    xpBar.style.width = `${xpPercentage}%`;
    xpText.textContent = `${currentXP} / ${xpToLevelUp} XP`;
    levelDisplay.textContent = `Level ${currentLevel}`;
}


setBackground();
setInterval(getCurrentTime, 1000);
fetchWeather();
getDailyQuote();
updateTimerDisplay();
renderTasksFromLocalStorage();
updateXPBar(); // Initial call to display the XP bar

startBtn.addEventListener('click', startTimer);
pauseBtn.addEventListener('click', pauseTimer);
resetBtn.addEventListener('click', resetTimer);
addTaskBtn.addEventListener('click', handleAddTask);

// New event listener for the Enter key on the task input field
taskInput.addEventListener('keydown', function(event) {
    // Check if the key pressed is "Enter" (keyCode 13)
    if (event.key === 'Enter') {
        event.preventDefault(); // Prevents the default action, like a form submission
        handleAddTask();
    }
});