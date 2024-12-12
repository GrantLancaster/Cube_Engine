import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

/*----- Camera, Scene, Renderer Setup -----*/
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(70, window.innerWidth/window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
const bottomButton = document.querySelector(".bottom");
const leftButton = document.querySelector(".left");
const topButton = document.querySelector(".top");

const vector = new THREE.Vector3();
let cameraPos;


camera.position.z = 10;
/*-----------------------------------------*/

/*------------ Materials Setup ------------*/
function createMat(isForObject, referenceNum, pColor, objColor ) {
	if (!isForObject) {
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
const floorMat = new THREE.MeshPhongMaterial({color: "lightpink"});
const wallMat = new THREE.MeshNormalMaterial();
/*-----------------------------------------*/



/*------------- Light Setup ---------------*/
const color = 0xFFFFFF;
const intensity = 3;
const light = new THREE.DirectionalLight(color, intensity);
/*-----------------------------------------*/



/*----------- Geometries Setup ------------*/
const planeWidth = 6;
const planeHeight = 6;
const Plane = new THREE.PlaneGeometry(planeWidth, planeHeight);
// const floorPlane = new THREE.PlaneGeometry(100, 100);
// const wallPlane = new THREE.PlaneGeometry(100,100);
wallMat.stencilWrite = true;
wallMat.stencilRef = 7;
wallMat.stencilFunc = THREE.AlwaysStencilFunc;
wallMat.stencilZPass = THREE.ReplaceStencilOp;

/*-----------------------------------------*/


/*------ Mesh Initialization Setup --------*/
// const floor = new THREE.Mesh(floorPlane, wallMat);
// const wall = new THREE.Mesh(wallPlane, wallMat);
// const wallL = new THREE.Mesh(wallPlane, wallMat);
// const wallR = new THREE.Mesh(wallPlane, wallMat);
// const wallBack = new THREE.Mesh(wallPlane, wallMat);
// const roof = new THREE.Mesh(floorPlane, wallMat);

const backPlane = new THREE.Mesh(Plane, createMat(false, 5, "white", "white"));
const frontPlane = new THREE.Mesh(Plane, createMat(false, 2, "white", "white"));
const leftPlane = new THREE.Mesh(Plane, createMat(false, 3, "white", "white"));
const rightPlane = new THREE.Mesh(Plane, createMat(false, 4, "white", "white"));
const topPlane = new THREE.Mesh(Plane, createMat(false, 6, "white", "white"));
const bottomPlane = new THREE.Mesh(Plane, createMat(false, 7, "white", "white"));


const rings = [];
const blocks = [];
const triangles = [];
const hexagons = [];
const diamonds = [];
const bars = [[], [], []]; // Horizontal, Vertical, Front-back
const cubesBig = [];
const triangleBig = [];
const diamondsBig = [];
const mindBenderBig = [];
let dir = 0.001;
const storage = [];
const skybox = ["models/SkyBoxCubeSmall.gltf","models/SkyBoxBeach.gltf", "models/SkyBoxForest.gltf", "models/SkyBoxOcean.gltf", "models/SkyBoxSpaceCity.gltf", "models/SkyBoxCityFixed.gltf", "models/SkyBoxVillage.gltf"];
	/*---------Second Cube face contents-----*/
const balls = [];

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
bottomButton.addEventListener("click", ()=> {checkCameraPosition()});
leftButton.addEventListener("click", () =>{
	if (impossibleCube.children[0].material.stencilWrite == true) {
		impossibleCube.children[0].material.stencilWrite = false;
	} else if (impossibleCube.children[0].material.stencilWrite == false) {
		impossibleCube.children[0].material.stencilWrite = true;
	}
})
topButton.addEventListener("click", ()=>{
	location.reload();
})

/*-----------------------------------------*/
function setup() {
    scene.add(frontPlane);
	scene.add(leftPlane);
	scene.add(rightPlane);
	scene.add(backPlane);
	scene.add(topPlane);
	scene.add(bottomPlane);

	// scene.add(wall);
	// scene.add(wallL);
	// scene.add(wallR);
	// scene.add(wallBack);
	// scene.add(floor);
	// scene.add(roof);

    frontPlane.position.set(0,0,3);
	backPlane.position.set(0, 0, -3), backPlane.rotation.set(0, Math.PI, 0);
	leftPlane.position.set(-3, 0, 0), leftPlane.rotation.set(0, -Math.PI/2, 0);
	rightPlane.position.set(3, 0, 0), rightPlane.rotation.set(0, Math.PI/2, 0);
	topPlane.position.set(0, 3, 0), topPlane.rotation.set(-Math.PI/2, 0, 0);
	bottomPlane.position.set(0, -3, 0), bottomPlane.rotation.set(Math.PI/2, 0, 0);

	// wallL.position.set(-25, 0, 0), wallL.rotation.set(0, Math.PI/2, 0);
	// wallR.position.set(25, 0, 0), wallR.rotation.set(0, -Math.PI/2, 0);
	// wall.position.set(0, 0, -25);
	// floor.position.set(0, -25, 0), floor.rotation.set(-Math.PI/2, 0, 0);
	// roof.position.set(0, 25, 0), roof.rotation.set(Math.PI/2, 0, 0);
	// wallBack.position.set(0, 0, 25), wallBack.rotation.set(Math.PI, 0, 0);

	camera.add(light);
	scene.add(camera);
	//light.position.set(10, 0, 4);
    
    build();
};

async function build() {
	impossibleCube = await loadModel("./models/cubeFrame.gltf", true, 1);
	await Promise.all([
		loadFrontFace(), 
		loadLeftFace(), 
		loadRightFace(),
		loadBackFace(),
		loadTopFace(),
		loadBottomFace()
		
	]);
	
	impossibleCube.children[0].material.stencilWrite = false;
	scene.add(impossibleCube);
	impossibleCube.scale.set(2,2,2);

    build2();

};
async function build2() {
	await Promise.all([
		buildSecondCube(),
		loadRightFaceBig(),
		loadFrontFaceBig(),
		loadLeftFaceBig(),
		loadBackFaceBig(),
		loadTopFaceBig(),
		loadBottomFaceBig()

	]);
	await loadSkyBox()
	render();
}
function render() {
	renderer.render(scene, camera);
	animateFrontFace();
	animateBackFace();
	animateLeftFace();
	animateRightFace();
	animateTopFace();
	animateBottomFace();
	animateRightFaceBig();
	animateFrontFaceBig();
	animateLeftFaceBig();
	animateBackFaceBig();
	animateTopFaceBig();
	animateBottomFaceBig();

	expandPlane(whichPlane, toggleString);
	cameraWrap();
	requestAnimationFrame(render);
};

function cameraWrap() {
	if (camera.position.distanceTo(impossibleCube.position)>1250){
		camera.position.z = 1
	}else if (camera.position.distanceTo(impossibleCube.position)<0.1) {
		camera.position.z=1245
	}
}

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

function autoRotate(showCube) {
	if (showCube) {
		return
	} else if (!showCube) {
		scene.remove(impossibleCube);
	}
};

function checkCameraPosition() {
	cameraPos = camera.getWorldDirection(vector);
	console.log(cameraPos);
	
	if (cameraPos.z > (-1-dif) && cameraPos.z < (-1+dif)) {
		whichPlane = frontPlane;
		toggleString = "front";
		sizing = true;
	}else if (cameraPos.z > (1-dif) && cameraPos.z < (1+dif)) {
		whichPlane = backPlane;
		toggleString = "back";			
		sizing = true;
	}else if (cameraPos.x > (-1-dif) && cameraPos.x < (-1+dif)) {
		whichPlane = rightPlane;
		toggleString = "right";
		sizing = true;
	}else if (cameraPos.x > (1-dif) && cameraPos.x < (1+dif)) {
		whichPlane = leftPlane;
		toggleString = "left";
		sizing = true;
	}else if (cameraPos.y > (-1-dif) && cameraPos.y < (-1+dif)) {
		whichPlane = topPlane;
		toggleString = "top";
		sizing = true;
	}else if (cameraPos.y > (1-dif) && cameraPos.y < (1+dif)) {
		whichPlane = bottomPlane;
		toggleString = "bottom";
		sizing = true;
	}
};
function expandPlane(Plane, toggleString) {
	if(Plane == "none") {return};
	cameraPos = camera.getWorldDirection(vector);
	if (sizing == true) {
		if (Plane.scale.x < 4 && Plane.scale.y < 4) {
			Plane.scale.x +=0.01;
			Plane.scale.y +=0.01;
			console.log(Plane.scale.x);
			console.log("conditional flag");
			console.log(Plane);
		} else {sizing = false}
	}else if (toggleString == "front") {
		if (cameraPos.z < (-1-buffDist) || cameraPos.z > (-1+buffDist)) {
			if(Plane.scale.x > 1+0.05 && Plane.scale.y > 1+0.05) {
			Plane.scale.x -= 0.05;
			Plane.scale.y -= 0.05;
			}
		}
	}else if (toggleString == "back") {
		if (cameraPos.z < (1-buffDist) || cameraPos.z > (1+buffDist)) {
			if(Plane.scale.x > 1+0.05 && Plane.scale.y > 1+0.05) {
			Plane.scale.x -= 0.05;
			Plane.scale.y -= 0.05;
			}
		}
	}else if (toggleString == "right") {
		if (cameraPos.x < (-1-buffDist) || cameraPos.x > (-1+buffDist)) {
			if(Plane.scale.x > 1+0.05 && Plane.scale.y > 1+0.05) {
			Plane.scale.x -= 0.05;
			Plane.scale.y -= 0.05;
			}
		}
	}else if (toggleString == "left") {
		if (cameraPos.x < (1-buffDist) || cameraPos.x > (1+buffDist)) {
			if(Plane.scale.x > 1+0.05 && Plane.scale.y > 1+0.05) {
			Plane.scale.x -= 0.05;
			Plane.scale.y -= 0.05;
			}
		}
	}else if (toggleString == "top") {
		if (cameraPos.y < (-1-buffDist) || cameraPos.y > (-1+buffDist)) {
			if(Plane.scale.x > 1+0.05 && Plane.scale.y > 1+0.05) {
			Plane.scale.x -= 0.05;
			Plane.scale.y -= 0.05;
			}
		}
	}else if (toggleString == "bottom") {
		if (cameraPos.y < (1-buffDist) || cameraPos.y > (1+buffDist)) {
			if(Plane.scale.x > 1+0.05 && Plane.scale.y > 1+0.05) {
			Plane.scale.x -= 0.05;
			Plane.scale.y -= 0.05;
			}
		}
	}
};

async function loadSkyBox() {
	for (let i = 0; i < skybox.length; i++ ) {
		let env
		if (i == 0) {
			env = await loadModel(skybox[i], true, 0);
			env.scale.set(20,20,20)
		} else {
			env = await loadModel(skybox[i], true, i+1);
			env.scale.set(18,18,18);
		}
		scene.add(env);

		if (i==4 || i==5) {
			env.rotateY(Math.PI/2);
			env.rotateZ(Math.PI/4);
		}
	}
}

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

async function buildSecondPlanes() {
	const frontPlane = new THREE.Mesh(Plane, createMat(false, 8, "white", "white"));
	const rightPlane = new THREE.Mesh(Plane, createMat(false, 9, "white", "white"));
	const leftPlane = new THREE.Mesh(Plane, createMat(false, 10, "white", "white"));
	const backPlane = new THREE.Mesh(Plane, createMat(false, 11, "white", "white"));
	const topPlane = new THREE.Mesh(Plane, createMat(false, 12, "white", "white"));
	const bottomPlane = new THREE.Mesh(Plane, createMat(false, 13, "white", "white"));

	scene.add(frontPlane);
	scene.add(rightPlane);
	scene.add(leftPlane);
	scene.add(backPlane);
	scene.add(topPlane);
	scene.add(bottomPlane);

	frontPlane.position.set(0,0,2.90*15), frontPlane.scale.set(15,15,1);
	backPlane.position.set(0, 0, -2.90*15), backPlane.rotation.set(0, Math.PI, 0), backPlane.scale.set(15,15,1);
	leftPlane.position.set(-2.90*15, 0, 0), leftPlane.rotation.set(0, -Math.PI/2, 0), leftPlane.scale.set(15,15,1);
	rightPlane.position.set(2.90*15, 0, 0), rightPlane.rotation.set(0, Math.PI/2, 0), rightPlane.scale.set(15,15,1);
	topPlane.position.set(0, 2.90*15, 0), topPlane.rotation.set(-Math.PI/2, 0, 0), topPlane.scale.set(15,15,1);
	bottomPlane.position.set(0, -2.90*15, 0), bottomPlane.rotation.set(Math.PI/2, 0, 0), bottomPlane.scale.set(15,15,1);

}

async function buildSecondCube() {
	const cube = await loadModel("models/cubeFrame.gltf", false, 0)
	await buildSecondPlanes();
		scene.add(cube)
		cube.scale.set(30,30,30);
}

async function loadFrontFaceBig() {
	for (let i=0; i<10; i++) {
		for (let j=0; j<6; j++) {
			const hallPiece = await loadModel("models/cubeFrame.gltf", true, 8);
			hallPiece.scale.set(10/i,10/i,10/i);
			if (j==0) {
				hallPiece.position.set(-40*(i/2),0,0);
			}else if (j==1) {
				hallPiece.position.set(0,0,40*(i/2));
			}else if (j==2) {
				hallPiece.position.set(40*(i/2),0,0);
			}else if (j==3) {
				hallPiece.position.set(0,40*(i/2),0);
			}else if (j==4) {
				hallPiece.position.set(0,-40*(i/2),0);
			}else if (j==5) {
				hallPiece.position.set(0,0,-40*(i/2));
			}
			cubesBig.push(hallPiece);
			scene.add(hallPiece);
		}
	}
}
function animateFrontFaceBig() {
	for (let c=0; c<cubesBig.length; c++) {
		if (c%2==0) {
			cubesBig[c].rotation.x -=0.005;
			cubesBig[c].rotation.y +=0.005;
		} else {
			cubesBig[c].rotation.x +=0.005;
			cubesBig[c].rotation.y -=0.005;
		}
	}
}

async function loadLeftFaceBig() {
	const planetBig = await loadModel("models/lilPineTreePlanet.gltf", true, 10);
	planetBig.children[1].children[0].material.stencilWrite = true;
	planetBig.children[1].children[0].material.stencilRef = 10;
	planetBig.children[1].children[0].material.stencilFunc = THREE.EqualStencilFunc;

	planetBig.children[1].children[1].material.stencilWrite = true;
	planetBig.children[1].children[1].material.stencilRef = 10;
	planetBig.children[1].children[1].material.stencilFunc = THREE.EqualStencilFunc;

	planetBig.scale.set(20,20,20);
	//planetBig.rotation.y = Math.PI/2;
	for (let i=1; i<4; i++) {
		const triangle = await loadModel("models/triangle.gltf", true, 10);
		triangle.scale.set(20*(i/2),20*(i/2),20*(i/2));
		triangle.rotation.y = Math.PI/2;
		triangleBig.push(triangle);
		scene.add(triangle);
	}
	scene.add(planetBig);
}
function animateLeftFaceBig() {
	for (let t=0; t<triangleBig.length; t++) {
		if (t==0) {
			triangleBig[t].rotateX(-0.002);
		}else if (t==1) {
			triangleBig[t].rotateY(0.001);
			triangleBig[t].rotateX(0.001);
		}
		else {
			triangleBig[t].rotateX(0.001);
		}
	}
}

async function loadRightFaceBig() {
	for (let i=0; i < skybox.length; i++) {
	const settings = []
	const ball = await loadModel(skybox[i], true, 9);
	ball.scale.set(15,15,15);
	ball.position.set(Math.random()*20, Math.random()*20, Math.random()*20)
	const velx = Math.random()/2;
	const vely = Math.random()/2;
	const velz = Math.random()/2;
	settings.push(ball, velx, vely, velz);
	
	scene.add(ball);
	balls.push(settings);
	}
}
function animateRightFaceBig() {
	for (let b=0; b < balls.length; b++) {
		balls[b][0].position.x += balls[b][1];
		balls[b][0].position.y += balls[b][2];
		balls[b][0].position.z += balls[b][3];

		balls[b][0].rotation.x += 0.005;
		balls[b][0].rotation.y += 0.005;

		if ((balls[b][0].position.x > 2.90*25)||(balls[b][0].position.x < -2.90*25)){balls[b][1] = -balls[b][1]}
		if ((balls[b][0].position.y > 2.90*25)||(balls[b][0].position.y < -2.90*25)){balls[b][2] = -balls[b][2]}
		if ((balls[b][0].position.z > 2.90*25)||(balls[b][0].position.z < -2.90*25)){balls[b][3] = -balls[b][3]}
	}
}

async function loadBackFaceBig() {
	let offset = 10;
	for (let i=0; i<8; i++) {
		for (let j=0; j<8; j++) {
			if (j%2==0) {
				offset = 0 ;
			}else {
				offset = 10
			}
			const group = [];
			const diamond = await loadModel("models/diamond.gltf", true, 11);
			let vely = 0.3;
			diamond.scale.set(30,30,30);
			diamond.position.set(60-(i*20)+(offset),60-(j*20),i*j/3);
			group.push(diamond, vely);
			diamondsBig.push(group);
			scene.add(diamond);
		}
	}
}
function animateBackFaceBig() {
	for (let i=0; i<diamondsBig.length; i++) {
			diamondsBig[i][0].position.z += diamondsBig[i][1];
		if (diamondsBig[i][0].position.z >20 || diamondsBig[i][0].position.z < -20) {
			diamondsBig[i][1] = -diamondsBig[i][1];
		}
	}
	
}

async function loadTopFaceBig() {
	const thing = await loadModel("models/MindBender.gltf", true, 12);
	thing.children[2].material.stencilWrite = true;
	thing.children[2].material.stencilRef = 12;
	thing.children[2].material.stencilFunc = THREE.EqualStencilFunc;
	thing.children[3].material.stencilWrite = true;
	thing.children[3].material.stencilRef = 12;
	thing.children[3].material.stencilFunc = THREE.EqualStencilFunc;

	thing.scale.set(40,40,40);
	thing.rotateX(Math.PI/2);
	mindBenderBig.push(thing);
	scene.add(thing);
}
function animateTopFaceBig() {
	mindBenderBig[0].children[0].rotation.z += 0.01;
	mindBenderBig[0].children[1].rotation.z += 0.01;
	mindBenderBig[0].children[0].rotation.y += 0.01;
	mindBenderBig[0].children[1].rotation.y += 0.01;
	mindBenderBig[0].children[3].rotation.x +=0.01;
	if (mindBenderBig[0].children[3].scale.x < 40 || mindBenderBig[0].children[3].scale.x>45){
		dir = -dir
	}
		mindBenderBig[0].children[3].scale.x +=dir;
		mindBenderBig[0].children[3].scale.y +=dir;
		mindBenderBig[0].children[3].scale.z +=dir;
}

async function loadBottomFaceBig() {
	const bg = await loadModel("models/SkyBoxVillage.gltf", true, 13);
	bg.scale.set(75,75,75);
	storage.push(bg);
	scene.add(bg);

}
function animateBottomFaceBig() {
	storage[0].rotation.x += 0.001;
	storage[0].rotation.y += 0.001;
}
setup();
