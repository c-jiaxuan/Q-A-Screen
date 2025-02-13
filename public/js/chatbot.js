class AI_Message {
    // Constructor method for initializing properties
    constructor(message, gesture) {
        this.message = message;
        this.gesture = gesture;
    }
}

var substring_1 = "prisoners of war";
var substring_2 = "liberation";

let botMessages = {};   // Dictionary to store all preset bot messages
botMessages["start_msg"] = new AI_Message("Hello! How can I help you for this tour today?", "G05");
// botMessages["pow_response"] = new AI_Message("Before the war, Changi had been a formidable military garrison, but with surrender it now became a place of isolation and numbing drudgery for thousands of new prisoners of war (POWs). The Japanese left the day-to-day running of the camps to the prisoners due to their sheer numbers, communicating instead through their officers or appointed representatives. To keep the camps in a liveable state, laborious chores and duties were shared among internees, from daily jobs like cooking and cleaning to the disposal of night soil. Precious little time was left over for personal activities before the lights went out each night. For the internees of Changi, the prospect of imprisonment was grim, but they were determined to endure what lay ahead.", "G02");
// botMessages["liberation_response"] = new AI_Message("By mid-1945, Germany had surrendered and the Allied forces were poised for an invasion of Japan. Just days after atomic bombs devastated the Japanese cities of Hiroshima and Nagasaki, Emperor Hirohito formally announced the unconditional surrender of all Japanese forces on 15 August 1945. Stunned by their defeat, some Japanese soldiers did not immediately obey their orders, unable to accept the shame of surrender. All the soldiers were eventually imprisoned as the Allied POWs had been in 1942. The internees, who had by now waited three and a half years for liberation, experienced everything from joy to relief. The Union Jack, carefully hidden from the Japanese during imprisonment, was raised once more as Allied soldiers returned to Singapore.", "G02");
botMessages["default_msgs"] = [new AI_Message("I am not sure what you have sent, please try again."),
                                new AI_Message("I don't quite understand what you are saying, please try again."),
                                ];
botMessages["followup_prompt"] = new AI_Message("Here are some follow up questions you might be interested to ask!", "G02");
botMessages["greeting_msg"] = new AI_Message("Hi! Let me know if you have any questions, you can input your questions into the input box, or using the \"Speak to AI\" button", "G02");
botMessages["prompt_msgs"] = new AI_Message("Let me know if you require any further help!", "G04");
botMessages["processing_msg"] = new AI_Message("Thank you! Please wait while I'm processing your question and I will reply to you shortly");

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

// True = server is open to synthesize, False = server is occupied
// The flag to control execution
let preloadFlag = false; 

// To track how many messages have been preloaded
var preloadCount = 0;
var totalMessages = 0;

let startedChat = false;
let processingSpeak = false;

const bot_typing_speed = 65;

const chatBody = document.getElementById('chat-history-container');
const userInput = document.getElementById('input');

const now = new Date();
const dateString = now.toLocaleDateString();
const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

// Happens during AI_PLAYER.onAIPlayerStateChanged.state === 'playerLoadComplete'
async function preloadAllMessages() {
    // Loop through the dictionary
    preloadFlag = true; // Set flag to true to start preloading
    console.log("preloadFlag state: " + preloadFlag);
    console.log("preloading messages...");
    for (const key in botMessages) {
        if (botMessages.hasOwnProperty(key)) {
            const value = botMessages[key];
            
            if (Array.isArray(value)) {
                // If the value is an array, loop through its elements
                value.forEach(async (item, index) => {
                    //console.log(`  [${index}] ${item}`);
                    await sendPreload(item);
                    //await AI_PLAYER.preload(item);
                });
            } else {
                // If the value is not an array, log it directly
                //console.log(`Key: ${key}, Value: ${value}`);
                await sendPreload(value);
                //await AI_PLAYER.preload(value);
            }
        }
    }
}

function preloadTest() {
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

function countDictionary() {
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

function checkForFinishedPreloading() {
    console.log("Checking if preloaded finish against " + totalMessages + " items ...");
    if (preloadCount >= totalMessages) {
        console.log("Finished preloading all " + preloadCount + " messages");
        beginChat();
    }
}

function beginChat() {
    console.log("Beginning chat");

    botMessage(botMessages["start_msg"].message, botMessages["start_msg"].gesture);
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

    userInput.value = '';

    botResponse(message);
}

function sendMessageFromSpeech(message){
    console.log("Sending message to bot");

    // Add user message
    const userMessage = document.createElement('div');
    userMessage.className = 'message user';
    userMessage.innerHTML = `<span>${message}</span><div class="message-time">${dateString} ${timeString}</div>`;
    chatBody.appendChild(userMessage);

    userInput.value = '';

    botResponse(message);
}

// Takes in response from user input and replies based on input
// Takes in a bool 'prompt' for whether to prompt the user for more input
function botResponse(response) {
    var bot_reply = null;
    var prompt = true;
    var lowerCase_response = response.toLowerCase();
    if (lowerCase_response.includes(substring_1)) {
        bot_reply = botMessages["pow_response"];
    }
    else if (lowerCase_response.includes(substring_2)) {
        bot_reply = botMessages["liberation_response"];
    }
    else {
        // botMsg = getRandomElement(botMessages["default_msgs"]);
        // bot_reply = botMsg.message;
        // bot_gst = botMsg.gesture;
        var bot_response = postAPI(response);
        prompt = false;
    }

    showRecordBtn(false);
    showTalkBtn(false);
    showProcessingBtn(true);

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
                botMessage(prompt_msg.message, prompt_msg.gesture);
            }

            // Scroll to the bottom
            chatBody.scrollTop = chatBody.scrollHeight;
        });
    }

    showRecordBtn(true);
    showTalkBtn(false);
    showProcessingBtn(false);
}

