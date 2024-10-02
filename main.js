import "./style.css";
import Phaser from "phaser";

const gameStartDiv = document.querySelector("#gameStartDiv");
const gameStartBtn = document.querySelector("#gameStartBtn");
const gameEndDiv = document.querySelector("#gameEndDiv");
const gameWinLosSpan = document.querySelector("#gameWinLoseSpan");
const gameEndScorSpan = document.querySelector("#gameEndScoreSpan");
const refresh = document.querySelector("#refresh");

const sizes = {
  width: 1600,
  height: 600,
};

let drones = [];
let blueDefence = [];
let redDefence = [];
let followStrikerRed = true; // To control when assist stops following the striker
let followBlueStriker = true; // To control when assist stops following the striker
let targetDefenseBlue;
let targetDefenseRed;
let goTowardsPostBlue = false;
let goTowardsPostRed = false;
let bars = [];
let dxBs = Phaser.Math.Between(0, 800);
let dyBS = Phaser.Math.Between(0, 600);
let bSDistance = Math.sqrt(dxBs * dxBs + dyBS * dyBS);

class GameScene extends Phaser.Scene {
  constructor() {
    super("scene-game");
    this.rSDrone;
    this.rADrone;
    this.bSDrone;
    this.bADrone;
    this.rDDrones;
    this.bDDrones;
    this.cursor;
    this.droneSpeed = 180;
    this.r1;
    this.r2;
    this.r3;
    this.b1;
    this.b2b;
    this.b3;
    this.timeLeft = 120;
    this.timeLeftText;
    this.timeEvent;
    this.secondsElapsed = 0;
    this.redGoal = 0;
    this.redSBack = true;
    this.blueGoal = 0;
    this.blueSBack = true;
  }

  preload() {
    this.load.image("court", "/assets/bg.jpg");
    this.load.image("redPost", "/assets/redBar.png");
    this.load.image("bluePost", "/assets/bluebar.png");
    this.load.image("rDDrone", "/assets/redDrone.png");
    this.load.image("rADrone", "/assets/redDroneA.png");
    this.load.image("rSDrone", "/assets/redDroneS.png");
    this.load.image("bDDrone", "/assets/blueDrone.png");
    this.load.image("bADrone", "/assets/blueDroneA.png");
    this.load.image("bSDrone", "/assets/blueDroneS.png");
    this.load.image("bar", "/assets/bar.png");
  }

