<template>
  <div>
    <div class="bg">
      <canvas id="webgl" ref="webgl" class="webgl" canvas-id="canvasId" />
    </div>

  </div>
</template>

<script>
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import * as dat from 'dat.gui'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'

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
      const self = this
      // 初始化debug 工具
      const gui = new dat.GUI()
      this.gui = gui

      // 初始化场景
      // 获取canvas
      const canvas = this.$refs.webgl
      const scene = new THREE.Scene()
      // scene.background = new THREE.Color('#366fb9')
      this.scene = scene

      const renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: true
        // alpha: true // this helps to have a transparent background. by default alpha: 0
      })

      // envarimentmap
      const cubeTextureLoader = new THREE.CubeTextureLoader()
      const envMap = cubeTextureLoader.load([
        '/textures/environmentMaps/0/px.jpg',
        '/textures/environmentMaps/0/nx.jpg',
        '/textures/environmentMaps/0/py.jpg',
        '/textures/environmentMaps/0/ny.jpg',
        '/textures/environmentMaps/0/pz.jpg',
        '/textures/environmentMaps/0/nz.jpg'
      ])
      scene.background = envMap

      // const testSphere = new THREE.Mesh(
      //   new THREE.SphereBufferGeometry(1, 32, 32),
      //   new THREE.MeshStandardMaterial()
      // )
      // scene.add(testSphere)
      // 初始化大小
      const sizes = {
        width: window.innerWidth,
        height: window.innerHeight
      }
      this.size = sizes
      /**
      * gltf
      */

      const gltfLoader = new GLTFLoader()
      gltfLoader.load(
        '/model/hamburger.glb',
        (gltf) => {
          console.log(gltf)
          const root = gltf.scene
          root.scale.set(0.25, 0.25, 0.25)

          scene.add(root)
        }
      )

      // gltfLoader.load(
      //   '/model/FlightHelmet/glTF/FlightHelmet.gltf',
      //   (gltf) => {
      //     console.log(gltf)
      //     const root = gltf.scene
      //     root.position.set(0, -4, 0)
      //     root.rotation.y = Math.PI * 0.75
      //     root.scale.set(4, 4, 4)
      //     gui.add(root.rotation, 'y').min(-Math.PI).max(Math.PI).step(0.001).name('rotation')
      //     scene.add(root)
      //   }
      // )

      /**
      * Lights
      */

      const directionalLight = new THREE.DirectionalLight(0xffffff, 1)

      directionalLight.position.set(0.25, 3, -2.25)

      gui.add(directionalLight, 'intensity').min(0).max(10).step(0.001).name('intensity')
      gui.add(directionalLight.position, 'x').min(-5).max(5).step(0.001).name('x')
      gui.add(directionalLight.position, 'y').min(-5).max(5).step(0.001).name('y')
      gui.add(directionalLight.position, 'z').min(-5).max(5).step(0.001).name('z')
      scene.add(directionalLight)
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
      const camera = new THREE.PerspectiveCamera(75,
        sizes.width / sizes.height,
        0.1,
        1000
      )
      camera.position.set(4, 1, -4)
      this.camera = camera

      scene.add(camera)

      // 初始化渲染器

      renderer.setSize(sizes.width, sizes.height)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      renderer.shadowMap.enabled = true
      renderer.physicallyCorrectLights = true
      renderer.shadowMap.type = THREE.PCFSoftShadowMap
      renderer.outputEncoding = THREE.sRGBEncoding
      // renderer.setClearColor('#262837')
      this.renderer = renderer
      // 创建控制器
      const controls = new OrbitControls(camera, canvas)
      controls.enableDamping = true

      this.controls = controls
      this.animate()
    },

    animate() {
      this.controls.update()
      // Update the sphere
      this.renderer.render(this.scene, this.camera)
      requestAnimationFrame(this.animate)
    }
  }
}
</script>

<style lang="less" scoped>
  *
{
    margin: 0;
    padding: 0;
}

</style>
