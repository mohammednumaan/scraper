export interface Post {
    id: string;
    shortcode: string;
    thumbnail_src: string;
    video_url: string;
    video_view_count: number;
    video_play_count: number;
    video_duration: number;
    like_count: number;
    // share_count: number;
    comment_count: number,
    caption: string | null;
    hashtags: string[] | null;
    owner: InstagramPostOwner;
    location: InsatgramPostLocation | null,
    is_video: boolean,
}

export interface InstagramPostResponse {
    id: string;
    shortcode: string;
    thumbnail_src: string;
    video_url: string;
    video_view_count: number;
    video_play_count: number;
    video_duration: number;
    edge_media_preview_comment: {count: number};
    edge_media_preview_like: {count: number};
    edge_media_to_caption: {edges: {node: InstagramPostCaption}[]}
    owner: InstagramPostOwner;
    location: InsatgramPostLocation | null;
    is_video: boolean;
    // dash_info: {

    // }

}

export interface InstagramMediaResponse {
    pk: string;
    code: string;
    caption: InstagramPostCaption;
    play_count: number,
    ig_play_count: number,
    display_uri: string,
    like_count: number,
    comment_count: number;
    video_duration: number;
    edge_media_to_caption: {edges: {node: InstagramPostCaption}[]}
}

interface InstagramPostCaption {
    created_at: string;
    text: string;
    id: string;
}

interface InsatgramPostLocation{
    lng: number,
    lat: number,
}

interface InstagramPostOwner{
    id: string,
    is_verified: boolean,
    username: string,
    full_name: string
    edge_followed_by: {count: number},
    edge_owner_to_timeline_media: {count: number}
}

export interface IPostScraper {
    getPostByPostId(postId: string): Promise<Post>;
    parseCaption(caption: string): {captions: string, hashtags: string[]};
}