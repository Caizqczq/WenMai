import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  Image, 
  Dimensions, 
  Platform,
  ImageBackground,
  FlatList,
  ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons, MaterialIcons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../constants/Colors';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { relicService } from '../../data/services';
import { Relic } from '../../data/types';
import LoadingIndicator from '../../components/ui/LoadingIndicator';
import { getImageSource } from '../../utils/imageUtils';

const { width } = Dimensions.get('window');

// 定义类型
interface Achievement {
  id: string;
  name: string;
  description: string;
  completed: boolean;
  icon: string;
}

interface Activity {
  id: string;
  type: string;
  target: string;
  time: string;
}

// 扩展Relic类型，添加点亮状态
interface RelicWithLitStatus extends Relic {
  isLit: boolean;
}

// 修改mockUser，添加文物点亮统计
const mockUser = {
  name: '文化探索者',
  avatar: 'https://picsum.photos/id/64/200/200',
  level: 3,
  points: 280,
  collectionCount: 3,
  viewedCount: 15,
  litRelicsCount: 5, // 已点亮的文物数量
  totalRelicsCount: 15, // 总文物数量
  achievements: [
    { id: '1', name: '初识文物', description: '浏览第一件文物', completed: true, icon: '🏺' },
    { id: '2', name: '文物收藏家', description: '收藏5件文物', completed: false, icon: '🖼️' },
    { id: '3', name: '历史探索者', description: '完成3个互动故事', completed: true, icon: '📚' },
    { id: '4', name: '青铜专家', description: '浏览所有青铜器文物', completed: false, icon: '🔔' },
    { id: '5', name: '瓷器鉴赏家', description: '浏览所有瓷器文物', completed: false, icon: '🍶' },
  ],
  recentActivities: [
    { id: '1', type: 'view', target: '秦始皇兵马俑', time: '2小时前' },
    { id: '2', type: 'collect', target: '越王勾践剑', time: '昨天' },
    { id: '3', type: 'complete', target: '历史探索者成就', time: '3天前' },
  ]
};

