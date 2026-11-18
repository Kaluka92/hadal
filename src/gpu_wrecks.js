// ================= NAUFRAGIOS DETALLADOS (casco de alta resolución, ventanas, cañones, motores, escombros) =================
const dec2=(l,n,amp,f,sg)=>MG([decay(MG(l.slice(0,n)),amp,f,sg),...l.slice(n)]);
const hull2=(L,B,H,bk=.55,brk=0)=>{const NS=Math.min(230,Math.round(L*1.7)),NP=40,pos=[],ix=[];
 for(let i=0;i<=NS;i++){const u=i/NS,z=-L/2+u*L,t=(u-bk)/(1-bk);let hb=B/2;if(t>0)hb*=Math.pow(Math.max(1-Math.pow(t,1.8),0),.55);const sheer=u>.8?(u-.8)/.2*H*.12:0;
  for(let j=0;j<=NP;j++){const a=j/NP*Math.PI,x=hb*Math.cos(a),y=H*(1-Math.pow(Math.sin(a),.45))+(j<3||j>NP-3?sheer:0),k=1+.03*(hs(i*3.1,j*5.7)-.5);
   const f=brk&&i<12?(1-i/12):0,jr=hs(j*1.7,3.3),zz=z+f*brk*(jr*jr*1.4-.3),kk=1-f*.22*hs(j,5.1);
   pos.push(x*k*kk+(hs(i,j*2)-.5)*.08,y*(1-f*.18*jr)+(hs(j,i*1.7)-.5)*.07,zz)}}
 for(let i=0;i<NS;i++){for(let j=0;j<NP;j++){const a=i*(NP+1)+j,b=a+1,c=a+NP+1,d=c+1;ix.push(a,c,b,b,c,d)}const a=i*(NP+1),b=a+NP,c=a+NP+1,d=c+NP;ix.push(a,b,c,c,b,d)}
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setIndex(ix);g.computeVertexNormals();return g};
const hullX=(B,H,y)=>{const s=Math.pow(Math.max(1-y/H,0),1/.45);return B/2*Math.sqrt(Math.max(1-Math.min(s,1)*Math.min(s,1),0))+.06};
const rowZ=(a,b,st,fn)=>{const o=[];for(let z=a;z<=b+1e-6;z+=st)o.push(...[].concat(fn(z)));return o};
const win=(x,y,z,w=.12,h=.9,d=.6)=>P(BXs(Math.max(w,.45),h,d,.04,1),'#0d0f12',{p:[x,y,z]});
const porth=(sd,B,H,y,z)=>P(CY(.34,.34,.16,8),'#0b0b0c',{p:[sd*(hullX(B,H,y)+.02),y,z],r:[0,0,-sd*Math.PI/2]});
const rail=(x,y,z0,z1,st,c='#2e2a26')=>[P(seg(V3([x,y+1.2,z0]),V3([x,y+1.2,z1]),.05,.05,4),c),P(seg(V3([x,y+.6,z0]),V3([x,y+.6,z1]),.035,.035,4),c),...rowZ(z0,z1,st,z=>P(CY(.04,.04,1.2,4),c,{p:[x,y,z]}))];
const turret2=(z,dir)=>[...turret(z,dir),...[-1.8,1.8].map(s=>P(new T.TorusGeometry(.66,.1,6,12),'#2c3136',{p:[s,20.6,z+dir*22.6]})),P(BXs(.5,.6,9.5,.1,1),'#3c4248',{p:[0,23.4,z-dir*1.5]}),...[-2.5,2.5].map(s=>P(BXs(1.6,.3,1.6,.1,1),'#3a4046',{p:[s,23.4,z+dir*1.5]}))];
const AAm=(x,y,z)=>[P(CY(.7,.6,.7,8),'#3d444a',{p:[x,y,z]}),...[-.25,.25].map(s=>P(CZ(.1,.09,2.2,5),'#2c3136',{p:[x+s,y+1,z]}))];
// escombros en coordenadas locales del naufragio (el origen está sobre el fondo plano en x del naufragio)
function debris(seed,n,R,pal,wx,extra){const r=mb(seed),out=[];
 for(let i=0;i<n;i++){const a=r()*6.2832,d=R*(.55+r()*1.0),lx=Math.cos(a)*d,lz=Math.sin(a)*d*.8,ly=base(wx)-floorAt(wx+lx,lz),c=pal[Math.floor(r()*pal.length)],k=r();
  const yaw=r()*6.28,tilt=(r()-.5)*.35;
  if(k<.4)out.push(P(BXs(.8+r()*2.4,.08+r()*.14,.8+r()*1.8,.03,1),c,{p:[lx,ly+.05,lz],r:[tilt,yaw,tilt]}));
  else if(k<.62)out.push(P(CZ(.05+r()*.18,.05+r()*.18,1+r()*4,6),c,{p:[lx,ly+.15,lz],r:[0,yaw,0]}));
  else if(k<.8)out.push(P(BXs(.4+r()*.7,.35+r()*.5,.4+r()*.8,.06,1),c,{p:[lx,ly,lz],r:[0,yaw,tilt]}));
  else if(k<.9)out.push(P(CY(.3,.3,.8,8),c,{p:[lx,ly,lz],r:[tilt*3,yaw,0]}));
  else out.push(P(S_(.2+r()*.35,7,5),'#222120',{p:[lx,ly+.1,lz]}))}
 return MG(out.concat(extra?extra(r,wx):[]))}

const titaRig=()=>{const out=[],rc='#3d2f26',rd='#4a3a30',dk='#0c0b0a';
 // ventiladores de cuello de cisne en la cubierta de proa
 [[-8,13],[8,15],[-8.5,22],[8.5,24],[-7.5,30],[7.5,28]].forEach(([x,z],i)=>{const d=x<0?1:-1;
  out.push(P(CY(.32,.38,1.5,8),rc,{p:[x,25.9,z]}),P(seg(V3([x,26.6,z]),V3([x+d*.55,27.5,z]),.3,.3,7),rc),P(CY(.78,.34,.62,10),rd,{p:[x+d*.9,27.5,z],r:[0,0,d*Math.PI/2]}),P(CY(.62,.62,.05,10),dk,{p:[x+d*1.2,27.5,z],r:[0,0,d*Math.PI/2]}))});
 // bitas de amarre en las bordas
 [-1,1].forEach(s=>[40,44,48,52].forEach(z=>{const u=(z+60)/120,t=(u-.5)/.5,hb=14*Math.pow(Math.max(1-Math.pow(t,1.8),0),.55),x=s*(hb-1.6);out.push(P(CY(.3,.34,.9,8),rd,{p:[x,25.4,z]}),P(CY(.4,.4,.14,8),rc,{p:[x,25.9,z]}))}));
 // escotilla de proa con brazola y abertura oscura
 out.push(P(BXs(6,.8,7,.12,1),rd,{p:[0,25.5,47]}),P(BXs(4.8,.1,5.8,.03,1),dk,{p:[0,26.12,47]}),P(BXs(6.4,.18,.3,.05,1),rc,{p:[0,26,43.5]}));
 // cadena del ancla: eslabones alternados desde el molinete hacia la gatera
 for(let i=0;i<18;i++)out.push(P(new T.TorusGeometry(.26,.07,5,8),'#2e241c',{p:[1.4+Math.sin(i*.5)*.5,25.5,36+i*1.15],r:[i%2?Math.PI/2:0,0,i%2?0:Math.PI/2],s:[1,1,1.5]}));
 // ventanas de la superestructura: frente del puente y laterales
 for(let x=-9;x<=9;x+=1.8)out.push(P(BXs(1,.9,.5,.04,1),dk,{p:[x,27.4,1.1]}));
 for(let x=-9;x<=9;x+=3.6)out.push(P(BXs(1.2,.8,.5,.04,1),dk,{p:[x,24.4,1.15]}));
 [-1,1].forEach(s=>{for(let z=-19;z<=-1;z+=2)out.push(P(BXs(.5,.9,1,.04,1),dk,{p:[s*10.6,27.4,z]}));for(let z=-19;z<=-1;z+=3)out.push(P(BXs(.5,.8,1.2,.04,1),dk,{p:[s*10.6,24.4,z]}))});
 // aparejos de los pescantes (cabos caídos)
 [-36,-30,-24,-18].forEach(z=>[-1,1].forEach(s=>{const sg=hs(z*3+s,4);out.push(P(seg(V3([s*9.6,32.3,z]),V3([s*(9.8+sg*.8),27.5-sg*1.2,z+(sg-.5)*1.5]),.035,.03,4),'#2a2018'),P(BXs(.25,.5,.25,.05,1),'#2a2018',{p:[s*(9.8+sg*.8),27.4-sg*1.2,z+(sg-.5)*1.5]}))}));
 // cofa y mástil de proa
 out.push(P(CY(.95,.85,1.7,10),rc,{p:[0,38.2,40.5],r:[.35,0,.04]}),P(new T.TorusGeometry(.95,.09,5,14),rd,{p:[0,39.1,41.1],r:[Math.PI/2+.35,0,0]}));
 return out};
