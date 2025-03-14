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

const { width, height } = Dimensions.get('window');

// 模拟文物数据库
const relicsDatabase = [
  { 
    id: '101', 
    name: '青铜器·后母戊鼎', 
    dynasty: '商代',
    description: '后母戊鼎是中国商代晚期青铜器，是迄今为止中国出土的最大的商代青铜器。1939年河南安阳出土，原为祭祀礼器，高133厘米，宽110厘米，重832.84千克。',
    imageUrl: 'https://picsum.photos/id/866/400/300', // 使用随机图片代替
    confidence: 0.92
  },
  { 
    id: '102', 
    name: '秦始皇兵马俑', 
    dynasty: '秦代',
    description: '秦始皇兵马俑是世界文化遗产，1974年在西安临潼区发现，是古代墓葬雕塑的一个类别。兵马俑坑是秦始皇陵的陪葬坑，面积约56,000平方米。',
    imageUrl: 'https://picsum.photos/id/338/400/300',
    confidence: 0.89
  },
  { 
    id: '103', 
    name: '莫高窟壁画', 
    dynasty: '魏晋至元代',
    description: '敦煌莫高窟始建于十六国的前秦时期，历经十六国、北朝、隋、唐、五代、西夏、元等历代的修建，形成巨大的规模，有洞窟735个，壁画4.5万平方米、泥质彩塑2415尊，是世界上现存规模最大、内容最丰富的佛教艺术地。',
    imageUrl: 'https://picsum.photos/id/43/400/300',
    confidence: 0.78
  },
  { 
    id: '104', 
    name: '越王勾践剑', 
    dynasty: '春秋晚期',
    description: '越王勾践剑，春秋晚期越国的青铜剑，1965年12月在湖北江陵望山1号墓出土，是国家一级文物。此剑长55.7厘米，剑身上部有两排共8个字的鸟篆铭文："越王鸠浅（勾践）自作用剑"。',
    imageUrl: 'https://picsum.photos/id/65/400/300',
    confidence: 0.85
  },
  { 
    id: '105', 
    name: '唐三彩', 
    dynasty: '唐代',
    description: '唐三彩是盛行于唐代的一种低温釉陶器，主要以黄、绿、白三种颜色为主，也有褐、蓝、黑、紫等色彩。三彩胎多为白色，质地较细腻，一般先用白色化妆土处理器表，再施釉彩绘。',
    imageUrl: 'https://picsum.photos/id/23/400/300',
    confidence: 0.81
  }
];

// 定义类型
interface RelicData {
  id: string;
  name: string;
  dynasty: string;
  description: string;
  imageUrl: string;
  confidence: number;
}

interface RecognizedRelic extends RelicData {
  capturedImageUri: string;
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
  
  const [permission, requestPermission] = useCameraPermissions();
  const [mediaLibraryPermission, requestMediaLibraryPermission] = useState<boolean>(false);
  
