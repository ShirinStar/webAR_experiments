import './style.css'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

import fragmentShader from './shaders/fragment.glsl'
import vertexShader from './shaders/vertex.glsl'
import gsap from 'gsap'

let markerAppeared = false; 

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight
}

const canvas = document.querySelector('.webgl')
const scene = new THREE.Scene();
// const axesHelper = new THREE.AxesHelper(0.2);
// scene.add( axesHelper );

const textNotification = document.querySelector('.notification')

const camera = new THREE.PerspectiveCamera(75, sizes.width * 2 / sizes.height, 0.1, 1000);
camera.position.z = 5
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


//AR.JS
// setup arToolkitSource
const arToolkitSource = new THREEx.ArToolkitSource({
  sourceType: 'webcam',

  //uncomment these to fix camera view on mobile.
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

// setup arToolkitContext
const arToolkitContext = new THREEx.ArToolkitContext({
  cameraParametersUrl: 'camera_para.dat', //from https://github.com/jeromeetienne/AR.js/blob/master/data/data/camera_para.dat
  detectionMode: 'mono',
});

// copy projection matrix to camera when initialization complete
arToolkitContext.init(function onCompleted() {
  camera.projectionMatrix.copy(arToolkitContext.getProjectionMatrix());
 
});

// setup markerRoots and build markerControls
const markerRoot = new THREE.Group();
scene.add(markerRoot);

let markerControls = new THREEx.ArMarkerControls(arToolkitContext, markerRoot, {
  type: 'pattern',
  patternUrl: "pattern-10.patt", //https://jeromeetienne.github.io/AR.js/three.js/examples/marker-training/examples/generator.html
})

const colorObject = {}
colorObject.depthColor = '#186691'
colorObject.surfaceColor = '#8888ff'

//scene content
const geometry = new THREE.SphereGeometry(2, 32, 32);
const material = new THREE.ShaderMaterial({
  side: THREE.DoubleSide,
  fragmentShader: fragmentShader,
  vertexShader: vertexShader, 
  
  uniforms: {
    uTime : {value:0},
    uBigWaveElevation: {value: 0.5},
    uBigWaveFreq:  { value: new THREE.Vector2(4, 1.5) } ,
    uBigWaveSpeed: {value: 0.75},

    uVibration: {value: 0},

    uDepthColor: {value: new THREE.Color(colorObject.depthColor)},
    uSurfaceColor: {value: new THREE.Color(colorObject.surfaceColor)},
    uColorOffset: {value: 0.08},
    uColorMultiple: {value: 2}
  }
})

const mesh = new THREE.Mesh(geometry, material);
//scene.add(mesh)
markerRoot.add(mesh);

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

  controls.update()

  material.uniforms.uTime.value = elapsedTime

  requestAnimationFrame(animate);
  update();
  render();

  //checking lost/found marker after showing once
  if(markerRoot.visible) {
    markerAppeared = true
    //vibration activate
    navigator.vibrate(100);
    gsap.to(material.uniforms.uVibration, {
      duration: 3,
      value: 1,
      ease: "power2.inOut"
    })
    gsap.to(material.uniforms.uVibration, {
      duration: 1,
      delay: 2.5,
      value: 0
    })
  }
  if(markerRoot.visible && markerAppeared) {
    textNotification.style.display = 'none'
  } 
  if(!markerRoot.visible && markerAppeared) {
    textNotification.style.display = 'block'
  } 
}

animate()