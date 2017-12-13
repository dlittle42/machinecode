// Shape class
// indexPm:    Index number of this shape (0, 1, 2, 3...) - corresponds to below file number.
// useMicPm:   True if this shape listens to the live microphone instead of an audio file.
function Shape(controllerPm, indexPm, useMicPm) {
	
	// Link to my controller
	this.controller = controllerPm;
	// My tail object
	this.tail = null;
	// My index number 0, 1, 2, 3 ...
	this.index = indexPm;
	this.useMic = useMicPm;
	//
	// Easing ratio towards position and size (ratio 0 to 1. Raise to make it snap more quickly)
	this.easePosition = 0.6;
	this.easeRadius = 0.2;
	this.easeAlpha = 0.2;
	this.easeColor = 0.1;
	// How quickly the mouth size sort of opens and closes
	this.easeMouthSize = 0.4;
	// My current position
	this.x = width/2;
	this.yTarget = this.y = height/2;
	// My y range (updated dynamically based on browser height)
	this.yMin = this.yMax = this.y;
	// My radius range (as percentage of browser height)
	this.radiusRatioMin = 0.10;
	this.radiusRatioMax = 0.20;
	// Initialize color
	this.colorTarget = this.color = [0, 0, 0];
	// How spikey should I get - as a ratio, should be 1.0 or larger. So 1.5 means my spikes are 50% of my radius size.
	this.spikeRatio = 1.8;
	// How many samples to ease the spikey hair in and out for? This needs to be based on length of the auto correlation buffer,
	// which is 1024 by default. So, if we set this to say, 50, for the first 50 frames it wil ease in, then the last 50 frames
	// it will ease out.
	this.smoothSpikeStart = 500;
	this.smoothSpikeEnd = 80;
	// set default radius size
	this.radius = this.radiusRatioMin * height;
	// Alpha range
	this.alphaMin = 0.9; this.alphaMax = 1.0;
	this.alpha = this.alphaMin;
	// My closest note (in terms of a piano keyboard) value.
	// This is decimal. e.g. 0 represents C0 ... then 0.5 means halfway from C0 to C1.
	// Just start it randomly in the middle of the array. The updateColor function will
	// naturally find its proper value.
	this.noteValue = Math.round(arrFrequency.length/2);
	// On or off
	this.isOn = false;
	// Are we in the onset delay mode
	this.isOnset = false; 	
	this.justTurnedOn = true;
	// Volume threshholds. We hide the shape when audio is below the minimum
	// level set here (ratio 0 to 1), then we treat the maximum volume level as maximum for animation purposes.
	// We set a different threshhold for audio files versus the microphone.
	// For microphone:
	if (this.useMic) {
		this.levelMin = 0.02;
		this.levelMax = 0.30;
	// For audio files:
	} else {
		this.levelMin = 0.02;
		this.levelMax = 0.09;
	}
	// Maintain my level ratio 0 to 1 for animation purposes. It's normalized 
	// for the level that my shape cares about.
	this.levelRatio = 0;
	this.mouthSize = 0;
	// My fft object
	this.fft; this.source; this.corrBuff; this.spectrum; this.timeDomain; this.analyzer;
	// Current volume level of audio
	this.level = 0;
	// Current fundamentalFrequency
	this.fundamentalFrequency = FUNDAMENTAL_FREQUENCY_MIN;
	// Median buffer: How big of a buffer to maintain for applying the fundamental frequency?
	// Say we maintain a buffer of 100 frames. It will keep 100 of the most recent
	// fundamental frequency, but only display the median value out of the these 100. 
	// This helps reduce little blips/outliars. But it also introduces a slight delay. So needs to be low.
	// Best to set this to an odd number so you get a true median. (Although for even number we'll just average the two middle ones.)
	// You can set this really small to have really fast response. (Probably don't go below 3 though)
	// Set this to 1 if you want to simply not calculate the median, and use the true live values.
	this.medianBufferLength = 6;
	// Onset delay: When the user begins singing again, after they have not been singing, we will wait for this many
	// samples to be added to the median buffer array before displaying the shape. This helps fix the initial onset
	// errors. But it adds a forced delay.
	// * Important: This needs to be set at or lower than medianBufferLength above.
	// But if you set this too high, it will lose out drawing some information in the tail unfortunately for short notes.
	// So it's a tradeoff.
	this.onsetDelay = 3;
	// Initialize median frequency
	this.medianFrequency = null;
	// How many seconds do you want the shape to be visible for before hiding the caption
	this.hideCaptionAfter = 5;
	// This timer will maintain how many seconds total the user has made the shape appear
	this.totalTimeShapeShown = 0;
	// General frame counter
	this.ct = 0;
	// Onset counter - reset each time the shape goes off.
	this.ctOnset = 0;
	
	this.mouthOscillator = 0;
	this.init();
}

