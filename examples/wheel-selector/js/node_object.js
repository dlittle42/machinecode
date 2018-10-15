Node = function(){

	//circle = new THREE.Object3D();
	this.mesh = new THREE.Object3D();
	this.mesh.name = "node"

	var geom = new THREE.IcosahedronGeometry(.5, 1);
	var geom2 = new THREE.IcosahedronGeometry(.5, 1);

	var material = new THREE.MeshPhongMaterial({
		color: 0x58ABFF,
		shading: THREE.FlatShading
	});

	var mat = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      shading: THREE.FlatShading
    });

    var mat2 = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      wireframe: true,
      side: THREE.DoubleSide

    });

    this.node =  new THREE.Mesh(geom, mat);
  //  this.node.scale.x = this.node.scale.y = this.node.scale.z = 10;
    this.mesh.add(this.node)

    this.skel = new THREE.Mesh(geom2, mat2);
	this.skel.scale.x = this.skel.scale.y = this.skel.scale.z = 1.2;
	this.mesh.add(this.skel);
	this.inflate = false;


	//objects.push(this.node)
	//console.log(objects)
 //   circle.add(this);

  	
}

Boxes = function(){

	//circle = new THREE.Object3D();
	this.mesh = new THREE.Object3D();
	this.mesh.name = "planet"

	//var skelet = new THREE.Object3D();


	//var geometry = new THREE.TetrahedronGeometry(2, 0);
	var geom = new THREE.BoxGeometry( .75, .75, .75 );
	var geom2 =  new THREE.BoxGeometry( .75, .75, .75 );

	var material = new THREE.MeshPhongMaterial({
		color: 0x58ABFF,
		shading: THREE.FlatShading
	});

	var mat = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      shading: THREE.FlatShading,
      side: THREE.BackSide
    });

    var mat2 = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      wireframe: true,
      side: THREE.DoubleSide

    });

    this.node =  new THREE.Mesh(geom, mat);
 //   this.node.scale.x = this.node.scale.y = this.node.scale.z = 10;
    this.mesh.add(this.node)

    this.skel = new THREE.Mesh(geom2, mat2);
	this.skel.scale.x = this.skel.scale.y = this.skel.scale.z = 1.2;
	this.mesh.add(this.skel);
	this.inflate = false;

	this.box = new THREE.Mesh(geom2, material);
	this.box.scale.x = this.box.scale.y = this.box.scale.z = .8;
	this.mesh.add(this.box);




	var edges = new THREE.EdgesGeometry( geom, 60 ); // the second parameter solves your problem ;)
	var line = new THREE.LineSegments( edges, new THREE.LineBasicMaterial( { color: 0xff0000 } ) );
	this.mesh.add( line );


	var outlineMaterial2 = new THREE.MeshBasicMaterial( { color: 0x00ff00, side: THREE.BackSide } );
	var outlineMesh2 = new THREE.Mesh( geom2, outlineMaterial2 );
	outlineMesh2.position = this.skel.position;
	outlineMesh2.scale.multiplyScalar(1.05);
	//scene.add( outlineMesh2 );


	
  	
}

ServiceBoxes = function(){

	//circle = new THREE.Object3D();
	this.mesh = new THREE.Object3D();
	this.mesh.name = "planet"

	//var skelet = new THREE.Object3D();


	//var geometry = new THREE.TetrahedronGeometry(2, 0);
	var geom = new THREE.BoxGeometry( .75, .75, .75 );
	var geom2 =  new THREE.BoxGeometry( .75, .75, .75 );

	var material = new THREE.MeshPhongMaterial({
		color: 0x58ABFF,
		shading: THREE.FlatShading
	});

	var mat = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      shading: THREE.FlatShading,
      side: THREE.BackSide
    });

    var mat2 = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      wireframe: true,
      side: THREE.DoubleSide

    });

    this.node =  new THREE.Mesh(geom, mat);
 //   this.node.scale.x = this.node.scale.y = this.node.scale.z = 10;
    this.mesh.add(this.node)

    this.skel = new THREE.Mesh(geom2, mat2);
	this.skel.scale.x = this.skel.scale.y = this.skel.scale.z = 1.2;
	this.mesh.add(this.skel);
	this.inflate = false;

	this.box = new THREE.Mesh(geom2, material);
	this.box.scale.x = this.box.scale.y = this.box.scale.z = .25;
	this.mesh.add(this.box);
	
	this.box.position.set(.1, .1, .1);

	this.box = new THREE.Mesh(geom2, material);
	this.box.scale.x = this.box.scale.y = this.box.scale.z = .25;
	this.mesh.add(this.box);
	this.box.position.set(-.1, .1, .1);


	this.box = new THREE.Mesh(geom2, material);
	this.box.scale.x = this.box.scale.y = this.box.scale.z = .25;
	this.mesh.add(this.box);
	this.box.position.set(-.1, -.1, .1);


	this.box = new THREE.Mesh(geom2, material);
	this.box.scale.x = this.box.scale.y = this.box.scale.z = .25;
	this.mesh.add(this.box);
	this.box.position.set(-.1, -.1, -.1);

	this.box = new THREE.Mesh(geom2, material);
	this.box.scale.x = this.box.scale.y = this.box.scale.z = .25;
	this.mesh.add(this.box);
	this.box.position.set(.1, -.1, .1);


	this.box = new THREE.Mesh(geom2, material);
	this.box.scale.x = this.box.scale.y = this.box.scale.z = .25;
	this.mesh.add(this.box);
