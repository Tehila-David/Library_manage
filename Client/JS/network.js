// Enhanced Network class with improved error handling
class Network {
    serverAuth = new AuthServer();
    serverBooks = new BooksServer();
    dropRate = 0.3;

    sendToServer(request, callback) {
        console.log("Processing request:", request);

        if (Math.random() < this.dropRate) {
            console.warn("Message dropped");
            callback(null); //in order we will know that was dropping
            return;
        }

        const delay = Math.random() * 2000 + 1000;
        setTimeout(() => {
            try {
                const requestObj = JSON.parse(request);
                const serverType = requestObj.data.serverType;

                if (serverType === 'AuthServer') {
                    this.serverAuth.requestHandler(request, callback);
                } else if (serverType === 'BooksServer') {
                    this.serverBooks.requestHandler(request, callback);
                } else {
                    callback({
                        status: 400,
                        statusText: 'Bad Request',
                        data: null,
                        error: `Unknown server type: ${serverType}`
                    });
                }
            } catch (error) {
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