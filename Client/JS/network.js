/**
 * Network - Simulates network behavior with artificial delays and message drops
 * Handles routing requests to the appropriate server (AuthServer or BooksServer)
 */
class Network {
    /**
     * Class properties
     * serverAuth - Instance of AuthServer for handling authentication requests
     * serverBooks - Instance of BooksServer for handling book-related requests
     * dropRate - Probability (0-1) that a message will be dropped (simulating network issues)
     */
    serverAuth = new AuthServer();
    serverBooks = new BooksServer();
    dropRate = 0.3;  // 30% chance of message being dropped

    /**
     * Sends a request to the appropriate server with simulated network conditions
     * @param {string} request - JSON string containing the request data
     * @param {Function} callback - Function to call with the response
     */
    sendToServer(request, callback) {
        console.log("Processing request:", request);

        // Simulate random network drops based on dropRate
        if (Math.random() < this.dropRate) {
            console.warn("Message dropped");
            callback(null); // Return null to indicate a dropped message
            return;
        }

        // Simulate network delay between 1-3 seconds
        const delay = Math.random() * 2000 + 1000;

        setTimeout(() => {
            try {
                // Parse the request JSON
                const requestObj = JSON.parse(request);
                const serverType = requestObj.data.serverType;

                // Route the request to the appropriate server
                if (serverType === 'AuthServer') {
                    this.serverAuth.requestHandler(request, callback);
                } else if (serverType === 'BooksServer') {
                    this.serverBooks.requestHandler(request, callback);
                } else {
                    // Handle unknown server type
                    callback({
                        status: 400,
                        statusText: 'Bad Request',
                        data: null,
                        error: `Unknown server type: ${serverType}`
                    });
                }
            } catch (error) {
                // Handle JSON parsing errors or other exceptions
                callback({
                    status: 400,
                    statusText: 'Bad Request',
                    data: null,
                    error: 'Invalid request format'
                });
            }
        }, delay);
    }
}

