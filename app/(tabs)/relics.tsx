import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, FlatList, 
  TouchableOpacity, TextInput, ScrollView,
  Image, Dimensions, Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

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
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      {/* 顶部搜索区 */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>文物库</Text>
        <Text style={styles.headerSubtitle}>探索中华文明瑰宝</Text>
        
        {/* 搜索框 */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#8B4513" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="搜索文物名称或朝代"
            placeholderTextColor="#A1887F"
            value={searchText}
            onChangeText={setSearchText}
          />
          {searchText !== '' && (
            <TouchableOpacity 
              style={styles.clearButton} 
              onPress={() => setSearchText('')}
            >
              <Ionicons name="close-circle" size={18} color="#8D6E63" />
            </TouchableOpacity>
          )}
        </View>
      </View>
      
      {/* 分类筛选 */}
      <View style={styles.filterSection}>
        <View style={styles.filterHeader}>
          <Text style={styles.filterTitle}>分类</Text>
          {selectedCategory !== 'all' && (
            <TouchableOpacity onPress={() => setSelectedCategory('all')}>
              <Text style={styles.clearFilterText}>清除</Text>
            </TouchableOpacity>
          )}
        </View>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.filterScroll}
          contentContainerStyle={styles.filterScrollContent}
        >
          {categories.map(category => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryItem,
                selectedCategory === category.id && styles.categoryItemSelected
              ]}
              onPress={() => setSelectedCategory(category.id)}
            >
              <Text style={styles.categoryIcon}>{category.icon}</Text>
              <Text 
                style={[
                  styles.categoryText,
                  selectedCategory === category.id && styles.categoryTextSelected
                ]}
              >
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      
      {/* 朝代筛选 */}
      <View style={styles.filterSection}>
        <View style={styles.filterHeader}>
          <Text style={styles.filterTitle}>朝代</Text>
          {selectedDynasty !== 'all' && (
            <TouchableOpacity onPress={() => setSelectedDynasty('all')}>
              <Text style={styles.clearFilterText}>清除</Text>
            </TouchableOpacity>
          )}
        </View>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.filterScroll}
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
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsCount}>
          {filteredRelics.length} 件文物
        </Text>
        <View style={styles.sortOptions}>
          <Text style={styles.sortLabel}>排序: </Text>
          <Text style={styles.sortActive}>默认</Text>
        </View>
      </View>

      <FlatList
        data={filteredRelics}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.relicsList}
        columnWrapperStyle={styles.relicRow}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.relicItem}
            onPress={() => handleRelicPress(item.id)}
            activeOpacity={0.8}
          >
            <Image 
              source={{ uri: item.image }} 
              style={styles.relicImage}
              resizeMode="cover"
            />
            <View style={styles.relicInfo}>
              <Text style={styles.relicName} numberOfLines={1}>{item.name}</Text>
              
              <View style={styles.relicDynastyRow}>
                <FontAwesome5 name="history" size={12} color="#8D6E63" />
                <Text style={styles.relicDynasty}>{item.dynasty}</Text>
              </View>
              
              <View style={styles.relicCategoryTag}>
                <Text style={styles.relicCategoryText}>{item.category}</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="database-search" size={50} color="#D7CCC8" />
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
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5EFE0',
  },
  header: {
    paddingTop: 16,
    paddingHorizontal: 20,
    paddingBottom: 12,
    backgroundColor: '#F5EFE0',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(139,69,19,0.1)',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#8B4513',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#8D6E63',
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#5D4037',
    height: '100%',
  },
  clearButton: {
    padding: 4,
  },
  filterSection: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#5D4037',
  },
  clearFilterText: {
    fontSize: 14,
    color: '#8B4513',
  },
  filterScroll: {
    flexGrow: 0,
  },
  filterScrollContent: {
    paddingRight: 20,
  },
  categoryItem: {
    alignItems: 'center',
    marginRight: 15,
    width: 60,
  },
  categoryItemSelected: {
    transform: [{scale: 1.05}],
  },
  categoryIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  categoryText: {
    fontSize: 12,
    color: '#8D6E63',
    textAlign: 'center',
  },
  categoryTextSelected: {
    color: '#8B4513',
    fontWeight: 'bold',
  },
  dynastyItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FFF',
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#E8E0D5',
  },
  dynastyItemSelected: {
    backgroundColor: '#8B4513',
    borderColor: '#8B4513',
  },
  dynastyText: {
    fontSize: 14,
    color: '#8D6E63',
  },
  dynastyTextSelected: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  resultsCount: {
    fontSize: 14,
    color: '#8D6E63',
  },
  sortOptions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sortLabel: {
    fontSize: 14,
    color: '#8D6E63',
  },
  sortActive: {
    fontSize: 14,
    color: '#8B4513',
    fontWeight: 'bold',
  },
  relicsList: {
    padding: 10,
    paddingBottom: 20,
  },
  relicRow: {
    justifyContent: 'space-between',
  },
  relicItem: {
    width: (width - 50) / 2,
    marginBottom: 16,
    backgroundColor: '#FFF',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  relicImage: {
    width: '100%',
    height: 160,
  },
  relicInfo: {
    padding: 12,
  },
  relicName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#5D4037',
    marginBottom: 6,
  },
  relicDynastyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  relicDynasty: {
    fontSize: 12,
    color: '#8D6E63',
    marginLeft: 5,
  },
  relicCategoryTag: {
    backgroundColor: 'rgba(139,69,19,0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  relicCategoryText: {
    fontSize: 10,
    color: '#8B4513',
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    height: 300,
  },
  emptyText: {
    fontSize: 16,
    color: '#8D6E63',
    marginTop: 12,
    marginBottom: 16,
    textAlign: 'center',
  },
  resetButton: {
    backgroundColor: '#8B4513',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  resetButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '500',
  },
}); 