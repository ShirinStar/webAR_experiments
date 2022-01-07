import './style.css'
import * as THREE from 'three'
import { ARButton } from 'three/examples/jsm/webxr/ARButton.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'dat.gui'

const gui = new dat.GUI()

const canvas = document.querySelector('canvas.webgl')
const scene = new THREE.Scene()


const geometry = new THREE.BoxBufferGeometry(2, 2, 2);
const material = new THREE.MeshNormalMaterial({
  transparent: true,
  opacity: 0.5,
  side: THREE.DoubleSide
});
const mesh = new THREE.Mesh(geometry, material)
mesh.position.set(0, 0, -10);
scene.add(mesh)

const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
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
//this will enable the webXR api
renderer.xr.enabled = true;

//the AR button will check if the device is suitable to run webxr session
document.body.appendChild( ARButton.createButton( renderer ) );

const clock = new THREE.Clock()

function animate() {
  renderer.setAnimationLoop( update );
}

function update() {
  const elapsedTime = clock.getElapsedTime()
  
  mesh.rotation.y = elapsedTime * 0.5
  renderer.render( scene, camera );
}

animate()