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
  Platform,
  Alert
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons, AntDesign } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../constants/Colors';
import { Relic } from '../../data/types';
import { relicService, storyService } from '../../data/services';
import LoadingIndicator from '../../components/ui/LoadingIndicator';
import RelicDetailHeader from '../../components/RelicDetailHeader';
import { getImageSource } from '../../utils/imageUtils';

const { width, height } = Dimensions.get('window');

export default function RelicDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const scrollY = useRef(new Animated.Value(0)).current;
  const [relic, setRelic] = useState<Relic | null>(null);
  const [relatedRelics, setRelatedRelics] = useState<Relic[]>([]);
  const [stories, setStories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // 加载文物数据
  useEffect(() => {
    const loadRelicData = async () => {
      if (!id) {
        setError('缺少文物ID参数');
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        
        console.log(`正在加载文物ID为 ${id.toString()} 的数据`);
        
        // 并行加载文物数据、相关文物和故事
        const [relicData, relatedRelicsData, storiesData] = await Promise.all([
          relicService.getRelicById(id.toString()),
          relicService.getRelatedRelics(id.toString()),
          storyService.getStoriesByRelicId(id.toString())
        ]);
        
        console.log(`文物ID ${id.toString()} 获取到故事数据:`, storiesData);
        
        if (!relicData) {
          setError('未找到文物数据');
          setIsLoading(false);
          return;
        }
        
        setRelic(relicData);
        setRelatedRelics(relatedRelicsData);
        setStories(storiesData);
      } catch (error) {
        console.error('加载文物数据失败:', error);
        setError('加载文物数据失败，请稍后重试');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadRelicData();
  }, [id]);

  const handleBackPress = () => {
    router.back();
  };

  const handleShare = async () => {
    if (!relic) return;
    
    try {
      await Share.share({
        message: `查看珍贵文物：${relic.name} - 文化APP分享`,
        url: 'https://wenhua-app.example.com/relic/' + relic.id,
        title: relic.name,
      });
    } catch (error) {
      console.error('分享失败:', error);
    }
  };

  // 渲染加载状态
  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <LoadingIndicator 
          type="page"
          message="正在加载文物信息..." 
          color={COLORS.primary}
        />
      </SafeAreaView>
    );
  }
  
  // 渲染错误状态
  if (error) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={60} color={COLORS.error} />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          style={styles.tryAgainButton}
          onPress={() => router.back()}
        >
          <Text style={styles.tryAgainButtonText}>返回</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }
  
  // 如果没有数据但也没有错误，显示空状态
  if (!relic) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text style={styles.errorText}>暂无文物信息</Text>
        <TouchableOpacity 
          style={styles.tryAgainButton}
          onPress={() => router.back()}
        >
          <Text style={styles.tryAgainButtonText}>返回</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // 渲染图片轮播
  const renderImageCarousel = () => {
    // 确保图片数组存在
    const images = relic.images || [relic.image];
    
    // 将图片路径转换为映射表中的资源
    const processedImages = images.map(img => {
      // 如果图片已经是 http URL，则直接返回，否则使用 getImageSource 处理
      if (img && (img.startsWith('http://') || img.startsWith('https://'))) {
        return img;
      } else {
        return getImageSource(img);
      }
    });
    
    return (
      <View style={styles.carouselContainer}>
        <RelicDetailHeader
          imageUrls={processedImages}
          title={relic.name}
          subtitle={relic.description}
          dynasty={relic.dynasty}
          era={relic.era}
          onBack={handleBackPress}
          onShare={handleShare}
        />
      </View>
    );
  };

  // 渲染文物信息
  const renderRelicInfo = () => {
    return (
      <View style={styles.infoContainer}>
        <View style={styles.infoHeader}>
          <View style={styles.categoryTag}>
            <Text style={styles.categoryText}>{relic.category}</Text>
          </View>
          <Text style={styles.dynastyText}>{relic.dynasty} · {relic.era}</Text>
        </View>
        
        <Text style={styles.relicName}>{relic.name}</Text>
        
        <View style={styles.locationContainer}>
          <Ionicons name="location-outline" size={16} color={COLORS.textSecondary} />
          <Text style={styles.locationText}>{relic.location || '位置未知'}</Text>
        </View>
        
        <View style={styles.separator} />
        
        <Text style={styles.sectionTitle}>文物简介</Text>
        <Text style={styles.descriptionText}>{relic.description}</Text>
        
        {relic.significance && relic.significance.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>历史意义</Text>
            <View style={styles.factsContainer}>
              {relic.significance.map((fact, index) => (
                <View key={`fact-${index}`} style={styles.factItem}>
                  <View style={styles.factBullet}>
                    <Text style={styles.factBulletText}>{index + 1}</Text>
                  </View>
                  <Text style={styles.factText}>{fact}</Text>
                </View>
              ))}
            </View>
          </>
        )}
        
        {/* 故事体验入口 */}
        {stories && stories.length > 0 && (
          <View style={styles.storiesContainer}>
            <Text style={styles.sectionTitle}>故事体验</Text>
            {stories.map(story => (
              <TouchableOpacity 
                key={story.id}
                style={styles.storyCard}
                onPress={() => {
                  console.log(`准备进入故事: ${story.id}, 标题: ${story.title}`);
                  router.push(`/story/${story.id}` as any);
                }}
              >
                <Image 
                  source={getImageSource(story.coverImage)}
                  style={styles.storyImage}
                  resizeMode="cover"
                />
                <View style={styles.storyInfo}>
                  <Text style={styles.storyTitle}>{story.title}</Text>
                  <Text style={styles.storySummary} numberOfLines={2}>{story.summary}</Text>
                  <View style={styles.storyButton}>
                    <Text style={styles.storyButtonText}>进入故事</Text>
                    <Ionicons name="arrow-forward" size={14} color="white" />
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
        
        {/* 相关文物 */}
        {relatedRelics && relatedRelics.length > 0 && (
          <View style={styles.relatedRelicsContainer}>
            <Text style={styles.sectionTitle}>相关文物</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.relatedRelicsScrollView}
            >
              {relatedRelics.map(relatedRelic => (
                <TouchableOpacity
                  key={relatedRelic.id}
                  style={styles.relatedRelicCard}
                  onPress={() => {
                    // 不触发重新加载，而是直接跳到新页面
                    // 避免闪烁和重新加载相同的组件
                    router.push(`/relic/${relatedRelic.id}` as any);
                  }}
                >
                  <Image 
                    source={getImageSource(relatedRelic.image)}
                    style={styles.relatedRelicImage}
                    resizeMode="cover"
                  />
                  <View style={styles.relatedRelicInfo}>
                    <Text style={styles.relatedRelicName} numberOfLines={2}>
                      {relatedRelic.name}
                    </Text>
                    <Text style={styles.relatedRelicDynasty}>
                      {relatedRelic.dynasty}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: COLORS.background,
  },
  errorText: {
    fontSize: 18,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  tryAgainButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: RADIUS.medium,
  },
  tryAgainButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '500',
  },
  carouselContainer: {
    height: height * 0.45,
    width: width,
  },
  infoContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -24,
    paddingTop: 24,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  categoryTag: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '500',
  },
  dynastyText: {
    color: COLORS.textSecondary,
    fontSize: 15,
  },
  relicName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 10,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  locationText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginLeft: 5,
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
    marginTop: 5,
  },
  descriptionText: {
    fontSize: 15,
    lineHeight: 24,
    color: COLORS.text,
    marginBottom: 20,
  },
  factsContainer: {
    marginBottom: 24,
  },
  factItem: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  factBullet: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    marginTop: 2,
  },
  factBulletText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  factText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 22,
    color: COLORS.text,
  },
  storiesContainer: {
    marginBottom: 24,
  },
  storyCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.medium,
    overflow: 'hidden',
    marginBottom: 16,
    ...SHADOWS.medium,
  },
  storyImage: {
    width: 100,
    height: 130,
  },
  storyInfo: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  storyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 6,
  },
  storySummary: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
    marginBottom: 10,
  },
  storyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.small,
  },
  storyButtonText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '500',
    marginRight: 4,
  },
  relatedRelicsContainer: {
    marginBottom: 24,
  },
  relatedRelicsScrollView: {
    paddingBottom: 10,
  },
  relatedRelicCard: {
    width: 120,
    marginRight: 12,
    borderRadius: RADIUS.medium,
    overflow: 'hidden',
    backgroundColor: COLORS.card,
    ...SHADOWS.small,
  },
  relatedRelicImage: {
    width: 120,
    height: 100,
  },
  relatedRelicInfo: {
    padding: 8,
  },
  relatedRelicName: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.text,
    paddingBottom: 4,
  },
  relatedRelicDynasty: {
    fontSize: 12,
    color: COLORS.textSecondary,
    paddingHorizontal: 8,
    paddingBottom: 8,
  },
}); 