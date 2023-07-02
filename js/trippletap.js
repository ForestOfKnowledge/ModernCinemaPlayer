class TripleTap {
  constructor(element, callback, threshold = 300) {
    this.element = element;
    this.callback = callback;
    this.threshold = threshold;
    this.tapCount = 0;
    this.lastTapTime = 0;
    this.timeout = null;
    this.element.addEventListener("click", this.handleClick.bind(this));
  }

  handleClick(event) {
    const currentTime = new Date().getTime();

    if (
      this.tapCount === 0 ||
      currentTime - this.lastTapTime <= this.threshold
    ) {
      this.tapCount++;
    } else {
      this.tapCount = 1;
    }

    if (this.tapCount === 3) {
      clearTimeout(this.timeout);
      this.callback();
      this.tapCount = 0;
    } else {
      this.timeout = setTimeout(() => {
        this.tapCount = 0;
      }, this.threshold);
    }

    this.lastTapTime = currentTime;
  }
}
