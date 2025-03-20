import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  Image,
  Dimensions,
  ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { relicService, storyService, regionService } from '../../data/services';
import { Relic, Story, Region } from '../../data/types';
import { COLORS, RADIUS, SHADOWS } from '../../constants/Colors';
import LoadingIndicator from '../../components/ui/LoadingIndicator';

const { width } = Dimensions.get('window');

export default function ExploreScreen() {
  const router = useRouter();
  const [featuredRelics, setFeaturedRelics] = useState<Relic[]>([]);
  const [popularStories, setPopularStories] = useState<Story[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        {/* 推荐文物 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>精选文物</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScrollContent}
          >
            {featuredRelics.map(relic => (
              <TouchableOpacity
                key={relic.id}
                style={styles.relicCard}
                onPress={() => router.push(`/relic/${relic.id}` as any)}
                activeOpacity={0.8}
              >
                <Image 
                  source={{ uri: relic.image }}
                  style={styles.relicImage}
                  resizeMode="cover"
                />
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.7)']}
                  style={styles.relicGradient}
                >
                  <Text style={styles.relicName}>{relic.name}</Text>
                  <Text style={styles.relicDynasty}>{relic.dynasty}</Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        
        {/* 热门故事 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>推荐故事</Text>
          <View style={styles.storiesContainer}>
            {popularStories.map(story => (
              <TouchableOpacity 
                key={story.id}
                style={styles.storyCard}
                onPress={() => router.push(`/story/${story.id}` as any)}
                activeOpacity={0.8}
              >
                <Image 
                  source={{ uri: story.coverImage }}
                  style={styles.storyImage}
                  resizeMode="cover"
                />
                <View style={styles.storyInfo}>
                  <Text style={styles.storyTitle}>{story.title}</Text>
                  <Text style={styles.storySummary} numberOfLines={2}>
                    {story.summary}
                  </Text>
                  <View style={styles.storyMeta}>
                    <Text style={styles.storyDuration}>
                      {story.duration ? `约${story.duration}分钟` : '未知时长'}
                    </Text>
                    <View style={styles.storyButton}>
                      <Text style={styles.storyButtonText}>查看故事</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        {/* 探索地区 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>探索地区</Text>
          <TouchableOpacity 
            style={styles.mapCard}
            onPress={() => router.push('/' as any)}
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
  relicCard: {
    width: 180,
    height: 220,
    borderRadius: RADIUS.medium,
    marginRight: 15,
    overflow: 'hidden',
    ...SHADOWS.medium,
  },
  relicImage: {
    width: '100%',
    height: '100%',
  },
  relicGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    paddingHorizontal: 12,
    paddingVertical: 10,
    justifyContent: 'flex-end',
  },
  relicName: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  relicDynasty: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
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