// --- Titanic: casco real (misma fórmula que el SDF de gpu_engine.js) para pegar óxido y barandas sobre la superficie ---
const titaHb=z=>{const t=Math.max(z,0)/60;return 14*Math.pow(Math.max(1-Math.pow(t,1.8),0),.55)};
const titaHe=z=>{const s=Math.min(Math.max((z-8)/4,0),1);return 22+3.2*s*s*(3-2*s)};
const titaXs=(z,y)=>{const v=Math.min(Math.max(1-y/titaHe(z),0),1);return titaHb(z)*Math.sqrt(Math.max(1-Math.pow(v,4.444),0))};
// óxido colgante (rusticles): racimos irregulares que cuelgan, de naranja vivo a marrón; como en las fotos de la proa
const RUSTC=['#b8420f','#a63a0c','#c9561a','#8a2f0c','#d96b22','#7a2a0c','#c44a12'];
const RUSTP=['#9db2ad','#b9c6c2','#a89886','#c8b8a4','#d9772a','#b8602a'];
const rustClump=(r,x,y,z,len,w,pal=RUSTC)=>{const out=[],n=3+Math.floor(r()*3),col=pal[Math.floor(r()*pal.length)];let cx=x,cy=y,cz=z,rad=w;
 for(let i=0;i<n;i++){const l=len/n*(.7+r()*.6),nx=cx+(r()-.5)*w*1.6,nz=cz+(r()-.5)*w*1.6,ny=cy-l,er=rad*(.6+r()*.2),c2=pal[Math.floor(r()*pal.length)];
  out.push(P(seg(V3([cx,cy,cz]),V3([nx,ny,nz]),rad,er,6),i%2?col:c2));
  out.push(P(S_(er*1.1,6,4),c2,{p:[nx,ny,nz],s:[1,.9+r()*.5,1]}));
  if(r()<.32&&i>0){const bl=l*(.8+r()),bx=nx+(r()-.5)*w*3.4,bz=nz+(r()-.5)*w*3.4,br=er*.7;out.push(P(seg(V3([nx,ny,nz]),V3([bx,ny-bl,bz]),er,br,5),col),P(S_(br*1.1,5,4),'#e07a26',{p:[bx,ny-bl,bz]}))}
  cx=nx;cy=ny;cz=nz;rad=er}
 out.push(P(S_(rad*1.05,6,4),'#e07a26',{p:[cx,cy-rad*.3,cz]}));return out};
const titaRust=()=>{const r=mb(41),out=[];
 // borde de cubierta, a ambos lados
 [-1,1].forEach(s=>{for(let z=-56;z<57;z+=.5+r()*.6){const y=titaHe(z)-.35;out.push(...rustClump(r,s*(titaXs(z,y)+.08),y,z,.7+r()*r()*3.4,.09+r()*.16))}});
 // chorreaduras bajo los ojos de buey
 [[6,1.9],[12,1.9],[17,3.8]].forEach(([y,st])=>rowZ(-58,-2,st,z=>[-1,1].forEach(s=>{if(r()<.55)out.push(...rustClump(r,s*(titaXs(z,y-.4)+.06),y-.4,z,.3+r()*1.1,.05+r()*.06))})));
 // juntas de chapa: óxido a distintas alturas
 for(let i=0;i<280;i++){const z=-56+r()*112,y=2+r()*20,s=r()<.5?-1:1;out.push(...rustClump(r,s*(titaXs(z,y)+.06),y,z,.5+r()*1.5,.06+r()*.1))}
 // cortinas densas de hebras finas (costra pálida con flecos naranjas) bajo el borde de cubierta, como en las fotos de 2003
 [-1,1].forEach(s=>{for(let z0=-52;z0<54;z0+=5+r()*7){const wd=2.5+r()*3,len=1.4+r()*2.8;for(let q=0;q<wd/.28;q++){const z=z0+q*.28+(r()-.5)*.15,y=titaHe(z)-.4-r()*.5;out.push(...rustClump(r,s*(titaXs(z,y)+.09),y,z,len*(.5+r()*.6),.035+r()*.035,RUSTP))}}});
 // cortina en la rotura de popa, a todo lo ancho
 for(let q=0;q<110;q++){const x=(q/109-.5)*2*13.2,y=4+r()*21;if(Math.abs(x)>titaXs(-57,y)*.95)continue;out.push(...rustClump(r,x,y,-57.2-r()*.9,1.8+r()*4.2,.04+r()*.05,RUSTP))}
 // restos de rusticles caídos sobre el fondo, alrededor del casco
 {const wx=WR.titanic.x;for(let i=0;i<170;i++){const s=r()<.5?-1:1,lx=s*(15+r()*9),lz=-62+r()*124,ly=base(wx)-floorAt(wx+lx,lz),a=r()*6.28,l=.35+r()*1.1,c=RUSTP[Math.floor(r()*RUSTP.length)];out.push(P(seg(V3([lx,ly+.1,lz]),V3([lx+Math.cos(a)*l,ly+.12,lz+Math.sin(a)*l]),.07+r()*.07,.04,5),c))}}
 // borde roto de popa: racimos pesados
 for(let i=0;i<36;i++){const y=4+r()*20,x=(r()-.5)*2*titaXs(-57,y)*.95;out.push(...rustClump(r,x,y,-57-r()*1.5,1+r()*2.6,.14+r()*.22))}
 return out};
