export function setupIntro(onStart){
 const intro=document.getElementById('intro');
 const gameLayers=[...document.body.children].filter(el=>el!==intro&&el.tagName!=='SCRIPT');
 gameLayers.forEach(el=>el.inert=true);
 let finished=false;
 const start=()=>{if(finished)return;finished=true;intro.classList.add('leaving');intro.inert=true;gameLayers.forEach(el=>el.inert=false);onStart();setTimeout(()=>{intro.hidden=true},650)};
 document.getElementById('intro-start').addEventListener('click',start);
 document.getElementById('intro-skip').addEventListener('click',start);
 document.getElementById('intro-replay').addEventListener('click',()=>{intro.classList.remove('playing');void intro.offsetWidth;intro.classList.add('playing')});
 const images=[...intro.querySelectorAll('img')];
 Promise.all(images.map(img=>img.decode().catch(()=>null))).then(()=>{intro.classList.add('playing');document.getElementById('intro-loading').hidden=true});
 return {element:intro,start};
}
