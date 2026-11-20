const values=new Map<string,string>();
Object.defineProperty(globalThis,'localStorage',{configurable:true,value:{getItem:(key:string)=>values.get(key)??null,setItem:(key:string,value:string)=>{values.set(key,value)},removeItem:(key:string)=>values.delete(key),clear:()=>values.clear(),key:(i:number)=>[...values.keys()][i]??null,get length(){return values.size}}});

Object.defineProperty(globalThis,'window',{configurable:true,value:{localStorage:globalThis.localStorage}});
