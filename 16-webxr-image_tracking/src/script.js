import './style.css'
import * as THREE from 'three'
import { ARButton } from 'three/examples/jsm/webxr/ARButton.js';

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

let camera, canvas, scene, renderer;
let mesh;
let image;

init();
animate();

async function init() {
  canvas = document.querySelector('canvas.webgl')

  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(
    70,
    window.innerWidth / window.innerHeight,
    0.01,
    40
  );

  renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.xr.enabled = true;


  const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
  light.position.set(0.5, 1, 0.25);
  scene.add(light);

  // setup a cone mesh to put on top of the image target when it is seen
  const radius = 0.2;
  const height = 1;
  const geometry = new THREE.ConeGeometry(radius, height, 32);
  geometry.translate(0, height / 2, 0);
  const material = new THREE.MeshPhongMaterial({
    color: 0xffffff * Math.random(),
    shininess: 6,
    flatShading: true,
    transparent: 1,
    opacity: 1
  });
  mesh = new THREE.Mesh(geometry, material);
  mesh.matrixAutoUpdate = false; // important we have to set this to false because we'll update the position with the updateMesh() function
  mesh.visible = false;
  scene.add(mesh);
  
  // setup the image target
  const img = document.getElementById('img');
  const imgBitmap = await createImageBitmap(img);
  console.log(imgBitmap);

  const button = ARButton.createButton(renderer, {
    requiredFeatures: ["image-tracking"], // notice a new required feature
    trackedImages: [
      {
        image: imgBitmap, // tell webxr this is the image target we want to track
        widthInMeters: 0.7
      }
    ],
    optionalFeatures: ["dom-overlay", "dom-overlay-for-handheld-ar"],
        domOverlay: {
          root: document.body
        }
  });
  document.body.appendChild(button);

  window.addEventListener("resize", onWindowResize, false);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  renderer.setAnimationLoop(render);
}

// async function getImageBitmap(url) {
//   const response = await fetch(url);
//   const blob = await response.blob();
//   const imageBitmap = await createImageBitmap(blob);
//   return imageBitmap;
// };

// update the cone mesh when the image target is found
function updateMesh(pose) {
  mesh.matrix.fromArray(pose.transform.matrix);
}

function render(timestamp, frame) {
  if (frame) {
    const results = frame.getImageTrackingResults();

    for (const result of results) {
      // The result's index is the image's position in the trackedImages array specified at session creation
      const imageIndex = result.index;

      // Get the pose of the image relative to a reference space.
      const referenceSpace = renderer.xr.getReferenceSpace();
      const pose = frame.getPose(result.imageSpace, referenceSpace);
      
      const state = result.trackingState;
      console.log(state);

      if (state == "tracked") {
        // do something when image is tracked
        console.log("Image target has been found")
        mesh.visible = true;
        updateMesh(pose);
      } else if (state == "emulated") {
        // do something when image is lost
        mesh.visible = false; 
        console.log("Image target no longer seen")
      }
    }
  }
  renderer.render(scene, camera);
}