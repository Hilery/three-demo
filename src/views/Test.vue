<template>
  <div ref="wrap">
    <div id="webgl" ref="webgl" class="webgl" canvas-id="canvasId" />
  </div>
</template>

<script>
import * as THREE from "three/build/three.module.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
// 解压库 dracoloader
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
// 引入室内环境
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment";
// 导入rgbeloader
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader";
import Tween from "@tweenjs/tween.js";
import Stats from "stats.js";
// 动画库
import gsap from "gsap";
import * as dat from "dat.gui";
let camera = null;
export default {
  data() {
    return {
      stats: null,
      gui: null,
      camera: null,
      scene: null,
      renderer: null,
      controls: null,
      debuggerObj: {},
      mixer: null,
      previousTime: 0,
      clock: new THREE.Clock(),
      model: null,
      frontTexture: null,
      frontSTexture: null,
      carModel: null,
      isNeedLookAt: false,
      progress: 0,
      carPath: null,
      beginAnimation: false,
      centerAnimation: false,
    };
  },
  mounted() {
    this.init();
  },
  methods: {
    init() {
      this.initThree();
      this.addGui();
      this.initMap();
      this.initCamera();
      this.initScene();
      this.initLight();
      this.initObject();
      this.initControls();
      this.render();
    },
    addGui() {
      this.gui = new dat.GUI();
      // this.gui.add(button, 'add').name('添加')
      this.gui.add(this, "beginAnimation").name("开始加油");
      this.gui
        .add(this, "centerAnimation")
        .name("加油结束")
        .onChange((value) => {
          if (value) {
          } else {
            this.progress = 0;
          }
        });
    },
    initMap() {
      const loader = new THREE.TextureLoader();
      const frontTexture = loader.load(
        "/model/oil/3d66Model-725752-files-6.jpg"
      );

      const frontSTexture = loader.load(
        "/model/oil/3d66Model-725752-files-2.jpg"
      );

      frontTexture.wrapS = THREE.RepeatWrapping;
      frontTexture.wrapT = THREE.RepeatWrapping;
      frontTexture.encoding = THREE.sRGBEncoding;
      frontTexture.flipY = false;

      frontSTexture.wrapS = THREE.RepeatWrapping;
      frontSTexture.wrapT = THREE.RepeatWrapping;
      frontSTexture.encoding = THREE.sRGBEncoding;
      frontSTexture.flipY = false;

      this.frontTexture = frontTexture;
      this.frontSTexture = frontSTexture;

      this.loader = loader;
    },
    initThree() {
      this.stats = new Stats();
      this.$refs.wrap.appendChild(this.stats.dom);
      const width = document.documentElement.clientWidth;
      const height = document.documentElement.clientHeight;
      this.renderer = new THREE.WebGLRenderer({
        antialias: true,
      });

      this.renderer.setSize(width, height);
      // this.renderer.shadowMap.enabled = true
      this.$refs.webgl.appendChild(this.renderer.domElement);
    },
    initCamera() {
      camera = new THREE.PerspectiveCamera(
        45,
        window.innerWidth / window.innerHeight,
        1,
        2000
      );
      // 设置相机位置 -50,50,130
      camera.position.set(0, 20, 70);
      // 更新摄像头宽高比例
      camera.aspect = window.innerWidth / window.innerHeight;
      // 更新摄像头投影矩阵

      camera.lookAt(0, 0, 0);
      camera.updateProjectionMatrix();
    },
    initScene() {
      // 3d66Model-1625299-files-26.hdr
      const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
      this.scene = new THREE.Scene();
      this.scene.background = new THREE.Color(0xbfe3dd);
      this.scene.environment = pmremGenerator.fromScene(
        new RoomEnvironment(),
        0.1
      ).texture;
      // const hdrLoader = new RGBELoader()
      // hdrLoader.loadAsync('/model/oil/3d66Model-1625299-files-26.hdr').then((texture) => {
      //   const skyGeometry = new THREE.SphereGeometry(1000, 60, 60)
      //   const skyMaterial = new THREE.MeshBasicMaterial({
      //     map: texture
      //   })
      //   skyGeometry.scale(1, 1, -1)
      //   const sky = new THREE.Mesh(skyGeometry, skyMaterial)
      //   this.scene.add(sky)
      // })
    },
    initLight() {
      const light = new THREE.DirectionalLight(0xffffff, 0.06);
      light.position.set(-100, 100, 100);

      const parameters = {
        materialColor: "#ffeded",
        intensity: 0.02,
      };
      this.gui.addColor(parameters, "materialColor").onChange((color) => {
        light.color.set(color);
      });
      this.gui.add(parameters, "intensity", 0, 2).onChange((intensity) => {
        light.intensity = intensity;
      });
      this.gui.add(light.position, "x", 0, 20, 1);
      this.gui.add(light.position, "y", 0, 20, 1);
      this.gui.add(light.position, "z", 0, 20, 1);

      this.scene.add(light);

      // // 创建环境光
      const ambient = new THREE.AmbientLight(0xffffff, 0.2);
      this.scene.add(ambient);
    },

    initObject() {
      const glbloader = new GLTFLoader();
      // 实例化解压库
      const dracoLoader = new DRACOLoader();
      // 设置解压库js路径
      dracoLoader.setDecoderPath("/draco/");
      // 设置解压库为gltf载入库的解压库
      glbloader.setDRACOLoader(dracoLoader);

      var curve = new THREE.CatmullRomCurve3(
        [
          new THREE.Vector3(27, 0.38, 16),
          new THREE.Vector3(15, 0.38, 2),
          new THREE.Vector3(-10, 0.38, 2),
          new THREE.Vector3(-22, 0.38, 10),
        ],
        false /*是否闭合*/
      );
      this.carPath = curve;
      var tubeGeometry = new THREE.TubeGeometry(curve, 100, 0.6, 50, false);
      var tubeMaterial = new THREE.MeshBasicMaterial({
        color: "#000000",
        // transparent: true,
        visible: false,
      });
      var tube = new THREE.Mesh(tubeGeometry, tubeMaterial);
      this.scene.add(tube);

      glbloader.load("/model/oil/test.gltf", (gltf) => {
        console.log(gltf);
        gltf.scene.traverse((child) => {
          if (child.isObject3D && child.isMesh) {
            if (child.name === "Obj3d66-725752-179-298") {
              const texture = this.loader.load(
                "/model/oil/3d66Model-725752-files-5.jpg"
              );
              texture.flipY = false;
              texture.encoding = THREE.sRGBEncoding;
              const material = new THREE.MeshStandardMaterial({
                map: texture,
                roughness: 0.5,
                metalness: 0.5,
                // specularMap: this.frontSTexture
              });
              child.material = material;
            } else if (
              child.name === "Obj3d66-725752-16-808" ||
              child.name === "Obj3d66-725752-20-602"
            ) {
              const texture = this.loader.load(
                "/model/oil/3d66Model-725752-files-7.jpg"
              );
              texture.flipY = false;
              texture.encoding = THREE.sRGBEncoding;
              const material = new THREE.MeshStandardMaterial({
                map: texture,
                roughness: 0.5,
                metalness: 0.5,
                // specularMap: this.frontSTexture
              });
              child.material = material;
            } else if (
              child.name === "Obj3d66-725752-19-546" ||
              child.name === "Obj3d66-725752-13-367"
            ) {
              console.log(child);
              const texture = this.loader.load(
                "/model/oil/3d66Model-725752-files-3.jpg"
              );
              texture.flipY = false;
              texture.encoding = THREE.sRGBEncoding;
              const material = new THREE.MeshStandardMaterial({
                map: texture,
                roughness: 0.5,
                metalness: 0.5,
                // specularMap: this.frontSTexture
              });
              child.material = material;
            }
          } else if (
            child.name === "Obj3d66-725752-25-709" ||
            child.name === "Obj3d66-725752-5-201"
          ) {
            console.log(child);
            const material = new THREE.MeshStandardMaterial({
              map: this.frontTexture,

              // specularMap: this.frontSTexture
            });
            child.material = material;
            child.material.needsUpdate = true;
            child.material.map = this.frontTexture;
            child.material.map.wrapS = THREE.RepeatWrapping;
            child.material.map.wrapT = THREE.RepeatWrapping;
          }
        });
        const scene_clone1 = gltf.scene.clone();
        const scene_clone2 = gltf.scene.clone();
        const scene_clone3 = gltf.scene.clone();
        const scene_clone4 = gltf.scene.clone();
        const scene_clone5 = gltf.scene.clone();
        const scene_clone6 = gltf.scene.clone();
        const scene_clone7 = gltf.scene.clone();
        const scene_clone8 = gltf.scene.clone();
        scene_clone1.position.set(5, 0.15, 4.5);
        scene_clone2.position.set(7, 0.15, 4.5);
        scene_clone3.position.set(0, 0.15, 4.5);
        scene_clone4.position.set(-2, 0.15, 4.5);

        scene_clone5.position.set(5, 0.15, -6.5);
        scene_clone6.position.set(7, 0.15, -6.5);
        scene_clone7.position.set(0, 0.15, -6.5);
        scene_clone8.position.set(-2, 0.15, -6.5);
        // this.scene.add(gltf.scene)
        this.scene.add(scene_clone1);
        this.scene.add(scene_clone2);
        this.scene.add(scene_clone3);
        this.scene.add(scene_clone4);
        this.scene.add(scene_clone5);
        this.scene.add(scene_clone6);
        this.scene.add(scene_clone7);
        this.scene.add(scene_clone8);
      });
      // 指示牌
      glbloader.load("/model/oil/card.gltf", (gltf) => {
        gltf.scene.traverse((child) => {
          if (child.name === "立方体") {
            child.position.set(0, 0, 0);
          }
        });
        const scene_clone1 = gltf.scene.clone();
        const scene_clone2 = gltf.scene.clone();

        scene_clone1.position.set(12, 1, 4.5);
        scene_clone1.rotation.set(0, Math.PI / 2, 0);
        this.scene.add(scene_clone1);

        scene_clone2.position.set(12, 1, -6.5);
        scene_clone2.rotation.set(0, Math.PI / 2, 0);
        this.scene.add(scene_clone2);
      });

      // // 车子
      // glbloader.load('/model/oil/milkTruck.glb', (gltf) => {
      //   gltf.scene.rotation.set(0, -Math.PI * 0.75, 0)
      //   gltf.scene.position.set(28, 0, 16)
      //   this.gui.add(gltf.scene.position, 'x', -20, 20, 1).name('车子x轴')
      //   this.gui.add(gltf.scene.position, 'z', -20, 20, 1).name('车子z轴')
      //   this.gui.add(gltf.scene.rotation, 'y', -Math.PI, Math.PI, 0.01).name('车子旋转')
      //   this.addAnimationButton(gltf)
      // })
      const wheels = [];
      const doors = [];
      let bodyMaterial, detailsMaterial, glassMaterial;

      // materials
      bodyMaterial = new THREE.MeshPhysicalMaterial({
        color: "#000",
        metalness: 1.0,
        roughness: 0.5,
        clearcoat: 1.0,
        clearcoatRoughness: 0.03,
        sheen: 0.5,
      });

      detailsMaterial = new THREE.MeshStandardMaterial({
        color: "#6c6c6c",
        metalness: 1.0,
        roughness: 0.5,
      });

      glassMaterial = new THREE.MeshPhysicalMaterial({
        color: "#6e6666",
        metalness: 0.25,
        roughness: 0,
        transmission: 1.0,
      });
      function carOpen() {
        for (let i = 0; i < doors.length; i++) {
          if (doors[i].name == "DLP" || doors[i].name == "DLZ") {
            setupTweenDoor({ z: 0 }, { z: Math.PI * 0.4 }, doors[i]);
          }
          if (doors[i].name == "DPP" || doors[i].name == "DPZ") {
            setupTweenDoor({ z: 0 }, { z: Math.PI * -0.4 }, doors[i]);
          }
        }
      }

      function carClose(scalar) {
        for (let i = 0; i < doors.length; i++) {
          if (doors[i].name == "DLP" || doors[i].name == "DLZ") {
            setupTweenDoor({ z: Math.PI * 0.4 }, { z: 0 }, doors[i]);
          }
          if (doors[i].name == "DPP" || doors[i].name == "DPZ") {
            setupTweenDoor({ z: Math.PI * -0.4 }, { z: 0 }, doors[i]);
          }
        }
      }
      function setupTweenDoor(source, target, mesh) {
        gsap.fromTo(
          mesh.rotation,
          {
            z: source.z,
          },
          {
            z: target.z,
            duration: 1,
          }
        );
        // const carTween = new Tween(source)
        //   .to(target, 1000)
        //   .easing(Tween.Easing.Quadratic.Out);
        // const carTween = new Tween(source)
        //   .to(target, 1000)
        //   .easing(Tween.Easing.Quadratic.Out);
        // carTween.onUpdate(function (that) {
        //   mesh.rotation.z = that.z;
        // });
        // carTween.start();
      }

      const states = ["红色", "蓝色", "黄色"];
      const emotes = ["打开车门", "关闭车门"];

      const params = {
        打开车门: carOpen,
        关闭车门: carClose,
      };
      const bc = {
        车身颜色: "#6e2121",
        opacity: 1,
      };
      const gc = {
        玻璃颜色: "#aaaaaa",
        opacity: 1,
      };
      const dc = {
        细节颜色: "#6c6c6c",
        opacity: 1,
      };

      this.gui.addColor(bc, "车身颜色").onChange(function () {
        bodyMaterial.color.set(bc["车身颜色"]);
      });
      this.gui.addColor(dc, "细节颜色").onChange(function () {
        detailsMaterial.color.set(dc["细节颜色"]);
      });
      this.gui.addColor(gc, "玻璃颜色").onChange(function () {
        glassMaterial.color.set(gc["玻璃颜色"]);
      });

      this.gui.add(params, emotes[0]);
      this.gui.add(params, emotes[1]);

      glbloader.load("/model/oil/benchi.glb", (gltf) => {
        const carModel = gltf.scene;
        const bodyModel1 = carModel.getObjectByName("磨砂框架");
        const bodyModel2 = carModel.getObjectByName("车门");
        // console.log(carModel)
        // 车身框架
        bodyModel1.traverse(function (value) {
          value.material = bodyMaterial;
        });
        // 车门包括细节
        bodyModel2.traverse(function (value) {
          // console.log(value.name)
          if (
            value.name.indexOf("_tex") > 0 ||
            value.name.indexOf("_gum") > 0 ||
            value.name.indexOf("_chr") > 0
          ) {
            value.material = detailsMaterial;
          } else if (value.name.indexOf("_skl") > 0) {
            value.material = glassMaterial;
          } else {
            value.material = bodyMaterial;
            if (
              value.name == "DLP" ||
              value.name == "DLZ" ||
              value.name == "DPP" ||
              value.name == "DPZ"
            ) {
              doors.push(value);
            }
          }
        });

        const glassModel = carModel.getObjectByName("车身");
        glassModel.traverse(function (value) {
          if (value.name.indexOf("_skl") > 0) {
            // 挡风玻璃
            value.material = glassMaterial;
          } else {
            value.material = detailsMaterial;
          }
        });

        const wheelModel = carModel.getObjectByName("车轮");
        wheelModel.traverse(function (value) {
          if (value.material) {
            value.material.roughness = 1;
          }
        });
        wheels.push(...wheelModel.children);
        carModel.rotation.set(0, Math.PI * 0.25, 0);
        carModel.scale.set(0.05, 0.05, 0.05);
        carModel.position.set(28, 0.38, 16);
        this.carModel = carModel;

        this.scene.add(this.carModel);
        this.addAnimationButton(this.carModel);
      });

      const pillarTexture = this.loader.load(
        "/model/oil/3d66Model-1625299-files-19.jpg"
      );
      // const pillarTexture = this.loader.load('/model/oil/法相.png')
      pillarTexture.wrapS = THREE.RepeatWrapping;
      pillarTexture.wrapT = THREE.RepeatWrapping;
      pillarTexture.encoding = THREE.sRGBEncoding;
      pillarTexture.flipY = false;
      pillarTexture.repeat.set(4, 10);
      const floorTexture = this.loader.load(
        "/model/oil/3d66Model-1625299-files-28.jpg"
      );
      // const floorTexture = this.loader.load('/model/oil/法相.png')
      floorTexture.wrapS = THREE.RepeatWrapping;
      floorTexture.wrapT = THREE.RepeatWrapping;
      floorTexture.encoding = THREE.sRGBEncoding;
      floorTexture.flipY = false;
      const floorTexture1 = floorTexture.clone();
      floorTexture.repeat.set(20, 20);
      floorTexture1.repeat.set(1, 15);

      glbloader.load("/model/oil/station.glb", (gltf) => {
        gltf.scene.traverse((child) => {
          console.log(child, "pannal");
          if (child.name.toLowerCase().includes("pillar")) {
            const material = new THREE.MeshStandardMaterial({
              map: pillarTexture,
              roughness: 0.5,
              metalness: 0.5,
              // specularMap: this.frontSTexture
            });
            child.material = material;
          } else if (child.name === "Obj3d66-1625299-11-387001") {
            const material = new THREE.MeshStandardMaterial({
              map: floorTexture,
              roughness: 0.5,
              metalness: 0.1,
              // specularMap: this.frontSTexture
            });
            child.material = material;
            child.material.needsUpdate = true;
            child.material.map.wrapS = THREE.RepeatWrapping;
            child.material.map.wrapT = THREE.RepeatWrapping;
          } else if (
            child.name === "Obj3d66-1625299-58-191001" ||
            child.name === "Obj3d66-1625299-58-191"
          ) {
            const material = new THREE.MeshStandardMaterial({
              map: floorTexture1,
              // specularMap: this.frontSTexture
            });
            child.material = material;
            child.material.needsUpdate = true;
            child.material.map.wrapS = THREE.RepeatWrapping;
            child.material.map.wrapT = THREE.RepeatWrapping;
          }
        });
        this.scene.add(gltf.scene);
      });
      // 站牌
      glbloader.load("/model/oil/card1.glb", (gltf) => {
        this.scene.add(gltf.scene);
        gltf.scene.position.set(12, 0, 17);
        gltf.scene.rotation.set(0, Math.PI / 3, 0);
      });

      const wallTexture = this.loader.load(
        "/model/oil/3d66Model-1625299-files-19.jpg"
      );
      wallTexture.wrapS = THREE.RepeatWrapping;
      wallTexture.wrapT = THREE.RepeatWrapping;
      wallTexture.encoding = THREE.sRGBEncoding;
      wallTexture.flipY = false;
      const ceilTexture = this.loader.load(
        "/model/oil/3d66Model-1625299-files-6.jpg"
      );
      ceilTexture.wrapS = THREE.RepeatWrapping;
      ceilTexture.wrapT = THREE.RepeatWrapping;
      ceilTexture.encoding = THREE.sRGBEncoding;
      ceilTexture.flipY = false;
      ceilTexture.repeat.set(2, 1);
      const wallTexture1 = wallTexture.clone();
      wallTexture.repeat.set(6, 10);
      wallTexture1.repeat.set(20, 10);
      // bannerTexture.offset.set(0, 10)
      /**
       * @description: 添加便利店
       * @return {*}
       */
      glbloader.load("/model/oil/shop.glb", (gltf) => {
        gltf.scene.traverse((child) => {
          if (child.name === "glass") {
            const glassMaterial = new THREE.MeshPhysicalMaterial({
              color: 0xffffff,
              transparent: true, // 透明度设置为 true
              opacity: 0.5, // 设置透明度
              roughness: 0,
              metalness: 0,
              envMapIntensity: 1,
              transmission: 0.95, // 折射度，表示光线经过材料时的衰减程度
              clearcoat: 1,
              clearcoatRoughness: 0,
              refractionRatio: 1.5, // 折射率，控制光的折射程度
            });
            child.material = glassMaterial;
            child.material.needsUpdate = true;
          } else if (child.name.toLowerCase().includes("wall")) {
            if (child.name.toLowerCase() === "wall001") {
              const material = new THREE.MeshStandardMaterial({
                map: ceilTexture,
                roughness: 0.5,
                metalness: 0.5,
                // specularMap: this.frontSTexture
              });
              child.material = material;
            } else if (
              child.name.toLowerCase() === "wall002" ||
              child.name.toLowerCase() === "wall003"
            ) {
              const material1 = new THREE.MeshStandardMaterial({
                map: wallTexture,
                side: THREE.FrontSide,
                roughness: 0.5,
                overdraw: true,
                metalness: 0.5,
                // specularMap: this.frontSTexture
              });
              const material2 = new THREE.MeshStandardMaterial({
                map: ceilTexture,
                side: THREE.BackSide,
                roughness: 0.5,
                overdraw: true,
                metalness: 0.5,
                // specularMap: this.frontSTexture
              });
              child.material = material1;
            } else {
              const material = new THREE.MeshStandardMaterial({
                map: wallTexture1,
                roughness: 0.5,
                metalness: 0.5,
                // specularMap: this.frontSTexture
              });
              child.material = material;
            }
          }
        });

        this.scene.add(gltf.scene);
        // gltf.scene.scale.set(0.5, 0.5, 0.5)
        gltf.scene.position.set(3, 0, -20);
      });

      const speedTexture = this.loader.load(
        "/model/oil/3d66Model-1625299-files-25.jpg"
      );
      // const speedTexture = this.loader.load('/model/oil/法相.png')
      speedTexture.wrapS = THREE.RepeatWrapping;
      speedTexture.wrapT = THREE.RepeatWrapping;
      speedTexture.encoding = THREE.sRGBEncoding;
      speedTexture.flipY = false;
      // 减速带
      glbloader.load("/model/oil/speed.glb", (gltf) => {
        gltf.scene.traverse((child) => {
          if (child.isMesh) {
            child.material = new THREE.MeshStandardMaterial({
              map: speedTexture,
              roughness: 0.5,
              metalness: 0.5,
            });
          }
        });
        const scene_clone1 = gltf.scene.clone();
        const scene_clone2 = gltf.scene.clone();
        scene_clone1.position.set(25, 0, 12);
        scene_clone1.rotation.set(0, Math.PI / 4, 0);
        this.scene.add(scene_clone1);

        scene_clone2.position.set(-20, 0, 12);
        scene_clone2.rotation.set(0, -Math.PI / 4, 0);
        this.scene.add(scene_clone2);

        // this.scene.add(gltf.scene)
        // gltf.scene.position.set(25, 0, 12)
        // gltf.scene.rotation.set(0, Math.PI / 4, 0)
      });
    },
    initControls() {
      this.controls = new OrbitControls(camera, this.renderer.domElement);

      this.controls.update();
    },
    render() {
      requestAnimationFrame(this.render);
      this.stats.update(); // 3.0、更新性能插件
      const elapsedTime = this.clock.getElapsedTime();
      const delta = elapsedTime - this.previousTime;
      this.previousTime = elapsedTime;
      this.renderer.render(this.scene, camera);
      // if (this.isNeedLookAt) {
      //   if (this.carPath) {
      //     let point = this.carPath.getPoint(this.progress);
      //     let point2 = this.carPath.getPoint(this.progress + 0.1);
      //     if (point) {
      //       camera.position.set(point.x, point.y + 2, point.z);

      //       camera.updateProjectionMatrix();
      //     }
          
      //     // 处理摄像机视角
      //     console.log(point2);
      //     // this.controls.target.set(point2);
      //     // this.controls.update();
      //   }
      // }
      // this.mixer && this.mixer.update(delta);
      if (this.progress > 0.45 && !this.centerAnimation) {
        return;
      }
      if (this.progress > 1.0 || !this.beginAnimation) {
        return; //停留在管道末端,否则会一直跑到起点 循环再跑
      }
      this.progress += 0.005;
      console.log(this.progress && this.beginAnimation);
      if (this.carPath) {
        let point = this.carPath.getPoint(this.progress);
        if (point && point.x) {
          this.carModel.position.set(point.x, point.y, point.z);
          this.carModel.lookAt(this.carPath.getPoint(this.progress - 0.005));
        }
      }

      this.controls.update();
    },
    addAnimationButton(carModel) {
      const tl = gsap.timeline();
      let carModel_clone = carModel;

      const obj = {
        add: () => {
          // this.mixer = new THREE.AnimationMixer(carModel_clone);
          // this.mixer.clipAction(carModel.animations[0]).play();
          tl.add([
            gsap.to(carModel_clone.position, {
              duration: 1.5,
              ease: "none",
              x: "21.5",
              z: "9",
            }),
            gsap.to(carModel_clone.rotation, {
              duration: 1.5,
              ease: "none",
              y: Math.PI * 0.25,
            }),
          ]);
          tl.add([
            gsap.to(carModel_clone.position, {
              duration: 1.5,
              ease: "none",
              x: "18",
              z: "3",
            }),
            gsap.to(carModel_clone.rotation, {
              duration: 1.5,
              ease: "none",
              y: Math.PI * 0.5,
              onUpdate: (value) => {
                console.log(value, "value");
                console.log(
                  carModel_clone.rotation.y,
                  "carModel_clone.rotation.y"
                );
              },
            }),
          ]);
          tl.add([
            gsap.to(carModel_clone.position, {
              duration: 1.5,
              ease: "none",
              x: "8",
              z: "1",
            }),
          ]);
        },
        finish: () => {
          tl.add([
            gsap.to(carModel_clone.position, {
              duration: 2.5,
              ease: "none",
              x: "-8",
              z: "1",
            }),
          ]);
          const animations = [
            gsap.to(carModel_clone.position, {
              duration: 1.5,
              ease: "none",
              x: "-15",
              z: "1",
            }),
            gsap.to(carModel_clone.rotation, {
              duration: 1.5,
              ease: "none",
              y: Math.PI * 0.75,
            }),
          ];
          tl.add(animations);
          tl.add([
            gsap.to(carModel_clone.position, {
              duration: 1.5,
              ease: "none",
              x: "-21.5",
              z: "9",
              onComplete: () => {
                this.scene.remove(carModel_clone);
                carModel_clone = carModel.clone();
                this.carModel = carModel_clone;
                // if (this.isNeedLookAt) {
                //   this.isNeedLookAt = false
                //   this.controls.target.set(0, 0, 0)
                //   camera.position.set(0, 20, 70)
                //   camera.updateProjectionMatrix()
                // }
              },
            }),
            // gsap.to(
            //   this.controls.target,
            //   {
            //     duration: 1.5,
            //     ease: 'none',
            //     x: '-45',
            //     y: '0',
            //     z: '20',
            //     onComplete: () => {
            //       if (this.isNeedLookAt) {
            //         this.isNeedLookAt = false
            //         this.controls.target.set(0, 0, 0)
            //         camera.position.set(0, 20, 70)
            //         camera.updateProjectionMatrix()
            //       }
            //     }
            //   }
            // )
          ]);
        },
        loockAt: () => {
          this.isNeedLookAt = true;
          console.log(this.isNeedLookAt, "loockAt");
          // camera.position.set(this.carModel.position.x+10, this.carModel.position.y + 10, this.carModel.position.z+10)
          // camera.lookAt(this.carModel.position)
          // console.log(this.carModel.position,'carModel.position')
          // this.controls.target.set(this.carModel.position)
          // camera.updateProjectionMatrix()
        },
      };
      this.gui.add(obj, "add").name("加油车辆");
      this.gui.add(obj, "finish").name("加油结束");
      this.gui.add(obj, "loockAt").name("第一视角");
    },
    updateAllMeterial() {},
    animate() {},
  },
};
</script>

<style lang="less" scoped>
* {
  margin: 0;
  padding: 0;
}
</style>
