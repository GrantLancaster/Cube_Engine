# Cube_Engine

This repo has two folder in it:
  1. ImpossibleCube
  2. Cube_Engine

### Impossible Cube
Impossible cube is the project that I built using this "engine". It is powered by Three.js and WebGL. This is the full production build that I submitted for the University of Colorado Boulder Atlas Institute EXPO
https://www.colorado.edu/atlas/ 

### Cube Engine
The cube engine is a generalized version of what was used to build Impossible Cube. It has been stripped of the 'Impossible Cube' specific code, and commented to explain how it works. It's setup so that other people can make something using the stencil buffer, with some of the headache taken out. If you run this project, it will show a simple version of the cube, with the front face being a simple example of how the stencil buffer works

### Stencil Buffer
The stencil buffer is a powerful layer in the graphics pipeline. In simple terms, it allows one to add ID's to individual pixels, and selectively render things to the scene using the specified stencil function. There are many stencil functions, but here are a few as examples:
- AlwaysEqual
- GreaterThan
- LessThan
These are referencing the stencil ID's (reference numbers) that are assigned to the pixels. In the AlwaysEqual function, the reference number have to equal each other in order for those pixels to be rendered to the scene. The other inequalities functions follow the same logic (one ID greater than the other ID, one ID less than the other ID).

### How run the development environment
These projects are powered by Vite and node.js.
Start by running:
```
npm install
```
To install all the dependencies.

##### Development Environment
to access the development environment, run:
```
npx vite
```
and navigate to the localhost port that has opened. 
To close the development Environment, press ctrl + c in the terminal

##### Building for Production
To finalize the build and compile the javascript, run:
```
npx vite build
```
This will produce a dist folder which will be where the compiled version of the project will live. The Index.html will be what you want to navigate to in order to view the project.

### Three.js
https://threejs.org/ 