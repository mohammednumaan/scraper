import { InstagramPostResponse, IPostScraper, Post } from "../types/posts.js";
import { IBrowserService } from "./index.js";
import { ResponseHandler } from "./response.js";

export class InstagramPostScraper implements IPostScraper{
    private readonly browser: IBrowserService;
    private readonly baseURL: string;
  
    constructor(browserService: IBrowserService, baseURL: string = "https://www.instagram.com"){
      this.browser = browserService;
      this.baseURL = baseURL;
    }
  
    async getPostByPostId(postID: string): Promise<Post>{
      const page = await this.browser.initPage();
      const responseHandler = new ResponseHandler<InstagramPostResponse>(
        "/graphql/query",
        (responseJson) => responseJson.data.xdt_shortcode_media
      );
      
      try{
        await page.goto(`${this.baseURL}/p/${postID}`);
        const instagramPostPromise = responseHandler.createResponsePromise(page);
        const instagramPostResponse: InstagramPostResponse = await instagramPostPromise;
  
        const caption = instagramPostResponse?.edge_media_to_caption.edges[0].node.text;  
        const {captions, hashtags} = this.parseCaption(caption);
        return this.createPostObject(instagramPostResponse, captions, hashtags);
  
      } 
      finally{
        await this.browser.closeBrowser();
      }
   
    }
  
    parseCaption(caption: string){
      const captionArr = caption.split("\n");
      let captionText = "";
      let hashtagsArr: string[] = []
  
      captionArr.forEach(text => {
        if (text.startsWith('#')){
          const tagsArr = text.split(" ");
          const filteredTags = tagsArr.filter(tag => tag.startsWith('#'));
          hashtagsArr = hashtagsArr.concat(filteredTags);
  
        } else{
          captionText += `${text}\n`;
        }
      })
      return {
        captions: captionText,
        hashtags: hashtagsArr
      }
    }
  
    createPostObject(instagramPostResponse: InstagramPostResponse, captions: string, hashtags: string[]): Post{
      return {
        id: instagramPostResponse.id,
        shortcode: instagramPostResponse.shortcode,
        thumbnail_src: instagramPostResponse.thumbnail_src,
        video_url: instagramPostResponse.video_url,
        video_view_count: instagramPostResponse.video_view_count,
        video_play_count: instagramPostResponse.video_play_count,
        video_duration: instagramPostResponse.video_duration,
        like_count: instagramPostResponse.edge_media_preview_like.count,
        comment_count: instagramPostResponse.edge_media_preview_comment.count,
        caption: captions || null,
        hashtags: hashtags || null,
        owner: {
          id: instagramPostResponse.owner.id,
          username: instagramPostResponse.owner.username,
          full_name: instagramPostResponse.owner.full_name,
          is_verified: instagramPostResponse.owner.is_verified,
          edge_followed_by: instagramPostResponse.owner.edge_followed_by,
          edge_owner_to_timeline_media: instagramPostResponse.owner.edge_owner_to_timeline_media
        },
        location: instagramPostResponse.location ? {
          lat: instagramPostResponse.location.lat,
          lng: instagramPostResponse.location.lng
        } : null,
        is_video: instagramPostResponse.is_video
      }
    }
}
