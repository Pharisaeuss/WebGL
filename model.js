function Model(name) {
    this.name = name;
    this.iVertexBuffer = gl.createBuffer();
    this.uPolylines = []; // Set of U polylines (t varies, v is constant)
    this.vPolylines = []; // Set of V polylines (t is constant, v varies)

    // Parametric equations for the Virich Cyclic Surface 
    this.evaluateSurface = function(t, v) {
        const a = 1.5;
        const b = 3.0;
        const c = 2.0;
        const d = 4.0;

        const p = (d * d) - (c * c); // d^2 - c^2

        const sinV = Math.sin(v);
        const cosV = Math.cos(v);
        
        // f(v) formula 
        const fv = (a * b) / Math.sqrt((a * a * sinV * sinV) + (b * b * cosV * cosV));

        const cosT = Math.cos(t);
        const sinT = Math.sin(t);

        // Common multiplier term for x and y
        const termXY = 0.5 * (fv * (1.0 + cosT) + p * ((1.0 - cosT) / fv));

        const x = termXY * cosV;
        const y = termXY * sinV;
        const z = 0.5 * (fv - (p / fv)) * sinT;

        // Scale down factor 
        const scale = 0.2;

        return [x * scale, y * scale, z * scale];
    };

    // Generates the two sets of polylines based on parameters t and v
    this.CreateSurfaceData = function(tSteps = 40, vSteps = 40) {
        this.uPolylines = [];
        this.vPolylines = [];

        const tMin = 0.0;
        const tMax = 2.0 * Math.PI;
        const vMin = 0.0;
        const vMax = 2.0 * Math.PI;

        // 1. Set of U-polylines (v is held constant, t varies)
        for (let j = 0; j < vSteps; j++) {
            const v = vMin + (j / vSteps) * (vMax - vMin);
            const vertices = [];
            for (let i = 0; i <= tSteps; i++) {
                const t = tMin + (i / tSteps) * (tMax - tMin);
                const pt = this.evaluateSurface(t, v);
                vertices.push(pt[0], pt[1], pt[2]);
            }
            this.uPolylines.push(new Float32Array(vertices));
        }

        // 2. Set of V-polylines (t is held constant, v varies)
        for (let i = 0; i <= tSteps; i++) {
            const t = tMin + (i / tSteps) * (tMax - tMin);
            const vertices = [];
            for (let j = 0; j <= vSteps; j++) {
                const v = vMin + (j / vSteps) * (vMax - vMin);
                const pt = this.evaluateSurface(t, v);
                vertices.push(pt[0], pt[1], pt[2]);
            }
            this.vPolylines.push(new Float32Array(vertices));
        }
    };

    // Renders a single polyline set
    this.drawPolylineSet = function(polylineSet) {
        for (let i = 0; i < polylineSet.length; i++) {
            const vertexData = polylineSet[i];
            gl.bindBuffer(gl.ARRAY_BUFFER, this.iVertexBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, vertexData, gl.STREAM_DRAW);

            gl.vertexAttribPointer(shProgram.iAttribVertex, 3, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(shProgram.iAttribVertex);

            gl.drawArrays(gl.LINE_STRIP, 0, vertexData.length / 3);
        }
    };

    this.Draw = function() {
        this.drawPolylineSet(this.uPolylines);
        this.drawPolylineSet(this.vPolylines);
    };
}