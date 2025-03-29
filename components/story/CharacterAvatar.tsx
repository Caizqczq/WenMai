import React from 'react';
import { View, Image, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// 角色头像映射
const characterAvatars: Record<string, any> = {
  '讲述者': { type: 'icon', name: 'book', color: '#4A90E2' },
  '越王勾践': { type: 'icon', name: 'crown', color: '#FFD700' },
  '文种': { type: 'icon', name: 'happy', color: '#8B4513' },
  '吴王夫差': { type: 'icon', name: 'flame', color: '#C62828' },
  '宝剑': { type: 'icon', name: 'flash', color: '#FFD700' },
  '士兵': { type: 'icon', name: 'shield', color: '#8B4513' },
  '考古学家': { type: 'icon', name: 'search', color: '#6B8E23' },
  '游客': { type: 'icon', name: 'person', color: '#20B2AA' },
  '历史学家': { type: 'icon', name: 'school', color: '#9c27b0' }
};

// 默认头像
const defaultAvatar = { type: 'icon', name: 'person-circle', color: '#888888' };

interface CharacterAvatarProps {
  character: string;
  size?: number;
  withBorder?: boolean;
  borderColor?: string;
  style?: any;
}

const CharacterAvatar: React.FC<CharacterAvatarProps> = ({
  character,
  size = 50,
  withBorder = true,
  borderColor = '#FFD700',
  style
}) => {
  // 获取对应角色的头像设置
  const avatar = characterAvatars[character] || defaultAvatar;
  
  const borderStyle = withBorder ? {
    borderWidth: 2,
    borderColor: borderColor,
  } : {};
  
  return (
    <View style={[
      styles.container, 
      { 
        width: size, 
        height: size, 
        borderRadius: size / 2,
        ...borderStyle
      },
      style
    ]}>
      <View style={[styles.iconContainer, { backgroundColor: avatar.color }]}>
        <Ionicons name={avatar.name} size={size * 0.6} color="#FFFFFF" />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#EFEFEF',
  },
  iconContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CharacterAvatar; 