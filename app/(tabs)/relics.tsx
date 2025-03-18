import React, { useState, useRef, useEffect } from 'react';
import { 
  View, Text, StyleSheet, FlatList, 
  TouchableOpacity, TextInput, ScrollView,
  Image, Dimensions, Platform, Animated,
  Pressable,
  NativeSyntheticEvent,
  NativeScrollEvent
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons, MaterialCommunityIcons, FontAwesome5, AntDesign } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../constants/Colors';
import Card from '../../components/ui/Card';

const { width, height } = Dimensions.get('window');

// 定义类型
interface Relic {
  id: string;
  name: string;
  dynasty: string;
  category: string;
  color: string;
  image: string;
  description?: string;
}

interface Category {
  id: string;
  name: string;
  icon: string;
}

interface Dynasty {
  id: string;
  name: string;
}

// 精选文物数据
const featuredRelics: Relic[] = [
  {
    id: '101',
    name: '青铜器·后母戊鼎',
    dynasty: '商代',
    category: '青铜器',
    color: '#CD7F32',
    image: 'https://picsum.photos/id/866/800/600',
    description: '后母戊鼎是中国商代晚期青铜器，是迄今为止中国出土的最大的商代青铜器。高133厘米，重832.84千克，为国家一级文物。'
  },
  {
    id: '102',
    name: '秦始皇兵马俑',
    dynasty: '秦代',
    category: '陶器',
    color: '#B87333',
    image: 'https://picsum.photos/id/338/800/600',
    description: '兵马俑，即秦始皇兵马俑，亦简称秦兵马俑或秦俑，第一批全国重点文物保护单位，第一批中国世界遗产，位于今陕西省西安市临潼区秦始皇陵以东1.5千米处。'
  },
  {
    id: '103',
    name: '莫高窟壁画',
    dynasty: '魏晋至元代',
    category: '绘画',
    color: '#E34234',
    image: 'https://picsum.photos/id/43/800/600',
    description: '敦煌莫高窟始建于十六国的前秦时期，历经十六国、北朝、隋、唐、五代、西夏、元等历代的修建，有洞窟735个，壁画4.5万平方米、泥质彩塑2415尊。'
  },
];

// 文物数据
const relicsData: Relic[] = [
  {
    id: '101',
    name: '青铜器·后母戊鼎',
    dynasty: '商代',
    category: '青铜器',
    color: '#CD7F32',
    image: 'https://picsum.photos/id/866/800/600',
  },
  {
    id: '102',
    name: '秦始皇兵马俑',
    dynasty: '秦代',
    category: '陶器',
    color: '#B87333',
    image: 'https://picsum.photos/id/338/800/600',
  },
  {
    id: '103',
    name: '莫高窟壁画',
    dynasty: '魏晋至元代',
    category: '绘画',
    color: '#E34234',
    image: 'https://picsum.photos/id/43/800/600',
  },
  {
    id: '104',
    name: '唐三彩',
    dynasty: '唐代',
    category: '陶器',
    color: '#B87333',
    image: 'https://picsum.photos/id/24/800/600',
  },
  {
    id: '105',
    name: '越王勾践剑',
    dynasty: '春秋晚期',
    category: '青铜器',
    color: '#CD7F32',
    image: 'https://picsum.photos/id/65/800/600',
  },
  {
    id: '106',
    name: '马踏飞燕',
    dynasty: '东汉',
    category: '青铜器',
    color: '#CD7F32',
    image: 'https://picsum.photos/id/98/800/600',
  },
  {
    id: '107',
    name: '清明上河图',
    dynasty: '北宋',
    category: '绘画',
    color: '#E34234',
    image: 'https://picsum.photos/id/28/800/600',
  },
  {
    id: '108',
    name: '富春山居图',
    dynasty: '元代',
    category: '绘画',
    color: '#E34234',
    image: 'https://picsum.photos/id/42/800/600',
  },
  {
    id: '109',
    name: '皿方罍',
    dynasty: '西周',
    category: '青铜器',
    color: '#CD7F32',
    image: 'https://picsum.photos/id/70/800/600',
  },
  {
    id: '110',
    name: '粉彩花卉纹瓷瓶',
    dynasty: '清代',
    category: '瓷器',
    color: '#4682B4',
    image: 'https://picsum.photos/id/112/800/600',
  },
];

