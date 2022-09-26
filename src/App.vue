<template>
  <div id="app">
    <div class="left">
      <el-menu
        default-active="8"
        class="el-menu-vertical-demo"
        @open="handleOpen"
        @close="handleClose"
        @select="handleSelect"
      >
        <el-menu-item index="1">
          <i class="el-icon-location" />
          <span>沙滩小岛</span>
        </el-menu-item>
        <el-menu-item index="2">
          <i class="el-icon-menu" />
          <span slot="title">3D城市</span>
        </el-menu-item>
        <el-menu-item index="3">
          <i class="el-icon-document" />
          <span slot="title">迷你东京</span>
        </el-menu-item>
        <el-menu-item index="4">
          <i class="el-icon-setting" />
          <span slot="title">鼠标选取</span>
        </el-menu-item>
        <el-menu-item index="5">
          <i class="el-icon-setting" />
          <span slot="title">喷射</span>
        </el-menu-item>
        <el-menu-item index="6">
          <i class="el-icon-setting" />
          <span slot="title">星系</span>
        </el-menu-item>
        <el-menu-item index="7">
          <i class="el-icon-setting" />
          <span slot="title">鬼屋</span>
        </el-menu-item>
        <el-menu-item index="8">
          <i class="el-icon-setting" />
          <span slot="title">3D字体</span>
        </el-menu-item>
      </el-menu>
    </div>
    <div class="right">
      <router-view />
    </div>
  </div>
</template>

<script>
export default {
  methods: {
    handleOpen(key, keyPath) {
      console.log(key, keyPath)
    },
    handleClose(key, keyPath) {
      console.log(key, keyPath)
    },
    handleSelect(key, keyPath) {
      const [index] = key

      console.log(this.$router)
      switch (index) {
        case '1':
          this.$router.push('/home')
          break
        case '2':
          this.$router.push('/about')
          break
        case '3':
          this.$router.push('/tokyo')
          break
        case '4':
          this.$router.push('/raycaster')
          break
        case '5':
          this.$router.push('/decals')
          break
        case '6':
          this.$router.push('/galaxy')
          break
        case '7':
          this.$router.push('/haunted')
          break
        case '8':
          this.$router.push('/test')
          break
      }
    }
  }
}
</script>
<style lang="less">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  display: flex;
  width: 100vw;
  height: 100vh;
}
.left {
  width: 200px;
  flex-shrink: 0;
  border-right: 1px solid #ccc;
}
.right {
  flex: 1;
}
* {
  margin: 0;
  padding: 0;
}
</style>
