
function Gallery(imgArr, letterGroup){

    var _this = this;
   // this.letterGroup = null;
    this.images = imgArr;
    this.parent = letterGroup;
    this.textureLoader = null;
    this.materialArr = [];
    this.panelArray = [];
    this.imgArrIdx = 0;
    this.numObj = this.images.length;
    this.stepAngle = Math.PI*2 / this.numObj;
    this.damper= 1; //one for desktop, 2 for mobile
    this.postDragRotation = 0;
    this.prevDragX = 0;
    this.targetRot=0;

    //var info, hud;
    
    this.activePanel = 0;
    this.isDragging = false;
    this.freeDrag = 0;
    this.initDragTime = 0;
    this.endDragTime = 0;
    this.dragDuration = 0;
  //  this.tick;
  //  this.delay = 0;
  //  this.count = 0;
    this.manager = new THREE.LoadingManager();

    this.manager.onProgress = function ( item, loaded, total ) {
     // progressBar.style.width = (loaded / total * 100) + '%';
     // console.log(item, loaded, total);
    };

    this.manager.onLoad = function (){
     // alert(imgArrIdx +" or  "+ )
      if (_this.imgArrIdx < _this.numObj) {
        _this.loadImages();
      }else {
        console.log('all items loaded');
        console.error('createRing')
        console.log('imgArr...')
        console.log(_this.images)
        console.log('materialArr...')
        console.log(_this.materialArr)

        _this.createRing();
      }
    }

    this.manager.onError = function (){
      console.log('loading error');
    }

    this.textureLoader = new THREE.TextureLoader(this.manager);
    this.textureLoader.crossOrigin = true;

    this.loadImages = function(){
        console.log('-- load '+this.imgArrIdx)
        console.log(this.images[this.imgArrIdx])
        this.textureLoader.load("images/portfolio620/"+this.images[this.imgArrIdx], function(texture) {
            _this.materialArr.push(texture);
            _this.imgArrIdx++;
        })
    }

    this.toDegrees = function(angle) {
        return angle * (180 / Math.PI);
    }

    this.createRing = function(){

        console.log(this.toDegrees(this.stepAngle))
        //var theta = (Math.PI*2)/numberOfPoints;
        
        for ( var j = 0; j < this.numObj; j ++ ) {

                  
          var theta = this.stepAngle* j;
          //var dTheta = 2 * Math.PI / 1000;

          var geometry = new THREE.PlaneGeometry( 10, 10, 5 );
          //console.log(materialArr[(j)%imgArr.length])
          console.log(this.materialArr[j].image.src)
          var panel = new THREE.Mesh( geometry, new THREE.MeshBasicMaterial( {
            map: this.materialArr[j], 
            side:THREE.DoubleSide 
          } ));

          panel.name="obj"+j;


          panel.doubleSided = true;

          this.parent.add(panel);
        //  scene.add(panel)

          this.panelArray.push(panel)

          panel.position.x = r * Math.cos(theta- (Math.PI/2)) ;

          if(j==0){
            console.error('obj0.x='+panel.position.x)
          }
          //panel.position.x = r * Math.cos(theta) ;
          panel.position.y=0;
          panel.position.z = r * Math.sin(theta- Math.PI/2);
        //  panel.position.z = r * Math.sin(theta);
          panel.rotation.y = Math.atan2( -panel.position.x, -panel.position.z );
          console.log('panel rotation ='+Math.floor(this.toDegrees(panel.rotation.y)));
       }
  }

  this.onKeyPress = function(event){
      this.dragDuration =.3;
      if ( event.keyCode === 37){
        this.targetRot-=1;
        //alert('37')

      
      }else if (event.keyCode === 39){
        this.targetRot+=1;
       // alert('39')
      
      }
     _this.initAnimation(this.targetRot)
     // info.innerHTML = debugDrag(1, dragDuration)
    }

  this.initDrag = function(event){
     
    //alert(this.prevDragX)

      if(event.touches) this.damper=2;


      //  console.log('pre-active='+panelArray[activePanel].name)
      //  swapEffect();
    //  initDragX = mouse.;
        this.prevDragX = 0;
        this.initDragTime = performance.now();
        this.dragDuration = 0;
        this.dragDiff=0;
       //// info.innerHTML = debugDrag(0, 0)
    
        this.isDragging = true;
        //camera.position.z = 1;

        //hud.textContent =0;
      //  hud.style.opacity=1;

        if (event.touches){
        //  console.log('got touches')
          this.initDragX = ( event.touches[0].clientX / renderer.domElement.clientWidth ) * 2 - 1;
          //mouse.y = - ( event.touches[0].clientY / renderer.domElement.clientHeight ) * 2 + 1;
          //getTouchPointer();
          //hud.style.left  = (event.touches[0].clientX + 5) + 'px';
              //hud.style.top = (event.touches[0].clientY - 40) + 'px';
        }else{
          //console.log('is mouse')
          this.initDragX = ( event.clientX / renderer.domElement.clientWidth ) * 2 - 1;
          //mouse.y = - ( event.clientY / renderer.domElement.clientHeight ) * 2 + 1;
          //getDesktopPointer();

          //hud.style.left  = (event.clientX + 5) + 'px';
              //hud.style.top = (event.clientY - 40) + 'px';
        }
        //scaleMask(-11)
    /////    scaleCamera(5)

    }

    this.onDragMove= function(event){
    //  initDragX = mouse.;
      if (this.isDragging){
        if (event.touches){
          //console.log('got touches')
          this.endDragX = ( event.touches[0].clientX / renderer.domElement.clientWidth ) * 2 - 1;
        }else{
          console.log('is mouse')
          this.endDragX = ( event.clientX / renderer.domElement.clientWidth ) * 2 - 1;
        }

        this.prevDragX = this.endDragX;

        this.dragDiff = ((this.initDragX - this.endDragX)/this.damper) * this.stepAngle;

      //  hud.textContent =dragDiff.toFixed(2);
        
      
       // info.innerHTML = debugDrag(dragDiff, 0)
        //xfactor = 0;//10;
        var diff = this.dragDiff/(this.numObj*2)
        _this.parent.rotation.y += diff;
        
      }

    }

    this.endDrag= function(event){
      console.log(_this.parent)
        console.log(this.isDragging)
        console.log(_this.isDragging)
    //  initDragX = mouse.;
        _this.endDragTime = performance.now();
        _this.isDragging = false;
        _this.dragDuration = _this.endDragTime - _this.initDragTime;
        _this.postDragRotation = _this.parent.rotation.y;
        //letterGroup.position.z = 0;

      //  info.innerHTML = debugDrag(dragDiff, dragDuration)
        var next = Math.floor(_this.dragDiff.toFixed(2)*10);
        _this.targetRot += next;
        console.warn(_this.targetRot)
    //    _this.initAnimation(_this.targetRot);
        //initAnimation(dragDiff*5);
        //scaleMask(-10)
  //////      scaleCamera(-5)
        //hud.style.opacity=0;




    }

    this.initAnimation = function( rot ){

      console.log('init animation: '+rot)

      rot=rot*_this.stepAngle;
    /*  
      if (rot >0){
        rot = stepAngle;
      }else{
        rot = -stepAngle;
      }
  */
      console.log('initAnimation=' + rot)
      //var rot = stepAngle;//Math.PI/3;
      var time = this.dragDuration/1000;
      
      TweenMax.to(this.parent.rotation, 1+ time,{
               // z:depth,
                x:0,
                //y:'+='+ rot,//(rot - postDragRotation),
                y:rot,
                z:0,
               // delay: delay,
                ease:"Power3.easeOut",
                onStart:function(){
                  console.log('start = '+ _this.parent.rotation.y)
                  console.log('start deg = '+ this.toDegrees(_this.parent.rotation.y).toFixed(2));
                  console.log('start deg = '+ this.toDegrees(_this.parent.rotation.y).toFixed(2));
                 // playTick(Math.abs(_this.activePanel - rot));
                },
                onUpdate:function(){
          
                },
                onComplete:function(){
                   // no_geom.verticesNeedUpdate = true;
                  //  console.log(letterGroup.rotation.y)
                  console.log('end = '+ _this.parent.rotation.y)
                  console.log('end deg = '+ _this.toDegrees(_this.parent.rotation.y).toFixed(2));
                //  hud.textContent =activePanel;//panelArray[activePanel].name;
                  var rotations = Math.round(_this.parent.rotation.y/_this.stepAngle);
                  console.warn(rotations)
                  var idx = (rotations)%_this.numObj;
                  console.error(idx)
                  if (idx <0){
                    idx = numObj + idx;
                  }
                  _this.activePanel = Math.abs(idx);
              //    hud.textContent = activePanel;//panelArray[idx].name;
              //    info.innerHTML = debugDrag(rot, dragDuration)

              //  console.log('tweened');
            }});
         
    }


  this.initInput = function() {
      console.log('obj init input')
    
      window.addEventListener( 'touchstart', this.initDrag, false);
      window.addEventListener( 'mousedown', this.initDrag, false);

      window.addEventListener( 'touchmove', this.onDragMove, false);
      window.addEventListener( 'mousemove', this.onDragMove, false);

     window.addEventListener( 'touchend', this.endDrag, false);
      window.addEventListener( 'mouseup', this.endDrag, false);
    
      window.addEventListener( 'keydown', this.onKeyPress, false);
    

    //  document.getElementById('inst').onclick = swapEffect;
      

    }

  





  this.loadImages();
  this.initInput();
}
