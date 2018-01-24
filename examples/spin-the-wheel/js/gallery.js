/*class Rectangle {
  constructor(height, width) {
    this.height = height;
    this.width = width;
  }
  // Getter
  get area() {
    return this.calcArea();
  }
  // Method
  calcArea() {
    return this.height * this.width;
  }
}

const square = new Rectangle(10, 10);

console.log(square.area); // 100
*/


class Gallery {

  

  constructor(imgArr, letterGroup){
    
    this.imgArr = imgArr;
    this.letterGroup = letterGroup;
    this.textureLoader = null;
    this.materialArr = [];
    this.panelArr = [];
    this.imgArrIdx = 0;
    this.numObj = imgArr.length;
    this.stepAngle = Math.PI*2 / numObj;
    this.damper= 1; //one for desktop, 2 for mobile
    this.postDragRotation = 0;
    this.prevDragX = 0;
    this.targetRot=0;
    this.manager = new THREE.LoadingManager();

   // this.initLoader();
  }


  get area() {
   // return this.calcArea();
  }


  // Method
  toDegrees(angle) {
    return angle * (180 / Math.PI);
  }

  initLoader(){
  //  alert('initLoader')
    var _this = this;
    this.manager = new THREE.LoadingManager();

    this.manager.onProgress = function ( item, loaded, total ) {
     // progressBar.style.width = (loaded / total * 100) + '%';
     // console.log(item, loaded, total);
    };

    this.manager.onLoad = function (){
    //  console.log('load:'+imgArrIdx +":: "+imgArr.length)
      if (_this.imgArrIdx < _this.imgArr.length) {
        _this.loadImages();
      }else {
        console.log('all items loaded');
        console.error('createRing')
        console.log('imgArr...')
        console.log(imgArr)
        console.log('materialArr...')
        console.log(materialArr)

        _this.createRing();
      }
    }

    this.manager.onError = function (){
      console.log('loading error');
    }
    this.textureLoader = new THREE.TextureLoader(this.manager);
    this.textureLoader.crossOrigin = true;
    this.loadImages();
  }

  loadImages(){
      console.log('-- load '+imgArrIdx)
      var _this = this;
    
      this.textureLoader.load("images/portfolio620/"+imgArr[imgArrIdx], function(texture) {
          _this.materialArr.push(texture);
          _this.imgArrIdx++;
      })
  }

  createRing(){

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

          this.letterGroup.add(panel);
        //  scene.add(panel)

          panelArray.push(panel)

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

}
/*
function Gallery(imgArr, letterGroup){


   // this.letterGroup = null;
    this.textureLoader = null;
    this.materialArr = [];
    this.panelArr = [];
    this.imgArrIdx = 0;
    this.numObj = imgArr.length;
    this.stepAngle = Math.PI*2 / numObj;
    this.damper= 1; //one for desktop, 2 for mobile
    this.postDragRotation = 0;
    this.prevDragX = 0;
    this.targetRot=0;
  //  this.tick;
  //  this.delay = 0;
  //  this.count = 0;
    this.manager = new THREE.LoadingManager();

    this.manager.onProgress = function ( item, loaded, total ) {
     // progressBar.style.width = (loaded / total * 100) + '%';
     // console.log(item, loaded, total);
    };

    this.manager.onLoad = function (){
      
      if (this.imgArrIdx < imgArr.length) {
        this.loadImages();
      }else {
        console.log('all items loaded');
        console.error('createRing')
        console.log('imgArr...')
        console.log(imgArr)
        console.log('materialArr...')
        console.log(this.materialArr)

        this.createRing();
      }
    }

    this.manager.onError = function (){
      console.log('loading error');
    }

    this.textureLoader = new THREE.TextureLoader(this.manager);
    this.textureLoader.crossOrigin = true;

    this.loadImages = function(){
        console.log('-- load '+imgArrIdx)
        this.textureLoader.load("images/portfolio620/"+imgArr[imgArrIdx], function(texture) {
            this.materialArr.push(texture);
            this.imgArrIdx++;
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

          letterGroup.add(panel);
        //  scene.add(panel)

          panelArray.push(panel)

          panel.position.x = r * Math.cos(theta- (Math.PI/2)) ;

          if(j==0){
            console.error('obj0.x='+panel.position.x)
          }
          //panel.position.x = r * Math.cos(theta) ;
          panel.position.y=0;
          panel.position.z = r * Math.sin(theta- Math.PI/2);
        //  panel.position.z = r * Math.sin(theta);
          panel.rotation.y = Math.atan2( -panel.position.x, -panel.position.z );
          console.log('panel rotation ='+Math.floor(toDegrees(panel.rotation.y)));
       }
  }
  this.loadImages();
}
*/
