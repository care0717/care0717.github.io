import { useState, useCallback, useRef, useEffect } from "react";

const PIECE_DEFS = {
  A: { name:"A", cubes:[[0,0,0],[1,0,0],[1,1,0],[0,0,1]], color:"#3B82F6", light:"#93C5FD", dark:"#1E40AF", count:4 },
  B: { name:"B", cubes:[[0,0,0],[1,0,0],[0,1,0],[0,0,1]], color:"#F97316", light:"#FDBA74", dark:"#C2410C", count:4 },
  C: { name:"C", cubes:[[0,0,0],[0,1,0],[1,0,0],[1,0,1]], color:"#8B5CF6", light:"#C4B5FD", dark:"#5B21B6", count:4 },
  D: { name:"D", cubes:[[0,0,0],[1,0,0],[1,1,0],[2,1,0]], color:"#DB2777", light:"#F9A8D4", dark:"#9D174D", count:4 },
  E: { name:"E", cubes:[[0,0,0],[1,0,0],[2,0,0],[1,1,0]], color:"#EF4444", light:"#FCA5A5", dark:"#991B1B", count:4 },
  F: { name:"F", cubes:[[0,0,0],[1,0,0],[2,0,0],[2,1,0]], color:"#22C55E", light:"#86EFAC", dark:"#15803D", count:4 },
  G: { name:"G", cubes:[[0,0,0],[1,0,0],[0,1,0]], color:"#EAB308", light:"#FDE047", dark:"#A16207", count:3 },
};

const DIRS=[[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]];
const B36="0123456789abcdefghijklmnopqrstuvwxyz";

function rotateX([x,y,z]){return[x,-z,y]}
function rotateY([x,y,z]){return[z,y,-x]}
function rotateZ([x,y,z]){return[-y,x,z]}
function applyRot(cubes,rots){let r=cubes.map(c=>[...c]);for(const f of rots)r=r.map(c=>f(c));return r}
function normalizeCubes(cubes){
  const mx=Math.min(...cubes.map(c=>c[0])),my=Math.min(...cubes.map(c=>c[1])),mz=Math.min(...cubes.map(c=>c[2]));
  return cubes.map(c=>[c[0]-mx,c[1]-my,c[2]-mz]).sort((a,b)=>a[0]-b[0]||a[1]-b[1]||a[2]-b[2]);
}
function cKey(cubes){return normalizeCubes(cubes).map(c=>c.join(",")).join("|")}

function getAllOrientations(cubes){
  const seen=new Set(),out=[];const rs=[rotateX,rotateY,rotateZ];
  for(let a=0;a<4;a++)for(let b=0;b<4;b++)for(let c=0;c<4;c++){
    const seq=[];for(let i=0;i<a;i++)seq.push(rs[0]);for(let i=0;i<b;i++)seq.push(rs[1]);for(let i=0;i<c;i++)seq.push(rs[2]);
    const r=normalizeCubes(applyRot(cubes,seq)),k=cKey(r);if(!seen.has(k)){seen.add(k);out.push(r)}}
  const extras=[[rotateX,rotateZ],[rotateZ,rotateX],[rotateY,rotateX],[rotateX,rotateY],[rotateZ,rotateY],[rotateY,rotateZ],
    [rotateX,rotateX,rotateZ],[rotateX,rotateZ,rotateZ],[rotateZ,rotateX,rotateX],[rotateY,rotateX,rotateZ],[rotateX,rotateY,rotateZ],[rotateZ,rotateY,rotateX]];
  for(const seq of extras)for(let a=0;a<4;a++){
    const full=[];for(let i=0;i<a;i++)full.push(rotateX);full.push(...seq);
    const r=normalizeCubes(applyRot(cubes,full)),k=cKey(r);if(!seen.has(k)){seen.add(k);out.push(r)}}
  return out;
}
const PIECE_ORI={};for(const[k,d]of Object.entries(PIECE_DEFS))PIECE_ORI[k]=getAllOrientations(d.cubes);

