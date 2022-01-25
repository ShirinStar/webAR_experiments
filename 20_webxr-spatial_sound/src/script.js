import './style.css'
import * as THREE from 'three'
import { ARButton } from 'three/examples/jsm/webxr/ARButton.js';
import { ResonanceAudio } from 'resonance-audio';

let audioIsInitialized = false;
let audioIsPlaying = false;
let audioElement;
let audioContext;
let resonanceAudioScene;
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

button.addEventListener('click', () => {
  toggleAudio();
});


function createSphere() {
  //create an object for the sound to play from
  const sphere = new THREE.SphereBufferGeometry(0.2, 32, 16);
  const material = new THREE.MeshPhongMaterial({ color: 0xff2200 });
  const mesh = new THREE.Mesh(sphere, material);
  mesh.position.set(positionOfAudioAndSphere.x, positionOfAudioAndSphere.y, positionOfAudioAndSphere.z);
  scene.add(mesh);
}

function animate() {
  renderer.setAnimationLoop(render);
}

function render(timestamp, frame) {
  // if frame is not undefind, we know we are in an AR scene
  if (frame) {
    // setup audio and the sphere
    // only will run one time since isAudioInitialized will be true next time
    if (!audioIsInitialized) {
      setupAudioScene();
    }
    if (resonanceAudioScene !== undefined) {
      // set position and orienation of listener based on camera/phone so it know where i am in space
      resonanceAudioScene.setListenerFromMatrix(camera.matrixWorld);
    }
  }
  renderer.render(scene, camera);
}

function setupAudioScene() {
  createSphere()
  createAudioScene()
  createPositionalAudio()
  playAudio()
  audioIsInitialized = true
}

function createAudioScene() {
  // have to set AudioContext for different browsers
  const AudioContext = window.AudioContext || window.webkitAudioContext || false;
  window.AudioContext = AudioContext;

  audioContext = new AudioContext();

  resonanceAudioScene = new ResonanceAudio(audioContext);

  // Connect the scene’s binaural output to stereo out.
  resonanceAudioScene.output.connect(audioContext.destination);
}

function createPositionalAudio() {
  // Create an AudioElement.
  audioElement = document.createElement("audio");
  const url = '/alan_watts.mp3'
  audioElement.src = url;
  audioElement.crossOrigin = 'anonymous';
  audioElement.loop = true;
  console.log(audioElement)

  // Generate a MediaElementSource from the AudioElement.
  const audioElementSource = audioContext.createMediaElementSource(audioElement);

  // Add the MediaElementSource to the scene as an audio input source. 
  //it connects the audio source to a 3d representation of it
  const source = resonanceAudioScene.createSource();
  audioElementSource.connect(source.input);

  // Set the source position relative to the room center (source default position).
  // More API references here: https://resonance-audio.github.io/resonance-audio/reference/web/Source
  source.setPosition(positionOfAudioAndSphere.x, positionOfAudioAndSphere.y, positionOfAudioAndSphere.z);
  source.setMaxDistance(1.5);
  source.setRolloff("linear"); //this control how quickly it will fade out. can be logarithmic, linear or none

  // source.setDirectivityPattern(alpha, sharpness)
  // alpha:  where 0 is an omnidirectional pattern, 1 is a bidirectional pattern, 0.5 is a cardiod pattern
  // More info here: https://resonance-audio.github.io/resonance-audio/reference/web/Source
  // source.setDirectivityPattern(0.5, 5); // this will only play the sound only to the front of the sphere (pointing towards the camera)
  source.setDirectivityPattern(0, 1); // this will play sound all around the sphere
}

function playAudio() {
  audioElement.play();
  audioIsPlaying = true;
}

function stopAudio() {
  audioElement.pause();
  audioIsPlaying = false;
  // audioElement.currentTime = 0; // if you want to restart the audio track to the beginning
}

function toggleAudio() {
  if (audioIsInitialized) {
    if (!audioIsPlaying) {
      playAudio();
    } else {
      stopAudio();
    }
  }
}

animate()