import './style.css'

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight
}

const canvas = document.querySelector('.webgl')

const scene = new THREE.Scene();

const axesHelper = new THREE.AxesHelper(0.2);
scene.add( axesHelper );

const camera = new THREE.PerspectiveCamera(75, sizes.width * 2 / sizes.height, 0.1, 1000);
camera.position.z = 0
scene.add(camera);

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
  detectionMode:  'mono_matrix',
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
  patternUrl: "pattern-5.patt", //https://jeromeetienne.github.io/AR.js/three.js/examples/marker-training/examples/generator.html
  changeMatrixMode: "modelViewMatrix",
 
})

//scene content

// the inside of the hole
let insideBoxGeometry = new THREE.BoxBufferGeometry(3, 3, 3);
const insideBoxMaterial = new THREE.MeshNormalMaterial({
  transparent: true,
  // opacity: 0.5,
  side: THREE.BackSide //rendering only in the inside geo
});

const insideBox = new THREE.Mesh(insideBoxGeometry, insideBoxMaterial);
insideBox.position.y = -1;
insideBox.rotation.x = Math.PI * 0.05
markerRoot.add(insideBox);

const torusGeometry = new THREE.TorusKnotGeometry( 0.8, 0.2, 100, 30 );
const torusMaterial = new THREE.MeshNormalMaterial({
  transparent: true,
  blending: THREE.NormalBlending
});
const torusKnot = new THREE.Mesh( torusGeometry, torusMaterial );
torusKnot.position.y = -1;
markerRoot.add( torusKnot );

// the invisibility cloak (box with a hole) 
//- building box vertices as a buffer geo so we can get rid of faces  
const vertices = [
  // front
  { pos: [-1, -1,  1], norm: [ 0,  0,  1], uv: [0, 0], },
  { pos: [ 1, -1,  1], norm: [ 0,  0,  1], uv: [1, 0], },
  { pos: [-1,  1,  1], norm: [ 0,  0,  1], uv: [0, 1], },
 
  { pos: [-1,  1,  1], norm: [ 0,  0,  1], uv: [0, 1], },
  { pos: [ 1, -1,  1], norm: [ 0,  0,  1], uv: [1, 0], },
  { pos: [ 1,  1,  1], norm: [ 0,  0,  1], uv: [1, 1], },
  // right
  { pos: [ 1, -1,  1], norm: [ 1,  0,  0], uv: [0, 0], },
  { pos: [ 1, -1, -1], norm: [ 1,  0,  0], uv: [1, 0], },
  { pos: [ 1,  1,  1], norm: [ 1,  0,  0], uv: [0, 1], },
 
  { pos: [ 1,  1,  1], norm: [ 1,  0,  0], uv: [0, 1], },
  { pos: [ 1, -1, -1], norm: [ 1,  0,  0], uv: [1, 0], },
  { pos: [ 1,  1, -1], norm: [ 1,  0,  0], uv: [1, 1], },
  // back
  { pos: [ 1, -1, -1], norm: [ 0,  0, -1], uv: [0, 0], },
  { pos: [-1, -1, -1], norm: [ 0,  0, -1], uv: [1, 0], },
  { pos: [ 1,  1, -1], norm: [ 0,  0, -1], uv: [0, 1], },
 
  { pos: [ 1,  1, -1], norm: [ 0,  0, -1], uv: [0, 1], },
  { pos: [-1, -1, -1], norm: [ 0,  0, -1], uv: [1, 0], },
  { pos: [-1,  1, -1], norm: [ 0,  0, -1], uv: [1, 1], },
  // left
  { pos: [-1, -1, -1], norm: [-1,  0,  0], uv: [0, 0], },
  { pos: [-1, -1,  1], norm: [-1,  0,  0], uv: [1, 0], },
  { pos: [-1,  1, -1], norm: [-1,  0,  0], uv: [0, 1], },
 
  { pos: [-1,  1, -1], norm: [-1,  0,  0], uv: [0, 1], },
  { pos: [-1, -1,  1], norm: [-1,  0,  0], uv: [1, 0], },
  { pos: [-1,  1,  1], norm: [-1,  0,  0], uv: [1, 1], },
  // top
  // { pos: [ 1,  1, -1], norm: [ 0,  1,  0], uv: [0, 0], },
  // { pos: [-1,  1, -1], norm: [ 0,  1,  0], uv: [1, 0], },
  // { pos: [ 1,  1,  1], norm: [ 0,  1,  0], uv: [0, 1], },
 
  // { pos: [ 1,  1,  1], norm: [ 0,  1,  0], uv: [0, 1], },
  // { pos: [-1,  1, -1], norm: [ 0,  1,  0], uv: [1, 0], },
  // { pos: [-1,  1,  1], norm: [ 0,  1,  0], uv: [1, 1], },
  // bottom
  { pos: [ 1, -1,  1], norm: [ 0, -1,  0], uv: [0, 0], },
  { pos: [-1, -1,  1], norm: [ 0, -1,  0], uv: [1, 0], },
  { pos: [ 1, -1, -1], norm: [ 0, -1,  0], uv: [0, 1], },
 
  { pos: [ 1, -1, -1], norm: [ 0, -1,  0], uv: [0, 1], },
  { pos: [-1, -1,  1], norm: [ 0, -1,  0], uv: [1, 0], },
  { pos: [-1, -1, -1], norm: [ 0, -1,  0], uv: [1, 1], },
];

const positions = [];
const normals = [];
const uvs = [];

for (const vertex of vertices) {
  positions.push(...vertex.pos);
  normals.push(...vertex.norm);
  uvs.push(...vertex.uv);
}

const invisbleBoxGeometry = new THREE.BufferGeometry();
const positionNumComponents = 3;
const normalNumComponents = 3;
const uvNumComponents = 2;

invisbleBoxGeometry.setAttribute(
  'position',
  new THREE.BufferAttribute(new Float32Array(positions), positionNumComponents));

invisbleBoxGeometry.setAttribute(
  'normal',
  new THREE.BufferAttribute(new Float32Array(normals), normalNumComponents));

invisbleBoxGeometry.setAttribute(
  'uv',
  new THREE.BufferAttribute(new Float32Array(uvs), uvNumComponents));


let invisbleBoxMaterial = new THREE.MeshBasicMaterial({
  colorWrite: false //Whether to render the material's color 
});

let invisbleBox = new THREE.Mesh(invisbleBoxGeometry, invisbleBoxMaterial);
invisbleBox.scale.set(3, 3, 3).multiplyScalar(1.01);
invisbleBox.position.y = -1;
invisbleBox.rotation.x = Math.PI * 0.05

markerRoot.add(invisbleBox);

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
  
  torusKnot.rotation.y += 0.01
  torusKnot.rotation.x += 0.01

  requestAnimationFrame(animate);
  update();
  render();
}

animate()