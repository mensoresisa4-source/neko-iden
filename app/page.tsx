"use client";import { useState } from "react";

/* ────────────────────────────────────────────
   遺伝子モデル
   W/w  優性白 (W>他すべて)
   B/b  黒>チョコ
   D/d  濃色>希釈(dd=ブルー/クリーム)
   A/a  縞あり(A)>単色(a)
   S/s  白斑(不完全優性)
   O/o  X連鎖オレンジ
──────────────────────────────────────────── */

const RARITY = {
  common:   { label:"よく見る",  star:"★★★", bg:"#e8f5ee", fg:"#2a7a4a" },
  uncommon: { label:"やや稀",    star:"★★☆", bg:"#fef6e0", fg:"#a06010" },
  rare:     { label:"稀",        star:"★☆☆", bg:"#fdeaea", fg:"#b03030" },
  veryrare: { label:"非常に稀",  star:"☆☆☆", bg:"#f0eafd", fg:"#7030b0" },
};

// 柄データ
const P = {
  white:       { label:"白猫",              color:"#f0ece4", rarity:"uncommon",
    note:"優性白(W)が他の全柄を隠す。青目個体は難聴リスクあり。" },
  black:       { label:"黒猫",              color:"#2a2a3a", rarity:"common",
    note:"非アグーチ(aa)＋黒(BB)＋非希釈(DD)。日本で最もよく見る柄。" },
  tabbyBlack:  { label:"キジトラ",          color:"#8a7040", rarity:"common",
    note:"アグーチ(A-)＋黒(B-)＋非希釈。日本猫の祖先的な柄で最多。" },
  tabbyRed:    { label:"茶トラ",            color:"#c86030", rarity:"common",
    note:"X連鎖オレンジ(O)＋アグーチ(A-)。オスに多い。" },
  calico:      { label:"三毛猫",            color:"#e8d090", rarity:"common",
    note:"X染色体ヘテロ(XOXo)＋白斑(S-)。ほぼ100%メス。縁起物。" },
  tortie:      { label:"サビ猫",            color:"#8a4a20", rarity:"common",
    note:"X染色体ヘテロ(XOXo)＋白斑なし。ほぼメスのみ。" },
  bicolor:     { label:"白黒ブチ",          color:"#404050", rarity:"common",
    note:"白斑(Ss)＋黒。ハチワレはこの仲間。" },
  tabbyBicolor:{ label:"キジトラ白ブチ",   color:"#a08050", rarity:"common",
    note:"白斑(Ss)＋キジトラ。野良猫に非常に多い。" },
  red:         { label:"赤（単色）",        color:"#c84020", rarity:"uncommon",
    note:"オレンジ(O)＋非アグーチ(aa)。縞なし赤猫は珍しい。" },
  multiWhite:  { label:"バン柄（白多め）",  color:"#e8e4dc", rarity:"uncommon",
    note:"白斑ホモ(SS)。体の大部分が白く頭・尾に色が残る。" },
  cream:       { label:"クリーム",          color:"#e8c090", rarity:"rare",
    note:"オレンジ(O)＋希釈(dd)。日本の野良ではほぼ見ない。" },
  tabbyCream:  { label:"クリームタビー",    color:"#d4a060", rarity:"rare",
    note:"オレンジ(O)＋アグーチ(A-)＋希釈(dd)。日本では非常に稀。" },
  blue:        { label:"ブルー（薄グレー）",color:"#7888a0", rarity:"rare",
    note:"黒(B-)＋希釈ホモ(dd)。日本の野良にはほぼ存在しない。" },
  tabbyBlue:   { label:"ブルータビー",      color:"#6a8090", rarity:"rare",
    note:"アグーチ(A-)＋黒(B-)＋希釈(dd)。日本の野良ではほぼ見ない。" },
  calicoBlue:  { label:"ブルー三毛",        color:"#b0a8c8", rarity:"rare",
    note:"三毛の遺伝子構成＋希釈(dd)。全体の色が淡くなる。" },
  tortieBlue:  { label:"ブルートーティー", color:"#7888a0", rarity:"rare",
    note:"サビ猫＋希釈(dd)。日本の野良にはほぼ存在しない。" },
  chocolate:   { label:"チョコレート",      color:"#5c3317", rarity:"veryrare",
    note:"黒色素希釈(bb)ホモ。日本の在来猫にはほぼ存在しない。" },
  lilac:       { label:"ライラック",        color:"#c0a0c8", rarity:"veryrare",
    note:"チョコ(bb)＋希釈(dd)。日本の野良猫には存在しない。" },
};

