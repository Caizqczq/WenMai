import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Platform,
  StatusBar,
  FlatList,
  Animated,
  ImageBackground,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS, SPACING, SHADOWS, RADIUS } from '../constants/Colors';

const { width, height } = Dimensions.get('window');
const HEADER_HEIGHT = height * 0.45;
const DOT_SIZE = 8;
const DOT_SPACING = 8;
const DOT_INDICATOR_SIZE = DOT_SIZE + 6;

interface RelicDetailHeaderProps {
  imageUrls: string[];
  title: string;
  subtitle?: string;
  dynasty?: string;
  era?: string;
  onBack?: () => void;
  onShare?: () => void;
}

const RelicDetailHeader: React.FC<RelicDetailHeaderProps> = ({
  imageUrls,
  title,
  subtitle,
  dynasty,
  era,
  onBack,
  onShare,
}) => {
  const scrollX = useRef(new Animated.Value(0)).current;
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const scrollY = useRef(new Animated.Value(0)).current;
  
  // 自动轮播图片
  useEffect(() => {
    const timer = setInterval(() => {
      if (imageUrls.length <= 1) return;
      
      const nextIndex = (currentIndex + 1) % imageUrls.length;
      setCurrentIndex(nextIndex);
      
      flatListRef.current?.scrollToIndex({
        index: nextIndex,
        animated: true,
      });
    }, 5000);
    
    return () => clearInterval(timer);
  }, [currentIndex, imageUrls.length]);
  
  // 监听滚动位置来更新当前索引
  useEffect(() => {
    const subscription = scrollX.addListener(({ value }) => {
      const index = Math.round(value / width);
      setCurrentIndex(index);
    });
    
    return () => {
      scrollX.removeListener(subscription);
    };
  }, [scrollX]);
  
  // 标题部分动画
  const titleOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_HEIGHT / 2, HEADER_HEIGHT],
    outputRange: [1, 0.8, 0],
    extrapolate: 'clamp',
  });
  
  const titleTranslateY = scrollY.interpolate({
    inputRange: [0, HEADER_HEIGHT / 2, HEADER_HEIGHT],
    outputRange: [0, -20, -50],
    extrapolate: 'clamp',
  });
  
  // 渲染指示器
  const renderPagination = () => {
    const inputRange = [-width, 0, width * imageUrls.length];
    const dotPositon = Animated.divide(scrollX, width);
    
    return (
      <View style={styles.paginationContainer}>
        {imageUrls.map((_, index) => {
          const width = dotPositon.interpolate({
            inputRange: [index - 1, index, index + 1],
            outputRange: [DOT_SIZE, DOT_INDICATOR_SIZE, DOT_SIZE],
            extrapolate: 'clamp',
          });
          
          const opacity = dotPositon.interpolate({
            inputRange: [index - 1, index, index + 1],
            outputRange: [0.4, 1, 0.4],
            extrapolate: 'clamp',
          });
          
          const backgroundColor = dotPositon.interpolate({
            inputRange: [index - 1, index, index + 1],
            outputRange: ['rgba(255, 255, 255, 0.5)', '#FFFFFF', 'rgba(255, 255, 255, 0.5)'],
            extrapolate: 'clamp',
          });
          
          return (
            <Animated.View
              key={index}
              style={[
                styles.dot,
                {
                  width,
                  opacity,
                  backgroundColor,
                  height: DOT_SIZE,
                  marginHorizontal: DOT_SPACING / 2,
                },
              ]}
            />
          );
        })}
      </View>
    );
  };
  
  // 渲染单个图片
  const renderImageItem = ({ item, index }: { item: string; index: number }) => {
    // 图片视差效果
    const inputRange = [(index - 1) * width, index * width, (index + 1) * width];
    
    const translateX = scrollX.interpolate({
      inputRange,
      outputRange: [width * 0.1, 0, -width * 0.1],
      extrapolate: 'clamp',
    });
    
    const scale = scrollX.interpolate({
      inputRange,
      outputRange: [1, 1.1, 1],
      extrapolate: 'clamp',
    });
    
    return (
      <View style={styles.imageContainer}>
        <Animated.Image
          source={{ uri: item }}
          style={[
            styles.image,
            {
              transform: [
                { translateX },
                { scale },
              ],
            },
          ]}
          resizeMode="cover"
        />
        
        {/* 渐变蒙层效果 */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.2)', 'rgba(0,0,0,0.6)']}
          style={styles.gradient}
        />
      </View>
    );
  };
  
  // 顶部按钮部分
  const renderHeaderButtons = () => {
    return (
      <View style={styles.headerButtons}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={onBack}
          activeOpacity={0.7}
        >
          <BlurView intensity={90} tint="dark" style={styles.buttonBlur}>
            <Ionicons name="chevron-back" size={24} color="white" />
          </BlurView>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.headerButton}
          onPress={onShare}
          activeOpacity={0.7}
        >
          <BlurView intensity={90} tint="dark" style={styles.buttonBlur}>
            <Ionicons name="share-outline" size={22} color="white" />
          </BlurView>
        </TouchableOpacity>
      </View>
    );
  };
  
  return (
    <View style={styles.container}>
      {/* 状态栏 */}
      <StatusBar barStyle="light-content" translucent />
      
      {/* 图片轮播 */}
      <View style={styles.carouselContainer}>
        <Animated.FlatList
          ref={flatListRef}
          data={imageUrls}
          keyExtractor={(_, index) => `image-${index}`}
          renderItem={renderImageItem}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          bounces={false}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: true }
          )}
          scrollEventThrottle={16}
        />
        
        {/* 页码指示器 */}
        {imageUrls.length > 1 && renderPagination()}
        
        {/* 头部按钮 */}
        {renderHeaderButtons()}
        
        {/* 文物信息 */}
        <Animated.View
          style={[
            styles.infoOverlay,
            {
              opacity: titleOpacity,
              transform: [{ translateY: titleTranslateY }]
            }
          ]}
        >
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
          
          <View style={styles.metaContainer}>
            {dynasty && (
              <View style={styles.metaItem}>
                <Ionicons name="time-outline" size={14} color="rgba(255,255,255,0.8)" />
                <Text style={styles.metaText}>{dynasty}</Text>
              </View>
            )}
            
            {era && (
              <View style={styles.metaItem}>
                <Ionicons name="calendar-outline" size={14} color="rgba(255,255,255,0.8)" />
                <Text style={styles.metaText}>{era}</Text>
              </View>
            )}
          </View>
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: HEADER_HEIGHT,
    backgroundColor: COLORS.background,
    position: 'relative',
  },
  carouselContainer: {
    width: '100%',
    height: '100%',
    overflow: 'hidden',
  },
  imageContainer: {
    width,
    height: HEADER_HEIGHT,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: HEADER_HEIGHT / 2,
  },
  paginationContainer: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 130,
    alignSelf: 'center',
  },
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  headerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 40,
    width: '100%',
    paddingHorizontal: SPACING.medium,
    zIndex: 10,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonBlur: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  infoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: SPACING.medium,
    paddingBottom: SPACING.large,
  },
  title: {
    color: 'white',
    fontSize: FONTS.size.xxl,
    fontWeight: '600',
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    fontFamily: FONTS.family.special,
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: FONTS.size.medium,
    marginBottom: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  metaContainer: {
    flexDirection: 'row',
    marginTop: SPACING.small,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: SPACING.medium,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: RADIUS.small,
  },
  metaText: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: FONTS.size.small,
    marginLeft: 4,
  },
});

export default RelicDetailHeader; 