function validateContacts(placedPieces,minContact=2){
  const cubeOwner=new Map();
  for(let i=0;i<placedPieces.length;i++)for(const c of placedPieces[i].cubes)cubeOwner.set(c.join(","),i);
  for(let i=0;i<placedPieces.length;i++){let contacts=0;
    for(const c of placedPieces[i].cubes)for(const[dx,dy,dz]of DIRS){
      const owner=cubeOwner.get(`${c[0]+dx},${c[1]+dy},${c[2]+dz}`);if(owner!==undefined&&owner!==i)contacts++}
    if(contacts<minContact)return false}
  return true;
}

// ===== ENCODE / DECODE =====
function encodePuzzle(pieces){
  const sorted=[...pieces].sort((a,b)=>a.key.localeCompare(b.key));
  const pieceKeys=sorted.map(p=>p.key).join("");
  let val=0n;
  for(const p of sorted){
    const cubes=p.cubes;
    const mx=Math.min(...cubes.map(c=>c[0])),my=Math.min(...cubes.map(c=>c[1])),mz=Math.min(...cubes.map(c=>c[2]));
    const norm=cubes.map(c=>[c[0]-mx,c[1]-my,c[2]-mz]).sort((a,b)=>a[0]-b[0]||a[1]-b[1]||a[2]-b[2]);
    const normKey=norm.map(c=>c.join(",")).join("|");
    const oris=PIECE_ORI[p.key];
    let oriIdx=0;
    for(let i=0;i<oris.length;i++){if(oris[i].map(c=>c.join(",")).join("|")===normKey){oriIdx=i;break}}
    val=val*BigInt(oris.length)+BigInt(oriIdx);
    val=val*8n+BigInt(mx);
    val=val*8n+BigInt(my);
    val=val*8n+BigInt(mz);
  }
  let code="";
  if(val===0n)code="0";
  let v=val;while(v>0n){code=B36[Number(v%36n)]+code;v=v/36n}
  return`${pieceKeys}-${code}`;
}

function decodePuzzle(id){
  try{
    const[pieceKeys,code]=id.split("-");
    if(!pieceKeys||!code)return null;
    const keys=pieceKeys.split("");
    for(const k of keys)if(!PIECE_DEFS[k])return null;
    let val=0n;
    for(const ch of code){const idx=B36.indexOf(ch);if(idx<0)return null;val=val*36n+BigInt(idx)}
    const placements=[];
    for(let i=keys.length-1;i>=0;i--){
      const mz=Number(val%8n);val/=8n;
      const my=Number(val%8n);val/=8n;
      const mx=Number(val%8n);val/=8n;
      const oris=PIECE_ORI[keys[i]];
      const oriIdx=Number(val%BigInt(oris.length));val/=BigInt(oris.length);
      if(oriIdx>=oris.length)return null;
      const cubes=oris[oriIdx].map(c=>[c[0]+mx,c[1]+my,c[2]+mz]);
      placements.unshift({key:keys[i],cubes});
    }
    return{pieces:placements,allCubes:placements.flatMap(p=>p.cubes)};
  }catch(e){return null}
}

