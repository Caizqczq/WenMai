/**
 * 数据服务统一导出
 */
import { categories, dynasties } from '../relics';

// 导出所有服务实例
export { relicService } from './relicService';
export { storyService } from './storyService';
export { regionService } from './regionService';

// 导出服务类
export { default as RelicService } from './relicService';
export { default as StoryService } from './storyService';
export { default as RegionService } from './regionService';

// 为了简化导入，提供额外的别名
export const categoryService = {
  getAllCategories: () => Promise.resolve(categories)
};

export const dynastyService = {
  getAllDynasties: () => Promise.resolve(dynasties)
}; 