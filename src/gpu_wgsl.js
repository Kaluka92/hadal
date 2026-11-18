// ================= SHADERS WGSL =================
// bloque común: uniformes globales, agua física (absorción y dispersión por canal)
const WC=`struct G{vp:mat4x4f,shm:mat4x4f,cam:vec4f,fwd:vec4f,sig:vec4f,kd:vec4f,sun:vec4f,fl:vec4f,res:vec4f,pp:vec4f,rr:vec4f,uu:vec4f,ff:vec4f,ex:vec4f,cv:vec4f,so:vec4f,fo:vec4f};
@group(0) @binding(0) var<uniform> g:G;
@group(0) @binding(1) var sL:sampler;
@group(0) @binding(2) var sC:sampler_comparison;
@group(0) @binding(3) var tCau:texture_2d<f32>;
@group(0) @binding(4) var tDet:texture_2d<f32>;
@group(0) @binding(5) var tSh:texture_depth_2d;
@group(0) @binding(6) var sK:sampler;
const WCOL=vec3f(.16,.58,.90);
const SUNC=vec3f(1.15,1.1,1.0);
fn sat1(x:f32)->f32{return clamp(x,0.,1.);}
fn ss(a:f32,b:f32,x:f32)->f32{let t=clamp((x-a)/(b-a),0.,1.);return t*t*(3.-2.*t);}
fn absr(a0:vec3f,d:f32)->vec3f{let sm=abs(a0)<vec3f(1e-4);let a=select(a0,vec3f(1e-4),sm);return (1.-exp(-a*d))/a;}
fn sunE(y:f32)->vec3f{return SUNC*exp(g.kd.xyz*min(y,0.)/g.sun.y);}
fn fogIn(ro:vec3f,rd:vec3f,d:f32)->vec3f{let a=g.sig.xyz-g.kd.xyz*rd.y/g.sun.y;let mu=max(dot(rd,g.sun.xyz),0.);return WCOL*g.sig.xyz*exp(g.kd.xyz*min(ro.y,0.)/g.sun.y)*absr(a,d)*(1.15+.35*pow(mu,4.));}
fn ign(p:vec2f)->f32{return fract(52.9829189*fract(dot(p,vec2f(.06711056,.00583715))));}
`;

