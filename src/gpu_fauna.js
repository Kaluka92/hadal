// ================= FAUNA GRANDE: cuerpos por secciones, aletas con espesor, colores por vértice =================
const FX=(()=>{
 const hx=h=>{const c=new T.Color(h);return[c.r,c.g,c.b]},mx3=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t];
 const st=(a,b,x)=>{const t=Math.min(Math.max((x-a)/(b-a),0),1);return t*t*(3-2*t)};
 const sg=Math.sign,pw=Math.pow,ab=Math.abs;
 const GF=(pos,col,ix)=>{const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('color',new T.Float32BufferAttribute(col,3));g.setIndex(ix);g.computeVertexNormals();
  const q=g.toNonIndexed();q.setAttribute('em',new T.BufferAttribute(new Float32Array(q.attributes.position.count),1));return q};
 // cuerpo: s=0 cola ... s=1 cabeza (z de -L/2 a +L/2); sec(s)->{w,ht,hb,p,yc}; colf(s,cosθ,sinθ,x,y)->[r,g,b]
 function loft(L,sec,colf,ns=72,na=32,off=[0,0,0]){const pos=[],col=[],ix=[];
  for(let i=0;i<=ns;i++){const s=i/ns,q=sec(s),z=-L/2+s*L;
   for(let j=0;j<=na;j++){const th=j/na*6.28318,c=Math.cos(th),sn=Math.sin(th),ex=2/(q.p||2.2),x=q.w*sg(c)*pw(ab(c),ex),hy=sn>0?q.ht:q.hb,y=(q.yc||0)+hy*sg(sn)*pw(ab(sn),ex);
    pos.push(x+off[0],y+off[1],z+off[2]);const k=colf(s,c,sn,x,y);col.push(k[0],k[1],k[2])}}
  for(let i=0;i<ns;i++)for(let j=0;j<na;j++){const a=i*(na+1)+j,b=a+1,c2=a+na+1,d=c2+1;ix.push(a,c2,b,b,c2,d)}
  for(const e of[0,1]){const s=e,q=sec(s),ci=pos.length/3;pos.push(off[0],(q.yc||0)+off[1],-L/2+s*L+off[2]);const k=colf(s,0,0,0,0);col.push(k[0],k[1],k[2]);
   const r0=(e?ns:0)*(na+1);for(let j=0;j<na;j++){if(e)ix.push(ci,r0+j,r0+j+1);else ix.push(ci,r0+j+1,r0+j)}}
  return GF(pos,col,ix)}
 // aleta: borde de ataque le(v) y de fuga te(v) (v=0 raíz, v=1 punta), espesor T con perfil de ala
 function fin(le,te,{T=.01,nrm=[0,1,0],nu=13,nv=11,c1,c2,tip=.6}={}){const pos=[],col=[],ix=[];
  for(const sd of[1,-1]){const b0=pos.length/3;
   for(let iv=0;iv<=nv;iv++){const v=iv/nv,A=le(v),B=te(v);
    for(let iu=0;iu<=nu;iu++){const u=iu/nu,th=T*pw(Math.max(1-v,0),tip)*pw(4*u*(1-u),.6);
     pos.push(A[0]+(B[0]-A[0])*u+nrm[0]*sd*th,A[1]+(B[1]-A[1])*u+nrm[1]*sd*th,A[2]+(B[2]-A[2])*u+nrm[2]*sd*th);
     const k0=mx3(c1,c2,Math.min(1,u*.5+v*.6)),ry=.9+.1*Math.cos(iu*2.2)*(.4+.6*v),k=[k0[0]*ry,k0[1]*ry,k0[2]*ry];col.push(k[0],k[1],k[2])}}
   for(let iv=0;iv<nv;iv++)for(let iu=0;iu<nu;iu++){const a=b0+iv*(nu+1)+iu,b=a+1,c=a+nu+1,d=c+1;ix.push(a,c,b,b,c,d)}}
  return GF(pos,col,ix)}
 const ry=(sec,z,sd,k=.92)=>{const q=sec(Math.min(Math.max(z+.5,0),1));return sd>0?(q.yc||0)+q.ht*k:(q.yc||0)-q.hb*k};
 const eye=(x,y,z,r=.016)=>[P(S_(r,8,6),'#06080a',{p:[x,y,z]}),P(S_(r*.45,5,4),'#9db0c0',{p:[x+Math.sign(x)*r*.55,y+r*.3,z+r*.35]})];
 return{hx,mx3,st,loft,fin,eye,GF,ry}})();
const{hx:HX,mx3:MX3,st:ST,loft:LOFT,fin:FIN,eye:EYE,ry:RY}=FX;
const SPN=n=>SPS.find(s=>s.n===n);

// ---------- ATÚN ROJO ----------
SPN('Atún rojo').g=()=>{const tf=u=>Math.pow(Math.sin(Math.PI*Math.pow(u,.62)),.8)*(1-.15*u);
 const sec=s=>{const f=Math.max(tf(1-s),.004);return{w:.105*f,ht:.14*f,hb:.12*f,p:2.2,yc:.005}};
 const top=HX('#15233b'),mid=HX('#8496ab'),bel=HX('#d6dadd'),dk=HX('#1a1f26');
 const colf=(s,c,sn)=>{let k=MX3(MX3(bel,mid,ST(-.5,-.1,sn)),top,ST(.1,.55,sn));if(s>.9&&sn<-.2&&sn>-.5)k=MX3(k,dk,.8);return k};
 const fd=HX('#1f3452'),fy=HX('#d6bf45'),tl=HX('#1b2d49'),gs=[LOFT(1,sec,colf,80,32)];
 const lobe=sd=>FIN(v=>[0,sd*.17*v,-.5-.145*Math.pow(v,1.3)],v=>[0,sd*.17*v,-.5-.18*Math.pow(v,1.3)-.05*(1-.8*v)],{T:.006,nrm:[1,0,0],c1:tl,c2:fd,tip:.4});
 gs.push(lobe(1),lobe(-1));
 for(const sd of[-1,1])gs.push(FIN(v=>[sd*(.09+.13*v),-.035-.02*v,.3-.06*v],v=>[sd*(.09+.13*v),-.035-.035*v,.3-.075-.07*v],{T:.005,c1:fd,c2:HX('#3a5878')}));
 for(const sd of[-1,1])gs.push(FIN(v=>[sd*(.03+.04*v),-.12-.03*v,.2-.04*v],v=>[sd*(.03+.04*v),-.12-.04*v,.2-.08*v],{T:.004,nv:4,c1:fd,c2:fd}));
 {const y=RY(sec,.08,1,.85);gs.push(FIN(v=>[0,y+.09*v,.15-.08*v],v=>[0,y+.09*v,.01+.04*v],{T:.004,nrm:[1,0,0],c1:fd,c2:HX('#2b4468')}))}
 {const y=RY(sec,-.16,1,.85),yb=RY(sec,-.16,-1,.85);gs.push(FIN(v=>[0,y+.05*v,-.13-.02*v],v=>[0,y+.05*v,-.2-.01*v],{T:.003,nrm:[1,0,0],nv:6,c1:fd,c2:fd}),FIN(v=>[0,yb-.05*v,-.13-.02*v],v=>[0,yb-.05*v,-.2-.01*v],{T:.003,nrm:[1,0,0],nv:6,c1:fd,c2:fd}))}
 for(let i=0;i<8;i++){const z=-.24-i*.028,h=.014+.004*Math.sin(i/7*3),yt=RY(sec,z,1,.85),yb=RY(sec,z,-1,.85);gs.push(P(finV([[z,yt],[z-.022,yt+h*1.6],[z-.03,yt]]),'#d6bf45'),P(finV([[z,yb],[z-.022,yb-h*1.6],[z-.03,yb]]),'#d6bf45'))}
 gs.push(...EYE(.062,.025,.41,.018),...EYE(-.062,.025,.41,.018));return MG(gs)};
SPN('Atún rojo').pat=0;

// ---------- TIBURÓN (blanco, duende, de Groenlandia) ----------
function sharkG(o){const W=o.W,Hh=o.H,sn=o.snout||0,thick=o.thick||1;
 const tf=u=>Math.pow(Math.sin(Math.PI*Math.pow(u,o.head||.62)),.85)*(1-.28*u);
 const sec=s=>{const f=Math.max(tf(1-s),.004);let hb=Hh*.95*f;if(sn&&s>.8)hb*=1-sn*.7*ST(.8,1,s);return{w:W*f,ht:Hh*f*1.05,hb,p:2.2,yc:0}};
 const top=HX(o.top),bel=HX(o.bel),dk=HX('#0c0e10');
 const colf=(s,c,y)=>{let k=MX3(bel,top,ST(o.line-.07,o.line+.07,y));if(s>.74&&s<.84&&y>-.35&&y<.65&&Math.abs(Math.sin((s-.74)*210))>.88)k=MX3(k,dk,.75);if(s>.93&&y<-.1&&y>-.55)k=MX3(k,dk,.5);return k};
 const gs=[LOFT(1,sec,colf,90,32)];const fc=HX(o.fin),f2=MX3(HX(o.fin),HX(o.bel),.35);
 const asym=o.asym||1;
 gs.push(FIN(v=>[0,.15*asym*v+.0,-.5-.05*Math.pow(v,1.2)],v=>[0,.15*asym*v,-.5-.13*Math.pow(v,1.15)-.06*(1-.6*v)],{T:.008,nrm:[1,0,0],c1:fc,c2:f2,tip:.5}));
 gs.push(FIN(v=>[0,-.1*v,-.5-.03*v],v=>[0,-.1*v,-.5-.09*v-.05*(1-.5*v)],{T:.006,nrm:[1,0,0],c1:fc,c2:f2,tip:.5}));
 const dh=o.dh,yd=RY(sec,.04,1,.85);gs.push(FIN(v=>[0,yd+dh*v,.12-.12*v],v=>[0,yd+dh*v,-.1+.06*v],{T:.01,nrm:[1,0,0],nv:10,c1:fc,c2:f2,tip:.5}));
 {const y2=RY(sec,-.27,1,.85),y3=RY(sec,-.31,-1,.85);gs.push(FIN(v=>[0,y2+.035*v,-.24],v=>[0,y2+.035*v,-.31],{T:.004,nrm:[1,0,0],nv:4,c1:fc,c2:fc}),FIN(v=>[0,y3-.035*v,-.28],v=>[0,y3-.035*v,-.34],{T:.004,nrm:[1,0,0],nv:4,c1:fc,c2:fc}))}
 for(const sd of[-1,1]){gs.push(FIN(v=>[sd*(W*.7+o.pec*v),-Hh*.55-.05*v,.24-.03*v],v=>[sd*(W*.7+o.pec*v),-Hh*.55-.09*v,.24-.1-.11*v],{T:.008,c1:fc,c2:HX(o.bel),tip:.5}));
  gs.push(FIN(v=>[sd*(W*.4+.045*v),-Hh*.6-.01*v,-.08],v=>[sd*(W*.4+.045*v),-Hh*.6-.03*v,-.14],{T:.004,nv:4,c1:fc,c2:fc}))}
 gs.push(...EYE(W*.62,Hh*.18,.405,o.eye||.014),...EYE(-W*.62,Hh*.18,.405,o.eye||.014));
 if(o.teeth){const my=-Hh*.5,tc='#efeadb';
  for(let i=-8;i<=8;i++){const a=i/8,x=a*W*.8,z=.455-.045*a*a;gs.push(P(CO(.0038,.011+.004*(1-Math.abs(a)),4),tc,{p:[x,my+.004,z],r:[Math.PI,0,0]}),P(CO(.0034,.009+.003*(1-Math.abs(a)),4),tc,{p:[x*.92,my-.016,z-.012]}))}
  gs.push(P(S_(1,8,6),'#2a1416',{p:[0,my-.004,.43],s:[W*.72,.004,.03]}));
  for(const sd of[-1,1])gs.push(P(S_(.0035,5,4),'#14181c',{p:[sd*W*.28,Hh*.1,.49]}))}
 return MG(gs)}
SPN('Tiburón blanco').g=()=>sharkG({W:.075,H:.08,top:'#6d7985',bel:'#eceeef',line:-.12,fin:'#5d6873',dh:.15,pec:.19,asym:1.05,head:.7,eye:.012,teeth:1});
SPN('Tiburón blanco').pat=0;
SPN('Tiburón duende').g=()=>sharkG({W:.045,H:.05,top:'#e0a8a8',bel:'#f0d4d0',line:-.2,fin:'#d49494',dh:.07,pec:.09,asym:.8,snout:1,head:.62,eye:.009});
SPN('Tiburón duende').pat=0;
SPN('Tiburón de Groenlandia').g=()=>sharkG({W:.095,H:.09,top:'#4a4f57',bel:'#6a6f76',line:-.5,fin:'#43484f',dh:.06,pec:.09,asym:.9,head:.55,eye:.006});
SPN('Tiburón de Groenlandia').pat=0;

