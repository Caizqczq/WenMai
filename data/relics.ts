import { Relic, Category, Dynasty, FilterOptions } from './types';

// 文物数据
export const relicsData: Relic[] = [
  {
    id: '101',
    name: '青铜器·后母戊鼎',
    dynasty: '商代',
    category: '青铜器',
    color: '#CD7F32',
    image: 'https://picsum.photos/id/866/800/600',
    description: '后母戊鼎是中国商代晚期青铜器，是迄今为止中国出土的最大的商代青铜器。高133厘米，重832.84千克，为国家一级文物。',
    era: '公元前13世纪',
    location: '河南安阳',
    museum: '中国国家博物馆',
    discoveryYear: '1939年',
    significance: [
      '是迄今为止中国出土的最大的商代青铜器',
      '铸造工艺精湛，反映了商代青铜铸造技术的最高水平',
      '器身饰有精美的兽面纹，具有浓郁的商代艺术风格'
    ],
    relatedRelics: ['105', '109']
  },
  {
    id: '102',
    name: '秦始皇兵马俑',
    dynasty: '秦代',
    category: '陶器',
    color: '#B87333',
    image: 'https://picsum.photos/id/338/800/600',
    description: '兵马俑，即秦始皇兵马俑，亦简称秦兵马俑或秦俑，第一批全国重点文物保护单位，第一批中国世界遗产，位于今陕西省西安市临潼区秦始皇陵以东1.5千米处。',
    era: '公元前210年',
    location: '陕西西安',
    museum: '秦始皇兵马俑博物馆',
    discoveryYear: '1974年',
    significance: [
      '世界上规模最大的古代军事博物馆',
      '被誉为"世界第八大奇迹"',
      '展现了秦代的军事、艺术和科技成就'
    ]
  },
  {
    id: '103',
    name: '莫高窟壁画',
    dynasty: '魏晋至元代',
    category: '绘画',
    color: '#E34234',
    image: 'https://picsum.photos/id/43/800/600',
    description: '敦煌莫高窟始建于十六国的前秦时期，历经十六国、北朝、隋、唐、五代、西夏、元等历代的修建，有洞窟735个，壁画4.5万平方米、泥质彩塑2415尊。',
    era: '公元366年-1368年',
    location: '甘肃敦煌',
    museum: '敦煌研究院',
    discoveryYear: '1900年(被重新发现)',
    significance: [
      '世界上现存规模最大、内容最丰富的佛教艺术圣地',
      '被称为"东方艺术明珠"',
      '集建筑、绘画、雕塑于一体的艺术宝库'
    ]
  },
  {
    id: '104',
    name: '唐三彩',
    dynasty: '唐代',
    category: '陶器',
    color: '#B87333',
    image: 'https://picsum.photos/id/24/800/600',
    description: '唐三彩是盛行于唐代的一种低温釉陶器，主要用作陪葬品，以黄、绿、白三色为主，所以被称为"唐三彩"。',
    era: '公元618年-907年',
    location: '河南洛阳、陕西西安等地',
    museum: '中国国家博物馆',
    discoveryYear: '20世纪初',
    significance: [
      '唐代陶瓷艺术的代表作',
      '具有鲜明的唐代特色和极高的艺术价值',
      '反映了唐代社会生活和审美情趣'
    ]
  },
  {
    id: '105',
    name: '越王勾践剑',
    dynasty: '春秋晚期',
    category: '青铜器',
    color: '#CD7F32',
    image: 'https://picsum.photos/id/65/800/600',
    description: '越王勾践剑是中国春秋晚期越国的青铜宝剑，1965年在湖北江陵望山1号墓出土，是中国国宝级文物。',
    era: '公元前496年-公元前465年',
    location: '湖北江陵',
    museum: '湖北省博物馆',
    discoveryYear: '1965年',
    significance: [
      '中国古代青铜冶炼与锻造工艺的杰出代表',
      '保存完好，寒光逼人，锋利无比，历经两千余年不锈',
      '铭文"越王鸠浅"为文献记载中的越王勾践'
    ],
    relatedRelics: ['101']
  },
  {
    id: '106',
    name: '马踏飞燕',
    dynasty: '东汉',
    category: '青铜器',
    color: '#CD7F32',
    image: 'https://picsum.photos/id/98/800/600',
    description: '马踏飞燕，又称"马超龙雀"或"铜奔马"，是中国汉代青铜器艺术的珍品，1969年出土于甘肃武威雷台汉墓。',
    era: '公元东汉',
    location: '甘肃武威',
    museum: '甘肃省博物馆',
    discoveryYear: '1969年',
    significance: [
      '中国旅游标志，象征中国旅游业',
      '造型生动，充满活力，体现了汉代青铜工艺的高超水平',
      '反映了古代丝绸之路的繁荣与文化交流'
    ]
  },
  {
    id: '107',
    name: '清明上河图',
    dynasty: '北宋',
    category: '绘画',
    color: '#E34234',
    image: 'https://picsum.photos/id/28/800/600',
    description: '《清明上河图》是北宋画家张择端创作的一幅风俗画，生动描绘了北宋都城汴京（今河南开封）清明时节的繁荣景象。',
    era: '公元1085年-1145年',
    location: '原藏于宋徽宗内府',
    museum: '故宫博物院',
    discoveryYear: '宋代',
    significance: [
      '中国十大传世名画之一',
      '真实反映了北宋都城的城市面貌和社会生活',
      '具有极高的历史价值和艺术价值'
    ]
  },
  {
    id: '108',
    name: '富春山居图',
    dynasty: '元代',
    category: '绘画',
    color: '#E34234',
    image: 'https://picsum.photos/id/42/800/600',
    description: '《富春山居图》是元代画家黄公望创作的一幅山水画长卷，描绘了浙江富春江两岸的自然风光。',
    era: '公元1350年',
    location: '原藏于明代内府',
    museum: '台北故宫博物院、浙江省博物馆',
    discoveryYear: '元代',
    significance: [
      '中国十大传世名画之一',
      '"南宗山水画"的代表作',
      '经历"焚毁重圆"的传奇历史'
    ]
  },
  {
    id: '109',
    name: '皿方罍',
    dynasty: '西周',
    category: '青铜器',
    color: '#CD7F32',
    image: 'https://picsum.photos/id/70/800/600',
    description: '皿方罍是西周早期的青铜礼器，1976年在陕西扶风出土，为国家一级文物。',
    era: '公元前11世纪',
    location: '陕西扶风',
    museum: '陕西历史博物馆',
    discoveryYear: '1976年',
    significance: [
      '西周礼制文化的重要代表',
      '铭文记载了西周初年周公平定东方三监之乱的历史',
      '具有重要的历史价值和艺术价值'
    ],
    relatedRelics: ['101']
  },
  {
    id: '110',
    name: '粉彩花卉纹瓷瓶',
    dynasty: '清代',
    category: '瓷器',
    color: '#4682B4',
    image: 'https://picsum.photos/id/112/800/600',
    description: '清代康熙年间的粉彩瓷器，瓶身绘制精美花卉图案，代表了清代瓷器的高超工艺。',
    era: '公元1662年-1722年',
    location: '江西景德镇',
    museum: '故宫博物院',
    discoveryYear: '清代',
    significance: [
      '清代瓷器艺术的杰出代表',
      '粉彩工艺的代表作品',
      '展现了中国古代瓷器制作的精湛技艺'
    ]
  },
];

