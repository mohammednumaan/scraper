import { Page, HTTPResponse } from "puppeteer";

export class ResponseHandler<T> {
    private readonly urlToMatch: string;
    private readonly extractData: (response: any) => T;
    private readonly maxRetries: number;
    private readonly timeDelay: number;

    constructor(url: string, extractData: (response: any) => T, retries: number = 3, delay: number = 1000) {
        this.urlToMatch = url;
        this.extractData = extractData;
        this.maxRetries = retries;
        this.timeDelay = delay;
    }

    async createResponsePromise(page: Page): Promise<T> {
        let attempt = 1;
        while (attempt <= this.maxRetries){
            try {
                const data = await this.waitForResponse(page);
                if (data) return data;
            } catch (err) {
                console.log(`Retry attempt ${attempt} failed`, err);
                if (attempt > this.maxRetries) throw err;
                
                const expDelay = this.timeDelay * 2 ** attempt;
                console.log(`Retrying after ${expDelay}ms...`);
                attempt++;
                await new Promise((resolve) => setTimeout(resolve, expDelay));
            }
        }
        throw new Error("Max retries exceeded without receiving a valid response.");
    }

    private waitForResponse(page: Page): Promise<T> {
        return new Promise((resolve, reject) => {
            page.on('response', async (response) => {
                try {
                    if (response.url().includes(this.urlToMatch)) {
                        const responseJSON = await response.json();
                        const data = this.extractData(responseJSON);

                        if (data) {
                            return resolve(data);
                        }
                    }
                } catch (err) {
                    reject(err);
                }
            })

        });
    }
}
