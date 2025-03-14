import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

// 定义类型
interface Relic {
  id: string;
  name: string;
  dynasty: string;
  color: string; // 使用颜色替代图片
}

interface Region {
  id: string;
  name: string;
  description: string;
  color: string; // 使用颜色替代图片
  relics: Relic[];
}

interface RegionsData {
  [key: string]: Region;
}

// 模拟区域数据
const mockRegions: RegionsData = {
  '1': { 
    id: '1', 
    name: '华北', 
    description: '华北地区拥有丰富的历史文化遗产，从古代宫殿到现代建筑，展现了中国几千年的文明发展。这里的文物不仅数量众多，而且种类丰富，包括青铜器、陶瓷、书画、玉器等各个门类。',
    color: '#A1887F',
    relics: [
      { id: '101', name: '青铜器·后母戊鼎', dynasty: '商代', color: '#8D6E63' },
      { id: '102', name: '玉器·玉琮', dynasty: '良渚文化', color: '#A1887F' },
      { id: '103', name: '陶器·彩陶盆', dynasty: '仰韶文化', color: '#BCAAA4' },
    ]
  },
  '2': { 
    id: '2', 
    name: '华东', 
    description: '华东地区文化底蕴深厚，是中国古代文明的重要发源地之一。这里的文物艺术展现了江南水乡的精致与典雅，以及海上丝绸之路的繁荣与开放。',
    color: '#90A4AE',
    relics: [
      { id: '201', name: '瓷器·青花瓷', dynasty: '元代', color: '#78909C' },
      { id: '202', name: '书画·富春山居图', dynasty: '元代', color: '#607D8B' },
      { id: '203', name: '丝绸·云锦', dynasty: '明清', color: '#546E7A' },
    ]
  },
  '3': { 
    id: '3', 
    name: '华南', 
    description: '华南地区气候温暖湿润，自然资源丰富，是中国与海外交流的重要窗口。这里的文物体现了岭南文化的独特魅力，以及与海上丝绸之路相关的贸易与文化交流。',
    color: '#81C784',
    relics: [
      { id: '301', name: '陶瓷·广彩瓷器', dynasty: '清代', color: '#66BB6A' },
      { id: '302', name: '象牙雕·广东牙雕', dynasty: '明清', color: '#4CAF50' },
      { id: '303', name: '金银器·南海贸易金器', dynasty: '唐宋', color: '#43A047' },
    ]
  },
  '4': { 
    id: '4', 
    name: '西北', 
    description: '西北地区是古丝绸之路的重要通道，多元文化在此交融。这里的文物见证了东西方文明的交流与碰撞，展现了草原文化、佛教艺术和多民族文化的独特魅力。',
    color: '#FFB74D',
    relics: [
      { id: '401', name: '壁画·敦煌莫高窟壁画', dynasty: '魏晋至元代', color: '#FFA726' },
      { id: '402', name: '丝织品·唐代锦缎', dynasty: '唐代', color: '#FF9800' },
      { id: '403', name: '金器·马踏飞燕', dynasty: '东汉', color: '#FB8C00' },
    ]
  },
  '5': { 
    id: '5', 
    name: '西南', 
    description: '西南地区地形复杂，民族众多，文化多样性丰富。这里的文物展现了巴蜀文明的独特魅力，以及少数民族文化的多彩风情。',
    color: '#7986CB',
    relics: [
      { id: '501', name: '青铜器·三星堆青铜面具', dynasty: '商代', color: '#5C6BC0' },
      { id: '502', name: '石刻·大足石刻', dynasty: '唐宋', color: '#3F51B5' },
      { id: '503', name: '漆器·云南漆器', dynasty: '明清', color: '#3949AB' },
    ]
  },
};

const RegionDetailScreen = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [region, setRegion] = useState<Region | null>(null);
  
  useEffect(() => {
    // 在实际应用中，这里应该从API获取数据
    if (id && typeof id === 'string') {
      setRegion(mockRegions[id]);
    }
  }, [id]);
  
  const handleRelicPress = (relicId: string) => {
    router.push(`/relic/${relicId}`);
  };
  
  if (!region) {
    return (
      <View style={styles.loadingContainer}>
        <Text>加载中...</Text>
      </View>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      <ScrollView>
        {/* 区域头部信息 */}
        <View style={[styles.header, { backgroundColor: region.color }]}>
          <View style={styles.headerOverlay}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Text style={styles.backButtonText}>返回</Text>
            </TouchableOpacity>
            <Text style={styles.regionName}>{region.name}</Text>
          </View>
        </View>
        
        {/* 区域描述 */}
        <View style={styles.descriptionContainer}>
          <Text style={styles.sectionTitle}>地区简介</Text>
          <Text style={styles.description}>{region.description}</Text>
        </View>
        
        {/* 文物列表 */}
        <View style={styles.relicsContainer}>
          <Text style={styles.sectionTitle}>代表文物</Text>
          <FlatList
            data={region.relics}
            keyExtractor={(item) => item.id}
            horizontal={false}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={styles.relicItem}
                onPress={() => handleRelicPress(item.id)}
              >
                <View style={[styles.relicImagePlaceholder, { backgroundColor: item.color }]} />
                <View style={styles.relicInfo}>
                  <Text style={styles.relicName}>{item.name}</Text>
                  <Text style={styles.relicDynasty}>{item.dynasty}</Text>
                </View>
              </TouchableOpacity>
            )}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5EFE0',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    height: 200,
    position: 'relative',
  },
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-end',
    padding: 16,
  },
  backButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  backButtonText: {
    color: '#FFF',
    fontSize: 14,
  },
  regionName: {
    color: '#FFF',
    fontSize: 28,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  descriptionContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#8B4513',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#5D4037',
    lineHeight: 24,
  },
  relicsContainer: {
    padding: 16,
  },
  relicItem: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 8,
    marginBottom: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  relicImagePlaceholder: {
    width: 100,
    height: 100,
  },
  relicInfo: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
  },
  relicName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#5D4037',
    marginBottom: 4,
  },
  relicDynasty: {
    fontSize: 14,
    color: '#8D6E63',
  },
});

export default RegionDetailScreen; 