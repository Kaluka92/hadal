// ================= MOTOR WebGPU =================
const WA=(()=>{const SWw='p.x+=sin(uT*7.+ph-p.z*9.)*.06*ss(.2,-.5,p.z);';
 const SWAY='let sw=vec2f(sin(uT*1.3+p.y*7.+ph),cos(uT*1.1+p.y*6.+ph))*.035*(1.-b)*ss(.05,-.5,p.y);p=vec3f(p.x+sw.x,p.y,p.z+sw.y);';
 const J1='let b=ss(-.1,.2,p.y);let k1=1.+.1*sin(uT*2.2+ph)*b;p=vec3f(p.x*k1,p.y*(1.-.12*sin(uT*2.2+ph)*b),p.z*k1);'+SWAY;
 const J2='let b=ss(-.1,.2,p.y);let k1=1.+.08*sin(uT*1.5+ph)*b;p=vec3f(p.x*k1,p.y,p.z*k1);'+SWAY;
 return{'Kelp gigante':'p.x+=sin(uT*.7+ph+p.y*5.)*p.y*p.y*1.4;p.z+=cos(uT*.5+ph*1.3+p.y*4.)*p.y*p.y*1.1;',
 'Pradera de posidonia':'p.x+=sin(uT*1.1+ph+p.y*3.)*p.y*.25;','Sargazo':'p.y+=sin(uT*.8+ph)*.04;','Abanico de mar':'p.x+=sin(uT*.9+ph)*p.y*.08;',
 'Coral negro':'p.x+=sin(uT*.8+ph)*p.y*.06;','Pluma de mar':'p.x+=sin(uT*.9+ph+p.y*3.)*p.y*.08;','Gusano tubícola gigante':'p.x+=sin(uT+ph+p.y*3.)*p.y*.1;',
 'Sardina':SWw,'Pez linterna':SWw,'Pez hacha':SWw,'Pez víbora':SWw,'Granadero':SWw,
 'Atún rojo':'p.x+=sin(uT*4.+ph-p.z*6.)*.03*ss(.1,-.5,p.z);','Tortuga verde':'p.y+=sin(uT*1.6+ph)*max(abs(p.x)-.3,0.)*.7;','Pez luna':'p.x+=sin(uT*2.+ph)*abs(p.y)*.1;',
 'Medusa luna':J1,'Medusa coronada':J2,'Manta raya':'p.y+=sin(uT*1.6+ph)*pow(abs(p.x),1.5)*.35;',
 'Tiburón blanco':'p.x+=sin(uT*2.5+ph-p.z*5.)*.04*ss(.1,-.5,p.z);','Ballena jorobada':'p.y+=sin(uT*1.2+ph-p.z*3.)*.04*ss(0.,-.5,p.z);',
 'Pulpo común':'p.y+=sin(uT*1.5+ph+length(p.xz)*8.)*.03*step(.3,length(p.xz));','Sifonóforo gigante':'p.x+=sin(uT*.8+ph+p.z*8.)*.05;',
 'Calamar gigante':'p.x+=sin(uT*1.2+ph+p.z*6.)*.03*ss(.1,.5,p.z);','Cachalote':'p.y+=sin(uT*1.1+ph-p.z*3.)*.03*ss(0.,-.5,p.z);',
 'Tiburón duende':'p.x+=sin(uT*2.+ph-p.z*5.)*.04*ss(.1,-.5,p.z);','Pez pelícano':'p.x+=sin(uT*2.+ph-p.z*8.)*.06*ss(.1,-.5,p.z);',
 'Tiburón de Groenlandia':'p.x+=sin(uT*1.2+ph-p.z*4.)*.05*ss(.1,-.5,p.z);','Pulpo dumbo':'p.y+=sin(uT*3.+ph)*max(abs(p.x)-.28,0.)*.6;',
 'Pepino nadador':'p.y+=sin(uT*2.5+ph-p.z*10.)*.04;','Lirio de mar':'p.x+=sin(uT*.8+ph+p.y*3.)*p.y*.08;','Pez caracol hadal':'p.x+=sin(uT*3.+ph-p.z*7.)*.05*ss(.1,-.5,p.z);',
 'Bolsa de plástico':'p.y+=sin(uT*1.4+ph+p.x*6.)*.08*abs(p.x);','Humo de fumarola':'let k=fract(uT*.07+i.s.w);p=p*(.6+k*4.);p.y+=k*16.;','Dosel de kelp':'p.y+=sin(uT*.7+ph)*.05;'}})();

// ---- matemática de cámaras (convención WebGPU: z de 0 a 1) ----
const M4={
 persp(fy,asp,n,f){const t=1/Math.tan(fy/2),r=new Float32Array(16);r[0]=t/asp;r[5]=t;r[10]=f/(n-f);r[11]=-1;r[14]=n*f/(n-f);return r},
 ortho(l,r_,b,t,n,f){const o=new Float32Array(16);o[0]=2/(r_-l);o[5]=2/(t-b);o[10]=1/(n-f);o[12]=-(r_+l)/(r_-l);o[13]=-(t+b)/(t-b);o[14]=n/(n-f);o[15]=1;return o},
 view(p,R,U,B){const v=new Float32Array(16);v[0]=R[0];v[4]=R[1];v[8]=R[2];v[12]=-(R[0]*p[0]+R[1]*p[1]+R[2]*p[2]);v[1]=U[0];v[5]=U[1];v[9]=U[2];v[13]=-(U[0]*p[0]+U[1]*p[1]+U[2]*p[2]);
  v[2]=B[0];v[6]=B[1];v[10]=B[2];v[14]=-(B[0]*p[0]+B[1]*p[1]+B[2]*p[2]);v[15]=1;return v},
 mul(a,b){const o=new Float32Array(16);for(let c=0;c<4;c++)for(let r=0;r<4;r++){let s=0;for(let k=0;k<4;k++)s+=a[k*4+r]*b[c*4+k];o[c*4+r]=s}return o}};

// ---- dispositivo ----
const cam={position:new T.Vector3(480,-6,0)};
if(!navigator.gpu){$('start').innerHTML='<div class="box"><h1>Hace falta WebGPU</h1><p>Abrí esta página en un Chrome o Edge reciente de escritorio (o en un navegador con WebGPU activado). Este navegador no lo ofrece.</p></div>';throw new Error('sin WebGPU')}
const adapter=await navigator.gpu.requestAdapter({powerPreference:'high-performance'});
if(!adapter){$('start').innerHTML='<div class="box"><h1>Sin GPU compatible</h1><p>El navegador no encontró una GPU con WebGPU.</p></div>';throw new Error('sin adaptador')}
const device=await adapter.requestDevice(adapter.features.has('timestamp-query')?{requiredFeatures:['timestamp-query']}:{});
const _gerr=new Set();device.addEventListener('uncapturederror',e=>{const m=String(e.error.message).slice(0,260);if(_gerr.has(m))return;_gerr.add(m);window.__gerr=[..._gerr];console.error('GPU:',m)});
const canvas=document.createElement('canvas');document.body.prepend(canvas);const ctx=canvas.getContext('webgpu');
const FMT=navigator.gpu.getPreferredCanvasFormat();ctx.configure({device,format:FMT,alphaMode:'opaque'});
const HDR='rgba16float',DEPTH='depth32float',UT=GPUTextureUsage,UB=GPUBufferUsage,US=GPUShaderStage;
const mkBuf=(size,usage,data)=>{const b=device.createBuffer({size:Math.ceil(size/16)*16,usage});if(data)device.queue.writeBuffer(b,0,data);return b};
const mkTex=(w,h,format,usage,extra={})=>device.createTexture({size:[Math.max(1,w),Math.max(1,h)],format,usage,...extra});
const smod=(code,label)=>{const m=device.createShaderModule({code,label});m.getCompilationInfo().then(i=>{for(const x of i.messages)if(x.type==='error')console.error('WGSL['+label+'] '+x.lineNum+':'+x.linePos+' '+x.message)});return m};
const VF=US.VERTEX|US.FRAGMENT;
const BGL0=device.createBindGroupLayout({entries:[{binding:0,visibility:VF,buffer:{type:'uniform'}},{binding:1,visibility:US.FRAGMENT,sampler:{type:'filtering'}},{binding:2,visibility:US.FRAGMENT,sampler:{type:'comparison'}},
 {binding:3,visibility:US.FRAGMENT,texture:{sampleType:'float'}},{binding:4,visibility:US.FRAGMENT,texture:{sampleType:'float'}},{binding:5,visibility:US.FRAGMENT,texture:{sampleType:'depth'}},{binding:6,visibility:US.FRAGMENT,sampler:{type:'filtering'}}]});
const BGL1M=device.createBindGroupLayout({entries:[{binding:0,visibility:VF,buffer:{type:'uniform'}}]});
const tx1=(st='float',ms=false)=>device.createBindGroupLayout({entries:[{binding:0,visibility:US.FRAGMENT,texture:{sampleType:st,multisampled:ms}}]});
const BGL_T=tx1(),BGL_Z=tx1('unfilterable-float'),BGL_D1=tx1('depth'),BGL_DM=tx1('depth',true);
const BGL_TAA=device.createBindGroupLayout({entries:[{binding:0,visibility:US.FRAGMENT,buffer:{type:'uniform'}},{binding:1,visibility:US.FRAGMENT,texture:{sampleType:'float'}},{binding:2,visibility:US.FRAGMENT,texture:{sampleType:'float'}},{binding:3,visibility:US.FRAGMENT,texture:{sampleType:'unfilterable-float'}}]});
const BGL_FIN=device.createBindGroupLayout({entries:[{binding:0,visibility:US.FRAGMENT,texture:{sampleType:'float'}},{binding:1,visibility:US.FRAGMENT,texture:{sampleType:'float'}},{binding:2,visibility:US.FRAGMENT,texture:{sampleType:'float'}},{binding:3,visibility:US.FRAGMENT,texture:{sampleType:'unfilterable-float'}},{binding:4,visibility:US.FRAGMENT,texture:{sampleType:'float'}},{binding:5,visibility:US.FRAGMENT,texture:{sampleType:'float'}}]});
const PLO=(...l)=>device.createPipelineLayout({bindGroupLayouts:l});
const PL_MAT=PLO(BGL0,BGL1M),PL_0=PLO(BGL0);
const sRep=device.createSampler({addressModeU:'repeat',addressModeV:'repeat',magFilter:'linear',minFilter:'linear',mipmapFilter:'linear',maxAnisotropy:4});
const sCmp=device.createSampler({compare:'less-equal',magFilter:'linear',minFilter:'linear',addressModeU:'clamp-to-edge',addressModeV:'clamp-to-edge'});
const sClamp=device.createSampler({magFilter:'linear',minFilter:'linear',addressModeU:'clamp-to-edge',addressModeV:'clamp-to-edge'});
const dF=mkTex(1,1,HDR,UT.TEXTURE_BINDING),dF8=mkTex(1,1,'rgba8unorm',UT.TEXTURE_BINDING),dD=mkTex(1,1,DEPTH,UT.TEXTURE_BINDING|UT.RENDER_ATTACHMENT);
const texCau=mkTex(256,256,HDR,UT.RENDER_ATTACHMENT|UT.TEXTURE_BINDING),texDet=mkTex(512,512,'rgba8unorm',UT.RENDER_ATTACHMENT|UT.TEXTURE_BINDING,{mipLevelCount:10});
const vCau=texCau.createView(),vDet=texDet.createView();
const gBuf=mkBuf(368,UB.UNIFORM|UB.COPY_DST),gShBuf=mkBuf(368,UB.UNIFORM|UB.COPY_DST);

