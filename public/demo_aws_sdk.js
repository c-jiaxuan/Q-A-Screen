/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/aws_sdk_index.js":
/*!******************************!*\
  !*** ./src/aws_sdk_index.js ***!
  \******************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   appCtlr: () => (/* binding */ appCtlr)\n/* harmony export */ });\n\r\nlet transcribedText = null;\r\n\r\nclass Transcriber {\r\n  async startTranscribe() {\r\n    console.log('startTranscribe')\r\n    try {\r\n      const { startRecording } = await Promise.all(/*! import() */[__webpack_require__.e(\"vendors-node_modules_aws-sdk_client-cognito-identity_dist-es_CognitoIdentityClient_js-node_mo-3d5952\"), __webpack_require__.e(\"src_libs_transcribeClient_js\")]).then(__webpack_require__.bind(__webpack_require__, /*! ./libs/transcribeClient.js */ \"./src/libs/transcribeClient.js\"));\r\n      await startRecording('en-US', this.onTranscriptionDataReceived)\r\n\r\n      return true\r\n    } catch (error) {\r\n      alert(\"An error occurred while recording: \" + error.message);\r\n      await this.stopTranscribe();\r\n      //TODO show error popup\r\n\r\n      return false\r\n    }\r\n  };\r\n\r\n  onTranscriptionDataReceived(data) {\r\n    appCtlr.updateTranscribingText(data)\r\n  };\r\n\r\n  async stopTranscribe() {\r\n    console.log('stopTranscribe')\r\n    const { stopRecording } = await Promise.all(/*! import() */[__webpack_require__.e(\"vendors-node_modules_aws-sdk_client-cognito-identity_dist-es_CognitoIdentityClient_js-node_mo-3d5952\"), __webpack_require__.e(\"src_libs_transcribeClient_js\")]).then(__webpack_require__.bind(__webpack_require__, /*! ./libs/transcribeClient.js */ \"./src/libs/transcribeClient.js\"));\r\n    stopRecording();\r\n  };\r\n}\r\n\r\n//AppController === \r\nconst APP_STATE = Object.freeze({\r\n  AI_NONE: -1,\r\n  AI_INIT: 0,\r\n  AI_SPEAKING_GREET: 1,\r\n  IDLE: 2, //No transc, No llm. No ai speaking. \r\n  TRANSCRIBING: 3,\r\n  LLM_RESPONDING: 4,\r\n  AI_SPEAKING_LLM: 5,\r\n})\r\n\r\nclass AppController {\r\n  constructor() {\r\n    this.state = APP_STATE.NONE\r\n\r\n    this.aiPlayerInit = false\r\n    this.transcribeInit = false\r\n\r\n    this.transcribingText = ''\r\n    this.transcribeIntervalID = null\r\n    this.transcribeLastUpdateTime = -1\r\n  }\r\n\r\n  getState = () => {\r\n    return this.state\r\n  }\r\n\r\n  onAIPlayerInit = () => {\r\n    console.log(\"AI init\");\r\n\r\n    this.aiPlayerInit = true\r\n    this.checkAndUpdateInitState()\r\n  }\r\n\r\n  onTranscribeInit = () => {\r\n    console.log(\"Transcribe init\");\r\n\r\n    this.transcribeInit = true\r\n    this.checkAndUpdateInitState()\r\n  }\r\n\r\n  checkAndUpdateInitState = () => {\r\n    if (this.state == APP_STATE.NONE) {\r\n      if (this.aiPlayerInit && this.transcribeInit) {\r\n        this.startFirstGreeting()\r\n      }\r\n    }\r\n  }\r\n\r\n  startFirstGreeting = () => {\r\n    if (this.updateAppState(APP_STATE.AI_SPEAKING_GREET)) {\r\n      beginChat();\r\n      this.updateAppState(APP_STATE.IDLE, true)\r\n    }\r\n  }\r\n\r\n  onFirstGreetingComplete = () => {\r\n    //do nothing\r\n    console.log(\"onFirstGreetingComplete\");\r\n    this.updateAppState(APP_STATE.IDLE, true)\r\n  }\r\n\r\n  onNomalSpeakingComplete = () => {\r\n    //this.updateAppState(APP_STATE.IDLE, true)\r\n  }\r\n\r\n  startTranscribe = async () => {\r\n    if (this.updateAppState(APP_STATE.TRANSCRIBING)) {\r\n      transcriber.startTranscribe()\r\n      return true\r\n    }\r\n\r\n    return false\r\n  }\r\n\r\n  updateTranscribingText = (data) => {\r\n    console.log('appCtlr updateTranscribingText', data, 'appState', this.state)\r\n    if (this.state == APP_STATE.TRANSCRIBING) {\r\n      this.transcribingText += data;\r\n      transcribedText.innerHTML = this.transcribingText;\r\n    } else {\r\n      console.warn('updateTranscribingText but not \"TRANSCRIBING\" state. ignore');\r\n    }\r\n  }\r\n\r\n  onTranscribeComplete = async () => {\r\n    console.log('onTranscribeComplete text', this.transcribingText);\r\n    const userMessage = this.transcribingText;\r\n\r\n    transcriber.stopTranscribe();\r\n    this.transcribingText = '';\r\n\r\n    this.updateAppState(APP_STATE.IDLE, true);\r\n\r\n    //Send to LLMs\r\n    document.dispatchEvent(new CustomEvent('Transcribe Completed', \r\n      { detail: userMessage }\r\n    ));\r\n  }\r\n\r\n  resetTranscribe = () => { \r\n    console.log(\"clear transcribe text\");\r\n\r\n    this.transcribingText = '';\r\n    transcribedText.innerHTML = 'Speak reset! Please speak now...';\r\n  }\r\n\r\n  updateAppState(newState, isForce) {\r\n    if (isForce) {\r\n      this.state = newState\r\n    } else {\r\n      if ((this.state == APP_STATE.AI_SPEAKING_LLM || this.state == APP_STATE.LLM_RESPONDING) \r\n         && newState == APP_STATE.TRANSCRIBING) {\r\n        return false\r\n      } else {\r\n        this.state = newState\r\n      }\r\n    }\r\n\r\n    console.log(this.state)\r\n    \r\n    return true\r\n  }\r\n}\r\n\r\n//Controller instaces\r\nconst appCtlr = new AppController()\r\nconst transcriber = new Transcriber()\r\n\r\nappCtlr.onTranscribeInit();\r\n\r\ndocument.addEventListener(\"READY_TO_TRANSCRIBE\", async () => {\r\n  const state = appCtlr.getState()\r\n  console.log(state);\r\n\r\n  if(transcribedText == null) transcribedText = document.getElementById(\"AILiveInputTextVoice\");\r\n  if (state == APP_STATE.IDLE) {\r\n    const isStarted = await appCtlr.startTranscribe()\r\n    if (isStarted) {\r\n      transcribedText.innerHTML = 'Please speak now...'\r\n    }\r\n  } else {\r\n    if (state == APP_STATE.TRANSCRIBING) {\r\n      //transcribedText.innerHTML = ''\r\n      appCtlr.onTranscribeComplete()\r\n    } else {\r\n      //ignore.. LLM, SPEAK case\r\n    }\r\n  } \r\n});\r\n\r\ndocument.addEventListener(\"RESET_TRANSCRIBE\", () => { appCtlr.resetTranscribe(); });\r\n\r\ndocument.addEventListener(\"AI_INITIALIZED\", () => { appCtlr.onAIPlayerInit(); });\r\n\r\ndocument.addEventListener(\"AICLIPSET_PLAY_COMPLETED\", () => {\r\n  if (appCtlr.getState() == APP_STATE.AI_SPEAKING_GREET) {\r\n    appCtlr.onFirstGreetingComplete()\r\n  } else {\r\n    appCtlr.onNomalSpeakingComplete()\r\n  }\r\n});\r\n\n\n//# sourceURL=webpack://nextjs/./src/aws_sdk_index.js?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = __webpack_modules__;
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/ensure chunk */
/******/ 	(() => {
/******/ 		__webpack_require__.f = {};
/******/ 		// This file contains only the entry chunk.
/******/ 		// The chunk loading function for additional chunks
/******/ 		__webpack_require__.e = (chunkId) => {
/******/ 			return Promise.all(Object.keys(__webpack_require__.f).reduce((promises, key) => {
/******/ 				__webpack_require__.f[key](chunkId, promises);
/******/ 				return promises;
/******/ 			}, []));
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/get javascript chunk filename */
/******/ 	(() => {
/******/ 		// This function allow to reference async chunks
/******/ 		__webpack_require__.u = (chunkId) => {
/******/ 			// return url for filenames based on template
/******/ 			return "" + chunkId + ".demo_aws_sdk.js";
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/global */
/******/ 	(() => {
/******/ 		__webpack_require__.g = (function() {
/******/ 			if (typeof globalThis === 'object') return globalThis;
/******/ 			try {
/******/ 				return this || new Function('return this')();
/******/ 			} catch (e) {
/******/ 				if (typeof window === 'object') return window;
/******/ 			}
/******/ 		})();
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/load script */
/******/ 	(() => {
/******/ 		var inProgress = {};
/******/ 		var dataWebpackPrefix = "nextjs:";
/******/ 		// loadScript function to load a script via script tag
/******/ 		__webpack_require__.l = (url, done, key, chunkId) => {
/******/ 			if(inProgress[url]) { inProgress[url].push(done); return; }
/******/ 			var script, needAttach;
/******/ 			if(key !== undefined) {
/******/ 				var scripts = document.getElementsByTagName("script");
/******/ 				for(var i = 0; i < scripts.length; i++) {
/******/ 					var s = scripts[i];
/******/ 					if(s.getAttribute("src") == url || s.getAttribute("data-webpack") == dataWebpackPrefix + key) { script = s; break; }
/******/ 				}
/******/ 			}
/******/ 			if(!script) {
/******/ 				needAttach = true;
/******/ 				script = document.createElement('script');
/******/ 		
/******/ 				script.charset = 'utf-8';
/******/ 				script.timeout = 120;
/******/ 				if (__webpack_require__.nc) {
/******/ 					script.setAttribute("nonce", __webpack_require__.nc);
/******/ 				}
/******/ 				script.setAttribute("data-webpack", dataWebpackPrefix + key);
/******/ 		
/******/ 				script.src = url;
/******/ 			}
/******/ 			inProgress[url] = [done];
/******/ 			var onScriptComplete = (prev, event) => {
/******/ 				// avoid mem leaks in IE.
/******/ 				script.onerror = script.onload = null;
/******/ 				clearTimeout(timeout);
/******/ 				var doneFns = inProgress[url];
/******/ 				delete inProgress[url];
/******/ 				script.parentNode && script.parentNode.removeChild(script);
/******/ 				doneFns && doneFns.forEach((fn) => (fn(event)));
/******/ 				if(prev) return prev(event);
/******/ 			}
/******/ 			var timeout = setTimeout(onScriptComplete.bind(null, undefined, { type: 'timeout', target: script }), 120000);
/******/ 			script.onerror = onScriptComplete.bind(null, script.onerror);
/******/ 			script.onload = onScriptComplete.bind(null, script.onload);
/******/ 			needAttach && document.head.appendChild(script);
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/publicPath */
/******/ 	(() => {
/******/ 		var scriptUrl;
/******/ 		if (__webpack_require__.g.importScripts) scriptUrl = __webpack_require__.g.location + "";
/******/ 		var document = __webpack_require__.g.document;
/******/ 		if (!scriptUrl && document) {
/******/ 			if (document.currentScript && document.currentScript.tagName.toUpperCase() === 'SCRIPT')
/******/ 				scriptUrl = document.currentScript.src;
/******/ 			if (!scriptUrl) {
/******/ 				var scripts = document.getElementsByTagName("script");
/******/ 				if(scripts.length) {
/******/ 					var i = scripts.length - 1;
/******/ 					while (i > -1 && (!scriptUrl || !/^http(s?):/.test(scriptUrl))) scriptUrl = scripts[i--].src;
/******/ 				}
/******/ 			}
/******/ 		}
/******/ 		// When supporting browsers where an automatic publicPath is not supported you must specify an output.publicPath manually via configuration
/******/ 		// or pass an empty string ("") and set the __webpack_public_path__ variable from your code to use your own logic.
/******/ 		if (!scriptUrl) throw new Error("Automatic publicPath is not supported in this browser");
/******/ 		scriptUrl = scriptUrl.replace(/^blob:/, "").replace(/#.*$/, "").replace(/\?.*$/, "").replace(/\/[^\/]+$/, "/");
/******/ 		__webpack_require__.p = scriptUrl;
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/jsonp chunk loading */
/******/ 	(() => {
/******/ 		// no baseURI
/******/ 		
/******/ 		// object to store loaded and loading chunks
/******/ 		// undefined = chunk not loaded, null = chunk preloaded/prefetched
/******/ 		// [resolve, reject, Promise] = chunk loading, 0 = chunk loaded
/******/ 		var installedChunks = {
/******/ 			"main": 0
/******/ 		};
/******/ 		
/******/ 		__webpack_require__.f.j = (chunkId, promises) => {
/******/ 				// JSONP chunk loading for javascript
/******/ 				var installedChunkData = __webpack_require__.o(installedChunks, chunkId) ? installedChunks[chunkId] : undefined;
/******/ 				if(installedChunkData !== 0) { // 0 means "already installed".
/******/ 		
/******/ 					// a Promise means "currently loading".
/******/ 					if(installedChunkData) {
/******/ 						promises.push(installedChunkData[2]);
/******/ 					} else {
/******/ 						if(true) { // all chunks have JS
/******/ 							// setup Promise in chunk cache
/******/ 							var promise = new Promise((resolve, reject) => (installedChunkData = installedChunks[chunkId] = [resolve, reject]));
/******/ 							promises.push(installedChunkData[2] = promise);
/******/ 		
/******/ 							// start chunk loading
/******/ 							var url = __webpack_require__.p + __webpack_require__.u(chunkId);
/******/ 							// create error before stack unwound to get useful stacktrace later
/******/ 							var error = new Error();
/******/ 							var loadingEnded = (event) => {
/******/ 								if(__webpack_require__.o(installedChunks, chunkId)) {
/******/ 									installedChunkData = installedChunks[chunkId];
/******/ 									if(installedChunkData !== 0) installedChunks[chunkId] = undefined;
/******/ 									if(installedChunkData) {
/******/ 										var errorType = event && (event.type === 'load' ? 'missing' : event.type);
/******/ 										var realSrc = event && event.target && event.target.src;
/******/ 										error.message = 'Loading chunk ' + chunkId + ' failed.\n(' + errorType + ': ' + realSrc + ')';
/******/ 										error.name = 'ChunkLoadError';
/******/ 										error.type = errorType;
/******/ 										error.request = realSrc;
/******/ 										installedChunkData[1](error);
/******/ 									}
/******/ 								}
/******/ 							};
/******/ 							__webpack_require__.l(url, loadingEnded, "chunk-" + chunkId, chunkId);
/******/ 						}
/******/ 					}
/******/ 				}
/******/ 		};
/******/ 		
/******/ 		// no prefetching
/******/ 		
/******/ 		// no preloaded
/******/ 		
/******/ 		// no HMR
/******/ 		
/******/ 		// no HMR manifest
/******/ 		
/******/ 		// no on chunks loaded
/******/ 		
/******/ 		// install a JSONP callback for chunk loading
/******/ 		var webpackJsonpCallback = (parentChunkLoadingFunction, data) => {
/******/ 			var [chunkIds, moreModules, runtime] = data;
/******/ 			// add "moreModules" to the modules object,
/******/ 			// then flag all "chunkIds" as loaded and fire callback
/******/ 			var moduleId, chunkId, i = 0;
/******/ 			if(chunkIds.some((id) => (installedChunks[id] !== 0))) {
/******/ 				for(moduleId in moreModules) {
/******/ 					if(__webpack_require__.o(moreModules, moduleId)) {
/******/ 						__webpack_require__.m[moduleId] = moreModules[moduleId];
/******/ 					}
/******/ 				}
/******/ 				if(runtime) var result = runtime(__webpack_require__);
/******/ 			}
/******/ 			if(parentChunkLoadingFunction) parentChunkLoadingFunction(data);
/******/ 			for(;i < chunkIds.length; i++) {
/******/ 				chunkId = chunkIds[i];
/******/ 				if(__webpack_require__.o(installedChunks, chunkId) && installedChunks[chunkId]) {
/******/ 					installedChunks[chunkId][0]();
/******/ 				}
/******/ 				installedChunks[chunkId] = 0;
/******/ 			}
/******/ 		
/******/ 		}
/******/ 		
/******/ 		var chunkLoadingGlobal = self["webpackChunknextjs"] = self["webpackChunknextjs"] || [];
/******/ 		chunkLoadingGlobal.forEach(webpackJsonpCallback.bind(null, 0));
/******/ 		chunkLoadingGlobal.push = webpackJsonpCallback.bind(null, chunkLoadingGlobal.push.bind(chunkLoadingGlobal));
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = __webpack_require__("./src/aws_sdk_index.js");
/******/ 	
/******/ })()
;