  create() {
    this.reload();
    this.scene.pause();
    this.add.image(-0.5, -0.5, "court").setOrigin(0, 0);
    this.add.image(30, 300, "redPost").setScale(0.7);
    this.add.image(1570, 300, "bluePost").setScale(0.7);
    this.centreLine = this.physics.add
      .sprite(800, 0, "court")
      .setOrigin(0, 0)
      .setImmovable(true)
      .setScale(0.0015, 1)
      .setVisible(false)
      .setBounce(1);

    this.r1Bar = this.physics.add.sprite(80, 225, "bar").setScale(0.55, 0.4);
    this.r2Bar = this.physics.add.sprite(80, 375, "bar").setScale(0.55, 0.4);
    this.r3Bar = this.physics.add.sprite(50, 225, "bar").setScale(0.55, 0.4);
    this.r4Bar = this.physics.add.sprite(50, 375, "bar").setScale(0.55, 0.4);
    this.b1Bar = this.physics.add.sprite(1600, 220, "bar").setScale(0.55, 0.4);
    this.b2Bar = this.physics.add.sprite(1600, 375, "bar").setScale(0.55, 0.4);
    this.b3Bar = this.physics.add.sprite(1570, 220, "bar").setScale(0.55, 0.4);
    this.b4Bar = this.physics.add.sprite(1570, 375, "bar").setScale(0.55, 0.4);
    bars.push(this.r1Bar);
    bars.push(this.r2Bar);
    bars.push(this.b1Bar);
    bars.push(this.b2Bar);
    bars.push(this.b3Bar);
    bars.push(this.b4Bar);
    bars.push(this.r3Bar);
    bars.push(this.r4Bar);
    for (let bar of bars) {
      bar.setImmovable(true).setVisible(false).setBounce(1);
      bar.body.setCircle(20, 0, 10);
    }

    this.r1 = this.physics.add.sprite(100, 100, "rDDrone").setScale(0.07);
    this.r2 = this.physics.add.sprite(200, 300, "rDDrone").setScale(0.07);
    this.r3 = this.physics.add.sprite(100, 500, "rDDrone").setScale(0.07);
    redDefence.push(this.r1);
    redDefence.push(this.r2);
    redDefence.push(this.r3);
    this.rSDrone = this.physics.add.sprite(300, 400, "rSDrone").setScale(0.07);
    this.rADrone = this.physics.add.sprite(300, 200, "rADrone").setScale(0.07);
    this.rSDrone.setCollideWorldBounds(true);
    this.rADrone.setCollideWorldBounds(true);
    this.r1.setCollideWorldBounds(true);
    this.r2.setCollideWorldBounds(true);
    this.r3.setCollideWorldBounds(true);

    this.b1 = this.physics.add.sprite(1500, 100, "bDDrone").setScale(0.07);
    this.b2 = this.physics.add.sprite(1400, 300, "bDDrone").setScale(0.07);
    this.b3 = this.physics.add.sprite(1500, 500, "bDDrone").setScale(0.07);
    blueDefence.push(this.b1);
    blueDefence.push(this.b2);
    blueDefence.push(this.b3);
    this.bSDrone = this.physics.add.sprite(1200, 400, "bSDrone").setScale(0.07);
    this.bADrone = this.physics.add.sprite(1200, 200, "bADrone").setScale(0.07);
    this.bADrone.setCollideWorldBounds(true);
    this.bSDrone.setCollideWorldBounds(true);
    this.bSDrone.setVelocity(120, 0);
    this.b1.setCollideWorldBounds(true);
    this.b2.setCollideWorldBounds(true);
    this.b3.setCollideWorldBounds(true);

    this.rSDrone.setBounce(0.5);
    this.rADrone.setBounce(0.5);
    this.bADrone.setBounce(0.5);
    this.bSDrone.setBounce(0.5);
    this.r1.setBounce(0.5);
    this.r2.setBounce(0.5);
    this.r3.setBounce(0.5);
    this.b1.setBounce(0.5);
    this.b2.setBounce(0.5);
    this.b3.setBounce(0.5);

    // drones.push(this.rADrone);
    drones.push(this.rSDrone);
    // drones.push(this.bADrone);
    drones.push(this.bSDrone);
    drones.push(this.r1);
    drones.push(this.r2);
    drones.push(this.r3);
    drones.push(this.b1);
    drones.push(this.b3);
    drones.push(this.b2);

    for (let drone of drones) {
      drone.body.setCircle(480, 70, 70);
      drone.setDrag(20);
    }

    this.cursor = this.input.keyboard.createCursorKeys();
    this.physics.add.collider(drones, drones);
    this.physics.add.collider(drones, bars, null, null, this);
    this.physics.add.collider(blueDefence, this.centreLine);
    this.physics.add.collider(redDefence, this.centreLine);
    this.createScoreAndTime();
  }

