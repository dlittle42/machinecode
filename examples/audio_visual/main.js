// soundcloud api
var SC_ID = 'ba47209edc0a4c129a460a936fb4e9f2';
var TRACK_URL = 'https://soundcloud.com/longarms/starpower';
//var TRACK_URL = 'https://soundcloud.com/nicolas-jaar/flashy-flashy';

SC.initialize({
  client_id: SC_ID
});

window.onload = init;

function init() {
  var root = new THREERoot({
    fov: 120,
    alpha: false
  });
  root.renderer.setClearColor(0x000000);//0x0e0609
  root.camera.position.set(0, 560, 0);
  
  var bloomPass = new THREE.BloomPass(4.0, 25, 4, 512);
  var copyPass = new THREE.ShaderPass(THREE.CopyShader);
  
  root.initPostProcessing([
    bloomPass,
    copyPass
  ]);

  // root.controls.autoRotate = true;
  var lightColor = new THREE.Color();

  lightColor.setHSL(0.00, 1.0, 0.5);
  var centerLight = new THREE.PointLight(lightColor, 0, 600, 2);//0xECD078
  root.add(centerLight);

  lightColor.setHSL(0.33, 0.25, 0.5);
  var topLight = new THREE.DirectionalLight(lightColor, 0.5); // 0xD95B43
  topLight.position.set(0, 1, 0);
  root.add(topLight);

  lightColor.setHSL(0.66, 0.25, 0.5);
  var bottomLight = new THREE.DirectionalLight(lightColor, 0.5); //0xC02942
  bottomLight.position.set(0, -1, 0);
  root.add(bottomLight);

  // generate spline
  var pointCount = 32;
  var points = [];
  var radius = 300;
  var x, y, z, pivotDistance;

  for (var i = 0; i < pointCount; i++) {
    var angle = Math.PI * 2 * i / pointCount;
    var r = radius * THREE.Math.randFloat(0.5, 1.0);

    x = Math.cos(angle) * r;
    y = 0;// THREE.Math.randFloat(-64, 64);// * (i % 2 ? 1 : -1)
    z = Math.sin(angle) * r;

    pivotDistance = 1;

    var v = new THREE.Vector4(x, y, z, pivotDistance);
    v._y = THREE.Math.randFloatSpread(256);

    points.push(v);
  }

  var animation = new Animation(points);
  var tween = animation.animate(24.0, {ease: Power0.easeInOut, repeat:-1});

  root.add(animation);

  // audio

  var audioInput = document.getElementById('audioInput');
  audioInput.value = TRACK_URL;
  audioInput.addEventListener('input', function() {
    audioInput.value && (audioInput.value.indexOf('http') == 0) && getTrack(audioInput.value);
  });

  var audioElement = document.getElementById('player');
  audioElement.crossOrigin = 'Anonymous';
  audioElement.loop = true;

  var analyzer = new SpectrumAnalyzer(pointCount, 0.75);
  analyzer.setSource(audioElement);

  var scLink = document.getElementById('sc_link');
  var scImage = document.getElementById('sc_img');

  var scVisible = true;
  var sc = document.getElementById('soundcloud');

  window.addEventListener('keyup', function(e) {
    if (e.keyCode === 88) {
      sc.style.display = (scVisible = !scVisible) ? 'block' : 'none';
    }
  });

  function getTrack(url) {
    SC.get('/resolve', {url: url}).then(function(data) {
      console.log('success?', data);

      if (typeof data.errors === 'undefined') {
        if (data.streamable) {
          audioElement.src = data.stream_url + '?client_id=' + SC_ID;
          scLink.href = data.permalink_url;
          scImage.src = data.artwork_url;
        }
        else {
          alert('This SoundCloud URL is not allowed to be streamed.');
        }
      }
      else {
        alert('SoundCloud error :(');
      }
    });
  }
  getTrack(TRACK_URL);

  // VISUALISER UPDATE LOOP

  root.addUpdateCallback(function() {
    analyzer.updateSample();

    var spline = animation.material.uniforms['uPath'].value;
    var data = analyzer.frequencyByteData;

    var avg = analyzer.getAverageFloat();
    var avgLL = analyzer.getAverageFloat(0, 8);
    var avgML = analyzer.getAverageFloat(8, 16);
    var avgMH = analyzer.getAverageFloat(16, 24);
    var avgHH = analyzer.getAverageFloat(24, 32);

    animation.material.uniforms.roughness.value =     mapEase(Power2.easeInOut, avgLL, 0.0, 1.0, 0/5, 1.0);
    animation.material.uniforms.metalness.value =     mapEase(Power2.easeInOut, avgML, 0.0, 1.0, 0.0, 0.5);
    animation.material.uniforms.uGlobalPivot.value =  mapEase(Power4.easeOut, avgHH, 0.0, 1.0, 2.0, 0.125);

    centerLight.intensity = mapEase(Power2.easeIn, avg, 0.0, 1.0, 0.5, 1.0);
    topLight.intensity = mapEase(Power2.easeIn, avg, 0.0, 1.0, 0.0, 4.0);
    bottomLight.intensity = mapEase(Power2.easeIn, avg, 0.0, 1.0, 0.0, 4.0);

    tween.timeScale(avg);

    var maxY = mapEase(Power2.easeOut, avgLL, 0.0, 1.0, 0, 100);
    var maxW = mapEase(Power4.easeIn, avgHH, 0.0, 1.0, 100, 600);

    for (var i = 0; i < spline.length; i++) {
      var p = spline[i];

      p.y = p._y + data[i] / 255 * maxY * (i % 2 ? 1 : -1);
      p.w = data[i] / 255 * maxW + 20;
    }

    animation.rotation.x += 0.01 * avgLL;
    animation.rotation.y += 0.01 * avgML;
    animation.rotation.z += 0.01 * avgMH;

    centerLight.color.offsetHSL(0.001, 0, 0);
    topLight.color.offsetHSL(0.001, 0, 0);
    bottomLight.color.offsetHSL(0.001, 0, 0);
  });
}

