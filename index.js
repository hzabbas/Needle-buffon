const svgContainer = document.getElementById('container');
const needlesInput = document.getElementById('needles-input');
const distanceInput = document.getElementById('distance-input');
const lengthInput = document.getElementById('length-input');
const stopBtn = document.getElementById('stop-btn');
const restartBtn = document.getElementById('restart-btn');
const bigPi = document.getElementById('big-pi');
const smallPi = document.getElementById('small-pi');

let frequency = parseFloat(needlesInput.value);
let distance = parseFloat(distanceInput.value);
let l = parseFloat(lengthInput.value);

needlesInput.addEventListener('input', (ev) => {
    if (parseInt(ev.target.value) !== frequency) {
        frequency = parseInt(ev.target.value);
        stop();
        start();
    }
});

distanceInput.addEventListener('input', (ev) => {
    if (parseInt(ev.target.value) !== distance) {
        distance = parseInt(ev.target.value);
        restart();
    }
});

lengthInput.addEventListener('input', (ev) => {
    if (parseInt(ev.target.value) !== lengthInput) {
        l = parseInt(ev.target.value);
        restart();
    }
});

stopBtn.addEventListener('click', (ev) => {
    if (interval) {
        stop();
        stopBtn.innerText = 'Start';
    } else {
        start();
        stopBtn.innerText = 'Stop';
    }

});

restartBtn.addEventListener('click', (ev) => {
    restart();
});

const margin = { top: 12, right: 30, bottom: 12, left: 30 };

let viewBox = { x: 0, y: 0, w: 1000, h: 600 };
const width = viewBox.w - margin.left - margin.right;
const height = viewBox.h - margin.top - margin.bottom;

document.body.style.background = '#1e1e1e';

const svg = d3.select('#container')
    .append('svg')
    .attr('viewBox', `${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`)
    .attr('width', window.innerWidth - margin.left - margin.right)
    .attr('height', window.innerHeight - margin.top - margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`)
    .attr('color', '#e6e8ea')
    .attr('font-weight', 'bold')
    .attr('stroke-width', 2);

window.addEventListener('resize', function (event) {
    d3.select('svg').attr('viewBox', `${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`)
        .attr('width', window.innerWidth - margin.left - margin.right)
        .attr('height', window.innerHeight - margin.top - margin.bottom)
});


let lines;

const detectIntersection = (needle) => {
    const minX = Math.min(needle.x1, needle.x2);
    const maxX = Math.max(needle.x1, needle.x2);

    return !!lines.find(line => minX <= line.x1 && maxX >= line.x1);
}

let intersections = 0;
let needles = 0;

const generateNeedle = () => {
    const x = ((lines.length - 1) * distance) * Math.random();
    const y = height * Math.random();
    const angle = Math.PI * Math.random();

    const needle = {
        x1: x - (l * Math.sin(angle) / 2),
        x2: x + (l * Math.sin(angle) / 2),
        y1: y - (l * Math.cos(angle) / 2),
        y2: y + (l * Math.cos(angle) / 2)
    }

    return needle;
}

const needlesSvg = svg.append('g').attr('id', 'needles-svg');

const calculatePi = () => {
    if (needles === 0 || intersections === 0) {
        return 0;
    }

    const p = intersections / needles;
    return 2 * l / (p * distance);
}

let interval;

const stop = () => {
    if (interval) {
        clearInterval(interval);
        interval = null;
    }
}

const start = () => {
    interval = setInterval(() => {
        const needle = generateNeedle();
        needles += 1;
        if (detectIntersection(needle)) {
            intersections += 1;
        }

        needlesSvg.append('line')
            .attr('x1', needle.x1)
            .attr('x2', needle.x2)
            .attr('y1', needle.y1)
            .attr('y2', needle.y2)
            .attr('stroke', '#8e32c2')
            .attr('stroke-width', 2)
            .attr('opacity', 0)
            .transition()
            .attr('opacity', 1);

        const pi = calculatePi().toFixed(6);
        bigPi.innerText = `π=${pi}`;
        smallPi.innerText = pi;
    }, 1000 / frequency);
}

const restart = () => {
    stop();

    intersections = 0;
    needles = 0;

    d3.select('#needles-svg').selectAll('line').remove();
    d3.selectAll('#lines-svg').selectAll('line').remove();
    stopBtn.innerText = 'Stop';

    lines = Array.from(Array(Math.ceil(width / distance))).map((_, i) => {
        const line = {
            x1: i * distance,
            x2: i * distance,
            y1: 0,
            y2: height
        }
        return line;
    });

    svg.append('g')
        .attr('id', 'lines-svg')
        .selectAll('lines')
        .data(lines).enter()
        .append('line')
        .attr('x1', d => d.x1)
        .attr('x2', d => d.x2)
        .attr('y1', d => d.y1)
        .attr('y2', d => d.y2)
        .attr('stroke', '#b0b8bf')
        .attr('stroke-width', 2);

    start();
}

restart();
