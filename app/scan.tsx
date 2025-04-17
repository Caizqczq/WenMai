import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Dimensions,
  SafeAreaView,
  ScrollView,
  Alert,
  Platform,
  StatusBar as RNStatusBar
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Stack, useRouter } from 'expo-router';
import { CameraView, useCameraPermissions, CameraType } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../constants/Colors';
import {getImageSource} from '../utils/imageUtils';

const { width, height } = Dimensions.get('window');

// 定义识别结果类型
interface RecognitionResult {
  id: string;
  name: string;
  confidence: number;
  dynasty: string;
  description: string;
  imageUrl: string;
}

// 模拟文物识别结果
const mockRecognitionResults: RecognitionResult[] = [
  {
    id: '101',
    name: '青铜器·后母戊鼎',
    confidence: 0.92,
    dynasty: '商代',
    description: '后母戊鼎是中国商代晚期青铜器，是迄今为止中国出土的最大的商代青铜器。',
    imageUrl: getImageSource("images/simuwuding.png"),
  },
  {
    id: '102',
    name: '秦始皇兵马俑',
    confidence: 0.87,
    dynasty: '秦代',
    description: '秦始皇兵马俑是世界文化遗产，1974年在西安临潼区发现，是古代墓葬雕塑的一个类别。',
    imageUrl: getImageSource("images/qinbingmayong.png"),
  },
  {
    id: '103',
    name: '莫高窟壁画',
    confidence: 0.78,
    dynasty: '魏晋至元代',
    description: '敦煌莫高窟始建于十六国的前秦时期，形成巨大的规模，有洞窟735个，壁画4.5万平方米。',
    imageUrl: getImageSource("images/matafeiyan.png"),
  }
];

