import {Component, OnInit} from '@angular/core';
import * as THREE from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {VRM} from '@pixiv/three-vrm';


@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.css']
})
export class IndexComponent implements OnInit {

  canvasWidth: number | null = null;
  canvasHeight: number | null = null;
  canvasStyle: string = "";

  constructor() {
  }

  ngOnInit() {
    // register canvas resize function
    window.onresize = () => this.resizeCanvas();
    this.resizeCanvas();

  }

  initThree() {
    const scene = new THREE.Scene();
    const loader = new GLTFLoader();
    loader.load('assets/1113445222725952921.vrm', (gltf) => {})
  }

  resizeCanvas() {
    const wrapper = document.getElementById('wrapper')
    this.canvasWidth = wrapper.offsetWidth * window.devicePixelRatio;
    this.canvasHeight = wrapper.offsetHeight * window.devicePixelRatio;
  }
}