// Initialize this shape
Shape.prototype.init = function() {
	// Set my source to the microphone
	if (this.useMic) {
		// Connect to the microphone
		this.source = new p5.AudioIn();
		this.source.start();
	// Else set my source to an audio file
	} else {
		this.source = arrFiles[this.index];
		// Start the song
		this.source.loop();
	}
	// Create the buffer for calculating median frequency.
	// (Unless we set medianBufferLength to 1, in case it means there's no buffer, we just will use
	// the live fundamental frequency value, and we don't need a buffer array
	if (this.medianBufferLength != 1) {
		// Initialize median buffer length
		this.arrBuffer = new Array(this.medianBufferLength);
		// Fill it with halfway between mid and max values just as temporary placeholder
		// So that the sorter doesn't flip out when it first starts.
		var freq = lerp(FUNDAMENTAL_FREQUENCY_MIN, FUNDAMENTAL_FREQUENCY_MAX, 0.5);
		for (var i = 0; i < this.arrBuffer.length; i++) {
			this.arrBuffer[i] = freq;
		}
	}
	// Apply raw FFT filter for this one
	this.fft = new p5.FFT(FFT_SMOOTHING, FFT_BINS);
	this.fft.setInput(this.source);	
	// create a new Amplitude analyzer
	this.analyzer = new p5.Amplitude();
	// Patch the input to an volume analyzer
	this.analyzer.setInput(this.source);
	
	// Create a tail and link it to me
//	this.tail = new Tail(this);
}

// Triggered whenever the window is resized
Shape.prototype.windowResized = function() {
	this.x = width/2;
	this.radiusMin = this.radiusRatioMin * height;
	this.radiusMax = this.radiusRatioMax * height;
	
	var margin = width * 0.4;
	if (this.controller.totalShapes > 1) {
		// TEMPORARY - this code distributes them horizontally
		//this.x = margin + (width - margin*2) * (this.index / (this.controller.totalShapes - 1));
		this.x = width/2;		
	} else {
		this.x = width/2;
	}	
	// Update y range
	this.yMin = TOP_MARGIN_RATIO * height;
	this.yMax = height - (BOTTOM_MARGIN_RATIO * height);
}

