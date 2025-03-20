/**
 * 数据模块统一导出
 * 
 * 该文件作为数据模块的主入口，统一导出所有数据和服务
 * 使用时通过 import { ... } from '@/data' 方式引入
 */

// 导出类型定义
export * from './types';

// 导出数据
export * from './relics';
export * from './regions';
export * from './stories';

// 导出服务实例 (推荐使用)
export * from './services';

// 使用示例：
// 
// // 直接使用数据 (不推荐)
// import { relicsData, getRelicById } from '@/data';
// const relic = getRelicById('101');
// 
// // 使用服务 (推荐)
// import { relicService } from '@/data';
// relicService.getRelicById('101').then(relic => {
//   console.log(relic);
// }); 