// barandas de proa: tres tubos que siguen la curva del casco, postes, tramos caídos y óxido
const titaRails=()=>{const r=mb(52),out=[],ys=[.38,.78,1.18],DK=25.2,col='#4a3a2c',ends=[];
 [-1,1].forEach(s=>{const pts=[];for(let z=10;z<=59.2;z+=1.6)pts.push([s*(titaHb(z)-.3),z]);pts.push([s*(titaHb(59.5)-.2),59.5]);ends.push(pts[pts.length-1]);
  ys.forEach((yy,k)=>{for(let i=0;i<pts.length-1;i++){if(r()<.1)continue;const dr=r()<.08?-.5*r():0,a=pts[i],b=pts[i+1];out.push(P(seg(V3([a[0],DK+yy+dr,a[1]]),V3([b[0],DK+yy+dr*.5,b[1]]),.055,.055,6),col));if(k>=1&&r()<.8)out.push(...rustClump(r,(a[0]+b[0])/2,DK+yy-.05,(a[1]+b[1])/2,.3+r()*1.1,.06+r()*.07))}});
  for(let i=0;i<pts.length;i+=2)out.push(P(CY(.05,.05,1.25,6),col,{p:[pts[i][0],DK,pts[i][1]]}),...(r()<.92?rustClump(r,pts[i][0],DK+.9,pts[i][1],.4+r()*1.4,.08+r()*.07):[]))});
 // curva que cierra la proa
 const e0=ends[0],e1=ends[1];ys.forEach(yy=>{let prev=e0;for(let k=1;k<=5;k++){const u=k/5,cur=[e0[0]*(1-u)+e1[0]*u,59.5+Math.sin(u*Math.PI)*.7];out.push(P(seg(V3([prev[0],DK+yy,prev[1]]),V3([cur[0],DK+yy,cur[1]]),.055,.055,6),col));prev=cur}});
 return out};
WR.titanic.g=()=>MG([
 ...titaRig(),
 ...[-36,-30,-24,-18].flatMap(z=>[-1,1].flatMap(s=>[P(seg(V3([s*11.2,27,z]),V3([s*11.2,31,z]),.12,.1,5),'#3d2f26'),P(seg(V3([s*11.2,31,z]),V3([s*9.6,32.3,z]),.1,.08,5),'#3d2f26')])),
 ...[30,36].flatMap(z=>[-1,1].map(s=>P(CY(.9,.7,1.4,10),'#4a3a30',{p:[s*3,25.2,z]}))),
 P(BXs(3,1.5,3,.2,2),'#4a3a30',{p:[0,25.2,24]}),P(seg(V3([5,25.2,20]),V3([5,34,20]),.25,.2,6),'#3d2f26'),P(seg(V3([5,34,20]),V3([5,30,32]),.16,.1,5),'#3d2f26'),
 P(CY(.7,.5,30,6),'#4a3a30',{p:[0,25,36],r:[.35,0,.04]}),P(CY(1.2,1.1,1.4,10),'#3a2c22',{p:[0,50.4,45.3]}),
 ...[-1,1].map(s=>P(CY(.5,.5,9,8),'#3d2f26',{p:[s*3,25,42]})),
 ...[-1,1].map(s=>P(seg(V3([s*6,25,30]),V3([s*7,38,32]),.25,.15),'#3d2f26')),
 P(CY(5,5,2,10),'#4a3a30',{p:[0,31,-20],s:[1,1,1.3]}),P(new T.TorusGeometry(4.6,.35,6,18),'#3a2c22',{p:[0,33,-20],r:[Math.PI/2,0,0],s:[1,1.3,1]}),
 ...titaRails(),
 ...rowZ(-58,-2,1.9,z=>[-1,1].flatMap(s=>[porth(s,28,22,6,z),porth(s,28,22,12,z)])),
 ...rowZ(-58,-2,3.8,z=>[-1,1].map(s=>porth(s,28,22,17,z))),
 ...[-4.5,4.5].map(x=>P(CZ(3.2,3.2,6.5,12),'#3a2c22',{p:[x,8,-57]})),
 ...Array.from({length:18},(_,i)=>{const a=(i/17)*Math.PI,x=Math.cos(a)*13.4,y=3+Math.sin(a)*17;return P(seg(V3([x,y,-58]),V3([x*1.04+(hs(i,1)-.5)*2,y+(hs(i,2)-.5)*3,-58-3-hs(i,3)*5]),.22,.12,5),'#3d2f26')}),
 ...Array.from({length:6},(_,i)=>P(BXs(2.5+hs(i,7)*3,.2,2+hs(i,8)*3,.05,1),'#4d3b2d',{p:[(hs(i,4)-.5)*20,4+hs(i,5)*14,-60-hs(i,6)*4],r:[(hs(i,9)-.5)*1.2,hs(i,10)*3,(hs(i,11)-.5)*1.2]})),
 ...titaRust()]);
WR.titanic.dg=()=>debris(77,100,60,['#3a2c22','#4a3a30','#5a3a22','#6a5038'],8200,(r,wx)=>Array.from({length:40},()=>{const lx=(r()-.5)*150,lz=(r()-.5)*90;return P(S_(.18+r()*.2,6,4),'#1a1a1a',{p:[lx,base(wx)-floorAt(wx+lx,lz)+.1,lz]})}));

WR.af447.g=()=>MG([
 P(CZ(2.35,2.3,8,16),'#868d93',{p:[16,2.5,-6],r:[0,.5,.15]}),
 P(BXs(26,.5,6,.2,3),'#7f868c',{p:[-14,.5,-4],r:[0,.5,0]}),
 ...[-9,-3,3,9].map(lx=>P(BXs(5,.15,1.2,.04,1),'#767d83',{p:[-14+lx*.878+3.4*.479,.8,-4-lx*.479+3.4*.878],r:[0,.5,.12]})),
 P(BXs(7,.4,3,.2,3),'#7f868c',{p:[8,.4,12],r:[0,-.4,0]}),P(BXs(6,.4,2.6,.2,3),'#7f868c',{p:[13.5,.5,13.5],r:[0,-.4,.1]}),
 P(CZ(1.15,1.05,4.5,16),'#8a9096',{p:[-9,1.5,-6]}),P(new T.TorusGeometry(1.2,.12,8,20),'#9aa0a6',{p:[-9,1.5,-6.1]}),P(CZ(1,1,.12,16),'#4a4f54',{p:[-9,1.5,-6.15]}),
 ...Array.from({length:18},(_,i)=>{const a=i/18*6.2832;return P(BXs(.08,.85,.04,.01,1),'#6a7076',{p:[-9+Math.cos(a)*.15,1.5+Math.sin(a)*.15,-6.2],r:[0,0,a-Math.PI/2]})}),
 P(CY(.55,.55,.4,14),'#15171a',{p:[3.6,.55,-2],r:[0,0,Math.PI/2]}),P(CY(.55,.55,.4,14),'#15171a',{p:[4.6,.55,-2],r:[0,0,Math.PI/2]}),P(seg(V3([4.1,.55,-2]),V3([4.1,3.2,-2.6]),.14,.1,6),'#9aa0a6'),
 P(finV([[0,0],[5,0],[2.5,9],[0,7]]),'#8f969c',{p:[0,5,-24]}),P(BXs(.4,6,2.2,.1,2),'#7f868c',{p:[0,2,-25.6],r:[.1,0,0]}),
 ...Array.from({length:22},(_,i)=>P(BXs(.5,.6,.1,.1,1),'#1a1e22',{p:[2.5,3.4,-24+i*1.1]}))]);
