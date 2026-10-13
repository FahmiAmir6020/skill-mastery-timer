import type {Theme} from './domain';

export const THEMES: {id:Theme;name:string;summary:string;red:string;blue:string;dark:string}[] = [
  {id:'inferno',name:'Inferno',summary:'Red & black',red:'#ed3438',blue:'#22252a',dark:'#0b0b0c'},
  {id:'abyss',name:'Abyss',summary:'Blue & black',red:'#318cff',blue:'#182940',dark:'#080b10'},
  {id:'fusion',name:'Fusion',summary:'Red & blue',red:'#ed3438',blue:'#318cff',dark:'#0b0b0c'}
];
