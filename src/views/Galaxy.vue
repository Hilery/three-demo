<template>
  <div id="galaxy">
    <canvas ref="galaxy" />
  </div>
</template>

<script>
// 引入 three.js
import * as THREE from 'three'
// 引入控制器
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
// 引入gui
import * as dat from 'dat.gui'
import galaxyVertexShader from '../glsl/vertex.js'
import galaxyFragmentShader from '../glsl/fragment.js'

export default {
  data() {
    return {
      gui: null,
      scene: null,
      camera: null,
      renderer: null,
      geometry: null,
      material: null,
      points: null,
      dom: null,
      parameters: {
        count: 200000,
        size: 0.005,
        radius: 5,
        branches: 3,
        spin: 1,
        randomness: 0.2,
        randomnessPower: 3,
        insideColor: '#ff6030',
        outsideColor: '#1b3984'
      },
      size: {
        width: '',
        height: ''
      }
    }
  },
  mounted() {
    this.dom = this.$refs.galaxy
    this.size.width = this.dom.offsetWidth
    this.size.height = this.dom.offsetHeight
    // 添加resize 事件
    window.addEventListener('resize', () => {
      this.size.width = this.dom.offsetWidth
      this.size.height = this.dom.offsetHeight
      this.camera.aspect = this.size.width / this.size.height
      this.camera.updateProjectionMatrix()

      this.renderer.setSize(this.size.width, this.size.height)
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    })
    this.init()
    this.generateGalaxy()
    this.animate()
    this.addGui()
  },
  methods: {
    // 初始化
    init() {
      // 初始化相机
      this.camera = new THREE.PerspectiveCamera(
        75,
        this.size.width / this.size.height,
        0.1,
        1000
      )
      this.camera.position.set(3, 3, 3)
      this.scene = new THREE.Scene()
      this.scene.add(this.camera)
      // 初始化渲染器
      this.renderer = new THREE.WebGLRenderer({
        canvas: this.dom,
        antialias: true
      })
      this.renderer.setSize(this.size.width, this.size.height)
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

      // 初始化控制器
      const control = new OrbitControls(this.camera, this.renderer.domElement)
      control.enableDamping = true
    },
    generateGalaxy() {
      if (this.points !== null) {
        this.geometry.dispose()
        this.material.dispose()
        this.scene.remove(this.points)
      }
      this.geometry = new THREE.BufferGeometry()

      const positions = new Float32Array(this.parameters.count * 3)
      const randomness = new Float32Array(this.parameters.count * 3)
      const colors = new Float32Array(this.parameters.count * 3)
      const scales = new Float32Array(this.parameters.count * 1)
      const insideColor = new THREE.Color(this.parameters.insideColor)
    },
    animate() {
      requestAnimationFrame(this.animate)
      this.renderer.render(this.scene, this.camera)
    },
    addGui() {
      this.gui = new dat.GUI()
      this.gui
        .add(this.parameters, 'count')
        .name('粒子数量')
        .min(100)
        .max(1000000)
        .step(100)
        .onFinishChange(this.generateGalaxy)
      this.gui
        .add(this.parameters, 'radius')
        .name('半径')
        .min(0.01)
        .max(20)
        .step(0.01)
        .onFinishChange(this.generateGalaxy)
      this.gui
        .add(this.parameters, 'branches')
        .name('分支数')
        .min(2)
        .max(20)
        .step(1)
        .onFinishChange(this.generateGalaxy)
      this.gui
        .add(this.parameters, 'randomness')
        .name('随机性')
        .min(0)
        .max(2)
        .step(0.001)
        .onFinishChange(this.generateGalaxy)
      this.gui
        .add(this.parameters, 'randomnessPower')
        .name('随机性幂')
        .min(1)
        .max(10)
        .step(0.001)
        .onFinishChange(this.generateGalaxy)
      this.gui.addColor(this.parameters, 'insideColor').onFinishChange(this.generateGalaxy).name('内部颜色')
      this.gui.addColor(this.parameters, 'outsideColor').onFinishChange(this.generateGalaxy).name('外部颜色')
    }
  }
}
</script>

<style lang="less">
#galaxy {
  width: 100%;
  height: 100%;
  canvas {
    width: 100%;
    height: 100%;
  }
}
</style>
