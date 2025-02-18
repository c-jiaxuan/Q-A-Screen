// LLMs API Settings
// Change these to change the LLMs response
var bot_app = "sgroots"; // Don't change this
var bot_tone = "Succinct"; // Professional, Casual, Enthusiastic, Informational, Funny, Succinct
var bot_format = "Summary"; // Summary, Report, Bullet Points, LinkedIn Post, Email
var bot_language = "English";
var bot_followup = true;

var llm_summarise_api_url = 'https://gramener.com/docsearch/summarize';

// Used to store followup questions
var g_follow_up_questions = null;

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

function beginChat() {
    console.log("Beginning chat");

    botMessage(botMessages["start_msg"].message, botMessages["start_msg"].gesture, false);
}

function processUserMessage(msg){
    // Display user input
    var userBubble = createMessageBubble();
    // Display processing status

}

function sendMessageFromChatbox() {
    console.log("Triggered input from chatbox");
    
    const message = userInput.value.trim();
    if (message == '') return;
    else processUserMessage(message);

    // Add user message
    createMsgBubble(USER_BUBBLE, message);

    // Create temp bubble to show status message
    createTempBubble(USER_BUBBLE, "Retrieving Answer...", 0);

    userInput.value = '';

    // Scroll to the bottom
    chatBody.scrollTop = chatBody.scrollHeight;

    botResponse(message);
}

function sendMessageFromSpeech(message){
    console.log("Received message from stt");

    if(message == '') return;
    else processUserMessage(message);

    // Add user message
    createMsgBubble(USER_BUBBLE, message);

    // Create temp bubble to show status message
    createTempBubble(USER_BUBBLE, "Retrieving Answer...", 0);

    userInput.value = '';

    // Scroll to the bottom
    chatBody.scrollTop = chatBody.scrollHeight;

    botResponse(message);
}

// Takes in response from user input and replies based on input
// Takes in a bool 'prompt' for whether to prompt the user for more input
function botResponse(response) {
    var bot_reply = null;
    var prompt = true;

    postAPI(response);
    prompt = false;

    showProcessingBtn();

    if (bot_reply != null) {
        setTimeout(() => {
            speak(bot_reply.message, bot_reply.gesture);
            createMsgBubble(BOT_BUBBLE, bot_reply.message);

            if (prompt == true) {
                var prompt_msg = botMessages["prompt_msgs"];
                botMessage(prompt_msg.message, prompt_msg.gesture, true);
            }

            deleteTempBubble()

            // Scroll to the bottom
            chatBody.scrollTop = chatBody.scrollHeight;
        });
    }

    showRecordBtn();
}

let flagTriggered = false;
// Takes in a message to be sent by the bot
function botMessage(setMessage, gesture, delay) {
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
    
                if (g_follow_up_questions != null) {
                    const followupMessageElement = createMsgBubble(BOT_BUBBLE, "");
                    const followupSpan = followupMessageElement.querySelector('span');
    
                    let header = document.createElement("p");
                    //**Add avatar talking**
                    header.textContent = "Some common follow-up questions:";
                    header.style.fontWeight = "bold"; // Make header bold
                    followupSpan.append(header);
                    
                    // Loop through follow-up questions and create bullet points
                    g_follow_up_questions.forEach(question => {
                        let li = document.createElement("li");
                        li.textContent = question;
                        followupSpan.appendChild(li);
                    });
                    console.log("Follow up questions found, sending follow up question...");
                    //botMessage(g_follow_up_questions[0]);
                    g_follow_up_questions = null;
                }
    
                // Scroll to the bottom
                chatBody.scrollTop = chatBody.scrollHeight;
            }
        }, 0);
    }
    else
    {
        speak(setMessage.toString(), gesture);
        showRecordBtn();
        createMsgBubble(BOT_BUBBLE, setMessage);

        deleteTempBubble();

        if (g_follow_up_questions != null) {
            const followupMessageElement = createMsgBubble(USER_BUBBLE, "");
            const followupSpan = followupMessageElement.querySelector('span');

            let header = document.createElement("p");
            //**Add avatar talking**
            header.textContent = "Some common follow-up questions:";
            header.style.fontWeight = "bold"; // Make header bold
            followupSpan.append(header);
            
            // Loop through follow-up questions and create bullet points
            g_follow_up_questions.forEach(question => {
                let li = document.createElement("li");
                li.textContent = question;
                followupSpan.appendChild(li);
            });
            console.log("Follow up questions found, sending follow up question...");
            //botMessage(g_follow_up_questions[0]);
            g_follow_up_questions = null;
        }

        // Scroll to the bottom
        chatBody.scrollTop = chatBody.scrollHeight;
    }
}

function postAPI(message) {
    console.log("posting API...");

    //Setup request body
    const payload = {
        "app": bot_app,
        "q": message + ". Summarise in 2 short sentences",
        "context": "Add context from matches. Use the format:\n\nDOC_ID: 1\nTITLE: (title)\n(page_content)\n\nDOC_ID: 2\nTITLE: ...\n...",
        "Followup": bot_followup,
        "Tone": bot_tone,
        "Format": bot_format,
        "Language": bot_language
    };

    // Make API call
    fetch(llm_summarise_api_url, {
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

        // Safely extract message content
        let messageContent = data.choices?.[0]?.message?.content || "No content available";

        // Remove follow-up questions header and inline references like [[1](#1)]
        messageContent = messageContent.replace(/\*\*Follow-up questions:\*\*/i, '').trim();
        messageContent = messageContent.replace(/\[\[\d+\]\(#\d+\)\]/g, '').trim();

        // Extract follow-up questions (optional, if present)
        const followUpQuestions = messageContent.match(/- \[.*?\]/g)?.map(question => question.slice(3, -1)) || [];

        // Remove follow-up questions from the main content
        if (followUpQuestions.length > 0) {
            const splitIndex = messageContent.indexOf('- ['); // Find where follow-up starts
            messageContent = messageContent.substring(0, splitIndex).trim(); // Keep only the main content
        }

        // Output results
        console.log("Cleaned Message Content:", messageContent);
        console.log("Follow-Up Questions:", followUpQuestions);

        // Send the message
        if (messageContent == "") {
            messageContent = getRandomElement(botMessages['default_msgs']).message;
        }
        else{
            speak(botMessages["processing_msg"].message, botMessages["processing_msg"].gesture);
            processingSpeak=true;
        }

        createTempBubble(USER_BUBBLE, "Processing the answer...", 0);

        botMessage(messageContent, "", false);

        g_follow_up_questions = followUpQuestions;
    })
    .catch(error => {
        console.error('Error:', error);
    });
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
        setTimeout(function () { deleteBubble(oneTime_txt_bubble); }, timing);
    }
    return oneTime_txt_bubble;
}

function deleteTempBubble() {
    console.log("Deleting one time text bubble...");
    oneTime_txt_bubble?.remove();
    oneTime_txt_bubble = null;
}

function deleteBubble(messageDiv) {
    messageDiv.remove();
}

function getRandomElement(arr) {
    const randomIndex = Math.floor(Math.random() * arr.length);
    return arr[randomIndex];
}

function createProcessingStatusText(){
    processing_status = document.createElement('div');
    processing_status.className = 'message user';
    processing_status.id = 'processing_status';
    return processing_status;
}