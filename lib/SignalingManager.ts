import { DepthResponse } from "./types";

type Callback = (data : any) => void;

export class SignalingManager {

    private static instance : SignalingManager;
    private idCounter = 1;
    private WEBSOCKET_URL : string = `wss://ws.backpack.exchange/`;
    private ws : WebSocket;
    private callBackList : Record<string, Record<string, Callback>> = {};
    private bufferedMessages : {service : string, id : number}[] = [];

    private constructor() {

        this.ws = new WebSocket(this.WEBSOCKET_URL);  

        this.ws.onopen = () => {
            this.bufferedMessages.forEach((item) => {
                this.ws.send(JSON.stringify({method: "SUBSCRIBE", params: [item.service]}));
            });
            this.bufferedMessages = [];
        }

        this.ws.onmessage = (event) => {
            try {
                const parsed: DepthResponse = JSON.parse(event.data);
                const topic = parsed.stream;
        
                if (topic && this.callBackList[topic]) {
                    Object.values(this.callBackList[topic]).forEach((cb) => {
                        cb(parsed.data);
                    });
                }
            } catch (e) {
            }
        };
    }

    public static getInstance() : SignalingManager{
        
        if(!SignalingManager.instance){
            SignalingManager.instance = new SignalingManager();
        }   
        
        return SignalingManager.instance;
    }

    private sendMessage(service : string, id : number) : void {
        
        if(!this.callBackList[service]){
            return;
        }
        
        if(this.ws.readyState !== WebSocket.OPEN){
            this.bufferedMessages.push({ service, id  })
            return;
        }
        
        if(this.bufferedMessages.length !== 0){
            this.bufferedMessages.forEach((item) => {
                this.ws.send(JSON.stringify({method: "SUBSCRIBE", params: [item.service]}));
            }) 
            this.bufferedMessages = [];
        }

        if (Object.keys(this.callBackList[service]).length === 1) {
            this.ws.send(JSON.stringify({method: "SUBSCRIBE", params: [service]}));
        }
    }

    public subscribe(type: string, market: string, cb : Callback) : number | null {

        type = type.toLowerCase();
        const service = `${type.toLowerCase()}.${market.toUpperCase()}`;

        if (!this.callBackList[service]) {
            this.callBackList[service] = {};
        }

        if(this.callBackList[service][this.idCounter]){
            return null;
        }

        this.callBackList[service][this.idCounter] = cb;

        this.sendMessage(service, this.idCounter);

        return this.idCounter++;
    } 
    
    public unSubscribe(type : string, market: string, id : number) : boolean {
        
        type = type.toLowerCase();
        const service = `${type.toLowerCase()}.${market.toUpperCase()}`;

        if (!this.callBackList[service] || !this.callBackList[service][id]) {
            return false;
        }

        try{
            delete this.callBackList[service][id];

            if (Object.keys(this.callBackList[service]).length === 0) {
                delete this.callBackList[service];

                if (this.ws.readyState === WebSocket.OPEN) {
                    this.ws.send(JSON.stringify({ method: "UNSUBSCRIBE", params: [service] }));
                }
            }

            return true;
        }catch(err){
            return false;
        }
    }
}