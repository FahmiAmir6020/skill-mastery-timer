import { openDB } from 'idb';
import { emptyData, type AppData, type Draft, type Session, type Skill } from './domain';
const DB_NAME='skill-mastery-timer', STORE='app', SOUND_STORE='sounds';
export const MAX_CUSTOM_SOUND_BYTES=10*1024*1024;
export const dbPromise=openDB(DB_NAME,6,{upgrade(db,oldVersion){if(oldVersion<1)db.createObjectStore(STORE);if(oldVersion<5)db.createObjectStore(SOUND_STORE)}});
export async function loadData():Promise<AppData>{try{const data=await (await dbPromise).get(STORE,'state')??emptyData();return{...emptyData(),...data,deletedSkills:data.deletedSkills??[],pausedDrafts:data.pausedDrafts??[],streakRewards:data.streakRewards??[],customSound:data.customSound??null,preferences:{...emptyData().preferences,...data.preferences}}}catch(e){throw new Error(`Local data could not be read. Browser storage may be unavailable. ${String(e)}`)}}
export async function saveData(data:AppData){try{await (await dbPromise).put(STORE,data,'state')}catch(e){throw new Error(`Local data could not be saved. Check available browser storage. ${String(e)}`)}}
export async function locked<T>(fn:()=>Promise<T>):Promise<T>{const locks=navigator.locks;if(locks)return locks.request('skill-mastery-timer-state',{mode:'exclusive'},fn);return fn()}
export const channel=typeof BroadcastChannel!=='undefined'?new BroadcastChannel('skill-mastery-timer'):null;
export async function mutate(fn:(data:AppData)=>AppData|Promise<AppData>){return locked(async()=>{const data=await loadData();const next=await fn(data);await saveData(next);channel?.postMessage('updated');return next})}
export function addHistory(data:AppData,skill:Skill,duration:number,start:number,end:number,status:Session['status']):AppData{if(duration<=0)return data;const session:Session={id:crypto.randomUUID(),skillId:skill.id,skillName:skill.name,startedAt:start,endedAt:end,durationSeconds:duration,status,createdAt:end};return {...data,sessions:[session,...data.sessions]}}
export const newDraft=(skillId:string,now:number):Draft=>({id:crypto.randomUUID(),skillId,totalSeconds:0,segmentSeconds:0,segmentStartedAt:now,startedAt:now,checkpointAt:now});

export async function getCustomSound():Promise<Blob|null>{try{return(await(await dbPromise).get(SOUND_STORE,'celebration'))??null}catch(e){throw new Error(`Custom sound could not be read from local storage. ${String(e)}`)}}
export async function putCustomSound(blob:Blob):Promise<void>{if(blob.size>MAX_CUSTOM_SOUND_BYTES)throw new Error('Audio file exceeds the 10 MB limit.');try{await(await dbPromise).put(SOUND_STORE,blob,'celebration')}catch(e){throw new Error(`Custom sound could not be saved locally. ${String(e)}`)}}
export async function removeCustomSound():Promise<void>{try{await(await dbPromise).delete(SOUND_STORE,'celebration')}catch(e){throw new Error(`Custom sound could not be removed from local storage. ${String(e)}`)}}