////////////////////
// CLASSES
////////////////////

function Animation(path) {
  var prefabGeometry = new THREE.PlaneGeometry(4, 1.0, 1, 8);
  var prefabCount = 10000;
  var geometry = new THREE.BAS.PrefabBufferGeometry(prefabGeometry, prefabCount);

  // ANIMATION

  var totalDuration = this.totalDuration = 1.0;

  var aDelayDuration = geometry.createAttribute('aDelayDuration', 2);
  var offset = 0;

  for (var i = 0; i < prefabCount; i++) {
    var pDelay = mapEase(Circ.easeOut, i, 0, prefabCount, 0, totalDuration);

    for (var j = 0; j < geometry.prefabVertexCount; j++) {
      var vDelay = j * 0.00025 * THREE.Math.randFloat(0.75, 1.25);

      aDelayDuration.array[offset++] =  (pDelay + vDelay);
      aDelayDuration.array[offset++] =  totalDuration;
    }
  }

  // PIVOT

  geometry.createAttribute('aPivotRotation', 2, function(data) {
    data[0] = Math.random();// * 0.5 + 0.5;
    data[1] = Math.PI * 2 * THREE.Math.randInt(16, 32);
  });

  // COLOR

  var color = new THREE.Color();

  geometry.createAttribute('color', 3, function(data, i, count) {
    var l = Math.random();
    color.setRGB(l, l, l);
    color.toArray(data);
  });

  // STANDARD PROPS

  geometry.createAttribute('aRM', 2, function(data, i, count) {
    data[0] = Math.random(); // roughness
    data[1] = Math.random(); // metalness
  });

  var material = new THREE.BAS.StandardAnimationMaterial({
    shading: THREE.FlatShading,
    vertexColors: THREE.VertexColors,
    side: THREE.DoubleSide,
    //transparent: true,
    defines: {
      PATH_LENGTH: path.length,
      PATH_MAX: (path.length).toFixed(1)
    },
    uniforms: {
      uTime: {value: 0},
      uPath: {value: path},
      uSmoothness: {value: new THREE.Vector2().setScalar(1.5)},
      uGlobalPivot: {value: 0},
    },
    uniformValues: {
      emissive: new THREE.Color(0x000000),//0x542437,0x0e0609
      roughness: 0,
      metalness: 0
    },
    vertexFunctions: [
      THREE.BAS.ShaderChunk['catmull_rom_spline'],
      THREE.BAS.ShaderChunk['quaternion_rotation']
    ],
    vertexParameters: [
      'uniform float uTime;',
      'uniform vec4 uPath[PATH_LENGTH];',
      'uniform vec2 uSmoothness;',
      'uniform float uGlobalPivot;',

      'attribute vec2 aDelayDuration;',
      'attribute vec2 aPivotRotation;',
      'attribute vec2 aRM;'
    ],
    varyingParameters: [
      'varying vec2 vRM;'
    ],
    vertexInit: [
      'float tProgress = mod((uTime + aDelayDuration.x), aDelayDuration.y) / aDelayDuration.y;',

      'vRM = aRM;'
    ],
    vertexPosition: [
      'float pathProgress = tProgress * PATH_MAX;',
      'float pathProgressFract = fract(pathProgress);',

      'ivec4 indices = getCatmullRomSplineIndicesClosed(PATH_MAX, pathProgress);',
      'vec4 p0 = uPath[indices[0]];',
      'vec4 p1 = uPath[indices[1]];',
      'vec4 p2 = uPath[indices[2]];',
      'vec4 p3 = uPath[indices[3]];',

      'vec3 tDelta = catmullRomSpline(p0.xyz, p1.xyz, p2.xyz, p3.xyz, pathProgressFract, uSmoothness);',
      'vec4 tQuat = quatFromAxisAngle(normalize(tDelta), aPivotRotation.y * tProgress);',

      'transformed += catmullRomSpline(p0.w, p1.w, p2.w, p3.w, pathProgressFract) * aPivotRotation.x * uGlobalPivot;',
      'transformed = rotateVector(tQuat, transformed);',
      'transformed += tDelta;'
    ],
    fragmentRoughness: [
      'roughnessFactor = roughness * vRM.x;'
    ],
    fragmentMetalness: [
      'metalnessFactor = metalness * vRM.y;'
    ]
  });

  THREE.Mesh.call(this, geometry, material);

  this.frustumCulled = false;
}
Animation.prototype = Object.create(THREE.Mesh.prototype);
Animation.prototype.constructor = Animation;
Object.defineProperty(Animation.prototype, 'time', {
  get: function () {
    return this.material.uniforms['uTime'].value;
  },
  set: function (v) {
    this.material.uniforms['uTime'].value = v;
  }
});
Animation.prototype.animate = function (duration, options) {
  options = options || {};
  options.time = this.totalDuration;

  return TweenMax.fromTo(this, duration, {time: 0.0}, options);
};

