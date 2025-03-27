document.addEventListener("DOMContentLoaded", function () {
    const overlayContent = document.querySelector(".overlay-content");
    const startButton = document.getElementById("start-button");
    
    // Create loading container
    const loadingContainer = document.createElement("div");
    loadingContainer.classList.add("loading-container");
    
    // Create loading indicator
    const loadingIndicator = document.createElement("div");
    loadingIndicator.classList.add("loading-spinner");
    
    // Create loading text
    const loadingText = document.createElement("p");
    loadingText.textContent = "Loading...";
    loadingText.classList.add("loading-text");
    
    // Append loading elements
    loadingContainer.appendChild(loadingIndicator);
    loadingContainer.appendChild(loadingText);
    overlayContent.insertBefore(loadingContainer, startButton);
    
    // Hide start button initially
    startButton.style.display = "none";
    
    // Listen for the PRELOAD_FINISHED event
    document.addEventListener("PRELOAD_FINISHED", function () {
        loadingContainer.style.display = "none";
        startButton.style.display = "block";
    });
    
    // startButton.addEventListener("click", function () {
    //     document.getElementById("overlay").style.display = "none";

    //     // Dispatch event for Avatar to speak
    //     const speakEvent = new CustomEvent('SPEAK_EVENT', {
    //         detail: {
    //             message: botMessages["start_msg"][0].message,
    //             gesture: botMessages["start_msg"][0].gesture
    //         }
    //     });
    //     document.dispatchEvent(speakEvent);
    // });

    startButton.addEventListener("click", function () {
        document.getElementById("overlay").style.display = "none";
        // speak(botMessages["start_msg"][0].message, botMessages["start_msg"][0].gesture, false);
    });
});
