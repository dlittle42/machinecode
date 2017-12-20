var synth = new Tone.AMSynth().toMaster();
var synthName = "AMSynth";
var mouseDown = false;
var notesDown = [];
var keys = ["C4","D4","E4","F4","G4","A4","B4","C5","D5","E5",
        "C#4","D#4","F#4","G#4","A#4","C#5","D#5"];

$(document).mouseover(function(e){
  if(mouseDown){
    // White Keys
    if(e.target.id == "C4"){ synth.triggerAttack('C4', '8n') }
    if(e.target.id == "D4"){ synth.triggerAttack('D4', '8n') }
    if(e.target.id == "E4"){ synth.triggerAttack('E4', '8n') }
    if(e.target.id == "F4"){ synth.triggerAttack('F4', '8n') }
    if(e.target.id == "G4"){ synth.triggerAttack('G4', '8n') }
    if(e.target.id == "A4"){ synth.triggerAttack('A4', '8n') }
    if(e.target.id == "B4"){ synth.triggerAttack('B4', '8n') }
    if(e.target.id == "C5"){ synth.triggerAttack('C5', '8n') }
    if(e.target.id == "D5"){ synth.triggerAttack('D5', '8n') }
    if(e.target.id == "E5"){ synth.triggerAttack('E5', '8n') }
    // Black Keys
    if(e.target.id == "C#4"){ synth.triggerAttack('C#4', '8n') }
    if(e.target.id == "D#4"){ synth.triggerAttack('D#4', '8n') }
    if(e.target.id == "F#4"){ synth.triggerAttack('F#4', '8n') }
    if(e.target.id == "G#4"){ synth.triggerAttack('G#4', '8n') }
    if(e.target.id == "A#4"){ synth.triggerAttack('A#4', '8n') }
    if(e.target.id == "C#5"){ synth.triggerAttack('C#5', '8n') }
    if(e.target.id == "D#5"){ synth.triggerAttack('D#5', '8n') }
    
    if(keys.indexOf(e.target.id) != -1){
      $("#" + e.target.id.replace("#","\\#")).css({ "background-color":"lightgrey" });
    }
  }
});

$(document).mouseout(function(e){
  if(keys.indexOf(e.target.id) != -1){
    $("#" + e.target.id.replace("#","\\#")).css({ "background-color":"" });
  }
});

$(document).mousedown(function(e){
  if(e.target.id == "tab"){ 
    cycleSynth();
    $("#caps").html(synthName);
  }
  
  mouseDown = true;
  // White Keys
  if(e.target.id == "C4"){ synth.triggerAttack('C4', '8n') }
  if(e.target.id == "D4"){ synth.triggerAttack('D4', '8n') }
  if(e.target.id == "E4"){ synth.triggerAttack('E4', '8n') }
  if(e.target.id == "F4"){ synth.triggerAttack('F4', '8n') }
  if(e.target.id == "G4"){ synth.triggerAttack('G4', '8n') }
  if(e.target.id == "A4"){ synth.triggerAttack('A4', '8n') }
  if(e.target.id == "B4"){ synth.triggerAttack('B4', '8n') }
  if(e.target.id == "C5"){ synth.triggerAttack('C5', '8n') }
  if(e.target.id == "D5"){ synth.triggerAttack('D5', '8n') }
  if(e.target.id == "E5"){ synth.triggerAttack('E5', '8n') }
  // Black Keys
  if(e.target.id == "C#4"){ synth.triggerAttack('C#4', '8n') }
  if(e.target.id == "D#4"){ synth.triggerAttack('D#4', '8n') }
  if(e.target.id == "F#4"){ synth.triggerAttack('F#4', '8n') }
  if(e.target.id == "G#4"){ synth.triggerAttack('G#4', '8n') }
  if(e.target.id == "A#4"){ synth.triggerAttack('A#4', '8n') }
  if(e.target.id == "C#5"){ synth.triggerAttack('C#5', '8n') }
  if(e.target.id == "D#5"){ synth.triggerAttack('D#5', '8n') }
  
  if(keys.indexOf(e.target.id) != -1){
    $("#" + e.target.id.replace("#","\\#")).css({ "background-color":"lightgrey" });
  }
});

$(document).mouseup(function(e){
  mouseDown = false;
  synth.triggerRelease();
  
  if(keys.indexOf(e.target.id) != -1){
    $("#" + e.target.id.replace("#","\\#")).css({ "background-color":"" });
  }
});

