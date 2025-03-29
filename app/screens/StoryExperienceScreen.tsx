import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  View, Text, TouchableOpacity, StyleSheet, 
  Dimensions, Animated, Image, ActivityIndicator, ScrollView, Platform, StatusBar as RNStatusBar
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as ScreenOrientation from 'expo-screen-orientation';
import * as NavigationBar from 'expo-navigation-bar';
import { storyService } from '../../data/services';
import { Story, Scene as SceneType, Dialog as DialogType, InteractionPoint } from '../../data/types';
import { COLORS } from '../../constants/Colors';
import LoadingIndicator from '../../components/ui/LoadingIndicator';
import DialogChoice from '../../components/story/DialogChoice';
import QuizDialog from '../../components/story/QuizDialog';
import InteractionPointHelper from '../../components/story/InteractionPointHelper';
import { getImageSource } from '../../utils/imageUtils';
import CharacterAvatar from '../../components/story/CharacterAvatar';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

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
  const [specialDialog, setSpecialDialog] = useState<{
    id: string;
    type: 'choice' | 'quiz';
    dialog: DialogType;
  } | null>(null);
  const [isLandscape, setIsLandscape] = useState(false);
  const [hideHeader, setHideHeader] = useState(false);
  
  // 移除打字机效果相关状态
  const scrollViewRef = useRef<ScrollView>(null);
  
  // 监听屏幕方向变化并设置全屏模式
  useEffect(() => {
    // 设置屏幕为横屏模式
    const lockOrientationAndFullscreen = async () => {
      try {
        // 锁定横屏方向
        await ScreenOrientation.lockAsync(
          ScreenOrientation.OrientationLock.LANDSCAPE
        );
        setIsLandscape(true);
        
        // 根据平台设置全屏模式
        if (Platform.OS === 'android') {
          RNStatusBar.setHidden(true);
          // 隐藏Android导航栏
          await NavigationBar.setVisibilityAsync("hidden");
          await NavigationBar.setBehaviorAsync('overlay-swipe');
        } else if (Platform.OS === 'ios') {
          // iOS设置状态栏隐藏
          RNStatusBar.setHidden(true, 'slide');
        }
      } catch (error) {
        console.error('设置横屏模式失败:', error);
      }
    };
    
    lockOrientationAndFullscreen();
    
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setIsLandscape(window.width > window.height);
    });
    
    return () => {
      subscription.remove();
      // 组件卸载时解锁屏幕方向和退出全屏
      ScreenOrientation.unlockAsync();
      if (Platform.OS === 'android') {
        RNStatusBar.setHidden(false);
        // 恢复Android导航栏
        NavigationBar.setVisibilityAsync("visible");
      } else if (Platform.OS === 'ios') {
        RNStatusBar.setHidden(false);
      }
    };
  }, []);
  
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
  
  // 处理返回上一条对话
  const handlePreviousDialog = () => {
    if (currentDialogIndex > 0) {
      dialogAnimValue.setValue(0);
      setCurrentDialogIndex(currentDialogIndex - 1);
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
      // 清除专用对话状态
      setSpecialDialog(null);
    } else if (point.triggerDialog) {
      // 处理特殊对话类型
      console.log('触发特殊对话:', point.triggerDialog);
      handleSpecialDialog(point.triggerDialog);
    }
  };
  
  // 处理特殊对话
  const handleSpecialDialog = (dialogId: string) => {
    const currentScene = getCurrentScene();
    if (!currentScene) return;
    
    console.log('尝试查找特殊对话:', dialogId);
    console.log('当前场景对话列表:', currentScene.dialogs);
    
    // 查找特殊对话
    const dialog = currentScene.dialogs.find(d => d.id === dialogId);
    if (!dialog) {
      console.error('未找到对话:', dialogId);
      return;
    }
    
    console.log('找到对话:', dialog);
    
    // 判断对话类型
    if (dialog.choices) {
      console.log('检测到选择题对话，choices:', dialog.choices);
      setSpecialDialog({
        id: dialogId,
        type: 'choice',
        dialog
      });
    } else if (dialog.quiz) {
      console.log('检测到问答题对话，quiz:', dialog.quiz);
      setSpecialDialog({
        id: dialogId,
        type: 'quiz',
        dialog
      });
    } else {
      console.error('未知的特殊对话类型:', dialogId, dialog);
    }
  };
  
  // 处理特殊对话完成
  const handleSpecialDialogComplete = () => {
    setSpecialDialog(null);
    // 如果需要，可以在这里更新游戏状态或进度
  };
  
  // 修改返回按钮处理函数，确保返回前解锁屏幕方向
  const handleBackPress = async () => {
    try {
      await ScreenOrientation.unlockAsync();
      if (Platform.OS === 'android') {
        RNStatusBar.setHidden(false);
        // 恢复Android导航栏
        await NavigationBar.setVisibilityAsync("visible");
      } else if (Platform.OS === 'ios') {
        RNStatusBar.setHidden(false);
      }
    } catch (error) {
      console.error('解锁屏幕方向失败:', error);
    }
    router.back();
  };
  
  // 切换导航栏显示/隐藏
  const toggleHeader = () => {
    setHideHeader(!hideHeader);
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
          style={styles.backButtonMain}
          onPress={handleBackPress}
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
          style={styles.backButtonMain}
          onPress={handleBackPress}
        >
          <Text style={styles.backButtonText}>返回</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }
  
  // 渲染对话框 - 调整为横屏布局
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
          isLandscape && styles.landscapeDialogContainer,
          {
            opacity: dialogOpacity,
            transform: [{ translateY: dialogTranslateY }],
          },
        ]}
      >
        {/* 对话框背景模糊效果 */}
        <BlurView intensity={30} tint="dark" style={styles.blurBackground} />
        
        {/* 角色头像和名称 */}
        <View style={styles.characterInfo}>
          <Animated.View
            style={[
              styles.avatarContainer,
              {
                transform: [
                  {
                    scale: dialogAnimValue.interpolate({
                      inputRange: [0, 0.5, 1],
                      outputRange: [0.5, 1.1, 1]
                    })
                  }
                ]
              }
            ]}
          >
            <CharacterAvatar 
              character={currentDialog?.character || ''} 
              size={40} 
              borderColor={
                currentDialog?.character === '越王勾践' ? '#FFD700' :
                currentDialog?.character === '讲述者' ? '#4A90E2' :
                '#FFFFFF'
              }
            />
          </Animated.View>
          <View style={styles.characterNameContainer}>
            <Text style={styles.characterName}>{currentDialog?.character}</Text>
            {currentDialog?.emotion && (
              <Text style={styles.characterEmotion}>({currentDialog.emotion})</Text>
            )}
          </View>
        </View>
        
        {/* 对话内容 */}
        <ScrollView 
          ref={scrollViewRef}
          style={styles.dialogTextScrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.dialogTextContent}
        >
          <Text style={styles.dialogText}>
            {currentDialog?.text}
          </Text>
        </ScrollView>
        
        {/* 导航按钮 */}
        <View style={styles.dialogNavButtons}>
          {currentDialogIndex > 0 && (
            <TouchableOpacity 
              style={styles.prevButton}
              onPress={handlePreviousDialog}
            >
              <Ionicons name="chevron-back" size={16} color="#FFFFFF" />
              <Text style={styles.navButtonText}>上一条</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity 
            style={styles.nextButton}
            onPress={handleNextDialog}
          >
            <Text style={styles.navButtonText}>继续</Text>
            <Ionicons name="chevron-forward" size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  };
  
  // 渲染交互点 - 使用辅助组件
  const renderInteractionPoints = () => {
    if (!showInteractionPoints || !currentScene.interactionPoints) {
      return null;
    }
    
    return currentScene.interactionPoints.map((point, index) => (
      <InteractionPointHelper
        key={`point-${index}`}
        point={point}
        onPress={handleInteractionPoint}
        isLandscape={isLandscape}
      />
    ));
  };
  
  return (
    <View style={styles.container}>
      {/* 背景图 */}
      <Image
        source={getImageSource(currentScene?.backgroundImage)}
        style={styles.backgroundImage}
        resizeMode="cover"
      />
      
      {/* 返回按钮和标题栏 - 可隐藏 */}
      {!hideHeader && (
        <SafeAreaView style={[
          styles.header, 
          isLandscape && { paddingTop: Platform.OS === 'ios' ? 10 : 8 }
        ]}>
          <TouchableOpacity 
            style={styles.backButtonMain} 
            onPress={handleBackPress}
          >
            <Ionicons name="arrow-back" size={20} color="#F5EFE0" />
          </TouchableOpacity>
          <Text style={styles.title} numberOfLines={1}>{story?.title || '故事体验'}</Text>
        </SafeAreaView>
      )}
      
      {/* 主要对话框 */}
      {!showInteractionPoints && !specialDialog && renderDialog()}
      
      {/* 特殊对话框：选择题 */}
      {specialDialog && specialDialog.type === 'choice' && specialDialog.dialog.choices && (
        <DialogChoice
          question={specialDialog.dialog.text}
          character={specialDialog.dialog.character}
          choices={specialDialog.dialog.choices}
          onComplete={handleSpecialDialogComplete}
        />
      )}
      
      {/* 特殊对话框：问答题 */}
      {specialDialog && specialDialog.type === 'quiz' && specialDialog.dialog.quiz && (
        <QuizDialog
          question={specialDialog.dialog.text}
          character={specialDialog.dialog.character}
          options={specialDialog.dialog.quiz.options}
          explanation={specialDialog.dialog.quiz.explanation}
          onComplete={handleSpecialDialogComplete}
        />
      )}
      
      {/* 交互点 */}
      {showInteractionPoints && !specialDialog && renderInteractionPoints()}
      
      {/* 显示/隐藏导航栏按钮 */}
      <TouchableOpacity 
        style={[
          styles.toggleHeaderButton,
          hideHeader && { top: 10 } // 当导航栏隐藏时调整位置
        ]} 
        onPress={toggleHeader}
      >
        <Ionicons 
          name={hideHeader ? "chevron-down" : "chevron-up"} 
          size={20} 
          color="#F5EFE0" 
        />
      </TouchableOpacity>
      
      {/* 确保横屏模式下状态栏隐藏 */}
      <StatusBar style="light" hidden={true} />
    </View>
  );
};