// ---- material de escena: geometría estática o animada, instancias y luz ----
const MATWGSL=(anim)=>WC+`
struct Mt{a:vec4f,b:vec4f,c:vec4f,d:vec4f};
@group(1) @binding(0) var<uniform> M:Mt;
struct VI{@location(0)p:vec3f,@location(1)n:vec3f,@location(2)c:vec3f,@location(3)e:f32,@location(4)m0:vec4f,@location(5)m1:vec4f,@location(6)m2:vec4f,@location(7)m3:vec4f,@location(8)t:vec4f,@location(9)s:vec4f};
struct VO{@builtin(position)cp:vec4f,@location(0)wp:vec3f,@location(1)n:vec3f,@location(2)c:vec3f,@location(3)l:vec3f,@location(4)e:f32};
fn hs1(x:f32)->f32{return fract(sin(x*127.1)*43758.5453);}
@vertex fn vs(i:VI,@builtin(instance_index) ii:u32)->VO{
 var o:VO;let uT=g.cam.w;let ph0=i.s.w*6.2831853;let ph=ph0+f32(ii)*.9;var p=i.p;
 ${anim||''}
 var wp:vec3f;var nw:vec3f;
 if(M.a.x<.5){
  let im=mat4x4f(i.m0,i.m1,i.m2,i.m3);
  wp=(im*vec4f(p,1.)).xyz;nw=mat3x3f(i.m0.xyz,i.m1.xyz,i.m2.xyz)*i.n;
  if(M.d.x>.5){let bs=i.m3.xyz;wp=bs+(wp-bs)*(1.-ss(38.,78.,distance(bs,g.cam.xyz)));}
 }else{
  let s=length(i.m0.xyz);let off=i.m3.xyz-i.s.xyz;
  let a=M.a.z*uT*(.6+.8*fract(i.s.w*7.3))+ph0;let R=M.a.y*(.5+fract(i.s.w*3.7));
  let path=vec3f(cos(a)*R,sin(a*1.3+ph0)*M.a.y*.08,sin(a)*R);let c=cos(-a);let sn=sin(-a);
  let Ry=mat3x3f(vec3f(c,0.,-sn),vec3f(0.,1.,0.),vec3f(sn,0.,c));
  wp=i.s.xyz+path+Ry*(off+p*s);nw=Ry*i.n;
  if((u32(g.ex.w)&64u)==0u){let dc=i.s.xyz+path-g.cam.xyz;let dl=max(length(dc),.5);let cu=step(.72,fract(i.s.w*5.17));
   let fr=16.+2.*s;let push=max(fr-dl,0.)*.85*(1.-cu);let pull=clamp(dl-7.,0.,40.)*smoothstep(40.,25.,dl)*.6*cu;
   wp=wp+dc/dl*(push-pull);}
 }
 o.cp=g.vp*vec4f(wp,1.);o.wp=wp;o.n=nw;o.c=i.c*i.t.xyz;o.l=i.p;o.e=i.e;
 return o;
}
struct TP{h:f32,c:f32,n:vec3f};
fn tri(p:vec3f,n:vec3f,s:f32,dpx:vec3f,dpy:vec3f)->TP{
 var w=pow(abs(n),vec3f(4.));w=w/(w.x+w.y+w.z);
 let th=select(.04,0.,(u32(g.ex.w)&16u)!=0u);w=w*vec3f(step(th,w.x),step(th,w.y),step(th,w.z));w=w/(w.x+w.y+w.z);
 var x=vec4f(.5);var y=vec4f(.5);var z=vec4f(.5);
 if(w.x>0.){x=textureSampleGrad(tDet,sL,p.zy*s,dpx.zy*s,dpy.zy*s);}
 if(w.y>0.){y=textureSampleGrad(tDet,sL,p.xz*s,dpx.xz*s,dpy.xz*s);}
 if(w.z>0.){z=textureSampleGrad(tDet,sL,p.xy*s,dpx.xy*s,dpy.xy*s);}
 var o:TP;o.h=x.b*w.x+y.b*w.y+z.b*w.z;o.c=x.a*w.x+y.a*w.y+z.a*w.z;
 let a=x.rg*2.-1.;let b=y.rg*2.-1.;let c=z.rg*2.-1.;
 o.n=vec3f(0.,a.y,a.x)*w.x+vec3f(b.x,0.,b.y)*w.y+vec3f(c.x,c.y,0.)*w.z;return o;
}
fn caus(p:vec3f,d:f32)->vec3f{
 let off=(u32(g.ex.w)&32u)!=0u;if(d>100.&&!off){return vec3f(.33);}
 let q=p.xz-g.sun.xz*(p.y/g.sun.y);let o=vec2f(.004,.0025);
 var a=vec3f(textureSampleLevel(tCau,sL,q/3.3,0.).r);
 if(d<22.||off){a=vec3f(textureSampleLevel(tCau,sL,q/3.3+o,0.).r,a.x,textureSampleLevel(tCau,sL,q/3.3-o,0.).r);}
 let b=textureSampleLevel(tCau,sL,q.yx/6.9+.37,0.).g;
 let c=min(pow(a,vec3f(2.3))*3.2*(.45+b*1.3),vec3f(4.));return mix(c,vec3f(.33),ss(35.,100.,d));
}
fn ambL(p:vec3f,n:vec3f)->vec3f{let up=n.y*.5+.5;return WCOL*exp(g.kd.xyz*min(p.y,0.)*1.2)*(.24+.76*up*up)*(.55+.45*sat1(-p.y/30.))*.95;}
fn shadowV(p:vec3f,n:vec3f)->f32{
 let c=g.shm*vec4f(p+n*.3,1.);let q=c.xyz/c.w;let uv=vec2f(q.x*.5+.5,.5-q.y*.5);
 let e=min(min(uv.x,1.-uv.x),min(uv.y,1.-uv.y));
 if(e<0.||q.z>1.){return 1.;}
 let px=1./g.fl.w;var s=0.;let tr=select(select(0u,1u,(u32(g.ex.w)&4096u)!=0u),2u,(u32(g.ex.w)&8192u)!=0u);
 if(tr>0u&&length(p-g.cam.xyz)<60.){let n=select(5,7,tr==2u);for(var i=0;i<7;i++){if(i>=n){break;}for(var j=0;j<7;j++){if(j>=n){break;}let o=(vec2f(f32(i),f32(j))/f32(n-1)-.5)*2.*px*1.9;s+=textureSampleCompareLevel(tSh,sC,uv+o,q.z-.0025);}}
  return mix(1.,s/f32(n*n),ss(0.,.08,e));}
 let nk=select(1,4,length(p-g.cam.xyz)<40.||(u32(g.ex.w)&32u)!=0u);
 for(var k=0;k<4;k++){if(k>=nk){break;}let o=vec2f(f32(k&1),f32(k>>1))*2.-1.;s+=textureSampleCompareLevel(tSh,sC,uv+o*px*.8,q.z-.0025);}
 return mix(1.,s/f32(nk),ss(0.,.08,e));
}
fn h2(p:vec2f)->f32{return fract(sin(dot(p,vec2f(127.1,311.7)))*43758.5453);}
@fragment fn fs(i:VO,@builtin(front_facing) ff:bool)->@location(0) vec4f{
 if((u32(g.ex.w)&1048576u)!=0u&&i.wp.y>-12.){discard;}
 var N=normalize(i.n);if(!ff){N=-N;}
 let dm=u32(g.ex.w);let n0=N;let tc=g.cam.xyz-i.wp;let d=length(tc);let V=tc/d;
 var alb=i.c;var ao=1.;var gloss=M.b.w;let matT=M.c.w;
 if(matT>.5&&(dm&4u)==0u){
  let dpx=dpdx(i.wp);let dpy=dpdy(i.wp);let off=(u32(g.ex.w)&32u)!=0u;
  let fine=ss(30.,6.,d);let lod=ss(90.,28.,d);let far=ss(260.,60.,d);
  var A:TP;A.h=.5;A.c=.5;A.n=vec3f(0.);var B=A;var Cc=A;
  if(d<90.||off){A=tri(i.wp,n0,.35,dpx,dpy);B=tri(i.wp,n0,1.7,dpx,dpy);}
  if(d<260.||off){Cc=tri(i.wp,n0,.06,dpx,dpy);}
  A.h=mix(.5,A.h,lod);A.c=mix(.5,A.c,lod);B.h=mix(.5,B.h,lod);B.c=mix(.5,B.c,lod);Cc.h=mix(.5,Cc.h,far);
  let big=textureSample(tDet,sL,i.wp.xz*.011+vec2f(i.wp.y*.017)).a;
  let dpk=select(1.,mix(1.,.4,ss(40.,260.,-i.wp.y)),matT>2.5&&matT<3.5&&(dm&512u)==0u);
  let hgt=mix(.5,A.h*.5+B.h*.35+Cc.h*.15,mix(.25,1.,dpk));
  N=normalize(n0+(A.n*.9*lod*dpk+B.n*.7*fine*mix(1.,.35,1.-dpk)*dpk+Cc.n*.5*far*mix(.5,1.,dpk))*M.b.x);
  if(matT<1.5||(matT>2.5&&matT<3.5)){
   let sl=ss(110.,35.,d);let st=i.wp.y*.6+A.h*1.4+big*4.5;let bed=mix(.5,hs1(floor(st)),sl);let sf=fract(st);
   alb=alb*mix(.78,1.18,bed)*(1.-.4*sl*ss(.12,0.,sf)*(1.-abs(n0.y)));alb=alb*(.55+.9*hgt);
   let upf=ss(.55,.9,n0.y);
   alb=mix(alb,vec3f(.50,.47,.40)*(.6+.5*B.h)*(.35+1.4*i.c.r),upf*ss(.35,.65,B.c)*.55);
   alb=mix(alb,vec3f(.05,.17,.07)*(.6+B.h),ss(-70.,-5.,i.wp.y)*ss(.3,.6,big*.6+B.c*.5)*upf*.6);
   if(matT>2.5){ao=mix(.5,1.,ss(.1,.6,hgt))*i.e;}
  }else if(matT>4.5){
   let py=i.wp.y*3.1;let pf=fract(py);let pr=h2(vec2f(floor(py),7.));let fdw=ss(50.,8.,d);
   let grain=textureSample(tDet,sL,vec2f(i.wp.z*.9+pr*5.,i.wp.y*.12+i.wp.x*.05)).g;
   let seamw=ss(.07,.0,pf)+ss(.93,1.,pf);let bz=fract(i.wp.z*.21+pr*3.);let but=ss(.025,0.,bz)*step(.35,pr);
   var wd=mix(vec3f(.46,.31,.18),vec3f(.2,.14,.09),ss(.25,.8,grain))*(.7+.5*pr);
   wd=wd*(1.-(.55*seamw+.4*but)*mix(.3,1.,fdw));
   let pit=ss(.24,.1,length(fract(vec2f(i.wp.z*3.7,py*1.7))-.5))*step(.84,pr);wd=wd*(1.-.65*pit);
   wd=mix(wd,vec3f(.28,.29,.26)*(.55+.5*B.h),ss(.5,.78,B.c)*.28*(.35+.65*ss(.1,.8,n0.y)));
   wd=mix(wd,vec3f(.06,.12,.07),ss(.62,.82,big)*.15*ss(.1,.8,n0.y));
   alb=wd;gloss=.1;
   let dpf=ss(0.,.14,pf)-ss(.86,1.,pf);N=normalize(N+vec3f(0.,dpf*.4*fdw,0.)+vec3f(0.,0.,(grain-.5)*.25*fdw));
  }else{
   let gq=vec2f(i.wp.y*.42,(i.wp.z+i.wp.x*.7)*.16);let gf=abs(fract(gq)-.5);
   let fdd=ss(45.,10.,d);let seam=ss(.485,.5,max(gf.x,gf.y))*mix(.3,.85,fdd)*select(1.,0.,matT>3.5);let riv=ss(.13,.07,length(fract(gq*vec2f(4.,3.))-.5))*(1.-seam)*fdd*select(1.,0.,matT>3.5);
   let rm=min(1.,ss(.22,.46,big*.6+B.c*.5)*M.b.y+seam*.35*M.b.y);
   let st2=textureSample(tDet,sL,vec2f((i.wp.x+i.wp.z)*.45,i.wp.y*.07)).a;
   alb=mix(alb*(.62+.45*Cc.h),vec3f(.50,.19,.06)*(.55+.8*st2),rm);alb=alb*(1.-.3*ss(.2,.05,A.h));
   alb=mix(alb,vec3f(.35,.38,.36)*(.5+B.h),ss(.7,.8,Cc.c)*.2);let rst=step(.62,fract(sin(floor(gq.y*2.)*91.7+floor(gq.x)*13.1)*437.5))*ss(.0,.5,fract(gq.x))*ss(.5,.1,abs(fract(gq.y*2.)-.5)*2.)*fdd;alb=alb*(1.-.3*seam-.16*riv);alb=mix(alb,vec3f(.3,.15,.07)*(.6+.4*alb.g*4.),rst*.22);
   {let Uu=normalize(vec3f(1e-4,1.,0.)-n0*n0.y);let Ww=cross(n0,Uu);let sxg=select(-1.,1.,fract(gq.x)>.5);let syg=select(-1.,1.,fract(gq.y)>.5);let mxl=step(gf.y,gf.x);
    N=normalize(N+(Uu*sxg*mxl+Ww*syg*(1.-mxl))*seam*fdd*.55*M.b.x);}
   alb=mix(alb,vec3f(.72,.7,.62),ss(.80,.9,B.c)*.3);gloss=.14;
  }
 }
 var bh=0.;let dv=clamp(i.l.y/.12,-1.,1.);let pat=M.c.y;
 if(pat>.5&&pat<1.5){alb=alb*mix(.62,1.38,ss(.1,.9,.5-.5*dv));}
 else if(pat>1.5&&pat<2.5){let st=ss(.35,.65,sin(i.l.z*38.+i.l.y*6.));alb=alb*mix(1.,.45,st*ss(-.2,.6,dv));}
 else if(pat>2.5&&pat<3.5){let st=ss(.45,.8,textureSample(tDet,sL,i.l.xz*3.+vec2f(i.l.y*2.)).a);alb=alb*mix(1.05,.6,st);}
 else if(pat>3.5&&pat<4.5){let u=vec2f(i.l.z*62.,atan2(i.l.y,i.l.x)*8.6);let a=fract(u)-.5;let b=fract(u+.5)-.5;let sc=vec2f(1.,1.12);let da=length(a*sc);let db=length(b*sc);let useA=da<db;let d=min(da,db);let cc=select(floor(u+.5),floor(u),useA);let lc=select(b,a,useA);let hv=h2(cc);
  let fwq=fwidth(u.x)+fwidth(u.y);let aa=ss(.5,.14,fwq);let ed=ss(.66,.28,d);let rim=ss(.2,.52,d)*sat1(.55-lc.x*1.6)*.55;
  alb=mix(alb,alb*(mix(.74,1.08,ed)*(.93+.14*hv)+rim*.22),aa);gloss=mix(gloss,.78,ed*.6*aa);bh=(ed*.62+.3*hv-rim*.4)*aa;}
 else if(pat>4.5&&pat<5.5){let n1=textureSample(tDet,sL,i.l.zy*vec2f(9.,9.)+vec2f(i.l.x*4.)).g;let n2=textureSample(tDet,sL,i.l.zy*vec2f(60.,60.)+vec2f(i.l.x*20.)).g;alb=alb*(.8+.4*n1)*(.94+.12*n2);bh=n2*.6+n1*.25;let sc1=ss(.968,.996,abs(sin(i.l.z*23.+i.l.x*95.+n1*3.)))*ss(.66,.78,n1);alb=mix(alb,alb*.6+vec3f(.4,.42,.4),sc1*.32);let cl=ss(.74,.82,n1);let bc=fract(i.l.zy*46.+vec2f(i.l.x*18.))-.5;let br=ss(.42,.2,length(bc))*cl;alb=mix(alb,vec3f(.8,.77,.68)*(.7+.3*n2),br*.85);bh=bh+br*.9;}
 else if(pat>5.5&&pat<6.5){let c=floor(i.l.xz*vec2f(70.,70.)+vec2f(i.l.y*45.));let hv=h2(c);let pu=.5+.5*sin(g.cam.w*(1.4+hv*2.2)+hv*40.);let sp=step(.6,hv)*pu;let hc=h2(c+vec2f(7.,3.));let tcol=mix(vec3f(.34,.12,.1),vec3f(.62,.36,.1),hc);alb=mix(alb,alb*tcol*1.6,sp*.75);let ir=step(.82,h2(c+vec2f(3.,9.)))*(1.-step(.6,hv))*(.5+.5*sin(g.cam.w*.9+hv*30.));alb=alb+vec3f(.03,.16,.2)*ir;bh=sp*.8+ir*.3;}
 let dhx=dpdx(bh);let dhy=dpdy(bh);let px=dpdx(i.wp);let py=dpdy(i.wp);
 if(bh!=0.){let r1=cross(py,N);let r2=cross(N,px);let det=dot(px,r1);if(abs(det)>1e-10){let sg=select(-1.,1.,det>0.);let grad=sg*(dhx*r1+dhy*r2);N=normalize(abs(det)*N-.0032*grad);}}
 let up=N.y*.5+.5;alb=alb*(1.+M.b.z*(.45-.9*up));
 alb=alb+vec3f(.15,.28,.4)*pow(1.-max(dot(N,V),0.),2.)*M.c.z*(.6+.4*sin(N.y*6.+g.cam.w*.5));
 var E=sunE(i.wp.y);if(g.fl.z>.5&&(dm&2u)==0u){E=E*shadowV(i.wp,n0);}
 let ndl=max(dot(N,g.sun.xyz),0.);
 var ca=vec3f(.33);if(g.sun.w>.003&&(dm&1u)==0u){ca=caus(i.wp,d);}
 let dl=E*ndl*(.1+mix(vec3f(.33),ca,ss(.1,.45,dot(n0,g.sun.xyz)))*2.3)+E*M.c.x*(.12+max(-dot(N,g.sun.xyz),0.))*.42;
 var am=vec3f(.1)*ao;if((dm&8u)==0u){am=ambL(i.wp,N)*ao;}
 var col=alb*(dl+am);
 col=col+E*pow(max(dot(N,normalize(V+g.sun.xyz)),0.),mix(10.,70.,gloss))*gloss*ndl*1.6;
 let spot=ss(.5,.92,dot(-V,g.fwd.xyz));let nl=.25+.75*max(dot(N,V),0.);
 let lampk=g.fl.y*(1.-.9*clamp(g.sun.w*1.6,0.,1.));
 let lamp=vec3f(1.,.93,.82)*(2.9/(1.+d*d*.003))*(d*d/(d*d+64.))*spot*nl*lampk;
 col=col+alb*lamp+alb*vec3f(.22,.23,.24)*g.fl.x*(.5+.5*up)*.28;
 if(M.c.x>.05&&(dm&131072u)==0u){let th=pow(max(dot(N,V),0.),.6);let tint=alb*alb*3.;
  col=col+tint*lamp*M.c.x*(.5+1.6*th)+tint*vec3f(.35,.5,.7)*M.c.x*ambL(i.wp,N)*(.4+th)*.9;}
 if(g.so.w>.5){col=col+alb*vec3f(.95,.97,1.)*(.35+.65*max(dot(N,V),0.))*(2.6/(1.+d*d/4500.))*(1.-.9*clamp(g.sun.w*1.6,0.,1.));}
 col=col+vec3f(1.,.95,.85)*M.b.w*pow(max(dot(N,V),0.),18.)*spot*exp(-d*.03)*lampk*(4./(1.+d*d*.003))*(d*d/(d*d+64.));
 {let nvr=dot(n0,V);let rimw=select(0.,pow(1.-clamp(nvr,0.,1.),6.),nvr>.02)*select(1.,0.,(matT>2.5&&matT<3.5)||(dm&1024u)!=0u);
  col=col+alb*(ambL(i.wp,N)*.55+vec3f(1.,.93,.82)*(2.9/(1.+d*d*.003))*spot*lampk*.5)*rimw*.5;}
 col=col*exp(-g.sig.xyz*d)+fogIn(g.cam.xyz,-V,d);
 if((dm&256u)==0u){col=mix(col,fogIn(g.cam.xyz,-V,240.),ss(100.,185.,length((i.wp-g.cam.xyz).xz)));}
 let em=select(i.e,0.,matT>2.5);
 col=col+alb*em*(.65+.35*sin(g.cam.w*3.+i.wp.x*.7+i.wp.z*.5))*exp(-d*.012);
 var al=M.a.w;
 if(M.a.w<.999){let fr=pow(1.-abs(dot(N,V)),2.);al=clamp(M.a.w*(.35+1.1*fr),0.,1.);col=col+alb*fr*.28*(.4+g.fl.y);}
 return vec4f(col,al);
}
`;