// --- AF447: librea de Air France (franjas azul/blanco/rojo, según la deriva recuperada en 2009, NTSB, dominio público), motor con aspas y paneles curvos de fuselaje ---
const af447Extra=()=>{const r=mb(447),wx=9500,out=[],fl=(lx,lz)=>base(wx)-floorAt(wx+lx,lz),WH='#d6dbe0',BL='#1c3f94',RD='#bf3a30';
 // deriva: base blanca + franjas paralelas al borde de ataque, en ambas caras
 const bands=[[0,.45,WH],[.45,1.05,BL],[1.05,1.6,RD],[1.6,2.0,WH],[2.0,2.6,BL]];
 [-1,1].forEach(s=>bands.forEach(([d1,d2,c])=>{const q=[[5-d1,.05],[5-d2,.05],[2.5-d2+.1,7.4],[2.5-d1+.1,7.4]];out.push(P(finV(q),c,{p:[s*.05,5,-24]}))}));
 // paneles de piel curvos con ventanillas y franja azul, tirados en el fondo
 const skin=(lx,lz,yaw,len,th0,dth,seed)=>{const y=fl(lx,lz)+.55;
  out.push(P(new T.CylinderGeometry(2.8,2.8,len,18,1,true,th0,dth),WH,{p:[lx,y,lz],r:[Math.PI/2,yaw,0]}),P(new T.CylinderGeometry(2.78,2.78,len,18,1,true,th0,dth),'#7d858c',{p:[lx,y,lz],r:[Math.PI/2,yaw,0]}));
  out.push(P(new T.CylinderGeometry(2.82,2.82,.32,18,1,true,th0,dth),BL,{p:[lx+Math.sin(yaw)*len*.18,y,lz+Math.cos(yaw)*len*.18],r:[Math.PI/2,yaw,0]}));
  for(let i=0;i<Math.floor(len/.55);i++){const a=th0+dth*.45,cx=Math.cos(a)*2.82,cy=Math.sin(a)*2.82,zt=-len/2+.4+i*.55;
   out.push(P(BXs(.3,.4,.05,.02,1),'#101418',{p:[lx+Math.sin(yaw)*(zt)+Math.cos(yaw)*cx*.0,y+cy*.0+.0,lz+Math.cos(yaw)*zt],r:[0,yaw,0]}))}};
 skin(-17,9,.4,6.5,0,2.4);skin(-24,-6,1.3,5,.3,2.2);skin(20,16,2.1,7,0,2.6);skin(6,22,.8,4.5,.2,2.0);
 // motor: cara del ventilador oscura, 30 aspas, buje cónico y escape
 const ex=-9,ey=1.5,ez=-6.2;out.push(P(CZ(.98,.98,.08,18),'#1e2226',{p:[ex,ey,ez]}),P(CO(.3,.7,10),'#8a9096',{p:[ex,ey,ez-.65],r:[-Math.PI/2,0,0]}));
 for(let i=0;i<30;i++){const a=i/30*6.2832;out.push(P(BXs(.1,.78,.025,.01,1),'#6f777e',{p:[ex+Math.cos(a)*.62,ey+Math.sin(a)*.62,ez-.04],r:[0,0,a-Math.PI/2+.25]}))}
 out.push(P(CO(.55,1.3,12),'#3a3f44',{p:[ex,ey,-1.45],r:[Math.PI/2,0,0]}));
 return out};
WR.af447.cg=()=>MG(af447Extra());
WR.af447.dg=()=>debris(55,80,34,['#8f969c','#7f868c','#767d83','#8a9096'],9500,(r,wx)=>Array.from({length:14},()=>{const lx=(r()-.5)*70,lz=(r()-.5)*50;return P(BXs(.5,.45,1.2,.1,1),'#5a6068',{p:[lx,base(wx)-floorAt(wx+lx,lz),lz],r:[0,r()*6,(r()-.5)*.4]})}));

const hullTaper=(z,L,B,bk)=>{const u=(z+L/2)/L,t=Math.max((u-bk)/(1-bk),0);return B/2*Math.pow(Math.max(1-Math.pow(t,1.8),0),.55)};
const bisRig=()=>{const out=[],g1='#3a4046',g2='#4a5058',dk='#0c0d0e',nat=z=>hullTaper(z,250,36,.45);
 // molinetes y cadena en el castillo de proa
 [[-4,106],[4,106],[0,112]].forEach(([x,z])=>out.push(P(CY(1.1,1,1.3,10),g2,{p:[x,16.7,z]}),P(CY(1.2,1.2,.2,10),g1,{p:[x,17.5,z]})));
 for(let i=0;i<16;i++)out.push(P(new T.TorusGeometry(.3,.08,5,8),'#2e2a26',{p:[Math.sin(i*.6)*.7,16.4,98+i*1.25],r:[i%2?Math.PI/2:0,0,i%2?0:Math.PI/2],s:[1,1,1.5]}));
 // bitas siguiendo la borda
 [-1,1].forEach(s=>[-112,-106,-100,92,98,104,110].forEach(z=>{const x=s*(Math.min(nat(z),18)-1.5);out.push(P(CY(.32,.38,1,8),g2,{p:[x,16.5,z]}),P(CY(.45,.45,.16,8),g1,{p:[x,17.05,z]}))}));
 // proyectores y plataformas junto a la chimenea
 [-1,1].forEach(s=>[[-44,33],[-68,33]].forEach(([z,y])=>out.push(P(CY(.45,.55,y-16.5,8),g2,{p:[s*5.5,16.5+(y-16.5)/2,z]}),P(CY(.9,.9,.5,10),g1,{p:[s*5.5,y,z]}),P(CY(.8,.8,1,10),g2,{p:[s*5.5,y+.7,z],r:[0,0,0]}),P(CY(.62,.62,.06,10),'#8a8f94',{p:[s*5.5,y+1.25,z]}))));
 // grúa de popa con pluma
 out.push(P(CY(.6,.8,7,8),g2,{p:[0,20,-112]}),P(seg(V3([0,23,-112]),V3([0,30,-100]),.3,.2,6),g1),P(seg(V3([0,30,-100]),V3([0,18,-98]),.03,.03,4),'#2a2420'));
 // ventiladores con rejilla
 [-1,1].forEach(s=>[-30,-24,-2,6].forEach(z=>{out.push(P(BXs(1.8,2.2,1.4,.3,1),g2,{p:[s*12,17.4,z]}));for(let k=-1;k<=1;k++)out.push(P(BXs(.1,1.6,.04,.01,1),dk,{p:[s*12+k*.45,17.4,z+(s>0?.72:.72)]}))}));
 // sistema de telémetros en el mástil de proa
 out.push(P(CY(1.6,1.6,.4,12),g1,{p:[0,48,41.5]}),...[-1,1].map(s=>P(CZ(.35,.35,3,8),g2,{p:[s*2.2,48.8,41.5],r:[0,0,Math.PI/2]})));
 return out};
