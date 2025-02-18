const wrapper = document.getElementById('AIPlayerWrapper');
const AI_PLAYER = new AIPlayer(wrapper);

const authServer = 'https://account.aistudios.com';

AI_PLAYER.setConfig({
  authServer: authServer,
  midServer: 'https://aimid.deepbrain.io/',
  // resourceServer: 'https://resource.deepbrainai.io',
  // backendServer: 'https://backend.deepbrainai.io',
});

//Avatar constant
const DATA = {
    appId: "",
    clientToken: "",
    verifiedToken: "",
    tokenExpire: "",
    maxTextLength: "",
    ai: "", // available AI List
    language: "", // AI Speak Language
    texts: [], // AI Speak List
  };

// To track how many messages have been preloaded
var preloadCount = 0;
var totalMessages = 0;

// To store next speak in case of multiple speak
var isNextSpeakRegistered = false;
var nextSpeak = "";

class AI_Message {
    // Constructor method for initializing properties
    constructor(message, gesture) {
        this.message = message;
        this.gesture = gesture;
    }
}

let botMessages = {};   // Dictionary to store all preset bot messages
botMessages["start_msg"] = new AI_Message("Hello! How can I help you for this tour today?", "G05");
botMessages["default_msgs"] = [new AI_Message("I am not sure what you have sent, please try again."),
                                new AI_Message("I don't quite understand what you are saying, please try again.")];
botMessages["processing_msg"] = new AI_Message("Thank you! Please wait while I'm processing your question and I will reply to you shortly");

initSample();

async function initSample() {
    initAIPlayerEvent();
    await generateClientToken();
    await generateVerifiedToken();

    await AI_PLAYER.init({
        aiName: "M000320746_BG00007441H_light",
        size: 1.0,
        left: 0,
        top: 0,
        speed: 1.0,
    });
}

// =========================== AIPlayer Setup ================================ //

// Method for v1.5.3
// async function generateClientToken() {
//     const result = await makeRequest(
//       'GET',
//       `${authServer}/api/aihuman/generateClientToken?appId=${appId}&userKey=${userKey}`,
//     );
  
//     if (result?.succeed) {
//       DATA.clientToken = result.token;
//       DATA.appId = result.appId;
//     } else {
//       console.log('generateClientToken Error:', result);
//     }
//   }

async function generateClientToken() {
    const result = await makeRequest("GET", "/api/generateJWT");
    console.log("Generate Token");
    if (result) {
        console.log('generateClientToken', result)

        // check request success
        DATA.clientToken = result.token;
        DATA.appId = result.appId;
    } 
    else 
    {
        console.log("Error: " + result?.error);
    }
}
  
async function generateVerifiedToken() {
    const result = await AI_PLAYER.generateToken({ appId: DATA.appId, token: DATA.clientToken });
  
    if (result?.succeed) {
      DATA.verifiedToken = result.token;
      DATA.tokenExpire = result.tokenExpire;
      DATA.defaultAI = result.defaultAI;
    } else {
      console.log('generateVerifiedToken Error: ' + result);
    }
}
  
  // if token is expired, get refresh clientToken, verifiedToken
async function refreshTokenIFExpired() {
    const afterExpired = moment().unix() + 60 * 60; // compare expire after 1 hour
    if (!DATA.tokenExpire || DATA.tokenExpire <= afterExpired) {
      await generateVerifiedToken();
  
      if (!DATA.verifiedToken) {
        // if clientToken is expired, get clientToken again
        await generateClientToken();
        await generateVerifiedToken();
      }
    }
}

// =========================== AIPlayer Callback ================================ //

