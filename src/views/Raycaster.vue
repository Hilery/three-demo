<template>
  <div id="raycaster">
    <canvas id="canvas" />
  </div>
</template>

<script>
import * as THREE from 'three'
// 引入照相机插件
import { CinematicCamera } from 'three/examples/jsm/cameras/CinematicCamera'
export default {
  data() {
    return {
      scene: null,
      camera: null,
      renderer: null,
      raycaster: null,
      mouse: null,
      intersected: null,
      radius: 100,
      theta: 0,
      innerWidth: 0,
      innerHeight: 0
    }
  },
  mounted() {
    const dom = document.getElementById('raycaster')
    this.innerWidth = dom.offsetWidth
    this.innerHeight = dom.offsetHeight
    console.log(this.innerWidth, this.innerHeight)
    console.log('===============================')
    console.log(window.innerWidth, window.innerHeight)
    console.log('===============================')
    const mouse = new THREE.Vector2()
    this.mouse = mouse
    this.init()
  },
  methods: {
    // 初始化场景
    init() {
      this.camera = new CinematicCamera(60, innerWidth / innerHeight, 1, 1000)
      this.camera.setLens(5)
      this.camera.position.set(2, 1, 500)

      this.scene = new THREE.Scene()
      this.scene.background = new THREE.Color('0xf0f0f0')
      // 增加灯光
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.3)
      this.scene.add(ambientLight)

      const light = new THREE.DirectionalLight(0xffffff, 0.35)
      // 设置灯光方向
      light.position.set(1, 1, 1).normalize()
      // 添加灯光
      this.scene.add(light)

      const geometry = new THREE.BoxGeometry(20, 20, 20)

      for (let i = 0; i < 1500; i++) {
        const material = new THREE.MeshLambertMaterial({
          color: 0xffffff * Math.random()
        })
        const box = new THREE.Mesh(geometry, material)
        box.position.set(
          Math.random() * 800 - 400,
          Math.random() * 800 - 400,
          Math.random() * 800 - 400
        )
        this.scene.add(box)
      }

      this.renderer = new THREE.WebGLRenderer({
        canvas: document.getElementById('canvas'),
        antialias: true
      })
      this.renderer.setPixelRatio(window.devicePixelRatio)
      this.renderer.setSize(innerWidth, innerHeight)

      // 监听页面大小变化 改变渲染器大小
      window.addEventListener('resize', () => {
        this.camera.aspect = innerWidth / innerHeight
        this.camera.updateProjectionMatrix()
        this.renderer.setSize(innerWidth, innerHeight)
      }),
      // 监听鼠标移动事件
      window.addEventListener('mousemove', (event) => {
        console.log(event)
        event.preventDefault()
        // 需要减去左边侧边栏的200px
        this.mouse.x = ((event.clientX - 200) / innerWidth) * 2 - 1
        this.mouse.y = -(event.clientY / innerHeight) * 2 + 1
        console.log(this.mouse)
      })
      this.raycaster = new THREE.Raycaster()

      const effectController = {
        focalLength: 15,
        // jsDepthCalculation: true,
        // shaderFocus: false,
        //
        fstop: 2.8,
        // maxblur: 1.0,
        //
        showFocus: false,
        focalDepth: 3
        // manualdof: false,
        // vignetting: false,
        // depthblur: false,
        //
        // threshold: 0.5,
        // gain: 2.0,
        // bias: 0.5,
        // fringe: 0.7,
        //
        // focalLength: 35,
        // noise: true,
        // pentagon: false,
        //
        // dithering: 0.0001
      }

      for (const e in effectController) {
        if (e in this.camera.postprocessing.bokeh_uniforms) {
          this.camera.postprocessing.bokeh_uniforms[e].value =
            effectController[e]
        }
      }

      this.camera.postprocessing.bokeh_uniforms['znear'].value =
        this.camera.near
      this.camera.postprocessing.bokeh_uniforms['zfar'].value = this.camera.far
      this.camera.setLens(
        effectController.focalLength,
        this.camera.frameHeight,
        effectController.fstop,
        this.camera.coc
      )
      effectController['focalDepth'] =
        this.camera.postprocessing.bokeh_uniforms['focalDepth'].value

      this.camera.postprocessing.bokeh_uniforms['focalLength'].value = 15
      this.camera.postprocessing.bokeh_uniforms['fstop'].value = 2.8
      this.camera.postprocessing.bokeh_uniforms['showFocus'].showFocus = false
      this.camera.postprocessing.bokeh_uniforms['focalDepth'].focalDepth = 3
      this.camera.postprocessing.bokeh_uniforms['znear'].value =
        this.camera.near
      this.camera.postprocessing.bokeh_uniforms['zfar'].value = this.camera.far
      this.camera.setLens(15, this.camera.frameHeight, 2.8, this.camera.coc)
      this.animate()
    },

    animate() {
      requestAnimationFrame(this.animate, this.renderer.domElement)

      this.render()
    },
    render() {
      this.theta += 0.1
      this.camera.position.set(
        this.radius * Math.sin(THREE.MathUtils.degToRad(this.theta)),
        this.radius * Math.sin(THREE.MathUtils.degToRad(this.theta)),
        this.radius * Math.cos(THREE.MathUtils.degToRad(this.theta))
      )
      this.camera.lookAt(this.scene.position)
      this.camera.updateMatrixWorld()
      this.raycaster.setFromCamera(this.mouse, this.camera)

      const intersects = this.raycaster.intersectObjects(
        this.scene.children,
        false
      )

      if (intersects.length > 0) {
        const targetDistance = intersects[0].distance

        this.camera.focusAt(targetDistance) // using Cinematic camera focusAt method

        if (this.intersected != intersects[0].object) {
          if (this.intersected) {
            this.intersected.material.emissive.setHex(
              this.intersected.currentHex
            )
          }
          this.intersected = intersects[0].object
          this.intersected.currentHex =
            this.intersected.material.emissive.getHex()
          this.intersected.material.emissive.setHex(0xff0000)
        }
      } else {
        if (this.intersected) {
          this.intersected.material.emissive.setHex(
            this.intersected.currentHex
          )
        }

        this.intersected = null
      }

      //   if (this.camera.postprocessing.enabled) {
      //     this.camera.renderCinematic(this.scene, this.renderer);
      //   } else {
      //     this.scene.overrideMaterial = null;
      //     this.renderer.clear();
      this.renderer.render(this.scene, this.camera)
      //   }
    }
  }
}
</script>

<style scoped>
div {
  width: 100%;
  height: 100%;
}
</style>>
