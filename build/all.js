/**
 *  class FirminCSSMatrix
 *
 *  The [[FirminCSSMatrix]] class is a concrete implementation of the
 *  `CSSMatrix` interface defined in the [CSS 2D Transforms][2d] and
 *  [CSS 3D Transforms][3d] Module specifications.
 *
 *  [2d]: http://www.w3.org/TR/css3-2d-transforms/
 *  [3d]: http://www.w3.org/TR/css3-3d-transforms/
 *
 *  The implementation was largely copied from the `WebKitCSSMatrix` class, and
 *  the supparting maths libraries in the [WebKit][webkit] project. This is one
 *  reason why much of the code looks more like C++ than JavaScript.
 *
 *  [webkit]: http://webkit.org/
 *
 *  Its API is a superset of that provided by `WebKitCSSMatrix`, largely
 *  because various pieces of supporting code have been added as instance
 *  methods rather than pollute the global namespace. Examples of these include
 *  [[FirminCSSMatrix#isAffine]], [[FirminCSSMatrix#isIdentityOrTranslation]]
 *  and [[FirminCSSMatrix#adjoint]].
 **/

/**
 *  new FirminCSSMatrix(domstr)
 *  - domstr (String): a string representation of a 2D or 3D transform matrix
 *    in the form given by the CSS transform property, i.e. just like the
 *    output from [[FirminCSSMatrix#toString]].
 **/
FirminCSSMatrix = function(domstr) {
    this.m11 = this.m22 = this.m33 = this.m44 = 1;

               this.m12 = this.m13 = this.m14 =
    this.m21 =            this.m23 = this.m24 =
    this.m31 = this.m32 =            this.m34 =
    this.m41 = this.m42 = this.m43            = 0;

    if (typeof domstr == "string") {
        this.setMatrixValue(domstr);
    }
};

/**
 *  FirminCSSMatrix.displayName = "FirminCSSMatrix"
 **/
FirminCSSMatrix.displayName = "FirminCSSMatrix";

/**
 *  FirminCSSMatrix.degreesToRadians(angle) -> Number
 *  - angle (Number): an angle in degrees.
 *
 *  Converts angles in degrees, which are used by the external API, to angles
 *  in radians used in internal calculations.
 **/
FirminCSSMatrix.degreesToRadians = function(angle) {
    return angle * Math.PI / 180;
};

/**
 *  FirminCSSMatrix.determinant2x2(a, b, c, d) -> Number
 *  - a (Number): top-left value of the matrix.
 *  - b (Number): top-right value of the matrix.
 *  - c (Number): bottom-left value of the matrix.
 *  - d (Number): bottom-right value of the matrix.
 *
 *  Calculates the determinant of a 2x2 matrix.
 **/
FirminCSSMatrix.determinant2x2 = function(a, b, c, d) {
    return a * d - b * c;
};

/**
 *  FirminCSSMatrix.determinant3x3(matrix) -> Number
 *  - a1 (Number): matrix value in position [1, 1].
 *  - a2 (Number): matrix value in position [1, 2].
 *  - a3 (Number): matrix value in position [1, 3].
 *  - b1 (Number): matrix value in position [2, 1].
 *  - b2 (Number): matrix value in position [2, 2].
 *  - b3 (Number): matrix value in position [2, 3].
 *  - c1 (Number): matrix value in position [3, 1].
 *  - c2 (Number): matrix value in position [3, 2].
 *  - c3 (Number): matrix value in position [3, 3].
 *
 *  Calculates the determinant of a 3x3 matrix.
 **/
FirminCSSMatrix.determinant3x3 = function(a1, a2, a3, b1, b2, b3, c1, c2, c3) {
    var determinant2x2 = FirminCSSMatrix.determinant2x2;
    return a1 * determinant2x2(b2, b3, c2, c3) -
           b1 * determinant2x2(a2, a3, c2, c3) +
           c1 * determinant2x2(a2, a3, b2, b3);
};

/**
 *  FirminCSSMatrix.determinant4x4(matrix) -> Number
 *  - matrix (FirminCSSMatrix): the matrix to calculate the determinant of.
 *
 *  Calculates the determinant of a 4x4 matrix.
 **/
FirminCSSMatrix.determinant4x4 = function(m) {
    var determinant3x3 = FirminCSSMatrix.determinant3x3,

    // Assign to individual variable names to aid selecting correct elements
    a1 = m.m11, b1 = m.m21, c1 = m.m31, d1 = m.m41,
    a2 = m.m12, b2 = m.m22, c2 = m.m32, d2 = m.m42,
    a3 = m.m13, b3 = m.m23, c3 = m.m33, d3 = m.m43,
    a4 = m.m14, b4 = m.m24, c4 = m.m34, d4 = m.m44;

    return a1 * determinant3x3(b2, b3, b4, c2, c3, c4, d2, d3, d4) -
           b1 * determinant3x3(a2, a3, a4, c2, c3, c4, d2, d3, d4) +
           c1 * determinant3x3(a2, a3, a4, b2, b3, b4, d2, d3, d4) -
           d1 * determinant3x3(a2, a3, a4, b2, b3, b4, c2, c3, c4);
};

/**
 * FirminCSSMatrix.toMatrixString(transformValue) -> String
 * - transformValue (String): `el.style.WebkitTransform`-style string (like `rotate(18rad) translate3d(50px, 100px, 10px)`)
 *
 * Tranforms a `el.style.WebkitTransform`-style string
 * (like `rotate(18rad) translate3d(50px, 100px, 10px)`)
 * into a `getComputedStyle(el)`-style matrix string
 * (like `matrix3d(0.6603167082440828, -0.7509872467716737, 0, 0, 0.7509872467716737, 0.6603167082440828, 0, 0, 0, 0, 1, 0, 108.11456008937151, 28.482308485824596, 10, 1)`)
 **/
FirminCSSMatrix.toMatrixString = function (transformValue) {
    var rgx = {
        functionSignature: /(\w+)\([^\)]+\)/ig,
        nameAndArguments: /(\w+)\(([^\)]+)\)/i,
        units: /([\-\+]?[0-9]+[\.0-9]*)(deg|rad|grad|px|%)*/
    };
    var transformStatements = transformValue.match(/(\w+)\([^\)]+\)/ig);
    var onlyMatrices = transformStatements && transformStatements.every(function (t) { return (/^matrix/).test(t); });
    if (!transformStatements || onlyMatrices) return transformValue;

    var values = function (o) { return o.value; };
    var cssFunctionToJsFunction = {
        matrix: function (m, o) {
            var m2 = new FirminCSSMatrix(o.unparsed);

            return m.multiply(m2);
        },
        matrix3d: function (m, o) {
            var m2 = new FirminCSSMatrix(o.unparsed);

            return m.multiply(m2);
        },

        perspective: function (m, o) {
            var m2 = new FirminCSSMatrix();
            m2.m34 -= 1 / o.value[0].value;

            return m.multiply(m2);
        },

        rotate: function (m, o) {
            return m.rotate.apply(m, o.value.map(values));
        },
        rotate3d: function (m, o) {
            return m.rotateAxisAngle.apply(m, o.value.map(values));
        },
        rotateX: function (m, o) {
            return m.rotate.apply(m, [o.value[0].value, 0, 0]);
        },
        rotateY: function (m, o) {
            return m.rotate.apply(m, [0, o.value[0].value, 0]);
        },
        rotateZ: function (m, o) {
            return m.rotate.apply(m, [0, 0, o.value[0].value]);
        },

        scale: function (m, o) {
            return m.scale.apply(m, o.value.map(values));
        },
        scale3d: function (m, o) {
            return m.scale.apply(m, o.value.map(values));
        },
        scaleX: function (m, o) {
            return m.scale.apply(m, o.value.map(values));
        },
        scaleY: function (m, o) {
            return m.scale.apply(m, [0, o.value[0].value, 0]);
        },
        scaleZ: function (m, o) {
            return m.scale.apply(m, [0, 0, o.value[0].value]);
        },

        skew: function (m, o) {
            var mX = new FirminCSSMatrix('skewX(' + o.value[0].unparsed + ')');
            var mY = new FirminCSSMatrix('skewY(' + o.value[1].unparsed + ')');
            var sM = 'matrix(1.00000, '+ mY.b +', '+ mX.c +', 1.000000, 0.000000, 0.000000)';
            var m2 = new FirminCSSMatrix(sM);

            return m.multiply(m2);
        },
        skewX: function (m, o) {
            return m.skewX.apply(m, [o.value[0].value]);
        },
        skewY: function (m, o) {
            return m.skewY.apply(m, [o.value[0].value]);
        },

        translate: function (m, o) {
            return m.translate.apply(m, o.value.map(values));
        },
        translate3d: function (m, o) {
            return m.translate.apply(m, o.value.map(values));
        },
        translateX: function (m, o) {
            return m.translate.apply(m, [o.value[0].value, 0, 0]);
        },
        translateY: function (m, o) {
            return m.translate.apply(m, [0, o.value[0].value, 0]);
        },
        translateZ: function (m, o) {
            return m.translate.apply(m, [0, 0, o.value[0].value]);
        }
    };
    var parseTransformStatement = function (str) {
        var pair = str.match(rgx.nameAndArguments).slice(1);

        return {
            key: pair[0],
            value: pair[1].split(/, ?/).map(function (value) {
                var parts = value.match(rgx.units) || [];

                return {
                    value: parseFloat(parts[1]),
                    units: parts[2],
                    unparsed: value
                };
            }),
            unparsed: str
        };
    };

    var transformOperations = transformStatements.map(parseTransformStatement);
    var startingMatrix = new FirminCSSMatrix();
    var transformedMatrix = transformOperations.reduce(function (matrix, operation) {
        // convert to degrees b/c all CSSMatrix methods expect degrees
        operation.value = operation.value.map(function (operation) {
            if (operation.units == 'rad') {
                operation.value = operation.value * (180 / Math.PI);
                operation.units = 'deg';
            }
            else if (operation.units == 'grad') {
                operation.value = operation.value / (400 / 360); // 400 gradians in 360 degrees
                operation.units = 'deg';
            }

            return operation;
        });

        var jsFunction = cssFunctionToJsFunction[operation.key];
        var result = jsFunction(matrix, operation);

        return result || matrix;
    }, startingMatrix);

    return transformedMatrix.toString();
};

