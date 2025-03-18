import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  ViewStyle,
  StyleProp,
  Animated,
  Pressable,
} from 'react-native';
import { COLORS, RADIUS, SHADOWS, SPACING, ANIMATION } from '../../constants/Colors';

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  elevation?: 'small' | 'medium' | 'large';
  radius?: 'small' | 'medium' | 'large' | 'xl';
  padding?: 'none' | 'small' | 'medium' | 'large';
  borderColor?: string;
  backgroundColor?: string;
  interactive?: boolean;
  activeScale?: number;
  horizontal?: boolean;
  testID?: string;
}

const Card: React.FC<CardProps> = ({
  children,
  style,
  onPress,
  elevation = 'small',
  radius = 'medium',
  padding = 'medium',
  borderColor,
  backgroundColor = COLORS.white,
  interactive = true,
  activeScale = 0.98,
  horizontal = false,
  testID,
}) => {
  // 用于动画效果的值
  const [scale] = useState(new Animated.Value(1));

  // 获取阴影样式
  const getShadow = () => {
    switch (elevation) {
      case 'small':
        return SHADOWS.small;
      case 'medium':
        return SHADOWS.medium;
      case 'large':
        return SHADOWS.large;
      default:
        return SHADOWS.small;
    }
  };

  // 获取圆角样式
  const getRadius = () => {
    switch (radius) {
      case 'small':
        return RADIUS.small;
      case 'medium':
        return RADIUS.medium;
      case 'large':
        return RADIUS.large;
      case 'xl':
        return RADIUS.xl;
      default:
        return RADIUS.medium;
    }
  };

  // 获取内边距样式
  const getPadding = () => {
    switch (padding) {
      case 'none':
        return 0;
      case 'small':
        return SPACING.small;
      case 'large':
        return SPACING.large;
      case 'medium':
      default:
        return SPACING.medium;
    }
  };

  // 处理按压开始
  const handlePressIn = () => {
    if (!interactive || !onPress) return;
    
    Animated.spring(scale, {
      toValue: activeScale,
      useNativeDriver: true,
      friction: 8,
      tension: 100,
    }).start();
  };

  // 处理按压结束
  const handlePressOut = () => {
    if (!interactive || !onPress) return;
    
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      friction: 8,
      tension: 100,
    }).start();
  };

  // 卡片样式
  const cardStyle: ViewStyle = {
    ...getShadow(),
    borderRadius: getRadius(),
    padding: getPadding(),
    backgroundColor,
    borderColor: borderColor || backgroundColor,
    borderWidth: borderColor ? 1 : 0,
    flexDirection: horizontal ? 'row' : 'column' as 'row' | 'column',
    ...StyleSheet.flatten(style as ViewStyle),
  };

  // 卡片内容组件
  const CardContent = () => (
    <Animated.View
      style={[
        cardStyle,
        {
          transform: [{ scale: scale }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );

  // 如果有点击事件，返回可点击的卡片
  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={{ borderRadius: getRadius() }}
        testID={testID}
        accessibilityRole="button"
      >
        <CardContent />
      </Pressable>
    );
  }

  // 否则返回普通View
  return (
    <View style={cardStyle} testID={testID}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    overflow: 'hidden',
    position: 'relative',
  },
  content: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.black,
    borderRadius: RADIUS.medium,
  },
});

export default Card; 