// ---- calidad ----
var QL=1,RS=.75,perfOn=false,fpsS=16.7;
try{QL=+(localStorage.hadalQ||1)}catch(e){}if(!(QL>=0&&QL<=4))QL=1;
const QS=[{rs0:.55,rsMax:.7,ms:1,sh:0,shE:0,steps:10,den:.8},{rs0:.75,rsMax:.92,ms:4,sh:1024,shE:3,steps:14,den:1},{rs0:.9,rsMax:1,ms:4,sh:2048,shE:2,steps:18,den:1},{rs0:1,rsMax:1.2,ms:4,sh:4096,shE:1,steps:24,den:1.35},{rs0:1.1,rsMax:1.5,ms:4,sh:6144,shE:1,steps:32,den:1.7}];RS=QS[QL].rs0;
let SC=QS[QL].ms,texSh=null;

// ---- grupos de enlace globales ----
let bg0=null;const bgDummy=device.createBindGroup({layout:BGL0,entries:[{binding:0,resource:{buffer:gBuf}},{binding:1,resource:sRep},{binding:2,resource:sCmp},{binding:3,resource:dF.createView()},{binding:4,resource:dF8.createView()},{binding:5,resource:dD.createView()},{binding:6,resource:sClamp}]});
let bgSh=null;
function makeBG0(){const shv=texSh?texSh.createView():dD.createView();
 bg0=device.createBindGroup({layout:BGL0,entries:[{binding:0,resource:{buffer:gBuf}},{binding:1,resource:sRep},{binding:2,resource:sCmp},{binding:3,resource:vCau},{binding:4,resource:vDet},{binding:5,resource:shv},{binding:6,resource:sClamp}]});
 bgSh=device.createBindGroup({layout:BGL0,entries:[{binding:0,resource:{buffer:gShBuf}},{binding:1,resource:sRep},{binding:2,resource:sCmp},{binding:3,resource:vCau},{binding:4,resource:vDet},{binding:5,resource:dD.createView()},{binding:6,resource:sClamp}]})}
function buildShadow(){if(texSh){texSh.destroy();texSh=null}const n=QS[QL].sh;if(n)texSh=mkTex(n,n,DEPTH,UT.RENDER_ATTACHMENT|UT.TEXTURE_BINDING);makeBG0()}

// ---- pipelines ----
const GEOL={arrayStride:40,attributes:[{shaderLocation:0,offset:0,format:'float32x3'},{shaderLocation:1,offset:12,format:'float32x3'},{shaderLocation:2,offset:24,format:'float32x3'},{shaderLocation:3,offset:36,format:'float32'}]};
const INSL={arrayStride:96,stepMode:'instance',attributes:[{shaderLocation:4,offset:0,format:'float32x4'},{shaderLocation:5,offset:16,format:'float32x4'},{shaderLocation:6,offset:32,format:'float32x4'},{shaderLocation:7,offset:48,format:'float32x4'},{shaderLocation:8,offset:64,format:'float32x4'},{shaderLocation:9,offset:80,format:'float32x4'}]};
const BLEND_A={color:{srcFactor:'src-alpha',dstFactor:'one-minus-src-alpha'},alpha:{srcFactor:'one',dstFactor:'one-minus-src-alpha'}};
const BLEND_ADD={color:{srcFactor:'src-alpha',dstFactor:'one'},alpha:{srcFactor:'one',dstFactor:'one'}};
const BLEND_1={color:{srcFactor:'one',dstFactor:'one'},alpha:{srcFactor:'one',dstFactor:'one'}};
const modCache=new Map();const getMod=anim=>{if(!modCache.has(anim))modCache.set(anim,smod(MATWGSL(anim),'mat:'+anim.slice(0,24)));return modCache.get(anim)};
const pipeCache=new Map();
function matPipe(anim,alpha,shadow){const k=anim+'|'+alpha+'|'+shadow+'|'+SC;if(pipeCache.has(k))return pipeCache.get(k);const m=getMod(anim);
 const d={layout:PL_MAT,vertex:{module:m,entryPoint:'vs',buffers:[GEOL,INSL]},primitive:{topology:'triangle-list',cullMode:'none'},
  depthStencil:shadow?{format:DEPTH,depthWriteEnabled:true,depthCompare:'less',depthBias:2,depthBiasSlopeScale:2}:{format:DEPTH,depthWriteEnabled:!alpha,depthCompare:'less'},multisample:{count:shadow?1:SC}};
 if(!shadow)d.fragment={module:m,entryPoint:'fs',targets:[{format:HDR,blend:alpha?BLEND_A:undefined}]};
 const p=device.createRenderPipelineAsync(d);pipeCache.set(k,p);return p}
const fsPipe=(code,label,bgls,format,blend)=>{const m=smod(code,label);return device.createRenderPipelineAsync({layout:PLO(...bgls),vertex:{module:m,entryPoint:'vs'},fragment:{module:m,entryPoint:'fs',targets:[{format,blend}]},primitive:{topology:'triangle-list'}})};

// ---- materiales (uniformes por especie) ----
const IDENT=new Float32Array([1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1, 1,1,1,1, 0,0,0,0]);
const mkMatU=(mode,R,W,alpha,o)=>{const a=new Float32Array(16);a.set([mode,R||0,W||0,alpha||1, o.bump||0,o.rust||0,o.cs||0,o.spec==null?.1:o.spec, o.tr||0,o.pat||0,o.iri||0,o.mt||0, mode===0&&o.shrink?1:0,0,0,0]);
 const b=mkBuf(64,UB.UNIFORM|UB.COPY_DST,a);return{buf:b,bg:device.createBindGroup({layout:BGL1M,entries:[{binding:0,resource:{buffer:b}}]})}};
function gpuGeo(g){if(g.index)g=g.toNonIndexed();const Pp=g.attributes.position,N=g.attributes.normal,C=g.attributes.color,E=g.attributes.em,n=Pp.count,a=new Float32Array(n*10);
 for(let i=0;i<n;i++){const o=i*10;a[o]=Pp.getX(i);a[o+1]=Pp.getY(i);a[o+2]=Pp.getZ(i);a[o+3]=N.getX(i);a[o+4]=N.getY(i);a[o+5]=N.getZ(i);a[o+6]=C.getX(i);a[o+7]=C.getY(i);a[o+8]=C.getZ(i);a[o+9]=E.getX(i)}
 return{buf:mkBuf(a.byteLength,UB.VERTEX|UB.COPY_DST,a),n}}
const identBuf=mkBuf(96,UB.VERTEX|UB.COPY_DST,IDENT);
const instBuf=(m)=>{const a=new Float32Array(IDENT);a.set(m,0);return mkBuf(96,UB.VERTEX|UB.COPY_DST,a)};


// ================= BIOLUMINISCENCIA POR ESTELA: plancton luminoso excitado por el paso del submarino (cómputo en GPU) =================
const PKN=48000;
const PLKC=`
struct Pk{p:vec3f,e:f32};
struct PU{cam:vec4f,prm:vec4f,wake:array<vec4f,32>};
@group(0)@binding(0) var<uniform> u:PU;
@group(0)@binding(1) var<storage,read_write> pk:array<Pk>;
fn hsh(n:u32)->f32{var h=n*747796405u+2891336453u;h=((h>>((h>>28u)+4u))^h)*277803737u;h=(h>>22u)^h;return f32(h&16777215u)/16777216.;}
@compute @workgroup_size(64) fn step(@builtin(global_invocation_id) id:vec3u){
 let i=id.x;if(i>=${PKN}u){return;}
 let box=u.prm.y;let t=u.prm.x;let fi=f32(i);
 let base=vec3f(hsh(i*3u),hsh(i*3u+1u),hsh(i*3u+2u))*box;
 let drift=vec3f(sin(t*.13+fi),cos(t*.11+fi*1.7)*.5,sin(t*.09+fi*2.3))*.8;
 let cam=u.cam.xyz;let pw=fract((base+drift-cam)/box)*box-vec3f(box*.5)+cam;
 var q=pk[i];if(distance(pw,q.p)>box*.4){q.e=0.;}
 q.p=pw;q.e=q.e*exp(-u.cam.w*1.5);
 for(var k=0;k<32;k++){let w=u.wake[k];let d=distance(pw,w.xyz);q.e=max(q.e,w.w*(1.-smoothstep(.2,3.4,d)));}
 pk[i]=q;}
`;
const PLKR=WC+`
struct Pk{p:vec3f,e:f32};
@group(1)@binding(0) var<storage,read> pk:array<Pk>;
struct PO{@builtin(position)cp:vec4f,@location(0)uv:vec2f,@location(1)col:vec4f};
@vertex fn vs(@builtin(vertex_index) vi:u32,@builtin(instance_index) ii:u32)->PO{
 var o:PO;let q=pk[ii];let dark=1.-clamp(g.sun.w*9.,0.,1.);let dist=distance(q.p,g.cam.xyz);
 let vis=q.e*(.12+.88*dark)*(1.-smoothstep(26.,44.,dist))*smoothstep(.7,2.6,dist);
 if(vis<.02){o.cp=vec4f(2.,2.,2.,1.);o.uv=vec2f(0.);o.col=vec4f(0.);return o;}
 let c=vec2f(f32(vi&1u),f32(vi>>1u))*2.-vec2f(1.);let sz=.015+.03*q.e;
 let wp=q.p+(g.rr.xyz*c.x+g.uu.xyz*c.y)*sz;o.cp=g.vp*vec4f(wp,1.);o.uv=c;
 o.col=vec4f(mix(vec3f(.1,.55,1.),vec3f(.25,1.,.85),q.e)*vis*4.6,vis);return o;}
@fragment fn fs(i:PO)->@location(0) vec4f{let r=dot(i.uv,i.uv);if(r>1.){discard;}let a=(1.-r)*(1.-r);return vec4f(i.col.rgb,a*min(i.col.a*2.,1.));}
`;
const pkBuf=mkBuf(PKN*16,UB.STORAGE),pkU=mkBuf(544,UB.UNIFORM|UB.COPY_DST);
const pkCBGL=device.createBindGroupLayout({entries:[{binding:0,visibility:GPUShaderStage.COMPUTE,buffer:{type:'uniform'}},{binding:1,visibility:GPUShaderStage.COMPUTE,buffer:{type:'storage'}}]});
const pkRBGL=device.createBindGroupLayout({entries:[{binding:0,visibility:GPUShaderStage.VERTEX,buffer:{type:'read-only-storage'}}]});
const pkCBG=device.createBindGroup({layout:pkCBGL,entries:[{binding:0,resource:{buffer:pkU}},{binding:1,resource:{buffer:pkBuf}}]}),pkRBG=device.createBindGroup({layout:pkRBGL,entries:[{binding:0,resource:{buffer:pkBuf}}]});
const pkP=device.createComputePipeline({layout:device.createPipelineLayout({bindGroupLayouts:[pkCBGL]}),compute:{module:smod(PLKC,'plancton-calculo'),entryPoint:'step'}});
const WK=[],wkU=new Float32Array(136);let wkT=0;
function plkUpdate(t,dt,speed){if(t-wkT>.05&&speed>.6){WK.push([cam.position.x,cam.position.y,cam.position.z,t,Math.min(speed/5,1)]);wkT=t;if(WK.length>32)WK.shift()}
 wkU.fill(0);wkU[0]=cam.position.x;wkU[1]=cam.position.y;wkU[2]=cam.position.z;wkU[3]=dt;wkU[4]=t;wkU[5]=44;
 WK.forEach((w,i)=>{const age=t-w[3],k=Math.max(0,1-age/2.4);wkU.set([w[0],w[1],w[2],w[4]*k],8+i*4)});
 device.queue.writeBuffer(pkU,0,wkU)}
