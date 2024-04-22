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