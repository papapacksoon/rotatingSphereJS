//Prerequested data
const canvas = document.querySelector(".sphereCanvas");
const visibleDotsQuantityInput = document.querySelector("#visibleDotsQuantity");
const visibleSignsQuantityInput = document.querySelector(
  "#visibleSignsQuantity"
);
const LOCAL_JSON_DATA_PATH = "./data.json";
const CANVAS_FONT_SIZE = 14;

//get canvas context and set context parameters
canvas.width = canvas.clientWidth;
canvas.height = canvas.clientHeight;
const ctx = canvas.getContext("2d");
ctx.font = CANVAS_FONT_SIZE + "px Arial";
ctx.lineWidth = 1;

// canvas main data
let canvasWidth = canvas.clientWidth;
let canvasHeight = canvas.clientHeight;
const sphereRadius = canvasHeight * 0.7;
const canvasCenterX = canvasWidth / 2;
const canvasCenterY = canvasHeight / 2;

// canvas operational data
let pauseCanvas = false;
let visibleDotsQuantity = Number(visibleDotsQuantityInput.value);
let visibleSignsQuantity = Number(visibleSignsQuantityInput.value);

// collsions for canvas onClick handler
let collisionRectangles = [];

//Dots input handler
function changeVisibleDotsQuantity(e) {
  inputValue = Number(e.target.value);
  if (inputValue > 1 && inputValue <= 200) {
    visibleDotsQuantity = inputValue;
  } else {
    visibleDotsQuantity = 0;
    console.log("Unexpected value (must be between 1 and 200");
  }
}

//Signs input handler
function changeVisibleSignsQuantity(e) {
  inputValue = Number(e.target.value);
  if (
    inputValue >= 0 &&
    inputValue <= 200 &&
    inputValue <= visibleDotsQuantity
  ) {
    visibleSignsQuantity = inputValue;
  } else {
    visibleSignsQuantity = 0;
    console.log(
      "Unexpected value (must be between 0 and 200 , and less or equal of visible Dots Quantity"
    );
  }
}

//canvas pause Handler
function onMouseEnterCanvas() {
  pauseCanvas = true;
}

//canvas unpause Handler
function onMouseLeaveCanvas() {
  pauseCanvas = false;
}

//canvas onClick hadler
function onMouseClickCanvas(e) {
  for (let i = 0; i < collisionRectangles.length; i++) {
    if (
      checkCollision(
        collisionRectangles[i],
        e.offsetX,
        e.offsetY + CANVAS_FONT_SIZE
      )
    ) {
      window.open("https://" + collisionRectangles[i].link);
      break;
    }
  }
}

//checking if collision wirhin rectangle
function checkCollision(rectData, x, y) {
  let left = rectData.coords.x;
  let top = rectData.coords.y;
  let right = rectData.coords.x + rectData.coords.w;
  let bottom = rectData.coords.y - rectData.coords.h;

  if (x >= left && x <= right && y <= bottom && y >= top) {
    return true;
  } else {
    return false;
  }
}

//Getting data from json
async function getLocalJsonData(localJsonDataPath) {
  let result = await fetch(localJsonDataPath)
    .then((result) => result.json())
    .catch((error) => {
      console.error("Cannot load shpere data " + error);
      return false;
    });

  return result;
}

//get random dot coords inside Sphere
function getRandomDotCoords() {
  //theta angle from 0 to 360
  let theta = Math.floor(Math.random() * 2 * Math.PI * 100) / 100;
  // phi angle from 0 to 180
  let phi = Math.floor(Math.random() * Math.PI * 100) / 100;

  return { phi, theta };
}

//convert spheric to xyz and project it to 2D canvas
function dotCoordsConversion(phi, theta) {
  //get xyz coords
  let x = sphereRadius * Math.sin(phi) * Math.cos(theta);
  let y = sphereRadius * Math.cos(phi);
  let z = sphereRadius * Math.sin(phi) * Math.sin(theta) + sphereRadius;

  //get projectiles
  let scale = sphereRadius / (sphereRadius + z);
  let x2D = Math.floor((x * scale + canvasCenterX) * 100) / 100;
  let y2D = Math.floor((y * scale + canvasCenterY) * 100) / 100;

  return { x2D, y2D };
}