/**
 *  FirminCSSMatrix#a -> Number
 *  The first 2D vector value.
 **/

/**
 *  FirminCSSMatrix#b -> Number
 *  The second 2D vector value.
 **/

/**
 *  FirminCSSMatrix#c -> Number
 *  The third 2D vector value.
 **/

/**
 *  FirminCSSMatrix#d -> Number
 *  The fourth 2D vector value.
 **/

/**
 *  FirminCSSMatrix#e -> Number
 *  The fifth 2D vector value.
 **/

/**
 *  FirminCSSMatrix#f -> Number
 *  The sixth 2D vector value.
 **/

/**
 *  FirminCSSMatrix#m11 -> Number
 *  The 3D matrix value in the first row and first column.
 **/

/**
 *  FirminCSSMatrix#m12 -> Number
 *  The 3D matrix value in the first row and second column.
 **/

/**
 *  FirminCSSMatrix#m13 -> Number
 *  The 3D matrix value in the first row and third column.
 **/

/**
 *  FirminCSSMatrix#m14 -> Number
 *  The 3D matrix value in the first row and fourth column.
 **/

/**
 *  FirminCSSMatrix#m21 -> Number
 *  The 3D matrix value in the second row and first column.
 **/

/**
 *  FirminCSSMatrix#m22 -> Number
 *  The 3D matrix value in the second row and second column.
 **/

/**
 *  FirminCSSMatrix#m23 -> Number
 *  The 3D matrix value in the second row and third column.
 **/

/**
 *  FirminCSSMatrix#m24 -> Number
 *  The 3D matrix value in the second row and fourth column.
 **/

/**
 *  FirminCSSMatrix#m31 -> Number
 *  The 3D matrix value in the third row and first column.
 **/

/**
 *  FirminCSSMatrix#m32 -> Number
 *  The 3D matrix value in the third row and second column.
 **/

/**
 *  FirminCSSMatrix#m33 -> Number
 *  The 3D matrix value in the third row and third column.
 **/

/**
 *  FirminCSSMatrix#m34 -> Number
 *  The 3D matrix value in the third row and fourth column.
 **/

/**
 *  FirminCSSMatrix#m41 -> Number
 *  The 3D matrix value in the fourth row and first column.
 **/

/**
 *  FirminCSSMatrix#m42 -> Number
 *  The 3D matrix value in the fourth row and second column.
 **/

/**
 *  FirminCSSMatrix#m43 -> Number
 *  The 3D matrix value in the fourth row and third column.
 **/

/**
 *  FirminCSSMatrix#m44 -> Number
 *  The 3D matrix value in the fourth row and fourth column.
 **/

[["m11", "a"],
 ["m12", "b"],
 ["m21", "c"],
 ["m22", "d"],
 ["m41", "e"],
 ["m42", "f"]].forEach(function(pair) {
    var key3d = pair[0], key2d = pair[1];

    Object.defineProperty(FirminCSSMatrix.prototype, key2d, {
        set: function(val) {
            this[key3d] = val;
        },

        get: function() {
            return this[key3d];
        },
        enumerable : true,
        configurable : true
    });
});

/**
 *  FirminCSSMatrix#isAffine() -> Boolean
 *
 *  Determines whether the matrix is affine.
 **/
FirminCSSMatrix.prototype.isAffine = function() {
    return this.m13 === 0 && this.m14 === 0 &&
           this.m23 === 0 && this.m24 === 0 &&
           this.m31 === 0 && this.m32 === 0 &&
           this.m33 === 1 && this.m34 === 0 &&
           this.m43 === 0 && this.m44 === 1;
};

/**
 *  FirminCSSMatrix#multiply(otherMatrix) -> FirminCSSMatrix
 *  - otherMatrix (FirminCSSMatrix): the matrix to multiply this one by.
 *
 *  Multiplies the matrix by a given matrix and returns the result.
 **/
FirminCSSMatrix.prototype.multiply = function(otherMatrix) {
    if (!otherMatrix) return null;

    var a = otherMatrix,
        b = this,
        c = new FirminCSSMatrix();

    c.m11 = a.m11 * b.m11 + a.m12 * b.m21 + a.m13 * b.m31 + a.m14 * b.m41;
    c.m12 = a.m11 * b.m12 + a.m12 * b.m22 + a.m13 * b.m32 + a.m14 * b.m42;
    c.m13 = a.m11 * b.m13 + a.m12 * b.m23 + a.m13 * b.m33 + a.m14 * b.m43;
    c.m14 = a.m11 * b.m14 + a.m12 * b.m24 + a.m13 * b.m34 + a.m14 * b.m44;

    c.m21 = a.m21 * b.m11 + a.m22 * b.m21 + a.m23 * b.m31 + a.m24 * b.m41;
    c.m22 = a.m21 * b.m12 + a.m22 * b.m22 + a.m23 * b.m32 + a.m24 * b.m42;
    c.m23 = a.m21 * b.m13 + a.m22 * b.m23 + a.m23 * b.m33 + a.m24 * b.m43;
    c.m24 = a.m21 * b.m14 + a.m22 * b.m24 + a.m23 * b.m34 + a.m24 * b.m44;

    c.m31 = a.m31 * b.m11 + a.m32 * b.m21 + a.m33 * b.m31 + a.m34 * b.m41;
    c.m32 = a.m31 * b.m12 + a.m32 * b.m22 + a.m33 * b.m32 + a.m34 * b.m42;
    c.m33 = a.m31 * b.m13 + a.m32 * b.m23 + a.m33 * b.m33 + a.m34 * b.m43;
    c.m34 = a.m31 * b.m14 + a.m32 * b.m24 + a.m33 * b.m34 + a.m34 * b.m44;

    c.m41 = a.m41 * b.m11 + a.m42 * b.m21 + a.m43 * b.m31 + a.m44 * b.m41;
    c.m42 = a.m41 * b.m12 + a.m42 * b.m22 + a.m43 * b.m32 + a.m44 * b.m42;
    c.m43 = a.m41 * b.m13 + a.m42 * b.m23 + a.m43 * b.m33 + a.m44 * b.m43;
    c.m44 = a.m41 * b.m14 + a.m42 * b.m24 + a.m43 * b.m34 + a.m44 * b.m44;

    return c;
};

/**
 *  FirminCSSMatrix#isIdentityOrTranslation() -> Boolean
 *
 *  Returns whether the matrix is the identity matrix or a translation matrix.
 **/
FirminCSSMatrix.prototype.isIdentityOrTranslation = function() {
    var t = this;
    return t.m11 === 1 && t.m12 === 0 && t.m13 === 0 && t.m14 === 0 &&
           t.m21 === 0 && t.m22 === 1 && t.m23 === 0 && t.m24 === 0 &&
           t.m31 === 0 && t.m31 === 0 && t.m33 === 1 && t.m34 === 0 &&
    /* m41, m42 and m43 are the translation points */   t.m44 === 1;
};

/**
 *  FirminCSSMatrix#adjoint() -> FirminCSSMatrix
 *
 *  Returns the adjoint matrix.
 **/
FirminCSSMatrix.prototype.adjoint = function() {
    var result = new FirminCSSMatrix(), t = this,
        determinant3x3 = FirminCSSMatrix.determinant3x3,

        a1 = t.m11, b1 = t.m12, c1 = t.m13, d1 = t.m14,
        a2 = t.m21, b2 = t.m22, c2 = t.m23, d2 = t.m24,
        a3 = t.m31, b3 = t.m32, c3 = t.m33, d3 = t.m34,
        a4 = t.m41, b4 = t.m42, c4 = t.m43, d4 = t.m44;

    // Row column labeling reversed since we transpose rows & columns
    result.m11 =  determinant3x3(b2, b3, b4, c2, c3, c4, d2, d3, d4);
    result.m21 = -determinant3x3(a2, a3, a4, c2, c3, c4, d2, d3, d4);
    result.m31 =  determinant3x3(a2, a3, a4, b2, b3, b4, d2, d3, d4);
    result.m41 = -determinant3x3(a2, a3, a4, b2, b3, b4, c2, c3, c4);

    result.m12 = -determinant3x3(b1, b3, b4, c1, c3, c4, d1, d3, d4);
    result.m22 =  determinant3x3(a1, a3, a4, c1, c3, c4, d1, d3, d4);
    result.m32 = -determinant3x3(a1, a3, a4, b1, b3, b4, d1, d3, d4);
    result.m42 =  determinant3x3(a1, a3, a4, b1, b3, b4, c1, c3, c4);

    result.m13 =  determinant3x3(b1, b2, b4, c1, c2, c4, d1, d2, d4);
    result.m23 = -determinant3x3(a1, a2, a4, c1, c2, c4, d1, d2, d4);
    result.m33 =  determinant3x3(a1, a2, a4, b1, b2, b4, d1, d2, d4);
    result.m43 = -determinant3x3(a1, a2, a4, b1, b2, b4, c1, c2, c4);

    result.m14 = -determinant3x3(b1, b2, b3, c1, c2, c3, d1, d2, d3);
    result.m24 =  determinant3x3(a1, a2, a3, c1, c2, c3, d1, d2, d3);
    result.m34 = -determinant3x3(a1, a2, a3, b1, b2, b3, d1, d2, d3);
    result.m44 =  determinant3x3(a1, a2, a3, b1, b2, b3, c1, c2, c3);

    return result;
};

