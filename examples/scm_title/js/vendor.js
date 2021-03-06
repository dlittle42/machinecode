"use strict";

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
    }),
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
    },
    THREE = {
        REVISION: "79"
    };
"function" == typeof define && define.amd ? define("three", THREE) : "undefined" != typeof exports && "undefined" != typeof module && (module.exports = THREE), void 0 === Number.EPSILON && (Number.EPSILON = Math.pow(2, -52)), void 0 === Math.sign && (Math.sign = function(a) {
        return 0 > a ? -1 : a > 0 ? 1 : +a
    }), void 0 === Function.prototype.name && Object.defineProperty(Function.prototype, "name", {
        get: function() {
            return this.toString().match(/^\s*function\s*(\S*)\s*\(/)[1]
        }
    }), void 0 === Object.assign && function() {
        Object.assign = function(a) {
            if (void 0 === a || null === a) throw new TypeError("Cannot convert undefined or null to object");
            for (var b = Object(a), c = 1; c < arguments.length; c++) {
                var d = arguments[c];
                if (void 0 !== d && null !== d)
                    for (var e in d) Object.prototype.hasOwnProperty.call(d, e) && (b[e] = d[e])
            }
            return b
        }
    }(), Object.assign(THREE, {
        MOUSE: {
            LEFT: 0,
            MIDDLE: 1,
            RIGHT: 2
        },
        CullFaceNone: 0,
        CullFaceBack: 1,
        CullFaceFront: 2,
        CullFaceFrontBack: 3,
        FrontFaceDirectionCW: 0,
        FrontFaceDirectionCCW: 1,
        BasicShadowMap: 0,
        PCFShadowMap: 1,
        PCFSoftShadowMap: 2,
        FrontSide: 0,
        BackSide: 1,
        DoubleSide: 2,
        FlatShading: 1,
        SmoothShading: 2,
        NoColors: 0,
        FaceColors: 1,
        VertexColors: 2,
        NoBlending: 0,
        NormalBlending: 1,
        AdditiveBlending: 2,
        SubtractiveBlending: 3,
        MultiplyBlending: 4,
        CustomBlending: 5,
        AddEquation: 100,
        SubtractEquation: 101,
        ReverseSubtractEquation: 102,
        MinEquation: 103,
        MaxEquation: 104,
        ZeroFactor: 200,
        OneFactor: 201,
        SrcColorFactor: 202,
        OneMinusSrcColorFactor: 203,
        SrcAlphaFactor: 204,
        OneMinusSrcAlphaFactor: 205,
        DstAlphaFactor: 206,
        OneMinusDstAlphaFactor: 207,
        DstColorFactor: 208,
        OneMinusDstColorFactor: 209,
        SrcAlphaSaturateFactor: 210,
        NeverDepth: 0,
        AlwaysDepth: 1,
        LessDepth: 2,
        LessEqualDepth: 3,
        EqualDepth: 4,
        GreaterEqualDepth: 5,
        GreaterDepth: 6,
        NotEqualDepth: 7,
        MultiplyOperation: 0,
        MixOperation: 1,
        AddOperation: 2,
        NoToneMapping: 0,
        LinearToneMapping: 1,
        ReinhardToneMapping: 2,
        Uncharted2ToneMapping: 3,
        CineonToneMapping: 4,
        UVMapping: 300,
        CubeReflectionMapping: 301,
        CubeRefractionMapping: 302,
        EquirectangularReflectionMapping: 303,
        EquirectangularRefractionMapping: 304,
        SphericalReflectionMapping: 305,
        CubeUVReflectionMapping: 306,
        CubeUVRefractionMapping: 307,
        RepeatWrapping: 1e3,
        ClampToEdgeWrapping: 1001,
        MirroredRepeatWrapping: 1002,
        NearestFilter: 1003,
        NearestMipMapNearestFilter: 1004,
        NearestMipMapLinearFilter: 1005,
        LinearFilter: 1006,
        LinearMipMapNearestFilter: 1007,
        LinearMipMapLinearFilter: 1008,
        UnsignedByteType: 1009,
        ByteType: 1010,
        ShortType: 1011,
        UnsignedShortType: 1012,
        IntType: 1013,
        UnsignedIntType: 1014,
        FloatType: 1015,
        HalfFloatType: 1025,
        UnsignedShort4444Type: 1016,
        UnsignedShort5551Type: 1017,
        UnsignedShort565Type: 1018,
        AlphaFormat: 1019,
        RGBFormat: 1020,
        RGBAFormat: 1021,
        LuminanceFormat: 1022,
        LuminanceAlphaFormat: 1023,
        RGBEFormat: THREE.RGBAFormat,
        DepthFormat: 1026,
        RGB_S3TC_DXT1_Format: 2001,
        RGBA_S3TC_DXT1_Format: 2002,
        RGBA_S3TC_DXT3_Format: 2003,
        RGBA_S3TC_DXT5_Format: 2004,
        RGB_PVRTC_4BPPV1_Format: 2100,
        RGB_PVRTC_2BPPV1_Format: 2101,
        RGBA_PVRTC_4BPPV1_Format: 2102,
        RGBA_PVRTC_2BPPV1_Format: 2103,
        RGB_ETC1_Format: 2151,
        LoopOnce: 2200,
        LoopRepeat: 2201,
        LoopPingPong: 2202,
        InterpolateDiscrete: 2300,
        InterpolateLinear: 2301,
        InterpolateSmooth: 2302,
        ZeroCurvatureEnding: 2400,
        ZeroSlopeEnding: 2401,
        WrapAroundEnding: 2402,
        TrianglesDrawMode: 0,
        TriangleStripDrawMode: 1,
        TriangleFanDrawMode: 2,
        LinearEncoding: 3e3,
        sRGBEncoding: 3001,
        GammaEncoding: 3007,
        RGBEEncoding: 3002,
        LogLuvEncoding: 3003,
        RGBM7Encoding: 3004,
        RGBM16Encoding: 3005,
        RGBDEncoding: 3006,
        BasicDepthPacking: 3200,
        RGBADepthPacking: 3201
    }), THREE.Color = function(a, b, c) {
        return void 0 === b && void 0 === c ? this.set(a) : this.setRGB(a, b, c)
    }, THREE.Color.prototype = {
        constructor: THREE.Color,
        r: 1,
        g: 1,
        b: 1,
        set: function(a) {
            return a instanceof THREE.Color ? this.copy(a) : "number" == typeof a ? this.setHex(a) : "string" == typeof a && this.setStyle(a), this
        },
        setScalar: function(a) {
            this.b = this.g = this.r = a
        },
        setHex: function(a) {
            return a = Math.floor(a), this.r = (a >> 16 & 255) / 255, this.g = (a >> 8 & 255) / 255, this.b = (255 & a) / 255, this
        },
        setRGB: function(a, b, c) {
            return this.r = a, this.g = b, this.b = c, this
        },
        setHSL: function() {
            function a(a, b, c) {
                return 0 > c && (c += 1), c > 1 && (c -= 1), 1 / 6 > c ? a + 6 * (b - a) * c : .5 > c ? b : 2 / 3 > c ? a + 6 * (b - a) * (2 / 3 - c) : a
            }
            return function(b, c, d) {
                return b = THREE.Math.euclideanModulo(b, 1), c = THREE.Math.clamp(c, 0, 1), d = THREE.Math.clamp(d, 0, 1), 0 === c ? this.r = this.g = this.b = d : (c = .5 >= d ? d * (1 + c) : d + c - d * c, d = 2 * d - c, this.r = a(d, c, b + 1 / 3), this.g = a(d, c, b), this.b = a(d, c, b - 1 / 3)), this
            }
        }(),
        setStyle: function(a) {
            function b(b) {
                void 0 !== b && 1 > parseFloat(b) && console.warn("THREE.Color: Alpha component of " + a + " will be ignored.")
            }
            var c;
            if (c = /^((?:rgb|hsl)a?)\(\s*([^\)]*)\)/.exec(a)) {
                var d = c[2];
                switch (c[1]) {
                    case "rgb":
                    case "rgba":
                        if (c = /^(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(,\s*([0-9]*\.?[0-9]+)\s*)?$/.exec(d)) return this.r = Math.min(255, parseInt(c[1], 10)) / 255, this.g = Math.min(255, parseInt(c[2], 10)) / 255, this.b = Math.min(255, parseInt(c[3], 10)) / 255, b(c[5]), this;
                        if (c = /^(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(,\s*([0-9]*\.?[0-9]+)\s*)?$/.exec(d)) return this.r = Math.min(100, parseInt(c[1], 10)) / 100, this.g = Math.min(100, parseInt(c[2], 10)) / 100, this.b = Math.min(100, parseInt(c[3], 10)) / 100, b(c[5]), this;
                        break;
                    case "hsl":
                    case "hsla":
                        if (c = /^([0-9]*\.?[0-9]+)\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(,\s*([0-9]*\.?[0-9]+)\s*)?$/.exec(d)) {
                            var d = parseFloat(c[1]) / 360,
                                e = parseInt(c[2], 10) / 100,
                                f = parseInt(c[3], 10) / 100;
                            return b(c[5]), this.setHSL(d, e, f)
                        }
                }
            } else if (c = /^\#([A-Fa-f0-9]+)$/.exec(a)) {
                if (c = c[1], d = c.length, 3 === d) return this.r = parseInt(c.charAt(0) + c.charAt(0), 16) / 255, this.g = parseInt(c.charAt(1) + c.charAt(1), 16) / 255, this.b = parseInt(c.charAt(2) + c.charAt(2), 16) / 255, this;
                if (6 === d) return this.r = parseInt(c.charAt(0) + c.charAt(1), 16) / 255, this.g = parseInt(c.charAt(2) + c.charAt(3), 16) / 255, this.b = parseInt(c.charAt(4) + c.charAt(5), 16) / 255, this
            }
            return a && 0 < a.length && (c = THREE.ColorKeywords[a], void 0 !== c ? this.setHex(c) : console.warn("THREE.Color: Unknown color " + a)), this
        },
        clone: function() {
            return new this.constructor(this.r, this.g, this.b)
        },
        copy: function(a) {
            return this.r = a.r, this.g = a.g, this.b = a.b, this
        },
        copyGammaToLinear: function(a, b) {
            return void 0 === b && (b = 2), this.r = Math.pow(a.r, b), this.g = Math.pow(a.g, b), this.b = Math.pow(a.b, b), this
        },
        copyLinearToGamma: function(a, b) {
            void 0 === b && (b = 2);
            var c = b > 0 ? 1 / b : 1;
            return this.r = Math.pow(a.r, c), this.g = Math.pow(a.g, c), this.b = Math.pow(a.b, c), this
        },
        convertGammaToLinear: function() {
            var a = this.r,
                b = this.g,
                c = this.b;
            return this.r = a * a, this.g = b * b, this.b = c * c, this
        },
        convertLinearToGamma: function() {
            return this.r = Math.sqrt(this.r), this.g = Math.sqrt(this.g), this.b = Math.sqrt(this.b), this
        },
        getHex: function() {
            return 255 * this.r << 16 ^ 255 * this.g << 8 ^ 255 * this.b << 0
        },
        getHexString: function() {
            return ("000000" + this.getHex().toString(16)).slice(-6)
        },
        getHSL: function(a) {
            a = a || {
                h: 0,
                s: 0,
                l: 0
            };
            var b, c = this.r,
                d = this.g,
                e = this.b,
                f = Math.max(c, d, e),
                g = Math.min(c, d, e),
                h = (g + f) / 2;
            if (g === f) g = b = 0;
            else {
                var i = f - g,
                    g = .5 >= h ? i / (f + g) : i / (2 - f - g);
                switch (f) {
                    case c:
                        b = (d - e) / i + (e > d ? 6 : 0);
                        break;
                    case d:
                        b = (e - c) / i + 2;
                        break;
                    case e:
                        b = (c - d) / i + 4
                }
                b /= 6
            }
            return a.h = b, a.s = g, a.l = h, a
        },
        getStyle: function() {
            return "rgb(" + (255 * this.r | 0) + "," + (255 * this.g | 0) + "," + (255 * this.b | 0) + ")"
        },
        offsetHSL: function(a, b, c) {
            var d = this.getHSL();
            return d.h += a, d.s += b, d.l += c, this.setHSL(d.h, d.s, d.l), this
        },
        add: function(a) {
            return this.r += a.r, this.g += a.g, this.b += a.b, this
        },
        addColors: function(a, b) {
            return this.r = a.r + b.r, this.g = a.g + b.g, this.b = a.b + b.b, this
        },
        addScalar: function(a) {
            return this.r += a, this.g += a, this.b += a, this
        },
        sub: function(a) {
            return this.r = Math.max(0, this.r - a.r), this.g = Math.max(0, this.g - a.g), this.b = Math.max(0, this.b - a.b), this
        },
        multiply: function(a) {
            return this.r *= a.r, this.g *= a.g, this.b *= a.b, this
        },
        multiplyScalar: function(a) {
            return this.r *= a, this.g *= a, this.b *= a, this
        },
        lerp: function(a, b) {
            return this.r += (a.r - this.r) * b, this.g += (a.g - this.g) * b, this.b += (a.b - this.b) * b, this
        },
        equals: function(a) {
            return a.r === this.r && a.g === this.g && a.b === this.b
        },
        fromArray: function(a, b) {
            return void 0 === b && (b = 0), this.r = a[b], this.g = a[b + 1], this.b = a[b + 2], this
        },
        toArray: function(a, b) {
            return void 0 === a && (a = []), void 0 === b && (b = 0), a[b] = this.r, a[b + 1] = this.g, a[b + 2] = this.b, a
        }
    }, THREE.ColorKeywords = {
        aliceblue: 15792383,
        antiquewhite: 16444375,
        aqua: 65535,
        aquamarine: 8388564,
        azure: 15794175,
        beige: 16119260,
        bisque: 16770244,
        black: 0,
        blanchedalmond: 16772045,
        blue: 255,
        blueviolet: 9055202,
        brown: 10824234,
        burlywood: 14596231,
        cadetblue: 6266528,
        chartreuse: 8388352,
        chocolate: 13789470,
        coral: 16744272,
        cornflowerblue: 6591981,
        cornsilk: 16775388,
        crimson: 14423100,
        cyan: 65535,
        darkblue: 139,
        darkcyan: 35723,
        darkgoldenrod: 12092939,
        darkgray: 11119017,
        darkgreen: 25600,
        darkgrey: 11119017,
        darkkhaki: 12433259,
        darkmagenta: 9109643,
        darkolivegreen: 5597999,
        darkorange: 16747520,
        darkorchid: 10040012,
        darkred: 9109504,
        darksalmon: 15308410,
        darkseagreen: 9419919,
        darkslateblue: 4734347,
        darkslategray: 3100495,
        darkslategrey: 3100495,
        darkturquoise: 52945,
        darkviolet: 9699539,
        deeppink: 16716947,
        deepskyblue: 49151,
        dimgray: 6908265,
        dimgrey: 6908265,
        dodgerblue: 2003199,
        firebrick: 11674146,
        floralwhite: 16775920,
        forestgreen: 2263842,
        fuchsia: 16711935,
        gainsboro: 14474460,
        ghostwhite: 16316671,
        gold: 16766720,
        goldenrod: 14329120,
        gray: 8421504,
        green: 32768,
        greenyellow: 11403055,
        grey: 8421504,
        honeydew: 15794160,
        hotpink: 16738740,
        indianred: 13458524,
        indigo: 4915330,
        ivory: 16777200,
        khaki: 15787660,
        lavender: 15132410,
        lavenderblush: 16773365,
        lawngreen: 8190976,
        lemonchiffon: 16775885,
        lightblue: 11393254,
        lightcoral: 15761536,
        lightcyan: 14745599,
        lightgoldenrodyellow: 16448210,
        lightgray: 13882323,
        lightgreen: 9498256,
        lightgrey: 13882323,
        lightpink: 16758465,
        lightsalmon: 16752762,
        lightseagreen: 2142890,
        lightskyblue: 8900346,
        lightslategray: 7833753,
        lightslategrey: 7833753,
        lightsteelblue: 11584734,
        lightyellow: 16777184,
        lime: 65280,
        limegreen: 3329330,
        linen: 16445670,
        magenta: 16711935,
        maroon: 8388608,
        mediumaquamarine: 6737322,
        mediumblue: 205,
        mediumorchid: 12211667,
        mediumpurple: 9662683,
        mediumseagreen: 3978097,
        mediumslateblue: 8087790,
        mediumspringgreen: 64154,
        mediumturquoise: 4772300,
        mediumvioletred: 13047173,
        midnightblue: 1644912,
        mintcream: 16121850,
        mistyrose: 16770273,
        moccasin: 16770229,
        navajowhite: 16768685,
        navy: 128,
        oldlace: 16643558,
        olive: 8421376,
        olivedrab: 7048739,
        orange: 16753920,
        orangered: 16729344,
        orchid: 14315734,
        palegoldenrod: 15657130,
        palegreen: 10025880,
        paleturquoise: 11529966,
        palevioletred: 14381203,
        papayawhip: 16773077,
        peachpuff: 16767673,
        peru: 13468991,
        pink: 16761035,
        plum: 14524637,
        powderblue: 11591910,
        purple: 8388736,
        red: 16711680,
        rosybrown: 12357519,
        royalblue: 4286945,
        saddlebrown: 9127187,
        salmon: 16416882,
        sandybrown: 16032864,
        seagreen: 3050327,
        seashell: 16774638,
        sienna: 10506797,
        silver: 12632256,
        skyblue: 8900331,
        slateblue: 6970061,
        slategray: 7372944,
        slategrey: 7372944,
        snow: 16775930,
        springgreen: 65407,
        steelblue: 4620980,
        tan: 13808780,
        teal: 32896,
        thistle: 14204888,
        tomato: 16737095,
        turquoise: 4251856,
        violet: 15631086,
        wheat: 16113331,
        white: 16777215,
        whitesmoke: 16119285,
        yellow: 16776960,
        yellowgreen: 10145074
    }, THREE.Quaternion = function(a, b, c, d) {
        this._x = a || 0, this._y = b || 0, this._z = c || 0, this._w = void 0 !== d ? d : 1
    }, THREE.Quaternion.prototype = {
        constructor: THREE.Quaternion,
        get x() {
            return this._x
        },
        set x(a) {
            this._x = a, this.onChangeCallback()
        },
        get y() {
            return this._y
        },
        set y(a) {
            this._y = a, this.onChangeCallback();
        },
        get z() {
            return this._z
        },
        set z(a) {
            this._z = a, this.onChangeCallback()
        },
        get w() {
            return this._w
        },
        set w(a) {
            this._w = a, this.onChangeCallback()
        },
        set: function(a, b, c, d) {
            return this._x = a, this._y = b, this._z = c, this._w = d, this.onChangeCallback(), this
        },
        clone: function() {
            return new this.constructor(this._x, this._y, this._z, this._w)
        },
        copy: function(a) {
            return this._x = a.x, this._y = a.y, this._z = a.z, this._w = a.w, this.onChangeCallback(), this
        },
        setFromEuler: function(a, b) {
            if (!1 == a instanceof THREE.Euler) throw Error("THREE.Quaternion: .setFromEuler() now expects a Euler rotation rather than a Vector3 and order.");
            var c = Math.cos(a._x / 2),
                d = Math.cos(a._y / 2),
                e = Math.cos(a._z / 2),
                f = Math.sin(a._x / 2),
                g = Math.sin(a._y / 2),
                h = Math.sin(a._z / 2),
                i = a.order;
            return "XYZ" === i ? (this._x = f * d * e + c * g * h, this._y = c * g * e - f * d * h, this._z = c * d * h + f * g * e, this._w = c * d * e - f * g * h) : "YXZ" === i ? (this._x = f * d * e + c * g * h, this._y = c * g * e - f * d * h, this._z = c * d * h - f * g * e, this._w = c * d * e + f * g * h) : "ZXY" === i ? (this._x = f * d * e - c * g * h, this._y = c * g * e + f * d * h, this._z = c * d * h + f * g * e, this._w = c * d * e - f * g * h) : "ZYX" === i ? (this._x = f * d * e - c * g * h, this._y = c * g * e + f * d * h, this._z = c * d * h - f * g * e, this._w = c * d * e + f * g * h) : "YZX" === i ? (this._x = f * d * e + c * g * h, this._y = c * g * e + f * d * h, this._z = c * d * h - f * g * e, this._w = c * d * e - f * g * h) : "XZY" === i && (this._x = f * d * e - c * g * h, this._y = c * g * e - f * d * h, this._z = c * d * h + f * g * e, this._w = c * d * e + f * g * h), !1 !== b && this.onChangeCallback(), this
        },
        setFromAxisAngle: function(a, b) {
            var c = b / 2,
                d = Math.sin(c);
            return this._x = a.x * d, this._y = a.y * d, this._z = a.z * d, this._w = Math.cos(c), this.onChangeCallback(), this
        },
        setFromRotationMatrix: function(a) {
            var b = a.elements,
                c = b[0];
            a = b[4];
            var d = b[8],
                e = b[1],
                f = b[5],
                g = b[9],
                h = b[2],
                i = b[6],
                b = b[10],
                j = c + f + b;
            return j > 0 ? (c = .5 / Math.sqrt(j + 1), this._w = .25 / c, this._x = (i - g) * c, this._y = (d - h) * c, this._z = (e - a) * c) : c > f && c > b ? (c = 2 * Math.sqrt(1 + c - f - b), this._w = (i - g) / c, this._x = .25 * c, this._y = (a + e) / c, this._z = (d + h) / c) : f > b ? (c = 2 * Math.sqrt(1 + f - c - b), this._w = (d - h) / c, this._x = (a + e) / c, this._y = .25 * c, this._z = (g + i) / c) : (c = 2 * Math.sqrt(1 + b - c - f), this._w = (e - a) / c, this._x = (d + h) / c, this._y = (g + i) / c, this._z = .25 * c), this.onChangeCallback(), this
        },
        setFromUnitVectors: function() {
            var a, b;
            return function(c, d) {
                return void 0 === a && (a = new THREE.Vector3), b = c.dot(d) + 1, 1e-6 > b ? (b = 0, Math.abs(c.x) > Math.abs(c.z) ? a.set(-c.y, c.x, 0) : a.set(0, -c.z, c.y)) : a.crossVectors(c, d), this._x = a.x, this._y = a.y, this._z = a.z, this._w = b, this.normalize()
            }
        }(),
        inverse: function() {
            return this.conjugate().normalize()
        },
        conjugate: function() {
            return this._x *= -1, this._y *= -1, this._z *= -1, this.onChangeCallback(), this
        },
        dot: function(a) {
            return this._x * a._x + this._y * a._y + this._z * a._z + this._w * a._w
        },
        lengthSq: function() {
            return this._x * this._x + this._y * this._y + this._z * this._z + this._w * this._w
        },
        length: function() {
            return Math.sqrt(this._x * this._x + this._y * this._y + this._z * this._z + this._w * this._w)
        },
        normalize: function() {
            var a = this.length();
            return 0 === a ? (this._z = this._y = this._x = 0, this._w = 1) : (a = 1 / a, this._x *= a, this._y *= a, this._z *= a, this._w *= a), this.onChangeCallback(), this
        },
        multiply: function(a, b) {
            return void 0 !== b ? (console.warn("THREE.Quaternion: .multiply() now only accepts one argument. Use .multiplyQuaternions( a, b ) instead."), this.multiplyQuaternions(a, b)) : this.multiplyQuaternions(this, a)
        },
        premultiply: function(a) {
            return this.multiplyQuaternions(a, this)
        },
        multiplyQuaternions: function(a, b) {
            var c = a._x,
                d = a._y,
                e = a._z,
                f = a._w,
                g = b._x,
                h = b._y,
                i = b._z,
                j = b._w;
            return this._x = c * j + f * g + d * i - e * h, this._y = d * j + f * h + e * g - c * i, this._z = e * j + f * i + c * h - d * g, this._w = f * j - c * g - d * h - e * i, this.onChangeCallback(), this
        },
        slerp: function(a, b) {
            if (0 === b) return this;
            if (1 === b) return this.copy(a);
            var c = this._x,
                d = this._y,
                e = this._z,
                f = this._w,
                g = f * a._w + c * a._x + d * a._y + e * a._z;
            if (0 > g ? (this._w = -a._w, this._x = -a._x, this._y = -a._y, this._z = -a._z, g = -g) : this.copy(a), g >= 1) return this._w = f, this._x = c, this._y = d, this._z = e, this;
            var h = Math.sqrt(1 - g * g);
            if (.001 > Math.abs(h)) return this._w = .5 * (f + this._w), this._x = .5 * (c + this._x), this._y = .5 * (d + this._y), this._z = .5 * (e + this._z), this;
            var i = Math.atan2(h, g),
                g = Math.sin((1 - b) * i) / h,
                h = Math.sin(b * i) / h;
            return this._w = f * g + this._w * h, this._x = c * g + this._x * h, this._y = d * g + this._y * h, this._z = e * g + this._z * h, this.onChangeCallback(), this
        },
        equals: function(a) {
            return a._x === this._x && a._y === this._y && a._z === this._z && a._w === this._w
        },
        fromArray: function(a, b) {
            return void 0 === b && (b = 0), this._x = a[b], this._y = a[b + 1], this._z = a[b + 2], this._w = a[b + 3], this.onChangeCallback(), this
        },
        toArray: function(a, b) {
            return void 0 === a && (a = []), void 0 === b && (b = 0), a[b] = this._x, a[b + 1] = this._y, a[b + 2] = this._z, a[b + 3] = this._w, a
        },
        onChange: function(a) {
            return this.onChangeCallback = a, this
        },
        onChangeCallback: function() {}
    }, Object.assign(THREE.Quaternion, {
        slerp: function(a, b, c, d) {
            return c.copy(a).slerp(b, d)
        },
        slerpFlat: function(a, b, c, d, e, f, g) {
            var h = c[d + 0],
                i = c[d + 1],
                j = c[d + 2];
            c = c[d + 3], d = e[f + 0];
            var k = e[f + 1],
                l = e[f + 2];
            if (e = e[f + 3], c !== e || h !== d || i !== k || j !== l) {
                f = 1 - g;
                var m = h * d + i * k + j * l + c * e,
                    n = m >= 0 ? 1 : -1,
                    o = 1 - m * m;
                o > Number.EPSILON && (o = Math.sqrt(o), m = Math.atan2(o, m * n), f = Math.sin(f * m) / o, g = Math.sin(g * m) / o), n *= g, h = h * f + d * n, i = i * f + k * n, j = j * f + l * n, c = c * f + e * n, f === 1 - g && (g = 1 / Math.sqrt(h * h + i * i + j * j + c * c), h *= g, i *= g, j *= g, c *= g)
            }
            a[b] = h, a[b + 1] = i, a[b + 2] = j, a[b + 3] = c
        }
    }), THREE.Vector2 = function(a, b) {
        this.x = a || 0, this.y = b || 0
    }, THREE.Vector2.prototype = {
        constructor: THREE.Vector2,
        get width() {
            return this.x
        },
        set width(a) {
            this.x = a
        },
        get height() {
            return this.y
        },
        set height(a) {
            this.y = a
        },
        set: function(a, b) {
            return this.x = a, this.y = b, this
        },
        setScalar: function(a) {
            return this.y = this.x = a, this
        },
        setX: function(a) {
            return this.x = a, this
        },
        setY: function(a) {
            return this.y = a, this
        },
        setComponent: function(a, b) {
            switch (a) {
                case 0:
                    this.x = b;
                    break;
                case 1:
                    this.y = b;
                    break;
                default:
                    throw Error("index is out of range: " + a)
            }
        },
        getComponent: function(a) {
            switch (a) {
                case 0:
                    return this.x;
                case 1:
                    return this.y;
                default:
                    throw Error("index is out of range: " + a)
            }
        },
        clone: function() {
            return new this.constructor(this.x, this.y)
        },
        copy: function(a) {
            return this.x = a.x, this.y = a.y, this
        },
        add: function(a, b) {
            return void 0 !== b ? (console.warn("THREE.Vector2: .add() now only accepts one argument. Use .addVectors( a, b ) instead."), this.addVectors(a, b)) : (this.x += a.x, this.y += a.y, this)
        },
        addScalar: function(a) {
            return this.x += a, this.y += a, this
        },
        addVectors: function(a, b) {
            return this.x = a.x + b.x, this.y = a.y + b.y, this
        },
        addScaledVector: function(a, b) {
            return this.x += a.x * b, this.y += a.y * b, this
        },
        sub: function(a, b) {
            return void 0 !== b ? (console.warn("THREE.Vector2: .sub() now only accepts one argument. Use .subVectors( a, b ) instead."), this.subVectors(a, b)) : (this.x -= a.x, this.y -= a.y, this)
        },
        subScalar: function(a) {
            return this.x -= a, this.y -= a, this
        },
        subVectors: function(a, b) {
            return this.x = a.x - b.x, this.y = a.y - b.y, this
        },
        multiply: function(a) {
            return this.x *= a.x, this.y *= a.y, this
        },
        multiplyScalar: function(a) {
            return isFinite(a) ? (this.x *= a, this.y *= a) : this.y = this.x = 0, this
        },
        divide: function(a) {
            return this.x /= a.x, this.y /= a.y, this
        },
        divideScalar: function(a) {
            return this.multiplyScalar(1 / a)
        },
        min: function(a) {
            return this.x = Math.min(this.x, a.x), this.y = Math.min(this.y, a.y), this
        },
        max: function(a) {
            return this.x = Math.max(this.x, a.x), this.y = Math.max(this.y, a.y), this
        },
        clamp: function(a, b) {
            return this.x = Math.max(a.x, Math.min(b.x, this.x)), this.y = Math.max(a.y, Math.min(b.y, this.y)), this
        },
        clampScalar: function() {
            var a, b;
            return function(c, d) {
                return void 0 === a && (a = new THREE.Vector2, b = new THREE.Vector2), a.set(c, c), b.set(d, d), this.clamp(a, b)
            }
        }(),
        clampLength: function(a, b) {
            var c = this.length();
            return this.multiplyScalar(Math.max(a, Math.min(b, c)) / c)
        },
        floor: function() {
            return this.x = Math.floor(this.x), this.y = Math.floor(this.y), this
        },
        ceil: function() {
            return this.x = Math.ceil(this.x), this.y = Math.ceil(this.y), this
        },
        round: function() {
            return this.x = Math.round(this.x), this.y = Math.round(this.y), this
        },
        roundToZero: function() {
            return this.x = 0 > this.x ? Math.ceil(this.x) : Math.floor(this.x), this.y = 0 > this.y ? Math.ceil(this.y) : Math.floor(this.y), this
        },
        negate: function() {
            return this.x = -this.x, this.y = -this.y, this
        },
        dot: function(a) {
            return this.x * a.x + this.y * a.y
        },
        lengthSq: function() {
            return this.x * this.x + this.y * this.y
        },
        length: function() {
            return Math.sqrt(this.x * this.x + this.y * this.y)
        },
        lengthManhattan: function() {
            return Math.abs(this.x) + Math.abs(this.y)
        },
        normalize: function() {
            return this.divideScalar(this.length())
        },
        angle: function() {
            var a = Math.atan2(this.y, this.x);
            return 0 > a && (a += 2 * Math.PI), a
        },
        distanceTo: function(a) {
            return Math.sqrt(this.distanceToSquared(a))
        },
        distanceToSquared: function(a) {
            var b = this.x - a.x;
            return a = this.y - a.y, b * b + a * a
        },
        distanceToManhattan: function(a) {
            return Math.abs(this.x - a.x) + Math.abs(this.y - a.y)
        },
        setLength: function(a) {
            return this.multiplyScalar(a / this.length())
        },
        lerp: function(a, b) {
            return this.x += (a.x - this.x) * b, this.y += (a.y - this.y) * b, this
        },
        lerpVectors: function(a, b, c) {
            return this.subVectors(b, a).multiplyScalar(c).add(a)
        },
        equals: function(a) {
            return a.x === this.x && a.y === this.y
        },
        fromArray: function(a, b) {
            return void 0 === b && (b = 0), this.x = a[b], this.y = a[b + 1], this
        },
        toArray: function(a, b) {
            return void 0 === a && (a = []), void 0 === b && (b = 0), a[b] = this.x, a[b + 1] = this.y, a
        },
        fromAttribute: function(a, b, c) {
            return void 0 === c && (c = 0), b = b * a.itemSize + c, this.x = a.array[b], this.y = a.array[b + 1], this
        },
        rotateAround: function(a, b) {
            var c = Math.cos(b),
                d = Math.sin(b),
                e = this.x - a.x,
                f = this.y - a.y;
            return this.x = e * c - f * d + a.x, this.y = e * d + f * c + a.y, this
        }
    }, THREE.Vector3 = function(a, b, c) {
        this.x = a || 0, this.y = b || 0, this.z = c || 0
    }, THREE.Vector3.prototype = {
        constructor: THREE.Vector3,
        set: function(a, b, c) {
            return this.x = a, this.y = b, this.z = c, this
        },
        setScalar: function(a) {
            return this.z = this.y = this.x = a, this
        },
        setX: function(a) {
            return this.x = a, this
        },
        setY: function(a) {
            return this.y = a, this
        },
        setZ: function(a) {
            return this.z = a, this
        },
        setComponent: function(a, b) {
            switch (a) {
                case 0:
                    this.x = b;
                    break;
                case 1:
                    this.y = b;
                    break;
                case 2:
                    this.z = b;
                    break;
                default:
                    throw Error("index is out of range: " + a)
            }
        },
        getComponent: function(a) {
            switch (a) {
                case 0:
                    return this.x;
                case 1:
                    return this.y;
                case 2:
                    return this.z;
                default:
                    throw Error("index is out of range: " + a)
            }
        },
        clone: function() {
            return new this.constructor(this.x, this.y, this.z)
        },
        copy: function(a) {
            return this.x = a.x, this.y = a.y, this.z = a.z, this
        },
        add: function(a, b) {
            return void 0 !== b ? (console.warn("THREE.Vector3: .add() now only accepts one argument. Use .addVectors( a, b ) instead."), this.addVectors(a, b)) : (this.x += a.x, this.y += a.y, this.z += a.z, this)
        },
        addScalar: function(a) {
            return this.x += a, this.y += a, this.z += a, this
        },
        addVectors: function(a, b) {
            return this.x = a.x + b.x, this.y = a.y + b.y, this.z = a.z + b.z, this
        },
        addScaledVector: function(a, b) {
            return this.x += a.x * b, this.y += a.y * b, this.z += a.z * b, this
        },
        sub: function(a, b) {
            return void 0 !== b ? (console.warn("THREE.Vector3: .sub() now only accepts one argument. Use .subVectors( a, b ) instead."), this.subVectors(a, b)) : (this.x -= a.x, this.y -= a.y, this.z -= a.z, this)
        },
        subScalar: function(a) {
            return this.x -= a, this.y -= a, this.z -= a, this
        },
        subVectors: function(a, b) {
            return this.x = a.x - b.x, this.y = a.y - b.y, this.z = a.z - b.z, this
        },
        multiply: function(a, b) {
            return void 0 !== b ? (console.warn("THREE.Vector3: .multiply() now only accepts one argument. Use .multiplyVectors( a, b ) instead."), this.multiplyVectors(a, b)) : (this.x *= a.x, this.y *= a.y, this.z *= a.z, this)
        },
        multiplyScalar: function(a) {
            return isFinite(a) ? (this.x *= a, this.y *= a, this.z *= a) : this.z = this.y = this.x = 0, this
        },
        multiplyVectors: function(a, b) {
            return this.x = a.x * b.x, this.y = a.y * b.y, this.z = a.z * b.z, this
        },
        applyEuler: function() {
            var a;
            return function(b) {
                return !1 == b instanceof THREE.Euler && console.error("THREE.Vector3: .applyEuler() now expects an Euler rotation rather than a Vector3 and order."), void 0 === a && (a = new THREE.Quaternion), this.applyQuaternion(a.setFromEuler(b))
            }
        }(),
        applyAxisAngle: function() {
            var a;
            return function(b, c) {
                return void 0 === a && (a = new THREE.Quaternion), this.applyQuaternion(a.setFromAxisAngle(b, c))
            }
        }(),
        applyMatrix3: function(a) {
            var b = this.x,
                c = this.y,
                d = this.z;
            return a = a.elements, this.x = a[0] * b + a[3] * c + a[6] * d, this.y = a[1] * b + a[4] * c + a[7] * d, this.z = a[2] * b + a[5] * c + a[8] * d, this
        },
        applyMatrix4: function(a) {
            var b = this.x,
                c = this.y,
                d = this.z;
            return a = a.elements, this.x = a[0] * b + a[4] * c + a[8] * d + a[12], this.y = a[1] * b + a[5] * c + a[9] * d + a[13], this.z = a[2] * b + a[6] * c + a[10] * d + a[14], this
        },
        applyProjection: function(a) {
            var b = this.x,
                c = this.y,
                d = this.z;
            a = a.elements;
            var e = 1 / (a[3] * b + a[7] * c + a[11] * d + a[15]);
            return this.x = (a[0] * b + a[4] * c + a[8] * d + a[12]) * e, this.y = (a[1] * b + a[5] * c + a[9] * d + a[13]) * e, this.z = (a[2] * b + a[6] * c + a[10] * d + a[14]) * e, this
        },
        applyQuaternion: function(a) {
            var b = this.x,
                c = this.y,
                d = this.z,
                e = a.x,
                f = a.y,
                g = a.z;
            a = a.w;
            var h = a * b + f * d - g * c,
                i = a * c + g * b - e * d,
                j = a * d + e * c - f * b,
                b = -e * b - f * c - g * d;
            return this.x = h * a + b * -e + i * -g - j * -f, this.y = i * a + b * -f + j * -e - h * -g, this.z = j * a + b * -g + h * -f - i * -e, this
        },
        project: function() {
            var a;
            return function(b) {
                return void 0 === a && (a = new THREE.Matrix4), a.multiplyMatrices(b.projectionMatrix, a.getInverse(b.matrixWorld)), this.applyProjection(a)
            }
        }(),
        unproject: function() {
            var a;
            return function(b) {
                return void 0 === a && (a = new THREE.Matrix4), a.multiplyMatrices(b.matrixWorld, a.getInverse(b.projectionMatrix)), this.applyProjection(a)
            }
        }(),
        transformDirection: function(a) {
            var b = this.x,
                c = this.y,
                d = this.z;
            return a = a.elements, this.x = a[0] * b + a[4] * c + a[8] * d, this.y = a[1] * b + a[5] * c + a[9] * d, this.z = a[2] * b + a[6] * c + a[10] * d, this.normalize()
        },
        divide: function(a) {
            return this.x /= a.x, this.y /= a.y, this.z /= a.z, this
        },
        divideScalar: function(a) {
            return this.multiplyScalar(1 / a)
        },
        min: function(a) {
            return this.x = Math.min(this.x, a.x), this.y = Math.min(this.y, a.y), this.z = Math.min(this.z, a.z), this
        },
        max: function(a) {
            return this.x = Math.max(this.x, a.x), this.y = Math.max(this.y, a.y), this.z = Math.max(this.z, a.z), this
        },
        clamp: function(a, b) {
            return this.x = Math.max(a.x, Math.min(b.x, this.x)), this.y = Math.max(a.y, Math.min(b.y, this.y)), this.z = Math.max(a.z, Math.min(b.z, this.z)), this
        },
        clampScalar: function() {
            var a, b;
            return function(c, d) {
                return void 0 === a && (a = new THREE.Vector3, b = new THREE.Vector3), a.set(c, c, c), b.set(d, d, d), this.clamp(a, b)
            }
        }(),
        clampLength: function(a, b) {
            var c = this.length();
            return this.multiplyScalar(Math.max(a, Math.min(b, c)) / c)
        },
        floor: function() {
            return this.x = Math.floor(this.x), this.y = Math.floor(this.y), this.z = Math.floor(this.z), this
        },
        ceil: function() {
            return this.x = Math.ceil(this.x), this.y = Math.ceil(this.y), this.z = Math.ceil(this.z), this
        },
        round: function() {
            return this.x = Math.round(this.x), this.y = Math.round(this.y), this.z = Math.round(this.z), this
        },
        roundToZero: function() {
            return this.x = 0 > this.x ? Math.ceil(this.x) : Math.floor(this.x), this.y = 0 > this.y ? Math.ceil(this.y) : Math.floor(this.y), this.z = 0 > this.z ? Math.ceil(this.z) : Math.floor(this.z), this
        },
        negate: function() {
            return this.x = -this.x, this.y = -this.y, this.z = -this.z, this
        },
        dot: function(a) {
            return this.x * a.x + this.y * a.y + this.z * a.z
        },
        lengthSq: function() {
            return this.x * this.x + this.y * this.y + this.z * this.z
        },
        length: function() {
            return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z)
        },
        lengthManhattan: function() {
            return Math.abs(this.x) + Math.abs(this.y) + Math.abs(this.z)
        },
        normalize: function() {
            return this.divideScalar(this.length())
        },
        setLength: function(a) {
            return this.multiplyScalar(a / this.length())
        },
        lerp: function(a, b) {
            return this.x += (a.x - this.x) * b, this.y += (a.y - this.y) * b, this.z += (a.z - this.z) * b, this
        },
        lerpVectors: function(a, b, c) {
            return this.subVectors(b, a).multiplyScalar(c).add(a)
        },
        cross: function(a, b) {
            if (void 0 !== b) return console.warn("THREE.Vector3: .cross() now only accepts one argument. Use .crossVectors( a, b ) instead."), this.crossVectors(a, b);
            var c = this.x,
                d = this.y,
                e = this.z;
            return this.x = d * a.z - e * a.y, this.y = e * a.x - c * a.z, this.z = c * a.y - d * a.x, this
        },
        crossVectors: function(a, b) {
            var c = a.x,
                d = a.y,
                e = a.z,
                f = b.x,
                g = b.y,
                h = b.z;
            return this.x = d * h - e * g, this.y = e * f - c * h, this.z = c * g - d * f, this
        },
        projectOnVector: function(a) {
            var b = a.dot(this) / a.lengthSq();
            return this.copy(a).multiplyScalar(b)
        },
        projectOnPlane: function() {
            var a;
            return function(b) {
                return void 0 === a && (a = new THREE.Vector3), a.copy(this).projectOnVector(b), this.sub(a)
            }
        }(),
        reflect: function() {
            var a;
            return function(b) {
                return void 0 === a && (a = new THREE.Vector3), this.sub(a.copy(b).multiplyScalar(2 * this.dot(b)))
            }
        }(),
        angleTo: function(a) {
            return a = this.dot(a) / Math.sqrt(this.lengthSq() * a.lengthSq()), Math.acos(THREE.Math.clamp(a, -1, 1))
        },
        distanceTo: function(a) {
            return Math.sqrt(this.distanceToSquared(a))
        },
        distanceToSquared: function(a) {
            var b = this.x - a.x,
                c = this.y - a.y;
            return a = this.z - a.z, b * b + c * c + a * a
        },
        distanceToManhattan: function(a) {
            return Math.abs(this.x - a.x) + Math.abs(this.y - a.y) + Math.abs(this.z - a.z)
        },
        setFromSpherical: function(a) {
            var b = Math.sin(a.phi) * a.radius;
            return this.x = b * Math.sin(a.theta), this.y = Math.cos(a.phi) * a.radius, this.z = b * Math.cos(a.theta), this
        },
        setFromMatrixPosition: function(a) {
            return this.setFromMatrixColumn(a, 3)
        },
        setFromMatrixScale: function(a) {
            var b = this.setFromMatrixColumn(a, 0).length(),
                c = this.setFromMatrixColumn(a, 1).length();
            return a = this.setFromMatrixColumn(a, 2).length(), this.x = b, this.y = c, this.z = a, this
        },
        setFromMatrixColumn: function(a, b) {
            if ("number" == typeof a) {
                console.warn("THREE.Vector3: setFromMatrixColumn now expects ( matrix, index ).");
                var c = a;
                a = b, b = c
            }
            return this.fromArray(a.elements, 4 * b)
        },
        equals: function(a) {
            return a.x === this.x && a.y === this.y && a.z === this.z
        },
        fromArray: function(a, b) {
            return void 0 === b && (b = 0), this.x = a[b], this.y = a[b + 1], this.z = a[b + 2], this
        },
        toArray: function(a, b) {
            return void 0 === a && (a = []), void 0 === b && (b = 0), a[b] = this.x, a[b + 1] = this.y, a[b + 2] = this.z, a
        },
        fromAttribute: function(a, b, c) {
            return void 0 === c && (c = 0), b = b * a.itemSize + c, this.x = a.array[b], this.y = a.array[b + 1], this.z = a.array[b + 2], this
        }
    }, THREE.Vector4 = function(a, b, c, d) {
        this.x = a || 0, this.y = b || 0, this.z = c || 0, this.w = void 0 !== d ? d : 1
    }, THREE.Vector4.prototype = {
        constructor: THREE.Vector4,
        set: function(a, b, c, d) {
            return this.x = a, this.y = b, this.z = c, this.w = d, this
        },
        setScalar: function(a) {
            return this.w = this.z = this.y = this.x = a, this
        },
        setX: function(a) {
            return this.x = a, this
        },
        setY: function(a) {
            return this.y = a, this
        },
        setZ: function(a) {
            return this.z = a, this
        },
        setW: function(a) {
            return this.w = a, this
        },
        setComponent: function(a, b) {
            switch (a) {
                case 0:
                    this.x = b;
                    break;
                case 1:
                    this.y = b;
                    break;
                case 2:
                    this.z = b;
                    break;
                case 3:
                    this.w = b;
                    break;
                default:
                    throw Error("index is out of range: " + a)
            }
        },
        getComponent: function(a) {
            switch (a) {
                case 0:
                    return this.x;
                case 1:
                    return this.y;
                case 2:
                    return this.z;
                case 3:
                    return this.w;
                default:
                    throw Error("index is out of range: " + a)
            }
        },
        clone: function() {
            return new this.constructor(this.x, this.y, this.z, this.w)
        },
        copy: function(a) {
            return this.x = a.x, this.y = a.y, this.z = a.z, this.w = void 0 !== a.w ? a.w : 1, this
        },
        add: function(a, b) {
            return void 0 !== b ? (console.warn("THREE.Vector4: .add() now only accepts one argument. Use .addVectors( a, b ) instead."), this.addVectors(a, b)) : (this.x += a.x, this.y += a.y, this.z += a.z, this.w += a.w, this)
        },
        addScalar: function(a) {
            return this.x += a, this.y += a, this.z += a, this.w += a, this
        },
        addVectors: function(a, b) {
            return this.x = a.x + b.x, this.y = a.y + b.y, this.z = a.z + b.z, this.w = a.w + b.w, this
        },
        addScaledVector: function(a, b) {
            return this.x += a.x * b, this.y += a.y * b, this.z += a.z * b, this.w += a.w * b, this
        },
        sub: function(a, b) {
            return void 0 !== b ? (console.warn("THREE.Vector4: .sub() now only accepts one argument. Use .subVectors( a, b ) instead."), this.subVectors(a, b)) : (this.x -= a.x, this.y -= a.y, this.z -= a.z, this.w -= a.w, this)
        },
        subScalar: function(a) {
            return this.x -= a, this.y -= a, this.z -= a, this.w -= a, this
        },
        subVectors: function(a, b) {
            return this.x = a.x - b.x, this.y = a.y - b.y, this.z = a.z - b.z, this.w = a.w - b.w, this
        },
        multiplyScalar: function(a) {
            return isFinite(a) ? (this.x *= a, this.y *= a, this.z *= a, this.w *= a) : this.w = this.z = this.y = this.x = 0, this
        },
        applyMatrix4: function(a) {
            var b = this.x,
                c = this.y,
                d = this.z,
                e = this.w;
            return a = a.elements, this.x = a[0] * b + a[4] * c + a[8] * d + a[12] * e, this.y = a[1] * b + a[5] * c + a[9] * d + a[13] * e, this.z = a[2] * b + a[6] * c + a[10] * d + a[14] * e, this.w = a[3] * b + a[7] * c + a[11] * d + a[15] * e, this
        },
        divideScalar: function(a) {
            return this.multiplyScalar(1 / a)
        },
        setAxisAngleFromQuaternion: function(a) {
            this.w = 2 * Math.acos(a.w);
            var b = Math.sqrt(1 - a.w * a.w);
            return 1e-4 > b ? (this.x = 1, this.z = this.y = 0) : (this.x = a.x / b, this.y = a.y / b, this.z = a.z / b), this
        },
        setAxisAngleFromRotationMatrix: function(a) {
            var b, c, d;
            a = a.elements;
            var e = a[0];
            d = a[4];
            var f = a[8],
                g = a[1],
                h = a[5],
                i = a[9];
            c = a[2], b = a[6];
            var j = a[10];
            return .01 > Math.abs(d - g) && .01 > Math.abs(f - c) && .01 > Math.abs(i - b) ? .1 > Math.abs(d + g) && .1 > Math.abs(f + c) && .1 > Math.abs(i + b) && .1 > Math.abs(e + h + j - 3) ? (this.set(1, 0, 0, 0), this) : (a = Math.PI, e = (e + 1) / 2, h = (h + 1) / 2, j = (j + 1) / 2, d = (d + g) / 4, f = (f + c) / 4, i = (i + b) / 4, e > h && e > j ? .01 > e ? (b = 0, d = c = .707106781) : (b = Math.sqrt(e), c = d / b, d = f / b) : h > j ? .01 > h ? (b = .707106781, c = 0, d = .707106781) : (c = Math.sqrt(h), b = d / c, d = i / c) : .01 > j ? (c = b = .707106781, d = 0) : (d = Math.sqrt(j), b = f / d, c = i / d), this.set(b, c, d, a), this) : (a = Math.sqrt((b - i) * (b - i) + (f - c) * (f - c) + (g - d) * (g - d)), .001 > Math.abs(a) && (a = 1), this.x = (b - i) / a, this.y = (f - c) / a, this.z = (g - d) / a, this.w = Math.acos((e + h + j - 1) / 2), this)
        },
        min: function(a) {
            return this.x = Math.min(this.x, a.x), this.y = Math.min(this.y, a.y), this.z = Math.min(this.z, a.z), this.w = Math.min(this.w, a.w), this
        },
        max: function(a) {
            return this.x = Math.max(this.x, a.x), this.y = Math.max(this.y, a.y), this.z = Math.max(this.z, a.z), this.w = Math.max(this.w, a.w), this
        },
        clamp: function(a, b) {
            return this.x = Math.max(a.x, Math.min(b.x, this.x)), this.y = Math.max(a.y, Math.min(b.y, this.y)), this.z = Math.max(a.z, Math.min(b.z, this.z)), this.w = Math.max(a.w, Math.min(b.w, this.w)), this
        },
        clampScalar: function() {
            var a, b;
            return function(c, d) {
                return void 0 === a && (a = new THREE.Vector4, b = new THREE.Vector4), a.set(c, c, c, c), b.set(d, d, d, d), this.clamp(a, b)
            }
        }(),
        floor: function() {
            return this.x = Math.floor(this.x), this.y = Math.floor(this.y), this.z = Math.floor(this.z), this.w = Math.floor(this.w), this
        },
        ceil: function() {
            return this.x = Math.ceil(this.x), this.y = Math.ceil(this.y), this.z = Math.ceil(this.z), this.w = Math.ceil(this.w), this
        },
        round: function() {
            return this.x = Math.round(this.x), this.y = Math.round(this.y), this.z = Math.round(this.z), this.w = Math.round(this.w), this
        },
        roundToZero: function() {
            return this.x = 0 > this.x ? Math.ceil(this.x) : Math.floor(this.x), this.y = 0 > this.y ? Math.ceil(this.y) : Math.floor(this.y), this.z = 0 > this.z ? Math.ceil(this.z) : Math.floor(this.z), this.w = 0 > this.w ? Math.ceil(this.w) : Math.floor(this.w), this
        },
        negate: function() {
            return this.x = -this.x, this.y = -this.y, this.z = -this.z, this.w = -this.w, this
        },
        dot: function(a) {
            return this.x * a.x + this.y * a.y + this.z * a.z + this.w * a.w
        },
        lengthSq: function() {
            return this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w
        },
        length: function() {
            return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w)
        },
        lengthManhattan: function() {
            return Math.abs(this.x) + Math.abs(this.y) + Math.abs(this.z) + Math.abs(this.w)
        },
        normalize: function() {
            return this.divideScalar(this.length())
        },
        setLength: function(a) {
            return this.multiplyScalar(a / this.length())
        },
        lerp: function(a, b) {
            return this.x += (a.x - this.x) * b, this.y += (a.y - this.y) * b, this.z += (a.z - this.z) * b, this.w += (a.w - this.w) * b, this
        },
        lerpVectors: function(a, b, c) {
            return this.subVectors(b, a).multiplyScalar(c).add(a)
        },
        equals: function(a) {
            return a.x === this.x && a.y === this.y && a.z === this.z && a.w === this.w
        },
        fromArray: function(a, b) {
            return void 0 === b && (b = 0), this.x = a[b], this.y = a[b + 1], this.z = a[b + 2], this.w = a[b + 3], this
        },
        toArray: function(a, b) {
            return void 0 === a && (a = []), void 0 === b && (b = 0), a[b] = this.x, a[b + 1] = this.y, a[b + 2] = this.z, a[b + 3] = this.w, a
        },
        fromAttribute: function(a, b, c) {
            return void 0 === c && (c = 0), b = b * a.itemSize + c, this.x = a.array[b], this.y = a.array[b + 1], this.z = a.array[b + 2], this.w = a.array[b + 3], this
        }
    }, THREE.Euler = function(a, b, c, d) {
        this._x = a || 0, this._y = b || 0, this._z = c || 0, this._order = d || THREE.Euler.DefaultOrder
    }, THREE.Euler.RotationOrders = "XYZ YZX ZXY XZY YXZ ZYX".split(" "), THREE.Euler.DefaultOrder = "XYZ", THREE.Euler.prototype = {
        constructor: THREE.Euler,
        get x() {
            return this._x
        },
        set x(a) {
            this._x = a, this.onChangeCallback()
        },
        get y() {
            return this._y
        },
        set y(a) {
            this._y = a, this.onChangeCallback()
        },
        get z() {
            return this._z
        },
        set z(a) {
            this._z = a, this.onChangeCallback()
        },
        get order() {
            return this._order
        },
        set order(a) {
            this._order = a, this.onChangeCallback()
        },
        set: function(a, b, c, d) {
            return this._x = a, this._y = b, this._z = c, this._order = d || this._order, this.onChangeCallback(), this
        },
        clone: function() {
            return new this.constructor(this._x, this._y, this._z, this._order)
        },
        copy: function(a) {
            return this._x = a._x, this._y = a._y, this._z = a._z, this._order = a._order, this.onChangeCallback(), this
        },
        setFromRotationMatrix: function(a, b, c) {
            var d = THREE.Math.clamp,
                e = a.elements;
            a = e[0];
            var f = e[4],
                g = e[8],
                h = e[1],
                i = e[5],
                j = e[9],
                k = e[2],
                l = e[6],
                e = e[10];
            return b = b || this._order, "XYZ" === b ? (this._y = Math.asin(d(g, -1, 1)), .99999 > Math.abs(g) ? (this._x = Math.atan2(-j, e), this._z = Math.atan2(-f, a)) : (this._x = Math.atan2(l, i), this._z = 0)) : "YXZ" === b ? (this._x = Math.asin(-d(j, -1, 1)), .99999 > Math.abs(j) ? (this._y = Math.atan2(g, e), this._z = Math.atan2(h, i)) : (this._y = Math.atan2(-k, a), this._z = 0)) : "ZXY" === b ? (this._x = Math.asin(d(l, -1, 1)), .99999 > Math.abs(l) ? (this._y = Math.atan2(-k, e), this._z = Math.atan2(-f, i)) : (this._y = 0, this._z = Math.atan2(h, a))) : "ZYX" === b ? (this._y = Math.asin(-d(k, -1, 1)), .99999 > Math.abs(k) ? (this._x = Math.atan2(l, e), this._z = Math.atan2(h, a)) : (this._x = 0, this._z = Math.atan2(-f, i))) : "YZX" === b ? (this._z = Math.asin(d(h, -1, 1)), .99999 > Math.abs(h) ? (this._x = Math.atan2(-j, i), this._y = Math.atan2(-k, a)) : (this._x = 0, this._y = Math.atan2(g, e))) : "XZY" === b ? (this._z = Math.asin(-d(f, -1, 1)), .99999 > Math.abs(f) ? (this._x = Math.atan2(l, i), this._y = Math.atan2(g, a)) : (this._x = Math.atan2(-j, e), this._y = 0)) : console.warn("THREE.Euler: .setFromRotationMatrix() given unsupported order: " + b), this._order = b, !1 !== c && this.onChangeCallback(), this
        },
        setFromQuaternion: function() {
            var a;
            return function(b, c, d) {
                return void 0 === a && (a = new THREE.Matrix4), a.makeRotationFromQuaternion(b), this.setFromRotationMatrix(a, c, d)
            }
        }(),
        setFromVector3: function(a, b) {
            return this.set(a.x, a.y, a.z, b || this._order)
        },
        reorder: function() {
            var a = new THREE.Quaternion;
            return function(b) {
                return a.setFromEuler(this), this.setFromQuaternion(a, b)
            }
        }(),
        equals: function(a) {
            return a._x === this._x && a._y === this._y && a._z === this._z && a._order === this._order
        },
        fromArray: function(a) {
            return this._x = a[0], this._y = a[1], this._z = a[2], void 0 !== a[3] && (this._order = a[3]), this.onChangeCallback(), this
        },
        toArray: function(a, b) {
            return void 0 === a && (a = []), void 0 === b && (b = 0), a[b] = this._x, a[b + 1] = this._y, a[b + 2] = this._z, a[b + 3] = this._order, a
        },
        toVector3: function(a) {
            return a ? a.set(this._x, this._y, this._z) : new THREE.Vector3(this._x, this._y, this._z)
        },
        onChange: function(a) {
            return this.onChangeCallback = a, this
        },
        onChangeCallback: function() {}
    }, THREE.Line3 = function(a, b) {
        this.start = void 0 !== a ? a : new THREE.Vector3, this.end = void 0 !== b ? b : new THREE.Vector3
    }, THREE.Line3.prototype = {
        constructor: THREE.Line3,
        set: function(a, b) {
            return this.start.copy(a), this.end.copy(b), this
        },
        clone: function() {
            return (new this.constructor).copy(this)
        },
        copy: function(a) {
            return this.start.copy(a.start), this.end.copy(a.end), this
        },
        center: function(a) {
            return (a || new THREE.Vector3).addVectors(this.start, this.end).multiplyScalar(.5)
        },
        delta: function(a) {
            return (a || new THREE.Vector3).subVectors(this.end, this.start)
        },
        distanceSq: function() {
            return this.start.distanceToSquared(this.end)
        },
        distance: function() {
            return this.start.distanceTo(this.end)
        },
        at: function(a, b) {
            var c = b || new THREE.Vector3;
            return this.delta(c).multiplyScalar(a).add(this.start)
        },
        closestPointToPointParameter: function() {
            var a = new THREE.Vector3,
                b = new THREE.Vector3;
            return function(c, d) {
                a.subVectors(c, this.start), b.subVectors(this.end, this.start);
                var e = b.dot(b),
                    e = b.dot(a) / e;
                return d && (e = THREE.Math.clamp(e, 0, 1)), e
            }
        }(),
        closestPointToPoint: function(a, b, c) {
            return a = this.closestPointToPointParameter(a, b), c = c || new THREE.Vector3, this.delta(c).multiplyScalar(a).add(this.start)
        },
        applyMatrix4: function(a) {
            return this.start.applyMatrix4(a), this.end.applyMatrix4(a), this
        },
        equals: function(a) {
            return a.start.equals(this.start) && a.end.equals(this.end)
        }
    }, THREE.Box2 = function(a, b) {
        this.min = void 0 !== a ? a : new THREE.Vector2(1 / 0, 1 / 0), this.max = void 0 !== b ? b : new THREE.Vector2(-(1 / 0), -(1 / 0))
    }, THREE.Box2.prototype = {
        constructor: THREE.Box2,
        set: function(a, b) {
            return this.min.copy(a), this.max.copy(b), this
        },
        setFromPoints: function(a) {
            this.makeEmpty();
            for (var b = 0, c = a.length; c > b; b++) this.expandByPoint(a[b]);
            return this
        },
        setFromCenterAndSize: function() {
            var a = new THREE.Vector2;
            return function(b, c) {
                var d = a.copy(c).multiplyScalar(.5);
                return this.min.copy(b).sub(d), this.max.copy(b).add(d), this
            }
        }(),
        clone: function() {
            return (new this.constructor).copy(this)
        },
        copy: function(a) {
            return this.min.copy(a.min), this.max.copy(a.max), this
        },
        makeEmpty: function() {
            return this.min.x = this.min.y = 1 / 0, this.max.x = this.max.y = -(1 / 0), this
        },
        isEmpty: function() {
            return this.max.x < this.min.x || this.max.y < this.min.y
        },
        center: function(a) {
            return (a || new THREE.Vector2).addVectors(this.min, this.max).multiplyScalar(.5)
        },
        size: function(a) {
            return (a || new THREE.Vector2).subVectors(this.max, this.min)
        },
        expandByPoint: function(a) {
            return this.min.min(a), this.max.max(a), this
        },
        expandByVector: function(a) {
            return this.min.sub(a), this.max.add(a), this
        },
        expandByScalar: function(a) {
            return this.min.addScalar(-a), this.max.addScalar(a), this
        },
        containsPoint: function(a) {
            return a.x < this.min.x || a.x > this.max.x || a.y < this.min.y || a.y > this.max.y ? !1 : !0
        },
        containsBox: function(a) {
            return this.min.x <= a.min.x && a.max.x <= this.max.x && this.min.y <= a.min.y && a.max.y <= this.max.y ? !0 : !1
        },
        getParameter: function(a, b) {
            return (b || new THREE.Vector2).set((a.x - this.min.x) / (this.max.x - this.min.x), (a.y - this.min.y) / (this.max.y - this.min.y))
        },
        intersectsBox: function(a) {
            return a.max.x < this.min.x || a.min.x > this.max.x || a.max.y < this.min.y || a.min.y > this.max.y ? !1 : !0
        },
        clampPoint: function(a, b) {
            return (b || new THREE.Vector2).copy(a).clamp(this.min, this.max)
        },
        distanceToPoint: function() {
            var a = new THREE.Vector2;
            return function(b) {
                return a.copy(b).clamp(this.min, this.max).sub(b).length()
            }
        }(),
        intersect: function(a) {
            return this.min.max(a.min), this.max.min(a.max), this
        },
        union: function(a) {
            return this.min.min(a.min), this.max.max(a.max), this
        },
        translate: function(a) {
            return this.min.add(a), this.max.add(a), this
        },
        equals: function(a) {
            return a.min.equals(this.min) && a.max.equals(this.max)
        }
    }, THREE.Box3 = function(a, b) {
        this.min = void 0 !== a ? a : new THREE.Vector3(1 / 0, 1 / 0, 1 / 0), this.max = void 0 !== b ? b : new THREE.Vector3(-(1 / 0), -(1 / 0), -(1 / 0))
    }, THREE.Box3.prototype = {
        constructor: THREE.Box3,
        set: function(a, b) {
            return this.min.copy(a), this.max.copy(b), this
        },
        setFromArray: function(a) {
            for (var b = 1 / 0, c = 1 / 0, d = 1 / 0, e = -(1 / 0), f = -(1 / 0), g = -(1 / 0), h = 0, i = a.length; i > h; h += 3) {
                var j = a[h],
                    k = a[h + 1],
                    l = a[h + 2];
                b > j && (b = j), c > k && (c = k), d > l && (d = l), j > e && (e = j), k > f && (f = k), l > g && (g = l)
            }
            this.min.set(b, c, d), this.max.set(e, f, g)
        },
        setFromPoints: function(a) {
            this.makeEmpty();
            for (var b = 0, c = a.length; c > b; b++) this.expandByPoint(a[b]);
            return this
        },
        setFromCenterAndSize: function() {
            var a = new THREE.Vector3;
            return function(b, c) {
                var d = a.copy(c).multiplyScalar(.5);
                return this.min.copy(b).sub(d), this.max.copy(b).add(d), this
            }
        }(),
        setFromObject: function() {
            var a = new THREE.Vector3;
            return function(b) {
                var c = this;
                return b.updateMatrixWorld(!0), this.makeEmpty(), b.traverse(function(b) {
                    var d = b.geometry;
                    if (void 0 !== d)
                        if (d instanceof THREE.Geometry)
                            for (var d = d.vertices, e = 0, f = d.length; f > e; e++) a.copy(d[e]), a.applyMatrix4(b.matrixWorld), c.expandByPoint(a);
                        else if (d instanceof THREE.BufferGeometry && (f = d.attributes.position, void 0 !== f)) {
                        var g;
                        for (f instanceof THREE.InterleavedBufferAttribute ? (d = f.data.array, e = f.offset, g = f.data.stride) : (d = f.array, e = 0, g = 3), f = d.length; f > e; e += g) a.fromArray(d, e), a.applyMatrix4(b.matrixWorld), c.expandByPoint(a)
                    }
                }), this
            }
        }(),
        clone: function() {
            return (new this.constructor).copy(this)
        },
        copy: function(a) {
            return this.min.copy(a.min), this.max.copy(a.max), this
        },
        makeEmpty: function() {
            return this.min.x = this.min.y = this.min.z = 1 / 0, this.max.x = this.max.y = this.max.z = -(1 / 0), this
        },
        isEmpty: function() {
            return this.max.x < this.min.x || this.max.y < this.min.y || this.max.z < this.min.z
        },
        center: function(a) {
            return (a || new THREE.Vector3).addVectors(this.min, this.max).multiplyScalar(.5)
        },
        size: function(a) {
            return (a || new THREE.Vector3).subVectors(this.max, this.min)
        },
        expandByPoint: function(a) {
            return this.min.min(a), this.max.max(a), this
        },
        expandByVector: function(a) {
            return this.min.sub(a), this.max.add(a), this
        },
        expandByScalar: function(a) {
            return this.min.addScalar(-a), this.max.addScalar(a), this
        },
        containsPoint: function(a) {
            return a.x < this.min.x || a.x > this.max.x || a.y < this.min.y || a.y > this.max.y || a.z < this.min.z || a.z > this.max.z ? !1 : !0
        },
        containsBox: function(a) {
            return this.min.x <= a.min.x && a.max.x <= this.max.x && this.min.y <= a.min.y && a.max.y <= this.max.y && this.min.z <= a.min.z && a.max.z <= this.max.z ? !0 : !1
        },
        getParameter: function(a, b) {
            return (b || new THREE.Vector3).set((a.x - this.min.x) / (this.max.x - this.min.x), (a.y - this.min.y) / (this.max.y - this.min.y), (a.z - this.min.z) / (this.max.z - this.min.z))
        },
        intersectsBox: function(a) {
            return a.max.x < this.min.x || a.min.x > this.max.x || a.max.y < this.min.y || a.min.y > this.max.y || a.max.z < this.min.z || a.min.z > this.max.z ? !1 : !0
        },
        intersectsSphere: function() {
            var a;
            return function(b) {
                return void 0 === a && (a = new THREE.Vector3),
                    this.clampPoint(b.center, a), a.distanceToSquared(b.center) <= b.radius * b.radius
            }
        }(),
        intersectsPlane: function(a) {
            var b, c;
            return 0 < a.normal.x ? (b = a.normal.x * this.min.x, c = a.normal.x * this.max.x) : (b = a.normal.x * this.max.x, c = a.normal.x * this.min.x), 0 < a.normal.y ? (b += a.normal.y * this.min.y, c += a.normal.y * this.max.y) : (b += a.normal.y * this.max.y, c += a.normal.y * this.min.y), 0 < a.normal.z ? (b += a.normal.z * this.min.z, c += a.normal.z * this.max.z) : (b += a.normal.z * this.max.z, c += a.normal.z * this.min.z), b <= a.constant && c >= a.constant
        },
        clampPoint: function(a, b) {
            return (b || new THREE.Vector3).copy(a).clamp(this.min, this.max)
        },
        distanceToPoint: function() {
            var a = new THREE.Vector3;
            return function(b) {
                return a.copy(b).clamp(this.min, this.max).sub(b).length()
            }
        }(),
        getBoundingSphere: function() {
            var a = new THREE.Vector3;
            return function(b) {
                return b = b || new THREE.Sphere, b.center = this.center(), b.radius = .5 * this.size(a).length(), b
            }
        }(),
        intersect: function(a) {
            return this.min.max(a.min), this.max.min(a.max), this.isEmpty() && this.makeEmpty(), this
        },
        union: function(a) {
            return this.min.min(a.min), this.max.max(a.max), this
        },
        applyMatrix4: function() {
            var a = [new THREE.Vector3, new THREE.Vector3, new THREE.Vector3, new THREE.Vector3, new THREE.Vector3, new THREE.Vector3, new THREE.Vector3, new THREE.Vector3];
            return function(b) {
                return this.isEmpty() ? this : (a[0].set(this.min.x, this.min.y, this.min.z).applyMatrix4(b), a[1].set(this.min.x, this.min.y, this.max.z).applyMatrix4(b), a[2].set(this.min.x, this.max.y, this.min.z).applyMatrix4(b), a[3].set(this.min.x, this.max.y, this.max.z).applyMatrix4(b), a[4].set(this.max.x, this.min.y, this.min.z).applyMatrix4(b), a[5].set(this.max.x, this.min.y, this.max.z).applyMatrix4(b), a[6].set(this.max.x, this.max.y, this.min.z).applyMatrix4(b), a[7].set(this.max.x, this.max.y, this.max.z).applyMatrix4(b), this.setFromPoints(a), this)
            }
        }(),
        translate: function(a) {
            return this.min.add(a), this.max.add(a), this
        },
        equals: function(a) {
            return a.min.equals(this.min) && a.max.equals(this.max)
        }
    }, THREE.Matrix3 = function() {
        this.elements = new Float32Array([1, 0, 0, 0, 1, 0, 0, 0, 1]), 0 < arguments.length && console.error("THREE.Matrix3: the constructor no longer reads arguments. use .set() instead.")
    }, THREE.Matrix3.prototype = {
        constructor: THREE.Matrix3,
        set: function(a, b, c, d, e, f, g, h, i) {
            var j = this.elements;
            return j[0] = a, j[1] = d, j[2] = g, j[3] = b, j[4] = e, j[5] = h, j[6] = c, j[7] = f, j[8] = i, this
        },
        identity: function() {
            return this.set(1, 0, 0, 0, 1, 0, 0, 0, 1), this
        },
        clone: function() {
            return (new this.constructor).fromArray(this.elements)
        },
        copy: function(a) {
            return a = a.elements, this.set(a[0], a[3], a[6], a[1], a[4], a[7], a[2], a[5], a[8]), this
        },
        setFromMatrix4: function(a) {
            return a = a.elements, this.set(a[0], a[4], a[8], a[1], a[5], a[9], a[2], a[6], a[10]), this
        },
        applyToVector3Array: function() {
            var a;
            return function(b, c, d) {
                void 0 === a && (a = new THREE.Vector3), void 0 === c && (c = 0), void 0 === d && (d = b.length);
                for (var e = 0; d > e; e += 3, c += 3) a.fromArray(b, c), a.applyMatrix3(this), a.toArray(b, c);
                return b
            }
        }(),
        applyToBuffer: function() {
            var a;
            return function(b, c, d) {
                void 0 === a && (a = new THREE.Vector3), void 0 === c && (c = 0), void 0 === d && (d = b.length / b.itemSize);
                for (var e = 0; d > e; e++, c++) a.x = b.getX(c), a.y = b.getY(c), a.z = b.getZ(c), a.applyMatrix3(this), b.setXYZ(a.x, a.y, a.z);
                return b
            }
        }(),
        multiplyScalar: function(a) {
            var b = this.elements;
            return b[0] *= a, b[3] *= a, b[6] *= a, b[1] *= a, b[4] *= a, b[7] *= a, b[2] *= a, b[5] *= a, b[8] *= a, this
        },
        determinant: function() {
            var a = this.elements,
                b = a[0],
                c = a[1],
                d = a[2],
                e = a[3],
                f = a[4],
                g = a[5],
                h = a[6],
                i = a[7],
                a = a[8];
            return b * f * a - b * g * i - c * e * a + c * g * h + d * e * i - d * f * h
        },
        getInverse: function(a, b) {
            a instanceof THREE.Matrix4 && console.error("THREE.Matrix3.getInverse no longer takes a Matrix4 argument.");
            var c = a.elements,
                d = this.elements,
                e = c[0],
                f = c[1],
                g = c[2],
                h = c[3],
                i = c[4],
                j = c[5],
                k = c[6],
                l = c[7],
                c = c[8],
                m = c * i - j * l,
                n = j * k - c * h,
                o = l * h - i * k,
                p = e * m + f * n + g * o;
            if (0 === p) {
                if (b) throw Error("THREE.Matrix3.getInverse(): can't invert matrix, determinant is 0");
                return console.warn("THREE.Matrix3.getInverse(): can't invert matrix, determinant is 0"), this.identity()
            }
            return p = 1 / p, d[0] = m * p, d[1] = (g * l - c * f) * p, d[2] = (j * f - g * i) * p, d[3] = n * p, d[4] = (c * e - g * k) * p, d[5] = (g * h - j * e) * p, d[6] = o * p, d[7] = (f * k - l * e) * p, d[8] = (i * e - f * h) * p, this
        },
        transpose: function() {
            var a, b = this.elements;
            return a = b[1], b[1] = b[3], b[3] = a, a = b[2], b[2] = b[6], b[6] = a, a = b[5], b[5] = b[7], b[7] = a, this
        },
        flattenToArrayOffset: function(a, b) {
            return console.warn("THREE.Matrix3: .flattenToArrayOffset is deprecated - just use .toArray instead."), this.toArray(a, b)
        },
        getNormalMatrix: function(a) {
            return this.setFromMatrix4(a).getInverse(this).transpose()
        },
        transposeIntoArray: function(a) {
            var b = this.elements;
            return a[0] = b[0], a[1] = b[3], a[2] = b[6], a[3] = b[1], a[4] = b[4], a[5] = b[7], a[6] = b[2], a[7] = b[5], a[8] = b[8], this
        },
        fromArray: function(a) {
            return this.elements.set(a), this
        },
        toArray: function(a, b) {
            void 0 === a && (a = []), void 0 === b && (b = 0);
            var c = this.elements;
            return a[b] = c[0], a[b + 1] = c[1], a[b + 2] = c[2], a[b + 3] = c[3], a[b + 4] = c[4], a[b + 5] = c[5], a[b + 6] = c[6], a[b + 7] = c[7], a[b + 8] = c[8], a
        }
    }, THREE.Matrix4 = function() {
        this.elements = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]), 0 < arguments.length && console.error("THREE.Matrix4: the constructor no longer reads arguments. use .set() instead.")
    }, THREE.Matrix4.prototype = {
        constructor: THREE.Matrix4,
        set: function(a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p) {
            var q = this.elements;
            return q[0] = a, q[4] = b, q[8] = c, q[12] = d, q[1] = e, q[5] = f, q[9] = g, q[13] = h, q[2] = i, q[6] = j, q[10] = k, q[14] = l, q[3] = m, q[7] = n, q[11] = o, q[15] = p, this
        },
        identity: function() {
            return this.set(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1), this
        },
        clone: function() {
            return (new THREE.Matrix4).fromArray(this.elements)
        },
        copy: function(a) {
            return this.elements.set(a.elements), this
        },
        copyPosition: function(a) {
            var b = this.elements;
            return a = a.elements, b[12] = a[12], b[13] = a[13], b[14] = a[14], this
        },
        extractBasis: function(a, b, c) {
            return a.setFromMatrixColumn(this, 0), b.setFromMatrixColumn(this, 1), c.setFromMatrixColumn(this, 2), this
        },
        makeBasis: function(a, b, c) {
            return this.set(a.x, b.x, c.x, 0, a.y, b.y, c.y, 0, a.z, b.z, c.z, 0, 0, 0, 0, 1), this
        },
        extractRotation: function() {
            var a;
            return function(b) {
                void 0 === a && (a = new THREE.Vector3);
                var c = this.elements,
                    d = b.elements,
                    e = 1 / a.setFromMatrixColumn(b, 0).length(),
                    f = 1 / a.setFromMatrixColumn(b, 1).length();
                return b = 1 / a.setFromMatrixColumn(b, 2).length(), c[0] = d[0] * e, c[1] = d[1] * e, c[2] = d[2] * e, c[4] = d[4] * f, c[5] = d[5] * f, c[6] = d[6] * f, c[8] = d[8] * b, c[9] = d[9] * b, c[10] = d[10] * b, this
            }
        }(),
        makeRotationFromEuler: function(a) {
            !1 == a instanceof THREE.Euler && console.error("THREE.Matrix: .makeRotationFromEuler() now expects a Euler rotation rather than a Vector3 and order.");
            var b = this.elements,
                c = a.x,
                d = a.y,
                e = a.z,
                f = Math.cos(c),
                c = Math.sin(c),
                g = Math.cos(d),
                d = Math.sin(d),
                h = Math.cos(e),
                e = Math.sin(e);
            if ("XYZ" === a.order) {
                a = f * h;
                var i = f * e,
                    j = c * h,
                    k = c * e;
                b[0] = g * h, b[4] = -g * e, b[8] = d, b[1] = i + j * d, b[5] = a - k * d, b[9] = -c * g, b[2] = k - a * d, b[6] = j + i * d, b[10] = f * g
            } else "YXZ" === a.order ? (a = g * h, i = g * e, j = d * h, k = d * e, b[0] = a + k * c, b[4] = j * c - i, b[8] = f * d, b[1] = f * e, b[5] = f * h, b[9] = -c, b[2] = i * c - j, b[6] = k + a * c, b[10] = f * g) : "ZXY" === a.order ? (a = g * h, i = g * e, j = d * h, k = d * e, b[0] = a - k * c, b[4] = -f * e, b[8] = j + i * c, b[1] = i + j * c, b[5] = f * h, b[9] = k - a * c, b[2] = -f * d, b[6] = c, b[10] = f * g) : "ZYX" === a.order ? (a = f * h, i = f * e, j = c * h, k = c * e, b[0] = g * h, b[4] = j * d - i, b[8] = a * d + k, b[1] = g * e, b[5] = k * d + a, b[9] = i * d - j, b[2] = -d, b[6] = c * g, b[10] = f * g) : "YZX" === a.order ? (a = f * g, i = f * d, j = c * g, k = c * d, b[0] = g * h, b[4] = k - a * e, b[8] = j * e + i, b[1] = e, b[5] = f * h, b[9] = -c * h, b[2] = -d * h, b[6] = i * e + j, b[10] = a - k * e) : "XZY" === a.order && (a = f * g, i = f * d, j = c * g, k = c * d, b[0] = g * h, b[4] = -e, b[8] = d * h, b[1] = a * e + k, b[5] = f * h, b[9] = i * e - j, b[2] = j * e - i, b[6] = c * h, b[10] = k * e + a);
            return b[3] = 0, b[7] = 0, b[11] = 0, b[12] = 0, b[13] = 0, b[14] = 0, b[15] = 1, this
        },
        makeRotationFromQuaternion: function(a) {
            var b = this.elements,
                c = a.x,
                d = a.y,
                e = a.z,
                f = a.w,
                g = c + c,
                h = d + d,
                i = e + e;
            a = c * g;
            var j = c * h,
                c = c * i,
                k = d * h,
                d = d * i,
                e = e * i,
                g = f * g,
                h = f * h,
                f = f * i;
            return b[0] = 1 - (k + e), b[4] = j - f, b[8] = c + h, b[1] = j + f, b[5] = 1 - (a + e), b[9] = d - g, b[2] = c - h, b[6] = d + g, b[10] = 1 - (a + k), b[3] = 0, b[7] = 0, b[11] = 0, b[12] = 0, b[13] = 0, b[14] = 0, b[15] = 1, this
        },
        lookAt: function() {
            var a, b, c;
            return function(d, e, f) {
                void 0 === a && (a = new THREE.Vector3, b = new THREE.Vector3, c = new THREE.Vector3);
                var g = this.elements;
                return c.subVectors(d, e).normalize(), 0 === c.lengthSq() && (c.z = 1), a.crossVectors(f, c).normalize(), 0 === a.lengthSq() && (c.z += 1e-4, a.crossVectors(f, c).normalize()), b.crossVectors(c, a), g[0] = a.x, g[4] = b.x, g[8] = c.x, g[1] = a.y, g[5] = b.y, g[9] = c.y, g[2] = a.z, g[6] = b.z, g[10] = c.z, this
            }
        }(),
        multiply: function(a, b) {
            return void 0 !== b ? (console.warn("THREE.Matrix4: .multiply() now only accepts one argument. Use .multiplyMatrices( a, b ) instead."), this.multiplyMatrices(a, b)) : this.multiplyMatrices(this, a)
        },
        premultiply: function(a) {
            return this.multiplyMatrices(a, this)
        },
        multiplyMatrices: function(a, b) {
            var c = a.elements,
                d = b.elements,
                e = this.elements,
                f = c[0],
                g = c[4],
                h = c[8],
                i = c[12],
                j = c[1],
                k = c[5],
                l = c[9],
                m = c[13],
                n = c[2],
                o = c[6],
                p = c[10],
                q = c[14],
                r = c[3],
                s = c[7],
                t = c[11],
                c = c[15],
                u = d[0],
                v = d[4],
                w = d[8],
                x = d[12],
                y = d[1],
                z = d[5],
                A = d[9],
                B = d[13],
                C = d[2],
                D = d[6],
                E = d[10],
                F = d[14],
                G = d[3],
                H = d[7],
                I = d[11],
                d = d[15];
            return e[0] = f * u + g * y + h * C + i * G, e[4] = f * v + g * z + h * D + i * H, e[8] = f * w + g * A + h * E + i * I, e[12] = f * x + g * B + h * F + i * d, e[1] = j * u + k * y + l * C + m * G, e[5] = j * v + k * z + l * D + m * H, e[9] = j * w + k * A + l * E + m * I, e[13] = j * x + k * B + l * F + m * d, e[2] = n * u + o * y + p * C + q * G, e[6] = n * v + o * z + p * D + q * H, e[10] = n * w + o * A + p * E + q * I, e[14] = n * x + o * B + p * F + q * d, e[3] = r * u + s * y + t * C + c * G, e[7] = r * v + s * z + t * D + c * H, e[11] = r * w + s * A + t * E + c * I, e[15] = r * x + s * B + t * F + c * d, this
        },
        multiplyToArray: function(a, b, c) {
            var d = this.elements;
            return this.multiplyMatrices(a, b), c[0] = d[0], c[1] = d[1], c[2] = d[2], c[3] = d[3], c[4] = d[4], c[5] = d[5], c[6] = d[6], c[7] = d[7], c[8] = d[8], c[9] = d[9], c[10] = d[10], c[11] = d[11], c[12] = d[12], c[13] = d[13], c[14] = d[14], c[15] = d[15], this
        },
        multiplyScalar: function(a) {
            var b = this.elements;
            return b[0] *= a, b[4] *= a, b[8] *= a, b[12] *= a, b[1] *= a, b[5] *= a, b[9] *= a, b[13] *= a, b[2] *= a, b[6] *= a, b[10] *= a, b[14] *= a, b[3] *= a, b[7] *= a, b[11] *= a, b[15] *= a, this
        },
        applyToVector3Array: function() {
            var a;
            return function(b, c, d) {
                void 0 === a && (a = new THREE.Vector3), void 0 === c && (c = 0), void 0 === d && (d = b.length);
                for (var e = 0; d > e; e += 3, c += 3) a.fromArray(b, c), a.applyMatrix4(this), a.toArray(b, c);
                return b
            }
        }(),
        applyToBuffer: function() {
            var a;
            return function(b, c, d) {
                void 0 === a && (a = new THREE.Vector3), void 0 === c && (c = 0), void 0 === d && (d = b.length / b.itemSize);
                for (var e = 0; d > e; e++, c++) a.x = b.getX(c), a.y = b.getY(c), a.z = b.getZ(c), a.applyMatrix4(this), b.setXYZ(a.x, a.y, a.z);
                return b
            }
        }(),
        determinant: function() {
            var a = this.elements,
                b = a[0],
                c = a[4],
                d = a[8],
                e = a[12],
                f = a[1],
                g = a[5],
                h = a[9],
                i = a[13],
                j = a[2],
                k = a[6],
                l = a[10],
                m = a[14];
            return a[3] * (+e * h * k - d * i * k - e * g * l + c * i * l + d * g * m - c * h * m) + a[7] * (+b * h * m - b * i * l + e * f * l - d * f * m + d * i * j - e * h * j) + a[11] * (+b * i * k - b * g * m - e * f * k + c * f * m + e * g * j - c * i * j) + a[15] * (-d * g * j - b * h * k + b * g * l + d * f * k - c * f * l + c * h * j)
        },
        transpose: function() {
            var a, b = this.elements;
            return a = b[1], b[1] = b[4], b[4] = a, a = b[2], b[2] = b[8], b[8] = a, a = b[6], b[6] = b[9], b[9] = a, a = b[3], b[3] = b[12], b[12] = a, a = b[7], b[7] = b[13], b[13] = a, a = b[11], b[11] = b[14], b[14] = a, this
        },
        flattenToArrayOffset: function(a, b) {
            return console.warn("THREE.Matrix3: .flattenToArrayOffset is deprecated - just use .toArray instead."), this.toArray(a, b)
        },
        getPosition: function() {
            var a;
            return function() {
                return void 0 === a && (a = new THREE.Vector3), console.warn("THREE.Matrix4: .getPosition() has been removed. Use Vector3.setFromMatrixPosition( matrix ) instead."), a.setFromMatrixColumn(this, 3)
            }
        }(),
        setPosition: function(a) {
            var b = this.elements;
            return b[12] = a.x, b[13] = a.y, b[14] = a.z, this
        },
        getInverse: function(a, b) {
            var c = this.elements,
                d = a.elements,
                e = d[0],
                f = d[1],
                g = d[2],
                h = d[3],
                i = d[4],
                j = d[5],
                k = d[6],
                l = d[7],
                m = d[8],
                n = d[9],
                o = d[10],
                p = d[11],
                q = d[12],
                r = d[13],
                s = d[14],
                d = d[15],
                t = n * s * l - r * o * l + r * k * p - j * s * p - n * k * d + j * o * d,
                u = q * o * l - m * s * l - q * k * p + i * s * p + m * k * d - i * o * d,
                v = m * r * l - q * n * l + q * j * p - i * r * p - m * j * d + i * n * d,
                w = q * n * k - m * r * k - q * j * o + i * r * o + m * j * s - i * n * s,
                x = e * t + f * u + g * v + h * w;
            if (0 === x) {
                if (b) throw Error("THREE.Matrix4.getInverse(): can't invert matrix, determinant is 0");
                return console.warn("THREE.Matrix4.getInverse(): can't invert matrix, determinant is 0"), this.identity()
            }
            return x = 1 / x, c[0] = t * x, c[1] = (r * o * h - n * s * h - r * g * p + f * s * p + n * g * d - f * o * d) * x, c[2] = (j * s * h - r * k * h + r * g * l - f * s * l - j * g * d + f * k * d) * x, c[3] = (n * k * h - j * o * h - n * g * l + f * o * l + j * g * p - f * k * p) * x, c[4] = u * x, c[5] = (m * s * h - q * o * h + q * g * p - e * s * p - m * g * d + e * o * d) * x, c[6] = (q * k * h - i * s * h - q * g * l + e * s * l + i * g * d - e * k * d) * x, c[7] = (i * o * h - m * k * h + m * g * l - e * o * l - i * g * p + e * k * p) * x, c[8] = v * x, c[9] = (q * n * h - m * r * h - q * f * p + e * r * p + m * f * d - e * n * d) * x, c[10] = (i * r * h - q * j * h + q * f * l - e * r * l - i * f * d + e * j * d) * x, c[11] = (m * j * h - i * n * h - m * f * l + e * n * l + i * f * p - e * j * p) * x, c[12] = w * x, c[13] = (m * r * g - q * n * g + q * f * o - e * r * o - m * f * s + e * n * s) * x, c[14] = (q * j * g - i * r * g - q * f * k + e * r * k + i * f * s - e * j * s) * x, c[15] = (i * n * g - m * j * g + m * f * k - e * n * k - i * f * o + e * j * o) * x, this
        },
        scale: function(a) {
            var b = this.elements,
                c = a.x,
                d = a.y;
            return a = a.z, b[0] *= c, b[4] *= d, b[8] *= a, b[1] *= c, b[5] *= d, b[9] *= a, b[2] *= c, b[6] *= d, b[10] *= a, b[3] *= c, b[7] *= d, b[11] *= a, this
        },
        getMaxScaleOnAxis: function() {
            var a = this.elements;
            return Math.sqrt(Math.max(a[0] * a[0] + a[1] * a[1] + a[2] * a[2], a[4] * a[4] + a[5] * a[5] + a[6] * a[6], a[8] * a[8] + a[9] * a[9] + a[10] * a[10]))
        },
        makeTranslation: function(a, b, c) {
            return this.set(1, 0, 0, a, 0, 1, 0, b, 0, 0, 1, c, 0, 0, 0, 1), this
        },
        makeRotationX: function(a) {
            var b = Math.cos(a);
            return a = Math.sin(a), this.set(1, 0, 0, 0, 0, b, -a, 0, 0, a, b, 0, 0, 0, 0, 1), this
        },
        makeRotationY: function(a) {
            var b = Math.cos(a);
            return a = Math.sin(a), this.set(b, 0, a, 0, 0, 1, 0, 0, -a, 0, b, 0, 0, 0, 0, 1), this
        },
        makeRotationZ: function(a) {
            var b = Math.cos(a);
            return a = Math.sin(a), this.set(b, -a, 0, 0, a, b, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1), this
        },
        makeRotationAxis: function(a, b) {
            var c = Math.cos(b),
                d = Math.sin(b),
                e = 1 - c,
                f = a.x,
                g = a.y,
                h = a.z,
                i = e * f,
                j = e * g;
            return this.set(i * f + c, i * g - d * h, i * h + d * g, 0, i * g + d * h, j * g + c, j * h - d * f, 0, i * h - d * g, j * h + d * f, e * h * h + c, 0, 0, 0, 0, 1), this
        },
        makeScale: function(a, b, c) {
            return this.set(a, 0, 0, 0, 0, b, 0, 0, 0, 0, c, 0, 0, 0, 0, 1), this
        },
        compose: function(a, b, c) {
            return this.makeRotationFromQuaternion(b), this.scale(c), this.setPosition(a), this
        },
        decompose: function() {
            var a, b;
            return function(c, d, e) {
                void 0 === a && (a = new THREE.Vector3, b = new THREE.Matrix4);
                var f = this.elements,
                    g = a.set(f[0], f[1], f[2]).length(),
                    h = a.set(f[4], f[5], f[6]).length(),
                    i = a.set(f[8], f[9], f[10]).length();
                0 > this.determinant() && (g = -g), c.x = f[12], c.y = f[13], c.z = f[14], b.elements.set(this.elements), c = 1 / g;
                var f = 1 / h,
                    j = 1 / i;
                return b.elements[0] *= c, b.elements[1] *= c, b.elements[2] *= c, b.elements[4] *= f, b.elements[5] *= f, b.elements[6] *= f, b.elements[8] *= j, b.elements[9] *= j, b.elements[10] *= j, d.setFromRotationMatrix(b), e.x = g, e.y = h, e.z = i, this
            }
        }(),
        makeFrustum: function(a, b, c, d, e, f) {
            var g = this.elements;
            return g[0] = 2 * e / (b - a), g[4] = 0, g[8] = (b + a) / (b - a), g[12] = 0, g[1] = 0, g[5] = 2 * e / (d - c), g[9] = (d + c) / (d - c), g[13] = 0, g[2] = 0, g[6] = 0, g[10] = -(f + e) / (f - e), g[14] = -2 * f * e / (f - e), g[3] = 0, g[7] = 0, g[11] = -1, g[15] = 0, this
        },
        makePerspective: function(a, b, c, d) {
            a = c * Math.tan(THREE.Math.DEG2RAD * a * .5);
            var e = -a;
            return this.makeFrustum(e * b, a * b, e, a, c, d)
        },
        makeOrthographic: function(a, b, c, d, e, f) {
            var g = this.elements,
                h = 1 / (b - a),
                i = 1 / (c - d),
                j = 1 / (f - e);
            return g[0] = 2 * h, g[4] = 0, g[8] = 0, g[12] = -((b + a) * h), g[1] = 0, g[5] = 2 * i, g[9] = 0, g[13] = -((c + d) * i), g[2] = 0, g[6] = 0, g[10] = -2 * j, g[14] = -((f + e) * j), g[3] = 0, g[7] = 0, g[11] = 0, g[15] = 1, this
        },
        equals: function(a) {
            var b = this.elements;
            a = a.elements;
            for (var c = 0; 16 > c; c++)
                if (b[c] !== a[c]) return !1;
            return !0
        },
        fromArray: function(a) {
            return this.elements.set(a), this
        },
        toArray: function(a, b) {
            void 0 === a && (a = []), void 0 === b && (b = 0);
            var c = this.elements;
            return a[b] = c[0], a[b + 1] = c[1], a[b + 2] = c[2], a[b + 3] = c[3], a[b + 4] = c[4], a[b + 5] = c[5], a[b + 6] = c[6], a[b + 7] = c[7], a[b + 8] = c[8], a[b + 9] = c[9], a[b + 10] = c[10], a[b + 11] = c[11], a[b + 12] = c[12], a[b + 13] = c[13], a[b + 14] = c[14], a[b + 15] = c[15], a
        }
    }, THREE.Ray = function(a, b) {
        this.origin = void 0 !== a ? a : new THREE.Vector3, this.direction = void 0 !== b ? b : new THREE.Vector3
    }, THREE.Ray.prototype = {
        constructor: THREE.Ray,
        set: function(a, b) {
            return this.origin.copy(a), this.direction.copy(b), this
        },
        clone: function() {
            return (new this.constructor).copy(this)
        },
        copy: function(a) {
            return this.origin.copy(a.origin), this.direction.copy(a.direction), this
        },
        at: function(a, b) {
            return (b || new THREE.Vector3).copy(this.direction).multiplyScalar(a).add(this.origin)
        },
        lookAt: function(a) {
            return this.direction.copy(a).sub(this.origin).normalize(), this
        },
        recast: function() {
            var a = new THREE.Vector3;
            return function(b) {
                return this.origin.copy(this.at(b, a)), this
            }
        }(),
        closestPointToPoint: function(a, b) {
            var c = b || new THREE.Vector3;
            c.subVectors(a, this.origin);
            var d = c.dot(this.direction);
            return 0 > d ? c.copy(this.origin) : c.copy(this.direction).multiplyScalar(d).add(this.origin)
        },
        distanceToPoint: function(a) {
            return Math.sqrt(this.distanceSqToPoint(a))
        },
        distanceSqToPoint: function() {
            var a = new THREE.Vector3;
            return function(b) {
                var c = a.subVectors(b, this.origin).dot(this.direction);
                return 0 > c ? this.origin.distanceToSquared(b) : (a.copy(this.direction).multiplyScalar(c).add(this.origin), a.distanceToSquared(b))
            }
        }(),
        distanceSqToSegment: function() {
            var a = new THREE.Vector3,
                b = new THREE.Vector3,
                c = new THREE.Vector3;
            return function(d, e, f, g) {
                a.copy(d).add(e).multiplyScalar(.5), b.copy(e).sub(d).normalize(), c.copy(this.origin).sub(a);
                var h, i = .5 * d.distanceTo(e),
                    j = -this.direction.dot(b),
                    k = c.dot(this.direction),
                    l = -c.dot(b),
                    m = c.lengthSq(),
                    n = Math.abs(1 - j * j);
                return n > 0 ? (d = j * l - k, e = j * k - l, h = i * n, d >= 0 ? e >= -h ? h >= e ? (i = 1 / n, d *= i, e *= i, j = d * (d + j * e + 2 * k) + e * (j * d + e + 2 * l) + m) : (e = i, d = Math.max(0, -(j * e + k)), j = -d * d + e * (e + 2 * l) + m) : (e = -i, d = Math.max(0, -(j * e + k)), j = -d * d + e * (e + 2 * l) + m) : -h >= e ? (d = Math.max(0, -(-j * i + k)), e = d > 0 ? -i : Math.min(Math.max(-i, -l), i), j = -d * d + e * (e + 2 * l) + m) : h >= e ? (d = 0, e = Math.min(Math.max(-i, -l), i), j = e * (e + 2 * l) + m) : (d = Math.max(0, -(j * i + k)), e = d > 0 ? i : Math.min(Math.max(-i, -l), i), j = -d * d + e * (e + 2 * l) + m)) : (e = j > 0 ? -i : i, d = Math.max(0, -(j * e + k)), j = -d * d + e * (e + 2 * l) + m), f && f.copy(this.direction).multiplyScalar(d).add(this.origin), g && g.copy(b).multiplyScalar(e).add(a), j
            }
        }(),
        intersectSphere: function() {
            var a = new THREE.Vector3;
            return function(b, c) {
                a.subVectors(b.center, this.origin);
                var d = a.dot(this.direction),
                    e = a.dot(a) - d * d,
                    f = b.radius * b.radius;
                return e > f ? null : (f = Math.sqrt(f - e), e = d - f, d += f, 0 > e && 0 > d ? null : 0 > e ? this.at(d, c) : this.at(e, c))
            }
        }(),
        intersectsSphere: function(a) {
            return this.distanceToPoint(a.center) <= a.radius
        },
        distanceToPlane: function(a) {
            var b = a.normal.dot(this.direction);
            return 0 === b ? 0 === a.distanceToPoint(this.origin) ? 0 : null : (a = -(this.origin.dot(a.normal) + a.constant) / b, a >= 0 ? a : null)
        },
        intersectPlane: function(a, b) {
            var c = this.distanceToPlane(a);
            return null === c ? null : this.at(c, b)
        },
        intersectsPlane: function(a) {
            var b = a.distanceToPoint(this.origin);
            return 0 === b || 0 > a.normal.dot(this.direction) * b ? !0 : !1
        },
        intersectBox: function(a, b) {
            var c, d, e, f, g;
            d = 1 / this.direction.x, f = 1 / this.direction.y, g = 1 / this.direction.z;
            var h = this.origin;
            return d >= 0 ? (c = (a.min.x - h.x) * d, d *= a.max.x - h.x) : (c = (a.max.x - h.x) * d, d *= a.min.x - h.x), f >= 0 ? (e = (a.min.y - h.y) * f, f *= a.max.y - h.y) : (e = (a.max.y - h.y) * f, f *= a.min.y - h.y), c > f || e > d ? null : ((e > c || c !== c) && (c = e), (d > f || d !== d) && (d = f), g >= 0 ? (e = (a.min.z - h.z) * g, g *= a.max.z - h.z) : (e = (a.max.z - h.z) * g, g *= a.min.z - h.z), c > g || e > d ? null : ((e > c || c !== c) && (c = e), (d > g || d !== d) && (d = g), 0 > d ? null : this.at(c >= 0 ? c : d, b)))
        },
        intersectsBox: function() {
            var a = new THREE.Vector3;
            return function(b) {
                return null !== this.intersectBox(b, a)
            }
        }(),
        intersectTriangle: function() {
            var a = new THREE.Vector3,
                b = new THREE.Vector3,
                c = new THREE.Vector3,
                d = new THREE.Vector3;
            return function(e, f, g, h, i) {
                if (b.subVectors(f, e), c.subVectors(g, e), d.crossVectors(b, c), f = this.direction.dot(d), f > 0) {
                    if (h) return null;
                    h = 1
                } else {
                    if (!(0 > f)) return null;
                    h = -1, f = -f
                }
                return a.subVectors(this.origin, e), e = h * this.direction.dot(c.crossVectors(a, c)), 0 > e ? null : (g = h * this.direction.dot(b.cross(a)), 0 > g || e + g > f ? null : (e = -h * a.dot(d), 0 > e ? null : this.at(e / f, i)))
            }
        }(),
        applyMatrix4: function(a) {
            return this.direction.add(this.origin).applyMatrix4(a), this.origin.applyMatrix4(a), this.direction.sub(this.origin), this.direction.normalize(), this
        },
        equals: function(a) {
            return a.origin.equals(this.origin) && a.direction.equals(this.direction)
        }
    }, THREE.Sphere = function(a, b) {
        this.center = void 0 !== a ? a : new THREE.Vector3, this.radius = void 0 !== b ? b : 0
    }, THREE.Sphere.prototype = {
        constructor: THREE.Sphere,
        set: function(a, b) {
            return this.center.copy(a), this.radius = b, this
        },
        setFromPoints: function() {
            var a = new THREE.Box3;
            return function(b, c) {
                var d = this.center;
                void 0 !== c ? d.copy(c) : a.setFromPoints(b).center(d);
                for (var e = 0, f = 0, g = b.length; g > f; f++) e = Math.max(e, d.distanceToSquared(b[f]));
                return this.radius = Math.sqrt(e), this
            }
        }(),
        clone: function() {
            return (new this.constructor).copy(this)
        },
        copy: function(a) {
            return this.center.copy(a.center), this.radius = a.radius, this
        },
        empty: function() {
            return 0 >= this.radius
        },
        containsPoint: function(a) {
            return a.distanceToSquared(this.center) <= this.radius * this.radius
        },
        distanceToPoint: function(a) {
            return a.distanceTo(this.center) - this.radius
        },
        intersectsSphere: function(a) {
            var b = this.radius + a.radius;
            return a.center.distanceToSquared(this.center) <= b * b
        },
        intersectsBox: function(a) {
            return a.intersectsSphere(this)
        },
        intersectsPlane: function(a) {
            return Math.abs(this.center.dot(a.normal) - a.constant) <= this.radius
        },
        clampPoint: function(a, b) {
            var c = this.center.distanceToSquared(a),
                d = b || new THREE.Vector3;
            return d.copy(a), c > this.radius * this.radius && (d.sub(this.center).normalize(), d.multiplyScalar(this.radius).add(this.center)), d
        },
        getBoundingBox: function(a) {
            return a = a || new THREE.Box3, a.set(this.center, this.center), a.expandByScalar(this.radius), a
        },
        applyMatrix4: function(a) {
            return this.center.applyMatrix4(a), this.radius *= a.getMaxScaleOnAxis(), this
        },
        translate: function(a) {
            return this.center.add(a), this
        },
        equals: function(a) {
            return a.center.equals(this.center) && a.radius === this.radius
        }
    }, THREE.Frustum = function(a, b, c, d, e, f) {
        this.planes = [void 0 !== a ? a : new THREE.Plane, void 0 !== b ? b : new THREE.Plane, void 0 !== c ? c : new THREE.Plane, void 0 !== d ? d : new THREE.Plane, void 0 !== e ? e : new THREE.Plane, void 0 !== f ? f : new THREE.Plane]
    }, THREE.Frustum.prototype = {
        constructor: THREE.Frustum,
        set: function(a, b, c, d, e, f) {
            var g = this.planes;
            return g[0].copy(a), g[1].copy(b), g[2].copy(c), g[3].copy(d), g[4].copy(e), g[5].copy(f), this
        },
        clone: function() {
            return (new this.constructor).copy(this)
        },
        copy: function(a) {
            for (var b = this.planes, c = 0; 6 > c; c++) b[c].copy(a.planes[c]);
            return this
        },
        setFromMatrix: function(a) {
            var b = this.planes,
                c = a.elements;
            a = c[0];
            var d = c[1],
                e = c[2],
                f = c[3],
                g = c[4],
                h = c[5],
                i = c[6],
                j = c[7],
                k = c[8],
                l = c[9],
                m = c[10],
                n = c[11],
                o = c[12],
                p = c[13],
                q = c[14],
                c = c[15];
            return b[0].setComponents(f - a, j - g, n - k, c - o).normalize(), b[1].setComponents(f + a, j + g, n + k, c + o).normalize(), b[2].setComponents(f + d, j + h, n + l, c + p).normalize(), b[3].setComponents(f - d, j - h, n - l, c - p).normalize(), b[4].setComponents(f - e, j - i, n - m, c - q).normalize(), b[5].setComponents(f + e, j + i, n + m, c + q).normalize(), this
        },
        intersectsObject: function() {
            var a = new THREE.Sphere;
            return function(b) {
                var c = b.geometry;
                return null === c.boundingSphere && c.computeBoundingSphere(), a.copy(c.boundingSphere).applyMatrix4(b.matrixWorld), this.intersectsSphere(a)
            }
        }(),
        intersectsSprite: function() {
            var a = new THREE.Sphere;
            return function(b) {
                return a.center.set(0, 0, 0), a.radius = .7071067811865476, a.applyMatrix4(b.matrixWorld), this.intersectsSphere(a)
            }
        }(),
        intersectsSphere: function(a) {
            var b = this.planes,
                c = a.center;
            a = -a.radius;
            for (var d = 0; 6 > d; d++)
                if (b[d].distanceToPoint(c) < a) return !1;
            return !0
        },
        intersectsBox: function() {
            var a = new THREE.Vector3,
                b = new THREE.Vector3;
            return function(c) {
                for (var d = this.planes, e = 0; 6 > e; e++) {
                    var f = d[e];
                    a.x = 0 < f.normal.x ? c.min.x : c.max.x, b.x = 0 < f.normal.x ? c.max.x : c.min.x, a.y = 0 < f.normal.y ? c.min.y : c.max.y, b.y = 0 < f.normal.y ? c.max.y : c.min.y, a.z = 0 < f.normal.z ? c.min.z : c.max.z, b.z = 0 < f.normal.z ? c.max.z : c.min.z;
                    var g = f.distanceToPoint(a),
                        f = f.distanceToPoint(b);
                    if (0 > g && 0 > f) return !1
                }
                return !0
            }
        }(),
        containsPoint: function(a) {
            for (var b = this.planes, c = 0; 6 > c; c++)
                if (0 > b[c].distanceToPoint(a)) return !1;
            return !0
        }
    }, THREE.Plane = function(a, b) {
        this.normal = void 0 !== a ? a : new THREE.Vector3(1, 0, 0), this.constant = void 0 !== b ? b : 0
    }, THREE.Plane.prototype = {
        constructor: THREE.Plane,
        set: function(a, b) {
            return this.normal.copy(a), this.constant = b, this
        },
        setComponents: function(a, b, c, d) {
            return this.normal.set(a, b, c), this.constant = d, this
        },
        setFromNormalAndCoplanarPoint: function(a, b) {
            return this.normal.copy(a), this.constant = -b.dot(this.normal), this
        },
        setFromCoplanarPoints: function() {
            var a = new THREE.Vector3,
                b = new THREE.Vector3;
            return function(c, d, e) {
                return d = a.subVectors(e, d).cross(b.subVectors(c, d)).normalize(), this.setFromNormalAndCoplanarPoint(d, c), this
            }
        }(),
        clone: function() {
            return (new this.constructor).copy(this)
        },
        copy: function(a) {
            return this.normal.copy(a.normal), this.constant = a.constant, this
        },
        normalize: function() {
            var a = 1 / this.normal.length();
            return this.normal.multiplyScalar(a), this.constant *= a, this
        },
        negate: function() {
            return this.constant *= -1, this.normal.negate(), this
        },
        distanceToPoint: function(a) {
            return this.normal.dot(a) + this.constant
        },
        distanceToSphere: function(a) {
            return this.distanceToPoint(a.center) - a.radius
        },
        projectPoint: function(a, b) {
            return this.orthoPoint(a, b).sub(a).negate()
        },
        orthoPoint: function(a, b) {
            var c = this.distanceToPoint(a);
            return (b || new THREE.Vector3).copy(this.normal).multiplyScalar(c)
        },
        intersectLine: function() {
            var a = new THREE.Vector3;
            return function(b, c) {
                var d = c || new THREE.Vector3,
                    e = b.delta(a),
                    f = this.normal.dot(e);
                return 0 !== f ? (f = -(b.start.dot(this.normal) + this.constant) / f, 0 > f || f > 1 ? void 0 : d.copy(e).multiplyScalar(f).add(b.start)) : 0 === this.distanceToPoint(b.start) ? d.copy(b.start) : void 0
            }
        }(),
        intersectsLine: function(a) {
            var b = this.distanceToPoint(a.start);
            return a = this.distanceToPoint(a.end), 0 > b && a > 0 || 0 > a && b > 0
        },
        intersectsBox: function(a) {
            return a.intersectsPlane(this)
        },
        intersectsSphere: function(a) {
            return a.intersectsPlane(this)
        },
        coplanarPoint: function(a) {
            return (a || new THREE.Vector3).copy(this.normal).multiplyScalar(-this.constant)
        },
        applyMatrix4: function() {
            var a = new THREE.Vector3,
                b = new THREE.Matrix3;
            return function(c, d) {
                var e = this.coplanarPoint(a).applyMatrix4(c),
                    f = d || b.getNormalMatrix(c),
                    f = this.normal.applyMatrix3(f).normalize();
                return this.constant = -e.dot(f), this
            }
        }(),
        translate: function(a) {
            return this.constant -= a.dot(this.normal), this
        },
        equals: function(a) {
            return a.normal.equals(this.normal) && a.constant === this.constant
        }
    }, THREE.Spherical = function(a, b, c) {
        return this.radius = void 0 !== a ? a : 1, this.phi = void 0 !== b ? b : 0, this.theta = void 0 !== c ? c : 0, this
    }, THREE.Spherical.prototype = {
        constructor: THREE.Spherical,
        set: function(a, b, c) {
            return this.radius = a, this.phi = b, this.theta = c, this
        },
        clone: function() {
            return (new this.constructor).copy(this)
        },
        copy: function(a) {
            return this.radius.copy(a.radius), this.phi.copy(a.phi), this.theta.copy(a.theta), this
        },
        makeSafe: function() {
            return this.phi = Math.max(1e-6, Math.min(Math.PI - 1e-6, this.phi)), this
        },
        setFromVector3: function(a) {
            return this.radius = a.length(), 0 === this.radius ? this.phi = this.theta = 0 : (this.theta = Math.atan2(a.x, a.z), this.phi = Math.acos(THREE.Math.clamp(a.y / this.radius, -1, 1))), this
        }
    }, THREE.Math = {
        DEG2RAD: Math.PI / 180,
        RAD2DEG: 180 / Math.PI,
        generateUUID: function() {
            var a, b = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz".split(""),
                c = Array(36),
                d = 0;
            return function() {
                for (var e = 0; 36 > e; e++) 8 === e || 13 === e || 18 === e || 23 === e ? c[e] = "-" : 14 === e ? c[e] = "4" : (2 >= d && (d = 33554432 + 16777216 * Math.random() | 0), a = 15 & d, d >>= 4, c[e] = b[19 === e ? 3 & a | 8 : a]);
                return c.join("")
            }
        }(),
        clamp: function(a, b, c) {
            return Math.max(b, Math.min(c, a))
        },
        euclideanModulo: function(a, b) {
            return (a % b + b) % b
        },
        mapLinear: function(a, b, c, d, e) {
            return d + (a - b) * (e - d) / (c - b)
        },
        smoothstep: function(a, b, c) {
            return b >= a ? 0 : a >= c ? 1 : (a = (a - b) / (c - b), a * a * (3 - 2 * a))
        },
        smootherstep: function(a, b, c) {
            return b >= a ? 0 : a >= c ? 1 : (a = (a - b) / (c - b), a * a * a * (a * (6 * a - 15) + 10))
        },
        random16: function() {
            return console.warn("THREE.Math.random16() has been deprecated. Use Math.random() instead."), Math.random()
        },
        randInt: function(a, b) {
            return a + Math.floor(Math.random() * (b - a + 1))
        },
        randFloat: function(a, b) {
            return a + Math.random() * (b - a)
        },
        randFloatSpread: function(a) {
            return a * (.5 - Math.random())
        },
        degToRad: function(a) {
            return a * THREE.Math.DEG2RAD
        },
        radToDeg: function(a) {
            return a * THREE.Math.RAD2DEG
        },
        isPowerOfTwo: function(a) {
            return 0 === (a & a - 1) && 0 !== a
        },
        nearestPowerOfTwo: function(a) {
            return Math.pow(2, Math.round(Math.log(a) / Math.LN2))
        },
        nextPowerOfTwo: function(a) {
            return a--, a |= a >> 1, a |= a >> 2, a |= a >> 4, a |= a >> 8, a |= a >> 16, a++, a
        }
    }, THREE.Spline = function(a) {
        function b(a, b, c, d, e, f, g) {
            return a = .5 * (c - a), d = .5 * (d - b), (2 * (b - c) + a + d) * g + (-3 * (b - c) - 2 * a - d) * f + a * e + b
        }
        this.points = a;
        var c, d, e, f, g, h, i, j, k, l = [],
            m = {
                x: 0,
                y: 0,
                z: 0
            };
        this.initFromArray = function(a) {
            this.points = [];
            for (var b = 0; b < a.length; b++) this.points[b] = {
                x: a[b][0],
                y: a[b][1],
                z: a[b][2]
            }
        }, this.getPoint = function(a) {
            return c = (this.points.length - 1) * a, d = Math.floor(c), e = c - d, l[0] = 0 === d ? d : d - 1, l[1] = d, l[2] = d > this.points.length - 2 ? this.points.length - 1 : d + 1, l[3] = d > this.points.length - 3 ? this.points.length - 1 : d + 2, h = this.points[l[0]], i = this.points[l[1]], j = this.points[l[2]], k = this.points[l[3]], f = e * e, g = e * f, m.x = b(h.x, i.x, j.x, k.x, e, f, g), m.y = b(h.y, i.y, j.y, k.y, e, f, g), m.z = b(h.z, i.z, j.z, k.z, e, f, g), m
        }, this.getControlPointsArray = function() {
            var a, b, c = this.points.length,
                d = [];
            for (a = 0; c > a; a++) b = this.points[a], d[a] = [b.x, b.y, b.z];
            return d
        }, this.getLength = function(a) {
            var b, c, d, e = b = b = 0,
                f = new THREE.Vector3,
                g = new THREE.Vector3,
                h = [],
                i = 0;
            for (h[0] = 0, a || (a = 100), c = this.points.length * a, f.copy(this.points[0]), a = 1; c > a; a++) b = a / c, d = this.getPoint(b), g.copy(d), i += g.distanceTo(f), f.copy(d), b *= this.points.length - 1, b = Math.floor(b), b !== e && (h[b] = i, e = b);
            return h[h.length] = i, {
                chunks: h,
                total: i
            }
        }, this.reparametrizeByArcLength = function(a) {
            var b, c, d, e, f, g, h = [],
                i = new THREE.Vector3,
                j = this.getLength();
            for (h.push(i.copy(this.points[0]).clone()), b = 1; b < this.points.length; b++) {
                for (c = j.chunks[b] - j.chunks[b - 1], g = Math.ceil(a * c / j.total), e = (b - 1) / (this.points.length - 1), f = b / (this.points.length - 1), c = 1; g - 1 > c; c++) d = e + 1 / g * c * (f - e), d = this.getPoint(d), h.push(i.copy(d).clone());
                h.push(i.copy(this.points[b]).clone())
            }
            this.points = h
        }
    }, THREE.Triangle = function(a, b, c) {
        this.a = void 0 !== a ? a : new THREE.Vector3, this.b = void 0 !== b ? b : new THREE.Vector3, this.c = void 0 !== c ? c : new THREE.Vector3
    }, THREE.Triangle.normal = function() {
        var a = new THREE.Vector3;
        return function(b, c, d, e) {
            return e = e || new THREE.Vector3, e.subVectors(d, c), a.subVectors(b, c), e.cross(a), b = e.lengthSq(), b > 0 ? e.multiplyScalar(1 / Math.sqrt(b)) : e.set(0, 0, 0)
        }
    }(), THREE.Triangle.barycoordFromPoint = function() {
        var a = new THREE.Vector3,
            b = new THREE.Vector3,
            c = new THREE.Vector3;
        return function(d, e, f, g, h) {
            a.subVectors(g, e), b.subVectors(f, e), c.subVectors(d, e), d = a.dot(a), e = a.dot(b), f = a.dot(c);
            var i = b.dot(b);
            g = b.dot(c);
            var j = d * i - e * e;
            return h = h || new THREE.Vector3, 0 === j ? h.set(-2, -1, -1) : (j = 1 / j, i = (i * f - e * g) * j, d = (d * g - e * f) * j, h.set(1 - i - d, d, i))
        }
    }(), THREE.Triangle.containsPoint = function() {
        var a = new THREE.Vector3;
        return function(b, c, d, e) {
            return b = THREE.Triangle.barycoordFromPoint(b, c, d, e, a), 0 <= b.x && 0 <= b.y && 1 >= b.x + b.y
        }
    }(), THREE.Triangle.prototype = {
        constructor: THREE.Triangle,
        set: function(a, b, c) {
            return this.a.copy(a), this.b.copy(b), this.c.copy(c), this
        },
        setFromPointsAndIndices: function(a, b, c, d) {
            return this.a.copy(a[b]), this.b.copy(a[c]), this.c.copy(a[d]), this
        },
        clone: function() {
            return (new this.constructor).copy(this)
        },
        copy: function(a) {
            return this.a.copy(a.a), this.b.copy(a.b), this.c.copy(a.c), this
        },
        area: function() {
            var a = new THREE.Vector3,
                b = new THREE.Vector3;
            return function() {
                return a.subVectors(this.c, this.b), b.subVectors(this.a, this.b), .5 * a.cross(b).length()
            }
        }(),
        midpoint: function(a) {
            return (a || new THREE.Vector3).addVectors(this.a, this.b).add(this.c).multiplyScalar(1 / 3)
        },
        normal: function(a) {
            return THREE.Triangle.normal(this.a, this.b, this.c, a)
        },
        plane: function(a) {
            return (a || new THREE.Plane).setFromCoplanarPoints(this.a, this.b, this.c)
        },
        barycoordFromPoint: function(a, b) {
            return THREE.Triangle.barycoordFromPoint(a, this.a, this.b, this.c, b)
        },
        containsPoint: function(a) {
            return THREE.Triangle.containsPoint(a, this.a, this.b, this.c)
        },
        closestPointToPoint: function() {
            var a, b, c, d;
            return function(e, f) {
                void 0 === a && (a = new THREE.Plane, b = [new THREE.Line3, new THREE.Line3, new THREE.Line3], c = new THREE.Vector3, d = new THREE.Vector3);
                var g = f || new THREE.Vector3,
                    h = 1 / 0;
                if (a.setFromCoplanarPoints(this.a, this.b, this.c), a.projectPoint(e, c), !0 === this.containsPoint(c)) g.copy(c);
                else {
                    b[0].set(this.a, this.b), b[1].set(this.b, this.c), b[2].set(this.c, this.a);
                    for (var i = 0; i < b.length; i++) {
                        b[i].closestPointToPoint(c, !0, d);
                        var j = c.distanceToSquared(d);
                        h > j && (h = j, g.copy(d))
                    }
                }
                return g
            }
        }(),
        equals: function(a) {
            return a.a.equals(this.a) && a.b.equals(this.b) && a.c.equals(this.c)
        }
    }, THREE.Interpolant = function(a, b, c, d) {
        this.parameterPositions = a, this._cachedIndex = 0, this.resultBuffer = void 0 !== d ? d : new b.constructor(c), this.sampleValues = b, this.valueSize = c
    }, THREE.Interpolant.prototype = {
        constructor: THREE.Interpolant,
        evaluate: function(a) {
            var b = this.parameterPositions,
                c = this._cachedIndex,
                d = b[c],
                e = b[c - 1];
            a: {
                b: {
                    c: {
                        d: if (!(d > a)) {
                            for (var f = c + 2;;) {
                                if (void 0 === d) {
                                    if (e > a) break d;
                                    return this._cachedIndex = c = b.length, this.afterEnd_(c - 1, a, e)
                                }
                                if (c === f) break;
                                if (e = d, d = b[++c], d > a) break b
                            }
                            d = b.length;
                            break c
                        }if (a >= e) break a;
                        for (f = b[1], f > a && (c = 2, e = f), f = c - 2;;) {
                            if (void 0 === e) return this._cachedIndex = 0, this.beforeStart_(0, a, d);
                            if (c === f) break;
                            if (d = e, e = b[--c - 1],
                                a >= e) break b
                        }
                        d = c,
                        c = 0
                    }
                    for (; d > c;) e = c + d >>> 1,
                    a < b[e] ? d = e : c = e + 1;
                    if (d = b[c], e = b[c - 1], void 0 === e) return this._cachedIndex = 0, this.beforeStart_(0, a, d);
                    if (void 0 === d) return this._cachedIndex = c = b.length, this.afterEnd_(c - 1, e, a)
                }
                this._cachedIndex = c,
                this.intervalChanged_(c, e, d)
            }
            return this.interpolate_(c, e, a, d)
        },
        settings: null,
        DefaultSettings_: {},
        getSettings_: function() {
            return this.settings || this.DefaultSettings_
        },
        copySampleValue_: function(a) {
            var b = this.resultBuffer,
                c = this.sampleValues,
                d = this.valueSize;
            a *= d;
            for (var e = 0; e !== d; ++e) b[e] = c[a + e];
            return b
        },
        interpolate_: function(a, b, c, d) {
            throw Error("call to abstract method")
        },
        intervalChanged_: function(a, b, c) {}
    }, Object.assign(THREE.Interpolant.prototype, {
        beforeStart_: THREE.Interpolant.prototype.copySampleValue_,
        afterEnd_: THREE.Interpolant.prototype.copySampleValue_
    }), THREE.CubicInterpolant = function(a, b, c, d) {
        THREE.Interpolant.call(this, a, b, c, d), this._offsetNext = this._weightNext = this._offsetPrev = this._weightPrev = -0
    }, THREE.CubicInterpolant.prototype = Object.assign(Object.create(THREE.Interpolant.prototype), {
        constructor: THREE.CubicInterpolant,
        DefaultSettings_: {
            endingStart: THREE.ZeroCurvatureEnding,
            endingEnd: THREE.ZeroCurvatureEnding
        },
        intervalChanged_: function(a, b, c) {
            var d = this.parameterPositions,
                e = a - 2,
                f = a + 1,
                g = d[e],
                h = d[f];
            if (void 0 === g) switch (this.getSettings_().endingStart) {
                case THREE.ZeroSlopeEnding:
                    e = a, g = 2 * b - c;
                    break;
                case THREE.WrapAroundEnding:
                    e = d.length - 2, g = b + d[e] - d[e + 1];
                    break;
                default:
                    e = a, g = c
            }
            if (void 0 === h) switch (this.getSettings_().endingEnd) {
                case THREE.ZeroSlopeEnding:
                    f = a, h = 2 * c - b;
                    break;
                case THREE.WrapAroundEnding:
                    f = 1, h = c + d[1] - d[0];
                    break;
                default:
                    f = a - 1, h = b
            }
            a = .5 * (c - b), d = this.valueSize, this._weightPrev = a / (b - g), this._weightNext = a / (h - c), this._offsetPrev = e * d, this._offsetNext = f * d
        },
        interpolate_: function(a, b, c, d) {
            var e = this.resultBuffer,
                f = this.sampleValues,
                g = this.valueSize;
            a *= g;
            var h = a - g,
                i = this._offsetPrev,
                j = this._offsetNext,
                k = this._weightPrev,
                l = this._weightNext,
                m = (c - b) / (d - b);
            for (c = m * m, d = c * m, b = -k * d + 2 * k * c - k * m, k = (1 + k) * d + (-1.5 - 2 * k) * c + (-.5 + k) * m + 1, m = (-1 - l) * d + (1.5 + l) * c + .5 * m, l = l * d - l * c, c = 0; c !== g; ++c) e[c] = b * f[i + c] + k * f[h + c] + m * f[a + c] + l * f[j + c];
            return e
        }
    }), THREE.DiscreteInterpolant = function(a, b, c, d) {
        THREE.Interpolant.call(this, a, b, c, d)
    }, THREE.DiscreteInterpolant.prototype = Object.assign(Object.create(THREE.Interpolant.prototype), {
        constructor: THREE.DiscreteInterpolant,
        interpolate_: function(a, b, c, d) {
            return this.copySampleValue_(a - 1)
        }
    }), THREE.LinearInterpolant = function(a, b, c, d) {
        THREE.Interpolant.call(this, a, b, c, d)
    }, THREE.LinearInterpolant.prototype = Object.assign(Object.create(THREE.Interpolant.prototype), {
        constructor: THREE.LinearInterpolant,
        interpolate_: function(a, b, c, d) {
            var e = this.resultBuffer,
                f = this.sampleValues,
                g = this.valueSize;
            a *= g;
            var h = a - g;
            for (b = (c - b) / (d - b), c = 1 - b, d = 0; d !== g; ++d) e[d] = f[h + d] * c + f[a + d] * b;
            return e
        }
    }), THREE.QuaternionLinearInterpolant = function(a, b, c, d) {
        THREE.Interpolant.call(this, a, b, c, d)
    }, THREE.QuaternionLinearInterpolant.prototype = Object.assign(Object.create(THREE.Interpolant.prototype), {
        constructor: THREE.QuaternionLinearInterpolant,
        interpolate_: function(a, b, c, d) {
            var e = this.resultBuffer,
                f = this.sampleValues,
                g = this.valueSize;
            for (a *= g, b = (c - b) / (d - b), c = a + g; a !== c; a += 4) THREE.Quaternion.slerpFlat(e, 0, f, a - g, f, a, b);
            return e
        }
    }), THREE.Clock = function(a) {
        this.autoStart = void 0 !== a ? a : !0, this.elapsedTime = this.oldTime = this.startTime = 0, this.running = !1
    }, THREE.Clock.prototype = {
        constructor: THREE.Clock,
        start: function() {
            this.oldTime = this.startTime = (performance || Date).now(), this.running = !0
        },
        stop: function() {
            this.getElapsedTime(), this.running = !1
        },
        getElapsedTime: function() {
            return this.getDelta(), this.elapsedTime
        },
        getDelta: function() {
            var a = 0;
            if (this.autoStart && !this.running && this.start(), this.running) {
                var b = (performance || Date).now(),
                    a = (b - this.oldTime) / 1e3;
                this.oldTime = b, this.elapsedTime += a
            }
            return a
        }
    }, THREE.EventDispatcher = function() {}, Object.assign(THREE.EventDispatcher.prototype, {
        addEventListener: function(a, b) {
            void 0 === this._listeners && (this._listeners = {});
            var c = this._listeners;
            void 0 === c[a] && (c[a] = []), -1 === c[a].indexOf(b) && c[a].push(b)
        },
        hasEventListener: function(a, b) {
            if (void 0 === this._listeners) return !1;
            var c = this._listeners;
            return void 0 !== c[a] && -1 !== c[a].indexOf(b) ? !0 : !1
        },
        removeEventListener: function(a, b) {
            if (void 0 !== this._listeners) {
                var c = this._listeners[a];
                if (void 0 !== c) {
                    var d = c.indexOf(b); - 1 !== d && c.splice(d, 1)
                }
            }
        },
        dispatchEvent: function(a) {
            if (void 0 !== this._listeners) {
                var b = this._listeners[a.type];
                if (void 0 !== b) {
                    a.target = this;
                    for (var c = [], d = 0, e = b.length, d = 0; e > d; d++) c[d] = b[d];
                    for (d = 0; e > d; d++) c[d].call(this, a)
                }
            }
        }
    }), THREE.Layers = function() {
        this.mask = 1
    }, THREE.Layers.prototype = {
        constructor: THREE.Layers,
        set: function(a) {
            this.mask = 1 << a
        },
        enable: function(a) {
            this.mask |= 1 << a
        },
        toggle: function(a) {
            this.mask ^= 1 << a
        },
        disable: function(a) {
            this.mask &= ~(1 << a)
        },
        test: function(a) {
            return 0 !== (this.mask & a.mask)
        }
    },
    function(a) {
        function b(a, b) {
            return a.distance - b.distance
        }

        function c(a, b, d, e) {
            if (!1 !== a.visible && (a.raycast(b, d), !0 === e)) {
                a = a.children, e = 0;
                for (var f = a.length; f > e; e++) c(a[e], b, d, !0)
            }
        }
        a.Raycaster = function(b, c, d, e) {
            this.ray = new a.Ray(b, c), this.near = d || 0, this.far = e || 1 / 0, this.params = {
                Mesh: {},
                Line: {},
                LOD: {},
                Points: {
                    threshold: 1
                },
                Sprite: {}
            }, Object.defineProperties(this.params, {
                PointCloud: {
                    get: function() {
                        return console.warn("THREE.Raycaster: params.PointCloud has been renamed to params.Points."), this.Points
                    }
                }
            })
        }, a.Raycaster.prototype = {
            constructor: a.Raycaster,
            linePrecision: 1,
            set: function(a, b) {
                this.ray.set(a, b)
            },
            setFromCamera: function(b, c) {
                c instanceof a.PerspectiveCamera ? (this.ray.origin.setFromMatrixPosition(c.matrixWorld), this.ray.direction.set(b.x, b.y, .5).unproject(c).sub(this.ray.origin).normalize()) : c instanceof a.OrthographicCamera ? (this.ray.origin.set(b.x, b.y, (c.near + c.far) / (c.near - c.far)).unproject(c), this.ray.direction.set(0, 0, -1).transformDirection(c.matrixWorld)) : console.error("THREE.Raycaster: Unsupported camera type.")
            },
            intersectObject: function(a, d) {
                var e = [];
                return c(a, this, e, d), e.sort(b), e
            },
            intersectObjects: function(a, d) {
                var e = [];
                if (!1 === Array.isArray(a)) return console.warn("THREE.Raycaster.intersectObjects: objects is not an Array."), e;
                for (var f = 0, g = a.length; g > f; f++) c(a[f], this, e, d);
                return e.sort(b), e
            }
        }
    }(THREE), THREE.Object3D = function() {
        Object.defineProperty(this, "id", {
            value: THREE.Object3DIdCount++
        }), this.uuid = THREE.Math.generateUUID(), this.name = "", this.type = "Object3D", this.parent = null, this.children = [], this.up = THREE.Object3D.DefaultUp.clone();
        var a = new THREE.Vector3,
            b = new THREE.Euler,
            c = new THREE.Quaternion,
            d = new THREE.Vector3(1, 1, 1);
        b.onChange(function() {
            c.setFromEuler(b, !1)
        }), c.onChange(function() {
            b.setFromQuaternion(c, void 0, !1)
        }), Object.defineProperties(this, {
            position: {
                enumerable: !0,
                value: a
            },
            rotation: {
                enumerable: !0,
                value: b
            },
            quaternion: {
                enumerable: !0,
                value: c
            },
            scale: {
                enumerable: !0,
                value: d
            },
            modelViewMatrix: {
                value: new THREE.Matrix4
            },
            normalMatrix: {
                value: new THREE.Matrix3
            }
        }), this.matrix = new THREE.Matrix4, this.matrixWorld = new THREE.Matrix4, this.matrixAutoUpdate = THREE.Object3D.DefaultMatrixAutoUpdate, this.matrixWorldNeedsUpdate = !1, this.layers = new THREE.Layers, this.visible = !0, this.receiveShadow = this.castShadow = !1, this.frustumCulled = !0, this.renderOrder = 0, this.userData = {}
    }, THREE.Object3D.DefaultUp = new THREE.Vector3(0, 1, 0), THREE.Object3D.DefaultMatrixAutoUpdate = !0, Object.assign(THREE.Object3D.prototype, THREE.EventDispatcher.prototype, {
        applyMatrix: function(a) {
            this.matrix.multiplyMatrices(a, this.matrix), this.matrix.decompose(this.position, this.quaternion, this.scale)
        },
        setRotationFromAxisAngle: function(a, b) {
            this.quaternion.setFromAxisAngle(a, b)
        },
        setRotationFromEuler: function(a) {
            this.quaternion.setFromEuler(a, !0)
        },
        setRotationFromMatrix: function(a) {
            this.quaternion.setFromRotationMatrix(a)
        },
        setRotationFromQuaternion: function(a) {
            this.quaternion.copy(a)
        },
        rotateOnAxis: function() {
            var a = new THREE.Quaternion;
            return function(b, c) {
                return a.setFromAxisAngle(b, c), this.quaternion.multiply(a), this
            }
        }(),
        rotateX: function() {
            var a = new THREE.Vector3(1, 0, 0);
            return function(b) {
                return this.rotateOnAxis(a, b)
            }
        }(),
        rotateY: function() {
            var a = new THREE.Vector3(0, 1, 0);
            return function(b) {
                return this.rotateOnAxis(a, b)
            }
        }(),
        rotateZ: function() {
            var a = new THREE.Vector3(0, 0, 1);
            return function(b) {
                return this.rotateOnAxis(a, b)
            }
        }(),
        translateOnAxis: function() {
            var a = new THREE.Vector3;
            return function(b, c) {
                return a.copy(b).applyQuaternion(this.quaternion), this.position.add(a.multiplyScalar(c)), this
            }
        }(),
        translateX: function() {
            var a = new THREE.Vector3(1, 0, 0);
            return function(b) {
                return this.translateOnAxis(a, b)
            }
        }(),
        translateY: function() {
            var a = new THREE.Vector3(0, 1, 0);
            return function(b) {
                return this.translateOnAxis(a, b)
            }
        }(),
        translateZ: function() {
            var a = new THREE.Vector3(0, 0, 1);
            return function(b) {
                return this.translateOnAxis(a, b)
            }
        }(),
        localToWorld: function(a) {
            return a.applyMatrix4(this.matrixWorld)
        },
        worldToLocal: function() {
            var a = new THREE.Matrix4;
            return function(b) {
                return b.applyMatrix4(a.getInverse(this.matrixWorld))
            }
        }(),
        lookAt: function() {
            var a = new THREE.Matrix4;
            return function(b) {
                a.lookAt(b, this.position, this.up), this.quaternion.setFromRotationMatrix(a)
            }
        }(),
        add: function(a) {
            if (1 < arguments.length) {
                for (var b = 0; b < arguments.length; b++) this.add(arguments[b]);
                return this
            }
            return a === this ? (console.error("THREE.Object3D.add: object can't be added as a child of itself.", a), this) : (a instanceof THREE.Object3D ? (null !== a.parent && a.parent.remove(a), a.parent = this, a.dispatchEvent({
                type: "added"
            }), this.children.push(a)) : console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.", a), this)
        },
        remove: function(a) {
            if (1 < arguments.length)
                for (var b = 0; b < arguments.length; b++) this.remove(arguments[b]);
            b = this.children.indexOf(a), -1 !== b && (a.parent = null, a.dispatchEvent({
                type: "removed"
            }), this.children.splice(b, 1))
        },
        getObjectById: function(a) {
            return this.getObjectByProperty("id", a)
        },
        getObjectByName: function(a) {
            return this.getObjectByProperty("name", a)
        },
        getObjectByProperty: function(a, b) {
            if (this[a] === b) return this;
            for (var c = 0, d = this.children.length; d > c; c++) {
                var e = this.children[c].getObjectByProperty(a, b);
                if (void 0 !== e) return e
            }
        },
        getWorldPosition: function(a) {
            return a = a || new THREE.Vector3, this.updateMatrixWorld(!0), a.setFromMatrixPosition(this.matrixWorld)
        },
        getWorldQuaternion: function() {
            var a = new THREE.Vector3,
                b = new THREE.Vector3;
            return function(c) {
                return c = c || new THREE.Quaternion, this.updateMatrixWorld(!0), this.matrixWorld.decompose(a, c, b), c
            }
        }(),
        getWorldRotation: function() {
            var a = new THREE.Quaternion;
            return function(b) {
                return b = b || new THREE.Euler, this.getWorldQuaternion(a), b.setFromQuaternion(a, this.rotation.order, !1)
            }
        }(),
        getWorldScale: function() {
            var a = new THREE.Vector3,
                b = new THREE.Quaternion;
            return function(c) {
                return c = c || new THREE.Vector3, this.updateMatrixWorld(!0), this.matrixWorld.decompose(a, b, c), c
            }
        }(),
        getWorldDirection: function() {
            var a = new THREE.Quaternion;
            return function(b) {
                return b = b || new THREE.Vector3, this.getWorldQuaternion(a), b.set(0, 0, 1).applyQuaternion(a)
            }
        }(),
        raycast: function() {},
        traverse: function(a) {
            a(this);
            for (var b = this.children, c = 0, d = b.length; d > c; c++) b[c].traverse(a)
        },
        traverseVisible: function(a) {
            if (!1 !== this.visible) {
                a(this);
                for (var b = this.children, c = 0, d = b.length; d > c; c++) b[c].traverseVisible(a)
            }
        },
        traverseAncestors: function(a) {
            var b = this.parent;
            null !== b && (a(b), b.traverseAncestors(a))
        },
        updateMatrix: function() {
            this.matrix.compose(this.position, this.quaternion, this.scale), this.matrixWorldNeedsUpdate = !0
        },
        updateMatrixWorld: function(a) {
            !0 === this.matrixAutoUpdate && this.updateMatrix(), (!0 === this.matrixWorldNeedsUpdate || !0 === a) && (null === this.parent ? this.matrixWorld.copy(this.matrix) : this.matrixWorld.multiplyMatrices(this.parent.matrixWorld, this.matrix), this.matrixWorldNeedsUpdate = !1, a = !0);
            for (var b = 0, c = this.children.length; c > b; b++) this.children[b].updateMatrixWorld(a)
        },
        toJSON: function(a) {
            function b(a) {
                var b, c = [];
                for (b in a) {
                    var d = a[b];
                    delete d.metadata, c.push(d)
                }
                return c
            }
            var c = void 0 === a || "" === a,
                d = {};
            c && (a = {
                geometries: {},
                materials: {},
                textures: {},
                images: {}
            }, d.metadata = {
                version: 4.4,
                type: "Object",
                generator: "Object3D.toJSON"
            });
            var e = {};
            if (e.uuid = this.uuid, e.type = this.type, "" !== this.name && (e.name = this.name), "{}" !== JSON.stringify(this.userData) && (e.userData = this.userData), !0 === this.castShadow && (e.castShadow = !0), !0 === this.receiveShadow && (e.receiveShadow = !0), !1 === this.visible && (e.visible = !1), e.matrix = this.matrix.toArray(), void 0 !== this.geometry && (void 0 === a.geometries[this.geometry.uuid] && (a.geometries[this.geometry.uuid] = this.geometry.toJSON(a)), e.geometry = this.geometry.uuid), void 0 !== this.material && (void 0 === a.materials[this.material.uuid] && (a.materials[this.material.uuid] = this.material.toJSON(a)), e.material = this.material.uuid), 0 < this.children.length) {
                e.children = [];
                for (var f = 0; f < this.children.length; f++) e.children.push(this.children[f].toJSON(a).object)
            }
            if (c) {
                var c = b(a.geometries),
                    f = b(a.materials),
                    g = b(a.textures);
                a = b(a.images), 0 < c.length && (d.geometries = c), 0 < f.length && (d.materials = f), 0 < g.length && (d.textures = g), 0 < a.length && (d.images = a)
            }
            return d.object = e, d
        },
        clone: function(a) {
            return (new this.constructor).copy(this, a)
        },
        copy: function(a, b) {
            if (void 0 === b && (b = !0), this.name = a.name, this.up.copy(a.up), this.position.copy(a.position), this.quaternion.copy(a.quaternion), this.scale.copy(a.scale), this.matrix.copy(a.matrix), this.matrixWorld.copy(a.matrixWorld), this.matrixAutoUpdate = a.matrixAutoUpdate, this.matrixWorldNeedsUpdate = a.matrixWorldNeedsUpdate, this.visible = a.visible, this.castShadow = a.castShadow, this.receiveShadow = a.receiveShadow, this.frustumCulled = a.frustumCulled, this.renderOrder = a.renderOrder, this.userData = JSON.parse(JSON.stringify(a.userData)), !0 === b)
                for (var c = 0; c < a.children.length; c++) this.add(a.children[c].clone());
            return this
        }
    }), THREE.Object3DIdCount = 0, THREE.Face3 = function(a, b, c, d, e, f) {
        this.a = a, this.b = b, this.c = c, this.normal = d instanceof THREE.Vector3 ? d : new THREE.Vector3, this.vertexNormals = Array.isArray(d) ? d : [], this.color = e instanceof THREE.Color ? e : new THREE.Color, this.vertexColors = Array.isArray(e) ? e : [], this.materialIndex = void 0 !== f ? f : 0
    }, THREE.Face3.prototype = {
        constructor: THREE.Face3,
        clone: function() {
            return (new this.constructor).copy(this)
        },
        copy: function(a) {
            this.a = a.a, this.b = a.b, this.c = a.c, this.normal.copy(a.normal), this.color.copy(a.color), this.materialIndex = a.materialIndex;
            for (var b = 0, c = a.vertexNormals.length; c > b; b++) this.vertexNormals[b] = a.vertexNormals[b].clone();
            for (b = 0, c = a.vertexColors.length; c > b; b++) this.vertexColors[b] = a.vertexColors[b].clone();
            return this
        }
    }, THREE.BufferAttribute = function(a, b, c) {
        this.uuid = THREE.Math.generateUUID(), this.array = a, this.itemSize = b, this.dynamic = !1, this.updateRange = {
            offset: 0,
            count: -1
        }, this.version = 0, this.normalized = !0 === c
    }, THREE.BufferAttribute.prototype = {
        constructor: THREE.BufferAttribute,
        get count() {
            return this.array.length / this.itemSize
        },
        set needsUpdate(a) {
            !0 === a && this.version++
        },
        setDynamic: function(a) {
            return this.dynamic = a, this
        },
        copy: function(a) {
            return this.array = new a.array.constructor(a.array), this.itemSize = a.itemSize, this.dynamic = a.dynamic, this
        },
        copyAt: function(a, b, c) {
            a *= this.itemSize, c *= b.itemSize;
            for (var d = 0, e = this.itemSize; e > d; d++) this.array[a + d] = b.array[c + d];
            return this
        },
        copyArray: function(a) {
            return this.array.set(a), this
        },
        copyColorsArray: function(a) {
            for (var b = this.array, c = 0, d = 0, e = a.length; e > d; d++) {
                var f = a[d];
                void 0 === f && (console.warn("THREE.BufferAttribute.copyColorsArray(): color is undefined", d), f = new THREE.Color), b[c++] = f.r, b[c++] = f.g, b[c++] = f.b
            }
            return this
        },
        copyIndicesArray: function(a) {
            for (var b = this.array, c = 0, d = 0, e = a.length; e > d; d++) {
                var f = a[d];
                b[c++] = f.a, b[c++] = f.b, b[c++] = f.c
            }
            return this
        },
        copyVector2sArray: function(a) {
            for (var b = this.array, c = 0, d = 0, e = a.length; e > d; d++) {
                var f = a[d];
                void 0 === f && (console.warn("THREE.BufferAttribute.copyVector2sArray(): vector is undefined", d), f = new THREE.Vector2), b[c++] = f.x, b[c++] = f.y
            }
            return this
        },
        copyVector3sArray: function(a) {
            for (var b = this.array, c = 0, d = 0, e = a.length; e > d; d++) {
                var f = a[d];
                void 0 === f && (console.warn("THREE.BufferAttribute.copyVector3sArray(): vector is undefined", d), f = new THREE.Vector3), b[c++] = f.x, b[c++] = f.y, b[c++] = f.z
            }
            return this
        },
        copyVector4sArray: function(a) {
            for (var b = this.array, c = 0, d = 0, e = a.length; e > d; d++) {
                var f = a[d];
                void 0 === f && (console.warn("THREE.BufferAttribute.copyVector4sArray(): vector is undefined", d), f = new THREE.Vector4), b[c++] = f.x, b[c++] = f.y, b[c++] = f.z, b[c++] = f.w
            }
            return this
        },
        set: function(a, b) {
            return void 0 === b && (b = 0), this.array.set(a, b), this
        },
        getX: function(a) {
            return this.array[a * this.itemSize]
        },
        setX: function(a, b) {
            return this.array[a * this.itemSize] = b, this
        },
        getY: function(a) {
            return this.array[a * this.itemSize + 1]
        },
        setY: function(a, b) {
            return this.array[a * this.itemSize + 1] = b, this
        },
        getZ: function(a) {
            return this.array[a * this.itemSize + 2]
        },
        setZ: function(a, b) {
            return this.array[a * this.itemSize + 2] = b, this
        },
        getW: function(a) {
            return this.array[a * this.itemSize + 3]
        },
        setW: function(a, b) {
            return this.array[a * this.itemSize + 3] = b, this
        },
        setXY: function(a, b, c) {
            return a *= this.itemSize, this.array[a + 0] = b, this.array[a + 1] = c, this
        },
        setXYZ: function(a, b, c, d) {
            return a *= this.itemSize, this.array[a + 0] = b, this.array[a + 1] = c, this.array[a + 2] = d, this
        },
        setXYZW: function(a, b, c, d, e) {
            return a *= this.itemSize, this.array[a + 0] = b, this.array[a + 1] = c, this.array[a + 2] = d, this.array[a + 3] = e, this
        },
        clone: function() {
            return (new this.constructor).copy(this)
        }
    }, THREE.Int8Attribute = function(a, b) {
        return new THREE.BufferAttribute(new Int8Array(a), b)
    }, THREE.Uint8Attribute = function(a, b) {
        return new THREE.BufferAttribute(new Uint8Array(a), b)
    }, THREE.Uint8ClampedAttribute = function(a, b) {
        return new THREE.BufferAttribute(new Uint8ClampedArray(a), b)
    }, THREE.Int16Attribute = function(a, b) {
        return new THREE.BufferAttribute(new Int16Array(a), b)
    }, THREE.Uint16Attribute = function(a, b) {
        return new THREE.BufferAttribute(new Uint16Array(a), b)
    }, THREE.Int32Attribute = function(a, b) {
        return new THREE.BufferAttribute(new Int32Array(a), b)
    }, THREE.Uint32Attribute = function(a, b) {
        return new THREE.BufferAttribute(new Uint32Array(a), b)
    }, THREE.Float32Attribute = function(a, b) {
        return new THREE.BufferAttribute(new Float32Array(a), b)
    }, THREE.Float64Attribute = function(a, b) {
        return new THREE.BufferAttribute(new Float64Array(a), b)
    }, THREE.DynamicBufferAttribute = function(a, b) {
        return console.warn("THREE.DynamicBufferAttribute has been removed. Use new THREE.BufferAttribute().setDynamic( true ) instead."), new THREE.BufferAttribute(a, b).setDynamic(!0)
    }, THREE.InstancedBufferAttribute = function(a, b, c) {
        THREE.BufferAttribute.call(this, a, b), this.meshPerAttribute = c || 1
    }, THREE.InstancedBufferAttribute.prototype = Object.create(THREE.BufferAttribute.prototype), THREE.InstancedBufferAttribute.prototype.constructor = THREE.InstancedBufferAttribute, THREE.InstancedBufferAttribute.prototype.copy = function(a) {
        return THREE.BufferAttribute.prototype.copy.call(this, a), this.meshPerAttribute = a.meshPerAttribute, this
    }, THREE.InterleavedBuffer = function(a, b) {
        this.uuid = THREE.Math.generateUUID(), this.array = a, this.stride = b, this.dynamic = !1, this.updateRange = {
            offset: 0,
            count: -1
        }, this.version = 0
    }, THREE.InterleavedBuffer.prototype = {
        constructor: THREE.InterleavedBuffer,
        get length() {
            return this.array.length
        },
        get count() {
            return this.array.length / this.stride
        },
        set needsUpdate(a) {
            !0 === a && this.version++
        },
        setDynamic: function(a) {
            return this.dynamic = a, this
        },
        copy: function(a) {
            return this.array = new a.array.constructor(a.array), this.stride = a.stride, this.dynamic = a.dynamic, this
        },
        copyAt: function(a, b, c) {
            a *= this.stride, c *= b.stride;
            for (var d = 0, e = this.stride; e > d; d++) this.array[a + d] = b.array[c + d];
            return this
        },
        set: function(a, b) {
            return void 0 === b && (b = 0), this.array.set(a, b), this
        },
        clone: function() {
            return (new this.constructor).copy(this)
        }
    }, THREE.InstancedInterleavedBuffer = function(a, b, c) {
        THREE.InterleavedBuffer.call(this, a, b), this.meshPerAttribute = c || 1
    }, THREE.InstancedInterleavedBuffer.prototype = Object.create(THREE.InterleavedBuffer.prototype), THREE.InstancedInterleavedBuffer.prototype.constructor = THREE.InstancedInterleavedBuffer, THREE.InstancedInterleavedBuffer.prototype.copy = function(a) {
        return THREE.InterleavedBuffer.prototype.copy.call(this, a), this.meshPerAttribute = a.meshPerAttribute, this
    }, THREE.InterleavedBufferAttribute = function(a, b, c, d) {
        this.uuid = THREE.Math.generateUUID(), this.data = a, this.itemSize = b, this.offset = c, this.normalized = !0 === d
    }, THREE.InterleavedBufferAttribute.prototype = {
        constructor: THREE.InterleavedBufferAttribute,
        get length() {
            return console.warn("THREE.BufferAttribute: .length has been deprecated. Please use .count."), this.array.length
        },
        get count() {
            return this.data.count
        },
        get array() {
            return this.data.array
        },
        setX: function(a, b) {
            return this.data.array[a * this.data.stride + this.offset] = b, this
        },
        setY: function(a, b) {
            return this.data.array[a * this.data.stride + this.offset + 1] = b, this
        },
        setZ: function(a, b) {
            return this.data.array[a * this.data.stride + this.offset + 2] = b, this
        },
        setW: function(a, b) {
            return this.data.array[a * this.data.stride + this.offset + 3] = b, this
        },
        getX: function(a) {
            return this.data.array[a * this.data.stride + this.offset]
        },
        getY: function(a) {
            return this.data.array[a * this.data.stride + this.offset + 1]
        },
        getZ: function(a) {
            return this.data.array[a * this.data.stride + this.offset + 2]
        },
        getW: function(a) {
            return this.data.array[a * this.data.stride + this.offset + 3]
        },
        setXY: function(a, b, c) {
            return a = a * this.data.stride + this.offset, this.data.array[a + 0] = b, this.data.array[a + 1] = c, this
        },
        setXYZ: function(a, b, c, d) {
            return a = a * this.data.stride + this.offset, this.data.array[a + 0] = b, this.data.array[a + 1] = c, this.data.array[a + 2] = d, this
        },
        setXYZW: function(a, b, c, d, e) {
            return a = a * this.data.stride + this.offset, this.data.array[a + 0] = b, this.data.array[a + 1] = c, this.data.array[a + 2] = d, this.data.array[a + 3] = e, this
        }
    }, THREE.Geometry = function() {
        Object.defineProperty(this, "id", {
            value: THREE.GeometryIdCount++
        }), this.uuid = THREE.Math.generateUUID(), this.name = "", this.type = "Geometry", this.vertices = [], this.colors = [], this.faces = [], this.faceVertexUvs = [
            []
        ], this.morphTargets = [], this.morphNormals = [], this.skinWeights = [], this.skinIndices = [], this.lineDistances = [], this.boundingSphere = this.boundingBox = null, this.groupsNeedUpdate = this.lineDistancesNeedUpdate = this.colorsNeedUpdate = this.normalsNeedUpdate = this.uvsNeedUpdate = this.verticesNeedUpdate = this.elementsNeedUpdate = !1
    }, Object.assign(THREE.Geometry.prototype, THREE.EventDispatcher.prototype, {
        applyMatrix: function(a) {
            for (var b = (new THREE.Matrix3).getNormalMatrix(a), c = 0, d = this.vertices.length; d > c; c++) this.vertices[c].applyMatrix4(a);
            for (c = 0, d = this.faces.length; d > c; c++) {
                a = this.faces[c], a.normal.applyMatrix3(b).normalize();
                for (var e = 0, f = a.vertexNormals.length; f > e; e++) a.vertexNormals[e].applyMatrix3(b).normalize()
            }
            return null !== this.boundingBox && this.computeBoundingBox(), null !== this.boundingSphere && this.computeBoundingSphere(), this.normalsNeedUpdate = this.verticesNeedUpdate = !0, this
        },
        rotateX: function() {
            var a;
            return function(b) {
                return void 0 === a && (a = new THREE.Matrix4), a.makeRotationX(b), this.applyMatrix(a), this
            }
        }(),
        rotateY: function() {
            var a;
            return function(b) {
                return void 0 === a && (a = new THREE.Matrix4), a.makeRotationY(b), this.applyMatrix(a), this
            }
        }(),
        rotateZ: function() {
            var a;
            return function(b) {
                return void 0 === a && (a = new THREE.Matrix4), a.makeRotationZ(b), this.applyMatrix(a), this
            }
        }(),
        translate: function() {
            var a;
            return function(b, c, d) {
                return void 0 === a && (a = new THREE.Matrix4), a.makeTranslation(b, c, d), this.applyMatrix(a), this
            }
        }(),
        scale: function() {
            var a;
            return function(b, c, d) {
                return void 0 === a && (a = new THREE.Matrix4), a.makeScale(b, c, d), this.applyMatrix(a), this
            }
        }(),
        lookAt: function() {
            var a;
            return function(b) {
                void 0 === a && (a = new THREE.Object3D), a.lookAt(b), a.updateMatrix(), this.applyMatrix(a.matrix)
            }
        }(),
        fromBufferGeometry: function(a) {
            function b(a, b, d, e) {
                var f = void 0 !== g ? [k[a].clone(), k[b].clone(), k[d].clone()] : [],
                    n = void 0 !== h ? [c.colors[a].clone(), c.colors[b].clone(), c.colors[d].clone()] : [];
                e = new THREE.Face3(a, b, d, f, n, e), c.faces.push(e), void 0 !== i && c.faceVertexUvs[0].push([l[a].clone(), l[b].clone(), l[d].clone()]), void 0 !== j && c.faceVertexUvs[1].push([m[a].clone(), m[b].clone(), m[d].clone()])
            }
            var c = this,
                d = null !== a.index ? a.index.array : void 0,
                e = a.attributes,
                f = e.position.array,
                g = void 0 !== e.normal ? e.normal.array : void 0,
                h = void 0 !== e.color ? e.color.array : void 0,
                i = void 0 !== e.uv ? e.uv.array : void 0,
                j = void 0 !== e.uv2 ? e.uv2.array : void 0;
            void 0 !== j && (this.faceVertexUvs[1] = []);
            for (var k = [], l = [], m = [], n = e = 0; e < f.length; e += 3, n += 2) c.vertices.push(new THREE.Vector3(f[e], f[e + 1], f[e + 2])), void 0 !== g && k.push(new THREE.Vector3(g[e], g[e + 1], g[e + 2])), void 0 !== h && c.colors.push(new THREE.Color(h[e], h[e + 1], h[e + 2])), void 0 !== i && l.push(new THREE.Vector2(i[n], i[n + 1])), void 0 !== j && m.push(new THREE.Vector2(j[n], j[n + 1]));
            if (void 0 !== d)
                if (f = a.groups, 0 < f.length)
                    for (e = 0; e < f.length; e++)
                        for (var o = f[e], p = o.start, q = o.count, n = p, p = p + q; p > n; n += 3) b(d[n], d[n + 1], d[n + 2], o.materialIndex);
                else
                    for (e = 0; e < d.length; e += 3) b(d[e], d[e + 1], d[e + 2]);
            else
                for (e = 0; e < f.length / 3; e += 3) b(e, e + 1, e + 2);
            return this.computeFaceNormals(), null !== a.boundingBox && (this.boundingBox = a.boundingBox.clone()), null !== a.boundingSphere && (this.boundingSphere = a.boundingSphere.clone()), this
        },
        center: function() {
            this.computeBoundingBox();
            var a = this.boundingBox.center().negate();
            return this.translate(a.x, a.y, a.z), a
        },
        normalize: function() {
            this.computeBoundingSphere();
            var a = this.boundingSphere.center,
                b = this.boundingSphere.radius,
                b = 0 === b ? 1 : 1 / b,
                c = new THREE.Matrix4;
            return c.set(b, 0, 0, -b * a.x, 0, b, 0, -b * a.y, 0, 0, b, -b * a.z, 0, 0, 0, 1), this.applyMatrix(c), this
        },
        computeFaceNormals: function() {
            for (var a = new THREE.Vector3, b = new THREE.Vector3, c = 0, d = this.faces.length; d > c; c++) {
                var e = this.faces[c],
                    f = this.vertices[e.a],
                    g = this.vertices[e.b];
                a.subVectors(this.vertices[e.c], g), b.subVectors(f, g), a.cross(b), a.normalize(), e.normal.copy(a)
            }
        },
        computeVertexNormals: function(a) {
            void 0 === a && (a = !0);
            var b, c, d;
            for (d = Array(this.vertices.length), b = 0, c = this.vertices.length; c > b; b++) d[b] = new THREE.Vector3;
            if (a) {
                var e, f, g, h = new THREE.Vector3,
                    i = new THREE.Vector3;
                for (a = 0, b = this.faces.length; b > a; a++) c = this.faces[a], e = this.vertices[c.a], f = this.vertices[c.b], g = this.vertices[c.c], h.subVectors(g, f), i.subVectors(e, f), h.cross(i), d[c.a].add(h), d[c.b].add(h), d[c.c].add(h)
            } else
                for (a = 0, b = this.faces.length; b > a; a++) c = this.faces[a], d[c.a].add(c.normal), d[c.b].add(c.normal), d[c.c].add(c.normal);
            for (b = 0, c = this.vertices.length; c > b; b++) d[b].normalize();
            for (a = 0, b = this.faces.length; b > a; a++) c = this.faces[a], e = c.vertexNormals, 3 === e.length ? (e[0].copy(d[c.a]), e[1].copy(d[c.b]), e[2].copy(d[c.c])) : (e[0] = d[c.a].clone(), e[1] = d[c.b].clone(), e[2] = d[c.c].clone());
            0 < this.faces.length && (this.normalsNeedUpdate = !0)
        },
        computeMorphNormals: function() {
            var a, b, c, d, e;
            for (c = 0, d = this.faces.length; d > c; c++)
                for (e = this.faces[c], e.__originalFaceNormal ? e.__originalFaceNormal.copy(e.normal) : e.__originalFaceNormal = e.normal.clone(), e.__originalVertexNormals || (e.__originalVertexNormals = []), a = 0, b = e.vertexNormals.length; b > a; a++) e.__originalVertexNormals[a] ? e.__originalVertexNormals[a].copy(e.vertexNormals[a]) : e.__originalVertexNormals[a] = e.vertexNormals[a].clone();
            var f = new THREE.Geometry;
            for (f.faces = this.faces, a = 0, b = this.morphTargets.length; b > a; a++) {
                if (!this.morphNormals[a]) {
                    this.morphNormals[a] = {}, this.morphNormals[a].faceNormals = [], this.morphNormals[a].vertexNormals = [], e = this.morphNormals[a].faceNormals;
                    var g, h, i = this.morphNormals[a].vertexNormals;
                    for (c = 0, d = this.faces.length; d > c; c++) g = new THREE.Vector3, h = {
                        a: new THREE.Vector3,
                        b: new THREE.Vector3,
                        c: new THREE.Vector3
                    }, e.push(g), i.push(h)
                }
                for (i = this.morphNormals[a], f.vertices = this.morphTargets[a].vertices, f.computeFaceNormals(), f.computeVertexNormals(), c = 0, d = this.faces.length; d > c; c++) e = this.faces[c], g = i.faceNormals[c], h = i.vertexNormals[c], g.copy(e.normal), h.a.copy(e.vertexNormals[0]), h.b.copy(e.vertexNormals[1]), h.c.copy(e.vertexNormals[2])
            }
            for (c = 0, d = this.faces.length; d > c; c++) e = this.faces[c], e.normal = e.__originalFaceNormal, e.vertexNormals = e.__originalVertexNormals
        },
        computeTangents: function() {
            console.warn("THREE.Geometry: .computeTangents() has been removed.")
        },
        computeLineDistances: function() {
            for (var a = 0, b = this.vertices, c = 0, d = b.length; d > c; c++) c > 0 && (a += b[c].distanceTo(b[c - 1])), this.lineDistances[c] = a
        },
        computeBoundingBox: function() {
            null === this.boundingBox && (this.boundingBox = new THREE.Box3), this.boundingBox.setFromPoints(this.vertices)
        },
        computeBoundingSphere: function() {
            null === this.boundingSphere && (this.boundingSphere = new THREE.Sphere), this.boundingSphere.setFromPoints(this.vertices)
        },
        merge: function(a, b, c) {
            if (!1 == a instanceof THREE.Geometry) console.error("THREE.Geometry.merge(): geometry not an instance of THREE.Geometry.", a);
            else {
                var d, e = this.vertices.length,
                    f = this.vertices,
                    g = a.vertices,
                    h = this.faces,
                    i = a.faces,
                    j = this.faceVertexUvs[0];
                a = a.faceVertexUvs[0], void 0 === c && (c = 0), void 0 !== b && (d = (new THREE.Matrix3).getNormalMatrix(b));
                for (var k = 0, l = g.length; l > k; k++) {
                    var m = g[k].clone();
                    void 0 !== b && m.applyMatrix4(b), f.push(m)
                }
                for (k = 0, l = i.length; l > k; k++) {
                    var n, g = i[k],
                        o = g.vertexNormals,
                        p = g.vertexColors,
                        m = new THREE.Face3(g.a + e, g.b + e, g.c + e);
                    for (m.normal.copy(g.normal), void 0 !== d && m.normal.applyMatrix3(d).normalize(), b = 0, f = o.length; f > b; b++) n = o[b].clone(), void 0 !== d && n.applyMatrix3(d).normalize(), m.vertexNormals.push(n);
                    for (m.color.copy(g.color), b = 0, f = p.length; f > b; b++) n = p[b], m.vertexColors.push(n.clone());
                    m.materialIndex = g.materialIndex + c, h.push(m)
                }
                for (k = 0, l = a.length; l > k; k++)
                    if (c = a[k], d = [], void 0 !== c) {
                        for (b = 0, f = c.length; f > b; b++) d.push(c[b].clone());
                        j.push(d)
                    }
            }
        },
        mergeMesh: function(a) {
            !1 == a instanceof THREE.Mesh ? console.error("THREE.Geometry.mergeMesh(): mesh not an instance of THREE.Mesh.", a) : (a.matrixAutoUpdate && a.updateMatrix(), this.merge(a.geometry, a.matrix))
        },
        mergeVertices: function() {
            var a, b, c, d = {},
                e = [],
                f = [],
                g = Math.pow(10, 4);
            for (b = 0, c = this.vertices.length; c > b; b++) a = this.vertices[b], a = Math.round(a.x * g) + "_" + Math.round(a.y * g) + "_" + Math.round(a.z * g), void 0 === d[a] ? (d[a] = b, e.push(this.vertices[b]), f[b] = e.length - 1) : f[b] = f[d[a]];
            for (d = [], b = 0, c = this.faces.length; c > b; b++)
                for (g = this.faces[b], g.a = f[g.a], g.b = f[g.b], g.c = f[g.c], g = [g.a, g.b, g.c], a = 0; 3 > a; a++)
                    if (g[a] === g[(a + 1) % 3]) {
                        d.push(b);
                        break
                    }
            for (b = d.length - 1; b >= 0; b--)
                for (g = d[b], this.faces.splice(g, 1), f = 0, c = this.faceVertexUvs.length; c > f; f++) this.faceVertexUvs[f].splice(g, 1);
            return b = this.vertices.length - e.length, this.vertices = e, b
        },
        sortFacesByMaterialIndex: function() {
            for (var a = this.faces, b = a.length, c = 0; b > c; c++) a[c]._id = c;
            a.sort(function(a, b) {
                return a.materialIndex - b.materialIndex
            });
            var d, e, f = this.faceVertexUvs[0],
                g = this.faceVertexUvs[1];
            for (f && f.length === b && (d = []), g && g.length === b && (e = []), c = 0; b > c; c++) {
                var h = a[c]._id;
                d && d.push(f[h]), e && e.push(g[h])
            }
            d && (this.faceVertexUvs[0] = d), e && (this.faceVertexUvs[1] = e)
        },
        toJSON: function() {
            function a(a, b, c) {
                return c ? a | 1 << b : a & ~(1 << b)
            }

            function b(a) {
                var b = a.x.toString() + a.y.toString() + a.z.toString();
                return void 0 !== j[b] ? j[b] : (j[b] = i.length / 3, i.push(a.x, a.y, a.z), j[b])
            }

            function c(a) {
                var b = a.r.toString() + a.g.toString() + a.b.toString();
                return void 0 !== l[b] ? l[b] : (l[b] = k.length, k.push(a.getHex()), l[b])
            }

            function d(a) {
                var b = a.x.toString() + a.y.toString();
                return void 0 !== n[b] ? n[b] : (n[b] = m.length / 2, m.push(a.x, a.y), n[b])
            }
            var e = {
                metadata: {
                    version: 4.4,
                    type: "Geometry",
                    generator: "Geometry.toJSON"
                }
            };
            if (e.uuid = this.uuid, e.type = this.type, "" !== this.name && (e.name = this.name), void 0 !== this.parameters) {
                var f, g = this.parameters;
                for (f in g) void 0 !== g[f] && (e[f] = g[f]);
                return e
            }
            for (g = [], f = 0; f < this.vertices.length; f++) {
                var h = this.vertices[f];
                g.push(h.x, h.y, h.z)
            }
            var h = [],
                i = [],
                j = {},
                k = [],
                l = {},
                m = [],
                n = {};
            for (f = 0; f < this.faces.length; f++) {
                var o = this.faces[f],
                    p = void 0 !== this.faceVertexUvs[0][f],
                    q = 0 < o.normal.length(),
                    r = 0 < o.vertexNormals.length,
                    s = 1 !== o.color.r || 1 !== o.color.g || 1 !== o.color.b,
                    t = 0 < o.vertexColors.length,
                    u = 0,
                    u = a(u, 0, 0),
                    u = a(u, 1, !0),
                    u = a(u, 2, !1),
                    u = a(u, 3, p),
                    u = a(u, 4, q),
                    u = a(u, 5, r),
                    u = a(u, 6, s),
                    u = a(u, 7, t);
                h.push(u), h.push(o.a, o.b, o.c), h.push(o.materialIndex), p && (p = this.faceVertexUvs[0][f], h.push(d(p[0]), d(p[1]), d(p[2]))), q && h.push(b(o.normal)), r && (q = o.vertexNormals, h.push(b(q[0]), b(q[1]), b(q[2]))), s && h.push(c(o.color)), t && (o = o.vertexColors, h.push(c(o[0]), c(o[1]), c(o[2])))
            }
            return e.data = {}, e.data.vertices = g, e.data.normals = i, 0 < k.length && (e.data.colors = k), 0 < m.length && (e.data.uvs = [m]), e.data.faces = h, e
        },
        clone: function() {
            return (new THREE.Geometry).copy(this)
        },
        copy: function(a) {
            this.vertices = [], this.faces = [], this.faceVertexUvs = [
                []
            ];
            for (var b = a.vertices, c = 0, d = b.length; d > c; c++) this.vertices.push(b[c].clone());
            for (b = a.faces, c = 0, d = b.length; d > c; c++) this.faces.push(b[c].clone());
            for (c = 0, d = a.faceVertexUvs.length; d > c; c++) {
                b = a.faceVertexUvs[c], void 0 === this.faceVertexUvs[c] && (this.faceVertexUvs[c] = []);
                for (var e = 0, f = b.length; f > e; e++) {
                    for (var g = b[e], h = [], i = 0, j = g.length; j > i; i++) h.push(g[i].clone());
                    this.faceVertexUvs[c].push(h)
                }
            }
            return this
        },
        dispose: function() {
            this.dispatchEvent({
                type: "dispose"
            })
        }
    }), THREE.GeometryIdCount = 0, THREE.DirectGeometry = function() {
        Object.defineProperty(this, "id", {
            value: THREE.GeometryIdCount++
        }), this.uuid = THREE.Math.generateUUID(), this.name = "", this.type = "DirectGeometry", this.indices = [], this.vertices = [], this.normals = [], this.colors = [], this.uvs = [], this.uvs2 = [], this.groups = [], this.morphTargets = {}, this.skinWeights = [], this.skinIndices = [], this.boundingSphere = this.boundingBox = null, this.groupsNeedUpdate = this.uvsNeedUpdate = this.colorsNeedUpdate = this.normalsNeedUpdate = this.verticesNeedUpdate = !1
    }, Object.assign(THREE.DirectGeometry.prototype, THREE.EventDispatcher.prototype, {
        computeBoundingBox: THREE.Geometry.prototype.computeBoundingBox,
        computeBoundingSphere: THREE.Geometry.prototype.computeBoundingSphere,
        computeFaceNormals: function() {
            console.warn("THREE.DirectGeometry: computeFaceNormals() is not a method of this type of geometry.")
        },
        computeVertexNormals: function() {
            console.warn("THREE.DirectGeometry: computeVertexNormals() is not a method of this type of geometry.")
        },
        computeGroups: function(a) {
            var b, c, d = [];
            a = a.faces;
            for (var e = 0; e < a.length; e++) {
                var f = a[e];
                f.materialIndex !== c && (c = f.materialIndex, void 0 !== b && (b.count = 3 * e - b.start, d.push(b)), b = {
                    start: 3 * e,
                    materialIndex: c
                })
            }
            void 0 !== b && (b.count = 3 * e - b.start, d.push(b)), this.groups = d
        },
        fromGeometry: function(a) {
            var b, c = a.faces,
                d = a.vertices,
                e = a.faceVertexUvs,
                f = e[0] && 0 < e[0].length,
                g = e[1] && 0 < e[1].length,
                h = a.morphTargets,
                i = h.length;
            if (i > 0) {
                b = [];
                for (var j = 0; i > j; j++) b[j] = [];
                this.morphTargets.position = b
            }
            var k, l = a.morphNormals,
                m = l.length;
            if (m > 0) {
                for (k = [], j = 0; m > j; j++) k[j] = [];
                this.morphTargets.normal = k
            }
            for (var n = a.skinIndices, o = a.skinWeights, p = n.length === d.length, q = o.length === d.length, j = 0; j < c.length; j++) {
                var r = c[j];
                this.vertices.push(d[r.a], d[r.b], d[r.c]);
                var s = r.vertexNormals;
                for (3 === s.length ? this.normals.push(s[0], s[1], s[2]) : (s = r.normal, this.normals.push(s, s, s)), s = r.vertexColors, 3 === s.length ? this.colors.push(s[0], s[1], s[2]) : (s = r.color, this.colors.push(s, s, s)), !0 === f && (s = e[0][j], void 0 !== s ? this.uvs.push(s[0], s[1], s[2]) : (console.warn("THREE.DirectGeometry.fromGeometry(): Undefined vertexUv ", j), this.uvs.push(new THREE.Vector2, new THREE.Vector2, new THREE.Vector2))), !0 === g && (s = e[1][j], void 0 !== s ? this.uvs2.push(s[0], s[1], s[2]) : (console.warn("THREE.DirectGeometry.fromGeometry(): Undefined vertexUv2 ", j), this.uvs2.push(new THREE.Vector2, new THREE.Vector2, new THREE.Vector2))), s = 0; i > s; s++) {
                    var t = h[s].vertices;
                    b[s].push(t[r.a], t[r.b], t[r.c])
                }
                for (s = 0; m > s; s++) t = l[s].vertexNormals[j], k[s].push(t.a, t.b, t.c);
                p && this.skinIndices.push(n[r.a], n[r.b], n[r.c]), q && this.skinWeights.push(o[r.a], o[r.b], o[r.c])
            }
            return this.computeGroups(a), this.verticesNeedUpdate = a.verticesNeedUpdate, this.normalsNeedUpdate = a.normalsNeedUpdate, this.colorsNeedUpdate = a.colorsNeedUpdate, this.uvsNeedUpdate = a.uvsNeedUpdate, this.groupsNeedUpdate = a.groupsNeedUpdate, this
        },
        dispose: function() {
            this.dispatchEvent({
                type: "dispose"
            })
        }
    }), THREE.BufferGeometry = function() {
        Object.defineProperty(this, "id", {
            value: THREE.GeometryIdCount++
        }), this.uuid = THREE.Math.generateUUID(), this.name = "", this.type = "BufferGeometry", this.index = null, this.attributes = {}, this.morphAttributes = {}, this.groups = [], this.boundingSphere = this.boundingBox = null, this.drawRange = {
            start: 0,
            count: 1 / 0
        }
    }, Object.assign(THREE.BufferGeometry.prototype, THREE.EventDispatcher.prototype, {
        getIndex: function() {
            return this.index
        },
        setIndex: function(a) {
            this.index = a
        },
        addAttribute: function(a, b, c) {
            if (!1 == b instanceof THREE.BufferAttribute && !1 == b instanceof THREE.InterleavedBufferAttribute) console.warn("THREE.BufferGeometry: .addAttribute() now expects ( name, attribute )."), this.addAttribute(a, new THREE.BufferAttribute(b, c));
            else {
                if ("index" !== a) return this.attributes[a] = b, this;
                console.warn("THREE.BufferGeometry.addAttribute: Use .setIndex() for index attribute."), this.setIndex(b)
            }
        },
        getAttribute: function(a) {
            return this.attributes[a]
        },
        removeAttribute: function(a) {
            return delete this.attributes[a], this
        },
        addGroup: function(a, b, c) {
            this.groups.push({
                start: a,
                count: b,
                materialIndex: void 0 !== c ? c : 0
            })
        },
        clearGroups: function() {
            this.groups = []
        },
        setDrawRange: function(a, b) {
            this.drawRange.start = a, this.drawRange.count = b
        },
        applyMatrix: function(a) {
            var b = this.attributes.position;
            return void 0 !== b && (a.applyToVector3Array(b.array), b.needsUpdate = !0), b = this.attributes.normal, void 0 !== b && ((new THREE.Matrix3).getNormalMatrix(a).applyToVector3Array(b.array), b.needsUpdate = !0), null !== this.boundingBox && this.computeBoundingBox(), null !== this.boundingSphere && this.computeBoundingSphere(), this
        },
        rotateX: function() {
            var a;
            return function(b) {
                return void 0 === a && (a = new THREE.Matrix4), a.makeRotationX(b), this.applyMatrix(a), this
            }
        }(),
        rotateY: function() {
            var a;
            return function(b) {
                return void 0 === a && (a = new THREE.Matrix4), a.makeRotationY(b), this.applyMatrix(a), this
            }
        }(),
        rotateZ: function() {
            var a;
            return function(b) {
                return void 0 === a && (a = new THREE.Matrix4), a.makeRotationZ(b), this.applyMatrix(a), this
            }
        }(),
        translate: function() {
            var a;
            return function(b, c, d) {
                return void 0 === a && (a = new THREE.Matrix4), a.makeTranslation(b, c, d), this.applyMatrix(a), this
            }
        }(),
        scale: function() {
            var a;
            return function(b, c, d) {
                return void 0 === a && (a = new THREE.Matrix4), a.makeScale(b, c, d), this.applyMatrix(a), this
            }
        }(),
        lookAt: function() {
            var a;
            return function(b) {
                void 0 === a && (a = new THREE.Object3D), a.lookAt(b), a.updateMatrix(), this.applyMatrix(a.matrix)
            }
        }(),
        center: function() {
            this.computeBoundingBox();
            var a = this.boundingBox.center().negate();
            return this.translate(a.x, a.y, a.z), a
        },
        setFromObject: function(a) {
            var b = a.geometry;
            if (a instanceof THREE.Points || a instanceof THREE.Line) {
                a = new THREE.Float32Attribute(3 * b.vertices.length, 3);
                var c = new THREE.Float32Attribute(3 * b.colors.length, 3);
                this.addAttribute("position", a.copyVector3sArray(b.vertices)), this.addAttribute("color", c.copyColorsArray(b.colors)), b.lineDistances && b.lineDistances.length === b.vertices.length && (a = new THREE.Float32Attribute(b.lineDistances.length, 1), this.addAttribute("lineDistance", a.copyArray(b.lineDistances))), null !== b.boundingSphere && (this.boundingSphere = b.boundingSphere.clone()), null !== b.boundingBox && (this.boundingBox = b.boundingBox.clone())
            } else a instanceof THREE.Mesh && b instanceof THREE.Geometry && this.fromGeometry(b);
            return this
        },
        updateFromObject: function(a) {
            var b = a.geometry;
            if (a instanceof THREE.Mesh) {
                var c = b.__directGeometry;
                if (void 0 === c || !0 === b.elementsNeedUpdate) return this.fromGeometry(b);
                c.verticesNeedUpdate = b.verticesNeedUpdate || b.elementsNeedUpdate, c.normalsNeedUpdate = b.normalsNeedUpdate || b.elementsNeedUpdate, c.colorsNeedUpdate = b.colorsNeedUpdate || b.elementsNeedUpdate, c.uvsNeedUpdate = b.uvsNeedUpdate || b.elementsNeedUpdate, c.groupsNeedUpdate = b.groupsNeedUpdate || b.elementsNeedUpdate, b.elementsNeedUpdate = !1, b.verticesNeedUpdate = !1, b.normalsNeedUpdate = !1, b.colorsNeedUpdate = !1, b.uvsNeedUpdate = !1, b.groupsNeedUpdate = !1, b = c
            }
            return !0 === b.verticesNeedUpdate && (c = this.attributes.position, void 0 !== c && (c.copyVector3sArray(b.vertices), c.needsUpdate = !0), b.verticesNeedUpdate = !1), !0 === b.normalsNeedUpdate && (c = this.attributes.normal, void 0 !== c && (c.copyVector3sArray(b.normals), c.needsUpdate = !0), b.normalsNeedUpdate = !1), !0 === b.colorsNeedUpdate && (c = this.attributes.color, void 0 !== c && (c.copyColorsArray(b.colors), c.needsUpdate = !0), b.colorsNeedUpdate = !1), b.uvsNeedUpdate && (c = this.attributes.uv, void 0 !== c && (c.copyVector2sArray(b.uvs), c.needsUpdate = !0), b.uvsNeedUpdate = !1), b.lineDistancesNeedUpdate && (c = this.attributes.lineDistance, void 0 !== c && (c.copyArray(b.lineDistances), c.needsUpdate = !0), b.lineDistancesNeedUpdate = !1), b.groupsNeedUpdate && (b.computeGroups(a.geometry), this.groups = b.groups, b.groupsNeedUpdate = !1), this
        },
        fromGeometry: function(a) {
            return a.__directGeometry = (new THREE.DirectGeometry).fromGeometry(a), this.fromDirectGeometry(a.__directGeometry)
        },
        fromDirectGeometry: function(a) {
            var b = new Float32Array(3 * a.vertices.length);
            this.addAttribute("position", new THREE.BufferAttribute(b, 3).copyVector3sArray(a.vertices)), 0 < a.normals.length && (b = new Float32Array(3 * a.normals.length), this.addAttribute("normal", new THREE.BufferAttribute(b, 3).copyVector3sArray(a.normals))), 0 < a.colors.length && (b = new Float32Array(3 * a.colors.length), this.addAttribute("color", new THREE.BufferAttribute(b, 3).copyColorsArray(a.colors))), 0 < a.uvs.length && (b = new Float32Array(2 * a.uvs.length), this.addAttribute("uv", new THREE.BufferAttribute(b, 2).copyVector2sArray(a.uvs))), 0 < a.uvs2.length && (b = new Float32Array(2 * a.uvs2.length), this.addAttribute("uv2", new THREE.BufferAttribute(b, 2).copyVector2sArray(a.uvs2))), 0 < a.indices.length && (b = new(65535 < a.vertices.length ? Uint32Array : Uint16Array)(3 * a.indices.length), this.setIndex(new THREE.BufferAttribute(b, 1).copyIndicesArray(a.indices))), this.groups = a.groups;
            for (var c in a.morphTargets) {
                for (var b = [], d = a.morphTargets[c], e = 0, f = d.length; f > e; e++) {
                    var g = d[e],
                        h = new THREE.Float32Attribute(3 * g.length, 3);
                    b.push(h.copyVector3sArray(g))
                }
                this.morphAttributes[c] = b
            }
            return 0 < a.skinIndices.length && (c = new THREE.Float32Attribute(4 * a.skinIndices.length, 4), this.addAttribute("skinIndex", c.copyVector4sArray(a.skinIndices))), 0 < a.skinWeights.length && (c = new THREE.Float32Attribute(4 * a.skinWeights.length, 4), this.addAttribute("skinWeight", c.copyVector4sArray(a.skinWeights))), null !== a.boundingSphere && (this.boundingSphere = a.boundingSphere.clone()), null !== a.boundingBox && (this.boundingBox = a.boundingBox.clone()), this
        },
        computeBoundingBox: function() {
            null === this.boundingBox && (this.boundingBox = new THREE.Box3);
            var a = this.attributes.position.array;
            void 0 !== a ? this.boundingBox.setFromArray(a) : this.boundingBox.makeEmpty(), (isNaN(this.boundingBox.min.x) || isNaN(this.boundingBox.min.y) || isNaN(this.boundingBox.min.z)) && console.error('THREE.BufferGeometry.computeBoundingBox: Computed min/max have NaN values. The "position" attribute is likely to have NaN values.', this)
        },
        computeBoundingSphere: function() {
            var a = new THREE.Box3,
                b = new THREE.Vector3;
            return function() {
                null === this.boundingSphere && (this.boundingSphere = new THREE.Sphere);
                var c = this.attributes.position;
                if (c) {
                    var c = c.array,
                        d = this.boundingSphere.center;
                    a.setFromArray(c), a.center(d);
                    for (var e = 0, f = 0, g = c.length; g > f; f += 3) b.fromArray(c, f), e = Math.max(e, d.distanceToSquared(b));
                    this.boundingSphere.radius = Math.sqrt(e), isNaN(this.boundingSphere.radius) && console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.', this)
                }
            }
        }(),
        computeFaceNormals: function() {},
        computeVertexNormals: function() {
            var a = this.index,
                b = this.attributes,
                c = this.groups;
            if (b.position) {
                var d = b.position.array;
                if (void 0 === b.normal) this.addAttribute("normal", new THREE.BufferAttribute(new Float32Array(d.length), 3));
                else
                    for (var e = b.normal.array, f = 0, g = e.length; g > f; f++) e[f] = 0;
                var h, i, j, e = b.normal.array,
                    k = new THREE.Vector3,
                    l = new THREE.Vector3,
                    m = new THREE.Vector3,
                    n = new THREE.Vector3,
                    o = new THREE.Vector3;
                if (a) {
                    a = a.array, 0 === c.length && this.addGroup(0, a.length);
                    for (var p = 0, q = c.length; q > p; ++p)
                        for (f = c[p], g = f.start, h = f.count, f = g, g += h; g > f; f += 3) h = 3 * a[f + 0], i = 3 * a[f + 1], j = 3 * a[f + 2], k.fromArray(d, h), l.fromArray(d, i), m.fromArray(d, j), n.subVectors(m, l), o.subVectors(k, l), n.cross(o), e[h] += n.x, e[h + 1] += n.y, e[h + 2] += n.z, e[i] += n.x, e[i + 1] += n.y, e[i + 2] += n.z, e[j] += n.x, e[j + 1] += n.y, e[j + 2] += n.z
                } else
                    for (f = 0, g = d.length; g > f; f += 9) k.fromArray(d, f), l.fromArray(d, f + 3), m.fromArray(d, f + 6), n.subVectors(m, l), o.subVectors(k, l), n.cross(o), e[f] = n.x, e[f + 1] = n.y, e[f + 2] = n.z, e[f + 3] = n.x, e[f + 4] = n.y, e[f + 5] = n.z, e[f + 6] = n.x, e[f + 7] = n.y, e[f + 8] = n.z;
                this.normalizeNormals(), b.normal.needsUpdate = !0
            }
        },
        merge: function(a, b) {
            if (!1 != a instanceof THREE.BufferGeometry) {
                void 0 === b && (b = 0);
                var c, d = this.attributes;
                for (c in d)
                    if (void 0 !== a.attributes[c])
                        for (var e = d[c].array, f = a.attributes[c], g = f.array, h = 0, f = f.itemSize * b; h < g.length; h++, f++) e[f] = g[h];
                return this
            }
            console.error("THREE.BufferGeometry.merge(): geometry not an instance of THREE.BufferGeometry.", a)
        },
        normalizeNormals: function() {
            for (var a, b, c, d = this.attributes.normal.array, e = 0, f = d.length; f > e; e += 3) a = d[e], b = d[e + 1], c = d[e + 2], a = 1 / Math.sqrt(a * a + b * b + c * c), d[e] *= a, d[e + 1] *= a, d[e + 2] *= a
        },
        toNonIndexed: function() {
            if (null === this.index) return console.warn("THREE.BufferGeometry.toNonIndexed(): Geometry is already non-indexed."), this;
            var a, b = new THREE.BufferGeometry,
                c = this.index.array,
                d = this.attributes;
            for (a in d) {
                for (var e = d[a], f = e.array, e = e.itemSize, g = new f.constructor(c.length * e), h = 0, i = 0, j = 0, k = c.length; k > j; j++)
                    for (var h = c[j] * e, l = 0; e > l; l++) g[i++] = f[h++];
                b.addAttribute(a, new THREE.BufferAttribute(g, e))
            }
            return b
        },
        toJSON: function() {
            var a = {
                metadata: {
                    version: 4.4,
                    type: "BufferGeometry",
                    generator: "BufferGeometry.toJSON"
                }
            };
            if (a.uuid = this.uuid, a.type = this.type, "" !== this.name && (a.name = this.name), void 0 !== this.parameters) {
                var b, c = this.parameters;
                for (b in c) void 0 !== c[b] && (a[b] = c[b]);
                return a
            }
            a.data = {
                attributes: {}
            };
            var d = this.index;
            null !== d && (c = Array.prototype.slice.call(d.array), a.data.index = {
                type: d.array.constructor.name,
                array: c
            }), d = this.attributes;
            for (b in d) {
                var e = d[b],
                    c = Array.prototype.slice.call(e.array);
                a.data.attributes[b] = {
                    itemSize: e.itemSize,
                    type: e.array.constructor.name,
                    array: c,
                    normalized: e.normalized
                }
            }
            return b = this.groups, 0 < b.length && (a.data.groups = JSON.parse(JSON.stringify(b))), b = this.boundingSphere, null !== b && (a.data.boundingSphere = {
                center: b.center.toArray(),
                radius: b.radius
            }), a
        },
        clone: function() {
            return (new THREE.BufferGeometry).copy(this)
        },
        copy: function(a) {
            var b = a.index;
            null !== b && this.setIndex(b.clone());
            var c, b = a.attributes;
            for (c in b) this.addAttribute(c, b[c].clone());
            for (a = a.groups, c = 0, b = a.length; b > c; c++) {
                var d = a[c];
                this.addGroup(d.start, d.count, d.materialIndex)
            }
            return this
        },
        dispose: function() {
            this.dispatchEvent({
                type: "dispose"
            })
        }
    }), THREE.BufferGeometry.MaxIndex = 65535, THREE.InstancedBufferGeometry = function() {
        THREE.BufferGeometry.call(this), this.type = "InstancedBufferGeometry", this.maxInstancedCount = void 0
    }, THREE.InstancedBufferGeometry.prototype = Object.create(THREE.BufferGeometry.prototype), THREE.InstancedBufferGeometry.prototype.constructor = THREE.InstancedBufferGeometry, THREE.InstancedBufferGeometry.prototype.addGroup = function(a, b, c) {
        this.groups.push({
            start: a,
            count: b,
            instances: c
        })
    }, THREE.InstancedBufferGeometry.prototype.copy = function(a) {
        var b = a.index;
        null !== b && this.setIndex(b.clone());
        var c, b = a.attributes;
        for (c in b) this.addAttribute(c, b[c].clone());
        for (a = a.groups, c = 0, b = a.length; b > c; c++) {
            var d = a[c];
            this.addGroup(d.start, d.count, d.instances)
        }
        return this
    }, THREE.Uniform = function(a, b) {
        "string" == typeof a && (console.warn("THREE.Uniform: Type parameter is no longer needed."), a = b), this.value = a, this.dynamic = !1
    }, THREE.Uniform.prototype = {
        constructor: THREE.Uniform,
        onUpdate: function(a) {
            return this.dynamic = !0, this.onUpdateCallback = a, this
        }
    }, THREE.AnimationAction = function() {
        throw Error("THREE.AnimationAction: Use mixer.clipAction for construction.")
    }, THREE.AnimationAction._new = function(a, b, c) {
        this._mixer = a, this._clip = b, this._localRoot = c || null, a = b.tracks, b = a.length, c = Array(b);
        for (var d = {
                endingStart: THREE.ZeroCurvatureEnding,
                endingEnd: THREE.ZeroCurvatureEnding
            }, e = 0; e !== b; ++e) {
            var f = a[e].createInterpolant(null);
            c[e] = f, f.settings = d
        }
        this._interpolantSettings = d, this._interpolants = c, this._propertyBindings = Array(b), this._weightInterpolant = this._timeScaleInterpolant = this._byClipCacheIndex = this._cacheIndex = null, this.loop = THREE.LoopRepeat, this._loopCount = -1, this._startTime = null, this.time = 0, this._effectiveWeight = this.weight = this._effectiveTimeScale = this.timeScale = 1, this.repetitions = 1 / 0, this.paused = !1, this.enabled = !0, this.clampWhenFinished = !1, this.zeroSlopeAtEnd = this.zeroSlopeAtStart = !0
    }, THREE.AnimationAction._new.prototype = {
        constructor: THREE.AnimationAction._new,
        play: function() {
            return this._mixer._activateAction(this), this
        },
        stop: function() {
            return this._mixer._deactivateAction(this), this.reset()
        },
        reset: function() {
            return this.paused = !1, this.enabled = !0, this.time = 0, this._loopCount = -1, this._startTime = null, this.stopFading().stopWarping()
        },
        isRunning: function() {
            return this.enabled && !this.paused && 0 !== this.timeScale && null === this._startTime && this._mixer._isActiveAction(this)
        },
        isScheduled: function() {
            return this._mixer._isActiveAction(this)
        },
        startAt: function(a) {
            return this._startTime = a, this
        },
        setLoop: function(a, b) {
            return this.loop = a, this.repetitions = b, this
        },
        setEffectiveWeight: function(a) {
            return this.weight = a, this._effectiveWeight = this.enabled ? a : 0, this.stopFading()
        },
        getEffectiveWeight: function() {
            return this._effectiveWeight
        },
        fadeIn: function(a) {
            return this._scheduleFading(a, 0, 1)
        },
        fadeOut: function(a) {
            return this._scheduleFading(a, 1, 0)
        },
        crossFadeFrom: function(a, b, c) {
            if (a.fadeOut(b), this.fadeIn(b), c) {
                c = this._clip.duration;
                var d = a._clip.duration,
                    e = c / d;
                a.warp(1, d / c, b), this.warp(e, 1, b)
            }
            return this
        },
        crossFadeTo: function(a, b, c) {
            return a.crossFadeFrom(this, b, c)
        },
        stopFading: function() {
            var a = this._weightInterpolant;
            return null !== a && (this._weightInterpolant = null, this._mixer._takeBackControlInterpolant(a)), this
        },
        setEffectiveTimeScale: function(a) {
            return this.timeScale = a, this._effectiveTimeScale = this.paused ? 0 : a, this.stopWarping()
        },
        getEffectiveTimeScale: function() {
            return this._effectiveTimeScale
        },
        setDuration: function(a) {
            return this.timeScale = this._clip.duration / a, this.stopWarping()
        },
        syncWith: function(a) {
            return this.time = a.time, this.timeScale = a.timeScale, this.stopWarping()
        },
        halt: function(a) {
            return this.warp(this._effectiveTimeScale, 0, a)
        },
        warp: function(a, b, c) {
            var d = this._mixer,
                e = d.time,
                f = this._timeScaleInterpolant,
                g = this.timeScale;
            return null === f && (this._timeScaleInterpolant = f = d._lendControlInterpolant()), d = f.parameterPositions, f = f.sampleValues, d[0] = e, d[1] = e + c, f[0] = a / g, f[1] = b / g, this
        },
        stopWarping: function() {
            var a = this._timeScaleInterpolant;
            return null !== a && (this._timeScaleInterpolant = null, this._mixer._takeBackControlInterpolant(a)), this
        },
        getMixer: function() {
            return this._mixer
        },
        getClip: function() {
            return this._clip
        },
        getRoot: function() {
            return this._localRoot || this._mixer._root
        },
        _update: function(a, b, c, d) {
            var e = this._startTime;
            if (null !== e) {
                if (b = (a - e) * c, 0 > b || 0 === c) return;
                this._startTime = null, b *= c
            }
            if (b *= this._updateTimeScale(a), c = this._updateTime(b), a = this._updateWeight(a), a > 0) {
                b = this._interpolants;
                for (var e = this._propertyBindings, f = 0, g = b.length; f !== g; ++f) b[f].evaluate(c), e[f].accumulate(d, a)
            }
        },
        _updateWeight: function(a) {
            var b = 0;
            if (this.enabled) {
                var b = this.weight,
                    c = this._weightInterpolant;
                if (null !== c) {
                    var d = c.evaluate(a)[0],
                        b = b * d;
                    a > c.parameterPositions[1] && (this.stopFading(), 0 === d && (this.enabled = !1))
                }
            }
            return this._effectiveWeight = b
        },
        _updateTimeScale: function(a) {
            var b = 0;
            if (!this.paused) {
                var b = this.timeScale,
                    c = this._timeScaleInterpolant;
                if (null !== c) {
                    var d = c.evaluate(a)[0],
                        b = b * d;
                    a > c.parameterPositions[1] && (this.stopWarping(), 0 === b ? this.paused = !0 : this.timeScale = b)
                }
            }
            return this._effectiveTimeScale = b
        },
        _updateTime: function(a) {
            var b = this.time + a;
            if (0 === a) return b;
            var c = this._clip.duration,
                d = this.loop,
                e = this._loopCount;
            if (d === THREE.LoopOnce) a: {
                if (-1 === e && (this.loopCount = 0, this._setEndings(!0, !0, !1)), b >= c) b = c;
                else {
                    if (!(0 > b)) break a;
                    b = 0
                }
                this.clampWhenFinished ? this.paused = !0 : this.enabled = !1, this._mixer.dispatchEvent({
                    type: "finished",
                    action: this,
                    direction: 0 > a ? -1 : 1
                })
            } else {
                if (d = d === THREE.LoopPingPong, -1 === e && (a >= 0 ? (e = 0, this._setEndings(!0, 0 === this.repetitions, d)) : this._setEndings(0 === this.repetitions, !0, d)), b >= c || 0 > b) {
                    var f = Math.floor(b / c),
                        b = b - c * f,
                        e = e + Math.abs(f),
                        g = this.repetitions - e;
                    0 > g ? (this.clampWhenFinished ? this.paused = !0 : this.enabled = !1, b = a > 0 ? c : 0, this._mixer.dispatchEvent({
                        type: "finished",
                        action: this,
                        direction: a > 0 ? 1 : -1
                    })) : (0 === g ? (a = 0 > a, this._setEndings(a, !a, d)) : this._setEndings(!1, !1, d), this._loopCount = e, this._mixer.dispatchEvent({
                        type: "loop",
                        action: this,
                        loopDelta: f
                    }))
                }
                if (d && 1 === (1 & e)) return this.time = b, c - b
            }
            return this.time = b
        },
        _setEndings: function(a, b, c) {
            var d = this._interpolantSettings;
            c ? (d.endingStart = THREE.ZeroSlopeEnding, d.endingEnd = THREE.ZeroSlopeEnding) : (d.endingStart = a ? this.zeroSlopeAtStart ? THREE.ZeroSlopeEnding : THREE.ZeroCurvatureEnding : THREE.WrapAroundEnding, d.endingEnd = b ? this.zeroSlopeAtEnd ? THREE.ZeroSlopeEnding : THREE.ZeroCurvatureEnding : THREE.WrapAroundEnding)
        },
        _scheduleFading: function(a, b, c) {
            var d = this._mixer,
                e = d.time,
                f = this._weightInterpolant;
            return null === f && (this._weightInterpolant = f = d._lendControlInterpolant()), d = f.parameterPositions, f = f.sampleValues, d[0] = e, f[0] = b, d[1] = e + a, f[1] = c, this
        }
    }, THREE.AnimationClip = function(a, b, c) {
        this.name = a, this.tracks = c, this.duration = void 0 !== b ? b : -1, this.uuid = THREE.Math.generateUUID(), 0 > this.duration && this.resetDuration(), this.trim(), this.optimize()
    }, THREE.AnimationClip.prototype = {
        constructor: THREE.AnimationClip,
        resetDuration: function() {
            for (var a = 0, b = 0, c = this.tracks.length; b !== c; ++b) var d = this.tracks[b],
                a = Math.max(a, d.times[d.times.length - 1]);
            this.duration = a
        },
        trim: function() {
            for (var a = 0; a < this.tracks.length; a++) this.tracks[a].trim(0, this.duration);
            return this
        },
        optimize: function() {
            for (var a = 0; a < this.tracks.length; a++) this.tracks[a].optimize();
            return this
        }
    }, Object.assign(THREE.AnimationClip, {
        parse: function(a) {
            for (var b = [], c = a.tracks, d = 1 / (a.fps || 1), e = 0, f = c.length; e !== f; ++e) b.push(THREE.KeyframeTrack.parse(c[e]).scale(d));
            return new THREE.AnimationClip(a.name, a.duration, b)
        },
        toJSON: function(a) {
            var b = [],
                c = a.tracks;
            a = {
                name: a.name,
                duration: a.duration,
                tracks: b
            };
            for (var d = 0, e = c.length; d !== e; ++d) b.push(THREE.KeyframeTrack.toJSON(c[d]));
            return a
        },
        CreateFromMorphTargetSequence: function(a, b, c, d) {
            for (var e = b.length, f = [], g = 0; e > g; g++) {
                var h = [],
                    i = [];
                h.push((g + e - 1) % e, g, (g + 1) % e), i.push(0, 1, 0);
                var j = THREE.AnimationUtils.getKeyframeOrder(h),
                    h = THREE.AnimationUtils.sortedArray(h, 1, j),
                    i = THREE.AnimationUtils.sortedArray(i, 1, j);
                d || 0 !== h[0] || (h.push(e), i.push(i[0])), f.push(new THREE.NumberKeyframeTrack(".morphTargetInfluences[" + b[g].name + "]", h, i).scale(1 / c))
            }
            return new THREE.AnimationClip(a, -1, f)
        },
        findByName: function(a, b) {
            var c = a;
            Array.isArray(a) || (c = a.geometry && a.geometry.animations || a.animations);
            for (var d = 0; d < c.length; d++)
                if (c[d].name === b) return c[d];
            return null
        },
        CreateClipsFromMorphTargetSequences: function(a, b, c) {
            for (var d = {}, e = /^([\w-]*?)([\d]+)$/, f = 0, g = a.length; g > f; f++) {
                var h = a[f],
                    i = h.name.match(e);
                if (i && 1 < i.length) {
                    var j = i[1];
                    (i = d[j]) || (d[j] = i = []), i.push(h)
                }
            }
            a = [];
            for (j in d) a.push(THREE.AnimationClip.CreateFromMorphTargetSequence(j, d[j], b, c));
            return a
        },
        parseAnimation: function(a, b, c) {
            if (!a) return console.error("  no animation in JSONLoader data"), null;
            c = function(a, b, c, d, e) {
                if (0 !== c.length) {
                    var f = [],
                        g = [];
                    THREE.AnimationUtils.flattenJSON(c, f, g, d), 0 !== f.length && e.push(new a(b, f, g))
                }
            };
            var d = [],
                e = a.name || "default",
                f = a.length || -1,
                g = a.fps || 30;
            a = a.hierarchy || [];
            for (var h = 0; h < a.length; h++) {
                var i = a[h].keys;
                if (i && 0 !== i.length)
                    if (i[0].morphTargets) {
                        for (var f = {}, j = 0; j < i.length; j++)
                            if (i[j].morphTargets)
                                for (var k = 0; k < i[j].morphTargets.length; k++) f[i[j].morphTargets[k]] = -1;
                        for (var l in f) {
                            for (var m = [], n = [], k = 0; k !== i[j].morphTargets.length; ++k) {
                                var o = i[j];
                                m.push(o.time), n.push(o.morphTarget === l ? 1 : 0)
                            }
                            d.push(new THREE.NumberKeyframeTrack(".morphTargetInfluence[" + l + "]", m, n))
                        }
                        f = f.length * (g || 1)
                    } else j = ".bones[" + b[h].name + "]", c(THREE.VectorKeyframeTrack, j + ".position", i, "pos", d), c(THREE.QuaternionKeyframeTrack, j + ".quaternion", i, "rot", d), c(THREE.VectorKeyframeTrack, j + ".scale", i, "scl", d)
            }
            return 0 === d.length ? null : new THREE.AnimationClip(e, f, d)
        }
    }), THREE.AnimationMixer = function(a) {
        this._root = a, this._initMemoryManager(), this.time = this._accuIndex = 0, this.timeScale = 1
    }, Object.assign(THREE.AnimationMixer.prototype, THREE.EventDispatcher.prototype, {
        clipAction: function(a, b) {
            var c = b || this._root,
                d = c.uuid,
                e = "string" == typeof a ? THREE.AnimationClip.findByName(c, a) : a,
                c = null !== e ? e.uuid : a,
                f = this._actionsByClip[c],
                g = null;
            if (void 0 !== f) {
                if (g = f.actionByRoot[d], void 0 !== g) return g;
                g = f.knownActions[0], null === e && (e = g._clip)
            }
            return null === e ? null : (e = new THREE.AnimationMixer._Action(this, e, b), this._bindAction(e, g), this._addInactiveAction(e, c, d), e)
        },
        existingAction: function(a, b) {
            var c = b || this._root,
                d = c.uuid,
                c = "string" == typeof a ? THREE.AnimationClip.findByName(c, a) : a,
                c = this._actionsByClip[c ? c.uuid : a];
            return void 0 !== c ? c.actionByRoot[d] || null : null
        },
        stopAllAction: function() {
            for (var a = this._actions, b = this._nActiveActions, c = this._bindings, d = this._nActiveBindings, e = this._nActiveBindings = this._nActiveActions = 0; e !== b; ++e) a[e].reset();
            for (e = 0; e !== d; ++e) c[e].useCount = 0;
            return this
        },
        update: function(a) {
            a *= this.timeScale;
            for (var b = this._actions, c = this._nActiveActions, d = this.time += a, e = Math.sign(a), f = this._accuIndex ^= 1, g = 0; g !== c; ++g) {
                var h = b[g];
                h.enabled && h._update(d, a, e, f)
            }
            for (a = this._bindings, b = this._nActiveBindings, g = 0; g !== b; ++g) a[g].apply(f);
            return this
        },
        getRoot: function() {
            return this._root
        },
        uncacheClip: function(a) {
            var b = this._actions;
            a = a.uuid;
            var c = this._actionsByClip,
                d = c[a];
            if (void 0 !== d) {
                for (var d = d.knownActions, e = 0, f = d.length; e !== f; ++e) {
                    var g = d[e];
                    this._deactivateAction(g);
                    var h = g._cacheIndex,
                        i = b[b.length - 1];
                    g._cacheIndex = null, g._byClipCacheIndex = null, i._cacheIndex = h, b[h] = i, b.pop(), this._removeInactiveBindingsForAction(g)
                }
                delete c[a]
            }
        },
        uncacheRoot: function(a) {
            a = a.uuid;
            var b, c = this._actionsByClip;
            for (b in c) {
                var d = c[b].actionByRoot[a];
                void 0 !== d && (this._deactivateAction(d), this._removeInactiveAction(d))
            }
            if (b = this._bindingsByRootAndName[a], void 0 !== b)
                for (var e in b) a = b[e], a.restoreOriginalState(), this._removeInactiveBinding(a)
        },
        uncacheAction: function(a, b) {
            var c = this.existingAction(a, b);
            null !== c && (this._deactivateAction(c), this._removeInactiveAction(c))
        }
    }), THREE.AnimationMixer._Action = THREE.AnimationAction._new, Object.assign(THREE.AnimationMixer.prototype, {
        _bindAction: function(a, b) {
            var c = a._localRoot || this._root,
                d = a._clip.tracks,
                e = d.length,
                f = a._propertyBindings,
                g = a._interpolants,
                h = c.uuid,
                i = this._bindingsByRootAndName,
                j = i[h];
            for (void 0 === j && (j = {}, i[h] = j), i = 0; i !== e; ++i) {
                var k = d[i],
                    l = k.name,
                    m = j[l];
                if (void 0 === m) {
                    if (m = f[i], void 0 !== m) {
                        null === m._cacheIndex && (++m.referenceCount, this._addInactiveBinding(m, h, l));
                        continue
                    }
                    m = new THREE.PropertyMixer(THREE.PropertyBinding.create(c, l, b && b._propertyBindings[i].binding.parsedPath), k.ValueTypeName, k.getValueSize()), ++m.referenceCount, this._addInactiveBinding(m, h, l)
                }
                f[i] = m, g[i].resultBuffer = m.buffer
            }
        },
        _activateAction: function(a) {
            if (!this._isActiveAction(a)) {
                if (null === a._cacheIndex) {
                    var b = (a._localRoot || this._root).uuid,
                        c = a._clip.uuid,
                        d = this._actionsByClip[c];
                    this._bindAction(a, d && d.knownActions[0]), this._addInactiveAction(a, c, b)
                }
                for (b = a._propertyBindings, c = 0, d = b.length; c !== d; ++c) {
                    var e = b[c];
                    0 === e.useCount++ && (this._lendBinding(e), e.saveOriginalState())
                }
                this._lendAction(a)
            }
        },
        _deactivateAction: function(a) {
            if (this._isActiveAction(a)) {
                for (var b = a._propertyBindings, c = 0, d = b.length; c !== d; ++c) {
                    var e = b[c];
                    0 === --e.useCount && (e.restoreOriginalState(), this._takeBackBinding(e))
                }
                this._takeBackAction(a)
            }
        },
        _initMemoryManager: function() {
            this._actions = [], this._nActiveActions = 0, this._actionsByClip = {}, this._bindings = [], this._nActiveBindings = 0, this._bindingsByRootAndName = {}, this._controlInterpolants = [], this._nActiveControlInterpolants = 0;
            var a = this;
            this.stats = {
                actions: {get total() {
                        return a._actions.length
                    },
                    get inUse() {
                        return a._nActiveActions
                    }
                },
                bindings: {get total() {
                        return a._bindings.length
                    },
                    get inUse() {
                        return a._nActiveBindings
                    }
                },
                controlInterpolants: {get total() {
                        return a._controlInterpolants.length
                    },
                    get inUse() {
                        return a._nActiveControlInterpolants
                    }
                }
            }
        },
        _isActiveAction: function(a) {
            return a = a._cacheIndex, null !== a && a < this._nActiveActions
        },
        _addInactiveAction: function(a, b, c) {
            var d = this._actions,
                e = this._actionsByClip,
                f = e[b];
            void 0 === f ? (f = {
                knownActions: [a],
                actionByRoot: {}
            }, a._byClipCacheIndex = 0, e[b] = f) : (b = f.knownActions, a._byClipCacheIndex = b.length, b.push(a)), a._cacheIndex = d.length, d.push(a), f.actionByRoot[c] = a
        },
        _removeInactiveAction: function(a) {
            var b = this._actions,
                c = b[b.length - 1],
                d = a._cacheIndex;
            c._cacheIndex = d, b[d] = c, b.pop(), a._cacheIndex = null;
            var c = a._clip.uuid,
                d = this._actionsByClip,
                e = d[c],
                f = e.knownActions,
                g = f[f.length - 1],
                h = a._byClipCacheIndex;
            g._byClipCacheIndex = h, f[h] = g, f.pop(), a._byClipCacheIndex = null, delete e.actionByRoot[(b._localRoot || this._root).uuid], 0 === f.length && delete d[c], this._removeInactiveBindingsForAction(a)
        },
        _removeInactiveBindingsForAction: function(a) {
            a = a._propertyBindings;
            for (var b = 0, c = a.length; b !== c; ++b) {
                var d = a[b];
                0 === --d.referenceCount && this._removeInactiveBinding(d)
            }
        },
        _lendAction: function(a) {
            var b = this._actions,
                c = a._cacheIndex,
                d = this._nActiveActions++,
                e = b[d];
            a._cacheIndex = d, b[d] = a, e._cacheIndex = c, b[c] = e
        },
        _takeBackAction: function(a) {
            var b = this._actions,
                c = a._cacheIndex,
                d = --this._nActiveActions,
                e = b[d];
            a._cacheIndex = d, b[d] = a, e._cacheIndex = c, b[c] = e
        },
        _addInactiveBinding: function(a, b, c) {
            var d = this._bindingsByRootAndName,
                e = d[b],
                f = this._bindings;
            void 0 === e && (e = {}, d[b] = e), e[c] = a, a._cacheIndex = f.length, f.push(a)
        },
        _removeInactiveBinding: function(a) {
            var b = this._bindings,
                c = a.binding,
                d = c.rootNode.uuid,
                c = c.path,
                e = this._bindingsByRootAndName,
                f = e[d],
                g = b[b.length - 1];
            a = a._cacheIndex, g._cacheIndex = a, b[a] = g, b.pop(), delete f[c];
            a: {
                for (var h in f) break a;
                delete e[d]
            }
        },
        _lendBinding: function(a) {
            var b = this._bindings,
                c = a._cacheIndex,
                d = this._nActiveBindings++,
                e = b[d];
            a._cacheIndex = d, b[d] = a, e._cacheIndex = c, b[c] = e
        },
        _takeBackBinding: function(a) {
            var b = this._bindings,
                c = a._cacheIndex,
                d = --this._nActiveBindings,
                e = b[d];
            a._cacheIndex = d, b[d] = a, e._cacheIndex = c, b[c] = e
        },
        _lendControlInterpolant: function() {
            var a = this._controlInterpolants,
                b = this._nActiveControlInterpolants++,
                c = a[b];
            return void 0 === c && (c = new THREE.LinearInterpolant(new Float32Array(2), new Float32Array(2), 1, this._controlInterpolantsResultBuffer), c.__cacheIndex = b, a[b] = c), c
        },
        _takeBackControlInterpolant: function(a) {
            var b = this._controlInterpolants,
                c = a.__cacheIndex,
                d = --this._nActiveControlInterpolants,
                e = b[d];
            a.__cacheIndex = d, b[d] = a, e.__cacheIndex = c, b[c] = e
        },
        _controlInterpolantsResultBuffer: new Float32Array(1)
    }), THREE.AnimationObjectGroup = function(a) {
        this.uuid = THREE.Math.generateUUID(), this._objects = Array.prototype.slice.call(arguments), this.nCachedObjects_ = 0;
        var b = {};
        this._indicesByUUID = b;
        for (var c = 0, d = arguments.length; c !== d; ++c) b[arguments[c].uuid] = c;
        this._paths = [], this._parsedPaths = [], this._bindings = [], this._bindingsIndicesByPath = {};
        var e = this;
        this.stats = {
            objects: {get total() {
                    return e._objects.length
                },
                get inUse() {
                    return this.total - e.nCachedObjects_
                }
            },
            get bindingsPerObject() {
                return e._bindings.length
            }
        }
    }, THREE.AnimationObjectGroup.prototype = {
        constructor: THREE.AnimationObjectGroup,
        add: function(a) {
            for (var b = this._objects, c = b.length, d = this.nCachedObjects_, e = this._indicesByUUID, f = this._paths, g = this._parsedPaths, h = this._bindings, i = h.length, j = 0, k = arguments.length; j !== k; ++j) {
                var l = arguments[j],
                    m = l.uuid,
                    n = e[m];
                if (void 0 === n) {
                    n = c++, e[m] = n, b.push(l);
                    for (var m = 0, o = i; m !== o; ++m) h[m].push(new THREE.PropertyBinding(l, f[m], g[m]))
                } else if (d > n) {
                    var p = b[n],
                        q = --d,
                        o = b[q];
                    for (e[o.uuid] = n, b[n] = o, e[m] = q, b[q] = l, m = 0, o = i; m !== o; ++m) {
                        var r = h[m],
                            s = r[n];
                        r[n] = r[q], void 0 === s && (s = new THREE.PropertyBinding(l, f[m], g[m])), r[q] = s
                    }
                } else b[n] !== p && console.error("Different objects with the same UUID detected. Clean the caches or recreate your infrastructure when reloading scenes...")
            }
            this.nCachedObjects_ = d
        },
        remove: function(a) {
            for (var b = this._objects, c = this.nCachedObjects_, d = this._indicesByUUID, e = this._bindings, f = e.length, g = 0, h = arguments.length; g !== h; ++g) {
                var i = arguments[g],
                    j = i.uuid,
                    k = d[j];
                if (void 0 !== k && k >= c) {
                    var l = c++,
                        m = b[l];
                    for (d[m.uuid] = k, b[k] = m, d[j] = l, b[l] = i, i = 0, j = f; i !== j; ++i) {
                        var m = e[i],
                            n = m[k];
                        m[k] = m[l], m[l] = n
                    }
                }
            }
            this.nCachedObjects_ = c
        },
        uncache: function(a) {
            for (var b = this._objects, c = b.length, d = this.nCachedObjects_, e = this._indicesByUUID, f = this._bindings, g = f.length, h = 0, i = arguments.length; h !== i; ++h) {
                var j = arguments[h].uuid,
                    k = e[j];
                if (void 0 !== k)
                    if (delete e[j], d > k) {
                        var j = --d,
                            l = b[j],
                            m = --c,
                            n = b[m];
                        for (e[l.uuid] = k, b[k] = l, e[n.uuid] = j, b[j] = n, b.pop(), l = 0, n = g; l !== n; ++l) {
                            var o = f[l],
                                p = o[m];
                            o[k] = o[j], o[j] = p, o.pop()
                        }
                    } else
                        for (m = --c, n = b[m], e[n.uuid] = k, b[k] = n, b.pop(), l = 0, n = g; l !== n; ++l) o = f[l], o[k] = o[m], o.pop()
            }
            this.nCachedObjects_ = d
        },
        subscribe_: function(a, b) {
            var c = this._bindingsIndicesByPath,
                d = c[a],
                e = this._bindings;
            if (void 0 !== d) return e[d];
            var f = this._paths,
                g = this._parsedPaths,
                h = this._objects,
                i = this.nCachedObjects_,
                j = Array(h.length),
                d = e.length;
            for (c[a] = d, f.push(a), g.push(b), e.push(j), c = i, d = h.length; c !== d; ++c) j[c] = new THREE.PropertyBinding(h[c], a, b);
            return j
        },
        unsubscribe_: function(a) {
            var b = this._bindingsIndicesByPath,
                c = b[a];
            if (void 0 !== c) {
                var d = this._paths,
                    e = this._parsedPaths,
                    f = this._bindings,
                    g = f.length - 1,
                    h = f[g];
                b[a[g]] = c, f[c] = h, f.pop(), e[c] = e[g], e.pop(), d[c] = d[g], d.pop()
            }
        }
    }, THREE.AnimationUtils = {
        arraySlice: function(a, b, c) {
            return THREE.AnimationUtils.isTypedArray(a) ? new a.constructor(a.subarray(b, c)) : a.slice(b, c)
        },
        convertArray: function(a, b, c) {
            return !a || !c && a.constructor === b ? a : "number" == typeof b.BYTES_PER_ELEMENT ? new b(a) : Array.prototype.slice.call(a)
        },
        isTypedArray: function(a) {
            return ArrayBuffer.isView(a) && !(a instanceof DataView)
        },
        getKeyframeOrder: function(a) {
            for (var b = a.length, c = Array(b), d = 0; d !== b; ++d) c[d] = d;
            return c.sort(function(b, c) {
                return a[b] - a[c]
            }), c
        },
        sortedArray: function(a, b, c) {
            for (var d = a.length, e = new a.constructor(d), f = 0, g = 0; g !== d; ++f)
                for (var h = c[f] * b, i = 0; i !== b; ++i) e[g++] = a[h + i];
            return e
        },
        flattenJSON: function(a, b, c, d) {
            for (var e = 1, f = a[0]; void 0 !== f && void 0 === f[d];) f = a[e++];
            if (void 0 !== f) {
                var g = f[d];
                if (void 0 !== g)
                    if (Array.isArray(g))
                        do g = f[d], void 0 !== g && (b.push(f.time), c.push.apply(c, g)), f = a[e++]; while (void 0 !== f);
                    else if (void 0 !== g.toArray)
                    do g = f[d], void 0 !== g && (b.push(f.time), g.toArray(c, c.length)), f = a[e++]; while (void 0 !== f);
                else
                    do g = f[d], void 0 !== g && (b.push(f.time), c.push(g)), f = a[e++]; while (void 0 !== f)
            }
        }
    }, THREE.KeyframeTrack = function(a, b, c, d) {
        if (void 0 === a) throw Error("track name is undefined");
        if (void 0 === b || 0 === b.length) throw Error("no keyframes in track named " + a);
        this.name = a, this.times = THREE.AnimationUtils.convertArray(b, this.TimeBufferType), this.values = THREE.AnimationUtils.convertArray(c, this.ValueBufferType), this.setInterpolation(d || this.DefaultInterpolation), this.validate(), this.optimize()
    }, THREE.KeyframeTrack.prototype = {
        constructor: THREE.KeyframeTrack,
        TimeBufferType: Float32Array,
        ValueBufferType: Float32Array,
        DefaultInterpolation: THREE.InterpolateLinear,
        InterpolantFactoryMethodDiscrete: function(a) {
            return new THREE.DiscreteInterpolant(this.times, this.values, this.getValueSize(), a)
        },
        InterpolantFactoryMethodLinear: function(a) {
            return new THREE.LinearInterpolant(this.times, this.values, this.getValueSize(), a)
        },
        InterpolantFactoryMethodSmooth: function(a) {
            return new THREE.CubicInterpolant(this.times, this.values, this.getValueSize(), a)
        },
        setInterpolation: function(a) {
            var b;
            switch (a) {
                case THREE.InterpolateDiscrete:
                    b = this.InterpolantFactoryMethodDiscrete;
                    break;
                case THREE.InterpolateLinear:
                    b = this.InterpolantFactoryMethodLinear;
                    break;
                case THREE.InterpolateSmooth:
                    b = this.InterpolantFactoryMethodSmooth
            }
            if (void 0 === b) {
                if (b = "unsupported interpolation for " + this.ValueTypeName + " keyframe track named " + this.name, void 0 === this.createInterpolant) {
                    if (a === this.DefaultInterpolation) throw Error(b);
                    this.setInterpolation(this.DefaultInterpolation)
                }
                console.warn(b)
            } else this.createInterpolant = b
        },
        getInterpolation: function() {
            switch (this.createInterpolant) {
                case this.InterpolantFactoryMethodDiscrete:
                    return THREE.InterpolateDiscrete;
                case this.InterpolantFactoryMethodLinear:
                    return THREE.InterpolateLinear;
                case this.InterpolantFactoryMethodSmooth:
                    return THREE.InterpolateSmooth
            }
        },
        getValueSize: function() {
            return this.values.length / this.times.length
        },
        shift: function(a) {
            if (0 !== a)
                for (var b = this.times, c = 0, d = b.length; c !== d; ++c) b[c] += a;
            return this
        },
        scale: function(a) {
            if (1 !== a)
                for (var b = this.times, c = 0, d = b.length; c !== d; ++c) b[c] *= a;
            return this
        },
        trim: function(a, b) {
            for (var c = this.times, d = c.length, e = 0, f = d - 1; e !== d && c[e] < a;) ++e;
            for (; - 1 !== f && c[f] > b;) --f;
            return ++f, (0 !== e || f !== d) && (e >= f && (f = Math.max(f, 1), e = f - 1), d = this.getValueSize(), this.times = THREE.AnimationUtils.arraySlice(c, e, f), this.values = THREE.AnimationUtils.arraySlice(this.values, e * d, f * d)), this
        },
        validate: function() {
            var a = !0,
                b = this.getValueSize();
            0 !== b - Math.floor(b) && (console.error("invalid value size in track", this), a = !1);
            var c = this.times,
                b = this.values,
                d = c.length;
            0 === d && (console.error("track is empty", this), a = !1);
            for (var e = null, f = 0; f !== d; f++) {
                var g = c[f];
                if ("number" == typeof g && isNaN(g)) {
                    console.error("time is not a valid number", this, f, g), a = !1;
                    break
                }
                if (null !== e && e > g) {
                    console.error("out of order keys", this, f, g, e), a = !1;
                    break
                }
                e = g
            }
            if (void 0 !== b && THREE.AnimationUtils.isTypedArray(b))
                for (f = 0, c = b.length; f !== c; ++f)
                    if (d = b[f], isNaN(d)) {
                        console.error("value is not a valid number", this, f, d), a = !1;
                        break
                    }
            return a
        },
        optimize: function() {
            for (var a = this.times, b = this.values, c = this.getValueSize(), d = 1, e = 1, f = a.length - 1; f >= e; ++e) {
                var g = !1,
                    h = a[e];
                if (h !== a[e + 1] && (1 !== e || h !== h[0]))
                    for (var i = e * c, j = i - c, k = i + c, h = 0; h !== c; ++h) {
                        var l = b[i + h];
                        if (l !== b[j + h] || l !== b[k + h]) {
                            g = !0;
                            break
                        }
                    }
                if (g) {
                    if (e !== d)
                        for (a[d] = a[e], g = e * c, i = d * c, h = 0; h !== c; ++h) b[i + h] = b[g + h];
                    ++d
                }
            }
            return d !== a.length && (this.times = THREE.AnimationUtils.arraySlice(a, 0, d), this.values = THREE.AnimationUtils.arraySlice(b, 0, d * c)), this
        }
    }, Object.assign(THREE.KeyframeTrack, {
        parse: function(a) {
            if (void 0 === a.type) throw Error("track type undefined, can not parse");
            var b = THREE.KeyframeTrack._getTrackTypeForValueTypeName(a.type);
            if (void 0 === a.times) {
                var c = [],
                    d = [];
                THREE.AnimationUtils.flattenJSON(a.keys, c, d, "value"), a.times = c, a.values = d
            }
            return void 0 !== b.parse ? b.parse(a) : new b(a.name, a.times, a.values, a.interpolation)
        },
        toJSON: function(a) {
            var b = a.constructor;
            if (void 0 !== b.toJSON) b = b.toJSON(a);
            else {
                var b = {
                        name: a.name,
                        times: THREE.AnimationUtils.convertArray(a.times, Array),
                        values: THREE.AnimationUtils.convertArray(a.values, Array)
                    },
                    c = a.getInterpolation();
                c !== a.DefaultInterpolation && (b.interpolation = c)
            }
            return b.type = a.ValueTypeName, b
        },
        _getTrackTypeForValueTypeName: function(a) {
            switch (a.toLowerCase()) {
                case "scalar":
                case "double":
                case "float":
                case "number":
                case "integer":
                    return THREE.NumberKeyframeTrack;
                case "vector":
                case "vector2":
                case "vector3":
                case "vector4":
                    return THREE.VectorKeyframeTrack;
                case "color":
                    return THREE.ColorKeyframeTrack;
                case "quaternion":
                    return THREE.QuaternionKeyframeTrack;
                case "bool":
                case "boolean":
                    return THREE.BooleanKeyframeTrack;
                case "string":
                    return THREE.StringKeyframeTrack
            }
            throw Error("Unsupported typeName: " + a)
        }
    }), THREE.PropertyBinding = function(a, b, c) {
        this.path = b, this.parsedPath = c || THREE.PropertyBinding.parseTrackName(b), this.node = THREE.PropertyBinding.findNode(a, this.parsedPath.nodeName) || a, this.rootNode = a
    }, THREE.PropertyBinding.prototype = {
        constructor: THREE.PropertyBinding,
        getValue: function(a, b) {
            this.bind(), this.getValue(a, b)
        },
        setValue: function(a, b) {
            this.bind(), this.setValue(a, b)
        },
        bind: function() {
            var a = this.node,
                b = this.parsedPath,
                c = b.objectName,
                d = b.propertyName,
                e = b.propertyIndex;
            if (a || (this.node = a = THREE.PropertyBinding.findNode(this.rootNode, b.nodeName) || this.rootNode), this.getValue = this._getValue_unavailable, this.setValue = this._setValue_unavailable, a) {
                if (c) {
                    var f = b.objectIndex;
                    switch (c) {
                        case "materials":
                            if (!a.material) return void console.error("  can not bind to material as node does not have a material", this);
                            if (!a.material.materials) return void console.error("  can not bind to material.materials as node.material does not have a materials array", this);
                            a = a.material.materials;
                            break;
                        case "bones":
                            if (!a.skeleton) return void console.error("  can not bind to bones as node does not have a skeleton", this);
                            for (a = a.skeleton.bones, c = 0; c < a.length; c++)
                                if (a[c].name === f) {
                                    f = c;
                                    break
                                }
                            break;
                        default:
                            if (void 0 === a[c]) return void console.error("  can not bind to objectName of node, undefined", this);
                            a = a[c]
                    }
                    if (void 0 !== f) {
                        if (void 0 === a[f]) return void console.error("  trying to bind to objectIndex of objectName, but is undefined:", this, a);
                        a = a[f]
                    }
                }
                if (f = a[d], void 0 === f) console.error("  trying to update property for track: " + b.nodeName + "." + d + " but it wasn't found.", a);
                else {
                    if (b = this.Versioning.None, void 0 !== a.needsUpdate ? (b = this.Versioning.NeedsUpdate, this.targetObject = a) : void 0 !== a.matrixWorldNeedsUpdate && (b = this.Versioning.MatrixWorldNeedsUpdate, this.targetObject = a), c = this.BindingType.Direct, void 0 !== e) {
                        if ("morphTargetInfluences" === d) {
                            if (!a.geometry) return void console.error("  can not bind to morphTargetInfluences becasuse node does not have a geometry", this);
                            if (!a.geometry.morphTargets) return void console.error("  can not bind to morphTargetInfluences becasuse node does not have a geometry.morphTargets", this);
                            for (c = 0; c < this.node.geometry.morphTargets.length; c++)
                                if (a.geometry.morphTargets[c].name === e) {
                                    e = c;
                                    break
                                }
                        }
                        c = this.BindingType.ArrayElement, this.resolvedProperty = f, this.propertyIndex = e
                    } else void 0 !== f.fromArray && void 0 !== f.toArray ? (c = this.BindingType.HasFromToArray, this.resolvedProperty = f) : void 0 !== f.length ? (c = this.BindingType.EntireArray, this.resolvedProperty = f) : this.propertyName = d;
                    this.getValue = this.GetterByBindingType[c], this.setValue = this.SetterByBindingTypeAndVersioning[c][b]
                }
            } else console.error("  trying to update node for track: " + this.path + " but it wasn't found.")
        },
        unbind: function() {
            this.node = null, this.getValue = this._getValue_unbound, this.setValue = this._setValue_unbound
        }
    }, Object.assign(THREE.PropertyBinding.prototype, {
        _getValue_unavailable: function() {},
        _setValue_unavailable: function() {},
        _getValue_unbound: THREE.PropertyBinding.prototype.getValue,
        _setValue_unbound: THREE.PropertyBinding.prototype.setValue,
        BindingType: {
            Direct: 0,
            EntireArray: 1,
            ArrayElement: 2,
            HasFromToArray: 3
        },
        Versioning: {
            None: 0,
            NeedsUpdate: 1,
            MatrixWorldNeedsUpdate: 2
        },
        GetterByBindingType: [function(a, b) {
            a[b] = this.node[this.propertyName]
        }, function(a, b) {
            for (var c = this.resolvedProperty, d = 0, e = c.length; d !== e; ++d) a[b++] = c[d]
        }, function(a, b) {
            a[b] = this.resolvedProperty[this.propertyIndex]
        }, function(a, b) {
            this.resolvedProperty.toArray(a, b)
        }],
        SetterByBindingTypeAndVersioning: [
            [function(a, b) {
                this.node[this.propertyName] = a[b]
            }, function(a, b) {
                this.node[this.propertyName] = a[b], this.targetObject.needsUpdate = !0
            }, function(a, b) {
                this.node[this.propertyName] = a[b], this.targetObject.matrixWorldNeedsUpdate = !0
            }],
            [function(a, b) {
                for (var c = this.resolvedProperty, d = 0, e = c.length; d !== e; ++d) c[d] = a[b++]
            }, function(a, b) {
                for (var c = this.resolvedProperty, d = 0, e = c.length; d !== e; ++d) c[d] = a[b++];
                this.targetObject.needsUpdate = !0
            }, function(a, b) {
                for (var c = this.resolvedProperty, d = 0, e = c.length; d !== e; ++d) c[d] = a[b++];
                this.targetObject.matrixWorldNeedsUpdate = !0
            }],
            [function(a, b) {
                this.resolvedProperty[this.propertyIndex] = a[b]
            }, function(a, b) {
                this.resolvedProperty[this.propertyIndex] = a[b], this.targetObject.needsUpdate = !0
            }, function(a, b) {
                this.resolvedProperty[this.propertyIndex] = a[b], this.targetObject.matrixWorldNeedsUpdate = !0
            }],
            [function(a, b) {
                this.resolvedProperty.fromArray(a, b)
            }, function(a, b) {
                this.resolvedProperty.fromArray(a, b), this.targetObject.needsUpdate = !0
            }, function(a, b) {
                this.resolvedProperty.fromArray(a, b), this.targetObject.matrixWorldNeedsUpdate = !0
            }]
        ]
    }), THREE.PropertyBinding.Composite = function(a, b, c) {
        c = c || THREE.PropertyBinding.parseTrackName(b), this._targetGroup = a, this._bindings = a.subscribe_(b, c)
    }, THREE.PropertyBinding.Composite.prototype = {
        constructor: THREE.PropertyBinding.Composite,
        getValue: function(a, b) {
            this.bind();
            var c = this._bindings[this._targetGroup.nCachedObjects_];
            void 0 !== c && c.getValue(a, b)
        },
        setValue: function(a, b) {
            for (var c = this._bindings, d = this._targetGroup.nCachedObjects_, e = c.length; d !== e; ++d) c[d].setValue(a, b)
        },
        bind: function() {
            for (var a = this._bindings, b = this._targetGroup.nCachedObjects_, c = a.length; b !== c; ++b) a[b].bind()
        },
        unbind: function() {
            for (var a = this._bindings, b = this._targetGroup.nCachedObjects_, c = a.length; b !== c; ++b) a[b].unbind()
        }
    }, THREE.PropertyBinding.create = function(a, b, c) {
        return a instanceof THREE.AnimationObjectGroup ? new THREE.PropertyBinding.Composite(a, b, c) : new THREE.PropertyBinding(a, b, c)
    }, THREE.PropertyBinding.parseTrackName = function(a) {
        var b = /^(([\w]+\/)*)([\w-\d]+)?(\.([\w]+)(\[([\w\d\[\]\_.:\- ]+)\])?)?(\.([\w.]+)(\[([\w\d\[\]\_. ]+)\])?)$/,
            c = b.exec(a);
        if (!c) throw Error("cannot parse trackName at all: " + a);
        if (c.index === b.lastIndex && b.lastIndex++, b = {
                nodeName: c[3],
                objectName: c[5],
                objectIndex: c[7],
                propertyName: c[9],
                propertyIndex: c[11]
            }, null === b.propertyName || 0 === b.propertyName.length) throw Error("can not parse propertyName from trackName: " + a);
        return b
    }, THREE.PropertyBinding.findNode = function(a, b) {
        if (!b || "" === b || "root" === b || "." === b || -1 === b || b === a.name || b === a.uuid) return a;
        if (a.skeleton) {
            var c = function(a) {
                for (var c = 0; c < a.bones.length; c++) {
                    var d = a.bones[c];
                    if (d.name === b) return d
                }
                return null
            }(a.skeleton);
            if (c) return c
        }
        if (a.children) {
            var d = function(a) {
                for (var c = 0; c < a.length; c++) {
                    var e = a[c];
                    if (e.name === b || e.uuid === b || (e = d(e.children))) return e
                }
                return null
            };
            if (c = d(a.children)) return c
        }
        return null
    }, THREE.PropertyMixer = function(a, b, c) {
        switch (this.binding = a, this.valueSize = c, a = Float64Array, b) {
            case "quaternion":
                b = this._slerp;
                break;
            case "string":
            case "bool":
                a = Array, b = this._select;
                break;
            default:
                b = this._lerp
        }
        this.buffer = new a(4 * c), this._mixBufferRegion = b, this.referenceCount = this.useCount = this.cumulativeWeight = 0
    }, THREE.PropertyMixer.prototype = {
        constructor: THREE.PropertyMixer,
        accumulate: function(a, b) {
            var c = this.buffer,
                d = this.valueSize,
                e = a * d + d,
                f = this.cumulativeWeight;
            if (0 === f) {
                for (f = 0; f !== d; ++f) c[e + f] = c[f];
                f = b
            } else f += b, this._mixBufferRegion(c, e, 0, b / f, d);
            this.cumulativeWeight = f
        },
        apply: function(a) {
            var b = this.valueSize,
                c = this.buffer;
            a = a * b + b;
            var d = this.cumulativeWeight,
                e = this.binding;
            this.cumulativeWeight = 0, 1 > d && this._mixBufferRegion(c, a, 3 * b, 1 - d, b);
            for (var d = b, f = b + b; d !== f; ++d)
                if (c[d] !== c[d + b]) {
                    e.setValue(c, a);
                    break
                }
        },
        saveOriginalState: function() {
            var a = this.buffer,
                b = this.valueSize,
                c = 3 * b;
            this.binding.getValue(a, c);
            for (var d = b; d !== c; ++d) a[d] = a[c + d % b];
            this.cumulativeWeight = 0
        },
        restoreOriginalState: function() {
            this.binding.setValue(this.buffer, 3 * this.valueSize)
        },
        _select: function(a, b, c, d, e) {
            if (d >= .5)
                for (d = 0; d !== e; ++d) a[b + d] = a[c + d]
        },
        _slerp: function(a, b, c, d, e) {
            THREE.Quaternion.slerpFlat(a, b, a, b, a, c, d)
        },
        _lerp: function(a, b, c, d, e) {
            for (var f = 1 - d, g = 0; g !== e; ++g) {
                var h = b + g;
                a[h] = a[h] * f + a[c + g] * d
            }
        }
    }, THREE.BooleanKeyframeTrack = function(a, b, c) {
        THREE.KeyframeTrack.call(this, a, b, c)
    }, THREE.BooleanKeyframeTrack.prototype = Object.assign(Object.create(THREE.KeyframeTrack.prototype), {
        constructor: THREE.BooleanKeyframeTrack,
        ValueTypeName: "bool",
        ValueBufferType: Array,
        DefaultInterpolation: THREE.InterpolateDiscrete,
        InterpolantFactoryMethodLinear: void 0,
        InterpolantFactoryMethodSmooth: void 0
    }), THREE.ColorKeyframeTrack = function(a, b, c, d) {
        THREE.KeyframeTrack.call(this, a, b, c, d)
    }, THREE.ColorKeyframeTrack.prototype = Object.assign(Object.create(THREE.KeyframeTrack.prototype), {
        constructor: THREE.ColorKeyframeTrack,
        ValueTypeName: "color"
    }), THREE.NumberKeyframeTrack = function(a, b, c, d) {
        THREE.KeyframeTrack.call(this, a, b, c, d)
    }, THREE.NumberKeyframeTrack.prototype = Object.assign(Object.create(THREE.KeyframeTrack.prototype), {
        constructor: THREE.NumberKeyframeTrack,
        ValueTypeName: "number"
    }), THREE.QuaternionKeyframeTrack = function(a, b, c, d) {
        THREE.KeyframeTrack.call(this, a, b, c, d)
    }, THREE.QuaternionKeyframeTrack.prototype = Object.assign(Object.create(THREE.KeyframeTrack.prototype), {
        constructor: THREE.QuaternionKeyframeTrack,
        ValueTypeName: "quaternion",
        DefaultInterpolation: THREE.InterpolateLinear,
        InterpolantFactoryMethodLinear: function(a) {
            return new THREE.QuaternionLinearInterpolant(this.times, this.values, this.getValueSize(), a)
        },
        InterpolantFactoryMethodSmooth: void 0
    }), THREE.StringKeyframeTrack = function(a, b, c, d) {
        THREE.KeyframeTrack.call(this, a, b, c, d)
    }, THREE.StringKeyframeTrack.prototype = Object.assign(Object.create(THREE.KeyframeTrack.prototype), {
        constructor: THREE.StringKeyframeTrack,
        ValueTypeName: "string",
        ValueBufferType: Array,
        DefaultInterpolation: THREE.InterpolateDiscrete,
        InterpolantFactoryMethodLinear: void 0,
        InterpolantFactoryMethodSmooth: void 0
    }), THREE.VectorKeyframeTrack = function(a, b, c, d) {
        THREE.KeyframeTrack.call(this, a, b, c, d)
    }, THREE.VectorKeyframeTrack.prototype = Object.assign(Object.create(THREE.KeyframeTrack.prototype), {
        constructor: THREE.VectorKeyframeTrack,
        ValueTypeName: "vector"
    }), THREE.Audio = function(a) {
        THREE.Object3D.call(this), this.type = "Audio", this.context = a.context, this.source = this.context.createBufferSource(), this.source.onended = this.onEnded.bind(this), this.gain = this.context.createGain(), this.gain.connect(a.getInput()), this.autoplay = !1, this.startTime = 0, this.playbackRate = 1, this.isPlaying = !1, this.hasPlaybackControl = !0, this.sourceType = "empty", this.filters = []
    }, THREE.Audio.prototype = Object.assign(Object.create(THREE.Object3D.prototype), {
        constructor: THREE.Audio,
        getOutput: function() {
            return this.gain
        },
        setNodeSource: function(a) {
            return this.hasPlaybackControl = !1, this.sourceType = "audioNode", this.source = a, this.connect(), this
        },
        setBuffer: function(a) {
            return this.source.buffer = a, this.sourceType = "buffer", this.autoplay && this.play(), this
        },
        play: function() {
            if (!0 === this.isPlaying) console.warn("THREE.Audio: Audio is already playing.");
            else {
                if (!1 !== this.hasPlaybackControl) {
                    var a = this.context.createBufferSource();
                    return a.buffer = this.source.buffer, a.loop = this.source.loop, a.onended = this.source.onended, a.start(0, this.startTime), a.playbackRate.value = this.playbackRate, this.isPlaying = !0, this.source = a, this.connect()
                }
                console.warn("THREE.Audio: this Audio has no playback control.")
            }
        },
        pause: function() {
            return !1 !== this.hasPlaybackControl ? (this.source.stop(), this.startTime = this.context.currentTime, this.isPlaying = !1, this) : void console.warn("THREE.Audio: this Audio has no playback control.")
        },
        stop: function() {
            return !1 !== this.hasPlaybackControl ? (this.source.stop(), this.startTime = 0, this.isPlaying = !1, this) : void console.warn("THREE.Audio: this Audio has no playback control.")
        },
        connect: function() {
            if (0 < this.filters.length) {
                this.source.connect(this.filters[0]);
                for (var a = 1, b = this.filters.length; b > a; a++) this.filters[a - 1].connect(this.filters[a]);
                this.filters[this.filters.length - 1].connect(this.getOutput())
            } else this.source.connect(this.getOutput());
            return this
        },
        disconnect: function() {
            if (0 < this.filters.length) {
                this.source.disconnect(this.filters[0]);
                for (var a = 1, b = this.filters.length; b > a; a++) this.filters[a - 1].disconnect(this.filters[a]);
                this.filters[this.filters.length - 1].disconnect(this.getOutput())
            } else this.source.disconnect(this.getOutput());
            return this
        },
        getFilters: function() {
            return this.filters
        },
        setFilters: function(a) {
            return a || (a = []), !0 === this.isPlaying ? (this.disconnect(), this.filters = a, this.connect()) : this.filters = a, this
        },
        getFilter: function() {
            return this.getFilters()[0]
        },
        setFilter: function(a) {
            return this.setFilters(a ? [a] : [])
        },
        setPlaybackRate: function(a) {
            return !1 !== this.hasPlaybackControl ? (this.playbackRate = a, !0 === this.isPlaying && (this.source.playbackRate.value = this.playbackRate), this) : void console.warn("THREE.Audio: this Audio has no playback control.")
        },
        getPlaybackRate: function() {
            return this.playbackRate
        },
        onEnded: function() {
            this.isPlaying = !1
        },
        getLoop: function() {
            return !1 === this.hasPlaybackControl ? (console.warn("THREE.Audio: this Audio has no playback control."), !1) : this.source.loop
        },
        setLoop: function(a) {
            !1 === this.hasPlaybackControl ? console.warn("THREE.Audio: this Audio has no playback control.") : this.source.loop = a
        },
        getVolume: function() {
            return this.gain.gain.value
        },
        setVolume: function(a) {
            return this.gain.gain.value = a, this
        }
    }), THREE.AudioAnalyser = function(a, b) {
        this.analyser = a.context.createAnalyser(), this.analyser.fftSize = void 0 !== b ? b : 2048, this.data = new Uint8Array(this.analyser.frequencyBinCount), a.getOutput().connect(this.analyser)
    }, Object.assign(THREE.AudioAnalyser.prototype, {
        getFrequencyData: function() {
            return this.analyser.getByteFrequencyData(this.data), this.data
        },
        getAverageFrequency: function() {
            for (var a = 0, b = this.getFrequencyData(), c = 0; c < b.length; c++) a += b[c];
            return a / b.length
        }
    }), Object.defineProperty(THREE, "AudioContext", {
        get: function() {
            var a;
            return function() {
                return void 0 === a && (a = new(window.AudioContext || window.webkitAudioContext)), a
            }
        }()
    }), THREE.PositionalAudio = function(a) {
        THREE.Audio.call(this, a), this.panner = this.context.createPanner(), this.panner.connect(this.gain)
    }, THREE.PositionalAudio.prototype = Object.assign(Object.create(THREE.Audio.prototype), {
        constructor: THREE.PositionalAudio,
        getOutput: function() {
            return this.panner
        },
        getRefDistance: function() {
            return this.panner.refDistance
        },
        setRefDistance: function(a) {
            this.panner.refDistance = a
        },
        getRolloffFactor: function() {
            return this.panner.rolloffFactor
        },
        setRolloffFactor: function(a) {
            this.panner.rolloffFactor = a
        },
        getDistanceModel: function() {
            return this.panner.distanceModel
        },
        setDistanceModel: function(a) {
            this.panner.distanceModel = a
        },
        getMaxDistance: function() {
            return this.panner.maxDistance
        },
        setMaxDistance: function(a) {
            this.panner.maxDistance = a
        },
        updateMatrixWorld: function() {
            var a = new THREE.Vector3;
            return function(b) {
                THREE.Object3D.prototype.updateMatrixWorld.call(this, b), a.setFromMatrixPosition(this.matrixWorld), this.panner.setPosition(a.x, a.y, a.z)
            }
        }()
    }), THREE.AudioListener = function() {
        THREE.Object3D.call(this), this.type = "AudioListener", this.context = THREE.AudioContext, this.gain = this.context.createGain(), this.gain.connect(this.context.destination), this.filter = null
    }, THREE.AudioListener.prototype = Object.assign(Object.create(THREE.Object3D.prototype), {
        constructor: THREE.AudioListener,
        getInput: function() {
            return this.gain
        },
        removeFilter: function() {
            null !== this.filter && (this.gain.disconnect(this.filter), this.filter.disconnect(this.context.destination), this.gain.connect(this.context.destination), this.filter = null)
        },
        getFilter: function() {
            return this.filter
        },
        setFilter: function(a) {
            null !== this.filter ? (this.gain.disconnect(this.filter), this.filter.disconnect(this.context.destination)) : this.gain.disconnect(this.context.destination), this.filter = a, this.gain.connect(this.filter), this.filter.connect(this.context.destination)
        },
        getMasterVolume: function() {
            return this.gain.gain.value
        },
        setMasterVolume: function(a) {
            this.gain.gain.value = a
        },
        updateMatrixWorld: function() {
            var a = new THREE.Vector3,
                b = new THREE.Quaternion,
                c = new THREE.Vector3,
                d = new THREE.Vector3;
            return function(e) {
                THREE.Object3D.prototype.updateMatrixWorld.call(this, e), e = this.context.listener;
                var f = this.up;
                this.matrixWorld.decompose(a, b, c), d.set(0, 0, -1).applyQuaternion(b), e.setPosition(a.x, a.y, a.z), e.setOrientation(d.x, d.y, d.z, f.x, f.y, f.z)
            }
        }()
    }), THREE.Camera = function() {
        THREE.Object3D.call(this), this.type = "Camera", this.matrixWorldInverse = new THREE.Matrix4, this.projectionMatrix = new THREE.Matrix4
    }, THREE.Camera.prototype = Object.create(THREE.Object3D.prototype), THREE.Camera.prototype.constructor = THREE.Camera, THREE.Camera.prototype.getWorldDirection = function() {
        var a = new THREE.Quaternion;
        return function(b) {
            return b = b || new THREE.Vector3, this.getWorldQuaternion(a), b.set(0, 0, -1).applyQuaternion(a)
        }
    }(), THREE.Camera.prototype.lookAt = function() {
        var a = new THREE.Matrix4;
        return function(b) {
            a.lookAt(this.position, b, this.up), this.quaternion.setFromRotationMatrix(a)
        }
    }(), THREE.Camera.prototype.clone = function() {
        return (new this.constructor).copy(this)
    }, THREE.Camera.prototype.copy = function(a) {
        return THREE.Object3D.prototype.copy.call(this, a), this.matrixWorldInverse.copy(a.matrixWorldInverse), this.projectionMatrix.copy(a.projectionMatrix), this
    }, THREE.CubeCamera = function(a, b, c) {
        THREE.Object3D.call(this), this.type = "CubeCamera";
        var d = new THREE.PerspectiveCamera(90, 1, a, b);
        d.up.set(0, -1, 0), d.lookAt(new THREE.Vector3(1, 0, 0)), this.add(d);
        var e = new THREE.PerspectiveCamera(90, 1, a, b);
        e.up.set(0, -1, 0), e.lookAt(new THREE.Vector3(-1, 0, 0)), this.add(e);
        var f = new THREE.PerspectiveCamera(90, 1, a, b);
        f.up.set(0, 0, 1), f.lookAt(new THREE.Vector3(0, 1, 0)), this.add(f);
        var g = new THREE.PerspectiveCamera(90, 1, a, b);
        g.up.set(0, 0, -1), g.lookAt(new THREE.Vector3(0, -1, 0)), this.add(g);
        var h = new THREE.PerspectiveCamera(90, 1, a, b);
        h.up.set(0, -1, 0), h.lookAt(new THREE.Vector3(0, 0, 1)), this.add(h);
        var i = new THREE.PerspectiveCamera(90, 1, a, b);
        i.up.set(0, -1, 0), i.lookAt(new THREE.Vector3(0, 0, -1)), this.add(i), this.renderTarget = new THREE.WebGLRenderTargetCube(c, c, {
            format: THREE.RGBFormat,
            magFilter: THREE.LinearFilter,
            minFilter: THREE.LinearFilter
        }), this.updateCubeMap = function(a, b) {
            null === this.parent && this.updateMatrixWorld();
            var c = this.renderTarget,
                j = c.texture.generateMipmaps;
            c.texture.generateMipmaps = !1, c.activeCubeFace = 0, a.render(b, d, c), c.activeCubeFace = 1, a.render(b, e, c), c.activeCubeFace = 2, a.render(b, f, c), c.activeCubeFace = 3, a.render(b, g, c), c.activeCubeFace = 4, a.render(b, h, c), c.texture.generateMipmaps = j, c.activeCubeFace = 5, a.render(b, i, c), a.setRenderTarget(null)
        }
    }, THREE.CubeCamera.prototype = Object.create(THREE.Object3D.prototype), THREE.CubeCamera.prototype.constructor = THREE.CubeCamera, THREE.OrthographicCamera = function(a, b, c, d, e, f) {
        THREE.Camera.call(this), this.type = "OrthographicCamera", this.zoom = 1, this.view = null, this.left = a, this.right = b, this.top = c, this.bottom = d, this.near = void 0 !== e ? e : .1, this.far = void 0 !== f ? f : 2e3, this.updateProjectionMatrix()
    }, THREE.OrthographicCamera.prototype = Object.assign(Object.create(THREE.Camera.prototype), {
        constructor: THREE.OrthographicCamera,
        copy: function(a) {
            return THREE.Camera.prototype.copy.call(this, a), this.left = a.left, this.right = a.right, this.top = a.top, this.bottom = a.bottom, this.near = a.near, this.far = a.far, this.zoom = a.zoom, this.view = null === a.view ? null : Object.assign({}, a.view), this
        },
        setViewOffset: function(a, b, c, d, e, f) {
            this.view = {
                fullWidth: a,
                fullHeight: b,
                offsetX: c,
                offsetY: d,
                width: e,
                height: f
            }, this.updateProjectionMatrix()
        },
        clearViewOffset: function() {
            this.view = null, this.updateProjectionMatrix()
        },
        updateProjectionMatrix: function() {
            var a = (this.right - this.left) / (2 * this.zoom),
                b = (this.top - this.bottom) / (2 * this.zoom),
                c = (this.right + this.left) / 2,
                d = (this.top + this.bottom) / 2,
                e = c - a,
                c = c + a,
                a = d + b,
                b = d - b;
            if (null !== this.view) var c = this.zoom / (this.view.width / this.view.fullWidth),
                b = this.zoom / (this.view.height / this.view.fullHeight),
                f = (this.right - this.left) / this.view.width,
                d = (this.top - this.bottom) / this.view.height,
                e = e + this.view.offsetX / c * f,
                c = e + this.view.width / c * f,
                a = a - this.view.offsetY / b * d,
                b = a - this.view.height / b * d;
            this.projectionMatrix.makeOrthographic(e, c, a, b, this.near, this.far)
        },
        toJSON: function(a) {
            return a = THREE.Object3D.prototype.toJSON.call(this, a), a.object.zoom = this.zoom, a.object.left = this.left, a.object.right = this.right, a.object.top = this.top, a.object.bottom = this.bottom, a.object.near = this.near, a.object.far = this.far, null !== this.view && (a.object.view = Object.assign({}, this.view)), a
        }
    }), THREE.PerspectiveCamera = function(a, b, c, d) {
        THREE.Camera.call(this), this.type = "PerspectiveCamera", this.fov = void 0 !== a ? a : 50, this.zoom = 1, this.near = void 0 !== c ? c : .1, this.far = void 0 !== d ? d : 2e3, this.focus = 10, this.aspect = void 0 !== b ? b : 1, this.view = null, this.filmGauge = 35, this.filmOffset = 0, this.updateProjectionMatrix()
    }, THREE.PerspectiveCamera.prototype = Object.assign(Object.create(THREE.Camera.prototype), {
        constructor: THREE.PerspectiveCamera,
        copy: function(a) {
            return THREE.Camera.prototype.copy.call(this, a), this.fov = a.fov, this.zoom = a.zoom, this.near = a.near, this.far = a.far, this.focus = a.focus, this.aspect = a.aspect, this.view = null === a.view ? null : Object.assign({}, a.view), this.filmGauge = a.filmGauge, this.filmOffset = a.filmOffset, this
        },
        setFocalLength: function(a) {
            a = .5 * this.getFilmHeight() / a, this.fov = 2 * THREE.Math.RAD2DEG * Math.atan(a), this.updateProjectionMatrix()
        },
        getFocalLength: function() {
            var a = Math.tan(.5 * THREE.Math.DEG2RAD * this.fov);
            return .5 * this.getFilmHeight() / a
        },
        getEffectiveFOV: function() {
            return 2 * THREE.Math.RAD2DEG * Math.atan(Math.tan(.5 * THREE.Math.DEG2RAD * this.fov) / this.zoom)
        },
        getFilmWidth: function() {
            return this.filmGauge * Math.min(this.aspect, 1)
        },
        getFilmHeight: function() {
            return this.filmGauge / Math.max(this.aspect, 1)
        },
        setViewOffset: function(a, b, c, d, e, f) {
            this.aspect = a / b, this.view = {
                fullWidth: a,
                fullHeight: b,
                offsetX: c,
                offsetY: d,
                width: e,
                height: f
            }, this.updateProjectionMatrix()
        },
        clearViewOffset: function() {
            this.view = null, this.updateProjectionMatrix()
        },
        updateProjectionMatrix: function() {
            var a = this.near,
                b = a * Math.tan(.5 * THREE.Math.DEG2RAD * this.fov) / this.zoom,
                c = 2 * b,
                d = this.aspect * c,
                e = -.5 * d,
                f = this.view;
            if (null !== f) var g = f.fullWidth,
                h = f.fullHeight,
                e = e + f.offsetX * d / g,
                b = b - f.offsetY * c / h,
                d = f.width / g * d,
                c = f.height / h * c;
            f = this.filmOffset, 0 !== f && (e += a * f / this.getFilmWidth()), this.projectionMatrix.makeFrustum(e, e + d, b - c, b, a, this.far)
        },
        toJSON: function(a) {
            return a = THREE.Object3D.prototype.toJSON.call(this, a), a.object.fov = this.fov, a.object.zoom = this.zoom, a.object.near = this.near, a.object.far = this.far, a.object.focus = this.focus, a.object.aspect = this.aspect, null !== this.view && (a.object.view = Object.assign({}, this.view)), a.object.filmGauge = this.filmGauge, a.object.filmOffset = this.filmOffset, a
        }
    }), THREE.StereoCamera = function() {
        this.type = "StereoCamera", this.aspect = 1, this.cameraL = new THREE.PerspectiveCamera, this.cameraL.layers.enable(1), this.cameraL.matrixAutoUpdate = !1, this.cameraR = new THREE.PerspectiveCamera, this.cameraR.layers.enable(2), this.cameraR.matrixAutoUpdate = !1
    }, Object.assign(THREE.StereoCamera.prototype, {
        update: function() {
            var a, b, c, d, e, f = new THREE.Matrix4,
                g = new THREE.Matrix4;
            return function(h) {
                if (a !== h.focus || b !== h.fov || c !== h.aspect * this.aspect || d !== h.near || e !== h.far) {
                    a = h.focus, b = h.fov, c = h.aspect * this.aspect, d = h.near, e = h.far;
                    var i, j, k = h.projectionMatrix.clone(),
                        l = .032 * d / a,
                        m = d * Math.tan(THREE.Math.DEG2RAD * b * .5);
                    g.elements[12] = -.032, f.elements[12] = .032, i = -m * c + l, j = m * c + l, k.elements[0] = 2 * d / (j - i), k.elements[8] = (j + i) / (j - i), this.cameraL.projectionMatrix.copy(k), i = -m * c - l, j = m * c - l, k.elements[0] = 2 * d / (j - i), k.elements[8] = (j + i) / (j - i), this.cameraR.projectionMatrix.copy(k)
                }
                this.cameraL.matrixWorld.copy(h.matrixWorld).multiply(g), this.cameraR.matrixWorld.copy(h.matrixWorld).multiply(f)
            }
        }()
    }), THREE.Light = function(a, b) {
        THREE.Object3D.call(this), this.type = "Light", this.color = new THREE.Color(a), this.intensity = void 0 !== b ? b : 1, this.receiveShadow = void 0
    }, THREE.Light.prototype = Object.assign(Object.create(THREE.Object3D.prototype), {
        constructor: THREE.Light,
        copy: function(a) {
            return THREE.Object3D.prototype.copy.call(this, a), this.color.copy(a.color), this.intensity = a.intensity, this
        },
        toJSON: function(a) {
            return a = THREE.Object3D.prototype.toJSON.call(this, a), a.object.color = this.color.getHex(), a.object.intensity = this.intensity, void 0 !== this.groundColor && (a.object.groundColor = this.groundColor.getHex()), void 0 !== this.distance && (a.object.distance = this.distance), void 0 !== this.angle && (a.object.angle = this.angle), void 0 !== this.decay && (a.object.decay = this.decay), void 0 !== this.penumbra && (a.object.penumbra = this.penumbra), a
        }
    }), THREE.LightShadow = function(a) {
        this.camera = a, this.bias = 0, this.radius = 1, this.mapSize = new THREE.Vector2(512, 512), this.map = null, this.matrix = new THREE.Matrix4
    }, Object.assign(THREE.LightShadow.prototype, {
        copy: function(a) {
            return this.camera = a.camera.clone(), this.bias = a.bias, this.radius = a.radius, this.mapSize.copy(a.mapSize), this
        },
        clone: function() {
            return (new this.constructor).copy(this)
        }
    }), THREE.AmbientLight = function(a, b) {
        THREE.Light.call(this, a, b), this.type = "AmbientLight", this.castShadow = void 0
    }, THREE.AmbientLight.prototype = Object.assign(Object.create(THREE.Light.prototype), {
        constructor: THREE.AmbientLight
    }), THREE.DirectionalLight = function(a, b) {
        THREE.Light.call(this, a, b), this.type = "DirectionalLight", this.position.copy(THREE.Object3D.DefaultUp), this.updateMatrix(), this.target = new THREE.Object3D, this.shadow = new THREE.DirectionalLightShadow
    }, THREE.DirectionalLight.prototype = Object.assign(Object.create(THREE.Light.prototype), {
        constructor: THREE.DirectionalLight,
        copy: function(a) {
            return THREE.Light.prototype.copy.call(this, a), this.target = a.target.clone(), this.shadow = a.shadow.clone(), this
        }
    }), THREE.DirectionalLightShadow = function(a) {
        THREE.LightShadow.call(this, new THREE.OrthographicCamera(-5, 5, 5, -5, .5, 500))
    }, THREE.DirectionalLightShadow.prototype = Object.assign(Object.create(THREE.LightShadow.prototype), {
        constructor: THREE.DirectionalLightShadow
    }), THREE.HemisphereLight = function(a, b, c) {
        THREE.Light.call(this, a, c), this.type = "HemisphereLight", this.castShadow = void 0, this.position.copy(THREE.Object3D.DefaultUp), this.updateMatrix(), this.groundColor = new THREE.Color(b)
    }, THREE.HemisphereLight.prototype = Object.assign(Object.create(THREE.Light.prototype), {
        constructor: THREE.HemisphereLight,
        copy: function(a) {
            return THREE.Light.prototype.copy.call(this, a), this.groundColor.copy(a.groundColor), this
        }
    }), THREE.PointLight = function(a, b, c, d) {
        THREE.Light.call(this, a, b), this.type = "PointLight", Object.defineProperty(this, "power", {
            get: function() {
                return 4 * this.intensity * Math.PI
            },
            set: function(a) {
                this.intensity = a / (4 * Math.PI)
            }
        }), this.distance = void 0 !== c ? c : 0, this.decay = void 0 !== d ? d : 1, this.shadow = new THREE.LightShadow(new THREE.PerspectiveCamera(90, 1, .5, 500))
    }, THREE.PointLight.prototype = Object.assign(Object.create(THREE.Light.prototype), {
        constructor: THREE.PointLight,
        copy: function(a) {
            return THREE.Light.prototype.copy.call(this, a), this.distance = a.distance, this.decay = a.decay, this.shadow = a.shadow.clone(), this
        }
    }), THREE.SpotLight = function(a, b, c, d, e, f) {
        THREE.Light.call(this, a, b), this.type = "SpotLight", this.position.copy(THREE.Object3D.DefaultUp), this.updateMatrix(), this.target = new THREE.Object3D,
            Object.defineProperty(this, "power", {
                get: function() {
                    return this.intensity * Math.PI
                },
                set: function(a) {
                    this.intensity = a / Math.PI
                }
            }), this.distance = void 0 !== c ? c : 0, this.angle = void 0 !== d ? d : Math.PI / 3, this.penumbra = void 0 !== e ? e : 0, this.decay = void 0 !== f ? f : 1, this.shadow = new THREE.SpotLightShadow
    }, THREE.SpotLight.prototype = Object.assign(Object.create(THREE.Light.prototype), {
        constructor: THREE.SpotLight,
        copy: function(a) {
            return THREE.Light.prototype.copy.call(this, a), this.distance = a.distance, this.angle = a.angle, this.penumbra = a.penumbra, this.decay = a.decay, this.target = a.target.clone(), this.shadow = a.shadow.clone(), this
        }
    }), THREE.SpotLightShadow = function() {
        THREE.LightShadow.call(this, new THREE.PerspectiveCamera(50, 1, .5, 500))
    }, THREE.SpotLightShadow.prototype = Object.assign(Object.create(THREE.LightShadow.prototype), {
        constructor: THREE.SpotLightShadow,
        update: function(a) {
            var b = 2 * THREE.Math.RAD2DEG * a.angle,
                c = this.mapSize.width / this.mapSize.height;
            a = a.distance || 500;
            var d = this.camera;
            (b !== d.fov || c !== d.aspect || a !== d.far) && (d.fov = b, d.aspect = c, d.far = a, d.updateProjectionMatrix())
        }
    }), THREE.AudioLoader = function(a) {
        this.manager = void 0 !== a ? a : THREE.DefaultLoadingManager
    }, Object.assign(THREE.AudioLoader.prototype, {
        load: function(a, b, c, d) {
            var e = new THREE.XHRLoader(this.manager);
            e.setResponseType("arraybuffer"), e.load(a, function(a) {
                THREE.AudioContext.decodeAudioData(a, function(a) {
                    b(a)
                })
            }, c, d)
        }
    }), THREE.Cache = {
        enabled: !1,
        files: {},
        add: function(a, b) {
            !1 !== this.enabled && (this.files[a] = b)
        },
        get: function(a) {
            return !1 !== this.enabled ? this.files[a] : void 0
        },
        remove: function(a) {
            delete this.files[a]
        },
        clear: function() {
            this.files = {}
        }
    }, THREE.Loader = function() {
        this.onLoadStart = function() {}, this.onLoadProgress = function() {}, this.onLoadComplete = function() {}
    }, THREE.Loader.prototype = {
        constructor: THREE.Loader,
        crossOrigin: void 0,
        extractUrlBase: function(a) {
            return a = a.split("/"), 1 === a.length ? "./" : (a.pop(), a.join("/") + "/")
        },
        initMaterials: function(a, b, c) {
            for (var d = [], e = 0; e < a.length; ++e) d[e] = this.createMaterial(a[e], b, c);
            return d
        },
        createMaterial: function() {
            var a, b, c;
            return function(d, e, f) {
                function g(a, c, d, g, h) {
                    a = e + a;
                    var j = THREE.Loader.Handlers.get(a);
                    return null !== j ? a = j.load(a) : (b.setCrossOrigin(f), a = b.load(a)), void 0 !== c && (a.repeat.fromArray(c), 1 !== c[0] && (a.wrapS = THREE.RepeatWrapping), 1 !== c[1] && (a.wrapT = THREE.RepeatWrapping)), void 0 !== d && a.offset.fromArray(d), void 0 !== g && ("repeat" === g[0] && (a.wrapS = THREE.RepeatWrapping), "mirror" === g[0] && (a.wrapS = THREE.MirroredRepeatWrapping), "repeat" === g[1] && (a.wrapT = THREE.RepeatWrapping), "mirror" === g[1] && (a.wrapT = THREE.MirroredRepeatWrapping)), void 0 !== h && (a.anisotropy = h), c = THREE.Math.generateUUID(), i[c] = a, c
                }
                void 0 === a && (a = new THREE.Color), void 0 === b && (b = new THREE.TextureLoader), void 0 === c && (c = new THREE.MaterialLoader);
                var h, i = {},
                    j = {
                        uuid: THREE.Math.generateUUID(),
                        type: "MeshLambertMaterial"
                    };
                for (h in d) {
                    var k = d[h];
                    switch (h) {
                        case "DbgColor":
                        case "DbgIndex":
                        case "opticalDensity":
                        case "illumination":
                            break;
                        case "DbgName":
                            j.name = k;
                            break;
                        case "blending":
                            j.blending = THREE[k];
                            break;
                        case "colorAmbient":
                        case "mapAmbient":
                            console.warn("THREE.Loader.createMaterial:", h, "is no longer supported.");
                            break;
                        case "colorDiffuse":
                            j.color = a.fromArray(k).getHex();
                            break;
                        case "colorSpecular":
                            j.specular = a.fromArray(k).getHex();
                            break;
                        case "colorEmissive":
                            j.emissive = a.fromArray(k).getHex();
                            break;
                        case "specularCoef":
                            j.shininess = k;
                            break;
                        case "shading":
                            "basic" === k.toLowerCase() && (j.type = "MeshBasicMaterial"), "phong" === k.toLowerCase() && (j.type = "MeshPhongMaterial"), "standard" === k.toLowerCase() && (j.type = "MeshStandardMaterial");
                            break;
                        case "mapDiffuse":
                            j.map = g(k, d.mapDiffuseRepeat, d.mapDiffuseOffset, d.mapDiffuseWrap, d.mapDiffuseAnisotropy);
                            break;
                        case "mapDiffuseRepeat":
                        case "mapDiffuseOffset":
                        case "mapDiffuseWrap":
                        case "mapDiffuseAnisotropy":
                            break;
                        case "mapEmissive":
                            j.emissiveMap = g(k, d.mapEmissiveRepeat, d.mapEmissiveOffset, d.mapEmissiveWrap, d.mapEmissiveAnisotropy);
                            break;
                        case "mapEmissiveRepeat":
                        case "mapEmissiveOffset":
                        case "mapEmissiveWrap":
                        case "mapEmissiveAnisotropy":
                            break;
                        case "mapLight":
                            j.lightMap = g(k, d.mapLightRepeat, d.mapLightOffset, d.mapLightWrap, d.mapLightAnisotropy);
                            break;
                        case "mapLightRepeat":
                        case "mapLightOffset":
                        case "mapLightWrap":
                        case "mapLightAnisotropy":
                            break;
                        case "mapAO":
                            j.aoMap = g(k, d.mapAORepeat, d.mapAOOffset, d.mapAOWrap, d.mapAOAnisotropy);
                            break;
                        case "mapAORepeat":
                        case "mapAOOffset":
                        case "mapAOWrap":
                        case "mapAOAnisotropy":
                            break;
                        case "mapBump":
                            j.bumpMap = g(k, d.mapBumpRepeat, d.mapBumpOffset, d.mapBumpWrap, d.mapBumpAnisotropy);
                            break;
                        case "mapBumpScale":
                            j.bumpScale = k;
                            break;
                        case "mapBumpRepeat":
                        case "mapBumpOffset":
                        case "mapBumpWrap":
                        case "mapBumpAnisotropy":
                            break;
                        case "mapNormal":
                            j.normalMap = g(k, d.mapNormalRepeat, d.mapNormalOffset, d.mapNormalWrap, d.mapNormalAnisotropy);
                            break;
                        case "mapNormalFactor":
                            j.normalScale = [k, k];
                            break;
                        case "mapNormalRepeat":
                        case "mapNormalOffset":
                        case "mapNormalWrap":
                        case "mapNormalAnisotropy":
                            break;
                        case "mapSpecular":
                            j.specularMap = g(k, d.mapSpecularRepeat, d.mapSpecularOffset, d.mapSpecularWrap, d.mapSpecularAnisotropy);
                            break;
                        case "mapSpecularRepeat":
                        case "mapSpecularOffset":
                        case "mapSpecularWrap":
                        case "mapSpecularAnisotropy":
                            break;
                        case "mapMetalness":
                            j.metalnessMap = g(k, d.mapMetalnessRepeat, d.mapMetalnessOffset, d.mapMetalnessWrap, d.mapMetalnessAnisotropy);
                            break;
                        case "mapMetalnessRepeat":
                        case "mapMetalnessOffset":
                        case "mapMetalnessWrap":
                        case "mapMetalnessAnisotropy":
                            break;
                        case "mapRoughness":
                            j.roughnessMap = g(k, d.mapRoughnessRepeat, d.mapRoughnessOffset, d.mapRoughnessWrap, d.mapRoughnessAnisotropy);
                            break;
                        case "mapRoughnessRepeat":
                        case "mapRoughnessOffset":
                        case "mapRoughnessWrap":
                        case "mapRoughnessAnisotropy":
                            break;
                        case "mapAlpha":
                            j.alphaMap = g(k, d.mapAlphaRepeat, d.mapAlphaOffset, d.mapAlphaWrap, d.mapAlphaAnisotropy);
                            break;
                        case "mapAlphaRepeat":
                        case "mapAlphaOffset":
                        case "mapAlphaWrap":
                        case "mapAlphaAnisotropy":
                            break;
                        case "flipSided":
                            j.side = THREE.BackSide;
                            break;
                        case "doubleSided":
                            j.side = THREE.DoubleSide;
                            break;
                        case "transparency":
                            console.warn("THREE.Loader.createMaterial: transparency has been renamed to opacity"), j.opacity = k;
                            break;
                        case "depthTest":
                        case "depthWrite":
                        case "colorWrite":
                        case "opacity":
                        case "reflectivity":
                        case "transparent":
                        case "visible":
                        case "wireframe":
                            j[h] = k;
                            break;
                        case "vertexColors":
                            !0 === k && (j.vertexColors = THREE.VertexColors), "face" === k && (j.vertexColors = THREE.FaceColors);
                            break;
                        default:
                            console.error("THREE.Loader.createMaterial: Unsupported", h, k)
                    }
                }
                return "MeshBasicMaterial" === j.type && delete j.emissive, "MeshPhongMaterial" !== j.type && delete j.specular, 1 > j.opacity && (j.transparent = !0), c.setTextures(i), c.parse(j)
            }
        }()
    }, THREE.Loader.Handlers = {
        handlers: [],
        add: function(a, b) {
            this.handlers.push(a, b)
        },
        get: function(a) {
            for (var b = this.handlers, c = 0, d = b.length; d > c; c += 2) {
                var e = b[c + 1];
                if (b[c].test(a)) return e
            }
            return null
        }
    }, THREE.XHRLoader = function(a) {
        this.manager = void 0 !== a ? a : THREE.DefaultLoadingManager
    }, Object.assign(THREE.XHRLoader.prototype, {
        load: function(a, b, c, d) {
            void 0 !== this.path && (a = this.path + a);
            var e = this,
                f = THREE.Cache.get(a);
            if (void 0 !== f) return e.manager.itemStart(a), setTimeout(function() {
                b && b(f), e.manager.itemEnd(a)
            }, 0), f;
            var g = new XMLHttpRequest;
            return g.overrideMimeType("text/plain"), g.open("GET", a, !0), g.addEventListener("load", function(c) {
                var f = c.target.response;
                THREE.Cache.add(a, f), 200 === this.status ? (b && b(f), e.manager.itemEnd(a)) : 0 === this.status ? (console.warn("THREE.XHRLoader: HTTP Status 0 received."), b && b(f), e.manager.itemEnd(a)) : (d && d(c), e.manager.itemError(a))
            }, !1), void 0 !== c && g.addEventListener("progress", function(a) {
                c(a)
            }, !1), g.addEventListener("error", function(b) {
                d && d(b), e.manager.itemError(a)
            }, !1), void 0 !== this.responseType && (g.responseType = this.responseType), void 0 !== this.withCredentials && (g.withCredentials = this.withCredentials), g.send(null), e.manager.itemStart(a), g
        },
        setPath: function(a) {
            return this.path = a, this
        },
        setResponseType: function(a) {
            return this.responseType = a, this
        },
        setWithCredentials: function(a) {
            return this.withCredentials = a, this
        }
    }), THREE.FontLoader = function(a) {
        this.manager = void 0 !== a ? a : THREE.DefaultLoadingManager
    }, Object.assign(THREE.FontLoader.prototype, {
        load: function(a, b, c, d) {
            var e = this;
            new THREE.XHRLoader(this.manager).load(a, function(a) {
                var c;
                try {
                    c = JSON.parse(a)
                } catch (b) {
                    console.warn("THREE.FontLoader: typeface.js support is being deprecated. Use typeface.json instead."), c = JSON.parse(a.substring(65, a.length - 2))
                }
                a = e.parse(c), b && b(a)
            }, c, d)
        },
        parse: function(a) {
            return new THREE.Font(a)
        }
    }), THREE.ImageLoader = function(a) {
        this.manager = void 0 !== a ? a : THREE.DefaultLoadingManager
    }, Object.assign(THREE.ImageLoader.prototype, {
        load: function(a, b, c, d) {
            var e = this,
                f = document.createElementNS("http://www.w3.org/1999/xhtml", "img");
            if (f.onload = function() {
                    URL.revokeObjectURL(f.src), b && b(f), e.manager.itemEnd(a)
                }, 0 === a.indexOf("data:")) f.src = a;
            else {
                var g = new THREE.XHRLoader;
                g.setPath(this.path), g.setResponseType("blob"), g.load(a, function(a) {
                    f.src = URL.createObjectURL(a)
                }, c, d)
            }
            return e.manager.itemStart(a), f
        },
        setCrossOrigin: function(a) {
            return this.crossOrigin = a, this
        },
        setPath: function(a) {
            return this.path = a, this
        }
    }), THREE.JSONLoader = function(a) {
        "boolean" == typeof a && (console.warn("THREE.JSONLoader: showStatus parameter has been removed from constructor."), a = void 0), this.manager = void 0 !== a ? a : THREE.DefaultLoadingManager, this.withCredentials = !1
    }, Object.assign(THREE.JSONLoader.prototype, {
        load: function(a, b, c, d) {
            var e = this,
                f = this.texturePath && "string" == typeof this.texturePath ? this.texturePath : THREE.Loader.prototype.extractUrlBase(a),
                g = new THREE.XHRLoader(this.manager);
            g.setWithCredentials(this.withCredentials), g.load(a, function(c) {
                c = JSON.parse(c);
                var d = c.metadata;
                if (void 0 !== d && (d = d.type, void 0 !== d)) {
                    if ("object" === d.toLowerCase()) return void console.error("THREE.JSONLoader: " + a + " should be loaded with THREE.ObjectLoader instead.");
                    if ("scene" === d.toLowerCase()) return void console.error("THREE.JSONLoader: " + a + " should be loaded with THREE.SceneLoader instead.")
                }
                c = e.parse(c, f), b(c.geometry, c.materials)
            }, c, d)
        },
        setTexturePath: function(a) {
            this.texturePath = a
        },
        parse: function(a, b) {
            var c = new THREE.Geometry,
                d = void 0 !== a.scale ? 1 / a.scale : 1;
            return function(b) {
                    var d, e, f, g, h, i, j, k, l, m, n, o, p, q = a.faces;
                    i = a.vertices;
                    var r = a.normals,
                        s = a.colors,
                        t = 0;
                    if (void 0 !== a.uvs) {
                        for (d = 0; d < a.uvs.length; d++) a.uvs[d].length && t++;
                        for (d = 0; t > d; d++) c.faceVertexUvs[d] = []
                    }
                    for (g = 0, h = i.length; h > g;) d = new THREE.Vector3, d.x = i[g++] * b, d.y = i[g++] * b, d.z = i[g++] * b, c.vertices.push(d);
                    for (g = 0, h = q.length; h > g;)
                        if (b = q[g++], l = 1 & b, f = 2 & b, d = 8 & b, j = 16 & b, m = 32 & b, i = 64 & b, b &= 128, l) {
                            if (l = new THREE.Face3, l.a = q[g], l.b = q[g + 1], l.c = q[g + 3], n = new THREE.Face3, n.a = q[g + 1], n.b = q[g + 2], n.c = q[g + 3], g += 4, f && (f = q[g++], l.materialIndex = f, n.materialIndex = f), f = c.faces.length, d)
                                for (d = 0; t > d; d++)
                                    for (o = a.uvs[d], c.faceVertexUvs[d][f] = [], c.faceVertexUvs[d][f + 1] = [], e = 0; 4 > e; e++) k = q[g++], p = o[2 * k], k = o[2 * k + 1], p = new THREE.Vector2(p, k), 2 !== e && c.faceVertexUvs[d][f].push(p), 0 !== e && c.faceVertexUvs[d][f + 1].push(p);
                            if (j && (j = 3 * q[g++], l.normal.set(r[j++], r[j++], r[j]), n.normal.copy(l.normal)), m)
                                for (d = 0; 4 > d; d++) j = 3 * q[g++], m = new THREE.Vector3(r[j++], r[j++], r[j]), 2 !== d && l.vertexNormals.push(m), 0 !== d && n.vertexNormals.push(m);
                            if (i && (i = q[g++], i = s[i], l.color.setHex(i), n.color.setHex(i)), b)
                                for (d = 0; 4 > d; d++) i = q[g++], i = s[i], 2 !== d && l.vertexColors.push(new THREE.Color(i)), 0 !== d && n.vertexColors.push(new THREE.Color(i));
                            c.faces.push(l), c.faces.push(n)
                        } else {
                            if (l = new THREE.Face3, l.a = q[g++], l.b = q[g++], l.c = q[g++], f && (f = q[g++], l.materialIndex = f), f = c.faces.length, d)
                                for (d = 0; t > d; d++)
                                    for (o = a.uvs[d], c.faceVertexUvs[d][f] = [], e = 0; 3 > e; e++) k = q[g++], p = o[2 * k], k = o[2 * k + 1], p = new THREE.Vector2(p, k), c.faceVertexUvs[d][f].push(p);
                            if (j && (j = 3 * q[g++], l.normal.set(r[j++], r[j++], r[j])), m)
                                for (d = 0; 3 > d; d++) j = 3 * q[g++], m = new THREE.Vector3(r[j++], r[j++], r[j]), l.vertexNormals.push(m);
                            if (i && (i = q[g++], l.color.setHex(s[i])), b)
                                for (d = 0; 3 > d; d++) i = q[g++], l.vertexColors.push(new THREE.Color(s[i]));
                            c.faces.push(l)
                        }
                }(d),
                function() {
                    var b = void 0 !== a.influencesPerVertex ? a.influencesPerVertex : 2;
                    if (a.skinWeights)
                        for (var d = 0, e = a.skinWeights.length; e > d; d += b) c.skinWeights.push(new THREE.Vector4(a.skinWeights[d], b > 1 ? a.skinWeights[d + 1] : 0, b > 2 ? a.skinWeights[d + 2] : 0, b > 3 ? a.skinWeights[d + 3] : 0));
                    if (a.skinIndices)
                        for (d = 0, e = a.skinIndices.length; e > d; d += b) c.skinIndices.push(new THREE.Vector4(a.skinIndices[d], b > 1 ? a.skinIndices[d + 1] : 0, b > 2 ? a.skinIndices[d + 2] : 0, b > 3 ? a.skinIndices[d + 3] : 0));
                    c.bones = a.bones, c.bones && 0 < c.bones.length && (c.skinWeights.length !== c.skinIndices.length || c.skinIndices.length !== c.vertices.length) && console.warn("When skinning, number of vertices (" + c.vertices.length + "), skinIndices (" + c.skinIndices.length + "), and skinWeights (" + c.skinWeights.length + ") should match.")
                }(),
                function(b) {
                    if (void 0 !== a.morphTargets)
                        for (var d = 0, e = a.morphTargets.length; e > d; d++) {
                            c.morphTargets[d] = {}, c.morphTargets[d].name = a.morphTargets[d].name, c.morphTargets[d].vertices = [];
                            for (var f = c.morphTargets[d].vertices, g = a.morphTargets[d].vertices, h = 0, i = g.length; i > h; h += 3) {
                                var j = new THREE.Vector3;
                                j.x = g[h] * b, j.y = g[h + 1] * b, j.z = g[h + 2] * b, f.push(j)
                            }
                        }
                    if (void 0 !== a.morphColors && 0 < a.morphColors.length)
                        for (console.warn('THREE.JSONLoader: "morphColors" no longer supported. Using them as face colors.'), b = c.faces, f = a.morphColors[0].colors, d = 0, e = b.length; e > d; d++) b[d].color.fromArray(f, 3 * d)
                }(d),
                function() {
                    var b = [],
                        d = [];
                    void 0 !== a.animation && d.push(a.animation), void 0 !== a.animations && (a.animations.length ? d = d.concat(a.animations) : d.push(a.animations));
                    for (var e = 0; e < d.length; e++) {
                        var f = THREE.AnimationClip.parseAnimation(d[e], c.bones);
                        f && b.push(f)
                    }
                    c.morphTargets && (d = THREE.AnimationClip.CreateClipsFromMorphTargetSequences(c.morphTargets, 10), b = b.concat(d)), 0 < b.length && (c.animations = b)
                }(), c.computeFaceNormals(), c.computeBoundingSphere(), void 0 === a.materials || 0 === a.materials.length ? {
                    geometry: c
                } : (d = THREE.Loader.prototype.initMaterials(a.materials, b, this.crossOrigin), {
                    geometry: c,
                    materials: d
                })
        }
    }), THREE.LoadingManager = function(a, b, c) {
        var d = this,
            e = !1,
            f = 0,
            g = 0;
        this.onStart = void 0, this.onLoad = a, this.onProgress = b, this.onError = c, this.itemStart = function(a) {
            g++, !1 === e && void 0 !== d.onStart && d.onStart(a, f, g), e = !0
        }, this.itemEnd = function(a) {
            f++, void 0 !== d.onProgress && d.onProgress(a, f, g), f === g && (e = !1, void 0 !== d.onLoad) && d.onLoad()
        }, this.itemError = function(a) {
            void 0 !== d.onError && d.onError(a)
        }
    }, THREE.DefaultLoadingManager = new THREE.LoadingManager, THREE.BufferGeometryLoader = function(a) {
        this.manager = void 0 !== a ? a : THREE.DefaultLoadingManager
    }, Object.assign(THREE.BufferGeometryLoader.prototype, {
        load: function(a, b, c, d) {
            var e = this;
            new THREE.XHRLoader(e.manager).load(a, function(a) {
                b(e.parse(JSON.parse(a)))
            }, c, d)
        },
        parse: function(a) {
            var b = new THREE.BufferGeometry,
                c = a.data.index,
                d = {
                    Int8Array: Int8Array,
                    Uint8Array: Uint8Array,
                    Uint8ClampedArray: Uint8ClampedArray,
                    Int16Array: Int16Array,
                    Uint16Array: Uint16Array,
                    Int32Array: Int32Array,
                    Uint32Array: Uint32Array,
                    Float32Array: Float32Array,
                    Float64Array: Float64Array
                };
            void 0 !== c && (c = new d[c.type](c.array), b.setIndex(new THREE.BufferAttribute(c, 1)));
            var e, f = a.data.attributes;
            for (e in f) {
                var g = f[e],
                    c = new d[g.type](g.array);
                b.addAttribute(e, new THREE.BufferAttribute(c, g.itemSize, g.normalized))
            }
            if (d = a.data.groups || a.data.drawcalls || a.data.offsets, void 0 !== d)
                for (e = 0, c = d.length; e !== c; ++e) f = d[e], b.addGroup(f.start, f.count, f.materialIndex);
            return a = a.data.boundingSphere, void 0 !== a && (d = new THREE.Vector3, void 0 !== a.center && d.fromArray(a.center), b.boundingSphere = new THREE.Sphere(d, a.radius)), b
        }
    }), THREE.MaterialLoader = function(a) {
        this.manager = void 0 !== a ? a : THREE.DefaultLoadingManager, this.textures = {}
    }, Object.assign(THREE.MaterialLoader.prototype, {
        load: function(a, b, c, d) {
            var e = this;
            new THREE.XHRLoader(e.manager).load(a, function(a) {
                b(e.parse(JSON.parse(a)))
            }, c, d)
        },
        setTextures: function(a) {
            this.textures = a
        },
        getTexture: function(a) {
            var b = this.textures;
            return void 0 === b[a] && console.warn("THREE.MaterialLoader: Undefined texture", a), b[a]
        },
        parse: function(a) {
            var b = new THREE[a.type];
            if (void 0 !== a.uuid && (b.uuid = a.uuid), void 0 !== a.name && (b.name = a.name), void 0 !== a.color && b.color.setHex(a.color), void 0 !== a.roughness && (b.roughness = a.roughness), void 0 !== a.metalness && (b.metalness = a.metalness), void 0 !== a.emissive && b.emissive.setHex(a.emissive), void 0 !== a.specular && b.specular.setHex(a.specular), void 0 !== a.shininess && (b.shininess = a.shininess), void 0 !== a.uniforms && (b.uniforms = a.uniforms), void 0 !== a.vertexShader && (b.vertexShader = a.vertexShader), void 0 !== a.fragmentShader && (b.fragmentShader = a.fragmentShader), void 0 !== a.vertexColors && (b.vertexColors = a.vertexColors), void 0 !== a.shading && (b.shading = a.shading), void 0 !== a.blending && (b.blending = a.blending), void 0 !== a.side && (b.side = a.side), void 0 !== a.opacity && (b.opacity = a.opacity), void 0 !== a.transparent && (b.transparent = a.transparent), void 0 !== a.alphaTest && (b.alphaTest = a.alphaTest), void 0 !== a.depthTest && (b.depthTest = a.depthTest), void 0 !== a.depthWrite && (b.depthWrite = a.depthWrite), void 0 !== a.colorWrite && (b.colorWrite = a.colorWrite), void 0 !== a.wireframe && (b.wireframe = a.wireframe), void 0 !== a.wireframeLinewidth && (b.wireframeLinewidth = a.wireframeLinewidth), void 0 !== a.size && (b.size = a.size), void 0 !== a.sizeAttenuation && (b.sizeAttenuation = a.sizeAttenuation), void 0 !== a.map && (b.map = this.getTexture(a.map)), void 0 !== a.alphaMap && (b.alphaMap = this.getTexture(a.alphaMap), b.transparent = !0), void 0 !== a.bumpMap && (b.bumpMap = this.getTexture(a.bumpMap)), void 0 !== a.bumpScale && (b.bumpScale = a.bumpScale), void 0 !== a.normalMap && (b.normalMap = this.getTexture(a.normalMap)), void 0 !== a.normalScale) {
                var c = a.normalScale;
                !1 === Array.isArray(c) && (c = [c, c]), b.normalScale = (new THREE.Vector2).fromArray(c)
            }
            if (void 0 !== a.displacementMap && (b.displacementMap = this.getTexture(a.displacementMap)), void 0 !== a.displacementScale && (b.displacementScale = a.displacementScale), void 0 !== a.displacementBias && (b.displacementBias = a.displacementBias), void 0 !== a.roughnessMap && (b.roughnessMap = this.getTexture(a.roughnessMap)), void 0 !== a.metalnessMap && (b.metalnessMap = this.getTexture(a.metalnessMap)), void 0 !== a.emissiveMap && (b.emissiveMap = this.getTexture(a.emissiveMap)), void 0 !== a.emissiveIntensity && (b.emissiveIntensity = a.emissiveIntensity), void 0 !== a.specularMap && (b.specularMap = this.getTexture(a.specularMap)), void 0 !== a.envMap && (b.envMap = this.getTexture(a.envMap), b.combine = THREE.MultiplyOperation), void 0 !== a.reflectivity && (b.reflectivity = a.reflectivity), void 0 !== a.lightMap && (b.lightMap = this.getTexture(a.lightMap)), void 0 !== a.lightMapIntensity && (b.lightMapIntensity = a.lightMapIntensity), void 0 !== a.aoMap && (b.aoMap = this.getTexture(a.aoMap)), void 0 !== a.aoMapIntensity && (b.aoMapIntensity = a.aoMapIntensity), void 0 !== a.materials)
                for (var c = 0, d = a.materials.length; d > c; c++) b.materials.push(this.parse(a.materials[c]));
            return b
        }
    }), THREE.ObjectLoader = function(a) {
        this.manager = void 0 !== a ? a : THREE.DefaultLoadingManager, this.texturePath = ""
    }, Object.assign(THREE.ObjectLoader.prototype, {
        load: function(a, b, c, d) {
            "" === this.texturePath && (this.texturePath = a.substring(0, a.lastIndexOf("/") + 1));
            var e = this;
            new THREE.XHRLoader(e.manager).load(a, function(a) {
                e.parse(JSON.parse(a), b)
            }, c, d)
        },
        setTexturePath: function(a) {
            this.texturePath = a
        },
        setCrossOrigin: function(a) {
            this.crossOrigin = a
        },
        parse: function(a, b) {
            var c = this.parseGeometries(a.geometries),
                d = this.parseImages(a.images, function() {
                    void 0 !== b && b(e)
                }),
                d = this.parseTextures(a.textures, d),
                d = this.parseMaterials(a.materials, d),
                e = this.parseObject(a.object, c, d);
            return a.animations && (e.animations = this.parseAnimations(a.animations)), void 0 !== a.images && 0 !== a.images.length || void 0 === b || b(e), e
        },
        parseGeometries: function(a) {
            var b = {};
            if (void 0 !== a)
                for (var c = new THREE.JSONLoader, d = new THREE.BufferGeometryLoader, e = 0, f = a.length; f > e; e++) {
                    var g, h = a[e];
                    switch (h.type) {
                        case "PlaneGeometry":
                        case "PlaneBufferGeometry":
                            g = new THREE[h.type](h.width, h.height, h.widthSegments, h.heightSegments);
                            break;
                        case "BoxGeometry":
                        case "BoxBufferGeometry":
                        case "CubeGeometry":
                            g = new THREE[h.type](h.width, h.height, h.depth, h.widthSegments, h.heightSegments, h.depthSegments);
                            break;
                        case "CircleGeometry":
                        case "CircleBufferGeometry":
                            g = new THREE[h.type](h.radius, h.segments, h.thetaStart, h.thetaLength);
                            break;
                        case "CylinderGeometry":
                        case "CylinderBufferGeometry":
                            g = new THREE[h.type](h.radiusTop, h.radiusBottom, h.height, h.radialSegments, h.heightSegments, h.openEnded, h.thetaStart, h.thetaLength);
                            break;
                        case "ConeGeometry":
                        case "ConeBufferGeometry":
                            g = new THREE[h.type](h.radius, h.height, h.radialSegments, h.heightSegments, h.openEnded, h.thetaStart, h.thetaLength);
                            break;
                        case "SphereGeometry":
                        case "SphereBufferGeometry":
                            g = new THREE[h.type](h.radius, h.widthSegments, h.heightSegments, h.phiStart, h.phiLength, h.thetaStart, h.thetaLength);
                            break;
                        case "DodecahedronGeometry":
                        case "IcosahedronGeometry":
                        case "OctahedronGeometry":
                        case "TetrahedronGeometry":
                            g = new THREE[h.type](h.radius, h.detail);
                            break;
                        case "RingGeometry":
                        case "RingBufferGeometry":
                            g = new THREE[h.type](h.innerRadius, h.outerRadius, h.thetaSegments, h.phiSegments, h.thetaStart, h.thetaLength);
                            break;
                        case "TorusGeometry":
                        case "TorusBufferGeometry":
                            g = new THREE[h.type](h.radius, h.tube, h.radialSegments, h.tubularSegments, h.arc);
                            break;
                        case "TorusKnotGeometry":
                        case "TorusKnotBufferGeometry":
                            g = new THREE[h.type](h.radius, h.tube, h.tubularSegments, h.radialSegments, h.p, h.q);
                            break;
                        case "LatheGeometry":
                        case "LatheBufferGeometry":
                            g = new THREE[h.type](h.points, h.segments, h.phiStart, h.phiLength);
                            break;
                        case "BufferGeometry":
                            g = d.parse(h);
                            break;
                        case "Geometry":
                            g = c.parse(h.data, this.texturePath).geometry;
                            break;
                        default:
                            console.warn('THREE.ObjectLoader: Unsupported geometry type "' + h.type + '"');
                            continue
                    }
                    g.uuid = h.uuid, void 0 !== h.name && (g.name = h.name), b[h.uuid] = g
                }
            return b
        },
        parseMaterials: function(a, b) {
            var c = {};
            if (void 0 !== a) {
                var d = new THREE.MaterialLoader;
                d.setTextures(b);
                for (var e = 0, f = a.length; f > e; e++) {
                    var g = d.parse(a[e]);
                    c[g.uuid] = g
                }
            }
            return c
        },
        parseAnimations: function(a) {
            for (var b = [], c = 0; c < a.length; c++) {
                var d = THREE.AnimationClip.parse(a[c]);
                b.push(d)
            }
            return b
        },
        parseImages: function(a, b) {
            function c(a) {
                return d.manager.itemStart(a), g.load(a, function() {
                    d.manager.itemEnd(a)
                })
            }
            var d = this,
                e = {};
            if (void 0 !== a && 0 < a.length) {
                var f = new THREE.LoadingManager(b),
                    g = new THREE.ImageLoader(f);
                g.setCrossOrigin(this.crossOrigin);
                for (var f = 0, h = a.length; h > f; f++) {
                    var i = a[f],
                        j = /^(\/\/)|([a-z]+:(\/\/)?)/i.test(i.url) ? i.url : d.texturePath + i.url;
                    e[i.uuid] = c(j)
                }
            }
            return e
        },
        parseTextures: function(a, b) {
            function c(a) {
                return "number" == typeof a ? a : (console.warn("THREE.ObjectLoader.parseTexture: Constant should be in numeric form.", a), THREE[a])
            }
            var d = {};
            if (void 0 !== a)
                for (var e = 0, f = a.length; f > e; e++) {
                    var g = a[e];
                    void 0 === g.image && console.warn('THREE.ObjectLoader: No "image" specified for', g.uuid), void 0 === b[g.image] && console.warn("THREE.ObjectLoader: Undefined image", g.image);
                    var h = new THREE.Texture(b[g.image]);
                    h.needsUpdate = !0, h.uuid = g.uuid, void 0 !== g.name && (h.name = g.name), void 0 !== g.mapping && (h.mapping = c(g.mapping)), void 0 !== g.offset && h.offset.fromArray(g.offset), void 0 !== g.repeat && h.repeat.fromArray(g.repeat), void 0 !== g.wrap && (h.wrapS = c(g.wrap[0]), h.wrapT = c(g.wrap[1])), void 0 !== g.minFilter && (h.minFilter = c(g.minFilter)), void 0 !== g.magFilter && (h.magFilter = c(g.magFilter)), void 0 !== g.anisotropy && (h.anisotropy = g.anisotropy), void 0 !== g.flipY && (h.flipY = g.flipY), d[g.uuid] = h
                }
            return d
        },
        parseObject: function() {
            var a = new THREE.Matrix4;
            return function(b, c, d) {
                function e(a) {
                    return void 0 === c[a] && console.warn("THREE.ObjectLoader: Undefined geometry", a), c[a]
                }

                function f(a) {
                    return void 0 !== a ? (void 0 === d[a] && console.warn("THREE.ObjectLoader: Undefined material", a), d[a]) : void 0
                }
                var g;
                switch (b.type) {
                    case "Scene":
                        g = new THREE.Scene;
                        break;
                    case "PerspectiveCamera":
                        g = new THREE.PerspectiveCamera(b.fov, b.aspect, b.near, b.far), void 0 !== b.focus && (g.focus = b.focus), void 0 !== b.zoom && (g.zoom = b.zoom), void 0 !== b.filmGauge && (g.filmGauge = b.filmGauge), void 0 !== b.filmOffset && (g.filmOffset = b.filmOffset), void 0 !== b.view && (g.view = Object.assign({}, b.view));
                        break;
                    case "OrthographicCamera":
                        g = new THREE.OrthographicCamera(b.left, b.right, b.top, b.bottom, b.near, b.far);
                        break;
                    case "AmbientLight":
                        g = new THREE.AmbientLight(b.color, b.intensity);
                        break;
                    case "DirectionalLight":
                        g = new THREE.DirectionalLight(b.color, b.intensity);
                        break;
                    case "PointLight":
                        g = new THREE.PointLight(b.color, b.intensity, b.distance, b.decay);
                        break;
                    case "SpotLight":
                        g = new THREE.SpotLight(b.color, b.intensity, b.distance, b.angle, b.penumbra, b.decay);
                        break;
                    case "HemisphereLight":
                        g = new THREE.HemisphereLight(b.color, b.groundColor, b.intensity);
                        break;
                    case "Mesh":
                        g = e(b.geometry);
                        var h = f(b.material);
                        g = g.bones && 0 < g.bones.length ? new THREE.SkinnedMesh(g, h) : new THREE.Mesh(g, h);
                        break;
                    case "LOD":
                        g = new THREE.LOD;
                        break;
                    case "Line":
                        g = new THREE.Line(e(b.geometry), f(b.material), b.mode);
                        break;
                    case "PointCloud":
                    case "Points":
                        g = new THREE.Points(e(b.geometry), f(b.material));
                        break;
                    case "Sprite":
                        g = new THREE.Sprite(f(b.material));
                        break;
                    case "Group":
                        g = new THREE.Group;
                        break;
                    default:
                        g = new THREE.Object3D
                }
                if (g.uuid = b.uuid, void 0 !== b.name && (g.name = b.name), void 0 !== b.matrix ? (a.fromArray(b.matrix), a.decompose(g.position, g.quaternion, g.scale)) : (void 0 !== b.position && g.position.fromArray(b.position), void 0 !== b.rotation && g.rotation.fromArray(b.rotation), void 0 !== b.scale && g.scale.fromArray(b.scale)), void 0 !== b.castShadow && (g.castShadow = b.castShadow), void 0 !== b.receiveShadow && (g.receiveShadow = b.receiveShadow), void 0 !== b.visible && (g.visible = b.visible), void 0 !== b.userData && (g.userData = b.userData), void 0 !== b.children)
                    for (var i in b.children) g.add(this.parseObject(b.children[i], c, d));
                if ("LOD" === b.type)
                    for (b = b.levels, h = 0; h < b.length; h++) {
                        var j = b[h];
                        i = g.getObjectByProperty("uuid", j.object), void 0 !== i && g.addLevel(i, j.distance)
                    }
                return g
            }
        }()
    }), THREE.TextureLoader = function(a) {
        this.manager = void 0 !== a ? a : THREE.DefaultLoadingManager
    }, Object.assign(THREE.TextureLoader.prototype, {
        load: function(a, b, c, d) {
            var e = new THREE.Texture,
                f = new THREE.ImageLoader(this.manager);
            return f.setCrossOrigin(this.crossOrigin), f.setPath(this.path), f.load(a, function(c) {
                var d = 0 < a.search(/\.(jpg|jpeg)$/) || 0 === a.search(/^data\:image\/jpeg/);
                e.format = d ? THREE.RGBFormat : THREE.RGBAFormat, e.image = c, e.needsUpdate = !0, void 0 !== b && b(e)
            }, c, d), e
        },
        setCrossOrigin: function(a) {
            return this.crossOrigin = a, this
        },
        setPath: function(a) {
            return this.path = a, this
        }
    }), THREE.CubeTextureLoader = function(a) {
        this.manager = void 0 !== a ? a : THREE.DefaultLoadingManager
    }, Object.assign(THREE.CubeTextureLoader.prototype, {
        load: function(a, b, c, d) {
            function e(c) {
                g.load(a[c], function(a) {
                    f.images[c] = a, h++, 6 === h && (f.needsUpdate = !0, b && b(f))
                }, void 0, d)
            }
            var f = new THREE.CubeTexture,
                g = new THREE.ImageLoader(this.manager);
            g.setCrossOrigin(this.crossOrigin), g.setPath(this.path);
            var h = 0;
            for (c = 0; c < a.length; ++c) e(c);
            return f
        },
        setCrossOrigin: function(a) {
            return this.crossOrigin = a, this
        },
        setPath: function(a) {
            return this.path = a, this
        }
    }), THREE.DataTextureLoader = THREE.BinaryTextureLoader = function(a) {
        this.manager = void 0 !== a ? a : THREE.DefaultLoadingManager, this._parser = null
    }, Object.assign(THREE.BinaryTextureLoader.prototype, {
        load: function(a, b, c, d) {
            var e = this,
                f = new THREE.DataTexture,
                g = new THREE.XHRLoader(this.manager);
            return g.setResponseType("arraybuffer"), g.load(a, function(a) {
                (a = e._parser(a)) && (void 0 !== a.image ? f.image = a.image : void 0 !== a.data && (f.image.width = a.width, f.image.height = a.height, f.image.data = a.data), f.wrapS = void 0 !== a.wrapS ? a.wrapS : THREE.ClampToEdgeWrapping, f.wrapT = void 0 !== a.wrapT ? a.wrapT : THREE.ClampToEdgeWrapping, f.magFilter = void 0 !== a.magFilter ? a.magFilter : THREE.LinearFilter, f.minFilter = void 0 !== a.minFilter ? a.minFilter : THREE.LinearMipMapLinearFilter, f.anisotropy = void 0 !== a.anisotropy ? a.anisotropy : 1, void 0 !== a.format && (f.format = a.format), void 0 !== a.type && (f.type = a.type), void 0 !== a.mipmaps && (f.mipmaps = a.mipmaps), 1 === a.mipmapCount && (f.minFilter = THREE.LinearFilter), f.needsUpdate = !0, b && b(f, a))
            }, c, d), f
        }
    }), THREE.CompressedTextureLoader = function(a) {
        this.manager = void 0 !== a ? a : THREE.DefaultLoadingManager, this._parser = null
    }, Object.assign(THREE.CompressedTextureLoader.prototype, {
        load: function(a, b, c, d) {
            function e(e) {
                i.load(a[e], function(a) {
                    a = f._parser(a, !0), g[e] = {
                        width: a.width,
                        height: a.height,
                        format: a.format,
                        mipmaps: a.mipmaps
                    }, j += 1, 6 === j && (1 === a.mipmapCount && (h.minFilter = THREE.LinearFilter), h.format = a.format, h.needsUpdate = !0, b && b(h))
                }, c, d)
            }
            var f = this,
                g = [],
                h = new THREE.CompressedTexture;
            h.image = g;
            var i = new THREE.XHRLoader(this.manager);
            if (i.setPath(this.path), i.setResponseType("arraybuffer"), Array.isArray(a))
                for (var j = 0, k = 0, l = a.length; l > k; ++k) e(k);
            else i.load(a, function(a) {
                if (a = f._parser(a, !0), a.isCubemap)
                    for (var c = a.mipmaps.length / a.mipmapCount, d = 0; c > d; d++) {
                        g[d] = {
                            mipmaps: []
                        };
                        for (var e = 0; e < a.mipmapCount; e++) g[d].mipmaps.push(a.mipmaps[d * a.mipmapCount + e]), g[d].format = a.format, g[d].width = a.width, g[d].height = a.height
                    } else h.image.width = a.width, h.image.height = a.height, h.mipmaps = a.mipmaps;
                1 === a.mipmapCount && (h.minFilter = THREE.LinearFilter), h.format = a.format, h.needsUpdate = !0, b && b(h)
            }, c, d);
            return h
        },
        setPath: function(a) {
            return this.path = a, this
        }
    }), THREE.Material = function() {
        Object.defineProperty(this, "id", {
            value: THREE.MaterialIdCount++
        }), this.uuid = THREE.Math.generateUUID(), this.name = "", this.type = "Material", this.lights = this.fog = !0, this.blending = THREE.NormalBlending, this.side = THREE.FrontSide, this.shading = THREE.SmoothShading, this.vertexColors = THREE.NoColors, this.opacity = 1, this.transparent = !1, this.blendSrc = THREE.SrcAlphaFactor, this.blendDst = THREE.OneMinusSrcAlphaFactor, this.blendEquation = THREE.AddEquation, this.blendEquationAlpha = this.blendDstAlpha = this.blendSrcAlpha = null, this.depthFunc = THREE.LessEqualDepth, this.depthWrite = this.depthTest = !0, this.clippingPlanes = null, this.clipShadows = !1, this.colorWrite = !0, this.precision = null, this.polygonOffset = !1, this.alphaTest = this.polygonOffsetUnits = this.polygonOffsetFactor = 0, this.premultipliedAlpha = !1, this.overdraw = 0, this._needsUpdate = this.visible = !0
    }, THREE.Material.prototype = {
        constructor: THREE.Material,
        get needsUpdate() {
            return this._needsUpdate
        },
        set needsUpdate(a) {
            !0 === a && this.update(), this._needsUpdate = a
        },
        setValues: function(a) {
            if (void 0 !== a)
                for (var b in a) {
                    var c = a[b];
                    if (void 0 === c) console.warn("THREE.Material: '" + b + "' parameter is undefined.");
                    else {
                        var d = this[b];
                        void 0 === d ? console.warn("THREE." + this.type + ": '" + b + "' is not a property of this material.") : d instanceof THREE.Color ? d.set(c) : d instanceof THREE.Vector3 && c instanceof THREE.Vector3 ? d.copy(c) : this[b] = "overdraw" === b ? Number(c) : c
                    }
                }
        },
        toJSON: function(a) {
            function b(a) {
                var b, c = [];
                for (b in a) {
                    var d = a[b];
                    delete d.metadata, c.push(d)
                }
                return c
            }
            var c = void 0 === a;
            c && (a = {
                textures: {},
                images: {}
            });
            var d = {
                metadata: {
                    version: 4.4,
                    type: "Material",
                    generator: "Material.toJSON"
                }
            };
            return d.uuid = this.uuid, d.type = this.type, "" !== this.name && (d.name = this.name), this.color instanceof THREE.Color && (d.color = this.color.getHex()), void 0 !== this.roughness && (d.roughness = this.roughness), void 0 !== this.metalness && (d.metalness = this.metalness), this.emissive instanceof THREE.Color && (d.emissive = this.emissive.getHex()), this.specular instanceof THREE.Color && (d.specular = this.specular.getHex()), void 0 !== this.shininess && (d.shininess = this.shininess), this.map instanceof THREE.Texture && (d.map = this.map.toJSON(a).uuid), this.alphaMap instanceof THREE.Texture && (d.alphaMap = this.alphaMap.toJSON(a).uuid), this.lightMap instanceof THREE.Texture && (d.lightMap = this.lightMap.toJSON(a).uuid), this.bumpMap instanceof THREE.Texture && (d.bumpMap = this.bumpMap.toJSON(a).uuid, d.bumpScale = this.bumpScale), this.normalMap instanceof THREE.Texture && (d.normalMap = this.normalMap.toJSON(a).uuid, d.normalScale = this.normalScale.toArray()), this.displacementMap instanceof THREE.Texture && (d.displacementMap = this.displacementMap.toJSON(a).uuid, d.displacementScale = this.displacementScale, d.displacementBias = this.displacementBias), this.roughnessMap instanceof THREE.Texture && (d.roughnessMap = this.roughnessMap.toJSON(a).uuid), this.metalnessMap instanceof THREE.Texture && (d.metalnessMap = this.metalnessMap.toJSON(a).uuid), this.emissiveMap instanceof THREE.Texture && (d.emissiveMap = this.emissiveMap.toJSON(a).uuid), this.specularMap instanceof THREE.Texture && (d.specularMap = this.specularMap.toJSON(a).uuid), this.envMap instanceof THREE.Texture && (d.envMap = this.envMap.toJSON(a).uuid, d.reflectivity = this.reflectivity), void 0 !== this.size && (d.size = this.size), void 0 !== this.sizeAttenuation && (d.sizeAttenuation = this.sizeAttenuation), this.blending !== THREE.NormalBlending && (d.blending = this.blending), this.shading !== THREE.SmoothShading && (d.shading = this.shading), this.side !== THREE.FrontSide && (d.side = this.side), this.vertexColors !== THREE.NoColors && (d.vertexColors = this.vertexColors), 1 > this.opacity && (d.opacity = this.opacity), !0 === this.transparent && (d.transparent = this.transparent),
                0 < this.alphaTest && (d.alphaTest = this.alphaTest), !0 === this.premultipliedAlpha && (d.premultipliedAlpha = this.premultipliedAlpha), !0 === this.wireframe && (d.wireframe = this.wireframe), 1 < this.wireframeLinewidth && (d.wireframeLinewidth = this.wireframeLinewidth), c && (c = b(a.textures), a = b(a.images), 0 < c.length && (d.textures = c), 0 < a.length && (d.images = a)), d
        },
        clone: function() {
            return (new this.constructor).copy(this)
        },
        copy: function(a) {
            this.name = a.name, this.fog = a.fog, this.lights = a.lights, this.blending = a.blending, this.side = a.side, this.shading = a.shading, this.vertexColors = a.vertexColors, this.opacity = a.opacity, this.transparent = a.transparent, this.blendSrc = a.blendSrc, this.blendDst = a.blendDst, this.blendEquation = a.blendEquation, this.blendSrcAlpha = a.blendSrcAlpha, this.blendDstAlpha = a.blendDstAlpha, this.blendEquationAlpha = a.blendEquationAlpha, this.depthFunc = a.depthFunc, this.depthTest = a.depthTest, this.depthWrite = a.depthWrite, this.colorWrite = a.colorWrite, this.precision = a.precision, this.polygonOffset = a.polygonOffset, this.polygonOffsetFactor = a.polygonOffsetFactor, this.polygonOffsetUnits = a.polygonOffsetUnits, this.alphaTest = a.alphaTest, this.premultipliedAlpha = a.premultipliedAlpha, this.overdraw = a.overdraw, this.visible = a.visible, this.clipShadows = a.clipShadows, a = a.clippingPlanes;
            var b = null;
            if (null !== a)
                for (var c = a.length, b = Array(c), d = 0; d !== c; ++d) b[d] = a[d].clone();
            return this.clippingPlanes = b, this
        },
        update: function() {
            this.dispatchEvent({
                type: "update"
            })
        },
        dispose: function() {
            this.dispatchEvent({
                type: "dispose"
            })
        }
    }, Object.assign(THREE.Material.prototype, THREE.EventDispatcher.prototype), THREE.MaterialIdCount = 0, THREE.LineBasicMaterial = function(a) {
        THREE.Material.call(this), this.type = "LineBasicMaterial", this.color = new THREE.Color(16777215), this.linewidth = 1, this.linejoin = this.linecap = "round", this.lights = !1, this.setValues(a)
    }, THREE.LineBasicMaterial.prototype = Object.create(THREE.Material.prototype), THREE.LineBasicMaterial.prototype.constructor = THREE.LineBasicMaterial, THREE.LineBasicMaterial.prototype.copy = function(a) {
        return THREE.Material.prototype.copy.call(this, a), this.color.copy(a.color), this.linewidth = a.linewidth, this.linecap = a.linecap, this.linejoin = a.linejoin, this
    }, THREE.LineDashedMaterial = function(a) {
        THREE.Material.call(this), this.type = "LineDashedMaterial", this.color = new THREE.Color(16777215), this.scale = this.linewidth = 1, this.dashSize = 3, this.gapSize = 1, this.lights = !1, this.setValues(a)
    }, THREE.LineDashedMaterial.prototype = Object.create(THREE.Material.prototype), THREE.LineDashedMaterial.prototype.constructor = THREE.LineDashedMaterial, THREE.LineDashedMaterial.prototype.copy = function(a) {
        return THREE.Material.prototype.copy.call(this, a), this.color.copy(a.color), this.linewidth = a.linewidth, this.scale = a.scale, this.dashSize = a.dashSize, this.gapSize = a.gapSize, this
    }, THREE.MeshBasicMaterial = function(a) {
        THREE.Material.call(this), this.type = "MeshBasicMaterial", this.color = new THREE.Color(16777215), this.aoMap = this.map = null, this.aoMapIntensity = 1, this.envMap = this.alphaMap = this.specularMap = null, this.combine = THREE.MultiplyOperation, this.reflectivity = 1, this.refractionRatio = .98, this.wireframe = !1, this.wireframeLinewidth = 1, this.wireframeLinejoin = this.wireframeLinecap = "round", this.lights = this.morphTargets = this.skinning = !1, this.setValues(a)
    }, THREE.MeshBasicMaterial.prototype = Object.create(THREE.Material.prototype), THREE.MeshBasicMaterial.prototype.constructor = THREE.MeshBasicMaterial, THREE.MeshBasicMaterial.prototype.copy = function(a) {
        return THREE.Material.prototype.copy.call(this, a), this.color.copy(a.color), this.map = a.map, this.aoMap = a.aoMap, this.aoMapIntensity = a.aoMapIntensity, this.specularMap = a.specularMap, this.alphaMap = a.alphaMap, this.envMap = a.envMap, this.combine = a.combine, this.reflectivity = a.reflectivity, this.refractionRatio = a.refractionRatio, this.wireframe = a.wireframe, this.wireframeLinewidth = a.wireframeLinewidth, this.wireframeLinecap = a.wireframeLinecap, this.wireframeLinejoin = a.wireframeLinejoin, this.skinning = a.skinning, this.morphTargets = a.morphTargets, this
    }, THREE.MeshDepthMaterial = function(a) {
        THREE.Material.call(this), this.type = "MeshDepthMaterial", this.depthPacking = THREE.BasicDepthPacking, this.morphTargets = this.skinning = !1, this.displacementMap = this.alphaMap = this.map = null, this.displacementScale = 1, this.displacementBias = 0, this.wireframe = !1, this.wireframeLinewidth = 1, this.lights = this.fog = !1, this.setValues(a)
    }, THREE.MeshDepthMaterial.prototype = Object.create(THREE.Material.prototype), THREE.MeshDepthMaterial.prototype.constructor = THREE.MeshDepthMaterial, THREE.MeshDepthMaterial.prototype.copy = function(a) {
        return THREE.Material.prototype.copy.call(this, a), this.depthPacking = a.depthPacking, this.skinning = a.skinning, this.morphTargets = a.morphTargets, this.map = a.map, this.alphaMap = a.alphaMap, this.displacementMap = a.displacementMap, this.displacementScale = a.displacementScale, this.displacementBias = a.displacementBias, this.wireframe = a.wireframe, this.wireframeLinewidth = a.wireframeLinewidth, this
    }, THREE.MeshLambertMaterial = function(a) {
        THREE.Material.call(this), this.type = "MeshLambertMaterial", this.color = new THREE.Color(16777215), this.lightMap = this.map = null, this.lightMapIntensity = 1, this.aoMap = null, this.aoMapIntensity = 1, this.emissive = new THREE.Color(0), this.emissiveIntensity = 1, this.envMap = this.alphaMap = this.specularMap = this.emissiveMap = null, this.combine = THREE.MultiplyOperation, this.reflectivity = 1, this.refractionRatio = .98, this.wireframe = !1, this.wireframeLinewidth = 1, this.wireframeLinejoin = this.wireframeLinecap = "round", this.morphNormals = this.morphTargets = this.skinning = !1, this.setValues(a)
    }, THREE.MeshLambertMaterial.prototype = Object.create(THREE.Material.prototype), THREE.MeshLambertMaterial.prototype.constructor = THREE.MeshLambertMaterial, THREE.MeshLambertMaterial.prototype.copy = function(a) {
        return THREE.Material.prototype.copy.call(this, a), this.color.copy(a.color), this.map = a.map, this.lightMap = a.lightMap, this.lightMapIntensity = a.lightMapIntensity, this.aoMap = a.aoMap, this.aoMapIntensity = a.aoMapIntensity, this.emissive.copy(a.emissive), this.emissiveMap = a.emissiveMap, this.emissiveIntensity = a.emissiveIntensity, this.specularMap = a.specularMap, this.alphaMap = a.alphaMap, this.envMap = a.envMap, this.combine = a.combine, this.reflectivity = a.reflectivity, this.refractionRatio = a.refractionRatio, this.wireframe = a.wireframe, this.wireframeLinewidth = a.wireframeLinewidth, this.wireframeLinecap = a.wireframeLinecap, this.wireframeLinejoin = a.wireframeLinejoin, this.skinning = a.skinning, this.morphTargets = a.morphTargets, this.morphNormals = a.morphNormals, this
    }, THREE.MeshNormalMaterial = function(a) {
        THREE.Material.call(this, a), this.type = "MeshNormalMaterial", this.wireframe = !1, this.wireframeLinewidth = 1, this.morphTargets = this.lights = this.fog = !1, this.setValues(a)
    }, THREE.MeshNormalMaterial.prototype = Object.create(THREE.Material.prototype), THREE.MeshNormalMaterial.prototype.constructor = THREE.MeshNormalMaterial, THREE.MeshNormalMaterial.prototype.copy = function(a) {
        return THREE.Material.prototype.copy.call(this, a), this.wireframe = a.wireframe, this.wireframeLinewidth = a.wireframeLinewidth, this
    }, THREE.MeshPhongMaterial = function(a) {
        THREE.Material.call(this), this.type = "MeshPhongMaterial", this.color = new THREE.Color(16777215), this.specular = new THREE.Color(1118481), this.shininess = 30, this.lightMap = this.map = null, this.lightMapIntensity = 1, this.aoMap = null, this.aoMapIntensity = 1, this.emissive = new THREE.Color(0), this.emissiveIntensity = 1, this.bumpMap = this.emissiveMap = null, this.bumpScale = 1, this.normalMap = null, this.normalScale = new THREE.Vector2(1, 1), this.displacementMap = null, this.displacementScale = 1, this.displacementBias = 0, this.envMap = this.alphaMap = this.specularMap = null, this.combine = THREE.MultiplyOperation, this.reflectivity = 1, this.refractionRatio = .98, this.wireframe = !1, this.wireframeLinewidth = 1, this.wireframeLinejoin = this.wireframeLinecap = "round", this.morphNormals = this.morphTargets = this.skinning = !1, this.setValues(a)
    }, THREE.MeshPhongMaterial.prototype = Object.create(THREE.Material.prototype), THREE.MeshPhongMaterial.prototype.constructor = THREE.MeshPhongMaterial, THREE.MeshPhongMaterial.prototype.copy = function(a) {
        return THREE.Material.prototype.copy.call(this, a), this.color.copy(a.color), this.specular.copy(a.specular), this.shininess = a.shininess, this.map = a.map, this.lightMap = a.lightMap, this.lightMapIntensity = a.lightMapIntensity, this.aoMap = a.aoMap, this.aoMapIntensity = a.aoMapIntensity, this.emissive.copy(a.emissive), this.emissiveMap = a.emissiveMap, this.emissiveIntensity = a.emissiveIntensity, this.bumpMap = a.bumpMap, this.bumpScale = a.bumpScale, this.normalMap = a.normalMap, this.normalScale.copy(a.normalScale), this.displacementMap = a.displacementMap, this.displacementScale = a.displacementScale, this.displacementBias = a.displacementBias, this.specularMap = a.specularMap, this.alphaMap = a.alphaMap, this.envMap = a.envMap, this.combine = a.combine, this.reflectivity = a.reflectivity, this.refractionRatio = a.refractionRatio, this.wireframe = a.wireframe, this.wireframeLinewidth = a.wireframeLinewidth, this.wireframeLinecap = a.wireframeLinecap, this.wireframeLinejoin = a.wireframeLinejoin, this.skinning = a.skinning, this.morphTargets = a.morphTargets, this.morphNormals = a.morphNormals, this
    }, THREE.MeshStandardMaterial = function(a) {
        THREE.Material.call(this), this.defines = {
            STANDARD: ""
        }, this.type = "MeshStandardMaterial", this.color = new THREE.Color(16777215), this.metalness = this.roughness = .5, this.lightMap = this.map = null, this.lightMapIntensity = 1, this.aoMap = null, this.aoMapIntensity = 1, this.emissive = new THREE.Color(0), this.emissiveIntensity = 1, this.bumpMap = this.emissiveMap = null, this.bumpScale = 1, this.normalMap = null, this.normalScale = new THREE.Vector2(1, 1), this.displacementMap = null, this.displacementScale = 1, this.displacementBias = 0, this.envMap = this.alphaMap = this.metalnessMap = this.roughnessMap = null, this.envMapIntensity = 1, this.refractionRatio = .98, this.wireframe = !1, this.wireframeLinewidth = 1, this.wireframeLinejoin = this.wireframeLinecap = "round", this.morphNormals = this.morphTargets = this.skinning = !1, this.setValues(a)
    }, THREE.MeshStandardMaterial.prototype = Object.create(THREE.Material.prototype), THREE.MeshStandardMaterial.prototype.constructor = THREE.MeshStandardMaterial, THREE.MeshStandardMaterial.prototype.copy = function(a) {
        return THREE.Material.prototype.copy.call(this, a), this.defines = {
            STANDARD: ""
        }, this.color.copy(a.color), this.roughness = a.roughness, this.metalness = a.metalness, this.map = a.map, this.lightMap = a.lightMap, this.lightMapIntensity = a.lightMapIntensity, this.aoMap = a.aoMap, this.aoMapIntensity = a.aoMapIntensity, this.emissive.copy(a.emissive), this.emissiveMap = a.emissiveMap, this.emissiveIntensity = a.emissiveIntensity, this.bumpMap = a.bumpMap, this.bumpScale = a.bumpScale, this.normalMap = a.normalMap, this.normalScale.copy(a.normalScale), this.displacementMap = a.displacementMap, this.displacementScale = a.displacementScale, this.displacementBias = a.displacementBias, this.roughnessMap = a.roughnessMap, this.metalnessMap = a.metalnessMap, this.alphaMap = a.alphaMap, this.envMap = a.envMap, this.envMapIntensity = a.envMapIntensity, this.refractionRatio = a.refractionRatio, this.wireframe = a.wireframe, this.wireframeLinewidth = a.wireframeLinewidth, this.wireframeLinecap = a.wireframeLinecap, this.wireframeLinejoin = a.wireframeLinejoin, this.skinning = a.skinning, this.morphTargets = a.morphTargets, this.morphNormals = a.morphNormals, this
    }, THREE.MeshPhysicalMaterial = function(a) {
        THREE.MeshStandardMaterial.call(this), this.defines = {
            PHYSICAL: ""
        }, this.type = "MeshPhysicalMaterial", this.reflectivity = .5, this.clearCoatRoughness = this.clearCoat = 0, this.setValues(a)
    }, THREE.MeshPhysicalMaterial.prototype = Object.create(THREE.MeshStandardMaterial.prototype), THREE.MeshPhysicalMaterial.prototype.constructor = THREE.MeshPhysicalMaterial, THREE.MeshPhysicalMaterial.prototype.copy = function(a) {
        return THREE.MeshStandardMaterial.prototype.copy.call(this, a), this.defines = {
            PHYSICAL: ""
        }, this.reflectivity = a.reflectivity, this.clearCoat = a.clearCoat, this.clearCoatRoughness = a.clearCoatRoughness, this
    }, THREE.MultiMaterial = function(a) {
        this.uuid = THREE.Math.generateUUID(), this.type = "MultiMaterial", this.materials = a instanceof Array ? a : [], this.visible = !0
    }, THREE.MultiMaterial.prototype = {
        constructor: THREE.MultiMaterial,
        toJSON: function(a) {
            for (var b = {
                    metadata: {
                        version: 4.2,
                        type: "material",
                        generator: "MaterialExporter"
                    },
                    uuid: this.uuid,
                    type: this.type,
                    materials: []
                }, c = this.materials, d = 0, e = c.length; e > d; d++) {
                var f = c[d].toJSON(a);
                delete f.metadata, b.materials.push(f)
            }
            return b.visible = this.visible, b
        },
        clone: function() {
            for (var a = new this.constructor, b = 0; b < this.materials.length; b++) a.materials.push(this.materials[b].clone());
            return a.visible = this.visible, a
        }
    }, THREE.PointsMaterial = function(a) {
        THREE.Material.call(this), this.type = "PointsMaterial", this.color = new THREE.Color(16777215), this.map = null, this.size = 1, this.sizeAttenuation = !0, this.lights = !1, this.setValues(a)
    }, THREE.PointsMaterial.prototype = Object.create(THREE.Material.prototype), THREE.PointsMaterial.prototype.constructor = THREE.PointsMaterial, THREE.PointsMaterial.prototype.copy = function(a) {
        return THREE.Material.prototype.copy.call(this, a), this.color.copy(a.color), this.map = a.map, this.size = a.size, this.sizeAttenuation = a.sizeAttenuation, this
    }, THREE.ShaderMaterial = function(a) {
        THREE.Material.call(this), this.type = "ShaderMaterial", this.defines = {}, this.uniforms = {}, this.vertexShader = "void main() {\n	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\n}", this.fragmentShader = "void main() {\n	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );\n}", this.linewidth = 1, this.wireframe = !1, this.wireframeLinewidth = 1, this.morphNormals = this.morphTargets = this.skinning = this.clipping = this.lights = this.fog = !1, this.extensions = {
            derivatives: !1,
            fragDepth: !1,
            drawBuffers: !1,
            shaderTextureLOD: !1
        }, this.defaultAttributeValues = {
            color: [1, 1, 1],
            uv: [0, 0],
            uv2: [0, 0]
        }, this.index0AttributeName = void 0, void 0 !== a && (void 0 !== a.attributes && console.error("THREE.ShaderMaterial: attributes should now be defined in THREE.BufferGeometry instead."), this.setValues(a))
    }, THREE.ShaderMaterial.prototype = Object.create(THREE.Material.prototype), THREE.ShaderMaterial.prototype.constructor = THREE.ShaderMaterial, THREE.ShaderMaterial.prototype.copy = function(a) {
        return THREE.Material.prototype.copy.call(this, a), this.fragmentShader = a.fragmentShader, this.vertexShader = a.vertexShader, this.uniforms = THREE.UniformsUtils.clone(a.uniforms), this.defines = a.defines, this.wireframe = a.wireframe, this.wireframeLinewidth = a.wireframeLinewidth, this.lights = a.lights, this.clipping = a.clipping, this.skinning = a.skinning, this.morphTargets = a.morphTargets, this.morphNormals = a.morphNormals, this.extensions = a.extensions, this
    }, THREE.ShaderMaterial.prototype.toJSON = function(a) {
        return a = THREE.Material.prototype.toJSON.call(this, a), a.uniforms = this.uniforms, a.vertexShader = this.vertexShader, a.fragmentShader = this.fragmentShader, a
    }, THREE.RawShaderMaterial = function(a) {
        THREE.ShaderMaterial.call(this, a), this.type = "RawShaderMaterial"
    }, THREE.RawShaderMaterial.prototype = Object.create(THREE.ShaderMaterial.prototype), THREE.RawShaderMaterial.prototype.constructor = THREE.RawShaderMaterial, THREE.SpriteMaterial = function(a) {
        THREE.Material.call(this), this.type = "SpriteMaterial", this.color = new THREE.Color(16777215), this.map = null, this.rotation = 0, this.lights = this.fog = !1, this.setValues(a)
    }, THREE.SpriteMaterial.prototype = Object.create(THREE.Material.prototype), THREE.SpriteMaterial.prototype.constructor = THREE.SpriteMaterial, THREE.SpriteMaterial.prototype.copy = function(a) {
        return THREE.Material.prototype.copy.call(this, a), this.color.copy(a.color), this.map = a.map, this.rotation = a.rotation, this
    }, THREE.ShadowMaterial = function() {
        THREE.ShaderMaterial.call(this, {
            uniforms: THREE.UniformsUtils.merge([THREE.UniformsLib.lights, {
                opacity: {
                    value: 1
                }
            }]),
            vertexShader: THREE.ShaderChunk.shadow_vert,
            fragmentShader: THREE.ShaderChunk.shadow_frag
        }), this.transparent = this.lights = !0, Object.defineProperties(this, {
            opacity: {
                enumerable: !0,
                get: function() {
                    return this.uniforms.opacity.value
                },
                set: function(a) {
                    this.uniforms.opacity.value = a
                }
            }
        })
    }, THREE.ShadowMaterial.prototype = Object.create(THREE.ShaderMaterial.prototype), THREE.ShadowMaterial.prototype.constructor = THREE.ShadowMaterial, THREE.Texture = function(a, b, c, d, e, f, g, h, i, j) {
        Object.defineProperty(this, "id", {
            value: THREE.TextureIdCount++
        }), this.uuid = THREE.Math.generateUUID(), this.sourceFile = this.name = "", this.image = void 0 !== a ? a : THREE.Texture.DEFAULT_IMAGE, this.mipmaps = [], this.mapping = void 0 !== b ? b : THREE.Texture.DEFAULT_MAPPING, this.wrapS = void 0 !== c ? c : THREE.ClampToEdgeWrapping, this.wrapT = void 0 !== d ? d : THREE.ClampToEdgeWrapping, this.magFilter = void 0 !== e ? e : THREE.LinearFilter, this.minFilter = void 0 !== f ? f : THREE.LinearMipMapLinearFilter, this.anisotropy = void 0 !== i ? i : 1, this.format = void 0 !== g ? g : THREE.RGBAFormat, this.type = void 0 !== h ? h : THREE.UnsignedByteType, this.offset = new THREE.Vector2(0, 0), this.repeat = new THREE.Vector2(1, 1), this.generateMipmaps = !0, this.premultiplyAlpha = !1, this.flipY = !0, this.unpackAlignment = 4, this.encoding = void 0 !== j ? j : THREE.LinearEncoding, this.version = 0, this.onUpdate = null
    }, THREE.Texture.DEFAULT_IMAGE = void 0, THREE.Texture.DEFAULT_MAPPING = THREE.UVMapping, THREE.Texture.prototype = {
        constructor: THREE.Texture,
        set needsUpdate(a) {
            !0 === a && this.version++
        },
        clone: function() {
            return (new this.constructor).copy(this)
        },
        copy: function(a) {
            return this.image = a.image, this.mipmaps = a.mipmaps.slice(0), this.mapping = a.mapping, this.wrapS = a.wrapS, this.wrapT = a.wrapT, this.magFilter = a.magFilter, this.minFilter = a.minFilter, this.anisotropy = a.anisotropy, this.format = a.format, this.type = a.type, this.offset.copy(a.offset), this.repeat.copy(a.repeat), this.generateMipmaps = a.generateMipmaps, this.premultiplyAlpha = a.premultiplyAlpha, this.flipY = a.flipY, this.unpackAlignment = a.unpackAlignment, this.encoding = a.encoding, this
        },
        toJSON: function(a) {
            if (void 0 !== a.textures[this.uuid]) return a.textures[this.uuid];
            var b = {
                metadata: {
                    version: 4.4,
                    type: "Texture",
                    generator: "Texture.toJSON"
                },
                uuid: this.uuid,
                name: this.name,
                mapping: this.mapping,
                repeat: [this.repeat.x, this.repeat.y],
                offset: [this.offset.x, this.offset.y],
                wrap: [this.wrapS, this.wrapT],
                minFilter: this.minFilter,
                magFilter: this.magFilter,
                anisotropy: this.anisotropy,
                flipY: this.flipY
            };
            if (void 0 !== this.image) {
                var c = this.image;
                if (void 0 === c.uuid && (c.uuid = THREE.Math.generateUUID()), void 0 === a.images[c.uuid]) {
                    var d, e = a.images,
                        f = c.uuid,
                        g = c.uuid;
                    void 0 !== c.toDataURL ? d = c : (d = document.createElementNS("http://www.w3.org/1999/xhtml", "canvas"), d.width = c.width, d.height = c.height, d.getContext("2d").drawImage(c, 0, 0, c.width, c.height)), d = 2048 < d.width || 2048 < d.height ? d.toDataURL("image/jpeg", .6) : d.toDataURL("image/png"), e[f] = {
                        uuid: g,
                        url: d
                    }
                }
                b.image = c.uuid
            }
            return a.textures[this.uuid] = b
        },
        dispose: function() {
            this.dispatchEvent({
                type: "dispose"
            })
        },
        transformUv: function(a) {
            if (this.mapping === THREE.UVMapping) {
                if (a.multiply(this.repeat), a.add(this.offset), 0 > a.x || 1 < a.x) switch (this.wrapS) {
                    case THREE.RepeatWrapping:
                        a.x -= Math.floor(a.x);
                        break;
                    case THREE.ClampToEdgeWrapping:
                        a.x = 0 > a.x ? 0 : 1;
                        break;
                    case THREE.MirroredRepeatWrapping:
                        1 === Math.abs(Math.floor(a.x) % 2) ? a.x = Math.ceil(a.x) - a.x : a.x -= Math.floor(a.x)
                }
                if (0 > a.y || 1 < a.y) switch (this.wrapT) {
                    case THREE.RepeatWrapping:
                        a.y -= Math.floor(a.y);
                        break;
                    case THREE.ClampToEdgeWrapping:
                        a.y = 0 > a.y ? 0 : 1;
                        break;
                    case THREE.MirroredRepeatWrapping:
                        1 === Math.abs(Math.floor(a.y) % 2) ? a.y = Math.ceil(a.y) - a.y : a.y -= Math.floor(a.y)
                }
                this.flipY && (a.y = 1 - a.y)
            }
        }
    }, Object.assign(THREE.Texture.prototype, THREE.EventDispatcher.prototype), THREE.TextureIdCount = 0, THREE.DepthTexture = function(a, b, c, d, e, f, g, h, i) {
        THREE.Texture.call(this, null, d, e, f, g, h, THREE.DepthFormat, c, i), this.image = {
            width: a,
            height: b
        }, this.type = void 0 !== c ? c : THREE.UnsignedShortType, this.magFilter = void 0 !== g ? g : THREE.NearestFilter, this.minFilter = void 0 !== h ? h : THREE.NearestFilter, this.generateMipmaps = this.flipY = !1
    }, THREE.DepthTexture.prototype = Object.create(THREE.Texture.prototype), THREE.DepthTexture.prototype.constructor = THREE.DepthTexture, THREE.CanvasTexture = function(a, b, c, d, e, f, g, h, i) {
        THREE.Texture.call(this, a, b, c, d, e, f, g, h, i), this.needsUpdate = !0
    }, THREE.CanvasTexture.prototype = Object.create(THREE.Texture.prototype), THREE.CanvasTexture.prototype.constructor = THREE.CanvasTexture, THREE.CubeTexture = function(a, b, c, d, e, f, g, h, i, j) {
        a = void 0 !== a ? a : [], b = void 0 !== b ? b : THREE.CubeReflectionMapping, THREE.Texture.call(this, a, b, c, d, e, f, g, h, i, j), this.flipY = !1
    }, THREE.CubeTexture.prototype = Object.create(THREE.Texture.prototype), THREE.CubeTexture.prototype.constructor = THREE.CubeTexture, Object.defineProperty(THREE.CubeTexture.prototype, "images", {
        get: function() {
            return this.image
        },
        set: function(a) {
            this.image = a
        }
    }), THREE.CompressedTexture = function(a, b, c, d, e, f, g, h, i, j, k, l) {
        THREE.Texture.call(this, null, f, g, h, i, j, d, e, k, l), this.image = {
            width: b,
            height: c
        }, this.mipmaps = a, this.generateMipmaps = this.flipY = !1
    }, THREE.CompressedTexture.prototype = Object.create(THREE.Texture.prototype), THREE.CompressedTexture.prototype.constructor = THREE.CompressedTexture, THREE.DataTexture = function(a, b, c, d, e, f, g, h, i, j, k, l) {
        THREE.Texture.call(this, null, f, g, h, i, j, d, e, k, l), this.image = {
            data: a,
            width: b,
            height: c
        }, this.magFilter = void 0 !== i ? i : THREE.NearestFilter, this.minFilter = void 0 !== j ? j : THREE.NearestFilter, this.generateMipmaps = this.flipY = !1
    }, THREE.DataTexture.prototype = Object.create(THREE.Texture.prototype), THREE.DataTexture.prototype.constructor = THREE.DataTexture, THREE.VideoTexture = function(a, b, c, d, e, f, g, h, i) {
        function j() {
            requestAnimationFrame(j), a.readyState >= a.HAVE_CURRENT_DATA && (k.needsUpdate = !0)
        }
        THREE.Texture.call(this, a, b, c, d, e, f, g, h, i), this.generateMipmaps = !1;
        var k = this;
        j()
    }, THREE.VideoTexture.prototype = Object.create(THREE.Texture.prototype), THREE.VideoTexture.prototype.constructor = THREE.VideoTexture, THREE.Group = function() {
        THREE.Object3D.call(this), this.type = "Group"
    }, THREE.Group.prototype = Object.assign(Object.create(THREE.Object3D.prototype), {
        constructor: THREE.Group
    }), THREE.Points = function(a, b) {
        THREE.Object3D.call(this), this.type = "Points", this.geometry = void 0 !== a ? a : new THREE.BufferGeometry, this.material = void 0 !== b ? b : new THREE.PointsMaterial({
            color: 16777215 * Math.random()
        })
    }, THREE.Points.prototype = Object.assign(Object.create(THREE.Object3D.prototype), {
        constructor: THREE.Points,
        raycast: function() {
            var a = new THREE.Matrix4,
                b = new THREE.Ray,
                c = new THREE.Sphere;
            return function(d, e) {
                function f(a, c) {
                    var f = b.distanceSqToPoint(a);
                    if (k > f) {
                        var h = b.closestPointToPoint(a);
                        h.applyMatrix4(i);
                        var j = d.ray.origin.distanceTo(h);
                        j < d.near || j > d.far || e.push({
                            distance: j,
                            distanceToRay: Math.sqrt(f),
                            point: h.clone(),
                            index: c,
                            face: null,
                            object: g
                        })
                    }
                }
                var g = this,
                    h = this.geometry,
                    i = this.matrixWorld,
                    j = d.params.Points.threshold;
                if (null === h.boundingSphere && h.computeBoundingSphere(), c.copy(h.boundingSphere), c.applyMatrix4(i), !1 !== d.ray.intersectsSphere(c)) {
                    a.getInverse(i), b.copy(d.ray).applyMatrix4(a);
                    var j = j / ((this.scale.x + this.scale.y + this.scale.z) / 3),
                        k = j * j,
                        j = new THREE.Vector3;
                    if (h instanceof THREE.BufferGeometry) {
                        var l = h.index,
                            h = h.attributes.position.array;
                        if (null !== l)
                            for (var m = l.array, l = 0, n = m.length; n > l; l++) {
                                var o = m[l];
                                j.fromArray(h, 3 * o), f(j, o)
                            } else
                                for (l = 0, m = h.length / 3; m > l; l++) j.fromArray(h, 3 * l), f(j, l)
                    } else
                        for (j = h.vertices, l = 0, m = j.length; m > l; l++) f(j[l], l)
                }
            }
        }(),
        clone: function() {
            return new this.constructor(this.geometry, this.material).copy(this)
        }
    }), THREE.Line = function(a, b, c) {
        return 1 === c ? (console.warn("THREE.Line: parameter THREE.LinePieces no longer supported. Created THREE.LineSegments instead."), new THREE.LineSegments(a, b)) : (THREE.Object3D.call(this), this.type = "Line", this.geometry = void 0 !== a ? a : new THREE.BufferGeometry, void(this.material = void 0 !== b ? b : new THREE.LineBasicMaterial({
            color: 16777215 * Math.random()
        })))
    }, THREE.Line.prototype = Object.assign(Object.create(THREE.Object3D.prototype), {
        constructor: THREE.Line,
        raycast: function() {
            var a = new THREE.Matrix4,
                b = new THREE.Ray,
                c = new THREE.Sphere;
            return function(d, e) {
                var f = d.linePrecision,
                    f = f * f,
                    g = this.geometry,
                    h = this.matrixWorld;
                if (null === g.boundingSphere && g.computeBoundingSphere(), c.copy(g.boundingSphere), c.applyMatrix4(h), !1 !== d.ray.intersectsSphere(c)) {
                    a.getInverse(h), b.copy(d.ray).applyMatrix4(a);
                    var i = new THREE.Vector3,
                        j = new THREE.Vector3,
                        h = new THREE.Vector3,
                        k = new THREE.Vector3,
                        l = this instanceof THREE.LineSegments ? 2 : 1;
                    if (g instanceof THREE.BufferGeometry) {
                        var m = g.index,
                            n = g.attributes.position.array;
                        if (null !== m)
                            for (var m = m.array, g = 0, o = m.length - 1; o > g; g += l) {
                                var p = m[g + 1];
                                i.fromArray(n, 3 * m[g]), j.fromArray(n, 3 * p), p = b.distanceSqToSegment(i, j, k, h), p > f || (k.applyMatrix4(this.matrixWorld), p = d.ray.origin.distanceTo(k), p < d.near || p > d.far || e.push({
                                    distance: p,
                                    point: h.clone().applyMatrix4(this.matrixWorld),
                                    index: g,
                                    face: null,
                                    faceIndex: null,
                                    object: this
                                }))
                            } else
                                for (g = 0, o = n.length / 3 - 1; o > g; g += l) i.fromArray(n, 3 * g), j.fromArray(n, 3 * g + 3), p = b.distanceSqToSegment(i, j, k, h), p > f || (k.applyMatrix4(this.matrixWorld), p = d.ray.origin.distanceTo(k), p < d.near || p > d.far || e.push({
                                    distance: p,
                                    point: h.clone().applyMatrix4(this.matrixWorld),
                                    index: g,
                                    face: null,
                                    faceIndex: null,
                                    object: this
                                }))
                    } else if (g instanceof THREE.Geometry)
                        for (i = g.vertices, j = i.length, g = 0; j - 1 > g; g += l) p = b.distanceSqToSegment(i[g], i[g + 1], k, h), p > f || (k.applyMatrix4(this.matrixWorld), p = d.ray.origin.distanceTo(k), p < d.near || p > d.far || e.push({
                            distance: p,
                            point: h.clone().applyMatrix4(this.matrixWorld),
                            index: g,
                            face: null,
                            faceIndex: null,
                            object: this
                        }))
                }
            }
        }(),
        clone: function() {
            return new this.constructor(this.geometry, this.material).copy(this)
        }
    }), THREE.LineSegments = function(a, b) {
        THREE.Line.call(this, a, b), this.type = "LineSegments"
    }, THREE.LineSegments.prototype = Object.assign(Object.create(THREE.Line.prototype), {
        constructor: THREE.LineSegments
    }), THREE.Mesh = function(a, b) {
        THREE.Object3D.call(this), this.type = "Mesh", this.geometry = void 0 !== a ? a : new THREE.BufferGeometry, this.material = void 0 !== b ? b : new THREE.MeshBasicMaterial({
            color: 16777215 * Math.random()
        }), this.drawMode = THREE.TrianglesDrawMode, this.updateMorphTargets()
    }, THREE.Mesh.prototype = Object.assign(Object.create(THREE.Object3D.prototype), {
        constructor: THREE.Mesh,
        setDrawMode: function(a) {
            this.drawMode = a
        },
        copy: function(a) {
            return THREE.Object3D.prototype.copy.call(this, a), this.drawMode = a.drawMode, this
        },
        updateMorphTargets: function() {
            if (void 0 !== this.geometry.morphTargets && 0 < this.geometry.morphTargets.length) {
                this.morphTargetBase = -1, this.morphTargetInfluences = [], this.morphTargetDictionary = {};
                for (var a = 0, b = this.geometry.morphTargets.length; b > a; a++) this.morphTargetInfluences.push(0), this.morphTargetDictionary[this.geometry.morphTargets[a].name] = a
            }
        },
        getMorphTargetIndexByName: function(a) {
            return void 0 !== this.morphTargetDictionary[a] ? this.morphTargetDictionary[a] : (console.warn("THREE.Mesh.getMorphTargetIndexByName: morph target " + a + " does not exist. Returning 0."), 0)
        },
        raycast: function() {
            function a(a, b, c, d, e, f, g) {
                return THREE.Triangle.barycoordFromPoint(a, b, c, d, p), e.multiplyScalar(p.x), f.multiplyScalar(p.y), g.multiplyScalar(p.z), e.add(f).add(g), e.clone()
            }

            function b(a, b, c, d, e, f, g) {
                var h = a.material;
                return null === (h.side === THREE.BackSide ? c.intersectTriangle(f, e, d, !0, g) : c.intersectTriangle(d, e, f, h.side !== THREE.DoubleSide, g)) ? null : (r.copy(g), r.applyMatrix4(a.matrixWorld), c = b.ray.origin.distanceTo(r), c < b.near || c > b.far ? null : {
                    distance: c,
                    point: r.clone(),
                    object: a
                })
            }

            function c(c, d, e, f, j, k, l, p) {
                return g.fromArray(f, 3 * k), h.fromArray(f, 3 * l), i.fromArray(f, 3 * p), (c = b(c, d, e, g, h, i, q)) && (j && (m.fromArray(j, 2 * k), n.fromArray(j, 2 * l), o.fromArray(j, 2 * p), c.uv = a(q, g, h, i, m, n, o)), c.face = new THREE.Face3(k, l, p, THREE.Triangle.normal(g, h, i)), c.faceIndex = k), c
            }
            var d = new THREE.Matrix4,
                e = new THREE.Ray,
                f = new THREE.Sphere,
                g = new THREE.Vector3,
                h = new THREE.Vector3,
                i = new THREE.Vector3,
                j = new THREE.Vector3,
                k = new THREE.Vector3,
                l = new THREE.Vector3,
                m = new THREE.Vector2,
                n = new THREE.Vector2,
                o = new THREE.Vector2,
                p = new THREE.Vector3,
                q = new THREE.Vector3,
                r = new THREE.Vector3;
            return function(p, r) {
                var s = this.geometry,
                    t = this.material,
                    u = this.matrixWorld;
                if (void 0 !== t && (null === s.boundingSphere && s.computeBoundingSphere(), f.copy(s.boundingSphere), f.applyMatrix4(u), !1 !== p.ray.intersectsSphere(f) && (d.getInverse(u), e.copy(p.ray).applyMatrix4(d), null === s.boundingBox || !1 !== e.intersectsBox(s.boundingBox)))) {
                    var v, w;
                    if (s instanceof THREE.BufferGeometry) {
                        var x, y, t = s.index,
                            u = s.attributes,
                            s = u.position.array;
                        if (void 0 !== u.uv && (v = u.uv.array), null !== t)
                            for (var u = t.array, z = 0, A = u.length; A > z; z += 3) t = u[z], x = u[z + 1], y = u[z + 2], (w = c(this, p, e, s, v, t, x, y)) && (w.faceIndex = Math.floor(z / 3), r.push(w));
                        else
                            for (z = 0, A = s.length; A > z; z += 9) t = z / 3, x = t + 1, y = t + 2, (w = c(this, p, e, s, v, t, x, y)) && (w.index = t, r.push(w))
                    } else if (s instanceof THREE.Geometry) {
                        var B, C, u = t instanceof THREE.MultiMaterial,
                            z = !0 === u ? t.materials : null,
                            A = s.vertices;
                        x = s.faces, y = s.faceVertexUvs[0], 0 < y.length && (v = y);
                        for (var D = 0, E = x.length; E > D; D++) {
                            var F = x[D];
                            if (w = !0 === u ? z[F.materialIndex] : t, void 0 !== w) {
                                if (y = A[F.a], B = A[F.b], C = A[F.c], !0 === w.morphTargets) {
                                    w = s.morphTargets;
                                    var G = this.morphTargetInfluences;
                                    g.set(0, 0, 0), h.set(0, 0, 0), i.set(0, 0, 0);
                                    for (var H = 0, I = w.length; I > H; H++) {
                                        var J = G[H];
                                        if (0 !== J) {
                                            var K = w[H].vertices;
                                            g.addScaledVector(j.subVectors(K[F.a], y), J), h.addScaledVector(k.subVectors(K[F.b], B), J), i.addScaledVector(l.subVectors(K[F.c], C), J)
                                        }
                                    }
                                    g.add(y), h.add(B), i.add(C), y = g, B = h, C = i
                                }(w = b(this, p, e, y, B, C, q)) && (v && (G = v[D], m.copy(G[0]), n.copy(G[1]), o.copy(G[2]), w.uv = a(q, y, B, C, m, n, o)), w.face = F, w.faceIndex = D, r.push(w))
                            }
                        }
                    }
                }
            }
        }(),
        clone: function() {
            return new this.constructor(this.geometry, this.material).copy(this)
        }
    }), THREE.Bone = function(a) {
        THREE.Object3D.call(this), this.type = "Bone", this.skin = a
    }, THREE.Bone.prototype = Object.assign(Object.create(THREE.Object3D.prototype), {
        constructor: THREE.Bone,
        copy: function(a) {
            return THREE.Object3D.prototype.copy.call(this, a), this.skin = a.skin, this
        }
    }), THREE.Skeleton = function(a, b, c) {
        if (this.useVertexTexture = void 0 !== c ? c : !0, this.identityMatrix = new THREE.Matrix4, a = a || [], this.bones = a.slice(0), this.useVertexTexture ? (a = Math.sqrt(4 * this.bones.length), a = THREE.Math.nextPowerOfTwo(Math.ceil(a)), this.boneTextureHeight = this.boneTextureWidth = a = Math.max(a, 4), this.boneMatrices = new Float32Array(this.boneTextureWidth * this.boneTextureHeight * 4), this.boneTexture = new THREE.DataTexture(this.boneMatrices, this.boneTextureWidth, this.boneTextureHeight, THREE.RGBAFormat, THREE.FloatType)) : this.boneMatrices = new Float32Array(16 * this.bones.length), void 0 === b) this.calculateInverses();
        else if (this.bones.length === b.length) this.boneInverses = b.slice(0);
        else
            for (console.warn("THREE.Skeleton bonInverses is the wrong length."), this.boneInverses = [], b = 0, a = this.bones.length; a > b; b++) this.boneInverses.push(new THREE.Matrix4)
    }, Object.assign(THREE.Skeleton.prototype, {
        calculateInverses: function() {
            this.boneInverses = [];
            for (var a = 0, b = this.bones.length; b > a; a++) {
                var c = new THREE.Matrix4;
                this.bones[a] && c.getInverse(this.bones[a].matrixWorld), this.boneInverses.push(c)
            }
        },
        pose: function() {
            for (var a, b = 0, c = this.bones.length; c > b; b++)(a = this.bones[b]) && a.matrixWorld.getInverse(this.boneInverses[b]);
            for (b = 0, c = this.bones.length; c > b; b++)(a = this.bones[b]) && (a.parent instanceof THREE.Bone ? (a.matrix.getInverse(a.parent.matrixWorld), a.matrix.multiply(a.matrixWorld)) : a.matrix.copy(a.matrixWorld), a.matrix.decompose(a.position, a.quaternion, a.scale))
        },
        update: function() {
            var a = new THREE.Matrix4;
            return function() {
                for (var b = 0, c = this.bones.length; c > b; b++) a.multiplyMatrices(this.bones[b] ? this.bones[b].matrixWorld : this.identityMatrix, this.boneInverses[b]), a.toArray(this.boneMatrices, 16 * b);
                this.useVertexTexture && (this.boneTexture.needsUpdate = !0)
            }
        }(),
        clone: function() {
            return new THREE.Skeleton(this.bones, this.boneInverses, this.useVertexTexture)
        }
    }), THREE.SkinnedMesh = function(a, b, c) {
        if (THREE.Mesh.call(this, a, b), this.type = "SkinnedMesh", this.bindMode = "attached", this.bindMatrix = new THREE.Matrix4, this.bindMatrixInverse = new THREE.Matrix4, a = [], this.geometry && void 0 !== this.geometry.bones) {
            for (var d, e = 0, f = this.geometry.bones.length; f > e; ++e) d = this.geometry.bones[e], b = new THREE.Bone(this), a.push(b), b.name = d.name, b.position.fromArray(d.pos), b.quaternion.fromArray(d.rotq), void 0 !== d.scl && b.scale.fromArray(d.scl);
            for (e = 0, f = this.geometry.bones.length; f > e; ++e) d = this.geometry.bones[e], -1 !== d.parent && null !== d.parent && void 0 !== a[d.parent] ? a[d.parent].add(a[e]) : this.add(a[e])
        }
        this.normalizeSkinWeights(), this.updateMatrixWorld(!0), this.bind(new THREE.Skeleton(a, void 0, c), this.matrixWorld)
    }, THREE.SkinnedMesh.prototype = Object.assign(Object.create(THREE.Mesh.prototype), {
        constructor: THREE.SkinnedMesh,
        bind: function(a, b) {
            this.skeleton = a, void 0 === b && (this.updateMatrixWorld(!0), this.skeleton.calculateInverses(), b = this.matrixWorld), this.bindMatrix.copy(b), this.bindMatrixInverse.getInverse(b)
        },
        pose: function() {
            this.skeleton.pose()
        },
        normalizeSkinWeights: function() {
            if (this.geometry instanceof THREE.Geometry)
                for (var a = 0; a < this.geometry.skinWeights.length; a++) {
                    var b = this.geometry.skinWeights[a],
                        c = 1 / b.lengthManhattan();
                    1 / 0 !== c ? b.multiplyScalar(c) : b.set(1, 0, 0, 0)
                } else if (this.geometry instanceof THREE.BufferGeometry)
                    for (var b = new THREE.Vector4, d = this.geometry.attributes.skinWeight, a = 0; a < d.count; a++) b.x = d.getX(a), b.y = d.getY(a), b.z = d.getZ(a), b.w = d.getW(a), c = 1 / b.lengthManhattan(), 1 / 0 !== c ? b.multiplyScalar(c) : b.set(1, 0, 0, 0), d.setXYZW(a, b.x, b.y, b.z, b.w)
        },
        updateMatrixWorld: function(a) {
            THREE.Mesh.prototype.updateMatrixWorld.call(this, !0), "attached" === this.bindMode ? this.bindMatrixInverse.getInverse(this.matrixWorld) : "detached" === this.bindMode ? this.bindMatrixInverse.getInverse(this.bindMatrix) : console.warn("THREE.SkinnedMesh unrecognized bindMode: " + this.bindMode)
        },
        clone: function() {
            return new this.constructor(this.geometry, this.material, this.skeleton.useVertexTexture).copy(this)
        }
    }), THREE.LOD = function() {
        THREE.Object3D.call(this), this.type = "LOD", Object.defineProperties(this, {
            levels: {
                enumerable: !0,
                value: []
            }
        })
    }, THREE.LOD.prototype = Object.assign(Object.create(THREE.Object3D.prototype), {
        constructor: THREE.LOD,
        copy: function(a) {
            THREE.Object3D.prototype.copy.call(this, a, !1), a = a.levels;
            for (var b = 0, c = a.length; c > b; b++) {
                var d = a[b];
                this.addLevel(d.object.clone(), d.distance)
            }
            return this
        },
        addLevel: function(a, b) {
            void 0 === b && (b = 0), b = Math.abs(b);
            for (var c = this.levels, d = 0; d < c.length && !(b < c[d].distance); d++);
            c.splice(d, 0, {
                distance: b,
                object: a
            }), this.add(a)
        },
        getObjectForDistance: function(a) {
            for (var b = this.levels, c = 1, d = b.length; d > c && !(a < b[c].distance); c++);
            return b[c - 1].object
        },
        raycast: function() {
            var a = new THREE.Vector3;
            return function(b, c) {
                a.setFromMatrixPosition(this.matrixWorld);
                var d = b.ray.origin.distanceTo(a);
                this.getObjectForDistance(d).raycast(b, c)
            }
        }(),
        update: function() {
            var a = new THREE.Vector3,
                b = new THREE.Vector3;
            return function(c) {
                var d = this.levels;
                if (1 < d.length) {
                    a.setFromMatrixPosition(c.matrixWorld), b.setFromMatrixPosition(this.matrixWorld), c = a.distanceTo(b), d[0].object.visible = !0;
                    for (var e = 1, f = d.length; f > e && c >= d[e].distance; e++) d[e - 1].object.visible = !1, d[e].object.visible = !0;
                    for (; f > e; e++) d[e].object.visible = !1
                }
            }
        }(),
        toJSON: function(a) {
            a = THREE.Object3D.prototype.toJSON.call(this, a), a.object.levels = [];
            for (var b = this.levels, c = 0, d = b.length; d > c; c++) {
                var e = b[c];
                a.object.levels.push({
                    object: e.object.uuid,
                    distance: e.distance
                })
            }
            return a
        }
    }), THREE.Sprite = function(a) {
        THREE.Object3D.call(this), this.type = "Sprite", this.material = void 0 !== a ? a : new THREE.SpriteMaterial
    }, THREE.Sprite.prototype = Object.assign(Object.create(THREE.Object3D.prototype), {
        constructor: THREE.Sprite,
        raycast: function() {
            var a = new THREE.Vector3;
            return function(b, c) {
                a.setFromMatrixPosition(this.matrixWorld);
                var d = b.ray.distanceSqToPoint(a);
                d > this.scale.x * this.scale.y / 4 || c.push({
                    distance: Math.sqrt(d),
                    point: this.position,
                    face: null,
                    object: this
                })
            }
        }(),
        clone: function() {
            return new this.constructor(this.material).copy(this)
        }
    }), THREE.LensFlare = function(a, b, c, d, e) {
        THREE.Object3D.call(this), this.lensFlares = [], this.positionScreen = new THREE.Vector3, this.customUpdateCallback = void 0, void 0 !== a && this.add(a, b, c, d, e)
    }, THREE.LensFlare.prototype = Object.assign(Object.create(THREE.Object3D.prototype), {
        constructor: THREE.LensFlare,
        copy: function(a) {
            THREE.Object3D.prototype.copy.call(this, a), this.positionScreen.copy(a.positionScreen), this.customUpdateCallback = a.customUpdateCallback;
            for (var b = 0, c = a.lensFlares.length; c > b; b++) this.lensFlares.push(a.lensFlares[b]);
            return this
        },
        add: function(a, b, c, d, e, f) {
            void 0 === b && (b = -1), void 0 === c && (c = 0), void 0 === f && (f = 1), void 0 === e && (e = new THREE.Color(16777215)), void 0 === d && (d = THREE.NormalBlending), c = Math.min(c, Math.max(0, c)), this.lensFlares.push({
                texture: a,
                size: b,
                distance: c,
                x: 0,
                y: 0,
                z: 0,
                scale: 1,
                rotation: 0,
                opacity: f,
                color: e,
                blending: d
            })
        },
        updateLensFlares: function() {
            var a, b, c = this.lensFlares.length,
                d = 2 * -this.positionScreen.x,
                e = 2 * -this.positionScreen.y;
            for (a = 0; c > a; a++) b = this.lensFlares[a], b.x = this.positionScreen.x + d * b.distance, b.y = this.positionScreen.y + e * b.distance, b.wantedRotation = b.x * Math.PI * .25, b.rotation += .25 * (b.wantedRotation - b.rotation)
        }
    }), THREE.Scene = function() {
        THREE.Object3D.call(this), this.type = "Scene", this.overrideMaterial = this.fog = this.background = null, this.autoUpdate = !0
    }, THREE.Scene.prototype = Object.create(THREE.Object3D.prototype), THREE.Scene.prototype.constructor = THREE.Scene, THREE.Scene.prototype.copy = function(a, b) {
        return THREE.Object3D.prototype.copy.call(this, a, b), null !== a.background && (this.background = a.background.clone()), null !== a.fog && (this.fog = a.fog.clone()), null !== a.overrideMaterial && (this.overrideMaterial = a.overrideMaterial.clone()), this.autoUpdate = a.autoUpdate, this.matrixAutoUpdate = a.matrixAutoUpdate, this
    }, THREE.Fog = function(a, b, c) {
        this.name = "", this.color = new THREE.Color(a), this.near = void 0 !== b ? b : 1, this.far = void 0 !== c ? c : 1e3
    }, THREE.Fog.prototype.clone = function() {
        return new THREE.Fog(this.color.getHex(), this.near, this.far)
    }, THREE.FogExp2 = function(a, b) {
        this.name = "", this.color = new THREE.Color(a), this.density = void 0 !== b ? b : 25e-5
    }, THREE.FogExp2.prototype.clone = function() {
        return new THREE.FogExp2(this.color.getHex(), this.density)
    }, THREE.ShaderChunk = {}, THREE.ShaderChunk.alphamap_fragment = "#ifdef USE_ALPHAMAP\n	diffuseColor.a *= texture2D( alphaMap, vUv ).g;\n#endif\n", THREE.ShaderChunk.alphamap_pars_fragment = "#ifdef USE_ALPHAMAP\n	uniform sampler2D alphaMap;\n#endif\n", THREE.ShaderChunk.alphatest_fragment = "#ifdef ALPHATEST\n	if ( diffuseColor.a < ALPHATEST ) discard;\n#endif\n", THREE.ShaderChunk.aomap_fragment = "#ifdef USE_AOMAP\n	float ambientOcclusion = ( texture2D( aoMap, vUv2 ).r - 1.0 ) * aoMapIntensity + 1.0;\n	reflectedLight.indirectDiffuse *= ambientOcclusion;\n	#if defined( USE_ENVMAP ) && defined( PHYSICAL )\n		float dotNV = saturate( dot( geometry.normal, geometry.viewDir ) );\n		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.specularRoughness );\n	#endif\n#endif\n", THREE.ShaderChunk.aomap_pars_fragment = "#ifdef USE_AOMAP\n	uniform sampler2D aoMap;\n	uniform float aoMapIntensity;\n#endif", THREE.ShaderChunk.begin_vertex = "\nvec3 transformed = vec3( position );\n", THREE.ShaderChunk.beginnormal_vertex = "\nvec3 objectNormal = vec3( normal );\n", THREE.ShaderChunk.bsdfs = "bool testLightInRange( const in float lightDistance, const in float cutoffDistance ) {\n	return any( bvec2( cutoffDistance == 0.0, lightDistance < cutoffDistance ) );\n}\nfloat punctualLightIntensityToIrradianceFactor( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {\n		if( decayExponent > 0.0 ) {\n#if defined ( PHYSICALLY_CORRECT_LIGHTS )\n			float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );\n			float maxDistanceCutoffFactor = pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );\n			return distanceFalloff * maxDistanceCutoffFactor;\n#else\n			return pow( saturate( -lightDistance / cutoffDistance + 1.0 ), decayExponent );\n#endif\n		}\n		return 1.0;\n}\nvec3 BRDF_Diffuse_Lambert( const in vec3 diffuseColor ) {\n	return RECIPROCAL_PI * diffuseColor;\n}\nvec3 F_Schlick( const in vec3 specularColor, const in float dotLH ) {\n	float fresnel = exp2( ( -5.55473 * dotLH - 6.98316 ) * dotLH );\n	return ( 1.0 - specularColor ) * fresnel + specularColor;\n}\nfloat G_GGX_Smith( const in float alpha, const in float dotNL, const in float dotNV ) {\n	float a2 = pow2( alpha );\n	float gl = dotNL + sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );\n	float gv = dotNV + sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );\n	return 1.0 / ( gl * gv );\n}\nfloat G_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {\n	float a2 = pow2( alpha );\n	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );\n	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );\n	return 0.5 / max( gv + gl, EPSILON );\n}\nfloat D_GGX( const in float alpha, const in float dotNH ) {\n	float a2 = pow2( alpha );\n	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;\n	return RECIPROCAL_PI * a2 / pow2( denom );\n}\nvec3 BRDF_Specular_GGX( const in IncidentLight incidentLight, const in GeometricContext geometry, const in vec3 specularColor, const in float roughness ) {\n	float alpha = pow2( roughness );\n	vec3 halfDir = normalize( incidentLight.direction + geometry.viewDir );\n	float dotNL = saturate( dot( geometry.normal, incidentLight.direction ) );\n	float dotNV = saturate( dot( geometry.normal, geometry.viewDir ) );\n	float dotNH = saturate( dot( geometry.normal, halfDir ) );\n	float dotLH = saturate( dot( incidentLight.direction, halfDir ) );\n	vec3 F = F_Schlick( specularColor, dotLH );\n	float G = G_GGX_SmithCorrelated( alpha, dotNL, dotNV );\n	float D = D_GGX( alpha, dotNH );\n	return F * ( G * D );\n}\nvec3 BRDF_Specular_GGX_Environment( const in GeometricContext geometry, const in vec3 specularColor, const in float roughness ) {\n	float dotNV = saturate( dot( geometry.normal, geometry.viewDir ) );\n	const vec4 c0 = vec4( - 1, - 0.0275, - 0.572, 0.022 );\n	const vec4 c1 = vec4( 1, 0.0425, 1.04, - 0.04 );\n	vec4 r = roughness * c0 + c1;\n	float a004 = min( r.x * r.x, exp2( - 9.28 * dotNV ) ) * r.x + r.y;\n	vec2 AB = vec2( -1.04, 1.04 ) * a004 + r.zw;\n	return specularColor * AB.x + AB.y;\n}\nfloat G_BlinnPhong_Implicit( ) {\n	return 0.25;\n}\nfloat D_BlinnPhong( const in float shininess, const in float dotNH ) {\n	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );\n}\nvec3 BRDF_Specular_BlinnPhong( const in IncidentLight incidentLight, const in GeometricContext geometry, const in vec3 specularColor, const in float shininess ) {\n	vec3 halfDir = normalize( incidentLight.direction + geometry.viewDir );\n	float dotNH = saturate( dot( geometry.normal, halfDir ) );\n	float dotLH = saturate( dot( incidentLight.direction, halfDir ) );\n	vec3 F = F_Schlick( specularColor, dotLH );\n	float G = G_BlinnPhong_Implicit( );\n	float D = D_BlinnPhong( shininess, dotNH );\n	return F * ( G * D );\n}\nfloat GGXRoughnessToBlinnExponent( const in float ggxRoughness ) {\n	return ( 2.0 / pow2( ggxRoughness + 0.0001 ) - 2.0 );\n}\nfloat BlinnExponentToGGXRoughness( const in float blinnExponent ) {\n	return sqrt( 2.0 / ( blinnExponent + 2.0 ) );\n}\n", THREE.ShaderChunk.bumpmap_pars_fragment = "#ifdef USE_BUMPMAP\n	uniform sampler2D bumpMap;\n	uniform float bumpScale;\n	vec2 dHdxy_fwd() {\n		vec2 dSTdx = dFdx( vUv );\n		vec2 dSTdy = dFdy( vUv );\n		float Hll = bumpScale * texture2D( bumpMap, vUv ).x;\n		float dBx = bumpScale * texture2D( bumpMap, vUv + dSTdx ).x - Hll;\n		float dBy = bumpScale * texture2D( bumpMap, vUv + dSTdy ).x - Hll;\n		return vec2( dBx, dBy );\n	}\n	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy ) {\n		vec3 vSigmaX = dFdx( surf_pos );\n		vec3 vSigmaY = dFdy( surf_pos );\n		vec3 vN = surf_norm;\n		vec3 R1 = cross( vSigmaY, vN );\n		vec3 R2 = cross( vN, vSigmaX );\n		float fDet = dot( vSigmaX, R1 );\n		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );\n		return normalize( abs( fDet ) * surf_norm - vGrad );\n	}\n#endif\n", THREE.ShaderChunk.clipping_planes_fragment = "#if NUM_CLIPPING_PLANES > 0\n	for ( int i = 0; i < NUM_CLIPPING_PLANES; ++ i ) {\n		vec4 plane = clippingPlanes[ i ];\n		if ( dot( vViewPosition, plane.xyz ) > plane.w ) discard;\n	}\n#endif\n", THREE.ShaderChunk.clipping_planes_pars_fragment = "#if NUM_CLIPPING_PLANES > 0\n	#if ! defined( PHYSICAL ) && ! defined( PHONG )\n		varying vec3 vViewPosition;\n	#endif\n	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];\n#endif\n", THREE.ShaderChunk.clipping_planes_pars_vertex = "#if NUM_CLIPPING_PLANES > 0 && ! defined( PHYSICAL ) && ! defined( PHONG )\n	varying vec3 vViewPosition;\n#endif\n", THREE.ShaderChunk.clipping_planes_vertex = "#if NUM_CLIPPING_PLANES > 0 && ! defined( PHYSICAL ) && ! defined( PHONG )\n	vViewPosition = - mvPosition.xyz;\n#endif\n", THREE.ShaderChunk.color_fragment = "#ifdef USE_COLOR\n	diffuseColor.rgb *= vColor;\n#endif", THREE.ShaderChunk.color_pars_fragment = "#ifdef USE_COLOR\n	varying vec3 vColor;\n#endif\n", THREE.ShaderChunk.color_pars_vertex = "#ifdef USE_COLOR\n	varying vec3 vColor;\n#endif", THREE.ShaderChunk.color_vertex = "#ifdef USE_COLOR\n	vColor.xyz = color.xyz;\n#endif", THREE.ShaderChunk.common = "#define PI 3.14159265359\n#define PI2 6.28318530718\n#define RECIPROCAL_PI 0.31830988618\n#define RECIPROCAL_PI2 0.15915494\n#define LOG2 1.442695\n#define EPSILON 1e-6\n#define saturate(a) clamp( a, 0.0, 1.0 )\n#define whiteCompliment(a) ( 1.0 - saturate( a ) )\nfloat pow2( const in float x ) { return x*x; }\nfloat pow3( const in float x ) { return x*x*x; }\nfloat pow4( const in float x ) { float x2 = x*x; return x2*x2; }\nfloat average( const in vec3 color ) { return dot( color, vec3( 0.3333 ) ); }\nhighp float rand( const in vec2 uv ) {\n	const highp float a = 12.9898, b = 78.233, c = 43758.5453;\n	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );\n	return fract(sin(sn) * c);\n}\nstruct IncidentLight {\n	vec3 color;\n	vec3 direction;\n	bool visible;\n};\nstruct ReflectedLight {\n	vec3 directDiffuse;\n	vec3 directSpecular;\n	vec3 indirectDiffuse;\n	vec3 indirectSpecular;\n};\nstruct GeometricContext {\n	vec3 position;\n	vec3 normal;\n	vec3 viewDir;\n};\nvec3 transformDirection( in vec3 dir, in mat4 matrix ) {\n	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );\n}\nvec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {\n	return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );\n}\nvec3 projectOnPlane(in vec3 point, in vec3 pointOnPlane, in vec3 planeNormal ) {\n	float distance = dot( planeNormal, point - pointOnPlane );\n	return - distance * planeNormal + point;\n}\nfloat sideOfPlane( in vec3 point, in vec3 pointOnPlane, in vec3 planeNormal ) {\n	return sign( dot( point - pointOnPlane, planeNormal ) );\n}\nvec3 linePlaneIntersect( in vec3 pointOnLine, in vec3 lineDirection, in vec3 pointOnPlane, in vec3 planeNormal ) {\n	return lineDirection * ( dot( planeNormal, pointOnPlane - pointOnLine ) / dot( planeNormal, lineDirection ) ) + pointOnLine;\n}\n", THREE.ShaderChunk.cube_uv_reflection_fragment = "#ifdef ENVMAP_TYPE_CUBE_UV\n#define cubeUV_textureSize (1024.0)\nint getFaceFromDirection(vec3 direction) {\n	vec3 absDirection = abs(direction);\n	int face = -1;\n	if( absDirection.x > absDirection.z ) {\n		if(absDirection.x > absDirection.y )\n			face = direction.x > 0.0 ? 0 : 3;\n		else\n			face = direction.y > 0.0 ? 1 : 4;\n	}\n	else {\n		if(absDirection.z > absDirection.y )\n			face = direction.z > 0.0 ? 2 : 5;\n		else\n			face = direction.y > 0.0 ? 1 : 4;\n	}\n	return face;\n}\n#define cubeUV_maxLods1  (log2(cubeUV_textureSize*0.25) - 1.0)\n#define cubeUV_rangeClamp (exp2((6.0 - 1.0) * 2.0))\nvec2 MipLevelInfo( vec3 vec, float roughnessLevel, float roughness ) {\n	float scale = exp2(cubeUV_maxLods1 - roughnessLevel);\n	float dxRoughness = dFdx(roughness);\n	float dyRoughness = dFdy(roughness);\n	vec3 dx = dFdx( vec * scale * dxRoughness );\n	vec3 dy = dFdy( vec * scale * dyRoughness );\n	float d = max( dot( dx, dx ), dot( dy, dy ) );\n	d = clamp(d, 1.0, cubeUV_rangeClamp);\n	float mipLevel = 0.5 * log2(d);\n	return vec2(floor(mipLevel), fract(mipLevel));\n}\n#define cubeUV_maxLods2 (log2(cubeUV_textureSize*0.25) - 2.0)\n#define cubeUV_rcpTextureSize (1.0 / cubeUV_textureSize)\nvec2 getCubeUV(vec3 direction, float roughnessLevel, float mipLevel) {\n	mipLevel = roughnessLevel > cubeUV_maxLods2 - 3.0 ? 0.0 : mipLevel;\n	float a = 16.0 * cubeUV_rcpTextureSize;\n	vec2 exp2_packed = exp2( vec2( roughnessLevel, mipLevel ) );\n	vec2 rcp_exp2_packed = vec2( 1.0 ) / exp2_packed;\n	float powScale = exp2_packed.x * exp2_packed.y;\n	float scale = rcp_exp2_packed.x * rcp_exp2_packed.y * 0.25;\n	float mipOffset = 0.75*(1.0 - rcp_exp2_packed.y) * rcp_exp2_packed.x;\n	bool bRes = mipLevel == 0.0;\n	scale =  bRes && (scale < a) ? a : scale;\n	vec3 r;\n	vec2 offset;\n	int face = getFaceFromDirection(direction);\n	float rcpPowScale = 1.0 / powScale;\n	if( face == 0) {\n		r = vec3(direction.x, -direction.z, direction.y);\n		offset = vec2(0.0+mipOffset,0.75 * rcpPowScale);\n		offset.y = bRes && (offset.y < 2.0*a) ?  a : offset.y;\n	}\n	else if( face == 1) {\n		r = vec3(direction.y, direction.x, direction.z);\n		offset = vec2(scale+mipOffset, 0.75 * rcpPowScale);\n		offset.y = bRes && (offset.y < 2.0*a) ?  a : offset.y;\n	}\n	else if( face == 2) {\n		r = vec3(direction.z, direction.x, direction.y);\n		offset = vec2(2.0*scale+mipOffset, 0.75 * rcpPowScale);\n		offset.y = bRes && (offset.y < 2.0*a) ?  a : offset.y;\n	}\n	else if( face == 3) {\n		r = vec3(direction.x, direction.z, direction.y);\n		offset = vec2(0.0+mipOffset,0.5 * rcpPowScale);\n		offset.y = bRes && (offset.y < 2.0*a) ?  0.0 : offset.y;\n	}\n	else if( face == 4) {\n		r = vec3(direction.y, direction.x, -direction.z);\n		offset = vec2(scale+mipOffset, 0.5 * rcpPowScale);\n		offset.y = bRes && (offset.y < 2.0*a) ?  0.0 : offset.y;\n	}\n	else {\n		r = vec3(direction.z, -direction.x, direction.y);\n		offset = vec2(2.0*scale+mipOffset, 0.5 * rcpPowScale);\n		offset.y = bRes && (offset.y < 2.0*a) ?  0.0 : offset.y;\n	}\n	r = normalize(r);\n	float texelOffset = 0.5 * cubeUV_rcpTextureSize;\n	vec2 s = ( r.yz / abs( r.x ) + vec2( 1.0 ) ) * 0.5;\n	vec2 base = offset + vec2( texelOffset );\n	return base + s * ( scale - 2.0 * texelOffset );\n}\n#define cubeUV_maxLods3 (log2(cubeUV_textureSize*0.25) - 3.0)\nvec4 textureCubeUV(vec3 reflectedDirection, float roughness ) {\n	float roughnessVal = roughness* cubeUV_maxLods3;\n	float r1 = floor(roughnessVal);\n	float r2 = r1 + 1.0;\n	float t = fract(roughnessVal);\n	vec2 mipInfo = MipLevelInfo(reflectedDirection, r1, roughness);\n	float s = mipInfo.y;\n	float level0 = mipInfo.x;\n	float level1 = level0 + 1.0;\n	level1 = level1 > 5.0 ? 5.0 : level1;\n	level0 += min( floor( s + 0.5 ), 5.0 );\n	vec2 uv_10 = getCubeUV(reflectedDirection, r1, level0);\n	vec4 color10 = envMapTexelToLinear(texture2D(envMap, uv_10));\n	vec2 uv_20 = getCubeUV(reflectedDirection, r2, level0);\n	vec4 color20 = envMapTexelToLinear(texture2D(envMap, uv_20));\n	vec4 result = mix(color10, color20, t);\n	return vec4(result.rgb, 1.0);\n}\n#endif\n", THREE.ShaderChunk.defaultnormal_vertex = "#ifdef FLIP_SIDED\n	objectNormal = -objectNormal;\n#endif\nvec3 transformedNormal = normalMatrix * objectNormal;\n", THREE.ShaderChunk.displacementmap_vertex = "#ifdef USE_DISPLACEMENTMAP\n	transformed += normal * ( texture2D( displacementMap, uv ).x * displacementScale + displacementBias );\n#endif\n", THREE.ShaderChunk.displacementmap_pars_vertex = "#ifdef USE_DISPLACEMENTMAP\n	uniform sampler2D displacementMap;\n	uniform float displacementScale;\n	uniform float displacementBias;\n#endif\n", THREE.ShaderChunk.emissivemap_fragment = "#ifdef USE_EMISSIVEMAP\n	vec4 emissiveColor = texture2D( emissiveMap, vUv );\n	emissiveColor.rgb = emissiveMapTexelToLinear( emissiveColor ).rgb;\n	totalEmissiveRadiance *= emissiveColor.rgb;\n#endif\n", THREE.ShaderChunk.emissivemap_pars_fragment = "#ifdef USE_EMISSIVEMAP\n	uniform sampler2D emissiveMap;\n#endif\n", THREE.ShaderChunk.encodings_pars_fragment = "\nvec4 LinearToLinear( in vec4 value ) {\n  return value;\n}\nvec4 GammaToLinear( in vec4 value, in float gammaFactor ) {\n  return vec4( pow( value.xyz, vec3( gammaFactor ) ), value.w );\n}\nvec4 LinearToGamma( in vec4 value, in float gammaFactor ) {\n  return vec4( pow( value.xyz, vec3( 1.0 / gammaFactor ) ), value.w );\n}\nvec4 sRGBToLinear( in vec4 value ) {\n  return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.w );\n}\nvec4 LinearTosRGB( in vec4 value ) {\n  return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.w );\n}\nvec4 RGBEToLinear( in vec4 value ) {\n  return vec4( value.rgb * exp2( value.a * 255.0 - 128.0 ), 1.0 );\n}\nvec4 LinearToRGBE( in vec4 value ) {\n  float maxComponent = max( max( value.r, value.g ), value.b );\n  float fExp = clamp( ceil( log2( maxComponent ) ), -128.0, 127.0 );\n  return vec4( value.rgb / exp2( fExp ), ( fExp + 128.0 ) / 255.0 );\n}\nvec4 RGBMToLinear( in vec4 value, in float maxRange ) {\n  return vec4( value.xyz * value.w * maxRange, 1.0 );\n}\nvec4 LinearToRGBM( in vec4 value, in float maxRange ) {\n  float maxRGB = max( value.x, max( value.g, value.b ) );\n  float M      = clamp( maxRGB / maxRange, 0.0, 1.0 );\n  M            = ceil( M * 255.0 ) / 255.0;\n  return vec4( value.rgb / ( M * maxRange ), M );\n}\nvec4 RGBDToLinear( in vec4 value, in float maxRange ) {\n    return vec4( value.rgb * ( ( maxRange / 255.0 ) / value.a ), 1.0 );\n}\nvec4 LinearToRGBD( in vec4 value, in float maxRange ) {\n    float maxRGB = max( value.x, max( value.g, value.b ) );\n    float D      = max( maxRange / maxRGB, 1.0 );\n    D            = min( floor( D ) / 255.0, 1.0 );\n    return vec4( value.rgb * ( D * ( 255.0 / maxRange ) ), D );\n}\nconst mat3 cLogLuvM = mat3( 0.2209, 0.3390, 0.4184, 0.1138, 0.6780, 0.7319, 0.0102, 0.1130, 0.2969 );\nvec4 LinearToLogLuv( in vec4 value )  {\n  vec3 Xp_Y_XYZp = value.rgb * cLogLuvM;\n  Xp_Y_XYZp = max(Xp_Y_XYZp, vec3(1e-6, 1e-6, 1e-6));\n  vec4 vResult;\n  vResult.xy = Xp_Y_XYZp.xy / Xp_Y_XYZp.z;\n  float Le = 2.0 * log2(Xp_Y_XYZp.y) + 127.0;\n  vResult.w = fract(Le);\n  vResult.z = (Le - (floor(vResult.w*255.0))/255.0)/255.0;\n  return vResult;\n}\nconst mat3 cLogLuvInverseM = mat3( 6.0014, -2.7008, -1.7996, -1.3320, 3.1029, -5.7721, 0.3008, -1.0882, 5.6268 );\nvec4 LogLuvToLinear( in vec4 value ) {\n  float Le = value.z * 255.0 + value.w;\n  vec3 Xp_Y_XYZp;\n  Xp_Y_XYZp.y = exp2((Le - 127.0) / 2.0);\n  Xp_Y_XYZp.z = Xp_Y_XYZp.y / value.y;\n  Xp_Y_XYZp.x = value.x * Xp_Y_XYZp.z;\n  vec3 vRGB = Xp_Y_XYZp.rgb * cLogLuvInverseM;\n  return vec4( max(vRGB, 0.0), 1.0 );\n}\n", THREE.ShaderChunk.encodings_fragment = "  gl_FragColor = linearToOutputTexel( gl_FragColor );\n", THREE.ShaderChunk.envmap_fragment = "#ifdef USE_ENVMAP\n	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG )\n		vec3 cameraToVertex = normalize( vWorldPosition - cameraPosition );\n		vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );\n		#ifdef ENVMAP_MODE_REFLECTION\n			vec3 reflectVec = reflect( cameraToVertex, worldNormal );\n		#else\n			vec3 reflectVec = refract( cameraToVertex, worldNormal, refractionRatio );\n		#endif\n	#else\n		vec3 reflectVec = vReflect;\n	#endif\n	#ifdef ENVMAP_TYPE_CUBE\n		vec4 envColor = textureCube( envMap, flipNormal * vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );\n	#elif defined( ENVMAP_TYPE_EQUIREC )\n		vec2 sampleUV;\n		sampleUV.y = saturate( flipNormal * reflectVec.y * 0.5 + 0.5 );\n		sampleUV.x = atan( flipNormal * reflectVec.z, flipNormal * reflectVec.x ) * RECIPROCAL_PI2 + 0.5;\n		vec4 envColor = texture2D( envMap, sampleUV );\n	#elif defined( ENVMAP_TYPE_SPHERE )\n		vec3 reflectView = flipNormal * normalize( ( viewMatrix * vec4( reflectVec, 0.0 ) ).xyz + vec3( 0.0, 0.0, 1.0 ) );\n		vec4 envColor = texture2D( envMap, reflectView.xy * 0.5 + 0.5 );\n	#endif\n	envColor = envMapTexelToLinear( envColor );\n	#ifdef ENVMAP_BLENDING_MULTIPLY\n		outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );\n	#elif defined( ENVMAP_BLENDING_MIX )\n		outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );\n	#elif defined( ENVMAP_BLENDING_ADD )\n		outgoingLight += envColor.xyz * specularStrength * reflectivity;\n	#endif\n#endif\n", THREE.ShaderChunk.envmap_pars_fragment = "#if defined( USE_ENVMAP ) || defined( PHYSICAL )\n	uniform float reflectivity;\n	uniform float envMapIntenstiy;\n#endif\n#ifdef USE_ENVMAP\n	#if ! defined( PHYSICAL ) && ( defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) )\n		varying vec3 vWorldPosition;\n	#endif\n	#ifdef ENVMAP_TYPE_CUBE\n		uniform samplerCube envMap;\n	#else\n		uniform sampler2D envMap;\n	#endif\n	uniform float flipEnvMap;\n	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( PHYSICAL )\n		uniform float refractionRatio;\n	#else\n		varying vec3 vReflect;\n	#endif\n#endif\n", THREE.ShaderChunk.envmap_pars_vertex = "#ifdef USE_ENVMAP\n	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG )\n		varying vec3 vWorldPosition;\n	#else\n		varying vec3 vReflect;\n		uniform float refractionRatio;\n	#endif\n#endif\n", THREE.ShaderChunk.envmap_vertex = "#ifdef USE_ENVMAP\n	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG )\n		vWorldPosition = worldPosition.xyz;\n	#else\n		vec3 cameraToVertex = normalize( worldPosition.xyz - cameraPosition );\n		vec3 worldNormal = inverseTransformDirection( transformedNormal, viewMatrix );\n		#ifdef ENVMAP_MODE_REFLECTION\n			vReflect = reflect( cameraToVertex, worldNormal );\n		#else\n			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );\n		#endif\n	#endif\n#endif\n", THREE.ShaderChunk.fog_fragment = "#ifdef USE_FOG\n	#ifdef USE_LOGDEPTHBUF_EXT\n		float depth = gl_FragDepthEXT / gl_FragCoord.w;\n	#else\n		float depth = gl_FragCoord.z / gl_FragCoord.w;\n	#endif\n	#ifdef FOG_EXP2\n		float fogFactor = whiteCompliment( exp2( - fogDensity * fogDensity * depth * depth * LOG2 ) );\n	#else\n		float fogFactor = smoothstep( fogNear, fogFar, depth );\n	#endif\n	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );\n#endif\n", THREE.ShaderChunk.fog_pars_fragment = "#ifdef USE_FOG\n	uniform vec3 fogColor;\n	#ifdef FOG_EXP2\n		uniform float fogDensity;\n	#else\n		uniform float fogNear;\n		uniform float fogFar;\n	#endif\n#endif", THREE.ShaderChunk.lightmap_fragment = "#ifdef USE_LIGHTMAP\n	reflectedLight.indirectDiffuse += PI * texture2D( lightMap, vUv2 ).xyz * lightMapIntensity;\n#endif\n", THREE.ShaderChunk.lightmap_pars_fragment = "#ifdef USE_LIGHTMAP\n	uniform sampler2D lightMap;\n	uniform float lightMapIntensity;\n#endif", THREE.ShaderChunk.lights_lambert_vertex = "vec3 diffuse = vec3( 1.0 );\nGeometricContext geometry;\ngeometry.position = mvPosition.xyz;\ngeometry.normal = normalize( transformedNormal );\ngeometry.viewDir = normalize( -mvPosition.xyz );\nGeometricContext backGeometry;\nbackGeometry.position = geometry.position;\nbackGeometry.normal = -geometry.normal;\nbackGeometry.viewDir = geometry.viewDir;\nvLightFront = vec3( 0.0 );\n#ifdef DOUBLE_SIDED\n	vLightBack = vec3( 0.0 );\n#endif\nIncidentLight directLight;\nfloat dotNL;\nvec3 directLightColor_Diffuse;\n#if NUM_POINT_LIGHTS > 0\n	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {\n		getPointDirectLightIrradiance( pointLights[ i ], geometry, directLight );\n		dotNL = dot( geometry.normal, directLight.direction );\n		directLightColor_Diffuse = PI * directLight.color;\n		vLightFront += saturate( dotNL ) * directLightColor_Diffuse;\n		#ifdef DOUBLE_SIDED\n			vLightBack += saturate( -dotNL ) * directLightColor_Diffuse;\n		#endif\n	}\n#endif\n#if NUM_SPOT_LIGHTS > 0\n	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {\n		getSpotDirectLightIrradiance( spotLights[ i ], geometry, directLight );\n		dotNL = dot( geometry.normal, directLight.direction );\n		directLightColor_Diffuse = PI * directLight.color;\n		vLightFront += saturate( dotNL ) * directLightColor_Diffuse;\n		#ifdef DOUBLE_SIDED\n			vLightBack += saturate( -dotNL ) * directLightColor_Diffuse;\n		#endif\n	}\n#endif\n#if NUM_DIR_LIGHTS > 0\n	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {\n		getDirectionalDirectLightIrradiance( directionalLights[ i ], geometry, directLight );\n		dotNL = dot( geometry.normal, directLight.direction );\n		directLightColor_Diffuse = PI * directLight.color;\n		vLightFront += saturate( dotNL ) * directLightColor_Diffuse;\n		#ifdef DOUBLE_SIDED\n			vLightBack += saturate( -dotNL ) * directLightColor_Diffuse;\n		#endif\n	}\n#endif\n#if NUM_HEMI_LIGHTS > 0\n	for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {\n		vLightFront += getHemisphereLightIrradiance( hemisphereLights[ i ], geometry );\n		#ifdef DOUBLE_SIDED\n			vLightBack += getHemisphereLightIrradiance( hemisphereLights[ i ], backGeometry );\n		#endif\n	}\n#endif\n", THREE.ShaderChunk.lights_pars = "uniform vec3 ambientLightColor;\nvec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {\n	vec3 irradiance = ambientLightColor;\n	#ifndef PHYSICALLY_CORRECT_LIGHTS\n		irradiance *= PI;\n	#endif\n	return irradiance;\n}\n#if NUM_DIR_LIGHTS > 0\n	struct DirectionalLight {\n		vec3 direction;\n		vec3 color;\n		int shadow;\n		float shadowBias;\n		float shadowRadius;\n		vec2 shadowMapSize;\n	};\n	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];\n	void getDirectionalDirectLightIrradiance( const in DirectionalLight directionalLight, const in GeometricContext geometry, out IncidentLight directLight ) {\n		directLight.color = directionalLight.color;\n		directLight.direction = directionalLight.direction;\n		directLight.visible = true;\n	}\n#endif\n#if NUM_POINT_LIGHTS > 0\n	struct PointLight {\n		vec3 position;\n		vec3 color;\n		float distance;\n		float decay;\n		int shadow;\n		float shadowBias;\n		float shadowRadius;\n		vec2 shadowMapSize;\n	};\n	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];\n	void getPointDirectLightIrradiance( const in PointLight pointLight, const in GeometricContext geometry, out IncidentLight directLight ) {\n		vec3 lVector = pointLight.position - geometry.position;\n		directLight.direction = normalize( lVector );\n		float lightDistance = length( lVector );\n		if ( testLightInRange( lightDistance, pointLight.distance ) ) {\n			directLight.color = pointLight.color;\n			directLight.color *= punctualLightIntensityToIrradianceFactor( lightDistance, pointLight.distance, pointLight.decay );\n			directLight.visible = true;\n		} else {\n			directLight.color = vec3( 0.0 );\n			directLight.visible = false;\n		}\n	}\n#endif\n#if NUM_SPOT_LIGHTS > 0\n	struct SpotLight {\n		vec3 position;\n		vec3 direction;\n		vec3 color;\n		float distance;\n		float decay;\n		float coneCos;\n		float penumbraCos;\n		int shadow;\n		float shadowBias;\n		float shadowRadius;\n		vec2 shadowMapSize;\n	};\n	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];\n	void getSpotDirectLightIrradiance( const in SpotLight spotLight, const in GeometricContext geometry, out IncidentLight directLight  ) {\n		vec3 lVector = spotLight.position - geometry.position;\n		directLight.direction = normalize( lVector );\n		float lightDistance = length( lVector );\n		float angleCos = dot( directLight.direction, spotLight.direction );\n		if ( all( bvec2( angleCos > spotLight.coneCos, testLightInRange( lightDistance, spotLight.distance ) ) ) ) {\n			float spotEffect = smoothstep( spotLight.coneCos, spotLight.penumbraCos, angleCos );\n			directLight.color = spotLight.color;\n			directLight.color *= spotEffect * punctualLightIntensityToIrradianceFactor( lightDistance, spotLight.distance, spotLight.decay );\n			directLight.visible = true;\n		} else {\n			directLight.color = vec3( 0.0 );\n			directLight.visible = false;\n		}\n	}\n#endif\n#if NUM_HEMI_LIGHTS > 0\n	struct HemisphereLight {\n		vec3 direction;\n		vec3 skyColor;\n		vec3 groundColor;\n	};\n	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];\n	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in GeometricContext geometry ) {\n		float dotNL = dot( geometry.normal, hemiLight.direction );\n		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;\n		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );\n		#ifndef PHYSICALLY_CORRECT_LIGHTS\n			irradiance *= PI;\n		#endif\n		return irradiance;\n	}\n#endif\n#if defined( USE_ENVMAP ) && defined( PHYSICAL )\n	vec3 getLightProbeIndirectIrradiance( const in GeometricContext geometry, const in int maxMIPLevel ) {\n		#include <normal_flip>\n		vec3 worldNormal = inverseTransformDirection( geometry.normal, viewMatrix );\n		#ifdef ENVMAP_TYPE_CUBE\n			vec3 queryVec = flipNormal * vec3( flipEnvMap * worldNormal.x, worldNormal.yz );\n			#ifdef TEXTURE_LOD_EXT\n				vec4 envMapColor = textureCubeLodEXT( envMap, queryVec, float( maxMIPLevel ) );\n			#else\n				vec4 envMapColor = textureCube( envMap, queryVec, float( maxMIPLevel ) );\n			#endif\n			envMapColor.rgb = envMapTexelToLinear( envMapColor ).rgb;\n		#elif defined( ENVMAP_TYPE_CUBE_UV )\n			vec3 queryVec = flipNormal * vec3( flipEnvMap * worldNormal.x, worldNormal.yz );\n			vec4 envMapColor = textureCubeUV( queryVec, 1.0 );\n		#else\n			vec4 envMapColor = vec4( 0.0 );\n		#endif\n		return PI * envMapColor.rgb * envMapIntensity;\n	}\n	float getSpecularMIPLevel( const in float blinnShininessExponent, const in int maxMIPLevel ) {\n		float maxMIPLevelScalar = float( maxMIPLevel );\n		float desiredMIPLevel = maxMIPLevelScalar - 0.79248 - 0.5 * log2( pow2( blinnShininessExponent ) + 1.0 );\n		return clamp( desiredMIPLevel, 0.0, maxMIPLevelScalar );\n	}\n	vec3 getLightProbeIndirectRadiance( const in GeometricContext geometry, const in float blinnShininessExponent, const in int maxMIPLevel ) {\n		#ifdef ENVMAP_MODE_REFLECTION\n			vec3 reflectVec = reflect( -geometry.viewDir, geometry.normal );\n		#else\n			vec3 reflectVec = refract( -geometry.viewDir, geometry.normal, refractionRatio );\n		#endif\n		#include <normal_flip>\n		reflectVec = inverseTransformDirection( reflectVec, viewMatrix );\n		float specularMIPLevel = getSpecularMIPLevel( blinnShininessExponent, maxMIPLevel );\n		#ifdef ENVMAP_TYPE_CUBE\n			vec3 queryReflectVec = flipNormal * vec3( flipEnvMap * reflectVec.x, reflectVec.yz );\n			#ifdef TEXTURE_LOD_EXT\n				vec4 envMapColor = textureCubeLodEXT( envMap, queryReflectVec, specularMIPLevel );\n			#else\n				vec4 envMapColor = textureCube( envMap, queryReflectVec, specularMIPLevel );\n			#endif\n			envMapColor.rgb = envMapTexelToLinear( envMapColor ).rgb;\n		#elif defined( ENVMAP_TYPE_CUBE_UV )\n			vec3 queryReflectVec = flipNormal * vec3( flipEnvMap * reflectVec.x, reflectVec.yz );\n			vec4 envMapColor = textureCubeUV(queryReflectVec, BlinnExponentToGGXRoughness(blinnShininessExponent));\n		#elif defined( ENVMAP_TYPE_EQUIREC )\n			vec2 sampleUV;\n			sampleUV.y = saturate( flipNormal * reflectVec.y * 0.5 + 0.5 );\n			sampleUV.x = atan( flipNormal * reflectVec.z, flipNormal * reflectVec.x ) * RECIPROCAL_PI2 + 0.5;\n			#ifdef TEXTURE_LOD_EXT\n				vec4 envMapColor = texture2DLodEXT( envMap, sampleUV, specularMIPLevel );\n			#else\n				vec4 envMapColor = texture2D( envMap, sampleUV, specularMIPLevel );\n			#endif\n			envMapColor.rgb = envMapTexelToLinear( envMapColor ).rgb;\n		#elif defined( ENVMAP_TYPE_SPHERE )\n			vec3 reflectView = flipNormal * normalize( ( viewMatrix * vec4( reflectVec, 0.0 ) ).xyz + vec3( 0.0,0.0,1.0 ) );\n			#ifdef TEXTURE_LOD_EXT\n				vec4 envMapColor = texture2DLodEXT( envMap, reflectView.xy * 0.5 + 0.5, specularMIPLevel );\n			#else\n				vec4 envMapColor = texture2D( envMap, reflectView.xy * 0.5 + 0.5, specularMIPLevel );\n			#endif\n			envMapColor.rgb = envMapTexelToLinear( envMapColor ).rgb;\n		#endif\n		return envMapColor.rgb * envMapIntensity;\n	}\n#endif\n",
    THREE.ShaderChunk.lights_phong_fragment = "BlinnPhongMaterial material;\nmaterial.diffuseColor = diffuseColor.rgb;\nmaterial.specularColor = specular;\nmaterial.specularShininess = shininess;\nmaterial.specularStrength = specularStrength;\n", THREE.ShaderChunk.lights_phong_pars_fragment = "varying vec3 vViewPosition;\n#ifndef FLAT_SHADED\n	varying vec3 vNormal;\n#endif\nstruct BlinnPhongMaterial {\n	vec3	diffuseColor;\n	vec3	specularColor;\n	float	specularShininess;\n	float	specularStrength;\n};\nvoid RE_Direct_BlinnPhong( const in IncidentLight directLight, const in GeometricContext geometry, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {\n	float dotNL = saturate( dot( geometry.normal, directLight.direction ) );\n	vec3 irradiance = dotNL * directLight.color;\n	#ifndef PHYSICALLY_CORRECT_LIGHTS\n		irradiance *= PI;\n	#endif\n	reflectedLight.directDiffuse += irradiance * BRDF_Diffuse_Lambert( material.diffuseColor );\n	reflectedLight.directSpecular += irradiance * BRDF_Specular_BlinnPhong( directLight, geometry, material.specularColor, material.specularShininess ) * material.specularStrength;\n}\nvoid RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in GeometricContext geometry, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {\n	reflectedLight.indirectDiffuse += irradiance * BRDF_Diffuse_Lambert( material.diffuseColor );\n}\n#define RE_Direct				RE_Direct_BlinnPhong\n#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong\n#define Material_LightProbeLOD( material )	(0)\n", THREE.ShaderChunk.lights_physical_fragment = "PhysicalMaterial material;\nmaterial.diffuseColor = diffuseColor.rgb * ( 1.0 - metalnessFactor );\nmaterial.specularRoughness = clamp( roughnessFactor, 0.04, 1.0 );\n#ifdef STANDARD\n	material.specularColor = mix( vec3( DEFAULT_SPECULAR_COEFFICIENT ), diffuseColor.rgb, metalnessFactor );\n#else\n	material.specularColor = mix( vec3( MAXIMUM_SPECULAR_COEFFICIENT * pow2( reflectivity ) ), diffuseColor.rgb, metalnessFactor );\n	material.clearCoat = saturate( clearCoat );	material.clearCoatRoughness = clamp( clearCoatRoughness, 0.04, 1.0 );\n#endif\n", THREE.ShaderChunk.lights_physical_pars_fragment = "struct PhysicalMaterial {\n	vec3	diffuseColor;\n	float	specularRoughness;\n	vec3	specularColor;\n	#ifndef STANDARD\n		float clearCoat;\n		float clearCoatRoughness;\n	#endif\n};\n#define MAXIMUM_SPECULAR_COEFFICIENT 0.16\n#define DEFAULT_SPECULAR_COEFFICIENT 0.04\nfloat clearCoatDHRApprox( const in float roughness, const in float dotNL ) {\n	return DEFAULT_SPECULAR_COEFFICIENT + ( 1.0 - DEFAULT_SPECULAR_COEFFICIENT ) * ( pow( 1.0 - dotNL, 5.0 ) * pow( 1.0 - roughness, 2.0 ) );\n}\nvoid RE_Direct_Physical( const in IncidentLight directLight, const in GeometricContext geometry, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {\n	float dotNL = saturate( dot( geometry.normal, directLight.direction ) );\n	vec3 irradiance = dotNL * directLight.color;\n	#ifndef PHYSICALLY_CORRECT_LIGHTS\n		irradiance *= PI;\n	#endif\n	#ifndef STANDARD\n		float clearCoatDHR = material.clearCoat * clearCoatDHRApprox( material.clearCoatRoughness, dotNL );\n	#else\n		float clearCoatDHR = 0.0;\n	#endif\n	reflectedLight.directSpecular += ( 1.0 - clearCoatDHR ) * irradiance * BRDF_Specular_GGX( directLight, geometry, material.specularColor, material.specularRoughness );\n	reflectedLight.directDiffuse += ( 1.0 - clearCoatDHR ) * irradiance * BRDF_Diffuse_Lambert( material.diffuseColor );\n	#ifndef STANDARD\n		reflectedLight.directSpecular += irradiance * material.clearCoat * BRDF_Specular_GGX( directLight, geometry, vec3( DEFAULT_SPECULAR_COEFFICIENT ), material.clearCoatRoughness );\n	#endif\n}\nvoid RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in GeometricContext geometry, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {\n	reflectedLight.indirectDiffuse += irradiance * BRDF_Diffuse_Lambert( material.diffuseColor );\n}\nvoid RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 clearCoatRadiance, const in GeometricContext geometry, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {\n	#ifndef STANDARD\n		float dotNV = saturate( dot( geometry.normal, geometry.viewDir ) );\n		float dotNL = dotNV;\n		float clearCoatDHR = material.clearCoat * clearCoatDHRApprox( material.clearCoatRoughness, dotNL );\n	#else\n		float clearCoatDHR = 0.0;\n	#endif\n	reflectedLight.indirectSpecular += ( 1.0 - clearCoatDHR ) * radiance * BRDF_Specular_GGX_Environment( geometry, material.specularColor, material.specularRoughness );\n	#ifndef STANDARD\n		reflectedLight.indirectSpecular += clearCoatRadiance * material.clearCoat * BRDF_Specular_GGX_Environment( geometry, vec3( DEFAULT_SPECULAR_COEFFICIENT ), material.clearCoatRoughness );\n	#endif\n}\n#define RE_Direct				RE_Direct_Physical\n#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical\n#define RE_IndirectSpecular		RE_IndirectSpecular_Physical\n#define Material_BlinnShininessExponent( material )   GGXRoughnessToBlinnExponent( material.specularRoughness )\n#define Material_ClearCoat_BlinnShininessExponent( material )   GGXRoughnessToBlinnExponent( material.clearCoatRoughness )\nfloat computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {\n	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );\n}\n", THREE.ShaderChunk.lights_template = "\nGeometricContext geometry;\ngeometry.position = - vViewPosition;\ngeometry.normal = normal;\ngeometry.viewDir = normalize( vViewPosition );\nIncidentLight directLight;\n#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )\n	PointLight pointLight;\n	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {\n		pointLight = pointLights[ i ];\n		getPointDirectLightIrradiance( pointLight, geometry, directLight );\n		#ifdef USE_SHADOWMAP\n		directLight.color *= all( bvec2( pointLight.shadow, directLight.visible ) ) ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ] ) : 1.0;\n		#endif\n		RE_Direct( directLight, geometry, material, reflectedLight );\n	}\n#endif\n#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )\n	SpotLight spotLight;\n	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {\n		spotLight = spotLights[ i ];\n		getSpotDirectLightIrradiance( spotLight, geometry, directLight );\n		#ifdef USE_SHADOWMAP\n		directLight.color *= all( bvec2( spotLight.shadow, directLight.visible ) ) ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowBias, spotLight.shadowRadius, vSpotShadowCoord[ i ] ) : 1.0;\n		#endif\n		RE_Direct( directLight, geometry, material, reflectedLight );\n	}\n#endif\n#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )\n	DirectionalLight directionalLight;\n	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {\n		directionalLight = directionalLights[ i ];\n		getDirectionalDirectLightIrradiance( directionalLight, geometry, directLight );\n		#ifdef USE_SHADOWMAP\n		directLight.color *= all( bvec2( directionalLight.shadow, directLight.visible ) ) ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;\n		#endif\n		RE_Direct( directLight, geometry, material, reflectedLight );\n	}\n#endif\n#if defined( RE_IndirectDiffuse )\n	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );\n	#ifdef USE_LIGHTMAP\n		vec3 lightMapIrradiance = texture2D( lightMap, vUv2 ).xyz * lightMapIntensity;\n		#ifndef PHYSICALLY_CORRECT_LIGHTS\n			lightMapIrradiance *= PI;\n		#endif\n		irradiance += lightMapIrradiance;\n	#endif\n	#if ( NUM_HEMI_LIGHTS > 0 )\n		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {\n			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometry );\n		}\n	#endif\n	#if defined( USE_ENVMAP ) && defined( PHYSICAL ) && defined( ENVMAP_TYPE_CUBE_UV )\n	 	irradiance += getLightProbeIndirectIrradiance( geometry, 8 );\n	#endif\n	RE_IndirectDiffuse( irradiance, geometry, material, reflectedLight );\n#endif\n#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )\n	vec3 radiance = getLightProbeIndirectRadiance( geometry, Material_BlinnShininessExponent( material ), 8 );\n	#ifndef STANDARD\n		vec3 clearCoatRadiance = getLightProbeIndirectRadiance( geometry, Material_ClearCoat_BlinnShininessExponent( material ), 8 );\n	#else\n		vec3 clearCoatRadiance = vec3( 0.0 );\n	#endif\n		\n	RE_IndirectSpecular( radiance, clearCoatRadiance, geometry, material, reflectedLight );\n#endif\n", THREE.ShaderChunk.logdepthbuf_fragment = "#if defined(USE_LOGDEPTHBUF) && defined(USE_LOGDEPTHBUF_EXT)\n	gl_FragDepthEXT = log2(vFragDepth) * logDepthBufFC * 0.5;\n#endif", THREE.ShaderChunk.logdepthbuf_pars_fragment = "#ifdef USE_LOGDEPTHBUF\n	uniform float logDepthBufFC;\n	#ifdef USE_LOGDEPTHBUF_EXT\n		varying float vFragDepth;\n	#endif\n#endif\n", THREE.ShaderChunk.logdepthbuf_pars_vertex = "#ifdef USE_LOGDEPTHBUF\n	#ifdef USE_LOGDEPTHBUF_EXT\n		varying float vFragDepth;\n	#endif\n	uniform float logDepthBufFC;\n#endif", THREE.ShaderChunk.logdepthbuf_vertex = "#ifdef USE_LOGDEPTHBUF\n	gl_Position.z = log2(max( EPSILON, gl_Position.w + 1.0 )) * logDepthBufFC;\n	#ifdef USE_LOGDEPTHBUF_EXT\n		vFragDepth = 1.0 + gl_Position.w;\n	#else\n		gl_Position.z = (gl_Position.z - 1.0) * gl_Position.w;\n	#endif\n#endif\n", THREE.ShaderChunk.map_fragment = "#ifdef USE_MAP\n	vec4 texelColor = texture2D( map, vUv );\n	texelColor = mapTexelToLinear( texelColor );\n	diffuseColor *= texelColor;\n#endif\n", THREE.ShaderChunk.map_pars_fragment = "#ifdef USE_MAP\n	uniform sampler2D map;\n#endif\n", THREE.ShaderChunk.map_particle_fragment = "#ifdef USE_MAP\n	vec4 mapTexel = texture2D( map, vec2( gl_PointCoord.x, 1.0 - gl_PointCoord.y ) * offsetRepeat.zw + offsetRepeat.xy );\n	diffuseColor *= mapTexelToLinear( mapTexel );\n#endif\n", THREE.ShaderChunk.map_particle_pars_fragment = "#ifdef USE_MAP\n	uniform vec4 offsetRepeat;\n	uniform sampler2D map;\n#endif\n", THREE.ShaderChunk.metalnessmap_fragment = "float metalnessFactor = metalness;\n#ifdef USE_METALNESSMAP\n	vec4 texelMetalness = texture2D( metalnessMap, vUv );\n	metalnessFactor *= texelMetalness.r;\n#endif\n", THREE.ShaderChunk.metalnessmap_pars_fragment = "#ifdef USE_METALNESSMAP\n	uniform sampler2D metalnessMap;\n#endif", THREE.ShaderChunk.morphnormal_vertex = "#ifdef USE_MORPHNORMALS\n	objectNormal += ( morphNormal0 - normal ) * morphTargetInfluences[ 0 ];\n	objectNormal += ( morphNormal1 - normal ) * morphTargetInfluences[ 1 ];\n	objectNormal += ( morphNormal2 - normal ) * morphTargetInfluences[ 2 ];\n	objectNormal += ( morphNormal3 - normal ) * morphTargetInfluences[ 3 ];\n#endif\n", THREE.ShaderChunk.morphtarget_pars_vertex = "#ifdef USE_MORPHTARGETS\n	#ifndef USE_MORPHNORMALS\n	uniform float morphTargetInfluences[ 8 ];\n	#else\n	uniform float morphTargetInfluences[ 4 ];\n	#endif\n#endif", THREE.ShaderChunk.morphtarget_vertex = "#ifdef USE_MORPHTARGETS\n	transformed += ( morphTarget0 - position ) * morphTargetInfluences[ 0 ];\n	transformed += ( morphTarget1 - position ) * morphTargetInfluences[ 1 ];\n	transformed += ( morphTarget2 - position ) * morphTargetInfluences[ 2 ];\n	transformed += ( morphTarget3 - position ) * morphTargetInfluences[ 3 ];\n	#ifndef USE_MORPHNORMALS\n	transformed += ( morphTarget4 - position ) * morphTargetInfluences[ 4 ];\n	transformed += ( morphTarget5 - position ) * morphTargetInfluences[ 5 ];\n	transformed += ( morphTarget6 - position ) * morphTargetInfluences[ 6 ];\n	transformed += ( morphTarget7 - position ) * morphTargetInfluences[ 7 ];\n	#endif\n#endif\n", THREE.ShaderChunk.normal_flip = "#ifdef DOUBLE_SIDED\n	float flipNormal = ( float( gl_FrontFacing ) * 2.0 - 1.0 );\n#else\n	float flipNormal = 1.0;\n#endif\n", THREE.ShaderChunk.normal_fragment = "#ifdef FLAT_SHADED\n	vec3 fdx = vec3( dFdx( vViewPosition.x ), dFdx( vViewPosition.y ), dFdx( vViewPosition.z ) );\n	vec3 fdy = vec3( dFdy( vViewPosition.x ), dFdy( vViewPosition.y ), dFdy( vViewPosition.z ) );\n	vec3 normal = normalize( cross( fdx, fdy ) );\n#else\n	vec3 normal = normalize( vNormal ) * flipNormal;\n#endif\n#ifdef USE_NORMALMAP\n	normal = perturbNormal2Arb( -vViewPosition, normal );\n#elif defined( USE_BUMPMAP )\n	normal = perturbNormalArb( -vViewPosition, normal, dHdxy_fwd() );\n#endif\n", THREE.ShaderChunk.normalmap_pars_fragment = "#ifdef USE_NORMALMAP\n	uniform sampler2D normalMap;\n	uniform vec2 normalScale;\n	vec3 perturbNormal2Arb( vec3 eye_pos, vec3 surf_norm ) {\n		vec3 q0 = dFdx( eye_pos.xyz );\n		vec3 q1 = dFdy( eye_pos.xyz );\n		vec2 st0 = dFdx( vUv.st );\n		vec2 st1 = dFdy( vUv.st );\n		vec3 S = normalize( q0 * st1.t - q1 * st0.t );\n		vec3 T = normalize( -q0 * st1.s + q1 * st0.s );\n		vec3 N = normalize( surf_norm );\n		vec3 mapN = texture2D( normalMap, vUv ).xyz * 2.0 - 1.0;\n		mapN.xy = normalScale * mapN.xy;\n		mat3 tsn = mat3( S, T, N );\n		return normalize( tsn * mapN );\n	}\n#endif\n", THREE.ShaderChunk.packing = "vec3 packNormalToRGB( const in vec3 normal ) {\n  return normalize( normal ) * 0.5 + 0.5;\n}\nvec3 unpackRGBToNormal( const in vec3 rgb ) {\n  return 1.0 - 2.0 * rgb.xyz;\n}\nconst float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;\nconst vec3 PackFactors = vec3( 256. * 256. * 256., 256. * 256.,  256. );\nconst vec4 UnpackFactors = UnpackDownscale / vec4( PackFactors, 1. );\nconst float ShiftRight8 = 1. / 256.;\nvec4 packDepthToRGBA( const in float v ) {\n	vec4 r = vec4( fract( v * PackFactors ), v );\n	r.yzw -= r.xyz * ShiftRight8;	return r * PackUpscale;\n}\nfloat unpackRGBAToDepth( const in vec4 v ) {\n	return dot( v, UnpackFactors );\n}\nfloat viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {\n  return ( viewZ + near ) / ( near - far );\n}\nfloat orthographicDepthToViewZ( const in float linearClipZ, const in float near, const in float far ) {\n  return linearClipZ * ( near - far ) - near;\n}\nfloat viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {\n  return (( near + viewZ ) * far ) / (( far - near ) * viewZ );\n}\nfloat perspectiveDepthToViewZ( const in float invClipZ, const in float near, const in float far ) {\n  return ( near * far ) / ( ( far - near ) * invClipZ - far );\n}\n", THREE.ShaderChunk.premultiplied_alpha_fragment = "#ifdef PREMULTIPLIED_ALPHA\n	gl_FragColor.rgb *= gl_FragColor.a;\n#endif\n", THREE.ShaderChunk.project_vertex = "#ifdef USE_SKINNING\n	vec4 mvPosition = modelViewMatrix * skinned;\n#else\n	vec4 mvPosition = modelViewMatrix * vec4( transformed, 1.0 );\n#endif\ngl_Position = projectionMatrix * mvPosition;\n", THREE.ShaderChunk.roughnessmap_fragment = "float roughnessFactor = roughness;\n#ifdef USE_ROUGHNESSMAP\n	vec4 texelRoughness = texture2D( roughnessMap, vUv );\n	roughnessFactor *= texelRoughness.r;\n#endif\n", THREE.ShaderChunk.roughnessmap_pars_fragment = "#ifdef USE_ROUGHNESSMAP\n	uniform sampler2D roughnessMap;\n#endif", THREE.ShaderChunk.shadowmap_pars_fragment = "#ifdef USE_SHADOWMAP\n	#if NUM_DIR_LIGHTS > 0\n		uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHTS ];\n		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHTS ];\n	#endif\n	#if NUM_SPOT_LIGHTS > 0\n		uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHTS ];\n		varying vec4 vSpotShadowCoord[ NUM_SPOT_LIGHTS ];\n	#endif\n	#if NUM_POINT_LIGHTS > 0\n		uniform sampler2D pointShadowMap[ NUM_POINT_LIGHTS ];\n		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHTS ];\n	#endif\n	float texture2DCompare( sampler2D depths, vec2 uv, float compare ) {\n		return step( compare, unpackRGBAToDepth( texture2D( depths, uv ) ) );\n	}\n	float texture2DShadowLerp( sampler2D depths, vec2 size, vec2 uv, float compare ) {\n		const vec2 offset = vec2( 0.0, 1.0 );\n		vec2 texelSize = vec2( 1.0 ) / size;\n		vec2 centroidUV = floor( uv * size + 0.5 ) / size;\n		float lb = texture2DCompare( depths, centroidUV + texelSize * offset.xx, compare );\n		float lt = texture2DCompare( depths, centroidUV + texelSize * offset.xy, compare );\n		float rb = texture2DCompare( depths, centroidUV + texelSize * offset.yx, compare );\n		float rt = texture2DCompare( depths, centroidUV + texelSize * offset.yy, compare );\n		vec2 f = fract( uv * size + 0.5 );\n		float a = mix( lb, lt, f.y );\n		float b = mix( rb, rt, f.y );\n		float c = mix( a, b, f.x );\n		return c;\n	}\n	float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowBias, float shadowRadius, vec4 shadowCoord ) {\n		shadowCoord.xyz /= shadowCoord.w;\n		shadowCoord.z += shadowBias;\n		bvec4 inFrustumVec = bvec4 ( shadowCoord.x >= 0.0, shadowCoord.x <= 1.0, shadowCoord.y >= 0.0, shadowCoord.y <= 1.0 );\n		bool inFrustum = all( inFrustumVec );\n		bvec2 frustumTestVec = bvec2( inFrustum, shadowCoord.z <= 1.0 );\n		bool frustumTest = all( frustumTestVec );\n		if ( frustumTest ) {\n		#if defined( SHADOWMAP_TYPE_PCF )\n			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;\n			float dx0 = - texelSize.x * shadowRadius;\n			float dy0 = - texelSize.y * shadowRadius;\n			float dx1 = + texelSize.x * shadowRadius;\n			float dy1 = + texelSize.y * shadowRadius;\n			return (\n				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy0 ), shadowCoord.z ) +\n				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy0 ), shadowCoord.z ) +\n				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy0 ), shadowCoord.z ) +\n				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, 0.0 ), shadowCoord.z ) +\n				texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z ) +\n				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, 0.0 ), shadowCoord.z ) +\n				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy1 ), shadowCoord.z ) +\n				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy1 ), shadowCoord.z ) +\n				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy1 ), shadowCoord.z )\n			) * ( 1.0 / 9.0 );\n		#elif defined( SHADOWMAP_TYPE_PCF_SOFT )\n			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;\n			float dx0 = - texelSize.x * shadowRadius;\n			float dy0 = - texelSize.y * shadowRadius;\n			float dx1 = + texelSize.x * shadowRadius;\n			float dy1 = + texelSize.y * shadowRadius;\n			return (\n				texture2DShadowLerp( shadowMap, shadowMapSize, shadowCoord.xy + vec2( dx0, dy0 ), shadowCoord.z ) +\n				texture2DShadowLerp( shadowMap, shadowMapSize, shadowCoord.xy + vec2( 0.0, dy0 ), shadowCoord.z ) +\n				texture2DShadowLerp( shadowMap, shadowMapSize, shadowCoord.xy + vec2( dx1, dy0 ), shadowCoord.z ) +\n				texture2DShadowLerp( shadowMap, shadowMapSize, shadowCoord.xy + vec2( dx0, 0.0 ), shadowCoord.z ) +\n				texture2DShadowLerp( shadowMap, shadowMapSize, shadowCoord.xy, shadowCoord.z ) +\n				texture2DShadowLerp( shadowMap, shadowMapSize, shadowCoord.xy + vec2( dx1, 0.0 ), shadowCoord.z ) +\n				texture2DShadowLerp( shadowMap, shadowMapSize, shadowCoord.xy + vec2( dx0, dy1 ), shadowCoord.z ) +\n				texture2DShadowLerp( shadowMap, shadowMapSize, shadowCoord.xy + vec2( 0.0, dy1 ), shadowCoord.z ) +\n				texture2DShadowLerp( shadowMap, shadowMapSize, shadowCoord.xy + vec2( dx1, dy1 ), shadowCoord.z )\n			) * ( 1.0 / 9.0 );\n		#else\n			return texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z );\n		#endif\n		}\n		return 1.0;\n	}\n	vec2 cubeToUV( vec3 v, float texelSizeY ) {\n		vec3 absV = abs( v );\n		float scaleToCube = 1.0 / max( absV.x, max( absV.y, absV.z ) );\n		absV *= scaleToCube;\n		v *= scaleToCube * ( 1.0 - 2.0 * texelSizeY );\n		vec2 planar = v.xy;\n		float almostATexel = 1.5 * texelSizeY;\n		float almostOne = 1.0 - almostATexel;\n		if ( absV.z >= almostOne ) {\n			if ( v.z > 0.0 )\n				planar.x = 4.0 - v.x;\n		} else if ( absV.x >= almostOne ) {\n			float signX = sign( v.x );\n			planar.x = v.z * signX + 2.0 * signX;\n		} else if ( absV.y >= almostOne ) {\n			float signY = sign( v.y );\n			planar.x = v.x + 2.0 * signY + 2.0;\n			planar.y = v.z * signY - 2.0;\n		}\n		return vec2( 0.125, 0.25 ) * planar + vec2( 0.375, 0.75 );\n	}\n	float getPointShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowBias, float shadowRadius, vec4 shadowCoord ) {\n		vec2 texelSize = vec2( 1.0 ) / ( shadowMapSize * vec2( 4.0, 2.0 ) );\n		vec3 lightToPosition = shadowCoord.xyz;\n		vec3 bd3D = normalize( lightToPosition );\n		float dp = ( length( lightToPosition ) - shadowBias ) / 1000.0;\n		#if defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_PCF_SOFT )\n			vec2 offset = vec2( - 1, 1 ) * shadowRadius * texelSize.y;\n			return (\n				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyy, texelSize.y ), dp ) +\n				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyy, texelSize.y ), dp ) +\n				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyx, texelSize.y ), dp ) +\n				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyx, texelSize.y ), dp ) +\n				texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp ) +\n				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxy, texelSize.y ), dp ) +\n				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxy, texelSize.y ), dp ) +\n				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxx, texelSize.y ), dp ) +\n				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxx, texelSize.y ), dp )\n			) * ( 1.0 / 9.0 );\n		#else\n			return texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp );\n		#endif\n	}\n#endif\n", THREE.ShaderChunk.shadowmap_pars_vertex = "#ifdef USE_SHADOWMAP\n	#if NUM_DIR_LIGHTS > 0\n		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHTS ];\n		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHTS ];\n	#endif\n	#if NUM_SPOT_LIGHTS > 0\n		uniform mat4 spotShadowMatrix[ NUM_SPOT_LIGHTS ];\n		varying vec4 vSpotShadowCoord[ NUM_SPOT_LIGHTS ];\n	#endif\n	#if NUM_POINT_LIGHTS > 0\n		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHTS ];\n		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHTS ];\n	#endif\n#endif\n", THREE.ShaderChunk.shadowmap_vertex = "#ifdef USE_SHADOWMAP\n	#if NUM_DIR_LIGHTS > 0\n	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {\n		vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * worldPosition;\n	}\n	#endif\n	#if NUM_SPOT_LIGHTS > 0\n	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {\n		vSpotShadowCoord[ i ] = spotShadowMatrix[ i ] * worldPosition;\n	}\n	#endif\n	#if NUM_POINT_LIGHTS > 0\n	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {\n		vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * worldPosition;\n	}\n	#endif\n#endif\n", THREE.ShaderChunk.shadowmask_pars_fragment = "float getShadowMask() {\n	float shadow = 1.0;\n	#ifdef USE_SHADOWMAP\n	#if NUM_DIR_LIGHTS > 0\n	DirectionalLight directionalLight;\n	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {\n		directionalLight = directionalLights[ i ];\n		shadow *= bool( directionalLight.shadow ) ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;\n	}\n	#endif\n	#if NUM_SPOT_LIGHTS > 0\n	SpotLight spotLight;\n	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {\n		spotLight = spotLights[ i ];\n		shadow *= bool( spotLight.shadow ) ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowBias, spotLight.shadowRadius, vSpotShadowCoord[ i ] ) : 1.0;\n	}\n	#endif\n	#if NUM_POINT_LIGHTS > 0\n	PointLight pointLight;\n	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {\n		pointLight = pointLights[ i ];\n		shadow *= bool( pointLight.shadow ) ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ] ) : 1.0;\n	}\n	#endif\n	#endif\n	return shadow;\n}\n", THREE.ShaderChunk.skinbase_vertex = "#ifdef USE_SKINNING\n	mat4 boneMatX = getBoneMatrix( skinIndex.x );\n	mat4 boneMatY = getBoneMatrix( skinIndex.y );\n	mat4 boneMatZ = getBoneMatrix( skinIndex.z );\n	mat4 boneMatW = getBoneMatrix( skinIndex.w );\n#endif", THREE.ShaderChunk.skinning_pars_vertex = "#ifdef USE_SKINNING\n	uniform mat4 bindMatrix;\n	uniform mat4 bindMatrixInverse;\n	#ifdef BONE_TEXTURE\n		uniform sampler2D boneTexture;\n		uniform int boneTextureWidth;\n		uniform int boneTextureHeight;\n		mat4 getBoneMatrix( const in float i ) {\n			float j = i * 4.0;\n			float x = mod( j, float( boneTextureWidth ) );\n			float y = floor( j / float( boneTextureWidth ) );\n			float dx = 1.0 / float( boneTextureWidth );\n			float dy = 1.0 / float( boneTextureHeight );\n			y = dy * ( y + 0.5 );\n			vec4 v1 = texture2D( boneTexture, vec2( dx * ( x + 0.5 ), y ) );\n			vec4 v2 = texture2D( boneTexture, vec2( dx * ( x + 1.5 ), y ) );\n			vec4 v3 = texture2D( boneTexture, vec2( dx * ( x + 2.5 ), y ) );\n			vec4 v4 = texture2D( boneTexture, vec2( dx * ( x + 3.5 ), y ) );\n			mat4 bone = mat4( v1, v2, v3, v4 );\n			return bone;\n		}\n	#else\n		uniform mat4 boneMatrices[ MAX_BONES ];\n		mat4 getBoneMatrix( const in float i ) {\n			mat4 bone = boneMatrices[ int(i) ];\n			return bone;\n		}\n	#endif\n#endif\n", THREE.ShaderChunk.skinning_vertex = "#ifdef USE_SKINNING\n	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );\n	vec4 skinned = vec4( 0.0 );\n	skinned += boneMatX * skinVertex * skinWeight.x;\n	skinned += boneMatY * skinVertex * skinWeight.y;\n	skinned += boneMatZ * skinVertex * skinWeight.z;\n	skinned += boneMatW * skinVertex * skinWeight.w;\n	skinned  = bindMatrixInverse * skinned;\n#endif\n", THREE.ShaderChunk.skinnormal_vertex = "#ifdef USE_SKINNING\n	mat4 skinMatrix = mat4( 0.0 );\n	skinMatrix += skinWeight.x * boneMatX;\n	skinMatrix += skinWeight.y * boneMatY;\n	skinMatrix += skinWeight.z * boneMatZ;\n	skinMatrix += skinWeight.w * boneMatW;\n	skinMatrix  = bindMatrixInverse * skinMatrix * bindMatrix;\n	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;\n#endif\n", THREE.ShaderChunk.specularmap_fragment = "float specularStrength;\n#ifdef USE_SPECULARMAP\n	vec4 texelSpecular = texture2D( specularMap, vUv );\n	specularStrength = texelSpecular.r;\n#else\n	specularStrength = 1.0;\n#endif", THREE.ShaderChunk.specularmap_pars_fragment = "#ifdef USE_SPECULARMAP\n	uniform sampler2D specularMap;\n#endif", THREE.ShaderChunk.tonemapping_fragment = "#if defined( TONE_MAPPING )\n  gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );\n#endif\n", THREE.ShaderChunk.tonemapping_pars_fragment = "#define saturate(a) clamp( a, 0.0, 1.0 )\nuniform float toneMappingExposure;\nuniform float toneMappingWhitePoint;\nvec3 LinearToneMapping( vec3 color ) {\n  return toneMappingExposure * color;\n}\nvec3 ReinhardToneMapping( vec3 color ) {\n  color *= toneMappingExposure;\n  return saturate( color / ( vec3( 1.0 ) + color ) );\n}\n#define Uncharted2Helper( x ) max( ( ( x * ( 0.15 * x + 0.10 * 0.50 ) + 0.20 * 0.02 ) / ( x * ( 0.15 * x + 0.50 ) + 0.20 * 0.30 ) ) - 0.02 / 0.30, vec3( 0.0 ) )\nvec3 Uncharted2ToneMapping( vec3 color ) {\n  color *= toneMappingExposure;\n  return saturate( Uncharted2Helper( color ) / Uncharted2Helper( vec3( toneMappingWhitePoint ) ) );\n}\nvec3 OptimizedCineonToneMapping( vec3 color ) {\n  color *= toneMappingExposure;\n  color = max( vec3( 0.0 ), color - 0.004 );\n  return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );\n}\n", THREE.ShaderChunk.uv2_pars_fragment = "#if defined( USE_LIGHTMAP ) || defined( USE_AOMAP )\n	varying vec2 vUv2;\n#endif", THREE.ShaderChunk.uv2_pars_vertex = "#if defined( USE_LIGHTMAP ) || defined( USE_AOMAP )\n	attribute vec2 uv2;\n	varying vec2 vUv2;\n#endif", THREE.ShaderChunk.uv2_vertex = "#if defined( USE_LIGHTMAP ) || defined( USE_AOMAP )\n	vUv2 = uv2;\n#endif", THREE.ShaderChunk.uv_pars_fragment = "#if defined( USE_MAP ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( USE_SPECULARMAP ) || defined( USE_ALPHAMAP ) || defined( USE_EMISSIVEMAP ) || defined( USE_ROUGHNESSMAP ) || defined( USE_METALNESSMAP )\n	varying vec2 vUv;\n#endif", THREE.ShaderChunk.uv_pars_vertex = "#if defined( USE_MAP ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( USE_SPECULARMAP ) || defined( USE_ALPHAMAP ) || defined( USE_EMISSIVEMAP ) || defined( USE_ROUGHNESSMAP ) || defined( USE_METALNESSMAP )\n	varying vec2 vUv;\n	uniform vec4 offsetRepeat;\n#endif\n", THREE.ShaderChunk.uv_vertex = "#if defined( USE_MAP ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( USE_SPECULARMAP ) || defined( USE_ALPHAMAP ) || defined( USE_EMISSIVEMAP ) || defined( USE_ROUGHNESSMAP ) || defined( USE_METALNESSMAP )\n	vUv = uv * offsetRepeat.zw + offsetRepeat.xy;\n#endif", THREE.ShaderChunk.worldpos_vertex = "#if defined( USE_ENVMAP ) || defined( PHONG ) || defined( PHYSICAL ) || defined( LAMBERT ) || defined ( USE_SHADOWMAP )\n	#ifdef USE_SKINNING\n		vec4 worldPosition = modelMatrix * skinned;\n	#else\n		vec4 worldPosition = modelMatrix * vec4( transformed, 1.0 );\n	#endif\n#endif\n", THREE.UniformsUtils = {
        merge: function(a) {
            for (var b = {}, c = 0; c < a.length; c++) {
                var d, e = this.clone(a[c]);
                for (d in e) b[d] = e[d]
            }
            return b
        },
        clone: function(a) {
            var b, c = {};
            for (b in a) {
                c[b] = {};
                for (var d in a[b]) {
                    var e = a[b][d];
                    e instanceof THREE.Color || e instanceof THREE.Vector2 || e instanceof THREE.Vector3 || e instanceof THREE.Vector4 || e instanceof THREE.Matrix3 || e instanceof THREE.Matrix4 || e instanceof THREE.Texture ? c[b][d] = e.clone() : Array.isArray(e) ? c[b][d] = e.slice() : c[b][d] = e
                }
            }
            return c
        }
    }, THREE.UniformsLib = {
        common: {
            diffuse: {
                value: new THREE.Color(15658734)
            },
            opacity: {
                value: 1
            },
            map: {
                value: null
            },
            offsetRepeat: {
                value: new THREE.Vector4(0, 0, 1, 1)
            },
            specularMap: {
                value: null
            },
            alphaMap: {
                value: null
            },
            envMap: {
                value: null
            },
            flipEnvMap: {
                value: -1
            },
            reflectivity: {
                value: 1
            },
            refractionRatio: {
                value: .98
            }
        },
        aomap: {
            aoMap: {
                value: null
            },
            aoMapIntensity: {
                value: 1
            }
        },
        lightmap: {
            lightMap: {
                value: null
            },
            lightMapIntensity: {
                value: 1
            }
        },
        emissivemap: {
            emissiveMap: {
                value: null
            }
        },
        bumpmap: {
            bumpMap: {
                value: null
            },
            bumpScale: {
                value: 1
            }
        },
        normalmap: {
            normalMap: {
                value: null
            },
            normalScale: {
                value: new THREE.Vector2(1, 1)
            }
        },
        displacementmap: {
            displacementMap: {
                value: null
            },
            displacementScale: {
                value: 1
            },
            displacementBias: {
                value: 0
            }
        },
        roughnessmap: {
            roughnessMap: {
                value: null
            }
        },
        metalnessmap: {
            metalnessMap: {
                value: null
            }
        },
        fog: {
            fogDensity: {
                value: 25e-5
            },
            fogNear: {
                value: 1
            },
            fogFar: {
                value: 2e3
            },
            fogColor: {
                value: new THREE.Color(16777215)
            }
        },
        lights: {
            ambientLightColor: {
                value: []
            },
            directionalLights: {
                value: [],
                properties: {
                    direction: {},
                    color: {},
                    shadow: {},
                    shadowBias: {},
                    shadowRadius: {},
                    shadowMapSize: {}
                }
            },
            directionalShadowMap: {
                value: []
            },
            directionalShadowMatrix: {
                value: []
            },
            spotLights: {
                value: [],
                properties: {
                    color: {},
                    position: {},
                    direction: {},
                    distance: {},
                    coneCos: {},
                    penumbraCos: {},
                    decay: {},
                    shadow: {},
                    shadowBias: {},
                    shadowRadius: {},
                    shadowMapSize: {}
                }
            },
            spotShadowMap: {
                value: []
            },
            spotShadowMatrix: {
                value: []
            },
            pointLights: {
                value: [],
                properties: {
                    color: {},
                    position: {},
                    decay: {},
                    distance: {},
                    shadow: {},
                    shadowBias: {},
                    shadowRadius: {},
                    shadowMapSize: {}
                }
            },
            pointShadowMap: {
                value: []
            },
            pointShadowMatrix: {
                value: []
            },
            hemisphereLights: {
                value: [],
                properties: {
                    direction: {},
                    skyColor: {},
                    groundColor: {}
                }
            }
        },
        points: {
            diffuse: {
                value: new THREE.Color(15658734)
            },
            opacity: {
                value: 1
            },
            size: {
                value: 1
            },
            scale: {
                value: 1
            },
            map: {
                value: null
            },
            offsetRepeat: {
                value: new THREE.Vector4(0, 0, 1, 1)
            }
        }
    }, THREE.ShaderChunk.cube_frag = "uniform samplerCube tCube;\nuniform float tFlip;\nuniform float opacity;\nvarying vec3 vWorldPosition;\n#include <common>\nvoid main() {\n	gl_FragColor = textureCube( tCube, vec3( tFlip * vWorldPosition.x, vWorldPosition.yz ) );\n	gl_FragColor.a *= opacity;\n}\n", THREE.ShaderChunk.cube_vert = "varying vec3 vWorldPosition;\n#include <common>\nvoid main() {\n	vWorldPosition = transformDirection( position, modelMatrix );\n	#include <begin_vertex>\n	#include <project_vertex>\n}\n", THREE.ShaderChunk.depth_frag = "#if DEPTH_PACKING == 3200\n	uniform float opacity;\n#endif\n#include <common>\n#include <packing>\n#include <uv_pars_fragment>\n#include <map_pars_fragment>\n#include <alphamap_pars_fragment>\n#include <logdepthbuf_pars_fragment>\n#include <clipping_planes_pars_fragment>\nvoid main() {\n	#include <clipping_planes_fragment>\n	vec4 diffuseColor = vec4( 1.0 );\n	#if DEPTH_PACKING == 3200\n		diffuseColor.a = opacity;\n	#endif\n	#include <map_fragment>\n	#include <alphamap_fragment>\n	#include <alphatest_fragment>\n	#include <logdepthbuf_fragment>\n	#if DEPTH_PACKING == 3200\n		gl_FragColor = vec4( vec3( gl_FragCoord.z ), opacity );\n	#elif DEPTH_PACKING == 3201\n		gl_FragColor = packDepthToRGBA( gl_FragCoord.z );\n	#endif\n}\n",
    THREE.ShaderChunk.depth_vert = "#include <common>\n#include <uv_pars_vertex>\n#include <displacementmap_pars_vertex>\n#include <morphtarget_pars_vertex>\n#include <skinning_pars_vertex>\n#include <logdepthbuf_pars_vertex>\n#include <clipping_planes_pars_vertex>\nvoid main() {\n	#include <uv_vertex>\n	#include <skinbase_vertex>\n	#include <begin_vertex>\n	#include <displacementmap_vertex>\n	#include <morphtarget_vertex>\n	#include <skinning_vertex>\n	#include <project_vertex>\n	#include <logdepthbuf_vertex>\n	#include <clipping_planes_vertex>\n}\n", THREE.ShaderChunk.distanceRGBA_frag = "uniform vec3 lightPos;\nvarying vec4 vWorldPosition;\n#include <common>\n#include <packing>\n#include <clipping_planes_pars_fragment>\nvoid main () {\n	#include <clipping_planes_fragment>\n	gl_FragColor = packDepthToRGBA( length( vWorldPosition.xyz - lightPos.xyz ) / 1000.0 );\n}\n", THREE.ShaderChunk.distanceRGBA_vert = "varying vec4 vWorldPosition;\n#include <common>\n#include <morphtarget_pars_vertex>\n#include <skinning_pars_vertex>\n#include <clipping_planes_pars_vertex>\nvoid main() {\n	#include <skinbase_vertex>\n	#include <begin_vertex>\n	#include <morphtarget_vertex>\n	#include <skinning_vertex>\n	#include <project_vertex>\n	#include <worldpos_vertex>\n	#include <clipping_planes_vertex>\n	vWorldPosition = worldPosition;\n}\n", THREE.ShaderChunk.equirect_frag = "uniform sampler2D tEquirect;\nuniform float tFlip;\nvarying vec3 vWorldPosition;\n#include <common>\nvoid main() {\n	vec3 direction = normalize( vWorldPosition );\n	vec2 sampleUV;\n	sampleUV.y = saturate( tFlip * direction.y * -0.5 + 0.5 );\n	sampleUV.x = atan( direction.z, direction.x ) * RECIPROCAL_PI2 + 0.5;\n	gl_FragColor = texture2D( tEquirect, sampleUV );\n}\n", THREE.ShaderChunk.equirect_vert = "varying vec3 vWorldPosition;\n#include <common>\nvoid main() {\n	vWorldPosition = transformDirection( position, modelMatrix );\n	#include <begin_vertex>\n	#include <project_vertex>\n}\n", THREE.ShaderChunk.linedashed_frag = "uniform vec3 diffuse;\nuniform float opacity;\nuniform float dashSize;\nuniform float totalSize;\nvarying float vLineDistance;\n#include <common>\n#include <color_pars_fragment>\n#include <fog_pars_fragment>\n#include <logdepthbuf_pars_fragment>\n#include <clipping_planes_pars_fragment>\nvoid main() {\n	#include <clipping_planes_fragment>\n	if ( mod( vLineDistance, totalSize ) > dashSize ) {\n		discard;\n	}\n	vec3 outgoingLight = vec3( 0.0 );\n	vec4 diffuseColor = vec4( diffuse, opacity );\n	#include <logdepthbuf_fragment>\n	#include <color_fragment>\n	outgoingLight = diffuseColor.rgb;\n	gl_FragColor = vec4( outgoingLight, diffuseColor.a );\n	#include <premultiplied_alpha_fragment>\n	#include <tonemapping_fragment>\n	#include <encodings_fragment>\n	#include <fog_fragment>\n}\n", THREE.ShaderChunk.linedashed_vert = "uniform float scale;\nattribute float lineDistance;\nvarying float vLineDistance;\n#include <common>\n#include <color_pars_vertex>\n#include <logdepthbuf_pars_vertex>\n#include <clipping_planes_pars_vertex>\nvoid main() {\n	#include <color_vertex>\n	vLineDistance = scale * lineDistance;\n	vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );\n	gl_Position = projectionMatrix * mvPosition;\n	#include <logdepthbuf_vertex>\n	#include <clipping_planes_vertex>\n}\n", THREE.ShaderChunk.meshbasic_frag = "uniform vec3 diffuse;\nuniform float opacity;\n#ifndef FLAT_SHADED\n	varying vec3 vNormal;\n#endif\n#include <common>\n#include <color_pars_fragment>\n#include <uv_pars_fragment>\n#include <uv2_pars_fragment>\n#include <map_pars_fragment>\n#include <alphamap_pars_fragment>\n#include <aomap_pars_fragment>\n#include <envmap_pars_fragment>\n#include <fog_pars_fragment>\n#include <specularmap_pars_fragment>\n#include <logdepthbuf_pars_fragment>\n#include <clipping_planes_pars_fragment>\nvoid main() {\n	#include <clipping_planes_fragment>\n	vec4 diffuseColor = vec4( diffuse, opacity );\n	#include <logdepthbuf_fragment>\n	#include <map_fragment>\n	#include <color_fragment>\n	#include <alphamap_fragment>\n	#include <alphatest_fragment>\n	#include <specularmap_fragment>\n	ReflectedLight reflectedLight;\n	reflectedLight.directDiffuse = vec3( 0.0 );\n	reflectedLight.directSpecular = vec3( 0.0 );\n	reflectedLight.indirectDiffuse = diffuseColor.rgb;\n	reflectedLight.indirectSpecular = vec3( 0.0 );\n	#include <aomap_fragment>\n	vec3 outgoingLight = reflectedLight.indirectDiffuse;\n	#include <normal_flip>\n	#include <envmap_fragment>\n	gl_FragColor = vec4( outgoingLight, diffuseColor.a );\n	#include <premultiplied_alpha_fragment>\n	#include <tonemapping_fragment>\n	#include <encodings_fragment>\n	#include <fog_fragment>\n}\n", THREE.ShaderChunk.meshbasic_vert = "#include <common>\n#include <uv_pars_vertex>\n#include <uv2_pars_vertex>\n#include <envmap_pars_vertex>\n#include <color_pars_vertex>\n#include <morphtarget_pars_vertex>\n#include <skinning_pars_vertex>\n#include <logdepthbuf_pars_vertex>\n#include <clipping_planes_pars_vertex>\nvoid main() {\n	#include <uv_vertex>\n	#include <uv2_vertex>\n	#include <color_vertex>\n	#include <skinbase_vertex>\n	#ifdef USE_ENVMAP\n	#include <beginnormal_vertex>\n	#include <morphnormal_vertex>\n	#include <skinnormal_vertex>\n	#include <defaultnormal_vertex>\n	#endif\n	#include <begin_vertex>\n	#include <morphtarget_vertex>\n	#include <skinning_vertex>\n	#include <project_vertex>\n	#include <logdepthbuf_vertex>\n	#include <worldpos_vertex>\n	#include <clipping_planes_vertex>\n	#include <envmap_vertex>\n}\n", THREE.ShaderChunk.meshlambert_frag = "uniform vec3 diffuse;\nuniform vec3 emissive;\nuniform float opacity;\nvarying vec3 vLightFront;\n#ifdef DOUBLE_SIDED\n	varying vec3 vLightBack;\n#endif\n#include <common>\n#include <packing>\n#include <color_pars_fragment>\n#include <uv_pars_fragment>\n#include <uv2_pars_fragment>\n#include <map_pars_fragment>\n#include <alphamap_pars_fragment>\n#include <aomap_pars_fragment>\n#include <lightmap_pars_fragment>\n#include <emissivemap_pars_fragment>\n#include <envmap_pars_fragment>\n#include <bsdfs>\n#include <lights_pars>\n#include <fog_pars_fragment>\n#include <shadowmap_pars_fragment>\n#include <shadowmask_pars_fragment>\n#include <specularmap_pars_fragment>\n#include <logdepthbuf_pars_fragment>\n#include <clipping_planes_pars_fragment>\nvoid main() {\n	#include <clipping_planes_fragment>\n	vec4 diffuseColor = vec4( diffuse, opacity );\n	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );\n	vec3 totalEmissiveRadiance = emissive;\n	#include <logdepthbuf_fragment>\n	#include <map_fragment>\n	#include <color_fragment>\n	#include <alphamap_fragment>\n	#include <alphatest_fragment>\n	#include <specularmap_fragment>\n	#include <emissivemap_fragment>\n	reflectedLight.indirectDiffuse = getAmbientLightIrradiance( ambientLightColor );\n	#include <lightmap_fragment>\n	reflectedLight.indirectDiffuse *= BRDF_Diffuse_Lambert( diffuseColor.rgb );\n	#ifdef DOUBLE_SIDED\n		reflectedLight.directDiffuse = ( gl_FrontFacing ) ? vLightFront : vLightBack;\n	#else\n		reflectedLight.directDiffuse = vLightFront;\n	#endif\n	reflectedLight.directDiffuse *= BRDF_Diffuse_Lambert( diffuseColor.rgb ) * getShadowMask();\n	#include <aomap_fragment>\n	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;\n	#include <normal_flip>\n	#include <envmap_fragment>\n	gl_FragColor = vec4( outgoingLight, diffuseColor.a );\n	#include <premultiplied_alpha_fragment>\n	#include <tonemapping_fragment>\n	#include <encodings_fragment>\n	#include <fog_fragment>\n}\n", THREE.ShaderChunk.meshlambert_vert = "#define LAMBERT\nvarying vec3 vLightFront;\n#ifdef DOUBLE_SIDED\n	varying vec3 vLightBack;\n#endif\n#include <common>\n#include <uv_pars_vertex>\n#include <uv2_pars_vertex>\n#include <envmap_pars_vertex>\n#include <bsdfs>\n#include <lights_pars>\n#include <color_pars_vertex>\n#include <morphtarget_pars_vertex>\n#include <skinning_pars_vertex>\n#include <shadowmap_pars_vertex>\n#include <logdepthbuf_pars_vertex>\n#include <clipping_planes_pars_vertex>\nvoid main() {\n	#include <uv_vertex>\n	#include <uv2_vertex>\n	#include <color_vertex>\n	#include <beginnormal_vertex>\n	#include <morphnormal_vertex>\n	#include <skinbase_vertex>\n	#include <skinnormal_vertex>\n	#include <defaultnormal_vertex>\n	#include <begin_vertex>\n	#include <morphtarget_vertex>\n	#include <skinning_vertex>\n	#include <project_vertex>\n	#include <logdepthbuf_vertex>\n	#include <clipping_planes_vertex>\n	#include <worldpos_vertex>\n	#include <envmap_vertex>\n	#include <lights_lambert_vertex>\n	#include <shadowmap_vertex>\n}\n", THREE.ShaderChunk.meshphong_frag = "#define PHONG\nuniform vec3 diffuse;\nuniform vec3 emissive;\nuniform vec3 specular;\nuniform float shininess;\nuniform float opacity;\n#include <common>\n#include <packing>\n#include <color_pars_fragment>\n#include <uv_pars_fragment>\n#include <uv2_pars_fragment>\n#include <map_pars_fragment>\n#include <alphamap_pars_fragment>\n#include <aomap_pars_fragment>\n#include <lightmap_pars_fragment>\n#include <emissivemap_pars_fragment>\n#include <envmap_pars_fragment>\n#include <fog_pars_fragment>\n#include <bsdfs>\n#include <lights_pars>\n#include <lights_phong_pars_fragment>\n#include <shadowmap_pars_fragment>\n#include <bumpmap_pars_fragment>\n#include <normalmap_pars_fragment>\n#include <specularmap_pars_fragment>\n#include <logdepthbuf_pars_fragment>\n#include <clipping_planes_pars_fragment>\nvoid main() {\n	#include <clipping_planes_fragment>\n	vec4 diffuseColor = vec4( diffuse, opacity );\n	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );\n	vec3 totalEmissiveRadiance = emissive;\n	#include <logdepthbuf_fragment>\n	#include <map_fragment>\n	#include <color_fragment>\n	#include <alphamap_fragment>\n	#include <alphatest_fragment>\n	#include <specularmap_fragment>\n	#include <normal_flip>\n	#include <normal_fragment>\n	#include <emissivemap_fragment>\n	#include <lights_phong_fragment>\n	#include <lights_template>\n	#include <aomap_fragment>\n	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;\n	#include <envmap_fragment>\n	gl_FragColor = vec4( outgoingLight, diffuseColor.a );\n	#include <premultiplied_alpha_fragment>\n	#include <tonemapping_fragment>\n	#include <encodings_fragment>\n	#include <fog_fragment>\n}\n", THREE.ShaderChunk.meshphong_vert = "#define PHONG\nvarying vec3 vViewPosition;\n#ifndef FLAT_SHADED\n	varying vec3 vNormal;\n#endif\n#include <common>\n#include <uv_pars_vertex>\n#include <uv2_pars_vertex>\n#include <displacementmap_pars_vertex>\n#include <envmap_pars_vertex>\n#include <color_pars_vertex>\n#include <morphtarget_pars_vertex>\n#include <skinning_pars_vertex>\n#include <shadowmap_pars_vertex>\n#include <logdepthbuf_pars_vertex>\n#include <clipping_planes_pars_vertex>\nvoid main() {\n	#include <uv_vertex>\n	#include <uv2_vertex>\n	#include <color_vertex>\n	#include <beginnormal_vertex>\n	#include <morphnormal_vertex>\n	#include <skinbase_vertex>\n	#include <skinnormal_vertex>\n	#include <defaultnormal_vertex>\n#ifndef FLAT_SHADED\n	vNormal = normalize( transformedNormal );\n#endif\n	#include <begin_vertex>\n	#include <displacementmap_vertex>\n	#include <morphtarget_vertex>\n	#include <skinning_vertex>\n	#include <project_vertex>\n	#include <logdepthbuf_vertex>\n	#include <clipping_planes_vertex>\n	vViewPosition = - mvPosition.xyz;\n	#include <worldpos_vertex>\n	#include <envmap_vertex>\n	#include <shadowmap_vertex>\n}\n", THREE.ShaderChunk.meshphysical_frag = "#define PHYSICAL\nuniform vec3 diffuse;\nuniform vec3 emissive;\nuniform float roughness;\nuniform float metalness;\nuniform float opacity;\n#ifndef STANDARD\n	uniform float clearCoat;\n	uniform float clearCoatRoughness;\n#endif\nuniform float envMapIntensity;\nvarying vec3 vViewPosition;\n#ifndef FLAT_SHADED\n	varying vec3 vNormal;\n#endif\n#include <common>\n#include <packing>\n#include <color_pars_fragment>\n#include <uv_pars_fragment>\n#include <uv2_pars_fragment>\n#include <map_pars_fragment>\n#include <alphamap_pars_fragment>\n#include <aomap_pars_fragment>\n#include <lightmap_pars_fragment>\n#include <emissivemap_pars_fragment>\n#include <envmap_pars_fragment>\n#include <fog_pars_fragment>\n#include <bsdfs>\n#include <cube_uv_reflection_fragment>\n#include <lights_pars>\n#include <lights_physical_pars_fragment>\n#include <shadowmap_pars_fragment>\n#include <bumpmap_pars_fragment>\n#include <normalmap_pars_fragment>\n#include <roughnessmap_pars_fragment>\n#include <metalnessmap_pars_fragment>\n#include <logdepthbuf_pars_fragment>\n#include <clipping_planes_pars_fragment>\nvoid main() {\n	#include <clipping_planes_fragment>\n	vec4 diffuseColor = vec4( diffuse, opacity );\n	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );\n	vec3 totalEmissiveRadiance = emissive;\n	#include <logdepthbuf_fragment>\n	#include <map_fragment>\n	#include <color_fragment>\n	#include <alphamap_fragment>\n	#include <alphatest_fragment>\n	#include <specularmap_fragment>\n	#include <roughnessmap_fragment>\n	#include <metalnessmap_fragment>\n	#include <normal_flip>\n	#include <normal_fragment>\n	#include <emissivemap_fragment>\n	#include <lights_physical_fragment>\n	#include <lights_template>\n	#include <aomap_fragment>\n	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;\n	gl_FragColor = vec4( outgoingLight, diffuseColor.a );\n	#include <premultiplied_alpha_fragment>\n	#include <tonemapping_fragment>\n	#include <encodings_fragment>\n	#include <fog_fragment>\n}\n", THREE.ShaderChunk.meshphysical_vert = "#define PHYSICAL\nvarying vec3 vViewPosition;\n#ifndef FLAT_SHADED\n	varying vec3 vNormal;\n#endif\n#include <common>\n#include <uv_pars_vertex>\n#include <uv2_pars_vertex>\n#include <displacementmap_pars_vertex>\n#include <color_pars_vertex>\n#include <morphtarget_pars_vertex>\n#include <skinning_pars_vertex>\n#include <shadowmap_pars_vertex>\n#include <specularmap_pars_fragment>\n#include <logdepthbuf_pars_vertex>\n#include <clipping_planes_pars_vertex>\nvoid main() {\n	#include <uv_vertex>\n	#include <uv2_vertex>\n	#include <color_vertex>\n	#include <beginnormal_vertex>\n	#include <morphnormal_vertex>\n	#include <skinbase_vertex>\n	#include <skinnormal_vertex>\n	#include <defaultnormal_vertex>\n#ifndef FLAT_SHADED\n	vNormal = normalize( transformedNormal );\n#endif\n	#include <begin_vertex>\n	#include <displacementmap_vertex>\n	#include <morphtarget_vertex>\n	#include <skinning_vertex>\n	#include <project_vertex>\n	#include <logdepthbuf_vertex>\n	#include <clipping_planes_vertex>\n	vViewPosition = - mvPosition.xyz;\n	#include <worldpos_vertex>\n	#include <shadowmap_vertex>\n}\n", THREE.ShaderChunk.normal_frag = "uniform float opacity;\nvarying vec3 vNormal;\n#include <common>\n#include <packing>\n#include <logdepthbuf_pars_fragment>\n#include <clipping_planes_pars_fragment>\nvoid main() {\n	#include <clipping_planes_fragment>\n	gl_FragColor = vec4( packNormalToRGB( vNormal ), opacity );\n	#include <logdepthbuf_fragment>\n}\n", THREE.ShaderChunk.normal_vert = "varying vec3 vNormal;\n#include <common>\n#include <morphtarget_pars_vertex>\n#include <logdepthbuf_pars_vertex>\n#include <clipping_planes_pars_vertex>\nvoid main() {\n	vNormal = normalize( normalMatrix * normal );\n	#include <begin_vertex>\n	#include <morphtarget_vertex>\n	#include <project_vertex>\n	#include <logdepthbuf_vertex>\n	#include <clipping_planes_vertex>\n}\n", THREE.ShaderChunk.points_frag = "uniform vec3 diffuse;\nuniform float opacity;\n#include <common>\n#include <color_pars_fragment>\n#include <map_particle_pars_fragment>\n#include <fog_pars_fragment>\n#include <shadowmap_pars_fragment>\n#include <logdepthbuf_pars_fragment>\n#include <clipping_planes_pars_fragment>\nvoid main() {\n	#include <clipping_planes_fragment>\n	vec3 outgoingLight = vec3( 0.0 );\n	vec4 diffuseColor = vec4( diffuse, opacity );\n	#include <logdepthbuf_fragment>\n	#include <map_particle_fragment>\n	#include <color_fragment>\n	#include <alphatest_fragment>\n	outgoingLight = diffuseColor.rgb;\n	gl_FragColor = vec4( outgoingLight, diffuseColor.a );\n	#include <premultiplied_alpha_fragment>\n	#include <tonemapping_fragment>\n	#include <encodings_fragment>\n	#include <fog_fragment>\n}\n", THREE.ShaderChunk.points_vert = "uniform float size;\nuniform float scale;\n#include <common>\n#include <color_pars_vertex>\n#include <shadowmap_pars_vertex>\n#include <logdepthbuf_pars_vertex>\n#include <clipping_planes_pars_vertex>\nvoid main() {\n	#include <color_vertex>\n	#include <begin_vertex>\n	#include <project_vertex>\n	#ifdef USE_SIZEATTENUATION\n		gl_PointSize = size * ( scale / - mvPosition.z );\n	#else\n		gl_PointSize = size;\n	#endif\n	#include <logdepthbuf_vertex>\n	#include <clipping_planes_vertex>\n	#include <worldpos_vertex>\n	#include <shadowmap_vertex>\n}\n", THREE.ShaderChunk.shadow_frag = "uniform float opacity;\n#include <common>\n#include <packing>\n#include <bsdfs>\n#include <lights_pars>\n#include <shadowmap_pars_fragment>\n#include <shadowmask_pars_fragment>\nvoid main() {\n	gl_FragColor = vec4( 0.0, 0.0, 0.0, opacity * ( 1.0  - getShadowMask() ) );\n}\n", THREE.ShaderChunk.shadow_vert = "#include <shadowmap_pars_vertex>\nvoid main() {\n	#include <begin_vertex>\n	#include <project_vertex>\n	#include <worldpos_vertex>\n	#include <shadowmap_vertex>\n}\n", THREE.ShaderLib = {
        basic: {
            uniforms: THREE.UniformsUtils.merge([THREE.UniformsLib.common, THREE.UniformsLib.aomap, THREE.UniformsLib.fog]),
            vertexShader: THREE.ShaderChunk.meshbasic_vert,
            fragmentShader: THREE.ShaderChunk.meshbasic_frag
        },
        lambert: {
            uniforms: THREE.UniformsUtils.merge([THREE.UniformsLib.common, THREE.UniformsLib.aomap, THREE.UniformsLib.lightmap, THREE.UniformsLib.emissivemap, THREE.UniformsLib.fog, THREE.UniformsLib.lights, {
                emissive: {
                    value: new THREE.Color(0)
                }
            }]),
            vertexShader: THREE.ShaderChunk.meshlambert_vert,
            fragmentShader: THREE.ShaderChunk.meshlambert_frag
        },
        phong: {
            uniforms: THREE.UniformsUtils.merge([THREE.UniformsLib.common, THREE.UniformsLib.aomap, THREE.UniformsLib.lightmap, THREE.UniformsLib.emissivemap, THREE.UniformsLib.bumpmap, THREE.UniformsLib.normalmap, THREE.UniformsLib.displacementmap, THREE.UniformsLib.fog, THREE.UniformsLib.lights, {
                emissive: {
                    value: new THREE.Color(0)
                },
                specular: {
                    value: new THREE.Color(1118481)
                },
                shininess: {
                    value: 30
                }
            }]),
            vertexShader: THREE.ShaderChunk.meshphong_vert,
            fragmentShader: THREE.ShaderChunk.meshphong_frag
        },
        standard: {
            uniforms: THREE.UniformsUtils.merge([THREE.UniformsLib.common, THREE.UniformsLib.aomap, THREE.UniformsLib.lightmap, THREE.UniformsLib.emissivemap, THREE.UniformsLib.bumpmap, THREE.UniformsLib.normalmap, THREE.UniformsLib.displacementmap, THREE.UniformsLib.roughnessmap, THREE.UniformsLib.metalnessmap, THREE.UniformsLib.fog, THREE.UniformsLib.lights, {
                emissive: {
                    value: new THREE.Color(0)
                },
                roughness: {
                    value: .5
                },
                metalness: {
                    value: 0
                },
                envMapIntensity: {
                    value: 1
                }
            }]),
            vertexShader: THREE.ShaderChunk.meshphysical_vert,
            fragmentShader: THREE.ShaderChunk.meshphysical_frag
        },
        points: {
            uniforms: THREE.UniformsUtils.merge([THREE.UniformsLib.points, THREE.UniformsLib.fog]),
            vertexShader: THREE.ShaderChunk.points_vert,
            fragmentShader: THREE.ShaderChunk.points_frag
        },
        dashed: {
            uniforms: THREE.UniformsUtils.merge([THREE.UniformsLib.common, THREE.UniformsLib.fog, {
                scale: {
                    value: 1
                },
                dashSize: {
                    value: 1
                },
                totalSize: {
                    value: 2
                }
            }]),
            vertexShader: THREE.ShaderChunk.linedashed_vert,
            fragmentShader: THREE.ShaderChunk.linedashed_frag
        },
        depth: {
            uniforms: THREE.UniformsUtils.merge([THREE.UniformsLib.common, THREE.UniformsLib.displacementmap]),
            vertexShader: THREE.ShaderChunk.depth_vert,
            fragmentShader: THREE.ShaderChunk.depth_frag
        },
        normal: {
            uniforms: {
                opacity: {
                    value: 1
                }
            },
            vertexShader: THREE.ShaderChunk.normal_vert,
            fragmentShader: THREE.ShaderChunk.normal_frag
        },
        cube: {
            uniforms: {
                tCube: {
                    value: null
                },
                tFlip: {
                    value: -1
                },
                opacity: {
                    value: 1
                }
            },
            vertexShader: THREE.ShaderChunk.cube_vert,
            fragmentShader: THREE.ShaderChunk.cube_frag
        },
        equirect: {
            uniforms: {
                tEquirect: {
                    value: null
                },
                tFlip: {
                    value: -1
                }
            },
            vertexShader: THREE.ShaderChunk.equirect_vert,
            fragmentShader: THREE.ShaderChunk.equirect_frag
        },
        distanceRGBA: {
            uniforms: {
                lightPos: {
                    value: new THREE.Vector3
                }
            },
            vertexShader: THREE.ShaderChunk.distanceRGBA_vert,
            fragmentShader: THREE.ShaderChunk.distanceRGBA_frag
        }
    }, THREE.ShaderLib.physical = {
        uniforms: THREE.UniformsUtils.merge([THREE.ShaderLib.standard.uniforms, {
            clearCoat: {
                value: 0
            },
            clearCoatRoughness: {
                value: 0
            }
        }]),
        vertexShader: THREE.ShaderChunk.meshphysical_vert,
        fragmentShader: THREE.ShaderChunk.meshphysical_frag
    }, THREE.WebGLRenderer = function(a) {
        function b(a, b, c, d) {
            !0 === y && (a *= d, b *= d, c *= d), la.clearColor(a, b, c, d)
        }

        function c() {
            la.init(), la.scissor(P.copy(Y).multiplyScalar(X)), la.viewport(R.copy($).multiplyScalar(X)), b(T.r, T.g, T.b, U)
        }

        function d() {
            O = J = null, N = "", M = -1, la.reset()
        }

        function e(a) {
            a.preventDefault(), d(), c(), ma.clear()
        }

        function f(a) {
            a = a.target, a.removeEventListener("dispose", f), g(a), ma.delete(a)
        }

        function g(a) {
            var b = ma.get(a).program;
            a.program = void 0, void 0 !== b && pa.releaseProgram(b)
        }

        function h(a, b) {
            return Math.abs(b[0]) - Math.abs(a[0])
        }

        function i(a, b) {
            return a.object.renderOrder !== b.object.renderOrder ? a.object.renderOrder - b.object.renderOrder : a.material.program && b.material.program && a.material.program !== b.material.program ? a.material.program.id - b.material.program.id : a.material.id !== b.material.id ? a.material.id - b.material.id : a.z !== b.z ? a.z - b.z : a.id - b.id
        }

        function j(a, b) {
            return a.object.renderOrder !== b.object.renderOrder ? a.object.renderOrder - b.object.renderOrder : a.z !== b.z ? b.z - a.z : a.id - b.id
        }

        function k(a, b, c, d, e) {
            var f;
            c.transparent ? (d = D, f = ++E) : (d = B, f = ++C), f = d[f], void 0 !== f ? (f.id = a.id, f.object = a, f.geometry = b, f.material = c, f.z = fa.z, f.group = e) : (f = {
                id: a.id,
                object: a,
                geometry: b,
                material: c,
                z: fa.z,
                group: e
            }, d.push(f))
        }

        function l(a) {
            if (!_.intersectsSphere(a)) return !1;
            var b = aa.numPlanes;
            if (0 === b) return !0;
            var c = I.clippingPlanes,
                d = a.center;
            a = -a.radius;
            var e = 0;
            do
                if (c[e].distanceToPoint(d) < a) return !1;
            while (++e !== b);
            return !0
        }

        function m(a, b) {
            if (!1 !== a.visible) {
                if (a.layers.test(b.layers))
                    if (a instanceof THREE.Light) A.push(a);
                    else if (a instanceof THREE.Sprite) {
                    var c;
                    (c = !1 === a.frustumCulled) || (da.center.set(0, 0, 0), da.radius = .7071067811865476, da.applyMatrix4(a.matrixWorld), c = !0 === l(da)), c && G.push(a)
                } else if (a instanceof THREE.LensFlare) H.push(a);
                else if (a instanceof THREE.ImmediateRenderObject) !0 === I.sortObjects && (fa.setFromMatrixPosition(a.matrixWorld), fa.applyProjection(ea)), k(a, null, a.material, fa.z, null);
                else if ((a instanceof THREE.Mesh || a instanceof THREE.Line || a instanceof THREE.Points) && (a instanceof THREE.SkinnedMesh && a.skeleton.update(), (c = !1 === a.frustumCulled) || (c = a.geometry, null === c.boundingSphere && c.computeBoundingSphere(), da.copy(c.boundingSphere).applyMatrix4(a.matrixWorld), c = !0 === l(da)), c)) {
                    var d = a.material;
                    if (!0 === d.visible)
                        if (!0 === I.sortObjects && (fa.setFromMatrixPosition(a.matrixWorld), fa.applyProjection(ea)), c = oa.update(a), d instanceof THREE.MultiMaterial)
                            for (var e = c.groups, f = d.materials, d = 0, g = e.length; g > d; d++) {
                                var h = e[d],
                                    i = f[h.materialIndex];
                                !0 === i.visible && k(a, c, i, fa.z, h)
                            } else k(a, c, d, fa.z, null)
                }
                for (c = a.children, d = 0, g = c.length; g > d; d++) m(c[d], b)
            }
        }

        function n(a, b, c, d) {
            for (var e = 0, f = a.length; f > e; e++) {
                var g = a[e],
                    h = g.object,
                    i = g.geometry,
                    j = void 0 === d ? g.material : d,
                    g = g.group;
                if (h.modelViewMatrix.multiplyMatrices(b.matrixWorldInverse, h.matrixWorld), h.normalMatrix.getNormalMatrix(h.modelViewMatrix), h instanceof THREE.ImmediateRenderObject) {
                    o(j);
                    var k = p(b, c, j, h);
                    N = "", h.render(function(a) {
                        I.renderBufferImmediate(a, k, j)
                    })
                } else I.renderBufferDirect(b, c, i, j, h, g)
            }
        }

        function o(a) {
            a.side !== THREE.DoubleSide ? la.enable(ia.CULL_FACE) : la.disable(ia.CULL_FACE), la.setFlipSided(a.side === THREE.BackSide), !0 === a.transparent ? la.setBlending(a.blending, a.blendEquation, a.blendSrc, a.blendDst, a.blendEquationAlpha, a.blendSrcAlpha, a.blendDstAlpha, a.premultipliedAlpha) : la.setBlending(THREE.NoBlending), la.setDepthFunc(a.depthFunc), la.setDepthTest(a.depthTest), la.setDepthWrite(a.depthWrite), la.setColorWrite(a.colorWrite), la.setPolygonOffset(a.polygonOffset, a.polygonOffsetFactor, a.polygonOffsetUnits)
        }

        function p(a, b, c, d) {
            S = 0;
            var e = ma.get(c);
            if (ba && ((ca || a !== O) && aa.setState(c.clippingPlanes, c.clipShadows, a, e, a === O && c.id === M), void 0 !== e.numClippingPlanes && e.numClippingPlanes !== aa.numPlanes && (c.needsUpdate = !0)), void 0 === e.program && (c.needsUpdate = !0), void 0 !== e.lightsHash && e.lightsHash !== ga.hash && (c.needsUpdate = !0), c.needsUpdate) {
                a: {
                    var h = ma.get(c),
                        i = pa.getParameters(c, ga, b, aa.numPlanes, d),
                        j = pa.getProgramCode(c, i),
                        k = h.program,
                        l = !0;
                    if (void 0 === k) c.addEventListener("dispose", f);
                    else if (k.code !== j) g(c);
                    else {
                        if (void 0 !== i.shaderID) break a;
                        l = !1
                    }
                    if (l && (i.shaderID ? (k = THREE.ShaderLib[i.shaderID], h.__webglShader = {
                            name: c.type,
                            uniforms: THREE.UniformsUtils.clone(k.uniforms),
                            vertexShader: k.vertexShader,
                            fragmentShader: k.fragmentShader
                        }) : h.__webglShader = {
                            name: c.type,
                            uniforms: c.uniforms,
                            vertexShader: c.vertexShader,
                            fragmentShader: c.fragmentShader
                        }, c.__webglShader = h.__webglShader, k = pa.acquireProgram(c, i, j), h.program = k, c.program = k), i = k.getAttributes(), c.morphTargets)
                        for (j = c.numSupportedMorphTargets = 0; j < I.maxMorphTargets; j++) 0 <= i["morphTarget" + j] && c.numSupportedMorphTargets++;
                    if (c.morphNormals)
                        for (j = c.numSupportedMorphNormals = 0; j < I.maxMorphNormals; j++) 0 <= i["morphNormal" + j] && c.numSupportedMorphNormals++;
                    i = h.__webglShader.uniforms, (c instanceof THREE.ShaderMaterial || c instanceof THREE.RawShaderMaterial) && !0 !== c.clipping || (h.numClippingPlanes = aa.numPlanes, i.clippingPlanes = aa.uniform), c.lights && (h.lightsHash = ga.hash, i.ambientLightColor.value = ga.ambient, i.directionalLights.value = ga.directional, i.spotLights.value = ga.spot, i.pointLights.value = ga.point, i.hemisphereLights.value = ga.hemi, i.directionalShadowMap.value = ga.directionalShadowMap, i.directionalShadowMatrix.value = ga.directionalShadowMatrix, i.spotShadowMap.value = ga.spotShadowMap, i.spotShadowMatrix.value = ga.spotShadowMatrix, i.pointShadowMap.value = ga.pointShadowMap, i.pointShadowMatrix.value = ga.pointShadowMatrix), j = h.program.getUniforms(), j = THREE.WebGLUniforms.seqWithValue(j.seq, i), h.uniformsList = j, h.dynamicUniforms = THREE.WebGLUniforms.splitDynamic(j, i)
                }
                c.needsUpdate = !1
            }
            var m = !1,
                l = k = !1,
                h = e.program,
                j = h.getUniforms(),
                i = e.__webglShader.uniforms;
            if (h.id !== J && (ia.useProgram(h.program), J = h.id, l = k = m = !0), c.id !== M && (M = c.id, k = !0), (m || a !== O) && (j.set(ia, a, "projectionMatrix"), ka.logarithmicDepthBuffer && j.setValue(ia, "logDepthBufFC", 2 / (Math.log(a.far + 1) / Math.LN2)), a !== O && (O = a, l = k = !0), (c instanceof THREE.ShaderMaterial || c instanceof THREE.MeshPhongMaterial || c instanceof THREE.MeshStandardMaterial || c.envMap) && (m = j.map.cameraPosition, void 0 !== m && m.setValue(ia, fa.setFromMatrixPosition(a.matrixWorld))), (c instanceof THREE.MeshPhongMaterial || c instanceof THREE.MeshLambertMaterial || c instanceof THREE.MeshBasicMaterial || c instanceof THREE.MeshStandardMaterial || c instanceof THREE.ShaderMaterial || c.skinning) && j.setValue(ia, "viewMatrix", a.matrixWorldInverse), j.set(ia, I, "toneMappingExposure"), j.set(ia, I, "toneMappingWhitePoint")), c.skinning && (j.setOptional(ia, d, "bindMatrix"), j.setOptional(ia, d, "bindMatrixInverse"), m = d.skeleton) && (ka.floatVertexTextures && m.useVertexTexture ? (j.set(ia, m, "boneTexture"), j.set(ia, m, "boneTextureWidth"), j.set(ia, m, "boneTextureHeight")) : j.setOptional(ia, m, "boneMatrices")), k) {
                if (c.lights && (k = l, i.ambientLightColor.needsUpdate = k, i.directionalLights.needsUpdate = k, i.pointLights.needsUpdate = k, i.spotLights.needsUpdate = k, i.hemisphereLights.needsUpdate = k), b && c.fog && (i.fogColor.value = b.color, b instanceof THREE.Fog ? (i.fogNear.value = b.near, i.fogFar.value = b.far) : b instanceof THREE.FogExp2 && (i.fogDensity.value = b.density)), c instanceof THREE.MeshBasicMaterial || c instanceof THREE.MeshLambertMaterial || c instanceof THREE.MeshPhongMaterial || c instanceof THREE.MeshStandardMaterial || c instanceof THREE.MeshDepthMaterial) {
                    i.opacity.value = c.opacity, i.diffuse.value = c.color, c.emissive && i.emissive.value.copy(c.emissive).multiplyScalar(c.emissiveIntensity), i.map.value = c.map, i.specularMap.value = c.specularMap, i.alphaMap.value = c.alphaMap, c.aoMap && (i.aoMap.value = c.aoMap, i.aoMapIntensity.value = c.aoMapIntensity);
                    var n;
                    c.map ? n = c.map : c.specularMap ? n = c.specularMap : c.displacementMap ? n = c.displacementMap : c.normalMap ? n = c.normalMap : c.bumpMap ? n = c.bumpMap : c.roughnessMap ? n = c.roughnessMap : c.metalnessMap ? n = c.metalnessMap : c.alphaMap ? n = c.alphaMap : c.emissiveMap && (n = c.emissiveMap), void 0 !== n && (n instanceof THREE.WebGLRenderTarget && (n = n.texture), b = n.offset, n = n.repeat, i.offsetRepeat.value.set(b.x, b.y, n.x, n.y)), i.envMap.value = c.envMap, i.flipEnvMap.value = c.envMap instanceof THREE.CubeTexture ? -1 : 1, i.reflectivity.value = c.reflectivity, i.refractionRatio.value = c.refractionRatio
                }
                c instanceof THREE.LineBasicMaterial ? (i.diffuse.value = c.color, i.opacity.value = c.opacity) : c instanceof THREE.LineDashedMaterial ? (i.diffuse.value = c.color, i.opacity.value = c.opacity, i.dashSize.value = c.dashSize, i.totalSize.value = c.dashSize + c.gapSize, i.scale.value = c.scale) : c instanceof THREE.PointsMaterial ? (i.diffuse.value = c.color, i.opacity.value = c.opacity, i.size.value = c.size * X, i.scale.value = .5 * s.clientHeight, i.map.value = c.map, null !== c.map && (n = c.map.offset, c = c.map.repeat, i.offsetRepeat.value.set(n.x, n.y, c.x, c.y))) : c instanceof THREE.MeshLambertMaterial ? (c.lightMap && (i.lightMap.value = c.lightMap, i.lightMapIntensity.value = c.lightMapIntensity), c.emissiveMap && (i.emissiveMap.value = c.emissiveMap)) : c instanceof THREE.MeshPhongMaterial ? (i.specular.value = c.specular, i.shininess.value = Math.max(c.shininess, 1e-4), c.lightMap && (i.lightMap.value = c.lightMap, i.lightMapIntensity.value = c.lightMapIntensity), c.emissiveMap && (i.emissiveMap.value = c.emissiveMap), c.bumpMap && (i.bumpMap.value = c.bumpMap, i.bumpScale.value = c.bumpScale), c.normalMap && (i.normalMap.value = c.normalMap, i.normalScale.value.copy(c.normalScale)), c.displacementMap && (i.displacementMap.value = c.displacementMap, i.displacementScale.value = c.displacementScale, i.displacementBias.value = c.displacementBias)) : c instanceof THREE.MeshPhysicalMaterial ? (i.clearCoat.value = c.clearCoat, i.clearCoatRoughness.value = c.clearCoatRoughness, q(i, c)) : c instanceof THREE.MeshStandardMaterial ? q(i, c) : c instanceof THREE.MeshDepthMaterial ? c.displacementMap && (i.displacementMap.value = c.displacementMap, i.displacementScale.value = c.displacementScale, i.displacementBias.value = c.displacementBias) : c instanceof THREE.MeshNormalMaterial && (i.opacity.value = c.opacity), THREE.WebGLUniforms.upload(ia, e.uniformsList, i, I)
            }
            return j.set(ia, d, "modelViewMatrix"), j.set(ia, d, "normalMatrix"), j.setValue(ia, "modelMatrix", d.matrixWorld), e = e.dynamicUniforms, null !== e && (THREE.WebGLUniforms.evalDynamic(e, i, d, a), THREE.WebGLUniforms.upload(ia, e, i, I)), h
        }

        function q(a, b) {
            a.roughness.value = b.roughness, a.metalness.value = b.metalness, b.roughnessMap && (a.roughnessMap.value = b.roughnessMap), b.metalnessMap && (a.metalnessMap.value = b.metalnessMap), b.lightMap && (a.lightMap.value = b.lightMap, a.lightMapIntensity.value = b.lightMapIntensity), b.emissiveMap && (a.emissiveMap.value = b.emissiveMap), b.bumpMap && (a.bumpMap.value = b.bumpMap, a.bumpScale.value = b.bumpScale), b.normalMap && (a.normalMap.value = b.normalMap, a.normalScale.value.copy(b.normalScale)), b.displacementMap && (a.displacementMap.value = b.displacementMap, a.displacementScale.value = b.displacementScale, a.displacementBias.value = b.displacementBias), b.envMap && (a.envMapIntensity.value = b.envMapIntensity)
        }

        function r(a) {
            var b;
            if (a === THREE.RepeatWrapping) return ia.REPEAT;
            if (a === THREE.ClampToEdgeWrapping) return ia.CLAMP_TO_EDGE;
            if (a === THREE.MirroredRepeatWrapping) return ia.MIRRORED_REPEAT;
            if (a === THREE.NearestFilter) return ia.NEAREST;
            if (a === THREE.NearestMipMapNearestFilter) return ia.NEAREST_MIPMAP_NEAREST;
            if (a === THREE.NearestMipMapLinearFilter) return ia.NEAREST_MIPMAP_LINEAR;
            if (a === THREE.LinearFilter) return ia.LINEAR;
            if (a === THREE.LinearMipMapNearestFilter) return ia.LINEAR_MIPMAP_NEAREST;
            if (a === THREE.LinearMipMapLinearFilter) return ia.LINEAR_MIPMAP_LINEAR;
            if (a === THREE.UnsignedByteType) return ia.UNSIGNED_BYTE;
            if (a === THREE.UnsignedShort4444Type) return ia.UNSIGNED_SHORT_4_4_4_4;
            if (a === THREE.UnsignedShort5551Type) return ia.UNSIGNED_SHORT_5_5_5_1;
            if (a === THREE.UnsignedShort565Type) return ia.UNSIGNED_SHORT_5_6_5;
            if (a === THREE.ByteType) return ia.BYTE;
            if (a === THREE.ShortType) return ia.SHORT;
            if (a === THREE.UnsignedShortType) return ia.UNSIGNED_SHORT;
            if (a === THREE.IntType) return ia.INT;
            if (a === THREE.UnsignedIntType) return ia.UNSIGNED_INT;
            if (a === THREE.FloatType) return ia.FLOAT;
            if (b = ja.get("OES_texture_half_float"), null !== b && a === THREE.HalfFloatType) return b.HALF_FLOAT_OES;
            if (a === THREE.AlphaFormat) return ia.ALPHA;
            if (a === THREE.RGBFormat) return ia.RGB;
            if (a === THREE.RGBAFormat) return ia.RGBA;
            if (a === THREE.LuminanceFormat) return ia.LUMINANCE;
            if (a === THREE.LuminanceAlphaFormat) return ia.LUMINANCE_ALPHA;
            if (a === THREE.DepthFormat) return ia.DEPTH_COMPONENT;
            if (a === THREE.AddEquation) return ia.FUNC_ADD;
            if (a === THREE.SubtractEquation) return ia.FUNC_SUBTRACT;
            if (a === THREE.ReverseSubtractEquation) return ia.FUNC_REVERSE_SUBTRACT;
            if (a === THREE.ZeroFactor) return ia.ZERO;
            if (a === THREE.OneFactor) return ia.ONE;
            if (a === THREE.SrcColorFactor) return ia.SRC_COLOR;
            if (a === THREE.OneMinusSrcColorFactor) return ia.ONE_MINUS_SRC_COLOR;
            if (a === THREE.SrcAlphaFactor) return ia.SRC_ALPHA;
            if (a === THREE.OneMinusSrcAlphaFactor) return ia.ONE_MINUS_SRC_ALPHA;
            if (a === THREE.DstAlphaFactor) return ia.DST_ALPHA;
            if (a === THREE.OneMinusDstAlphaFactor) return ia.ONE_MINUS_DST_ALPHA;
            if (a === THREE.DstColorFactor) return ia.DST_COLOR;
            if (a === THREE.OneMinusDstColorFactor) return ia.ONE_MINUS_DST_COLOR;
            if (a === THREE.SrcAlphaSaturateFactor) return ia.SRC_ALPHA_SATURATE;
            if (b = ja.get("WEBGL_compressed_texture_s3tc"), null !== b) {
                if (a === THREE.RGB_S3TC_DXT1_Format) return b.COMPRESSED_RGB_S3TC_DXT1_EXT;
                if (a === THREE.RGBA_S3TC_DXT1_Format) return b.COMPRESSED_RGBA_S3TC_DXT1_EXT;
                if (a === THREE.RGBA_S3TC_DXT3_Format) return b.COMPRESSED_RGBA_S3TC_DXT3_EXT;
                if (a === THREE.RGBA_S3TC_DXT5_Format) return b.COMPRESSED_RGBA_S3TC_DXT5_EXT
            }
            if (b = ja.get("WEBGL_compressed_texture_pvrtc"), null !== b) {
                if (a === THREE.RGB_PVRTC_4BPPV1_Format) return b.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;
                if (a === THREE.RGB_PVRTC_2BPPV1_Format) return b.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;
                if (a === THREE.RGBA_PVRTC_4BPPV1_Format) return b.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;
                if (a === THREE.RGBA_PVRTC_2BPPV1_Format) return b.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG
            }
            if (b = ja.get("WEBGL_compressed_texture_etc1"), null !== b && a === THREE.RGB_ETC1_Format) return b.COMPRESSED_RGB_ETC1_WEBGL;
            if (b = ja.get("EXT_blend_minmax"), null !== b) {
                if (a === THREE.MinEquation) return b.MIN_EXT;
                if (a === THREE.MaxEquation) return b.MAX_EXT
            }
            return 0
        }
        console.log("THREE.WebGLRenderer", THREE.REVISION), a = a || {};
        var s = void 0 !== a.canvas ? a.canvas : document.createElementNS("http://www.w3.org/1999/xhtml", "canvas"),
            t = void 0 !== a.context ? a.context : null,
            u = void 0 !== a.alpha ? a.alpha : !1,
            v = void 0 !== a.depth ? a.depth : !0,
            w = void 0 !== a.stencil ? a.stencil : !0,
            x = void 0 !== a.antialias ? a.antialias : !1,
            y = void 0 !== a.premultipliedAlpha ? a.premultipliedAlpha : !0,
            z = void 0 !== a.preserveDrawingBuffer ? a.preserveDrawingBuffer : !1,
            A = [],
            B = [],
            C = -1,
            D = [],
            E = -1,
            F = new Float32Array(8),
            G = [],
            H = [];
        this.domElement = s, this.context = null, this.sortObjects = this.autoClearStencil = this.autoClearDepth = this.autoClearColor = this.autoClear = !0, this.clippingPlanes = [], this.localClippingEnabled = !1, this.gammaFactor = 2, this.physicallyCorrectLights = this.gammaOutput = this.gammaInput = !1, this.toneMapping = THREE.LinearToneMapping, this.toneMappingWhitePoint = this.toneMappingExposure = 1, this.maxMorphTargets = 8, this.maxMorphNormals = 4;
        var I = this,
            J = null,
            K = null,
            L = null,
            M = -1,
            N = "",
            O = null,
            P = new THREE.Vector4,
            Q = null,
            R = new THREE.Vector4,
            S = 0,
            T = new THREE.Color(0),
            U = 0,
            V = s.width,
            W = s.height,
            X = 1,
            Y = new THREE.Vector4(0, 0, V, W),
            Z = !1,
            $ = new THREE.Vector4(0, 0, V, W),
            _ = new THREE.Frustum,
            aa = new THREE.WebGLClipping,
            ba = !1,
            ca = !1,
            da = new THREE.Sphere,
            ea = new THREE.Matrix4,
            fa = new THREE.Vector3,
            ga = {
                hash: "",
                ambient: [0, 0, 0],
                directional: [],
                directionalShadowMap: [],
                directionalShadowMatrix: [],
                spot: [],
                spotShadowMap: [],
                spotShadowMatrix: [],
                point: [],
                pointShadowMap: [],
                pointShadowMatrix: [],
                hemi: [],
                shadows: []
            },
            ha = {
                calls: 0,
                vertices: 0,
                faces: 0,
                points: 0
            };
        this.info = {
            render: ha,
            memory: {
                geometries: 0,
                textures: 0
            },
            programs: null
        };
        var ia;
        try {
            if (u = {
                    alpha: u,
                    depth: v,
                    stencil: w,
                    antialias: x,
                    premultipliedAlpha: y,
                    preserveDrawingBuffer: z
                }, ia = t || s.getContext("webgl", u) || s.getContext("experimental-webgl", u), null === ia) {
                if (null !== s.getContext("webgl")) throw "Error creating WebGL context with your selected attributes.";
                throw "Error creating WebGL context."
            }
            void 0 === ia.getShaderPrecisionFormat && (ia.getShaderPrecisionFormat = function() {
                return {
                    rangeMin: 1,
                    rangeMax: 1,
                    precision: 1
                }
            }), s.addEventListener("webglcontextlost", e, !1)
        } catch (a) {
            console.error("THREE.WebGLRenderer: " + a)
        }
        var ja = new THREE.WebGLExtensions(ia);
        ja.get("WEBGL_depth_texture"), ja.get("OES_texture_float"), ja.get("OES_texture_float_linear"), ja.get("OES_texture_half_float"), ja.get("OES_texture_half_float_linear"), ja.get("OES_standard_derivatives"), ja.get("ANGLE_instanced_arrays"), ja.get("OES_element_index_uint") && (THREE.BufferGeometry.MaxIndex = 4294967296);
        var ka = new THREE.WebGLCapabilities(ia, ja, a),
            la = new THREE.WebGLState(ia, ja, r),
            ma = new THREE.WebGLProperties,
            na = new THREE.WebGLTextures(ia, ja, la, ma, ka, r, this.info),
            oa = new THREE.WebGLObjects(ia, ma, this.info),
            pa = new THREE.WebGLPrograms(this, ka),
            qa = new THREE.WebGLLights;
        this.info.programs = pa.programs;
        var ra = new THREE.WebGLBufferRenderer(ia, ja, ha),
            sa = new THREE.WebGLIndexedBufferRenderer(ia, ja, ha),
            ta = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1),
            ua = new THREE.PerspectiveCamera,
            va = new THREE.Mesh(new THREE.PlaneBufferGeometry(2, 2), new THREE.MeshBasicMaterial({
                depthTest: !1,
                depthWrite: !1,
                fog: !1
            }));
        a = THREE.ShaderLib.cube;
        var wa = new THREE.Mesh(new THREE.BoxBufferGeometry(5, 5, 5), new THREE.ShaderMaterial({
            uniforms: a.uniforms,
            vertexShader: a.vertexShader,
            fragmentShader: a.fragmentShader,
            side: THREE.BackSide,
            depthTest: !1,
            depthWrite: !1,
            fog: !1
        }));
        c(), this.context = ia, this.capabilities = ka, this.extensions = ja, this.properties = ma, this.state = la;
        var xa = new THREE.WebGLShadowMap(this, ga, oa, ka);
        this.shadowMap = xa;
        var ya = new THREE.SpritePlugin(this, G),
            za = new THREE.LensFlarePlugin(this, H);
        this.getContext = function() {
            return ia
        }, this.getContextAttributes = function() {
            return ia.getContextAttributes()
        }, this.forceContextLoss = function() {
            ja.get("WEBGL_lose_context").loseContext()
        }, this.getMaxAnisotropy = function() {
            return ka.getMaxAnisotropy()
        }, this.getPrecision = function() {
            return ka.precision
        }, this.getPixelRatio = function() {
            return X
        }, this.setPixelRatio = function(a) {
            void 0 !== a && (X = a, this.setSize($.z, $.w, !1))
        }, this.getSize = function() {
            return {
                width: V,
                height: W
            }
        }, this.setSize = function(a, b, c) {
            V = a, W = b, s.width = a * X, s.height = b * X, !1 !== c && (s.style.width = a + "px", s.style.height = b + "px"), this.setViewport(0, 0, a, b)
        }, this.setViewport = function(a, b, c, d) {
            la.viewport($.set(a, b, c, d))
        }, this.setScissor = function(a, b, c, d) {
            la.scissor(Y.set(a, b, c, d))
        }, this.setScissorTest = function(a) {
            la.setScissorTest(Z = a)
        }, this.getClearColor = function() {
            return T
        }, this.setClearColor = function(a, c) {
            T.set(a), U = void 0 !== c ? c : 1, b(T.r, T.g, T.b, U)
        }, this.getClearAlpha = function() {
            return U
        }, this.setClearAlpha = function(a) {
            U = a, b(T.r, T.g, T.b, U)
        }, this.clear = function(a, b, c) {
            var d = 0;
            (void 0 === a || a) && (d |= ia.COLOR_BUFFER_BIT), (void 0 === b || b) && (d |= ia.DEPTH_BUFFER_BIT), (void 0 === c || c) && (d |= ia.STENCIL_BUFFER_BIT), ia.clear(d)
        }, this.clearColor = function() {
            this.clear(!0, !1, !1)
        }, this.clearDepth = function() {
            this.clear(!1, !0, !1)
        }, this.clearStencil = function() {
            this.clear(!1, !1, !0)
        }, this.clearTarget = function(a, b, c, d) {
            this.setRenderTarget(a), this.clear(b, c, d)
        }, this.resetGLState = d, this.dispose = function() {
            D = [], E = -1, B = [], C = -1, s.removeEventListener("webglcontextlost", e, !1)
        }, this.renderBufferImmediate = function(a, b, c) {
            la.initAttributes();
            var d = ma.get(a);
            if (a.hasPositions && !d.position && (d.position = ia.createBuffer()), a.hasNormals && !d.normal && (d.normal = ia.createBuffer()), a.hasUvs && !d.uv && (d.uv = ia.createBuffer()), a.hasColors && !d.color && (d.color = ia.createBuffer()), b = b.getAttributes(), a.hasPositions && (ia.bindBuffer(ia.ARRAY_BUFFER, d.position), ia.bufferData(ia.ARRAY_BUFFER, a.positionArray, ia.DYNAMIC_DRAW), la.enableAttribute(b.position), ia.vertexAttribPointer(b.position, 3, ia.FLOAT, !1, 0, 0)), a.hasNormals) {
                if (ia.bindBuffer(ia.ARRAY_BUFFER, d.normal), "MeshPhongMaterial" !== c.type && "MeshStandardMaterial" !== c.type && "MeshPhysicalMaterial" !== c.type && c.shading === THREE.FlatShading)
                    for (var e = 0, f = 3 * a.count; f > e; e += 9) {
                        var g = a.normalArray,
                            h = (g[e + 0] + g[e + 3] + g[e + 6]) / 3,
                            i = (g[e + 1] + g[e + 4] + g[e + 7]) / 3,
                            j = (g[e + 2] + g[e + 5] + g[e + 8]) / 3;
                        g[e + 0] = h, g[e + 1] = i, g[e + 2] = j, g[e + 3] = h, g[e + 4] = i, g[e + 5] = j, g[e + 6] = h, g[e + 7] = i, g[e + 8] = j
                    }
                ia.bufferData(ia.ARRAY_BUFFER, a.normalArray, ia.DYNAMIC_DRAW), la.enableAttribute(b.normal), ia.vertexAttribPointer(b.normal, 3, ia.FLOAT, !1, 0, 0)
            }
            a.hasUvs && c.map && (ia.bindBuffer(ia.ARRAY_BUFFER, d.uv), ia.bufferData(ia.ARRAY_BUFFER, a.uvArray, ia.DYNAMIC_DRAW), la.enableAttribute(b.uv), ia.vertexAttribPointer(b.uv, 2, ia.FLOAT, !1, 0, 0)), a.hasColors && c.vertexColors !== THREE.NoColors && (ia.bindBuffer(ia.ARRAY_BUFFER, d.color), ia.bufferData(ia.ARRAY_BUFFER, a.colorArray, ia.DYNAMIC_DRAW), la.enableAttribute(b.color), ia.vertexAttribPointer(b.color, 3, ia.FLOAT, !1, 0, 0)), la.disableUnusedAttributes(), ia.drawArrays(ia.TRIANGLES, 0, a.count), a.count = 0
        }, this.renderBufferDirect = function(a, b, c, d, e, f) {
            o(d);
            var g = p(a, b, d, e),
                i = !1;
            if (a = c.id + "_" + g.id + "_" + d.wireframe, a !== N && (N = a, i = !0), b = e.morphTargetInfluences, void 0 !== b) {
                a = [];
                for (var j = 0, i = b.length; i > j; j++) {
                    var k = b[j];
                    a.push([k, j])
                }
                a.sort(h), 8 < a.length && (a.length = 8);
                for (var l = c.morphAttributes, j = 0, i = a.length; i > j; j++) k = a[j], F[j] = k[0], 0 !== k[0] ? (b = k[1], !0 === d.morphTargets && l.position && c.addAttribute("morphTarget" + j, l.position[b]), !0 === d.morphNormals && l.normal && c.addAttribute("morphNormal" + j, l.normal[b])) : (!0 === d.morphTargets && c.removeAttribute("morphTarget" + j), !0 === d.morphNormals && c.removeAttribute("morphNormal" + j));
                g.getUniforms().setValue(ia, "morphTargetInfluences", F), i = !0
            }
            if (b = c.index, j = c.attributes.position, !0 === d.wireframe && (b = oa.getWireframeAttribute(c)), null !== b ? (a = sa, a.setIndex(b)) : a = ra, i) {
                var m, i = void 0;
                if (c instanceof THREE.InstancedBufferGeometry && (m = ja.get("ANGLE_instanced_arrays"), null === m)) console.error("THREE.WebGLRenderer.setupVertexAttributes: using THREE.InstancedBufferGeometry but hardware does not support extension ANGLE_instanced_arrays.");
                else {
                    void 0 === i && (i = 0), la.initAttributes();
                    var n, k = c.attributes,
                        g = g.getAttributes(),
                        l = d.defaultAttributeValues;
                    for (n in g) {
                        var q = g[n];
                        if (q >= 0) {
                            var r = k[n];
                            if (void 0 !== r) {
                                var s = ia.FLOAT,
                                    t = r.array,
                                    u = r.normalized;
                                t instanceof Float32Array ? s = ia.FLOAT : t instanceof Float64Array ? console.warn("Unsupported data buffer format: Float64Array") : t instanceof Uint16Array ? s = ia.UNSIGNED_SHORT : t instanceof Int16Array ? s = ia.SHORT : t instanceof Uint32Array ? s = ia.UNSIGNED_INT : t instanceof Int32Array ? s = ia.INT : t instanceof Int8Array ? s = ia.BYTE : t instanceof Uint8Array && (s = ia.UNSIGNED_BYTE);
                                var t = r.itemSize,
                                    v = oa.getAttributeBuffer(r);
                                if (r instanceof THREE.InterleavedBufferAttribute) {
                                    var w = r.data,
                                        x = w.stride,
                                        r = r.offset;
                                    w instanceof THREE.InstancedInterleavedBuffer ? (la.enableAttributeAndDivisor(q, w.meshPerAttribute, m), void 0 === c.maxInstancedCount && (c.maxInstancedCount = w.meshPerAttribute * w.count)) : la.enableAttribute(q), ia.bindBuffer(ia.ARRAY_BUFFER, v), ia.vertexAttribPointer(q, t, s, u, x * w.array.BYTES_PER_ELEMENT, (i * x + r) * w.array.BYTES_PER_ELEMENT)
                                } else r instanceof THREE.InstancedBufferAttribute ? (la.enableAttributeAndDivisor(q, r.meshPerAttribute, m), void 0 === c.maxInstancedCount && (c.maxInstancedCount = r.meshPerAttribute * r.count)) : la.enableAttribute(q), ia.bindBuffer(ia.ARRAY_BUFFER, v), ia.vertexAttribPointer(q, t, s, u, 0, i * t * r.array.BYTES_PER_ELEMENT)
                            } else if (void 0 !== l && (s = l[n], void 0 !== s)) switch (s.length) {
                                case 2:
                                    ia.vertexAttrib2fv(q, s);
                                    break;
                                case 3:
                                    ia.vertexAttrib3fv(q, s);
                                    break;
                                case 4:
                                    ia.vertexAttrib4fv(q, s);
                                    break;
                                default:
                                    ia.vertexAttrib1fv(q, s)
                            }
                        }
                    }
                    la.disableUnusedAttributes()
                }
                null !== b && ia.bindBuffer(ia.ELEMENT_ARRAY_BUFFER, oa.getAttributeBuffer(b))
            }
            if (m = 1 / 0, null !== b ? m = b.count : void 0 !== j && (m = j.count), n = c.drawRange.start, b = c.drawRange.count, j = null !== f ? f.start : 0, i = null !== f ? f.count : 1 / 0, f = Math.max(0, n, j), m = Math.min(0 + m, n + b, j + i) - 1, m = Math.max(0, m - f + 1), e instanceof THREE.Mesh)
                if (!0 === d.wireframe) la.setLineWidth(d.wireframeLinewidth * (null === K ? X : 1)), a.setMode(ia.LINES);
                else switch (e.drawMode) {
                    case THREE.TrianglesDrawMode:
                        a.setMode(ia.TRIANGLES);
                        break;
                    case THREE.TriangleStripDrawMode:
                        a.setMode(ia.TRIANGLE_STRIP);
                        break;
                    case THREE.TriangleFanDrawMode:
                        a.setMode(ia.TRIANGLE_FAN)
                } else e instanceof THREE.Line ? (d = d.linewidth, void 0 === d && (d = 1), la.setLineWidth(d * (null === K ? X : 1)), e instanceof THREE.LineSegments ? a.setMode(ia.LINES) : a.setMode(ia.LINE_STRIP)) : e instanceof THREE.Points && a.setMode(ia.POINTS);
            c instanceof THREE.InstancedBufferGeometry ? 0 < c.maxInstancedCount && a.renderInstances(c, f, m) : a.render(f, m)
        }, this.render = function(a, c, d, e) {
            if (!1 == c instanceof THREE.Camera) console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");
            else {
                var f = a.fog;
                N = "", M = -1, O = null, !0 === a.autoUpdate && a.updateMatrixWorld(), null === c.parent && c.updateMatrixWorld(), c.matrixWorldInverse.getInverse(c.matrixWorld), ea.multiplyMatrices(c.projectionMatrix, c.matrixWorldInverse), _.setFromMatrix(ea), A.length = 0, E = C = -1, G.length = 0, H.length = 0, ca = this.localClippingEnabled, ba = aa.init(this.clippingPlanes, ca, c), m(a, c), B.length = C + 1, D.length = E + 1, !0 === I.sortObjects && (B.sort(i), D.sort(j)), ba && aa.beginShadows();
                for (var g = A, h = 0, k = 0, l = g.length; l > k; k++) {
                    var o = g[k];
                    o.castShadow && (ga.shadows[h++] = o)
                }
                ga.shadows.length = h, xa.render(a, c);
                for (var p, q, r, s, g = A, t = o = 0, u = 0, v = c.matrixWorldInverse, w = 0, x = 0, y = 0, z = 0, h = 0, k = g.length; k > h; h++)
                    if (l = g[h], p = l.color, q = l.intensity, r = l.distance, s = l.shadow && l.shadow.map ? l.shadow.map.texture : null, l instanceof THREE.AmbientLight) o += p.r * q, t += p.g * q, u += p.b * q;
                    else if (l instanceof THREE.DirectionalLight) {
                    var F = qa.get(l);
                    F.color.copy(l.color).multiplyScalar(l.intensity), F.direction.setFromMatrixPosition(l.matrixWorld), fa.setFromMatrixPosition(l.target.matrixWorld), F.direction.sub(fa), F.direction.transformDirection(v), (F.shadow = l.castShadow) && (F.shadowBias = l.shadow.bias, F.shadowRadius = l.shadow.radius, F.shadowMapSize = l.shadow.mapSize), ga.directionalShadowMap[w] = s, ga.directionalShadowMatrix[w] = l.shadow.matrix, ga.directional[w++] = F
                } else l instanceof THREE.SpotLight ? (F = qa.get(l), F.position.setFromMatrixPosition(l.matrixWorld), F.position.applyMatrix4(v), F.color.copy(p).multiplyScalar(q), F.distance = r, F.direction.setFromMatrixPosition(l.matrixWorld), fa.setFromMatrixPosition(l.target.matrixWorld), F.direction.sub(fa), F.direction.transformDirection(v), F.coneCos = Math.cos(l.angle), F.penumbraCos = Math.cos(l.angle * (1 - l.penumbra)), F.decay = 0 === l.distance ? 0 : l.decay, (F.shadow = l.castShadow) && (F.shadowBias = l.shadow.bias, F.shadowRadius = l.shadow.radius, F.shadowMapSize = l.shadow.mapSize), ga.spotShadowMap[y] = s, ga.spotShadowMatrix[y] = l.shadow.matrix, ga.spot[y++] = F) : l instanceof THREE.PointLight ? (F = qa.get(l), F.position.setFromMatrixPosition(l.matrixWorld), F.position.applyMatrix4(v), F.color.copy(l.color).multiplyScalar(l.intensity), F.distance = l.distance, F.decay = 0 === l.distance ? 0 : l.decay, (F.shadow = l.castShadow) && (F.shadowBias = l.shadow.bias, F.shadowRadius = l.shadow.radius, F.shadowMapSize = l.shadow.mapSize), ga.pointShadowMap[x] = s, void 0 === ga.pointShadowMatrix[x] && (ga.pointShadowMatrix[x] = new THREE.Matrix4), fa.setFromMatrixPosition(l.matrixWorld).negate(), ga.pointShadowMatrix[x].identity().setPosition(fa), ga.point[x++] = F) : l instanceof THREE.HemisphereLight && (F = qa.get(l), F.direction.setFromMatrixPosition(l.matrixWorld), F.direction.transformDirection(v), F.direction.normalize(), F.skyColor.copy(l.color).multiplyScalar(q), F.groundColor.copy(l.groundColor).multiplyScalar(q), ga.hemi[z++] = F);
                ga.ambient[0] = o, ga.ambient[1] = t, ga.ambient[2] = u, ga.directional.length = w, ga.spot.length = y, ga.point.length = x, ga.hemi.length = z, ga.hash = w + "," + x + "," + y + "," + z + "," + ga.shadows.length, ba && aa.endShadows(), ha.calls = 0, ha.vertices = 0, ha.faces = 0, ha.points = 0, void 0 === d && (d = null), this.setRenderTarget(d), g = a.background, null === g ? b(T.r, T.g, T.b, U) : g instanceof THREE.Color && b(g.r, g.g, g.b, 1), (this.autoClear || e) && this.clear(this.autoClearColor, this.autoClearDepth, this.autoClearStencil), g instanceof THREE.CubeTexture ? (ua.projectionMatrix.copy(c.projectionMatrix), ua.matrixWorld.extractRotation(c.matrixWorld), ua.matrixWorldInverse.getInverse(ua.matrixWorld), wa.material.uniforms.tCube.value = g, wa.modelViewMatrix.multiplyMatrices(ua.matrixWorldInverse, wa.matrixWorld), oa.update(wa), I.renderBufferDirect(ua, null, wa.geometry, wa.material, wa, null)) : g instanceof THREE.Texture && (va.material.map = g, oa.update(va), I.renderBufferDirect(ta, null, va.geometry, va.material, va, null)), a.overrideMaterial ? (e = a.overrideMaterial, n(B, c, f, e), n(D, c, f, e)) : (la.setBlending(THREE.NoBlending), n(B, c, f), n(D, c, f)), ya.render(a, c), za.render(a, c, R), d && na.updateRenderTargetMipmap(d), la.setDepthTest(!0), la.setDepthWrite(!0), la.setColorWrite(!0)
            }
        }, this.setFaceCulling = function(a, b) {
            la.setCullFace(a), la.setFlipSided(b === THREE.FrontFaceDirectionCW)
        }, this.allocTextureUnit = function() {
            var a = S;
            return a >= ka.maxTextures && console.warn("WebGLRenderer: trying to use " + a + " texture units while this GPU supports only " + ka.maxTextures), S += 1, a
        }, this.setTexture2D = function() {
            var a = !1;
            return function(b, c) {
                b instanceof THREE.WebGLRenderTarget && (a || (console.warn("THREE.WebGLRenderer.setTexture2D: don't use render targets as textures. Use their .texture property instead."), a = !0), b = b.texture), na.setTexture2D(b, c)
            }
        }(), this.setTexture = function() {
            var a = !1;
            return function(b, c) {
                a || (console.warn("THREE.WebGLRenderer: .setTexture is deprecated, use setTexture2D instead."), a = !0), na.setTexture2D(b, c)
            }
        }(), this.setTextureCube = function() {
            var a = !1;
            return function(b, c) {
                b instanceof THREE.WebGLRenderTargetCube && (a || (console.warn("THREE.WebGLRenderer.setTextureCube: don't use cube render targets as textures. Use their .texture property instead."), a = !0), b = b.texture), b instanceof THREE.CubeTexture || Array.isArray(b.image) && 6 === b.image.length ? na.setTextureCube(b, c) : na.setTextureCubeDynamic(b, c)
            }
        }(), this.getCurrentRenderTarget = function() {
            return K
        }, this.setRenderTarget = function(a) {
            (K = a) && void 0 === ma.get(a).__webglFramebuffer && na.setupRenderTarget(a);
            var b, c = a instanceof THREE.WebGLRenderTargetCube;
            a ? (b = ma.get(a), b = c ? b.__webglFramebuffer[a.activeCubeFace] : b.__webglFramebuffer, P.copy(a.scissor), Q = a.scissorTest, R.copy(a.viewport)) : (b = null, P.copy(Y).multiplyScalar(X), Q = Z, R.copy($).multiplyScalar(X)), L !== b && (ia.bindFramebuffer(ia.FRAMEBUFFER, b), L = b), la.scissor(P), la.setScissorTest(Q), la.viewport(R), c && (c = ma.get(a.texture), ia.framebufferTexture2D(ia.FRAMEBUFFER, ia.COLOR_ATTACHMENT0, ia.TEXTURE_CUBE_MAP_POSITIVE_X + a.activeCubeFace, c.__webglTexture, a.activeMipMapLevel))
        }, this.readRenderTargetPixels = function(a, b, c, d, e, f) {
            if (!1 == a instanceof THREE.WebGLRenderTarget) console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");
            else {
                var g = ma.get(a).__webglFramebuffer;
                if (g) {
                    var h = !1;
                    g !== L && (ia.bindFramebuffer(ia.FRAMEBUFFER, g), h = !0);
                    try {
                        var i = a.texture;
                        i.format !== THREE.RGBAFormat && r(i.format) !== ia.getParameter(ia.IMPLEMENTATION_COLOR_READ_FORMAT) ? console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.") : i.type === THREE.UnsignedByteType || r(i.type) === ia.getParameter(ia.IMPLEMENTATION_COLOR_READ_TYPE) || i.type === THREE.FloatType && ja.get("WEBGL_color_buffer_float") || i.type === THREE.HalfFloatType && ja.get("EXT_color_buffer_half_float") ? ia.checkFramebufferStatus(ia.FRAMEBUFFER) === ia.FRAMEBUFFER_COMPLETE ? b >= 0 && b <= a.width - d && c >= 0 && c <= a.height - e && ia.readPixels(b, c, d, e, r(i.format), r(i.type), f) : console.error("THREE.WebGLRenderer.readRenderTargetPixels: readPixels from renderTarget failed. Framebuffer not complete.") : console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.")
                    } finally {
                        h && ia.bindFramebuffer(ia.FRAMEBUFFER, L)
                    }
                }
            }
        }
    }, THREE.WebGLRenderTarget = function(a, b, c) {
        this.uuid = THREE.Math.generateUUID(), this.width = a, this.height = b, this.scissor = new THREE.Vector4(0, 0, a, b), this.scissorTest = !1, this.viewport = new THREE.Vector4(0, 0, a, b), c = c || {}, void 0 === c.minFilter && (c.minFilter = THREE.LinearFilter), this.texture = new THREE.Texture(void 0, void 0, c.wrapS, c.wrapT, c.magFilter, c.minFilter, c.format, c.type, c.anisotropy, c.encoding), this.depthBuffer = void 0 !== c.depthBuffer ? c.depthBuffer : !0, this.stencilBuffer = void 0 !== c.stencilBuffer ? c.stencilBuffer : !0, this.depthTexture = null
    }, Object.assign(THREE.WebGLRenderTarget.prototype, THREE.EventDispatcher.prototype, {
        setSize: function(a, b) {
            (this.width !== a || this.height !== b) && (this.width = a, this.height = b, this.dispose()), this.viewport.set(0, 0, a, b), this.scissor.set(0, 0, a, b)
        },
        clone: function() {
            return (new this.constructor).copy(this)
        },
        copy: function(a) {
            return this.width = a.width, this.height = a.height, this.viewport.copy(a.viewport), this.texture = a.texture.clone(), this.depthBuffer = a.depthBuffer, this.stencilBuffer = a.stencilBuffer, this.depthTexture = a.depthTexture, this
        },
        dispose: function() {
            this.dispatchEvent({
                type: "dispose"
            })
        }
    }), THREE.WebGLRenderTargetCube = function(a, b, c) {
        THREE.WebGLRenderTarget.call(this, a, b, c), this.activeMipMapLevel = this.activeCubeFace = 0
    }, THREE.WebGLRenderTargetCube.prototype = Object.create(THREE.WebGLRenderTarget.prototype), THREE.WebGLRenderTargetCube.prototype.constructor = THREE.WebGLRenderTargetCube, THREE.WebGLBufferRenderer = function(a, b, c) {
        var d;
        this.setMode = function(a) {
            d = a
        }, this.render = function(b, e) {
            a.drawArrays(d, b, e), c.calls++, c.vertices += e, d === a.TRIANGLES && (c.faces += e / 3)
        }, this.renderInstances = function(e) {
            var f = b.get("ANGLE_instanced_arrays");
            if (null === f) console.error("THREE.WebGLBufferRenderer: using THREE.InstancedBufferGeometry but hardware does not support extension ANGLE_instanced_arrays.");
            else {
                var g = e.attributes.position,
                    h = 0,
                    h = g instanceof THREE.InterleavedBufferAttribute ? g.data.count : g.count;
                f.drawArraysInstancedANGLE(d, 0, h, e.maxInstancedCount), c.calls++, c.vertices += h * e.maxInstancedCount, d === a.TRIANGLES && (c.faces += e.maxInstancedCount * h / 3)
            }
        }
    }, THREE.WebGLClipping = function() {
        function a() {
            j.value !== d && (j.value = d, j.needsUpdate = e > 0), c.numPlanes = e
        }

        function b(a, b, d, e) {
            var f = null !== a ? a.length : 0,
                g = null;
            if (0 !== f) {
                if (g = j.value, !0 !== e || null === g)
                    for (e = d + 4 * f, b = b.matrixWorldInverse, i.getNormalMatrix(b), (null === g || g.length < e) && (g = new Float32Array(e)), e = 0; e !== f; ++e, d += 4) h.copy(a[e]).applyMatrix4(b, i), h.normal.toArray(g, d), g[d + 3] = h.constant;
                j.value = g, j.needsUpdate = !0
            }
            return c.numPlanes = f, g
        }
        var c = this,
            d = null,
            e = 0,
            f = !1,
            g = !1,
            h = new THREE.Plane,
            i = new THREE.Matrix3,
            j = {
                value: null,
                needsUpdate: !1
            };
        this.uniform = j, this.numPlanes = 0, this.init = function(a, c, g) {
            var h = 0 !== a.length || c || 0 !== e || f;
            return f = c, d = b(a, g, 0), e = a.length, h
        }, this.beginShadows = function() {
            g = !0, b(null)
        }, this.endShadows = function() {
            g = !1, a()
        }, this.setState = function(c, h, i, k, l) {
            if (!f || null === c || 0 === c.length || g && !h) g ? b(null) : a();
            else {
                h = g ? 0 : e;
                var m = 4 * h,
                    n = k.clippingState || null;
                for (j.value = n, n = b(c, i, m, l), c = 0; c !== m; ++c) n[c] = d[c];
                k.clippingState = n, this.numPlanes += h
            }
        }
    }, THREE.WebGLIndexedBufferRenderer = function(a, b, c) {
        var d, e, f;
        this.setMode = function(a) {
            d = a
        }, this.setIndex = function(c) {
            c.array instanceof Uint32Array && b.get("OES_element_index_uint") ? (e = a.UNSIGNED_INT, f = 4) : (e = a.UNSIGNED_SHORT, f = 2)
        }, this.render = function(b, g) {
            a.drawElements(d, g, e, b * f), c.calls++, c.vertices += g, d === a.TRIANGLES && (c.faces += g / 3)
        }, this.renderInstances = function(g, h, i) {
            var j = b.get("ANGLE_instanced_arrays");
            null === j ? console.error("THREE.WebGLBufferRenderer: using THREE.InstancedBufferGeometry but hardware does not support extension ANGLE_instanced_arrays.") : (j.drawElementsInstancedANGLE(d, i, e, h * f, g.maxInstancedCount), c.calls++, c.vertices += i * g.maxInstancedCount, d === a.TRIANGLES && (c.faces += g.maxInstancedCount * i / 3))
        }
    }, THREE.WebGLExtensions = function(a) {
        var b = {};
        this.get = function(c) {
            if (void 0 !== b[c]) return b[c];
            var d;
            switch (c) {
                case "WEBGL_depth_texture":
                    d = a.getExtension("WEBGL_depth_texture") || a.getExtension("MOZ_WEBGL_depth_texture") || a.getExtension("WEBKIT_WEBGL_depth_texture");
                    break;
                case "EXT_texture_filter_anisotropic":
                    d = a.getExtension("EXT_texture_filter_anisotropic") || a.getExtension("MOZ_EXT_texture_filter_anisotropic") || a.getExtension("WEBKIT_EXT_texture_filter_anisotropic");
                    break;
                case "WEBGL_compressed_texture_s3tc":
                    d = a.getExtension("WEBGL_compressed_texture_s3tc") || a.getExtension("MOZ_WEBGL_compressed_texture_s3tc") || a.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");
                    break;
                case "WEBGL_compressed_texture_pvrtc":
                    d = a.getExtension("WEBGL_compressed_texture_pvrtc") || a.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");
                    break;
                case "WEBGL_compressed_texture_etc1":
                    d = a.getExtension("WEBGL_compressed_texture_etc1");
                    break;
                default:
                    d = a.getExtension(c)
            }
            return null === d && console.warn("THREE.WebGLRenderer: " + c + " extension not supported."), b[c] = d
        }
    }, THREE.WebGLCapabilities = function(a, b, c) {
        function d(b) {
            if ("highp" === b) {
                if (0 < a.getShaderPrecisionFormat(a.VERTEX_SHADER, a.HIGH_FLOAT).precision && 0 < a.getShaderPrecisionFormat(a.FRAGMENT_SHADER, a.HIGH_FLOAT).precision) return "highp";
                b = "mediump"
            }
            return "mediump" === b && 0 < a.getShaderPrecisionFormat(a.VERTEX_SHADER, a.MEDIUM_FLOAT).precision && 0 < a.getShaderPrecisionFormat(a.FRAGMENT_SHADER, a.MEDIUM_FLOAT).precision ? "mediump" : "lowp"
        }
        var e;
        this.getMaxAnisotropy = function() {
            if (void 0 !== e) return e;
            var c = b.get("EXT_texture_filter_anisotropic");
            return e = null !== c ? a.getParameter(c.MAX_TEXTURE_MAX_ANISOTROPY_EXT) : 0
        }, this.getMaxPrecision = d, this.precision = void 0 !== c.precision ? c.precision : "highp", this.logarithmicDepthBuffer = void 0 !== c.logarithmicDepthBuffer ? c.logarithmicDepthBuffer : !1, this.maxTextures = a.getParameter(a.MAX_TEXTURE_IMAGE_UNITS), this.maxVertexTextures = a.getParameter(a.MAX_VERTEX_TEXTURE_IMAGE_UNITS), this.maxTextureSize = a.getParameter(a.MAX_TEXTURE_SIZE), this.maxCubemapSize = a.getParameter(a.MAX_CUBE_MAP_TEXTURE_SIZE), this.maxAttributes = a.getParameter(a.MAX_VERTEX_ATTRIBS), this.maxVertexUniforms = a.getParameter(a.MAX_VERTEX_UNIFORM_VECTORS), this.maxVaryings = a.getParameter(a.MAX_VARYING_VECTORS), this.maxFragmentUniforms = a.getParameter(a.MAX_FRAGMENT_UNIFORM_VECTORS), this.vertexTextures = 0 < this.maxVertexTextures, this.floatFragmentTextures = !!b.get("OES_texture_float"), this.floatVertexTextures = this.vertexTextures && this.floatFragmentTextures, c = d(this.precision), c !== this.precision && (console.warn("THREE.WebGLRenderer:", this.precision, "not supported, using", c, "instead."), this.precision = c), this.logarithmicDepthBuffer && (this.logarithmicDepthBuffer = !!b.get("EXT_frag_depth"))
    }, THREE.WebGLGeometries = function(a, b, c) {
        function d(a) {
            var g = a.target;
            a = f[g.id], null !== a.index && e(a.index);
            var h, i = a.attributes;
            for (h in i) e(i[h]);
            g.removeEventListener("dispose", d), delete f[g.id], h = b.get(g), h.wireframe && e(h.wireframe), b.delete(g), g = b.get(a), g.wireframe && e(g.wireframe), b.delete(a), c.memory.geometries--
        }

        function e(c) {
            var d;
            d = c instanceof THREE.InterleavedBufferAttribute ? b.get(c.data).__webglBuffer : b.get(c).__webglBuffer, void 0 !== d && (a.deleteBuffer(d), c instanceof THREE.InterleavedBufferAttribute ? b.delete(c.data) : b.delete(c))
        }
        var f = {};
        this.get = function(a) {
            var b = a.geometry;
            if (void 0 !== f[b.id]) return f[b.id];
            b.addEventListener("dispose", d);
            var e;
            return b instanceof THREE.BufferGeometry ? e = b : b instanceof THREE.Geometry && (void 0 === b._bufferGeometry && (b._bufferGeometry = (new THREE.BufferGeometry).setFromObject(a)), e = b._bufferGeometry), f[b.id] = e, c.memory.geometries++, e
        }
    }, THREE.WebGLLights = function() {
        var a = {};
        this.get = function(b) {
            if (void 0 !== a[b.id]) return a[b.id];
            var c;
            switch (b.type) {
                case "DirectionalLight":
                    c = {
                        direction: new THREE.Vector3,
                        color: new THREE.Color,
                        shadow: !1,
                        shadowBias: 0,
                        shadowRadius: 1,
                        shadowMapSize: new THREE.Vector2
                    };
                    break;
                case "SpotLight":
                    c = {
                        position: new THREE.Vector3,
                        direction: new THREE.Vector3,
                        color: new THREE.Color,
                        distance: 0,
                        coneCos: 0,
                        penumbraCos: 0,
                        decay: 0,
                        shadow: !1,
                        shadowBias: 0,
                        shadowRadius: 1,
                        shadowMapSize: new THREE.Vector2
                    };
                    break;
                case "PointLight":
                    c = {
                        position: new THREE.Vector3,
                        color: new THREE.Color,
                        distance: 0,
                        decay: 0,
                        shadow: !1,
                        shadowBias: 0,
                        shadowRadius: 1,
                        shadowMapSize: new THREE.Vector2
                    };
                    break;
                case "HemisphereLight":
                    c = {
                        direction: new THREE.Vector3,
                        skyColor: new THREE.Color,
                        groundColor: new THREE.Color
                    }
            }
            return a[b.id] = c
        }
    }, THREE.WebGLObjects = function(a, b, c) {
        function d(c, d) {
            var e = c instanceof THREE.InterleavedBufferAttribute ? c.data : c,
                f = b.get(e);
            void 0 === f.__webglBuffer ? (f.__webglBuffer = a.createBuffer(), a.bindBuffer(d, f.__webglBuffer), a.bufferData(d, e.array, e.dynamic ? a.DYNAMIC_DRAW : a.STATIC_DRAW), f.version = e.version) : f.version !== e.version && (a.bindBuffer(d, f.__webglBuffer), !1 === e.dynamic || -1 === e.updateRange.count ? a.bufferSubData(d, 0, e.array) : 0 === e.updateRange.count ? console.error("THREE.WebGLObjects.updateBuffer: dynamic THREE.BufferAttribute marked as needsUpdate but updateRange.count is 0, ensure you are using set methods or updating manually.") : (a.bufferSubData(d, e.updateRange.offset * e.array.BYTES_PER_ELEMENT, e.array.subarray(e.updateRange.offset, e.updateRange.offset + e.updateRange.count)), e.updateRange.count = 0), f.version = e.version)
        }

        function e(a, b, c) {
            if (b > c) {
                var d = b;
                b = c, c = d
            }
            return d = a[b], void 0 === d ? (a[b] = [c], !0) : -1 === d.indexOf(c) ? (d.push(c), !0) : !1
        }
        var f = new THREE.WebGLGeometries(a, b, c);
        this.getAttributeBuffer = function(a) {
            return a instanceof THREE.InterleavedBufferAttribute ? b.get(a.data).__webglBuffer : b.get(a).__webglBuffer
        }, this.getWireframeAttribute = function(c) {
            var f = b.get(c);
            if (void 0 !== f.wireframe) return f.wireframe;
            var g = [],
                h = c.index,
                i = c.attributes;
            if (c = i.position, null !== h)
                for (var i = {}, h = h.array, j = 0, k = h.length; k > j; j += 3) {
                    var l = h[j + 0],
                        m = h[j + 1],
                        n = h[j + 2];
                    e(i, l, m) && g.push(l, m), e(i, m, n) && g.push(m, n), e(i, n, l) && g.push(n, l)
                } else
                    for (h = i.position.array, j = 0, k = h.length / 3 - 1; k > j; j += 3) l = j + 0, m = j + 1, n = j + 2, g.push(l, m, m, n, n, l);
            return g = new THREE.BufferAttribute(new(65535 < c.count ? Uint32Array : Uint16Array)(g), 1), d(g, a.ELEMENT_ARRAY_BUFFER), f.wireframe = g
        }, this.update = function(b) {
            var c = f.get(b);
            b.geometry instanceof THREE.Geometry && c.updateFromObject(b), b = c.index;
            var e = c.attributes;
            null !== b && d(b, a.ELEMENT_ARRAY_BUFFER);
            for (var g in e) d(e[g], a.ARRAY_BUFFER);
            b = c.morphAttributes;
            for (g in b)
                for (var e = b[g], h = 0, i = e.length; i > h; h++) d(e[h], a.ARRAY_BUFFER);
            return c
        }
    }, THREE.WebGLProgram = function() {
        function a(a) {
            switch (a) {
                case THREE.LinearEncoding:
                    return ["Linear", "( value )"];
                case THREE.sRGBEncoding:
                    return ["sRGB", "( value )"];
                case THREE.RGBEEncoding:
                    return ["RGBE", "( value )"];
                case THREE.RGBM7Encoding:
                    return ["RGBM", "( value, 7.0 )"];
                case THREE.RGBM16Encoding:
                    return ["RGBM", "( value, 16.0 )"];
                case THREE.RGBDEncoding:
                    return ["RGBD", "( value, 256.0 )"];
                case THREE.GammaEncoding:
                    return ["Gamma", "( value, float( GAMMA_FACTOR ) )"];
                default:
                    throw Error("unsupported encoding: " + a)
            }
        }

        function b(b, c) {
            var d = a(c);
            return "vec4 " + b + "( vec4 value ) { return " + d[0] + "ToLinear" + d[1] + "; }"
        }

        function c(b, c) {
            var d = a(c);
            return "vec4 " + b + "( vec4 value ) { return LinearTo" + d[0] + d[1] + "; }"
        }

        function d(a, b) {
            var c;
            switch (b) {
                case THREE.LinearToneMapping:
                    c = "Linear";
                    break;
                case THREE.ReinhardToneMapping:
                    c = "Reinhard";
                    break;
                case THREE.Uncharted2ToneMapping:
                    c = "Uncharted2";
                    break;
                case THREE.CineonToneMapping:
                    c = "OptimizedCineon";
                    break;
                default:
                    throw Error("unsupported toneMapping: " + b)
            }
            return "vec3 " + a + "( vec3 color ) { return " + c + "ToneMapping( color ); }"
        }

        function e(a, b, c) {
            return a = a || {}, [a.derivatives || b.envMapCubeUV || b.bumpMap || b.normalMap || b.flatShading ? "#extension GL_OES_standard_derivatives : enable" : "", (a.fragDepth || b.logarithmicDepthBuffer) && c.get("EXT_frag_depth") ? "#extension GL_EXT_frag_depth : enable" : "", a.drawBuffers && c.get("WEBGL_draw_buffers") ? "#extension GL_EXT_draw_buffers : require" : "", (a.shaderTextureLOD || b.envMap) && c.get("EXT_shader_texture_lod") ? "#extension GL_EXT_shader_texture_lod : enable" : ""].filter(g).join("\n")
        }

        function f(a) {
            var b, c = [];
            for (b in a) {
                var d = a[b];
                !1 !== d && c.push("#define " + b + " " + d)
            }
            return c.join("\n")
        }

        function g(a) {
            return "" !== a
        }

        function h(a, b) {
            return a.replace(/NUM_DIR_LIGHTS/g, b.numDirLights).replace(/NUM_SPOT_LIGHTS/g, b.numSpotLights).replace(/NUM_POINT_LIGHTS/g, b.numPointLights).replace(/NUM_HEMI_LIGHTS/g, b.numHemiLights)
        }

        function i(a) {
            return a.replace(/#include +<([\w\d.]+)>/g, function(a, b) {
                var c = THREE.ShaderChunk[b];
                if (void 0 === c) throw Error("Can not resolve #include <" + b + ">");
                return i(c)
            })
        }

        function j(a) {
            return a.replace(/for \( int i \= (\d+)\; i < (\d+)\; i \+\+ \) \{([\s\S]+?)(?=\})\}/g, function(a, b, c, d) {
                for (a = "", b = parseInt(b); b < parseInt(c); b++) a += d.replace(/\[ i \]/g, "[ " + b + " ]");
                return a
            })
        }
        var k = 0;
        return function(a, l, m, n) {
            var o = a.context,
                p = m.extensions,
                q = m.defines,
                r = m.__webglShader.vertexShader,
                s = m.__webglShader.fragmentShader,
                t = "SHADOWMAP_TYPE_BASIC";
            n.shadowMapType === THREE.PCFShadowMap ? t = "SHADOWMAP_TYPE_PCF" : n.shadowMapType === THREE.PCFSoftShadowMap && (t = "SHADOWMAP_TYPE_PCF_SOFT");
            var u = "ENVMAP_TYPE_CUBE",
                v = "ENVMAP_MODE_REFLECTION",
                w = "ENVMAP_BLENDING_MULTIPLY";
            if (n.envMap) {
                switch (m.envMap.mapping) {
                    case THREE.CubeReflectionMapping:
                    case THREE.CubeRefractionMapping:
                        u = "ENVMAP_TYPE_CUBE";
                        break;
                    case THREE.CubeUVReflectionMapping:
                    case THREE.CubeUVRefractionMapping:
                        u = "ENVMAP_TYPE_CUBE_UV";
                        break;
                    case THREE.EquirectangularReflectionMapping:
                    case THREE.EquirectangularRefractionMapping:
                        u = "ENVMAP_TYPE_EQUIREC";
                        break;
                    case THREE.SphericalReflectionMapping:
                        u = "ENVMAP_TYPE_SPHERE"
                }
                switch (m.envMap.mapping) {
                    case THREE.CubeRefractionMapping:
                    case THREE.EquirectangularRefractionMapping:
                        v = "ENVMAP_MODE_REFRACTION"
                }
                switch (m.combine) {
                    case THREE.MultiplyOperation:
                        w = "ENVMAP_BLENDING_MULTIPLY";
                        break;
                    case THREE.MixOperation:
                        w = "ENVMAP_BLENDING_MIX";
                        break;
                    case THREE.AddOperation:
                        w = "ENVMAP_BLENDING_ADD"
                }
            }
            var x = 0 < a.gammaFactor ? a.gammaFactor : 1,
                p = e(p, n, a.extensions),
                y = f(q),
                z = o.createProgram();
            m instanceof THREE.RawShaderMaterial ? (q = [y].filter(g).join("\n"), t = [y].filter(g).join("\n")) : (q = ["precision " + n.precision + " float;", "precision " + n.precision + " int;", "#define SHADER_NAME " + m.__webglShader.name, y, n.supportsVertexTextures ? "#define VERTEX_TEXTURES" : "", "#define GAMMA_FACTOR " + x, "#define MAX_BONES " + n.maxBones, n.map ? "#define USE_MAP" : "", n.envMap ? "#define USE_ENVMAP" : "", n.envMap ? "#define " + v : "", n.lightMap ? "#define USE_LIGHTMAP" : "", n.aoMap ? "#define USE_AOMAP" : "", n.emissiveMap ? "#define USE_EMISSIVEMAP" : "", n.bumpMap ? "#define USE_BUMPMAP" : "", n.normalMap ? "#define USE_NORMALMAP" : "", n.displacementMap && n.supportsVertexTextures ? "#define USE_DISPLACEMENTMAP" : "", n.specularMap ? "#define USE_SPECULARMAP" : "", n.roughnessMap ? "#define USE_ROUGHNESSMAP" : "", n.metalnessMap ? "#define USE_METALNESSMAP" : "", n.alphaMap ? "#define USE_ALPHAMAP" : "", n.vertexColors ? "#define USE_COLOR" : "", n.flatShading ? "#define FLAT_SHADED" : "", n.skinning ? "#define USE_SKINNING" : "", n.useVertexTexture ? "#define BONE_TEXTURE" : "", n.morphTargets ? "#define USE_MORPHTARGETS" : "", n.morphNormals && !1 === n.flatShading ? "#define USE_MORPHNORMALS" : "", n.doubleSided ? "#define DOUBLE_SIDED" : "", n.flipSided ? "#define FLIP_SIDED" : "", "#define NUM_CLIPPING_PLANES " + n.numClippingPlanes, n.shadowMapEnabled ? "#define USE_SHADOWMAP" : "", n.shadowMapEnabled ? "#define " + t : "", n.sizeAttenuation ? "#define USE_SIZEATTENUATION" : "", n.logarithmicDepthBuffer ? "#define USE_LOGDEPTHBUF" : "", n.logarithmicDepthBuffer && a.extensions.get("EXT_frag_depth") ? "#define USE_LOGDEPTHBUF_EXT" : "", "uniform mat4 modelMatrix;", "uniform mat4 modelViewMatrix;", "uniform mat4 projectionMatrix;", "uniform mat4 viewMatrix;", "uniform mat3 normalMatrix;", "uniform vec3 cameraPosition;", "attribute vec3 position;", "attribute vec3 normal;", "attribute vec2 uv;", "#ifdef USE_COLOR", "	attribute vec3 color;", "#endif", "#ifdef USE_MORPHTARGETS", "	attribute vec3 morphTarget0;", "	attribute vec3 morphTarget1;", "	attribute vec3 morphTarget2;", "	attribute vec3 morphTarget3;", "	#ifdef USE_MORPHNORMALS", "		attribute vec3 morphNormal0;", "		attribute vec3 morphNormal1;", "		attribute vec3 morphNormal2;", "		attribute vec3 morphNormal3;", "	#else", "		attribute vec3 morphTarget4;", "		attribute vec3 morphTarget5;", "		attribute vec3 morphTarget6;", "		attribute vec3 morphTarget7;", "	#endif", "#endif", "#ifdef USE_SKINNING", "	attribute vec4 skinIndex;", "	attribute vec4 skinWeight;", "#endif", "\n"].filter(g).join("\n"), t = [p, "precision " + n.precision + " float;", "precision " + n.precision + " int;", "#define SHADER_NAME " + m.__webglShader.name, y, n.alphaTest ? "#define ALPHATEST " + n.alphaTest : "", "#define GAMMA_FACTOR " + x, n.useFog && n.fog ? "#define USE_FOG" : "", n.useFog && n.fogExp ? "#define FOG_EXP2" : "", n.map ? "#define USE_MAP" : "", n.envMap ? "#define USE_ENVMAP" : "", n.envMap ? "#define " + u : "", n.envMap ? "#define " + v : "", n.envMap ? "#define " + w : "", n.lightMap ? "#define USE_LIGHTMAP" : "", n.aoMap ? "#define USE_AOMAP" : "", n.emissiveMap ? "#define USE_EMISSIVEMAP" : "", n.bumpMap ? "#define USE_BUMPMAP" : "", n.normalMap ? "#define USE_NORMALMAP" : "", n.specularMap ? "#define USE_SPECULARMAP" : "", n.roughnessMap ? "#define USE_ROUGHNESSMAP" : "", n.metalnessMap ? "#define USE_METALNESSMAP" : "", n.alphaMap ? "#define USE_ALPHAMAP" : "", n.vertexColors ? "#define USE_COLOR" : "", n.flatShading ? "#define FLAT_SHADED" : "", n.doubleSided ? "#define DOUBLE_SIDED" : "", n.flipSided ? "#define FLIP_SIDED" : "", "#define NUM_CLIPPING_PLANES " + n.numClippingPlanes, n.shadowMapEnabled ? "#define USE_SHADOWMAP" : "", n.shadowMapEnabled ? "#define " + t : "", n.premultipliedAlpha ? "#define PREMULTIPLIED_ALPHA" : "", n.physicallyCorrectLights ? "#define PHYSICALLY_CORRECT_LIGHTS" : "", n.logarithmicDepthBuffer ? "#define USE_LOGDEPTHBUF" : "", n.logarithmicDepthBuffer && a.extensions.get("EXT_frag_depth") ? "#define USE_LOGDEPTHBUF_EXT" : "", n.envMap && a.extensions.get("EXT_shader_texture_lod") ? "#define TEXTURE_LOD_EXT" : "", "uniform mat4 viewMatrix;", "uniform vec3 cameraPosition;", n.toneMapping !== THREE.NoToneMapping ? "#define TONE_MAPPING" : "", n.toneMapping !== THREE.NoToneMapping ? THREE.ShaderChunk.tonemapping_pars_fragment : "", n.toneMapping !== THREE.NoToneMapping ? d("toneMapping", n.toneMapping) : "", n.outputEncoding || n.mapEncoding || n.envMapEncoding || n.emissiveMapEncoding ? THREE.ShaderChunk.encodings_pars_fragment : "", n.mapEncoding ? b("mapTexelToLinear", n.mapEncoding) : "", n.envMapEncoding ? b("envMapTexelToLinear", n.envMapEncoding) : "", n.emissiveMapEncoding ? b("emissiveMapTexelToLinear", n.emissiveMapEncoding) : "", n.outputEncoding ? c("linearToOutputTexel", n.outputEncoding) : "", n.depthPacking ? "#define DEPTH_PACKING " + m.depthPacking : "", "\n"].filter(g).join("\n")), r = i(r, n), r = h(r, n), s = i(s, n), s = h(s, n), !1 == m instanceof THREE.ShaderMaterial && (r = j(r), s = j(s)), s = t + s, r = THREE.WebGLShader(o, o.VERTEX_SHADER, q + r), s = THREE.WebGLShader(o, o.FRAGMENT_SHADER, s), o.attachShader(z, r), o.attachShader(z, s), void 0 !== m.index0AttributeName ? o.bindAttribLocation(z, 0, m.index0AttributeName) : !0 === n.morphTargets && o.bindAttribLocation(z, 0, "position"), o.linkProgram(z), n = o.getProgramInfoLog(z), u = o.getShaderInfoLog(r), v = o.getShaderInfoLog(s), x = w = !0, !1 === o.getProgramParameter(z, o.LINK_STATUS) ? (w = !1, console.error("THREE.WebGLProgram: shader error: ", o.getError(), "gl.VALIDATE_STATUS", o.getProgramParameter(z, o.VALIDATE_STATUS), "gl.getProgramInfoLog", n, u, v)) : "" !== n ? console.warn("THREE.WebGLProgram: gl.getProgramInfoLog()", n) : ("" === u || "" === v) && (x = !1), x && (this.diagnostics = {
                runnable: w,
                material: m,
                programLog: n,
                vertexShader: {
                    log: u,
                    prefix: q
                },
                fragmentShader: {
                    log: v,
                    prefix: t
                }
            }), o.deleteShader(r), o.deleteShader(s);
            var A;
            this.getUniforms = function() {
                return void 0 === A && (A = new THREE.WebGLUniforms(o, z, a)), A
            };
            var B;
            return this.getAttributes = function() {
                if (void 0 === B) {
                    for (var a = {}, b = o.getProgramParameter(z, o.ACTIVE_ATTRIBUTES), c = 0; b > c; c++) {
                        var d = o.getActiveAttrib(z, c).name;
                        a[d] = o.getAttribLocation(z, d)
                    }
                    B = a
                }
                return B
            }, this.destroy = function() {
                o.deleteProgram(z), this.program = void 0
            }, Object.defineProperties(this, {
                uniforms: {
                    get: function() {
                        return console.warn("THREE.WebGLProgram: .uniforms is now .getUniforms()."), this.getUniforms()
                    }
                },
                attributes: {
                    get: function() {
                        return console.warn("THREE.WebGLProgram: .attributes is now .getAttributes()."), this.getAttributes()
                    }
                }
            }), this.id = k++, this.code = l, this.usedTimes = 1, this.program = z, this.vertexShader = r, this.fragmentShader = s, this
        }
    }(), THREE.WebGLPrograms = function(a, b) {
        function c(a, b) {
            var c;
            return a ? a instanceof THREE.Texture ? c = a.encoding : a instanceof THREE.WebGLRenderTarget && (console.warn("THREE.WebGLPrograms.getTextureEncodingFromMap: don't use render targets as textures. Use their .texture property instead."), c = a.texture.encoding) : c = THREE.LinearEncoding, c === THREE.LinearEncoding && b && (c = THREE.GammaEncoding), c
        }
        var d = [],
            e = {
                MeshDepthMaterial: "depth",
                MeshNormalMaterial: "normal",
                MeshBasicMaterial: "basic",
                MeshLambertMaterial: "lambert",
                MeshPhongMaterial: "phong",
                MeshStandardMaterial: "physical",
                MeshPhysicalMaterial: "physical",
                LineBasicMaterial: "basic",
                LineDashedMaterial: "dashed",
                PointsMaterial: "points"
            },
            f = "precision supportsVertexTextures map mapEncoding envMap envMapMode envMapEncoding lightMap aoMap emissiveMap emissiveMapEncoding bumpMap normalMap displacementMap specularMap roughnessMap metalnessMap alphaMap combine vertexColors fog useFog fogExp flatShading sizeAttenuation logarithmicDepthBuffer skinning maxBones useVertexTexture morphTargets morphNormals maxMorphTargets maxMorphNormals premultipliedAlpha numDirLights numPointLights numSpotLights numHemiLights shadowMapEnabled shadowMapType toneMapping physicallyCorrectLights alphaTest doubleSided flipSided numClippingPlanes depthPacking".split(" ");
        this.getParameters = function(d, f, g, h, i) {
            var j, k = e[d.type];
            b.floatVertexTextures && i && i.skeleton && i.skeleton.useVertexTexture ? j = 1024 : (j = Math.floor((b.maxVertexUniforms - 20) / 4), void 0 !== i && i instanceof THREE.SkinnedMesh && (j = Math.min(i.skeleton.bones.length, j), j < i.skeleton.bones.length && console.warn("WebGLRenderer: too many bones - " + i.skeleton.bones.length + ", this GPU supports just " + j + " (try OpenGL instead of ANGLE)")));
            var l = a.getPrecision();
            null !== d.precision && (l = b.getMaxPrecision(d.precision), l !== d.precision && console.warn("THREE.WebGLProgram.getParameters:", d.precision, "not supported, using", l, "instead."));
            var m = a.getCurrentRenderTarget();
            return {
                shaderID: k,
                precision: l,
                supportsVertexTextures: b.vertexTextures,
                outputEncoding: c(m ? m.texture : null, a.gammaOutput),
                map: !!d.map,
                mapEncoding: c(d.map, a.gammaInput),
                envMap: !!d.envMap,
                envMapMode: d.envMap && d.envMap.mapping,
                envMapEncoding: c(d.envMap, a.gammaInput),
                envMapCubeUV: !!d.envMap && (d.envMap.mapping === THREE.CubeUVReflectionMapping || d.envMap.mapping === THREE.CubeUVRefractionMapping),
                lightMap: !!d.lightMap,
                aoMap: !!d.aoMap,
                emissiveMap: !!d.emissiveMap,
                emissiveMapEncoding: c(d.emissiveMap, a.gammaInput),
                bumpMap: !!d.bumpMap,
                normalMap: !!d.normalMap,
                displacementMap: !!d.displacementMap,
                roughnessMap: !!d.roughnessMap,
                metalnessMap: !!d.metalnessMap,
                specularMap: !!d.specularMap,
                alphaMap: !!d.alphaMap,
                combine: d.combine,
                vertexColors: d.vertexColors,
                fog: !!g,
                useFog: d.fog,
                fogExp: g instanceof THREE.FogExp2,
                flatShading: d.shading === THREE.FlatShading,
                sizeAttenuation: d.sizeAttenuation,
                logarithmicDepthBuffer: b.logarithmicDepthBuffer,
                skinning: d.skinning,
                maxBones: j,
                useVertexTexture: b.floatVertexTextures && i && i.skeleton && i.skeleton.useVertexTexture,
                morphTargets: d.morphTargets,
                morphNormals: d.morphNormals,
                maxMorphTargets: a.maxMorphTargets,
                maxMorphNormals: a.maxMorphNormals,
                numDirLights: f.directional.length,
                numPointLights: f.point.length,
                numSpotLights: f.spot.length,
                numHemiLights: f.hemi.length,
                numClippingPlanes: h,
                shadowMapEnabled: a.shadowMap.enabled && i.receiveShadow && 0 < f.shadows.length,
                shadowMapType: a.shadowMap.type,
                toneMapping: a.toneMapping,
                physicallyCorrectLights: a.physicallyCorrectLights,
                premultipliedAlpha: d.premultipliedAlpha,
                alphaTest: d.alphaTest,
                doubleSided: d.side === THREE.DoubleSide,
                flipSided: d.side === THREE.BackSide,
                depthPacking: void 0 !== d.depthPacking ? d.depthPacking : !1
            }
        }, this.getProgramCode = function(a, b) {
            var c = [];
            if (b.shaderID ? c.push(b.shaderID) : (c.push(a.fragmentShader), c.push(a.vertexShader)), void 0 !== a.defines)
                for (var d in a.defines) c.push(d), c.push(a.defines[d]);
            for (d = 0; d < f.length; d++) c.push(b[f[d]]);
            return c.join()
        }, this.acquireProgram = function(b, c, e) {
            for (var f, g = 0, h = d.length; h > g; g++) {
                var i = d[g];
                if (i.code === e) {
                    f = i, ++f.usedTimes;
                    break
                }
            }
            return void 0 === f && (f = new THREE.WebGLProgram(a, e, b, c), d.push(f)), f
        }, this.releaseProgram = function(a) {
            if (0 === --a.usedTimes) {
                var b = d.indexOf(a);
                d[b] = d[d.length - 1], d.pop(), a.destroy()
            }
        }, this.programs = d
    }, THREE.WebGLProperties = function() {
        var a = {};
        this.get = function(b) {
            b = b.uuid;
            var c = a[b];
            return void 0 === c && (c = {}, a[b] = c), c
        }, this.delete = function(b) {
            delete a[b.uuid]
        }, this.clear = function() {
            a = {}
        }
    }, THREE.WebGLShader = function() {
        function a(a) {
            a = a.split("\n");
            for (var b = 0; b < a.length; b++) a[b] = b + 1 + ": " + a[b];
            return a.join("\n")
        }
        return function(b, c, d) {
            var e = b.createShader(c);
            return b.shaderSource(e, d), b.compileShader(e), !1 === b.getShaderParameter(e, b.COMPILE_STATUS) && console.error("THREE.WebGLShader: Shader couldn't compile."), "" !== b.getShaderInfoLog(e) && console.warn("THREE.WebGLShader: gl.getShaderInfoLog()", c === b.VERTEX_SHADER ? "vertex" : "fragment", b.getShaderInfoLog(e), a(d)), e
        }
    }(), THREE.WebGLShadowMap = function(a, b, c, d) {
        function e(b, c, d, e) {
            var f = b.geometry,
                g = null,
                g = q,
                h = b.customDepthMaterial;
            return d && (g = r, h = b.customDistanceMaterial), h ? g = h : (h = !1, c.morphTargets && (f instanceof THREE.BufferGeometry ? h = f.morphAttributes && f.morphAttributes.position && 0 < f.morphAttributes.position.length : f instanceof THREE.Geometry && (h = f.morphTargets && 0 < f.morphTargets.length)), b = b instanceof THREE.SkinnedMesh && c.skinning, f = 0, h && (f |= 1), b && (f |= 2), g = g[f]), a.localClippingEnabled && !0 === c.clipShadows && 0 !== c.clippingPlanes.length && (h = g.uuid, b = c.uuid, f = s[h], void 0 === f && (f = {}, s[h] = f), h = f[b], void 0 === h && (h = g.clone(), f[b] = h), g = h), g.visible = c.visible, g.wireframe = c.wireframe, b = c.side, B.renderSingleSided && b == THREE.DoubleSide && (b = THREE.FrontSide), B.renderReverseSided && (b === THREE.FrontSide ? b = THREE.BackSide : b === THREE.BackSide && (b = THREE.FrontSide)), g.side = b, g.clipShadows = c.clipShadows, g.clippingPlanes = c.clippingPlanes, g.wireframeLinewidth = c.wireframeLinewidth, g.linewidth = c.linewidth, d && void 0 !== g.uniforms.lightPos && g.uniforms.lightPos.value.copy(e), g
        }

        function f(a, b, c) {
            if (!1 !== a.visible) {
                a.layers.test(b.layers) && (a instanceof THREE.Mesh || a instanceof THREE.Line || a instanceof THREE.Points) && a.castShadow && (!1 === a.frustumCulled || !0 === i.intersectsObject(a)) && !0 === a.material.visible && (a.modelViewMatrix.multiplyMatrices(c.matrixWorldInverse, a.matrixWorld), p.push(a)), a = a.children;
                for (var d = 0, e = a.length; e > d; d++) f(a[d], b, c)
            }
        }
        var g = a.context,
            h = a.state,
            i = new THREE.Frustum,
            j = new THREE.Matrix4,
            k = b.shadows,
            l = new THREE.Vector2,
            m = new THREE.Vector2(d.maxTextureSize, d.maxTextureSize),
            n = new THREE.Vector3,
            o = new THREE.Vector3,
            p = [],
            q = Array(4),
            r = Array(4),
            s = {},
            t = [new THREE.Vector3(1, 0, 0), new THREE.Vector3(-1, 0, 0), new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, 0, -1), new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, -1, 0)],
            u = [new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, 0, -1)],
            v = [new THREE.Vector4, new THREE.Vector4, new THREE.Vector4, new THREE.Vector4, new THREE.Vector4, new THREE.Vector4];
        b = new THREE.MeshDepthMaterial, b.depthPacking = THREE.RGBADepthPacking, b.clipping = !0, d = THREE.ShaderLib.distanceRGBA;
        for (var w = THREE.UniformsUtils.clone(d.uniforms), x = 0; 4 !== x; ++x) {
            var y = 0 !== (1 & x),
                z = 0 !== (2 & x),
                A = b.clone();
            A.morphTargets = y, A.skinning = z, q[x] = A, y = new THREE.ShaderMaterial({
                defines: {
                    USE_SHADOWMAP: ""
                },
                uniforms: w,
                vertexShader: d.vertexShader,
                fragmentShader: d.fragmentShader,
                morphTargets: y,
                skinning: z,
                clipping: !0
            }), r[x] = y
        }
        var B = this;
        this.enabled = !1, this.autoUpdate = !0, this.needsUpdate = !1, this.type = THREE.PCFShadowMap, this.renderSingleSided = this.renderReverseSided = !0, this.render = function(b, d) {
            if (!1 !== B.enabled && (!1 !== B.autoUpdate || !1 !== B.needsUpdate) && 0 !== k.length) {
                h.clearColor(1, 1, 1, 1), h.disable(g.BLEND), h.setDepthTest(!0), h.setScissorTest(!1);
                for (var q, r, s = 0, w = k.length; w > s; s++) {
                    var x = k[s],
                        y = x.shadow;
                    if (void 0 === y) console.warn("THREE.WebGLShadowMap:", x, "has no shadow.");
                    else {
                        var z = y.camera;
                        if (l.copy(y.mapSize), l.min(m), x instanceof THREE.PointLight) {
                            q = 6, r = !0;
                            var A = l.x,
                                C = l.y;
                            v[0].set(2 * A, C, A, C), v[1].set(0, C, A, C), v[2].set(3 * A, C, A, C), v[3].set(A, C, A, C), v[4].set(3 * A, 0, A, C), v[5].set(A, 0, A, C), l.x *= 4, l.y *= 2
                        } else q = 1, r = !1;
                        for (null === y.map && (y.map = new THREE.WebGLRenderTarget(l.x, l.y, {
                                minFilter: THREE.NearestFilter,
                                magFilter: THREE.NearestFilter,
                                format: THREE.RGBAFormat
                            }), z.updateProjectionMatrix()), y instanceof THREE.SpotLightShadow && y.update(x), A = y.map, y = y.matrix, o.setFromMatrixPosition(x.matrixWorld), z.position.copy(o), a.setRenderTarget(A), a.clear(), A = 0; q > A; A++) {
                            r ? (n.copy(z.position), n.add(t[A]), z.up.copy(u[A]), z.lookAt(n), h.viewport(v[A])) : (n.setFromMatrixPosition(x.target.matrixWorld), z.lookAt(n)), z.updateMatrixWorld(), z.matrixWorldInverse.getInverse(z.matrixWorld), y.set(.5, 0, 0, .5, 0, .5, 0, .5, 0, 0, .5, .5, 0, 0, 0, 1), y.multiply(z.projectionMatrix), y.multiply(z.matrixWorldInverse), j.multiplyMatrices(z.projectionMatrix, z.matrixWorldInverse), i.setFromMatrix(j), p.length = 0, f(b, d, z);
                            for (var C = 0, D = p.length; D > C; C++) {
                                var E = p[C],
                                    F = c.update(E),
                                    G = E.material;
                                if (G instanceof THREE.MultiMaterial)
                                    for (var H = F.groups, G = G.materials, I = 0, J = H.length; J > I; I++) {
                                        var K = H[I],
                                            L = G[K.materialIndex];
                                        !0 === L.visible && (L = e(E, L, r, o), a.renderBufferDirect(z, null, F, L, E, K))
                                    } else L = e(E, G, r, o), a.renderBufferDirect(z, null, F, L, E, null)
                            }
                        }
                    }
                }
                q = a.getClearColor(), r = a.getClearAlpha(), a.setClearColor(q, r), B.needsUpdate = !1
            }
        }
    }, THREE.WebGLState = function(a, b, c) {
        function d(b, c, d) {
            var e = new Uint8Array(4),
                f = a.createTexture();
            for (a.bindTexture(b, f), a.texParameteri(b, a.TEXTURE_MIN_FILTER, a.NEAREST), a.texParameteri(b, a.TEXTURE_MAG_FILTER, a.NEAREST), b = 0; d > b; b++) a.texImage2D(c + b, 0, a.RGBA, 1, 1, 0, a.RGBA, a.UNSIGNED_BYTE, e);
            return f
        }
        var e = this;
        this.buffers = {
            color: new THREE.WebGLColorBuffer(a, this),
            depth: new THREE.WebGLDepthBuffer(a, this),
            stencil: new THREE.WebGLStencilBuffer(a, this)
        };
        var f = a.getParameter(a.MAX_VERTEX_ATTRIBS),
            g = new Uint8Array(f),
            h = new Uint8Array(f),
            i = new Uint8Array(f),
            j = {},
            k = null,
            l = null,
            m = null,
            n = null,
            o = null,
            p = null,
            q = null,
            r = null,
            s = !1,
            t = null,
            u = null,
            v = null,
            w = null,
            x = null,
            y = null,
            z = a.getParameter(a.MAX_TEXTURE_IMAGE_UNITS),
            A = null,
            B = {},
            C = new THREE.Vector4,
            D = new THREE.Vector4,
            E = {};
        E[a.TEXTURE_2D] = d(a.TEXTURE_2D, a.TEXTURE_2D, 1), E[a.TEXTURE_CUBE_MAP] = d(a.TEXTURE_CUBE_MAP, a.TEXTURE_CUBE_MAP_POSITIVE_X, 6), this.init = function() {
            this.clearColor(0, 0, 0, 1), this.clearDepth(1), this.clearStencil(0), this.enable(a.DEPTH_TEST), this.setDepthFunc(THREE.LessEqualDepth), this.setFlipSided(!1), this.setCullFace(THREE.CullFaceBack), this.enable(a.CULL_FACE), this.enable(a.BLEND), this.setBlending(THREE.NormalBlending)
        }, this.initAttributes = function() {
            for (var a = 0, b = g.length; b > a; a++) g[a] = 0
        }, this.enableAttribute = function(c) {
            g[c] = 1, 0 === h[c] && (a.enableVertexAttribArray(c), h[c] = 1), 0 !== i[c] && (b.get("ANGLE_instanced_arrays").vertexAttribDivisorANGLE(c, 0), i[c] = 0)
        }, this.enableAttributeAndDivisor = function(b, c, d) {
            g[b] = 1, 0 === h[b] && (a.enableVertexAttribArray(b), h[b] = 1), i[b] !== c && (d.vertexAttribDivisorANGLE(b, c), i[b] = c)
        }, this.disableUnusedAttributes = function() {
            for (var b = 0, c = h.length; b !== c; ++b) h[b] !== g[b] && (a.disableVertexAttribArray(b), h[b] = 0)
        }, this.enable = function(b) {
            !0 !== j[b] && (a.enable(b), j[b] = !0)
        }, this.disable = function(b) {
            !1 !== j[b] && (a.disable(b), j[b] = !1)
        }, this.getCompressedTextureFormats = function() {
            if (null === k && (k = [], b.get("WEBGL_compressed_texture_pvrtc") || b.get("WEBGL_compressed_texture_s3tc") || b.get("WEBGL_compressed_texture_etc1")))
                for (var c = a.getParameter(a.COMPRESSED_TEXTURE_FORMATS), d = 0; d < c.length; d++) k.push(c[d]);
            return k
        }, this.setBlending = function(b, d, e, f, g, h, i, j) {
            b !== THREE.NoBlending ? (this.enable(a.BLEND), (b !== l || j !== s) && (b === THREE.AdditiveBlending ? j ? (a.blendEquationSeparate(a.FUNC_ADD, a.FUNC_ADD), a.blendFuncSeparate(a.ONE, a.ONE, a.ONE, a.ONE)) : (a.blendEquation(a.FUNC_ADD), a.blendFunc(a.SRC_ALPHA, a.ONE)) : b === THREE.SubtractiveBlending ? j ? (a.blendEquationSeparate(a.FUNC_ADD, a.FUNC_ADD), a.blendFuncSeparate(a.ZERO, a.ZERO, a.ONE_MINUS_SRC_COLOR, a.ONE_MINUS_SRC_ALPHA)) : (a.blendEquation(a.FUNC_ADD), a.blendFunc(a.ZERO, a.ONE_MINUS_SRC_COLOR)) : b === THREE.MultiplyBlending ? j ? (a.blendEquationSeparate(a.FUNC_ADD, a.FUNC_ADD), a.blendFuncSeparate(a.ZERO, a.SRC_COLOR, a.ZERO, a.SRC_ALPHA)) : (a.blendEquation(a.FUNC_ADD), a.blendFunc(a.ZERO, a.SRC_COLOR)) : j ? (a.blendEquationSeparate(a.FUNC_ADD, a.FUNC_ADD), a.blendFuncSeparate(a.ONE, a.ONE_MINUS_SRC_ALPHA, a.ONE, a.ONE_MINUS_SRC_ALPHA)) : (a.blendEquationSeparate(a.FUNC_ADD, a.FUNC_ADD), a.blendFuncSeparate(a.SRC_ALPHA, a.ONE_MINUS_SRC_ALPHA, a.ONE, a.ONE_MINUS_SRC_ALPHA)), l = b, s = j), b === THREE.CustomBlending ? (g = g || d, h = h || e, i = i || f, (d !== m || g !== p) && (a.blendEquationSeparate(c(d), c(g)), m = d, p = g), (e !== n || f !== o || h !== q || i !== r) && (a.blendFuncSeparate(c(e), c(f), c(h), c(i)), n = e, o = f, q = h, r = i)) : r = q = p = o = n = m = null) : (this.disable(a.BLEND), l = b)
        }, this.setColorWrite = function(a) {
            this.buffers.color.setMask(a)
        }, this.setDepthTest = function(a) {
            this.buffers.depth.setTest(a)
        }, this.setDepthWrite = function(a) {
            this.buffers.depth.setMask(a)
        }, this.setDepthFunc = function(a) {
            this.buffers.depth.setFunc(a)
        }, this.setStencilTest = function(a) {
            this.buffers.stencil.setTest(a)
        }, this.setStencilWrite = function(a) {
            this.buffers.stencil.setMask(a)
        }, this.setStencilFunc = function(a, b, c) {
            this.buffers.stencil.setFunc(a, b, c)
        }, this.setStencilOp = function(a, b, c) {
            this.buffers.stencil.setOp(a, b, c)
        }, this.setFlipSided = function(b) {
            t !== b && (b ? a.frontFace(a.CW) : a.frontFace(a.CCW), t = b)
        }, this.setCullFace = function(b) {
            b !== THREE.CullFaceNone ? (this.enable(a.CULL_FACE), b !== u && (b === THREE.CullFaceBack ? a.cullFace(a.BACK) : b === THREE.CullFaceFront ? a.cullFace(a.FRONT) : a.cullFace(a.FRONT_AND_BACK))) : this.disable(a.CULL_FACE), u = b
        }, this.setLineWidth = function(b) {
            b !== v && (a.lineWidth(b), v = b)
        }, this.setPolygonOffset = function(b, c, d) {
            b ? (this.enable(a.POLYGON_OFFSET_FILL), (w !== c || x !== d) && (a.polygonOffset(c, d), w = c, x = d)) : this.disable(a.POLYGON_OFFSET_FILL)
        }, this.getScissorTest = function() {
            return y
        }, this.setScissorTest = function(b) {
            (y = b) ? this.enable(a.SCISSOR_TEST): this.disable(a.SCISSOR_TEST)
        }, this.activeTexture = function(b) {
            void 0 === b && (b = a.TEXTURE0 + z - 1), A !== b && (a.activeTexture(b), A = b)
        }, this.bindTexture = function(b, c) {
            null === A && e.activeTexture();
            var d = B[A];
            void 0 === d && (d = {
                type: void 0,
                texture: void 0
            }, B[A] = d), (d.type !== b || d.texture !== c) && (a.bindTexture(b, c || E[b]), d.type = b, d.texture = c)
        }, this.compressedTexImage2D = function() {
            try {
                a.compressedTexImage2D.apply(a, arguments)
            } catch (a) {
                console.error(a)
            }
        }, this.texImage2D = function() {
            try {
                a.texImage2D.apply(a, arguments)
            } catch (a) {
                console.error(a)
            }
        }, this.clearColor = function(a, b, c, d) {
            this.buffers.color.setClear(a, b, c, d)
        }, this.clearDepth = function(a) {
            this.buffers.depth.setClear(a)
        }, this.clearStencil = function(a) {
            this.buffers.stencil.setClear(a)
        }, this.scissor = function(b) {
            !1 === C.equals(b) && (a.scissor(b.x, b.y, b.z, b.w), C.copy(b))
        }, this.viewport = function(b) {
            !1 === D.equals(b) && (a.viewport(b.x, b.y, b.z, b.w), D.copy(b))
        }, this.reset = function() {
            for (var b = 0; b < h.length; b++) 1 === h[b] && (a.disableVertexAttribArray(b), h[b] = 0);
            j = {}, A = k = null, B = {}, u = t = l = null, this.buffers.color.reset(), this.buffers.depth.reset(), this.buffers.stencil.reset()
        }
    }, THREE.WebGLColorBuffer = function(a, b) {
        var c = !1,
            d = new THREE.Vector4,
            e = null,
            f = new THREE.Vector4;
        this.setMask = function(b) {
            e === b || c || (a.colorMask(b, b, b, b), e = b)
        }, this.setLocked = function(a) {
            c = a
        }, this.setClear = function(b, c, e, g) {
            d.set(b, c, e, g), !1 === f.equals(d) && (a.clearColor(b, c, e, g), f.copy(d))
        }, this.reset = function() {
            c = !1, e = null, f = new THREE.Vector4
        }
    }, THREE.WebGLDepthBuffer = function(a, b) {
        var c = !1,
            d = null,
            e = null,
            f = null;
        this.setTest = function(c) {
            c ? b.enable(a.DEPTH_TEST) : b.disable(a.DEPTH_TEST)
        }, this.setMask = function(b) {
            d === b || c || (a.depthMask(b), d = b)
        }, this.setFunc = function(b) {
            if (e !== b) {
                if (b) switch (b) {
                    case THREE.NeverDepth:
                        a.depthFunc(a.NEVER);
                        break;
                    case THREE.AlwaysDepth:
                        a.depthFunc(a.ALWAYS);
                        break;
                    case THREE.LessDepth:
                        a.depthFunc(a.LESS);
                        break;
                    case THREE.LessEqualDepth:
                        a.depthFunc(a.LEQUAL);
                        break;
                    case THREE.EqualDepth:
                        a.depthFunc(a.EQUAL);
                        break;
                    case THREE.GreaterEqualDepth:
                        a.depthFunc(a.GEQUAL);
                        break;
                    case THREE.GreaterDepth:
                        a.depthFunc(a.GREATER);
                        break;
                    case THREE.NotEqualDepth:
                        a.depthFunc(a.NOTEQUAL);
                        break;
                    default:
                        a.depthFunc(a.LEQUAL)
                } else a.depthFunc(a.LEQUAL);
                e = b
            }
        }, this.setLocked = function(a) {
            c = a
        }, this.setClear = function(b) {
            f !== b && (a.clearDepth(b), f = b)
        }, this.reset = function() {
            c = !1, f = e = d = null
        }
    }, THREE.WebGLStencilBuffer = function(a, b) {
        var c = !1,
            d = null,
            e = null,
            f = null,
            g = null,
            h = null,
            i = null,
            j = null,
            k = null;
        this.setTest = function(c) {
            c ? b.enable(a.STENCIL_TEST) : b.disable(a.STENCIL_TEST)
        }, this.setMask = function(b) {
            d === b || c || (a.stencilMask(b), d = b)
        }, this.setFunc = function(b, c, d) {
            (e !== b || f !== c || g !== d) && (a.stencilFunc(b, c, d), e = b, f = c, g = d)
        }, this.setOp = function(b, c, d) {
            (h !== b || i !== c || j !== d) && (a.stencilOp(b, c, d), h = b, i = c, j = d)
        }, this.setLocked = function(a) {
            c = a
        }, this.setClear = function(b) {
            k !== b && (a.clearStencil(b), k = b)
        }, this.reset = function() {
            c = !1, k = j = i = h = g = f = e = d = null
        }
    }, THREE.WebGLTextures = function(a, b, c, d, e, f, g) {
        function h(a, b) {
            if (a.width > b || a.height > b) {
                var c = b / Math.max(a.width, a.height),
                    d = document.createElementNS("http://www.w3.org/1999/xhtml", "canvas");
                return d.width = Math.floor(a.width * c), d.height = Math.floor(a.height * c), d.getContext("2d").drawImage(a, 0, 0, a.width, a.height, 0, 0, d.width, d.height), console.warn("THREE.WebGLRenderer: image is too big (" + a.width + "x" + a.height + "). Resized to " + d.width + "x" + d.height, a), d
            }
            return a
        }

        function i(a) {
            return THREE.Math.isPowerOfTwo(a.width) && THREE.Math.isPowerOfTwo(a.height)
        }

        function j(b) {
            return b === THREE.NearestFilter || b === THREE.NearestMipMapNearestFilter || b === THREE.NearestMipMapLinearFilter ? a.NEAREST : a.LINEAR
        }

        function k(b) {
            b = b.target, b.removeEventListener("dispose", k);
            a: {
                var c = d.get(b);
                if (b.image && c.__image__webglTextureCube) a.deleteTexture(c.__image__webglTextureCube);
                else {
                    if (void 0 === c.__webglInit) break a;
                    a.deleteTexture(c.__webglTexture)
                }
                d.delete(b)
            }
            q.textures--
        }

        function l(b) {
            b = b.target, b.removeEventListener("dispose", l);
            var c = d.get(b),
                e = d.get(b.texture);
            if (b) {
                if (void 0 !== e.__webglTexture && a.deleteTexture(e.__webglTexture), b.depthTexture && b.depthTexture.dispose(), b instanceof THREE.WebGLRenderTargetCube)
                    for (e = 0; 6 > e; e++) a.deleteFramebuffer(c.__webglFramebuffer[e]), c.__webglDepthbuffer && a.deleteRenderbuffer(c.__webglDepthbuffer[e]);
                else a.deleteFramebuffer(c.__webglFramebuffer), c.__webglDepthbuffer && a.deleteRenderbuffer(c.__webglDepthbuffer);
                d.delete(b.texture), d.delete(b)
            }
            q.textures--
        }

        function m(b, g) {
            var j = d.get(b);
            if (0 < b.version && j.__version !== b.version) {
                var l = b.image;
                if (void 0 === l) console.warn("THREE.WebGLRenderer: Texture marked for update but image is undefined", b);
                else {
                    if (!1 !== l.complete) {
                        void 0 === j.__webglInit && (j.__webglInit = !0, b.addEventListener("dispose", k), j.__webglTexture = a.createTexture(), q.textures++), c.activeTexture(a.TEXTURE0 + g), c.bindTexture(a.TEXTURE_2D, j.__webglTexture), a.pixelStorei(a.UNPACK_FLIP_Y_WEBGL, b.flipY), a.pixelStorei(a.UNPACK_PREMULTIPLY_ALPHA_WEBGL, b.premultiplyAlpha), a.pixelStorei(a.UNPACK_ALIGNMENT, b.unpackAlignment);
                        var m = h(b.image, e.maxTextureSize);
                        if ((b.wrapS !== THREE.ClampToEdgeWrapping || b.wrapT !== THREE.ClampToEdgeWrapping || b.minFilter !== THREE.NearestFilter && b.minFilter !== THREE.LinearFilter) && !1 === i(m))
                            if (l = m, l instanceof HTMLImageElement || l instanceof HTMLCanvasElement) {
                                var o = document.createElementNS("http://www.w3.org/1999/xhtml", "canvas");
                                o.width = THREE.Math.nearestPowerOfTwo(l.width), o.height = THREE.Math.nearestPowerOfTwo(l.height), o.getContext("2d").drawImage(l, 0, 0, o.width, o.height), console.warn("THREE.WebGLRenderer: image is not power of two (" + l.width + "x" + l.height + "). Resized to " + o.width + "x" + o.height, l), m = o
                            } else m = l;
                        var l = i(m),
                            o = f(b.format),
                            p = f(b.type);
                        n(a.TEXTURE_2D, b, l);
                        var s = b.mipmaps;
                        if (b instanceof THREE.DepthTexture) {
                            if (s = a.DEPTH_COMPONENT, b.type === THREE.FloatType) {
                                if (!r) throw Error("Float Depth Texture only supported in WebGL2.0");
                                s = a.DEPTH_COMPONENT32F
                            } else r && (s = a.DEPTH_COMPONENT16);
                            c.texImage2D(a.TEXTURE_2D, 0, s, m.width, m.height, 0, o, p, null)
                        } else if (b instanceof THREE.DataTexture)
                            if (0 < s.length && l) {
                                for (var t = 0, u = s.length; u > t; t++) m = s[t], c.texImage2D(a.TEXTURE_2D, t, o, m.width, m.height, 0, o, p, m.data);
                                b.generateMipmaps = !1
                            } else c.texImage2D(a.TEXTURE_2D, 0, o, m.width, m.height, 0, o, p, m.data);
                        else if (b instanceof THREE.CompressedTexture)
                            for (t = 0, u = s.length; u > t; t++) m = s[t], b.format !== THREE.RGBAFormat && b.format !== THREE.RGBFormat ? -1 < c.getCompressedTextureFormats().indexOf(o) ? c.compressedTexImage2D(a.TEXTURE_2D, t, o, m.width, m.height, 0, m.data) : console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()") : c.texImage2D(a.TEXTURE_2D, t, o, m.width, m.height, 0, o, p, m.data);
                        else if (0 < s.length && l) {
                            for (t = 0, u = s.length; u > t; t++) m = s[t], c.texImage2D(a.TEXTURE_2D, t, o, o, p, m);
                            b.generateMipmaps = !1
                        } else c.texImage2D(a.TEXTURE_2D, 0, o, o, p, m);
                        return b.generateMipmaps && l && a.generateMipmap(a.TEXTURE_2D), j.__version = b.version, void(b.onUpdate && b.onUpdate(b))
                    }
                    console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete", b)
                }
            }
            c.activeTexture(a.TEXTURE0 + g), c.bindTexture(a.TEXTURE_2D, j.__webglTexture)
        }

        function n(c, g, h) {
            h ? (a.texParameteri(c, a.TEXTURE_WRAP_S, f(g.wrapS)), a.texParameteri(c, a.TEXTURE_WRAP_T, f(g.wrapT)), a.texParameteri(c, a.TEXTURE_MAG_FILTER, f(g.magFilter)), a.texParameteri(c, a.TEXTURE_MIN_FILTER, f(g.minFilter))) : (a.texParameteri(c, a.TEXTURE_WRAP_S, a.CLAMP_TO_EDGE), a.texParameteri(c, a.TEXTURE_WRAP_T, a.CLAMP_TO_EDGE), g.wrapS === THREE.ClampToEdgeWrapping && g.wrapT === THREE.ClampToEdgeWrapping || console.warn("THREE.WebGLRenderer: Texture is not power of two. Texture.wrapS and Texture.wrapT should be set to THREE.ClampToEdgeWrapping.", g), a.texParameteri(c, a.TEXTURE_MAG_FILTER, j(g.magFilter)), a.texParameteri(c, a.TEXTURE_MIN_FILTER, j(g.minFilter)), g.minFilter !== THREE.NearestFilter && g.minFilter !== THREE.LinearFilter && console.warn("THREE.WebGLRenderer: Texture is not power of two. Texture.minFilter should be set to THREE.NearestFilter or THREE.LinearFilter.", g)), !(h = b.get("EXT_texture_filter_anisotropic")) || g.type === THREE.FloatType && null === b.get("OES_texture_float_linear") || g.type === THREE.HalfFloatType && null === b.get("OES_texture_half_float_linear") || !(1 < g.anisotropy || d.get(g).__currentAnisotropy) || (a.texParameterf(c, h.TEXTURE_MAX_ANISOTROPY_EXT, Math.min(g.anisotropy, e.getMaxAnisotropy())), d.get(g).__currentAnisotropy = g.anisotropy)
        }

        function o(b, e, g, h) {
            var i = f(e.texture.format),
                j = f(e.texture.type);
            c.texImage2D(h, 0, i, e.width, e.height, 0, i, j, null), a.bindFramebuffer(a.FRAMEBUFFER, b), a.framebufferTexture2D(a.FRAMEBUFFER, g, h, d.get(e.texture).__webglTexture, 0), a.bindFramebuffer(a.FRAMEBUFFER, null)
        }

        function p(b, c) {
            a.bindRenderbuffer(a.RENDERBUFFER, b), c.depthBuffer && !c.stencilBuffer ? (a.renderbufferStorage(a.RENDERBUFFER, a.DEPTH_COMPONENT16, c.width, c.height), a.framebufferRenderbuffer(a.FRAMEBUFFER, a.DEPTH_ATTACHMENT, a.RENDERBUFFER, b)) : c.depthBuffer && c.stencilBuffer ? (a.renderbufferStorage(a.RENDERBUFFER, a.DEPTH_STENCIL, c.width, c.height), a.framebufferRenderbuffer(a.FRAMEBUFFER, a.DEPTH_STENCIL_ATTACHMENT, a.RENDERBUFFER, b)) : a.renderbufferStorage(a.RENDERBUFFER, a.RGBA4, c.width, c.height), a.bindRenderbuffer(a.RENDERBUFFER, null)
        }
        var q = g.memory,
            r = "undefined" != typeof WebGL2RenderingContext && a instanceof WebGL2RenderingContext;
        this.setTexture2D = m, this.setTextureCube = function(b, g) {
            var j = d.get(b);
            if (6 === b.image.length)
                if (0 < b.version && j.__version !== b.version) {
                    j.__image__webglTextureCube || (b.addEventListener("dispose", k), j.__image__webglTextureCube = a.createTexture(), q.textures++), c.activeTexture(a.TEXTURE0 + g), c.bindTexture(a.TEXTURE_CUBE_MAP, j.__image__webglTextureCube), a.pixelStorei(a.UNPACK_FLIP_Y_WEBGL, b.flipY);
                    for (var l = b instanceof THREE.CompressedTexture, m = b.image[0] instanceof THREE.DataTexture, o = [], p = 0; 6 > p; p++) o[p] = l || m ? m ? b.image[p].image : b.image[p] : h(b.image[p], e.maxCubemapSize);
                    var r = i(o[0]),
                        s = f(b.format),
                        t = f(b.type);
                    for (n(a.TEXTURE_CUBE_MAP, b, r), p = 0; 6 > p; p++)
                        if (l)
                            for (var u, v = o[p].mipmaps, w = 0, x = v.length; x > w; w++) u = v[w], b.format !== THREE.RGBAFormat && b.format !== THREE.RGBFormat ? -1 < c.getCompressedTextureFormats().indexOf(s) ? c.compressedTexImage2D(a.TEXTURE_CUBE_MAP_POSITIVE_X + p, w, s, u.width, u.height, 0, u.data) : console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()") : c.texImage2D(a.TEXTURE_CUBE_MAP_POSITIVE_X + p, w, s, u.width, u.height, 0, s, t, u.data);
                        else m ? c.texImage2D(a.TEXTURE_CUBE_MAP_POSITIVE_X + p, 0, s, o[p].width, o[p].height, 0, s, t, o[p].data) : c.texImage2D(a.TEXTURE_CUBE_MAP_POSITIVE_X + p, 0, s, s, t, o[p]);
                    b.generateMipmaps && r && a.generateMipmap(a.TEXTURE_CUBE_MAP), j.__version = b.version, b.onUpdate && b.onUpdate(b)
                } else c.activeTexture(a.TEXTURE0 + g), c.bindTexture(a.TEXTURE_CUBE_MAP, j.__image__webglTextureCube)
        }, this.setTextureCubeDynamic = function(b, e) {
            c.activeTexture(a.TEXTURE0 + e), c.bindTexture(a.TEXTURE_CUBE_MAP, d.get(b).__webglTexture)
        }, this.setupRenderTarget = function(b) {
            var e = d.get(b),
                f = d.get(b.texture);
            b.addEventListener("dispose", l), f.__webglTexture = a.createTexture(),
                q.textures++;
            var g = b instanceof THREE.WebGLRenderTargetCube,
                h = i(b);
            if (g) {
                e.__webglFramebuffer = [];
                for (var j = 0; 6 > j; j++) e.__webglFramebuffer[j] = a.createFramebuffer()
            } else e.__webglFramebuffer = a.createFramebuffer();
            if (g) {
                for (c.bindTexture(a.TEXTURE_CUBE_MAP, f.__webglTexture), n(a.TEXTURE_CUBE_MAP, b.texture, h), j = 0; 6 > j; j++) o(e.__webglFramebuffer[j], b, a.COLOR_ATTACHMENT0, a.TEXTURE_CUBE_MAP_POSITIVE_X + j);
                b.texture.generateMipmaps && h && a.generateMipmap(a.TEXTURE_CUBE_MAP), c.bindTexture(a.TEXTURE_CUBE_MAP, null)
            } else c.bindTexture(a.TEXTURE_2D, f.__webglTexture), n(a.TEXTURE_2D, b.texture, h), o(e.__webglFramebuffer, b, a.COLOR_ATTACHMENT0, a.TEXTURE_2D), b.texture.generateMipmaps && h && a.generateMipmap(a.TEXTURE_2D), c.bindTexture(a.TEXTURE_2D, null);
            if (b.depthBuffer) {
                if (e = d.get(b), f = b instanceof THREE.WebGLRenderTargetCube, b.depthTexture) {
                    if (f) throw Error("target.depthTexture not supported in Cube render targets");
                    if (b instanceof THREE.WebGLRenderTargetCube) throw Error("Depth Texture with cube render targets is not supported!");
                    if (a.bindFramebuffer(a.FRAMEBUFFER, e.__webglFramebuffer), !(b.depthTexture instanceof THREE.DepthTexture)) throw Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");
                    d.get(b.depthTexture).__webglTexture && b.depthTexture.image.width === b.width && b.depthTexture.image.height === b.height || (b.depthTexture.image.width = b.width, b.depthTexture.image.height = b.height, b.depthTexture.needsUpdate = !0), m(b.depthTexture, 0), b = d.get(b.depthTexture).__webglTexture, a.framebufferTexture2D(a.FRAMEBUFFER, a.DEPTH_ATTACHMENT, a.TEXTURE_2D, b, 0)
                } else if (f)
                    for (e.__webglDepthbuffer = [], f = 0; 6 > f; f++) a.bindFramebuffer(a.FRAMEBUFFER, e.__webglFramebuffer[f]), e.__webglDepthbuffer[f] = a.createRenderbuffer(), p(e.__webglDepthbuffer[f], b);
                else a.bindFramebuffer(a.FRAMEBUFFER, e.__webglFramebuffer), e.__webglDepthbuffer = a.createRenderbuffer(), p(e.__webglDepthbuffer, b);
                a.bindFramebuffer(a.FRAMEBUFFER, null)
            }
        }, this.updateRenderTargetMipmap = function(b) {
            var e = b.texture;
            e.generateMipmaps && i(b) && e.minFilter !== THREE.NearestFilter && e.minFilter !== THREE.LinearFilter && (b = b instanceof THREE.WebGLRenderTargetCube ? a.TEXTURE_CUBE_MAP : a.TEXTURE_2D, e = d.get(e).__webglTexture, c.bindTexture(b, e), a.generateMipmap(b), c.bindTexture(b, null))
        }
    }, THREE.WebGLUniforms = function() {
        var a = new THREE.Texture,
            b = new THREE.CubeTexture,
            c = [],
            d = [],
            e = function(a, b, d) {
                var e = a[0];
                if (0 >= e || e > 0) return a;
                var f = b * d,
                    g = c[f];
                if (void 0 === g && (g = new Float32Array(f), c[f] = g), 0 !== b)
                    for (e.toArray(g, 0), e = 1, f = 0; e !== b; ++e) f += d, a[e].toArray(g, f);
                return g
            },
            f = function(a, b) {
                var c = d[b];
                void 0 === c && (c = new Int32Array(b), d[b] = c);
                for (var e = 0; e !== b; ++e) c[e] = a.allocTextureUnit();
                return c
            },
            g = function(a, b) {
                a.uniform1f(this.addr, b)
            },
            h = function(a, b) {
                a.uniform1i(this.addr, b)
            },
            i = function(a, b) {
                void 0 === b.x ? a.uniform2fv(this.addr, b) : a.uniform2f(this.addr, b.x, b.y)
            },
            j = function(a, b) {
                void 0 !== b.x ? a.uniform3f(this.addr, b.x, b.y, b.z) : void 0 !== b.r ? a.uniform3f(this.addr, b.r, b.g, b.b) : a.uniform3fv(this.addr, b)
            },
            k = function(a, b) {
                void 0 === b.x ? a.uniform4fv(this.addr, b) : a.uniform4f(this.addr, b.x, b.y, b.z, b.w)
            },
            l = function(a, b) {
                a.uniformMatrix2fv(this.addr, !1, b.elements || b)
            },
            m = function(a, b) {
                a.uniformMatrix3fv(this.addr, !1, b.elements || b)
            },
            n = function(a, b) {
                a.uniformMatrix4fv(this.addr, !1, b.elements || b)
            },
            o = function(b, c, d) {
                var e = d.allocTextureUnit();
                b.uniform1i(this.addr, e), d.setTexture2D(c || a, e)
            },
            p = function(a, c, d) {
                var e = d.allocTextureUnit();
                a.uniform1i(this.addr, e), d.setTextureCube(c || b, e)
            },
            q = function(a, b) {
                a.uniform2iv(this.addr, b)
            },
            r = function(a, b) {
                a.uniform3iv(this.addr, b)
            },
            s = function(a, b) {
                a.uniform4iv(this.addr, b)
            },
            t = function(a) {
                switch (a) {
                    case 5126:
                        return g;
                    case 35664:
                        return i;
                    case 35665:
                        return j;
                    case 35666:
                        return k;
                    case 35674:
                        return l;
                    case 35675:
                        return m;
                    case 35676:
                        return n;
                    case 35678:
                        return o;
                    case 35680:
                        return p;
                    case 5124:
                    case 35670:
                        return h;
                    case 35667:
                    case 35671:
                        return q;
                    case 35668:
                    case 35672:
                        return r;
                    case 35669:
                    case 35673:
                        return s
                }
            },
            u = function(a, b) {
                a.uniform1fv(this.addr, b)
            },
            v = function(a, b) {
                a.uniform1iv(this.addr, b)
            },
            w = function(a, b) {
                a.uniform2fv(this.addr, e(b, this.size, 2))
            },
            x = function(a, b) {
                a.uniform3fv(this.addr, e(b, this.size, 3))
            },
            y = function(a, b) {
                a.uniform4fv(this.addr, e(b, this.size, 4))
            },
            z = function(a, b) {
                a.uniformMatrix2fv(this.addr, !1, e(b, this.size, 4))
            },
            A = function(a, b) {
                a.uniformMatrix3fv(this.addr, !1, e(b, this.size, 9))
            },
            B = function(a, b) {
                a.uniformMatrix4fv(this.addr, !1, e(b, this.size, 16))
            },
            C = function(b, c, d) {
                var e = c.length,
                    g = f(d, e);
                for (b.uniform1iv(this.addr, g), b = 0; b !== e; ++b) d.setTexture2D(c[b] || a, g[b])
            },
            D = function(a, c, d) {
                var e = c.length,
                    g = f(d, e);
                for (a.uniform1iv(this.addr, g), a = 0; a !== e; ++a) d.setTextureCube(c[a] || b, g[a])
            },
            E = function(a) {
                switch (a) {
                    case 5126:
                        return u;
                    case 35664:
                        return w;
                    case 35665:
                        return x;
                    case 35666:
                        return y;
                    case 35674:
                        return z;
                    case 35675:
                        return A;
                    case 35676:
                        return B;
                    case 35678:
                        return C;
                    case 35680:
                        return D;
                    case 5124:
                    case 35670:
                        return v;
                    case 35667:
                    case 35671:
                        return q;
                    case 35668:
                    case 35672:
                        return r;
                    case 35669:
                    case 35673:
                        return s
                }
            },
            F = function(a, b, c) {
                this.id = a, this.addr = c, this.setValue = t(b.type)
            },
            G = function(a, b, c) {
                this.id = a, this.addr = c, this.size = b.size, this.setValue = E(b.type)
            },
            H = function(a) {
                this.id = a, this.seq = [], this.map = {}
            };
        H.prototype.setValue = function(a, b) {
            for (var c = this.seq, d = 0, e = c.length; d !== e; ++d) {
                var f = c[d];
                f.setValue(a, b[f.id])
            }
        };
        var I = /([\w\d_]+)(\])?(\[|\.)?/g,
            J = function(a, b, c) {
                this.seq = [], this.map = {}, this.renderer = c, c = a.getProgramParameter(b, a.ACTIVE_UNIFORMS);
                for (var d = 0; d !== c; ++d) {
                    var e = a.getActiveUniform(b, d),
                        f = a.getUniformLocation(b, e.name),
                        g = this,
                        h = e.name,
                        i = h.length;
                    for (I.lastIndex = 0;;) {
                        var j = I.exec(h),
                            k = I.lastIndex,
                            l = j[1],
                            m = j[3];
                        if ("]" === j[2] && (l |= 0), void 0 === m || "[" === m && k + 2 === i) {
                            h = g, e = void 0 === m ? new F(l, e, f) : new G(l, e, f), h.seq.push(e), h.map[e.id] = e;
                            break
                        }
                        m = g.map[l], void 0 === m && (m = new H(l), l = g, g = m, l.seq.push(g), l.map[g.id] = g), g = m
                    }
                }
            };
        return J.prototype.setValue = function(a, b, c) {
            b = this.map[b], void 0 !== b && b.setValue(a, c, this.renderer)
        }, J.prototype.set = function(a, b, c) {
            var d = this.map[c];
            void 0 !== d && d.setValue(a, b[c], this.renderer)
        }, J.prototype.setOptional = function(a, b, c) {
            b = b[c], void 0 !== b && this.setValue(a, c, b)
        }, J.upload = function(a, b, c, d) {
            for (var e = 0, f = b.length; e !== f; ++e) {
                var g = b[e],
                    h = c[g.id];
                !1 !== h.needsUpdate && g.setValue(a, h.value, d)
            }
        }, J.seqWithValue = function(a, b) {
            for (var c = [], d = 0, e = a.length; d !== e; ++d) {
                var f = a[d];
                f.id in b && c.push(f)
            }
            return c
        }, J.splitDynamic = function(a, b) {
            for (var c = null, d = a.length, e = 0, f = 0; f !== d; ++f) {
                var g = a[f],
                    h = b[g.id];
                h && !0 === h.dynamic ? (null === c && (c = []), c.push(g)) : (f > e && (a[e] = g), ++e)
            }
            return d > e && (a.length = e), c
        }, J.evalDynamic = function(a, b, c, d) {
            for (var e = 0, f = a.length; e !== f; ++e) {
                var g = b[a[e].id],
                    h = g.onUpdateCallback;
                void 0 !== h && h.call(g, c, d)
            }
        }, J
    }(), THREE.LensFlarePlugin = function(a, b) {
        var c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, r, s = a.context,
            t = a.state;
        this.render = function(u, v, w) {
            if (0 !== b.length) {
                u = new THREE.Vector3;
                var x = w.w / w.z,
                    y = .5 * w.z,
                    z = .5 * w.w,
                    A = 16 / w.w,
                    B = new THREE.Vector2(A * x, A),
                    C = new THREE.Vector3(1, 1, 0),
                    D = new THREE.Vector2(1, 1),
                    E = new THREE.Box2;
                if (E.min.set(0, 0), E.max.set(w.z - 16, w.w - 16), void 0 === p) {
                    var A = new Float32Array([-1, -1, 0, 0, 1, -1, 1, 0, 1, 1, 1, 1, -1, 1, 0, 1]),
                        F = new Uint16Array([0, 1, 2, 0, 2, 3]);
                    m = s.createBuffer(), n = s.createBuffer(), s.bindBuffer(s.ARRAY_BUFFER, m), s.bufferData(s.ARRAY_BUFFER, A, s.STATIC_DRAW), s.bindBuffer(s.ELEMENT_ARRAY_BUFFER, n), s.bufferData(s.ELEMENT_ARRAY_BUFFER, F, s.STATIC_DRAW), q = s.createTexture(), r = s.createTexture(), t.bindTexture(s.TEXTURE_2D, q), s.texImage2D(s.TEXTURE_2D, 0, s.RGB, 16, 16, 0, s.RGB, s.UNSIGNED_BYTE, null), s.texParameteri(s.TEXTURE_2D, s.TEXTURE_WRAP_S, s.CLAMP_TO_EDGE), s.texParameteri(s.TEXTURE_2D, s.TEXTURE_WRAP_T, s.CLAMP_TO_EDGE), s.texParameteri(s.TEXTURE_2D, s.TEXTURE_MAG_FILTER, s.NEAREST), s.texParameteri(s.TEXTURE_2D, s.TEXTURE_MIN_FILTER, s.NEAREST), t.bindTexture(s.TEXTURE_2D, r), s.texImage2D(s.TEXTURE_2D, 0, s.RGBA, 16, 16, 0, s.RGBA, s.UNSIGNED_BYTE, null), s.texParameteri(s.TEXTURE_2D, s.TEXTURE_WRAP_S, s.CLAMP_TO_EDGE), s.texParameteri(s.TEXTURE_2D, s.TEXTURE_WRAP_T, s.CLAMP_TO_EDGE), s.texParameteri(s.TEXTURE_2D, s.TEXTURE_MAG_FILTER, s.NEAREST), s.texParameteri(s.TEXTURE_2D, s.TEXTURE_MIN_FILTER, s.NEAREST);
                    var A = o = {
                            vertexShader: "uniform lowp int renderType;\nuniform vec3 screenPosition;\nuniform vec2 scale;\nuniform float rotation;\nuniform sampler2D occlusionMap;\nattribute vec2 position;\nattribute vec2 uv;\nvarying vec2 vUV;\nvarying float vVisibility;\nvoid main() {\nvUV = uv;\nvec2 pos = position;\nif ( renderType == 2 ) {\nvec4 visibility = texture2D( occlusionMap, vec2( 0.1, 0.1 ) );\nvisibility += texture2D( occlusionMap, vec2( 0.5, 0.1 ) );\nvisibility += texture2D( occlusionMap, vec2( 0.9, 0.1 ) );\nvisibility += texture2D( occlusionMap, vec2( 0.9, 0.5 ) );\nvisibility += texture2D( occlusionMap, vec2( 0.9, 0.9 ) );\nvisibility += texture2D( occlusionMap, vec2( 0.5, 0.9 ) );\nvisibility += texture2D( occlusionMap, vec2( 0.1, 0.9 ) );\nvisibility += texture2D( occlusionMap, vec2( 0.1, 0.5 ) );\nvisibility += texture2D( occlusionMap, vec2( 0.5, 0.5 ) );\nvVisibility =        visibility.r / 9.0;\nvVisibility *= 1.0 - visibility.g / 9.0;\nvVisibility *=       visibility.b / 9.0;\nvVisibility *= 1.0 - visibility.a / 9.0;\npos.x = cos( rotation ) * position.x - sin( rotation ) * position.y;\npos.y = sin( rotation ) * position.x + cos( rotation ) * position.y;\n}\ngl_Position = vec4( ( pos * scale + screenPosition.xy ).xy, screenPosition.z, 1.0 );\n}",
                            fragmentShader: "uniform lowp int renderType;\nuniform sampler2D map;\nuniform float opacity;\nuniform vec3 color;\nvarying vec2 vUV;\nvarying float vVisibility;\nvoid main() {\nif ( renderType == 0 ) {\ngl_FragColor = vec4( 1.0, 0.0, 1.0, 0.0 );\n} else if ( renderType == 1 ) {\ngl_FragColor = texture2D( map, vUV );\n} else {\nvec4 texture = texture2D( map, vUV );\ntexture.a *= opacity * vVisibility;\ngl_FragColor = texture;\ngl_FragColor.rgb *= color;\n}\n}"
                        },
                        F = s.createProgram(),
                        G = s.createShader(s.FRAGMENT_SHADER),
                        H = s.createShader(s.VERTEX_SHADER),
                        I = "precision " + a.getPrecision() + " float;\n";
                    s.shaderSource(G, I + A.fragmentShader), s.shaderSource(H, I + A.vertexShader), s.compileShader(G), s.compileShader(H), s.attachShader(F, G), s.attachShader(F, H), s.linkProgram(F), p = F, k = s.getAttribLocation(p, "position"), l = s.getAttribLocation(p, "uv"), c = s.getUniformLocation(p, "renderType"), d = s.getUniformLocation(p, "map"), e = s.getUniformLocation(p, "occlusionMap"), f = s.getUniformLocation(p, "opacity"), g = s.getUniformLocation(p, "color"), h = s.getUniformLocation(p, "scale"), i = s.getUniformLocation(p, "rotation"), j = s.getUniformLocation(p, "screenPosition")
                }
                for (s.useProgram(p), t.initAttributes(), t.enableAttribute(k), t.enableAttribute(l), t.disableUnusedAttributes(), s.uniform1i(e, 0), s.uniform1i(d, 1), s.bindBuffer(s.ARRAY_BUFFER, m), s.vertexAttribPointer(k, 2, s.FLOAT, !1, 16, 0), s.vertexAttribPointer(l, 2, s.FLOAT, !1, 16, 8), s.bindBuffer(s.ELEMENT_ARRAY_BUFFER, n), t.disable(s.CULL_FACE), t.setDepthWrite(!1), F = 0, G = b.length; G > F; F++)
                    if (A = 16 / w.w, B.set(A * x, A), H = b[F], u.set(H.matrixWorld.elements[12], H.matrixWorld.elements[13], H.matrixWorld.elements[14]), u.applyMatrix4(v.matrixWorldInverse), u.applyProjection(v.projectionMatrix), C.copy(u), D.x = w.x + C.x * y + y - 8, D.y = w.y + C.y * z + z - 8, !0 === E.containsPoint(D)) {
                        t.activeTexture(s.TEXTURE0), t.bindTexture(s.TEXTURE_2D, null), t.activeTexture(s.TEXTURE1), t.bindTexture(s.TEXTURE_2D, q), s.copyTexImage2D(s.TEXTURE_2D, 0, s.RGB, D.x, D.y, 16, 16, 0), s.uniform1i(c, 0), s.uniform2f(h, B.x, B.y), s.uniform3f(j, C.x, C.y, C.z), t.disable(s.BLEND), t.enable(s.DEPTH_TEST), s.drawElements(s.TRIANGLES, 6, s.UNSIGNED_SHORT, 0), t.activeTexture(s.TEXTURE0), t.bindTexture(s.TEXTURE_2D, r), s.copyTexImage2D(s.TEXTURE_2D, 0, s.RGBA, D.x, D.y, 16, 16, 0), s.uniform1i(c, 1), t.disable(s.DEPTH_TEST), t.activeTexture(s.TEXTURE1), t.bindTexture(s.TEXTURE_2D, q), s.drawElements(s.TRIANGLES, 6, s.UNSIGNED_SHORT, 0), H.positionScreen.copy(C), H.customUpdateCallback ? H.customUpdateCallback(H) : H.updateLensFlares(), s.uniform1i(c, 2), t.enable(s.BLEND);
                        for (var I = 0, J = H.lensFlares.length; J > I; I++) {
                            var K = H.lensFlares[I];.001 < K.opacity && .001 < K.scale && (C.x = K.x, C.y = K.y, C.z = K.z, A = K.size * K.scale / w.w, B.x = A * x, B.y = A, s.uniform3f(j, C.x, C.y, C.z), s.uniform2f(h, B.x, B.y), s.uniform1f(i, K.rotation), s.uniform1f(f, K.opacity), s.uniform3f(g, K.color.r, K.color.g, K.color.b), t.setBlending(K.blending, K.blendEquation, K.blendSrc, K.blendDst), a.setTexture2D(K.texture, 1), s.drawElements(s.TRIANGLES, 6, s.UNSIGNED_SHORT, 0))
                        }
                    }
                t.enable(s.CULL_FACE), t.enable(s.DEPTH_TEST), t.setDepthWrite(!0), a.resetGLState()
            }
        }
    }, THREE.SpritePlugin = function(a, b) {
        function c(a, b) {
            return a.renderOrder !== b.renderOrder ? a.renderOrder - b.renderOrder : a.z !== b.z ? b.z - a.z : b.id - a.id
        }
        var d, e, f, g, h, i, j, k, l, m, n, o, p, q, r, s, t, u, v, w, x, y = a.context,
            z = a.state,
            A = new THREE.Vector3,
            B = new THREE.Quaternion,
            C = new THREE.Vector3;
        this.render = function(D, E) {
            if (0 !== b.length) {
                if (void 0 === w) {
                    var F = new Float32Array([-.5, -.5, 0, 0, .5, -.5, 1, 0, .5, .5, 1, 1, -.5, .5, 0, 1]),
                        G = new Uint16Array([0, 1, 2, 0, 2, 3]);
                    u = y.createBuffer(), v = y.createBuffer(), y.bindBuffer(y.ARRAY_BUFFER, u), y.bufferData(y.ARRAY_BUFFER, F, y.STATIC_DRAW), y.bindBuffer(y.ELEMENT_ARRAY_BUFFER, v), y.bufferData(y.ELEMENT_ARRAY_BUFFER, G, y.STATIC_DRAW);
                    var F = y.createProgram(),
                        G = y.createShader(y.VERTEX_SHADER),
                        H = y.createShader(y.FRAGMENT_SHADER);
                    y.shaderSource(G, ["precision " + a.getPrecision() + " float;", "uniform mat4 modelViewMatrix;\nuniform mat4 projectionMatrix;\nuniform float rotation;\nuniform vec2 scale;\nuniform vec2 uvOffset;\nuniform vec2 uvScale;\nattribute vec2 position;\nattribute vec2 uv;\nvarying vec2 vUV;\nvoid main() {\nvUV = uvOffset + uv * uvScale;\nvec2 alignedPosition = position * scale;\nvec2 rotatedPosition;\nrotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;\nrotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;\nvec4 finalPosition;\nfinalPosition = modelViewMatrix * vec4( 0.0, 0.0, 0.0, 1.0 );\nfinalPosition.xy += rotatedPosition;\nfinalPosition = projectionMatrix * finalPosition;\ngl_Position = finalPosition;\n}"].join("\n")), y.shaderSource(H, ["precision " + a.getPrecision() + " float;", "uniform vec3 color;\nuniform sampler2D map;\nuniform float opacity;\nuniform int fogType;\nuniform vec3 fogColor;\nuniform float fogDensity;\nuniform float fogNear;\nuniform float fogFar;\nuniform float alphaTest;\nvarying vec2 vUV;\nvoid main() {\nvec4 texture = texture2D( map, vUV );\nif ( texture.a < alphaTest ) discard;\ngl_FragColor = vec4( color * texture.xyz, texture.a * opacity );\nif ( fogType > 0 ) {\nfloat depth = gl_FragCoord.z / gl_FragCoord.w;\nfloat fogFactor = 0.0;\nif ( fogType == 1 ) {\nfogFactor = smoothstep( fogNear, fogFar, depth );\n} else {\nconst float LOG2 = 1.442695;\nfogFactor = exp2( - fogDensity * fogDensity * depth * depth * LOG2 );\nfogFactor = 1.0 - clamp( fogFactor, 0.0, 1.0 );\n}\ngl_FragColor = mix( gl_FragColor, vec4( fogColor, gl_FragColor.w ), fogFactor );\n}\n}"].join("\n")), y.compileShader(G), y.compileShader(H), y.attachShader(F, G), y.attachShader(F, H), y.linkProgram(F), w = F, s = y.getAttribLocation(w, "position"), t = y.getAttribLocation(w, "uv"), d = y.getUniformLocation(w, "uvOffset"), e = y.getUniformLocation(w, "uvScale"), f = y.getUniformLocation(w, "rotation"), g = y.getUniformLocation(w, "scale"), h = y.getUniformLocation(w, "color"), i = y.getUniformLocation(w, "map"), j = y.getUniformLocation(w, "opacity"), k = y.getUniformLocation(w, "modelViewMatrix"), l = y.getUniformLocation(w, "projectionMatrix"), m = y.getUniformLocation(w, "fogType"), n = y.getUniformLocation(w, "fogDensity"), o = y.getUniformLocation(w, "fogNear"), p = y.getUniformLocation(w, "fogFar"), q = y.getUniformLocation(w, "fogColor"), r = y.getUniformLocation(w, "alphaTest"), F = document.createElementNS("http://www.w3.org/1999/xhtml", "canvas"), F.width = 8, F.height = 8, G = F.getContext("2d"), G.fillStyle = "white", G.fillRect(0, 0, 8, 8), x = new THREE.Texture(F), x.needsUpdate = !0
                }
                y.useProgram(w), z.initAttributes(), z.enableAttribute(s), z.enableAttribute(t), z.disableUnusedAttributes(), z.disable(y.CULL_FACE), z.enable(y.BLEND), y.bindBuffer(y.ARRAY_BUFFER, u), y.vertexAttribPointer(s, 2, y.FLOAT, !1, 16, 0), y.vertexAttribPointer(t, 2, y.FLOAT, !1, 16, 8), y.bindBuffer(y.ELEMENT_ARRAY_BUFFER, v), y.uniformMatrix4fv(l, !1, E.projectionMatrix.elements), z.activeTexture(y.TEXTURE0), y.uniform1i(i, 0), G = F = 0, (H = D.fog) ? (y.uniform3f(q, H.color.r, H.color.g, H.color.b), H instanceof THREE.Fog ? (y.uniform1f(o, H.near), y.uniform1f(p, H.far), y.uniform1i(m, 1), G = F = 1) : H instanceof THREE.FogExp2 && (y.uniform1f(n, H.density), y.uniform1i(m, 2), G = F = 2)) : (y.uniform1i(m, 0), G = F = 0);
                for (var H = 0, I = b.length; I > H; H++) {
                    var J = b[H];
                    J.modelViewMatrix.multiplyMatrices(E.matrixWorldInverse, J.matrixWorld), J.z = -J.modelViewMatrix.elements[14]
                }
                b.sort(c);
                for (var K = [], H = 0, I = b.length; I > H; H++) {
                    var J = b[H],
                        L = J.material;
                    !1 !== L.visible && (y.uniform1f(r, L.alphaTest), y.uniformMatrix4fv(k, !1, J.modelViewMatrix.elements), J.matrixWorld.decompose(A, B, C), K[0] = C.x, K[1] = C.y, J = 0, D.fog && L.fog && (J = G), F !== J && (y.uniform1i(m, J), F = J), null !== L.map ? (y.uniform2f(d, L.map.offset.x, L.map.offset.y), y.uniform2f(e, L.map.repeat.x, L.map.repeat.y)) : (y.uniform2f(d, 0, 0), y.uniform2f(e, 1, 1)), y.uniform1f(j, L.opacity), y.uniform3f(h, L.color.r, L.color.g, L.color.b), y.uniform1f(f, L.rotation), y.uniform2fv(g, K), z.setBlending(L.blending, L.blendEquation, L.blendSrc, L.blendDst), z.setDepthTest(L.depthTest), z.setDepthWrite(L.depthWrite), L.map ? a.setTexture2D(L.map, 0) : a.setTexture2D(x, 0), y.drawElements(y.TRIANGLES, 6, y.UNSIGNED_SHORT, 0))
                }
                z.enable(y.CULL_FACE), a.resetGLState()
            }
        }
    }, Object.assign(THREE, {
        Face4: function(a, b, c, d, e, f, g) {
            return console.warn("THREE.Face4 has been removed. A THREE.Face3 will be created instead."), new THREE.Face3(a, b, c, e, f, g)
        },
        LineStrip: 0,
        LinePieces: 1,
        MeshFaceMaterial: THREE.MultiMaterial,
        PointCloud: function(a, b) {
            return console.warn("THREE.PointCloud has been renamed to THREE.Points."), new THREE.Points(a, b)
        },
        Particle: THREE.Sprite,
        ParticleSystem: function(a, b) {
            return console.warn("THREE.ParticleSystem has been renamed to THREE.Points."), new THREE.Points(a, b)
        },
        PointCloudMaterial: function(a) {
            return console.warn("THREE.PointCloudMaterial has been renamed to THREE.PointsMaterial."), new THREE.PointsMaterial(a)
        },
        ParticleBasicMaterial: function(a) {
            return console.warn("THREE.ParticleBasicMaterial has been renamed to THREE.PointsMaterial."), new THREE.PointsMaterial(a)
        },
        ParticleSystemMaterial: function(a) {
            return console.warn("THREE.ParticleSystemMaterial has been renamed to THREE.PointsMaterial."), new THREE.PointsMaterial(a)
        },
        Vertex: function(a, b, c) {
            return console.warn("THREE.Vertex has been removed. Use THREE.Vector3 instead."), new THREE.Vector3(a, b, c)
        }
    }), Object.assign(THREE.Box2.prototype, {
        empty: function() {
            return console.warn("THREE.Box2: .empty() has been renamed to .isEmpty()."), this.isEmpty()
        },
        isIntersectionBox: function(a) {
            return console.warn("THREE.Box2: .isIntersectionBox() has been renamed to .intersectsBox()."), this.intersectsBox(a)
        }
    }), Object.assign(THREE.Box3.prototype, {
        empty: function() {
            return console.warn("THREE.Box3: .empty() has been renamed to .isEmpty()."), this.isEmpty()
        },
        isIntersectionBox: function(a) {
            return console.warn("THREE.Box3: .isIntersectionBox() has been renamed to .intersectsBox()."), this.intersectsBox(a)
        },
        isIntersectionSphere: function(a) {
            return console.warn("THREE.Box3: .isIntersectionSphere() has been renamed to .intersectsSphere()."), this.intersectsSphere(a)
        }
    }), Object.assign(THREE.Matrix3.prototype, {
        multiplyVector3: function(a) {
            return console.warn("THREE.Matrix3: .multiplyVector3() has been removed. Use vector.applyMatrix3( matrix ) instead."), a.applyMatrix3(this)
        },
        multiplyVector3Array: function(a) {
            return console.warn("THREE.Matrix3: .multiplyVector3Array() has been renamed. Use matrix.applyToVector3Array( array ) instead."), this.applyToVector3Array(a)
        }
    }), Object.assign(THREE.Matrix4.prototype, {
        extractPosition: function(a) {
            return console.warn("THREE.Matrix4: .extractPosition() has been renamed to .copyPosition()."), this.copyPosition(a)
        },
        setRotationFromQuaternion: function(a) {
            return console.warn("THREE.Matrix4: .setRotationFromQuaternion() has been renamed to .makeRotationFromQuaternion()."), this.makeRotationFromQuaternion(a)
        },
        multiplyVector3: function(a) {
            return console.warn("THREE.Matrix4: .multiplyVector3() has been removed. Use vector.applyMatrix4( matrix ) or vector.applyProjection( matrix ) instead."), a.applyProjection(this)
        },
        multiplyVector4: function(a) {
            return console.warn("THREE.Matrix4: .multiplyVector4() has been removed. Use vector.applyMatrix4( matrix ) instead."), a.applyMatrix4(this)
        },
        multiplyVector3Array: function(a) {
            return console.warn("THREE.Matrix4: .multiplyVector3Array() has been renamed. Use matrix.applyToVector3Array( array ) instead."), this.applyToVector3Array(a)
        },
        rotateAxis: function(a) {
            console.warn("THREE.Matrix4: .rotateAxis() has been removed. Use Vector3.transformDirection( matrix ) instead."), a.transformDirection(this)
        },
        crossVector: function(a) {
            return console.warn("THREE.Matrix4: .crossVector() has been removed. Use vector.applyMatrix4( matrix ) instead."), a.applyMatrix4(this)
        },
        translate: function(a) {
            console.error("THREE.Matrix4: .translate() has been removed.")
        },
        rotateX: function(a) {
            console.error("THREE.Matrix4: .rotateX() has been removed.")
        },
        rotateY: function(a) {
            console.error("THREE.Matrix4: .rotateY() has been removed.")
        },
        rotateZ: function(a) {
            console.error("THREE.Matrix4: .rotateZ() has been removed.")
        },
        rotateByAxis: function(a, b) {
            console.error("THREE.Matrix4: .rotateByAxis() has been removed.")
        }
    }), Object.assign(THREE.Plane.prototype, {
        isIntersectionLine: function(a) {
            return console.warn("THREE.Plane: .isIntersectionLine() has been renamed to .intersectsLine()."), this.intersectsLine(a)
        }
    }), Object.assign(THREE.Quaternion.prototype, {
        multiplyVector3: function(a) {
            return console.warn("THREE.Quaternion: .multiplyVector3() has been removed. Use is now vector.applyQuaternion( quaternion ) instead."), a.applyQuaternion(this)
        }
    }), Object.assign(THREE.Ray.prototype, {
        isIntersectionBox: function(a) {
            return console.warn("THREE.Ray: .isIntersectionBox() has been renamed to .intersectsBox()."), this.intersectsBox(a)
        },
        isIntersectionPlane: function(a) {
            return console.warn("THREE.Ray: .isIntersectionPlane() has been renamed to .intersectsPlane()."), this.intersectsPlane(a)
        },
        isIntersectionSphere: function(a) {
            return console.warn("THREE.Ray: .isIntersectionSphere() has been renamed to .intersectsSphere()."), this.intersectsSphere(a)
        }
    }), Object.assign(THREE.Vector3.prototype, {
        setEulerFromRotationMatrix: function() {
            console.error("THREE.Vector3: .setEulerFromRotationMatrix() has been removed. Use Euler.setFromRotationMatrix() instead.")
        },
        setEulerFromQuaternion: function() {
            console.error("THREE.Vector3: .setEulerFromQuaternion() has been removed. Use Euler.setFromQuaternion() instead.")
        },
        getPositionFromMatrix: function(a) {
            return console.warn("THREE.Vector3: .getPositionFromMatrix() has been renamed to .setFromMatrixPosition()."), this.setFromMatrixPosition(a)
        },
        getScaleFromMatrix: function(a) {
            return console.warn("THREE.Vector3: .getScaleFromMatrix() has been renamed to .setFromMatrixScale()."), this.setFromMatrixScale(a)
        },
        getColumnFromMatrix: function(a, b) {
            return console.warn("THREE.Vector3: .getColumnFromMatrix() has been renamed to .setFromMatrixColumn()."), this.setFromMatrixColumn(b, a)
        }
    }), Object.assign(THREE.Object3D.prototype, {
        getChildByName: function(a) {
            return console.warn("THREE.Object3D: .getChildByName() has been renamed to .getObjectByName()."), this.getObjectByName(a)
        },
        renderDepth: function(a) {
            console.warn("THREE.Object3D: .renderDepth has been removed. Use .renderOrder, instead.")
        },
        translate: function(a, b) {
            return console.warn("THREE.Object3D: .translate() has been removed. Use .translateOnAxis( axis, distance ) instead."), this.translateOnAxis(b, a)
        }
    }), Object.defineProperties(THREE.Object3D.prototype, {
        eulerOrder: {
            get: function() {
                return console.warn("THREE.Object3D: .eulerOrder is now .rotation.order."), this.rotation.order
            },
            set: function(a) {
                console.warn("THREE.Object3D: .eulerOrder is now .rotation.order."), this.rotation.order = a
            }
        },
        useQuaternion: {
            get: function() {
                console.warn("THREE.Object3D: .useQuaternion has been removed. The library now uses quaternions by default.")
            },
            set: function(a) {
                console.warn("THREE.Object3D: .useQuaternion has been removed. The library now uses quaternions by default.")
            }
        }
    }), Object.defineProperties(THREE.LOD.prototype, {
        objects: {
            get: function() {
                return console.warn("THREE.LOD: .objects has been renamed to .levels."), this.levels
            }
        }
    }), THREE.PerspectiveCamera.prototype.setLens = function(a, b) {
        console.warn("THREE.PerspectiveCamera.setLens is deprecated. Use .setFocalLength and .filmGauge for a photographic setup."), void 0 !== b && (this.filmGauge = b), this.setFocalLength(a)
    }, Object.defineProperties(THREE.Light.prototype, {
        onlyShadow: {
            set: function(a) {
                console.warn("THREE.Light: .onlyShadow has been removed.")
            }
        },
        shadowCameraFov: {
            set: function(a) {
                console.warn("THREE.Light: .shadowCameraFov is now .shadow.camera.fov."), this.shadow.camera.fov = a
            }
        },
        shadowCameraLeft: {
            set: function(a) {
                console.warn("THREE.Light: .shadowCameraLeft is now .shadow.camera.left."), this.shadow.camera.left = a
            }
        },
        shadowCameraRight: {
            set: function(a) {
                console.warn("THREE.Light: .shadowCameraRight is now .shadow.camera.right."), this.shadow.camera.right = a
            }
        },
        shadowCameraTop: {
            set: function(a) {
                console.warn("THREE.Light: .shadowCameraTop is now .shadow.camera.top."), this.shadow.camera.top = a
            }
        },
        shadowCameraBottom: {
            set: function(a) {
                console.warn("THREE.Light: .shadowCameraBottom is now .shadow.camera.bottom."), this.shadow.camera.bottom = a
            }
        },
        shadowCameraNear: {
            set: function(a) {
                console.warn("THREE.Light: .shadowCameraNear is now .shadow.camera.near."), this.shadow.camera.near = a
            }
        },
        shadowCameraFar: {
            set: function(a) {
                console.warn("THREE.Light: .shadowCameraFar is now .shadow.camera.far."), this.shadow.camera.far = a
            }
        },
        shadowCameraVisible: {
            set: function(a) {
                console.warn("THREE.Light: .shadowCameraVisible has been removed. Use new THREE.CameraHelper( light.shadow.camera ) instead.")
            }
        },
        shadowBias: {
            set: function(a) {
                console.warn("THREE.Light: .shadowBias is now .shadow.bias."), this.shadow.bias = a
            }
        },
        shadowDarkness: {
            set: function(a) {
                console.warn("THREE.Light: .shadowDarkness has been removed.")
            }
        },
        shadowMapWidth: {
            set: function(a) {
                console.warn("THREE.Light: .shadowMapWidth is now .shadow.mapSize.width."), this.shadow.mapSize.width = a
            }
        },
        shadowMapHeight: {
            set: function(a) {
                console.warn("THREE.Light: .shadowMapHeight is now .shadow.mapSize.height."), this.shadow.mapSize.height = a
            }
        }
    }), Object.defineProperties(THREE.BufferAttribute.prototype, {
        length: {
            get: function() {
                return console.warn("THREE.BufferAttribute: .length has been deprecated. Please use .count."), this.array.length
            }
        }
    }), Object.assign(THREE.BufferGeometry.prototype, {
        addIndex: function(a) {
            console.warn("THREE.BufferGeometry: .addIndex() has been renamed to .setIndex()."), this.setIndex(a)
        },
        addDrawCall: function(a, b, c) {
            void 0 !== c && console.warn("THREE.BufferGeometry: .addDrawCall() no longer supports indexOffset."), console.warn("THREE.BufferGeometry: .addDrawCall() is now .addGroup()."), this.addGroup(a, b)
        },
        clearDrawCalls: function() {
            console.warn("THREE.BufferGeometry: .clearDrawCalls() is now .clearGroups()."), this.clearGroups()
        },
        computeTangents: function() {
            console.warn("THREE.BufferGeometry: .computeTangents() has been removed.")
        },
        computeOffsets: function() {
            console.warn("THREE.BufferGeometry: .computeOffsets() has been removed.")
        }
    }), Object.defineProperties(THREE.BufferGeometry.prototype, {
        drawcalls: {
            get: function() {
                return console.error("THREE.BufferGeometry: .drawcalls has been renamed to .groups."), this.groups
            }
        },
        offsets: {
            get: function() {
                return console.warn("THREE.BufferGeometry: .offsets has been renamed to .groups."), this.groups
            }
        }
    }), Object.defineProperties(THREE.Material.prototype, {
        wrapAround: {
            get: function() {
                console.warn("THREE." + this.type + ": .wrapAround has been removed.")
            },
            set: function(a) {
                console.warn("THREE." + this.type + ": .wrapAround has been removed.")
            }
        },
        wrapRGB: {
            get: function() {
                return console.warn("THREE." + this.type + ": .wrapRGB has been removed."), new THREE.Color
            }
        }
    }), Object.defineProperties(THREE.MeshPhongMaterial.prototype, {
        metal: {
            get: function() {
                return console.warn("THREE.MeshPhongMaterial: .metal has been removed. Use THREE.MeshStandardMaterial instead."), !1
            },
            set: function(a) {
                console.warn("THREE.MeshPhongMaterial: .metal has been removed. Use THREE.MeshStandardMaterial instead")
            }
        }
    }), Object.defineProperties(THREE.ShaderMaterial.prototype, {
        derivatives: {
            get: function() {
                return console.warn("THREE.ShaderMaterial: .derivatives has been moved to .extensions.derivatives."), this.extensions.derivatives
            },
            set: function(a) {
                console.warn("THREE. ShaderMaterial: .derivatives has been moved to .extensions.derivatives."), this.extensions.derivatives = a
            }
        }
    }), THREE.EventDispatcher.prototype = Object.assign(Object.create({
        constructor: THREE.EventDispatcher,
        apply: function(a) {
            console.warn("THREE.EventDispatcher: .apply is deprecated, just inherit or Object.assign the prototype to mix-in."), Object.assign(a, this)
        }
    }), THREE.EventDispatcher.prototype), Object.assign(THREE.WebGLRenderer.prototype, {
        supportsFloatTextures: function() {
            return console.warn("THREE.WebGLRenderer: .supportsFloatTextures() is now .extensions.get( 'OES_texture_float' )."), this.extensions.get("OES_texture_float")
        },
        supportsHalfFloatTextures: function() {
            return console.warn("THREE.WebGLRenderer: .supportsHalfFloatTextures() is now .extensions.get( 'OES_texture_half_float' )."), this.extensions.get("OES_texture_half_float")
        },
        supportsStandardDerivatives: function() {
            return console.warn("THREE.WebGLRenderer: .supportsStandardDerivatives() is now .extensions.get( 'OES_standard_derivatives' )."), this.extensions.get("OES_standard_derivatives")
        },
        supportsCompressedTextureS3TC: function() {
            return console.warn("THREE.WebGLRenderer: .supportsCompressedTextureS3TC() is now .extensions.get( 'WEBGL_compressed_texture_s3tc' )."), this.extensions.get("WEBGL_compressed_texture_s3tc")
        },
        supportsCompressedTexturePVRTC: function() {
            return console.warn("THREE.WebGLRenderer: .supportsCompressedTexturePVRTC() is now .extensions.get( 'WEBGL_compressed_texture_pvrtc' )."), this.extensions.get("WEBGL_compressed_texture_pvrtc")
        },
        supportsBlendMinMax: function() {
            return console.warn("THREE.WebGLRenderer: .supportsBlendMinMax() is now .extensions.get( 'EXT_blend_minmax' )."), this.extensions.get("EXT_blend_minmax")
        },
        supportsVertexTextures: function() {
            return this.capabilities.vertexTextures
        },
        supportsInstancedArrays: function() {
            return console.warn("THREE.WebGLRenderer: .supportsInstancedArrays() is now .extensions.get( 'ANGLE_instanced_arrays' )."), this.extensions.get("ANGLE_instanced_arrays")
        },
        enableScissorTest: function(a) {
            console.warn("THREE.WebGLRenderer: .enableScissorTest() is now .setScissorTest()."), this.setScissorTest(a)
        },
        initMaterial: function() {
            console.warn("THREE.WebGLRenderer: .initMaterial() has been removed.")
        },
        addPrePlugin: function() {
            console.warn("THREE.WebGLRenderer: .addPrePlugin() has been removed.")
        },
        addPostPlugin: function() {
            console.warn("THREE.WebGLRenderer: .addPostPlugin() has been removed.")
        },
        updateShadowMap: function() {
            console.warn("THREE.WebGLRenderer: .updateShadowMap() has been removed.")
        }
    }), Object.defineProperties(THREE.WebGLRenderer.prototype, {
        shadowMapEnabled: {
            get: function() {
                return this.shadowMap.enabled
            },
            set: function(a) {
                console.warn("THREE.WebGLRenderer: .shadowMapEnabled is now .shadowMap.enabled."), this.shadowMap.enabled = a
            }
        },
        shadowMapType: {
            get: function() {
                return this.shadowMap.type
            },
            set: function(a) {
                console.warn("THREE.WebGLRenderer: .shadowMapType is now .shadowMap.type."), this.shadowMap.type = a
            }
        },
        shadowMapCullFace: {
            get: function() {
                return this.shadowMap.cullFace
            },
            set: function(a) {
                console.warn("THREE.WebGLRenderer: .shadowMapCullFace is now .shadowMap.cullFace."), this.shadowMap.cullFace = a
            }
        }
    }), Object.defineProperties(THREE.WebGLShadowMap.prototype, {
        cullFace: {
            get: function() {
                return this.renderReverseSided ? THREE.CullFaceFront : THREE.CullFaceBack
            },
            set: function(a) {
                a = a !== THREE.CullFaceBack, console.warn("WebGLRenderer: .shadowMap.cullFace is deprecated. Set .shadowMap.renderReverseSided to " + a + "."), this.renderReverseSided = a
            }
        }
    }), Object.defineProperties(THREE.WebGLRenderTarget.prototype, {
        wrapS: {
            get: function() {
                return console.warn("THREE.WebGLRenderTarget: .wrapS is now .texture.wrapS."), this.texture.wrapS
            },
            set: function(a) {
                console.warn("THREE.WebGLRenderTarget: .wrapS is now .texture.wrapS."), this.texture.wrapS = a
            }
        },
        wrapT: {
            get: function() {
                return console.warn("THREE.WebGLRenderTarget: .wrapT is now .texture.wrapT."),
                    this.texture.wrapT
            },
            set: function(a) {
                console.warn("THREE.WebGLRenderTarget: .wrapT is now .texture.wrapT."), this.texture.wrapT = a
            }
        },
        magFilter: {
            get: function() {
                return console.warn("THREE.WebGLRenderTarget: .magFilter is now .texture.magFilter."), this.texture.magFilter
            },
            set: function(a) {
                console.warn("THREE.WebGLRenderTarget: .magFilter is now .texture.magFilter."), this.texture.magFilter = a
            }
        },
        minFilter: {
            get: function() {
                return console.warn("THREE.WebGLRenderTarget: .minFilter is now .texture.minFilter."), this.texture.minFilter
            },
            set: function(a) {
                console.warn("THREE.WebGLRenderTarget: .minFilter is now .texture.minFilter."), this.texture.minFilter = a
            }
        },
        anisotropy: {
            get: function() {
                return console.warn("THREE.WebGLRenderTarget: .anisotropy is now .texture.anisotropy."), this.texture.anisotropy
            },
            set: function(a) {
                console.warn("THREE.WebGLRenderTarget: .anisotropy is now .texture.anisotropy."), this.texture.anisotropy = a
            }
        },
        offset: {
            get: function() {
                return console.warn("THREE.WebGLRenderTarget: .offset is now .texture.offset."), this.texture.offset
            },
            set: function(a) {
                console.warn("THREE.WebGLRenderTarget: .offset is now .texture.offset."), this.texture.offset = a
            }
        },
        repeat: {
            get: function() {
                return console.warn("THREE.WebGLRenderTarget: .repeat is now .texture.repeat."), this.texture.repeat
            },
            set: function(a) {
                console.warn("THREE.WebGLRenderTarget: .repeat is now .texture.repeat."), this.texture.repeat = a
            }
        },
        format: {
            get: function() {
                return console.warn("THREE.WebGLRenderTarget: .format is now .texture.format."), this.texture.format
            },
            set: function(a) {
                console.warn("THREE.WebGLRenderTarget: .format is now .texture.format."), this.texture.format = a
            }
        },
        type: {
            get: function() {
                return console.warn("THREE.WebGLRenderTarget: .type is now .texture.type."), this.texture.type
            },
            set: function(a) {
                console.warn("THREE.WebGLRenderTarget: .type is now .texture.type."), this.texture.type = a
            }
        },
        generateMipmaps: {
            get: function() {
                return console.warn("THREE.WebGLRenderTarget: .generateMipmaps is now .texture.generateMipmaps."), this.texture.generateMipmaps
            },
            set: function(a) {
                console.warn("THREE.WebGLRenderTarget: .generateMipmaps is now .texture.generateMipmaps."), this.texture.generateMipmaps = a
            }
        }
    }), Object.assign(THREE.Audio.prototype, {
        load: function(a) {
            console.warn("THREE.Audio: .load has been deprecated. Please use THREE.AudioLoader.");
            var b = this;
            return (new THREE.AudioLoader).load(a, function(a) {
                b.setBuffer(a)
            }), this
        }
    }), Object.assign(THREE.AudioAnalyser.prototype, {
        getData: function(a) {
            return console.warn("THREE.AudioAnalyser: .getData() is now .getFrequencyData()."), this.getFrequencyData()
        }
    }), THREE.GeometryUtils = {
        merge: function(a, b, c) {
            console.warn("THREE.GeometryUtils: .merge() has been moved to Geometry. Use geometry.merge( geometry2, matrix, materialIndexOffset ) instead.");
            var d;
            b instanceof THREE.Mesh && (b.matrixAutoUpdate && b.updateMatrix(), d = b.matrix, b = b.geometry), a.merge(b, d, c)
        },
        center: function(a) {
            return console.warn("THREE.GeometryUtils: .center() has been moved to Geometry. Use geometry.center() instead."), a.center()
        }
    }, THREE.ImageUtils = {
        crossOrigin: void 0,
        loadTexture: function(a, b, c, d) {
            console.warn("THREE.ImageUtils.loadTexture has been deprecated. Use THREE.TextureLoader() instead.");
            var e = new THREE.TextureLoader;
            return e.setCrossOrigin(this.crossOrigin), a = e.load(a, c, void 0, d), b && (a.mapping = b), a
        },
        loadTextureCube: function(a, b, c, d) {
            console.warn("THREE.ImageUtils.loadTextureCube has been deprecated. Use THREE.CubeTextureLoader() instead.");
            var e = new THREE.CubeTextureLoader;
            return e.setCrossOrigin(this.crossOrigin), a = e.load(a, c, void 0, d), b && (a.mapping = b), a
        },
        loadCompressedTexture: function() {
            console.error("THREE.ImageUtils.loadCompressedTexture has been removed. Use THREE.DDSLoader instead.")
        },
        loadCompressedTextureCube: function() {
            console.error("THREE.ImageUtils.loadCompressedTextureCube has been removed. Use THREE.DDSLoader instead.")
        }
    }, THREE.Projector = function() {
        console.error("THREE.Projector has been moved to /examples/js/renderers/Projector.js."), this.projectVector = function(a, b) {
            console.warn("THREE.Projector: .projectVector() is now vector.project()."), a.project(b)
        }, this.unprojectVector = function(a, b) {
            console.warn("THREE.Projector: .unprojectVector() is now vector.unproject()."), a.unproject(b)
        }, this.pickingRay = function(a, b) {
            console.error("THREE.Projector: .pickingRay() is now raycaster.setFromCamera().")
        }
    }, THREE.CanvasRenderer = function() {
        console.error("THREE.CanvasRenderer has been moved to /examples/js/renderers/CanvasRenderer.js"), this.domElement = document.createElementNS("http://www.w3.org/1999/xhtml", "canvas"), this.clear = function() {}, this.render = function() {}, this.setClearColor = function() {}, this.setSize = function() {}
    }, THREE.CurveUtils = {
        tangentQuadraticBezier: function(a, b, c, d) {
            return 2 * (1 - a) * (c - b) + 2 * a * (d - c)
        },
        tangentCubicBezier: function(a, b, c, d, e) {
            return -3 * b * (1 - a) * (1 - a) + 3 * c * (1 - a) * (1 - a) - 6 * a * c * (1 - a) + 6 * a * d * (1 - a) - 3 * a * a * d + 3 * a * a * e
        },
        tangentSpline: function(a, b, c, d, e) {
            return 6 * a * a - 6 * a + (3 * a * a - 4 * a + 1) + (-6 * a * a + 6 * a) + (3 * a * a - 2 * a)
        },
        interpolate: function(a, b, c, d, e) {
            a = .5 * (c - a), d = .5 * (d - b);
            var f = e * e;
            return (2 * b - 2 * c + a + d) * e * f + (-3 * b + 3 * c - 2 * a - d) * f + a * e + b
        }
    }, THREE.SceneUtils = {
        createMultiMaterialObject: function(a, b) {
            for (var c = new THREE.Group, d = 0, e = b.length; e > d; d++) c.add(new THREE.Mesh(a, b[d]));
            return c
        },
        detach: function(a, b, c) {
            a.applyMatrix(b.matrixWorld), b.remove(a), c.add(a)
        },
        attach: function(a, b, c) {
            var d = new THREE.Matrix4;
            d.getInverse(c.matrixWorld), a.applyMatrix(d), b.remove(a), c.add(a)
        }
    }, THREE.ShapeUtils = {
        area: function(a) {
            for (var b = a.length, c = 0, d = b - 1, e = 0; b > e; d = e++) c += a[d].x * a[e].y - a[e].x * a[d].y;
            return .5 * c
        },
        triangulate: function() {
            return function(a, b) {
                var c = a.length;
                if (3 > c) return null;
                var d, e, f, g = [],
                    h = [],
                    i = [];
                if (0 < THREE.ShapeUtils.area(a))
                    for (e = 0; c > e; e++) h[e] = e;
                else
                    for (e = 0; c > e; e++) h[e] = c - 1 - e;
                var j = 2 * c;
                for (e = c - 1; c > 2;) {
                    if (0 >= j--) {
                        console.warn("THREE.ShapeUtils: Unable to triangulate polygon! in triangulate()");
                        break
                    }
                    d = e, d >= c && (d = 0), e = d + 1, e >= c && (e = 0), f = e + 1, f >= c && (f = 0);
                    var k;
                    a: {
                        var l = k = void 0,
                            m = void 0,
                            n = void 0,
                            o = void 0,
                            p = void 0,
                            q = void 0,
                            r = void 0,
                            s = void 0,
                            l = a[h[d]].x,
                            m = a[h[d]].y,
                            n = a[h[e]].x,
                            o = a[h[e]].y,
                            p = a[h[f]].x,
                            q = a[h[f]].y;
                        if (Number.EPSILON > (n - l) * (q - m) - (o - m) * (p - l)) k = !1;
                        else {
                            var t = void 0,
                                u = void 0,
                                v = void 0,
                                w = void 0,
                                x = void 0,
                                y = void 0,
                                z = void 0,
                                A = void 0,
                                B = void 0,
                                C = void 0,
                                B = A = z = s = r = void 0,
                                t = p - n,
                                u = q - o,
                                v = l - p,
                                w = m - q,
                                x = n - l,
                                y = o - m;
                            for (k = 0; c > k; k++)
                                if (r = a[h[k]].x, s = a[h[k]].y, !(r === l && s === m || r === n && s === o || r === p && s === q) && (z = r - l, A = s - m, B = r - n, C = s - o, r -= p, s -= q, B = t * C - u * B, z = x * A - y * z, A = v * s - w * r, B >= -Number.EPSILON && A >= -Number.EPSILON && z >= -Number.EPSILON)) {
                                    k = !1;
                                    break a
                                }
                            k = !0
                        }
                    }
                    if (k) {
                        for (g.push([a[h[d]], a[h[e]], a[h[f]]]), i.push([h[d], h[e], h[f]]), d = e, f = e + 1; c > f; d++, f++) h[d] = h[f];
                        c--, j = 2 * c
                    }
                }
                return b ? i : g
            }
        }(),
        triangulateShape: function(a, b) {
            function c(a) {
                var b = a.length;
                b > 2 && a[b - 1].equals(a[0]) && a.pop()
            }

            function d(a, b, c) {
                return a.x !== b.x ? a.x < b.x ? a.x <= c.x && c.x <= b.x : b.x <= c.x && c.x <= a.x : a.y < b.y ? a.y <= c.y && c.y <= b.y : b.y <= c.y && c.y <= a.y
            }

            function e(a, b, c, e, f) {
                var g = b.x - a.x,
                    h = b.y - a.y,
                    i = e.x - c.x,
                    j = e.y - c.y,
                    k = a.x - c.x,
                    l = a.y - c.y,
                    m = h * i - g * j,
                    n = h * k - g * l;
                if (Math.abs(m) > Number.EPSILON) {
                    if (m > 0) {
                        if (0 > n || n > m) return [];
                        if (i = j * k - i * l, 0 > i || i > m) return []
                    } else {
                        if (n > 0 || m > n) return [];
                        if (i = j * k - i * l, i > 0 || m > i) return []
                    }
                    return 0 === i ? !f || 0 !== n && n !== m ? [a] : [] : i === m ? !f || 0 !== n && n !== m ? [b] : [] : 0 === n ? [c] : n === m ? [e] : (f = i / m, [{
                        x: a.x + f * g,
                        y: a.y + f * h
                    }])
                }
                return 0 !== n || j * k !== i * l ? [] : (h = 0 === g && 0 === h, i = 0 === i && 0 === j, h && i ? a.x !== c.x || a.y !== c.y ? [] : [a] : h ? d(c, e, a) ? [a] : [] : i ? d(a, b, c) ? [c] : [] : (0 !== g ? (a.x < b.x ? (g = a, i = a.x, h = b, a = b.x) : (g = b, i = b.x, h = a, a = a.x), c.x < e.x ? (b = c, m = c.x, j = e, c = e.x) : (b = e, m = e.x, j = c, c = c.x)) : (a.y < b.y ? (g = a, i = a.y, h = b, a = b.y) : (g = b, i = b.y, h = a, a = a.y), c.y < e.y ? (b = c, m = c.y, j = e, c = e.y) : (b = e, m = e.y, j = c, c = c.y)), m >= i ? m > a ? [] : a === m ? f ? [] : [b] : c >= a ? [b, h] : [b, j] : i > c ? [] : i === c ? f ? [] : [g] : c >= a ? [g, h] : [g, j]))
            }

            function f(a, b, c, d) {
                var e = b.x - a.x,
                    f = b.y - a.y;
                b = c.x - a.x, c = c.y - a.y;
                var g = d.x - a.x;
                return d = d.y - a.y, a = e * c - f * b, e = e * d - f * g, Math.abs(a) > Number.EPSILON ? (b = g * c - d * b, a > 0 ? e >= 0 && b >= 0 : e >= 0 || b >= 0) : e > 0
            }
            c(a), b.forEach(c);
            var g, h, i, j, k, l = {};
            for (i = a.concat(), g = 0, h = b.length; h > g; g++) Array.prototype.push.apply(i, b[g]);
            for (g = 0, h = i.length; h > g; g++) k = i[g].x + ":" + i[g].y, void 0 !== l[k] && console.warn("THREE.ShapeUtils: Duplicate point", k, g), l[k] = g;
            g = function(a, b) {
                function c(a, b) {
                    var c = q.length - 1,
                        d = a - 1;
                    0 > d && (d = c);
                    var e = a + 1;
                    return e > c && (e = 0), (c = f(q[a], q[d], q[e], h[b])) ? (c = h.length - 1, d = b - 1, 0 > d && (d = c), e = b + 1, e > c && (e = 0), (c = f(h[b], h[d], h[e], q[a])) ? !0 : !1) : !1
                }

                function d(a, b) {
                    var c, d;
                    for (c = 0; c < q.length; c++)
                        if (d = c + 1, d %= q.length, d = e(a, b, q[c], q[d], !0), 0 < d.length) return !0;
                    return !1
                }

                function g(a, c) {
                    var d, f, g, h;
                    for (d = 0; d < r.length; d++)
                        for (f = b[r[d]], g = 0; g < f.length; g++)
                            if (h = g + 1, h %= f.length, h = e(a, c, f[g], f[h], !0), 0 < h.length) return !0;
                    return !1
                }
                var h, i, j, k, l, m, n, o, p, q = a.concat(),
                    r = [],
                    s = [],
                    t = 0;
                for (i = b.length; i > t; t++) r.push(t);
                n = 0;
                for (var u = 2 * r.length; 0 < r.length;) {
                    if (u--, 0 > u) {
                        console.log("Infinite Loop! Holes left:" + r.length + ", Probably Hole outside Shape!");
                        break
                    }
                    for (j = n; j < q.length; j++) {
                        for (k = q[j], i = -1, t = 0; t < r.length; t++)
                            if (l = r[t], m = k.x + ":" + k.y + ":" + l, void 0 === s[m]) {
                                for (h = b[l], o = 0; o < h.length; o++)
                                    if (l = h[o], c(j, o) && !d(k, l) && !g(k, l)) {
                                        i = o, r.splice(t, 1), n = q.slice(0, j + 1), l = q.slice(j), o = h.slice(i), p = h.slice(0, i + 1), q = n.concat(o).concat(p).concat(l), n = j;
                                        break
                                    }
                                if (i >= 0) break;
                                s[m] = !0
                            }
                        if (i >= 0) break
                    }
                }
                return q
            }(a, b);
            var m = THREE.ShapeUtils.triangulate(g, !1);
            for (g = 0, h = m.length; h > g; g++)
                for (j = m[g], i = 0; 3 > i; i++) k = j[i].x + ":" + j[i].y, k = l[k], void 0 !== k && (j[i] = k);
            return m.concat()
        },
        isClockWise: function(a) {
            return 0 > THREE.ShapeUtils.area(a)
        },
        b2: function() {
            return function(a, b, c, d) {
                var e = 1 - a;
                return e * e * b + 2 * (1 - a) * a * c + a * a * d
            }
        }(),
        b3: function() {
            return function(a, b, c, d, e) {
                var f = 1 - a,
                    g = 1 - a;
                return f * f * f * b + 3 * g * g * a * c + 3 * (1 - a) * a * a * d + a * a * a * e
            }
        }()
    }, THREE.Curve = function() {}, THREE.Curve.prototype = {
        constructor: THREE.Curve,
        getPoint: function(a) {
            return console.warn("THREE.Curve: Warning, getPoint() not implemented!"), null
        },
        getPointAt: function(a) {
            return a = this.getUtoTmapping(a), this.getPoint(a)
        },
        getPoints: function(a) {
            a || (a = 5);
            for (var b = [], c = 0; a >= c; c++) b.push(this.getPoint(c / a));
            return b
        },
        getSpacedPoints: function(a) {
            a || (a = 5);
            for (var b = [], c = 0; a >= c; c++) b.push(this.getPointAt(c / a));
            return b
        },
        getLength: function() {
            var a = this.getLengths();
            return a[a.length - 1]
        },
        getLengths: function(a) {
            if (a || (a = this.__arcLengthDivisions ? this.__arcLengthDivisions : 200), this.cacheArcLengths && this.cacheArcLengths.length === a + 1 && !this.needsUpdate) return this.cacheArcLengths;
            this.needsUpdate = !1;
            var b, c, d = [],
                e = this.getPoint(0),
                f = 0;
            for (d.push(0), c = 1; a >= c; c++) b = this.getPoint(c / a), f += b.distanceTo(e), d.push(f), e = b;
            return this.cacheArcLengths = d
        },
        updateArcLengths: function() {
            this.needsUpdate = !0, this.getLengths()
        },
        getUtoTmapping: function(a, b) {
            var c, d = this.getLengths(),
                e = 0,
                f = d.length;
            c = b ? b : a * d[f - 1];
            for (var g, h = 0, i = f - 1; i >= h;)
                if (e = Math.floor(h + (i - h) / 2), g = d[e] - c, 0 > g) h = e + 1;
                else {
                    if (!(g > 0)) {
                        i = e;
                        break
                    }
                    i = e - 1
                }
            return e = i, d[e] === c ? e / (f - 1) : (h = d[e], d = (e + (c - h) / (d[e + 1] - h)) / (f - 1))
        },
        getTangent: function(a) {
            var b = a - 1e-4;
            return a += 1e-4, 0 > b && (b = 0), a > 1 && (a = 1), b = this.getPoint(b), this.getPoint(a).clone().sub(b).normalize()
        },
        getTangentAt: function(a) {
            return a = this.getUtoTmapping(a), this.getTangent(a)
        }
    }, THREE.Curve.create = function(a, b) {
        return a.prototype = Object.create(THREE.Curve.prototype), a.prototype.constructor = a, a.prototype.getPoint = b, a
    }, THREE.CurvePath = function() {
        this.curves = [], this.autoClose = !1
    }, THREE.CurvePath.prototype = Object.assign(Object.create(THREE.Curve.prototype), {
        constructor: THREE.CurvePath,
        add: function(a) {
            this.curves.push(a)
        },
        closePath: function() {
            var a = this.curves[0].getPoint(0),
                b = this.curves[this.curves.length - 1].getPoint(1);
            a.equals(b) || this.curves.push(new THREE.LineCurve(b, a))
        },
        getPoint: function(a) {
            var b = a * this.getLength(),
                c = this.getCurveLengths();
            for (a = 0; a < c.length;) {
                if (c[a] >= b) return b = c[a] - b, a = this.curves[a], c = a.getLength(), a.getPointAt(0 === c ? 0 : 1 - b / c);
                a++
            }
            return null
        },
        getLength: function() {
            var a = this.getCurveLengths();
            return a[a.length - 1]
        },
        updateArcLengths: function() {
            this.needsUpdate = !0, this.cacheLengths = null, this.getLengths()
        },
        getCurveLengths: function() {
            if (this.cacheLengths && this.cacheLengths.length === this.curves.length) return this.cacheLengths;
            for (var a = [], b = 0, c = 0, d = this.curves.length; d > c; c++) b += this.curves[c].getLength(), a.push(b);
            return this.cacheLengths = a
        },
        getSpacedPoints: function(a) {
            a || (a = 40);
            for (var b = [], c = 0; a >= c; c++) b.push(this.getPoint(c / a));
            return this.autoClose && b.push(b[0]), b
        },
        getPoints: function(a) {
            a = a || 12;
            for (var b, c = [], d = 0, e = this.curves; d < e.length; d++)
                for (var f = e[d], f = f.getPoints(f instanceof THREE.EllipseCurve ? 2 * a : f instanceof THREE.LineCurve ? 1 : f instanceof THREE.SplineCurve ? a * f.points.length : a), g = 0; g < f.length; g++) {
                    var h = f[g];
                    b && b.equals(h) || (c.push(h), b = h)
                }
            return this.autoClose && 1 < c.length && !c[c.length - 1].equals(c[0]) && c.push(c[0]), c
        },
        createPointsGeometry: function(a) {
            return a = this.getPoints(a), this.createGeometry(a)
        },
        createSpacedPointsGeometry: function(a) {
            return a = this.getSpacedPoints(a), this.createGeometry(a)
        },
        createGeometry: function(a) {
            for (var b = new THREE.Geometry, c = 0, d = a.length; d > c; c++) {
                var e = a[c];
                b.vertices.push(new THREE.Vector3(e.x, e.y, e.z || 0))
            }
            return b
        }
    }), THREE.Font = function(a) {
        this.data = a
    }, Object.assign(THREE.Font.prototype, {
        generateShapes: function(a, b, c) {
            void 0 === b && (b = 100), void 0 === c && (c = 4);
            var d = this.data;
            a = String(a).split("");
            var e = b / d.resolution,
                f = 0;
            b = [];
            for (var g = 0; g < a.length; g++) {
                var h;
                h = e;
                var i = f,
                    j = d.glyphs[a[g]] || d.glyphs["?"];
                if (j) {
                    var k = new THREE.ShapePath,
                        l = [],
                        m = THREE.ShapeUtils.b2,
                        n = THREE.ShapeUtils.b3,
                        o = void 0,
                        p = void 0,
                        q = p = o = void 0,
                        r = void 0,
                        s = void 0,
                        t = void 0,
                        u = void 0,
                        v = void 0,
                        r = void 0;
                    if (j.o)
                        for (var w = j._cachedOutline || (j._cachedOutline = j.o.split(" ")), x = 0, y = w.length; y > x;) switch (w[x++]) {
                            case "m":
                                o = w[x++] * h + i, p = w[x++] * h, k.moveTo(o, p);
                                break;
                            case "l":
                                o = w[x++] * h + i, p = w[x++] * h, k.lineTo(o, p);
                                break;
                            case "q":
                                if (o = w[x++] * h + i, p = w[x++] * h, s = w[x++] * h + i, t = w[x++] * h, k.quadraticCurveTo(s, t, o, p), r = l[l.length - 1])
                                    for (var q = r.x, r = r.y, z = 1; c >= z; z++) {
                                        var A = z / c;
                                        m(A, q, s, o), m(A, r, t, p)
                                    }
                                break;
                            case "b":
                                if (o = w[x++] * h + i, p = w[x++] * h, s = w[x++] * h + i, t = w[x++] * h, u = w[x++] * h + i, v = w[x++] * h, k.bezierCurveTo(s, t, u, v, o, p), r = l[l.length - 1])
                                    for (q = r.x, r = r.y, z = 1; c >= z; z++) A = z / c, n(A, q, s, u, o), n(A, r, t, v, p)
                        }
                    h = {
                        offset: j.ha * h,
                        path: k
                    }
                } else h = void 0;
                f += h.offset, b.push(h.path)
            }
            for (c = [], d = 0, a = b.length; a > d; d++) Array.prototype.push.apply(c, b[d].toShapes());
            return c
        }
    }), THREE.Path = function(a) {
        THREE.CurvePath.call(this), this.currentPoint = new THREE.Vector2, a && this.fromPoints(a)
    }, THREE.Path.prototype = Object.assign(Object.create(THREE.CurvePath.prototype), {
        constructor: THREE.Path,
        fromPoints: function(a) {
            this.moveTo(a[0].x, a[0].y);
            for (var b = 1, c = a.length; c > b; b++) this.lineTo(a[b].x, a[b].y)
        },
        moveTo: function(a, b) {
            this.currentPoint.set(a, b)
        },
        lineTo: function(a, b) {
            var c = new THREE.LineCurve(this.currentPoint.clone(), new THREE.Vector2(a, b));
            this.curves.push(c), this.currentPoint.set(a, b)
        },
        quadraticCurveTo: function(a, b, c, d) {
            a = new THREE.QuadraticBezierCurve(this.currentPoint.clone(), new THREE.Vector2(a, b), new THREE.Vector2(c, d)), this.curves.push(a), this.currentPoint.set(c, d)
        },
        bezierCurveTo: function(a, b, c, d, e, f) {
            a = new THREE.CubicBezierCurve(this.currentPoint.clone(), new THREE.Vector2(a, b), new THREE.Vector2(c, d), new THREE.Vector2(e, f)), this.curves.push(a), this.currentPoint.set(e, f)
        },
        splineThru: function(a) {
            var b = [this.currentPoint.clone()].concat(a),
                b = new THREE.SplineCurve(b);
            this.curves.push(b), this.currentPoint.copy(a[a.length - 1])
        },
        arc: function(a, b, c, d, e, f) {
            this.absarc(a + this.currentPoint.x, b + this.currentPoint.y, c, d, e, f)
        },
        absarc: function(a, b, c, d, e, f) {
            this.absellipse(a, b, c, c, d, e, f)
        },
        ellipse: function(a, b, c, d, e, f, g, h) {
            this.absellipse(a + this.currentPoint.x, b + this.currentPoint.y, c, d, e, f, g, h)
        },
        absellipse: function(a, b, c, d, e, f, g, h) {
            a = new THREE.EllipseCurve(a, b, c, d, e, f, g, h), 0 < this.curves.length && (b = a.getPoint(0), b.equals(this.currentPoint) || this.lineTo(b.x, b.y)), this.curves.push(a), a = a.getPoint(1), this.currentPoint.copy(a)
        }
    }), THREE.ShapePath = function() {
        this.subPaths = [], this.currentPath = null
    }, THREE.ShapePath.prototype = {
        moveTo: function(a, b) {
            this.currentPath = new THREE.Path, this.subPaths.push(this.currentPath), this.currentPath.moveTo(a, b)
        },
        lineTo: function(a, b) {
            this.currentPath.lineTo(a, b)
        },
        quadraticCurveTo: function(a, b, c, d) {
            this.currentPath.quadraticCurveTo(a, b, c, d)
        },
        bezierCurveTo: function(a, b, c, d, e, f) {
            this.currentPath.bezierCurveTo(a, b, c, d, e, f)
        },
        splineThru: function(a) {
            this.currentPath.splineThru(a)
        },
        toShapes: function(a, b) {
            function c(a) {
                for (var b = [], c = 0, d = a.length; d > c; c++) {
                    var e = a[c],
                        f = new THREE.Shape;
                    f.curves = e.curves, b.push(f)
                }
                return b
            }

            function d(a, b) {
                for (var c = b.length, d = !1, e = c - 1, f = 0; c > f; e = f++) {
                    var g = b[e],
                        h = b[f],
                        i = h.x - g.x,
                        j = h.y - g.y;
                    if (Math.abs(j) > Number.EPSILON) {
                        if (0 > j && (g = b[f], i = -i, h = b[e], j = -j), !(a.y < g.y || a.y > h.y))
                            if (a.y === g.y) {
                                if (a.x === g.x) return !0
                            } else {
                                if (e = j * (a.x - g.x) - i * (a.y - g.y), 0 === e) return !0;
                                0 > e || (d = !d)
                            }
                    } else if (a.y === g.y && (h.x <= a.x && a.x <= g.x || g.x <= a.x && a.x <= h.x)) return !0
                }
                return d
            }
            var e = THREE.ShapeUtils.isClockWise,
                f = this.subPaths;
            if (0 === f.length) return [];
            if (!0 === b) return c(f);
            var g, h, i, j = [];
            if (1 === f.length) return h = f[0], i = new THREE.Shape, i.curves = h.curves, j.push(i), j;
            var k = !e(f[0].getPoints()),
                k = a ? !k : k;
            i = [];
            var l, m = [],
                n = [],
                o = 0;
            m[o] = void 0, n[o] = [];
            for (var p = 0, q = f.length; q > p; p++) h = f[p], l = h.getPoints(), g = e(l), (g = a ? !g : g) ? (!k && m[o] && o++, m[o] = {
                s: new THREE.Shape,
                p: l
            }, m[o].s.curves = h.curves, k && o++, n[o] = []) : n[o].push({
                h: h,
                p: l[0]
            });
            if (!m[0]) return c(f);
            if (1 < m.length) {
                for (p = !1, h = [], e = 0, f = m.length; f > e; e++) i[e] = [];
                for (e = 0, f = m.length; f > e; e++)
                    for (g = n[e], k = 0; k < g.length; k++) {
                        for (o = g[k], l = !0, q = 0; q < m.length; q++) d(o.p, m[q].p) && (e !== q && h.push({
                            froms: e,
                            tos: q,
                            hole: k
                        }), l ? (l = !1, i[q].push(o)) : p = !0);
                        l && i[e].push(o)
                    }
                0 < h.length && (p || (n = i))
            }
            for (p = 0, e = m.length; e > p; p++)
                for (i = m[p].s, j.push(i), h = n[p], f = 0, g = h.length; g > f; f++) i.holes.push(h[f].h);
            return j
        }
    }, THREE.Shape = function() {
        THREE.Path.apply(this, arguments), this.holes = []
    }, THREE.Shape.prototype = Object.assign(Object.create(THREE.Path.prototype), {
        constructor: THREE.Shape,
        extrude: function(a) {
            return new THREE.ExtrudeGeometry(this, a)
        },
        makeGeometry: function(a) {
            return new THREE.ShapeGeometry(this, a)
        },
        getPointsHoles: function(a) {
            for (var b = [], c = 0, d = this.holes.length; d > c; c++) b[c] = this.holes[c].getPoints(a);
            return b
        },
        extractAllPoints: function(a) {
            return {
                shape: this.getPoints(a),
                holes: this.getPointsHoles(a)
            }
        },
        extractPoints: function(a) {
            return this.extractAllPoints(a)
        }
    }), THREE.LineCurve = function(a, b) {
        this.v1 = a, this.v2 = b
    }, THREE.LineCurve.prototype = Object.create(THREE.Curve.prototype), THREE.LineCurve.prototype.constructor = THREE.LineCurve, THREE.LineCurve.prototype.getPoint = function(a) {
        if (1 === a) return this.v2.clone();
        var b = this.v2.clone().sub(this.v1);
        return b.multiplyScalar(a).add(this.v1), b
    }, THREE.LineCurve.prototype.getPointAt = function(a) {
        return this.getPoint(a)
    }, THREE.LineCurve.prototype.getTangent = function(a) {
        return this.v2.clone().sub(this.v1).normalize()
    }, THREE.QuadraticBezierCurve = function(a, b, c) {
        this.v0 = a, this.v1 = b, this.v2 = c
    }, THREE.QuadraticBezierCurve.prototype = Object.create(THREE.Curve.prototype), THREE.QuadraticBezierCurve.prototype.constructor = THREE.QuadraticBezierCurve, THREE.QuadraticBezierCurve.prototype.getPoint = function(a) {
        var b = THREE.ShapeUtils.b2;
        return new THREE.Vector2(b(a, this.v0.x, this.v1.x, this.v2.x), b(a, this.v0.y, this.v1.y, this.v2.y))
    }, THREE.QuadraticBezierCurve.prototype.getTangent = function(a) {
        var b = THREE.CurveUtils.tangentQuadraticBezier;
        return new THREE.Vector2(b(a, this.v0.x, this.v1.x, this.v2.x), b(a, this.v0.y, this.v1.y, this.v2.y)).normalize()
    }, THREE.CubicBezierCurve = function(a, b, c, d) {
        this.v0 = a, this.v1 = b, this.v2 = c, this.v3 = d
    }, THREE.CubicBezierCurve.prototype = Object.create(THREE.Curve.prototype), THREE.CubicBezierCurve.prototype.constructor = THREE.CubicBezierCurve, THREE.CubicBezierCurve.prototype.getPoint = function(a) {
        var b = THREE.ShapeUtils.b3;
        return new THREE.Vector2(b(a, this.v0.x, this.v1.x, this.v2.x, this.v3.x), b(a, this.v0.y, this.v1.y, this.v2.y, this.v3.y))
    }, THREE.CubicBezierCurve.prototype.getTangent = function(a) {
        var b = THREE.CurveUtils.tangentCubicBezier;
        return new THREE.Vector2(b(a, this.v0.x, this.v1.x, this.v2.x, this.v3.x), b(a, this.v0.y, this.v1.y, this.v2.y, this.v3.y)).normalize()
    }, THREE.SplineCurve = function(a) {
        this.points = void 0 == a ? [] : a
    }, THREE.SplineCurve.prototype = Object.create(THREE.Curve.prototype), THREE.SplineCurve.prototype.constructor = THREE.SplineCurve, THREE.SplineCurve.prototype.getPoint = function(a) {
        var b = this.points;
        a *= b.length - 1;
        var c = Math.floor(a);
        a -= c;
        var d = b[0 === c ? c : c - 1],
            e = b[c],
            f = b[c > b.length - 2 ? b.length - 1 : c + 1],
            b = b[c > b.length - 3 ? b.length - 1 : c + 2],
            c = THREE.CurveUtils.interpolate;
        return new THREE.Vector2(c(d.x, e.x, f.x, b.x, a), c(d.y, e.y, f.y, b.y, a))
    }, THREE.EllipseCurve = function(a, b, c, d, e, f, g, h) {
        this.aX = a, this.aY = b, this.xRadius = c, this.yRadius = d, this.aStartAngle = e, this.aEndAngle = f, this.aClockwise = g, this.aRotation = h || 0
    }, THREE.EllipseCurve.prototype = Object.create(THREE.Curve.prototype), THREE.EllipseCurve.prototype.constructor = THREE.EllipseCurve, THREE.EllipseCurve.prototype.getPoint = function(a) {
        for (var b = 2 * Math.PI, c = this.aEndAngle - this.aStartAngle, d = Math.abs(c) < Number.EPSILON; 0 > c;) c += b;
        for (; c > b;) c -= b;
        c < Number.EPSILON && (c = d ? 0 : b), !0 !== this.aClockwise || d || (c = c === b ? -b : c - b), b = this.aStartAngle + a * c, a = this.aX + this.xRadius * Math.cos(b);
        var e = this.aY + this.yRadius * Math.sin(b);
        return 0 !== this.aRotation && (b = Math.cos(this.aRotation), c = Math.sin(this.aRotation), d = a - this.aX, e -= this.aY, a = d * b - e * c + this.aX, e = d * c + e * b + this.aY), new THREE.Vector2(a, e)
    }, THREE.ArcCurve = function(a, b, c, d, e, f) {
        THREE.EllipseCurve.call(this, a, b, c, c, d, e, f)
    }, THREE.ArcCurve.prototype = Object.create(THREE.EllipseCurve.prototype), THREE.ArcCurve.prototype.constructor = THREE.ArcCurve, THREE.LineCurve3 = THREE.Curve.create(function(a, b) {
        this.v1 = a, this.v2 = b
    }, function(a) {
        if (1 === a) return this.v2.clone();
        var b = new THREE.Vector3;
        return b.subVectors(this.v2, this.v1), b.multiplyScalar(a), b.add(this.v1), b
    }), THREE.QuadraticBezierCurve3 = THREE.Curve.create(function(a, b, c) {
        this.v0 = a, this.v1 = b, this.v2 = c
    }, function(a) {
        var b = THREE.ShapeUtils.b2;
        return new THREE.Vector3(b(a, this.v0.x, this.v1.x, this.v2.x), b(a, this.v0.y, this.v1.y, this.v2.y), b(a, this.v0.z, this.v1.z, this.v2.z))
    }), THREE.CubicBezierCurve3 = THREE.Curve.create(function(a, b, c, d) {
        this.v0 = a, this.v1 = b, this.v2 = c, this.v3 = d
    }, function(a) {
        var b = THREE.ShapeUtils.b3;
        return new THREE.Vector3(b(a, this.v0.x, this.v1.x, this.v2.x, this.v3.x), b(a, this.v0.y, this.v1.y, this.v2.y, this.v3.y), b(a, this.v0.z, this.v1.z, this.v2.z, this.v3.z))
    }), THREE.SplineCurve3 = THREE.Curve.create(function(a) {
        console.warn("THREE.SplineCurve3 will be deprecated. Please use THREE.CatmullRomCurve3"), this.points = void 0 == a ? [] : a
    }, function(a) {
        var b = this.points;
        a *= b.length - 1;
        var c = Math.floor(a);
        a -= c;
        var d = b[0 == c ? c : c - 1],
            e = b[c],
            f = b[c > b.length - 2 ? b.length - 1 : c + 1],
            b = b[c > b.length - 3 ? b.length - 1 : c + 2],
            c = THREE.CurveUtils.interpolate;
        return new THREE.Vector3(c(d.x, e.x, f.x, b.x, a), c(d.y, e.y, f.y, b.y, a), c(d.z, e.z, f.z, b.z, a))
    }), THREE.CatmullRomCurve3 = function() {
        function a() {}
        var b = new THREE.Vector3,
            c = new a,
            d = new a,
            e = new a;
        return a.prototype.init = function(a, b, c, d) {
            this.c0 = a, this.c1 = c, this.c2 = -3 * a + 3 * b - 2 * c - d, this.c3 = 2 * a - 2 * b + c + d
        }, a.prototype.initNonuniformCatmullRom = function(a, b, c, d, e, f, g) {
            a = ((b - a) / e - (c - a) / (e + f) + (c - b) / f) * f, d = ((c - b) / f - (d - b) / (f + g) + (d - c) / g) * f, this.init(b, c, a, d)
        }, a.prototype.initCatmullRom = function(a, b, c, d, e) {
            this.init(b, c, e * (c - a), e * (d - b))
        }, a.prototype.calc = function(a) {
            var b = a * a;
            return this.c0 + this.c1 * a + this.c2 * b + this.c3 * b * a
        }, THREE.Curve.create(function(a) {
            this.points = a || [], this.closed = !1
        }, function(a) {
            var f, g, h = this.points;
            g = h.length, 2 > g && console.log("duh, you need at least 2 points"), a *= g - (this.closed ? 0 : 1), f = Math.floor(a), a -= f, this.closed ? f += f > 0 ? 0 : (Math.floor(Math.abs(f) / h.length) + 1) * h.length : 0 === a && f === g - 1 && (f = g - 2, a = 1);
            var i, j, k;
            if (this.closed || f > 0 ? i = h[(f - 1) % g] : (b.subVectors(h[0], h[1]).add(h[0]), i = b), j = h[f % g], k = h[(f + 1) % g], this.closed || g > f + 2 ? h = h[(f + 2) % g] : (b.subVectors(h[g - 1], h[g - 2]).add(h[g - 1]), h = b), void 0 === this.type || "centripetal" === this.type || "chordal" === this.type) {
                var l = "chordal" === this.type ? .5 : .25;
                g = Math.pow(i.distanceToSquared(j), l), f = Math.pow(j.distanceToSquared(k), l), l = Math.pow(k.distanceToSquared(h), l), 1e-4 > f && (f = 1), 1e-4 > g && (g = f), 1e-4 > l && (l = f), c.initNonuniformCatmullRom(i.x, j.x, k.x, h.x, g, f, l), d.initNonuniformCatmullRom(i.y, j.y, k.y, h.y, g, f, l), e.initNonuniformCatmullRom(i.z, j.z, k.z, h.z, g, f, l)
            } else "catmullrom" === this.type && (g = void 0 !== this.tension ? this.tension : .5, c.initCatmullRom(i.x, j.x, k.x, h.x, g), d.initCatmullRom(i.y, j.y, k.y, h.y, g), e.initCatmullRom(i.z, j.z, k.z, h.z, g));
            return new THREE.Vector3(c.calc(a), d.calc(a), e.calc(a))
        })
    }(), THREE.ClosedSplineCurve3 = function(a) {
        console.warn("THREE.ClosedSplineCurve3 has been deprecated. Please use THREE.CatmullRomCurve3."), THREE.CatmullRomCurve3.call(this, a), this.type = "catmullrom", this.closed = !0
    }, THREE.ClosedSplineCurve3.prototype = Object.create(THREE.CatmullRomCurve3.prototype), THREE.BoxGeometry = function(a, b, c, d, e, f) {
        THREE.Geometry.call(this), this.type = "BoxGeometry", this.parameters = {
            width: a,
            height: b,
            depth: c,
            widthSegments: d,
            heightSegments: e,
            depthSegments: f
        }, this.fromBufferGeometry(new THREE.BoxBufferGeometry(a, b, c, d, e, f)), this.mergeVertices()
    }, THREE.BoxGeometry.prototype = Object.create(THREE.Geometry.prototype), THREE.BoxGeometry.prototype.constructor = THREE.BoxGeometry, THREE.CubeGeometry = THREE.BoxGeometry, THREE.BoxBufferGeometry = function(a, b, c, d, e, f) {
        function g(a, b, c, d, e, f, g, i, j, t, u) {
            var v = f / j,
                w = g / t,
                x = f / 2,
                y = g / 2,
                z = i / 2;
            g = j + 1;
            for (var A = t + 1, B = f = 0, C = new THREE.Vector3, D = 0; A > D; D++)
                for (var E = D * w - y, F = 0; g > F; F++) C[a] = (F * v - x) * d, C[b] = E * e, C[c] = z, l[o] = C.x, l[o + 1] = C.y, l[o + 2] = C.z, C[a] = 0, C[b] = 0, C[c] = i > 0 ? 1 : -1, m[o] = C.x, m[o + 1] = C.y, m[o + 2] = C.z, n[p] = F / j, n[p + 1] = 1 - D / t, o += 3, p += 2, f += 1;
            for (D = 0; t > D; D++)
                for (F = 0; j > F; F++) a = r + F + g * (D + 1), b = r + (F + 1) + g * (D + 1), c = r + (F + 1) + g * D, k[q] = r + F + g * D, k[q + 1] = a, k[q + 2] = c, k[q + 3] = a, k[q + 4] = b, k[q + 5] = c, q += 6, B += 6;
            h.addGroup(s, B, u), s += B, r += f
        }
        THREE.BufferGeometry.call(this), this.type = "BoxBufferGeometry", this.parameters = {
            width: a,
            height: b,
            depth: c,
            widthSegments: d,
            heightSegments: e,
            depthSegments: f
        };
        var h = this;
        d = Math.floor(d) || 1, e = Math.floor(e) || 1, f = Math.floor(f) || 1;
        var i = function(a, b, c) {
                return a = 0 + (a + 1) * (b + 1) * 2 + (a + 1) * (c + 1) * 2, a += (c + 1) * (b + 1) * 2
            }(d, e, f),
            j = function(a, b, c) {
                return a = 0 + a * b * 2 + a * c * 2, a += c * b * 2, 6 * a
            }(d, e, f),
            k = new(j > 65535 ? Uint32Array : Uint16Array)(j),
            l = new Float32Array(3 * i),
            m = new Float32Array(3 * i),
            n = new Float32Array(2 * i),
            o = 0,
            p = 0,
            q = 0,
            r = 0,
            s = 0;
        g("z", "y", "x", -1, -1, c, b, a, f, e, 0), g("z", "y", "x", 1, -1, c, b, -a, f, e, 1), g("x", "z", "y", 1, 1, a, c, b, d, f, 2), g("x", "z", "y", 1, -1, a, c, -b, d, f, 3), g("x", "y", "z", 1, -1, a, b, c, d, e, 4), g("x", "y", "z", -1, -1, a, b, -c, d, e, 5), this.setIndex(new THREE.BufferAttribute(k, 1)), this.addAttribute("position", new THREE.BufferAttribute(l, 3)), this.addAttribute("normal", new THREE.BufferAttribute(m, 3)), this.addAttribute("uv", new THREE.BufferAttribute(n, 2))
    }, THREE.BoxBufferGeometry.prototype = Object.create(THREE.BufferGeometry.prototype), THREE.BoxBufferGeometry.prototype.constructor = THREE.BoxBufferGeometry, THREE.CircleGeometry = function(a, b, c, d) {
        THREE.Geometry.call(this), this.type = "CircleGeometry", this.parameters = {
            radius: a,
            segments: b,
            thetaStart: c,
            thetaLength: d
        }, this.fromBufferGeometry(new THREE.CircleBufferGeometry(a, b, c, d))
    }, THREE.CircleGeometry.prototype = Object.create(THREE.Geometry.prototype), THREE.CircleGeometry.prototype.constructor = THREE.CircleGeometry, THREE.CircleBufferGeometry = function(a, b, c, d) {
        THREE.BufferGeometry.call(this), this.type = "CircleBufferGeometry", this.parameters = {
            radius: a,
            segments: b,
            thetaStart: c,
            thetaLength: d
        }, a = a || 50, b = void 0 !== b ? Math.max(3, b) : 8, c = void 0 !== c ? c : 0, d = void 0 !== d ? d : 2 * Math.PI;
        var e = b + 2,
            f = new Float32Array(3 * e),
            g = new Float32Array(3 * e),
            e = new Float32Array(2 * e);
        g[2] = 1, e[0] = .5, e[1] = .5;
        for (var h = 0, i = 3, j = 2; b >= h; h++, i += 3, j += 2) {
            var k = c + h / b * d;
            f[i] = a * Math.cos(k), f[i + 1] = a * Math.sin(k), g[i + 2] = 1, e[j] = (f[i] / a + 1) / 2, e[j + 1] = (f[i + 1] / a + 1) / 2
        }
        for (c = [], i = 1; b >= i; i++) c.push(i, i + 1, 0);
        this.setIndex(new THREE.BufferAttribute(new Uint16Array(c), 1)), this.addAttribute("position", new THREE.BufferAttribute(f, 3)), this.addAttribute("normal", new THREE.BufferAttribute(g, 3)), this.addAttribute("uv", new THREE.BufferAttribute(e, 2)), this.boundingSphere = new THREE.Sphere(new THREE.Vector3, a)
    }, THREE.CircleBufferGeometry.prototype = Object.create(THREE.BufferGeometry.prototype), THREE.CircleBufferGeometry.prototype.constructor = THREE.CircleBufferGeometry, THREE.CylinderBufferGeometry = function(a, b, c, d, e, f, g, h) {
        function i(c) {
            var e, f, i, k = new THREE.Vector2,
                l = new THREE.Vector3,
                m = 0,
                t = !0 === c ? a : b,
                w = !0 === c ? 1 : -1;
            for (f = r, e = 1; d >= e; e++) o.setXYZ(r, 0, u * w, 0), p.setXYZ(r, 0, w, 0), k.x = .5, k.y = .5, q.setXY(r, k.x, k.y), r++;
            for (i = r, e = 0; d >= e; e++) {
                var x = e / d * h + g,
                    y = Math.cos(x),
                    x = Math.sin(x);
                l.x = t * x, l.y = u * w, l.z = t * y, o.setXYZ(r, l.x, l.y, l.z), p.setXYZ(r, 0, w, 0), k.x = .5 * y + .5, k.y = .5 * x * w + .5, q.setXY(r, k.x, k.y), r++
            }
            for (e = 0; d > e; e++) k = f + e, l = i + e, !0 === c ? (n.setX(s, l), s++, n.setX(s, l + 1)) : (n.setX(s, l + 1), s++, n.setX(s, l)), s++, n.setX(s, k), s++, m += 3;
            j.addGroup(v, m, !0 === c ? 1 : 2), v += m
        }
        THREE.BufferGeometry.call(this), this.type = "CylinderBufferGeometry", this.parameters = {
            radiusTop: a,
            radiusBottom: b,
            height: c,
            radialSegments: d,
            heightSegments: e,
            openEnded: f,
            thetaStart: g,
            thetaLength: h
        };
        var j = this;
        a = void 0 !== a ? a : 20, b = void 0 !== b ? b : 20, c = void 0 !== c ? c : 100, d = Math.floor(d) || 8, e = Math.floor(e) || 1, f = void 0 !== f ? f : !1, g = void 0 !== g ? g : 0, h = void 0 !== h ? h : 2 * Math.PI;
        var k = 0;
        !1 === f && (a > 0 && k++, b > 0 && k++);
        var l = function() {
                var a = (d + 1) * (e + 1);
                return !1 === f && (a += (d + 1) * k + d * k), a
            }(),
            m = function() {
                var a = d * e * 6;
                return !1 === f && (a += d * k * 3), a
            }(),
            n = new THREE.BufferAttribute(new(m > 65535 ? Uint32Array : Uint16Array)(m), 1),
            o = new THREE.BufferAttribute(new Float32Array(3 * l), 3),
            p = new THREE.BufferAttribute(new Float32Array(3 * l), 3),
            q = new THREE.BufferAttribute(new Float32Array(2 * l), 2),
            r = 0,
            s = 0,
            t = [],
            u = c / 2,
            v = 0;
        ! function() {
            var f, i, k = new THREE.Vector3,
                l = new THREE.Vector3,
                m = 0,
                w = (b - a) / c;
            for (i = 0; e >= i; i++) {
                var x = [],
                    y = i / e,
                    z = y * (b - a) + a;
                for (f = 0; d >= f; f++) {
                    var A = f / d;
                    l.x = z * Math.sin(A * h + g), l.y = -y * c + u, l.z = z * Math.cos(A * h + g), o.setXYZ(r, l.x, l.y, l.z), k.copy(l), (0 === a && 0 === i || 0 === b && i === e) && (k.x = Math.sin(A * h + g), k.z = Math.cos(A * h + g)), k.setY(Math.sqrt(k.x * k.x + k.z * k.z) * w).normalize(), p.setXYZ(r, k.x, k.y, k.z), q.setXY(r, A, 1 - y), x.push(r), r++
                }
                t.push(x)
            }
            for (f = 0; d > f; f++)
                for (i = 0; e > i; i++) k = t[i + 1][f], l = t[i + 1][f + 1], w = t[i][f + 1], n.setX(s, t[i][f]), s++, n.setX(s, k), s++, n.setX(s, w), s++, n.setX(s, k), s++, n.setX(s, l), s++, n.setX(s, w), s++, m += 6;
            j.addGroup(v, m, 0), v += m
        }(), !1 === f && (a > 0 && i(!0), b > 0 && i(!1)), this.setIndex(n), this.addAttribute("position", o), this.addAttribute("normal", p), this.addAttribute("uv", q)
    }, THREE.CylinderBufferGeometry.prototype = Object.create(THREE.BufferGeometry.prototype), THREE.CylinderBufferGeometry.prototype.constructor = THREE.CylinderBufferGeometry, THREE.CylinderGeometry = function(a, b, c, d, e, f, g, h) {
        THREE.Geometry.call(this), this.type = "CylinderGeometry", this.parameters = {
            radiusTop: a,
            radiusBottom: b,
            height: c,
            radialSegments: d,
            heightSegments: e,
            openEnded: f,
            thetaStart: g,
            thetaLength: h
        }, this.fromBufferGeometry(new THREE.CylinderBufferGeometry(a, b, c, d, e, f, g, h)), this.mergeVertices()
    }, THREE.CylinderGeometry.prototype = Object.create(THREE.Geometry.prototype), THREE.CylinderGeometry.prototype.constructor = THREE.CylinderGeometry, THREE.ConeBufferGeometry = function(a, b, c, d, e, f, g) {
        THREE.CylinderBufferGeometry.call(this, 0, a, b, c, d, e, f, g), this.type = "ConeBufferGeometry", this.parameters = {
            radius: a,
            height: b,
            radialSegments: c,
            heightSegments: d,
            thetaStart: f,
            thetaLength: g
        }
    }, THREE.ConeBufferGeometry.prototype = Object.create(THREE.BufferGeometry.prototype), THREE.ConeBufferGeometry.prototype.constructor = THREE.ConeBufferGeometry, THREE.ConeGeometry = function(a, b, c, d, e, f, g) {
        THREE.CylinderGeometry.call(this, 0, a, b, c, d, e, f, g), this.type = "ConeGeometry", this.parameters = {
            radius: a,
            height: b,
            radialSegments: c,
            heightSegments: d,
            openEnded: e,
            thetaStart: f,
            thetaLength: g
        }
    }, THREE.ConeGeometry.prototype = Object.create(THREE.CylinderGeometry.prototype), THREE.ConeGeometry.prototype.constructor = THREE.ConeGeometry, THREE.EdgesGeometry = function(a, b) {
        function c(a, b) {
            return a - b
        }
        THREE.BufferGeometry.call(this);
        var d, e = Math.cos(THREE.Math.DEG2RAD * (void 0 !== b ? b : 1)),
            f = [0, 0],
            g = {},
            h = ["a", "b", "c"];
        a instanceof THREE.BufferGeometry ? (d = new THREE.Geometry, d.fromBufferGeometry(a)) : d = a.clone(), d.mergeVertices(), d.computeFaceNormals();
        var i = d.vertices;
        d = d.faces;
        for (var j = 0, k = d.length; k > j; j++)
            for (var l = d[j], m = 0; 3 > m; m++) {
                f[0] = l[h[m]], f[1] = l[h[(m + 1) % 3]], f.sort(c);
                var n = f.toString();
                void 0 === g[n] ? g[n] = {
                    vert1: f[0],
                    vert2: f[1],
                    face1: j,
                    face2: void 0
                } : g[n].face2 = j
            }
        f = [];
        for (n in g) h = g[n], (void 0 === h.face2 || d[h.face1].normal.dot(d[h.face2].normal) <= e) && (j = i[h.vert1], f.push(j.x), f.push(j.y), f.push(j.z), j = i[h.vert2], f.push(j.x), f.push(j.y), f.push(j.z));
        this.addAttribute("position", new THREE.BufferAttribute(new Float32Array(f), 3));
    }, THREE.EdgesGeometry.prototype = Object.create(THREE.BufferGeometry.prototype), THREE.EdgesGeometry.prototype.constructor = THREE.EdgesGeometry, THREE.ExtrudeGeometry = function(a, b) {
        "undefined" != typeof a && (THREE.Geometry.call(this), this.type = "ExtrudeGeometry", a = Array.isArray(a) ? a : [a], this.addShapeList(a, b), this.computeFaceNormals())
    }, THREE.ExtrudeGeometry.prototype = Object.create(THREE.Geometry.prototype), THREE.ExtrudeGeometry.prototype.constructor = THREE.ExtrudeGeometry, THREE.ExtrudeGeometry.prototype.addShapeList = function(a, b) {
        for (var c = a.length, d = 0; c > d; d++) this.addShape(a[d], b)
    }, THREE.ExtrudeGeometry.prototype.addShape = function(a, b) {
        function c(a, b, c) {
            return b || console.error("THREE.ExtrudeGeometry: vec does not exist"), b.clone().multiplyScalar(c).add(a)
        }

        function d(a, b, c) {
            var d = 1,
                d = a.x - b.x,
                e = a.y - b.y,
                f = c.x - a.x,
                g = c.y - a.y,
                h = d * d + e * e;
            if (Math.abs(d * g - e * f) > Number.EPSILON) {
                var i = Math.sqrt(h),
                    j = Math.sqrt(f * f + g * g),
                    h = b.x - e / i;
                if (b = b.y + d / i, f = ((c.x - g / j - h) * g - (c.y + f / j - b) * f) / (d * g - e * f), c = h + d * f - a.x, a = b + e * f - a.y, d = c * c + a * a, 2 >= d) return new THREE.Vector2(c, a);
                d = Math.sqrt(d / 2)
            } else a = !1, d > Number.EPSILON ? f > Number.EPSILON && (a = !0) : d < -Number.EPSILON ? f < -Number.EPSILON && (a = !0) : Math.sign(e) === Math.sign(g) && (a = !0), a ? (c = -e, a = d, d = Math.sqrt(h)) : (c = d, a = e, d = Math.sqrt(h / 2));
            return new THREE.Vector2(c / d, a / d)
        }

        function e(a, b) {
            var c, d;
            for (M = a.length; 0 <= --M;) {
                c = M, d = M - 1, 0 > d && (d = a.length - 1);
                for (var e = 0, f = s + 2 * p, e = 0; f > e; e++) {
                    var g = K * e,
                        h = K * (e + 1),
                        i = b + c + g,
                        g = b + d + g,
                        j = b + d + h,
                        h = b + c + h,
                        i = i + A,
                        g = g + A,
                        j = j + A,
                        h = h + A;
                    z.faces.push(new THREE.Face3(i, g, h, null, null, 1)), z.faces.push(new THREE.Face3(g, j, h, null, null, 1)), i = v.generateSideWallUV(z, i, g, j, h), z.faceVertexUvs[0].push([i[0], i[1], i[3]]), z.faceVertexUvs[0].push([i[1], i[2], i[3]])
                }
            }
        }

        function f(a, b, c) {
            z.vertices.push(new THREE.Vector3(a, b, c))
        }

        function g(a, b, c) {
            a += A, b += A, c += A, z.faces.push(new THREE.Face3(a, b, c, null, null, 0)), a = v.generateTopUV(z, a, b, c), z.faceVertexUvs[0].push(a)
        }
        var h, i, j, k, l, m = void 0 !== b.amount ? b.amount : 100,
            n = void 0 !== b.bevelThickness ? b.bevelThickness : 6,
            o = void 0 !== b.bevelSize ? b.bevelSize : n - 2,
            p = void 0 !== b.bevelSegments ? b.bevelSegments : 3,
            q = void 0 !== b.bevelEnabled ? b.bevelEnabled : !0,
            r = void 0 !== b.curveSegments ? b.curveSegments : 12,
            s = void 0 !== b.steps ? b.steps : 1,
            t = b.extrudePath,
            u = !1,
            v = void 0 !== b.UVGenerator ? b.UVGenerator : THREE.ExtrudeGeometry.WorldUVGenerator;
        t && (h = t.getSpacedPoints(s), u = !0, q = !1, i = void 0 !== b.frames ? b.frames : new THREE.TubeGeometry.FrenetFrames(t, s, !1), j = new THREE.Vector3, k = new THREE.Vector3, l = new THREE.Vector3), q || (o = n = p = 0);
        var w, x, y, z = this,
            A = this.vertices.length,
            t = a.extractPoints(r),
            r = t.shape,
            B = t.holes;
        if (t = !THREE.ShapeUtils.isClockWise(r)) {
            for (r = r.reverse(), x = 0, y = B.length; y > x; x++) w = B[x], THREE.ShapeUtils.isClockWise(w) && (B[x] = w.reverse());
            t = !1
        }
        var C = THREE.ShapeUtils.triangulateShape(r, B),
            D = r;
        for (x = 0, y = B.length; y > x; x++) w = B[x], r = r.concat(w);
        var E, F, G, H, I, J, K = r.length,
            L = C.length,
            t = [],
            M = 0;
        for (G = D.length, E = G - 1, F = M + 1; G > M; M++, E++, F++) E === G && (E = 0), F === G && (F = 0), t[M] = d(D[M], D[E], D[F]);
        var N, O = [],
            P = t.concat();
        for (x = 0, y = B.length; y > x; x++) {
            for (w = B[x], N = [], M = 0, G = w.length, E = G - 1, F = M + 1; G > M; M++, E++, F++) E === G && (E = 0), F === G && (F = 0), N[M] = d(w[M], w[E], w[F]);
            O.push(N), P = P.concat(N)
        }
        for (E = 0; p > E; E++) {
            for (G = E / p, H = n * (1 - G), F = o * Math.sin(G * Math.PI / 2), M = 0, G = D.length; G > M; M++) I = c(D[M], t[M], F), f(I.x, I.y, -H);
            for (x = 0, y = B.length; y > x; x++)
                for (w = B[x], N = O[x], M = 0, G = w.length; G > M; M++) I = c(w[M], N[M], F), f(I.x, I.y, -H)
        }
        for (F = o, M = 0; K > M; M++) I = q ? c(r[M], P[M], F) : r[M], u ? (k.copy(i.normals[0]).multiplyScalar(I.x), j.copy(i.binormals[0]).multiplyScalar(I.y), l.copy(h[0]).add(k).add(j), f(l.x, l.y, l.z)) : f(I.x, I.y, 0);
        for (G = 1; s >= G; G++)
            for (M = 0; K > M; M++) I = q ? c(r[M], P[M], F) : r[M], u ? (k.copy(i.normals[G]).multiplyScalar(I.x), j.copy(i.binormals[G]).multiplyScalar(I.y), l.copy(h[G]).add(k).add(j), f(l.x, l.y, l.z)) : f(I.x, I.y, m / s * G);
        for (E = p - 1; E >= 0; E--) {
            for (G = E / p, H = n * (1 - G), F = o * Math.sin(G * Math.PI / 2), M = 0, G = D.length; G > M; M++) I = c(D[M], t[M], F), f(I.x, I.y, m + H);
            for (x = 0, y = B.length; y > x; x++)
                for (w = B[x], N = O[x], M = 0, G = w.length; G > M; M++) I = c(w[M], N[M], F), u ? f(I.x, I.y + h[s - 1].y, h[s - 1].x + H) : f(I.x, I.y, m + H)
        }! function() {
            if (q) {
                var a;
                for (a = 0 * K, M = 0; L > M; M++) J = C[M], g(J[2] + a, J[1] + a, J[0] + a);
                for (a = s + 2 * p, a *= K, M = 0; L > M; M++) J = C[M], g(J[0] + a, J[1] + a, J[2] + a)
            } else {
                for (M = 0; L > M; M++) J = C[M], g(J[2], J[1], J[0]);
                for (M = 0; L > M; M++) J = C[M], g(J[0] + K * s, J[1] + K * s, J[2] + K * s)
            }
        }(),
        function() {
            var a = 0;
            for (e(D, a), a += D.length, x = 0, y = B.length; y > x; x++) w = B[x], e(w, a), a += w.length
        }()
    }, THREE.ExtrudeGeometry.WorldUVGenerator = {
        generateTopUV: function(a, b, c, d) {
            return a = a.vertices, b = a[b], c = a[c], d = a[d], [new THREE.Vector2(b.x, b.y), new THREE.Vector2(c.x, c.y), new THREE.Vector2(d.x, d.y)]
        },
        generateSideWallUV: function(a, b, c, d, e) {
            return a = a.vertices, b = a[b], c = a[c], d = a[d], e = a[e], .01 > Math.abs(b.y - c.y) ? [new THREE.Vector2(b.x, 1 - b.z), new THREE.Vector2(c.x, 1 - c.z), new THREE.Vector2(d.x, 1 - d.z), new THREE.Vector2(e.x, 1 - e.z)] : [new THREE.Vector2(b.y, 1 - b.z), new THREE.Vector2(c.y, 1 - c.z), new THREE.Vector2(d.y, 1 - d.z), new THREE.Vector2(e.y, 1 - e.z)]
        }
    }, THREE.ShapeGeometry = function(a, b) {
        THREE.Geometry.call(this), this.type = "ShapeGeometry", !1 === Array.isArray(a) && (a = [a]), this.addShapeList(a, b), this.computeFaceNormals()
    }, THREE.ShapeGeometry.prototype = Object.create(THREE.Geometry.prototype), THREE.ShapeGeometry.prototype.constructor = THREE.ShapeGeometry, THREE.ShapeGeometry.prototype.addShapeList = function(a, b) {
        for (var c = 0, d = a.length; d > c; c++) this.addShape(a[c], b);
        return this
    }, THREE.ShapeGeometry.prototype.addShape = function(a, b) {
        void 0 === b && (b = {});
        var c, d, e, f = b.material,
            g = void 0 === b.UVGenerator ? THREE.ExtrudeGeometry.WorldUVGenerator : b.UVGenerator,
            h = this.vertices.length;
        c = a.extractPoints(void 0 !== b.curveSegments ? b.curveSegments : 12);
        var i = c.shape,
            j = c.holes;
        if (!THREE.ShapeUtils.isClockWise(i))
            for (i = i.reverse(), c = 0, d = j.length; d > c; c++) e = j[c], THREE.ShapeUtils.isClockWise(e) && (j[c] = e.reverse());
        var k = THREE.ShapeUtils.triangulateShape(i, j);
        for (c = 0, d = j.length; d > c; c++) e = j[c], i = i.concat(e);
        for (j = i.length, d = k.length, c = 0; j > c; c++) e = i[c], this.vertices.push(new THREE.Vector3(e.x, e.y, 0));
        for (c = 0; d > c; c++) j = k[c], i = j[0] + h, e = j[1] + h, j = j[2] + h, this.faces.push(new THREE.Face3(i, e, j, null, null, f)), this.faceVertexUvs[0].push(g.generateTopUV(this, i, e, j))
    }, THREE.LatheBufferGeometry = function(a, b, c, d) {
        THREE.BufferGeometry.call(this), this.type = "LatheBufferGeometry", this.parameters = {
            points: a,
            segments: b,
            phiStart: c,
            phiLength: d
        }, b = Math.floor(b) || 12, c = c || 0, d = d || 2 * Math.PI, d = THREE.Math.clamp(d, 0, 2 * Math.PI);
        for (var e = (b + 1) * a.length, f = b * a.length * 6, g = new THREE.BufferAttribute(new(f > 65535 ? Uint32Array : Uint16Array)(f), 1), h = new THREE.BufferAttribute(new Float32Array(3 * e), 3), i = new THREE.BufferAttribute(new Float32Array(2 * e), 2), j = 0, k = 0, l = 1 / b, m = new THREE.Vector3, n = new THREE.Vector2, e = 0; b >= e; e++)
            for (var f = c + e * l * d, o = Math.sin(f), p = Math.cos(f), f = 0; f <= a.length - 1; f++) m.x = a[f].x * o, m.y = a[f].y, m.z = a[f].x * p, h.setXYZ(j, m.x, m.y, m.z), n.x = e / b, n.y = f / (a.length - 1), i.setXY(j, n.x, n.y), j++;
        for (e = 0; b > e; e++)
            for (f = 0; f < a.length - 1; f++) c = f + e * a.length, j = c + a.length, l = c + a.length + 1, m = c + 1, g.setX(k, c), k++, g.setX(k, j), k++, g.setX(k, m), k++, g.setX(k, j), k++, g.setX(k, l), k++, g.setX(k, m), k++;
        if (this.setIndex(g), this.addAttribute("position", h), this.addAttribute("uv", i), this.computeVertexNormals(), d === 2 * Math.PI)
            for (d = this.attributes.normal.array, g = new THREE.Vector3, h = new THREE.Vector3, i = new THREE.Vector3, c = b * a.length * 3, f = e = 0; e < a.length; e++, f += 3) g.x = d[f + 0], g.y = d[f + 1], g.z = d[f + 2], h.x = d[c + f + 0], h.y = d[c + f + 1], h.z = d[c + f + 2], i.addVectors(g, h).normalize(), d[f + 0] = d[c + f + 0] = i.x, d[f + 1] = d[c + f + 1] = i.y, d[f + 2] = d[c + f + 2] = i.z
    }, THREE.LatheBufferGeometry.prototype = Object.create(THREE.BufferGeometry.prototype), THREE.LatheBufferGeometry.prototype.constructor = THREE.LatheBufferGeometry, THREE.LatheGeometry = function(a, b, c, d) {
        THREE.Geometry.call(this), this.type = "LatheGeometry", this.parameters = {
            points: a,
            segments: b,
            phiStart: c,
            phiLength: d
        }, this.fromBufferGeometry(new THREE.LatheBufferGeometry(a, b, c, d)), this.mergeVertices()
    }, THREE.LatheGeometry.prototype = Object.create(THREE.Geometry.prototype), THREE.LatheGeometry.prototype.constructor = THREE.LatheGeometry, THREE.PlaneGeometry = function(a, b, c, d) {
        THREE.Geometry.call(this), this.type = "PlaneGeometry", this.parameters = {
            width: a,
            height: b,
            widthSegments: c,
            heightSegments: d
        }, this.fromBufferGeometry(new THREE.PlaneBufferGeometry(a, b, c, d))
    }, THREE.PlaneGeometry.prototype = Object.create(THREE.Geometry.prototype), THREE.PlaneGeometry.prototype.constructor = THREE.PlaneGeometry, THREE.PlaneBufferGeometry = function(a, b, c, d) {
        THREE.BufferGeometry.call(this), this.type = "PlaneBufferGeometry", this.parameters = {
            width: a,
            height: b,
            widthSegments: c,
            heightSegments: d
        };
        var e = a / 2,
            f = b / 2;
        c = Math.floor(c) || 1, d = Math.floor(d) || 1;
        var g = c + 1,
            h = d + 1,
            i = a / c,
            j = b / d;
        b = new Float32Array(g * h * 3), a = new Float32Array(g * h * 3);
        for (var k = new Float32Array(g * h * 2), l = 0, m = 0, n = 0; h > n; n++)
            for (var o = n * j - f, p = 0; g > p; p++) b[l] = p * i - e, b[l + 1] = -o, a[l + 2] = 1, k[m] = p / c, k[m + 1] = 1 - n / d, l += 3, m += 2;
        for (l = 0, e = new(65535 < b.length / 3 ? Uint32Array : Uint16Array)(c * d * 6), n = 0; d > n; n++)
            for (p = 0; c > p; p++) f = p + g * (n + 1), h = p + 1 + g * (n + 1), i = p + 1 + g * n, e[l] = p + g * n, e[l + 1] = f, e[l + 2] = i, e[l + 3] = f, e[l + 4] = h, e[l + 5] = i, l += 6;
        this.setIndex(new THREE.BufferAttribute(e, 1)), this.addAttribute("position", new THREE.BufferAttribute(b, 3)), this.addAttribute("normal", new THREE.BufferAttribute(a, 3)), this.addAttribute("uv", new THREE.BufferAttribute(k, 2))
    }, THREE.PlaneBufferGeometry.prototype = Object.create(THREE.BufferGeometry.prototype), THREE.PlaneBufferGeometry.prototype.constructor = THREE.PlaneBufferGeometry, THREE.RingBufferGeometry = function(a, b, c, d, e, f) {
        THREE.BufferGeometry.call(this), this.type = "RingBufferGeometry", this.parameters = {
            innerRadius: a,
            outerRadius: b,
            thetaSegments: c,
            phiSegments: d,
            thetaStart: e,
            thetaLength: f
        }, a = a || 20, b = b || 50, e = void 0 !== e ? e : 0, f = void 0 !== f ? f : 2 * Math.PI, c = void 0 !== c ? Math.max(3, c) : 8, d = void 0 !== d ? Math.max(1, d) : 1;
        var g, h, i = (c + 1) * (d + 1),
            j = c * d * 6,
            j = new THREE.BufferAttribute(new(j > 65535 ? Uint32Array : Uint16Array)(j), 1),
            k = new THREE.BufferAttribute(new Float32Array(3 * i), 3),
            l = new THREE.BufferAttribute(new Float32Array(3 * i), 3),
            i = new THREE.BufferAttribute(new Float32Array(2 * i), 2),
            m = 0,
            n = 0,
            o = a,
            p = (b - a) / d,
            q = new THREE.Vector3,
            r = new THREE.Vector2;
        for (a = 0; d >= a; a++) {
            for (h = 0; c >= h; h++) g = e + h / c * f, q.x = o * Math.cos(g), q.y = o * Math.sin(g), k.setXYZ(m, q.x, q.y, q.z), l.setXYZ(m, 0, 0, 1), r.x = (q.x / b + 1) / 2, r.y = (q.y / b + 1) / 2, i.setXY(m, r.x, r.y), m++;
            o += p
        }
        for (a = 0; d > a; a++)
            for (b = a * (c + 1), h = 0; c > h; h++) e = g = h + b, f = g + c + 1, m = g + c + 2, g += 1, j.setX(n, e), n++, j.setX(n, f), n++, j.setX(n, m), n++, j.setX(n, e), n++, j.setX(n, m), n++, j.setX(n, g), n++;
        this.setIndex(j), this.addAttribute("position", k), this.addAttribute("normal", l), this.addAttribute("uv", i)
    }, THREE.RingBufferGeometry.prototype = Object.create(THREE.BufferGeometry.prototype), THREE.RingBufferGeometry.prototype.constructor = THREE.RingBufferGeometry, THREE.RingGeometry = function(a, b, c, d, e, f) {
        THREE.Geometry.call(this), this.type = "RingGeometry", this.parameters = {
            innerRadius: a,
            outerRadius: b,
            thetaSegments: c,
            phiSegments: d,
            thetaStart: e,
            thetaLength: f
        }, this.fromBufferGeometry(new THREE.RingBufferGeometry(a, b, c, d, e, f))
    }, THREE.RingGeometry.prototype = Object.create(THREE.Geometry.prototype), THREE.RingGeometry.prototype.constructor = THREE.RingGeometry, THREE.SphereGeometry = function(a, b, c, d, e, f, g) {
        THREE.Geometry.call(this), this.type = "SphereGeometry", this.parameters = {
            radius: a,
            widthSegments: b,
            heightSegments: c,
            phiStart: d,
            phiLength: e,
            thetaStart: f,
            thetaLength: g
        }, this.fromBufferGeometry(new THREE.SphereBufferGeometry(a, b, c, d, e, f, g))
    }, THREE.SphereGeometry.prototype = Object.create(THREE.Geometry.prototype), THREE.SphereGeometry.prototype.constructor = THREE.SphereGeometry, THREE.SphereBufferGeometry = function(a, b, c, d, e, f, g) {
        THREE.BufferGeometry.call(this), this.type = "SphereBufferGeometry", this.parameters = {
            radius: a,
            widthSegments: b,
            heightSegments: c,
            phiStart: d,
            phiLength: e,
            thetaStart: f,
            thetaLength: g
        }, a = a || 50, b = Math.max(3, Math.floor(b) || 8), c = Math.max(2, Math.floor(c) || 6), d = void 0 !== d ? d : 0, e = void 0 !== e ? e : 2 * Math.PI, f = void 0 !== f ? f : 0, g = void 0 !== g ? g : Math.PI;
        for (var h = f + g, i = (b + 1) * (c + 1), j = new THREE.BufferAttribute(new Float32Array(3 * i), 3), k = new THREE.BufferAttribute(new Float32Array(3 * i), 3), i = new THREE.BufferAttribute(new Float32Array(2 * i), 2), l = 0, m = [], n = new THREE.Vector3, o = 0; c >= o; o++) {
            for (var p = [], q = o / c, r = 0; b >= r; r++) {
                var s = r / b,
                    t = -a * Math.cos(d + s * e) * Math.sin(f + q * g),
                    u = a * Math.cos(f + q * g),
                    v = a * Math.sin(d + s * e) * Math.sin(f + q * g);
                n.set(t, u, v).normalize(), j.setXYZ(l, t, u, v), k.setXYZ(l, n.x, n.y, n.z), i.setXY(l, s, 1 - q), p.push(l), l++
            }
            m.push(p)
        }
        for (d = [], o = 0; c > o; o++)
            for (r = 0; b > r; r++) e = m[o][r + 1], g = m[o][r], l = m[o + 1][r], n = m[o + 1][r + 1], (0 !== o || f > 0) && d.push(e, g, n), (o !== c - 1 || h < Math.PI) && d.push(g, l, n);
        this.setIndex(new(65535 < j.count ? THREE.Uint32Attribute : THREE.Uint16Attribute)(d, 1)), this.addAttribute("position", j), this.addAttribute("normal", k), this.addAttribute("uv", i), this.boundingSphere = new THREE.Sphere(new THREE.Vector3, a)
    }, THREE.SphereBufferGeometry.prototype = Object.create(THREE.BufferGeometry.prototype), THREE.SphereBufferGeometry.prototype.constructor = THREE.SphereBufferGeometry, THREE.TextGeometry = function(a, b) {
        b = b || {};
        var c = b.font;
        return !1 == c instanceof THREE.Font ? (console.error("THREE.TextGeometry: font parameter is not an instance of THREE.Font."), new THREE.Geometry) : (c = c.generateShapes(a, b.size, b.curveSegments), b.amount = void 0 !== b.height ? b.height : 50, void 0 === b.bevelThickness && (b.bevelThickness = 10), void 0 === b.bevelSize && (b.bevelSize = 8), void 0 === b.bevelEnabled && (b.bevelEnabled = !1), THREE.ExtrudeGeometry.call(this, c, b), void(this.type = "TextGeometry"))
    }, THREE.TextGeometry.prototype = Object.create(THREE.ExtrudeGeometry.prototype), THREE.TextGeometry.prototype.constructor = THREE.TextGeometry, THREE.TorusBufferGeometry = function(a, b, c, d, e) {
        THREE.BufferGeometry.call(this), this.type = "TorusBufferGeometry", this.parameters = {
            radius: a,
            tube: b,
            radialSegments: c,
            tubularSegments: d,
            arc: e
        }, a = a || 100, b = b || 40, c = Math.floor(c) || 8, d = Math.floor(d) || 6, e = e || 2 * Math.PI;
        var f, g, h = (c + 1) * (d + 1),
            i = c * d * 6,
            i = new(i > 65535 ? Uint32Array : Uint16Array)(i),
            j = new Float32Array(3 * h),
            k = new Float32Array(3 * h),
            h = new Float32Array(2 * h),
            l = 0,
            m = 0,
            n = 0,
            o = new THREE.Vector3,
            p = new THREE.Vector3,
            q = new THREE.Vector3;
        for (f = 0; c >= f; f++)
            for (g = 0; d >= g; g++) {
                var r = g / d * e,
                    s = f / c * Math.PI * 2;
                p.x = (a + b * Math.cos(s)) * Math.cos(r), p.y = (a + b * Math.cos(s)) * Math.sin(r), p.z = b * Math.sin(s), j[l] = p.x, j[l + 1] = p.y, j[l + 2] = p.z, o.x = a * Math.cos(r), o.y = a * Math.sin(r), q.subVectors(p, o).normalize(), k[l] = q.x, k[l + 1] = q.y, k[l + 2] = q.z, h[m] = g / d, h[m + 1] = f / c, l += 3, m += 2
            }
        for (f = 1; c >= f; f++)
            for (g = 1; d >= g; g++) a = (d + 1) * (f - 1) + g - 1, b = (d + 1) * (f - 1) + g, e = (d + 1) * f + g, i[n] = (d + 1) * f + g - 1, i[n + 1] = a, i[n + 2] = e, i[n + 3] = a, i[n + 4] = b, i[n + 5] = e, n += 6;
        this.setIndex(new THREE.BufferAttribute(i, 1)), this.addAttribute("position", new THREE.BufferAttribute(j, 3)), this.addAttribute("normal", new THREE.BufferAttribute(k, 3)), this.addAttribute("uv", new THREE.BufferAttribute(h, 2))
    }, THREE.TorusBufferGeometry.prototype = Object.create(THREE.BufferGeometry.prototype), THREE.TorusBufferGeometry.prototype.constructor = THREE.TorusBufferGeometry, THREE.TorusGeometry = function(a, b, c, d, e) {
        THREE.Geometry.call(this), this.type = "TorusGeometry", this.parameters = {
            radius: a,
            tube: b,
            radialSegments: c,
            tubularSegments: d,
            arc: e
        }, this.fromBufferGeometry(new THREE.TorusBufferGeometry(a, b, c, d, e))
    }, THREE.TorusGeometry.prototype = Object.create(THREE.Geometry.prototype), THREE.TorusGeometry.prototype.constructor = THREE.TorusGeometry, THREE.TorusKnotBufferGeometry = function(a, b, c, d, e, f) {
        function g(a, b, c, d, e) {
            var f = Math.cos(a),
                g = Math.sin(a);
            a *= c / b, b = Math.cos(a), e.x = d * (2 + b) * .5 * f, e.y = d * (2 + b) * g * .5, e.z = d * Math.sin(a) * .5
        }
        THREE.BufferGeometry.call(this), this.type = "TorusKnotBufferGeometry", this.parameters = {
            radius: a,
            tube: b,
            tubularSegments: c,
            radialSegments: d,
            p: e,
            q: f
        }, a = a || 100, b = b || 40, c = Math.floor(c) || 64, d = Math.floor(d) || 8, e = e || 2, f = f || 3;
        var h, i, j = (d + 1) * (c + 1),
            k = d * c * 6,
            k = new THREE.BufferAttribute(new(k > 65535 ? Uint32Array : Uint16Array)(k), 1),
            l = new THREE.BufferAttribute(new Float32Array(3 * j), 3),
            m = new THREE.BufferAttribute(new Float32Array(3 * j), 3),
            j = new THREE.BufferAttribute(new Float32Array(2 * j), 2),
            n = 0,
            o = 0,
            p = new THREE.Vector3,
            q = new THREE.Vector3,
            r = new THREE.Vector2,
            s = new THREE.Vector3,
            t = new THREE.Vector3,
            u = new THREE.Vector3,
            v = new THREE.Vector3,
            w = new THREE.Vector3;
        for (h = 0; c >= h; ++h)
            for (i = h / c * e * Math.PI * 2, g(i, e, f, a, s), g(i + .01, e, f, a, t), v.subVectors(t, s), w.addVectors(t, s), u.crossVectors(v, w), w.crossVectors(u, v), u.normalize(), w.normalize(), i = 0; d >= i; ++i) {
                var x = i / d * Math.PI * 2,
                    y = -b * Math.cos(x),
                    x = b * Math.sin(x);
                p.x = s.x + (y * w.x + x * u.x), p.y = s.y + (y * w.y + x * u.y), p.z = s.z + (y * w.z + x * u.z), l.setXYZ(n, p.x, p.y, p.z), q.subVectors(p, s).normalize(), m.setXYZ(n, q.x, q.y, q.z), r.x = h / c, r.y = i / d, j.setXY(n, r.x, r.y), n++
            }
        for (i = 1; c >= i; i++)
            for (h = 1; d >= h; h++) a = (d + 1) * i + (h - 1), b = (d + 1) * i + h, e = (d + 1) * (i - 1) + h, k.setX(o, (d + 1) * (i - 1) + (h - 1)), o++, k.setX(o, a), o++, k.setX(o, e), o++, k.setX(o, a), o++, k.setX(o, b), o++, k.setX(o, e), o++;
        this.setIndex(k), this.addAttribute("position", l), this.addAttribute("normal", m), this.addAttribute("uv", j)
    }, THREE.TorusKnotBufferGeometry.prototype = Object.create(THREE.BufferGeometry.prototype), THREE.TorusKnotBufferGeometry.prototype.constructor = THREE.TorusKnotBufferGeometry, THREE.TorusKnotGeometry = function(a, b, c, d, e, f, g) {
        THREE.Geometry.call(this), this.type = "TorusKnotGeometry", this.parameters = {
            radius: a,
            tube: b,
            tubularSegments: c,
            radialSegments: d,
            p: e,
            q: f
        }, void 0 !== g && console.warn("THREE.TorusKnotGeometry: heightScale has been deprecated. Use .scale( x, y, z ) instead."), this.fromBufferGeometry(new THREE.TorusKnotBufferGeometry(a, b, c, d, e, f)), this.mergeVertices()
    }, THREE.TorusKnotGeometry.prototype = Object.create(THREE.Geometry.prototype), THREE.TorusKnotGeometry.prototype.constructor = THREE.TorusKnotGeometry, THREE.TubeGeometry = function(a, b, c, d, e, f) {
        THREE.Geometry.call(this), this.type = "TubeGeometry", this.parameters = {
            path: a,
            segments: b,
            radius: c,
            radialSegments: d,
            closed: e,
            taper: f
        }, b = b || 64, c = c || 1, d = d || 8, e = e || !1, f = f || THREE.TubeGeometry.NoTaper;
        var g, h, i, j, k, l, m, n, o, p, q = [],
            r = b + 1,
            s = new THREE.Vector3;
        for (n = new THREE.TubeGeometry.FrenetFrames(a, b, e), o = n.normals, p = n.binormals, this.tangents = n.tangents, this.normals = o, this.binormals = p, n = 0; r > n; n++)
            for (q[n] = [], i = n / (r - 1), m = a.getPointAt(i), g = o[n], h = p[n], k = c * f(i), i = 0; d > i; i++) j = i / d * 2 * Math.PI, l = -k * Math.cos(j), j = k * Math.sin(j), s.copy(m), s.x += l * g.x + j * h.x, s.y += l * g.y + j * h.y, s.z += l * g.z + j * h.z, q[n][i] = this.vertices.push(new THREE.Vector3(s.x, s.y, s.z)) - 1;
        for (n = 0; b > n; n++)
            for (i = 0; d > i; i++) f = e ? (n + 1) % b : n + 1, r = (i + 1) % d, a = q[n][i], c = q[f][i], f = q[f][r], r = q[n][r], s = new THREE.Vector2(n / b, i / d), o = new THREE.Vector2((n + 1) / b, i / d), p = new THREE.Vector2((n + 1) / b, (i + 1) / d), g = new THREE.Vector2(n / b, (i + 1) / d), this.faces.push(new THREE.Face3(a, c, r)), this.faceVertexUvs[0].push([s, o, g]), this.faces.push(new THREE.Face3(c, f, r)), this.faceVertexUvs[0].push([o.clone(), p, g.clone()]);
        this.computeFaceNormals(), this.computeVertexNormals()
    }, THREE.TubeGeometry.prototype = Object.create(THREE.Geometry.prototype), THREE.TubeGeometry.prototype.constructor = THREE.TubeGeometry, THREE.TubeGeometry.NoTaper = function(a) {
        return 1
    }, THREE.TubeGeometry.SinusoidalTaper = function(a) {
        return Math.sin(Math.PI * a)
    }, THREE.TubeGeometry.FrenetFrames = function(a, b, c) {
        var d = new THREE.Vector3,
            e = [],
            f = [],
            g = [],
            h = new THREE.Vector3,
            i = new THREE.Matrix4;
        b += 1;
        var j, k, l;
        for (this.tangents = e, this.normals = f, this.binormals = g, j = 0; b > j; j++) k = j / (b - 1), e[j] = a.getTangentAt(k), e[j].normalize();
        for (f[0] = new THREE.Vector3, g[0] = new THREE.Vector3, a = Number.MAX_VALUE, j = Math.abs(e[0].x), k = Math.abs(e[0].y), l = Math.abs(e[0].z), a >= j && (a = j, d.set(1, 0, 0)), a >= k && (a = k, d.set(0, 1, 0)), a >= l && d.set(0, 0, 1), h.crossVectors(e[0], d).normalize(), f[0].crossVectors(e[0], h), g[0].crossVectors(e[0], f[0]), j = 1; b > j; j++) f[j] = f[j - 1].clone(), g[j] = g[j - 1].clone(), h.crossVectors(e[j - 1], e[j]), h.length() > Number.EPSILON && (h.normalize(), d = Math.acos(THREE.Math.clamp(e[j - 1].dot(e[j]), -1, 1)), f[j].applyMatrix4(i.makeRotationAxis(h, d))), g[j].crossVectors(e[j], f[j]);
        if (c)
            for (d = Math.acos(THREE.Math.clamp(f[0].dot(f[b - 1]), -1, 1)), d /= b - 1, 0 < e[0].dot(h.crossVectors(f[0], f[b - 1])) && (d = -d), j = 1; b > j; j++) f[j].applyMatrix4(i.makeRotationAxis(e[j], d * j)), g[j].crossVectors(e[j], f[j])
    }, THREE.PolyhedronGeometry = function(a, b, c, d) {
        function e(a) {
            var b = a.normalize().clone();
            b.index = i.vertices.push(b) - 1;
            var c = Math.atan2(a.z, -a.x) / 2 / Math.PI + .5;
            return a = Math.atan2(-a.y, Math.sqrt(a.x * a.x + a.z * a.z)) / Math.PI + .5, b.uv = new THREE.Vector2(c, 1 - a), b
        }

        function f(a, b, c) {
            var d = new THREE.Face3(a.index, b.index, c.index, [a.clone(), b.clone(), c.clone()]);
            i.faces.push(d), q.copy(a).add(b).add(c).divideScalar(3), d = Math.atan2(q.z, -q.x), i.faceVertexUvs[0].push([h(a.uv, a, d), h(b.uv, b, d), h(c.uv, c, d)])
        }

        function g(a, b) {
            for (var c = Math.pow(2, b), d = e(i.vertices[a.a]), g = e(i.vertices[a.b]), h = e(i.vertices[a.c]), j = [], k = 0; c >= k; k++) {
                j[k] = [];
                for (var l = e(d.clone().lerp(h, k / c)), m = e(g.clone().lerp(h, k / c)), n = c - k, o = 0; n >= o; o++) j[k][o] = 0 === o && k === c ? l : e(l.clone().lerp(m, o / n))
            }
            for (k = 0; c > k; k++)
                for (o = 0; 2 * (c - k) - 1 > o; o++) d = Math.floor(o / 2), 0 === o % 2 ? f(j[k][d + 1], j[k + 1][d], j[k][d]) : f(j[k][d + 1], j[k + 1][d + 1], j[k + 1][d])
        }

        function h(a, b, c) {
            return 0 > c && 1 === a.x && (a = new THREE.Vector2(a.x - 1, a.y)), 0 === b.x && 0 === b.z && (a = new THREE.Vector2(c / 2 / Math.PI + .5, a.y)), a.clone()
        }
        THREE.Geometry.call(this), this.type = "PolyhedronGeometry", this.parameters = {
            vertices: a,
            indices: b,
            radius: c,
            detail: d
        }, c = c || 1, d = d || 0;
        for (var i = this, j = 0, k = a.length; k > j; j += 3) e(new THREE.Vector3(a[j], a[j + 1], a[j + 2]));
        a = this.vertices;
        for (var l = [], m = j = 0, k = b.length; k > j; j += 3, m++) {
            var n = a[b[j]],
                o = a[b[j + 1]],
                p = a[b[j + 2]];
            l[m] = new THREE.Face3(n.index, o.index, p.index, [n.clone(), o.clone(), p.clone()])
        }
        for (var q = new THREE.Vector3, j = 0, k = l.length; k > j; j++) g(l[j], d);
        for (j = 0, k = this.faceVertexUvs[0].length; k > j; j++) b = this.faceVertexUvs[0][j], d = b[0].x, a = b[1].x, l = b[2].x, m = Math.max(d, a, l), n = Math.min(d, a, l), m > .9 && .1 > n && (.2 > d && (b[0].x += 1), .2 > a && (b[1].x += 1), .2 > l && (b[2].x += 1));
        for (j = 0, k = this.vertices.length; k > j; j++) this.vertices[j].multiplyScalar(c);
        this.mergeVertices(), this.computeFaceNormals(), this.boundingSphere = new THREE.Sphere(new THREE.Vector3, c)
    }, THREE.PolyhedronGeometry.prototype = Object.create(THREE.Geometry.prototype), THREE.PolyhedronGeometry.prototype.constructor = THREE.PolyhedronGeometry, THREE.DodecahedronGeometry = function(a, b) {
        var c = (1 + Math.sqrt(5)) / 2,
            d = 1 / c;
        THREE.PolyhedronGeometry.call(this, [-1, -1, -1, -1, -1, 1, -1, 1, -1, -1, 1, 1, 1, -1, -1, 1, -1, 1, 1, 1, -1, 1, 1, 1, 0, -d, -c, 0, -d, c, 0, d, -c, 0, d, c, -d, -c, 0, -d, c, 0, d, -c, 0, d, c, 0, -c, 0, -d, c, 0, -d, -c, 0, d, c, 0, d], [3, 11, 7, 3, 7, 15, 3, 15, 13, 7, 19, 17, 7, 17, 6, 7, 6, 15, 17, 4, 8, 17, 8, 10, 17, 10, 6, 8, 0, 16, 8, 16, 2, 8, 2, 10, 0, 12, 1, 0, 1, 18, 0, 18, 16, 6, 10, 2, 6, 2, 13, 6, 13, 15, 2, 16, 18, 2, 18, 3, 2, 3, 13, 18, 1, 9, 18, 9, 11, 18, 11, 3, 4, 14, 12, 4, 12, 0, 4, 0, 8, 11, 9, 5, 11, 5, 19, 11, 19, 7, 19, 5, 14, 19, 14, 4, 19, 4, 17, 1, 12, 14, 1, 14, 5, 1, 5, 9], a, b), this.type = "DodecahedronGeometry", this.parameters = {
            radius: a,
            detail: b
        }
    }, THREE.DodecahedronGeometry.prototype = Object.create(THREE.PolyhedronGeometry.prototype), THREE.DodecahedronGeometry.prototype.constructor = THREE.DodecahedronGeometry, THREE.IcosahedronGeometry = function(a, b) {
        var c = (1 + Math.sqrt(5)) / 2;
        THREE.PolyhedronGeometry.call(this, [-1, c, 0, 1, c, 0, -1, -c, 0, 1, -c, 0, 0, -1, c, 0, 1, c, 0, -1, -c, 0, 1, -c, c, 0, -1, c, 0, 1, -c, 0, -1, -c, 0, 1], [0, 11, 5, 0, 5, 1, 0, 1, 7, 0, 7, 10, 0, 10, 11, 1, 5, 9, 5, 11, 4, 11, 10, 2, 10, 7, 6, 7, 1, 8, 3, 9, 4, 3, 4, 2, 3, 2, 6, 3, 6, 8, 3, 8, 9, 4, 9, 5, 2, 4, 11, 6, 2, 10, 8, 6, 7, 9, 8, 1], a, b), this.type = "IcosahedronGeometry", this.parameters = {
            radius: a,
            detail: b
        }
    }, THREE.IcosahedronGeometry.prototype = Object.create(THREE.PolyhedronGeometry.prototype), THREE.IcosahedronGeometry.prototype.constructor = THREE.IcosahedronGeometry, THREE.OctahedronGeometry = function(a, b) {
        THREE.PolyhedronGeometry.call(this, [1, 0, 0, -1, 0, 0, 0, 1, 0, 0, -1, 0, 0, 0, 1, 0, 0, -1], [0, 2, 4, 0, 4, 3, 0, 3, 5, 0, 5, 2, 1, 2, 5, 1, 5, 3, 1, 3, 4, 1, 4, 2], a, b), this.type = "OctahedronGeometry", this.parameters = {
            radius: a,
            detail: b
        }
    }, THREE.OctahedronGeometry.prototype = Object.create(THREE.PolyhedronGeometry.prototype), THREE.OctahedronGeometry.prototype.constructor = THREE.OctahedronGeometry, THREE.TetrahedronGeometry = function(a, b) {
        THREE.PolyhedronGeometry.call(this, [1, 1, 1, -1, -1, 1, -1, 1, -1, 1, -1, -1], [2, 1, 0, 0, 3, 2, 1, 3, 0, 2, 3, 1], a, b), this.type = "TetrahedronGeometry", this.parameters = {
            radius: a,
            detail: b
        }
    }, THREE.TetrahedronGeometry.prototype = Object.create(THREE.PolyhedronGeometry.prototype), THREE.TetrahedronGeometry.prototype.constructor = THREE.TetrahedronGeometry, THREE.ParametricGeometry = function(a, b, c) {
        THREE.Geometry.call(this), this.type = "ParametricGeometry", this.parameters = {
            func: a,
            slices: b,
            stacks: c
        };
        var d, e, f, g, h = this.vertices,
            i = this.faces,
            j = this.faceVertexUvs[0],
            k = b + 1;
        for (d = 0; c >= d; d++)
            for (g = d / c, e = 0; b >= e; e++) f = e / b, f = a(f, g), h.push(f);
        var l, m, n, o;
        for (d = 0; c > d; d++)
            for (e = 0; b > e; e++) a = d * k + e, h = d * k + e + 1, g = (d + 1) * k + e + 1, f = (d + 1) * k + e, l = new THREE.Vector2(e / b, d / c), m = new THREE.Vector2((e + 1) / b, d / c), n = new THREE.Vector2((e + 1) / b, (d + 1) / c), o = new THREE.Vector2(e / b, (d + 1) / c), i.push(new THREE.Face3(a, h, f)), j.push([l, m, o]), i.push(new THREE.Face3(h, g, f)), j.push([m.clone(), n, o.clone()]);
        this.computeFaceNormals(), this.computeVertexNormals()
    }, THREE.ParametricGeometry.prototype = Object.create(THREE.Geometry.prototype), THREE.ParametricGeometry.prototype.constructor = THREE.ParametricGeometry, THREE.WireframeGeometry = function(a) {
        function b(a, b) {
            return a - b
        }
        THREE.BufferGeometry.call(this);
        var c = [0, 0],
            d = {},
            e = ["a", "b", "c"];
        if (a instanceof THREE.Geometry) {
            var f = a.vertices,
                g = a.faces,
                h = 0,
                i = new Uint32Array(6 * g.length);
            a = 0;
            for (var j = g.length; j > a; a++)
                for (var k = g[a], l = 0; 3 > l; l++) {
                    c[0] = k[e[l]], c[1] = k[e[(l + 1) % 3]], c.sort(b);
                    var m = c.toString();
                    void 0 === d[m] && (i[2 * h] = c[0], i[2 * h + 1] = c[1], d[m] = !0, h++)
                }
            for (c = new Float32Array(6 * h), a = 0, j = h; j > a; a++)
                for (l = 0; 2 > l; l++) d = f[i[2 * a + l]], h = 6 * a + 3 * l, c[h + 0] = d.x, c[h + 1] = d.y, c[h + 2] = d.z;
            this.addAttribute("position", new THREE.BufferAttribute(c, 3))
        } else if (a instanceof THREE.BufferGeometry) {
            if (null !== a.index) {
                for (j = a.index.array, f = a.attributes.position, e = a.groups, h = 0, 0 === e.length && a.addGroup(0, j.length), i = new Uint32Array(2 * j.length), g = 0, k = e.length; k > g; ++g) {
                    a = e[g], l = a.start, m = a.count, a = l;
                    for (var n = l + m; n > a; a += 3)
                        for (l = 0; 3 > l; l++) c[0] = j[a + l], c[1] = j[a + (l + 1) % 3], c.sort(b), m = c.toString(), void 0 === d[m] && (i[2 * h] = c[0], i[2 * h + 1] = c[1], d[m] = !0, h++)
                }
                for (c = new Float32Array(6 * h), a = 0, j = h; j > a; a++)
                    for (l = 0; 2 > l; l++) h = 6 * a + 3 * l, d = i[2 * a + l], c[h + 0] = f.getX(d), c[h + 1] = f.getY(d), c[h + 2] = f.getZ(d)
            } else
                for (f = a.attributes.position.array, h = f.length / 3, i = h / 3, c = new Float32Array(6 * h), a = 0, j = i; j > a; a++)
                    for (l = 0; 3 > l; l++) h = 18 * a + 6 * l, i = 9 * a + 3 * l, c[h + 0] = f[i], c[h + 1] = f[i + 1], c[h + 2] = f[i + 2], d = 9 * a + (l + 1) % 3 * 3, c[h + 3] = f[d], c[h + 4] = f[d + 1], c[h + 5] = f[d + 2];
            this.addAttribute("position", new THREE.BufferAttribute(c, 3))
        }
    }, THREE.WireframeGeometry.prototype = Object.create(THREE.BufferGeometry.prototype), THREE.WireframeGeometry.prototype.constructor = THREE.WireframeGeometry, THREE.AxisHelper = function(a) {
        a = a || 1;
        var b = new Float32Array([0, 0, 0, a, 0, 0, 0, 0, 0, 0, a, 0, 0, 0, 0, 0, 0, a]),
            c = new Float32Array([1, 0, 0, 1, .6, 0, 0, 1, 0, .6, 1, 0, 0, 0, 1, 0, .6, 1]);
        a = new THREE.BufferGeometry, a.addAttribute("position", new THREE.BufferAttribute(b, 3)), a.addAttribute("color", new THREE.BufferAttribute(c, 3)), b = new THREE.LineBasicMaterial({
            vertexColors: THREE.VertexColors
        }), THREE.LineSegments.call(this, a, b)
    }, THREE.AxisHelper.prototype = Object.create(THREE.LineSegments.prototype), THREE.AxisHelper.prototype.constructor = THREE.AxisHelper, THREE.ArrowHelper = function() {
        var a = new THREE.BufferGeometry;
        a.addAttribute("position", new THREE.Float32Attribute([0, 0, 0, 0, 1, 0], 3));
        var b = new THREE.CylinderBufferGeometry(0, .5, 1, 5, 1);
        return b.translate(0, -.5, 0),
            function(c, d, e, f, g, h) {
                THREE.Object3D.call(this), void 0 === f && (f = 16776960), void 0 === e && (e = 1), void 0 === g && (g = .2 * e), void 0 === h && (h = .2 * g), this.position.copy(d), this.line = new THREE.Line(a, new THREE.LineBasicMaterial({
                    color: f
                })), this.line.matrixAutoUpdate = !1, this.add(this.line), this.cone = new THREE.Mesh(b, new THREE.MeshBasicMaterial({
                    color: f
                })), this.cone.matrixAutoUpdate = !1, this.add(this.cone), this.setDirection(c), this.setLength(e, g, h)
            }
    }(), THREE.ArrowHelper.prototype = Object.create(THREE.Object3D.prototype), THREE.ArrowHelper.prototype.constructor = THREE.ArrowHelper, THREE.ArrowHelper.prototype.setDirection = function() {
        var a, b = new THREE.Vector3;
        return function(c) {.99999 < c.y ? this.quaternion.set(0, 0, 0, 1) : -.99999 > c.y ? this.quaternion.set(1, 0, 0, 0) : (b.set(c.z, 0, -c.x).normalize(), a = Math.acos(c.y), this.quaternion.setFromAxisAngle(b, a))
        }
    }(), THREE.ArrowHelper.prototype.setLength = function(a, b, c) {
        void 0 === b && (b = .2 * a), void 0 === c && (c = .2 * b), this.line.scale.set(1, Math.max(0, a - b), 1), this.line.updateMatrix(), this.cone.scale.set(c, b, c), this.cone.position.y = a, this.cone.updateMatrix()
    }, THREE.ArrowHelper.prototype.setColor = function(a) {
        this.line.material.color.copy(a), this.cone.material.color.copy(a)
    }, THREE.BoxHelper = function(a, b) {
        void 0 === b && (b = 16776960);
        var c = new Uint16Array([0, 1, 1, 2, 2, 3, 3, 0, 4, 5, 5, 6, 6, 7, 7, 4, 0, 4, 1, 5, 2, 6, 3, 7]),
            d = new Float32Array(24),
            e = new THREE.BufferGeometry;
        e.setIndex(new THREE.BufferAttribute(c, 1)), e.addAttribute("position", new THREE.BufferAttribute(d, 3)), THREE.LineSegments.call(this, e, new THREE.LineBasicMaterial({
            color: b
        })), void 0 !== a && this.update(a)
    }, THREE.BoxHelper.prototype = Object.create(THREE.LineSegments.prototype), THREE.BoxHelper.prototype.constructor = THREE.BoxHelper, THREE.BoxHelper.prototype.update = function() {
        var a = new THREE.Box3;
        return function(b) {
            if (b instanceof THREE.Box3 ? a.copy(b) : a.setFromObject(b), !a.isEmpty()) {
                b = a.min;
                var c = a.max,
                    d = this.geometry.attributes.position,
                    e = d.array;
                e[0] = c.x, e[1] = c.y, e[2] = c.z, e[3] = b.x, e[4] = c.y, e[5] = c.z, e[6] = b.x, e[7] = b.y, e[8] = c.z, e[9] = c.x, e[10] = b.y, e[11] = c.z, e[12] = c.x, e[13] = c.y, e[14] = b.z, e[15] = b.x, e[16] = c.y, e[17] = b.z, e[18] = b.x, e[19] = b.y, e[20] = b.z, e[21] = c.x, e[22] = b.y, e[23] = b.z, d.needsUpdate = !0, this.geometry.computeBoundingSphere()
            }
        }
    }(), THREE.BoundingBoxHelper = function(a, b) {
        var c = void 0 !== b ? b : 8947848;
        this.object = a, this.box = new THREE.Box3, THREE.Mesh.call(this, new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial({
            color: c,
            wireframe: !0
        }))
    }, THREE.BoundingBoxHelper.prototype = Object.create(THREE.Mesh.prototype), THREE.BoundingBoxHelper.prototype.constructor = THREE.BoundingBoxHelper, THREE.BoundingBoxHelper.prototype.update = function() {
        this.box.setFromObject(this.object), this.box.size(this.scale), this.box.center(this.position)
    }, THREE.CameraHelper = function(a) {
        function b(a, b, d) {
            c(a, d), c(b, d)
        }

        function c(a, b) {
            d.vertices.push(new THREE.Vector3), d.colors.push(new THREE.Color(b)), void 0 === f[a] && (f[a] = []), f[a].push(d.vertices.length - 1)
        }
        var d = new THREE.Geometry,
            e = new THREE.LineBasicMaterial({
                color: 16777215,
                vertexColors: THREE.FaceColors
            }),
            f = {};
        b("n1", "n2", 16755200), b("n2", "n4", 16755200), b("n4", "n3", 16755200), b("n3", "n1", 16755200), b("f1", "f2", 16755200), b("f2", "f4", 16755200), b("f4", "f3", 16755200), b("f3", "f1", 16755200), b("n1", "f1", 16755200), b("n2", "f2", 16755200), b("n3", "f3", 16755200), b("n4", "f4", 16755200), b("p", "n1", 16711680), b("p", "n2", 16711680), b("p", "n3", 16711680), b("p", "n4", 16711680), b("u1", "u2", 43775), b("u2", "u3", 43775), b("u3", "u1", 43775), b("c", "t", 16777215), b("p", "c", 3355443), b("cn1", "cn2", 3355443), b("cn3", "cn4", 3355443), b("cf1", "cf2", 3355443), b("cf3", "cf4", 3355443), THREE.LineSegments.call(this, d, e), this.camera = a, this.camera.updateProjectionMatrix && this.camera.updateProjectionMatrix(), this.matrix = a.matrixWorld, this.matrixAutoUpdate = !1, this.pointMap = f, this.update()
    }, THREE.CameraHelper.prototype = Object.create(THREE.LineSegments.prototype), THREE.CameraHelper.prototype.constructor = THREE.CameraHelper, THREE.CameraHelper.prototype.update = function() {
        function a(a, f, g, h) {
            if (d.set(f, g, h).unproject(e), a = c[a], void 0 !== a)
                for (f = 0, g = a.length; g > f; f++) b.vertices[a[f]].copy(d)
        }
        var b, c, d = new THREE.Vector3,
            e = new THREE.Camera;
        return function() {
            b = this.geometry, c = this.pointMap, e.projectionMatrix.copy(this.camera.projectionMatrix), a("c", 0, 0, -1), a("t", 0, 0, 1), a("n1", -1, -1, -1), a("n2", 1, -1, -1), a("n3", -1, 1, -1), a("n4", 1, 1, -1), a("f1", -1, -1, 1), a("f2", 1, -1, 1), a("f3", -1, 1, 1), a("f4", 1, 1, 1), a("u1", .7, 1.1, -1), a("u2", -.7, 1.1, -1), a("u3", 0, 2, -1), a("cf1", -1, 0, 1), a("cf2", 1, 0, 1), a("cf3", 0, -1, 1), a("cf4", 0, 1, 1), a("cn1", -1, 0, -1), a("cn2", 1, 0, -1), a("cn3", 0, -1, -1), a("cn4", 0, 1, -1), b.verticesNeedUpdate = !0
        }
    }(), THREE.DirectionalLightHelper = function(a, b) {
        THREE.Object3D.call(this), this.light = a, this.light.updateMatrixWorld(), this.matrix = a.matrixWorld, this.matrixAutoUpdate = !1, void 0 === b && (b = 1);
        var c = new THREE.BufferGeometry;
        c.addAttribute("position", new THREE.Float32Attribute([-b, b, 0, b, b, 0, b, -b, 0, -b, -b, 0, -b, b, 0], 3));
        var d = new THREE.LineBasicMaterial({
            fog: !1
        });
        this.add(new THREE.Line(c, d)), c = new THREE.BufferGeometry, c.addAttribute("position", new THREE.Float32Attribute([0, 0, 0, 0, 0, 1], 3)), this.add(new THREE.Line(c, d)), this.update()
    }, THREE.DirectionalLightHelper.prototype = Object.create(THREE.Object3D.prototype), THREE.DirectionalLightHelper.prototype.constructor = THREE.DirectionalLightHelper,
    THREE.DirectionalLightHelper.prototype.dispose = function() {
        var a = this.children[0],
            b = this.children[1];
        a.geometry.dispose(), a.material.dispose(), b.geometry.dispose(), b.material.dispose()
    }, THREE.DirectionalLightHelper.prototype.update = function() {
        var a = new THREE.Vector3,
            b = new THREE.Vector3,
            c = new THREE.Vector3;
        return function() {
            a.setFromMatrixPosition(this.light.matrixWorld), b.setFromMatrixPosition(this.light.target.matrixWorld), c.subVectors(b, a);
            var d = this.children[0],
                e = this.children[1];
            d.lookAt(c), d.material.color.copy(this.light.color).multiplyScalar(this.light.intensity), e.lookAt(c), e.scale.z = c.length()
        }
    }(), THREE.EdgesHelper = function(a, b, c) {
        b = void 0 !== b ? b : 16777215, THREE.LineSegments.call(this, new THREE.EdgesGeometry(a.geometry, c), new THREE.LineBasicMaterial({
            color: b
        })), this.matrix = a.matrixWorld, this.matrixAutoUpdate = !1
    }, THREE.EdgesHelper.prototype = Object.create(THREE.LineSegments.prototype), THREE.EdgesHelper.prototype.constructor = THREE.EdgesHelper, THREE.FaceNormalsHelper = function(a, b, c, d) {
        this.object = a, this.size = void 0 !== b ? b : 1, a = void 0 !== c ? c : 16776960, d = void 0 !== d ? d : 1, b = 0, c = this.object.geometry, c instanceof THREE.Geometry ? b = c.faces.length : console.warn("THREE.FaceNormalsHelper: only THREE.Geometry is supported. Use THREE.VertexNormalsHelper, instead."), c = new THREE.BufferGeometry, b = new THREE.Float32Attribute(6 * b, 3), c.addAttribute("position", b), THREE.LineSegments.call(this, c, new THREE.LineBasicMaterial({
            color: a,
            linewidth: d
        })), this.matrixAutoUpdate = !1, this.update()
    }, THREE.FaceNormalsHelper.prototype = Object.create(THREE.LineSegments.prototype), THREE.FaceNormalsHelper.prototype.constructor = THREE.FaceNormalsHelper, THREE.FaceNormalsHelper.prototype.update = function() {
        var a = new THREE.Vector3,
            b = new THREE.Vector3,
            c = new THREE.Matrix3;
        return function() {
            this.object.updateMatrixWorld(!0), c.getNormalMatrix(this.object.matrixWorld);
            for (var d = this.object.matrixWorld, e = this.geometry.attributes.position, f = this.object.geometry, g = f.vertices, f = f.faces, h = 0, i = 0, j = f.length; j > i; i++) {
                var k = f[i],
                    l = k.normal;
                a.copy(g[k.a]).add(g[k.b]).add(g[k.c]).divideScalar(3).applyMatrix4(d), b.copy(l).applyMatrix3(c).normalize().multiplyScalar(this.size).add(a), e.setXYZ(h, a.x, a.y, a.z), h += 1, e.setXYZ(h, b.x, b.y, b.z), h += 1
            }
            return e.needsUpdate = !0, this
        }
    }(), THREE.GridHelper = function(a, b, c, d) {
        b = b || 1, c = new THREE.Color(void 0 !== c ? c : 4473924), d = new THREE.Color(void 0 !== d ? d : 8947848);
        for (var e = b / 2, f = 2 * a / b, g = [], h = [], i = 0, j = 0, k = -a; b >= i; i++, k += f) {
            g.push(-a, 0, k, a, 0, k), g.push(k, 0, -a, k, 0, a);
            var l = i === e ? c : d;
            l.toArray(h, j), j += 3, l.toArray(h, j), j += 3, l.toArray(h, j), j += 3, l.toArray(h, j), j += 3
        }
        a = new THREE.BufferGeometry, a.addAttribute("position", new THREE.Float32Attribute(g, 3)), a.addAttribute("color", new THREE.Float32Attribute(h, 3)), g = new THREE.LineBasicMaterial({
            vertexColors: THREE.VertexColors
        }), THREE.LineSegments.call(this, a, g)
    }, THREE.GridHelper.prototype = Object.create(THREE.LineSegments.prototype), THREE.GridHelper.prototype.constructor = THREE.GridHelper, THREE.GridHelper.prototype.setColors = function() {
        console.error("THREE.GridHelper: setColors() has been deprecated, pass them in the constructor instead.")
    }, THREE.HemisphereLightHelper = function(a, b) {
        THREE.Object3D.call(this), this.light = a, this.light.updateMatrixWorld(), this.matrix = a.matrixWorld, this.matrixAutoUpdate = !1, this.colors = [new THREE.Color, new THREE.Color];
        var c = new THREE.SphereGeometry(b, 4, 2);
        c.rotateX(-Math.PI / 2);
        for (var d = 0; 8 > d; d++) c.faces[d].color = this.colors[4 > d ? 0 : 1];
        d = new THREE.MeshBasicMaterial({
            vertexColors: THREE.FaceColors,
            wireframe: !0
        }), this.lightSphere = new THREE.Mesh(c, d), this.add(this.lightSphere), this.update()
    }, THREE.HemisphereLightHelper.prototype = Object.create(THREE.Object3D.prototype), THREE.HemisphereLightHelper.prototype.constructor = THREE.HemisphereLightHelper, THREE.HemisphereLightHelper.prototype.dispose = function() {
        this.lightSphere.geometry.dispose(), this.lightSphere.material.dispose()
    }, THREE.HemisphereLightHelper.prototype.update = function() {
        var a = new THREE.Vector3;
        return function() {
            this.colors[0].copy(this.light.color).multiplyScalar(this.light.intensity), this.colors[1].copy(this.light.groundColor).multiplyScalar(this.light.intensity), this.lightSphere.lookAt(a.setFromMatrixPosition(this.light.matrixWorld).negate()), this.lightSphere.geometry.colorsNeedUpdate = !0
        }
    }(), THREE.PointLightHelper = function(a, b) {
        this.light = a, this.light.updateMatrixWorld();
        var c = new THREE.SphereBufferGeometry(b, 4, 2),
            d = new THREE.MeshBasicMaterial({
                wireframe: !0,
                fog: !1
            });
        d.color.copy(this.light.color).multiplyScalar(this.light.intensity), THREE.Mesh.call(this, c, d), this.matrix = this.light.matrixWorld, this.matrixAutoUpdate = !1
    }, THREE.PointLightHelper.prototype = Object.create(THREE.Mesh.prototype), THREE.PointLightHelper.prototype.constructor = THREE.PointLightHelper, THREE.PointLightHelper.prototype.dispose = function() {
        this.geometry.dispose(), this.material.dispose()
    }, THREE.PointLightHelper.prototype.update = function() {
        this.material.color.copy(this.light.color).multiplyScalar(this.light.intensity)
    }, THREE.SkeletonHelper = function(a) {
        this.bones = this.getBoneList(a);
        for (var b = new THREE.Geometry, c = 0; c < this.bones.length; c++) this.bones[c].parent instanceof THREE.Bone && (b.vertices.push(new THREE.Vector3), b.vertices.push(new THREE.Vector3), b.colors.push(new THREE.Color(0, 0, 1)), b.colors.push(new THREE.Color(0, 1, 0)));
        b.dynamic = !0, c = new THREE.LineBasicMaterial({
            vertexColors: THREE.VertexColors,
            depthTest: !1,
            depthWrite: !1,
            transparent: !0
        }), THREE.LineSegments.call(this, b, c), this.root = a, this.matrix = a.matrixWorld, this.matrixAutoUpdate = !1, this.update()
    }, THREE.SkeletonHelper.prototype = Object.create(THREE.LineSegments.prototype), THREE.SkeletonHelper.prototype.constructor = THREE.SkeletonHelper, THREE.SkeletonHelper.prototype.getBoneList = function(a) {
        var b = [];
        a instanceof THREE.Bone && b.push(a);
        for (var c = 0; c < a.children.length; c++) b.push.apply(b, this.getBoneList(a.children[c]));
        return b
    }, THREE.SkeletonHelper.prototype.update = function() {
        for (var a = this.geometry, b = (new THREE.Matrix4).getInverse(this.root.matrixWorld), c = new THREE.Matrix4, d = 0, e = 0; e < this.bones.length; e++) {
            var f = this.bones[e];
            f.parent instanceof THREE.Bone && (c.multiplyMatrices(b, f.matrixWorld), a.vertices[d].setFromMatrixPosition(c), c.multiplyMatrices(b, f.parent.matrixWorld), a.vertices[d + 1].setFromMatrixPosition(c), d += 2)
        }
        a.verticesNeedUpdate = !0, a.computeBoundingSphere()
    }, THREE.SpotLightHelper = function(a) {
        THREE.Object3D.call(this), this.light = a, this.light.updateMatrixWorld(), this.matrix = a.matrixWorld, this.matrixAutoUpdate = !1, a = new THREE.BufferGeometry;
        for (var b = [0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, -1, 0, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, -1, 1], c = 0, d = 1; 32 > c; c++, d++) {
            var e = c / 32 * Math.PI * 2,
                f = d / 32 * Math.PI * 2;
            b.push(Math.cos(e), Math.sin(e), 1, Math.cos(f), Math.sin(f), 1)
        }
        a.addAttribute("position", new THREE.Float32Attribute(b, 3)), b = new THREE.LineBasicMaterial({
            fog: !1
        }), this.cone = new THREE.LineSegments(a, b), this.add(this.cone), this.update()
    }, THREE.SpotLightHelper.prototype = Object.create(THREE.Object3D.prototype), THREE.SpotLightHelper.prototype.constructor = THREE.SpotLightHelper, THREE.SpotLightHelper.prototype.dispose = function() {
        this.cone.geometry.dispose(), this.cone.material.dispose()
    }, THREE.SpotLightHelper.prototype.update = function() {
        var a = new THREE.Vector3,
            b = new THREE.Vector3;
        return function() {
            var c = this.light.distance ? this.light.distance : 1e3,
                d = c * Math.tan(this.light.angle);
            this.cone.scale.set(d, d, c), a.setFromMatrixPosition(this.light.matrixWorld), b.setFromMatrixPosition(this.light.target.matrixWorld), this.cone.lookAt(b.sub(a)), this.cone.material.color.copy(this.light.color).multiplyScalar(this.light.intensity)
        }
    }(), THREE.VertexNormalsHelper = function(a, b, c, d) {
        this.object = a, this.size = void 0 !== b ? b : 1, a = void 0 !== c ? c : 16711680, d = void 0 !== d ? d : 1, b = 0, c = this.object.geometry, c instanceof THREE.Geometry ? b = 3 * c.faces.length : c instanceof THREE.BufferGeometry && (b = c.attributes.normal.count), c = new THREE.BufferGeometry, b = new THREE.Float32Attribute(6 * b, 3), c.addAttribute("position", b), THREE.LineSegments.call(this, c, new THREE.LineBasicMaterial({
            color: a,
            linewidth: d
        })), this.matrixAutoUpdate = !1, this.update()
    }, THREE.VertexNormalsHelper.prototype = Object.create(THREE.LineSegments.prototype), THREE.VertexNormalsHelper.prototype.constructor = THREE.VertexNormalsHelper, THREE.VertexNormalsHelper.prototype.update = function() {
        var a = new THREE.Vector3,
            b = new THREE.Vector3,
            c = new THREE.Matrix3;
        return function() {
            var d = ["a", "b", "c"];
            this.object.updateMatrixWorld(!0), c.getNormalMatrix(this.object.matrixWorld);
            var e = this.object.matrixWorld,
                f = this.geometry.attributes.position,
                g = this.object.geometry;
            if (g instanceof THREE.Geometry)
                for (var h = g.vertices, i = g.faces, j = g = 0, k = i.length; k > j; j++)
                    for (var l = i[j], m = 0, n = l.vertexNormals.length; n > m; m++) {
                        var o = l.vertexNormals[m];
                        a.copy(h[l[d[m]]]).applyMatrix4(e), b.copy(o).applyMatrix3(c).normalize().multiplyScalar(this.size).add(a), f.setXYZ(g, a.x, a.y, a.z), g += 1, f.setXYZ(g, b.x, b.y, b.z), g += 1
                    } else if (g instanceof THREE.BufferGeometry)
                        for (d = g.attributes.position, h = g.attributes.normal, m = g = 0, n = d.count; n > m; m++) a.set(d.getX(m), d.getY(m), d.getZ(m)).applyMatrix4(e), b.set(h.getX(m), h.getY(m), h.getZ(m)), b.applyMatrix3(c).normalize().multiplyScalar(this.size).add(a), f.setXYZ(g, a.x, a.y, a.z), g += 1, f.setXYZ(g, b.x, b.y, b.z), g += 1;
            return f.needsUpdate = !0, this
        }
    }(), THREE.WireframeHelper = function(a, b) {
        var c = void 0 !== b ? b : 16777215;
        THREE.LineSegments.call(this, new THREE.WireframeGeometry(a.geometry), new THREE.LineBasicMaterial({
            color: c
        })), this.matrix = a.matrixWorld, this.matrixAutoUpdate = !1
    }, THREE.WireframeHelper.prototype = Object.create(THREE.LineSegments.prototype), THREE.WireframeHelper.prototype.constructor = THREE.WireframeHelper, THREE.ImmediateRenderObject = function(a) {
        THREE.Object3D.call(this), this.material = a, this.render = function(a) {}
    }, THREE.ImmediateRenderObject.prototype = Object.create(THREE.Object3D.prototype), THREE.ImmediateRenderObject.prototype.constructor = THREE.ImmediateRenderObject, THREE.MorphBlendMesh = function(a, b) {
        THREE.Mesh.call(this, a, b), this.animationsMap = {}, this.animationsList = [];
        var c = this.geometry.morphTargets.length;
        this.createAnimation("__default", 0, c - 1, c / 1), this.setAnimationWeight("__default", 1)
    }, THREE.MorphBlendMesh.prototype = Object.create(THREE.Mesh.prototype), THREE.MorphBlendMesh.prototype.constructor = THREE.MorphBlendMesh, THREE.MorphBlendMesh.prototype.createAnimation = function(a, b, c, d) {
        b = {
            start: b,
            end: c,
            length: c - b + 1,
            fps: d,
            duration: (c - b) / d,
            lastFrame: 0,
            currentFrame: 0,
            active: !1,
            time: 0,
            direction: 1,
            weight: 1,
            directionBackwards: !1,
            mirroredLoop: !1
        }, this.animationsMap[a] = b, this.animationsList.push(b)
    }, THREE.MorphBlendMesh.prototype.autoCreateAnimations = function(a) {
        for (var b, c = /([a-z]+)_?(\d+)/i, d = {}, e = this.geometry, f = 0, g = e.morphTargets.length; g > f; f++) {
            var h = e.morphTargets[f].name.match(c);
            if (h && 1 < h.length) {
                var i = h[1];
                d[i] || (d[i] = {
                    start: 1 / 0,
                    end: -(1 / 0)
                }), h = d[i], f < h.start && (h.start = f), f > h.end && (h.end = f), b || (b = i)
            }
        }
        for (i in d) h = d[i], this.createAnimation(i, h.start, h.end, a);
        this.firstAnimation = b
    }, THREE.MorphBlendMesh.prototype.setAnimationDirectionForward = function(a) {
        (a = this.animationsMap[a]) && (a.direction = 1, a.directionBackwards = !1)
    }, THREE.MorphBlendMesh.prototype.setAnimationDirectionBackward = function(a) {
        (a = this.animationsMap[a]) && (a.direction = -1, a.directionBackwards = !0)
    }, THREE.MorphBlendMesh.prototype.setAnimationFPS = function(a, b) {
        var c = this.animationsMap[a];
        c && (c.fps = b, c.duration = (c.end - c.start) / c.fps)
    }, THREE.MorphBlendMesh.prototype.setAnimationDuration = function(a, b) {
        var c = this.animationsMap[a];
        c && (c.duration = b, c.fps = (c.end - c.start) / c.duration)
    }, THREE.MorphBlendMesh.prototype.setAnimationWeight = function(a, b) {
        var c = this.animationsMap[a];
        c && (c.weight = b)
    }, THREE.MorphBlendMesh.prototype.setAnimationTime = function(a, b) {
        var c = this.animationsMap[a];
        c && (c.time = b)
    }, THREE.MorphBlendMesh.prototype.getAnimationTime = function(a) {
        var b = 0;
        return (a = this.animationsMap[a]) && (b = a.time), b
    }, THREE.MorphBlendMesh.prototype.getAnimationDuration = function(a) {
        var b = -1;
        return (a = this.animationsMap[a]) && (b = a.duration), b
    }, THREE.MorphBlendMesh.prototype.playAnimation = function(a) {
        var b = this.animationsMap[a];
        b ? (b.time = 0, b.active = !0) : console.warn("THREE.MorphBlendMesh: animation[" + a + "] undefined in .playAnimation()")
    }, THREE.MorphBlendMesh.prototype.stopAnimation = function(a) {
        (a = this.animationsMap[a]) && (a.active = !1)
    }, THREE.MorphBlendMesh.prototype.update = function(a) {
        for (var b = 0, c = this.animationsList.length; c > b; b++) {
            var d = this.animationsList[b];
            if (d.active) {
                var e = d.duration / d.length;
                d.time += d.direction * a, d.mirroredLoop ? (d.time > d.duration || 0 > d.time) && (d.direction *= -1, d.time > d.duration && (d.time = d.duration, d.directionBackwards = !0), 0 > d.time && (d.time = 0, d.directionBackwards = !1)) : (d.time %= d.duration, 0 > d.time && (d.time += d.duration));
                var f = d.start + THREE.Math.clamp(Math.floor(d.time / e), 0, d.length - 1),
                    g = d.weight;
                f !== d.currentFrame && (this.morphTargetInfluences[d.lastFrame] = 0, this.morphTargetInfluences[d.currentFrame] = 1 * g, this.morphTargetInfluences[f] = 0, d.lastFrame = d.currentFrame, d.currentFrame = f), e = d.time % e / e, d.directionBackwards && (e = 1 - e), d.currentFrame !== d.lastFrame ? (this.morphTargetInfluences[d.currentFrame] = e * g, this.morphTargetInfluences[d.lastFrame] = (1 - e) * g) : this.morphTargetInfluences[d.currentFrame] = g
            }
        }
    }, THREE.TrackballControls = function(a, b) {
        function c(a) {
            m.enabled !== !1 && (window.removeEventListener("keydown", c), r = q, q === n.NONE && (a.keyCode !== m.keys[n.ROTATE] || m.noRotate ? a.keyCode !== m.keys[n.ZOOM] || m.noZoom ? a.keyCode !== m.keys[n.PAN] || m.noPan || (q = n.PAN) : q = n.ZOOM : q = n.ROTATE))
        }

        function d(a) {
            m.enabled !== !1 && (q = r, window.addEventListener("keydown", c, !1))
        }

        function e(a) {
            m.enabled !== !1 && (a.preventDefault(), a.stopPropagation(), q === n.NONE && (q = a.button), q !== n.ROTATE || m.noRotate ? q !== n.ZOOM || m.noZoom ? q !== n.PAN || m.noPan || (B.copy(G(a.pageX, a.pageY)), C.copy(B)) : (x.copy(G(a.pageX, a.pageY)), y.copy(x)) : (u.copy(H(a.pageX, a.pageY)), t.copy(u)), document.addEventListener("mousemove", f, !1), document.addEventListener("mouseup", g, !1), m.dispatchEvent(E))
        }

        function f(a) {
            m.enabled !== !1 && (a.preventDefault(), a.stopPropagation(), q !== n.ROTATE || m.noRotate ? q !== n.ZOOM || m.noZoom ? q !== n.PAN || m.noPan || C.copy(G(a.pageX, a.pageY)) : y.copy(G(a.pageX, a.pageY)) : (t.copy(u), u.copy(H(a.pageX, a.pageY))))
        }

        function g(a) {
            m.enabled !== !1 && (a.preventDefault(), a.stopPropagation(), q = n.NONE, document.removeEventListener("mousemove", f), document.removeEventListener("mouseup", g), m.dispatchEvent(F))
        }

        function h(a) {
            if (m.enabled !== !1) {
                a.preventDefault(), a.stopPropagation();
                var b = 0;
                a.wheelDelta ? b = a.wheelDelta / 40 : a.detail && (b = -a.detail / 3), x.y += .01 * b, m.dispatchEvent(E), m.dispatchEvent(F)
            }
        }

        function i(a) {
            if (m.enabled !== !1) {
                switch (a.touches.length) {
                    case 1:
                        q = n.TOUCH_ROTATE, u.copy(H(a.touches[0].pageX, a.touches[0].pageY)), t.copy(u);
                        break;
                    default:
                        q = n.TOUCH_ZOOM_PAN;
                        var b = a.touches[0].pageX - a.touches[1].pageX,
                            c = a.touches[0].pageY - a.touches[1].pageY;
                        A = z = Math.sqrt(b * b + c * c);
                        var d = (a.touches[0].pageX + a.touches[1].pageX) / 2,
                            e = (a.touches[0].pageY + a.touches[1].pageY) / 2;
                        B.copy(G(d, e)), C.copy(B)
                }
                m.dispatchEvent(E)
            }
        }

        function j(a) {
            if (m.enabled !== !1) switch (a.preventDefault(), a.stopPropagation(), a.touches.length) {
                case 1:
                    t.copy(u), u.copy(H(a.touches[0].pageX, a.touches[0].pageY));
                    break;
                default:
                    var b = a.touches[0].pageX - a.touches[1].pageX,
                        c = a.touches[0].pageY - a.touches[1].pageY;
                    A = Math.sqrt(b * b + c * c);
                    var d = (a.touches[0].pageX + a.touches[1].pageX) / 2,
                        e = (a.touches[0].pageY + a.touches[1].pageY) / 2;
                    C.copy(G(d, e))
            }
        }

        function k(a) {
            if (m.enabled !== !1) {
                switch (a.touches.length) {
                    case 0:
                        q = n.NONE;
                        break;
                    case 1:
                        q = n.TOUCH_ROTATE, u.copy(H(a.touches[0].pageX, a.touches[0].pageY)), t.copy(u)
                }
                m.dispatchEvent(F)
            }
        }

        function l(a) {
            a.preventDefault()
        }
        var m = this,
            n = {
                NONE: -1,
                ROTATE: 0,
                ZOOM: 1,
                PAN: 2,
                TOUCH_ROTATE: 3,
                TOUCH_ZOOM_PAN: 4
            };
        this.object = a, this.domElement = void 0 !== b ? b : document, this.enabled = !0, this.screen = {
            left: 0,
            top: 0,
            width: 0,
            height: 0
        }, this.rotateSpeed = 1, this.zoomSpeed = 1.2, this.panSpeed = .3, this.noRotate = !1, this.noZoom = !1, this.noPan = !1, this.staticMoving = !1, this.dynamicDampingFactor = .2, this.minDistance = 0, this.maxDistance = 1 / 0, this.keys = [65, 83, 68], this.target = new THREE.Vector3;
        var o = 1e-6,
            p = new THREE.Vector3,
            q = n.NONE,
            r = n.NONE,
            s = new THREE.Vector3,
            t = new THREE.Vector2,
            u = new THREE.Vector2,
            v = new THREE.Vector3,
            w = 0,
            x = new THREE.Vector2,
            y = new THREE.Vector2,
            z = 0,
            A = 0,
            B = new THREE.Vector2,
            C = new THREE.Vector2;
        this.target0 = this.target.clone(), this.position0 = this.object.position.clone(), this.up0 = this.object.up.clone();
        var D = {
                type: "change"
            },
            E = {
                type: "start"
            },
            F = {
                type: "end"
            };
        this.handleResize = function() {
            if (this.domElement === document) this.screen.left = 0, this.screen.top = 0, this.screen.width = window.innerWidth, this.screen.height = window.innerHeight;
            else {
                var a = this.domElement.getBoundingClientRect(),
                    b = this.domElement.ownerDocument.documentElement;
                this.screen.left = a.left + window.pageXOffset - b.clientLeft, this.screen.top = a.top + window.pageYOffset - b.clientTop, this.screen.width = a.width, this.screen.height = a.height
            }
        }, this.handleEvent = function(a) {
            "function" == typeof this[a.type] && this[a.type](a)
        };
        var G = function() {
                var a = new THREE.Vector2;
                return function(b, c) {
                    return a.set((b - m.screen.left) / m.screen.width, (c - m.screen.top) / m.screen.height), a
                }
            }(),
            H = function() {
                var a = new THREE.Vector2;
                return function(b, c) {
                    return a.set((b - .5 * m.screen.width - m.screen.left) / (.5 * m.screen.width), (m.screen.height + 2 * (m.screen.top - c)) / m.screen.width), a
                }
            }();
        this.rotateCamera = function() {
            var a, b = new THREE.Vector3,
                c = new THREE.Quaternion,
                d = new THREE.Vector3,
                e = new THREE.Vector3,
                f = new THREE.Vector3,
                g = new THREE.Vector3;
            return function() {
                g.set(u.x - t.x, u.y - t.y, 0), a = g.length(), a ? (s.copy(m.object.position).sub(m.target), d.copy(s).normalize(), e.copy(m.object.up).normalize(), f.crossVectors(e, d).normalize(), e.setLength(u.y - t.y), f.setLength(u.x - t.x), g.copy(e.add(f)), b.crossVectors(g, s).normalize(), a *= m.rotateSpeed, c.setFromAxisAngle(b, a), s.applyQuaternion(c), m.object.up.applyQuaternion(c), v.copy(b), w = a) : !m.staticMoving && w && (w *= Math.sqrt(1 - m.dynamicDampingFactor), s.copy(m.object.position).sub(m.target), c.setFromAxisAngle(v, w), s.applyQuaternion(c), m.object.up.applyQuaternion(c)), t.copy(u)
            }
        }(), this.zoomCamera = function() {
            var a;
            q === n.TOUCH_ZOOM_PAN ? (a = z / A, z = A, s.multiplyScalar(a)) : (a = 1 + (y.y - x.y) * m.zoomSpeed, 1 !== a && a > 0 && (s.multiplyScalar(a), m.staticMoving ? x.copy(y) : x.y += (y.y - x.y) * this.dynamicDampingFactor))
        }, this.panCamera = function() {
            var a = new THREE.Vector2,
                b = new THREE.Vector3,
                c = new THREE.Vector3;
            return function() {
                a.copy(C).sub(B), a.lengthSq() && (a.multiplyScalar(s.length() * m.panSpeed), c.copy(s).cross(m.object.up).setLength(a.x), c.add(b.copy(m.object.up).setLength(a.y)), m.object.position.add(c), m.target.add(c), m.staticMoving ? B.copy(C) : B.add(a.subVectors(C, B).multiplyScalar(m.dynamicDampingFactor)))
            }
        }(), this.checkDistances = function() {
            m.noZoom && m.noPan || (s.lengthSq() > m.maxDistance * m.maxDistance && (m.object.position.addVectors(m.target, s.setLength(m.maxDistance)), x.copy(y)), s.lengthSq() < m.minDistance * m.minDistance && (m.object.position.addVectors(m.target, s.setLength(m.minDistance)), x.copy(y)))
        }, this.update = function() {
            s.subVectors(m.object.position, m.target), m.noRotate || m.rotateCamera(), m.noZoom || m.zoomCamera(), m.noPan || m.panCamera(), m.object.position.addVectors(m.target, s), m.checkDistances(), m.object.lookAt(m.target), p.distanceToSquared(m.object.position) > o && (m.dispatchEvent(D), p.copy(m.object.position))
        }, this.reset = function() {
            q = n.NONE, r = n.NONE, m.target.copy(m.target0), m.object.position.copy(m.position0), m.object.up.copy(m.up0), s.subVectors(m.object.position, m.target), m.object.lookAt(m.target), m.dispatchEvent(D), p.copy(m.object.position)
        }, this.dispose = function() {
            this.domElement.removeEventListener("contextmenu", l, !1), this.domElement.removeEventListener("mousedown", e, !1), this.domElement.removeEventListener("mousewheel", h, !1), this.domElement.removeEventListener("MozMousePixelScroll", h, !1), this.domElement.removeEventListener("touchstart", i, !1), this.domElement.removeEventListener("touchend", k, !1), this.domElement.removeEventListener("touchmove", j, !1), document.removeEventListener("mousemove", f, !1), document.removeEventListener("mouseup", g, !1), window.removeEventListener("keydown", c, !1), window.removeEventListener("keyup", d, !1)
        }, this.domElement.addEventListener("contextmenu", l, !1), this.domElement.addEventListener("mousedown", e, !1), this.domElement.addEventListener("mousewheel", h, !1), this.domElement.addEventListener("MozMousePixelScroll", h, !1), this.domElement.addEventListener("touchstart", i, !1), this.domElement.addEventListener("touchend", k, !1), this.domElement.addEventListener("touchmove", j, !1), window.addEventListener("keydown", c, !1), window.addEventListener("keyup", d, !1), this.handleResize(), this.update()
    }, THREE.TrackballControls.prototype = Object.create(THREE.EventDispatcher.prototype), THREE.TrackballControls.prototype.constructor = THREE.TrackballControls, THREE.EffectComposer = function(a, b) {
        if (this.renderer = a, void 0 === b) {
            var c = {
                    minFilter: THREE.LinearFilter,
                    magFilter: THREE.LinearFilter,
                    format: THREE.RGBAFormat,
                    stencilBuffer: !1
                },
                d = a.getSize();
            b = new THREE.WebGLRenderTarget(d.width, d.height, c)
        }
        this.renderTarget1 = b, this.renderTarget2 = b.clone(), this.writeBuffer = this.renderTarget1, this.readBuffer = this.renderTarget2, this.passes = [], void 0 === THREE.CopyShader && console.error("THREE.EffectComposer relies on THREE.CopyShader"), this.copyPass = new THREE.ShaderPass(THREE.CopyShader)
    }, Object.assign(THREE.EffectComposer.prototype, {
        swapBuffers: function() {
            var a = this.readBuffer;
            this.readBuffer = this.writeBuffer, this.writeBuffer = a
        },
        addPass: function(a) {
            this.passes.push(a);
            var b = this.renderer.getSize();
            a.setSize(b.width, b.height)
        },
        insertPass: function(a, b) {
            this.passes.splice(b, 0, a)
        },
        render: function(a) {
            var b, c, d = !1,
                e = this.passes.length;
            for (c = 0; e > c; c++)
                if (b = this.passes[c], b.enabled !== !1) {
                    if (b.render(this.renderer, this.writeBuffer, this.readBuffer, a, d), b.needsSwap) {
                        if (d) {
                            var f = this.renderer.context;
                            f.stencilFunc(f.NOTEQUAL, 1, 4294967295), this.copyPass.render(this.renderer, this.writeBuffer, this.readBuffer, a), f.stencilFunc(f.EQUAL, 1, 4294967295)
                        }
                        this.swapBuffers()
                    }
                    void 0 !== THREE.MaskPass && (b instanceof THREE.MaskPass ? d = !0 : b instanceof THREE.ClearMaskPass && (d = !1))
                }
        },
        reset: function(a) {
            if (void 0 === a) {
                var b = this.renderer.getSize();
                a = this.renderTarget1.clone(), a.setSize(b.width, b.height)
            }
            this.renderTarget1.dispose(), this.renderTarget2.dispose(), this.renderTarget1 = a, this.renderTarget2 = a.clone(), this.writeBuffer = this.renderTarget1, this.readBuffer = this.renderTarget2
        },
        setSize: function(a, b) {
            this.renderTarget1.setSize(a, b), this.renderTarget2.setSize(a, b);
            for (var c = 0; c < this.passes.length; c++) this.passes[c].setSize(a, b)
        }
    }), THREE.Pass = function() {
        this.enabled = !0, this.needsSwap = !0, this.clear = !1, this.renderToScreen = !1
    }, Object.assign(THREE.Pass.prototype, {
        setSize: function(a, b) {},
        render: function(a, b, c, d, e) {
            console.error("THREE.Pass: .render() must be implemented in derived pass.")
        }
    }), THREE.MaskPass = function(a, b) {
        THREE.Pass.call(this), this.scene = a, this.camera = b, this.clear = !0, this.needsSwap = !1, this.inverse = !1
    }, THREE.MaskPass.prototype = Object.assign(Object.create(THREE.Pass.prototype), {
        constructor: THREE.MaskPass,
        render: function(a, b, c, d, e) {
            var f = a.context,
                g = a.state;
            g.buffers.color.setMask(!1), g.buffers.depth.setMask(!1), g.buffers.color.setLocked(!0), g.buffers.depth.setLocked(!0);
            var h, i;
            this.inverse ? (h = 0, i = 1) : (h = 1, i = 0), g.buffers.stencil.setTest(!0), g.buffers.stencil.setOp(f.REPLACE, f.REPLACE, f.REPLACE), g.buffers.stencil.setFunc(f.ALWAYS, h, 4294967295), g.buffers.stencil.setClear(i), a.render(this.scene, this.camera, c, this.clear), a.render(this.scene, this.camera, b, this.clear), g.buffers.color.setLocked(!1), g.buffers.depth.setLocked(!1), g.buffers.stencil.setFunc(f.EQUAL, 1, 4294967295), g.buffers.stencil.setOp(f.KEEP, f.KEEP, f.KEEP)
        }
    }), THREE.ClearMaskPass = function() {
        THREE.Pass.call(this), this.needsSwap = !1
    }, THREE.ClearMaskPass.prototype = Object.create(THREE.Pass.prototype), Object.assign(THREE.ClearMaskPass.prototype, {
        render: function(a, b, c, d, e) {
            a.state.buffers.stencil.setTest(!1)
        }
    }), THREE.RenderPass = function(a, b, c, d, e) {
        THREE.Pass.call(this), this.scene = a, this.camera = b, this.overrideMaterial = c, this.clearColor = d, this.clearAlpha = void 0 !== e ? e : 0, this.clear = !0, this.needsSwap = !1
    }, THREE.RenderPass.prototype = Object.assign(Object.create(THREE.Pass.prototype), {
        constructor: THREE.RenderPass,
        render: function(a, b, c, d, e) {
            this.scene.overrideMaterial = this.overrideMaterial;
            var f, g;
            this.clearColor && (f = a.getClearColor().getHex(), g = a.getClearAlpha(), a.setClearColor(this.clearColor, this.clearAlpha)), a.render(this.scene, this.camera, this.renderToScreen ? null : c, this.clear), this.clearColor && a.setClearColor(f, g), this.scene.overrideMaterial = null
        }
    }), THREE.ShaderPass = function(a, b) {
        THREE.Pass.call(this), this.textureID = void 0 !== b ? b : "tDiffuse", a instanceof THREE.ShaderMaterial ? (this.uniforms = a.uniforms, this.material = a) : a && (this.uniforms = THREE.UniformsUtils.clone(a.uniforms), this.material = new THREE.ShaderMaterial({
            defines: a.defines || {},
            uniforms: this.uniforms,
            vertexShader: a.vertexShader,
            fragmentShader: a.fragmentShader
        })), this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1), this.scene = new THREE.Scene, this.quad = new THREE.Mesh(new THREE.PlaneBufferGeometry(2, 2), null), this.scene.add(this.quad)
    }, THREE.ShaderPass.prototype = Object.assign(Object.create(THREE.Pass.prototype), {
        constructor: THREE.ShaderPass,
        render: function(a, b, c, d, e) {
            this.uniforms[this.textureID] && (this.uniforms[this.textureID].value = c.texture), this.quad.material = this.material, this.renderToScreen ? a.render(this.scene, this.camera) : a.render(this.scene, this.camera, b, this.clear)
        }
    }), THREE.CopyShader = {
        uniforms: {
            tDiffuse: {
                value: null
            },
            opacity: {
                value: 1
            }
        },
        vertexShader: ["varying vec2 vUv;", "void main() {", "vUv = uv;", "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );", "}"].join("\n"),
        fragmentShader: ["uniform float opacity;", "uniform sampler2D tDiffuse;", "varying vec2 vUv;", "void main() {", "vec4 texel = texture2D( tDiffuse, vUv );", "gl_FragColor = opacity * texel;", "}"].join("\n")
    }, THREE.SSAO = {
        uniforms: {
            tDiffuse: {
                value: null
            },
            tDepth: {
                value: null
            },
            size: {
                value: new THREE.Vector2(512, 512)
            },
            cameraNear: {
                value: 1
            },
            cameraFar: {
                value: 100
            },
            onlyAO: {
                value: 0
            },
            aoClamp: {
                value: .5
            },
            lumInfluence: {
                value: .5
            }
        },
        vertexShader: ["varying vec2 vUv;", "void main() {", "vUv = uv;", "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );", "}"].join("\n"),
        fragmentShader: ["uniform float cameraNear;", "uniform float cameraFar;", "uniform bool onlyAO;", "uniform vec2 size;", "uniform float aoClamp;", "uniform float lumInfluence;", "uniform sampler2D tDiffuse;", "uniform sampler2D tDepth;", "varying vec2 vUv;", "#define DL 2.399963229728653", "#define EULER 2.718281828459045", "const int samples = 4;", "const float radius = 5.0;", "const bool useNoise = false;", "const float noiseAmount = 0.0003;", "const float diffArea = 0.4;", "const float gDisplace = 0.4;", "#include <packing>", "vec2 rand( const vec2 coord ) {", "vec2 noise;", "if ( useNoise ) {", "float nx = dot ( coord, vec2( 12.9898, 78.233 ) );", "float ny = dot ( coord, vec2( 12.9898, 78.233 ) * 2.0 );", "noise = clamp( fract ( 43758.5453 * sin( vec2( nx, ny ) ) ), 0.0, 1.0 );", "} else {", "float ff = fract( 1.0 - coord.s * ( size.x / 2.0 ) );", "float gg = fract( coord.t * ( size.y / 2.0 ) );", "noise = vec2( 0.25, 0.75 ) * vec2( ff ) + vec2( 0.75, 0.25 ) * gg;", "}", "return ( noise * 2.0  - 1.0 ) * noiseAmount;", "}", "float readDepth( const in vec2 coord ) {", "float cameraFarPlusNear = cameraFar + cameraNear;", "float cameraFarMinusNear = cameraFar - cameraNear;", "float cameraCoef = 2.0 * cameraNear;", "return cameraCoef / ( cameraFarPlusNear - unpackRGBAToDepth( texture2D( tDepth, coord ) ) * cameraFarMinusNear );", "}", "float compareDepths( const in float depth1, const in float depth2, inout int far ) {", "float garea = 2.0;", "float diff = ( depth1 - depth2 ) * 100.0;", "if ( diff < gDisplace ) {", "garea = diffArea;", "} else {", "far = 1;", "}", "float dd = diff - gDisplace;", "float gauss = pow( EULER, -2.0 * dd * dd / ( garea * garea ) );", "return gauss;", "}", "float calcAO( float depth, float dw, float dh ) {", "float dd = radius - depth * radius;", "vec2 vv = vec2( dw, dh );", "vec2 coord1 = vUv + dd * vv;", "vec2 coord2 = vUv - dd * vv;", "float temp1 = 0.0;", "float temp2 = 0.0;", "int far = 0;", "temp1 = compareDepths( depth, readDepth( coord1 ), far );", "if ( far > 0 ) {", "temp2 = compareDepths( readDepth( coord2 ), depth, far );", "temp1 += ( 1.0 - temp1 ) * temp2;", "}", "return temp1;", "}", "void main() {", "vec2 noise = rand( vUv );", "float depth = readDepth( vUv );", "float tt = clamp( depth, aoClamp, 1.0 );", "float w = ( 1.0 / size.x )  / tt + ( noise.x * ( 1.0 - noise.x ) );", "float h = ( 1.0 / size.y ) / tt + ( noise.y * ( 1.0 - noise.y ) );", "float ao = 0.0;", "float dz = 1.0 / float( samples );", "float z = 1.0 - dz / 2.0;", "float l = 0.0;", "for ( int i = 0; i <= samples; i ++ ) {", "float r = sqrt( 1.0 - z );", "float pw = cos( l ) * r;", "float ph = sin( l ) * r;", "ao += calcAO( depth, pw * w, ph * h );", "z = z - dz;", "l = l + DL;", "}", "ao /= float( samples );", "ao = 1.0 - ao;", "vec3 color = texture2D( tDiffuse, vUv ).rgb;", "vec3 lumcoeff = vec3( 0.299, 0.587, 0.114 );", "float lum = dot( color.rgb, lumcoeff );", "vec3 luminance = vec3( lum );", "vec3 final = vec3( color * mix( vec3( ao ), vec3( 1.0 ), luminance * lumInfluence ) );", "if ( onlyAO ) {", "final = vec3( mix( vec3( ao ), vec3( 1.0 ), luminance * lumInfluence ) );", "}", "gl_FragColor = vec4( final, 1.0 );", "}"].join("\n")
    }, THREE.Overlay = {
        uniforms: {
            tDiffuse: {
                value: null
            },
            ao: {
                type: "t",
                value: null
            },
            amount: {
                value: .1
            },
            speed: {
                value: 0
            },
            time: {
                value: 0
            },
            ao_factor: {
                value: .5
            }
        },
        vertexShader: ["varying vec2 v_uv;", "void main() {", "   v_uv = uv;", "   gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );", "}"].join("\n"),
        fragmentShader: ["uniform sampler2D tDiffuse;", "uniform float amount;", "uniform float speed;", "uniform float time;", "varying vec2 v_uv;", "float random(vec2 n, float offset ) {", "return .5 - fract(sin(dot(n.xy + vec2( offset, 0. ), vec2(12.9898, 78.233)))* 43758.5453);", "}", "void main() {", "   vec4 color = texture2D(tDiffuse, v_uv);", "   color += vec4( vec3( amount * random( v_uv, .00001 * speed * time ) ), 1. );", "   gl_FragColor = color;", "}"].join("\n")
    };