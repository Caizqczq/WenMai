/**
 * 地图图标工具类
 * 用于管理文物地图上各类点位的图标
 */

import { getImageSource } from './imageUtils';
import { Image } from 'react-native';

// 创建图标资源映射表
const iconMap: Record<string, any> = {
  '/markers/gugong.png': require('../assets/images/markers/gugong.png'),
  '/markers/guobo.png': require('../assets/images/markers/guobo.png'),
  '/markers/shanxi.png': require('../assets/images/markers/shanxi.png'),
  '/markers/gansu.png': require('../assets/images/markers/gansu.png'),
  '/markers/sichuan.png': require('../assets/images/markers/sichuan.png'),
  '/markers/zhejiang.png': require('../assets/images/markers/zhejiang.png'),
  '/markers/hunan.png': require('../assets/images/markers/hunan.png'),
};

// 本地图标引用 - 使用映射表
const hubeiIcon = iconMap['/markers/gugong.png'];
const guoboIcon = iconMap['/markers/guobo.png'];
const shanxiIcon = iconMap['/markers/shanxi.png'];
const gansuIcon = iconMap['/markers/gansu.png'];
const sichuanIcon = iconMap['/markers/sichuan.png'];
const zhejiangIcon = iconMap['/markers/zhejiang.png'];
const hunanIcon = iconMap['/markers/hunan.png'];

// 备用在线图标 - 当本地图标无法加载时使用
// 注意：这些仅在getLocalResourceUri内部作为后备使用，getMapIconUrl新逻辑不直接用它们
const FALLBACK_ICONS: Record<string, string> = {
  '111': 'https://img.icons8.com/color/48/000000/pagoda.png',  // 故宫博物院
  '104': 'https://img.icons8.com/color/48/000000/terracotta-army.png',  // 四川博物馆
  '106': 'https://img.icons8.com/color/48/000000/buddist-temple.png',  // 陕西博物馆
  '107': 'https://img.icons8.com/color/48/000000/castle.png',  // 湖南博物馆
  '108': 'https://img.icons8.com/color/48/000000/asian-building.png',  // 甘肃博物馆
  '109': 'https://img.icons8.com/color/48/000000/bridge.png',  // 湖北博物馆
  '110': 'https://img.icons8.com/color/48/000000/torii-gate.png',  // 浙江博物馆
};

// 博物馆ID与图标的映射关系 - 混合使用本地图标和在线图标
const SITE_ICON_MAP: Record<string, any> = {
  // 不同博物馆的自定义图标
  '111': guoboIcon,                                                            // 故宫博物院 - 使用本地图标
  '102': 'https://img.icons8.com/color/48/000000/terracotta-army.png',          // 秦始皇兵马俑
  '103': 'https://img.icons8.com/color/48/000000/great-wall.png',               // 莫高窟
  '104':  sichuanIcon,                                                            // 三星堆博物馆
  '105': 'https://img.icons8.com/color/48/000000/pagoda.png',                   // 苏州博物馆
  '106': shanxiIcon,                                                            // 陕西历史博物馆
  '107': hunanIcon,                                                            // 湖南省博物馆 - 使用本地图标
  '108': gansuIcon,                                                            // 甘肃省博物馆
  '109': hubeiIcon,                                                            // 湖北省博物馆(越王勾践剑)
  '110': zhejiangIcon,                                                            // 浙江省博物馆(富春山居图)
};

// 不同类型点位的默认图标 - 使用在线图标URL
const TYPE_ICON_MAP: Record<string, string> = {
  'museum': 'https://img.icons8.com/color/48/000000/museum.png',                // 博物馆默认图标
  'site': 'https://img.icons8.com/color/48/000000/historical-place.png',        // 遗址默认图标
  'monument': 'https://img.icons8.com/color/48/000000/obelisk.png',             // 纪念碑默认图标
};

// 默认图标 - 使用在线图标URL
const DEFAULT_ICON = 'https://img.icons8.com/color/48/000000/marker.png';

/**
 * 获取本地资源URI
 * @param localResource 本地资源
 * @param fallbackUrl 备用URL
 * @returns 资源URI
 */
export const getLocalResourceUri = (localResource: any, fallbackUrl?: string) => {
  try {
    // 确保本地资源可用
    if (localResource) {
      return localResource;
    }
    // 如果本地资源不可用但有备用URL，使用备用URL
    if (fallbackUrl && isValidUrl(fallbackUrl)) {
      return { uri: fallbackUrl };
    }
  } catch (error) {
    console.error('获取资源URI时出错:', error);
    // 如果有备用URL，在出错时使用备用URL
    if (fallbackUrl && isValidUrl(fallbackUrl)) {
      return { uri: fallbackUrl };
    }
  }
  // 如果都失败，返回默认图标
  return DEFAULT_ICON;
};

/**
 * 检查URL是否有效
 * @param url 要检查的URL
 * @returns 是否为有效URL
 */
const isValidUrl = (url: string): boolean => {
  try {
    return url.startsWith('http://') || url.startsWith('https://');
  } catch (e) {
    return false;
  }
};

/**
 * 获取地图图标URL
 * @param siteId 点位ID
 * @param siteType 点位类型
 * @returns 图标资源
 */
export const getMapIconUrl = (siteId: string, siteType?: 'museum' | 'site' | 'monument') => {
  // 1. 首先尝试使用站点特定的图标
  if (siteId && SITE_ICON_MAP[siteId]) {
    const iconSource = SITE_ICON_MAP[siteId];
    if (typeof iconSource === 'string' && isValidUrl(iconSource)) {
      // 在线URL直接返回
      return iconSource;
    } else if (typeof iconSource !== 'string') {
      // 本地资源需要转换为数据URI
      try {
        // 使用Image.resolveAssetSource获取URI（兼容Android和iOS）
        const resolvedSource = Image.resolveAssetSource(iconSource);
        if (resolvedSource && resolvedSource.uri) {
          return resolvedSource.uri;
        }
      } catch (error) {
        console.error('解析本地图标资源失败:', error);
      }
    }
  }
  
  // 2. 如果没有站点特定图标，尝试使用类型图标
  if (siteType && TYPE_ICON_MAP[siteType]) {
    const typeIconUrl = TYPE_ICON_MAP[siteType];
    if (isValidUrl(typeIconUrl)) {
      return typeIconUrl;
    }
  }
  
  // 3. 最后使用默认图标
  return DEFAULT_ICON;
};

export default {
  getMapIconUrl
}; 