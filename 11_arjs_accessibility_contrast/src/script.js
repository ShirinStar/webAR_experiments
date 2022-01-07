import './style.css'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import vertex from './shader/vertex.glsl'
import fragment from './shader/fragment.glsl'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js'


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

//apply the webcam view to texture
const videoTexture = new THREE.VideoTexture(videoElement);

const canvas = document.querySelector('.webgl')

const scene = new THREE.Scene();

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight
}

const camera = new THREE.PerspectiveCamera(75, sizes.width * 2/ sizes.height, 0.1, 1000);
camera.position.z = 3
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

const colorObject = {}
colorObject.color = '#ffffff'

const textMaterial = new THREE.ShaderMaterial({
  vertexShader: vertex,
  fragmentShader: fragment,
  uniforms: {
    uTexture: {value: videoTexture},
    uColor: {value: new THREE.Color(colorObject.color)}
  }
})


//scene content
const fontLoader = new FontLoader()

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
    const mesh = new THREE.Mesh(textGeometry, textMaterial)
    
    textGeometry.computeBoundingBox()
   
    //centering the text
    textGeometry.translate(
      - (textGeometry.boundingBox.max.x - 0.02) * 0.5, // Subtract bevel size
      - (textGeometry.boundingBox.max.y - 0.02) * 0.5, // Subtract bevel size
      - (textGeometry.boundingBox.max.z - 0.03) * 0.5  // Subtract bevel thickness
  )

   mesh.scale.set(0.05, 0.05, 0.05)
    scene.add(mesh)
    //markerRoot.add(mesh)
  }
)


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

  requestAnimationFrame(animate);
  update();
  render();
}

animate()