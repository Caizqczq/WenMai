import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Dimensions,
  ImageBackground,
  StatusBar,
  Platform,
  ScrollView,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, FONTS, SPACING, SHADOWS } from '../constants/Colors';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const HEADER_HEIGHT = SCREEN_HEIGHT * 0.5;
const HEADER_MIN_HEIGHT = 100;
const SCROLL_THRESHOLD = HEADER_HEIGHT / 2;

interface RelicDetailHeaderProps {
  imageUrls: string[];
  title: string;
  subtitle: string;
  dynasty: string;
  era: string;
  onBack: () => void;
  onShare: () => void;
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
  const insets = useSafeAreaInsets();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showFixedTitle, setShowFixedTitle] = useState(false);
  const [scrollY] = useState(new Animated.Value(0));

  // 根据滚动位置计算元素样式
  const headerHeight = scrollY.interpolate({
    inputRange: [0, SCROLL_THRESHOLD],
    outputRange: [HEADER_HEIGHT, HEADER_HEIGHT * 0.6],
    extrapolate: 'clamp',
  });

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, SCROLL_THRESHOLD / 2, SCROLL_THRESHOLD],
    outputRange: [1, 0.8, 0.6],
    extrapolate: 'clamp',
  });

  const titleTranslateY = scrollY.interpolate({
    inputRange: [0, SCROLL_THRESHOLD],
    outputRange: [0, -30],
    extrapolate: 'clamp',
  });

  const titleScale = scrollY.interpolate({
    inputRange: [0, HEADER_HEIGHT - HEADER_MIN_HEIGHT],
    outputRange: [1, 0.8],
    extrapolate: 'clamp',
  });

  const titleOpacity = scrollY.interpolate({
    inputRange: [0, SCROLL_THRESHOLD * 0.8, SCROLL_THRESHOLD],
    outputRange: [0, 0.5, 1],
    extrapolate: 'clamp',
  });

  // 自动轮播图片
  useEffect(() => {
    if (imageUrls.length <= 1) return;
    
    const interval = setInterval(() => {
      setActiveImageIndex((prev) => (prev + 1) % imageUrls.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [imageUrls]);

  // 监听滚动事件
  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    { useNativeDriver: false }
  );

  return (
    <View style={styles.container as ViewStyle}>
      {/* 设置状态栏为透明 */}
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      {/* 背景图片 */}
      <Animated.View
        style={[
          styles.headerContainer as ViewStyle,
          {
            height: headerHeight,
            opacity: headerOpacity,
          },
        ]}
      >
        <ImageBackground
          source={{ uri: imageUrls[activeImageIndex] }}
          style={styles.headerBackground as ViewStyle}
          resizeMode="cover"
        >
          {/* 图片渐变叠加层 */}
          <View style={styles.gradientOverlay as ViewStyle} />
          
          {/* 分页指示器 */}
          {imageUrls.length > 1 && (
            <View style={styles.paginationContainer as ViewStyle}>
              {imageUrls.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.paginationDot as ViewStyle,
                    index === activeImageIndex && styles.paginationDotActive as ViewStyle
                  ]}
                />
              ))}
            </View>
          )}
          
          {/* 标题信息 - 大版本 */}
          <Animated.View
            style={[
              styles.titleContainer as ViewStyle,
              {
                transform: [
                  { translateY: titleTranslateY },
                  { scale: titleScale },
                ],
              },
            ]}
          >
            <Text style={styles.title as TextStyle}>{title}</Text>
            <Text style={styles.subtitle as TextStyle}>{subtitle}</Text>
            <View style={styles.dynastyContainer as ViewStyle}>
              <Text style={styles.dynasty as TextStyle}>{dynasty}</Text>
              <View style={styles.dot as ViewStyle} />
              <Text style={styles.era as TextStyle}>{era}</Text>
            </View>
          </Animated.View>
        </ImageBackground>
      </Animated.View>
      
      {/* 固定标题 - 当滚动时显示 */}
      <Animated.View
        style={[
          styles.fixedTitleContainer as ViewStyle,
          {
            opacity: titleOpacity,
            paddingTop: insets.top,
          },
        ]}
      >
        <Text style={styles.fixedTitle as TextStyle} numberOfLines={1}>{title}</Text>
        <Text style={styles.fixedSubtitle as TextStyle} numberOfLines={1}>{dynasty} · {era}</Text>
      </Animated.View>
      
      {/* 返回按钮 */}
      <TouchableOpacity
        style={[
          styles.backButton as ViewStyle,
          { top: insets.top + 10 },
        ]}
        onPress={onBack}
        activeOpacity={0.7}
      >
        <Ionicons name="arrow-back" size={24} color={COLORS.white} />
      </TouchableOpacity>
      
      {/* 分享按钮 */}
      <TouchableOpacity
        style={[
          styles.shareButton as ViewStyle,
          { top: insets.top + 10 },
        ]}
        onPress={onShare}
        activeOpacity={0.7}
      >
        <Ionicons name="share-outline" size={24} color={COLORS.white} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  headerContainer: {
    width: SCREEN_WIDTH,
    height: HEADER_HEIGHT,
    position: 'relative',
    overflow: 'hidden',
  },
  headerBackground: {
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    backgroundImage: Platform.OS === 'web' ? 
      'linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.7))' : 
      undefined,
  },
  titleContainer: {
    padding: SPACING.large,
    paddingBottom: SPACING.xl,
  },
  title: {
    fontSize: FONTS.size.title,
    fontFamily: FONTS.family.heading,
    color: COLORS.white,
    marginBottom: SPACING.xs,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  subtitle: {
    fontSize: FONTS.size.large,
    fontFamily: FONTS.family.main,
    color: COLORS.white,
    marginBottom: SPACING.small,
    opacity: 0.9,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  dynastyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dynasty: {
    fontSize: FONTS.size.medium,
    color: COLORS.white,
    opacity: 0.8,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.white,
    opacity: 0.8,
    marginHorizontal: SPACING.xs,
  },
  era: {
    fontSize: FONTS.size.medium,
    color: COLORS.white,
    opacity: 0.8,
  },
  backButton: {
    position: 'absolute',
    left: SPACING.medium,
    zIndex: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareButton: {
    position: 'absolute',
    right: SPACING.medium,
    zIndex: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.4)',
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: COLORS.white,
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  fixedTitleContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center',
    paddingBottom: SPACING.small,
    paddingHorizontal: SPACING.large,
    opacity: 0,
    zIndex: 15,
  },
  fixedTitle: {
    fontSize: FONTS.size.large,
    fontWeight: '700',
    color: COLORS.white,
    textAlign: 'center',
  },
  fixedSubtitle: {
    fontSize: FONTS.size.small,
    color: COLORS.white,
    opacity: 0.8,
    textAlign: 'center',
    marginTop: 2,
  },
});

export default RelicDetailHeader; 