/**
 *  FirminCSSMatrix#inverse() -> FirminCSSMatrix | null
 *
 *  If the matrix is invertible, returns its inverse, otherwise returns null.
 **/
FirminCSSMatrix.prototype.inverse = function() {
    var inv, det, result, i, j;

    if (this.isIdentityOrTranslation()) {
        inv = new FirminCSSMatrix();

        if (!(this.m41 === 0 && this.m42 === 0 && this.m43 === 0)) {
            inv.m41 = -this.m41;
            inv.m42 = -this.m42;
            inv.m43 = -this.m43;
        }

        return inv;
    }

    // Calculate the adjoint matrix
    result = this.adjoint();

    // Calculate the 4x4 determinant
    det = FirminCSSMatrix.determinant4x4(this);

    // If the determinant is zero, then the inverse matrix is not unique
    if (Math.abs(det) < 1e-8) return null;

    // Scale the adjoint matrix to get the inverse
    for (i = 1; i < 5; i++) {
        for (j = 1; j < 5; j++) {
            result[("m" + i) + j] /= det;
        }
    }

    return result;
};

/**
 *  FirminCSSMatrix#rotate(rotX, rotY, rotZ) -> FirminCSSMatrix
 *  - rotX (Number): the rotation around the x axis.
 *  - rotY (Number): the rotation around the y axis. If undefined, the x
 *    component is used.
 *  - rotZ (Number): the rotation around the z axis. If undefined, the x
 *    component is used.
 *
 *  Returns the result of rotating the matrix by a given vector.
 *
 *  If only the first argument is provided, the matrix is only rotated about
 *  the z axis.
 **/
FirminCSSMatrix.prototype.rotate = function(rx, ry, rz) {
    var degreesToRadians = FirminCSSMatrix.degreesToRadians;

    if (typeof rx != "number" || isNaN(rx)) rx = 0;

    if ((typeof ry != "number" || isNaN(ry)) &&
        (typeof rz != "number" || isNaN(rz))) {
        rz = rx;
        rx = 0;
        ry = 0;
    }

    if (typeof ry != "number" || isNaN(ry)) ry = 0;
    if (typeof rz != "number" || isNaN(rz)) rz = 0;

    rx = degreesToRadians(rx);
    ry = degreesToRadians(ry);
    rz = degreesToRadians(rz);

    var tx = new FirminCSSMatrix(),
        ty = new FirminCSSMatrix(),
        tz = new FirminCSSMatrix(),
        sinA, cosA, sinA2;

    rz /= 2;
    sinA = Math.sin(rz);
    cosA = Math.cos(rz);
    sinA2 = sinA * sinA;

    // Matrices are identity outside the assigned values
    tz.m11 = tz.m22 = 1 - 2 * sinA2;
    tz.m12 = tz.m21 = 2 * sinA * cosA;
    tz.m21 *= -1;

    ry /= 2;
    sinA  = Math.sin(ry);
    cosA  = Math.cos(ry);
    sinA2 = sinA * sinA;

    ty.m11 = ty.m33 = 1 - 2 * sinA2;
    ty.m13 = ty.m31 = 2 * sinA * cosA;
    ty.m13 *= -1;

    rx /= 2;
    sinA = Math.sin(rx);
    cosA = Math.cos(rx);
    sinA2 = sinA * sinA;

    tx.m22 = tx.m33 = 1 - 2 * sinA2;
    tx.m23 = tx.m32 = 2 * sinA * cosA;
    tx.m32 *= -1;

    var isIdentity = (this.toString() === (new FirminCSSMatrix).toString());

    return (isIdentity)
        ? tz.multiply(ty).multiply(tx)
        : this.multiply(tx).multiply(ty).multiply(tz);
};

/**
 *  FirminCSSMatrix#rotateAxisAngle(rotX, rotY, rotZ, angle) -> FirminCSSMatrix
 *  - rotX (Number): the rotation around the x axis.
 *  - rotY (Number): the rotation around the y axis. If undefined, the x
 *    component is used.
 *  - rotZ (Number): the rotation around the z axis. If undefined, the x
 *    component is used.
 *  - angle (Number): the angle of rotation about the axis vector, in degrees.
 *
 *  Returns the result of rotating the matrix around a given vector by a given
 *  angle.
 *
 *  If the given vector is the origin vector then the matrix is rotated by the
 *  given angle around the z axis.
 **/
FirminCSSMatrix.prototype.rotateAxisAngle = function(x, y, z, a) {
    if (typeof x != "number" || isNaN(x)) x = 0;
    if (typeof y != "number" || isNaN(y)) y = 0;
    if (typeof z != "number" || isNaN(z)) z = 0;
    if (typeof a != "number" || isNaN(a)) a = 0;
    if (x === 0 && y === 0 && z === 0) z = 1;

    var t   = new FirminCSSMatrix(),
        len = Math.sqrt(x * x + y * y + z * z),
        cosA, sinA, sinA2, csA, x2, y2, z2;

    a     = (FirminCSSMatrix.degreesToRadians(a) || 0) / 2;
    cosA  = Math.cos(a);
    sinA  = Math.sin(a);
    sinA2 = sinA * sinA;

    // Bad vector, use something sensible
    if (len === 0) {
        x = 0;
        y = 0;
        z = 1;
    } else if (len !== 1) {
        x /= len;
        y /= len;
        z /= len;
    }

    // Optimise cases where axis is along major axis
    if (x === 1 && y === 0 && z === 0) {
        t.m22 = t.m33 = 1 - 2 * sinA2;
        t.m23 = t.m32 = 2 * cosA * sinA;
        t.m32 *= -1;
    } else if (x === 0 && y === 1 && z === 0) {
        t.m11 = t.m33 = 1 - 2 * sinA2;
        t.m13 = t.m31 = 2 * cosA * sinA;
        t.m13 *= -1;
    } else if (x === 0 && y === 0 && z === 1) {
        t.m11 = t.m22 = 1 - 2 * sinA2;
        t.m12 = t.m21 = 2 * cosA * sinA;
        t.m21 *= -1;
    } else {
        csA = sinA * cosA;
        x2  = x * x;
        y2  = y * y;
        z2  = z * z;

        t.m11 = 1 - 2 * (y2 + z2) * sinA2;
        t.m12 = 2 * (x * y * sinA2 + z * csA);
        t.m13 = 2 * (x * z * sinA2 - y * csA);
        t.m21 = 2 * (y * x * sinA2 - z * csA);
        t.m22 = 1 - 2 * (z2 + x2) * sinA2;
        t.m23 = 2 * (y * z * sinA2 + x * csA);
        t.m31 = 2 * (z * x * sinA2 + y * csA);
        t.m32 = 2 * (z * y * sinA2 - x * csA);
        t.m33 = 1 - 2 * (x2 + y2) * sinA2;
    }

    return this.multiply(t);
};

/**
 *  FirminCSSMatrix#scale(scaleX, scaleY, scaleZ) -> FirminCSSMatrix
 *  - scaleX (Number): the scaling factor in the x axis.
 *  - scaleY (Number): the scaling factor in the y axis. If undefined, the x
 *    component is used.
 *  - scaleZ (Number): the scaling factor in the z axis. If undefined, 1 is
 *    used.
 *
 *  Returns the result of scaling the matrix by a given vector.
 **/
FirminCSSMatrix.prototype.scale = function(scaleX, scaleY, scaleZ) {
    var transform = new FirminCSSMatrix();

    if (typeof scaleX != "number" || isNaN(scaleX)) scaleX = 1;
    if (typeof scaleY != "number" || isNaN(scaleY)) scaleY = scaleX;
    if (typeof scaleZ != "number" || isNaN(scaleZ)) scaleZ = 1;

    transform.m11 = scaleX;
    transform.m22 = scaleY;
    transform.m33 = scaleZ;

    return this.multiply(transform);
};

/**
 *  FirminCSSMatrix#skewX(skewX) -> FirminCSSMatrix
 *  - skewX (Number): the scaling factor in the x axis.
 *
 *  Returns the result of skewing the matrix by a given vector.
 **/
FirminCSSMatrix.prototype.skewX = function(degrees) {
    var radians = FirminCSSMatrix.degreesToRadians(degrees);
    var transform = new FirminCSSMatrix();

    transform.c = Math.tan(radians);

    return this.multiply(transform);
};

/**
 *  FirminCSSMatrix#skewY(skewY) -> FirminCSSMatrix
 *  - skewY (Number): the scaling factor in the x axis.
 *
 *  Returns the result of skewing the matrix by a given vector.
 **/
FirminCSSMatrix.prototype.skewY = function(degrees) {
    var radians = FirminCSSMatrix.degreesToRadians(degrees);
    var transform = new FirminCSSMatrix();

    transform.b = Math.tan(radians);

    return this.multiply(transform);
};

/**
 *  FirminCSSMatrix#translate(x, y, z) -> FirminCSSMatrix
 *  - x (Number): the x component of the vector.
 *  - y (Number): the y component of the vector.
 *  - z (Number): the z component of the vector. If undefined, 0 is used.
 *
 *  Returns the result of translating the matrix by a given vector.
 **/
FirminCSSMatrix.prototype.translate = function(x, y, z) {
    var t = new FirminCSSMatrix();

    if (typeof x != "number" || isNaN(x)) x = 0;
    if (typeof y != "number" || isNaN(y)) y = 0;
    if (typeof z != "number" || isNaN(z)) z = 0;

    t.m41 = x;
    t.m42 = y;
    t.m43 = z;

    return this.multiply(t);
};

