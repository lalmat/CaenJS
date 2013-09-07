/* Gyro.js : CaenCAMP 2013 - Mathieu LALLEMAND */

/* Objets communs ********************************************************** */

var pGyro = { 
  rX:0, rY:0, rZ:0, 
  cX:0, cY:0, cZ:0,
  compensated:false
}

function setLabel(domElt, html) { document.getElementById(domElt).innerHTML = html; }

/* Application Gyroscope *************************************************** */

var app = {
  nodeSocket: null,    // Socket.IO sur Serveur NodeJS
  nodeOnline: false,   // Etat de la connexion

  // Initialisation du gyroscope et calcul de la compensation.
  initialize: function() {
    if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', function(eventData) {
        if (!pGyro.compensated) {
          pGyro.cX = eventData.beta;
          pGyro.cY = eventData.gamma;
          pGyro.cZ = eventData.alpha;
          pGyro.compensated = true;
        }
        pGyro.rX = eventData.beta;
        pGyro.rY = eventData.gamma;
        pGyro.rZ = eventData.alpha;  

        setLabel("rX", (pGyro.rX-pGyro.cX)%360);
        setLabel("rY", (pGyro.rY-pGyro.cY)%360);
        setLabel("rZ", (pGyro.rZ-pGyro.cZ)%360);

        app.nodeUpdate();
      }, false);
    } 
    else alert("Gyroscope non disponible...");
  },

  // Mise à jour du serveur NodeJS avec les nouvelles valeurs du gyroscope
  nodeUpdate: function() {
    if (app.nodeOnline) app.nodeSocket.emit('sendCoords', pGyro);
  },

  // Connexion au serveur NodeJS et gestion des messages réseau.
  nodeConnect: function() {
    setLabel("cnxLabel", "Connexion...");
    app.nodeSocket = io.connect("http://"+window.location.hostname+":1337", {"Timeout" : 5000});

    app.nodeSocket.on("connect", function() {
      app.nodeOnline = true;
      app.nodeSocket.emit("type", "gyro");
      setLabel("cnxLabel", "Gyroscope actif.");
    });

    app.nodeSocket.on("disconnect", function() {
      app.nodeSocket = null;
      setLabel("cnxLabel", "Gyroscope inactif.");
    });

    app.nodeSocket.on("error", function() {
      app.nodeSocket = null;
      setLabel("cnxLabel", "Erreur, Serveur Offline ?");
    });
  },

  // Déconnexion du serveur NodeJS
  nodeDisconnect: function () {
    app.nodeOnline = false;
    app.nodeSocket.disconnect();
  },

  // Connexion/Déconnexion du serveur NodeJS.
  nodeToggle: function() {
    (app.nodeSocket == null) ? app.nodeConnect() : app.nodeDisconnect();
  },
};