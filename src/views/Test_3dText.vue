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
      // 初始化纹理加载器
      const textureLoader = new THREE.TextureLoader()
      const mapcapTexture = textureLoader.load('/static/matcaps/3.png')
      // 初始化字体
      const fontLoader = new FontLoader()
      fontLoader.load('/static/fonts/helvetiker_regular.typeface.json', (font) => {
        const material = new THREE.MeshMatcapMaterial({ matcap: mapcapTexture })
        const donutGeometry = new THREE.TorusGeometry(0.3, 0.2, 32, 64)
        const textGeometry = new TextGeometry('threejs,hello world!', {
          font: font,
          size: 0.5,
          height: 0.2,
          curveSegments: 12,
          bevelEnabled: true,
          bevelThickness: 0.03,
          bevelSize: 0.02,
          bevelOffset: 0,
          bevelSegments: 5
        })
        textGeometry.center()

        // const textMaterial = new THREE.MeshBasicMaterial()
        // textMaterial.wireframe = true
        const text = new THREE.Mesh(textGeometry, material)
        scene.add(text)
        // Donuts
        console.time('donuts')
        for (let i = 0; i < 300; i++) {
          const donut = new THREE.Mesh(donutGeometry, material)

          donut.position.x = (Math.random() - 0.5) * 10
          donut.position.y = (Math.random() - 0.5) * 10
          donut.position.z = (Math.random() - 0.5) * 10

          donut.rotation.x = Math.random() * Math.PI
          donut.rotation.y = Math.random() * Math.PI

          const scale = Math.random()
          donut.scale.set(scale, scale, scale)

          scene.add(donut)
        }
        console.timeEnd('donuts')
      })

      // 初始化坐标辅助器
      const axesHelper = new THREE.AxesHelper()
      scene.add(axesHelper)
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
