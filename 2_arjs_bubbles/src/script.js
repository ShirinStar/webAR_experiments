import './style.css'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import vertex from './shader/vertex.glsl'
import fragment from './shader/fragment.glsl'


//2. matalic material + webcame envmap
//3. iniit new sphere every few sec
//4. move it up and with rotation
//5. shadows

//Initializes a webcam video stream for an HTML video element
async function initWebcam(videoElement) {
  // create a video stream
  let stream;
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { width: 640, height: 480 },
    });
  } catch (error) {
    return console.error('Unable to access the webcam.', error);
  }
  // apply the stream to the video element
  videoElement.srcObject = stream;
  videoElement.play();
}

const videoElement = document.getElementById('video');
initWebcam(videoElement);

const videoTexture = new THREE.VideoTexture(videoElement);

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight
}

const canvas = document.querySelector('.webgl')

const scene = new THREE.Scene();

const axesHelper = new THREE.AxesHelper(1);
scene.add(axesHelper);

const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 1000);
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
// const arToolkitSource = new THREEx.ArToolkitSource({
//   sourceType: 'webcam',

//   //uncomment these to fix camera view on mobile.
//   sourceWidth: sizes.height,
//   sourceHeight: sizes.width,

//   displayWidth: sizes.width,
//   displayHeight: sizes.height,
// });

// const onResize = () => {
//   arToolkitSource.onResize()
//   arToolkitSource.copySizeTo(canvas)
//   if (arToolkitContext.arController !== null) {
//     arToolkitSource.copySizeTo(arToolkitContext.arController.canvas)
//   }
// }

// arToolkitSource.init(function onReady() {
//   onResize()
// });

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


// setup arToolkitContext
// const arToolkitContext = new THREEx.ArToolkitContext({
//   cameraParametersUrl: 'camera_para.dat', //from https://github.com/jeromeetienne/AR.js/blob/master/data/data/camera_para.dat
//   detectionMode: 'mono_and_matrix',

// });

// copy projection matrix to camera when initialization complete
// arToolkitContext.init(function onCompleted() {
//   camera.projectionMatrix.copy(arToolkitContext.getProjectionMatrix());
// });


// setup markerRoots
// build markerControls
const markerRoot = new THREE.Group();
scene.add(markerRoot);

// let markerControls = new THREEx.ArMarkerControls(arToolkitContext, markerRoot, {
//   type: 'pattern',
//   patternUrl: "arjs-marker.patt", //https://jeromeetienne.github.io/AR.js/three.js/examples/marker-training/examples/generator.html
//   // hangeMatrixMode: 'cameraTransformMatrix'
// })

//scene content
const bubbleGeometry = new THREE.SphereGeometry(1, 32, 32);
const bubbleMaterial = new THREE.ShaderMaterial({
  vertexShader: vertex,
  fragmentShader: fragment,
  uniforms:
  {
    uTime: { value: 0 },
    uBlubFrequency: { value: new THREE.Vector2(2, 1.5) },
    uTexture: { value: videoTexture },
    uRefractionRatio: { value: 1.02 },
    uBias: { value: 0.1 },
    uPower: { value: 2.0 },
    uScale: { value: 1.0 },
    // envMap: { value: cubeCamera.renderTarget.texture}
  },
  transparent: true,
  // side: THREE.DoubleSide
});

const bubble = new THREE.Mesh(bubbleGeometry, bubbleMaterial);

scene.add(bubble)
// markerRoot.add(mesh);

// const update = () => {
//   // update artoolkit on every frame
//   if (arToolkitSource.ready !== false) {
//     arToolkitContext.update(arToolkitSource.domElement)
//   }
// }

const render = () => {
  renderer.render(scene, camera);
  
}

const clock = new THREE.Clock()

const animate = () => {

  const elapsedTime = clock.getElapsedTime()
  bubbleMaterial.uniforms.uTime.value = elapsedTime * 0.2

  controls.update()

  requestAnimationFrame(animate);
  // update();
  render();
}

animate()