//initialize sphere
function initializeSphere(sphereInitData) {
  if (!sphereInitData) return;

  let sphereData = {
    dotsCount: visibleDotsQuantity,
    signsCount: visibleSignsQuantity,
    items: [],
  };

  //generating new phi and theta angles for dots
  for (let sphereItem of sphereInitData) {
    let dot = getRandomDotCoords();
    sphereData.items.push({
      ...sphereItem,
      phi: dot.phi,
      theta: dot.theta,
      x2D: 0,
      y2D: 0,
    });
  }

  //first draw initialize
  window.requestAnimationFrame(() => {
    updateSphere(sphereData);
  });
}

//update sphere tick
function updateSphere(sphereData) {
  //checking pause
  if (!pauseCanvas) {
    //updating data before redrawing
    sphereData.dotsCount = visibleDotsQuantity;
    sphereData.signsCount = visibleSignsQuantity;
    //clear canvas before redrawing
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    //clear collision rects
    collisionRectangles = [];

    //count movement and projection
    sphereData.items.map((sphereItem) => {
      if (sphereItem.theta + 0.01 > 2 * Math.PI) {
        sphereItem.theta = sphereItem.theta - (2 * Math.PI - 0.01);
      } else {
        sphereItem.theta += 0.01;
      }

      let dotProjectile = dotCoordsConversion(sphereItem.phi, sphereItem.theta);
      sphereItem.x2D = dotProjectile.x2D;
      sphereItem.y2D = dotProjectile.y2D;
    });

    if (visibleDotsQuantity + visibleSignsQuantity > 200) {
      visibleDotsQuantity = 200 - visibleSignsQuantity;
    }
    let currentDotsCount = 0;

    //drawing dots and signs
    for (let i = 0; i < visibleDotsQuantity + visibleSignsQuantity; i++) {
      if (currentDotsCount < visibleDotsQuantity) {
        //drawing dots
        ctx.beginPath();
        ctx.arc(
          sphereData.items[i].x2D,
          sphereData.items[i].y2D,
          3,
          0,
          2 * Math.PI
        );
        ctx.stroke();
        sphereData.items[i].filled
          ? (ctx.fillStyle = "#000000")
          : (ctx.fillStyle = "#FFFFFF");

        ctx.fill();
        currentDotsCount++;
      } else {
        //drawing sign rectangle
        ctx.fillStyle = "#F0F0F0";
        let width =
          Math.floor(ctx.measureText(sphereData.items[i].company).width * 100) /
          100;
        ctx.fillRect(
          sphereData.items[i].x2D,
          sphereData.items[i].y2D + Math.ceil(CANVAS_FONT_SIZE / 5),
          width,
          -CANVAS_FONT_SIZE
        );
        //update collsions array
        collisionRectangles.push({
          coords: {
            x: sphereData.items[i].x2D,
            y: sphereData.items[i].y2D + Math.ceil(CANVAS_FONT_SIZE / 5),
            w: width,
            h: -CANVAS_FONT_SIZE,
          },
          link: sphereData.items[i].link,
        });
        //drawing sign
        ctx.strokeText(
          sphereData.items[i].company,
          sphereData.items[i].x2D,
          sphereData.items[i].y2D
        );
      }
    }
  }
  //update loop
  window.requestAnimationFrame(() => {
    updateSphere(sphereData);
  });
}

//adding event listeners on input change
visibleDotsQuantityInput.addEventListener("input", changeVisibleDotsQuantity);
visibleSignsQuantityInput.addEventListener("input", changeVisibleSignsQuantity);
canvas.addEventListener("mouseover", onMouseEnterCanvas);
canvas.addEventListener("mouseout", onMouseLeaveCanvas);
canvas.addEventListener("click", onMouseClickCanvas);

//starting canvas sphere
getLocalJsonData(LOCAL_JSON_DATA_PATH).then((data) => {
  initializeSphere(data);
});
