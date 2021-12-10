import './style.css'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import vertex from './shaders/test/vertex.glsl'
import fragment from './shaders/test/fragment.glsl'

const canvas = document.querySelector('.webgl')

const scene = new THREE.Scene();

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight
}

const camera = new THREE.PerspectiveCamera(75, sizes.width * 2/ sizes.height, 0.1, 1000);
camera.position.z = 1
scene.add(camera);

const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
  alpha: true
});

renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap

//AR.JS
// setup arToolkitSource
const arToolkitSource = new THREEx.ArToolkitSource({
  sourceType: 'webcam',

//uncomment these to fix camera view on mobile.
  // sourceWidth: sizes.height,
  // sourceHeight: sizes.width,

  displayWidth: sizes.width,
  displayHeight: sizes.height,
});

const onResize = () => {
  arToolkitSource.onResize()
  arToolkitSource.copySizeTo(canvas)
  if (arToolkitContext.arController !== null) {
    arToolkitSource.copySizeTo(arToolkitContext.arController.canvas)
  }
}

arToolkitSource.init(function onReady() {
  onResize()
});

// handle resize event
window.addEventListener('resize', function () {
  // onResize()

  //desktop resize
  sizes.width = window.innerWidth
  sizes.height = window.innerHeight
  camera.aspect = sizes.width / sizes.height
  camera.updateProjectionMatrix()
  renderer.setSize(sizes.width, sizes.height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
});

//setup arToolkitContext
const arToolkitContext = new THREEx.ArToolkitContext({
  cameraParametersUrl: 'camera_para.dat', //from https://github.com/jeromeetienne/AR.js/blob/master/data/data/camera_para.dat
  detectionMode: 'mono',
});

// copy projection matrix to camera when initialization complete
arToolkitContext.init(function onCompleted() {
  camera.projectionMatrix.copy(arToolkitContext.getProjectionMatrix());
});


// setup markerRoots
// build markerControls
const markerRoot = new THREE.Group();
scene.add(markerRoot);

let markerControls = new THREEx.ArMarkerControls(arToolkitContext, markerRoot, {
  type: 'pattern',
  patternUrl: "pattern-10.patt", //https://jeromeetienne.github.io/AR.js/three.js/examples/marker-training/examples/generator.html
})


//scene content
const geometry = new THREE.PlaneGeometry(1, 1, 32, 32)
const material = new THREE.ShaderMaterial({
    vertexShader: vertex,
    fragmentShader: fragment,
    side: THREE.DoubleSide,
    uniforms: {
      uTime: { value: 0 }
    }
})

const mesh = new THREE.Mesh(geometry, material)
scene.add(mesh)


const update = () => {
  // update artoolkit on every frame
  if (arToolkitSource.ready !== false) {
    arToolkitContext.update(arToolkitSource.domElement)
  }
}

const render = () => {
  renderer.render(scene, camera);

}

const clock = new THREE.Clock()

const animate = () => {

  const elapsedTime = clock.getElapsedTime()
  material.uniforms.uTime.value = elapsedTime * 0.2
  controls.update()

  requestAnimationFrame(animate);
  update();
  render();
}

animate()