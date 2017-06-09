
function Bitbot() {
  
    this.group = new THREE.Object3D();
    this.bitBot = new THREE.Object3D();
    this.bitBot1;
    this.bitBot2;
    this.bitBot3;
    this.noBot;
    this.yesBot;
    this.motion_speed=1;
    this.motion_delay=0.2;
    this.ease_type=Expo.easeInOut;

            
    var geometry = new THREE.BoxGeometry( 1, 1, 1 ); 

    var material3 = new THREE.MeshPhongMaterial({
        color: 0x58ABFF,
        shading: THREE.FlatShading,
        transparent: true, 
        opacity: 1.0
      });

    var geom3 = new THREE.DodecahedronGeometry(2, 0)
    // var geom3 = new THREE.SphereGeometry(2, 6, 6);
    this.bitBot1 =  new THREE.Mesh(geom3, material3);
    this.bitBot.add(this.bitBot1)


    var angle = 90;
    // var geom3 = new THREE.SphereGeometry(2, 6, 6);
    this.bitBot2 =  new THREE.Mesh(geom3, material3);
    this.bitBot.add(this.bitBot2)
    this.bitBot2.rotation.x = (Math.PI/180)*angle;
    this.bitBot2.rotation.y = (Math.PI/180)*angle;
    this.bitBot2.rotation.z = (Math.PI/180)*angle;


      var angle = 27;
     // var geom3 = new THREE.SphereGeometry(2, 6, 6);
      this.bitBot3 =  new THREE.Mesh(geom3, material3);
      this.bitBot.add(this.bitBot3)
    //  bitBot3.rotation.x = (Math.PI/180)*angle;
      this.bitBot3.rotation.y = (Math.PI/180)*90;
      this.bitBot3.rotation.z = (Math.PI/180)*90;

    //   bitBot3.position.x = 4;
      // setting start rotation for cubes
    //  group.rotation.x=0.62;
    //  group.rotation.y=-0.78;
      var yes_geom = new THREE.OctahedronGeometry(1, 0);
      var no_geom = new THREE.SphereGeometry(1, 16, 16);

      this.yesBot =  new THREE.Mesh(yes_geom, new THREE.MeshPhongMaterial({
        color: 0xf4e842,
        shading: THREE.FlatShading
      }));
    //  yesBot.position.x = 3;
     this.group.add(this.yesBot)

      this.noBot =  new THREE.Mesh(no_geom, new THREE.MeshPhongMaterial({
        color: 0xfc3600,
        shading: THREE.FlatShading
      }));
    //  noBot.position.x = -3;
      this.group.add(this.noBot)

      var numVerts = no_geom.vertices.length;

      console.log(numVerts);

      for(var i = 0; i < numVerts; i++)
      {
         // var v2 = no_geom.vertices[i].clone();
          //v2 = v2.multiplyScalar( 2 );

          var radius = 3;//(Math.random()*2)
          if (i % 10 == 0){
          //  no_geom.vertices[i].multiplyScalar( (radius) * Math.sin(angle));
            no_geom.vertices[i].multiplyScalar(1.6);
           // v2 = v2.multiplyScalar( 4 );
          }else if (i % 5== 0){
            no_geom.vertices[i].multiplyScalar(1.4);
            //v2 = v2.multiplyScalar( 3 );
          }else{
            no_geom.vertices[i].multiplyScalar(.5);
            //v2 = v2.multiplyScalar( 1.5 );
          }
         // tweenDepth(no_geom.vertices[i], v2);

      }
      this.group.add(this.bitBot);

      this.initAnimation();
      console.log(this.group)
      return this.group;
}


Bitbot.prototype.initAnimation = function() {
   
    var bit = this;
    TweenMax.to(this.bitBot1.scale, .5, {
          x: 1.2,
          y: 1.2,
          z: 1.2,
          ease:bit.ease_type,
          repeat: -1,
          //repeatDelay: 1,
          //delay: .5,
          yoyo: true
          

        })
    TweenMax.to(this.bitBot2.scale, .5, {
          x: 1.2,
          y: 1.2,
          z: 1.2,
          ease:bit.ease_type,
          repeat: -1,
         //repeatDelay: 1,
          delay: .25,
          yoyo: true,
          onRepeat:bit.tween_3(bit)
          

        })

     TweenMax.to(this.bitBot3.scale, .5, {
          x: 1.2, 
          y: 1.2,
          z: 1.2,
          ease:bit.ease_type,
          repeat: -1,
        //  repeatDelay: .25,
          //delay: .5,
          yoyo: true,
          onRepeat:function(){
            bit.tween_2(bit)
          }
          
          

        })
};

Bitbot.prototype.tween_2 = function(targ) {

  console.log(targ)
  console.log('-----')
  console.log(this)


  console.log('tween2')
  var new_rotation=this.bitBot.rotation.z-(Math.PI/180)*(Math.random()*90);
  console.log(new_rotation)
 // var new_rotation=bitBot.rotation.y+(Math.PI/180)*90;
  console.log(targ.motion_speed)
  console.log(this.motion_speed)
  TweenMax.to(this.bitBot.rotation, this.motion_speed, {
    onStart:function(){
      console.log('!!! start tween2')
    },
    ease:this.ease_type, 
   // delay:motion_delay, 
    y:new_rotation, 
    onComplete: function(){
      console.log('tween2 complete');
      targ.tween_3()
    }
  });
}

Bitbot.prototype.tween_3 = function(targ) {

  console.log('tween3')
  var new_rotation=this.bitBot.rotation.z-(Math.PI/180)*(Math.random()*90);
  TweenMax.to(this.bitBot.rotation, this.motion_speed, {
   // onStart:blur_on,
    ease:this.ease_type, 
    delay:this.motion_delay,
   // x:0, 
   // y:0,
    z:new_rotation, 
   // onComplete:tween_4
  });
}
/*
Bitbot.prototype.loadYes = function() {

    yesSound = new Howl({
      src: ['audio/bityes.mp3'],
      volume: 1.0
    });

  }
  */
