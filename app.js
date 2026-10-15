'use strict';
const COLORS=['yellow','green','red','blue'], LIMIT=24, MAX=120, PASS=72;
const STORAGE='calculadora-alvo4sat-pro-v1.1';
let entries=[];
let resultModalSignature=null;
const el=id=>document.getElementById(id);
function scoreFromPoint(pos){const r=Math.hypot(pos.x-50,(pos.y-50)*10/7);return r<=20?5:r<=31?4:r<=42?3:0;}
function summary(items=entries){const shots=items.filter(x=>x.type==='shot');const penalties=items.filter(x=>x.type==='penalty').length;const points=shots.reduce((n,s)=>n+s.p,0)-penalties*5;return {n:shots.length,penalties,points,percent:points/MAX*100,result:shots.length===LIMIT?(points>=PASS?'APTO':'INAPTO'):null};}
function validEntry(x){return x&&((x.type==='penalty')||(x.type==='shot'&&[0,3,4,5].includes(x.p)&&(COLORS.includes(x.c)||x.c==='white')&&(x.c==='white'?x.p===0:Number.isFinite(x.x)&&Number.isFinite(x.y)&&x.x>=0&&x.x<=100&&x.y>=0&&x.y<=100)));}
function load(){try{const saved=JSON.parse(localStorage.getItem(STORAGE)||'[]');if(Array.isArray(saved)&&saved.length<=1000&&saved.every(validEntry)&&saved.filter(x=>x.type==='shot').length<=LIMIT)entries=saved;}catch{}}
function save(){try{localStorage.setItem(STORAGE,JSON.stringify(entries));}catch{}}
function toast(message){el('toast').textContent=message;el('toast').hidden=false;clearTimeout(toast.id);toast.id=setTimeout(()=>el('toast').hidden=true,2600);}
function randomImpactPosition(color,points){const area=document.querySelector('.zone.'+color+' .zone-impact-area');const rect=area.getBoundingClientRect();const width=rect.width||190,height=rect.height||width*10/7;const separation=(window.innerWidth<500?13:16)+3;const used=entries.filter(x=>x.type==='shot'&&x.c===color);let best=null,bestDistance=-1;
 function consider(x,y){if(x<6||x>94||y<7||y>85||(x>70&&y<18)||scoreFromPoint({x,y})!==points)return null;const distance=used.length?Math.min(...used.map(p=>Math.hypot((x-p.x)*width/100,(y-p.y)*height/100))):Infinity;if(distance>bestDistance){best={x,y};bestDistance=distance;}return distance>=separation?{x,y}:null;}
 for(let i=0;i<800;i++){let x,y;if(points){const band=points===5?[2,17]:points===4?[23,28]:[34,39],r=Math.sqrt(band[0]**2+Math.random()*(band[1]**2-band[0]**2)),a=Math.random()*Math.PI*2;x=50+Math.cos(a)*r;y=50+Math.sin(a)*r*7/10;}else{x=6+Math.random()*88;y=7+Math.random()*78;}const candidate=consider(x,y);if(candidate)return candidate;}
 for(let y=7;y<=85;y+=1.5)for(let x=6;x<=94;x+=1.5){const candidate=consider(x,y);if(candidate)return candidate;}
 return bestDistance>=separation?best:null;
}
function recordShot(color,pos,manualPoints){if(summary().n>=LIMIT){toast('Os 24 tiros já foram lançados. Use Desfazer para corrigir.');return false;}let p=0;if(color!=='white'){p=manualPoints===undefined?scoreFromPoint(pos):manualPoints;if(!COLORS.includes(color)||![0,3,4,5].includes(p))return false;if(!pos)pos=randomImpactPosition(color,p);if(!pos){toast('Sem espaço livre nessa região. Lance o impacto diretamente no alvo.');return false;}}
 entries.push({type:'shot',c:color,p,...(pos||{})});save();render();return true;
}
function recordPenalty(){if(!summary().n){toast('Lance um tiro antes de registrar uma penalidade.');return;}entries.push({type:'penalty'});save();render();}
function undo(){if(!entries.length){toast('Não há lançamento para desfazer.');return;}entries.pop();save();render();}
function clearProof(){entries=[];try{localStorage.removeItem(STORAGE);}catch{}render();}
function render(){const s=summary();el('points').textContent=s.points+'/120';el('percent').textContent=Number(s.percent.toFixed(1))+'%';el('shots').textContent=s.n+'/24';el('penalties').textContent=s.penalties;const result=el('result');result.className='result'+(s.result?(s.result==='APTO'?' ok':' fail'):'');result.textContent=s.result||'EM LANÇAMENTO';const small=document.createElement('small');small.textContent=s.result?s.points+' pontos · '+Number(s.percent.toFixed(1))+'%':'Faltam '+(LIMIT-s.n)+' tiros para obter o resultado.';result.appendChild(small);
 syncResultModal(s);
 document.querySelectorAll('.hit').forEach(x=>x.remove());COLORS.forEach(c=>{const shots=entries.filter(x=>x.type==='shot'&&x.c===c);document.querySelector('[data-score-color="'+c+'"]').textContent=shots.reduce((n,x)=>n+x.p,0);document.querySelectorAll('[data-point-color="'+c+'"]').forEach(b=>b.querySelector('.point-count').textContent=shots.filter(x=>x.p===Number(b.dataset.pointValue)).length);const area=document.querySelector('.zone.'+c+' .zone-impact-area');shots.forEach(x=>{const mark=document.createElement('span');mark.className='hit';mark.style.left=x.x+'%';mark.style.top=x.y+'%';area.appendChild(mark);});});
}
el('target').addEventListener('click',event=>{const button=event.target.closest('[data-point-value]');if(button){recordShot(button.dataset.pointColor,null,Number(button.dataset.pointValue));return;}const area=event.target.closest('.zone-impact-area');if(!area)return;const r=area.getBoundingClientRect();recordShot(area.closest('[data-c]').dataset.c,{x:Math.max(0,Math.min(100,(event.clientX-r.left)/r.width*100)),y:Math.max(0,Math.min(100,(event.clientY-r.top)/r.height*100))});});
el('outside').onclick=()=>recordShot('white');el('penalty').onclick=recordPenalty;el('undo').onclick=undo;
el('clear').onclick=()=>el('clearDialog').showModal();el('cancelClear').onclick=()=>el('clearDialog').close();el('confirmClear').onclick=()=>{clearProof();el('clearDialog').close();};
el('developer').onclick=()=>el('developerDialog').showModal();el('closeDeveloper').onclick=()=>el('developerDialog').close();
function syncResultModal(s){
 const dialog=el('resultDialog');
 if(!s.result){resultModalSignature=null;if(dialog.open)dialog.close();return;}
 const signature=s.n+':'+s.points+':'+s.penalties;
 if(signature!==resultModalSignature){
  resultModalSignature=signature;
  if(!dialog.open)dialog.showModal();
 }
}
el('reviewResult').onclick=()=>el('resultDialog').close();
el('newProofResult').onclick=()=>{el('resultDialog').close();el('clearDialog').showModal();};
load();render();
if('serviceWorker' in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));

/* Mantém a geometria 7:10 das áreas de impacto dentro da altura disponível. */
function fitTargetToScreen(){
 const space=document.querySelector('.target-space');
 if(!space)return;
 const width=Math.max(0,Math.min(440,space.clientWidth,(space.clientHeight-88)*7/10+12));
 el('target').style.setProperty('--target-width',width+'px');
}
if(typeof ResizeObserver!=='undefined'){
 const targetLayoutObserver=new ResizeObserver(fitTargetToScreen);
 targetLayoutObserver.observe(document.querySelector('.target-space'));
}
window.addEventListener('resize',fitTargetToScreen);
if(window.visualViewport)window.visualViewport.addEventListener('resize',fitTargetToScreen);
fitTargetToScreen();
