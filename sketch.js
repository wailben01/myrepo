let pursuer1, pursuer2;
let target;
let obstacles = [];
let vehicules = [];
let targets = [];
let l = 1; // Mode comportement : 1 = arrive, 0 = wander
let sn = 0; // Mode serpent : 1 = activé, 0 = désactivé
let balles = [];
let ennemi = null;
let wandert = [];
let circleRadiusSlider, separationSlider, avoidSlider,maxSpeedSlider;
let circleRadius;

function preload() {
  // charger les images 
  meteorImage = loadImage("6e29ea6155cb423688d3db7a1a13465d.png");
  vehiculeimage=loadImage("v.png");
  missileimage=loadImage("1261912.png");
  wandervehicule=loadImage("l6Rkrl.png");
  imagebg=loadImage("galaxies_stars_glare_black_background_4k_hd_space.jpg");
  enimage=loadImage("spaceship.pod_.1.blue__0.png");
}

function creerUnSlider(label, min, max, val, step, posX, posY, propriete) {
  let slider = createSlider(min, max, val, step);
  
  let labelP = createP(label);
  labelP.position(posX, posY);
  labelP.style('color', 'white');

  slider.position(posX + 150, posY + 17);

  let valueSpan = createSpan(slider.value());
  valueSpan.position(posX + 300, posY+17);
  valueSpan.style('color', 'white');
  valueSpan.html(slider.value());

  slider.input(() => {
    valueSpan.html(slider.value());
    vehicules.forEach(vehicle => {
      vehicle[propriete] = slider.value();
    });
  });
}
function creerSlidersPourProprietesVehicules() {
  // paramètres de la fonction custom de création de sliders :
  // label, min, max, val, step, posX, posY, propriete des véhicules
  
  
  creerUnSlider("Deviation maxi", 0, PI/2, 0.3, 0.01, 10, 60, "displaceRange");
  creerUnSlider("Vitesse maxi", 1, 20, 8, 0.1, 10, 80, "maxSpeed");
  creerUnSlider("Max force", 0.05, 1, 0.1, 0.1, 10, 100, "maxForce");

  // checkbox pour debug on / off
  debugCheckbox = createCheckbox('Debug ', false);
  debugCheckbox.position(10, 140);
  debugCheckbox.style('color', 'white');
  SnakeCheckbox = createCheckbox('snake mode ', sn);
  SnakeCheckbox.position(100, 140);
  SnakeCheckbox.style('color', 'white');
  SnakeCheckbox.changed(() => {
    sn = SnakeCheckbox.checked() ? 1 : 0; // Set `sn` based on the checkbox state
  });
  wanderCheckbox = createCheckbox('wander mode ', !l);
  wanderCheckbox.position(210, 140);
  wanderCheckbox.style('color', 'white');
  wanderCheckbox.changed(() => {
    l = wanderCheckbox.checked() ? 1 : 0;
  });
  leaderCheckbox = createCheckbox('leader mode ', 1);
  leaderCheckbox.position(320, 140);
  leaderCheckbox.style('color', 'white');
  leaderCheckbox.changed(() => {
    l = leaderCheckbox.checked() ? 1 : 0; 
  });
  debugCheckbox.changed(() => {
    Vehicle.debug = !Vehicle.debug;
  });
}
function creerSliderPourLongueurCheminDerriereVehicules(l) {
  let slider = createSlider(10, 150, l, 1);
  slider.position(160, 162);
  let label = createP("Longueur trainée : " + l);
  label.position(10, 145);
  label.style('color', 'white');
  // écouteur
  slider.input(() => {
    label.html("Longueur trainée : " + slider.value());
    vehicules.forEach(vehicle => {
      vehicle.path = [];
      vehicle.pathLength = slider.value();
    });
  });
}


