import React from 'react';
import { 
  View, Text, StyleSheet, 
  TouchableOpacity, ScrollView,
  Image, Dimensions, Platform,
  ImageBackground
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons, MaterialIcons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

// 模拟用户数据
const mockUser = {
  name: '文化探索者',
  avatar: 'https://picsum.photos/id/64/200/200', // 使用随机图片替代颜色
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
  ]
};

export default function ProfileScreen() {
  const router = useRouter();
  
  const renderMenuItem = (icon: React.ReactNode, title: string, onPress: () => void) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.menuIconContainer}>
        {icon}
      </View>
      <Text style={styles.menuTitle}>{title}</Text>
      <Ionicons name="chevron-forward" size={20} color="#BCAAA4" />
    </TouchableOpacity>
  );
  
  const getActivityIcon = (type: string) => {
    switch(type) {
      case 'view':
        return <Ionicons name="eye-outline" size={14} color="#8B4513" />;
      case 'collect':
        return <Ionicons name="bookmark-outline" size={14} color="#8B4513" />;
      case 'complete':
        return <Ionicons name="trophy-outline" size={14} color="#8B4513" />;
      default:
        return <Ionicons name="time-outline" size={14} color="#8B4513" />;
    }
  };
  
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="light" />
      
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* 用户信息头部 */}
        <ImageBackground
          source={{ uri: 'https://picsum.photos/id/137/800/400' }}
          style={styles.profileHeader}
        >
          <View style={styles.profileHeaderOverlay} />
          
          <View style={styles.userInfoContainer}>
            <Image 
              source={{ uri: mockUser.avatar }} 
              style={styles.avatar} 
            />
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{mockUser.name}</Text>
              <View style={styles.levelBadge}>
                <Text style={styles.levelText}>Lv.{mockUser.level}</Text>
              </View>
            </View>
          </View>
          
          <View style={styles.progressContainer}>
            <View style={styles.progressInfo}>
              <Text style={styles.progressText}>
                距离下一等级还需 {100 - (mockUser.points % 100)} 积分
              </Text>
              <Text style={styles.pointsText}>{mockUser.points} 积分</Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${(mockUser.points % 100)}%` }]} />
            </View>
          </View>
        </ImageBackground>
        
        {/* 统计信息卡片 */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{mockUser.collectionCount}</Text>
            <Text style={styles.statLabel}>收藏</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{mockUser.viewedCount}</Text>
            <Text style={styles.statLabel}>浏览</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {mockUser.achievements.filter(a => a.completed).length}/{mockUser.achievements.length}
            </Text>
            <Text style={styles.statLabel}>成就</Text>
          </View>
        </View>
        
        {/* 近期活动 */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>近期活动</Text>
            <TouchableOpacity>
              <Text style={styles.sectionAction}>查看全部</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.activitiesContainer}>
            {mockUser.recentActivities.map(activity => (
              <View key={activity.id} style={styles.activityItem}>
                <View style={styles.activityIconContainer}>
                  {getActivityIcon(activity.type)}
                </View>
                <View style={styles.activityInfo}>
                  <Text style={styles.activityText}>
                    {activity.type === 'view' && '浏览了'}
                    {activity.type === 'collect' && '收藏了'}
                    {activity.type === 'complete' && '完成了'}
                    <Text style={styles.activityHighlight}> {activity.target}</Text>
                  </Text>
                  <Text style={styles.activityTime}>{activity.time}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
        
        {/* 成就展示 */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>我的成就</Text>
            <TouchableOpacity>
              <Text style={styles.sectionAction}>查看全部</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.achievementsGrid}>
            {mockUser.achievements.map(achievement => (
              <TouchableOpacity 
                key={achievement.id} 
                style={[
                  styles.achievementItem,
                  achievement.completed ? styles.achievementCompleted : styles.achievementIncomplete
                ]}
                activeOpacity={0.8}
              >
                <View style={styles.achievementIconContainer}>
                  <Text style={styles.achievementIcon}>
                    {achievement.icon}
                  </Text>
                  {!achievement.completed && (
                    <View style={styles.achievementLock}>
                      <Ionicons name="lock-closed" size={10} color="#FFF" />
                    </View>
                  )}
                </View>
                <Text style={styles.achievementName} numberOfLines={1}>{achievement.name}</Text>
                <Text style={styles.achievementDescription} numberOfLines={2}>{achievement.description}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        {/* 设置菜单 */}
        <View style={styles.menuContainer}>
          {renderMenuItem(
            <Ionicons name="time-outline" size={22} color="#8B4513" />, 
            '浏览历史', 
            () => {}
          )}
          {renderMenuItem(
            <Ionicons name="bookmark-outline" size={22} color="#8B4513" />, 
            '我的收藏', 
            () => {}
          )}
          {renderMenuItem(
            <Ionicons name="notifications-outline" size={22} color="#8B4513" />, 
            '消息通知', 
            () => {}
          )}
          {renderMenuItem(
            <Ionicons name="settings-outline" size={22} color="#8B4513" />, 
            '设置', 
            () => {}
          )}
          {renderMenuItem(
            <Ionicons name="help-circle-outline" size={22} color="#8B4513" />, 
            '帮助与反馈', 
            () => {}
          )}
          {renderMenuItem(
            <Ionicons name="information-circle-outline" size={22} color="#8B4513" />, 
            '关于我们', 
            () => {}
          )}
        </View>
        
        <View style={styles.footer}>
          <Text style={styles.footerText}>文华 v1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5EFE0',
  },
  profileHeader: {
    height: 220,
    width: '100%',
    justifyContent: 'flex-end',
  },
  profileHeaderOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  userInfoContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 16,
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#FFF',
    marginRight: 16,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 8,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  levelBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  levelText: {
    fontSize: 12,
    color: '#FFF',
    fontWeight: 'bold',
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 12,
    color: '#FFF',
    opacity: 0.9,
  },
  pointsText: {
    fontSize: 12,
    color: '#FFF',
    fontWeight: 'bold',
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 3,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFF',
    borderRadius: 3,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginTop: -25,
    marginHorizontal: 20,
    paddingVertical: 16,
    justifyContent: 'space-around',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#8B4513',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#8D6E63',
  },
  statDivider: {
    width: 1,
    height: '60%',
    backgroundColor: '#E8E0D5',
    alignSelf: 'center',
  },
  sectionContainer: {
    marginHorizontal: 20,
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#5D4037',
  },
  sectionAction: {
    fontSize: 14,
    color: '#8B4513',
  },
  activitiesContainer: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5EFE0',
  },
  activityIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(139,69,19,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityInfo: {
    flex: 1,
  },
  activityText: {
    fontSize: 14,
    color: '#5D4037',
    marginBottom: 4,
  },
  activityHighlight: {
    color: '#8B4513',
    fontWeight: 'bold',
  },
  activityTime: {
    fontSize: 12,
    color: '#8D6E63',
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  achievementItem: {
    width: (width - 56) / 3,
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  achievementCompleted: {
    borderWidth: 0,
  },
  achievementIncomplete: {
    opacity: 0.8,
  },
  achievementIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(139,69,19,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    position: 'relative',
  },
  achievementIcon: {
    fontSize: 24,
  },
  achievementLock: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#BCAAA4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  achievementName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#5D4037',
    marginBottom: 4,
    textAlign: 'center',
  },
  achievementDescription: {
    fontSize: 10,
    color: '#8D6E63',
    textAlign: 'center',
    lineHeight: 14,
  },
  menuContainer: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginHorizontal: 20,
    marginTop: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F5EFE0',
  },
  menuIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(139,69,19,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuTitle: {
    flex: 1,
    fontSize: 16,
    color: '#5D4037',
  },
  footer: {
    alignItems: 'center',
    marginVertical: 30,
  },
  footerText: {
    fontSize: 12,
    color: '#A1887F',
  },
}); 