import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ActivityIndicator, Platform, Dimensions, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { WebView } from 'react-native-webview';
import Constants from 'expo-constants';

// 文物地区数据
interface Region {
  id: string;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  zoom: number;
}

interface RelicSite {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  regionId: string;
  type: 'museum' | 'relic'; // 类型：博物馆或文物遗址
  description?: string; // 简短描述
}

// 从expo配置中获取百度地图API密钥
const BAIDU_MAP_AK = Constants.expoConfig?.extra?.baiduMapAK || '';

const regions: Region[] = [
  { 
    id: '1', 
    name: '华北', 
    description: '包含北京、天津等地区的文化遗产', 
    latitude: 39.9042, 
    longitude: 116.4074, // 北京坐标
    zoom: 7
  },
  { 
    id: '2', 
    name: '华东', 
    description: '包含上海、江苏、浙江等地区的文化遗产', 
    latitude: 31.2304, 
    longitude: 121.4737, // 上海坐标
    zoom: 7
  },
  { 
    id: '3', 
    name: '华南', 
    description: '包含广东、广西等地区的文化遗产', 
    latitude: 23.1291, 
    longitude: 113.2644, // 广州坐标
    zoom: 7
  },
  { 
    id: '4', 
    name: '西北', 
    description: '包含陕西、甘肃等地区的文化遗产', 
    latitude: 34.3416, 
    longitude: 108.9398, // 西安坐标
    zoom: 7
  },
  { 
    id: '5', 
    name: '西南', 
    description: '包含四川、云南等地区的文化遗产', 
    latitude: 30.5723, 
    longitude: 104.0665, // 成都坐标
    zoom: 7
  },
];

// 著名文物坐标
const relicSites: RelicSite[] = [
  { 
    id: '101', 
    name: '故宫博物院', 
    latitude: 39.9163, 
    longitude: 116.3972, 
    regionId: '1',
    type: 'museum',
    description: '中国明清两代的皇家宫殿，世界上现存规模最大、保存最为完整的木质结构古建筑之一' 
  },
  { 
    id: '102', 
    name: '秦始皇兵马俑', 
    latitude: 34.3841, 
    longitude: 109.2785, 
    regionId: '4',
    type: 'relic',
    description: '世界上规模最大的古代军事博物馆，被誉为"世界第八大奇迹"'
  },
  { 
    id: '103', 
    name: '莫高窟', 
    latitude: 40.0359, 
    longitude: 94.8096, 
    regionId: '4',
    type: 'relic',
    description: '世界上现存规模最大、内容最丰富的佛教艺术圣地'
  },
  { 
    id: '104', 
    name: '三星堆博物馆', 
    latitude: 31.1350, 
    longitude: 104.3998, 
    regionId: '5',
    type: 'museum',
    description: '展示古蜀文明的国家重点博物馆，被誉为"长江文明的摇篮"'
  },
  { 
    id: '105', 
    name: '苏州博物馆', 
    latitude: 31.3213, 
    longitude: 120.6288, 
    regionId: '2',
    type: 'museum',
    description: '由贝聿铭设计的新馆与拙政园毗邻，展示吴文化艺术珍品'
  },
  { 
    id: '106', 
    name: '陕西历史博物馆', 
    latitude: 34.2377, 
    longitude: 108.9376, 
    regionId: '4',
    type: 'museum',
    description: '中国第一座大型现代化国家级历史博物馆，"古都明珠，华夏宝库"'
  },
  { 
    id: '107', 
    name: '湖南省博物馆', 
    latitude: 28.1926, 
    longitude: 112.9850, 
    regionId: '3',
    type: 'museum',
    description: '收藏马王堆汉墓出土文物的综合性地志博物馆'
  },
  { 
    id: '108', 
    name: '甘肃省博物馆', 
    latitude: 36.0617, 
    longitude: 103.8360, 
    regionId: '4',
    type: 'museum',
    description: '收藏甘肃地区丰富的历史文化遗产，包括丝绸之路文物、彩陶和铜奔马等珍贵文物'
  },
];