  update() {
    if (this.timeLeft <= 0) {
      this.gameOver();
    }
    const { left, right, up, down } = this.cursor;
    if (left.isDown) {
      this.rSDrone.setVelocityX(-this.droneSpeed);
    }
    if (right.isDown) {
      this.rSDrone.setVelocityX(this.droneSpeed);
    }
    if (up.isDown) {
      this.rSDrone.setVelocityY(-this.droneSpeed);
    }
    if (down.isDown) {
      this.rSDrone.setVelocityY(this.droneSpeed);
    }

    if (followStrikerRed) {
      // Calculate direction for Assist to follow the Striker
      let dx = this.rSDrone.x - this.rADrone.x;
      let dy = this.rSDrone.y - this.rADrone.y;
      let distance = Math.sqrt(dx * dx + dy * dy);

      if (200 < this.rSDrone.x && this.rSDrone.x < 1000 && distance > 100) {
        this.rADrone.setVelocity((dx / distance) * 160, (dy / distance) * 160);
      }

      // Check if the assist has crossed the midfield
      if (this.rSDrone.x > 800) {
        followStrikerRed = false;
        if (!followStrikerRed) {
          targetBlueRandomDefense();
        }
      }
    } else {
      if (this.rSDrone.x < 800) {
        followStrikerRed = true;
      }
      if (targetDefenseBlue) {
        moveAssistTowardsTarget(targetDefenseBlue, this.rADrone);
      }
    }
    if (this.rSDrone.x > 800) {
      blueDefence.forEach((defense) => {
        moveBlueDefenseTowardsStriker(defense, this.rSDrone);
      });
      goTowardsPostBlue = true;
    } else {
      blueDefence.forEach((defense) => {
        moveBlueDefenseTowardsPost(defense);
      });
    }

    // Blue Defence
    for (let defence of blueDefence) {
      if (defence.x < 830) {
        defence.x = 830;
      }
    }
    // Red Defence
    for (let defence of redDefence) {
      if (defence.x > 770) {
        defence.x = 770;
      }
    }

    // Assist follows the striker until it crosses the midfield
    if (followBlueStriker) {
      // Calculate direction for Assist to follow the Striker
      let dx = this.bSDrone.x - this.bADrone.x;
      let dy = this.bSDrone.y - this.bADrone.y;
      let distance = Math.sqrt(dx * dx + dy * dy);

      if (this.bSDrone.x < 1200) {
        this.bADrone.setVelocity((dx / distance) * 100, (dy / distance) * 100);
      }
      // Check if the assist has crossed the midfield
      if (this.bSDrone.x < 800 && this.blueSBack) {
        followBlueStriker = false;

        targetRedRandomDefense(); // Start targeting a defense player
      }
    } else {
      // Move towards the target defense player
      if (targetDefenseRed) {
        moveBlueAssistTowardsTarget(targetDefenseRed, this.bADrone);
      }
      if (this.bSDrone.x >= 800) {
        followBlueStriker = true;
      }
    }
    if (this.blueSBack) {
      moveOpponentTowardsGoal(this.bSDrone);
    } else {
      moveOpponentTowardsBack(this.bSDrone);
    }
    if (this.bSDrone.x < 800) {
      redDefence.forEach((defense) => {
        moveRedDefenseTowardsStriker(defense, this.bSDrone);
      });
    } else {
      redDefence.forEach((defense) => {
        moveRedDefenseTowardsPost(defense);
      });
    }

    if (this.bSDrone.x > 800) {
      if (this.blueSBack) {
        this.bSDrone.setVelocity(-160, 20);
      } else {
        let dxBs = Phaser.Math.Between(1550, 1600);
        let dyBS = Phaser.Math.Between(350, 600);
        let bSDistance = Math.sqrt(dxBs * dxBs + dyBS * dyBS);
        this.bSDrone.setVelocity(
          (dxBs / bSDistance) * 200,
          (dyBS / bSDistance) * 20
        );
      }
    }

    this.goalCheck();
    this.backCheck();
  }

  createScoreAndTime() {
    this.scoreText = this.add.text(
      690,
      10,
      "Red " + this.redGoal + ":" + this.blueGoal + " Blue",
      {
        fontFamily: "Arial",
        fontSize: "40px",
        color: "#ff00ff",
        fontStyle: "bold",
        align: "center",

        shadow: {
          offsetX: 2,
          offsetY: 2,
          color: "#000000",
          blur: 5,
          stroke: true,
          fill: true,
        },
      }
    );
    this.scoreText.setAlpha(0.8);

    this.timeLeftText = this.add.text(
      680,
      550,
      "Time Left: " + this.timeLeft / 60 + "min",
      {
        fontFamily: "Arial",
        fontSize: "32px",
        color: "#ff00ff",
      }
    );

    this.timeEvent = this.time.addEvent({
      delay: 1000, // Update every second (1000 ms)
      callback: () => {
        this.timeLeft--;
        this.timeLeftText.setText(
          "Time Left: " +
            Math.floor(this.timeLeft / 60) +
            "min " +
            (this.timeLeft % 60) +
            "s"
        );
      },
      callbackScope: this,
      loop: true, // Keep looping the event
    });
  }

