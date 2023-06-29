class MobileLandscapeDetector {
  constructor() {
    this.isMobile = this.checkIfMobile();
    this.isLandscape = this.checkIfLandscape();
    this.onLandscapeEvent = new Event("landscape");
    this.onNotLandscapeEvent = new Event("notlandscape");
    window.addEventListener(
      "orientationchange",
      this.handleOrientationChange.bind(this)
    );
  }

  checkIfMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
  }

  checkIfLandscape() {
    return window.matchMedia("(orientation: landscape)").matches;
  }

  handleOrientationChange() {
    const newIsLandscape = this.checkIfLandscape();
    if (newIsLandscape) {
      document.dispatchEvent(this.onNotLandscapeEvent);
    } else {
      document.dispatchEvent(this.onLandscapeEvent);
    }
    this.isLandscape = newIsLandscape;
  }
}
