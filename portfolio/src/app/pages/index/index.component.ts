import {Component, OnInit} from '@angular/core';
import * as THREE from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {GLTFSchema, VRM, VRMSchema} from '@pixiv/three-vrm';
import {GLTF} from "three/examples/jsm/loaders/GLTFLoader";
import {Observable} from "rxjs";
import {fromPromise} from "rxjs/internal-compatibility";
import {Mesh, PerspectiveCamera, Scene, WebGLRenderer} from "three";


@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.css']
})
export class IndexComponent implements OnInit {

  canvasWidth: number | null = null;
  canvasHeight: number | null = null;
  canvasStyle: string = "";

  renderer: WebGLRenderer = null;
  camera: PerspectiveCamera = null;
  vrm: VRM = null;

  constructor() {
  }

  ngOnInit() {
    // register canvas resize function
    window.onresize = () => this.resizeCanvas();
    fromPromise(this.initThree()).subscribe(_ => this.resizeCanvas());

  }

  async initThree() {
    const wrapper = document.getElementById('wrapper')
    this.renderer = new THREE.WebGLRenderer({
      canvas: document.getElementById("canvas") as HTMLCanvasElement,
      //alpha: true
    })
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(wrapper.offsetWidth, wrapper.offsetHeight);
    // camera
    this.camera = new THREE.PerspectiveCamera(30.0, wrapper.offsetWidth / wrapper.offsetHeight, 0.1, 20.0);
    this.camera.position.set(1.2, 0.7, 2.0);
    this.camera.rotation.y = 40 * Math.PI / 180;
    //this.camera.position.set(0, 0.7, 2.0);
    const scene = new THREE.Scene();
    // light
    const light = new THREE.DirectionalLight(0xffffff);
    light.position.set(1.0, 1.0, 1.0).normalize();
    scene.add(light);
    // vrm
    this.vrm = await this.loadVRM('assets/409838758629660075.vrm');
    this.vrm.humanoid.getBoneNode(VRMSchema.HumanoidBoneName.Hips).rotation.y = Math.PI;

    this.vrm.humanoid.getBoneNode(VRMSchema.HumanoidBoneName.RightShoulder).rotation.x = 0.5;
    this.vrm.humanoid.getBoneNode(VRMSchema.HumanoidBoneName.RightShoulder).rotation.y = 0.3;
    this.vrm.humanoid.getBoneNode(VRMSchema.HumanoidBoneName.RightShoulder).rotation.z = -0.8;
    this.vrm.humanoid.getBoneNode(VRMSchema.HumanoidBoneName.RightLowerArm).rotation.x = -30 * Math.PI / 180;
    this.vrm.humanoid.getBoneNode(VRMSchema.HumanoidBoneName.RightLowerArm).rotation.y = 80 * Math.PI / 180;
    this.vrm.humanoid.getBoneNode(VRMSchema.HumanoidBoneName.RightLowerArm).rotation.z = 0.5;

    this.vrm.humanoid.getBoneNode(VRMSchema.HumanoidBoneName.LeftShoulder).rotation.x = 0.5;
    this.vrm.humanoid.getBoneNode(VRMSchema.HumanoidBoneName.LeftShoulder).rotation.y = -0.3;
    this.vrm.humanoid.getBoneNode(VRMSchema.HumanoidBoneName.LeftShoulder).rotation.z = 0.8;
    this.vrm.humanoid.getBoneNode(VRMSchema.HumanoidBoneName.LeftLowerArm).rotation.x = -30 * Math.PI / 180;
    this.vrm.humanoid.getBoneNode(VRMSchema.HumanoidBoneName.LeftLowerArm).rotation.y = -80 * Math.PI / 180;
    this.vrm.humanoid.getBoneNode(VRMSchema.HumanoidBoneName.LeftLowerArm).rotation.z = -0.5;

    this.vrm.humanoid.getBoneNode(VRMSchema.HumanoidBoneName.Head).rotation.x = 0.2;

    // vrm animation
    const currentMixer = new THREE.AnimationMixer(this.vrm.scene);
    const quatA = new THREE.Quaternion( 0.0, 0.0, 0.0, 1.0 );
    quatA.setFromEuler( new THREE.Euler( -0.02 * Math.PI, 0.0, -0.03 * Math.PI ) );
    const quatB = new THREE.Quaternion( 0.0, 0.0, 0.0, 1.0 );
    quatB.setFromEuler( new THREE.Euler( -0.02 * Math.PI, 0.0, 0.03 * Math.PI ) );

    const armTrack = new THREE.QuaternionKeyframeTrack(
      this.vrm.humanoid.getBoneNode( VRMSchema.HumanoidBoneName.Chest ).name + '.quaternion', // name
      [ 0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6 ], // times
      [ ...quatA.toArray(), ...quatB.toArray(), ...quatA.toArray(), ...quatB.toArray(),...quatA.toArray(), ...quatB.toArray() ,...quatA.toArray()] // values
    );
    const headTrack = new THREE.QuaternionKeyframeTrack(
      this.vrm.humanoid.getBoneNode( VRMSchema.HumanoidBoneName.Head ).name + '.quaternion', // name
      [ 0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6 ], // times
      [ ...quatA.toArray(), ...quatB.toArray(), ...quatA.toArray(), ...quatB.toArray(),...quatA.toArray(), ...quatB.toArray() ,...quatA.toArray()] // values
    );
    const blinkTrack = new THREE.NumberKeyframeTrack(
      this.vrm.blendShapeProxy.getBlendShapeTrackName(VRMSchema.BlendShapePresetName.Blink), // name
      [0.0, 0.02, 0.03, 0.04, 0.05, 0.06], // times
      [0.0, 1.0, 0.0, 0.0, 1.0, 0.0] // values
    );
    const clip = new THREE.AnimationClip('blink', 0.6, [armTrack,headTrack, blinkTrack]);
    const action = currentMixer.clipAction(clip);
    action.play();
    scene.add(this.vrm.scene);


    // cubes
    const geo = new THREE.BoxGeometry(0.1, 0.1, 0.1);
    const material = new THREE.MeshLambertMaterial({
      color: "#ffffff",
    });
    const cube = new THREE.Mesh(geo, material);
    cube.position.set(0, 0.87, 0.22)
    scene.add(cube);

    const menus = this.createMenu(["a", "b", "c"], scene);

    const clock = new THREE.Clock();
    const tick = () => {
      requestAnimationFrame(tick)

      cube.rotation.x = cube.rotation.x + 0.01;
      cube.rotation.y = cube.rotation.y + 0.01;
      cube.rotation.z = cube.rotation.z + 0.01;

      menus.forEach(m => {
        m.rotation.x = m.rotation.x + 0.02;
        m.rotation.y = m.rotation.y + 0.02;
      });

      this.vrm.update(clock.getDelta());
      currentMixer.update(clock.getDelta());

      this.renderer.render(scene, this.camera);
    }
    tick();
  }