function plkStep(enc){const c=enc.beginComputePass();c.setPipeline(pkP);c.setBindGroup(0,pkCBG);c.dispatchWorkgroups(Math.ceil(PKN/64));c.end()}

// ---- objetos estáticos: naufragios, fumarolas, arcos de roca ----
const STAT=[];
function addStatic(geo,instance,matU,caster){STAT.push({geo,ibuf:instance,mat:matU,caster:!!caster,anim:''})}
const matTerr=mkMatU(0,0,0,1,{mt:3,bump:1.15,spec:.05}),matWreck=mkMatU(0,0,0,1,{mt:2,bump:1.0,rust:.75,spec:.14}),matAir=mkMatU(0,0,0,1,{mt:4,bump:.45,rust:.1,spec:.35}),matSteel=mkMatU(0,0,0,1,{mt:2,bump:1.0,rust:.5,spec:.2}),matWood=mkMatU(0,0,0,1,{mt:5,bump:1.0,spec:.06}),matRock=mkMatU(0,0,0,1,{mt:1,bump:1.3,spec:.05}),matArch=mkMatU(0,0,0,1,{mt:1,bump:1.4,spec:.04});
for(const k in WR){const w=WR[k];w.id=k;w.z=0;w.y=-base(w.x);try{const mx=new Float32Array([1,0,0,0, 0,1,0,0, 0,0,1,0, w.x,w.y,w.z,1]);const wm=k==='af447'?matAir:(k==='bismarck'||k==='roberts')?matSteel:k==='galeon'?matWood:matWreck,ib=instBuf(mx);addStatic(gpuGeo(w.g()),ib,wm,false);if(w.dg)try{addStatic(gpuGeo(w.dg()),ib,wm,false)}catch(e){console.warn('escombros',k,e)}}catch(e){console.warn('naufragio',k,e)}}
try{const gs=[];for(const c of CH){const y=-floorAt(c[0],c[1])-.5;gs.push(P(CY(2.6,1,c[2]*.6,7),'#2b2522',{p:[c[0],y,c[1]]}),P(CY(1,.55,c[2]*.45,7),'#241f1c',{p:[c[0],y+c[2]*.58,c[1]]}),P(S_(.5,8,6),'#ff8a3a',{p:[c[0],y+c[2]*1.02,c[1]],e:.9}))}
 addStatic(gpuGeo(MG(gs)),identBuf,matRock,false)}catch(e){console.warn('fumarolas',e)}
// ---- rocas con túnel y cámara: campo de distancias + "surface nets" por compute ----
const SDFW=`
struct U{org:vec3f,h:f32,rc:vec3f,R:f32,yaw:f32,seed:f32,a:f32,b:f32};
@group(0)@binding(0) var<uniform> u:U;
@group(0)@binding(1) var<storage,read_write> field:array<f32>;
@group(0)@binding(2) var<storage,read_write> verts:array<f32>;
@group(0)@binding(3) var<storage,read_write> idx:array<u32>;
@group(0)@binding(4) var<storage,read_write> ind:array<atomic<u32>>;
const NG=65u; const NC=64u; const CAP=900000u;
var<private> CO:array<vec3u,8>=array<vec3u,8>(vec3u(0,0,0),vec3u(1,0,0),vec3u(0,1,0),vec3u(1,1,0),vec3u(0,0,1),vec3u(1,0,1),vec3u(0,1,1),vec3u(1,1,1));
var<private> ED:array<vec2u,12>=array<vec2u,12>(vec2u(0,1),vec2u(2,3),vec2u(4,5),vec2u(6,7),vec2u(0,2),vec2u(1,3),vec2u(4,6),vec2u(5,7),vec2u(0,4),vec2u(1,5),vec2u(2,6),vec2u(3,7));
fn ih(p:vec3i)->f32{var h=bitcast<u32>(p.x)*374761393u+bitcast<u32>(p.y)*668265263u+bitcast<u32>(p.z)*2246822519u;h=(h^(h>>13u))*1274126177u;h=h^(h>>16u);return f32(h>>8u)/16777216.;}
fn vn(p:vec3f)->f32{let i=vec3i(floor(p));let f=p-floor(p);let w=f*f*(3.-2.*f);
 let a=mix(mix(ih(i),ih(i+vec3i(1,0,0)),w.x),mix(ih(i+vec3i(0,1,0)),ih(i+vec3i(1,1,0)),w.x),w.y);
 let b=mix(mix(ih(i+vec3i(0,0,1)),ih(i+vec3i(1,0,1)),w.x),mix(ih(i+vec3i(0,1,1)),ih(i+vec3i(1,1,1)),w.x),w.y);return mix(a,b,w.z);}
fn fbm(p:vec3f)->f32{return .6*vn(p)+.4*vn(p*2.03);}
fn sdf(p:vec3f)->f32{let w=p-u.rc;let c=cos(u.yaw);let s=sin(u.yaw);let q=vec3f(c*w.x+s*w.z,w.y,-s*w.x+c*w.z);let R=u.R;
 let qy=max(q.y-R*.15,0.);
 let e=(length(vec3f(q.x/(R*1.5),qy/(R*.8),q.z/(R*.85)))-1.)*R*.7;
 let t=(length(vec2f(q.x/(R*.5),(q.y-R*.28)/(R*.42)))-1.)*R*.4;
 let cv=length(q-vec3f(R*.7,R*.15,R*.2))-R*.35;
 let d=max(e,-min(t,cv));
 return d+(fbm(q*.12+vec3f(u.seed))-.4)*R*.5+(fbm(q*.2+vec3f(u.seed*3.))-.4)*R*.2;}
fn gp(g:vec3u)->vec3f{return u.org+vec3f(g)*u.h;}
fn gi(g:vec3u)->u32{return (g.z*NG+g.y)*NG+g.x;}
@compute @workgroup_size(4,4,4) fn sample(@builtin(global_invocation_id) id:vec3u){if(any(id>=vec3u(NG))){return;}field[gi(id)]=sdf(gp(id));}
@compute @workgroup_size(4,4,4) fn cellv(@builtin(global_invocation_id) id:vec3u){if(any(id>=vec3u(NC))){return;}
 var d:array<f32,8>;var m=0u;for(var k=0u;k<8u;k++){d[k]=field[gi(id+CO[k])];if(d[k]<0.){m|=1u<<k;}}
 if(m==0u||m==255u){return;}
 var sum=vec3f(0.);var n=0.;
 for(var e=0u;e<12u;e++){let a=ED[e].x;let b=ED[e].y;if(((m>>a)&1u)!=((m>>b)&1u)){let t=d[a]/(d[a]-d[b]);sum+=mix(vec3f(CO[a]),vec3f(CO[b]),t);n+=1.;}}
 let p=gp(id)+(sum/n)*u.h;let e=1.;
 let g=normalize(vec3f(sdf(p+vec3f(e,0,0))-sdf(p-vec3f(e,0,0)),sdf(p+vec3f(0,e,0))-sdf(p-vec3f(0,e,0)),sdf(p+vec3f(0,0,e))-sdf(p-vec3f(0,0,e))));
 let v=.62+.55*fbm(p*.2+vec3f(7.));let col=vec3f(.36,.33,.29)*v*(.9+.2*vn(p*.5));
 let o=((id.z*NC+id.y)*NC+id.x)*10u;
 verts[o]=p.x;verts[o+1u]=p.y;verts[o+2u]=p.z;verts[o+3u]=g.x;verts[o+4u]=g.y;verts[o+5u]=g.z;verts[o+6u]=col.x;verts[o+7u]=col.y;verts[o+8u]=col.z;verts[o+9u]=0.;}
fn cid(c:vec3u)->u32{return (c.z*NC+c.y)*NC+c.x;}
fn quad(a:vec3u,b:vec3u,c:vec3u,d:vec3u){let base=atomicAdd(&ind[0],6u);if(base+6u>CAP){atomicSub(&ind[0],6u);return;}
 let A=cid(a);let B=cid(b);let C=cid(c);let D=cid(d);idx[base]=A;idx[base+1u]=B;idx[base+2u]=C;idx[base+3u]=A;idx[base+4u]=C;idx[base+5u]=D;}
@compute @workgroup_size(4,4,4) fn quads(@builtin(global_invocation_id) g:vec3u){if(any(g>=vec3u(NG))){return;}
 let s0=field[gi(g)]<0.;
 if(g.x<NC&&g.y>=1u&&g.z>=1u&&g.y<NC&&g.z<NC){if(s0!=(field[gi(g+vec3u(1,0,0))]<0.)){quad(g-vec3u(0,1,1),g-vec3u(0,0,1),g,g-vec3u(0,1,0));}}
 if(g.y<NC&&g.x>=1u&&g.z>=1u&&g.x<NC&&g.z<NC){if(s0!=(field[gi(g+vec3u(0,1,0))]<0.)){quad(g-vec3u(1,0,1),g-vec3u(0,0,1),g,g-vec3u(1,0,0));}}
 if(g.z<NC&&g.x>=1u&&g.y>=1u&&g.x<NC&&g.y<NC){if(s0!=(field[gi(g+vec3u(0,0,1))]<0.)){quad(g-vec3u(1,1,0),g-vec3u(0,1,0),g,g-vec3u(1,0,0));}}}
`;
const sdfBGL=device.createBindGroupLayout({entries:[{binding:0,visibility:GPUShaderStage.COMPUTE,buffer:{type:'uniform'}},...[1,2,3,4].map(b=>({binding:b,visibility:GPUShaderStage.COMPUTE,buffer:{type:'storage'}}))]});
const sdfMod=smod(SDFW,'sdf-rocas'),sdfPL=device.createPipelineLayout({bindGroupLayouts:[sdfBGL]});
const sdfP=Object.fromEntries(['sample','cellv','quads'].map(k=>[k,device.createComputePipeline({layout:sdfPL,compute:{module:sdfMod,entryPoint:k}})]));
const sdfField=mkBuf(65*65*65*4,UB.STORAGE);
function arch(x,z,R,tube,yaw){const y=-floorAt(x,z),U=mkBuf(48,UB.UNIFORM|UB.COPY_DST,new Float32Array([x-32,y-22,z-32,1, x,y,z,R, yaw,x*.013+z*.007,0,0]));
 const verts=mkBuf(64*64*64*40,UB.VERTEX|UB.STORAGE),idx=mkBuf(900000*4,UB.INDEX|UB.STORAGE),args=mkBuf(32,UB.INDIRECT|UB.STORAGE|UB.COPY_DST|UB.COPY_SRC,new Uint32Array([0,1,0,0,0,0,0,0]));
 const bg=device.createBindGroup({layout:sdfBGL,entries:[{binding:0,resource:{buffer:U}},{binding:1,resource:{buffer:sdfField}},{binding:2,resource:{buffer:verts}},{binding:3,resource:{buffer:idx}},{binding:4,resource:{buffer:args}}]});
 const enc=device.createCommandEncoder(),c=enc.beginComputePass();c.setBindGroup(0,bg);
 c.setPipeline(sdfP.sample);c.dispatchWorkgroups(17,17,17);c.setPipeline(sdfP.cellv);c.dispatchWorkgroups(16,16,16);c.setPipeline(sdfP.quads);c.dispatchWorkgroups(17,17,17);c.end();device.queue.submit([enc.finish()]);
 STAT.push({geo:{buf:verts,n:0},ibuf:identBuf,mat:matArch,caster:true,ind:{idx,args},anim:''})}
