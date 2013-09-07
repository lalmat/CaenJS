/* nodeCaenJS.js : CaenJS - Sept.2013 - Mathieu LALLEMAND */

// Serveur WEB
var connect = require("connect");
connect.createServer( connect.static(__dirname)).listen(8080);

// Intégration des WebSockets
var io = require('socket.io').listen(1337, {log:false});

// Variables de gestion
var gyroscopeConnected  = false;
var dstView = new Array();

// Gestion des connexions
io.sockets.on('connection', function (socket) {

  // Classement du type de connexion (VP: ViewPort, GYRO:Gyroscope)
  socket.on('type', function (data) {
    if (data == "vp") {
      socket.cnxId = Math.random().toString(36).substr(2,9).toUpperCase();
      socket.isGyroscope = false;
      dstView.push(socket);
      console.log("Nouvelle vue ID:"+socket.cnxId);
    }

    if (data == "gyro") {
      if (!gyroscopeConnected) {
        socket.isGyroscope = true;
        gyroscopeConnected = true;
        console.log("Gyroscope Connecté");
      }
      else {
        socket.emit("Erreur", "Il y a deja un Gyroscope de connecté.");
        console.log("Gyroscope Refusé");
      }
    }
  });

  // Transmission des informations aux clients connectés.
  socket.on('sendCoords', function(pGyro) {
    if (socket.isGyroscope) {
      //console.log(pGyro);
      socket.broadcast.emit("coords", pGyro);     
    } 
    else {
      socket.emit("Erreur", "Vous n'est pas autorisé à emmetre");
    }
  });

  // Déconnexion du client.
  socket.on('disconnect', function(data) {
    if (socket.isGyroscope) {
      gyroscopeConnected = false; 
      console.log("Gyroscope deconnecté."); 
    }
    else {
      var removeIndex = null;
      for (var i=0; i<dstView.length && removeIndex == null; i++) {
        if (dstView[i].cnxId != socket.cnxId) removeIndex = i;
      }
      dstView.splice(removeIndex,1);
    }
  });
});