<template>
  <div>
    <div id="webgl" ref="webgl" class="webgl" canvas-id="canvasId" />

  </div>
</template>

<script>
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
// 解压库 dracoloader
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'
// 引入室内环境
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment'
export default {
  data() {
    return {
      gui: null,
      camera: null,
      scene: null,
      renderer: null,
      controls: null,
      debuggerObj: {},
      mixer: null,
      previousTime: 0,
      clock: new THREE.Clock(),
      model: null,
      frontTexture: null,
      frontSTexture: null
    }
  },
  mounted() {
    this.init()
  },
  methods: {
    init() {
      this.initThree()
      this.initMap()
      this.initCamera()
      this.initScene()
      this.initLight()
      this.initObject()
      this.initControls()
      this.render()
    },
    initMap() {
      const loader = new THREE.TextureLoader()
      const frontTexture = loader.load('/model/oil/3d66Model-725752-files-6.jpg')

      const frontSTexture = loader.load('/model/oil/3d66Model-725752-files-2.jpg')

      frontTexture.wrapS = THREE.RepeatWrapping
      frontTexture.wrapT = THREE.RepeatWrapping
      frontTexture.encoding = THREE.sRGBEncoding
      frontTexture.flipY = false

      frontSTexture.wrapS = THREE.RepeatWrapping
      frontSTexture.wrapT = THREE.RepeatWrapping
      frontSTexture.encoding = THREE.sRGBEncoding
      frontSTexture.flipY = false

      this.frontTexture = frontTexture
      this.frontSTexture = frontSTexture

      this.loader = loader
    },
    initThree() {
      const width = document.documentElement.clientWidth
      const height = document.documentElement.clientHeight
      this.renderer = new THREE.WebGLRenderer({
        antialias: true
      })

      this.renderer.setSize(width, height)
      this.renderer.shadowMap.enabled = true
      this.$refs.webgl.appendChild(this.renderer.domElement)
    },
    initCamera() {
      this.camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 1000)
      this.camera.position.set(0, 5, 10)
    },
    initScene() {
      const pmremGenerator = new THREE.PMREMGenerator(this.renderer)
      this.scene = new THREE.Scene()
      this.scene.background = new THREE.Color(0xbfe3dd)
      this.scene.environment = pmremGenerator.fromScene(
        new RoomEnvironment(),
        0.04
      ).texture
    },
    initLight() {
      const light = new THREE.DirectionalLight(0xffffff, 0.5)
      light.position.set(10, 10, 0)
      this.scene.add(light)

      // 创建环境光
      const ambient = new THREE.AmbientLight(0xffffff, 0.5)
      this.scene.add(ambient)
    },
    initObject() {
      const glbloader = new GLTFLoader()
      // 实例化解压库
      const dracoLoader = new DRACOLoader()
      // 设置解压库js路径
      dracoLoader.setDecoderPath('/draco/')
      // 设置解压库为gltf载入库的解压库
      glbloader.setDRACOLoader(dracoLoader)
      glbloader.load('/model/oil/test.gltf', (gltf) => {
        console.log(gltf)

        gltf.scene.traverse((child) => {
          if (child.isObject3D && child.isMesh) {
            if (child.name === 'Obj3d66-725752-19-546' || child.name === 'Obj3d66-725752-13-367') {
              console.log(child)
              const texture = this.loader.load('/model/oil/3d66Model-725752-files-3.jpg')
              texture.flipY = false
              texture.encoding = THREE.sRGBEncoding
              const material = new THREE.MeshStandardMaterial({
                map: texture,
                roughness: 0.5,
                metalness: 0.5
                // specularMap: this.frontSTexture
              })
              child.material = material
            }
          }
          if (child.name === 'Obj3d66-725752-25-709' || child.name === 'Obj3d66-725752-5-201') {
            console.log(child)
            const material = new THREE.MeshStandardMaterial({

              map: this.frontTexture

              // specularMap: this.frontSTexture
            })
            child.material = material
            child.material.needsUpdate = true
            child.material.map = this.frontTexture
            child.material.map.wrapS = THREE.RepeatWrapping
            child.material.map.wrapT = THREE.RepeatWrapping
          }
        })

        this.scene.add(gltf.scene)
        this.camera.lookAt(gltf.scene.position)
      })
    },
    initControls() {
      this.controls = new OrbitControls(this.camera, this.renderer.domElement)
    },
    render() {
      requestAnimationFrame(this.render)
      const elapsedTime = this.clock.getElapsedTime()
      const delta = elapsedTime - this.previousTime
      this.previousTime = elapsedTime

      this.controls.update()
      this.renderer.render(this.scene, this.camera)
    },

    updateAllMeterial() {

    },
    animate() {

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
