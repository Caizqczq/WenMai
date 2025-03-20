import { Story, StoryChapter } from '../types';
import {
  stories,
  getStoryById as _getStoryById,
  getStoriesByRelicId as _getStoriesByRelicId,
  getAllStories as _getAllStories,
  getFeaturedStories as _getFeaturedStories,
  getStoriesByTag as _getStoriesByTag,
  getChapterById as _getChapterById,
} from '../stories';

/**
 * 故事数据服务
 * 
 * 封装了故事数据的访问方法，将来可以替换为API调用
 * 当前使用本地数据，未来可无缝切换为远程数据源
 */
class StoryService {
  /**
   * 获取所有故事
   */
  getAllStories(): Promise<Story[]> {
    return Promise.resolve(_getAllStories());
  }

  /**
   * 根据ID获取故事
   */
  getStoryById(id: string): Promise<Story | undefined> {
    return Promise.resolve(_getStoryById(id));
  }

  /**
   * 根据文物ID获取相关故事
   */
  getStoriesByRelicId(relicId: string): Promise<Story[]> {
    return Promise.resolve(_getStoriesByRelicId(relicId));
  }

  /**
   * 获取精选故事
   */
  getFeaturedStories(limit: number = 3): Promise<Story[]> {
    return Promise.resolve(_getFeaturedStories(limit));
  }

  /**
   * 根据标签获取故事
   */
  getStoriesByTag(tag: string): Promise<Story[]> {
    return Promise.resolve(_getStoriesByTag(tag));
  }

  /**
   * 根据故事ID和章节ID获取章节
   */
  getChapterById(storyId: string, chapterId: string): Promise<StoryChapter | undefined> {
    return Promise.resolve(_getChapterById(storyId, chapterId));
  }

  /**
   * 获取故事的所有章节
   */
  getChaptersByStoryId(storyId: string): Promise<StoryChapter[] | undefined> {
    const story = _getStoryById(storyId);
    return Promise.resolve(story?.chapters);
  }

  /**
   * 搜索故事
   */
  searchStories(keyword: string): Promise<Story[]> {
    const results = stories.filter(story =>
      story.title.toLowerCase().includes(keyword.toLowerCase()) ||
      story.summary.toLowerCase().includes(keyword.toLowerCase()) ||
      story.tags?.some(tag => tag.toLowerCase().includes(keyword.toLowerCase()))
    );
    return Promise.resolve(results);
  }
}

// 导出单例实例
export const storyService = new StoryService();

// 也导出类，以便需要时可以创建新实例
export default StoryService; 