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
                'varying vec3 vNormal;',
                'varying vec2 vUv;',
                'void main() {',
                'vec3 diffuse = texture2D( texture, vUv ).xyz;',
                'float intensity = 1.05 - dot( vNormal, vec3( 0.0, 0.0, 1.0 ) );',
                'vec3 atmosphere = vec3( 1.0, 1.0, 1.0 ) * pow( intensity, 3.0 );',
                'gl_FragColor = vec4( diffuse + atmosphere, 1.0 );',
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

    var camera, scene, renderer, w, h;
    var earthMesh, atmosphereMesh, moonMesh;

    var overRenderer;

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
            x: -0.001,
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
        distanceTarget = 100000;
    var PI_HALF = Math.PI / 2;

    function init() {
        sceneSetup();
        planetSetup();
        setupLights();
        addEvents();
    }

    function sceneSetup() {
        w = container.offsetWidth || window.innerWidth;
        h = container.offsetHeight || window.innerHeight;

        camera = new THREE.PerspectiveCamera(40, w / h, 1, 10000);
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

        atmosphereMesh = createEarthAtmosphere();
        scene.add(atmosphereMesh);

        moonMesh = createMoon();
        scene.add(moonMesh);
    }

    /* EARTH CREATION */
    function createEarth() {
        var shader, uniforms, material;
        var geometry = new THREE.SphereGeometry(200, 64, 64);

        shader = Shaders['earth'];
        uniforms = THREE.UniformsUtils.clone(shader.uniforms);

        uniforms['texture'].value = THREE.ImageUtils.loadTexture("imgs/world.jpg");

        material = new THREE.ShaderMaterial({
            uniforms: uniforms,
            vertexShader: shader.vertexShader,
            fragmentShader: shader.fragmentShader
        });

        mesh = new THREE.Mesh(geometry, material);
        mesh.rotation.y = Math.PI;

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

    function createMoon() {
        var size = 200 / 4;
        var geometry = new THREE.SphereGeometry(size, 64, 64);
        var mapTexture = THREE.ImageUtils.loadTexture("imgs/moonmap1k.jpg");
        var bumpTexture = THREE.ImageUtils.loadTexture("imgs/moonbump1k.jpg");

        var material = new THREE.MeshPhongMaterial({
            map: mapTexture,
            bumpMap: bumpTexture,
            bumpScale: 0.5,
        });

        var mesh = new THREE.Mesh(geometry, material);
        mesh.receiveShadow = true;
        mesh.castShadow = true;

        mesh.position.x = 500;

        return mesh;
    }

    /* EARTH EVENTS */
    function addEvents() {
        container.addEventListener('mousedown', onMouseDown, false);
        document.addEventListener('keydown', onDocumentKeyDown, false);
        window.addEventListener('resize', onWindowResize, false);

        container.addEventListener('mouseover', function () {
            overRenderer = true;
        }, false);
        container.addEventListener('mouseout', function () {
            overRenderer = false;
        }, false);
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

    function zoom(delta) {
        distanceTarget -= delta;
        distanceTarget = distanceTarget > 1000 ? 1000 : distanceTarget;
        distanceTarget = distanceTarget < 350 ? 350 : distanceTarget;
    }

    function animate() {
        requestAnimationFrame(animate);
        render();
    }

    function render() {
        zoom(curZoomSpeed);

        target.x += incr_rotation.x;
        target.y += incr_rotation.y;
        rotation.x += (target.x - rotation.x) * 0.1;;
        rotation.y += (target.y - rotation.y) * 0.1;
        distance += (distanceTarget - distance) * 0.3;

        camera.position.x = distance * Math.sin(rotation.x) * Math.cos(rotation.y);
        camera.position.y = distance * Math.sin(rotation.y);
        camera.position.z = distance * Math.cos(rotation.x) * Math.cos(rotation.y);

        moonMesh.rotation.y += .0025;
        earthMesh.rotation.y += .001;

        camera.lookAt(earthMesh.position);

        renderer.render(scene, camera);
    }

    init();
    this.animate = animate;
};