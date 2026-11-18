// ================= INSTANCIAS (spawner) =================
function put(sp,x,y,z,sx,sy,sz,yaw,t3,cx,cy,cz,w){if(sp.cnt>=sp.cap)return;const i=sp.cnt++,A=sp.inst,o=i*24,c=Math.cos(yaw),s=Math.sin(yaw);
 A[o]=c*sx;A[o+1]=0;A[o+2]=-s*sx;A[o+3]=0;A[o+4]=0;A[o+5]=sy;A[o+6]=0;A[o+7]=0;A[o+8]=s*sz;A[o+9]=0;A[o+10]=c*sz;A[o+11]=0;A[o+12]=x;A[o+13]=y;A[o+14]=z;A[o+15]=1;
 A[o+16]=t3[0];A[o+17]=t3[1];A[o+18]=t3[2];A[o+19]=1;A[o+20]=cx;A[o+21]=cy;A[o+22]=cz;A[o+23]=w}
const CS=50;let last={x:1e9,z:1e9,y:1e9};
//REBUILD//

// ================= CONTROL =================
let yaw=-Math.PI/2,pitch=-.05,drag=null,lampAmb=true,lampMode=1,lowCnt=0,tgo=0,tup=0,tdn=0;
const keys={};addEventListener('keydown',e=>{keys[e.code]=1;if(e.code==='KeyL'&&!e.repeat){lampMode=(lampMode+1)%3;lampAmb=lampMode>0;lampToast(['Luces apagadas','Luces normales','Reflectores amplios (ver cascos completos)'][lampMode])}if(e.code==='KeyF'&&!e.repeat){sonarPing()}if(e.code==='KeyJ'&&!e.repeat){jrToggle()}if(e.code==='KeyT'&&!e.repeat){tour?tourStop('Recorrido detenido'):tourStart()}if(tour&&/^(KeyW|KeyA|KeyS|KeyD|Space|KeyC|Arrow)/.test(e.code)){tourStop('Control manual')}if(e.code==='KeyM')mute()});addEventListener('keyup',e=>keys[e.code]=0);
const vel=new T.Vector3(),f=new T.Vector3(),rr=new T.Vector3(),tv=new T.Vector3();
canvas.addEventListener('pointerdown',e=>{drag=[e.clientX,e.clientY];canvas.setPointerCapture(e.pointerId);audio()});
canvas.addEventListener('pointermove',e=>{if(!drag)return;yaw-=(e.clientX-drag[0])*.0035;pitch=clamp(pitch-(e.clientY-drag[1])*.0035,-1.5,1.5);drag=[e.clientX,e.clientY]});
canvas.addEventListener('pointerup',()=>drag=null);addEventListener('keydown',audio,{once:true});
for(const[id,fn]of[['go',v=>tgo=v],['up',v=>tup=v],['dn',v=>tdn=v]]){const b=$(id);b.addEventListener('pointerdown',()=>{fn(1);audio()});b.addEventListener('pointerup',()=>fn(0));b.addEventListener('pointerleave',()=>fn(0))}
function tp(x,off,pitchv=-.1){const z=0,df=base(x);cam.position.set(x-off,-Math.max(3,df-12),z);yaw=-Math.PI/2;pitch=pitchv;vel.set(0,0,0);rebuild();terrain()}
const DEST=[['Superficie',500,0,-.05,4],['Bosque de kelp · 26 m',560,0,-.15],['Ledge de esponjas · ~115 m',1400,50],['Corales de agua fría · ~335 m',2400,40],['Galeón San José · ~600 m',3300,34,-.05],
 ['Fumarolas negras · ~2.600 m',6080,50,-.1],['Titanic · ~3.800 m',8200,40,-.03],['Airbus A330 AF447 · ~3.900 m',9500,32,-.05],['Acorazado Bismarck · 4.791 m',11300,58,-.03],['Llanura de nódulos · ~5.600 m',13300,40],['USS Samuel B. Roberts · ~6.900 m',15150,38,-.05],['Fondo de la fosa · ~8.100 m',17500,40]];
{const d=$('dest');for(const q of DEST){const b=document.createElement('button');b.textContent=q[0];b.onclick=()=>{if(q[4]){cam.position.set(q[1],-q[4],0);yaw=-Math.PI/2;pitch=q[3];vel.set(0,0,0);rebuild();terrain()}else tp(q[1],q[2],q[3]||-.1);audio()};d.appendChild(b)}}
//AUDIO//

// ================= HUD y DETECCIÓN =================
const ZN=d=>d<200?'Zona epipelágica (con luz)':d<1000?'Zona mesopelágica (crepuscular)':d<4000?'Zona batipelágica (oscuridad total)':d<6000?'Zona abisopelágica':'Zona hadal (fosa)';
const tmp=new T.Vector3();
function entPos(sp,i,t,o){const A=sp.inst,b=i*24;if(sp.mode===0){o.set(A[b+12],A[b+13],A[b+14]);return}
 const w=A[b+23],ph0=w*6.2831853,a=sp.W*t*(.6+.8*(w*7.3%1))+ph0,R=sp.R*(.5+(w*3.7%1)),ox=A[b+12]-A[b+20],oy=A[b+13]-A[b+21],oz=A[b+14]-A[b+22],c=Math.cos(-a),s=Math.sin(-a);
 o.set(A[b+20]+Math.cos(a)*R+c*ox+s*oz,A[b+21]+Math.sin(a*1.3+ph0)*sp.R*.08+oy,A[b+22]+Math.sin(a)*R-s*ox+c*oz)}
const seen=new Set();let shown=null;const NCAT=SPS.filter(s=>!s.nocat&&s.geo).length+Object.keys(WR).length+Object.keys(LIFEC).length;
function show(c){if(shown===c)return;shown=c;const el=$('card');if(!c){el.style.display='none';return}
 el.innerHTML='<b>'+c.n+'</b> <i>'+(c.l||'')+'</i><div class="n">'+(c.d?'Rango aprox.: '+c.d[0].toLocaleString('es')+'–'+c.d[1].toLocaleString('es')+' m':'')+'</div><div class="n">'+c.note+'</div><div class="n" style="opacity:.7;font-size:11.5px">'+(c.vq?'⚠ '+c.vq:'✔ '+(c.src||'Verificado en fuentes (nov. 2026)'))+'</div>';el.style.display='block';jrAdd(c,-cam.position.y);
 if(!seen.has(c.n)){seen.add(c.n);$('cnt').textContent='· '+seen.size+'/'+NCAT}}
function detect(t){let best=null,bs=1e9;camBasis();f.copy(camV);const cp=cam.position;
 for(const sp of SPS){if(!sp.geo||!sp.cnt||sp.nocat)continue;const dm=sp.det||20,st=sp.cnt>600?3:1;
  for(let i=0;i<sp.cnt;i+=st){entPos(sp,i,t,tmp);const dx=tmp.x-cp.x,dy=tmp.y-cp.y,dz=tmp.z-cp.z,d=Math.hypot(dx,dy,dz);if(d>dm||d<.3)continue;const dot=(dx*f.x+dy*f.y+dz*f.z)/d;if(dot<.94)continue;const s=d*(2-dot);if(s<bs){bs=s;best=sp}}}
 let wr=null,wd=1e9;
 for(const k in WR){const w=WR[k],d=Math.hypot(w.x-cp.x,w.y-cp.y,w.z-cp.z);if(d<w.rad*3&&d<wd){const dot=((w.x-cp.x)*f.x+(w.y-cp.y)*f.y+(w.z-cp.z)*f.z)/d;if(dot>.6){wr=w;wd=d}}}
 let lf=null,lfd=1e9;for(const it of LIFE){const dx=WR.titanic.x+it.p[0]-cp.x,dy=WR.titanic.y+it.p[1]-cp.y,dz=it.p[2]-cp.z,d=Math.hypot(dx,dy,dz);if(d>9||d<.2)continue;const dot=(dx*f.x+dy*f.y+dz*f.z)/d;if(dot<.985)continue;const q=d*(2-dot);if(q<lfd){lfd=q;lf=it.c}}
 show(lf||(wr?{n:wr.n,l:wr.l,note:wr.note,src:wr.src}:best))}

