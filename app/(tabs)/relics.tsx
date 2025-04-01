import React, { useState, useRef, useEffect } from 'react';
import { 
  View, Text, StyleSheet, FlatList, 
  TouchableOpacity, TextInput, ScrollView,
  Image, Dimensions, Platform, Animated,
  Pressable,
  NativeSyntheticEvent,
  NativeScrollEvent,
  ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons, MaterialCommunityIcons, FontAwesome5, AntDesign } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../constants/Colors';
import { Relic, Category, Dynasty, FilterOptions } from '../../data/types';
import { relicService, categoryService, dynastyService } from '../../data/services';
import LoadingIndicator from '../../components/ui/LoadingIndicator';
import { getImageSource } from '../../utils/imageUtils';

const { width, height } = Dimensions.get('window');

export default function RelicsScreen() {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDynasty, setSelectedDynasty] = useState('allDynasty');
  const [currentCarouselIndex, setCurrentCarouselIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const carouselRef = useRef<FlatList<Relic>>(null);
  const carouselInterval = useRef<NodeJS.Timeout | null>(null);
  
  // 数据状态
  const [featuredRelics, setFeaturedRelics] = useState<Relic[]>([]);
  const [relicsData, setRelicsData] = useState<Relic[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [dynasties, setDynasties] = useState<Dynasty[]>([]);
  const [filteredRelics, setFilteredRelics] = useState<Relic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 加载数据
  const loadData = async () => {
    try {
      setIsLoading(true);
      // 并行加载所有数据
      const [relicsResult, featuredRelicsResult, categoriesResult, dynastiesResult] = await Promise.all([
        relicService.getAllRelics(),
        relicService.getFeaturedRelics(),
        categoryService.getAllCategories(),
        dynastyService.getAllDynasties()
      ]);
      
      setRelicsData(relicsResult);
      setFeaturedRelics(featuredRelicsResult);
      setCategories(categoriesResult);
      setDynasties(dynastiesResult);
      
      // 初始时显示所有文物
      setFilteredRelics(relicsResult);
    } catch (error) {
      console.error('加载数据失败:', error);
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
  }, [currentCarouselIndex, featuredRelics]);
  
  const startCarouselTimer = () => {
    clearCarouselTimer();
    if (featuredRelics.length > 0) {
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
    }
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
  useEffect(() => {
    const filterOptions: FilterOptions = {
      category: selectedCategory === 'all' ? undefined : selectedCategory,
      dynasty: selectedDynasty === 'allDynasty' ? undefined : selectedDynasty,
      searchText
    };
    
    console.log('筛选条件变更:', filterOptions);
    
    const filterRelics = async () => {
      try {
        const results = await relicService.getFilteredRelics(filterOptions);
        console.log(`筛选结果: 找到${results.length}个文物`);
        setFilteredRelics(results);
      } catch (error) {
        console.error('过滤文物失败:', error);
      }
    };
    
    filterRelics();
  }, [selectedCategory, selectedDynasty, searchText]);
  
  const handleRelicPress = (relicId: string) => {
    console.log(`准备导航到文物详情，ID: ${relicId}`);
    router.push(`/relic/${relicId}` as any);
  };
  
  // 渲染加载状态
  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <LoadingIndicator 
          type="page"
          message="正在加载文物库..." 
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
          style={styles.retryButton}
          onPress={() => {
            setError(null);
            setIsLoading(true);
            // 重新加载数据
            loadData();
          }}
        >
          <Text style={styles.retryButtonText}>重试</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }
  
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
          
          // 点的透明度
          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.4, 1, 0.4],
            extrapolate: 'clamp',
          });
          
          return (
            <Animated.View
              key={`dot-${index}`}
              style={[
                styles.dot,
                { 
                  width: dotWidth,
                  opacity,
                },
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
        onPress={() => {
          console.log(`选择了朝代: ${item.id} - ${item.name}`);
          setSelectedDynasty(item.id);
        }}
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
            source={getImageSource(item.image)}
            style={styles.relicImage}
            resizeMode="cover"
          />
          <View 
            style={[
              styles.relicCategoryIndicator,
              { backgroundColor: getCategoryColor(item.category) }
            ]}
          >
            <Text style={styles.relicCategoryText}>{item.category}</Text>
          </View>
        </View>
        <View style={styles.relicInfo}>
          <Text style={styles.relicName} numberOfLines={2}>{item.name}</Text>
          <View style={styles.relicMeta}>
            <Text style={styles.relicDynasty}>{item.dynasty}</Text>
            <View style={styles.viewsContainer}>
              <Ionicons name="eye-outline" size={12} color={COLORS.textSecondary} />
              <Text style={styles.viewsText}>
                {item.views !== undefined ? item.views : 0}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };
  
  const renderEmptyState = () => {
    return (
      <View style={styles.emptyStateContainer}>
        <Ionicons name="search-outline" size={48} color={COLORS.textSecondary} />
        <Text style={styles.emptyStateTitle}>无匹配文物</Text>
        <Text style={styles.emptyStateText}>
          尝试调整搜索条件或分类筛选
        </Text>
        <TouchableOpacity 
          style={styles.resetFiltersButton}
          onPress={() => {
            setSelectedCategory('all');
            setSelectedDynasty('allDynasty');
            setSearchText('');
          }}
        >
          <Text style={styles.resetFiltersButtonText}>重置所有筛选</Text>
        </TouchableOpacity>
      </View>
    );
  };

  // 获取分类对应的颜色
  const getCategoryColor = (categoryId?: string) => {
    if (!categoryId) return COLORS.primary;
    
    const category = categories.find(c => c.id === categoryId);
    return category?.color || COLORS.primary;
  };
  
  // 加载更多数据
  const loadMoreRelics = async () => {
    // 在实际应用中，这里可以调用分页加载接口
    console.log('加载更多文物数据');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      {/* 头部搜索栏 */}
      <View style={styles.header}>
        <Text style={styles.screenTitle}>文物库</Text>
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color={COLORS.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="搜索文物名称、朝代..."
            placeholderTextColor={COLORS.textSecondary}
            value={searchText}
            onChangeText={setSearchText}
          />
          {searchText.length > 0 && (
            <TouchableOpacity 
              style={styles.clearButton}
              onPress={() => setSearchText('')}
            >
              <Ionicons name="close-circle" size={18} color={COLORS.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>
      
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* 精选轮播 */}
        {featuredRelics.length > 0 && (
          <View style={styles.carouselContainer}>
            <Text style={styles.sectionTitle}>精选文物</Text>
            <View style={styles.carouselContent}>
              <FlatList
                ref={carouselRef}
                data={featuredRelics}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={Animated.event(
                  [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                  { useNativeDriver: false }
                )}
                onMomentumScrollEnd={handleMomentumScrollEnd}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    activeOpacity={0.9}
                    style={styles.carouselItem}
                    onPress={() => handleRelicPress(item.id)}
                  >
                    <Image 
                      source={getImageSource(item.image)}
                      style={styles.carouselImage}
                      resizeMode="cover"
                    />
                    <LinearGradient
                      colors={['transparent', 'rgba(0,0,0,0.7)']}
                      style={styles.carouselGradient}
                      start={{ x: 0, y: 0.6 }}
                      end={{ x: 0, y: 1 }}
                    >
                      <Text style={styles.carouselTitle}>{item.name}</Text>
                      <Text style={styles.carouselSubtitle}>{item.dynasty}</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                )}
              />
              {renderPagination()}
            </View>
          </View>
        )}
        
        {/* 分类筛选 */}
        <View style={styles.filterSection}>
          <Text style={styles.sectionTitle}>文物分类</Text>
          <View style={styles.categoriesContainer}>
            <FlatList
              data={[{ id: 'all', name: '全部', icon: '📦', color: COLORS.primary }, ...categories.filter(cat => cat.name !== '全部' && cat.id !== 'all')]}
              horizontal
              showsHorizontalScrollIndicator={false}
              renderItem={renderCategoryItem}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={styles.categoriesList}
            />
          </View>
        </View>
        
        {/* 朝代筛选 */}
        <View style={styles.filterSection}>
          <Text style={styles.sectionTitle}>朝代筛选</Text>
          <View style={styles.dynastiesContainer}>
            <FlatList
              data={[{ id: 'allDynasty', name: '全部' }, ...dynasties.filter(dyn => dyn.name !== '全部' && dyn.id !== 'allDynasty')]}
              horizontal
              showsHorizontalScrollIndicator={false}
              renderItem={renderDynastyItem}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={styles.dynastiesList}
            />
          </View>
        </View>
        
        {/* 文物列表 */}
        <View style={styles.relicsSection}>
          <View style={styles.relicsSectionHeader}>
            <Text style={styles.sectionTitle}>文物列表</Text>
            <Text style={styles.relicCount}>
              {filteredRelics.length} 件文物
            </Text>
          </View>
          
          {filteredRelics.length > 0 ? (
            <View style={styles.relicsGrid}>
              {filteredRelics.map((relic) => (
                <View key={relic.id} style={styles.relicItemContainer}>
                  {renderRelicItem({ item: relic })}
                </View>
              ))}
            </View>
          ) : (
            renderEmptyState()
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
  scrollContent: {
    paddingBottom: 30,
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
    paddingTop: 10,
    paddingBottom: 15,
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 15,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.medium,
    paddingHorizontal: 12,
    height: 48,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    color: COLORS.text,
  },
  clearButton: {
    padding: 5,
  },
  carouselContainer: {
    marginVertical: 15,
    paddingHorizontal: 20,
  },
  carouselContent: {
    height: 200,
    marginTop: 10,
    position: 'relative',
  },
  carouselItem: {
    width: width - 40,
    height: 200,
    borderRadius: RADIUS.large,
    overflow: 'hidden',
    ...SHADOWS.medium,
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
    justifyContent: 'flex-end',
    paddingHorizontal: 15,
    paddingBottom: 15,
  },
  carouselTitle: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  carouselSubtitle: {
    color: COLORS.white,
    fontSize: 14,
    opacity: 0.8,
  },
  paginationContainer: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 15,
    alignSelf: 'center',
  },
  dot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.white,
    marginHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 10,
  },
  filterSection: {
    marginVertical: 10,
    paddingHorizontal: 20,
  },
  categoriesContainer: {
    flexDirection: 'row',
    marginTop: 5,
  },
  categoriesList: {
    paddingRight: 20,
  },
  categoryItem: {
    alignItems: 'center',
    marginRight: 16,
    width: 70,
  },
  categoryItemSelected: {
    opacity: 1,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${COLORS.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryIconSelected: {
    backgroundColor: COLORS.primary,
  },
  categoryIconText: {
    fontSize: 20,
  },
  categoryText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  categoryTextSelected: {
    color: COLORS.primary,
    fontWeight: '500',
  },
  dynastiesContainer: {
    marginTop: 5,
    flexDirection: 'row',
  },
  dynastiesList: {
    paddingRight: 20,
  },
  dynastyItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: RADIUS.large,
    marginRight: 10,
    backgroundColor: `${COLORS.primary}15`,
  },
  dynastyItemSelected: {
    backgroundColor: COLORS.primary,
  },
  dynastyText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  dynastyTextSelected: {
    color: COLORS.white,
    fontWeight: '500',
  },
  relicsSection: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  relicsSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  relicCount: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  relicsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  relicItemContainer: {
    width: '48%',
    marginBottom: 15,
  },
  relicCard: {
    borderRadius: RADIUS.medium,
    backgroundColor: COLORS.card,
    overflow: 'hidden',
    ...SHADOWS.small,
  },
  relicImageContainer: {
    position: 'relative',
  },
  relicImage: {
    width: '100%',
    height: 120,
  },
  relicCategoryIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.small,
  },
  relicCategoryText: {
    fontSize: 10,
    fontWeight: '500',
    color: COLORS.white,
  },
  relicInfo: {
    padding: 10,
  },
  relicName: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: 5,
    lineHeight: 20,
    minHeight: 40,
  },
  relicMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  relicDynasty: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  viewsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewsText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginLeft: 3,
  },
  emptyStateContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 15,
    marginBottom: 5,
  },
  emptyStateText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  resetFiltersButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.medium,
  },
  resetFiltersButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '500',
  },
}); 