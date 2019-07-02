"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function sequenceT(F) {
    return function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var fst = args[0];
        var others = args.slice(1);
        var fas = F.map(fst, function (a) { return [a]; });
        for (var _a = 0, others_1 = others; _a < others_1.length; _a++) {
            var fa = others_1[_a];
            fas = F.ap(F.map(fas, function (as) { return function (a) {
                as.push(a);
                return as;
            }; }), fa);
        }
        return fas;
    };
}
exports.sequenceT = sequenceT;
function sequenceS(F) {
    return function (r) {
        var keys = Object.keys(r);
        var fst = keys[0];
        var others = keys.slice(1);
        var fr = F.map(r[fst], function (a) {
            var _a;
            return (_a = {}, _a[fst] = a, _a);
        });
        var _loop_1 = function (key) {
            fr = F.ap(F.map(fr, function (r) { return function (a) {
                r[key] = a;
                return r;
            }; }), r[key]);
        };
        for (var _i = 0, others_2 = others; _i < others_2.length; _i++) {
            var key = others_2[_i];
            _loop_1(key);
        }
        return fr;
    };
}
exports.sequenceS = sequenceS;