// 调整样式以适应横屏模式
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000', // 默认背景颜色
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  backButtonMain: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  title: {
    color: '#F5EFE0',
    fontSize: 13,
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
    flex: 1, // 让标题占据中间空间
  },
  dialogContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    borderRadius: 12,
    padding: 0, 
    minHeight: 150, // 再减小最小高度
    maxHeight: '40%', 
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5, // 添加阴影效果
  },
  landscapeDialogContainer: {
    width: '50%', // 再减小宽度
    left: '25%',
    right: '25%',
    minHeight: 130, // 再减小最小高度
    bottom: Platform.OS === 'ios' ? 50 : 40,
  },
  blurBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)', // 增加不透明度
  },
  characterInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 6, // 减小内边距
    paddingLeft: 10,
    paddingRight: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.15)',
  },
  characterNameContainer: {
    marginLeft: 8,
  },
  characterName: {
    fontSize: 16, // 减小字体大小
    fontWeight: 'bold',
    color: '#FFD700',
  },
  characterEmotion: {
    fontSize: 12, // 减小字体大小
    color: '#CCCCCC',
    marginTop: 1, // 减小间距
  },
  dialogTextScrollView: {
    maxHeight: 100, // 减小文本区域高度
    padding: 12,
    paddingTop: 8,
  },
  dialogText: {
    fontSize: 15,
    color: '#FFFFFF',
    lineHeight: 22,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0.5, height: 0.5 },
    textShadowRadius: 1,
    letterSpacing: 0.3, // 增加字距
  },
  dialogTextContent: {
    paddingBottom: 5,
  },
  dialogNavButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 6, // 减小内边距
    paddingLeft: 10,
    paddingRight: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.15)',
    paddingBottom: Platform.OS === 'ios' ? 8 : 5,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8B4513',
    paddingVertical: 6, // 减小垂直内边距
    paddingHorizontal: 12, // 减小水平内边距
    borderRadius: 16, // 减小圆角
    alignSelf: 'flex-end',
  },
  prevButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3a5199',
    paddingVertical: 6, // 减小垂直内边距
    paddingHorizontal: 12, // 减小水平内边距
    borderRadius: 16, // 减小圆角
  },
  navButtonText: {
    color: '#FFFFFF',
    fontSize: 13, // 减小字体大小
    marginHorizontal: 3, // 减小间距
    fontWeight: '500',
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  errorContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  errorText: {
    fontSize: 18,
    color: '#F5EFE0',
    marginVertical: 20,
    textAlign: 'center',
  },
  backButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  avatarContainer: {
    // 这个容器用于头像的动画效果
  },
  toggleHeaderButton: {
    position: 'absolute',
    top: 40, // 位于导航栏下方
    right: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
  },
});

export default StoryExperienceScreen; 