// Update every frame
Shape.prototype.update = function() {
	
	// Current volume level of mic or audio file
	if (this.useMic) { this.level = this.source.getLevel(); }
	else { this.level = this.analyzer.getLevel(); }
	// If it's zero and I'm currently on, turn me off
	if (this.level < this.levelMin) {
		if (this.isOn) {
			this.isOn = false;
		}
	// If volume is above the threshhold, turn me on
	} else {
		// This means it just turned on.
		if (!this.isOn) {
			this.isOn = true; this.justTurnedOn = true;
			// Turn on the onset counter
			this.ctOnset = 0;
			// Start timer since it just turned on
			this.t0 = (new Date()).getTime() / 1000;
		}
	}
		
	// FFT spectrum
	this.spectrum = this.fft.analyze();
	// array of values from -1 to 1
	this.timeDomain = this.fft.waveform(1024, 'float32');
	this.corrBuff = this.autoCorrelate(this.timeDomain);
	// Establish the fundamentalFrequency
	this.fundamentalFrequency = this.findFrequency(this.corrBuff);
	//console.log(this.fundamentalFrequency)
	// Update my median buffer array
	this.updateMedianBuffer();
	// Did we get one?
	if (this.medianFrequency == null) return;
	// Go through the frequency map and see what notes I'm between
	this.updateColor();
	
	//console.log(this.index + " : " + this.fundamentalFrequency);
	
	// Do we need to wait for the onset delay for the median buffer to fill up?
	if (this.ctOnset < this.onsetDelay) {
		this.isOnset = true;
	} else {
		this.isOnset = false; 
	}

	// If I'm on right now?
	// Also check if we're beyond the onset delay. Otherwise we won't show the shape yet, waiting for
	// the median buffer array to fill up.
	//if ((this.isOn) && (this.ctOnset >= this.onsetDelay)) {
		
	// Note: haven't fully implemented this yet
	if (this.isOn && !this.isOnset) {

		// Find the fundamental frequency, as a ratio from 0 to 1
		var r = (lim(this.medianFrequency, FUNDAMENTAL_FREQUENCY_MIN, FUNDAMENTAL_FREQUENCY_MAX) - FUNDAMENTAL_FREQUENCY_MIN) / FUNDAMENTAL_FREQUENCY_MAX;
		this.yTarget = map((1-r), 0, 1, this.yMin, this.yMax);
		// Limit that between levelMin and levelMax, and turn it into a ratio for that range
		this.levelRatio = (lim(this.level, this.levelMin, this.levelMax) - this.levelMin) / this.levelMax;
		// The first time we first turn on after being off, you should immediately snap to the position so that it doesn't
		// ease from the previous ending position
		if (this.justTurnedOn) {
			this.justTurnedOn = false;
			this.y = this.yTarget;
		// else we ease towards it
		} else {
			this.y = this.y + (this.yTarget - this.y) * this.easePosition;
		}
		// Set radius
		this.radiusTarget = map(this.levelRatio, 0, 1, this.radiusMin, this.radiusMax);
		// The alpha was too hard to get towards 1.0 fuller alpha values. So I've multiplied the ratio to fraction power (e.g. 0.1)
		// to get it to appear more opaque more often.
		this.alphaTarget = map(Math.pow(this.levelRatio, 0.5), 0, 1, this.alphaMin, this.alphaMax);
		
		// If the caption is still showing
		if (!this.controller.isCaptionFading) {
			// Add to the timer
			this.t1 = (new Date()).getTime() / 1000;
			var elapsed = this.t1 - this.t0;
			this.totalTimeShapeShown += elapsed;
			if (this.totalTimeShapeShown > this.hideCaptionAfter) {
				this.controller.wantToFadeCaption = true;
				this.controller.isCaptionFading = true;
			} else {
				this.t0 = this.t1;
			}
		}
		
	// Else I'm off
	} else {
		this.alphaTarget = 0;
		this.radiusTarget = this.radiusMin;
		$( ".box" ).removeClass("active");
	}

	// For some reason this.radiusTarget coming up as NaN sometimes, not sure why.
	if (!isNaN(this.radiusTarget)) this.radius = this.radius + (this.radiusTarget - this.radius) * this.easeRadius;
	if (!isNaN(this.alphaTarget)) this.alpha = this.alpha + (this.alphaTarget - this.alpha) * this.easeAlpha;


	
	//console.log(this.index + " : " + this.levelRatio);
	// Cap alpha to 0 
	if (this.alpha < 0.01) this.alpha = 0;
	
	// Increment counters
	this.ct++; this.ctOnset++;
}

