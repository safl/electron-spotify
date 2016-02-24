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
}

ipcRenderer.on('player-play-toggle', function(args) {
    eventFire(getPlayerDom().getElementById("play-pause"), "click");
});

ipcRenderer.on('player-previous', function(args) {

    // This should first check current position and check
    // whether two clicks are needed

    // We fire it twice since the "prev" rewinds the track
    eventFire(getPlayerDom().getElementById("previous"), "click");
    setTimeout(function() {
        eventFire(getPlayerDom().getElementById("previous"), "click");
    }, 500);
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

    var player = {
        "track": {
            "name": "Unknown Track",
            "artists": ["Unknown Artist(s)"],
            "current": "0:00",
            "length": "0:00"
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

    player["track"]["current"] = playerDom.getElementById("track-current").innerHTML;
    player["track"]["length"] = playerDom.getElementById("track-length").innerHTML;
    player["isPlaying"] = playerDom.getElementById("play-pause").classList.contains("playing");
    player["isShuffling"] = playerDom.getElementById("shuffle").classList.contains("active");
    player["isRepeating"] = playerDom.getElementById("repeat").classList.contains("active");

    // Now send it back
    ipcRenderer.send('player-status', player);
});
