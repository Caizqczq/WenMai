import React, { useEffect, useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Image, 
  TouchableOpacity, 
  Dimensions,
  Share,
  ActivityIndicator,
  FlatList,
  Animated,
  StatusBar as RNStatusBar,
  Platform
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons, AntDesign } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../constants/Colors';

const { width, height } = Dimensions.get('window');

// 定义文物数据类型
interface Relic {
  id: string;
  name: string;
  dynasty: string;
  era: string;
  location: string;
  category?: string;
  description: string;
  longDescription: string;
  imageUrl: string;
  images: string[];
  facts: string[];
}

// 模拟文物数据库 - 在实际应用中应该从API或数据库获取
const relicsDatabase: Relic[] = [
  { 
    id: '101', 
    name: '青铜器·后母戊鼎', 
    dynasty: '商代',
    era: '公元前1300年-公元前1046年',
    location: '中国国家博物馆',
    category: '青铜器',
    description: '后母戊鼎是中国商代晚期青铜器，是迄今为止中国出土的最大的商代青铜器。1939年河南安阳出土，原为祭祀礼器，高133厘米，宽110厘米，重832.84千克。',
    longDescription: `后母戊鼎是中国商代晚期青铜器，是迄今为止中国出土的最大的商代青铜器，被誉为"中华第一鼎"。1939年河南安阳出土，原为祭祀礼器，高133厘米，宽110厘米，重832.84千克。

鼎体腹部两侧各有一个兽面纹形象的提梁。鼎腹上铸有对称的饕餮纹样，虽然体积巨大，但纹饰精细，铸造工艺精湛。

后母戊鼎的出土证明了商代青铜铸造技术已达到相当高的水平，同时也反映了商代晚期王室祭祀活动的规模和重要性。这件青铜器不仅是中国古代青铜铸造工艺的杰出代表，也是研究商代社会、宗教和艺术的重要实物资料。`,
    imageUrl: 'https://picsum.photos/id/866/800/600', // 使用随机图片代替
    images: [
      'https://picsum.photos/id/866/800/600',
      'https://picsum.photos/id/237/800/600',
      'https://picsum.photos/id/433/800/600',
    ],
    facts: [
      "后母戊鼎是中国国家一级文物",
      "铸造于商王武丁时期",
      "铭文表明这是后母戊(武丁王后)祭祀祖先的器物",
      "出土时内装有骨头和灰烬",
      "鼎腹上有精美的饕餮纹"
    ]
  },
  { 
    id: '102', 
    name: '秦始皇兵马俑', 
    dynasty: '秦代',
    era: '公元前221年-公元前207年',
    location: '秦始皇陵博物院',
    category: '陶器',
    description: '秦始皇兵马俑是世界文化遗产，1974年在西安临潼区发现，是古代墓葬雕塑的一个类别。兵马俑坑是秦始皇陵的陪葬坑，面积约56,000平方米。',
    longDescription: `秦始皇兵马俑被誉为"世界第八大奇迹"，是世界文化遗产，1974年在西安临潼区被当地农民在打井时偶然发现。

兵马俑坑是秦始皇陵的陪葬坑，面积约56,000平方米，坑内有陶制的步兵、骑兵、车兵、军吏等，以及战车和战马，按军阵排列，再现了秦代军队的雄壮场面。

每个兵马俑的面部特征不同，被认为是按照真人模特塑造的。俑高约1.8米，神态、服饰、发型各不相同，栩栩如生，体现了秦代高超的陶俑制作工艺。

目前已发掘的兵马俑达8000多个，涂有彩绘，但出土后彩绘多已褪色。兵马俑的发现为研究秦代的军事、艺术和社会历史提供了珍贵的实物资料。`,
    imageUrl: 'https://picsum.photos/id/338/800/600',
    images: [
      'https://picsum.photos/id/338/800/600',
      'https://picsum.photos/id/320/800/600',
      'https://picsum.photos/id/62/800/600',
    ],
    facts: [
      "兵马俑被称为'世界第八大奇迹'",
      "每个兵马俑面部特征各不相同",
      "已发掘出土的兵马俑超过8000个",
      "兵马俑原本都涂有彩绘",
      "兵马俑被联合国教科文组织列为世界文化遗产"
    ]
  },
  { 
    id: '103', 
    name: '莫高窟壁画', 
    dynasty: '魏晋至元代',
    era: '公元366年-公元1368年',
    location: '甘肃敦煌',
    category: '绘画',
    description: '敦煌莫高窟始建于十六国的前秦时期，历经十六国、北朝、隋、唐、五代、西夏、元等历代的修建，形成巨大的规模，有洞窟735个，壁画4.5万平方米、泥质彩塑2415尊，是世界上现存规模最大、内容最丰富的佛教艺术地。',
    longDescription: `敦煌莫高窟，又称千佛洞，位于甘肃省敦煌市东南25公里处的鸣沙山东麓、党河西岸的崖壁上，是世界上现存规模最大、内容最丰富的佛教艺术宝库。

莫高窟始建于十六国的前秦时期（约公元366年），历经十六国、北朝、隋、唐、五代、西夏、元等历代的修建，形成巨大的规模，有洞窟735个，壁画4.5万平方米、泥质彩塑2415尊。

莫高窟的艺术风格融合了汉族、西域各民族以及印度、希腊等多种艺术风格，内容包括佛教故事、神话传说、历史人物、民俗风情等多个方面，是中国古代美术史上的一颗璀璨明珠。

1900年，道士王圆箓在莫高窟发现了藏经洞，内藏有大量珍贵的历史文献、艺术品和丝绸等文物，被称为"敦煌文献"，对研究中国古代历史、宗教、文学、艺术等方面有着极其重要的价值。`,
    imageUrl: 'https://picsum.photos/id/43/800/600',
    images: [
      'https://picsum.photos/id/43/800/600',
      'https://picsum.photos/id/26/800/600',
      'https://picsum.photos/id/79/800/600',
    ],
    facts: [
      "莫高窟始建于公元366年",
      "现存洞窟735个，壁画面积4.5万平方米",
      "藏经洞中发现的文献多达5万余件",
      "2021年国庆假期，莫高窟客流量突破10万人次",
      "莫高窟的壁画是研究中古时期中国社会历史的重要资料"
    ]
  },
  { 
    id: '104', 
    name: '越王勾践剑', 
    dynasty: '春秋晚期',
    era: '公元前496年-公元前465年',
    location: '湖北省博物馆',
    description: '越王勾践剑，春秋晚期越国的青铜剑，1965年12月在湖北江陵望山1号墓出土，是国家一级文物。此剑长55.7厘米，剑身上部有两排共8个字的鸟篆铭文："越王鸠浅（勾践）自作用剑"。',
    longDescription: `越王勾践剑，春秋晚期越国的青铜剑，是中国古代冷兵器中的稀世珍品，也是中国工艺美术史上的杰作之一。

1965年12月在湖北江陵望山1号墓出土，是国家一级文物。此剑长55.7厘米，柄长8.4厘米，剑身上部有两排共8个字的鸟篆铭文："越王鸠浅（勾践）自作用剑"。

越王勾践剑出土时，寒光四射，剑锋锐利，制作工艺极为精湛。剑身经过多道工序锻造而成，含锡量高达15.8%，远高于一般青铜器，使得剑体坚韧锋利。剑身上黑色菱形花纹是锻造过程中特殊工艺的体现。

考古学家惊奇地发现，这把已有2500多年历史的古剑，出土时依然锋利无比，削铁如泥，甚至能轻易划破放在剑锋上的头发，显示了古代越国高超的冶金工艺。

剑体表面经过特殊处理，有良好的抗氧化性能，出土时表面仍然闪亮如新，几乎没有锈迹，这一特性令现代冶金学家感到不可思议。`,
    imageUrl: 'https://picsum.photos/id/65/800/600',
    images: [
      'https://picsum.photos/id/65/800/600',
      'https://picsum.photos/id/76/800/600',
      'https://picsum.photos/id/59/800/600',
    ],
    facts: [
      "越王勾践剑距今已有2500多年历史",
      "出土时依然锋利，能轻易划破头发",
      "剑身含锡量高达15.8%",
      "出土时几乎没有锈迹",
      "铭文'越王鸠浅自作用剑'证明此剑为越王勾践所有"
    ]
  },
  { 
    id: '105', 
    name: '唐三彩', 
    dynasty: '唐代',
    era: '公元618年-公元907年',
    location: '多个博物馆收藏',
    description: '唐三彩是盛行于唐代的一种低温釉陶器，主要以黄、绿、白三种颜色为主，也有褐、蓝、黑、紫等色彩。三彩胎多为白色，质地较细腻，一般先用白色化妆土处理器表，再施釉彩绘。',
    longDescription: `唐三彩是盛行于中国唐代（618年-907年）的一种低温釉陶器，因其釉彩主要以黄、绿、白三种颜色为主而得名，同时也有褐、蓝、黑、紫等多种色彩。

唐三彩的胎多为白色，质地较细腻，一般先用白色化妆土处理器表，再施釉彩绘。釉料主要是铜、铁、钴等金属氧化物，经过800℃左右的低温烧制而成。釉色鲜艳明快，釉面光滑莹润，彩釉会自然流淌，形成独特的"流彩"效果。

唐三彩的器型多样，有骆驼、马、人物俑、枕、盒、壶、杯、盘等，多出土于唐代贵族墓葬中，是当时丧葬明器的重要组成部分。其中以载乐骆驼、三彩马最为著名。

唐三彩不仅体现了唐代陶瓷工艺的高超水平，也反映了当时中西文化交流的盛况。其工艺和纹饰受到了波斯、中亚等地区的影响，同时唐三彩也通过丝绸之路传播到了日本、朝鲜半岛、西亚和欧洲等地区。

唐三彩作为世界陶瓷史上的瑰宝，以其绚丽的色彩、精湛的工艺和丰富的文化内涵，成为唐代文明的重要象征和中国古代艺术的珍贵遗产。`,
    imageUrl: 'https://picsum.photos/id/23/800/600',
    images: [
      'https://picsum.photos/id/23/800/600',
      'https://picsum.photos/id/36/800/600',
      'https://picsum.photos/id/96/800/600',
    ],
    facts: [
      "唐三彩主要用于随葬品",
      "釉料主要由铜、铁、钴等金属氧化物制成",
      "烧制温度约为800℃",
      "造型多样，包括人物、动物、日用器皿等",
      "受到波斯和中亚艺术的影响"
    ]
  },
  { 
    id: '106', 
    name: '陕西历史博物馆文物', 
    dynasty: '多朝代',
    era: '公元前11世纪-公元20世纪',
    location: '陕西历史博物馆',
    description: '陕西历史博物馆位于西安市，是中国第一座大型现代化国家级博物馆，馆藏文物丰富，包括商周青铜器、秦始皇兵马俑、唐代金银器和壁画等珍贵文物，展现了陕西地区灿烂的历史文化。',
    longDescription: `陕西历史博物馆位于西安市小寨东路，建成于1991年，是中国第一座大型现代化国家级历史博物馆，被誉为"古都明珠，华夏宝库"。

博物馆建筑风格独特，采用唐代建筑的特点，既庄重大气，又典雅精致。馆内收藏了陕西地区从远古时期到1840年前的各类文物，反映了中国历史上最辉煌的几个朝代——周、秦、汉、唐的灿烂文明。

馆藏文物中最具代表性的有：商周时期的青铜器，展现了早期中国的铸造工艺；秦朝的兵马俑，体现了秦代的军事力量；汉代的陶俑和壁画，反映了汉代社会生活；唐代的金银器和唐三彩，代表了盛唐时期的辉煌文化；宋元明清时期的瓷器、玉器和书画，显示了中国传统艺术的发展脉络。

其中最著名的藏品包括"鎏金铜蚕"、"四羊方尊"、"懿德太子墓壁画"和"唐代金银器"等，这些文物都是中华文明的重要见证，具有极高的历史、艺术和科学价值。`,
    imageUrl: 'https://picsum.photos/id/424/800/600', // 使用随机图片代替
    images: [
      'https://picsum.photos/id/424/800/600',
      'https://picsum.photos/id/265/800/600',
      'https://picsum.photos/id/399/800/600',
    ],
    facts: [
      "陕西历史博物馆馆藏文物超过37万件",
      "博物馆建筑面积达6.5万平方米",
      "每天限量发放4000张免费参观券",
      "镇馆之宝包括四羊方尊、鎏金铜蚕和唐代金银器",
      "博物馆参观者中外国游客占比超过30%"
    ]
  },
  { 
    id: '107', 
    name: '马王堆汉墓文物', 
    dynasty: '西汉',
    era: '公元前206年-公元8年',
    location: '湖南省博物馆',
    description: '马王堆汉墓是1972年至1974年在长沙马王堆出土的三座西汉早期墓葬，出土了大量保存完好的丝织品、漆木器、帛书、药物和辛追夫人遗体，是研究汉代社会生活和文化的珍贵资料。',
    longDescription: `马王堆汉墓是20世纪中国考古学上的重大发现之一，位于湖南省长沙市。三座墓葬分别属于长沙国丞相利苍（1号墓）、辛追夫人（2号墓）和他们的儿子（3号墓）。

最为著名的是2号墓中出土的辛追夫人遗体，历经2000多年依然保存完好，皮肤柔软，关节可屈伸，内脏器官清晰可辨，被誉为"世界第九大奇迹"。

出土文物中尤为珍贵的还有T形帛画，描绘了当时人们对宇宙和冥界的理解；素纱单衣，一种极其轻薄的丝绸衣物，被称为"古代织绢技术的巅峰"；以及大量帛书，包含了《老子》《易经》等古代典籍和失传已久的医书《五十二病方》。

马王堆汉墓的发现，为研究中国古代社会生活、丧葬习俗、医学水平、丝织工艺以及思想文化提供了极其珍贵的实物资料。`,
    imageUrl: 'https://picsum.photos/id/607/800/600', // 使用随机图片代替
    images: [
      'https://picsum.photos/id/607/800/600',
      'https://picsum.photos/id/199/800/600',
      'https://picsum.photos/id/306/800/600',
    ],
    facts: [
      "辛追夫人遗体保存完好，被称为'千年女尸'",
      "出土的素纱单衣重量仅49克，被称为'丝绸之轻'",
      "T形帛画高205厘米，是中国现存最古老的帛画之一",
      "出土了大量医学帛书，记载了52种疾病和283种药物",
      "三座墓葬出土文物达3000余件"
    ]
  },
  { 
    id: '108', 
    name: '甘肃省博物馆文物', 
    dynasty: '多朝代',
    era: '公元前5000年-公元20世纪',
    location: '甘肃省博物馆',
    description: '甘肃省博物馆是展示甘肃历史文化的重要窗口，馆藏文物丰富，包括马家窑文化彩陶、汉代铜奔马、丝绸之路文物等珍贵文物，见证了甘肃作为中西文化交流枢纽的重要地位。',
    longDescription: `甘肃省博物馆坐落于兰州市七里河区，建立于1956年，是甘肃省规模最大、收藏最为丰富的综合性博物馆。

博物馆馆藏文物中最为著名的是"铜奔马"（又称"马踏飞燕"），这是东汉时期的青铜器，被誉为"中国旅游标志"和"中华国宝"。这匹铜马姿态矫健，一只前蹄踏在一只飞鸟上，造型生动，工艺精湛，充分展现了汉代艺术家的超凡技艺。

另一件重要藏品是马家窑文化彩陶，距今约5000年，色彩鲜艳，纹饰独特，多为几何纹、旋涡纹和动物图案，是中国史前艺术的杰出代表。

此外，博物馆还珍藏有丝绸之路相关文物，如汉唐时期的丝织品、陶俑、壁画、金银器等，展示了甘肃作为古代丝绸之路重要通道的历史地位和文化交流成果。

博物馆的展览将甘肃悠久的历史文化娓娓道来，从远古时期的彩陶文化，到近现代的革命文物，全面展示了甘肃地区文明发展的历程，是了解中国西北历史文化的重要场所。`,
    imageUrl: 'https://picsum.photos/id/532/800/600', // 使用随机图片代替
    images: [
      'https://picsum.photos/id/532/800/600',
      'https://picsum.photos/id/653/800/600',
      'https://picsum.photos/id/486/800/600',
    ],
    facts: [
      "铜奔马（马踏飞燕）是中国旅游标志",
      "馆藏彩陶距今约5000年，是新石器时代文化的珍贵遗产",
      "博物馆收藏文物超过35万件",
      "展览面积超过1万平方米",
      "设有史前文化、秦汉文明、丝绸之路、民族民俗等多个专题展厅"
    ]
  }
];

