// LLMs API Settings
// Change these to change the LLMs response
var bot_app = "sgroots"; // Don't change this
var bot_tone = "Succinct"; // Professional, Casual, Enthusiastic, Informational, Funny, Succinct
var bot_format = "Summary"; // Summary, Report, Bullet Points, LinkedIn Post, Email
var bot_language = "English";
var bot_followup = true;

var llm_summarise_api_url = 'https://gramener.com/docsearch/summarize';

// Used to store followup questions
var follow_up_questions = null;

var processing_status = null;
var oneTime_txt_bubble = null;

let processingSpeak = false;

const chatBody = document.getElementById('chat-history-container');
const userInput = document.getElementById('input');

const USER_BUBBLE = 'message user';
const BOT_BUBBLE = 'message bot';

// Store interval reference
let animationInterval;

const now = new Date();
const dateString = now.toLocaleDateString();
const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

// Showing loading chat bubble before beginChat
function loadingChat() {
    createTempBubble(BOT_BUBBLE, "Loading AI, please wait", 0);
}

function beginChat() {
    console.log("Beginning chat");
    deleteTempBubble();
    botMessage(botMessages["start_msg"].message, botMessages["start_msg"].gesture, false);
}

function processUserMessage(msg){
    if (msg == '') 
    {
        // Reset all parameters
        return;
    }
    createMsgBubble(USER_BUBBLE, msg);

    // Create temp bubble to show status message
    createTempBubble(USER_BUBBLE, "Retrieving Answer", 0);

    userInput.value = '';

    // Scroll to the bottom
    chatBody.scrollTop = chatBody.scrollHeight;

    botResponse(msg);
}

// Takes in response from user input and replies based on input
// Takes in a bool 'prompt' for whether to prompt the user for more input
function botResponse(response) {
    var prompt = true;
    prompt = false;

    showProcessingBtn();
    // Display processing status
    createTempBubble(BOT_BUBBLE, "Retrieving Answer", 0);
    //Clear user input box
    userInput.value = '';
    // Scroll to the bottom
    chatBody.scrollTop = chatBody.scrollHeight;

    sendToLLMs(response);
}

// Received input from chatbox
function sendMessageFromChatbox() {
    console.log("Triggered input from chatbox");
    processUserMessage(userInput.value.trim());
}

// Received input from speech
function sendMessageFromSpeech(message){
    console.log("Received message from stt");
    processUserMessage(message);
}

// Send user question to LLMs => retrieve and process the response
function sendToLLMs(message) {
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
        var followUpQuestions = messageContent.match(/- \[.*?\]/g)?.map(question => question.slice(3, -1)) || [];

        // Remove follow-up questions from the main content
        if (followUpQuestions.length > 0) {
            var splitIndex = messageContent.indexOf('- ['); // Find where follow-up starts
            messageContent = messageContent.substring(0, splitIndex).trim(); // Keep only the main content
        }

        // Output results
        console.log("Cleaned Message Content:", messageContent);
        console.log("Follow-Up Questions:", followUpQuestions);

        processBotMessage(messageContent, followUpQuestions);
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

// Process the message from LLMs to display to user
function processBotMessage(answer, followUpQns){
    //LLMs doesn't reply anything => didn't understand the question
    if (answer == "")
    {
        //Change this => using external variables
        answer = getRandomElement(botMessages['default_msgs']).message;
    }
    else
    {
        speak(botMessages["processing_msg"].message);

        // Show processing status
        createTempBubble(BOT_BUBBLE, "Processing the answer", 0);

        setTimeout(() => { 
            // Delete processing status after 2 seconds
            deleteTempBubble();
            //Display bot message to user
            createMsgBubble(BOT_BUBBLE, answer);

            //Store follow up questions for future usage
            follow_up_questions = followUpQns;
            if (follow_up_questions != null) {
                var followupMessageElement = createMsgBubble(BOT_BUBBLE, "");
                var followupSpan = followupMessageElement.querySelector('span');
    
                let header = document.createElement("p");
                //**Add avatar talking**
                header.textContent = "Some common follow-up questions:";
                header.style.fontWeight = "bold"; // Make header bold
                followupSpan.append(header);
                
                // Loop through follow-up questions and create bullet points
                follow_up_questions.forEach(question => {
                    let li = document.createElement("li");
                    li.textContent = question;
                    followupSpan.appendChild(li);
                });
                
                console.log("Follow up questions found, sending follow up question...");
                follow_up_questions = null;
            }
        }, 2000);
    }

    // Scroll to the bottom
    chatBody.scrollTop = chatBody.scrollHeight;

    //Send to avatar to speak
    speak(answer);
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
    
                if (follow_up_questions != null) {
                    const followupMessageElement = createMsgBubble(BOT_BUBBLE, "");
                    const followupSpan = followupMessageElement.querySelector('span');
    
                    let header = document.createElement("p");
                    //**Add avatar talking**
                    header.textContent = "Some common follow-up questions:";
                    header.style.fontWeight = "bold"; // Make header bold
                    followupSpan.append(header);
                    
                    // Loop through follow-up questions and create bullet points
                    follow_up_questions.forEach(question => {
                        let li = document.createElement("li");
                        li.textContent = question;
                        followupSpan.appendChild(li);
                    });
                    console.log("Follow up questions found, sending follow up question...");
                    //botMessage(g_follow_up_questions[0]);
                    follow_up_questions = null;
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

        if (follow_up_questions != null) {
            const followupMessageElement = createMsgBubble(USER_BUBBLE, "");
            const followupSpan = followupMessageElement.querySelector('span');

            let header = document.createElement("p");
            //**Add avatar talking**
            header.textContent = "Some common follow-up questions:";
            header.style.fontWeight = "bold"; // Make header bold
            followupSpan.append(header);
            
            // Loop through follow-up questions and create bullet points
            follow_up_questions.forEach(question => {
                let li = document.createElement("li");
                li.textContent = question;
                followupSpan.appendChild(li);
            });
            console.log("Follow up questions found, sending follow up question...");
            follow_up_questions = null;
        }

        // Scroll to the bottom
        chatBody.scrollTop = chatBody.scrollHeight;
    }
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
    animateMsgBubble();
    return oneTime_txt_bubble;
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
    stopAnimateMsgBubble();
    oneTime_txt_bubble?.remove();
    oneTime_txt_bubble = null;
}

function getRandomElement(arr) {
    const randomIndex = Math.floor(Math.random() * arr.length);
    return arr[randomIndex];
}
