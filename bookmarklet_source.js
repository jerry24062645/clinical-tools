(()=>{
const ID='__acl644', KEY='__acl651cache';
if(document.getElementById(ID)){document.getElementById(ID).remove();return}
let S={byDate:{},mode:'AUTO'};try{S={...S,...JSON.parse(sessionStorage.getItem(KEY)||'{}')}}catch(e){}
if(!S.byDate||typeof S.byDate!=='object')S.byDate={};
const save=()=>sessionStorage.setItem(KEY,JSON.stringify(S));
const txt=()=>{try{const b=document.body?.cloneNode(true);if(!b)return'';b.querySelector('#'+ID)?.remove();return b.innerText||''}catch(e){return document.body?.innerText||''}};
function clinicalView(){
  const t=txt();
  const isLab=/細項名稱/.test(t)&&/檢驗值/.test(t)&&/診療項目/.test(t);
  const isReport=/申請序號/.test(t)&&/診療項目/.test(t)&&(/完報時間/.test(t)||/報告內容/.test(t)||/檢視影像/.test(t));
  return isLab?'LAB':(isReport?'REPORT':'');
}
const clean=s=>String(s||'').replace(/\s+/g,' ').trim();
const dateRe=/(\d{2,3}\/\d{2}\/\d{2})/;
const timeRe=/\b([01]?\d|2[0-3]):[0-5]\d\b/;
const completionHeaderRe=/^(?:最終)?完報(?:日(?:時)?|時間|日時)$/i;
function rows(){
  const out=[];
  for(const table of document.querySelectorAll('table')){
    let completionIdx=-1;
    for(const tr of table.querySelectorAll('tr')){
      const r=[...tr.querySelectorAll('th,td')].map(td=>clean(td.innerText));
      if(r.length<4)continue;
      const idx=r.findIndex(c=>completionHeaderRe.test(c));
      if(idx>=0){completionIdx=idx;out.push(r);continue}
      if(completionIdx>=0&&r[completionIdx]){
        const m=r[completionIdx].match(dateRe);
        if(m)Object.defineProperty(r,'_completionDate',{value:m[1],enumerable:false});
      }
      out.push(r);
    }
  }
  return out;
}
function rowDate(r){
  if(r&&r._completionDate)return r._completionDate;
  const dates=[];
  for(const c of r||[]){const m=c.match(dateRe);if(m)dates.push(m[1])}
  const uniq=[...new Set(dates)];
  return uniq.length===1?uniq[0]:null;
}
function rowTime(r){for(const c of r){const m=c.match(timeRe);if(m)return m[0]}return ''}
function ensureDate(date){
  if(!date)return null;
  if(!S.byDate[date])S.byDate[date]={labs:{},urine:{},bloodGas:{},cbcDiff:{},series:{poc:[]},stool:{},special:{},echo:{},inbody:{},vascular:{},cxr:{},ecg:{}};
  const g=S.byDate[date];
  g.labs||={};g.urine||={};g.bloodGas||={};g.cbcDiff||={};g.series||={poc:[]};g.series.poc||=[];g.stool||={};g.special||={};g.echo||={};g.inbody||={};g.vascular||={};g.cxr||={};g.ecg||={};
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
 return null;
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
 pra:/Renin activity|^PRA$/i,pac:/^Aldosterone$|^PAC$/i,
 aptt:/^APTT$|^aPTT$/i,pt:/^Prothrombin time$|^PT$/i,inr:/^INR$/i
};
const units={hba1c:'%',eag:'mg/dL',gluAC:'mg/dL',gluPC:'mg/dL',tc:'mg/dL',tg:'mg/dL',hdl:'mg/dL',ldl:'mg/dL',ua:'mg/dL',bun:'mg/dL',cr:'mg/dL',egfr:'',ast:'U/L',alt:'U/L',tbil:'mg/dL',dbil:'mg/dL',alb:'g/dL',na:'mmol/L',k:'mmol/L',cl:'mmol/L',ca:'mg/dL',mg:'mg/dL',p:'mg/dL',crp:'mg/dL',pct:'ng/mL',lactate:'mg/dL',amylase:'U/L',lipase:'U/L',ddimer:'ng/mL',tsh:'uIU/mL',ft4:'ng/dL',t3:'ng/mL',wbc:'10^3/uL',hb:'g/dL',mcv:'fL',plt:'10^3/uL',uacr:'mg/g',upcr:'mg/g',urineTP:'mg/L',pra:'ng/mL/hr',pac:'ng/dL',aptt:'sec',pt:'sec',inr:''};
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
function parseVascular(t){
 if(!/心內動脈分段血流及壓力之測定|四肢血流探測\s*[,，]?\s*壓力測量並記錄|Pulse\s*volume\s*recording|\bABI\b/i.test(t))return;
 const rr=rows();let date=null;
 for(const r of rr){if(/心內動脈分段血流及壓力之測定|四肢血流探測\s*[,，]?\s*壓力測量並記錄|Pulse\s*volume\s*recording/i.test(r.join(' '))){date=rowDate(r);if(date)break}}
 if(!date)return;
 const V=ensureDate(date).vascular;
 // Parse the visible report body by lines. HIS layout is: interpretation | right | left |
 const ls=t.split(/\n+/).map(clean).filter(Boolean);
 let section='';
 for(const line of ls){
   if(/^N\/?C arteries\b/i.test(line))section='nc';
   else if(/^NORMAL\b/i.test(line))section='normal';
   else if(/^ABNORMAL\b/i.test(line))section='abnormal';
   const parts=line.split('|').map(clean);
   if(parts.length>=3){
     const label=parts[0], right=parts[1]||'', left=parts[2]||'';
     if(/interpretation/i.test(label)){V.interpR=right;V.interpL=left}
     else if(/N\/?C arteries/i.test(label)){V.ncR=right;V.ncL=left}
     else if(/NORMAL/i.test(label)){V.normalR=right;V.normalL=left}
     else if(/ABNORMAL/i.test(label)){V.abnormalR=right;V.abnormalL=left}
     else if(/ABI\s*[≥>=]\s*1\.3/i.test(label)){V.ncR=V.ncR||right;V.ncL=V.ncL||left}
     else if(/0\.9\s*[≤<].*ABI.*1\.3|0\.9.*ABI.*1\.3/i.test(label)){V.normalR=V.normalR||right;V.normalL=V.normalL||left}
     else if(/ABI\s*<\s*0\.9/i.test(label)){V.abnormalR=V.abnormalR||right;V.abnormalL=V.abnormalL||left}
   }
 }
 // Fallback: collect ABI-looking numeric values in report text if table separators were flattened.
 const nums=[...t.matchAll(/(?:^|\s|\|)(\d\.\d{1,2})(?=\s|\||$)/gm)].map(m=>m[1]).filter(x=>{const n=+x;return n>=0.2&&n<=2.0});
 if(!V.normalR&&!V.normalL&&!V.abnormalR&&!V.abnormalL&&nums.length){V.values=[...new Set(nums)].slice(0,4)}
 save();
}

function reportDateBy(re){for(const r of rows()){if(re.test(r.join(' '))){const d=rowDate(r);if(d)return d}}return null}
function parseCXR(t){
 const itemRe=/胸部檢查第一張|胸部X光|Chest\s*(?:X[- ]?ray|radiograph)|\bCXR\b/i;
 const date=reportDateBy(itemRe);if(!date)return;
 const joinedRows=rows().map(r=>r.join(' ')).join('\n');if(!itemRe.test(joinedRows))return;
 const lines=t.split(/\r?\n/).map(x=>clean(x)).filter(Boolean);const keep=[];
 for(let line of lines){
   if(/^[-•]\s*/.test(line))line=line.replace(/^[-•]\s*/, ''); else continue;
   if(/ground-glass lesion.*might be missed|plain chest radiography/i.test(line))continue;
   if(/^[-=#|]+$/.test(line))continue;
   if(line.length<6)continue;
   keep.push(line.replace(/\s+/g,' ').trim());
 }
 const meaningful=keep.filter(x=>/[A-Za-z]{3,}/.test(x)&&!/^[\s\-_=#|.;,:]+$/.test(x));
 if(meaningful.length){const C=ensureDate(date).cxr;C.findings=[...new Set([...(C.findings||[]),...meaningful])].filter(x=>/[A-Za-z]{3,}/.test(x)&&!/^[\s\-_=#|.;,:]+$/.test(x));save()}
}

function rocDateFromOCR(t){let m=t.match(/\b(20\d{2})[\/.-](\d{1,2})[\/.-](\d{1,2})\b/);if(!m)return null;const y=+m[1]-1911;if(y<=0)return null;return `${y}/${String(+m[2]).padStart(2,'0')}/${String(+m[3]).padStart(2,'0')}`}
function ecgParseText(t){
 const z=String(t||'').replace(/\r/g,'\n');const E={};let m;
 if(m=z.match(/(?:^|\n|\s)Rate\s*[:=]?\s*(\d{2,3})\b/i))E.hr=m[1];
 if(m=z.match(/(?:^|\n|\s)PR\s*[:=]?\s*(\d{2,3})\b/i))E.pr=m[1];
 if(m=z.match(/QRSd?\s*[:=]?\s*(\d{2,3})\b/i))E.qrs=m[1];
 if(m=z.match(/(?:^|\n|\s)QT\s*[:=]?\s*(\d{2,3})\b/i))E.qt=m[1];
 if(m=z.match(/QTc\s*[:=]?\s*(\d{2,3})\b/i))E.qtc=m[1];
 if(m=z.match(/(?:^|\n)\s*P\s+(\-?\d{1,3})\b/im))E.paxis=m[1];
 if(m=z.match(/(?:^|\n)\s*QRS\s+(\-?\d{1,3})\b/im))E.qrsaxis=m[1];
 if(m=z.match(/(?:^|\n)\s*T\s+(\-?\d{1,3})\b/im))E.taxis=m[1];
 if(/Sinus\s+rhythm/i.test(z))E.rhythm='Sinus rhythm';
 if(/borderline\s+right\s+axis\s+deviation/i.test(z))E.rad='borderline right axis deviation';
 else if(/right\s+axis\s+deviation/i.test(z))E.rad='right axis deviation';
 if(/consider\s+left\s+ventricular\s+hypertrophy/i.test(z))E.lvh='consider LVH';
 else if(/left\s+ventricular\s+hypertrophy/i.test(z))E.lvh='LVH';
 if(/ST\s*elev[^\n]{0,80}(?:early\s+repol|early\s+repolarization)/i.test(z))E.st='ST elevation, probable normal early repolarization pattern';
 else if(/ST\s+elevation/i.test(z))E.st='ST elevation';
 const date=rocDateFromOCR(z);
 return {date,E};
}
function storeECGText(t){const {date,E}=ecgParseText(t);const dte=date||reportDateBy(/EKG|ECG|心電圖/i)||Object.keys(S.byDate).sort((a,b)=>dateKey(b)-dateKey(a))[0];if(!dte||!Object.keys(E).length)return false;Object.assign(ensureDate(dte).ecg,E);save();return true}
async function loadTesseract(){
 if(window.Tesseract?.recognize)return window.Tesseract;
 return await new Promise((resolve,reject)=>{const old=document.getElementById('__aclTesseract');if(old){let n=0;const tm=setInterval(()=>{if(window.Tesseract?.recognize){clearInterval(tm);resolve(window.Tesseract)}else if(++n>40){clearInterval(tm);reject(new Error('OCR engine did not load'))}},250);return}const s=document.createElement('script');s.id='__aclTesseract';s.src='https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js';s.onload=()=>window.Tesseract?.recognize?resolve(window.Tesseract):reject(new Error('OCR engine unavailable'));s.onerror=()=>reject(new Error('HIS blocked the OCR engine'));document.head.appendChild(s)})
}
async function preprocessECG(dataUrl){return await new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>{try{const cropH=Math.max(220,Math.floor(im.height*0.34));const scale=2,c=document.createElement('canvas');c.width=im.width*scale;c.height=cropH*scale;const x=c.getContext('2d');x.drawImage(im,0,0,im.width,cropH,0,0,c.width,c.height);const id=x.getImageData(0,0,c.width,c.height),p=id.data;for(let i=0;i<p.length;i+=4){let y=0.299*p[i]+0.587*p[i+1]+0.114*p[i+2];y=y<180?0:255;p[i]=p[i+1]=p[i+2]=y}x.putImageData(id,0,0);resolve(c)}catch(e){reject(e)}};im.onerror=reject;im.src=dataUrl})}

function parseAll(){const t=txt();parseLabs();parseCBCDiff();parseUrine();parseBloodGas();parseSpecialText();parseEcho(t);parseInbody(t);parseVascular(t);parseCXR(t)}
function v(L,k){return L[k]?.v}
function formatGroup(g){
 const L=g.labs||{},U=g.urine||{},E=g.echo||{},I=g.inbody||{},V=g.vascular||{},CXR=g.cxr||{},ECG=g.ecg||{},D=g.cbcDiff||{},BG=g.bloodGas||{},SP=g.special||{},ST=g.stool||{},lines=[];let a=[];
 if(v(L,'hba1c')){let x=`HbA1c ${v(L,'hba1c')}%`;if(v(L,'eag'))x+=` (eAG ${v(L,'eag')} mg/dL)`;a.push(x)}if(v(L,'gluAC'))a.push(`Glu-AC ${v(L,'gluAC')} mg/dL`);else if(v(L,'gluPC'))a.push(`Glu-PC ${v(L,'gluPC')} mg/dL`);if(v(L,'uacr'))a.push(`UACR ${v(L,'uacr')} mg/g`);if(v(L,'upcr'))a.push(`UPCR ${v(L,'upcr')} mg/g`);if(a.length)lines.push('• '+a.join('; '));
 if(v(L,'wbc')||v(L,'hb')||v(L,'plt')||Object.keys(D).length){a=[];if(v(L,'wbc'))a.push(`WBC ${v(L,'wbc')}`);if(v(L,'hb'))a.push(`Hb ${v(L,'hb')}`);if(v(L,'plt'))a.push(`Plt ${v(L,'plt')}`);if(['neut','lymp','mono','eosi','baso'].every(k=>D[k]))a.push(`N/L/M/E/B ${D.neut}/${D.lymp}/${D.mono}/${D.eosi}/${D.baso}%`);lines.push('• CBC: '+a.join('; '))}
 a=[];let lip=['tc','tg','hdl','ldl'].filter(k=>v(L,k));if(lip.length)a.push(`${lip.map(k=>({tc:'TC',tg:'TG',hdl:'HDL',ldl:'LDL'}[k])).join('/')} ${lip.map(k=>v(L,k)).join('/')} mg/dL`);if(v(L,'ua'))a.push(`UA ${v(L,'ua')} mg/dL`);if(a.length)lines.push('• '+a.join('; '));
 a=[];if(v(L,'bun'))a.push(`BUN ${v(L,'bun')}`);if(v(L,'cr'))a.push(`Cr ${v(L,'cr')}`);if(v(L,'egfr'))a.push(`eGFR ${v(L,'egfr')}`);let renal=a.length?a.join('/'):'';let ele=[];for(const k of ['na','k','cl'])if(v(L,k))ele.push(`${k==='na'?'Na':k==='k'?'K':'Cl'} ${v(L,k)}`);let minerals=[];for(const k of ['ca','p','mg'])if(v(L,k))minerals.push(`${k==='ca'?'Ca':k==='p'?'P':'Mg'} ${v(L,k)}`);let seg=[];if(renal)seg.push(renal);if(ele.length)seg.push(ele.join('/'));if(minerals.length)seg.push(minerals.join('/'));if(seg.length)lines.push('• '+seg.join('; '));
 a=[];if(v(L,'ast'))a.push(`AST ${v(L,'ast')}`);if(v(L,'alt'))a.push(`ALT ${v(L,'alt')}`);if(v(L,'tbil'))a.push(`T-bil ${v(L,'tbil')}`);if(v(L,'dbil'))a.push(`D-bil ${v(L,'dbil')}`);if(v(L,'alb'))a.push(`Alb ${v(L,'alb')}`);if(a.length)lines.push('• '+a.join('; '));
 a=[];if(v(L,'crp'))a.push(`CRP ${v(L,'crp')} mg/dL`);if(v(L,'pct'))a.push(`PCT ${v(L,'pct')} ng/mL`);if(v(L,'lactate'))a.push(`Lactate ${v(L,'lactate')} mg/dL`);if(v(L,'ddimer'))a.push(`D-dimer ${v(L,'ddimer')} ng/mL`);if(a.length)lines.push('• '+a.join('; '));
 a=[];if(v(L,'amylase'))a.push(`Amylase ${v(L,'amylase')} U/L`);if(v(L,'lipase'))a.push(`Lipase ${v(L,'lipase')} U/L`);if(a.length)lines.push('• '+a.join('; '));
 a=[];if(v(L,'ft4'))a.push(`FT4 ${v(L,'ft4')} ng/dL`);if(v(L,'tsh'))a.push(`TSH ${v(L,'tsh')} uIU/mL`);if(v(L,'t3'))a.push(`T3 ${v(L,'t3')} ng/mL`);if(a.length)lines.push('• TFT: '+a.join('; '));
 if(v(L,'pra')||v(L,'pac')){a=[];if(v(L,'pra'))a.push(`PRA ${v(L,'pra')} ng/mL/hr`);if(v(L,'pac'))a.push(`PAC ${v(L,'pac')} ng/dL`);lines.push('• '+a.join('; '))}
 if(v(L,'aptt')||v(L,'pt')||v(L,'inr')){a=[];if(v(L,'pt'))a.push(`PT ${v(L,'pt')} sec`);if(v(L,'inr'))a.push(`INR ${v(L,'inr')}`);if(v(L,'aptt'))a.push(`aPTT ${v(L,'aptt')} sec`);lines.push('• Coag: '+a.join('; '))}
 if(v(L,'urineTP'))lines.push(`• Urine TP ${v(L,'urineTP')} mg/L`);
 if(Object.keys(U).length){const p=[],labels={glu:'Glu',pro:'PRO',ket:'Ket',ob:'OB',nit:'Nit',le:'LE',rbc:'RBC',wbc:'WBC',bacteria:'Bacteria',sg:'Sp.gr',ph:'pH'};for(const k of ['glu','pro','ket','ob','nit','le','rbc','wbc','bacteria','sg','ph'])if(U[k]!==undefined){let z=U[k];if(['rbc','wbc'].includes(k)&&/^\d+\s*[-~]\s*\d+$/i.test(z))z=z.replace(/\s*~\s*/,'-')+'/HPF';p.push(`${labels[k]} ${z}`)}if(p.length)lines.push('• Urine: '+p.join('; '))}
 if(Object.keys(BG).length){a=[];for(const [k,label,unit] of [['ph','pH',''],['pco2','pCO2',' mmHg'],['hco3','HCO3',' mmol/L'],['be','BE',' mmol/L'],['po2','pO2',' mmHg'],['so2','sO2','%']])if(BG[k])a.push(`${label} ${BG[k]}${unit}`);if(a.length)lines.push(`• ${BG.type||'Blood gas'}: `+a.join('; '))}
 if(SP.bloodKetone)lines.push(`• Ketone ${SP.bloodKetone}`);
 if(g.series?.poc?.length){const arr=[...g.series.poc].sort((a,b)=>(a.time||'99:99').localeCompare(b.time||'99:99'));lines.push('• Glucose: '+arr.map(x=>`${x.time||''} ${x.v}`.trim()).join(' → ')+' mg/dL')}
 if(ST.ob||ST.transferrin){a=[];if(ST.ob)a.push(`Stool OB ${ST.ob}`);if(ST.transferrin)a.push(`Stool transferrin ${ST.transferrin}`);lines.push('• '+a.join('; '))}
 if(Object.keys(E).length){a=[];if(E.lvh)a.push('LVH');if(E.lvef)a.push(`LVEF ${E.lvef}%`);if(E.sys)a.push(E.sys);if(E.dia)a.push(E.dia);for(const sev of ['trivial','mild','moderate','severe']){const vs=['MR','PR','TR'].filter(x=>E[x]===sev);if(vs.length)a.push(`${sev} ${vs.join('/')}`)}if(E.pasp)a.push(`PASP ${E.pasp} mmHg`);if(a.length)lines.push('• Echo: '+a.join('; '))}
 if(Object.keys(I).length){const p=[];for(const k of ['BW','BMI','PBF','BFM','SMM','VFA'])if(I[k])p.push(`${k} ${I[k]}${k==='PBF'?'%':''}`);if(p.length)lines.push('• InBody: '+p.join('; '))}
 if(Object.keys(V).length){const rv=V.abnormalR||V.normalR||V.ncR||'',lv=V.abnormalL||V.normalL||V.ncL||'';let out='';if(rv||lv){out=`R/L ${rv||'-'}/${lv||'-'}`;const ann=[];if(V.abnormalR)ann.push('R abnormal');else if(V.ncR)ann.push('R N/C');if(V.abnormalL)ann.push('L abnormal');else if(V.ncL)ann.push('L N/C');if(ann.length)out+=` (${ann.join(', ')})`}else if(V.values?.length>=2)out=`R/L ${V.values[0]}/${V.values[1]}`;else if(V.values?.length)out=V.values.join('/');if(out)lines.push('• PVR/ABI: '+out)}
 if(CXR.findings?.length){const cx=CXR.findings.map(x=>String(x).replace(/^[\s\-_=#|.;,:]+|[\s\-_=#|.;,:]+$/g,'').trim()).filter(x=>x&&/[A-Za-z]{3,}/.test(x)&&!/^CXR\s*:?$/i.test(x)&&!/^[-_=#|.;,:\s]+$/.test(x));if(cx.length)lines.push('• CXR: '+cx.join('; '))}
 if(Object.keys(ECG).length){const p=[];if(ECG.rhythm)p.push(ECG.rhythm);if(ECG.hr)p.push(`HR ${ECG.hr} bpm`);if(ECG.pr)p.push(`PR ${ECG.pr} ms`);if(ECG.qrs)p.push(`QRS ${ECG.qrs} ms`);if(ECG.qt&&ECG.qtc)p.push(`QT/QTc ${ECG.qt}/${ECG.qtc} ms`);else{if(ECG.qt)p.push(`QT ${ECG.qt} ms`);if(ECG.qtc)p.push(`QTc ${ECG.qtc} ms`)}if(ECG.rad)p.push(ECG.rad);if(ECG.lvh)p.push(ECG.lvh);if(ECG.st)p.push(ECG.st);if(p.length)lines.push('• ECG: '+p.join('; '))}
 return lines;
}
function dateKey(d){const p=d.split('/').map(Number);return p[0]*10000+p[1]*100+p[2]}
function fmt(){parseAll();const dates=Object.keys(S.byDate).filter(d=>formatGroup(S.byDate[d]).length).sort((a,b)=>dateKey(b)-dateKey(a));return dates.map(d=>`${d}\n${formatGroup(S.byDate[d]).join('\n')}`).join('\n\n')}
const d=document.createElement('div');d.id=ID;d.style='position:fixed;z-index:2147483647;right:12px;top:12px;width:min(720px,calc(100vw - 24px));max-height:calc(100vh - 24px);overflow:auto;background:#fff;color:#243746;border:1px solid #ccd3db;border-radius:14px;box-shadow:0 12px 40px #0004;padding:14px;font:14px Arial,sans-serif';
d.innerHTML=`<div style="display:flex;justify-content:space-between"><b>Auto Clinical Lab v6.5.1</b><button id=aX>×</button></div><div style="margin:8px 0;font-size:12px">Mode <select id=aM><option>AUTO</option><option>OPD</option><option>IPD</option></select> <span id=aD></span></div><pre id=aR style="white-space:pre-wrap;background:#f7f9fb;padding:10px;border-radius:9px;min-height:50px"></pre><div style="display:flex;gap:8px;flex-wrap:wrap"><button id=aC>Copy</button><button id=aK>Clear cache</button><button id=aS>Windows 剪取工具</button></div><div id=aMsg style="font-size:11px;color:#667085;margin-top:8px">依完報日累積：不同日期不覆蓋；同日同項目去重。以完報日為唯一日期基準（不使用看診日／診療日／開單日）；新增 aPTT / PT / INR。</div><div id=aCap style="display:none;margin-top:8px"><img id=aImg alt="Captured screen" style="max-width:100%;max-height:220px;border:1px solid #ccd3db;border-radius:8px"></div>`;document.body.appendChild(d);
const R=d.querySelector('#aR'),D=d.querySelector('#aD');function draw(){const t=txt();const det=/\b住院\b/.test(t)?'IPD':/\b門診\b|\b急診\b/.test(t)?'OPD':'?';D.textContent='Detected: '+det;const view=clinicalView();if(!view){R.textContent='';return}R.textContent=fmt()}
let tm;const sch=()=>{clearTimeout(tm);tm=setTimeout(draw,250)};addEventListener('scroll',sch,{passive:true});new MutationObserver(sch).observe(document.body,{subtree:true,childList:true,characterData:true});
const MSG=d.querySelector('#aMsg'),CAP=d.querySelector('#aCap'),IMG=d.querySelector('#aImg');const setMsg=(s,bad=false)=>{MSG.textContent=s;MSG.style.color=bad?'#b42318':'#667085'};const showCapture=dataUrl=>{if(!dataUrl)return;IMG.src=dataUrl;CAP.style.display='block';setMsg('截圖已貼上 ✓，準備 ECG OCR…')};addEventListener('message',ev=>{const x=ev.data;if(x&&x.type==='ACL_SCREEN_CAPTURE'&&typeof x.dataUrl==='string')showCapture(x.dataUrl)});
async function ocrECG(dataUrl){
 try{showCapture(dataUrl);setMsg('ECG OCR 讀取中…（影像只在瀏覽器本機處理）');const T=await loadTesseract();const c=await preprocessECG(dataUrl);const out=await T.recognize(c,'eng',{logger:m=>{if(m?.status==='recognizing text'&&Number.isFinite(m.progress))setMsg(`ECG OCR ${Math.round(m.progress*100)}%…`)}});const text=out?.data?.text||'';if(!storeECGText(text)){setMsg('ECG OCR 完成，但未辨識到足夠的 ECG 欄位；請確認截圖包含上方機器判讀文字。',true);return}draw();setMsg('ECG OCR 完成 ✓ 已加入 ECG summary。')}
 catch(e){setMsg('ECG OCR 無法啟動：'+(e?.message||e)+'。可點 Windows 剪取工具開啟安全 OCR helper。',true)}
}
async function handlePaste(ev){const items=[...(ev.clipboardData?.items||[])];const it=items.find(x=>x.type?.startsWith('image/'));if(!it)return;ev.preventDefault();const f=it.getAsFile();if(!f)return;const rd=new FileReader();rd.onload=()=>ocrECG(rd.result);rd.readAsDataURL(f)}
document.addEventListener('paste',handlePaste,true);
addEventListener('message',ev=>{const x=ev.data;if(x&&x.type==='ACL_ECG_OCR_TEXT'&&typeof x.text==='string'){if(storeECGText(x.text)){draw();setMsg('ECG OCR 完成 ✓ 已加入 ECG summary。')}else setMsg('OCR helper 未辨識到足夠 ECG 欄位。',true)}else if(x&&x.type==='ACL_SCREEN_CAPTURE'&&typeof x.dataUrl==='string')ocrECG(x.dataUrl)});
d.querySelector('#aC').onclick=async()=>{const text=R.textContent||'';if(!text){setMsg('沒有可複製的內容。',true);return}try{const sel=window.getSelection();sel.removeAllRanges();const rg=document.createRange();rg.selectNodeContents(R);sel.addRange(rg)}catch(e){}let ok=false;try{ok=document.execCommand('copy')}catch(e){}if(!ok){try{if(navigator.clipboard&&window.isSecureContext){await navigator.clipboard.writeText(text);ok=true}}catch(e){}}if(!ok){try{const ta=document.createElement('textarea');ta.value=text;ta.style='position:fixed;left:-9999px;top:-9999px';document.body.appendChild(ta);ta.select();ta.setSelectionRange(0,ta.value.length);ok=document.execCommand('copy');ta.remove();try{const sel=window.getSelection();sel.removeAllRanges();const rg=document.createRange();rg.selectNodeContents(R);sel.addRange(rg)}catch(e){}}catch(e){}}setMsg(ok?'已全選並複製 ✓ 可直接貼到 EMR。':'複製失敗，結果已全選，請按 Ctrl+C。',!ok)};d.querySelector('#aK').onclick=()=>{S={byDate:{},mode:'AUTO'};sessionStorage.removeItem(KEY);R.textContent='';CAP.style.display='none';IMG.removeAttribute('src');setMsg('Cache cleared.');};d.querySelector('#aX').onclick=()=>{document.removeEventListener('paste',handlePaste,true);d.remove()};d.querySelector('#aS').onclick=()=>{setMsg('請按 Win+Shift+S 截取 ECG，回到此 HIS 頁面按 Ctrl+V；會自動 OCR。若 HIS 阻擋 OCR，將開啟安全 helper。');const helper='https://jerry24062645.github.io/clinical-tools/screen_capture.html';try{const w=open(helper,'aclScreenCapture','width=940,height=760,resizable=yes,scrollbars=yes');if(w)w.focus()}catch(e){}};draw();
})()
