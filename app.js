const START = "2025-12-23";
const END = "2026-01-01";
const TZ = "Europe/Zurich";

const el = (id) => document.getElementById(id);

/* DATE UTILS */
function ymdInTZ(date=new Date()){
  return new Intl.DateTimeFormat("en-CA",{
    timeZone:TZ,year:"numeric",month:"2-digit",day:"2-digit"
  }).format(date);
}
function addDays(ymd,n){
  const d=new Date(ymd); d.setDate(d.getDate()+n);
  return d.toISOString().slice(0,10);
}
function formatFR(ymd){
  return new Intl.DateTimeFormat("fr-CH",{dateStyle:"full"})
    .format(new Date(ymd));
}

/* COUNTDOWN */
function renderCountdown(today){
  const cd=el("countdown");
  if(today>=START){ cd.textContent=""; return; }

  const diff=(new Date(START)-new Date())/1000;
  const d=Math.floor(diff/86400);
  const h=Math.floor((diff%86400)/3600);
  const m=Math.floor((diff%3600)/60);

  cd.textContent =
    d>=1 ? `⏳ J-${d} : ça commence bientôt…`
         : `⏳ J-1 : ${h}h ${m}min (heure Suisse)`;
}

/* MODAL */
let surprises={};

function openModal(ymd){
  const s=surprises[ymd]||{};
  el("mTitle").textContent=s.title||"Surprise ✨";
  el("mDate").textContent=formatFR(ymd);
  el("mText").textContent=s.text||"💛";

  const img=el("mImage");
  if(s.image){ img.src=s.image; img.classList.remove("hidden"); }
  else{ img.classList.add("hidden"); }

  el("modal").classList.remove("hidden");
}
function closeModal(){ el("modal").classList.add("hidden"); }

/* MAIN */
async function main(){
  surprises=await fetch("surprises.json").then(r=>r.json());
  const today=ymdInTZ();

  renderCountdown(today);
  setInterval(()=>renderCountdown(ymdInTZ()),30000);

  const grid=el("grid");
  const total=(new Date(END)-new Date(START))/86400000+1;
  const unlocked=Math.max(0,Math.min(total,(new Date(today)-new Date(START))/86400000+1));

  el("status").textContent =
    today<START ? "Encore un peu de patience…" :
    today>END ? "Calendrier terminé ✨" :
    `Aujourd’hui : ${formatFR(today)}`;

  for(let i=0;i<total;i++){
    const date=addDays(START,i);
    const btn=document.createElement("button");
    btn.className="day"+(i<unlocked?"":" locked");
    btn.innerHTML=`
      <div class="badge">Jour ${i+1} ${i<unlocked?"✨":"🔒"}</div>
      <div class="small">${formatFR(date)}</div>`;
    if(i<unlocked) btn.onclick=()=>openModal(date);
    grid.appendChild(btn);
  }

  el("close").onclick=closeModal;
  el("modal").onclick=e=>e.target.id==="modal"&&closeModal();
}
main();
