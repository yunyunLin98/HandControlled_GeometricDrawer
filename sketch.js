//settings
let canvasWidth = 640;
let canvasHeight = 480;
let sizeFactor = 1;
//Text
const font = "Helvetica";
const textString = "Click to add vertex\nHold ALT to drag vertex\nPress BACKSPACE to delete vertex\nPress ESC to close shape\nHold SHIFT to select multiple vertices, and release to group(esc to cancel)\nHolde G to view vertices of same graph with highlighted vertex\nPress ENTER to print all vertices (relative to the origin) to the console\nPress DEL to clear canvas";
var textRect = {
  x: 5,
  y: 5,
  w: 600,
  h: 200
}
//global variables
let input, button;
let vector = [];
let graph = [];
let outputString = [];
let origin;
const colliderRadius = 15;
let nearest;
let nearest_Graph;
let esc = true;
let drag = false;
let space = false;
let ImgStrings, GroupStrings;
let grouping = false;
let groupingVectors = [];
let groups = [];

function preload() {

}

function setup() {
  frameRate(60);
  createCanvas(canvasWidth, canvasHeight)
  origin = new Vector(canvasWidth / 2, canvasHeight / 2);
  textFont(font);
  textSize(18);

  setupHandRecognition();
}

function draw() {
  push();
  scale(-1,1);
  image(video, -width, 0, width, height);
  pop();
  
  stroke(0);
  strokeWeight(3);
  noFill();
  // Origin cross
  line(origin.x - 10, origin.y, origin.x + 10, origin.y);
  line(origin.x, origin.y - 10, origin.x, origin.y + 10);
  // Text
  push();
  strokeWeight(1.5);
  rect(textRect.x, textRect.y, textRect.w, textRect.h);
  fill(255, 255, 255);
  text(textString, 10, 30);
  pop();
  
  // Hand
  drawHand(curHandPose);
  checkPinchingPoint(curHandPose)
  confirmPinchPoint();


  //Behaviour
  drag = keyIsDown(ALT);
  grouping = grouping || keyIsDown(SHIFT);
  space = keyIsDown(71); //G

  nearest = findNearest(vector, new Vector(pointX, pointY), colliderRadius);
  
  // Draw triangle strip
  // console.log("A");
  if (graph.length == 0 && vector.length == 0) { // no points
    return;
  }
  // console.log("B");
  if (graph.length == 0 && vector.length < 2) { // only one point
    point(vector[0].x, vector[0].y);
  } 
  else { // draw strip
    graph.forEach(function (g) {
      beginShape(TRIANGLE_STRIP);
      g.vectors.forEach((v) => vertex(v.x, v.y));
      endShape();
    });

    beginShape(TRIANGLE_STRIP);
    vector.forEach((v) => vertex(v.x, v.y));
    {
      stroke(100);
      vertex(pointX, pointY);
      stroke(255);
    }
    endShape();
  }
  // console.log("C");
  // Draw nearest vertex collider
  if (nearest != undefined) {
    stroke(0, 255, 255);
    if (grouping) stroke(255, 0, 255);
    circle(nearest.x, nearest.y, colliderRadius);
    stroke(255);
  }
  //Group vertices
  if (grouping) {
    groupingVectors.forEach(function (v) {
      stroke(255, 0, 255);
      circle(v.x, v.y, colliderRadius - 5);
      stroke(255);
    });
  }
  //Show Graph vertices
  if(space && nearest != undefined && nearest_Graph != undefined) {
    nearest_Graph.vectors.forEach(function (v) {
      stroke(255, 0, 255);
      circle(v.x, v.y, colliderRadius - 5);
      stroke(255);
    });
  }
}

function findNearest(vertices, pos, radius) {
  let nearest;
  let minDistance;
  graph.forEach(function (value) {
    value.vectors.forEach((v) => {
      let distance = dist(v.x, v.y, pos.x, pos.y);
      if (distance < radius) {
        if (nearest == undefined || distance <= minDistance) {
          nearest = v;
          minDistance = distance;
          nearest_Graph = value;
        }
      }
    });
  });

  return nearest;
}

