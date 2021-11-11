import './style.css'

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight
}

const canvas = document.querySelector('.webgl')

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(75, sizes.width * 3 / sizes.height, 0.1, 1000);
camera.position.z = 2
scene.add(camera);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
scene.add(ambientLight)

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
  patternUrl: "pattern-6.patt", //https://jeromeetienne.github.io/AR.js/three.js/examples/marker-training/examples/generator.html
})

//scene content///
///from https://github.com/stemkoski/AR-Examples/blob/master/portal-view-AR.html///


let loader = new THREE.TextureLoader();
let defaultMaterial = new THREE.MeshBasicMaterial({
  map: loader.load("/sphere-colored.png"), 
  color: 0x444444,
  side: THREE.DoubleSide,
  transparent: true,
  opacity: 0.6
});

const portal = new THREE.Mesh(
  new THREE.CircleGeometry( 4, 64 ),
  defaultMaterial
);
portal.layers.set(1);
markerRoot.add(portal);

camera.layers.enable(1);

const portalMaterial = new THREE.MeshBasicMaterial({ 
  color: 0x2cecd8, 
  side: THREE.DoubleSide, 
  transparent:true, 
  opacity: 0.75 
});

let portalBorderMesh = new THREE.Mesh(
  new THREE.CircleGeometry( 4.1, 64 ),
  portalMaterial
);
portalBorderMesh.position.y = portal.position.y;
portalBorderMesh.layers.set(0);
markerRoot.add(portalBorderMesh);

// the inside of the hole
let skyMaterialArray = [
  new THREE.MeshBasicMaterial( { map: loader.load("/beach/px.png"), side: THREE.BackSide, transparent: true,
  blending: THREE.NormalBlending } ),
  new THREE.MeshBasicMaterial( { map: loader.load("/beach/nx.png"), side: THREE.BackSide, transparent: true,
  blending: THREE.NormalBlending } ),
  new THREE.MeshBasicMaterial( { map: loader.load("/beach/py.png"), side: THREE.BackSide, transparent: true,
  blending: THREE.NormalBlending } ),
  new THREE.MeshBasicMaterial( { map: loader.load("/beach/ny.png"), side: THREE.BackSide, transparent: true,
  blending: THREE.NormalBlending } ),
  new THREE.MeshBasicMaterial( { map: loader.load("/beach/pz.png"), side: THREE.BackSide, transparent: true,
  blending: THREE.NormalBlending } ),
  new THREE.MeshBasicMaterial( { map: loader.load("/beach/nz.png"), side: THREE.BackSide, transparent: true,
  blending: THREE.NormalBlending } ),
];
let skyMesh = new THREE.Mesh(
  new THREE.BoxBufferGeometry(30 ,30 ,30),
  skyMaterialArray );

skyMesh.rotation.x = -Math.PI * 0.25
 markerRoot.add(skyMesh);

 skyMesh.layers.set(2);



const update = () => {
  // update artoolkit on every frame
  if (arToolkitSource.ready !== false) {
    arToolkitContext.update(arToolkitSource.domElement)
  }
}

const render = () => {
 
let gl = renderer.context;
	
// clear buffers now: color, depth, stencil 
renderer.clear(true,true,true);
// do not clear buffers before each render pass
renderer.autoClear = false;
  
// FIRST PASS
// goal: using the stencil buffer, place 1's in position of first portal (layer 1)

// enable the stencil buffer
//When the stencil test is enabled, the testing logic of the reference stencil value against the framebuffer stencil value is skipped.
gl.enable(gl.STENCIL_TEST);

// layer 1 contains only the first portal
camera.layers.set(1); 

//gl.stencilFunc(gl.ALWAYS, 1, 0x00);
gl.stencilOp(gl.KEEP, gl.KEEP, gl.REPLACE);
gl.stencilMask(0xff);

// only write to stencil buffer (not color or depth)
//gl.colorMask(false,false,false,false);
gl.depthMask(false);

renderer.render( scene, camera );

// SECOND PASS
// goal: render skybox (layer 2) but only through portal

gl.colorMask(true,true,true,true);
gl.depthMask(true);

gl.stencilFunc(gl.EQUAL, 1, 0xff);
gl.stencilOp(gl.KEEP, gl.KEEP, gl.KEEP);

camera.layers.set(2);
renderer.render( scene, camera );

// FINAL PASS
// goal: render the rest of the scene (layer 0)

// using stencil buffer simplifies drawing border around portal
gl.stencilFunc(gl.NOTEQUAL, 1, 0xff);
gl.colorMask(true,true,true,true);
gl.depthMask(true);
camera.layers.set(0); 
renderer.render( scene, camera );

// set things back to normal
renderer.autoClear = true;
}

const animate = () => {
  requestAnimationFrame(animate);
  update();
  render();
}

animate()