function setup() {
  createCanvas(windowWidth, windowHeight);

  pursuer1 = new Vehicle(100, 100,vehiculeimage);
  pursuer1.behindDistance=0;
  pursuer2 = new Vehicle(random(width), random(height));

  vehicules.push(pursuer1);

  // Création d'un obstacle au centre (cercle vert)
  obstacles.push({
    pos: createVector(width / 2, height / 2),
    r: 100
  });

let circleRadiusLabel = createP("Rayon du cercle du leader :");
circleRadiusLabel.position(10, 10); // Position au-dessus du slider
circleRadiusLabel.style('color', 'white'); // Couleur du texte

// Créer le slider
circleRadiusSlider = createSlider(10, 300, 30);
circleRadiusSlider.position(190, 30);
  
  


  creerSlidersPourProprietesVehicules();
  creerSliderPourLongueurCheminDerriereVehicules(20);
}

function draw() {
  image(imagebg, 0, 0, width+2200, height+2600);


  target = createVector(mouseX, mouseY);
  circleRadius = circleRadiusSlider.value();
  let v=vehicules[0];
  noFill();
  stroke("blue");
  
  // Dessiner les obstacles
  obstacles.forEach(obstacle => {
    imageMode(CENTER);
    image(meteorImage, obstacle.pos.x, obstacle.pos.y, obstacle.r * 2, obstacle.r * 2);
  });

  // Gérer les véhicules `wandert`
  for (let i = wandert.length - 1; i >= 0; i--) {
    let v = wandert[i];
    v.applyBehaviors(target, obstacles, 0);    
    v.boundaries();
    v.update();
    v.show();
  }

  // Gérer l'ennemi
  if (ennemi) {
    gererEnnemi();
    vehicules.forEach(v => {
      // Les véhicules arrêtent leur mouvement et pointent vers l'ennemi
      v.vel.setMag(0); // Arrêter le mouvement
      let direction = p5.Vector.sub(ennemi.pos, v.pos); // Vecteur vers l'ennemi
      v.vel = direction.setMag(0.01); // Juste pour orienter
      v.update();
      v.show();
    })
  }
  else 
  {
     gererVehicules();
  }

  // Gérer les balles
  gererBalles();

  // Gérer les autres véhicules
 
}

// Gérer les véhicules
function gererVehicules() {
  vehicules.forEach((v, index) => {
    if (sn === 1) {
      // Mode serpent : les véhicules suivent celui de devant
      if (index === 0) {
        v.applyBehaviors(target, obstacles, l, ennemi);
      } else {
        let vehiculePrecedent = vehicules[index - 1];
        let distanceEntreVehicules = 60;
        let targetPos = vehiculePrecedent.pos;
        let seekForce = v.seekCorrectionSnake(targetPos, true, distanceEntreVehicules);
        v.applyForce(seekForce);
        let avoidForce = v.avoid(obstacles);
        avoidForce.mult(3);
        v.applyForce(avoidForce);
      }
    } else {
      // Comportement normal
      
      if (index === 0) {
        v.behindDistance=0;
        circle(v.pos.x + v.vel.x * circleRadius / v.maxSpeed, v.pos.y + v.vel.y * circleRadius / v.maxSpeed, circleRadius * 2);
        v.applyBehaviors(target, obstacles, l, ennemi);
      } else {
        // Calcul du centre du cercle
        let circleCenter = vehicules[0].pos.copy().add(vehicules[0].vel.copy().setMag(circleRadius));
        let distanceToCenter = p5.Vector.dist(v.pos, circleCenter);
     ;
        if (distanceToCenter < circleRadius) {
          // Évasion si dans le cercle du leader
          let fleeMultiplier = map(distanceToCenter, 100, circleRadius, 100, 20);
          v.behindDistance=circleRadius; // Dynamique
          let fleeForce = v.arrive(vehicules[0].pos).mult(fleeMultiplier);

          // Augmenter temporairement la force maximale pour s'échapper
          let originalMaxForce = v.maxForce;
          v.maxForce = 5; // Augmentez temporairement
          v.applyForce(fleeForce);
           // Restaurer la valeur originale
        } else {
          stroke("blue");
  
          v.behindDistance=70;
          v.applyBehaviors(vehicules[0].pos, obstacles, l, ennemi);
        }
      }
    }
    v.boundaries();
    v.update();
    v.show();
  });
}

