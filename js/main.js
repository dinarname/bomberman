/*----------------------- Переменне для загрузки изображений ----------------*/
let stoneImg, grassImg, brickImg;
let bombermanImg = {
  back: 0,
  front: 0,
  left: 0,
  right: 0,
};
/*----------------------------------------------------------------------------*/


/*----------------------------- Группы и спрайт  -----------------------------*/
let greenField;
let wall;
let bricks;
let bomberman;
/*----------------------------------------------------------------------------*/


/*---------------------------- Переменные для создания поля ------------------*/
let rows = 13;
let cols = 17;
let w;
/*----------------------------------------------------------------------------*/


/*---------------------------- Предзагрузка изображений ----------------------*/
function preload() {
  // Изображения для создания игрового поля
  grassImg = loadImage("sprites/Blocks/BackgroundTile.png");
  stoneImg = loadImage("sprites/Blocks/SolidBlock.png");
  brickImg = loadImage("sprites/Blocks/ExplodableBlock.png");

  // Изображения для анимации бомбермена
  bombermanImg.back = loadAnimation("sprites/Bomberman/Back/Bman_B_f00.png", "sprites/Bomberman/Back/Bman_B_f07.png");
  bombermanImg.front = loadAnimation("sprites/Bomberman/Front/Bman_F_f00.png", "sprites/Bomberman/Front/Bman_F_f07.png");
  bombermanImg.left = loadAnimation("sprites/Bomberman/Left/Bman_L_f00.png", "sprites/Bomberman/Left/Bman_L_f07.png");
  bombermanImg.right = loadAnimation("sprites/Bomberman/Right/Bman_R_f00.png", "sprites/Bomberman/Right/Bman_R_f07.png");
}
/*----------------------------------------------------------------------------*/


function setup() {
  let canvas = createCanvas(680, 520);
  canvas.parent('game');
  // w = width / cols;
  w = 40;

  greenField = new Group();
  wall = new Group();
  bricks = new Group();
  createScene();

  // Бомбермен. Создание. Анимация. Размер. Коллайдер. Движение.
  bomberman = createSprite(w * 1.5, w * 1.5, w, w);
  bomberman.addAnimation("back", bombermanImg.back);
  bomberman.addAnimation("front", bombermanImg.front);
  bomberman.addAnimation("left", bombermanImg.left);
  bomberman.addAnimation("right", bombermanImg.right);
  bomberman.setCollider("rectangle", 0, 8, w * 1.1, w * 2);

  bomberman.scale = w / 100;

  bomberman.depth = 2;

  for (element of greenField) {
    element.depth = 1;
  }

  for (element of wall) {
    element.depth = 1;
  }

}


function draw() {
  bombermanWalkFunction();
  bomberman.collide(wall);
  drawSprites();
}


/*-----------------------------Создание игрового поля ------------------------*/
function createScene() {
  let x = w / 2;
  let y = w / 2;

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {

      let element = createSprite(x, y, w, w);

      if ((i === 0 || i === rows - 1) ||
        (j === 0 || j === cols - 1) ||
        (i % 2 === 0 && j % 2 === 0)) {
        element.addImage(stoneImg);
        element.scale = w / element.width;
        wall.add(element);
      } else {
        element.addImage(grassImg);
        element.scale = w / element.width;

        // if (random(10) >= 8 && i !== 1 && i !== 2 && j !== 1) {
        //   let elementB = createSprite(x, y, w, w);
        //   elementB.addImage(brickImg);
        //   elementB.scale = w / elementB.width;
        //   elementB.mouseActive = true;
        //   bricks.add(elementB);
        //   element.coveredByBrick = true;
        // } else {
        //   element.coveredByBrick = false;
        // }

        greenField.add(element);

      }
      x += w;
    }
    x = w / 2;
    y += w;
  }
}
/*----------------------------------------------------------------------------*/



/*--------------- Функция для управления и анимации бомбермена ---------------*/
function bombermanWalkFunction() {

  let velocity = 2;
  bomberman.animation.play();
  bomberman.animation.frameDelay = 2;

  if (keyDown(UP_ARROW)) {
    bomberman.changeAnimation("back");
    bomberman.setVelocity(0, -velocity);
  }

  if (keyDown(DOWN_ARROW)) {
    bomberman.changeAnimation("front");
    bomberman.setVelocity(0, velocity);
  }

  if (keyDown(LEFT_ARROW)) {
    bomberman.changeAnimation("left");
    bomberman.setVelocity(-velocity, 0);
  }

  if (keyDown(RIGHT_ARROW)) {
    bomberman.changeAnimation("right");
    bomberman.setVelocity(velocity, 0);
  }

  if (!keyIsPressed) {
    bomberman.animation.stop();
    bomberman.setVelocity(0, 0);
  }

}
/*----------------------------------------------------------------------------*/