// 分类数据
const categories: Category[] = [
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
const dynasties: Dynasty[] = [
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
  const carouselRef = useRef<FlatList<Relic>>(null);
  const carouselInterval = useRef<NodeJS.Timeout | null>(null);
  
  // 自动轮播
  useEffect(() => {
    startCarouselTimer();
    return () => clearCarouselTimer();
  }, [currentCarouselIndex]);
  
  const startCarouselTimer = () => {
    clearCarouselTimer();
    carouselInterval.current = setInterval(() => {
      if (carouselRef.current) {
        const nextIndex = (currentCarouselIndex + 1) % featuredRelics.length;
        carouselRef.current.scrollToIndex({
          index: nextIndex,
          animated: true,
        });
        setCurrentCarouselIndex(nextIndex);
      }
    }, 5000);
  };
  
  const clearCarouselTimer = () => {
    if (carouselInterval.current) {
      clearInterval(carouselInterval.current);
      carouselInterval.current = null;
    }
  };
  
  // 监听轮播滚动结束事件
  const handleMomentumScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const newIndex = Math.round(event.nativeEvent.contentOffset.x / width);
    setCurrentCarouselIndex(newIndex);
  };
  
  // 过滤文物
  const filteredRelics = relicsData.filter(relic => {
    const matchesCategory = selectedCategory === 'all' || relic.category === selectedCategory;
    const matchesDynasty = selectedDynasty === 'all' || relic.dynasty.includes(selectedDynasty);
    const matchesSearch = searchText === '' || 
      relic.name.toLowerCase().includes(searchText.toLowerCase()) ||
      relic.dynasty.toLowerCase().includes(searchText.toLowerCase());
    return matchesCategory && matchesDynasty && matchesSearch;
  });
  
  const handleRelicPress = (relicId: string) => {
    router.push(`/relic/${relicId}`);
  };
  
  const renderPagination = () => {
    return (
      <View style={styles.paginationContainer}>
        {featuredRelics.map((_, index) => {
          const inputRange = [
            (index - 1) * width,
            index * width,
            (index + 1) * width,
          ];
          
          // 点的宽度
          const dotWidth = scrollX.interpolate({
            inputRange,
            outputRange: [8, 16, 8],
            extrapolate: 'clamp',
          });
          
          // 点的不透明度
          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.3, 1, 0.3],
            extrapolate: 'clamp',
          });
          
          return (
            <Animated.View
              key={index}
              style={[
                styles.paginationDot,
                { width: dotWidth, opacity }
              ]}
            />
          );
        })}
      </View>
    );
  };
  
  const renderCategoryItem = ({ item }: { item: Category }) => {
    const isSelected = selectedCategory === item.id;
    
    return (
      <TouchableOpacity
        style={[
          styles.categoryItem,
          isSelected && styles.categoryItemSelected
        ]}
        onPress={() => setSelectedCategory(item.id)}
        activeOpacity={0.7}
      >
        <View style={[
          styles.categoryIcon, 
          isSelected && styles.categoryIconSelected
        ]}>
          <Text style={styles.categoryIconText}>{item.icon}</Text>
        </View>
        <Text 
          style={[
            styles.categoryText,
            isSelected && styles.categoryTextSelected
          ]}
          numberOfLines={1}
        >
          {item.name}
        </Text>
      </TouchableOpacity>
    );
  };
  
  const renderDynastyItem = ({ item }: { item: Dynasty }) => {
    const isSelected = selectedDynasty === item.id;
    
    return (
      <TouchableOpacity
        style={[
          styles.dynastyItem,
          isSelected && styles.dynastyItemSelected
        ]}
        onPress={() => setSelectedDynasty(item.id)}
        activeOpacity={0.7}
      >
        <Text 
          style={[
            styles.dynastyText,
            isSelected && styles.dynastyTextSelected
          ]}
        >
          {item.name}
        </Text>
      </TouchableOpacity>
    );
  };
  
  const renderRelicItem = ({ item }: { item: Relic }) => {
    return (
      <TouchableOpacity
        style={styles.relicCard}
        onPress={() => handleRelicPress(item.id)}
        activeOpacity={0.8}
      >
        <View style={styles.relicImageContainer}>
          <Image 
            source={{ uri: item.image }}
            style={styles.relicImage}
            resizeMode="cover"
          />
          <View 
            style={[
              styles.relicCategoryIndicator,
              { backgroundColor: item.color }
            ]} 
          />
        </View>
        
        <View style={styles.relicInfo}>
          <Text style={styles.relicName} numberOfLines={2}>
            {item.name}
          </Text>
          
          <View style={styles.relicMeta}>
            <View style={styles.dynastyBadge}>
              <Text style={styles.dynastyBadgeText}>{item.dynasty}</Text>
            </View>
            <Text style={styles.categoryLabel}>{item.category}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };
  
  const renderCarouselItem = ({ item, index }: { item: Relic, index: number }) => {
    return (
      <TouchableOpacity 
        style={styles.carouselItem}
        onPress={() => handleRelicPress(item.id)}
        activeOpacity={0.9}
      >
        <Image 
          source={{ uri: item.image }}
          style={styles.carouselImage}
        />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.7)']}
          style={styles.carouselGradient}
        />
        <View style={styles.carouselContent}>
          <Text style={styles.carouselTitle}>{item.name}</Text>
          <View style={styles.carouselMeta}>
            <View style={styles.carouselDynastyBadge}>
              <Text style={styles.carouselDynastyText}>{item.dynasty}</Text>
            </View>
            <Text style={styles.carouselDescription} numberOfLines={2}>
              {item.description}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };
  
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />
      
      {/* 标题和搜索栏 */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>文物库</Text>
        
        <View style={styles.searchContainer}>
          <Ionicons 
            name="search" 
            size={20} 
            color={COLORS.textLight} 
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="搜索文物名称、朝代或类别"
            placeholderTextColor={COLORS.textLight}
            value={searchText}
            onChangeText={setSearchText}
          />
          {searchText !== '' && (
            <TouchableOpacity 
              onPress={() => setSearchText('')}
              style={styles.clearButton}
            >
              <Ionicons name="close-circle" size={18} color={COLORS.textLight} />
            </TouchableOpacity>
          )}
        </View>
      </View>
      
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* 精选文物轮播 */}
        <View style={styles.carouselContainer}>
          <FlatList
            ref={carouselRef}
            data={featuredRelics}
            renderItem={renderCarouselItem}
            keyExtractor={item => item.id}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { x: scrollX } } }],
              { useNativeDriver: false }
            )}
            onMomentumScrollEnd={handleMomentumScrollEnd}
            scrollEventThrottle={16}
          />
          
          {renderPagination()}
        </View>
        
        {/* 分类筛选 */}
        <View style={styles.filterSection}>
          <Text style={styles.sectionTitle}>分类筛选</Text>
          <FlatList
            data={categories}
            renderItem={renderCategoryItem}
            keyExtractor={item => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContainer}
          />
        </View>
        
        {/* 朝代筛选 */}
        <View style={styles.filterSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>朝代筛选</Text>
            {selectedDynasty !== 'all' && (
              <TouchableOpacity 
                style={styles.clearFilterButton}
                onPress={() => setSelectedDynasty('all')}
              >
                <Text style={styles.clearFilterText}>清除</Text>
              </TouchableOpacity>
            )}
          </View>
          
          <FlatList
            data={dynasties}
            renderItem={renderDynastyItem}
            keyExtractor={item => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.dynastiesContainer}
          />
        </View>
        
        {/* 文物列表 */}
        <View style={styles.relicsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>文物列表</Text>
            <Text style={styles.relicCount}>共 {filteredRelics.length} 件</Text>
          </View>
          
          {filteredRelics.length > 0 ? (
            <View style={styles.relicsGrid}>
              {filteredRelics.map(relic => (
                <View key={relic.id} style={styles.relicCardWrapper}>
                  {renderRelicItem({ item: relic })}
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="alert-circle-outline" size={50} color={COLORS.textLight} />
              <Text style={styles.emptyText}>未找到符合条件的文物</Text>
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
    paddingHorizontal: SPACING.medium,
    paddingTop: SPACING.medium,
    paddingBottom: SPACING.small,
    backgroundColor: COLORS.white,
    ...SHADOWS.small,
  },
  headerTitle: {
    fontSize: FONTS.size.large,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.small,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundLight,
    borderRadius: RADIUS.medium,
    paddingHorizontal: SPACING.small,
    marginVertical: SPACING.small,
  },
  searchIcon: {
    marginRight: SPACING.small,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: FONTS.size.medium,
    color: COLORS.text,
  },
  clearButton: {
    padding: 4,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  
  // 轮播样式
  carouselContainer: {
    height: 220,
    width: '100%',
    position: 'relative',
  },
  carouselItem: {
    width: width,
    height: 220,
    position: 'relative',
  },
  carouselImage: {
    width: '100%',
    height: '100%',
  },
  carouselGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  carouselContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: SPACING.medium,
  },
  carouselTitle: {
    fontSize: FONTS.size.large,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: 4,
  },
  carouselMeta: {
    flexDirection: 'column',
  },
  carouselDynastyBadge: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS.small,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  carouselDynastyText: {
    fontSize: FONTS.size.small,
    color: COLORS.white,
    fontWeight: '600',
  },
  carouselDescription: {
    fontSize: FONTS.size.small,
    color: 'rgba(255,255,255,0.8)',
  },
  paginationContainer: {
    position: 'absolute',
    bottom: 10,
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  paginationDot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.white,
    marginHorizontal: 4,
  },
  
  // 分类筛选
  filterSection: {
    marginHorizontal: SPACING.medium,
    marginTop: SPACING.medium,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.small,
  },
  sectionTitle: {
    fontSize: FONTS.size.medium,
    fontWeight: '700',
    color: COLORS.text,
  },
  clearFilterButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: RADIUS.small,
    backgroundColor: `${COLORS.primary}15`,
  },
  clearFilterText: {
    fontSize: FONTS.size.small,
    color: COLORS.primary,
  },
  categoriesContainer: {
    paddingVertical: SPACING.small,
  },
  categoryItem: {
    alignItems: 'center',
    marginRight: SPACING.medium,
    width: 80,
  },
  categoryItemSelected: {
    // 选中状态不需要额外样式
  },
  categoryIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.backgroundLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    ...SHADOWS.small,
  },
  categoryIconSelected: {
    backgroundColor: `${COLORS.primary}20`,
  },
  categoryIconText: {
    fontSize: 22,
  },
  categoryText: {
    fontSize: FONTS.size.small,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  categoryTextSelected: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  
  // 朝代筛选
  dynastiesContainer: {
    paddingVertical: SPACING.small,
  },
  dynastyItem: {
    paddingHorizontal: SPACING.medium,
    paddingVertical: SPACING.small,
    borderRadius: RADIUS.small,
    backgroundColor: COLORS.backgroundLight,
    marginRight: SPACING.small,
  },
  dynastyItemSelected: {
    backgroundColor: COLORS.primary,
  },
  dynastyText: {
    fontSize: FONTS.size.small,
    color: COLORS.text,
  },
  dynastyTextSelected: {
    color: COLORS.white,
    fontWeight: '600',
  },
  
  // 文物列表
  relicsSection: {
    marginHorizontal: SPACING.medium,
    marginTop: SPACING.medium,
  },
  relicCount: {
    fontSize: FONTS.size.small,
    color: COLORS.textLight,
  },
  relicsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  relicCardWrapper: {
    width: '48%',
    marginBottom: SPACING.medium,
  },
  relicCard: {
    borderRadius: RADIUS.medium,
    backgroundColor: COLORS.white,
    overflow: 'hidden',
    ...SHADOWS.small,
  },
  relicImageContainer: {
    height: 140,
    position: 'relative',
  },
  relicImage: {
    width: '100%',
    height: '100%',
  },
  relicCategoryIndicator: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  relicInfo: {
    padding: SPACING.small,
  },
  relicName: {
    fontSize: FONTS.size.medium,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  relicMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  dynastyBadge: {
    backgroundColor: `${COLORS.primary}15`,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.small,
    marginRight: 6,
  },
  dynastyBadgeText: {
    fontSize: FONTS.size.small,
    color: COLORS.primary,
  },
  categoryLabel: {
    fontSize: FONTS.size.small,
    color: COLORS.textLight,
  },
  
  // 空状态
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.large,
  },
  emptyText: {
    fontSize: FONTS.size.medium,
    color: COLORS.textLight,
    marginTop: SPACING.medium,
    marginBottom: SPACING.medium,
  },
  resetButton: {
    paddingHorizontal: SPACING.medium,
    paddingVertical: SPACING.small,
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.small,
  },
  resetButtonText: {
    fontSize: FONTS.size.small,
    color: COLORS.white,
    fontWeight: '600',
  },
}); 