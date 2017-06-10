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
    if (points.length === 1)
        return points[0];

    const newPoints = new Array(points.length - 1);
    const l = newPoints.length;
    for (i = 0; i < l; i++) {
        x = (1 - t) * points[i].x + t * points[i + 1].x;
        y = (1 - t) * points[i].y + t * points[i + 1].y;
        newPoints[i] = new Point(x, y);
    }
    return deCasteljau(newPoints, t)
}

function randomColor() {
    let letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++ ) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function draw(context, curve, delta, color) {
    let t = 0;
    const points = new Array((1 / delta) + 1);
    for (let i = 0; i < (1 / delta) + 1; i++) {
        points[i] = deCasteljau(curve, Math.round(t * 10000) / 10000);
        t += delta;
    }

    for (let i = 1 / delta; i > 0; i--)
        if(color !== 'user')
            drawLine(context, points[i], points[i - 1], color);
        else {
            color = randomColor();
            drawLine(context, points[i], points[i - 1], color);
        }
}


function drawPoints(context, curve, fillColor) {
    for (let i = 0; i < curve.length; i++) {
        context.beginPath();
        context.arc(curve[i].x,curve[i].y, pointRadius, 0, 2*Math.PI);
        context.strokeStyle = fillColor;
        context.stroke();
    }
}

function drawLine(context, p1, p2, strokeStyle) {
    context.beginPath();
    context.moveTo(p1.x, p1.y);
    context.lineTo(p2.x, p2.y);
    context.strokeStyle = strokeStyle;
    context.stroke();
}

function drawPolygonal(context, curve, strokeStyle) {
    for (let i = curve.length - 1; i > 0; i--) {
        context.beginPath();
        context.moveTo(curve[i].x, curve[i].y);
        context.lineTo(curve[i - 1].x, curve[i - 1].y);
        context.strokeStyle = strokeStyle;
        context.stroke();
    }
}

// function drawPolygonals(context, curves) {
//     /* Caso precise colocar a função num botão
//         que desenha todas as poligonais
//      */
//     for (let i = 0; i < curves.length; i++) {
//         drawPolygonal(context, curves[i]);
//     }
// }

function controlCurves(curves) {
    // Dado um conjunto de curvas de bezier, calcular
    // novas curvas com os pontos de controle do conjunto.
    // Ex:
    // control[0] = { curves[0][0], curves[1][0], ... , curves[n][0] }
    // control[1] = { curves[0][1], curves[1][1], ... , curves[n][1] }

    let control = [];
    for (let i = 0; i < curves[0].length; i++) {
        control.push([]);
        for (let j = 0; j < curves.length - 1; j++)
            control[i].push(curves[j][i]);
    }
    return control;
}

