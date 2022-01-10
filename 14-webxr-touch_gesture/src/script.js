import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { ARButton } from 'three/examples/jsm/webxr/ARButton.js';

const canvas = document.querySelector('canvas.webgl')

const scene = new THREE.Scene()

const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
const pointLight = new THREE.PointLight(0xffffff, 0.5)
pointLight.position.set(2, 3, 4)

const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
hemisphereLight.position.set(0.5, 1, 0.25);

scene.add(hemisphereLight, ambientLight, pointLight)

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
camera.position.z = 10
scene.add(camera)


const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
  alpha: true
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.xr.enabled = true;

const controller = renderer.xr.getController(0);
controller.addEventListener('select', onSelect);
scene.add(controller);

document.body.appendChild(ARButton.createButton(renderer));

//face generating 
function onSelect() {
  const faceContainer = new THREE.Group()
  //face
  let xRadius = 1.2 * (Math.random() + 1)
  let yRadius = 1.6 * (Math.random() + 1)

  const path = new THREE.Shape();
  // ax, aY, xRadius, yRadius, aStartAngle,aEndAngle, aClockwise, aRotation
  path.absellipse(0, 0, xRadius, yRadius, 0, Math.PI * 2, false, 0);
  const faceGeometry = new THREE.ShapeBufferGeometry(path);
  const faceMaterial = new THREE.MeshPhongMaterial({
    color: 0xffffff * Math.random(),
    shininess: 6,
    flatShading: true,
    transparent: 1,
    opacity: 0.8,
    blending: THREE.AdditiveBlending
  });
  const faceEllipse = new THREE.Mesh(faceGeometry, faceMaterial);

  //eyes
  let eyeSize = Math.random() / 1.5
  const leftEyeGroup = new THREE.Group()
  const rightEyeGroup = new THREE.Group()

  const eyeGeometry = new THREE.SphereBufferGeometry(eyeSize, 64, 64)
  const eyeMaterial = new THREE.MeshBasicMaterial()
  const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial)

  let randomSmalleye = Math.random() + 2

  const smallEyeGeometry = new THREE.SphereBufferGeometry(eyeSize / randomSmalleye, 64, 64)
  const smallEyeMaterial = new THREE.MeshBasicMaterial({ color: 'black' })
  const smallEyeLeft = new THREE.Mesh(smallEyeGeometry, smallEyeMaterial)
  const smallEyeRight = new THREE.Mesh(smallEyeGeometry, smallEyeMaterial)
  smallEyeLeft.position.z = 0.5
  smallEyeRight.position.z = 0.5

  leftEyeGroup.add(leftEye, smallEyeLeft)
  leftEyeGroup.position.x = (Math.random() - 1)
  leftEyeGroup.position.y = Math.random() + 1

  const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial)
  rightEyeGroup.add(rightEye, smallEyeRight)
  rightEyeGroup.position.x = (Math.random()) * 1.5
  rightEyeGroup.position.y = Math.random() + 1

  //mouth
  let xRadiusMouth = Math.random() + 0.2
  let yRadiusMouth = Math.random() - 0.2

  const pathMouth = new THREE.Shape();
  // ax, aY, xRadius, yRadius, aStartAngle,aEndAngle, aClockwise, aRotation
  pathMouth.absellipse(0, 0, xRadiusMouth, yRadiusMouth, 0, Math.PI * 2, false, 0);
  const mouthGeometry = new THREE.ShapeBufferGeometry(pathMouth);
  const mouthMaterial = new THREE.MeshBasicMaterial({
    color: new THREE.Color(1 * (Math.random() + 0.3), 0, 0),
    side: THREE.DoubleSide
  });
  const mouthEllipse = new THREE.Mesh(mouthGeometry, mouthMaterial);

  faceContainer.add(faceEllipse, leftEyeGroup, rightEyeGroup, mouthEllipse)
  faceContainer.position.set( 0, 0, - 20 + Math.random() * 5).applyMatrix4( controller.matrixWorld );
  faceContainer.quaternion.setFromRotationMatrix( controller.matrixWorld );
  scene.add(faceContainer)
}


function animate() {
  renderer.setAnimationLoop(render);
}

function render() {
  renderer.render(scene, camera);
}


animate()