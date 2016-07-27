/*(function() {

var scene, camera, renderer;
var geometry, material, mesh;

init();
animate();

function init() {

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 10000 );
    camera.position.z = 1000;

    geometry = new THREE.BoxGeometry( 200, 200, 200 );
    material = new THREE.MeshBasicMaterial( { color: 0xff0000, wireframe: true } );

    mesh = new THREE.Mesh( geometry, material );
    scene.add( mesh );

    renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight );

    document.body.appendChild( renderer.domElement );

}

function animate() {

    requestAnimationFrame( animate );

    mesh.rotation.x += 0.01;
    mesh.rotation.y += 0.02;

    renderer.render( scene, camera );

}
*/


(function() {

    var renderer;
    var isMorphing = false;
    var newPos = [];
    var numVerts;
    var depth = 14;
    var controls;
    var scrollPos = 0;
    var vertArray = [];
    var p1;
    var mt = document.getElementById('morphText');
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);

    camera.position.set(0, 0, 100);
    camera.lookAt(scene.position);
   // camera.position.y = 35;
   // camera.rotation.x = 0;//-45 * Math.PI / 180;

    document.onselectstart = function() {
        return false;
    };


   container = document.getElementById('WebGL-output');


    //RENDERER
    renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
  //  renderer.setClearColor( 0xF13B4F );
    container.appendChild(renderer.domElement);


     // orbit controls rotate continuously
 //   controls = new THREE.OrbitControls( camera, renderer.domElement );

                //controls.addEventListener( 'change', render ); // add this only if there is no animation loop (requestAnimationFrame)
/*                controls.enableDamping = true;
                controls.dampingFactor = 0.25;
                controls.enableZoom = true;
*/

    var axisHelper = new THREE.AxisHelper( 500 );
    scene.add( axisHelper );

    var texture = THREE.ImageUtils.loadTexture('images/rtop-header.png');

    var geometry    = new THREE.PlaneGeometry(320, 140, 50, 50);
  //  geometry.applyMatrix( new THREE.Matrix4().makeRotationX( - Math.PI / 3 ) );
    var mat         = new THREE.MeshBasicMaterial( { map:texture });//wireframe:true, color:'green', side:THREE.DoubleSide } );
    var planeMesh   = new THREE.Mesh(geometry, mat);
   // planeMesh.rotation.x = 90;
   planeMesh.position.z = 0;

    numVerts = geometry.vertices.length;
    /*
    console.log(numVerts);
    for(var i = 0; i < numVerts; i++)
    {
        geometry.vertices[i].y = Math.random() * depth;
    }
*/
    scene.add(planeMesh);





    var texture2 = THREE.ImageUtils.loadTexture('images/msf.png');

    var geometry2    = new THREE.PlaneGeometry(240, 100, 50, 50);
   // geometry2.applyMatrix( new THREE.Matrix4().makeRotationX( - Math.PI / 2 ) );
    var mat         = new THREE.MeshBasicMaterial( { map:texture2 });//wireframe:true, color:'green', side:THREE.DoubleSide } );
    var planeMesh2   = new THREE.Mesh(geometry2, mat);
 //   planeMesh2.rotation.x = 90;
    planeMesh2.position.z = 200;

    numVerts2 = geometry2.vertices.length;
    /*
    console.log(numVerts);
    for(var i = 0; i < numVerts; i++)
    {
        geometry.vertices[i].y = Math.random() * depth;
    }
*/
    scene.add(planeMesh2);



    ////////////

    var texture3 = THREE.ImageUtils.loadTexture('images/peachstreet.png');

    var geometry3    = new THREE.PlaneGeometry(240, 100, 50, 50);
   // geometry2.applyMatrix( new THREE.Matrix4().makeRotationX( - Math.PI / 2 ) );
    var mat         = new THREE.MeshBasicMaterial( { map:texture3 });//wireframe:true, color:'green', side:THREE.DoubleSide } );
    var planeMesh3   = new THREE.Mesh(geometry3, mat);
 //   planeMesh2.rotation.x = 90;
    planeMesh3.position.z = 400;

    numVerts3 = geometry3.vertices.length;

    scene.add(planeMesh3);


    ///////////


    var texture4 = THREE.ImageUtils.loadTexture('images/battlegym.png');

    var geometry4    = new THREE.PlaneGeometry(240, 100, 50, 50);
   // geometry2.applyMatrix( new THREE.Matrix4().makeRotationX( - Math.PI / 2 ) );
    var mat         = new THREE.MeshBasicMaterial( { map:texture4 });//wireframe:true, color:'green', side:THREE.DoubleSide } );
    var planeMesh4   = new THREE.Mesh(geometry4, mat);
 //   planeMesh2.rotation.x = 90;
    planeMesh4.position.z = 600;

    numVerts4 = geometry4.vertices.length;

    scene.add(planeMesh4);


    ///////////


    var texture5 = THREE.ImageUtils.loadTexture('images/ptrumps.png');

    var geometry5    = new THREE.PlaneGeometry(240, 100, 50, 50);
   // geometry2.applyMatrix( new THREE.Matrix4().makeRotationX( - Math.PI / 2 ) );
    var mat         = new THREE.MeshBasicMaterial( { map:texture5});//wireframe:true, color:'green', side:THREE.DoubleSide } );
    var planeMesh5   = new THREE.Mesh(geometry5, mat);
 //   planeMesh2.rotation.x = 90;
    planeMesh5.position.z = 800;

    numVerts5 = geometry5.vertices.length;

    scene.add(planeMesh5);

    ///////////



/*
    function addPlane(geom, img, offset){
            
        var texture2 = THREE.ImageUtils.loadTexture('images/chicago.jpeg');

        var geometry2    = new THREE.PlaneGeometry(240, 100, 50, 50);
       // geometry2.applyMatrix( new THREE.Matrix4().makeRotationX( - Math.PI / 2 ) );
        var mat         = new THREE.MeshBasicMaterial( { map:texture2 });//wireframe:true, color:'green', side:THREE.DoubleSide } );
        var planeMesh2   = new THREE.Mesh(geometry2, mat);
     //   planeMesh2.rotation.x = 90;
        planeMesh2.position.y = -200;

        var numVerts = geometry2.vertices.length;

        vertArray.push(numVerts);

        scene.add(planeMesh2);
    }
*/


/*
    var geometryCol = new THREE.CubeGeometry(25, 1000, 25);
    var materialCol = new THREE.MeshBasicMaterial({
                    color: 0x000000,
                    wireframe: true,
                    wireframeLinewidth: 2
                });

    var column = new THREE.Mesh(geometryCol, materialCol);
    scene.add(column);
    column.y = -500;
*/

    document.onclick   = function(evt) {

        console.log(evt.keyCode, isMorphing);

        
        
        
        if(isMorphing){
            for(var i = 0; i < numVerts; i++)
            {
                tweenDepth(geometry.vertices[i], 0);
                tweenDepth(geometry2.vertices[i], 0);
            }
            mt.innerHTML = 'READY';
            mt.style.color = '#00aa00';
            isMorphing = false;




        }else{
            for(var i = 0; i < numVerts; i++)
            {
                tweenDepth(geometry.vertices[i], Math.random()*50);
                tweenDepth(geometry2.vertices[i], Math.random()*50);
            }
            isMorphing = true;
            mt.innerHTML = 'MORPHING';
            mt.style.color = '#cc0000';
        }
        
     
    }



      

      function tweenDepth(vertex, depth) {

        TweenMax.to(vertex, Math.random(),{
                   // z:depth,
                    z:depth,
                    ease:"Power3.easeOut",
                    onUpdate:function(){
                        geometry.verticesNeedUpdate = true;
                        geometry2.verticesNeedUpdate = true;
                        geometry3.verticesNeedUpdate = true;
                        geometry4.verticesNeedUpdate = true;
                        geometry5.verticesNeedUpdate = true;
                  //  console.log('tweened');
                }});


      }




    function render()
    {
        renderer.render(scene, camera); 
        requestAnimationFrame(render);  
      //  camera.position.y-=1;
        //controls.update();
        if (isScrolling){
            for(var i = 0; i < numVerts; i++)
            {

                
                if(isOdd(i)){

                    geometry.vertices[i].z +=delta;
                    geometry2.vertices[i].z +=delta
                    geometry3.vertices[i].z +=delta;
                    geometry4.vertices[i].z +=delta;
                    geometry5.vertices[i].z +=delta;
               /* geometry.vertices[i].z = scrollPos;
                geometry2.vertices[i].z = (scrollPos+200);
                geometry3.vertices[i].z = (scrollPos+400);
                geometry4.vertices[i].z = (scrollPos+600);
                geometry5.vertices[i].z = (scrollPos+800);
                */
                }else{
                    geometry.vertices[i].z +=delta*2;
                    geometry2.vertices[i].z +=delta*2;
                    geometry3.vertices[i].z +=delta*2;
                    geometry4.vertices[i].z +=delta*2;
                    geometry5.vertices[i].z +=delta*2;
                }
            }
            geometry.verticesNeedUpdate = true;
            geometry2.verticesNeedUpdate = true;
            geometry3.verticesNeedUpdate = true;
            geometry4.verticesNeedUpdate = true;
            geometry5.verticesNeedUpdate = true;
        }
        
      
    }
    render();

/*
    $(document).scroll(function() {
      console.log($(document).scrollTop());
      var pos = -Math.floor($(document).scrollTop());
      scrollPos= pos;
      camera.position.z = Math.floor($(document).scrollTop());

    

      for(var i = 0; i < numVerts; i++)
            {
                tweenDepth(geometry.vertices[i], pos);
                tweenDepth(geometry2.vertices[i], pos);
            }
*/
   // })

   function resetPanel(){

            for(var i = 0; i < numVerts; i++)
            {
                tweenDepth(geometry.vertices[i], 0);
                tweenDepth(geometry2.vertices[i], 0);
                tweenDepth(geometry3.vertices[i], 0);
                tweenDepth(geometry4.vertices[i], 0);
                tweenDepth(geometry5.vertices[i], 0);
            }
   }


   function isOdd(num) { return num % 2;}

    var $output = $( "#output" ),
        isScrolling = false,
        scrolling = "<span id='scrolling'>Scrolling</span>",
        stopped = "<span id='stopped'>Stopped</span>",
        delta=1,
        lastScrollPosition = 0,
        dist = 0;


  

        $( window ).scroll(function() {
            $output.html( scrolling );
            isScrolling =true;

            var newScrollPosition = window.scrollY;
            dist = newScrollPosition - lastScrollPosition;
 
            if (newScrollPosition < lastScrollPosition){
                //upward - code here
                delta = 1;
            }else{
                //downward - code here
                delta = -1;
            }
            console.log("delta="+delta);
            lastScrollPosition = newScrollPosition;


            console.log($(document).scrollTop());
              var pos = -Math.floor($(document).scrollTop());
              scrollPos= pos;
              camera.position.z = Math.floor($(document).scrollTop());


            clearTimeout( $.data( this, "scrollCheck" ) );
            $.data( this, "scrollCheck", setTimeout(function() {
                $output.html( stopped );
                isScrolling =false;
                resetPanel();


            }, 250) );

        });

   





})();
