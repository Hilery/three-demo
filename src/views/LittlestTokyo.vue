<template>
  <div id="tokyo" />
</template>

<script>
import * as THREE from 'three'
// 引入控制器
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
// 引入室内环境
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment'
// gltf模型加载器
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
// 解压缩
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'

export default {
  data() {
    return {
      mixer: '',
      controls: '',

      renderer: '',
      scene: '',
      camera: '',
      clock: ''
    }
  },
  mounted() {
    this.initThree()
  },
  methods: {
    animate() {
      requestAnimationFrame(this.animate)

      const delta = this.clock.getDelta()

      this.mixer.update(delta)

      this.controls.update()

      this.renderer.render(this.scene, this.camera)
    },
    initThree() {
      let mixer

      const clock = new THREE.Clock()
      this.clock = clock
      const container = document.getElementById('tokyo')

      const renderer = new THREE.WebGLRenderer({ antialias: true })
      renderer.setPixelRatio(window.devicePixelRatio)
      renderer.setSize(window.innerWidth, window.innerHeight)
      renderer.outputEncoding = THREE.sRGBEncoding
      container.appendChild(renderer.domElement)
      this.renderer = renderer
      const pmremGenerator = new THREE.PMREMGenerator(renderer)

      const scene = new THREE.Scene()
      scene.background = new THREE.Color(0xbfe3dd)
      scene.environment = pmremGenerator.fromScene(
        new RoomEnvironment(),
        0.04
      ).texture

      this.scene = scene
      const camera = new THREE.PerspectiveCamera(
        40,
        window.innerWidth / window.innerHeight,
        1,
        100
      )
      camera.position.set(5, 2, 8)
    
      this.camera = camera
      const controls = new OrbitControls(camera, renderer.domElement)
      controls.target.set(0, 0.5, 0)
      controls.update()
      controls.enablePan = false
      controls.enableDamping = true
      this.controls = controls
      const dracoLoader = new DRACOLoader()
      dracoLoader.setDecoderPath('/draco/gltf/')

      const loader = new GLTFLoader()
      loader.setDRACOLoader(dracoLoader)
      loader.load(
        '/model/LittlestTokyo.glb',
        (gltf) => {
          const model = gltf.scene
          model.position.set(1, 1, 0)
          model.scale.set(0.01, 0.01, 0.01)
          scene.add(model)

          mixer = new THREE.AnimationMixer(model)
          mixer.clipAction(gltf.animations[0]).play()
          this.mixer = mixer
          this.animate()
        },
        undefined,
        function(e) {
          console.error(e)
        }
      )

      window.onresize = function() {
        camera.aspect = window.innerWidth / window.innerHeight
        camera.updateProjectionMatrix()

        renderer.setSize(window.innerWidth, window.innerHeight)
      }
    }
  }
}
</script>

<style>
</style>
