import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, Text, TouchableOpacity, StyleSheet, 
  Dimensions, Animated, Image, ActivityIndicator 
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { storyService } from '../../data/services';
import { Story, Scene as SceneType, Dialog as DialogType, InteractionPoint } from '../../data/types';
import { COLORS } from '../../constants/Colors';
import LoadingIndicator from '../../components/ui/LoadingIndicator';

const { width, height } = Dimensions.get('window');

interface StoryExperienceProps {
  id?: string | string[];
}

const StoryExperienceScreen: React.FC<StoryExperienceProps> = (props) => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [story, setStory] = useState<Story | null>(null);
  const [currentSceneId, setCurrentSceneId] = useState<string>('');
  const [currentDialogIndex, setCurrentDialogIndex] = useState(0);
  const [dialogAnimValue] = useState(new Animated.Value(0));
  const [showInteractionPoints, setShowInteractionPoints] = useState(false);
  const [dialogHistory, setDialogHistory] = useState<DialogType[]>([]);
  
  // 加载故事数据
  useEffect(() => {
    const loadStory = async () => {
      if (!props.id) {
        setError('缺少故事ID');
        setLoading(false);
        return;
      }
      
      const storyId = Array.isArray(props.id) ? props.id[0] : props.id;
      
      try {
        setLoading(true);
        const storyData = await storyService.getStoryById(storyId);
        
        if (!storyData) {
          setError('未找到故事');
          setLoading(false);
          return;
        }
        
      setStory(storyData);
        
        // 设置初始场景
        if (storyData.scenes && storyData.scenes.length > 0) {
          setCurrentSceneId(storyData.scenes[0].id);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('加载故事数据失败:', error);
        setError('加载故事数据失败，请稍后重试');
        setLoading(false);
      }
    };
    
    loadStory();
  }, [props.id]);
  
  // 获取当前场景
  const getCurrentScene = useCallback((): SceneType | undefined => {
    if (!story || !story.scenes) return undefined;
    return story.scenes.find(scene => scene.id === currentSceneId);
  }, [story, currentSceneId]);
  
  // 获取当前对话
  const getCurrentDialog = useCallback((): DialogType | undefined => {
    const currentScene = getCurrentScene();
    if (!currentScene || !currentScene.dialogs || currentScene.dialogs.length === 0) {
      return undefined;
    }
    return currentScene.dialogs[currentDialogIndex];
  }, [getCurrentScene, currentDialogIndex]);
  
  // 动画效果
  useEffect(() => {
    Animated.timing(dialogAnimValue, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
    
    return () => {
      dialogAnimValue.setValue(0);
    };
  }, [currentDialogIndex, currentSceneId]);
  
  // 处理下一条对话
  const handleNextDialog = () => {
    const currentScene = getCurrentScene();
    if (!currentScene) return;
    
    const currentDialog = getCurrentDialog();
    if (currentDialog) {
      // 记录对话历史
      setDialogHistory(prev => [...prev, currentDialog]);
    }
    
    dialogAnimValue.setValue(0);
    
    if (currentDialogIndex < currentScene.dialogs.length - 1) {
      // 还有更多对话
      setCurrentDialogIndex(currentDialogIndex + 1);
    } else {
      // 已经是最后一条对话，显示交互点
      setShowInteractionPoints(true);
    }
  };
  
  // 处理交互点击
  const handleInteractionPoint = (point: InteractionPoint) => {
    if (point.nextScene) {
      // 切换场景
      setCurrentSceneId(point.nextScene);
      setCurrentDialogIndex(0);
      setShowInteractionPoints(false);
      dialogAnimValue.setValue(0);
    } else if (point.triggerDialog) {
      // TODO: 触发特殊对话
      console.log('触发特殊对话:', point.triggerDialog);
    }
  };
  
  // 渲染加载状态
  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <LoadingIndicator 
          type="page"
          message="正在加载故事..." 
          color={COLORS.primary}
        />
      </SafeAreaView>
    );
  }
  
  // 渲染错误状态
  if (error || !story) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={60} color={COLORS.error} />
        <Text style={styles.errorText}>{error || '故事加载失败'}</Text>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>返回</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }
  
  const currentScene = getCurrentScene();
  const currentDialog = getCurrentDialog();
  
  if (!currentScene || !currentDialog) {
  return (
      <SafeAreaView style={styles.errorContainer}>
        <Text style={styles.errorText}>故事场景数据错误</Text>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>返回</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }
  
  // 渲染对话框
  const renderDialog = () => {
    const dialogOpacity = dialogAnimValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
    });
    
    const dialogTranslateY = dialogAnimValue.interpolate({
      inputRange: [0, 1],
      outputRange: [20, 0],
    });
    
    return (
      <Animated.View
        style={[
          styles.dialogContainer,
          {
            opacity: dialogOpacity,
            transform: [{ translateY: dialogTranslateY }],
          },
        ]}
      >
        <View style={styles.dialogHeader}>
          <Text style={styles.characterName}>{currentDialog.character}</Text>
        </View>
        <Text style={styles.dialogText}>{currentDialog.text}</Text>
        <TouchableOpacity 
          style={styles.nextButton}
          onPress={handleNextDialog}
        >
          <Text style={styles.nextButtonText}>继续</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };
  
  // 渲染交互点
  const renderInteractionPoints = () => {
    if (!showInteractionPoints || !currentScene.interactionPoints) {
      return null;
    }
    
    return currentScene.interactionPoints.map((point) => (
            <TouchableOpacity
              key={point.id}
        style={[
          styles.interactionPoint,
          {
            left: point.position.x,
            top: point.position.y,
          },
        ]}
        onPress={() => handleInteractionPoint(point)}
      >
        <View style={styles.interactionPointCircle}>
          <Ionicons 
            name={
              point.type === 'item' 
                ? 'search-circle' 
                : point.type === 'character' 
                  ? 'person-circle'
                  : 'arrow-forward-circle'
            } 
            size={32} 
            color="#FFF" 
          />
        </View>
        <View style={styles.interactionHint}>
          <Text style={styles.interactionHintText}>{point.hintText}</Text>
        </View>
            </TouchableOpacity>
    ));
  };
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentScene.backgroundColor }]}>
      <StatusBar style="light" />
          
          {/* 返回按钮 */}
          <TouchableOpacity 
        style={styles.backButtonTop}
            onPress={() => router.back()}
          >
        <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
          
      {/* 场景图片 */}
      <View style={styles.sceneImageContainer}>
        {currentScene.backgroundImage && (
          <Image 
            source={{ uri: currentScene.backgroundImage }}
            style={styles.sceneBackgroundImage}
            resizeMode="cover"
          />
        )}
      </View>
      
      {/* 交互点 */}
      {renderInteractionPoints()}
      
      {/* 对话框 */}
      {renderDialog()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#F5EFE0',
    textAlign: 'center',
    marginVertical: 20,
  },
  backButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backButtonTop: {
    position: 'absolute',
    top: 10,
    left: 10,
    zIndex: 10,
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sceneImageContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  sceneBackgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  dialogContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.75)',
    borderRadius: 12,
    padding: 15,
    minHeight: 120,
  },
  dialogHeader: {
    marginBottom: 8,
  },
  characterName: {
    color: '#FFD700',
    fontSize: 18,
    fontWeight: 'bold',
  },
  dialogText: {
    color: '#FFF',
    fontSize: 16,
    lineHeight: 24,
  },
  nextButton: {
    alignSelf: 'flex-end',
    paddingVertical: 8,
    paddingHorizontal: 15,
    marginTop: 10,
  },
  nextButtonText: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: 'bold',
  },
  interactionPoint: {
    position: 'absolute',
    width: 40,
    height: 40,
    zIndex: 5,
  },
  interactionPointCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,215,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  interactionHint: {
    position: 'absolute',
    top: -30,
    left: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 8,
    padding: 5,
    minWidth: 80,
  },
  interactionHintText: {
    color: '#FFF',
    fontSize: 12,
    textAlign: 'center',
  },
});

export default StoryExperienceScreen; 