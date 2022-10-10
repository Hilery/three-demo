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
import { BasisTextureLoader } from 'three/examples/jsm/loaders/BasisTextureLoader.js'
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
      mixer: null,
      treesTexture: null
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
      const renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: true
        // alpha: true // this helps to have a transparent background. by default alpha: 0
      })
      const textureLoader = new THREE.TextureLoader()
      const decalDiffuse = textureLoader.load(
        '/textures/decal/decal-diffuse.png'
      )
      decalDiffuse.needsUpdate = true
      console.log(decalDiffuse, 'decalDiffuse')
      const basisLoader = new BasisTextureLoader()
      basisLoader.setTranscoderPath('/basis/')
      basisLoader.detectSupport(renderer)
      // basisLoader.load('/static/imgs/port/state0_base.basis', function(texture) {
      //   // const material = new THREE.MeshStandardMaterial({ map: texture })
      //   console.log(texture)
      // }, function() {
      //   console.log('onProgress')
      // }, function(e) {
      //   console.error(e)
      // })
      const groundTexture = basisLoader.load('/static/imgs/port/state0_base.basis')
      groundTexture.flipY = false
      groundTexture.encoding = THREE.sRGBEncoding
      const buildingsTexture = basisLoader.load('/static/imgs/port/state0_env_buildings.basis')
      buildingsTexture.flipY = false
      buildingsTexture.encoding = THREE.sRGBEncoding
      const treesTexture = basisLoader.load('/static/imgs/port/state0_trees_etc.basis')
      treesTexture.flipY = false
      treesTexture.encoding = THREE.sRGBEncoding
      const housesTexture = basisLoader.load('/static/imgs/port/state0_retail_houses.basis')
      housesTexture.flipY = false
      housesTexture.encoding = THREE.sRGBEncoding
      const state1texture = basisLoader.load('/static/imgs/port/state1.basis')
      state1texture.flipY = false
      state1texture.encoding = THREE.sRGBEncoding
      const state2texture = basisLoader.load('/static/imgs/port/state2.basis')
      state2texture.flipY = false
      state2texture.encoding = THREE.sRGBEncoding
      const state3texture = basisLoader.load('/static/imgs/port/state3.basis')
      state3texture.flipY = false
      state3texture.encoding = THREE.sRGBEncoding
      const state4texture = basisLoader.load('/static/imgs/port/state4.basis')
      state4texture.flipY = false
      state4texture.encoding = THREE.sRGBEncoding

      const dracoLoader = new DRACOLoader()
      dracoLoader.setDecoderPath('/draco/')

      const gltfloader = new GLTFLoader()
      const group = new THREE.Group()

      // gltfloader.setDRACOLoader(dracoLoader)
      gltfloader.load(
        // '/static/model/Duck/glTF/Duck.gltf',
        // '/static/model/Duck/glTF-Embedded/Duck.gltf',
        // '/static/model/FlightHelmet/glTF/FlightHelmet.gltf',
        '/static/model/port/state0_opti.glb',
        (gltf) => {
          console.log('加载成功', gltf.scene)

          // while (gltf.scene.children.length) {
          //   scene.add(gltf.scene.children[0])
          // }
          const group = new THREE.Group()
          // const final_bake_check = gltf.scene.children[0]
          // group.position = final_bake_check.position
          // group.rotation = final_bake_check.rotation
          group.rotation.copy(gltf.scene.children[0].rotation)
          const childrens = gltf.scene.children[0].children
          for (const object of childrens) {
            const geometry = object.geometry
            const material = new THREE.MeshBasicMaterial({
            })
            if (object.name == 'state0_base1') {
              material.map = groundTexture
            }
            if (object.name == 'state0_env_buildings') {
              material.map = buildingsTexture
            } else if (object.name == 'state0_trees_etcext1') {
              material.map = buildingsTexture
            } else if (object.name == 'state0_retail_houses1') {
              material.map = housesTexture
            }
            const mesh = new THREE.Mesh(geometry, material)
            mesh.position.copy(object.position)
            mesh.rotation.copy(object.rotation)
            mesh.scale.copy(object.scale)
            group.add(mesh)
            console.log(object)
          }
          console.log(gltf.scene)

          console.log(group)
          scene.add(group)
        },
        (xhr) => {
          console.log((xhr.loaded / xhr.total * 100) + '% loaded')
        },
        () => {
          console.log('加载失败')
        }
      )
      gltfloader.load(
        '/static/model/port/state1_opti.glb',
        (gltf) => {
          console.log('加载成功1', gltf.scene)
          const group = new THREE.Group()
          group.rotation.copy(gltf.scene.children[0].rotation)
          const childrens = gltf.scene.children[0].children
          for (const object of childrens) {
            const geometry = object.geometry
            const material = new THREE.MeshBasicMaterial({
              map: state1texture
            })
            const mesh = new THREE.Mesh(geometry, material)
            mesh.position.copy(object.position)
            mesh.rotation.copy(object.rotation)
            mesh.scale.copy(object.scale)
            group.add(mesh)
          }
          scene.add(group)
        },
        (xhr) => {
          console.log((xhr.loaded / xhr.total * 100) + '% loaded')
        },
        () => {
          console.log('加载失败')
        }
      )
      gltfloader.load(
        '/static/model/port/state2.glb',
        (gltf) => {
          console.log('加载成功2', gltf.scene)
          const group = new THREE.Group()
          group.rotation.copy(gltf.scene.children[0].rotation)
          const childrens = gltf.scene.children[0].children
          for (const object of childrens) {
            const geometry = object.geometry
            const material = new THREE.MeshBasicMaterial({
              map: state2texture
            })
            const mesh = new THREE.Mesh(geometry, material)
            mesh.position.copy(object.position)
            mesh.rotation.copy(object.rotation)
            mesh.scale.copy(object.scale)
            group.add(mesh)
          }
          scene.add(group)
        },
        (xhr) => {
          console.log((xhr.loaded / xhr.total * 100) + '% loaded')
        },
        () => {
          console.log('加载失败')
        }
      )
      gltfloader.load(
        '/static/model/port/state3.glb',
        (gltf) => {
          console.log('加载成功', gltf.scene)
          const group = new THREE.Group()
          group.rotation.copy(gltf.scene.children[0].rotation)
          const childrens = gltf.scene.children[0].children
          for (const object of childrens) {
            const geometry = object.geometry
            const material = new THREE.MeshBasicMaterial({
              map: state3texture
            })
            const mesh = new THREE.Mesh(geometry, material)
            mesh.position.copy(object.position)
            mesh.rotation.copy(object.rotation)
            mesh.scale.copy(object.scale)
            group.add(mesh)
          }
          scene.add(group)
        },
        (xhr) => {
          console.log((xhr.loaded / xhr.total * 100) + '% loaded')
        },
        () => {
          console.log('加载失败')
        }
      )
      gltfloader.load(
        '/static/model/port/state4_opti.glb',
        (gltf) => {
          console.log('加载成功1', gltf.scene)
          const group = new THREE.Group()
          group.rotation.copy(gltf.scene.rotation)
          const childrens = gltf.scene.children
          for (const object of childrens) {
            if (object.name == 'state4logo') {
              const geometry = object.geometry
              const material = new THREE.MeshBasicMaterial({
                color: '#4247e1'
              })
              const mesh = new THREE.Mesh(geometry, material)
              mesh.position.copy(object.position)
              mesh.rotation.copy(object.rotation)
              mesh.scale.copy(object.scale)
              group.add(mesh)
            } else if (object.name == 'state4') {
              const geometry = object.geometry
              const material = new THREE.MeshBasicMaterial({
                map: state4texture
              })
              const mesh = new THREE.Mesh(geometry, material)
              mesh.position.copy(object.position)
              mesh.rotation.copy(object.rotation)
              mesh.scale.copy(object.scale)
              group.add(mesh)
            }
          }
          scene.add(group)
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
      const ambientLight = new THREE.AmbientLight(0xffffff, 1)

      const directionalLight = new THREE.DirectionalLight(0xffffff, 1)

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
      const camera = new THREE.PerspectiveCamera(55,
        sizes.width / sizes.height,
        0.1,
        1000
      )
      camera.position.set(1, 0.5, 1)

      this.camera = camera

      scene.add(camera)

      // 初始化渲染器

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
        color: '#366fb9',
        opacity: 0.7,
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
