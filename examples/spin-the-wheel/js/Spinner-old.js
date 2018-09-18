Spinner = function ( parent, ledger, moniker ) {

	this.curQuaternion;
	this.rotationSpeed = 2;
	this.lastMoveTimestamp;
	this.moveReleaseTimeDelta = 50;
	this.typeObj = 'spinner';
	this.disableY = true;
	this.disableX = false;
	//this.spinGroup = new THREE.Object3D();//new THREE.Group();
	this.spinGroup = new THREE.Group();
	this.subArr = [];

	this.axesHelper = new THREE.AxisHelper( 300 );
	

	this.startPoint = {
		x: 0,
		y: 0
	};


	this.deltaX = Math.random()*100,
	this.deltaY = 0;
	this.name = moniker;
	this.self = this;
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
		//this.cube.position.y = 200;
		
		this.spinGroup.add(this.cube);
		ledger.push(this.cube)

		var newSphereGeom= new THREE.SphereGeometry(20,20,20);
		var sphere= new THREE.Mesh(newSphereGeom, new THREE.MeshBasicMaterial({ color: 0x2266dd }));
	//	sphere.scale.x = sphere.scale.y = 1;
		this.spinGroup.add( sphere );
		this.subArr.push(sphere)
		ledger.push(sphere)
		
		sphere.position.x = 240;

		this.spinGroup.add(axesHelper)
		//objArr.push(sphere)
		//objObjArr.push(sphere)

		//ledger.push(this);
	}

	this.projectOnTrackball = function(touchX, touchY)
	{
		var mouseOnBall = new THREE.Vector3();

		var spinX;
		(!this.disableX) ? spinX = clamp(touchX / windowHalfX, -1, 1) : spinX = 0.0;

		var spinY;
		(!this.disableY) ? spinY = clamp(-touchY / windowHalfY, -1, 1) : spinY = 0.0;


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
		this.curQuaternion = this.spinGroup.quaternion;
		this.curQuaternion.multiplyQuaternions(rotateQuaternion, this.curQuaternion);
		this.curQuaternion.normalize();
		//spinGroup.setRotationFromQuaternion(curQuaternion);

		this.spinGroup.setRotationFromQuaternion(this.curQuaternion);

		this.rotateEndPoint = this.rotateStartPoint;
	}

	this.setDeltaX = function(num){
		this.deltaX = num;
	}

	this.setDeltaY = function(num){
		this.deltaY = num;
	}

	this.activateSubObjects = function(){


	}

	this.init();

}
Spinner.prototype = Object.create(THREE.Mesh.prototype);
//Spinner.prototype = Object.create( THREE.EventDispatcher.prototype );
Spinner.prototype.constructor = Spinner;