let pinchedPoint;
let confirmPinchingStartTime = 0;
const confirmPinchPointTimeThreshold = 1000; // 2 sec
let lastAddedPoint;
let lastAddPointTime = 0;
const minAddPointTimeCD = 2500;

function confirmPinchPoint(){
  if(isPinching){ // not confirmed
    if(pinchedPoint == undefined){
      if(confirmPinchingStartTime == 0){ // start counting for confirm pinch point
        confirmPinchingStartTime = millis();
        console.log("start confirm:" + confirmPinchingStartTime);
      }
      else{ // already counting
        
        if(millis() - confirmPinchingStartTime > confirmPinchPointTimeThreshold){
          
          console.log("Confirm Pinched point");
          if (drag) {
            dragPinch();
            return;
          }
          if (nearest == undefined && !grouping) { // create new point
            console.log("create new point");
            pinchedPoint = new Vector(pointX, pointY);
            if((millis() - lastAddPointTime < minAddPointTimeCD)&&(lastAddedPoint == pinchedPoint)){
              return;
            }
            vector.push(pinchedPoint);
            esc = false;
            lastAddPointTime = millis();
            lastAddedPoint = pinchedPoint;
          } 
          else if (nearest != undefined) {
            
            if (grouping) {
              groupingVectors.push(nearest);
            } 
            else {
              vector.push(nearest);
            }
            console.log("select: "+nearest);
          }
        }
        push();
            midColor = color('red');
            fill(midColor);
            noStroke();
            circle(pointX , pointY, kpCircleDiameter);
        pop();
      }
    }
  }
  else{
    if(pinchedPoint != undefined){ // was pinching point
      pinchedPoint = undefined;
      confirmPinchingStartTime = 0;
      console.log("end Point");
      lastAddPointTime = 0;
      lastAddedPoint = undefined;
    }
  }
 
}

function dragPinch() {
  if (nearest != undefined && drag) {
    nearest.x = pointX;
    nearest.y = pointY;
  }
}

function keyPressed() {
  switch (keyCode) {
    case CONTROL:
      if (esc && nearest != undefined && nearest_Graph != undefined) {
        console.log(`delete ${nearest.x}, ${nearest.y}`);
        var idx = nearest_Graph.vectors.findIndex(e => e == nearest);
        while(idx != -1){
          nearest_Graph.vectors.splice(idx, 1);
          idx = nearest_Graph.vectors.findIndex(e => e == nearest);
        }
        
      }
      break;
    case BACKSPACE:
      if (vector.length > 0) vector.pop();
      break;
    case ENTER:
      if (vector.length > 0) graph.push(new Graph(vector));
      console.log("Print all vertices...");
      graph.forEach(function (value) {
        outputString.push(value.str + "\n");
        console.log(value.str + "\n");
      });
      break;
    case ESCAPE:
      esc = true;
      if (grouping) {
        groupingVectors = [];
        input.remove();
        button.remove();
      }
      if (vector.length > 2) {
        var g = new Graph(vector);
        g.setStr("beginShape(TRIANGLE_STRIP);\n", g, "endShape();\n");
        graph.push(g);
      }
      vector = [];
      break;
    case DELETE:
      vector = [];
      graph = [];
      break;
  }
}

function keyReleased() {
  if (keyCode == SHIFT && grouping) {
    if (groupingVectors.length > 0) {
      input = createInput();
      input.position(350, 20);
      input.size(70);
      button = createButton("Group");
      button.position(input.x + input.width, input.y);
      button.mousePressed(AddGroup);
    } else {
      groupingVectors = [];
      grouping = false;
    }
  }
}
function AddGroup() {
  var g = new Graph(groupingVectors);
  g.group = input.value();
  g.setStr(`Group:${g.group}\n`, g, "EndGroup\n");
  groups.push(g);
  console.log("add group " + g.group);
  groupingVectors = [];
  grouping = false;
  input.remove();
  button.remove();
}