const robRig=()=>{const out=[],g1='#3a4046',g2='#4a5058',dk='#0c0d0e';
 // tubos lanzatorpedos triples
 out.push(P(CY(.9,.9,.5,10),g2,{p:[0,8.1,-1]}),...[-.7,0,.7].map(x=>P(CZ(.26,.26,4.2,10),'#8f8a58',{p:[x,9.1,-1]})));
 // rieles de cargas de profundidad y lanzadores K
 for(let i=0;i<4;i++)out.push(P(CZ(.22,.22,.9,6),'#3d444a',{p:[-1.2,8.3,-42.6-i*.5],r:[0,0,Math.PI/2]}),P(CZ(.22,.22,.9,6),'#3d444a',{p:[1.2,8.3,-42.6-i*.5],r:[0,0,Math.PI/2]}));
 [-1,1].forEach(s=>[-35,-33,-31].forEach(z=>out.push(P(CY(.22,.22,.8,6),g1,{p:[s*3.6,8.5,z]}))));
 // balsas Carley (anillos) a los costados
 [-1,1].forEach(s=>[-14,-11].forEach(z=>out.push(P(new T.TorusGeometry(.7,.14,5,12),'#5a4a3a',{p:[s*4.2,8.8,z],r:[Math.PI/2,0,0]}))));
 // bitas y cadena de proa
 [-1,1].forEach(s=>[34,37,40].forEach(z=>{const x=s*Math.min(hullTaper(z,93,11,.45)-.7,4.6);out.push(P(CY(.22,.26,.7,8),g2,{p:[x,8.35,z]}))}));
 for(let i=0;i<10;i++)out.push(P(new T.TorusGeometry(.2,.055,5,8),'#2e2a26',{p:[Math.sin(i*.6)*.4,8.15,34+i*.8],r:[i%2?Math.PI/2:0,0,i%2?0:Math.PI/2],s:[1,1,1.5]}));
 // cofa y antena de radar
 out.push(P(BXs(2.2,.2,2.2,.05,1),g2,{p:[0,24.5,6.7]}),P(CY(1.1,1.1,.1,12),'#6a7076',{p:[0,25,6.5],r:[Math.PI/2,0,0]}));
 return out};
// --- Bismarck: misma fórmula del casco que el SDF (hp [250,36,16,.45], cubierta en y=16) para pegar óxido y barandas ---
const bisXs=(z,y)=>{const L=250,z0=-L/2+.45*L,tt=Math.max((z-z0)/(L/2-z0),0),hb=Math.max(18*Math.pow(Math.max(1-Math.pow(tt,1.8),0),.55),.001),v=Math.min(Math.max(1-y/16,0),1);return hb*Math.sqrt(Math.max(1-Math.pow(v,4.444),0))};
const RUSTB=['#7a3a14','#8a4418','#5e2c12','#a05520','#4a2a18','#6a3216'];
const bisRust=()=>{const r=mb(77),out=[];
 [-1,1].forEach(s=>{for(let z=-121;z<119;z+=.7+r()*.7){const y=15.7;out.push(...rustClump(r,s*(bisXs(z,y)+.1),y,z,.4+r()*r()*1.9,.05+r()*.07,RUSTB))}});
 for(let i=0;i<260;i++){const z=-121+r()*240,y=1+r()*14,s=r()<.5?-1:1;out.push(...rustClump(r,s*(bisXs(z,y)+.06),y,z,.5+r()*1.6,.05+r()*.08,RUSTB))}
 return out};
// barandas a lo largo de toda la cubierta: dos tubos con postes, tramos caídos y óxido
const bisRails=()=>{const r=mb(88),out=[],DK=16,col='#3a342e',ys=[.55,1.05];
 [-1,1].forEach(s=>{const pts=[];for(let z=-120;z<=118;z+=2.4)pts.push([s*(bisXs(z,15.9)-.25),z]);
  ys.forEach(yy=>{for(let i=0;i<pts.length-1;i++){if(r()<.22)continue;const dr=r()<.1?-.45*r():0,a=pts[i],b=pts[i+1];out.push(P(seg(V3([a[0],DK+yy+dr,a[1]]),V3([b[0],DK+yy+dr*.5,b[1]]),.05,.05,6),col));if(r()<.3)out.push(...rustClump(r,(a[0]+b[0])/2,DK+yy-.05,(a[1]+b[1])/2,.2+r()*.8,.04+r()*.05,RUSTB))}});
  pts.forEach(p=>{if(r()<.8)out.push(P(CY(.045,.045,1.15,6),col,{p:[p[0],DK,p[1]]}),...(r()<.45?rustClump(r,p[0],DK+.9,p[1],.3+r()*1.0,.07,RUSTB):[]))})});
 return out};
WR.bismarck.g=()=>MG([
 ...bisRig(),
 P(CY(2.9,1.7,26,12),'#4d545c',{p:[0,16,-56],s:[1.4,1,1]}),P(CY(1.8,1.8,.9,12),'#33383e',{p:[0,42,-56],s:[1.4,1,1]}),P(new T.TorusGeometry(1.75,.15,6,16),'#33383e',{p:[0,42.9,-56],r:[Math.PI/2,0,0],s:[1.4,1,1]}),
 P(seg(V3([0,42,-36]),V3([0,64,-33]),.9,.35,6),'#4a5058'),P(seg(V3([-8,55,-34.5]),V3([8,55,-34.5]),.15,.15,5),'#3a4046'),P(seg(V3([0,18,40]),V3([0,44,42]),.7,.3,6),'#4a5058'),
 ...turret2(92,1),...turret2(66,1),...turret2(-76,-1),...turret2(-102,-1),
 ...[-1,1].flatMap(s=>[30,10,-12,-60,-84].map(z=>P(BXs(4,2.4,4.2,.9,3),'#50575f',{p:[s*9,16,z]}))),
 ...[-1,1].flatMap(s=>rowZ(-62,60,11,z=>AAm(s*7.5,20,z))),
 ...rowZ(-100,-18,2.6,z=>[-1,1].map(s=>porth(s,36,16,9.5,z))),
 ...bisRails(),
 P(BXs(1.6,.3,22,.1,1),'#3a4046',{p:[0,20.2,30]}),P(seg(V3([4,20,10]),V3([4,32,10]),.3,.2,6),'#3a4046'),P(seg(V3([4,32,10]),V3([-3,30,16]),.2,.12,5),'#3a4046'),
 ...bisRust()]);
WR.bismarck.dg=()=>debris(31,110,90,['#4b525a','#3d444a','#555c64','#6a4224'],11300);