  createMenu(menus: Array<string>, scene:Scene): Array<Mesh> {
    const meshs = []
    const menuGeo = new THREE.BoxGeometry(0.02, 0.02, 0.02);
    menus.forEach((_, i) => {
      const material = new THREE.MeshLambertMaterial({
        color: "#ffffff",
      });
      const m = new THREE.Mesh(menuGeo, material);
      meshs.push(m);
      m.position.set(0, (i + 1) * 0.3 + 0.1, 1.0);
      scene.add(m);
    })
    return meshs
  }

  private loadGLTF(filePath: string): Promise<GLTF> {
    const loader = new GLTFLoader();
    return new Promise<GLTF>((resolve, reject) => loader.load(filePath,
      g => resolve(g),
      p => console.log('Loading model...', 100.0 * (p.loaded / p.total), '%'),
      e => reject(e)
      )
    );
  }

  private async loadVRM(filePath: string): Promise<VRM> {
    try {
      const gltf = await this.loadGLTF(filePath);
      return await VRM.from(gltf);
    } catch (e) {
      console.log(e)
    }
  }

  resizeCanvas() {
    const wrapper = document.getElementById('wrapper')
    this.canvasWidth = wrapper.offsetWidth * window.devicePixelRatio;
    this.canvasHeight = wrapper.offsetHeight * window.devicePixelRatio;
    if (this.renderer) {
      this.renderer.setPixelRatio(window.devicePixelRatio);
      this.renderer.setSize(wrapper.offsetWidth, wrapper.offsetHeight);
    }
    if (this.camera) {
      this.camera.aspect = wrapper.offsetWidth / wrapper.offsetHeight;
      this.camera.updateProjectionMatrix();
    }
  }
}
