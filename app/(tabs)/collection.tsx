import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Alert, 
  ActivityIndicator, 
  Image, 
  Modal,
  ScrollView,
  Dimensions,
  Animated,
  Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import * as ImageManipulator from 'expo-image-manipulator';
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { relicService } from '../../data/services';
import { Relic } from '../../data/types';
import LoadingIndicator from '../../components/ui/LoadingIndicator';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../constants/Colors';
import { LinearGradient } from 'expo-linear-gradient';
import { getImageSource } from '../../utils/imageUtils';

const { width, height } = Dimensions.get('window');

// 定义类型
interface RecognizedRelic extends Relic {
  capturedImageUri: string;
  confidence: number;
}

interface RecentRecognition {
  id: string;
  relicId: string;
  name: string;
  dynasty: string;
  recognizedAt: string;
  imageUri: string;
}

// AR识别文物页面
export default function ARRecognitionScreen() {
  const router = useRouter();
  const cameraRef = useRef<any>(null);
  const [cameraType, setCameraType] = useState<CameraType>('back');
  const [flashEnabled, setFlashEnabled] = useState(false);
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [recognizedRelic, setRecognizedRelic] = useState<RecognizedRelic | null>(null);
  const [showResultModal, setShowResultModal] = useState(false);
  const [recentRecognitions, setRecentRecognitions] = useState<RecentRecognition[]>([]);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showGuide, setShowGuide] = useState(true);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [relics, setRelics] = useState<Relic[]>([]);
  const [isLoadingRelics, setIsLoadingRelics] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [permission, requestPermission] = useCameraPermissions();
  const [mediaLibraryPermission, requestMediaLibraryPermission] = useState<boolean>(false);
  
  useEffect(() => {
    (async () => {
      // 请求相册权限
      const { status: mediaStatus } = await MediaLibrary.requestPermissionsAsync();
      requestMediaLibraryPermission(mediaStatus === 'granted');
      
      // 加载文物数据
      loadRelics();
    })();
    
    // 动画效果
    if (showGuide) {
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.delay(3000),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        })
      ]).start(() => setShowGuide(false));
    }
  }, []);
  
  const loadRelics = async () => {
    try {
      setIsLoadingRelics(true);
      setError(null);
      const relicsData = await relicService.getAllRelics();
      setRelics(relicsData);
    } catch (err) {
      console.error('加载文物数据失败:', err);
      setError('无法加载文物数据，请重试');
    } finally {
      setIsLoadingRelics(false);
    }
  };
  
  const takePicture = async () => {
    if (!cameraRef.current || relics.length === 0) return;
    
    try {
      setIsRecognizing(true);
      
      // 拍照
      const photo = await cameraRef.current.takePictureAsync();
      if (!photo) {
        setIsRecognizing(false);
        return Alert.alert("错误", "拍照失败，请重试");
      }
      
      // 处理图像
      const processedImage = await ImageManipulator.manipulateAsync(
        photo.uri,
        [{ resize: { width: 800 } }],
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
      );
      
      // 模拟识别延迟
      setTimeout(() => {
        // 不再随机选择，始终查找越王勾践剑 (ID '105')
        const recognizedItem = relics.find(r => r.id === '105');
        
        if (!recognizedItem) {
          console.error("错误：未能从加载的数据中找到 ID 为 '105' 的越王勾践剑！");
          setIsRecognizing(false);
          Alert.alert("错误", "无法找到目标文物数据。");
          return;
        }
        
        // 保存识别结果和图片URI
        setRecognizedRelic({
          ...recognizedItem,
          capturedImageUri: processedImage.uri,
          confidence: 0.99 // 可以设置一个固定的高置信度
        });
        
        // 添加到最近识别列表
        setRecentRecognitions((prev: RecentRecognition[]) => {
          const updated = [
            {
              id: Date.now().toString(),
              relicId: recognizedItem.id, // 这里是 '105'
              name: recognizedItem.name,
              dynasty: recognizedItem.dynasty,
              recognizedAt: new Date().toISOString().split('T')[0],
              imageUri: processedImage.uri
            },
            ...prev
          ];
          return updated.slice(0, 5);
        });
        
        setIsRecognizing(false);
        setShowResultModal(true);
        
        // 保存到相册
        if (mediaLibraryPermission) {
          MediaLibrary.saveToLibraryAsync(processedImage.uri).catch(err => 
            console.error("保存到相册失败:", err)
          );
        }
      }, 2000);
      
    } catch (error) {
      console.error("拍照或识别过程发生错误:", error);
      setIsRecognizing(false);
      Alert.alert("错误", "无法完成文物识别，请重试。");
    }
  };
  
  const handleRelicPress = (relicId: string) => {
    setShowResultModal(false);
    setShowHistoryModal(false);
    // 忽略传入的 relicId，始终跳转到越王勾践剑 (ID '105')
    const targetRelicId = '105';
    console.log(`Handling relic press, navigating to hardcoded ID: ${targetRelicId} (original ID was ${relicId})`);
    router.push(`/relic/${targetRelicId}` as any);
  };
  
  const toggleCameraType = () => {
    setCameraType(current => (current === 'back' ? 'front' : 'back'));
  };
  
  const toggleFlash = () => {
    setFlashEnabled(current => !current);
  };
  
  // 渲染识别结果模态框
  const renderResultModal = () => {
    if (!recognizedRelic) return null;
    
    return (
      <Modal
        visible={showResultModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowResultModal(false)}
      >
        <BlurView intensity={80} tint="dark" style={styles.modalContainer}>
          <View style={styles.resultContainer}>
            <View style={styles.resultHeader}>
              <Text style={styles.resultTitle}>文物识别结果</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setShowResultModal(false)}
              >
                <LinearGradient
                  colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.1)']} 
                  style={styles.closeButtonGradient}
                >
                  <Ionicons name="close" size={20} color={COLORS.primary} />
                </LinearGradient>
              </TouchableOpacity>
            </View>
            
            <ScrollView 
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.resultContent}
            >
              <View style={styles.comparisonContainerVertical}>
                <View style={styles.capturedImageContainer}>
                  <View style={styles.comparisonLabelContainer}>
                    <Ionicons name="camera-outline" size={16} color={COLORS.primary} />
                    <Text style={styles.comparisonLabel}>您的照片</Text>
                  </View>
                  <Image 
                    source={{ uri: recognizedRelic.capturedImageUri }}
                    style={styles.comparisonImage}
                    resizeMode="contain"
                  />
                </View>
                
                <View style={styles.capturedImageContainer}>
                  <View style={styles.comparisonLabelContainer}>
                    <Ionicons name="checkmark-circle-outline" size={16} color={COLORS.primary} />
                    <Text style={styles.comparisonLabel}>匹配文物</Text>
                  </View>
                  <Image 
                    source={getImageSource(recognizedRelic.image)}
                    style={styles.comparisonImage}
                    resizeMode="contain"
                  />
                </View>
              </View>
              
              <View style={styles.relicInfoCard}>
                <View style={styles.relicInfoHeader}>
                  <Text style={styles.relicName}>{recognizedRelic.name}</Text>
                  <View style={styles.relicBadge}>
                    <Text style={styles.relicBadgeText}>{recognizedRelic.dynasty}</Text>
                  </View>
                </View>
                
                <View style={styles.confidenceContainer}>
                  <Text style={styles.confidenceLabel}>
                    识别相似度
                  </Text>
                  <View style={styles.confidenceDetails}>
                    <View style={styles.confidenceBar}>
                      <View 
                        style={[
                          styles.confidenceFill, 
                          {width: `${recognizedRelic.confidence * 100}%`},
                          recognizedRelic.confidence > 0.8 ? styles.confidenceHighFill : styles.confidenceMediumFill
                        ]} 
                      />
                    </View>
                    <Text style={styles.confidenceText}>
                      {Math.round(recognizedRelic.confidence * 100)}%
                    </Text>
                  </View>
                </View>
                
                <View style={styles.descriptionContainer}>
                  <Text style={styles.descriptionLabel}>文物简介</Text>
                  <Text style={styles.relicDescription} numberOfLines={5} ellipsizeMode="tail">
                    {recognizedRelic.description || "暂无详细描述"}
                  </Text>
                </View>
                
                <TouchableOpacity 
                  style={styles.learnMoreButton}
                  onPress={() => handleRelicPress(recognizedRelic.id)}
                  activeOpacity={0.8} 
                >
                  <Text style={styles.learnMoreButtonText}>查看详细信息</Text>
                  <Ionicons name="arrow-forward" size={16} color={COLORS.white} />
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </BlurView>
      </Modal>
    );
  };
  
  // 没有获取到相机权限信息
  if (!permission) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={[styles.container, {backgroundColor: '#F5EFE0'}]}>
          <StatusBar style="dark" />
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#8B4513" />
            <Text style={styles.loadingText}>请求相机权限中...</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }
  
  // 没有相机权限
  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={[styles.container, {backgroundColor: '#F5EFE0'}]}>
          <StatusBar style="dark" />
          <View style={styles.loadingContainer}>
            <Image 
              source={{ uri: 'https://picsum.photos/id/250/300/300' }} 
              style={styles.permissionImage}
            />
            <Text style={styles.errorText}>需要相机权限才能识别文物</Text>
            <Text style={styles.permissionDescription}>
              我们需要使用您的相机来识别文物，帮助您探索中华文化的奥秘
            </Text>
            <TouchableOpacity 
              style={styles.permissionButton}
              onPress={requestPermission}
            >
              <Text style={styles.permissionButtonText}>授予权限</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.permissionButtonSecondary, { marginTop: 16 }]}
              onPress={() => router.replace('/')}
            >
              <Text style={styles.permissionButtonTextSecondary}>返回首页</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar style="light" />
      
      <View style={styles.cameraContainer}>
        <CameraView 
          ref={cameraRef}
          style={styles.camera}
          facing={cameraType}
          enableTorch={flashEnabled}
        >
          <View style={styles.cameraOverlayGradient}>
            <View style={styles.header}>
              <Text style={styles.headerTitle}>文物识别</Text>
            </View>
            
            <View style={styles.cameraControls}>
              <TouchableOpacity 
                style={styles.controlButton}
                onPress={toggleCameraType}
                disabled={isRecognizing}
              >
                <Ionicons name="camera-reverse" size={24} color="#FFF" />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.controlButton}
                onPress={toggleFlash}
                disabled={isRecognizing}
              >
                <Ionicons 
                  name={flashEnabled ? "flash" : "flash-off"} 
                  size={24} 
                  color="#FFF" 
                />
              </TouchableOpacity>
            </View>
            
            <View style={styles.recognitionFrameContainer}>
              <View style={styles.recognitionFrameGuide} />
            
              {isRecognizing && (
                <BlurView intensity={80} style={styles.recognizingOverlay}>
                  <ActivityIndicator size="large" color="#FFF" />
                  <Text style={styles.recognizingText}>正在识别文物...</Text>
                </BlurView>
              )}
              
              {showGuide && (
                <Animated.View style={[styles.guideOverlay, {opacity: fadeAnim}]}>
                  <Text style={styles.guideText}>
                    将文物放在框内，点击拍照按钮识别
                  </Text>
                </Animated.View>
              )}
            </View>
            
            <View style={styles.captureButtonContainer}>
              <TouchableOpacity 
                style={[
                  styles.captureButton, 
                  isRecognizing && styles.captureButtonDisabled
                ]}
                onPress={takePicture}
                disabled={isRecognizing}
              >
                <View style={styles.captureButtonInner} />
              </TouchableOpacity>
            </View>
          </View>
        </CameraView>
      </View>
      
      {/* 历史识别按钮 - 移动到屏幕右下角 */}
      {recentRecognitions.length > 0 && (
        <TouchableOpacity 
          style={styles.historyFloatingButton}
          onPress={() => setShowHistoryModal(true)}
        >
          <LinearGradient
            colors={['rgba(139,69,19,0.9)', 'rgba(139,69,19,0.7)']}
            style={styles.historyFloatingButtonContent}
          >
            <Ionicons name="time-outline" size={22} color="#FFF" />
            <View style={styles.historyFloatingBadge}>
              <Text style={styles.historyFloatingBadgeText}>{recentRecognitions.length}</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      )}
      
      {/* 历史识别模态窗口 */}
      <Modal
        visible={showHistoryModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowHistoryModal(false)}
      >
        <View style={styles.modalContainer}>
          <BlurView intensity={90} style={styles.blurModalBackground} tint="dark">
            <View style={[styles.modalContent, {backgroundColor: '#F5EFE0'}]}>
              <View style={styles.modalHeaderBar} />
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>识别历史</Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setShowHistoryModal(false)}
                >
                  <LinearGradient
                    colors={['rgba(230,220,210,0.9)', 'rgba(210,200,180,0.9)']}
                    style={styles.closeButtonGradient}
                  >
                    <Ionicons name="close" size={24} color="#8B4513" />
                  </LinearGradient>
                </TouchableOpacity>
              </View>
              
              <ScrollView 
                style={styles.historyList}
                contentContainerStyle={styles.historyListContent}
                showsVerticalScrollIndicator={false}
              >
                {recentRecognitions.map((item) => (
                  <TouchableOpacity 
                    key={item.id}
                    style={styles.historyItem}
                    onPress={() => handleRelicPress(item.relicId)}
                    activeOpacity={0.8}
                  >
                    <Image 
                      source={{ uri: item.imageUri }} 
                      style={styles.historyItemImage} 
                    />
                    <LinearGradient
                      colors={['transparent', 'rgba(0,0,0,0.7)', 'rgba(0,0,0,0.8)']}
                      style={styles.historyItemGradient}
                    >
                      <View style={styles.historyItemInfo}>
                        <Text style={styles.historyItemName}>{item.name}</Text>
                        <View style={styles.historyItemDetails}>
                          <View style={styles.historyItemDynastyContainer}>
                            <Ionicons name="time-outline" size={14} color="#F5EFE0" />
                            <Text style={styles.historyItemDynasty}>{item.dynasty}</Text>
                          </View>
                          <View style={styles.historyItemDateContainer}>
                            <Ionicons name="calendar-outline" size={14} color="#E8D9C0" />
                            <Text style={styles.historyItemDate}>{item.recognizedAt}</Text>
                          </View>
                        </View>
                      </View>
                    </LinearGradient>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              
              {recentRecognitions.length > 0 && (
                <TouchableOpacity
                  style={styles.clearHistoryButton}
                  onPress={() => {
                    Alert.alert(
                      "清空历史记录",
                      "确定要清空所有历史识别记录吗？",
                      [
                        {
                          text: "取消",
                          style: "cancel"
                        },
                        { 
                          text: "确定", 
                          onPress: () => {
                            setRecentRecognitions([]);
                            setShowHistoryModal(false);
                          } 
                        }
                      ]
                    );
                  }}
                >
                  <Text style={styles.clearHistoryButtonText}>清空历史记录</Text>
                </TouchableOpacity>
              )}
            </View>
          </BlurView>
        </View>
      </Modal>
      
      {/* 识别结果弹窗 */}
      {renderResultModal()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000',
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    position: 'relative',
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#8B4513',
  },
  permissionImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: 24,
  },
  permissionDescription: {
    fontSize: 14,
    color: '#8D6E63',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 20,
    paddingHorizontal: 30,
  },
  errorText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#8B4513',
    marginBottom: 16,
    textAlign: 'center',
  },
  permissionButton: {
    backgroundColor: '#8B4513',
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 30,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  permissionButtonText: {
    fontSize: 16,
    color: '#FFF',
    fontWeight: 'bold',
  },
  permissionButtonSecondary: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#8B4513',
  },
  permissionButtonTextSecondary: {
    fontSize: 14,
    color: '#8B4513',
    fontWeight: '500',
  },
  cameraContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  cameraOverlayGradient: {
    flex: 1,
    justifyContent: 'space-between',
    backgroundColor: 'transparent',
    paddingTop: 40,
    paddingBottom: 40,
  },
  cameraControls: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    position: 'absolute',
    top: 70,
    right: 20,
    zIndex: 20,
  },
  controlButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  recognitionFrameContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recognitionFrameGuide: {
    width: width * 0.7,
    height: width * 0.7,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 20,
    backgroundColor: 'transparent',
  },
  recognizingOverlay: {
    position: 'absolute',
    width: width * 0.7,
    height: width * 0.7,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  recognizingText: {
    color: '#FFF',
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
    fontWeight: '500',
  },
  guideOverlay: {
    position: 'absolute',
    bottom: -50,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  guideText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 15,
    overflow: 'hidden',
  },
  captureButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    position: 'relative',
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  captureButtonDisabled: {
    opacity: 0.5,
  },
  captureButtonInner: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#FFF',
  },
  historyFloatingButton: {
    position: 'absolute',
    right: 20,
    bottom: 90,
    borderRadius: 28,
    overflow: 'hidden',
    zIndex: 1000,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  historyFloatingButtonContent: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  historyFloatingBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#FFF',
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#8B4513',
  },
  historyFloatingBadgeText: {
    color: '#8B4513',
    fontSize: 10,
    fontWeight: 'bold',
  },
  blurModalBackground: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContainer: { 
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    // BlurView handles the background tint
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '80%',
    paddingTop: 16,
    overflow: 'hidden',
  },
  modalHeaderBar: {
    width: 40,
    height: 5,
    backgroundColor: '#D1C4A3',
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(139,69,19,0.1)',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#8B4513',
  },
  closeButton: {
    position: 'absolute',
    right: 20,
    top: 20,
    zIndex: 1,
  },
  closeButtonGradient: {
    width: 34, // Adjust size
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
    // Use a subtle gradient or solid color
    backgroundColor: 'rgba(0,0,0,0.08)', 
  },
  historyList: {
    flex: 1,
  },
  historyListContent: {
    padding: 16,
  },
  historyItem: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    height: 180,
  },
  historyItemImage: {
    width: '100%',
    height: '100%',
  },
  historyItemGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    height: '50%',
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderTopWidth: 50,
    borderTopColor: 'transparent',
  },
  historyItemInfo: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
  },
  historyItemName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  historyItemDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  historyItemDynastyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  historyItemDynasty: {
    fontSize: 14,
    color: '#F5EFE0',
    marginLeft: 4,
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  historyItemDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  historyItemDate: {
    fontSize: 12,
    color: '#E8D9C0',
    marginLeft: 4,
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  clearHistoryButton: {
    paddingVertical: 16,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(139,69,19,0.1)',
  },
  clearHistoryButtonText: {
    fontSize: 16,
    color: '#D32F2F',
    fontWeight: '500',
  },
  resultContainer: { 
    width: '90%',
    maxHeight: '85%', // Limit modal height
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.large, // More pronounced radius
    overflow: 'hidden',
    ...SHADOWS.large, // Use predefined large shadow
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.medium,
    paddingHorizontal: SPACING.large, // Ensure space for close button
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: 'rgba(245, 239, 224, 0.7)', // Slightly more opaque background
    position: 'relative',
  },
  resultTitle: {
    fontSize: 20, // Fixed font size
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  resultContent: {
    padding: SPACING.medium,
    paddingBottom: SPACING.large, // More bottom padding
  },
  comparisonContainerVertical: {
    marginBottom: SPACING.large, // Increased space below comparison section
  },
  capturedImageContainer: {
    marginBottom: SPACING.medium, // Space between the two images
    // alignItems: 'stretch', // Default behavior is fine
  },
  comparisonLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.small,
  },
  comparisonLabel: {
    marginLeft: SPACING.small,
    fontSize: 12, // Fixed font size (caption/small)
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  comparisonImage: {
    width: '100%', 
    height: height * 0.3,
    maxHeight: height * 0.35,
    borderRadius: RADIUS.medium,
    backgroundColor: COLORS.border,
    resizeMode: 'contain',
  },
  relicInfoCard: {
    backgroundColor: 'rgba(245, 239, 224, 0.4)', // More subtle background
    borderRadius: RADIUS.large,
    padding: SPACING.medium,
    // No margin bottom needed, ScrollView padding handles it
  },
  relicInfoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start', // Align top
    marginBottom: SPACING.medium,
  },
  relicName: {
    fontSize: 20, // Fixed font size (h3)
    fontWeight: 'bold',
    color: COLORS.text,
    flex: 1, 
    marginRight: SPACING.medium,
    lineHeight: 20 * 1.3, // Adjust line height based on fixed size
  },
  relicBadge: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.round, // Use round
    paddingHorizontal: SPACING.medium,
    paddingVertical: SPACING.small,
    marginTop: 4,
  },
  relicBadgeText: {
    color: COLORS.white,
    fontSize: 12, // Fixed font size (caption)
    fontWeight: '600',
  },
  confidenceContainer: {
    marginBottom: SPACING.medium,
  },
  confidenceLabel: {
    fontSize: 12, // Fixed font size (caption)
    color: COLORS.textSecondary,
    marginBottom: SPACING.small / 2,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  confidenceDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  confidenceBar: {
    flex: 1,
    height: 8, 
    backgroundColor: COLORS.border,
    borderRadius: RADIUS.round, // Use round
    overflow: 'hidden',
    marginRight: SPACING.medium,
  },
  confidenceFill: {
    height: '100%',
    borderRadius: RADIUS.round, // Use round
  },
  confidenceHighFill: { backgroundColor: COLORS.success },
  confidenceMediumFill: { backgroundColor: COLORS.warning },
  confidenceText: {
    fontSize: 14, // Fixed font size (body)
    fontWeight: 'bold',
    color: COLORS.primary,
    minWidth: 40,
    textAlign: 'right',
  },
  descriptionContainer: {
    marginBottom: SPACING.large,
  },
  descriptionLabel: {
    fontSize: 12, // Fixed font size (caption)
    color: COLORS.textSecondary,
    marginBottom: SPACING.small / 2,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  relicDescription: {
    fontSize: 14, // Fixed font size (body)
    color: COLORS.text,
    lineHeight: 14 * 1.6, // Adjust line height based on fixed size
  },
  learnMoreButton: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.large,
    paddingVertical: SPACING.medium,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.medium, // Use predefined medium shadow
    marginTop: SPACING.small, // Add small margin top
  },
  learnMoreButtonText: {
    color: COLORS.white,
    fontSize: 15, // Fixed font size (body2/medium)
    fontWeight: 'bold',
    marginRight: SPACING.small,
  },
}); 