/**
 *  FirminCSSMatrix#setMatrixValue(domstr) -> undefined
 *  - domstr (String): a string representation of a 2D or 3D transform matrix
 *    in the form given by the CSS transform property, i.e. just like the
 *    output from [[FirminCSSMatrix#toString]].
 *
 *  Sets the matrix values using a string representation, such as that produced
 *  by the [[FirminCSSMatrix#toString]] method.
 **/
FirminCSSMatrix.prototype.setMatrixValue = function(domstr) {
        domstr = FirminCSSMatrix.toMatrixString(domstr.trim());
    var mstr   = domstr.match(/^matrix(3d)?\(\s*(.+)\s*\)$/),
        is3d, chunks, len, points, i, chunk;

    if (!mstr) return;

    is3d   = !!mstr[1];
    chunks = mstr[2].split(/\s*,\s*/);
    len    = chunks.length;
    points = new Array(len);

    if ((is3d && len !== 16) || !(is3d || len === 6)) return;

    for (i = 0; i < len; i++) {
        chunk = chunks[i];
        if (chunk.match(/^-?\d+(\.\d+)?$/)) {
            points[i] = parseFloat(chunk);
        } else return;
    }

    for (i = 0; i < len; i++) {
        point = is3d ?
            ("m" + (Math.floor(i / 4) + 1)) + (i % 4 + 1) :
            String.fromCharCode(i + 97); // ASCII char 97 == 'a'
        this[point] = points[i];
    }
};

/**
 *  FirminCSSMatrix#toString() -> String
 *
 *  Returns a string representation of the matrix.
 **/
FirminCSSMatrix.prototype.toString = function() {
    var self = this, points, prefix;

    if (this.isAffine()) {
        prefix = "matrix(";
        points = ["a", "b", "c", "d", "e", "f"];
    } else {
        prefix = "matrix3d(";
        points = ["m11", "m12", "m13", "m14",
                  "m21", "m22", "m23", "m24",
                  "m31", "m32", "m33", "m34",
                  "m41", "m42", "m43", "m44"];
    }

    return prefix + points.map(function(p) {
        return self[p].toFixed(6);
    }).join(", ") + ")";
};

/*
 *  Firmin, a JavaScript animation library using CSS transforms and transitions
 *  (c) 2010-2011 Benedict Eastaugh
 *
 *  Firmin is freely distributable under the terms of the BSD license.
 *  For details, see the Firmin website: http://extralogical.net/projects/firmin
 *
 *---------------------------------------------------------------------------*/

/**
 *  Firmin
 **/
Firmin = (typeof Firmin == 'undefined') ? {} : Firmin;

/**
 *  Firmin.CSSMatrix -> String
 **/
Firmin.CSSMatrix = (typeof WebKitCSSMatrix == 'object')
                 ? WebKitCSSMatrix
                 : FirminCSSMatrix;

/**
 *  Firmin.prefix -> String
 *
 *  Currently, several browsers support (to varying degrees) the CSS transform
 *  and transition functionality which Firmin is based upon. However, they each
 *  use vendor-specific prefixes for the various CSS properties involved.
 *  Consequently, for Firmin to work on these different browsers it must detect
 *  which of these prefixes is in use.
 **/
Firmin.prefix = (function() {
    var test     = document.createElement("div"),
        prefixes = ["webkit", "Moz", "O"],
        i        = 3,
        prefix;
    
    while (i--) {
        prefix = prefixes[i];
        test.style.cssText = "-" + prefix.toLowerCase() +
            "-transition-property:opacity;";
        if (typeof test.style[prefix + "TransitionProperty"] != "undefined")
            return prefix;
    }
    
    return prefix;
})();

/**
 *  Firmin.matrixToString(ctm) -> String
 *  - ctm (CSSMatrix): the matrix to serialise to string form. It should be an
 *    object implementing the CSSMatrix interface, such as [[FirminCSSMatrix]].
 *
 *  Note that currently Gecko does not support 3D transforms, and this function
 *  therefore only produces 6-value 2D transformation matrix strings for
 *  browsers based on that engine.
 **/
Firmin.matrixToString = function(ctm) {
    if (Firmin.prefix != "Moz") return ctm.toString();
    
    var prefix = "matrix(",
        points = ["a", "b", "c", "d", "e", "f"];
    
    return prefix + points.map(function(p, i) {
        var str = ctm[p].toFixed(6);
        
        // Gecko accepts length values for translate values, not numbers.
        if (i > 3) str += "px";
        
        return str;
    }).join(", ") + ")";
};

/**
 *  Firmin.angleToRadians(type, magnitude) -> Number
 *  - type (String): the unit of the angle to convert. This should be one of
 *    `"rad"`, `"deg"`, `"grad"` or `"turn"`.
 *  - magnitude (Number): the magnitude of the angle to convert.
 *
 *  ##### Angular conversion
 *
 *  The transform operations assume that angles are given in radians. However,
 *  there are several other valid CSS angle types: degrees, grads and turns.
 *  We therefore need code to, at a minimum, convert values of all these types
 *  to values in radians.
 **/
Firmin.angleToRadians = function(type, magnitude) {
    var ratio;
    
    switch (type) {
        case "rad"  : return magnitude;
        case "deg"  : ratio = Math.PI / 180; break;
        case "grad" : ratio = Math.PI / 200; break;
        case "turn" : ratio = Math.PI * 2;   break;
    }
    
    return ratio * magnitude;
};

/**
 *  Firmin.pointToVector(point) -> Array
 *  - point (Object | Array): the point object to convert to a
 *    three-dimensional vector. It should have `x`, `y` and `z` properties.
 *
 *  Often transform methods can accept both points and vectors, so this
 *  function converts points to vectors, while returning vectors as they are.
 *
 *  ##### Point to vector conversion
 *
 *  Points are used as a convenient and meaningful way for users to specify
 *  origins, translations etc., but a vector is a more convenient internal
 *  format, so in general points are converted to vectors on the way in.
 **/
Firmin.pointToVector = function(point) {
    if (!point) return null;
    
    return point instanceof Array ? point : [point.x, point.y, point.z];
};

/**
 *  Firmin.NUMBER_PATTERN = /^-?\d+(\.\d+)?/
 *
 *  A regular expression to match numeric strings. It accepts positive and
 *  negative integers and floating point numbers, but not exponential notation.
 **/
Firmin.NUMBER_PATTERN = /^-?\d+(\.\d+)?/;

/**
 *  Firmin.parseNumeric(units, def) -> Function
 *  - units (Array): the list of units accepted by the generated parser
 *    function.
 *  - def (String): the default unit which the generated parser function will
 *    fall back to if none of the accepted units match (this generally occurs
 *    when a unitless [[Number]] is provided).
 *
 *  [[Firmin.parseNumeric]] is a parser generator: it returns parser functions,
 *  parameterised by the given unit types. For example, [[Firmin.parseAngle]]
 *  accepts angular units (`"grad"`, `"rad"` etc.) and defaults to degrees.
 *
 *  ##### CSS data type parsing
 *
 *  There are numerous CSS data types. We are mainly interested in the various
 *  numeric types, generally consisting of a magnitude plus a unit (e.g.
 *  `"45deg"` or `"50%'`), but there are a few functions which allow or require
 *  a keyword instead.
 *
 *  The parsers implemented below all have a common pattern: they accept a
 *  string (or, if the type can be numeric and has a default unit, a number)
 *  and return a pair consisting of the unit and the magnitude (or `null`, if
 *  the input was not of the expected format).
 *
 *  One major limitation, albeit not with the parsing library itself, is that
 *  there is currently no straightforward way to convert between length units.
 *  Users of this library must use pixels, rather than being able to use any
 *  length unit they like and relying on the library to perform an internal
 *  conversion to pixels. This limits the usefulness of the parsing library,
 *  essentially to angles and times.
 **/
Firmin.parseNumeric = function(units, def) {
    return function(input) {
        var unit, magnitude;
        
        if (typeof input == "number") {
            return [def, input];
        } else if (typeof input != "string") {
            return null;
        }
        
        magnitude = (input.match(Firmin.NUMBER_PATTERN) || [""])[0];
        
        if (magnitude.length === input.length) {
            unit = def;
        } else {
            unit = units.filter(function(u) {
                return input.substr(magnitude.length) === u;
            })[0];
        }
        
        return unit && magnitude ? [unit, parseFloat(magnitude)] : null;
    };
};

/**
 *  Firmin.parseAngle(input) -> Array
 *  - input (String): if the input string looks like a CSS angle (e.g. `45deg`
 *    or `2.1rad`) then the parser will return a pair consisting of the unit
 *    and the magnitude (e.g. `["deg", 45]` or `["rad", 2.1]`).
 **/
Firmin.parseAngle = Firmin.parseNumeric(["deg", "grad", "rad", "turn"], "deg");

/**
 *  Firmin.parseTime(input) -> Array
 *  - input (String): if the input string looks like a CSS time (e.g. `52ms`
 *    or `1.2s`) then the parser will return a pair consisting of the unit
 *    and the magnitude (e.g. `["ms", 52]` or `["s", 1.2]`).
 **/
Firmin.parseTime  = Firmin.parseNumeric(["s", "ms"], "s");