  goalCheck() {
    if (
      250 < this.rSDrone.y &&
      this.rSDrone.y < 350 &&
      this.rSDrone.x > 1550 &&
      this.redSBack
    ) {
      this.redGoal += 1;
      this.scoreText.setText(
        "Red " + this.redGoal + ":" + this.blueGoal + " Blue"
      );
      let goalText1 = this.add.text(650, 250, "Red Team Goal!!!", {
        fontFamily: "Arial",
        fontSize: "40px",
        color: "#55ff55",
        fontStyle: "bold",
        align: "center",
      });
      let goalText2 = this.add.text(
        500,
        290,
        "Go back to touch your base line",
        {
          fontFamily: "Arial",
          fontSize: "40px",
          color: "#ff0000",
          fontStyle: "bold",
          align: "center",
        }
      );
      setTimeout(() => {
        goalText1.destroy();
        goalText2.destroy();
      }, 3000);
      this.redSBack = false;
    } else if (
      250 < this.rSDrone.y &&
      this.rSDrone.y < 350 &&
      this.rSDrone.x > 1550 &&
      !this.redSBack
    ) {
      let goalText2 = this.add.text(
        500,
        290,
        "Go back to touch your base line",
        {
          fontFamily: "Arial",
          fontSize: "40px",
          color: "#ff0000",
          fontStyle: "bold",
          align: "center",
        }
      );
      setTimeout(() => {
        goalText2.destroy();
      }, 2000);
    }

    if (
      250 < this.bSDrone.y &&
      this.bSDrone.y < 350 &&
      this.bSDrone.x < 50 &&
      this.blueSBack
    ) {
      this.blueGoal += 1;
      this.scoreText.setText(
        "Red " + this.redGoal + ":" + this.blueGoal + " Blue"
      );
      let goalText1 = this.add.text(650, 250, "Blue Team Goal!!!", {
        fontFamily: "Arial",
        fontSize: "40px",
        color: "#ff5555",
        fontStyle: "bold",
        align: "center",
      });
      followBlueStriker = true;

      setTimeout(() => {
        goalText1.destroy();
      }, 3000);
      this.blueSBack = false;
    }
  }

  backCheck() {
    if (this.rSDrone.x < 40) {
      this.redSBack = true;
    }
    if (this.bSDrone.x > 1550) {
      this.blueSBack = true;
    }
  }

  reload() {
    this.timeLeft = 120;
    this.timeLeftText;
    this.timeEvent;
    this.secondsElapsed = 0;
    this.redGoal = 0;
    this.redSBack = true;
    this.blueGoal = 0;
    this.blueSBack = true;
  }

  gameOver() {
    if (this.blueGoal < this.redGoal) {
      gameEndScorSpan.textContent =
        "Red team " + this.redGoal + ":" + this.blueGoal + " Blue team";
      gameWinLosSpan.textContent = "You Win !!!";
    } else if (this.blueGoal == this.redGoal) {
      gameEndScorSpan.textContent =
        "Red team " + this.redGoal + ":" + this.blueGoal + " Blue team";
      gameWinLosSpan.textContent = "Draw !!!";
    } else {
      gameEndScorSpan.textContent =
        "Red team " + this.redGoal + ":" + this.blueGoal + " Blue team";
      gameWinLosSpan.textContent = "You Lose !!!";
    }
    gameEndDiv.style.display = "flex";
    this.scene.pause();
  }
}

function targetRedRandomDefense() {
  targetDefenseRed = redDefence[Phaser.Math.Between(0, blueDefence.length - 1)];
}

function targetBlueRandomDefense() {
  targetDefenseBlue =
    blueDefence[Phaser.Math.Between(0, blueDefence.length - 1)];
}

