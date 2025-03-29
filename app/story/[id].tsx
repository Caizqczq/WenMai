import React, { useEffect, useState, useRef } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import StoryExperienceScreen from '../screens/StoryExperienceScreen';
import { Text, View, TouchableOpacity, StyleSheet, ActivityIndicator, Image, Animated, Easing } from 'react-native';
import { getImageSource } from '../../utils/imageUtils';
import { LinearGradient } from 'expo-linear-gradient';
import { storyService } from '../../data/services';

interface StoryInfo {
  title: string;
  coverImagePath: string;
}

export default function StoryExperience() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [progress] = useState(new Animated.Value(0));
  const [loadingText, setLoadingText] = useState('准备进入故事世界...');
  const [storyInfo, setStoryInfo] = useState<StoryInfo>({
    title: '历史故事',
    coverImagePath: '/images/goujian_story_cover.jpg'
  });
  
  // 添加动画值
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  
  // 获取故事信息
  useEffect(() => {
    if (params.id) {
      const storyId = Array.isArray(params.id) ? params.id[0] : params.id;
      
      // 尝试获取故事数据
      const fetchStoryInfo = async () => {
        try {
          const story = await storyService.getStoryById(storyId);
          if (story) {
            setStoryInfo({
              title: story.title,
              coverImagePath: story.coverImage || '/images/goujian_story_cover.jpg'
            });
          }
        } catch (error) {
          console.error('获取故事信息失败:', error);
        }
      };
      
      fetchStoryInfo();
    }
  }, [params.id]);
  
  useEffect(() => {
    // 调试打印参数
    console.log('故事路由页面接收到参数:', params);
    console.log('故事ID:', params.id, '类型:', typeof params.id);
    
    // 模拟加载过程
    if (loading) {
      // 随机加载时间 2-5秒
      const loadingTime = Math.floor(Math.random() * 3000) + 2000;
      
      // 更新加载文本
      const loadingTexts = [
        '准备进入故事世界...',
        '加载历史场景...',
        '构建人物形象...',
        '调整光影效果...',
        '最终准备中...'
      ];
      
      let currentTextIndex = 0;
      const textInterval = setInterval(() => {
        currentTextIndex = (currentTextIndex + 1) % loadingTexts.length;
        setLoadingText(loadingTexts[currentTextIndex]);
      }, 800);
      
      // 进度条动画
      Animated.timing(progress, {
        toValue: 100,
        duration: loadingTime,
        useNativeDriver: false
      }).start();
      
      // 完成加载
      setTimeout(() => {
        clearInterval(textInterval);
        setLoading(false);
      }, loadingTime);
    }
  }, [params, loading]);
  
  // 启动动画效果
  useEffect(() => {
    if (loading) {
      // 淡入动画
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }).start();
      
      // 缩放动画
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }).start();
      
      // 旋转动画（用于加载图标）
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    }
  }, [loading, fadeAnim, scaleAnim, rotateAnim]);
  
  // 如果没有ID参数，显示错误信息
  if (!params.id) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>未找到故事ID参数</Text>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>返回</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  // 显示加载页面
  if (loading) {
    // 获取封面图片
    const coverImage = getImageSource(storyInfo.coverImagePath);
    
    // 旋转插值
    const spin = rotateAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg']
    });
    
    return (
      <View style={styles.loadingContainer}>
        <Image 
          source={coverImage}
          style={styles.backgroundImage}
          blurRadius={2}
        />
        <LinearGradient
          colors={['rgba(0,0,0,0.7)', 'rgba(0,0,0,0.9)']}
          style={styles.overlay}
        />
        
        <Animated.View 
          style={[
            styles.loadingContent,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }]
            }
          ]}
        >
          <Text style={styles.loadingTitle}>{storyInfo.title}</Text>
          <Text style={styles.loadingSubtitle}>历史故事体验</Text>
          
          <View style={styles.progressContainer}>
            <Animated.View 
              style={[
                styles.progressBar, 
                {
                  width: progress.interpolate({
                    inputRange: [0, 100],
                    outputRange: ['0%', '100%']
                  })
                }
              ]}
            />
          </View>
          
          <View style={styles.indicatorContainer}>
            <Animated.View style={{ transform: [{ rotate: spin }] }}>
              <View style={styles.customIndicator}>
                <View style={styles.indicatorInner} />
              </View>
            </Animated.View>
            <Text style={styles.loadingText}>{loadingText}</Text>
          </View>
        </Animated.View>
      </View>
    );
  }
  
  return <StoryExperienceScreen id={params.id} />;
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  errorText: {
    fontSize: 18,
    color: '#F5EFE0',
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#8B4513',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backgroundImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    opacity: 0.6,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  loadingContent: {
    width: '80%',
    alignItems: 'center',
  },
  loadingTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  loadingSubtitle: {
    fontSize: 18,
    color: '#E0E0E0',
    marginBottom: 40,
    textAlign: 'center',
  },
  progressContainer: {
    width: '100%',
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 3,
    marginBottom: 30,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#FFD700',
    borderRadius: 3,
  },
  indicatorContainer: {
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginTop: 15,
    textAlign: 'center',
  },
  customIndicator: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    borderTopColor: '#FFD700',
    justifyContent: 'center',
    alignItems: 'center',
  },
  indicatorInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FFD700',
  },
}); 