/**
 *  class Firmin.Transform
 *
 *  Instances of [[Firmin.Transform]] represent CSS transforms to be applied to
 *  a given DOM element. As well as encapsulating a transformation matrix, they
 *  also contain the transform origin, and methods for translating API methods
 *  such as `translate` and `rotate` to lower-level matrix methods.
 *
 *  Transform objects have methods corresponding to all the CSS 2D transform
 *  functions; this list is also used to add generate higher-level wrapper
 *  functions and methods that wrap the more general animation functionality.
 *
 *  ##### Transformation matrices
 *
 *  The CSS transform modules provide a way to create a new local coordinate
 *  system for a given element and its descendants. All transform functions
 *  (rotate, skew, translate, scale etc.) are defined in terms of a
 *  transformation matrix. Firmin translates each use of these API-level
 *  transform functions into a matrix and then concatenates them to determine
 *  the final value. By performing these operations internally rather than
 *  deferring them to the browser, it is possible to introduce stateful
 *  transforms, where each new state of the element is based on its previous
 *  state.
 **/

/**
 *  new Firmin.Transform([matrix][, origin])
 *  - matrix (Firmin.CSSMatrix): an initial transform matrix.
 *  - origin (Array): a three-element array defining the transform origin.
 **/
Firmin.Transform = function(matrix, origin) {
    this.ctm    = matrix || new Firmin.CSSMatrix();
    this.centre = Firmin.pointToVector(origin) || ["50%", "50%", 0];
};

/**
 *  Firmin.Transform.methods -> Array
 *
 *  This list of methods defines the available transform API: they are defined
 *  primarily as methods on instances of `Firmin.Transform`, but are available
 *  to the user as methods on the `Firmin` object itself, as a wrapper around
 *  the `Firmin.animate` function, and on instances of `Firmin.Animated` as
 *  wrappers around the `Firmin.Animated#animate` method.
 **/
Firmin.Transform.methods = [
    "translate", "translate3d", "translateX", "translateY", "translateZ",
    "scale", "scale3d", "scaleX", "scaleY", "scaleZ",
    "rotate", "rotate3d", "rotateX", "rotateY", "rotateZ",
    "skew", "skewX", "skewY",
    "matrix", "matrix3d"
];

/**
 *  Firmin.Transform.parse(description[, context]) -> Object
 *  - description (Object): an animation description provided by the user.
 *  - context (Firmin.Animation): generally the previous animation applied.
 *
 *  The [[Firmin.Transform.parse]] method follows the standard Firmin animation
 *  description-parsing API. It accepts a description object and a context
 *  (generally the previous animation applied), and returns an object with two
 *  properties: the result (a [[Firmin.Transform]] object, or null) and the
 *  remainder (an object containing any unparsed properties of the description,
 *  to be passed to other parsers).
 *
 *  The resultant [[Firmin.Transform]] object wraps a transformation matrix
 *  formed by cumulatively applying the transform options in the description to
 *  either the identity matrix, or the transformation matrix given by the
 *  context's transform property. This feature is what enables stateful
 *  transforms, as otherwise applying a new transform to an element would
 *  simply overwrite its previous state with the new state.
 **/
Firmin.Transform.parse = function(description, context) {
    var methods   = Firmin.Transform.methods,
        rest      = {},
        transform = null,
        matrix, origin;
    
    if (typeof context === "object" && context.transform) {
        matrix    = context.transform.ctm;
        origin    = context.transform.centre;
        transform = new Firmin.Transform(matrix, origin);
    }
    
    for (property in description) {
        if (methods.indexOf(property) !== -1) {
            transform = transform || new Firmin.Transform();
            transform[property](description[property]);
        } else if (property === "origin") {
            transform = transform || new Firmin.Transform();
            transform[property](description[property]);
        } else {
            rest[property] = description[property];
        }
    }
    
    return {result: transform, remainder: rest};
};

/**
 *  Firmin.Transform#build([properties]) -> Object
 *  - properties (Object): a set of CSS properties which will be modified with
 *    the transform and transform-origin properties.
 *
 *  Returns the (modified) properties object initially passed in, or a new
 *  object if no properties argument is provided.
 **/
Firmin.Transform.prototype.build = function(properties) {
    var centre = this.centre;
    
    if (Firmin.prefix == "O") {
        centre = centre.slice(0, 2);
    }
    
    properties = properties || {};
    
    properties[Firmin.prefix + "Transform"]       = Firmin.matrixToString(this.ctm);
    properties[Firmin.prefix + "TransformOrigin"] = centre.join(" ");
    
    return properties;
};

/**
 *  Firmin.Transform#matrix(vector) -> undefined
 *  - vector (Array): representation of a transform matrix in column-major
 *    order.
 *
 *  Converts the given vector into a transform matrix and multiplies the
 *  current transform matrix by it, then sets the CTM to the resulting matrix.
 **/
Firmin.Transform.prototype.matrix   =
Firmin.Transform.prototype.matrix3d = function(v) {
    var t = new Firmin.CSSMatrix();
    
    if (v.length === 6) {
        t.a = v[0];
        t.b = v[1];
        t.c = v[2];
        t.d = v[3];
        t.e = v[4];
        t.f = v[5];
    } else {
        t.m11 = v[0];
        t.m12 = v[1];
        t.m13 = v[2];
        t.m14 = v[3];
        t.m21 = v[4];
        t.m22 = v[5];
        t.m23 = v[6];
        t.m24 = v[7];
        t.m31 = v[8];
        t.m32 = v[9];
        t.m33 = v[10];
        t.m34 = v[11];
        t.m41 = v[12];
        t.m42 = v[13];
        t.m43 = v[14];
        t.m44 = v[15];
    }
    
    this.ctm = this.ctm.multiply(t);
};

/** alias of: Firmin.Transform#matrix
 *  Firmin.Transform#matrix3d(vector) -> undefined
 *  - vector (Array): representation of a transform matrix in column-major
 *    order.
 **/

/**
 *  Firmin.Transform#translate([distances = {x: 0, y: 0, z: 0}]) -> undefined
 *  - distances (Array | Object | Number | String): the distances in pixels to
 *    translate the element by.
 *
 *  Generally, the distances argument should be either a three-dimensional
 *  vector, or an object with `x`, `y` and `z` properties, determining the
 *  values to translate the element by along those axes.
 *
 *  However, if it is a number, the element will be translated by that value
 *  along both x and y axes (it will not be translated along the z axis).
 **/
Firmin.Transform.prototype.translate   =
Firmin.Transform.prototype.translate3d = function(distances) {
    var vector, x, y, z;
    
    if (typeof distances == "number" || typeof distances == "string") {
        x = y = parseInt(distances, 10) || 0;
        z = 0;
    } else {
        vector = Firmin.pointToVector(distances);
        x      = vector[0];
        y      = vector[1];
        z      = vector[2];
        
        if (typeof x != "number") x = parseInt(x, 10) || 0;
        if (typeof y != "number") y = parseInt(y, 10) || 0;
        if (typeof z != "number") z = parseInt(z, 10) || 0;
    }
    
    this.ctm = this.ctm.translate(x, y, z);
};

/** alias of: Firmin.Transform#translate
 *  Firmin.Transform#translate3d([distances = {x: 0, y: 0, z: 0}]) -> undefined
 *  - distances (Array | Object | Number): the distances in pixels to translate
 *    the element by.
 **/

/**
 *  Firmin.Transform#translateX([distance = 0]) -> undefined
 *  - distance (Number): the distance in pixels to translate the element along
 *    the x axis.
 **/
Firmin.Transform.prototype.translateX = function(distance) {
    this.translate([distance, 0]);
};

/**
 *  Firmin.Transform#translateY([distance = 0]) -> undefined
 *  - distance (Number): the distance in pixels to translate the element along
 *    the y axis.
 **/
Firmin.Transform.prototype.translateY = function(distance) {
    this.translate([0, distance]);
};

/**
 *  Firmin.Transform#translateZ([distance = 0]) -> undefined
 *  - distance (Number): the distance in pixels to translate the element along
 *    the z axis.
 **/
Firmin.Transform.prototype.translateZ = function(distance) {
    this.translate3d([0, 0, distance]);
};

/**
 *  Firmin.Transform#scale(magnitudes) -> undefined
 *  - magnitudes (Array | Object | Number): the scaling factors to be applied
 *    to the x, y and z axes.
 *
 *  Generally, the magnitudes argument should be either a three-dimensional
 *  unitless vector, or an object with numeric `x`, `y` and `z` properties,
 *  determining the values to scale the element by along those axes.
 *
 *  However, if the argument is a number, the element will be scaled by that
 *  value along both x and y axes (it will not be scaled along the z axis).
 **/
Firmin.Transform.prototype.scale   =
Firmin.Transform.prototype.scale3d = function(magnitudes) {
    var vector, x, y, z;
    
    if (typeof magnitudes == "number") {
        x = y = magnitudes;
        z = 1;
    } else {
        vector = Firmin.pointToVector(magnitudes);
        x      = vector[0];
        y      = vector[1];
        z      = vector[2];
    }
    
    this.ctm = this.ctm.scale(x, y, z);
};

/** alias of: Firmin.Transform#scale
 *  Firmin.Transform#scale3d(magnitudes) -> undefined
 *  - magnitudes (Array | Object | Number): the scaling factors to be applied
 *    to the x, y and z axes.
 **/

/**
 *  Firmin.Transform#scaleX(magnitude) -> undefined
 *  - magnitude (Number): the distance to scale the element along the x axis.
 **/
Firmin.Transform.prototype.scaleX = function(magnitude) {
    this.scale3d([magnitude, 1, 1]);
};

/**
 *  Firmin.Transform#scaleY(magnitude) -> undefined
 *  - magnitude (Number): the distance to scale the element along the y axis.
 **/
Firmin.Transform.prototype.scaleY = function(magnitude) {
    this.scale3d([1, magnitude, 1]);
};

/**
 *  Firmin.Transform#scaleZ(magnitude) -> undefined
 *  - magnitude (Number): the distance to scale the element along the z axis.
 **/
