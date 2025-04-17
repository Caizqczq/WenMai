import { Region, RelicSite } from './types';

// 地区数据
export const regions: Region[] = [
  { 
    id: '1', 
    name: '华北', 
    description: '包含北京、天津等地区的文化遗产', 
    latitude: 39.9042, 
    longitude: 116.4074, // 北京坐标
    zoom: 7,
    relicCount: 15
  },
  { 
    id: '2', 
    name: '华东', 
    description: '包含上海、江苏、浙江等地区的文化遗产', 
    latitude: 31.2304, 
    longitude: 121.4737, // 上海坐标
    zoom: 7,
    relicCount: 20
  },
  { 
    id: '3', 
    name: '华南', 
    description: '包含广东、广西等地区的文化遗产', 
    latitude: 23.1291, 
    longitude: 113.2644, // 广州坐标
    zoom: 7,
    relicCount: 12
  },
  { 
    id: '4', 
    name: '西北', 
    description: '包含陕西、甘肃等地区的文化遗产', 
    latitude: 34.3416, 
    longitude: 108.9398, // 西安坐标
    zoom: 7,
    relicCount: 18
  },
  { 
    id: '5', 
    name: '西南', 
    description: '包含四川、云南等地区的文化遗产', 
    latitude: 30.5723, 
    longitude: 104.0665, // 成都坐标
    zoom: 7,
    relicCount: 14
  },
  { 
    id: '6', 
    name: '东北', 
    description: '包含黑龙江、吉林、辽宁等地区的文化遗产', 
    latitude: 41.8057, 
    longitude: 123.4315, // 沈阳坐标
    zoom: 7,
    relicCount: 10
  },
  { 
    id: '7', 
    name: '中部', 
    description: '包含湖北、湖南、河南等地区的文化遗产', 
    latitude: 30.5928, 
    longitude: 114.3055, // 武汉坐标
    zoom: 7,
    relicCount: 16
  },
];

// 文物点位数据
export const relicSites: RelicSite[] = [
  // { 
  //   id: '101', 
  //   name: '故宫博物院', 
  //   latitude: 39.9163, 
  //   longitude: 116.3972, 
  //   regionId: '1',
  //   relicIds: ['107'],
  //   description: '中国明清两代的皇家宫殿，世界上现存规模最大、保存最为完整的木质结构古建筑之一。',
  //   imageUrl: 'https://picsum.photos/id/100/800/600',
  //   type: 'museum'
  // },
  { 
    id: '102', 
    name: '秦始皇兵马俑', 
    latitude: 34.3841, 
    longitude: 109.2785, 
    regionId: '4',
    relicIds: ['102'],
    description: '世界上规模最大的古代军事博物馆，被誉为"世界第八大奇迹"。',
    imageUrl: 'https://picsum.photos/id/102/800/600',
    type: 'site'
  },
  { 
    id: '103', 
    name: '莫高窟', 
    latitude: 40.0359, 
    longitude: 94.8096, 
    regionId: '4',
    relicIds: ['103'],
    description: '世界上现存规模最大、内容最丰富的佛教艺术圣地，有"东方艺术明珠"之称。',
    imageUrl: 'https://picsum.photos/id/103/800/600',
    type: 'site'
  },
  { 
    id: '104', 
    name: '三星堆博物馆', 
    latitude: 31.1350, 
    longitude: 104.3998, 
    regionId: '5',
    relicIds: [],
    description: '三星堆博物馆是中国四川省广汉市的一座博物馆，收藏了大量三星堆文化的文物。',
    imageUrl: 'https://picsum.photos/id/104/800/600',
    type: 'museum'
  },
  // { 
  //   id: '105', 
  //   name: '苏州博物馆', 
  //   latitude: 31.3213, 
  //   longitude: 120.6288, 
  //   regionId: '2',
  //   relicIds: [],
  //   description: '由著名华裔建筑大师贝聿铭设计，融合了传统与现代的建筑风格。',
  //   imageUrl: 'https://picsum.photos/id/105/800/600',
  //   type: 'museum'
  // },
  { 
    id: '106', 
    name: '陕西历史博物馆', 
    latitude: 34.2377, 
    longitude: 108.9376, 
    regionId: '4',
    relicIds: [],
    description: '中国第一座大型现代化国家级博物馆，收藏了陕西出土的珍贵文物。',
    imageUrl: 'https://picsum.photos/id/106/800/600',
    type: 'museum'
  },
  { 
    id: '107', 
    name: '湖南省博物馆', 
    latitude: 28.1926, 
    longitude: 112.9850, 
    regionId: '3',
    relicIds: [],
    description: '湖南省最大的综合性博物馆，收藏了大量马王堆汉墓出土文物。',
    imageUrl: 'https://picsum.photos/id/107/800/600',
    type: 'museum'
  },
  { 
    id: '108', 
    name: '甘肃省博物馆', 
    latitude: 36.0617, 
    longitude: 103.8318, 
    regionId: '4',
    relicIds: ['106'],
    description: '收藏了丰富的丝绸之路文物和甘肃地区出土的珍贵文物。',
    imageUrl: 'https://picsum.photos/id/108/800/600',
    type: 'museum'
  },
  { 
    id: '109', 
    name: '湖北省博物馆', 
    latitude: 30.5469, 
    longitude: 114.3425, 
    regionId: '7',
    relicIds: ['105'],
    description: '国家一级博物馆，馆藏丰富，尤以商周青铜器、楚秦汉漆木器与简牍、发掘自曾侯乙墓的整套编钟乐器和越王勾践剑等国宝级文物最为著名。是了解荆楚文化乃至中国古代文明的重要窗口。',
    imageUrl: '/images/hubei.png',
    type: 'museum',
    admission: '免费开放 (请提前预约)'
  },
  { 
    id: '110', 
    name: '浙江省博物馆', 
    latitude: 30.2539, 
    longitude: 120.1584, 
    regionId: '2',
    relicIds: ['108'],
    description: '收藏了富春山居图等珍贵文物，是浙江省最大的综合性博物馆。',
    imageUrl: 'https://picsum.photos/id/110/800/600',
    type: 'museum'
  },
  { 
    id: '111', 
    name: '中国国家博物馆', 
    latitude: 39.9053, 
    longitude: 116.4034, 
    regionId: '1',
    relicIds: ['101', '104', '107','109'],
    description: '中国最大的综合性博物馆，收藏了中国古代文明发展的重要文物。',
    imageUrl: 'https://picsum.photos/id/111/800/600',
    type: 'museum'
  },
];

// 工具函数：根据ID获取地区信息
export const getRegionById = (id: string): Region | undefined => {
  return regions.find(region => region.id === id);
};

// 工具函数：获取所有地区
export const getAllRegions = (): Region[] => {
  return regions;
};

// 工具函数：根据地区ID获取文物点位
export const getRelicSitesByRegionId = (regionId: string): RelicSite[] => {
  return relicSites.filter(site => site.regionId === regionId);
};

// 工具函数：根据ID获取文物点位
export const getRelicSiteById = (id: string): RelicSite | undefined => {
  return relicSites.find(site => site.id === id);
};

// 工具函数：获取所有文物点位
export const getAllRelicSites = (): RelicSite[] => {
  return relicSites;
};

// 工具函数：根据类型获取文物点位
export const getRelicSitesByType = (type: 'museum' | 'site' | 'monument'): RelicSite[] => {
  return relicSites.filter(site => site.type === type);
};

// 工具函数：根据文物ID获取包含该文物的点位
export const getRelicSitesByRelicId = (relicId: string): RelicSite[] => {
  return relicSites.filter(site => site.relicIds?.includes(relicId));
}; 