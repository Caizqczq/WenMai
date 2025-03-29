// 图片路径映射表
const imageMap: Record<string, any> = {
  // 主要图片
  '/images/goujian_sword_cover.jpg': require('../assets/images/goujian_sword_cover.jpg'),
  
  // 场景图片 - 使用本地文件（注意PNG扩展名）
  '/images/goujian_story_cover.jpg': require('../assets/images/goujian_story_cover.jpg'),
  '/images/goujian_coronation_scene.jpg': require('../assets/images/goujian_coronation_scene.png'),
  '/images/fuqiao_battle_scene.jpg': require('../assets/images/fuqiao_battle_scene.png'),
  '/images/goujian_servant_scene.jpg': require('../assets/images/goujian_servant_scene.png'),
  '/images/goujian_gall_scene.jpg': require('../assets/images/goujian_gall_scene.png'),
  '/images/goujian_victory_scene.jpg': require('../assets/images/goujian_victory_scene.png'),
  '/images/sword_discovery_scene.jpg': require('../assets/images/sword_discovery_scene.png'),
  
  // 主要图片 - 这些可能与场景图片相同，使用场景图片作为替代
  '/images/goujian_coronation.jpg': require('../assets/images/goujian_coronation_scene.png'),
  '/images/fuqiao_battle.jpg': require('../assets/images/fuqiao_battle_scene.png'),
  '/images/goujian_servant.jpg': require('../assets/images/goujian_servant_scene.png'),
  '/images/goujian_gall.jpg': require('../assets/images/goujian_gall_scene.png'),
  '/images/goujian_victory.jpg': require('../assets/images/goujian_victory_scene.png'),
  '/images/sword_discovery.jpg': require('../assets/images/sword_discovery_scene.png'),
  
  // 仍然缺少的图片使用网络图片
  '/images/sword_museum.jpg': { uri: 'https://img.zcool.cn/community/011b3457a02a500000018c1b3ec9a9.jpg@1280w_1l_2o_100sh.jpg' },
  '/images/sword_museum_scene.jpg': { uri: 'https://img.zcool.cn/community/01659e5cd97025a801212067f8b79e.jpg@1280w_1l_2o_100sh.jpg' },
  
  // 默认图片
  'default_background': require('../assets/images/goujian_story_cover.jpg'),
};

/**
 * 获取图片资源
 * @param path 图片路径
 * @returns 图片资源
 */
export const getImageSource = (path: string | undefined) => {
  // 如果没有路径，返回默认图片
  if (!path) {
    return imageMap['default_background'];
  }
  
  // 如果是完整的http/https URL，直接返回uri对象
  if (path && (path.startsWith('http://') || path.startsWith('https://'))) {
    return { uri: path };
  }
  
  // 如果在映射表中找到，返回require的资源
  if (path && imageMap[path]) {
    return imageMap[path];
  }
  
  // 找不到图片，返回默认图片并打印警告
  console.warn(`图片路径 "${path}" 未在映射表中找到，使用默认图片`);
  return imageMap['default_background'];
};

export default {
  getImageSource
}; 