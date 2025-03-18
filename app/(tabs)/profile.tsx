import React from 'react';
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
  FlatList
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons, MaterialIcons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../constants/Colors';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

// 定义类型
interface RelicItem {
  id: string;
  name: string;
  dynasty: string;
  image: string;
}

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

// 模拟用户数据
const mockUser = {
  name: '文化探索者',
  avatar: 'https://picsum.photos/id/64/200/200',
  level: 3,
  points: 280,
  collectionCount: 3,
  viewedCount: 15,
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
  ],
  collectedRelics: [
    { id: '102', name: '越王勾践剑', dynasty: '春秋晚期', image: 'https://picsum.photos/id/65/300/300' },
    { id: '103', name: '秦始皇兵马俑', dynasty: '秦代', image: 'https://picsum.photos/id/338/300/300' },
    { id: '104', name: '唐三彩', dynasty: '唐代', image: 'https://picsum.photos/id/23/300/300' },
  ]
};

export default function ProfileScreen() {
  const router = useRouter();
  
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

  const renderCollectedRelic = ({ item }: { item: RelicItem }) => (
    <TouchableOpacity 
      style={styles.relicCard}
      onPress={() => router.push(`/relic/${item.id}`)}
      activeOpacity={0.8}
    >
      <Image source={{ uri: item.image }} style={styles.relicImage} />
      <View style={styles.relicOverlay}>
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.7)']}
          style={StyleSheet.absoluteFillObject}
        />
        <Text style={styles.relicName}>{item.name}</Text>
        <Text style={styles.relicDynasty}>{item.dynasty}</Text>
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
            source={{ uri: 'https://picsum.photos/id/137/800/400' }}
            style={styles.profileHeader}
            imageStyle={styles.headerImage}
          >
            <View style={styles.profileHeaderOverlay} />
            
            <View style={styles.userInfoContainer}>
              <Image 
                source={{ uri: mockUser.avatar }} 
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
              <Text style={styles.statValue}>{mockUser.collectionCount}</Text>
              <Text style={styles.statLabel}>收藏</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{mockUser.viewedCount}</Text>
              <Text style={styles.statLabel}>浏览</Text>
            </View>
          </View>
        </View>
        
        {/* 收藏的文物 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>我的收藏</Text>
            <TouchableOpacity 
              style={styles.sectionMore}
              onPress={() => console.log('查看全部收藏')}
            >
              <Text style={styles.sectionMoreText}>查看全部</Text>
              <Ionicons name="chevron-forward" size={16} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={mockUser.collectedRelics}
            renderItem={renderCollectedRelic}
            keyExtractor={item => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.relicListContainer}
          />
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
  relicImage: {
    width: '100%',
    height: '100%',
  },
  relicOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: SPACING.small,
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
}); 