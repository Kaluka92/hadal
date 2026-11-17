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
WR.titanic.g=()=>MG([
 ...titaRig(),
 ...[-36,-30,-24,-18].flatMap(z=>[-1,1].flatMap(s=>[P(seg(V3([s*11.2,27,z]),V3([s*11.2,31,z]),.12,.1,5),'#3d2f26'),P(seg(V3([s*11.2,31,z]),V3([s*9.6,32.3,z]),.1,.08,5),'#3d2f26')])),
 ...[30,36].flatMap(z=>[-1,1].map(s=>P(CY(.9,.7,1.4,10),'#4a3a30',{p:[s*3,25.2,z]}))),
 P(BXs(3,1.5,3,.2,2),'#4a3a30',{p:[0,25.2,24]}),P(seg(V3([5,25.2,20]),V3([5,34,20]),.25,.2,6),'#3d2f26'),P(seg(V3([5,34,20]),V3([5,30,32]),.16,.1,5),'#3d2f26'),
 P(CY(.7,.5,30,6),'#4a3a30',{p:[0,25,36],r:[.35,0,.04]}),P(CY(1.2,1.1,1.4,10),'#3a2c22',{p:[0,50.4,45.3]}),
 ...[-1,1].map(s=>P(CY(.5,.5,9,8),'#3d2f26',{p:[s*3,25,42]})),
 ...[-1,1].map(s=>P(seg(V3([s*6,25,30]),V3([s*7,38,32]),.25,.15),'#3d2f26')),
 P(CY(5,5,2,10),'#4a3a30',{p:[0,31,-20],s:[1,1,1.3]}),P(new T.TorusGeometry(4.6,.35,6,18),'#3a2c22',{p:[0,33,-20],r:[Math.PI/2,0,0],s:[1,1.3,1]}),
 ...[-1,1].map(s=>P(seg(V3([s*10.5,26.3,10]),V3([s*10.5,26.3,42]),.07),'#2e241c')),
 ...Array.from({length:22},(_,i)=>[-1,1].map(s=>P(CY(.07,.07,1.2,4),'#2e241c',{p:[s*10.5,25.2,10+i*1.5]}))).flat(),
 ...rowZ(-58,-2,1.9,z=>[-1,1].flatMap(s=>[porth(s,28,22,6,z),porth(s,28,22,12,z)])),
 ...rowZ(-58,-2,3.8,z=>[-1,1].map(s=>porth(s,28,22,17,z))),
 ...[-4.5,4.5].map(x=>P(CZ(3.2,3.2,6.5,12),'#3a2c22',{p:[x,8,-57]})),
 ...Array.from({length:18},(_,i)=>{const a=(i/17)*Math.PI,x=Math.cos(a)*13.4,y=3+Math.sin(a)*17;return P(seg(V3([x,y,-58]),V3([x*1.04+(hs(i,1)-.5)*2,y+(hs(i,2)-.5)*3,-58-3-hs(i,3)*5]),.22,.12,5),'#3d2f26')}),
 ...Array.from({length:6},(_,i)=>P(BXs(2.5+hs(i,7)*3,.2,2+hs(i,8)*3,.05,1),'#4d3b2d',{p:[(hs(i,4)-.5)*20,4+hs(i,5)*14,-60-hs(i,6)*4],r:[(hs(i,9)-.5)*1.2,hs(i,10)*3,(hs(i,11)-.5)*1.2]})),
 ...rusticles(260,120,28,22,'#7a4420')]);
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
WR.af447.dg=()=>debris(55,80,34,['#8f969c','#7f868c','#767d83','#8a9096'],9500,(r,wx)=>Array.from({length:14},()=>{const lx=(r()-.5)*70,lz=(r()-.5)*50;return P(BXs(.5,.45,1.2,.1,1),'#5a6068',{p:[lx,base(wx)-floorAt(wx+lx,lz),lz],r:[0,r()*6,(r()-.5)*.4]})}));

WR.bismarck.g=()=>MG([
 P(CY(2.9,1.7,26,12),'#4d545c',{p:[0,16,-56],s:[1.4,1,1]}),P(CY(1.8,1.8,.9,12),'#33383e',{p:[0,42,-56],s:[1.4,1,1]}),P(new T.TorusGeometry(1.75,.15,6,16),'#33383e',{p:[0,42.9,-56],r:[Math.PI/2,0,0],s:[1.4,1,1]}),
 P(seg(V3([0,42,-36]),V3([0,64,-33]),.9,.35,6),'#4a5058'),P(seg(V3([-8,55,-34.5]),V3([8,55,-34.5]),.15,.15,5),'#3a4046'),P(seg(V3([0,18,40]),V3([0,44,42]),.7,.3,6),'#4a5058'),
 ...turret2(92,1),...turret2(66,1),...turret2(-76,-1),...turret2(-102,-1),
 ...[-1,1].flatMap(s=>[30,10,-12,-60,-84].map(z=>P(BXs(4,2.4,4.2,.9,3),'#50575f',{p:[s*9,16,z]}))),
 ...[-1,1].flatMap(s=>rowZ(-62,60,11,z=>AAm(s*7.5,20,z))),
 ...rowZ(-100,-18,2.6,z=>[-1,1].map(s=>porth(s,36,16,9.5,z))),
 ...[-1,1].flatMap(s=>rail(s*17.4,16,-118,-14,2.4)),
 P(BXs(1.6,.3,22,.1,1),'#3a4046',{p:[0,20.2,30]}),P(seg(V3([4,20,10]),V3([4,32,10]),.3,.2,6),'#3a4046'),P(seg(V3([4,32,10]),V3([-3,30,16]),.2,.12,5),'#3a4046'),
 ...rusticles(130,250,36,16,'#6a4224')]);