Firmin.Transform.prototype.scaleZ = function(magnitude) {
    this.scale3d([1, 1, magnitude]);
};

/**
 *  Firmin.Transform#skew(angles) -> undefined
 *  - angles (Array | Object | Number | String): the amounts by which the
 *    element should be skewed along the x and y axes.
 *
 *  Generally, the angles argument should be either a two-dimensional unitless
 *  vector, or an object with `x` and `y` properties, determining the angles to
 *  skew the element by along those axes.
 *
 *  However, if the argument is an angle (a number, or a string representation
 *  of a CSS angle), the element will be scaled by that value along both x and
 *  y axes.
 **/
Firmin.Transform.prototype.skew = function(angles) {
    var parseAngle = Firmin.parseAngle,
        angle2rads = Firmin.angleToRadians,
        x, y;
    
    if (typeof angles == "number" || typeof angles == "string") {
        x = y = angle2rads.apply(null, parseAngle(angles)) || 0;
    } else {
        angles = Firmin.pointToVector(angles);
        x      = angle2rads.apply(null, parseAngle(angles[0])) || 0;
        y      = angle2rads.apply(null, parseAngle(angles[1])) || 0;
    }
    
    this.matrix([1, Math.tan(y), Math.tan(x), 1, 0, 0]);
};

/**
 *  Firmin.Transform#skewX(angle) -> undefined
 *  - angle (Number | String): the angle by which the element should be skewed
 *    along the x axis.
 **/
Firmin.Transform.prototype.skewX = function(angle) {
    this.skew([angle, 0]);
};

/**
 *  Firmin.Transform#skewY(angle) -> undefined
 *  - angle (Number | String): the angle by which the element should be
 *    skewed along the y axis.
 **/
Firmin.Transform.prototype.skewY = function(angle) {
    this.skew([0, angle]);
};

/**
 *  Firmin.Transform#rotate(angle) -> undefined
 *  - angle (Number | String): the angle to rotate the element by, in the plane
 *    of the web page (i.e. about the z axis).
 *
 *  The angle argument can be either a number (assumed to be in degrees) or a
 *  string representation of a CSS angle (e.g. `"90deg"`, `"1.4rad"`).
 **/
Firmin.Transform.prototype.rotate = function(a) {
    // Normalise angle to radians and then convert to degrees
    a = Firmin.angleToRadians.apply(null, Firmin.parseAngle(a)) *
        (180 / Math.PI);
    
    this.ctm = this.ctm.rotate(0, 0, a);
};

/**
 *  Firmin.Transform#rotate3d(params) -> undefined
 *  - params (Object): an object describing the rotation to perform. It should
 *    have `x`, `y` and `z` properties which state the vector around which the
 *    rotation should be performed, and an `angle` property determining the
 *    magnitude of the rotation. The `angle` property can be either a number
 *    (assumed to be in degrees) or a string representation of a CSS angle
 *    (e.g. `"90deg"`, `"1.4rad"`).
 **/
Firmin.Transform.prototype.rotate3d = function(params) {
    var x   = params.x,
        y   = params.y,
        z   = params.z,
        a   = params.angle;
    
    if (typeof x != "number") x = 0;
    if (typeof y != "number") y = 0;
    if (typeof z != "number") z = 0;
    
    // Normalise angle to radians and then convert to degrees
    a = Firmin.angleToRadians.apply(null, Firmin.parseAngle(a)) *
        (180 / Math.PI);
    
    this.ctm = this.ctm.rotateAxisAngle(x, y, z, a);
};

/**
 *  Firmin.Transform#rotateX(angle) -> undefined
 *  - angle (Number | String): the angle around the x axis which the element
 *    should be rotated. It can be either a number or a string representation of
 *    a CSS angle.
 **/
Firmin.Transform.prototype.rotateX = function(angle) {
    this.rotate3d({x: 1, angle: angle});
};

/**
 *  Firmin.Transform#rotateY(angle) -> undefined
 *  - angle (Number | String): the angle around the y axis which the element
 *    should be rotated. It can be either a number or a string representation of
 *    a CSS angle.
 **/
Firmin.Transform.prototype.rotateY = function(angle) {
    this.rotate3d({y: 1, angle: angle});
};

/**
 *  Firmin.Transform#rotateZ(angle) -> undefined
 *  - angle (Number | String): the angle around the z axis which the element
 *    should be rotated. It can be either a number or a string representation of
 *    a CSS angle.
 **/
Firmin.Transform.prototype.rotateZ = function(angle) {
    this.rotate3d({z: 1, angle: angle});
};

/**
 *  Firmin.Transform#origin(origin) -> undefined
 *  - origin (Array | Object): three-dimensional vector or point object with
 *    `x`, `y` and `z` properties, determining the origin point which
 *    transforms will be performed from. The values should be CSS lengths, e.g.
 *    in pixels (`"150px"`) or percentages (`"50%"`).
 **/
Firmin.Transform.prototype.origin = function(origin) {
    var vector = Firmin.pointToVector(origin), v1, v2, v3;
    
    if ((v0 = vector[0])) this.centre[0] = v0;
    if ((v1 = vector[1])) this.centre[1] = v1;
    if ((v2 = vector[2])) this.centre[2] = v2;
};

/**
 *  class Firmin.Transition
 *
 *  CSS transitions are the basic mechanism behind animation in Firmin, and
 *  [[Firmin.Transition]] objects encapsulate specific CSS transition
 *  properties. As well as those properties, Transition objects feature various
 *  utility methods allowing other objects to alter their behaviour based on
 *  the state of the [[Firmin.Transition]] object they are concerned with.
 *
 *  For example, if the duration of a Transition is 0, any animation using that
 *  Transition should execute immediately and then trigger the next state
 *  directly, as at least in WebKit-based browsers, the transitionEnd event is
 *  not triggered when the transition duration is 0.
 **/

/**
 *  new Firmin.Transition()
 **/
Firmin.Transition = function() {
    this.properties     = ["all"];
    this.duration       = ["ms", 0];
    this.delay          = ["ms", 0];
    this.timingFunction = "ease";
};

/**
 *  Firmin.Transition.methods -> Array
 *
 *  This list of methods defines the available transition API: when an
 *  animation description is parsed, properties with these names are used by
 *  the [[Firmin.Transition.parse]] method to build a new [[Firmin.Transition]]
 *  object.
 **/
Firmin.Transition.methods = [
    "properties",
    "timingFunction",
    "duration",
    "delay"
];

/**
 *  Firmin.Transition.parse(description[, context]) -> Object
 *  - description (Object): an animation description provided by the user.
 *  - context (Firmin.Animation): generally the previous animation applied.
 *
 *  The [[Firmin.Transition.parse]] method follows the standard Firmin animation
 *  description-parsing API. It accepts a description object and a context
 *  (generally the previous animation applied), and returns an object with two
 *  properties: the result (a [[Firmin.Transition]] object, or null) and the
 *  remainder (an object containing any unparsed properties of the description,
 *  to be passed to other parsers).
 *
 *  The resultant [[Firmin.Transition]] object will have those properties set
 *  that were correctly added in the description; they will be a subset of
 *  [[Firmin.Transition.methods]].
 **/
Firmin.Transition.parse = function(description, context) {
    var methods    = Firmin.Transition.methods,
        rest       = {},
        transition = new Firmin.Transition(),
        duration, delay;
    
    for (p in description) {
        if (methods.indexOf(p) !== -1) {
            if (p === "properties" && typeof p == "string") {
                transition[p] = [description[p]];
            } else if (p === "timingFunction" && typeof description[p] != "string") {
                transition[p] = "cubic-bezier(" + description[p].join(",") + ")";
            } else if (p === "duration") {
                duration = Firmin.parseTime(description[p]);
                if (duration) { transition[p] = duration; }
            } else if (p === "delay") {
                delay = Firmin.parseTime(description[p]);
                if (delay) { transition[p] = delay; }
            } else {
                transition[p] = description[p];
            }
        } else {
            rest[p] = description[p];
        }
    }
    
    return {result: transition, remainder: rest};
};

/**
 *  Firmin.Transition#hasDuration() -> Boolean
 *
 *  Returns whether the transition has a duration set.
 **/
Firmin.Transition.prototype.hasDuration = function() {
    return this.duration[1] !== 0;
};

/**
 *  Firmin.Transition#getDuration() -> Number
 *
 *  Returns the duration of the transition in milliseconds.
 **/
Firmin.Transition.prototype.getDuration = function() {
    var duration = this.duration;
    return duration[0] === "s" ? duration[1] * 1000 : duration[1];
};

/**
 *  Firmin.Transition#hasDelay() -> Boolean
 *
 *  Returns whether the transition has a delay set.
 **/
Firmin.Transition.prototype.hasDelay = function() {
    return this.delay[1] !== 0;
};

/**
 *  Firmin.Transition#getDelay() -> Number
 *
 *  Returns the duration of the transition delay in milliseconds.
 **/
Firmin.Transition.prototype.getDelay = function() {
    var delay = this.delay;
    return delay[0] === "s" ? delay[1] * 1000 : delay[1];
};

/**
 *  Firmin.Transition#build(properties) -> Object
 *  - properties (Object): a set of CSS properties which will be modified with
 *    the `transition-property`, `transistion-duration`, `transistion-delay`
 *    and `transistion-timing-function` properties.
 *
 *  Returns the (modified) properties object initially passed in, or a new
 *  object if no properties argument is provided.
 **/
