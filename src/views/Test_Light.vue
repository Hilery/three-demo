<template>
  <div>
    <canvas id="webgl" ref="webgl" canvas-id="canvasId" />
  </div>
</template>

<script>
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import * as dat from 'dat.gui'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry'
export default {
  data() {
    return {
      gui: null,
      camera: null,
      scene: null,
      renderer: null,
      controls: null
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
      // 初始化场景
      // 获取canvas
      const canvas = this.$refs.webgl
      const scene = new THREE.Scene()
      this.scene = scene
      // 创建 材质
      const material = new THREE.MeshStandardMaterial()
      material.roughness = 0.4
      // 创建对象
      const sqhere = new THREE.Mesh(new THREE.SphereGeometry(0.5, 32, 32), material)
      sqhere.position.x = -1.5
      scene.add(sqhere)

      const cube = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.75, 0.75), material)
      const torus = new THREE.Mesh(
        new THREE.TorusGeometry(0.3, 0.2, 32, 64),
        material
      )
      torus.position.x = 1.5

      const plane = new THREE.Mesh(new THREE.PlaneGeometry(5, 5), material)
      plane.rotation.x = -Math.PI * 0.5
      plane.position.y = -0.65

      scene.add(sqhere, cube, torus, plane)

      // 添加灯光
      // 环境光
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
      scene.add(ambientLight)
      // 太阳光
      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5)
      directionalLight.position.set(1, 0.25, 0)
      scene.add(directionalLight)

      // 渐变色光
      const hemisphereLight = new THREE.HemisphereLight(0xff0000, 0x0000ff, 0.3)
      scene.add(hemisphereLight)

      // 点光源
      const pointLight = new THREE.PointLight(0xff9000, 0.5, 0.5, 1)
      pointLight.position.set(1, -0.5, 1)
      scene.add(pointLight)

      const rectAreaLight = new THREE.RectAreaLight(0x4e00ff, 2, 1, 1)
      rectAreaLight.position.set(-1.5, 0, 1.5)
      rectAreaLight.lookAt(new THREE.Vector3())
      scene.add(rectAreaLight)

      const spotLight = new THREE.SpotLight(0x78ff00, 0.5, 10, Math.PI * 0.1, 0.25, 1)
      spotLight.position.set(0, 2, 3)
      scene.add(spotLight)
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
      const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 1000)
      camera.position.x = 1
      camera.position.y = 1
      camera.position.z = 3
      scene.add(camera)
      this.camera = camera
      // 初始化渲染器
      const renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: true
      })
      renderer.setSize(sizes.width, sizes.height)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      this.renderer = renderer
      // 创建控制器
      const controls = new OrbitControls(camera, canvas)
      controls.enableDamping = true
      this.controls = controls

      gui
        .add(ambientLight, 'intensity')
        .min(0)
        .max(1)
        .step(0.01)
        .name('Ambient Light')
      gui
        .add(directionalLight, 'intensity')
        .min(0)
        .max(1)
        .step(0.01)
        .name('Directional Light')
      gui
        .add(hemisphereLight, 'intensity')
        .min(0)
        .max(1)
        .step(0.01)
        .name('Hemisphere Light')

      this.animate()
    },
    animate() {
      this.controls.update()
      this.renderer.render(this.scene, this.camera)
      requestAnimationFrame(this.animate)
    }
  }
}
</script>

<style>

</style>
