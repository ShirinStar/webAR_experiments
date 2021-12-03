import './style.css'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import vertex from './shader/vertex.glsl'
import fragment from './shader/fragment.glsl'

const canvas = document.querySelector('.webgl')

const scene = new THREE.Scene();

let sceneGroup;

let marker1Pos = new THREE.Vector2();
let marker2Pos = new THREE.Vector2();

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
	maxDetectionRate: 30,
});

// copy projection matrix to camera when initialization complete
arToolkitContext.init(function onCompleted() {
  camera.projectionMatrix.copy(arToolkitContext.getProjectionMatrix());
});

// setup markerRoots
let markerNames = ["6", "7"]
let markerArray = []
let markerRoot;

for (let i = 0; i < markerNames.length; i++) {
  markerRoot = new THREE.Group()
  scene.add(markerRoot)

  markerArray.push(markerRoot);

  let markerControlsOne = new THREEx.ArMarkerControls(arToolkitContext, markerRoot, {
    type: 'pattern',
    patternUrl: "pattern-" + markerNames[i] + ".patt", //https://jeromeetienne.github.io/AR.js/three.js/examples/marker-training/examples/generator.html
  })
  let markerGroup = new THREE.Group();
  markerRoot.add(markerGroup);
}

// console.log(markerArray[0].children);

//scene content
sceneGroup = new THREE.Group();

let geo1 = new THREE.BoxBufferGeometry(5, 5, 3)
let material1 = new THREE.MeshBasicMaterial({ color: 0x00ff00 })
let box1 = new THREE.Mesh(geo1, material1)

sceneGroup.add(box1)

let material2 = new THREE.MeshBasicMaterial({ color: 0xff0000 })
let box2 = new THREE.Mesh(geo1, material2)
box2.position.x = 2
sceneGroup.add(box2)


  //markerArray[0].children.push(sceneGroup);
  let currentMarkerName = markerNames[0];



const update = () => {
  let anyMarkerVisible = false;
	for (let i = 0; i < markerArray.length; i++)
	{
		if ( markerArray[i].visible )
		{
			anyMarkerVisible = true;
			markerArray[i].children[0].add( sceneGroup );
			if ( currentMarkerName != markerNames[i] )
			{
				currentMarkerName = markerNames[i];
				// console.log("Switching to " + currentMarkerName);
			}
			
			let p = markerArray[i].children[0].getWorldPosition();
			let q = markerArray[i].children[0].getWorldQuaternion();
			let s = markerArray[i].children[0].getWorldScale();
			let lerpAmount = 0.5;
			
			scene.add(sceneGroup);
			sceneGroup.position.lerp(p, lerpAmount);
			sceneGroup.quaternion.slerp(q, lerpAmount);
			sceneGroup.scale.lerp(s, lerpAmount);

			break;
		}
	}

	if ( !anyMarkerVisible )
	{
		anyMarkerVisible = false;
    console.log("No marker currently visible.");
	}
	
	let baseMarker = markerArray[0];
	
	// update relative positions of markers
	for (let i = 1; i < markerArray.length; i++)
	{
		let currentMarker = markerArray[i];
		let currentGroup  = currentMarker.children[0];
		if ( baseMarker.visible && currentMarker.visible )
		{
			// console.log("updating marker " + i " -> base offset");
			
			let relativePosition = currentMarker.worldToLocal( baseMarker.position.clone() );
			currentGroup.position.copy( relativePosition );
			
			let relativeRotation = currentMarker.quaternion.clone().inverse().multiply( baseMarker.quaternion.clone() );
			currentGroup.quaternion.copy( relativeRotation );
		}
	}
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