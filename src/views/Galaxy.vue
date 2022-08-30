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
      },
      clock: ''
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
    this.clock = new THREE.Clock()
    this.init()
    this.generateGalaxy()
    this.addGui()
    this.animate()
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
      this.control = control
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
      const outsideColor = new THREE.Color(this.parameters.outsideColor)

      for (let i = 0; i < this.parameters.count; i++) {
        const i3 = i * 3
        const radius = Math.random() * this.parameters.radius
        const branchAngle = ((i % this.parameters.branches) / this.parameters.branches) * 2 * Math.PI
        const randomX =
      Math.pow(Math.random(), this.parameters.randomnessPower) *
      (Math.random() < 0.5 ? 1 : -1) *
      this.parameters.randomness *
      radius
        const randomY =
      Math.pow(Math.random(), this.parameters.randomnessPower) *
      (Math.random() < 0.5 ? 1 : -1) *
      this.parameters.randomness *
      radius
        const randomZ =
      Math.pow(Math.random(), this.parameters.randomnessPower) *
      (Math.random() < 0.5 ? 1 : -1) *
      this.parameters.randomness *
      radius
        positions[i3] = Math.cos(branchAngle) * radius
        positions[i3 + 1] = 0
        positions[i3 + 2] = Math.sin(branchAngle) * radius

        randomness[i3] = randomX
        randomness[i3 + 1] = randomY
        randomness[i3 + 2] = randomZ
        const mixedColor = insideColor.clone()
        mixedColor.lerp(outsideColor, radius / this.parameters.radius)

        colors[i3] = mixedColor.r
        colors[i3 + 1] = mixedColor.g
        colors[i3 + 2] = mixedColor.b

        // Scale
        scales[i] = Math.random()
      }
      this.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
      this.geometry.setAttribute('aRandomness', new THREE.BufferAttribute(randomness, 3))
      this.geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
      this.geometry.setAttribute('aScale', new THREE.BufferAttribute(scales, 1))

      this.material = new THREE.ShaderMaterial({
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexColors: true,
        uniforms: {
          uTime: { value: 0 },
          uSize: { value: 30 * this.renderer.getPixelRatio() }
        },
        vertexShader: galaxyVertexShader,
        fragmentShader: galaxyFragmentShader
      })
      this.points = new THREE.Points(this.geometry, this.material)
      this.scene.add(this.points)
    },
    animate() {
      const elapsedTime = this.clock.getElapsedTime()
      this.material.uniforms.uTime.value = elapsedTime
      this.control.update()
      window.requestAnimationFrame(this.animate)
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
