import puppeteer, { Browser, Page } from "puppeteer";
import { IPostScraper } from "../types/posts.js";
import { IProfileScraper } from "../types/profile.js";
import { InstagramPostScraper } from "./posts.js";
import { InstagramProfileScraper } from "./users.js";

export interface IBrowserService {
  initBrowser(): Promise<Browser>;
  initPage(): Promise<Page>;
  closeBrowser(): Promise<void>;
}

export class BrowserService implements IBrowserService {
  private browser: Browser | null = null;
  private readonly headless: boolean;
  private readonly proxyServer: string | null;

  constructor(headless: boolean = true, proxyServer: string | null = null) {
    this.headless = headless;
    this.proxyServer = proxyServer;
  }

  async initBrowser(): Promise<Browser> {
    if (!this.browser || !this.browser.connected) {
      const browerArguments = ['--no-sandbox', '--disable-setuid-sandbox'];
      
      this.browser = await puppeteer.launch({
        headless: this.headless,
        args: browerArguments.length > 0 ? browerArguments : undefined
      });
    }
    return this.browser;
  }

  async initPage(): Promise<Page> {
    const browser = await this.initBrowser();
    const page = await browser.newPage();
    
    await page.setRequestInterception(true);
    page.setDefaultNavigationTimeout(60000);


    page.on('request', (request) => {
      const resourceType = request.resourceType();
      const resourceTypesToAbort = ["image", "stylesheet", "font", "media", "javascript"];

      if (resourceTypesToAbort.includes(resourceType)) {
        request.abort();
      } 
      
      else if (request.isInterceptResolutionHandled()){
        request.abort();
      }
      else {
        request.continue();
      }
    });

    return page;
  }

  async closeBrowser(): Promise<void> {
    if (this.browser && this.browser.connected) {
      await this.browser.close();
      this.browser = null;
    }
  }
}


export class InstagramScraper {
  private readonly browser: IBrowserService;
  private readonly profileScraper: IProfileScraper;
  private readonly postScraper: IPostScraper;

  constructor(baseURL: string = "https://www.instagram.com", headless: boolean = true, proxyServer: string | null = null) {
    this.browser = new BrowserService(headless, proxyServer);
    this.profileScraper = new InstagramProfileScraper(this.browser, baseURL);
    this.postScraper = new InstagramPostScraper(this.browser, baseURL);
  }

  async getProfileByUsername(username: string){
    const data = await this.profileScraper.getProfileByUsername(username);
    console.log(data)
    return data;
  }

  async getProfileByUserId(userId: string){
    const data = await this.profileScraper.getProfileByUserId(userId);
    console.log(data)
    return data;
  }

  async getPostByPostId(postID: string){
    const data = await this.postScraper.getPostByPostId(postID);
    console.log(data)
    return data;
  }
  
  // async getReelsByUsername(username: string){
  //   const data = await this.profileScraper.getPostsByUsername(username);
  //   console.log(data)
  //   return data;
  // }
};


const scraper = new InstagramScraper();

// use these methods for scraping (add your own inputs)
scraper.getProfileByUsername('apple')
// scraper.getProfileByUserId('5821462185')
// scraper.getPostByPostId('DHYwUcDRUQC')
