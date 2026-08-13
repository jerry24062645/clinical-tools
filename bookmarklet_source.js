(()=>{
const ID='__acl645r', KEY='__acl645rcache';
if(document.getElementById(ID)){document.getElementById(ID).remove();return}
let S={byDate:{},mode:'AUTO'};try{S={...S,...JSON.parse(sessionStorage.getItem(KEY)||'{}')}}catch(e){}
if(!S.byDate||typeof S.byDate!=='object')S.byDate={};
const save=()=>sessionStorage.setItem(KEY,JSON.stringify(S));
const txt=()=>{const c=document.body?.cloneNode(true);if(!c)return '';c.querySelector('#'+ID)?.remove();return c.innerText||''};
const clean=s=>String(s||'').replace(/\s+/g,' ').trim();
function rows(){return [...document.querySelectorAll('tr')].filter(tr=>!tr.closest('#'+ID)).map(tr=>[...tr.querySelectorAll('th,td')].map(td=>clean(td.innerText))).filter(r=>r.length>=4)}
const dateRe=/(\d{2,3}\/\d{2}\/\d{2})/;
const timeRe=/\b([01]?\d|2[0-3]):[0-5]\d\b/;
function rowDate(r){for(const c of r){const m=c.match(dateRe);if(m)return m[1]}return null}
function rowTime(r){for(const c of r){const m=c.match(timeRe);if(m)return m[0]}return ''}
function ensureDate(date){
  if(!date)return null;
  if(!S.byDate[date])S.byDate[date]={labs:{},urine:{},bloodGas:{},cbcDiff:{},series:{poc:[]},stool:{},special:{},echo:{},inbody:{},cxr:{},pvr:{}};
  const g=S.byDate[date];
  g.labs||={};g.urine||={};g.bloodGas||={};g.cbcDiff||={};g.series||={poc:[]};g.series.poc||=[];g.stool||={};g.special||={};g.echo||={};g.inbody||={};g.cxr||={};g.pvr||={};
  return g;
}
function parseRef(after){
  let lo=NaN,hi=NaN;
  for(const c0 of after.slice(0,4)){
    const c=clean(c0).replace(/～|~|–|—/g,'-');
    let m=c.match(/^\s*(?:<|≤|<=)\s*(-?\d+(?:\.\d+)?)/);if(m){hi=+m[1];break}
    m=c.match(/^\s*(?:>|≥|>=)\s*(-?\d+(?:\.\d+)?)/);if(m){lo=+m[1];break}
    m=c.match(/^\s*(-?\d+(?:\.\d+)?)\s*-\s*(-?\d+(?:\.\d+)?)/);if(m){lo=+m[1];hi=+m[2];break}
  }
  if(!Number.isFinite(lo)&&!Number.isFinite(hi)){
    const nums=after.filter(c=>/^-?\d+(?:\.\d+)?$/.test(c)).map(Number);
    if(nums.length>=2){lo=nums[0];hi=nums[1]}
  }
  return {lo,hi};
}
function flag(v,lo,hi){const x=parseFloat(v);if(!Number.isFinite(x))return v;return (Number.isFinite(hi)&&x>hi?'H ':(Number.isFinite(lo)&&x<lo?'L ':''))+v}
function numericAfter(r,ni){
  for(let i=ni+1;i<r.length;i++)if(/^-?\d+(?:\.\d+)?$/.test(r[i]))return {i,v:r[i]};
  return null;
}
function textValueAfter(r,ni){for(let i=ni+1;i<r.length;i++){const v=clean(r[i]);if(v&&!/^(完報|收件|無資料)$/i.test(v))return {i,v}}return null}
function reportDate(kind,t){
 const rr=rows(); const re=kind==='echo'?/echo|Doppler color flow mapping|心臟血流圖/i:/身體組成分析|InBody|BCM-1/i;
 for(const r of rr){if(re.test(r.join(' '))){const d=rowDate(r);if(d)return d}}
 const m=t.match(dateRe);return m?m[1]:null;
}
function reportDateBy(re,t){
 for(const r of rows()){if(re.test(r.join(' '))){const d=rowDate(r);if(d)return d}}
 const m=t.match(dateRe);return m?m[1]:null;
}
const aliases={
 hba1c:/^HbA1c$/i,eag:/Estimated average glucose|^eAG$/i,
 gluAC:/^Glucose-AC$|^Glu-AC$|飯前血糖/i,gluPC:/^Glucose-PC$|^Glu-PC$|飯後血糖/i,
 tc:/^(?:Cholesterol|Cholesterol Total|Total Cholesterol|TC)$/i,tg:/^(?:TG|Triglyceride|Triglycerides)$/i,
 hdl:/H\.?D\.?L\.?\s*cholesterol|^HDL(?:-C)?$/i,ldl:/L\.?D\.?L\.?\s*cholesterol|^LDL(?:-C)?$/i,
 ua:/Uric Acid/i,bun:/^BUN$/i,cr:/^Creatinine$/i,egfr:/^eGFR$/i,
 ast:/^(?:S-GOT|AST)$/i,alt:/^(?:S-GPT|ALT)$/i,tbil:/Bilirubin Total/i,dbil:/Bilirubin direct/i,alb:/^Albumin$/i,
 na:/^Na$/i,k:/^K$/i,cl:/^CL$/i,ca:/^Ca\s*\(B\)$/i,mg:/^MG$/i,p:/^P$/i,
 crp:/^CRP$/i,pct:/Procalcitonin\s*\(PCT\)|^PCT$/i,lactate:/Lactic Acid/i,amylase:/Amylase/i,lipase:/^Lipase$/i,ddimer:/D-?Dimer/i,
 tsh:/^TSH$/i,ft4:/^(?:Free T4|FT4)$/i,t3:/^T3$/i,
 wbc:/白血球計數WBC|^WBC$/i,hb:/血色素Hemoglobin|^Hemoglobin$|^HGB$|^Hb$/i,mcv:/^MCV$/i,plt:/血小板計數Platelet|^Platelet$/i,
 uacr:/Microalbumin\/Cr urine ratio|Microalbumin\/Cr|^UACR$/i,upcr:/^UPCR$/i,urineTP:/TP-spot urine/i,
 pra:/Renin activity|^PRA$/i,pac:/^Aldosterone$|^PAC$/i
};
const units={hba1c:'%',eag:'mg/dL',gluAC:'mg/dL',gluPC:'mg/dL',tc:'mg/dL',tg:'mg/dL',hdl:'mg/dL',ldl:'mg/dL',ua:'mg/dL',bun:'mg/dL',cr:'mg/dL',egfr:'',ast:'U/L',alt:'U/L',tbil:'mg/dL',dbil:'mg/dL',alb:'g/dL',na:'mmol/L',k:'mmol/L',cl:'mmol/L',ca:'mg/dL',mg:'mg/dL',p:'mg/dL',crp:'mg/dL',pct:'ng/mL',lactate:'mg/dL',amylase:'U/L',lipase:'U/L',ddimer:'ng/mL',tsh:'uIU/mL',ft4:'ng/dL',t3:'ng/mL',wbc:'10^3/uL',hb:'g/dL',mcv:'fL',plt:'10^3/uL',uacr:'mg/g',upcr:'mg/g',urineTP:'mg/L',pra:'ng/mL/hr',pac:'ng/dL'};
function parseLabs(){
 let changed=false;
 for(const r of rows()){
   let hit=null;
   for(let ci=0;ci<r.length;ci++){
     const c=r[ci];
     const key=Object.keys(aliases).find(k=>aliases[k].test(c));
     if(key){hit={key,name:c,ni:ci};break}
   }
   if(!hit)continue;
   const date=rowDate(r);if(!date)continue;
   const nv=numericAfter(r,hit.ni);if(!nv)continue;
   let val=nv.v; const {lo,hi}=parseRef(r.slice(nv.i+1));
   const g=ensureDate(date); let fv=flag(val,lo,hi);
   if(hit.key==='uacr'){
      const x=parseFloat(val);if(Number.isFinite(x)&&x<1){const conv=x*1000;val=String(Number(conv.toFixed(1)));fv=flag(val,30,NaN)}
      else fv=flag(val,NaN,30);
   }
   g.labs[hit.key]={v:fv,raw:val,unit:units[hit.key]||''};changed=true;
 }
 if(changed)save();
}
const diffAliases={neut:/NEUT/i,lymp:/LYMP/i,mono:/MONO/i,eosi:/EOSI/i,baso:/BASO/i};
function parseCBCDiff(){let changed=false;for(const r of rows()){let hit=null;for(let i=0;i<r.length;i++){const k=Object.keys(diffAliases).find(k=>diffAliases[k].test(r[i]));if(k){hit={k,ni:i};break}}if(!hit)continue;const d=rowDate(r);if(!d)continue;const nv=numericAfter(r,hit.ni);if(!nv)continue;ensureDate(d).cbcDiff[hit.k]=nv.v;changed=true}if(changed)save()}
const urineAliases={mucus:/^(?:黏液)?Mucus$/i,rbc:/尿紅血球R\.?B\.?C\.?|^R\.?B\.?C\.?$/i,parasite:/寄生蟲|Parasite/i,yeast:/Yeast\/Fungi|酵母菌|黴菌/i,bil:/尿膽紅素BIL|^BIL$/i,sg:/Sp\.?gr|尿比重/i,ph:/酸鹼度PH|^PH$/i,ket:/酮體Ket|^Ket$/i,ep:/EP cell|尿上皮細胞/i,cast:/Cast|尿圓柱/i,clarity:/Clarity|尿濁度/i,pro:/尿蛋白PRO|^PRO$/i,ob:/潛血OB|^OB$/i,le:/Leukocyte esterase/i,bacteria:/Bacteria|細菌/i,uro:/尿膽元Uro|^Uro$/i,wbc:/尿白血球W\.?B\.?C\.?|^W\.?B\.?C\.?$/i,color:/Color|尿顏色/i,glu:/尿糖Glu|^Glu$/i,nit:/亞硝酸鹽Nit|^Nit$/i,crystal:/Crystal|尿結晶/i};
function parseUrine(){
 let changed=false,currentDate=null,inUrine=false;
 for(const r of rows()){
   const joined=r.join(' ');const rd=rowDate(r);if(rd)currentDate=rd;
   if(/Urine Routine|尿液一般檢驗|尿液生化/i.test(joined))inUrine=true;
   if(inUrine&&/(血液檢驗|一般生化|特殊生化|氣體分析|Blood Gas|Venous Blood Gas|糞便檢驗|微生物|病理)/i.test(joined)&&!/尿液/i.test(joined))inUrine=false;
   let hit=null;for(let i=0;i<r.length;i++){const k=Object.keys(urineAliases).find(k=>urineAliases[k].test(r[i]));if(k){hit={k,ni:i};break}}
   if(!hit||!currentDate)continue;
   const tv=textValueAfter(r,hit.ni);if(!tv)continue;let val=tv.v;
   if(!/^(?:Negative|Positive|Clear|Colorless|[-+]|\+\/-|\d+(?:\.\d+)?(?:\s*[-~]\s*\d+(?:\.\d+)?)?|\d+\+|[A-Za-z ]+)$/i.test(val))continue;
   ensureDate(currentDate).urine[hit.k]=val;changed=true;
 }
 if(changed)save();
}
const gasAliases={ph:/^pH$/i,pco2:/^pCO2$/i,hco3:/^cHCO3$/i,be:/^BE$/i,po2:/^pO2$/i,so2:/^SO2\(c\)$/i};
function parseBloodGas(){
 let changed=false,currentType=null,currentDate=null;
 for(const r of rows()){
   const joined=r.join(' '),rd=rowDate(r);if(rd)currentDate=rd;
   if(/Venous Blood Gas/i.test(joined))currentType='VBG'; else if(/\bBlood Gas\b/i.test(joined)&&!/Venous/i.test(joined))currentType='ABG';
   if(currentType&&/(一般生化|血液檢驗|特殊生化|Urine Routine|尿液|糞便檢驗|微生物|病理)/i.test(joined)&&!/Blood Gas/i.test(joined))currentType=null;
   let hit=null;for(let i=0;i<r.length;i++){const k=Object.keys(gasAliases).find(k=>gasAliases[k].test(r[i]));if(k){hit={k,ni:i};break}}
   if(!hit||!currentType||!currentDate)continue;
   const nv=numericAfter(r,hit.ni);if(!nv)continue;const {lo,hi}=parseRef(r.slice(nv.i+1));
   const g=ensureDate(currentDate);g.bloodGas.type=currentType;g.bloodGas[hit.k]=flag(nv.v,lo,hi);changed=true;
 }
 if(changed)save();
}
function parseSpecialText(){
 let changed=false;
 for(const r of rows()){
   const d=rowDate(r);if(!d)continue;const g=ensureDate(d);
   for(let i=0;i<r.length;i++){
     const c=r[i];
     if(/Ketone Body\s*\(BLOOD\)/i.test(c)){const tv=textValueAfter(r,i);if(tv){g.special.bloodKetone=tv.v;changed=true}}
     if(/Transferrin-Stool/i.test(c)){const tv=textValueAfter(r,i);if(tv){g.stool.transferrin=tv.v;changed=true}}
     if(/Stool occult blood|FOBT\/EIA/i.test(c)){const tv=textValueAfter(r,i);if(tv){g.stool.ob=tv.v;changed=true}}
     if(/OneTouch.*Glucose|病房專用OneTouch/i.test(c)){
       const nv=numericAfter(r,i);if(nv){const {lo,hi}=parseRef(r.slice(nv.i+1));const item={time:rowTime(r),v:flag(nv.v,lo,hi),raw:nv.v};const sig=item.time+'|'+item.raw;if(!g.series.poc.some(x=>(x.time+'|'+x.raw)===sig))g.series.poc.push(item);changed=true}
     }
   }
 }
 if(changed)save();
}
function parseEcho(t){if(!/echo|M-MODE|DOPPLAER|DOPPLER|LVEF|diastolic function/i.test(t))return;const date=reportDate('echo',t);if(!date)return;const E=ensureDate(date).echo;let m;if(m=t.match(/LVEF\s*(?:about)?\s*(\d+(?:\.\d+)?)\s*%/i))E.lvef=m[1];if(/left ventricular hypertrophy|\bLVH\b/i.test(t))E.lvh=true;if(/preserved LV systolic|normal LV systolic function/i.test(t))E.sys='preserved LV systolic function';if(/normal diastolic function|Suggestive normal diastolic function/i.test(t))E.dia='normal LV diastolic function';for(const sev of ['trivial','mild','moderate','severe']){let re=new RegExp(sev+'\\s+([^\\n.]{0,60}(?:MR|TR|PR)[^\\n.]*)','ig');while(m=re.exec(t)){for(const v of ['MR','PR','TR'])if(new RegExp('\\b'+v+'\\b','i').test(m[1]))E[v]=sev}}if(m=t.match(/estimated PASP\s*(?:about)?\s*(\d+(?:\.\d+)?)\s*mmHg/i))E.pasp=m[1];save()}
function parseInbody(t){if(!/身體組成分析|InBody|PBF|體脂肪率/i.test(t))return;const date=reportDate('inbody',t);if(!date)return;const I=ensureDate(date).inbody;const pats={BW:/(?:體重|BW)\s*[:：]?\s*(\d+(?:\.\d+)?)/i,BMI:/\bBMI\s*[:：]?\s*(\d+(?:\.\d+)?)/i,PBF:/(?:PBF|體脂肪率)\s*(?:\(%\))?\s*[:：]?\s*(\d+(?:\.\d+)?)/i,BFM:/(?:BFM|體脂肪量)\s*[:：]?\s*(\d+(?:\.\d+)?)/i,SMM:/(?:SMM|肌肉量)\s*[:：]?\s*(\d+(?:\.\d+)?)/i,VFA:/(?:VFA|內臟脂肪指數)\s*[:：]?\s*(\d+(?:\.\d+)?)/i};for(const[k,re]of Object.entries(pats)){const m=t.match(re);if(m)I[k]=m[1]}save()}
function parseCXR(t){
 const head=/胸部檢查第一張|Chest\s*(?:X-?ray|radiograph)|\bCXR\b/i;
 if(!head.test(t))return;
 const date=reportDateBy(head,t);if(!date)return;
 const C=ensureDate(date).cxr;
 const lines=t.split(/\n+/).map(x=>clean(x)).filter(Boolean);
 const findings=[];
 for(const line of lines){
   if(/ground-glass lesion.*might be missed|plain chest radiography|Note that ground-glass/i.test(line))continue;
   if(/^[-•]\s*/.test(line)){
     const z=line.replace(/^[-•]\s*/, '').trim();
     if(z && !/^(?:報告內容|診療項目|Auto Clinical Lab|CXR:)/i.test(z) && !/^[#|_\-]+$/.test(z))findings.push(z.replace(/\s+/g,' '));
   }
 }
 if(!findings.length){
   for(const pat of [/Increased interstitial marking[^\n.]*(?:\.|$)/i,/Spondylosis[^\n.]*(?:\.|$)/i,/S\/?P feeding tube insertion\.?/i,/cardiomegaly[^\n.]*(?:\.|$)/i,/pleural effusion[^\n.]*(?:\.|$)/i]){const m=t.match(pat);if(m)findings.push(clean(m[0]))}
 }
 if(findings.length)C.findings=[...new Set(findings)];
 save();
}
function parsePVR(t){
 const head=/心內動脈分段血流及壓力之測定\s*PUR|Pulse\s*volume\s*recording|四肢血流探測\s*[,，]?\s*壓力測量並記錄/i;
 if(!head.test(t))return;
 const date=reportDateBy(head,t);if(!date)return;
 const P=ensureDate(date).pvr;
 const lines=t.split(/\n+/).map(x=>clean(x)).filter(Boolean);
 for(const line of lines){
   let m=line.match(/^NORMAL\s*\|\s*(\d+(?:\.\d+)?)\s*\|\s*(\d+(?:\.\d+)?)?\s*\|?/i);
   if(m){if(m[1]){P.R=m[1];P.Rstatus='normal'}if(m[2]){P.L=m[2];P.Lstatus='normal'};continue}
   m=line.match(/^ABNORMAL\s*\|\s*(\d+(?:\.\d+)?)?\s*\|\s*(\d+(?:\.\d+)?)?\s*\|?/i);
   if(m){if(m[1]){P.R=m[1];P.Rstatus='abnormal'}if(m[2]){P.L=m[2];P.Lstatus='abnormal'};continue}
   m=line.match(/^N\/?C arteries\s*\|\s*(\d+(?:\.\d+)?)?\s*\|\s*(\d+(?:\.\d+)?)?/i);
   if(m){if(m[1]){P.R=m[1];P.Rstatus='noncompressible'}if(m[2]){P.L=m[2];P.Lstatus='noncompressible'}}
 }
 // Common text fallbacks: Right ABI / Left ABI or ABI R/L.
 let m;if(!P.R&&(m=t.match(/(?:Right\s*ABI|ABI\s*R(?:ight)?)\s*[:=]?\s*(\d+(?:\.\d+)?)/i)))P.R=m[1];
 if(!P.L&&(m=t.match(/(?:Left\s*ABI|ABI\s*L(?:eft)?)\s*[:=]?\s*(\d+(?:\.\d+)?)/i)))P.L=m[1];
 if(!P.R){m=t.match(/NORMAL\s*\|\s*(\d+(?:\.\d+)?)/i);if(m){P.R=m[1];P.Rstatus='normal'}}
 if(!P.L){m=t.match(/ABNORMAL\s*\|(?:\s*\|)?\s*(\d+(?:\.\d+)?)\s*\|/i);if(m){P.L=m[1];P.Lstatus='abnormal'}}
 save();
}
function parseAll(){const t=txt();parseLabs();parseCBCDiff();parseUrine();parseBloodGas();parseSpecialText();parseEcho(t);parseInbody(t);parseCXR(t);parsePVR(t)}
function v(L,k){return L[k]?.v}
function formatGroup(g){
 const L=g.labs||{},U=g.urine||{},E=g.echo||{},I=g.inbody||{},CXR=g.cxr||{},PVR=g.pvr||{},D=g.cbcDiff||{},BG=g.bloodGas||{},SP=g.special||{},ST=g.stool||{},lines=[];let a=[];
 if(v(L,'hba1c')){let x=`HbA1c ${v(L,'hba1c')}%`;if(v(L,'eag'))x+=` (eAG ${v(L,'eag')} mg/dL)`;a.push(x)}if(v(L,'gluAC'))a.push(`Glu-AC ${v(L,'gluAC')} mg/dL`);else if(v(L,'gluPC'))a.push(`Glu-PC ${v(L,'gluPC')} mg/dL`);if(v(L,'uacr'))a.push(`UACR ${v(L,'uacr')} mg/g`);if(v(L,'upcr'))a.push(`UPCR ${v(L,'upcr')} mg/g`);if(a.length)lines.push('• '+a.join('; '));
 if(v(L,'wbc')||v(L,'hb')||v(L,'plt')||Object.keys(D).length){a=[];if(v(L,'wbc'))a.push(`WBC ${v(L,'wbc')}`);if(v(L,'hb'))a.push(`Hb ${v(L,'hb')}`);if(v(L,'plt'))a.push(`Plt ${v(L,'plt')}`);if(['neut','lymp','mono','eosi','baso'].every(k=>D[k]))a.push(`N/L/M/E/B ${D.neut}/${D.lymp}/${D.mono}/${D.eosi}/${D.baso}%`);lines.push('• CBC: '+a.join('; '))}
 a=[];let lip=['tc','tg','hdl','ldl'].filter(k=>v(L,k));if(lip.length)a.push(`${lip.map(k=>({tc:'TC',tg:'TG',hdl:'HDL',ldl:'LDL'}[k])).join('/')} ${lip.map(k=>v(L,k)).join('/')} mg/dL`);if(v(L,'ua'))a.push(`UA ${v(L,'ua')} mg/dL`);if(a.length)lines.push('• '+a.join('; '));
 a=[];if(v(L,'bun'))a.push(`BUN ${v(L,'bun')}`);if(v(L,'cr'))a.push(`Cr ${v(L,'cr')}`);if(v(L,'egfr'))a.push(`eGFR ${v(L,'egfr')}`);let renal=a.length?a.join('/'):'';let ele=[];for(const k of ['na','k','cl'])if(v(L,k))ele.push(`${k==='na'?'Na':k==='k'?'K':'Cl'} ${v(L,k)}`);let minerals=[];for(const k of ['ca','p','mg'])if(v(L,k))minerals.push(`${k==='ca'?'Ca':k==='p'?'P':'Mg'} ${v(L,k)}`);let seg=[];if(renal)seg.push(renal);if(ele.length)seg.push(ele.join('/'));if(minerals.length)seg.push(minerals.join('/'));if(seg.length)lines.push('• '+seg.join('; '));
 a=[];if(v(L,'ast'))a.push(`AST ${v(L,'ast')}`);if(v(L,'alt'))a.push(`ALT ${v(L,'alt')}`);if(v(L,'tbil'))a.push(`T-bil ${v(L,'tbil')}`);if(v(L,'dbil'))a.push(`D-bil ${v(L,'dbil')}`);if(v(L,'alb'))a.push(`Alb ${v(L,'alb')}`);if(a.length)lines.push('• '+a.join('; '));
 a=[];if(v(L,'crp'))a.push(`CRP ${v(L,'crp')} mg/dL`);if(v(L,'pct'))a.push(`PCT ${v(L,'pct')} ng/mL`);if(v(L,'lactate'))a.push(`Lactate ${v(L,'lactate')} mg/dL`);if(v(L,'ddimer'))a.push(`D-dimer ${v(L,'ddimer')} ng/mL`);if(a.length)lines.push('• '+a.join('; '));
 a=[];if(v(L,'amylase'))a.push(`Amylase ${v(L,'amylase')} U/L`);if(v(L,'lipase'))a.push(`Lipase ${v(L,'lipase')} U/L`);if(a.length)lines.push('• '+a.join('; '));
 a=[];if(v(L,'ft4'))a.push(`FT4 ${v(L,'ft4')} ng/dL`);if(v(L,'tsh'))a.push(`TSH ${v(L,'tsh')} uIU/mL`);if(v(L,'t3'))a.push(`T3 ${v(L,'t3')} ng/mL`);if(a.length)lines.push('• TFT: '+a.join('; '));
 if(v(L,'pra')||v(L,'pac')){a=[];if(v(L,'pra'))a.push(`PRA ${v(L,'pra')} ng/mL/hr`);if(v(L,'pac'))a.push(`PAC ${v(L,'pac')} ng/dL`);lines.push('• '+a.join('; '))}
 if(v(L,'urineTP'))lines.push(`• Urine TP ${v(L,'urineTP')} mg/L`);
 if(Object.keys(U).length){const p=[],labels={glu:'Glu',pro:'PRO',ket:'Ket',ob:'OB',nit:'Nit',le:'LE',rbc:'RBC',wbc:'WBC',bacteria:'Bacteria',sg:'Sp.gr',ph:'pH'};for(const k of ['glu','pro','ket','ob','nit','le','rbc','wbc','bacteria','sg','ph'])if(U[k]!==undefined){let z=U[k];if(['rbc','wbc'].includes(k)&&/^\d+\s*[-~]\s*\d+$/i.test(z))z=z.replace(/\s*~\s*/,'-')+'/HPF';p.push(`${labels[k]} ${z}`)}if(p.length)lines.push('• Urine: '+p.join('; '))}
 if(Object.keys(BG).length){a=[];for(const [k,label,unit] of [['ph','pH',''],['pco2','pCO2',' mmHg'],['hco3','HCO3',' mmol/L'],['be','BE',' mmol/L'],['po2','pO2',' mmHg'],['so2','sO2','%']])if(BG[k])a.push(`${label} ${BG[k]}${unit}`);if(a.length)lines.push(`• ${BG.type||'Blood gas'}: `+a.join('; '))}
 if(SP.bloodKetone)lines.push(`• Ketone ${SP.bloodKetone}`);
 if(g.series?.poc?.length){const arr=[...g.series.poc].sort((a,b)=>(a.time||'99:99').localeCompare(b.time||'99:99'));lines.push('• Glucose: '+arr.map(x=>`${x.time||''} ${x.v}`.trim()).join(' → ')+' mg/dL')}
 if(ST.ob||ST.transferrin){a=[];if(ST.ob)a.push(`Stool OB ${ST.ob}`);if(ST.transferrin)a.push(`Stool transferrin ${ST.transferrin}`);lines.push('• '+a.join('; '))}
 if(Object.keys(E).length){a=[];if(E.lvh)a.push('LVH');if(E.lvef)a.push(`LVEF ${E.lvef}%`);if(E.sys)a.push(E.sys);if(E.dia)a.push(E.dia);for(const sev of ['trivial','mild','moderate','severe']){const vs=['MR','PR','TR'].filter(x=>E[x]===sev);if(vs.length)a.push(`${sev} ${vs.join('/')}`)}if(E.pasp)a.push(`PASP ${E.pasp} mmHg`);if(a.length)lines.push('• Echo: '+a.join('; '))}
 if(Object.keys(I).length){const p=[];for(const k of ['BW','BMI','PBF','BFM','SMM','VFA'])if(I[k])p.push(`${k} ${I[k]}${k==='PBF'?'%':''}`);if(p.length)lines.push('• InBody: '+p.join('; '))}
 if(CXR.findings?.length)lines.push('• CXR: '+CXR.findings.join('; '))
 if(PVR.R||PVR.L){a=[];if(PVR.R)a.push(`R ${PVR.R}${PVR.Rstatus&&PVR.Rstatus!=='normal'?` (${PVR.Rstatus})`:''}`);if(PVR.L)a.push(`L ${PVR.L}${PVR.Lstatus&&PVR.Lstatus!=='normal'?` (${PVR.Lstatus})`:''}`);if(a.length)lines.push('• ABI: '+a.join('; '))}
 return lines;
}
function dateKey(d){const p=d.split('/').map(Number);return p[0]*10000+p[1]*100+p[2]}
function fmt(){parseAll();const dates=Object.keys(S.byDate).filter(d=>formatGroup(S.byDate[d]).length).sort((a,b)=>dateKey(b)-dateKey(a));return dates.map(d=>`${d}\n${formatGroup(S.byDate[d]).join('\n')}`).join('\n\n')}
const d=document.createElement('div');d.id=ID;d.style='position:fixed;z-index:2147483647;right:12px;top:12px;width:min(720px,calc(100vw - 24px));max-height:calc(100vh - 24px);overflow:auto;background:#fff;color:#243746;border:1px solid #ccd3db;border-radius:14px;box-shadow:0 12px 40px #0004;padding:14px;font:14px Arial,sans-serif';
d.innerHTML=`<div style="display:flex;justify-content:space-between"><b>Auto Clinical Lab v6.4.5</b><button id=aX>×</button></div><div style="margin:8px 0;font-size:12px">Mode <select id=aM><option>AUTO</option><option>OPD</option><option>IPD</option></select> <span id=aD></span></div><pre id=aR style="white-space:pre-wrap;background:#f7f9fb;padding:10px;border-radius:9px;min-height:50px"></pre><div style="display:flex;gap:8px;flex-wrap:wrap"><button id=aC>Copy</button><button id=aK>Clear cache</button><button id=aS>Windows 剪取工具</button></div><div id=aMsg style="font-size:11px;color:#667085;margin-top:8px">自動讀取並依完報日累積；新增 CXR、PVR/ABI。Windows 截圖：按「Windows 剪取工具」後用 Win+Shift+S 截圖，再回此頁 Ctrl+V。</div><div id=aCap style="display:none;margin-top:8px"><img id=aImg alt="Captured screen" style="max-width:100%;max-height:220px;border:1px solid #ccd3db;border-radius:8px"></div>`;document.body.appendChild(d);
const R=d.querySelector('#aR'),D=d.querySelector('#aD');function draw(){const t=txt();const det=/\b住院\b/.test(t)?'IPD':/\b門診\b|\b急診\b/.test(t)?'OPD':'?';D.textContent='Detected: '+det;R.textContent=fmt()}
let tm;const sch=()=>{clearTimeout(tm);tm=setTimeout(draw,250)};addEventListener('scroll',sch,{passive:true});new MutationObserver(sch).observe(document.body,{subtree:true,childList:true,characterData:true});
const MSG=d.querySelector('#aMsg'),CAP=d.querySelector('#aCap'),IMG=d.querySelector('#aImg');const setMsg=(s,bad=false)=>{MSG.textContent=s;MSG.style.color=bad?'#b42318':'#667085'};const showCapture=dataUrl=>{if(!dataUrl)return;IMG.src=dataUrl;CAP.style.display='block';setMsg('截圖已貼上 ✓（目前僅預覽，ECG OCR 尚未自動判讀）')};
function handlePaste(ev){const items=[...(ev.clipboardData?.items||[])];const it=items.find(x=>x.type&&x.type.startsWith('image/'));if(!it)return;const f=it.getAsFile();if(!f)return;const rd=new FileReader();rd.onload=()=>showCapture(rd.result);rd.readAsDataURL(f);ev.preventDefault()}
d.addEventListener('paste',handlePaste);document.addEventListener('paste',handlePaste);
d.querySelector('#aC').onclick=()=>navigator.clipboard.writeText(R.textContent);d.querySelector('#aK').onclick=()=>{S={byDate:{},mode:'AUTO'};sessionStorage.removeItem(KEY);R.textContent='';CAP.style.display='none';IMG.removeAttribute('src');setMsg('Cache cleared.');};d.querySelector('#aX').onclick=()=>d.remove();d.querySelector('#aS').onclick=()=>{setMsg('請按 Win+Shift+S 開啟 Windows 剪取工具 → 框選畫面 → 回 HIS 按 Ctrl+V。');d.tabIndex=-1;d.focus();};draw();
})()