// ---- terreno: la grilla de vértices se calcula en la GPU (con el mismo ruido entero que la CPU) ----
const TERR=`struct TU{n:vec4f,f:vec4f};
@group(0) @binding(0) var<uniform> tu:TU;
@group(0) @binding(1) var<storage,read_write> vb:array<f32>;
var<private> KN:array<vec2f,24>=array<vec2f,24>(vec2f(-3000.,0.),vec2f(0.,1.),vec2f(250.,22.),vec2f(850.,28.),vec2f(1300.,110.),vec2f(1500.,115.),vec2f(2300.,330.),vec2f(2450.,335.),vec2f(3100.,600.),vec2f(3500.,605.),vec2f(4600.,1500.),vec2f(4800.,1505.),vec2f(5800.,2600.),vec2f(6400.,2610.),vec2f(7600.,3800.),vec2f(9800.,3900.),vec2f(11000.,4790.),vec2f(11700.,4795.),vec2f(12800.,5600.),vec2f(13800.,5610.),vec2f(15000.,6890.),vec2f(15350.,6895.),vec2f(16400.,8100.),vec2f(40000.,8110.));
var<private> LM:array<vec3f,5>=array<vec3f,5>(vec3f(3300.,0.,70.),vec3f(8200.,0.,130.),vec3f(9500.,0.,70.),vec3f(11300.,0.,170.),vec3f(15150.,0.,90.));
var<private> TS:array<vec4f,6>=array<vec4f,6>(vec4f(0.,.72,.65,.48),vec4f(40.,.58,.55,.46),vec4f(300.,.42,.38,.33),vec4f(2000.,.33,.29,.26),vec4f(6000.,.26,.24,.23),vec4f(8000.,.42,.42,.43));
fn ssg(a:f32,b:f32,x:f32)->f32{let t=clamp((x-a)/(b-a),0.,1.);return t*t*(3.-2.*t);}
fn ih(x:i32,y:i32)->f32{var h=u32(x)*374761393u+u32(y)*668265263u;h=(h^(h>>13u))*1274126177u;h=h^(h>>16u);return f32(h>>8u)/16777216.;}
fn vn(x:f32,y:f32)->f32{let xi=floor(x);let yi=floor(y);let xf=x-xi;let yf=y-yi;let u=xf*xf*(3.-2.*xf);let v=yf*yf*(3.-2.*yf);let ix=i32(xi);let iy=i32(yi);
 return ih(ix,iy)*(1.-u)*(1.-v)+ih(ix+1,iy)*u*(1.-v)+ih(ix,iy+1)*(1.-u)*v+ih(ix+1,iy+1)*u*v;}
fn fbm(x0:f32,y0:f32)->f32{var x=x0;var y=y0;var a=.5;var s=0.;for(var i=0;i<4;i++){s+=a*vn(x,y);x*=2.;y*=2.;a*=.5;}return s;}
fn baseD(x:f32)->f32{if(x<=-3000.){return 0.;}for(var i=0;i<23;i++){let a=KN[i];let b=KN[i+1];if(x<b.x){let t=(x-a.x)/(b.x-a.x);return a.y+(b.y-a.y)*t*t*(3.-2.*t);}}return 8110.;}
fn floorAt(x:f32,z:f32)->f32{
 let b=baseD(x);var n=(5.*(fbm(x*.01,z*.01)-.5)+1.2*(fbm(x*.07+3.,z*.07)-.5))*(1.+b/3000.);
 let rk=ssg(.55,.72,fbm(x*.004+9.,z*.004));let rg=1.-abs(2.*fbm(x*.03,z*.03+7.)-1.);
 n=n+rk*pow(rg,3.)*7.+.12*sin(x*.9+z*.4+fbm(x*.1,z*.1)*6.)*(1.-rk);
 for(var i=0;i<5;i++){let l=LM[i];let d=length(vec2f(x-l.x,z-l.y));if(d<l.z*1.8){n=n*ssg(l.z*.6,l.z*1.8,d);}}
 return max(b+n,.8);
}
fn tcol(d:f32)->vec3f{for(var i=0;i<5;i++){let a=TS[i];let b=TS[i+1];if(d<b.x){let t=(d-a.x)/(b.x-a.x);return mix(a.yzw,b.yzw,t);}}return TS[5].yzw;}
@compute @workgroup_size(8,8) fn main(@builtin(global_invocation_id) id:vec3u){
 if(id.x>=251u||id.y>=251u){return;}
 let i=id.y*251u+id.x;let st=tu.n.z;
 let x=tu.n.x+(f32(id.x)-125.)*st;let z=tu.n.y+(f32(id.y)-125.)*st;
 let df=floorAt(x,z);
 let fx=(floorAt(x+st,z)-floorAt(x-st,z))/(2.*st);let fz=(floorAt(x,z+st)-floorAt(x,z-st))/(2.*st);
 let nn=normalize(vec3f(fx,1.,fz));
 let k=.85+.3*fbm(x*.2,z*.2);let rkm=ssg(1.5,5.,baseD(x)-df)*.75;
 let c0=tcol(df);let c=(c0+(vec3f(.3,.3,.32)-c0)*rkm)*k;
 let av=(floorAt(x-st,z)+floorAt(x+st,z)+floorAt(x,z-st)+floorAt(x,z+st)+floorAt(x-2.*st,z)+floorAt(x+2.*st,z)+floorAt(x,z-2.*st)+floorAt(x,z+2.*st))/8.;
 let ao=clamp(1.-(df-av)*.55,.3,1.);
 let o=i*10u;
 vb[o]=x;vb[o+1u]=-df;vb[o+2u]=z;vb[o+3u]=nn.x;vb[o+4u]=nn.y;vb[o+5u]=nn.z;vb[o+6u]=c.x;vb[o+7u]=c.y;vb[o+8u]=c.z;vb[o+9u]=ao;
}

fn fdf(x:f32,z:f32)->f32{let dd=max(abs(x-tu.f.x),abs(z-tu.f.y));return ssg(tu.f.z,tu.f.z-8.,dd);}
// relieve fino (>=0, queda siempre por encima del terreno grueso): rizos de arena, montículos de bioturbación y guijarros
fn micro(x:f32,z:f32,d0:f32)->vec2f{
 let rk=ssg(.55,.72,fbm(x*.004+9.,z*.004));
 let amp=.03*(1.-ssg(30.,260.,d0))*(1.-rk);
 let ph=(x*.8+z*.6)*8.4+6.*fbm(x*.15,z*.15)+3.*fbm(x*.9+11.,z*.9);
 var h=amp*(.5+.5*sin(ph)+.18*sin(2.*ph+1.))+.03*ssg(60.,300.,d0)*fbm(x*.9+5.,z*.9);
 let dens=.1+.4*rk;var pb=0.;var pid=-1.;
 for(var oy=-1;oy<=1;oy++){for(var ox=-1;ox<=1;ox++){
  let cx=i32(floor(x/.4))+ox;let cz=i32(floor(z/.4))+oy;
  if(ih(cx,cz)>dens){continue;}
  let c=vec2f(f32(cx)+ih(cx+17,cz+5),f32(cz)+ih(cx+3,cz+29))*.4;let r=.09+.13*ih(cx+41,cz+7);
  let d=length(vec2f(x,z)-c)/r;
  if(d<1.){let b=sqrt(max(1.-d*d,0.))*r*.5;if(b>pb){pb=b;pid=ih(cx+9,cz+13);}}}}
 return vec2f(h+pb,pid);}
fn fineH(x:f32,z:f32)->f32{let d0=floorAt(x,z);return d0-micro(x,z,d0).x*fdf(x,z)-.01;}
@compute @workgroup_size(8,8) fn mainF(@builtin(global_invocation_id) id:vec3u){
 if(id.x>=251u||id.y>=251u){return;}
 let i=id.y*251u+id.x;let st=tu.f.z/125.;
 let x=tu.f.x+(f32(id.x)-125.)*st;let z=tu.f.y+(f32(id.y)-125.)*st;
 let d0=floorAt(x,z);let fd=fdf(x,z);let m=micro(x,z,d0);let df=d0-m.x*fd-.01;
 let fx=(fineH(x+st,z)-fineH(x-st,z))/(2.*st);let fz=(fineH(x,z+st)-fineH(x,z-st))/(2.*st);
 let nn=normalize(vec3f(fx,1.,fz));
 let k=.85+.3*fbm(x*.2,z*.2);let rkm=ssg(1.5,5.,baseD(x)-d0)*.75;
 let c0=tcol(d0);var c=(c0+(vec3f(.3,.3,.32)-c0)*rkm)*k;
 if(m.y>=0.){c=mix(c,c*(.5+.6*m.y)+vec3f(.015),smoothstep(0.,.015,m.x)*fd);}
 let g1=1.8;let av=(floorAt(x-g1,z)+floorAt(x+g1,z)+floorAt(x,z-g1)+floorAt(x,z+g1)+floorAt(x-2.*g1,z)+floorAt(x+2.*g1,z)+floorAt(x,z-2.*g1)+floorAt(x,z+2.*g1))/8.;
 let ao=clamp(1.-(d0-av)*.55,.3,1.)*mix(1.,clamp(.82+m.x*6.,.82,1.),fd);
 let o=i*10u;
 vb[o]=x;vb[o+1u]=-df;vb[o+2u]=z;vb[o+3u]=nn.x;vb[o+4u]=nn.y;vb[o+5u]=nn.z;vb[o+6u]=c.x;vb[o+7u]=c.y;vb[o+8u]=c.z;vb[o+9u]=ao;
}
`;

