/* Reviewed artwork and narrowly scoped WORLD 1-1 gameplay additions. */
(function () {
    'use strict';
    var S=FullScreenMario.FullScreenMario.settings, lib=S.sprites.library;
    var artRoot='assets/sprites/';
    var assets={};
    ['police-shield-left','cola','crowd','musk-cash','reporter','dollar','presidential-car','white-house-refined','gold-microphone'].forEach(function (name) {
        var img=new Image(); img.src=artRoot+name+'.png'; assets[name]={image:img,frames:null};
    });
    function city(game) {
        var h=game.MapsHandler, map=h.getMap();
        return h.getMapName()==='1-1' && map && h.getArea()===map.areas[0];
    }
    function carScene(game) {
        var h=game.MapsHandler,map=h.getMap();
        return h.getMapName()==='1-2' && map && h.getArea()===map.areas[0];
    }
    // Convert each approved sheet into equally anchored small pixel-art frames.
    function frames(name,count,logicalW,logicalH,bodyTopFromFirst) {
        var asset=assets[name], img=asset.image;
        if(asset.frames) return asset.frames;
        if(!img.complete || !img.naturalWidth) return null;
        var raw=document.createElement('canvas'); raw.width=img.naturalWidth; raw.height=img.naturalHeight;
        var rc=raw.getContext('2d',{willReadFrequently:true}); rc.drawImage(img,0,0);
        var data=rc.getImageData(0,0,raw.width,raw.height).data, boxes=[], slot=raw.width/count;
        for(var n=0;n<count;n++) {
            var start=Math.floor(n*slot), end=Math.floor((n+1)*slot), minX=end,maxX=start,minY=raw.height,maxY=0;
            for(var y=0;y<raw.height;y+=2) for(var x=start;x<end;x+=2) {
                if(data[(y*raw.width+x)*4+3]>110) {minX=Math.min(minX,x);maxX=Math.max(maxX,x);minY=Math.min(minY,y);maxY=Math.max(maxY,y);}
            }
            boxes.push({x:minX,y:minY,w:Math.max(1,maxX-minX+2),h:Math.max(1,maxY-minY+2),bottom:maxY+2});
        }
        if(bodyTopFromFirst) boxes.forEach(function (b) { b.y=boxes[0].y; b.h=b.bottom-b.y; });
        var maxH=Math.max.apply(null,boxes.map(function(b){return b.h;}));
        var maxW=Math.max.apply(null,boxes.map(function(b){return b.w;}));
        var scale=Math.min((logicalH-1)/maxH,(logicalW-1)/maxW);
        asset.frames=boxes.map(function (b) {
            var c=document.createElement('canvas'); c.width=logicalW;c.height=logicalH;
            var t=c.getContext('2d');t.imageSmoothingEnabled=false;
            var frameScale=name==='crowd' ? Math.min((logicalH-1)/b.h,(logicalW-1)/b.w) : scale;
            var dw=Math.max(1,Math.round(b.w*frameScale)), dh=Math.max(1,Math.round(b.h*frameScale));
            t.drawImage(raw,b.x,b.y,b.w,b.h,Math.floor((logicalW-dw)/2),logicalH-dh,dw,dh);
            return c;
        });
        return asset.frames;
    }
    function sprite(ctx,frame,x,y,w,h,flipped) {
        ctx.save();ctx.imageSmoothingEnabled=false;
        if(flipped) {ctx.translate(x+w,y);ctx.scale(-1,1);ctx.drawImage(frame,0,0,w,h);}
        else ctx.drawImage(frame,x,y,w,h);
        ctx.restore();
    }
    // A legible hand-drawn CRT design, at the actual game sprite size.
    var tv=document.createElement('canvas');tv.width=32;tv.height=32;
    var tc=tv.getContext('2d');tc.imageSmoothingEnabled=false;
    tc.fillStyle='#0c1833';tc.fillRect(2,5,28,19);tc.fillRect(9,2,2,5);tc.fillRect(21,2,2,5);
    tc.fillStyle='#8596b3';tc.fillRect(3,6,26,17);tc.fillStyle='#c42222';tc.fillRect(4,7,24,14);
    tc.fillStyle='white';
    [['111','100','100','100','111'],['101','111','111','111','101'],['101','111','111','111','101']].forEach(function(glyph,i){
        glyph.forEach(function(row,y){row.split('').forEach(function(pixel,x){if(pixel==='1')tc.fillRect(5+i*8+x*2,9+y*2,2,2);});});
    });
    tc.fillStyle='#0c1833';tc.fillRect(8,24,5,5);tc.fillRect(19,24,5,5);tc.fillRect(5,28,9,3);tc.fillRect(18,28,9,3);

    var inheritance=S.objects.inheritance.Thing.character;
    inheritance.enemy.ReviewCrowd={};
    inheritance.enemy.ChasingReporter={};
    inheritance.MuskReward={};
    var properties=S.objects.properties;
    properties.ReviewCrowd={width:10,height:16,death:FullScreenMario.FullScreenMario.prototype.killFlip,toly:FullScreenMario.FullScreenMario.unitsize};
    properties.ChasingReporter={width:8,height:16,outerok:true,nocollideplayer:true,toly:FullScreenMario.FullScreenMario.unitsize,
        movement:function(t) {
            var game=t.FSM,p=game.player;if(!p || !p.alive || !city(game)) {t.xvel=0;return;}
            if(game.magaWaiting || game.magaGrace>0) {t.xvel=0;t.nocollideplayer=true;return;}
            t.nocollideplayer=false;
            var speed=p.walkspeed*2/3,delta=p.left-t.left;
            t.xvel=delta===0 ? 0 : (delta>0?speed:-speed);
            t.moveleft=t.xvel<0;
            if(t.resting && t.xvel && !t.jumpCooldown) {
                var ahead=t.xvel>0?t.right+6:t.left-6;
                var solids=game.GroupHolder.getSolidGroup();
                var wall=solids.some(function(s){return s!==t.resting && !s.hidden && s.solid && s.left<ahead+2 && s.right>ahead-2 && s.top<t.bottom-3 && s.bottom>t.top+3;});
                var nextFloor=solids.some(function(s){return !s.hidden && s.solid && s.left<ahead && s.right>ahead && s.top>=t.bottom-3 && s.top<=t.bottom+8;});
                if(wall || !nextFloor) {t.yvel=-game.unitsize*1.9;t.resting=undefined;t.jumpCooldown=75;}
            }
            if(t.jumpCooldown) t.jumpCooldown--;
        }};
    properties.MuskReward={width:8,height:12,nocollidechar:true,movement:undefined,
        emergeOut:function(t,block) {
            var game=t.FSM;t.nofall=true;t.nocollide=true;t.movement=undefined;t.rewardAge=0;
            game.setBottom(t,block.top);game.gainLife(1);
            game.TimeHandler.addEventInterval(function(){
                if(!t.alive || !city(game)) return true;
                t.rewardAge++;
                if(t.rewardAge>=300){game.killNormal(t);return true;}
                return false;
            },1,Infinity);
        }};
    lib.Character.ReviewCrowd='p[0]x0256,';
    lib.Character.ChasingReporter='p[0]x0384,';
    lib.Character.MuskReward='p[0]x0384,';
    var level=S.maps.library['1-1'].areas[0].creation, crowdX=[340,412,422,776,788,912];
    level.forEach(function(entry){
        if(entry.thing==='Goomba' && crowdX.indexOf(entry.x)!==-1) {entry.thing='ReviewCrowd';entry.variant=crowdX.indexOf(entry.x);entry.y=16;}
        if(entry.thing==='Block' && entry.x===512 && entry.contents==='Mushroom1Up') entry.contents='MuskReward';
    });
    // The pursuer begins behind the player and uses the native collision system.
    level.push({thing:'ChasingReporter',x:0,y:16});

    var games=S.runner.games,last=games.length-1,oldRunner=games[last];
    // Keep enemies and moving solids still until the player chooses to move.
    [2,3].forEach(function(index){var original=games[index];games[index]=function(){
        if(city(this) && this.magaWaiting) return;
        return original.apply(this,arguments);
    };});
    games[last]=function () {
        var game=this,renderer=game.PixelDrawer;
        var p=game.player;
        if(p && city(game) && !p.magaStartSeen && game.MapScreener.left===0 && p.left<game.unitsize*40) {
            p.magaStartSeen=true;p.magaRise=0;game.magaWaiting=true;game.magaGrace=0;game.MapScreener.notime=true;
        }
        if(p && city(game) && p.magaStartSeen) {
            p.magaRise=Math.min(42,(p.magaRise||0)+1);
            if(game.magaWaiting && p.keys && p.keys.run) {game.magaWaiting=false;game.magaGrace=90;game.MapScreener.notime=false;p.magaRise=42;}
            else if(!game.magaWaiting && game.magaGrace>0) game.magaGrace--;
        }
        if(carScene(game)) game.GroupHolder.getSolidGroup().forEach(function(s){
            if(s.title==='PipeHorizontal' && !s.magaCarAction) {
                s.magaCarAction=true;s.actionLeft=function(player,car){
                    if(!player.player || player.magaBoarding || !player.keys.run) return;
                    player.magaBoarding=1;player.hidden=true;player.xvel=player.yvel=0;player.movement=undefined;player.nocollide=true;player.nofall=true;
                    game.TimeHandler.addEvent(function(){if(player.alive) game.setLocation(car.transport);},18);
                };
            }
        });
        if(!renderer.reviewedSpriteHooked) {
            var oldDraw=renderer.drawThingOnContext;
            renderer.drawThingOnContext=function(ctx,thing) {
                var globalArt=['Pipe','PipeVertical','PipeHorizontal','Mushroom','FireFlower','Fireball','Coin','Goomba','Peach','WhiteHouse','WhiteHouseLarge','Player'];
                if(thing.hidden || (!city(game) && globalArt.indexOf(thing.title)===-1)) return oldDraw.call(this,ctx,thing);
                var l=this.getLeft(thing), r=this.getRight(thing), top=this.getTop(thing), bottom=this.getBottom(thing);
                if(r<0 || l>game.MapScreener.width || bottom<0 || top>game.MapScreener.height) return oldDraw.call(this,ctx,thing);
                var f, w, h;
                if(thing.title==='Player' && (thing.magaBoarding || (city(game) && thing.magaRise<42))) {
                    var phase=thing.magaBoarding ? Math.max(.12,1-thing.magaBoarding/45) : Math.min(1,(thing.magaRise||0)/42);
                    ctx.save();ctx.translate((l+r)/2,bottom);
                    if(thing.magaBoarding) ctx.scale(1,phase);
                    else {ctx.rotate(-1.05*(1-phase));ctx.scale(1,.7+.3*phase);}
                    ctx.translate(-(l+r)/2,-bottom);oldDraw.call(this,ctx,thing);ctx.restore();
                    if(!thing.magaBoarding && phase<.8) {
                        var reach=(1-phase),cx=(l+r)/2,sy=bottom-(bottom-top)*.22;
                        ctx.save();ctx.lineCap='square';ctx.strokeStyle='#1b2440';ctx.lineWidth=game.unitsize*1.5;
                        ctx.beginPath();ctx.moveTo(cx-(bottom-top)*.36*reach,sy);ctx.lineTo(cx-(bottom-top)*.57*reach,bottom-game.unitsize*.5);ctx.stroke();
                        ctx.fillStyle='#f2a779';ctx.fillRect(cx-(bottom-top)*.57*reach-game.unitsize*.5,bottom-game.unitsize,game.unitsize*1.5,game.unitsize);ctx.restore();
                    }
                    return;
                }
                if((thing.title==='WhiteHouse'||thing.title==='WhiteHouseLarge')) {
                    f=frames('white-house-refined',1,96,64,false);if(f){sprite(ctx,f[0],l,top,r-l,bottom-top,false);return;}
                }
                if(carScene(game) && thing.title==='Pipe') return;
                if(carScene(game) && thing.title==='PipeHorizontal') {
                    f=frames('presidential-car',1,128,64,false);
                    if(f){sprite(ctx,f[0],l,bottom-game.unitsize*20,game.unitsize*36,game.unitsize*20,false);return;}
                }
                if(thing.title==='Pipe' || thing.title==='PipeVertical' || thing.title==='PipeHorizontal') {
                    f=frames('police-shield-left',1,64,64,false);
                    if(f) {
                        sprite(ctx,f[0],l,top,r-l,bottom-top,false);return;
                    }
                }
                if(thing.title==='Mushroom') {
                    f=frames('cola',1,16,16,false);if(f){sprite(ctx,f[0],l,top,r-l,bottom-top,false);return;}
                }
                if(thing.title==='FireFlower') {
                    f=frames('gold-microphone',1,16,16,false);if(f){sprite(ctx,f[0],l,top,r-l,bottom-top,false);return;}
                }
                if(thing.title==='Fireball' && !thing.dead) {
                    f=frames('gold-microphone',1,16,16,false);
                    if(f){w=game.unitsize*6;h=game.unitsize*6;ctx.save();ctx.translate((l+r)/2,(top+bottom)/2);ctx.rotate(thing.moveleft?-Math.PI/2:Math.PI/2);sprite(ctx,f[0],-w/2,-h/2,w,h,false);ctx.restore();return;}
                }
                if(thing.title==='Coin') {
                    f=frames('dollar',1,16,10,false);
                    if(f){w=game.unitsize*6;h=game.unitsize*3.5;sprite(ctx,f[0],(l+r-w)/2,(top+bottom-h)/2,w,h,false);return;}
                }
                if(thing.title==='Goomba') {sprite(ctx,tv,l,top,r-l,bottom-top,false);return;}
                if(thing.title==='Peach') {
                    f=frames('musk-cash',4,24,28,true);if(f){sprite(ctx,f[0],l,top,r-l,bottom-top,false);return;}
                }
                if(thing.title==='ReviewCrowd') {
                    f=frames('crowd',6,20,24,false);
                    if(f){w=game.unitsize*12;h=game.unitsize*16;sprite(ctx,f[thing.variant||0],(l+r-w)/2,bottom-h,w,h,!!thing.moveleft);return;}
                }
                if(thing.title==='ChasingReporter') {
                    f=frames('reporter',4,24,24,false);
                    if(f){w=game.unitsize*12;h=game.unitsize*16;sprite(ctx,f[thing.xvel?Math.floor(game.TimeHandler.getTime()/7)%4:1],(l+r-w)/2,bottom-h,w,h,!!thing.moveleft);return;}
                }
                if(thing.title==='MuskReward') {
                    f=frames('musk-cash',4,24,28,true);
                    if(f){w=game.unitsize*10;h=game.unitsize*12;sprite(ctx,f[Math.floor((thing.rewardAge||0)/18)%4],(l+r-w)/2,bottom-h,w,h,false);}
                    var bill=frames('dollar',1,16,10,false), age=thing.rewardAge||0;
                    if(bill && age>0){for(var i=0;i<6;i++){var phase=(age+i*17)%88;var bx=(l+r)/2+(i-2.5)*11+Math.sin((age+i*9)/12)*5;var by=top-20+phase*0.75;sprite(ctx,bill[0],bx,by,15,9,i%2===1);}}
                    return;
                }
                oldDraw.call(this,ctx,thing);
            };
            renderer.reviewedSpriteHooked=true;
        }
        oldRunner.call(game);
    };
}());