[[640,30,9,3.4,.5],[770,-48,13,4.6,-.3],[1420,42,12,4,.2],[2400,-55,14,5,.8],[3050,22,11,4,-.6]].forEach(a=>arch(...a));

// ---- cascos esculpidos por la GPU: chapa fina, cubiertas, superestructura y bordes de rotura, con medidas propias de cada barco ----
const SHIPW=`
struct U{org:vec4f,dim:vec4f,hp:vec4f,nb:vec4f,er:vec4f,dk:vec4f,fl:vec4f,col:vec4f,bx:array<vec4f,12>};
@group(0)@binding(0) var<uniform> u:U;
@group(0)@binding(1) var<storage,read_write> field:array<f32>;
@group(0)@binding(2) var<storage,read_write> verts:array<f32>;
@group(0)@binding(3) var<storage,read_write> idx:array<u32>;
@group(0)@binding(4) var<storage,read_write> ind:array<atomic<u32>>;
var<private> CO:array<vec3u,8>=array<vec3u,8>(vec3u(0,0,0),vec3u(1,0,0),vec3u(0,1,0),vec3u(1,1,0),vec3u(0,0,1),vec3u(1,0,1),vec3u(0,1,1),vec3u(1,1,1));
var<private> ED:array<vec2u,12>=array<vec2u,12>(vec2u(0,1),vec2u(2,3),vec2u(4,5),vec2u(6,7),vec2u(0,2),vec2u(1,3),vec2u(4,6),vec2u(5,7),vec2u(0,4),vec2u(1,5),vec2u(2,6),vec2u(3,7));
fn ih(p:vec3i)->f32{var h=bitcast<u32>(p.x)*374761393u+bitcast<u32>(p.y)*668265263u+bitcast<u32>(p.z)*2246822519u;h=(h^(h>>13u))*1274126177u;h=h^(h>>16u);return f32(h>>8u)/16777216.;}
fn vn(p:vec3f)->f32{let i=vec3i(floor(p));let f=p-floor(p);let w=f*f*(3.-2.*f);
 let a=mix(mix(ih(i),ih(i+vec3i(1,0,0)),w.x),mix(ih(i+vec3i(0,1,0)),ih(i+vec3i(1,1,0)),w.x),w.y);
 let b=mix(mix(ih(i+vec3i(0,0,1)),ih(i+vec3i(1,0,1)),w.x),mix(ih(i+vec3i(0,1,1)),ih(i+vec3i(1,1,1)),w.x),w.y);return mix(a,b,w.z);}
fn fbm(p:vec3f)->f32{return .6*vn(p)+.4*vn(p*2.03);}
fn rbox(p:vec3f,c:vec3f,hs:vec3f,r:f32)->f32{let q=abs(p-c)-hs+vec3f(r);return length(max(q,vec3f(0.)))+min(max(q.x,max(q.y,q.z)),0.)-r;}
fn sdfAir(p:vec3f)->f32{
 let sd=u.nb.w;let q=p-vec3f(0.,2.7,0.);let dxy=length(q.xy);var R=2.6;if(q.z>8.){let t=(q.z-8.)/7.9;R=2.6*sqrt(max(1.-t*t,0.));}
 let outer=max(dxy-R,q.z-15.9);let inner=dxy-(R-.12);var d=max(outer,-inner);
 let wz=(fract((q.z+.55)/1.1)-.5)*1.1;let w2=max(abs(wz)-.25,abs(q.y-.62)-.3);let win=max(w2,R*.55-abs(q.x));
 if(q.z>-12.7&&q.z<8.7){d=max(d,-win);}
 if(q.z<8.){let fz=(fract((q.z+.6)/1.25)-.5)*1.25;let ring=max(max(inner,(R-.5)-dxy),abs(fz)-.04);let flo=max(abs(q.y+.55)-.04,inner);d=min(d,min(ring,flo));}
 d=max(d,(-13.+4.*(fbm(p*.35+vec3f(sd))-.4))-q.z);
 d=max(d,(fbm(p*.4+vec3f(sd*2.))-.82)*4.);
 return d+(fbm(p*.9+vec3f(sd))-.5)*.03;}
fn sdfSup(p:vec3f)->f32{
 let sd=u.nb.w;
 let a=rbox(p,vec3f(0.,24.5,-12.),vec3f(12.,2.5,28.),.35);let b=rbox(p,vec3f(0.,30.5,-10.),vec3f(10.5,3.5,11.),.35);let c=rbox(p,vec3f(0.,35.1,-9.),vec3f(12.,1.1,3.),.3);
 var d=abs(min(a,min(b,c)))-.3;
 let wa=(fract((p.z+38.)/1.7)-.5)*1.7;let wA=max(max(abs(wa)-.4,abs(p.y-24.2)-.45),11.2-abs(p.x));
 let wb=(fract((p.z+19.)/1.4)-.5)*1.4;let wB=max(max(abs(wb)-.38,abs(p.y-29.8)-.5),9.7-abs(p.x));
 if(p.z>-39.&&p.z<14.5){d=max(d,-wA);}
 if(p.z>-19.5&&p.z<-.5){d=max(d,-wB);}
 d=max(d,(fbm(p*.2+vec3f(sd*3.))-.7)*4.);
 return d+(fbm(p*.6+vec3f(sd))-.5)*.12;}
fn sdfSupB(p:vec3f)->f32{
 let sd=u.nb.w;
 let a=rbox(p,vec3f(0.,23.5,-34.),vec3f(8.5,3.5,16.),1.6);let b=rbox(p,vec3f(0.,30.,-34.),vec3f(6.5,3.,10.),1.3);let c=rbox(p,vec3f(0.,37.5,-34.),vec3f(4.,4.5,5.),1.2);
 let rf=max(length(vec2f(p.y-44.6,p.z+34.))-1.9,abs(p.x)-5.2);let rf2=max(length(vec2f(p.y-33.2,p.z+46.))-1.3,abs(p.x)-3.4);
 var d=min(abs(min(a,min(b,c)))-.3,min(rf,rf2));
 let wa=(fract((p.z+50.)/1.6)-.5)*1.6;let wA=max(max(abs(wa)-.38,abs(p.y-23.)-.4),7.7-abs(p.x));
 let wb=(fract((p.z+43.)/1.5)-.5)*1.5;let wB=max(max(abs(wb)-.36,abs(p.y-29.6)-.4),5.7-abs(p.x));
 let wc=(fract((p.z+38.)/1.4)-.5)*1.4;let wC=max(max(abs(wc)-.34,abs(p.y-37.)-.45),3.2-abs(p.x));
 if(p.z>-49.&&p.z<-18.){d=max(d,-wA);}
 if(p.z>-43.&&p.z<-25.){d=max(d,-wB);}
 if(p.z>-38.&&p.z<-29.5){d=max(d,-wC);}
 d=max(d,(fbm(p*.2+vec3f(sd*3.))-.82)*4.);
 return d+(fbm(p*.6+vec3f(sd))-.5)*.08;}
fn sdf(p:vec3f)->f32{
 if(u.hp.x<-2.5){return sdfSupB(p);}
 if(u.hp.x<-1.5){return sdfSup(p);}
 if(u.hp.x<0.){return sdfAir(p);}
 let sd=u.nb.w;let L2=u.hp.x*.5;let hB=u.hp.y*.5;let H=u.hp.z;let T=u.fl.w;
 let z0=-L2+u.hp.w*u.hp.x;let tt=max((p.z-z0)/(L2-z0),0.);
 let hb=max(hB*pow(max(1.-pow(tt,1.8),0.),.55),.001);
 let Heff=H+u.fl.y*smoothstep(u.fl.z-1.,u.fl.z+3.,p.z);
 let v=clamp(1.-p.y/Heff,0.,1.);let xs=hb*sqrt(max(1.-pow(v,4.444),0.));
 let outer=max(max(abs(p.x)-xs,-p.y),p.y-Heff);
 let vi=clamp(1.-(p.y-T)/Heff,0.,1.);let xsi=max(hb-T,0.)*sqrt(max(1.-pow(vi,4.444),0.));
 var inner=max(abs(p.x)-xsi,-(p.y-T));
 if(u.fl.x>.5){inner=max(inner,p.y-(Heff-T));}
 var shell=max(outer,-inner);
 shell=max(shell,(fbm(p*.2+vec3f(sd*2.))-u.er.z)*4.);
 var d=shell;
 for(var i=0;i<4;i++){let yd=u.dk[i];if(yd>.5){var dd=max(abs(p.y-yd)-T*.5,abs(p.x)-xsi);dd=max(dd,(fbm(p*.15+vec3f(sd))-.55)*4.);d=min(d,dd);}}
 if(u.fl.y>0.){d=min(d,max(max(abs(p.y-(Heff-T*.7))-T*.6,abs(p.x)-xs),u.fl.z-p.z));}
 var sup=1000.;
 for(var i=0;i<6;i++){if(f32(i)<u.nb.x){let c=u.bx[2*i];let h=u.bx[2*i+1];sup=min(sup,rbox(p,c.xyz,h.xyz,c.w));}}
 if(u.nb.z>.5){sup=abs(sup)-T*.6;}
 sup=max(sup+(fbm(p*.3+vec3f(sd*1.7))-.5)*u.er.x,(fbm(p*.17+vec3f(sd*3.1))-u.er.y)*5.);
 d=min(d,sup);
 if(u.nb.y>-900.){let zb=u.nb.y+8.*fbm(vec3f(p.x*.12,p.y*.18,0.)+vec3f(sd*5.));d=max(d,zb-p.z);}
 return d+(fbm(p*.5+vec3f(sd))-.5)*u.er.w;}
fn dims()->vec3u{return vec3u(u32(u.dim.x),u32(u.dim.y),u32(u.dim.z));}
fn gp(g:vec3u)->vec3f{return u.org.xyz+vec3f(g)*u.org.w;}
fn gi(g:vec3u)->u32{let d=dims();return (g.z*(d.y+1u)+g.y)*(d.x+1u)+g.x;}
fn cid(c:vec3u)->u32{let d=dims();return (c.z*d.y+c.y)*d.x+c.x;}
@compute @workgroup_size(4,4,4) fn sample(@builtin(global_invocation_id) id:vec3u){if(any(id>dims())){return;}field[gi(id)]=sdf(gp(id));}
@compute @workgroup_size(4,4,4) fn cellv(@builtin(global_invocation_id) id:vec3u){if(any(id>=dims())){return;}
 var d:array<f32,8>;var m=0u;for(var k=0u;k<8u;k++){d[k]=field[gi(id+CO[k])];if(d[k]<0.){m|=1u<<k;}}
 if(m==0u||m==255u){return;}
 var sum=vec3f(0.);var n=0.;
 for(var e=0u;e<12u;e++){let a=ED[e].x;let b=ED[e].y;if(((m>>a)&1u)!=((m>>b)&1u)){let t=d[a]/(d[a]-d[b]);sum+=mix(vec3f(CO[a]),vec3f(CO[b]),t);n+=1.;}}
 let p=gp(id)+(sum/n)*u.org.w;let e=max(u.org.w*.9,.35);
 let g=normalize(vec3f(sdf(p+vec3f(e,0,0))-sdf(p-vec3f(e,0,0)),sdf(p+vec3f(0,e,0))-sdf(p-vec3f(0,e,0)),sdf(p+vec3f(0,0,e))-sdf(p-vec3f(0,0,e))));
 let sup=select(1.,1.12,p.y>u.hp.z+1.);let v=.65+.6*fbm(p*.3+vec3f(3.));let col=u.col.xyz*v*sup;
 let o=cid(id)*10u;
 verts[o]=p.x;verts[o+1u]=p.y;verts[o+2u]=p.z;verts[o+3u]=g.x;verts[o+4u]=g.y;verts[o+5u]=g.z;verts[o+6u]=col.x;verts[o+7u]=col.y;verts[o+8u]=col.z;verts[o+9u]=0.;}
fn quad(a:vec3u,b:vec3u,c:vec3u,d:vec3u){let cap=u32(u.dim.w);let base=atomicAdd(&ind[0],6u);if(base+6u>cap){atomicSub(&ind[0],6u);return;}
 let A=cid(a);let B=cid(b);let C=cid(c);let D=cid(d);idx[base]=A;idx[base+1u]=B;idx[base+2u]=C;idx[base+3u]=A;idx[base+4u]=C;idx[base+5u]=D;}
@compute @workgroup_size(4,4,4) fn quads(@builtin(global_invocation_id) g:vec3u){let d=dims();if(any(g>d)){return;}
 let s0=field[gi(g)]<0.;
 if(g.x<d.x&&g.y>=1u&&g.z>=1u&&g.y<d.y&&g.z<d.z){if(s0!=(field[gi(g+vec3u(1,0,0))]<0.)){quad(g-vec3u(0,1,1),g-vec3u(0,0,1),g,g-vec3u(0,1,0));}}
 if(g.y<d.y&&g.x>=1u&&g.z>=1u&&g.x<d.x&&g.z<d.z){if(s0!=(field[gi(g+vec3u(0,1,0))]<0.)){quad(g-vec3u(1,0,1),g-vec3u(0,0,1),g,g-vec3u(1,0,0));}}
 if(g.z<d.z&&g.x>=1u&&g.y>=1u&&g.x<d.x&&g.y<d.y){if(s0!=(field[gi(g+vec3u(0,0,1))]<0.)){quad(g-vec3u(1,1,0),g-vec3u(0,1,0),g,g-vec3u(1,0,0));}}}
`;
const shipBGL=device.createBindGroupLayout({entries:[{binding:0,visibility:GPUShaderStage.COMPUTE,buffer:{type:'uniform'}},...[1,2,3,4].map(b=>({binding:b,visibility:GPUShaderStage.COMPUTE,buffer:{type:'storage'}}))]});
const shipMod=smod(SHIPW,'cascos'),shipPL=device.createPipelineLayout({bindGroupLayouts:[shipBGL]}),shipP=Object.fromEntries(['sample','cellv','quads'].map(k=>[k,device.createComputePipeline({layout:shipPL,compute:{module:shipMod,entryPoint:k}})]));
const SHIPS={
 titanic_sup:{org:[-13.2,21.4,-42],h:.3,n:[88,52,200],cap:2200000,hp:[-2,0,0,0],boxes:[],brk:-1000,hollow:0,er:[0,1,.8,.05],dk:[0,0,0,0],fl:[0,0,0,.5],col:[.38,.29,.22],seed:1.9},
 titanic:{org:[-17.6,-1,-63.8],h:.55,n:[64,80,232],cap:3000000,hp:[120,28,22,.5],boxes:[],brk:-57,hollow:1,er:[1.1,.62,.6,.25],dk:[6,12,17,0],fl:[0,3.2,9,.7],col:[.37,.28,.21],seed:1.3},
 bismarck_sup:{org:[-9.6,19.6,-50.6],h:.3,n:[64,88,110],cap:1800000,hp:[-3,0,0,0],boxes:[],brk:-1000,hollow:0,er:[0,1,.8,.05],dk:[0,0,0,0],fl:[0,0,0,.5],col:[.3,.33,.36],seed:2.8},
 bismarck:{org:[-22.4,-1,-128.8],h:.8,n:[56,56,322],cap:4000000,hp:[250,36,16,.45],boxes:[[0,18,-4,.3,10,2,80]],brk:-1000,hollow:0,er:[.3,.9,.96,.12],dk:[0,0,0,0],fl:[1,0,0,.8],col:[.29,.32,.35],seed:2.1},
 roberts:{org:[-6.8,-1,-48],h:.4,n:[34,58,240],cap:2500000,hp:[93,11,8,.45],boxes:[[0,10.5,6,.8,3.5,2.5,5],[0,15,7,.7,2.5,2,3],[0,18.5,7,.6,1.5,1.5,1.5]],brk:-1000,hollow:0,er:[.5,.88,.96,.15],dk:[0,0,0,0],fl:[1,0,0,.5],col:[.29,.31,.35],seed:3.7},
 af447:{org:[-3.4,-.2,-15.5],h:.14,n:[49,43,226],cap:2500000,hp:[-1,0,0,0],boxes:[],brk:-1000,hollow:0,er:[0,1,.8,.05],dk:[0,0,0,0],fl:[0,0,0,.5],col:[.55,.58,.6],seed:5.3},
 galeon:{org:[-6.3,-1,-22.4],h:.35,n:[36,48,128],cap:1500000,hp:[40,11,7,.4],boxes:[[0,9.5,-15,1.6,4.75,2.5,5.5],[0,13.25,-16,1.2,4,1.25,3.5],[0,8.75,12,1.4,3.5,1.75,3]],brk:-1000,hollow:1,er:[.7,.64,.6,.3],dk:[3.5,0,0,0],fl:[0,0,0,.45],col:[.29,.21,.14],seed:4.9}};
