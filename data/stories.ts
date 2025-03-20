import { Story, StoryChapter, StoryInteraction, Scene, Dialog, InteractionPoint } from './types';

// 故事数据
export const stories: Story[] = [
  {
    id: '1',
    title: '越王勾践剑的秘密',
    relicId: '105',
    summary: '公元前496年，越国国君勾践被吴王夫差打败，被迫臣服于吴国。这是一个卧薪尝胆、韬光养晦、最终复国雪耻的传奇故事。',
    coverImage: 'https://picsum.photos/id/65/800/600',
    duration: 15,
    tags: ['战国', '青铜器', '复仇'],
    chapters: [
      {
        id: '1-1',
        title: '败亡之殇',
        content: '公元前496年，越国与吴国在夫椒（今浙江省嘉兴）进行了一场激烈的战争。越国战败，国君勾践被迫与五千越军降服于吴王夫差，被带往吴国都城（今江苏苏州）。',
        imageUrl: 'https://picsum.photos/id/1065/800/600',
        interactions: [
          {
            id: '1-1-1',
            type: 'dialog',
            data: {
              character: '越王勾践',
              text: '今日之耻，他日必报！我越国虽败，不死！',
              emotion: 'determined'
            }
          }
        ]
      },
      {
        id: '1-2',
        title: '卧薪尝胆',
        content: '在吴国，勾践被迫忍辱负重，为吴王牵马、尝粪以证明其忠诚。他卧薪尝胆，日夜不忘国耻，暗中积蓄力量。与此同时，他命令能工巧匠铸造了一把锋利无比的宝剑，以寄托复国雪耻的决心。',
        imageUrl: 'https://picsum.photos/id/1066/800/600',
        interactions: [
          {
            id: '1-2-1',
            type: 'dialog',
            data: {
              character: '勾践',
              text: '（尝一口苦胆）苦...但比国亡之痛更苦的是什么？是无法复国的耻辱！',
              emotion: 'suffering'
            }
          },
          {
            id: '1-2-2',
            type: 'choice',
            data: {
              question: '勾践应该怎么做？',
              options: [
                {
                  text: '趁夜色暗杀吴王夫差',
                  outcome: '这是一个危险且不明智的选择。即使成功，越国也难以对抗整个吴国。'
                },
                {
                  text: '忍辱负重，等待机会',
                  outcome: '这是勾践最终选择的道路，他决定忍受屈辱，等待复国的时机。',
                  isCorrect: true
                },
                {
                  text: '向周天子求援',
                  outcome: '在当时，周天子已无实权，无法给予有力援助。'
                }
              ]
            }
          }
        ]
      },
      {
        id: '1-3',
        title: '复国雪耻',
        content: '经过多年的忍耐与筹划，勾践最终被允许返回越国。他励精图治，发展农业，训练军队，并聘请贤臣范蠡和文种辅佐。二十年后，越国强大起来，趁吴国内乱之际发动攻击，最终灭掉了吴国，完成了复仇。',
        imageUrl: 'https://picsum.photos/id/1067/800/600',
        interactions: [
          {
            id: '1-3-1',
            type: 'animation',
            data: {
              animationType: 'battle',
              duration: 5
            }
          },
          {
            id: '1-3-2',
            type: 'dialog',
            data: {
              character: '勾践',
              text: '二十年卧薪尝胆，今日终得报仇！吴国灭亡，越国兴盛！',
              emotion: 'triumphant'
            }
          }
        ]
      },
      {
        id: '1-4',
        title: '宝剑出世',
        content: '勾践命人铸造的宝剑传世两千多年，被誉为"天下第一剑"。这把剑在1965年于湖北江陵一座古墓中被考古学家发现，它历经两千年仍然锋利无比，成为了中国古代冶炼技术的杰出代表。',
        imageUrl: 'https://picsum.photos/id/1068/800/600',
        interactions: [
          {
            id: '1-4-1',
            type: 'quiz',
            data: {
              question: '越王勾践剑出土于哪一年？',
              options: [
                { text: '1955年', isCorrect: false },
                { text: '1965年', isCorrect: true },
                { text: '1975年', isCorrect: false },
                { text: '1985年', isCorrect: false }
              ],
              explanation: '越王勾践剑于1965年在湖北江陵望山1号墓出土，是中国国宝级文物。'
            }
          }
        ]
      }
    ],
    scenes: [
      {
        id: 'scene-1',
        backgroundColor: '#000',
        backgroundImage: 'https://picsum.photos/id/65/800/600',
        dialogs: [
          {
            id: 'dialog-1-1',
            character: '讲述者',
            text: '公元前496年，越国与吴国在夫椒进行了一场激烈的战争。越国战败，国君勾践被迫与五千越军降服于吴王夫差。',
          },
          {
            id: 'dialog-1-2',
            character: '越王勾践',
            text: '今日之耻，他日必报！我越国虽败，不死！',
            emotion: 'determined'
          },
          {
            id: 'dialog-1-3',
            character: '讲述者',
            text: '在吴国，勾践被迫忍辱负重，为吴王牵马、尝粪以证明其忠诚。他卧薪尝胆，日夜不忘国耻，暗中积蓄力量。',
          }
        ],
        interactionPoints: [
          {
            id: 'interaction-1-1',
            position: { x: 200, y: 300 },
            type: 'item',
            hintText: '查看宝剑',
            nextScene: 'scene-2'
          },
          {
            id: 'interaction-1-2',
            position: { x: 100, y: 200 },
            type: 'character',
            hintText: '与范蠡交谈',
            nextScene: 'scene-3'
          }
        ]
      },
      {
        id: 'scene-2',
        backgroundColor: '#321',
        backgroundImage: 'https://picsum.photos/id/66/800/600',
        dialogs: [
          {
            id: 'dialog-2-1',
            character: '讲述者',
            text: '勾践命令能工巧匠铸造了一把锋利无比的宝剑，以寄托复国雪耻的决心。',
          },
          {
            id: 'dialog-2-2',
            character: '工匠',
            text: '大王，这把剑用了最好的金属材料，融入了我们越国最高超的铸造技术，锋利无比，可断发断金。',
          },
          {
            id: 'dialog-2-3',
            character: '越王勾践',
            text: '好！待我复国之日，必以此剑饮吴王之血！',
          }
        ],
        interactionPoints: [
          {
            id: 'interaction-2-1',
            position: { x: 300, y: 400 },
            type: 'item',
            hintText: '返回',
            nextScene: 'scene-1'
          }
        ]
      },
      {
        id: 'scene-3',
        backgroundColor: '#123',
        backgroundImage: 'https://picsum.photos/id/67/800/600',
        dialogs: [
          {
            id: 'dialog-3-1',
            character: '范蠡',
            text: '大王，臣已为您计划好了复国大计，但需耐心等待时机。',
          },
          {
            id: 'dialog-3-2',
            character: '越王勾践',
            text: '吾愿卧薪尝胆，只为复国雪耻之日。',
          },
          {
            id: 'dialog-3-3',
            character: '范蠡',
            text: '大王志向远大，臣必鞠躬尽瘁，助大王实现复国之梦！',
          }
        ],
        interactionPoints: [
          {
            id: 'interaction-3-1',
            position: { x: 150, y: 350 },
            type: 'item',
            hintText: '返回',
            nextScene: 'scene-1'
          }
        ]
      }
    ]
  },
  {
    id: '2',
    title: '莫高窟的前世今生',
    relicId: '103',
    summary: '敦煌莫高窟始建于十六国的前秦时期，历经北朝、隋、唐、五代、西夏、元等多个朝代的修建和扩建，记录了近千年的佛教艺术发展历程。',
    coverImage: 'https://picsum.photos/id/43/800/600',
    duration: 20,
    tags: ['佛教', '壁画', '丝绸之路'],
    chapters: [
      {
        id: '2-1',
        title: '砂砾中的第一窟',
        content: '公元366年，一位名叫乐僔的僧人路过敦煌，在鸣沙山下看到金光万道，如千佛现身。他认为这是佛主显灵，于是在峭壁上开凿了第一个洞窟，莫高窟从此拉开序幕。',
        imageUrl: 'https://picsum.photos/id/2065/800/600'
      }
    ],
    scenes: [
      {
        id: 'scene-1',
        backgroundColor: '#111',
        backgroundImage: 'https://picsum.photos/id/43/800/600',
        dialogs: [
          {
            id: 'dialog-1',
            character: '讲述者',
            text: '公元366年，一位名叫乐僔的僧人路过敦煌，鸣沙山下的奇景令他驻足。',
          },
          {
            id: 'dialog-2',
            character: '乐僔',
            text: '这金光万道，如千佛现身。佛主显灵，应在此修建佛窟！',
          },
          {
            id: 'dialog-3',
            character: '讲述者',
            text: '于是，乐僔在这峭壁上开凿了第一个洞窟，莫高窟从此拉开序幕。',
          }
        ],
        interactionPoints: [
          {
            id: 'interaction-1',
            position: { x: 250, y: 350 },
            type: 'scene',
            hintText: '探索洞窟',
            nextScene: 'scene-2'
          },
          {
            id: 'interaction-2',
            position: { x: 150, y: 250 },
            type: 'character',
            hintText: '了解乐僔',
            nextScene: 'scene-3'
          }
        ]
      },
      {
        id: 'scene-2',
        backgroundColor: '#222',
        backgroundImage: 'https://picsum.photos/id/44/800/600',
        dialogs: [
          {
            id: 'dialog-4',
            character: '讲述者',
            text: '从公元366年初创，莫高窟历经十六国、北朝、隋、唐、五代、西夏、元等历代的修建，形成巨大的规模。',
          },
          {
            id: 'dialog-5',
            character: '讲述者',
            text: '如今的莫高窟有洞窟735个，壁画4.5万平方米、泥质彩塑2415尊，是世界上现存规模最大、内容最丰富的佛教艺术地。',
          }
        ],
        interactionPoints: [
          {
            id: 'interaction-3',
            position: { x: 200, y: 300 },
            type: 'item',
            hintText: '返回',
            nextScene: 'scene-1'
          }
        ]
      },
      {
        id: 'scene-3',
        backgroundColor: '#333',
        backgroundImage: 'https://picsum.photos/id/45/800/600',
        dialogs: [
          {
            id: 'dialog-6',
            character: '乐僔',
            text: '我将用毕生精力开凿佛窟，传播佛法。',
          },
          {
            id: 'dialog-7',
            character: '讲述者',
            text: '乐僔是莫高窟的创始人，他在此地看到奇景后，决定开凿洞窟，修建佛像。他的举动启发了后来无数的僧人和信徒。',
          }
        ],
        interactionPoints: [
          {
            id: 'interaction-4',
            position: { x: 150, y: 350 },
            type: 'item',
            hintText: '返回',
            nextScene: 'scene-1'
          }
        ]
      }
    ]
  },
  {
    id: '3',
    title: '马踏飞燕的传奇',
    relicId: '106',
    summary: '马踏飞燕，又称"马超龙雀"，是中国东汉时期的青铜器珍品，被誉为中国旅游的标志。这件文物于1969年在甘肃武威雷台汉墓中出土，揭示了古代丝绸之路的繁荣与文化交流。',
    coverImage: 'https://picsum.photos/id/98/800/600',
    duration: 12,
    tags: ['青铜器', '汉代', '丝绸之路'],
    scenes: [
      {
        id: 'scene-1',
        backgroundColor: '#234',
        backgroundImage: 'https://picsum.photos/id/98/800/600',
        dialogs: [
          {
            id: 'dialog-1',
            character: '讲述者',
            text: '马踏飞燕，又称"马超龙雀"或"铜奔马"，是中国汉代青铜器艺术的珍品，1969年出土于甘肃武威雷台汉墓。',
          },
          {
            id: 'dialog-2',
            character: '考古专家',
            text: '这件青铜器重量仅有7.15公斤，高34.5厘米，长45厘米，造型生动，充满活力。',
          },
          {
            id: 'dialog-3',
            character: '讲述者',
            text: '马踏飞燕已成为中国旅游的标志，象征着中国旅游业。它的出土地武威，正处于古代丝绸之路的要冲。',
          }
        ],
        interactionPoints: [
          {
            id: 'interaction-1',
            position: { x: 300, y: 200 },
            type: 'item',
            hintText: '查看细节',
            nextScene: 'scene-2'
          },
          {
            id: 'interaction-2',
            position: { x: 150, y: 300 },
            type: 'scene',
            hintText: '了解丝绸之路',
            nextScene: 'scene-3'
          }
        ]
      },
      {
        id: 'scene-2',
        backgroundColor: '#345',
        backgroundImage: 'https://picsum.photos/id/99/800/600',
        dialogs: [
          {
            id: 'dialog-4',
            character: '讲述者',
            text: '马踏飞燕造型独特，马匹三足腾空，一足踏在一只飞鸟上方，张嘴嘶鸣，尾巴上扬，体现了中国汉代工匠高超的铸造技艺。',
          },
          {
            id: 'dialog-5',
            character: '考古专家',
            text: '有学者认为这只飞鸟可能是传说中的"龙雀"，象征着速度和力量。马匹的造型表现了奔跑的状态，体现了动态的美。',
          }
        ],
        interactionPoints: [
          {
            id: 'interaction-3',
            position: { x: 200, y: 300 },
            type: 'item',
            hintText: '返回',
            nextScene: 'scene-1'
          }
        ]
      },
      {
        id: 'scene-3',
        backgroundColor: '#456',
        backgroundImage: 'https://picsum.photos/id/100/800/600',
        dialogs: [
          {
            id: 'dialog-6',
            character: '讲述者',
            text: '丝绸之路是连接东西方的重要商贸通道，汉代时已经很繁荣。武威作为河西走廊上的重要城市，是丝路商贸的重要枢纽。',
          },
          {
            id: 'dialog-7',
            character: '史学家',
            text: '马踏飞燕的出土，反映了当时中国与西域各国的频繁交流。汉代的马匹品种得到了改良，许多是从西域引进的。',
          }
        ],
        interactionPoints: [
          {
            id: 'interaction-4',
            position: { x: 150, y: 350 },
            type: 'item',
            hintText: '返回',
            nextScene: 'scene-1'
          }
        ]
      }
    ]
  }
];

