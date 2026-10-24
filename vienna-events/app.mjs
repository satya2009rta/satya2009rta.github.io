let events=[],sources=[],catalog=null,loadError='',loading=false;
import {filterEvents,viennaDay,viennaTime,dateRange} from './filters.mjs';
const $=id=>document.getElementById(id);
const esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const svg=path=>`<svg viewBox="0 0 24 24" aria-hidden="true">${path}</svg>`;
const icons={arrow:svg('<path d="M6 18 18 6M6 6h12v12"/>'),bookmark:svg('<path d="M6 3h12v18l-6-4-6 4z"/>'),clock:svg('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'),pin:svg('<path d="M20 10c0 6-8 11-8 11S4 16 4 10a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="2.5"/>'),music:svg('<path d="M9 18V5l11-2v13M9 8l11-2"/><ellipse cx="6" cy="18" rx="3" ry="2.5"/><ellipse cx="17" cy="16" rx="3" ry="2.5"/>'),festival:svg('<path d="m3 10 9-7 9 7H3zM5 10v11h14V10M9 21v-6h6v6M12 3V1"/>'),dance:svg('<path d="m12 3 2 6 6 2-6 3-2 7-3-7-6-3 6-2 3-6z"/>'),film:svg('<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M7 3v18M17 3v18M3 8h4M3 16h4M17 8h4M17 16h4"/>'),art:svg('<rect x="3" y="3" width="18" height="18" rx="2"/><path d="m3 17 6-6 5 5 3-3 4 4"/><circle cx="16" cy="8" r="1"/>')};
const labels={music:'Live music',festival:'Festival',dance:'Dance & nightlife',film:'Film',comedy:'Comedy',theatre:'Theatre',fireworks:'Fireworks'};
icons.comedy=icons.dance;icons.theatre=icons.film;icons.fireworks=icons.dance;
let saved=[];try{const stored=JSON.parse(localStorage.getItem('vienna-free-saved-v1')||'[]');if(Array.isArray(stored))saved=stored.filter(id=>typeof id==='string');}catch{}
let state={period:'all',types:[],query:'',from:'',to:'',outdoor:false,savedOnly:false,area:'all',saved};
const params=new URLSearchParams(location.search);
const validPeriods=['all','today','week','weekend','custom'];
if(validPeriods.includes(params.get('when')))state.period=params.get('when');
state.types=[...new Set(params.getAll('type').flatMap(value=>value.split(',')).filter(type=>['indian',...Object.keys(labels)].includes(type)))];
for(const key of ['from','to'])if(/^\d{4}-\d{2}-\d{2}$/.test(params.get(key)||'')&&!Number.isNaN(Date.parse(params.get(key))))state[key]=params.get(key);
if(['all','vienna','nearby'].includes(params.get('area')))state.area=params.get('area');
if(params.get('indian')==='1'&&!state.types.includes('indian'))state.types.push('indian');
state.query=params.get('q')||'';state.outdoor=params.get('outdoor')==='1';state.savedOnly=params.get('saved')==='1';
function formatDay(day,options={day:'numeric',month:'short'}){return new Intl.DateTimeFormat('en-GB',options).format(new Date(day+'T12:00:00Z'));}
function saveUrl(){const p=new URLSearchParams();if(state.period!=='all')p.set('when',state.period);if(state.types.length)p.set('type',state.types.join(','));if(state.query)p.set('q',state.query);if(state.outdoor)p.set('outdoor','1');if(state.area!=='all')p.set('area',state.area);if(state.savedOnly)p.set('saved','1');if(state.period==='custom'){if(state.from)p.set('from',state.from);if(state.to)p.set('to',state.to);}history.replaceState(null,'',location.pathname+(p.size?'?'+p:''));}
function showToast(message){$('toast').textContent=message;$('toast').classList.add('visible');clearTimeout(showToast.timer);showToast.timer=setTimeout(()=>$('toast').classList.remove('visible'),2300);}
function eventCard(event){
 const day=event.matchingDates[0],isSaved=state.saved.includes(event.id),remaining=event.dates.filter(d=>d>=viennaDay());
 const dateText=event.matchingDates.length>1?`${formatDay(day,{weekday:'short',day:'numeric',month:'short'})} + ${event.matchingDates.length-1} more ${event.matchingDates.length===2?'date':'dates'}`:formatDay(day,{weekday:'short',day:'numeric',month:'short'});
 const allDates=event.dates.map(d=>formatDay(d,{weekday:'short',day:'numeric',month:'short',year:'numeric'})).join(' · ');
 return `<article class="event-card" data-event-id="${esc(event.id)}"><div class="card-body"><div class="card-top"><div class="date-stamp" aria-hidden="true"><span>${formatDay(day,{month:'short'}).toUpperCase()}</span><strong>${formatDay(day,{day:'numeric'})}</strong></div><div class="card-labels"><span class="category ${event.type}">${icons[event.type]} ${labels[event.type]}</span><span class="dot">·</span><span class="tag">${esc(event.tags[0]||'Free entry')}</span></div><button class="bookmark" data-save="${esc(event.id)}" aria-pressed="${isSaved}" aria-label="${isSaved?'Remove':'Save'} ${esc(event.title)}${isSaved?' from saved events':''}" title="${isSaved?'Remove from saved':'Save event'}">${icons.bookmark}</button></div><h3>${esc(event.title)}</h3><p class="subtitle">${esc(event.subtitle)}</p><div class="event-meta"><div>${icons.clock}<span><time datetime="${day}">${dateText}</time> <span class="district">·</span> ${event.time}${event.timeEnd?'–'+event.timeEnd+(event.timeEndDayOffset===1?' (+1 day)':''):' onwards'}</span></div><div>${icons.pin}<span>${esc(event.venue)} <span class="district">· ${esc(event.district)}</span></span></div><div><span class="setting-badge">${event.setting==='outdoor'?'Outdoors':'Indoors'}</span></div><p class="description">${esc(event.description)}</p><div class="admission-line"><span class="free-tag ${event.priceEur>0?'paid-tag':''}">${event.priceEur>0?esc(event.priceLabel):'FREE ENTRY'}</span><span>${esc(event.admission)}</span></div>${event.availability&&event.availability!=='See original page'&&event.availability!=='See venue page'?`<p class="availability">${esc(event.availability)}</p>`:''}${event.indian?'<p class="tag">Indian event</p>':''}<details><summary class="details-toggle">Plan your visit</summary><div class="details-content">${remaining.length>1?`<p><strong>Dates:</strong> ${allDates}.</p>`:''}<p>${esc(event.details)}</p><p><strong>Where:</strong> ${esc(event.address)} · ${event.setting==='outdoor'?'Outdoors':'Indoors'}.</p>${event.languageDependent?`<p><strong>Language:</strong> ${esc(event.language)}</p>`:''}${event.priceEur>0?`<p><strong>Ticket price:</strong> ${esc(event.priceLabel)}. ${esc(event.feesNote)} <a href="${esc(event.bookingUrl)}" target="_blank" rel="noopener noreferrer">Book tickets ↗</a></p>`:''}${event.area==='nearby'?`<div class="travel"><strong>Getting there · ~${event.trainMinutes} min by train</strong><p>Destination station: ${esc(event.destinationStation)}. ${esc(event.travelNote)}</p><p>${esc(event.returnNote)} Transport costs extra.</p><a href="${esc(event.travelSource)}" target="_blank" rel="noopener noreferrer">Journey source ↗</a></div>`:''}${event.extraUrl?`<p><a href="${esc(event.extraUrl)}" target="_blank" rel="noopener noreferrer">${esc(event.extraLabel)} ↗</a></p>`:''}</div></details></div><div class="card-footer"><div class="provenance"><a href="${esc(event.url)}" target="_blank" rel="noopener noreferrer">${esc(event.source)}</a><span class="checked ${(new Date(viennaDay()+'T12:00:00Z')-new Date(event.checkedOn+'T12:00:00Z'))/86400000>7?'stale':''}">Checked <time datetime="${event.checkedOn}">${formatDay(event.checkedOn,{day:'numeric',month:'short',year:'numeric'})}</time>${(new Date(viennaDay()+'T12:00:00Z')-new Date(event.checkedOn+'T12:00:00Z'))/86400000>7?' · Recheck advised':''}</span></div><a class="original-link" href="${esc(event.url)}" target="_blank" rel="noopener noreferrer" aria-label="Open original event page for ${esc(event.title)} (opens in a new tab)">Original event ${icons.arrow}</a></div></article>`;
}
function render(){
 const today=viennaDay();const results=filterEvents(events,state,today,viennaTime());
 document.querySelectorAll('[data-period]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.period===state.period)));
 document.querySelectorAll('[data-type]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.type==='all'?!state.types.length:state.types.includes(b.dataset.type))));
 $('customDates').hidden=state.period!=='custom';$('search').value=state.query;$('outdoor').checked=state.outdoor;$('dateFrom').value=state.from;$('dateTo').value=state.to;
 $('areaFilter').value=state.area;
 $('dateFrom').min=today;$('dateTo').min=state.from&&state.from>today?state.from:today;
 $('dateError').textContent=state.period==='custom'&&state.from&&state.to&&state.from>state.to?'The end date must be on or after the start date.':'';
 $('savedCount').textContent=events.filter(e=>state.saved.includes(e.id)).length;$('exploreNav').classList.toggle('active',!state.savedOnly);$('savedNav').classList.toggle('active',state.savedOnly);
 $('finderTitle').textContent=state.savedOnly?'Your next good plans.':'What’s happening?';
 $('resultCount').innerHTML=`<strong>${results.length} ${results.length===1?'event':'events'}</strong> ${state.savedOnly?'in your shortlist':'to look forward to'} <span class="tag">· Your entertainment picks</span>`;
 const [from,to]=dateRange(state.period,today,state.from,state.to);
 $('dateCaption').textContent=state.period==='all'?'Soonest first · Vienna local time':`${formatDay(from)}${to!=='9999-12-31'&&to!==from?' – '+formatDay(to):to==='9999-12-31'?' onwards':''} · Vienna time`;
 $('eventGrid').innerHTML=results.map(eventCard).join('');$('empty').hidden=results.length>0;
 $('emptyTitle').textContent=state.savedOnly&&!state.saved.length?'Make room for a good plan.':'A quiet corner of the calendar.';
 $('emptyText').textContent=state.savedOnly&&!state.saved.length?'Tap the bookmark on any event to keep it here. Your shortlist is saved in this browser.':'Try a wider date range or another event type. This is a curated selection, so more may be happening in the city.';
 $('emptyReset').textContent=state.savedOnly?'Explore upcoming events':'Show all upcoming events';
 $('clearFilters').hidden=state.period==='all'&&!state.types.length&&!state.query&&!state.outdoor&&!state.savedOnly&&state.area==='all';
 updateFreshness();
 saveUrl();
}
function reset(){state={...state,period:'all',types:[],query:'',from:'',to:'',outdoor:false,savedOnly:false,area:'all'};render();}
document.querySelectorAll('[data-period]').forEach(button=>button.addEventListener('click',()=>{state.period=button.dataset.period;render();}));
document.querySelectorAll('[data-type]').forEach(button=>button.addEventListener('click',()=>{const type=button.dataset.type;state.types=type==='all'?[]:state.types.includes(type)?state.types.filter(value=>value!==type):[...state.types,type];render();}));
$('search').addEventListener('input',event=>{state.query=event.target.value;render();});
$('outdoor').addEventListener('change',event=>{state.outdoor=event.target.checked;render();});
for(const [id,key] of [['areaFilter','area']])$(id).addEventListener('change',event=>{state[key]=event.target.value;render();});
for(const [id,key] of [['dateFrom','from'],['dateTo','to']])$(id).addEventListener('change',event=>{state[key]=event.target.value;render();});
$('clearFilters').addEventListener('click',reset);$('emptyReset').addEventListener('click',reset);
$('exploreNav').addEventListener('click',()=>{state.savedOnly=false;render();$('events').scrollIntoView({behavior:'smooth'});});
$('savedNav').addEventListener('click',()=>{state.savedOnly=true;state.types=[];state.period='all';state.query='';state.outdoor=false;state.area='all';render();$('events').scrollIntoView({behavior:'smooth'});});
for(const id of ['sourcesNav','aboutSources'])$(id).addEventListener('click',()=>$('sources').scrollIntoView({behavior:'smooth'}));
$('eventGrid').addEventListener('click',event=>{const button=event.target.closest('[data-save]');if(!button)return;const id=button.dataset.save;const adding=!state.saved.includes(id);state.saved=adding?[...state.saved,id]:state.saved.filter(s=>s!==id);let persisted=true;try{localStorage.setItem('vienna-free-saved-v1',JSON.stringify(state.saved));}catch{persisted=false;}render();document.querySelector(`[data-save="${id}"]`)?.focus({preventScroll:true});showToast(persisted?(adding?'Saved to your shortlist · this browser':'Removed from your shortlist'):'Updated for this visit · browser storage unavailable');});
function drawSources(){$('sourceList').innerHTML=sources.map(source=>`<div class="source-row"><a href="${esc(source.url)}" target="_blank" rel="noopener noreferrer"><span>${esc(source.name)}<span class="source-label">${esc(source.label)}</span></span>${icons.arrow}</a><p>${esc(source.note)}</p></div>`).join('');}
function stamp(value){return new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/Vienna',day:'numeric',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'}).format(new Date(value));}
function updateFreshness(){
 if(!catalog)return;
 const age=(Date.now()-Date.parse(catalog.lastScanAt))/86400000;
 $('scanLabel').textContent='Last search: '+stamp(catalog.lastScanAt);
 $('refreshTitle').textContent=loadError?'Latest saved collection unavailable':age>2?'The last event search is overdue':catalog.schedule?.enabled?'Automatic daily search is enabled':'Automatic search is not enabled yet';
 $('refreshStatus').textContent=loadError||`${catalog.schedule?.enabled?catalog.schedule.label+'. ':''}Last successful search: ${stamp(catalog.lastScanAt)} (Vienna time). Each card shows when its source was checked. Reloading loads the saved collection; it does not run a new search.`;
 $('refreshStatus').classList.toggle('refresh-error',!!loadError||age>2);
 $('scanNotes').textContent=(catalog.statusNotes||[]).join(' ');
}
async function loadEvents(manual=false){
 if(loading)return;loading=true;$('reloadEvents').disabled=true;$('reloadEvents').textContent='Loading…';
 try{
  const response=await fetch(new URL('./events.json',import.meta.url),{cache:'no-store'});if(!response.ok)throw new Error('Could not load the latest saved listings. Showing the last available collection; try again.');
  const data=await response.json();if(!Array.isArray(data.events))throw new Error('The event collection is unavailable.');
  catalog=data;events=data.events;sources=data.sources;loadError='';try{sessionStorage.setItem('vienna-events-last-catalog',JSON.stringify(data));}catch{}drawSources();render();
  if(manual)showToast('Latest saved listings loaded');
 }catch(error){
  loadError=error.message;
  if(!catalog){try{const cached=JSON.parse(sessionStorage.getItem('vienna-events-last-catalog')||'null');if(cached){catalog=cached;events=cached.events;sources=cached.sources;drawSources();}}catch{}}
  render();if(!catalog){$('refreshTitle').textContent='Event listings could not be loaded';$('refreshStatus').textContent=loadError;}if(manual)showToast(loadError);
 }finally{loading=false;$('reloadEvents').disabled=false;$('reloadEvents').textContent='Reload listings ↻';}
}
$('reloadEvents').addEventListener('click',()=>loadEvents(true));
document.addEventListener('visibilitychange',()=>{if(!document.hidden)loadEvents();});
setInterval(()=>{if(!document.hidden)loadEvents();},300000);
render();loadEvents();
