import React, { useRef } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  View,
  StyleProp,
  ViewStyle,
  TextStyle,
  Pressable,
  ImageStyle,
  Platform,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSpring,
  Easing,
} from 'react-native-reanimated';
import { COLORS, FONTS, RADIUS, SHADOWS, SPACING, ANIMATION } from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

type ButtonVariant = 'filled' | 'outlined' | 'text' | 'icon' | 'gradient';
type ButtonSize = 'small' | 'medium' | 'large';
type IconName = React.ComponentProps<typeof Ionicons>['name'];

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  color?: string;
  title?: string;
  leftIcon?: IconName;
  rightIcon?: IconName;
  iconSize?: number;
  disabled?: boolean;
  loading?: boolean;
  loadingText?: string;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  onPress?: () => void;
  fullWidth?: boolean;
  rounded?: boolean;
  hapticFeedback?: boolean;
  activeScale?: number;
  children?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'filled',
  size = 'medium',
  color = COLORS.primary,
  title,
  leftIcon,
  rightIcon,
  iconSize,
  disabled = false,
  loading = false,
  loadingText,
  style,
  textStyle,
  onPress,
  fullWidth = false,
  rounded = false,
  hapticFeedback = true,
  activeScale = 0.97,
  children,
}) => {
  // 动画值
  const scale = useSharedValue(1);
  
  // 字体权重映射
  const fontWeightMapping: Record<string, "400" | "500" | "600" | "700"> = {
    light: "400",
    regular: "400", 
    medium: "500",
    semiBold: "600",
    bold: "700"
  };

  // 获取正确的字体权重
  const getFontWeight = (weight: string): "400" | "500" | "600" | "700" => {
    return fontWeightMapping[weight] || "500";
  };

  // 获取基于尺寸的样式
  const getSizeStyles = (): { container: ViewStyle; text: TextStyle } => {
    switch (size) {
      case 'small':
        return {
          container: {
            paddingVertical: SPACING.xs,
            paddingHorizontal: variant === 'icon' ? SPACING.xs : SPACING.medium,
            minHeight: 32,
          },
          text: {
            fontSize: FONTS.size.small,
          },
        };
      case 'large':
        return {
          container: {
            paddingVertical: SPACING.medium,
            paddingHorizontal: variant === 'icon' ? SPACING.medium : SPACING.large,
            minHeight: 48,
          },
          text: {
            fontSize: FONTS.size.large,
          },
        };
      case 'medium':
      default:
        return {
          container: {
            paddingVertical: SPACING.small,
            paddingHorizontal: variant === 'icon' ? SPACING.small : SPACING.medium,
            minHeight: 40,
          },
          text: {
            fontSize: FONTS.size.medium,
          },
        };
    }
  };

  // 获取基于变体的样式
  const getVariantStyles = (): { container: ViewStyle; text: TextStyle } => {
    switch (variant) {
      case 'outlined':
        return {
          container: {
            backgroundColor: 'transparent',
            borderWidth: 1.5,
            borderColor: disabled ? COLORS.inactive : color,
          },
          text: {
            color: disabled ? COLORS.inactive : color,
          },
        };
      case 'text':
        return {
          container: {
            backgroundColor: 'transparent',
            borderWidth: 0,
          },
          text: {
            color: disabled ? COLORS.inactive : color,
          },
        };
      case 'icon':
        return {
          container: {
            backgroundColor: 'transparent',
            borderWidth: 0,
            paddingHorizontal: 0,
            paddingVertical: 0,
            minHeight: 0,
            width: (iconSize || 20) + 2 * SPACING.small,
            height: (iconSize || 20) + 2 * SPACING.small,
            alignItems: 'center',
            justifyContent: 'center',
          },
          text: {
            color: disabled ? COLORS.inactive : color,
          },
        };
      case 'gradient':
        return {
          container: {
            backgroundColor: disabled ? COLORS.inactive : color,
            borderWidth: 0,
          },
          text: {
            color: COLORS.white,
          },
        };
      case 'filled':
      default:
        return {
          container: {
            backgroundColor: disabled ? COLORS.inactive : color,
            borderWidth: 0,
          },
          text: {
            color: COLORS.white,
          },
        };
    }
  };

  // 获取阴影样式
  const getShadowStyle = (): ViewStyle => {
    if (disabled || variant === 'text' || variant === 'outlined') {
      return {};
    }
    
    return SHADOWS.small;
  };

  // 获取图标尺寸
  const getIconSize = () => {
    if (iconSize) return iconSize;
    
    switch (size) {
      case 'small': return 16;
      case 'large': return 24;
      case 'medium':
      default: return 20;
    }
  };

  // 处理点击事件
  const handlePress = () => {
    if (disabled || loading) return;
    
    // 触感反馈
    if (Platform.OS !== 'web' && hapticFeedback) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    onPress && onPress();
  };
  
  // 处理按下事件
  const handlePressIn = () => {
    if (disabled || loading) return;
    
    scale.value = withSpring(activeScale, {
      damping: 20,
      stiffness: 300,
    });
  };
  
  // 处理释放事件
  const handlePressOut = () => {
    if (disabled || loading) return;
    
    scale.value = withSpring(1, {
      damping: 20,
      stiffness: 300,
    });
  };

  // 应用动画样式
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  // 获取尺寸和变体样式
  const sizeStyles = getSizeStyles();
  const variantStyles = getVariantStyles();
  const shadowStyle = getShadowStyle();

  // 渲染按钮
  return (
    <AnimatedPressable
      style={[
        styles.container,
        sizeStyles.container,
        variantStyles.container,
        shadowStyle,
        {
          borderRadius: rounded ? RADIUS.round : RADIUS.medium,
          opacity: disabled ? 0.6 : 1,
          width: fullWidth ? '100%' : 'auto',
          overflow: 'hidden',
        },
        style,
        animatedStyle,
      ]}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      android_ripple={null}
    >
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator 
            size="small" 
            color={variant === 'filled' || variant === 'gradient' ? COLORS.white : color} 
          />
          {loadingText && (
            <Text 
              style={[
                styles.text,
                sizeStyles.text, 
                variantStyles.text, 
                { marginLeft: SPACING.small },
                textStyle
              ]}
            >
              {loadingText}
            </Text>
          )}
        </View>
      ) : (
        <View style={styles.contentContainer}>
          {leftIcon && (
            <Ionicons 
              name={leftIcon} 
              size={iconSize || 20} 
              color={variant === 'filled' || variant === 'gradient' ? COLORS.white : color}
              style={{ marginRight: title ? SPACING.xs : 0 }} 
            />
          )}
          
          {title && (
            <Text 
              style={[
                styles.text, 
                sizeStyles.text, 
                { 
                  fontWeight: getFontWeight(FONTS.weight.medium),
                  fontFamily: FONTS.family.main,
                },
                variantStyles.text,
                textStyle
              ]}
              numberOfLines={1}
            >
              {title}
            </Text>
          )}
          
          {rightIcon && (
            <Ionicons 
              name={rightIcon} 
              size={iconSize || 20} 
              color={variant === 'filled' || variant === 'gradient' ? COLORS.white : color}
              style={{ marginLeft: title ? SPACING.xs : 0 }} 
            />
          )}
          
          {children}
        </View>
      )}
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  text: {
    textAlign: 'center',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default Button; 