export default function RelicDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [relic, setRelic] = useState<Relic | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [relatedRelics, setRelatedRelics] = useState<Relic[]>([]);
  const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(false);
  
  // 参考：滚动监听
  const scrollY = useRef(new Animated.Value(0)).current;
  const headerHeight = 300; // 图片轮播高度
  const headerFadeStart = headerHeight - 100;
  
  // 加载文物数据
  useEffect(() => {
    // 不使用 setTimeout 模拟延迟，直接获取数据
    setLoading(true);
    const foundRelic = relicsDatabase.find(r => r.id === id);
    if (foundRelic) {
      setRelic(foundRelic);
      
      // 获取相关文物 - 同类别或同朝代
      const related = relicsDatabase.filter(
        r => r.id !== id && (r.category === foundRelic.category || r.dynasty === foundRelic.dynasty)
      ).slice(0, 3);
      
      setRelatedRelics(related);
    }
    setLoading(false);
  }, [id]); // 添加正确的依赖项
  
  const handleBackPress = () => {
    router.back();
  };
  
  const handleShare = async () => {
    if (!relic) return;
    
    try {
      await Share.share({
        message: `查看这件精美的文物：${relic.name}！${relic.description}`,
        title: `文脉 - ${relic.name}`,
      });
    } catch (error: any) {
      console.log(error.message);
    }
  };
  
  // 监听标题透明度
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, headerFadeStart, headerHeight],
    outputRange: [0, 0, 1],
    extrapolate: 'clamp',
  });
  
  // 监听标题位置
  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, headerHeight],
    outputRange: [headerHeight / 4, 0],
    extrapolate: 'clamp',
  });
  
  // 图片背景比例
  const imageScale = scrollY.interpolate({
    inputRange: [-200, 0],
    outputRange: [1.5, 1],
    extrapolateRight: 'clamp',
  });
  
  const renderImageCarousel = () => {
    if (!relic) return null;
    
    return (
      <View style={styles.imageCarouselContainer}>
        <FlatList
          data={relic.images}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <Image 
              source={{ uri: item }} 
              style={styles.carouselImage}
              resizeMode="cover"
            />
          )}
          onMomentumScrollEnd={(event) => {
            const newIndex = Math.floor(event.nativeEvent.contentOffset.x / width);
            setCurrentImageIndex(newIndex);
          }}
          keyExtractor={(_, index) => index.toString()}
        />
        
        {/* 轮播指示器 */}
        <View style={styles.paginationContainer}>
          {relic.images.map((_, index) => (
            <View 
              key={index} 
              style={[
                styles.paginationDot,
                index === currentImageIndex && styles.paginationDotActive
              ]} 
            />
          ))}
        </View>
        
        {/* 顶部操作栏 */}
        <View style={styles.imageHeaderActions}>
          <TouchableOpacity 
            style={styles.headerActionButton}
            onPress={handleBackPress}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.white} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.headerActionButton}
            onPress={handleShare}
          >
            <Ionicons name="share-outline" size={24} color={COLORS.white} />
          </TouchableOpacity>
        </View>
        
        {/* 渐变遮罩 */}
        <LinearGradient
          colors={['rgba(0,0,0,0.6)', 'transparent', 'rgba(0,0,0,0.6)']}
          style={styles.imageGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        />
      </View>
    );
  };
  
  const renderRelicInfo = () => {
    if (!relic) return null;
    
    return (
      <View style={styles.relicInfoContainer}>
        <View style={styles.basicInfoSection}>
          <Text style={styles.relicTitle}>{relic.name}</Text>
          
          <View style={styles.metaInfoRow}>
            <View style={styles.dynastyBadge}>
              <Text style={styles.dynastyText}>{relic.dynasty}</Text>
            </View>
            <Text style={styles.eraText}>{relic.era}</Text>
          </View>
          
          <View style={styles.locationContainer}>
            <Ionicons name="location" size={16} color={COLORS.primary} />
            <Text style={styles.locationText}>{relic.location}</Text>
          </View>
          
          <Text style={styles.relicDescription}>{relic.description}</Text>
        </View>
        
        <View style={styles.detailsSection}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <View style={styles.sectionTitleDecoration} />
              <Text style={styles.sectionTitle}>详细介绍</Text>
            </View>
          </View>
          
          <Text style={styles.detailContent}>{relic.longDescription}</Text>
        </View>
        
        <View style={styles.detailsSection}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <View style={styles.sectionTitleDecoration} />
              <Text style={styles.sectionTitle}>文物知识点</Text>
            </View>
          </View>
          
          <View style={styles.factsContainer}>
            {relic.facts.map((fact, index) => (
              <View key={index} style={styles.factItem}>
                <View style={styles.factBullet}>
                  <Text style={styles.factBulletText}>{index + 1}</Text>
                </View>
                <Text style={styles.factText}>{fact}</Text>
              </View>
            ))}
          </View>
        </View>
        
        {relatedRelics.length > 0 && (
          <View style={styles.detailsSection}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleContainer}>
                <View style={styles.sectionTitleDecoration} />
                <Text style={styles.sectionTitle}>相关文物</Text>
              </View>
            </View>
            
            <View style={styles.relatedRelicsContainer}>
              {relatedRelics.map((relatedRelic) => (
                <TouchableOpacity 
                  key={relatedRelic.id}
                  style={styles.relatedRelicCard}
                  onPress={() => router.push(`/relic/${relatedRelic.id}`)}
                  activeOpacity={0.8}
                >
                  <Image 
                    source={{ uri: relatedRelic.imageUrl }}
                    style={styles.relatedRelicImage}
                  />
                  <View style={styles.relatedRelicInfo}>
                    <Text style={styles.relatedRelicName} numberOfLines={1}>
                      {relatedRelic.name}
                    </Text>
                    <Text style={styles.relatedRelicDynasty}>{relatedRelic.dynasty}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
        
        <TouchableOpacity 
          style={styles.storyButton}
          onPress={() => router.push(`/story/${relic.id}`)}
        >
          <LinearGradient
            colors={[COLORS.primary, COLORS.primaryDark]}
            style={StyleSheet.absoluteFill}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          />
          <Text style={styles.storyButtonText}>进入故事体验</Text>
          <Ionicons name="arrow-forward" size={20} color={COLORS.white} style={styles.storyButtonIcon} />
        </TouchableOpacity>
      </View>
    );
  };
  
  const renderHeaderTitle = () => {
    return (
      <Animated.View 
        style={[
          styles.floatingHeader,
          {
            opacity: headerOpacity,
            transform: [{ translateY: headerTranslateY }]
          }
        ]}
      >
        <TouchableOpacity 
          style={styles.floatingBackButton}
          onPress={handleBackPress}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        
        {relic && (
          <Text style={styles.floatingHeaderTitle} numberOfLines={1}>
            {relic.name}
          </Text>
        )}
        
        <TouchableOpacity 
          style={styles.floatingShareButton}
          onPress={handleShare}
        >
          <Ionicons name="share-outline" size={22} color={COLORS.text} />
        </TouchableOpacity>
      </Animated.View>
    );
  };
  
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>正在加载文物信息...</Text>
      </View>
    );
  }
  
  if (!relic) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={50} color={COLORS.error} />
        <Text style={styles.errorText}>未找到该文物信息</Text>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={handleBackPress}
        >
          <Text style={styles.backButtonText}>返回</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {renderHeaderTitle()}
      
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
      >
        {renderImageCarousel()}
        {renderRelicInfo()}
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  
  // 加载状态
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: SPACING.medium,
    fontSize: FONTS.size.medium,
    color: COLORS.text,
  },
  
  // 错误状态
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: SPACING.large,
  },
  errorText: {
    marginTop: SPACING.medium,
    fontSize: FONTS.size.large,
    color: COLORS.text,
    marginBottom: SPACING.large,
    textAlign: 'center',
  },
  backButton: {
    paddingHorizontal: SPACING.large,
    paddingVertical: SPACING.medium,
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.medium,
  },
  backButtonText: {
    fontSize: FONTS.size.medium,
    color: COLORS.white,
    fontWeight: '600',
  },
  
  // 浮动标题
  floatingHeader: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 100,
    paddingHorizontal: SPACING.medium,
    height: 50,
  },
  floatingBackButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  floatingShareButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  floatingHeaderTitle: {
    flex: 1,
    fontSize: FONTS.size.large,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
    marginHorizontal: SPACING.small,
  },
  
  // 图片轮播
  imageCarouselContainer: {
    height: 300,
    width: '100%',
    position: 'relative',
  },
  carouselImage: {
    width,
    height: 300,
  },
  imageHeaderActions: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.medium,
    zIndex: 10,
  },
  headerActionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 300,
    zIndex: 1,
  },
  paginationContainer: {
    position: 'absolute',
    bottom: SPACING.medium,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    zIndex: 10,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.5)',
    marginHorizontal: 4,
  },
  paginationDotActive: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.white,
  },
  
  // 文物信息
  relicInfoContainer: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: RADIUS.large,
    borderTopRightRadius: RADIUS.large,
    marginTop: -20,
    paddingBottom: 30,
  },
  basicInfoSection: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.large,
    margin: SPACING.medium,
    padding: SPACING.medium,
    ...SHADOWS.medium,
  },
  relicTitle: {
    fontSize: FONTS.size.large,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.small,
  },
  metaInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.small,
  },
  dynastyBadge: {
    backgroundColor: `${COLORS.primary}20`,
    paddingHorizontal: SPACING.small,
    paddingVertical: 4,
    borderRadius: RADIUS.small,
    marginRight: SPACING.small,
  },
  dynastyText: {
    fontSize: FONTS.size.small,
    color: COLORS.primary,
    fontWeight: '600',
  },
  eraText: {
    fontSize: FONTS.size.small,
    color: COLORS.textLight,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.medium,
  },
  locationText: {
    fontSize: FONTS.size.small,
    color: COLORS.textSecondary,
    marginLeft: 4,
  },
  relicDescription: {
    fontSize: FONTS.size.medium,
    lineHeight: 24,
    color: COLORS.text,
  },
  
  // 详情区域
  detailsSection: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.large,
    margin: SPACING.medium,
    marginTop: 0,
    padding: SPACING.medium,
    ...SHADOWS.small,
  },
  sectionHeader: {
    marginBottom: SPACING.medium,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitleDecoration: {
    width: 4,
    height: 24,
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.small,
    marginRight: SPACING.small,
  },
  sectionTitle: {
    fontSize: FONTS.size.large,
    fontWeight: '600',
    color: COLORS.text,
  },
  detailContent: {
    fontSize: FONTS.size.medium,
    lineHeight: 24,
    color: COLORS.text,
  },
  
  // 知识点区域
  factsContainer: {
    marginTop: SPACING.small,
  },
  factItem: {
    flexDirection: 'row',
    marginBottom: SPACING.medium,
    alignItems: 'flex-start',
  },
  factBullet: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: `${COLORS.primary}20`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.small,
    marginTop: 2,
  },
  factBulletText: {
    fontSize: FONTS.size.small,
    fontWeight: '700',
    color: COLORS.primary,
  },
  factText: {
    flex: 1,
    fontSize: FONTS.size.medium,
    lineHeight: 22,
    color: COLORS.text,
  },
  
  // 相关文物
  relatedRelicsContainer: {
    marginTop: SPACING.small,
  },
  relatedRelicCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.backgroundLight,
    borderRadius: RADIUS.medium,
    marginBottom: SPACING.small,
    overflow: 'hidden',
    height: 80,
  },
  relatedRelicImage: {
    width: 80,
    height: 80,
  },
  relatedRelicInfo: {
    flex: 1,
    padding: SPACING.small,
    justifyContent: 'center',
  },
  relatedRelicName: {
    fontSize: FONTS.size.medium,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  relatedRelicDynasty: {
    fontSize: FONTS.size.small,
    color: COLORS.textLight,
  },
  
  // 底部按钮
  storyButton: {
    height: 50,
    borderRadius: RADIUS.medium,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: SPACING.medium,
    marginTop: SPACING.small,
    marginBottom: SPACING.large,
    overflow: 'hidden',
    ...SHADOWS.medium,
  },
  storyButtonText: {
    fontSize: FONTS.size.medium,
    fontWeight: '600',
    color: COLORS.white,
  },
  storyButtonIcon: {
    marginLeft: SPACING.small,
  },
}); 