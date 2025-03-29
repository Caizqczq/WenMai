import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { getImageSource } from '../../utils/imageUtils';

export interface StoryCardProps {
  id: string;
  title: string;
  cover: string;
  description: string;
  completionRate?: number;
  isNew?: boolean;
  supportsLandscape?: boolean;
}

const StoryCard: React.FC<StoryCardProps> = ({ 
  id, 
  title, 
  cover, 
  description, 
  completionRate = 0,
  isNew = false,
  supportsLandscape = false
}) => {
  return (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => router.push(`/story/${id}`)}
    >
      <Image 
        source={getImageSource(cover)} 
        style={styles.cover}
        resizeMode="cover"
      />
      
      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={1}>{title}</Text>
          <View style={styles.badges}>
            {isNew && (
              <View style={styles.newBadge}>
                <Text style={styles.newText}>新</Text>
              </View>
            )}
            {supportsLandscape && (
              <View style={styles.landscapeBadge}>
                <Ionicons name="phone-landscape" size={12} color="#FFF" />
              </View>
            )}
          </View>
        </View>
        
        <Text style={styles.description} numberOfLines={2}>
          {description}
        </Text>
        
        {completionRate > 0 && (
          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, { width: `${completionRate}%` }]} />
            <Text style={styles.progressText}>{completionRate}%</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  cover: {
    height: 150,
    width: '100%',
  },
  content: {
    padding: 12,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 8,
  },
  badges: {
    flexDirection: 'row',
  },
  newBadge: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    marginLeft: 4,
  },
  newText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  landscapeBadge: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    marginLeft: 4,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
    lineHeight: 20,
  },
  progressContainer: {
    height: 4,
    backgroundColor: '#EEEEEE',
    borderRadius: 2,
    overflow: 'hidden',
    marginTop: 8,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#4A90E2',
    borderRadius: 2,
  },
  progressText: {
    position: 'absolute',
    top: -18,
    right: 0,
    fontSize: 12,
    color: '#4A90E2',
  },
});

export default StoryCard; 