function moveAssistTowardsTarget(defense, assist) {
  // Move the assist towards the targeted defense player
  let dx = defense.x - assist.x;
  let dy = defense.y - assist.y;
  let distance = Math.sqrt(dx * dx + dy * dy);

  if (distance > 70) {
    assist.setVelocity((dx / distance) * 160, (dy / distance) * 160);
  } else {
    // When assist collides with defense, choose a new target
    targetBlueRandomDefense();
  }
}
function moveBlueAssistTowardsTarget(defense, assist) {
  // Move the assist towards the targeted defense player
  let dx = defense.x - assist.x;
  let dy = defense.y - assist.y;
  let distance = Math.sqrt(dx * dx + dy * dy);

  if (distance > 77) {
    assist.setVelocity((dx / distance) * 160, (dy / distance) * 160);
  } else {
    // When assist collides with defense, choose a new target
    targetRedRandomDefense();
  }
}
function moveBlueDefenseTowardsStriker(defense, striker) {
  if (striker.x > 800) {
    // Only react when the striker crosses the midfield
    let dx = striker.x - defense.x;
    let dy = striker.y - defense.y;
    let distance = Math.sqrt(dx * dx + dy * dy);

    // Move towards the striker but stop at the midfield
    if (distance > 1) {
      defense.setVelocity((dx / distance) * 160, (dy / distance) * 160);
    }
  }
}
function moveBlueDefenseTowardsPost(defense) {
  if (goTowardsPostBlue == true) {
    // Only react when the striker crosses the midfield
    let x = Phaser.Math.Between(1300, 1500);
    let y = Phaser.Math.Between(100, 500);
    let dx = x - defense.x;
    let dy = y - defense.y;
    let distance = Math.sqrt(dx * dx + dy * dy);

    // Move towards the striker but stop at the midfield
    if (distance > 1) {
      defense.setVelocity((dx / distance) * 160, (dy / distance) * 160);
    }
  }
  if (1500 > defense.x && defense.x > 1400) {
    goTowardsPostBlue = false;
  } else {
    goTowardsPostBlue = true;
  }
}
function moveRedDefenseTowardsStriker(defense, striker) {
  if (striker.x < 800) {
    // Only react when the striker crosses the midfield
    let dx = striker.x - defense.x;
    let dy = striker.y - defense.y;
    let distance = Math.sqrt(dx * dx + dy * dy);

    // Move towards the striker but stop at the midfield
    if (distance > 1) {
      defense.setVelocity((dx / distance) * 140, (dy / distance) * 140);
    }
  }
}
function moveRedDefenseTowardsPost(defense) {
  if (goTowardsPostRed == true) {
    // Only react when the striker crosses the midfield
    let x = Phaser.Math.Between(100, 300);
    let y = Phaser.Math.Between(100, 500);
    let dx = x - defense.x;
    let dy = y - defense.y;
    let distance = Math.sqrt(dx * dx + dy * dy);

    // Move towards the striker but stop at the midfield
    if (distance > 1) {
      defense.setVelocity((dx / distance) * 160, (dy / distance) * 160);
    }
  }
  if (100 < defense.x && defense.x < 300) {
    goTowardsPostRed = false;
  } else {
    goTowardsPostRed = true;
  }
}
// Move opponent bot towards the goal
function moveOpponentTowardsGoal(opponent) {
  if (opponent.x > 500 && opponent.x < 800) {
    let dx = 400 - opponent.x;
    let dy = Phaser.Math.Between(0, 600) - opponent.y;
    let distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 1) {
      opponent.setVelocity((dx / distance) * 160, (dy / distance) * 160); // Opponent advances towards the goal
    }
  } else if (opponent.x < 200 && opponent.y < 250 && opponent.y > 350) {
    let dy;
    if (opponent.y < 250) {
      dy = Phaser.Math.Between(100, 300) - opponent.y;
    } else {
      dy = Phaser.Math.Between(300, 500) - opponent.y;
    }
    let dx = 200 - opponent.x;
    while (dy < 0) {}
    let distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 1) {
      opponent.setVelocity((dx / distance) * 160, (dy / distance) * 60); // Opponent advances towards the goal
    }
  } else {
    let dx = 30 - opponent.x;
    let dy = 250 - opponent.y;
    let distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 1) {
      opponent.setVelocity((dx / distance) * 160, (dy / distance) * 160); // Opponent advances towards the goal
    }
  }
}
function moveOpponentTowardsBack(opponent) {
  let dx = 1600 - opponent.x;
  let dy = 300;
  if (dy > 350 && dy < 250) {
    dy = Phaser.Math.Between(0, 600) - opponent.y;
  }
  let distance = Math.sqrt(dx * dx + dy * dy);

  if (distance > 1) {
    opponent.setVelocity((dx / distance) * 200, (dy / distance) * 200); // Opponent advances towards the goal
  }
}

const config = {
  type: Phaser.WEBGL,
  width: sizes.width,
  height: sizes.height,
  canvas: gameCanvas,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0 },
      // debug: true,
    },
  },
  scene: [GameScene],
};

const game = new Phaser.Game(config);
gameStartBtn.addEventListener("click", () => {
  gameStartDiv.style.display = "none";
  game.scene.resume("scene-game");
});

refresh.addEventListener("click", () => {
  location.reload();
});
