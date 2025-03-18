import React, { useEffect, useRef } from 'react';
import {
  StyleSheet,
  Animated,
  ViewStyle,
  StyleProp,
  Easing,
  Dimensions,
  View,
} from 'react-native';
import { ANIMATION } from '../../constants/Colors';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

type TransitionType = 
  | 'fade' 
  | 'slideLeft' 
  | 'slideRight' 
  | 'slideUp' 
  | 'slideDown' 
  | 'zoomIn' 
  | 'zoomOut' 
  | 'flip';

interface PageTransitionProps {
  children: React.ReactNode;
  type?: TransitionType;
  duration?: number;
  delay?: number;
  style?: StyleProp<ViewStyle>;
  isVisible?: boolean;
  easing?: typeof Easing.linear;
  onAnimationEnd?: () => void;
}

const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  type = 'fade',
  duration = ANIMATION.normal,
  delay = 0,
  style,
  isVisible = true,
  easing = Easing.bezier(0.25, 0.1, 0.25, 1), // 平滑的淡入淡出
  onAnimationEnd,
}) => {
  // 动画值初始化
  const opacity = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const rotateX = useRef(new Animated.Value(0)).current;
  
  // 已完成初始动画的引用
  const hasAnimatedIn = useRef(false);

  // 根据过渡类型创建不同的动画初始值
  const setupInitialValues = () => {
    // 重置所有动画值
    opacity.setValue(isVisible ? 0 : 1);
    translateX.setValue(0);
    translateY.setValue(0);
    scale.setValue(1);
    rotateX.setValue(0);

    switch (type) {
      case 'fade':
        opacity.setValue(isVisible ? 0 : 1);
        break;
      case 'slideLeft':
        translateX.setValue(isVisible ? SCREEN_WIDTH : 0);
        opacity.setValue(isVisible ? 0 : 1);
        break;
      case 'slideRight':
        translateX.setValue(isVisible ? -SCREEN_WIDTH : 0);
        opacity.setValue(isVisible ? 0 : 1);
        break;
      case 'slideUp':
        translateY.setValue(isVisible ? SCREEN_HEIGHT : 0);
        opacity.setValue(isVisible ? 0 : 1);
        break;
      case 'slideDown':
        translateY.setValue(isVisible ? -SCREEN_HEIGHT : 0);
        opacity.setValue(isVisible ? 0 : 1);
        break;
      case 'zoomIn':
        scale.setValue(isVisible ? 0.8 : 1);
        opacity.setValue(isVisible ? 0 : 1);
        break;
      case 'zoomOut':
        scale.setValue(isVisible ? 1.2 : 1);
        opacity.setValue(isVisible ? 0 : 1);
        break;
      case 'flip':
        rotateX.setValue(isVisible ? 90 : 0);
        opacity.setValue(isVisible ? 0 : 1);
        break;
    }
  };

  // 执行进入和退出动画
  const animateTransition = (toVisible: boolean) => {
    const configurations = [];
    
    // 基本不透明度动画
    configurations.push(
      Animated.timing(opacity, {
        toValue: toVisible ? 1 : 0,
        duration,
        easing,
        useNativeDriver: true,
      })
    );

    // 根据过渡类型添加额外的动画
    switch (type) {
      case 'slideLeft':
      case 'slideRight':
        configurations.push(
          Animated.timing(translateX, {
            toValue: 0,
            duration,
            easing,
            useNativeDriver: true,
          })
        );
        break;
      case 'slideUp':
      case 'slideDown':
        configurations.push(
          Animated.timing(translateY, {
            toValue: 0,
            duration,
            easing,
            useNativeDriver: true,
          })
        );
        break;
      case 'zoomIn':
      case 'zoomOut':
        configurations.push(
          Animated.timing(scale, {
            toValue: 1,
            duration,
            easing,
            useNativeDriver: true,
          })
        );
        break;
      case 'flip':
        configurations.push(
          Animated.timing(rotateX, {
            toValue: 0,
            duration,
            easing,
            useNativeDriver: true,
          })
        );
        break;
    }

    // 并行执行所有动画
    Animated.parallel(configurations).start(({ finished }) => {
      if (finished && onAnimationEnd) {
        onAnimationEnd();
      }
      
      if (toVisible) {
        hasAnimatedIn.current = true;
      }
    });
  };

  // 监听可见性变化
  useEffect(() => {
    // 第一次加载时设置初始值
    if (!hasAnimatedIn.current) {
      setupInitialValues();
    }
    
    // 延迟执行动画
    const animationTimer = setTimeout(() => {
      animateTransition(isVisible);
    }, delay);

    return () => clearTimeout(animationTimer);
  }, [isVisible]);

  // 在页面退出时的动画处理
  useEffect(() => {
    return () => {
      // 如果组件卸载时需要特殊处理，可以在这里添加清理代码
    };
  }, []);

  // 创建动画样式
  const animatedStyle = {
    opacity,
    transform: [
      { translateX },
      { translateY },
      { scale },
      {
        rotateX: rotateX.interpolate({
          inputRange: [0, 90],
          outputRange: ['0deg', '90deg'],
        }),
      },
    ],
  };

  // 当组件不可见且已经完成初始动画时，可以选择不渲染内容
  if (!isVisible && hasAnimatedIn.current) {
    return null;
  }

  return (
    <Animated.View style={[styles.container, animatedStyle, style]}>
      {children}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backfaceVisibility: 'hidden',
    position: 'relative',
  },
});

export default PageTransition; 