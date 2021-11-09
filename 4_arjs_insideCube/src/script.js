import './style.css'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'


const sizes = {
  width: window.innerWidth,
  height: window.innerHeight
}

const canvas = document.querySelector('.webgl')

const scene = new THREE.Scene();

// const axesHelper = new THREE.AxesHelper(0.2);
// scene.add( axesHelper );

const camera = new THREE.PerspectiveCamera(75, sizes.width * 2 / sizes.height, 0.1, 1000);
camera.position.z = 0
// camera.rotation.y = -10
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
  patternUrl: "pattern-4.patt", //https://jeromeetienne.github.io/AR.js/three.js/examples/marker-training/examples/generator.html
})

//scene content

	// the inside of the hole
	let geometry1	= new THREE.BoxBufferGeometry(2,2,2);
	
  const textureLoader = new THREE.TextureLoader()
  const texture = textureLoader.load('./tiles.jpeg')
	let material1	= new THREE.MeshBasicMaterial({
		transparent : true,
    // color: 0xff0000,
		map: texture,
		side: THREE.BackSide
	}); 
	
	const mesh1 = new THREE.Mesh( geometry1, material1 );
	mesh1.position.y = -1;
  mesh1.rotation.x = 40
	
	markerRoot.add( mesh1 );
	
	// the invisibility cloak (box with a hole)
	//let geometry0 = new THREE.BoxBufferGeometry(2,2,2);
  //console.log(geometry0);
	//geometry0.groups.splice(4, 2); // make hole by removing top two triangles

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
    // // left
    { pos: [-1, -1, -1], norm: [-1,  0,  0], uv: [0, 0], },
    { pos: [-1, -1,  1], norm: [-1,  0,  0], uv: [1, 0], },
    { pos: [-1,  1, -1], norm: [-1,  0,  0], uv: [0, 1], },
   
    { pos: [-1,  1, -1], norm: [-1,  0,  0], uv: [0, 1], },
    { pos: [-1, -1,  1], norm: [-1,  0,  0], uv: [1, 0], },
    { pos: [-1,  1,  1], norm: [-1,  0,  0], uv: [1, 1], },
    // // top
    // { pos: [ 1,  1, -1], norm: [ 0,  1,  0], uv: [0, 0], },
    // { pos: [-1,  1, -1], norm: [ 0,  1,  0], uv: [1, 0], },
    // { pos: [ 1,  1,  1], norm: [ 0,  1,  0], uv: [0, 1], },
   
    // { pos: [ 1,  1,  1], norm: [ 0,  1,  0], uv: [0, 1], },
    // { pos: [-1,  1, -1], norm: [ 0,  1,  0], uv: [1, 0], },
    // { pos: [-1,  1,  1], norm: [ 0,  1,  0], uv: [1, 1], },
    // // bottom
    // { pos: [ 1, -1,  1], norm: [ 0, -1,  0], uv: [0, 0], },
    // { pos: [-1, -1,  1], norm: [ 0, -1,  0], uv: [1, 0], },
    // { pos: [ 1, -1, -1], norm: [ 0, -1,  0], uv: [0, 1], },
   
    // { pos: [ 1, -1, -1], norm: [ 0, -1,  0], uv: [0, 1], },
    // { pos: [-1, -1,  1], norm: [ 0, -1,  0], uv: [1, 0], },
    // { pos: [-1, -1, -1], norm: [ 0, -1,  0], uv: [1, 1], },
  ];


  const positions = [];
  const normals = [];
  const uvs = [];
  for (const vertex of vertices) {
    positions.push(...vertex.pos);
    normals.push(...vertex.norm);
    uvs.push(...vertex.uv);
  }

  const geometry0 = new THREE.BufferGeometry();
  const positionNumComponents = 3;
  const normalNumComponents = 3;
  const uvNumComponents = 2;
  geometry0.setAttribute(
      'position',
      new THREE.BufferAttribute(new Float32Array(positions), positionNumComponents));
      geometry0.setAttribute(
      'normal',
      new THREE.BufferAttribute(new Float32Array(normals), normalNumComponents));
      geometry0.setAttribute(
      'uv',
      new THREE.BufferAttribute(new Float32Array(uvs), uvNumComponents));

	
      let material0 = new THREE.MeshBasicMaterial({
        colorWrite: false
      });
      
      let mesh0 = new THREE.Mesh( geometry0, material0 );
      mesh0.scale.set(1,1,1).multiplyScalar(1.01);
      mesh0.position.y = -1;
      mesh0.rotation.x = 40
    

	markerRoot.add(mesh0);	




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
  // controls.update()

  requestAnimationFrame(animate);
  update();
  render();
}

animate()