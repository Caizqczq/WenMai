import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Animated, 
  ScrollView,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { QuizOption } from '../../data/types';

interface QuizDialogProps {
  question: string;
  character: string;
  options: QuizOption[];
  explanation: string;
  onComplete: () => void;
}

// 检查当前是否为横屏模式
const { width, height } = Dimensions.get('window');
const isLandscape = width > height;

const QuizDialog: React.FC<QuizDialogProps> = ({ 
  question, 
  character, 
  options, 
  explanation, 
  onComplete 
}) => {
  const [selectedOptions, setSelectedOptions] = useState<number[]>([]);
  const [showResult, setShowResult] = useState(false);
  const fadeAnim = new Animated.Value(1);

  const toggleOption = (index: number) => {
    if (showResult) return; // 已提交答案后不能修改

    setSelectedOptions(prev => {
      if (prev.includes(index)) {
        return prev.filter(i => i !== index);
      } else {
        return [...prev, index];
      }
    });
  };

  const handleSubmit = () => {
    if (selectedOptions.length === 0) return;
    
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

  // 计算得分和正确答案
  const calculateResults = () => {
    let correctCount = 0;
    let correctIndexes = [];
    
    for (let i = 0; i < options.length; i++) {
      if (options[i].isCorrect) {
        correctIndexes.push(i);
        if (selectedOptions.includes(i)) {
          correctCount++;
        }
      } else if (selectedOptions.includes(i)) {
        // 选择了错误答案
        correctCount--;
      }
    }
    
    const maxScore = correctIndexes.length;
    // 如果计分为负，则显示为0
    const finalScore = Math.max(0, correctCount);
    
    return {
      score: finalScore,
      maxScore,
      correctIndexes
    };
  };

  const results = calculateResults();

  return (
    <Animated.View style={[
      styles.container, 
      { opacity: fadeAnim },
      isLandscape && styles.landscapeContainer
    ]}>
      <View style={styles.dialogHeader}>
        <Text style={styles.characterName}>{character}</Text>
      </View>
      
      <ScrollView style={styles.scrollContent}>
        <Text style={styles.question}>{question}</Text>
        
        <View style={[
          styles.optionsContainer,
          isLandscape && styles.landscapeOptionsContainer
        ]}>
          {options.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.optionButton,
                selectedOptions.includes(index) && styles.selectedOption,
                showResult && option.isCorrect && styles.correctOption,
                showResult && selectedOptions.includes(index) && !option.isCorrect && styles.wrongOption,
                isLandscape && styles.landscapeOptionButton
              ]}
              onPress={() => toggleOption(index)}
            >
              <View style={styles.optionContent}>
                <Text style={styles.optionText}>{option.text}</Text>
                {showResult && (
                  <Ionicons 
                    name={option.isCorrect ? "checkmark-circle" : "close-circle"} 
                    size={20} 
                    color={option.isCorrect ? "#4CAF50" : "#F44336"} 
                    style={styles.optionIcon}
                  />
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>
        
        {!showResult ? (
          <TouchableOpacity 
            style={[
              styles.submitButton,
              selectedOptions.length === 0 && styles.disabledButton
            ]}
            onPress={handleSubmit}
            disabled={selectedOptions.length === 0}
          >
            <Text style={styles.submitButtonText}>提交答案</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.resultContainer}>
            <View style={styles.scoreContainer}>
              <Text style={styles.scoreText}>得分: {results.score}/{results.maxScore}</Text>
            </View>
            
            <View style={styles.explanationContainer}>
              <Text style={styles.explanationTitle}>解析:</Text>
              <Text style={styles.explanationText}>{explanation}</Text>
            </View>
            
            <TouchableOpacity 
              style={styles.continueButton}
              onPress={onComplete}
            >
              <Text style={styles.continueButtonText}>继续</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    maxHeight: '70%',
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    borderRadius: 12,
    padding: 16,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  // 横屏容器样式
  landscapeContainer: {
    left: '22.5%',
    right: '22.5%',
    width: '55%',
    maxHeight: '75%',
    padding: 12,
  },
  scrollContent: {
    maxHeight: '100%',
  },
  dialogHeader: {
    marginBottom: 12,
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
  optionsContainer: {
    marginTop: 10,
  },
  // 横屏选项容器
  landscapeOptionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  optionButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 14,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  // 横屏选项按钮
  landscapeOptionButton: {
    width: '48%',
    marginHorizontal: '1%',
  },
  selectedOption: {
    backgroundColor: 'rgba(144, 202, 249, 0.2)',
    borderColor: '#90CAF9',
  },
  correctOption: {
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    borderColor: '#4CAF50',
  },
  wrongOption: {
    backgroundColor: 'rgba(244, 67, 54, 0.2)',
    borderColor: '#F44336',
  },
  optionContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  optionText: {
    color: '#FFFFFF',
    fontSize: 16,
    flex: 1,
  },
  optionIcon: {
    marginLeft: 10,
  },
  submitButton: {
    backgroundColor: '#8B4513',
    alignItems: 'center',
    padding: 14,
    borderRadius: 8,
    marginTop: 16,
    marginBottom: 20,
  },
  disabledButton: {
    backgroundColor: 'rgba(139, 69, 19, 0.5)',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resultContainer: {
    marginTop: 20,
    marginBottom: 30,
  },
  scoreContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  scoreText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  explanationContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  explanationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  explanationText: {
    fontSize: 15,
    color: '#FFFFFF',
    lineHeight: 22,
  },
  continueButton: {
    backgroundColor: '#8B4513',
    alignItems: 'center',
    padding: 14,
    borderRadius: 8,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default QuizDialog; 