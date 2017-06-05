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

function draw(context, curve) {
    let t = 0;
    const points = new Array(1000);
    for (let i = 0; i < 1000; i++) {
        points[i] = deCasteljau(curve, Math.round(t * 100) / 100);
        t += 0.001;
    }

    for (let i = 0; i < 999; i++)
        drawLine(context, points[i], points[i + 1]);
}

function drawLine(context, p1, p2) {
    context.moveTo(p1.x, p1.y);
    context.lineTo(p2.x, p2.y);
    context.stroke();
}

const main = function () {
    const degree = prompt("Digite o grau das curvas");
    const canvas = document.getElementById('canvas');
    const context = canvas.getContext('2d');
    const curves = [];
    curves.push([]);

    console.log(degree);
    canvas.addEventListener('click', e => {
        console.log(new Point(e.pageX, e.pageY));
        console.log(curves);
        if (curves[curves.length - 1].length < degree)
            curves[curves.length - 1].push(new Point(e.pageX, e.pageY));
        if (curves[curves.length - 1].length == degree) {
            draw(context, curves[curves.length - 1]);
            curves.push([]);
        }
    });
};

main();