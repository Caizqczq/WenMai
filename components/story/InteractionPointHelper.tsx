import React from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet,
  Dimensions 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { InteractionPoint } from '../../data/types';

interface InteractionPointHelperProps {
  point: InteractionPoint;
  onPress: (point: InteractionPoint) => void;
  isLandscape: boolean;
}

// 获取屏幕尺寸
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const InteractionPointHelper: React.FC<InteractionPointHelperProps> = ({ 
  point, 
  onPress,
  isLandscape
}) => {
  // 根据横竖屏模式转换坐标
  const adjustPosition = () => {
    if (isLandscape) {
      // 横屏模式下坐标适配
      // 这里假设原始坐标是为竖屏设计的，基于某个基准屏幕大小
      const baseScreenWidth = 375;
      const baseScreenHeight = 667;
      
      // 获取当前设备在横屏模式下的尺寸
      const currentWidth = Math.max(screenWidth, screenHeight);
      const currentHeight = Math.min(screenWidth, screenHeight);
      
      // 计算缩放比例
      const widthRatio = currentWidth / baseScreenHeight; // 横屏时宽对应竖屏的高
      const heightRatio = currentHeight / baseScreenWidth; // 横屏时高对应竖屏的宽
      
      // 计算新坐标 - 横屏模式下需要交换x和y
      // 注意：横屏时原点在左上角，x轴向右，y轴向下
      const landscapeX = point.position.y * widthRatio;
      const landscapeY = point.position.x * heightRatio;
      
      console.log(`原始坐标: (${point.position.x}, ${point.position.y})`);
      console.log(`转换后坐标: (${landscapeX}, ${landscapeY})`);
      
      // 横屏时对y坐标做一些额外调整，让点在更合适的位置
      return {
        x: landscapeX,
        y: landscapeY
      };
    }
    
    // 竖屏模式下保持原始坐标
    return point.position;
  };
  
  const position = adjustPosition();
  
  // 获取图标类型
  const getIconName = () => {
    switch (point.type) {
      case 'item':
        return 'search-circle';
      case 'character':
        return 'person-circle';
      default:
        return 'arrow-forward-circle';
    }
  };
  
  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          left: position.x,
          top: position.y,
        }
      ]}
      onPress={() => onPress(point)}
    >
      <View style={styles.pointCircle}>
        <Ionicons 
          name={getIconName()} 
          size={32} 
          color="#FFF" 
        />
      </View>
      <View style={[
        styles.hintContainer,
        isLandscape && styles.landscapeHintContainer
      ]}>
        <Text style={styles.hintText}>{point.hintText}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    zIndex: 100,
  },
  pointCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(139, 69, 19, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  hintContainer: {
    position: 'absolute',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 8,
    borderRadius: 8,
    width: 120,
    top: -40,
    left: -35,
  },
  landscapeHintContainer: {
    width: 150,
    left: -50,
  },
  hintText: {
    color: '#FFFFFF',
    fontSize: 12,
    textAlign: 'center',
  },
});

export default InteractionPointHelper; 