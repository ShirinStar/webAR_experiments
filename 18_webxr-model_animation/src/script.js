import './style.css'
import * as THREE from 'three'
import { ARButton } from 'three/examples/jsm/webxr/ARButton.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import Stats from 'three/examples/jsm/libs/stats.module.js';

let stats;
let loader;
let model;
let mixer;

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

async function loadModel() {
  // We recommend storing your models on GitHub and accessing the "Raw" link to the file
  // The reason is that Glitch uses a virtual folder for assets or uploaded files and it's hard to get a relative path to those models
  // This model comes from this repo: https://github.com/webxr-academy/models

  // load the model texture
  const textureLoader = new THREE.TextureLoader();
  const texture = textureLoader.load("https://raw.githubusercontent.com/webxr-academy/models/main/jelly/Spotted-Jelly.png");
  //for reading color correctly
  texture.encoding = THREE.sRGBEncoding;
  texture.flipY = false;

  // Add a GLTF model to the scene
  const modelUrl = 'https://raw.githubusercontent.com/webxr-academy/models/main/jelly/Spotted-Jelly.gltf';

  loader = new GLTFLoader();
  const gltf = await loader.loadAsync(modelUrl);
  model = gltf.scene;
  model.position.z = -3;
  addTextureToModel(texture); // add a texture to the model

  // setup the model animation
  // https://threejs.org/docs/#manual/en/introduction/Animation-system
  // a mixer object controls the actual playback of the animation
  mixer = new THREE.AnimationMixer(model);

  gltf.animations.forEach((clip) => {
    const action = mixer.clipAction(clip);
    action.play(); // start playing each animation clip
  });
  scene.add(model);
}

loadModel()

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
  const delta = clock.getDelta();
  
  if (mixer) {
    // Update the animation mixer on each frame
    mixer.update(delta);
  }
  stats.update()
  renderer.render(scene, camera);
}

function addTextureToModel(textureToAdd) {
  model.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.material.map = textureToAdd;
      // Probably need the lines below if you will change the texture after the model has been added to the scene
      // child.material.needsUpdate = true;
      // child.material.map.needsUpdate = true;
    }
  });
}

animate()