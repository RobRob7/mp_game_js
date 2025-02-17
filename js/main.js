// imports from three.js
import * as THREE from 'three';
import WebGL from 'three/addons/capabilities/WebGL.js';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {PointerLockControls} from 'three/addons/controls/PointerLockControls.js';



import SpectatorControls from "./SpectatorControls.js";

/*
    To actually be able to display anything with three.js, we need three
    things: (1) scene, (2) camera and (3) renderer, so that we can render
    the scene with camera.
*/

// (1) scene
const scene = new THREE.Scene();
// set cubemap
scene.background = new THREE.CubeTextureLoader()
	.setPath( '../assets/testlands/' )
	.load( [
				'px.jpg',
				'nx.jpg',
				'py.jpg',
				'ny.jpg',
				'pz.jpg',
				'nz.jpg'
			] );

// (2) camera
const fov = 100;
const aspectRatio = window.innerWidth / window.innerHeight;
const nearPlane = 0.1;
const farPlane = 1000;
// perspective camera (fov, aspect ratio, near clipping plane, far clipping plane)
const camera = new THREE.PerspectiveCamera(fov, aspectRatio, nearPlane, farPlane);
camera.position.set(0, 30, 70);
camera.lookAt(0, 40, 0);

// (3) renderer
// three.js uses WebGL to render
const renderer = new THREE.WebGLRenderer();
// set rendering window size
renderer.setSize(window.innerWidth, window.innerHeight);
// update index.html body with renderer
document.body.appendChild(renderer.domElement);

// lock mouse to window
const controls = new PointerLockControls(camera, renderer.domElement);
renderer.domElement.addEventListener('click', function () {
    controls.lock();
}, false);

// BoxGeometry(width, height, depth)
const geometry = new THREE.BoxGeometry(2, 1, 10);
geometry.scale(1000, 1, 1);
// MeshBasicMaterial(objects of multiple parameters)
const material = new THREE.MeshBasicMaterial({color: 0xffffff});
// Mesh(geometry : BufferGeometry, material : Material)
const cube = new THREE.Mesh(geometry, material);
cube.position.set(0, -1, 0);
// const cube1 = new THREE.Mesh(geometry, material);

// add cube to scene
scene.add(cube);

// directional light
const dirLight = new THREE.DirectionalLight(0xffffff, 1);
dirLight.position.set(0, 1000, 0);
dirLight.castShadow = true;
scene.add(dirLight);

// path to tank object
const pathTo = "../assets/tank.glb";

// tank initial positions
const tankInitialPos = 100;

// tank object player1 load
var tankPlayer1 = new GLTFLoader();
var p1Tank;
tankPlayer1.load(pathTo, function (gltf) {
    p1Tank = gltf.scene;
    gltf.scene.position.set(-tankInitialPos, 0, 0);
    gltf.scene.scale.set(10, 10, 10);
    gltf.scene.rotation.set(0, 0, 0);
    scene.add(gltf.scene);
});

// tank object player2 load
var tankPlayer2 = new GLTFLoader();
var p2Tank;
tankPlayer2.load(pathTo, function (gltf) {
    p2Tank = gltf.scene;
    gltf.scene.position.set(tankInitialPos, 0, 0);
    gltf.scene.scale.set(10, 10, 10);
    gltf.scene.rotation.set(0, Math.PI, 0);
    scene.add(gltf.scene);
});

// listen for key presses of each player tank
const moveSpeed = 0.4;
document.addEventListener('keydown', (event) => {
    const targetPositionP1 = p1Tank.position.clone();
    const targetPositionP2 = p2Tank.position.clone();
    // player 1 controls
    if(event.key == 'q') {
        targetPositionP1.x -= moveSpeed;
        p1Tank.position.set(targetPositionP1.x, 0, 0);
    }
    if(event.key == 'e') {
        targetPositionP1.x += moveSpeed;
        p1Tank.position.set(targetPositionP1.x, 0, 0);
    }

    // player 2 controls
    if(event.key == 'ArrowLeft') {
        targetPositionP2.x -= moveSpeed;
        p2Tank.position.set(targetPositionP2.x, 0, 0);
    }
    if(event.key == 'ArrowRight') {
        targetPositionP2.x += moveSpeed;
        p2Tank.position.set(targetPositionP2.x, 0, 0);
    }
});

function animate() {
    renderer.render(scene, camera);
}

// on window resize (update window width and height)
window.addEventListener("resize", function(event) {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// check if WebGL is available
if (WebGL.isWebGL2Available()) {
    // set animation loop
    renderer.setAnimationLoop(animate);

    const controls = new SpectatorControls(camera);
    controls.enable();
    const clock = new THREE.Clock();

    function update() {
        controls.update(clock.getDelta());
        renderer.render(scene, camera);
        requestAnimationFrame(update);
    }

    // update();
} else {
	const warning = WebGL.getWebGL2ErrorMessage();
	document.getElementById('container').appendChild(warning);
}