// ================= ARRANQUE Y BUCLE =================
const dive=$('dive');dive.disabled=true;dive.textContent='Preparando el océano…';
window.__st=()=>SPS.filter(s=>s.cnt).map(s=>s.n+':'+s.cnt).join(' | ');window.__go=(x,dep,z,yw,p)=>{cam.position.set(x,-dep,z);yaw=yw;pitch=p;rebuild();terrain()};
{const st=$('start');dive.onclick=()=>{st.style.display='none';audio();startIntro()};document.querySelectorAll('#ql button').forEach(b=>b.onclick=()=>setQ(+b.dataset.q));
 if(/directo|debug/.test(location.hash))st.style.display='none';
 addEventListener('keydown',e=>{if(e.code==='KeyG'&&st.style.display==='none')setQ((QL+1)%5);if(e.code==='KeyH'){perfOn=!perfOn;$('perf').style.display=perfOn?'block':'none'}})}
await buildPipes();buildShadow();buildTargets();await initTextures();rebuild();terrain();
document.querySelectorAll('#ql button').forEach(b=>b.classList.toggle('on',+b.dataset.q===QL));dive.disabled=false;dive.textContent='Sumergirse';
if(location.hash==='#debug')window.__bench=async(n=40)=>{await device.queue.onSubmittedWorkDone();const t0=performance.now();for(let i=0;i<n;i++)frame(i*.016,-cam.position.y,Math.exp(-(-cam.position.y)*.02));await device.queue.onSubmittedWorkDone();return +((performance.now()-t0)/n).toFixed(2)};
if(location.hash==='#debug')window.__prof=async(n=20)=>{if(!device.features.has('timestamp-query'))return 'sin timestamp-query';const acc={};for(let k=0;k<n;k++){PROF={qs:device.createQuerySet({type:'timestamp',count:64}),rb:device.createBuffer({size:512,usage:GPUBufferUsage.QUERY_RESOLVE|GPUBufferUsage.COPY_SRC}),mb:device.createBuffer({size:512,usage:GPUBufferUsage.MAP_READ|GPUBufferUsage.COPY_DST}),n:0,names:[]};frame(k*.016,-cam.position.y,Math.exp(-(-cam.position.y)*.02));await device.queue.onSubmittedWorkDone();await PROF.mb.mapAsync(GPUMapMode.READ);const a=new BigUint64Array(PROF.mb.getMappedRange().slice(0));PROF.names.forEach((nm,i)=>{acc[nm]=(acc[nm]||0)+Number(a[2*i+1]-a[2*i])/1e6});PROF.mb.unmap();PROF.qs.destroy();PROF=null}
 let tot=0;for(const k in acc){acc[k]=+(acc[k]/n).toFixed(3);tot+=acc[k]}acc.TOTAL=+tot.toFixed(2);return acc};
if(location.hash==='#debug')window.__cpu=async(n=40)=>{await device.queue.onSubmittedWorkDone();const t0=performance.now();for(let i=0;i<n;i++)frame(i*.016,-cam.position.y,Math.exp(-(-cam.position.y)*.02));const t1=performance.now();await device.queue.onSubmittedWorkDone();const t2=performance.now();return{cpu_ms:+((t1-t0)/n).toFixed(2),total_ms:+((t2-t0)/n).toFixed(2)}};
if(location.hash==='#debug')window.__skip=l=>{SKIP=l&&l.length?new Set(l):null};
if(location.hash==='#debug')window.__gt=()=>({gpu_ms:GT&&GT.ms?+GT.ms.toFixed(2):null,RS:+RS.toFixed(2),LODR:Math.round(LODR)});
if(location.hash==='#debug')window.__setrs=v=>{RS=v;buildTargets();return [TG.W,TG.H]};
if(location.hash==='#debug')window.__dbg=m=>{DBGM=m};
if(location.hash==='#debug')window.__lod=(r,c,m)=>{LODR=r;if(c)CULLR=c;if(m)MIDR=m};
if(location.hash==='#debug')window.__vis=async()=>{const rd=[];for(const sp of SPS){if(!sp.args||!sp.cnt)continue;const st=device.createBuffer({size:48,usage:GPUBufferUsage.MAP_READ|GPUBufferUsage.COPY_DST}),e=device.createCommandEncoder();e.copyBufferToBuffer(sp.args,0,st,0,48);device.queue.submit([e.finish()]);rd.push([sp,st])}
 let tris=0,vis=0,tot=0;for(const [sp,st] of rd){await st.mapAsync(GPUMapMode.READ);const a=new Uint32Array(st.getMappedRange().slice(0));st.unmap();st.destroy();const n=a[1],m=a[5],f=a[9];tris+=(n*a[0]+m*a[4]+f*a[8])/3;vis+=n+m+f;tot+=sp.cnt}return{Mtris:+(tris/1e6).toFixed(2),visibles:vis,total:tot}};
if(location.hash==='#debug')window.__mob=()=>SPS.filter(s=>s.mobile&&s.cnt>0).map(s=>({n:s.n,cnt:s.cnt,R:s.R,p:[...s.inst.slice(20,23)].map(Math.round)}));
if(location.hash==='#debug')window.__sps=()=>SPS;
if(location.hash==='#debug')window.__shk=()=>[SHK,window.__hitT||0];
if(location.hash==='#debug')window.__look=(nm,dist=2.5,ahead=0)=>{const t=performance.now()/1000;let best=null,bd=1e9,bs=null,bi=0;for(const sp of SPS){if(sp.n!==nm||!sp.cnt)continue;for(let i=0;i<sp.cnt;i++){entPos(sp,i,t,tmp);const d=tmp.distanceTo(cam.position);if(d<bd){bd=d;best=tmp.clone();bs=sp;bi=i}}}
 if(!best)return null;if(ahead){entPos(bs,bi,t+.5,tmp);const v=tmp.clone().sub(best).normalize();best.addScaledVector(v,ahead)}const f=best.clone().sub(cam.position).normalize();cam.position.copy(best).addScaledVector(f,-dist);yaw=Math.atan2(-f.x,-f.z);pitch=Math.asin(f.y);return bd};
if(location.hash==='#debug')window.__look2=(nm,dist=3,el=.5,az=0)=>{const t=performance.now()/1000;let best=null,bd=1e9;for(const sp of SPS){if(sp.n!==nm||!sp.cnt)continue;for(let i=0;i<sp.cnt;i++){entPos(sp,i,t,tmp);const d=tmp.distanceTo(cam.position);if(d<bd){bd=d;best=tmp.clone()}}}
 if(!best)return null;cam.position.set(best.x+dist*Math.cos(el)*Math.sin(az),best.y+dist*Math.sin(el),best.z+dist*Math.cos(el)*Math.cos(az));const f=best.clone().sub(cam.position).normalize();yaw=Math.atan2(-f.x,-f.z);pitch=Math.asin(f.y);return bd};
