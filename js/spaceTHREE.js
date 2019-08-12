var DAT = DAT || {};

DAT.Globe = function (container) {
    var Shaders = {
        'earth': {
            uniforms: {
                'texture': {
                    type: 't',
                    value: null
                }
            },
            vertexShader: [
                'varying vec3 vNormal;',
                'varying vec2 vUv;',
                'void main() {',
                'gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
                'vNormal = normalize( normalMatrix * normal );',
                'vUv = uv;',
                '}'
            ].join('\n'),
            fragmentShader: [
                'uniform sampler2D texture;',
                'uniform sampler2D textureSco;',
                'uniform sampler2D textureEng;',
                'uniform float weightT2;',
                'uniform float weightT3;',
                '',
                'varying vec2 vUv;',
                '',
                'void main() {',
                '   vec4 texel1 = texture2D(texture, vUv);',
                '   vec4 texel2 = texture2D(textureSco, vUv);',
                '   vec4 texel3 = texture2D(textureEng, vUv);',
                '',
                '   float weightT1 = 1.0 - weightT2 - weightT3;',
                '',
                '   vec4 resultColor = texel2 * weightT2 + texel3 * weightT3 + texel1 * weightT1;',
                '   gl_FragColor = resultColor;',
                '}'
            ].join('\n')
        },
        'atmosphere': {
            uniforms: {},
            vertexShader: [
                'varying vec3 vNormal;',
                'void main() {',
                'vNormal = normalize( normalMatrix * normal );',
                'gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
                '}'
            ].join('\n'),
            fragmentShader: [
                'varying vec3 vNormal;',
                'void main() {',
                'float intensity = pow( 0.8 - dot( vNormal, vec3( 0, 0, 1.0 ) ), 12.0 );',
                'gl_FragColor = vec4( 1.0, 1.0, 1.0, 1.0 ) * intensity;',
                '}'
            ].join('\n')
        }
    };

    var _opacitySco = 0.0;
    var _opacityEng = 0.0;
    var camera, scene, renderer, w, h;
    var earthMesh, atmosphereMesh;

    var curZoomSpeed = 0;

    var mouse = {
            x: 0,
            y: 0
        },
        mouseOnDown = {
            x: 0,
            y: 0
        };
    var rotation = {
            x: 0,
            y: 0
        },
        incr_rotation = {
            x: -0.002,
            y: 0
        },
        target = {
            x: Math.PI * 3 / 2,
            y: Math.PI / 6.0
        },
        targetOnDown = {
            x: 0,
            y: 0
        };

    var distance = 100000,
        distanceTarget = 100000,
        takeoff = 1.2;
    var PI_HALF = Math.PI / 2;

    function init() {
        sceneSetup();
        planetSetup();
        setupLights();
        addEvents();

        animate();
    }

    function sceneSetup() {
        w = container.offsetWidth || window.innerWidth;
        h = container.offsetHeight || window.innerHeight;

        camera = new THREE.PerspectiveCamera(30, w / h, 1, 10000);
        camera.position.z = distance;

        scene = new THREE.Scene();

        renderer = new THREE.WebGLRenderer({
            antialias: true
        });
        renderer.setSize(w, h);

        container.appendChild(renderer.domElement);
    }

    function setupLights() {
        var light = new THREE.AmbientLight(0x2222221);
        scene.add(light);

        var light = new THREE.DirectionalLight(0xffffff, 2);
        light.position.set(5, 5, 5);
        scene.add(light);

    }

    function planetSetup() {
        earthMesh = createEarth();
        scene.add(earthMesh);

        //atmosphereMesh = createEarthAtmosphere();
        //scene.add(atmosphereMesh);

    }

    /* EARTH CREATION */
    function createEarth() {
        var shader, uniforms, material;
        var geometry = new THREE.SphereGeometry(200, 128, 128);

        shader = Shaders['earth'];
        uniforms = THREE.UniformsUtils.clone(shader.uniforms);

        uniforms = {
            "texture": {
                type: 't',
                value: THREE.ImageUtils.loadTexture("imgs/background/Earth.png")
            },
            "textureSco": {
                type: 't',
                value: THREE.ImageUtils.loadTexture("imgs/background/EarthScot.png")
            },
            "textureEng": {
                type: 't',
                value: THREE.ImageUtils.loadTexture("imgs/background/EarthEng.png")
            },
            "weightT2": {
                type: "f",
                value: _opacitySco
            },
            "weightT3": {
                type: "f",
                value: _opacityEng
            },
        };

        material = new THREE.ShaderMaterial({
            uniforms: uniforms,
            vertexShader: shader.vertexShader,
            fragmentShader: shader.fragmentShader,
        });

        mesh = new THREE.Mesh(geometry, material);
        mesh.rotation.y = Math.PI - .6;
        mesh.rotation.x = -0.5;

        return mesh;
    }

    function createEarthAtmosphere() {
        var shader, uniforms, material;
        var geometry = new THREE.SphereGeometry(200, 64, 64);

        shader = Shaders['atmosphere'];
        uniforms = THREE.UniformsUtils.clone(shader.uniforms);

        material = new THREE.ShaderMaterial({
            uniforms: uniforms,
            vertexShader: shader.vertexShader,
            fragmentShader: shader.fragmentShader,
            side: THREE.BackSide,
            blending: THREE.AdditiveBlending,
            transparent: true
        });

        mesh = new THREE.Mesh(geometry, material);
        mesh.scale.set(1.1, 1.1, 1.1);

        return mesh;
    }

    function zoom(delta) {
        distanceTarget -= delta;
        distanceTarget = distanceTarget > 1000 ? 1000 : distanceTarget;
        distanceTarget = distanceTarget < 350 ? 350 : distanceTarget;
    }

    var freeplay = false;
    var textureChanged = false;
    var earthRotation = 1050;

    function render() {
        zoom(curZoomSpeed);

        target.x += incr_rotation.x;
        target.y += incr_rotation.y;
        rotation.x += (target.x - rotation.x) * 0.1;
        rotation.y += (target.y - rotation.y) * 0.1;

        if (distance < 1001 && !freeplay) {
            runAnimation();

            if (textureChanged) {}
        } else {
            distance += (distanceTarget - distance) * 0.3;
        }

        camera.position.x = distance * Math.sin(rotation.x) * Math.cos(rotation.y);
        camera.position.y = distance * Math.sin(rotation.y);
        camera.position.z = distance * Math.cos(rotation.x) * Math.cos(rotation.y);

        camera.lookAt(new THREE.Vector3(earthMesh.position.x, earthMesh.position.y, earthMesh.position.z));
        camera.rotation.z += earthRotation;

        renderer.render(scene, camera);
    }

    function runAnimation() {
        distance -= takeoff;
        startAnimation = true;
        if (distance <= 500) {
            takeoff = 0;
        }
        if (rotation.x <= 3.825) {
            incr_rotation.x = 0;

            if (!textureChanged) {
                textureChanged = true;

                setTimeout(function () {
                    jq(".animation .sco").animate({
                        opacity: 1
                    }, 1000);
                    var x = setInterval(function () {
                        _opacitySco += 0.1;
                        earthMesh.material.uniforms.weightT2.value = _opacitySco;

                        if (_opacitySco >= 1.0) {
                            clearInterval(x);

                            setTimeout(function () {
                                jq(".animation .sco").animate({
                                    opacity: 0
                                }, 1000);
                                jq(".animation .eng").animate({
                                    opacity: 1
                                }, 1000);

                                var z = setInterval(function () {
                                    _opacitySco -= 0.1;
                                    _opacityEng += 0.1;
                                    earthMesh.material.uniforms.weightT2.value = _opacitySco;
                                    earthMesh.material.uniforms.weightT3.value = _opacityEng;

                                    if (_opacityEng >= 1.0 && _opacitySco <= 0.0) {
                                        clearInterval(z);

                                        setTimeout(function () {
                                            jq(".animation .eng").css("opacity", "0");
                                            jq(".animation").hide();
                                            var x = setInterval(function () {
                                                _opacityEng -= 0.1;
                                                earthMesh.material.uniforms.weightT3.value = _opacityEng;

                                                if (_opacityEng <= 0.0) {
                                                    clearInterval(x);
                                                }
                                            }, 50);
                                            runFreePlay();
                                        }, 5000);
                                    }
                                }, 50);
                            }, 5000);
                        }
                    }, 50);
                }, 1000);
            }
        }
    }

    function runFreePlay() {
        incr_rotation.x = -.001;
        freeplay = true;
        earthRotation = 0;
        distance = 1000;
        earthMesh.material.uniforms.weightT3.value = 0.0;
        earthMesh.material.uniforms.weightT2.value = 0.0;

        container.addEventListener('mousedown', onMouseDown, false);
        document.addEventListener('keydown', onDocumentKeyDown, false);

        container.addEventListener('mouseover', function () {
            overRenderer = true;
        }, false);
        container.addEventListener('mouseout', function () {
            overRenderer = false;
        }, false);
    }
    /* EARTH EVENTS */
    function addEvents() {
        window.addEventListener('resize', onWindowResize, false);
    }

    function onMouseDown(event) {
        event.preventDefault();

        container.addEventListener('mousemove', onMouseMove, false);
        container.addEventListener('mouseup', onMouseUp, false);
        container.addEventListener('mouseout', onMouseOut, false);

        mouseOnDown.x = -event.clientX;
        mouseOnDown.y = event.clientY;

        targetOnDown.x = target.x;
        targetOnDown.y = target.y;

        container.style.cursor = 'move';
    }

    function onMouseMove(event) {
        mouse.x = -event.clientX;
        mouse.y = event.clientY;

        var zoomDamp = distance / 1000;

        target.x = targetOnDown.x + (mouse.x - mouseOnDown.x) * 0.005 * zoomDamp;
        target.y = targetOnDown.y + (mouse.y - mouseOnDown.y) * 0.005 * zoomDamp;

        target.y = target.y > PI_HALF ? PI_HALF : target.y;
        target.y = target.y < -PI_HALF ? -PI_HALF : target.y;
    }

    function onMouseUp(event) {
        container.removeEventListener('mousemove', onMouseMove, false);
        container.removeEventListener('mouseup', onMouseUp, false);
        container.removeEventListener('mouseout', onMouseOut, false);
        container.style.cursor = 'auto';
    }

    function onMouseOut(event) {
        container.removeEventListener('mousemove', onMouseMove, false);
        container.removeEventListener('mouseup', onMouseUp, false);
        container.removeEventListener('mouseout', onMouseOut, false);
    }

    function onDocumentKeyDown(event) {
        switch (event.keyCode) {
            case 38:
                zoom(100);
                event.preventDefault();
                break;
            case 40:
                zoom(-100);
                event.preventDefault();
                break;
        }
    }

    function onWindowResize(event) {
        camera.aspect = container.offsetWidth / container.offsetHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.offsetWidth, container.offsetHeight);
    }

    function animate() {
        requestAnimationFrame(animate);
        render();
    }

    init();
};