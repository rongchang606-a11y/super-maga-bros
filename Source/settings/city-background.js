/* Ten source panels form a gently blended, scrolling WORLD 1-1 backdrop. */
(function () {
    "use strict";
    var settings=FullScreenMario.FullScreenMario.settings;
    var names=['01-liberty','02-diner','03-market','04-drugstore','05-bank',
        '06-police','07-fire-station','08-hospital','09-city-hall','10-white-house'];
    var images=names.map(function (name) {
        var img=new Image(); img.src='assets/city/'+name+'.png'; return img;
    });
    var roadImage=new Image(); roadImage.src='assets/city/road-reference.png';
    var roadTile=null;
    function makeRoadTile() {
        if(roadTile || !roadImage.complete || !roadImage.naturalWidth) return;
        var source=document.createElement('canvas'), w=294, h=32, fade=10;
        source.width=w;source.height=h;
        var s=source.getContext('2d');s.imageSmoothingEnabled=false;
        var top=Math.round(roadImage.naturalHeight*0.674);
        s.drawImage(roadImage,0,top,roadImage.naturalWidth,roadImage.naturalHeight-top,0,0,w,h);
        roadTile=document.createElement('canvas');roadTile.width=w-fade;roadTile.height=h;
        var t=roadTile.getContext('2d');t.imageSmoothingEnabled=false;
        t.drawImage(source,0,0);
        var edge=document.createElement('canvas');edge.width=fade;edge.height=h;
        var e=edge.getContext('2d');e.drawImage(source,w-fade,0,fade,h,0,0,fade,h);
        e.globalCompositeOperation='destination-in';
        var gradient=e.createLinearGradient(0,0,fade,0);
        gradient.addColorStop(0,'rgba(0,0,0,1)');gradient.addColorStop(1,'rgba(0,0,0,0)');
        e.fillStyle=gradient;e.fillRect(0,0,fade,h);t.drawImage(edge,0,0);
    }
    function isCity(game) {
        var handler=game.MapsHandler, map=handler.getMap();
        return handler.getMapName()==='1-1' && map && handler.getArea()===map.areas[0];
    }
    var strip=null, failed=false;
    // Internal pixels are doubled on the game canvas to match the existing art.
    var panelWidth=286, panelHeight=238, overlap=12;
    function makeStrip() {
        if (strip || failed) return;
        if (images.some(function (img) { return !img.complete; })) return;
        if (images.some(function (img) { return !img.naturalWidth; })) { failed=true; return; }
        strip=document.createElement('canvas');
        strip.width=panelWidth*images.length-overlap*(images.length-1);
        strip.height=panelHeight;
        var ctx=strip.getContext('2d'); ctx.imageSmoothingEnabled=false;
        images.forEach(function (img,index) {
            var tile=document.createElement('canvas'); tile.width=panelWidth; tile.height=panelHeight;
            var t=tile.getContext('2d'); t.imageSmoothingEnabled=false;
            t.drawImage(img,0,0,panelWidth,panelHeight);
            if(index) {
                t.globalCompositeOperation='destination-in';
                var gradient=t.createLinearGradient(0,0,overlap,0);
                gradient.addColorStop(0,'rgba(0,0,0,0)'); gradient.addColorStop(1,'rgba(0,0,0,1)');
                t.fillStyle=gradient;t.fillRect(0,0,panelWidth,panelHeight);
            }
            ctx.drawImage(tile,index*(panelWidth-overlap),0);
        });
    }
    var level=settings.maps.library['1-1'].areas[0];
    level.creation=level.creation.filter(function (entry) {
        return entry.thing!=='CapitolBackdrop' && !(entry.macro==='Pattern' && entry.pattern==='BackRegular');
    });
    var games=settings.runner.games, last=games.length-1, drawGame=games[last];
    games[last]=function () {
        var game=this, renderer=game.PixelDrawer;
        if(!renderer.cityBackgroundHooked) {
            var oldDraw=renderer.drawBackground;
            renderer.drawBackground=function () {
                oldDraw.call(this);
                if(!isCity(game)) return;
                makeStrip(); if(!strip) return;
                var context=this.context, width=game.MapScreener.width, height=game.MapScreener.height;
                var scale=2, stripWidth=strip.width*scale;
                var worldWidth=1664*game.unitsize;
                var maxScroll=Math.max(1,worldWidth-width);
                var progress=Math.max(0,Math.min(1,game.MapScreener.left/maxScroll));
                var x=-Math.round(progress*Math.max(0,stripWidth-width));
                var ground=height-16*game.unitsize;
                var y=Math.round(ground-panelHeight*scale*0.84);
                context.save();context.imageSmoothingEnabled=false;
                // Leave an unmistakable dark drop behind genuine floor gaps.
                context.fillStyle='#162333';context.fillRect(0,ground,width,height-ground);
                context.beginPath();context.rect(0,0,width,ground);context.clip();
                // Extend the sky above the artwork when the viewport is tall.
                context.fillStyle='#438bd3';context.fillRect(0,0,width,Math.max(0,y+1));
                context.drawImage(strip,x,y,stripWidth,panelHeight*scale);
                // Keep the scene recognizable while separating it from gameplay.
                context.fillStyle='rgba(10,20,36,0.24)';context.fillRect(0,0,width,ground);
                context.restore();
            };
            var oldThingDraw=renderer.drawThingOnContext;
            renderer.drawThingOnContext=function (context,thing) {
                if(thing.title!=='Floor' || thing.hidden || !isCity(game)) return oldThingDraw.call(this,context,thing);
                makeRoadTile();
                if(!roadTile) return oldThingDraw.call(this,context,thing);
                var left=Math.max(0,this.getLeft(thing)), right=Math.min(game.MapScreener.width,this.getRight(thing));
                var top=this.getTop(thing), bottom=Math.min(game.MapScreener.height,this.getBottom(thing));
                if(left>=right || top>=bottom) return;
                var width=roadTile.width*2, roadHeight=game.unitsize*16;
                var offset=((game.MapScreener.left%width)+width)%width;
                context.save();context.imageSmoothingEnabled=false;
                context.filter='brightness(1.10) contrast(1.14)';
                context.beginPath();context.rect(left,top,right-left,bottom-top);context.clip();
                for(var x=-offset;x<game.MapScreener.width;x+=width) context.drawImage(roadTile,x,top,width,roadHeight);
                context.restore();
            };
            renderer.cityBackgroundHooked=true;
        }
        drawGame.call(game);
    };
}());
