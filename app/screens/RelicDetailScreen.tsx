import React, { useState, useEffect } from 'react';
import { 
  View, ScrollView, Text, TouchableOpacity, 
  StyleSheet, Dimensions
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';

// 定义类型
interface Relic {
  id: string;
  name: string;
  dynasty: string;
  period: string;
  excavationSite: string;
  material: string;
  size: string;
  museum: string;
  description: string;
  historicalBackground: string;
  color: string;
  has3DModel: boolean;
  modelUrl?: string;
  audioUrl?: string;
}

interface RelicsData {
  [key: string]: Relic;
}

// 模拟文物数据
const mockRelics: RelicsData = {
  '101': {
    id: '101',
    name: '青铜器·后母戊鼎',
    dynasty: '商代',
    period: '公元前13世纪',
    excavationSite: '河南安阳殷墟',
    material: '青铜',
    size: '高133厘米，重832.84千克',
    museum: '中国国家博物馆',
    description: '后母戊鼎，又称司母戊鼎，是中国现存最大的商代青铜器。鼎为圆腹方口，四壁饰有兽面纹，造型庄重，气势雄伟，是商代青铜铸造工艺的巅峰之作。',
    historicalBackground: '商代是中国青铜文化的鼎盛时期，青铜器是当时贵族身份和地位的象征。后母戊鼎可能是商王为祭祀祖先或重要仪式而铸造的，体现了商代高超的青铜铸造技术和艺术水平。',
    color: '#8D6E63',
    has3DModel: true,
    modelUrl: '../../assets/models/ding.glb',
    audioUrl: '../../assets/audio/ding-intro.mp3'
  },
  '201': {
    id: '201',
    name: '瓷器·青花瓷',
    dynasty: '元代',
    period: '14世纪',
    excavationSite: '江西景德镇',
    material: '瓷器',
    size: '高30厘米，口径15厘米',
    museum: '故宫博物院',
    description: '元代青花瓷是中国瓷器发展史上的重要里程碑。它采用钴料在瓷坯上绘制纹饰，再施透明釉一次烧成。其特点是胎体坚硬细腻，釉色莹润，青花发色浓艳，纹饰清晰流畅。',
    historicalBackground: '元代是中国青花瓷的发展高峰期，当时大量出口到西亚和欧洲，对世界陶瓷艺术产生了深远影响。元青花的出现标志着中国瓷器装饰技术的重大突破。',
    color: '#78909C',
    has3DModel: false,
    audioUrl: '../../assets/audio/qinghua-intro.mp3'
  },
  '401': {
    id: '401',
    name: '壁画·敦煌莫高窟壁画',
    dynasty: '魏晋至元代',
    period: '4世纪至14世纪',
    excavationSite: '甘肃敦煌莫高窟',
    material: '矿物颜料、金箔',
    size: '洞窟内壁画总面积45000平方米',
    museum: '敦煌研究院',
    description: '敦煌莫高窟壁画是世界上现存规模最大、内容最丰富的佛教艺术宝库。壁画内容包括佛教故事、经变画、供养人像、山水风景等，展现了中国古代绘画艺术的辉煌成就。',
    historicalBackground: '敦煌位于古丝绸之路要道，是东西方文化交流的重要枢纽。莫高窟的开凿和壁画创作历经千年，记录了中国佛教艺术的发展历程，也反映了各个时期的社会生活和文化艺术特色。',
    color: '#FFA726',
    has3DModel: false,
    audioUrl: '../../assets/audio/dunhuang-intro.mp3'
  },
  '501': {
    id: '501',
    name: '青铜器·三星堆青铜面具',
    dynasty: '商代',
    period: '公元前12-11世纪',
    excavationSite: '四川广汉三星堆遗址',
    material: '青铜',
    size: '高65厘米，宽138厘米',
    museum: '三星堆博物馆',
    description: '三星堆青铜面具造型奇特，眼睛突出，耳朵夸张，具有强烈的宗教祭祀色彩。这些面具的发现，改写了中国青铜文明的历史，证明了长江流域早期文明的独立发展。',
    historicalBackground: '三星堆文化是中国古代巴蜀地区的重要文明，与中原地区的商文化同时期但风格迥异。三星堆遗址的发现，揭示了中国古代文明的多元发展格局，丰富了对中华文明起源的认识。',
    color: '#5C6BC0',
    has3DModel: true,
    modelUrl: '../../assets/models/mask.glb',
    audioUrl: '../../assets/audio/mask-intro.mp3'
  }
};

const { width } = Dimensions.get('window');

const RelicDetailScreen = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [relic, setRelic] = useState<Relic | null>(null);
  const [activeTab, setActiveTab] = useState('info');
  
  useEffect(() => {
    // 在实际应用中，这里应该从API获取数据
    if (id && typeof id === 'string' && mockRelics[id]) {
      setRelic(mockRelics[id]);
    }
  }, [id]);
  
  if (!relic) {
    return (
      <View style={styles.loading}>
        <Text>加载中...</Text>
      </View>
    );
  }
  
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <StatusBar style="light" />
      <ScrollView>
        {/* 文物图片展示区（用色块替代） */}
        <View style={styles.imageContainer}>
          <View style={[styles.imagePlaceholder, { backgroundColor: relic.color }]}>
            <View style={styles.imageOverlay}>
              <TouchableOpacity 
                style={styles.backButton}
                onPress={() => router.back()}
              >
                <Text style={styles.backButtonText}>返回</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        
        {/* 文物基本信息 */}
        <View style={styles.infoContainer}>
          <Text style={styles.title}>{relic.name}</Text>
          <Text style={styles.dynasty}>{relic.dynasty}</Text>
          
          {/* 标签页导航 */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'info' && styles.activeTab]}
              onPress={() => setActiveTab('info')}
            >
              <Text style={styles.tabText}>基本信息</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'history' && styles.activeTab]}
              onPress={() => setActiveTab('history')}
            >
              <Text style={styles.tabText}>历史背景</Text>
            </TouchableOpacity>
          </View>
          
          {/* 标签页内容 */}
          {activeTab === 'info' && (
            <View style={styles.tabContent}>
              <Text style={styles.infoText}>年代：{relic.period}</Text>
              <Text style={styles.infoText}>出土地：{relic.excavationSite}</Text>
              <Text style={styles.infoText}>材质：{relic.material}</Text>
              <Text style={styles.infoText}>尺寸：{relic.size}</Text>
              <Text style={styles.infoText}>收藏于：{relic.museum}</Text>
              <Text style={styles.description}>{relic.description}</Text>
            </View>
          )}
          
          {activeTab === 'history' && (
            <View style={styles.tabContent}>
              <Text style={styles.historyText}>{relic.historicalBackground}</Text>
            </View>
          )}
          
          {/* 进入故事按钮 */}
          <TouchableOpacity 
            style={styles.storyButton}
            onPress={() => router.push(`/story/${relic.id}`)}
          >
            <Text style={styles.storyButtonText}>进入故事</Text>
          </TouchableOpacity>
          
          {/* 收藏和分享按钮 */}
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionIcon}>♡</Text>
              <Text style={styles.actionText}>收藏</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionIcon}>↗</Text>
              <Text style={styles.actionText}>分享</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5EFE0',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    height: width * 0.8,
    backgroundColor: '#000',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  backButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  backButtonText: {
    color: '#FFF',
    fontSize: 14,
  },
  infoContainer: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#5D4037',
    marginBottom: 8,
  },
  dynasty: {
    fontSize: 18,
    color: '#8D6E63',
    marginBottom: 16,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#D7CCC8',
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#8B4513',
  },
  tabText: {
    fontSize: 16,
    color: '#5D4037',
  },
  tabContent: {
    marginBottom: 16,
  },
  infoText: {
    fontSize: 16,
    color: '#5D4037',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#5D4037',
    lineHeight: 24,
    marginTop: 8,
  },
  historyText: {
    fontSize: 16,
    color: '#5D4037',
    lineHeight: 24,
  },
  storyButton: {
    backgroundColor: '#8B4513',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  storyButtonText: {
    color: '#F5EFE0',
    fontSize: 18,
    fontWeight: 'bold',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  actionButton: {
    alignItems: 'center',
    marginHorizontal: 24,
  },
  actionIcon: {
    fontSize: 24,
    color: '#8B4513',
  },
  actionText: {
    color: '#8B4513',
    marginTop: 4,
  },
});

export default RelicDetailScreen; 