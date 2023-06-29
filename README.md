# ModernCinemaPlayer

ModernCinemaPlayer is a JavaScript class that provides a modern and customizable video player interface. It allows you to easily create a video player with features like playback control, volume control, progress tracking, playlist support, fullscreen mode, keyboard shortcuts, and more.

## Usage

To use the ModernCinemaPlayer class, follow these steps:

1. Include the necessary HTML markup in your web page. Make sure to provide the required elements with their corresponding IDs, as mentioned in the code snippet below:

```html
<div id="videoContainer">
  <video id="videoElement"></video>
  <div id="overlay"></div>
  <!-- Other UI elements and controls -->
</div>
<ul id="playlistItems"></ul>
<!-- Other playlist related elements -->
```

2. Create an instance of the ModernCinemaPlayer class, passing the video element and media JSON as parameters:

```javascript
const videoElement = document.getElementById("videoElement");
const mediaJSON = [
  {
    categories: [
      {
        videos: [
          {
            sources: [
              "https://example.com/video1.mp4",
              "https://example.com/video1.webm",
            ],
            thumb: "1.jpg",
            title: "Video 1",
          },
          {
            sources: [
              "https://example.com/video2.mp4",
              "https://example.com/video2.webm",
            ],
            thumb: "2.jpg",
            title: "Video 2",
          },
        ],
      },
    ],
  },
];

const player = new ModernCinemaPlayer(videoElement, mediaJSON);
```

3. Customize the player's appearance and behavior by modifying the provided CSS styles and adjusting the class methods as needed.

## Features

The ModernCinemaPlayer class offers the following features:

- Video playback control (play/pause)
- Volume control (mute/unmute, volume adjustment)
- Progress tracking (current time and duration display, progress bar)
- Playlist support (create playlist items, switch between videos)
- Fullscreen mode (toggle fullscreen)
- Keyboard shortcuts (play/pause, seek, volume control, etc.)
- Auto-skip to the next track/video
- Customizable appearance and behavior

## Methods

The ModernCinemaPlayer class provides the following methods for controlling the player:

- `togglePlayback()`: Toggles the playback state of the video.
- `toggleMute()`: Toggles the mute state of the video.
- `stopPlayback()`: Stops the video playback and resets the current time to 0.
- `nextTrack()`: Switches to the next track in the playlist.
- `skipForward()`: Skips the video playback forward by 5 seconds.
- `skipBackward()`: Skips the video playback backward by 5 seconds.
- `nextFrame()`: Moves the video playback to the next frame.
- `previousFrame()`: Moves the video playback to the previous frame.
- `increasePlaybackRate()`: Increases the playback rate of the video.
- `decreasePlaybackRate()`: Decreases the playback rate of the video.
- `seekToStart()`: Seeks the video playback to the start.
- `seekToEnd()`: Seeks the video playback to the end.
- `seekToPercentage(percentage)`: Seeks the video playback to the specified percentage of the total duration.
- `focusSearchBox()`: Focuses on the search box (customizable implementation).
- `toggleFullscreen()`: Toggles fullscreen mode.
- `toggleCaptions()`: Toggles captions or subtitles (customizable implementation).
- `increaseVolume()`: Increases the volume level of the video.
- `decreaseVolume()`: Decreases the volume level of the video.
- `

showVolumeDisplay()`: Shows a temporary volume level display.

- `nextVideo()`: Alias for `nextTrack()`.
- `previousVideo()`: Switches to the previous track in the playlist.
- `openMiniplayer()`: Opens the miniplayer (customizable implementation).
- `unbindKeyboardShortcuts()`: Unbinds the keyboard shortcuts.

Certainly! Here are the custom keyboard mappings for the ModernCinemaPlayer class that you can include in your README:

## Keyboard Mappings:

- **Space** / **MediaPlayPause**: Toggle playback (play/pause).
- **KeyM**: Toggle mute.
- **MediaStop**: Stop playback.
- **MediaTrackNext** / **MediaNextTrack** / **MediaFastForward** / **KeyN** / **KeyE** / **ShiftRight** / **BracketRight** / **Period** / **Comma** / **KeyF9**: Switch to the next track in the playlist.
- **ArrowRight** / **KeyL**: Skip forward by 5 seconds.
- **ArrowLeft** / **KeyJ**: Skip backward by 5 seconds.
- **Period**: Move to the next frame (when paused).
- **Comma**: Move to the previous frame (when paused).
- **GreaterThan**: Increase the playback rate.
- **LessThan**: Decrease the playback rate.
- **Home**: Seek to the start.
- **End**: Seek to the end.
- **ArrowUp**: Increase volume.
- **ArrowDown**: Decrease volume.
- **Digit1** / **Digit2** / **Digit3** / **Digit4** / **Digit5** / **Digit6** / **Digit7** / **Digit8** / **Digit9**: Seek to a specific percentage (10% to 90%).
- **Digit0**: Seek to the start.
- **Slash**: Focus on the search box (customizable implementation).
- **KeyF**: Toggle fullscreen.
- **KeyC**: Toggle captions or subtitles (customizable implementation).
- **ShiftKeyN**: Alias for `nextTrack()`.
- **ShiftKeyP** / **ShiftLeft** / **MediaTrackPrevious** / **BracketLeft** / **KeyP** / **KeyB**: Switch to the previous track in the playlist.
- **KeyI**: Open the miniplayer (customizable implementation).

Feel free to copy and paste these mappings into your README and customize them as needed.

## Event Listeners

The ModernCinemaPlayer class also provides several event listener methods that handle various player interactions and UI updates. These methods include:

- `updatePlayButton()`: Updates the appearance of the play/pause button based on the video playback state.
- `startSeek()`: Handles the start of the seek operation (mousedown on the progress scrubber).
- `stopSeek()`: Handles the end of the seek operation (mouseup on the progress scrubber).
- `updateSeek(event)`: Updates the video playback position and progress bar during the seek operation.
- `updateProgress()`: Updates the progress bar based on the current video playback position.
- `jumpToPosition(event)`: Jumps the video playback to the specified position on the progress bar.
- `initializeVolume()`: Initializes the volume level display.
- `startVolumeChange(event)`: Handles the start of the volume change operation (mousedown on the volume bar).
- `stopVolumeChange()`: Handles the end of the volume change operation (mouseup on the volume bar).
- `handleVolumeClick(event)`: Handles the click on the volume bar to adjust the volume level.
- `updateVolume(event)`: Updates the volume level and volume bar position during the volume change operation.
- `togglePlay()`: Toggles the video playback state when the play button is clicked.
- `fullscreenChange()`: Handles the change in fullscreen mode (entering or exiting fullscreen).
- `showControls()`: Shows the player controls and starts the controls timeout for auto-hiding.
- `hideControls()`: Hides the player controls.
- `startControlsTimeout()`: Starts the timeout for auto-hiding the controls.

Feel free to modify and extend these methods according to your specific requirements.

## Customization

The ModernCinemaPlayer class is designed to be easily customizable. You can modify the provided CSS styles to change the appearance of the player elements. Additionally, you can update the class methods to add or modify functionality based on your needs.

## Browser Compatibility

The ModernCinemaPlayer class is compatible with modern web browsers that support the necessary HTML5 video and CSS features. It is recommended to test the player in different browsers to ensure optimal compatibility and behavior.

## License

ModernCinemaPlayer is open-source software released under the MIT License. You are free to use, modify, and distribute the code as per the terms of the license.
