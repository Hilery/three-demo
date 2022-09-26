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
      object1: null,
      object2: null,
      object3: null,
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
      sphere: null

    }
  },
  mounted() {
    this.init()
  },
  methods: {
    init() {
      console.log(CANNON)
      // 初始化debug 工具
      const gui = new dat.GUI()
      this.gui = gui

      this.raycaster = new THREE.Raycaster()
      // 初始化场景
      // 获取canvas
      const canvas = this.$refs.webgl
      const scene = new THREE.Scene()
      this.scene = scene

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
      // 物理效果
      const world = new CANNON.World()
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

      const sphere = new THREE.Mesh(
        new THREE.SphereBufferGeometry(0.5, 64, 64),
        new THREE.MeshStandardMaterial({
          metalness: 0.3,
          roughness: 0.4,
          envMap: enviromentMapTexture
        })
      )
      sphere.castShadow = true
      sphere.position.y = 0.5
      this.sphere = sphere
      scene.add(sphere)

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
      // renderer.shadowMap.type = THREE.PCFSoftShadowMap
      // renderer.setClearColor('#262837')
      this.renderer = renderer
      // 创建控制器
      const controls = new OrbitControls(camera, canvas)
      controls.enableDamping = true

      this.controls = controls
      this.clock = new THREE.Clock()

      this.animate()
    },
    animate() {
      // this.controls.update()
      // Update the sphere
      const elapsedTime = this.clock.getElapsedTime()
      const deltaTime = elapsedTime - this.previousTime
      this.previousTime = elapsedTime

      this.world.step(1 / 60, deltaTime, 3)
      this.sphere.position.copy(this.sphereBody.position)
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

.webgl
{
    position: fixed;
    top: 0;
    left: 200px;
    z-index: 1;
    outline: none;
}.section
{
    display: flex;
    align-items: center;
    height: 100vh;
    position: relative;
    font-family: 'Cabin', sans-serif;
    color: #ffeded;
    text-transform: uppercase;
    font-size: 7vmin;
    padding-left: 10%;
    padding-right: 10%;
}
.bg
{
    background: #1e1a20
}
section:nth-child(odd)
{
    justify-content: flex-end;
}
</style>