// --- USS Samuel B. Roberts (DE-413): referencias reales = fotos de Victor Vescovo desde el DSV Limiting Factor (2022, CC BY-SA 4.0, Wikimedia Commons): proa pálida con manchas de óxido, escobenes, lifelines dobladas, tubos lanzatorpedos ocres con óxido colgando y maraña de cables ---
const robXs=(z,y)=>{const L=93,z0=-L/2+.45*L,tt=Math.max((z-z0)/(L/2-z0),0),hb=Math.max(5.5*Math.pow(Math.max(1-Math.pow(tt,1.8),0),.55),.001),v=Math.min(Math.max(1-y/8,0),1);return hb*Math.sqrt(Math.max(1-Math.pow(v,4.444),0))};
const RUSTR=['#b8782e','#c88a3a','#9a5a24','#d49a48','#8a4a1e','#b06a26'];
const robExtra=()=>{const r=mb(413),out=[],DK=8,PA='#cfd3cb',WI='#9aa09a';
 // lifelines: postes y dos cables con comba a cada banda; tramos caídos/doblados
 [-1,1].forEach(s=>{const pts=[];for(let z=-44;z<=43;z+=2.2)pts.push([s*(robXs(z,7.9)-.12),z]);
  pts.forEach((p,i)=>{const bent=r()<.18;if(r()<.88)out.push(P(CY(.03,.03,1.05,5),PA,{p:[p[0],DK,p[1]],r:[bent?(r()-.5)*1.1:0,0,bent?(r()-.5)*1.1:0]}))});
  [.5,1.0].forEach(yy=>{for(let i=0;i<pts.length-1;i++){if(r()<.2)continue;const a=pts[i],b=pts[i+1],sag=.1+(r()<.15?.55*r():0),m=[(a[0]+b[0])/2,DK+yy-sag,(a[1]+b[1])/2];out.push(P(seg(V3([a[0],DK+yy,a[1]]),V3(m),.014,.014,4),WI),P(seg(V3(m),V3([b[0],DK+yy,b[1]]),.014,.014,4),WI));if(r()<.12)out.push(...rustClump(r,m[0],m[1],m[2],.3+r()*.8,.035,RUSTR))}})});
 // escobenes de proa
 [-1,1].forEach(s=>out.push(P(new T.TorusGeometry(.34,.1,6,10),'#d8dcd6',{p:[s*(robXs(40,7.9)-.35),DK+.25,40],r:[Math.PI/2,0,0]})));
 // tubos lanzatorpedos: aros y óxido ocre colgando desde arriba
 [-.7,0,.7].forEach(x=>[.5,1.4,2.4,3.4].forEach(t=>out.push(P(new T.TorusGeometry(.285,.045,5,12),'#b8b078',{p:[x,9.1,-1+t]}))));
 for(let i=0;i<46;i++){const x=(r()-.5)*2.3,z=-1+r()*4.2;out.push(...rustClump(r,x,9.55,z,.6+r()*1.9,.08+r()*.11,RUSTR))}
 // óxido en el borde de cubierta y chorreaduras del casco
 [-1,1].forEach(s=>{for(let z=-44;z<44;z+=.8+r()*.9){const y=7.7;out.push(...rustClump(r,s*(robXs(z,y)+.08),y,z,.4+r()*r()*2,.05+r()*.09,RUSTR))}});
 for(let i=0;i<180;i++){const z=-44+r()*86,y=.8+r()*6.6,s=r()<.5?-1:1;out.push(...rustClump(r,s*(robXs(z,y)+.05),y,z,.4+r()*1.4,.05+r()*.08,RUSTR))}
 return out};
// maraña de cables y varillas retorcidas sobre el fondo (campo de restos de la foto de 2022)
const robCables=()=>{const r=mb(414),wx=15150,out=[],fl=(lx,lz)=>base(wx)-floorAt(wx+lx,lz);
 for(let k=0;k<70;k++){const a=r()*6.28,d=5+r()*16,sx=Math.cos(a)*d,sz=Math.sin(a)*d*.9;let x=sx,z=sz,y=fl(x,z)+.15+r()*.5,dir=r()*6.28;const col=['#4a463e','#5a5144','#3e3a34','#6a5a48'][Math.floor(r()*4)];
  for(let q=0;q<7;q++){dir+=(r()-.5)*1.7;const l=.7+r()*1.4,nx=x+Math.cos(dir)*l,nz=z+Math.sin(dir)*l,ny=fl(nx,nz)+.12+r()*.7;out.push(P(seg(V3([x,y,z]),V3([nx,ny,nz]),.025+r()*.02,.025,4),col));x=nx;y=ny;z=nz}}
 return out};
WR.roberts.cg=()=>MG(robCables());
WR.roberts.g=()=>MG([
 ...robRig(),
 P(CY(2.3,1.9,7,12),'#4a5058',{p:[0,8,-6],s:[1.3,1,1]}),P(CY(2.3,1.9,7,12),'#4a5058',{p:[0,8,-16],s:[1.3,1,1]}),P(seg(V3([0,17,7]),V3([0,30,6]),.45,.2,6),'#4a5058'),P(seg(V3([-3,26,6.5]),V3([3,26,6.5]),.1,.1,4),'#3a4046'),
 ...[30,-30,-38].flatMap(z=>[P(CY(1.7,1.5,1.3,10),'#50575f',{p:[0,8,z]}),P(BXs(2.2,2.2,3,.6,3),'#545b63',{p:[0,9.2,z]}),P(CZ(.22,.18,5,8),'#3a4046',{p:[0,10.4,z+(z>0?1:-1)*1.2],r:[0,z>0?0:Math.PI,0]})]),
 P(CZ(.55,.5,5,8),'#3d444a',{p:[2.2,9.5,-26]}),P(CZ(.55,.5,5,8),'#3d444a',{p:[-2.2,9.5,-26]}),
 ...rowZ(-40,-6,2.4,z=>[-1,1].map(s=>porth(s,11,8,4,z))),
 ...rowZ(2,10,1.4,z=>[-1,1].map(s=>win(s*3.52,9.6,z,.12,.9,.6))),
 ...rowZ(-44,-40,1,z=>P(CY(.25,.25,.7,8),'#3d444a',{p:[1,8,z-1]})),
 ...robExtra()]);
WR.roberts.dg=()=>debris(13,50,45,['#4a5058','#3d444a','#555c64','#6a4224'],15150);

const galeonRig=()=>{const out=[],Ls=[19,24,15],cw='#2a2018',cs='#8a7a5c';
 [-9,0,9].forEach((z,i)=>{const d=new T.Vector3(0,1,0).applyEuler(new T.Euler((i-1)*.45,0,(i-1)*.3)),L=Ls[i],pt=f=>new T.Vector3(0,7,z).addScaledVector(d,L*(f-.5)).toArray();
  [[.5,8],[.72,6.5],[.9,4.5]].forEach(([f,len],k)=>{const c=pt(f),tilt=(i-1)*.12+(k===1&&i===0?.35:0);
   out.push(P(seg(V3([c[0]-len/2,c[1]-Math.sin(tilt)*len/2,c[2]]),V3([c[0]+len/2,c[1]+Math.sin(tilt)*len/2-(k===2&&i!==1?.9:0),c[2]]),.22,.16,6),'#3a2a1c'))});
  if(i!==1){const c=pt(.82);out.push(P(BXs(6.6,3.6,.5,.12,1),cs,{p:[c[0],c[1]-1.9,c[2]+.35],r:[.12,0,(i-1)*.1]}));out.push(P(BXs(2.8,2.6,.5,.12,1),cs,{p:[c[0]+2.4,c[1]-4.2,c[2]+.7],r:[.2,0,.3]}));out.push(P(BXs(1.8,3,.45,.1,1),cs,{p:[c[0]-2.6,c[1]-3.9,c[2]+.5],r:[.15,0,-.12]}))}
  const m=pt(.62);[-1,1].forEach(sx=>[-1.6,1.6].forEach(dz=>out.push(P(seg(V3(m),V3([sx*(hullX(11,7,5)+.05),5,z+dz]),.06,.05,4),cw))))});
 out.push(P(seg(V3([0,9.5,13]),V3([0,12.8,22]),.3,.17,6),'#3a2a1c'));return out};
WR.galeon.g=()=>MG([
 ...galeonRig(),
 ...[-9,0,9].map((z,i)=>P(CY(.5,.3,[19,24,15][i],6),'#3a2a1c',{p:[0,7,z],r:[(i-1)*.45,0,(i-1)*.3]})),
 ...[-9,0,9].map((z,i)=>P(CY(.12,.12,7,5),'#3a2a1c',{p:[(i-1)*2,12+i*2,z],r:[0,0,Math.PI/2]})),
 ...rowZ(-12,12,2.1,z=>[-1,1].map(s=>P(BXs(.9,.8,.2,.1,1),'#14100c',{p:[s*(hullX(11,7,3.4)+.02),3.4,z]}))),
 ...Array.from({length:10},(_,i)=>P(CZ(.24,.2,1.7,6),'#2a2a28',{p:[(i%2?1:-1)*6.1,5,-10+Math.floor(i/2)*3.2],r:[0,(i%2?1:-1)*1.3,0]})),
 ...rowZ(-8,6,1.5,z=>P(new T.TorusGeometry(5,.13,6,14,Math.PI),'#3a2a1c',{p:[14,.2,z]}))]);
