const chatBody1 = document.getElementById('chat-history-container');
const speakBtnText = document.getElementById('speak-button-text');

let isTranscribe = false;

function onTranscribeBtnClick(){
    if(!isTranscribe){
        const botMessageDiv = document.createElement('div');
        botMessageDiv.className = 'message user';
        botMessageDiv.innerHTML = `<span id="AILiveInputTextVoice"></span><div class="message-time">${dateString} ${timeString}</div>`;
        chatBody1.appendChild(botMessageDiv);
    }

    isTranscribe = !isTranscribe;

    speakBtnText.innerHTML = isTranscribe ? "Send" : "Speak to AI";
    $("#reset-button").css("display", isTranscribe ? "block" : "none");

    const currentMessage = chatBody1.lastElementChild;
    if (currentMessage) {
        // Set scrollTop to the current message's offset from the top of chatBody1
        chatBody1.scrollTop = currentMessage.offsetTop;
    }

    document.dispatchEvent(new Event("READY_TO_TRANSCRIBE"));
}

function onResetTranscribe(){
    console.log("Reset transcribe");
    document.dispatchEvent(new Event("RESET_TRANSCRIBE"));
}

document.addEventListener('Transcribe Completed', function (e) {
    sendToLLM(e.detail);
});