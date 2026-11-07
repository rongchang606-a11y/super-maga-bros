/* Reversible in-game comparison for standing, running, jumping and skidding. */
(function () {
    'use strict';
    var settings=FullScreenMario.FullScreenMario.settings;
    var enabled=true, button=document.getElementById('hero-compare-toggle');
    var sheet=new Image(), extraSheet=new Image(), ready=null, extraReady=null, failed=false, extraFailed=false;
    sheet.src='assets/sprites/hero-detail-sample.png';
    extraSheet.src='assets/sprites/hero-jump-skid.png';
    sheet.onerror=function(){failed=true;};
    extraSheet.onerror=function(){extraFailed=true;};
    button.addEventListener('click',function(){
        enabled=!enabled;
        button.setAttribute('aria-pressed',String(enabled));
        button.textContent=enabled?'人物：高细节样例（点击切换原版）':'人物：原版（点击切换高细节样例）';
        button.blur();
    });
    function makeFrames(image,slots) {
        var raw=document.createElement('canvas');raw.width=image.naturalWidth;raw.height=image.naturalHeight;
        var c=raw.getContext('2d',{willReadFrequently:true});c.drawImage(image,0,0);
        var pixels=c.getImageData(0,0,raw.width,raw.height).data, boxes=[], slot=raw.width/slots;
        for(var n=0;n<slots;n++) {
            var x0=Math.floor(slot*n),x1=Math.floor(slot*(n+1)),minX=x1,maxX=x0,minY=raw.height,maxY=0;
            for(var y=0;y<raw.height;y+=2)for(var x=x0;x<x1;x+=2)if(pixels[(y*raw.width+x)*4+3]>128){
                minX=Math.min(minX,x);maxX=Math.max(maxX,x);minY=Math.min(minY,y);maxY=Math.max(maxY,y);
            }
            if(minX>=maxX || minY>=maxY) return null;
            boxes.push({x:minX,y:minY,w:maxX-minX+2,h:maxY-minY+2});
        }
        var maxW=Math.max.apply(null,boxes.map(function(b){return b.w;}));
        var maxH=Math.max.apply(null,boxes.map(function(b){return b.h;}));
        // Match the existing character box and keep each pose on the same baseline.
        var scaleX=30/maxW, scaleY=62/maxH;
        return boxes.map(function(b){
            var out=document.createElement('canvas');out.width=32;out.height=64;
            var ctx=out.getContext('2d');ctx.imageSmoothingEnabled=false;
            var w=Math.max(1,Math.round(b.w*scaleX)),h=Math.max(1,Math.round(b.h*scaleY));
            ctx.drawImage(raw,b.x,b.y,b.w,b.h,Math.floor((32-w)/2),64-h,w,h);return out;
        });
    }
    function prepare() {
        if(!ready && !failed && sheet.complete && sheet.naturalWidth) {ready=makeFrames(sheet,4);if(!ready)failed=true;}
        return ready;
    }
    function prepareExtra() {
        if(!extraReady && !extraFailed && extraSheet.complete && extraSheet.naturalWidth) {extraReady=makeFrames(extraSheet,2);if(!extraReady)extraFailed=true;}
        return extraReady;
    }
    // Prepare the artwork as soon as it loads so the opening does not fall back
    // to the old sprite while the first few frames are being decoded.
    sheet.onload=prepare;
    extraSheet.onload=prepareExtra;
    var games=settings.runner.games, last=games.length-1, previous=games[last];
    games[last]=function(){
        var game=this, renderer=game.PixelDrawer;
        previous.call(game);
        if(renderer.heroCompareHooked) return;
        var oldDraw=renderer.drawThingOnContext;
        renderer.drawThingOnContext=function(ctx,thing){
            var sprites, classes=thing.className||'', pose;
            var rising=typeof thing.magaRise==='number' && thing.magaRise<42;
            if(!enabled || thing.title!=='Player' || thing.hidden || !thing.alive || thing.dead || thing.dying ||
               thing.piping || (!thing.star && (thing.crouching || (!thing.shrooming && /climbing|paddling/.test(classes)))) ||
               thing.magaBoarding) {
                return oldDraw.call(this,ctx,thing);
            }
            sprites=prepare();
            if(!sprites){if(!failed && (rising || thing.star))return;return oldDraw.call(this,ctx,thing);}
            if(rising || thing.shrooming) pose=sprites[0];
            else if(!thing.resting || /jumping/.test(classes)) {var jumpFrames=prepareExtra();pose=jumpFrames && jumpFrames[0];}
            else if(/(?:^|\s)skidding(?:\s|$)/.test(classes)) {var skidFrames=prepareExtra();pose=skidFrames && skidFrames[1];}
            else {var moving=Math.abs(thing.xvel||0)>.08;pose=sprites[moving?1+Math.floor(game.TimeHandler.getTime()/7)%3:0];}
            if(!pose){if(thing.star && !extraFailed)return;return oldDraw.call(this,ctx,thing);}
            var l=this.getLeft(thing),r=this.getRight(thing),t=this.getTop(thing),b=this.getBottom(thing);
            // Keep the high-detail pose visible during the native growth cycle.
            // This changes only drawing; the engine continues to own the collision box.
            if(thing.shrooming) {
                var growScale=/\bshrooming1\b/.test(classes)?0.58:/\bshrooming2\b/.test(classes)?0.8:1;
                t=b-(b-t)*growScale;
            }
            if(r<0 || l>game.MapScreener.width || b<0 || t>game.MapScreener.height) return;
            ctx.save();ctx.imageSmoothingEnabled=false;
            if(typeof thing.opacity==='number')ctx.globalAlpha*=thing.opacity;
            if(thing.star) {
                var flashes=['brightness(1.45) saturate(1.3)','brightness(1.2) saturate(1.5) hue-rotate(15deg)',
                    'brightness(1.4) saturate(1.3)','brightness(1.15) saturate(1.5) hue-rotate(-15deg)'];
                ctx.filter=flashes[Math.floor(game.TimeHandler.getTime()/3)%flashes.length];
            }
            if(rising) {
                var phase=Math.max(0,Math.min(1,(thing.magaRise||0)/42));
                ctx.translate((l+r)/2,b);ctx.rotate(-1.05*(1-phase));ctx.scale(1,.7+.3*phase);ctx.translate(-(l+r)/2,-b);
            }
            if(thing.flipHoriz){ctx.translate(r,t);ctx.scale(-1,1);ctx.drawImage(pose,0,0,r-l,b-t);}
            else ctx.drawImage(pose,l,t,r-l,b-t);
            ctx.restore();
            if(rising && phase<.8) {
                var reach=1-phase,cx=(l+r)/2,sy=b-(b-t)*.22;
                ctx.save();ctx.lineCap='square';ctx.strokeStyle='#1b2440';ctx.lineWidth=game.unitsize*1.5;
                ctx.beginPath();ctx.moveTo(cx-(b-t)*.36*reach,sy);ctx.lineTo(cx-(b-t)*.57*reach,b-game.unitsize*.5);ctx.stroke();
                ctx.fillStyle='#f2a779';ctx.fillRect(cx-(b-t)*.57*reach-game.unitsize*.5,b-game.unitsize,game.unitsize*1.5,game.unitsize);ctx.restore();
            }
        };
        renderer.heroCompareHooked=true;
    };
}());
