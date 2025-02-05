class Network {
    static instance = null;

    static getInstance() {
        if (!Network.instance) {
            Network.instance = new Network();
        }
        return Network.instance;
    }

    constructor() {
        this.dropRate = 0.1; // 10% packet loss
        this.minDelay = 1000; // 1 second
        this.maxDelay = 3000; // 3 seconds
    }

    sendRequest(request) {
        if (Math.random() < this.dropRate) {
            console.log('Network: Packet dropped');
            return;
        }

        const delay = Math.random() * (this.maxDelay - this.minDelay) + this.minDelay;
        
        setTimeout(() => {
            this.routeRequest(request);
        }, delay);
    }
    routeRequest(request) {
        if (request.url.includes('/auth')) {
            authServer.handleRequest(request);
        } else if (request.url.includes('/books')) {
            booksServer.handleRequest(request);
        }
    }
}
