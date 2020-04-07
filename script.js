//Prerequested data
const canvas = document.querySelector(".sphereCanvas");
const visibleDotsQuantityInput = document.querySelector("#visibleDotsQuantity");
const visibleSignsQuantityInput = document.querySelector(
  "#visibleSignsQuantity"
);
const localJsonDataPath = "./data.json";

let ctx = canvas.getContext("2d");
let pause = false;
let visibleDotsQuantity = visibleDotsQuantityInput.value;
let visibleSignsQuantity = visibleSignsQuantityInput.value;

//Dots input handler
function changeVisibleDotsQuantity(e) {
  inputValue = Number(e.target.value);
  if (inputValue > 1 && inputValue <= 100) {
    visibleDotsQuantity = inputValue;
  } else {
    visibleDotsQuantity = 0;
    console.log("Unexpected value (must be between 1 and 100");
  }
}

//Signs input handler
function changeVisibleSignsQuantity(e) {
  inputValue = Number(e.target.value);
  if (
    inputValue > 1 &&
    inputValue <= 100 &&
    inputValue <= visibleDotsQuantity
  ) {
    visibleSignsQuantity = e.target.value;
  } else {
    visibleSignsQuantity = 0;
    console.log(
      "Unexpected value (must be between 1 and 100 , and less or equal of visible Dots Quantity"
    );
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

//initialize sphere
function initializeSphere(sphereInitData) {
  if (!sphereInitData) return;

  let sphereData = {
    sphereRadius: 100,
    dotsCount: visibleDotsQuantity,
    signsCount: visibleSignsQuantity,
    items: [],
  };

  //counting new radius
  sphereData.sphereRadius =
    canvas.width >= canvas.height
      ? canvas.width / 2 - 20
      : canvas.height / 2 - 20;

  ctx.font = "8px Arial";
  ctx.lineWidth = 0.7;

  //generating new x and y for dots
  for (let sphereItem of sphereInitData) {
    sphereData.items.push({
      ...sphereItem,
      x:
        Math.floor(sphereData.sphereRadius * Math.random()) -
        sphereData.sphereRadius / 2,
      y:
        Math.floor(sphereData.sphereRadius * Math.random()) -
        sphereData.sphereRadius / 2,
    });
  }

  //first draw initialize
  updateSphere(sphereData);
}

//update sphere tick
function updateSphere(sphereData) {
  //updating data before redrawing
  sphereData.dotsCount = visibleDotsQuantity;
  sphereData.signsCount = visibleSignsQuantity;

  //centering canvas
  ctx.translate(canvas.width / 2, canvas.height / 2);

  //counting new dots position
  let currentSignCount = 0;
  //drawing dots

  for (let i = 0; i < visibleDotsQuantity; i++) {
    if (currentSignCount < visibleSignsQuantity) {
      ctx.strokeText(
        sphereData.items[i].company,
        sphereData.items[i].x,
        sphereData.items[i].y
      );
      currentSignCount++;
    } else {
      ctx.beginPath();
      ctx.arc(
        sphereData.items[i].x,
        sphereData.items[i].y,
        2,
        0,
        2 * Math.PI,
        false
      );
      sphereData.items[i].filled
        ? (ctx.fillStyle = "#000000")
        : (ctx.fillStyle = "#FFFFFF");
      ctx.fill();
      ctx.stroke();
    }
  }
}

//adding event listeners on input change
visibleDotsQuantityInput.addEventListener("input", changeVisibleDotsQuantity);
visibleSignsQuantityInput.addEventListener("input", changeVisibleSignsQuantity);

getLocalJsonData(localJsonDataPath).then((data) => {
  initializeSphere(data);
});