// 親の選択肢
const CATS = [
  { id:"kibitori",       label:"キジトラ",           sex:"any",   W:0,S:"ss",O:"o", B:"B",D:"D",A:"A",display:"tabbyBlack" },
  { id:"kuro",           label:"黒猫",               sex:"any",   W:0,S:"ss",O:"o", B:"B",D:"D",A:"a",display:"black" },
  { id:"mike_f",         label:"三毛猫（メス）",     sex:"female",W:0,S:"Ss",O:"Oo",B:"B",D:"D",A:"a",display:"calico" },
  { id:"sabi_f",         label:"サビ猫（メス）",     sex:"female",W:0,S:"ss",O:"Oo",B:"B",D:"D",A:"a",display:"tortie" },
  { id:"chatora_m",      label:"茶トラ（オス）",     sex:"male",  W:0,S:"ss",O:"O", B:"B",D:"D",A:"A",display:"tabbyRed" },
  { id:"chatora_f",      label:"赤トラ（メス）",     sex:"female",W:0,S:"ss",O:"OO",B:"B",D:"D",A:"A",display:"tabbyRed" },
  { id:"shiro",          label:"白猫",               sex:"any",   W:1,S:"ss",O:"o", B:"B",D:"D",A:"a",display:"white" },
  { id:"hachiware",      label:"ハチワレ",           sex:"any",   W:0,S:"Ss",O:"o", B:"B",D:"D",A:"a",display:"bicolor" },
  { id:"kijishiro",      label:"キジトラ白ブチ",     sex:"any",   W:0,S:"Ss",O:"o", B:"B",D:"D",A:"A",display:"tabbyBicolor" },
  { id:"chatora_shiro_m",label:"茶トラ白ブチ（オス）",sex:"male", W:0,S:"Ss",O:"O", B:"B",D:"D",A:"A",display:"tabbyBicolor" },
  { id:"blue_s",         label:"ブルー（稀）",       sex:"any",   W:0,S:"ss",O:"o", B:"B",D:"d",A:"a",display:"blue" },
  { id:"blue_tabby",     label:"ブルータビー（稀）", sex:"any",   W:0,S:"ss",O:"o", B:"B",D:"d",A:"A",display:"tabbyBlue" },
  { id:"cream_m",        label:"クリーム（稀/オス）",sex:"male",  W:0,S:"ss",O:"O", B:"B",D:"d",A:"A",display:"tabbyCream" },
];

/* ────── 遺伝計算 ────── */
function xAlleles(a1,a2,b1,b2){
  const f={};
  for(const[x,y]of[[a1,b1],[a1,b2],[a2,b1],[a2,b2]]){
    const k=[x,y].sort().join("");f[k]=(f[k]||0)+.25;
  }
  return f;
}
function g2a(g){
  if(!g||g.length<1)return["?","?"];
  if(g.length===1)return[g,g];
  return[g[0],g[1]];
}
function catToGeno(c,sex){
  return{
    sex,
    W:c.W,
    B:c.B==="B"?"BB":c.B==="b"?"bb":"Bb",
    D:c.D==="D"?"DD":c.D==="d"?"dd":"Dd",
    A:c.A==="A"?"AA":c.A==="a"?"aa":"Aa",
    S:c.S||"ss",
    O:c.O,
  };
}

function computeOffspring(dad,mom){
  const res={};
  const d=catToGeno(dad,"male"), m=catToGeno(mom,"female");
  const Wc=xAlleles(...g2a(d.W?"Ww":"ww"),...g2a(m.W?"Ww":"ww"));
  const Bc=xAlleles(...g2a(d.B),...g2a(m.B));
  const Dc=xAlleles(...g2a(d.D),...g2a(m.D));
  const Ac=xAlleles(...g2a(d.A),...g2a(m.A));
  const Sc=xAlleles(...g2a(d.S),...g2a(m.S));
  const dadX=(d.O==="O"||d.O==="OO")?"O":"o";
  const momAl=m.O==="OO"?["O","O"]:m.O==="Oo"?["O","o"]:["o","o"];

  for(const sex of["male","female"]){
    const Ocombos=sex==="male"
      ?momAl.map(x=>({a:x,p:.5}))
      :momAl.map(x=>({a:[dadX,x].sort().join(""),p:.5}));
    for(const[Wk,Wp]of Object.entries(Wc)){
      if(Wk.includes("W")){add(res,"white",.5*Wp);continue;}
      for(const[Bk,Bp]of Object.entries(Bc))
      for(const[Dk,Dp]of Object.entries(Dc))
      for(const[Ak,Ap]of Object.entries(Ac))
      for(const[Sk,Sp]of Object.entries(Sc))
      for(const{a:Oa,p:Op}of Ocombos){
        const p=.5*Wp*Bp*Dp*Ap*Sp*Op;
        if(p<.0004)continue;
        const choco=Bk==="bb",dilute=Dk==="dd",tabby=Ak.includes("A");
        const multiW=Sk==="SS",patch=Sk.includes("S");
        const orange=sex==="male"?Oa==="O":Oa==="OO";
        const isTortie=sex==="female"&&Oa==="Oo";
        let pat;
        if(multiW)      pat="multiWhite";
        else if(isTortie)pat=patch?(dilute?"calicoBlue":"calico"):(dilute?"tortieBlue":"tortie");
        else if(orange) pat=dilute?(tabby?(patch?"tabbyBicolor":"tabbyCream"):(patch?"tabbyBicolor":"cream"))
                                  :(tabby?(patch?"tabbyBicolor":"tabbyRed"):(patch?"tabbyBicolor":"red"));
        else if(choco)  pat=dilute?"lilac":"chocolate";
        else if(dilute) pat=tabby?(patch?"tabbyBicolor":"tabbyBlue"):(patch?"bicolor":"blue");
        else            pat=tabby?(patch?"tabbyBicolor":"tabbyBlack"):(patch?"bicolor":"black");
        add(res,pat,p);
      }
    }
  }
  const total=Object.values(res).reduce((s,v)=>s+v,0);
  return Object.fromEntries(Object.entries(res).map(([k,v])=>[k,v/total]).sort((a,b)=>b[1]-a[1]));
}
function add(o,k,v){o[k]=(o[k]||0)+v;}

