import { Story, StoryChapter, StoryInteraction, Scene, Dialog, InteractionPoint } from './types';

// 故事数据
export const stories: Story[] = [
  {
    id: '1',
    title: '越王勾践剑的传奇',
    relicId: '105',
    summary: '这是一把剑的故事，更是一个王的故事。它见证了一个国家的兴衰荣辱，也见证了一位君主的坚韧与荣耀。',
    coverImage: '/images/goujian_sword_cover.jpg',
    duration: 20,
    tags: ['春秋', '青铜器', '复仇', '卧薪尝胆'],
    supportsLandscape: true,
    chapters: [
      {
        id: '1-1',
        title: '剑与王',
        content: '公元前496年，越国的王位上，迎来了一位新的君主——勾践。这把青铜铸就的宝剑，便被佩在了他的腰间。从此，它与勾践的命运紧紧相连，一同踏上了波澜壮阔的征程。',
        imageUrl: '/images/goujian_coronation.jpg',
        interactions: [
          {
            id: '1-1-1',
            type: 'dialog',
            data: {
              character: '越王勾践',
              text: '今日我继承王位，此剑随我征战四方，必将带领越国走向强盛！',
              emotion: 'determined'
            }
          }
        ]
      },
      {
        id: '1-2',
        title: '夫椒之战',
        content: '公元前494年，夫椒之战的烽火燃起。吴王夫差，为了报杀父之仇，率大军气势汹汹地向越国压来。战场上，两军对峙，战鼓震天。然而，勾践却在谋士的劝谏声中，选择了贸然出击。结果，越军大败，曾经威风凛凛的越军，如今只剩下了五千残兵败将，狼狈地逃到了会稽山。在这场惨败中，越王勾践剑也随勾践一同经历了生死劫难，它见证了越国的耻辱，也见证了勾践的无奈与痛苦。',
        imageUrl: '/images/fuqiao_battle.jpg',
        interactions: [
          {
            id: '1-2-1',
            type: 'dialog',
            data: {
              character: '谋士',
              text: '大王，吴军势大，我军应当避其锋芒，不可贸然出击！',
              emotion: 'worried'
            }
          },
          {
            id: '1-2-2',
            type: 'dialog',
            data: {
              character: '越王勾践',
              text: '不！越国勇士无所畏惧！给我冲！',
              emotion: 'fierce'
            }
          },
          {
            id: '1-2-3',
            type: 'animation',
            data: {
              animationType: 'battle',
              duration: 5
            }
          }
        ]
      },
      {
        id: '1-3',
        title: '臣服吴国',
        content: '夫椒之战后，勾践陷入了绝境。为了保全性命，他做出了一个艰难的决定——向夫差献上美女、财宝，并自请为吴王的臣仆。在吴国的那些日子里，勾践受尽屈辱。他为夫差驾车，为夫差养马，忍受着吴国臣民的白眼与嘲讽。而那把越王勾践剑，也随他一同经历了这段屈辱的岁月。它静静地躺在勾践的腰间，仿佛在默默诉说着主人的不甘与屈辱，又仿佛在等待着主人东山再起的那一天。',
        imageUrl: '/images/goujian_servant.jpg',
        interactions: [
          {
            id: '1-3-1',
            type: 'dialog',
            data: {
              character: '吴王夫差',
              text: '勾践，你今日给我牵马，明日为我驾车！',
              emotion: 'arrogant'
            }
          },
          {
            id: '1-3-2',
            type: 'dialog',
            data: {
              character: '越王勾践',
              text: '（内心）忍，必须忍！越国不灭，我志不死！',
              emotion: 'suffering'
            }
          },
          {
            id: '1-3-3',
            type: 'choice',
            data: {
              question: '勾践在面对屈辱时，他的内心想法是？',
              options: [
                {
                  text: '接受命运，认命做奴仆',
                  outcome: '勾践绝不会放弃越国的希望和复国的梦想。'
                },
                {
                  text: '暗中积蓄力量，等待复仇时机',
                  outcome: '勾践表面恭顺，内心却从未放弃复国雪耻的决心。',
                  isCorrect: true
                },
                {
                  text: '寻机刺杀吴王夫差',
                  outcome: '勾践深知此时刺杀夫差只会导致越国彻底灭亡，他需要的是更长远的谋划。'
                }
              ]
            }
          }
        ]
      },
      {
        id: '1-4',
        title: '卧薪尝胆',
        content: '历尽侮辱，勾践终于被释放回国。回国后的勾践，没有忘记会稽之耻，他把国都迁到了平原地区的山阴大城。在那里，他忧心苦思，把苦胆挂到了座位上，无论是坐卧还是吃饭，都要尝尝苦胆的滋味，以此提醒自己不忘曾经的耻辱。而越王勾践剑，也始终伴随着他，见证了他卧薪尝胆、发奋图强的坚韧岁月。勾践励精图治，发展生产，整军备战，越国在他的治理下，逐渐强大起来。',
        imageUrl: '/images/goujian_gall.jpg',
        interactions: [
          {
            id: '1-4-1',
            type: 'dialog',
            data: {
              character: '越王勾践',
              text: '（尝一口苦胆）这苦涩的滋味，提醒我不忘国耻！只有国家强大，才能洗刷耻辱！',
              emotion: 'determined'
            }
          },
          {
            id: '1-4-2',
            type: 'dialog',
            data: {
              character: '范蠡',
              text: '大王，臣已安排能工巧匠打造更多宝剑，训练精锐部队。十年之内，越国必将强盛！',
              emotion: 'confident'
            }
          }
        ]
      },
      {
        id: '1-5',
        title: '复仇之战',
        content: '经过多年的努力，越国终于迎来了复仇之时。公元前473年，勾践率军攻打吴国，大败吴军，成为了春秋时期最后一位霸主。在这场复仇之战中，越王勾践剑随勾践见证了越国的复兴，也见证了吴国的灭亡。这把剑，仿佛是勾践的守护神，又仿佛是越国的象征，它见证了越国从屈辱到荣耀的全过程。',
        imageUrl: '/images/goujian_victory.jpg',
        interactions: [
          {
            id: '1-5-1',
            type: 'animation',
            data: {
              animationType: 'battle',
              duration: 5
            }
          },
          {
            id: '1-5-2',
            type: 'dialog',
            data: {
              character: '越王勾践',
              text: '二十年的等待，终于等到了这一刻！吴国灭亡，越国崛起！',
              emotion: 'triumphant'
            }
          }
        ]
      },
      {
        id: '1-6',
        title: '剑出土',
        content: '时间来到了1965年的冬天，在湖北省荆州市附近的望山一号楚国贵族墓的挖掘现场。考古人员在墓主人身体的左手边，意外地发现了一柄装在黑色漆木箱鞘内的名贵青铜剑。当考古人员小心翼翼地拔剑出鞘时，所有人都被眼前的一幕惊呆了。寒光耀目，毫无锈蚀，刃薄锋利，这把剑仿佛刚刚铸成，却已经跨越了两千多年的时光。剑全长55.6厘米，其中剑身长45.6厘米，剑格宽5厘米。剑身满饰黑色菱形几何暗花纹，剑格正面和反面还分别用蓝色琉璃和绿松石镶嵌成美丽的纹饰。剑柄以丝绳缠缚，剑首向外形翻卷作圆箍，内铸有极其精细的11道同心圆圈。经过研究人员的考证，这把剑，正是那把曾经陪伴勾践走过跌宕起伏一生的越王勾践剑。',
        imageUrl: '/images/sword_discovery.jpg',
        interactions: [
          {
            id: '1-6-1',
            type: 'dialog',
            data: {
              character: '考古学家',
              text: '天啊！这把剑居然毫无锈蚀，如此锋利，两千多年过去了，它依然如新！',
              emotion: 'amazed'
            }
          },
          {
            id: '1-6-2',
            type: 'quiz',
            data: {
              question: '关于越王勾践剑为何会在楚国贵族墓葬中出现，学术界有两种主要观点，以下哪一项是正确的？',
              options: [
                { 
                  text: '嫁妆说：楚昭王娶了越王勾践的女儿为妃，这把剑作为嫁妆流入楚国', 
                  isCorrect: true 
                },
                { 
                  text: '战利品说：这把剑是在楚国出兵越国时被缴获的战利品', 
                  isCorrect: true 
                },
                { 
                  text: '商贸说：越国与楚国商贸往来时作为礼物赠送', 
                  isCorrect: false 
                },
                { 
                  text: '赏赐说：越王勾践赏赐给楚国贵族的礼物', 
                  isCorrect: false 
                }
              ],
              explanation: '考古学界对越王勾践剑为何出现在楚国墓葬中有两种主要观点：一是作为嫁妆随越王女儿嫁到楚国；二是作为战利品在楚越战争中被楚国获取。目前学界对这两种观点都有支持者，尚无定论。'
            }
          }
        ]
      },
      {
        id: '1-7',
        title: '国宝传奇',
        content: '如今，越王勾践剑静静地躺在湖北省博物馆里，向我们诉说着那段古老的传奇故事。它不仅是中国古代冶金工艺的杰出代表，更是中华民族不屈不挠、自强不息精神的象征。让我们一起走近它，去感受它的温度，去聆听它的声音，去领略它的传奇与魅力。',
        imageUrl: '/images/sword_museum.jpg',
        interactions: [
          {
            id: '1-7-1',
            type: 'dialog',
            data: {
              character: '博物馆讲解员',
              text: '越王勾践剑被誉为"天下第一剑"，它的出土不仅震惊了中国，也震惊了世界。这把剑代表了中国古代最高超的青铜冶炼技术，也见证了一段波澜壮阔的历史。',
              emotion: 'proud'
            }
          }
        ]
      }
    ],
    scenes: [
      {
        id: 'scene-1',
        backgroundColor: '#000',
        backgroundImage: '/images/goujian_story_cover.jpg',
        dialogs: [
          {
            id: 'dialog-1-1',
            character: '讲述者',
            text: '这是一把剑的故事，更是一个王的故事。它见证了一个国家的兴衰荣辱，也见证了一位君主的坚韧与荣耀。',
          }
        ],
        interactionPoints: [
          {
            id: 'interaction-1-1',
            position: { x: 200, y: 300 },
            type: 'item',
            hintText: '开始探索越王勾践剑的故事',
            nextScene: 'scene-2'
          }
        ]
      },
      {
        id: 'scene-2',
        backgroundColor: '#321',
        backgroundImage: '/images/goujian_coronation_scene.jpg',
        dialogs: [
          {
            id: 'dialog-2-1',
            character: '讲述者',
            text: '公元前496年，越国的王位上，迎来了一位新的君主——勾践。这把青铜铸就的宝剑，便被佩在了他的腰间。',
          },
          {
            id: 'dialog-2-2',
            character: '越王勾践',
            text: '父王已逝，今日我继承王位，必将带领越国走向繁荣富强！',
          },
          {
            id: 'dialog-2-3',
            character: '大臣',
            text: '大王，这把宝剑乃越国能工巧匠精心打造，愿它伴随大王征战四方，保佑越国繁荣昌盛！',
          }
        ],
        interactionPoints: [
          {
            id: 'interaction-2-1',
            position: { x: 300, y: 400 },
            type: 'item',
            hintText: '了解夫椒之战',
            nextScene: 'scene-3'
          }
        ]
      },
      {
        id: 'scene-3',
        backgroundColor: '#123',
        backgroundImage: '/images/fuqiao_battle_scene.jpg',
        dialogs: [
          {
            id: 'dialog-3-1',
            character: '讲述者',
            text: '公元前494年，夫椒之战的烽火燃起。吴王夫差为了报杀父之仇，率大军气势汹汹地向越国压来。',
          },
          {
            id: 'dialog-3-2',
            character: '谋士',
            text: '大王，吴军势大，我军应当避其锋芒，不可贸然出击！',
          },
          {
            id: 'dialog-3-3',
            character: '越王勾践',
            text: '不！越国勇士无所畏惧！给我冲！',
          },
          {
            id: 'dialog-3-4',
            character: '讲述者',
            text: '结果，越军大败，曾经威风凛凛的越军，如今只剩下了五千残兵败将，狼狈地逃到了会稽山。',
          }
        ],
        interactionPoints: [
          {
            id: 'interaction-3-1',
            position: { x: 150, y: 350 },
            type: 'item',
            hintText: '见证勾践的屈辱',
            nextScene: 'scene-4'
          }
        ]
      },
      {
        id: 'scene-4',
        backgroundColor: '#234',
        backgroundImage: '/images/goujian_servant_scene.jpg',
        dialogs: [
          {
            id: 'dialog-4-1',
            character: '讲述者',
            text: '夫椒之战后，勾践陷入了绝境。为了保全性命，他向夫差献上美女、财宝，并自请为吴王的臣仆。',
          },
          {
            id: 'dialog-4-2',
            character: '吴王夫差',
            text: '勾践，你今日给我牵马，明日为我驾车！哈哈哈！',
          },
          {
            id: 'dialog-4-3',
            character: '越王勾践',
            text: '（内心）忍，必须忍！越国不灭，我志不死！',
          },
          {
            id: 'dialog-4-choice',
            character: '讲述者',
            text: '在面对极度屈辱时，勾践的内心是怎样想的？',
            choices: [
              {
                text: '接受命运，认命做奴仆',
                outcome: '勾践绝不会放弃越国的希望和复国的梦想。这不是正确的选择。',
                isCorrect: false
              },
              {
                text: '暗中积蓄力量，等待复仇时机',
                outcome: '没错！勾践表面恭顺，内心却从未放弃复国雪耻的决心。这是他最终成功的关键。',
                isCorrect: true
              },
              {
                text: '寻机刺杀吴王夫差',
                outcome: '勾践深知此时刺杀夫差只会导致越国彻底灭亡。这种冲动的选择不是明智之举。',
                isCorrect: false
              }
            ]
          }
        ],
        interactionPoints: [
          {
            id: 'interaction-4-1',
            position: { x: 200, y: 300 },
            type: 'item',
            hintText: '见证卧薪尝胆',
            nextScene: 'scene-5'
          },
          {
            id: 'interaction-4-2',
            position: { x: 150, y: 200 },
            type: 'character',
            hintText: '了解勾践的内心想法',
            triggerDialog: 'dialog-4-choice'
          }
        ]
      },
      {
        id: 'scene-5',
        backgroundColor: '#345',
        backgroundImage: '/images/goujian_gall_scene.jpg',
        dialogs: [
          {
            id: 'dialog-5-1',
            character: '讲述者',
            text: '回国后的勾践，没有忘记会稽之耻，他把苦胆挂到了座位上，无论是坐卧还是吃饭，都要尝尝苦胆的滋味。',
          },
          {
            id: 'dialog-5-2',
            character: '越王勾践',
            text: '（尝一口苦胆）这苦涩的滋味，提醒我不忘国耻！只有国家强大，才能洗刷耻辱！',
          },
          {
            id: 'dialog-5-3',
            character: '范蠡',
            text: '大王，臣已安排能工巧匠打造更多宝剑，训练精锐部队。十年之内，越国必将强盛！',
          }
        ],
        interactionPoints: [
          {
            id: 'interaction-5-1',
            position: { x: 250, y: 350 },
            type: 'item',
            hintText: '见证复仇之战',
            nextScene: 'scene-6'
          }
        ]
      },
      {
        id: 'scene-6',
        backgroundColor: '#456',
        backgroundImage: '/images/goujian_victory_scene.jpg',
        dialogs: [
          {
            id: 'dialog-6-1',
            character: '讲述者',
            text: '经过多年的努力，越国终于迎来了复仇之时。公元前473年，勾践率军攻打吴国，大败吴军。',
          },
          {
            id: 'dialog-6-2',
            character: '越王勾践',
            text: '二十年的等待，终于等到了这一刻！吴国灭亡，越国崛起！',
          },
          {
            id: 'dialog-6-3',
            character: '讲述者',
            text: '这把剑，仿佛是勾践的守护神，又仿佛是越国的象征，它见证了越国从屈辱到荣耀的全过程。',
          }
        ],
        interactionPoints: [
          {
            id: 'interaction-6-1',
            position: { x: 200, y: 300 },
            type: 'item',
            hintText: '探索剑的命运',
            nextScene: 'scene-7'
          }
        ]
      },
      {
        id: 'scene-7',
        backgroundColor: '#567',
        backgroundImage: '/images/sword_discovery_scene.jpg',
        dialogs: [
          {
            id: 'dialog-7-1',
            character: '讲述者',
            text: '时间来到了1965年的冬天，在湖北省荆州市附近的望山一号楚国贵族墓的挖掘现场。',
          },
          {
            id: 'dialog-7-2',
            character: '考古学家',
            text: '等等！这里有一个漆木箱鞘...天啊！这把剑居然毫无锈蚀，如此锋利！',
          },
          {
            id: 'dialog-7-3',
            character: '讲述者',
            text: '剑全长55.6厘米，剑身满饰黑色菱形几何暗花纹，剑格镶嵌着蓝色琉璃和绿松石。经考证，这就是越王勾践剑。',
          },
          {
            id: 'dialog-7-4',
            character: '考古专家',
            text: '关于这把剑为何会出现在楚国贵族墓中，学界有不同观点。你们认为最可能的原因是什么？',
          },
          {
            id: 'dialog-7-quiz',
            character: '考古专家',
            text: '关于越王勾践剑为何会在楚国贵族墓葬中出现，学术界有两种主要观点，以下哪些是正确的？',
            quiz: {
              options: [
                { 
                  text: '嫁妆说：楚昭王娶了越王勾践的女儿为妃，这把剑作为嫁妆流入楚国', 
                  isCorrect: true 
                },
                { 
                  text: '战利品说：这把剑是在楚国出兵越国时被缴获的战利品', 
                  isCorrect: true 
                },
                { 
                  text: '商贸说：越国与楚国商贸往来时作为礼物赠送', 
                  isCorrect: false 
                },
                { 
                  text: '赏赐说：越王勾践赏赐给楚国贵族的礼物', 
                  isCorrect: false 
                }
              ],
              explanation: '考古学界对越王勾践剑为何出现在楚国墓葬中有两种主要观点：一是作为嫁妆随越王女儿嫁到楚国；二是作为战利品在楚越战争中被楚国获取。目前学界对这两种观点都有支持者，尚无定论。'
            }
          }
        ],
        interactionPoints: [
          {
            id: 'interaction-7-1',
            position: { x: 150, y: 350 },
            type: 'item',
            hintText: '参观博物馆中的勾践剑',
            nextScene: 'scene-8'
          },
          {
            id: 'interaction-7-2',
            position: { x: 250, y: 300 },
            type: 'character',
            hintText: '思考剑的来源',
            triggerDialog: 'dialog-7-quiz'
          }
        ]
      },
      {
        id: 'scene-8',
        backgroundColor: '#678',
        backgroundImage: '/images/sword_museum_scene.jpg',
        dialogs: [
          {
            id: 'dialog-8-1',
            character: '讲述者',
            text: '如今，越王勾践剑静静地躺在湖北省博物馆里，向我们诉说着那段古老的传奇故事。',
          },
          {
            id: 'dialog-8-2',
            character: '博物馆讲解员',
            text: '越王勾践剑被誉为"天下第一剑"，它不仅是中国古代冶金工艺的杰出代表，更是中华民族不屈不挠精神的象征。',
          },
          {
            id: 'dialog-8-3',
            character: '讲述者',
            text: '让我们一起走近它，去感受它的温度，去聆听它的声音，去领略它的传奇与魅力。',
          }
        ],
        interactionPoints: [
          {
            id: 'interaction-8-1',
            position: { x: 200, y: 300 },
            type: 'item',
            hintText: '回到故事开始',
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
    coverImage: '/images/mogaoku.png',
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
    coverImage: '/images/matafeiyan.png',
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