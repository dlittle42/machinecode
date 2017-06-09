'use strict';

(function() {
//  var video       = document.createElement('video')
  var video       = document.getElementById('inputVideo')
    , canvasInput = document.getElementById('inputCanvas')
    , width       = 640
    , height      = 0
    , streaming   = false
    , texture     = new THREE.Texture( video )
    , useComposer = false;

  var materials = {
    shaderOff:  new THREE.MeshBasicMaterial({ map: texture, overdraw: true }),
    dotscreen:  new THREE.ShaderMaterial(THREE.DotScreenShader),
    pixelate:   new THREE.ShaderMaterial(THREE.PixelateShader),
    martens:    new THREE.ShaderMaterial(THREE.MartensShader)
  };

  var htracker;

  function getMaterial(name) {
    if (!materials[name]) {
      name ='shaderOff';
    }

    var m = materials[name].clone();

    if (m instanceof THREE.ShaderMaterial) {
      m.uniforms.tDiffuse.value = texture;
    }

    m.needsUpdate = true;

    return m;
  }

  var material = false;
  var selectedShader = (function(p) { return (!!materials[p] ? p : 'shaderOff'); })(window.location.search.substring(1));

  material = getMaterial(selectedShader);

  navigator.getUserMedia = (
    navigator.getUserMedia        ||
    navigator.webkitGetUserMedia  ||
    navigator.mozGetUserMedia     ||
    navigator.msGetUserMedia
  );

  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;

  //document.body.appendChild( video );

  //
  // Renderer
  //

  var container = document.querySelector('#container')
    , renderer  = new THREE.WebGLRenderer({ antialias: true })
    , scene     = new THREE.Scene()
    , geom =  new THREE.SphereGeometry(10,40,10)
    , mesh      = new THREE.Mesh(geom, material);
 

  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x111111);
  container.appendChild(renderer.domElement);

  mesh.geometry.applyMatrix( new THREE.Matrix4().makeScale( 1.0, 2, 1.5 ) );
  mesh.rotateY( -90 * Math.PI / 180 )
  scene.add(mesh);

  //
  // Camera & Controls
  //

  var camera    = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 10000 )
    , controls  = new THREE.OrbitControls(camera, renderer.domElement );

  camera.position.z = 1000;

  controls.enableDamping = true;
  controls.dampingFactor = 0.25;
  controls.enableZoom = true;

  //
  // Composer & Effect
  //

   var composer   = new THREE.EffectComposer(renderer)
     , effect     = new THREE.ShaderPass(THREE.DotScreenShader)
     , renderPass = new THREE.RenderPass(scene, camera);

  renderPass.renderToScreen = !useComposer;
  // effect.uniforms['scale'].value = 1.4;
  effect.enabled = useComposer;
  effect.renderToScreen = true;

  composer.clearColor = 0x111111;

  composer.addPass(renderPass);
  composer.addPass(effect);

  //
  // DOM Things
  //

  window.addEventListener( 'resize', onWindowResize, false );

  var useComposerElement  = document.querySelector('input[name="composer"]')
    , selectShader        = document.querySelector('select[name="shader"]');

  selectShader.querySelector('option[value="' + selectedShader + '"]').selected = true;

  useComposerElement.checked = useComposer;

  useComposerElement.addEventListener('change', function(e) {
    useComposer = e.target.checked;

    if (useComposer) {
      mesh.material = getMaterial('shaderOff');
    }
    else {
      mesh.material = getMaterial(selectedShader);
    }

    renderPass.renderToScreen = !useComposer;
    effect.enabled = useComposer;
  });

  selectShader.addEventListener('change', function(e) {
    selectedShader = selectShader.selectedOptions[0].value;

    if (materials[selectedShader] && selectedShader != 'shaderOff') {
      var m = getMaterial(selectedShader);

      effect.uniforms = m.uniforms;
      effect.material = m;

      composer.reset();
    }

    if (!useComposer) {
      mesh.material = getMaterial(selectedShader);
    }
  });

  function init() {
    if (navigator.getUserMedia) {
       navigator.getUserMedia (

          // constraints
          {
             video: true,
             audio: false
          },

          // successCallback
          function(localMediaStream) {
            video.setAttribute('autoplay', 'autoplay');
            video.src = window.URL.createObjectURL(localMediaStream);

            htracker = new headtrackr.Tracker({ui : true});
           // htracker = new headtrackr.facetrackr.Tracker({ui : true});
            htracker.init(video, canvasInput);
            htracker.start();
           // htracker.debug(canvasInput);

            window.addEventListener('headtrackingEvent', function (event) {
                console.log(event.x)
                mesh.position.x = -event.x;
            });

            window.addEventListener('facetrackingEvent', function (event) {
                console.log(event.height+'x'+event.width)
                
            });

            video.addEventListener('canplay', function(ev) {
              if (!streaming) {
                height = video.videoHeight / (video.videoWidth / width);

                // Firefox currently has a bug where the height can't be read from
                // the video, so we will make assumptions if this happens.

                if (isNaN(height)) {
                  height = width / (4/3);
                }

                video.setAttribute('width',    width);
                video.setAttribute('height',   height);

                streaming = true;

              //  mesh.geometry = new THREE.BoxGeometry(width, height, height);
               // mesh.geometry = new THREE.SphereGeometry(width, height, height);


                requestAnimationFrame(render);
              }
            }, false);
          },

          // errorCallback
          function(err) {
             console.log("The following error occured: " + err);
          }
       );
    } else {
       console.log("getUserMedia not supported");
    }
  }

  function render() {
    requestAnimationFrame(render);

    if (streaming) {
        texture.needsUpdate = true;
    }

   // if (headtrackr) console.log(headtrackr)

    controls.update();
    composer.render();
  }

  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    //renderer.setSize( window.innerWidth, window.innerHeight );
    composer.setSize( window.innerWidth, window.innerHeight );
  }

  init();
})();

/*
 * Sources:
 *
 * - https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API/Taking_still_photos
 * - https://github.com/mrdoob/three.js/blob/master/examples/webgl_postprocessing.html
 */