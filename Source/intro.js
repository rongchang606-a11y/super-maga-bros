/* Skippable, silent four-beat opening; the game clock is paused throughout. */
window.startMagaIntro = function (game) {
    "use strict";
    var overlay=document.createElement("div"), canvas=document.createElement("canvas"), caption=document.createElement("div"), skip=document.createElement("button");
    overlay.className="intro-overlay"; overlay.setAttribute("aria-label","游戏开场动画");
    canvas.width=256; canvas.height=232; canvas.setAttribute("aria-hidden","true");
    caption.className="intro-caption"; caption.setAttribute("aria-live","polite");
    skip.className="intro-skip"; skip.textContent="跳过开场 / Skip";
    overlay.appendChild(canvas); overlay.appendChild(caption); overlay.appendChild(skip);
    document.getElementById("game").appendChild(overlay);
    game.GamesRunner.pause();
    var ctx=canvas.getContext("2d"), started=Date.now(), index=-1, timer;
    var lines=["选举之夜：老特落选了！","女性政治家指着他，大声质问。","老特慌忙逃跑……","他从天而降，进入了游戏！"];
    function rect(x,y,w,h,c){ctx.fillStyle=c;ctx.fillRect(x,y,w,h);}
    function person(x,y,hat,woman){
        rect(x+9,y,30,8,woman?"#392a2a":"#e33432");rect(x+5,y+8,38,8,woman?"#392a2a":"#e33432");
        if(hat) { rect(x+20,y+2,10,3,"#fff"); }
        rect(x+6,y+16,36,31,woman?"#82503d":"#f2ba72");rect(x+11,y+20,5,4,"#252239");rect(x+28,y+20,5,4,"#252239");
        rect(x+20,y+27,5,4,"#bd764f");rect(x+14,y+37,19,3,"#9a4d3a");
        rect(x+2,y+47,44,39,woman?"#713d84":"#233d72");rect(x+20,y+49,8,22,"#fff");rect(x+23,y+51,3,18,woman?"#713d84":"#ec648c");
        rect(x+4,y+86,16,14,"#171a29");rect(x+28,y+86,16,14,"#171a29");
    }
    function draw(n){
        rect(0,0,256,232,"#5e99ec");rect(0,171,256,61,"#b87b44");rect(0,168,256,4,"#fff2d2");
        if(n===0){rect(15,28,226,66,"#273f70");ctx.fillStyle="white";ctx.font="bold 15px monospace";ctx.fillText("ELECTION NIGHT",34,51);ctx.fillStyle="#ff4a4a";ctx.fillText("RESULT: LOST",49,78);person(103,72,true,false);}
        if(n===1){rect(16,50,224,109,"#d7e0ee");person(35,73,true,false);person(160,73,false,true);rect(132,99,26,5,"#82503d");}
        if(n===2){rect(20,48,215,4,"#fff");rect(12,62,170,4,"#fff");rect(70,79,170,4,"#fff");person(105,74,true,false);rect(142,146,22,7,"#171a29");}
        if(n===3){rect(0,159,256,9,"#bc7340");for(var x=0;x<256;x+=16){rect(x,160,14,7,"#d99c62");} person(103,32,true,false);rect(46,66,22,3,"#fff");rect(190,84,25,3,"#fff");}
        caption.textContent=lines[n];
    }
    function finish(){if(!overlay.isConnected)return;clearInterval(timer);overlay.remove();document.removeEventListener("keydown",key);game.GamesRunner.play();}
    function key(event){if(event.key==="Escape" || event.key==="Enter") {event.preventDefault();finish();}}
    skip.addEventListener("click",finish);document.addEventListener("keydown",key);
    draw(0);timer=setInterval(function(){var next=Math.floor((Date.now()-started)/2300);if(next>=lines.length){finish();return;}if(next!==index){index=next;draw(index);}},100);
};