// Gérer les balles
function gererBalles() {
  for (let i = balles.length - 1; i >= 0; i--) {
    let balle = balles[i];
    balle.applyForce(balle.pursue(ennemi));
    balle.update();
    balle.show();

    // Vérifier si une balle touche l'ennemi
    if (p5.Vector.dist(balle.pos, ennemi.pos) < ennemi.r) {
      balles = []; // Supprimer toutes les balles
      ennemi = null; // Ennemi détruit
      break;
    }
  }
}

// Gérer l'ennemi
function gererEnnemi() {
  if (wandert.length > 0) {
    // Si des véhicules `wandert` existent, poursuivre le plus proche
    let cible = getCibleLaPlusProche(ennemi, wandert);

    ennemi.applyForce(ennemi.pursue(cible));
    ennemi.boundaries();
    ennemi.update();
    ennemi.show();

    // Vérifier si l'ennemi touche la cible
    if (p5.Vector.dist(ennemi.pos, cible.pos) < ennemi.r) {
      let index = wandert.indexOf(cible);
      if (index !== -1) {
        wandert.splice(index, 1); // Supprimer le véhicule touché
      }
    }
  } else {
    // Sinon, mode wander
    ennemi.applyBehaviors(target, obstacles, 0);
    ennemi.boundaries();
    ennemi.update();
    ennemi.show();
  }
}

// Trouver la cible la plus proche de l'ennemi
function getCibleLaPlusProche(v, liste) {
  let minDistance = Infinity;
  let cible = null;

  liste.forEach(c => {
    let d = p5.Vector.dist(v.pos, c.pos);
    if (d < minDistance) {
      minDistance = d;
      cible = c;
    }
  });

  return cible;
}

// Clic pour créer un ennemi poursuivant
function mousePressed() {
  ennemi = new Vehicle(mouseX, mouseY,enimage);
  ennemi.color = "red"; // Couleur de l'ennemi
  ennemi.maxSpeed = 5;
  ennemi.maxForce = 0.5;

  vehicules.forEach(v => {
    let balle = new Vehicle(v.pos.x, v.pos.y,missileimage);
    balle.maxSpeed = 5;
    balle.maxForce = 0.5;
    balle.color = "yellow";
    balles.push(balle);
  });
}

// Gérer les raccourcis clavier
function keyPressed() {
  if (key === "v") {
    vehicules.push(new Vehicle(random(width), random(height),vehiculeimage));
  }
  if (key === "o") {
    obstacles.push({
      pos: createVector(mouseX, mouseY),
      r: 100
    });
  }
  if (key === "w") {
    let wandert1=new Vehicle(random(width), random(height),wandervehicule);
  
    wandert.push(wandert1);
  }
  if (key === "g") {
    l = l === 1 ? 0 : 1;
    wanderCheckbox.checked(!l);
    if(l===1 && sn===0)
    {
leaderCheckbox.checked(true);
    }
    else
    {
      leaderCheckbox.checked(false);
    }
  }
  if (key === "s") {
    sn = sn === 1 ? 0 : 1;
    SnakeCheckbox.checked(sn);
    if(l===1 && sn===0)
      {
  leaderCheckbox.checked(true);
      }
      else
      {
        leaderCheckbox.checked(false);
      }
  }
  if (key === "d") {
    Vehicle.debug = !Vehicle.debug;
    debugCheckbox.checked(Vehicle.debug);
  }
  if (key === "f") {
    for (let i = 0; i < 10; i++) {
      let v = new Vehicle(20, 300,vehiculeimage);

      v.vel = p5.Vector.random2D().mult(random(1, 5));
      v.image=vehiculeimage;
      vehicules.push(v);
    }
  }
}