// ---- superficie del agua vista desde abajo ----
// ---- océano: olas de Gerstner gigantes y violentas (mismo juego de olas en CPU para la flotación) ----
// [ángulo, longitud de onda m, amplitud m]
const OWD=[[.30,220,10],[.55,150,7],[-.10,105,4.5],[.80,70,3],[.20,45,1.8],[-.45,30,1.1],[1.0,19,.6],[.10,12,.35],[-.80,7,.18],[.60,4.2,.09]];
const OWQ=.4;
const OCEANF=`const WD=array<vec3f,10>(${OWD.map(w=>`vec3f(${w[0]},${w[1]},${w[2]})`).join(',')});
struct OW{d:vec3f,n:vec3f,j:f32,h:f32};
fn ocean(p0:vec2f,t:f32,lod:f32)->OW{
 var d=vec3f(0.);var xx=0.;var xz=0.;var zz=0.;var yx=0.;var yz=0.;
 for(var i=0;i<10;i++){let w=WD[i];let k=6.28318/w.y;let f=ss(2.*lod,9.*lod,w.y);if(f<=0.){continue;}
  let dr=vec2f(cos(w.x),sin(w.x));let th=k*dot(dr,p0)-sqrt(9.81*k)*t;let c=cos(th);let s=sin(th);let A=w.z*f;let q=${OWQ};
  d+=vec3f(q*A*dr.x*c,A*s,q*A*dr.y*c);
  xx+=q*A*k*dr.x*dr.x*s;xz+=q*A*k*dr.x*dr.y*s;zz+=q*A*k*dr.y*dr.y*s;yx+=A*k*dr.x*c;yz+=A*k*dr.y*c;}
 let Tx=vec3f(1.-xx,yx,-xz);let Tz=vec3f(-xz,yz,1.-zz);
 var o:OW;o.d=d;o.n=normalize(cross(Tz,Tx));o.j=(1.-xx)*(1.-zz)-xz*xz;o.h=d.y;return o;}
`;
const SKYF=`fn h21(p:vec2f)->f32{var q=fract(p*vec2f(123.34,456.21));q+=dot(q,q+45.32);return fract(q.x*q.y);}
fn vn(p:vec2f)->f32{let i=floor(p);let f=fract(p);let u=f*f*(3.-2.*f);return mix(mix(h21(i),h21(i+vec2f(1.,0.)),u.x),mix(h21(i+vec2f(0.,1.)),h21(i+vec2f(1.,1.)),u.x),u.y);}
fn fbm2(p0:vec2f)->f32{var p=p0;var a=.5;var s=0.;for(var i=0;i<5;i++){s+=a*vn(p);p=p*2.03+vec2f(17.1,9.2);a*=.5;}return s;}
fn lightning(t:f32)->f32{let n=floor(t*.13);let u=fract(t*.13);let gate=step(.45,h21(vec2f(n,3.7)));return gate*(ss(0.,.004,u)*(1.-ss(.012,.05,u))+.7*ss(.07,.075,u)*(1.-ss(.09,.14,u)));}
fn skyCol(rd:vec3f,t:f32)->vec3f{
 let y=max(rd.y,0.);var c=mix(vec3f(.62,.68,.72),vec3f(.13,.17,.22),pow(y,.4));
 let cp=rd.xz/(y+.16)*.55+vec2f(t*.02,t*.011);let cl=fbm2(cp)+.35*fbm2(cp*2.7+3.1);let dens=ss(.45,.95,cl);
 let cc=vec3f(.10,.115,.14)*(.6+.9*fbm2(cp*1.7));c=mix(c,cc,dens*(.55+.4*ss(.0,.3,y)));
 let mu=sat1(dot(rd,g.sun.xyz));c+=vec3f(1.,.82,.62)*(pow(mu,6.)*.45*(1.-.7*dens)+pow(mu,400.)*5.*(1.-dens));
 let lf=lightning(t);c+=vec3f(.65,.78,1.)*lf*(.5+1.2*dens)*(.4+.6*y);
 c=mix(c,vec3f(.04,.07,.08),ss(0.,-.12,rd.y));
 return c*1.5;}
`;
const SURF=WC+OCEANF+SKYF+`struct SV{@builtin(position)cp:vec4f,@location(0)wp:vec3f,@location(1)p0:vec2f};
const NA=448u;const NR=256u;const RMAX=3500.;
@vertex fn vs(@builtin(vertex_index) vi:u32)->SV{
 let quad=vi/6u;let c=vi%6u;var cx=array<u32,6>(0u,1u,0u,1u,1u,0u);var cy=array<u32,6>(0u,0u,1u,0u,1u,1u);
 let qi=quad%NA;let qj=quad/NA;
 let a=f32(qi+cx[c])/f32(NA)*6.2831853;let s=f32(qj+cy[c])/f32(NR);
 let r=1.5+RMAX*pow(s,2.2);let lod=max(r*6.2831853/f32(NA),RMAX*2.2*pow(s,1.2)/f32(NR));
 let p0=g.cam.xz+r*vec2f(cos(a),sin(a));let w=ocean(p0,g.cam.w,lod+max(-g.cam.y-15.,0.)*.5);
 var o:SV;o.wp=vec3f(p0.x+w.d.x,w.d.y,p0.y+w.d.z);o.p0=p0;o.cp=g.vp*vec4f(o.wp,1.);return o;}
@vertex fn vsq(@builtin(vertex_index) vi:u32)->SV{
 let q=vec2f(f32(vi&1u),f32(vi>>1u))*2.-1.;var o:SV;let p0=g.cam.xz+q*3500.;o.wp=vec3f(p0.x,0.,p0.y);o.p0=p0;o.cp=g.vp*vec4f(o.wp,1.);return o;}
@fragment fn fs(i:SV)->@location(0) vec4f{
 let t=g.cam.w;let v=i.wp-g.cam.xyz;let d=length(v);let V=v/d;
 let fw=length(fwidth(i.p0))+max(-g.cam.y-15.,0.)*.5;let w=ocean(i.p0,t,fw);var N=w.n;
 let rp=(textureSample(tCau,sL,i.p0/2.9+vec2f(t*.03,0.)).ba+textureSample(tCau,sL,i.p0.yx/8.3+.3).ba*.7)*ss(260.,30.,d);
 N=normalize(N+vec3f(rp.x,0.,rp.y)*.3);
 let nz=textureSample(tDet,sL,i.p0/11.+vec2f(t*.01,0.)).g;let nz2=textureSample(tDet,sL,i.p0/3.3).g;
 let wd=vec2f(.955,.296);let stk=textureSample(tDet,sL,vec2f(dot(i.p0,wd)/70.+t*.004,dot(i.p0,vec2f(-wd.y,wd.x))/6.5)).g;
 let fm=sat1(ss(.7,.05,w.j)*(.6+1.1*nz)+ss(.3,.85,w.h/9.)*ss(.3,.75,nz)*1.1+ss(.62,.9,stk)*ss(-4.,5.,w.h)*.65)*(.75+.25*nz2);
 let top=(u32(g.ex.w)&1048576u)!=0u;
 if(top){
  let ndv=sat1(dot(-V,N));var R=reflect(V,N);R=normalize(vec3f(R.x,max(R.y,.03),R.z));
  let fr=.02+.98*pow(1.-ndv,5.);let sky=skyCol(R,t);
  let sm=sat1(dot(R,g.sun.xyz));let glit=SUNC*(pow(sm,700.)*60.+pow(sm,60.)*.8)*(1.-.5*fm);
  let body=mix(vec3f(.006,.035,.045),vec3f(.03,.20,.17),ss(-6.,10.,w.h)*.7);
  let sss=pow(sat1(dot(V,g.sun.xyz)*.5+.5),4.)*ss(0.,12.,w.h)*vec3f(.05,.42,.32)*1.4;
  var c=mix(body+sss,sky,fr)+glit*fr*4.;
  let hz=skyCol(normalize(vec3f(V.x,.02,V.z)),t);
  c=mix(c,vec3f(.78,.84,.88)*(.5+.25*sky.y*3.)*(.7+.3*nz),fm*.85);
  let spr=ss(3.,9.5,w.h)*(.35+.65*ss(.45,.85,stk))*ss(.3,.8,nz2)*(.5+.5*nz)*ss(12.,90.,d);
  c=mix(c,vec3f(.72,.78,.82)*(.42+.2*sky.y*3.),sat1(spr)*.4);
  c=mix(c,hz,1.-exp(-d/1900.));
  return vec4f(c,1.);}
 // vista desde abajo: ventana de Snell con la forma real de las olas
 let s=vec2f(N.x,N.z)/(.8*max(N.y,.25))+(textureSampleLevel(tCau,sL,i.wp.xz/13.,0.).ba+textureSampleLevel(tCau,sL,i.wp.zx/4.7+.2,0.).ba*.7)*ss(150.,25.,d)*.5;
 let n=normalize(vec3f(-s.x*.8,-1.,-s.y*.8));let ci=sat1(dot(V,-n));let k=1.-1.769*(1.-ci*ci);let win=ss(0.,.22,k);
 let rr=refract(V,n,1.33);let sd=max(dot(rr,g.sun.xyz),0.);let fr=pow(1.-sqrt(max(k,0.)),5.);
 let skc=skyCol(normalize(vec3f(rr.x,max(rr.y,.06),rr.z)),t)*vec3f(.42,.86,1.05);
 let sky=(skc*clamp(1.+2.4*(s.x*.6-s.y*.8),.3,2.4)*.95+vec3f(1.,.95,.85)*(pow(sd,500.)*5.))*(1.-fr);
 let tir=fogIn(i.wp,reflect(V,n),300.)*1.15+vec3f(.01,.05,.07)*.5;var c=mix(tir,sky,win);
 let br=sat1(g.sun.w*9.)*.55+.45;let bub=sat1(fm*(.5+.8*nz2)+ss(.55,.9,nz)*ss(0.,6.,w.h+8.)*.25);
 c=mix(c,vec3f(.62,.86,.96)*br*(1.1+.5*sky.y),bub*.55);
 return vec4f(c*exp(-g.sig.xyz*d)+fogIn(g.cam.xyz,V,d),1.);
}
`;