  useEffect(() => {
    (async () => {
      // 请求相册权限
      const { status: mediaStatus } = await MediaLibrary.requestPermissionsAsync();
      requestMediaLibraryPermission(mediaStatus === 'granted');
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
  
  const takePicture = async () => {
    if (!cameraRef.current) return;
    
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
        // 随机选择一个文物作为"识别结果"
        const recognizedItem = relicsDatabase[Math.floor(Math.random() * relicsDatabase.length)];
        
        // 保存识别结果和图片URI
        setRecognizedRelic({
          ...recognizedItem,
          capturedImageUri: processedImage.uri
        });
        
        // 添加到最近识别列表
        setRecentRecognitions((prev: RecentRecognition[]) => {
          const updated = [
            {
              id: Date.now().toString(),
              relicId: recognizedItem.id,
              name: recognizedItem.name,
              dynasty: recognizedItem.dynasty,
              recognizedAt: new Date().toISOString().split('T')[0],
              imageUri: processedImage.uri
            },
            ...prev
          ];
          // 只保留最近5个
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
    router.push(`/relic/${relicId}`);
  };
  
  const toggleCameraType = () => {
    setCameraType(current => (current === 'back' ? 'front' : 'back'));
  };
  
  const toggleFlash = () => {
    setFlashEnabled(current => !current);
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
              <View style={styles.recognitionCorner} />
              <View style={[styles.recognitionCorner, styles.recognitionCornerTopRight]} />
              <View style={[styles.recognitionCorner, styles.recognitionCornerBottomLeft]} />
              <View style={[styles.recognitionCorner, styles.recognitionCornerBottomRight]} />
            
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
      
      {/* 历史识别按钮 */}
      {recentRecognitions.length > 0 && (
        <TouchableOpacity 
          style={styles.historyButton}
          onPress={() => setShowHistoryModal(true)}
        >
          <BlurView intensity={70} style={styles.historyButtonBlur}>
            <Ionicons name="time-outline" size={20} color="#8B4513" />
            <Text style={styles.historyButtonText}>历史</Text>
            <View style={styles.historyBadge}>
              <Text style={styles.historyBadgeText}>{recentRecognitions.length}</Text>
            </View>
          </BlurView>
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
                  <Ionicons name="close" size={24} color="#8B4513" />
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
                    <View
                      style={styles.historyItemGradient}
                    >
                      <View style={styles.historyItemInfo}>
                        <Text style={styles.historyItemName}>{item.name}</Text>
                        <Text style={styles.historyItemDynasty}>{item.dynasty}</Text>
                        <View style={styles.historyItemDateContainer}>
                          <Ionicons name="calendar-outline" size={12} color="#E8D9C0" />
                          <Text style={styles.historyItemDate}>{item.recognizedAt}</Text>
                        </View>
                      </View>
                    </View>
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
      <Modal
        visible={showResultModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowResultModal(false)}
      >
        <View style={styles.modalContainer}>
          <BlurView intensity={90} style={styles.blurModalBackground} tint="dark">
            <View style={[styles.modalContent, {backgroundColor: '#F5EFE0'}]}>
              <View style={styles.modalHeaderBar} />
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>识别结果</Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setShowResultModal(false)}
                >
                  <Ionicons name="close" size={24} color="#8B4513" />
                </TouchableOpacity>
              </View>
              
              {recognizedRelic && (
                <ScrollView 
                  style={styles.resultContainer}
                  contentContainerStyle={styles.resultContainerContent}
                  showsVerticalScrollIndicator={false}
                >
                  <View style={styles.resultImageContainer}>
                    <Image 
                      source={{ uri: recognizedRelic.capturedImageUri }}
                      style={styles.capturedImage}
                    />
                  </View>
                  
                  <View style={styles.confidenceContainer}>
                    <View style={styles.confidenceHeaderRow}>
                      <MaterialCommunityIcons name="check-decagram" size={22} color="#8B4513" />
                      <Text style={styles.confidenceHeader}>
                        文物识别结果
                      </Text>
                    </View>
                    <Text style={styles.confidenceText}>
                      匹配度: {Math.round(recognizedRelic.confidence * 100)}%
                    </Text>
                    <View style={styles.confidenceBar}>
                      <View 
                        style={[
                          styles.confidenceFill, 
                          { width: `${recognizedRelic.confidence * 100}%` }
                        ]} 
                      />
                    </View>
                  </View>
                  
                  <View style={styles.relicCard}>
                    <Image 
                      source={{ uri: recognizedRelic.imageUrl }}
                      style={styles.relicImage}
                      resizeMode="cover"
                    />
                    <View style={styles.relicCardContent}>
                      <Text style={styles.relicName}>{recognizedRelic.name}</Text>
                      <View style={styles.dynastyContainer}>
                        <FontAwesome5 name="history" size={14} color="#8D6E63" />
                        <Text style={styles.relicDynasty}>{recognizedRelic.dynasty}</Text>
                      </View>
                      
                      <Text style={styles.relicDescription}>
                        {recognizedRelic.description}
                      </Text>
                    </View>
                  </View>
                  
                  <TouchableOpacity
                    style={styles.viewDetailButton}
                    onPress={() => handleRelicPress(recognizedRelic.id)}
                  >
                    <Text style={styles.viewDetailButtonText}>查看详细信息</Text>
                    <Ionicons name="arrow-forward" size={18} color="#FFF" />
                  </TouchableOpacity>
                </ScrollView>
              )}
            </View>
          </BlurView>
        </View>
      </Modal>
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
    padding: 16,
    backgroundColor: 'transparent',
    zIndex: 10,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
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
    overflow: 'hidden',
  },
  camera: {
    flex: 1,
  },
  cameraOverlayGradient: {
    flex: 1,
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderTopWidth: 40,
    borderBottomWidth: 40,
    borderColor: 'rgba(0,0,0,0.7)',
  },
  cameraControls: {
    position: 'absolute',
    top: 70,
    right: 20,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
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
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recognitionCorner: {
    position: 'absolute',
    top: height / 2 - width * 0.35,
    left: width / 2 - width * 0.35,
    width: 30,
    height: 30,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderColor: '#FFF',
    borderTopLeftRadius: 8,
  },
  recognitionCornerTopRight: {
    left: undefined,
    right: width / 2 - width * 0.35,
    borderLeftWidth: 0,
    borderRightWidth: 3,
    borderTopRightRadius: 8,
    borderTopLeftRadius: 0,
  },
  recognitionCornerBottomLeft: {
    top: undefined,
    bottom: height / 2 - width * 0.35,
    borderTopWidth: 0,
    borderBottomWidth: 3,
    borderBottomLeftRadius: 8,
    borderTopLeftRadius: 0,
  },
  recognitionCornerBottomRight: {
    top: undefined,
    left: undefined,
    right: width / 2 - width * 0.35,
    bottom: height / 2 - width * 0.35,
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderRightWidth: 3,
    borderBottomWidth: 3,
    borderBottomRightRadius: 8,
    borderTopLeftRadius: 0,
  },
  recognizingOverlay: {
    position: 'absolute',
    width: width * 0.7,
    height: width * 0.7,
    borderRadius: 16,
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
    width: width * 0.7,
    justifyContent: 'center',
    alignItems: 'center',
    top: width * 0.4,
  },
  guideText: {
    color: '#FFF',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    overflow: 'hidden',
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  captureButtonContainer: {
    alignItems: 'center',
    marginBottom: 50,
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
  historyButton: {
    position: 'absolute',
    left: 20,
    bottom: 45,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 30,
    overflow: 'hidden',
  },
  historyButtonBlur: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  historyButtonText: {
    fontSize: 14,
    color: '#8B4513',
    fontWeight: 'bold',
    marginLeft: 6,
  },
  historyBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#8B4513',
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFF',
  },
  historyBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  blurModalBackground: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'transparent',
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
    padding: 8,
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
  historyItemDynasty: {
    fontSize: 14,
    color: '#F5EFE0',
    marginBottom: 6,
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
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
    flex: 1,
  },
  resultContainerContent: {
    padding: 16,
    paddingBottom: 30,
  },
  resultImageContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    marginBottom: 16,
  },
  capturedImage: {
    width: '100%',
    height: 200,
    borderRadius: 16,
  },
  confidenceContainer: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  confidenceHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  confidenceHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#8B4513',
    marginLeft: 8,
  },
  confidenceText: {
    fontSize: 14,
    color: '#8D6E63',
    marginBottom: 8,
  },
  confidenceBar: {
    height: 8,
    backgroundColor: '#E8E0D5',
    borderRadius: 4,
    overflow: 'hidden',
  },
  confidenceFill: {
    height: '100%',
    backgroundColor: '#8B4513',
  },
  relicCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    marginBottom: 20,
  },
  relicImage: {
    width: '100%',
    height: 200,
  },
  relicCardContent: {
    padding: 16,
  },
  relicName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#5D4037',
    marginBottom: 8,
  },
  dynastyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  relicDynasty: {
    fontSize: 14,
    color: '#8D6E63',
    marginLeft: 6,
  },
  relicDescription: {
    fontSize: 14,
    lineHeight: 22,
    color: '#5D4037',
  },
  viewDetailButton: {
    backgroundColor: '#8B4513',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 30,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  viewDetailButtonText: {
    fontSize: 16,
    color: '#FFF',
    fontWeight: 'bold',
    marginRight: 8,
  },
}); 