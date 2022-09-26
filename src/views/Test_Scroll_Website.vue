<template>
  <div>
    <div class="bg">
      <canvas id="webgl" ref="webgl" class="webgl" canvas-id="canvasId" />
      <section class="section">
        <h1>My Portfolio</h1>
      </section>
      <section class="section">
        <h2>My projects</h2>
      </section>
      <section class="section">
        <h2>Contact me</h2>
      </section>
    </div>

  </div>
</template>

<script>
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import * as dat from 'dat.gui'
import gsap from 'gsap'
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
      previousTime: 0

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
      const parameters = {
        materialColor: '#ffeded'
      }
      this.raycaster = new THREE.Raycaster()
      // 初始化场景
      // 获取canvas
      const canvas = this.$refs.webgl
      const scene = new THREE.Scene()
      this.scene = scene
      /**
 * Lights
 */
      const directionalLight = new THREE.DirectionalLight('#ffffff', 1)
      directionalLight.position.set(1, 1, 0)
      scene.add(directionalLight)
      const textureLoader = new THREE.TextureLoader()
      const gradientTexture = textureLoader.load('/static/textures/gradients/3.jpg')
      gradientTexture.magFilter = THREE.NearestFilter

      const material = new THREE.MeshToonMaterial({
        color: parameters.materialColor,
        gradientMap: gradientTexture
      })

      // mesh
      const objectsDistance = 4
      const mesh1 = new THREE.Mesh(
        new THREE.TorusGeometry(1, 0.4, 16, 60),
        material
      )
      const mesh2 = new THREE.Mesh(
        new THREE.ConeGeometry(1, 2, 32),
        material
      )
      const mesh3 = new THREE.Mesh(
        new THREE.TorusKnotGeometry(0.8, 0.35, 100, 16),
        material
      )
      mesh1.position.y = -objectsDistance * 0
      mesh2.position.y = -objectsDistance * 1
      mesh3.position.y = -objectsDistance * 2

      mesh1.position.x = 2
      mesh2.position.x = -2
      mesh3.position.x = 2
      this.objects = [mesh1, mesh2, mesh3]
      scene.add(mesh1, mesh2, mesh3)

      const count = 200
      const position = new Float32Array(count * 3)
      for (let i = 0; i < count; i++) {
        const i3 = i * 3
        position[i3] = (Math.random() - 0.5) * 10
        position[i3 + 1] = (Math.random() - 0.5) * 10
        position[i3 + 2] = (Math.random() - 0.5) * 10
      }
      const particlesGeometry = new THREE.BufferGeometry()
      particlesGeometry.setAttribute('position', new THREE.BufferAttribute(position, 3))
      const particlesMaterial = new THREE.PointsMaterial({
        color: parameters.materialColor,
        size: 0.03,
        sizeAttenuation: true
      })
      const particles = new THREE.Points(particlesGeometry, particlesMaterial)
      scene.add(particles)
      window.addEventListener('scroll', event => {
        console.log(event)
      })
      // 初始化大小
      const sizes = {
        width: window.innerWidth,
        height: window.innerHeight
      }
      this.size = sizes
      const cursor = {
        x: 0,
        y: 0
      }
      this.cursor = cursor
      window.addEventListener('mousemove', event => {
        cursor.x = event.clientX / sizes.width - 0.5
        cursor.y = event.clientY / sizes.height - 0.5
      })
      let currentSection = 0
      window.addEventListener('scroll', event => {
        this.scrollY = window.scrollY
        const newSection = Math.round(scrollY / sizes.height)
        // console.log(scrollY)

        if (newSection != currentSection) {
          currentSection = newSection
          // console.log('changed', currentSection)

          gsap.to(
            this.objects[currentSection].rotation,
            {
              duration: 1.5,
              ease: 'power2.inOut',
              x: '+=6',
              y: '+=3',
              z: '+=1.5'
            }
          )
        }
      })
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
      const camera = new THREE.PerspectiveCamera(35, sizes.width / sizes.height, 0.1, 100)
      camera.position.z = 6

      this.camera = camera
      const Group = new THREE.Group()
      Group.add(camera)
      this.Group = Group
      scene.add(Group)
      // 初始化渲染器
      const renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: true,
        alpha: true // this helps to have a transparent background. by default alpha: 0
      })
      renderer.setSize(sizes.width, sizes.height)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      // renderer.shadowMap.enabled = true
      // renderer.shadowMap.type = THREE.PCFSoftShadowMap
      // renderer.setClearColor('#262837')
      this.renderer = renderer
      // 创建控制器
      // const controls = new OrbitControls(camera, canvas)
      // controls.enableDamping = true

      // this.controls = controls
      this.clock = new THREE.Clock()

      this.animate()
    },
    animate() {
      // this.controls.update()
      // Update the sphere
      const elapsedTime = this.clock.getElapsedTime()
      const deltaTime = elapsedTime - this.previousTime
      this.previousTime = elapsedTime
      const parallaxX = this.cursor.x * 0.5
      const parallaxY = -this.cursor.y * 0.5
      this.Group.position.x += (parallaxX - this.Group.position.x) * 5 * deltaTime
      this.Group.position.y += (parallaxY - this.Group.position.y) * 5 * deltaTime
      this.camera.position.y = -this.scrollY / this.size.height * 4
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
