const adl_questions = [
    {
        question: 'Do you need any help with your meals or feeding?',
        choices: { 'Dependant': 'Yes, I need full assistance to eat. Such as someone actively needing to feed me.',
            'Needs-Assistance': 'I need some help, like cutting or opening packaging. Does not include using cutlery such as chopsticks, spoons, forks and others',
            'Independant': 'No help needed, I can manage fully on my own.', 
            'Unable to assess': 'Unable to classify.'}
    },
    {
        question: 'Do you need any help with dressing or grooming?',
        choices: { 'Dependant': 'Yes, I need full assistance to dress and groom myself',
            'Needs-Assistance': 'I need some help',
            'Independant': 'No help needed, I can manage fully on my own.', 
            'Unable to assess': 'Unable to classify.'}
    },
    {
        question: 'Do you need any help with your toileting or bathing?',
        choices: { 'Dependant': 'Yes, I need full assistance to toileting and bathing, such as someone to bathe me and clean after',
            'Needs-Assistance': 'I need some help',
            'Independant': 'No help needed, I can manage fully on my own.', 
            'Unable to assess': 'Unable to classify.'}
    },
    {
        question: 'Do you need any help with turning in bed?',
        choices: { 'Dependant': 'Yes, I need full assistance to turning in bed, such as having a helper to turn me',
            'Needs-Assistance': 'I need some help, such as holding onto the bed frame or by using some assistive devices',
            'Independant': 'No help needed, I can manage fully on my own.', 
            'Unable to assess': 'Unable to classify.'}
    },
    {
        question: 'Do you need any help with ambulation?',
        choices: { 'Dependant': 'Yes, I need full assistance with ambulation. Such as requiring someone to push my wheelchair',
            'Needs-Assistance': 'I need some help, like a walking stick or a wheelchair I can wheel on my own',
            'Independant': 'No help needed, I can manage fully on my own.', 
            'Unable to assess': 'Unable to classify.'}
    }
]

var selectedQuestion = adl_questions.Q1;

var llmClassifyLink = 'https://voicewebapp.straivedemo.com/classify';

var processing_status = null;
var oneTime_txt_bubble = null;

let processingSpeak = false;

const chatBody = document.getElementById('chat-history-container');
const userInput = document.getElementById('input');

const USER_BUBBLE = 'message user';
const BOT_BUBBLE = 'message bot'

const now = new Date();
const dateString = now.toLocaleDateString();
const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

// Showing loading chat bubble before beginChat
function loadChat() {
    createTempBubble(BOT_BUBBLE, "Loading AI, please wait", 0);
}

function beginChat() {
    deleteTempBubble();
    botMessage(botMessages["start_msg"].message, botMessages["start_msg"].gesture, false, false);
}

function setQuestion(question) {
    selectedQuestion = adl_questions[question];
    console.log(selectedQuestion);
    botMessage(selectedQuestion.question, '', false, false);
}

function processUserMessage(msg){
    console.log("Processing user message: " + msg);
    
    if (msg == '') 
    {
        // Reset all parameters
        return;
    }

    // Display user input
    createMsgBubble(USER_BUBBLE, msg);
    //Clear user input box
    userInput.value = '';
    // Scroll to the bottom
    chatBody.scrollTop = chatBody.scrollHeight;

    // sentToSimilarity(msg);
    // sendToSummarize(msg);
    sendToLLM(msg);
}

// Received input from chatbox
function sendMessageFromChatbox() {
    console.log("Triggered input from chatbox");
    processUserMessage(userInput.value.trim());
}

// Received input from speech
function sendMessageFromSpeech(message){
    console.log("Received '" + message + "' from stt");
    processUserMessage(message);
}

async function sendToLLM(message) {
    sendToClassify(message);
}

