/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(self["webpackChunknextjs"] = self["webpackChunknextjs"] || []).push([["src_libs_transcribeClient_js"],{

/***/ "./src/libs/awsID.js":
/*!***************************!*\
  !*** ./src/libs/awsID.js ***!
  \***************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   IDENTITY_POOL_ID: () => (/* binding */ IDENTITY_POOL_ID),\n/* harmony export */   REGION: () => (/* binding */ REGION)\n/* harmony export */ });\n// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.\r\n// SPDX-License-Identifier: Apache-2.0\r\n\r\n/*\r\nABOUT THIS NODE.JS EXAMPLE: This example works with the AWS SDK for JavaScript version 3 (v3),\r\nwhich is available at https://github.com/aws/aws-sdk-js-v3.\r\n\r\nPurpose:\r\nThis file provides the necessary information for the program to access \r\nAWS resources.\r\n\r\nInputs (replace in code):\r\n- REGION // Amazon region (e.g. us-west-2)\r\n- IDENTITY_POOL_ID - an Amazon Cognito Identity Pool ID.\r\n*/\r\nconst REGION = \"ap-southeast-2\";\r\nconst IDENTITY_POOL_ID = \"ap-southeast-2:7660d1bb-d42d-4938-b0bf-e995c8f00d70\";\r\n\n\n//# sourceURL=webpack://nextjs/./src/libs/awsID.js?");

/***/ }),