if(location.hash==='#debug')window.__near=()=>{const t=performance.now()/1000,cp=cam.position,o=[];for(const sp of SPS){if(!sp.cnt||!sp.mobile)continue;for(let i=0;i<sp.cnt;i++){entPos(sp,i,t,tmp);o.push({n:sp.n,d:+Math.hypot(tmp.x-cp.x,tmp.y-cp.y,tmp.z-cp.z).toFixed(1),r:+(sp.sph[0]*Math.max(Math.hypot(sp.inst[i*24],sp.inst[i*24+2]),sp.inst[i*24+5])).toFixed(1),R:sp.R,s:+Math.hypot(sp.inst[i*24],sp.inst[i*24+2]).toFixed(2)})}}o.sort((a,b)=>a.d-b.d);return o.slice(0,6)};
if(location.hash==='#debug')window.__spot=(n,size,yaw=0,sy)=>{const sp=SPS.find(s=>s.n===n);device.queue.writeBuffer(sp.mu.buf,0,new Float32Array([0]));sp.cnt=0;camBasis();const p=cam.position,x=p.x+camV.x*size*1.5,y=p.y+camV.y*size*1.5,z=p.z+camV.z*size*1.5;put(sp,x,y,z,size,sy||size,size,yaw,[1,1,1],x,y,z,.3);upl(sp)};
if(location.hash==='#debug')window.__gpu={device,get TG(){return TG},get PP(){return PP},SPS,STAT,cam,tvb,floorAt,UB,matWreck,LIFE,WR};
let lastT=performance.now(),fr=0,gAcc=0,gN=0;

// ---- transición superficie/agua: gotas en el vidrio al emerger y burbujas al sumergirse ----
{const st=document.createElement('style');st.textContent='#lensfx{position:fixed;inset:0;pointer-events:none;z-index:3;overflow:hidden}#lensfx .dr{position:absolute;border-radius:50%;background:radial-gradient(circle at 34% 28%,rgba(255,255,255,.7),rgba(255,255,255,.12) 38%,rgba(140,190,205,.16) 68%,rgba(0,10,20,.28));box-shadow:inset 0 -2px 3px rgba(255,255,255,.18),0 1px 2px rgba(0,0,0,.35);backdrop-filter:blur(1.6px) saturate(1.25);transition:opacity 6s ease-in,transform 6s ease-in}#lensfx .bu{position:absolute;border-radius:50%;border:1px solid rgba(220,245,255,.55);background:radial-gradient(circle at 35% 30%,rgba(255,255,255,.5),rgba(255,255,255,.05) 60%);transition:opacity 1.6s ease-out,transform 1.8s ease-out}#lensfx .fl{position:absolute;inset:0;transition:opacity 1.3s ease-out}';document.head.appendChild(st)}
let lensEl=null;
function lensFX(emerged){if(!lensEl){lensEl=document.createElement('div');lensEl.id='lensfx';document.body.appendChild(lensEl)}
 const W=innerWidth,H=innerHeight,rnd=Math.random;
 if(emerged){const fl=document.createElement('div');fl.className='fl';fl.style.background='linear-gradient(180deg,rgba(235,250,255,.55),rgba(190,225,235,.18) 55%,rgba(0,0,0,0))';lensEl.appendChild(fl);requestAnimationFrame(()=>{fl.style.opacity='0'});setTimeout(()=>fl.remove(),1500);
  for(let i=0;i<46;i++){const d=document.createElement('div');d.className='dr';const sz=5+rnd()*rnd()*46;d.style.cssText+='width:'+sz+'px;height:'+sz*(1+rnd()*.35)+'px;left:'+rnd()*W+'px;top:'+rnd()*H*.9+'px;opacity:'+(.65+rnd()*.35);lensEl.appendChild(d);
   setTimeout(()=>{d.style.opacity='0';d.style.transform='translateY('+(20+rnd()*120)+'px)'},300+rnd()*2600);setTimeout(()=>d.remove(),9500)}}
 else{const fl=document.createElement('div');fl.className='fl';fl.style.background='radial-gradient(ellipse at 50% 30%,rgba(255,255,255,.8),rgba(210,240,250,.45) 45%,rgba(120,200,230,.15))';lensEl.appendChild(fl);requestAnimationFrame(()=>{fl.style.opacity='0'});setTimeout(()=>fl.remove(),1500);
  for(let i=0;i<70;i++){const b=document.createElement('div');b.className='bu';const sz=3+rnd()*rnd()*30;b.style.cssText+='width:'+sz+'px;height:'+sz+'px;left:'+rnd()*W+'px;top:'+(H*(.35+rnd()*.65))+'px;opacity:.9';lensEl.appendChild(b);
   requestAnimationFrame(()=>{b.style.opacity='0';b.style.transform='translateY(-'+(120+rnd()*H*.5)+'px)'});setTimeout(()=>b.remove(),2100)}}}

// ---- arranque cinematográfico: tormenta en la superficie, título y descenso hasta el bosque de kelp ----
var INTRO=null;
function startIntro(){if(window.__noIntro||(location.hash==='#debug'&&!window.__forceIntro))return;const t0=performance.now()/1000;cam.position.set(480,oceanH(480,0,t0)+1.7,0);yaw=-Math.PI/2-.35;pitch=.05;vel.set(0,0,0);window.__afloat=true;rebuild();terrain();
 INTRO={t:0,yaw0:yaw};
 let el=document.getElementById('introT');if(!el){el=document.createElement('div');el.id='introT';el.style.cssText='position:fixed;inset:0;z-index:5;pointer-events:none;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#eaf6fb;font-family:Inter,system-ui,sans-serif;text-shadow:0 2px 30px #000;opacity:0;transition:opacity 2.2s ease';el.innerHTML='<div style="font-size:min(14vw,120px);font-weight:800;letter-spacing:.14em">HADAL</div><div style="font-size:min(3.2vw,22px);letter-spacing:.2em;opacity:.8;margin-top:6px">DE LA SUPERFICIE A 8.100 METROS</div>';document.body.appendChild(el)}
 requestAnimationFrame(()=>{el.style.opacity='1'});setTimeout(()=>{el.style.opacity='0'},4800);setTimeout(()=>el.remove(),7500);
 const skip=()=>{INTRO=null;window.__afloat=false;removeEventListener('keydown',skip);removeEventListener('pointerdown',skip);const e=document.getElementById('introT');if(e)e.remove()};
 setTimeout(()=>{addEventListener('keydown',skip);addEventListener('pointerdown',skip)},800)}
