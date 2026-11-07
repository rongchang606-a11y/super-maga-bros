/* WORLD 1-1 replacement art. Original sprite definitions remain in sprites.js. */
(function () {
    "use strict";
    var settings = FullScreenMario.FullScreenMario.settings;
    var lib = settings.sprites.library;
    var pal = "p[0,2,15,1,8,3,6,17,5]";
    function art(w, h, paint) {
        var p = Array.from({length: h}, function () { return Array(w).fill(0); });
        function box(x, y, a, b, c) {
            for (var yy = Math.max(0,y); yy < Math.min(h,y+b); yy++)
                for (var xx = Math.max(0,x); xx < Math.min(w,x+a); xx++) p[yy][xx] = c;
        }
        paint(box);
        return pal + p.map(function (row) { return row.join(""); }).join("");
    }
    function tv(dead) {
        return art(16, dead ? 8 : 16, function (b) {
            if (dead) { b(1,3,14,3,1); b(3,4,10,1,4); b(0,6,5,2,5); b(11,6,5,2,5); return; }
            b(3,0,1,2,1); b(12,0,1,2,1); b(2,2,12,10,1); b(3,3,10,8,5);
            b(3,4,10,6,4); b(4,5,2,1,3); b(4,5,1,4,3); b(4,8,2,1,3);
            b(7,5,1,4,3); b(8,6,1,2,3); b(9,5,1,4,3);
            b(10,5,1,4,3); b(11,6,1,2,3); b(12,5,1,4,3);
            b(4,12,2,2,1); b(10,12,2,2,1); b(2,14,5,2,1); b(9,14,5,2,1);
        });
    }
    var tvLive = tv(false), tvDead = tv(true);
    lib.Character.Goomba = {normal:{normal:tvLive,two:tvLive}, Underworld:tvLive, Castle:tvLive};
    // Avoid mirroring the text while retaining the original movement.
    settings.objects.properties.Goomba.spriteCycleSynched = [["one", "two"]];
    lib.Solid.DeadGoomba = {normal:tvDead, Underworld:tvDead, Castle:tvDead};

    function donkey(step) {
        return art(16,24,function(b){
            b(2,0,2,7,1); b(3,1,2,6,7); b(7,0,2,7,1); b(8,1,1,6,7);
            b(2,6,9,9,1); b(3,7,8,7,7); b(9,9,5,4,1); b(10,10,4,2,5);
            b(7,8,1,1,3); b(8,8,1,1,1); b(1,14,13,6,1); b(2,15,11,4,7);
            b(4,16,2,2,3); b(8,16,2,2,3); b(3,20,3,3,7); b(10,20,3,3,7);
            b(step ? 2 : 3,22,4,2,1); b(step ? 10 : 9,22,4,2,1);
        });
    }
    var d1 = donkey(false), d2 = donkey(true);
    var walking = {normal:d1, two:d2};
    lib.Character.Koopa = {normal:{normal:{normal:walking, jumping:walking, flying:walking}}, smart:{normal:walking}, Underworld:{normal:walking,smart:walking}, Castle:{normal:walking}};
    function shell() { return art(16,16,function(b){
        b(3,2,10,2,1); b(1,4,14,9,1); b(2,5,12,7,7); b(3,6,10,5,2);
        b(4,7,2,2,3); b(7,7,2,2,3); b(10,7,2,2,3); b(3,13,10,2,1);
    }); }
    var sh = {normal:shell(), peeking:shell()};
    lib.Character.Shell = {normal:{normal:sh,smart:sh}, Underworld:{normal:sh,smart:sh},Castle:{normal:sh}};

    function reporter(frame) { return art(16,24,function(b){
        b(4,1,8,3,1); b(3,4,10,6,8); b(4,4,8,2,1); b(5,6,1,1,1); b(9,6,1,1,1);
        b(5,10,7,2,8); b(3,12,10,8,1); b(4,13,8,6,7); b(7,12,2,5,3);
        b(1,13,2,5,7); b(1,12,3,2,8); b(0,8,2,4,1); b(0,7,3,2,5);
        b(12,frame ? 12 : 14,2,5,7); b(4,20,3,4,1); b(9,20,3,4,1);
    }); }
    var r1=reporter(false), r2=reporter(true), rep={normal:r1,two:r2};
    lib.Character.Piranha = {normal:rep,Underworld:rep,Castle:rep};

    function coin(width) { return art(10,14,function(b){
        var x=Math.floor((10-width)/2); b(x,1,width,12,1); b(x+1,2,Math.max(1,width-2),10,6);
        if(width>5){ b(4,3,2,8,8); b(3,4,4,1,8); b(3,9,4,1,8); b(2,6,5,1,8); }
    }); }
    var c1=coin(8), c2=coin(6), c3=coin(2);
    var coinFrames={normal:c1,two:c2,three:c3};
    lib.Character.Coin={normal:{normal:coinFrames,Underworld:coinFrames},anim:{normal:c1,anim2:c2,anim3:c3,anim4:c2}};

    function ballot(phase,used) { return art(16,16,function(b){
        b(0,0,16,16,1); b(1,1,14,14,used?5:6); b(1,1,14,2,used?3:(phase?3:6));
        b(3,3,10,1,1); if(!used){b(5,5,6,2,1);b(10,7,2,2,1);b(7,9,4,2,1);b(7,12,2,2,1);}
        else {b(2,1,12,2,3);b(2,3,12,2,1);b(4,7,8,1,1);b(4,10,8,1,1);}
    }); }
    var boxes={normal:ballot(0,false),two:ballot(1,false),three:ballot(0,false)};
    var block={used:ballot(0,true),normal:boxes};
    lib.Solid.Block={normal:block,Underworld:block,Castle:block};
    function crate(){return art(16,16,function(b){
        b(0,0,16,16,1);b(1,1,14,14,6);b(2,2,12,1,5);b(2,12,12,1,5);
        b(3,4,10,7,1);b(4,5,8,5,3);b(5,6,6,1,4);b(5,8,5,1,1);
        b(1,14,14,1,1);b(2,2,1,12,8);b(13,2,1,12,8);
    });}
    var brick={normal:crate(),used:ballot(0,true)};
    lib.Solid.Brick={normal:brick,Underworld:brick,Castle:brick,Alt2:brick};
    var paper=art(8,8,function(b){b(1,1,6,6,3);b(2,2,4,1,5);b(2,4,3,1,5);b(5,6,1,1,1);});
    lib.Character.BrickShard={normal:paper,Underworld:paper,Castle:paper};

    // A Washington skyline layer that does not participate in collisions.
    var skyline=art(144,48,function(b){
        b(0,44,144,4,5); b(0,35,144,9,3); b(3,26,138,18,3); b(3,26,138,2,5);
        for(var x=8;x<136;x+=12){b(x,30,5,10,5);b(x+1,31,3,8,2);}
        b(48,22,48,22,3); b(46,21,52,2,5); b(59,13,26,9,3);
        b(62,9,20,4,3); b(66,6,12,3,3); b(71,2,2,4,5);
        for(var c=52;c<94;c+=7){b(c,25,3,18,5);b(c+1,26,1,16,3);}
    });
    settings.objects.inheritance.Thing.scenery.CapitolBackdrop={};
    settings.objects.properties.CapitolBackdrop=[72,24];
    lib.Scenery.CapitolBackdrop=skyline;
    var level=settings.maps.library["1-1"].areas[0].creation;
    level.unshift({thing:"CapitolBackdrop",x:32,y:24},{thing:"CapitolBackdrop",x:688,y:24});
    // WORLD 1-1 shields do not spawn pipe-emergence enemies.
}());
