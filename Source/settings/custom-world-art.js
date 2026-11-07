/* Pixel-art replacements, using the existing object sizes and game mechanics. */
(function () {
    "use strict";
    var settings = FullScreenMario.FullScreenMario.settings;
    var library = settings.sprites.library;
    // Transparent, outline, navy, white, red, grey, skin, gold, dark red.
    var colors = "p[0,2,15,1,8,3,5,10,11]";
    function image(w, h) {
        var p = Array.from({length: h}, function () { return Array(w).fill(0); });
        return {
            rect: function (x, y, width, height, color) {
                for (var j = Math.max(0, y); j < Math.min(h, y + height); j += 1) {
                    for (var i = Math.max(0, x); i < Math.min(w, x + width); i += 1) p[j][i] = color;
                }
            },
            pixel: function (x, y, color) { if (x >= 0 && x < w && y >= 0 && y < h) p[y][x] = color; },
            encode: function () { return colors + p.map(function (row) { return row.join(""); }).join(""); }
        };
    }
    var letters = {
        P:["110","101","110","100","100"], O:["111","101","101","101","111"],
        L:["100","100","100","100","111"], I:["111","010","010","010","111"],
        C:["011","100","100","100","011"], E:["111","100","110","100","111"]
    };
    function text(img, word, x, y, color) {
        word.split("").forEach(function (letter, n) {
            letters[letter].forEach(function (row, yy) {
                row.split("").forEach(function (cell, xx) { if (cell === "1") img.pixel(x + n * 4 + xx, y + yy, color); });
            });
        });
    }
    function shield(top, w, h) {
        var a = image(w, h);
        a.rect(1, 0, w - 2, h, 1); a.rect(3, 1, w - 6, h - 2, 5);
        a.rect(4, 2, w - 8, h - 4, 2); a.rect(5, 2, 1, h - 4, 3);
        a.rect(w - 6, 2, 1, h - 4, 1);
        if (top && w >= 30) { a.rect(4, 4, w - 8, 7, 1); text(a, "POLICE", 5, 5, 3); }
        return a.encode();
    }
    var pipe = ["multiple", "vertical", { top: shield(true, 32, 16), middle: shield(false, 32, 16) }];
    library.Solid.Pipe = { normal: pipe, Castle: { normal: pipe, Underwater: pipe }, Alt: pipe, Alt2: pipe };
    library.Solid.PipeVertical = { normal: shield(true, 32, 16), Castle: { normal: shield(true, 32, 16), Underwater: shield(true, 32, 16) } };
    library.Solid.PipeHorizontal = { normal: shield(true, 39, 32), small: shield(false, 16, 32) };

    function flag(w, h, wave) {
        var a = image(w, h), x, y;
        // Bordered horizontal flag; simple waves fit the native 14/16-pixel icon.
        for (y = 2; y < h - 2; y += 1) for (x = 1; x < w - 1; x += 1) {
            a.pixel(x, y, y === 2 || y === h - 3 || x === 1 || x === w - 2 ? 1 : ((y + wave) % 2 ? 4 : 3));
        }
        a.rect(2, 3, Math.max(4, Math.floor(w * 0.40)), 5, 2);
        a.pixel(3, 4, 3); a.pixel(5, 4, 3); a.pixel(4, 6, 3);
        return a.encode();
    }
    library.Character.Star = { normal: flag(14, 16, 0), two: flag(14, 16, 1), three: flag(14, 16, 0), four: flag(14, 16, 1) };
    library.Scenery.Flag = { normal: flag(16, 16, 0), Alt: flag(16, 16, 0), Alt2: flag(16, 16, 0) };
    library.Scenery.CastleFlag = flag(13, 20, 0);

    function cola() {
        var a = image(16, 16);
        a.rect(5, 1, 6, 1, 5); a.rect(4, 2, 8, 1, 1); a.rect(3, 3, 10, 11, 1);
        a.rect(4, 3, 8, 10, 4); a.rect(5, 4, 1, 8, 8); a.rect(10, 4, 1, 8, 8);
        a.rect(5, 6, 6, 1, 3); a.rect(4, 7, 7, 1, 3); a.rect(5, 8, 6, 1, 3);
        a.rect(4, 13, 8, 1, 5); a.rect(5, 14, 6, 1, 1);
        return a.encode();
    }
    library.Character.Mushroom = cola();

    function musk() {
        var a = image(16, 26);
        a.rect(4, 1, 8, 2, 1); a.rect(3, 3, 10, 3, 1); a.rect(4, 3, 8, 2, 8);
        a.rect(4, 5, 8, 7, 6); a.rect(3, 6, 1, 4, 6); a.rect(12, 6, 1, 4, 6);
        a.rect(5, 6, 2, 1, 1); a.rect(9, 6, 2, 1, 1); a.pixel(6, 8, 1); a.pixel(10, 8, 1);
        a.rect(8, 8, 1, 2, 7); a.rect(6, 11, 5, 1, 8); a.rect(5, 12, 6, 1, 6);
        a.rect(4, 13, 8, 9, 1); a.rect(5, 13, 6, 8, 2); a.rect(7, 13, 2, 5, 3);
        a.rect(3, 14, 2, 7, 2); a.rect(11, 14, 2, 7, 2); a.rect(3, 20, 2, 2, 6); a.rect(11, 20, 2, 2, 6);
        a.rect(5, 21, 3, 4, 1); a.rect(9, 21, 3, 4, 1); a.rect(4, 25, 4, 1, 1); a.rect(9, 25, 4, 1, 1);
        return a.encode();
    }
    library.Scenery.Peach = musk();

    function whiteHouse(w, h) {
        var a = image(w, h), middle = Math.floor(w / 2), x, y;
        // Symmetric facade and pediment make it identifiable at game scale.
        a.rect(2, 21, w - 4, h - 23, 1); a.rect(4, 22, w - 8, h - 26, 3);
        a.rect(4, 22, w - 8, 3, 5); a.rect(0, h - 4, w, 4, 1); a.rect(2, h - 5, w - 4, 2, 5);
        a.rect(8, 17, w - 16, 5, 3); a.rect(6, 20, w - 12, 2, 1);
        for (y = 0; y < 10; y += 1) a.rect(middle - 3 - y * 2, 8 + y, 6 + y * 4, 1, y === 9 ? 1 : 3);
        a.rect(middle - 4, 12, 8, 2, 5);
        for (x = 9; x < w - 9; x += 13) {
            a.rect(x, 27, 5, 8, 2); a.rect(x + 1, 28, 3, 6, 5);
            a.rect(x, h - 25, 5, 8, 2); a.rect(x + 1, h - 24, 3, 6, 5);
        }
        a.rect(middle - 19, 32, 38, h - 38, 1); a.rect(middle - 17, 34, 34, h - 42, 5);
        for (x = middle - 16; x <= middle + 14; x += 6) {
            a.rect(x, 35, 3, h - 42, 3); a.rect(x - 1, 34, 5, 2, 3); a.rect(x - 1, h - 9, 5, 2, 3);
        }
        a.rect(middle - 4, h - 19, 8, 13, 2); a.rect(middle - 1, h - 18, 1, 11, 5);
        a.rect(middle - 2, 0, 1, 8, 1); a.rect(middle - 1, 1, 8, 5, 4); a.rect(middle - 1, 2, 8, 1, 3); a.rect(middle - 1, 4, 8, 1, 3); a.rect(middle - 1, 1, 3, 2, 2);
        return a.encode();
    }
    var scenery = settings.objects.inheritance.Thing.scenery;
    scenery.WhiteHouse = {}; scenery.WhiteHouseLarge = {};
    settings.objects.properties.WhiteHouse = [40, 40];
    settings.objects.properties.WhiteHouseLarge = [72, 48];
    library.Scenery.WhiteHouse = whiteHouse(80, 80);
    library.Scenery.WhiteHouseLarge = whiteHouse(144, 96);
    function houseMacro(large) {
        return function (reference) {
            var x = reference.x || 0, y = reference.y || 0;
            var things = [{ thing: large ? "WhiteHouseLarge" : "WhiteHouse", x: x, y: y + (large ? 48 : 40), position: "end" }];
            if (reference.transport) things.push({ thing: "DetectCollision", x: x + 24, y: y + 16, height: 16, activate: FullScreenMario.FullScreenMario.prototype.collideCastleDoor, transport: reference.transport, position: "end" });
            return things;
        };
    }
    settings.maps.macros.CastleSmall = houseMacro(false);
    settings.maps.macros.CastleLarge = houseMacro(true);
    // Preserve the original cutscene structure while adapting its captions.
    var originalInsideCastle = settings.maps.macros.EndInsideCastle;
    settings.maps.macros.EndInsideCastle = function () {
        var result = originalInsideCastle.apply(this, arguments);
        var replacements = { 'THANK YOU MARIO!':'THANK YOU TRUMP!', 'BUT OUR PRINCESS IS IN':'BUT ELON IS IN', 'YOUR QUEST IS OVER.':'YOU FOUND ELON!', 'WE PRESENT YOU A NEW QUEST.':'A NEW MISSION AWAITS.' };
        result.forEach(function (entry) {
            if (entry.thing === 'CustomText' && Array.isArray(entry.texts)) {
                entry.texts.forEach(function (line) { if (replacements[line.text]) line.text = replacements[line.text]; });
            }
        });
        return result;
    };
}());