function loop(now){requestAnimationFrame(loop);const dt=Math.min((now-lastT)/1000,.05);lastT=now;const t=now/1000;fr++;tourTick(dt);
 camBasis();f.copy(camV);rr.copy(camR);
 const ax=(keys.KeyD||keys.ArrowRight?1:0)-(keys.KeyA||keys.ArrowLeft?1:0),az=(keys.KeyW||keys.ArrowUp?1:0)-(keys.KeyS||keys.ArrowDown?1:0)+tgo,ay=(keys.Space?1:0)-(keys.KeyC?1:0)+tup-tdn;
 const sh=keys.ShiftLeft||keys.ShiftRight;tv.set(0,0,0).addScaledVector(f,az).addScaledVector(rr,ax);if(tv.lengthSq()>0)tv.normalize().multiplyScalar(sh?26:9);
 if(ay)tv.y+=ay*(keys.KeyQ?200:sh?26:9);
 if(INTRO){INTRO.t+=dt;if(INTRO.t<6.5){window.__afloat=true;yaw=INTRO.yaw0+INTRO.t*.075;pitch+=(.07-pitch)*dt}else if(INTRO.t<15){window.__afloat=false;tv.set(0,-Math.min(8,(INTRO.t-6.5)*2.2),0);pitch+=(.22-pitch)*dt*.7}else{INTRO=null}}
 vel.lerp(tv,1-Math.exp(-dt*2.5));cam.position.addScaledVector(vel,dt);
 const p=cam.position,dfl=floorAt(p.x,p.z);const y0=p.y;const swH=oceanH(p.x,p.z,t);
 if(ay>0&&p.y>swH-1.6)window.__afloat=true;else if(ay<0)window.__afloat=false;
 if(window.__afloat){p.y+=(swH+1.7-p.y)*Math.min(1,dt*7);vel.y*=.3}
 else if(p.y>swH-1){p.y-=(p.y-(swH-1))*Math.min(1,dt*9);if(vel.y>0)vel.y*=.5}
 p.y=clamp(p.y,-(dfl-2.5),swH+6);p.x=Math.max(p.x,60);{const fx=-Math.sin(yaw),fz=-Math.cos(yaw),hx=(oceanH(p.x+6,p.z,t)-oceanH(p.x-6,p.z,t))/12,hz=(oceanH(p.x,p.z+6,t)-oceanH(p.x,p.z-6,t))/12,sf=hx*fx+hz*fz,sr=hx*fz*-1+hz*fx;
  const wantP=window.__afloat?Math.atan(sf)*.55:0,wantR=window.__afloat?Math.atan(sr)*.5:0;PBOB+=(wantP-PBOB)*Math.min(1,dt*3);ROLL+=(wantR-ROLL)*Math.min(1,dt*3)}
 {const nowAb=p.y>swH+.2;if(nowAb!==!!window.__above&&t>2)lensFX(nowAb);window.__above=nowAb}
 {const ct=p.y>y0+.0005,into=Math.max(-vel.y,0)+Math.hypot(vel.x,vel.z)*.08,first=ct&&!window.__wasC;window.__wasC=ct;if(first&&into>4&&t>(window.__hitT||0)+.7){window.__hitT=t;SHK=Math.min(1,.25+into/14);if(p.y>y0)vel.y=Math.max(vel.y,0)*.2}
  SHK=Math.max(0,SHK-dt*1.8);SO[2]=SHK}
 if(Math.abs(Math.floor(p.x/CS)-last.x)>=1||Math.abs(Math.floor(p.z/CS)-last.z)>=1||Math.abs(Math.floor(-p.y/CS)-last.y)>=1)rebuild();
 if(Math.hypot(p.x-tc.x,p.z-tc.z)>35)terrain();
 const dep=-p.y,sun=Math.exp(-Math.max(dep,0)*.02);
 if(dr){dr.frequency.value=70-Math.min(dep,8000)/220;fl.frequency.value=260-Math.min(dep,8000)/40}
 if(fr%5===0)detect(t);
 if(fr%6===0){$('dp').textContent=window.__above||dep<=1?'Superficie':Math.round(dep).toLocaleString('es')+' m';$('zn').textContent=window.__above?'Mar gruesa · olas de hasta ~20 m':dep<=1?'Bajo las olas':ZN(dep);
  const dp0=Math.max(dep,0),temp=2+16*Math.exp(-dp0/350),pr=1+dp0/10.06;$('st').textContent=pr.toFixed(0)+' bar · '+temp.toFixed(1)+' °C · luz solar '+(sun>.001?(sun*100).toFixed(sun<.1?1:0)+' %':'0 %')+' · fondo a '+Math.round(dfl-dep)+' m'}
 {const ex=.5+.42*(1-Math.pow(sun,.35));exposure+=(ex-exposure)*Math.min(1,dt*2)}
 {const hh=dfl-dep,th=Math.hypot(tv.x,tv.z)+Math.max(-tv.y,0)*1.3,spd=Math.max(Math.hypot(vel.x,vel.z)+Math.max(-vel.y,0),th*.5),dn=ay<0?1:0;
  if(hh<12&&spd>1.2){puffAcc+=dt*Math.min(spd,12)*2.2*Math.pow(1-hh/12,1.5)*(1+.5*dn);let nn=0;while(puffAcc>=1&&nn++<6){puffAcc--;const sp=.6+.6*dn,px=p.x-f.x*3-vel.x*.3+(Math.random()-.5)*sp*2,pz=p.z-f.z*3-vel.z*.3+(Math.random()-.5)*sp*2;puffs.set([px,-floorAt(px,pz)+.25,pz,t],puffI*4);puffI=(puffI+1)%256}}puffAcc=Math.min(puffAcc,4);device.queue.writeBuffer(puffBuf,0,puffs)}
 audioTick(t,Math.max(dep,0),!!window.__above); plkUpdate(t,dt,vel.length());sonarTick(t);
 if(!PROF)frame(t,dep,sun);
 fpsS+=(dt*1000-fpsS)*.05;if(perfOn&&fr%10===0)$('perf').textContent=(1000/fpsS).toFixed(0)+' fps · '+fpsS.toFixed(1)+' ms · render '+Math.round(RS*100)+' % ('+TG.W+'×'+TG.H+') · calidad '+['baja','media','alta','ultra','premium'][QL]+' · WebGPU'+(texSh&&dep<110?' · sombras':'');
 gAcc+=dt*1000;gN++;if(now<9000){gAcc=0;gN=0}if(gAcc>1600){const a0=gAcc/gN,gm=GT&&GT.ms,a=gm?(a0>24?Math.max(a0,gm):gm*1.3):a0;let k=1;if(a>19.5)k=.92;else if(a<13.8&&RS<QS[QL].rsMax)k=1.06;if(a>19.5&&RS<=.5)LODR=Math.max(LODR*.9,20);else if(a<13.8&&RS>=QS[QL].rsMax-.01)LODR=Math.min(LODR*1.05,[40,70,100,160,200][QL]);MIDR=LODR+12;
  if(k!==1&&!switching){RS=clamp(RS*k,QL<3?.3:.45,QS[QL].rsMax);buildTargets()}
  if(QL>=3&&!switching&&!window.__nodown){if(a>19.5&&RS<=.5){if(++lowCnt>=2){lowCnt=0;const pq=QL,nq=QL-1;setQ(nq);lampToast('Tu GPU no sostiene '+['','','','Ultra','Premium'][pq]+': paso a '+['Bajo','Medio','Alto','Ultra'][nq])}}else lowCnt=0}gAcc=gN=0}}
requestAnimationFrame(loop);
setTimeout(()=>{$('hint').style.transition='opacity 2s';$('hint').style.opacity=.0},20000);

