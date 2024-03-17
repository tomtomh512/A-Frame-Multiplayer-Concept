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
        players[playerId].positionX = rig.getAttribute("position").x;
        players[playerId].positionY = rig.getAttribute("position").y;
        players[playerId].positionZ = rig.getAttribute("position").z;
        playerRef.set(players[playerId]); // causes value listener to fire
    }
    function handleMouseMove() {
        players[playerId].rotationX = rig.getAttribute("rotation").x;
        players[playerId].rotationY = rig.getAttribute("rotation").y;
        players[playerId].rotationZ = rig.getAttribute("rotation").z;
        playerRef.set(players[playerId]); // causes value listener to createBullet
    }

    let count = 0; // ain't no way this going over 9007199254740991
    function createBullet() {
        const {x, y, z} = {x: players[playerId].positionX, y: players[playerId].positionY, z: players[playerId].positionZ}
        const {rx, ry, rz} = {rx: players[playerId].rotationX, ry: players[playerId].rotationY, rz: players[playerId].rotationZ}
        let uniqueId = playerId + count.toString();
        const projectileRef = firebase.database().ref(`projectiles/${uniqueId}`);

        projectileRef.set({
            id: uniqueId,
            from: playerId,
            x,
            y,
            z,
            rx,
            ry,
            rz,
        })

        count ++;
        moveBullet(uniqueId);
    }

    function moveBullet(key){
        let id = projectiles[key].id;
        let from = projectiles[key].from;
        let projectileRef = firebase.database().ref(`projectiles/${id}`);
        let dx = sinInDegrees(projectiles[key].ry);
        let dy = sinInDegrees(projectiles[key].rx);
        let dz = cosInDegrees(projectiles[key].ry);

        // move
        projectiles[key].x -= dx / 15;
        projectiles[key].y += dy / 15;
        projectiles[key].z -= dz / 15;

        projectileRef.set(projectiles[id]);

        // ofb and collisions
        let range = 4;
        if (Math.abs(projectiles[key].x) >= range || Math.abs(projectiles[key].y) >= range || Math.abs(projectiles[key].z) >= range){
            firebase.database().ref(`projectiles/${id}`).remove();
        }

        let x2 = projectiles[key].x;
        let y2 = projectiles[key].y;
        let z2 = projectiles[key].z;

        for (let player in players){
            let x1 = players[player].positionX;
            let y1 = players[player].positionY;
            let z1 = players[player].positionZ;
            let playerId = players[player].id;

            if (calculateDistance(x1, y1, z1, x2, y2, z2) < 0.3 && from !== playerId){
                firebase.database().ref(`projectiles/${id}`).remove();
            }
        }

        setTimeout(function() {
            moveBullet(key);
        }, 30);
    }

    function initGame() {
        // when user moves or rotates, works better than keydown idk why
        new KeyPressListener("KeyW", () => handleArrowPress());
        new KeyPressListener("KeyS", () => handleArrowPress());
        new KeyPressListener("KeyA", () => handleArrowPress());
        new KeyPressListener("KeyD", () => handleArrowPress());
        new KeyHoldListener("Space", () => createBullet());
        new KeyPressListener("ArrowUp", () => handleArrowPress());
        new KeyPressListener("ArrowDown", () => handleArrowPress());
        new KeyPressListener("ArrowLeft", () => handleArrowPress());
        new KeyPressListener("ArrowRight", () => handleArrowPress());
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

                // update DOM
                element.querySelector("a-text").setAttribute("value", characterState.name);

                element.setAttribute("position", {
                    x: characterState.positionX,
                    y: characterState.positionY,
                    z: characterState.positionZ,
                });
                element.setAttribute("rotation", {
                    x: characterState.rotationX,
                    y: characterState.rotationY,
                    z: characterState.rotationZ,
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

                smile = document.createElement("a-box");
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

                nameTag = document.createElement("a-text");
                nameTag.setAttribute("value", addedPlayer.name);
                nameTag.setAttribute("color", "black");
                nameTag.setAttribute("position",{
                    x: 0.0,
                    y: 0.25,
                    z: 0,
                });
                nameTag.setAttribute("rotation",{
                    x: 0,
                    y: rig.getAttribute("rotation").y - 180,
                    z: 90,
                });
                characterModel.append(nameTag);

            playerElements[addedPlayer.id] = characterModel;
            scene.appendChild(characterModel);
        })
        // remove when disconnect
        allPlayersRef.on("child_removed", (snapshot) => {
            const removedKey = snapshot.val().id;
            scene.remove(playerElements[removedKey]);
            delete playerElements[removedKey];

        })

        allProjectilesRef.on("value", (snapshot) => {
            projectiles = snapshot.val() || {};
            for (const key in projectiles) {
                const projectileState = projectiles[key];
                let element = projectileElements[key];

                element.setAttribute("position",{
                    x: projectileState.x,
                    y: projectileState.y,
                    z: projectileState.z,
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
            const key = snapshot.val();
            scene.remove(projectileElements[key.id]);
            delete projectileElements[key];
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

            playerRef.set({
                id: playerId,
                name: playerNameInput.value,
                positionX: rig.getAttribute("position").x,
                positionY: rig.getAttribute("position").y,
                positionZ: rig.getAttribute("position").z,
                rotationX: rig.getAttribute("rotation").x,
                rotationY: rig.getAttribute("rotation").y,
                rotationZ: rig.getAttribute("rotation").z,
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