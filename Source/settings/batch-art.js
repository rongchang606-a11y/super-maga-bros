/* Reviewed high-detail sprites: art-only replacement, physics stay unchanged. */
(function(){
    'use strict';
    var defs={
        donkey:[4,1],reporter:[4,1],crowd:[6,2],monsters:[6,1],boss:[4,1],
        'world-items':[3,1],musk:[4,1],powerups:[3,1],
        'extra-enemies':[4,1],'extra-items':[4,1],tv:[2,1],'tv-states':[4,1],shell:[4,1]
    }, sheets={};
    Object.keys(defs).forEach(function(name){var img=new Image();img.src='assets/sprites/batch-'+name+'.png';sheets[name]={img:img,cache:{}};});

    // Decode each cell lazily so transparent padding, scaling and frame anchors
    // are deterministic without changing any object size or collision geometry.
    function frame(name,col,row){
        var entry=sheets[name],img=entry.img,grid=defs[name],key=col+':'+(row||0);
        if(entry.cache[key])return entry.cache[key];
        if(!img.complete||!img.naturalWidth)return null;
        if(!entry.raw){entry.raw=document.createElement('canvas');entry.raw.width=img.naturalWidth;entry.raw.height=img.naturalHeight;
            var rc=entry.raw.getContext('2d',{willReadFrequently:true});rc.drawImage(img,0,0);
            var imgData=rc.getImageData(0,0,img.naturalWidth,img.naturalHeight),data=imgData.data;
            if(name==='tv-states'){
                // The reviewed draft has a semi-transparent white matte; remove it before drawing.
                for(var q=0;q<data.length;q+=4)if(data[q]>240&&data[q+1]>240&&data[q+2]>240&&data[q+3]<230)data[q+3]=0;
                rc.putImageData(imgData,0,0);
            }
            entry.pixels=data;}
        var raw=entry.raw,pix=entry.pixels,cw=raw.width/grid[0],ch=raw.height/grid[1];
        var x0=Math.floor(cw*col),x1=Math.floor(cw*(col+1)),y0=Math.floor(ch*(row||0)),y1=Math.floor(ch*((row||0)+1));
        var minX=x1,maxX=x0,minY=y1,maxY=y0;
        for(var y=y0;y<y1;y+=2)for(var x=x0;x<x1;x+=2)if(pix[(y*raw.width+x)*4+3]>140){
            minX=Math.min(minX,x);maxX=Math.max(maxX,x);minY=Math.min(minY,y);maxY=Math.max(maxY,y);
        }
        if(maxX<=minX||maxY<=minY)return null;
        // Keep falling banknotes separate from Musk's body anchor.
        if(name==='musk' && col===2) minY=Math.max(minY,Math.floor(ch*.15));
        var bw=maxX-minX+2,bh=maxY-minY+2,out=document.createElement('canvas');out.width=64;out.height=64;
        var c=out.getContext('2d');c.imageSmoothingEnabled=false;
        var scale=Math.min(62/bw,62/bh),dw=Math.max(1,Math.round(bw*scale)),dh=Math.max(1,Math.round(bh*scale));
        c.drawImage(raw,minX,minY,bw,bh,Math.floor((64-dw)/2),64-dh,dw,dh);
        if(name==='tv'){
            c.textAlign='center';c.textBaseline='middle';c.font='bold 12px sans-serif';
            c.lineWidth=2;c.strokeStyle='#24172a';c.strokeText('CNN',32,37,34);c.fillStyle='#fff';c.fillText('CNN',32,37,34);
        }
        entry.cache[key]=out;return out;
    }
    function paint(ctx,img,l,t,w,h,flipX,flipY){
        ctx.save();ctx.imageSmoothingEnabled=false;ctx.translate(flipX?l+w:l,flipY?t+h:t);
        ctx.scale(flipX?-1:1,flipY?-1:1);ctx.drawImage(img,0,0,w,h);ctx.restore();
    }
    var games=FullScreenMario.FullScreenMario.settings.runner.games,last=games.length-1,previous=games[last];
    games[last]=function(){
        var game=this,renderer=game.PixelDrawer;
        previous.call(game);
        if(renderer.batchArtHooked)return;
        var old=renderer.drawThingOnContext;
        renderer.drawThingOnContext=function(ctx,thing){
            if(thing.hidden||thing.opacity===0)return old.call(this,ctx,thing);
            var name=thing.title,classes=thing.className||'',tick=game.TimeHandler.getTime(),sheet,col=0,row=0,flip=!!thing.flipHoriz;
            switch(name){
                case 'Goomba':sheet='tv';col=Math.floor(tick/12)%2;flip=false;break;
                case 'DeadGoomba':
                    sheet='tv-states';if(typeof thing.batchDeadStart!=='number')thing.batchDeadStart=tick;
                    col=tick-thing.batchDeadStart<10?2:3;flip=false;break;
                case 'Koopa':var winged=!!(thing.jumping||thing.floating);sheet=winged?'extra-enemies':'donkey';col=winged?2:Math.floor(tick/12)%2;flip=!!thing.moveleft;break;
                case 'Shell':case 'BeetleShell':sheet='shell';col=/peeking/.test(classes)?1:0;break;
                case 'Piranha':case 'ChasingReporter':sheet='reporter';col=thing.dead?3:(Math.abs(thing.xvel||0)>.05?Math.floor(tick/8)%2:2);flip=!!thing.moveleft;break;
                case 'ReviewCrowd':sheet='crowd';col=Math.max(0,Math.min(5,thing.variant||0));row=1;flip=!!thing.moveleft;break;
                case 'MuskReward':sheet='musk';col=[0,1,2,3][Math.floor((thing.rewardAge||0)/18)%4];flip=false;break;
                case 'Peach':sheet='musk';col=3;flip=false;break;
                case 'Mushroom':sheet='powerups';col=0;break;
                case 'Mushroom1Up':sheet='extra-items';col=0;break;
                case 'Coin':sheet='powerups';col=1;flip=false;break;
                case 'FireFlower':case 'Fireball':sheet='powerups';col=2;flip=false;break;
                case 'Star':case 'Flag':case 'CastleFlag':sheet='world-items';col=2;flip=false;break;
                case 'Block':if(thing.used)return old.call(this,ctx,thing);sheet='world-items';col=0;break;
                case 'Brick':if(thing.used)return old.call(this,ctx,thing);sheet='world-items';col=1;break;
                case 'BrickShard':sheet='shell';col=2;break;
                case 'Beetle':sheet='monsters';col=0;break;
                case 'Blooper':sheet='monsters';col=1;break;
                case 'CheepCheep':sheet='monsters';col=2;break;
                case 'Spiny':sheet='monsters';col=3;break;
                case 'BulletBill':sheet='boss';col=0;break;
                case 'Lakitu':sheet='extra-enemies';col=0;break;
                case 'HammerBro':sheet='extra-enemies';col=1;break;
                case 'Bowser':sheet='boss';col=3;break;
                case 'Hammer':sheet='boss';col=2;break;
                case 'SpinyEgg':sheet='extra-enemies';col=3;break;
                case 'Podoboo':case 'BowserFire':case 'CastleFireball':sheet='extra-items';col=2;break;
                case 'Vine':sheet='extra-items';col=1;break;
                default:return old.call(this,ctx,thing);
            }
            var image=frame(sheet,col,row);if(!image)return old.call(this,ctx,thing);
            var l=this.getLeft(thing),r=this.getRight(thing),t=this.getTop(thing),b=this.getBottom(thing),w=r-l,h=b-t;
            if(r<0||l>game.MapScreener.width||b<0||t>game.MapScreener.height)return;
            if(name==='ReviewCrowd'||name==='ChasingReporter'){w=game.unitsize*12;h=game.unitsize*16;l=(l+r-w)/2;t=b-h;}
            if(name==='MuskReward'){w=game.unitsize*10;h=game.unitsize*12;l=(l+r-w)/2;t=b-h;}
            if(name==='Fireball'){
                w=game.unitsize*6;h=w;ctx.save();ctx.translate((l+r)/2,(t+b)/2);ctx.rotate(thing.moveleft?-Math.PI/2:Math.PI/2);
                paint(ctx,image,-w/2,-h/2,w,h,false,false);ctx.restore();return;
            }
            ctx.save();if(typeof thing.opacity==='number')ctx.globalAlpha*=thing.opacity;
            paint(ctx,image,l,t,w,h,flip,!!thing.flipVert);
            if(name==='MuskReward'){
                var bill=frame('powerups',1,0),age=thing.rewardAge||0;
                if(bill&&age>0)for(var i=0;i<6;i++){var phase=(age+i*17)%88;
                    paint(ctx,bill,(l+r)/2+(i-2.5)*11+Math.sin((age+i*9)/12)*5,t-20+phase*.75,15,9,i%2===1,false);}
            }
            ctx.restore();
        };
        renderer.batchArtHooked=true;
    };
}());