Firmin.Transition.prototype.build = function(properties) {
    properties = properties || {};
    
    if (typeof this.properties == "string") {
        properties[Firmin.prefix + "TransitionProperty"] = this.properties;
    } else {
        properties[Firmin.prefix + "TransitionProperty"] = this.properties.join(", ");
    }
    
    properties[Firmin.prefix + "TransitionDuration"] = this.duration[1] + this.duration[0];
    properties[Firmin.prefix + "TransitionDelay"]    = this.delay[1] + this.delay[0];
    
    if (this.timingFunction) {
        properties[Firmin.prefix + "TransitionTimingFunction"] = this.timingFunction;
    }
    
    return properties;
};

/**
 *  class Firmin.Animation
 *
 *  Animations in Firmin consist of three components: a Transform object,
 *  representing the how the target element's local coordinate space will be
 *  transformed when the animation is run; a Transition object, determining how
 *  the element's state will evolve; and a bundle of other CSS properties,
 *  which represent the final state of the element when the animation
 *  completes, and which will be modified incrementally as the animation
 *  progresses, just as the transformation matrix will.
 *
 *  It is these additional CSS properties which allow Firmin to operate as a
 *  replacement for existing JavaScript animation libraries: the visual
 *  properties of the element can be modified over an interval, with the
 *  evolution of their state unfolding in accord with the provided transition
 *  function. For example, an element's background might be set to animate from
 *  one colour to another.
 *
 *  When an Animation object is created, it must be given a description object
 *  describing the properties of the animation. This description will be passed
 *  to [[Firmin.Transition.parse]] and [[Firmin.Transform.parse]] in turn, and
 *  they will return result objects and any remaining, unconsumed description
 *  properties, which will "fall through" to become style properties. For
 *  example, if the description has a `backgroundColor` property then that will
 *  not be removed by either parser, and will thus be set as a normal CSS
 *  property.
 **/

/**
 *  new Firmin.Animation(description[, context])
 *  - description (Object): the user-provided description of the animation to
 *    be performed.
 *  - context (Firmin.Animation): generally the previous animation applied.
 **/
Firmin.Animation = function(description, context) {
    var tsp, trp;
    
    if (typeof description.callback == "function") {
        this.callback = description.callback;
    }
    
    delete description.callback;
    
    tsp = Firmin.Transition.parse(description, context);
    this.transition = tsp.result;
    
    trp = Firmin.Transform.parse(tsp.remainder, context);
    this.transform  = trp.result;
    
    this.style = trp.remainder;
};

/**
 *  Firmin.Animation#hasDuration() -> Boolean
 *
 *  Returns whether the animation has a duration.
 **/
Firmin.Animation.prototype.hasDuration = function() {
    return this.transition && this.transition.hasDuration();
};

/**
 *  Firmin.Animation#getTotalDuration() -> Number
 *
 *  Returns the total duration of the animation in milliseconds. This includes
 *  both the duration of the transition and any delay before it executes.
 **/
Firmin.Animation.prototype.getTotalDuration = function() {
    return this.transition ?
        this.transition.getDuration() + this.transition.getDelay() : 0;
};

/**
 *  Firmin.Animation#exec(element) -> undefined
 *  - element (HTMLElement): the DOM element to apply the animation to.
 *
 *  This method applies the animation to the given element.
 **/
Firmin.Animation.prototype.exec = function(element) {
    var properties = this.style, property;
    
    if (this.transition) properties = this.transition.build(properties);
    if (this.transform)  properties = this.transform.build(properties);
    
    for (property in properties) {
        element.style[property] = properties[property];
    }
};

/**
 *  class Firmin.Animated
 *
 *  Instances of [[Firmin.Animated]] allow for the construction of chained
 *  sequences of animations: they contain a list of Animation objects, and as
 *  soon as one animation completes, it fires the next. Because
 *  [[Firmin.Animated]] objects are returned by the [[Firmin.animate]]
 *  function, and calling the animate method on an `Animated` object returns
 *  the object itself, one can call `animate` (or one of the transform function
 *  aliases) any number of times in a chain of method calls.
 *
 *      Firmin.animate(el, {color: "#f00"}, "1.0s")
 *          .translateX("500px", "0.4s")
 *          .scale(2, "0.5s")
 *          .rotate("30deg", "0.1s");
 *
 *  Because of the callback-based nature of the animations, the method chain
 *  will run synchronously, but firing the animations will not block the
 *  execution of the next statement. For examples of prior art in this area,
 *  take a look at [JS.MethodChain][methodchain] and
 *  [Ojay's animation module][ojayanim].
 *
 *  [methodchain]: http://jsclass.jcoglan.com/methodchain.html
 *  [ojayanim]:    http://ojay.othermedia.org/articles/animation.html
 **/

/**
 *  new Firmin.Animated(element)
 *  - element (HTMLElement): the DOM element which animations defined in this
 *    chain should be applied to.
 **/
Firmin.Animated = function(element) {
    var self = this;
    
    this.element    = element;
    this.operations = [];
    this.callback   = null;
};

/**
 *  Firmin.Animated#run() -> undefined
 *
 *  Execute the first animation in the chain and set a timeout to fire any
 *  callbacks and run the next animation once the first one has completed.
 **/
Firmin.Animated.prototype.run = function() {
    var animation = this.operations.shift(),
        self      = this;
    
    if (!animation) {
        this.fired = true;
        return this;
    }
    
    setTimeout(function() {
        animation.exec(self.element);
    }, 10);
    
    setTimeout(function() {
        self.fireCallback();
        self.run();
    }, animation.getTotalDuration() || 10);
    
    this.callback = animation.callback;
    
    return this;
};

/**
 *  Firmin.Animated#fireCallback() -> undefined
 *
 *  Fire the current callback.
 **/
Firmin.Animated.prototype.fireCallback = function() {
    var callback = this.callback;
    
    if (typeof callback === "function") {
        callback.call(null, this.element);
    }
};

/**
 *  Firmin.Animated#__animate__(animation) -> Firmin.Animated
 *  - animation (Firmin.Animated): an animation to push onto the stack.
 *
 *  Internal method to add an animation to the stack and restart the animation
 *  execution chain if it has halted.
 **/
Firmin.Animated.prototype.__animate__ = function(animation) {
    this.operations.push(animation);
    this.__lastAnim = animation;
    
    if (this.fired) {
        this.fired = false;
        this.run();
    }
    
    return this;
};

/**
 *  Firmin.Animated#animate(description[, duration][, callback]) -> Firmin.Animated
 *  - description (Object): a user-supplied description of the animation to be
 *    performed.
 *  - duration (Number | String): the duration of the animation.
 *  - callback (Function): a callback function to execute once the described
 *    animation has run.
 *
 *  An 'absolute' animation function, which will transform the animated element
 *  from its base transform rather than its current transformation matrix.
 **/
Firmin.Animated.prototype.animate = function(description, duration, callback) {
    description.duration = duration;
    description.callback = callback;
    
    return this.__animate__(new Firmin.Animation(description));
};

/**
 *  Firmin.Animated#animateR(description[, duration][, callback]) -> Firmin.Animated
 *  - description (Object): a user-supplied description of the animation to be
 *    performed.
 *  - duration (Number | String): the duration of the animation.
 *  - callback (Function): a callback function to execute once the described
 *    animation has run.
 *
 *  A 'relative' animation function, which will base the transformation of the
 *  animated element on its current transform matrix rather than its base
 *  transform.
 **/
Firmin.Animated.prototype.animateR = function(description, duration, callback) {
    description.duration = duration;
    description.callback = callback;
    
    return this.__animate__(new Firmin.Animation(description, this.__lastAnim));
};

/**
 *  Firmin.animate(element, description[, duration][, callback]) -> Firmin.Animated
 *  - element (HTMLElement): the element to animate.
 *  - description (Object): the description of the animation.
 *  - duration (Number | String): the duration of the animation.
 *  - callback (Function): a function to execute after the animation completes.
 *
 *  The [[Firmin.animate]] function is the starting point for most animations
 *  in Firmin, and the basis for all the specialised transformational methods.
 *
 *      Firmin.animate(document.getElementById('example'), {
 *          backgroundColor: '#f00',
 *          marginTop:       '200px'
 *      }, 1.5);
 *
 *  If any transform methods (such as `translate` or `rotate`) are specified,
 *  the transformation will be 'absolute', i.e. it will be calculated from the
 *  element's base transform rather than its current transform matrix.
 *
 *  ##### Transform function aliases
 *
 *  For convenience, all the transform functions are provided as wrappers
 *  around the [[Firmin.animate]] function and method. Without these wrappers,
 *  one would have to call animate and pass in a description, even if that
 *  description only contained one transform function:
 *
 *      Firmin.animate(el, {rotate: "45deg"});
 *
 *  By effectively aliasing rotate to this call, one can effectively use rotate
 *  (or any other transform function) directly:
 *
 *      Firmin.rotate(el, "45deg");
 *
 *  The abbreviated notation expresses intention more directly in such
 *  scenarios, and thus should be preferred.
 **/
Firmin.animate = function(element, description, duration, callback) {
    var animated = new Firmin.Animated(element);
    
    animated.animate(description, duration, callback);
    
    return animated.run();
};

/**
 *  Firmin.animateR(element, description[, duration][, callback]) -> Firmin.Animated
 *  - element (HTMLElement): the element to animate.
 *  - description (Object): the description of the animation.
 *  - duration (Number | String): the duration of the animation.
 *  - callback (Function): a function to execute after the animation completes.
 *
 *  [[Firmin.animateR]] is the 'relative' version of [[Firmin.animate]]: if any
 *  transform methods (such as `translate` or `rotate`) are specified, the
 *  transformation will be based on the element's current transform matrix
 *  rather than its base transform.
 **/
