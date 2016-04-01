// examples of Web Audio API synths

// SimpleMonoSample
// usage example:
// x = new SimpleMonoSample("path-to-sound.wav");
// x.play(1.5); // ; play first 1.5 seconds of sound
// x.play(1.5,0.5); // ; play for 1.5 seconds, down an octave (rate=0.5)
// x.play(1.5,0.5,0.2); // ; play for 1.5secs,down an octave, start 0.2 secs into sample

SimpleMonoSample = function(url) {
  this.url = url;
  var request = new XMLHttpRequest();
  request.open('GET',url,true);
  request.responseType = 'arraybuffer';
  var closure = this; // a closure is necessary for...
  request.onload = function() {
      var data = request.response;
      ac.decodeAudioData(data, function(x) {
        console.log("buffer loaded");
        closure.buffer = x; // ...the decoded data to be kept in the object
      },
      function(err) {
        console.log("error decoding buffer");
      });
  };
  request.send();
  this.gain = ac.createGain();
  this.gain.connect(ac.destination);
  this.playing = false;
}

SimpleMonoSample.prototype.play = function (dur,rate,startPos) {
  if(rate == null) rate = 1; // if 2nd argument not given, defaults to 1
  if(startPos == null) startPos = 0.0; // if 3rd arg not given, defaults 0
  if(this.playing == false) { // only play if not already playing
    this.playing = true;
    this.source = ac.createBufferSource();
    this.source.playbackRate.value = rate;
    this.source.buffer = this.buffer;
    this.source.connect(this.gain);
    var now = ac.currentTime;
    this.source.start(now,startPos);
    this.gain.gain.setValueAtTime(0,now);
    this.gain.gain.linearRampToValueAtTime(1,now+0.003); // 3 ms fade-in
    this.gain.gain.linearRampToValueAtTime(1,now+dur-0.003); // hold
    this.gain.gain.linearRampToValueAtTime(0,now+dur);  // 3 ms fade-out
    var closure = this;
    setTimeout(function() {
      closure.playing = false; // make synth available again...
    },(dur*1000)+250); // ...a quarter second after envelope finishes
  } else console.log("warning: attempt to play synth that was already playing");
}

var simpleMonoSampleBank = new Array();
for(var n=0;n<10;n++) {
  simpleMonoSampleBank[n] = new SimpleMonoSample("uhoh-mono-16bit.wav");
}

function playSimpleMonoSample(dur,rate,startPos) {
  var n;
  for(n=0;n<10;n++) {
    if(simpleMonoSampleBank[n].playing==false)break;
  }
  if(n<10) {
    simpleMonoSampleBank[n].play(dur,rate,startPos);
  }
  else console.log("warning: all synth instances already plaing");
}