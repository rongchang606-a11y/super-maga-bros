// Portable static package: preserve the script order from the working page.
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const source=path.join(__dirname,'Source');
const output=path.join(__dirname,'Distribution','Super-MAGA-Bros');
const html=fs.readFileSync(path.join(source,'index.html'),'utf8');
const scripts=Array.from(html.matchAll(/<script\s+src="([^"]+)"/g),m=>m[1]).filter(s=>!s.includes('<%='));
for(const name of scripts) {
  const file=path.join(source,name);
  if(!fs.existsSync(file)) throw new Error('Missing script: '+name);
  new vm.Script(fs.readFileSync(file,'utf8'),{filename:name});
}
const required=['settings/sprites.js','settings/custom-hero.js','settings/custom-world-art.js','settings/custom-v1-art.js','settings/city-background.js','settings/reviewed-sprites.js','settings/batch-art.js','settings/hero-comparison.js','intro.js','index.js'];
for(const name of required) if(!scripts.includes(name)) throw new Error('Missing page script: '+name);
const indexes=required.map(s=>scripts.indexOf(s));
if(indexes.some((n,i)=>i && n<=indexes[i-1])) throw new Error('Invalid game script order');
const cityNames=['01-liberty','02-diner','03-market','04-drugstore','05-bank','06-police','07-fire-station','08-hospital','09-city-hall','10-white-house'];
for(const name of cityNames) if(!fs.existsSync(path.join(source,'assets','city',name+'.png'))) throw new Error('Missing city panel: '+name);
if(!fs.existsSync(path.join(source,'assets','city','road-reference.png'))) throw new Error('Missing city road texture');
for(const name of ['police-shield-left','cola','crowd','musk-cash','reporter','dollar','presidential-car','white-house-refined','gold-microphone','hero-detail-sample','hero-jump-skid','batch-donkey','batch-reporter','batch-crowd','batch-monsters','batch-boss','batch-world-items','batch-musk','batch-powerups','batch-extra-enemies','batch-extra-items','batch-tv','batch-tv-states','batch-shell']) if(!fs.existsSync(path.join(source,'assets','sprites',name+'.png'))) throw new Error('Missing sprite asset: '+name);
fs.mkdirSync(output,{recursive:true});
function copyTree(from,to) {
  fs.mkdirSync(to,{recursive:true});
  for(const entry of fs.readdirSync(from,{withFileTypes:true})) {
    const input=path.join(from,entry.name), dest=path.join(to,entry.name);
    if(entry.isDirectory()) copyTree(input,dest);
    else if(entry.isFile() && !entry.name.toLowerCase().endsWith('.ts')) {
      const data=fs.readFileSync(input);
      if(!fs.existsSync(dest) || !data.equals(fs.readFileSync(dest))) fs.writeFileSync(dest,data);
    }
  }
}
copyTree(source,output);
fs.copyFileSync(path.join(__dirname,'LICENSE.txt'),path.join(output,'LICENSE.txt'));
fs.copyFileSync(path.join(__dirname,'serve.js'),path.join(output,'serve.js'));
fs.writeFileSync(path.join(output,'Start Game.bat'),'@echo off\r\ncd /d "%~dp0"\r\nnode serve.js --root . --open\r\nif errorlevel 1 pause\r\n');
console.log('Static package ready:',output);
