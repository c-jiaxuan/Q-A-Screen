class AI_Message {
    // Constructor method for initializing properties
    constructor(message, gesture) {
        this.message = message;
        this.gesture = gesture;
    }
}

var substring_1 = "tang shipwreck";
var substring_2 = "pagoda";

let botMessages = {};   // Dictionary to store all preset bot messages
botMessages["start_msg"] = new AI_Message("Hello! How can I help you for this tour today?", "G05");
botMessages["tang_shipwreck_response"] = new AI_Message("The Tang Shipwreck, discovered in 1998 off Sumatra, was a 9th-century Arab ship carrying a vast cargo of ceramics, glass, and other goods. This highlights Southeast Asia’s role in global trade along the Maritime Silk Route. The variety of ceramics, including Changsha wares, Yue celadons, and white wares from northern China, illustrates the competitiveness of the Chinese ceramics industry. The Tang Shipwreck Collection is now part of the Asian Civilisations Museum’s “Trade and the Maritime Silk Routes” exhibit, showcasing masterpieces of Asian export art from the 9th to the early 20th century.", "G02");
botMessages["pagoda_response"] = new AI_Message("Pagoda Odyssey 1915: From Shanghai to San Francisco reunites 84 hand-carved model pagodas for the first time in over a century. Originally made in Shanghai, they traveled to San Francisco for the 1915 Panama-Pacific International Exposition, which attracted over 18 million visitors. The models, based on real structures, showcase the diversity of iconic pagodas from different regions and historical periods, offering a glimpse of China’s rich architectural heritage. The exhibition, complemented by Towers of Faith (a photography display) and Journey into the Pagoda (a virtual reality experience), will also feature public programs like weekend festivals, curator-led tours, and talks.", "G02");
botMessages["default_msgs"] = [new AI_Message("I am not sure what you have sent, please try again."),
                                new AI_Message("I don't quite understand what you are saying, please try again."),
                                new AI_Message("I am sorry but can you please repeat the question?")
                                ];
botMessages["greeting_msg"] = new AI_Message("Hi! Let me know if you have any questions, you can input your questions into the input box, or using the \"Speak to AI\" button", "G02");
botMessages["prompt_msgs"] = [new AI_Message("Let me know if you require any further help!", "G04"),
                            new AI_Message("If you have any other questions, don't hestiate to ask me!")
                            ];

var bot_tone = "Professional";

// True = server is open to synthesize, False = server is occupied
// The flag to control execution
let preloadFlag = false; 

// To track how many messages have been preloaded
var preloadCount = 0;
var totalMessages = 0;

let startedChat = false;

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

// Takes in response from user input and replies based on input
// Takes in a bool 'prompt' for whether to prompt the user for more input
function botResponse(response) {
    var bot_reply = null;
    var prompt = true;
    var lowerCase_response = response.toLowerCase();
    if (lowerCase_response.includes(substring_1)) {
        bot_reply = botMessages["tang_shipwreck_response"];
    }
    else if (lowerCase_response.includes(substring_2)) {
        bot_reply = botMessages["pagoda_response"];
    }
    else {
        // botMsg = getRandomElement(botMessages["default_msgs"]);
        // bot_reply = botMsg.message;
        // bot_gst = botMsg.gesture;
        var response = postAPI(response, bot_tone);
        prompt = false;
    }

    if (bot_reply != null) {
        setTimeout(() => {
            speak(bot_reply.message, bot_reply.gesture);
            const botMessageDiv = document.createElement('div');
            botMessageDiv.className = 'message bot';
            botMessageDiv.innerHTML = `<span></span><div class="message-time">${dateString} ${timeString}</div>`;
            chatBody.appendChild(botMessageDiv);
            const botSpan = botMessageDiv.querySelector('span');

            let i = 0;
            const interval = setInterval(() => {
                if (i < bot_reply.message.length) {
                    botSpan.textContent += bot_reply.message[i];
                    i++;
                } else {
                    clearInterval(interval);
                    if (prompt == true) {
                        var prompt_msg = getRandomElement(botMessages["prompt_msgs"])
                        botMessage(prompt_msg.message, prompt_msg.gesture);
                    }
                }
            }, bot_typing_speed)

            // Scroll to the bottom
            chatBody.scrollTop = chatBody.scrollHeight;
        });
    }
}

// Takes in a message to be sent by the bot
function botMessage(setMessage, gesture) {
    setTimeout(() => {
        speak(setMessage.toString(), gesture);
        const botMessage = document.createElement('div');
        botMessage.className = 'message bot';
        botMessage.innerHTML = `<span></span><div class="message-time">${dateString} ${timeString}</div>`;
        chatBody.appendChild(botMessage);
        const botSpan = botMessage.querySelector('span');

        let i = 0;
        const interval = setInterval(() => {
            if (i < setMessage.length) {
                botSpan.textContent += setMessage[i];
                i++;
            } else {
                clearInterval(interval);
            }
        }, bot_typing_speed)

        // Scroll to the bottom
        chatBody.scrollTop = chatBody.scrollHeight;
    });
}

function postAPI(message, tone) {
    console.log("posting API...");

    const url = 'https://gramener.com/docsearch/summarize';
    const payload = {
        "app": "sgroots",
        "q": message,
        "context": "Add context from matches. Use the format:\n\nDOC_ID: 1\nTITLE: (title)\n(page_content)\n\nDOC_ID: 2\nTITLE: ...\n...",
        "Followup": 1,
        "Tone": tone,
        "Format": "Summary",
        "Language": "English"
    };

    // Make API call
    fetch(url, {
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
        botMessage(messageContent);

        // Return the bots response
        return {
            bot_reply: messageContent,
            followup: followUpQuestions
        };
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