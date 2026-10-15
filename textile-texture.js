// Remove the low-frequency discontinuity between photographed swatch edges.
// Periodic-plus-smooth decomposition preserves printed detail without mirrored motifs.
function fft(real, imag, inverse) {
  const n=real.length;
  for(let i=1,j=0;i<n;i++){let bit=n>>1;for(;j&bit;bit>>=1)j^=bit;j^=bit;if(i<j){[real[i],real[j]]=[real[j],real[i]];[imag[i],imag[j]]=[imag[j],imag[i]];}}
  for(let size=2;size<=n;size*=2){const angle=(inverse?2:-2)*Math.PI/size,cr=Math.cos(angle),ci=Math.sin(angle);for(let start=0;start<n;start+=size){let wr=1,wi=0;for(let k=0;k<size/2;k++){const a=start+k,b=a+size/2,tr=wr*real[b]-wi*imag[b],ti=wr*imag[b]+wi*real[b];real[b]=real[a]-tr;imag[b]=imag[a]-ti;real[a]+=tr;imag[a]+=ti;const next=wr*cr-wi*ci;wi=wr*ci+wi*cr;wr=next;}}}
  if(inverse)for(let i=0;i<n;i++){real[i]/=n;imag[i]/=n;}
}
function fft2(real,imag,w,h,inverse){
  const rr=new Float64Array(w),ri=new Float64Array(w),cr=new Float64Array(h),ci=new Float64Array(h);
  for(let y=0;y<h;y++){for(let x=0;x<w;x++){rr[x]=real[y*w+x];ri[x]=imag[y*w+x];}fft(rr,ri,inverse);for(let x=0;x<w;x++){real[y*w+x]=rr[x];imag[y*w+x]=ri[x];}}
  for(let x=0;x<w;x++){for(let y=0;y<h;y++){cr[y]=real[y*w+x];ci[y]=imag[y*w+x];}fft(cr,ci,inverse);for(let y=0;y<h;y++){real[y*w+x]=cr[y];imag[y*w+x]=ci[y];}}
}
export function periodicFabricPixels(data,w,h){
  if(w<2||h<2||(w&(w-1))||(h&(h-1)))throw new Error('Texture dimensions must be powers of two');
  const result=new Uint8ClampedArray(data),real=new Float64Array(w*h),imag=new Float64Array(w*h);
  const denominator=new Float64Array(w*h);
  for(let y=0;y<h;y++)for(let x=0;x<w;x++)denominator[y*w+x]=4-2*Math.cos(2*Math.PI*x/w)-2*Math.cos(2*Math.PI*y/h);
  for(let channel=0;channel<3;channel++){
    real.fill(0);imag.fill(0);
    for(let x=0;x<w;x++){const d=data[x*4+channel]-data[((h-1)*w+x)*4+channel];real[x]+=d;real[(h-1)*w+x]-=d;}
    for(let y=0;y<h;y++){const d=data[y*w*4+channel]-data[(y*w+w-1)*4+channel];real[y*w]+=d;real[y*w+w-1]-=d;}
    fft2(real,imag,w,h,false);
    real[0]=imag[0]=0;
    for(let i=1;i<w*h;i++){real[i]/=denominator[i];imag[i]/=denominator[i];}
    fft2(real,imag,w,h,true);
    for(let i=0;i<w*h;i++)result[i*4+channel]=data[i*4+channel]-real[i];
  }
  return result;
}
export function prepareFabricImage(image){
  const naturalW=image.naturalWidth||image.width,naturalH=image.naturalHeight||image.height;
  const power=n=>2**Math.round(Math.log2(Math.max(32,Math.min(512,n))));
  const canvas=document.createElement('canvas');canvas.width=power(naturalW);canvas.height=power(naturalH);
  const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(image,0,0,canvas.width,canvas.height);
  const pixels=ctx.getImageData(0,0,canvas.width,canvas.height);
  pixels.data.set(periodicFabricPixels(pixels.data,canvas.width,canvas.height));ctx.putImageData(pixels,0,0);return canvas;
}
