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
        this.readyState = 0; // 0: UNSENT, 1: OPENED, 2: HEADERS_RECEIVED, 3: LOADING, 4: DONE
        this.status = null;
        this.statusText = '';
        this.response = null;
        this.onload = null;
        this.onerror = null;
        this.data = {};
        this.retryCount = 0;
        this.maxRetries = 3;
    }

    open(method, url, serverType = "AuthServer") {
        this.readyState = 1;
        this.data = { method, url, serverType };
    }

    send(object = "") {
        console.log("Sending request...");
        this.readyState = 2;

        let network = new Network();
        const data = this.data;

        const trySending = () => {
            network.sendToServer(JSON.stringify({ data, object }), (response) => {
                if (!response) {
                    console.warn(`Request failed, retrying... (${this.retryCount + 1}/${this.maxRetries})`);
                    
                    if (this.retryCount < this.maxRetries) {
                        this.retryCount++;
                        setTimeout(trySending, 1000);
                    } else {
                        this.readyState = 4;
                        this.status = 503;
                        this.statusText = 'Service Unavailable';
                        if (this.onerror) {
                            this.onerror({ status: this.status, statusText: this.statusText });
                        }
                    }
                } else {
                    this.readyState = 4;
                    this.status = response.status;
                    this.statusText = response.statusText;
                    this.response = response.data;
                    this.retryCount = 0;
                    
                    if (this.status >= 200 && this.status < 300) { //when successfuly
                        if (this.onload) {
                            this.onload(this.response);
                        }
                    } else if (this.onerror) {
                        this.onerror(response);
                    }
                }
            });
        };

        trySending();
    }
}