function SpectrumAnalyzer(binCount, smoothingTimeConstant) {
  var Context = window["AudioContext"] || window["webkitAudioContext"];

  this.context = new Context();
  this.analyzerNode = this.context.createAnalyser();

  this.setBinCount(binCount);
  this.setSmoothingTimeConstant(smoothingTimeConstant);
}

SpectrumAnalyzer.prototype = {
  setSource: function (source) {
    this.source = this.context.createMediaElementSource(source);
    this.source.connect(this.analyzerNode);
    this.analyzerNode.connect(this.context.destination);
  },

  setBinCount: function (binCount) {
    this.binCount = binCount;
    this.analyzerNode.fftSize = binCount * 2;

    this.frequencyByteData = new Uint8Array(binCount); 	// frequency
    this.timeByteData = new Uint8Array(binCount);		// waveform
  },
  setSmoothingTimeConstant: function (smoothingTimeConstant) {
    this.analyzerNode.smoothingTimeConstant = smoothingTimeConstant;
  },
  // not save if out of bounds
  getAverage: function (start, end) {
    var total = 0;

    start = start || 0;
    end = end || this.binCount;

    for (var i = start; i < end; i++) {
      total += this.frequencyByteData[i];
    }

    return total / (end - start);
  },
  getAverageFloat:function(start, end) {
    return this.getAverage(start, end) / 255;
  },

  updateSample: function () {
    this.analyzerNode.getByteFrequencyData(this.frequencyByteData);
    this.analyzerNode.getByteTimeDomainData(this.timeByteData);
  }
};

// utils
function ease(e, t, b, c, d) {
  return b + e.getRatio(t / d) * c;
}

function mapEase(e, v, x1, y1, x2, y2) {
  var t = v;
  var b = x2;
  var c = y2 - x2;
  var d = y1 - x1;

  return ease(e, t, b, c, d);
}
