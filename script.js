const canvas = document.getElementById('dotCanvas');
const ctx = canvas.getContext('2d');

let dots = [];
let currentDotIndex = 0;
let drawing = false;
let level = 0;
let timer;
let timeLeft = 30; 

const levels = [
    { count: 3 }, // Level 1 - 3 dots
    { count: 4 }, // Level 2 - 4 dots
    { count: 5 }, // Level 3 - 5 dots
    { count: 6 }, // Level 4 - 6 dots
    { count: 7 }, // Level 5 - 7 dots
    { count: 8 }  // Level 6 - 8 dots
];

// Function to generate a random color
function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

//colors
function createRandomDots(count) {
    dots = [];
    const dotSpacing = 80; 
    for (let i = 0; i < count; i++) {
        let newDot;
        let valid = false;
        while (!valid) {
            newDot = {
                x: Math.random() * (canvas.width - 40) + 20,
                y: Math.random() * (canvas.height - 40) + 20,
                color: getRandomColor(),
                number: i + 1
            };
            valid = dots.every(dot => {
                const distance = Math.hypot(dot.x - newDot.x, dot.y - newDot.y);
                return distance > dotSpacing;
            });
        }
        dots.push(newDot);
    }
    drawDots();
}

//dots on canvas
function drawDots() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    dots.forEach(dot => {
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, 10, 0, Math.PI * 2);
        ctx.fillStyle = dot.color;
        ctx.fill();
        ctx.closePath();
        
        ctx.fillStyle = 'black';
        ctx.font = '16px Arial';
        ctx.fillText(dot.number, dot.x - 5, dot.y + 4);
    });
}

// Timer 
function startTimer() {
    timeLeft = 30; // Reset to 30 seconds
    const timerDisplay = document.getElementById('timerDisplay');
    
    timer = setInterval(() => {
        if (timeLeft <= 0) {
            clearInterval(timer);
            drawing = false;
            document.getElementById('instructions').textContent = "Time's up! Game over!";
            document.getElementById('resetButton').disabled = false; // Enable reset button
        } else {
            // Change text color based on remaining time
            if (timeLeft <= 10) {
                timerDisplay.style.color = 'red'; // Change to red for the last 10 seconds
            } else {
                timerDisplay.style.color = '#FFD700'; // Gold color for normal countdown
            }
            timerDisplay.textContent = `Time left: ${timeLeft--} seconds`;
        }
    }, 1000);
}

// Start the game
document.getElementById('startButton').addEventListener('click', () => {
    document.getElementById('startPage').style.display = 'none'; // Hide start page
    document.getElementById('gamePage').style.display = 'block'; // Show game page

    level = 0; // Start at level 0
    createRandomDots(levels[level].count);
    drawing = true;
    currentDotIndex = 0;
    document.getElementById('instructions').textContent = "Connect the dots in order!";

    // Play background music
    const backgroundMusic = document.getElementById('backgroundMusic');
    backgroundMusic.play();

    startTimer(); // Start the timer
});

// Reset the game
document.getElementById('resetButton').addEventListener('click', () => {
    // Clear game state
    drawing = false;
    currentDotIndex = 0;
    dots = [];
    clearInterval(timer); // Clear the timer
    
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Show start page and hide game page
    document.getElementById('startPage').style.display = 'flex'; // Show start page
    document.getElementById('gamePage').style.display = 'none'; // Hide game page
    
    document.getElementById('instructions').textContent = "Click 'Start' to begin connecting the dots!";
    document.getElementById('timerDisplay').textContent = ""; // Clear timer display

    // Stop background music
    const backgroundMusic = document.getElementById('backgroundMusic');
    backgroundMusic.pause();
    backgroundMusic.currentTime = 0; // Reset music to start
});

// Handle mouse click to connect dots
canvas.addEventListener('click', (event) => {
    if (!drawing) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const currentDot = dots[currentDotIndex];
    const distance = Math.hypot(currentDot.x - x, currentDot.y - y);

    
    if (distance < 20  ) {
        // Draw line to the dot
        if (currentDotIndex > 0) {
            ctx.beginPath();
            ctx.moveTo(dots[currentDotIndex - 1].x, dots[currentDotIndex - 1].y);
            ctx.lineTo(currentDot.x, currentDot.y);
            ctx.strokeStyle = 'blue';
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.closePath();
        }

        currentDotIndex++;

        // Check if the level is completed
        if (currentDotIndex === dots.length) {
            clearInterval(timer); // Stop the timer
            document.getElementById('instructions').textContent = `Level ${level + 1} completed! Click to continue to the next level.`;
            setTimeout(() => {
                level++;
                if (level < levels.length) {
                    createRandomDots(levels[level].count);
                    currentDotIndex = 0;
                    document.getElementById('instructions').textContent = `Level ${level + 1}: Connect the dots in order!`;
                    startTimer(); // Restart the timer for the next level
                } else {
                    drawing = false;
                    document.getElementById('instructions').textContent = "You completed all levels! Great job!";
                    document.getElementById('resetButton').disabled = false; // Enable reset button
                }
            }, 2000); // Delay before moving to the next level
        }
    } else {
        // Show error message for incorrect click
        document.getElementById('instructions').textContent = "Incorrect dot! Click the next dot in order.";
    }
});
