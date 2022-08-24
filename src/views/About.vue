<template>
  <div id="about" class="about"></div>
</template>

<script>
import * as THREE from 'three'
// 导入控制器
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
// 导入第一人称控制器
import { FirstPersonControls } from 'three/examples/jsm/controls/FirstPersonControls.js'
// 导入gltf库
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'
import { CinematicCamera } from 'three/examples/jsm/cameras/CinematicCamera.js'
import CityClass from '../utils/city'
export default {
  data() {
    return {}
  },
  mounted() {
    // 场景
    const scene = new THREE.Scene()
    // dom节点
    const dom = document.getElementById('about')
    // 纹理
    const textureLoader = new THREE.TextureLoader()

    // 屏幕大小
    const size = {
      width: window.innerWidth,
      height: window.innerHeight
    }
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true
    })
    // 渲染器画布 添加到页面

    renderer.setSize(size.width, size.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor(new THREE.Color('#32373E'), 1)
    document.getElementById('about').appendChild(renderer.domElement)
    // 灯光
    // 环境光
    const ambientLight = new THREE.AmbientLight(0xadadad)
    scene.add(ambientLight)

    // 平行光源
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5)
    directionalLight.position.set(100, 100, 0)
    scene.add(directionalLight)
    // 渲染大小

    window.addEventListener('resize', () => {
      size.width = window.innerWidth
      size.height = window.innerHeight

      camera.aspect = size.width / size.height
      camera.updateProjectionMatrix()

      // 设置渲染器
      renderer.setSize(size.width, size.height)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    })
    // window.addEventListener("click", (event) => {
    //   console.log(event);
    //   pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    //   pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
    //   console.log(pointer);
    // });
    // 照相机
    const camera = new THREE.PerspectiveCamera(
      45,
      size.width / size.height,
      1,
      30000
    )
    camera.position.set(1200, 700, 121)
    scene.add(camera)

    // 控制器
    const controls = new OrbitControls(camera, renderer.domElement)
    // 是否使用阻尼器
    controls.enableDamping = true

    const city = new CityClass()
    scene.add(city.group)

    const clock = new THREE.Clock()
    const animate = () => {
      const time = clock.getDelta()
      city.animate(time)
      // controls.update()
      renderer.render(scene, camera)
      window.requestAnimationFrame(animate)
    }
    animate()
  }
}
</script>

<style>
</style>
