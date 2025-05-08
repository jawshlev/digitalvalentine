'use strict';

let messages = [
  "Your grace is only constrained by the breadth of the word",
  "My Raison D'etre",
  "Well aren't you easy on the eyes",
  "me,\n the painter,\n you,\n my muse,\n in vain,\n i paint,\n a thousand words isn't enough",
  "Be the cigarette to my black coffee. Won't you?",
  "Consider me smitten, honest."
];
let selectedMessage;
let video;
let handPose;
let hands = [];
let centerX, centerY;
let heartSize = 50;
let tempX = 0, tempY = 0;
let freeze = false;
let colorShift = 0;
let distortionThreshold = 60;
let startTime;
let canvasContainer;
let originalCanvasWidth;
let originalCanvasHeight;

function preload(){
  handPose = ml5.handPose({ flipped: true });
}

function gotHands(results) {
  hands = results;
}

function setup() {
  canvasContainer = $("#canvas-container");
  originalCanvasWidth = canvasContainer.width();
  originalCanvasHeight = canvasContainer.height();
  let canvas = createCanvas(canvasContainer.width(), canvasContainer.height());
  canvas.parent("canvas-container");
  video = createCapture({ video: { facingMode: "user" }, audio: false });
  video.size(width, height);
  handPose.detectStart(video, gotHands);
  video.hide();
  selectedMessage = random(messages);
  centerX = width / 2;
  centerY = height / 2;
  strokeWeight(0.75);
  background(255);
  startTime = millis();

  $("#play-pause-btn").click(() => {
    freeze = !freeze;
    $("#play-icon").toggleClass("hidden", freeze);
    $("#pause-icon").toggleClass("hidden", !freeze);
    $("#play-pause-text").text(freeze ? "Play" : "Pause");
  });

  // Refresh canvas and reset message
  $("#refresh-btn").click(() => {
    background(255);
    selectedMessage = random(messages);
  });

  // Save as PNG
  $("#save-btn").click(() => {
    saveCanvas('heart_shape', 'png');
  });

  // Fullscreen button
  const fullscreenBtn = $('<button id="fullscreen-btn" class="btn">Fullscreen</button>');
  fullscreenBtn.appendTo(".canvas-controls");
  fullscreenBtn.click(() => {
    const canvasContainerElement = document.getElementById("canvas-container");
    if (!document.fullscreenElement) {
      canvasContainerElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  });
}

function draw() {
  if (freeze) return;
  
  push();
  textFont("IM Fell DW Pica SC");
  textSize(30);
  textAlign(CENTER, CENTER);
  fill(255);
  noStroke();
  text(selectedMessage, width / 2, height / 2);
  pop();
  
  let d = 0;
  if (hands.length > 0) {
    for (let hand of hands) {
      if (hand.confidence > 0.1) {
        let handCenter = hand.thumb_ip;
        let middleTip = hand.index_finger_dip;
        d = dist(handCenter.x, handCenter.y, middleTip.x, middleTip.y);
        tempX = handCenter.x;
        tempY = handCenter.y;
        heartSize = d;
        startTime = millis();
      }
    }
  } else {
    if (millis() - startTime > 2000) {
      tempX = mouseX;
      tempY = mouseY;
    }
  }
  
  centerX += (tempX - centerX) * 0.01;
  centerY += (tempY - centerY) * 0.01;
  
  colorShift += 0.02;
  let r = 255;
  let g = sin(colorShift) * 30 + 50;  
  let b = sin(colorShift) * 100 + 150;
  let c = color(r, g, b);
  stroke(c);
  noFill();
  
  if (d < distortionThreshold) {
    distortedShape(centerX, centerY, heartSize);
  } else {
    heart(centerX, centerY, heartSize);
  }

  // Video settings
  let videoWidth = (width / 4) * 1.15;  
  let videoHeight = (video.height / video.width) * videoWidth;  
  let videoX = width - videoWidth;  
  let videoY = height - videoHeight;  

  // Flip the video horizontally
  push();
  translate(videoX + videoWidth, videoY);  // Move to correct position
  scale(-1, 1);  // Flip horizontally
  image(video, 0, 0, videoWidth, videoHeight);  
  pop();
}



function heart(x, y, size) {
  beginShape();
  vertex(x, y);
  bezierVertex(x - size / 2, y - size / 2, x - size, y + size / 3, x, y + size);
  bezierVertex(x + size, y + size / 3, x + size / 2, y - size / 2, x, y);
  endShape(CLOSE);
}

function distortedShape(x, y, size) {
  beginShape();
  vertex(x + random(-40, 40), y + random(-40, 40));
  bezierVertex(x - size / 2 + random(-40, 40), y - size / 2 + random(-40, 40), 
               x - size + random(-40, 40), y + size / 3 + random(-40, 10), 
               x + random(-40, 40), y + size + random(-40, 40));
  bezierVertex(x + size + random(-40, 40), y + size / 3 + random(-40, 40), 
               x + size / 2 + random(-40, 40), y - size / 2 + random(-40, 40), 
               x + random(-40, 40), y + random(-40, 40));
  endShape(CLOSE);
}


function keyPressed() {
  if (keyCode == DELETE || keyCode == BACKSPACE) background(255);
}

document.addEventListener("fullscreenchange", () => {
    if (document.fullscreenElement) {
      resizeCanvas(window.innerWidth, window.innerHeight);
    } else {
      resizeCanvas(originalCanvasWidth, originalCanvasHeight);
    }
  });