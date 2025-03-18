import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Dimensions,
  StyleProp,
  ViewStyle,
  TextStyle,
  DimensionValue,
  ColorValue,
} from 'react-native';
import { COLORS, RADIUS, SPACING } from '../../constants/Colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

/**
 * 骨架屏组件属性接口
 */
interface SkeletonProps {
  /**
   * 骨架元素的宽度
   */
  width?: number | string;
  /**
   * 骨架元素的高度
   */
  height?: number | string;
  /**
   * 骨架元素的样式
   */
  style?: StyleProp<ViewStyle>;
  /**
   * 骨架元素的圆角大小
   */
  borderRadius?: number;
  /**
   * 是否显示动画效果
   */
  animated?: boolean;
  /**
   * 动画的持续时间（毫秒）
   */
  speed?: number;
  /**
   * 动画高亮颜色
   */
  highlightColor?: string;
  /**
   * 骨架元素的背景颜色
   */
  backgroundColor?: string;
}

/**
 * 骨架屏组件 - 用于内容加载时显示的占位元素
 */
const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 20,
  style,
  borderRadius = RADIUS.small,
  animated = true,
  speed = 1200,
  highlightColor = COLORS.backgroundLight,
  backgroundColor = COLORS.border,
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    if (animated) {
      Animated.loop(
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: speed,
          useNativeDriver: false,
        })
      ).start();
    }
    
    return () => {
      animatedValue.stopAnimation();
    };
  }, [animated, animatedValue, speed]);
  
  const interpolatedBackground = animated
    ? animatedValue.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [backgroundColor, highlightColor, backgroundColor],
      })
    : backgroundColor;
  
  // 处理宽度值，确保返回DimensionValue类型
  const getWidthStyle = (): DimensionValue => {
    if (typeof width === 'number') {
      return width;
    }
    // 只允许百分比字符串或'auto'
    if (width === 'auto' || width.endsWith('%')) {
      return width as DimensionValue;
    }
    try {
      // 尝试转换为数字
      const numValue = Number(width);
      if (!isNaN(numValue)) {
        return numValue;
      }
    } catch (e) {}
    
    // 默认返回100%
    return '100%' as DimensionValue;
  };

  // 处理高度值，确保返回DimensionValue类型
  const getHeightStyle = (): DimensionValue => {
    if (typeof height === 'number') {
      return height;
    }
    // 只允许百分比字符串或'auto'
    if (height === 'auto' || height.endsWith('%')) {
      return height as DimensionValue;
    }
    try {
      // 尝试转换为数字
      const numValue = Number(height);
      if (!isNaN(numValue)) {
        return numValue;
      }
    } catch (e) {}
    
    // 默认返回20
    return 20;
  };

  // 渲染静态骨架元素
  if (!animated) {
    return (
      <View
        style={[
          {
            width: getWidthStyle(),
            height: getHeightStyle(),
            borderRadius,
            backgroundColor,
          },
          styles.skeleton,
          style,
        ]}
      />
    );
  }

  // 渲染动画骨架元素
  return (
    <Animated.View
      style={[
        styles.skeleton,
        style,
        {
          width: getWidthStyle(),
          height: getHeightStyle(),
          borderRadius,
        },
        // 动画背景色需要单独处理
        { backgroundColor: interpolatedBackground }
      ]}
    />
  );
};

/**
 * 文本骨架屏 - 用于加载文本内容的占位符
 */
export const TextSkeleton: React.FC<SkeletonProps & { lines?: number; lineSpacing?: number }> = ({
  lines = 3,
  width,
  lineSpacing = SPACING.xs,
  ...rest
}) => {
  return (
    <View>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          width={index === 0 ? width || '100%' : `${100 - index * 10}%`}
          style={{ marginTop: index === 0 ? 0 : lineSpacing }}
          {...rest}
        />
      ))}
    </View>
  );
};

/**
 * 头像骨架屏 - 用于加载用户头像的占位符
 */
export const AvatarSkeleton: React.FC<SkeletonProps> = ({
  width = 50,
  height = 50,
  borderRadius = RADIUS.round,
  ...rest
}) => {
  return <Skeleton width={width} height={height} borderRadius={borderRadius} {...rest} />;
};

/**
 * 列表项骨架屏 - 用于加载列表项的占位符
 */
