import './style.css'
import * as THREE from 'three'
import { ARButton } from 'three/examples/jsm/webxr/ARButton.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { XREstimatedLight } from 'three/examples/jsm/webxr/XREstimatedLight.js'

setupMobileDebug()

function setupMobileDebug() {
  // for image tracking we need a mobile debug console as it only works on android
  // This library is very big so only use it while debugging - just comment it out when your app is done
  const containerEl = document.getElementById("console-ui");
  eruda.init({
    container: containerEl
  });
  const devToolEl = containerEl.shadowRoot.querySelector('.eruda-dev-tools');
  devToolEl.style.height = '40%'; // control the height of the dev tool panel
}

let loader;

const canvas = document.querySelector('.webgl')
const scene = new THREE.Scene()

const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
hemisphereLight.position.set(0.5, 1, 0.25);
scene.add(hemisphereLight)

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

const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.z = 3
scene.add(camera)

const defaultLight = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
defaultLight.position.set(0.5, 1, 0.25);
scene.add(defaultLight);

const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
  alpha: true
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.xr.enabled = true
renderer.outputEncoding = THREE.sRGBEncoding; // new
renderer.physicallyCorrectLights = true; // new

const xrLight = new XREstimatedLight(renderer);

xrLight.addEventListener('estimationstart', () => {
  console.log('estimationstart');
  // Swap the default light out for the estimated one one we start getting some estimated values.
  scene.add(xrLight);
  scene.remove(defaultLight);

  // The estimated lighting also provides an environment cubemap, which we can apply here.
  if (xrLight.environment) {
    updateEnvironment(xrLight.environment )
  }
})

xrLight.addEventListener('estimationend', () => {
  console.log('estimationend');
  // Swap the lights back when we stop receiving estimated values.
  scene.add(defaultLight );
  scene.remove(xrLight);

  // Revert back to the default environment.
  // updateEnvironment(defaultEnvironment);
  updateEnvironment(null);
});

const button = ARButton.createButton(renderer, {
  optionalFeatures: ['light-estimation', "dom-overlay", "dom-overlay-for-handheld-ar"],
  domOverlay: {
    root: document.body
  }
});
document.body.appendChild(button);
button.style.backgroundColor = 'black'

loadModel()
loadSphereMesh()

function loadSphereMesh() {
  const geometry = new THREE.IcosahedronGeometry(0.1, 1);
  const material = new THREE.MeshPhongMaterial({
    color      :  new THREE.Color("rgb(226,35,213)"),
    shininess  :  6,
  });
  
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(-0.3, 0, -0.8);
  mesh.receiveShadow = true;
  mesh.castShadow = true;
  scene.add(mesh);
}

async function loadModel() {
  const modelUrl = 'https://cdn.glitch.me/b09d0ef2-cbb9-4685-be74-25b4dbc9e604%2Favocado.glb?v=1636661024905';
  loader = new GLTFLoader();

  const gltf = await loader.loadAsync(modelUrl);

  gltf.scene.scale.multiplyScalar(3);
  gltf.scene.position.z = -0.2;
  gltf.scene.position.y = -0.1;

  scene.add(gltf.scene);
}

function animate() {
  renderer.setAnimationLoop(render);
}

function render(timestamp, frame) {
    renderer.render(scene, camera);
}

function updateEnvironment(envMap) {
  scene.traverse((object) => {
    //update all objects in the scene
    if (object.isMesh ) {
      object.material.envMap = envMap;
    }
  })
}

animate()