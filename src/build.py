import re
import os
B=os.path.dirname(os.path.abspath(__file__))+'/'
src=open(B+'template.html',encoding='utf-8').read()
def cut(a,b,incl_b=False,s=None):
    s=s or src;i=s.index(a);j=s.index(b,i)
    return s[i:j+(len(b) if incl_b else 0)]
# --- HTML: todo lo anterior al importmap
head=src[:src.index('<script type="importmap">')]
imp='<script type="importmap">{"imports":{"three":"https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.min.js","three/addons/":"https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/"}}</script>\n<script type="module">\n'
hdr="""import*as T from 'three';
import{mergeGeometries}from 'three/addons/utils/BufferGeometryUtils.js';
import{RoundedBoxGeometry}from 'three/addons/geometries/RoundedBoxGeometry.js';
T.ColorManagement.enabled=false;
const $=id=>document.getElementById(id);
"""
utils=cut("function mb(a){","// ================= PERFIL DEL FONDO")
floor='''
// ---- ruido entero: idéntico en JS y en WGSL, para que el terreno de la CPU y de la GPU coincidan ----
const ih=(x,y)=>{let h=(Math.imul(x,374761393)+Math.imul(y,668265263))|0;h=Math.imul(h^(h>>>13),1274126177);h^=h>>>16;return(h>>>8)/16777216};
const gvn=(x,y)=>{const xi=Math.floor(x),yi=Math.floor(y),xf=x-xi,yf=y-yi,u=xf*xf*(3-2*xf),v=yf*yf*(3-2*yf);return ih(xi,yi)*(1-u)*(1-v)+ih(xi+1,yi)*u*(1-v)+ih(xi,yi+1)*(1-u)*v+ih(xi+1,yi+1)*u*v};
const gfbm=(x,y)=>{let a=.5,s=0;for(let i=0;i<4;i++){s+=a*gvn(x,y);x*=2;y*=2;a*=.5}return s};
const KN=[[-3000,0],[0,1],[250,22],[850,28],[1300,110],[1500,115],[2300,330],[2450,335],[3100,600],[3500,605],[4600,1500],[4800,1505],[5800,2600],[6400,2610],[7600,3800],[9800,3900],[11000,4790],[11700,4795],[12800,5600],[13800,5610],[15000,6890],[15350,6895],[16400,8100],[40000,8110]];
const base=x=>{if(x<=KN[0][0])return 0;for(let i=0;i<KN.length-1;i++){const a=KN[i],b=KN[i+1];if(x<b[0]){const t=(x-a[0])/(b[0]-a[0]);return a[1]+(b[1]-a[1])*t*t*(3-2*t)}}return 8110};
const LM=[{id:'galeon',x:3300,z:0,r:70},{id:'titanic',x:8200,z:0,r:130},{id:'af447',x:9500,z:0,r:70},{id:'bismarck',x:11300,z:0,r:170},{id:'roberts',x:15150,z:0,r:90}];
const floorAt=(x,z)=>{const b=base(x);let n=(5*(gfbm(x*.01,z*.01)-.5)+1.2*(gfbm(x*.07+3,z*.07)-.5))*(1+b/3000);
 {const rk=sm(.55,.72,gfbm(x*.004+9,z*.004)),rg=1-Math.abs(2*gfbm(x*.03,z*.03+7)-1);n+=rk*Math.pow(rg,3)*7+.12*Math.sin(x*.9+z*.4+gfbm(x*.1,z*.1)*6)*(1-rk)}
 for(const l of LM){const d=Math.hypot(x-l.x,z-l.z);if(d<l.r*1.8)n*=sm(l.r*.6,l.r*1.8,d)}return Math.max(b+n,.8)};
const rc=mb(11),CH=Array.from({length:9},()=>[6000+rc()*260,(rc()-.5)*140,6+rc()*8]);
'''
wgsl=open(B+'gpu_wgsl.js',encoding='utf-8').read()
kit=cut("// ================= KIT DE GEOMETRÍA","SPS.forEach(s=>Object.assign(s,PAT[s.n]||{}));",True)
assert 'function fishG(c1,c2,o={}){' in kit
kit=kit.replace('function fishG(c1,c2,o={}){','function fishG_old(c1,c2,o={}){')
wr=cut("// ================= EDIFICIOS Y NAUFRAGIOS","const wrM=mat(")
wrecks=open(B+'gpu_wrecks.js',encoding='utf-8').read()+'\n'+open(B+'gpu_fauna.js',encoding='utf-8').read()
engine=open(B+'gpu_engine.js',encoding='utf-8').read()
world=open(B+'gpu_world.js',encoding='utf-8').read()
# rebuild: extraído y adaptado
rb=cut("function rebuild(){","last={x:cx,z:cz,y:cy}}",True)
a="if(!sp0.mesh)continue;";assert a in rb;rb=rb.replace(a,"if(!sp0.geo)continue;")
a="sp.mesh.count=sp.cnt;sp.mesh.instanceMatrix.needsUpdate=true;sp.mesh.instanceColor.needsUpdate=true;sp.sg.needsUpdate=true}";assert a in rb
rb=rb.replace(a,"upl(sp)}")
assert "sp.mesh" not in rb and "sp0.mesh" not in rb,[m.start() for m in re.finditer('mesh',rb)]
# audio: extraído tal cual
ai=src.index("// ---------- audio ----------");mi=src.index("function mute(){",ai);me=src.index("\n",mi)
audio=src[ai:me+1]
world=world.replace("//REBUILD//",rb).replace("//AUDIO//",audio)
out=head+imp+hdr+utils+floor+wgsl+"\n"+kit+"\n"+wr+"\n"+wrecks+"\n"+engine+"\n"+world+"\n</script></body></html>\n"
open(B+'../index.html','w',encoding='utf-8').write(out)
open(B+'gpu_check.mjs','w',encoding='utf-8').write(re.search(r'<script type="module">(.*)</script>',out,re.S).group(1))
print('bytes',len(out.encode()))
