const navbar = document.getElementById('navbar');

window.addEventListener('scroll', function () {
    if (window.scrollY > 40) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

const display = document.getElementById('stopwatch-display');
const startBtn = document.getElementById('start-btn');
const pauseBtn = document.getElementById('pause-btn');
const resetBtn = document.getElementById('reset-btn');
const lapBtn = document.getElementById('lap-btn');
const lapsList = document.getElementById('laps-list');

let startTime = 0;
let elapsedTime = 0;
let timerInterval = null;
let isRunning = false;
let lapCounter = 1;

function formatTime(ms) {
    let totalSeconds = Math.floor(ms / 1000);
    let hours = Math.floor(totalSeconds / 3600);
    let minutes = Math.floor((totalSeconds % 3600) / 60);
    let seconds = totalSeconds % 60;
    let centiseconds = Math.floor((ms % 1000) / 10);

    let h = String(hours).padStart(2, '0');
    let m = String(minutes).padStart(2, '0');
    let s = String(seconds).padStart(2, '0');
    let cs = String(centiseconds).padStart(2, '0');

    return `${h}:${m}:${s}.${cs}`;
}

function updateStopwatch() {
    elapsedTime = Date.now() - startTime;
    display.textContent = formatTime(elapsedTime);
}

startBtn.addEventListener('click', function () {
    if (!isRunning) {
        startTime = Date.now() - elapsedTime;
        timerInterval = setInterval(updateStopwatch, 10);
        isRunning = true;
    }
});

pauseBtn.addEventListener('click', function () {
    if (isRunning) {
        clearInterval(timerInterval);
        isRunning = false;
    }
});

resetBtn.addEventListener('click', function () {
    clearInterval(timerInterval);
    isRunning = false;
    elapsedTime = 0;
    lapCounter = 1;
    display.textContent = '00:00:00.00';
    lapsList.innerHTML = '';
});

lapBtn.addEventListener('click', function () {
    if (elapsedTime > 0) {
        const li = document.createElement('li');
        li.innerHTML = `<span>Lap ${lapCounter}</span><span>${formatTime(elapsedTime)}</span>`;
        lapsList.prepend(li);
        lapCounter++;
    }
});

const cells = document.querySelectorAll('.cell');
const gameStatus = document.getElementById('game-status');
const restartGameBtn = document.getElementById('restart-game-btn');
const gameModeSelect = document.getElementById('game-mode');
const xScoreElem = document.getElementById('x-score');
const oScoreElem = document.getElementById('o-score');
const drawScoreElem = document.getElementById('draw-score');

let boardState = ['', '', '', '', '', '', '', '', ''];
let currentPlayer = 'X';
let isGameActive = true;
let xWins = 0;
let oWins = 0;
let draws = 0;

const winPatterns = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
];

function checkWinner() {
    for (let pattern of winPatterns) {
        const [a, b, c] = pattern;
        if (boardState[a] && boardState[a] === boardState[b] && boardState[a] === boardState[c]) {
            return boardState[a];
        }
    }
    if (!boardState.includes('')) {
        return 'draw';
    }
    return null;
}

function handleCellClick(e) {
    const clickedCell = e.target;
    const index = parseInt(clickedCell.getAttribute('data-index'));

    if (boardState[index] !== '' || !isGameActive) {
        return;
    }

    makeMove(index, currentPlayer);

    const result = checkWinner();
    if (result) {
        endGame(result);
        return;
    }

    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    gameStatus.textContent = `Player ${currentPlayer}'s Turn`;

    if (gameModeSelect.value === 'pvc' && currentPlayer === 'O' && isGameActive) {
        setTimeout(computerMove, 300);
    }
}

function makeMove(index, player) {
    boardState[index] = player;
    cells[index].textContent = player;
    cells[index].classList.add(player.toLowerCase());
}

function computerMove() {
    if (!isGameActive) return;

    let availableMoves = [];
    for (let i = 0; i < boardState.length; i++) {
        if (boardState[i] === '') {
            availableMoves.push(i);
        }
    }

    if (availableMoves.length === 0) return;

    let chosenMove = -1;

    for (let move of availableMoves) {
        boardState[move] = 'O';
        if (checkWinner() === 'O') {
            chosenMove = move;
            boardState[move] = '';
            break;
        }
        boardState[move] = '';
    }

    if (chosenMove === -1) {
        for (let move of availableMoves) {
            boardState[move] = 'X';
            if (checkWinner() === 'X') {
                chosenMove = move;
                boardState[move] = '';
                break;
            }
            boardState[move] = '';
        }
    }

    if (chosenMove === -1) {
        if (availableMoves.includes(4)) {
            chosenMove = 4;
        } else {
            chosenMove = availableMoves[Math.floor(Math.random() * availableMoves.length)];
        }
    }

    makeMove(chosenMove, 'O');

    const result = checkWinner();
    if (result) {
        endGame(result);
        return;
    }

    currentPlayer = 'X';
    gameStatus.textContent = "Player X's Turn";
}

function endGame(result) {
    isGameActive = false;
    if (result === 'draw') {
        gameStatus.textContent = "It's a Draw!";
        draws++;
        drawScoreElem.textContent = draws;
    } else {
        gameStatus.textContent = `Player ${result} Wins!`;
        if (result === 'X') {
            xWins++;
            xScoreElem.textContent = xWins;
        } else {
            oWins++;
            oScoreElem.textContent = oWins;
        }
    }
}

function restartGame() {
    boardState = ['', '', '', '', '', '', '', '', ''];
    currentPlayer = 'X';
    isGameActive = true;
    gameStatus.textContent = "Player X's Turn";
    cells.forEach(cell => {
        cell.textContent = '';
        cell.classList.remove('x', 'o');
    });
}

cells.forEach(cell => cell.addEventListener('click', handleCellClick));
restartGameBtn.addEventListener('click', restartGame);
gameModeSelect.addEventListener('change', restartGame);

const todoForm = document.getElementById('todo-form');
const todoInput = document.getElementById('todo-input');
const todoDatetime = document.getElementById('todo-datetime');
const todoList = document.getElementById('todo-list');
const taskCount = document.getElementById('task-count');
const clearCompletedBtn = document.getElementById('clear-completed-btn');

let todos = [];

function formatDateTime(datetimeString) {
    if (!datetimeString) return '';
    const date = new Date(datetimeString);
    if (isNaN(date.getTime())) return datetimeString;
    return date.toLocaleString([], {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function renderTodos() {
    todoList.innerHTML = '';
    taskCount.textContent = `Total: ${todos.length}`;

    todos.forEach(todo => {
        const li = document.createElement('li');
        li.className = `todo-item ${todo.completed ? 'completed' : ''}`;

        const leftDiv = document.createElement('div');
        leftDiv.className = 'todo-left';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = todo.completed;
        checkbox.addEventListener('change', function () {
            todo.completed = checkbox.checked;
            renderTodos();
        });

        const detailsDiv = document.createElement('div');
        detailsDiv.className = 'todo-details';

        const textSpan = document.createElement('span');
        textSpan.className = 'todo-text';
        textSpan.textContent = todo.text;

        const timeSpan = document.createElement('span');
        timeSpan.className = 'todo-time';
        timeSpan.textContent = formatDateTime(todo.datetime);

        detailsDiv.appendChild(textSpan);
        detailsDiv.appendChild(timeSpan);

        leftDiv.appendChild(checkbox);
        leftDiv.appendChild(detailsDiv);

        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'todo-actions';

        const editBtn = document.createElement('button');
        editBtn.className = 'btn-small btn-edit';
        editBtn.textContent = 'Edit';
        editBtn.addEventListener('click', function () {
            const newText = prompt('Edit task title:', todo.text);
            if (newText !== null && newText.trim() !== '') {
                todo.text = newText.trim();
                const newTime = prompt('Edit task date & time (YYYY-MM-DDTHH:MM):', todo.datetime);
                if (newTime !== null && newTime.trim() !== '') {
                    todo.datetime = newTime.trim();
                }
                renderTodos();
            }
        });

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn-small btn-delete';
        deleteBtn.textContent = 'Delete';
        deleteBtn.addEventListener('click', function () {
            todos = todos.filter(t => t.id !== todo.id);
            renderTodos();
        });

        actionsDiv.appendChild(editBtn);
        actionsDiv.appendChild(deleteBtn);

        li.appendChild(leftDiv);
        li.appendChild(actionsDiv);

        todoList.appendChild(li);
    });
}

todoForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const text = todoInput.value.trim();
    const datetime = todoDatetime.value;

    if (text === '') return;

    todos.push({
        id: Date.now(),
        text: text,
        datetime: datetime,
        completed: false
    });

    todoInput.value = '';
    todoDatetime.value = '';
    renderTodos();
});

clearCompletedBtn.addEventListener('click', function () {
    todos = todos.filter(t => !t.completed);
    renderTodos();
});

const now = new Date();
now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
todoDatetime.min = now.toISOString().slice(0, 16);