// --- Galeón San José: carga y artillería (cañones de bronce con pátina, botijas, porcelana, lingotes, monedas) apoyadas sobre el fondo real ---
const galeonCargo=()=>{const r=mb(133),wx=3300,out=[],fl=(lx,lz)=>base(wx)-floorAt(wx+lx,lz);
 const BR=['#1f5a48','#2a6a52','#3a6a44','#4a5a34','#2a4a3e','#5a5a30'],GD='#a88a30';
 const cannon=(x,y,z,yaw,len)=>{const dx=Math.sin(yaw),dz=Math.cos(yaw),px=Math.cos(yaw),pz=-Math.sin(yaw),c=BR[Math.floor(r()*BR.length)],c2=BR[Math.floor(r()*BR.length)];
  out.push(P(CZ(.19,.12,len,8),c,{p:[x,y,z],r:[0,yaw,0]}),P(S_(.095,6,4),c,{p:[x-dx*.08,y,z-dz*.08]}));
  [.12,.5*len,len-.1].forEach((t,i)=>out.push(P(new T.TorusGeometry(.2-.07*(t/len)+.012,.028,5,10),c2,{p:[x+dx*t,y,z+dz*t],r:[0,yaw,0]})));
  const m=[x+dx*len*.45,y,z+dz*len*.45];out.push(P(seg(V3([m[0]-px*.27,m[1],m[2]-pz*.27]),V3([m[0]+px*.27,m[1],m[2]+pz*.27]),.04,.04,5),c2));
  out.push(P(seg(V3([x+dx*len*.38,y+.2,z+dz*len*.38]),V3([x+dx*len*.52,y+.27,z+dz*len*.52]),.022,.022,4),GD))};
 // montón de cañones junto al casco (a estribor)
 for(let i=0;i<22;i++){const lx=11+r()*6,lz=-7+r()*14,k=Math.floor(r()*3);cannon(lx,fl(lx,lz)+.22+k*.32,lz,r()*Math.PI,2.2+r()*1.2)}
 // cañones sueltos alrededor
 for(let i=0;i<14;i++){const a=r()*6.28,d=14+r()*16,lx=Math.cos(a)*d,lz=Math.sin(a)*d*.8;cannon(lx,fl(lx,lz)+.2,lz,r()*Math.PI,2+r()*1.4)}
 // botijas peruleras (de pie, caídas)
 const jp=[[0,0],[.12,0],[.2,.2],[.24,.5],[.2,.85],[.1,1],[.11,1.08],[0,1.08]].map(q=>new T.Vector2(q[0],q[1]));
 for(let i=0;i<46;i++){const a=r()*6.28,d=6+r()*22,lx=Math.cos(a)*d,lz=Math.sin(a)*d*.8,c=['#8a6a48','#7a5a3a','#6a4c32','#9a7a54'][Math.floor(r()*4)],s=.42+r()*.12,lay=r()<.6;
  out.push(P(new T.LatheGeometry(jp,9),c,{p:[lx,fl(lx,lz)+(lay?.13:.0),lz],s:[s,s,s],r:lay?[0,r()*6.28,Math.PI/2+(r()-.5)*.4]:[(r()-.5)*.3,0,(r()-.5)*.3]}))}
 // porcelana, lingotes y monedas
 for(let i=0;i<90;i++){const a=r()*6.28,d=3+r()*18,lx=Math.cos(a)*d,lz=Math.sin(a)*d*.8;out.push(P(BXs(.1+r()*.16,.012,.08+r()*.14,.004,1),r()<.5?'#d7dde0':'#6a86b0',{p:[lx,fl(lx,lz)+.01,lz],r:[0,r()*6.28,(r()-.5)*.3]}))}
 for(let i=0;i<16;i++){const lx=9+r()*8,lz=-5+r()*10;out.push(P(BXs(.34,.07,.12,.02,1),'#8a9096',{p:[lx,fl(lx,lz)+.03,lz],r:[0,r()*3.14,0]}))}
 for(let i=0;i<200;i++){const a=r()*6.28,d=2+r()*12,lx=9+Math.cos(a)*d*.6,lz=Math.sin(a)*d*.6;out.push(P(CY(.032,.032,.007,6),r()<.7?GD:'#a9b0b4',{p:[lx,fl(lx,lz)+.012,lz],r:[(r()-.5)*.4,0,(r()-.5)*.4]}))}
 return out};
WR.galeon.dg=()=>debris(5,50,28,['#3a2a1c','#2a2a28','#4a3524','#6a5038'],3300,(r,wx)=>Array.from({length:7},()=>{const lx=(r()-.5)*40,lz=(r()-.5)*30;return P(CZ(.28,.22,2.6,7),'#25252a',{p:[lx,base(wx)-floorAt(wx+lx,lz)+.2,lz],r:[0,r()*6,0]})}).concat([P(seg(V3([20,.4,5]),V3([20,.4,9.5]),.16,.16,5),'#2a2a28'),P(seg(V3([18.5,.4,9.5]),V3([21.5,.4,9.5]),.14,.14,5),'#2a2a28')]));
WR.galeon.cg=()=>MG(galeonCargo());

// ================= VIDA SOBRE EL TITANIC (Cleland et al., Deep-Sea Research I 223 (2025) 104544; video de la expedición de 2022) =================
const SRC_T='Cleland et al., Deep-Sea Research I 223 (2025) 104544, doi:10.1016/j.dsr.2025.104544 (acceso abierto)';
const LIFEC={
 bambu:{n:'Coral bambú del Titanic',l:'Lepidisis sp.',src:SRC_T,note:'Colonias abundantes en las barandas más adelantadas de la proa, en la grúa principal del ancla y alrededor de las ventanas de las cabinas de la cubierta B, a estribor. En el video de 1986 la grúa ya tenía colonias establecidas, con más reclutas y crecimiento en 2010 y 2022. Una colonia vista en 2001 aparece en 2021 con aproximadamente el doble de tamaño. Crecimiento lineal medio estimado de hasta 10 mm por año.'},
 chryso:{n:'Coral dorado del Titanic',l:'Chrysogorgia sp.',src:SRC_T,note:'Colonias sobre y cerca de las barandas de proa, en un pescante Welin de babor y a lo largo del flanco de estribor. Una colonia bajo la tercera baranda medía ~160 mm en 2021 y ~170 mm en 2022 (unos 10 mm por año). En el mecanismo de izado del pescante de babor no se veía en 1998 ni 2010.'},
 langostino:{n:'Langostino de fondo blanco',l:'Munidopsis sp.',src:SRC_T,note:'Más común en el campo de escombros y en el casco que en otros hábitats del sitio; también estaba en la dorsal vecina (13 % de sus imágenes).'},
 ofiuro:{n:'Ofiuros',l:'Ophiuroidea',src:SRC_T,note:'El taxón más común en los sustratos blandos del sitio del Titanic (arena fangosa, hábitat mixto y campo de escombros), y de los más frecuentes del estudio entero.'},
 anemona:{n:'Anémona blanca del casco',l:'Actiniaria',src:SRC_T,note:'Un ejemplar sobre el casco de babor cerca de la proa, visto en los videos de 2010 y 2022. En las expediciones de 1991 y 1999 se registraron anémonas sin ubicación precisa.'},
 brisingido:{n:'Estrella de mar brisingida',l:'Brisingidae',src:SRC_T,note:'En videos de las décadas de 1990 a 2020 se las ve fijas sobre o cerca de las barandas de proa, con los brazos extendidos en la columna de agua (conducta de alimentación).'}};
