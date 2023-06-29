class Seed {
  constructor() {
    this.cache = {}; // Cache to store loaded files
    this.promises = []; // Array to store promises
  }

  init() {
    console.log("lets start the website");
  }

  // Method to load multiple files
  loadFiles(...urls) {
    urls.forEach((url) => {
      const promise = this.loadFile(url);
      this.promises.push(promise);
    });

    return this;
  }

  //Method to load the routes from this.routes and then load the appropriate files to render the page
  loadRoute(route) {
    //Then and Catch support for this method return promise
    // Create a promise to handle file loading
    const promise = new Promise((resolve, reject) => {
      console.log(route);
      if (!route.model) {
        reject(
          new Error(
            `Failed to load JSON file ${route.model}. Status: ${request.status}`
          )
        );
      } else {
        reject(
          new Error(
            `Failed to load Model ${route.model}. Status: ${request.status}`
          )
        );
      }
    });

    this.promises.push(promise);
    return promise;
  }

  // Method to load one file
  loadFile(url, method = "GET", headers = {}, data = null) {
    // Check if file is already loaded
    if (this.cache[url]) {
      console.log(`File ${url} is already loaded.`);
      return Promise.resolve(null);
    }

    // Determine file type based on extension
    const fileType = this.getFileType(url);

    // Create a promise to handle file loading
    const promise = new Promise((resolve, reject) => {
      // Create appropriate element for the file type
      let element;
      switch (fileType) {
        case "js":
          element = document.createElement("script");
          element.src = url;
          element.onload = () => resolve(null);
          element.onerror = () =>
            reject(new Error(`Failed to load file ${url}.`));
          break;
        case "css":
          element = document.createElement("link");
          element.rel = "stylesheet";
          element.href = url;
          element.onload = () => resolve(null);
          element.onerror = () =>
            reject(new Error(`Failed to load file ${url}.`));
          break;
        case "json":
          // Send an HTTP request to load the JSON file
          const request = new XMLHttpRequest();
          request.open(method, url, true);
          for (const [header, value] of Object.entries(headers)) {
            request.setRequestHeader(header, value);
          }
          request.onreadystatechange = () => {
            if (request.readyState === 4) {
              if (request.status === 200) {
                // Check if the response is JSON
                const contentType = request.getResponseHeader("Content-Type");
                const isJsonResponse =
                  contentType && contentType.includes("application/json");

                // Handle JSON response
                if (isJsonResponse) {
                  const response = JSON.parse(request.responseText);
                  resolve(response);
                } else {
                  // Handle non-JSON response (may need encoding)
                  const response = JSON.parse(request.responseText);
                  resolve(response);
                }
              } else {
                reject(
                  new Error(
                    `Failed to load JSON file ${url}. Status: ${request.status}`
                  )
                );
              }
            }
          };
          if (method === "POST") {
            request.setRequestHeader("Content-Type", "application/json");
            request.send(JSON.stringify(data));
          } else {
            request.send();
          }
          break;
        case "video":
          element = document.createElement("video");
          element.src = url;
          element.controls = true;
          element.onload = () => resolve(null);
          element.onerror = () =>
            reject(new Error(`Failed to load file ${url}.`));
          break;
        case "audio":
          element = document.createElement("audio");
          element.src = url;
          element.controls = true;
          element.onload = () => resolve(null);
          element.onerror = () =>
            reject(new Error(`Failed to load file ${url}.`));
          break;
        case "pdf":
          element = document.createElement("iframe");
          element.src = url;
          element.onload = () => resolve(null);
          element.onerror = () =>
            reject(new Error(`Failed to load file ${url}.`));
          break;
        case "image":
          const image = new Image();
          image.src = url;
          image.onload = () => resolve(null);
          image.onerror = () =>
            reject(new Error(`Failed to load file ${url}.`));
          break;
        case "tpl":
        case "html":
        case "body":
        case "md":
          // Send an HTTP request to load the text-based file
          const textRequest = new XMLHttpRequest();
          textRequest.open("GET", url, true);
          textRequest.onreadystatechange = () => {
            if (textRequest.readyState === 4) {
              if (textRequest.status === 200) {
                // Handle the response as text content
                const response = textRequest.responseText;
                resolve(response);
              } else {
                reject(
                  new Error(
                    `Failed to load text-based file ${url}. Status: ${textRequest.status}`
                  )
                );
              }
            }
          };
          textRequest.send();
          break;
        default:
          reject(new Error(`Unsupported file type for ${url}`));
          return;
      }

      // Add element to the document body and cache the file
      if (element) {
        document.body.appendChild(element);
        this.cache[url] = true;
        console.log(`Loaded ${fileType.toUpperCase()} file: ${url}`);
      }
    });

    this.promises.push(promise);
    return promise;
  }

  // Method to determine the file type based on the extension
  getFileType(url) {
    const extension = url.split(".").pop();
    switch (extension) {
      case "js":
        return "js";
      case "css":
        return "css";
      case "json":
        return "json";
      case "mp4":
      case "webm":
      case "ogg":
        return "video";
      case "mp3":
      case "wav":
        return "audio";
      case "pdf":
        return "pdf";
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
        return "image";
      case "tpl":
      case "html":
      case "body":
      case "md":
        return extension;
      default:
        return "unknown";
    }
  }

  // Method to load files with HTTP POST
  postFile(url, data) {
    const promise = this.loadFile(url, "POST", {}, data);
    this.promises.push(promise);
    return this;
  }

  // Method to load files with HTTP PUT
  putFile(url, data) {
    const promise = this.loadFile(url, "PUT", {}, data);
    this.promises.push(promise);
    return this;
  }

  // Method to send an HTTP request
  sendRequest(method, url, data) {
    const promise = new Promise((resolve, reject) => {
      const request = new XMLHttpRequest();
      request.open(method, url, true);
      request.setRequestHeader("Content-Type", "application/json");
      request.onreadystatechange = () => {
        if (request.readyState === 4) {
          if (request.status === 200 || request.status === 201) {
            const response = JSON.parse(request.responseText);
            resolve(response);
          } else {
            reject(
              new Error(
                `Failed to send ${method} request to ${url}. Status: ${request.status}`
              )
            );
          }
        }
      };
      request.send(JSON.stringify(data));
    });

    this.promises.push(promise);
    return this;
  }

  //We want the abilityt to turn these off.
  log(logdata) {
    console.log(logdata);
  }

  // Method to clear the cache for a specific file
  clearCache(url) {
    delete this.cache[url];
    console.log(`Cache cleared for file: ${url}`);
    return this;
  }

  // Method to handle the completion of all promises
  then(callback) {
    Promise.all(this.promises)
      .then(() => {
        callback();
      })
      .catch((error) => {
        console.error("Could Not Initialize", error);
      });

    return this; // Return the Seed instance for chaining
  }

  // Method to handle errors during promise execution
  catch(callback) {
    const errors = [];
    const promises = this.promises.map((promise) =>
      promise.catch((error) => {
        if (!errors.includes(error)) {
          errors.push(error);
        }
      })
    );

    Promise.all(promises).then(() => {
      if (errors.length > 0) {
        callback(errors);
      }
    });

    return this; // Return the Seed instance for chaining
  }
}

// Initialize Seed
const $s = new Seed();

//TODO Site Based Init and Sub-Site Based Init
$s.loadFiles("./js/init.js")
  .then(() => {
    console.log("Starting Up The Website");
  })
  .catch((error) => {
    console.error("Error loading files:", error);
  });
