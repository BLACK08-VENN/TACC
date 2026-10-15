import assert from 'node:assert/strict';
import {periodicFabricPixels} from '../textile-texture.js';
const w=64,h=32,p=new Uint8ClampedArray(w*h*4);
for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;for(let c=0;c<3;c++)p[i+c]=90+70*x/(w-1)+30*y/(h-1)+12*Math.sin(x*2*Math.PI/8);p[i+3]=255;}
function seam(a){let sum=0;for(let y=0;y<h;y++)sum+=Math.abs(a[y*w*4]-a[(y*w+w-1)*4]);return sum/h;}
const fixed=periodicFabricPixels(p,w,h);assert(seam(fixed)<seam(p)*.15);
const plain=new Uint8ClampedArray(w*h*4).fill(127);assert.deepEqual(periodicFabricPixels(plain,w,h),plain);
for(let i=3;i<p.length;i+=4)assert.equal(fixed[i],255);
console.log('Texture seam, uniform fabric, and alpha preservation checks passed.');
