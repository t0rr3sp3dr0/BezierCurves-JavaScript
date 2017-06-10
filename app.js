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

function draw(context, curve, delta, color) {
    let t = 0;
    const points = new Array((1 / delta) + 1);
    for (let i = 0; i < (1 / delta) + 1; i++) {
        points[i] = deCasteljau(curve, Math.round(t * 100) / 100);
        t += delta;
    }

    for (let i = 1 / delta; i > 0; i--)
        drawLine(context, points[i], points[i - 1], color);
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

const main = function () {
    const interval = parseFloat(prompt("Digite o intervalo"));
    const degree = parseInt(prompt("Digite o grau das curvas")) + 1;
    const canvas = document.getElementById('canvas');
    const context = canvas.getContext('2d');
    const curves = [];
    let dirty = false; // para saber se as curvas dos pontos de controle foram desenhadas
    curves.push([]);

    context.strokeStyle = 'white';
    context.lineWidth = 1;
    context.fillStyle = 'black';
    context.fillRect(0, 0, canvas.width, canvas.height);

    console.log(degree);
    canvas.addEventListener('click', e => {
        // Se tem curvas dos pontos de controle, pinte por cima
        if (curves.length > 2 && dirty === true) {
            let control = controlCurves(curves);
            for (let i = 0; i < control.length; i++) {
                draw(context, control[i], interval, 'black');
            }
        }
        console.log(new Point(e.pageX, e.pageY));
        if (curves[curves.length - 1].length < degree){
            curves[curves.length - 1].push(new Point(e.pageX, e.pageY));
            // Desenha os pontos de controle
            context.beginPath();
            context.arc(e.pageX, e.pageY, 5, 0, 2*Math.PI);
            context.strokeStyle = 'red';
            context.stroke();
        }
        console.log(curves);
        if (curves[curves.length - 1].length === degree) {
            draw(context, curves[curves.length - 1], interval, 'white');
            drawPolygonal(context, curves[curves.length - 1], 'green');
            curves.push([]);
            if (dirty)
                dirty = false;

        }
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

    function play(context, control, delta, t) {
        let finalCurve = [];
        for (let i = 0; i < control.length; i++) {
            finalCurve.push(deCasteljau(control[i], t));
        }
        draw(context, finalCurve, interval, 'white');
        if (t <= 1) {
            setTimeout(function () {
                // Precisa corrigir essa parte de pintar por cima
                draw(context, finalCurve, interval, 'black');
                play(context, control, delta, t + delta);
            }, interval*1000);
        }

    }
    document.getElementById("btnPlay").onclick = function() {
        if (curves.length > 2) {
            let control = controlCurves(curves);
            play(context, control, interval, 0);

        }
    };
};

main();
