import React, { useState, useRef, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  Image,
  Dimensions,
  ActivityIndicator,
  FlatList,
  Animated,
  NativeSyntheticEvent,
  NativeScrollEvent
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import StoryCard from '../../components/home/StoryCard';
import { relicService, storyService, regionService } from '../../data/services';
import { Relic, Story, Region } from '../../data/types';
import { COLORS, RADIUS, SHADOWS } from '../../constants/Colors';
import LoadingIndicator from '../../components/ui/LoadingIndicator';
import { getImageSource } from '../../utils/imageUtils';

const { width } = Dimensions.get('window');

export default function ExploreScreen() {
  const router = useRouter();
  const [featuredRelics, setFeaturedRelics] = useState<Relic[]>([]);
  const [popularStories, setPopularStories] = useState<Story[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- 轮播相关状态和引用 ---
  const [currentCarouselIndex, setCurrentCarouselIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const carouselRef = useRef<FlatList<Relic>>(null);
  const carouselInterval = useRef<NodeJS.Timeout | null>(null);
  // --- 结束轮播相关 ---

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      // 并行加载多种数据
      const [relicsData, storiesData, regionsData] = await Promise.all([
        relicService.getFeaturedRelics(),
        storyService.getAllStories(), // 使用现有的方法
        regionService.getAllRegions()
      ]);
      
      setFeaturedRelics(relicsData);
      setPopularStories(storiesData.slice(0, 3)); // 取前3个作为热门
      setRegions(regionsData);
    } catch (error) {
      console.error('加载探索数据失败:', error);
      setError('加载数据失败，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // 自动轮播
  useEffect(() => {
    startCarouselTimer();
    return () => clearCarouselTimer();
  }, [currentCarouselIndex, featuredRelics]); // 依赖项保持不变

  const startCarouselTimer = () => {
    clearCarouselTimer();
    if (featuredRelics.length > 1) { // 至少需要两项才能轮播
      carouselInterval.current = setInterval(() => {
        if (carouselRef.current) {
          const nextIndex = (currentCarouselIndex + 1) % featuredRelics.length;
          carouselRef.current.scrollToIndex({
            index: nextIndex,
            animated: true,
          });
          // 注意：不要在这里调用 setCurrentCarouselIndex，它会在 onMomentumScrollEnd 中更新
        }
      }, 5000); // 5秒切换
    }
  };

  const clearCarouselTimer = () => {
    if (carouselInterval.current) {
      clearInterval(carouselInterval.current);
      carouselInterval.current = null;
    }
  };

  // 监听轮播滚动结束事件，手动滑动时更新 index
  const handleMomentumScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const newIndex = Math.round(event.nativeEvent.contentOffset.x / width);
    if (newIndex !== currentCarouselIndex) {
        setCurrentCarouselIndex(newIndex);
        startCarouselTimer(); // 手动滑动后重置计时器
    }
  };

  // 渲染分页指示器
  const renderPagination = () => (
    <View style={styles.paginationContainer}>
      {featuredRelics.map((_, index) => (
        <Animated.View
          key={`dot-${index}`}
          style={[
            styles.paginationDot,
            {
              opacity: scrollX.interpolate({
                inputRange: [(index - 1) * width, index * width, (index + 1) * width],
                outputRange: [0.3, 1, 0.3],
                extrapolate: 'clamp',
              }),
              backgroundColor: COLORS.primary, // 使用主题色
            },
          ]}
        />
      ))}
    </View>
  );
  // --- 结束轮播相关函数 ---

  // 渲染加载状态
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        <LoadingIndicator 
          type="page"
          message="正在加载探索内容..." 
          color={COLORS.primary}
        />
      </SafeAreaView>
    );
  }

  // 渲染错误状态
  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={60} color={COLORS.error} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => {
              setError(null);
              setIsLoading(true);
              loadData();
            }}
          >
            <Text style={styles.retryButtonText}>重试</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>探索发现</Text>
      </View>
      
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* 精选文物轮播 */}
        {featuredRelics.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>精选文物</Text>
            <View style={styles.carouselContainer}>
              <FlatList
                ref={carouselRef}
                data={featuredRelics}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={Animated.event(
                  [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                  { useNativeDriver: false } // 动画使用 JS 驱动
                )}
                onMomentumScrollEnd={handleMomentumScrollEnd} // 处理手动滑动结束
                keyExtractor={(item) => `featured-${item.id}`} // 确保 key 唯一
                renderItem={({ item }) => (
                  <TouchableOpacity
                    activeOpacity={0.9}
                    style={styles.carouselItem} // 使用轮播项样式
                    onPress={() => router.push(`/relic/${item.id}` as any)}
                    // 按下时暂停轮播，松开时恢复
                    onPressIn={clearCarouselTimer}
                    onPressOut={startCarouselTimer}
                  >
                    <Image 
                      source={getImageSource(item.image)}
                      style={styles.carouselImage} // 使用轮播图片样式
                      resizeMode="cover"
                    />
                    <LinearGradient
                      colors={['transparent', 'rgba(0,0,0,0.8)']} // 调整渐变效果
                      style={styles.carouselGradient} // 使用轮播渐变样式
                      start={{ x: 0, y: 0.5 }} // 调整渐变方向
                      end={{ x: 0, y: 1 }}
                    >
                      <Text style={styles.carouselTitle}>{item.name}</Text>
                      <Text style={styles.carouselSubtitle}>{item.dynasty}</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                )}
                 // 添加snapToInterval以确保对齐
                snapToInterval={width * 0.9} // 对齐间隔等于项目/容器宽度
                decelerationRate="fast" // 加快减速
                // 移除 contentContainerStyle 的 padding
                // contentContainerStyle={styles.carouselFlatListContent}
              />
              {renderPagination()} 
            </View>
          </View>
        )}
        
        {/* 热门故事 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>推荐故事</Text>
          <View style={styles.storiesContainer}>
            {popularStories.map(story => (
              <StoryCard
                key={story.id}
                id={story.id}
                title={story.title}
                cover={story.coverImage}
                description={story.summary}
                completionRate={0}
                isNew={false}
                supportsLandscape={story.supportsLandscape}
              />
            ))}
          </View>
        </View>
        
        {/* 探索地区 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>探索地区</Text>
          <TouchableOpacity 
            style={styles.mapCard}
            onPress={() => router.push('/map' as any)}
            activeOpacity={0.8}
          >
            <Image 
              source={{ uri: 'https://img.freepik.com/free-vector/china-map-concept_23-2147784657.jpg' }}
              style={styles.mapImage}
              resizeMode="cover"
            />
            <View style={styles.mapOverlay}>
              <Text style={styles.mapTitle}>浏览文物地图</Text>
              <Text style={styles.mapDescription}>
                探索全国各地区的文物分布
              </Text>
            </View>
          </TouchableOpacity>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScrollContent}
          >
            {regions.map(region => (
              <TouchableOpacity
                key={region.id}
                style={styles.regionCard}
                onPress={() => router.push(`/region/${region.id}` as any)}
                activeOpacity={0.8}
              >
                <View style={styles.regionContent}>
                  <Text style={styles.regionName}>{region.name}</Text>
                  <Text style={styles.regionCount}>
                    {region.relicCount || 0}件文物
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: RADIUS.medium,
  },
  retryButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '500',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.text,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 15,
    paddingHorizontal: 20,
  },
  horizontalScrollContent: {
    paddingLeft: 20,
    paddingRight: 10,
  },
  carouselContainer: {
    // 使容器居中并设置宽度
    width: width * 0.9,
    alignSelf: 'center', // 替代 marginHorizontal 计算
    borderRadius: RADIUS.medium, // 给容器添加圆角
    overflow: 'hidden', // 隐藏内部超出部分
    // marginBottom: 25, // 已在 section 样式中处理
  },
  carouselItem: {
    width: width * 0.9, // 项目宽度等于容器宽度
    height: (width * 0.9) * 0.5, // 高度按比例调整
    // borderRadius: RADIUS.medium, // 圆角由容器处理
    // overflow: 'hidden', // 确保移除，避免双重裁剪
  },
  carouselImage: {
    width: '100%',
    height: '100%',
  },
  carouselGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '50%',
    justifyContent: 'flex-end',
    paddingHorizontal: 12,
    paddingBottom: 10,
  },
  carouselTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
    marginBottom: 4,
  },
  carouselSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
    marginHorizontal: 4,
  },
  storiesContainer: {
    paddingHorizontal: 20,
  },
  storyCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.medium,
    marginBottom: 15,
    overflow: 'hidden',
    ...SHADOWS.small,
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
  },
  storyMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  storyDuration: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  storyButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.small,
  },
  storyButtonText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '500',
  },
  mapCard: {
    height: 150,
    marginHorizontal: 20,
    borderRadius: RADIUS.medium,
    overflow: 'hidden',
    marginBottom: 15,
    ...SHADOWS.medium,
  },
  mapImage: {
    width: '100%',
    height: '100%',
  },
  mapOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    padding: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapTitle: {
    color: COLORS.white,
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  mapDescription: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    textAlign: 'center',
  },
  regionCard: {
    width: 120,
    height: 80,
    borderRadius: RADIUS.medium,
    marginRight: 12,
    backgroundColor: COLORS.primary,
    ...SHADOWS.small,
  },
  regionContent: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  regionName: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
  },
  regionCount: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
  },
});
