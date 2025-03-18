import React, { useState, useRef, useEffect } from 'react';
import { 
  View, Text, StyleSheet, FlatList, 
  TouchableOpacity, TextInput, ScrollView,
  Image, Dimensions, Platform, Animated,
  Pressable
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons, MaterialCommunityIcons, FontAwesome5, AntDesign } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../constants/Colors';
import Card from '../../components/ui/Card';

const { width, height } = Dimensions.get('window');

// 模拟文物数据
const mockRelics = [
  { id: '101', name: '青铜器·后母戊鼎', dynasty: '商代', category: '青铜器', color: '#8D6E63', image: 'https://picsum.photos/id/20/300/300' },
  { id: '102', name: '玉器·玉琮', dynasty: '良渚文化', category: '玉器', color: '#A1887F', image: 'https://picsum.photos/id/21/300/300' },
  { id: '103', name: '陶器·彩陶盆', dynasty: '仰韶文化', category: '陶器', color: '#BCAAA4', image: 'https://picsum.photos/id/22/300/300' },
  { id: '201', name: '瓷器·青花瓷', dynasty: '元代', category: '瓷器', color: '#78909C', image: 'https://picsum.photos/id/23/300/300' },
  { id: '202', name: '书画·富春山居图', dynasty: '元代', category: '书画', color: '#607D8B', image: 'https://picsum.photos/id/24/300/300' },
  { id: '203', name: '丝绸·云锦', dynasty: '明清', category: '织物', color: '#546E7A', image: 'https://picsum.photos/id/25/300/300' },
  { id: '301', name: '陶瓷·广彩瓷器', dynasty: '清代', category: '瓷器', color: '#66BB6A', image: 'https://picsum.photos/id/26/300/300' },
  { id: '302', name: '象牙雕·广东牙雕', dynasty: '明清', category: '雕刻', color: '#4CAF50', image: 'https://picsum.photos/id/27/300/300' },
  { id: '401', name: '壁画·敦煌莫高窟壁画', dynasty: '魏晋至元代', category: '绘画', color: '#FFA726', image: 'https://picsum.photos/id/28/300/300' },
  { id: '402', name: '丝织品·唐代锦缎', dynasty: '唐代', category: '织物', color: '#FF9800', image: 'https://picsum.photos/id/29/300/300' },
  { id: '501', name: '青铜器·三星堆青铜面具', dynasty: '商代', category: '青铜器', color: '#5C6BC0', image: 'https://picsum.photos/id/30/300/300' },
];

// 精选文物（顶部轮播展示）
const featuredRelics = [
  { id: '101', name: '青铜器·后母戊鼎', dynasty: '商代', category: '青铜器', color: '#8D6E63', 
    image: 'https://picsum.photos/id/20/600/400', 
    description: '商代晚期青铜器，中国目前出土的最大的商代青铜器，高133厘米，重832.84千克。' },
  { id: '501', name: '青铜器·三星堆青铜面具', dynasty: '商代', category: '青铜器', color: '#5C6BC0', 
    image: 'https://picsum.photos/id/30/600/400',
    description: '三星堆遗址出土的青铜文物，具有神秘的宗教色彩和独特的艺术风格。' },
  { id: '201', name: '瓷器·青花瓷', dynasty: '元代', category: '瓷器', color: '#78909C', 
    image: 'https://picsum.photos/id/23/600/400',
    description: '元代青花瓷是中国瓷器发展史上的重要里程碑，采用钴料在瓷坯上绘制纹饰，工艺精湛。' },
  { id: '401', name: '壁画·敦煌莫高窟壁画', dynasty: '魏晋至元代', category: '绘画', color: '#FFA726', 
    image: 'https://picsum.photos/id/28/600/400',
    description: '敦煌莫高窟壁画内容丰富，题材多样，是研究古代社会生活、宗教、艺术的珍贵资料。' },
];