// ================= CABINA DEL MINISUBMARINO (marco de ventanilla de acrílico; tecla V la muestra u oculta) =================
{const cv=document.createElement('canvas');cv.id='cabina';cv.style.cssText='position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:2';document.body.appendChild(cv);
 const gv=document.createElement('canvas');gv.id='cabinaG';gv.style.cssText='position:fixed;pointer-events:none;z-index:2';document.body.appendChild(gv);
 const st=document.createElement('style');st.textContent='.p,#hud,#card{z-index:3}#hint{bottom:30px!important;z-index:3;left:96px!important;right:96px!important}@media (pointer:coarse){#hint{display:none}}@keyframes led{0%,100%{opacity:1}50%{opacity:.35}}.led{animation:led 2.4s infinite}.ld{position:fixed;border-radius:50%;z-index:2;pointer-events:none}';document.head.appendChild(st);
 const leds=[[.915,'#3dff8a'],[.935,'#ffb23d'],[.955,'#3dff8a'],[.975,'#58b8ff']].map(([f,c],k)=>{const d=document.createElement('div');d.className='ld'+(k%2?' led':'');d.style.background=c;d.style.boxShadow='0 0 6px 1px '+c+',inset 0 -1px 2px #0006';document.body.appendChild(d);return[d,f]});
 let GW=0,GCX=0,GCY=0,S2g=0;const mk=id=>{const e=document.createElement('canvas');e.id=id;e.style.cssText='position:fixed;pointer-events:none;z-index:2';document.body.appendChild(e);return e},kv=mk('cabinaK'),lv=mk('cabinaL');
 const rnd=(()=>{let s=12345;return()=>(s=(s*1664525+1013904223)>>>0)/4294967296})();
 const draw=()=>{const w=innerWidth,h=innerHeight,dpr=Math.min(devicePixelRatio||1,2),cx=w/2,cy=h/2,rx=w*.505,ry=h*.525,sw=Math.max(14,w*.017);
  cv.width=Math.round(w*dpr);cv.height=Math.round(h*dpr);const c=cv.getContext('2d');c.setTransform(dpr,0,0,dpr,0,0);c.clearRect(0,0,w,h);
  // casco interior: chapa cepillada con paneles y juntas
  let g=c.createLinearGradient(0,0,w,h);g.addColorStop(0,'#1a2026');g.addColorStop(.5,'#0b0e12');g.addColorStop(1,'#151a20');c.fillStyle=g;c.fillRect(0,0,w,h);
  for(let i=0;i<900;i++){const x=rnd()*w,y=rnd()*h,l=20+rnd()*140;c.strokeStyle=rnd()<.5?'rgba(255,255,255,'+(.012+rnd()*.03)+')':'rgba(0,0,0,'+(.05+rnd()*.12)+')';c.lineWidth=.6;c.beginPath();c.moveTo(x,y);c.lineTo(x+l,y+(rnd()-.5)*.8);c.stroke()}
  c.strokeStyle='rgba(0,0,0,.7)';c.lineWidth=2;for(const f of[.12,.88]){c.beginPath();c.moveTo(w*f,0);c.lineTo(w*f,h);c.stroke()}c.beginPath();c.moveTo(0,h*.14);c.lineTo(w,h*.14);c.moveTo(0,h*.86);c.lineTo(w,h*.86);c.stroke();
  c.strokeStyle='rgba(255,255,255,.07)';c.lineWidth=1;for(const f of[.12,.88]){c.beginPath();c.moveTo(w*f+2,0);c.lineTo(w*f+2,h);c.stroke()}
  // tornillos de panel en las esquinas
  const bolt=(x,y,r)=>{c.fillStyle='rgba(0,0,0,.55)';c.beginPath();c.arc(x+r*.25,y+r*.3,r*1.05,0,6.3);c.fill();const rg=c.createRadialGradient(x-r*.3,y-r*.3,r*.1,x,y,r);rg.addColorStop(0,'#c9d1d6');rg.addColorStop(.6,'#6d7780');rg.addColorStop(1,'#2a3036');c.fillStyle=rg;c.beginPath();c.arc(x,y,r,0,6.3);c.fill();c.strokeStyle='#10151a';c.lineWidth=Math.max(1,r*.28);c.beginPath();c.moveTo(x-r*.6,y-r*.2);c.lineTo(x+r*.6,y+r*.2);c.stroke()};
  for(const fx of[.04,.96])for(const fy of[.06,.5,.94])bolt(w*fx,h*fy,Math.max(3.5,w*.0045));
  // placa del casco
  c.save();c.translate(w*.5,h*.985);c.fillStyle='#8a9096';const pw=Math.max(110,w*.12),ph=Math.max(11,h*.022);c.fillRect(-pw/2,-ph,pw,ph);c.fillStyle='#1b2026';c.font='700 '+Math.max(8,ph*.62)+'px system-ui';c.textAlign='center';c.textBaseline='middle';c.fillText('HADAL-1 · 8 200 m',0,-ph/2);c.restore();
  // mazos de cables, rejilla de ventilación, placas de advertencia y desgaste
  const cable=(x0,y0,x1,y1,bx,by,col,lw)=>{c.lineCap='round';c.strokeStyle='rgba(0,0,0,.6)';c.lineWidth=lw+2;c.beginPath();c.moveTo(x0,y0);c.quadraticCurveTo(bx,by,x1,y1);c.stroke();c.strokeStyle=col;c.lineWidth=lw;c.stroke();c.strokeStyle='rgba(255,255,255,.18)';c.lineWidth=Math.max(1,lw*.25);c.beginPath();c.moveTo(x0-lw*.2,y0-lw*.2);c.quadraticCurveTo(bx-lw*.2,by-lw*.2,x1-lw*.2,y1-lw*.2);c.stroke()};
  cable(w*.02,h*.2,w*.075,h*.12,w*.01,h*.12,'#2b2f36',5);cable(w*.025,h*.23,w*.085,h*.14,w*.02,h*.15,'#7a2a22',3);cable(w*.98,h*.8,w*.93,h*.88,w*.99,h*.88,'#2b2f36',5);cable(w*.975,h*.77,w*.915,h*.86,w*.985,h*.86,'#c8a02a',3);
  {const gx=w*.935,gy=h*.04,gw=w*.045,gh=h*.06;c.fillStyle='#05070a';c.fillRect(gx,gy,gw,gh);for(let i=0;i<7;i++){c.fillStyle='#1f262c';c.fillRect(gx+2,gy+3+i*gh/7.3,gw-4,gh/7.3*.55);c.fillStyle='rgba(255,255,255,.12)';c.fillRect(gx+2,gy+3+i*gh/7.3,gw-4,1)}c.strokeStyle='#59636b';c.lineWidth=2;c.strokeRect(gx,gy,gw,gh)}
  {const px=w*.012,py=h*.9,pw=Math.max(60,w*.06),ph2=Math.max(16,h*.03);c.save();c.translate(px,py);c.fillStyle='#d1a523';c.fillRect(0,0,pw,ph2);c.fillStyle='#14110a';for(let i=-2;i<10;i++){c.beginPath();c.moveTo(i*pw/8,ph2);c.lineTo(i*pw/8+pw/16,0);c.lineTo(i*pw/8+pw/8,0);c.lineTo(i*pw/8+pw/16,ph2);c.fill()}c.restore()}
  for(let i=0;i<14;i++){const x=w*(.015+rnd()*.07),y0=h*(.3+rnd()*.35);const gr=c.createLinearGradient(x,y0,x,y0+h*.12);gr.addColorStop(0,'rgba(120,70,30,.22)');gr.addColorStop(1,'rgba(120,70,30,0)');c.fillStyle=gr;c.fillRect(x,y0,1.6,h*.12*rnd()+8)}
  if(w>600){c.fillStyle='#8a9096';c.font='600 '+Math.max(8,h*.014)+'px system-ui';c.textAlign='left';c.fillText('MAX 820 BAR',w*.97-Math.max(70,w*.07),h*.12);c.fillText('CAB. A',w*.012,h*.08)}
  // abrir la ventanilla
  c.globalCompositeOperation='destination-out';c.beginPath();c.ellipse(cx,cy,rx,ry,0,0,6.2832);c.fill();c.globalCompositeOperation='source-over';
  // aro de la ventanilla: bisel exterior, cara de titanio cepillado, junta de goma
  const ring=(k,lw,stops)=>{const gg=c.createLinearGradient(cx-rx,cy-ry,cx+rx,cy+ry);stops.forEach(([o,col])=>gg.addColorStop(o,col));c.strokeStyle=gg;c.lineWidth=lw;c.beginPath();c.ellipse(cx,cy,rx+k,ry+k,0,0,6.2832);c.stroke()};
  c.save();c.shadowColor='rgba(0,0,0,.8)';c.shadowBlur=sw*.9;ring(sw*.95,sw*.5,[[0,'#8d98a1'],[.3,'#323a41'],[.6,'#0c0f12'],[1,'#566069']]);c.restore();
  ring(sw*.5,sw*1.1,[[0,'#b9c3ca'],[.18,'#6b757d'],[.42,'#232a30'],[.55,'#14181c'],[.8,'#4a545c'],[1,'#7e8a93']]);
  ring(-sw*.12,sw*.38,[[0,'#050607'],[1,'#12161a']]);
  ring(sw*.04,1.4,[[0,'rgba(255,255,255,.55)'],[1,'rgba(255,255,255,.1)']]);
  // pernos hexagonales sobre el aro, con sombra proyectada y brillo
  const NB=36,br=sw*.34;for(let i=0;i<NB;i++){const a=i/NB*6.2832+.05,x=cx+Math.cos(a)*(rx+sw*.5),y=cy+Math.sin(a)*(ry+sw*.5);
   c.fillStyle='rgba(0,0,0,.6)';c.beginPath();c.arc(x+br*.28,y+br*.34,br*1.15,0,6.3);c.fill();
   const rg=c.createRadialGradient(x-br*.35,y-br*.35,br*.1,x,y,br*1.1);rg.addColorStop(0,'#e3e9ed');rg.addColorStop(.5,'#8b959d');rg.addColorStop(1,'#2e353b');c.fillStyle=rg;c.beginPath();for(let k=0;k<6;k++){const q=a+k*1.0472;c.lineTo(x+Math.cos(q)*br,y+Math.sin(q)*br)}c.closePath();c.fill();
   c.strokeStyle='#0a0d10';c.lineWidth=1;c.stroke();c.fillStyle='rgba(0,0,0,.55)';c.beginPath();c.arc(x,y,br*.38,0,6.3);c.fill();c.fillStyle='rgba(255,255,255,.4)';c.beginPath();c.arc(x-br*.18,y-br*.2,br*.14,0,6.3);c.fill()}
  // vidrio de acrílico grueso: refracción del borde, reflejo diagonal, gotas de condensación y rayones finos
  c.save();c.beginPath();c.ellipse(cx,cy,rx,ry,0,0,6.2832);c.clip();
  c.save();c.translate(cx,cy);c.scale(1,ry/rx);let rgd=c.createRadialGradient(0,0,rx*.8,0,0,rx);rgd.addColorStop(0,'rgba(120,200,230,0)');rgd.addColorStop(.7,'rgba(150,225,255,.07)');rgd.addColorStop(.93,'rgba(0,0,0,.28)');rgd.addColorStop(1,'rgba(0,0,0,.6)');c.fillStyle=rgd;c.fillRect(-rx,-rx,rx*2,rx*2);c.restore();
  g=c.createLinearGradient(cx-rx*.7,cy-ry*.8,cx-rx*.1,cy+ry*.1);g.addColorStop(0,'rgba(255,255,255,0)');g.addColorStop(.4,'rgba(255,255,255,.055)');g.addColorStop(.55,'rgba(255,255,255,.015)');g.addColorStop(1,'rgba(255,255,255,0)');c.save();try{c.filter='blur('+Math.round(h*.03)+'px)'}catch(e){}c.fillStyle=g;c.beginPath();c.moveTo(cx-rx*.78,cy-ry*.35);c.lineTo(cx-rx*.35,cy-ry*.88);c.lineTo(cx-rx*.18,cy-ry*.82);c.lineTo(cx-rx*.62,cy-ry*.2);c.fill();c.restore();
  for(let i=0;i<55;i++){const a=rnd()*6.2832,k=.9+rnd()*.07,x=cx+Math.cos(a)*rx*k,y=cy+Math.sin(a)*ry*k,r=.8+rnd()*2.6,rg=c.createRadialGradient(x-r*.3,y-r*.3,0,x,y,r);rg.addColorStop(0,'rgba(220,245,255,.38)');rg.addColorStop(.7,'rgba(160,210,230,.1)');rg.addColorStop(1,'rgba(0,0,0,.18)');c.fillStyle=rg;c.beginPath();c.arc(x,y,r,0,6.3);c.fill()}
  c.strokeStyle='rgba(255,255,255,.035)';c.lineWidth=.6;for(let i=0;i<14;i++){const a=rnd()*6.2832,k=.3+rnd()*.5;c.beginPath();c.arc(cx+Math.cos(a)*rx*k,cy+Math.sin(a)*ry*k,10+rnd()*50,a,a+.4+rnd()*.7);c.stroke()}
  c.restore();
  // manómetro de profundidad (esquina inferior izquierda) y luces de estado
  GW=Math.max(64,Math.min(w,h)*.115);GCX=GW*.55+8;GCY=h-GW*.55-10;gv.style.left=(GCX-GW/2)+'px';gv.style.top=(GCY-GW/2)+'px';gv.style.width=GW+'px';gv.style.height=GW+'px';gv.width=Math.round(GW*dpr);gv.height=Math.round(GW*dpr);
  const S2=GW*.68;[[kv,GCX+GW*.5+S2*.55+6,h-S2*.5-8,S2],[lv,w*.955,h*.83,S2]].forEach(([e,x,y,z])=>{e.style.left=(x-z/2)+'px';e.style.top=(y-z/2)+'px';e.style.width=e.style.height=z+'px';e.width=e.height=Math.round(z*dpr)});S2g=S2;
  const lr=Math.max(3,w*.0036);leds.forEach(([d,f])=>{d.style.width=d.style.height=lr*2+'px';d.style.left=(w*f-lr)+'px';d.style.top=(h*.955-lr)+'px'});gauge()};
 const gauge=()=>{if(!GW)return;const dpr=Math.min(devicePixelRatio||1,2),c=gv.getContext('2d');c.setTransform(dpr,0,0,dpr,0,0);const R=GW/2,dep=Math.max(-cam.position.y,0);c.clearRect(0,0,GW,GW);c.translate(R,R);
  const bz=c.createLinearGradient(-R,-R,R,R);bz.addColorStop(0,'#c0c9cf');bz.addColorStop(.5,'#3a4248');bz.addColorStop(1,'#8c969e');c.fillStyle='rgba(0,0,0,.6)';c.beginPath();c.arc(R*.04,R*.06,R*.98,0,6.3);c.fill();c.fillStyle=bz;c.beginPath();c.arc(0,0,R*.95,0,6.3);c.fill();c.fillStyle='#0b0e11';c.beginPath();c.arc(0,0,R*.8,0,6.3);c.fill();
  const fa=-2.35,ta=2.35,mx=8200;c.strokeStyle='#d8e2e8';c.fillStyle='#d8e2e8';c.font='600 '+(R*.17)+'px system-ui';c.textAlign='center';c.textBaseline='middle';
  for(let i=0;i<=40;i++){const a=fa+(ta-fa)*i/40,mj=i%5===0;c.lineWidth=mj?1.6:.8;c.beginPath();c.moveTo(Math.sin(a)*R*(mj?.58:.65)*1,-Math.cos(a)*R*(mj?.58:.65));c.lineTo(Math.sin(a)*R*.72,-Math.cos(a)*R*.72);c.stroke();if(mj&&i%10===0)c.fillText(String(Math.round(mx*i/40/1000)),Math.sin(a)*R*.46,-Math.cos(a)*R*.46)}
  c.font='600 '+(R*.12)+'px system-ui';c.fillStyle='#8fb4c4';c.fillText('km',0,R*.3);c.fillText('PROF.',0,R*.5);
  const a=fa+(ta-fa)*Math.min(dep/mx,1);c.save();c.rotate(a);c.fillStyle='rgba(0,0,0,.5)';c.fillRect(-R*.02+1.5,-R*.7+1.5,R*.04,R*.78);c.fillStyle='#ff6a3d';c.beginPath();c.moveTo(-R*.025,R*.1);c.lineTo(0,-R*.72);c.lineTo(R*.025,R*.1);c.fill();c.restore();c.fillStyle='#2b3238';c.beginPath();c.arc(0,0,R*.07,0,6.3);c.fill();
  const gl=c.createLinearGradient(-R*.7,-R*.8,R*.3,R*.2);gl.addColorStop(0,'rgba(255,255,255,.18)');gl.addColorStop(.5,'rgba(255,255,255,0)');c.fillStyle=gl;c.beginPath();c.arc(0,0,R*.8,0,6.3);c.fill();c.setTransform(1,0,0,1,0,0);
  if(!S2g)return;const dp=dpr,z=S2g;
  const bezel=(c2,R2)=>{const bz2=c2.createLinearGradient(-R2,-R2,R2,R2);bz2.addColorStop(0,'#c0c9cf');bz2.addColorStop(.5,'#3a4248');bz2.addColorStop(1,'#8c969e');c2.fillStyle='rgba(0,0,0,.6)';c2.beginPath();c2.arc(R2*.04,R2*.06,R2*.98,0,6.3);c2.fill();c2.fillStyle=bz2;c2.beginPath();c2.arc(0,0,R2*.95,0,6.3);c2.fill();c2.fillStyle='#0b0e11';c2.beginPath();c2.arc(0,0,R2*.8,0,6.3);c2.fill()};
  // brújula
  {const c2=kv.getContext('2d');c2.setTransform(dp,0,0,dp,0,0);c2.clearRect(0,0,z,z);c2.translate(z/2,z/2);const R2=z/2;bezel(c2,R2);const hd=-yaw;c2.save();c2.rotate(-hd);c2.strokeStyle='#d8e2e8';c2.fillStyle='#d8e2e8';c2.font='700 '+(R2*.2)+'px system-ui';c2.textAlign='center';c2.textBaseline='middle';for(let i=0;i<36;i++){const a=i/36*6.2832,mj=i%9===0;c2.lineWidth=mj?1.5:.8;c2.beginPath();c2.moveTo(Math.sin(a)*R2*(mj?.5:.62),-Math.cos(a)*R2*(mj?.5:.62));c2.lineTo(Math.sin(a)*R2*.72,-Math.cos(a)*R2*.72);c2.stroke()}[['N',0,'#ff6a3d'],['E',1.5708],['S',3.1416],['O',4.7124]].forEach(([t,a,col])=>{c2.fillStyle=col||'#d8e2e8';c2.fillText(t,Math.sin(a)*R2*.36,-Math.cos(a)*R2*.36)});c2.restore();c2.fillStyle='#ffd23d';c2.beginPath();c2.moveTo(0,-R2*.76);c2.lineTo(-R2*.07,-R2*.62);c2.lineTo(R2*.07,-R2*.62);c2.fill();c2.setTransform(1,0,0,1,0,0)}
  // nivel de burbuja (inclinación real: cabeceo y balanceo)
  {const c2=lv.getContext('2d');c2.setTransform(dp,0,0,dp,0,0);c2.clearRect(0,0,z,z);c2.translate(z/2,z/2);const R2=z/2;bezel(c2,R2);const rg=c2.createRadialGradient(0,0,R2*.1,0,0,R2*.78);rg.addColorStop(0,'#4f7a3c');rg.addColorStop(1,'#16260f');c2.fillStyle=rg;c2.beginPath();c2.arc(0,0,R2*.76,0,6.3);c2.fill();c2.strokeStyle='rgba(255,255,255,.55)';c2.lineWidth=1;for(const k of[.18,.42,.66]){c2.beginPath();c2.arc(0,0,R2*k,0,6.3);c2.stroke()}c2.beginPath();c2.moveTo(-R2*.76,0);c2.lineTo(R2*.76,0);c2.moveTo(0,-R2*.76);c2.lineTo(0,R2*.76);c2.stroke();
   const bx=Math.max(-1,Math.min(1,(-ROLL*3.2)))*R2*.55,by=Math.max(-1,Math.min(1,(pitch+PBOB)*1.4))*R2*.55,bg=c2.createRadialGradient(bx-R2*.05,by-R2*.05,0,bx,by,R2*.2);bg.addColorStop(0,'rgba(240,255,230,.95)');bg.addColorStop(1,'rgba(150,200,120,.55)');c2.fillStyle=bg;c2.beginPath();c2.arc(bx,by,R2*.17,0,6.3);c2.fill();c2.strokeStyle='rgba(0,0,0,.4)';c2.stroke();
   const gl=c2.createLinearGradient(-R2*.7,-R2*.8,R2*.3,R2*.2);gl.addColorStop(0,'rgba(255,255,255,.2)');gl.addColorStop(.5,'rgba(255,255,255,0)');c2.fillStyle=gl;c2.beginPath();c2.arc(0,0,R2*.76,0,6.3);c2.fill();c2.setTransform(1,0,0,1,0,0)}
 };
 draw();addEventListener('resize',draw);setInterval(gauge,80);let on=true;try{if(localStorage.hadalCabina==='0')on=false}catch(e){}
 const setOn=()=>{const d=on?'block':'none';cv.style.display=gv.style.display=kv.style.display=d;lv.style.display=TOUCH?'none':d;leds.forEach(([e])=>e.style.display=TOUCH?'none':d)};setOn();
 addEventListener('keydown',e=>{if(e.code==='KeyV'){on=!on;setOn();try{localStorage.hadalCabina=on?'1':'0'}catch(x){}}})}

