import * as THREE from 'three';
export function curtainSettings(raw={},roomWidth=6,roomHeight=2.8){
const clamp=THREE.MathUtils.clamp,rodWidth=clamp(Number(raw.rodWidth)||2.7,.8,Math.min(4.5,roomWidth-.3)),drop=clamp(Number(raw.drop)||2.5,.5,roomHeight-.20),metres=clamp(Number(raw.metres)||rodWidth*2,rodWidth,rodWidth*4),open=clamp(Number(raw.open??0),0,100),patternWidth=clamp(Number(raw.patternWidth)||.45,.10,1.5);
return {rodWidth,drop,metres,open,patternWidth,fullness:metres/rodWidth,folds:Math.max(3,Math.min(32,Math.round(metres/2/.25)))};
}
function arcLength(span,amplitude,folds,segments){let length=0;for(let i=1;i<=segments;i++){const dz=amplitude*(Math.cos(i/segments*Math.PI*2*folds)-Math.cos((i-1)/segments*Math.PI*2*folds));length+=Math.hypot(span/segments,dz)}return length}
export function foldAmplitude(span,materialWidth,folds,segments){let lo=0,hi=materialWidth/(2*folds);for(let i=0;i<24;i++){const mid=(lo+hi)/2;if(arcLength(span,mid,folds,segments)>materialWidth)hi=mid;else lo=mid}return (lo+hi)/2}
export function createCurtainPanels(settings,makeMaterial){
const c=settings,g=new THREE.Group(),flat=c.metres/2,closed=c.rodWidth/2,stack=Math.min(closed*.48,Math.max(.12,flat*.065)),span=THREE.MathUtils.lerp(closed,stack,c.open/100),nx=Math.min(320,Math.max(96,c.folds*12)),ny=64,amplitude=foldAmplitude(span,flat,c.folds,nx);
const metal=new THREE.MeshStandardMaterial({color:'#a99a85',metalness:.8,roughness:.27});const rod=new THREE.Mesh(new THREE.CylinderGeometry(.014,.014,c.rodWidth+.20,24),metal);rod.rotation.z=Math.PI/2;rod.position.set(0,c.drop+.06,.17);rod.castShadow=true;g.add(rod);
for(const x of [-c.rodWidth/2-.12,c.rodWidth/2+.12]){const cap=new THREE.Mesh(new THREE.SphereGeometry(.027,12,8),metal);cap.position.set(x,c.drop+.06,.17);g.add(cap)}
for(const side of [-1,1]){
const center=side*(c.rodWidth/2-span/2),positions=[],uvs=[],indices=[],colors=[];
for(let iy=0;iy<=ny;iy++){const t=iy/ny;for(let ix=0;ix<=nx;ix++){const u=ix/nx,x=center+(u-.5)*span,headingSag=.006*Math.sin(u*c.folds*Math.PI)**2*(1-t),hemRipple=.006*Math.sin(u*6*Math.PI)*t**6,phase=u*c.folds*Math.PI*2+.08*Math.sin(t*Math.PI)*Math.sin(u*7+side),z=.18+amplitude*Math.cos(phase)*(1+.12*Math.sin(t*Math.PI))+.008*Math.sin(u*4*Math.PI+t*2)*t*t;positions.push(x,c.drop*(1-t)-headingSag+hemRipple,z);uvs.push((side<0?0:flat)+u*flat,c.drop*(1-t));const occlusion=1-.12*(.5-.5*Math.cos(phase))*(1-.2*t);colors.push(occlusion,occlusion,occlusion)}}
// UV distance follows the actual folded surface, preserving motifs through gathers.
for(let iy=0;iy<=ny;iy++){const lengths=[0];let total=0;for(let ix=1;ix<=nx;ix++){const a=(iy*(nx+1)+ix-1)*3,b=a+3;total+=Math.hypot(positions[b]-positions[a],positions[b+1]-positions[a+1],positions[b+2]-positions[a+2]);lengths.push(total)}for(let ix=0;ix<=nx;ix++)uvs[(iy*(nx+1)+ix)*2]=(side<0?0:flat)+lengths[ix]/total*flat}
for(let iy=0;iy<ny;iy++)for(let ix=0;ix<nx;ix++){const a=iy*(nx+1)+ix,b=a+nx+1;indices.push(a,b,a+1,a+1,b,b+1)}
const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));geometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));geometry.setIndex(indices);geometry.computeVertexNormals();geometry.computeBoundingBox();const material=makeMaterial(),mesh=new THREE.Mesh(geometry,material);mesh.castShadow=!material.transparent;mesh.receiveShadow=true;mesh.userData.curtainPanel=true;mesh.userData.materialWidth=flat;mesh.userData.projectedWidth=span;mesh.userData.foldAmplitude=amplitude;mesh.userData.folds=c.folds;g.add(mesh);
// Narrow hems follow the cloth surface rather than cutting across its folds.
for(const row of [0,ny]){const points=[];for(let ix=0;ix<=nx;ix++){const k=(row*(nx+1)+ix)*3;points.push(new THREE.Vector3(positions[k],positions[k+1],positions[k+2]+.002))}const hem=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points),nx,.0025,4,false),makeMaterial());hem.castShadow=false;g.add(hem)}
for(let j=0;j<=c.folds;j++){const ring=new THREE.Mesh(new THREE.TorusGeometry(.024,.0035,6,12),metal);ring.rotation.y=Math.PI/2;ring.position.set(center+(j/c.folds-.5)*span,c.drop+.04,.17);g.add(ring)}
}
g.userData.curtainMetrics={metres:c.metres,fullness:c.fullness,foldsPerPanel:c.folds,spanPerPanel:span,segments:nx*ny*2};return g;
}
