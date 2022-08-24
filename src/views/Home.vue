<template>
  <div id="home" class="home"></div>
</template>

<script>
import * as THREE from 'three'
// 导入控制器
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
// 导入水面
import { Water } from 'three/examples/jsm/objects/Water2'
// 导入gltf库
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
// 解压库 dracoloader
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'
// 导入rgbeloader
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader'
export default {
  name: 'Home',
  data() {
    return {
      scene: null,
      camera: null,
      renderer: null,
      controls: null,
      video: null
    }
  },
  mounted() {
    // 初始化场景
    var scene = new THREE.Scene()
    this.scene = scene
    // 初始化相机
    var camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      2000
    )
    // 设置相机位置 -50,50,130
    camera.position.set(-50, 50, 130)
    // 更新摄像头宽高比例
    camera.aspect = window.innerWidth / window.innerHeight
    // 更新摄像头投影矩阵
    camera.updateProjectionMatrix()

    // 添加摄像头
    scene.add(camera)

    // 初始化渲染器
    const renderer = new THREE.WebGLRenderer({
      antialias: true, // 抗锯齿
      // 对数深度缓冲区
      logarithmicDepthBuffer: true
    })
    renderer.outputEncoding = THREE.sRGBEncoding

    // 设置渲染器 宽高
    renderer.setSize(window.innerWidth, window.innerHeight)

    // 监听屏幕的大小改变 修改渲染器的宽高,和相机的比例
    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    })
    this.$nextTick(() => {
      // 渲染器画布 添加到页面
      document.getElementById('home').appendChild(renderer.domElement)
      const video = document.createElement('video')
      video.src = '/textures/sky.mp4'
      video.loop = true
      this.video = video
    })

    function render() {
      // 渲染场景
      renderer.render(scene, camera)
      // 重绘
      requestAnimationFrame(render)
    }
    render()
    // 实例化控制器
    var controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true // 是否启用惯性
    controls.dampingFactor = 0.25 // 惯性因子

    // //添加平面
    // const planeGeometry = new THREE.PlaneGeometry(100, 100);
    // const planeMaterial = new THREE.MeshBasicMaterial({
    //     color: 0xffffff,
    // })
    // const plane = new THREE.Mesh(planeGeometry, planeMaterial)
    // scene.add(plane)

    // 创建一个巨大的天空球
    const textures = new THREE.TextureLoader().load('/textures/sky.jpg')
    const skyGeometry = new THREE.SphereGeometry(1000, 60, 60)
    const skyMaterial = new THREE.MeshBasicMaterial({
      map: textures
    })
    skyGeometry.scale(1, 1, -1)
    const sky = new THREE.Mesh(skyGeometry, skyMaterial)
    scene.add(sky)

    window.addEventListener('click', (event) => {
      // 鼠标移动的时候
      // 判断视频是否处于播放状态
      if (this.video && this.video.paused) {
        this.video.play()
        const texture = new THREE.VideoTexture(this.video)
        skyMaterial.map = texture

        skyMaterial.map.needsUpdate = true
      }
    })

    // 载入环境纹理hdr
    const hdrLoader = new RGBELoader()
    hdrLoader.loadAsync('/static/050.hdr').then(function(texture) {
      texture.mapping = THREE.EquirectangularReflectionMapping
      // scene.background = textures
      // scene.environment = textures
    })

    const light = new THREE.DirectionalLight(0xffffff, 1)
    light.position.set(-100, 100, 100)
    scene.add(light)

    // 创建水面
    const waterGeometry = new THREE.CircleBufferGeometry(300, 64)
    const water = new Water(waterGeometry, {
      textureWidth: 1024,
      textureHeight: 1024,
      color: 0xeeeeff,
      flowDirection: new THREE.Vector2(1, 1),
      scale: 1
    })
    water.position.y = 3
    // 水面旋转至水平
    water.rotation.x = -Math.PI / 2
    scene.add(water)

    // 添加小岛模型
    // 实例化gltf载入库
    const loader = new GLTFLoader()
    // 实例化解压库
    const dracoLoader = new DRACOLoader()
    // 设置解压库js路径
    dracoLoader.setDecoderPath('/draco/')
    // 设置解压库为gltf载入库的解压库
    loader.setDRACOLoader(dracoLoader)
    // 加载模型
    loader.load('/model/island2.glb', (gltf) => {
      const island = gltf.scene
      // island.position.set(0, 0, 0);
      scene.add(island)
    })
    const loader1 = new GLTFLoader()
    // 设置解压库为gltf载入库的解压库
    loader1.setDRACOLoader(dracoLoader)
    loader1.load('/model/yugang.glb', (gltf) => {
      const yugang = gltf.scene
      scene.add(yugang)
    })
  },
  beforeDestroy() {
    this.video.pause()
  }
}
</script>

<style lang="less">
.home {
  width: 100%;
  height: 100%;
}
</style>
