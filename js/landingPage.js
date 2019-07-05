var scene = null;
var camera = null;
var renderer = null;
var solarSystem = {};
var stars = [];
var pivots = {};
var options = {
    mercury:    {"size": 1, "color": 0x9a8579, "speed": 0.0478, "distance": 15},
    venus:      {"size": 2, "color": 0xf7941e, "speed": 0.0350, "distance": 15},
    earth:      {"size": 2, "color": 0x85dff9, "speed": 0.0298, "distance": 15},
    mars:       {"size": 1.5, "color": 0xbb450f, "speed": 0.0240, "distance": 15},
    jupiter:    {"size": 3, "color": 0xf5b36c, "speed": 0.0130, "distance": 20},
    saturn:     {"size": 2.5, "color": 0xf1d36c, "speed": 0.0097, "distance": 20},
    uranus:     {"size": 2.5, "color": 0x85dff9, "speed": 0.0068, "distance": 20},
    neptune:    {"size": 2.5, "color": 0x85dff9, "speed": 0.0054, "distance": 20},
    pluto:      {"size": 1, "color": 0x726557, "speed": 0.0047, "distance": 20}
}

// functional Vars
var cameraPosition = 200;

function intializeLanding(){
    window.addEventListener('resize', onWindowResize, false);

    setup();
    backgroundSetup();
    sceneSetup();
    lightSetup();
    animate();
}

// loop
function animate(){
    requestAnimationFrame(animate);

    starRandomizer();

    solarSystem.sun.rotation.z += 0.01;

    for (var key in pivots) {
        if (pivots.hasOwnProperty(key)) {
            var pivot = pivots[key];
            var speed = options[key].speed;

            pivot.rotation.z += speed / 2;
            solarSystem[key].rotation.x += 0.01;
        }
    }

    renderer.render(scene, camera);
}
function starRandomizer(){
    var timer = 0.00001 * Date.now();
    for (var i = 0, il = stars.length; i < il; i++) {
        var star = stars[i];
        star.position.x = 400 * Math.sin(timer + i);
        star.position.z = 400 * Math.sin(timer + i * 1.1);
    }
}

function planetCreation(creator){
    var index = 1;
    for (var key in options) {
        if (options.hasOwnProperty(key)) {
            var planet = options[key];
            
            var temp = creator.getPlanet(planet.size, planet.color);
            temp.position.x = index * planet.distance;

            solarSystem[key] = temp;
            index++;
        }
    }
}
function orbitCreation(){
    for (var key in solarSystem) {
        if (solarSystem.hasOwnProperty(key)) {
            if(key == "sun" || key == "orbit"){ continue; }
            var planet = solarSystem[key];
            
            var temp = new THREE.Object3D();
            temp.add(planet);
            solarSystem.orbit.add(temp);
            pivots[key] = temp;
        }
    }
}

function setup(){
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = cameraPosition;
    renderer = new THREE.WebGLRenderer({
        antialias: true
    });
    renderer.sortObjects = false;
    renderer.setClearColor(0x131A3D, 1);

    renderer.setSize(window.innerWidth, 750);
    document.getElementsByClassName("header")[0].appendChild(renderer.domElement);
}
function sceneSetup(){
    var creator = new planetCreator();

    var sun = creator.getSun(10);
    solarSystem.sun = sun;
    var orbitObject = creator.getSun(1);
    solarSystem.orbit = orbitObject;

    planetCreation(creator);
    orbitCreation();
    
    scene.add(solarSystem.orbit);
    scene.add(solarSystem.sun);
}
function backgroundSetup(){
    for (var i = 0; i < 100; i++) {
        var lumiereS = new THREE.MeshPhongMaterial({
            emissive: '#fff'
        });

        var star = new THREE.Mesh(new THREE.SphereGeometry(Math.random() * .75, 20, 20), lumiereS);
        star.position.set(Math.random() * 600 - 300, Math.random() * 600 - 300, Math.random() * 600 - 300);

        scene.add(star);
        stars.push(star);
    }
}
function lightSetup(){
    var light = new THREE.DirectionalLight(0x4f4f4f);
    light.position.set(4, 4, 4);
    scene.add(light);
    var light = new THREE.DirectionalLight(0x4f4f4f);
    light.position.set(-4, -4, -4);
    scene.add(light);
}
function onWindowResize(){
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, 750);
}

class planetCreator{
    varructor(){   }

    getSun(size){
        this.shape = new THREE.IcosahedronGeometry(size, 1);
        this.shader = this.getShader();
        return new THREE.Mesh(this.shape, this.shader);
    }
    getPlanet(size, _color){
        this.shape = new THREE.IcosahedronGeometry(size, 1);
        this.material = this.getMaterial(_color);
        return new THREE.Mesh(this.shape, this.material);
    }

    getShader(){
        return new THREE.MeshPhongMaterial({
            color: 0xF66120,
            emissive: 0xF66120,
            specular: 0xFFED22,
            shininess: 10,
            flatShading: true,
            transparent: 1,
            opacity: 1
        });
    }
    getMaterial(_color){
        return new THREE.MeshPhongMaterial({
            color: _color,
            emissive: _color,
            flatShading: true
        });
    }
}