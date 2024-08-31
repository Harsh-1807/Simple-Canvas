const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = canvas.clientWidth;
canvas.height = canvas.clientHeight;

let tool = 'brush';
let drawing = false;
let startX, startY;
let savedImageData;
let history = [];
let redoStack = [];

const colorPicker = document.getElementById("colorPicker");
const brushSize = document.getElementById("brushSize");
let color = colorPicker.value;
let size = brushSize.value;

colorPicker.addEventListener('input', () => {
    color = colorPicker.value;
});

brushSize.addEventListener('input', () => {
    size = brushSize.value;
});

document.getElementById("brushTool").addEventListener('click', () => tool = 'brush');
document.getElementById("eraserTool").addEventListener('click', () => tool = 'eraser');
document.getElementById("textTool").addEventListener('click', () => tool = 'text');
document.getElementById("rectangleTool").addEventListener('click', () => tool = 'rectangle');
document.getElementById("circleTool").addEventListener('click', () => tool = 'circle');
document.getElementById("gradientTool").addEventListener('click', () => tool = 'gradient');

document.getElementById("clearCanvas").addEventListener('click', clearCanvas);
document.getElementById("saveCanvas").addEventListener('click', saveCanvas);
document.getElementById("undo").addEventListener('click', undo);
document.getElementById("redo").addEventListener('click', redo);

canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mousemove', draw);

function startDrawing(e) {
    drawing = true;
    startX = e.offsetX;
    startY = e.offsetY;
    if (tool === 'text') {
        addText(e);
        drawing = false;
    } else {
        saveState();
    }
}

function stopDrawing() {
    if (tool !== 'text') {
        drawing = false;
        ctx.beginPath();
    }
}

function draw(e) {
    if (!drawing) return;

    ctx.lineWidth = size;
    ctx.lineCap = "round";

    if (tool === 'brush') {
        ctx.strokeStyle = color;
        ctx.lineTo(e.offsetX, e.offsetY);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(e.offsetX, e.offsetY);
    } else if (tool === 'eraser') {
        ctx.strokeStyle = '#fff';
        ctx.lineTo(e.offsetX, e.offsetY);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(e.offsetX, e.offsetY);
    } else if (tool === 'rectangle') {
        drawRectangle(e);
    } else if (tool === 'circle') {
        drawCircle(e);
    } else if (tool === 'gradient') {
        drawGradient(e);
    }
}

function addText(e) {
    const text = prompt("Enter text:");
    if (text) {
        ctx.fillStyle = color;
        ctx.font = `${size * 2}px Arial`;
        ctx.fillText(text, e.offsetX, e.offsetY);
        saveState();
    }
}

function drawRectangle(e) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.putImageData(savedImageData, 0, 0);
    ctx.strokeStyle = color;
    const width = e.offsetX - startX;
    const height = e.offsetY - startY;
    ctx.strokeRect(startX, startY, width, height);
}

function drawCircle(e) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.putImageData(savedImageData, 0, 0);
    ctx.strokeStyle = color;
    const radius = Math.hypot(e.offsetX - startX, e.offsetY - startY);
    ctx.beginPath();
    ctx.arc(startX, startY, radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.closePath();
}

function drawGradient(e) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.putImageData(savedImageData, 0, 0);

    const gradient = ctx.createLinearGradient(startX, startY, e.offsetX, e.offsetY);
    gradient.addColorStop(0, color);
    gradient.addColorStop(1, '#fff');

    ctx.fillStyle = gradient;
    ctx.fillRect(startX, startY, e.offsetX - startX, e.offsetY - startY);
}

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    saveState();
}

function saveCanvas() {
    const data = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = data;
    link.download = "drawing.png";
    link.click();
}

function undo() {
    if (history.length > 0) {
        redoStack.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
        const previousState = history.pop();
        ctx.putImageData(previousState, 0, 0);
    }
}

function redo() {
    if (redoStack.length > 0) {
        history.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
        const nextState = redoStack.pop();
        ctx.putImageData(nextState, 0, 0);
    }
}

function saveState() {
    history.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    redoStack = [];
    savedImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
}