this.box.position.set(.1, .1, -.1);

	this.box = new THREE.Mesh(geom2, material);
	this.box.scale.x = this.box.scale.y = this.box.scale.z = .25;
	this.mesh.add(this.box);
	this.box.position.set(.1, -.1, -.1);

	this.box = new THREE.Mesh(geom2, material);
	this.box.scale.x = this.box.scale.y = this.box.scale.z = .25;
	this.mesh.add(this.box);
	this.box.position.set(-.1, .1, -.1);




	var edges = new THREE.EdgesGeometry( geom, 60 ); // the second parameter solves your problem ;)
	var line = new THREE.LineSegments( edges, new THREE.LineBasicMaterial( { color: 0xff0000 } ) );
	this.mesh.add( line );


	var outlineMaterial2 = new THREE.MeshBasicMaterial( { color: 0x00ff00, side: THREE.BackSide } );
	var outlineMesh2 = new THREE.Mesh( geom2, outlineMaterial2 );
	outlineMesh2.position = this.skel.position;
	outlineMesh2.scale.multiplyScalar(1.05);
	//scene.add( outlineMesh2 );


	
  	
}

ServerStack = function(){

	//circle = new THREE.Object3D();
	this.mesh = new THREE.Object3D();
	this.mesh.name = "servers"

	//var skelet = new THREE.Object3D();


	//var geometry = new THREE.TetrahedronGeometry(2, 0);
	var geom = new THREE.BoxGeometry( 1, 1, 1 );
	var geom2 =  new THREE.BoxGeometry( 1, 1, 1 );

	var material = new THREE.MeshPhongMaterial({
		color: 0x58ABFF,
		shading: THREE.FlatShading
	});

	var mat = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      shading: THREE.FlatShading,
      side: THREE.BackSide
    });

    var mat2 = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      wireframe: true,
      side: THREE.DoubleSide

    });

    this.node =  new THREE.Mesh(geom, mat);
 //   this.node.scale.x = this.node.scale.y = this.node.scale.z = 10;
    this.mesh.add(this.node)

    this.skel = new THREE.Mesh(geom2, mat2);
	this.skel.scale.x = this.skel.scale.y = this.skel.scale.z = 1.2;
	this.mesh.add(this.skel);
	this.inflate = false;



	this.box = new THREE.Mesh(geom2, material);
	this.box.scale.y =  .15;
	this.box.scale.x = this.box.scale.z = .9;
	this.mesh.add(this.box);
	
	this.box.position.set(0, -.4, 0);


	this.box = new THREE.Mesh(geom2, material);
	this.box.scale.y =  .15;
	this.box.scale.x = this.box.scale.z = .9;
	this.mesh.add(this.box);
	
	this.box.position.set(0, -.2, 0);


	this.box = new THREE.Mesh(geom2, material);
	this.box.scale.y =  .15;
	this.box.scale.x = this.box.scale.z = .9;
	this.mesh.add(this.box);
	
	this.box.position.set(0, 0, 0);

	this.box = new THREE.Mesh(geom2, material);
	this.box.scale.y =  .15;
	this.box.scale.x = this.box.scale.z = .9;
	this.mesh.add(this.box);
	
	this.box.position.set(0, .2, 0);

	this.box = new THREE.Mesh(geom2, material);
	this.box.scale.y =  .15;
	this.box.scale.x = this.box.scale.z = .9;
	this.mesh.add(this.box);
	
	this.box.position.set(0, .4, 0);




	var edges = new THREE.EdgesGeometry( geom, 60 ); // the second parameter solves your problem ;)
	var line = new THREE.LineSegments( edges, new THREE.LineBasicMaterial( { color: 0xff0000 } ) );
	this.mesh.add( line );


	var outlineMaterial2 = new THREE.MeshBasicMaterial( { color: 0x00ff00, side: THREE.BackSide } );
	var outlineMesh2 = new THREE.Mesh( geom2, outlineMaterial2 );
	outlineMesh2.position = this.skel.position;
	outlineMesh2.scale.multiplyScalar(1.05);
	//scene.add( outlineMesh2 );


	
  	
}


