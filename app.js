/**
 * Created by pedro on 6/5/17.
 */

class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

function deCasteljau(points, t) {
    if (points.length == 1)
        return points[0];
    else {
        const newpoints = new Array(points.length - 1);
        const l = newpoints.length;
        for (i = 0; i < l; i++) {
            x = (1 - t) * points[i].x + t * points[i + 1].x;
            y = (1 - t) * points[i].y + t * points[i + 1].y;
            newpoints[i] = new Point(x, y);
        }
        return deCasteljau(newpoints, t)
    }
}

function draw(context, curve, delta) {
    let t = 0;
    const points = new Array((1 / delta) + 1);
    for (let i = 0; i < (1 / delta) + 1; i++) {
        points[i] = deCasteljau(curve, Math.round(t * 100) / 100);
        t += delta;
    }

    for (let i = 0; i < 1 / delta; i++)
        drawLine(context, points[i], points[i + 1]);
}

function drawLine(context, p1, p2) {
    context.beginPath();
    context.moveTo(p1.x, p1.y);
    context.lineTo(p2.x, p2.y);
    context.strokeStyle = 'white';
    context.stroke();
}

function drawPolygonal(context, curve) {
    for (let i = 0; i < curve.length -1; i++) {
        context.beginPath();
        context.moveTo(curve[i].x, curve[i].y);
        context.lineTo(curve[i+1].x, curve[i+1].y);
        context.strokeStyle = 'green';
        context.stroke();
    }
}

const main = function () {
    const animation = parseFloat(prompt("Digite o tempo total de animação"));
    const interval = parseFloat(prompt("Digite o intervalo"));
    const degree = parseInt(prompt("Digite o grau das curvas")) + 1;
    const canvas = document.getElementById('canvas');
    const context = canvas.getContext('2d');
    const curves = [];
    curves.push([]);

    context.strokeStyle = 'white';
    context.lineWidth = 1;
    context.fillStyle = 'black';
    context.fillRect(0, 0, 1024, 1024);

    console.log(degree);
    canvas.addEventListener('click', e => {
        console.log(new Point(e.pageX, e.pageY));
        console.log(curves);
        if (curves[curves.length - 1].length < degree){
            curves[curves.length - 1].push(new Point(e.pageX, e.pageY));
            context.beginPath();
            context.arc(e.pageX, e.pageY, 5, 0, 2*Math.PI);
            context.strokeStyle = 'red';
            context.stroke();
        }
        if (curves[curves.length - 1].length == degree) {
            draw(context, curves[curves.length - 1], interval / animation);
            drawPolygonal(context, curves[curves.length - 1]);
            curves.push([]);
        }
    });
};

main();