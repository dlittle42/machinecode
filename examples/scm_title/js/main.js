var THREEx = THREEx || {};
THREEx.RendererStats = function() {
    var a = document.createElement("div");
    a.style.cssText = "width:80px;opacity:0.9;cursor:pointer";
    var b = document.createElement("div");
    b.style.cssText = "padding:0 0 3px 3px;text-align:left;background-color:#200;", a.appendChild(b);
    for (var c = [], d = 9, e = 0; d > e; e++) c[e] = document.createElement("div"), 0 === e ? c[e].style.cssText = "color:#311;background-color:#f00;font-family:Helvetica,Arial,sans-serif;font-size:9px;font-weight:bold;line-height:15px" : c[e].style.cssText = "color:#f00;background-color:#311;font-family:Helvetica,Arial,sans-serif;font-size:9px;font-weight:bold;line-height:15px", b.appendChild(c[e]), c[e].innerHTML = "";
    var f = Date.now();
    return {
        domElement: a,
        update: function(a) {
            if (console.assert(a instanceof THREE.WebGLRenderer), !(Date.now() - f < 1e3 / 30)) {
                f = Date.now();
                var b = 0;
                c[b++].textContent = "Draw calls: " + a.info.render.calls, c[b++].textContent = "Programs: " + a.info.programs.length, c[b++].textContent = "Geometries: " + a.info.memory.geometries, c[b++].textContent = "Textures: " + a.info.memory.textures, c[b++].textContent = "Vertices: " + a.info.render.vertices, c[b++].textContent = "Faces: " + a.info.render.faces, c[b++].textContent = "Points: " + a.info.render.points
            }
        }
    }
};
var AABB = 0,
    SPHERE = 1,
    ACCELERATOR = 2,
    sqrt = Math.sqrt,
    pow = Math.pow,
    min = Math.min,
    max = Math.max,
    pi = Math.PI,
    tau = 2 * pi,
    body_ids = 0,
    extend = function(a, b) {
        var c = {};
        for (var d in a) c[d] = a[d];
        for (var d in b) c[d] = b[d];
        return c
    },
    Class = function(a) {
        var b = a.__init__ || function() {};
        if (a.__extends__) var c = a.__extends__.prototype;
        else var c = {};
        return b.prototype = extend(c, a), b
    },
    Events = Class({
        __init__: function(a) {
            this.listeners = {}, this.obj = a, this.has_listeners = !1
        },
        on: function(a, b) {
            this.has_listeners = !0;
            var c = this.listeners[a] = this.listeners[a] || [];
            return c.push(b), this
        },
        trigger: function(a) {
            if (this.has_listeners) {
                var b = this.listeners[a];
                if (b) {
                    var c = b.length;
                    if (c) {
                        for (var d, e = this.obj, f = 0; d = b[f++];) d.apply(e, arguments);
                        return this
                    }
                }
            }
        }
    }),
    clamp = function(a, b, c) {
        return a > c ? a : c > b ? b : c
    },
    Accelerator = Class({
        type: ACCELERATOR,
        remove: function() {
            this.to_remove = !0
        }
    }),
    handleContact = function(a, b, c, d, e, f, g) {
        var h = a.x - a.px,
            i = a.y - a.py,
            j = a.z - a.pz,
            k = b.x - b.px,
            l = b.y - b.py,
            m = b.z - b.pz,
            n = a.inv_mass + b.inv_mass,
            o = a.inv_mass / n,
            p = b.inv_mass / n,
            q = c * o,
            r = c * p;
        if (a.x += d * q, a.y += e * q, a.z += f * q, b.x -= d * r, b.y -= e * r, b.z -= f * r, g) {
            var s = h - k,
                t = i - l,
                u = j - m,
                v = s * d + t * e + u * f,
                w = v / n,
                x = -(1 + b.restitution) * w * a.inv_mass,
                y = -(1 + a.restitution) * w * b.inv_mass;
            h += x * d, i += x * e, j += x * f, k -= y * d, l -= y * e, m -= y * f, a.setVelocity(h, i, j), b.setVelocity(k, l, m)
        }
    },
    by_left = function(a, b) {
        return a.left - b.left
    },
    Body = Class({
        init: function(a) {
            var b = extend({
                hardness: 1,
                restitution: 1,
                x: 0,
                y: 0,
                z: 0,
                density: 1
            }, a);
            this.id = body_ids++, this.events = new Events(this), this.restitution = b.restitution, this.hardness = b.hardness, this.density = b.density, 0 == b.mass || 0 == this.dynamic ? (this.mass = 0, this.inv_mass = 0) : (this.mass = b.mass || this.computeMass(), this.inv_mass = 1 / this.mass), this.ax = 0, this.ay = 0, this.az = 0, this.x = b.x, this.y = b.y, this.z = b.z, this.px = this.x, this.py = this.y, this.pz = this.z
        },
        onContact: function(a) {
            this.world.onContact(this, a), a.events.trigger("contact", this), this.events.trigger("contact", a)
        },
        remove: function() {
            this.to_remove = !0
        },
        computeMass: function() {
            return this.density
        },
        setVelocity: function(a, b, c) {
            this.px = this.x - a, this.py = this.y - b, this.pz = this.z - c
        },
        getVelocity: function() {
            return [this.x - this.px, this.y - this.py, this.z - this.pz]
        },
        setPosition: function(a, b, c) {
            var d = this.getVelocity();
            this.x = a, this.y = b, this.z = c, this.setVelocity(d[0], d[1], d[2])
        },
        getPosition: function() {
            var a = this.world.u;
            return [this.px + (this.x - this.px) * a, this.py + (this.y - this.py) * a, this.pz + (this.z - this.pz) * a]
        },
        separatingVelocity: function(a) {
            var b = this,
                c = a,
                d = b.x - c.x,
                e = b.y - c.y,
                f = b.z - c.z,
                g = sqrt(d * d + e * e + f * f),
                h = d / g,
                i = e / g,
                j = f / g,
                k = b.getVelocity(),
                l = c.getVelocity(),
                m = k[0] - l[0],
                n = k[1] - l[1],
                o = k[2] - l[2],
                p = m * h + n * i + o * j,
                q = m * p,
                r = n * p,
                s = o * p,
                t = sqrt(q * q + r * r + s * s);
            return t
        },
        collide: function(a, b) {
            switch (a.type) {
                case AABB:
                    this.collideAABB(a, b);
                    break;
                case SPHERE:
                    this.collideSphere(a, b)
            }
        },
        collideAABB: function() {},
        collideSphere: function() {},
        momentum: function() {
            if (this.dynamic) {
                var a = this.x,
                    b = this.y,
                    c = this.z,
                    d = 2 * a - this.px,
                    e = 2 * b - this.py,
                    f = 2 * c - this.pz;
                this.px = a, this.py = b, this.pz = c, this.x = d, this.y = e, this.z = f
            }
        },
        applyAcceleration: function(a) {
            this.dynamic && (this.x += this.ax * a, this.y += this.ay * a, this.z += this.az * a, this.ax = 0, this.ay = 0, this.az = 0)
        },
        accelerate: function(a, b, c) {
            this.dynamic && (this.ax += a, this.ay += b, this.az += c)
        }
    });