// ---- nieve marina: partículas que acompañan al submarino ----
const SNOW=WC+`struct SO{@builtin(position)cp:vec4f,@location(0)uv:vec2f,@location(1)a:f32};
fn h3(n:u32)->f32{var h=n*747796405u+2891336453u;h=((h>>((h>>28u)+4u))^h)*277803737u;h=(h>>22u)^h;return f32(h&16777215u)/16777216.;}
@vertex fn vs(@builtin(vertex_index) vi:u32,@builtin(instance_index) ii:u32)->SO{
 var o:SO;let t=g.cam.w;let pos=vec3f(h3(ii*3u)*80.,h3(ii*3u+1u)*80.,h3(ii*3u+2u)*80.);
 var p=pos;p.y=p.y-t*.35;p.x=p.x+sin(t*.3+pos.z)*.6;
 let c=g.cam.xyz;p=fract((p-c+vec3f(40.))/80.)*80.-vec3f(40.);
 let wp=p+c;let d=length(p);let cp0=g.vp*vec4f(wp,1.);
 let sz=clamp(110./max(d,.1),1.,5.);let q=vec2f(f32(vi&1u),f32(vi>>1u))*2.-1.;
 o.cp=vec4f(cp0.xy+q*sz*vec2f(2.,2.)*g.res.zw*cp0.w*.5,cp0.zw);o.uv=q;
 let sp=ss(.5,.92,dot(normalize(p),g.fwd.xyz));
 o.a=.5*(g.sun.w*.8+g.fl.x*.35+sp*g.fl.y*exp(-d*.05));return o;}
@fragment fn fs(i:SO)->@location(0) vec4f{let d=length(i.uv);if(d>1.){discard;}let a=i.a*(1.-d);return vec4f(vec3f(.85,.95,1.)*a,a);}
`;

// ---- conos de luz de los focos del submarino ----
const CONE=WC+`struct CI{@location(0)p:vec3f,@location(1)n:vec3f,@location(2)t:f32};
struct CO{@builtin(position)cp:vec4f,@location(0)n:vec3f,@location(1)v:vec3f,@location(2)t:f32};
@vertex fn vs(i:CI,@builtin(instance_index) ii:u32)->CO{
 let sx=select(-.7,.7,ii==1u);let ang=-sx*.04;let ca=cos(ang);let sa=sin(ang);
 let lp=vec3f(i.p.x*ca+i.p.z*sa+sx,i.p.y-.5,-i.p.x*sa+i.p.z*ca);
 let ln=vec3f(i.n.x*ca+i.n.z*sa,i.n.y,-i.n.x*sa+i.n.z*ca);
 let wp=g.cam.xyz+g.rr.xyz*lp.x+g.uu.xyz*lp.y-g.ff.xyz*lp.z;
 let nw=g.rr.xyz*ln.x+g.uu.xyz*ln.y-g.ff.xyz*ln.z;
 var o:CO;o.cp=g.vp*vec4f(wp,1.);o.n=nw;o.v=g.cam.xyz-wp;o.t=i.t;return o;}
@fragment fn fs(i:CO)->@location(0) vec4f{
 let e0=ss(.05,.7,abs(dot(normalize(i.n),normalize(i.v))));
 let a=g.fl.y*e0*e0*pow(max(1.-i.t,0.),1.6)*(.06+.1*(1.-g.sun.w))*ss(0.,.08,i.t)*select(1.,.2,g.ex.x>11.&&(u32(g.ex.w)&65536u)==0u);
 return vec4f(vec3f(.7,.9,1.)*a,a);}
`;

