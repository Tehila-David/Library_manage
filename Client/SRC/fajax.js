export class FAJAX {
    constructor() {
        this.network = Network.getInstance();
    }

    send(config) {
        return new Promise((resolve, reject) => {
            const requestId = Date.now().toString();
            const request = {
                id: requestId,
                ...config,
                callback: (response) => {
                    if (response.status >= 200 && response.status < 300) {
                        resolve(response);
                    } else {
                        reject(new Error(response.message));
                    }
                }
            };

            this.network.sendRequest(request);
        });
    }
}