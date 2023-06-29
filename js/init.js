$s.loadFiles("./css/style.css")
  .then(() => {
    $s.log("CSS files loaded successfully.");
  })
  .loadFiles("./js/keymap.js")
  .loadFiles(
    "https://64.media.tumblr.com/1db87152e4d3d4cfac3032d3858d554e/tumblr_ngrlucj26E1rg0lgoo3_400.gif",
    "https://img1.picmix.com/output/stamp/normal/5/7/8/1/1971875_dc0b5.gif"
  )
  .loadFiles("./js/MobileLandscapeDetector.js")
  .loadFiles("./js/ModernCinemaPlayer.js")
  .then(() => {
    const videoElement = document.getElementById("videoPlayer");
    const CustomVideoPlayerController = new ModernCinemaPlayer(
      videoElement,
      mediaJSON
    );
    $s.log("All files loaded successfully.");
    $s.init();
  })
  .catch((error) => {
    console.error("Error loading files:", error);
  });
