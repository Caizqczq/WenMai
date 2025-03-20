import { Region, RelicSite } from '../types';
import { 
  regions,
  relicSites,
  getRegionById as _getRegionById,
  getAllRegions as _getAllRegions,
  getRelicSitesByRegionId as _getRelicSitesByRegionId,
  getRelicSiteById as _getRelicSiteById,
  getAllRelicSites as _getAllRelicSites,
  getRelicSitesByType as _getRelicSitesByType,
  getRelicSitesByRelicId as _getRelicSitesByRelicId
} from '../regions';

/**
 * 地区数据服务
 * 
 * 封装了地区和文物点位数据的访问方法，将来可以替换为API调用
 * 当前使用本地数据，未来可无缝切换为远程数据源
 */
class RegionService {
  /**
   * 获取所有地区
   */
  getAllRegions(): Promise<Region[]> {
    return Promise.resolve(_getAllRegions());
  }

  /**
   * 根据ID获取地区
   */
  getRegionById(id: string): Promise<Region | undefined> {
    return Promise.resolve(_getRegionById(id));
  }

  /**
   * 获取所有文物点位
   */
  getAllRelicSites(): Promise<RelicSite[]> {
    return Promise.resolve(_getAllRelicSites());
  }

  /**
   * 根据ID获取文物点位
   */
  getRelicSiteById(id: string): Promise<RelicSite | undefined> {
    return Promise.resolve(_getRelicSiteById(id));
  }

  /**
   * 根据地区ID获取文物点位
   */
  getRelicSitesByRegionId(regionId: string): Promise<RelicSite[]> {
    return Promise.resolve(_getRelicSitesByRegionId(regionId));
  }

  /**
   * 根据类型获取文物点位
   */
  getRelicSitesByType(type: 'museum' | 'site' | 'monument'): Promise<RelicSite[]> {
    return Promise.resolve(_getRelicSitesByType(type));
  }

  /**
   * 根据文物ID获取包含该文物的点位
   */
  getRelicSitesByRelicId(relicId: string): Promise<RelicSite[]> {
    return Promise.resolve(_getRelicSitesByRelicId(relicId));
  }

  /**
   * 搜索地区
   */
  searchRegions(keyword: string): Promise<Region[]> {
    const results = regions.filter(region =>
      region.name.toLowerCase().includes(keyword.toLowerCase()) ||
      region.description.toLowerCase().includes(keyword.toLowerCase())
    );
    return Promise.resolve(results);
  }

  /**
   * 搜索文物点位
   */
  searchRelicSites(keyword: string): Promise<RelicSite[]> {
    const results = relicSites.filter(site =>
      site.name.toLowerCase().includes(keyword.toLowerCase()) ||
      (site.description && site.description.toLowerCase().includes(keyword.toLowerCase()))
    );
    return Promise.resolve(results);
  }

  /**
   * 获取附近的文物点位（模拟）
   */
  getNearbyRelicSites(latitude: number, longitude: number, radiusKm: number = 10): Promise<RelicSite[]> {
    // 在真实应用中应使用地理距离计算
    // 这里仅简单模拟
    const results = relicSites.slice(0, 3); // 返回前3个作为演示
    return Promise.resolve(results);
  }
}

// 导出单例实例
export const regionService = new RegionService();

// 也导出类，以便需要时可以创建新实例
export default RegionService; 