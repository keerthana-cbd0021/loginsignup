let currentLanguage = 'english';
let responseObj; // Variable to store fetched response data

const chatBody = document.querySelector(".chat-body");
const txtInput = document.querySelector("#txtInput");
const send = document.querySelector(".send");
const micIcon = document.querySelector("#micIcon");
const englishButton = document.getElementById('englishButton');
const kannadaButton = document.getElementById('kannadaButton');

send.addEventListener("click", () => renderUserMessage());

txtInput.addEventListener("keyup", (event) => {
  if (event.keyCode === 13) {
    renderUserMessage();
  }
});

englishButton.addEventListener('click', function () {
    setLanguage('english');
});

kannadaButton.addEventListener('click', function () {
    setLanguage('kannada');
});

micIcon.addEventListener("click", startVoiceRecognition);

function setLanguage(language) {
    // Reset active class on all buttons
    resetLanguageButtons();

    // Set active class on the selected button
    if (language === 'english') {
        englishButton.classList.add('active');
        currentLanguage = 'english';
        console.log("Language set to English");
    } else if (language === 'kannada') {
        kannadaButton.classList.add('active');
        currentLanguage = 'kannada';
        console.log("Language set to Kannada");
    }

    fetchData(currentLanguage)
        .then(data => {
            responseObj = data;
            // Call functions that depend on the data being loaded
            // For example, you can call renderUserMessage here if needed
        })
        .catch(error => {
            console.error(`Error loading ${currentLanguage} responses:`, error);
            // Handle error, e.g., display a message to the user
        });
}

function fetchData(language) {
    return fetch(`${language}.json`)
        .then(response => response.json())
        .catch(error => {
            console.error(`Error loading ${language} responses:`, error);
            throw error; // Propagate the error to the next .catch block
        });
}

function startVoiceRecognition() {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();

    // Set the language based on the selected button
    const languageSelect = document.querySelector('.language-button.active');
    recognition.lang = languageSelect.dataset.language;

    recognition.onresult = function (event) {
        const voiceInput = event.results[0][0].transcript;
        txtInput.value = voiceInput;
        sendMessage();
    };

    recognition.start();
}

function resetLanguageButtons() {
    // Reset active class on all buttons
    englishButton.classList.remove('active');
    kannadaButton.classList.remove('active');
}

async function generateOpenAIResponse(userInput) {
    try {
        const apiKey = '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';
        const apiUrl = 'https://api.openai.com/v1/chat/completions';

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [
                    { role: 'user', content: userInput }
                ],
                temperature: 0.7
            })
        });

        const responseData = await response.json();

        if (responseData.choices && responseData.choices.length > 0) {
            return responseData.choices[0].message.content.trim();
        } else {
            console.error("Megabot response does not contain choices:", responseData);
            return "Error: No response from Megabot";
        }
    } catch (error) {
        console.error("Error generating Megabot response:", error);
        return "Error generating response";
    }
}


const renderUserMessage = () => {
    const userInput = txtInput.value;
    renderMessageEle(userInput, "user");
    txtInput.value = "";
    setTimeout(() => {
        renderChatbotResponse(userInput);
        setScrollPosition();
    }, 600);
};

const renderChatbotResponse = async (userInput) => {
    try {
        await fetchData(currentLanguage); // Ensure data is loaded before proceeding
        const localResponse = getChatbotResponse(userInput);

        if (localResponse === "Please try something else") {
            const openAIResponse = await generateOpenAIResponse(userInput);
            renderMessageEle(openAIResponse, "chatbot");
        } else {
            renderMessageEle(localResponse, "chatbot");
        }
    } catch (error) {
        console.error("Error rendering chatbot response:", error);
        // Handle error, e.g., display a message to the user
        renderMessageEle("Error getting response", "chatbot");
    }
};

const renderMessageEle = (txt, type) => {
    let className = "user-message";
    if (type === "chatbot") {
        className = "chatbot-message";
    }
    const messageEle = document.createElement("div");
    const txtNode = document.createTextNode(txt);
    messageEle.classList.add(className);
    messageEle.append(txtNode);
    chatBody.append(messageEle);
};

const getChatbotResponse = (userInput) => {
    if (!responseObj || !responseObj.intents) {
        return "Please try something else";
    }

    const matchingIntent = responseObj.rc/ intents.find(intent =>
        intent.patterns.some(pattern =>
            userInput.toLowerCase().includes(pattern.toLowerCase())
        )
    );

    return matchingIntent ? getRandomResponse(matchingIntent.responses) : "Please try something else";
};

const getRandomResponse = (responses) => {
    const randomIndex = Math.floor(Math.random() * responses.length);
    return responses[randomIndex];
};

const setScrollPosition = () => {
    if (chatBody.scrollHeight > 0) {
        chatBody.scrollTop = chatBody.scrollHeight;
    }
};