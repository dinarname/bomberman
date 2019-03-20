/*----------------------- Переменне для загрузки изображений ----------------*/
let stoneImg, grassImg, brickImg;
let bombermanImg = {
  back: 0,
  front: 0,
  left: 0,
  right: 0,
};
let enemyImg = {
  back: 0,
  front: 0,
  left: 0,
  right: 0,
};

let bombImg;

let explosionImg = {
  center: 0,
  beam: 0,
};

/*----------------------------------------------------------------------------*/


/*----------------------------- Группы и спрайт  -----------------------------*/
let greenField;
let wall;
let bricks;
let enemies;
let bombs;
let expl;

let bomberman;
/*----------------------------------------------------------------------------*/


/*---------------------------- Переменные для создания поля ------------------*/
let rows = 13;
let cols = 17;
let w;
/*----------------------------------------------------------------------------*/

/*-------------------------- Звуки -------------------------------*/
let explosionSound;
let walkingSound;
let crashSound;
let hitSound;
let missionPassed;
let missionFailed;
/*----------------------------------------------------------------------------*/

/*-------------------------- Счетчик жизней + состояние игры------------------*/
let lifesDisplay;
let invinsibilityTimer;
let gameOver;
let gameStarted;
/*----------------------------------------------------------------------------*/

/*---------------------------- Предзагрузка изображений и звуков -------------*/
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

  // Изображения для анимации врага
  enemyImg.back = loadAnimation("sprites/Creep/Back/Creep_B_f00.png", "sprites/Creep/Back/Creep_B_f05.png");
  enemyImg.front = loadAnimation("sprites/Creep/Front/Creep_F_f00.png", "sprites/Creep/Front/Creep_F_f05.png");
  enemyImg.left = loadAnimation("sprites/Creep/Left/Creep_L_f00.png", "sprites/Creep/Left/Creep_L_f05.png");
  enemyImg.right = loadAnimation("sprites/Creep/Right/Creep_R_f00.png", "sprites/Creep/Right/Creep_R_f05.png");

  // Изображения для анимации бомбы
  bombImg = loadAnimation("sprites/Bomb/Bomb_f01.png", "sprites/Bomb/Bomb_f03.png");

  // Изобраджения для анимации взрыва
  explosionImg.center = loadAnimation("sprites/Explosion/center-00.png", "sprites/Explosion/center-05.png");
  explosionImg.beam = loadAnimation("sprites/Explosion/beam-end-00.png", "sprites/Explosion/beam-end-05.png");

  // Звуки
  explosionSound = loadSound("sound/bomb.wav");
  walkingSound = loadSound("sound/menu_click.wav");
  missionPassed = loadSound("sound/missionpassed.wav");
  hitSound = loadSound("sound/plyr_death.wav");
  crashSound = loadSound("sound/crash.wav");
  missionFailed = loadSound("sound/missionfailed.wav");
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
  bomberman.lifesCounter = 3;
  bomberman.invinsible = false;
  // Бомба
  bombs = new Group();


  // Враг. Создание. Анимация. Размер.
  // Чтобы поместить врагов в свободные от кирпичей ячейки - соберём координаты
  // этих ячеек в массив

  let positionOnGrassWithoutBricks = [];
  for (element of greenField) {
    if (!element.coveredByBrick) {
      positionOnGrassWithoutBricks.push(element.position);
    }
  }

  enemies = new Group();
  for (let i = 0; i < 10; i++) {
    let freeRandomPosition = floor(random(positionOnGrassWithoutBricks.length));
    let x = positionOnGrassWithoutBricks[freeRandomPosition].x;
    let y = positionOnGrassWithoutBricks[freeRandomPosition].y;
    let enemy = createSprite(x, y, w, w);

    enemy.addAnimation("back", enemyImg.back);
    enemy.addAnimation("front", enemyImg.front);
    enemy.addAnimation("left", enemyImg.left);
    enemy.addAnimation("right", enemyImg.right);

    enemy.scale = w / 70;
    enemy.setCollider("rectangle", 0, 0, wall[0].width, wall[0].height);

    if (random(10) >= 5) {
      enemy.velocity.x = random(10) >= 5 ? -1 : 1;
    } else {
      enemy.velocity.y = random(10) >= 5 ? -1 : 1;
    }

    enemies.add(enemy);
  }


  // Указываем слои для отображения спрайтов
  bomberman.depth = 2;

  for (element of greenField) {
    element.depth = 1;
  }

  for (element of wall) {
    element.depth = 1;
  }

  for (element of bricks) {
    element.depth = 1;
  }

  lifesDisplay = document.getElementById("lives");
  lifesDisplay.textContent = bomberman.lifesCounter;

  gameOver = document.getElementById("gameover");
  gameOver.textContent = "Press any key to start";
  gameStarted = false;
  document.addEventListener('keypress', onGameStart);
}


function draw() {
  if (!gameStarted) {
    noLoop();
  }
  bombermanWalkFunction();
  bomberman.collide(wall);
  bomberman.collide(bricks);
  if (!bomberman.invinsible) {
    bomberman.collide(enemies, onBomberManHit);
  }
  enemies.collide(wall, enemyChangeDirection);
  enemies.collide(bricks, enemyChangeDirection);
  enemies.collide(bomberman, enemyChangeDirection);

  if (keyWentDown(" ")) {
    createBomb();
  }

  for (bomb of bombs) {
    bomb.explosion.init();
  }

  enemies.collide(bombs, enemyChangeDirection);
  // Проверяем, не прошла ли неуязвимость после последнего получения урона
  if (frameCount - invinsibilityTimer > 100) {
    bomberman.invinsible = false;
  }
  // Условие поражения
  if (bomberman.lifesCounter <= 0) {
    onLoss();
  }
  //Условие победы
  if (enemies.length == 0) {
    onWin();
  }
  drawSprites();
}


