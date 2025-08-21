
import dayjs from 'dayjs'; import duration from 'dayjs/plugin/duration'; dayjs.extend(duration);
export const PHASES=[
 {label:'Blood Sugar Drop',hours:3,icon:'💧',desc:'Insulin begins to fall; body switches to stored energy.'},
 {label:'Gluconeogenesis',hours:5,icon:'🧬',desc:'Liver makes glucose to keep levels steady.'},
 {label:'Ketosis',hours:8,icon:'🔥',desc:'Fat becomes ketones to fuel brain and muscles.'},
 {label:'Fat Burning',hours:12,icon:'⚡',desc:'Lipolysis ramps up; body preferentially burns fat.'},
 {label:'Autophagy',hours:18,icon:'🧹',desc:'Cells recycle worn components (cleanup mode).'}
];
export function msToH(ms:number){return Math.max(0,ms)/3600000}
export function prettyHms(ms:number){const d=dayjs.duration(ms);const h=Math.floor(d.asHours());const m=d.minutes().toString().padStart(2,'0');const s=d.seconds().toString().padStart(2,'0');return `${h}:${m}:${s}`}
export function last7DaysBuckets(fasts:{startAt:number;endAt?:number}[]){
 const start=dayjs().startOf('day').subtract(6,'day'); const buckets=Array.from({length:7}).map((_,i)=>({date:start.add(i,'day'),totalMs:0}));
 for(const f of fasts){ if(!f.endAt) continue; const end=dayjs(f.endAt); const dayIndex=end.startOf('day').diff(start,'day'); if(dayIndex>=0 && dayIndex<7){ buckets[dayIndex].totalMs+=Math.max(0,f.endAt-f.startAt);} }
 return buckets.map(b=>({name:b.date.format('ddd'),hours:+(b.totalMs/3600000).toFixed(1)}));
}
export function computeStreak(fasts:{endAt?:number;startAt:number}[],minHours=12){
 const done=fasts.filter(f=>f.endAt).map(f=>({end:dayjs(f.endAt!),hours:(f.endAt!-f.startAt)/3600000}));
 const byDay=new Map<string,boolean>(); for(const f of done){const key=f.end.startOf('day').format('YYYY-MM-DD'); const ok=(byDay.get(key)??false)|| f.hours>=minHours; byDay.set(key,ok);} let streak=0; let day=dayjs().startOf('day'); while(byDay.get(day.format('YYYY-MM-DD'))){streak++; day=day.subtract(1,'day');} return streak;
}
