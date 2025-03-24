import axios from "axios";
import { InstagramMediaResponse } from "../types/posts.js";
import { InstagramUserResponse, IProfileScraper, UserProfile } from "../types/profile.js";
import { IBrowserService } from "./index.js";
import { ResponseHandler } from "./response.js";

export class InstagramProfileScraper implements IProfileScraper{
    private readonly browser: IBrowserService;
    private readonly baseURL: string;
  
    constructor(browserService: IBrowserService, baseURL: string = "https://www.instagram.com"){
      this.browser = browserService;
      this.baseURL = baseURL;
    }
  
    async getProfileByUsername(username: string): Promise<UserProfile> {
      const page = await this.browser.initPage();
      
      const responseHandler = new ResponseHandler<InstagramUserResponse>(
        "/api/v1/users/web_profile_info/",
        (responseJson) => responseJson.data.user
      );
      
      
      try {
        await page.goto(`${this.baseURL}/${username}`);
        const instagramUserPromise = responseHandler.createResponsePromise(page);
        const instagramUserResponse = await instagramUserPromise;
        return this.createUserProfileObject(instagramUserResponse);
      } 
      
      finally {
        await this.browser.closeBrowser();
      }
    }

    async getProfileByUserId(userId: string): Promise<UserProfile>{

      const url = `https://i.instagram.com/api/v1/users/${userId}/info/`;

      // note: this is not completely reliable since instagram can change the internal app-Id
      // anytime which could break this functionality, however, it is stable as of now
      const headers = {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 12_3_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Instagram 105.0.0.11.118 (iPhone11,8; iOS 12_3_1; en_US; en-US; scale=2.00; 828x1792; 165586599)',
        'Referer': 'https://www.instagram.com/',  
        'X-Ig-App-Id': '936619743392459', 
      };
    
      try {
        const response = await axios.get(url, { headers: headers });
        return await this.getProfileByUsername(response.data.user.username);
      } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
      }
    }
  
    async getPostsByUsername(username: string): Promise<InstagramMediaResponse[]> {
      const page = await this.browser.initPage();
      
      const responseHandler = new ResponseHandler<InstagramUserResponse>(
        "/api/v1/users/web_profile_info/",
        (responseJson) => responseJson.data.user
      );
      
      
      try {
        await page.goto(`${this.baseURL}/${username}`);
        const instagramUserPromise = responseHandler.createResponsePromise(page);
        const instagramUserResponse = await instagramUserPromise;

        const a: InstagramMediaResponse[] = []
        return a;
        // return this.createUserProfileObject(instagramUserResponse);
      } 
      
      finally {
        await this.browser.closeBrowser();
      }
    }
  
    createUserProfileObject(instagramUserResponse: InstagramUserResponse): UserProfile{
      return {
        id: instagramUserResponse.id,
        username: instagramUserResponse.username,
        fullname: instagramUserResponse.full_name,
        biography: instagramUserResponse.biography,
        follower_count: instagramUserResponse.edge_followed_by.count,
        following_count: instagramUserResponse.edge_follow.count,
        media_count: instagramUserResponse.edge_owner_to_timeline_media.count,
        profile_pic_url: instagramUserResponse.profile_pic_url,
      }
    }
  
    createUserPostsArray(instagramUserResponse: InstagramMediaResponse): InstagramMediaResponse[]{
      const userReels: InstagramMediaResponse[] = [];
      // instagramUserResponse.forEach(media => {
      //   const mediaObj: InstagramMediaResponse = {
      //     pk: media.node.pk,
      //     code: media.node.code,
      //     caption: media.node.caption,
      //     display_uri: media.node.display_uri,
      //     ig_play_count: media.node.ig_play_count,
      //     play_count: media.node.play_count,
      //     like_count: media.node.like_count,
      //     comment_count: media.node.comment_count,
      //     video_duration: media.node.video_duration,
      //     edge_media_to_caption: media.node.edge_media_to_caption,
      //   }
      //   userReels.push(mediaObj);
      // })
  
      return userReels;
    }
} 
  