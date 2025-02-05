

// export class FAJAX {
//     constructor() {
//         this.network = Network.getInstance();
//     }

//     send(config) {
//         return new Promise((resolve, reject) => {
//             const requestId = Date.now().toString();
//             const request = {
//                 id: requestId,
//                 ...config,
//                 callback: (response) => {
//                     if (response.status >= 200 && response.status < 300) {
//                         resolve(response);
//                     } else {
//                         reject(new Error(response.message));
//                     }
//                 }
//             };

//             this.network.sendRequest(request);
//         });
//     }
// }

class FXMLHttpRequest {
    constructor() {
        this.status = 0;
        this.response = null;
        this.responseType = 'json';
        this.onload = null;
        this.onerror = null;
    }

    open(method, url) {
        this.method = method;
        this.url = url;
    }

    setRequestHeader() {}

    async send(data = null) {
        try {
            const networkMessage = { 
                method: this.method, 
                url: this.url, 
                data: data 
            };

            const sentMessage = await Network.send(networkMessage);
            
            if (!sentMessage) {
                throw new Error('Network error');
            }

            const response = await this.processRequest(sentMessage);
            
            this.status = 200;
            this.response = response;
            this.onload && this.onload();
        } catch (error) {
            this.status = 500;
            this.onerror && this.onerror(error);
        }
    }

    async processRequest(message) {
        switch(message.method) {
            case 'GET':
                return this.handleGet(message);
            case 'POST':
                return this.handlePost(message);
            case 'PUT':
                return this.handlePut(message);
            case 'DELETE':
                return this.handleDelete(message);
        }
    }

    handleGet(message) {
        // Implement GET logic based on URL
    }

    handlePost(message) {
        // Implement POST logic
    }

    handlePut(message) {
        // Implement PUT logic
    }

    handleDelete(message) {
        // Implement DELETE logic
    }
}