// Send user question to LLMs => retrieve and process the response
function sendToClassify(message) {
    console.log("posting API...");
    // Display processing status
    createTempBubble(BOT_BUBBLE, "Retrieving Answer", 0);

    //Setup request body
    const payload = {
        "question": selectedQuestion.question,
        "user_input": message,
        "choices": selectedQuestion.choices,
    };

    // Make API call
    fetch(llmClassifyLink, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'accept': 'application/json'
        },
        body: JSON.stringify(payload)
    })
    .then(response => {
        // Handle response
        if (response.ok) {
            return response.json(); // Parse JSON response
        } else {
            throw new Error('Network response was not ok ' + response.statusText);
        }
    })
    .then(data => {
        console.log('Success:', data);

        var botResponse = formatResponse(data);

        processBotMessage(botResponse);
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

let LLMdelay = 2000;

function updateChatbotDelay(isDelay){
    LLMdelay = isDelay ? 2000 : 0;
}

// Process the message from LLMs to display to user
function processBotMessage(answer){
    //LLMs doesn't reply anything => didn't understand the question
    if (answer == "")
    {
        //Change this => using external variables
        answer = getRandomElement(botMessages['default_msgs']).message;
    }
    else
    {
        speak(botMessages["processing_msg"].message, '', true);

        // Show processing status
        createTempBubble(BOT_BUBBLE, "Processing the answer", 0);

        setTimeout(() => { 
            // Delete processing status after 2 seconds
            deleteTempBubble();
            //Display bot message to user
            createMsgBubble(BOT_BUBBLE, answer);

            chatBody.scrollTop = chatBody.scrollHeight;
        }, LLMdelay);
    }

    // Scroll to the bottom
    chatBody.scrollTop = chatBody.scrollHeight;

    //Send to avatar to speak
    speak(answer, '', false);
}

let flagTriggered = false;
// Takes in a message to be sent by the bot
function botMessage(setMessage, gesture, delay, pre_ans_msg) {
    if(delay)
    {
        registerNextSpeak(setMessage.toString());
        setTimeout(() => {
            // Event listener for early trigger
            function flagHandler() {
                flagTriggered = true;
                console.log(Error, "Flag triggered");
                document.removeEventListener("AICLIPSET_PLAY_STARTED", flagHandler); // Clean up
            }
        
            document.addEventListener("AICLIPSET_PLAY_STARTED", flagHandler)
    
            new Promise((resolve) => {
                // Check for 7 seconds timeout
                const timeout = setTimeout(() => {
                    console.log(Error, "Timeout return");
                    document.removeEventListener("AICLIPSET_PLAY_STARTED", flagHandler);
                    showBotMessage();
                    resolve();
                }, 7000);
    
                // Check every 300ms
                const interval = setInterval(() => {
                    if(flagTriggered){
                        console.log(Error, "flag return");
                        flagTriggered = false;
                        clearTimeout(timeout);
                        clearInterval(interval);
                        showBotMessage();
                        document.removeEventListener("AICLIPSET_PLAY_STARTED", flagHandler); // Clean up
                        resolve();
                    }
                }, 300);
            });
    
            function showBotMessage(){
                showRecordBtn();
                createMsgBubble(BOT_BUBBLE, setMessage);
    
                deleteTempBubble();
    
                // Scroll to the bottom
                chatBody.scrollTop = chatBody.scrollHeight;
            }
        }, 0);
    }
    else
    {
        speak(setMessage.toString(), gesture, pre_ans_msg);
        showRecordBtn();
        createMsgBubble(BOT_BUBBLE, setMessage);

        deleteTempBubble();

        // Scroll to the bottom
        chatBody.scrollTop = chatBody.scrollHeight;
    }
}

function formatResponse(jsonData) {
    let reason = jsonData.output.reason;
    const choice = jsonData.output.choice;

    // Replace "the user" with "you"
    reason = reason.replace(/\b[Tt]he user\b/g, "you");

    // Replace third-person pronouns with second-person
    reason = reason.replace(/\bthey are\b/g, "you are");
    reason = reason.replace(/\bthey were\b/g, "you were");
    reason = reason.replace(/\bthey have\b/g, "you have");
    reason = reason.replace(/\bthey\b/g, "you");
    reason = reason.replace(/\bthem\b/g, "you");
    reason = reason.replace(/\btheir\b/g, "your");
    reason = reason.replace(/\bthemselves\b/g, "yourself");

    // Fix verb agreement after replacements (very basic handling)
    reason = reason.replace(/\byou needs\b/g, "you need");
    reason = reason.replace(/\byou has\b/g, "you have");

    // Lowercase the first character if needed
    reason = reason.charAt(0).toLowerCase() + reason.slice(1);

    return `You should select option ${choice} because ${reason}`;
}

function createMsgBubble(userID, message) {
    const botMessageDiv = document.createElement('div');
    botMessageDiv.className = userID;
    botMessageDiv.innerHTML = `<span>${message}</span><div class="message-time">${dateString} ${timeString}</div>`;
    chatBody.appendChild(botMessageDiv);

    const botSpan = botMessageDiv.querySelector('span');
    // After typing finishes, swap to HTML with bold formatting
    botSpan.innerHTML = message.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');

    return botMessageDiv;
}

function createTempBubble(userID, message, timing) {
    // If there is a temp bubble around, update it else create one
    if (oneTime_txt_bubble != null) {
        oneTime_txt_bubble.innerHTML = `<span>${message}</span><div class="message-time">${dateString} ${timeString}</div>`;
        const botSpan = oneTime_txt_bubble.querySelector('span');
        // After typing finishes, swap to HTML with bold formatting
        botSpan.innerHTML = message.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
    } else {
        oneTime_txt_bubble = createMsgBubble(userID, message);
    }
    // If timing is given, delete the bubble after some time
    if (timing != 0) {
        // Delete bubble after 'timing' seconds
        setTimeout(function () { deleteTempBubble(); }, timing);
    }

    // Scroll to the bottom
    chatBody.scrollTop = chatBody.scrollHeight;
    
    animateMsgBubble();
}

function animateMsgBubble() {
    if (!oneTime_txt_bubble) return; // Ensure the bubble exists

    let dots = 0;
    const botSpan = oneTime_txt_bubble.querySelector('span');
    const baseMessage = botSpan.innerText; // Store the original message

    animationInterval = setInterval(() => {
        dots = (dots % 3) + 1; // Cycle between 1 to 3 dots
        botSpan.innerText = baseMessage + ".".repeat(dots); // Append dots
    }, 500); // Adjust speed as needed
}

function stopAnimateMsgBubble() {
    clearInterval(animationInterval); // Stop the animation
    if (oneTime_txt_bubble) {
        const botSpan = oneTime_txt_bubble.querySelector('span');
        botSpan.innerText = botSpan.innerText.replace(/\.+$/, ""); // Remove trailing dots
    }
}

function deleteTempBubble() {
    console.log("Deleting one time text bubble...");
    stopAnimateMsgBubble();
    oneTime_txt_bubble?.remove();
    oneTime_txt_bubble = null;
}

function getRandomElement(arr) {
    const randomIndex = Math.floor(Math.random() * arr.length);
    return arr[randomIndex];
}