import './style.css'
import * as THREE from 'three'
import { ARButton } from 'three/examples/jsm/webxr/ARButton.js';
import Hammer from 'hammerjs'

const canvas = document.querySelector('.webgl')
const scene = new THREE.Scene()

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

let radius = 0.1; // size of mesh
const geometry = new THREE.IcosahedronGeometry(radius, 1);
const material = new THREE.MeshPhongMaterial({
  color: new THREE.Color("rgb(226,35,213)"),
  shininess: 6,
  flatShading: true,
  transparent: 1,
  opacity: 0.8
});

const mesh = new THREE.Mesh(geometry, material);
mesh.position.set(0, 0, -0.5);
scene.add(mesh);

const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
  alpha: true
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.xr.enabled = true;

const button = ARButton.createButton(renderer);
document.body.appendChild(button)

button.addEventListener("click", () => {
  const body = document.body
  const hammertime = new Hammer(body)
  console.log(hammertime)

  hammertime.get('pinch').set({ enable: true })

  hammertime.on("pinch", ev => {
    scaleMesh(ev.scale)
  })
})

function scaleMesh(amount) {
  const scaleAmount = clipValue(amount, 0.1, 2);
  mesh.scale.set(scaleAmount, scaleAmount, scaleAmount)
}

// function to clip a value between min and max
function clipValue(val, min, max) {
  return val < min ? min : val > max ? max : val
}

const clock = new THREE.Clock()

function animate() {
  renderer.setAnimationLoop(update)
}

function update() {
  const delta = clock.getDelta()
  renderer.render(scene, camera)
}

animate()