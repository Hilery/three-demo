<template>
  <div>
    <canvas id="webgl" ref="webgl" canvas-id="canvasId" />
  </div>
</template>

<script>
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import * as dat from 'dat.gui'
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
      currentIntersected: null

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
      // 雾
      this.raycaster = new THREE.Raycaster()
      // 初始化场景
      // 获取canvas
      const canvas = this.$refs.webgl
      const scene = new THREE.Scene()
      this.scene = scene

      const light = new THREE.AmbientLight(0xffffff, 1)
      scene.add(light)

      // const geometry = new THREE.SphereBufferGeometry(0.5, 16, 16)
      // const material = new THREE.MeshStandardMaterial()
      // material.color = new THREE.Color(0xff0000)
      const object1 = new THREE.Mesh(new THREE.SphereBufferGeometry(0.5, 16, 16), new THREE.MeshStandardMaterial())
      object1.position.x = -2
      this.object1 = object1
      scene.add(object1)

      const object2 = new THREE.Mesh(new THREE.SphereBufferGeometry(0.5, 16, 16), new THREE.MeshStandardMaterial())
      this.object2 = object2
      scene.add(object2)

      const object3 = new THREE.Mesh(new THREE.SphereBufferGeometry(0.5, 16, 16), new THREE.MeshStandardMaterial())
      this.object3 = object3
      object3.position.x = 2
      scene.add(object3)
      this.objects = [object1, object2, object3]
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
      const camera = new THREE.PerspectiveCamera(
        75,
        sizes.width / sizes.height,
        0.1,
        100
      )
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
      // renderer.shadowMap.enabled = true
      // renderer.shadowMap.type = THREE.PCFSoftShadowMap
      // renderer.setClearColor('#262837')
      this.renderer = renderer
      // 创建控制器
      const controls = new OrbitControls(camera, canvas)
      controls.enableDamping = true

      this.controls = controls
      this.clock = new THREE.Clock()

      // 鼠标事件
      const mouse = new THREE.Vector2()
      this.mouse = mouse
      window.addEventListener('mousemove', (event) => {
        mouse.x = ((event.clientX - 200) / (window.innerWidth)) * 2 - 1
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1
      })

      window.addEventListener('click', () => {
        if (this.currentIntersected) {
          console.log(this.currentIntersected)
        }
      })

      this.animate()
    },
    animate() {
      this.controls.update()
      // Update the sphere
      const elapsedTime = this.clock.getElapsedTime()

      // Update objects
      this.object1.position.y = Math.sin(elapsedTime * 0.3) * 1.5
      this.object2.position.y = Math.sin(elapsedTime * 0.8) * 1.5
      this.object3.position.y = Math.sin(elapsedTime * 1.4) * 1.5

      this.raycaster.setFromCamera(this.mouse, this.camera)
      const intersecets = this.raycaster.intersectObjects(this.objects)

      // console.log(intersecets)
      if (intersecets.length) {
        if (this.currentIntersected) {
          this.currentIntersected = null
        }
        this.currentIntersected = intersecets[0]
      } else {
        this.currentIntersected = null
      }
      // const rayOrigin = new THREE.Vector3(-3, 0, 0)
      // const rayDirection = new THREE.Vector3(1, 0, 0)
      // rayDirection.normalize()
      // this.raycaster.set(rayOrigin, rayDirection)
      // const intersects = this.raycaster.intersectObjects(this.objects)

      // for (const obj of this.objects) {
      //   obj.material.color.set('red')
      // }

      // for (const intersect of intersects) {
      //   intersect.object.material.color.set('blue')
      // }
      // this.particles.rotation.y = elapsedTime * 0.2
      this.renderer.render(this.scene, this.camera)
      requestAnimationFrame(this.animate)
    }
  }
}
</script>

<style>
</style>