// ---------- BALLENAS ----------
function whaleG(o){const tf=u=>Math.pow(Math.sin(Math.PI*Math.pow(u,o.hp)),.85)*(1-o.tp*u);
 const sec=s=>{const u=1-s,f=Math.max(tf(u),.004);let ht=o.H*f,hb=o.H*.92*f,w=o.W*f,p=o.p;if(o.sperm){const h=ST(.6,.9,s);ht=o.H*f*(1+.35*h);hb=o.H*f*(.92-.55*ST(.7,1,s));p=2.2+1.6*h}
  if(o.hump&&u>.7){const k=Math.max(Math.sin((u-.7)/.3*3.14159)*0,0)}return{w,ht,hb,p,yc:0}};
 const top=HX(o.top),bel=HX(o.bel),mid=HX(o.mid||o.top),dk=HX('#0a0d10');
 const colf=(s,c,y)=>{let k=MX3(bel,top,ST(o.line-.12,o.line+.12,y));if(o.pleats&&s>.5&&y<-.15)k=MX3(k,bel,.5*(.5+.5*Math.cos(Math.atan2(c,-y)*22)));
  if(o.sperm){k=MX3(k,mid,.35*(.5+.5*Math.sin(s*140+y*9)))}
  if(s>.94&&y<.1&&y>-.45)k=MX3(k,dk,.55);
  if(o.pleats&&s>.62){const my=-.4+.22*ST(.7,.97,s),m=Math.abs(y-my);k=MX3(k,dk,.75*(1-ST(.015,.05,m))*ST(.62,.7,s))}return k};
 const gs=[LOFT(1,sec,colf,110,40)];const fc=HX(o.fin),fw=HX(o.finw||o.fin);
 // flukes
 for(const sd of[-1,1])gs.push(FIN(v=>[sd*(.012+o.fk*v),0,-.5-.0*v],v=>[sd*(.012+o.fk*v),0,-.5-.07*(1-.3*v)-.1*v-(o.notch?0:.02)],{T:.012,nrm:[0,1,0],nv:12,c1:fc,c2:fw,tip:.45}));
 // flippers
 for(const sd of[-1,1])gs.push(FIN(v=>[sd*(o.W*.85+o.fl*v),-o.H*.55-.04*v,o.fz],v=>[sd*(o.W*.85+o.fl*v),-o.H*.55-.1*v,o.fz-o.fc*(1-.6*v)],{T:.012,nv:12,c1:fc,c2:fw,tip:.5}));
 // aleta dorsal
 {const yd=RY(sec,o.dz,1,.9);gs.push(FIN(v=>[0,yd+o.dh*v,o.dz],v=>[0,yd+o.dh*v,o.dz-.05+.03*v],{T:.008,nrm:[1,0,0],nv:6,c1:fc,c2:fc}))}
 gs.push(...EYE(o.W*.9,o.H*.05,o.ez,o.er),...EYE(-o.W*.9,o.H*.05,o.ez,o.er));
 if(o.knobs)for(let i=0;i<14;i++){const s=.8+.19*i/13;gs.push(P(S_(.008,5,4),'#5a6674',{p:[(i%2?.5:-.5)*o.W*.15,o.H*.98*Math.sin(Math.PI*Math.pow(1-s,o.hp))*1.0,-.5+s]}))}
 if(o.sperm)gs.push(LOFT(.36,s=>({w:.012*(1-.3*s)+.004,ht:.012,hb:.012,p:2.2,yc:-.065}),()=>HX('#c9cdd0'),12,12,[0,0,.33]));
 return MG(gs)}
SPN('Ballena jorobada').g=()=>whaleG({H:.1,W:.1,p:2.2,hp:.7,tp:.22,top:'#27323e',bel:'#d4dadc',line:-.25,pleats:1,fin:'#3a4651',finw:'#cfd5d8',fk:.2,fl:.26,fz:.2,fc:.07,dh:.025,dz:-.25,ez:.4,er:.008,knobs:1,notch:1});
SPN('Ballena jorobada').pat=0;
SPN('Cachalote').g=()=>whaleG({H:.115,W:.1,p:2.2,hp:.5,tp:.3,top:'#4d555e',bel:'#6b737b',mid:'#3a4148',line:-.5,sperm:1,fin:'#444c54',fk:.12,fl:.07,fz:.18,fc:.04,dh:.02,dz:-.3,ez:.31,er:.007,notch:1});
SPN('Cachalote').pat=0;
SPN('Delfín mular').g=()=>whaleG({H:.1,W:.09,p:2.2,hp:.55,tp:.3,top:'#6a7783',bel:'#d4d9dc',line:-.1,fin:'#55616c',fk:.14,fl:.2,fz:.2,fc:.07,dh:.03,dz:-.2,ez:.42,er:.012,notch:1});
SPN('Delfín mular').pat=0;

// ---------- MANTA RAYA ----------
SPN('Manta raya').g=()=>{const NX=44,NZ=22,pos=[],col=[],ix=[],ct=HX('#1d2831'),cw=HX('#dfe4e6'),cb=HX('#e6eaec'),cd=HX('#3a4650');
 const zf=a=>.33-.1*a-.26*Math.pow(a,2.5),zb=a=>-.3+.2*a+.06*Math.pow(a,3);
 for(const side of[1,-1]){const b0=pos.length/3;
  for(let i=0;i<=NX;i++){const xx=-1+2*i/NX,a=Math.abs(xx);
   for(let j=0;j<=NZ;j++){const w=j/NZ,z=zf(a)+(zb(a)-zf(a))*w,x=xx*.92,body=Math.max(1-a/.28,0),T=.1*Math.pow(Math.max(1-Math.pow(a,1.25),0),.9)*Math.pow(4*w*(1-w),.55)+.05*body*Math.pow(4*w*(1-w),.5)+.002,y=side>0?T*.62:-T*.42;
    pos.push(x,y,z);let k;if(side>0){k=MX3(ct,cd,.3*Math.sin(a*9));const sh=ST(.12,.2,a)*(1-ST(.42,.5,a))*ST(.45,.55,w)*(1-ST(.75,.85,w));k=MX3(k,cw,sh*.95)}else{k=cb;if(w<.3&&a<.2)k=MX3(k,cd,.7*ST(.3,.15,w));if(a>.05&&a<.4&&Math.abs(w-.45)<.25&&Math.sin(a*60)>.6)k=MX3(k,cd,.5)}
    col.push(k[0],k[1],k[2])}}
  for(let i=0;i<NX;i++)for(let j=0;j<NZ;j++){const a=b0+i*(NZ+1)+j,b=a+1,c=a+NZ+1,d=c+1;if(side>0)ix.push(a,c,b,b,c,d);else ix.push(a,b,c,b,d,c)}}
 const gs=[FX.GF(pos,col,ix)];
 for(const sd of[-1,1])gs.push(FIN(v=>[sd*(.12+.06*v),.0,.34+.2*v],v=>[sd*(.12+.02*v),.0,.28+.08*v],{T:.012,nv:8,c1:ct,c2:cd,tip:.6}));
 gs.push(seg(V3([0,0,-.3]),V3([0,.0,-1.05]),.018,.004,6),...EYE(.17,.03,.3,.014),...EYE(-.17,.03,.3,.014));
 return MG(gs.map(g=>g.attributes.color?g:P(g,'#1d2831')))};
SPN('Manta raya').pat=0;

// ---------- TORTUGA VERDE ----------
SPN('Tortuga verde').g=()=>{const NA=72,NR=24,pos=[],col=[],ix=[],sc=HX('#34361a'),sd=HX('#0d0f07'),pl=HX('#a89c6c'),sk=HX('#4a5428'),am=HX('#5e5426');
 const Rx=.5,Rz=.64,gr=(r,a)=>{const g1=Math.abs(Math.sin(r*8.2+Math.sin(a*5)*.35)),g2=Math.abs(Math.sin(a*6.5+r*2.2));return Math.min(g1,g2)};
 for(const side of[1,-1]){const b0=pos.length/3;
  for(let i=0;i<=NR;i++){const r=i/NR;
   for(let j=0;j<=NA;j++){const a=j/NA*6.28318,c=Math.cos(a),n=Math.sin(a),sh=1+.12*Math.max(-n,0)*(1-.3*Math.abs(c)),x=Rx*r*c*(1+.05*n),z=Rz*r*n*sh,dome=Math.pow(Math.max(1-r*r,0),.5);
    const gd=gr(r,a),pl_=ST(.04,.32,gd);
    let y=side>0?.2*dome+.026*Math.exp(-Math.pow(x/.07,2))*dome+.016*pl_*dome+.01*ST(.86,.99,r)*(1-ST(.99,1,r)):-.05*dome-.01;if(r>.97&&side<0)y=.0;
    if(side>0&&r>.94)y-=.012*(r-.94)/.06;
    pos.push(x,y,z);let k;if(side>0){k=MX3(sc,sd,.6*(1-pl_)+.16*Math.sin(a*13)*Math.sin(r*7));k=MX3(k,am,.35*pl_*(.5+.5*Math.sin(r*21+a*3)));if(r>.93)k=MX3(k,HX('#8a8250'),.55)}else{k=MX3(pl,HX('#cdbf8a'),.4*r);if(gd<.08)k=MX3(k,HX('#6a6038'),.5)}
    col.push(k[0],k[1],k[2])}}
  for(let i=0;i<NR;i++)for(let j=0;j<NA;j++){const a=b0+i*(NA+1)+j,b=a+1,c=a+NA+1,d=c+1;if(side>0)ix.push(a,b,c,b,d,c);else ix.push(a,c,b,b,c,d)}}
 const gs=[FX.GF(pos,col,ix)];
 // cuello y cabeza con pico
 gs.push(LOFT(.34,s=>{const u=1-s,f=Math.max(Math.sin(Math.PI*Math.pow(u,.62)),.012)*.92+.1*(1-u)-.02*s;return{w:.075*f+.01*(1-u),ht:.07*f+.008,hb:.06*f+.006,p:2.2,yc:0}},(s,c,y)=>{const k=MX3(sk,pl,ST(-.15,-.8,y));return MX3(k,HX('#3a3f1c'),.45*ST(.05,.7,y)*(.5+.5*Math.sin(c*14)))},28,24,[0,.035,.74]));
 gs.push(P(CO(.034,.07,8),'#a6965a',{p:[0,.03,1.08],r:[Math.PI/2+.06,0,0],s:[1.15,1,.8]}));
 for(const sd of[-1,1]){gs.push(P(S_(.02,8,6),'#0a0c06',{p:[sd*.072,.065,.97],s:[1,1,1]}),P(new T.TorusGeometry(.021,.006,5,12),'#6a7040',{p:[sd*.074,.065,.97],r:[0,Math.PI/2,0]}),P(S_(.006,4,3),'#10120a',{p:[sd*.018,.05,1.1]}))}
 // aletas delanteras: remo curvo, borde de ataque grueso, uña
 for(const sd2 of[-1,1]){
  const zc=v=>.3-.5*v-.1*v*v,ch=v=>.07+.3*Math.pow(Math.sin(Math.PI*(.12+.62*v)),.8)*(1-.55*v*v),xx=v=>sd2*(.34+.82*v),yy=v=>-.02-.09*v*v+.03*Math.sin(v*3);
  gs.push(FIN(v=>[xx(v),yy(v),zc(v)+ch(v)*.4],v=>[xx(v),yy(v)-.012*v,zc(v)-ch(v)*.6],{T:.034,nv:18,c1:HX('#46502a'),c2:HX('#7a7a46'),tip:.35}));
  gs.push(P(CO(.012,.045,5),'#d4ccA0',{p:[xx(1),yy(1),zc(1)+.02],r:[Math.PI/2+.2,0,sd2*-.6]}));
  const zr=v=>-.46-.2*v,cr=v=>.06+.16*Math.sin(Math.PI*(.15+.6*v));
  gs.push(FIN(v=>[sd2*(.2+.3*v),-.016,zr(v)+cr(v)*.4],v=>[sd2*(.2+.3*v),-.016,zr(v)-cr(v)*.6],{T:.02,nv:10,c1:HX('#3a4224'),c2:HX('#5a5e34'),tip:.35}))}
 gs.push(seg(V3([0,-.01,-.62]),V3([0,-.03,-.84]),.04,.008,6));
 return MG(gs.map(g=>g.attributes.color?g:P(g,'#7a7f4c')))};
