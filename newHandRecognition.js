let handPoseModel;
let video;
let curHandPose = null;
let isHandPoseModelInitialized = false;

let boundingBoxColor;
let kpCircleDiameter = 10;
let kpColor;
let skeletonColor;



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
  fill(kpColor);
    noStroke();
    circle(width - handPose.landmarks[4][0],handPose.landmarks[4][1], kpCircleDiameter); // thumb tip
    circle(width - handPose.landmarks[8][0],handPose.landmarks[8][1], kpCircleDiameter); // index finger tip
  pop();

}

let pointX = 0;
let pointY = 0;
const pinchDistanceThreshold = 20;
const checkPinchingTimeThreshold = 1000; // 1 sec
let isPinching = false;
let checkPinchingStartTime = 0;

function checkPinchingPoint(handPose) {
  if (!handPose) {
    return false;
  }

  const distance = dist(handPose.landmarks[8][0], handPose.landmarks[8][1], handPose.landmarks[4][0], handPose.landmarks[4][1]);
  // console.log(distance);
  // set the middle point of thumb and index finger tip
  pointX = width - (handPose.landmarks[8][0] + handPose.landmarks[4][0]) / 2 ;
  pointY = (handPose.landmarks[8][1] + handPose.landmarks[4][1]) / 2;

  if (distance <= pinchDistanceThreshold) { // within pinch threshold
 
    if(!isPinching){ // check pinch time
      if(checkPinchingStartTime == 0){ // start counting for pinch time
        checkPinchingStartTime = millis();
        console.log("start check:" + checkPinchingStartTime);
        return false;
      }
      else{ // already counting

        // done check -> red
        if(millis() - checkPinchingStartTime > checkPinchingTimeThreshold){
          isPinching = true;
          console.log("isPinching");
          push();
            midColor = color('yellow');
            fill(midColor);
            noStroke();
            circle(pointX , pointY, kpCircleDiameter);
          pop();
          return true;
        }
        // checking -> yellow
        push();
          midColor = color('yellow');
          fill(midColor);
          noStroke();
          circle(pointX , pointY, kpCircleDiameter);
        pop();
      }
    }
  }
  else { // out of pinch threshold -> blue
    
    push();
      midColor = color('blue');
      fill(midColor);
      noStroke();
      circle(pointX , pointY, kpCircleDiameter);
    pop();

    if(isPinching){// break pinching
      isPinching = false;
      checkPinchingStartTime = 0;
      console.log("end check:" + millis());
    }
    return false;
  }
  
}