// Render me to the canvas
Shape.prototype.render = function() {
	
	// Don't waste my time rendering anything if my alpha is zero, I'm invisible.
	if (this.alpha == 0) return;
	
	noStroke();
	blendMode(ADD); 
	//fill(255, 255, 255, this.alpha * 255);		
	fill(this.color[0], this.color[1], this.color[2], this.alpha * 255);	
	
	// ---------------------------------------
	// Draw the outer shape.
	// ---------------------------------------	

	// Define the range. This is how tall the spikes it will have.
	var minRad = this.radius/2; 
	var maxRad = minRad * this.spikeRatio;
	// Define the halfway point
	var halfRad = minRad + (maxRad - minRad) * 0.5;
	// Starting angle in radians. So if we set it to PI/2, that means it
	// starts drawing in its center bottom, then clockwise. Which means
	// The spikey part looks like his hair.
	var angle0 = PI/2; 
	var offsetTarget, offset, angle, x, y, ratio;
	// 
	beginShape();
	
	// Go through the correlation buffer and use that for the shape's curvature
	for (var i = 0; i < this.corrBuff.length; i++) {
		
		// Go around the full circle
		angle = angle0 + i/(this.corrBuff.length + 1) * TWO_PI;
		// Correlation buffer's values go from -1 to 1
	    offsetTarget = map(this.corrBuff[i], -1, 1, minRad, maxRad);
		// In the beginning, ease it out of the minimum radius to remove the kink.
		if (i < this.smoothSpikeStart) {
			ratio = i/this.smoothSpikeStart;
			offset = map(ratio, 0, 1, halfRad, offsetTarget);
		// At the end, ease it out back towards minimum radius.
		} else if (i >= this.corrBuff.length - this.smoothSpikeEnd) {
			ratio = ((i + 1) - (this.corrBuff.length - this.smoothSpikeEnd))/this.smoothSpikeEnd;
			offset = map(ratio, 0, 1, offsetTarget, halfRad);
		} else {
		// Else just set it to the target
			offset = offsetTarget;
		}
		x = this.x + offset * cos(angle);
		y = this.y + offset * sin(angle);
		curveVertex(x, y);
	}
	endShape();
	
	// ---------------------------------------
	// Draw the eyes.
	// ---------------------------------------
	blendMode(NORMAL); 
	
	// Draw two eyes
	var eyeVerticalOffset = this.radius * 0.16;
	var eyeHorizOffset = this.radius * 0.25;
	var eyeWidth = this.radius * 0.08;
	
	var eyeHeight;
	// Blink?
	var c = this.ct % 100;
	if (c < 10) eyeHeight = eyeWidth * 0.07;
	else eyeHeight = eyeWidth;
	// Draw the eyes
	fill(0, 0, 0);
	ellipse(this.x - eyeHorizOffset, this.y - eyeVerticalOffset, eyeWidth, eyeHeight);
	ellipse(this.x + eyeHorizOffset, this.y - eyeVerticalOffset, eyeWidth, eyeHeight);
	
	// draw a mouth
	var mouthVerticalOffset = this.radius * 0.1;
	//var mouthWidth =  this.radius * 0.4;
	var mouthSizeMax = this.radius * 0.22;
	var mouthSizeMin = this.radius * 0.1;
	var mouthSizeTarget = map(this.levelRatio, 0, 1, mouthSizeMin, mouthSizeMax);
	// Make the mouth oscillate in proportions just slightly - 
	// So if you set this to, say, 0.9 and 1.1, it will oscillate between 90% and 110% of the mouth size
	var mouthOscMin = 0.93; var mouthOscMax = 1.06;
	// Increment the oscillator (increase this number to make it wobble faster)
	this.mouthOscillator += 0.6;
	// We set the height to oscillate with sin, the width via cos, that makes it sort of wobble like jelly
	var mouthWidthOsc = lerp(mouthOscMin, mouthOscMax, (Math.sin(this.mouthOscillator) + 1) / 2);
	var mouthHeightOsc = lerp(mouthOscMin, mouthOscMax, (Math.cos(this.mouthOscillator) + 1) / 2);
	
	this.mouthSize += (mouthSizeTarget - this.mouthSize) * this.easeMouthSize;
	
	// ---------------------------------------
	// Draw the mouth.
	// ---------------------------------------
	// Changed the mouth to a simple circle
	
	ellipse(this.x, this.y + mouthVerticalOffset, this.mouthSize * mouthWidthOsc, this.mouthSize * mouthHeightOsc);
}