$(document).on("keydown", function(e){
  if(e.keyCode == 9){
    cycleSynth();
    $("#caps").html(synthName);
  }
  // White Keys
  if(e.keyCode == 65){ checkAndAdd('C4') }
  if(e.keyCode == 83){ checkAndAdd('D4') }
  if(e.keyCode == 68){ checkAndAdd('E4') }
  if(e.keyCode == 70){ checkAndAdd('F4') }
  if(e.keyCode == 71){ checkAndAdd('G4') }
  if(e.keyCode == 72){ checkAndAdd('A4') }
  if(e.keyCode == 74){ checkAndAdd('B4') }
  if(e.keyCode == 75){ checkAndAdd('C5') }
  if(e.keyCode == 76){ checkAndAdd('D5') }
  if(e.keyCode == 186){ checkAndAdd('E5') }
  // Black Keys
  if(e.keyCode == 87){ checkAndAdd('C#4') }
  if(e.keyCode == 69){ checkAndAdd('D#4') }
  if(e.keyCode == 84){ checkAndAdd('F#4') }
  if(e.keyCode == 89){ checkAndAdd('G#4') }
  if(e.keyCode == 85){ checkAndAdd('A#4') }
  if(e.keyCode == 79){ checkAndAdd('C#5') }
  if(e.keyCode == 80){ checkAndAdd('D#5') }
  
  play();
});

$(document).on("keyup", function(e){
  // White Keys
  if(e.keyCode == 65){ checkAndRemove('C4') }
  if(e.keyCode == 83){ checkAndRemove('D4') }
  if(e.keyCode == 68){ checkAndRemove('E4') }
  if(e.keyCode == 70){ checkAndRemove('F4') }
  if(e.keyCode == 71){ checkAndRemove('G4') }
  if(e.keyCode == 72){ checkAndRemove('A4') }
  if(e.keyCode == 74){ checkAndRemove('B4') }
  if(e.keyCode == 75){ checkAndRemove('C5') }
  if(e.keyCode == 76){ checkAndRemove('D5') }
  if(e.keyCode == 186){ checkAndRemove('E5') }
  // Black Keys
  if(e.keyCode == 87){ checkAndRemove('C#4') }
  if(e.keyCode == 69){ checkAndRemove('D#4') }
  if(e.keyCode == 84){ checkAndRemove('F#4') }
  if(e.keyCode == 89){ checkAndRemove('G#4') }
  if(e.keyCode == 85){ checkAndRemove('A#4') }
  if(e.keyCode == 79){ checkAndRemove('C#5') }
  if(e.keyCode == 80){ checkAndRemove('D#5') }
  
  release();
});

function checkAndAdd(note){
  if(notesDown.indexOf(note) == -1){
    notesDown.unshift(note);
    $("#" + note.replace("#","\\#")).css({ "background-color":"lightgrey" });
  }
}

function checkAndRemove(note){
  notesDown.splice(notesDown.indexOf(note), 1);
  $("#" + note.replace("#","\\#")).css({ "background-color":"" });
}

function cycleSynth(){
  switch(synthName){
    case "AMSynth":
      synthName = "DuoSynth";
      synth = new Tone.DuoSynth().toMaster();
      
      break;
    case "DuoSynth":
      synthName = "FMSynth";
      synth = new Tone.FMSynth().toMaster();
      break;
    case "FMSynth":
      synthName = "MembraneSynth";
      synth = new Tone.MembraneSynth().toMaster();
      break;
    case "MembraneSynth":
      synthName = "MonoSynth";
      synth = new Tone.MonoSynth().toMaster();
      synth.volume = -40;
      break;
    case "MonoSynth":
      synthName = "Synth";
      synth = new Tone.Synth().toMaster();
      break;
    case "Synth":
      synthName = "AMSynth";
      synth = new Tone.AMSynth().toMaster();
      break;
  }
}

function play(){
  synth.triggerAttack(notesDown[0], '8n');
  //console.log(notesDown);
}

function release(){
  if(notesDown.length <= 0){ synth.triggerRelease() } 
  else { play() }
}

function runme(){
  var song = [
    [0,"G4"], ["0:1","B4"], ["0:2","E4"], ["0:3","G4"], 
    ["1:0","C4"], ["1:1","E4"], ["1:2","D4"], ["1:3","F#4"],
    ["2:0","G4"], ["2:1","B4"], ["2:2","E4"], ["2:3","G4"], 
    ["3:0","C4"], ["3:1","E4"], ["3:2","D4"], ["3:3","F#4"],
    ["4:0","G4"], ["4:1","G4"], ["4:2","G4"],
    ["5:1", "G4"], ["5:2", "F#4"],
  ]

  var synth32 = new Tone.AMSynth().toMaster();

  var part2 = new Tone.Part(function(time, note){
    synth32.triggerAttackRelease(note, "32n",time);
  }, song).start("0:0:3").stop("4:0");



  var part = new Tone.Part(function(time, note){
    //the notes given as the second element in the array
    //will be passed in as the second argument
    synth.triggerAttackRelease(note, "16n", time);
  }, song).start(0);


  Tone.Transport.bpm.value = 90;
  Tone.Transport.start("+1");
  //Tone.Transport.stop();
}
//runme();