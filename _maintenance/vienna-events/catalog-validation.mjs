export const eventTypes=['music','festival','dance','film','comedy','theatre','fireworks'];
const dayPattern=/^\d{4}-\d{2}-\d{2}$/;
const isDay=v=>typeof v==='string'&&dayPattern.test(v)&&new Date(v+'T12:00:00Z').toISOString().slice(0,10)===v;
const https=v=>{try{const u=new URL(v);return u.protocol==='https:'&&!u.username&&!u.password;}catch{return false;}};
export function validateCatalog(data,today){
 if(!data||data.schemaVersion!==1||!Array.isArray(data.events)||data.events.length>250||!Array.isArray(data.sources)||data.sources.length>100)throw new Error('Invalid catalogue shape');
 if(!data.lastScanAt||!Number.isFinite(Date.parse(data.lastScanAt))||Date.parse(data.lastScanAt)>Date.now()+300000)throw new Error('Invalid scan timestamp');
 const ids=new Set();
 for(const s of data.sources)if(!s.name||!https(s.url)||!s.label||!s.note)throw new Error('Incomplete source');
 for(const e of data.events){
  if(!e.id||!/^[a-z0-9-]{1,100}$/.test(e.id)||ids.has(e.id))throw new Error('Invalid or duplicate event ID');ids.add(e.id);
  for(const key of ['title','subtitle','venue','address','district','description','details','admission','language','source','availability'])if(typeof e[key]!=='string'||!e[key].trim()||e[key].length>4000)throw new Error(`${e.id}: missing ${key}`);
  if(!eventTypes.includes(e.type)||!['indoor','outdoor','mixed'].includes(e.setting)||!Array.isArray(e.tags)||e.tags.some(t=>typeof t!=='string'))throw new Error(`${e.id}: invalid category`);
  if(!Array.isArray(e.dates)||!e.dates.length||e.dates.length>100||!e.dates.every(isDay))throw new Error(`${e.id}: invalid dates`);
  if(!isDay(e.checkedOn)||e.checkedOn>today)throw new Error(`${e.id}: invalid checked date`);
  if(!/^([01]\d|2[0-3]):[0-5]\d$/.test(e.time)||e.timeEnd&&!/^([01]\d|2[0-3]):[0-5]\d$/.test(e.timeEnd)||![0,1].includes(e.timeEndDayOffset))throw new Error(`${e.id}: invalid time`);
  if(e.timeEnd&&e.timeEnd<=e.time&&e.timeEndDayOffset!==1)throw new Error(`${e.id}: end before start`);
  if(typeof e.indian!=='boolean'||typeof e.languageDependent!=='boolean'||!Number.isFinite(e.priceEur)||e.priceEur<0)throw new Error(`${e.id}: incomplete eligibility`);
  if(e.priceEur>0&&(!e.indian||!e.priceLabel||!e.feesNote||!https(e.bookingUrl)))throw new Error(`${e.id}: paid events must be verified Indian exceptions with price, fees and booking URL`);
  if(['film','comedy','theatre'].includes(e.type)&&!e.languageDependent)throw new Error(`${e.id}: dialogue events need confirmed language`);
  if(e.languageDependent&&!(['en','en-subtitles'].includes(e.languageCode)||e.indian&&['hi','hi-en'].includes(e.languageCode)))throw new Error(`${e.id}: language not eligible`);
  if(!['vienna','nearby'].includes(e.area))throw new Error(`${e.id}: invalid location`);
  if(e.area==='nearby'&&(!e.exceptional||!Number.isFinite(e.trainMinutes)||e.trainMinutes>130||e.trainMinutes<=0||!e.destinationStation||!e.travelNote||!e.returnNote||!https(e.travelSource)))throw new Error(`${e.id}: unverified nearby trip`);
  if(!https(e.url)||e.extraUrl&&!https(e.extraUrl)||!data.sources.some(s=>s.name===e.source))throw new Error(`${e.id}: invalid source`);
 }
 return data;
}