/***/ "./src/libs/transcribeClient.js":
/*!**************************************!*\
  !*** ./src/libs/transcribeClient.js ***!
  \**************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   startRecording: () => (/* binding */ startRecording),\n/* harmony export */   stopRecording: () => (/* binding */ stopRecording)\n/* harmony export */ });\n/* harmony import */ var _aws_sdk_client_cognito_identity__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @aws-sdk/client-cognito-identity */ \"./node_modules/@aws-sdk/client-cognito-identity/dist-es/CognitoIdentityClient.js\");\n/* harmony import */ var _aws_sdk_credential_provider_cognito_identity__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @aws-sdk/credential-provider-cognito-identity */ \"./node_modules/@aws-sdk/credential-provider-cognito-identity/dist-es/fromCognitoIdentityPool.js\");\n/* harmony import */ var _aws_sdk_client_transcribe_streaming__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @aws-sdk/client-transcribe-streaming */ \"./node_modules/@aws-sdk/client-transcribe-streaming/dist-es/TranscribeStreamingClient.js\");\n/* harmony import */ var microphone_stream__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! microphone-stream */ \"./node_modules/microphone-stream/dist/microphone-stream.js\");\n/* harmony import */ var _aws_sdk_client_transcribe_streaming__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @aws-sdk/client-transcribe-streaming */ \"./node_modules/@aws-sdk/client-transcribe-streaming/dist-es/commands/StartStreamTranscriptionCommand.js\");\n/* harmony import */ var _awsID_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./awsID.js */ \"./src/libs/awsID.js\");\n/* provided dependency */ var Buffer = __webpack_require__(/*! ./node_modules/buffer/index.js */ \"./node_modules/buffer/index.js\")[\"Buffer\"];\n// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.\n// SPDX-License-Identifier: Apache-2.0\n\n/*\nABOUT THIS NODE.JS EXAMPLE: This example works with the AWS SDK for JavaScript version 3 (v3),\nwhich is available at https://github.com/aws/aws-sdk-js-v3.\n\nPurpose:\nThis file handles the transcription of speech to text using AWS Transcribe\n\n*/\n// snippet-start:[transcribeClient.JavaScript.streaming.createclientv3]\n\n\n\n\n\n\n\n/** @type {MicrophoneStream} */\nconst MicrophoneStreamImpl = microphone_stream__WEBPACK_IMPORTED_MODULE_0__[\"default\"];\n\nconst SAMPLE_RATE = 44100;\n/** @type {MicrophoneStream | undefined} */\nlet microphoneStream = undefined;\n/** @type {TranscribeStreamingClient | undefined} */\nlet transcribeClient = undefined;\n\nconst startRecording = async (language, callback) => {\n  if (!language) {\n    return false;\n  }\n  if (microphoneStream || transcribeClient) {\n    stopRecording();\n  }\n  createTranscribeClient();\n  createMicrophoneStream();\n  await startStreaming(language, callback);\n};\n\nconst stopRecording = function () {\n  if (microphoneStream) {\n    microphoneStream.stop();\n    microphoneStream.destroy();\n    microphoneStream = undefined;\n  }\n  if (transcribeClient) {\n    transcribeClient.destroy();\n    transcribeClient = undefined;\n  }\n};\n\nconst createTranscribeClient = () => {\n  transcribeClient = new _aws_sdk_client_transcribe_streaming__WEBPACK_IMPORTED_MODULE_2__.TranscribeStreamingClient({\n    region: _awsID_js__WEBPACK_IMPORTED_MODULE_1__.REGION,\n    credentials: (0,_aws_sdk_credential_provider_cognito_identity__WEBPACK_IMPORTED_MODULE_3__.fromCognitoIdentityPool)({\n      client: new _aws_sdk_client_cognito_identity__WEBPACK_IMPORTED_MODULE_4__.CognitoIdentityClient({ region: _awsID_js__WEBPACK_IMPORTED_MODULE_1__.REGION }),\n      identityPoolId: _awsID_js__WEBPACK_IMPORTED_MODULE_1__.IDENTITY_POOL_ID,\n    }),\n  });\n};\n\nconst createMicrophoneStream = async () => {\n  microphoneStream = new MicrophoneStreamImpl();\n  microphoneStream.setStream(\n    await window.navigator.mediaDevices.getUserMedia({\n      video: false,\n      audio: true,\n    }),\n  );\n};\n\nconst startStreaming = async (language, callback) => {\n  const command = new _aws_sdk_client_transcribe_streaming__WEBPACK_IMPORTED_MODULE_5__.StartStreamTranscriptionCommand({\n    LanguageCode: language,\n    MediaEncoding: \"pcm\",\n    MediaSampleRateHertz: SAMPLE_RATE,\n    AudioStream: getAudioStream(),\n  });\n  const data = await transcribeClient.send(command);\n  for await (const event of data.TranscriptResultStream) {\n    for (const result of event.TranscriptEvent.Transcript.Results || []) {\n      if (result.IsPartial === false) {\n        const noOfResults = result.Alternatives[0].Items.length;\n        for (let i = 0; i < noOfResults; i++) {\n          console.log(result.Alternatives[0].Items[i].Content);\n          callback(result.Alternatives[0].Items[i].Content + \" \");\n        }\n      }\n    }\n  }\n};\n\nconst getAudioStream = async function* () {\n  if (!microphoneStream) {\n    throw new Error(\n      \"Cannot get audio stream. microphoneStream is not initialized.\",\n    );\n  }\n\n  for await (const chunk of /** @type {[][]} */ (microphoneStream)) {\n    if (chunk.length <= SAMPLE_RATE) {\n      yield {\n        AudioEvent: {\n          AudioChunk: encodePCMChunk(chunk),\n        },\n      };\n    }\n  }\n};\n\nconst encodePCMChunk = (chunk) => {\n  /** @type {Float32Array} */\n  const input = MicrophoneStreamImpl.toRaw(chunk);\n  let offset = 0;\n  const buffer = new ArrayBuffer(input.length * 2);\n  const view = new DataView(buffer);\n  for (let i = 0; i < input.length; i++, offset += 2) {\n    let s = Math.max(-1, Math.min(1, input[i]));\n    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);\n  }\n  return Buffer.from(buffer);\n};\n\n// snippet-end:[transcribeClient.JavaScript.streaming.createclientv3]\n\n\n//# sourceURL=webpack://nextjs/./src/libs/transcribeClient.js?");

/***/ }),

/***/ "?d17e":
/*!**********************!*\
  !*** util (ignored) ***!
  \**********************/
/***/ (() => {

eval("/* (ignored) */\n\n//# sourceURL=webpack://nextjs/util_(ignored)?");

/***/ }),

/***/ "?ed1b":
/*!**********************!*\
  !*** util (ignored) ***!
  \**********************/
/***/ (() => {

eval("/* (ignored) */\n\n//# sourceURL=webpack://nextjs/util_(ignored)?");

/***/ })

}]);