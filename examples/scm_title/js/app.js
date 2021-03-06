var App, MutualAttractor, Settings, SkyDomeLitSphere, SphereMaterial, Threejs, color, me, bind = function(a, b) {
        return function() {
            return a.apply(b, arguments)
        }
    },
    extend = function(a, b) {
        function c() {
            this.constructor = a
        }
        for (var d in b) hasProp.call(b, d) && (a[d] = b[d]);
        return c.prototype = b.prototype, a.prototype = new c, a.__super__ = b.prototype, a
    },
    hasProp = {}.hasOwnProperty;
Settings = {}, Settings.WIDTH = 100, Settings.HEIGHT = 100, Settings.DEPTH = 100, Settings.camera = {
    fov: 50,
    near: 1,
    far: 1e3
}, Settings.renderer = {
    antialias: !1,
    alpha: !1
}, Settings.physics = {
    step: 1 / 180,
    force_step: 250,
    attraction: !0
}, Settings.spheres = {
    count: 80,
    detail: 2
}, Settings.postProcessing = !0, color = 12124214, Settings.NUMBER = 0, Settings.COLOR = 1, Settings.BOOLEAN = 2, Settings.GUI = {
    Stats: {
        stats: {
            type: Settings.BOOLEAN,
            value: !1
        }
    },
    Spheres: {
        size: {
            type: Settings.NUMBER,
            value: 5,
            min: 2,
            max: 8
        },
        color: {
            type: Settings.COLOR,
            value: color
        }
    },
    SkyDome: {
        color: {
            type: Settings.COLOR,
            value: color
        }
    },
    Physics: {
        debug: {
            type: Settings.BOOLEAN,
            value: !1
        },
        attraction: {
            type: Settings.NUMBER,
            value: 15,
            min: 0,
            max: 100
        }
    },
    Noise: {
        amount: {
            type: Settings.NUMBER,
            value: .046,
            min: 0,
            max: .3
        },
        speed: {
            type: Settings.NUMBER,
            value: 0,
            min: 0,
            max: 10
        }
    },
    SSAO: {
        debug: {
            type: Settings.BOOLEAN,
            value: !1
        },
        clamp: {
            type: Settings.NUMBER,
            value: .52,
            min: 0,
            max: 1
        },
        influence: {
            type: Settings.NUMBER,
            value: 3.9,
            min: 0,
            max: 6
        }
    }
}, Threejs = function() {
    function a() {
        this.updateRenderer = bind(this.updateRenderer, this), this.updateCamera = bind(this.updateCamera, this), this.__resize = bind(this.__resize, this), this.__stop = bind(this.__stop, this), this.__start = bind(this.__start, this);
        var a;
        this.clock = new THREE.Clock, this.scene = new THREE.Scene, this.camera = new THREE.PerspectiveCamera(Settings.camera.fov, this.WIDTH / this.HEIGHT, Settings.camera.near, Settings.camera.far), this.camera.position.set(0, 0, Settings.DEPTH), this.camera.lookAt(this.scene.position), this.renderer = new THREE.WebGLRenderer({
            antialias: Settings.renderer.antialias,
            alpha: Settings.renderer.alpha
        }), this.renderer.setPixelRatio(this.RATIO), this.renderer.setSize(this.WIDTH, this.HEIGHT), document.body.appendChild(this.renderer.domElement), this.controls = new THREE.TrackballControls(this.camera, this.renderer.domElement), this.controls.rotateSpeed = 1, this.controls.zoomSpeed = 1, this.controls.noZoom = !1, this.controls.noPan = !0, this.controls.staticMoving = !1, this.controls.dynamicDampingFactor = .15, this.controls.minDistance = Settings.DEPTH / 1.5, this.controls.maxDistance = 1.9 * Settings.DEPTH, Settings.postProcessing && (this.depthMaterial = new THREE.MeshDepthMaterial, this.depthMaterial.depthPacking = THREE.RGBADepthPacking, this.depthMaterial.blending = THREE.NoBlending, a = {
            minFilter: THREE.LinearFilter,
            magFilter: THREE.LinearFilter
        }, this.depthRenderTarget = new THREE.WebGLRenderTarget(this.WIDTH, this.HEIGHT, a), 
        this.composer = new THREE.EffectComposer(this.renderer, this.renderTarget), 
        this.composer.addPass(new THREE.RenderPass(this.scene, this.camera)), 
        this.ssao = new THREE.ShaderPass(THREE.SSAO), 
        this.ssao.uniforms.tDepth.value = this.depthRenderTarget.texture, 
        this.ssao.uniforms.cameraNear.value = Settings.camera.near, 
        this.ssao.uniforms.cameraFar.value = Settings.camera.far, 
        this.composer.addPass(this.ssao), 
        this.overlay = new THREE.ShaderPass(THREE.Overlay), 
        this.overlay.renderToScreen = !0, this.composer.addPass(this.overlay)), 
        window.addEventListener("focus", this.__start, !1), 
        window.addEventListener("blur", this.__stop, !1), 
        window.addEventListener("resize", this.__resize, !1), this.init(), this.__resize()
    }
    return a.prototype.WIDTH = 400, a.prototype.HEIGHT = 300, a.prototype.RATIO = window.devicePixelRatio, a.prototype.__start = function(a) {
        return a.preventDefault(), this.start(), null
    }, a.prototype.__stop = function(a) {
        return a.preventDefault(), this.stop(), null
    }, a.prototype.__resize = function(a) {
        return this.WIDTH = window.innerWidth, this.HEIGHT = window.innerHeight, this.updateRenderer(), this.updateCamera(), this.controls.handleResize(), this.resize(), null
    }, a.prototype.start = function() {
        return null
    }, a.prototype.stop = function() {
        return null
    }, a.prototype.resize = function() {
        return null
    }, a.prototype.updateCamera = function() {
        return this.camera.fov = Settings.camera.fov, this.camera.near = Settings.camera.near, this.camera.far = Settings.camera.far, this.camera.projectionMatrix.makePerspective(Settings.camera.fov, this.WIDTH / this.HEIGHT, Settings.camera.near, Settings.camera.far), null
    }, a.prototype.updateRenderer = function() {
        return this.renderer.setSize(this.WIDTH, this.HEIGHT), Settings.postProcessing && (this.ssao.uniforms.size.value.set(this.WIDTH * this.RATIO, this.HEIGHT * this.RATIO), this.depthRenderTarget.setSize(this.WIDTH * this.RATIO, this.HEIGHT * this.RATIO), this.composer.setSize(this.WIDTH * this.RATIO, this.HEIGHT * this.RATIO)), null
    }, a.prototype.update = function() {
        return Settings.postProcessing ? (this.scene.overrideMaterial = this.depthMaterial, this.renderer.render(this.scene, this.camera, this.depthRenderTarget, !0), this.scene.overrideMaterial = null, this.composer.render(), this.overlay.uniforms.time.value = this.clock.getElapsedTime()) : this.renderer.render(this.scene, this.camera), this.controls.update(this.clock.getDelta()), null
    }, a
}(), SkyDomeLitSphere = function() {
    function a() {}
    return a.uniforms = {
        color: {
            type: "3f",
            value: [0, 0, 0]
        }
    }, a.vertex = ["varying vec3 v_normal;", "void main() {", "    v_normal = normalMatrix * vec3(normal);", "    gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);", "}"].join("\n"), a.fragment = ["uniform vec3 color;", "varying vec3 v_normal;", "void main() {", "    vec3 base = vec3(0.35 + max(0.0, dot(v_normal, vec3(0.0, 0.0, -2.5))) * 0.4);", "    gl_FragColor = vec4(base, 1.0) * vec4(color, 1.0);", "}"].join("\n"), a
}(), SphereMaterial = function() {
    function a() {}
    return a.uniforms = {
        color: {
            type: "3f",
            value: [0, 0, 0]
        }
    }, a.vertex = ["varying vec3 v_normal;", "void main() {", "    v_normal = normalMatrix * vec3(normal);", "    gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4( position, 1.0 );", "}"].join("\n"), a.fragment = ["uniform sampler2D map;", "uniform vec3 color;", "varying vec3 v_normal;", "void main() {", "    vec3 base = vec3(0.0);", "    base += vec3(0.35 + max(0.0, dot(v_normal, vec3(1.0, 0.2, .5))) * 0.9);", "    base += vec3(0.35 + max(0.0, dot(v_normal, vec3(-1.0, -0.2, 0.5))) * 0.9);", "    gl_FragColor = vec4(base, 1.0) * vec4(color, 1.0);", "}"].join("\n"), a
}(), MutualAttractor = function() {
    function a(a) {
        this.world = a, this.attractor = {
            type: vphy.types.ACCELERATOR,
            perform: function(a) {
                var b, c, d, e, f, g, h, i, j, k, l, m, n, o, p;
                for (j = Settings.GUI.Physics.attraction.value, i = a.length, f = 0; i - 1 > f;) {
                    for (b = a[f], g = f + 1; i > g;) c = a[g], k = b.x - c.x, m = b.y - c.y, o = b.z - c.z, h = Math.sqrt(k * k + m * m + o * o), l = k / h, n = m / h, p = o / h, d = c.mass * j / (h * h), e = b.mass * j / (h * h), b.accelerate(-l * d, -n * d, -p * d), c.accelerate(l * e, n * e, p * e), g++;
                    f++
                }
                return null
            },
            remove: function() {
                return this.to_remove = !0, null
            }
        }, this.world.add(this.attractor)
    }
    return a.prototype.destroy = function() {
        return this.world.remove(this.attractor), this.attractor = null, null
    }, a
}(), App = function(a) {
    function b() {
        this.applyGuiChanges = bind(this.applyGuiChanges, this), this.onUp = bind(this.onUp, this), this.onDown = bind(this.onDown, this), this.update = bind(this.update, this), this.render = bind(this.render, this), b.__super__.constructor.call(this)
    }
    return extend(b, a), b.prototype.start = function() {
        return this.raf = requestAnimationFrame(this.render), null
    }, b.prototype.stop = function() {
        return cancelAnimationFrame(this.raf), this.update(), null
    }, b.prototype.resize = function() {
        return this.update(), null
    }, b.prototype.render = function() {
        return this.raf = requestAnimationFrame(this.render), this.update(), null
    }, b.prototype.update = function() {
        var a, c, d, e, f, g, h, i, j;
        for (b.__super__.update.call(this), d = Date.now() / 1e3, this.world.step(Settings.physics.step, d), h = 0, i = 0, j = 0, g = this.bodies.length, a = c = 0, f = g; f >= 0 ? f > c : c > f; a = f >= 0 ? ++c : --c) e = this.bodies[a].userData.getPosition(), (e[0] > Settings.WIDTH / 2 || e[0] < -Settings.WIDTH / 2 || e[1] > Settings.HEIGHT / 2 || e[1] < -Settings.HEIGHT / 2 || e[2] > Settings.DEPTH / 2 || e[2] < -Settings.DEPTH / 2) && (this.bodies[a].userData.setVelocity(0, 0, 0), this.bodies[a].userData.setPosition(Math.random(), Math.random(), Math.random())), h += e[0], i += e[1], j += e[2], this.bodies[a].position.set(e[0], e[1], e[2]);
        return h /= g, i /= g, j /= g, this.target.set(h, i, j), this.axis && this.axis.position.copy(this.target), this.camera.lookAt(this.target), this.rendererStats.update(this.renderer), this.stats.update(), null
    }, b.prototype.init = function() {
        return this.bodies = [], 
        this.target = new THREE.Vector3(0, 0, 0), 
        this.initPhysics(), 
        this.initDebug(), 
        this.build(), 
        this.start(), 
        this.renderer.domElement.addEventListener("mousedown", this.onDown, !1), 
        this.renderer.domElement.addEventListener("mouseup", this.onUp, !1), this.renderer.domElement.addEventListener("touchstart", this.onDown, !1), this.renderer.domElement.addEventListener("touchend", this.onUp, !1), null
    }, b.prototype.onDown = function() {
        return this.lastKnownAttraction = Number(Settings.GUI.Physics.attraction.value) || 10, Settings.GUI.Physics.attraction.value = 0, null
    }, b.prototype.onUp = function() {
        return Settings.GUI.Physics.attraction.value = this.lastKnownAttraction, null
    }, b.prototype.initDebug = function() {
        var a, b, c, d, e;
        this.stats = new Stats, 
        this.stats.domElement.style.position = "absolute", 
        this.stats.domElement.style.top = 0, 
        this.stats.domElement.style.left = 0, 
        this.stats.domElement.style.zIndex = 1e4, 
        this.rendererStats = new THREEx.RendererStats, 
        this.rendererStats.domElement.style.position = "absolute", 
        this.rendererStats.domElement.style.left = 0, 
        this.rendererStats.domElement.style.top = "48px", this.rendererStats.domElement.style.zIndex = 1e4, this.statsAdded = !1, b = new dat.GUI({
            autoPlace: !1
        }), b.close();
        for (c in Settings.GUI) {
            a = b.addFolder(c);
            for (e in Settings.GUI[c]) switch (d = Settings.GUI[c][e], d.type) {
                case Settings.NUMBER:
                    a.add(d, "value", d.min, d.max).name(e).listen().onChange(this.applyGuiChanges);
                    break;
                case Settings.COLOR:
                    a.addColor(d, "value").name(e).onChange(this.applyGuiChanges);
                    break;
                case Settings.BOOLEAN:
                    a.add(d, "value").name(e).onChange(this.applyGuiChanges)
            }
        }
        return null
    }, b.prototype.applyGuiChanges = function() {
        var a, b, c;
        for (Settings.GUI.Stats.stats.value ? this.statsAdded === !1 && (this.statsAdded = !0, document.body.appendChild(this.stats.domElement), document.body.appendChild(this.rendererStats.domElement)) : this.statsAdded === !0 && (this.statsAdded = !1, document.body.removeChild(this.stats.domElement), document.body.removeChild(this.rendererStats.domElement)), this.skydomeMesh.material.uniforms.color.value = new THREE.Color(Settings.GUI.SkyDome.color.value), a = b = 0, c = this.bodies.length; c >= 0 ? c > b : b > c; a = c >= 0 ? ++b : --b) this.bodies[a].scale.set(Settings.GUI.Spheres.size.value * this.bodies[a].userData.scale, Settings.GUI.Spheres.size.value * this.bodies[a].userData.scale, Settings.GUI.Spheres.size.value * this.bodies[a].userData.scale), this.bodies[a].userData.radius = Settings.GUI.Spheres.size.value * this.bodies[a].userData.scale, this.bodies[a].material.uniforms.color.value = new THREE.Color(Settings.GUI.Spheres.color.value);
        return Settings.GUI.Physics.debug.value ? (void 0 !== this.bbox && (this.scene.remove(this.bbox), this.bbox = null), this.bbox = new THREE.BoundingBoxHelper(new THREE.Mesh(new THREE.BoxGeometry(Settings.WIDTH, Settings.HEIGHT, Settings.DEPTH)), 16777215), this.bbox.update(), this.scene.add(this.bbox), void 0 !== this.axis && (this.scene.remove(this.axis), this.axis = null), this.axis = new THREE.AxisHelper(30), this.axis.material.vertexColors = THREE.NoColors, this.scene.add(this.axis)) : (void 0 !== this.bbox && (this.scene.remove(this.bbox), this.bbox = null), void 0 !== this.axis && (this.scene.remove(this.axis), this.axis = null)), this.ssao.uniforms.onlyAO.value = Settings.GUI.SSAO.debug.value, this.ssao.uniforms.aoClamp.value = Settings.GUI.SSAO.clamp.value, this.ssao.uniforms.lumInfluence.value = Settings.GUI.SSAO.influence.value, this.overlay.uniforms.amount.value = Settings.GUI.Noise.amount.value * window.devicePixelRatio, this.overlay.uniforms.speed.value = Settings.GUI.Noise.speed.value, null
    }, b.prototype.initPhysics = function() {
        var a;
        return this.world = new vphy.World, this.world.start(Date.now() / 1e3), a = new MutualAttractor(this.world), null
    }, b.prototype.build = function() {
        return this.addSkydome(), this.addWalls(), this.addSpheres(), this.applyGuiChanges(), null
    }, b.prototype.addSkydome = function() {
        var a, b;
        return a = new THREE.IcosahedronGeometry(2 * Settings.DEPTH, 1), b = new THREE.ShaderMaterial({
            uniforms: SkyDomeLitSphere.uniforms,
            vertexShader: SkyDomeLitSphere.vertex,
            fragmentShader: SkyDomeLitSphere.fragment,
            side: THREE.BackSide
        }), this.skydomeMesh = new THREE.Mesh(a, b), this.scene.add(this.skydomeMesh), null
    }, b.prototype.addWalls = function() {
        return this.addBounds(0, -Settings.HEIGHT / 2, 0, Settings.WIDTH, 1, Settings.DEPTH), this.addBounds(0, 0, -Settings.DEPTH / 2, Settings.WIDTH, Settings.HEIGHT, 1), this.addBounds(0, Settings.HEIGHT / 2, 0, Settings.WIDTH, 1, Settings.DEPTH), this.addBounds(-Settings.WIDTH / 2, 0, 0, 1, Settings.HEIGHT, Settings.DEPTH), this.addBounds(Settings.WIDTH / 2, 0, 0, 1, Settings.HEIGHT, Settings.DEPTH), this.addBounds(0, 0, Settings.DEPTH / 2, Settings.WIDTH, Settings.HEIGHT, 1), null
    }, b.prototype.addSpheres = function() {
        var a, b, c, d, e, f, g, h, i, j, k;
        for (this.bodies = [], d = Settings.WIDTH / 2, c = Settings.WIDTH / 2, b = Settings.DEPTH / 2, e = f = 0, j = Settings.spheres.count; j >= 0 ? j > f : f > j; e = j >= 0 ? ++f : --f) k = .5 + .5 * Math.random(), i = new vphy.Sphere({
            x: Math.random() * d - d / 2,
            y: Math.random() * c - c / 2,
            z: Math.random() * b - b / 2,
            restitution: .9,
            radius: Settings.GUI.Spheres.size.value * k
        }), i.scale = k, this.world.add(i), a = new THREE.IcosahedronGeometry(1, Settings.spheres.detail), g = new THREE.ShaderMaterial({
            uniforms: SphereMaterial.uniforms,
            vertexShader: SphereMaterial.vertex,
            fragmentShader: SphereMaterial.fragment
        }), h = new THREE.Mesh(a, g), h.scale.set(Settings.GUI.Spheres.size.value * k, Settings.GUI.Spheres.size.value * k, Settings.GUI.Spheres.size.value * k), h.userData = i, this.scene.add(h), this.bodies.push(h);
        return null
    }, b.prototype.addBounds = function(a, b, c, d, e, f) {
        var g;
        return g = new vphy.AABB({
            x: a,
            y: b,
            z: c,
            width: d,
            height: e,
            depth: f,
            restitution: .3
        }), this.world.add(g), null
    }, b
}(Threejs), (me = function() {
    return window.app = new App, null
})();