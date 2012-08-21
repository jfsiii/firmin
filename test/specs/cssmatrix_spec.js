JS.ENV.FirminCSSMatrixSpec = JS.Test.describe('FirminCSSMatrix', function() {
    this.describe('FirminCSSMatrix', function () {
        this.before(function() {
            var POINTS = this.POINTS = ['m11', 'm12', 'm13', 'm14',
                                        'm21', 'm22', 'm23', 'm24',
                                        'm31', 'm32', 'm33', 'm34',
                                        'm41', 'm42', 'm43', 'm44'];

            this.seedRandomValues = function(ceil, floor) {
               ceil  = ceil  || 1;
               floor = floor && floor < ceil ? floor : 0;

               return POINTS.map(function(p) {
                   return Math.random() * (ceil - floor) + floor;
               });
           };

           this.seedRandomIntegers = function(ceil, floor) {
               ceil  = ceil  || 1;
               floor = floor && floor < ceil ? floor : 0;

               return POINTS.map(function(p) {
                   return Math.floor(Math.random() * (ceil - floor) + floor);
               });
           };

           this.setMatrixValues = function(matrix, seed) {
               var points = seed.length === 6 ?
                            ["a", "b", "c", "d", "e", "f"] : POINTS;
               seed.forEach(function(value, i) {
                   matrix[points[i]] = value;
               });
           };
        });

        this.it('is initially equal to the reference implementation', function() {
            this.assertMatricesEqual(new WebKitCSSMatrix(),
                                     new FirminCSSMatrix());
        });

        this.it('is equal to the reference implementation when both their points are set equally', function() {
            var a = new WebKitCSSMatrix(),
                b = new FirminCSSMatrix();

            this.POINTS.forEach(function(p) {
                var x = Math.round(Math.random() * 10);

                a[p] = x;
                b[p] = x;
            });

            this.assertMatricesEqual(a, b);
        });

        this.it('has the same value when multiplied as the reference implementation', function() {
            var a = new WebKitCSSMatrix(),
                b = new FirminCSSMatrix(),
                c = new WebKitCSSMatrix();

            this.POINTS.forEach(function(p) {
                var x = Math.round(Math.random() * 10),
                    y = Math.round(Math.random() * 10);

                a[p] = x;
                b[p] = x;
                c[p] = y;
            });

            this.assertMatricesEqual(a.multiply(c),
                                     b.multiply(c));
        });

        this.it('is equal under inversion to the reference implementation', function() {
            var a = new WebKitCSSMatrix(),
                b = new FirminCSSMatrix(),
                s = this.seedRandomIntegers(3, -3);

            this.setMatrixValues(a, s);
            this.setMatrixValues(b, s);

            this.assertMatricesEqual(a.inverse(),
                                     b.inverse());
        });

        this.it('is equal under scaling to the reference implementation', function() {
            var a = new WebKitCSSMatrix(),
                b = new FirminCSSMatrix();

            this.assertMatricesEqual(a.scale(0.5, 1.5, 2),
                                     b.scale(0.5, 1.5, 2));
        });

        this.it('is equal under translation to the reference implementation', function() {
            var a = new WebKitCSSMatrix(),
                b = new FirminCSSMatrix()

            this.assertMatricesEqual(a.translate(100, 200, -50),
                                     b.translate(100, 200, -50));
        });

        this.it('is equal under rotation about a vector to the reference implementation', function() {
            var a = new WebKitCSSMatrix(),
                b = new FirminCSSMatrix(),
                x = Math.random(),
                y = Math.random(),
                z = Math.random(),
                p = Math.round(Math.random() * 90);

            this.assertMatricesEqual(a.rotateAxisAngle(x, y, z, p),
                                     b.rotateAxisAngle(x, y, z, p));
        });

        this.it('is equal under rotation about each axis to the reference implementation', function() {
            var a = new WebKitCSSMatrix(),
                b = new FirminCSSMatrix(),
                x = Math.round(Math.random() * 90),
                y = Math.round(Math.random() * 90),
                z = Math.round(Math.random() * 90);

            this.assertMatricesEqual(a.rotate(x, y, z),
                                     b.rotate(x, y, z));
        });

        this.it('is equal under mutiple transforms to the reference implementation', function(){
            var skewedString = (new WebKitCSSMatrix('skew(20deg, 40deg)')).toString();
            // "matrix(1.000000, 0.839100, 0.363970, 1.000000, 0.000000, 0.000000)"

            this.assertMatricesEqual((new WebKitCSSMatrix(skewedString)).rotate(90),
                                     (new FirminCSSMatrix(skewedString)).rotate(90));
        });

        this.it('deserialises to the same values as the reference implementation', function() {
            var a  = new WebKitCSSMatrix(),
                b  = new FirminCSSMatrix(),
                s1 = this.seedRandomValues(3, -3),
                t1 = "matrix3d(" + s1.join(", ") + ")";

            a.setMatrixValue(t1);
            b.setMatrixValue(t1);

            this.assertMatricesEqual(a, b);

            var c  = new WebKitCSSMatrix(),
                d  = new FirminCSSMatrix(),
                s2 = this.seedRandomValues(2, -1).slice(0, 6),
                t2 = "matrix(" + s2.join(", ") + ")";

            c.setMatrixValue(t2);
            d.setMatrixValue(t2);

            this.assertMatricesEqual(c, d);

            var e = new WebKitCSSMatrix(),
                f = new FirminCSSMatrix();

            e.setMatrixValue("");
            f.setMatrixValue("");

            this.assertMatricesEqual(e, f);
        });

        this.it('serialises to the same string representation as the reference implementation', function() {
            var a = new WebKitCSSMatrix(),
                b = new FirminCSSMatrix(),
                s = this.seedRandomValues(3, -3);

            this.assertEqual(a.toString(), b.toString());

            this.setMatrixValues(a, s);
            this.setMatrixValues(b, s);

            this.assertEqual(a.toString(), b.toString());
        });
    });
});