function buildShip(key){const w=WR[key.split('_')[0]],S=SHIPS[key],[NX,NY,NZ]=S.n,u=new Float32Array(16*8+48);
 u.set([...S.org,S.h, NX,NY,NZ,S.cap, ...S.hp, S.boxes.length,S.brk,S.hollow,S.seed, ...S.er, ...S.dk, ...S.fl, ...S.col,0],0);
 S.boxes.forEach((b,i)=>{u.set([b[0],b[1],b[2],b[3]],32+i*8);u.set([b[4],b[5],b[6],0],32+i*8+4)});
 const U=mkBuf(u.byteLength,UB.UNIFORM|UB.COPY_DST,u),field=mkBuf((NX+1)*(NY+1)*(NZ+1)*4,UB.STORAGE),verts=mkBuf(NX*NY*NZ*40,UB.VERTEX|UB.STORAGE),idx=mkBuf(S.cap*4,UB.INDEX|UB.STORAGE),args=mkBuf(32,UB.INDIRECT|UB.STORAGE|UB.COPY_DST|UB.COPY_SRC,new Uint32Array([0,1,0,0,0,0,0,0]));
 const bg=device.createBindGroup({layout:shipBGL,entries:[{binding:0,resource:{buffer:U}},{binding:1,resource:{buffer:field}},{binding:2,resource:{buffer:verts}},{binding:3,resource:{buffer:idx}},{binding:4,resource:{buffer:args}}]});
 const enc=device.createCommandEncoder(),c=enc.beginComputePass();c.setBindGroup(0,bg);
 c.setPipeline(shipP.sample);c.dispatchWorkgroups(Math.ceil((NX+1)/4),Math.ceil((NY+1)/4),Math.ceil((NZ+1)/4));c.setPipeline(shipP.cellv);c.dispatchWorkgroups(Math.ceil(NX/4),Math.ceil(NY/4),Math.ceil(NZ/4));c.setPipeline(shipP.quads);c.dispatchWorkgroups(Math.ceil((NX+1)/4),Math.ceil((NY+1)/4),Math.ceil((NZ+1)/4));c.end();device.queue.submit([enc.finish()]);
 const mx=new Float32Array([1,0,0,0, 0,1,0,0, 0,0,1,0, w.x,w.y,w.z,1]);const mt=(key.startsWith('bismarck')||key==='roberts')?matSteel:key==='af447'?matAir:key.startsWith('galeon')?matWood:matWreck;
 STAT.push({geo:{buf:verts,n:0},ibuf:instBuf(mx),mat:mt,caster:false,ind:{idx,args},anim:'',tag:'casco-'+key})}
for(const k in SHIPS)buildShip(k);

