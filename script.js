let scene, rig;
let character;

window.onload = function() {
    let playerId; // string of who we are logged in as
    let playerRef; // firebase ref
    let players = {}; // local list of state where every character is
    let playerElements = {}; // house player elements

    scene = document.querySelector("a-scene");
    rig = document.getElementById("rig");
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
        playerRef.set(players[playerId]); // causes value listener to fire
    }

    function initGame() {

        // when user moves or rotates
        new KeyPressListener("KeyW", () => handleArrowPress())
        new KeyPressListener("KeyS", () => handleArrowPress())
        new KeyPressListener("KeyA", () => handleArrowPress())
        new KeyPressListener("KeyD", () => handleArrowPress())
        new KeyPressListener("ArrowUp", () => handleArrowPress())
        new KeyPressListener("ArrowDown", () => handleArrowPress())
        new KeyPressListener("ArrowLeft", () => handleArrowPress())
        new KeyPressListener("ArrowRight", () => handleArrowPress())
        document.addEventListener("mousemove", handleMouseMove);

        // references to all players and coins
        const allPlayersRef = firebase.database().ref(`players`);

        allPlayersRef.on("value", (snapshot) => {
            players = snapshot.val() || {};
            for (const key in players){
                const characterState = players[key];
                let element = playerElements[key];

                // update DOM
                //element[nameTag].setAttribute("value", characterState.name);
                element.setAttribute("position",{
                    x: characterState.positionX,
                    y: characterState.positionY,
                    z: characterState.positionZ,
                });
                element.setAttribute("rotation",{
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
                smile.setAttribute("src", "justin.png");
                smile.setAttribute("height", 0.3);
                smile.setAttribute("width", 0.3);
                smile.setAttribute("depth", 0.3);
                smile.setAttribute("position",{
                    x: 0,
                    y: 0,
                    z: -0.02,
                });
                characterModel.append(smile);

                // nameTag = document.createElement("a-text");
                // nameTag.setAttribute("value", addedPlayer.name);
                // nameTag.setAttribute("color", "black");
                // nameTag.setAttribute("position",{
                //     x: 0.5,
                //     y: 0.9,
                //     z: 0,
                // });
                // nameTag.setAttribute("rotation",{
                //     x: 0,
                //     y: rig.getAttribute("rotation").y -180,
                //     z: 0,
                // });
                // characterModel.append(nameTag);

            playerElements[addedPlayer.id] = characterModel;
            scene.appendChild(characterModel);
        })

        // remove when disconnect
        allPlayersRef.on("child_removed", (snapshot) => {
            const removedKey = snapshot.val().id;
            scene.remove(playerElements[removedKey]);
            delete playerElements[removedKey];

        })

    }

    firebase.auth().onAuthStateChanged((user) => {
        console.log(user)
        if (user) {
            //You're logged in!
            playerId = user.uid;
            playerRef = firebase.database().ref(`players/${playerId}`);

            playerRef.set({
                id: playerId,
                name: "player0",
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
            //You're logged out.
        }
    })

    firebase.auth().signInAnonymously().catch((error) => {
        var errorCode = error.code;
        var errorMessage = error.message;
        // ...
        console.log(errorCode, errorMessage);
    });

}