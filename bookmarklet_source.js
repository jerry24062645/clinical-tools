(()=>{
const ID='__acl644', KEY='__acl683cache';
if(document.getElementById(ID)){document.getElementById(ID).remove();return}
let S={byDate:{},mode:'AUTO'};try{S={...S,...JSON.parse(sessionStorage.getItem(KEY)||'{}')}}catch(e){}
if(!S.byDate||typeof S.byDate!=='object')S.byDate={};
const save=()=>sessionStorage.setItem(KEY,JSON.stringify(S));
const txt=()=>{try{const b=document.body?.cloneNode(true);if(!b)return'';b.querySelector('#'+ID)?.remove();return b.innerText||''}catch(e){return document.body?.innerText||''}};

function aclECGSummary(raw){
 raw=String(raw||'').replace(/\r/g,' ');
 const one=raw.replace(/\s+/g,' ').trim();
 const get=(rx)=>{const m=one.match(rx);return m?m[1]:''};
 const HR=get(/(?:Rate|Heart\s*Rate|HR)\s*[:：]?\s*(\d{2,3})\b/i);
 const PR=get(/\bPR\s*[:：]?\s*(\d{2,3})\b/i);
 const QRS=get(/\bQRS(?:d| duration)?\s*[:：]?\s*(\d{2,3})\b/i);
 const QT=get(/\bQT\s*[:：]?\s*(\d{2,3})\b/i);
 const QTc=get(/\bQTc\s*[:：]?\s*(\d{2,3})\b/i);
 let interp=[];
 const phrases=[
   /Sinus rhythm[^.;\n]*/ig,
   /Sinus bradycardia[^.;\n]*/ig,
   /Sinus tachycardia[^.;\n]*/ig,
   /atrial fibrillation[^.;\n]*/ig,
   /Borderline repolarization abnormality[^.;\n]*/ig,
   /ST(?:-| )?T[^.;\n]*(?:abnormal|change)[^.;\n]*/ig,
   /Baseline wander[^.;\n]*/ig
 ];
 phrases.forEach(rx=>{const a=one.match(rx)||[];a.forEach(x=>{x=x.replace(/\.{2,}/g,' ').replace(/\s+/g,' ').trim();if(x&&!interp.includes(x))interp.push(x)})});
 const vals=[];
 if(HR)vals.push('HR '+HR+' bpm');
 if(PR)vals.push('PR '+PR+' ms');
 if(QRS)vals.push('QRS '+QRS+' ms');
 if(QT)vals.push('QT '+QT+' ms');
 if(QTc)vals.push('QTc '+QTc+' ms');
 if(!vals.length&&!interp.length)return '';
 return '• EKG: '+vals.concat(interp).join('; ');
}

function clinicalView(){
  const t=txt();
  const isLab=/細項名稱/.test(t)&&/檢驗值/.test(t)&&/診療項目/.test(t);
  const isReport=/申請序號/.test(t)&&/診療項目/.test(t)&&(/完報時間/.test(t)||/報告內容/.test(t)||/檢視影像/.test(t));
  return isLab?'LAB':(isReport?'REPORT':'');
}
const clean=s=>String(s||'').replace(/\s+/g,' ').trim();
function activeReportBodyText(){
  try{
    const els=[...document.querySelectorAll('td,div,section,article')];
    const cand=[];
    for(const el of els){
      if(el.id===ID||el.closest?.('#'+ID))continue;
      const cs=getComputedStyle(el),bg=cs.backgroundColor||'';
      const m=bg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
      if(!m)continue;
      const r=+m[1],g=+m[2],b=+m[3];
      // HIS report body is pale yellow. Exclude gray/white list pages.
      if(!(r>=235&&g>=230&&b<=210))continue;
      const rect=el.getBoundingClientRect();
      if(rect.width<300||rect.height<40)continue;
      const text=String(el.innerText||'').trim();
      if(text.length<20)continue;
      cand.push({el,text,area:rect.width*rect.height});
    }
    if(!cand.length)return '';
    // Prefer the candidate with the most report text; area is tie-breaker.
    cand.sort((a,b)=>(b.text.length-a.text.length)||(b.area-a.area));
    let t=cand[0].text;
    // If the panel contains a report-content marker, keep only the actual report body.
    const m=t.match(/(?:報告內容\s*[:：]|Findings?\s*:|Impression\s*:)/i);
    if(m&&m.index>0&&m.index<t.length-10)t=t.slice(m.index);
    return t.trim();
  }catch(e){return ''}
}
function hasActiveReportBody(){return !!activeReportBodyText()}

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
function validReportDate(d){const m=String(d||'').match(/^(\d{2,3})\/(\d{2})\/(\d{2})$/);return !!(m&&Number(m[1])>=100&&Number(m[1])<=130)}
function rowDate(r){
  if(r&&r._completionDate&&validReportDate(r._completionDate))return r._completionDate;
  const joined=(r||[]).join(' ');
  if(!/(?:最終)?完報(?:日(?:時)?|時間|日時)|completion/i.test(joined))return null;
  const dates=[];
  for(const c of r||[]){const m=c.match(dateRe);if(m&&validReportDate(m[1]))dates.push(m[1])}
  const uniq=[...new Set(dates)];
  return uniq.length===1?uniq[0]:null;
}
function rowTime(r){for(const c of r){const m=c.match(timeRe);if(m)return m[0]}return ''}
function ensureDate(date){
  if(!date)return null;
  if(!S.byDate[date])S.byDate[date]={labs:{},urine:{},bloodGas:{},cbcDiff:{},series:{poc:[]},stool:{},special:{},echo:{},inbody:{},vascular:{},cxr:{},kub:{},ct:{},abdUS:{},headNeckUS:{},echoOther:{},xray:{},endoscopy:{},ecg:{}};
  const g=S.byDate[date];
  g.labs||={};g.urine||={};g.bloodGas||={};g.cbcDiff||={};g.series||={poc:[]};g.series.poc||=[];g.stool||={};g.special||={};g.echo||={};g.inbody||={};g.vascular||={};g.cxr||={};g.kub||={};g.ct||={};g.abdUS||={};g.headNeckUS||={};g.echoOther||={};g.xray||={};g.endoscopy||={};g.ecg||={};
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
 gluAC:/^Glucose-AC$|^Glu-AC$|飯前血糖/i,gluPC:/^Glucose-PC$|^Glu-PC$|飯後血糖/i,fbgAC:/One\s*Touch\s*Glucose\s*AC|OneTouch.*Glucose\s*AC|血糖機專用.*(?:飯前).*Glucose\s*AC|fingerstick\s*blood\s*glucose\s*AC|^FBG\s*AC$/i,fbgPC:/One\s*Touch\s*Glucose\s*PC|OneTouch.*Glucose\s*PC|血糖機專用.*(?:飯後).*Glucose\s*PC|fingerstick\s*blood\s*glucose\s*PC|^FBG\s*PC$/i,
 tc:/^(?:Cholesterol|Cholesterol Total|Total Cholesterol|TC)$/i,tg:/^(?:TG|Triglyceride|Triglycerides)$/i,
 hdl:/H\.?D\.?L\.?\s*cholesterol|^HDL(?:-C)?$/i,ldl:/L\.?D\.?L\.?\s*cholesterol|^LDL(?:-C)?$/i,
 ua:/Uric Acid/i,bun:/^BUN$/i,cr:/^Creatinine$/i,egfr:/^eGFR$/i,
 ast:/^(?:S-GOT|AST)$/i,alt:/^(?:S-GPT|ALT)$/i,alp:/^(?:ALP|Alk-?P)$/i,ggt:/^(?:r-GT|γ-?GT|GGT|Gamma-?GT)$/i,ldh:/^LDH$/i,tbil:/Bilirubin Total/i,dbil:/Bilirubin direct/i,alb:/^Albumin$/i,
 na:/^Na$/i,k:/^K$/i,cl:/^CL$/i,ca:/^Ca\s*\(B\)$/i,mg:/^MG$/i,p:/^P$/i,
 crp:/^CRP$/i,pct:/Procalcitonin\s*\(PCT\)|^PCT$/i,lactate:/Lactic Acid/i,ntprobnp:/NT[- ]?Pro[- ]?BNP|NT[- ]?proBNP/i,rpr:/^(?:RPR|VDRL)$|RPR\/VDRL test|Rapid Plasma Reagin/i,hsTnI:/hs[- ]?Troponin\s*I|high[- ]?sensitivity\s*Troponin\s*I|^hs[- ]?TnI$/i,hsTnT:/hs[- ]?Troponin\s*T|high[- ]?sensitivity\s*Troponin\s*T|^hs[- ]?TnT$/i,amylase:/Amylase/i,lipase:/^Lipase$/i,ddimer:/D-?Dimer/i,
 tsh:/^TSH$/i,ft4:/^(?:Free T4|FT4)$/i,t3:/^T3$/i,
 wbc:/白血球計數WBC|白血球WBC|^WBC$/i,rbc:/紅血球RBC|^RBC$/i,hb:/血色素Hemoglobin|血紅素HGB|^Hemoglobin$|^HGB$|^Hb$/i,hct:/血球容積比HCT|^HCT$/i,mcv:/紅血球平均體積MCV|^MCV$/i,mch:/平均血紅素量MCH|^MCH$/i,mchc:/平均血色素濃度MCHC|^MCHC$/i,plt:/血小板計數Platelet|^Platelet$/i,
 uacr:/Microalbumin\/Cr urine ratio|Microalbumin\/Cr|^UACR$/i,upcr:/^UPCR$|TP\/Cr urine ratio|Urine total protein\/creatinine/i,urineTP:/TP-spot urine|Total protein-Urine/i,microAlb:/^MicroAlbumin$|MicroAlbumin\(尿\)/i,urineCrSpot:/Crea-spot urine|Cre-Spot Urine/i,spotMg:/Mg-spot urine/i,spotCl:/Cl-spot urine/i,spotK:/K-spot urine/i,spotNa:/Na-spot urine/i,spotUA:/UA-spot urine/i,spotP:/Urine-P|P\s*磷-SPOT URINE/i,spotCa:/Ca-spot urine/i,spotBUN:/BUN\(尿\)/i,urineOsm:/Urine-osmolarity test|URINE-OSMOLARITY TEST|尿滲透壓/i,psa:/^PSA$/i,
 pra:/Renin activity|^PRA$/i,pac:/^Aldosterone$|^PAC$/i,
 antiHCV:/^Anti[- ]?HCV$/i,antiHBs:/^Anti[- ]?HBs$/i,hbsAg:/^HBsAg$/i,
 aptt:/^APTT$|^aPTT$/i,pt:/^Prothrombin time$|^PT$/i,inr:/^INR$/i
};
const units={hba1c:'%',eag:'mg/dL',gluAC:'mg/dL',gluPC:'mg/dL',fbgAC:'mg/dL',fbgPC:'mg/dL',tc:'mg/dL',tg:'mg/dL',hdl:'mg/dL',ldl:'mg/dL',ua:'mg/dL',bun:'mg/dL',cr:'mg/dL',egfr:'',ast:'U/L',alt:'U/L',alp:'U/L',ggt:'U/L',ldh:'U/L',tbil:'mg/dL',dbil:'mg/dL',alb:'g/dL',na:'mmol/L',k:'mmol/L',cl:'mmol/L',ca:'mg/dL',mg:'mg/dL',p:'mg/dL',crp:'mg/dL',pct:'ng/mL',lactate:'mg/dL',ntprobnp:'pg/mL',rpr:'',hsTnI:'ng/L',hsTnT:'ng/L',amylase:'U/L',lipase:'U/L',ddimer:'ng/mL',tsh:'uIU/mL',ft4:'ng/dL',t3:'ng/mL',wbc:'10^3/uL',rbc:'10^6/uL',hb:'g/dL',hct:'%',mcv:'fL',mch:'pg',mchc:'g/dL',plt:'10^3/uL',uacr:'mg/g',upcr:'mg/g',urineTP:'mg/L',microAlb:'mg/L',urineCrSpot:'mg/L',spotMg:'mg/dL',spotCl:'mmol/L',spotK:'mmol/L',spotNa:'mmol/L',spotUA:'mg/dL',spotP:'mg/dL',spotCa:'mg/dL',spotBUN:'mg/dL',urineOsm:'mOsm/kg',psa:'ng/mL',antiHCV:'COI',antiHBs:'IU/L',hbsAg:'COI',pra:'ng/mL/hr',pac:'ng/dL',aptt:'sec',pt:'sec',inr:''};
function parseRPR(){
 let changed=false;
 const sectionDate=reportDateBy(/RPR\/VDRL test|Rapid Plasma Reagin|\bRPR\b|\bVDRL\b/i);
 for(const r of rows()){
   let ni=-1;
   for(let i=0;i<r.length;i++){if(/^(?:RPR|VDRL)$|RPR\/VDRL test|Rapid Plasma Reagin/i.test(r[i])){ni=i;break}}
   if(ni<0)continue;
   const d=rowDate(r)||sectionDate;if(!d)continue;
   let val='';
   for(let j=ni+1;j<r.length;j++){
     const c=clean(r[j]);
     if(/^(?:Non[- ]?Reactive|Reactive|Negative|Positive)$/i.test(c)){val=c;break}
   }
   if(!val)continue;
   val=val.replace(/^Nonreactive$/i,'Non-Reactive').replace(/^Non Reactive$/i,'Non-Reactive');
   ensureDate(d).labs.rpr={v:val,raw:val,unit:''};changed=true;
 }
 if(changed)save();
}


function parseHepatitisQualRow(r, ni){
 for(let i=ni+1;i<r.length;i++){
   const z=clean(r[i]);
   const m=z.match(/^(Negative|Positive|Reactive|Non[- ]?Reactive)\s*(?:\(\s*([0-9.]+)\s*\))?$/i);
   if(m)return {value:m[2]?`${m[1]}(${m[2]})`:m[1], vi:i};
 }
 return null;
}
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
   const date=rowDate(r);
   if(!date && ['antiHCV','antiHBs','hbsAg'].includes(hit.key)){
     const pageDates=(txt().match(/1\d{2}\/\d{2}\/\d{2}/g)||[]);
     if(pageDates.length)date=pageDates[0];
   }
   if(!date)continue;
   let nv=numericAfter(r,hit.ni), val=null, vi=-1;
   if(nv){val=nv.v;vi=nv.i}
   else if(['microAlb','urineCrSpot'].includes(hit.key)){
     for(let i=hit.ni+1;i<r.length;i++){
       const z=clean(r[i]);
       if(/^(?:<|≤|>|≥)?\s*\d+(?:\.\d+)?$/.test(z)){val=z.replace(/\s+/g,'');vi=i;break}
     }
   }
   if(val===null && ['antiHCV','antiHBs','hbsAg'].includes(hit.key)){
     for(let i=hit.ni+1;i<r.length;i++){
       const z=clean(r[i]);
       const m=z.match(/^(Negative|Positive|Reactive|Non[- ]?Reactive)\s*(?:\(\s*([0-9.]+)\s*\))?$/i);
       if(m){val=m[2]?`${m[1]}(${m[2]})`:m[1];vi=i;break}
     }
   }
   if(val===null && ['antiHCV','antiHBs','hbsAg'].includes(hit.key)){
     const q=parseHepatitisQualRow(r,hit.ni);
     if(q){val=q.value;vi=q.vi}
   }
   if(val===null)continue;
   const {lo,hi}=parseRef(r.slice(vi+1));
   const g=ensureDate(date); let fv=['antiHCV','antiHBs','hbsAg'].includes(hit.key)?String(val):flag(val,lo,hi);
   if(hit.key==='upcr' && /TP\/Cr urine ratio|Urine total protein\/creatinine/i.test(hit.name)){
      const x=parseFloat(String(val));
      if(Number.isFinite(x)){const mgG=x*1000;fv=(mgG>=150?'H ':'')+String(Number(mgG.toFixed(1)));val=String(Number(mgG.toFixed(1)));}
   }
   if(hit.key==='uacr'){
      // Store displayed UACR only as fallback. Formula-based UACR below has priority.
      const x=parseFloat(String(val).replace(/^[<>≤≥]/,''));
      if(Number.isFinite(x)){fv=String(val).match(/^[<>≤≥]/)?String(val):flag(val,NaN,30)}
   }
   if(['microAlb','urineCrSpot'].includes(hit.key)) fv=String(val);
   g.labs[hit.key]={v:fv,raw:String(val),unit:units[hit.key]||''};changed=true;
 }
 // UACR = urine microalbumin / spot urine creatinine ×1000 (mg/g), grouped by completion date.
 for(const [date,g] of Object.entries(S.byDate)){
   const L=g.labs||{}, ma=L.microAlb?.raw, cr=L.urineCrSpot?.raw;
   if(ma!=null&&cr!=null){
     const maS=String(ma), crS=String(cr);const maN=parseFloat(maS.replace(/^[<>≤≥]/,'')), crN=parseFloat(crS.replace(/^[<>≤≥]/,''));
     if(Number.isFinite(maN)&&Number.isFinite(crN)&&crN>0){
       const ratio=maN/crN*1000;let out=String(Number(ratio.toFixed(1)));
       if(/^[<≤]/.test(maS))out='<'+out; else if(/^[>≥]/.test(maS))out='>'+out;
       const plain=parseFloat(out.replace(/^[<>]/,''));
       let shown=out;if(!/^[<>]/.test(out)&&Number.isFinite(plain)&&plain>=30)shown='H '+out;
       L.uacr={v:shown,raw:out,unit:'mg/g',calculated:true};changed=true;
     }
   }
 }
 // UPCR = urine total protein / spot urine creatinine ×1000 (mg/g), grouped by completion date.
 for(const [date,g] of Object.entries(S.byDate)){
   const L=g.labs||{}, tp=L.urineTP?.raw, cr=L.urineCrSpot?.raw;
   if(tp!=null&&cr!=null){
     const tpS=String(tp), crS=String(cr);const tpN=parseFloat(tpS.replace(/^[<>≤≥]/,'')), crN=parseFloat(crS.replace(/^[<>≤≥]/,''));
     if(Number.isFinite(tpN)&&Number.isFinite(crN)&&crN>0){
       const ratio=tpN/crN*1000;let out=String(Number(ratio.toFixed(1)));
       if(/^[<≤]/.test(tpS))out='<'+out; else if(/^[>≥]/.test(tpS))out='>'+out;
       const plain=parseFloat(out.replace(/^[<>]/,''));
       let shown=out;if(!/^[<>]/.test(out)&&Number.isFinite(plain)&&plain>=150)shown='H '+out;
       L.upcr={v:shown,raw:out,unit:'mg/g',calculated:true};changed=true;
     }
   }
 }
 if(changed)save();
}
const diffAliases={neut:/NEUT/i,lymp:/LYMP/i,mono:/MONO/i,eosi:/EOSI/i,baso:/BASO/i};
function parseCBCDiff(){let changed=false;for(const r of rows()){let hit=null;for(let i=0;i<r.length;i++){const k=Object.keys(diffAliases).find(k=>diffAliases[k].test(r[i]));if(k){hit={k,ni:i};break}}if(!hit)continue;const d=rowDate(r);if(!d)continue;const nv=numericAfter(r,hit.ni);if(!nv)continue;const ref=parseRef(r.slice(nv.i+1));ensureDate(d).cbcDiff[hit.k]=flag(nv.v,ref.lo,ref.hi);changed=true}if(changed)save()}
const urineAliases={
 mucus:/^(?:黏液)?Mucus$|URINE MUCUS/i,
 rbc:/尿紅血球R\.?B\.?C\.?|URINE RBC|^R\.?B\.?C\.?$/i,
 parasite:/寄生蟲|Parasite|URINE PARASITE/i,
 yeast:/Yeast\/Fungi|酵母菌|黴菌|URINE YEAST/i,
 bil:/尿膽紅素BIL|URINE BIL|^BIL$/i,
 sg:/Sp\.?gr|尿比重|URINE SP\.?GR/i,
 ph:/酸鹼度PH|尿液酸鹼值|URINE PH|^PH$/i,
 ket:/酮體Ket|URINE KET|^Ket$/i,
 ep:/EP cell|尿上皮細胞|URINE EP CELL/i,
 cast:/Cast|尿圓柱|URINE CAST/i,
 clarity:/Clarity|尿濁度|尿液外觀|URINE APPEARANCE/i,
 pro:/尿蛋白PRO|URINE PROTEIN|Urine Protein|^PRO$/i,
 ob:/潛血OB|OB-URINE|URINE OB|^OB$/i,
 le:/Leukocyte esterase|URINE LE/i,
 bacteria:/Bacteria|細菌|BACTERIA-URINE|URINE BACTERIA/i,
 uro:/尿膽元Uro|URINE URO|^Uro$/i,
 wbc:/尿白血球W\.?B\.?C\.?|URINE WBC|^W\.?B\.?C\.?$/i,
 color:/Color|尿顏色|URINE COLOR/i,
 glu:/尿糖Glu|URINE SUGAR|Urine Sugar|^Glu$/i,
 nit:/亞硝酸鹽Nit|URINE NIT|^Nit$/i,
 crystal:/Crystal|尿結晶|URINE CRYSTAL/i
};
function parseUrine(){
 let changed=false,currentDate=null,inUrine=false;
 for(const r of rows()){
   const joined=r.join(' ');const rd=rowDate(r);if(rd)currentDate=rd;
   if(/Urine Routine|尿液一般檢驗|尿液生化|尿液檢驗/i.test(joined))inUrine=true;
   if(inUrine&&/(血液檢驗|一般生化|特殊生化|氣體分析|Blood Gas|Venous Blood Gas|糞便檢驗|微生物|病理)/i.test(joined)&&!/尿液/i.test(joined))inUrine=false;
   let hit=null;for(let i=0;i<r.length;i++){const k=Object.keys(urineAliases).find(k=>urineAliases[k].test(r[i]));if(k){hit={k,ni:i};break}}
   const urineSpecimen=/(?:\bUrine\b|尿液|尿,?10ml|OB-URINE|BACTERIA-URINE|URINE\s+(?:RBC|WBC|CAST|EP CELL|SUGAR|PROTEIN|PH|APPEARANCE))/i.test(joined);
   if(!inUrine||!urineSpecimen||!hit||!currentDate)continue;
   const tv=textValueAfter(r,hit.ni);if(!tv)continue;let val=tv.v;
   if(!/^(?:Negative|Positive|Clear|Colorless|[-+]|\+\/-|\d+(?:\.\d+)?(?:\s*[-~]\s*\d+(?:\.\d+)?)?|\d+\+|[A-Za-z ]+)$/i.test(val))continue;
   ensureDate(currentDate).urine[hit.k]=val;changed=true;
 }
 if(changed)save();
}
const stoolAliases={
 amoeba:/^Amoeba\s*\(direct smear\)$/i,
 ob:/^OB\s*\(stool\)$/i,
 consistency:/^Consistency\s*\(stool\)$/i,
 color:/^Color\s*\(stool\)$/i,
 rbc:/^RBC\s*\(stool\)$/i,
 pus:/^Pus cell\s*\(stool\)$/i,
 ova:/^OVA\s*\(stool\)$/i,
 mucus:/^Mucus\s*\(stool\)$/i,
 others:/^Others\s*\(stool\)$/i
};
function parseStoolRoutine(){
 let changed=false,currentDate=null,inStool=false;
 for(const r of rows()){
   const joined=r.join(' '),rd=rowDate(r);if(rd)currentDate=rd;
   if(/Stool routine|糞便常規檢查|糞便檢驗/i.test(joined))inStool=true;
   if(inStool&&/(血液檢驗|一般生化|特殊生化|氣體分析|Blood Gas|Venous Blood Gas|Urine Routine|尿液生化|微生物|病理)/i.test(joined)&&!/Stool|糞便/i.test(joined))inStool=false;
   let hit=null;
   for(let i=0;i<r.length;i++){const k=Object.keys(stoolAliases).find(k=>stoolAliases[k].test(r[i]));if(k){hit={k,ni:i};break}}
   if(!inStool||!hit||!currentDate)continue;
   const tv=textValueAfter(r,hit.ni);if(!tv)continue;
   let val=clean(tv.v);
   if(!val)continue;
   const ST=ensureDate(currentDate).stool;
   ST[hit.k]=val;changed=true;
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
     if(/SARS[- ]?CoV[- ]?2\s*Ag\s*test|COVID[- ]?19\s*Ag|新型冠狀病毒.*抗原/i.test(c)){const tv=textValueAfter(r,i);if(tv){g.special.covidAg=tv.v;changed=true}}
     if(/Flu\s*A\s*rapid\s*PCR|流感病毒A快速核酸檢測/i.test(c)){const tv=textValueAfter(r,i);if(tv){g.special.fluA=tv.v;changed=true}}
     if(/Flu\s*B\s*rapid\s*PCR|流感病毒B快速核酸檢測/i.test(c)){const tv=textValueAfter(r,i);if(tv){g.special.fluB=tv.v;changed=true}}
     if(/OneTouch.*Glucose|病房專用OneTouch/i.test(c)&&!/Glucose\s*(?:AC|PC)|飯前|飯後/i.test(c)){
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

function parseAbdominalUS(t){
 const itemRe=/腹部超音波|Abdominal\s+(?:ultrasound|sonography)|Abd(?:ominal)?\s+sono/i;
 const date=reportDateBy(itemRe);if(!date)return;
 const all=t.split(/\r?\n/).map(x=>clean(x)).filter(Boolean);
 let imp=-1,stop=all.length;
 for(let i=0;i<all.length;i++){if(/^Impression\s*:?$/i.test(all[i])){imp=i+1;break}}
 if(imp>=0){for(let i=imp;i<all.length;i++){if(/^(?:Suggestion|Recommendation|建議)\s*:?/i.test(all[i])){stop=i;break}}}
 let cand=imp>=0?all.slice(imp,stop):all;
 const keep=[];
 for(let line of cand){
   line=line.replace(/^[*•\-]+\s*/,'').trim();
   if(!line||/^Please correlate|poor image quality/i.test(line))continue;
   if(imp<0&&!/(gallstone|gallbladder|bile duct|liver|renal|kidney|stone|calcif|hydroneph|ascites|pancreas|spleen|aorta|portal vein|fatty liver|cyst|mass|lesion)/i.test(line))continue;
   if(line.length>=5)keep.push(line);
 }
 if(keep.length){const A=ensureDate(date).abdUS;A.findings=[...new Set([...(A.findings||[]),...keep])];save()}
}



function parseHeadNeckUS(t){
 const itemRe=/頭頸部軟組織超音波|thyroid,parathyroid|Thyroid\s*gland|Parathyroid\s*gland/i;
 const date=reportDateBy(itemRe);if(!date)return;
 const hdr=rows().map(r=>r.join(' ')).join('\n');if(!itemRe.test(hdr))return;
 // Use the full HIS page text here rather than only the yellow-panel candidate.
 // The head/neck report is scrollable and the selected Sonographic Diagnosis may
 // sit outside the currently visible/candidate subsection.
 const source=txt();
 const all=String(source||t||'').split(/\r?\n/).map(x=>clean(x)).filter(Boolean);
 let dx=-1,adv=-1;
 for(let i=0;i<all.length;i++){
   if(/^Sonographic Diagnosis\s*:?$/i.test(all[i]))dx=i+1;
   if(/^(?:Advise or comment|Advice or comment)\s*:?/i.test(all[i])){adv=i;break}
 }
 const keep=[];
 // Head/Neck US: summarize only the actually selected Sonographic Diagnosis.
 // Empty boxes (□) and nil/template fields are intentionally ignored.
 if(dx>=0){
   const end=adv>=0?adv:all.length;
   for(let i=dx;i<end;i++){
     const raw=all[i].trim();
     if(!/^[■▪●☑✓✔]/.test(raw))continue;
     let line=raw.replace(/^[■▪●☑✓✔*•.\-]+\s*/,'').trim();
     if(!line||/\bnil\b/i.test(line))continue;
     if(/^Others\s*:\s*/i.test(line))line=line.replace(/^Others\s*:\s*/i,'').trim();
     if(line&&line.length>=3)keep.push(line);
   }
 }
 if(keep.length){
   const H=ensureDate(date).headNeckUS;
   H.findings=[...new Set([...(H.findings||[]),...keep])];
   save();
 }
}

function parseEchoOthers(t){
 const itemRe=/其他超音波.*Echo for Others|Echo for Others/i;
 const date=reportDateBy(itemRe);if(!date)return;
 const hdr=rows().map(r=>r.join(' ')).join('\n');if(!itemRe.test(hdr))return;
 let z=String(t||'');
 const cm=z.match(/報告內容\s*[:：]([\s\S]*)/i);if(cm)z=cm[1];
 const ls=z.split(/\r?\n/).map(x=>clean(x)).filter(Boolean),keep=[];
 for(let line of ls){
   line=line.replace(/^[*•.\-]+\s*/,'').trim();
   if(!line||/^[-_=#|.;,:\s]+$/.test(line))continue;
   if(/^(?:主訴|Hx:|Past hx|Operation history|HEENT|Neck:|Lungs:|Heart:|Abdomen:|Extremities:|診斷[:：]|MR of L spine|Imp\s*:)/i.test(line))continue;
   if(/(?:Joint effusion|synovium hypertrophy|collateral ligament|\bMCL\b|Pes anserine|iliotibial band|\bITB\b|Traction spur|tendon|bursitis|ultrasound|sonographic)/i.test(line)){
     keep.push(line.replace(/\s+/g,' ').trim());
   }
 }
 if(!keep.length)return;
 const side=/\bleft\b|\bLt\b|左/i.test(z)?'Lt ':(/\bright\b|\bRt\b|右/i.test(z)?'Rt ':'');
 const part=/\bknee\b|膝/i.test(z)?'knee':'';
 const O=ensureDate(date).echoOther;
 O.label=(side+part).trim()||'Others';
 O.findings=addUnique(O.findings,keep);
 save();
}

function parseKUB(t){
 const itemRe=/\bKUB\b|Kidney[ -]?Ureter[ -]?Bladder|腹部(?:單純|平片)|腹部X光/i;
 const date=reportDateBy(itemRe);if(!date)return;
 const joinedRows=rows().map(r=>r.join(' ')).join('\n');if(!itemRe.test(joinedRows))return;
 const lines=t.split(/\r?\n/).map(x=>clean(x)).filter(Boolean),keep=[];
 const findingRe=/bowel|abdomen|pelvis|flank|obstruction|ileus|fecal|stool|renal|kidney|ureter|bladder|radiopaque|calcif|stone|spondylosis|L-spine|T-L spine|osteophyte/i;
 for(let line of lines){
   line=line.replace(/^[-•]\s*/,'').trim();
   if(!line||/^[-_=#|.;,:\s]+$/.test(line))continue;
   if(/ground-glass lesion.*might be missed|plain chest radiography/i.test(line))continue;
   if(/increased interstitial|mediastinum|atherosclerosis of the aorta/i.test(line)&&!findingRe.test(line))continue;
   if(findingRe.test(line)&&line.length>=8)keep.push(line.replace(/\s+/g,' ').trim());
 }
 if(keep.length){const K=ensureDate(date);K.kub=K.kub||{findings:[]};K.kub.findings=[...new Set([...(K.kub.findings||[]),...keep])];save()}
}

function parseCTAbdomen(t){
 // Endoscopy reports can coexist in the same HIS DOM with old CT rows.
 // Never let the current Upper GI / colonoscopy body be attached to CT.
 if(/上消化道鏡|Upper\s*GI\s*Panendoscopy|Esophagus\s*:|Stomach\s*:|Duodenum\s*:|Gastroesophageal reflux|Colon\s*fiberscopy|大腸纖維鏡|處置\(Procedures\)\s*:\s*polypectomy/i.test(String(t||'')))return;
 const itemRe=/CT\s*(?:\/\s*)?s(?:\+c)?\s*Abd(?:omen)?(?:\.\+?pelvis)?|CT\s+Abdomen|Abd(?:omen)?\s*\+?\s*pelvis.*CT|腹部.*CT/i;
 const date=reportDateBy(itemRe);if(!date)return;
 const joinedRows=rows().map(r=>r.join(' ')).join('\n');if(!itemRe.test(joinedRows))return;
 const lines=t.split(/\r?\n/).map(x=>clean(x)).filter(Boolean);
 let inFindings=false;const keep=[];
 for(let line of lines){
   if(/^Findings\s*:?$/i.test(line)){inFindings=true;continue}
   if(/^Impression\s*:?$/i.test(line)){inFindings=false;break}
   if(!inFindings)continue;
   line=line.replace(/^[-•]\s*/,'').trim();
   if(!line||/^[-_=#|.;,:\s]+$/.test(line))continue;
   if(/For details,? please see/i.test(line))continue;
   if(line.length<5)continue;
   keep.push(line.replace(/\s+/g,' ').trim());
 }
 if(keep.length){const C=ensureDate(date).ct;C.abdomen=[...new Set(keep)];save()}
}


function reportLines(t){return t.split(/\r?\n/).map(x=>clean(x)).filter(Boolean)}
function addUnique(arr,vals){return [...new Set([...(arr||[]),...vals.map(clean).filter(Boolean)])]}
function parsePlainXRay(t){
 const headerRows=rows().map(r=>r.join(' '));
 const lowerHead=/下肢骨各處骨頭及關節檢查|Knee\s*L'?t\s*Lat|Patella\s*L'?t\s*Merchant|Knee\s*R'?t\s*AP|骨盆腔檢查第一張/i;
 const lowerActive=headerRows.some(x=>lowerHead.test(x));
 const types={
  cspine:{head:/C[- ]?spines?|Cervical\s*spine/i, body:/cervical|C[- ]?spine|C\d[-–~]\d|scoliosis|spondylosis|disc space/i},
  wrist:{head:/\bWrist\b/i,body:/\bwrist\b|carpal|radius|ulna/i},
  elbow:{head:/\bElbow\b/i,body:/\belbow\b|radial head|olecranon|proximal ulna/i},
  forearm:{head:/\bForearm\b/i,body:/\bforearm\b|radius|ulna/i}
 };
 let active=[];for(const [k,o] of Object.entries(types))if(headerRows.some(x=>o.head.test(x)))active.push(k);
 if(!lowerActive&&!active.length)return;
 const reParts=[...(lowerActive?[lowerHead.source]:[]),...active.map(k=>types[k].head.source)];
 const date=reportDateBy(new RegExp(reParts.join('|'),'i'));if(!date)return;
 const g=ensureDate(date),ls=reportLines(t);

 if(lowerActive){
   const keep=[];
   for(let line of ls){
     line=line.replace(/^[*•.\-]+\s*/,'').trim();
     if(!line||line.length<6)continue;
     if(/plain radiography is not sensitive|ground-glass lesion.*might be missed|clinical correlation is indicated.*CT study/i.test(line))continue;
     if(/^(?:報告內容|Findings?|Impression)\s*:?$/i.test(line))continue;
     if(/(?:pelvis|knee|patella|femur|tibia|fibula|OA change|osteoarth|bone demineral|calcified opacity|fracture|joint space|degenerative)/i.test(line))
       keep.push(line.replace(/\s+/g,' ').trim());
   }
   if(keep.length)g.xray.lower=addUnique(g.xray.lower,keep);
 }

 for(const [k,o] of Object.entries(types)){
   if(!active.includes(k))continue;
   const keep=[];
   for(let line of ls){
     line=line.replace(/^[*•.\-]+\s*/,'').trim();
     if(line.length<6)continue;
     if(/plain radiography is not sensitive|ground-glass lesion.*might be missed/i.test(line))continue;
     if(o.body.test(line)&&/[A-Za-z]{3,}/.test(line))keep.push(line.replace(/\s+/g,' ').trim());
   }
   if(keep.length)g.xray[k]=addUnique(g.xray[k],keep);
 }
 save();
}
function parseColonFiberscopy(t){
 const itemRe=/Colon\s*fiberscopy|大腸纖維鏡檢查|大腸鏡/i;
 const hdr=rows().map(r=>r.join(' ')).join('\n');
 const z=String(t||'');
 // Bind only when the selected report/body itself is clearly colonoscopy,
 // or the current report header is colonoscopy and the body has endoscopic sections.
 if(!itemRe.test(hdr) && !/Colonic polyps?|polypectomy|Insertion level|Colon cleansing|混合痔|Mixed hemorrhoids/i.test(z))return;
 const date=reportDateBy(itemRe);if(!date)return;
 const E=ensureDate(date).endoscopy;
 const lesions=[...z.matchAll(/\bpolypoid lesion\b/ig)].length;
 const polypectomy=/polypectomy/i.test(z);
 if(polypectomy&&lesions>=4&&lesions<=9)E.colon='大腸息肉切除術(四至九)顆';
 else if(polypectomy&&lesions>0)E.colon=`大腸息肉切除術(${lesions}顆)`;
 else if(/Colonic polyps?/i.test(z))E.colon='Colon fiberscopy';

 const ls=z.split(/\r?\n/).map(x=>clean(x)).filter(Boolean);
 const diagnosis=[],suggestion=[];
 let sec='';
 for(let line of ls){
   if(/^診斷\s*\(Diagnosis\)\s*[:：]?/i.test(line)||/^Diagnosis\s*[:：]?$/i.test(line)){sec='dx';continue}
   if(/^處置\s*\(Procedures\)|^Procedures\s*[:：]?/i.test(line)){sec='';continue}
   if(/^併發症\s*\(Complication\)|^Complication\s*[:：]?/i.test(line)){sec='';continue}
   if(/^建議\s*\(Suggestion\)\s*[:：]?/i.test(line)||/^Suggestion\s*[:：]?/i.test(line)){
     sec='sg';
     line=line.replace(/^.*?(?:Suggestion\))?\s*[:：]\s*/i,'').trim();
     if(line)suggestion.push(line.replace(/^[*•.\-]+\s*/,'').trim());
     continue;
   }
   if(/^註\s*[:：]|^Note\s*[:：]/i.test(line)){sec='';continue}
   line=line.replace(/^[*•.\-]+\s*/,'').trim();
   if(!line)continue;
   if(sec==='dx')diagnosis.push(line);
   else if(sec==='sg')suggestion.push(line);
 }
 E.colonDiagnosis=[...new Set(diagnosis.filter(Boolean))];
 E.colonSuggestion=[...new Set(suggestion.filter(Boolean))];
 // Backward compatibility: if old parser only saw hemorrhoids, keep it only when
 // not already present in Diagnosis.
 if(/mixed hemorrhoids/i.test(z) && !E.colonDiagnosis.some(x=>/mixed hemorrhoids/i.test(x)))E.colonDiagnosis.push('Mixed hemorrhoids');
 save();
}
function parseUpperGI(t){
 const itemRe=/Upper\s*GI\s*Panendoscopy|上消化道.*內視鏡|上消化道鏡/i;
 const z0=String(t||'');
 const hdr=rows().map(r=>r.join(' ')).join('\n');
 // Current body must look like an Upper GI endoscopy report.
 if(!/上消化道鏡|Esophagus\s*:|Stomach\s*:|Duodenum\s*:|Gastroesophageal reflux|CLO test/i.test(z0))return;
 const date=reportDateBy(itemRe);if(!date)return;
 const E=ensureDate(date).endoscopy,z=String(t),out=[];
 let m=z.match(/Gastroesophageal reflux disease,?\s*LA grade\s*([A-D])/i);if(m)out.push(`GERD LA grade ${m[1].toUpperCase()}`);
 if(/Atrophic gastritis/i.test(z))out.push('Atrophic gastritis');
 if(/Active gastritis/i.test(z))out.push('Active gastritis');
 m=z.match(/CLO test\s*:\s*\(?\s*(negative|positive)\s*\)?/i);if(m)out.push(`CLO ${m[1].toLowerCase()}`);
 if(out.length)E.ugi=out;save();
}
function rocDateFromOCR(t){let m=t.match(/\b(20\d{2})[\/.-](\d{1,2})[\/.-](\d{1,2})\b/);if(!m)return null;const y=+m[1]-1911;if(y<=0)return null;return `${y}/${String(+m[2]).padStart(2,'0')}/${String(+m[3]).padStart(2,'0')}`}
function ecgParseText(t){
 const z=String(t||'').replace(/\r/g,'\n');
 const one=z.replace(/[.·]{2,}/g,' ').replace(/[ \t]+/g,' ');
 const E={};let m;
 const num=rx=>{const q=one.match(rx);return q?q[1]:null};
 const hr=num(/(?:^|\n|\s)(?:Rate|HR|Heart\s*Rate)\s*[:=]?\s*(\d{2,3})\b/i);
 const pr=num(/(?:^|\n|\s)PR\s*[:=]?\s*(\d{2,3})\b/i);
 const qrs=num(/(?:^|\n|\s)QRS(?:d|D| duration)?\s*[:=]?\s*(\d{2,3})\b/i);
 const qt=num(/(?:^|\n|\s)QT(?!c)\s*[:=]?\s*(\d{2,3})\b/i);
 const qtc=num(/(?:^|\n|\s)QTc\s*[:=]?\s*(\d{2,3})\b/i);
 if(hr)E.hr=hr;if(pr)E.pr=pr;if(qrs)E.qrs=qrs;if(qt)E.qt=qt;if(qtc)E.qtc=qtc;
 if(m=z.match(/(?:^|\n)\s*P\s+(-?\d{1,3})\b/im))E.paxis=m[1];
 if(m=z.match(/(?:^|\n)\s*QRS\s+(-?\d{1,3})\b/im))E.qrsaxis=m[1];
 if(m=z.match(/(?:^|\n)\s*T\s+(-?\d{1,3})\b/im))E.taxis=m[1];
 if(/Sinus\s+rhythm/i.test(one))E.rhythm='Sinus rhythm';
 else if(/Sinus\s+bradycardia/i.test(one))E.rhythm='Sinus bradycardia';
 else if(/Sinus\s+tachycardia/i.test(one))E.rhythm='Sinus tachycardia';
 if(/Ventricular\s+premature\s+complex/i.test(one))E.vpc='Ventricular premature complex';
 if(m=one.match(/Abnormal\s+R[- ]?wave\s+progression[^;\n]*/i))E.rwave=m[0].trim();
 if(m=one.match(/Borderline\s+ST\s+elevation[^;\n]*/i))E.st=m[0].trim();
 else if(/ST\s*elev[^\n]{0,100}(?:early\s+repol|early\s+repolarization)/i.test(one))E.st='ST elevation, probable normal early repolarization pattern';
 else if(/ST\s+elevation/i.test(one))E.st='ST elevation';
 if(/borderline\s+right\s+axis\s+deviation/i.test(one))E.rad='borderline right axis deviation';
 else if(/right\s+axis\s+deviation/i.test(one))E.rad='right axis deviation';
 if(/consider\s+left\s+ventricular\s+hypertrophy/i.test(one))E.lvh='consider LVH';
 else if(/left\s+ventricular\s+hypertrophy/i.test(one))E.lvh='LVH';
 if(/Baseline\s+wander/i.test(one))E.wander='Baseline wander';
 const date=rocDateFromOCR(z);
 return {date,E};
}
function storeECGText(t,explicitDate){const {date,E}=ecgParseText(t);const dte=explicitDate||date||reportDateBy(/EKG|ECG|心電圖/i);if(!dte||!Object.keys(E).length)return false;Object.assign(ensureDate(dte).ecg,E);save();return true}
function bodyCompDateFromOCR(t){
 const z=String(t||'');
 let m=z.match(/\b(20\d{2})[\/.\-](\d{1,2})[\/.\-](\d{1,2})\b/);
 if(m){const y=Number(m[1])-1911;if(y>=100&&y<=130)return `${String(y).padStart(3,'0')}/${String(m[2]).padStart(2,'0')}/${String(m[3]).padStart(2,'0')}`}
 m=z.match(/\b(1\d{2})[\/.\-](\d{1,2})[\/.\-](\d{1,2})\b/);
 if(m)return `${m[1]}/${String(m[2]).padStart(2,'0')}/${String(m[3]).padStart(2,'0')}`;
 return null;
}
function storeInBodyOCR(t,extra){
 const z=String(t||'').replace(/\r/g,' ');
 const pats={
  BW:/(?:Weight|Body\s*Weight|體重|\bBW\b)\s*[:：]?\s*(\d{2,3}(?:\.\d+)?)/i,
  BMI:/\bBMI\s*[:：]?\s*(\d{1,2}(?:\.\d+)?)/i,
  PBF:/(?:Percent Body Fat|Body Fat Percentage|體脂肪率|\bPBF\b)\s*(?:\(%\))?\s*[:：]?\s*(\d{1,2}(?:\.\d+)?)/i,
  BFM:/(?:Body Fat Mass|體脂肪量|\bBFM\b)\s*[:：]?\s*(\d{1,3}(?:\.\d+)?)/i,
  SMM:/(?:Skeletal Muscle Mass|骨骼肌量|骨骼肌重|\bSMM\b)\s*[:：]?\s*(\d{1,3}(?:\.\d+)?)/i,
  VFA:/(?:Visceral Fat Area|Visceral Fat Index|內臟脂肪面積|內臟脂肪指數|\bVFA\b)\s*[:：]?\s*(\d{1,4}(?:\.\d+)?)/i,BMR:/(?:Basal Metabolic Rate|Basal Metabolism|基礎代謝(?:率|量)?|\bBMR\b)\s*[:：]?\s*(\d{3,4}(?:\.\d+)?)/i
 };
 const I={};for(const [k,re] of Object.entries(pats)){const m=z.match(re);if(m)I[k]=m[1]}
 if(extra)Object.assign(I,extra);
 if(Object.keys(I).length<2)return false;
 const dte=bodyCompDateFromOCR(z)||reportDateBy(/身體組成分析|InBody|QCheck|BCM-1/i)||Object.keys(S.byDate).sort((a,b)=>dateKey(b)-dateKey(a))[0];
 if(!dte)return false;
 Object.assign(ensureDate(dte).inbody,I);save();return true;
}
async function cropOCR(T,dataUrl,x0,y0,x1,y1){
 return await new Promise((resolve,reject)=>{
  const im=new Image();
  im.onload=async()=>{
   try{
    const c=document.createElement('canvas'),sx=Math.round(im.width*x0),sy=Math.round(im.height*y0),sw=Math.max(1,Math.round(im.width*(x1-x0))),sh=Math.max(1,Math.round(im.height*(y1-y0))),scale=3;
    c.width=sw*scale;c.height=sh*scale;
    const g=c.getContext('2d');g.drawImage(im,sx,sy,sw,sh,0,0,c.width,c.height);
    const id=g.getImageData(0,0,c.width,c.height),p=id.data;
    for(let i=0;i<p.length;i+=4){let y=.299*p[i]+.587*p[i+1]+.114*p[i+2];y=y<205?0:255;p[i]=p[i+1]=p[i+2]=y}
    g.putImageData(id,0,0);
    const out=await T.recognize(c,'eng');
    resolve(out?.data?.text||'');
   }catch(e){reject(e)}
  };
  im.onerror=reject;im.src=dataUrl;
 });
}
function numsFromOCR(t){
 return (String(t||'').match(/\d+(?:\.\d+)?/g)||[]).map(Number).filter(Number.isFinite);
}

function qcheckReportROCDate(raw){
 const z=String(raw||'').replace(/\r/g,' ');
 // Prefer explicit Gregorian date on QCheck report, e.g. 2026/8/11 or 2026/08/11.
 const m=z.match(/\b(20\d{2})[\/\-.](\d{1,2})[\/\-.](\d{1,2})\b/);
 if(!m)return '';
 const y=Number(m[1])-1911;
 if(y<=0)return '';
 return `${y}/${String(m[2]).padStart(2,'0')}/${String(m[3]).padStart(2,'0')}`;
}
async function parseQCheckImage(T,dataUrl,fullText){
 const reportDate=qcheckReportROCDate(fullText);
 // QCheck Report Summary has a fixed layout. OCR each measurement row separately,
 // avoiding the ideal-range and target columns.
 const extra={};
 const readNum=async(x0,y0,x1,y1,min,max)=>{
   try{
     const a=numsFromOCR(await cropOCR(T,dataUrl,x0,y0,x1,y1));
     return a.find(v=>v>=min&&v<=max);
   }catch(e){return null}
 };
 // If fullText did not include the report date, OCR the upper-right date box.
 let qDate=reportDate;
 if(!qDate){
   try{
     const dt=await cropOCR(T,dataUrl,.69,.055,.96,.105);
     qDate=qcheckReportROCDate(dt);
   }catch(e){}
 }
 // Left "測量結果" column (based on the QCheck Report Summary layout)
 const rows=[
   ['BW', .205,.210,.305,.238, 25,250],
   ['PBF',.205,.235,.305,.263,  2,80],
   ['BFM',.205,.260,.305,.289,  1,120],
   ['SMM',.205,.310,.305,.339,  5,120],
   ['BMI',.205,.335,.305,.365, 10,60]
 ];
 for(const [k,x0,y0,x1,y1,lo,hi] of rows){
   const v=await readNum(x0,y0,x1,y1,lo,hi);
   if(v!=null)extra[k]=String(v);
 }
 // BMR kcal: second number in the BMR panel (first large number is kJ).
 try{
   const a=numsFromOCR(await cropOCR(T,dataUrl,.075,.435,.205,.493));
   const kcal=a.find(v=>v>=500&&v<=4000);
   if(kcal!=null)extra.BMR=String(kcal);
 }catch(e){}
 // Visceral fat index: large integer in right-middle panel.
 try{
   const a=numsFromOCR(await cropOCR(T,dataUrl,.515,.435,.625,.505));
   const v=a.find(x=>x>=1&&x<=59);
   if(v!=null)extra.VFA=String(v);
 }catch(e){}
 // Fallback: OCR the whole measurement-result strip and use known row order.
 if(Object.keys(extra).length<5){
   try{
     const n=numsFromOCR(await cropOCR(T,dataUrl,.205,.205,.305,.405));
     if(n.length>=6){
       if(!extra.BW && n[0]>=25&&n[0]<=250)extra.BW=String(n[0]);
       if(!extra.PBF && n[1]>=2&&n[1]<=80)extra.PBF=String(n[1]);
       if(!extra.BFM && n[2]>=1&&n[2]<=120)extra.BFM=String(n[2]);
       if(!extra.SMM && n[4]>=5&&n[4]<=120)extra.SMM=String(n[4]);
       if(!extra.BMI && n[5]>=10&&n[5]<=60)extra.BMI=String(n[5]);
     }
   }catch(e){}
 }
 if(Object.keys(extra).length<3)return false;
 return storeInBodyOCR(fullText,extra,qDate||reportDate);
}
async function loadTesseract(){
 if(window.Tesseract?.recognize)return window.Tesseract;
 return await new Promise((resolve,reject)=>{const old=document.getElementById('__aclTesseract');if(old){let n=0;const tm=setInterval(()=>{if(window.Tesseract?.recognize){clearInterval(tm);resolve(window.Tesseract)}else if(++n>40){clearInterval(tm);reject(new Error('OCR engine did not load'))}},250);return}const s=document.createElement('script');s.id='__aclTesseract';s.src='https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js';s.onload=()=>window.Tesseract?.recognize?resolve(window.Tesseract):reject(new Error('OCR engine unavailable'));s.onerror=()=>reject(new Error('HIS blocked the OCR engine'));document.head.appendChild(s)})
}
async function cropECGHeader(dataUrl,threshold=false){
 return await new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>{try{
  const h=Math.max(260,Math.floor(im.height*.34)),scale=3,c=document.createElement('canvas');
  c.width=im.width*scale;c.height=h*scale;const x=c.getContext('2d');x.imageSmoothingEnabled=false;
  x.drawImage(im,0,0,im.width,h,0,0,c.width,c.height);
  if(threshold){const id=x.getImageData(0,0,c.width,c.height),p=id.data;for(let i=0;i<p.length;i+=4){const y=.299*p[i]+.587*p[i+1]+.114*p[i+2],q=y<195?0:255;p[i]=p[i+1]=p[i+2]=q}x.putImageData(id,0,0)}
  resolve(c)
 }catch(e){reject(e)}};im.onerror=reject;im.src=dataUrl})
}
async function preprocessECG(dataUrl){return await new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>{try{const cropH=Math.max(220,Math.floor(im.height*0.34));const scale=2,c=document.createElement('canvas');c.width=im.width*scale;c.height=cropH*scale;const x=c.getContext('2d');x.drawImage(im,0,0,im.width,cropH,0,0,c.width,c.height);const id=x.getImageData(0,0,c.width,c.height),p=id.data;for(let i=0;i<p.length;i+=4){let y=0.299*p[i]+0.587*p[i+1]+0.114*p[i+2];y=y<180?0:255;p[i]=p[i+1]=p[i+2]=y}x.putImageData(id,0,0);resolve(c)}catch(e){reject(e)}};im.onerror=reject;im.src=dataUrl})}

function parseAll(){
 const view=clinicalView(),t=txt();
 if(view==='LAB'){
   parseRPR();parseLabs();parseCBCDiff();parseUrine();parseStoolRoutine();parseBloodGas();parseSpecialText();
   return;
 }
 if(view==='REPORT'){
   const rt=activeReportBodyText();if(!rt)return;
   parseEcho(rt);parseInbody(rt);parseVascular(rt);parseCXR(rt);parseAbdominalUS(rt);parseHeadNeckUS(rt);parseEchoOthers(rt);parseKUB(rt);parseCTAbdomen(rt);parsePlainXRay(rt);parseColonFiberscopy(rt);parseUpperGI(rt);
 }
}
function v(L,k){return L[k]?.v}
function formatGroup(g){
 const L=g.labs||{},U=g.urine||{},E=g.echo||{},I=g.inbody||{},V=g.vascular||{},CXR=g.cxr||{},KUB=g.kub||{},CT=g.ct||{},AUS=g.abdUS||{},HNU=g.headNeckUS||{},EO=g.echoOther||{},XR=g.xray||{},ENDO=g.endoscopy||{},ECG=g.ecg||{},D=g.cbcDiff||{},BG=g.bloodGas||{},SP=g.special||{},ST=g.stool||{},lines=[];let a=[];
 if(v(L,'hba1c')){let x=`HbA1c ${v(L,'hba1c')}%`;if(v(L,'eag'))x+=` (eAG ${v(L,'eag')} mg/dL)`;a.push(x)}if(v(L,'gluAC'))a.push(`Glu-AC ${v(L,'gluAC')} mg/dL`);else if(v(L,'gluPC'))a.push(`Glu-PC ${v(L,'gluPC')} mg/dL`);if(v(L,'fbgAC'))a.push(`FBG AC ${v(L,'fbgAC')} mg/dL`);if(v(L,'fbgPC'))a.push(`FBG PC ${v(L,'fbgPC')} mg/dL`);if(v(L,'uacr'))a.push(`UACR ${v(L,'uacr')} mg/g`);if(v(L,'upcr'))a.push(`UPCR ${v(L,'upcr')} mg/g`);if(a.length)lines.push('• '+a.join('; '));
 if(['wbc','rbc','hb','hct','mcv','mch','mchc','plt'].some(k=>v(L,k))||Object.keys(D).length){a=[];if(v(L,'wbc'))a.push(`WBC ${v(L,'wbc')}`);if(v(L,'rbc'))a.push(`RBC ${v(L,'rbc')}`);if(v(L,'hb'))a.push(`Hb ${v(L,'hb')}`);if(v(L,'hct'))a.push(`Hct ${v(L,'hct')}%`);if(v(L,'mcv'))a.push(`MCV ${v(L,'mcv')} fL`);if(v(L,'mch'))a.push(`MCH ${v(L,'mch')} pg`);if(v(L,'mchc'))a.push(`MCHC ${v(L,'mchc')} g/dL`);if(v(L,'plt'))a.push(`Plt ${v(L,'plt')}`);const ds=[];for(const [k,nm] of [['neut','N'],['lymp','L'],['mono','M'],['eosi','E'],['baso','B']])if(D[k])ds.push(`${nm} ${D[k]}%`);if(ds.length)a.push(ds.join('/'));lines.push('• CBC: '+a.join('; '))}
 a=[];let lip=['tc','tg','hdl','ldl'].filter(k=>v(L,k));if(lip.length)a.push(`${lip.map(k=>({tc:'TC',tg:'TG',hdl:'HDL',ldl:'LDL'}[k])).join('/')} ${lip.map(k=>v(L,k)).join('/')} mg/dL`);if(v(L,'ua'))a.push(`UA ${v(L,'ua')} mg/dL`);if(a.length)lines.push('• '+a.join('; '));
 a=[];if(v(L,'bun'))a.push(`BUN ${v(L,'bun')}`);if(v(L,'cr'))a.push(`Cr ${v(L,'cr')}`);if(v(L,'egfr'))a.push(`eGFR ${v(L,'egfr')}`);let renal=a.length?a.join('/'):'';let ele=[];for(const k of ['na','k','cl'])if(v(L,k))ele.push(`${k==='na'?'Na':k==='k'?'K':'Cl'} ${v(L,k)}`);let minerals=[];for(const k of ['ca','p','mg'])if(v(L,k))minerals.push(`${k==='ca'?'Ca':k==='p'?'P':'Mg'} ${v(L,k)}`);let seg=[];if(renal)seg.push(renal);if(ele.length)seg.push(ele.join('/'));if(minerals.length)seg.push(minerals.join('/'));if(seg.length)lines.push('• '+seg.join('; '));
 a=[];if(v(L,'ast'))a.push(`AST ${v(L,'ast')}`);if(v(L,'alt'))a.push(`ALT ${v(L,'alt')}`);if(v(L,'alp'))a.push(`ALP ${v(L,'alp')}`);if(v(L,'ggt'))a.push(`r-GT ${v(L,'ggt')}`);if(v(L,'ldh'))a.push(`LDH ${v(L,'ldh')}`);if(v(L,'tbil'))a.push(`T-bil ${v(L,'tbil')}`);if(v(L,'dbil'))a.push(`D-bil ${v(L,'dbil')}`);if(v(L,'alb'))a.push(`Alb ${v(L,'alb')}`);if(a.length)lines.push('• '+a.join('; '));
 a=[];if(v(L,'crp'))a.push(`CRP ${v(L,'crp')} mg/dL`);if(v(L,'pct'))a.push(`PCT ${v(L,'pct')} ng/mL`);if(v(L,'lactate'))a.push(`Lactate ${v(L,'lactate')} mg/dL`);if(v(L,'ntprobnp'))a.push(`NT-proBNP ${v(L,'ntprobnp')} pg/mL`);if(v(L,'rpr'))a.push(`RPR ${v(L,'rpr')}`);if(v(L,'hsTnI'))a.push(`hs-TnI ${v(L,'hsTnI')} ng/L`);if(v(L,'hsTnT'))a.push(`hs-TnT ${v(L,'hsTnT')} ng/L`);if(v(L,'ddimer'))a.push(`D-dimer ${v(L,'ddimer')} ng/mL`);if(a.length)lines.push('• '+a.join('; '));
 a=[];if(v(L,'amylase'))a.push(`Amylase ${v(L,'amylase')} U/L`);if(v(L,'lipase'))a.push(`Lipase ${v(L,'lipase')} U/L`);if(a.length)lines.push('• '+a.join('; '));
 a=[];if(v(L,'ft4'))a.push(`FT4 ${v(L,'ft4')} ng/dL`);if(v(L,'tsh'))a.push(`TSH ${v(L,'tsh')} uIU/mL`);if(v(L,'t3'))a.push(`T3 ${v(L,'t3')} ng/mL`);if(a.length)lines.push('• TFT: '+a.join('; '));
 if(v(L,'psa'))lines.push(`• PSA ${v(L,'psa')} ng/mL`);
 a=[];if(v(L,'hbsAg'))a.push(`HBsAg ${v(L,'hbsAg')}`);if(v(L,'antiHBs'))a.push(`Anti-HBs ${v(L,'antiHBs')}`);if(v(L,'antiHCV'))a.push(`Anti-HCV ${v(L,'antiHCV')}`);if(a.length)lines.push('• Hepatitis: '+a.join('; '));
 if(v(L,'pra')||v(L,'pac')){a=[];if(v(L,'pra'))a.push(`PRA ${v(L,'pra')} ng/mL/hr`);if(v(L,'pac'))a.push(`PAC ${v(L,'pac')} ng/dL`);lines.push('• '+a.join('; '))}
 if(v(L,'aptt')||v(L,'pt')||v(L,'inr')){a=[];if(v(L,'pt'))a.push(`PT ${v(L,'pt')} sec`);if(v(L,'inr'))a.push(`INR ${v(L,'inr')}`);if(v(L,'aptt'))a.push(`aPTT ${v(L,'aptt')} sec`);lines.push('• Coag: '+a.join('; '))}
 {
   const sp=[];
   if(v(L,'microAlb'))sp.push(`MicroAlb ${v(L,'microAlb')} mg/L`);
   if(v(L,'urineTP'))sp.push(`TP ${v(L,'urineTP')} mg/L`);
   if(v(L,'urineCrSpot'))sp.push(`Cr ${v(L,'urineCrSpot')} mg/L`);
   if(v(L,'spotNa'))sp.push(`Na ${v(L,'spotNa')} mmol/L`);
   if(v(L,'spotK'))sp.push(`K ${v(L,'spotK')} mmol/L`);
   if(v(L,'spotCl'))sp.push(`Cl ${v(L,'spotCl')} mmol/L`);
   if(v(L,'spotMg'))sp.push(`Mg ${v(L,'spotMg')} mg/dL`);
   if(v(L,'spotUA'))sp.push(`UA ${v(L,'spotUA')} mg/dL`);
   if(v(L,'spotP'))sp.push(`P ${v(L,'spotP')} mg/dL`);
   if(v(L,'spotCa'))sp.push(`Ca ${v(L,'spotCa')} mg/dL`);
   if(v(L,'spotBUN'))sp.push(`BUN ${v(L,'spotBUN')} mg/dL`);
   if(v(L,'urineOsm'))sp.push(`Osm ${v(L,'urineOsm')} mOsm/kg`);
   if(sp.length)lines.push('• Spot urine: '+sp.join('; '));
 }
 if(Object.keys(U).length){const p=[],labels={glu:'Glu',pro:'PRO',ket:'Ket',ob:'OB',nit:'Nit',le:'LE',uro:'Uro',bil:'BIL',rbc:'RBC',wbc:'WBC',ep:'EP cell',bacteria:'Bacteria',cast:'Cast',crystal:'Crystal',mucus:'Mucus',parasite:'Parasite',yeast:'Yeast/Fungi',sg:'Sp.gr',ph:'pH'};for(const k of ['color','clarity','glu','pro','ket','ob','nit','le','uro','bil','rbc','wbc','ep','bacteria','cast','crystal','mucus','parasite','yeast','sg','ph'])if(U[k]!==undefined){let z=String(U[k]).trim();if(k==='glu'){if(/^(negative|neg|-|\(-\))$/i.test(z))z='Neg';else if(/^(positive|pos|\+|\(\+\))$/i.test(z))z='(+)' }else if(['pro','ket','ob','nit','le','uro','bil','bacteria','crystal','mucus','parasite','yeast'].includes(k)){if(/^(negative|neg|-|\(-\))$/i.test(z))z='(-)';else if(/^(positive|pos|\+|\(\+\))$/i.test(z))z='(+)' }if(['rbc','wbc','ep','bacteria'].includes(k)&&/^\d+\s*[-~]\s*\d+$/i.test(z))z=z.replace(/\s*~\s*/,'-')+'/HPF';if(['cast','mucus'].includes(k)&&/^\d+\s*[-~]\s*\d+$/i.test(z))z=z.replace(/\s*~\s*/,'-')+'/LPF';p.push((k==='color'||k==='clarity')?z:`${labels[k]} ${z}`)}if(p.length)lines.push('• Urine: '+p.join('; '))}
 if(Object.keys(BG).length){a=[];for(const [k,label,unit] of [['ph','pH',''],['pco2','pCO2',' mmHg'],['hco3','HCO3',' mmol/L'],['be','BE',' mmol/L'],['po2','pO2',' mmHg'],['so2','sO2','%']])if(BG[k])a.push(`${label} ${BG[k]}${unit}`);if(a.length)lines.push(`• ${BG.type||'Blood gas'}: `+a.join('; '))}
 if(SP.bloodKetone)lines.push(`• Ketone ${SP.bloodKetone}`);
 if(SP.covidAg||SP.fluA||SP.fluB){a=[];if(SP.covidAg)a.push(`SARS-CoV-2 Ag ${SP.covidAg}`);if(SP.fluA)a.push(`Flu A ${SP.fluA}`);if(SP.fluB)a.push(`Flu B ${SP.fluB}`);lines.push('• Viral: '+a.join('; '))}
 if(g.series?.poc?.length){const arr=[...g.series.poc].sort((a,b)=>(a.time||'99:99').localeCompare(b.time||'99:99'));lines.push('• Glucose: '+arr.map(x=>`${x.time||''} ${x.v}`.trim()).join(' → ')+' mg/dL')}
 if(Object.keys(ST).length){a=[];if(ST.color)a.push(`${ST.color}`);if(ST.consistency)a.push(`${ST.consistency}`);if(ST.ob!==undefined)a.push(`OB ${ST.ob}`);if(ST.rbc!==undefined)a.push(`RBC ${ST.rbc}${/HPF/i.test(ST.rbc)?'':'/HPF'}`);if(ST.pus!==undefined)a.push(`Pus ${ST.pus}${/HPF/i.test(ST.pus)?'':'/HPF'}`);if(ST.mucus!==undefined)a.push(`Mucus ${ST.mucus}`);if(ST.ova)a.push(`OVA ${ST.ova}`);if(ST.amoeba)a.push(`Amoeba ${ST.amoeba}`);if(ST.others)a.push(`Others ${ST.others}`);if(ST.transferrin)a.push(`Transferrin ${ST.transferrin}`);if(a.length)lines.push('• Stool: '+a.join('; '))}
 if(Object.keys(E).length){a=[];if(E.lvh)a.push('LVH');if(E.lvef)a.push(`LVEF ${E.lvef}%`);if(E.sys)a.push(E.sys);if(E.dia)a.push(E.dia);for(const sev of ['trivial','mild','moderate','severe']){const vs=['MR','PR','TR'].filter(x=>E[x]===sev);if(vs.length)a.push(`${sev} ${vs.join('/')}`)}if(E.pasp)a.push(`PASP ${E.pasp} mmHg`);if(a.length)lines.push('• Echo: '+a.join('; '))}
 if(Object.keys(I).length){const p=[];for(const k of ['BW','BMI','BMR','PBF','BFM','SMM','VFA'])if(I[k])p.push(`${k} ${I[k]}${k==='PBF'?'%':k==='BW'||k==='BFM'||k==='SMM'?' kg':k==='BMI'?' kg/m²':k==='BMR'?' kcal':''}`);if(p.length)lines.push('• Body composition: '+p.join('; '))}
 if(Object.keys(V).length){const rv=V.abnormalR||V.normalR||V.ncR||'',lv=V.abnormalL||V.normalL||V.ncL||'';let out='';if(rv||lv){out=`R/L ${rv||'-'}/${lv||'-'}`;const ann=[];if(V.abnormalR)ann.push('R abnormal');else if(V.ncR)ann.push('R N/C');if(V.abnormalL)ann.push('L abnormal');else if(V.ncL)ann.push('L N/C');if(ann.length)out+=` (${ann.join(', ')})`}else if(V.values?.length>=2)out=`R/L ${V.values[0]}/${V.values[1]}`;else if(V.values?.length)out=V.values.join('/');if(out)lines.push('• PVR/ABI: '+out)}
 if(CXR.findings?.length){const cx=CXR.findings.map(x=>String(x).replace(/^[\s\-_=#|.;,:]+|[\s\-_=#|.;,:]+$/g,'').trim()).filter(x=>x&&/[A-Za-z]{3,}/.test(x)&&!/^CXR\s*:?$/i.test(x)&&!/^[-_=#|.;,:\s]+$/.test(x));if(cx.length)lines.push('• CXR: '+cx.join('; '))}
 if(KUB.findings?.length){const kx=KUB.findings.map(x=>String(x).replace(/^[\s\-_=#|.;,:]+|[\s\-_=#|.;,:]+$/g,'').trim()).filter(Boolean);if(kx.length)lines.push('• KUB: '+kx.join('; '))}
 if(AUS.findings?.length){const z=AUS.findings.map(x=>clean(x).replace(/^[*•.\-\s]+/,'').trim()).filter(Boolean);if(z.length)lines.push('• Abd US: '+z.join('; '))}
 if(HNU.findings?.length){const z=HNU.findings.map(x=>clean(x).replace(/^[□■☑✓✔*•.\-\s]+/,'').replace(/^Others\s*:\s*/i,'').trim()).filter(x=>x&&!/\bnil\b/i.test(x));if(z.length)lines.push('• Head/Neck US: '+z.join('; '))}
 if(EO.findings?.length){const z=EO.findings.map(x=>clean(x).replace(/^[*•.\-\s]+/,'').trim()).filter(Boolean);if(z.length)lines.push(`• Echo ${EO.label||'Others'}: `+z.join('; '))}
 if(CT.abdomen?.length){const z=CT.abdomen.map(x=>clean(x)).filter(Boolean);if(z.length)lines.push('• CT Abdomen: '+z.join('; '))}
 if(XR.lower?.length){const z=XR.lower.map(x=>clean(x).replace(/^[*•.\-\s]+/,'').trim()).filter(Boolean);if(z.length)lines.push('• X-ray Knee/Pelvis: '+z.join('; '))}
 for(const [k,label] of [['cspine','C-spine'],['wrist','Wrist'],['elbow','Elbow'],['forearm','Forearm']])if(XR[k]?.length){const z=XR[k].map(clean).filter(Boolean);if(z.length)lines.push(`• X-ray ${label}: `+z.join('; '))}
 if(ENDO.colon){
   let z=ENDO.colon;
   if(ENDO.colonDiagnosis?.length)z+=': '+ENDO.colonDiagnosis.join('; ');
   if(ENDO.colonSuggestion?.length)z+='; Suggestion: '+ENDO.colonSuggestion.join('; ');
   lines.push('• '+z)
 }
 if(ENDO.ugi?.length)lines.push('• Upper GI panendoscopy: '+ENDO.ugi.join('; '))
 if(Object.keys(ECG).length){const p=[];if(ECG.hr)p.push(`HR ${ECG.hr} bpm`);if(ECG.pr)p.push(`PR ${ECG.pr} ms`);if(ECG.qrs)p.push(`QRS ${ECG.qrs} ms`);if(ECG.qt)p.push(`QT ${ECG.qt} ms`);if(ECG.qtc)p.push(`QTc ${ECG.qtc} ms`);if(ECG.rhythm)p.push(ECG.rhythm);if(ECG.vpc)p.push(ECG.vpc);if(ECG.rwave)p.push(ECG.rwave);if(ECG.rad)p.push(ECG.rad);if(ECG.lvh)p.push(ECG.lvh);if(ECG.st)p.push(ECG.st);if(ECG.wander)p.push(ECG.wander);if(p.length)lines.push('• EKG: '+p.join('; '))}
 return lines;
}
function dateKey(d){const p=d.split('/').map(Number);return p[0]*10000+p[1]*100+p[2]}
function fmt(){
parseAll();const dates=Object.keys(S.byDate).filter(d=>formatGroup(S.byDate[d]).length).sort((a,b)=>dateKey(b)-dateKey(a));return dates.map(d=>`${d}\n${formatGroup(S.byDate[d]).join('\n')}`).join('\n\n')}
const d=document.createElement('div');d.id=ID;d.style='position:fixed;z-index:2147483647;right:12px;top:12px;width:min(720px,calc(100vw - 24px));max-height:calc(100vh - 24px);overflow:auto;background:#fff;color:#243746;border:1px solid #ccd3db;border-radius:14px;box-shadow:0 12px 40px #0004;padding:14px;font:14px Arial,sans-serif';
d.innerHTML=`<div style="display:flex;justify-content:space-between"><b>Auto Clinical Lab v6.8.3</b><button id=aX>×</button></div><div style="margin:8px 0;font-size:12px">Mode <select id=aM><option>AUTO</option><option>OPD</option><option>IPD</option></select> <span id=aD></span></div><pre id=aR style="white-space:pre-wrap;background:#f7f9fb;padding:10px;border-radius:9px;min-height:50px"></pre><div style="display:flex;gap:8px;flex-wrap:wrap"><button id=aC>Copy</button><button id=aK>Clear cache</button><button id=aS>Windows 剪取工具</button></div><div id=aMsg style="font-size:11px;color:#667085;margin-top:8px">依完報日累積：不同日期不覆蓋；同日同項目去重。以完報日為唯一日期基準（不使用看診日／診療日／開單日）；新增 CT Abdomen / UACR formula / PSA；離線 Bookmarklet 安裝修正；Urine 僅限尿液檢驗區塊讀取；新增 spot urine chemistry；UACR/UPCR 可由 spot urine 自動計算；新增 KUB；Stool routine；hs-Troponin I/T；Urine routine 細項；C-spine / wrist / elbow / knee / forearm X-ray；Colon fiberscopy；Upper GI panendoscopy；Abdomen + pelvis CT 分類；FBG AC/PC；NT-proBNP；排除生日等非完報日期誤讀；Urine RBC/WBC 僅限尿液檢體；新增腹部超音波；RPR/VDRL；更新尿液檢驗另一套命名格式；檢查清單未點選時保持空白；新增 Echo for Others；下肢/膝/骨盆同份 X-ray 報告合併去重；Windows 截圖改為 HIS 頁面直接 Ctrl+V，不再開啟 screen_capture.html；支援 EKG / InBody 截圖預覽與可用時 OCR；Spot urine 加入 MicroAlbumin；新增頭頸部軟組織超音波；QCheck Report Summary 固定版型截圖可讀取 BW/BMI/PBF/BFM/SMM/VFA；新增 HBsAg / Anti-HBs / Anti-HCV；初報且完報時間空白時亦可讀取；修正 Upper GI 不再誤接至 CT；Colon fiberscopy 加入 Diagnosis / Suggestion。</div><div id=aCap style="display:none;margin-top:8px"><img id=aImg alt="Captured screen" style="max-width:100%;max-height:220px;border:1px solid #ccd3db;border-radius:8px"></div>`;document.body.appendChild(d);
const R=d.querySelector('#aR'),DET=d.querySelector('#aD');function draw(){const t=txt();const det=/\b住院\b/.test(t)?'IPD':/\b門診\b|\b急診\b/.test(t)?'OPD':'?';DET.textContent='Detected: '+det;const view=clinicalView();if(!view){R.textContent='';return}if(view==='REPORT'&&!hasActiveReportBody()){R.textContent='';return}R.textContent=fmt()}
let tm;const sch=()=>{clearTimeout(tm);tm=setTimeout(draw,250)};addEventListener('scroll',sch,{passive:true});new MutationObserver(sch).observe(document.body,{subtree:true,childList:true,characterData:true});
const MSG=d.querySelector('#aMsg'),CAP=d.querySelector('#aCap'),IMG=d.querySelector('#aImg');const setMsg=(s,bad=false)=>{MSG.textContent=s;MSG.style.color=bad?'#b42318':'#667085'};const showCapture=dataUrl=>{if(!dataUrl)return;IMG.src=dataUrl;CAP.style.display='block';setMsg('截圖已貼上 ✓')};
async function ocrCapturedImage(dataUrl){
 showCapture(dataUrl);
 try{
   setMsg('截圖已貼上 ✓，嘗試 OCR…');
   const T=await loadTesseract();
   const out=await T.recognize(dataUrl,'eng',{logger:m=>{if(m?.status==='recognizing text'&&Number.isFinite(m.progress))setMsg(`OCR ${Math.round(m.progress*100)}%…`)}});
   const text=out?.data?.text||'';
   let ok=false,label='';
   if(/Q\s*Check|QCheck|Report Summary/i.test(text)){
     setMsg('辨識到 QCheck 身體組成報告，讀取數值中…');
     ok=await parseQCheckImage(T,dataUrl,text);label='InBody';
   }
   if(!ok&&/(?:InBody|Body Composition|Percent Body Fat|Skeletal Muscle Mass|Visceral Fat Area|\bPBF\b|\bSMM\b|\bVFA\b)/i.test(text)){
     ok=storeInBodyOCR(text);label='InBody';
   }
   if(!ok){
     setMsg('辨識 EKG 報告日期與上方數值中…');
     const h1=await cropECGHeader(dataUrl,false),h2=await cropECGHeader(dataUrl,true);
     const o1=await T.recognize(h1,'eng'),o2=await T.recognize(h2,'eng');
     const ecgText=[text,o1?.data?.text||'',o2?.data?.text||''].join('\n');
     const reportDate=rocDateFromOCR(ecgText);
     ok=storeECGText(ecgText,reportDate);label='EKG';
   }
   if(ok){draw();setMsg(`${label} OCR 完成 ✓ 已加入 summary。`)}
   else setMsg('截圖已貼上 ✓；未自動辨識到 ECG / InBody 欄位，預覽仍保留。',false);
 }catch(e){
   setMsg('截圖已貼上 ✓；院內網路無法載入 OCR 引擎，因此保留預覽，不會再開啟外部網頁。',false);
 }
}
async function handlePaste(ev){
 const items=[...(ev.clipboardData?.items||[])];
 const it=items.find(x=>x.type?.startsWith('image/'));
 if(!it)return;
 ev.preventDefault();
 const f=it.getAsFile();if(!f)return;
 const rd=new FileReader();
 rd.onload=()=>ocrCapturedImage(rd.result);
 rd.readAsDataURL(f);
}
document.addEventListener('paste',handlePaste,true);
d.querySelector('#aC').onclick=async()=>{const text=R.textContent||'';if(!text){setMsg('沒有可複製的內容。',true);return}try{const sel=window.getSelection();sel.removeAllRanges();const rg=document.createRange();rg.selectNodeContents(R);sel.addRange(rg)}catch(e){}let ok=false;try{ok=document.execCommand('copy')}catch(e){}if(!ok){try{if(navigator.clipboard&&window.isSecureContext){await navigator.clipboard.writeText(text);ok=true}}catch(e){}}if(!ok){try{const ta=document.createElement('textarea');ta.value=text;ta.style='position:fixed;left:-9999px;top:-9999px';document.body.appendChild(ta);ta.select();ta.setSelectionRange(0,ta.value.length);ok=document.execCommand('copy');ta.remove();try{const sel=window.getSelection();sel.removeAllRanges();const rg=document.createRange();rg.selectNodeContents(R);sel.addRange(rg)}catch(e){}}catch(e){}}setMsg(ok?'已全選並複製 ✓ 可直接貼到 EMR。':'複製失敗，結果已全選，請按 Ctrl+C。',!ok)};d.querySelector('#aK').onclick=()=>{S={byDate:{},mode:'AUTO'};sessionStorage.removeItem(KEY);R.textContent='';CAP.style.display='none';IMG.removeAttribute('src');setMsg('Cache cleared.');};d.querySelector('#aX').onclick=()=>{document.removeEventListener('paste',handlePaste,true);d.remove()};d.querySelector('#aS').onclick=()=>{setMsg('請直接按 Win+Shift+S 截取 EKG 或身體組成畫面；截圖完成後回到目前 HIS 頁面，按 Ctrl+V。圖片只貼在此視窗預覽，不會開啟 GitHub 或其他外部網頁。');};draw();
})()
