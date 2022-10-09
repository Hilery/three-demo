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
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'
export default {
  data() {
    return {
      gui: null,
      camera: null,
      scene: null,
      renderer: null,
      controls: null,
      clock: null,
      floor: null,
      floorGeometry: null,
      floorMaterial: null,
      mixer: null
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
      this.scene = scene

      const textureLoader = new THREE.TextureLoader()
      const cubeTextureLoader = new THREE.CubeTextureLoader()

      const dracoLoader = new DRACOLoader()
      dracoLoader.setDecoderPath('/draco/')

      const gltfloader = new GLTFLoader()
      gltfloader.setDRACOLoader(dracoLoader)
      gltfloader.load(
        // '/static/model/Duck/glTF/Duck.gltf',
        // '/static/model/Duck/glTF-Embedded/Duck.gltf',
        // '/static/model/FlightHelmet/glTF/FlightHelmet.gltf',
        '/static/model/Fox/glTF/Fox.gltf',
        (gltf) => {
          console.log('加载成功', gltf)
          // while (gltf.scene.children.length) {
          //   scene.add(gltf.scene.children[0])
          // }
          // const children = [...gltf.scene.children]
          // for (const object of children) {
          //   scene.add(object)
          // }
          self.mixer = new THREE.AnimationMixer(gltf.scene)
          const action = self.mixer.clipAction(gltf.animations[2])
          action.play()
          gltf.scene.scale.set(0.025, 0.025, 0.025)
          scene.add(gltf.scene)
        },
        (xhr) => {
          console.log((xhr.loaded / xhr.total * 100) + '% loaded')
        },
        () => {
          console.log('加载失败')
        }
      )
      // 初始化大小
      const sizes = {
        width: window.innerWidth,
        height: window.innerHeight
      }
      this.size = sizes

      /**
 * Lights
 */
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.8)

      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6)
      directionalLight.castShadow = true
      directionalLight.shadow.mapSize.set(1024, 1024)
      directionalLight.shadow.camera.far = 15
      directionalLight.shadow.camera.left = -7
      directionalLight.shadow.camera.top = 7
      directionalLight.shadow.camera.right = 7
      directionalLight.shadow.camera.bottom = -7
      directionalLight.position.set(5, 5, 5)

      scene.add(ambientLight, directionalLight)
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
        100
      )
      camera.position.set(2, 2, 2)

      this.camera = camera

      scene.add(camera)

      // 初始化渲染器
      const renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: true
        // alpha: true // this helps to have a transparent background. by default alpha: 0
      })
      renderer.setSize(sizes.width, sizes.height)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      renderer.shadowMap.enabled = true
      renderer.shadowMap.type = THREE.PCFSoftShadowMap
      // renderer.setClearColor('#262837')
      this.renderer = renderer
      // 创建控制器
      const controls = new OrbitControls(camera, canvas)
      controls.enableDamping = true

      this.controls = controls
      this.clock = new THREE.Clock()
      this.addFloor()
      this.animate()
    },
    removeFloor() {
      if (this.floor !== null) {
        this.floorGeometry.dispose()
        this.floorMaterial.dispose()
        this.scene.remove(this.floor)
      }
    },
    addFloor() {
      // Remove floor if it does already exist before adding it to the scene
      this.removeFloor()

      const floorGeometry = new THREE.PlaneGeometry(10, 10)

      const floorMaterial = new THREE.MeshStandardMaterial({
        color: '#444444',
        metalness: 0,
        roughness: 0.5,
        transparent: true
      })

      const floor = new THREE.Mesh(floorGeometry, floorMaterial)
      floor.receiveShadow = true
      floor.rotation.x = -Math.PI * 0.5
      this.floor = floor
      this.floorGeometry = floorGeometry
      this.floorMaterial = floorMaterial
      this.scene.add(floor)
    },
    animate() {
      // this.controls.update()
      // Update the sphere
      const elapsedTime = this.clock.getElapsedTime()
      const deltaTime = elapsedTime - this.previousTime
      this.previousTime = elapsedTime
      if (this.mixer) {
        this.mixer.update(deltaTime)
      }
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
