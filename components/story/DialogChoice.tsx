import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Animated, 
  Dimensions 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DialogChoice as DialogChoiceType } from '../../data/types';

interface DialogChoiceProps {
  question: string;
  character: string;
  choices: DialogChoiceType[];
  onComplete: () => void;
}

// 尺寸获取（考虑到可能是横屏模式）
const { width, height } = Dimensions.get('window');
const isLandscape = width > height;

const DialogChoice: React.FC<DialogChoiceProps> = ({ 
  question, 
  character, 
  choices, 
  onComplete 
}) => {
  const [selectedChoice, setSelectedChoice] = useState<DialogChoiceType | null>(null);
  const [showResult, setShowResult] = useState(false);
  const fadeAnim = new Animated.Value(1);

  const handleChoiceSelect = (choice: DialogChoiceType) => {
    setSelectedChoice(choice);
    setShowResult(true);
    
    // 动画效果
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0.7,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  return (
    <Animated.View style={[
      styles.container, 
      { opacity: fadeAnim },
      isLandscape && styles.landscapeContainer
    ]}>
      <View style={styles.dialogHeader}>
        <Text style={styles.characterName}>{character}</Text>
      </View>
      
      <Text style={styles.question}>{question}</Text>
      
      {!showResult ? (
        <View style={[
          styles.choicesContainer,
          isLandscape && styles.landscapeChoicesContainer
        ]}>
          {choices.map((choice, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.choiceButton,
                isLandscape && styles.landscapeChoiceButton
              ]}
              onPress={() => handleChoiceSelect(choice)}
            >
              <Text style={styles.choiceText}>{choice.text}</Text>
            </TouchableOpacity>
          ))}
        </View>
      ) : (
        <View style={styles.resultContainer}>
          <View style={[
            styles.resultBox,
            { backgroundColor: selectedChoice?.isCorrect ? '#2E7D32' : '#C62828' }
          ]}>
            <View style={styles.resultHeader}>
              <Ionicons 
                name={selectedChoice?.isCorrect ? "checkmark-circle" : "close-circle"} 
                size={24} 
                color="#fff" 
              />
              <Text style={styles.resultHeaderText}>
                {selectedChoice?.isCorrect ? '正确答案' : '错误答案'}
              </Text>
            </View>
            <Text style={styles.resultText}>{selectedChoice?.outcome}</Text>
          </View>
          
          <TouchableOpacity 
            style={styles.continueButton}
            onPress={onComplete}
          >
            <Text style={styles.continueButtonText}>继续</Text>
          </TouchableOpacity>
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    borderRadius: 12,
    padding: 16,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  // 横屏样式
  landscapeContainer: {
    left: '22.5%',
    right: '22.5%',
    width: '55%',
    maxHeight: '75%', // 限制最大高度，避免占满整个屏幕
    padding: 12, // 略微减少内边距
  },
  dialogHeader: {
    marginBottom: 8,
  },
  characterName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  question: {
    fontSize: 18,
    color: '#FFFFFF',
    marginBottom: 20,
    lineHeight: 24,
  },
  choicesContainer: {
    marginTop: 10,
  },
  // 横屏选项布局
  landscapeChoicesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  choiceButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 14,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  // 横屏选项按钮
  landscapeChoiceButton: {
    width: '48%',
    marginHorizontal: '1%',
  },
  choiceText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  resultContainer: {
    marginTop: 10,
  },
  resultBox: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  resultHeaderText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  resultText: {
    color: '#FFFFFF',
    fontSize: 15,
    lineHeight: 22,
  },
  continueButton: {
    backgroundColor: '#8B4513',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default DialogChoice; 