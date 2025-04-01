import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  ScrollView, 
  TouchableOpacity, 
  Dimensions, 
  StatusBar as RNStatusBar, 
  ActivityIndicator,
  ImageBackground 
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../constants/Colors';
import { getImageSource } from '../../utils/imageUtils';
import { regionService, relicService } from '../../data/services';
import { Relic, RelicSite } from '../../data/types';

const { width } = Dimensions.get('window');

export default function MuseumScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const museumId = typeof id === 'string' ? id : '';
  
  const [museum, setMuseum] = useState<RelicSite | null>(null);
  const [relics, setRelics] = useState<Relic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const loadMuseumDetails = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // 加载博物馆信息
        const museumData = await regionService.getRelicSiteById(museumId);
        if (!museumData) {
          throw new Error('博物馆信息不存在');
        }
        setMuseum(museumData);
        
        // 加载馆藏文物信息
        if (museumData.relicIds && museumData.relicIds.length > 0) {
          const relicsPromises = museumData.relicIds.map(relicId => 
            relicService.getRelicById(relicId)
          );
          
          const relicsData = await Promise.all(relicsPromises);
          // 过滤掉undefined的结果
          setRelics(relicsData.filter(relic => relic !== undefined) as Relic[]);
        }
      } catch (err) {
        console.error('加载博物馆详情失败:', err);
        setError('无法加载博物馆信息，请稍后重试');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (museumId) {
      loadMuseumDetails();
    }
  }, [museumId]);
  
  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <ImageBackground
        source={museum?.imageUrl ? getImageSource(museum.imageUrl) : getImageSource('/images/goujian_story_cover.jpg')}
        style={styles.headerImage}
      >
        <LinearGradient
          colors={['rgba(0,0,0,0.7)', 'transparent', 'rgba(0,0,0,0.7)']}
          style={styles.headerGradient}
        >
          <SafeAreaView edges={['top']} style={styles.safeArea}>
            <View style={styles.headerContent}>
              <TouchableOpacity 
                style={styles.backButton} 
                onPress={() => router.back()}
              >
                <Ionicons name="arrow-back" size={24} color="white" />
              </TouchableOpacity>
              
              <View style={styles.museumInfo}>
                <Text style={styles.museumName}>{museum?.name || '博物馆详情'}</Text>
                {museum?.type && (
                  <View style={styles.typeTag}>
                    <Text style={styles.typeText}>
                      {museum.type === 'museum' ? '博物馆' : 
                       museum.type === 'site' ? '遗址' : '纪念碑'}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </SafeAreaView>
        </LinearGradient>
      </ImageBackground>
    </View>
  );
  
  const renderRelicCard = (relic: Relic) => (
    <TouchableOpacity
      key={relic.id}
      style={styles.relicCard}
      onPress={() => router.push(`/relic/${relic.id}` as any)}
      activeOpacity={0.7}
    >
      <Image 
        source={getImageSource(relic.image)} 
        style={styles.relicImage}
        resizeMode="cover"
      />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.8)']}
        style={styles.relicGradient}
      >
        <Text style={styles.relicName}>{relic.name}</Text>
        <Text style={styles.relicDynasty}>{relic.dynasty}</Text>
      </LinearGradient>
      
      <View style={styles.relicIconContainer}>
        <Ionicons name="eye-outline" size={14} color="white" />
        <Text style={styles.relicIconText}>123</Text>
      </View>
    </TouchableOpacity>
  );
  
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>加载博物馆信息...</Text>
      </View>
    );
  }
  
  if (error || !museum) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={60} color={COLORS.error} />
        <Text style={styles.errorText}>{error || '博物馆信息不存在'}</Text>
        <TouchableOpacity 
          style={styles.errorButton}
          onPress={() => router.back()}
        >
          <Text style={styles.errorButtonText}>返回</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <Stack.Screen options={{ headerShown: false }} />
      
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {renderHeader()}
        
        <View style={styles.contentContainer}>
          {/* 博物馆描述 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>博物馆简介</Text>
            <Text style={styles.description}>
              {museum.description || '暂无简介信息'}
            </Text>
          </View>
          
          {/* 地理信息 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>地理位置</Text>
            <View style={styles.locationInfo}>
              <Ionicons name="location" size={18} color={COLORS.primary} />
              <Text style={styles.locationText}>
                {`经度: ${museum.longitude.toFixed(4)}, 纬度: ${museum.latitude.toFixed(4)}`}
              </Text>
            </View>
          </View>
          
          {/* 馆藏文物 - 改为轮播图 */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>馆藏文物</Text>
              <Text style={styles.relicCount}>
                {relics.length}件展品
              </Text>
            </View>
            
            {relics.length > 0 ? (
              <View>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.relicsCarousel}
                  snapToInterval={width * 0.75 + SPACING.medium}
                  decelerationRate="fast"
                  pagingEnabled={false}
                >
                  {relics.map(relic => renderRelicCard(relic))}
                </ScrollView>
                <Text style={styles.carouselHint}>← 左右滑动查看更多 →</Text>
              </View>
            ) : (
              <View style={styles.emptyRelics}>
                <Text style={styles.emptyText}>暂无文物信息</Text>
              </View>
            )}
          </View>
          
          {/* 参观信息 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>参观指南</Text>
            <View style={styles.guideContainer}>
              <View style={styles.guideItemLeft}>
                <View style={[styles.guideIcon, { backgroundColor: 'rgba(52, 152, 219, 0.2)' }]}>
                  <Ionicons name="time-outline" size={22} color="#3498db" />
                </View>
                <View>
                  <Text style={styles.guideLabel}>开放时间</Text>
                  <Text style={styles.guideText}>9:00 - 17:00</Text>
                  <Text style={styles.guideSubText}>(周一闭馆)</Text>
                </View>
              </View>
              
              <View style={styles.guideItemRight}>
                <View style={[styles.guideIcon, { backgroundColor: 'rgba(155, 89, 182, 0.2)' }]}>
                  <Ionicons name="ticket-outline" size={22} color="#9b59b6" />
                </View>
                <View>
                  <Text style={styles.guideLabel}>门票信息</Text>
                  <Text style={styles.guideText}>成人票 ¥60</Text>
                  <Text style={styles.guideSubText}>学生票 ¥30</Text>
                </View>
              </View>
            </View>
            
            <View style={styles.tipContainer}>
              <View style={styles.tipIcon}>
                <Ionicons name="information-circle-outline" size={22} color="#e67e22" />
              </View>
              <Text style={styles.tipText}>温馨提示: 参观前请提前预约，大型背包需要存放在前台寄存处，馆内禁止拍照。</Text>
            </View>
          </View>
        </View>
      </ScrollView>
      
      {/* 底部操作栏 */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
          <Text style={styles.actionButtonText}>返回</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.primaryButton]}
          onPress={() => {
            // 实际应用中这里可以实现导航功能
            alert('导航功能开发中');
          }}
        >
          <Ionicons name="navigate-outline" size={24} color="white" />
          <Text style={styles.actionButtonText}>前往参观</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingBottom: 80, // 为底部操作栏留空间
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: COLORS.text,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: COLORS.background,
  },
  errorText: {
    marginTop: 10,
    fontSize: 16,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 20,
  },
  errorButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: RADIUS.medium,
  },
  errorButtonText: {
    color: 'white',
    fontSize: 16,
  },
  headerContainer: {
    width: '100%',
    height: 250,
  },
  headerImage: {
    width: '100%',
    height: '100%',
  },
  headerGradient: {
    flex: 1,
    justifyContent: 'space-between',
    padding: SPACING.medium,
  },
  safeArea: {
    flex: 1,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  museumInfo: {
    flex: 1,
  },
  museumName: {
    fontSize: FONTS.size.xxl,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  typeTag: {
    backgroundColor: 'rgba(139, 69, 19, 0.7)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    alignSelf: 'flex-start',
  },
  typeText: {
    color: 'white',
    fontSize: FONTS.size.small,
    fontWeight: '500',
  },
  contentContainer: {
    padding: SPACING.medium,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: RADIUS.medium,
    padding: SPACING.medium,
    marginBottom: SPACING.medium,
    ...SHADOWS.small,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.small,
  },
  sectionTitle: {
    fontSize: FONTS.size.large,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.small,
  },
  description: {
    fontSize: FONTS.size.medium,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: FONTS.size.medium,
    color: COLORS.textSecondary,
    marginLeft: SPACING.small,
  },
  relicCount: {
    fontSize: FONTS.size.medium,
    color: COLORS.textLight,
  },
  relicsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: SPACING.small,
    paddingHorizontal: 2,
  },
  relicsCarousel: {
    paddingVertical: SPACING.small,
    paddingRight: SPACING.medium,
  },
  relicCard: {
    width: width * 0.75,
    height: 220,
    borderRadius: RADIUS.medium,
    overflow: 'hidden',
    marginLeft: SPACING.medium,
    ...SHADOWS.medium,
  },
  relicImage: {
    width: '100%',
    height: '100%',
  },
  relicGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: SPACING.small,
  },
  relicName: {
    fontSize: FONTS.size.medium,
    fontWeight: '600',
    color: 'white',
    marginBottom: 2,
  },
  relicDynasty: {
    fontSize: FONTS.size.small,
    color: 'rgba(255,255,255,0.8)',
  },
  emptyRelics: {
    padding: SPACING.large,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: FONTS.size.medium,
    color: COLORS.textLight,
    textAlign: 'center',
  },
  guideContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.medium,
  },
  guideItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
  },
  guideItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
  },
  guideIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  guideLabel: {
    fontSize: FONTS.size.small,
    color: COLORS.textLight,
    marginBottom: 2,
  },
  guideText: {
    fontSize: FONTS.size.medium,
    color: COLORS.text,
    fontWeight: '500',
  },
  guideSubText: {
    fontSize: FONTS.size.small,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  tipContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(230, 126, 34, 0.1)',
    padding: SPACING.small,
    borderRadius: RADIUS.small,
    marginTop: SPACING.small,
  },
  tipIcon: {
    marginRight: 10,
  },
  tipText: {
    flex: 1,
    fontSize: FONTS.size.small,
    color: '#e67e22',
    lineHeight: 20,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: SPACING.medium,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    ...SHADOWS.medium,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.textLight,
    padding: SPACING.small,
    borderRadius: RADIUS.medium,
    marginHorizontal: 5,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
  },
  actionButtonText: {
    color: 'white',
    fontSize: FONTS.size.medium,
    fontWeight: '500',
    marginLeft: 5,
  },
  relicIconContainer: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  relicIconText: {
    color: 'white',
    fontSize: FONTS.size.small,
    marginLeft: 4,
  },
  carouselHint: {
    textAlign: 'center',
    color: COLORS.textLight,
    fontSize: FONTS.size.small,
    marginTop: SPACING.small,
    fontStyle: 'italic',
  },
}); 