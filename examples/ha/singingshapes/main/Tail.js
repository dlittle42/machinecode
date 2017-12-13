// Tail class
// shapePm:    What Shape I'm linked to
function Tail(shapePm) {

	// Link me to my shape
	this.shape = shapePm;
	// How many sample points to maintain in my data array
	this.samples = 350;
	// How many lines to draw for each set of two points 
	// e.g. setting this to three means that between each two points, we'll interpolate
	// with three lines to help the smoothing between stroke size and color
	// Don't set this to 1. Use 2 or above.
	this.subdivisions = 3;
	// How many samples to apply to the fade in/out (can be 0 if you want no fade in)
	this.samplesFadeIn = 30;
	this.samplesFadeOut = 90;
	// Stroke thickness range
	this.strokeMin = 1; this.strokeMax = 10;
	
	// Main data array. It's a multidimensional array:
	// 0 = y position, as ratio 0 (bottom of screen area) to 1 (top of screen area)
	// 1 = stroke thickness, as ratio 0 (thinnest) to 1 (thickest)
	// 2 = [R, G, B] color value at that point
	this.arrData = new Array(this.samples);
	
	// initialize
	this.init();
}

// Initialize
Tail.prototype.init = function() {
	// Fill the array
	for (var i = 0; i < this.arrData.length; i++) {
		this.arrData[i] = new Array(3);
		// y position (-1 means nothing was recorded at that moment)
		this.arrData[i][0] = -1;
		this.arrData[i][1] = -1;
		this.arrData[i][2] = -1;
	}
}

// Update every frame
Tail.prototype.update = function() {
	var arr = new Array(3);
	// Check if the shape is on
	if ((this.shape.isOn) && (!this.shape.isOnset)) {
		// y position
		arr[0] = this.shape.getYAsRatio(); 
		// stroke thickness
		arr[1] = this.shape.getLevelAsRatio();						
		// [R, G, B]
		arr[2] = this.shape.getColor();
		//console.log("it's on!" + arr[0]);
	} else {
		// Else fill it with off data (-1)
		arr[0] = -1; arr[1] = -1; arr[2] = -1;
	}
	// Add latest point to the array
	this.arrData.push(arr);
	// Shift everything by one
	this.arrData.shift();
}

// Render me to the canvas
Tail.prototype.render = function() {
	
	//blendMode(ADD); 
	
	
	var x, y, x0, y0, x1, y1
	var xs0, ys0, xs1, ys1;
	var strokeSize, strokeSize0, strokeSize1;
	var strokeSizeSub;
	var strokeColor, strokeColor0, strokeColor1;
	var strokeColorSub;
	// temporary
	x0 = 0; y0 = height/2;
	
	var startNewLine = true;
	
	var xMax = width * 0.48;
	var xMin = width * 0.1;
	var yOffset = 10; // offset the y value by this many pixels a bit to make it line up better with the mouth
	
	// Dim ratio for fading out the colors at the beginning and and
	var fadeRatio;

	
	for (var i = 0; i < this.arrData.length; i++) {
		// If we have any data
		if (this.arrData[i][0] != -1) {

			// Fade in the color at the beginning
			if (i < this.samplesFadeOut) {
				fadeRatio = ((i + 1)/this.samplesFadeOut);
			// Fade out the color at the end
			} else if (i > (this.samples - this.samplesFadeIn)) {
				fadeRatio = (this.samples - i) / this.samplesFadeIn;
			} else {
				fadeRatio = 1;
			}

			// What are the current values at this point in the array
			x = lerp(xMin, xMax, (i/this.arrData.length));
			y = lerp(this.shape.yMin, this.shape.yMax, this.arrData[i][0]) + yOffset;
			strokeSize = lerp(this.strokeMin, this.strokeMax, this.arrData[i][1]);
			strokeColor = [
				fadeRatio * this.arrData[i][2][0],
				fadeRatio * this.arrData[i][2][1],
				fadeRatio * this.arrData[i][2][2]
			]

			// If we are starting a new line, don't draw it yet, just store those values as
			// the first point
			if (startNewLine) {
				x0 = x; y0 = y; strokeSize0 = strokeSize; strokeColor0 = strokeColor;
				startNewLine = false;
			// else draw it
			} else {			
				// Store previous stroke as the one we want to move towards
				x1 = x; y1 = y; strokeSize1 = strokeSize; strokeColor1 = strokeColor;
				// Initialize the subdivion coordinates
				xs0 = x0; ys0 = y0;
				// Now go through the subdivisions
				for (var s = 0; s < this.subdivisions; s++) {
					
					// ratio 0 to 1
					var r = s / (this.subdivisions - 1);
					// Position
					xs1 = lerp(x0, x1, r);
					ys1 = lerp(y0, y1, r);
					// Stroke size
					strokeSizeSub = lerp(strokeSize0, strokeSize1, r);
					// Stroke color
					strokeColorSub = [
						lerp(strokeColor0[0], strokeColor1[0], r),
						lerp(strokeColor0[1], strokeColor1[1], r),
						lerp(strokeColor0[2], strokeColor1[2], r)												
					];
					// Now draw it
					strokeWeight(strokeSizeSub);
					stroke(strokeColorSub);
					line(xs0, ys0, xs1, ys1);
					// *** NOTE - eventually we should ease the stroke weight and color here too

					// Increment for next subdivision
					xs0 = xs1; ys0 = ys1;
				}
				
				//line(x0, y0, x1, y1);
				// Increment for next one
				x0 = x1; y0 = y1;
				strokeSize0 = strokeSize1; strokeColor0 = strokeColor1;
			}
		// else there wasn't a point there, we should end it and start 
		} else {
			// Else 
			startNewLine = true;
		}
	}
}