// Takes in response from user input and replies based on input
// Takes in a bool 'prompt' for whether to prompt the user for more input
function botResponse_Typing(response) {
    var bot_reply = null;
    var prompt = true;
    var lowerCase_response = response.toLowerCase();
    if (lowerCase_response.includes(substring_1)) {
        bot_reply = botMessages["pow_response"];
    }
    else if (lowerCase_response.includes(substring_2)) {
        bot_reply = botMessages["liberation_response"];
    }
    else {
        // botMsg = getRandomElement(botMessages["default_msgs"]);
        // bot_reply = botMsg.message;
        // bot_gst = botMsg.gesture;
        var bot_response = postAPI(response);
        prompt = false;
    }

    showRecordBtn(false);
    showTalkBtn(false);
    showProcessingBtn(true);

    if (bot_reply != null) {
        setTimeout(() => {
            speak(bot_reply.message, bot_reply.gesture);
            const botMessageDiv = document.createElement('div');
            botMessageDiv.className = 'message bot';
            botMessageDiv.innerHTML = `<span></span><div class="message-time">${dateString} ${timeString}</div>`;
            chatBody.appendChild(botMessageDiv);
            const botSpan = botMessageDiv.querySelector('span');
            botSpan.innerHTML = setMessage.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');

            let i = 0;
            const interval = setInterval(() => {
                if (i < bot_reply.message.length) {
                    botSpan.innerHTML += bot_reply.message[i];
                    i++;
                } else {
                    clearInterval(interval);
                    if (prompt == true) {
                        var prompt_msg = botMessages["prompt_msgs"];
                        botMessage(prompt_msg.message, prompt_msg.gesture);
                    }
                }
            }, bot_typing_speed)

            // Scroll to the bottom
            chatBody.scrollTop = chatBody.scrollHeight;
        });
    }

    showRecordBtn(true);
    showTalkBtn(false);
    showProcessingBtn(false);
}

// Takes in a message to be sent by the bot
function botMessage(setMessage, gesture) {
    setTimeout(() => {
        showRecordBtn(true);
        showTalkBtn(false);
        showProcessingBtn(false);

        speak(setMessage.toString(), gesture);
        const botMessageElement = document.createElement('div');
        botMessageElement.className = 'message bot';
        botMessageElement.innerHTML = `<span>${setMessage}</span><div class="message-time">${dateString} ${timeString}</div>`;
        chatBody.appendChild(botMessageElement);
        const botSpan = botMessageElement.querySelector('span');
        // After typing finishes, swap to HTML with bold formatting
        botSpan.innerHTML = setMessage.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');

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
    }, 100);
}

// Takes in a message to be sent by the bot
function botMessage_Typing(setMessage, gesture) {
    setTimeout(() => {
        showRecordBtn(false);
        showTalkBtn(false);
        showProcessingBtn(true);
        speak(setMessage.toString(), gesture);
        const botMessageElement = document.createElement('div');
        botMessageElement.className = 'message bot';
        botMessageElement.innerHTML = `<span></span><div class="message-time">${dateString} ${timeString}</div>`;
        chatBody.appendChild(botMessageElement);
        const botSpan = botMessageElement.querySelector('span');

        let i = 0;
        let plainText = ""; // Store raw text for typing effect

        const interval = setInterval(() => {
            if (i < setMessage.length) {
                plainText += setMessage[i]; // Type character by character
                botSpan.textContent = plainText; // Show plain text while typing
                i++;
            } else {
                clearInterval(interval);

                // After typing finishes, swap to HTML with bold formatting
                botSpan.innerHTML = setMessage.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');

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
            }
        }, bot_typing_speed);

        // Scroll to the bottom
        chatBody.scrollTop = chatBody.scrollHeight;
    });
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

        botMessage(messageContent);

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

function includeString(source, keyword) {
    var L_src = source.toLowerCase();
    var L_key = keyword.toLowerCase();
    return (L_src.includes(L_key));
}

// Function to wait until the flag is set
function waitForFlag() {
    return new Promise((resolve) => {
        const checkFlag = setInterval(() => {
            if (preloadFlag) {
                clearInterval(checkFlag); // Stop checking once the flag is true
                resolve(); // Resolve the promise
            }
        }, 100); // Check every 100ms
    });
}