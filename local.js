let scene, rig;
let character;

window.onload = function() {
    const playerNameInput = document.querySelector("#player-name");

    scene = document.querySelector("a-scene");

    rig = document.getElementById("rig");
    rig.setAttribute("position", {x:0,y:0.5,z:0});

    character = document.createElement("a-box");
    character.setAttribute("color","red");

    smile = document.createElement("a-box");
    smile.setAttribute("src", "img.png");
    smile.setAttribute("height", 0.9);
    smile.setAttribute("width", 0.9);
    smile.setAttribute("depth", 0.9);
    smile.setAttribute("position",{
        x: 0,
        y: 0,
        z: -0.06,
    });
    character.append(smile);

    nameTag = document.createElement("a-text");
    nameTag.setAttribute("value", "Thomas");
    nameTag.setAttribute("color", "black");
    nameTag.setAttribute("position",{
        x: 0.5,
        y: 0.9,
        z: 0,
    });
    nameTag.setAttribute("rotation",{
        x: 0,
        y: rig.getAttribute("rotation").y -180,
        z: 0,
    });
    character.append(nameTag);

    scene.append(character);

    loop();
}

function loop(){
    character.setAttribute("position",{
        x: rig.getAttribute("position").x,
        y: rig.getAttribute("position").y,
        z: rig.getAttribute("position").z - 2,
    });
    character.setAttribute("rotation",{
        x: rig.getAttribute("rotation").x,
        y: rig.getAttribute("rotation").y,
        z: rig.getAttribute("rotation").z,
    });

    setTimeout(loop, 30);
}