import { InitConnectData } from "~/types/user_journal";
export class WebSocketClient {
    private static instance: WebSocketClient;
    public socket: WebSocket;
    private url: string;

    private constructor(url: string, initMetadata: InitConnectData) {
        this.url = url;
        this.socket = new WebSocket(this.url);
        this.initialize(initMetadata);
    }

    private sendInitialdata(initMetadata: InitConnectData): void {
        this.socket.send(JSON.stringify(initMetadata))
    }

    private initialize(initMetadata: InitConnectData): void {
        const sendInitData =  () => this.sendInitialdata(initMetadata)
        this.socket.onopen = function () {
            console.log("Connected to WebSocket server");
            sendInitData()
        };

        this.socket.onmessage = function (event) {
            console.log(event.data)
        };

        this.socket.onclose = function (event) {
            console.log("WebSocket connection closed, retrying... " + event.reason);
        };

        this.socket.onerror = function (error) {
            console.error("WebSocket error:", error);
        };
    }

    public static getInstance(url: string, initMetadata: InitConnectData): WebSocketClient {
        if (!WebSocketClient.instance) {
            console.log("Initializing WebSocket client");
            WebSocketClient.instance = new WebSocketClient(url, initMetadata);
        }
        return WebSocketClient.instance;
    }

    public send(data: string): void {
        if (this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(data);
        } else {
            console.warn('WebSocket is not open. Ready state:', this.socket.readyState);
        }
    }

    public close(): void {
        this.socket.close();
    }
}
