const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const rootIndex = process.argv.indexOf('--root');
const root = path.resolve(__dirname, rootIndex === -1 ? 'Source' : process.argv[rootIndex + 1]);
const types = {'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css','.mp3':'audio/mpeg','.ogg':'audio/ogg','.woff':'font/woff','.ttf':'font/ttf','.png':'image/png','.gif':'image/gif'};
const openBrowser = process.argv.includes('--open');
function open(url) {
  if (!openBrowser) return;
  const command = process.platform === 'win32' ? 'rundll32.exe' : process.platform === 'darwin' ? 'open' : 'xdg-open';
  const args = process.platform === 'win32' ? ['url.dll,FileProtocolHandler', url] : [url];
  const child = spawn(command, args, { detached: true, stdio: 'ignore', windowsHide: true });
  child.on('error', err => console.error('Could not open browser:', err.message));
  child.unref();
}
function sameProject(port) {
  const names = ['index.html', 'settings/custom-v1-art.js', 'FullScreenMario.js'];
  return Promise.all(names.map(name => new Promise(resolve => {
    const req = http.get({host:'127.0.0.1',port,path:'/' + name,timeout:1200}, res => {
      if (res.statusCode !== 200) { res.resume(); resolve(false); return; }
      const parts=[]; let length=0;
      res.on('data', chunk => { length+=chunk.length; if(length>2*1024*1024) { req.destroy(); resolve(false); } else parts.push(chunk); });
      res.on('end', () => { try { resolve(Buffer.concat(parts).equals(fs.readFileSync(path.join(root,name)))); } catch { resolve(false); } });
      res.on('error', () => resolve(false));
    });
    req.on('timeout', () => req.destroy()); req.on('error', () => resolve(false));
  }))).then(results => results.every(Boolean));
}
function serve(port) {
const server=http.createServer((req, res) => {
  let pathname;
  try { pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); } catch { res.writeHead(400).end(); return; }
  const file = path.resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
  if (file !== root && !file.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
  fs.readFile(file, (err, data) => { if (err) { res.writeHead(404).end('Not found'); return; } res.writeHead(200, {'Content-Type':types[path.extname(file).toLowerCase()] || 'application/octet-stream','Cache-Control':'no-cache'}); res.end(data); });
});
server.on('error', async err => {
  if(err.code!=='EADDRINUSE') { console.error(err.message); process.exitCode=1; return; }
  if(await sameProject(port)) { const url=`http://127.0.0.1:${port}/`; console.log('Using the existing game server:',url); open(url); return; }
  if(port>=initialPort+20) { console.error(`No available local port in ${initialPort}–${initialPort+20}.`); process.exitCode=1; return; }
  serve(port+1);
});
server.listen(port,'127.0.0.1',()=>{ const url=`http://127.0.0.1:${port}/`; console.log('Game is ready:',url); open(url); });
}
const portIndex=process.argv.indexOf('--port');
const initialPort=portIndex===-1?8765:Number(process.argv[portIndex+1]);
if(!Number.isInteger(initialPort)||initialPort<1||initialPort>65515) { console.error('Invalid port.'); process.exitCode=1; }
else if(!fs.existsSync(path.join(root,'FullScreenMario.js'))) { console.error('Missing FullScreenMario.js in the game directory.'); process.exitCode=1; } else serve(initialPort);
