import './style.css'
import * as THREE from 'three'
import { ARButton } from 'three/examples/jsm/webxr/ARButton.js';
import { PositionalAudioHelper } from 'three/examples/jsm/helpers/PositionalAudioHelper.js'

let audioIsInitialized = false;
let audioIsPlaying = false;
let sound;
let listener;
let mesh;
const positionOfAudioAndSphere = { x: 0, y: 0, z: -0.5 };

const canvas = document.querySelector('.webgl')
const scene = new THREE.Scene()

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight
}

window.addEventListener('resize', () => {
  sizes.width = window.innerWidth
  sizes.height = window.innerHeight
  camera.aspect = sizes.width / sizes.height
  camera.updateProjectionMatrix()
  renderer.setSize(sizes.width, sizes.height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.01, 100)
scene.add(camera)

const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1)
light.position.set(0.5, 1, 0.25)
scene.add(light)

const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
  alpha: true
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.xr.enabled = true;

const button = ARButton.createButton(renderer, {
  optionalFeatures: ["dom-overlay", "dom-overlay-for-handheld-ar"],
  domOverlay: {
    root: document.body
  }
})

document.body.appendChild(button);
button.style.backgroundColor = 'black';

button.addEventListener('click', async () => {
  if (!audioIsInitialized) { // one time setup
    await setupAudio()
    audioIsInitialized = true
    startAudio()
    console.log("start audio")
  } else {
    toggleAudio()
  }
})

function animate() {
  renderer.setAnimationLoop(render);
}

function render(timestamp, frame) {
  renderer.render(scene, camera)
}


async function setupAudio() {
  // create an AudioListener and add it to the camera / device
  listener = new THREE.AudioListener()
  camera.add(listener)

  // create audio sound and sphere
  createSphere()
  await createPositionalAudio() //takes a few sec to load the audio
  // finally add the sound to the mesh- if the mesh moves the sound will move with it
  mesh.add(sound)
}

function createSphere() {
  // // create an object for the sound to play from
  const sphere = new THREE.SphereBufferGeometry(0.2, 32, 16)
  const material = new THREE.MeshPhongMaterial({ color: 0xff2200 })
  mesh = new THREE.Mesh(sphere, material)
  mesh.position.set(positionOfAudioAndSphere.x, positionOfAudioAndSphere.y, positionOfAudioAndSphere.z);
  scene.add(mesh)
}

async function createPositionalAudio() {
  sound = new THREE.PositionalAudio(listener)
  sound.setRefDistance(0.1) // the distance between sound and listener at which the volume reduction starts taking effect.
  sound.setDistanceModel('linear') // this has to be linear for the max distance to work
  sound.setMaxDistance(1.5) // more settings here: https://threejs.org/docs/#api/en/audio/PositionalAudio
  sound.setLoop(true)
  // Good definitions for what each of these are at
  // https://stackoverflow.com/questions/36706118/use-three-js-positionalaudio-to-make-a-cone-of-sound
  // coneInnerAngle, coneOuterAngle, coneOuterGain (from 0-1, 0 means no audio outside of cone)
  sound.setDirectionalCone(180, 230, 0) //the shape of the audio

  // load a sound and set it as the PositionalAudio object's buffer
  const audioLoader = new THREE.AudioLoader()
  // do not load a music file as ogg, won't play in Firefox
  const url = '/alan_watts.mp3'
  const buffer = await audioLoader.loadAsync(url)
  sound.setBuffer(buffer)

  // optional helper to visualize the cone shape- only via mobile device
  const helper = new PositionalAudioHelper(sound)
  sound.add(helper)
}

function startAudio() {
  sound.play()
  audioIsPlaying = true
}

function stopAudio() {
  sound.stop()
  audioIsPlaying = false
}

function toggleAudio() {
  if (audioIsInitialized) {
    if (!audioIsPlaying) {
      playAudio()
    } else {
      stopAudio()
    }
  }
}

animate()