// 分类数据
const categories = [
  { id: 'all', name: '全部', icon: '🏛️' },
  { id: '青铜器', name: '青铜器', icon: '🔔' },
  { id: '玉器', name: '玉器', icon: '💎' },
  { id: '陶器', name: '陶器', icon: '🏺' },
  { id: '瓷器', name: '瓷器', icon: '🍶' },
  { id: '书画', name: '书画', icon: '🖌️' },
  { id: '织物', name: '织物', icon: '🧵' },
  { id: '雕刻', name: '雕刻', icon: '🗿' },
  { id: '绘画', name: '绘画', icon: '🎨' },
];

// 朝代数据
const dynasties = [
  { id: 'all', name: '全部' },
  { id: '史前', name: '史前' },
  { id: '夏商周', name: '夏商周' },
  { id: '秦汉', name: '秦汉' },
  { id: '魏晋南北朝', name: '魏晋南北朝' },
  { id: '隋唐', name: '隋唐' },
  { id: '宋元', name: '宋元' },
  { id: '明清', name: '明清' },
];

export default function RelicsScreen() {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDynasty, setSelectedDynasty] = useState('all');
  const [currentCarouselIndex, setCurrentCarouselIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const carouselRef = useRef<Animated.FlatList<typeof featuredRelics[0]>>(null);
  
  // 自动轮播
  useEffect(() => {
    const timer = setInterval(() => {
      if (currentCarouselIndex < featuredRelics.length - 1) {
        setCurrentCarouselIndex(currentCarouselIndex + 1);
        carouselRef.current?.scrollToIndex({
          index: currentCarouselIndex + 1,
          animated: true
        });
      } else {
        setCurrentCarouselIndex(0);
        carouselRef.current?.scrollToIndex({
          index: 0,
          animated: true
        });
      }
    }, 5000);
    
    return () => clearInterval(timer);
  }, [currentCarouselIndex]);
  
  // 过滤文物
  const filteredRelics = mockRelics.filter(relic => {
    const matchesSearch = searchText === '' || 
      relic.name.toLowerCase().includes(searchText.toLowerCase()) ||
      relic.dynasty.toLowerCase().includes(searchText.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || relic.category === selectedCategory;
    
    const matchesDynasty = selectedDynasty === 'all' || 
      (selectedDynasty === '夏商周' && (relic.dynasty.includes('商') || relic.dynasty.includes('周'))) ||
      (selectedDynasty === '宋元' && (relic.dynasty.includes('元'))) ||
      (selectedDynasty === '明清' && (relic.dynasty.includes('明') || relic.dynasty.includes('清')));
    
    return matchesSearch && matchesCategory && matchesDynasty;
  });
  
  const handleRelicPress = (relicId: string) => {
    router.push(`/relic/${relicId}`);
  };

  // 渲染轮播指示器
  const renderPagination = () => {
    return (
      <View style={styles.paginationContainer}>
        {featuredRelics.map((_, index) => {
          const opacity = scrollX.interpolate({
            inputRange: [(index - 1) * width, index * width, (index + 1) * width],
            outputRange: [0.3, 1, 0.3],
            extrapolate: 'clamp'
          });
          
          const scale = scrollX.interpolate({
            inputRange: [(index - 1) * width, index * width, (index + 1) * width],
            outputRange: [0.8, 1.2, 0.8],
            extrapolate: 'clamp'
          });
          
          return (
            <Animated.View
              key={index}
              style={[
                styles.paginationDot,
                { 
                  opacity,
                  transform: [{ scale }],
                  backgroundColor: index === currentCarouselIndex ? COLORS.primary : COLORS.inactive
                }
              ]}
            />
          );
        })}
      </View>
    );
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* 顶部标题 */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>文物库</Text>
          <Text style={styles.headerSubtitle}>探索中华文明瑰宝</Text>
        </View>
        
        {/* 顶部轮播展示 */}
        <View style={styles.carouselContainer}>
          <Animated.FlatList
            ref={carouselRef}
            data={featuredRelics}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            pagingEnabled
            bounces={false}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { x: scrollX } } }],
              { useNativeDriver: false }
            )}
            onMomentumScrollEnd={(event) => {
              const index = Math.round(event.nativeEvent.contentOffset.x / width);
              setCurrentCarouselIndex(index);
            }}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={styles.carouselItem}
                activeOpacity={0.9}
                onPress={() => handleRelicPress(item.id)}
              >
                <Image 
                  source={{ uri: item.image }} 
                  style={styles.carouselImage}
                  resizeMode="cover"
                />
                <View style={styles.carouselGradient}>
                  <View style={styles.carouselContent}>
                    <Text style={styles.carouselTitle}>{item.name}</Text>
                    <Text style={styles.carouselDesc} numberOfLines={2}>
                      {item.description}
                    </Text>
                    <View style={styles.carouselTagContainer}>
                      <Text style={styles.carouselTag}>{item.dynasty}</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            )}
          />
          
          {renderPagination()}
        </View>
        
        {/* 搜索框 */}
        <View style={styles.searchWrapper}>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color={COLORS.textSecondary} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="搜索文物名称或朝代"
              placeholderTextColor={COLORS.textLight}
              value={searchText}
              onChangeText={setSearchText}
            />
            {searchText !== '' && (
              <TouchableOpacity 
                style={styles.clearButton} 
                onPress={() => setSearchText('')}
              >
                <Ionicons name="close-circle" size={18} color={COLORS.textSecondary} />
              </TouchableOpacity>
            )}
          </View>
        </View>
        
        {/* 分类筛选 - 网格布局 */}
        <View style={styles.categorySection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>文物分类</Text>
            {selectedCategory !== 'all' && (
              <TouchableOpacity onPress={() => setSelectedCategory('all')}>
                <Text style={styles.clearFilterText}>清除</Text>
              </TouchableOpacity>
            )}
          </View>
          
          <View style={styles.categoryGrid}>
            {categories.map(category => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryCard,
                  selectedCategory === category.id && styles.categoryCardSelected
                ]}
                onPress={() => setSelectedCategory(category.id)}
                activeOpacity={0.7}
              >
                <Text style={styles.categoryIcon}>{category.icon}</Text>
                <Text 
                  style={[
                    styles.categoryText,
                    selectedCategory === category.id && styles.categoryTextSelected
                  ]}
                  numberOfLines={1}
                >
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        {/* 朝代筛选 */}
        <View style={styles.dynastySection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>朝代筛选</Text>
            {selectedDynasty !== 'all' && (
              <TouchableOpacity onPress={() => setSelectedDynasty('all')}>
                <Text style={styles.clearFilterText}>清除</Text>
              </TouchableOpacity>
            )}
          </View>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            style={styles.dynastyScroll}
            contentContainerStyle={styles.dynastyScrollContent}
          >
            {dynasties.map(dynasty => (
              <TouchableOpacity
                key={dynasty.id}
                style={[
                  styles.dynastyItem,
                  selectedDynasty === dynasty.id && styles.dynastyItemSelected
                ]}
                onPress={() => setSelectedDynasty(dynasty.id)}
              >
                <Text 
                  style={[
                    styles.dynastyText,
                    selectedDynasty === dynasty.id && styles.dynastyTextSelected
                  ]}
                >
                  {dynasty.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        
        {/* 文物列表 */}
        <View style={styles.relicsSection}>
          <View style={styles.resultsHeader}>
            <Text style={styles.resultsCount}>
              共 {filteredRelics.length} 件文物
            </Text>
            <TouchableOpacity style={styles.sortButton}>
              <Text style={styles.sortLabel}>排序</Text>
              <AntDesign name="down" size={12} color={COLORS.primary} style={{ marginLeft: 4 }} />
            </TouchableOpacity>
          </View>

          <View style={styles.relicsGrid}>
            {filteredRelics.map(relic => (
              <Card
                key={relic.id}
                style={styles.relicCard}
                onPress={() => handleRelicPress(relic.id)}
                elevation="medium"
                radius="medium"
              >
                <View style={styles.relicImageContainer}>
                  <Image 
                    source={{ uri: relic.image }} 
                    style={styles.relicImage}
                    resizeMode="cover"
                  />
                  <View style={[styles.categoryIndicator, { backgroundColor: relic.color }]} />
                </View>
                
                <View style={styles.relicInfo}>
                  <Text style={styles.relicName} numberOfLines={2}>{relic.name}</Text>
                  
                  <View style={styles.relicMetaInfo}>
                    <View style={styles.relicDynastyRow}>
                      <FontAwesome5 name="history" size={12} color={COLORS.textSecondary} />
                      <Text style={styles.relicDynasty}>{relic.dynasty}</Text>
                    </View>
                    
                    <View style={styles.relicCategoryTag}>
                      <Text style={styles.relicCategoryText}>{relic.category}</Text>
                    </View>
                  </View>
                </View>
              </Card>
            ))}
          </View>
          
          {filteredRelics.length === 0 && (
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons name="database-search" size={60} color={COLORS.textLight} />
              <Text style={styles.emptyText}>没有找到符合条件的文物</Text>
              <TouchableOpacity 
                style={styles.resetButton}
                onPress={() => {
                  setSearchText('');
                  setSelectedCategory('all');
                  setSelectedDynasty('all');
                }}
              >
                <Text style={styles.resetButtonText}>重置筛选条件</Text>
              </TouchableOpacity>
            </View>
          )}
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
    paddingHorizontal: SPACING.large,
    paddingTop: SPACING.large,
    paddingBottom: SPACING.medium,
  },
  headerTitle: {
    fontSize: FONTS.size.headline,
    fontFamily: FONTS.family.heading,
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    fontSize: FONTS.size.medium,
    fontFamily: FONTS.family.main,
    color: COLORS.textSecondary,
  },
  // 轮播样式
  carouselContainer: {
    height: height * 0.28,
    marginBottom: SPACING.large,
  },
  carouselItem: {
    width: width,
    height: height * 0.28,
    position: 'relative',
  },
  carouselImage: {
    width: width,
    height: '100%',
  },
  carouselGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  carouselContent: {
    padding: SPACING.medium,
  },
  carouselTitle: {
    color: COLORS.white,
    fontSize: FONTS.size.xl,
    fontFamily: FONTS.family.heading,
    marginBottom: SPACING.xs,
  },
  carouselDesc: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: FONTS.size.medium,
    fontFamily: FONTS.family.main,
    marginBottom: SPACING.small,
  },
  carouselTagContainer: {
    backgroundColor: COLORS.primary,
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.small,
    paddingVertical: 3,
    borderRadius: RADIUS.small,
  },
  carouselTag: {
    color: COLORS.white,
    fontSize: FONTS.size.small,
    fontFamily: FONTS.family.main,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: SPACING.small,
    width: '100%',
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  // 搜索框样式
  searchWrapper: {
    paddingHorizontal: SPACING.large,
    marginBottom: SPACING.large,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.medium,
    padding: SPACING.medium,
    ...SHADOWS.small,
  },
  searchIcon: {
    marginRight: SPACING.small,
  },
  searchInput: {
    flex: 1,
    fontSize: FONTS.size.medium,
    fontFamily: FONTS.family.main,
    color: COLORS.text,
    paddingVertical: 0,
  },
  clearButton: {
    padding: SPACING.xs,
  },
  // 分类网格样式
  categorySection: {
    marginBottom: SPACING.large,
    paddingHorizontal: SPACING.large,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.medium,
  },
  sectionTitle: {
    fontSize: FONTS.size.large,
    fontFamily: FONTS.family.heading,
    color: COLORS.text,
  },
  clearFilterText: {
    fontSize: FONTS.size.small,
    fontFamily: FONTS.family.main,
    color: COLORS.primary,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryCard: {
    width: (width - SPACING.large * 2 - SPACING.small * 3) / 4,
    aspectRatio: 1,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.medium,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.small,
    ...SHADOWS.small,
    borderWidth: 1,
    borderColor: COLORS.backgroundLight,
    padding: SPACING.xs,
  },
  categoryCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.backgroundLight,
  },
  categoryIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  categoryText: {
    fontSize: FONTS.size.xs,
    fontFamily: FONTS.family.main,
    color: COLORS.text,
    textAlign: 'center',
  },
  categoryTextSelected: {
    color: COLORS.primary,
    fontFamily: FONTS.family.heading,
  },
  // 朝代筛选样式
  dynastySection: {
    marginBottom: SPACING.large,
    paddingHorizontal: SPACING.large,
  },
  dynastyScroll: {
    flexDirection: 'row',
  },
  dynastyScrollContent: {
    paddingRight: SPACING.large,
  },
  dynastyItem: {
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.medium,
    paddingVertical: SPACING.small,
    borderRadius: RADIUS.medium,
    marginRight: SPACING.small,
    borderWidth: 1,
    borderColor: COLORS.backgroundLight,
    ...SHADOWS.small,
  },
  dynastyItemSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  dynastyText: {
    fontSize: FONTS.size.small,
    fontFamily: FONTS.family.main,
    color: COLORS.text,
  },
  dynastyTextSelected: {
    color: COLORS.white,
    fontFamily: FONTS.family.heading,
  },
  // 文物列表样式
  relicsSection: {
    paddingHorizontal: SPACING.large,
    paddingBottom: SPACING.xxl,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.medium,
  },
  resultsCount: {
    fontSize: FONTS.size.medium,
    fontFamily: FONTS.family.main,
    color: COLORS.textSecondary,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundLight,
    paddingHorizontal: SPACING.small,
    paddingVertical: 6,
    borderRadius: RADIUS.small,
  },
  sortLabel: {
    fontSize: FONTS.size.small,
    fontFamily: FONTS.family.main,
    color: COLORS.primary,
  },
  relicsGrid: {
    flexDirection: 'column',
  },
  relicCard: {
    width: '100%',
    marginBottom: SPACING.medium,
    overflow: 'hidden',
    backgroundColor: COLORS.white,
    flexDirection: 'row',
    height: 110,
  },
  relicImageContainer: {
    width: 100,
    height: '100%',
    position: 'relative',
  },
  relicImage: {
    width: '100%',
    height: '100%',
  },
  relicInfo: {
    flex: 1,
    padding: SPACING.medium,
    justifyContent: 'space-between',
  },
  relicName: {
    fontSize: FONTS.size.medium,
    fontFamily: FONTS.family.heading,
    color: COLORS.text,
    lineHeight: FONTS.size.medium * 1.3,
  },
  relicMetaInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.small,
  },
  relicDynastyRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  relicDynasty: {
    fontSize: FONTS.size.xs,
    fontFamily: FONTS.family.main,
    color: COLORS.textSecondary,
    marginLeft: 4,
  },
  relicCategoryTag: {
    backgroundColor: COLORS.backgroundLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.small,
  },
  relicCategoryText: {
    fontSize: FONTS.size.xs,
    fontFamily: FONTS.family.main,
    color: COLORS.textSecondary,
  },
  categoryIndicator: {
    position: 'absolute',
    top: SPACING.small,
    right: SPACING.small,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  // 空状态样式
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xl,
  },
  emptyText: {
    fontSize: FONTS.size.medium,
    fontFamily: FONTS.family.main,
    color: COLORS.textSecondary,
    marginTop: SPACING.medium,
    marginBottom: SPACING.medium,
  },
  resetButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.large,
    paddingVertical: SPACING.small,
    borderRadius: RADIUS.medium,
  },
  resetButtonText: {
    fontSize: FONTS.size.medium,
    fontFamily: FONTS.family.main,
    color: COLORS.white,
  },
}); 