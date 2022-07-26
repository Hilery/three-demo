<template>
  <div id="app">
	  <div class="column">
		  <gltf-viewer url="./models/touzi/scene.gltf"></gltf-viewer>
	  </div>		
  </div>
</template>

<script>
import GltfViewer from './components/GltfViewer';

export default {
	name: 'app',
	components: {
		GltfViewer,
	}
}
</script>

<style>
.column {
	width: 100%;
	height: 100vh;
}
</style>
