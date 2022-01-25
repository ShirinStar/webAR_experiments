import './style.css'
import * as THREE from 'three'
import { ARButton } from 'three/examples/jsm/webxr/ARButton.js';

let plane;
let planeCreated = false;

const canvas = document.querySelector('canvas.webgl')
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

const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1)
light.position.set(0.5, 1, 0.25)
scene.add(light)

const spotLight = new THREE.SpotLight(0xffffff, 9, 20, 0.2)
spotLight.position.set(0, 2, 2)
scene.add(spotLight)
spotLight.castShadow = true
// optional attributes you can specify for the shadow
spotLight.shadow.mapSize.width = 2048; // the higher the number the better resolution the shadow
spotLight.shadow.mapSize.height = 2048;

// NOTE: if you are using a directional light you need to specify the following parameters
// it's because directional lights don't have a strict position and are set infinitely away
// directionalLight.shadow.camera.near = 0.1;
// directionalLight.shadow.camera.far = 200;
// directionalLight.shadow.camera.left = 500;
// directionalLight.shadow.camera.right = -500;
// directionalLight.shadow.camera.top = 500;
// directionalLight.shadow.camera.bottom = -500;

const shadowCameraHelper = new THREE.CameraHelper(spotLight.shadow.camera);
scene.add(shadowCameraHelper);

const geometry = new THREE.IcosahedronGeometry(0.1, 1);
const material = new THREE.MeshPhongMaterial({
  color: new THREE.Color("rgb(226,35,213)"),
  shininess: 6,
});

const mesh = new THREE.Mesh(geometry, material);
mesh.position.set(0, 0, -0.5);
mesh.receiveShadow = true;
mesh.castShadow = true;
scene.add(mesh);

const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
  alpha: true
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.xr.enabled = true
renderer.shadowMap.enabled = true // important for shadows!
// more info on shadow types is here: https://threejs.org/docs/#api/en/constants/Renderer
renderer.shadowMap.type = THREE.PCFSoftShadowMap // recommanded for AR

const button = ARButton.createButton(renderer, {
  requiredFeatures: ["hit-test"] // notice a new required feature
});
document.body.appendChild(button);
button.style.backgroundColor = 'black'

addPlaneToScene();

function addPlaneToScene() {
  // NOTE: if you're viewing on desktop, make the plane really big like 40, 40
  const geometry = new THREE.PlaneGeometry(40, 40);
  geometry.rotateX(-Math.PI / 2) // we rotate the geometry so it's parallel to the floor
  const material = new THREE.ShadowMaterial() //this is a material that is transperant and yet hold the shadows
  material.opacity = 0.5

  plane = new THREE.Mesh(geometry, material)
  plane.receiveShadow = true
  plane.visible = false // start the plane as invisible
  plane.matrixAutoUpdate = false // important! anytime we set the matrix manually (like in a hit test)
  scene.add(plane)
}

/////we are doing hit test here to position the plane right on the floor

let hitTestSource = null
let localSpace = null
let hitTestSourceInitialized = false

async function initializeHitTestSource() {
  const session = renderer.xr.getSession()

  const viewerSpace = await session.requestReferenceSpace("viewer")
  hitTestSource = await session.requestHitTestSource({ space: viewerSpace })

  localSpace = await session.requestReferenceSpace("local")

  //to run this once
  hitTestSourceInitialized = true

  //reset values
  session.addEventListener("end", () => {
    hitTestSourceInitialized = false
    hitTestSource = null
  })
}

function animate() {
  renderer.setAnimationLoop(render);
}

function render(timestamp, frame) {
  shadowCameraHelper.update() 

  if (frame) {
    if (!hitTestSourceInitialized) {
      initializeHitTestSource();
    }

    if (hitTestSourceInitialized) {
      // we get the hit test results for a particular frame
      const hitTestResults = frame.getHitTestResults(hitTestSource);

      if (hitTestResults.length > 0) {
        const hit = hitTestResults[0]
        const pose = hit.getPose(localSpace) // a point on the floor where the hittest intersect

        plane.visible = true

        if (!planeCreated) { // will only occur once
          // translate the position and rotation of the hit test result to the plane
          // i.e. place the plane at the same position as the floor
          plane.matrix.fromArray(pose.transform.matrix);
          planeCreated = true
        }
      }
    }
    renderer.render(scene, camera);
  }
}

animate()