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
import CANNON from 'cannon'
export default {
  data() {
    return {
      gui: null,
      camera: null,
      scene: null,
      renderer: null,
      controls: null,
      clock: null,
      objects: [],
      raycaster: null,
      mouse: null,
      size: null,
      currentIntersected: null,
      scrollY: 0,
      cursor: {},
      Group: null,
      previousTime: 0,
      sphereBody: null,
      world: null,
      sphere: null,
      enviromentMapTexture: null,
      defaultMaterial: null,
      sphereGeometry: null,
      boxGeometry: null,
      sphereMaterial: null,
      hitSound: null
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
      const params = {
        createSphere: () => {
          this.createSphere(Math.random() * 0.5, {
            x: (Math.random() - 0.5) * 3,
            y: 3,
            z: (Math.random() - 0.5) * 3
          })
        },
        createBox: () => {
          this.createBox(
            Math.random(),
            Math.random(),
            Math.random(),
            {
              x: (Math.random() - 0.5) * 3,
              y: 3,
              z: (Math.random() - 0.5) * 3
            })
        },
        reset: () => {
          console.log(self.objects)
          for (const object of self.objects) {
            // console.log(object.body)
            object.body.removeEventListener('collide', this.playHitSound)
            self.world.removeBody(object.body)
            self.scene.remove(object.mesh)
          }
        }
      }
      gui.add(params, 'createSphere')
      gui.add(params, 'createBox')
      gui.add(params, 'reset')
      this.raycaster = new THREE.Raycaster()
      // 初始化场景
      // 获取canvas
      const canvas = this.$refs.webgl
      const scene = new THREE.Scene()
      this.scene = scene
      this.hitSound = new Audio('/static/sounds/hit.mp3')
      const textureLoader = new THREE.TextureLoader()
      const cubeTextureLoader = new THREE.CubeTextureLoader()

      const enviromentMapTexture = cubeTextureLoader.load([
        '/static/textures/environmentMaps/0/px.jpg',
        '/static/textures/environmentMaps/0/nx.jpg',
        '/static/textures/environmentMaps/0/py.jpg',
        '/static/textures/environmentMaps/0/ny.jpg',
        '/static/textures/environmentMaps/0/pz.jpg',
        '/static/textures/environmentMaps/0/nz.jpg'
      ])
      this.enviromentMapTexture = enviromentMapTexture
      // 物理效果
      const world = new CANNON.World()
      world.broadphase = new CANNON.SAPBroadphase(world)
      world.allowSleep = true
      world.gravity.set(0, -9.82, 0)
      this.world = world
      const defaultMaterial = new CANNON.Material('default')
      const defaultContactMaterial = new CANNON.ContactMaterial(
        defaultMaterial,
        defaultMaterial,
        {
          friction: 0.1,
          restitution: 0.7
        }
      )
      this.defaultMaterial = defaultMaterial
      world.addContactMaterial(defaultContactMaterial)
      world.defaultContactMaterial = defaultContactMaterial

      const sphereShape = new CANNON.Sphere(0.5, 64, 64)
      const sphereBody = new CANNON.Body({
        mass: 1,
        position: new CANNON.Vec3(0, 3, 0),
        shape: sphereShape
      })
      this.sphereBody = sphereBody
      world.addBody(sphereBody)

      const sphereGeometry = new THREE.SphereBufferGeometry(0.5, 64, 64)
      const boxGeometry = new THREE.BoxBufferGeometry(1, 1, 1)
      const sphereMaterial = new THREE.MeshStandardMaterial({
        metalness: 0.3,
        roughness: 0.4,
        envMap: enviromentMapTexture
      })
      this.sphereGeometry = sphereGeometry
      this.boxGeometry = boxGeometry
      this.sphereMaterial = sphereMaterial
      const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial)
      sphere.castShadow = true
      sphere.position.y = 0.5
      this.sphere = sphere
      scene.add(sphere)
      this.objects.push({
        mesh: sphere,
        body: sphereBody
      })
      sphereBody.addEventListener('collide', this.playHitSound)
      const floorShape = new CANNON.Plane()
      const floorBody = new CANNON.Body({
        mass: 0,
        shape: floorShape
      })
      floorBody.quaternion.setFromAxisAngle(new CANNON.Vec3(-1, 0, 0), Math.PI * 0.5)
      world.addBody(floorBody)
      const floor = new THREE.Mesh(
        new THREE.PlaneGeometry(10, 10),
        new THREE.MeshStandardMaterial({
          color: '#777777',
          metalness: 0.3,
          roughness: 0.4,
          envMap: enviromentMapTexture
        })
      )
      floor.receiveShadow = true
      floor.rotation.x = -Math.PI * 0.5
      scene.add(floor)

      const ambientLight = new THREE.AmbientLight(0xffffff, 0.7)
      scene.add(ambientLight)

      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.2)
      directionalLight.castShadow = true
      directionalLight.shadow.mapSize.set(1024, 1024)
      directionalLight.shadow.camera.far = 15
      directionalLight.shadow.camera.left = -7
      directionalLight.shadow.camera.top = 7
      directionalLight.shadow.camera.right = 7
      directionalLight.shadow.camera.bottom = -7
      directionalLight.position.set(5, 5, 5)
      scene.add(directionalLight)
      // 初始化大小
      const sizes = {
        width: window.innerWidth,
        height: window.innerHeight
      }
      this.size = sizes

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
      camera.position.set(-3, 3, 3)

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

      this.animate()
    },
    createSphere(radius, position) {
      const mesh = new THREE.Mesh(
        this.sphereGeometry,
        this.sphereMaterial
      )
      mesh.scale.set(radius, radius, radius)
      mesh.castShadow = true
      mesh.position.copy(position)
      this.scene.add(mesh)

      const shape = new CANNON.Sphere(radius)
      const body = new CANNON.Body({
        mass: 1,
        position: new CANNON.Vec3(0, 3, 0),
        shape: shape,
        material: this.defaultMaterial
      })
      body.position.copy(position)
      this.world.addBody(body)
      body.addEventListener('collide', this.playHitSound)
      this.objects.push({
        mesh: mesh,
        body: body
      })
    },
    createBox(width, height, deep, position) {
      const mesh = new THREE.Mesh(
        this.boxGeometry,
        this.sphereMaterial
      )
      mesh.scale.set(width, height, deep)
      mesh.castShadow = true
      mesh.position.copy(position)
      this.scene.add(mesh)

      const shape = new CANNON.Box(new CANNON.Vec3(width * 0.5, height * 0.5, deep * 0.5))
      const body = new CANNON.Body({
        mass: 1,
        position: new CANNON.Vec3(0, 3, 0),
        shape: shape,
        material: this.defaultMaterial
      })
      body.position.copy(position)
      this.world.addBody(body)
      body.addEventListener('collide', this.playHitSound)
      this.objects.push({
        mesh: mesh,
        body: body
      })
    },
    playHitSound(collision) {
      const impactStrength = collision.contact.getImpactVelocityAlongNormal()
      if (impactStrength > 1.5) {
        console.log(collision.contact.getImpactVelocityAlongNormal())
        this.hitSound.currentTime = 0
        this.hitSound.play()
      }
    },
    animate() {
      // this.controls.update()
      // Update the sphere
      const elapsedTime = this.clock.getElapsedTime()
      const deltaTime = elapsedTime - this.previousTime
      this.previousTime = elapsedTime

      // this.sphereBody.applyLocalForce(new CANNON.Vec3(0.5, 0, 0), new CANNON.Vec3(0, 0, 0))

      this.world.step(1 / 60, deltaTime, 3)
      for (const object of this.objects) {
        object.mesh.position.copy(object.body.position)
        object.mesh.quaternion.copy(object.body.quaternion)
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
