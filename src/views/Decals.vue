<template>
  <div id="decals" ref="decals" />
</template>

<script>
import * as THREE from 'three'
// 引入控制器
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
// 引入gltf模型加载器
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
// 引入decalgeimetry
import { DecalGeometry } from 'three/examples/jsm/geometries/DecalGeometry'

export default {
  data() {
    return {
      scene: null,
      camera: null,
      renderer: null,
      mesh: null,
      mouse: new THREE.Vector2(),
      raycaster: null,
      intersects: [],
      line: null,
      container: null,
      mouseHelper: null,
      innerWidth: 0,
      innerHeight: 0,
      intersection: {
        intersects: false,
        point: new THREE.Vector3(),
        normal: new THREE.Vector3()
      },
      orientation: new THREE.Euler(),
      size: new THREE.Vector3(10, 10, 10),
      params: {
        minScale: 10,
        maxScale: 20,
        rotate: true
      },
      decalMaterial: null,
      decals: [],
      position: new THREE.Vector3()
    }
  },

  mounted() {
    this.container = this.$refs.decals
    this.innerWidth = this.container.offsetWidth
    this.innerHeight = this.container.offsetHeight
    this.init()
    this.animate()
  },
  methods: {
    init() {
      const textureLoader = new THREE.TextureLoader()
      const decalDiffuse = textureLoader.load(
        '/textures/decal/decal-diffuse.png'
      )
      const decalNormal = textureLoader.load(
        '/textures/decal/decal-normal.jpg'
      )
      this.decalMaterial = new THREE.MeshPhongMaterial({
        specular: 0x444444,
        map: decalDiffuse,
        normalMap: decalNormal,
        normalScale: new THREE.Vector2(1, 1),
        shininess: 30,
        transparent: true,
        depthTest: true,
        depthWrite: false,
        polygonOffset: true,
        polygonOffsetFactor: -4,
        wireframe: false
      })
      // 加载模型
      this.renderer = new THREE.WebGLRenderer({ antialias: true })
      this.renderer.setPixelRatio(window.devicePixelRatio)
      this.renderer.setSize(this.innerWidth, this.innerHeight)
      this.container.appendChild(this.renderer.domElement)
      // 创建场景
      this.scene = new THREE.Scene()

      // 创建相机
      this.camera = new THREE.PerspectiveCamera(
        45,
        this.innerWidth / this.innerHeight,
        1,
        1000
      )

      this.camera.position.z = 120

      const controls = new OrbitControls(this.camera, this.renderer.domElement)
      controls.minDistance = 50
      controls.maxDistance = 200

      const ambientLight = new THREE.AmbientLight(0x443333)
      this.scene.add(ambientLight)
      // 正面灯光
      const directionalLight1 = new THREE.DirectionalLight(0xffddcc, 1)
      directionalLight1.position.set(1, 0.75, 0.5)
      this.scene.add(directionalLight1)
      // 背面灯光
      const directionalLight2 = new THREE.DirectionalLight(0xccccff, 1)
      directionalLight2.position.set(-1, 0.75, -0.5)
      this.scene.add(directionalLight2)
      const geometry = new THREE.BufferGeometry()
      geometry.setFromPoints([new THREE.Vector3(), new THREE.Vector3()])

      this.line = new THREE.Line(
        geometry,
        new THREE.LineBasicMaterial({ color: 0xffffff })
      )
      this.scene.add(this.line)
      // 鼠标上的白线
      this.mouseHelper = new THREE.Mesh(
        new THREE.BoxGeometry(1, 1, 10),
        new THREE.MeshNormalMaterial()
      )
      // 隐藏起来
      this.mouseHelper.visible = false
      this.scene.add(this.mouseHelper)

      const loader = new GLTFLoader()
      loader.load('/model/LeePerrySmith/LeePerrySmith.glb', (gltf) => {
        this.mesh = gltf.scene.children[0]
        this.mesh.material = new THREE.MeshPhongMaterial({
          specular: 0x111111,
          map: textureLoader.load('/model/LeePerrySmith/Map-COL.jpg'),
          specularMap: textureLoader.load('/model/LeePerrySmith/Map-SPEC.jpg'),
          normalMap: textureLoader.load(
            '/model/LeePerrySmith/Infinite-Level_02_Tangent_SmoothUV.jpg'
          ),
          shininess: 25
        })
        this.scene.add(this.mesh)
        this.mesh.scale.set(10, 10, 10)
      })
      window.addEventListener('resize', (event) => {
        this.camera.setPixelRatio(window.devicePixelRatio)
        this.innerWidth = this.container.offsetWidth
        this.innerHeight = this.container.offsetHeight
        this.camera.aspect = this.innerWidth / this.innerHeight
      })
      // 增加移动属性
      let moved = false
      controls.addEventListener('change', () => {
        moved = true
      })

      window.addEventListener('pointerdown', () => {
        moved = false
      })
      this.raycaster = new THREE.Raycaster()
      window.addEventListener('pointerup', (event) => {
        if (moved === false) {
          this.checkIntersection(event.clientX - 200, event.clientY)
          this.intersection.intersects === true ? this.shot() : null
        }
      })
      window.addEventListener('pointermove', (event) => {
        if (event.isPrimary) {
          this.checkIntersection(event.clientX - 200, event.clientY)
        }
      })
    },
    animate() {
      requestAnimationFrame(this.animate)

      this.renderer.render(this.scene, this.camera)
    },
    checkIntersection(x, y) {
      // 如果材质未加载 return
      if (this.mesh === undefined) return
      // 设置鼠标位置
      this.mouse.x = (x / this.innerWidth) * 2 - 1
      this.mouse.y = -(y / this.innerHeight) * 2 + 1
      // 计算鼠标点击的目标
      this.raycaster.setFromCamera(this.mouse, this.camera)
      this.raycaster.intersectObject(this.mesh, false, this.intersects)
      if (this.intersects.length > 0) {
        const p = this.intersects[0].point
        this.mouseHelper.position.copy(p)
        this.intersection.point.copy(p)

        const n = this.intersects[0].face.normal.clone()
        n.transformDirection(this.mesh.matrixWorld)
        n.multiplyScalar(10)
        n.add(this.intersects[0].point)

        this.intersection.normal.copy(this.intersects[0].face.normal)
        this.mouseHelper.lookAt(n)

        const positions = this.line.geometry.attributes.position
        positions.setXYZ(0, p.x, p.y, p.z)
        positions.setXYZ(1, n.x, n.y, n.z)
        positions.needsUpdate = true

        this.intersection.intersects = true

        this.intersects.length = 0
      } else {
        this.intersection.intersects = false
      }
    },
    shot() {
      this.position.copy(this.intersection.point)
      this.orientation.copy(this.mouseHelper.rotation)

      if (this.params.rotate) this.orientation.z = Math.random() * Math.PI * 2

      const scale = this.params.minScale + Math.random() * (this.params.maxScale - this.params.minScale)
      this.size.set(scale, scale, scale)
      const decalgeometry = new DecalGeometry(this.mesh, this.position, this.orientation, this.size)
      const material = this.decalMaterial.clone()
      material.color.setHex(Math.random() * 0xffffff)
      const m = new THREE.Mesh(decalgeometry, material)
      this.decals.push(m)
      this.scene.add(m)
    }
  }
}
</script>

<style>
#decals {
  width: 100%;
  height: 100%;
}
</style>