// 精选文物
export const featuredRelics: Relic[] = [
  relicsData[0], // 后母戊鼎
  relicsData[1], // 秦始皇兵马俑
  relicsData[2], // 莫高窟壁画
];

// 文物分类
export const categories: Category[] = [
  { id: 'all', name: '全部', icon: '🏛️', description: '所有类型的文物', color: '#808080' },
  { id: '青铜器', name: '青铜器', icon: '🔔', description: '中国古代青铜器是指用青铜制作的器物，源于新石器时代晚期，盛于商周时期。', color: '#CD7F32' },
  { id: '玉器', name: '玉器', icon: '💎', description: '中国玉器有着悠久的历史，从新石器时代至今已有8000多年的历史。', color: '#90EE90' },
  { id: '陶器', name: '陶器', icon: '🏺', description: '陶器是用黏土烧制的器物，是人类最早使用的器皿之一。', color: '#D2691E' },
  { id: '瓷器', name: '瓷器', icon: '🍶', description: '瓷器是中国古代劳动人民的伟大发明，被誉为"中国的骄傲"。', color: '#4682B4' },
  { id: '书画', name: '书画', icon: '🖌️', description: '中国书画是指中国传统的书法和绘画艺术。', color: '#000000' },
  { id: '织物', name: '织物', icon: '🧵', description: '中国织物艺术有着悠久的历史，包括丝绸、刺绣、锦缎等。', color: '#FFB6C1' },
  { id: '雕刻', name: '雕刻', icon: '🗿', description: '雕刻艺术是中国传统艺术的重要组成部分，包括石雕、木雕、玉雕等。', color: '#808080' },
  { id: '绘画', name: '绘画', icon: '🎨', description: '中国绘画有着悠久的历史，主要分为山水画、人物画、花鸟画等类别。', color: '#8B4513' },
];

