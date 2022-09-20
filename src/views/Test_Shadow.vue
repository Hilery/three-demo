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
      controls: null,
      sphere: null,
      sphereShadow: null,
      clock: null
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
      const textureLoader = new THREE.TextureLoader()
      const simpleShadow = textureLoader.load('/static/textures/simpleShadow.jpg')
      console.log(simpleShadow)
      // 创建 材质
      const material = new THREE.MeshStandardMaterial()
      material.roughness = 0.7
      // 创建对象
      const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.5, 32, 32), material)
      this.sphere = sphere
      scene.add(sphere)
      sphere.castShadow = true

      const plane = new THREE.Mesh(new THREE.PlaneGeometry(5, 5), material)
      plane.rotation.x = -Math.PI * 0.5
      plane.position.y = -0.65
      plane.receiveShadow = true
      scene.add(plane)

      // 添加灯光
      // 环境光
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.3)
      scene.add(ambientLight)
      // 太阳光
      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.3)
      directionalLight.position.set(2, 2, -1)
      scene.add(directionalLight)

      // directionalLight.castShadow = true
      directionalLight.shadow.mapSize.width = 1024
      directionalLight.shadow.mapSize.height = 1024

      directionalLight.shadow.camera.top = 2
      directionalLight.shadow.camera.right = 2
      directionalLight.shadow.camera.bottom = -2
      directionalLight.shadow.camera.left = -2

      directionalLight.shadow.camera.near = 1
      directionalLight.shadow.camera.far = 6
      const directionalLightCameraHelper = new THREE.CameraHelper(
        directionalLight.shadow.camera
      )
      directionalLightCameraHelper.visible = false
      scene.add(directionalLightCameraHelper)

      const sphereShadow = new THREE.Mesh(
        new THREE.PlaneGeometry(1.5, 1.5),
        new THREE.MeshBasicMaterial({
          color: 0x000000,
          transparent: true,
          alphaMap: simpleShadow
        })
      )
      sphereShadow.rotation.x = -Math.PI * 0.5
      sphereShadow.position.y = plane.position.y + 0.01
      this.sphereShadow = sphereShadow
      scene.add(sphereShadow)
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
      renderer.shadowMap.enabled = true
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
      this.sphere.position.x = Math.cos(elapsedTime) * 1.2
      this.sphere.position.z = Math.sin(elapsedTime) * 1.2
      this.sphere.position.y = Math.abs(Math.sin(elapsedTime * 3))

      this.sphereShadow.position.x = this.sphere.position.x
      this.sphereShadow.position.z = this.sphere.position.z
      this.sphereShadow.material.opacity = (1 - this.sphere.position.y)

      this.renderer.render(this.scene, this.camera)
      requestAnimationFrame(this.animate)
    }
  }
}
</script>

<style>

</style>
