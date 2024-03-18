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

    let scene = document.querySelector("a-scene");
    let rig = document.getElementById("rig");
    rig.setAttribute("position", {x:0,y:0.5,z:0});
    const playerNameInput = document.querySelector("#player-name");

    function handleArrowPress() {
        if (players[playerId] !== undefined) {
            players[playerId].position.x = rig.getAttribute("position").x;
            players[playerId].position.y = rig.getAttribute("position").y;
            players[playerId].position.z = rig.getAttribute("position").z;
            playerRef.set(players[playerId]);
        }
    }
    function handleMouseMove() {
        if (players[playerId] !== undefined) {
            players[playerId].rotation.x = rig.getAttribute("rotation").x;
            players[playerId].rotation.y = rig.getAttribute("rotation").y;
            players[playerId].rotation.z = rig.getAttribute("rotation").z;
            playerRef.set(players[playerId]);
        }
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
        if (currentProjectile !== undefined) {
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
                let currentPlayerId = currentPlayer.id;
                let currentplayerRef = firebase.database().ref(`players/${currentPlayerId}`);
                let playerX = currentPlayer.position.x;
                let playerY = currentPlayer.position.y;
                let playerZ = currentPlayer.position.z;

                //let infoTagRef = firebase.database().ref(`infoTags/${currentPlayerId}`);

                if (calculateDistance(projectileX, projectileY, projectileZ, playerX, playerY, playerZ) < 0.3 && currentProjectile.from !== currentPlayerId) {
                    firebase.database().ref(`projectiles/${id}`).remove();
                    gotHit(currentPlayerId);
                    console.log("After2: " + currentPlayer.health);
                    break;
                }
            }

            for (let playerKey in players){
                let currentPlayer = players[playerKey];
                console.log("After3: " + currentPlayer.id + ": " + currentPlayer.health);
            }

            setTimeout(
                function () { moveBullet(id) },
                timeout
            );
        }
    }

    function gotHit(key){
        let playerHit = players[key];
        let playerHitId = playerHit.id;
        let playerHitRef = firebase.database().ref(`players/${playerHitId}`);

        console.log("Before: " + playerHit.health);
        playerHit.health --;
        console.log("After: " + playerHit.health);
        playerHitRef.set(players[playerHitId]);
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
        // when new node is added
        // remove when disconnect

        allPlayersRef.on("value", (snapshot) => {
            players = snapshot.val() || {};
            for (const key in players) {
                const characterState = players[key];
                let element = playerElements[key];

                console.log("After4: " + characterState.id + ": " + characterState.health);

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
        allPlayersRef.on("child_added", (snapshot) => {
            const addedPlayer = snapshot.val();

            const characterModel = document.createElement("a-box");
            characterModel.setAttribute("height", 0.33);
            characterModel.setAttribute("width", 0.33);
            characterModel.setAttribute("depth", 0.33);
            characterModel.setAttribute("color","white");
            characterModel.setAttribute("position",{
                x: addedPlayer.position.x,
                y: addedPlayer.position.y,
                z: addedPlayer.position.z,
            });
            characterModel.setAttribute("rotation",{
                x: addedPlayer.rotation.x,
                y: addedPlayer.rotation.y,
                z: addedPlayer.rotation.z,
            });

                // let smile = document.createElement("a-box");
                // smile.setAttribute("src", "img.png");
                // smile.setAttribute("height", 0.295);
                // smile.setAttribute("width", 0.295);
                // smile.setAttribute("depth", 0.295);
                // smile.setAttribute("position",{
                //     x: 0,
                //     y: 0,
                //     z: -0.02,
                // });
                // characterModel.append(smile);

            playerElements[addedPlayer.id] = characterModel;
            scene.appendChild(characterModel);
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

            const projectileModel = document.createElement("a-sphere");
            projectileModel.setAttribute("radius", 0.05);
            projectileModel.setAttribute("color", "red");
            projectileModel.setAttribute("position",{
                x: addedProjectile.position.x,
                y: addedProjectile.position.y,
                z: addedProjectile.position.z,
            });

            projectileElements[addedProjectile.id] = projectileModel;
            scene.appendChild(projectileModel);
        })
        allProjectilesRef.on("child_removed", (snapshot) => {
            const id = snapshot.val().id;
            scene.remove(projectileElements[id]);
            delete projectileElements[id];
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
                health: 10,
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