export default function ProfileScreen() {
  const router = useRouter();
  const [allRelics, setAllRelics] = useState<RelicWithLitStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'lit' | 'unlit'>('lit');
  
  useEffect(() => {
    loadRelics();
  }, []);
  
  const loadRelics = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // 加载所有文物
      const relicsData = await relicService.getAllRelics();
      
      // 随机标记部分文物为已点亮（实际应用中应该从用户数据中获取）
      const processedRelics = relicsData.map(relic => ({
        ...relic,
        isLit: Math.random() > 0.7 // 随机设置点亮状态，仅用于演示
      }));
      
      setAllRelics(processedRelics);
    } catch (err) {
      console.error('加载文物数据失败:', err);
      setError('无法加载文物数据');
    } finally {
      setIsLoading(false);
    }
  };
  
  // 获取已点亮和未点亮的文物
  const litRelics = allRelics.filter(relic => relic.isLit);
  const unlitRelics = allRelics.filter(relic => !relic.isLit);
  
  // 当前显示的文物列表
  const displayRelics = activeTab === 'lit' ? litRelics : unlitRelics;
  
  // 计算点亮进度百分比
  const litPercentage = allRelics.length > 0 
    ? Math.round((litRelics.length / allRelics.length) * 100) 
    : 0;
  
  const renderMenuItem = (icon: React.ReactNode, title: string, onPress: () => void) => (
    <TouchableOpacity 
      style={styles.menuItem} 
      onPress={onPress} 
      activeOpacity={0.7}
    >
      <View style={styles.menuIconContainer}>
        {icon}
      </View>
      <Text style={styles.menuTitle}>{title}</Text>
      <Ionicons name="chevron-forward" size={20} color={COLORS.textLight} />
    </TouchableOpacity>
  );
  
  const getActivityIcon = (type: string) => {
    switch(type) {
      case 'view':
        return <Ionicons name="eye-outline" size={14} color={COLORS.primary} />;
      case 'collect':
        return <Ionicons name="bookmark-outline" size={14} color={COLORS.primary} />;
      case 'complete':
        return <Ionicons name="trophy-outline" size={14} color={COLORS.primary} />;
      default:
        return <Ionicons name="time-outline" size={14} color={COLORS.primary} />;
    }
  };

  // 渲染文物卡片
  const renderRelicCard = ({ item }: { item: RelicWithLitStatus }) => (
    <TouchableOpacity 
      style={[
        styles.relicCard,
        !item.isLit && styles.unlitRelicCard
      ]}
      onPress={() => router.push(`/relic/${item.id}` as any)}
      activeOpacity={0.8}
    >
      <Image 
        source={getImageSource(item.image)} 
        style={styles.relicImage} 
      />
      {!item.isLit && (
        <View style={styles.unlitOverlay}>
          <Ionicons name="scan-outline" size={28} color="white" />
        </View>
      )}
      <View style={styles.relicOverlay}>
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.7)']}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={styles.relicNameContainer}>
          <Text style={styles.relicName}>{item.name}</Text>
          <Text style={styles.relicDynasty}>{item.dynasty}</Text>
          {item.isLit && (
            <View style={styles.litBadge}>
              <Ionicons name="flashlight-outline" size={14} color="white" />
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
  
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="light" />
      
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* 用户信息头部 */}
        <View style={styles.header}>
          <ImageBackground
            source={getImageSource('https://picsum.photos/id/137/800/400')}
            style={styles.profileHeader}
            imageStyle={styles.headerImage}
          >
            <View style={styles.profileHeaderOverlay} />
            
            <View style={styles.userInfoContainer}>
              <Image 
                source={getImageSource(mockUser.avatar)}
                style={styles.avatar} 
              />
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{mockUser.name}</Text>
                <View style={styles.levelContainer}>
                  <Text style={styles.levelText}>Lv.{mockUser.level}</Text>
                </View>
              </View>
            </View>
          </ImageBackground>
          
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{mockUser.points}</Text>
              <Text style={styles.statLabel}>积分</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{litRelics.length}</Text>
              <Text style={styles.statLabel}>已点亮</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{mockUser.viewedCount}</Text>
              <Text style={styles.statLabel}>浏览</Text>
            </View>
          </View>
        </View>
        
        {/* 点亮文物 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>点亮文物</Text>
            <TouchableOpacity 
              style={styles.sectionMore}
              onPress={() => router.push('/map')}
            >
              <Text style={styles.sectionMoreText}>查看地图</Text>
              <Ionicons name="chevron-forward" size={16} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
          
          {/* 点亮进度 */}
          <View style={styles.progressContainer}>
            <View style={styles.progressInfo}>
              <Text style={styles.progressText}>点亮进度</Text>
              <Text style={styles.progressPercentage}>{litPercentage}%</Text>
            </View>
            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBar, { width: `${litPercentage}%` }]} />
            </View>
            <View style={styles.progressLabels}>
              <Text style={styles.progressCount}>
                {litRelics.length}/{allRelics.length}
              </Text>
              <TouchableOpacity onPress={() => router.push('/collection' as any)}>
                <View style={styles.scanButton}>
                  <Ionicons name="scan" size={14} color="white" />
                  <Text style={styles.scanButtonText}>去点亮</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
          
          {/* 文物标签切换 */}
          <View style={styles.tabsContainer}>
            <TouchableOpacity 
              style={[
                styles.tabButton, 
                activeTab === 'lit' && styles.activeTabButton
              ]}
              onPress={() => setActiveTab('lit')}
            >
              <Ionicons 
                name="flashlight" 
                size={18} 
                color={activeTab === 'lit' ? COLORS.primary : COLORS.textLight} 
              />
              <Text 
                style={[
                  styles.tabText,
                  activeTab === 'lit' && styles.activeTabText
                ]}
              >
                已点亮
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.tabButton,
                activeTab === 'unlit' && styles.activeTabButton
              ]}
              onPress={() => setActiveTab('unlit')}
            >
              <Ionicons 
                name="scan-outline" 
                size={18} 
                color={activeTab === 'unlit' ? COLORS.primary : COLORS.textLight} 
              />
              <Text 
                style={[
                  styles.tabText,
                  activeTab === 'unlit' && styles.activeTabText
                ]}
              >
                未点亮
              </Text>
            </TouchableOpacity>
          </View>
          
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={COLORS.primary} />
              <Text style={styles.loadingText}>加载文物...</Text>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity 
                style={styles.retryButton}
                onPress={loadRelics}
              >
                <Text style={styles.retryButtonText}>重试</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              data={displayRelics}
              renderItem={renderRelicCard}
              keyExtractor={item => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.relicListContainer}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>
                    {activeTab === 'lit' ? '暂无已点亮文物' : '恭喜您已点亮所有文物'}
                  </Text>
                </View>
              }
            />
          )}
        </View>
        
        {/* 成就进度 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>成就进度</Text>
            <TouchableOpacity 
              style={styles.sectionMore}
              onPress={() => console.log('查看全部成就')}
            >
              <Text style={styles.sectionMoreText}>全部成就</Text>
              <Ionicons name="chevron-forward" size={16} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
          
          {mockUser.achievements.map((achievement) => (
            <View 
              key={achievement.id}
              style={[
                styles.achievementItem,
                achievement.completed ? styles.achievementCompleted : null
              ]}
            >
              <View style={styles.achievementIconContainer}>
                <Text style={styles.achievementIcon}>{achievement.icon}</Text>
              </View>
              <View style={styles.achievementInfo}>
                <Text style={styles.achievementName}>{achievement.name}</Text>
                <Text style={styles.achievementDescription}>{achievement.description}</Text>
              </View>
              {achievement.completed ? (
                <View style={styles.completedBadge}>
                  <Ionicons name="checkmark-circle" size={24} color={COLORS.success} />
                </View>
              ) : (
                <View style={styles.incompleteBadge}>
                  <Ionicons name="time-outline" size={20} color={COLORS.textLight} />
                </View>
              )}
            </View>
          ))}
        </View>
        
        {/* 设置菜单 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>设置与帮助</Text>
          
          {renderMenuItem(
            <Ionicons name="settings-outline" size={22} color={COLORS.textSecondary} />,
            '应用设置',
            () => console.log('应用设置')
          )}
          
          {renderMenuItem(
            <Ionicons name="notifications-outline" size={22} color={COLORS.textSecondary} />,
            '消息通知',
            () => console.log('消息通知')
          )}
          
          {renderMenuItem(
            <Ionicons name="shield-checkmark-outline" size={22} color={COLORS.textSecondary} />,
            '隐私政策',
            () => console.log('隐私政策')
          )}
          
          {renderMenuItem(
            <Ionicons name="help-circle-outline" size={22} color={COLORS.textSecondary} />,
            '使用帮助',
            () => console.log('使用帮助')
          )}
          
          {renderMenuItem(
            <Ionicons name="information-circle-outline" size={22} color={COLORS.textSecondary} />,
            '关于我们',
            () => console.log('关于我们')
          )}
        </View>
        
        <View style={styles.footer}>
          <Text style={styles.footerText}>文脉 v1.0.0</Text>
          <Text style={styles.footerText}>© 2023 文脉文化科技</Text>
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
  header: {
    borderBottomLeftRadius: RADIUS.large,
    borderBottomRightRadius: RADIUS.large,
    overflow: 'hidden',
    ...SHADOWS.medium,
  },
  profileHeader: {
    height: 200,
    justifyContent: 'flex-end',
  },
  headerImage: {
    borderBottomLeftRadius: RADIUS.large,
    borderBottomRightRadius: RADIUS.large,
  },
  profileHeaderOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  userInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.medium,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: COLORS.white,
  },
  userInfo: {
    marginLeft: SPACING.medium,
  },
  userName: {
    fontSize: FONTS.size.large,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: 4,
  },
  levelContainer: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: SPACING.small,
    paddingVertical: 4,
    borderRadius: RADIUS.round,
  },
  levelText: {
    fontSize: FONTS.size.small,
    color: COLORS.white,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.large,
    marginTop: -20,
    marginHorizontal: SPACING.medium,
    paddingVertical: SPACING.medium,
    ...SHADOWS.small,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: FONTS.size.large,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: FONTS.size.small,
    color: COLORS.textLight,
  },
  statDivider: {
    width: 1,
    height: '70%',
    backgroundColor: COLORS.backgroundDark,
  },
  section: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.large,
    marginHorizontal: SPACING.medium,
    marginTop: SPACING.large,
    padding: SPACING.medium,
    ...SHADOWS.small,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.medium,
  },
  sectionTitle: {
    fontSize: FONTS.size.large,
    fontWeight: '700',
    color: COLORS.text,
  },
  sectionMore: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionMoreText: {
    fontSize: FONTS.size.small,
    color: COLORS.primary,
    marginRight: 2,
  },
  relicListContainer: {
    paddingVertical: SPACING.small,
  },
  relicCard: {
    width: 160,
    height: 200,
    marginRight: SPACING.medium,
    borderRadius: RADIUS.medium,
    overflow: 'hidden',
    ...SHADOWS.small,
  },
  unlitRelicCard: {
    opacity: 0.8,
  },
  relicImage: {
    width: '100%',
    height: '100%',
  },
  unlitOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  relicOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: SPACING.small,
  },
  relicNameContainer: {
    flexDirection: 'column',
    justifyContent: 'flex-end',
  },
  relicName: {
    fontSize: FONTS.size.medium,
    fontWeight: '600',
    color: COLORS.white,
    marginBottom: 2,
  },
  relicDynasty: {
    fontSize: FONTS.size.small,
    color: 'rgba(255,255,255,0.8)',
  },
  litBadge: {
    position: 'absolute',
    top: -24,
    right: 0,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundLight,
    borderRadius: RADIUS.medium,
    marginBottom: SPACING.small,
    padding: SPACING.small,
    borderWidth: 1,
    borderColor: COLORS.backgroundDark,
  },
  achievementCompleted: {
    borderColor: COLORS.primaryLight,
    backgroundColor: `${COLORS.primary}10`,
  },
  achievementIconContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.medium,
    marginRight: SPACING.small,
    ...SHADOWS.small,
  },
  achievementIcon: {
    fontSize: 20,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementName: {
    fontSize: FONTS.size.medium,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  achievementDescription: {
    fontSize: FONTS.size.small,
    color: COLORS.textLight,
  },
  completedBadge: {
    padding: SPACING.small,
  },
  incompleteBadge: {
    padding: SPACING.small,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.medium,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.backgroundDark,
  },
  menuIconContainer: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: `${COLORS.primary}10`,
    borderRadius: RADIUS.small,
    marginRight: SPACING.small,
  },
  menuTitle: {
    flex: 1,
    fontSize: FONTS.size.medium,
    color: COLORS.text,
  },
  footer: {
    padding: SPACING.large,
    alignItems: 'center',
  },
  footerText: {
    fontSize: FONTS.size.small,
    color: COLORS.textLight,
    marginBottom: 4,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.medium,
  },
  loadingText: {
    fontSize: FONTS.size.small,
    color: COLORS.primary,
    marginLeft: SPACING.small,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.medium,
  },
  errorText: {
    fontSize: FONTS.size.small,
    color: COLORS.error,
    marginRight: SPACING.small,
  },
  retryButton: {
    padding: SPACING.small,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: RADIUS.small,
  },
  retryButtonText: {
    fontSize: FONTS.size.small,
    color: COLORS.primary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: FONTS.size.small,
    color: COLORS.textLight,
  },
  progressContainer: {
    marginBottom: SPACING.medium,
    backgroundColor: COLORS.backgroundLight,
    padding: SPACING.small,
    borderRadius: RADIUS.medium,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressText: {
    fontSize: FONTS.size.small,
    color: COLORS.text,
    fontWeight: '500',
  },
  progressPercentage: {
    fontSize: FONTS.size.small,
    color: COLORS.primary,
    fontWeight: '700',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: COLORS.backgroundDark,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 4,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressCount: {
    fontSize: FONTS.size.small,
    color: COLORS.textLight,
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  scanButtonText: {
    fontSize: FONTS.size.small,
    color: COLORS.white,
    marginLeft: 4,
  },
  tabsContainer: {
    flexDirection: 'row',
    marginBottom: SPACING.medium,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.backgroundDark,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginRight: SPACING.medium,
  },
  activeTabButton: {
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    fontSize: FONTS.size.small,
    color: COLORS.textLight,
    marginLeft: 4,
  },
  activeTabText: {
    color: COLORS.primary,
    fontWeight: '600',
  },
}); 