SPN('Tortuga verde').pat=0;

// ---------- PEZ LUNA ----------
SPN('Pez luna').g=()=>{const sec=s=>{const u=2*s-1,f=Math.sqrt(Math.max(1-Math.pow(u*1.0,2),0));const e=s<.18?.5+.5*ST(0,.18,s):1;return{w:.075*f*(.5+.5*f),ht:.43*Math.pow(f,.85)*e,hb:.4*Math.pow(f,.85)*e,p:2.0,yc:0}};
 const top=HX('#7e8b96'),bel=HX('#c9d1d6');const colf=(s,c,y)=>MX3(MX3(bel,top,ST(-.5,.4,y)),HX('#59626b'),.25*(.5+.5*Math.sin(s*60+y*20)));
 const gs=[LOFT(.8,sec,colf,60,32)];const fc=HX('#6d7983'),f2=HX('#8a96a0');
 gs.push(FIN(v=>[0,.34+.36*v,-.22-.1*v],v=>[0,.32+.36*v,-.4+.1*v],{T:.012,nrm:[1,0,0],nv:10,c1:fc,c2:f2,tip:.5}));
 gs.push(FIN(v=>[0,-.32-.36*v,-.22-.1*v],v=>[0,-.3-.36*v,-.4+.1*v],{T:.012,nrm:[1,0,0],nv:10,c1:fc,c2:f2,tip:.5}));
 gs.push(P(finV(Array.from({length:13},(_,i)=>{const t=-Math.PI/2+i*Math.PI/12;return[-.36-.14*Math.sin(t+Math.PI/2)*0-.14*Math.cos(t)*0-.14*Math.max(Math.cos(t),0)-.0,.3*Math.sin(t)]})),'#8a96a0'));
 for(const sd of[-1,1])gs.push(FIN(v=>[sd*(.07+.1*v),-.02,.12],v=>[sd*(.07+.1*v),-.02,.08-.04*v],{T:.008,nv:5,c1:fc,c2:f2}));
 gs.push(P(S_(.03,8,6),'#e3dcc8',{p:[0,-.04,.43],s:[.5,.7,.5]}),...EYE(.05,.08,.38,.02),...EYE(-.05,.08,.38,.02));
 return MG(gs)};
SPN('Pez luna').pat=0;

// ---------- PECES GENÉRICOS (reemplaza el constructor viejo: lo usan sardina, linterna, hacha, víbora, granadero, pelícano, caracol...) ----------
var FISHLO=false;
function fishG(c1,c2,o={}){const R=o.R||.1,tl=o.tl||.2,lt=o.lt||.5;
 const tf=u=>Math.pow(Math.sin(Math.PI*Math.pow(u,.62)),.8)*(1-.15*u);
 const sec=s=>{const f=Math.max(tf(1-s),.004);return{w:R*lt*f,ht:R*f*1.05,hb:R*f*.95,p:2.2,yc:0}};
 const A=HX(c1),Bc=HX(c2),belly=MX3(A,[1,1,1],.5),dk=MX3(A,[0,0,0],.3);
 const colf=(s,c,y)=>MX3(MX3(belly,A,ST(-.55,.05,y)),dk,ST(.35,.9,y));
 const lo=FISHLO,gs=[LOFT(1,sec,colf,lo?14:48,lo?7:20)],tw=tl*.9,fo={T:.004,nrm:[1,0,0],nu:lo?2:8,nv:lo?3:7,c1:Bc,c2:Bc};
 for(const sd of[-1,1])gs.push(FIN(v=>[0,sd*tw*v,-.5-.02*v-.22*tl*v*v],v=>[0,sd*tw*v,-.5-tl*(o.fork?(.28+.9*Math.pow(v,1.5)):(1-.45*v*v))],{...fo,nu:lo?2:10,nv:lo?3:9}));
 if(o.dor!==0){const h=o.dor||.12,y=RY(sec,0,1,.85);gs.push(FIN(v=>[0,y+h*v,.12-.08*v],v=>[0,y+h*v,-.12+.06*v],{...fo,nv:lo?1:3}));
  if(!lo){const yb=RY(sec,-.25,-1,.85);gs.push(FIN(v=>[0,yb-h*.6*v,-.15],v=>[0,yb-h*.6*v,-.3+.05*v],{...fo,nv:3}))}}
 for(const sd of[-1,1]){if(!lo){gs.push(FIN(v=>[sd*(R*lt*.5+.04*v),-R*.8-.02*v,.1],v=>[sd*(R*lt*.5+.04*v),-R*.8-.03*v,.0-.03*v],{T:.003,nu:3,nv:2,c1:Bc,c2:Bc}));
   gs.push(FIN(v=>[sd*(R*lt*.85+.08*v),-R*.3-.03*v,.22],v=>[sd*(R*lt*.85+.08*v),-R*.3-.05*v,.12-.04*v],{T:.003,nu:3,nv:2,c1:Bc,c2:Bc}));
   gs.push(...EYE(sd*R*lt*.85,R*.25,.36,Math.max(R*.22,.012)))}
  else gs.push(P(S_(Math.max(R*.2,.01),4,3),'#06080a',{p:[sd*R*lt*.85,R*.25,.36]}))}
 if(o.glow)for(let i=0;i<(lo?3:5);i++)gs.push(P(S_(.014,lo?4:5,lo?3:4),o.glow,{p:[0,-R*.75,.32-i*.1],e:1}));
 if(o.extra)gs.push(...o.extra);return MG(gs)}

// ================= DETALLE x6: cada triángulo -> 6 (3 esquinas + centro dividido en 3), con relieve de superficie =================
const h3=(x,y,z)=>{const h=Math.sin(x*127.1+y*311.7+z*74.7)*43758.5453;return h-Math.floor(h)};
const vn3=(x,y,z)=>{const xi=Math.floor(x),yi=Math.floor(y),zi=Math.floor(z),xf=x-xi,yf=y-yi,zf=z-zi,u=xf*xf*(3-2*xf),v=yf*yf*(3-2*yf),w=zf*zf*(3-2*zf),L=(a,b,t)=>a+(b-a)*t;
 return L(L(L(h3(xi,yi,zi),h3(xi+1,yi,zi),u),L(h3(xi,yi+1,zi),h3(xi+1,yi+1,zi),u),v),L(L(h3(xi,yi,zi+1),h3(xi+1,yi,zi+1),u),L(h3(xi,yi+1,zi+1),h3(xi+1,yi+1,zi+1),u),v),w)};
