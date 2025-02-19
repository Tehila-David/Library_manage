
// Network class to handle requests to different servers (AuthServer or BooksServer)
class Network {
    // Create instances of the servers
    serverAuth = new AuthServer();  // Instance of AuthServer
    serverBooks = new BooksServer(); // Instance of BooksServer

    /**
     * Sends data to the appropriate server based on the serverType
     * @param {Object} data - Contains information like method, url, serverType, etc.
     * @param {Function} func - Callback function to be executed once the request is complete
     */
    sendToServer(request, func = () => { }) {
        console.log(request);
        const requestObj=JSON.parse(request);
        const serverType = requestObj.data.serverType;
        console.log(serverType);
        // Check which server to send the request to based on serverType
        if (serverType === 'AuthServer') {
            return this.serverAuth.requestHandler(request, func);
        } 
        else if (serverType === "BooksServer") {
            return this.serverBooks.requestHandler(request, func);
        } 
        else {
            console.error("Unknown server type");
        }
    }

}