// 朝代数据
export const dynasties: Dynasty[] = [
  { id: 'all', name: '全部', description: '所有朝代的文物' },
  { id: '史前', name: '史前', period: '约前10000年-前2070年', startYear: -10000, endYear: -2070, description: '包括旧石器时代、新石器时代等史前文明时期' },
  { id: '夏商周', name: '夏商周', period: '约前2070年-前221年', startYear: -2070, endYear: -221, description: '中国早期的三个朝代，奴隶社会时期' },
  { id: '秦汉', name: '秦汉', period: '前221年-220年', startYear: -221, endYear: 220, description: '中国历史上第一个统一的多民族的中央集权国家的建立和发展时期' },
  { id: '魏晋南北朝', name: '魏晋南北朝', period: '220年-589年', startYear: 220, endYear: 589, description: '中国历史上的分裂与动荡时期，也是文化融合与发展的重要阶段' },
  { id: '隋唐', name: '隋唐', period: '581年-907年', startYear: 581, endYear: 907, description: '中国封建社会的繁荣时期，特别是唐朝是中国古代最为强盛的朝代之一' },
  { id: '宋元', name: '宋元', period: '960年-1368年', startYear: 960, endYear: 1368, description: '宋代经济文化发达，元代是中国历史上第一个由少数民族建立的统一王朝' },
  { id: '明清', name: '明清', period: '1368年-1911年', startYear: 1368, endYear: 1911, description: '中国封建社会的最后两个朝代，也是中国封建社会的鼎盛时期和衰落时期' },
];

// 工具函数：根据ID获取文物
export const getRelicById = (id: string): Relic | undefined => {
  return relicsData.find(relic => relic.id === id);
};

// 工具函数：根据分类获取文物
export const getRelicsByCategory = (categoryId: string): Relic[] => {
  if (categoryId === 'all') {
    return relicsData;
  }
  return relicsData.filter(relic => relic.category === categoryId);
};