JS.ENV.CSSMatrixSpec = JS.Test.describe('CSSMatrix', function() {
    this.describe('CSSMatrix', function () {
        this.before(function () {
            this.CSSMatrix = FirminCSSMatrix;
        });

        // from http://src.chromium.org/svn/branches/WebKit/472/LayoutTests/transforms/cssmatrix-2d-interface.xhtml
        this.describe('2D', function () {
            this.describe('constructors', function () {
                this.it('should return a value when called via the default constructor', function () {
                    var m = new this.CSSMatrix();
                    this.assert(m);
                });

                this.it('should return a value when called via the object constructor', function () {
                    var m = new this.CSSMatrix();
                    var m2 = new this.CSSMatrix(m);
                    this.assert(m);
                });

                this.it('should return a value when called via the string constructor', function () {
                    var m = new this.CSSMatrix("matrix(1, 0, 0, 1, 0, 0)");
                    this.assert(m);
                });

                this.it('should throw on bad input to string constructor', function () {
                    this.assertThrows(Error, function () {
                        new this.CSSMatrix("banana")
                    });
                });
            });

            this.describe('attributes', function () {
                this.it('should have proper attibutes on the default matrix', function () {
                    var m = new this.CSSMatrix();

                    this.assertEqual(1, m.a);
                    this.assertEqual(0, m.b);
                    this.assertEqual(0, m.c);
                    this.assertEqual(1, m.d);
                    this.assertEqual(0, m.e);
                    this.assertEqual(0, m.f);
                });

                this.it('should have proper attributes on a custom matrix', function () {
                    var m = new this.CSSMatrix("matrix(11, 12, 21, 22, 41, 42)");

                    this.assertEqual(11, m.a);
                    this.assertEqual(12, m.b);
                    this.assertEqual(21, m.c);
                    this.assertEqual(22, m.d);
                    this.assertEqual(41, m.e);
                    this.assertEqual(42, m.f);
                });
            });

            this.describe('methods', function () {
                this.describe('toString()', function () {
                    this.it('should return a correctly formatted string', function () {
                        var m = new this.CSSMatrix("matrix(1, 0, 0, 1, 0, 0)");
                        var s = m.toString();
                        var a = s.split('(');
                        this.assertEqual("matrix", a[0]);
                        var a2 = a[1].split(',');
                        this.assertEqual(1, parseFloat(a2[0]));
                        this.assertEqual(0, parseFloat(a2[1]));
                        this.assertEqual(0, parseFloat(a2[2]));
                        this.assertEqual(1, parseFloat(a2[3]));
                        this.assertEqual(0, parseFloat(a2[4]));
                        var a3 = a2[5].split(")");
                        this.assertEqual(0, parseFloat(a3[0]));
                    });
                });

                this.describe('setMatrixValue()', function () {
                    this.it('should accept a `matrix()` string', function () {
                        var m = new this.CSSMatrix();

                        m.setMatrixValue("matrix(11, 12, 21, 22, 41, 42)");
                        this.assertEqual(11, m.a);
                        this.assertEqual(12, m.b);
                        this.assertEqual(21, m.c);
                        this.assertEqual(22, m.d);
                        this.assertEqual(41, m.e);
                        this.assertEqual(42, m.f);
                    });

                    this.it('should accept 2D CSS transform function values', function () {
                        var m = new this.CSSMatrix();

                        m.setMatrixValue("translate(10px, 20px) scale(2, 3)");
                        this.assertEqual(2, m.a);
                        this.assertEqual(0, m.b);
                        this.assertEqual(0, m.c);
                        this.assertEqual(3, m.d);
                        this.assertEqual(10, m.e);
                        this.assertEqual(20, m.f);
                    });

                    this.it('should throw exception on bad arguments', function () {
                        var m = new this.CSSMatrix();
                        this.assertThrows(Error, function () { m.setMatrixValue("banana"); });
                        this.assertThrows(Error, function () { m.setMatrixValue("translate(10em, 20%)"); });
                        this.assertThrows(Error, function () { m.setMatrixValue("translate(10px, 20px) scale()"); });
                    });
                });

                this.describe('translate()', function () {
                    this.it('should return the correct value', function () {
                        var m = new this.CSSMatrix();
                        var m2 = m.translate(50,0);

                        this.assertEqual(1, m2.a);
                        this.assertEqual(0, m2.b);
                        this.assertEqual(0, m2.c);
                        this.assertEqual(1, m2.d);
                        this.assertEqual(50, m2.e);
                        this.assertEqual(0, m2.f);
                    });

                    this.it('should properly accumulate', function () {
                        var m = new this.CSSMatrix();
                        var m2 = m.translate(50,0);
                        m2 = m2.translate(50,50);

                        this.assertEqual(1, m2.a);
                        this.assertEqual(0, m2.b);
                        this.assertEqual(0, m2.c);
                        this.assertEqual(1, m2.d);
                        this.assertEqual(100, m2.e);
                        this.assertEqual(50, m2.f);
                    });

                    this.it('should be immutable', function () {
                        var m = new this.CSSMatrix();
                        var m2 = m.translate(50,0);

                        this.assertEqual(1, parseFloat(m.a));
                        this.assertEqual(0, parseFloat(m.b));
                        this.assertEqual(0, parseFloat(m.c));
                        this.assertEqual(1, parseFloat(m.d));
                        this.assertEqual(0, parseFloat(m.e));
                        this.assertEqual(0, parseFloat(m.f));
                    });
                });

                this.describe('skewX()', function () {
                    this.it('should skew properly', function () {
                        var degrees = 114.591559;
                        var m = (new this.CSSMatrix()).skewX(degrees);
                        var refString = "matrix(1.000000, 0.000000, -2.185040, 1.000000, 0.000000, 0.000000)"

                        this.assertEqual(1, parseFloat(m.a));
                        this.assertEqual(0, parseFloat(m.b));
                        this.assertEqual(-2.185040, Number(parseFloat(m.c).toPrecision(7)));
                        this.assertEqual(1, parseFloat(m.d));
                        this.assertEqual(0, parseFloat(m.e));
                        this.assertEqual(0, parseFloat(m.f));
                    });
                });

                this.describe('skewY()', function () {
                    this.it('should skew properly', function () {
                        var degrees = 114.591559;
                        var m = (new this.CSSMatrix()).skewY(degrees);
                        var refString = "matrix(1.000000, -2.185040, 0.000000, 1.000000, 0.000000, 0.000000)";

                        this.assertEqual(1, parseFloat(m.a));
                        this.assertEqual(-2.185040, Number(parseFloat(m.b).toPrecision(7)));
                        this.assertEqual(0, parseFloat(m.c));
                        this.assertEqual(1, parseFloat(m.d));
                        this.assertEqual(0, parseFloat(m.e));
                        this.assertEqual(0, parseFloat(m.f));
                    });
                });

                this.describe('scale()', function () {
                    this.it('should return the correct value on a uniform scale', function () {
                        var m = new this.CSSMatrix();
                        var m2 = m.scale(5);

                        this.assertEqual(5, m2.a);
                        this.assertEqual(0, m2.b);
                        this.assertEqual(0, m2.c);
                        this.assertEqual(5, m2.d);
                        this.assertEqual(0, m2.e);
                        this.assertEqual(0, m2.f);
                    });

                    this.it('should be immutable on a uniform scale', function () {
                        var m = new this.CSSMatrix();
                        var m2 = m.scale(5);

                        this.assertEqual(1, parseFloat(m.a));
                        this.assertEqual(0, parseFloat(m.b));
                        this.assertEqual(0, parseFloat(m.c));
                        this.assertEqual(1, parseFloat(m.d));
                        this.assertEqual(0, parseFloat(m.e));
                        this.assertEqual(0, parseFloat(m.f));
                    });

                    this.it('should return the correct value on a non-nuniform scale', function () {
                        var m = new this.CSSMatrix();
                        var m2 = m.scale(2, 1);

                        this.assertEqual(2, m2.a);
                        this.assertEqual(0, m2.b);
                        this.assertEqual(0, m2.c);
                        this.assertEqual(1, m2.d);
                        this.assertEqual(0, m2.e);
                        this.assertEqual(0, m2.f);
                    });

                    this.it('should be immutable on a non-nuniform scale', function () {
                        var m = new this.CSSMatrix();
                        var m2 = m.scale(2, 1);

                        this.assertEqual(1, parseFloat(m.a));
                        this.assertEqual(0, parseFloat(m.b));
                        this.assertEqual(0, parseFloat(m.c));
                        this.assertEqual(1, parseFloat(m.d));
                        this.assertEqual(0, parseFloat(m.e));
                        this.assertEqual(0, parseFloat(m.f));
                    });
                });

                this.describe('rotate()', function () {
                    this.it('should return the correct value', function () {
                        var m = new this.CSSMatrix();
                        var m2 = m.rotate(10);

                        this.assertEqual(0.984808, parseFloat(m2.a.toPrecision(6)));
                        this.assertEqual(0.173648, parseFloat(m2.b.toPrecision(6)));
                        this.assertEqual(-0.173648, parseFloat(m2.c.toPrecision(6)));
                        this.assertEqual(0.984808, parseFloat(m2.d.toPrecision(6)));
                        this.assertEqual(0, m.e);
                        this.assertEqual(0, m.f);
                    });

                    this.it('should be immutable', function () {
                        var m = new this.CSSMatrix();
                        var m2 = m.rotate(10);

                        this.assertEqual(1, parseFloat(m.a));
                        this.assertEqual(0, parseFloat(m.b));
                        this.assertEqual(0, parseFloat(m.c));
                        this.assertEqual(1, parseFloat(m.d));
                        this.assertEqual(0, parseFloat(m.e));
                        this.assertEqual(0, parseFloat(m.f));
                    });
                });

                this.describe('multiply()', function () {
                    this.it('should return the correct value', function () {
                        var m = new this.CSSMatrix("matrix(1, 2, 3, 4, 5, 6)");
                        var m2 = new this.CSSMatrix("matrix(7, 8, 9, 10, 11, 12)");
                        var m3 = m.multiply(m2);
                        this.assertEqual(31, parseFloat(m3.a));
                        this.assertEqual(46, parseFloat(m3.b));
                        this.assertEqual(39, parseFloat(m3.c));
                        this.assertEqual(58, parseFloat(m3.d));
                        this.assertEqual(52, parseFloat(m3.e));
                        this.assertEqual(76, parseFloat(m3.f));

                    });

                    this.it('should work in the correct direction', function () {
                        var tx = new this.CSSMatrix();
                        var sx = new this.CSSMatrix();
                        tx = tx.translate(100,0);
                        sx = sx.scale(2,1);
                        var m = tx.multiply(sx);

                        this.assertEqual(2, m.a);
                        this.assertEqual(0, m.b);
                        this.assertEqual(0, m.c);
                        this.assertEqual(1, m.d);
                        this.assertEqual(100, m.e);
                        this.assertEqual(0, m.f);
                    });

                    this.it('should be immutable', function () {
                        var tx = new this.CSSMatrix();
                        var sx = new this.CSSMatrix();
                        tx = tx.translate(100,0);
                        sx = sx.scale(2,1);
                        var m = tx.multiply(sx);

                        this.assertEqual(1, tx.a);
                        this.assertEqual(0, tx.b);
                        this.assertEqual(0, tx.c);
                        this.assertEqual(1, tx.d);
                        this.assertEqual(100, tx.e);
                        this.assertEqual(0, tx.f);
                        this.assertEqual(2, sx.a);
                        this.assertEqual(0, sx.b);
                        this.assertEqual(0, sx.c);
                        this.assertEqual(1, sx.d);
                        this.assertEqual(0, sx.e);
                        this.assertEqual(0, sx.f);
                    });

                    this.it('should be null when called with no arguments', function () {
                        var m = new this.CSSMatrix("matrix(1, 2, 3, 4, 5, 6)");
                        var m2 = m.multiply();
                        this.assertEqual(null, m2);
                    });
                });

                this.describe('inverse()', function () {
                    this.it('should return the correct value', function () {
                        var m = new this.CSSMatrix("matrix(2, 0, 0, 2, 10, 20)");
                        var m2 = m.inverse();

                        this.assertEqual(0.5, parseFloat(m2.a));
                        this.assertEqual(0, parseFloat(m2.b));
                        this.assertEqual(0, parseFloat(m2.c));
                        this.assertEqual(0.5, parseFloat(m2.d));
                        this.assertEqual(-5, parseFloat(m2.e));
                        this.assertEqual(-10, parseFloat(m2.f));
                    });

                    this.it('should be immutable', function () {
                        var m = new this.CSSMatrix("matrix(2, 0, 0, 2, 10, 20)");
                        var m2 = m.inverse();

                        this.assertEqual(2, parseFloat(m.a));
                        this.assertEqual(0, parseFloat(m.b));
                        this.assertEqual(0, parseFloat(m.c));
                        this.assertEqual(2, parseFloat(m.d));
                        this.assertEqual(10, parseFloat(m.e));
                        this.assertEqual(20, parseFloat(m.f));
                    });

                    this.it('should throw an exception on when inversion is impossible', function () {
                        var m = new this.CSSMatrix("matrix(0, 0, 0, 0, 0, 0)"); // not invertible
                        this.assertThrows(Error, function () { m.inverse(); });
                    });
                });
            });
        });

        // from http://src.chromium.org/svn/branches/WebKit/472/LayoutTests/transforms/cssmatrix-3d-interface.xhtml
        this.describe('3D', function () {
            this.describe('constructors', function () {
                this.it('should return a value when called via the default constructor', function () {
                    var m = new this.CSSMatrix();
                    this.assert(m);
                });

                this.it('should return a value when called via the object constructor', function () {
                    var m = new this.CSSMatrix();
                    var m2 = new this.CSSMatrix(m);
                    this.assert(m);
                });

                this.it('should return a value when called via the string constructor', function () {
                    var m = new this.CSSMatrix("matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)");
                    this.assert(m);
                });

                this.it('should throw on bad input to string constructor', function () {
                    this.assertThrows(Error, function () {
                        new this.CSSMatrix("banana")
                    });
                });
            });

            this.describe('attributes', function () {
                this.it('should have proper attibutes on the default matrix', function () {
                    var m = new this.CSSMatrix();
                    this.assertEqual(1, m.m11);
                    this.assertEqual(0, m.m12);
                    this.assertEqual(0, m.m13);
                    this.assertEqual(0, m.m14);
                    this.assertEqual(0, m.m21);
                    this.assertEqual(1, m.m22);
                    this.assertEqual(0, m.m23);
                    this.assertEqual(0, m.m24);
                    this.assertEqual(0, m.m31);
                    this.assertEqual(0, m.m32);
                    this.assertEqual(1, m.m33);
                    this.assertEqual(0, m.m34);
                    this.assertEqual(0, m.m41);
                    this.assertEqual(0, m.m42);
                    this.assertEqual(0, m.m43);
                    this.assertEqual(1, m.m44);
                });

                this.it('should have proper attributes on a custom matrix', function () {
                    var m = new this.CSSMatrix("matrix3d(11, 12, 13, 14, 21, 22, 23, 24, 31, 32, 33, 34, 41, 42, 43, 44)");
                    this.assertEqual(11, m.m11);
                    this.assertEqual(12, m.m12);
                    this.assertEqual(13, m.m13);
                    this.assertEqual(14, m.m14);
                    this.assertEqual(21, m.m21);
                    this.assertEqual(22, m.m22);
                    this.assertEqual(23, m.m23);
                    this.assertEqual(24, m.m24);
                    this.assertEqual(31, m.m31);
                    this.assertEqual(32, m.m32);
                    this.assertEqual(33, m.m33);
                    this.assertEqual(34, m.m34);
                    this.assertEqual(41, m.m41);
                    this.assertEqual(42, m.m42);
                    this.assertEqual(43, m.m43);
                    this.assertEqual(44, m.m44);
                });
            });

            this.describe('methods', function () {
                this.describe('toString()', function () {
                    this.it('should return a correctly formatted string', function () {
                        var m = new this.CSSMatrix("matrix3d(1, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)");
                        var s = m.toString();
                        var a = s.split('(');
                        this.assertEqual("matrix3d", a[0]);
                        var a2 = a[1].split(',');
                        this.assertEqual(1, parseFloat(a2[0]));
                        this.assertEqual(0, parseFloat(a2[1]));
                        this.assertEqual(0, parseFloat(a2[2]));
                        this.assertEqual(1, parseFloat(a2[3]));
                        this.assertEqual(0, parseFloat(a2[4]));
                        this.assertEqual(1, parseFloat(a2[5]));
                        this.assertEqual(0, parseFloat(a2[6]));
                        this.assertEqual(0, parseFloat(a2[7]));
                        this.assertEqual(0, parseFloat(a2[8]));
                        this.assertEqual(0, parseFloat(a2[9]));
                        this.assertEqual(1, parseFloat(a2[10]));
                        this.assertEqual(0, parseFloat(a2[11]));
                        this.assertEqual(0, parseFloat(a2[12]));
                        this.assertEqual(0, parseFloat(a2[13]));
                        this.assertEqual(0, parseFloat(a2[14]));
                        var a3 = a2[15].split(")");
                        this.assertEqual(1, parseFloat(a3[0]));
                        this.assertEqual("", a3[1]);
                    });
                });

                this.describe('setMatrixValue()', function () {
                    this.it('should accept a `matrix3d(...)` string', function () {
                        var m = new this.CSSMatrix();
                        m.setMatrixValue("matrix3d(11, 12, 13, 14, 21, 22, 23, 24, 31, 32, 33, 34, 41, 42, 43, 44)");
                        this.assertEqual(11, m.m11);
                        this.assertEqual(12, m.m12);
                        this.assertEqual(13, m.m13);
                        this.assertEqual(14, m.m14);
                        this.assertEqual(21, m.m21);
                        this.assertEqual(22, m.m22);
                        this.assertEqual(23, m.m23);
                        this.assertEqual(24, m.m24);
                        this.assertEqual(31, m.m31);
                        this.assertEqual(32, m.m32);
                        this.assertEqual(33, m.m33);
                        this.assertEqual(34, m.m34);
                        this.assertEqual(41, m.m41);
                        this.assertEqual(42, m.m42);
                        this.assertEqual(43, m.m43);
                        this.assertEqual(44, m.m44);
                    });

                    this.it('should accept 3D CSS transform function values', function () {
                        var m = new this.CSSMatrix();
                        m.setMatrixValue("translate3d(10px, 20px, 30px) scale3d(2, 3, 4)");
                        this.assertEqual(2, m.m11);
                        this.assertEqual(0, m.m12);
                        this.assertEqual(0, m.m13);
                        this.assertEqual(0, m.m14);
                        this.assertEqual(0, m.m21);
                        this.assertEqual(3, m.m22);
                        this.assertEqual(0, m.m23);
                        this.assertEqual(0, m.m24);
                        this.assertEqual(0, m.m31);
                        this.assertEqual(0, m.m32);
                        this.assertEqual(4, m.m33);
                        this.assertEqual(0, m.m34);
                        this.assertEqual(10, m.m41);
                        this.assertEqual(20, m.m42);
                        this.assertEqual(30, m.m43);
                        this.assertEqual(1, m.m44);
                    });

                    this.it('should throw exception on bad arguments', function () {
                        var m = new this.CSSMatrix();
                        this.assertThrows(Error, function () { m.setMatrixValue("banana"); });
                        this.assertThrows(Error, function () { m.setMatrixValue("translate3d(10em, 20%, 40)"); });
                        this.assertThrows(Error, function () { m.setMatrixValue("translate3d(10px, 20px, 30px) scale3d()"); });
                    });
                });

                this.describe('multiply()', function () {
                    this.it('should return the correct product', function () {
                        var m =  new this.CSSMatrix("matrix3d( 1,  2,  3,  4,  5,  6,  7,  8,  9, 10, 11, 12, 13, 14, 15, 16)");
                        var m2 = new this.CSSMatrix("matrix3d(17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32)");
                        var m3 = m.multiply(m2);

                        this.assertEqual(538, parseFloat(m3.m11));
                        this.assertEqual(612, parseFloat(m3.m12));
                        this.assertEqual(686, parseFloat(m3.m13));
                        this.assertEqual(760, parseFloat(m3.m14));
                        this.assertEqual(650, parseFloat(m3.m21));
                        this.assertEqual(740, parseFloat(m3.m22));
                        this.assertEqual(830, parseFloat(m3.m23));
                        this.assertEqual(920, parseFloat(m3.m24));
                        this.assertEqual(762, parseFloat(m3.m31));
                        this.assertEqual(868, parseFloat(m3.m32));
                        this.assertEqual(974, parseFloat(m3.m33));
                        this.assertEqual(1080, parseFloat(m3.m34));
                        this.assertEqual(874, parseFloat(m3.m41));
                        this.assertEqual(996, parseFloat(m3.m42));
                        this.assertEqual(1118, parseFloat(m3.m43));
                        this.assertEqual(1240, parseFloat(m3.m44));
                    });

                    this.it('should be immutable', function () {
                        var m =  new this.CSSMatrix("matrix3d( 1,  2,  3,  4,  5,  6,  7,  8,  9, 10, 11, 12, 13, 14, 15, 16)");
                        var m2 = new this.CSSMatrix("matrix3d(17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32)");
                        var m3 = m.multiply(m2);

                        this.assertEqual(1, parseFloat(m.m11));
                        this.assertEqual(2, parseFloat(m.m12));
                        this.assertEqual(3, parseFloat(m.m13));
                        this.assertEqual(4, parseFloat(m.m14));
                        this.assertEqual(5, parseFloat(m.m21));
                        this.assertEqual(6, parseFloat(m.m22));
                        this.assertEqual(7, parseFloat(m.m23));
                        this.assertEqual(8, parseFloat(m.m24));
                        this.assertEqual(9, parseFloat(m.m31));
                        this.assertEqual(10, parseFloat(m.m32));
                        this.assertEqual(11, parseFloat(m.m33));
                        this.assertEqual(12, parseFloat(m.m34));
                        this.assertEqual(13, parseFloat(m.m41));
                        this.assertEqual(14, parseFloat(m.m42));
                        this.assertEqual(15, parseFloat(m.m43));
                        this.assertEqual(16, parseFloat(m.m44));
                    });

                    this.it('should correctly multiply an affine matrix', function () {
                        var m =  new this.CSSMatrix("matrix3d(1, 2, 0, 0, 3, 4, 0, 0, 0, 0, 1, 0, 5, 6, 0, 1)");
                        var m2 = new this.CSSMatrix("matrix3d(7, 8, 0, 0, 9, 10, 0, 0, 0, 0, 1, 0, 11, 12, 0, 1)");
                        var m3 = m.multiply(m2);

                        this.assertEqual(31, parseFloat(m3.m11));
                        this.assertEqual(46, parseFloat(m3.m12));
                        this.assertEqual(0, parseFloat(m3.m13));
                        this.assertEqual(0, parseFloat(m3.m14));
                        this.assertEqual(39, parseFloat(m3.m21));
                        this.assertEqual(58, parseFloat(m3.m22));
                        this.assertEqual(0, parseFloat(m3.m23));
                        this.assertEqual(0, parseFloat(m3.m24));
                        this.assertEqual(0, parseFloat(m3.m31));
                        this.assertEqual(0, parseFloat(m3.m32));
                        this.assertEqual(1, parseFloat(m3.m33));
                        this.assertEqual(0, parseFloat(m3.m34));
                        this.assertEqual(52, parseFloat(m3.m41));
                        this.assertEqual(76, parseFloat(m3.m42));
                        this.assertEqual(0, parseFloat(m3.m43));
                        this.assertEqual(1, parseFloat(m3.m44));
                    });

                    this.it('should work in the correct direction', function () {
                        var tx = new this.CSSMatrix("matrix3d( 1,  0,  0,  0,  0,  1,  0,  0,  0, 0, 1, 0, 100, 0, 0, 1)");
                        var sx = new this.CSSMatrix("matrix3d( 2,  0,  0,  0,  0,  1,  0,  0,  0, 0, 1, 0, 0, 0, 0, 1)");
                        var m = tx.multiply(sx);

                        this.assertEqual(2, m.m11);
                        this.assertEqual(0, m.m12);
                        this.assertEqual(0, m.m13);
                        this.assertEqual(0, m.m14);
                        this.assertEqual(0, m.m21);
                        this.assertEqual(1, m.m22);
                        this.assertEqual(0, m.m23);
                        this.assertEqual(0, m.m24);
                        this.assertEqual(0, m.m31);
                        this.assertEqual(0, m.m32);
                        this.assertEqual(1, m.m33);
                        this.assertEqual(0, m.m34);
                        this.assertEqual(100, m.m41);
                        this.assertEqual(0, m.m42);
                        this.assertEqual(0, m.m43);
                        this.assertEqual(1, m.m44);
                    });
                });

                this.describe('inverse()', function () {
                    this.it('should return the correct value', function () {
                        var m = new this.CSSMatrix("matrix3d(2, 0, 0, 0, 0, 2, 0, 0, 0, 0, 2, 0, 10, 20, 30, 1)");
                        var m2 = m.inverse();

                        this.assertEqual(0.5, parseFloat(m2.m11));
                        this.assertEqual(0, parseFloat(m2.m12));
                        this.assertEqual(0, parseFloat(m2.m13));
                        this.assertEqual(0, parseFloat(m2.m14));
                        this.assertEqual(0, parseFloat(m2.m21));
                        this.assertEqual(0.5, parseFloat(m2.m22));
                        this.assertEqual(0, parseFloat(m2.m23));
                        this.assertEqual(0, parseFloat(m2.m24));
                        this.assertEqual(0, parseFloat(m2.m31));
                        this.assertEqual(0, parseFloat(m2.m32));
                        this.assertEqual(0.5, parseFloat(m2.m33));
                        this.assertEqual(0, parseFloat(m2.m34));
                        this.assertEqual(-5, parseFloat(m2.m41));
                        this.assertEqual(-10, parseFloat(m2.m42));
                        this.assertEqual(-15, parseFloat(m2.m43));
                        this.assertEqual(1, parseFloat(m2.m44));
                    });

                    this.it('should be immutable', function () {
                        var m = new this.CSSMatrix("matrix3d(2, 0, 0, 0, 0, 2, 0, 0, 0, 0, 2, 0, 10, 20, 30, 1)");
                        var m2 = m.inverse();

                        this.assertEqual(2, parseFloat(m.m11));
                        this.assertEqual(0, parseFloat(m.m12));
                        this.assertEqual(0, parseFloat(m.m13));
                        this.assertEqual(0, parseFloat(m.m14));
                        this.assertEqual(0, parseFloat(m.m21));
                        this.assertEqual(2, parseFloat(m.m22));
                        this.assertEqual(0, parseFloat(m.m23));
                        this.assertEqual(0, parseFloat(m.m24));
                        this.assertEqual(0, parseFloat(m.m31));
                        this.assertEqual(0, parseFloat(m.m32));
                        this.assertEqual(2, parseFloat(m.m33));
                        this.assertEqual(0, parseFloat(m.m34));
                        this.assertEqual(10, parseFloat(m.m41));
                        this.assertEqual(20, parseFloat(m.m42));
                        this.assertEqual(30, parseFloat(m.m43));
                        this.assertEqual(1, parseFloat(m.m44));
                    });

                    this.it('should throw an exception on when inversion is impossible', function () {
                        var m = new this.CSSMatrix("matrix3d(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0)"); // not invertible
                        this.assertThrows(Error, function () { m.inverse(); });
                    });
                });

                this.describe('translate()', function () {
                    this.it('should return the correct value', function () {
                        var m = new this.CSSMatrix();
                        var m2 = m.translate(10, 20, 30);

                        this.assertEqual(1, m2.m11);
                        this.assertEqual(0, m2.m12);
                        this.assertEqual(0, m2.m13);
                        this.assertEqual(0, m2.m14);
                        this.assertEqual(0, m2.m21);
                        this.assertEqual(1, m2.m22);
                        this.assertEqual(0, m2.m23);
                        this.assertEqual(0, m2.m24);
                        this.assertEqual(0, m2.m31);
                        this.assertEqual(0, m2.m32);
                        this.assertEqual(1, m2.m33);
                        this.assertEqual(0, m2.m34);
                        this.assertEqual(10, m2.m41);
                        this.assertEqual(20, m2.m42);
                        this.assertEqual(30, m2.m43);
                        this.assertEqual(1, m2.m44);
                    });

                    this.it('should be immutable', function () {
                        var m = new this.CSSMatrix();
                        var m2 = m.translate(10, 20, 30);

                        this.assertEqual(1, m.m11);
                        this.assertEqual(0, m.m12);
                        this.assertEqual(0, m.m13);
                        this.assertEqual(0, m.m14);
                        this.assertEqual(0, m.m21);
                        this.assertEqual(1, m.m22);
                        this.assertEqual(0, m.m23);
                        this.assertEqual(0, m.m24);
                        this.assertEqual(0, m.m31);
                        this.assertEqual(0, m.m32);
                        this.assertEqual(1, m.m33);
                        this.assertEqual(0, m.m34);
                        this.assertEqual(0, m.m41);
                        this.assertEqual(0, m.m42);
                        this.assertEqual(0, m.m43);
                        this.assertEqual(1, m.m44);
                    });
                });

                this.describe('scale()', function () {
                    this.it('should scale correctly', function () {
                        var m = new this.CSSMatrix();
                        var m2 = m.scale(10, 20, 30);

                        this.assertEqual(10, m2.m11);
                        this.assertEqual(0, m2.m12);
                        this.assertEqual(0, m2.m13);
                        this.assertEqual(0, m2.m14);
                        this.assertEqual(0, m2.m21);
                        this.assertEqual(20, m2.m22);
                        this.assertEqual(0, m2.m23);
                        this.assertEqual(0, m2.m24);
                        this.assertEqual(0, m2.m31);
                        this.assertEqual(0, m2.m32);
                        this.assertEqual(30, m2.m33);
                        this.assertEqual(0, m2.m34);
                        this.assertEqual(0, m2.m41);
                        this.assertEqual(0, m2.m42);
                        this.assertEqual(0, m2.m43);
                        this.assertEqual(1, m2.m44);
                    });

                    this.it('should be immutable', function () {
                        var m = new this.CSSMatrix();
                        var m2 = m.scale(10, 20, 30);

                        this.assertEqual(1, m.m11);
                        this.assertEqual(0, m.m12);
                        this.assertEqual(0, m.m13);
                        this.assertEqual(0, m.m14);
                        this.assertEqual(0, m.m21);
                        this.assertEqual(1, m.m22);
                        this.assertEqual(0, m.m23);
                        this.assertEqual(0, m.m24);
                        this.assertEqual(0, m.m31);
                        this.assertEqual(0, m.m32);
                        this.assertEqual(1, m.m33);
                        this.assertEqual(0, m.m34);
                        this.assertEqual(0, m.m41);
                        this.assertEqual(0, m.m42);
                        this.assertEqual(0, m.m43);
                        this.assertEqual(1, m.m44);
                    });
                });

                this.describe('rotate()', function () {
                    this.it('should rotate correctly', function () {
                        var m = new this.CSSMatrix();
                        var m2 = m.rotate(10, 20, 30);

                        this.assertEqual(0.813798, parseFloat(m2.m11.toPrecision(6)));
                        this.assertEqual(0.469846, parseFloat(m2.m12.toPrecision(6)));
                        this.assertEqual(-0.34202, parseFloat(m2.m13.toPrecision(6)));
                        this.assertEqual(0, parseFloat(m2.m14.toPrecision(6)));
                        this.assertEqual(-0.44097, parseFloat(m2.m21.toPrecision(6)));
                        this.assertEqual(0.882564, parseFloat(m2.m22.toPrecision(6)));
                        this.assertEqual(0.163176, parseFloat(m2.m23.toPrecision(6)));
                        this.assertEqual(0, parseFloat(m2.m24.toPrecision(6)));
                        this.assertEqual(0.378522, parseFloat(m2.m31.toPrecision(6)));
                        this.assertEqual(0.0180283, parseFloat(m2.m32.toPrecision(6)));
                        this.assertEqual(0.925417, parseFloat(m2.m33.toPrecision(6)));
                        this.assertEqual(0, parseFloat(m2.m34.toPrecision(6)));
                        this.assertEqual(0, parseFloat(m2.m41.toPrecision(6)));
                        this.assertEqual(0, parseFloat(m2.m42.toPrecision(6)));
                        this.assertEqual(0, parseFloat(m2.m43.toPrecision(6)));
                        this.assertEqual(1, parseFloat(m2.m44.toPrecision(6)));
                    });

                    this.it('should be immutable', function () {
                        var m = new this.CSSMatrix();
                        var m2 = m.rotate(10, 20, 30);

                        this.assertEqual(1, m.m11);
                        this.assertEqual(0, m.m12);
                        this.assertEqual(0, m.m13);
                        this.assertEqual(0, m.m14);
                        this.assertEqual(0, m.m21);
                        this.assertEqual(1, m.m22);
                        this.assertEqual(0, m.m23);
                        this.assertEqual(0, m.m24);
                        this.assertEqual(0, m.m31);
                        this.assertEqual(0, m.m32);
                        this.assertEqual(1, m.m33);
                        this.assertEqual(0, m.m34);
                        this.assertEqual(0, m.m41);
                        this.assertEqual(0, m.m42);
                        this.assertEqual(0, m.m43);
                        this.assertEqual(1, m.m44);
                    });
                });

                this.describe('rotateAxisAngle()', function () {
                    this.it('should return the correct value', function () {
                        var m = new this.CSSMatrix();
                        var m2 = m.rotateAxisAngle(0.707, 0.707, 0.707, 45);

                        this.assertEqual(0.804738, parseFloat(m2.m11.toPrecision(6)));
                        this.assertEqual(0.505879, parseFloat(m2.m12.toPrecision(6)));
                        this.assertEqual(-0.310617, parseFloat(m2.m13.toPrecision(6)));
                        this.assertEqual(0, parseFloat(m2.m14.toPrecision(6)));
                        this.assertEqual(-0.310617, parseFloat(m2.m21.toPrecision(6)));
                        this.assertEqual(0.804738, parseFloat(m2.m22.toPrecision(6)));
                        this.assertEqual(0.505879, parseFloat(m2.m23.toPrecision(6)));
                        this.assertEqual(0, parseFloat(m2.m24.toPrecision(6)));
                        this.assertEqual(0.505879, parseFloat(m2.m31.toPrecision(6)));
                        this.assertEqual(-0.310617, parseFloat(m2.m32.toPrecision(6)));
                        this.assertEqual(0.804738, parseFloat(m2.m33.toPrecision(6)));
                        this.assertEqual(0, parseFloat(m2.m34.toPrecision(6)));
                        this.assertEqual(0, parseFloat(m2.m41.toPrecision(6)));
                        this.assertEqual(0, parseFloat(m2.m42.toPrecision(6)));
                        this.assertEqual(0, parseFloat(m2.m43.toPrecision(6)));
                        this.assertEqual(1, parseFloat(m2.m44.toPrecision(6)));
                    });

                    this.it('should be immutable', function () {
                        var m = new this.CSSMatrix();
                        var m2 = m.rotateAxisAngle(0.707, 0.707, 0.707, 45);

                        this.assertEqual(1, m.m11);
                        this.assertEqual(0, m.m12);
                        this.assertEqual(0, m.m13);
                        this.assertEqual(0, m.m14);
                        this.assertEqual(0, m.m21);
                        this.assertEqual(1, m.m22);
                        this.assertEqual(0, m.m23);
                        this.assertEqual(0, m.m24);
                        this.assertEqual(0, m.m31);
                        this.assertEqual(0, m.m32);
                        this.assertEqual(1, m.m33);
                        this.assertEqual(0, m.m34);
                        this.assertEqual(0, m.m41);
                        this.assertEqual(0, m.m42);
                        this.assertEqual(0, m.m43);
                        this.assertEqual(1, m.m44);
                    })
                });
            });
        });
    });
});