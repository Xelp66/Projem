const fs=require('node:fs');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const html=fs.readFileSync('index.html','utf8');
const source=html.match(/<script>([\s\S]*?)<\/script>/);
assert(source,'Core application script must exist');
assert(html.includes('journey.js'),'Workflow must be loaded on landing page');
assert(html.includes('journey.css'),'Styles must be linked');
new vm.Script(source[1],{filename:'index-core.js'});
const journey=fs.readFileSync('journey.js','utf8');
new vm.Script(journey,{filename:'journey.js'});
const app={innerHTML:''},callbacks={};
const context=vm.createContext({
 console,Date,Intl,JSON,Number,String,Boolean,Math,Array,Object,Set,Map,
 structuredClone,alert:()=>{},confirm:()=>true,
 localStorage:{getItem:()=>null,setItem:()=>{}},
 document:{getElementById:(id)=>id==='app'?app:null,addEventListener:(name,fn,cap)=>{(callbacks[name]??=[]).push({fn,cap});}},
 window:{print:()=>{}},
 setTimeout:()=>{},
});
vm.runInContext(source[1],context);
vm.runInContext(journey,context);
assert(app.innerHTML.includes('Başvuru için tesisleri seç'),'Landing screen must ask facility selection');
assert(app.innerHTML.includes('00UTH'),'Boiler facility must be listed');
assert(app.innerHTML.includes('00UGD'),'Water treatment facility must be listed');
const r=vm.runInContext('calculate(db,db.scenarios[0])',context);
assert.equal(r.lab,1413432.25,'Full demonstration scenario reference laboratory budget');
assert.equal(r.gross,2056118.7,'Full demonstration scenario gross stress budget');
const status=vm.runInContext('({first:db.scenarios[1].selected.length,active:page,scenarioCount:db.scenarios.length})',context);
assert.equal(status.first,0,'Unknown GFB scope must start empty');
assert.equal(status.active,'journey');
assert.equal(status.scenarioCount,2);
console.log('PASS: wizard landing, reference cost, empty GFB scope, JS syntax');