/*------------------- Функция для создания игрового поля ---------------------*/
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

        if (random(10) >= 8 && i !== 1 && i !== 2 && j !== 1) {
          let elementB = createSprite(x, y, w, w);
          elementB.addImage(brickImg);
          elementB.scale = w / elementB.width;
          bricks.add(elementB);
          element.coveredByBrick = true;
        } else {
          element.coveredByBrick = false;
        }

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



  if (keyIsPressed && !walkingSound.isPlaying()) {
    walkingSound.setVolume(0.1);
    walkingSound.stop();
    walkingSound.play();
  }

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


/*------------------ Движение врагов ------------------------------------*/
function enemyChangeDirection() {
  if (this.velocity.x !== 0) {
    this.velocity.x = 0;
    this.velocity.y = random(10) >= 5 ? -1 : 1;
  } else if (this.velocity.y !== 0) {
    this.velocity.x = random(10) >= 5 ? -1 : 1;
    this.velocity.y = 0;
  }

  // Поворот спрайта
  if (this.velocity.x > 0) {
    this.changeAnimation("right");
  } else if (this.velocity.x < 0) {
    this.changeAnimation("left");
  }

  if (this.velocity.y > 0) {
    this.changeAnimation("front");
  } else if (this.velocity.y < 0) {
    this.changeAnimation("back");
  }

}
/*----------------------------------------------------------------------------*/


/*------------------------ Создание бомбы -------------------------------*/
function createBomb() {
  // Ставим бомбу в сетку
  let x = bomberman.position.x;
  let y = bomberman.position.y;
  x = floor(x / w) * w + w / 2;
  y = floor(y / w) * w + w / 2;

  let b = createSprite(x, y);
  b.addAnimation("flame", bombImg);
  b.scale = w / 60;
  b.life = 100;
  b.explosion = new explosion(x, y);
  bombs.add(b);
}
/*----------------------------------------------------------------------------*/

/*------------------------ Анимация взрыва -----------------------------*/

function explosion(x, y) {
  let expl = new Group();
  let timer = frameCount;
  let isCreated = false;

  this.init = function() {
    if (frameCount - timer > 65) {
      if (!isCreated) {
        this.create();
        explosionSound.play();
      }

      this.wallExeption();
      this.hit();
    }
  }

  this.create = function() {
    // Центр взрыва
    let centerExplosion = createSprite(x, y);
    centerExplosion.addAnimation("center", explosionImg.center);
    expl.add(centerExplosion);

    // Правый луч
    let rightBeam = createSprite(x + w, y);
    rightBeam.addAnimation("right", explosionImg.beam);
    expl.add(rightBeam);

    // Нижний луч
    let bottomBeam = createSprite(x, y + w);
    bottomBeam.addAnimation("bottom", explosionImg.beam);
    bottomBeam.rotation = 90;
    expl.add(bottomBeam);

    // Левый луч
    let leftBeam = createSprite(x - w, y);
    leftBeam.addAnimation("left", explosionImg.beam);
    leftBeam.rotation = 180;
    expl.add(leftBeam);

    // Верхний луч
    let topBeam = createSprite(x, y - w);
    topBeam.addAnimation("top", explosionImg.beam);
    topBeam.rotation = -90;
    expl.add(topBeam);


    for (element of expl) {
      element.scale = w / 49;
      element.life = 35;
      element.animation.frameDelay = 5;
    }

    isCreated = true;
  };

  // Удаляем лучи от взрыва, если касается стены
  this.wallExeption = function() {
    for (beam of expl) {
      beam.overlap(wall, beam.remove);
    }
  };

  // Удаляем ирпичи, если их коснулся взрыв
  this.hit = function() {
    for (brick of bricks) {
      for (beam of expl) {
        brick.overlap(beam, function() {
          brick.remove();
          crashSound.play();
        });
      }
    }

    // Удаляем врагов, если их коснулся взрыв
    for (enemy of enemies) {
      for (beam of expl) {
        enemy.overlap(beam, enemy.remove);
      }
    }

    // Отнимаем жизни у бомбермена, если он коснулся взрыва
    for (beam of expl) {
      if (!bomberman.invinsible) {
        beam.overlap(bomberman, onBomberManHit);
      }
    }

  };


}

/*Если бобмермен коллайдится с взрывом, отнимаем жизнь и делаем его неуязвимым
на несколько секунд, чтобы он не наполучал еще, пока продолжает коллайдиться с
спрайтом взрыва; обновляем количество жизней*/
function onBomberManHit() {
  bomberman.lifesCounter -= 1;
  bomberman.invinsible = true;
  invinsibilityTimer = frameCount;
  lifesDisplay.textContent = bomberman.lifesCounter;
  hitSound.play();
}

function onLoss() {
  missionFailed.play()
  noLoop();
  gameOver.textContent = "WASTED";
  gameOver.style.visibility = "visible";
}

function onWin() {
  missionPassed.play();
  noLoop();
  gameOver.textContent = "MISSION PASSED! RESPECT+";
  gameOver.style.visibility = "visible";
}

function onGameStart() {
  gameStarted = true;
  loop();
  gameOver.style.visibility = "hidden";
  document.removeEventListener('keypress', onGameStart);
}
/*----------------------------------------------------------------------------*/