function generatePuzzle(keys,maxAtt=400){
  const gs=5;let attempts=0,validAttempts=0;
  for(let att=0;att<maxAtt;att++){
    attempts++;const occ=new Set(),placed=[];const sh=[...keys].sort(()=>Math.random()-0.5);let ok=true;
    for(let pi=0;pi<sh.length;pi++){
      const pk=sh[pi],orients=[...PIECE_ORI[pk]].sort(()=>Math.random()-0.5);let done=false;
      if(pi===0){const t=orients[0].map(c=>[c[0]+1,c[1]+1,c[2]]);for(const c of t)occ.add(c.join(","));placed.push({key:pk,cubes:t});done=true}
      else{const bnd=new Set();for(const o of occ){const[x,y,z]=o.split(",").map(Number);for(const[dx,dy,dz]of DIRS){const nk=`${x+dx},${y+dy},${z+dz}`;if(!occ.has(nk))bnd.add(nk)}}
        outer:for(const orient of orients){const ba=[...bnd].sort(()=>Math.random()-0.5);
          for(const bp of ba.slice(0,40)){const[bx,by,bz]=bp.split(",").map(Number);
            for(const anc of orient){const dx=bx-anc[0],dy=by-anc[1],dz=bz-anc[2];
              const t=orient.map(c=>[c[0]+dx,c[1]+dy,c[2]+dz]);let valid=true,adj=false;
              for(const c of t){if(occ.has(c.join(","))){valid=false;break}if(c[0]<0||c[0]>=gs||c[1]<0||c[1]>=gs||c[2]<0||c[2]>=gs){valid=false;break}
                for(const[ddx,ddy,ddz]of DIRS)if(occ.has(`${c[0]+ddx},${c[1]+ddy},${c[2]+ddz}`))adj=true}
              if(valid&&adj){for(const c of t)occ.add(c.join(","));placed.push({key:pk,cubes:t});done=true;break outer}}}}}
      if(!done){ok=false;break}}
    if(!ok)continue;validAttempts++;
    if(!validateContacts(placed,2))continue;
    const all=placed.flatMap(p=>p.cubes);
    const mx=Math.min(...all.map(c=>c[0])),my=Math.min(...all.map(c=>c[1])),mz=Math.min(...all.map(c=>c[2]));
    const result={pieces:placed.map(p=>({...p,cubes:p.cubes.map(c=>[c[0]-mx,c[1]-my,c[2]-mz])})),allCubes:all.map(c=>[c[0]-mx,c[1]-my,c[2]-mz])};
    console.log(`生成: ${attempts}回試行 / ${validAttempts}回配置成功`);
    return result;
  }
  return null;
}

// ===== 3D CAMERA =====
function makeCamera(theta,phi){
  const ct=Math.cos(theta),st=Math.sin(theta),cp=Math.cos(phi),sp=Math.sin(phi);
  return{cam:[cp*ct,cp*st,sp],right:[-st,ct,0],up:[-sp*ct,-sp*st,cp]};
}
function project3d(x,y,z,cam,scale){return{sx:(x*cam.right[0]+y*cam.right[1]+z*cam.right[2])*scale,sy:-(x*cam.up[0]+y*cam.up[1]+z*cam.up[2])*scale}}
function dot3(a,b){return a[0]*b[0]+a[1]*b[1]+a[2]*b[2]}

const FACES=[
  {normal:[0,0,1],neighbor:[0,0,1],verts:(x,y,z)=>[[x,y,z+1],[x+1,y,z+1],[x+1,y+1,z+1],[x,y+1,z+1]]},
  {normal:[0,0,-1],neighbor:[0,0,-1],verts:(x,y,z)=>[[x,y,z],[x,y+1,z],[x+1,y+1,z],[x+1,y,z]]},
  {normal:[1,0,0],neighbor:[1,0,0],verts:(x,y,z)=>[[x+1,y,z],[x+1,y+1,z],[x+1,y+1,z+1],[x+1,y,z+1]]},
  {normal:[-1,0,0],neighbor:[-1,0,0],verts:(x,y,z)=>[[x,y,z],[x,y,z+1],[x,y+1,z+1],[x,y+1,z]]},
  {normal:[0,1,0],neighbor:[0,1,0],verts:(x,y,z)=>[[x,y+1,z],[x,y+1,z+1],[x+1,y+1,z+1],[x+1,y+1,z]]},
  {normal:[0,-1,0],neighbor:[0,-1,0],verts:(x,y,z)=>[[x,y,z],[x+1,y,z],[x+1,y,z+1],[x,y,z+1]]},
];