const LIFE=[];
function lifeGeo(){const r=mb(2026),out=[];LIFE.length=0;const C='#f1ead8',wx=8200;
 const nrm=v=>{const l=Math.hypot(...v)||1;return v.map(q=>q/l)};
 const coral=(x,y,z,dir,len)=>{for(let k=0;k<3;k++){let d=nrm([dir[0]+(r()-.5)*.7,dir[1]+.35+(r()-.5)*.5,dir[2]+(r()-.5)*.7]),p=[x+(r()-.5)*.08,y,z+(r()-.5)*.08],L=len*(.6+r()*.6);
  for(let q=0;q<3;q++){const e=[p[0]+d[0]*L/3,p[1]+d[1]*L/3,p[2]+d[2]*L/3];out.push(P(seg(V3(p),V3(e),.022-q*.004,.019-q*.004,4),C));p=e;d=nrm([d[0],d[1]-.25,d[2]])}}
  LIFE.push({c:LIFEC.bambu,p:[x,y+len*.4,z]})};
 const chryso=(x,y,z,dir,len)=>{const d=nrm([dir[0],dir[1]+.5,dir[2]]),K='#dccf9f';let p=[x,y,z];
  for(let q=0;q<5;q++){const e=[p[0]+d[0]*len/5,p[1]+d[1]*len/5,p[2]+d[2]*len/5];out.push(P(seg(V3(p),V3(e),.012,.011,4),K));const a=q*2.4;out.push(P(seg(V3(e),V3([e[0]+Math.cos(a)*.07,e[1]+.04,e[2]+Math.sin(a)*.07]),.006,.004,3),K));p=e}
  LIFE.push({c:LIFEC.chryso,p:[x+d[0]*len*.5,y+d[1]*len*.5,z+d[2]*len*.5]})};
 const lobster=(x,y,z,yaw)=>{const cs=Math.cos(yaw),sn=Math.sin(yaw),T=(a,b,c)=>[x+a*cs+c*sn,y+b,z-a*sn+c*cs],W='#ece8df';
  out.push(P(S_(1,7,5),W,{p:[x,y+.04,z],s:[.06,.045,.11],r:[0,yaw,0]}));out.push(P(seg(V3(T(0,.03,-.07)),V3(T(0,.01,-.16)),.025,.012,5),W));
  for(const s of[-1,1]){out.push(P(seg(V3(T(s*.03,.05,.07)),V3(T(s*.07,.05,.19)),.014,.01,4),W));for(let l=0;l<3;l++)out.push(P(seg(V3(T(s*.04,.03,.04-l*.04)),V3(T(s*.11,0,.05-l*.05)),.007,.005,3),W))}
  LIFE.push({c:LIFEC.langostino,p:[x,y+.05,z]})};
 const brittle=(x,y,z)=>{out.push(P(S_(.025,6,4),'#d8bba5',{p:[x,y+.01,z],s:[1,.5,1]}));for(let a=0;a<5;a++){const an=a/5*6.2832+r()*.4,L=.1+r()*.08;out.push(P(seg(V3([x,y+.01,z]),V3([x+Math.cos(an)*L,y+.012,z+Math.sin(an)*L]),.008,.004,3),'#d8bba5'))}LIFE.push({c:LIFEC.ofiuro,p:[x,y+.02,z]})};
 const anemH=(x,y,z)=>{out.push(P(seg(V3([x-.25,y,z]),V3([x+.12,y,z]),.07,.048,8),'#efefe6'));for(let a=0;a<12;a++){const an=a/12*6.2832,c=Math.cos(an),s=Math.sin(an);out.push(P(seg(V3([x+.12,y+c*.03,z+s*.03]),V3([x+.24,y+c*.1,z+s*.1]),.008,.004,3),'#f0efe6'))}LIFE.push({c:LIFEC.anemona,p:[x+.1,y,z]})};
 const brising=(x,y,z)=>{out.push(P(S_(.03,6,4),'#d98c5f',{p:[x,y,z],s:[1,.6,1]}));for(let a=0;a<8;a++){const an=a/8*6.2832,c=Math.cos(an),s=Math.sin(an),m=[x+c*.12,y+.12,z+s*.12],e=[x+c*.2,y+.32+r()*.1,z+s*.2];out.push(P(seg(V3([x,y,z]),V3(m),.01,.007,3),'#d98c5f'),P(seg(V3(m),V3(e),.007,.003,3),'#d98c5f'))}LIFE.push({c:LIFEC.brisingido,p:[x,y+.15,z]})};
 // Lepidisis: barandas más adelantadas de proa, grúa del ancla y ventanas de la cubierta B a estribor (x<0: mirando a proa, +z, estribor queda en -x)
 for(const z of[32,35,38,41])for(const s of[-1,1])coral(s*10.5,26.4,z,[s*.4,.6,0],.55+r()*.4);
 for(let i=0;i<6;i++)coral(5.15,26.5+i*1.4,20,[1,.1,0],.5+r()*.4);
 for(const z of[-34,-28,-22,-16,-10,-4,2,8,12])coral(-12.3,23.6+r()*.8,z,[-1,.1,0],.4+r()*.3);
 // Chrysogorgia: barandas de proa, pescante Welin de babor (+x), flanco de estribor (-x)
 for(const z of[28,31,36,40])chryso(10.5*(z%2?1:-1),26.4,z,[0,1,0],.25+r()*.1);
 chryso(11.2,29.3,-30,[.3,1,0],.25);for(const z of[-30,-20,-12,-2])chryso(-12.3,22.8,z,[-1,.2,0],.22);
 // Munidopsis: casco/cubierta y campo de escombros
 for(let i=0;i<9;i++)lobster((r()-.5)*16,25.2,12+r()*28,r()*6.28);
 for(let i=0;i<6;i++){const lx=(r()-.5)*70,lz=(r()-.5)*90;lobster(lx,base(wx)-floorAt(wx+lx,lz)+.02,lz,r()*6.28)}
 // Ophiuroidea: sustrato blando alrededor del casco
 for(let i=0;i<40;i++){let lx,lz;do{lx=(r()-.5)*100;lz=(r()-.5)*150}while(Math.abs(lx)<17&&Math.abs(lz)<64);brittle(lx,base(wx)-floorAt(wx+lx,lz)+.02,lz)}
 // un solo ejemplar de anémona blanca: casco de babor (+x) cerca de la proa
 anemH(7.2,11,50);
 // Brisingidae sobre las barandas de proa
 for(const z of[34,38,41])for(const s of[-1,1])brising(s*10.5,26.6,z+(r()-.5)*.6);
 return MG(out)}
{const d0=WR.titanic.dg;WR.titanic.dg=()=>MG([d0(),lifeGeo()])}
WR.titanic.note+=' En 2022 se contaron 21 morfotipos de megafauna en la proa frente a 73 en una dorsal vecina a 2.900 m (diversidad de Shannon 1,39 contra 2,89).';
WR.titanic.src=SRC_T;