/* 逆引き: 子猫の柄 → 両親の組み合わせ確率 */
function reverseInfer(childPatternKey){
  const dadOpts=CATS.filter(c=>c.sex!=="female");
  const momOpts=CATS.filter(c=>c.sex!=="male");
  const results=[];
  for(const d of dadOpts){
    for(const m of momOpts){
      const offspring=computeOffspring(d,m);
      const prob=offspring[childPatternKey]||0;
      if(prob>=0.005) results.push({dad:d,mom:m,prob});
    }
  }
  return results.sort((a,b)=>b.prob-a.prob).slice(0,10);
}

/* ────── かわいいSVG猫 ────── */
function KawaiiCat({ pattern, size=90 }){
  const info=P[pattern]||{color:"#aaa"};
  const c=info.color;

  const isTabby=pattern?.includes("tabby");
  const isCalico=["calico","calicoBlue"].includes(pattern);
  const isTortie=["tortie","tortieBlue"].includes(pattern);
  const hasPatch=["bicolor","tabbyBicolor","multiWhite","calico","calicoBlue"].includes(pattern);
  const isWhite=pattern==="white";
  const isDilute=["blue","tabbyBlue","calicoBlue","tortieBlue","cream","tabbyCream","lilac"].includes(pattern);

  // 白パッチの色
  const white="#f8f5ef";
  // オレンジパッチ（三毛）
  const orange=isDilute?"#d4a878":"#d47030";
  // 鼻色
  const noseCol=isWhite?"#f0a0a8":["black","tabbyBlack","bicolor","tabbyBicolor"].includes(pattern)?"#e89090":"#e8a0a0";
  // 目色
  const eyeCol=isWhite?"#5abcdc":isCalico?"#60b050":["tabbyRed","red"].includes(pattern)?"#c8a030":"#408850";
  // 縞色
  const stripeCol=`${c}88`;

  const s=size;
  const sc=s/120; // scale factor (base 120px)

  return(
    <svg width={s} height={s} viewBox="0 0 120 120" style={{overflow:"visible",filter:"drop-shadow(0 3px 10px rgba(0,0,0,0.15))"}}>
      <defs>
        <radialGradient id={`bg${pattern}`} cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor={c} stopOpacity="1"/>
          <stop offset="100%" stopColor={c} stopOpacity="0.85"/>
        </radialGradient>
        {/* 白パッチ用クリップ */}
        <clipPath id={`clip${pattern}`}>
          <circle cx="60" cy="58" r="34"/>
        </clipPath>
      </defs>

      {/* しっぽ */}
      <path d="M85 95 Q105 80 100 65 Q97 58 90 65 Q88 75 80 82" fill={c} stroke={c} strokeWidth="1"/>
      {hasPatch&&<path d="M85 95 Q105 80 100 65 Q97 58 90 65 Q88 75 80 82" fill={white} opacity="0.5"/>}

      {/* 体 */}
      <ellipse cx="60" cy="92" rx="30" ry="22" fill={`url(#bg${pattern})`}/>
      {/* 体の白パッチ */}
      {hasPatch&&<ellipse cx="60" cy="95" rx="18" ry="14" fill={white}/>}
      {/* 三毛の体パッチ */}
      {isCalico&&<ellipse cx="78" cy="85" rx="9" ry="7" fill={orange} opacity="0.7"/>}

      {/* 耳（左） */}
      <path d="M28 48 L20 20 L44 40 Z" fill={c}/>
      <path d="M30 46 L24 26 L40 40 Z" fill={isCalico||isTortie?"#f0b090":isDilute?`${c}cc`:c} opacity="0.5"/>
      {/* 耳（右） */}
      <path d="M92 48 L100 20 L76 40 Z" fill={c}/>
      <path d="M90 46 L96 26 L80 40 Z" fill={isCalico||isTortie?"#f0b090":isDilute?`${c}cc`:c} opacity="0.5"/>

      {/* 頭（グラデーション） */}
      <circle cx="60" cy="58" r="34" fill={`url(#bg${pattern})`}/>

      {/* 白マスク（ハチワレ・バイカラー） */}
      {hasPatch&&!isCalico&&!isTortie&&(
        <path d="M46 44 Q60 36 74 44 Q68 64 60 70 Q52 64 46 44Z" fill={white} opacity="0.9"/>
      )}

      {/* 三毛パッチ */}
      {isCalico&&(
        <>
          <circle cx="76" cy="50" r="13" fill={orange} opacity="0.55"/>
          <circle cx="44" cy="64" r="8"  fill={white}  opacity="0.8"/>
        </>
      )}
      {isTortie&&(
        <circle cx="74" cy="50" r="11" fill={orange} opacity="0.5"/>
      )}

      {/* 縞模様 */}
      {isTabby&&(
        <>
          {/* 頭の縞 */}
          <path d="M48 36 Q60 32 72 36" stroke={stripeCol} strokeWidth="2.5" fill="none" strokeLinecap="round"/>
          <path d="M46 43 Q60 39 74 43" stroke={stripeCol} strokeWidth="2"   fill="none" strokeLinecap="round"/>
          {/* おでこのM字 */}
          <path d="M52 30 Q56 26 60 30 Q64 26 68 30" stroke={stripeCol} strokeWidth="2" fill="none" strokeLinecap="round"/>
          {/* 体の縞 */}
          <path d="M32 80 Q60 74 88 80" stroke={stripeCol} strokeWidth="2.5" fill="none" strokeLinecap="round"/>
          <path d="M34 88 Q60 82 86 88" stroke={stripeCol} strokeWidth="2"   fill="none" strokeLinecap="round"/>
        </>
      )}

      {/* 目（左） */}
      <ellipse cx="46" cy="56" rx="7" ry="7.5" fill="white"/>
      <ellipse cx="46" cy="56" rx="5.5" ry="6" fill={eyeCol}/>
      <ellipse cx="46" cy="56" rx="3"   ry="4" fill="#1a1a1a"/>
      <circle  cx="44" cy="54" r="1.5"  fill="white"/>
      <circle  cx="48" cy="58" r="0.8"  fill="white" opacity="0.6"/>

      {/* 目（右） */}
      <ellipse cx="74" cy="56" rx="7" ry="7.5" fill="white"/>
      <ellipse cx="74" cy="56" rx="5.5" ry="6" fill={eyeCol}/>
      <ellipse cx="74" cy="56" rx="3"   ry="4" fill="#1a1a1a"/>
      <circle  cx="72" cy="54" r="1.5"  fill="white"/>
      <circle  cx="76" cy="58" r="0.8"  fill="white" opacity="0.6"/>

      {/* まぶた上ライン */}
      <path d="M39 52 Q46 49 53 52" stroke="#5a3010" strokeWidth="1.2" fill="none" opacity="0.4"/>
      <path d="M67 52 Q74 49 81 52" stroke="#5a3010" strokeWidth="1.2" fill="none" opacity="0.4"/>

      {/* 鼻 */}
      <path d="M56 66 L60 63 L64 66 Q62 70 60 70 Q58 70 56 66Z" fill={noseCol}/>

      {/* 口 */}
      <path d="M60 70 Q55 74 52 72" stroke="#c07070" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      <path d="M60 70 Q65 74 68 72" stroke="#c07070" strokeWidth="1.5" fill="none" strokeLinecap="round"/>

      {/* ひげ */}
      <line x1="16" y1="63" x2="50" y2="67" stroke="white" strokeWidth="1.2" opacity="0.8"/>
      <line x1="16" y1="68" x2="50" y2="69" stroke="white" strokeWidth="1.2" opacity="0.8"/>
      <line x1="16" y1="73" x2="50" y2="72" stroke="white" strokeWidth="1.2" opacity="0.6"/>
      <line x1="70" y1="67" x2="104" y2="63" stroke="white" strokeWidth="1.2" opacity="0.8"/>
      <line x1="70" y1="69" x2="104" y2="68" stroke="white" strokeWidth="1.2" opacity="0.8"/>
      <line x1="70" y1="72" x2="104" y2="73" stroke="white" strokeWidth="1.2" opacity="0.6"/>

      {/* 前足 */}
      <ellipse cx="44" cy="110" rx="10" ry="7" fill={c}/>
      <ellipse cx="76" cy="110" rx="10" ry="7" fill={c}/>
      {hasPatch&&<>
        <ellipse cx="44" cy="111" rx="7" ry="5" fill={white} opacity="0.7"/>
        <ellipse cx="76" cy="111" rx="7" ry="5" fill={white} opacity="0.7"/>
      </>}
      {/* 肉球 */}
      <circle cx="41" cy="113" r="1.5" fill={noseCol} opacity="0.6"/>
      <circle cx="44" cy="114" r="1.5" fill={noseCol} opacity="0.6"/>
      <circle cx="47" cy="113" r="1.5" fill={noseCol} opacity="0.6"/>
      <circle cx="73" cy="113" r="1.5" fill={noseCol} opacity="0.6"/>
      <circle cx="76" cy="114" r="1.5" fill={noseCol} opacity="0.6"/>
      <circle cx="79" cy="113" r="1.5" fill={noseCol} opacity="0.6"/>
    </svg>
  );
}

