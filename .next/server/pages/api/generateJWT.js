"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
var exports = {};
exports.id = "pages/api/generateJWT";
exports.ids = ["pages/api/generateJWT"];
exports.modules = {

/***/ "jsonwebtoken":
/*!*******************************!*\
  !*** external "jsonwebtoken" ***!
  \*******************************/
/***/ ((module) => {

module.exports = require("jsonwebtoken");

/***/ }),

/***/ "(api)/./pages/api/generateJWT.js":
/*!**********************************!*\
  !*** ./pages/api/generateJWT.js ***!
  \**********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* binding */ handler)\n/* harmony export */ });\nconst jwt = __webpack_require__(/*! jsonwebtoken */ \"jsonwebtoken\");\n//const userKey = \"a952f746-20c7-4d82-9eea-0896af4d27e5\"; //input userkey\nconst userKey = \"bb872cb0-c6da-4c32-b68d-15ff95679837\"; //input userkey\nconst payload = {\n    appId: \"deepbrain.io\",\n    //appId: \"apr-2024-test\", //input appId\n    platform: \"web\"\n};\nconst options = {\n    header: {\n        typ: \"JWT\",\n        alg: \"HS256\"\n    },\n    expiresIn: 60 * 5\n};\nfunction generateJWT(req, res) {\n    try {\n        if (userKey.length <= 0 || payload.appId.length <= 0) {\n            res.json({\n                error: \"Empty appId or userkey\"\n            });\n        } else {\n            const clientToken = jwt.sign(payload, userKey, options);\n            res.json({\n                appId: payload.appId,\n                token: clientToken\n            });\n        }\n    } catch (e) {\n        console.log(\"jwt generate err \", e.name, e.message);\n        res.json({\n            error: e.message\n        });\n    }\n}\nfunction handler(req, res) {\n    if (req.method === \"GET\") return generateJWT(req, res);\n};\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKGFwaSkvLi9wYWdlcy9hcGkvZ2VuZXJhdGVKV1QuanMuanMiLCJtYXBwaW5ncyI6Ijs7OztBQUFBLE1BQU1BLEdBQUcsR0FBR0MsbUJBQU8sQ0FBQyxrQ0FBYyxDQUFDO0FBQ25DLHlFQUF5RTtBQUN6RSxNQUFNQyxPQUFPLEdBQUcsc0NBQXNDLEVBQUUsZUFBZTtBQUN2RSxNQUFNQyxPQUFPLEdBQUc7SUFDZEMsS0FBSyxFQUFFLGNBQWM7SUFDckIsdUNBQXVDO0lBQ3ZDQyxRQUFRLEVBQUUsS0FBSztDQUNoQjtBQUVELE1BQU1DLE9BQU8sR0FBRztJQUNkQyxNQUFNLEVBQUU7UUFBRUMsR0FBRyxFQUFFLEtBQUs7UUFBRUMsR0FBRyxFQUFFLE9BQU87S0FBRTtJQUNwQ0MsU0FBUyxFQUFFLEVBQUUsR0FBRyxDQUFDO0NBQ2xCO0FBRUQsU0FBU0MsV0FBVyxDQUFDQyxHQUFHLEVBQUVDLEdBQUcsRUFBRTtJQUM3QixJQUFJO1FBQ0YsSUFBSVgsT0FBTyxDQUFDWSxNQUFNLElBQUksQ0FBQyxJQUFJWCxPQUFPLENBQUNDLEtBQUssQ0FBQ1UsTUFBTSxJQUFJLENBQUMsRUFBRTtZQUNwREQsR0FBRyxDQUFDRSxJQUFJLENBQUM7Z0JBQUVDLEtBQUssRUFBRSx3QkFBd0I7YUFBQyxDQUFDLENBQUM7U0FDOUMsTUFBTTtZQUNMLE1BQU1DLFdBQVcsR0FBR2pCLEdBQUcsQ0FBQ2tCLElBQUksQ0FBQ2YsT0FBTyxFQUFFRCxPQUFPLEVBQUVJLE9BQU8sQ0FBQztZQUN2RE8sR0FBRyxDQUFDRSxJQUFJLENBQUM7Z0JBQUVYLEtBQUssRUFBRUQsT0FBTyxDQUFDQyxLQUFLO2dCQUFFZSxLQUFLLEVBQUVGLFdBQVc7YUFBRSxDQUFDLENBQUM7U0FDeEQ7S0FDRixDQUFDLE9BQU9HLENBQUMsRUFBRTtRQUNWQyxPQUFPLENBQUNDLEdBQUcsQ0FBQyxtQkFBbUIsRUFBRUYsQ0FBQyxDQUFDRyxJQUFJLEVBQUVILENBQUMsQ0FBQ0ksT0FBTyxDQUFDLENBQUM7UUFFcERYLEdBQUcsQ0FBQ0UsSUFBSSxDQUFDO1lBQUNDLEtBQUssRUFBRUksQ0FBQyxDQUFDSSxPQUFPO1NBQUMsQ0FBQztLQUM3QjtDQUNGO0FBRWMsU0FBU0MsT0FBTyxDQUFDYixHQUFHLEVBQUVDLEdBQUcsRUFBRTtJQUN4QyxJQUFJRCxHQUFHLENBQUNjLE1BQU0sS0FBSyxLQUFLLEVBQUUsT0FBT2YsV0FBVyxDQUFDQyxHQUFHLEVBQUVDLEdBQUcsQ0FBQyxDQUFDO0NBQ3hEIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vbmV4dGpzLy4vcGFnZXMvYXBpL2dlbmVyYXRlSldULmpzPzg4Y2UiXSwic291cmNlc0NvbnRlbnQiOlsiY29uc3Qgand0ID0gcmVxdWlyZShcImpzb253ZWJ0b2tlblwiKTtcbi8vY29uc3QgdXNlcktleSA9IFwiYTk1MmY3NDYtMjBjNy00ZDgyLTllZWEtMDg5NmFmNGQyN2U1XCI7IC8vaW5wdXQgdXNlcmtleVxuY29uc3QgdXNlcktleSA9IFwiYmI4NzJjYjAtYzZkYS00YzMyLWI2OGQtMTVmZjk1Njc5ODM3XCI7IC8vaW5wdXQgdXNlcmtleVxuY29uc3QgcGF5bG9hZCA9IHtcbiAgYXBwSWQ6IFwiZGVlcGJyYWluLmlvXCIsIC8vaW5wdXQgYXBwSWRcbiAgLy9hcHBJZDogXCJhcHItMjAyNC10ZXN0XCIsIC8vaW5wdXQgYXBwSWRcbiAgcGxhdGZvcm06IFwid2ViXCIsXG59O1xuXG5jb25zdCBvcHRpb25zID0ge1xuICBoZWFkZXI6IHsgdHlwOiBcIkpXVFwiLCBhbGc6IFwiSFMyNTZcIiB9LFxuICBleHBpcmVzSW46IDYwICogNSwgLy8gZXhwaXJlIHRpbWU6IDUgbWluc1xufTtcblxuZnVuY3Rpb24gZ2VuZXJhdGVKV1QocmVxLCByZXMpIHtcbiAgdHJ5IHtcbiAgICBpZiAodXNlcktleS5sZW5ndGggPD0gMCB8fCBwYXlsb2FkLmFwcElkLmxlbmd0aCA8PSAwKSB7XG4gICAgICByZXMuanNvbih7IGVycm9yOiAnRW1wdHkgYXBwSWQgb3IgdXNlcmtleSd9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgY2xpZW50VG9rZW4gPSBqd3Quc2lnbihwYXlsb2FkLCB1c2VyS2V5LCBvcHRpb25zKTtcbiAgICAgIHJlcy5qc29uKHsgYXBwSWQ6IHBheWxvYWQuYXBwSWQsIHRva2VuOiBjbGllbnRUb2tlbiB9KTtcbiAgICB9XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBjb25zb2xlLmxvZyhcImp3dCBnZW5lcmF0ZSBlcnIgXCIsIGUubmFtZSwgZS5tZXNzYWdlKTtcblxuICAgIHJlcy5qc29uKHtlcnJvcjogZS5tZXNzYWdlfSlcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBoYW5kbGVyKHJlcSwgcmVzKSB7XG4gIGlmIChyZXEubWV0aG9kID09PSBcIkdFVFwiKSByZXR1cm4gZ2VuZXJhdGVKV1QocmVxLCByZXMpO1xufVxuIl0sIm5hbWVzIjpbImp3dCIsInJlcXVpcmUiLCJ1c2VyS2V5IiwicGF5bG9hZCIsImFwcElkIiwicGxhdGZvcm0iLCJvcHRpb25zIiwiaGVhZGVyIiwidHlwIiwiYWxnIiwiZXhwaXJlc0luIiwiZ2VuZXJhdGVKV1QiLCJyZXEiLCJyZXMiLCJsZW5ndGgiLCJqc29uIiwiZXJyb3IiLCJjbGllbnRUb2tlbiIsInNpZ24iLCJ0b2tlbiIsImUiLCJjb25zb2xlIiwibG9nIiwibmFtZSIsIm1lc3NhZ2UiLCJoYW5kbGVyIiwibWV0aG9kIl0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(api)/./pages/api/generateJWT.js\n");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../webpack-api-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = (__webpack_exec__("(api)/./pages/api/generateJWT.js"));
module.exports = __webpack_exports__;

})();