function hexToRgb(hex){return[parseInt(hex.slice(1,3),16),parseInt(hex.slice(3,5),16),parseInt(hex.slice(5,7),16)]}
function getFaceColor(normal,cam,info){
  const light=[cam.cam[0]+0.3*cam.right[0]+0.2*cam.up[0],cam.cam[1]+0.3*cam.right[1]+0.2*cam.up[1],cam.cam[2]+0.3*cam.right[2]+0.2*cam.up[2]];
  const len=Math.sqrt(light[0]**2+light[1]**2+light[2]**2);const nl=[light[0]/len,light[1]/len,light[2]/len];
  const d=Math.max(0,dot3(normal,nl));
  if(info){const base=hexToRgb(info.dark),br=hexToRgb(info.light);return`rgb(${Math.round(base[0]+(br[0]-base[0])*d)},${Math.round(base[1]+(br[1]-base[1])*d)},${Math.round(base[2]+(br[2]-base[2])*d)})`}
  return`rgb(${Math.round(140+100*d)},${Math.round(140+100*d)},${Math.round(140+100*d)})`;
}

function IsometricView({cubes,width=380,height=340,showAnswer,pieces,theta,phi,onDrag}){
  if(!cubes||cubes.length===0)return null;
  const svgRef=useRef(null);const dragging=useRef(false);const lastPos=useRef({x:0,y:0});
  const handlePointerDown=(e)=>{dragging.current=true;const cx=e.touches?e.touches[0].clientX:e.clientX;const cy=e.touches?e.touches[0].clientY:e.clientY;lastPos.current={x:cx,y:cy};if(e.touches)e.preventDefault()};
  const handlePointerMove=(e)=>{if(!dragging.current)return;const cx=e.touches?e.touches[0].clientX:e.clientX;const cy=e.touches?e.touches[0].clientY:e.clientY;const dx=cx-lastPos.current.x;const dy=cy-lastPos.current.y;lastPos.current={x:cx,y:cy};onDrag(dx,dy);if(e.touches)e.preventDefault()};
  const handlePointerUp=()=>{dragging.current=false};
  useEffect(()=>{const el=svgRef.current;if(!el)return;const opts={passive:false};
    el.addEventListener('touchstart',handlePointerDown,opts);el.addEventListener('touchmove',handlePointerMove,opts);el.addEventListener('touchend',handlePointerUp);
    return()=>{el.removeEventListener('touchstart',handlePointerDown);el.removeEventListener('touchmove',handlePointerMove);el.removeEventListener('touchend',handlePointerUp)}});
  const cubeSet=new Set(cubes.map(c=>c.join(",")));
  const colorMap={};if(showAnswer&&pieces)for(const p of pieces)for(const c of p.cubes)colorMap[c.join(",")]=PIECE_DEFS[p.key];
  const cam=makeCamera(theta,phi);const S=28;
  const ccx=cubes.reduce((s,c)=>s+c[0]+0.5,0)/cubes.length;
  const ccy=cubes.reduce((s,c)=>s+c[1]+0.5,0)/cubes.length;
  const ccz=cubes.reduce((s,c)=>s+c[2]+0.5,0)/cubes.length;
  const allFaces=[];
  for(const[x,y,z]of cubes){const info=showAnswer?colorMap[`${x},${y},${z}`]:null;
    for(const face of FACES){if(dot3(face.normal,cam.cam)<=0)continue;
      if(cubeSet.has(`${x+face.neighbor[0]},${y+face.neighbor[1]},${z+face.neighbor[2]}`))continue;
      const verts=face.verts(x,y,z).map(([vx,vy,vz])=>project3d(vx-ccx,vy-ccy,vz-ccz,cam,S));
      const fcx2=(x+face.neighbor[0]*0.5+0.5)-ccx,fcy2=(y+face.neighbor[1]*0.5+0.5)-ccy,fcz2=(z+face.neighbor[2]*0.5+0.5)-ccz;
      allFaces.push({depth:dot3([fcx2,fcy2,fcz2],cam.cam),verts,color:getFaceColor(face.normal,cam,info),stroke:showAnswer?"rgba(0,0,0,0.12)":"rgba(0,0,0,0.35)",sw:showAnswer?0.6:1,key:`${x},${y},${z},${face.normal}`});
    }}
  allFaces.sort((a,b)=>a.depth-b.depth);const ox=width/2,oy=height/2;
  return(
    <svg ref={svgRef} width={width} height={height} viewBox={`0 0 ${width} ${height}`}
      style={{display:"block",cursor:"grab",userSelect:"none",touchAction:"none"}}
      onMouseDown={handlePointerDown} onMouseMove={handlePointerMove} onMouseUp={handlePointerUp} onMouseLeave={handlePointerUp}>
      <rect width={width} height={height} fill="#fff" rx={8}/>
      {allFaces.map(f=><polygon key={f.key} points={f.verts.map(v=>`${v.sx+ox},${v.sy+oy}`).join(" ")} fill={f.color} stroke={f.stroke} strokeWidth={f.sw} strokeLinejoin="round"/>)}
      <text x={width-12} y={height-10} textAnchor="end" fill="#ccc" fontSize={11} style={{pointerEvents:"none"}}>🔄 ドラッグで回転</text>
    </svg>);
}

