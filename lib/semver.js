
(function(qunit) {
    qunit.compareSemver = function compareSemver(v1, v2, op) {
        var result = false,
            p1 = normalizeSemVer(v1),
            p2 = normalizeSemVer(v2);

        if (/^===?$/.test(op)) {
            result = semverEqual(p1, p2, 3);
        } else if (/^</.test(op)) {
            result = p1[0] < p2[0] || (semverEqual(p1, p2, 1) && p1[1] < p2[1]) || (semverEqual(p1, p2, 2) && p1[2] < p2[2]);
            if (!result && /^<=$/.test(op)) {
                result = semverEqual(p1, p2, 3);
            }
        } else if (/^>/.test(op)) {
            result = p1[0] > p2[0] || (semverEqual(p1, p2, 1) && p1[1] > p2[1]) || (semverEqual(p1, p2, 2) && p1[2] > p2[2]);
        }
        if (!result && /^[<>]=$/.test(op)) {
            result = semverEqual(p1, p2, 3);
        }
        
        function semverEqual(p1, p2, cnt) {
            var i, equal = true;
            for (i=0; i<cnt; ++i) {
                equal = equal && (p1[i] === p2[i]);
            }
            return equal;
        }
        function normalizeSemVer(v) {
            if (v.length < 1) { return "0.0.0"; }
            var p = v.toString().split('.');
            if (p.length < 2) { p[1] = "0"; }
            if (p.length < 3) { p[2] = "0"; }
            return [Number(p[0]), Number(p[1]), Number(p[2])];
        }
        
        return result;
    }
})(window.QUnit);