function richer(g,amp=.1){if(g.index)g=g.toNonIndexed();const Pp=g.attributes.position,Nn=g.attributes.normal,Cc=g.attributes.color,Ee=g.attributes.em,nt=Pp.count/3;
 const pos=new Float32Array(nt*18*3),nrm=new Float32Array(nt*18*3),col=new Float32Array(nt*18*3),em=new Float32Array(nt*18);let o=0;
 const V=(p,n,c,e,disp,sc)=>{let x=p[0],y=p[1],z=p[2];if(disp){const d=amp*sc*(vn3(x/sc*1.3,y/sc*1.3,z/sc*1.3)-.5)*2;x+=n[0]*d;y+=n[1]*d;z+=n[2]*d}
  const k=disp?1+.18*(vn3(x/sc*2.7+9,y/sc*2.7,z/sc*2.7)-.5):1;pos[o*3]=x;pos[o*3+1]=y;pos[o*3+2]=z;nrm[o*3]=n[0];nrm[o*3+1]=n[1];nrm[o*3+2]=n[2];col[o*3]=c[0]*k;col[o*3+1]=c[1]*k;col[o*3+2]=c[2]*k;em[o]=e;o++};
 const mid=(a,b)=>[(a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2],nm=(a,b,c)=>{const x=a[0]+b[0]+(c?c[0]:0),y=a[1]+b[1]+(c?c[1]:0),z=a[2]+b[2]+(c?c[2]:0),l=Math.hypot(x,y,z)||1;return[x/l,y/l,z/l]},cm=(a,b)=>[(a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2];
 for(let t=0;t<nt;t++){const P3=[],N3=[],C3=[];for(let k=0;k<3;k++){const i=t*3+k;P3.push([Pp.getX(i),Pp.getY(i),Pp.getZ(i)]);N3.push([Nn.getX(i),Nn.getY(i),Nn.getZ(i)]);C3.push([Cc.getX(i),Cc.getY(i),Cc.getZ(i)])}
  const e0=Ee.getX(t*3),[a,b,c]=P3,[na,nb,nc]=N3,[ca,cb,cc]=C3;
  const ab=mid(a,b),bc=mid(b,c),ca2=mid(c,a),ct=[(a[0]+b[0]+c[0])/3,(a[1]+b[1]+c[1])/3,(a[2]+b[2]+c[2])/3];
  const nab=nm(na,nb),nbc=nm(nb,nc),nca=nm(nc,na),nct=nm(na,nb,nc),cab=cm(ca,cb),cbc=cm(cb,cc),cca=cm(cc,ca),cct=[(ca[0]+cb[0]+cc[0])/3,(ca[1]+cb[1]+cc[1])/3,(ca[2]+cb[2]+cc[2])/3];
  const sc=Math.max((Math.hypot(a[0]-b[0],a[1]-b[1],a[2]-b[2])+Math.hypot(b[0]-c[0],b[1]-c[1],b[2]-c[2]))/2,1e-4);
  const tri=(p1,n1,c1,d1,p2,n2,c2,d2,p3,n3,c3,d3)=>{V(p1,n1,c1,e0,d1,sc);V(p2,n2,c2,e0,d2,sc);V(p3,n3,c3,e0,d3,sc)};
  tri(a,na,ca,0,ab,nab,cab,1,ca2,nca,cca,1);tri(b,nb,cb,0,bc,nbc,cbc,1,ab,nab,cab,1);tri(c,nc,cc,0,ca2,nca,cca,1,bc,nbc,cbc,1);
  tri(ab,nab,cab,1,bc,nbc,cbc,1,ct,nct,cct,1);tri(bc,nbc,cbc,1,ca2,nca,cca,1,ct,nct,cct,1);tri(ca2,nca,cca,1,ab,nab,cab,1,ct,nct,cct,1)}
 const q=new T.BufferGeometry();q.setAttribute('position',new T.BufferAttribute(pos,3));q.setAttribute('normal',new T.BufferAttribute(nrm,3));q.setAttribute('color',new T.BufferAttribute(col,3));q.setAttribute('em',new T.BufferAttribute(em,1));return q}


// ================= SIMPLIFICACIÓN POR AGRUPAMIENTO DE VÉRTICES (versión lejana, ~25 % de triángulos) =================
function simplify(g,ratio=.25){if(g.index)g=g.toNonIndexed();const Pp=g.attributes.position,Nn=g.attributes.normal,Cc=g.attributes.color,Ee=g.attributes.em,n=Pp.count,nt=n/3;
 let mnx=1e9,mny=1e9,mnz=1e9,mxx=-1e9,mxy=-1e9,mxz=-1e9;for(let i=0;i<n;i++){const x=Pp.getX(i),y=Pp.getY(i),z=Pp.getZ(i);mnx=Math.min(mnx,x);mxx=Math.max(mxx,x);mny=Math.min(mny,y);mxy=Math.max(mxy,y);mnz=Math.min(mnz,z);mxz=Math.max(mxz,z)}
 let cell=Math.max(mxx-mnx,mxy-mny,mxz-mnz,1e-3)/40,res=null;
 for(let it=0;it<8;it++){const M=new Map(),keys=new Array(n);
  for(let i=0;i<n;i++){const k=Math.floor((Pp.getX(i)-mnx)/cell)+','+Math.floor((Pp.getY(i)-mny)/cell)+','+Math.floor((Pp.getZ(i)-mnz)/cell);keys[i]=k;let c=M.get(k);if(!c){c={x:0,y:0,z:0,nx:0,ny:0,nz:0,r:0,g:0,b:0,e:0,c:0};M.set(k,c)}
   c.x+=Pp.getX(i);c.y+=Pp.getY(i);c.z+=Pp.getZ(i);c.nx+=Nn.getX(i);c.ny+=Nn.getY(i);c.nz+=Nn.getZ(i);c.r+=Cc.getX(i);c.g+=Cc.getY(i);c.b+=Cc.getZ(i);c.e+=Ee.getX(i);c.c++}
  const tris=[];for(let t=0;t<nt;t++){const a=keys[t*3],b=keys[t*3+1],c=keys[t*3+2];if(a===b||b===c||a===c)continue;tris.push(a,b,c)}
  res={M,tris};if(tris.length/3<=ratio*nt)break;cell*=1.4}
 const {M,tris}=res,m=tris.length,pos=new Float32Array(m*3),nrm=new Float32Array(m*3),col=new Float32Array(m*3),em=new Float32Array(m);
 for(let i=0;i<m;i++){const c=M.get(tris[i]),k=1/c.c,l=Math.hypot(c.nx,c.ny,c.nz)||1;pos[i*3]=c.x*k;pos[i*3+1]=c.y*k;pos[i*3+2]=c.z*k;nrm[i*3]=c.nx/l;nrm[i*3+1]=c.ny/l;nrm[i*3+2]=c.nz/l;col[i*3]=c.r*k;col[i*3+1]=c.g*k;col[i*3+2]=c.b*k;em[i]=c.e*k}
 const q=new T.BufferGeometry();q.setAttribute('position',new T.BufferAttribute(pos,3));q.setAttribute('normal',new T.BufferAttribute(nrm,3));q.setAttribute('color',new T.BufferAttribute(col,3));q.setAttribute('em',new T.BufferAttribute(em,1));return q}

// ================= FLORA Y BENTOS: versiones cercanas modeladas (se usan dentro del radio de detalle) =================
function ribbon(L,W,bend,nu,nv,c0,c1,o={}){const pos=[],col=[],ix=[];
 for(let i=0;i<=nu;i++){const u=i/nu,x=bend*L*u*u,y=L*u*(1-.3*bend*u),w=W*(o.wf?o.wf(u):1);
  for(let j=0;j<=nv;j++){const v=j/nv*2-1,k=MX3(c0,c1,Math.min(1,u*(o.cg||1))),sh=1-.1*Math.abs(v);pos.push(x,y,v*w);col.push(k[0]*sh,k[1]*sh,k[2]*sh)}}
 for(let i=0;i<nu;i++)for(let j=0;j<nv;j++){const a=i*(nv+1)+j,b=a+1,c=a+nv+1,d=c+1;ix.push(a,c,b,b,c,d)}
 return FX.GF(pos,col,ix)}
function leafH(L,W,lift,nu,nv,c0,c1){const pos=[],col=[],ix=[];
 for(let i=0;i<=nu;i++){const u=i/nu,w=W*Math.pow(Math.sin(Math.PI*Math.pow(u,.7)),.8)*(1+.1*Math.sin(u*16));
  for(let j=0;j<=nv;j++){const v=j/nv*2-1,k=MX3(c0,c1,u),sh=1-.12*Math.abs(v);pos.push(L*u,lift*u*u+.005*Math.sin(u*13+v*2)*w*8,v*w);col.push(k[0]*sh,k[1]*sh,k[2]*sh)}}
 for(let i=0;i<nu;i++)for(let j=0;j<nv;j++){const a=i*(nv+1)+j,b=a+1,c=a+nv+1,d=c+1;ix.push(a,c,b,b,c,d)}
 return FX.GF(pos,col,ix)}

SPN('Kelp gigante').gN=()=>{const gs=[],rn=mb(11),lf0=HX('#7f8a2c'),lf1=HX('#a6a73c');
 for(let s=0;s<3;s++){const ox=[-.18,.02,.2][s],ph=s*1.7,N=14;let prev=null;
  for(let i=0;i<=N;i++){const y=i/N,cur=V3([ox+.03*Math.sin(y*6+ph),y,.03*Math.cos(y*5+ph*1.3)]);if(prev)gs.push(P(seg(prev,cur,.034*(1-.5*(i-1)/N)+.008,.034*(1-.5*i/N)+.008,6),'#8a7b2f'));prev=cur}
  for(let i=0;i<12;i++){const y=.07+i*.075,x=ox+.03*Math.sin(y*6+ph),z=.03*Math.cos(y*5+ph*1.3),a=i*2.4+ph;
   for(const sd of[0,Math.PI])gs.push(MX(leafH(.28+.1*rn(),.05,.012,5,3,lf0,lf1),[x,y,z],[1,1,1],[0,a+sd,0]));
   gs.push(P(S_(.035,7,5),'#a99a3a',{p:[x+.02*Math.cos(a),y+.004,z+.02*Math.sin(a)],s:[1,.12,1]}))}}
 for(let i=0;i<14;i++){const a=i/14*6.28,rr=.1+.04*rn();gs.push(P(seg(V3([0,.002,0]),V3([Math.cos(a)*rr,.0005,Math.sin(a)*rr]),.03,.008,4),'#4a3f1c'))}
 return MG(gs)};
SPN('Pradera de posidonia').gN=()=>{const rn=mb(5),gs=[];for(let i=0;i<22;i++){const h=.55+.45*rn(),a=rn()*6.28,bend=.15+.35*rn();
 gs.push(MX(ribbon(h,.03+.012*rn(),bend,8,2,HX('#c9d99a'),i%3?HX('#3f7a34'):HX('#557f35'),{wf:u=>u<.88?1:Math.sqrt(Math.max(1-Math.pow((u-.88)/.12,2),0)),cg:1.6}),[(rn()-.5)*.12,0,(rn()-.5)*.12],[1,1,1],[0,a,0]))}
 return MG(gs)};
SPN('Cable submarino').gN=()=>P(CZ(.04,.04,120,5),'#2e2e30',{p:[0,0,-60]});
SPN('Coral de agua fría').gN=()=>richer(tree('#e6dcc8',{lv:5,len:.3,r:.05,sp:.85,k:3,seed:8}),.012);
SPN('Coral negro').gN=()=>richer(tree('#2d2420',{lv:6,len:.3,r:.014,sp:.6,k:2,tip:{c:'#dfe6e8',e:.35},seed:4}),.07);
SPN('Abanico de mar').gN=()=>richer(tree('#a64d79',{lv:6,len:.28,r:.012,sp:.55,flat:true}),.07);
SPN('Esponja barril').gN=()=>{const NA=28,NR=12,pos=[],col=[],ix=[],c0=HX('#7b4c63'),c1=HX('#a06b86');
 for(let i=0;i<=NR;i++){const y=i/NR,r0=.5-.1*y+.04*Math.sin(y*3.1);for(let j=0;j<=NA;j++){const a=j/NA*6.2832,r=r0*(1+.12*Math.cos(a*9)*(.6+.4*Math.sin(y*5)))*(1+.04*(h3(j,i,1)-.5)),k=MX3(c0,c1,y*.7+.25*h3(j,i,3));pos.push(r*Math.cos(a),y,r*Math.sin(a));col.push(k[0],k[1],k[2])}}
 for(let i=0;i<NR;i++)for(let j=0;j<NA;j++){const a=i*(NA+1)+j,b=a+1,c=a+NA+1,d=c+1;ix.push(a,b,c,b,d,c)}
 const gs=[FX.GF(pos,col,ix),P(new T.TorusGeometry(.4,.045,6,26),'#b27a94',{p:[0,1,0],r:[Math.PI/2,0,0]}),P(CY(.36,.28,.85,26,true),'#3a2030',{p:[0,.18,0]}),P(CY(.3,.3,.02,20),'#2a1622',{p:[0,.17,0]})];
 for(let i=0;i<10;i++){const a=i*.63;gs.push(P(CO(.035,.14,5),'#9a5f7b',{p:[Math.cos(a)*.52,.25+.07*i,Math.sin(a)*.52],r:[0,0,-Math.cos(a)*.8]}))}return MG(gs)};
SPN('Esponja de vidrio').gN=()=>{const gs=[],NV=16,NRg=12,rf=y=>.11+.07*Math.sin(Math.PI*Math.pow(y,.8)),c='#e8f0ec';
 for(let k=0;k<NV;k++){const a=k/NV*6.2832;let prev=null;for(let i=0;i<=8;i++){const y=i/8,cur=V3([Math.cos(a)*rf(y),y,Math.sin(a)*rf(y)]);if(prev)gs.push(P(seg(prev,cur,.006,.006,3),c,{e:.15}));prev=cur}}
 for(let i=1;i<=NRg;i++){const y=i/NRg;for(let k=0;k<NV;k++){const a0=k/NV*6.2832,a1=(k+1)/NV*6.2832;gs.push(P(seg(V3([Math.cos(a0)*rf(y),y,Math.sin(a0)*rf(y)]),V3([Math.cos(a1)*rf(y),y,Math.sin(a1)*rf(y)]),.005,.005,3),c,{e:.15}))}}
 for(let k=0;k<NV;k++){const a0=k/NV*6.2832,a1=(k+2)/NV*6.2832;for(let i=0;i<NRg;i++){const y0=i/NRg,y1=(i+1)/NRg;if((i+k)%2)gs.push(P(seg(V3([Math.cos(a0)*rf(y0),y0,Math.sin(a0)*rf(y0)]),V3([Math.cos(a1)*rf(y1),y1,Math.sin(a1)*rf(y1)]),.004,.004,3),'#cfe0d8',{e:.1}))}}
 gs.push(P(new T.TorusGeometry(.11,.012,5,18),'#c8d8d0',{p:[0,.98,0],r:[Math.PI/2,0,0]}));return MG(gs)};
SPN('Pluma de mar').gN=()=>{const gs=[P(CY(.014,.006,.5,8),'#d97a3c'),P(S_(.04,8,6),'#a8541f',{p:[0,0,0],s:[1,1.4,1]}),P(CY(.025,.014,.28,8),'#c4642a',{p:[0,-.25,0]})];
 for(let i=0;i<18;i++){const t=i/17,y=.26+.38*t,L=.13*(1-.45*t);for(const sd of[0,Math.PI])gs.push(MX(leafH(L,.016,-.035,4,2,HX('#f0944f'),HX('#e8894a')),[0,y,0],[1,1,1],[0,i*.9+sd,0]))}return MG(gs)};
SPN('Lirio de mar').gN=()=>{const gs=[];let prev=V3([0,0,0]);for(let i=1;i<=12;i++){const y=.8*i/12,cur=V3([.012*Math.sin(i),y,.012*Math.cos(i)]);gs.push(P(seg(prev,cur,.014,.011,5),'#e6a7b0'));if(i%3===0)for(let k=0;k<3;k++){const a=k*2.1+i;gs.push(P(seg(cur,V3([cur.x+Math.cos(a)*.05,y-.02,cur.z+Math.sin(a)*.05]),.005,.002,3),'#f0b8c0'))}prev=cur}
 for(let i=0;i<10;i++){const a=i*.628;let p0=V3([0,.8,0]);for(let s=1;s<=3;s++){const t=s/3,p1=V3([Math.cos(a)*.22*t,.8+.28*Math.sin(t*1.4),Math.sin(a)*.22*t]);gs.push(P(seg(p0,p1,.01*(1-.2*s),.01*(1-.2*s)-.002,4),'#f0b8c0'));
  for(const sd of[-1,1])for(let q=0;q<2;q++){const m=V3([p0.x+(p1.x-p0.x)*(q+.5)/2,p0.y+(p1.y-p0.y)*(q+.5)/2,p0.z+(p1.z-p0.z)*(q+.5)/2]);gs.push(P(seg(m,V3([m.x-Math.sin(a)*sd*.03,m.y+.015,m.z+Math.cos(a)*sd*.03]),.003,.001,3),'#f6c8cc'))}p0=p1}}return MG(gs)};
SPN('Gusano tubícola gigante').gN=()=>{const gs=[];for(let i=0;i<14;i++){const a=i*2.4,rr=.12*Math.sqrt(i),bx=Math.cos(a)*rr,bz=Math.sin(a)*rr,lean=[Math.sin(a)*.25,Math.cos(a)*.25];let p0=V3([bx,0,bz]);
  for(let s=1;s<=3;s++){const t=s/3,p1=V3([bx+lean[0]*t*.9+.02*Math.sin(s+i),.9*t,bz+lean[1]*t*.9]);gs.push(P(seg(p0,p1,.036-.004*s,.036-.004*(s+1)+.0,10),'#f2eee8'));p0=p1}
  gs.push(P(CY(.04,.036,.05,10),'#e8e0d4',{p:[p0.x,p0.y-.02,p0.z]}),P(S_(.05,10,8),'#a50f27',{p:[p0.x,p0.y+.03,p0.z],e:.25}));
  for(let k=0;k<14;k++){const b=k/14*6.2832;gs.push(P(seg(V3([p0.x,p0.y+.04,p0.z]),V3([p0.x+Math.cos(b)*.07,p0.y+.17,p0.z+Math.sin(b)*.07]),.014,.004,3),'#c8102e',{e:.25}))}}
 return MG(gs)};


// ================= CEFALÓPODOS, MEDUSAS Y SIFONÓFORO =================
function armG(base,dir,len,r0,nSuck,col,droop=.18,curl=0,N=5){const gs=[];let p0=V3(base),d=V3(dir).normalize();
 for(let i=0;i<N;i++){const t0=i/N,t1=(i+1)/N,d1=d.clone().add(V3([0,-droop*.25,0])).applyAxisAngle(V3([0,1,0]),curl*Math.sin(i*1.1+len*5)*.32).normalize(),p1=p0.clone().addScaledVector(d1,len/N),ra=r0*(1-.82*t0)+.0015,rb=r0*(1-.82*t1)+.0015;
  gs.push(P(seg(p0,p1,ra,rb,5),col));
  const ns=Math.round(nSuck/N);for(let k=0;k<ns;k++){const f=(k+.5)/ns,q=p0.clone().lerp(p1,f),rr=ra+(rb-ra)*f;gs.push(P(S_(rr*.5,4,3),'#ecdccf',{p:[q.x,q.y-rr*.75,q.z]}))}
  p0=p1;d=d1}
 return gs}
SPN('Calamar gigante').g=()=>{const red=HX('#a3453a'),pale=HX('#d9a690'),dk=HX('#7a2f28');
 const msec=s=>{const f=Math.max(Math.pow(s,.65)*(1-.12*s),.004);return{w:.078*f,ht:.072*f,hb:.066*f,p:2.2,yc:0}};
 const colf=(s,c,y)=>MX3(MX3(pale,red,ST(-.5,.2,y)),dk,.25*ST(.5,.95,y));
 const gs=[LOFT(.55,msec,colf,44,22,[0,0,-.275])];
 for(const sd of[-1,1])gs.push(FIN(v=>[sd*(.03+.11*v),0,-.55+.03],v=>[sd*(.03+.11*v),0,-.55+.22*(1-.55*v)],{T:.006,nrm:[0,1,0],nv:8,c1:red,c2:dk,tip:.5}));
 gs.push(LOFT(.11,s=>{const f=Math.max(Math.sin(Math.PI*(.12+.78*s)),.05);return{w:.066*f,ht:.062*f,hb:.056*f,p:2.2,yc:0}},colf,14,16,[0,0,.05]));
 for(const sd of[-1,1]){gs.push(P(S_(.02,8,6),'#0a1218',{p:[sd*.074,.008,.06]}),P(new T.TorusGeometry(.021,.003,5,12),'#c9a050',{p:[sd*.0745,.008,.06],r:[0,Math.PI/2,0]}))}
 gs.push(P(CO(.016,.05,6),'#b87a68',{p:[0,-.045,.09],r:[Math.PI/2+.2,0,0]}));
 for(let i=0;i<8;i++){const a=i/8*6.2832+.4,ln=i===5||i===6?.28:.22;gs.push(...armG([Math.cos(a)*.04,Math.sin(a)*.04,.1],[Math.cos(a)*.22,Math.sin(a)*.22-.06,1],ln,.023,16,'#b0584a'))}
 for(const sd of[-1,1]){gs.push(...armG([sd*.012,-.03,.1],[sd*.15,-.08,1],.5,.011,0,'#b86858',.1));const e=V3([sd*.07,-.1,.55]);
  gs.push(P(S_(.014,6,4),'#c46a58',{p:[e.x,e.y,e.z],s:[1,1,3.2]}),...Array.from({length:7},(_,k)=>P(S_(.004,4,3),'#ecdccf',{p:[e.x+(k%2?.007:-.007),e.y-.007,e.z-.03+k*.01]})))}
 return MG(gs)};
SPN('Calamar vampiro').g=()=>{const wb=HX('#5a1424'),wd=HX('#2a0810'),gs=[],N=8,armPos=(i,f)=>{const a=i/N*6.2832+.3,d=[Math.cos(a)*.5,Math.sin(a)*.5-.04*f,1],l=Math.hypot(...d);return[Math.cos(a)*.05+d[0]/l*f*.5,Math.sin(a)*.05+d[1]/l*f*.5,.12+d[2]/l*f*.5]};
 gs.push(LOFT(.34,s=>{const f=Math.max(Math.sin(Math.PI*(.08+.84*s)),.05);return{w:.13*f,ht:.125*f,hb:.11*f,p:2.2,yc:0}},()=>wb,18,16,[0,.02,-.1]));
 for(const sd of[-1,1]){gs.push(FIN(v=>[sd*(.11+.14*v),.1,-.08],v=>[sd*(.11+.14*v),.1,-.17+.05*v],{T:.01,nrm:[0,1,0],nv:8,c1:wb,c2:wd,tip:.5}));
  gs.push(P(S_(.05,10,8),'#0a1420',{p:[sd*.12,.07,.08]}),P(S_(.036,8,6),'#5a9bff',{p:[sd*.125,.075,.085],e:.5}))}
 for(let i=0;i<N;i++){const b=armPos(i,0),e=armPos(i,1);let p0=V3(b);for(let k=1;k<=4;k++){const p1=V3(armPos(i,k/4));gs.push(P(seg(p0,p1,.016*(1-.18*k),.016*(1-.18*(k+1))+.001,5),'#4a0e1c'));p0=p1}
  for(let k=1;k<=9;k++){const q=armPos(i,k/9);gs.push(P(CO(.005,.035,3),'#d8b8c0',{p:[q[0],q[1]-.01,q[2]],r:[Math.PI,0,0]}))}
  gs.push(P(S_(.012,5,4),'#88ffd0',{p:e,e:1}))}
 const pos=[],col=[],ix=[],NF=6;for(let i=0;i<N;i++){const b0=pos.length/3;for(let k=0;k<=NF;k++){const f=k/NF*.62;for(let j=0;j<=2;j++){const A=armPos(i,f),B=armPos((i+1)%N,f),t=j/2,sg=.015*Math.sin(t*3.14)*(1+f);pos.push(A[0]+(B[0]-A[0])*t,A[1]+(B[1]-A[1])*t-sg,A[2]+(B[2]-A[2])*t);const c=MX3(wb,wd,.3+.5*f);col.push(c[0],c[1],c[2])}}
  for(let k=0;k<NF;k++)for(let j=0;j<2;j++){const a=b0+k*3+j,b=a+1,c=a+3,d=c+1;ix.push(a,c,b,b,c,d)}}
 gs.push(FX.GF(pos,col,ix));
 return MG(gs.map(g=>g.attributes.color&&g.attributes.em?g:P(g,'#5a1424')))};
function jellyN(c,e,tn,tl,bell,o={}){const NT=12,NA=20,pos=[],col=[],ix=[],C=HX(c),ci=MX3(C,[0,0,0],.25),dm=.7;
 for(const side of[1,-1]){const b0=pos.length/3,sc=side>0?1:.93;
  for(let i=0;i<=NT;i++){const t=i/NT,th=t*1.5,r0=bell*Math.sin(th);
   for(let j=0;j<=NA;j++){const a=j/NA*6.2832,lap=t>.85?1+.06*Math.cos(a*(o.lap||16))*ST(.85,1,t):1,r=r0*sc*lap,y=.05+bell*dm*Math.cos(th)*(side>0?1:.9)-(side>0?0:bell*.06);
    pos.push(r*Math.cos(a),y,r*Math.sin(a));const rad=1-.28*Math.pow(Math.abs(Math.sin(a*(o.can||8)/2*1)),14)*ST(.1,.95,t),k=MX3(C,ci,side>0?(1-rad)*1.2:.45);const m=side>0?rad:1;col.push(k[0]*m,k[1]*m,k[2]*m)}}
  for(let i=0;i<NT;i++)for(let j=0;j<NA;j++){const a=b0+i*(NA+1)+j,b=a+1,cc=a+NA+1,d=cc+1;if(side>0)ix.push(a,cc,b,b,cc,d);else ix.push(a,b,cc,b,d,cc)}}
 const gs=[FX.GF(pos,col,ix)];
 for(let k=0;k<(o.fringe||20);k++){const a=k/(o.fringe||20)*6.2832;gs.push(P(seg(V3([Math.cos(a)*bell*.99,.05,Math.sin(a)*bell*.99]),V3([Math.cos(a)*bell*.96,.05-tl*.2,Math.sin(a)*bell*.96]),.004,.0015,3),c,{e}))}
 for(let k=0;k<tn;k++){const a=k/tn*6.2832+.2;let p0=V3([Math.cos(a)*bell*.9,.05,Math.sin(a)*bell*.9]);for(let s=1;s<=3;s++){const f=s/3,p1=V3([Math.cos(a)*bell*(.9-.35*f)+.02*Math.sin(s+k),.05-tl*f*(1+.3*((k*7)%3)/2),Math.sin(a)*bell*(.9-.35*f)]);gs.push(P(seg(p0,p1,.009*(1-.5*f),.009*(1-.5*f)-.002,3),c,{e}));p0=p1}}
 for(let k=0;k<(o.arms||4);k++){const a=k/(o.arms||4)*6.2832+.78;gs.push(MX(ribbon(bell*1.3,bell*.15,0,6,2,C,MX3(C,[1,1,1],.35),{wf:u=>1-.4*u}),[Math.cos(a)*bell*.12,.05,Math.sin(a)*bell*.12],[1,-1,1],[0,a,0]))}
 if(o.gon)for(let k=0;k<4;k++){const a=k/4*6.2832;gs.push(P(new T.TorusGeometry(bell*.2,.012,5,10,Math.PI*1.5),'#e8a0b0',{p:[Math.cos(a)*bell*.3,.05+bell*.4,Math.sin(a)*bell*.3],r:[Math.PI/2,0,a],e:.5}))}
 return MG(gs.map(g=>g.attributes.em&&g.attributes.color&&g.attributes.normal?g:P(g,c)))}
SPN('Medusa luna').g=()=>jellyN('#cfe0f2',.12,6,.35,.5,{lap:16,can:8,fringe:36,gon:1});
SPN('Medusa coronada').g=()=>jellyN('#8d1424',.55,12,.9,.5,{lap:20,can:10,fringe:20,arms:0});
SPN('Sifonóforo gigante').g=()=>{const gs=[],N=48;let prev=V3([0,0,-.5]);
 for(let i=1;i<=40;i++){const z=-.5+i/40,cur=V3([.008*Math.sin(i*.7),.006*Math.cos(i*.9),z]);gs.push(P(seg(prev,cur,.007,.007,4),'#cfe8ff',{e:.4}));prev=cur}
 gs.push(P(S_(.045,9,7),'#ffd0e8',{p:[0,.02,.5],s:[1,1.2,1],e:.4}));
 for(let i=0;i<14;i++){const z=.30+.19*i/13;for(const sd of[-1,1])gs.push(P(S_(.026,7,5),'#bfe0ff',{p:[sd*.024,-.005,z],s:[.9,.8,1.15],e:.45}))}
 for(let i=0;i<N;i++){const z=-.5+.76*i/(N-1),y=-.02;gs.push(P(S_(.014,5,4),'#ffb89c',{p:[0,y,z],s:[1,1.7,1],e:.35}));
  gs.push(P(seg(V3([0,y-.02,z]),V3([.01*Math.sin(i),y-.07-.09*((i*5)%4)/3,z+.01]),.003,.0015,3),'#e8f0ff',{e:.3}));
  for(const sd of[-1,1])gs.push(MX(leafH(.034,.011,.006,3,2,HX('#c8e4ff'),HX('#a8d0f0')),[sd*.008,y+.004,z],[1,1,1],[0,sd>0?0:Math.PI,0]))}
 return MG(gs.map(g=>g.attributes.color&&g.attributes.em?g:P(g,'#cfe8ff')))};
// piel procedural: escamas (peces), moteado (tiburones y ballenas), cromatóforos (cefalópodos)
['Atún rojo','Sardina','Pez linterna','Pez hacha','Pez víbora','Granadero','Pez caracol hadal','Pez pelícano','Rape abisal','Pez luna'].forEach(n=>{const s=SPN(n);if(s)s.pat=4});
['Tiburón blanco','Tiburón duende','Tiburón de Groenlandia','Ballena jorobada','Cachalote','Manta raya'].forEach(n=>{const s=SPN(n);if(s)s.pat=5});
['Calamar gigante','Calamar vampiro','Pulpo común'].forEach(n=>{const s=SPN(n);if(s)s.pat=6});


// ================= ABISALES: nautilo, rape, pez pelícano, ojo de barril =================
SPN('Nautilo').g=()=>{const NT=44,NP=18,pos=[],col=[],ix=[],cr=HX('#ecdcc0'),br=HX('#a8502a');
 const R=t=>.07*Math.exp(.62*t),cx=t=>[R(t)*Math.cos(t*4.2)*.9,R(t)*Math.sin(t*4.2)*.9];
 for(let i=0;i<=NT;i++){const t=i/NT*3.1,[yy,zz]=cx(t),rho=.045*Math.exp(.62*t)*.8,nx=-Math.sin(t*4.2),nz=Math.cos(t*4.2);
  for(let j=0;j<=NP;j++){const a=j/NP*6.2832,ca=Math.cos(a),sa=Math.sin(a),out=rho*(.55+.45*Math.abs(sa)),ax=rho*.62*sa;
   pos.push(ax,yy+out*ca*Math.cos(t*4.2)*.0+rho*ca*Math.cos(t*4.2),zz+rho*ca*Math.sin(t*4.2));
   const st=.5+.5*Math.sin(t*26+sa*2.2),k=MX3(cr,br,.7*ST(.45,.75,st)*(sa>0?1:.8)*(1-.5*i/NT));col.push(k[0],k[1],k[2])}}
 for(let i=0;i<NT;i++)for(let j=0;j<NP;j++){const a=i*(NP+1)+j,b=a+1,c=a+NP+1,d=c+1;ix.push(a,c,b,b,c,d)}
 const gs=[MX(FX.GF(pos,col,ix),[0,.04,-.12],[1,1,1],[0,0,0])];
 gs.push(P(S_(.1,9,7),'#f0e6d8',{p:[0,.0,.26],s:[.9,.8,1]}),P(new T.TorusGeometry(.03,.012,5,10),'#101418',{p:[.09,.02,.34],r:[0,Math.PI/2,0]}),P(new T.TorusGeometry(.03,.012,5,10),'#101418',{p:[-.09,.02,.34],r:[0,Math.PI/2,0]}));
 gs.push(P(S_(.1,9,7),'#c8603c',{p:[0,.08,.3],s:[.9,.55,.8]}));
 for(let i=0;i<22;i++){const a=i/22*6.2832,r0=.075;gs.push(P(seg(V3([Math.cos(a)*r0,Math.sin(a)*r0*.8-.01,.36]),V3([Math.cos(a)*(r0+.03),Math.sin(a)*(r0+.03)*.8-.03,.62+.04*Math.sin(i)]),.007,.002,3),'#ead6c0'))}
 gs.push(P(CO(.03,.1,6),'#dcc8b0',{p:[0,-.07,.33],r:[Math.PI/2+.3,0,0]}));
 return MG(gs.map(g=>g.attributes.color&&g.attributes.em?g:P(g,'#ead6c0')))};
SPN('Rape abisal').g=()=>{const sec=s=>{const u=1-s,f=Math.max(Math.pow(Math.sin(Math.PI*Math.pow(u,.78)),.7),.004)*(1-.25*u);return{w:.2*f,ht:.23*f,hb:.21*f*(1+.35*ST(.75,1,s)),p:2.1,yc:0}};
 const colf=(s,c,y)=>{let k=MX3(HX('#2c201a'),HX('#141010'),ST(-.4,.6,y));if(s>.9&&y<.15&&y>-.75)k=MX3(k,HX('#8a6a5a'),.85);return k};const gs=[LOFT(1,sec,colf,36,20)];
 gs.push(FIN(v=>[0,.09*v,-.5-.02*v],v=>[0,.09*v,-.5-.1-.04*v],{T:.004,nrm:[1,0,0],nv:5,c1:HX('#241915'),c2:HX('#241915')}),FIN(v=>[0,-.08*v,-.5-.02*v],v=>[0,-.08*v,-.5-.1-.04*v],{T:.004,nrm:[1,0,0],nv:5,c1:HX('#241915'),c2:HX('#241915')}));
 for(let k=0;k<2;k++)for(let i=0;i<9;i++){const a=(i/8-.5)*2.1,y=k?-.1:.02,r=.17+.03*k;gs.push(P(CO(.016,.15-.03*Math.abs(a),4),'#f2f2e8',{p:[Math.sin(a)*r,y-(k?.0:.0),.44+Math.cos(a)*.0+.04*k],r:[k?Math.PI*.12:-Math.PI*.12,0,a*.3]}))}
 gs.push(P(seg(V3([0,.19,.35]),V3([0,.5,.62]),.01,.005,4),'#241915'),P(S_(.05,8,6),'#ffe27a',{p:[0,.5,.62],e:1}));
 for(let i=0;i<5;i++)gs.push(P(seg(V3([0,.5,.62]),V3([(i-2)*.03,.45-.04*(i%2),.7]),.004,.001,3),'#ffe27a',{e:.8}));
 for(const sd of[-1,1]){gs.push(P(S_(.018,6,5),'#06080a',{p:[sd*.17,.12,.38]}),FIN(v=>[sd*(.19+.07*v),-.03,.15],v=>[sd*(.19+.07*v),-.03,.05],{T:.004,nv:4,c1:HX('#241915'),c2:HX('#241915')}))}
 return MG(gs.map(g=>g.attributes.color&&g.attributes.em?g:P(g,'#f2f2e8')))};
SPN('Pez pelícano').g=()=>{const sec=s=>{const u=1-s;let f;if(u<.18)f=.16*(.35+.65*Math.sin(Math.PI*(u/.18)*.9+.2));else f=.014+.1*Math.pow(Math.max(1-(u-.18)/.82,0),2.6)*.1+.004*(1-u);const w=f*(u<.18?1:.8);return{w:Math.max(w,.004),ht:Math.max(f*(u<.18?.85:1),.004),hb:Math.max(f*(u<.18?1.1:1),.004),p:2.1,yc:0}};
 const colf=(s,c,y)=>MX3(HX('#14121a'),HX('#252030'),ST(-.4,.6,y));const gs=[LOFT(1,sec,colf,52,16)];
 gs.push(P(new T.SphereGeometry(.15,16,8,0,6.2832,0,Math.PI/2),'#4a1a30',{p:[0,-.005,.42],r:[Math.PI/2,0,0],s:[1,.9,1.1]}),P(new T.TorusGeometry(.15,.008,5,24),'#d9d4e0',{p:[0,-.005,.42]}));
 for(const sd of[-1,1])gs.push(P(seg(V3([sd*.15,-.02,.42]),V3([sd*.05,-.03,.66]),.012,.006,4),'#cfc8d8'));
 for(let i=0;i<10;i++)gs.push(P(CO(.004,.05,3),'#d9d4e0',{p:[.12*Math.cos(i*.7),-.0,.46+.04*Math.sin(i)],r:[Math.PI*.6,0,0]}));
 for(const sd of[-1,1])gs.push(P(S_(.012,5,4),'#06080a',{p:[sd*.07,.07,.46]}));
 gs.push(P(S_(.024,6,5),'#ff6a3a',{p:[0,0,-.5],e:1}),P(S_(.016,6,5),'#ff9a6a',{p:[0,.012,-.46],e:.8}));
 return MG(gs.map(g=>g.attributes.color&&g.attributes.em?g:P(g,'#d9d4e0')))};
SPN('Pez ojo de barril').g=()=>{const gs=[];
 gs.push(P(S_(1,14,10),'#bfe8d8',{s:[.2,.17,.3],e:.12,p:[0,.07,.2]}));
 for(const sd of[-1,1])gs.push(P(CY(.045,.04,.1,10),'#7dffa0',{p:[sd*.05,.06,.18],e:.9,r:[.25,0,sd*.05]}),P(S_(.04,8,6),'#38ff78',{p:[sd*.05,.16,.2],e:1}));
 gs.push(P(S_(.02,6,5),'#7a5040',{p:[0,-.02,.45]}),P(S_(.014,5,4),'#7a5040',{p:[.035,.0,.44]}),P(S_(.014,5,4),'#7a5040',{p:[-.035,.0,.44]}));
 gs.push(fishG('#6b4e3f','#6b4e3f',{R:.08,tl:.15,lt:.6}).translate(0,0,-.3));
 return MG(gs)};
['Rape abisal','Pez pelícano','Pez ojo de barril'].forEach(n=>{const s=SPN(n);if(s)s.pat=4});


// ================= PULPOS: modelos cercanos =================
SPN('Pulpo común').gN=()=>{const rn=mb(21),cc=HX('#b4604a'),cp=HX('#e4b49a');
 const gs=[LOFT(.6,s=>{const f=Math.max(Math.pow(Math.sin(Math.PI*(.12+.8*s)),.8),.02);return{w:.2*f,ht:.2*f,hb:.17*f,p:2.2,yc:0}},(s,c,y)=>MX3(MX3(cp,cc,ST(-.5,.3,y)),HX('#8a4030'),.3*ST(.5,.95,y)),26,20,[0,.34,-.08])];
 gs.push(P(S_(.17,14,10),'#b4604a',{p:[0,.33,.2],s:[1,.9,1.05]}));
 for(const sd of[-1,1]){gs.push(P(S_(.065,10,8),'#c99a58',{p:[sd*.17,.42,.24],s:[.9,1,.7]}),P(BXs(.07,.014,.022,.004,1),'#06080a',{p:[sd*.205,.425,.26]}))}
 gs.push(P(CO(.03,.09,6),'#a85a44',{p:[.0,.2,.36],r:[Math.PI/2+.5,0,0]}));
 for(let i=0;i<8;i++){const a=i*.785+.2,r0=.13;gs.push(...armG([Math.cos(a)*r0,.2,Math.sin(a)*r0],[Math.cos(a),-.1,Math.sin(a)],.78+.06*rn(),.058,20,'#a4503c',.22,1.6+rn(),10))}
 return MG(gs.map(g=>g.attributes.color&&g.attributes.em?g:P(g,'#b4604a')))};
SPN('Pulpo dumbo').gN=()=>{const NA=24,NT=8,pos=[],col=[],ix=[],wp=HX('#e7b7c3'),wd=HX('#c98aa0');
 const gs=[LOFT(.5,s=>{const f=Math.max(Math.pow(Math.sin(Math.PI*(.1+.8*s)),.8),.02);return{w:.22*f,ht:.2*f,hb:.17*f,p:2.2,yc:0}},(s,c,y)=>MX3(wp,wd,ST(.2,.9,y)*.5),24,18,[0,.02,-.05])];
 for(const sd of[-1,1]){gs.push(FIN(v=>[sd*(.18+.3*v),.1,-.02],v=>[sd*(.18+.3*v),.1,-.2+.08*v],{T:.012,nrm:[0,1,0],nv:8,c1:wp,c2:wd,tip:.5}));gs.push(P(S_(.025,6,5),'#06080a',{p:[sd*.1,.08,.22]}))}
 for(const side of[1,-1]){const b0=pos.length/3;for(let i=0;i<=NT;i++){const t=i/NT,z=.15+.22*t,r=(.03+.2*Math.pow(t,.7))*(side>0?1:.95);for(let j=0;j<=NA;j++){const a=j/NA*6.2832,rr=r*(1+.12*Math.cos(a*8)*ST(.2,.9,t));pos.push(rr*Math.cos(a),-.02+rr*Math.sin(a)*.9,z);const k=MX3(wp,wd,.2+.5*t);col.push(k[0],k[1],k[2])}}
  for(let i=0;i<NT;i++)for(let j=0;j<NA;j++){const a=b0+i*(NA+1)+j,b=a+1,c=a+NA+1,d=c+1;if(side>0)ix.push(a,c,b,b,c,d);else ix.push(a,b,c,b,d,c)}}
 gs.push(FX.GF(pos,col,ix));
 for(let i=0;i<8;i++){const a=i*.785;gs.push(P(seg(V3([Math.cos(a)*.05,-.02+Math.sin(a)*.05,.22]),V3([Math.cos(a)*.19,-.02+Math.sin(a)*.17,.4]),.012,.004,4),'#f0c8d0'))}
 return MG(gs.map(g=>g.attributes.color&&g.attributes.em?g:P(g,'#e7b7c3')))};

// ================= CRIATURAS MÍTICAS DEL FONDO DE LA FOSA =================
// barrido de un tubo a lo largo de una curva (transporte paralelo del marco); rad(u) radio, colf(u,c,s)->[r,g,b]
function sweepG(pts,rad,colf,na=16){const n=pts.length,pos=[],col=[],ix=[];let nr=new T.Vector3(0,1,0);
 for(let i=0;i<n;i++){const t=(pts[Math.min(i+1,n-1)].clone().sub(pts[Math.max(i-1,0)])).normalize();
  nr=nr.clone().sub(t.clone().multiplyScalar(nr.dot(t)));if(nr.lengthSq()<1e-6)nr.set(1,0,0);nr.normalize();const bi=new T.Vector3().crossVectors(t,nr).normalize(),u=i/(n-1),r=rad(u);
  for(let j=0;j<=na;j++){const th=j/na*6.28318,c=Math.cos(th),sn=Math.sin(th),q=pts[i].clone().addScaledVector(nr,c*r).addScaledVector(bi,sn*r);pos.push(q.x,q.y,q.z);const k=colf(u,c,sn);col.push(k[0],k[1],k[2])}}
 for(let i=0;i<n-1;i++)for(let j=0;j<na;j++){const a=i*(na+1)+j,b=a+1,c2=a+na+1,d=c2+1;ix.push(a,c2,b,b,c2,d)}
 for(const e of[0,n-1]){const ci=pos.length/3,q=pts[e];pos.push(q.x,q.y,q.z);const k=colf(e?1:0,0,0);col.push(k[0],k[1],k[2]);const r0=e*(na+1);for(let j=0;j<na;j++){if(e)ix.push(ci,r0+j,r0+j+1);else ix.push(ci,r0+j+1,r0+j)}}
 return FX.GF(pos,col,ix)}
const orient=(g,dir,pos)=>{g.applyQuaternion(new T.Quaternion().setFromUnitVectors(V3([0,0,1]),V3(dir).normalize()));g.translate(pos[0],pos[1],pos[2]);return g};
const curveP=(cs,n)=>new T.CatmullRomCurve3(cs.map(V3)).getPoints(n);

// colmillo irregular y curvo (dos tramos), amarillento y sucio
const fangG=(x,y,z,len,r,rn,dirY=-1,col='#b8ab86')=>{const bend=(rn()-.5)*.5,a=V3([x,y,z]),m=V3([x+bend*len*.4,y+dirY*len*.55,z+(rn()-.3)*len*.25]),b=V3([x+bend*len,y+dirY*len,z+(rn()-.2)*len*.5]);return[P(seg(a,m,r,r*.6,4),col),P(seg(m,b,r*.6,r*.08,4),'#8c7f5e')]};
const socketG=(x,y,z,sd,sc,col,glow=2.2)=>[P(S_(sc,9,7),'#020303',{p:[x,y,z],s:[1,1.1,.8]}),P(S_(1,8,6),col,{p:[x+sd*sc*.55,y,z+sc*.3],s:[sc*.16,sc*.55,sc*.12],e:glow}),P(new T.TorusGeometry(sc*1.05,sc*.28,5,10),'#0c0f10',{p:[x+sd*sc*.12,y,z+sc*.2],r:[0,Math.PI/2,0]})];

// cabeza de serpiente marina: cráneo largo, cuencas hundidas con pupila rasgada, cuernos, dientes desparejos, boca abierta con garganta en brasa y barbas
function serpHead(bd,sp,bl,eye,k,rn){const gs=[];
 gs.push(LOFT(.24,s=>{const f=Math.max(Math.pow(Math.sin(Math.PI*Math.min(.97,.07+.9*s)),.55),.05);return{w:.044*f,ht:.03*f,hb:.012*f,p:2.9,yc:.006}},(s,c,sn)=>MX3(MX3(bd,sp,.55*ST(.1,1,sn)+.2*Math.sin(s*40)),HX('#6a6c58'),ST(0,-.7,sn)*.35),34,22,[0,0,.085]));
 gs.push(P(S_(1,10,7),'#16201f',{p:[0,-.02,.092],s:[.036,.008,.098],r:[.2,0,0]}),P(S_(1,8,6),'#2a0a0a',{p:[0,-.006,.1],s:[.028,.007,.07],e:.2}),P(S_(1,6,5),'#ff4a14',{p:[0,-.008,.045],s:[.014,.006,.02],e:1.3}));
 for(const sd of[-1,1]){gs.push(...socketG(sd*.039,.014,.115,sd,.0105,eye,2.6));
  gs.push(P(CO(.009,.05,5),'#121a1a',{p:[sd*.03,.034,.058],r:[-.75,0,sd*.7]}),P(CO(.005,.03,5),'#121a1a',{p:[sd*.034,.03,.1],r:[-.6,0,sd*.5]}));
  for(let i=0;i<10;i++){if(rn()<.2)continue;const z=.075+i*.0105+(rn()-.5)*.004;gs.push(...fangG(sd*(.034-.0012*i+(rn()-.5)*.003),-.004,z,.012+rn()*.03+(i===0||i===6?.025:0),.0032,rn,1))}
  for(let i=0;i<9;i++){if(rn()<.25)continue;const z=.07+i*.0105+(rn()-.5)*.004;gs.push(...fangG(sd*(.028-.0011*i+(rn()-.5)*.003),-.022,z,.011+rn()*.026,.0028,rn,1))}}
 const e0=V3([0,-.028,.075]);for(let i=0;i<4;i++){const tx=(i-1.5)*.012;gs.push(sweepG(curveP([[tx,-.03,.14],[tx+.004,-.07-.03*rn(),.13],[tx-.006,-.12-.05*rn(),.115],[tx+.01,-.19-.06*rn(),.1]],14),u=>.0026*(1-.8*u)+.0004,()=>[.06,.08,.07],6))}
 return MG(gs).scale(k,k,k)}

// --- Kraken: calamar colosal cubierto de cicatrices, con ojo amarillento hundido, pico negro, brazos con ventosas dentadas y garfios
SPN('Kraken').g=()=>{const red=HX('#4a1c22'),pale=HX('#6e5048'),dk=HX('#1d0b0e'),gs=[],rn=mb(41);
 const msec=s=>{const f=Math.max(Math.pow(s,.6)*(1-.1*s),.004);return{w:.09*f,ht:.085*f,hb:.075*f,p:2.2,yc:0}};
 const colf=(s,c,sn)=>MX3(MX3(pale,red,ST(-.4,.3,sn)),dk,.35*ST(.4,1,s)+.18*Math.sin(s*60+c*9));
 gs.push(richer(LOFT(.62,msec,colf,56,28,[0,0,-.31]),.012));
 for(const sd of[-1,1])gs.push(FIN(v=>[sd*(.04+.14*v),0,-.62+.05],v=>[sd*(.04+.14*v),0,-.62+.26*(1-.55*v)],{T:.008,nrm:[0,1,0],nv:9,c1:red,c2:dk,tip:.5}));
 gs.push(richer(LOFT(.13,s=>{const f=Math.max(Math.sin(Math.PI*(.12+.78*s)),.05);return{w:.075*f,ht:.07*f,hb:.062*f,p:2.2,yc:0}},colf,16,18,[0,0,.07]),.01));
 for(const sd of[-1,1]){const x=sd*.082;gs.push(P(S_(.033,10,8),'#050404',{p:[x,.01,.068]}),P(S_(.027,10,8),'#a89a58',{p:[x+sd*.004,.01,.07],e:.5}),P(S_(1,8,6),'#030303',{p:[x+sd*.022,.01,.074],s:[.006,.0045,.016]}),P(new T.TorusGeometry(.034,.007,6,16),'#140808',{p:[x+sd*.002,.01,.068],r:[0,Math.PI/2,0]}))}
 gs.push(P(S_(.03,8,6),'#140a0a',{p:[0,-.05,.115],s:[1,1.3,1]}),P(CO(.024,.07,6),'#050404',{p:[0,-.06,.12],r:[Math.PI/2+.3,0,0]}),P(CO(.016,.05,6),'#0a0606',{p:[0,-.05,.155],r:[Math.PI/2-.2,0,0]}),...Array.from({length:10},(_,k)=>P(CO(.003,.012,4),'#c9c0a8',{p:[(k%2?.012:-.012),-.065,.13+k*.004],r:[Math.PI,0,0]})));
 for(let i=0;i<26;i++){const s=.1+rn()*.8,q=msec(s),th=rn()*6.283;gs.push(P(S_(.0038,5,4),'#5ec8c0',{p:[q.w*Math.cos(th)*1.02,q.ht*Math.sin(th)*1.02,-.62+s*.62],e:1.2}))}
 for(let i=0;i<14;i++){const s=.12+rn()*.75,q=msec(s),th=rn()*6.283,a=rn()*3;gs.push(P(new T.TorusGeometry(.012+rn()*.01,.0022,5,10),'#c8bca6',{p:[q.w*Math.cos(th)*1.01,q.ht*Math.sin(th)*1.01,-.62+s*.62],r:[Math.sin(th)*1.2,Math.PI/2,a]}))}
 for(let i=0;i<8;i++){const a=i/8*6.2832+.35;gs.push(...armG([Math.cos(a)*.045,Math.sin(a)*.045,.13],[Math.cos(a)*.28,Math.sin(a)*.28-.08,1],.55+.1*Math.sin(i*2.1),.027,40,'#5a2428',.2,1,10))}
 for(const sd of[-1,1]){gs.push(...armG([sd*.014,-.035,.13],[sd*.18,-.1,1],1.15,.0125,0,'#6a3030',.12,1,14));
  const e=V3([sd*.19,-.2,1.2]);gs.push(P(S_(.026,7,5),'#5a2a2a',{p:[e.x,e.y,e.z],s:[1,1,3.6]}),...Array.from({length:12},(_,k)=>P(S_(.0065,4,3),'#c8bca6',{p:[e.x+(k%2?.011:-.011),e.y-.013,e.z-.07+k*.014]})),...Array.from({length:9},(_,k)=>P(CO(.0045,.024,4),'#0c0808',{p:[e.x+(k%2?.012:-.012),e.y-.022,e.z-.075+k*.017],r:[Math.PI+.2*(k%2?1:-1),0,0]})))}
 gs.push(P(seg(V3([-.3,-.2,.75]),V3([-.18,.32,.9]),.006,.005,6),'#241a10'),P(seg(V3([-.34,.22,.84]),V3([-.06,.3,.9]),.003,.003,5),'#241a10'),P(BXs(.0025,.07,.09,.002,1),'#4a4434',{p:[-.2,.17,.87],r:[0,.3,.2]}));
 return MG(gs)};
SPN('Kraken').pat=6;

// --- Leviatán: serpiente-dragón de piel oscura y corroída, cresta de espinas rotas y cabeza de cráneo largo con cuencas hundidas
SPN('Leviatán').g=()=>{const gs=[],bd=HX('#1c2a2c'),bl=HX('#58614f'),sp=HX('#0b1214'),rn=mb(9);
 const path=curveP(Array.from({length:14},(_,i)=>{const u=i/13;return[Math.sin(u*9.4)*.1*(1-.25*u),Math.sin(u*5.6+1)*.025,-.5+u*.96]}),150);
 const rad=u=>.036*Math.pow(Math.sin(Math.PI*Math.min(.98,.92*Math.pow(u,.8))),.55)+.003;
 gs.push(richer(sweepG(path,rad,(u,c,sn)=>{const belly=ST(-.1,-.55,sn),band=.5+.5*Math.sin(u*210),scar=Math.max(0,Math.sin(u*37+c*3)*Math.sin(u*91))>.8?.5:1;const k=MX3(MX3(bd,sp,.55*ST(.2,1,sn)),bl,belly*.7);const m=(.82+.14*band)*scar;return[k[0]*m,k[1]*m,k[2]*m]},20),.016));
 const frame=i=>{const a=path[Math.min(i+1,path.length-1)].clone().sub(path[Math.max(i-1,0)]).normalize(),up=V3([0,1,0]).sub(a.clone().multiplyScalar(a.y)).normalize();return{a,up}};
 for(let i=6;i<path.length-8;i+=2){if(rn()<.15)continue;const u=i/(path.length-1),{a,up}=frame(i),r=rad(u),h=(.02+.016*rn())*Math.sin(Math.PI*Math.min(1,u*1.05))+.005,q=path[i].clone().addScaledVector(up,r*.95);
  const g=P(CO(r*(.2+.2*rn()),h,5),'#0d1618',{});g.applyQuaternion(new T.Quaternion().setFromUnitVectors(V3([0,1,0]),up.clone().addScaledVector(a,-.3-rn()*.5).add(V3([(rn()-.5)*.3,0,(rn()-.5)*.3])).normalize()));g.translate(q.x,q.y,q.z);gs.push(g)}
 for(let k=0;k<3;k++){const i=40+k*34,{up}=frame(i),q=path[i],r=rad(i/149);gs.push(sweepG(curveP([[q.x,q.y-r*.8,q.z],[q.x+.01,q.y-r-.05,q.z-.01*k],[q.x-.01,q.y-r-.11,q.z+.015]],10),u=>.003*(1-.8*u)+.0004,()=>[.1,.13,.1],5))}
 const e=path[path.length-1],ft=frame(path.length-1).a;
 gs.push(orient(serpHead(bd,sp,bl,'#ff7a1a',1,rn),[ft.x,ft.y,ft.z],[e.x,e.y,e.z]));
 for(const sd of[-1,1]){const i=118,pq=path[i];const f=FIN(v=>[0,0,-.02+.02*v],v=>[sd*.07*v,-.02*v,.06-.02*v],{T:.003,nrm:[0,1,0],nv:7,c1:bd,c2:sp,tip:.5});f.translate(pq.x+sd*.032,pq.y-.01,pq.z);gs.push(f)}
 const t0=path[0];for(const sd of[-1,1]){const tf=FIN(v=>[0,0,0],v=>[sd*.1*v,0,-.09*v-.01],{T:.004,nrm:[0,1,0],nv:7,c1:bd,c2:sp,tip:.5});tf.translate(t0.x,t0.y,t0.z-.01);gs.push(tf)}
 return MG(gs)};
SPN('Leviatán').pat=4;

// --- Escila: masa de roca y carne con costillas a la vista, seis cuellos con cabezas esqueléticas de lobo y doce patas con garras
SPN('Escila').g=()=>{const gs=[],rn=mb(77);
 {const rk=[];for(let i=0;i<9;i++){const a=i/9*6.283;rk.push(P(S_(.2+.1*rn(),16,12),'#14161a',{p:[Math.cos(a)*.34,.02,Math.sin(a)*.34],s:[1,.7+.4*rn(),1]}))}
 rk.push(P(S_(.4,20,14),'#101215',{p:[0,.03,0],s:[1.2,.55,1.1]}));gs.push(richer(MG(rk),.012))}
 gs.push(richer(LOFT(.55,s=>{const f=Math.pow(Math.sin(Math.PI*(.05+.9*s)),.6);return{w:.17*f,ht:.14*f,hb:.12*f,p:2.2,yc:0}},(s,c,sn)=>MX3(MX3(HX('#1e2024'),HX('#3a1c1e'),.4+.3*Math.sin(s*20)),HX('#54443a'),ST(0,-1,sn)*.3),30,22,[0,.2,0]),.02));
 for(let k=0;k<9;k++){const z=-.2+k*.05,w=.17*Math.pow(Math.sin(Math.PI*(.05+.9*(z+.275)/.55)),.6);for(const sd of[-1,1])gs.push(P(new T.TorusGeometry(Math.max(w*.9,.03),.006,5,12,Math.PI*.85),'#b4a88a',{p:[0,.2,z],r:[0,0,sd>0?-Math.PI*.42:Math.PI*1.42],s:[sd,1,1]}))}
 const headG=()=>{const g=[];
  g.push(LOFT(.13,s=>{const f=Math.max(Math.pow(Math.sin(Math.PI*Math.min(.97,.1+.88*s)),.5),.06);return{w:.024*f,ht:.022*f,hb:.008*f,p:2.7,yc:.002}},(s,c,sn)=>MX3(HX('#262a2e'),HX('#4a2c2c'),.5*ST(0,1,s)),22,16,[0,0,.04]));
  g.push(P(S_(1,8,6),'#1a0a0a',{p:[0,-.014,.045],s:[.021,.005,.065],r:[.28,0,0]}));
  for(const sd of[-1,1]){g.push(...socketG(sd*.024,.012,.022,sd,.0075,'#d6ff7a',2),P(CO(.007,.03,5),'#16181b',{p:[sd*.022,.024,-.006],r:[-.4,0,sd*.5]}));
   for(const row of[0,1,2])for(let k=0;k<8;k++){if(rn()<.18)continue;g.push(...fangG(sd*(.0105+.0022*row+.0008*k+(rn()-.5)*.002),-.004-.0012*row,.032+k*.0085+row*.002+(rn()-.5)*.003,.008+rn()*.016+(k===0&&row===0?.022:0),.0022,rn,1))}}
  g.push(P(S_(.005,6,4),'#050505',{p:[0,.005,.118]}));return MG(g)};
 const hi=[[1,.5,.2],[.8,.4,.55],[.1,.5,.9],[-.7,.4,.6],[-1,.5,.1],[-.4,.5,-.8]];
 hi.forEach((d,i)=>{const dir=V3(d).normalize(),b=V3([dir.x*.12,.28,dir.z*.12]);
  const cs=[b.toArray(),[dir.x*.25,.5+.12*Math.sin(i),dir.z*.25],[dir.x*.45,.62+.1*Math.cos(i*2),dir.z*.45],[dir.x*.66,.5+.12*Math.sin(i*3),dir.z*.66],[dir.x*.8,.34+.1*Math.cos(i*3),dir.z*.8]];
  const pts=curveP(cs,40),endDir=pts[39].clone().sub(pts[36]).normalize();
  gs.push(richer(sweepG(pts,u=>.02-.008*u+.002*Math.sin(u*30),(u,c,sn)=>MX3(MX3(HX('#202328'),HX('#4a2224'),.3+.4*u),HX('#5c4a3c'),ST(0,-1,sn)*.3),12),.01));
  for(let k=2;k<38;k+=3){const q=pts[k],t=pts[k+1].clone().sub(pts[k-1]).normalize();const g2=P(CO(.004,.018,4),'#b4a88a',{});g2.applyQuaternion(new T.Quaternion().setFromUnitVectors(V3([0,1,0]),V3([0,1,0]).sub(t.clone().multiplyScalar(t.y)).normalize()));g2.translate(q.x,q.y+.016,q.z);gs.push(g2)}
  const hg=headG();hg.scale(1.2,1.2,1.2);hg.applyQuaternion(new T.Quaternion().setFromUnitVectors(V3([0,0,1]),endDir.clone().add(V3([0,-.3,0])).normalize()));hg.translate(pts[39].x,pts[39].y,pts[39].z);gs.push(hg)});
 for(let i=0;i<12;i++){const a=i/12*6.283+.2,base=[Math.cos(a)*.16,.12,Math.sin(a)*.16],dd=[Math.cos(a),-.5,Math.sin(a)],ln=.3+.06*rn();gs.push(...armG(base,dd,ln,.02,0,'#2a2226',.3,0,6));
  const tip=V3(base).addScaledVector(V3(dd).normalize(),ln*.95);for(let c=-1;c<=1;c++)gs.push(P(CO(.004,.026,4),'#b4a88a',{p:[tip.x+c*.006,tip.y-.014,tip.z+c*.004],r:[Math.PI+.4*c,0,0]}))}
 return MG(gs)};
SPN('Escila').pat=5;

// --- Jörmungandr: serpiente anillada de escamas oscuras y cuernos, mordiéndose la cola
SPN('Jörmungandr').g=()=>{const gs=[],R=.36,bd=HX('#1c2616'),bl=HX('#585a44'),dk=HX('#0b100a'),rn=mb(23);
 const th0=.12,th1=6.283-.62,pts=Array.from({length:260},(_,i)=>{const u=i/259,th=th0+(th1-th0)*u;return V3([Math.cos(th)*(R+.012*Math.sin(u*40)),.035*Math.sin(u*18)+.02,Math.sin(th)*(R+.012*Math.sin(u*40))])});
 const rad=u=>.03*Math.pow(Math.sin(Math.PI*(.94*Math.pow(u,.7))),.5)+.0025;
 gs.push(richer(sweepG(pts,rad,(u,c,sn)=>{const band=.5+.5*Math.sin(u*420);return MX3(MX3(bd,dk,.55*ST(.1,1,sn)+.2*band),bl,ST(0,-.6,sn)*.6)},20),.015));
 for(let i=8;i<pts.length-14;i+=3){if(rn()<.12)continue;const u=i/259,a=pts[i+1].clone().sub(pts[i-1]).normalize(),up=V3([0,1,0]),r=rad(u),g=P(CO(r*(.25+.2*rn()),r*(.7+.6*rn()),5),'#0f160c',{});g.applyQuaternion(new T.Quaternion().setFromUnitVectors(V3([0,1,0]),up.clone().addScaledVector(a,-.35).normalize()));g.translate(pts[i].x,pts[i].y+r*.9,pts[i].z);gs.push(g);if(i%15===8)gs.push(P(S_(r*.14,5,4),'#5aff9a',{p:[pts[i].x,pts[i].y+r*1.7,pts[i].z],e:1.8}))}
 const e=pts[pts.length-1],ft=pts[pts.length-1].clone().sub(pts[pts.length-4]).normalize();
 gs.push(orient(serpHead(bd,dk,bl,'#8aff6a',.95,rn),[ft.x,ft.y,ft.z],[e.x,e.y,e.z]));
 return MG(gs)};
SPN('Jörmungandr').pat=4;

// --- Pez espada: cuerpo esbelto, pico largo y aplanado, vela dorsal alta, cola lunada y quillas
SPN('Pez espada').g=()=>{const tf=u=>Math.pow(Math.sin(Math.PI*Math.pow(u,.58)),.8)*(1-.1*u);
 const sec=s=>{const f=Math.max(tf(1-s),.004);return{w:.052*f,ht:.088*f,hb:.078*f,p:2.3,yc:.004}};
 const top=HX('#18233d'),mid=HX('#5a7290'),bel=HX('#d8dde0'),dk=HX('#10192c');
 const colf=(s,c,sn)=>{let k=MX3(MX3(bel,mid,ST(-.55,-.05,sn)),top,ST(.05,.55,sn));if(s>.85&&sn<-.1)k=MX3(k,dk,.4);return k};
 const fd=HX('#1c2b49'),fl=HX('#3a5070'),gs=[LOFT(1,sec,colf,84,32)];
 gs.push(P(seg(V3([0,.004,.47]),V3([0,-.004,.93]),.024,.0028,10),'#27313f'),P(seg(V3([0,-.012,.47]),V3([0,-.012,.64]),.013,.004,7),'#1f2833'));
 const lobe=sd=>FIN(v=>[0,sd*.2*v,-.5-.03*v*v],v=>[0,sd*.2*v,-.5-.075-.19*Math.pow(v,1.25)],{T:.006,nrm:[1,0,0],nu:16,nv:14,c1:HX('#1b2a46'),c2:fd,tip:.35});
 gs.push(lobe(1),lobe(-1));
 {const y=RY(sec,.2,1,.88);gs.push(FIN(v=>[0,y+.13*v,.2-.1*v],v=>[0,y+.13*v,-.12+.03*v],{T:.004,nrm:[1,0,0],nu:16,nv:12,c1:fd,c2:HX('#2e4467'),tip:.5}))}
 {const y=RY(sec,-.3,1,.88);gs.push(FIN(v=>[0,y+.028*v,-.28-.01*v],v=>[0,y+.028*v,-.35],{T:.003,nrm:[1,0,0],nu:6,nv:5,c1:fd,c2:fd}))}
 {const yb=RY(sec,-.18,-1,.88);gs.push(FIN(v=>[0,yb-.05*v,-.17],v=>[0,yb-.05*v,-.27],{T:.003,nrm:[1,0,0],nu:8,nv:6,c1:fd,c2:fd}),FIN(v=>[0,yb-.022*v,-.32],v=>[0,yb-.022*v,-.37],{T:.003,nrm:[1,0,0],nu:5,nv:4,c1:fd,c2:fd}))}
 for(const sd of[-1,1]){gs.push(FIN(v=>[sd*(.04+.17*v),-.05-.015*v,.26-.05*v],v=>[sd*(.04+.17*v),-.05-.03*v,.26-.075-.16*v],{T:.004,nu:12,nv:10,c1:fd,c2:fl,tip:.5}));
  gs.push(FIN(v=>[sd*(.012+.045*v),-.012,-.42-.004*v],v=>[sd*(.012+.045*v),-.012,-.47],{T:.003,nrm:[0,1,0],nu:5,nv:4,c1:fd,c2:fd}));
  gs.push(...EYE(sd*.046,.018,.4,.02))}
 gs.push(P(CY(.014,.008,.012,6),'#0b111b',{p:[0,.0,.49],r:[Math.PI/2,0,0]}));
 return MG(gs)};
SPN('Pez espada').pat=0;