Database = function(){

	//circle = new THREE.Object3D();
	this.mesh = new THREE.Object3D();
	this.mesh.name = "database"

	//var skelet = new THREE.Object3D();


	//var geometry = new THREE.TetrahedronGeometry(2, 0);

	var geom = new THREE.CylinderGeometry( 0.5, 0.5, 1, 12 )
	var geom2 = new THREE.CylinderGeometry( 0.5, 0.5, 1, 12 )

	var material = new THREE.MeshPhongMaterial({
		color: 0x58ABFF,
		shading: THREE.FlatShading
	});

	var mat = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      shading: THREE.FlatShading,
      side: THREE.BackSide
    });

    var mat2 = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      wireframe: true,
      side: THREE.DoubleSide

    });

    this.node =  new THREE.Mesh(geom, mat);
 //   this.node.scale.x = this.node.scale.y = this.node.scale.z = 10;
    this.mesh.add(this.node)

    this.skel = new THREE.Mesh(geom2, mat2);
	this.skel.scale.x = this.skel.scale.y = this.skel.scale.z = 1.2;
	this.mesh.add(this.skel);
	this.inflate = false;



	this.box = new THREE.Mesh(geom2, material);
	this.box.scale.y =  .15;
	this.box.scale.x = this.box.scale.z = .9;
	this.mesh.add(this.box);
	
	this.box.position.set(0, -.4, 0);


	this.box = new THREE.Mesh(geom2, material);
	this.box.scale.y =  .15;
	this.box.scale.x = this.box.scale.z = .9;
	this.mesh.add(this.box);
	
	this.box.position.set(0, -.2, 0);


	this.box = new THREE.Mesh(geom2, material);
	this.box.scale.y =  .15;
	this.box.scale.x = this.box.scale.z = .9;
	this.mesh.add(this.box);
	
	this.box.position.set(0, 0, 0);

	this.box = new THREE.Mesh(geom2, material);
	this.box.scale.y =  .15;
	this.box.scale.x = this.box.scale.z = .9;
	this.mesh.add(this.box);
	
	this.box.position.set(0, .2, 0);

	this.box = new THREE.Mesh(geom2, material);
	this.box.scale.y =  .15;
	this.box.scale.x = this.box.scale.z = .9;
	this.mesh.add(this.box);
	
	this.box.position.set(0, .4, 0);




	var edges = new THREE.EdgesGeometry( geom, 60 ); // the second parameter solves your problem ;)
	var line = new THREE.LineSegments( edges, new THREE.LineBasicMaterial( { color: 0xff0000 } ) );
	this.mesh.add( line );


	var outlineMaterial2 = new THREE.MeshBasicMaterial( { color: 0x00ff00, side: THREE.BackSide } );
	var outlineMesh2 = new THREE.Mesh( geom2, outlineMaterial2 );
	outlineMesh2.position = this.skel.position;
	outlineMesh2.scale.multiplyScalar(1.05);
	//scene.add( outlineMesh2 );


	
  	
}

Pyramid = function(){

	//circle = new THREE.Object3D();
	this.mesh = new THREE.Object3D();
	this.mesh.name = "pyramid"


	var geom = new THREE.CylinderGeometry( .2, 3, 3, 4 );
	var geom2 = new THREE.CylinderGeometry( .2, 3, 3, 4 );

	var material = new THREE.MeshPhongMaterial({
		color: 0x58ABFF,
		shading: THREE.FlatShading
	});

	var mat = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      shading: THREE.FlatShading
    });

    var mat2 = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      wireframe: true,
      side: THREE.DoubleSide

    });

    this.node =  new THREE.Mesh(geom, mat);
    this.node.scale.x = this.node.scale.y = this.node.scale.z = .2;
    this.mesh.add(this.node)

    this.skel = new THREE.Mesh(geom2, mat2);
	this.skel.scale.x = this.skel.scale.y = this.skel.scale.z = .3;
	this.mesh.add(this.skel);
	this.inflate = false;


	//objects.push(this.node)
	//console.log(objects)
 //   circle.add(this);

  	
}


