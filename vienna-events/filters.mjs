export function viennaDay(now=new Date()) {
  const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Vienna',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(now);
  return ['year','month','day'].map(k=>parts.find(p=>p.type===k).value).join('-');
}
export function shiftDay(day,n){const d=new Date(day+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+n);return d.toISOString().slice(0,10);}
export function viennaTime(now=new Date()){return new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/Vienna',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).format(now);}
export function dateRange(period,today,from='',to=''){
  if(period==='today') return [today,today];
  if(period==='week') return [today,shiftDay(today,6)];
  if(period==='weekend'){
    const weekday=new Date(today+'T12:00:00Z').getUTCDay();
    const saturday=weekday===0?shiftDay(today,-1):shiftDay(today,(6-weekday+7)%7);
    return [saturday<today?today:saturday,shiftDay(saturday,1)];
  }
  if(period==='custom')return [from||today,to||'9999-12-31'];
  return [today,'9999-12-31'];
}
export function filterEvents(events,state,today,localTime='00:00'){
  const [from,to]=dateRange(state.period,today,state.from,state.to);
  const query=(state.query||'').trim().toLocaleLowerCase();
  return events.map(event=>({...event,matchingDates:event.dates.filter(day=>{
    const overnight=event.timeEndDayOffset===1;
    const ongoing=overnight&&shiftDay(day,1)===today&&localTime<(event.timeEnd||'00:00');
    const within=day>=today&&day>=from&&day<=to&&(day!==today||overnight||!event.timeEnd||event.timeEnd>localTime);
    return within||(ongoing&&today>=from&&today<=to);
  })}))
    .filter(event=>event.matchingDates.length&&(!state.type||state.type==='all'||(state.type==='indian'?event.indian:event.type===state.type))&&(!state.outdoor||event.setting==='outdoor')&&(!state.area||state.area==='all'||event.area===state.area)&&(!state.savedOnly||state.saved.includes(event.id))&&(!query||[event.title,event.subtitle,event.venue,event.address,event.description,event.type,...event.tags].join(' ').toLocaleLowerCase().includes(query)))
    .sort((a,b)=>(a.matchingDates[0]+a.time).localeCompare(b.matchingDates[0]+b.time)||a.title.localeCompare(b.title));
}