/* ────── メイン ────── */
export default function App(){
  const[mode,setMode]=useState("forward"); // "forward" | "reverse"
  const[dadId,setDadId]=useState("kibitori");
  const[momId,setMomId]=useState("mike_f");
  const[childPat,setChildPat]=useState("calico");
  const[results,setResults]=useState(null);
  const[loading,setLoading]=useState(false);
  const[openNote,setOpenNote]=useState(null);

  const dadCat=CATS.find(c=>c.id===dadId);
  const momCat=CATS.find(c=>c.id===momId);
  const dadOpts=CATS.filter(c=>c.sex!=="female");
  const momOpts=CATS.filter(c=>c.sex!=="male");

  const calc=()=>{
    setLoading(true);setResults(null);
    setTimeout(()=>{
      if(mode==="forward"){
        const res=computeOffspring({...dadCat,sex:"male"},{...momCat,sex:"female"});
        setResults({type:"forward",data:res});
      }else{
        const res=reverseInfer(childPat);
        setResults({type:"reverse",data:res});
      }
      setLoading(false);
    },350);
  };

  // 前向きグループ
  const grouped=results?.type==="forward"?{
    common:  Object.entries(results.data).filter(([k])=>["common"].includes(P[k]?.rarity)),
    uncommon:Object.entries(results.data).filter(([k])=>["uncommon"].includes(P[k]?.rarity)),
    rare:    Object.entries(results.data).filter(([k])=>["rare","veryrare"].includes(P[k]?.rarity)),
  }:null;

  return(
    <div style={{
      minHeight:"100vh",
      background:"linear-gradient(160deg,#fff8f0 0%,#ffe8d0 50%,#ffd0b8 100%)",
      fontFamily:"'Hiragino Maru Gothic Pro','Hiragino Kaku Gothic Pro','Yu Gothic',sans-serif",
      paddingBottom:60,
    }}>
      {/* ヘッダー */}
      <div style={{
        background:"linear-gradient(120deg,#c85820 0%,#e87830 50%,#f09040 100%)",
        padding:"28px 20px 20px",textAlign:"center",
        boxShadow:"0 6px 30px rgba(180,70,10,0.3)",
        position:"relative",overflow:"hidden",
      }}>
        {/* 装飾 */}
        {["8%","25%","60%","80%","95%"].map((l,i)=>(
          <div key={i} style={{position:"absolute",top:i%2?"-10px":"auto",bottom:i%2?"auto":"-10px",
            left:l,fontSize:24,opacity:0.15,transform:`rotate(${i*30}deg)`}}>🐾</div>
        ))}
        <div style={{fontSize:46,marginBottom:6,position:"relative"}}>🐱</div>
        <h1 style={{color:"white",fontSize:"clamp(20px,5vw,30px)",fontWeight:900,
          margin:"0 0 4px",letterSpacing:"0.08em",
          textShadow:"0 2px 12px rgba(80,20,0,0.5)",position:"relative"}}>
          ネコ柄遺伝メーカー
        </h1>
        <p style={{color:"rgba(255,255,255,0.9)",fontSize:12,margin:0,position:"relative"}}>
          猫の柄の遺伝を科学する 🧬
        </p>
      </div>

      <div style={{maxWidth:680,margin:"0 auto",padding:"0 14px"}}>

        {/* モード切替 */}
        <div style={{
          display:"flex",gap:0,marginTop:22,
          background:"white",borderRadius:50,padding:4,
          boxShadow:"0 2px 12px rgba(200,100,30,0.15)",
        }}>
          {[
            {key:"forward",icon:"🐾",label:"両親 → 子猫の柄"},
            {key:"reverse",icon:"🔍",label:"子猫 → 両親の推測"},
          ].map(({key,icon,label})=>(
            <button key={key} onClick={()=>{setMode(key);setResults(null);}} style={{
              flex:1,padding:"11px 8px",border:"none",borderRadius:50,cursor:"pointer",
              fontFamily:"inherit",fontSize:13,fontWeight:700,
              transition:"all 0.2s",
              background:mode===key?"linear-gradient(135deg,#c85820,#e87830)":"transparent",
              color:mode===key?"white":"#a06040",
              boxShadow:mode===key?"0 2px 10px rgba(200,100,30,0.4)":"none",
            }}>{icon} {label}</button>
          ))}
        </div>

        {/* ── 前向きモード ── */}
        {mode==="forward"&&(
          <>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginTop:18}}>
              <ParentCard title="🐾 父猫" accent="#2a60a8" opts={dadOpts} val={dadId} set={setDadId} cat={dadCat}/>
              <ParentCard title="🌸 母猫" accent="#a82a60" opts={momOpts} val={momId} set={setMomId} cat={momCat}/>
            </div>
            <ComboHint dad={dadCat} mom={momCat}/>
          </>
        )}

        {/* ── 逆引きモード ── */}
        {mode==="reverse"&&(
          <div style={{marginTop:18,background:"white",borderRadius:20,
            boxShadow:"0 3px 18px rgba(200,100,30,0.12)",overflow:"hidden"}}>
            <div style={{background:"linear-gradient(135deg,#6040b0,#9060d0)",
              padding:"10px 18px",color:"white",fontWeight:700,fontSize:14}}>
              🔍 生まれた子猫の柄を選んでください
            </div>
            <div style={{padding:"18px 16px"}}>
              <div style={{textAlign:"center",marginBottom:14}}>
                <KawaiiCat pattern={childPat} size={100}/>
                <div style={{fontSize:14,fontWeight:700,color:"#2a1000",marginTop:8}}>
                  {P[childPat]?.label||childPat}
                </div>
                <div style={{display:"inline-block",marginTop:4,fontSize:11,
                  padding:"2px 10px",borderRadius:20,
                  background:RARITY[P[childPat]?.rarity]?.bg||"#eee",
                  color:RARITY[P[childPat]?.rarity]?.fg||"#666",fontWeight:700}}>
                  {RARITY[P[childPat]?.rarity]?.star} {RARITY[P[childPat]?.rarity]?.label}
                </div>
              </div>
              {/* 柄グリッド */}
              <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8}}>
                {Object.entries(P).map(([k,v])=>{
                  const rar=RARITY[v.rarity]||RARITY.uncommon;
                  return(
                    <button key={k} onClick={()=>setChildPat(k)} style={{
                      border:`2px solid ${childPat===k?"#e87830":"#f0d8c0"}`,
                      borderRadius:12,padding:"8px 4px",cursor:"pointer",
                      background:childPat===k?"#fff4ec":"white",
                      transition:"all 0.15s",
                      boxShadow:childPat===k?"0 2px 10px rgba(200,100,30,0.3)":"none",
                    }}>
                      <KawaiiCat pattern={k} size={48}/>
                      <div style={{fontSize:9,fontWeight:700,color:"#3a1800",
                        marginTop:4,lineHeight:1.3}}>{v.label}</div>
                      <div style={{fontSize:8,color:rar.fg,marginTop:2}}>{rar.star}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* 計算ボタン */}
        <div style={{textAlign:"center",marginTop:20}}>
          <button onClick={calc} style={{
            background:"linear-gradient(135deg,#c85820,#e87830)",
            color:"white",border:"none",padding:"13px 48px",
            borderRadius:50,fontSize:16,fontWeight:700,cursor:"pointer",
            boxShadow:"0 4px 20px rgba(180,80,20,0.45)",
            letterSpacing:"0.05em",transition:"transform 0.12s, box-shadow 0.12s",
          }}
          onMouseEnter={e=>{e.currentTarget.style.transform="scale(1.05)";e.currentTarget.style.boxShadow="0 6px 26px rgba(180,80,20,0.55)"}}
          onMouseLeave={e=>{e.currentTarget.style.transform="scale(1)";e.currentTarget.style.boxShadow="0 4px 20px rgba(180,80,20,0.45)"}}>
            {loading?"計算中...":"✨ "+(mode==="forward"?"子猫を生む":"両親を探す")}
          </button>
        </div>

        {/* ── 結果：前向き ── */}
        {results?.type==="forward"&&!loading&&(
          <ForwardResults grouped={grouped} openNote={openNote} setOpenNote={setOpenNote}/>
        )}

        {/* ── 結果：逆引き ── */}
        {results?.type==="reverse"&&!loading&&(
          <ReverseResults data={results.data} childPat={childPat}/>
        )}

      </div>
    </div>
  );
}

/* 前向き結果 */
function ForwardResults({grouped,openNote,setOpenNote}){
  return(
    <div style={{marginTop:28}}>
      <h2 style={{textAlign:"center",fontSize:17,fontWeight:700,color:"#6a2e08",marginBottom:4}}>
        🐣 生まれる子猫の柄（遺伝的予測）
      </h2>
      <p style={{textAlign:"center",fontSize:12,color:"#9a6040",marginBottom:16}}>
        柄名をタップすると遺伝の説明が見られます
      </p>
      {/* 凡例 */}
      <div style={{display:"flex",gap:6,justifyContent:"center",flexWrap:"wrap",marginBottom:16}}>
        {Object.entries(RARITY).map(([k,r])=>(
          <span key={k} style={{fontSize:10,padding:"2px 8px",borderRadius:20,
            background:r.bg,color:r.fg,fontWeight:700,whiteSpace:"nowrap"}}>
            {r.star} {r.label}
          </span>
        ))}
      </div>
      {[
        {key:"common",  label:"🐱 よく見る柄"},
        {key:"uncommon",label:"🌟 やや稀な柄"},
        {key:"rare",    label:"💎 稀な柄"},
      ].map(({key,label})=>{
        const grp=grouped[key];
        if(!grp?.length)return null;
        return(
          <div key={key} style={{marginBottom:16}}>
            <div style={{fontSize:12,fontWeight:700,color:"#7a4a20",
              marginBottom:8,borderLeft:"3px solid #e87830",paddingLeft:10}}>
              {label}
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {grp.map(([pk,prob])=>{
                const info=P[pk]||{label:pk,color:"#aaa",rarity:"uncommon"};
                const rar=RARITY[info.rarity]||RARITY.uncommon;
                const pct=(prob*100).toFixed(1);
                const open=openNote===pk;
                return(
                  <div key={pk} style={{background:"white",borderRadius:14,
                    boxShadow:"0 2px 10px rgba(180,80,20,0.08)",overflow:"hidden"}}>
                    <div style={{display:"flex",alignItems:"center",
                      gap:10,padding:"10px 14px",cursor:"pointer"}}
                      onClick={()=>setOpenNote(open?null:pk)}>
                      <KawaiiCat pattern={pk} size={60}/>
                      <div style={{flex:1}}>
                        <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:5,flexWrap:"wrap"}}>
                          <span style={{fontWeight:700,fontSize:14,color:"#2a1000"}}>{info.label}</span>
                          <span style={{fontSize:10,padding:"1px 7px",borderRadius:20,
                            background:rar.bg,color:rar.fg,fontWeight:700}}>{rar.star}</span>
                          <span style={{fontSize:11,color:"#ccc",marginLeft:"auto"}}>{open?"▲":"▼"}</span>
                        </div>
                        <div style={{background:"#f5e8d8",borderRadius:20,height:8,overflow:"hidden"}}>
                          <div style={{width:`${Math.min(Number(pct),100)}%`,height:"100%",
                            borderRadius:20,
                            background:`linear-gradient(90deg,${info.color}80,${info.color})`,
                            transition:"width 0.9s cubic-bezier(0.4,0,0.2,1)",minWidth:4}}/>
                        </div>
                      </div>
                      <div style={{fontSize:20,fontWeight:900,color:"#c85820",
                        minWidth:52,textAlign:"right"}}>{pct}%</div>
                    </div>
                    {open&&(
                      <div style={{padding:"9px 14px 12px",background:"#fffaf5",
                        borderTop:"1px solid #f0d8b8",fontSize:12,color:"#5a3010",lineHeight:1.9}}>
                        <strong>📖 遺伝の説明：</strong><br/>{info.note}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
      <FootNote/>
    </div>
  );
}

/* 逆引き結果 */
function ReverseResults({data,childPat}){
  const info=P[childPat]||{};
  const rar=RARITY[info.rarity]||RARITY.uncommon;
  if(!data.length) return(
    <div style={{marginTop:24,textAlign:"center",padding:"24px",
      background:"white",borderRadius:16,color:"#a06040"}}>
      この柄の子猫が生まれる組み合わせが見つかりませんでした
    </div>
  );
  return(
    <div style={{marginTop:28}}>
      <h2 style={{textAlign:"center",fontSize:16,fontWeight:700,color:"#6a2e08",marginBottom:4}}>
        🔍「{info.label}」が生まれやすい両親の組み合わせ
      </h2>
      <p style={{textAlign:"center",fontSize:12,color:"#9a6040",marginBottom:16}}>
        確率が高い順に最大10パターン表示
      </p>
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        {data.map(({dad,mom,prob},i)=>{
          const pct=(prob*100).toFixed(1);
          const dInfo=P[dad.display]||{color:"#aaa"};
          const mInfo=P[mom.display]||{color:"#aaa"};
          return(
            <div key={i} style={{background:"white",borderRadius:16,
              boxShadow:"0 2px 12px rgba(180,80,20,0.1)",
              padding:"12px 14px",
              border:i===0?"2px solid #e87830":"2px solid transparent"}}>
              {i===0&&<div style={{fontSize:10,fontWeight:700,color:"#e87830",marginBottom:6}}>
                🏆 最も確率が高い組み合わせ
              </div>}
              <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:10}}>
                {/* 父 */}
                <div style={{flex:1,textAlign:"center"}}>
                  <KawaiiCat pattern={dad.display} size={60}/>
                  <div style={{fontSize:10,fontWeight:700,color:"#3a6ea8",marginTop:4}}>
                    🐾 父：{dad.label}
                  </div>
                </div>
                {/* × */}
                <div style={{fontSize:22,color:"#d09060",fontWeight:700}}>×</div>
                {/* 母 */}
                <div style={{flex:1,textAlign:"center"}}>
                  <KawaiiCat pattern={mom.display} size={60}/>
                  <div style={{fontSize:10,fontWeight:700,color:"#a83a6e",marginTop:4}}>
                    🌸 母：{mom.label}
                  </div>
                </div>
                {/* → */}
                <div style={{fontSize:22,color:"#d09060",fontWeight:700}}>→</div>
                {/* 子 */}
                <div style={{flex:1,textAlign:"center"}}>
                  <KawaiiCat pattern={childPat} size={60}/>
                  <div style={{fontSize:10,fontWeight:700,color:"#2a1000",marginTop:4}}>
                    🐣 {info.label}
                  </div>
                </div>
              </div>
              {/* バー */}
              <div style={{background:"#f5e8d8",borderRadius:20,height:8,overflow:"hidden"}}>
                <div style={{width:`${Math.min(Number(pct)*3,100)}%`,height:"100%",
                  borderRadius:20,
                  background:"linear-gradient(90deg,#e8783080,#e87830)",
                  transition:"width 0.9s cubic-bezier(0.4,0,0.2,1)",minWidth:4}}/>
              </div>
              <div style={{textAlign:"right",fontSize:16,fontWeight:900,
                color:"#c85820",marginTop:4}}>
                {pct}% の確率でこの柄が生まれる
              </div>
            </div>
          );
        })}
      </div>
      <FootNote/>
    </div>
  );
}

function ParentCard({title,accent,opts,val,set,cat}){
  const info=P[cat?.display]||{};
  const common=opts.filter(c=>P[c.display]?.rarity==="common");
  const uncommon=opts.filter(c=>P[c.display]?.rarity==="uncommon");
  const rares=opts.filter(c=>["rare","veryrare"].includes(P[c.display]?.rarity));
  return(
    <div style={{background:"white",borderRadius:18,overflow:"hidden",
      boxShadow:"0 3px 18px rgba(0,0,0,0.1)"}}>
      <div style={{background:accent,padding:"9px 13px",color:"white",fontWeight:700,fontSize:13}}>{title}</div>
      <div style={{padding:"12px 10px"}}>
        <div style={{textAlign:"center",marginBottom:10}}>
          <KawaiiCat pattern={cat?.display} size={80}/>
          <div style={{fontSize:12,fontWeight:700,color:"#2a1000",marginTop:6}}>
            {P[cat?.display]?.label||""}
          </div>
        </div>
        <select value={val} onChange={e=>set(e.target.value)} style={{
          width:"100%",padding:"7px 8px",borderRadius:10,
          border:"2px solid #f0d8c0",fontSize:12,
          background:"#fffaf5",color:"#2a1000",
          outline:"none",cursor:"pointer",fontFamily:"inherit"}}>
          <optgroup label="── よく見る">
            {common.map(c=><option key={c.id} value={c.id}>{c.label}</option>)}
          </optgroup>
          <optgroup label="── やや稀">
            {uncommon.map(c=><option key={c.id} value={c.id}>{c.label}</option>)}
          </optgroup>
          <optgroup label="── 稀（遺伝学用）">
            {rares.map(c=><option key={c.id} value={c.id}>{c.label}</option>)}
          </optgroup>
        </select>
      </div>
    </div>
  );
}

function ComboHint({dad,mom}){
  if(!dad||!mom)return null;
  const hints=[];
  if(mom.O==="Oo")               hints.push("🐾 母がサビ/三毛(XOXo) → 三毛・サビが生まれる可能性");
  if(dad.D==="d"||mom.D==="d")   hints.push("💧 希釈遺伝子(d)持ち → ブルー・クリームの可能性");
  if(dad.W||mom.W)               hints.push("⬜ 優性白(W)持ち → 白猫が生まれる可能性");
  if(dad.S?.includes("S")||mom.S?.includes("S"))hints.push("🔵 白斑(S)持ち → ブチ・ハチワレの可能性");
  if(!hints.length)return null;
  return(
    <div style={{marginTop:12,padding:"10px 14px",background:"rgba(60,120,200,0.07)",
      borderRadius:12,fontSize:11,color:"#2a4a7a",lineHeight:2}}>
      <strong>🧬 この組み合わせのポイント</strong><br/>
      {hints.map((h,i)=><div key={i}>{h}</div>)}
    </div>
  );
}

function FootNote(){
  return(
    <div style={{marginTop:14,padding:"12px 14px",background:"rgba(180,100,40,0.07)",
      borderRadius:12,fontSize:11,color:"#7a4020",lineHeight:1.9}}>
      <strong>⚠️ 注意事項</strong><br/>
      ・本計算は主要6遺伝子座（W/B/D/A/S/O）の簡略モデルです<br/>
      ・「稀☆☆☆」の柄は日本の野良猫にはほぼ存在しません<br/>
      ・三毛・サビ猫がオスになる確率は染色体異常（XXY等）の場合のみです
    </div>
  );
}
