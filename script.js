let hasMoved = false;

window.onload = function() {
    let playerId;                       // string of who we are logged in as
    let playerRef;                      // firebase ref
    let players = {};               // local list of state where every character is
    let playerElements = {};        // house player elements
    let projectiles = {};
    let projectileElements = {};
    let nameTagAngles = {};

    let scene = document.querySelector("a-scene");
    const playerNameInput = document.querySelector("#player-name");

    let rig = document.getElementById("camera");
    rig.setAttribute("position", { x: getSpawnXPoint(), y: 10, z: Math.random() * (3.25 - (-3.25)) + (-3.25) });
    rig.setAttribute("rotation", { x: 0, y: Math.floor(Math.random() * 360), z: 0 });
    rig.components["look-controls"].yawObject.rotation.y = rig.getAttribute("rotation").y * Math.PI / 180;

    function handleArrowPress() {
        if (players[playerId] !== undefined) {
            document.getElementById("instruction-card").style.display = "none";
            hasMoved = true;

            players[playerId].position.x = rig.getAttribute("position").x;
            players[playerId].position.y = rig.getAttribute("position").y;
            players[playerId].position.z = rig.getAttribute("position").z;

        }
    }

    function handleMouseMove() {
        if (players[playerId] !== undefined) {
            players[playerId].rotation.x = rig.getAttribute("rotation").x;
            players[playerId].rotation.y = rig.getAttribute("rotation").y;
            players[playerId].rotation.z = rig.getAttribute("rotation").z;
        }
    }

    function updateInfoTag() {
        for (let key in players){
            let currentPlayer = players[key];
            if (currentPlayer !== undefined && key !== playerId){
                let id = currentPlayer.id;
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

    let count = 0;
    function createBullet() {

        let alert = document.createElement("a-text");
        alert.setAttribute("value", "No ammo");
        alert.setAttribute("color", "white");
        alert.setAttribute("scale", { x: 0.065, y: 0.065, z: 0.065 });
        alert.setAttribute("position", {x: 0.01, y: 0, z: 0.75 });

        if (hasMoved) {
            if (players[playerId].ammo > 0) {
                playerElements[playerId].playThrowSound();

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

                // moveBullet(uniqueId);

            } else {
                rig.querySelector("a-cursor").append(alert);
            }
        }
    }

    function moveBullet(currentProjectile, projectileRef, magnitude) {
        if (currentProjectile !== undefined) {

            // velocity
            let dx = sinInDegrees(currentProjectile.rotation.y);
            let dy = sinInDegrees(currentProjectile.rotation.x);
            let dz = cosInDegrees(currentProjectile.rotation.y);

            // move, direct set
            // let magnitude = 15; //smoothness, more is slower, laggier, also affects speed so balance
            currentProjectile.position.x -= dx / magnitude;
            currentProjectile.position.y += dy / magnitude;
            currentProjectile.position.z -= dz / magnitude;

            projectileRef.set(currentProjectile);
        }
    }

    function bulletCollision(currentProjectile, projectileRef) {
        if (currentProjectile !== undefined) {

            // out of bounds
            if (Math.abs(currentProjectile.position.x) >= 4 ||
                Math.abs(currentProjectile.position.z) >= 5.5 ||
                currentProjectile.position.y <= -0.65 ||
                currentProjectile.position.y >= 1.75) {

                projectileRef.remove();
            }

            // pillars
            pillarCollision(currentProjectile, projectileRef, 1.9,  0);
            pillarCollision(currentProjectile, projectileRef, -1.9,  0);

            // tables
            tableCollision(currentProjectile, projectileRef, -1.75, 2);
            tableCollision(currentProjectile, projectileRef, 1.75, -2);
            tableCollision(currentProjectile, projectileRef, -1.75, -2);
            tableCollision(currentProjectile, projectileRef, 1.75, 2);

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

                    if (projectileX > (playerX - 0.275) && projectileX < (playerX + 0.275) &&
                        projectileY > (playerY + 0.275 - 0.8) && projectileY < (playerY + 0.275) &&
                        projectileZ > (playerZ - 0.275) && projectileZ < (playerZ + 0.275) &&
                        currentProjectile.from !== currentPlayerId
                    ) {
                        projectileRef.remove();

                        currentPlayerRef.update({
                            health: currentPlayer.health - 5,
                        })
                    }

                }
            }

        }
    }

    function pillarCollision(currentProjectile, projectileRef, x, z) {
        if (
            currentProjectile.position.x >= (x - 0.25) && currentProjectile.position.x <= (x + 0.25) &&
            currentProjectile.position.z >= (z - 0.25) && currentProjectile.position.z <= (z + 0.25)
        ) {
            projectileRef.remove();
        }
    }

    function tableCollision(currentProjectile, projectileRef, x, z) {
        if (
            currentProjectile.position.x >= (x - 0.75) && currentProjectile.position.x <= (x + 0.75) &&
            currentProjectile.position.y <= (-0.35 + 0.25) &&
            currentProjectile.position.z >= (z - 0.75) && currentProjectile.position.z <= (z + 0.75)
        ) {
            projectileRef.remove();
        }
    }

    function refill() {
        if (players[playerId] !== undefined) {
            if (players[playerId].ammo < 10){
                players[playerId].ammo ++;

                if (players[playerId].ammo > 0) {
                    rig.querySelector("a-cursor").innerHTML = '';
                }
            }
        }
    }

    let refillCounter = 0;
    let milliseconds = 30;
    function loop() {

        let currentPlayer = players[playerId];
        if (currentPlayer !== undefined) {
            playerRef.set(currentPlayer);
            updateInfoTag();

            if (currentPlayer.health <= 0){
                playerRef.remove();
            }

            if (rig.getAttribute("position").y < -2) {
                location.reload();
            }
        }

        for (let key in projectiles) {
            let currentProjectile = projectiles[key];
            if (currentProjectile !== undefined) {
                let projectileRef = firebase.database().ref(`projectiles/${key}`);

                moveBullet(currentProjectile, projectileRef, 5);
                bulletCollision(currentProjectile, projectileRef);
            }
        }

        refillCounter ++;
        if (refillCounter >= (1000 / milliseconds)) {
            refill();
            refillCounter = 0;
        }

        setTimeout(loop, milliseconds);
    }

    function initGame() {
        loop();

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

        let currentHealth = 100;

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

                    if (characterState.health != currentHealth) {
                        playerElements[playerId].playHurtSound();
                    }

                    currentHealth = characterState.health;

                    if (characterState.health <= 0){
                        scene.remove();
                        document.getElementById("game-container").remove();
                        document.getElementById("game-over-container").style.display = "inline-block";
                    } else {
                        document.getElementById("ammo-value").innerHTML = `Ammo: ${characterState.ammo}`;
                    }

                } else {
                    element.updateTagAngle(nameTagAngles[key]);
                    element.updateTagName(characterState.name);
                    element.updateTagHealth(characterState.health);
                    element.updatePosition(characterState.position.x, characterState.position.y, characterState.position.z);
                    element.updateHeadRotation(characterState.rotation.x, characterState.rotation.y, characterState.rotation.z);
                    element.updateBodyRotation(characterState.rotation.y, characterState.rotation.z);
                }
            }
        })
        allPlayersRef.on("child_added", (snapshot) => {
            const addedPlayer = snapshot.val();

            let model= new Character(
                addedPlayer.position.x,
                addedPlayer.position.y,
                addedPlayer.position.z,
                addedPlayer.rotation.x,
                addedPlayer.rotation.y,
                addedPlayer.rotation.z,
                addedPlayer.id,
                addedPlayer.name,
                addedPlayer.health,
                playerId
            );

            playerElements[addedPlayer.id] = model;
            scene.append(model.characterEntity);
        })
        allPlayersRef.on("child_removed", (snapshot) => {
            const id = snapshot.val().id;
            scene.remove(playerElements[id].characterEntity);
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
            delete projectiles[id];
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