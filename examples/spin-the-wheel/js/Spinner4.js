var Spinner = function(parent, ledger, subArr) {

	this.curQuaternion;
	this.rotationSpeed = 2;
	this.lastMoveTimestamp;
	this.moveReleaseTimeDelta = 50;
	this.objArr = subArr;
	this.typeObj = 'spinner';
	this.parentSpinner = this;
	this.disableY = true;
	this.disableX = false;
	this.expanded = false;
	this.selection = false;
	//this.spinGroup = new THREE.Object3D();//new THREE.Group();
	//this.spinGroup = new THREE.Group();
	this.subArr = [];

	this.axesHelper = new THREE.AxesHelper( 300 );

	this.shapeArr = [
      new THREE.SphereBufferGeometry( 20, 10, 2 ),
      new THREE.IcosahedronBufferGeometry( 20, 1 ),
      new THREE.OctahedronBufferGeometry( 20, 2 ),
      new THREE.TetrahedronBufferGeometry( 20, 0 ),
     // new THREE.PlaneBufferGeometry( 20, 20, 5, 5 ),
      new THREE.TorusBufferGeometry( 20, 3, 16, 100 ),
      new THREE.BoxBufferGeometry( 20, 20, 20, 4, 4, 4 ),
    //  new THREE.CircleBufferGeometry( 20, 7, 0, Math.PI * 2 ),
      new THREE.TorusKnotBufferGeometry( 20, 3, 100, 16 ),
     // new THREE.RingBufferGeometry( 2, 20, 5, 5, 0, Math.PI * 2 ),
      new THREE.DodecahedronGeometry(20, 0),
      new THREE.CylinderBufferGeometry( 20, 20, 20, 40, 5 )
    ]
	

	this.startPoint = {
		x: 0,
		y: 0
	};


	this.deltaX = Math.random()*100,
	this.deltaY = 0;
	this.cube;

	this.rotateStartPoint = new THREE.Vector3(0, 0, 1);
	this.rotateEndPoint = new THREE.Vector3(0, 0, 1);

	var windowHalfX = window.innerWidth / 2;
	var windowHalfY = window.innerHeight / 2;

	THREE.Object3D.call( this );





	this.init = function(){
		console.log('init')
		var boxGeometry = new THREE.BoxGeometry(200, 200, 200);

		/*
		for (var i = 0; i < boxGeometry.faces.length; i += 2)
		{

			var color = {
				h: (1 / (boxGeometry.faces.length)) * i,
				s: 0.5,
				l: 0.5
			};

			boxGeometry.faces[i].color.setHSL(color.h, color.s, color.l);
			boxGeometry.faces[i + 1].color.setHSL(color.h, color.s, color.l);

		}

		var cubeMaterial = new THREE.MeshPhongMaterial(
		{
			vertexColors: THREE.FaceColors,
			overdraw: 0.5
		});
		*/
		var cubeMaterial = new THREE.MeshPhongMaterial({ color: this.createRandomColor() })
		this.cube = new THREE.Mesh(boxGeometry, cubeMaterial);

		this.cube.material.transparent = true;
		this.cube.typeObj = 'cube'
		this.cube.parentSpinner = this;
		//this.cube.position.y = 200;
		
		this.add(this.cube);
		ledger.push(this.cube)
/*
		var newSphereGeom= new THREE.SphereGeometry(20,20,20);
		var sphere= new THREE.Mesh(newSphereGeom, new THREE.MeshPhongMaterial({ color: 0x2266dd }));
	//	sphere.scale.x = sphere.scale.y = 1;
		this.add( sphere );
		this.subArr.push(sphere)
		ledger.push(sphere)
		
		sphere.position.x = 240;
*/
		this.addSubObjects(10, 350);






		this.add(axesHelper)
		//objArr.push(sphere)
		//objObjArr.push(sphere)

		//ledger.push(this);
	}

	this.addSubObjects = function(num, r){
		for ( var j = 0; j < num; j ++ ) {

              	var stepAngle = Math.PI*2 / num;
				var theta = stepAngle* j;
				//var dTheta = 2 * Math.PI / 1000;

				//var geometry = new THREE.PlaneGeometry( 10, 10, 5 );
		//		var geometry = new THREE.SphereGeometry(20,20,20);
		/*
				var geometry = this.shapeArr[j%this.shapeArr.length]

				var sphere= new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({ color: this.createRandomColor() }));
				sphere.typeObj = 'sub'
				this.add(sphere);

				ledger.push(sphere)
				this.subArr.push(sphere)

		*/

				var sphere = this.objArr[j%this.objArr.length].clone();
				this.add(sphere);
				sphere.typeObj = 'ship-part'
				sphere.parentSpinner = this;
				//sphere.material.color = this.createRandomColor();
				var _this = this;

				sphere.traverse( function ( child ) {
                             if ( child instanceof THREE.Mesh ) {
                                 // child.material.ambient.setHex(this.createRandomColor());
                                  child.material.color.setHex(_this.createRandomColor());
                                  child.parentSpinner = _this;
                                  child.typeObj = 'sub-part';
                                 }
                             } );

				ledger.push(sphere)
				this.subArr.push(sphere)

				sphere.scale.set(10, 10, 10)

			//	sphere.position.x = r * Math.cos(theta- (Math.PI/2)) ;
			//	sphere.xpos =0
				sphere.xpos = r * Math.cos(theta- (Math.PI/2)) ;

				//panel.position.x = r * Math.cos(theta) ;
			//	sphere.position.y=0;
				sphere.ypos=0;
				//sphere.position.z = r * Math.sin(theta- Math.PI/2);
				//sphere.zpos =0
				sphere.zpos = r * Math.sin(theta- Math.PI/2);
			//	sphere.position.z = r * Math.sin(theta);




				//panel.rotation.y = Math.atan2( -panel.position.x, -panel.position.z );
				//console.log('panel rotation ='+Math.floor(toDegrees(panel.rotation.y)));

				//panel.rotation.y -= (Math.PI)/j;
			//	panel.rotation.y = Math.atan2( ( letterGroup.position.x - panel.position.x ), ( letterGroup.position.z - panel.position.z ) );

			} 

	}

	this.createRandomColor = function() {
		return Math.floor( Math.random() * ( 1 << 24 ) );
	}

	this.addSelection = function(){

	}

	this.removeSelection = function(){

	}
/*
	var newSphereGeom= new THREE.SphereGeometry(size,20,20);
	var sphere= new THREE.Mesh(newSphereGeom, new THREE.MeshPhongMaterial({ color: color }));
	//	sphere.scale.x = sphere.scale.y = 1;
	this.add( sphere );

	var sphere2= new THREE.Mesh(newSphereGeom, new THREE.MeshPhongMaterial({ color: color }));
	//	sphere.scale.x = sphere.scale.y = 1;
	this.add( sphere2 );
	sphere2.position.x=20;
*/

	//this.geometry = new THREE.SphereGeometry(size, 32, 32),
  //  this.material = new THREE.MeshLambertMaterial( { color: color } );

  //  THREE.Mesh.call( this, this.geometry, this.material );

  	this.projectOnTrackball = function(touchX, touchY)
	{
		var mouseOnBall = new THREE.Vector3();

		var spinX;
		(!this.disableX) ? spinX = this.clamp(touchX / windowHalfX, -1, 1) : spinX = 0.0;

		var spinY;
		(!this.disableY) ? spinY = this.clamp(-touchY / windowHalfY, -1, 1) : spinY = 0.0;


		mouseOnBall.set(
			spinX, spinY, 0.0
		);

		var length = mouseOnBall.length();

		if (length > 1.0)
		{
			mouseOnBall.normalize();
		}
		else
		{
			mouseOnBall.z = Math.sqrt(1.0 - length * length);
		}

		return mouseOnBall;
	}

	this.rotateMatrix = function(rotateStart, rotateEnd)
	{
		var axis = new THREE.Vector3(),
			quaternion = new THREE.Quaternion();

		var angle = Math.acos(rotateStart.dot(rotateEnd) / rotateStart.length() / rotateEnd.length());

		if (angle)
		{
			axis.crossVectors(rotateStart, rotateEnd).normalize();
			angle *= rotationSpeed;
			quaternion.setFromAxisAngle(axis, angle);
		}
		return quaternion;
	}

	this.clamp = function (value, min, max)
	{
		return Math.min(Math.max(value, min), max);
	}


	this.handleInertia = function(){
		var drag = 0.95;
		var minDelta = 0.05;

		if (this.deltaX < -minDelta || this.deltaX > minDelta)
		{
			this.deltaX *= drag;
		}
		else
		{
			this.deltaX = 0;
		}

		if (this.deltaY < -minDelta || this.deltaY > minDelta)
		{
			this.deltaY *= drag;
		}
		else
		{
			this.deltaY = 0;
		}
	}

	this.handleRotation = function(){

		this.rotateEndPoint = this.projectOnTrackball(this.deltaX, this.deltaY);

		var rotateQuaternion = this.rotateMatrix(this.rotateStartPoint, this.rotateEndPoint);
		this.curQuaternion = this.quaternion;
		this.curQuaternion.multiplyQuaternions(rotateQuaternion, this.curQuaternion);
		this.curQuaternion.normalize();
		//spinGroup.setRotationFromQuaternion(curQuaternion);

		this.setRotationFromQuaternion(this.curQuaternion);

		this.rotateEndPoint = this.rotateStartPoint;
	}



	this.init();
    


}


