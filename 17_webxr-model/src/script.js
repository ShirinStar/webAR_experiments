import './style.css'
import * as THREE from 'three'
import { ARButton } from 'three/examples/jsm/webxr/ARButton.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import Stats from 'three/examples/jsm/libs/stats.module.js';

let stats;

const createStats = () => {
  stats = new Stats();
  stats.setMode(0);

  // assign css to align it properly on the page
  stats.domElement.style.position = "absolute";
  stats.domElement.style.left = "0";
  stats.domElement.style.top = "0";
}

const canvas = document.querySelector('.webgl')
const scene = new THREE.Scene()

//avocado model: https://github.com/KhronosGroup/glTF-Sample-Models/tree/master/2.0/Avocado
//more models: https://github.com/immersive-web/webxr-samples/tree/main/media/gltf
const modelUrl = 'https://cdn.glitch.me/b09d0ef2-cbb9-4685-be74-25b4dbc9e604%2Favocado.glb?v=1636661024905';
const loader = new GLTFLoader()

loader.load(
  // model URL
  modelUrl,
  // onLoad callback: what get's called once the full model has loaded
  function (gltf) {
    // gltf.scene contains the Three.js object group that represents the 3d object of the model
    scene.add(gltf.scene);
    console.log("Model added to scene");

    gltf.scene.scale.multiplyScalar(3);
    gltf.scene.position.z = -0.5;
  },
  // onProgress callback: optional function for showing progress on model load
  function (xhr) {
    console.log((xhr.loaded / xhr.total * 100) + '% loaded');
  },
  // onError callback
  function (error) {
    console.error(error);
  }
);

const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
light.position.set(0.5, 1, 0.25);
scene.add(light);

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight
}

window.addEventListener('resize', () => {
  sizes.width = window.innerWidth
  sizes.height = window.innerHeight
  camera.aspect = sizes.width / sizes.height
  camera.updateProjectionMatrix()
  renderer.setSize(sizes.width, sizes.height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.01, 100)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
  alpha: true
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.xr.enabled = true;

document.body.appendChild(ARButton.createButton(renderer));

createStats();
document.body.appendChild(stats.domElement); // append the stats panel to the page

const clock = new THREE.Clock()

function animate() {
  renderer.setAnimationLoop(update);
}

function update() {
  const elapsedTime = clock.getElapsedTime()
  stats.update()
  renderer.render(scene, camera);
}

animate()