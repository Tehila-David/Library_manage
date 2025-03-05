/**
 * FXMLHttpRequest - A custom implementation of XMLHttpRequest for simulating AJAX functionality
 * This class handles HTTP requests to fake servers with retry logic and proper state management
 */
class FXMLHttpRequest {
    /**
     * Constructor - Initializes a new FXMLHttpRequest instance with default values
     */
    constructor() {
        this.readyState = 0;       // Initial ready state (0: unsent)
        this.status = null;        // HTTP status code
        this.statusText = '';      // HTTP status text
        this.response = null;      // Response data
        this.onload = null;        // Success callback function
        this.onerror = null;       // Error callback function
        this.data = {};            // Request data storage
        this.retryCount = 0;       // Current retry attempt count
        this.maxRetries = 3;       // Maximum number of retry attempts
    }

    /**
     * Opens a connection to the server
     * @param {string} method - The HTTP method (GET, POST, PUT, DELETE)
     * @param {string} url - The URL to send the request to
     * @param {string} serverType - The type of server to use (AuthServer or BooksServer)
     */
    open(method, url, serverType = "AuthServer") {
        this.readyState = 1;       // Update ready state (1: opened)

        // Parse the URL to extract potential ID
        const urlParts = url.split('/').filter(part => part);
        const id = urlParts[urlParts.length - 1];

        // Store request parameters
        this.data = {
            method,
            url,
            serverType,
            id: !isNaN(id) ? id : null // Store ID if it exists and is a number
        };
    }

    /**
     * Sends the request to the server with the provided data
     * Includes retry logic for failed requests
     * @param {any} object - The data to send with the request
     */
    send(object = "") {
        console.log("Sending request...");
        this.readyState = 2;       // Update ready state (2: headers received)

        let network = new Network();
        const data = this.data;

        /**
         * Recursive function to attempt sending the request
         * Will retry up to maxRetries times if request fails
         */
        const trySending = () => {
            network.sendToServer(JSON.stringify({ data, object }), (response) => {
                // If response is null, the request failed (likely due to simulated network issues)
                if (!response) {
                    console.warn(`Request failed, retrying... (${this.retryCount + 1}/${this.maxRetries})`);

                    // Retry if we haven't exceeded maximum retries
                    if (this.retryCount < this.maxRetries) {
                        this.retryCount++;
                        setTimeout(trySending, 1000); // Wait 1 second before retrying
                    } else {
                        // Max retries exceeded, report error
                        this.readyState = 4;          // Update ready state (4: done)
                        this.status = 503;            // 503: Service Unavailable
                        this.statusText = 'Service Unavailable';
                        if (this.onerror) {
                            this.onerror({ status: this.status, statusText: this.statusText });
                        }
                    }
                } else {
                    // Request succeeded (even if with error status)
                    this.readyState = 4;              // Update ready state (4: done)
                    this.status = response.status;
                    this.statusText = response.statusText;
                    this.response = response.data;
                    this.retryCount = 0;              // Reset retry count

                    // Call appropriate callback based on status code
                    if (this.status >= 200 && this.status < 300) {
                        // Success (2xx status code)
                        if (this.onload) {
                            this.onload(this.response);
                        }
                    } else if (this.onerror) {
                        // Error (non-2xx status code)
                        this.onerror(response);
                    }
                }
            });
        };

        // Start the sending process
        trySending();
    }
}