// class FXMLHttpRequest {
//     constructor() {
//         this.status = 0;
//         this.response = null;
//         this.responseType = 'json';
//         this.onload = null;
//         this.onerror = null;
//     }

//     open(method, url) {
//         this.method = method;
//         this.url = url;
//     }

//     setRequestHeader() {}

//     async send(data = null) {
//         try {
//             const networkMessage = { 
//                 method: this.method, 
//                 url: this.url, 
//                 data: data 
//             };

//             const sentMessage = await Network.send(networkMessage);
            
//             if (!sentMessage) {
//                 throw new Error('Network error');
//             }

//             const response = await this.processRequest(sentMessage);
            
//             this.status = 200;
//             this.response = response;
//             this.onload && this.onload();
//         } catch (error) {
//             this.status = 500;
//             this.onerror && this.onerror(error);
//         }
//     }

//     async processRequest(message) {
//         switch(message.method) {
//             case 'GET':
//                 return this.handleGet(message);
//             case 'POST':
//                 return this.handlePost(message);
//             case 'PUT':
//                 return this.handlePut(message);
//             case 'DELETE':
//                 return this.handleDelete(message);
//         }
//     }

//     handleGet(message) {
//         // Implement GET logic based on URL
//     }

//     handlePost(message) {
//         // Implement POST logic
//     }

//     handlePut(message) {
//         // Implement PUT logic
//     }

//     handleDelete(message) {
//         // Implement DELETE logic
//     }
// }

class FXMLHttpRequest {
    constructor() {
        this.readyState = 0;      // Initial state (0 means the request has not been sent yet)
        this.status = null;       // Status of the request (null initially)
        this.response = null;     // Response content (null initially)
        this.onload = null;       // Callback function to be triggered when the request succeeds
        this.data = {};           // Holds request data like method, URL, and server type
    }

    /**
     * Initializes the request with method, URL, and optional server type
     * @param {string} method - The HTTP method (GET, POST, etc.)
     * @param {string} url - The URL for the request
     * @param {string} serverType - The type of the server (default is 'AuthServer')
     */
    open(method, url, serverType = "AuthServer") {
        this.data = { method, url, serverType };
    }

    /**
     * Sends the request with optional data
     * @param {string} object - Data to be sent with the request (optional)
     */
    send(object = "") {
        let network = new Network();
        const data = this.data;
        network.sendToServer(JSON.stringify({ data, object }), this.onload); // Send request to server
    }

    abort() {
        // Logic to abort the request (to be implemented)
    }

    setRequestHeader(header, value) {
        // Logic to set request headers (to be implemented)
    }
}