function initAIPlayerEvent() {
    // TODO: AIPlayer error handling
    AI_PLAYER.onAIPlayerError = function (err) {
      // err => string || { succeed: false, errorCode: 1400, error: "...", description: "...", detail: "..." }
      // console.log('on AIPlayer Error: ', err);
    };
  
    // TODO: AIPlayer Loading State Change Handling
    AI_PLAYER.onAIPlayerStateChanged = function (state) {
      if (state === 'playerLoadComplete') {
        // To set custom voice
        //const customVoice = AI_PLAYER.findCustomVoice("google/en-US/FEMALE_en-US-Neural2-C");
        const customVoice = AI_PLAYER.findCustomVoice("amazon/en-US/Female_Danielle");
  
        // Set custom voice will cause issues with the AI speaking
        const isSuccess = AI_PLAYER.setCustomVoice(customVoice); 
        console.log(isSuccess ? "Successfully set custom voice" : "Unsuccessful in setting custom voice");
        
        const customVoice_check = AI_PLAYER.getCustomVoice();
        if (customVoice_check == null) {
          console.log("custom voice is not set");
        }
  
        countPreloadMessages();
        preloadMessages();
      }
    };

    //AIEvent & callback
    const AIEventType = Object.freeze({
        RES_LOAD_STARTED: 0,
        RES_LOAD_COMPLETED: 1,
        AICLIPSET_PLAY_PREPARE_STARTED: 2,
        AICLIPSET_PLAY_PREPARE_COMPLETED: 3,
        AICLIPSET_PRELOAD_STARTED: 4,
        AICLIPSET_PRELOAD_COMPLETED: 5,
        AICLIPSET_PRELOAD_FAILED: 6,
        AICLIPSET_PLAY_STARTED: 7,
        AICLIPSET_PLAY_COMPLETED: 8,
        AICLIPSET_PLAY_FAILED: 9,
        AI_CONNECTED: 10,
        AI_DISCONNECTED: 11,
        AICLIPSET_PLAY_BUFFERING: 12,
        AICLIPSET_RESTART_FROM_BUFFERING: 13,
        AIPLAYER_STATE_CHANGED: 14,
        UNKNOWN: -1,
    });

    AI_PLAYER.onAIPlayerEvent = function (aiEvent) {
        let typeName = '';
        switch (aiEvent.type) {
        case AIEventType.AIPLAYER_STATE_CHANGED:
            typeName = 'AIPLAYER_STATE_CHANGED';
            break;
        case AIEventType.AI_CONNECTED:
            typeName = 'AI_CONNECTED';
            break;
        case AIEventType.RES_LOAD_STARTED:
            typeName = 'RES_LOAD_STARTED';
            break;
        case AIEventType.RES_LOAD_COMPLETED:
            typeName = 'RES_LOAD_COMPLETED';
            break;
        case AIEventType.AICLIPSET_PLAY_PREPARE_STARTED:
            typeName = 'AICLIPSET_PLAY_PREPARE_STARTED';
            dispatchEvent(new Event('AICLIPSET_PLAY_PREPARE_STARTED'));
            break;
        case AIEventType.AICLIPSET_PLAY_PREPARE_COMPLETED:
            typeName = 'AICLIPSET_PLAY_PREPARE_COMPLETED';
            dispatchEvent(new Event('AICLIPSET_PLAY_PREPARE_COMPLETED'));
            break;
        case AIEventType.AICLIPSET_PRELOAD_STARTED:
            typeName = 'AICLIPSET_PRELOAD_STARTED';
            dispatchEvent(new Event('AICLIPSET_PRELOAD_STARTED'));
            break;
        case AIEventType.AICLIPSET_PRELOAD_COMPLETED:
            typeName = 'AICLIPSET_PRELOAD_COMPLETED';
            document.dispatchEvent(new Event('AICLIPSET_PRELOAD_COMPLETED'));

            preloadCount++;
            if(isPreloadingFinished())
                beginChat();
            break;
        case AIEventType.AICLIPSET_PLAY_STARTED:
            typeName = 'AICLIPSET_PLAY_STARTED';

            if(isNextSpeakRegistered){
                isNextSpeakRegistered = false;
                speak(nextSpeak);
            }

            document.dispatchEvent(new Event('AICLIPSET_PLAY_STARTED'));
            break;
        case AIEventType.AICLIPSET_PLAY_COMPLETED:
            typeName = 'AICLIPSET_PLAY_COMPLETED';
            dispatchEvent(new Event('AICLIPSET_PLAY_COMPLETED'));

            break;
        case AIEventType.AI_DISCONNECTED:
            typeName = 'AI_DISCONNECTED';
            AI_PLAYER.reconnect();
            break;
        case AIEventType.AICLIPSET_PRELOAD_FAILED:
            typeName = 'AICLIPSET_PRELOAD_FAILED';
            break;
        case AIEventType.AICLIPSET_PLAY_FAILED:
            typeName = 'AICLIPSET_PLAY_FAILED';
            break;
        case AIEventType.AICLIPSET_PLAY_BUFFERING:
            typeName = 'AICLIPSET_PLAY_BUFFERING';
            break;
        case AIEventType.AICLIPSET_RESTART_FROM_BUFFERING:
            typeName = 'AICLIPSET_RESTART_FROM_BUFFERING';
            break;
        case AIEventType.UNKNOWN:
            typeName = 'UNKNOWN';
            break;
    }

    console.log('onAIPlayerEvent:', aiEvent.type, typeName, 'clipSet:', aiEvent.clipSet);
    return;
    };

    //AIError & callback
    const AIErrorCode = Object.freeze({
        AI_API_ERR: 10000,
        AI_SERVER_ERR: 11000,
        AI_RES_ERR: 12000,
        AI_INIT_ERR: 13000,
        INVALID_AICLIPSET_ERR: 14000,
        AICLIPSET_PRELOAD_ERR: 15000,
        AICLIPSET_PLAY_ERR: 16000,
        RESERVED_ERR: 17000,
        UNKNOWN_ERR: -1,
    });

    AI_PLAYER.onAIPlayerErrorV2 = function (aiError) {
        let codeName = 'UNKNOWN_ERR';
        if (aiError.code >= AIErrorCode.RESERVED_ERR) {
        codeName = 'RESERVED_ERR';
        } else if (aiError.code >= AIErrorCode.AICLIPSET_PLAY_ERR) {
        codeName = 'AICLIPSET_PLAY_ERR';
        } else if (aiError.code >= AIErrorCode.AICLIPSET_PRELOAD_ERR) {
        codeName = 'AICLIPSET_PRELOAD_ERR';
        } else if (aiError.code >= AIErrorCode.INVALID_AICLIPSET_ERR) {
        codeName = 'INVALID_AICLIPSET_ERR';
        } else if (aiError.code >= AIErrorCode.AI_INIT_ERR) {
        codeName = 'AI_INIT_ERR';
        } else if (aiError.code >= AIErrorCode.AI_RES_ERR) {
        codeName = 'AI_RES_ERR';
        } else if (aiError.code >= AIErrorCode.AI_SERVER_ERR) {
        codeName = 'AI_SERVER_ERR';
        } else if (aiError.code >= AIErrorCode.AI_API_ERR) {
        codeName = 'AI_API_ERR';
        } else if (aiError.code > AIErrorCode.UNKNOWN_ERR) {
        //0 ~ 9999
        codeName = 'BACKEND_ERR';

        if (aiError.code == 1402) {
            //invalid or token expired
            refreshTokenIFExpired();
        }
        }

    console.log('onAIPlayerErrorV2', aiError.code, codeName, aiError.message);
    };
}

