THREE.PixelateShader = {
    uniforms: {
        "tDiffuse": { value: null },
        "pixels": { value: new THREE.Vector2(64, 48) }
    },
    vertexShader: [
        "varying vec2 vUv;",

        "void main() {",
            "vUv = uv;",
            "gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);",
		"}"
    ].join('\n'),
    fragmentShader: [
        "uniform sampler2D tDiffuse;",
        "uniform vec2 pixels;",
        "varying vec2 vUv;",

        "void main() {",
            "vec2 center = (floor(vUv * pixels) + 0.5) / pixels;",
            "vec4 color = texture2D(tDiffuse, center);",
            "gl_FragColor = color;",
		"}"
    ].join('\n')
};

/*
Sources:
 - pixelate : https://www.getmosh.io/
*/