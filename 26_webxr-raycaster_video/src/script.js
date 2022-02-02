import './style.css'
import * as THREE from 'three'
import { ARButton } from 'three/examples/jsm/webxr/ARButton.js';

const canvas = document.querySelector('.webgl')
const scene = new THREE.Scene()

const videoOne = document.querySelector('.video.one')
videoOne.play()
const videoTextureOne = new THREE.VideoTexture(videoOne)

const videoTwo = document.querySelector('.video.two')
videoTwo.play()
const videoTextureTwo = new THREE.VideoTexture(videoTwo)

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

const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
  alpha: true
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.xr.enabled = true;

document.body.appendChild(ARButton.createButton(renderer));

//content
const geometry = new THREE.BoxGeometry(0.25, 0.25, 0.25)

const materialOne = new THREE.MeshBasicMaterial({
  map: videoTextureOne
});
const cubeOne = new THREE.Mesh(geometry, materialOne);
cubeOne.position.set(-0.25, 0, -1)
cubeOne.name = 'video1'
scene.add(cubeOne);

const materialtwo = new THREE.MeshBasicMaterial({
  map: videoTextureTwo
});
const cubeTwo = new THREE.Mesh(geometry, materialtwo);
cubeTwo.position.set(0.25, 0, -1)
cubeTwo.name = 'video2'
scene.add(cubeTwo);


function animate() {
  renderer.setAnimationLoop(render);
}

function render() {
  //raycaster setting based on camera dir/pos 
  const cameraDirection = getCameraDirectionNormalized(); //length = 1
  const cameraPosition = getCameraPosition()
  raycaster.set(cameraPosition, cameraDirection)

  // creating array for the intersects objects
  const objectsToIntersect = [cubeOne, cubeTwo]
  const intersectsArray = raycaster.intersectObjects(objectsToIntersect)

  // Go through an array of intersected objects
  if (intersectsArray.length > 0) {
    for (const intersectObject of intersectsArray) {
      // Case 3: if the raycaster detect first object and not the one behind it
      if (intersectObject.object !== savedIntersectedObject && savedIntersectedObject !== null) {
        if (savedIntersectedObject.name == 'video1') {
          videoOne.pause()
        }
        else if (savedIntersectedObject.name == 'video2') {
          videoTwo.pause()
        }
        savedIntersectedObject = null;
      }
      // Case 1: if the object is a mesh (i.e. a cube) we want to play the video
      if (intersectObject.object instanceof THREE.Mesh) {
        //first save a reference of the last intersected object
        savedIntersectedObject = intersectObject.object
        if (savedIntersectedObject.name == 'video1') {
          videoOne.play()
        }
        else if (savedIntersectedObject.name == 'video2') {
          videoTwo.play()
        }
      }
    }
  } else {
    // Case 2: if we have a last saved object, but our ray isn't currently selecting anything then we have to pause back the video
    if (savedIntersectedObject !== null && savedIntersectedObject.name == 'video1') {
      videoOne.pause()
    }
    else if (savedIntersectedObject !== null && savedIntersectedObject.name == 'video2') {
      videoTwo.pause()
    } // set video to pause
    savedIntersectedObject = null; // we're not pointing at any objects to this variable goes back to null
  }
  renderer.render(scene, camera);
}

animate()

/* Helper functions calculating refernce distance and oriantation */
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