// 工具函数：根据ID获取故事
export const getStoryById = (id: string): Story | undefined => {
  return stories.find(story => story.id === id);
};

// 工具函数：根据文物ID获取相关故事
export const getStoriesByRelicId = (relicId: string): Story[] => {
  console.log(`正在查找文物ID为 ${relicId} 的相关故事，所有故事:`, stories.map(s => ({ title: s.title, relicId: s.relicId })));
  
  // 确保字符串比较
  const results = stories.filter(story => String(story.relicId) === String(relicId));
  
  console.log(`找到 ${results.length} 个相关故事:`, results.map(s => s.title));
  
  return results;
};

// 工具函数：获取所有故事
export const getAllStories = (): Story[] => {
  return stories;
};

// 工具函数：获取热门故事
export const getFeaturedStories = (limit: number = 3): Story[] => {
  // 这里可以根据某种逻辑排序，如故事的popularity等
  // 目前简单返回前几个故事
  return stories.slice(0, limit);
};

// 工具函数：根据标签获取故事
export const getStoriesByTag = (tag: string): Story[] => {
  return stories.filter(story => story.tags?.includes(tag));
};

// 工具函数：根据故事ID和章节ID获取特定章节
export const getChapterById = (storyId: string, chapterId: string): StoryChapter | undefined => {
  const story = getStoryById(storyId);
  return story?.chapters?.find(chapter => chapter.id === chapterId);
}; 