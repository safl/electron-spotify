const ipcRenderer = require('electron').ipcRenderer;

function eventFire(el, etype){
  if (el.fireEvent) {
    el.fireEvent('on' + etype);
  } else {
    var evObj = document.createEvent('Events');
    evObj.initEvent(etype, true, false);
    el.dispatchEvent(evObj);
  }
}

function getPlayerDom() {
    var playerDom = document.getElementById("app-player").contentWindow.document;
    return playerDom;
};

function getPlayerStatus() {

    var player = {
        "track": {
            "name": "Unknown Track",
            "artists": ["Unknown Artist(s)"],
            "current": {"min": 0, "sec":0},
            "length": {"min": 0, "sec":0}
        },
        "isPlaying": false,
        "isShuffling": false,
        "isRepeating": false
    };
    
    var playerDom = getPlayerDom();         // Grab the playerDom from iframe

                                            // Grab the track name
    var trackTag = playerDom.getElementById("track-name").getElementsByTagName("a")[0];
    if (trackTag.text.trim() != "") {
        player["track"]["name"] = trackTag.text;
    }
                                            // Grab the artists
    var artistTags = playerDom.getElementById("track-artist").getElementsByTagName("a");
    if (artistTags.length>0) {
        player["track"]["artists"] = [];   // Reset the "unknown artists
        var i;
        for(i=0; i<artistTags.length; ++i) {
            player["track"]["artists"].push(artistTags[i].text);
        }
    }

    var trackCurrentMinSec = playerDom.getElementById("track-current").innerHTML.trim().trim().split(":");
    if (trackCurrentMinSec.length==2) {
        player["track"]["current"]["min"] = parseInt(trackCurrentMinSec[0]);
        player["track"]["current"]["sec"] = parseInt(trackCurrentMinSec[1]);
    }

    var trackLengthMinSec = playerDom.getElementById("track-length").innerHTML.trim().trim().split(":");
    if (trackLengthMinSec.length==2) {
        player["track"]["length"]["min"] = parseInt(trackLengthMinSec[0]);
        player["track"]["length"]["sec"] = parseInt(trackLengthMinSec[1]);
    }
    
    var trackLengthText = playerDom.getElementById("track-length").innerHTML.trim();
    player["isPlaying"] = playerDom.getElementById("play-pause").classList.contains("playing");
    player["isShuffling"] = playerDom.getElementById("shuffle").classList.contains("active");
    player["isRepeating"] = playerDom.getElementById("repeat").classList.contains("active");

    return player;
};

ipcRenderer.on('player-play-toggle', function(args) {
    eventFire(getPlayerDom().getElementById("play-pause"), "click");
});

ipcRenderer.on('player-previous', function(args) {

    var player = getPlayerStatus();
    eventFire(getPlayerDom().getElementById("previous"), "click");
    // This is an attempt to avoid "rewinding" and actually go to previous track
    if ((player["track"]["current"]["min"] === 0) && (player["track"]["current"]["sec"] > 3)) {
        setTimeout(function() {
            eventFire(getPlayerDom().getElementById("previous"), "click");
        }, 500);
    }
});

ipcRenderer.on('player-next', function(args) {
    eventFire(getPlayerDom().getElementById("next"), "click");
});

ipcRenderer.on('player-repeat', function(args) {
    eventFire(getPlayerDom().getElementById("repeat"), "click");
});

ipcRenderer.on('player-shuffle', function(args) {
    eventFire(getPlayerDom().getElementById("shuffle"), "click");
});

ipcRenderer.on('player-status', function(event, args) {
    ipcRenderer.send('player-status', getPlayerStatus());
});
