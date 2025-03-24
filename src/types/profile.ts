import { InstagramMediaResponse, Post } from "./posts.js";

export interface UserProfile {
    id: string
    username: string,
    biography: string,
    fullname: string,
    follower_count: number,
    following_count: number,
    media_count: number,
    profile_pic_url: string
}

export interface InstagramUserResponse {
    id: string
    username: string;
    biography: string;
    full_name: string;
    edge_followed_by: { count: number };
    edge_follow: { count: number };
    edge_owner_to_timeline_media: { count: number, edges: {node: InstagramMediaResponse}[] };
    profile_pic_url: string;
}

export interface IProfileScraper {
  getProfileByUsername(username: string): Promise<UserProfile>
  getProfileByUserId(userId: string): Promise<UserProfile>
  getPostsByUsername(username: string): Promise<InstagramMediaResponse[]>;
}
