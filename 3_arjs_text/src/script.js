import './style.css'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js'
import CANNON from 'cannon'

let letters;
let texts = [];

let sphereBody = null;

const canvas = document.querySelector('.webgl')

const scene = new THREE.Scene();

const world = new CANNON.World()
world.gravity.set(0, - 9.82, 0)

const defaultMaterial = new CANNON.Material('default')
const defaultContactMaterial = new CANNON.ContactMaterial(
  defaultMaterial,
  defaultMaterial,
  {
    friction: 0.1,
    restitution: 0.1
  }
)
world.addContactMaterial(defaultContactMaterial)
world.defaultContactMaterial = defaultContactMaterial

// const axesHelper = new THREE.AxesHelper();
// scene.add(axesHelper);

const textureLoader = new THREE.TextureLoader()
const textTexture = textureLoader.load('/textures/matcaps/8.png')

const fontLoader = new FontLoader()

function showLetters() {
  let simpleText = " i keep on falling in and out  with love"
  letters = simpleText.split("")
}

showLetters();

//lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5)
directionalLight.position.set(1, 2, 0)
directionalLight.castShadow = true
directionalLight.shadow.mapSize.width = 1024
directionalLight.shadow.mapSize.height = 1024
directionalLight.shadow.camera.near = .1
directionalLight.shadow.camera.far = 50
directionalLight.shadow.radius = 50
scene.add(directionalLight)


const sizes = {
  width: window.innerWidth,
  height: window.innerHeight
}

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
// build markerControls
const markerRoot = new THREE.Group();
scene.add(markerRoot);

let markerControls = new THREEx.ArMarkerControls(arToolkitContext, markerRoot, {
  type: 'pattern',
  patternUrl: "pattern-3.patt", //https://jeromeetienne.github.io/AR.js/three.js/examples/marker-training/examples/generator.html
})

//scene content
//invisble floor to receive shadow
const floorGeometry = new THREE.PlaneBufferGeometry(500, 500);
const floorMaterial = new THREE.MeshStandardMaterial({
  side: THREE.DoubleSide,
  transparent: true,
  opacity: 0.1
})

const floorMesh = new THREE.Mesh(floorGeometry, floorMaterial)
floorMesh.rotation.x = Math.PI / 2
floorMesh.position.y = 0
floorMesh.receiveShadow = true
// scene.add(floorMesh)
markerRoot.add(floorMesh)

const floorShape = new CANNON.Plane()
const floorBody = new CANNON.Body()
floorBody.mass = 0
floorBody.addShape(floorShape)
world.addBody(floorBody)
floorBody.quaternion.setFromAxisAngle(new CANNON.Vec3(- 1, 0, 0), Math.PI * 0.5)
floorBody.position.y = - .58


let i = 0;
const addLetter = (position) => {
  fontLoader.load(
    '/fonts/helvetiker_regular.typeface.json',
    (font) => {
      const textGeometry = new THREE.TextGeometry(
        letters[i],
        {
          font: font,
          size: 2,
          height: 1,
          curveSegments: 12,
          bevelEnabled: true,
          bevelThickness: 0.03,
          bevelSize: 0.02,
          bevelOffset: 0,
          bevelSegments: 5
        }
      )
      const textMaterial = new THREE.MeshMatcapMaterial({ matcap: textTexture })
      const text = new THREE.Mesh(textGeometry, textMaterial)
      text.position.copy(position)
      text.castShadow = true
      markerRoot.add(text)

      const sphereShape = new CANNON.Sphere(0.6)
      sphereBody = new CANNON.Body({
        mass: 0.1,
        shape: sphereShape,
      })
      sphereBody.applyLocalForce(new CANNON.Vec3(5, 0, 0), new CANNON.Vec3(0, 0, 0))
      sphereBody.position.copy(position)
      world.addBody(sphereBody)
      i++;

      texts.push({
        text,
        sphereBody
      })
    }
  )
}

const timeaddLetter= () => {
  if (i <= letters.length) {
    addLetter({x: Math.random() -0.5, y: 4, z: Math.random() -0.5})
      setTimeout(timeaddLetter, 800)

  }
}

timeaddLetter()


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
let oldElapsedTime = 0

const animate = () => {
  const elapsedTime = clock.getElapsedTime()
  const deltaTime = elapsedTime - oldElapsedTime
  oldElapsedTime = elapsedTime

  if (sphereBody !== null) {
    sphereBody.applyForce(new CANNON.Vec3(- 0.01, 0, 0), sphereBody.position)
  }

  world.step(1 / 60, deltaTime, 3)

  controls.update()

  for (const object of texts) {
    object.text.position.copy(object.sphereBody.position)
  }

  requestAnimationFrame(animate);
  update();
  render();
}

animate()