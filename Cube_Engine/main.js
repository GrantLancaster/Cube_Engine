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
const PlaneMesh = new THREE.Mesh(PlaneGeometry, createMat(true, 5, "white", "white"));
/*-----------------------------------------*/


let impossibleCube, block, planet;
let whichPlane = "none";
let toggleString;
let sizing = false;
const dif = 0.1;
const buffDist = 0.05
let direction = 1;
let factor = 1;
let currentArrow;

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

	// Scale it up to double the size on the x and y axis (axis relative to the plane):
	PlaneMesh.scale(2,2);
	// Move the plane 1 on the x-axis, 1 on the y-axis, a 3 on the z-axis (axis relative to the scene):
	PlaneMesh.position.set(1,1,3);
  

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
	await Promise.all([loadFrontFace(), loadLeftFace(), loadRightFace(), loadBackFace(), loadTopFace(), loadBottomFace()]);
	
  // Start the render loop after everything has loaded.
	render();
};

function render() {
	renderer.render(scene, camera);
	animateFrontFace();
	animateBackFace();
	animateLeftFace();
	animateRightFace();
	animateTopFace();
	animateBottomFace();

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
	block = await loadModel("models/filledCube.gltf", true, 2);
	scene.add(block);
	for (let j = 0; j < 3; j++) {
		if (j == 0) {
			for (let i = 0; i < 10; i++) {
				const lip = await loadModel("models/ring.gltf", true, 2);
				scene.add(lip);
				lip.scale.set(0+i, 0+i, 0+i);
				lip.rotation.z = Math.PI/2;
				lip.position.x = (-i/3)*i;
				rings.push(lip);
			}
		} else if (j == 1) {
			for (let i = 0; i < 10; i++) {
				const lip = await loadModel("models/ring.gltf", true, 2);
				scene.add(lip);
				lip.scale.set(0+i, 0+i, 0+i);
				lip.rotation.z = -Math.PI/2;
				lip.position.x = (i/3)*i;
				rings.push(lip);
			}
		} else {
			for (let i = 0; i < 10; i++) {
				const lip = await loadModel("models/ring.gltf", true, 2);
				scene.add(lip);
				lip.scale.set(2+i, 2+i, 2+i);
				lip.rotation.x = Math.PI/2;
				lip.position.z = (-i/3)*i;
				rings.push(lip);
			}
		}
	}
}

function animateFrontFace() {
	let x = 0;
	for (let item = 0; item < rings.length; item++) {
		rings[item].rotateX(0.01+x), rings[item].rotateY(-0.01+x);
		x = x + 0.001;
	}
};

async function loadBackFace() {
	for (let i = 0; i < 20; i++) {
		const frame = await loadModel("models/triangle.gltf", true, 5);
		frame.scale.set(6-i/4, 6-i/4, 1);
		frame.position.set(0, 0, -2.5);
		scene.add(frame);
		triangles.push(frame);
	}
};
function animateBackFace() {
	for (let i = 0; i < triangles.length; i++) {
		triangles[i].position.z += i /300 * direction;
		triangles[i].rotation.z += i/1000 * direction;
		if(triangles[triangles.length-1].position.z > 25) {
			direction = -4;
		} else if(triangles[triangles.length-1].position.z < -8.5) {
			direction = 1;
		}	
	}
};

async function loadLeftFace() {
	for (let i = 0; i < 5; i++) {
		for (let j = 0; j < 5; j++) {
			const block = await loadModel("models/filledCube.gltf", true, 3);
			block.position.set((i)-1.5, -1, -2 + j);
			blocks.push(block);
			scene.add(block);
		}
	}
};
function animateLeftFace() {
	let int = Math.floor(Math.random()*4);
	let factor = Math.floor(Math.random() *10) / 3;
	let index = Math.floor(Math.random() *25);
	if (int % 2 != 0) {
		blocks[index].position.y = int * (-1);
		blocks[index].scale.set(factor, factor, factor);
	} else {
		blocks[index].position.y = int;
	}	
};

async function loadRightFace() {
	for (let i = 0; i < 3; i++) {
		for (let j = 0; j < 4; j++) {
			const bar = await loadModel("models/test.gltf", true, 4);
			bars[i].push(bar);
			scene.add(bar);
		}
	}
};
function animateRightFace() {
	for (let i = 0; i < bars.length; i++) {
		for (let j = 0; j < bars[i].length; j++) {
			let factor
			let inverse = Math.floor(Math.random()*4);
			if (inverse % 2 == 0) {factor = -1}
			else {factor = 1}
			let randX = Math.floor(Math.random()*3*factor);
			let randY = Math.floor(Math.random()*3*factor);
			let randZ = Math.floor(Math.random()*3*factor);
			let randDist = Math.floor(Math.random()*15)+10;
			let speed = Math.floor(Math.random()*10)/20;
			bars[i][j].scale.set(1, 1, 10);
			if (i == 0) {
				if (bars[i][j].position.z >= randDist) {
					bars[i][j].position.set(randX, randY, -randDist);
				} else {
					bars[i][j].translateZ(speed);
				}
			}else if (i == 1) {
				bars[i][j].rotation.x = Math.PI/2;
				if (bars[i][j].position.y >= randDist) {
					bars[i][j].position.set(randX, -randDist, randZ);
				} else {
					bars[i][j].translateZ(-speed);
				}
			}else if (i == 2) {
				bars[i][j].rotation.y = Math.PI/2;
				if (bars[i][j].position.x <= -randDist) {
					bars[i][j].position.set(randDist, randY, randZ);
				} else {
					bars[i][j].translateZ(-speed);
				}
			}
		}
	}
};

async function loadTopFace() {
	const diamond = await loadModel("models/diamond.gltf", true, 6);
	for (let i = 0; i < 8; i++) {
		const hexagon = await loadModel("models/hexagon.gltf", true, 6);
		hexagon.scale.set(5, 5, 5);
		hexagons.push(hexagon);
		diamond.add(hexagon);
	}
	diamond.scale.set(2, 2, 2);
	diamonds.push(diamond);
	scene.add(diamond);
};
function animateTopFace() {
	const distance = Math.sin((diamonds[0].rotation.y*50)*Math.PI/180);
	diamonds[0].rotation.x += 0.01;
	diamonds[0].rotation.y -= 0.01;
	//console.log(distance);
	for (let i = 0; i < hexagons.length; i++) {
		if (i % 2 == 0) {factor = -1}
		else if (i % 2 !== 0) {factor = 1};
		hexagons[i].scale.set(2-(i*0.25), 2-(i*0.25), 2-(i*0.25));
		hexagons[i].position.set(0, 0, distance*i*2*factor);
		hexagons[i].rotation.set(-diamonds[0].rotation.x, 0, 0);
	}

};

async function loadBottomFace() {
	planet = await loadModel("models/lilPineTreePlanet.gltf", true, 7);
	planet.scale.set(2,2,2);

	planet.children[1].children[0].material.stencilWrite = true;
	planet.children[1].children[0].material.stencilRef = 7;
	planet.children[1].children[0].material.stencilFunc = THREE.EqualStencilFunc;

	planet.children[1].children[1].material.stencilWrite = true;
	planet.children[1].children[1].material.stencilRef = 7;
	planet.children[1].children[1].material.stencilFunc = THREE.EqualStencilFunc;

	scene.add(planet);
};
function animateBottomFace() {
	planet.rotation.x += 0.005;
	planet.rotation.z += 0.005;
	planet.rotation.y -= 0.005;
};

setup();
