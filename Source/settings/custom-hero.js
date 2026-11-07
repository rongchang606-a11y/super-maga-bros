/* A 16-pixel-wide character designed for the existing Player animation states.
 * 0 transparent, 1 outline/shoes, 2 navy, 3 skin, 4 hair, 5 tie,
 * 6 shirt, 7 hair shadow/brows, 8 facial shadow. Rows share one bottom anchor. */
(function () {
    "use strict";
    // Game keys must not scroll the page while the player is controlling Mario.
    window.addEventListener("keydown", function (event) {
        var tag = event.target && event.target.tagName;
        if ((tag === "BODY" || tag === "HTML") &&
                [32, 37, 38, 39, 40].indexOf(event.keyCode) !== -1) {
            event.preventDefault();
        }
    }, true);
    // The character palette is appended: no existing game colors are changed.
    var gamePalette = FullScreenMario.FullScreenMario.settings.sprites.paletteDefault;
    var skin = gamePalette.push([242, 167, 121, 255]) - 1;
    var hair = gamePalette.push([244, 209, 87, 255]) - 1;
    var hairShadow = gamePalette.push([157, 106, 31, 255]) - 1;
    var faceShadow = gamePalette.push([173, 100, 68, 255]) - 1;
    var palette = "p[0,2,15," + skin + "," + hair + ",7,1," + hairShadow + "," + faceShadow + ",8]";
    var head = [
        "0000000000000000",
        "0000999999900000",
        "0009966999994000",
        "0004444444444000",
        "0004473373374000",
        "0004331331333000",
        "0004333383333000",
        "0000833888330000"
    ];
    // A separately drawn face for the taller form, rather than vertically
    // stretching the tiny face: swept hair, brows, eyes, nose and mouth.
    var largeHead = [
        "0000000000000000",
        "0000999999990000",
        "0009966999999000",
        "0009999999999400",
        "0004444444444400",
        "0004477737734000",
        "0004333333333000",
        "0004331331333000",
        "0004333383333300",
        "0000833383333000",
        "0000083888330000",
        "0000008333800000"
    ];
    var bodies = {
        idle: [
            "0000012261220000", "0000122652221000", "0000122652221000",
            "0000122252221000", "0000132252223000", "0000022222200000",
            "0000022102210000", "0000111001111000"
        ],
        run1: [
            "0000012261200000", "0000122652220000", "0001322652221000",
            "0000122252221300", "0000022252211000", "0000022222200000",
            "0000122002220000", "0001110000111000"
        ],
        run2: [
            "0000012261220000", "0000122652221000", "0000122652223000",
            "0000132252220000", "0000022252200000", "0000022222100000",
            "0000002211100000", "0000001110000000"
        ],
        run3: [
            "0000012261200000", "0000122652220000", "0000322652210000",
            "0000122252221300", "0000022252221000", "0000022222100000",
            "0000002220022100", "0000011100001110"
        ],
        jump: [
            "0000012261220030", "0030122652221330", "0033122652221000",
            "0000122252221000", "0000022252220000", "0000022222200000",
            "0000122102220000", "0001110000111000"
        ],
        skid: [
            "0000012261220000", "0000122652221000", "0001322652221300",
            "0000122252220000", "0000022252210000", "0000022222200000",
            "0000122100221000", "0011110000011100"
        ]
    };
    function encode(rows) {
        rows.forEach(function (row) {
            if (row.length !== 16 || /[^0-9]/.test(row)) {
                throw new Error("Invalid custom hero sprite row: " + row);
            }
        });
        return palette + rows.join("").split("").map(function (pixel) { return "0" + pixel; }).join("");
    }
    function small(pose) { return encode(head.concat(bodies[pose])); }
    function large(pose) {
        var b = bodies[pose];
        // Give the enlarged character a readable head without changing its
        // original 16-by-32 canvas or the shared foot anchor.
        return encode(largeHead.concat([
            b[0], b[0], b[1], b[1], b[2], b[2], b[3], b[3],
            b[4], b[4], b[5], b[5],
            b[6], b[6], b[6], b[6], b[6], b[6],
            b[7], b[7]
        ]));
    }
    function motion(draw) {
        return {
            normal: draw("idle"), hopping: draw("run2"),
            running: { skidding: draw("skid"), normal: {
                normal: draw("run1"), two: draw("run2"), three: draw("run3")
            }},
            paddling: {
                normal: { normal: draw("jump"), paddle1: draw("run1"), paddle2: draw("run2"), paddle3: draw("run3") },
                swim2: { normal: draw("jump"), paddle1: draw("run1"), paddle2: draw("run2"), paddle3: draw("run3") }
            },
            climbing: { normal: draw("run1"), two: draw("run3") }
        };
    }
    var player = FullScreenMario.FullScreenMario.settings.sprites.library.Character.Player;
    var normal = player.normal;
    normal.normal.jumping = small("jump");
    normal.normal.normal = motion(small);
    normal.large.jumping = large("jump");
    normal.large.normal = motion(large);
    normal.large.normal.crouching = small("idle");
    normal.fiery.jumping = { normal: large("jump"), firing: large("jump") };
    normal.fiery.normal = motion(large);
    normal.fiery.normal.crouching = small("idle");
    normal.fiery.normal.firing = large("run1");
    normal.shrooming.normal = large("idle");
    normal.shrooming.shrooming2 = large("idle");
    normal.shrooming.shrooming3 = large("idle");
    player.dead = small("jump");
}());
