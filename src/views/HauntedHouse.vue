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
      sphere: null,
      sphereShadow: null,
      clock: null,
      ghost1: null,
      ghost2: null,
      ghost3: null
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

      // 初始化场景
      // 获取canvas
      const canvas = this.$refs.webgl
      const scene = new THREE.Scene()
      this.scene = scene
      const fog = new THREE.Fog(0x262937, 1, 15)
      scene.fog = fog

      // 纹理
      const textureLoader = new THREE.TextureLoader()
      const doorColorTexture = textureLoader.load('/static/textures/door/color.jpg')
      const doorAlphaTexture = textureLoader.load('/static/textures/door/alpha.jpg')
      const doorAmbientOcclusionTexture = textureLoader.load('/static/textures/door/ambientOcclusion.jpg')
      const doorHeightTexture = textureLoader.load('/static/textures/door/height.jpg')
      const doorNormalTexture = textureLoader.load('/static/textures/door/normal.jpg')
      const doorMetalnessTexture = textureLoader.load('/static/textures/door/metalness.jpg')
      const doorRoughnessTexture = textureLoader.load('/static/textures/door/roughness.jpg')
      // 墙贴图
      const bricksColorTexture = textureLoader.load('/static/textures/bricks/color.jpg')
      const bricksAmbientOcclusionTexture = textureLoader.load('/static/textures/bricks/ambientOcclusion.jpg')
      const bricksNormalTexture = textureLoader.load('/static/textures/bricks/normal.jpg')
      const bricksRoughnessTexture = textureLoader.load('/static/textures/bricks/roughness.jpg')
      // 草贴图
      const grassColorTexture = textureLoader.load('/static/textures/grass/color.jpg')
      const grassAmbientOcclusionTexture = textureLoader.load('/static/textures/grass/ambientOcclusion.jpg')
      const grassNormalTexture = textureLoader.load('/static/textures/grass/normal.jpg')
      const grassRoughnessTexture = textureLoader.load('/static/textures/grass/roughness.jpg')

      grassColorTexture.repeat.set(8, 8)
      grassAmbientOcclusionTexture.repeat.set(8, 8)
      grassNormalTexture.repeat.set(8, 8)
      grassRoughnessTexture.repeat.set(8, 8)

      grassColorTexture.wrapS = THREE.RepeatWrapping
      grassAmbientOcclusionTexture.wrapS = THREE.RepeatWrapping
      grassNormalTexture.wrapS = THREE.RepeatWrapping
      grassRoughnessTexture.wrapS = THREE.RepeatWrapping

      grassColorTexture.wrapT = THREE.RepeatWrapping
      grassAmbientOcclusionTexture.wrapT = THREE.RepeatWrapping
      grassNormalTexture.wrapT = THREE.RepeatWrapping
      grassRoughnessTexture.wrapT = THREE.RepeatWrapping

      // 灯光

      const ambientLight = new THREE.AmbientLight(0xb9d5ff, 0.12)
      ambientLight.castShadow = true
      gui.add(ambientLight, 'intensity').min(0).max(1).step(0.001).name('环境光')
      scene.add(ambientLight)

      const moonLight = new THREE.DirectionalLight(0xb9d5ff, 0.12)
      moonLight.castShadow = true
      gui.add(moonLight, 'intensity').min(0).max(1).step(0.001).name('位置')
      gui.add(moonLight.position, 'x').min(-5).max(5).step(0.001)
      gui.add(moonLight.position, 'y').min(-5).max(5).step(0.001)
      gui.add(moonLight.position, 'z').min(-5).max(5).step(0.001)
      moonLight.position.set(4, 5, -2)
      scene.add(moonLight)

      const floor = new THREE.Mesh(
        new THREE.PlaneBufferGeometry(20, 20),
        new THREE.MeshStandardMaterial({
          map: grassColorTexture,
          aoMap: grassAmbientOcclusionTexture,
          normalMap: grassNormalTexture,
          roughnessMap: grassRoughnessTexture
        })
      )

      floor.geometry.setAttribute(
        'uv2',
        new THREE.Float32BufferAttribute(floor.geometry.attributes.uv.array, 2)
      )
      floor.rotation.x = -Math.PI * 0.5
      floor.position.y = 0
      scene.add(floor)

      // 房子
      const house = new THREE.Group()
      scene.add(house)
      // 墙
      const walls = new THREE.Mesh(
        new THREE.BoxBufferGeometry(4, 2.5, 4),
        new THREE.MeshStandardMaterial({
          map: bricksColorTexture,
          aoMap: bricksAmbientOcclusionTexture,
          normalMap: bricksNormalTexture,
          roughnessMap: bricksRoughnessTexture
        })
      )
      walls.geometry.setAttribute(
        'uv2',
        new THREE.Float32BufferAttribute(walls.geometry.attributes.uv.array, 2)
      )
      walls.position.y = 1.25
      house.add(walls)
      // 屋顶
      const roof = new THREE.Mesh(
        new THREE.ConeBufferGeometry(3.5, 1, 4),
        new THREE.MeshStandardMaterial({ color: '#b35f45' })
      )
      roof.position.y = 2.5 + 0.5
      roof.rotation.y = Math.PI / 4
      house.add(roof)

      // 创建门
      const door = new THREE.Mesh(
        new THREE.PlaneBufferGeometry(2.2, 2.2, 100, 100),
        new THREE.MeshStandardMaterial({
          map: doorColorTexture,
          transparent: true,
          alphaMap: doorAlphaTexture,
          aoMap: doorAmbientOcclusionTexture,
          displacementMap: doorHeightTexture,
          displacementScale: 0.1,
          normalMap: doorNormalTexture,
          metalnessMap: doorMetalnessTexture,
          roughnessMap: doorRoughnessTexture
        })
      )
      door.geometry.setAttribute(
        'uv2',
        new THREE.Float32BufferAttribute(door.geometry.attributes.uv.array, 2)
      )
      door.position.y = 1
      door.position.z = 2 + 0.01
      house.add(door)

      // 创建屋子上的灯光
      const doorLight = new THREE.PointLight('#ff7d46', 1, 7)
      doorLight.position.set(0, 2.2, 2.7)
      doorLight.castShadow = true
      house.add(doorLight)
      // 创建灌木丛
      const bushGeometry = new THREE.SphereBufferGeometry(1, 16, 16)
      const bushMaterial = new THREE.MeshStandardMaterial({ color: '#89c854' })

      const bush1 = new THREE.Mesh(bushGeometry, bushMaterial)
      bush1.position.set(0.8, 0.2, 2.2)
      bush1.scale.set(0.5, 0.5, 0.5)

      const bush2 = new THREE.Mesh(bushGeometry, bushMaterial)
      bush2.position.set(1.4, 0.1, 2.1)
      bush2.scale.set(0.25, 0.25, 0.25)

      const bush3 = new THREE.Mesh(bushGeometry, bushMaterial)
      bush3.position.set(-0.8, 0.1, 2.2)
      bush3.scale.set(0.4, 0.4, 0.4)

      const bush4 = new THREE.Mesh(bushGeometry, bushMaterial)
      bush4.position.set(-1, 0.05, 2.6)
      bush4.scale.set(0.15, 0.15, 0.15)

      house.add(bush1, bush2, bush3, bush4)
      // 创建运动灯光
      const ghost1 = new THREE.PointLight('#ff00ff', 2, 3)
      this.ghost1 = ghost1
      scene.add(ghost1)
      const ghost2 = new THREE.PointLight('#00ffff', 2, 3)
      scene.add(ghost2)
      this.ghost2 = ghost2
      const ghost3 = new THREE.PointLight('#ffff00', 2, 3)
      scene.add(ghost3)
      this.ghost3 = ghost3
      // 创建墓碑组
      const graves = new THREE.Group()
      scene.add(graves)
      // 创建墓碑
      const graveGeometry = new THREE.BoxBufferGeometry(0.6, 0.8, 0.2)
      const graveMaterial = new THREE.MeshStandardMaterial({
        color: '#b2b6b1'
      })
      // 循环创建
      for (let i = 0; i < 50; i++) {
        const angle = Math.random() * Math.PI * 2
        const radius = 3 + Math.random() * 6
        const x = Math.sin(angle) * radius
        const y = Math.cos(angle) * radius

        const grave = new THREE.Mesh(graveGeometry, graveMaterial)
        grave.castShadow = true
        grave.position.set(x, 0.3, y)
        grave.rotation.y = (Math.random() - 0.5) * 0.4
        grave.rotation.z = (Math.random() - 0.5) * 0.4
        graves.add(grave)
      }
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
        1000
      )
      camera.position.x = 4
      camera.position.y = 2
      camera.position.z = 5
      scene.add(camera)
      this.camera = camera
      // 初始化渲染器
      const renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: true
      })
      renderer.setSize(sizes.width, sizes.height)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      renderer.shadowMap.enabled = true
      renderer.shadowMap.type = THREE.PCFSoftShadowMap
      renderer.setClearColor('#262837')
      this.renderer = renderer
      // 创建控制器
      const controls = new OrbitControls(camera, canvas)
      controls.enableDamping = true

      /**
 * Shadows
 */
      moonLight.castShadow = true
      doorLight.castShadow = true

      ghost1.castShadow = true
      ghost2.castShadow = true
      ghost3.castShadow = true

      walls.castShadow = true
      bush1.castShadow = true
      bush2.castShadow = true
      bush3.castShadow = true
      bush4.castShadow = true
      floor.receiveShadow = true

      // Reduce the shadow map render sizes to improve performances:
      moonLight.shadow.mapSize.width = 256
      moonLight.shadow.mapSize.height = 256
      moonLight.shadow.camera.far = 15

      doorLight.shadow.mapSize.width = 256
      doorLight.shadow.mapSize.height = 256
      doorLight.shadow.camera.far = 7

      ghost1.shadow.mapSize.width = 256
      ghost1.shadow.mapSize.height = 256
      ghost1.shadow.camera.far = 7

      ghost2.shadow.mapSize.width = 256
      ghost2.shadow.mapSize.height = 256
      ghost2.shadow.camera.far = 7

      ghost3.shadow.mapSize.width = 256
      ghost3.shadow.mapSize.height = 256
      ghost3.shadow.camera.far = 7

      this.controls = controls
      this.clock = new THREE.Clock()
      this.animate()
    },
    animate() {
      this.controls.update()
      // Update the sphere
      const elapsedTime = this.clock.getElapsedTime()

      // Ghosts
      const ghost1Angle = elapsedTime * 0.5
      this.ghost1.position.x = Math.cos(ghost1Angle) * 4 // the *4 is to increase the radius
      this.ghost1.position.z = Math.sin(ghost1Angle) * 4
      this.ghost1.position.y = Math.sin(elapsedTime * 3)

      const ghost2Angle = -elapsedTime * 0.32
      this.ghost2.position.x = Math.cos(ghost2Angle) * 5
      this.ghost2.position.z = Math.sin(ghost2Angle) * 5
      this.ghost2.position.y = Math.sin(elapsedTime * 4) + Math.sin(elapsedTime * 2.5)

      const ghost3Angle = -elapsedTime * 0.18
      this.ghost3.position.x = Math.cos(ghost3Angle) * (7 + Math.sin(elapsedTime * 0.32))
      this.ghost3.position.z = Math.sin(ghost3Angle) * (7 + Math.sin(elapsedTime * 0.5))
      this.ghost3.position.y = Math.sin(elapsedTime * 4) + Math.sin(elapsedTime * 2.5)

      this.renderer.render(this.scene, this.camera)
      requestAnimationFrame(this.animate)
    }
  }
}
</script>

<style>
</style>
