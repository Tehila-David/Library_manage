// Network class to handle requests to different servers (AuthServer or BooksServer)
class Network {
    // Create instances of the servers
    serverAuth = new AuthServer();  // Instance of AuthServer
    serverBooks = new BooksServer(); // Instance of BooksServer
    dropRate = 0.3; // drop rate between 10% and 50%

    sendToServer(request, func = () => { }) {
        console.log("Received request:", request);

        // Check if the message should be dropped based on the drop rate probability
        if (Math.random() < this.dropRate) {
            console.warn("Message dropped:", request);
            return;
        }

        // Random delay between 1 to 3 seconds before sending the request
        const delay = Math.random() * 2000 + 1000;
        setTimeout(() => {
            try {
                const requestObj = JSON.parse(request); // Parse the request JSON
                const serverType = requestObj.data.serverType; // Extract server type

                // Route the request to the appropriate server based on serverType
                if (serverType === 'AuthServer') {
                    this.serverAuth.requestHandler(request, func);
                } else if (serverType === 'BooksServer') {
                    this.serverBooks.requestHandler(request, func);
                } else {
                    console.error("Unknown server type:", serverType);
                }
            } catch (error) {
                console.error("Invalid request format:", error);
            }
        }, delay);
    }
}