Firmin.animateR = function(element, description, duration, callback) {
    var animated  = new Firmin.Animated(element),
        previous  = new Firmin.Animation({}),
        transform = new Firmin.Transform(),
        matrix    = new Firmin.CSSMatrix(),
        cssStr    = element.style[Firmin.prefix + "Transform"];
    
    matrix.setMatrixValue(cssStr);
    
    transform.ctm       = matrix;
    previous.transform  = transform;
    animated.__lastAnim = previous;
    
    animated.animateR(description, duration, callback);
    
    return animated.run();
};

/** related to: Firmin.Transform#translate
 *  Firmin.translate(element, distances[, duration][, callback]) -> Firmin.Animated
 *  - element (HTMLElement): the element to animate.
 *  - distances (Array | Object | Number | String): the distances in pixels to
 *    translate the element by.
 *  - duration (Number | String): the duration of the animation.
 *  - callback (Function): a function to execute after the animation completes.
 **/

/** alias of: Firmin.translate, related to: Firmin.Transform#translate3d
 *  Firmin.translate3d(element, distances[, duration][, callback]) -> Firmin.Animated
 *  - element (HTMLElement): the element to animate.
 *  - distances (Array | Object | Number | String): the distances in pixels to
 *    translate the element by.
 *  - duration (Number | String): the duration of the animation.
 *  - callback (Function): a function to execute after the animation completes.
 **/

/** related to: Firmin.Transform#translateX
 *  Firmin.translateX(element, distance[, duration][, callback]) -> Firmin.Animated
 *  - element (HTMLElement): the element to animate.
 *  - distance (Array | Object | Number | String): the distance in pixels to
 *    translate the element along the x axis.
 *  - duration (Number | String): the duration of the animation.
 *  - callback (Function): a function to execute after the animation completes.
 **/

/** related to: Firmin.Transform#translateY
 *  Firmin.translateY(element, distance[, duration][, callback]) -> Firmin.Animated
 *  - element (HTMLElement): the element to animate.
 *  - distance (Array | Object | Number | String): the distance in pixels to
 *    translate the element along the y axis.
 *  - duration (Number | String): the duration of the animation.
 *  - callback (Function): a function to execute after the animation completes.
 **/

/** related to: Firmin.Transform#translateZ
 *  Firmin.translateZ(element, distance[, duration][, callback]) -> Firmin.Animated
 *  - element (HTMLElement): the element to animate.
 *  - distance (Array | Object | Number | String): the distance in pixels to
 *    translate the element along the z axis.
 *  - duration (Number | String): the duration of the animation.
 *  - callback (Function): a function to execute after the animation completes.
 **/

/** related to: Firmin.Transform#scale
 *  Firmin.scale(element, magnitudes[, duration][, callback]) -> Firmin.Animated
 *  - element (HTMLElement): the element to animate.
 *  - magnitudes (Array | Object | Number): the scaling factors to be applied
 *    to the x, y and z axes.
 *  - duration (Number | String): the duration of the animation.
 *  - callback (Function): a function to execute after the animation completes.
 **/

/** alias of: Firmin.scale, related to: Firmin.Transform#scale3d
 *  Firmin.scale3d(element, magnitudes[, duration][, callback]) -> Firmin.Animated
 *  - element (HTMLElement): the element to animate.
 *  - magnitudes (Array | Object | Number): the scaling factors to be applied
 *    to the x, y and z axes.
 *  - duration (Number | String): the duration of the animation.
 *  - callback (Function): a function to execute after the animation completes.
 **/

/** related to: Firmin.Transform#scaleX
 *  Firmin.scaleX(element, magnitude[, duration][, callback]) -> Firmin.Animated
 *  - element (HTMLElement): the element to animate.
 *  - magnitude (Number): the distance to scale the element along the x axis.
 *  - duration (Number | String): the duration of the animation.
 *  - callback (Function): a function to execute after the animation completes.
 **/

/** related to: Firmin.Transform#scaleY
 *  Firmin.scaleY(element, magnitude[, duration][, callback]) -> Firmin.Animated
 *  - element (HTMLElement): the element to animate.
 *  - magnitude (Number): the distance to scale the element along the y axis.
 *  - duration (Number | String): the duration of the animation.
 *  - callback (Function): a function to execute after the animation completes.
 **/

/** related to: Firmin.Transform#scaleZ
 *  Firmin.scaleZ(element, magnitude[, duration][, callback]) -> Firmin.Animated
 *  - element (HTMLElement): the element to animate.
 *  - magnitude (Number): the distance to scale the element along the z axis.
 *  - duration (Number | String): the duration of the animation.
 *  - callback (Function): a function to execute after the animation completes.
 **/

/** related to: Firmin.Transform#rotate
 *  Firmin.rotate(element, angle[, duration][, callback]) -> Firmin.Animated
 *  - element (HTMLElement): the element to animate.
 *  - angle (Number | String): the angle to rotate the element by, in the plane
 *    of the web page (i.e. the z axis).
 *  - duration (Number | String): the duration of the animation.
 *  - callback (Function): a function to execute after the animation completes.
 **/

/** related to: Firmin.Transform#rotate3d
 *  Firmin.rotate3d(element, params[, duration][, callback]) -> Firmin.Animated
 *  - element (HTMLElement): the element to animate.
 *  - params (Object): an object describing the rotation to perform. It should
 *    have `x`, `y` and `z` properties which state the vector around which the
 *    rotation should be performed, and an `angle` property determining the
 *    magnitude of the rotation. The `angle` property can be either a number
 *    (assumed to be in degrees) or a string representation of a CSS angle
 *    (e.g. `"90deg"`, `"1.4rad"`).
 *  - duration (Number | String): the duration of the animation.
 *  - callback (Function): a function to execute after the animation completes.
 **/

/** related to: Firmin.Transform#rotateX
 *  Firmin.rotateX(element, angle[, duration][, callback]) -> Firmin.Animated
 *  - element (HTMLElement): the element to animate.
 *  - angle (Number | String): the angle around the x axis which the element
 *    should be rotated. It can be either a number or a string representation of
 *    a CSS angle.
 *  - duration (Number | String): the duration of the animation.
 *  - callback (Function): a function to execute after the animation completes.
 **/

/** related to: Firmin.Transform#rotateY
 *  Firmin.rotateY(element, angle[, duration][, callback]) -> Firmin.Animated
 *  - element (HTMLElement): the element to animate.
 *  - angle (Number | String): the angle around the y axis which the element
 *    should be rotated. It can be either a number or a string representation of
 *    a CSS angle.
 *  - duration (Number | String): the duration of the animation.
 *  - callback (Function): a function to execute after the animation completes.
 **/

/** related to: Firmin.Transform#rotateZ
 *  Firmin.rotateZ(element, angle[, duration][, callback]) -> Firmin.Animated
 *  - element (HTMLElement): the element to animate.
 *  - angle (Number | String): the angle around the z axis which the element
 *    should be rotated. It can be either a number or a string representation of
 *    a CSS angle.
 *  - duration (Number | String): the duration of the animation.
 *  - callback (Function): a function to execute after the animation completes.
 **/

/** related to: Firmin.Transform#skew
 *  Firmin.skew(element, angles[, duration][, callback]) -> Firmin.Animated
 *  - element (HTMLElement): the element to animate.
 *  - angles (Array | Object | Number | String): the amounts by which the
 *    element should be skewed along the x and y axes.
 *  - duration (Number | String): the duration of the animation.
 *  - callback (Function): a function to execute after the animation completes.
 **/

/** related to: Firmin.Transform#skewX
 *  Firmin.skewX(element, angle[, duration][, callback]) -> Firmin.Animated
 *  - element (HTMLElement): the element to animate.
 *  - angle (Number | String): the angle by which the element should be skewed
 *    along the x axis.
 *  - duration (Number | String): the duration of the animation.
 *  - callback (Function): a function to execute after the animation completes.
 **/

/** related to: Firmin.Transform#skewY
 *  Firmin.skewY(element, angle[, duration][, callback]) -> Firmin.Animated
 *  - element (HTMLElement): the element to animate.
 *  - angle (Number | String): the angle by which the element should be skewed
 *    along the y axis.
 *  - duration (Number | String): the duration of the animation.
 *  - callback (Function): a function to execute after the animation completes.
 **/

/** related to: Firmin.Transform#matrix
 *  Firmin.matrix(element, vector[, duration][, callback]) -> Firmin.Animated
 *  - element (HTMLElement): the element to animate.
 *  - vector (Array): representation of a transform matrix in column-major
 *    order.
 *  - duration (Number | String): the duration of the animation.
 *  - callback (Function): a function to execute after the animation completes.
 **/

/** alias for: Firmin.matrix, related to: Firmin.Transform#matrix3d
 *  Firmin.matrix3d(element, vector[, duration][, callback]) -> Firmin.Animated
 *  - element (HTMLElement): the element to animate.
 *  - vector (Array): representation of a transform matrix in column-major
 *    order.
 *  - duration (Number | String): the duration of the animation.
 *  - callback (Function): a function to execute after the animation completes.
 **/

Firmin.Transform.methods.forEach(function(method) {
    var relativeMethod = method + "R";
    
    Firmin[method] = function(el, value, t, cb) {
        var description = {};
        description[method] = value;
        return Firmin.animate(el, description, t, cb);
    };
    
    Firmin[relativeMethod] = function(el, value, t, cb) {
        var description = {};
        description[method] = value;
        return Firmin.animateR(el, description, t, cb);
    };
    
    Firmin.Animated.prototype[method] = function(value, t, cb) {
        var description = {};
        description[method] = value;
        return this.animate(description, t, cb);
    };
    
    Firmin.Animated.prototype[relativeMethod] = function(value, t, cb) {
        var description = {};
        description[method] = value;
        return this.animateR(description, t, cb);
    };
});