// ---- sónar activo (tecla F): frente esférico que revela superficies ----
var sonarT0=-99;
function sonarPing(){sonarT0=performance.now()/1000;jrSonar();
 try{audio();if(AC&&!muted){const o=AC.createOscillator(),g2=AC.createGain();o.type='sine';o.frequency.setValueAtTime(1500,AC.currentTime);o.frequency.exponentialRampToValueAtTime(1100,AC.currentTime+1.2);g2.gain.setValueAtTime(.0001,AC.currentTime);g2.gain.exponentialRampToValueAtTime(.18,AC.currentTime+.02);g2.gain.exponentialRampToValueAtTime(.0001,AC.currentTime+1.6);o.connect(g2);g2.connect(gm);o.start();o.stop(AC.currentTime+1.7)}}catch(x){}}
function sonarTick(t){const a=performance.now()/1000-sonarT0,D=7;if(a<0||a>D){SO[0]=-1;return}SO[0]=Math.max(a*45,.01);SO[1]=Math.min(1,(D-a)/3)*Math.min(1,a*6)}

// ================= DIARIO DE CAMPO =================
var JR=new Map(),jrEl=null,jrBtn=null,toastEl=null,toastT=0;
try{for(const r of JSON.parse(localStorage.hadalDiario||'[]'))JR.set(r.n,r)}catch(x){}
function jrSave(){try{localStorage.hadalDiario=JSON.stringify([...JR.values()])}catch(x){}}
function jrToast(m){if(!toastEl){toastEl=document.createElement('div');toastEl.className='p';toastEl.style.cssText='left:50%;top:18px;transform:translateX(-50%);z-index:6;pointer-events:none;transition:opacity .4s;font-size:14px';document.body.appendChild(toastEl)}
 toastEl.textContent=m;toastEl.style.opacity=1;clearTimeout(toastT);toastT=setTimeout(()=>{toastEl.style.opacity=0},2600)}
