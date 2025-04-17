/**
 * 地图图标工具类
 * 用于管理文物地图上各类点位的图标
 */

import { getImageSource } from './imageUtils';
import { Image } from 'react-native';
import * as FileSystem from 'expo-file-system'; // 导入 expo-file-system
import { Asset } from 'expo-asset'; // <--- 导入 Asset

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
 * 检查URL是否有效
 * @param url 要检查的URL
 * @returns 是否为有效URL
 */
const isValidUrl = (url: string): boolean => {
  try {
    // 检查是否为 http/https 或 data URI
    return url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:image');
  } catch (e) {
    return false;
  }
};

/**
 * 将本地图片资源转换为 Base64 Data URI
 * @param localResource require() 返回的本地资源 ID
 * @returns Promise<string | null> 返回 Data URI 或 null
 */
const convertLocalImageToBase64 = async (localResource: any): Promise<string | null> => {
  const asset = Asset.fromModule(localResource);
  const resourceId = typeof localResource === 'number' ? localResource : 'unknown';

  try {
    console.log(`[Asset Conversion Attempt] ID: ${resourceId}, Name: ${asset.name}, URI: ${asset.uri}, LocalURI: ${asset.localUri}, Downloaded: ${asset.downloaded}`);

    // 确保资源已下载到本地缓存
    // 在 Release 构建中，这会从 APK 包内复制到缓存目录
    if (!asset.downloaded) {
      console.log(`[Asset Conversion] Asset ${asset.name} not marked downloaded. Downloading...`);
      await asset.downloadAsync();
      console.log(`[Asset Conversion] Asset ${asset.name} download finished. New LocalURI: ${asset.localUri}`);
    }

    // 下载后，localUri 应该指向缓存中的文件
    const uriToRead = asset.localUri;

    if (uriToRead && uriToRead.startsWith('file://')) {
      console.log(`[Asset Conversion] Reading from validated localUri: ${uriToRead}`);
      const base64 = await FileSystem.readAsStringAsync(uriToRead, {
        encoding: FileSystem.EncodingType.Base64,
      });
      const mimeType = asset.type === 'png' ? 'image/png' : 'image/jpeg';
      console.log(`[Asset Conversion] Successfully read and encoded ${asset.name}.`);
      return `data:${mimeType};base64,${base64}`;
    } else {
      console.error(`[Asset Conversion Error] Asset ${asset.name} (ID: ${resourceId}) - Invalid or missing localUri after potential download: ${uriToRead}. Asset details: ${JSON.stringify(asset)}`);
    }
  } catch (error) {
    console.error(`[Asset Conversion Exception] Failed to convert local image (ID: ${resourceId}, Name: ${asset.name}):`, error);
  }
  return null;
};

/**
 * 获取地图图标 URL 或 Data URI (异步)
 * @param siteId 点位ID
 * @param siteType 点位类型
 * @returns Promise<string> 图标的 URL 或 Base64 Data URI
 */
export const getMapIconUrlAsync = async (siteId: string, siteType?: 'museum' | 'site' | 'monument'): Promise<string> => {
  // 1. 首先尝试使用站点特定的图标
  if (siteId && SITE_ICON_MAP[siteId]) {
    const iconSource = SITE_ICON_MAP[siteId];
    if (typeof iconSource === 'string' && isValidUrl(iconSource)) {
      // 在线 URL 或已是 Data URI 直接返回
      return iconSource;
    } else if (typeof iconSource !== 'string') {
      // 本地资源需要转换为 Base64 Data URI
      console.log(`Converting local icon for site ${siteId}...`);
      const dataUri = await convertLocalImageToBase64(iconSource);
      if (dataUri) {
        console.log(`Successfully converted icon for site ${siteId} to Data URI.`);
        return dataUri; // 返回 Base64 Data URI
      } else {
        console.warn(`Failed to convert icon for site ${siteId}, falling back.`);
      }
    }
  }

  // 2. 如果没有站点特定图标或转换失败，尝试使用类型图标
  if (siteType && TYPE_ICON_MAP[siteType]) {
    const typeIconUrl = TYPE_ICON_MAP[siteType];
    if (isValidUrl(typeIconUrl)) {
      console.log(`Using type icon for site ${siteId}: ${typeIconUrl}`);
      return typeIconUrl;
    }
  }

  // 3. 最后使用默认图标
  console.log(`Using default icon for site ${siteId}.`);
  return DEFAULT_ICON;
};

export default {
  getMapIconUrlAsync,
  DEFAULT_ICON
}; 