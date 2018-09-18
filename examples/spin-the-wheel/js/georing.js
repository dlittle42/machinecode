GalleryRing = function ( imageArr, parent ) {

    this.images = 10;//imageArr;

   // this.objects = 10;
    this.parent = parent;
    this.activePanel = 0;
    this.keys = { LEFT: 37, UP: 38, RIGHT: 39, BOTTOM: 40 };

    




	//
	// public methods
	//
/*
	this.loadImages = function(){
        //console.log('-- load '+imgArrIdx)
        //console.log(this.images[imgArrIdx])
        textureLoader.load("images/portfolio620/"+this.images[imgArrIdx], function(texture) {
            materialArr.push(texture);
            imgArrIdx++;
        })
    }
*/
    this.updateRotation = function( rot ){

      //console.log('init animation: '+rot)

      rot=rot*stepAngle;
    /*  
      if (rot >0){
        rot = stepAngle;
      }else{
        rot = -stepAngle;
      }
  */
      //console.log('initAnimation=' + rot)
      //var rot = stepAngle;//Math.PI/3;
      var time = dragDuration/1000;
      
      TweenMax.to(this.parent.rotation, 1+ time,{
               // z:depth,
                x:0,
                //y:'+='+ rot,//(rot - postDragRotation),
                y:rot,
                z:0,
               // delay: delay,
                ease:"Power3.easeOut",
                onStart:function(){
                  //console.log('start = '+ scope.parent.rotation.y)
                  //console.log('start deg = '+ toDegrees(scope.parent.rotation.y).toFixed(2));
                 // //console.log('start deg = '+ toDegrees(scope.parent.rotation.y).toFixed(2));
                 // playTick(Math.abs(_this.activePanel - rot));
                },
                onUpdate:function(){
          
                },
                onComplete:function(){
                   // no_geom.verticesNeedUpdate = true;
                  //  //console.log(letterGroup.rotation.y)
                  //console.log('end = '+ scope.parent.rotation.y)
                  //console.log('end deg = '+ toDegrees(scope.parent.rotation.y).toFixed(2));
                //  hud.textContent =activePanel;//panelArray[activePanel].name;
                  var rotations = Math.round(scope.parent.rotation.y/stepAngle);
                  //console.warn(rotations)
                  var idx = (rotations)%numObj;
                  //console.error(idx)
                  if (idx <0){
                    idx = numObj + idx;
                  }
                  scope.activePanel = Math.abs(idx);
              //    hud.textContent = activePanel;//panelArray[idx].name;
              //    info.innerHTML = debugDrag(rot, dragDuration)

              //  //console.log('tweened');
            }});
         
    }

    this.dispose = function () {

		document.removeEventListener( 'touchstart', onTouchStart, false );
		document.removeEventListener( 'touchend', onTouchEnd, false );
		document.removeEventListener( 'touchmove', onTouchMove, false );

		document.removeEventListener( 'mousedown', onMouseDown, false );
		document.removeEventListener( 'mousemove', onMouseMove, false );
		document.removeEventListener( 'mouseup', onMouseUp, false );

		window.removeEventListener( 'keydown', onKeyDown, false );

		//scope.dispatchEvent( { type: 'dispose' } ); // should this be added here?

	};


	//
	// internals
	//

	var scope = this;

	var changeEvent = { type: 'change' };
	var startEvent = { type: 'start' };
	var endEvent = { type: 'end' };

  var map = new THREE.TextureLoader().load( 'images/UV_Grid_Sm.jpg' );
        map.wrapS = map.wrapT = THREE.RepeatWrapping;
        map.anisotropy = 16;

    //var material = new THREE.MeshPhongMaterial( { map: map, side: THREE.DoubleSide } );
     var material = new THREE.MeshBasicMaterial({ color: 0xF3A2B0, wireframe: true });

    var shapeArr = [
      new THREE.SphereBufferGeometry( 10, 10, 2 ),
      new THREE.IcosahedronBufferGeometry( 7, 1 ),
      new THREE.OctahedronBufferGeometry( 7, 2 ),
      new THREE.TetrahedronBufferGeometry( 7, 0 ),
      new THREE.PlaneBufferGeometry( 10, 10, 5, 5 ),
      new THREE.BoxBufferGeometry( 10, 10, 10, 4, 4, 4 ),
      new THREE.CircleBufferGeometry( 10, 7, 0, Math.PI * 2 ),
      new THREE.RingBufferGeometry( 2, 10, 5, 5, 0, Math.PI * 2 ),
      new THREE.CylinderBufferGeometry( 10, 10, 100, 40, 5 )
    ]

    var objects =shapeArr.length;


    var textureLoader = null;
    var materialArr = [];
    var panelArray = [];
    var imgArrIdx = 0;
    var numObj = objects;//images;//.length;
    var stepAngle = Math.PI*2 / numObj;
    var damper= 1; //one for desktop, 2 for mobile
    var postDragRotation = 0;
    var prevDragX = 0;
    var targetRot=0;
    var dragDiff;

    //var info, hud;
    
    var activePanel = 0;
    var isDragging = false;
    var freeDrag = 0;
    var initDragTime = 0;
    var endDragTime = 0;
    var dragDuration = 0;


		var initDragX = 0;
		var endDragX = 0;

		
		var r = 40;

  
/*

    textureLoader = new THREE.TextureLoader(manager);
    textureLoader.crossOrigin = true;
*/

    function toDegrees(angle) {
        return angle * (180 / Math.PI);
    }

    function createRing(){

        //console.log(toDegrees(stepAngle))
        //var theta = (Math.PI*2)/numberOfPoints;
        
        for ( var j = 0; j < numObj; j ++ ) {

                  
          var theta = stepAngle* j;
          //var dTheta = 2 * Math.PI / 1000;

          var geometry = new THREE.PlaneGeometry( 10, 10, 5 );
          ////console.log(materialArr[(j)%imgArr.length])
        //  //console.log(materialArr[j].image.src)
      /*    var panel = new THREE.Mesh( geometry, new THREE.MeshBasicMaterial( {
           // map: materialArr[j], 
            color: '#ff0000',
            side:THREE.DoubleSide 
          } ));
*/
          var panel = new THREE.Mesh( shapeArr[j],material);

          panel.name="obj"+j;


          panel.doubleSided = true;

          scope.parent.add(panel);
          console.log(scope.parent)
        //  scene.add(panel)

          panelArray.push(panel)

          panel.position.x = r * Math.cos(theta- (Math.PI/2)) ;

          if(j==0){
            //console.error('obj0.x='+panel.position.x)
          }
          //panel.position.x = r * Math.cos(theta) ;
          panel.position.y=0;
          panel.position.z = r * Math.sin(theta- Math.PI/2);
        //  panel.position.z = r * Math.sin(theta);
          panel.rotation.y = Math.atan2( -panel.position.x, -panel.position.z );
          //console.log('panel rotation ='+Math.floor(toDegrees(panel.rotation.y)));
       }
  }


  	//
	// event handlers - FSM: listen for events and reset state
	//

	function handleStart( event ) {

		//console.log('handleStart')

		if(event.touches) damper=2;

    //  initDragX = mouse.;
        prevDragX = 0;
        initDragTime = performance.now();
        dragDuration = 0;
        dragDiff=0;
       //// info.innerHTML = debugDrag(0, 0)
    
        isDragging = true;
        //camera.position.z = 1;

        //hud.textContent =0;
      //  hud.style.opacity=1;

        if (event.touches){
        //  //console.log('got touches')
          initDragX = ( event.touches[0].clientX / renderer.domElement.clientWidth ) * 2 - 1;
          //mouse.y = - ( event.touches[0].clientY / renderer.domElement.clientHeight ) * 2 + 1;
          //getTouchPointer();
          //hud.style.left  = (event.touches[0].clientX + 5) + 'px';
              //hud.style.top = (event.touches[0].clientY - 40) + 'px';
        }else{
          ////console.log('is mouse')
          initDragX = ( event.clientX / renderer.domElement.clientWidth ) * 2 - 1;
          //mouse.y = - ( event.clientY / renderer.domElement.clientHeight ) * 2 + 1;
          //getDesktopPointer();

          //hud.style.left  = (event.clientX + 5) + 'px';
              //hud.style.top = (event.clientY - 40) + 'px';
        }
        //scaleMask(-11)
    /////    scaleCamera(5)
	}

	function onMouseDown( event ) {

		
			handleStart( event );
			scope.dispatchEvent( startEvent );

		

	}


	function onTouchStart( event ) {

		
			handleStart( event );
			scope.dispatchEvent( startEvent );

		

	}

	function handleMove( event ) {

		//console.log('handleMove')

		if (isDragging){
	        if (event.touches){
	          ////console.log('got touches')
	          endDragX = ( event.touches[0].clientX / renderer.domElement.clientWidth ) * 2 - 1;
	        }else{
	          //console.log('is mouse')
	          endDragX = ( event.clientX / renderer.domElement.clientWidth ) * 2 - 1;
	        }

	        prevDragX = endDragX;

	        dragDiff = ((initDragX - endDragX)/damper) * stepAngle;

	      //  hud.textContent =dragDiff.toFixed(2);
	        
	      
	       // info.innerHTML = debugDrag(dragDiff, 0)
	        //xfactor = 0;//10;
	        var diff = dragDiff/(numObj*2)
	        scope.parent.rotation.y += diff;
	    
        
      	}

		
	}

	function onMouseMove( event ) {

		
			handleMove( event );
			scope.dispatchEvent( changeEvent );

		

	}


	function onTouchMove( event ) {

		
			handleMove( event );
			scope.dispatchEvent( changeEvent );

		

	}

	function handleEnd( event ) {

		//console.log('handleEnd')

    //  initDragX = mouse.;
        endDragTime = performance.now();
        isDragging = false;
        dragDuration = endDragTime - initDragTime;
        postDragRotation = scope.parent.rotation.y;
        //letterGroup.position.z = 0;

      //  info.innerHTML = debugDrag(dragDiff, dragDuration)
        var next = Math.floor(dragDiff.toFixed(2)*10);
        targetRot += next;
        ////console.warn(_this.targetRot)
    //    _this.initAnimation(_this.targetRot);
        //initAnimation(dragDiff*5);
        scope.updateRotation(targetRot)
        //scaleMask(-10)
  //////      scaleCamera(-5)
        //hud.style.opacity=0;

		
	}

	function onMouseUp( event ) {

		
			handleEnd( event );
			scope.dispatchEvent( endEvent );

		

	}


	function onTouchEnd( event ) {

		
			handleEnd( event );
			scope.dispatchEvent( endEvent );

		

	}



	function handleKeyDown( event ) {

		//console.log( 'handleKeyDown' );

		dragDuration =.3;

		switch ( event.keyCode ) {

			case scope.keys.LEFT:
				targetRot-=1;
	        	//console.log('37')
			//	scope.update();
				break;

			case scope.keys.RIGHT:
				targetRot+=1;
	        	//console.log('39')
				//scope.update();
				break;

		}
		scope.updateRotation(targetRot)
		// _this.initAnimation(this.targetRot)

	}

	function onKeyDown( event ) {

		handleKeyDown( event );

	}

	document.addEventListener( 'touchstart', onTouchStart, false);
    document.addEventListener( 'mousedown', onMouseDown, false);

    document.addEventListener( 'touchmove', onTouchMove, false);
    document.addEventListener( 'mousemove', onMouseMove, false);

    document.addEventListener( 'touchend', onTouchEnd, false);
    document.addEventListener( 'mouseup', onMouseUp, false);

	window.addEventListener( 'keydown', onKeyDown, false );



	// force an update at start

	//this.update();
	//this.loadImages();
  createRing();

};

GalleryRing.prototype = Object.create( THREE.EventDispatcher.prototype );
GalleryRing.prototype.constructor = GalleryRing;
