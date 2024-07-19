let maxAmmo = 10; // dont forget to change in game.html as well
let refillFrequency = 0.75;

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

    // set initial conditions of rig
    let rig = document.getElementById("camera");
    rig.setAttribute("position", { x: getSpawnXPoint(), y: 0, z: Math.random() * (3.25 - (-3.25)) + (-3.25) });
    rig.setAttribute("rotation", { x: 0, y: getCameraAngle(rig.getAttribute("position").x, rig.getAttribute("position").z), z: 0 });

    // sometimes results in error
    try {
        rig.components["look-controls"].yawObject.rotation.y = rig.getAttribute("rotation").y * Math.PI / 180;
    } catch (error) {
        location.reload();
    }

    let count = 0;
    function createBullet() {

        // alert for player if no bullets
        // cannot use html element, interferes with look controls if selected
        // add font in future a-frame update
        let alert = document.createElement("a-text");
        alert.setAttribute("value", "No ammo");
        alert.setAttribute("color", "white");
        alert.setAttribute("scale", { x: 0.065, y: 0.065, z: 0.065 });
        alert.setAttribute("position", {x: 0.01, y: 0, z: 0.75 });

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

        } else {
            rig.querySelector("a-cursor").append(alert);
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
            outOfBoundsCollision(currentProjectile, projectileRef, 4, 5.5, -0.65, 1.75);

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

            // collision with players
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

                        playerElements[currentPlayerId].playHurtSound();

                        currentPlayerRef.update({
                            health: currentPlayer.health - 2,
                        })
                    }

                }
            }

        }
    }

    function refill() {
        if (players[playerId] !== undefined) {
            let current = players[playerId].ammo
            if (players[playerId].ammo < maxAmmo){
                players[playerId].ammo = current + 1;
            }
            if (players[playerId].ammo > 0) {
                rig.querySelector("a-cursor").innerHTML = '';
            }
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
                if (longitude !== 0 && latitude !== 0) {
                    if (latitude > 0) {
                        angle = atanInDegrees(longitude, latitude);
                    } else if (latitude < 0) {
                        angle = 180 + atanInDegrees(longitude, latitude);
                    }
                }

                nameTagAngles[key] = angle;
            }
        }
    }

    let refillCounter = 0;
    let milliseconds = 30;
    function loop() {

        let currentPlayer = players[playerId];
        if (currentPlayer !== undefined) {

            refillCounter ++;
            if (refillCounter >= (refillFrequency * 1000 / milliseconds)) {
                refill();
                refillCounter = 0;
            }

            // set player position and rotation to user position and rotation
            players[playerId].position.x = rig.getAttribute("position").x;
            players[playerId].position.y = rig.getAttribute("position").y;
            players[playerId].position.z = rig.getAttribute("position").z;
            players[playerId].rotation.x = rig.getAttribute("rotation").x;
            players[playerId].rotation.y = rig.getAttribute("rotation").y;
            players[playerId].rotation.z = rig.getAttribute("rotation").z;

            // dynamically change the rotation of the hitbox planes of tables
            const lonTableHitboxes = document.getElementsByClassName("lon-table-hitbox");
            const latTableHitBoxes = document.getElementsByClassName("lat-table-hitbox");
            lonTableDyn(lonTableHitboxes, players[playerId]);
            latTableDyn(latTableHitBoxes, players[playerId]);

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

        setTimeout(loop, milliseconds);
    }

    function initGame() {

        loop();
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

                // if player is the user
                if (key === playerId){
                    if (characterState.health > 0) {
                        document.getElementById("health-value").innerHTML = `Health: ${characterState.health}`;
                        document.getElementById("healthbar").style.width = `${characterState.health}%`;
                        document.getElementById("healthbar-trailing").style.width = `${characterState.health}%`;
                        document.getElementById("ammo-bar-count").style.width = `${characterState.ammo / maxAmmo * 100}%`;

                        if (characterState.health > 50){
                            document.getElementById("healthbar").style.backgroundColor = "#16A800FF";
                        } else if (characterState.health > 25){
                            document.getElementById("healthbar").style.backgroundColor = "#A8A500FF";
                        } else {
                            document.getElementById("healthbar").style.backgroundColor = "#A80000FF";
                        }
                        document.getElementById("ammo-value").innerHTML = `Ammo: ${characterState.ammo}`;
                    }

                } else {
                    element.updateTagAngle(nameTagAngles[key]);
                    element.updateTagHealth(characterState.health);
                    element.updateTagName(characterState.name);
                    element.updatePosition(characterState.position.x, characterState.position.y, characterState.position.z);
                    element.updateHeadRotation(characterState.rotation.x, characterState.rotation.y, characterState.rotation.z);
                    element.updateBodyRotation(characterState.rotation.y, characterState.rotation.z);
                }
            }
        })

        allPlayersRef.on("child_added", (snapshot) => {
            const addedPlayer = snapshot.val();
            let model= new Character(addedPlayer, playerId);

            playerElements[addedPlayer.id] = model;
            scene.append(model.characterEntity);
        })

        allPlayersRef.on("child_removed", (snapshot) => {
            const id = snapshot.val().id;

            playerElements[id].characterEntity.remove();
            if (id === playerId) {
                window.location.href = "game-over.html";
            }

            delete playerElements[id];
        })

        allProjectilesRef.on("value", (snapshot) => {
            projectiles = snapshot.val() || {};
            for (const key in projectiles) {
                const projectileState = projectiles[key];
                let element = projectileElements[key];

                element.updatePosition(projectileState.position.x, projectileState.position.y, projectileState.position.z);
            }
        })

        allProjectilesRef.on("child_added", (snapshot) => {
            const addedProjectile = snapshot.val();
            let model = new Sushi(addedProjectile);

            projectileElements[addedProjectile.id] = model;
            scene.appendChild(model.projectileModel);
        })

        allProjectilesRef.on("child_removed", (snapshot) => {
            const id = snapshot.val().id;
            projectileElements[id].projectileModel.remove();
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
                ammo: maxAmmo,
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