function PiecePreview({pieceKey,size=56}){
  const def=PIECE_DEFS[pieceKey],cubes=def.cubes;
  const cam=makeCamera(Math.PI/4,Math.PI/5.5);const S=10;
  const cubeSet=new Set(cubes.map(c=>c.join(",")));
  const cx2=cubes.reduce((s,c)=>s+c[0]+0.5,0)/cubes.length;
  const cy2=cubes.reduce((s,c)=>s+c[1]+0.5,0)/cubes.length;
  const cz2=cubes.reduce((s,c)=>s+c[2]+0.5,0)/cubes.length;
  const faces=[];
  for(const[x,y,z]of cubes){for(const face of FACES){
    if(dot3(face.normal,cam.cam)<=0)continue;
    if(cubeSet.has(`${x+face.neighbor[0]},${y+face.neighbor[1]},${z+face.neighbor[2]}`))continue;
    const verts=face.verts(x,y,z).map(([vx,vy,vz])=>project3d(vx-cx2,vy-cy2,vz-cz2,cam,S));
    const fcx=(x+face.neighbor[0]*0.5+0.5)-cx2,fcy=(y+face.neighbor[1]*0.5+0.5)-cy2,fcz=(z+face.neighbor[2]*0.5+0.5)-cz2;
    faces.push({depth:dot3([fcx,fcy,fcz],cam.cam),verts,color:getFaceColor(face.normal,cam,def),key:`${x}${y}${z}${face.normal}`});
  }}
  faces.sort((a,b)=>a.depth-b.depth);const ox3=size/2,oy3=size/2;
  return(<svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
    {faces.map(f=><polygon key={f.key} points={f.verts.map(v=>`${v.sx+ox3},${v.sy+oy3}`).join(" ")} fill={f.color} stroke="rgba(0,0,0,0.15)" strokeWidth={0.5} strokeLinejoin="round"/>)}
  </svg>);
}