// Update my median buffer array
Shape.prototype.updateMedianBuffer = function() {
	
	// If the shape is not considered on (above volume threshhold), don't update the median buffer.
	// This ignores frequencies
	if (!this.isOn) return;
	
	// If it's out of range, just ignore it
	if (this.fundamentalFrequency > FUNDAMENTAL_FREQUENCY_MAX) {
		return;
	} else if (this.fundamentalFrequency < FUNDAMENTAL_FREQUENCY_MIN) {
		return;
	// If we set it to 1, there's essentially no buffer, we just use the live frequency value.
	} else if (this.medianBufferLength == 1) {
		this.medianFrequency = this.fundamentalFrequency;
	}
	
	// Shift array and add most recent value
	this.arrBuffer.shift();
	this.arrBuffer.push(this.fundamentalFrequency);
	var sortedArray = this.arrBuffer.slice(0).sort();
	// Now calculate the median of it
	// If it has even number length
	if (sortedArray.length % 2 == 0) {
		// Take the average of the two middle values
		this.medianFrequency = (sortedArray[sortedArray.length/2] + sortedArray[sortedArray.length/2 + 1]) * 0.5;
	// else if we have even number length
	} else {
		// Just take the middle true median value
		this.medianFrequency = sortedArray[Math.floor(sortedArray.length/2)];
	}	
}

// Find my closest note value in terms of a piano keyboard - so 0.0 would be C0
// and 0.5 would be halfway between C0 and D0. 
// Based on my current this.fundemantalFrequency value.
Shape.prototype.updateColor = function() {
	// Where should we start our search? If previous this.noteValue was 4.3, start our search at 4.
	var k = Math.floor(this.noteValue);
	// What's the frequency of that value?
	var freq0 = arrFrequency[k]; var freq1;
	var step;
	// Is my current frequency higher than that?
	// Which direction should I search?
	if (this.medianFrequency > freq0) step = 1;
	// Else if it's lower than that, we should look down
	else step = -1;
	// This would probably be written better as a while loop (but I prefer for loops)
	// It won't really go through 88 steps, that's just a failsafe number.
	// It'll break whenever it finds the right spot, and that shouldn't take more than 88 steps.
	for (var i = 0; i < arrFrequency.length - 1; i++) {
		if (step == 1) {
			freq1 = arrFrequency[k+1];
		} else {
			freq1 = arrFrequency[k-1];
		}
		// If we're stepping upward through the array
		if ((step == 1) && (this.medianFrequency < freq1)) {
			this.noteValue = k + ((this.medianFrequency - freq0) / (freq1 - freq0));
			break;
		// If we're stepping downward through the array
		} else if ((step == -1) && (this.medianFrequency > freq1)) {
			this.noteValue = (k - 1) + ((this.medianFrequency - freq1) / (freq0 - freq1));			
			break;
		// Else just keep looking
		} else {
			freq0 = freq1;
			k += step;
		}
	}
	
	// Round down to the index values
	var color0, color1;
	var c = Math.floor(this.noteValue) % 12;

	
	
	var prevNote = note;
	note = c;


	$('#note').text(note);

	if (prevNote != note){
		console.log('--- new note ---')
		//$( ".box" ).removeClass("active");
		$( ".box:nth-child("+note+")" ).addClass("active");//.siblings().removeClass('active');
	}else{
		//$(".box").not($( ".box:nth-child("+note+")" )).removeClass('active');
		//$( ".box" ).removeClass("active");
		/*
		setTimeout(function() {
		       $( ".box" ).removeClass("active");
		   }, 2000);
		   */
	}
	
	

	prevNote = c;


	// Set the colors it should interpolate between
	color0 = arrColor[c];
	// Should we wrap around back to the base color?
	color1 = c == 11 ? arrColor[0] : arrColor[c + 1];
	var ratio = this.noteValue % 1;
	// Now let's figure out what color that should be
	this.colorTarget = [
		lerp(color0[0], color1[0], ratio),
		lerp(color0[1], color1[1], ratio),
		lerp(color0[2], color1[2], ratio)
	];	
	// Now ease towards it
	this.color = [
		this.color[0] + (this.colorTarget[0] - this.color[0]) * this.easeColor,
		this.color[1] + (this.colorTarget[1] - this.color[1]) * this.easeColor,
		this.color[2] + (this.colorTarget[2] - this.color[2]) * this.easeColor
	];
}

