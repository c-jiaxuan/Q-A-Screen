// Buffer to store and track which video element is being played
var playingVideo = null;

var AvatarSizeY = '100%';
var AvatarSizeX = '100%';

const avatarVideoDiv = document.getElementById('avatar-videos-div');

// Get references to the video element and the button
var idleVideo, talkingVideo;

function init()
{
    //Get all video elements 
    idleVideo = document.getElementById('idleVideo');
    talkingVideo = document.getElementById('talkingVideo');

    //Load all the video elements
    idleVideo.load();
    talkingVideo.load();

    //Pause all the video elements
    pauseVideo(idleVideo);
    pauseVideo(talkingVideo);

    //Play idle video
    // playVideo(idleVideo);

    document.addEventListener('USE_TTS', ()=> {
        avatarVideoDiv.classList.remove('hidden');
        playVideo(idleVideo);
    });

    document.addEventListener('USE_AVATAR', ()=> {
        avatarVideoDiv.classList.add('hidden');
        pauseVideo(idleVideo);
        pauseVideo(talkingVideo);
    });

    document.addEventListener('AVATAR_SPEAK', ()=> {
        playVideo(talkingVideo);
    });
}

// Pause a video and reduce it's size to 0px
function pauseVideo(videoToPause)
{
    if (videoToPause != null)
    {
        videoToPause.pause();
        videoToPause.currentTime = 0;
        videoToPause.style.width = '0px';
        videoToPause.style.height = '0px';
    }
}

// Plays a video and sets the size of the video element to the AvatarSize
function playVideo(videoToPlay)
{
    //Check if has current video
    //If yes => pause that video + resize
    if(playingVideo != null)
    {
        pauseVideo(playingVideo);
    }
    //If no => do nothing

    //Play next video + resize
    if(videoToPlay != null)
    {
        videoToPlay.play();
        videoToPlay.style.width = AvatarSizeX;
        videoToPlay.style.height = AvatarSizeY;
    }

    //Update current playing video
    playingVideo = videoToPlay;
}

// Call the init function to initialize the canvas
init();

talkingVideo.addEventListener('ended', () => {
    console.log('ENDED video');
    playVideo(idleVideo)
})