function jrAdd(c,dep,quiet){if(!c||!c.n||JR.has(c.n))return false;
 JR.set(c.n,{n:c.n,l:c.l||'',d:c.d||null,note:c.note||'',vq:c.vq||'',src:c.src||'',dep:Math.round(dep)});jrSave();
 if(!quiet)jrToast('Nuevo en el diario: '+c.n);jrRender();return true}
function jrSonar(){const t=performance.now()/1000,cp=cam.position;let n=0;
 for(const sp of SPS){if(!sp.geo||!sp.cnt||sp.nocat)continue;const st=sp.cnt>600?3:1;
  for(let i=0;i<sp.cnt;i+=st){entPos(sp,i,t,tmp);if(Math.hypot(tmp.x-cp.x,tmp.y-cp.y,tmp.z-cp.z)<70){if(jrAdd(sp,-cp.y,true))n++;break}}}
 for(const k in WR){const w=WR[k];if(Math.hypot(w.x-cp.x,w.y-cp.y,w.z-cp.z)<w.rad*3&&jrAdd({n:w.n,l:w.l,note:w.note,src:w.src},-cp.y,true))n++}
 jrToast(n?'Sónar: '+n+' contacto'+(n>1?'s':'')+' nuevo'+(n>1?'s':'')+' en el diario':'Sónar: sin contactos nuevos')}
