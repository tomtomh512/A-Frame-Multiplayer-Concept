class Character {
    constructor(addedPlayer, playerId) {

        let x = addedPlayer.position.x;
        let y = addedPlayer.position.y;
        let z = addedPlayer.position.z;

        let rx = addedPlayer.rotation.x;
        let ry = addedPlayer.rotation.y;
        let rz = addedPlayer.rotation.z;

        this.characterEntity = document.createElement("a-entity");
        this.characterEntity.setAttribute("sound", {src: "#hurtSound", loop: false, volume: 18, poolSize: 10});
        this.characterEntity.setAttribute("position", {x: x, y: y, z: z});

        this.headEntity = document.createElement("a-entity");
        this.headEntity.setAttribute("id", "headEntity");
        this.headEntity.setAttribute("sound", {src: "#throwSound", loop: false, volume: 18, poolSize: 10});
        this.headEntity.setAttribute("scale", {x: 0.5, y: 0.5, z: 0.5,});
        this.headEntity.setAttribute("rotation", {x: rx, y: ry, z: rz});

        this.head1 = document.createElement("a-box");
        this.head1.setAttribute("color", "tan");
        this.head1.setAttribute("width", 0.8);
        this.head1.setAttribute("height", 0.5);
        this.head1.setAttribute("shader", "flat");
        this.headEntity.append(this.head1);

        this.head2 = document.createElement("a-box");
        this.head2.setAttribute("color", "tan");
        this.head2.setAttribute("depth", 0.8);
        this.head2.setAttribute("height", 0.5);
        this.head2.setAttribute("shader", "flat");
        this.headEntity.append(this.head2);

        this.headCorner1 = document.createElement("a-cylinder");
        this.headCorner1.setAttribute("color", "tan");
        this.headCorner1.setAttribute("radius", 0.1);
        this.headCorner1.setAttribute("height", 0.5);
        this.headCorner1.setAttribute("shader", "flat");
        this.headCorner1.setAttribute("position", {x: 0.4, y: 0, z: 0.4});
        this.headEntity.append(this.headCorner1);

        this.headCorner2 = document.createElement("a-cylinder");
        this.headCorner2.setAttribute("color", "tan");
        this.headCorner2.setAttribute("radius", 0.1);
        this.headCorner2.setAttribute("height", 0.5);
        this.headCorner2.setAttribute("shader", "flat");
        this.headCorner2.setAttribute("position", {x: -0.4, y: 0, z: 0.4});
        this.headEntity.append(this.headCorner2);

        this.headCorner3 = document.createElement("a-cylinder");
        this.headCorner3.setAttribute("color", "tan");
        this.headCorner3.setAttribute("radius", 0.1);
        this.headCorner3.setAttribute("height", 0.5);
        this.headCorner3.setAttribute("shader", "flat");
        this.headCorner3.setAttribute("position", {x: 0.4, y: 0, z: -0.4});
        this.headEntity.append(this.headCorner3);

        this.headCorner4 = document.createElement("a-cylinder");
        this.headCorner4.setAttribute("color", "tan");
        this.headCorner4.setAttribute("radius", 0.1);
        this.headCorner4.setAttribute("height", 0.5);
        this.headCorner4.setAttribute("shader", "flat");
        this.headCorner4.setAttribute("position", {x: -0.4, y: 0, z: -0.4});
        this.headEntity.append(this.headCorner4);

        this.eye1 = document.createElement("a-cylinder");
        this.eye1.setAttribute("color", "black");
        this.eye1.setAttribute("radius", 0.05);
        this.eye1.setAttribute("height", 0.1);
        this.eye1.setAttribute("shader", "flat");
        this.eye1.setAttribute("rotation", {x: 90, y: 0, z: 0});
        this.eye1.setAttribute("position", {x: -0.25, y: 0.1, z: -0.46});
        this.headEntity.append(this.eye1);

        this.eye2 = document.createElement("a-cylinder");
        this.eye2.setAttribute("color", "black");
        this.eye2.setAttribute("radius", 0.05);
        this.eye2.setAttribute("height", 0.1);
        this.eye2.setAttribute("shader", "flat");
        this.eye2.setAttribute("rotation", {x: 90, y: 0, z: 0});
        this.eye2.setAttribute("position", {x: 0.25, y: 0.1, z: -0.46});
        this.headEntity.append(this.eye2);

        this.mouth = document.createElement("a-box");
        this.mouth.setAttribute("color", "black");
        this.mouth.setAttribute("width", 0.7);
        this.mouth.setAttribute("height", 0.05);
        this.mouth.setAttribute("depth", 0.1);
        this.mouth.setAttribute("shader", "flat");
        this.mouth.setAttribute("position", {x: 0, y: -0.05, z: -0.46});
        this.headEntity.append(this.mouth);

        this.hair1 = document.createElement("a-box");
        this.hair1.setAttribute("color", "black");
        this.hair1.setAttribute("width", 1.05);
        this.hair1.setAttribute("height", 0.3);
        this.hair1.setAttribute("depth", 0.925);
        this.hair1.setAttribute("shader", "flat");
        this.hair1.setAttribute("position", {x: 0, y: 0.35, z: 0.0625});
        this.headEntity.append(this.hair1);

        this.hair2 = document.createElement("a-box");
        this.hair2.setAttribute("color", "black");
        this.hair2.setAttribute("width", 0.925);
        this.hair2.setAttribute("height", 0.3);
        this.hair2.setAttribute("depth", 1.05);
        this.hair2.setAttribute("shader", "flat");
        this.hair2.setAttribute("position", {x: 0, y: 0.35, z: 0});
        this.headEntity.append(this.hair2);

        this.hair3 = document.createElement("a-box");
        this.hair3.setAttribute("color", "black");
        this.hair3.setAttribute("width", 1.05);
        this.hair3.setAttribute("height", 0.3);
        this.hair3.setAttribute("depth", 0.5);
        this.hair3.setAttribute("shader", "flat");
        this.hair3.setAttribute("position", {x: 0, y: 0.1, z: 0.275});
        this.headEntity.append(this.hair3);

        this.hairCorner1 = document.createElement("a-cylinder");
        this.hairCorner1.setAttribute("color", "black");
        this.hairCorner1.setAttribute("radius", 0.125);
        this.hairCorner1.setAttribute("height", 0.3);
        this.hairCorner1.setAttribute("depth", 0.5);
        this.hairCorner1.setAttribute("shader", "flat");
        this.hairCorner1.setAttribute("position", {x: 0.4, y: 0.35, z: -0.4});
        this.headEntity.append(this.hairCorner1);

        this.hairCorner2 = document.createElement("a-cylinder");
        this.hairCorner2.setAttribute("color", "black");
        this.hairCorner2.setAttribute("radius", 0.125);
        this.hairCorner2.setAttribute("height", 0.3);
        this.hairCorner2.setAttribute("depth", 0.5);
        this.hairCorner2.setAttribute("shader", "flat");
        this.hairCorner2.setAttribute("position", {x: -0.4, y: 0.35, z: -0.4});
        this.headEntity.append(this.hairCorner2);

        this.characterEntity.append(this.headEntity);

        this.bodyEntity = document.createElement("a-entity");
        this.bodyEntity.setAttribute("id", "bodyEntity");
        this.bodyEntity.setAttribute("scale", {x: 0.5, y: 0.5, z: 0.5});
        this.bodyEntity.setAttribute("position", {x: 0, y: -0.35, z: 0});
        this.bodyEntity.setAttribute("rotation", {x: 0, y: ry, z: rz});

        this.body = document.createElement("a-box");
        this.body.setAttribute("shader", "flat");
        this.body.setAttribute("color", "#E35252");
        this.body.setAttribute("width", 1.05);
        this.body.setAttribute("height", 0.75);
        this.body.setAttribute("depth", 1.05);
        this.bodyEntity.append(this.body);

        this.apron1 = document.createElement("a-box");
        this.apron1.setAttribute("shader", "flat");
        this.apron1.setAttribute("color", "#D9E2E6");
        this.apron1.setAttribute("width", 1);
        this.apron1.setAttribute("height", 0.6);
        this.apron1.setAttribute("depth", 0.05);
        this.apron1.setAttribute("position", {x: 0, y: 0, z: -0.51});
        this.bodyEntity.append(this.apron1);

        this.apron2 = document.createElement("a-box");
        this.apron2.setAttribute("shader", "flat");
        this.apron2.setAttribute("color", "#D9E2E6");
        this.apron2.setAttribute("width", 1.075);
        this.apron2.setAttribute("height", 0.05);
        this.apron2.setAttribute("depth", 1.075);
        this.bodyEntity.append(this.apron2);

        this.button1 = document.createElement("a-cylinder");
        this.button1.setAttribute("shader", "flat");
        this.button1.setAttribute("color", "black");
        this.button1.setAttribute("radius", 0.05);
        this.button1.setAttribute("height", 0.1);
        this.button1.setAttribute("rotation", {x: 90, y: 0, z: 0});
        this.button1.setAttribute("position", {x: 0.3, y: 0.15, z: -0.5});
        this.bodyEntity.append(this.button1);

        this.button2 = document.createElement("a-cylinder");
        this.button2.setAttribute("shader", "flat");
        this.button2.setAttribute("color", "black");
        this.button2.setAttribute("radius", 0.05);
        this.button2.setAttribute("height", 0.1);
        this.button2.setAttribute("rotation", {x: 90, y: 0, z: 0});
        this.button2.setAttribute("position", {x: -0.3, y: 0.15, z: -0.5});
        this.bodyEntity.append(this.button2);

        this.button3 = document.createElement("a-cylinder");
        this.button3.setAttribute("shader", "flat");
        this.button3.setAttribute("color", "black");
        this.button3.setAttribute("radius", 0.05);
        this.button3.setAttribute("height", 0.1);
        this.button3.setAttribute("rotation", {x: 90, y: 0, z: 0});
        this.button3.setAttribute("position", {x: 0.3, y: -0.15, z: -0.5});
        this.bodyEntity.append(this.button3);

        this.button4 = document.createElement("a-cylinder");
        this.button4.setAttribute("shader", "flat");
        this.button4.setAttribute("color", "black");
        this.button4.setAttribute("radius", 0.05);
        this.button4.setAttribute("height", 0.1);
        this.button4.setAttribute("rotation", {x: 90, y: 0, z: 0});
        this.button4.setAttribute("position", {x: -0.3, y: -0.15, z: -0.5});
        this.bodyEntity.append(this.button4);

        this.characterEntity.append(this.bodyEntity);

        this.front = document.createElement("a-plane");
        this.front.setAttribute("static-body", "");
        this.front.setAttribute("class", "char-hit-box");
        this.front.setAttribute("opacity", "0");
        this.front.setAttribute("width", 0.5);
        this.front.setAttribute("height", 2);
        this.front.setAttribute("position", {x: 0, y: 0, z: 0.25});
        this.front.setAttribute("rotation", {x: 0, y: 180, z: 0});
        this.bodyEntity.append(this.front);

        this.left = document.createElement("a-plane");
        this.left.setAttribute("static-body", "");
        this.left.setAttribute("class", "char-hit-box");
        this.left.setAttribute("opacity", "0");
        this.left.setAttribute("width", 0.5);
        this.left.setAttribute("height", 2);
        this.left.setAttribute("position", {x: 0.25, y: 0, z: 0});
        this.left.setAttribute("rotation", {x: 0, y: 270, z: 0});
        this.bodyEntity.append(this.left);

        this.right = document.createElement("a-plane");
        this.right.setAttribute("static-body", "");
        this.right.setAttribute("class", "char-hit-box");
        this.right.setAttribute("opacity", "0");
        this.right.setAttribute("width", 0.5);
        this.right.setAttribute("height", 2);
        this.right.setAttribute("position", {x: -0.25, y: 0, z: 0});
        this.right.setAttribute("rotation", {x: 0, y: 90, z: 0});
        this.bodyEntity.append(this.right);

        this.back = document.createElement("a-plane");
        this.back.setAttribute("static-body", "");
        this.back.setAttribute("class", "char-hit-box");
        this.back.setAttribute("opacity", "0");
        this.back.setAttribute("width", 0.5);
        this.back.setAttribute("height", 2);
        this.back.setAttribute("position", {x: 0, y: 0, z: -0.25});
        this.back.setAttribute("rotation", {x: 0, y: 0, z: 0});
        this.bodyEntity.append(this.back);

        if (addedPlayer.id !== playerId) {
            this.infoTagEntity = document.createElement("a-entity");
            this.infoTagEntity.setAttribute("id", "infoTagEntity");
            this.infoTagEntity.setAttribute("position", {x: 0, y: 0.4, z: 0});

            this.name = document.createElement("a-text");
            this.name.setAttribute("id", "name");
            this.name.setAttribute("value", addedPlayer.name);
            this.name.setAttribute("color", "black");
            this.name.setAttribute("position", {x: -0.3, y: 0.225, z: 0});
            this.infoTagEntity.append(this.name);

            this.health = document.createElement("a-text");
            this.health.setAttribute("id", "health");
            this.health.setAttribute("value", addedPlayer.health + "%");
            this.health.setAttribute("color", "black");
            this.health.setAttribute("position", {x: -0.3, y: 0, z: 0});
            this.infoTagEntity.append(this.health);

            this.characterEntity.append(this.infoTagEntity);
        }
    }

    updateTagAngle(angle) {
        this.characterEntity.querySelector('#infoTagEntity').setAttribute("rotation", {x: 0, y: angle, z: 0})
    }

    updateTagName(name) {
        this.characterEntity.querySelector('#infoTagEntity').querySelector('#name').setAttribute("value", name);
    }

    updateTagHealth(health) {
        this.characterEntity.querySelector('#infoTagEntity').querySelector('#health').setAttribute("value", health + "%");
    }

    updatePosition(x,y,z) {
        this.characterEntity.setAttribute("position", {x: x, y: y, z: z});
    }

    updateHeadRotation(x,y,z) {
        this.characterEntity.querySelector('#headEntity').setAttribute("rotation", {x: x, y: y, z: z});
    }

    updateBodyRotation(y,z) {
        this.characterEntity.querySelector('#bodyEntity').setAttribute("rotation", {x: 0, y: y, z: z});
    }

    playThrowSound() {
        this.characterEntity.querySelector('#headEntity').components.sound.playSound();
    }

    playHurtSound() {
        this.characterEntity.components.sound.playSound();
    }
}