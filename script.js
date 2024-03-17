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

window.onload = function() {
    let playerId; // string of who we are logged in as
    let playerRef; // firebase ref
    let players = {}; // local list of state where every character is
    let playerElements = {}; // house player elements
    let projectiles = {};
    let projectileElements = {};

    let scene = document.querySelector("a-scene");
    let rig = document.getElementById("rig");
    rig.setAttribute("position", {x:0,y:0.5,z:0});
    const playerNameInput = document.querySelector("#player-name");

    function handleArrowPress() {
        players[playerId].position.x = rig.getAttribute("position").x;
        players[playerId].position.y = rig.getAttribute("position").y;
        players[playerId].position.z = rig.getAttribute("position").z;
        playerRef.set(players[playerId]); // causes value listener to fire
    }
    function handleMouseMove() {
        players[playerId].rotation.x = rig.getAttribute("rotation").x;
        players[playerId].rotation.y = rig.getAttribute("rotation").y;
        players[playerId].rotation.z = rig.getAttribute("rotation").z;
        playerRef.set(players[playerId]);
    }

    let count = 0; // ain't no way this going over 9007199254740991
    function createBullet() {
        let position = {
            x: players[playerId].position.x,
            y: players[playerId].position.y,
            z: players[playerId].position.z
        }
        let rotation = {
            x: players[playerId].rotation.x,
            y: players[playerId].rotation.y,
            z: players[playerId].rotation.z
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
        let id = currentProjectile.id;
        let projectileRef = firebase.database().ref(`projectiles/${id}`);

        // velocity
        let magnitude = 15;
        let dx = sinInDegrees(currentProjectile.rotation.y) / magnitude;
        let dy = sinInDegrees(currentProjectile.rotation.x) / magnitude;
        let dz = cosInDegrees(currentProjectile.rotation.y) / magnitude;

        // move, direct set
        currentProjectile.position.x -= dx;
        currentProjectile.position.y += dy;
        currentProjectile.position.z -= dz;
        projectileRef.set(projectiles[id]);

        // out of bounds and collisions
        let range = 4;
        if (Math.abs(currentProjectile.position.x) >= range || Math.abs(currentProjectile.position.y) >= range || Math.abs(currentProjectile.position.z) >= range) {
            firebase.database().ref(`projectiles/${id}`).remove();
        }

        let projectileX = currentProjectile.position.x;
        let projectileY = currentProjectile.position.y;
        let projectileZ = currentProjectile.position.z;

        for (let playerKey in players) {
            let currentPlayer = players[playerKey];
            let currentPlayerId = currentPlayer.id;
            let playerRef = firebase.database().ref(`players/${currentPlayerId}`);
            let playerX = currentPlayer.position.x;
            let playerY = currentPlayer.position.y;
            let playerZ = currentPlayer.position.z;

            if (calculateDistance(projectileX, projectileY, projectileZ, playerX, playerY, playerZ) < 0.3 && currentProjectile.from !== currentPlayerId) {
                firebase.database().ref(`projectiles/${id}`).remove();
                playerRef.update({
                    health: currentPlayer.health - 1,
                })
            }

            setTimeout(function () {
                moveBullet(projectileKey);
            }, 30);
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
        new KeyHoldListener("Space", () => createBullet());
        document.addEventListener("mousemove", handleMouseMove);

        // references to all players and coins
        const allPlayersRef = firebase.database().ref(`players`);
        const allProjectilesRef = firebase.database().ref(`projectiles`);

        // when changes are made
        allPlayersRef.on("value", (snapshot) => {
            players = snapshot.val() || {};
            for (const key in players) {
                const characterState = players[key];
                let element = playerElements[key];

                element.setAttribute("position", {
                    x: characterState.position.x,
                    y: characterState.position.y,
                    z: characterState.position.z,
                });
                element.setAttribute("rotation", {
                    x: characterState.rotation.x,
                    y: characterState.rotation.y,
                    z: characterState.rotation.z,
                });
            }
        })
        // when new node is added
        allPlayersRef.on("child_added", (snapshot) => {
            const addedPlayer = snapshot.val();

            const characterModel = document.createElement("a-box");
            characterModel.setAttribute("height", 0.33);
            characterModel.setAttribute("width", 0.33);
            characterModel.setAttribute("depth", 0.33);
            characterModel.setAttribute("color","white");
            characterModel.setAttribute("position",{
                x: addedPlayer.positionX,
                y: addedPlayer.positionY,
                z: addedPlayer.positionZ,
            });
            characterModel.setAttribute("rotation",{
                x: addedPlayer.rotationX,
                y: addedPlayer.rotationY,
                z: addedPlayer.rotationZ,
            });

                let smile = document.createElement("a-box");
                smile.setAttribute("src", "img.png");
                smile.setAttribute("height", 0.295);
                smile.setAttribute("width", 0.295);
                smile.setAttribute("depth", 0.295);
                smile.setAttribute("position",{
                    x: 0,
                    y: 0,
                    z: -0.02,
                });
                characterModel.append(smile);

            playerElements[addedPlayer.id] = characterModel;
            scene.appendChild(characterModel);
        })
        // remove when disconnect
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

            const projectileModel = document.createElement("a-sphere");
            projectileModel.setAttribute("radius", 0.05);
            projectileModel.setAttribute("color", "red");

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
            // logged in
            playerId = user.uid;
            playerRef = firebase.database().ref(`players/${playerId}`);
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
                health: 100,
                position,
                rotation,
            })

            //Remove me from Firebase when I disconnect
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