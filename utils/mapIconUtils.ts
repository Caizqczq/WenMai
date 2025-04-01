/**
 * 地图图标工具类
 * 用于管理文物地图上各类点位的图标
 */

import { getImageSource } from './imageUtils';

// 导入本地图标
const hubeiIcon = require('../assets/images/markers/gugong.png');
const hunanIcon = require('../assets/images/markers/hunan.png');
const zhejiangIcon = require('../assets/images/markers/zhejiang.png');
const guoboIcon = require('../assets/images/markers/guobo.png');
const shanxiIcon = require('../assets/images/markers/shanxi.png');
const sichuanIcon = require('../assets/images/markers/sichuan.png');
const gansuIcon = require('../assets/images/markers/gansu.png');
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
 * 获取点位图标的URL
 * @param siteId 点位ID
 * @param siteType 点位类型
 * @returns 图标URL或本地图片资源
 */
export const getMapIconUrl = (siteId: string, siteType?: 'museum' | 'site' | 'monument'): string | any => {
  // 首先检查是否有ID特定的图标
  if (SITE_ICON_MAP[siteId]) {
    return SITE_ICON_MAP[siteId];
  } 
  // 其次，根据类型选择图标
  else if (siteType && TYPE_ICON_MAP[siteType]) {
    return TYPE_ICON_MAP[siteType];
  } 
  // 最后，使用默认图标
  else {
    return DEFAULT_ICON;
  }
};

export default {
  getMapIconUrl
}; 