// ---- pasadas de pantalla completa ----
const VQ=`@vertex fn vs(@builtin(vertex_index) i:u32)->@builtin(position) vec4f{return vec4f(f32(i32(i&1u)*4-1),f32(i32(i>>1u)*4-1),0.,1.);}
`;
const P_CAU=WC+VQ+`const TAU=6.2831853;
var<private> WK:array<vec3f,8>=array<vec3f,8>(vec3f(1.,2.,1.),vec3f(-2.,1.,.9),vec3f(3.,1.,.6),vec3f(1.,-4.,.5),vec3f(4.,3.,.4),vec3f(-3.,5.,.32),vec3f(6.,-2.,.28),vec3f(5.,7.,.2));
fn caus1(uv:vec2f,t:f32)->f32{let p=uv*TAU;var i=p;var c=0.;
 for(var n=1;n<=5;n++){let tt=t*(1.-3.5/f32(n));i=p+vec2f(cos(tt-i.x)+sin(tt+i.y),sin(tt-i.y)+cos(tt+i.x));let s=sin(i.x+tt);let k=cos(i.y+tt);c+=abs(s*k)/(1.25*sqrt(s*s+k*k)+1e-4);}
 c=1.17-pow(max(c/5.,0.),1.4);return pow(abs(c),8.);}
@fragment fn fs(@builtin(position) fc:vec4f)->@location(0) vec4f{
 let uv=fc.xy/256.;let t=g.cam.w;let c1=caus1(uv,t*.45+23.);let c2=caus1(uv.yx*2.+.31,t*.37+5.);
 let wu=uv+.02*vec2f(sin(TAU*(uv.y*2.+.1*t)),cos(TAU*(uv.x*3.-.07*t)));var s=vec2f(0.);
 for(var i=0;i<8;i++){let k=WK[i];s+=k.xy*k.z*cos(dot(k.xy,wu)*TAU+t*(.5+.35*sqrt(length(k.xy)))*select(-1.,1.,(i&1)==0)+f32(i)*1.7);}
 return vec4f(c1,c2,s*.06);}
`;
const P_DET=WC+VQ+`fn hp(p0:vec2f,per:f32)->f32{let p=p0-per*floor(p0/per);var q=vec2u(vec2i(floor(p+.5)));q=q*vec2u(1664525u,1013904223u)+vec2u(u32(per)*2654435761u,u32(per)*374761393u);
 q.x+=q.y*1664525u;q.y+=q.x*1013904223u;q=q^(q>>vec2u(16u));q.x+=q.y*1664525u;q.y+=q.x*1013904223u;q=q^(q>>vec2u(16u));return f32(q.x>>8u)/16777216.;}
fn tn(p:vec2f,per:f32)->f32{let i=floor(p);let f=fract(p);let u=f*f*(3.-2.*f);return mix(mix(hp(i,per),hp(i+vec2f(1.,0.),per),u.x),mix(hp(i+vec2f(0.,1.),per),hp(i+vec2f(1.,1.),per),u.x),u.y);}
fn tf(uv:vec2f,per:f32,n:i32)->f32{var a=.5;var s=0.;var pr=per;var tot=0.;for(var i=0;i<8;i++){if(i>=n){break;}s+=a*tn(uv*pr+f32(i)*7.3,pr);tot+=a;pr*=2.;a*=.5;}return s/tot;}
fn wor(p:vec2f,per:f32)->vec3f{let i=floor(p);let f=fract(p);var d=vec2f(9.);var id=0.;
 for(var x=-1;x<=1;x++){for(var y=-1;y<=1;y++){let o=vec2f(f32(x),f32(y));let c=i+o;let cw=c-per*floor(c/per);let hh=vec2f(hp(cw,per),hp(cw+17.,per+1.));let r=o+hh-f;let l=dot(r,r);if(l<d.x){d.y=d.x;d.x=l;id=hp(cw+3.,per+2.);}else if(l<d.y){d.y=l;}}}
 return vec3f(sqrt(d),id);}
fn Hf(uv:vec2f)->f32{let wq=uv+.11*(vec2f(tf(uv,3.,4),tf(uv+.5,3.,4))-.5);let f=tf(wq,3.,7);let rg=1.-abs(tf(wq+1.7,5.,5)*2.-1.);
 let w=wor(wq*17.,17.);let edge=smoothstep(0.,.09,w.y-w.x);let pt=wor(wq*31.+3.,31.);let pit=(1.-smoothstep(0.,.3,pt.x))*step(.6,pt.z);
 return f*.5+rg*rg*.22+edge*.022-pit*.08;}
@fragment fn fs(@builtin(position) fc:vec4f)->@location(0) vec4f{
 let uv=fc.xy/512.;let e=1./512.;let h=Hf(uv);
 let gx=Hf(uv+vec2f(e,0.))-Hf(uv-vec2f(e,0.));let gy=Hf(uv+vec2f(0.,e))-Hf(uv-vec2f(0.,e));
 let s=clamp(vec2f(gx,gy)*512.*.5*.07,vec2f(-1.),vec2f(1.));
 return vec4f(-s*.5+.5,h,tf(uv+3.7,3.,5));}
`;
const P_BLIT=WC+VQ+`@group(1) @binding(0) var tIn:texture_2d<f32>;
@fragment fn fs(@builtin(position) fc:vec4f)->@location(0) vec4f{let dim=vec2f(textureDimensions(tIn));return textureSampleLevel(tIn,sK,fc.xy*2./dim,0.);}
`;
const P_DEPTH=(ms)=>WC+VQ+`@group(1) @binding(0) var tZ:texture_depth${ms?'_multisampled':''}_2d;
@fragment fn fs(@builtin(position) fc:vec4f)->@location(0) vec4f{return vec4f(textureLoad(tZ,vec2i(fc.xy),0),0.,0.,1.);}
`;
const P_RAYS=WC+VQ+`@group(1) @binding(0) var tZ:texture_2d<f32>;
fn vlH(p:vec3f)->f32{var q=fract(p*vec3f(.1031,.1030,.0973));q+=dot(q,q.yzx+33.33);return fract((q.x+q.y)*q.z);}
fn vlN(p:vec3f)->f32{let i=floor(p);let f=fract(p);let u=f*f*(3.-2.*f);
 let a=mix(mix(vlH(i),vlH(i+vec3f(1.,0.,0.)),u.x),mix(vlH(i+vec3f(0.,1.,0.)),vlH(i+vec3f(1.,1.,0.)),u.x),u.y);
 let b=mix(mix(vlH(i+vec3f(0.,0.,1.)),vlH(i+vec3f(1.,0.,1.)),u.x),mix(vlH(i+vec3f(0.,1.,1.)),vlH(i+vec3f(1.,1.,1.)),u.x),u.y);return mix(a,b,u.z);}
fn vlHG(c:f32,k:f32)->f32{let k2=k*k;return (1.-k2)/(12.566*pow(1.+k2-2.*k*c,1.5));}
fn lampVol(ro:vec3f,rd:vec3f,tmax:f32,nSt:i32,jt:f32)->vec3f{
 var acc=vec3f(0.);let ld=normalize(g.ff.xyz);
 for(var s=0;s<40;s++){if(s>=nSt){break;}
  let u0=(f32(s)+jt)/f32(nSt);let u1=(f32(s)+1.+jt)/f32(nSt);let t=tmax*u0*u0;let dt=tmax*(u1*u1-u0*u0);let p=ro+rd*t;
  let dn=.25+.55*vlN(p*.42+vec3f(0.,g.cam.w*.06,0.))+2.2*pow(vlN(p*1.9+vec3f(3.,g.cam.w*.1,7.)),3.);
  var li=0.;
  for(var k=0;k<2;k++){let sx=select(-.7,.7,k==1);let Lp=ro+g.rr.xyz*sx-g.uu.xyz*.5;
   let lv=p-Lp;let dist=max(length(lv),.4);let dv=lv/dist;let cone=smoothstep(.95,.98,dot(dv,ld));
   let att=exp(-dot(g.sig.xyz,vec3f(.33))*dist)/(1.+dist*dist*.02);
   let ph=mix(.3,vlHG(-dot(dv,rd),.5)*6.,.5);
   li+=cone*att*ph;}
  acc+=vec3f(1.,.93,.82)*li*dn*dt;}
 return acc*.03*g.fl.y*(1.-.9*clamp(g.sun.w*1.6,0.,1.));}
@fragment fn fs(@builtin(position) fc:vec4f)->@location(0) vec4f{
 if((u32(g.ex.w)&1048576u)!=0u){return vec4f(0.,0.,0.,1.);}
 let uv=fc.xy*2.*g.res.zw;let nd=vec2f(uv.x*2.-1.,1.-uv.y*2.);
 let rv=g.ff.xyz+g.rr.xyz*(nd.x*g.pp.x)+g.uu.xyz*(nd.y*g.pp.y);let rl=length(rv);let rd=rv/rl;
 let dd=textureLoad(tZ,vec2i(fc.xy*2.),0).x;let vz=g.pp.w*g.pp.z/(g.pp.w-dd*(g.pp.w-g.pp.z));
 var tm=min(vz*rl,120.);if(rd.y>1e-4){tm=min(tm,-g.cam.y/rd.y);}
 var vc=vec3f(0.);
 if(g.ex.x>11.&&g.fl.y>.01&&(u32(g.ex.w)&65536u)==0u&&tm>0.){vc=lampVol(g.cam.xyz,rd,min(tm,70.),i32(g.ex.x*1.1),ign(fc.xy+vec2f(g.cam.w*60.,0.)));}
 if(g.cam.y<-260.||tm<=0.){return vec4f(vc,1.);}
 let ns0=i32(g.ex.x);let ns=max(4,min(ns0,i32(ceil(f32(ns0)*tm/70.))));var acc=vec3f(0.);let dt=tm/f32(ns);let j=ign(fc.xy);
 for(var n=0;n<18;n++){
  if(n>=ns){break;}
  let t=(f32(n)+j)*dt;let p=g.cam.xyz+rd*t;let q=p.xz-g.sun.xz*(p.y/g.sun.y);
  let pat=ss(.3,.7,textureSampleLevel(tCau,sL,q/27.,0.).g)*ss(.15,.6,textureSampleLevel(tCau,sL,q.yx/11.+.3,0.).g);
  var vis=1.;
  if(g.fl.z>.5){let s4=g.shm*vec4f(p,1.);let q3=s4.xyz/s4.w;let uvs=vec2f(q3.x*.5+.5,.5-q3.y*.5);
   if(uvs.x>.01&&uvs.x<.99&&uvs.y>.01&&uvs.y<.99&&q3.z<1.){vis=textureSampleCompareLevel(tSh,sC,uvs,q3.z-.004);}}
  acc=acc+exp(-g.sig.xyz*t+g.kd.xyz*(p.y/g.sun.y))*(.012+pat*6.)*(.06+.94*vis);
 }
 let mu=max(dot(rd,g.sun.xyz),0.);let ph=.2+2.*mu*mu*mu;
 return vec4f(min(acc*dt*g.sig.xyz*WCOL*SUNC*ph*g.ex.y,vec3f(20.))+vc,1.);}
`;
const P_KAR=WC+VQ+`@group(1) @binding(0) var tIn:texture_2d<f32>;
fn kar(c0:vec3f)->vec4f{var c=max(c0,vec3f(0.));if(!(dot(c,c)<1e8)){c=vec3f(0.);}let w=1./(1.+max(c.r,max(c.g,c.b)));return vec4f(c*w,w);}
@fragment fn fs(@builtin(position) fc:vec4f)->@location(0) vec4f{
 let dim=vec2f(textureDimensions(tIn));let uv=fc.xy*2./dim;let e=1./dim;
 let m=kar(min(textureSampleLevel(tIn,sK,uv+e*vec2f(-1.,-1.),0.).rgb,vec3f(24.)))+kar(min(textureSampleLevel(tIn,sK,uv+e*vec2f(1.,-1.),0.).rgb,vec3f(24.)))
  +kar(min(textureSampleLevel(tIn,sK,uv+e*vec2f(-1.,1.),0.).rgb,vec3f(24.)))+kar(min(textureSampleLevel(tIn,sK,uv+e*vec2f(1.,1.),0.).rgb,vec3f(24.)));
 return vec4f(m.rgb/m.a,1.);}
`;
const P_DOWN=WC+VQ+`@group(1) @binding(0) var tIn:texture_2d<f32>;
@fragment fn fs(@builtin(position) fc:vec4f)->@location(0) vec4f{
 let dim=vec2f(textureDimensions(tIn));let uv=fc.xy*2./dim;let e=1./dim;
 return (textureSampleLevel(tIn,sK,uv+e*vec2f(-1.,-1.),0.)+textureSampleLevel(tIn,sK,uv+e*vec2f(1.,-1.),0.)+textureSampleLevel(tIn,sK,uv+e*vec2f(-1.,1.),0.)+textureSampleLevel(tIn,sK,uv+e*vec2f(1.,1.),0.))*.25;}
`;
const P_UP=WC+VQ+`@group(1) @binding(0) var tIn:texture_2d<f32>;
@fragment fn fs(@builtin(position) fc:vec4f)->@location(0) vec4f{
 let dim=vec2f(textureDimensions(tIn));let uv=fc.xy*.5/dim;let e=.75/dim;
 let c=(textureSampleLevel(tIn,sK,uv+e*vec2f(-1.,-1.),0.).rgb+textureSampleLevel(tIn,sK,uv+e*vec2f(1.,-1.),0.).rgb+textureSampleLevel(tIn,sK,uv+e*vec2f(-1.,1.),0.).rgb+textureSampleLevel(tIn,sK,uv+e*vec2f(1.,1.),0.).rgb)*.25;
 return vec4f(c,1.);}
`;
const P_FIN=WC+VQ+`@group(1) @binding(0) var tS:texture_2d<f32>;
@group(1) @binding(1) var tR:texture_2d<f32>;
@group(1) @binding(2) var tB:texture_2d<f32>;
@group(1) @binding(3) var tZ:texture_2d<f32>;
@group(1) @binding(4) var tB1:texture_2d<f32>;
@group(1) @binding(5) var tB2:texture_2d<f32>;
fn tmap(x:vec3f)->vec3f{return clamp((x*(2.51*x+.03))/(x*(2.43*x+.59)+.14),vec3f(0.),vec3f(1.));}
fn crom(uv:vec2f)->vec3f{let sz=vec2f(textureDimensions(tS));let p=uv*sz;let tc=floor(p-.5)+.5;let f=p-tc;
 let w0=f*(-.5+f*(1.-.5*f));let w1=1.+f*f*(-2.5+1.5*f);let w2=f*(.5+f*(2.-1.5*f));let w3=f*f*(-.5+.5*f);
 let w12=w1+w2;let t0=(tc-1.)/sz;let t3=(tc+2.)/sz;let t12=(tc+w2/w12)/sz;
 var r=textureSampleLevel(tS,sK,vec2f(t12.x,t0.y),0.).rgb*(w12.x*w0.y)+textureSampleLevel(tS,sK,vec2f(t0.x,t12.y),0.).rgb*(w0.x*w12.y)+textureSampleLevel(tS,sK,t12,0.).rgb*(w12.x*w12.y)+textureSampleLevel(tS,sK,vec2f(t3.x,t12.y),0.).rgb*(w3.x*w12.y)+textureSampleLevel(tS,sK,vec2f(t12.x,t3.y),0.).rgb*(w12.x*w3.y);
 return max(r,vec3f(0.));}
@fragment fn fs(@builtin(position) fc:vec4f)->@location(0) vec4f{
 let uv=fc.xy*g.cv.zw;var c=select(textureSampleLevel(tS,sK,uv,0.).rgb,crom(uv),g.res.x/g.cv.x<.98);
 if(g.so.z>.004){let dv=(uv-.5)*g.so.z*.03;c=vec3f(textureSampleLevel(tS,sK,uv+dv,0.).r,c.g,textureSampleLevel(tS,sK,uv-dv,0.).b);}
 {let rr=g.res.x/g.cv.x;let amt=clamp((1.-rr)*1.1,0.,.4);
  if(amt>.01){let e=1./vec2f(textureDimensions(tS));
   let n1=textureSampleLevel(tS,sK,uv+vec2f(e.x,0.),0.).rgb;let n2=textureSampleLevel(tS,sK,uv-vec2f(e.x,0.),0.).rgb;let n3=textureSampleLevel(tS,sK,uv+vec2f(0.,e.y),0.).rgb;let n4=textureSampleLevel(tS,sK,uv-vec2f(0.,e.y),0.).rgb;
   let bl=(n1+n2+n3+n4)*.25;let mn=min(c,min(min(n1,n2),min(n3,n4)));let mx=max(c,max(max(n1,n2),max(n3,n4)));
   c=mix(c,clamp(c+(c-bl)*1.4,mn*.92,mx*1.08),amt);}}
 let nd=vec2f(uv.x*2.-1.,1.-uv.y*2.);let rd=normalize(g.ff.xyz+g.rr.xyz*(nd.x*g.pp.x)+g.uu.xyz*(nd.y*g.pp.y));
 let zd=textureLoad(tZ,vec2i(uv*vec2f(textureDimensions(tZ))),0).x;
 if(zd>.99999&&(u32(g.ex.w)&128u)!=0u){c=c+fogIn(g.cam.xyz,rd,240.);}
 {let tier=select(select(0,1,(u32(g.ex.w)&4096u)!=0u),2,(u32(g.ex.w)&8192u)!=0u);
  if(tier>0&&zd<.99999&&(u32(g.ex.w)&2048u)==0u){
   let zs=vec2f(textureDimensions(tZ));let ip=vec2i(uv*zs);let vz=g.pp.w*g.pp.z/(g.pp.w-zd*(g.pp.w-g.pp.z));
   let rad=clamp(.9*(zs.y*.5/g.pp.y)/vz,2.,26.);let nT=select(16,28,tier==2);let ang0=ign(fc.xy)*6.2832;var occ=0.;
   for(var i=0;i<28;i++){if(i>=nT){break;}
    let a=ang0+f32(i)*2.39996;let r=rad*(.25+.75*sqrt((f32(i)+.5)/f32(nT)));let o=vec2i(vec2f(cos(a),sin(a))*r);
    let zt=textureLoad(tZ,clamp(ip+o,vec2i(0),vec2i(zs)-1),0).x;let vt=g.pp.w*g.pp.z/(g.pp.w-zt*(g.pp.w-g.pp.z));
    let df=vz-vt;occ+=smoothstep(.04,.25,df)*(1.-smoothstep(.8,2.5,df));}
   c=c*(1.-.6*occ/f32(nT));}}

 {let tr=select(select(0,1,(u32(g.ex.w)&4096u)!=0u),2,(u32(g.ex.w)&8192u)!=0u);
  if(tr>0&&(u32(g.ex.w)&262144u)==0u){
   let zs=vec2f(textureDimensions(tZ));let ip=vec2i(uv*zs);let ff=max(g.fo.x,.8);
   let vzC=select(g.pp.w*g.pp.z/(g.pp.w-zd*(g.pp.w-g.pp.z)),400.,zd>.99999);
   let rmax=g.fo.y;let coc=clamp(abs(vzC-ff)/max(vzC,.5)*1.0,0.,1.)*rmax;
   if(coc>.6){let nT=select(20,36,tr==2);let ang0=ign(fc.xy+17.)*6.2832;var acc=c*1.;var wsum=1.;
    for(var i=0;i<36;i++){if(i>=nT){break;}
     let a=ang0+f32(i)*2.39996;let r=coc*sqrt((f32(i)+.5)/f32(nT));let o=vec2f(cos(a),sin(a))*r;
     let q=clamp(ip+vec2i(o*(zs.y/g.cv.y)),vec2i(0),vec2i(zs)-1);let zt=textureLoad(tZ,q,0).x;
     let vt=select(g.pp.w*g.pp.z/(g.pp.w-zt*(g.pp.w-g.pp.z)),400.,zt>.99999);
     let ct=clamp(abs(vt-ff)/max(vt,.5)*1.0,0.,1.)*rmax;
     let wt=select(0.,1.,ct>=r*.7)*select(.15,1.,vt>=vzC*.8);
     acc+=textureSampleLevel(tS,sK,uv+o*g.cv.zw,0.).rgb*wt;wsum+=wt;}
    c=acc/wsum;}}}
 if((u32(g.ex.w)&(4096u|8192u))!=0u&&(u32(g.ex.w)&524288u)==0u){
  var st=vec3f(0.);let e=vec2f(1.,0.);
  for(var k=1;k<=6;k++){let kk=f32(k);let wk=exp(-kk*.42);st+=(textureSampleLevel(tB,sK,uv+e*kk*.018,0.).rgb+textureSampleLevel(tB,sK,uv-e*kk*.018,0.).rgb)*wk;}
  c=c+st*vec3f(.55,.8,1.)*.045;
  let dsp=(uv-.5)*.012;c=c+vec3f(textureSampleLevel(tB,sK,uv+dsp,0.).r-textureSampleLevel(tB,sK,uv,0.).r,0.,textureSampleLevel(tB,sK,uv-dsp,0.).b-textureSampleLevel(tB,sK,uv,0.).b)*.35;}
 c=c+textureSampleLevel(tR,sK,uv,0.).rgb;
 let bl=textureSampleLevel(tB,sK,uv,0.).rgb*.45+textureSampleLevel(tB1,sK,uv,0.).rgb*.35+textureSampleLevel(tB2,sK,uv,0.).rgb*.3;c=mix(c,bl,.07)+bl*.035;
 c=c*g.ex.z;let q=uv-.5;c=c*(1.-dot(q,q)*.9);
 if(g.so.x>0.&&zd<.99999){
  let rv=g.ff.xyz+g.rr.xyz*(nd.x*g.pp.x)+g.uu.xyz*(nd.y*g.pp.y);
  let vz=g.pp.w*g.pp.z/(g.pp.w-zd*(g.pp.w-g.pp.z));let wp=g.cam.xyz+rv*vz;let dist=vz*length(rv);
  let behind=g.so.x-dist;
  let front=exp(-behind*behind/3.);
  let tail=select(0.,exp(-behind/14.),behind>0.)*smoothstep(0.,2.,behind);
  let gp=abs(fract(wp*.5)-.5);let ln=1.-smoothstep(.0,.06,min(min(gp.x,gp.y),gp.z));
  let fade=g.so.y;
  let e=(front*2.2+tail*(.18+.5*ln))*fade;
  c=c+vec3f(.10,1.,.45)*e*.9;
 }
 if((u32(g.ex.w)&1048576u)!=0u){
  let asp=g.res.x/g.res.y;let ru=vec2f(uv.x*asp,uv.y);var rn=0.;
  for(var L=0;L<3;L++){let fl=f32(L);let dens=60.+fl*55.;let q=vec2f(ru.x+ru.y*.18,ru.y*(1.+fl*.25));let col=floor(q.x*dens);let h=fract(sin(col*12.9898+fl*78.233)*43758.5453);
   let xx=abs(fract(q.x*dens)-.5);let yy=fract(q.y*(1.1+fl*.3)+g.cam.w*(1.8+fl*.9)*(.6+.4*h)+h*9.);
   rn+=ss(.12,.0,xx)*ss(.16-fl*.03,0.,yy)*step(.55-fl*.06,h)*(.5-fl*.1);}
  c=c+vec3f(.55,.62,.7)*rn*.28*g.ex.z;
 }
 c=tmap(c);
 let l0=dot(c,vec3f(.2126,.7152,.0722));let l=mix(l0,l0*l0*(3.-2.*l0),.5);c=c*(l/max(l0,1e-4));c=mix(vec3f(l),c,.95);
 c=pow(max(c,vec3f(0.)),vec3f(1./2.2));
 let n=ign(fc.xy)+ign(fc.xy+37.)-1.;let gr=fract(sin(dot(uv*1000.,vec2f(12.9898,78.233))+g.cam.w)*43758.5453)-.5;
 return vec4f(c+vec3f(n/255.+gr*.012),1.);}
`;