function distance(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

function searchPoint(mouse, curves) {
    for(let i = 0; i < curves.length; i++) {
        for(let j = 0; j < curves[i].length; j++) {
            if(distance(mouse.x, mouse.y, curves[i][j].x, curves[i][j].y) <= pointRadius) {
                return [i, j];
            }
        }
    }
    return -1;
}

let pointRadius = 7;

const main = function () {
    const interval = parseFloat(prompt("Digite o intervalo (0 - 1)"));
    const degree = parseInt(prompt("Digite o grau das curvas")) + 1;
    const canvas = document.getElementById('canvas');
    const context = canvas.getContext('2d');
    let curves = [];

    let move = false;
    let point = [];
    let mouse = new Point(0, 0);
    let dirty = false; // para saber se as curvas dos pontos de controle foram desenhadas
    curves.push([]);

    context.strokeStyle = 'white';
    context.lineWidth = 1;
    context.fillStyle = 'black';
    context.fillRect(0, 0, canvas.width, canvas.height);

    console.log(degree);

    function redraw() {
        if (curves[curves.length - 1].length < degree){
            curves[curves.length - 1].push(mouse);
            // Desenha os pontos de controle
            context.beginPath();
            context.arc(mouse.x, mouse.y, pointRadius, 0, 2*Math.PI);
            context.strokeStyle = 'red';
            context.stroke();
        }
        if (curves[curves.length - 1].length === degree) {
            context.fillRect(0, 0, canvas.width, canvas.height);
            for(let i = 0; i < curves.length; i++) {
                draw(context, curves[i], interval, 'user');
                drawPoints(context, curves[i], 'red');
                drawPolygonal(context, curves[i], 'green');
            }
            curves.push([]);
            if (dirty)
                dirty = false;
        }
    }

    canvas.addEventListener('click', e => {
        // Se tem curvas dos pontos de controle, pinte por cima
        if (curves.length > 2 && dirty === true) {
            let control = controlCurves(curves);
            for (let i = 0; i < control.length; i++) {
                draw(context, control[i], interval, 'black');
            }
        }
    });
    
    function redrawCurve() {
        context.fillRect(0, 0, canvas.width, canvas.height);
        for(let i = 0; i < curves.length; i++) {
            draw(context, curves[i], interval, 'user');
            drawPoints(context, curves[i], 'red');
            drawPolygonal(context, curves[i], 'green');
        }
    }

    window.addEventListener('keypress', function (e) {
        if(e.keyCode === 100) {
            if(point !== -1) {
                if(curves[point[0]].length < degree)
                    curves.push([]);
                curves.splice(point[0], 1);
                redrawCurve();
            }
        }
    });

    canvas.addEventListener('mousedown', function () {
        point = searchPoint(mouse, curves);
        if (point === -1) {
            redraw();
        }
        else
            move = true;
    });

    canvas.addEventListener('mousemove', function (e) {
        mouse = new Point(e.pageX, e.pageY);
        if(move) {
            curves[point[0]][point[1]] = mouse;
            redrawCurve();
        }
    });

    canvas.addEventListener('mouseup', function () {
        move = false;
    });
    document.getElementById("btnShowControlCurves").onclick = function() {
        // Se tem curvas suficientes para desenhar curvas dos pontos de controle, desenhe
        // Isso deverá ser apagado no futuro, pra que não atrapalhe a visualização
        if (curves.length > 2) {
            dirty = true;
            let control = controlCurves(curves);
            console.log(control);
            for(let i = 0; i < control.length; i++) {
                draw(context, control[i], interval, 'blue');
            }
        }
    };

    function play1(context, control, delta, t) {
        let finalCurve = [];
        for (let i = 0; i < control.length - 1; i++) {
            finalCurve.push(deCasteljau(control[i], t));
        }
        draw(context, finalCurve, interval, 'user');
        if (t < 1) {
            setTimeout(function() {
                if(t + delta > 1) {
                    draw(context, finalCurve, interval, 'black');
                    play1(context, control, delta, 1);
                }
                else{
                    draw(context, finalCurve, interval, 'black');
                    play1(context, control, delta, t + delta);
                }

            }, interval*1000);
        }

    }

    function play2(context, control, delta, t) {
        let finalCurve = [];
        for (let i = 0; i < control.length; i++) {
            finalCurve.push(deCasteljau(control[i], t));
        }
        draw(context, finalCurve, interval, 'user');
        if (t < 1) {
            setTimeout(function() {
                if(t + delta > 1) {
                    draw(context, finalCurve, interval, 'black');
                    play2(context, control, delta, 1);
                }
                else{
                    draw(context, finalCurve, interval, 'black');
                    play2(context, control, delta, t + delta);
                }

            }, interval*1000);
        }

    }

    document.getElementById("btnPlay1").onclick = function() {
        if (curves.length > 2) {
            play1(context, curves, interval, 0);
        }
    };

    document.getElementById("btnPlay2").onclick = function() {
        if (curves.length > 2) {
            let control = controlCurves(curves);
            play2(context, control, interval, 0);
        }
    };
    document.getElementById("btnDisco").onclick = function() {
        if (curves.length > 2) {
            let control = controlCurves(curves);
            play2(context, control, interval, 0);
            play1(context, curves, interval, 0);
        }
    };
    function clear() {
        context.fillRect(0, 0, canvas.width, canvas.height);
        curves = [];
        dirty = false;
        curves.push([]);
    }
    
    document.getElementById("btnClear").onclick = function () {
        clear();
    }
};

main();
