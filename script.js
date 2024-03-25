function calculateDistance(x1, y1, z1, x2, y2, z2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const dz = z2 - z1;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
}
function sinInDegrees(angleInDegrees) {
    return Math.sin(angleInDegrees * Math.PI / 180);
}
function cosInDegrees(angleInDegrees) {
    const angleInRadians = angleInDegrees * Math.PI / 180;
    return Math.cos(angleInRadians);
}
function atanInDegrees(y, x) {
    // Convert from degrees to radians
    const angleInRadians = Math.atan(y / x);

    // Convert from radians to degrees
    const angleInDegrees = angleInRadians * 180 / Math.PI;

    return angleInDegrees;
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
    let rig = document.getElementById("rig");
    rig.setAttribute("position", {
        x: Math.random() * (3.25 - (-3.25)) + (-3.25),
        y: 0.5,
        z: Math.random() * (3.25 - (-3.25)) + (-3.25)
    });
    let long = 0 - rig.getAttribute("position").x;
    let lat = 0 - rig.getAttribute("position").z;
    console.log(atanInDegrees(long, lat));

    rig.setAttribute("rotation", {
        x: 0,
        y: Math.floor(Math.random() * 360),
        z: 0
    });

    rig.components["look-controls"].yawObject.rotation.y = rig.getAttribute("rotation").y * Math.PI / 180;

    const playerNameInput = document.querySelector("#player-name");

    function handleArrowPress() {
        if (players[playerId] !== undefined) {
            updateInfoTag();
            players[playerId].position.x = rig.getAttribute("position").x;
            players[playerId].position.y = rig.getAttribute("position").y;
            players[playerId].position.z = rig.getAttribute("position").z;
            console.log("move");
            playerRef.set(players[playerId]);
        }
    }
    function handleMouseMove() {
        if (players[playerId] !== undefined) {
            updateInfoTag();
            players[playerId].rotation.x = rig.getAttribute("rotation").x;
            players[playerId].rotation.y = rig.getAttribute("rotation").y;
            players[playerId].rotation.z = rig.getAttribute("rotation").z;
            console.log("move");
            playerRef.set(players[playerId]);
        }
    }

    let count = 0; // ain't no way this going over 9007199254740991
    function createBullet() {
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

        count ++;
        moveBullet(uniqueId);
    }

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
            let magnitude = 30; //smoothness, more is slower, laggier, also affects speed so balance
            let timeout = 10; // speed, lower - faster
            currentProjectile.position.x -= dx / magnitude;
            currentProjectile.position.y += dy / magnitude;
            currentProjectile.position.z -= dz / magnitude;
            projectileRef.set(projectiles[id]);

            // out of bounds and collisions
            let range = 4;
            if (
                Math.abs(currentProjectile.position.x) >= range ||
                Math.abs(currentProjectile.position.y) >= range ||
                Math.abs(currentProjectile.position.z) >= range
            ) {
                firebase.database().ref(`projectiles/${id}`).remove();
                // console.log("out of bounds");
            }

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

                    if (calculateDistance(projectileX, projectileY, projectileZ, playerX, playerY, playerZ) < 0.25 && currentProjectile.from !== currentPlayerId) {
                        firebase.database().ref(`projectiles/${id}`).remove();

                        console.log("hit");
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

    function initGame() {

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


        updateInfoTag(); // for initial load

        // when changes are made DOM
        // when new node is added
        // remove when disconnect

        allPlayersRef.on("value", (snapshot) => {
            players = snapshot.val() || {};
            for (const key in players) {
                const characterState = players[key];
                let element = playerElements[key];

                if (key === playerId){
                    document.getElementById("currentHealth").innerHTML = "Health: " + (characterState.health).toString() + "%";

                    if (characterState.health <= 0){
                        scene.remove();
                        document.getElementById("currentHealth").remove();
                        document.getElementById("player-name-container").remove();
                        document.getElementById("instructions").remove();
                        document.getElementById("end").style.display = "inline-block";
                    }
                }

                if (key !== playerId){
                    element.querySelector('a-entity').setAttribute("rotation", {
                        x: 0,
                        y: nameTagAngles[key],
                        z: 0
                    })
                    element.querySelector('a-entity').querySelector('#name').setAttribute("value", characterState.name);
                    element.querySelector('a-entity').querySelector('#health').setAttribute("value", characterState.health + "%");

                }

                element.setAttribute("position", {
                    x: characterState.position.x,
                    y: characterState.position.y,
                    z: characterState.position.z,
                });
                element.querySelector('a-box').setAttribute("rotation", {
                    x: characterState.rotation.x,
                    y: characterState.rotation.y,
                    z: characterState.rotation.z,
                });
            }
        })
        allPlayersRef.on("child_added", (snapshot) => {
            const addedPlayer = snapshot.val();

            const characterEntity = document.createElement("a-entity");
            characterEntity.setAttribute("position",{
                x: addedPlayer.position.x,
                y: addedPlayer.position.y,
                z: addedPlayer.position.z,
            });

            const characterModel = document.createElement("a-box");
            characterModel.setAttribute("height", 0.5);
            characterModel.setAttribute("width", 0.5);
            characterModel.setAttribute("depth", 0.5);
            characterModel.setAttribute("color","#333536");
            characterModel.setAttribute("shader","flat");
            characterModel.setAttribute("rotation",{
                x: addedPlayer.rotation.x,
                y: addedPlayer.rotation.y,
                z: addedPlayer.rotation.z,
            });

            let smile = document.createElement("a-box");
            smile.setAttribute("src", "img_1.png");
            smile.setAttribute("height", 0.495);
            smile.setAttribute("width", 0.495);
            smile.setAttribute("depth", 0.495);
            smile.setAttribute("shader","flat");
            smile.setAttribute("position",{
                x: 0,
                y: 0,
                z: -0.005,
            });

            characterModel.append(smile);
            characterEntity.append(characterModel)

            if (addedPlayer.id !== playerId) {
                let infoTagEntity = document.createElement("a-entity");

                let name = document.createElement("a-text");
                name.setAttribute("id", "name");
                name.setAttribute("value", addedPlayer.name);
                name.setAttribute("color", "black");
                name.setAttribute("position", {
                    x: -0.3,
                    y: 0.675,
                    z: 0,
                });
                infoTagEntity.append(name);

                let health = document.createElement("a-text");
                health.setAttribute("id", "health");
                health.setAttribute("value", addedPlayer.health + "%");
                health.setAttribute("color", "black");
                health.setAttribute("position", {
                    x: -0.3,
                    y: 0.45,
                    z: 0,
                });
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

                element.setAttribute("position",{
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
    });

}