import React, { useState, useEffect } from 'react';
import { 
  View, Text, TouchableOpacity, StyleSheet, 
  Dimensions, Animated 
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';

// 定义类型
interface Dialog {
  id: string;
  character: string;
  text: string;
  emotion?: string;
}

interface InteractionPoint {
  id: string;
  position: { x: number; y: number };
  type: 'item' | 'character' | 'scene';
  hintText: string;
  nextScene?: string;
  triggerDialog?: string;
}

interface Scene {
  id: string;
  backgroundColor: string;
  dialogs: Dialog[];
  interactionPoints: InteractionPoint[];
}

interface Story {
  id: string;
  relicId: string;
  title: string;
  scenes: Scene[];
}

interface StoriesData {
  [key: string]: Story;
}

// 模拟故事数据
const mockStories: StoriesData = {
  '101': {
    id: '101',
    relicId: '101',
    title: '鼎铸王朝',
    scenes: [
      {
        id: 'scene1',
        backgroundColor: '#8D6E63',
        dialogs: [
          { id: 'd1', character: '旁白', text: '公元前13世纪，商王朝鼎盛时期，王室贵族正在筹备一场重要的祭祀仪式...' },
          { id: 'd2', character: '铸造大师', text: '陛下，您要求的大型祭祀青铜鼎已经设计完成，请过目。' },
          { id: 'd3', character: '商王', text: '很好，这个鼎将用于祭祀我们的祖先，一定要铸造得庄重威严。' },
          { id: 'd4', character: '铸造大师', text: '请放心，我们将使用最好的青铜材料，采用最精湛的铸造技艺。' },
          { id: 'd5', character: '旁白', text: '点击画面中的亮点，探索更多内容...' },
        ],
        interactionPoints: [
          { 
            id: 'ip1', 
            position: { x: 100, y: 200 }, 
            type: 'item', 
            hintText: '青铜矿石',
            triggerDialog: 'mineral' 
          },
          { 
            id: 'ip2', 
            position: { x: 250, y: 150 }, 
            type: 'item', 
            hintText: '铸造模具',
            triggerDialog: 'mold' 
          },
          { 
            id: 'ip3', 
            position: { x: 180, y: 300 }, 
            type: 'scene', 
            hintText: '进入铸造车间',
            nextScene: 'scene2' 
          },
        ]
      },
      {
        id: 'scene2',
        backgroundColor: '#A1887F',
        dialogs: [
          { id: 'd6', character: '旁白', text: '铸造车间内，工匠们正在紧张地工作...' },
          { id: 'd7', character: '铸造大师', text: '所有人注意！熔炉温度已经达到要求，准备浇铸！' },
          { id: 'd8', character: '学徒', text: '师父，这么大的鼎，我们真的能铸造成功吗？' },
          { id: 'd9', character: '铸造大师', text: '我们掌握了祖先传下来的分段铸造技术，一定能成功。这将是商王朝最伟大的青铜器！' },
          { id: 'd10', character: '旁白', text: '点击画面中的亮点，探索更多内容...' },
        ],
        interactionPoints: [
          { 
            id: 'ip4', 
            position: { x: 120, y: 180 }, 
            type: 'item', 
            hintText: '熔炉',
            triggerDialog: 'furnace' 
          },
          { 
            id: 'ip5', 
            position: { x: 220, y: 250 }, 
            type: 'character', 
            hintText: '与学徒交谈',
            triggerDialog: 'apprentice' 
          },
          { 
            id: 'ip6', 
            position: { x: 50, y: 300 }, 
            type: 'scene', 
            hintText: '返回前一场景',
            nextScene: 'scene1' 
          },
        ]
      }
    ]
  },
  '102': {
    id: '102',
    relicId: '102',
    title: '兵马俑传奇',
    scenes: [
      {
        id: 'scene1',
        backgroundColor: '#795548',
        dialogs: [
          { id: 'd1', character: '旁白', text: '公元前221年，秦始皇统一六国后，开始筹划自己的陵墓...' },
          { id: 'd2', character: '秦始皇', text: '朕要建造一支永不腐朽的军队，守护我的灵魂进入永恒。' },
          { id: 'd3', character: '大臣', text: '陛下，我们将按照您的旨意，打造世界上最宏伟的陵墓和军阵。' },
          { id: 'd4', character: '工匠首领', text: '我们会复制真实士兵的样貌，每一个都不同，就像真正的军队一样。' },
          { id: 'd5', character: '旁白', text: '点击画面中的亮点，探索更多内容...' },
        ],
        interactionPoints: [
          { 
            id: 'ip1', 
            position: { x: 120, y: 250 }, 
            type: 'item', 
            hintText: '兵马俑模型',
            triggerDialog: 'terracotta_model' 
          },
          { 
            id: 'ip2', 
            position: { x: 230, y: 180 }, 
            type: 'character', 
            hintText: '与工匠交谈',
            triggerDialog: 'craftsman' 
          },
          { 
            id: 'ip3', 
            position: { x: 180, y: 300 }, 
            type: 'scene', 
            hintText: '前往兵马俑坑',
            nextScene: 'scene2' 
          },
        ]
      },
      {
        id: 'scene2',
        backgroundColor: '#5D4037',
        dialogs: [
          { id: 'd6', character: '旁白', text: '巨大的坑道内，数以千计的陶俑整齐排列，场面壮观震撼...' },
          { id: 'd7', character: '工匠首领', text: '陛下请看，这些陶俑按照真实军阵排列，有步兵、骑兵、弓箭手和将军。' },
          { id: 'd8', character: '秦始皇', text: '很好，朕要这支军队世世代代守护秦国的江山。' },
          { id: 'd9', character: '大臣', text: '每个士兵都带有武器，有的甚至涂上了彩绘，栩栩如生！' },
          { id: 'd10', character: '旁白', text: '点击画面中的亮点，探索更多内容...' },
        ],
        interactionPoints: [
          { 
            id: 'ip4', 
            position: { x: 150, y: 200 }, 
            type: 'item', 
            hintText: '陶俑武器',
            triggerDialog: 'weapons' 
          },
          { 
            id: 'ip5', 
            position: { x: 250, y: 220 }, 
            type: 'character', 
            hintText: '观察将军俑',
            triggerDialog: 'general' 
          },
          { 
            id: 'ip6', 
            position: { x: 50, y: 300 }, 
            type: 'scene', 
            hintText: '返回前一场景',
            nextScene: 'scene1' 
          },
        ]
      }
    ]
  },
  '103': {
    id: '103',
    relicId: '103',
    title: '莫高窟的艺术瑰宝',
    scenes: [
      {
        id: 'scene1',
        backgroundColor: '#5C6BC0',
        dialogs: [
          { id: 'd1', character: '旁白', text: '公元366年，一位名叫乐僔的僧人途经鸣沙山，忽见金光万道，如千佛现身...' },
          { id: 'd2', character: '乐僔', text: '这是佛陀的启示，我要在此开凿佛窟，传扬佛法。' },
          { id: 'd3', character: '当地居民', text: '高僧，这里是丝绸之路要道，我们也愿意出力，帮助传播佛法。' },
          { id: 'd4', character: '乐僔', text: '我们将把佛的智慧和慈悲，通过壁画和彩塑记录下来，让后人得见。' },
          { id: 'd5', character: '旁白', text: '点击画面中的亮点，探索更多内容...' },
        ],
        interactionPoints: [
          { 
            id: 'ip1', 
            position: { x: 120, y: 200 }, 
            type: 'item', 
            hintText: '凿壁工具',
            triggerDialog: 'tools' 
          },
          { 
            id: 'ip2', 
            position: { x: 220, y: 150 }, 
            type: 'character', 
            hintText: '与乐僔交谈',
            triggerDialog: 'monk' 
          },
          { 
            id: 'ip3', 
            position: { x: 180, y: 300 }, 
            type: 'scene', 
            hintText: '进入洞窟',
            nextScene: 'scene2' 
          },
        ]
      },
      {
        id: 'scene2',
        backgroundColor: '#3F51B5',
        dialogs: [
          { id: 'd6', character: '旁白', text: '几百年后的唐代，莫高窟已发展成为壮观的佛教艺术中心...' },
          { id: 'd7', character: '画师', text: '请看这面壁画，我们用天然矿物颜料绘制，能保持千年不褪色。' },
          { id: 'd8', character: '僧人', text: '每个洞窟都讲述不同的佛经故事，是佛法的有形表现。' },
          { id: 'd9', character: '商人', text: '我沿丝绸之路而来，带来了西域的艺术风格，希望能融入到壁画中。' },
          { id: 'd10', character: '旁白', text: '点击画面中的亮点，探索更多内容...' },
        ],
        interactionPoints: [
          { 
            id: 'ip4', 
            position: { x: 150, y: 180 }, 
            type: 'item', 
            hintText: '壁画颜料',
            triggerDialog: 'pigments' 
          },
          { 
            id: 'ip5', 
            position: { x: 250, y: 220 }, 
            type: 'character', 
            hintText: '观察彩塑',
            triggerDialog: 'sculpture' 
          },
          { 
            id: 'ip6', 
            position: { x: 50, y: 300 }, 
            type: 'scene', 
            hintText: '返回前一场景',
            nextScene: 'scene1' 
          },
        ]
      }
    ]
  },
  '104': {
    id: '104',
    relicId: '104',
    title: '卧薪尝胆—越王勾践剑',
    scenes: [
      {
        id: 'scene1',
        backgroundColor: '#3A4732',
        dialogs: [
          { id: 'd1', character: '旁白', text: '公元前496年，越国国君勾践被吴王夫差击败后，决心打造一把无与伦比的宝剑，作为复国的象征...' },
          { id: 'd2', character: '越王勾践', text: '我虽被囚于吴国，但终有一日必将复国雪耻！这把剑将见证我的复仇！' },
          { id: 'd3', character: '铸剑大师', text: '陛下，依照您的要求，我们将采用特殊的青铜配方，打造一把前所未有的宝剑。' },
          { id: 'd4', character: '越王勾践', text: '这把剑不仅要锋利无比，还要历久不衰，流传后世，见证越国的荣耀！' },
          { id: 'd5', character: '旁白', text: '点击画面中的亮点，探索更多内容...' },
        ],
        interactionPoints: [
          { 
            id: 'ip1', 
            position: { x: 120, y: 200 }, 
            type: 'item', 
            hintText: '青铜原料',
            triggerDialog: 'bronze_material' 
          },
          { 
            id: 'ip2', 
            position: { x: 220, y: 150 }, 
            type: 'character', 
            hintText: '与铸剑师交谈',
            triggerDialog: 'sword_master' 
          },
          { 
            id: 'ip3', 
            position: { x: 180, y: 300 }, 
            type: 'scene', 
            hintText: '前往铸剑工坊',
            nextScene: 'scene2' 
          },
        ]
      },
      {
        id: 'scene2',
        backgroundColor: '#D98719',
        dialogs: [
          { id: 'd6', character: '旁白', text: '在热火朝天的铸剑工坊内，工匠们正在精心打造这把传世宝剑...' },
          { id: 'd7', character: '铸剑大师', text: '我们特别调整了铜和锡的比例，加入了少量铅和其他秘传材料，使剑体更加坚韧。' },
          { id: 'd8', character: '工匠', text: '大师，剑身的锻造已经完成，接下来将进行淬火和最后的打磨。' },
          { id: 'd9', character: '铸剑大师', text: '最后，我们将在剑身上铭刻"越王勾践自作用剑"，表明这是越王亲自命制的佩剑！' },
          { id: 'd10', character: '旁白', text: '点击画面中的亮点，探索更多内容...' },
        ],
        interactionPoints: [
          { 
            id: 'ip4', 
            position: { x: 150, y: 180 }, 
            type: 'item', 
            hintText: '铸剑炉',
            triggerDialog: 'sword_furnace' 
          },
          { 
            id: 'ip5', 
            position: { x: 250, y: 220 }, 
            type: 'item', 
            hintText: '成品剑',
            triggerDialog: 'finished_sword' 
          },
          { 
            id: 'ip6', 
            position: { x: 50, y: 300 }, 
            type: 'scene', 
            hintText: '返回前一场景',
            nextScene: 'scene1' 
          },
        ]
      }
    ]
  },
  '105': {
    id: '105',
    relicId: '105',
    title: '唐三彩的彩釉艺术',
    scenes: [
      {
        id: 'scene1',
        backgroundColor: '#FF9800',
        dialogs: [
          { id: 'd1', character: '旁白', text: '唐代长安城，一位陶器工匠正在向徒弟传授三彩陶器的制作秘诀...' },
          { id: 'd2', character: '陶艺大师', text: '唐三彩不同于普通陶器，需要特殊的釉料和烧制工艺。' },
          { id: 'd3', character: '学徒', text: '师父，这些彩釉为何如此鲜艳夺目？' },
          { id: 'd4', character: '陶艺大师', text: '秘密在于铜、铁、钴等金属氧化物，经过特殊工艺烧制，呈现出不同的色彩。' },
          { id: 'd5', character: '旁白', text: '点击画面中的亮点，探索更多内容...' },
        ],
        interactionPoints: [
          { 
            id: 'ip1', 
            position: { x: 100, y: 200 }, 
            type: 'item', 
            hintText: '彩釉颜料',
            triggerDialog: 'glaze' 
          },
          { 
            id: 'ip2', 
            position: { x: 250, y: 150 }, 
            type: 'item', 
            hintText: '陶土模型',
            triggerDialog: 'clay_model' 
          },
          { 
            id: 'ip3', 
            position: { x: 180, y: 300 }, 
            type: 'scene', 
            hintText: '前往窑炉',
            nextScene: 'scene2' 
          },
        ]
      },
      {
        id: 'scene2',
        backgroundColor: '#FF5722',
        dialogs: [
          { id: 'd6', character: '旁白', text: '陶窑前，工匠们正在小心地装窑，准备烧制精美的唐三彩...' },
          { id: 'd7', character: '陶艺大师', text: '窑温控制至关重要，太高会使釉料过度融化，太低则无法形成流釉效果。' },
          { id: 'd8', character: '学徒', text: '这些器物会送往何处？' },
          { id: 'd9', character: '陶艺大师', text: '大多数会成为贵族的随葬品，或赠送给外国使节，展示我大唐的工艺水平！' },
          { id: 'd10', character: '旁白', text: '点击画面中的亮点，探索更多内容...' },
        ],
        interactionPoints: [
          { 
            id: 'ip4', 
            position: { x: 120, y: 180 }, 
            type: 'item', 
            hintText: '陶窑',
            triggerDialog: 'kiln' 
          },
          { 
            id: 'ip5', 
            position: { x: 220, y: 250 }, 
            type: 'character', 
            hintText: '与学徒交谈',
            triggerDialog: 'ceramics_apprentice' 
          },
          { 
            id: 'ip6', 
            position: { x: 50, y: 300 }, 
            type: 'scene', 
            hintText: '返回前一场景',
            nextScene: 'scene1' 
          },
        ]
      }
    ]
  },
  '106': {
    id: '106',
    relicId: '106',
    title: '古都明珠·华夏宝库',
    scenes: [
      {
        id: 'scene1',
        backgroundColor: '#A37B45',
        dialogs: [
          { id: 'd1', character: '旁白', text: '陕西历史博物馆门前，一对父子正准备参观这座中国第一座大型现代化国家级历史博物馆...' },
          { id: 'd2', character: '博物馆讲解员', text: '欢迎来到陕西历史博物馆，这里收藏了陕西地区从远古到近代的珍贵文物，是了解中华文明的重要窗口。' },
          { id: 'd3', character: '小男孩', text: '爸爸，博物馆里有什么好玩的东西？' },
          { id: 'd4', character: '父亲', text: '这里有许多珍贵的历史文物，见证了中国几千年的历史。我们可以看到商周的青铜器、秦代的兵马俑、唐代的金银器和壁画，了解古人的智慧和创造力。' },
          { id: 'd5', character: '旁白', text: '点击画面中的亮点，探索更多内容...' },
        ],
        interactionPoints: [
          { 
            id: 'ip1', 
            position: { x: 120, y: 200 }, 
            type: 'item', 
            hintText: '博物馆建筑',
            triggerDialog: 'museum_building' 
          },
          { 
            id: 'ip2', 
            position: { x: 220, y: 150 }, 
            type: 'character', 
            hintText: '与讲解员交谈',
            triggerDialog: 'museum_guide' 
          },
          { 
            id: 'ip3', 
            position: { x: 180, y: 300 }, 
            type: 'scene', 
            hintText: '进入展厅',
            nextScene: 'scene2' 
          },
        ]
      },
      {
        id: 'scene2',
        backgroundColor: '#765234',
        dialogs: [
          { id: 'd6', character: '旁白', text: '博物馆的精品文物展区内，游客们正在欣赏陕西地区出土的珍贵文物...' },
          { id: 'd7', character: '博物馆讲解员', text: '这个展区展示了我馆的镇馆之宝，包括四羊方尊、鎏金铜蚕和唐代金银器等，都是中华文明的重要见证。' },
          { id: 'd8', character: '小男孩', text: '哇，这个金色的小蚕好漂亮！它是干什么用的？' },
          { id: 'd9', character: '博物馆讲解员', text: '这是西汉时期的鎏金铜蚕，反映了当时蚕桑丝织业的发达。古人认为蚕是神圣的，象征着繁衍生息和丰收，所以制作了这样精美的艺术品。' },
          { id: 'd10', character: '旁白', text: '点击画面中的亮点，探索更多内容...' },
        ],
        interactionPoints: [
          { 
            id: 'ip4', 
            position: { x: 150, y: 180 }, 
            type: 'item', 
            hintText: '四羊方尊',
            triggerDialog: 'four_sheep_vessel' 
          },
          { 
            id: 'ip5', 
            position: { x: 220, y: 250 }, 
            type: 'item', 
            hintText: '鎏金铜蚕',
            triggerDialog: 'gilded_bronze_silkworm' 
          },
          { 
            id: 'ip6', 
            position: { x: 90, y: 220 }, 
            type: 'item', 
            hintText: '唐代金银器',
            triggerDialog: 'tang_gold_silver' 
          },
          { 
            id: 'ip7', 
            position: { x: 50, y: 300 }, 
            type: 'scene', 
            hintText: '返回前一场景',
            nextScene: 'scene1' 
          },
        ]
      }
    ]
  },
  '107': {
    id: '107',
    relicId: '107',
    title: '长沙马王堆汉墓奇珍',
    scenes: [
      {
        id: 'scene1',
        backgroundColor: '#5D432C',
        dialogs: [
          { id: 'd1', character: '旁白', text: '1972年冬，长沙郊区一座不起眼的土丘下，考古队正在进行紧张的发掘工作...' },
          { id: 'd2', character: '考古队长', text: '根据前期勘测，这里可能是一座西汉时期的墓葬，大家小心作业，注意保护墓室结构。' },
          { id: 'd3', character: '考古队员', text: '队长！我们发现了一个完整的木椁，木质保存得非常好！' },
          { id: 'd4', character: '考古队长', text: '太不可思议了！这座墓已有两千多年历史，木质结构却如此完好。可能是地下水位高，加上多层密封，使墓室内形成了隔绝空气的环境。' },
          { id: 'd5', character: '旁白', text: '点击画面中的亮点，探索更多内容...' },
        ],
        interactionPoints: [
          { 
            id: 'ip1', 
            position: { x: 120, y: 200 }, 
            type: 'item', 
            hintText: '木椁结构',
            triggerDialog: 'wooden_chamber' 
          },
          { 
            id: 'ip2', 
            position: { x: 220, y: 150 }, 
            type: 'character', 
            hintText: '与考古队员交谈',
            triggerDialog: 'archaeologist' 
          },
          { 
            id: 'ip3', 
            position: { x: 180, y: 300 }, 
            type: 'scene', 
            hintText: '进入文物室',
            nextScene: 'scene2' 
          },
        ]
      },
      {
        id: 'scene2',
        backgroundColor: '#B5A990',
        dialogs: [
          { id: 'd6', character: '旁白', text: '考古室内，专家们正在小心翼翼地整理出土文物，其中尤为惊人的是保存完好的女性遗体...' },
          { id: 'd7', character: '研究员', text: '这具遗体保存状态之好令人难以置信，内脏器官依然完整，皮肤有弹性，关节可以活动！' },
          { id: 'd8', character: '文物保护专家', text: '我们发现了大量丝织品，包括一件极其精美的素纱单衣，薄如蝉翼，重量只有49克！' },
          { id: 'd9', character: '研究员', text: '还有这卷T形帛画，描绘了当时人们对宇宙和冥界的理解，是研究汉代思想文化的珍贵资料。' },
          { id: 'd10', character: '旁白', text: '点击画面中的亮点，探索更多内容...' },
        ],
        interactionPoints: [
          { 
            id: 'ip4', 
            position: { x: 150, y: 180 }, 
            type: 'item', 
            hintText: '辛追夫人遗体',
            triggerDialog: 'lady_body' 
          },
          { 
            id: 'ip5', 
            position: { x: 220, y: 250 }, 
            type: 'item', 
            hintText: '素纱单衣',
            triggerDialog: 'silk_dress' 
          },
          { 
            id: 'ip6', 
            position: { x: 90, y: 220 }, 
            type: 'item', 
            hintText: 'T形帛画',
            triggerDialog: 'silk_painting' 
          },
          { 
            id: 'ip7', 
            position: { x: 50, y: 300 }, 
            type: 'scene', 
            hintText: '返回前一场景',
            nextScene: 'scene1' 
          },
        ]
      }
    ]
  },
  '108': {
    id: '108',
    relicId: '108',
    title: '丝路明珠·铜马奔腾',
    scenes: [
      {
        id: 'scene1',
        backgroundColor: '#B8894D',
        dialogs: [
          { id: 'd1', character: '旁白', text: '甘肃省博物馆内，一位老馆长正在向参观者介绍镇馆之宝——铜奔马...' },
          { id: 'd2', character: '博物馆馆长', text: '这件"马踏飞燕"，又称"铜奔马"，是1969年在武威雷台汉墓出土的国宝级文物，被选为中国旅游标志。' },
          { id: 'd3', character: '小女孩', text: '爷爷，这匹马真漂亮！它为什么踩着一只小鸟呢？' },
          { id: 'd4', character: '博物馆馆长', text: '这是艺术的表现手法，展示了马匹奔腾的速度和力量。这匹铜马只有一只蹄子着地，其余三蹄腾空，体现了东汉工匠高超的铸造技艺和对平衡的精准把握。' },
          { id: 'd5', character: '旁白', text: '点击画面中的亮点，探索更多内容...' },
        ],
        interactionPoints: [
          { 
            id: 'ip1', 
            position: { x: 120, y: 200 }, 
            type: 'item', 
            hintText: '铜奔马',
            triggerDialog: 'bronze_horse' 
          },
          { 
            id: 'ip2', 
            position: { x: 220, y: 150 }, 
            type: 'character', 
            hintText: '与馆长交谈',
            triggerDialog: 'museum_director' 
          },
          { 
            id: 'ip3', 
            position: { x: 180, y: 300 }, 
            type: 'scene', 
            hintText: '参观彩陶展厅',
            nextScene: 'scene2' 
          },
        ]
      },
      {
        id: 'scene2',
        backgroundColor: '#CD853F',
        dialogs: [
          { id: 'd6', character: '旁白', text: '博物馆的彩陶展厅内，各种精美的马家窑文化彩陶展现着五千年前先民的艺术智慧...' },
          { id: 'd7', character: '博物馆馆长', text: '甘肃是中国彩陶文化的发源地之一，这些距今约5000年的马家窑文化彩陶，用黑色和红色颜料绘制了各种精美图案。' },
          { id: 'd8', character: '游客', text: '这些纹样看起来很像现代艺术，真难以想象是几千年前的作品！它们有什么特殊含义吗？' },
          { id: 'd9', character: '博物馆馆长', text: '彩陶上的旋涡纹可能代表水或云，鱼纹和鸟纹则反映了先民对自然的观察和崇拜。这些图案不仅美观，也蕴含着先民对宇宙和生命的理解。' },
          { id: 'd10', character: '旁白', text: '点击画面中的亮点，探索更多内容...' },
        ],
        interactionPoints: [
          { 
            id: 'ip4', 
            position: { x: 150, y: 180 }, 
            type: 'item', 
            hintText: '马家窑彩陶',
            triggerDialog: 'painted_pottery' 
          },
          { 
            id: 'ip5', 
            position: { x: 220, y: 250 }, 
            type: 'item', 
            hintText: '丝绸之路文物',
            triggerDialog: 'silk_road_artifacts' 
          },
          { 
            id: 'ip6', 
            position: { x: 50, y: 300 }, 
            type: 'scene', 
            hintText: '返回前一场景',
            nextScene: 'scene1' 
          },
        ]
      }
    ]
  }
};

// 额外对话内容
const extraDialogs: {[key: string]: Dialog} = {
  // 后母戊鼎相关对话
  'mineral': { id: 'ex1', character: '铸造大师', text: '这是从远方运来的优质铜矿石，含铜量很高，还混合了锡和铅，铸造出的青铜器更加坚固耐用。' },
  'mold': { id: 'ex2', character: '铸造大师', text: '这是特制的陶范，我们采用分段铸造法，先铸造鼎的各个部分，再组合在一起。这样可以铸造出更大更复杂的器物。' },
  'furnace': { id: 'ex3', character: '铸造大师', text: '这座熔炉温度可以达到1100度以上，足以熔化铜锡合金。看那炽热的金属液体，宛如流动的太阳！' },
  'apprentice': { id: 'ex4', character: '学徒', text: '我从小就在师父门下学习铸造技艺，这次能参与铸造如此重要的礼器，是莫大的荣幸！我一定会专心致志，不辜负师父的期望。' },
  
  // 兵马俑相关对话
  'terracotta_model': { id: 'ex5', character: '工匠首领', text: '每个兵马俑都有不同的面容和表情，我们参考了真实士兵的样貌。先用黄土制作胎体，再精心塑造五官和服饰细节。' },
  'craftsman': { id: 'ex6', character: '工匠', text: '制作这些陶俑非常费时，每个都需要多位工匠合作完成。完成后还要上彩，虽然现在很多彩绘已经脱落，但当时是非常鲜艳的。' },
  'weapons': { id: 'ex7', character: '大臣', text: '这些武器是真正的兵器，有铜剑、铜戟、弓箭等，都经过特殊处理，防止锈蚀。有些甚至涂有铬盐，这在当时是非常先进的技术。' },
  'general': { id: 'ex8', character: '工匠首领', text: '将军俑比普通士兵更高大，穿着铠甲，显示其尊贵地位。他们通常位于军阵的指挥位置，统领着整支部队。' },
  
  // 莫高窟相关对话
  'tools': { id: 'ex9', character: '工匠', text: '开凿洞窟需要各种工具，有凿子、锤子和特制的刮刀。在坚硬的岩壁上开凿需要极大的耐心和技巧。' },
  'monk': { id: 'ex10', character: '乐僔', text: '我希望通过这些洞窟和壁画，将佛法传播给路过这里的旅人和商队。敦煌位于丝绸之路要道，是传播佛法的理想之地。' },
  'pigments': { id: 'ex11', character: '画师', text: '我们使用的颜料多是矿物质，如朱砂、孔雀石和青金石，研磨成粉后与胶质混合。这些颜料能抵抗干燥的沙漠气候，千年不褪色。' },
  'sculpture': { id: 'ex12', character: '僧人', text: '每个洞窟中央通常有一尊或多尊佛像，周围是菩萨和弟子。这些彩塑由泥塑而成，再上色彩绘，栩栩如生地展现佛陀的庄严。' },
  
  // 三星堆相关对话
  'mask': { id: 'ex13', character: '工匠', text: '这个面具采用失蜡法铸造，先用蜡制作模型，然后包裹陶土，烘干后蜡熔化流出，再灌入青铜液。冷却后打开陶范，就得到了精美的青铜面具。' },
  'priest': { id: 'ex14', character: '祭司', text: '我们相信，戴上这个神圣的面具后，祭司就能与神灵沟通。面具上夸张的眼睛和耳朵，象征着超越凡人的视觉和听觉能力。' },
  'altar': { id: 'ex15', character: '祭司', text: '这座祭坛是我们与天神沟通的神圣场所。祭坛中央的火堆将燃烧整夜，把我们的祈祷送到天神那里。' },
  'crowd': { id: 'ex16', character: '旁白', text: '人们穿着最好的衣服参加祭祀，他们相信这场仪式能带来丰收和平安。在古代社会，宗教祭祀是凝聚社会的重要方式。' },
  
  // 唐三彩相关对话
  'glaze': { id: 'ex17', character: '陶艺大师', text: '唐三彩的釉料主要含有铜、铁、钴等金属氧化物。铜氧化物烧成绿色，铁氧化物烧成黄色或褐色，钴氧化物烧成蓝色。' },
  'clay_model': { id: 'ex18', character: '陶艺大师', text: '制作唐三彩先要塑造陶胎，用优质白色陶土揉制成型，再晾干。造型包括人物、动物和各种器皿，反映了唐代人的生活场景。' },
  'kiln': { id: 'ex19', character: '工匠', text: '唐三彩在800度左右的温度下烧制，这是低温釉陶器。釉料在这个温度下会融化流动，形成自然的流彩效果，每件作品都是独一无二的。' },
  'ceramics_apprentice': { id: 'ex20', character: '学徒', text: '虽然唐三彩主要用作随葬品，但制作工艺非常精湛。看这匹马的肌肉线条多么流畅，骆驼的神态多么生动，栩栩如生！' },

  // 越王勾践剑的额外对话
  bronze_material: { id: 'ex21', character: '铸剑大师', text: '这是我们精心挑选的青铜原料，含铜量约为97%，掺杂了少量的锡、铅和其他矿物质。我们的青铜配方是祖传秘方，可以使剑身坚硬锋利，同时保持良好的韧性，不易折断。' },
  
  sword_master: { id: 'ex22', character: '铸剑大师', text: '我从小学习铸剑技艺，已有三十余年。越王的这把剑，是我毕生铸造的巅峰之作。好剑需要匠心与耐心，如同越王复国之路，需要卧薪尝胆的韧性与智慧。' },
  
  sword_furnace: { id: 'ex23', character: '工匠', text: '这座铸剑炉温度可达1000度以上，足以熔化青铜材料。熔化后的青铜要倒入预先制作好的范模中，待冷却后取出毛坯，再进行细致打磨。铸剑最关键的是火候的掌控，就像治国理政，火候太猛则散，火候不足则不成。' },
  
  finished_sword: { id: 'ex24', character: '铸剑大师', text: '请看，这把剑身长55.7厘米，剑身上铭刻着"越王勾践自作用剑"八个字。剑身采用了特殊的铸造工艺，表面的菱形暗格纹既美观又增加了剑的强度。这把剑在2500多年后出土时，锋利依旧，轻轻一划便能割断纸张，见证了古代铸剑工艺的卓越成就。' },

  // 马王堆汉墓相关对话
  'wooden_chamber': { id: 'ex25', character: '考古队长', text: '这座墓的结构非常独特，由四重木椁组成，最外层为柏木，内层为椴木。墓主人的棺椁周围填满了炭末和白膏泥，形成了一个与外界完全隔绝的密封环境，这也是墓中文物保存如此完好的重要原因。' },
  
  'archaeologist': { id: 'ex26', character: '考古队员', text: '这座墓的发现纯属偶然。当时当地政府正在修建一座防空洞，挖掘过程中发现了这座墓。随后的考古发掘持续了近两年，总共发掘了三座相邻的汉墓，分别属于长沙国丞相利苍、他的夫人辛追和他们的儿子。' },
  
  'lady_body': { id: 'ex27', character: '研究员', text: '这具女性遗体是辛追夫人，距今已有2100多年。她的遗体浸泡在50多升红褐色液体中，这种液体成分复杂，含有多种防腐成分。遗体皮肤有弹性，内脏器官清晰可辨，甚至能看到血管和神经组织，这在世界考古史上是极为罕见的。' },
  
  'silk_dress': { id: 'ex28', character: '文物保护专家', text: '素纱单衣是用蚕丝织成的一种极薄的衣物，每平方厘米有1000多根经纱和400多根纬纱。整件衣服轻若蝉翼，只有49克重，可以轻易揉进一个核桃壳中。这种高超的丝织工艺，即使在今天也难以完全复制，被称为"古代织绢技术的巅峰"。' },
  
  'silk_painting': { id: 'ex29', character: '研究员', text: 'T形帛画高205厘米，宽92厘米，由天界、人间和地下世界三部分组成。画面上部描绘了天界神仙，中部表现人间生活，下部展示地下世界。这幅帛画是研究汉代宇宙观和丧葬观念的重要资料，也是中国现存最古老的帛画之一。' },

  // 陕西历史博物馆相关对话
  'museum_building': { id: 'ex30', character: '博物馆讲解员', text: '陕西历史博物馆建筑融合了唐代建筑风格，占地7万平方米，建筑面积6.5万平方米。整体布局呈"回"字形，主体建筑高29.5米，体现了中国传统建筑与现代建筑的完美结合，成为西安的标志性建筑之一。' },
  
  'museum_guide': { id: 'ex31', character: '博物馆讲解员', text: '陕西历史博物馆成立于1991年，是中国第一座大型现代化国家级历史博物馆。目前馆藏文物超过37万件，包括史前文物、青铜器、金银器、陶俑、壁画等。每天限量发放4000张免费参观券，如果想参观，建议提前排队或在网上预约。' },
  
  'four_sheep_vessel': { id: 'ex32', character: '博物馆讲解员', text: '四羊方尊是商代晚期的青铜礼器，高58.3厘米，重近10公斤，是我国迄今为止出土的唯一一件四羊方尊。器身四角各有一个立体的羊首，形象生动传神。器身饰有饕餮纹，工艺精湛，是中国古代青铜艺术的杰出代表，反映了商代高超的青铜铸造技术。' },
  
  'gilded_bronze_silkworm': { id: 'ex33', character: '博物馆讲解员', text: '鎏金铜蚕是西汉时期的精美文物，出土于陕西兴平县茂陵，长7.5厘米，宽2厘米。制作工艺精细，表面鎏金装饰，栩栩如生地再现了蚕的形态。这件文物见证了汉代发达的蚕桑丝织业，也反映了当时的农业崇拜观念，被誉为镇馆之宝。' },
  
  'tang_gold_silver': { id: 'ex34', character: '博物馆讲解员', text: '唐代金银器是陕西历史博物馆的重要藏品，多为唐代贵族的生活用品和装饰品。这些器物造型优美，纹饰精细，有的采用了鎏金、镶嵌宝石等工艺，充分展示了唐代工艺美术的高超水平和盛唐时期开放多元的文化特色，许多器物上可见波斯、中亚等外来文化的影响。' },

  // 甘肃省博物馆相关对话
  'bronze_horse': { id: 'ex35', character: '博物馆馆长', text: '铜奔马，又称"马踏飞燕"，高34.5厘米，长45厘米，重7.15公斤，是一件东汉时期的青铜器。这匹铜马三蹄腾空，造型优美，比例匀称，栩栩如生地表现了骏马奔驰的瞬间。尤其令人称奇的是，整个铜马只有一只后蹄着地，在青铜铸造技术尚不发达的古代，能够保持完美平衡，体现了工匠的高超技艺。' },
  
  'museum_director': { id: 'ex36', character: '博物馆馆长', text: '欢迎来到甘肃省博物馆。我们馆成立于1956年，收藏文物超过35万件，其中国家一级文物就有100多件。甘肃地处丝绸之路要道，历史上是东西方文化交流的重要枢纽，这里保存了大量珍贵的文物，见证了中国古代与西方的频繁交流。此外，甘肃也是中国史前彩陶文化的重要发源地，出土了大量马家窑文化、齐家文化等彩陶器物。' },
  
  'painted_pottery': { id: 'ex37', character: '博物馆馆长', text: '马家窑文化彩陶是新石器时代晚期的陶器，距今约5000年，主要分布在甘肃东部和青海东部地区。这些彩陶的特点是陶质细密，图案精美，多采用黑色和红褐色颜料绘制几何纹、旋涡纹、人面纹等。马家窑彩陶被誉为"彩陶之冠"，是中国史前艺术的杰出代表，其艺术风格影响了后世的许多艺术形式。' },
  
  'silk_road_artifacts': { id: 'ex38', character: '博物馆馆长', text: '甘肃是古丝绸之路的重要通道，博物馆收藏了大量与丝路相关的珍贵文物。这些包括汉唐时期的丝织品、陶俑、金银器，以及来自西域的各种异域文物。特别珍贵的是敦煌莫高窟和麦积山石窟出土的佛教艺术品，它们充分展示了中国佛教艺术吸收融合外来文化的过程，是中西文化交流的重要见证。' },
};

const { width, height } = Dimensions.get('window');

// 添加Props接口
interface StoryExperienceProps {
  id?: string | string[];
}

const StoryExperienceScreen: React.FC<StoryExperienceProps> = (props) => {
  // 使用传入的ID或从路由获取ID
  const routeParams = useLocalSearchParams();
  const routeId = routeParams.id;
  const id = props.id || routeId;
  const router = useRouter();
  const [story, setStory] = useState<Story | null>(null);
  const [currentScene, setCurrentScene] = useState<Scene | null>(null);
  const [dialogIndex, setDialogIndex] = useState(0);
  const [showDialog, setShowDialog] = useState(true);
  const [extraDialog, setExtraDialog] = useState<Dialog | null>(null);
  const fadeAnim = new Animated.Value(1);
  
  useEffect(() => {
    // 打印接收到的ID参数
    console.log('故事页面接收到ID:', id, '类型:', typeof id);
    
    // 在实际应用中，这里应该从API获取数据
    if (id && typeof id === 'string' && mockStories[id]) {
      console.log('找到故事:', mockStories[id].title);
      const storyData = mockStories[id];
      setStory(storyData);
      setCurrentScene(storyData.scenes[0]);
    } else {
      console.log('未找到对应故事:', id);
      // 如果ID不是字符串或找不到故事，尝试转换
      if (id && Array.isArray(id) && id.length > 0) {
        const strId = id[0];
        console.log('尝试使用ID数组的第一个元素:', strId);
        if (mockStories[strId]) {
          const storyData = mockStories[strId];
          setStory(storyData);
          setCurrentScene(storyData.scenes[0]);
        }
      }
    }
  }, [id]);
  
  const handleNextDialog = () => {
    if (!currentScene) return;
    
    if (extraDialog) {
      setExtraDialog(null);
      return;
    }
    
    if (dialogIndex < currentScene.dialogs.length - 1) {
      setDialogIndex(dialogIndex + 1);
    } else {
      setShowDialog(false);
    }
  };
  
  const handleInteractionPoint = (pointId: string) => {
    if (!currentScene) return;
    
    const point = currentScene.interactionPoints.find(p => p.id === pointId);
    if (!point) return;
    
    if (point.nextScene && story) {
      const nextScene = story.scenes.find(s => s.id === point.nextScene);
      if (nextScene) {
        // 场景切换动画
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true
        }).start(() => {
          setCurrentScene(nextScene);
          setDialogIndex(0);
          setShowDialog(true);
          
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true
          }).start();
        });
      }
    } else if (point.triggerDialog) {
      const dialog = extraDialogs[point.triggerDialog];
      if (dialog) {
        setExtraDialog(dialog);
      }
    }
  };
  
  if (!story || !currentScene) {
    return (
      <View style={styles.loading}>
        <StatusBar style="light" />
        <Text style={styles.loadingText}>未找到相关故事内容</Text>
        <TouchableOpacity 
          style={styles.returnButton}
          onPress={() => router.back()}
        >
          <Text style={styles.returnButtonText}>返回文物详情</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <Animated.View style={[styles.sceneContainer, { opacity: fadeAnim }]}>
        <View 
          style={[styles.sceneBackground, { backgroundColor: currentScene.backgroundColor }]}
        >
          {/* 交互点 */}
          {!showDialog && !extraDialog && currentScene.interactionPoints.map((point) => (
            <TouchableOpacity
              key={point.id}
              style={[styles.interactionPoint, { left: point.position.x, top: point.position.y }]}
              onPress={() => handleInteractionPoint(point.id)}
            >
              <View style={styles.interactionDot} />
              <Text style={styles.interactionHint}>{point.hintText}</Text>
            </TouchableOpacity>
          ))}
          
          {/* 对话框 */}
          {(showDialog || extraDialog) && (
            <TouchableOpacity 
              style={styles.dialogBox}
              onPress={handleNextDialog}
              activeOpacity={0.9}
            >
              <Text style={styles.characterName}>
                {extraDialog ? extraDialog.character : currentScene.dialogs[dialogIndex].character}
              </Text>
              <Text style={styles.dialogText}>
                {extraDialog ? extraDialog.text : currentScene.dialogs[dialogIndex].text}
              </Text>
              <Text style={styles.tapHint}>点击继续</Text>
            </TouchableOpacity>
          )}
          
          {/* 返回按钮 */}
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>退出</Text>
          </TouchableOpacity>
          
          {/* 进度条 */}
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${(dialogIndex + 1) / currentScene.dialogs.length * 100}%` }
              ]} 
            />
          </View>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  sceneContainer: {
    flex: 1,
  },
  sceneBackground: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  interactionPoint: {
    position: 'absolute',
    alignItems: 'center',
  },
  interactionDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderWidth: 2,
    borderColor: '#8B4513',
  },
  interactionHint: {
    color: '#FFF',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  dialogBox: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 10,
    padding: 15,
    borderWidth: 1,
    borderColor: '#8B4513',
  },
  characterName: {
    color: '#F5EFE0',
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 8,
  },
  dialogText: {
    color: '#FFF',
    fontSize: 16,
    lineHeight: 24,
  },
  tapHint: {
    color: '#A67D5D',
    fontSize: 12,
    textAlign: 'right',
    marginTop: 10,
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  backButtonText: {
    color: '#FFF',
    fontSize: 14,
  },
  progressBar: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#8B4513',
    borderRadius: 2,
  },
  loadingText: {
    fontSize: 18,
    color: '#F5EFE0',
    marginBottom: 20,
  },
  returnButton: {
    backgroundColor: '#8B4513',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  returnButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default StoryExperienceScreen; 