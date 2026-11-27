export const canvas=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c;};
export function release(c){if(c){c.width=1;c.height=1;}}
export function copy(c,r={x:0,y:0,w:c.width,h:c.height}){const out=canvas(r.w,r.h);out.getContext('2d').drawImage(c,r.x,r.y,r.w,r.h,0,0,r.w,r.h);return out;}
export function rotated(c,deg){const a=deg*Math.PI/180,w=Math.ceil(Math.abs(c.width*Math.cos(a))+Math.abs(c.height*Math.sin(a))-1e-7),h=Math.ceil(Math.abs(c.width*Math.sin(a))+Math.abs(c.height*Math.cos(a))-1e-7);if(w*h>26000000)throw Error('Rotated image exceeds memory limit.');const out=canvas(w,h),ctx=out.getContext('2d');ctx.fillStyle='white';ctx.fillRect(0,0,w,h);ctx.translate(w/2,h/2);ctx.rotate(a);ctx.drawImage(c,-c.width/2,-c.height/2);return out;}
export function normalize(c,r){const x=Math.max(0,Math.min(c.width-1,Math.round(r.x))),y=Math.max(0,Math.min(c.height-1,Math.round(r.y)));return {x,y,w:Math.max(1,Math.min(c.width-x,Math.round(r.w))),h:Math.max(1,Math.min(c.height-y,Math.round(r.h)))};}
// Candidate detection only; never change or save original pixels automatically.
// Connected regions on a downsampled foreground mask, with short-gap bridging.
export function suggestRegions(c){
 const scale=Math.min(1,900/Math.max(c.width,c.height)),w=Math.max(1,Math.round(c.width*scale)),h=Math.max(1,Math.round(c.height*scale)),sample=canvas(w,h),ctx=sample.getContext('2d',{willReadFrequently:true});
 ctx.fillStyle='#fff';ctx.fillRect(0,0,w,h);ctx.drawImage(c,0,0,w,h);
 const d=ctx.getImageData(0,0,w,h).data;release(sample);
 const n=w*h,mask=new Uint8Array(n),joined=new Uint8Array(n),seen=new Uint8Array(n),queue=new Int32Array(n);
 for(let i=0;i<n;i++){const j=i*4;mask[i]=Math.min(d[j],d[j+1],d[j+2])<225?1:0;}
 // Integral image lets us bridge short gaps without expensive per-pixel kernels.
 const stride=w+1,integral=new Uint32Array(stride*(h+1));
 for(let y=0;y<h;y++){let sum=0;for(let x=0;x<w;x++){sum+=mask[y*w+x];integral[(y+1)*stride+x+1]=integral[y*stride+x+1]+sum;}}
 const radius=Math.max(1,Math.round(Math.min(w,h)*.009));
 for(let y=0;y<h;y++){const y0=Math.max(0,y-radius),y1=Math.min(h,y+radius+1);for(let x=0;x<w;x++){const x0=Math.max(0,x-radius),x1=Math.min(w,x+radius+1);joined[y*w+x]=integral[y1*stride+x1]-integral[y0*stride+x1]-integral[y1*stride+x0]+integral[y0*stride+x0]>0?1:0;}}
 const regions=[];
 for(let i=0;i<n;i++){if(!joined[i]||seen[i])continue;let head=0,tail=1,l=w,r=-1,t=h,b=-1,ink=0;queue[0]=i;seen[i]=1;
  while(head<tail){const q=queue[head++],x=q%w,y=Math.floor(q/w);if(mask[q]){l=Math.min(l,x);r=Math.max(r,x);t=Math.min(t,y);b=Math.max(b,y);ink++;}for(const k of [x>0?q-1:-1,x<w-1?q+1:-1,y>0?q-w:-1,y<h-1?q+w:-1]){if(k>=0&&joined[k]&&!seen[k]){seen[k]=1;queue[tail++]=k;}}}
  const rw=r-l+1,rh=b-t+1,area=rw*rh;if(ink<30||rw<w*.16||rh<Math.min(w,h)*.09||area<n*.025||ink/area<.008)continue;
  const pad=Math.max(2,Math.round(Math.min(rw,rh)*.012));const x0=Math.max(0,l-pad),y0=Math.max(0,t-pad),x1=Math.min(w,r+1+pad),y1=Math.min(h,b+1+pad);
  const rect=normalize(c,{x:x0*c.width/w,y:y0*c.height/h,w:(x1-x0)*c.width/w,h:(y1-y0)*c.height/h});regions.push({r:rect,coverage:rect.w*rect.h/(c.width*c.height)});
 }
 // Drop full-page suggestions: no meaningful crop was detected.
 return regions.filter(v=>v.coverage<.94).sort((a,b)=>b.coverage-a.coverage).slice(0,6).sort((a,b)=>{const dy=a.r.y-b.r.y;return Math.abs(dy)<Math.min(a.r.h,b.r.h)*.35?a.r.x-b.r.x:dy;});
}
export function suggest(c){return suggestRegions(c)[0]||null;}
export async function decodeImage(file){const bitmap=await createImageBitmap(file);try{if(bitmap.width*bitmap.height>24000000)throw Error('Image exceeds 24 megapixels. Use a smaller source.');const c=canvas(bitmap.width,bitmap.height);const ctx=c.getContext('2d');ctx.fillStyle='white';ctx.fillRect(0,0,c.width,c.height);ctx.drawImage(bitmap,0,0);return c;}finally{bitmap.close();}}

// Non-destructive, global tonal adjustment. White stays white; no selective text or QR edits.
export function toned(c,amount=0){const out=copy(c);if(!amount)return out;const ctx=out.getContext('2d'),a=Math.max(0,Math.min(20,Number(amount)||0))/100;const table=Uint8Array.from({length:256},(_,i)=>Math.round(i-a*i*(255-i)/255));for(let y=0;y<out.height;y+=128){const image=ctx.getImageData(0,y,out.width,Math.min(128,out.height-y));for(let i=0;i<image.data.length;i+=4){for(let k=0;k<3;k++)image.data[i+k]=table[image.data[i+k]];}ctx.putImageData(image,0,y);}return out;}