export const ListItemSkeleton: React.FC<SkeletonProps & { 
  avatarSize?: number;
  hasImage?: boolean;
  imageSize?: number;
  lines?: number;
}> = ({
  avatarSize = 40,
  hasImage = false,
  imageSize = 60,
  lines = 2,
  ...rest
}) => {
  return (
    <View style={styles.listItem}>
      <AvatarSkeleton width={avatarSize} height={avatarSize} {...rest} />
      <View style={styles.listItemContent}>
        <TextSkeleton lines={lines} {...rest} />
      </View>
      {hasImage && (
        <Skeleton
          width={imageSize}
          height={imageSize}
          borderRadius={RADIUS.small}
          {...rest}
        />
      )}
    </View>
  );
};

/**
 * 卡片骨架屏 - 用于加载卡片内容的占位符
 */
export const CardSkeleton: React.FC<SkeletonProps & {
  hasImage?: boolean;
  imageHeight?: number;
  lines?: number;
  padding?: number;
}> = ({
  hasImage = true,
  imageHeight = 150,
  lines = 3,
  width = '100%',
  padding = SPACING.medium,
  ...rest
}) => {
  // 处理宽度值
  const getCardWidth = (): DimensionValue => {
    if (typeof width === 'number') {
      return width;
    }
    if (width === 'auto' || width.endsWith('%')) {
      return width as DimensionValue;
    }
    return '100%' as DimensionValue;
  };

  return (
    <View
      style={[
        styles.card, 
        { 
          width: getCardWidth(),
          padding,
          borderRadius: rest.borderRadius || RADIUS.medium,
        }
      ]}
    >
      {hasImage && (
        <Skeleton
          width="100%"
          height={imageHeight}
          borderRadius={RADIUS.small}
          {...rest}
        />
      )}
      <View style={styles.cardContent}>
        <Skeleton
          width="60%"
          height={22}
          borderRadius={RADIUS.small}
          {...rest}
        />
        {Array.from({ length: lines }).map((_, index) => (
          <Skeleton
            key={index}
            width={`${100 - index * 10}%`}
            height={16}
            style={{ marginTop: SPACING.xs }}
            borderRadius={RADIUS.small}
            {...rest}
          />
        ))}
      </View>
    </View>
  );
};

/**
 * 文物详情骨架屏 - 用于加载文物详情页的占位符
 */
export const RelicDetailSkeleton: React.FC<SkeletonProps> = (props) => {
  return (
    <View style={styles.relicDetail}>
      <Skeleton
        width="100%"
        height={250}
        borderRadius={0}
        {...props}
      />
      <View style={styles.relicDetailContent}>
        <Skeleton
          width="70%"
          height={24}
          borderRadius={RADIUS.small}
          {...props}
        />
        <Skeleton
          width="40%"
          height={18}
          style={{ marginTop: SPACING.small }}
          borderRadius={RADIUS.small}
          {...props}
        />
        <View style={styles.divider} />
        <TextSkeleton
          lines={5}
          style={{ marginTop: SPACING.medium }}
          {...props}
        />
      </View>
    </View>
  );
};

/**
 * 故事体验骨架屏 - 用于加载故事体验页面的占位符
 */
export const StoryExperienceSkeleton: React.FC<SkeletonProps> = (props) => {
  return (
    <View style={styles.storyExperience}>
      <Skeleton
        width="100%"
        height="100%"
        borderRadius={0}
        {...props}
      />
      <View style={styles.storyDialog}>
        <Skeleton
          width={40}
          height={40}
          borderRadius={RADIUS.round}
          {...props}
        />
        <View style={styles.storyDialogContent}>
          <Skeleton
            width="80%"
            height={16}
            borderRadius={RADIUS.small}
            {...props}
          />
          <Skeleton
            width="60%"
            height={16}
            style={{ marginTop: SPACING.xs }}
            borderRadius={RADIUS.small}
            {...props}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  skeleton: {
    overflow: 'hidden',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.medium,
  },
  listItemContent: {
    flex: 1,
    marginLeft: SPACING.medium,
    marginRight: SPACING.small,
  },
  card: {
    overflow: 'hidden',
  },
  cardContent: {
    marginTop: SPACING.medium,
  },
  relicDetail: {
    flex: 1,
  },
  relicDetailContent: {
    padding: SPACING.medium,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.divider,
    marginVertical: SPACING.medium,
  },
  storyExperience: {
    flex: 1,
    position: 'relative',
  },
  storyDialog: {
    position: 'absolute',
    bottom: SPACING.large,
    left: SPACING.medium,
    right: SPACING.medium,
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.medium,
    padding: SPACING.medium,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  storyDialogContent: {
    flex: 1,
    marginLeft: SPACING.small,
  },
});

export default Skeleton; 