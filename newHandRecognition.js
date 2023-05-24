let handPoseModel;
let video;
let curHandPose = null;
let isHandPoseModelInitialized = false;

let boundingBoxColor;
let kpCircleDiameter = 10;
let kpColor;
let skeletonColor;

let startPinchingTime = 0;


function setupHandRecognition() {
  // createCanvas(640, 480);
  video = createCapture(VIDEO);
  // video.size(width, height);

  handPoseModel = ml5.handpose(video, onHandPoseModelReady);

  // Call onNewHandPosePrediction every time a new handPose is predicted
  handPoseModel.on("predict", onNewHandPosePrediction);

  // Hide the video element, and just show the canvas
  video.hide();

  boundingBoxColor = color(255, 0, 0);
  kpColor = color(0, 255, 0, 200);
  skeletonColor = color(kpColor);
}

function onHandPoseModelReady() {
  console.log("HandPose model ready!");
  isHandPoseModelInitialized = true;
}

function onNewHandPosePrediction(predictions) {
  if (predictions && predictions.length > 0) {
    curHandPose = predictions[0];
    // console.log(curHandPose);
  } else {
    curHandPose = null;
  }
}

// A function to draw ellipses over the detected keypoints
function drawHand(handPose) {

  if (!handPose) {
    return;
  }

  // draw keypoints
  // While each keypoints supplies a 3D point (x,y,z), we only draw
  // the x, y point.
  push();
  console.log("here");
  fill(kpColor);
    noStroke();
    circle(width - handPose.landmarks[4][0],handPose.landmarks[4][1], kpCircleDiameter);
    circle(width - handPose.landmarks[8][0],handPose.landmarks[8][1], kpCircleDiameter);
  pop();

}
let pointX = 0;
let pointY = 0;
let thresholdForPinchingGesture = 60;
let isPinching = false;
function checkPinchingPoint(handPose) {
  if (!handPose) {
    return false;
  }

  const distance = dist(handPose.landmarks[8][0], handPose.landmarks[8][1], handPose.landmarks[4][0], handPose.landmarks[4][1]);
  // console.log(distance);
  
  if (distance <= thresholdForPinchingGesture) {
    pointX = width - (handPose.landmarks[8][0] + handPose.landmarks[4][0]) / 2 ;
    pointY = (handPose.landmarks[8][1] + handPose.landmarks[4][1]) / 2;
push();
  // scale(-1,1);
    midColor = color('red');
    fill(midColor);
    noStroke();
    circle(pointX , pointY, kpCircleDiameter);
    pop();
    if(!isPinching){
      startPinchingTime = millis();
      isPinching = true;
      console.log("start:" + startPinchingTime);
    }
    return true;
  }
  if(isPinching){
    isPinching = false;
    startPinchingTime = 0;
    console.log("end:" + millis());
  }
  return false;
}



