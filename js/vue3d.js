/* vue3d.js : CaenJS - Sept.2013 - Mathieu LALLEMAND */

/* Objets Communs ********************************************************** */
var pGyro = {
  rX:0, rY:0, rZ:0, 
  cX:0, cY:0, cZ:0,
  compensated:false
};

function setLabel(domElt, html) { document.getElementById(domElt).innerHTML = html; }


/* 3D Rendering - THREE.JS ************************************************* */

// Objet JS de rendu (ThreeJS Deep Magic !)
var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById("WebGLCanvas").appendChild(renderer.domElement);

// Camera, placée dans une perspective sympa.
var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
camera.position.z = 500;
camera.position.y = -500;
camera.lookAt(new THREE.Vector3(0,0,0));

// Scene 3D
var scene = new THREE.Scene();

// Téléphone - enfin un truc qui ressemble vaguement...
var cube = new THREE.Mesh(new THREE.CubeGeometry(180, 300, 50), new THREE.MeshNormalMaterial());
cube.overdraw = true;
scene.add(cube);

// Animation
renderer.render(scene, camera);
renderCube();

// Boucle d'animation
function renderCube(){
  cube.rotation.x = de2ra((pGyro.rX-pGyro.cX)%360);
  cube.rotation.y = de2ra((pGyro.rY-pGyro.cY)%360);
  //cube.rotation.z = de2ra(pGyro.rZ-pGyro.cZ);         // Problèmes de perturbation de champ magnétique.
  renderer.render(scene, camera);
  requestAnimationFrame( function() {renderCube();} );
}

// Fonction de conversion degrés -> Radians
function de2ra(degree) { return degree*(Math.PI/180); }


/* Connexion NodeJS / Stocket.IO ******************************************* */
function nodeConnect() {
  try {
    console.log("Connexion sur le serveur NodeJS : "+window.location.hostname+":1337");
    var socket = io.connect('http://'+window.location.hostname+':1337');

    socket.on("Erreur", function(data) { console.log(data); });
    socket.on('coords', function (gyroData) { 
      pGyro = gyroData; 
      setLabel("rX",pGyro.rX);
      setLabel("rY",pGyro.rY);
      setLabel("rZ",pGyro.rZ);
    });
    socket.on("disconnect", function(data) { setLabel("cnxState","Offline"); });

    socket.emit('type', 'vp');

    setLabel("cnxState","Connected");
  } 
  catch (e) {
    setLabel("cnxState","Serveur Offline ?");
  }
}