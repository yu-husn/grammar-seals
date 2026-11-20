import {characterProfiles} from './Characters';

const sections=[
 {id:'heroes',title:'主角',profiles:[0,6]},
 {id:'guardians',title:'關主',profiles:[1,2,3,4]},
 {id:'boss',title:'魔王',profiles:[5]},
] as const;

export default function CharacterRoster({selected,onSelect}:{selected:number;onSelect:(index:number)=>void}){
 return <div className="character-roster">{sections.map(section=><section className="character-group" key={section.id} data-character-group={section.id} aria-labelledby={`character-group-${section.id}`}><h3 id={`character-group-${section.id}`}>{section.title}</h3><div className="character-picks">{section.profiles.map(index=><button key={characterProfiles[index].name} aria-pressed={selected===index} onClick={()=>onSelect(index)}>{characterProfiles[index].name}</button>)}</div></section>)}</div>;
}
