let peerConnection;
let iceSeverList;
const config = {
  iceServers: [
      {
		urls:"stun:stun.l.google.com:19302"
	  },
    {
      urls: "stun:openrelay.metered.ca:80",
    },
	    {
      urls: "turn:openrelay.metered.ca:443?transport=tcp",
      username: "openrelayproject",
      credential: "openrelayproject",
    },

  ]

};

//const socket = io.connect(window.location.origin);
const socket = io.connect("https://morning-wildwood-58051.herokuapp.com/");

const video = document.querySelector("video");
const enableAudioButton = document.querySelector("#enable-audio");
var pc_constrains = {
	'optional':[
	{'DtlsSrtpKeyAgreement':true},
	{'RtpDataChannels':true}]
};
enableAudioButton.addEventListener("click", enableAudio)

socket.on("offer", (id, description) => {
  console.log(JSON.stringify(description))
//iceSeverList  peerConnection = new RTCPeerConnection(config,pc_constrains);
	peerConnection = new RTCPeerConnection(config,pc_constrains);
  peerConnection
    .setRemoteDescription(description)
    .then(() => peerConnection.createAnswer())
    .then(sdp => peerConnection.setLocalDescription(sdp))
    .then(() => {
      socket.emit("answer", id, peerConnection.localDescription);
    });
  peerConnection.ontrack = event => {
	console.log("on Track");
	console.log(event.streams[0]);

  if (event.streams && event.streams[0]) {
    video.srcObject = event.streams[0];
  } else {
    let inboundStream = new MediaStream(event.track);
    video.srcObject = inboundStream;
  }
};	

  
  peerConnection.onicecandidate = event => {
    if (event.candidate) {
	console.log("candidate received");
	console.log(JSON.stringify(event.candidate));
    socket.emit("candidate", id, event.candidate);
    }
  };
  
  peerConnection.onconnectionstatechange = event => {
  switch(peerConnection.connectionState) {
    case "new":
    case "checking":
      console.log("Connecting...");
      break;
    case "connected":
      console.log("Online");
	  var iceTransport = peerConnection.getReceivers();
	  //[0].transport.iceTransport;
	  console.log(JSON.stringify(iceTransport));
	//console.log(JSON.stringify(peerConnection.getStats()));
	//peerConnection.getStats(null).then(statusrpt => console.log(JSON.stringify(statusrpt)));

	//peerConnection.getStats(null, function(stats) {console.log("get status")}, function(error) {console.log("error")});
//	  const pair = peerConnection.sctp.transport.iceTransport.getSelectedCandidatePair();
//		console.log(pair.remote.type);
		console.log("Online2");
      break;
    case "disconnected":
      console.log("Disconnecting...");
      break;
    case "closed":
      console.log("Offline");
      break;
    case "failed":
      console.log("Error");
	  peerConnection.restartIce();
      break;
    default:
      console.log("Unknown");
      break;
  }
  };
});


socket.on("candidate", (id, candidate) => {
  console.log("candidate received IN");
  console.log(JSON.stringify(candidate));

  peerConnection
    .addIceCandidate(new RTCIceCandidate(candidate))
    .catch(e => console.error(e));
});

socket.on("connect", () => {
  socket.emit("watcher");
});

socket.on("broadcaster", () => {
  socket.emit("watcher");
});

window.onunload = window.onbeforeunload = () => {
  socket.close();
  peerConnection.close();
};

    window.onload = () => {

      let xhr = new XMLHttpRequest();
      xhr.onreadystatechange = function($evt){
        if(xhr.readyState == 4 && xhr.status == 200){
          let res = JSON.parse(xhr.responseText);
		  iceSeverList = res.v.iceServers;
          console.log('xirsys response: ',res);
        }
      }
      xhr.open("PUT", "https://global.xirsys.net/_turn/robot001", true);
      xhr.setRequestHeader ("Authorization", "Basic " + btoa("tk001:71d4d71a-b0a1-11ec-be91-0242ac130006") );
      xhr.setRequestHeader ("Content-Type", "application/json");
      xhr.send( JSON.stringify({"format": "urls"}) );

    };

function enableAudio() {
  console.log("Enabling audio")
  video.muted = false;
}



//    {
//      urls: "turn:openrelay.metered.ca:80",
//      username: "openrelayproject",
//      credential: "openrelayproject",
//    },
//    {
//      urls: "turn:openrelay.metered.ca:443",
//      username: "openrelayproject",
//      credential: "openrelayproject",
//    },
//    {
//      urls: "turn:openrelay.metered.ca:443?transport=tcp",
//      username: "openrelayproject",
//      credential: "openrelayproject",
//    },