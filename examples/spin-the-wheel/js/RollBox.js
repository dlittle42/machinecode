RollBox = function ( parent, ledger ) {

	this.curQuaternion;
	this.rotationSpeed = 2;
	this.lastMoveTimestamp;
	this.moveReleaseTimeDelta = 50;

	this.startPoint = {
		x: 0,
		y: 0
	};


	this.deltaX = 60,
	this.deltaY = 0;
	this.cube;

	this.rotateStartPoint = new THREE.Vector3(0, 0, 1);
	this.rotateEndPoint = new THREE.Vector3(0, 0, 1);

	var windowHalfX = window.innerWidth / 2;
	var windowHalfY = window.innerHeight / 2;



	this.init = function(){
		console.log('init')
		var boxGeometry = new THREE.BoxGeometry(200, 200, 200);

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

		var cubeMaterial = new THREE.MeshBasicMaterial(
		{
			vertexColors: THREE.FaceColors,
			overdraw: 0.5
		});

		this.cube = new THREE.Mesh(boxGeometry, cubeMaterial);
		this.cube.position.y = 200;
		parent.add(this.cube);

		//ledger.push(this);
	}

	this.projectOnTrackball = function(touchX, touchY)
	{
		var mouseOnBall = new THREE.Vector3();

		mouseOnBall.set(
			clamp(touchX / windowHalfX, -1, 1), clamp(-touchY / windowHalfY, -1, 1),
			0.0
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
		this.curQuaternion = this.cube.quaternion;
		this.curQuaternion.multiplyQuaternions(rotateQuaternion, this.curQuaternion);
		this.curQuaternion.normalize();
		//cube.setRotationFromQuaternion(curQuaternion);

		this.cube.setRotationFromQuaternion(this.curQuaternion);

		this.rotateEndPoint = this.rotateStartPoint;
	}

	this.setDeltaX = function(num){
		this.deltaX = num;
	}

	this.setDeltaY = function(num){
		this.deltaY = num;
	}

	this.init();

}

RollBox.prototype = Object.create( THREE.EventDispatcher.prototype );
RollBox.prototype.constructor = RollBox;