const BGF=WC+SKYF+`@vertex fn vs(@builtin(vertex_index) i:u32)->@builtin(position) vec4f{return vec4f(f32(i32(i&1u)*4-1),f32(i32(i>>1u)*4-1),0.,1.);}
@fragment fn fs(@builtin(position) fc:vec4f)->@location(0) vec4f{
 let uv=fc.xy/g.res.xy;let nd=vec2f(uv.x*2.-1.,1.-uv.y*2.);let rd=normalize(g.ff.xyz+g.rr.xyz*(nd.x*g.pp.x)+g.uu.xyz*(nd.y*g.pp.y));
 if((u32(g.ex.w)&128u)!=0u){return vec4f(0.,0.,0.,1.);}
 if((u32(g.ex.w)&1048576u)!=0u){return vec4f(skyCol(rd,g.cam.w),1.);}
 return vec4f(fogIn(g.cam.xyz,rd,240.),1.);}
`;
const P_TAA=WC+VQ+`struct TU{pvp:mat4x4f,j:vec4f,r:vec4f};
@group(1) @binding(0) var<uniform> tu:TU;
@group(1) @binding(1) var tC:texture_2d<f32>;
@group(1) @binding(2) var tH:texture_2d<f32>;
@group(1) @binding(3) var tZ:texture_2d<f32>;
@fragment fn fs(@builtin(position) fc:vec4f)->@location(0) vec4f{
 let ip=vec2i(fc.xy);let dim=vec2f(textureDimensions(tC));let uv=fc.xy/dim;
 let cur=textureLoad(tC,ip,0).rgb;
 if(tu.r.x<.5){return vec4f(cur,1.);}
 var mn=cur;var mx=cur;var m1=vec3f(0.);var m2=vec3f(0.);
 for(var y=-1;y<=1;y++){for(var x=-1;x<=1;x++){let q=clamp(ip+vec2i(x,y),vec2i(0),vec2i(dim)-vec2i(1));let s=textureLoad(tC,q,0).rgb;mn=min(mn,s);mx=max(mx,s);m1+=s;m2+=s*s;}}
 let mu=m1/9.;let sg=sqrt(max(m2/9.-mu*mu,vec3f(0.)));mn=max(mn,mu-1.1*sg);mx=min(mx,mu+1.1*sg);mn=min(mn,cur);mx=max(mx,cur);
 let zd=textureLoad(tZ,ip,0).x;
 let nd=vec2f(uv.x*2.-1.,1.-uv.y*2.)-tu.j.xy;
 let rv=g.ff.xyz+g.rr.xyz*(nd.x*g.pp.x)+g.uu.xyz*(nd.y*g.pp.y);
 var vz=g.pp.w*g.pp.z/(g.pp.w-zd*(g.pp.w-g.pp.z));if(zd>.99999){vz=400.;}
 let pc=tu.pvp*vec4f(g.cam.xyz+rv*vz,1.);
 if(pc.w<=.001){return vec4f(cur,1.);}
 let pn=pc.xy/pc.w;let puv=vec2f(pn.x*.5+.5,.5-pn.y*.5);
 if(any(puv<vec2f(0.))||any(puv>vec2f(1.))){return vec4f(cur,1.);}
 let h=clamp(textureSampleLevel(tH,sK,puv,0.).rgb,mn,mx);
 let a=mix(.25,.75,clamp(length((puv-uv)*dim)/2.,0.,1.));
 return vec4f(mix(h,cur,a),1.);}
`;
const PUFF=WC+`struct PO{@builtin(position)cp:vec4f,@location(0)uv:vec2f,@location(1)col:vec4f,@location(2)s:f32};
fn hh(p:vec2f)->f32{return fract(sin(dot(p,vec2f(127.1,311.7)))*43758.5453);}
fn nz(p:vec2f)->f32{let i=floor(p);let f=fract(p);let w=f*f*(3.-2.*f);return mix(mix(hh(i),hh(i+vec2f(1,0)),w.x),mix(hh(i+vec2f(0,1)),hh(i+vec2f(1,1)),w.x),w.y);}
@vertex fn vs(@builtin(vertex_index) vi:u32,@location(0) pb:vec4f)->PO{
 var o:PO;let age=g.cam.w-pb.w;let k=clamp(age/7.,0.,1.);let q=vec2f(f32(vi&1u),f32(vi>>1u))*2.-1.;let sz=(.45+age*.6)*(.7+.6*fract(pb.w*13.7));
 let wp=pb.xyz+vec3f(sin(pb.w*7.)*.1*age,.12*age*(1.-k),cos(pb.w*5.)*.1*age)+(g.rr.xyz*q.x+g.uu.xyz*q.y)*sz;
 let tc=g.cam.xyz-pb.xyz;let d=length(tc);let V=tc/max(d,.001);
 let spot=ss(.3,.9,dot(-V,g.fwd.xyz));
 let lamp=vec3f(1.,.93,.82)*(2.9/(1.+d*d*.003))*spot*g.fl.y*(1.-.9*clamp(g.sun.w*1.6,0.,1.))*.5;
 var c=vec3f(.46,.42,.35)*(sunE(pb.y)*.8+lamp+vec3f(.22,.23,.24)*g.fl.x*.3);
 c=c*exp(-g.sig.xyz*d)+fogIn(g.cam.xyz,-V,d);
 o.col=vec4f(c,(1.-k)*(1.-k)*.34*ss(0.,.25,age));o.s=pb.w;o.uv=q;o.cp=g.vp*vec4f(wp,1.);return o;}
@fragment fn fs(i:PO)->@location(0) vec4f{let r=dot(i.uv,i.uv);if(r>1.){discard;}let f=1.-r;let n=nz(i.uv*2.2+vec2f(fract(i.s*7.31)*20.,fract(i.s*3.17)*20.));return vec4f(i.col.rgb,i.col.a*f*f*(.25+1.3*n));}
`;