Spinner.prototype = Object.create(THREE.Object3D.prototype);
Spinner.prototype.constructor = Spinner;

Spinner.prototype.setDeltaX = function(num) {
    this.deltaX = num;
}

Spinner.prototype.setDeltaY = function(num) {
    this.deltaY = num;
}

Spinner.prototype.expand = function() {

	console.log(this.name)
	if (this.expanded){
		
	    this.hideAll();

	}else{
		for ( var j = 0; j < this.subArr.length; j ++ ) {
	    	TweenMax.to(this.subArr[j].position, 1, {
	        	x: this.subArr[j].xpos,
	        	y: this.subArr[j].ypos,
	        	z: this.subArr[j].zpos,
	        	delay: j/20,
	        	ease:"Elastic.easeOut"

	        })
	    }
	     this.expanded = true;
	}
    
}

Spinner.prototype.hideAll = function() {
		for ( var j = 0; j < this.subArr.length; j ++ ) {
			//var newPos = new THREE.Vector3( );
			//var newPos = this.subArr[j].position.clone();
			var newPos= this.subArr[j].position.set(this.subArr[j].xpos, this.subArr[j].ypos, this.subArr[j].zpos)
			//console.log(this.subArr[j].position)
			//console.log(newPos)
			newPos.multiplyScalar(3);
			//console.log(newPos)
			//console.log(newPos.z)
	    	TweenMax.to(this.subArr[j].position, .5, {
	        	x: newPos.x,
	        	y: newPos.y,
	        	z: newPos.z,
	        	ease:"Power3.easeOut"

	        })
	    }
	    this.expanded = false;
}
/*
Spinner.prototype.getMesh = function() {

    return this.mesh;

}

*/