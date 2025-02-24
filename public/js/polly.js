// Initialize the Amazon Cognito credentials provider
AWS.config.region = "ap-southeast-2";
AWS.config.credentials = new AWS.CognitoIdentityCredentials({IdentityPoolId: "ap-southeast-2:7660d1bb-d42d-4938-b0bf-e995c8f00d70"});

// Function invoked by button click
function speakText(speech) {
    // Create the JSON parameters for getSynthesizeSpeechUrl
    var speechParams = {
        OutputFormat: "mp3",
        SampleRate: "16000",
        Text: speech,
        TextType: "text",
        VoiceId: "Amy"
    };
    //speechParams.Text = document.getElementById("textEntry").value;

    // Create the Polly service object and presigner object
    var polly = new AWS.Polly({apiVersion: '2016-06-10'});
    var signer = new AWS.Polly.Presigner(speechParams, polly)


    // Create presigned URL of synthesized speech file
    signer.getSynthesizeSpeechUrl(speechParams, function(error, url) {
    if (error) {
        //document.getElementById('result').innerHTML = error;
    } else {
        document.getElementById('audioSource').src = url;
        const audio = document.getElementById('audioPlayback');
        audio.load();
        audio.addEventListener('loadeddata', () => {
            audio.play().catch(error => {
                console.error("Error during play:", error);
            });
        });
        //document.getElementById('result').innerHTML = "Speech ready to play.";
    }
  });
}