// Controller class controls the overall the thing. It creates Dots.
function Controller() {
	
	// Array of my Shape objects
	this.arrShape = [];
	this.totalShapes = 0;
	this.init();
	/*
	// Caption settings
	this.isCaptionFading = false;
	this.wantToFadeCaption = false;
	this.captionOpacity = 1.0;
	this.captionOpacityFadeSpeed = 0.06;
	*/
}

Controller.prototype.init = function() {
	
	// How many shapes will we make?
	var howMany = 0;
	// We'll create one shape for each file if we want to use them.
	if (USE_FILES) howMany += FILES;
	// We'll create one more shape for the mic, if we want to use the mic.
	if (USE_MIC) howMany += 1;
	// Create the shapes
	var shape, useMic, url;
	for (var i = 0; i < howMany; i++) {
		// Is this the last shape, and we're using microphone?
		if ((i == howMany - 1) && USE_MIC) useMic = true;
		else useMic = false;
		// Create that shape
		shape = new Shape(this, i, useMic);
		// Add it to our array
		this.arrShape.push(shape);
	}
	this.totalShapes = this.arrShape.length;
	/*
	// Create the caption element
	this.captionDiv = createDiv("Sing into your mic.");
	this.captionDiv.style("text-align", "center");
	*/
	
}

Controller.prototype.update = function() {
	console.log('note is '+note)

}

Controller.prototype.draw = function() {

	var i, c;

	// Fill the background black
	blendMode(NORMAL); noStroke(); fill(0); rect(0, 0, width, height);
	
	// Now draw the shapes
	//blendMode(ADD);
	var shape;
	// Update all the dots
	for (i = 0; i < this.arrShape.length; i++) {
		shape = this.arrShape[i];
		shape.update();
	//	shape.tail.update();
		
	//	shape.tail.render();
		shape.render();	
	}
	/*
	// Fade out the caption if its opacity is not zero
	if (this.wantToFadeCaption && this.captionOpacity > 0) {
		this.captionOpacity -= this.captionOpacityFadeSpeed;
		this.captionDiv.style("opacity", this.captionOpacity);
	}
	*/
}

// Triggered whenever the window is resized
Controller.prototype.windowResized = function() {
	// Update all the shapes
	for (i = 0; i < this.arrShape.length; i++) {
		shape = this.arrShape[i];
		shape.windowResized();
	}	
	// Move the caption
	var divHeight = 40;
	//this.captionDiv.position(0, height - divHeight);	
	//this.captionDiv.size(width, divHeight);
}