// =========================== AIPlayer Function ================================ //

async function speak(text, gst) {
    await refreshTokenIFExpired();

    console.log("Gesture: " + gst + " Speaking: ", text);
    AI_PLAYER.send({ text: text, gst: gst });
}
  
async function preload(clipSet) {
    await refreshTokenIFExpired();
  
    AI_PLAYER.preload(clipSet);
}
  
function pause() {
    AI_PLAYER.pause();
}
  
function resume() {
    AI_PLAYER.resume();
}
  
function stop() {
    AI_PLAYER.stopSpeak();
}
  
// =========================== ETC ================================ //
  
// sample Server request function
async function makeRequest(method, url, params) {
    const options = {
      method,
      headers: { "Content-Type": "application/json; charSet=utf-8" },
    };
  
    if (method === "POST") options.body = JSON.stringify(params || {});
  
    return fetch(url, options)
      .then((response) => response.json())
      .then((data) => data)
      .catch((error) => {
        console.error("** An error occurred during the fetch", error);
        return undefined;
      });
  }

// Preload messages
function preloadMessages() {
    // Multi Gesture preload
    let preloadArr = []; // Initialize an empty array
    let obj;

    // Loop through the dictionary to create array of objects to preload
    for (const key in botMessages) {
        if (botMessages.hasOwnProperty(key)) {
            const value = botMessages[key];
            if (Array.isArray(value)) {
                // If the value is an array, loop through its elements
                value.forEach(async (item, index) => {
                    obj = {text: item.message, gst: item.gesture};
                    preloadArr.push(obj);
                });
            } else {
                obj = {text: value.message, gst: value.gesture};
                preloadArr.push(obj);
            }
        }
    }

    // Preload the array
    AI_PLAYER.preload(preloadArr);
}

// Count preload messages
function countPreloadMessages(){
    // Loop through the dictionary
    for (const key in botMessages) {
        if (botMessages.hasOwnProperty(key)) {
            const value = botMessages[key];
            if (Array.isArray(value)) {
                // If the value is an array, loop through its elements
                value.forEach(async (item, index) => {
                    totalMessages++;
                });
            } else {
                totalMessages++;
            }
        }
    }
}

// Check if preload finished
function isPreloadingFinished() {
    console.log("Checking if preloaded finish against " + totalMessages + " items ...");
    return preloadCount >= totalMessages;
}

function registerNextSpeak(speak){
    isNextSpeakRegistered = true;
    nextSpeak = speak;
}