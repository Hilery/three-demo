<template>
  <div>
    <canvas id="webgl" ref="webgl" canvas-id="canvasId" />
  </div>
</template>

<script>
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import * as dat from 'dat.gui'
export default {
  data() {
    return {
      gui: null,
      camera: null,
      scene: null,
      renderer: null,
      controls: null,
      sphere: null,
      sphereShadow: null,
      clock: null,
      count: 0,
      particlesGeometry: null
    }
  },
  mounted() {
    this.init()
  },
  methods: {
    init() {
      // 初始化debug 工具
      const gui = new dat.GUI()
      this.gui = gui
      // 雾

      // 初始化场景
      // 获取canvas
      const canvas = this.$refs.webgl
      const scene = new THREE.Scene()
      this.scene = scene

      const textureLoader = new THREE.TextureLoader()
      const normalTexture = textureLoader.load('/static/textures/particles/4.png')

      const particlesGeometry = new THREE.BufferGeometry()
      this.particlesGeometry = particlesGeometry
      const count = 20000
      this.count = count
      const position = new Float32Array(count * 3)
      const colors = new Float32Array(count * 3)

      for (let i = 0; i < count * 3; i++) {
        position[i] = (Math.random() - 0.5) * 10
        colors[i] = Math.random()
      }

      particlesGeometry.setAttribute('position', new THREE.BufferAttribute(position, 3))

      particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

      const particlesMaterial = new THREE.PointsMaterial()
      particlesMaterial.size = 0.1
      // particlesMaterial.color = new THREE.Color('#ff88cc')
      particlesMaterial.sizeAttenuation = true
      particlesMaterial.transparent = true
      // particlesMaterial.alphaText = 0.001
      // 贴图透明  但是不会被其他透明物体遮挡
      // particlesMaterial.depthTest = false
      // 贴图透明 会被其他透明物体遮挡
      particlesMaterial.depthWrite = false
      // 遮挡后 颜色叠加
      particlesMaterial.blending = THREE.AdditiveBlending
      particlesMaterial.alphaMap = normalTexture
      // 设置颜色
      particlesMaterial.vertexColors = true

      const particles = new THREE.Points(particlesGeometry, particlesMaterial)
      scene.add(particles)

      // const cube = new THREE.Mesh(
      //   new THREE.BoxBufferGeometry(),
      //   new THREE.MeshBasicMaterial()
      // )
      // scene.add(cube)

      // 初始化大小
      const sizes = {
        width: window.innerWidth,
        height: window.innerHeight
      }
      // 监听屏幕大小
      window.addEventListener('resize', () => {
        sizes.width = window.innerWidth
        sizes.height = window.innerHeight
        camera.aspect = sizes.width / sizes.height
        camera.updateProjectionMatrix()
        renderer.setSize(sizes.width, sizes.height)
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      })
      // 初始化相机
      const camera = new THREE.PerspectiveCamera(
        75,
        sizes.width / sizes.height,
        0.1,
        1000
      )
      camera.position.x = 4
      camera.position.y = 2
      camera.position.z = 5
      scene.add(camera)
      this.camera = camera
      // 初始化渲染器
      const renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: true
      })
      renderer.setSize(sizes.width, sizes.height)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      // renderer.shadowMap.enabled = true
      // renderer.shadowMap.type = THREE.PCFSoftShadowMap
      // renderer.setClearColor('#262837')
      this.renderer = renderer
      // 创建控制器
      const controls = new OrbitControls(camera, canvas)
      controls.enableDamping = true

      this.controls = controls
      this.clock = new THREE.Clock()
      this.animate()
    },
    animate() {
      this.controls.update()
      // Update the sphere
      const elapsedTime = this.clock.getElapsedTime()

      for (let i = 0; i < this.count; i++) {
        const y = i * 3 + 1
        const x = this.particlesGeometry.attributes.position.array[i * 3]
        this.particlesGeometry.attributes.position.array[y] = Math.sin(elapsedTime + x)
      }
      this.particlesGeometry.attributes.position.needsUpdate = true
      // this.particles.rotation.y = elapsedTime * 0.2
      this.renderer.render(this.scene, this.camera)
      requestAnimationFrame(this.animate)
    }
  }
}
</script>

<style>
</style>
