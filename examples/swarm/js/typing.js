/////////////////////////

		// Detects webgl
		if ( ! Detector.webgl ) {
			Detector.addGetWebGLMessage();
			document.getElementById( 'container' ).innerHTML = "";
		}

		// - Global variables -

		// Graphics variables
		var container, stats;
		var camera, controls, scene, renderer;
		var textureLoader;
		var clock = new THREE.Clock();



///------------------- letter stuff ------

		var group, textMesh1, textMesh2, textGeo, materials;

	    var firstLetter = true;
	    var mainletter;
	    var linebreak = 0;

	    var letters = [];
	    var letterPool = [];

	    var width = window.innerWidth;
	    var height = window.innerHeight;

	  //  var phrase = "do you ha";

	    var cycle=0;

	    var text = "S",

	        height = 1,
	        size = 2,
	        hover = 3,

	        curveSegments = 4,

	        bevelThickness = 1,
	        bevelSize = .3,//1.5,
	        bevelSegments = 10,
	        bevelEnabled = true,

	        font = undefined,

	    //    fontName = "Slukoni";//"optimer", // helvetiker, optimer, gentilis, droid sans, droid serif
	    //    fontWeight = "Medium";//"bold"; // normal bold

	        fontName = "MarshyKate",
	        fontWeight = "Medium";

	    var mirror = false;

	     var postprocessing = { enabled : false, renderMode: 0 }; 


	    var depthMaterial, effectComposer, depthRenderTarget, composer;



