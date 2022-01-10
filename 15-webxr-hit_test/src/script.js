import './style.css'
import * as THREE from 'three'
import { ARButton } from 'three/examples/jsm/webxr/ARButton.js';

const canvas = document.querySelector('canvas.webgl')

const scene = new THREE.Scene()

let reticle;

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

const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
  alpha: true
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.xr.enabled = true;

//add controller to capture user input (like 'tap')
const controller = renderer.xr.getController(0);
controller.addEventListener('select', onSelect);
scene.add(controller);

addReticleToScene(); // adding the hit test helper

// read more about hit testing here:
// https://github.com/immersive-web/hit-test/blob/master/hit-testing-explainer.md

const button = ARButton.createButton(renderer, {
  requiredFeatures: ["hit-test"] // notice a new required feature
});
document.body.appendChild(button);

function addReticleToScene() {
  const geometry = new THREE.RingBufferGeometry(0.15, 0.2, 32).rotateX(
    -Math.PI / 2
  );
  const material = new THREE.MeshBasicMaterial();

  reticle = new THREE.Mesh(geometry, material);

  // we will calculate the position and rotation of this reticle every frame manually
  // in the render() function so matrixAutoUpdate is set to false
  reticle.matrixAutoUpdate = false;
  reticle.visible = false; // we start with the reticle not visible
  scene.add(reticle);

  // reticle.add(new THREE.AxesHelper(1));
}

function onSelect() {
  if (reticle.visible) {
    const geometry = new THREE.CylinderBufferGeometry(0, 0.05, 0.2, 32)
    const material = new THREE.MeshPhongMaterial({
      color: 0xffffff * Math.random()
    })
    const mesh = new THREE.Mesh(geometry, material)
    //matrix is a sort of object that capture the position and orientation of all the 3d objects
    mesh.position.setFromMatrixPosition(reticle.matrix)
    mesh.quaternion.setFromRotationMatrix(reticle.matrix)

    scene.add(mesh)
  }
}

let hitTestSource = null
let localSpace = null
let hitTestSourceInitialized = false

async function initializeHitTestSource() {
  const session = renderer.xr.getSession()
  //viewer refecrence space = cordinates in relation of the device 
  const viewerSpace = await session.requestReferenceSpace("viewer")
  hitTestSource = await session.requestHitTestSource({ space: viewerSpace })

  //local space = the real coordinates of the envirnment
  //this calculation will stick the objects to the cordinated in relation to the local space
  // local space = a space that isnt changing in references to the phone 
  localSpace = await session.requestReferenceSpace("local")

  //to run this once
  hitTestSourceInitialized = true

  //reset values
  session.addEventListener("end", () => {
    hitTestSourceInitialized = false
    hitTestSource = null
  })
}

// the callback from 'setAnimationLoop' can also return a timestamp
// and an XRFrame, which provides access to the information needed in
// order to render a single frame of animation for an XRSession describing
// a VR or AR sccene.
function animate() {
  renderer.setAnimationLoop(render);
}

function render(timestamp, frame) {
  if (frame) {
    if (!hitTestSourceInitialized) {
      initializeHitTestSource();
    }

    if (hitTestSourceInitialized) {
      // we get the hit test results for a particular frame
      const hitTestResults = frame.getHitTestResults(hitTestSource);

      if (hitTestResults.length > 0) {
        const hit = hitTestResults[0] // the hit that it closest to the camera
        // pose is oriantation and position of the result 
        //we want this point to stay linked to the localSpace and not change
        const pose = hit.getPose(localSpace)

        reticle.visible = true
        reticle.matrix.fromArray(pose.transform.matrix)
      } else {
        reticle.visible = false
      }
    }
    renderer.render(scene, camera);
  }
}

animate()