
let transcribedText = null;

class Transcriber {
  async startTranscribe() {
    console.log('startTranscribe')
    try {
      const { startRecording } = await import("./libs/transcribeClient.js");
      await startRecording('en-US', this.onTranscriptionDataReceived)

      return true
    } catch (error) {
      alert("An error occurred while recording: " + error.message);
      await this.stopTranscribe();
      //TODO show error popup

      return false
    }
  };

  onTranscriptionDataReceived(data) {
    appCtlr.updateTranscribingText(data)
  };

  async stopTranscribe() {
    console.log('stopTranscribe')
    const { stopRecording } = await import("./libs/transcribeClient.js");
    stopRecording();
  };
}

//AppController === 
const APP_STATE = Object.freeze({
  AI_NONE: -1,
  AI_INIT: 0,
  AI_SPEAKING_GREET: 1,
  IDLE: 2, //No transc, No llm. No ai speaking. 
  TRANSCRIBING: 3,
  LLM_RESPONDING: 4,
  AI_SPEAKING_LLM: 5,
})

class AppController {
  constructor() {
    this.state = APP_STATE.NONE

    this.aiPlayerInit = false
    this.transcribeInit = false

    this.transcribingText = ''
    this.transcribeIntervalID = null
    this.transcribeLastUpdateTime = -1
  }

  getState = () => {
    return this.state
  }

  onAIPlayerInit = () => {
    console.log("AI init");

    this.aiPlayerInit = true
    this.checkAndUpdateInitState()
  }

  onTranscribeInit = () => {
    console.log("Transcribe init");

    this.transcribeInit = true
    this.checkAndUpdateInitState()
  }

  checkAndUpdateInitState = () => {
    if (this.state == APP_STATE.NONE) {
      if (this.aiPlayerInit && this.transcribeInit) {
        this.startFirstGreeting()
      }
    }
  }

  startFirstGreeting = () => {
    if (this.updateAppState(APP_STATE.AI_SPEAKING_GREET)) {
      beginChat();
      this.updateAppState(APP_STATE.IDLE, true)
    }
  }

  onFirstGreetingComplete = () => {
    //do nothing
    console.log("onFirstGreetingComplete");
    this.updateAppState(APP_STATE.IDLE, true)
  }

  onNomalSpeakingComplete = () => {
    //this.updateAppState(APP_STATE.IDLE, true)
  }

  startTranscribe = async () => {
    if (this.updateAppState(APP_STATE.TRANSCRIBING)) {
      transcriber.startTranscribe()
      return true
    }

    return false
  }

  updateTranscribingText = (data) => {
    console.log('appCtlr updateTranscribingText', data, 'appState', this.state)
    if (this.state == APP_STATE.TRANSCRIBING) {
      this.transcribingText += data;
      transcribedText.innerHTML = this.transcribingText;
    } else {
      console.warn('updateTranscribingText but not "TRANSCRIBING" state. ignore');
    }
  }

  onTranscribeComplete = async () => {
    console.log('onTranscribeComplete text', this.transcribingText);
    const userMessage = this.transcribingText;

    transcriber.stopTranscribe();
    this.transcribingText = '';

    this.updateAppState(APP_STATE.IDLE, true);

    //Send to LLMs
    document.dispatchEvent(new CustomEvent('Transcribe Completed', 
      { detail: userMessage }
    ));
  }

  resetTranscribe = () => { 
    console.log("clear transcribe text");

    this.transcribingText = '';
    transcribedText.innerHTML = 'Speak reset! Please speak now...';
  }

  updateAppState(newState, isForce) {
    if (isForce) {
      this.state = newState
    } else {
      if ((this.state == APP_STATE.AI_SPEAKING_LLM || this.state == APP_STATE.LLM_RESPONDING) 
         && newState == APP_STATE.TRANSCRIBING) {
        return false
      } else {
        this.state = newState
      }
    }

    console.log(this.state)
    
    return true
  }
}

//Controller instaces
export const appCtlr = new AppController()
const transcriber = new Transcriber()

appCtlr.onTranscribeInit();

document.addEventListener("READY_TO_TRANSCRIBE", async () => {
  const state = appCtlr.getState()
  console.log(state);

  if(transcribedText == null) transcribedText = document.getElementById("AILiveInputTextVoice");
  if (state == APP_STATE.IDLE) {
    const isStarted = await appCtlr.startTranscribe()
    if (isStarted) {
      transcribedText.innerHTML = 'Please speak now...'
    }
  } else {
    if (state == APP_STATE.TRANSCRIBING) {
      //transcribedText.innerHTML = ''
      appCtlr.onTranscribeComplete()
    } else {
      //ignore.. LLM, SPEAK case
    }
  } 
});

document.addEventListener("RESET_TRANSCRIBE", () => { appCtlr.resetTranscribe(); });

document.addEventListener("AI_INITIALIZED", () => { appCtlr.onAIPlayerInit(); });

document.addEventListener("AICLIPSET_PLAY_COMPLETED", () => {
  if (appCtlr.getState() == APP_STATE.AI_SPEAKING_GREET) {
    appCtlr.onFirstGreetingComplete()
  } else {
    appCtlr.onNomalSpeakingComplete()
  }
});
