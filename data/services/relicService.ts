import { Relic, Category, Dynasty, FilterOptions } from '../types';
import { 
  relicsData, 
  getRelicById as _getRelicById,
  getRelicsByCategory as _getRelicsByCategory,
  getRelicsByDynasty as _getRelicsByDynasty,
  getFilteredRelics as _getFilteredRelics,
  getRelatedRelics as _getRelatedRelics,
  categories as _categories,
  dynasties as _dynasties,
  featuredRelics as _featuredRelics
} from '../relics';

/**
 * 文物数据服务
 * 
 * 封装了文物数据的访问方法，将来可以替换为API调用
 * 当前使用本地数据，未来可无缝切换为远程数据源
 */
class RelicService {
  /**
   * 获取所有文物
   */
  getAllRelics(): Promise<Relic[]> {
    // 模拟API调用的异步行为
    return Promise.resolve(relicsData);
  }

  /**
   * 根据ID获取文物
   */
  getRelicById(id: string): Promise<Relic | undefined> {
    // 模拟API调用
    return Promise.resolve(_getRelicById(id));
  }

  /**
   * 根据分类获取文物
   */
  getRelicsByCategory(categoryId: string): Promise<Relic[]> {
    return Promise.resolve(_getRelicsByCategory(categoryId));
  }

  /**
   * 根据朝代获取文物
   */
  getRelicsByDynasty(dynastyId: string): Promise<Relic[]> {
    return Promise.resolve(_getRelicsByDynasty(dynastyId));
  }

  /**
   * 根据多个过滤条件获取文物
   */
  getFilteredRelics(options: FilterOptions): Promise<Relic[]> {
    return Promise.resolve(_getFilteredRelics(options));
  }

  /**
   * 获取相关文物
   */
  getRelatedRelics(relicId: string): Promise<Relic[]> {
    return Promise.resolve(_getRelatedRelics(relicId));
  }

  /**
   * 获取所有文物分类
   */
  getAllCategories(): Promise<Category[]> {
    return Promise.resolve(_categories);
  }

  /**
   * 获取所有朝代
   */
  getAllDynasties(): Promise<Dynasty[]> {
    return Promise.resolve(_dynasties);
  }

  /**
   * 获取精选文物
   */
  getFeaturedRelics(): Promise<Relic[]> {
    return Promise.resolve(_featuredRelics);
  }

  /**
   * 搜索文物
   */
  searchRelics(keyword: string): Promise<Relic[]> {
    const results = relicsData.filter(relic => 
      relic.name.toLowerCase().includes(keyword.toLowerCase()) ||
      relic.dynasty.toLowerCase().includes(keyword.toLowerCase()) ||
      relic.category.toLowerCase().includes(keyword.toLowerCase()) ||
      (relic.description && relic.description.toLowerCase().includes(keyword.toLowerCase()))
    );
    return Promise.resolve(results);
  }
}

// 导出单例实例
export const relicService = new RelicService();

// 也导出类，以便需要时可以创建新实例
export default RelicService; 