// ---- especies: geometría, instancias y material de cada una ----
const CASTN=new Set(['Kelp gigante','Dosel de kelp','Roca','Roca grande','Esponja barril']);
const CULLW=`
struct CU{pl:array<vec4f,6>,cam:vec4f,sph:vec4f,rng:vec4f,fl:vec4f};
@group(0)@binding(0) var<uniform> u:CU;
@group(0)@binding(1) var<storage,read> inst:array<vec4f>;
@group(0)@binding(2) var<storage,read_write> oN:array<vec4f>;
@group(0)@binding(3) var<storage,read_write> oM:array<vec4f>;
@group(0)@binding(4) var<storage,read_write> oF:array<vec4f>;
@group(0)@binding(5) var<storage,read_write> args:array<atomic<u32>>;
@compute @workgroup_size(64) fn main(@builtin(global_invocation_id) id:vec3u){
 let i=id.x;if(i>=u32(u.rng.w)){return;}
 let b=i*6u;let m0=inst[b];let m1=inst[b+1u];let m2=inst[b+2u];let m3=inst[b+3u];
 let sc=max(length(m0.xyz),max(length(m1.xyz),length(m2.xyz)));var c:vec3f;var r:f32;var dist:f32;
 if(u.fl.y>.5){c=inst[b+5u].xyz;r=u.sph.w+u.sph.x*sc+20.;dist=max(length(c-u.cam.xyz)-u.sph.w,0.);}
 else{c=m0.xyz*u.sph.x+m1.xyz*u.sph.y+m2.xyz*u.sph.z+m3.xyz;r=u.sph.w*sc+3.;dist=length(m3.xyz-u.cam.xyz);}
 for(var k=0;k<6;k++){if(dot(u.pl[k].xyz,c)+u.pl[k].w< -r){return;}}
 let d2=dist*dist;
 if(d2>=u.rng.z){return;}
 var band=1u;if(d2<u.rng.x){band=0u;}else if(d2>=u.rng.y&&u.fl.x>.5){band=2u;}
 let slot=atomicAdd(&args[band*4u+1u],1u);let o=slot*6u;
 if(band==0u){for(var k=0u;k<6u;k++){oN[o+k]=inst[b+k];}}
 else if(band==1u){for(var k=0u;k<6u;k++){oM[o+k]=inst[b+k];}}
 else{for(var k=0u;k<6u;k++){oF[o+k]=inst[b+k];}}}
`;
const CB=GPUShaderStage.COMPUTE,cullBGL=device.createBindGroupLayout({entries:[{binding:0,visibility:CB,buffer:{type:'uniform'}},{binding:1,visibility:CB,buffer:{type:'read-only-storage'}},...[2,3,4,5].map(b=>({binding:b,visibility:CB,buffer:{type:'storage'}}))]});
const cullMod=smod(CULLW,'culling'),cullP=device.createComputePipeline({layout:device.createPipelineLayout({bindGroupLayouts:[cullBGL]}),compute:{module:cullMod,entryPoint:'main'}}),cullDummy=mkBuf(96,UB.STORAGE|UB.VERTEX),cullDummy2=mkBuf(96,UB.STORAGE|UB.VERTEX);
const cullBG=(u,sb,n,m,f,a)=>device.createBindGroup({layout:cullBGL,entries:[{binding:0,resource:{buffer:u}},{binding:1,resource:{buffer:sb}},{binding:2,resource:{buffer:n}},{binding:3,resource:{buffer:m}},{binding:4,resource:{buffer:f}},{binding:5,resource:{buffer:a}}]});
for(const sp of SPS){try{FISHLO=(sp.cap||500)>400;const g=sp.g();sp.geo=gpuGeo(g);const cap=sp.cap||500;sp.cap=cap;sp.inst=new Float32Array(cap*24);sp.ibuf=mkBuf(cap*96,UB.VERTEX|UB.COPY_DST);
 const mode=(sp.k==='W'||sp.k==='H')?1:0;sp.mode=mode;sp.cnt=0;sp.wa=WA[sp.n]||'';
 if(mode===0){const gNg=sp.gN?sp.gN():richer(g,.12);sp.geoN=gpuGeo(gNg);g.computeBoundingSphere();gNg.computeBoundingSphere();const sph=g.boundingSphere.clone().union(gNg.boundingSphere);sp.sph=[sph.center.x,sph.center.y,sph.center.z,sph.radius*1.05];
  if(sp.geo.n/3>250)sp.geoF=gpuGeo(simplify(g,.25));
  const U2=UB.STORAGE|UB.VERTEX;sp.sbuf=mkBuf(cap*96,UB.STORAGE|UB.COPY_DST);sp.oN=mkBuf(cap*96,U2);sp.oM=mkBuf(cap*96,U2);sp.oF=sp.geoF?mkBuf(cap*96,U2):cullDummy;sp.args=mkBuf(48,UB.INDIRECT|UB.STORAGE|UB.COPY_DST|UB.COPY_SRC);sp.uC=mkBuf(176,UB.UNIFORM|UB.COPY_DST);
  sp.cbg=cullBG(sp.uC,sp.sbuf,sp.oN,sp.oM,sp.oF,sp.args);
  if(CASTN.has(sp.n)){sp.oS=mkBuf(cap*96,U2);sp.argsS=mkBuf(48,UB.INDIRECT|UB.STORAGE|UB.COPY_DST);sp.uS=mkBuf(176,UB.UNIFORM|UB.COPY_DST);sp.cbgS=cullBG(sp.uS,sp.sbuf,cullDummy,sp.oS,cullDummy2,sp.argsS)}
 }else{const hi=cap<=1000;sp.geoN=hi?gpuGeo(richer(g,.05)):sp.geo;g.computeBoundingSphere();if(!isFinite(g.boundingSphere.radius))console.warn('NaN en geometría:',sp.n);sp.sph=[g.boundingSphere.radius*1.05,0,0,(sp.R||10)*1.6];sp.mobile=1;
  const U2=UB.STORAGE|UB.VERTEX;sp.sbuf=mkBuf(cap*96,UB.STORAGE|UB.COPY_DST);sp.oN=mkBuf(cap*96,U2);sp.oM=mkBuf(cap*96,U2);sp.oF=cullDummy;sp.args=mkBuf(48,UB.INDIRECT|UB.STORAGE|UB.COPY_DST|UB.COPY_SRC);sp.uC=mkBuf(176,UB.UNIFORM|UB.COPY_DST);sp.cbg=cullBG(sp.uC,sp.sbuf,sp.oN,sp.oM,sp.oF,sp.args)}
 sp.mu=mkMatU(mode,sp.R,sp.W,sp.alpha,{cs:mode?1:.15,spec:mode?.55:.12,tr:sp.tr,pat:sp.pat,iri:sp.iri,shrink:mode===0,...(sp.mo||{})})}catch(e){console.warn('especie',sp.n,e);sp.geo=null}}

// ---- terreno: vértices por compute shader, índices estáticos ----
const TN=251,tvb=mkBuf(TN*TN*40,UB.VERTEX|UB.STORAGE|UB.COPY_SRC),tu=mkBuf(32,UB.UNIFORM|UB.COPY_DST),tvbF=mkBuf(TN*TN*40,UB.VERTEX|UB.STORAGE|UB.COPY_SRC);
{const ix=new Uint32Array(250*250*6);let o=0;for(let r=0;r<250;r++)for(let c=0;c<250;c++){const a=r*TN+c,b=a+1,cc=a+TN,d=cc+1;ix.set([a,cc,b,b,cc,d],o);o+=6}
 var tib=mkBuf(ix.byteLength,UB.INDEX|UB.COPY_DST,ix)}
const terrMod=smod(TERR,'terreno');
const terrPipe=await device.createComputePipelineAsync({layout:'auto',compute:{module:terrMod,entryPoint:'main'}});
const terrBG=device.createBindGroup({layout:terrPipe.getBindGroupLayout(0),entries:[{binding:0,resource:{buffer:tu}},{binding:1,resource:{buffer:tvb}}]});
const terrPipeF=await device.createComputePipelineAsync({layout:'auto',compute:{module:terrMod,entryPoint:'mainF'}});
const terrBGF=device.createBindGroup({layout:terrPipeF.getBindGroupLayout(0),entries:[{binding:0,resource:{buffer:tu}},{binding:1,resource:{buffer:tvbF}}]});
let fc={x:1e9,z:1e9},fineDirty=true,fineOn=false;const TNR=31.25;
function writeTU(){device.queue.writeBuffer(tu,0,new Float32Array([tc.x,tc.z,1.8,0,fc.x,fc.z,TNR,0]))}
function fineCheck(){const on=QL>=1&&(DBGM&32768)===0;if(on&&!fineOn)fc={x:1e9,z:1e9};fineOn=on;if(!on)return;
 if(Math.hypot(cam.position.x-fc.x,cam.position.z-fc.z)>8){fc={x:Math.round(cam.position.x/4)*4,z:Math.round(cam.position.z/4)*4};writeTU();fineDirty=true}}
let tc={x:1e9,z:1e9},terrDirty=true;
function terrain(){const cx=Math.round(cam.position.x/25)*25,cz=Math.round(cam.position.z/25)*25;tc={x:cx,z:cz};writeTU();terrDirty=true}

// ---- geometría de los conos de luz ----
const coneV=(()=>{const R=16,H=46,N=28,a=[];const pt=i=>{const th=i/N*6.2832;return[Math.cos(th)*R,-Math.sin(th)*R,-H]};
 const push=(p,n,t)=>a.push(p[0],p[1],p[2],n[0],n[1],n[2],t);
 for(let i=0;i<N;i++){const m=(i+.5)/N*6.2832,nn=[Math.cos(m),-Math.sin(m),.3];push([0,0,0],nn,0);push(pt(i),nn,1);push(pt(i+1),nn,1)}
 const b=new Float32Array(a);return{buf:mkBuf(b.byteLength,UB.VERTEX|UB.COPY_DST,b),n:a.length/7}})();
const CONEL={arrayStride:28,attributes:[{shaderLocation:0,offset:0,format:'float32x3'},{shaderLocation:1,offset:12,format:'float32x3'},{shaderLocation:2,offset:24,format:'float32'}]};

// ---- pasadas de pantalla completa y objetos del mundo (se (re)crean al cambiar la calidad) ----
let PP={};
async function buildPipes(){
 SC=QS[QL].ms;const world=[];
 const jobs=[];const need=new Set();
 need.add(['',false,false].join('|'));
 for(const sp of SPS)if(sp.geo){need.add([sp.wa,!!sp.alpha,false].join('|'));if(CASTN.has(sp.n))need.add([sp.wa,!!sp.alpha,true].join('|'))}
 need.add(['',false,true].join('|'));
 const mp=new Map();for(const k of need){const [an,al,sh]=k.split('|');mp.set(k,matPipe(an,al==='true',sh==='true'))}
 const surfMod=smod(SURF,'superficie'),snowMod=smod(SNOW,'nieve'),coneMod=smod(CONE,'conos');
 const [surf,snow,cone,cau,det,blit,dep,rays,kar,down,up,fin,pm]=await Promise.all([
  device.createRenderPipelineAsync({layout:PL_0,vertex:{module:surfMod,entryPoint:'vs'},fragment:{module:surfMod,entryPoint:'fs',targets:[{format:HDR}]},primitive:{topology:'triangle-strip'},depthStencil:{format:DEPTH,depthWriteEnabled:true,depthCompare:'less'},multisample:{count:SC}}),
  device.createRenderPipelineAsync({layout:PL_0,vertex:{module:snowMod,entryPoint:'vs'},fragment:{module:snowMod,entryPoint:'fs',targets:[{format:HDR,blend:BLEND_ADD}]},primitive:{topology:'triangle-strip'},depthStencil:{format:DEPTH,depthWriteEnabled:false,depthCompare:'less'},multisample:{count:SC}}),
  device.createRenderPipelineAsync({layout:PL_0,vertex:{module:coneMod,entryPoint:'vs',buffers:[CONEL]},fragment:{module:coneMod,entryPoint:'fs',targets:[{format:HDR,blend:BLEND_ADD}]},primitive:{topology:'triangle-list',cullMode:'none'},depthStencil:{format:DEPTH,depthWriteEnabled:false,depthCompare:'less'},multisample:{count:SC}}),
  fsPipe(P_CAU,'caus',[BGL0],HDR),fsPipe(P_DET,'detalle',[BGL0],'rgba8unorm'),fsPipe(P_BLIT,'mip',[BGL0,BGL_T],'rgba8unorm'),
  fsPipe(P_DEPTH(SC>1),'prof',[BGL0,SC>1?BGL_DM:BGL_D1],'r32float'),fsPipe(P_RAYS,'rayos',[BGL0,BGL_Z],HDR),
  fsPipe(P_KAR,'kar',[BGL0,BGL_T],HDR),fsPipe(P_DOWN,'down',[BGL0,BGL_T],HDR),fsPipe(P_UP,'up',[BGL0,BGL_T],HDR,BLEND_1),
  fsPipe(P_FIN,'final',[BGL0,BGL_FIN],FMT),
  Promise.all([...mp.entries()].map(async([k,p])=>[k,await p]))]);
 PP={surf,snow,cone,cau,det,blit,dep,rays,kar,down,up,fin,mat:new Map(pm)};
 PP.bgf=await device.createRenderPipelineAsync({layout:PL_0,vertex:{module:smod(BGF,'fondo-agua'),entryPoint:'vs'},fragment:{module:smod(BGF,'fondo-agua'),entryPoint:'fs',targets:[{format:HDR}]},primitive:{topology:'triangle-list'},depthStencil:{format:DEPTH,depthWriteEnabled:false,depthCompare:'always'},multisample:{count:SC}});
 PP.taa=await fsPipe(P_TAA,'taa',[BGL0,BGL_TAA],HDR);
 PP.plk=await device.createRenderPipelineAsync({layout:PLO(BGL0,pkRBGL),vertex:{module:smod(PLKR,'plancton-dibujo'),entryPoint:'vs'},fragment:{module:smod(PLKR,'plancton-dibujo'),entryPoint:'fs',targets:[{format:HDR,blend:BLEND_ADD}]},primitive:{topology:'triangle-strip'},depthStencil:{format:DEPTH,depthWriteEnabled:false,depthCompare:'less'},multisample:{count:SC}});
 const pm2=smod(PUFF,'sedimento');PP.puff=await device.createRenderPipelineAsync({layout:PL_0,vertex:{module:pm2,entryPoint:'vs',buffers:[{arrayStride:16,stepMode:'instance',attributes:[{shaderLocation:0,offset:0,format:'float32x4'}]}]},fragment:{module:pm2,entryPoint:'fs',targets:[{format:HDR,blend:BLEND_A}]},primitive:{topology:'triangle-strip'},depthStencil:{format:DEPTH,depthWriteEnabled:false,depthCompare:'less'},multisample:{count:SC}});}
