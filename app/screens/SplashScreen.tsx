import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Platform } from 'react-native';
import { useRouter } from 'expo-router';

const SplashScreen = () => {
  const router = useRouter();
  const fadeAnim = new Animated.Value(0);
  
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: true
    }).start();
    
    setTimeout(() => {
      router.replace('/(tabs)');
    }, 3000);
  }, []);
  
  return (
    <View style={styles.container}>
      <Animated.View style={{ opacity: fadeAnim, alignItems: 'center' }}>
        <View style={styles.logoPlaceholder}>
          <Text style={styles.logoText}>文脉</Text>
        </View>
        <Text style={styles.title}>文脉</Text>
        <Text style={styles.subtitle}>探寻文物背后的故事</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5EFE0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoPlaceholder: {
    width: 150,
    height: 150,
    backgroundColor: '#8B4513',
    borderRadius: 75,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#F5EFE0',
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#8B4513',
    marginTop: 20,
    textAlign: 'center',
    ...Platform.select({
      ios: {
        textShadowColor: 'rgba(0, 0, 0, 0.1)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 1,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  subtitle: {
    fontSize: 18,
    color: '#A67D5D',
    marginTop: 10,
    textAlign: 'center',
  }
});

export default SplashScreen; 