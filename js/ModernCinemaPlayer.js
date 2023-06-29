class ModernCinemaPlayer {
  constructor(videoElement, mediaJson) {
    this.videoContainer = document.getElementById("videoContainer");
    this.videoElement = videoElement;
    this.videoElementOverlay = document.getElementById("overlay");
    this.playButton = document.getElementById("playButton");
    this.scrubber = document.getElementById("scrubber");
    this.progress = document.getElementById("progress");
    this.volumeContainer = document.getElementById("volumeContainer");
    this.volumeBar = document.getElementById("volumeBar");
    this.volumeLevel = document.getElementById("volumeLevel");
    this.fullscreenButton = document.getElementById("fullscreenButton");
    this.playlistContainer = document.getElementById("playlist");
    this.mediaJson = mediaJson;
    this.playlistItems = this.createPlaylistItems();
    this.currentTrackIndex = 0;
    if (this.playlistItems.length <= 1) {
      this.playlistContainer.style.display = "none";
      this.videoContainer.style.alignItems = "center";
    }
    this.loadTrack(this.currentTrackIndex);
    this.isInteracted = false;
    this.addEventListeners();
    this.bindVideoInteraction();
    this.autoSkipToNextTrack();
    //this.bindKeyboardShortcuts();
    this.initializeVolume();
    this.hideControlsTimeout = null;
    this.controlsVisible = true;
    this.startControlsTimeout();
    this.isSeeking = false;
    this.isVolumeChanging = false;
    this.videoElement.addEventListener(
      "timeupdate",
      this.updateProgress.bind(this)
    );

    this.videoContainer.addEventListener(
      "touchstart",
      this.handleTouchStart.bind(this)
    );
    this.videoContainer.addEventListener(
      "touchmove",
      this.handleTouchMove.bind(this)
    );
    this.videoContainer.addEventListener(
      "touchend",
      this.handleTouchEnd.bind(this)
    );

    this.volumeContainer.addEventListener(
      "mousedown",
      this.startVolumeChange.bind(this)
    );
    document.addEventListener("mouseup", this.stopVolumeChange.bind(this));
    this.volumeContainer.addEventListener(
      "click",
      this.updateVolume.bind(this)
    );

    // Example usage
    const detector = new MobileLandscapeDetector();

    document.addEventListener("landscape", () => {
      //alert("landscape");
      if (!document.fullscreenElement) {
        //this.toggleFullscreen();
      }
    });

    document.addEventListener("notlandscape", () => {
      //alert("not landscape");
    });
  }

  createPlaylistItems() {
    const playlistItems = this.mediaJson[0].categories[0].videos.map(
      (video, index) => {
        const li = document.createElement("li");
        li.setAttribute("data-src", video.sources[0]);

        const thumbnailUrl = video.sources[0].substring(
          0,
          video.sources[0].lastIndexOf("/") + 1
        );
        li.setAttribute("data-thumb", thumbnailUrl + video.thumb); // Set the data-thumb attribute

        const thumbnail = document.createElement("img");
        thumbnail.setAttribute("src", thumbnailUrl + video.thumb); // Set the thumbnail image src
        thumbnail.setAttribute("alt", video.title);
        thumbnail.style.maxWidth = "100px"; // Set the maximum width to 100 pixels
        li.appendChild(thumbnail);

        const title = document.createElement("span");
        title.textContent = video.title;
        li.appendChild(title);

        li.addEventListener("click", () => {
          this.currentTrackIndex = index;
          this.loadTrack(index);

          if (!document.fullscreenElement) {
            this.toggleFullscreen();
          }
          this.playVideo();
        });

        return li;
      }
    );

    const playlistElement = document.getElementById("playlistItems");
    playlistItems.forEach((li) => playlistElement.appendChild(li));

    return playlistItems;
  }

  loadTrack(index) {
    const src = this.playlistItems[index].getAttribute("data-src");
    const thumbnail = this.playlistItems[index].getAttribute("data-thumb");

    // Remove active class from all playlist items
    this.playlistItems.forEach((item) => {
      item.classList.remove("active");
    });

    // Set active class for the selected track
    this.playlistItems[index].classList.add("active");

    this.videoElement.src = src;
    this.videoElement.poster = thumbnail; // Set the thumbnail as the poster image

    // Scroll to the position of the selected track in the playlist
    const playlist = document.getElementById("playlist");
    const selectedTrack = this.playlistItems[index];
    const scrollTop = selectedTrack.offsetTop - playlist.offsetTop;
    playlist.scrollTop = scrollTop;
  }

  autoSkipToNextTrack() {
    this.videoElement.addEventListener("ended", () => {
      this.nextTrack();
    });
  }

  handleTouchStart(event) {
    this.startY = event.touches[0].clientY;
    this.volumeStart = this.videoElement.volume;
  }

  handleTouchMove(event) {
    const currentY = event.touches[0].clientY;
    const currentX = event.touches[0].clientX;
    const containerHeight = this.videoContainer.clientHeight;
    const containerWidth = this.videoContainer.clientWidth;

    // Check if the device is in fullscreen mode
    const isInFullscreenMode =
      document.fullscreenElement ||
      document.mozFullScreenElement ||
      document.webkitFullscreenElement ||
      document.msFullscreenElement;

    // Calculate the percentage of the container height that the swipe distance represents
    const swipePercentage = (this.startY - currentY) / containerHeight;

    // Calculate the target volume based on the swipe distance, only if the touch is in the right 1/3 of the element and in fullscreen mode
    if (currentX > (9 / 10) * containerWidth && isInFullscreenMode) {
      let targetVolume = this.volumeStart + swipePercentage;

      // Ensure the target volume stays within the valid range of 0 to 1
      targetVolume = Math.max(0, Math.min(1, targetVolume));

      // Set the video element's volume to the target volume
      this.videoElement.volume = targetVolume;

      // Update the volume display
      this.showVolumeDisplay();
    }

    if (currentX < (9 / 10) * containerWidth && isInFullscreenMode) {
      // Calculate the target time based on the swipe distance
      const duration = this.videoElement.duration;
      const currentTime = this.videoElement.currentTime;
      swipePercentage = swipePercentage / 10;
      let targetTime = currentTime + swipePercentage * duration;

      // Ensure the target time stays within the valid range of 0 to duration
      targetTime = Math.max(0, Math.min(duration, targetTime));

      // Set the video element's current time to the target time
      this.videoElement.currentTime = targetTime;

      // Update the progress and scrubber position
      this.updateProgress();
      this.updateScrubberPosition();
    }

    // Adjust the volume level based on the touch position within the volume container
    if (
      currentX >= this.volumeContainer.offsetLeft &&
      currentX <=
        this.volumeContainer.offsetLeft + this.volumeContainer.offsetWidth
    ) {
      const offsetX = currentX - this.volumeContainer.offsetLeft;
      const volumePercentage = offsetX / this.volumeContainer.offsetWidth;
      this.jumpToVolume(volumePercentage);
    }
  }

  handleTouchEnd() {
    // Reset the startY and volumeStart values
    this.startY = null;
    this.volumeStart = null;
  }

  bindKeyboardShortcuts() {
    if (
      event.target.tagName === "INPUT" ||
      event.target.tagName === "TEXTAREA"
    ) {
      return; // Ignore keyboard shortcuts when typing in input or textarea fields
    }

    const keyboardMapper = new KeyboardMapper();

    if (!this.isInteracted) {
      return;
    }

    //keyboardMapper.setScope("modern-cinema-player");
    keyboardMapper.mapCombination("space", this.togglePlayback.bind(this));
    keyboardMapper.mapCombination("m", this.toggleMute.bind(this));
    keyboardMapper.mapCombination("mediastop", this.stopPlayback.bind(this));
    keyboardMapper.mapCombination("shiftright,]", this.nextTrack.bind(this));
    keyboardMapper.mapCombination(
      "ArrowRight, KeyL",
      this.skipForward.bind(this)
    );
    keyboardMapper.mapCombination(
      "ArrowLeft, KeyJ",
      this.skipBackward.bind(this)
    );
    keyboardMapper.mapCombination(".", this.nextFrame.bind(this));
    keyboardMapper.mapCombination(",", this.previousFrame.bind(this));
    keyboardMapper.mapCombination(">", this.increasePlaybackRate.bind(this));
    keyboardMapper.mapCombination("<", this.decreasePlaybackRate.bind(this));
    keyboardMapper.mapCombination("Home", this.seekToStart.bind(this));
    keyboardMapper.mapCombination("End", this.seekToEnd.bind(this));
    keyboardMapper.mapCombination("ArrowUp", this.increaseVolume.bind(this));
    keyboardMapper.mapCombination("ArrowDown", this.decreaseVolume.bind(this));

    keyboardMapper.mapCombination("arrowdown+shift", function () {
      console.log("hi");
    });

    keyboardMapper.mapCombination("metaleft", function () {
      console.log("Meta LEFT!!!!");
    });

    keyboardMapper.mapCombination("1, 2, 3, 4, 5, 6, 7, 8, 9", (event) => {
      const percentage = parseInt(event.key);
      this.seekToPercentage(percentage * 10);
    });
    keyboardMapper.mapCombination("0", this.seekToStart.bind(this));
    keyboardMapper.mapCombination("/", this.focusSearchBox.bind(this));
    keyboardMapper.mapCombination("f", this.toggleFullscreen.bind(this));
    keyboardMapper.mapCombination("c", this.toggleCaptions.bind(this));
    keyboardMapper.mapCombination(
      "shiftleft, MediaTrackPrevious, BracketLeft, KeyP, KeyB",
      this.previousTrack.bind(this)
    );
    keyboardMapper.mapCombination("KeyI", this.openMiniplayer.bind(this));
  }

  //Lets not use any keyboard shortcuts until the user has interacted with the player
  bindVideoInteraction() {
    const enableShortcuts = () => {
      this.isInteracted = true;
      document.removeEventListener("click", enableShortcuts);
      document.removeEventListener("keydown", enableShortcuts);
      this.bindKeyboardShortcuts();
    };

    this.videoContainer.addEventListener(
      "click",
      this.togglePlayback.bind(this)
    );
    this.videoContainer.addEventListener(
      "dblclick",
      this.handleDoubleClick.bind(this)
    );

    document.addEventListener("click", enableShortcuts);
    document.addEventListener("keydown", enableShortcuts);
  }

  showDoubleTapMessage(message, animatedGif) {
    // Remove existing popup if it exists
    const existingPopup = document.querySelector(".double-tap-popup");
    if (existingPopup) {
      existingPopup.remove();
    }

    const popupElement = document.createElement("div");
    popupElement.classList.add("double-tap-popup");

    const gifElement = document.createElement("img");
    gifElement.src = animatedGif;
    gifElement.style.maxWidth = "75px"; // Set the maximum width

    const messageElement = document.createElement("span");
    messageElement.textContent = message;

    const videoContainer = document.getElementById("videoContainer");
    videoContainer.appendChild(popupElement);

    if (message === "+10 seconds") {
      popupElement.appendChild(messageElement);
      popupElement.appendChild(gifElement);
    } else {
      popupElement.appendChild(gifElement);
      popupElement.appendChild(messageElement);
    }

    setTimeout(() => {
      popupElement.remove();
    }, 2000);
  }

  handleDoubleClick(event) {
    if (!document.fullscreenElement) {
      //Only in full screen mode.
      return false;
    }
    const containerWidth = this.videoContainer.clientWidth;
    const clickX =
      event.clientX - this.videoContainer.getBoundingClientRect().left;

    if (clickX > containerWidth / 2) {
      // Double tap on the right side: Fast forward 10 seconds
      this.videoElement.currentTime += 10;
      this.showDoubleTapMessage(
        "+10 seconds",
        "https://64.media.tumblr.com/1db87152e4d3d4cfac3032d3858d554e/tumblr_ngrlucj26E1rg0lgoo3_400.gif"
      );
    } else {
      // Double tap on the left side: Rewind 10 seconds
      this.videoElement.currentTime -= 10;
      this.showDoubleTapMessage(
        "-10 seconds",
        "https://img1.picmix.com/output/stamp/normal/5/7/8/1/1971875_dc0b5.gif"
      );
    }

    if (this.videoElement.paused) {
      this.playVideo();
    }

    this.showControls();
  }

  pauseVideo() {
    if (!this.videoElement.paused) {
      var pausePromise = this.videoElement.pause();

      if (pausePromise !== undefined) {
        pausePromise
          .then((_) => {
            // Automatic playback started!
            // Show playing UI.
          })
          .catch((error) => {
            // Auto-play was prevented
            // Show paused UI.
          });
      }
    }
  }

  playVideo() {
    if (this.videoElement.paused) {
      var playPromise = this.videoElement.play();

      if (playPromise !== undefined) {
        playPromise
          .then((_) => {
            // Automatic playback started!
            // Show playing UI.
          })
          .catch((error) => {
            // Auto-play was prevented
            // Show paused UI.
          });
      }
    }
  }

  togglePlayback() {
    console.log("togglePlayback");
    // Exclude the scrubber and volume from being affected
    const target = event.target;

    const isSkipButton =
      target === this.skipBackButton || target === this.skipForwardButton;

    if (isSkipButton) {
      return; // Skip toggle playback for skip buttons
    }

    if (
      target === this.scrubber ||
      target === this.volumeContainer ||
      target === this.volumeBar ||
      target === this.volumeLevel ||
      target === this.volumeContainer ||
      target === this.fullscreenButton
    ) {
      return;
    }
    this.blurPlaylist();
    if (document.activeElement === this.videoElement) {
      this.videoElement.blur(); // Unfocus from the video element
    }

    if (document.activeElement === this.playlistElement) {
      this.playlistElement.blur(); // Unfocus from the playlist
    }

    const currentTime = new Date().getTime();
    const toggleDelay = 500; // Adjust the delay as needed

    if (currentTime - this.lastToggleTime < toggleDelay) {
      return; // Ignore the toggle if it's within the delay
    }

    this.lastToggleTime = currentTime;

    if (this.videoElement.paused) {
      if (!document.fullscreenElement) {
        this.toggleFullscreen();
      }
      this.playVideo();
    } else {
      this.pauseVideo();
    }
  }

  toggleMute() {
    this.videoElement.muted = !this.videoElement.muted;

    // Update the volume display
    this.showVolumeDisplay();
  }

  stopPlayback() {
    this.pauseVideo();
    this.videoElement.currentTime = 0;
  }

  nextTrack() {
    this.currentTrackIndex =
      (this.currentTrackIndex + 1) % this.playlistItems.length;
    this.loadTrack(this.currentTrackIndex);
    this.playVideo();
  }

  skipForward() {
    this.videoElement.currentTime += 10; // Skip 5 seconds forward
    this.showDoubleTapMessage(
      "+10 seconds",
      "https://64.media.tumblr.com/1db87152e4d3d4cfac3032d3858d554e/tumblr_ngrlucj26E1rg0lgoo3_400.gif"
    );
    this.showControls();
  }

  skipBackward() {
    this.videoElement.currentTime -= 10; // Skip 5 seconds backward
    this.showDoubleTapMessage(
      "-10 seconds",
      "https://img1.picmix.com/output/stamp/normal/5/7/8/1/1971875_dc0b5.gif"
    );
    this.showControls();
  }

  nextFrame() {
    if (this.videoElement.paused) {
      this.videoElement.currentTime += 1 / this.videoElement.playbackRate;
    }
  }

  previousFrame() {
    if (this.videoElement.paused) {
      this.videoElement.currentTime -= 1 / this.videoElement.playbackRate;
    }
  }

  increasePlaybackRate() {
    this.videoElement.playbackRate += 0.25;
  }

  decreasePlaybackRate() {
    if (this.videoElement.playbackRate > 0.25) {
      this.videoElement.playbackRate -= 0.25;
    }
  }

  seekToStart() {
    this.videoElement.currentTime = 0;
  }

  seekToEnd() {
    this.videoElement.currentTime = this.videoElement.duration;
  }

  seekToPercentage(percentage) {
    const targetTime = (percentage / 100) * this.videoElement.duration;
    this.videoElement.currentTime = targetTime;
  }

  focusSearchBox() {
    // Implement your logic to focus on the search box
  }

  toggleCaptions() {
    // Implement your logic to toggle captions and subtitles
  }

  increaseVolume() {
    if (this.videoElement.muted) {
      this.videoElement.muted = false; // Unmute the video
    }

    if (this.videoElement.volume < 1.0) {
      this.videoElement.volume = Math.min(
        1.0,
        Math.ceil(this.videoElement.volume * 20) / 20 + 0.05
      );
    }

    this.showVolumeDisplay();
  }

  decreaseVolume() {
    if (this.videoElement.muted) {
      this.videoElement.muted = false; // Unmute the video
    }

    if (this.videoElement.volume > 0.0) {
      this.videoElement.volume = Math.max(
        0.0,
        Math.floor(this.videoElement.volume * 20) / 20 - 0.05
      );
    }

    this.showVolumeDisplay();
  }

  showVolumeDisplay() {
    const volumeDisplayClass = "volume-display";
    const existingVolumeDisplay = this.videoContainer.querySelector(
      `.${volumeDisplayClass}`
    );

    if (existingVolumeDisplay) {
      existingVolumeDisplay.remove();
    }

    const volumeDisplay = document.createElement("div");
    volumeDisplay.classList.add(volumeDisplayClass);
    volumeDisplay.innerHTML = this.isMuted()
      ? "<span style='font-size: 48px;'>&#128263;</span>"
      : `Volume: ${Math.round(this.videoElement.volume * 100)}%`;
    this.videoContainer.appendChild(volumeDisplay);

    volumeDisplay.style.position = "absolute";
    volumeDisplay.style.top = "50%";
    volumeDisplay.style.left = "50%";
    volumeDisplay.style.transform = "translate(-50%, -50%)";
    volumeDisplay.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
    volumeDisplay.style.color = "white";
    volumeDisplay.style.padding = "10px 15px";
    volumeDisplay.style.borderRadius = "5px";
    volumeDisplay.style.fontFamily = "Arial, sans-serif";
    volumeDisplay.style.fontSize = "16px";
    volumeDisplay.style.zIndex = "9999";

    setTimeout(() => {
      volumeDisplay.style.opacity = 0;
      setTimeout(() => {
        volumeDisplay.remove();
      }, 1000);
    }, 1000);

    this.volumerate = this.videoElement.volume;
    if (this.videoElement.muted) {
      this.volumerate = 0;
    }
    console.log(this.volumerate);

    this.volumeLevel.style.width = `${this.volumerate * 100}%`;
  }

  isMuted() {
    return this.videoElement.muted || this.videoElement.volume === 0;
  }

  previousTrack() {
    const previousIndex =
      (this.currentTrackIndex - 1 + this.playlistItems.length) %
      this.playlistItems.length;
    this.currentTrackIndex = previousIndex;
    this.loadTrack(previousIndex);
    this.playVideo();
  }

  openMiniplayer() {
    // Implement your logic to open the Miniplayer
  }

  unbindKeyboardShortcuts() {
    document.removeEventListener("keydown", this.keyboardShortcutsHandler);
  }

  addEventListeners() {
    // Event listener for playlist item click
    this.playlistItems.forEach((item, index) => {
      item.addEventListener("click", () => {
        this.currentTrackIndex = index;
        this.loadTrack(index);
        this.playVideo();
      });
    });
    this.volumeContainer.addEventListener(
      "click",
      this.handleVolumeClick.bind(this)
    );

    this.videoElement.addEventListener(
      "play",
      this.updatePlayButton.bind(this)
    );
    this.videoElement.addEventListener(
      "pause",
      this.updatePlayButton.bind(this)
    );
    this.scrubber.addEventListener("mousedown", this.startSeek.bind(this));
    document.addEventListener("mousemove", this.updateSeek.bind(this));
    document.addEventListener("mouseup", this.stopSeek.bind(this));
    this.scrubber.addEventListener("click", this.jumpToPosition.bind(this));
    this.progress.addEventListener("click", this.jumpToPosition.bind(this));
    this.fullscreenButton.addEventListener(
      "click",
      this.toggleFullscreen.bind(this)
    );
    document.addEventListener(
      "fullscreenchange",
      this.fullscreenChange.bind(this)
    );
    this.videoContainer.addEventListener(
      "mousemove",
      this.showControls.bind(this)
    );
    document.addEventListener("mouseup", this.stopVolumeChange.bind(this));
  }

  togglePlay() {
    this.blurPlaylist();
    this.showControls();
    if (this.videoElement.paused) {
      this.playVideo();
    } else {
      this.pauseVideo();
    }
  }

  updatePlayButton() {
    this.playButton.innerHTML = this.videoElement.paused
      ? '<i class="fas fa-play" aria-hidden="true"></i>'
      : '<i class="fas fa-pause" aria-hidden="true"></i>';

    if (!this.playPauseButton) {
      return; // Exit the method if playPauseButton is not present
    }

    this.playPauseButton.innerHTML = this.videoElement.paused
      ? '<i class="fas fa-play" aria-hidden="true"></i>'
      : '<i class="fas fa-pause" aria-hidden="true"></i>';
  }

  startSeek() {
    this.pauseVideo();
    this.isSeeking = true;
  }

  stopSeek() {
    if (this.isSeeking) {
      this.playVideo();
      this.isSeeking = false;
    }
  }

  updateSeek(event) {
    if (this.isSeeking) {
      const rect = this.scrubber.getBoundingClientRect();
      const seekPercentage = (event.clientX - rect.left) / rect.width;
      const seekTime = seekPercentage * this.videoElement.duration;
      this.videoElement.currentTime = seekTime;
      this.progress.style.width = `${seekPercentage * 100}%`;
    }
  }

  updateProgress() {
    const progress =
      (this.videoElement.currentTime / this.videoElement.duration) * 100;
    this.progress.style.width = `${progress}%`;
  }

  blurPlaylist() {
    if (document.activeElement === this.playlistElement) {
      this.playlistElement.blur();
    }
  }

  jumpToPosition(event) {
    const rect = this.scrubber.getBoundingClientRect();
    const seekPercentage = (event.clientX - rect.left) / rect.width;
    const seekTime = seekPercentage * this.videoElement.duration;
    this.videoElement.currentTime = seekTime;
    this.progress.style.width = `${seekPercentage * 100}%`;
    this.showControls();
  }

  initializeVolume() {
    const volume = this.videoElement.volume;
    this.volumeLevel.style.width = `${volume * 100}%`;
  }

  startVolumeChange(event) {
    event.stopPropagation();
    this.isVolumeChanging = true;
    document.addEventListener("mousemove", this.updateVolume.bind(this));
  }

  stopVolumeChange() {
    if (this.isVolumeChanging) {
      this.isVolumeChanging = false;
      document.removeEventListener("mousemove", this.updateVolume.bind(this));
    }
  }

  handleVolumeClick(event) {
    const rect = this.volumeBar.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const containerWidth = rect.width;
    const volumePercentage = clickX / containerWidth;

    this.jumpToVolume(volumePercentage);
  }

  jumpToVolume(volumePercentage) {
    const maxVolume = 1.0;
    const targetVolume = volumePercentage * maxVolume;
    this.videoElement.volume = targetVolume;
    this.showVolumeDisplay();

    // Update the volume level indicator
    this.volumeLevel.style.width = `${volumePercentage * 100}%`;
  }

  updateVolume(event) {
    if (this.isVolumeChanging) {
      const rect = this.volumeBar.getBoundingClientRect();
      const volumePercentage = (event.clientX - rect.left) / rect.width;
      const volume = Math.max(0, Math.min(1, volumePercentage));
      this.videoElement.volume = volume;
      this.volumeLevel.style.width = `${volumePercentage * 100}%`;
    }
    this.showVolumeDisplay();
  }

  fullscreenChange() {
    if (!document.fullscreenElement) {
      this.videoElement.style.width = "100%";
      this.videoElement.style.height = "100%";
    } else {
      this.videoElement.style.width = "100vw";
      this.videoElement.style.height = "100vh";
    }
  }

  toggleFullscreen() {
    try {
      if (!document.fullscreenElement) {
        if (this.videoContainer.requestFullscreen) {
          this.videoContainer.requestFullscreen().catch((err) => {});
        } else if (this.videoContainer.mozRequestFullScreen) {
          this.videoContainer.mozRequestFullScreen();
        } else if (this.videoContainer.webkitRequestFullscreen) {
          this.videoContainer.webkitRequestFullscreen();
        } else if (this.videoContainer.msRequestFullscreen) {
          this.videoContainer.msRequestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if (document.mozCancelFullScreen) {
          document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
          document.msExitFullscreen();
        }
      }
    } catch (error) {
      // Handle the error here
      console.error("An error occurred while toggling fullscreen:", error);
    }
  }

  showControls() {
    if (!this.controlsVisible) {
      this.videoElementOverlay.style.cursor = "default";
      this.controlsVisible = true;
      this.videoElementOverlay.style.opacity = 1;

      // Remove the existing controls container if it exists
      const controlsContainer = document.querySelector(".controls-container");
      if (controlsContainer) {
        controlsContainer.remove();
      }

      // Create the controls container
      const controlsContainerElement = document.createElement("div");
      controlsContainerElement.classList.add("controls-container");
      controlsContainerElement.style.position = "absolute";
      controlsContainerElement.style.top = "50%";
      controlsContainerElement.style.left = "50%";
      controlsContainerElement.style.transform = "translate(-50%, -50%)";
      controlsContainerElement.style.display = "flex";
      controlsContainerElement.style.alignItems = "center";
      controlsContainerElement.style.justifyContent = "center";
      controlsContainerElement.style.zIndex = "999";

      // Create the skip back button
      const skipBackButton = document.createElement("button");
      skipBackButton.classList.add("control-button");
      skipBackButton.innerHTML = '<i class="fas fa-backward"></i>';
      skipBackButton.style.cssText = `
        font-size: 75px;
        padding: 8px;
        margin: 4px;
        color: white;
        background-color: transparent;
        text-shadow: 0 0 3px #000;
        border: none;
      `;

      // Create the play/pause button
      this.playPauseButton = document.createElement("button");
      this.playPauseButton.classList.add("control-button");
      this.playPauseButton.innerHTML = '<i class="fas fa-play"></i>';
      this.playPauseButton.style.cssText = `
          font-size: 75px;
          padding: 8px;
          margin: 4px;
          color: white;
          background-color: transparent;
          text-shadow: 0 0 3px #000;
          border: none;
      `;

      // Create the skip forward button
      const skipForwardButton = document.createElement("button");
      skipForwardButton.classList.add("control-button");
      skipForwardButton.innerHTML = '<i class="fas fa-forward"></i>';
      skipForwardButton.style.cssText = `
      font-size: 75px;
      padding: 8px;
      margin: 4px;
      color: white;
      background-color: transparent;
      text-shadow: 0 0 3px #000;
      border: none;
      `;

      // Add event listeners to the buttons
      skipBackButton.addEventListener("click", this.previousTrack.bind(this));
      this.playPauseButton.addEventListener(
        "click",
        this.togglePlayback.bind(this)
      );
      skipForwardButton.addEventListener("click", this.nextTrack.bind(this));

      // Append the buttons to the controls container
      controlsContainerElement.appendChild(skipBackButton);
      controlsContainerElement.appendChild(this.playPauseButton);
      controlsContainerElement.appendChild(skipForwardButton);

      // Append the controls container to the video container
      this.videoContainer.appendChild(controlsContainerElement);
    }

    this.updatePlayButton();
    this.startControlsTimeout();
  }

  hideControls() {
    if (this.controlsVisible) {
      this.videoElementOverlay.style.cursor = "none";
      this.controlsVisible = false;
      this.videoElementOverlay.style.opacity = 0;

      // Remove the controls container if it exists
      const controlsContainer = document.querySelector(".controls-container");
      if (controlsContainer) {
        controlsContainer.remove();
      }
    }
  }

  startControlsTimeout() {
    clearTimeout(this.hideControlsTimeout);
    this.hideControlsTimeout = setTimeout(
      this.hideControls.bind(this),
      3000 // Adjust the time (in milliseconds) after which controls should disappear
    );
  }
}