const puffs=new Float32Array(1024),puffBuf=mkBuf(4096,UB.VERTEX|UB.COPY_DST);for(let i=0;i<256;i++)puffs[i*4+3]=-1e4;let puffI=0,puffAcc=0;
const mkP=(k)=>PP.mat.get(k);

// ---- objetivos de render (dependen de la resolución dinámica y de la calidad) ----
let TG={};
function buildTargets(){for(const k in TG)for(const t of [].concat(TG[k]))t&&t.destroy&&t.destroy();TG={};
 const pr=Math.min(devicePixelRatio,2);canvas.width=Math.max(8,Math.floor(innerWidth*pr));canvas.height=Math.max(8,Math.floor(innerHeight*pr));
 canvas.style.cssText='display:block;width:100vw;height:100vh;touch-action:none';
 const W=Math.max(8,Math.min(4096,Math.floor(canvas.width*RS))),H=Math.max(8,Math.min(4096,Math.floor(canvas.height*RS)));TG.W=W;TG.H=H;
 TG.hdr=mkTex(W,H,HDR,UT.RENDER_ATTACHMENT|UT.TEXTURE_BINDING|UT.COPY_DST);TG.taa=QL>=3?[0,1].map(()=>mkTex(W,H,HDR,UT.RENDER_ATTACHMENT|UT.TEXTURE_BINDING|UT.COPY_SRC)):null;taaReset=true;TG.ms=SC>1?mkTex(W,H,HDR,UT.RENDER_ATTACHMENT,{sampleCount:SC}):null;
 TG.depth=mkTex(W,H,DEPTH,UT.RENDER_ATTACHMENT|UT.TEXTURE_BINDING,{sampleCount:SC});TG.z=mkTex(W,H,'r32float',UT.RENDER_ATTACHMENT|UT.TEXTURE_BINDING|UT.COPY_SRC);
 TG.rays=mkTex(W>>1,H>>1,HDR,UT.RENDER_ATTACHMENT|UT.TEXTURE_BINDING);TG.bl=[];let w=W,h=H;for(let i=0;i<3;i++){w=Math.max(2,w>>1);h=Math.max(2,h>>1);TG.bl.push(mkTex(w,h,HDR,UT.RENDER_ATTACHMENT|UT.TEXTURE_BINDING))}
 TG.v={taa:TG.taa?TG.taa.map(t=>t.createView()):null,hdr:TG.hdr.createView(),ms:TG.ms?TG.ms.createView():null,depth:TG.depth.createView(),z:TG.z.createView(),rays:TG.rays.createView(),bl:TG.bl.map(t=>t.createView())};
 const b1=(l,v)=>device.createBindGroup({layout:l,entries:[{binding:0,resource:v}]});
 TG.bg={dep:b1(SC>1?BGL_DM:BGL_D1,TG.v.depth),rays:b1(BGL_Z,TG.v.z),kar:b1(BGL_T,TG.v.hdr),down:TG.v.bl.map((v,i)=>i?b1(BGL_T,TG.v.bl[i-1]):null),up:[],
  taa:TG.taa?[0,1].map(i=>device.createBindGroup({layout:BGL_TAA,entries:[{binding:0,resource:{buffer:taaU}},{binding:1,resource:TG.v.hdr},{binding:2,resource:TG.v.taa[i]},{binding:3,resource:TG.v.z}]})):null,
  fin:device.createBindGroup({layout:BGL_FIN,entries:[{binding:0,resource:TG.v.hdr},{binding:1,resource:TG.v.rays},{binding:2,resource:TG.v.bl[0]},{binding:3,resource:TG.v.z},{binding:4,resource:TG.v.bl[1]},{binding:5,resource:TG.v.bl[2]}]})}}

// ---- inicialización de texturas de agua (se hace una sola vez) ----
async function initTextures(){const enc=device.createCommandEncoder();
 fsp(enc,PP.cau,vCau,[bgDummy]);
 fsp(enc,PP.det,texDet.createView({baseMipLevel:0,mipLevelCount:1}),[bgDummy]);
 for(let l=1;l<10;l++){const src=texDet.createView({baseMipLevel:l-1,mipLevelCount:1}),dst=texDet.createView({baseMipLevel:l,mipLevelCount:1});
  fsp(enc,PP.blit,dst,[bgDummy,device.createBindGroup({layout:BGL_T,entries:[{binding:0,resource:src}]})])}
 device.queue.submit([enc.finish()])}
var DBGM=0,cFrame=0,PROF=null,GT=device.features.has('timestamp-query')?{qs:device.createQuerySet({type:'timestamp',count:2}),rb:device.createBuffer({size:16,usage:GPUBufferUsage.QUERY_RESOLVE|GPUBufferUsage.COPY_SRC}),ring:[0,1,2].map(()=>device.createBuffer({size:16,usage:GPUBufferUsage.MAP_READ|GPUBufferUsage.COPY_DST})),busy:[false,false,false],idx:0,cur:-1,ms:null}:null;function tw(nm){if(!PROF)return undefined;const i=PROF.n++;PROF.names.push(nm);return{querySet:PROF.qs,beginningOfPassWriteIndex:2*i,endOfPassWriteIndex:2*i+1}}
var SKIP=null;
function fsp(enc,pipe,view,bgs,load,nm){if(SKIP&&SKIP.has(nm))return;const p=enc.beginRenderPass({colorAttachments:[{view,loadOp:load?'load':'clear',clearValue:{r:0,g:0,b:0,a:1},storeOp:'store'}],timestampWrites:(nm==='bloom-fin'&&GT&&!PROF)?{querySet:GT.qs,endOfPassWriteIndex:1}:tw(nm||'pantalla')});p.setPipeline(pipe);bgs.forEach((b,i)=>p.setBindGroup(i,b));p.draw(3);p.end()}

// ---- uniformes globales ----
var focusV=10,focusT=10,focusBusy=false,focusPend=false,focusBuf=null,focusN=0;
var taaIdx8=0,taaJ=[0,0],taaPrev=null,taaPrevCam=[0,0,0],taaH=0,taaReset=true;function hal(i,b){let f=1,r=0;while(i>0){f/=b;r+=f*(i%b);i=Math.floor(i/b)}return r}
const taaU=mkBuf(96,UB.UNIFORM|UB.COPY_DST);
var SHK=0;var SO=[-1,0,0,0];const Gf=new Float32Array(92),GfS=new Float32Array(92),SUN=new T.Vector3(.25,.92,.17).normalize();let lightVP=new Float32Array(16),shOn=0,shFrame=0;
const camV=new T.Vector3(),camR=new T.Vector3(),camU=new T.Vector3();
function camBasis(){const sy=Math.sin(yaw),cy=Math.cos(yaw),sp=Math.sin(pitch),cp=Math.cos(pitch);camV.set(-sy*cp,sp,-cy*cp);camR.set(cy,0,-sy);camU.set(sp*sy,cp,sp*cy)}
function fillG(a,vp,t,dep,sunD){a.set(vp,0);a.set(lightVP,16);const W=TG.W,H=TG.H,tY=Math.tan(35*Math.PI/180),tX=tY*(canvas.width/canvas.height);
 a.set([cam.position.x,cam.position.y,cam.position.z,t, camV.x,camV.y,camV.z,0, .05,.022,.018,0, .060,.026,.018,0, SUN.x,SUN.y,SUN.z,sunD, lampAmb?.9:0,1,shOn,texSh?texSh.width:1,
  W,H,1/W,1/H, tX,tY,.2,600, camR.x,camR.y,camR.z,0, camU.x,camU.y,camU.z,0, camV.x,camV.y,camV.z,0, QS[QL].steps,.05,exposure,(DBGM|(QL>=3?4096:0)|(QL>=4?8192:0)), canvas.width,canvas.height,1/canvas.width,1/canvas.height, SO[0],SO[1],SO[2]||0,lampMode===2?1:0],32);a[88]=focusV;a[89]=Math.max(2,3.5*canvas.height/720)}
let exposure=.7;
const PROJ=()=>M4.persp(70*Math.PI/180,canvas.width/canvas.height,.2,600);

// ---- sombras del sol ----
const shR=new T.Vector3(),shU=new T.Vector3(),shC=new T.Vector3(),zAx=new T.Vector3(0,0,1);
function lightMatrix(){const L=SUN;shR.crossVectors(zAx,L).normalize();shU.crossVectors(L,shR).normalize();const S=56,tx=2*S/(texSh?texSh.width:1024);
 shC.copy(cam.position);const a=shC.dot(shR),b=shC.dot(shU);shC.addScaledVector(shR,Math.round(a/tx)*tx-a).addScaledVector(shU,Math.round(b/tx)*tx-b);
 const eye=[shC.x+L.x*150,shC.y+L.y*150,shC.z+L.z*150];const v=M4.view(eye,[shR.x,shR.y,shR.z],[shU.x,shU.y,shU.z],[L.x,L.y,L.z]);lightVP=M4.mul(M4.ortho(-S,S,-S,S,1,320),v)}

// ---- cuadro completo ----
function drawStatic(p,list,shadow){for(const s of list){if(shadow&&!s.caster)continue;p.setPipeline(shadow?mkP(['',false,true].join('|')):mkP(['',false,false].join('|')));p.setBindGroup(1,s.mat.bg);p.setVertexBuffer(0,s.geo.buf);p.setVertexBuffer(1,s.ibuf);if(s.ind){p.setIndexBuffer(s.ind.idx,'uint32');p.drawIndexedIndirect(s.ind.args,0)}else p.draw(s.geo.n,1)}}
function drawTerrainF(p){p.setPipeline(mkP(['',false,false].join('|')));p.setBindGroup(1,matTerr.bg);p.setVertexBuffer(0,tvbF);p.setVertexBuffer(1,identBuf);p.setIndexBuffer(tib,'uint32');p.drawIndexed(250*250*6)}
function drawTerrain(p,shadow){p.setPipeline(mkP(['',false,shadow].join('|')));p.setBindGroup(1,matTerr.bg);p.setVertexBuffer(0,tvb);p.setVertexBuffer(1,identBuf);p.setIndexBuffer(tib,'uint32');p.drawIndexed(250*250*6)}
var LODR=[35,60,80,110,140][QL],MIDR=LODR+12,CULLR=90;
function upl(sp){device.queue.writeBuffer(sp.geoN?sp.sbuf:sp.ibuf,0,sp.inst.buffer,0,sp.cnt*96)}
function planesOf(m){const o=new Float32Array(24),row=i=>[m[i],m[4+i],m[8+i],m[12+i]],r3=row(3),defs=[[row(0),1],[row(0),-1],[row(1),1],[row(1),-1],[row(2),0],[row(2),-1]];
 defs.forEach(([rk,sg],k)=>{let c;if(sg===0)c=rk;else c=[r3[0]+sg*rk[0],r3[1]+sg*rk[1],r3[2]+sg*rk[2],r3[3]+sg*rk[3]];if(k===5)c=[r3[0]-rk[0],r3[1]-rk[1],r3[2]-rk[2],r3[3]-rk[3]];const l=Math.hypot(c[0],c[1],c[2])||1;o.set([c[0]/l,c[1]/l,c[2]/l,c[3]/l],k*4)});return o}
