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
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'
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
      treesTexture: null,
      cylinder: null,
      logoMesh: null,
      cloud3Mesh: null,
      cloud2Mesh: null,
      cloud1Mesh: null
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
      scene.background = new THREE.Color('#366fb9')
      this.scene = scene
      const fog = new THREE.Fog('#ffffff', 3.6, 4.1)
      scene.fog = fog

      const renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: true
        // alpha: true // this helps to have a transparent background. by default alpha: 0
      })
      // 创建动画
      // 加载普通纹理贴图
      const textureLoader = new THREE.TextureLoader()
      const marqueeTexture = textureLoader.load(
        '/static/imgs/port/marquee.png'
      )
      marqueeTexture.needsUpdate = true

      // 加载云朵纹理贴图
      const cloud1Texture = textureLoader.load(
        '/static/imgs/port/cloud1.jpg'
      )
      cloud1Texture.wrapS = cloud1Texture.wrapT = THREE.RepeatWrapping
      cloud1Texture.needsUpdate = true
      const cloud2Texture = textureLoader.load(
        '/static/imgs/port/cloud2.jpg'
      )
      cloud2Texture.wrapS = cloud2Texture.wrapT = THREE.RepeatWrapping
      cloud2Texture.needsUpdate = true
      const cloud3Texture = textureLoader.load(
        '/static/imgs/port/cloud3.jpg'
      )
      cloud3Texture.wrapS = cloud3Texture.wrapT = THREE.RepeatWrapping
      cloud3Texture.needsUpdate = true
      // 加载basis纹理贴图
      const basisLoader = new BasisTextureLoader()
      basisLoader.setTranscoderPath('/basis/')
      basisLoader.detectSupport(renderer)
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

      // '/home/textures/vehicles/basis/box_truck.basis',
      // '/home/textures/vehicles/basis/semifront.basis',
      // '/home/textures/vehicles/basis/semi_rear.basis',
      // '/home/textures/vehicles/basis/parcel_truck.basis',
      // '/home/textures/vehicles/basis/car.basis',
      // '/home/textures/vehicles/basis/sedan.basis',
      // '/home/textures/vehicles/basis/dock_grabber.basis',
      // '/home/textures/vehicles/basis/container.basis',
      const truckTexture = basisLoader.load('/static/imgs/port/box_truck.basis')
      truckTexture.encoding = THREE.sRGBEncoding

      const semiFrontTexture = basisLoader.load('/static/imgs/port/semifront.basis')
      semiFrontTexture.encoding = THREE.sRGBEncoding

      const semiRearTexture = basisLoader.load('/static/imgs/port/semi_rear.basis')
      semiRearTexture.encoding = THREE.sRGBEncoding

      const parcelTexture = basisLoader.load('/static/imgs/port/parcel_truck.basis')
      parcelTexture.encoding = THREE.sRGBEncoding

      const carTexture = basisLoader.load('/static/imgs/port/car.basis')
      carTexture.encoding = THREE.sRGBEncoding

      const sedanTexture = basisLoader.load('/static/imgs/port/sedan.basis')
      sedanTexture.encoding = THREE.sRGBEncoding

      const dockTexture = basisLoader.load('/static/imgs/port/dock_grabber.basis')
      dockTexture.encoding = THREE.sRGBEncoding

      const containerTexture = basisLoader.load('/static/imgs/port/container.basis')
      containerTexture.encoding = THREE.sRGBEncoding

      const dracoLoader = new DRACOLoader()
      dracoLoader.setDecoderPath('/draco/')

      const truckMaterial = new THREE.MeshBasicMaterial({ map: truckTexture })

      const semiFrontMaterial = new THREE.MeshBasicMaterial({ map: semiFrontTexture })

      const semiRearMaterial = new THREE.MeshBasicMaterial({ map: semiRearTexture })

      const parcelMaterial = new THREE.MeshBasicMaterial({ map: parcelTexture })

      const carMaterial = new THREE.MeshBasicMaterial({ map: carTexture })

      const sedanMaterial = new THREE.MeshBasicMaterial({ map: sedanTexture })

      const dockMaterial = new THREE.MeshBasicMaterial({ map: dockTexture })

      const containerMaterial = new THREE.MeshBasicMaterial({ map: containerTexture })

      const fbxLoader = new FBXLoader()
      const fbxGroup = new THREE.Group()
      fbxGroup.position.set(0, -0.00015, 0)
      fbxGroup.scale.set(1, 1, -1)
      fbxLoader.load(
        '/static/model/port/vehicles.fbx',
        (object) => {
          console.log('111', object)
          this.mixer = new THREE.AnimationMixer(object)
          this.mixer.clipAction(object.animations[0]).play()
          const childrens = object.children
          for (const child of childrens) {
            if (child.name.toLowerCase().includes('semi')) {
              if (child.name.toLowerCase().includes('rear')) {
                child.material = semiRearMaterial
              } else {
                child.material = semiFrontMaterial
              }
            } else if (child.name.toLowerCase().includes('truck')) {
              child.material = truckMaterial
            } else if (child.name.toLowerCase().includes('parcel')) {
              child.material = parcelMaterial
            } else if (child.name.toLowerCase().includes('car')) {
              child.material = carMaterial
            } else if (child.name.toLowerCase().includes('sedan')) {
              child.material = sedanMaterial
            } else if (child.name.toLowerCase().includes('dock')) {
              child.material = dockMaterial
            } else if (child.name.toLowerCase().includes('container')) {
              child.material = containerMaterial
            }
            fbxGroup.add(child)
          }
          console.log('222', fbxGroup)
          scene.add(fbxGroup)
        }

      )

      const gltfloader = new GLTFLoader()

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
              material.map = treesTexture
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
              this.logoMesh = mesh
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

      const vertextShader = `
        varying vec2 vUv;

        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `

      const fragmentShader = `
        uniform sampler2D uMarquee;
        uniform float uTime;
        uniform vec3 uBackground;

        varying vec2 vUv;
      
        void main() {
          gl_FragColor = texture2D(uMarquee,vUv);
        }
      `

      const uniforms = {
        uMarquee: { value: marqueeTexture },
        uTime: { value: 0 },
        uBackground: { value: new THREE.Color('#DDE2FA') }
      }
      const cylinderGroup = new THREE.Group()
      const cylinderGeometry = new THREE.CylinderGeometry(1, 1, 0.9, 32, 1, true)
      const cylinderMaterial = new THREE.ShaderMaterial({
        uniforms: uniforms,
        vertexShader: vertextShader,
        fragmentShader: fragmentShader,
        transparent: true,
        side: THREE.DoubleSide
      })
      const cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial)
      cylinder.scale.set(1, 1, -1)
      this.cylinder = cylinder
      cylinderGroup.add(cylinder)
      cylinderGroup.scale.set(0.028, 0.028, 0.028)
      cylinderGroup.position.set(-0.006, 0.154, -0.0515)
      scene.add(cylinderGroup)
      // 创建云朵
      const cloud1Group = new THREE.Group()
      cloud1Group.scale.set(3, 3, 3)
      cloud1Group.position.set(0, 0.22, 0)
      const cloud1Mesh = this.createCloud(cloud1Texture, 3)
      cloud1Group.add(cloud1Mesh)
      scene.add(cloud1Group)
      const cloud2Group = new THREE.Group()
      cloud2Group.scale.set(3, 3, 3)
      cloud2Group.position.set(0, 0.26, 0)
      const cloud2Mesh = this.createCloud(cloud2Texture, 2)
      cloud2Group.add(cloud2Mesh)
      scene.add(cloud2Group)
      const cloud3Group = new THREE.Group()
      cloud3Group.scale.set(3, 3, 3)
      cloud3Group.position.set(0, 0.3, 0)
      const cloud3Mesh = this.createCloud(cloud3Texture, 1)
      cloud3Group.add(cloud3Mesh)
      scene.add(cloud3Group)
      this.cloud3Mesh = cloud3Mesh
      this.cloud2Mesh = cloud2Mesh
      this.cloud1Mesh = cloud1Mesh
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
      camera.position.set(1, 1, 0)

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

      const floorGeometry = new THREE.PlaneBufferGeometry(1, 1, 1, 1)

      const floorMaterial = new THREE.MeshStandardMaterial({
        color: '#366fb9',
        opacity: 0.7,
        transparent: true
      })

      const floor = new THREE.Mesh(floorGeometry, floorMaterial)
      floor.receiveShadow = true
      floor.position.set(0.32, 0.015, -0.3)
      floor.rotation.set = (-Math.PI / 2, 0, 0)
      floor.scale.set(0.05, 0.1, 0.1)
      this.floor = floor
      this.floorGeometry = floorGeometry
      this.floorMaterial = floorMaterial
      this.scene.add(floor)
    },
    createCloud(map, speed = 1, visible = true) {
      const vertexShader = `
        varying vec2 vUv;

        void main() {
          vUv = uv;

          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `
      const fragmentShader = `
        uniform sampler2D uMap;
        uniform float uTime;

        varying vec2 vUv;

        void main() {
          vec4 map = texture2D(uMap, (vUv * 2.) + uTime * 0.01);
          float alpha = map.r * 2.;
          gl_FragColor = vec4(map.rgb * 2.,alpha);
        }
      `
      const uniforms = {
        uSpeed: { value: 0.01 * speed },
        uTime: { value: 0 },
        uMap: { value: map }
      }
      const cloudsGeometry = new THREE.PlaneBufferGeometry(1, 1, 1)
      const shaderMaterial = new THREE.ShaderMaterial({
        uniforms: uniforms,
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        transparent: true,
        depthWrite: false
      })
      const clouds = new THREE.Mesh(cloudsGeometry, shaderMaterial)
      clouds.rotation.set(-Math.PI / 2, 0, 0)
      return clouds
    },
    createWater() {

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
      // 跑马灯旋转动画
      if (this.cylinder) this.cylinder.rotation.y = elapsedTime
      // lgog 旋转动画
      if (this.logoMesh) this.logoMesh.rotation.y = elapsedTime
      // 给云朵添加动画
      if (this.cloud1Mesh) this.cloud1Mesh.material.uniforms.uTime.value = elapsedTime
      if (this.cloud2Mesh) this.cloud2Mesh.material.uniforms.uTime.value = elapsedTime
      if (this.cloud3Mesh) this.cloud3Mesh.material.uniforms.uTime.value = elapsedTime
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