export default function App(){
  const[selected,setSelected]=useState(new Set());
  const[puzzle,setPuzzle]=useState(null);
  const[showAnswer,setShowAnswer]=useState(false);
  const[generating,setGenerating]=useState(false);
  const[error,setError]=useState(null);
  const[puzzleId,setPuzzleId]=useState("");
  const[idInput,setIdInput]=useState("");
  const[theta,setTheta]=useState(Math.PI/4);
  const[phi,setPhi]=useState(Math.PI/5.5);
  const[copied,setCopied]=useState(false);

  const togglePiece=(key)=>{setSelected(prev=>{const n=new Set(prev);n.has(key)?n.delete(key):n.add(key);return n});setPuzzle(null);setShowAnswer(false);setError(null);setPuzzleId("")};

  const generate=useCallback(()=>{
    if(selected.size<2)return;setGenerating(true);setError(null);setShowAnswer(false);
    setTheta(Math.PI/4);setPhi(Math.PI/5.5);
    setTimeout(()=>{const r=generatePuzzle([...selected],400);
      if(r){setPuzzle(r);const id=encodePuzzle(r.pieces);setPuzzleId(id);console.log("Puzzle ID:",id)}
      else{setError("生成に失敗しました。もう一度お試しください。");setPuzzle(null);setPuzzleId("")}
      setGenerating(false);},50);
  },[selected]);

  const loadFromId=useCallback(()=>{
    const trimmed=idInput.trim();if(!trimmed)return;
    const result=decodePuzzle(trimmed);
    if(result){
      setPuzzle(result);setPuzzleId(trimmed);setShowAnswer(false);setError(null);
      setTheta(Math.PI/4);setPhi(Math.PI/5.5);
      // Update selected pieces to match
      const keys=new Set(trimmed.split("-")[0].split(""));setSelected(keys);
    }else{setError("無効なIDです。正しいIDを入力してください。")}
  },[idInput]);

  const copyId=useCallback(()=>{
    if(!puzzleId)return;
    navigator.clipboard.writeText(puzzleId).then(()=>{setCopied(true);setTimeout(()=>setCopied(false),1500)}).catch(()=>{});
  },[puzzleId]);

  const handleDrag=useCallback((dx,dy)=>{setTheta(p=>p-dx*0.008);setPhi(p=>Math.max(0.05,Math.min(Math.PI/2-0.05,p+dy*0.008)))},[]);

  return(
    <div style={{minHeight:"100vh",background:"linear-gradient(145deg,#0f172a 0%,#1e293b 50%,#0f172a 100%)",fontFamily:"'Segoe UI','Hiragino Sans','Meiryo',sans-serif",color:"#e2e8f0",display:"flex",flexDirection:"column",alignItems:"center",padding:"24px 16px"}}>
      <div style={{textAlign:"center",marginBottom:28}}>
        <div style={{display:"inline-block",background:"linear-gradient(135deg,#f97316,#ef4444,#8b5cf6,#3b82f6)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",fontSize:34,fontWeight:900,letterSpacing:"-0.02em"}}>Cube Puzzle Generator</div>
      </div>

      <div style={{background:"rgba(255,255,255,0.04)",borderRadius:16,padding:"20px 24px",marginBottom:24,border:"1px solid rgba(255,255,255,0.06)",width:"100%",maxWidth:520}}>
        <div style={{fontSize:13,color:"#94a3b8",marginBottom:12,fontWeight:600}}>使用ブロックを選択（2つ以上）</div>
        <div style={{display:"flex",flexWrap:"wrap",gap:10,justifyContent:"center"}}>
          {Object.keys(PIECE_DEFS).map(key=>{
            const sel=selected.has(key),d=PIECE_DEFS[key];
            return(<button key={key} onClick={()=>togglePiece(key)} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4,padding:"8px 10px",borderRadius:12,border:sel?`2px solid ${d.color}`:"2px solid rgba(255,255,255,0.08)",background:sel?`${d.color}18`:"rgba(255,255,255,0.02)",cursor:"pointer",transition:"all 0.2s",transform:sel?"scale(1.05)":"scale(1)",boxShadow:sel?`0 0 20px ${d.color}30`:"none",minWidth:64}}>
              <PiecePreview pieceKey={key}/>
              <span style={{fontSize:11,fontWeight:700,color:sel?d.color:"#64748b"}}>{key}</span>
            </button>);
          })}
        </div>
        {selected.size>0&&<div style={{textAlign:"center",marginTop:12,fontSize:12,color:"#64748b"}}>選択中: {[...selected].join(", ")}</div>}
      </div>

      {/* ID Input */}
      <div style={{background:"rgba(255,255,255,0.04)",borderRadius:16,padding:"16px 24px",marginBottom:24,border:"1px solid rgba(255,255,255,0.06)",width:"100%",maxWidth:520}}>
        <div style={{fontSize:13,color:"#94a3b8",marginBottom:8,fontWeight:600}}>IDから問題を読み込み</div>
        <div style={{display:"flex",gap:8}}>
          <input value={idInput} onChange={e=>setIdInput(e.target.value)} placeholder="例: ADF-a3k2m"
            onKeyDown={e=>{if(e.key==="Enter")loadFromId()}}
            style={{flex:1,padding:"8px 12px",borderRadius:8,border:"1px solid rgba(255,255,255,0.1)",background:"rgba(255,255,255,0.06)",color:"#e2e8f0",fontSize:14,fontFamily:"monospace",outline:"none"}}/>
          <button onClick={loadFromId} style={{padding:"8px 16px",borderRadius:8,border:"none",background:"rgba(255,255,255,0.1)",color:"#e2e8f0",fontSize:13,fontWeight:600,cursor:"pointer",whiteSpace:"nowrap"}}>読み込み</button>
        </div>
      </div>

      <button onClick={generate} disabled={selected.size<2||generating} style={{padding:"14px 48px",borderRadius:12,border:"none",background:selected.size>=2?"linear-gradient(135deg,#f97316,#ef4444)":"rgba(255,255,255,0.06)",color:selected.size>=2?"#fff":"#475569",fontSize:16,fontWeight:700,cursor:selected.size>=2?"pointer":"not-allowed",boxShadow:selected.size>=2?"0 4px 24px rgba(249,115,22,0.3)":"none",marginBottom:24,opacity:generating?0.7:1}}>
        {generating?"生成中...":"🎲 問題を生成"}
      </button>

      {error&&<div style={{color:"#f87171",fontSize:14,marginBottom:16}}>{error}</div>}

      {puzzle&&(
        <div style={{background:"rgba(255,255,255,0.04)",borderRadius:16,padding:24,border:"1px solid rgba(255,255,255,0.06)",width:"100%",maxWidth:520,display:"flex",flexDirection:"column",alignItems:"center"}}>
          {/* Puzzle ID */}
          {puzzleId&&(
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:16,width:"100%"}}>
              <span style={{fontSize:12,color:"#64748b",whiteSpace:"nowrap"}}>ID:</span>
              <code style={{flex:1,fontSize:14,color:"#e2e8f0",background:"rgba(255,255,255,0.06)",padding:"6px 10px",borderRadius:6,fontFamily:"monospace",overflow:"hidden",textOverflow:"ellipsis"}}>{puzzleId}</code>
              <button onClick={copyId} style={{padding:"6px 12px",borderRadius:6,border:"1px solid rgba(255,255,255,0.1)",background:copied?"rgba(34,197,94,0.15)":"rgba(255,255,255,0.04)",color:copied?"#4ade80":"#94a3b8",fontSize:12,fontWeight:600,cursor:"pointer",whiteSpace:"nowrap",transition:"all 0.2s"}}>
                {copied?"✓ コピー済":"📋 コピー"}
              </button>
            </div>
          )}

          <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap",justifyContent:"center",alignItems:"center"}}>
            <span style={{fontSize:12,color:"#64748b"}}>使用ブロック:</span>
            {[...selected].map(k=><div key={k}><PiecePreview pieceKey={k} size={40}/></div>)}
          </div>
          <div style={{borderRadius:12,overflow:"hidden",marginBottom:16,boxShadow:"0 2px 16px rgba(0,0,0,0.3)"}}>
            <IsometricView cubes={puzzle.allCubes} width={380} height={340} showAnswer={showAnswer} pieces={puzzle.pieces} theta={theta} phi={phi} onDrag={handleDrag}/>
          </div>
          <div style={{display:"flex",gap:12,flexWrap:"wrap",justifyContent:"center"}}>
            <button onClick={()=>setShowAnswer(!showAnswer)} style={{padding:"10px 24px",borderRadius:8,border:"1px solid rgba(255,255,255,0.1)",background:showAnswer?"rgba(139,92,246,0.15)":"rgba(255,255,255,0.04)",color:showAnswer?"#a78bfa":"#94a3b8",fontSize:13,fontWeight:600,cursor:"pointer"}}>
              {showAnswer?"🔒 答えを隠す":"👁 答えを見る"}
            </button>
            <button onClick={()=>{setTheta(Math.PI/4);setPhi(Math.PI/5.5)}} style={{padding:"10px 16px",borderRadius:8,border:"1px solid rgba(255,255,255,0.1)",background:"rgba(255,255,255,0.04)",color:"#94a3b8",fontSize:13,fontWeight:600,cursor:"pointer"}}>
              ↩ 視点リセット
            </button>

          </div>
        </div>
      )}
    </div>
  );
}
