import React, { useEffect } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import StoryExperienceScreen from '../screens/StoryExperienceScreen';
import { Text, View, TouchableOpacity, StyleSheet } from 'react-native';

export default function StoryExperience() {
  const params = useLocalSearchParams();
  const router = useRouter();
  
  useEffect(() => {
    // 调试打印参数
    console.log('故事路由页面接收到参数:', params);
    console.log('故事ID:', params.id, '类型:', typeof params.id);
  }, [params]);
  
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
}); 