var dots = [];
var dotsCopy;
var framesArr = [];

var buttonDrawMode;
var buttonClearDots;
var buttonSaveDots;
var buttonLoadDots;

var buttonPlay;
var sliderX;
var sliderY;

var buttonRecord;
var buttonClearFrames;
var buttonSaveFrames;

var sliderScale;

var modes = 'null';
var colours;
var bg;

var brushSize = [0.25, 0.5, 1];

var exportStringArr = [];

var exportCounter = 0;

function preload() {
  bg = loadImage('ref.jpg', loadImgSuccess);
}

function loadImgSuccess() {
  console.log('BG loaded successfully!');
}

function setup() {
  //createCanvas(bg.width, bg.height);
  createCanvas(1000, 1000);
  bg.loadPixels();

  buttonDrawMode = createButton('Draw Dot Mode');
  buttonDrawMode.position(0, height + 25);
  buttonDrawMode.mousePressed(drawDots);

  buttonClearDots = createButton('Clear All Dots');
  buttonClearDots.position(0, height + 25 * 2);
  buttonClearDots.mousePressed(clearDots);

  buttonSaveDots = createButton('Save Dots');
  buttonSaveDots.position(0, height + 25 * 3);
  buttonSaveDots.mousePressed(saveDots);

  buttonLoadDots = createButton('Load Dots');
  buttonLoadDots.position(0, height + 25 * 4);
  buttonLoadDots.mousePressed(loadDots);

  buttonPlay = createButton('Play');
  buttonPlay.position(200, height + 25);
  buttonPlay.mousePressed(playNow);

  sliderX = createSlider(0, 1, 0.5, 0.1);
  sliderX.position(200, height + 25 * 2);
  sliderX.style('width', '100px');

  sliderY = createSlider(0, 1, 0.5, 0.1);
  sliderY.position(200, height + 25 * 3);
  sliderY.style('width', '100px');

  buttonRecord = createButton('Record');
  buttonRecord.position(400, height + 25);
  buttonRecord.mousePressed(recordNow);

  buttonClearFrames = createButton('Clear Frames');
  buttonClearFrames.position(400, height + 25 * 2);
  buttonClearFrames.mousePressed(clearFrames);

  buttonSaveFrames = createButton('Save Frames');
  buttonSaveFrames.position(400, height + 25 * 3);
  buttonSaveFrames.mousePressed(downloadFrames);

  sliderScale = createSlider(0, 2, 2, 1);
  sliderScale.position(600, height + 25);
  sliderScale.style('width', '50px');
  
  exportNameInput = createInput('frameExport_dot_');
  exportNameInput.position(400, height + 25 * 5);

  colours = {
    drawModeFill: color(255, 255, 255, 125),
    drawModeBorder: color(0, 0, 255),
    playModeBorder: color(0, 255, 0),
    recordModeBorder: color(255, 0, 0),
    dot: color(255, 255, 255)
  }

}

function drawDots() {
  if (modes !== 'draw') {
    modes = 'draw';
  } else {
    modes = 'null';
  }
}

function clearDots() {
  dots = [];
}

function saveDots() {
  var dotStringArr = ['savedDots = ['];

  for (var i = 0; i < dots.length; i++) {
    dotStringArr.push(
      '  {x: ' + dots[i].x +
      ', y: ' + dots[i].y +
      ', scale: ' + dots[i].scale + '},');

    if (i == dots.length - 1) {
      dotStringArr[dotStringArr.length - 1] =
        dotStringArr[dotStringArr.length - 1].substring(0, dotStringArr[dotStringArr.length - 1].length - 1);
    }
  }
  dotStringArr.push(']; ');

  saveStrings(dotStringArr, 'dotPosExport.txt');
}

function loadDots() {
  dots = dots.concat(savedDots);
}

function playNow() {
  if (modes !== 'play') {
    modes = 'play';
  } else {
    modes = 'null';
  }
}

function recordNow() {
  if (modes !== 'record') {
    modes = 'record';
  } else {
    modes = 'null';
  }
}

function mouseClicked() {
  if (modes == 'draw' && mouseX > 0 && mouseX < width && mouseY > 0 && mouseY < height) {
    dots.push({
      x: mouseX - width / 2,
      y: mouseY - height,
      scale: sliderScale.value()
    })

  }
}

