import './style.css'
import * as THREE from 'three'
import { ARButton } from 'three/examples/jsm/webxr/ARButton.js';
import vertex from './shader/vertex.glsl'
import fragment from './shader/fragment.glsl'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js'

const canvas = document.querySelector('canvas.webgl')
const scene = new THREE.Scene()

//Initializes a webcam video stream for an HTML video element
async function initWebcam(videoElement) {
  let stream;
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { width: 640, height: 480 },
    });
  } catch (error) {
    return console.error('Unable to access the webcam.', error);
  }
  videoElement.srcObject = stream;
  videoElement.play();
}

const videoElement = document.getElementById('video');
initWebcam(videoElement);

//apply the webcam view to texture
const videoTexture = new THREE.VideoTexture(videoElement);

const colorObject = {}
colorObject.color = '#ffffff'

const textMaterial = new THREE.ShaderMaterial({
  vertexShader: vertex,
  fragmentShader: fragment,
  uniforms: {
    uTexture: { value: videoTexture },
    uColor: { value: new THREE.Color(colorObject.color) }
  }
})

const fontLoader = new FontLoader()
let text;

fontLoader.load(
  '/fonts/helvetiker_regular.typeface.json',
  (font) => {
    const textGeometry = new THREE.TextGeometry('can you see me?', {
      font: font,
      size: 2.5,
      height: 0.1,
      curveSegments: 0.1,
      bevelSize: 0.02,
    });
    text = new THREE.Mesh(textGeometry, textMaterial)

    textGeometry.computeBoundingBox()

    textGeometry.translate(
      - (textGeometry.boundingBox.max.x - 0.02) * 0.5, // Subtract bevel size
      - (textGeometry.boundingBox.max.y - 0.02) * 0.5, // Subtract bevel size
      - (textGeometry.boundingBox.max.z - 0.03) * 0.5  // Subtract bevel thickness
    )

    text.scale.set(0.05, 0.05, 0.05)
    text.position.set(0, 0, -5)
    scene.add(text)
  }
)

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

function createVectorDistanceFromCamera(distanceFromCamera) {
  const vector = new THREE.Vector3()
  camera.getWorldDirection(vector) //setting the vector in the direction of camera
  vector.multiplyScalar(distanceFromCamera)
  vector.add(camera.position) //setting the vector to camera position
  return vector
}

function updateTextPosition() {
  const vector = createVectorDistanceFromCamera(3)
  text.position.set(vector.x, vector.y, vector.z)
  text.setRotationFromQuaternion(camera.quaternion) 
}

function animate() {
  renderer.setAnimationLoop(render);
}

function render() {
  updateTextPosition()
  renderer.render(scene, camera);
}
animate()

