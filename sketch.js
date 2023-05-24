//settings
let canvasWidth = 640;
let canvasHeight = 480;
let sizeFactor = 1;
const ImgFile = "lionImg.txt";
const GroupFile = "lionGroup.txt";
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
const pinchConfirmTime = 2000;

function preload() {
  ImgStrings = loadStrings(ImgFile);
  GroupStrings = loadStrings(GroupFile);
}

function setup() {
  frameRate(60);
  createCanvas(canvasWidth, canvasHeight)
  origin = new Vector(canvasWidth / 2, canvasHeight / 2);
  textFont(font);
  textSize(18);
  // LoadVectors();
  // LoadGroups();
  
  video = createCapture(VIDEO);
  video.size(width, height);

  handPoseModel = ml5.handpose(video, onHandPoseModelReady);

  // Call onNewHandPosePrediction every time a new handPose is predicted
  handPoseModel.on("predict", onNewHandPosePrediction);

  // Hide the video element, and just show the canvas
  video.hide();

  boundingBoxColor = color(255, 0, 0);
  kpColor = color(0, 255, 0, 200);
  skeletonColor = color(kpColor);

}

function draw() {
  // background(0);
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
  
  //Behaviour
  drag = keyIsDown(ALT);
  grouping = grouping || keyIsDown(SHIFT);
  space = keyIsDown(71); //G

  nearest = findNearest(vector, new Vector(pointX, pointY), colliderRadius);
  // nearest = findNearest(vector, new Vector(mouseX, mouseY), colliderRadius);
  
  // Draw triangle strip
  if (graph.length == 0 && vector.length == 0) {
    return;
  }
  if (graph.length == 0 && vector.length < 2) {
    point(vector[0].x, vector[0].y);
  } else {
    graph.forEach(function (g) {
      beginShape(TRIANGLE_STRIP);
      g.vectors.forEach((v) => vertex(v.x, v.y));
      endShape();
    });

    beginShape(TRIANGLE_STRIP);
    vector.forEach((v) => vertex(v.x, v.y));
    {
      stroke(100);
      vertex(mouseX, mouseY);
      stroke(255);
    }
    endShape();
  }
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
  if(curHandPose){
    drawHand(curHandPose);
    checkPinchingPoint(curHandPose);
    if(millis() - startPinchingTime > pinchConfirmTime){
      confirmPinch();
    }
    
  stroke(255, 0, 255);
      circle(pinchedPoint.x, pinchedPoint.y, colliderRadius - 5);
      stroke(255);

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
function mousePressed() {
  // if(mouseX >= textRect.x && mouseX <= textRect.x + textRect.w){
  //   if(mouseY >= textRect.y && mouseY <= textRect.y + textRect.h){
  //     return;
  //   }
  // }
  if (drag) return;
  if (nearest == undefined && !grouping) {
    vector.push(new Vector(mouseX, mouseY));
    esc = false;
  } else if (nearest != undefined) {
    if (grouping) {
      groupingVectors.push(nearest);
    } else {
      vector.push(nearest);
    }
  }
}
let pinchConfirmed = false;
let pinchedPoint;
function confirmPinch(){
  // if (drag) return;
  if (nearest == undefined && !grouping && !pinchConfirmed) {
    pinchedPoint = new Vector(pointX, pointY);
    vector.push(pinchedPoint);
    pinchConfirmed = true;
    esc = false;
  } else if (nearest != undefined) {
    if (grouping) {
      groupingVectors.push(nearest);
    } else {
      vector.push(nearest);
    }
    console.log("select: "+nearest);
  }
}

function mouseDragged() {
  if (nearest != undefined && drag) {
    nearest.x = mouseX;
    nearest.y = mouseY;
  }
}

function keyPressed() {
  switch (keyCode) {
    case 192: //`
      if (esc && nearest != undefined && nearest_Graph != undefined) {
        console.log(`delete ${nearest.x}, ${nearest.y}`);
        var idx = nearest_Graph.vectors.findIndex(e => e == nearest);
        if(idx != -1) nearest_Graph.vectors.splice(idx, 1);
        if (nearest_Graph.vectors.length == 0) {
          idx = graph.findIndex((e) => e == nearest_Graph);
          if(idx != -1) graph.splice(idx,1);
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
      saveStrings(outputString, "output.txt");
      var str = [];
      groups.forEach(function (value) {
        str.push(value.str + "\n");
      });
      saveStrings(str, "groups.txt");

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