function downloadFrames() {
  var defaultBrush = 4;
  var rotCount = 0;

  for (var i = 0; i < framesArr.length; i++) {
    var frameStringArr = [];
    var prevScale = 10;
    for (var j = 0; j < framesArr[i].length; j++) {
      var x = framesArr[i][j].x / width * 10;
      var y = (framesArr[i][j].y / height + 0.5) * 10;
      if (x > -5 && x < 5 && y > -5 && y < 5) {

        var scale = framesArr[i][j].scale;
        var depth =
          framesArr[i][j].z *
          expresiiDotWeight(int(defaultBrush * brushSize[scale])) / 2;

        if (scale !== prevScale) {
          var wetness = expresiiWetVal(int(8 + 4 * brushSize[scale]));
          frameStringArr.push("w   " + wetness.toFixed(5))
          
          frameStringArr.push(
            "B   " + (int(defaultBrush * brushSize[scale])).toFixed(5)
          )
          frameStringArr.push(
            "a   0.00000   " + (-int((1 - brushSize[scale]) * 10) / 10).toFixed(5))
        }

        var pause = int(pow(framesArr[i][j].z, 2) * 10) + 1;

        for (var k = 0; k <= pause; k++) {
          var dotRatio = k / (pause);
          var pp = 0.5 * (1 - pow(2 * dotRatio - 1, 4));
          if (k == 0 || k == pause) {
            pp = 0;
          }
          var orient = noise(rotCount * 0.1) * 90 - 45;
          var tilt = 30;
          var rotX = atan2(cos(90 - tilt) * sin(-orient), sin(90 - tilt));
          var rotY = atan2(cos(90 - tilt) * cos(-orient), sin(90 - tilt)) * -1;
          
          frameStringArr.push(
            "s  " +
            x.toFixed(5) + '   ' +
            (-depth * (1 - pow(2 * dotRatio - 1, 4))).toFixed(5) + '   ' +
            y.toFixed(5) + '   ' +
            rotX.toFixed(5) + '   ' +
            rotY.toFixed(5) + '   0.00000  ' + pp.toFixed(5)
          );
          
          rotCount ++;
        }

        prevScale = scale;

      }
    }
    //frameStringArr.push(' ');
    exportStringArr.push(frameStringArr);
    //saveStrings(frameStringArr, 'framesExport', 'xst');
  }


}

function clearFrames() {
  framesArr = [];
  exportCounter = 0;
}

function expresiiDotWeight(brushSize) {
  var val = 0;
  if (brushSize == 9) {
    val = 1.3;
  } else if (brushSize == 8) {
    val = 0.9;
  } else if (brushSize == 7) {
    val = 0.5;
  } else if (brushSize == 6) {
    val = 0.4;
  } else if (brushSize == 5) {
    val = 0.3;
  } else if (brushSize == 4) {
    val = 0.2;
  } else if (brushSize == 3) {
    val = 0.1;
  } else if (brushSize == 2) {
    val = 0.08;
  } else if (brushSize == 1) {
    val = 0.06;
  }
  return val;
}


function expresiiWetVal(wetIdx) {
  var val = 0;
  if (wetIdx == 12 || wetIdx == 13) {
    val = 1;
  } else if (wetIdx == 11) {
    val = 0.65;
  } else if (wetIdx == 10) {
    val = 0.4;
  } else if (wetIdx == 9) {
    val = 0.19;
  } else if (wetIdx == 8) {
    val = 0.15;
  } else if (wetIdx == 7) {
    val = 0.10;
  } else if (wetIdx == 6) {
    val = 0.09;
  } else if (wetIdx == 5) {
    val = 0.08;
  } else if (wetIdx == 4) {
    val = 0.07;
  } else if (wetIdx == 3) {
    val = 0.06;
  } else if (wetIdx == 2) {
    val = 0.05;
  } else if (wetIdx == 1) {
    val = 0.04;
  }
  return val;
}

function draw() {
  background(150);
  frameRate(24);
    angleMode(DEGREES);

  if (max(bg.width, bg.height) == bg.width) {
    image(bg, 0,
      height / 2 - bg.height / bg.width * width / 2, width, bg.height / bg.width * width);
  } else {
    image(bg, width / 2 - bg.width / bg.height * height / 2,
      0, bg.width / bg.height * height, height);
  }

  push();
  translate(width / 2, height);

  var allDotsArr = [];
  for (var i = 0; i < dots.length; i++) {

    var brushScale = brushSize[dots[i].scale];
    stroke(255 * brushScale, 255, 255 * (1 - brushScale), 255);
    strokeWeight(10 * brushScale);

    if (modes == 'play' || modes == 'record') {
      var x = 1 - sliderX.value();
      var y = sliderY.value();

      dots[i].x = dots[i].x +
        (noise((frameCount + 100 * i) * 0.05) - x) * 2 * brushScale;
      dots[i].y = dots[i].y +
        (noise((frameCount + 100 * i + 1000) * 0.05) - y) * brushScale;

      var weight = noise((frameCount + 500 * i) * 0.05);

      strokeWeight(weight * 20 * brushScale);

      allDotsArr.push({
        x: dots[i].x,
        y: dots[i].y,
        z: weight,
        scale: dots[i].scale
      });

    }

    point(dots[i].x, dots[i].y);

  }

  if (modes == 'record' && frameCount % 3 == 0) {
    framesArr.push(allDotsArr);
  }

  pop();


  if (modes !== 'null') {
    strokeWeight(10);

    if (modes == 'play') {
      noFill();
      stroke(colours.playModeBorder);
    } else if (modes == 'draw') {
      fill(colours.drawModeFill);
      stroke(colours.drawModeBorder);
    } else if (modes == 'record') {
      noFill();
      stroke(colours.recordModeBorder);
    }

    rect(0, 0, width, height);

  }

  if (modes == 'record') {
    fill(colours.recordModeBorder);
  } else {
    fill(255, 255, 255, 255);
  }
  noStroke();
  textSize(16);
  textAlign(LEFT, TOP);
  text('Frames recorded: ' + framesArr.length, 15, 15);

  if (modes == 'draw') {
    strokeWeight(1);
    stroke(255, 255, 255, 255);
    noFill();
    ellipse(mouseX, mouseY,
      10 * brushSize[sliderScale.value()],
      10 * brushSize[sliderScale.value()]);
  }

  if (exportStringArr.length > 0 && frameCount % 2 == 0) {
    saveStrings(exportStringArr[0], exportNameInput.value() + exportCounter, 'xst');
    exportStringArr.shift();
    exportCounter++;
  }

}