export default function ScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>('back');
  const [enableTorch, setEnableTorch] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [recognitionResults, setRecognitionResults] = useState<RecognitionResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const router = useRouter();
  const cameraView = React.useRef<CameraView>(null);

  const takePicture = async () => {
    if (cameraView.current) {
      setIsProcessing(true);
      try {
        const photo = await cameraView.current.takePictureAsync();
        if (photo) {
          setCapturedImage(photo.uri);
          
          // 模拟识别过程
          setTimeout(() => {
            setRecognitionResults(mockRecognitionResults);
            setShowResults(true);
            setIsProcessing(false);
          }, 2000);
        } else {
          setIsProcessing(false);
          Alert.alert('错误', '拍照失败，请重试');
        }
      } catch (error) {
        console.log('Error taking picture:', error);
        setIsProcessing(false);
        Alert.alert('错误', '拍照时发生错误，请重试');
      }
    }
  };

  const pickImage = async () => {
    setIsProcessing(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        setCapturedImage(result.assets[0].uri);
        // 模拟识别过程
        setTimeout(() => {
          setRecognitionResults(mockRecognitionResults);
          setShowResults(true);
          setIsProcessing(false);
        }, 2000);
      } else {
        setIsProcessing(false);
      }
    } catch (error) {
      console.log('Error picking image:', error);
      setIsProcessing(false);
      Alert.alert('错误', '选择图片时发生错误，请重试');
    }
  };
  
  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };
  
  const toggleTorch = () => {
    setEnableTorch(current => !current);
  };
  
  const resetCamera = () => {
    setCapturedImage(null);
    setShowResults(false);
    setRecognitionResults([]);
  };
  
  const viewRelicDetail = (relicId: string) => {
    // 忽略传入的 relicId，始终跳转到越王勾践剑 (ID '105')
    const targetRelicId = '105';
    console.log(`Scan result clicked, navigating to hardcoded relic ID: ${targetRelicId} (original ID was ${relicId})`);
    router.push(`/relic/${targetRelicId}`);
  };
  
  if (!permission) {
    // 相机权限仍在加载
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <Text style={styles.permissionText}>请求相机权限中...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    // 相机权限未被授予
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <Text style={styles.permissionText}>无法访问相机，请允许相机权限</Text>
        <TouchableOpacity
          style={styles.permissionButton}
          onPress={requestPermission}
        >
          <Text style={styles.permissionButtonText}>授予权限</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.permissionButton, {marginTop: 10}]}
          onPress={pickImage}
        >
          <Text style={styles.permissionButtonText}>从相册选择</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar style="light" />
      
      {!capturedImage ? (
        <View style={styles.cameraContainer}>
          <CameraView
            style={styles.camera}
            facing={facing}
            enableTorch={enableTorch}
            ref={cameraView}
          >
            <View style={styles.headerContainer}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => router.back()}
              >
                <Ionicons name="arrow-back" size={24} color={COLORS.white} />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>文物扫描</Text>
              <TouchableOpacity
                style={styles.optionButton}
                onPress={pickImage}
              >
                <Ionicons name="images" size={24} color={COLORS.white} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.cameraControls}>
              <TouchableOpacity
                style={styles.controlButton}
                onPress={toggleTorch}
              >
                <Ionicons 
                  name={enableTorch ? "flash" : "flash-off"} 
                  size={24} 
                  color={COLORS.white} 
                />
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.controlButton}
                onPress={toggleCameraFacing}
              >
                <Ionicons name="camera-reverse-outline" size={24} color={COLORS.white} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.scanFrame}>
              <View style={styles.scanCorner1} />
              <View style={styles.scanCorner2} />
              <View style={styles.scanCorner3} />
              <View style={styles.scanCorner4} />
            </View>
            
            <View style={styles.bottomControls}>
              <Text style={styles.tipText}>将文物对准框内以识别</Text>
              <TouchableOpacity 
                style={styles.captureButton}
                onPress={takePicture}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <ActivityIndicator size="large" color={COLORS.white} />
                ) : (
                  <View style={styles.captureButtonInner} />
                )}
              </TouchableOpacity>
            </View>
          </CameraView>
        </View>
      ) : (
        <View style={styles.resultContainer}>
          <LinearGradient
            colors={['rgba(0,0,0,0.7)', 'transparent']}
            style={styles.resultHeader}
          >
            <TouchableOpacity
              style={styles.backButton}
              onPress={resetCamera}
            >
              <Ionicons name="arrow-back" size={24} color={COLORS.white} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>
              {isProcessing ? '分析中...' : '识别结果'}
            </Text>
            <View style={styles.placeholder} />
          </LinearGradient>
          
          {capturedImage && (
            <Image 
              source={{uri: capturedImage}} 
              style={styles.capturedImage} 
              resizeMode="cover"
            />
          )}
          
          {isProcessing && (
            <View style={styles.processingOverlay}>
              <BlurView intensity={80} style={styles.blurContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.processingText}>正在分析图像...</Text>
              </BlurView>
            </View>
          )}
          
          {showResults && (
            <ScrollView 
              style={styles.resultsScrollView}
              contentContainerStyle={styles.resultsContentContainer}
            >
              <Text style={styles.resultTitle}>
                识别到 {recognitionResults.length} 个可能的文物
              </Text>
              
              {recognitionResults.map((result) => (
                <TouchableOpacity
                  key={result.id}
                  style={styles.resultCard}
                  onPress={() => viewRelicDetail(result.id)}
                >
                  <Image 
                    source={{uri: result.imageUrl}}
                    style={styles.resultImage} 
                  />
                  <View style={styles.resultInfo}>
                    <Text style={styles.resultName}>{result.name}</Text>
                    <Text style={styles.resultDynasty}>{result.dynasty}</Text>
                    <Text style={styles.resultDescription} numberOfLines={2}>
                      {result.description}
                    </Text>
                    <View style={styles.resultConfidence}>
                      <Text style={styles.confidenceText}>
                        匹配度: {Math.round(result.confidence * 100)}%
                      </Text>
                      <View style={styles.confidenceBar}>
                        <View 
                          style={[
                            styles.confidenceFill,
                            {width: `${result.confidence * 100}%`}
                          ]} 
                        />
                      </View>
                    </View>
                  </View>
                  <Ionicons 
                    name="chevron-forward" 
                    size={20} 
                    color={COLORS.textSecondary}
                    style={{marginLeft: SPACING.small, alignSelf: 'center'}}
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.black,
  },
  permissionText: {
    color: COLORS.white,
    fontSize: FONTS.size.large,
    textAlign: 'center',
    marginTop: height * 0.4,
    paddingHorizontal: 30,
  },
  permissionButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: RADIUS.medium,
    marginTop: 20,
    alignSelf: 'center',
  },
  permissionButtonText: {
    color: COLORS.white,
    fontSize: FONTS.size.medium,
    fontWeight: '500',
  },
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'absolute',
    top: Platform.OS === 'android' ? RNStatusBar.currentHeight ?? 0 : 44,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingHorizontal: SPACING.medium,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: COLORS.white,
    fontSize: FONTS.size.large,
    fontWeight: '600',
  },
  optionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholder: {
    width: 40,
  },
  cameraControls: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: SPACING.medium,
    marginTop: Platform.OS === 'android' ? (RNStatusBar.currentHeight ?? 0) + 40 : 84,
  },
  controlButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: SPACING.small,
  },
  scanFrame: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: width * 0.7,
    height: width * 0.7,
    marginLeft: -(width * 0.7) / 2,
    marginTop: -(width * 0.7) / 2,
  },
  scanCorner1: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 30,
    height: 30,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderColor: COLORS.white,
  },
  scanCorner2: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 30,
    height: 30,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderColor: COLORS.white,
  },
  scanCorner3: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 30,
    height: 30,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderColor: COLORS.white,
  },
  scanCorner4: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 30,
    height: 30,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderColor: COLORS.white,
  },
  bottomControls: {
    position: 'absolute',
    bottom: SPACING.xxl * 2,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  tipText: {
    color: COLORS.white,
    fontSize: FONTS.size.small,
    marginBottom: SPACING.large,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: SPACING.medium,
    paddingVertical: SPACING.small / 2,
    borderRadius: RADIUS.medium,
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.white,
  },
  resultContainer: {
    flex: 1,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight ?? 0 : 44,
    paddingBottom: SPACING.medium,
    paddingHorizontal: SPACING.medium,
  },
  capturedImage: {
    width: '100%',
    height: height * 0.4,
  },
  processingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  blurContainer: {
    width: width * 0.7,
    paddingVertical: SPACING.large,
    paddingHorizontal: SPACING.large,
    borderRadius: RADIUS.medium,
    alignItems: 'center',
  },
  processingText: {
    color: COLORS.white,
    fontSize: FONTS.size.medium,
    marginTop: SPACING.medium,
    fontWeight: '500',
  },
  resultsScrollView: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  resultsContentContainer: {
    padding: SPACING.medium,
    paddingTop: SPACING.medium,
  },
  resultTitle: {
    fontSize: FONTS.size.large,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.medium,
  },
  resultCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.medium,
    marginBottom: SPACING.medium,
    padding: SPACING.medium,
    ...SHADOWS.medium,
  },
  resultImage: {
    width: 80,
    height: 80,
    borderRadius: RADIUS.small,
  },
  resultInfo: {
    flex: 1,
    marginLeft: SPACING.medium,
  },
  resultName: {
    fontSize: FONTS.size.medium,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  resultDynasty: {
    fontSize: FONTS.size.small,
    color: COLORS.primary,
    marginBottom: 4,
  },
  resultDescription: {
    fontSize: FONTS.size.small,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  resultConfidence: {
    width: '100%',
  },
  confidenceText: {
    fontSize: FONTS.size.small,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  confidenceBar: {
    height: 4,
    width: '100%',
    backgroundColor: '#E0E0E0',
    borderRadius: RADIUS.small,
  },
  confidenceFill: {
    height: '100%',
    backgroundColor: COLORS.success,
    borderRadius: RADIUS.small,
  },
  resultArrow: {
    alignSelf: 'center',
    marginLeft: SPACING.small,
  },
}); 