function cullPass(enc,vp,doSh){const c=enc.beginComputePass({timestampWrites:(GT&&!PROF)?{querySet:GT.qs,beginningOfPassWriteIndex:0}:tw('culling')});c.setPipeline(cullP);const pl=planesOf(vp),pls=doSh?planesOf(lightVP):null,p=cam.position;
 for(const sp of SPS){if(!sp.cbg||!sp.cnt)continue;
  const u=sp.uf||(sp.uf=new Float32Array(44));u.set(pl,0);u.set([p.x,p.y,p.z,0,...sp.sph,LODR*LODR,MIDR*MIDR,sp.mobile?350*350:CULLR*CULLR,sp.cnt,sp.geoF?1:0,sp.mobile?1:0,0,0],24);
  device.queue.writeBuffer(sp.uC,0,u);device.queue.writeBuffer(sp.args,0,new Uint32Array([sp.geoN.n,0,0,0,sp.geo.n,0,0,0,sp.geoF?sp.geoF.n:0,0,0,0]));c.setBindGroup(0,sp.cbg);c.dispatchWorkgroups(Math.ceil(sp.cnt/64));
  if(doSh&&sp.cbgS){const us=sp.ufS||(sp.ufS=new Float32Array(44));us.set(pls,0);us.set([p.x,p.y,p.z,0,...sp.sph,0,6400,6400,sp.cnt,0,0,0,0],24);
   device.queue.writeBuffer(sp.uS,0,us);device.queue.writeBuffer(sp.argsS,0,new Uint32Array([0,0,0,0,sp.geo.n,0,0,0,0,0,0,0]));c.setBindGroup(0,sp.cbgS);c.dispatchWorkgroups(Math.ceil(sp.cnt/64))}}
 c.end()}
function drawSpecies(p,alpha,shadow){for(const sp of SPS){if(!sp.geo||!sp.cnt||(!!sp.alpha)!==alpha)continue;if(shadow&&!CASTN.has(sp.n))continue;
 p.setPipeline(mkP([sp.wa,!!sp.alpha,shadow].join('|')));p.setBindGroup(1,sp.mu.bg);
 if(sp.geoN){if(shadow){p.setVertexBuffer(0,sp.geo.buf);p.setVertexBuffer(1,sp.oS);p.drawIndirect(sp.argsS,16)}
  else{p.setVertexBuffer(0,sp.geoN.buf);p.setVertexBuffer(1,sp.oN);p.drawIndirect(sp.args,0);p.setVertexBuffer(0,sp.geo.buf);p.setVertexBuffer(1,sp.oM);p.drawIndirect(sp.args,16);if(sp.geoF){p.setVertexBuffer(0,sp.geoF.buf);p.setVertexBuffer(1,sp.oF);p.drawIndirect(sp.args,32)}}}
 else{p.setVertexBuffer(0,sp.geo.buf);p.setVertexBuffer(1,sp.ibuf);p.draw(sp.geo.n,sp.cnt)}}}
var switching=false;
function frame(t,dep,sunD){
 if(switching)return;
 camBasis();const sk=SHK*SHK,sx=(Math.random()-.5)*sk*.22,sy=(Math.random()-.5)*sk*.16,view=M4.view([cam.position.x+camR.x*sx+camU.x*sy,cam.position.y+camR.y*sx+camU.y*sy,cam.position.z+camR.z*sx+camU.z*sy],[camR.x,camR.y,camR.z],[camU.x,camU.y,camU.z],[-camV.x,-camV.y,-camV.z]);const vpU=M4.mul(PROJ(),view),taaOn=QL>=3&&(DBGM&16384)===0&&!!TG.taa&&!!PP.taa;let vp=vpU;if(taaOn){const k=taaIdx8++&7,hx=hal(k+1,2)-.5,hy=hal(k+1,3)-.5;taaJ=[hx*2/TG.W,hy*2/TG.H];vp=M4.mul(new Float32Array([1,0,0,0,0,1,0,0,0,0,1,0,taaJ[0],taaJ[1],0,1]),vpU)}else taaJ=[0,0];
 const wantSh=!!texSh&&dep<110;const doSh=wantSh&&(shFrame++%Math.max(1,QS[QL].shE))===0;if(doSh)lightMatrix();shOn=wantSh?1:0;
 fillG(Gf,vp,t,dep,sunD);device.queue.writeBuffer(gBuf,0,Gf);
 const enc=device.createCommandEncoder();
 fineCheck();
 if(fineOn&&fineDirty){const c=enc.beginComputePass();c.setPipeline(terrPipeF);c.setBindGroup(0,terrBGF);c.dispatchWorkgroups(32,32);c.end();fineDirty=false}
 if(terrDirty){const c=enc.beginComputePass();c.setPipeline(terrPipe);c.setBindGroup(0,terrBG);c.dispatchWorkgroups(32,32);c.end();terrDirty=false}
 if((cFrame++%3)===0)fsp(enc,PP.cau,vCau,[bgDummy],false,'causticas');
 cullPass(enc,vp,doSh);
 plkStep(enc);
 if(doSh&&!(SKIP&&SKIP.has('sombras'))){fillG(GfS,lightVP,t,dep,sunD);device.queue.writeBuffer(gShBuf,0,GfS);
  const p=enc.beginRenderPass({colorAttachments:[],timestampWrites:tw('sombras'),depthStencilAttachment:{view:texSh.createView(),depthClearValue:1,depthLoadOp:'clear',depthStoreOp:'store'}});
  p.setBindGroup(0,bgSh);drawTerrain(p,true);drawStatic(p,STAT,true);drawSpecies(p,false,true);p.end()}
 const p=enc.beginRenderPass({timestampWrites:tw('principal'),colorAttachments:[{view:SC>1?TG.v.ms:TG.v.hdr,resolveTarget:SC>1?TG.v.hdr:undefined,clearValue:{r:0,g:0,b:0,a:1},loadOp:'clear',storeOp:SC>1?'discard':'store'}],
  depthStencilAttachment:{view:TG.v.depth,depthClearValue:1,depthLoadOp:'clear',depthStoreOp:'store'}});
 p.setBindGroup(0,bg0);p.setPipeline(PP.bgf);p.draw(3);if(!(SKIP&&SKIP.has('terreno')))drawTerrain(p,false);if(fineOn&&!(SKIP&&SKIP.has('terreno')))drawTerrainF(p);if(!(SKIP&&SKIP.has('estaticos')))drawStatic(p,STAT,false);if(!(SKIP&&SKIP.has('especies')))drawSpecies(p,false,false);
 if(dep<160&&!(SKIP&&SKIP.has('superficie'))){p.setPipeline(PP.surf);p.draw(4)}
 if(!(SKIP&&SKIP.has('especies')))drawSpecies(p,true,false);
 if(!(SKIP&&SKIP.has('nieve'))){p.setPipeline(PP.snow);p.draw(4,4000)}
 p.setPipeline(PP.puff);p.setVertexBuffer(0,puffBuf);p.draw(4,256);
 p.setPipeline(PP.plk);p.setBindGroup(1,pkRBG);p.draw(4,PKN);
 if(!(SKIP&&SKIP.has('conos'))){p.setPipeline(PP.cone);p.setVertexBuffer(0,coneV.buf);p.draw(coneV.n,2)}p.end();
 fsp(enc,PP.dep,TG.v.z,[bg0,TG.bg.dep],false,'profundidad');
 if(QL>=3&&!focusBusy&&(focusN++%6)===0){focusBuf=focusBuf||device.createBuffer({size:256,usage:GPUBufferUsage.COPY_DST|GPUBufferUsage.MAP_READ});enc.copyTextureToBuffer({texture:TG.z,origin:[TG.W>>1,TG.H>>1]},{buffer:focusBuf,bytesPerRow:256},[1,1]);focusBusy=true;focusPend=true}
 if(taaOn){const valid=taaPrev&&Math.hypot(cam.position.x-taaPrevCam[0],cam.position.y-taaPrevCam[1],cam.position.z-taaPrevCam[2])<8&&SHK<.05&&!taaReset;
  const u=new Float32Array(24);if(taaPrev)u.set(taaPrev,0);u[16]=taaJ[0];u[17]=taaJ[1];u[20]=valid?1:0;device.queue.writeBuffer(taaU,0,u);
  const o=1-taaH;fsp(enc,PP.taa,TG.v.taa[o],[bg0,TG.bg.taa[taaH]],false,'taa');enc.copyTextureToTexture({texture:TG.taa[o]},{texture:TG.hdr},[TG.W,TG.H]);taaH=o;taaReset=false}
 taaPrev=vpU;taaPrevCam=[cam.position.x,cam.position.y,cam.position.z];
 fsp(enc,PP.rays,TG.v.rays,[bg0,TG.bg.rays],false,'rayos');
 fsp(enc,PP.kar,TG.v.bl[0],[bg0,TG.bg.kar],false,'bloom-umbral');
 for(let i=1;i<3;i++)fsp(enc,PP.down,TG.v.bl[i],[bg0,TG.bg.down[i]],false,i===2?'bloom-fin':'bloom-bajada');
 fsp(enc,PP.fin,ctx.getCurrentTexture().createView(),[bg0,TG.bg.fin],false,'final');
 if(PROF){enc.resolveQuerySet(PROF.qs,0,2*PROF.n,PROF.rb,0);enc.copyBufferToBuffer(PROF.rb,0,PROF.mb,0,16*PROF.n)}
 else if(GT&&!GT.busy[GT.idx]){enc.resolveQuerySet(GT.qs,0,2,GT.rb,0);enc.copyBufferToBuffer(GT.rb,0,GT.ring[GT.idx],0,16);GT.cur=GT.idx;GT.idx=(GT.idx+1)%3}
 device.queue.submit([enc.finish()]);
 if(focusPend){focusPend=false;focusBuf.mapAsync(GPUMapMode.READ).then(()=>{const z=new Float32Array(focusBuf.getMappedRange().slice(0,4))[0];focusBuf.unmap();focusBusy=false;focusT=z>.99999?10:Math.max(1.2,Math.min(20,120/(600-z*599.8)));}).catch(()=>{focusBusy=false})}
 focusV=Math.exp(Math.log(focusV)+(Math.log(focusT)-Math.log(focusV))*.12);
 if(GT&&GT.cur>=0){const i=GT.cur;GT.cur=-1;GT.busy[i]=true;GT.ring[i].mapAsync(GPUMapMode.READ).then(()=>{const a=new BigUint64Array(GT.ring[i].getMappedRange().slice(0));GT.ring[i].unmap();GT.busy[i]=false;const ms=Number(a[1]-a[0])/1e6;if(ms>0&&ms<250)GT.ms=GT.ms?GT.ms*.85+ms*.15:ms}).catch(()=>{GT.busy[i]=false})}}
function rs(){buildTargets()}addEventListener('resize',()=>{if(PP.fin)rs()});
function setQ(q,reset){const oldSC=SC;QL=q;LODR=[35,60,80,110,140][q];MIDR=LODR+12;try{localStorage.hadalQ=q}catch(e){}if(reset!==false)RS=QS[q].rs0;RS=Math.min(RS,QS[q].rsMax);
 const go=async()=>{switching=true;try{if(QS[q].ms!==oldSC){SC=QS[q].ms;await buildPipes()}buildShadow();buildTargets();rebuild()}finally{switching=false}
  document.querySelectorAll('#ql button').forEach(b=>b.classList.toggle('on',+b.dataset.q===q))};go()}
