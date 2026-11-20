import {Box3,Camera,Mesh,Object3D,Raycaster,Vector3,type Intersection} from 'three';
export type CameraSubject={object:Object3D;height:number;offsetY?:number};
/** Only high scenery fades; low barriers, floors and interactive desks stay solid. */
export function cameraBlockers(camera:Camera,meshes:Mesh[],subjects:CameraSubject[]):Set<Mesh>{
 const candidates:Mesh[]=[],box=new Box3();
 for(const mesh of meshes){let visible=true;for(let p:Object3D|null=mesh;p;p=p.parent)if(!p.visible){visible=false;break}if(!visible)continue;
  if(!mesh.geometry.boundingBox)mesh.geometry.computeBoundingBox();if(!mesh.geometry.boundingBox)continue;
  box.copy(mesh.geometry.boundingBox).applyMatrix4(mesh.matrixWorld);if(box.max.y>3.2)candidates.push(mesh);
 }
 const blocked=new Set<Mesh>(),ray=new Raycaster(),origin=camera.getWorldPosition(new Vector3()),right=new Vector3().setFromMatrixColumn(camera.matrixWorld,0).normalize(),center=new Vector3(),target=new Vector3(),projected=new Vector3(),direction=new Vector3(),hits:Intersection[]=[];
 for(const subject of subjects){if(!subject.object.visible)continue;subject.object.getWorldPosition(center);center.y+=subject.offsetY??0;projected.copy(center).addScaledVector(new Vector3(0,1,0),subject.height*.5).project(camera);if(Math.abs(projected.x)>1.15||Math.abs(projected.y)>1.15||projected.z>1||projected.z< -1)continue;
  for(const [height,side] of [[.18,0],[.52,0],[.86,0],[.98,0],[1.1,0],[.52,-.48],[.52,.48],[.98,-.24],[.98,.24]]){target.copy(center);target.y+=subject.height*height;target.addScaledVector(right,side);direction.copy(target).sub(origin);ray.set(origin,direction.normalize());ray.near=.05;ray.far=Math.max(.05,origin.distanceTo(target)-.28);hits.length=0;ray.intersectObjects(candidates,false,hits);for(const hit of hits)blocked.add(hit.object as Mesh)}
 }
 return blocked;
}
