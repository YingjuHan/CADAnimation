import { Injectable } from '@angular/core';
import THREE = require('three');
import { SceneUtilsService } from '../utils/scene.utils.service';
import * as AnimationModel from 'src/app/shared/animation.model';
import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer';

@Injectable({
  providedIn: 'root'
})
export class SceneManagerService {

  constructor(public SceneUtilsService: SceneUtilsService) { }


  AddDirectionalLight(): THREE.DirectionalLight {
    let light = new THREE.DirectionalLight(0xffffff, 2.2);
    light.name = light.type + `_${this.SceneUtilsService.lightGroup.children.length}`;
    let lightHelper = new THREE.DirectionalLightHelper(light, 10, light.color);
    lightHelper.matrixWorld = light.matrixWorld;
    light.add(lightHelper);
    let cameraHelper = new THREE.CameraHelper(light.shadow.camera);
    light.add(cameraHelper);
    cameraHelper.matrixWorld = light.shadow.camera.matrixWorld;
    this.SceneUtilsService.lightGroup.add(light);
    this.SceneUtilsService.Select(light, false);
    let track = AnimationModel.FindKeyframeTrack(this.SceneUtilsService.AnimationService.timeLine, this.SceneUtilsService.lightGroup.name);
    this.SceneUtilsService.AnimationService.CreateTreeViewElement(light, track);
    AnimationModel.GetArrayTimeLine(this.SceneUtilsService.AnimationService.timeLine);
    return light;
  }
  AddPointLight(): THREE.PointLight {
    let light = new THREE.PointLight(0xffffff, 2.2, 10000);
    light.name = light.type + `_${this.SceneUtilsService.lightGroup.children.length}`;
    let lightHelper = new THREE.PointLightHelper(light, 5, light.color);
    lightHelper.matrixWorld = light.matrixWorld;
    light.add(lightHelper);
    light.shadow.bias = - 0.005;
    this.SceneUtilsService.lightGroup.add(light);
    this.SceneUtilsService.Select(light, false);
    let track = AnimationModel.FindKeyframeTrack(this.SceneUtilsService.AnimationService.timeLine, this.SceneUtilsService.lightGroup.name);
    this.SceneUtilsService.AnimationService.CreateTreeViewElement(light, track);
    AnimationModel.GetArrayTimeLine(this.SceneUtilsService.AnimationService.timeLine);
    return light;
  }

  AddAnnotation(): CSS2DObject {
    let annDiv = this.SceneUtilsService.angRenderer.createElement('div');
    this.SceneUtilsService.angRenderer.addClass(annDiv, "annotation-container");
    annDiv.innerText = "Text";
    let annotation = new CSS2DObject(annDiv);
    annotation.type = "Annotation";
    annotation.name = `Annotation_${this.SceneUtilsService.annotationGroup.children.length}`;
    this.SceneUtilsService.annotationGroup.add(annotation);
    annotation.position.set(10, -10, 30);
    let pts = [];
    annotation.updateMatrixWorld(true);
    pts.push(annotation.worldToLocal(new THREE.Vector3(0)));
    pts.push(new THREE.Vector3(0));
    let geom = new THREE.BufferGeometry().setFromPoints(pts);
    geom.userData = { target: new THREE.Vector3(0) };
    let mat = new THREE.LineBasicMaterial({ color: 0x000000 });
    let line = new THREE.Line(geom, mat);
    line.type = "Ignore";
    line.onAfterRender = function (renderer, scene, camera, geometry) {
      this.updateMatrixWorld(true);
      let vec!: THREE.Vector3;
      if ((geometry.userData['target'].isVector3 == true)) {
        vec = this.worldToLocal(geometry.userData['target'].clone());
      }
      else {
        let pos = new THREE.Vector3().setFromMatrixPosition(geometry.userData['target'].matrixWorld);
        vec = this.worldToLocal(pos);
      }
      let points = [];
      points.push(vec);
      points.push(new THREE.Vector3(0));
      geometry.setFromPoints(points);
      geometry.attributes['position'].needsUpdate = true;
    }
    annotation.add(line);
    this.SceneUtilsService.Select(annotation, false);
    let track = AnimationModel.FindKeyframeTrack(this.SceneUtilsService.AnimationService.timeLine, this.SceneUtilsService.annotationGroup.name);
    this.SceneUtilsService.AnimationService.CreateTreeViewElement(annotation, track);
    AnimationModel.GetArrayTimeLine(this.SceneUtilsService.AnimationService.timeLine);
    return annotation;
  }

  AddAxis(): THREE.Line {
    let pt = [new THREE.Vector3(0), new THREE.Vector3(0, 0, 10)];
    let geom = new THREE.BufferGeometry().setFromPoints(pt);
    let mat = new THREE.LineBasicMaterial({ color: 0x0000FF });
    let line = new THREE.Line(geom, mat);
    this.SceneUtilsService.scene.add(line);
    this.SceneUtilsService.axisGroup.push(line);
    line.name = `Axis_${this.SceneUtilsService.axisGroup.length}`
    line.type = "Axis";
    this.SceneUtilsService.Select(line, false);
    return line
  }

  DeleteObject(obj: any) {
    if (obj != undefined) {
      if (obj.type.includes("Light")) {
        let light = obj as THREE.Light;
        light.removeFromParent();
        light.dispose();
        let track = this.SceneUtilsService.AnimationService.timeLine.tracks.find(item => item.name == light.name);
        if (track != undefined)
          this.SceneUtilsService.AnimationService.DeleteTrack(track);
        let i = this.SceneUtilsService.AnimationService.mixers.findIndex(mixer => mixer.getRoot() == light);
        if (i != -1)
          this.SceneUtilsService.AnimationService.mixers.splice(i, 1);
      }
      else if (obj.type == "Annotation") {
        let css2d = obj as CSS2DObject;
        css2d.removeFromParent();
        (css2d.children[0] as THREE.Line).geometry.dispose();
        (css2d.children[0] as any).material.dispose();
        css2d.clear();
        let track = this.SceneUtilsService.AnimationService.timeLine.tracks.find(item => item.name == css2d.name);
        if (track != undefined)
          this.SceneUtilsService.AnimationService.DeleteTrack(track);
        let i = this.SceneUtilsService.AnimationService.mixers.findIndex(mixer => mixer.getRoot() == css2d);
        if (i != -1)
          this.SceneUtilsService.AnimationService.mixers.splice(i, 1);
      }
    }
  }
}