const MapScreen = () => {
  const router = useRouter();
  const webViewRef = useRef<WebView>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mapError, setMapError] = useState<string | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);
  const [selectedRelicSite, setSelectedRelicSite] = useState<RelicSite | null>(null);
  const [mapCenter, setMapCenter] = useState({
    latitude: 35.8617, 
    longitude: 104.1954, // 中国大致中心点
    zoom: 4
  });
  const [mapReady, setMapReady] = useState(false);

  // 生成加载文件的HTML
  const generateMapHTML = () => {
    // 检查是否有百度地图API密钥
    if (!BAIDU_MAP_AK) {
      setTimeout(() => {
        setMapError('百度地图API密钥未配置，请在app.json中配置baiduMapAK');
      }, 500);
      return `
      <!DOCTYPE html>
      <html><body><h2>地图加载错误</h2><p>百度地图API密钥未配置</p></body></html>
      `;
    }

    // 筛选当前区域的文物点
    const filteredSites = selectedRegion 
      ? relicSites.filter(site => site.regionId === selectedRegion.id)
      : relicSites;
    
    // 生成标记点的JS代码
    const markersCode = filteredSites.map(site => `
      try {
        // 最简单的方式创建标记
        var point${site.id} = new BMap.Point(${site.longitude}, ${site.latitude});
        var marker${site.id} = new BMap.Marker(point${site.id});
        map.addOverlay(marker${site.id});
        
        // 直接简单的信息窗口，使用内联的onclick处理
        var infoContent${site.id} = \`
          <div style="padding:15px;border-radius:8px;background:#fff;color:#333;width:250px;">
            <div style="font-weight:bold;font-size:16px;margin-bottom:8px;border-bottom:1px solid #eee;padding-bottom:8px;">
              ${site.name}
            </div>
            <p style="margin:8px 0;font-size:13px;line-height:1.4;">${site.description || ''}</p>
            <a href="javascript:void(0);" onclick="handleDetailClick('${site.id}')" 
               style="display:block;background:${site.type === 'museum' ? '#8B4513' : '#1565C0'};color:white;text-align:center;
                      padding:6px 12px;border-radius:4px;margin-top:8px;text-decoration:none;">
              查看详情
            </a>
          </div>
        \`;
        
        var infoWindow${site.id} = new BMap.InfoWindow(infoContent${site.id}, {
          width: 280,
          height: 150,
          enableMessage: false
        });
        
        // 点击标记事件 - 使用最简单的方式
        marker${site.id}.addEventListener("click", function() {
          map.openInfoWindow(infoWindow${site.id}, point${site.id});
        });
      } catch (error) {
        console.error('添加标记${site.id}失败: ' + error.message);
      }
    `).join('\n');
    
    // 生成区域标记的JS代码
    const regionsCode = regions.map(region => `
      try {
        // 创建区域标记 - 最简单的方式
        var regionPoint${region.id} = new BMap.Point(${region.longitude}, ${region.latitude});
        var regionMarker${region.id} = new BMap.Marker(regionPoint${region.id});
        map.addOverlay(regionMarker${region.id});
        
        // 直接简单的区域信息窗口
        var regionInfoContent${region.id} = \`
          <div style="padding:15px;border-radius:8px;background:#fff;color:#333;width:250px;">
            <div style="font-weight:bold;font-size:16px;margin-bottom:8px;border-bottom:1px solid #eee;padding-bottom:8px;">
              ${region.name}地区
            </div>
            <p style="margin:8px 0;font-size:13px;line-height:1.4;">${region.description}</p>
            <a href="javascript:void(0);" onclick="handleRegionClick('${region.id}')" 
               style="display:block;background:#FF8C00;color:white;text-align:center;
                      padding:6px 12px;border-radius:4px;margin-top:8px;text-decoration:none;">
              浏览此区域
            </a>
          </div>
        \`;
        
        var regionInfoWindow${region.id} = new BMap.InfoWindow(regionInfoContent${region.id}, {
          width: 280,
          height: 150,
          enableMessage: false
        });
        
        // 点击区域标记事件 - 最简单的方式
        regionMarker${region.id}.addEventListener("click", function() {
          map.openInfoWindow(regionInfoWindow${region.id}, regionPoint${region.id});
        });
      } catch (error) {
        console.error('添加区域标记${region.id}失败: ' + error.message);
      }
    `).join('\n');

    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
      <title>中国文物地图</title>
      <style>
        body, html { margin: 0; padding: 0; height: 100%; width: 100%; overflow: hidden; background-color: #f5f5f5; }
        #map { height: 100%; width: 100%; background-color: #e8e8e8; }
        .error-container { 
          position: absolute; 
          top: 50%; 
          left: 50%; 
          transform: translate(-50%, -50%);
          background: rgba(255,255,255,0.9);
          padding: 20px;
          border-radius: 8px;
          text-align: center;
          max-width: 80%;
          z-index: 1000;
        }
        .error-title { color: #D32F2F; font-weight: bold; margin-bottom: 10px; }
        .error-message { color: #333; }
        .try-again-btn {
          margin-top: 15px;
          padding: 8px 16px;
          background: #8B4513;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        .loading {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          text-align: center;
          color: #8B4513;
          z-index: 999;
          background: rgba(255,255,255,0.8);
          padding: 20px;
          border-radius: 10px;
        }
      </style>
    </head>
    <body>
      <div id="map"><!-- 地图将在这里加载 --></div>
      <div id="loading" class="loading">加载地图中...</div>
      <div id="error-display" style="display:none;" class="error-container">
        <div class="error-title">地图加载失败</div>
        <div id="error-message" class="error-message">请检查网络连接和API密钥配置</div>
        <button class="try-again-btn" onclick="location.reload()">重试</button>
      </div>
      
      <script>
        // 处理文物详情点击事件
        function handleDetailClick(id) {
          if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'viewDetail',
              id: id
            }));
          }
        }
        
        // 处理区域点击事件
        function handleRegionClick(id) {
          if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'viewRegion',
              id: id
            }));
          }
        }
        
        // 全局变量
        var map = null;
        
        // 加载百度地图脚本
        function loadBaiduMapScript() {
          var script = document.createElement('script');
          script.type = 'text/javascript';
          
          // 使用最简单的回调方式
          window.initBaiduMap = function() {
            // 延迟初始化确保API完全加载
            setTimeout(function() {
              try {
                if (typeof BMap !== 'undefined') {
                  initMap();
                } else {
                  throw new Error('百度地图API未加载完成，BMap未定义');
                }
              } catch (e) {
                document.getElementById('error-display').style.display = 'block';
                document.getElementById('error-message').innerText = '地图初始化失败: ' + e.message;
              }
            }, 1000);
          };
          
          script.onerror = function(e) {
            document.getElementById('loading').style.display = 'none';
            document.getElementById('error-display').style.display = 'block';
            document.getElementById('error-message').innerText = '百度地图API加载失败，请检查网络连接和API密钥';
          };
          
          // 使用普通版本 (非WebGL)
          script.src = 'https://api.map.baidu.com/api?v=2.0&ak=${BAIDU_MAP_AK}&callback=initBaiduMap';
          document.head.appendChild(script);
        }
        
        // 初始化地图
        function initMap() {
          try {
            // 创建地图实例
            window.BMapGL = BMap; // 兼容代码中使用的BMapGL名称
            map = new BMap.Map("map");
            
            var point = new BMap.Point(${mapCenter.longitude}, ${mapCenter.latitude});
            map.centerAndZoom(point, ${mapCenter.zoom});
            
            // 基本控件
            map.enableScrollWheelZoom(true);
            map.addControl(new BMap.ScaleControl());
            map.addControl(new BMap.NavigationControl());
            
            // 添加文物点标记
            ${markersCode}
            
            // 添加区域标记
            ${regionsCode}
            
            document.getElementById('loading').style.display = 'none';
            
            // 通知React Native地图已加载
            if (window.ReactNativeWebView) {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'mapLoaded', 
                success: true
              }));
            }
          } catch (error) {
            document.getElementById('loading').style.display = 'none';
            document.getElementById('error-display').style.display = 'block';
            document.getElementById('error-message').innerText = '错误信息: ' + error.message;
            if (window.ReactNativeWebView) {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'mapError', 
                message: error.message
              }));
            }
          }
        }
        
        // 页面加载时
        window.onload = function() {
          loadBaiduMapScript();
        };
        
        // 让ReactNative知道页面已加载
        if (window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'htmlLoaded'
          }));
        }
      </script>
    </body>
    </html>
    `;
  };

  useEffect(() => {
    // 直接设置为不加载状态，因为地图在WebView中加载
    setIsLoading(false);
  }, []);

  // WebView消息处理
  const handleWebViewMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      console.log('收到WebView消息:', data);
      
      if (data.type === 'log') {
        console.log('WebView日志:', data.message);
        return;
      }
      
      if (data.type === 'htmlLoaded') {
        console.log('HTML已加载完成');
        return;
      }
      
      if (data.type === 'mapError') {
        console.error('地图加载错误:', data.message);
        setMapError(`地图加载错误: ${data.message}`);
        return;
      }
      
      if (data.type === 'mapLoaded' && data.success) {
        console.log('地图加载成功，标记数量:', data.markersCount);
        setMapReady(true);
      } else if (data.type === 'viewRegion') {
        // 浏览区域按钮点击，导航到该区域
        console.log('接收到浏览区域消息:', data.id);
        handleRegionPress(data.id);
      } else if (data.type === 'viewDetail') {
        // 查看详情按钮点击，导航到详情页
        console.log('接收到查看详情消息:', data.id);
        handleRelicSitePress(data.id);
      }
    } catch (error) {
      console.error('消息处理错误:', error);
    }
  };

  const handleRegionPress = (regionId: string) => {
    const region = regions.find(r => r.id === regionId);
    if (region) {
      setSelectedRegion(region);
      setMapCenter({
        latitude: region.latitude,
        longitude: region.longitude,
        zoom: region.zoom
      });
      // 注入JS来更新地图中心
      const js = `
        try {
          map.centerAndZoom(new BMap.Point(${region.longitude}, ${region.latitude}), ${region.zoom});
          true;
        } catch(error) {
          false;
        }
      `;
      webViewRef.current?.injectJavaScript(js);
    }
  };

  const handleRelicSitePress = (relicId: string) => {
    // 导航到文物详情页
    const site = relicSites.find(s => s.id === relicId);
    if (site) {
      console.log('导航到文物详情页:', site.name);
      // 确保等待UI更新后再导航
      setTimeout(() => {
        router.push(`/relic/${relicId}`);
      }, 100);
    } else {
      console.error('未找到指定ID的文物:', relicId);
    }
  };

  const handleBackToChina = () => {
    setSelectedRegion(null);
    setMapCenter({
      latitude: 35.8617, 
      longitude: 104.1954,
      zoom: 4
    });
    // 注入JS来更新地图中心
    const js = `
      try {
        map.centerAndZoom(new BMap.Point(104.1954, 35.8617), 4);
        true;
      } catch(error) {
        false;
      }
    `;
    webViewRef.current?.injectJavaScript(js);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>中国文物地图</Text>
        {selectedRegion && (
          <TouchableOpacity style={styles.backButton} onPress={handleBackToChina}>
            <Text style={styles.backButtonText}>返回全国</Text>
          </TouchableOpacity>
        )}
      </View>
      
      {/* 新的水平滚动区域选择栏 */}
      <View style={styles.regionsContainerTop}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.regionsScrollContent}
        >
          {regions.map(region => (
            <TouchableOpacity
              key={region.id}
              style={[
                styles.regionButtonTop,
                selectedRegion?.id === region.id && styles.selectedRegionButtonTop
              ]}
              onPress={() => handleRegionPress(region.id)}
            >
              <Text 
                style={[
                  styles.regionButtonTextTop,
                  selectedRegion?.id === region.id && styles.selectedRegionButtonTextTop
                ]}
              >
                {region.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      
      <View style={styles.mapContainer}>
        <WebView
          ref={webViewRef}
          originWhitelist={['*']}
          source={{ 
            html: generateMapHTML(),
            baseUrl: 'https://api.map.baidu.com/' // 添加baseUrl以避免CORS问题
          }}
          style={styles.map}
          onMessage={handleWebViewMessage}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={false}
          cacheEnabled={false}
          incognito={true}
          bounces={false}
          scrollEnabled={false}
          containerStyle={{ flex: 1 }}
          androidLayerType="hardware"
          mixedContentMode="always" // 允许混合内容
          allowFileAccess={true} // 允许文件访问
          onShouldStartLoadWithRequest={(request) => {
            return true;
          }}
          onNavigationStateChange={(navState) => {
            // 简化导航状态处理
          }}
          onError={(error) => {
            setMapError('地图加载失败，请检查网络连接');
          }}
          onHttpError={(error) => {
            setMapError(`地图加载失败，HTTP错误: ${error.nativeEvent.statusCode}`);
          }}
          onLoadEnd={() => {
            // 加载完成处理
          }}
        />
        
        {isLoading && (
          <View style={styles.overlayLoadingContainer}>
            <ActivityIndicator size="large" color="#8B4513" />
            <Text style={styles.loadingText}>加载地图中...</Text>
          </View>
        )}
        
        {/* 图例说明 */}
        <View style={styles.legendContainer}>
          <Text style={styles.legendTitle}>图例</Text>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#1565C0' }]} />
            <Text style={styles.legendText}>文物遗址</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#8B4513' }]} />
            <Text style={styles.legendText}>博物馆</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#FF8C00' }]} />
            <Text style={styles.legendText}>区域中心</Text>
          </View>
        </View>
        
        {/* 地图错误显示 */}
        {mapError && (
          <View style={styles.mapErrorContainer}>
            <Text style={styles.mapErrorTitle}>地图加载错误</Text>
            <Text style={styles.mapErrorText}>{mapError}</Text>
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={() => {
                setMapError(null);
                webViewRef.current?.reload();
              }}
            >
              <Text style={styles.retryButtonText}>重试</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F4EA', // 更柔和的米色背景
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: 'rgba(248, 244, 234, 0.95)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(139, 69, 19, 0.1)',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#8B4513',
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'PingFang SC' : 'sans-serif-medium',
  },
  backButton: {
    position: 'absolute',
    right: 16,
    backgroundColor: '#8B4513',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
  },
  backButtonText: {
    fontSize: 14,
    color: '#FFF',
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#8B4513',
    fontFamily: Platform.OS === 'ios' ? 'PingFang SC' : 'sans-serif',
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  // 优化区域选择栏样式
  regionsContainerTop: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(139, 69, 19, 0.15)',
    marginBottom: 0,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  regionsScrollContent: {
    paddingHorizontal: 8,
  },
  regionButtonTop: {
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginHorizontal: 6,
    borderWidth: 1,
    borderColor: 'rgba(139, 69, 19, 0.3)',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  selectedRegionButtonTop: {
    backgroundColor: 'rgba(139, 69, 19, 0.9)',
    borderColor: 'rgba(139, 69, 19, 0.9)',
  },
  regionButtonTextTop: {
    fontSize: 14,
    fontWeight: '500',
    color: '#8B4513',
    fontFamily: Platform.OS === 'ios' ? 'PingFang SC' : 'sans-serif-medium',
  },
  selectedRegionButtonTextTop: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  // 优化图例样式
  legendContainer: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    padding: 12,
    paddingBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(139, 69, 19, 0.1)',
  },
  legendTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#8B4513',
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(139, 69, 19, 0.1)',
    paddingBottom: 6,
    fontFamily: Platform.OS === 'ios' ? 'PingFang SC' : 'sans-serif-medium',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 2,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  legendText: {
    fontSize: 12,
    color: '#333',
    fontFamily: Platform.OS === 'ios' ? 'PingFang SC' : 'sans-serif',
  },
  mapErrorContainer: {
    position: 'absolute',
    top: '50%',
    left: 16,
    right: 16,
    transform: [{ translateY: -70 }],
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(211, 47, 47, 0.1)',
  },
  mapErrorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#D32F2F',
    marginBottom: 10,
    fontFamily: Platform.OS === 'ios' ? 'PingFang SC' : 'sans-serif-medium',
  },
  mapErrorText: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
    fontFamily: Platform.OS === 'ios' ? 'PingFang SC' : 'sans-serif',
  },
  retryButton: {
    backgroundColor: '#8B4513',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    fontFamily: Platform.OS === 'ios' ? 'PingFang SC' : 'sans-serif-medium',
  },
  overlayLoadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(248, 244, 234, 0.8)',
    zIndex: 10,
  },
});

export default MapScreen; 