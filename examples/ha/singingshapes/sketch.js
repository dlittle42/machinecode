var level, timeDomain, corrBuff;
var arrFiles;
// Main shape object
var controller, fundamentalFrequency;
// Use audio files?
var USE_FILES = false;
// Test if we want to do just a single file, we can bypass it by just pasting this here.
// Set this to "" to ignore this.
//var FORCE_USE_OF_FILE = "170919_soundsnap/Female sings london bridge nursery rhyme- acapella_Nightingale Music Productions.wav";
var FORCE_USE_OF_FILE = "";
// Else, it will use these variables:
// If true, how many files to load? Should be located in: audio/(subfolder)/file_##
var FILES = 1;
// What subfolder to pull these files from? This makes it easier to create little test versions
// Can be set to "" which means no subfolder
var SUB_FOLDER = "171207_alex_movies_test";
//var SUB_FOLDER = "170919_schumann";
// What kind of files ("wav", "mp3", etc)
var FILE_EXTENSION = "wav";
// Use the microphone? If so, we'll add a shape that listens to the microphone live.
// You can combine this with the files, e.g. Have three shapes listening to files, but
// the last shape is listening to your mic.
var USE_MIC = true;
// center clip nullifies samples below a clip amount.
// I don't really know what this stuff does.
var DO_CENTER_CLIP = false;
var CENTER_CLIP_THRESHOLD = 0.0;
// normalize pre / post autocorrelation
// I don't really know what this stuff does.
var PRE_NORMALIZE = true;
var POST_NORMALIZE = true;
// Limit the fundamental frequencies we care about. Maps to the height of browser roughly.
// We'll ignore ones above and below these, and not render them.
var FUNDAMENTAL_FREQUENCY_MIN = 60;
var FUNDAMENTAL_FREQUENCY_MAX = 650;
// Sample rate
var SAMPLE_RATE = 44100;
// Size of the FFT (set to 1024)
// I don't know what this does
var FFT_BINS = 1024;
// Smoothing value for FFT (set to around 0.8)
// I don't know what this does.
var FFT_SMOOTHING = 0.8;
// array of color values for chromatic scale - from C up to B
var arrColor = [
	[227, 48, 89],		// C
	[247, 88, 57],      // C#
	[247, 148, 61],		// D
	[243, 183, 47],		// D#
	[237, 217, 41],		// E
	[149, 198, 49],		// F
	[71, 173, 75],		// F#
	[69, 181, 161],		// G
	[66, 140, 176],		// G#
	[78, 97, 216],		// A
	[140, 97, 189],		// Bb
	[191, 78, 168]		// B
];
// Set the frequency value of C0. Based on equal temperment and 440 Hz tuning.
// This doesn't really have to be super exact, as it's only used to set the color
// value based on the above color map.
var C0_FREQUENCY = 16.35;
// Create a map of all frequencies we'll use the above, simply
// Doubling them on the way up.
var arrFrequency = new Array(88);
// Top and bottom margins, as a ratio (0 to 1) of the browser height
var TOP_MARGIN_RATIO = 0.25;
var BOTTOM_MARGIN_RATIO = 0.25;

// Preload the audio files
function preload() {
	// If we've set FORCE_USE_OF_THIS_FILE to anything other than "" that means we want to use just that one.
	var howMany = FORCE_USE_OF_FILE != "" ? 1 : FILES;
	if (USE_FILES) {
		arrFiles = new Array(howMany);
		var prefix, url;
		for (var i = 0; i < arrFiles.length; i++) {
			// Audio files are "audio/(subfolder)/voice_##" etc.
			prefix = i < 10 ? "0" : "";
			var extraSlash = SUB_FOLDER == "" ? "" : "/";
			if (FORCE_USE_OF_FILE != "") {
				url = "audio/" + FORCE_USE_OF_FILE;
			} else {
				url = "audio/" + SUB_FOLDER + extraSlash + "voice_" + prefix + i + "." + FILE_EXTENSION;			
			}
			arrFiles[i] = loadSound(url);
		}
	}
}

function setup() {
	
	var freq = C0_FREQUENCY;
	var twoToTwelfthPower = Math.pow(2, 1/12);
	for (var i = 0; i < arrFrequency.length; i++) {
		arrFrequency[i] = freq;
		freq *= twoToTwelfthPower;
	}
	
	// Create the canvas
	createCanvas(windowWidth, windowHeight);
	// Create my main controller object
	controller = new Controller();
	// trigger resize function
	windowResized();
	
}

function draw() {
	// My main controller object updates
	controller.update();
	controller.draw();
}

function windowResized() {
	resizeCanvas(windowWidth, windowHeight);
	controller.windowResized();
}

// limit to range
function lim(n, n0, n1) {
	if (n < n0) { return n0; } else if (n >= n1) { return n1; } else { return n; }
}

