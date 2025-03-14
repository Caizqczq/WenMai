import React, { useState, useEffect } from 'react';
import { 
  View, Text, TouchableOpacity, StyleSheet, 
  Dimensions, Animated 
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';

// 定义类型
interface Dialog {
  id: string;
  character: string;
  text: string;
  emotion?: string;
}

interface InteractionPoint {
  id: string;
  position: { x: number; y: number };
  type: 'item' | 'character' | 'scene';
  hintText: string;
  nextScene?: string;
  triggerDialog?: string;
}

interface Scene {
  id: string;
  backgroundColor: string;
  dialogs: Dialog[];
  interactionPoints: InteractionPoint[];
}

interface Story {
  id: string;
  relicId: string;
  title: string;
  scenes: Scene[];
}

interface StoriesData {
  [key: string]: Story;
}

// 模拟故事数据
const mockStories: StoriesData = {
  '101': {
    id: '101',
    relicId: '101',
    title: '鼎铸王朝',
    scenes: [
      {
        id: 'scene1',
        backgroundColor: '#8D6E63',
        dialogs: [
          { id: 'd1', character: '旁白', text: '公元前13世纪，商王朝鼎盛时期，王室贵族正在筹备一场重要的祭祀仪式...' },
          { id: 'd2', character: '铸造大师', text: '陛下，您要求的大型祭祀青铜鼎已经设计完成，请过目。' },
          { id: 'd3', character: '商王', text: '很好，这个鼎将用于祭祀我们的祖先，一定要铸造得庄重威严。' },
          { id: 'd4', character: '铸造大师', text: '请放心，我们将使用最好的青铜材料，采用最精湛的铸造技艺。' },
          { id: 'd5', character: '旁白', text: '点击画面中的亮点，探索更多内容...' },
        ],
        interactionPoints: [
          { 
            id: 'ip1', 
            position: { x: 100, y: 200 }, 
            type: 'item', 
            hintText: '青铜矿石',
            triggerDialog: 'mineral' 
          },
          { 
            id: 'ip2', 
            position: { x: 250, y: 150 }, 
            type: 'item', 
            hintText: '铸造模具',
            triggerDialog: 'mold' 
          },
          { 
            id: 'ip3', 
            position: { x: 180, y: 300 }, 
            type: 'scene', 
            hintText: '进入铸造车间',
            nextScene: 'scene2' 
          },
        ]
      },
      {
        id: 'scene2',
        backgroundColor: '#A1887F',
        dialogs: [
          { id: 'd6', character: '旁白', text: '铸造车间内，工匠们正在紧张地工作...' },
          { id: 'd7', character: '铸造大师', text: '所有人注意！熔炉温度已经达到要求，准备浇铸！' },
          { id: 'd8', character: '学徒', text: '师父，这么大的鼎，我们真的能铸造成功吗？' },
          { id: 'd9', character: '铸造大师', text: '我们掌握了祖先传下来的分段铸造技术，一定能成功。这将是商王朝最伟大的青铜器！' },
          { id: 'd10', character: '旁白', text: '点击画面中的亮点，探索更多内容...' },
        ],
        interactionPoints: [
          { 
            id: 'ip4', 
            position: { x: 120, y: 180 }, 
            type: 'item', 
            hintText: '熔炉',
            triggerDialog: 'furnace' 
          },
          { 
            id: 'ip5', 
            position: { x: 220, y: 250 }, 
            type: 'character', 
            hintText: '与学徒交谈',
            triggerDialog: 'apprentice' 
          },
          { 
            id: 'ip6', 
            position: { x: 50, y: 300 }, 
            type: 'scene', 
            hintText: '返回前一场景',
            nextScene: 'scene1' 
          },
        ]
      }
    ]
  },
  '501': {
    id: '501',
    relicId: '501',
    title: '三星堆的秘密',
    scenes: [
      {
        id: 'scene1',
        backgroundColor: '#5C6BC0',
        dialogs: [
          { id: 'd1', character: '旁白', text: '公元前12世纪，古蜀国，一场重要的祭祀仪式正在准备中...' },
          { id: 'd2', character: '祭司', text: '今天是祭祀天神的重要日子，我们需要准备最神圣的面具。' },
          { id: 'd3', character: '工匠', text: '大祭司，神圣的青铜面具已经铸造完成，请过目。' },
          { id: 'd4', character: '祭司', text: '很好，这个面具将帮助我们与天神沟通，一定要保证它的神圣性。' },
          { id: 'd5', character: '旁白', text: '点击画面中的亮点，探索更多内容...' },
        ],
        interactionPoints: [
          { 
            id: 'ip1', 
            position: { x: 120, y: 200 }, 
            type: 'item', 
            hintText: '青铜面具',
            triggerDialog: 'mask' 
          },
          { 
            id: 'ip2', 
            position: { x: 220, y: 150 }, 
            type: 'character', 
            hintText: '与祭司交谈',
            triggerDialog: 'priest' 
          },
          { 
            id: 'ip3', 
            position: { x: 180, y: 300 }, 
            type: 'scene', 
            hintText: '进入祭祀场地',
            nextScene: 'scene2' 
          },
        ]
      },
      {
        id: 'scene2',
        backgroundColor: '#3F51B5',
        dialogs: [
          { id: 'd6', character: '旁白', text: '祭祀场地上，人们聚集在一起，等待仪式的开始...' },
          { id: 'd7', character: '祭司', text: '戴上神圣的面具，我将代表我们与天神沟通！' },
          { id: 'd8', character: '民众', text: '愿天神保佑我们的国家繁荣昌盛！' },
          { id: 'd9', character: '祭司', text: '通过这个面具，我能看到神灵的世界，感受到他们的存在！' },
          { id: 'd10', character: '旁白', text: '点击画面中的亮点，探索更多内容...' },
        ],
        interactionPoints: [
          { 
            id: 'ip4', 
            position: { x: 150, y: 180 }, 
            type: 'item', 
            hintText: '祭坛',
            triggerDialog: 'altar' 
          },
          { 
            id: 'ip5', 
            position: { x: 250, y: 220 }, 
            type: 'character', 
            hintText: '观察人群',
            triggerDialog: 'crowd' 
          },
          { 
            id: 'ip6', 
            position: { x: 50, y: 300 }, 
            type: 'scene', 
            hintText: '返回前一场景',
            nextScene: 'scene1' 
          },
        ]
      }
    ]
  }
};

// 额外的对话数据
const extraDialogs: {[key: string]: Dialog} = {
  'mineral': { id: 'ex1', character: '铸造大师', text: '这是从远方运来的优质铜矿石，含铜量很高，还混合了锡和铅，铸造出的青铜器更加坚固耐用。' },
  'mold': { id: 'ex2', character: '铸造大师', text: '这是特制的陶范，我们采用分段铸造法，先铸造鼎的各个部分，再组合在一起。这样可以铸造出更大更复杂的器物。' },
  'furnace': { id: 'ex3', character: '铸造大师', text: '这座熔炉温度可以达到1100度以上，足以熔化铜锡合金。看那炽热的金属液体，宛如流动的太阳！' },
  'apprentice': { id: 'ex4', character: '学徒', text: '我从小就在师父门下学习铸造技艺，这次能参与铸造如此重要的礼器，是莫大的荣幸！我一定会专心致志，不辜负师父的期望。' },
  'mask': { id: 'ex5', character: '工匠', text: '这个面具采用失蜡法铸造，先用蜡制作模型，然后包裹陶土，烘干后蜡熔化流出，再灌入青铜液。冷却后打开陶范，就得到了精美的青铜面具。' },
  'priest': { id: 'ex6', character: '祭司', text: '我们相信，戴上这个神圣的面具后，祭司就能与神灵沟通。面具上夸张的眼睛和耳朵，象征着超越凡人的视觉和听觉能力。' },
  'altar': { id: 'ex7', character: '祭司', text: '这座祭坛是我们与天神沟通的神圣场所。祭坛中央的火堆将燃烧整夜，把我们的祈祷送到天神那里。' },
  'crowd': { id: 'ex8', character: '旁白', text: '人们穿着最好的衣服参加祭祀，他们相信这场仪式能带来丰收和平安。在古代社会，宗教祭祀是凝聚社会的重要方式。' },
};

const { width, height } = Dimensions.get('window');

const StoryExperienceScreen = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [story, setStory] = useState<Story | null>(null);
  const [currentScene, setCurrentScene] = useState<Scene | null>(null);
  const [dialogIndex, setDialogIndex] = useState(0);
  const [showDialog, setShowDialog] = useState(true);
  const [extraDialog, setExtraDialog] = useState<Dialog | null>(null);
  const fadeAnim = new Animated.Value(1);
  
  useEffect(() => {
    // 在实际应用中，这里应该从API获取数据
    if (id && typeof id === 'string' && mockStories[id]) {
      const storyData = mockStories[id];
      setStory(storyData);
      setCurrentScene(storyData.scenes[0]);
    }
  }, [id]);
  
  const handleNextDialog = () => {
    if (!currentScene) return;
    
    if (extraDialog) {
      setExtraDialog(null);
      return;
    }
    
    if (dialogIndex < currentScene.dialogs.length - 1) {
      setDialogIndex(dialogIndex + 1);
    } else {
      setShowDialog(false);
    }
  };
  
  const handleInteractionPoint = (pointId: string) => {
    if (!currentScene) return;
    
    const point = currentScene.interactionPoints.find(p => p.id === pointId);
    if (!point) return;
    
    if (point.nextScene && story) {
      const nextScene = story.scenes.find(s => s.id === point.nextScene);
      if (nextScene) {
        // 场景切换动画
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true
        }).start(() => {
          setCurrentScene(nextScene);
          setDialogIndex(0);
          setShowDialog(true);
          
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true
          }).start();
        });
      }
    } else if (point.triggerDialog) {
      const dialog = extraDialogs[point.triggerDialog];
      if (dialog) {
        setExtraDialog(dialog);
      }
    }
  };
  
  if (!story || !currentScene) {
    return (
      <View style={styles.loading}>
        <Text>加载中...</Text>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <Animated.View style={[styles.sceneContainer, { opacity: fadeAnim }]}>
        <View 
          style={[styles.sceneBackground, { backgroundColor: currentScene.backgroundColor }]}
        >
          {/* 交互点 */}
          {!showDialog && !extraDialog && currentScene.interactionPoints.map((point) => (
            <TouchableOpacity
              key={point.id}
              style={[styles.interactionPoint, { left: point.position.x, top: point.position.y }]}
              onPress={() => handleInteractionPoint(point.id)}
            >
              <View style={styles.interactionDot} />
              <Text style={styles.interactionHint}>{point.hintText}</Text>
            </TouchableOpacity>
          ))}
          
          {/* 对话框 */}
          {(showDialog || extraDialog) && (
            <TouchableOpacity 
              style={styles.dialogBox}
              onPress={handleNextDialog}
              activeOpacity={0.9}
            >
              <Text style={styles.characterName}>
                {extraDialog ? extraDialog.character : currentScene.dialogs[dialogIndex].character}
              </Text>
              <Text style={styles.dialogText}>
                {extraDialog ? extraDialog.text : currentScene.dialogs[dialogIndex].text}
              </Text>
              <Text style={styles.tapHint}>点击继续</Text>
            </TouchableOpacity>
          )}
          
          {/* 返回按钮 */}
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>退出</Text>
          </TouchableOpacity>
          
          {/* 进度条 */}
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${(dialogIndex + 1) / currentScene.dialogs.length * 100}%` }
              ]} 
            />
          </View>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  sceneContainer: {
    flex: 1,
  },
  sceneBackground: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  interactionPoint: {
    position: 'absolute',
    alignItems: 'center',
  },
  interactionDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderWidth: 2,
    borderColor: '#8B4513',
  },
  interactionHint: {
    color: '#FFF',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  dialogBox: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 10,
    padding: 15,
    borderWidth: 1,
    borderColor: '#8B4513',
  },
  characterName: {
    color: '#F5EFE0',
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 8,
  },
  dialogText: {
    color: '#FFF',
    fontSize: 16,
    lineHeight: 24,
  },
  tapHint: {
    color: '#A67D5D',
    fontSize: 12,
    textAlign: 'right',
    marginTop: 10,
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  backButtonText: {
    color: '#FFF',
    fontSize: 14,
  },
  progressBar: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#8B4513',
    borderRadius: 2,
  },
});

export default StoryExperienceScreen; 