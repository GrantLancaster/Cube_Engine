import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

/*----- Camera, Scene, Renderer Setup -----*/
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(70, window.innerWidth/window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
camera.position.z = 10;
/*-----------------------------------------*/

/*------------ Materials Setup ------------*/
// Materials are used in tandem with geometries to create a Mesh object.
// Phong material is used as it has shadows from the lighting.
// Documentation on phong material here:
// https://threejs.org/docs/index.html?q=mes#api/en/materials/MeshPhongMaterial

// This function generates materials as its called, prventing one from needing to make 
// a new variable for a material each time one is needed. More on this function
// in the 'MESH' section.
function createMat(needStencil, referenceNum, pColor, objColor ) {
	if (needStencil) {
		const planeMaterial = new THREE.MeshPhongMaterial({color: pColor});
		planeMaterial.stencilWrite = true;
		planeMaterial.stencilRef = referenceNum;
		planeMaterial.stencilFunc = THREE.AlwaysStencilFunc;
		planeMaterial.stencilZPass = THREE.ReplaceStencilOp;
		planeMaterial.colorWrite = false;
		planeMaterial.depthWrite = false;
		return planeMaterial;
	}
	else {
		const objectMaterial = new THREE.MeshPhongMaterial({color: objColor});
		objectMaterial.stencilWrite = true;
		objectMaterial.stencilRef = referenceNum;
		objectMaterial.stencilFunc = THREE.EqualStencilFunc;
		return objectMaterial;
	}
};

// More detailed material documentation. There's a lot you can do with these.
// https://threejs.org/docs/index.html?q=materials#api/en/constants/Materials 
/*-----------------------------------------*/



/*------------- Light Setup ---------------*/
const color = 0xFFFFFF;
const intensity = 3;
const light = new THREE.DirectionalLight(color, intensity);
/*-----------------------------------------*/



/*----------- Geometries Setup ------------*/
// Three.js has a number of different default geometries that can be made.
// They all take parameters for their dimensions. And example of a plane is bellow.
const planeWidth = 6;
const planeHeight = 6;
const PlaneGeometry = new THREE.PlaneGeometry(planeWidth, planeHeight);
// Here is the link to Three.js Documentation:
// https://threejs.org/docs/index.html#manual/en/introduction/Creating-a-scene
// Use the search bar to find 'geometries', for the individual options.
/*-----------------------------------------*/


/*------ Mesh Initialization Setup --------*/
// To make a mesh in Three.js, you need two things:
//		1. A geometry 
//		2. A material to attatch to the geometry
// The syntax looks like this:
// const mesh = new THREE.Mesh(geometry, material)

// A function called createMat(...) takes in 4 arguments, and will create a 
// material for you. Here are the arguments:
/*		createMat(
				needStencil: boolean; --> DOES THIS MATERIAL NEED TO BE STENCIL ENABLED? true OR false.
				referenceNum: integer; --> WHOLE NUMBER INTEGER TO BE THE STENCIL BUFFER REFERENCE NUMBER.
				pColor: string; --> STRING THAT IS A COLOR (THINK CSS COLOR STRINGS).
				objColor: string; --> STRING THAT IS A COLOR (THINK CSS COLOR STRINGS).
) */
// SEE BELLOW FOR AN EXAMPLE OF A PLANE MESH USING THE MATERIAL GENERATION FUNCTION.
const PlaneMesh = new THREE.Mesh(PlaneGeometry, createMat(true, 2, "white", "white"));
/*-----------------------------------------*/


let impossibleCube, block, planet;
let frontFaceObjects = [];

/*------------ Controls -------------*/
const controls = new OrbitControls(camera, renderer.domElement);
controls.update();
/*-----------------------------------------*/

function setup() {
	// This is where you add the loaded mesh to the scene, as well as your camera and light sources.
	// This is also where you can make some initial manipulations to it before
	// the render loop is started.

	// Attatching the light created earlier, to the camera so it moves with the camera.
	camera.add(light);
	// Adding the camera to the scene.
	scene.add(camera);

	// Using the PlaneMesh from above:
  scene.add(PlaneMesh);

	// Move the plane 0 on the x-axis, 0 on the y-axis, a 3 on the z-axis (axis relative to the scene):
	PlaneMesh.position.set(0,0,3);
  

	// IF YOU ARE WANTING TO LOAD CUSTOM MODELS, CALL YOUR BUILD FUNCTION HERE.
  build_with_custom_models();

	// IF YOU ARE ONLY USING THREE.JS GEOMETRIES, YOU CAN START THE RENDER LOOP INSTEAD.
	// render()
};

async function build_with_custom_models() {
	/* 
	To use custom models with Three.js (in this scenario, a .gltf format),
	you will need a few things:
		1. a loader --> in this case, the GLTFLoader()
			const loader = new GLTFLoader();
		2. the file you want to load --> for example 'diamond.gltf'
			const customModel = await loader.loadAsync('./models/diamond.gltf');
	These will need to be variables, or you can use a function an return them from the function call.
	*/

	// Because the models in the Impossible Cube needed to be stencil enabled,
	// a custom async loading function 'loadModel(...)' was created. the function takes 3 parameters:
	/*
			await loadModel("path_to_model", needStencil, stencilRef);
				path_to_model: string; --> relative or absolute path to the model file.
				needStencil: boolean; --> does the object need to be stencil enabled? true or false.
				stencilRef: integer; --> Whole number integer.
	*/

	// the loader uses an async loading function, so you want to make sure you use 'await'
	// in your function call.

	// IMPORTANT NOTE ABOUT THE STENCIL LAYER.
	// The stencil refernce numbers can be mixed up during the the loading of a custom model.
	// That is, if you have multiple ' await loadModel(...) ' calls in a row, the smaller files
	// will render first. This is an issue because, if you need each face to specifically
	// hold an animation, but the models used in that face take longer to load,
	// the smaller file will fill their spot, forcing the wrong things to render in the wrong faces of the cube.

	// The work around for this? Three.js has an ' await Promise.all([...]) ' function
	// that will wait for all of the promises to succeed before moving on. 
	// This creates a longer loading time on initial render, but ensure that everything is
	// where it is supposed to be. The function takes one argument:
	//		await Promise.all( [..] );
	//		where the array argument is a list of all the models you want to render. See bellow
	//		for an example.

	// Load a single custom model, that does need to be stencil enabled, with a stencilRef value of 1.
	impossibleCube = await loadModel("./models/cubeFrame.gltf", true, 1);
	// Make some manipulations to what we just loaded.
	impossibleCube.children[0].material.stencilWrite = false;
	scene.add(impossibleCube);
	impossibleCube.scale.set(2,2,2);

	// Wait for all faces of the cube to render, before moving on the next part of the program.
	await Promise.all([loadFrontFace()]);
	
  // Start the render loop after everything has loaded.
	render();
};

function render() {
	renderer.render(scene, camera);
	animateFrontFace();

	requestAnimationFrame(render);
};

async function loadModel(path, needStencil, refNum) {
	const loader = new GLTFLoader();
	const data = await loader.loadAsync(path);
    const object = data.scene.children[0];
	if (needStencil) {
			if (object.children[0].children.length !== 0) {
				object.children[0].children[0].material.stencilWrite = true;
				object.children[0].children[0].material.stencilRef = refNum;
				object.children[0].children[0].material.stencilFunc = THREE.EqualStencilFunc;

				object.children[2].children[0].material.stencilWrite = true;
				object.children[2].children[2].material.stencilRef = refNum;
				object.children[2].children[2].material.stencilFunc = THREE.EqualStencilFunc;
			}
			else {
				object.children[0].material.stencilWrite = true;
				object.children[0].material.stencilRef = refNum;
				object.children[0].material.stencilFunc = THREE.EqualStencilFunc;
			}		
		return object;
		
		}
	else {
		return object;
	}
};

async function loadFrontFace() {
	block = await loadModel("models/triangle.gltf", true, 2);
	scene.add(block);
	frontFaceObjects.push(block);

}

function animateFrontFace() {
	let x = 0;
	for (let item = 0; item < frontFaceObjects.length; item++) {
		frontFaceObjects[item].rotateX(0.01+x), frontFaceObjects[item].rotateY(-0.01+x);
		x = x + 0.001;
	}
};

setup();