function jrText(){const a=[...JR.values()].sort((x,y)=>x.dep-y.dep);
 return 'Diario de campo · Hadal ('+a.length+' registros)\n'+a.map(r=>'- '+r.n+(r.l?' ('+r.l+')':'')+' · visto a '+r.dep+' m'+(r.d?' · rango '+r.d[0]+'–'+r.d[1]+' m':'')+' · '+(r.vq?'⚠ '+r.vq:'✔ '+(r.src||'verificado en fuentes, nov. 2026'))).join('\n')}
function jrRender(){if(!jrEl)return;const a=[...JR.values()].sort((x,y)=>x.dep-y.dep);
 jrEl.innerHTML='<div style="display:flex;justify-content:space-between;align-items:center;gap:8px"><b>Diario de campo · '+a.length+'/'+NCAT+'</b><button id="jrcp" style="font:inherit;font-size:12px;padding:3px 8px;border-radius:6px;border:1px solid #5fb7d455;background:#0a2a3a;color:inherit;cursor:pointer">Copiar</button></div>'
  +(a.length?a.map(r=>'<div style="margin-top:8px;border-top:1px solid #5fb7d422;padding-top:6px"><b>'+r.n+'</b> <i style="opacity:.8">'+r.l+'</i><div style="font-size:11.5px;opacity:.75">visto a '+r.dep+' m'+(r.d?' · rango '+r.d[0].toLocaleString('es')+'–'+r.d[1].toLocaleString('es')+' m':'')+' · '+(r.vq?'⚠ sin confirmar':'✔ con fuente')+'</div></div>').join(''):'<div style="margin-top:8px;opacity:.75">Todavía vacío: mirá un animal de frente o emití un pulso de sónar (F).</div>');
 const b=jrEl.querySelector('#jrcp');if(b)b.onclick=()=>{try{navigator.clipboard.writeText(jrText());jrToast('Resumen copiado')}catch(x){jrToast('No se pudo copiar')}}}
function jrToggle(){if(!jrEl)return;const on=jrEl.style.display==='none';jrEl.style.display=on?'block':'none';if(on)jrRender()}
function mkBtn(txt,left,fn){const b=document.createElement('button');b.className='p';b.textContent=txt;b.style.cssText='left:'+left+'px;top:100px;z-index:5;color:inherit;font:inherit;font-size:13px;cursor:pointer';b.onclick=fn;document.body.appendChild(b);return b}
{jrEl=document.createElement('div');jrEl.className='p';jrEl.style.cssText='left:14px;top:146px;width:290px;max-height:56vh;overflow:auto;display:none;font-size:13px;z-index:5';document.body.appendChild(jrEl);
 jrBtn=mkBtn('Diario (J)',14,jrToggle);mkBtn('Recorrido (T)',112,()=>{tour?tourStop('Recorrido detenido'):tourStart()});
 for(const n of JR.keys())seen.add(n);jrRender()}

// ================= MODO GUIADO =================
var tour=null,fadeEl=null,capEl=null;const TOURW={4:'galeon',6:'titanic',7:'af447',8:'bismarck',10:'roberts'};
function gotoDest(q){if(q[4]){cam.position.set(q[1],-q[4],0);yaw=-Math.PI/2;pitch=q[3];vel.set(0,0,0);rebuild();terrain()}else tp(q[1],q[2],q[3]||-.1)}
function tourFade(v){if(!fadeEl){fadeEl=document.createElement('div');fadeEl.style.cssText='position:fixed;inset:0;background:#000;opacity:0;pointer-events:none;z-index:4;transition:opacity 1s';document.body.appendChild(fadeEl)}fadeEl.style.opacity=v}
function tourCap(txt){if(!capEl){capEl=document.createElement('div');capEl.className='p';capEl.style.cssText='left:50%;bottom:64px;transform:translateX(-50%);z-index:5;text-align:center;pointer-events:none;font-size:15px;width:min(600px,calc(100vw - 32px))';document.body.appendChild(capEl)}
 capEl.innerHTML=txt||'';capEl.style.display=txt?'block':'none'}
function tourStart(){if(getComputedStyle($('start')).display!=='none')return;audio();tour={i:0,ph:'out',tt:0,y0:0,pinged:false};tgo=0;tourFade(1);tourCap('Recorrido guiado · tocá T, o cualquier tecla de movimiento, para salir')}
function tourStop(msg){tour=null;tgo=0;tourFade(0);tourCap('');if(msg)jrToast(msg)}
function tourTick(dt){if(!tour)return;tour.tt+=dt;
 if(tour.ph==='out'){if(tour.tt>1.1){gotoDest(DEST[tour.i]);tour.y0=yaw;tour.ph='dwell';tour.tt=0;tour.pinged=false;tgo=.55;tourFade(0);
   tour.k=TOURW[tour.i];tour.zn=false;tourCap('<b>'+DEST[tour.i][0]+'</b><br><small>Parada '+(tour.i+1)+' de '+DEST.length+' · T para salir</small>')}}
 else{yaw=tour.y0+Math.sin(tour.tt*.3)*.45;
  if(!tour.zn&&tour.tt>1.2){tour.zn=true;const w=tour.k&&WR[tour.k];tourCap('<b>'+DEST[tour.i][0]+'</b><br><small>'+$('zn').textContent+'</small>'+(w?'<div style="margin-top:6px;font-size:12.5px;opacity:.9">'+w.note+'<br><span style="opacity:.7;font-size:11.5px">'+(w.vq?'⚠ '+w.vq:'✔ '+(w.src||'Verificado en fuentes'))+'</span></div>':'')+'<br><small style="opacity:.7">Parada '+(tour.i+1)+' de '+DEST.length+' · T para salir</small>')}
  if(!tour.pinged&&tour.tt>2.5&&-cam.position.y>800){tour.pinged=true;sonarPing()}
  if(tour.tt>15){tour.i++;if(tour.i>=DEST.length){tourStop('Fin del recorrido');return}tour.ph='out';tour.tt=0;tgo=0;tourFade(1)}}}
addEventListener('pointerdown',e=>{if(tour&&e.target===canvas)tourStop('Control manual')});

var lampTo=null,lampT0=0;
function lampToast(txt){if(!lampTo){lampTo=document.createElement('div');lampTo.style.cssText='position:fixed;left:50%;top:70px;transform:translateX(-50%);padding:8px 16px;border-radius:10px;background:rgba(2,16,26,.7);border:1px solid #5fb7d455;color:#dff3fb;font:13px system-ui,sans-serif;z-index:30;pointer-events:none;transition:opacity .4s;backdrop-filter:blur(6px)';document.body.appendChild(lampTo)}
 lampTo.textContent=txt;lampTo.style.opacity=1;clearTimeout(lampT0);lampT0=setTimeout(()=>{lampTo.style.opacity=0},1800)}
