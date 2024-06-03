class Sushi {
    constructor(addedProjectile) {

        let x = addedProjectile.position.x;
        let y = addedProjectile.position.y;
        let z = addedProjectile.position.z;

        let rx = addedProjectile.rotation.x;
        let ry = addedProjectile.rotation.y;
        let rz = addedProjectile.rotation.z;

        this.projectileModel = document.createElement("a-cylinder");
        this.projectileModel.setAttribute("radius", 0.05);
        this.projectileModel.setAttribute("height", 0.05);
        this.projectileModel.setAttribute("shader","flat");
        this.projectileModel.setAttribute("color", "#1C2F22");
        this.projectileModel.setAttribute("position",{x: x, y: y, z: z});
        this.projectileModel.setAttribute("rotation",{x: rx - 90, y: ry + 45, z: rz});

            this.rice = document.createElement("a-cylinder");
            this.rice.setAttribute("radius", 0.045);
            this.rice.setAttribute("height", 0.055);
            this.rice.setAttribute("shader","flat");
            this.rice.setAttribute("color", "white");

        this.projectileModel.append(this.rice);

            this.stuff = document.createElement("a-cylinder");
            this.stuff.setAttribute("radius", 0.02);
            this.stuff.setAttribute("height", 0.06);
            this.stuff.setAttribute("shader","flat");
            this.stuff.setAttribute("color", "#DA8463");

        this.projectileModel.append(this.stuff);
    }

    updatePosition(x,y,z) {
        this.projectileModel.setAttribute("position", {x: x, y: y, z: z});
    }
}