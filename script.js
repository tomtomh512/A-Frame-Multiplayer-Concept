let message1 = "You ded :( You went out of bounds";
let message2 = "You ded :( You took too many sushi rolls to the face";
let outsideOfZone = false;
let insideOfZone = true;
let hasMoved = false;

function getSpawnXPoint() {
    const ranges = [
        { min: -3.25, max: -3 },
        { min: -0.5, max: 0.5 },
        { min: 3, max: 3.25 }
    ];

    const randomRangeIndex = Math.floor(Math.random() * ranges.length);
    const range = ranges[randomRangeIndex];

    return Math.random() * (range.max - range.min) + range.min;
}

window.onload = function() {
    let playerId; // string of who we are logged in as
    let playerRef; // firebase ref
    let players = {}; // local list of state where every character is
    let playerElements = {}; // house player elements
    let projectiles = {};
    let projectileElements = {};
    let nameTagAngles = {};

    let scene = document.querySelector("a-scene");
    let rig = document.getElementById("camera");
    rig.setAttribute("position", {
        x: getSpawnXPoint(),
        y: 10,
        z: Math.random() * (3.25 - (-3.25)) + (-3.25)
    });
    rig.setAttribute("rotation", {
        x: 0,
        y: Math.floor(Math.random() * 360),
        z: 0
    });

    rig.components["look-controls"].yawObject.rotation.y = rig.getAttribute("rotation").y * Math.PI / 180;

    const playerNameInput = document.querySelector("#player-name");

    function handleArrowPress() {
        if (players[playerId] !== undefined) {

            hasMoved = true;
            updateInfoTag();

            players[playerId].position.x = rig.getAttribute("position").x;
            players[playerId].position.y = rig.getAttribute("position").y;
            players[playerId].position.z = rig.getAttribute("position").z;
            playerRef.set(players[playerId]);

            // let playerX = players[playerId].position.x;
            // let playerZ = players[playerId].position.z;
            // let softLimit = 4;
            // let hardLimit = 6;
            //
            // let alert = document.createElement("a-text");
            // alert.setAttribute("value", "Go back to the zone");
            // alert.setAttribute("scale", {
            //     x: 0.125,
            //     y: 0.125,
            //     z: 0.125
            // });
            // alert.setAttribute("position", {
            //     x: -0.125,
            //     y: 0,
            //     z: 0.75
            // });
            //
            // if (playerX < -softLimit || playerX > softLimit || playerZ < -softLimit || playerZ > softLimit){
            //
            //     insideOfZone = false;
            //     if (!outsideOfZone){ decreaseHealth(); }
            //     outsideOfZone = true;
            //     rig.querySelector("a-cursor").append(alert);
            // } else {
            //
            //     insideOfZone = true;
            //     outsideOfZone = false;
            //     rig.querySelector("a-cursor").innerHTML = '';
            // }
            //
            // if (playerX < -hardLimit || playerX > hardLimit || playerZ < -hardLimit || playerZ > hardLimit){
            //     playerElements[playerId].remove();
            //     playerRef.remove();
            //     scene.remove();
            //     document.getElementById("game-container").remove();
            //     document.getElementById("game-over-container").style.display = "inline-block";
            //     document.getElementById("message").innerHTML = message1;
            // }
        }
    }

    function handleMouseMove() {
        if (players[playerId] !== undefined) {
            updateInfoTag();
            players[playerId].rotation.x = rig.getAttribute("rotation").x;
            players[playerId].rotation.y = rig.getAttribute("rotation").y;
            players[playerId].rotation.z = rig.getAttribute("rotation").z;
            playerRef.set(players[playerId]);
        }
    }

    function decreaseHealth() {
        if (players[playerId] !== undefined){

            playerRef.update({
                health: players[playerId].health - 5,
            });

            if (players[playerId].health <= 5){
                playerElements[playerId].remove();
                playerRef.remove();
                scene.remove();
                document.getElementById("game-container").remove();
                document.getElementById("game-over-container").style.display = "inline-block";
                document.getElementById("message").innerHTML = message1;
            }

            if (insideOfZone == false){
                setTimeout(decreaseHealth, 1000);
            }
        }
    }

    let count = 0; // ain't no way this going over 9007199254740991
    function createBullet() {

        let alert = document.createElement("a-text");
        alert.setAttribute("value", "No ammo");
        alert.setAttribute("color", "black");
        alert.setAttribute("scale", {
            x: 0.065,
            y: 0.065,
            z: 0.065
        });
        alert.setAttribute("position", {
            x: 0.01,
            y: 0,
            z: 0.75
        });

        if (hasMoved) {

            if (players[playerId].ammo > 0) {
                let position = {
                    x: rig.getAttribute("position").x,
                    y: rig.getAttribute("position").y,
                    z: rig.getAttribute("position").z,
                }
                let rotation = {
                    x: rig.getAttribute("rotation").x,
                    y: rig.getAttribute("rotation").y,
                    z: rig.getAttribute("rotation").z,
                }
                let uniqueId = playerId + count.toString();
                const projectileRef = firebase.database().ref(`projectiles/${uniqueId}`);

                projectileRef.set({
                    id: uniqueId,
                    from: playerId,
                    position,
                    rotation,
                })

                count++;

                playerRef.update({
                    ammo: players[playerId].ammo - 1,
                })

                moveBullet(uniqueId);
            } else {
                rig.querySelector("a-cursor").append(alert);
            }
        }
    }

    let collisionRange = 0.25;
    function moveBullet(projectileKey) {
        let currentProjectile = projectiles[projectileKey];
        if (currentProjectile !== undefined) {
            let flag = false; // prevents setTimeout from running again after bullet is removed
            let id = currentProjectile.id;
            let projectileRef = firebase.database().ref(`projectiles/${id}`);

            // velocity
            let dx = sinInDegrees(currentProjectile.rotation.y);
            let dy = sinInDegrees(currentProjectile.rotation.x);
            let dz = cosInDegrees(currentProjectile.rotation.y);

            // move, direct set
            let magnitude = 10; //smoothness, more is slower, laggier, also affects speed so balance
            let timeout = 25; // speed, lower - faster, cant be too low - overload server if spammed
            currentProjectile.position.x -= dx / magnitude;
            currentProjectile.position.y += dy / magnitude;
            currentProjectile.position.z -= dz / magnitude;
            projectileRef.set(projectiles[id]);

            // out of bounds
            if (
                Math.abs(currentProjectile.position.x) >= 5.5 ||
                Math.abs(currentProjectile.position.z) >= 5.5 ||
                currentProjectile.position.y <= -0.65 ||
                currentProjectile.position.y >= 1.75
            ) {
                firebase.database().ref(`projectiles/${id}`).remove();
            }

            // pillars
            if (
                currentProjectile.position.x >= (1.9 - 0.25) && currentProjectile.position.x <= (1.9 + 0.25) &&
                currentProjectile.position.z >= (-0.25) && currentProjectile.position.z <= (0.25)
            ) {
                firebase.database().ref(`projectiles/${id}`).remove();
            }

            if (
                currentProjectile.position.x >= (-1.9 - 0.25) && currentProjectile.position.x <= (-1.9 + 0.25) &&
                currentProjectile.position.z >= (-0.25) && currentProjectile.position.z <= (0.25)
            ) {
                firebase.database().ref(`projectiles/${id}`).remove();
            }

            // tables
            if (
                currentProjectile.position.x >= (-1.75 - 0.75) && currentProjectile.position.x <= (-1.75 + 0.75) &&
                currentProjectile.position.y <= (-0.35 + 0.25) &&
                currentProjectile.position.z >= (2 - 0.75) && currentProjectile.position.z <= (2 + 0.75)
            ) {
                firebase.database().ref(`projectiles/${id}`).remove();
            }

            if (
                currentProjectile.position.x >= (-1.75 - 0.75) && currentProjectile.position.x <= (-1.75 + 0.75) &&
                currentProjectile.position.y <= (-0.35 + 0.25) &&
                currentProjectile.position.z >= (-2 - 0.75) && currentProjectile.position.z <= (-2 + 0.75)
            ) {
                firebase.database().ref(`projectiles/${id}`).remove();
            }

            if (
                currentProjectile.position.x >= (1.75 - 0.75) && currentProjectile.position.x <= (1.75 + 0.75) &&
                currentProjectile.position.y <= (-0.35 + 0.25) &&
                currentProjectile.position.z >= (2 - 0.75) && currentProjectile.position.z <= (2 + 0.75)
            ) {
                firebase.database().ref(`projectiles/${id}`).remove();
            }

            if (
                currentProjectile.position.x >= (1.75 - 0.75) && currentProjectile.position.x <= (1.75 + 0.75) &&
                currentProjectile.position.y <= (-0.35 + 0.25) &&
                currentProjectile.position.z >= (-2 - 0.75) && currentProjectile.position.z <= (-2 + 0.75)
            ) {
                firebase.database().ref(`projectiles/${id}`).remove();
            }

            // hit
            let projectileX = currentProjectile.position.x;
            let projectileY = currentProjectile.position.y;
            let projectileZ = currentProjectile.position.z;

            for (let playerKey in players) {
                let currentPlayer = players[playerKey];
                if (currentPlayer !== undefined){
                    let currentPlayerId = currentPlayer.id;
                    let currentPlayerRef = firebase.database().ref(`players/${currentPlayerId}`);
                    let playerX = currentPlayer.position.x;
                    let playerY = currentPlayer.position.y;
                    let playerZ = currentPlayer.position.z;

                    let d = 0.3;

                    if (projectileX > (playerX - 0.275) && projectileX < (playerX + 0.275) &&
                        projectileY > (playerY + 0.275 - 0.8) && projectileY < (playerY + 0.275) &&
                        projectileZ > (playerZ - 0.275) && projectileZ < (playerZ + 0.275) &&
                        currentProjectile.from !== currentPlayerId
                    ) {



                        //if (calculateDistance(projectileX, projectileY, projectileZ, playerX, playerY, playerZ) < collisionRange && currentProjectile.from !== currentPlayerId) {
                        firebase.database().ref(`projectiles/${id}`).remove();

                        // console.log("hit");
                        currentPlayerRef.update({
                            health: currentPlayer.health - 5,
                        })

                        // should be 0 but idk
                        if (currentPlayer.health <= 5){
                            playerElements[currentPlayerId].remove();
                            currentPlayerRef.remove();
                        }

                        flag = true;
                        break; // so that loop doesnt continue unneccessarily
                    }
                }
            }

            if (flag == false){
                setTimeout(
                    function () { moveBullet(id) },
                    timeout
                );
            }
        }
    }

    function updateInfoTag() {
        for (let key in players){
            let currentPlayer = players[key];
            if (currentPlayer !== undefined && key !== playerId){
                let id = currentPlayer.id;
                let currentPlayerRef = firebase.database().ref(`players/${id}`);
                let tagX = currentPlayer.position.x;
                let tagZ = currentPlayer.position.z;

                let userX = players[playerId].position.x;
                let userZ = players[playerId].position.z;

                let longitude = userX - tagX;
                let latitude = userZ - tagZ;

                let angle = 0;
                if (longitude !== 0 && latitude !== 0){
                    if (latitude > 0){
                        angle = atanInDegrees(longitude, latitude);
                    } else if (latitude < 0){
                        angle = 180 + atanInDegrees(longitude, latitude);
                    }
                }

                nameTagAngles[key] = angle;
            }
        }
    }

    function refill() {
        if (players[playerId] !== undefined) {
            if (players[playerId].ammo < 10){
                playerRef.update({
                    ammo: players[playerId].ammo + 1,
                })

                if (players[playerId].ammo > 0) {
                    rig.querySelector("a-cursor").innerHTML = '';
                }
            }
        }
        setTimeout(refill, 1000);
    }

    function initGame() {
        refill(); // refill ammo

        // when user moves or rotates, works better than keydown idk why
        new KeyPressListener("KeyW", () => handleArrowPress());
        new KeyPressListener("KeyS", () => handleArrowPress());
        new KeyPressListener("KeyA", () => handleArrowPress());
        new KeyPressListener("KeyD", () => handleArrowPress());
        new KeyPressListener("ArrowUp", () => handleArrowPress());
        new KeyPressListener("ArrowDown", () => handleArrowPress());
        new KeyPressListener("ArrowLeft", () => handleArrowPress());
        new KeyPressListener("ArrowRight", () => handleArrowPress());
        document.addEventListener("mousemove", handleMouseMove);
        new KeyHoldListener("Space", () => createBullet());

        // references to all players and coins
        const allPlayersRef = firebase.database().ref(`players`);
        const allProjectilesRef = firebase.database().ref(`projectiles`);

        // when changes are made DOM
        // when new node is added
        // remove when disconnect

        allPlayersRef.on("value", (snapshot) => {
            players = snapshot.val() || {};
            for (const key in players) {
                const characterState = players[key];
                let element = playerElements[key];

                if (key === playerId){
                    document.getElementById("health-value").innerHTML = `Health: ${characterState.health}`;
                    document.getElementById("healthbar").style.width = `${characterState.health}%`;
                    document.getElementById("healthbar-red").style.width = `${characterState.health}%`;

                    if (characterState.health > 50){
                        document.getElementById("healthbar").style.backgroundColor = "#16A800FF";
                    } else if (characterState.health > 25){
                        document.getElementById("healthbar").style.backgroundColor = "#A8A500FF";
                    } else {
                        document.getElementById("healthbar").style.backgroundColor = "#A80000FF";
                    }

                    if (characterState.health <= 0){
                        scene.remove();
                        document.getElementById("game-container").remove();
                        document.getElementById("game-over-container").style.display = "inline-block";
                        document.getElementById("message").innerHTML = message2;
                    }

                    document.getElementById("ammo-value").innerHTML = `Ammo: ${characterState.ammo}`;
                }

                if (key !== playerId){
                    element.querySelector('#infoTagEntity').setAttribute("rotation", {
                        x: 0,
                        y: nameTagAngles[key],
                        z: 0
                    })
                    element.querySelector('#infoTagEntity').querySelector('#name').setAttribute("value", characterState.name);
                    element.querySelector('#infoTagEntity').querySelector('#health').setAttribute("value", characterState.health + "%");

                    element.setAttribute("position", {
                        x: characterState.position.x,
                        y: characterState.position.y,
                        z: characterState.position.z,
                    });
                    element.querySelector('#headEntity').setAttribute("rotation", {
                        x: characterState.rotation.x,
                        y: characterState.rotation.y,
                        z: characterState.rotation.z,
                    });
                    element.querySelector('#bodyEntity').setAttribute("rotation", {
                        x: 0,
                        y: characterState.rotation.y,
                        z: characterState.rotation.z,
                    });
                }
            }
        })
        allPlayersRef.on("child_added", (snapshot) => {
            const addedPlayer = snapshot.val();

            let characterEntity = document.createElement("a-entity");
            characterEntity.setAttribute("position", {
                x: addedPlayer.position.x,
                y: addedPlayer.position.y,
                z: addedPlayer.position.z,
            });

            // ========================================================================================

            let headEntity = document.createElement("a-entity");
            headEntity.setAttribute("id", "headEntity");
            headEntity.setAttribute("scale", {x: 0.5, y: 0.5, z: 0.5,});
            headEntity.setAttribute("rotation", {
                x: addedPlayer.rotation.x,
                y: addedPlayer.rotation.y,
                z: addedPlayer.rotation.z,
            });

            let head1 = document.createElement("a-box");
            head1.setAttribute("color", "tan");
            head1.setAttribute("width", 0.8);
            head1.setAttribute("height", 0.5);
            head1.setAttribute("shader", "flat");
            headEntity.append(head1);

            let head2 = document.createElement("a-box");
            head2.setAttribute("color", "tan");
            head2.setAttribute("depth", 0.8);
            head2.setAttribute("height", 0.5);
            head2.setAttribute("shader", "flat");
            headEntity.append(head2);

            let headCorner1 = document.createElement("a-cylinder");
            headCorner1.setAttribute("color", "tan");
            headCorner1.setAttribute("radius", 0.1);
            headCorner1.setAttribute("height", 0.5);
            headCorner1.setAttribute("shader", "flat");
            headCorner1.setAttribute("position", {x: 0.4, y: 0, z: 0.4});
            headEntity.append(headCorner1);

            let headCorner2 = document.createElement("a-cylinder");
            headCorner2.setAttribute("color", "tan");
            headCorner2.setAttribute("radius", 0.1);
            headCorner2.setAttribute("height", 0.5);
            headCorner2.setAttribute("shader", "flat");
            headCorner2.setAttribute("position", {x: -0.4, y: 0, z: 0.4});
            headEntity.append(headCorner2);

            let headCorner3 = document.createElement("a-cylinder");
            headCorner3.setAttribute("color", "tan");
            headCorner3.setAttribute("radius", 0.1);
            headCorner3.setAttribute("height", 0.5);
            headCorner3.setAttribute("shader", "flat");
            headCorner3.setAttribute("position", {x: 0.4, y: 0, z: -0.4});
            headEntity.append(headCorner3);

            let headCorner4 = document.createElement("a-cylinder");
            headCorner4.setAttribute("color", "tan");
            headCorner4.setAttribute("radius", 0.1);
            headCorner4.setAttribute("height", 0.5);
            headCorner4.setAttribute("shader", "flat");
            headCorner4.setAttribute("position", {x: -0.4, y: 0, z: -0.4});
            headEntity.append(headCorner4);

            let eye1 = document.createElement("a-cylinder");
            eye1.setAttribute("color", "black");
            eye1.setAttribute("radius", 0.05);
            eye1.setAttribute("height", 0.1);
            eye1.setAttribute("shader", "flat");
            eye1.setAttribute("rotation", {x: 90, y: 0, z: 0});
            eye1.setAttribute("position", {x: -0.25, y: 0.1, z: -0.46});
            headEntity.append(eye1);

            let eye2 = document.createElement("a-cylinder");
            eye2.setAttribute("color", "black");
            eye2.setAttribute("radius", 0.05);
            eye2.setAttribute("height", 0.1);
            eye1.setAttribute("shader", "flat");
            eye2.setAttribute("rotation", {x: 90, y: 0, z: 0});
            eye2.setAttribute("position", {x: 0.25, y: 0.1, z: -0.46});
            headEntity.append(eye2);

            let mouth = document.createElement("a-box");
            mouth.setAttribute("color", "black");
            mouth.setAttribute("width", 0.7);
            mouth.setAttribute("height", 0.05);
            mouth.setAttribute("depth", 0.1);
            mouth.setAttribute("shader", "flat");
            mouth.setAttribute("position", {x: 0, y: -0.05, z: -0.46});
            headEntity.append(mouth);

            let hair1 = document.createElement("a-box");
            hair1.setAttribute("color", "black");
            hair1.setAttribute("width", 1.05);
            hair1.setAttribute("height", 0.3);
            hair1.setAttribute("depth", 0.925);
            hair1.setAttribute("shader", "flat");
            hair1.setAttribute("position", {x: 0, y: 0.35, z: 0.0625});
            headEntity.append(hair1);

            let hair2 = document.createElement("a-box");
            hair2.setAttribute("color", "black");
            hair2.setAttribute("width", 0.925);
            hair2.setAttribute("height", 0.3);
            hair2.setAttribute("depth", 1.05);
            hair2.setAttribute("shader", "flat");
            hair2.setAttribute("position", {x: 0, y: 0.35, z: 0});
            headEntity.append(hair2);

            let hair3 = document.createElement("a-box");
            hair3.setAttribute("color", "black");
            hair3.setAttribute("width", 1.05);
            hair3.setAttribute("height", 0.3);
            hair3.setAttribute("depth", 0.5);
            hair3.setAttribute("shader", "flat");
            hair3.setAttribute("position", {x: 0, y: 0.1, z: 0.275});
            headEntity.append(hair3);

            let hairCorner1 = document.createElement("a-cylinder");
            hairCorner1.setAttribute("color", "black");
            hairCorner1.setAttribute("radius", 0.125);
            hairCorner1.setAttribute("height", 0.3);
            hairCorner1.setAttribute("depth", 0.5);
            hairCorner1.setAttribute("shader", "flat");
            hairCorner1.setAttribute("position", {x: 0.4, y: 0.35, z: -0.4});
            headEntity.append(hairCorner1);

            let hairCorner2 = document.createElement("a-cylinder");
            hairCorner2.setAttribute("color", "black");
            hairCorner2.setAttribute("radius", 0.125);
            hairCorner2.setAttribute("height", 0.3);
            hairCorner2.setAttribute("depth", 0.5);
            hairCorner2.setAttribute("shader", "flat");
            hairCorner2.setAttribute("position", {x: -0.4, y: 0.35, z: -0.4});
            headEntity.append(hairCorner2);

            characterEntity.append(headEntity);

            // ========================================================================================

            let bodyEntity = document.createElement("a-entity");
            bodyEntity.setAttribute("id", "bodyEntity");
            bodyEntity.setAttribute("scale", {x: 0.5, y: 0.5, z: 0.5});
            bodyEntity.setAttribute("position", {x: 0, y: -0.35, z: 0});
            bodyEntity.setAttribute("rotation", {
                x: 0,
                y: addedPlayer.rotation.y,
                z: addedPlayer.rotation.z,
            });

            let body = document.createElement("a-box");
            body.setAttribute("shader", "flat");
            body.setAttribute("color", "red");
            body.setAttribute("width", 1.05);
            body.setAttribute("height", 0.75);
            body.setAttribute("depth", 1.05);
            bodyEntity.append(body);

            let apron1 = document.createElement("a-box");
            apron1.setAttribute("shader", "flat");
            apron1.setAttribute("color", "#D9E2E6");
            apron1.setAttribute("width", 1);
            apron1.setAttribute("height", 0.6);
            apron1.setAttribute("depth", 0.05);
            apron1.setAttribute("position", {x: 0, y: 0, z: -0.51});
            bodyEntity.append(apron1);

            let apron2 = document.createElement("a-box");
            apron2.setAttribute("shader", "flat");
            apron2.setAttribute("color", "#D9E2E6");
            apron2.setAttribute("width", 1.075);
            apron2.setAttribute("height", 0.05);
            apron2.setAttribute("depth", 1.075);
            bodyEntity.append(apron2);

            let button1 = document.createElement("a-cylinder");
            button1.setAttribute("shader", "flat");
            button1.setAttribute("color", "black");
            button1.setAttribute("radius", 0.05);
            button1.setAttribute("height", 0.1);
            button1.setAttribute("rotation", {x: 90, y: 0, z: 0});
            button1.setAttribute("position", {x: 0.3, y: 0.15, z: -0.5});
            bodyEntity.append(button1);

            let button2 = document.createElement("a-cylinder");
            button2.setAttribute("shader", "flat");
            button2.setAttribute("color", "black");
            button2.setAttribute("radius", 0.05);
            button2.setAttribute("height", 0.1);
            button2.setAttribute("rotation", {x: 90, y: 0, z: 0});
            button2.setAttribute("position", {x: -0.3, y: 0.15, z: -0.5});
            bodyEntity.append(button2);

            let button3 = document.createElement("a-cylinder");
            button3.setAttribute("shader", "flat");
            button3.setAttribute("color", "black");
            button3.setAttribute("radius", 0.05);
            button3.setAttribute("height", 0.1);
            button3.setAttribute("rotation", {x: 90, y: 0, z: 0});
            button3.setAttribute("position", {x: 0.3, y: -0.15, z: -0.5});
            bodyEntity.append(button3);

            let button4 = document.createElement("a-cylinder");
            button4.setAttribute("shader", "flat");
            button4.setAttribute("color", "black");
            button4.setAttribute("radius", 0.05);
            button4.setAttribute("height", 0.1);
            button4.setAttribute("rotation", {x: 90, y: 0, z: 0});
            button4.setAttribute("position", {x: -0.3, y: -0.15, z: -0.5});
            bodyEntity.append(button4);

            // ========================================================================================

            characterEntity.append(bodyEntity);

            if (addedPlayer.id !== playerId) {
                let infoTagEntity = document.createElement("a-entity");
                infoTagEntity.setAttribute("id", "infoTagEntity");
                infoTagEntity.setAttribute("position", {x: 0, y: 0.4, z: 0});

                let name = document.createElement("a-text");
                name.setAttribute("id", "name");
                name.setAttribute("value", addedPlayer.name);
                name.setAttribute("color", "black");
                name.setAttribute("position", {x: -0.3, y: 0.225, z: 0});
                infoTagEntity.append(name);

                let health = document.createElement("a-text");
                health.setAttribute("id", "health");
                health.setAttribute("value", addedPlayer.health + "%");
                health.setAttribute("color", "black");
                health.setAttribute("position", {x: -0.3, y: 0, z: 0});
                infoTagEntity.append(health);

                characterEntity.append(infoTagEntity);
            }

            playerElements[addedPlayer.id] = characterEntity;
            scene.appendChild(characterEntity);
        })
        allPlayersRef.on("child_removed", (snapshot) => {
            const id = snapshot.val().id;
            scene.remove(playerElements[id]);
            delete playerElements[id];
        })

        allProjectilesRef.on("value", (snapshot) => {
            projectiles = snapshot.val() || {};
            for (const key in projectiles) {
                const projectileState = projectiles[key];
                let element = projectileElements[key];

                element.setAttribute("position", {
                    x: projectileState.position.x,
                    y: projectileState.position.y,
                    z: projectileState.position.z,
                });
            }
        })
        allProjectilesRef.on("child_added", (snapshot) => {
            const addedProjectile = snapshot.val();

            const projectileModel = document.createElement("a-cylinder");
            projectileModel.setAttribute("radius", 0.05);
            projectileModel.setAttribute("height", 0.05);
            projectileModel.setAttribute("shader","flat");
            projectileModel.setAttribute("color", "#1C2F22");

            const rice = document.createElement("a-cylinder");
            rice.setAttribute("radius", 0.045);
            rice.setAttribute("height", 0.055);
            rice.setAttribute("shader","flat");
            rice.setAttribute("color", "white");
            projectileModel.append(rice)

            const stuff = document.createElement("a-cylinder");
            stuff.setAttribute("radius", 0.02);
            stuff.setAttribute("height", 0.06);
            stuff.setAttribute("shader","flat");
            stuff.setAttribute("color", "#DA8463");
            projectileModel.append(stuff)


            projectileModel.setAttribute("position",{
                x: addedProjectile.position.x,
                y: addedProjectile.position.y,
                z: addedProjectile.position.z,
            });
            projectileModel.setAttribute("rotation",{
                x: rig.getAttribute("rotation").x - 90,
                y: rig.getAttribute("rotation").y + 45,
                z: rig.getAttribute("rotation").z,
            });

            projectileElements[addedProjectile.id] = projectileModel;
            scene.appendChild(projectileModel);
        })
        allProjectilesRef.on("child_removed", (snapshot) => {
            const id = snapshot.val().id;
            scene.remove(projectileElements[id]);
            delete projectileElements[id];
        })

        // name tag change
        playerNameInput.addEventListener("change", (e) => {
            const newName = e.target.value;
            playerNameInput.value = newName;
            // only update keys given
            playerRef.update({
                name: newName,
            });
        })
    }

    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            playerId = user.uid;
            playerRef = firebase.database().ref(`players/${playerId}`);
            let health = 100;
            let position = {
                x: rig.getAttribute("position").x,
                y: rig.getAttribute("position").y,
                z: rig.getAttribute("position").z,
            }
            let rotation = {
                x: rig.getAttribute("rotation").x,
                y: rig.getAttribute("rotation").y,
                z: rig.getAttribute("rotation").z,
            }

            playerRef.set({
                id: playerId,
                name: playerNameInput.value,
                health,
                ammo: 10,
                position,
                rotation,
            })

            playerRef.onDisconnect().remove();

            //Begin the game now that we are signed in
            initGame();
        } else {
            // logged out
        }
    })
    firebase.auth().signInAnonymously().catch((error) => {
        var errorCode = error.code;
        var errorMessage = error.message;
        console.log(errorCode, errorMessage);
    })

}