WR.bismarck.dg=()=>debris(31,110,90,['#4b525a','#3d444a','#555c64','#6a4224'],11300);

WR.roberts.g=()=>MG([
 P(CY(2.3,1.9,7,12),'#4a5058',{p:[0,8,-6],s:[1.3,1,1]}),P(CY(2.3,1.9,7,12),'#4a5058',{p:[0,8,-16],s:[1.3,1,1]}),P(seg(V3([0,17,7]),V3([0,30,6]),.45,.2,6),'#4a5058'),P(seg(V3([-3,26,6.5]),V3([3,26,6.5]),.1,.1,4),'#3a4046'),
 ...[30,-30,-38].flatMap(z=>[P(CY(1.7,1.5,1.3,10),'#50575f',{p:[0,8,z]}),P(BXs(2.2,2.2,3,.6,3),'#545b63',{p:[0,9.2,z]}),P(CZ(.22,.18,5,8),'#3a4046',{p:[0,10.4,z+(z>0?1:-1)*1.2],r:[0,z>0?0:Math.PI,0]})]),
 P(CZ(.55,.5,5,8),'#3d444a',{p:[2.2,9.5,-26]}),P(CZ(.55,.5,5,8),'#3d444a',{p:[-2.2,9.5,-26]}),
 ...rowZ(-40,-6,2.4,z=>[-1,1].map(s=>porth(s,11,8,4,z))),
 ...rowZ(2,10,1.4,z=>[-1,1].map(s=>win(s*3.52,9.6,z,.12,.9,.6))),
 ...rowZ(-44,-40,1,z=>P(CY(.25,.25,.7,8),'#3d444a',{p:[1,8,z-1]})),
 ...[-1,1].flatMap(s=>rail(s*5,8,-42,40,2)),
 ...rusticles(30,93,11,8,'#8a5a3a')]);
WR.roberts.dg=()=>debris(13,50,45,['#4a5058','#3d444a','#555c64','#6a4224'],15150);

const galeonRig=()=>{const out=[],Ls=[19,24,15],cw='#2a2018',cs='#8a7a5c';
 [-9,0,9].forEach((z,i)=>{const d=new T.Vector3(0,1,0).applyEuler(new T.Euler((i-1)*.45,0,(i-1)*.3)),L=Ls[i],pt=f=>new T.Vector3(0,7,z).addScaledVector(d,L*(f-.5)).toArray();
  [[.5,8],[.72,6.5],[.9,4.5]].forEach(([f,len],k)=>{const c=pt(f),tilt=(i-1)*.12+(k===1&&i===0?.35:0);
   out.push(P(seg(V3([c[0]-len/2,c[1]-Math.sin(tilt)*len/2,c[2]]),V3([c[0]+len/2,c[1]+Math.sin(tilt)*len/2-(k===2&&i!==1?.9:0),c[2]]),.22,.16,6),'#3a2a1c'))});
  if(i!==1){const c=pt(.5);out.push(P(BXs(6.2,3.4,.05,.02,1),cs,{p:[c[0],c[1]-1.8,c[2]],r:[0,0,(i-1)*.1]}));out.push(P(BXs(2.2,2.4,.05,.02,1),cs,{p:[c[0]+2.2,c[1]-3.4,c[2]+.1],r:[0,0,.25]}))}
  const m=pt(.62);[-1,1].forEach(sx=>[-1.6,1.6].forEach(dz=>out.push(P(seg(V3(m),V3([sx*(hullX(11,7,5)+.05),5,z+dz]),.06,.05,4),cw))))});
 out.push(P(seg(V3([0,9.5,13]),V3([0,12.8,22]),.3,.17,6),'#3a2a1c'));return out};
WR.galeon.g=()=>MG([
 ...galeonRig(),
 ...[-9,0,9].map((z,i)=>P(CY(.5,.3,[19,24,15][i],6),'#3a2a1c',{p:[0,7,z],r:[(i-1)*.45,0,(i-1)*.3]})),
 ...[-9,0,9].map((z,i)=>P(CY(.12,.12,7,5),'#3a2a1c',{p:[(i-1)*2,12+i*2,z],r:[0,0,Math.PI/2]})),
 ...rowZ(-12,12,2.1,z=>[-1,1].map(s=>P(BXs(.9,.8,.2,.1,1),'#14100c',{p:[s*(hullX(11,7,3.4)+.02),3.4,z]}))),
 ...Array.from({length:10},(_,i)=>P(CZ(.24,.2,1.7,6),'#2a2a28',{p:[(i%2?1:-1)*6.1,5,-10+Math.floor(i/2)*3.2],r:[0,(i%2?1:-1)*1.3,0]})),
 ...rowZ(-8,6,1.5,z=>P(new T.TorusGeometry(5,.13,6,14,Math.PI),'#3a2a1c',{p:[14,.2,z]}))]);
WR.galeon.dg=()=>debris(5,50,28,['#3a2a1c','#2a2a28','#4a3524','#6a5038'],3300,(r,wx)=>Array.from({length:7},()=>{const lx=(r()-.5)*40,lz=(r()-.5)*30;return P(CZ(.28,.22,2.6,7),'#25252a',{p:[lx,base(wx)-floorAt(wx+lx,lz)+.2,lz],r:[0,r()*6,0]})}).concat([P(seg(V3([20,.4,5]),V3([20,.4,9.5]),.16,.16,5),'#2a2a28'),P(seg(V3([18.5,.4,9.5]),V3([21.5,.4,9.5]),.14,.14,5),'#2a2a28')]));

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
