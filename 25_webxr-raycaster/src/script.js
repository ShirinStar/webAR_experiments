import './style.css'
import * as THREE from 'three'
import { ARButton } from 'three/examples/jsm/webxr/ARButton.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

const canvas = document.querySelector('.webgl')
const scene = new THREE.Scene()
const raycaster = new THREE.Raycaster();
let savedIntersectedObject = null;
let line;

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

function createCube(x, y, z) {
  const geometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);
  const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
  const cube = new THREE.Mesh(geometry, material);
  cube.position.x = x;
  cube.position.y = y;
  cube.position.z = z;
  scene.add(cube);
}

createCube(-0.5, 0, -1);
createCube(0.5, 0, -1);

createRaycastLine()//helper raycaster line

function animate() {
  renderer.setAnimationLoop(render);
}

function render() {
  //raycaster
  const cameraDirection = getCameraDirectionNormalized(); //length = 1
  const cameraPosition = getCameraPosition()
  raycaster.set(cameraPosition, cameraDirection)

  updateRaycasterHelperLine(); // optional function to visualize the raycaster

  // creating array for the intersects objects
  const intersectsArray = raycaster.intersectObjects([scene.children[1], scene.children[2]]) //passing the first cube and the second cube

  // Go through an array of intersected objects
  if (intersectsArray.length > 0) {
    for (const intersectObject of intersectsArray) {
      // Case 3: if the currently selected object is not the same one as the last selected object
      // then we have to change the color of the previously select object back to green
      if (intersectObject.object !== savedIntersectedObject && savedIntersectedObject !== null) {
        savedIntersectedObject.material.color.setHex(0x00ff00); // change color of the cube back to orignal green
        savedIntersectedObject = null;
      }
      // Case 1: if the object is a mesh (i.e. a cube) we want to change the color of the cube to white
      if (intersectObject.object instanceof THREE.Mesh) {
        intersectObject.object.material.color.setHex(0xffffff); // change the color of the cube to white
        savedIntersectedObject = intersectObject.object; // save a reference of the last intersected object
      }
    }
  } else {
    // Case 2: if we have a last saved object, but our ray isn't currently selecting anything
    // then we have to change the color back to the original color
    if (savedIntersectedObject !== null) {
      savedIntersectedObject.material.color.setHex(0x00ff00); // set the color of the cube back to the original green
      savedIntersectedObject = null; // we're not pointing at any objects to this variable goes back to null
    }
  }

  renderer.render(scene, camera);
}

animate()

/* Helper functions */
/*******************/
function getCameraPosition() {
  return camera.position;
}

function getCameraRotation() {
  const rotation = new THREE.Quaternion();
  rotation.setFromRotationMatrix(camera.matrixWorld);
  return rotation;
}

function getCameraDirectionNormalized() {
  // Get the camera direction
  const quat = getCameraRotation();
  const cameraDirection = new THREE.Vector3(0, 0, -1);
  cameraDirection.applyQuaternion(quat);
  cameraDirection.normalize()
  return cameraDirection;
}

function createVectorXDistanceAwayFromCamera(distanceFromCamera) {
  const vector = new THREE.Vector3();
  // step 1: get rotation from the camera
  camera.getWorldDirection(vector);
  // step 2: scale the vector a bit so it reachs out in front (not on top) of the camera
  vector.multiplyScalar(distanceFromCamera);
  // step 3: get the position from the camera
  vector.add(camera.position);
  return vector;
}

/* Raycast line helper */
function createRaycastLine() {
  const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });
  const lineGeometry = new THREE.BufferGeometry();
  const positions = new Float32Array(2 * 3); // 2 points x 3 vertices per point
  lineGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  line = new THREE.Line(lineGeometry, lineMaterial);
  scene.add(line);
}

// this function is just here as a helper to visualize the raycast line (as an approximate) - just to visualize
function updateRaycasterHelperLine() {
  const positionStart = createVectorXDistanceAwayFromCamera(0);
  const positionEnd = createVectorXDistanceAwayFromCamera(200);
  const positions = line.geometry.attributes.position.array;

  positions[0] = positionEnd.x; // end x
  positions[1] = positionEnd.y; // end y
  positions[2] = positionEnd.z; // end z
  positions[3] = positionStart.x; // origin x
  positions[4] = positionStart.y - 0.2; // origin y. we push the origin a bit down to visualize it better
  positions[5] = positionStart.z; // origin z

  line.geometry.attributes.position.needsUpdate = true;
}