///---------------------------------------


		var mouseCoords = new THREE.Vector2();
		var raycaster = new THREE.Raycaster();
		var ballMaterial = new THREE.MeshPhongMaterial( { color: 0x000000 } );

		var time = 0;

		var info = document.getElementById('info');

	//	var mouthTexture = textureLoader.load( "images/mouth/spritesheet.png" );
		//var annie;

		var colors=[
			"blue",
			"orange",
			"pink",
			"purple",
			"yellow",

		];



		
		var sky;
		var letterGroup = new THREE.Group();

		var letterWidth=0;
		var wordWidth = 0;

		// - Main code -

		init();
		


		// - Functions -

		function init() {

			initGraphics();
			initInput();

		}

		function initGraphics() {

			container = document.getElementById( 'container' );

			camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.2, 2000 );

			scene = new THREE.Scene();

			camera.position.x = 0;
			camera.position.y = 2;
			camera.position.z =  16;

			controls = new THREE.OrbitControls( camera );
			controls.target.y = 2;

			renderer = new THREE.WebGLRenderer({alpha: true, antialias:true, precision: "mediump"});
		//	renderer.setClearColor( 0x7FE8EF );
			renderer.setPixelRatio( window.devicePixelRatio );
			renderer.setSize( window.innerWidth, window.innerHeight );
		//	renderer.shadowMap.enabled = true;

			textureLoader = new THREE.TextureLoader();

			var ambientLight = new THREE.AmbientLight( 0x707070 );
			scene.add( ambientLight );

			var light = new THREE.DirectionalLight( 0xffffff, 1 );
			light.position.set( 0, 10, 5 );
		/*	
			light.castShadow = true;
			var d = 14;
			light.shadow.camera.left = -d;
			light.shadow.camera.right = d;
			light.shadow.camera.top = d;
			light.shadow.camera.bottom = -d;

			light.shadow.camera.near = 2;
			light.shadow.camera.far = 50;

			light.shadow.mapSize.x = 1024;
			light.shadow.mapSize.y = 1024;
		*/

			scene.add( light );

			createSkybox();

			var axisHelper = new THREE.AxisHelper( 15 );
			scene.add( axisHelper );

			letterGroup.position.set(0,0,0)
			scene.add(letterGroup);

			//createMonkey();
			//addMonkey();

			materials = [
	            new THREE.MeshPhongMaterial( { color: 0x111100, shading: THREE.FlatShading } ), // front
	            new THREE.MeshPhongMaterial( { color: 0x333333, shading: THREE.SmoothShading } ) // side
	        ];



	        console.log(fontName)
	        loadFont();
	       // staticEffect();


			//container.innerHTML = "";

			container.appendChild( renderer.domElement );

			stats = new Stats();
			stats.domElement.style.position = 'absolute';
			stats.domElement.style.top = '0px';
			container.appendChild( stats.domElement );

			//

			window.addEventListener( 'resize', onWindowResize, false );

		}

		function createSkybox(){

			var skyGeo = new THREE.SphereGeometry(500, 50, 50); 
			var loader  = new THREE.TextureLoader(),
        		texture = loader.load( "images/blue-stripes.png" );

        	texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
            texture.repeat.set( 12, 12 );
        	var material = new THREE.MeshPhongMaterial({ 
			        map: texture,
			});
			sky = new THREE.Mesh(skyGeo, material);
		    sky.material.side = THREE.BackSide;
		    scene.add(sky);
		}


		function loadFont() {

	        var loader = new THREE.FontLoader();
	        var typefile = 'fonts/' + fontName + '_' + fontWeight + '.typeface.json';
	        console.log(typefile);
	        loader.load( typefile, function ( response ) {

	            console.log('font loaded');

	            font = response;

	           // refreshText();
	           // mainletter = createText('a');
	          //  scene.add(mainletter);

	           // addPhrase('doyouha');
	            createText('D');


	     //       addPhrase('computing', new THREE.Vector3( 0, 0, -10 ), 5);

				animate();

	        } );

	    }


	    function refreshText() {


	       var letter = createText(text);

	      //  mainletter.geometry.dispose();
	       // console.log(mainletter.geometry);
	      //  mainletter.geometry = letter.geometry;

	    }

	    function addSpace(){
	    	wordWidth-=20;
	    	TweenMax.to(letterGroup.position, .5, {
	            //x: "+=2",
	            x: wordWidth,
	          //  delay: .4,
	          //  repeat: 1,
	          	ease:"Power3.easeOut",
	          /*  yoyo: true,
	            onComplete:function(){
            		_this.destroy();
                  }
                  */
	        });
	    }

	    function removeLetter(){
	    	
	    	wordWidth+=letterPool[letterPool.length-1].width;
		    letterGroup.remove(letterPool[letterPool.length-1])
		    letterPool.splice(-1);

		    TweenMax.to(letterGroup.position, .5, {
			            //x: "+=2",
			            x: wordWidth,
			          //  delay: .4,
			          //  repeat: 1,
			          	ease:"Power3.easeOut",
			          /*  yoyo: true,
			            onComplete:function(){
	                		_this.destroy();
	                      }
	                      */
			        });

	    }

	    function resetLetterGroup(){

		    TweenMax.to(letterGroup.position, .5, {
			            x: 1,
			          //  delay: .4,
			          //  repeat: 1,
			          	ease:"Power3.easeOut",
			          /*  yoyo: true,
			            onComplete:function(){
	                		_this.destroy();
	                      }
	                      */
			        });

	
	    }

	    function createText(letter) {

	    	var loader  = new THREE.TextureLoader(),
        		texture = loader.load( "images/blue-stripes.png" );

	        textGeo = new THREE.TextGeometry( letter, {

	            font: font,

	            size: size,
	            height: height,
	            curveSegments: curveSegments,

	            bevelThickness: bevelThickness,
	            bevelSize: bevelSize,
	            bevelEnabled: bevelEnabled,

	            material: 0,
	            extrudeMaterial: 1

	        });

	        textGeo.computeBoundingBox();
	        textGeo.computeVertexNormals();

	        var letWidth = (textGeo.boundingBox.max.x - textGeo.boundingBox.min.x);
	      //  alert(letWidth)

	      //	if (letterPool.length>1){

	            TweenMax.to(letterGroup.position, .5, {
			        //    x: "-=2",
			            x: wordWidth,
			          //  delay: .4,
			          //  repeat: 1,
			          	ease:"Power3.easeOut",
			       
			        });
	      //  }


	      	wordWidth-=letWidth;

	       
	        var centerOffset = -0.5 * ( textGeo.boundingBox.max.x - textGeo.boundingBox.min.x );
	        var centerOffsetY = -( textGeo.boundingBox.max.y - textGeo.boundingBox.min.y )/2;
	        var centerOffsetZ = -( textGeo.boundingBox.max.z - textGeo.boundingBox.min.z )/2;
	     //   alert(centerOffsetZ)
	  //   info.innerHTML = getLetterOffset();
	  		console.log(centerOffset)
	  		console.log(centerOffset+ bevelSize+ getLetterOffset())

	      //  textGeo.translate( centerOffset+ bevelSize+ getLetterOffset(), 0, centerOffsetZ + bevelThickness);
	     //   info.innerHTML = Math.floor(centerOffset*.3);

	        textMesh1 = new THREE.Mesh( textGeo, materials );

	        textMesh1.position.x = getLetterOffset();//centerOffset;
	      //  textMesh1.position.y = 0;//hover+ height;
	        textMesh1.position.y = (Math.random()*40)-20;//hover+ height;
	        textMesh1.position.z = 20;//centerOffsetZ;//0;

	        textMesh1.rotation.x = (Math.random()*40)-20;
	        textMesh1.rotation.y = (Math.random()*40)-20;
	       // textMesh1.rotation.y = Math.PI * 2;
	        textMesh1.width = letWidth;

	        var boxHelper = new THREE.BoxHelper( textMesh1 );
			boxHelper.material.color.set( 0xff0000 );
		//	textMesh1.add( boxHelper );




	    //    textMesh1.scale.set(.03,.03,.03)
	     //   textMesh1.position.x = letterPool.length + letWidth;
	        //textMesh1.position.x = letterPool.length+ letterWidth *.03;

	      //  letters.push(letter);
            letterPool.push(textMesh1);
            letterGroup.add(textMesh1);


            TweenMax.to(textMesh1.position, .6, {
			        //    x: "-=2",
			        	//x: getLetterOffset(),
			            z: 0,
			            y: 0,
			          //  delay: .4,
			          //  repeat: 1,
			          	ease:"Power3.easeOut",
			          	//ease: Elastic.easeOut.config(1, 0.3)
			       
			        });

             TweenMax.to(textMesh1.rotation, .4, {
			        //    x: "-=2",
			        	//x: getLetterOffset(),
			            x: 0,
			            y:0,
			          //  delay: .4,
			          //  repeat: 1,
			          	ease:"Power3.easeOut",
			          	//ease: Elastic.easeOut.config(1, 0.3)
			       
			        });


	        return textMesh1;


	       

	        

	    }


 		function getLetterOffset(){
 			var total = 0;
 			for(var n=0; n<letterPool.length; n++){
 				total+= letterPool[n].width;
 			}
 			return total;
 		}


		function createRandomColor() {
			return Math.floor( Math.random() * ( 1 << 24 ) );
		}

		function createMaterial( color ) {
			color = color || createRandomColor();
			return new THREE.MeshPhongMaterial( { color: color } );
		}

		function initInput() {

			document.addEventListener( 'keydown', onDocumentKeyDown, false );
		//	document.addEventListener( 'keyup', onDocumentKeyUp, false );

			//document.addEventListener('mousedown', addMonkey, false);

		}

        function onDocumentKeyDown( event ) {
        	//alert(letterPool[0].width)

            var keyCode = event.which;
           // alert(keyCode)
          //  info.innerHTML = keyCode;
            var idx = Math.floor(Math.random()*4);
            console.log("-----"+idx)

          //	$( ".bkgd" ).addClass("active");
         // 	$('.bkgd').css('background-image', 'url(images/' + colors[idx] + '-stripes.png)').addClass("active");

          	if (keyCode == 32){
          		// spacebar
          		console.log('spacebar')

            

            }else if ( keyCode == 46 || keyCode == 8 ) {
            	// backspace
            	console.log('delete')
              //  event.preventDefault();
                if (letterPool.length>0){
                	removeLetter();
                } else{
                	resetLetterGroup()
                }

            } else {

                var ch = String.fromCharCode( keyCode );
                text = ch;
                console.log('text is '+ text)

                refreshText();
               
              //  createLetter(ch, 1);

            }

        }

        function onDocumentKeyUp( event ) {

          
          	
          	setTimeout(function(){
	            $( ".bkgd" ).removeClass("active");
	      },500);

        }



		function onWindowResize() {

			camera.aspect = window.innerWidth / window.innerHeight;
			camera.updateProjectionMatrix();

			renderer.setSize( window.innerWidth, window.innerHeight );

		}

		function animate() {

			requestAnimationFrame( animate );

			render();
			//stats.update();

		}

		function render() {

			var deltaTime = clock.getDelta();

			controls.update( deltaTime );

			sky.material.map.offset.x += .005;

			renderer.render( scene, camera );

		

			time += deltaTime;

		}


		