// 工具函数：根据朝代获取文物
export const getRelicsByDynasty = (dynastyId: string): Relic[] => {
  if (dynastyId === 'allDynasty' || dynastyId === 'all') {
    return relicsData;
  }
  
  // 获取对应的朝代对象
  const dynasty = dynasties.find(d => d.id === dynastyId);
  if (!dynasty) return [];
  
  return relicsData.filter(relic => {
    // 精确匹配朝代名称
    if (relic.dynasty.includes(dynasty.name)) return true;
    
    // 朝代描述包含文物朝代
    if (dynasty.description?.includes(relic.dynasty)) return true;
    
    // 特殊处理: 秦汉朝代应该匹配秦代和汉代的文物
    if (dynasty.id === '秦汉' && (relic.dynasty.includes('秦') || relic.dynasty.includes('汉'))) return true;
    
    // 特殊处理: 宋元朝代应该匹配宋代和元代的文物
    if (dynasty.id === '宋元' && (relic.dynasty.includes('宋') || relic.dynasty.includes('元'))) return true;
    
    // 特殊处理: 魏晋南北朝应该匹配相关朝代
    if (dynasty.id === '魏晋南北朝' && 
        (relic.dynasty.includes('魏') || 
         relic.dynasty.includes('晋') || 
         relic.dynasty.includes('南') || 
         relic.dynasty.includes('北'))) return true;
         
    // 特殊处理: 夏商周
    if (dynasty.id === '夏商周' && 
        (relic.dynasty.includes('夏') || 
         relic.dynasty.includes('商') || 
         relic.dynasty.includes('周'))) return true;
         
    return false;
  });
};

// 工具函数：根据多个过滤条件获取文物
export const getFilteredRelics = (options: FilterOptions): Relic[] => {
  return relicsData.filter(relic => {
    // 分类筛选
    const matchesCategory = !options.category || options.category === 'all' || relic.category === options.category;
    
    // 朝代筛选
    let matchesDynasty = true;
    if (options.dynasty && options.dynasty !== 'allDynasty' && options.dynasty !== 'all') {
      const dynasty = dynasties.find(d => d.id === options.dynasty);
      if (dynasty) {
        matchesDynasty = relic.dynasty.includes(dynasty.name) || 
                        (dynasty.description ? dynasty.description.includes(relic.dynasty) : false);
                        
        // 特殊处理各个朝代组合
        if (!matchesDynasty) {
          if (dynasty.id === '秦汉' && (relic.dynasty.includes('秦') || relic.dynasty.includes('汉'))) {
            matchesDynasty = true;
          } else if (dynasty.id === '宋元' && (relic.dynasty.includes('宋') || relic.dynasty.includes('元'))) {
            matchesDynasty = true;
          } else if (dynasty.id === '魏晋南北朝' && 
                    (relic.dynasty.includes('魏') || 
                     relic.dynasty.includes('晋') || 
                     relic.dynasty.includes('南') || 
                     relic.dynasty.includes('北'))) {
            matchesDynasty = true;
          } else if (dynasty.id === '夏商周' && 
                    (relic.dynasty.includes('夏') || 
                     relic.dynasty.includes('商') || 
                     relic.dynasty.includes('周'))) {
            matchesDynasty = true;
          }
        }
      } else {
        matchesDynasty = false;
      }
    }
    
    // 搜索文本筛选
    const matchesSearch = !options.searchText || 
      relic.name.toLowerCase().includes(options.searchText.toLowerCase()) ||
      relic.dynasty.toLowerCase().includes(options.searchText.toLowerCase()) ||
      (relic.description && relic.description.toLowerCase().includes(options.searchText.toLowerCase()));
    
    return matchesCategory && matchesDynasty && matchesSearch;
  });
};

// 工具函数：获取相关文物
export const getRelatedRelics = (relicId: string): Relic[] => {
  const relic = getRelicById(relicId);
  if (!relic || !relic.relatedRelics || relic.relatedRelics.length === 0) {
    // 如果没有明确指定，则返回同类别的其他文物
    return relicsData
      .filter(r => r.id !== relicId && r.category === relic?.category)
      .slice(0, 3);
  }
  
  return relicsData.filter(r => relic.relatedRelics?.includes(r.id));
}; 