// accepts a timeDomainBuffer and multiplies every value
Shape.prototype.autoCorrelate = function(timeDomainBuffer) {
  
  var nSamples = timeDomainBuffer.length;

  // pre-normalize the input buffer
  if (PRE_NORMALIZE){
    timeDomainBuffer = this.normalize(timeDomainBuffer);
  }

  // zero out any values below the CENTER_CLIP_THRESHOLD
  if (DO_CENTER_CLIP) {
    timeDomainBuffer = this.centerClip(timeDomainBuffer);
  }

  var autoCorrBuffer = [];
  for (var lag = 0; lag < nSamples; lag++){
    var sum = 0; 
    for (var index = 0; index < nSamples-lag; index++){
      var indexLagged = index+lag;
      var sound1 = timeDomainBuffer[index];
      var sound2 = timeDomainBuffer[indexLagged];
      var product = sound1 * sound2;
      sum += product;
    }

    // average to a value between -1 and 1
    autoCorrBuffer[lag] = sum/nSamples;
  }

  // normalize the output buffer
  if (POST_NORMALIZE){
    autoCorrBuffer = this.normalize(autoCorrBuffer);
  }

  return autoCorrBuffer;
}


// Find the biggest value in a buffer, set that value to 1.0,
// and scale every other value by the same amount.
Shape.prototype.normalize = function(buffer) {
  var biggestVal = 0;
  var nSamples = buffer.length;
  for (var index = 0; index < nSamples; index++){
    if (abs(buffer[index]) > biggestVal){
      biggestVal = abs(buffer[index]);
    }
  }
  for (var index = 0; index < nSamples; index++){

    // divide each sample of the buffer by the biggest val
    buffer[index] /= biggestVal;
  }
  return buffer;
}

// Accepts a buffer of samples, and sets any samples whose
// amplitude is below the CENTER_CLIP_THRESHOLD to zero.
// This factors them out of the autocorrelation.
Shape.prototype.centerClip = function(buffer) {
  var nSamples = buffer.length;

  // center clip removes any samples whose abs is less than CENTER_CLIP_THRESHOLD
  CENTER_CLIP_THRESHOLD = map(mouseY, 0, height, 0,1); 

  if (CENTER_CLIP_THRESHOLD > 0.0) {
    for (var i = 0; i < nSamples; i++) {
      var val = buffer[i];
      buffer[i] = (Math.abs(val) > CENTER_CLIP_THRESHOLD) ? val : 0;
    }
  }
  return buffer;
}

// Calculate the fundamental frequency of a buffer
// by finding the peaks, and counting the distance
// between peaks in samples, and converting that
// number of samples to a frequency value.
Shape.prototype.findFrequency = function(autocorr) {

  var nSamples = autocorr.length;
  var valOfLargestPeakSoFar = 0;
  var indexOfLargestPeakSoFar = -1;

  for (var index = 1; index < nSamples; index++){
    var valL = autocorr[index-1];
    var valC = autocorr[index];
    var valR = autocorr[index+1];

    var bIsPeak = ((valL < valC) && (valR < valC));
    if (bIsPeak){
      if (valC > valOfLargestPeakSoFar){
        valOfLargestPeakSoFar = valC;
        indexOfLargestPeakSoFar = index;
      }
    }
  }
  
  var distanceToNextLargestPeak = indexOfLargestPeakSoFar - 0;

  // convert sample count to frequency
  var fundamentalFrequency = sampleRate() / distanceToNextLargestPeak;
  return fundamentalFrequency;
}

// Return my current y position as a ratio 0 to 1, that represents
// its position within its allowed y position range
Shape.prototype.getYAsRatio = function() {
	return (this.y - this.yMin) / (this.yMax - this.yMin);
}

// Return my current level as a ratio 0 to 1
Shape.prototype.getLevelAsRatio = function() {
	return this.levelRatio;
}

// Return my current color as an [R, G, B] array
Shape.prototype.getColor = function() {
	return this.color;
}

