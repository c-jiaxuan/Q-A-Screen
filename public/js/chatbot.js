// LLMs API Settings
// Change these to change the LLMs response
var bot_app = "sgroots"; // Don't change this
var bot_tone = "Succinct"; // Professional, Casual, Enthusiastic, Informational, Funny, Succinct
var bot_format = "Summary"; // Summary, Report, Bullet Points, LinkedIn Post, Email
var bot_language = "English";
var bot_followup = true;

var llm_summarise_api_url = 'https://gramener.com/docsearch/summarize';

// Used to store followup questions
var g_bot_response = null;
var g_follow_up_questions = null;

var processing_status = null;

let startedChat = false;
let processingSpeak = false;

const bot_typing_speed = 65;

const chatBody = document.getElementById('chat-history-container');
const userInput = document.getElementById('input');

const now = new Date();
const dateString = now.toLocaleDateString();
const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

function beginChat() {
    console.log("Beginning chat");

    botMessage(botMessages["start_msg"].message, botMessages["start_msg"].gesture, false);
}

function sendMessage() {
    console.log("Sending message to bot");
    
    const message = userInput.value.trim();
    if (message === '') return;

    // Add user message
    const userMessage = document.createElement('div');
    userMessage.className = 'message user';
    userMessage.innerHTML = `<span>${message}</span><div class="message-time">${dateString} ${timeString}</div>`;
    chatBody.appendChild(userMessage);

    createProcessingStatusText();
    processing_status.innerHTML = `<span>Retrieving Answer...</span><div class="message-time">${dateString} ${timeString}</div>`;
    chatBody.appendChild(processing_status);

    userInput.value = '';

    // Scroll to the bottom
    chatBody.scrollTop = chatBody.scrollHeight;

    botResponse(message);
}

function sendMessageFromSpeech(message){
    console.log("Sending message to bot");

    // Add user message
    const userMessage = document.createElement('div');
    userMessage.className = 'message user';
    userMessage.innerHTML = `<span>${message}</span><div class="message-time">${dateString} ${timeString}</div>`;
    chatBody.appendChild(userMessage);

    createProcessingStatusText();
    processing_status.innerHTML = `<span>Retrieving Answer...</span><div class="message-time">${dateString} ${timeString}</div>`;
    chatBody.appendChild(processing_status);

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
            const botMessageDiv = document.createElement('div');
            botMessageDiv.className = 'message bot';
            botMessageDiv.innerHTML = `<span>${bot_reply.message}</span><div class="message-time">${dateString} ${timeString}</div>`;
            chatBody.appendChild(botMessageDiv);
            const botSpan = botMessageDiv.querySelector('span');
            // After typing finishes, swap to HTML with bold formatting
            botSpan.innerHTML = setMessage.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');

            if (prompt == true) {
                var prompt_msg = botMessages["prompt_msgs"];
                botMessage(prompt_msg.message, prompt_msg.gesture, true);
            }

            processing_status?.remove();
            processing_status = null;

            // Scroll to the bottom
            chatBody.scrollTop = chatBody.scrollHeight;
        });
    }

    showRecordBtn();
}

// Takes in a message to be sent by the bot
function botMessage(setMessage, gesture, delay) {
    setTimeout(() => {
        speak(setMessage.toString(), gesture);
    }, delay?1000:0);

    setTimeout(() => {
        showRecordBtn();
        const botMessageElement = document.createElement('div');
        botMessageElement.className = 'message bot';
        botMessageElement.innerHTML = `<span>${setMessage}</span><div class="message-time">${dateString} ${timeString}</div>`;
        chatBody.appendChild(botMessageElement);
        const botSpan = botMessageElement.querySelector('span');
        // After typing finishes, swap to HTML with bold formatting
        botSpan.innerHTML = setMessage.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');

        processing_status?.remove();
        processing_status = null;

        if (g_follow_up_questions != null) {
            const followupMessageElemenet = document.createElement('div');
            followupMessageElemenet.className = 'message bot';
            followupMessageElemenet.innerHTML = `<span></span><div class="message-time">${dateString} ${timeString}</div>`;
            chatBody.appendChild(followupMessageElemenet);
            const followupSpan = followupMessageElemenet.querySelector('span');

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
    }, delay?5500:0);
}

function postAPI(message) {
    console.log("posting API...");

    //Setup request body
    const payload = {
        "app": bot_app,
        "q": message,
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

        // // Apply bold formatting to text enclosed in "**"
        // messageContent = messageContent.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');

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

        processing_status.innerHTML = `<span>Processing the answer...</span><div class="message-time">${dateString} ${timeString}</div>`;

        botMessage(messageContent, "", true);

        g_bot_response = messageContent;
        g_follow_up_questions = followUpQuestions;
    })
    .catch(error => {
        console.error('Error:', error);
    });
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