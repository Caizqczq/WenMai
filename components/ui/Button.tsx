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
  Animated,
  Pressable,
  ImageStyle,
} from 'react-native';
import { COLORS, FONTS, RADIUS, SHADOWS, SPACING, ANIMATION } from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';

type ButtonVariant = 'filled' | 'outlined' | 'text' | 'icon';
type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  color?: string;
  title?: string;
  leftIcon?: string;
  rightIcon?: string;
  iconSize?: number;
  disabled?: boolean;
  loading?: boolean;
  loadingText?: string;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  onPress?: () => void;
  fullWidth?: boolean;
  rounded?: boolean;
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
  children,
}) => {
  // 动画值
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const [opacityAnim] = React.useState(new Animated.Value(0));
  
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
            borderWidth: 1,
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
            paddingHorizontal: SPACING.small,
          },
          text: {
            color: disabled ? COLORS.inactive : color,
          },
        };
      case 'icon':
        return {
          container: {
            backgroundColor: 'transparent',
            paddingHorizontal: 0,
            paddingVertical: 0,
            borderRadius: 999,
            aspectRatio: 1,
            alignItems: 'center',
            justifyContent: 'center',
          },
          text: {
            color: disabled ? COLORS.inactive : color,
          },
        };
      case 'filled':
      default:
        return {
          container: {
            backgroundColor: disabled ? COLORS.inactive : color,
          },
          text: {
            color: COLORS.white,
          },
        };
    }
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

  // 处理按压开始
  const handlePressIn = () => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0.97,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0.12,
        duration: 150,
        useNativeDriver: false,
      }),
    ]).start();
  };

  // 处理按压结束
  const handlePressOut = () => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }),
    ]).start();
  };

  // 获取尺寸和变体样式
  const sizeStyles = getSizeStyles();
  const variantStyles = getVariantStyles();

  // 组合按钮样式
  const buttonStyles: ViewStyle = {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: rounded ? 999 : 8,
    overflow: 'hidden',
    opacity: disabled ? 0.6 : 1,
    ...sizeStyles.container,
    ...variantStyles.container,
    ...(fullWidth && { width: '100%', alignSelf: 'center' }),
  };

  // 组合文本样式
  const textStyles: TextStyle = {
    ...styles.text,
    ...sizeStyles.text,
    ...variantStyles.text,
    ...(textStyle as TextStyle),
  };

  // 渲染内容
  const renderContent = () => {
    if (children) return children;
    
    // 图标属性
    const iconProps = {
      size: getIconSize(),
      color: variant === 'filled' ? COLORS.white : color,
    };

    return (
      <>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator 
              color={variant === 'filled' ? COLORS.white : color} 
              size={size === 'small' ? 'small' : 'small'} 
            />
            {loadingText && (
              <Text style={[styles.loadingText, textStyles]}>{loadingText}</Text>
            )}
          </View>
        ) : (
          <>
            {leftIcon && (
              <Ionicons
                name={leftIcon as any}
                {...iconProps}
                style={title ? styles.leftIcon : undefined}
              />
            )}
            
            {title && <Text style={textStyles}>{title}</Text>}
            
            {rightIcon && (
              <Ionicons
                name={rightIcon as any}
                {...iconProps}
                style={title ? styles.rightIcon : undefined}
              />
            )}
          </>
        )}
      </>
    );
  };

  return (
    <Pressable
      disabled={disabled || loading}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={buttonStyles}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
    >
      {/* 按钮背景动画效果 */}
      <Animated.View 
        style={[
          styles.contentContainer,
          { transform: [{ scale: scaleAnim }] }
        ]}
      >
        {renderContent()}
      </Animated.View>
      
      {/* 按钮点击涟漪效果 */}
      <Animated.View 
        style={[
          styles.overlay,
          { 
            opacity: opacityAnim,
            backgroundColor: variant === 'filled' ? COLORS.white : color,
          }
        ]}
      />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    zIndex: 2,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  text: {
    fontSize: FONTS.size.medium,
    fontFamily: FONTS.family.main,
    color: COLORS.white,
    textAlign: 'center',
  },
  leftIcon: {
    marginRight: SPACING.xs,
  },
  rightIcon: {
    marginLeft: SPACING.xs,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginLeft: SPACING.xs,
  },
});

export default Button; 