vphy = {
        types: {
            AABB: AABB,
            SPHERE: SPHERE,
            ACCELERATOR: ACCELERATOR
        },
        extend: extend,
        Class: Class,
        Accelerator: Accelerator,
        World: Class({
            __init__: function() {
                this.u = 0, this.bodies = [], this.accelerators = [], this.managed = [this.bodies, this.accelerators], this.events = new Events(this)
            },
            add: function() {
                for (var a = 0; a < arguments.length; a++) {
                    var b = arguments[a];
                    b.world = this, b.type == ACCELERATOR ? this.accelerators.push(b) : this.bodies.push(b)
                }
                return this
            },
            remove: function(a) {
                for (var b = 0; b < arguments.length; b++) {
                    var a = arguments[b];
                    a.remove()
                }
            },
            onContact: function(a, b) {
                this.events.trigger("contact", a, b)
            },
            momentum: function() {
                for (var a, b = 0, c = this.bodies; a = c[b++];) a.momentum()
            },
            applyAcceleration: function(a) {
                for (var b, c = a * a, d = 0, e = this.bodies; b = e[d++];) b.applyAcceleration(c)
            },
            collide: function(a) {
                this.updateBoundingVolumes();
                var b = this.bodies;
                b.sort(by_left);
                for (var c = b.length, d = 0; c - 1 > d; d++)
                    for (var e = b[d], f = d + 1; c > f; f++) {
                        var g = b[f];
                        if (e.dynamic || g.dynamic) {
                            if (!(e.right > g.left)) break;
                            e.back < g.front && e.front > g.back && e.bottom < g.top && e.top > g.bottom && e.collide(g, a)
                        }
                    }
            },
            getCollection: function() {
                var a = [];
                return this.managed.push(a), a
            },
            cleanupCollection: function(a) {
                for (var b = 0; b < a.length; b++) a[b].to_remove && (a.splice(b, 1), b--)
            },
            cleanup: function() {
                for (var a = this.managed, b = a.length, c = 0; b > c; c++) this.cleanupCollection(a[c])
            },
            updateBoundingVolumes: function() {
                for (var a, b = this.bodies, c = 0; a = b[c++];) a.updateBoundingVolume()
            },
            onestep: function(a) {
                this.time += a, this.accelerate(a), this.applyAcceleration(a), this.collide(!1), this.momentum(), this.collide(!0), this.cleanup()
            },
            step: function(a, b) {
                for (b - this.time > .25 && (this.time = b - .25); this.time < b;) this.onestep(a);
                var c = this.time - b;
                c > 0 ? this.u = (a - c) / a : this.u = 1
            },
            start: function(a) {
                this.time = a
            },
            accelerate: function(a) {
                for (var b, c = this.bodies, d = this.accelerators, e = 0; b = d[e++];) b.perform(c, a)
            }
        }),
        LinearAccelerator: Class({
            __extends__: Accelerator,
            __init__: function(a) {
                this.x = a.x, this.y = a.y, this.z = a.z
            },
            perform: function(a) {
                for (var b, c = this.x, d = this.y, e = this.z, f = 0; b = a[f++];) b.accelerate(c, d, e)
            }
        }),
        AABB: Class({
            type: AABB,
            dynamic: !1,
            __extends__: Body,
            __init__: function(a) {
                var b = extend({
                    width: 1,
                    height: 1,
                    depth: 1
                }, a);
                this.width = b.width, this.height = b.height, this.depth = b.depth, this.init(b)
            },
            updateBoundingVolume: function() {
                var a = this.x,
                    b = this.y,
                    c = this.z,
                    d = this.width / 2,
                    e = this.height / 2,
                    f = this.depth / 2;
                return this.left = a - d, this.right = a + d, this.top = b + e, this.bottom = b - e, this.front = c + f, this.back = c - f, this
            },
            collideSphere: function(a, b) {
                var c = clamp(this.left, this.right, a.x),
                    d = clamp(this.bottom, this.top, a.y),
                    e = clamp(this.back, this.front, a.z),
                    f = c - a.x,
                    g = d - a.y,
                    h = e - a.z,
                    i = f * f + g * g + h * h;
                if (0 == i) var f = this.z - a.x,
                    g = this.y - a.y,
                    h = this.z - a.z,
                    i = f * f + g * g + h * h;
                if (0 != i) {
                    var j = a.radius;
                    if (j * j > i) {
                        var k = sqrt(i),
                            l = f / k,
                            m = g / k,
                            n = h / k;
                        handleContact(this, a, j - k, l, m, n, b), this.onContact(a)
                    }
                }
            }
        }),
        Sphere: Class({
            type: SPHERE,
            dynamic: !0,
            __extends__: Body,
            __init__: function(a) {
                var b = extend({
                    radius: 1
                }, a);
                this.radius = b.radius, this.init(b)
            },
            computeMass: function() {
                return 4 / 3 * pi * pow(this.radius, 3) * this.density
            },
            collideAABB: function(a, b) {
                a.collideSphere(this, b)
            },
            updateBoundingVolume: function() {
                var a = this.x,
                    b = this.y,
                    c = this.z,
                    d = this.radius;
                return this.left = a - d, this.right = a + d, this.top = b + d, this.bottom = b - d, this.front = c + d, this.back = c - d, this
            },
            collideSphere: function(a, b) {
                var c = this,
                    d = c.x - a.x,
                    e = c.y - a.y,
                    f = c.z - a.z,
                    g = d * d + e * e + f * f,
                    h = c.radius + a.radius;
                if (h * h > g) {
                    var i = sqrt(g),
                        j = d / i,
                        k = e / i,
                        l = f / i;
                    handleContact(c, a, h - i, j, k, l, b), c.onContact(a)
                }
            }
        })
    };


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
        //this.ssao = new THREE.ShaderPass(THREE.SSAO), 
        /*
        this.ssao = new THREE.ShaderPass(THREE.SSAOShader), 


      //  this.ssao.uniforms.tDepth.value = this.depthRenderTarget.texture, 
         this.ssao.uniforms[ "tDepth" ].value = this.depthRenderTarget.texture,
       
       // this.ssao.uniforms.cameraNear.value = Settings.camera.near, 
        this.ssao.uniforms['cameraNear'].value = Settings.camera.near, 
       // this.ssao.uniforms.cameraFar.value = Settings.camera.far, 
        this.ssao.uniforms['cameraFar'].value = Settings.camera.far, 
        this.composer.addPass(this.ssao), 
        this.overlay = new THREE.ShaderPass(THREE.Overlay), 
        this.overlay.renderToScreen = !0, this.composer.addPass(this.overlay)), 
        */
        window.addEventListener("focus", this.__start, !1), 
        window.addEventListener("blur", this.__stop, !1), 
        window.addEventListener("resize", this.__resize, !1), this.init(), this.__resize()
    },
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