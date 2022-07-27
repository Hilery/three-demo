<template>
  <div id="app">
    <div class="left">
      <el-menu
        default-active="2"
        class="el-menu-vertical-demo"
        @select="handleSelect"
      >
        <el-menu-item index="1">
          <i class="el-icon-location"></i>
          <span slot="title">导航一</span>
        </el-menu-item>
        <el-menu-item index="2">
          <i class="el-icon-menu"></i>
          <span slot="title">导航二</span>
        </el-menu-item>
        <el-menu-item index="3">
          <i class="el-icon-document"></i>
          <span slot="title">导航三</span>
        </el-menu-item>
        <el-menu-item index="4">
          <i class="el-icon-setting"></i>
          <span slot="title">导航四</span>
        </el-menu-item>
      </el-menu>
    </div>
    <div class="right">
      <div class="column">
        <gltf-viewer :url="gltfUrl"></gltf-viewer>
      </div>
    </div>
  </div>
</template>

<script>
import GltfViewer from "./components/GltfViewer";

export default {
  name: "app",
  components: {
    GltfViewer,
  },
  data() {
    return {
      gltfUrl: "./models/touzi/scene.gltf",
    };
  },
  methods: {
    handleSelect(e) {
      switch (parseInt(e)) {
        case 1:
          this.gltfUrl = "./models/chinese_house/scene.gltf";
          console.log(e);
          break;
        case 2:
          this.gltfUrl = "./models/monster_energy_drink/scene.gltf";
          console.log(e);
          break;
        case 3:
          this.gltfUrl = "./models/chuizi/scene.gltf";
          console.log(e);
          break;
        case 4:
          this.gltfUrl = "./models/touzi/scene.gltf";
          console.log(e);
          break;
      }
    },
  },
};
</script>

<style lang="less">
#app {
  display: flex;
  .left {
    flex: 1;
  }
  .right {
    flex: 9;
  }
}
.column {
  width: 100%;
  height: 100vh;
}
</style>
