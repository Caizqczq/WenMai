import React, { useEffect, useState } from 'react';
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
  Alert
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

const { width } = Dimensions.get('window');

// 模拟文物数据库 - 在实际应用中应该从API或数据库获取
const relicsDatabase = [
  { 
    id: '101', 
    name: '青铜器·后母戊鼎', 
    dynasty: '商代',
    era: '公元前1300年-公元前1046年',
    location: '中国国家博物馆',
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
      "莫高窟于1987年被列入世界文化遗产名录"
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
  }
];

export default function RelicDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [relic, setRelic] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    // 模拟从API获取数据
    setTimeout(() => {
      const foundRelic = relicsDatabase.find(item => item.id === id);
      setRelic(foundRelic || null);
      setLoading(false);
    }, 500);
  }, [id]);

  const handleShare = async () => {
    if (!relic) return;
    
    try {
      await Share.share({
        message: `看看我在文脉App发现的珍贵文物：${relic.name}，${relic.description}`,
        title: `文脉 - ${relic.name}`,
      });
    } catch (error) {
      console.error('分享失败:', error);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar style="dark" />
        <ActivityIndicator size="large" color="#8B4513" />
        <Text style={styles.loadingText}>加载文物信息...</Text>
      </SafeAreaView>
    );
  }

  if (!relic) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <StatusBar style="dark" />
        <Text style={styles.errorText}>未找到文物信息</Text>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>返回</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <>
      <Stack.Screen 
        options={{
          title: relic.name,
          headerShown: false,
        }} 
      />
      <StatusBar style="light" />
      
      <View style={styles.imageContainer}>
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(event) => {
            const slideIndex = Math.round(
              event.nativeEvent.contentOffset.x / width
            );
            setActiveImageIndex(slideIndex);
          }}
        >
          {relic.images.map((image: string, index: number) => (
            <Image
              key={index}
              source={{ uri: image }}
              style={styles.headerImage}
              resizeMode="cover"
            />
          ))}
        </ScrollView>
        
        <View style={styles.imagePagination}>
          {relic.images.map((_: any, index: number) => (
            <View
              key={index}
              style={[
                styles.paginationDot,
                index === activeImageIndex && styles.paginationDotActive,
              ]}
            />
          ))}
        </View>
        
        <TouchableOpacity 
          style={styles.backIconButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.shareIconButton}
          onPress={handleShare}
        >
          <Ionicons name="share-outline" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>{relic.name}</Text>
          <Text style={styles.dynasty}>{relic.dynasty} · {relic.era}</Text>
        </View>
        
        <View style={styles.infoContainer}>
          <View style={styles.infoItem}>
            <Ionicons name="location-outline" size={20} color="#8B4513" />
            <Text style={styles.infoText}>{relic.location}</Text>
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>文物简介</Text>
          <Text style={styles.description}>{relic.longDescription}</Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>文物知识</Text>
          {relic.facts.map((fact: string, index: number) => (
            <View key={index} style={styles.factItem}>
              <View style={styles.factBullet} />
              <Text style={styles.factText}>{fact}</Text>
            </View>
          ))}
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>相关推荐</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.recommendationsContainer}
          >
            {relicsDatabase
              .filter(item => item.id !== relic.id)
              .slice(0, 3)
              .map(item => (
                <TouchableOpacity 
                  key={item.id}
                  style={styles.recommendationItem}
                  onPress={() => {
                    // 导航到同一页面但使用不同的ID
                    router.push(`/relic/${item.id}`);
                  }}
                >
                  <Image 
                    source={{ uri: item.imageUrl }} 
                    style={styles.recommendationImage} 
                  />
                  <Text style={styles.recommendationName} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={styles.recommendationDynasty} numberOfLines={1}>
                    {item.dynasty}
                  </Text>
                </TouchableOpacity>
              ))
            }
          </ScrollView>
        </View>
        
        <View style={styles.footer}>
          <TouchableOpacity 
            style={styles.collectionButton}
            onPress={() => {
              // 实际应用中应该是添加到收藏
              Alert.alert('成功', '已添加到我的收藏');
            }}
          >
            <Ionicons name="bookmark-outline" size={20} color="#FFF" />
            <Text style={styles.collectionButtonText}>收藏文物</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5EFE0',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#8B4513',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5EFE0',
  },
  errorText: {
    fontSize: 18,
    color: '#D32F2F',
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: '#8B4513',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#FFF',
    fontWeight: 'bold',
  },
  container: {
    flex: 1,
    backgroundColor: '#F5EFE0',
  },
  imageContainer: {
    height: width * 0.8,
    width: '100%',
  },
  headerImage: {
    width,
    height: width * 0.8,
  },
  imagePagination: {
    position: 'absolute',
    bottom: 16,
    flexDirection: 'row',
    alignSelf: 'center',
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    margin: 4,
  },
  paginationDotActive: {
    backgroundColor: '#FFFFFF',
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  backIconButton: {
    position: 'absolute',
    top: 48,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareIconButton: {
    position: 'absolute',
    top: 48,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#5D4037',
    marginBottom: 8,
  },
  dynasty: {
    fontSize: 16,
    color: '#8D6E63',
  },
  infoContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  infoText: {
    fontSize: 14,
    color: '#8B4513',
    marginLeft: 4,
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E0D5',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#5D4037',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#5D4037',
  },
  factItem: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  factBullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#8B4513',
    marginTop: 8,
    marginRight: 8,
  },
  factText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
    color: '#5D4037',
  },
  recommendationsContainer: {
    paddingRight: 20,
  },
  recommendationItem: {
    width: 140,
    marginRight: 12,
    backgroundColor: '#FFF',
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  recommendationImage: {
    width: '100%',
    height: 100,
  },
  recommendationName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#5D4037',
    padding: 8,
    paddingBottom: 4,
  },
  recommendationDynasty: {
    fontSize: 12,
    color: '#8D6E63',
    paddingHorizontal: 8,
    paddingBottom: 8,
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  collectionButton: {
    flexDirection: 'row',
    backgroundColor: '#8B4513',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    width: '80%',
  },
  collectionButtonText: {
    fontSize: 16,
    color: '#FFF',
    fontWeight: 'bold',
    marginLeft: 8,
  },
}); 