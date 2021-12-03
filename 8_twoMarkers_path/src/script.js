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
camera.position.z = 1
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

  if (arToolkitContext.arController !== null) {
    arToolkitContext.arController.addEventListener('getMarker', function (ev) {
      // marker1Pos.x = ev.data.marker.pos[0]
      // marker1Pos.y = ev.data.marker.pos[1]

      // console.log(ev.data.marker);
      // console.log(marker1Pos);
    });
  }
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
  detectionMode: 'mono',
});

// copy projection matrix to camera when initialization complete
arToolkitContext.init(function onCompleted() {
  camera.projectionMatrix.copy(arToolkitContext.getProjectionMatrix());
});

let markerRootArray = [];
let meshArray = [];

let patternArray = ["6", "7"];
let colorArray = [0xff0000, 0x00ff00];

for (let i = 0; i < patternArray.length; i++) {
  let markerRoot = new THREE.Group();
  scene.add(markerRoot);

  let markerControls = new THREEx.ArMarkerControls(arToolkitContext, markerRoot, {
    type: 'pattern',
    patternUrl: "pattern-" + patternArray[i] + ".patt",
  });

  let mesh = new THREE.Mesh(
    new THREE.BoxBufferGeometry(2, 2, 2),
    new THREE.MeshBasicMaterial({
      color: colorArray[i],
      transparent: true,
      opacity: 0.5
    })
  );
  mesh.position.y = -1.25 / 2;
  markerRoot.add(mesh);

  markerRootArray.push(markerRoot);
  meshArray.push(mesh);
}


const update = () => {

  for (let i = 0; i < patternArray.length-1; i++) {
    meshArray[i].visible = false;
  }

  if (markerRootArray[0].visible) meshArray[0].visible = true;
  else if (markerRootArray[1].visible) meshArray[1].visible = true;

  // update artoolkit on every frame
  if (arToolkitSource.ready !== false) {
    arToolkitContext.update(arToolkitSource.domElement)
  }
}

const render = () => {
  renderer.render(scene, camera);
}

const animate = () => {

  requestAnimationFrame(animate);
  update();
  render();
}

animate()