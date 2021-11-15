import './style.css'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import vertex from './shader/vertex.glsl'
import fragment from './shader/fragment.glsl'

const canvas = document.querySelector('.webgl')

const scene = new THREE.Scene();

//lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
scene.add(ambientLight)

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight
}

const camera = new THREE.PerspectiveCamera(75, sizes.width * 2 / sizes.height, 0.1, 1000);
camera.position.z = 5
scene.add(camera);

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

  sourceWidth: sizes.height,
  sourceHeight: sizes.width,

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
  onResize()

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
  detectionMode: 'mono_and_matrix',
});

// copy projection matrix to camera when initialization complete
arToolkitContext.init(function onCompleted() {
  camera.projectionMatrix.copy(arToolkitContext.getProjectionMatrix());
});

// setup markerRoots
const markerRoot = new THREE.Group();
scene.add(markerRoot);

let markerControls = new THREEx.ArMarkerControls(arToolkitContext, markerRoot, {
  type: 'pattern',
  patternUrl: "pattern-7.patt", //https://jeromeetienne.github.io/AR.js/three.js/examples/marker-training/examples/generator.html
})

//scene content
let videoTexture = new THREE.VideoTexture(arToolkitSource.domElement) // access to webcam
//videoTexture.minFilter = THREE.LinearFilter //  how a texture is render when it is on more than one pixel- this takes the four closest texels and bilinearly interpolates among them.

const refractionMaterial = new THREE.ShaderMaterial({
  vertexShader: vertex,
  fragmentShader: fragment,
  uniforms: {
    uTexture: { value: videoTexture },
    uRefractionRatio: { value: 0.65 },
    uDistance: { value: 1.0 },
    uOpacity: { value: 0.85 },
    uTint: { value: new THREE.Vector3(0.8, 0.4, 1.0) }
  },
  transparent: true,
})

const geometry = new THREE.TorusKnotGeometry(1.2, 0.4, 128, 16);

const torusKnot = new THREE.Mesh(geometry, refractionMaterial);
torusKnot.position.y = 2

markerRoot.add(torusKnot)

const update = () => {
  // update artoolkit on every frame
  if (arToolkitSource.ready !== false) {
    arToolkitContext.update(arToolkitSource.domElement)
  }
}

const render = () => {
  renderer.render(scene, camera);
}

const animate = () => {
  //torusKnot.rotation.x += 0.01
  torusKnot.rotation.y += 0.01

  requestAnimationFrame(animate);
  update();
  render();
}

animate()