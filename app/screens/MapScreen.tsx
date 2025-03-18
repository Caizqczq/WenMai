import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ActivityIndicator, Platform, Dimensions, Linking, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
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
  { id: '101', name: '故宫博物院', latitude: 39.9163, longitude: 116.3972, regionId: '1' },
  { id: '102', name: '秦始皇兵马俑', latitude: 34.3841, longitude: 109.2785, regionId: '4' },
  { id: '103', name: '莫高窟', latitude: 40.0359, longitude: 94.8096, regionId: '4' },
  { id: '104', name: '三星堆博物馆', latitude: 31.1350, longitude: 104.3998, regionId: '5' },
  { id: '105', name: '苏州博物馆', latitude: 31.3213, longitude: 120.6288, regionId: '2' },
  { id: '106', name: '陕西历史博物馆', latitude: 34.2377, longitude: 108.9376, regionId: '4' },
  { id: '107', name: '湖南省博物馆', latitude: 28.1926, longitude: 112.9850, regionId: '3' },
];

const MapScreen = () => {
  const router = useRouter();
  const webViewRef = useRef<WebView>(null);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mapError, setMapError] = useState<string | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);
  const [selectedRelicSite, setSelectedRelicSite] = useState<RelicSite | null>(null);
  const [mapCenter, setMapCenter] = useState({
    latitude: 35.8617, 
    longitude: 104.1954, // 中国大致中心点
    zoom: 4
  });

  // HTML内容包含百度地图
  const generateMapHTML = () => {
    // 检查是否有百度地图API密钥
    if (!BAIDU_MAP_AK) {
      setTimeout(() => {
        setMapError('百度地图API密钥未配置，请在app.json中配置baiduMapAK');
      }, 500);
      return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>地图加载错误</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; color: #333; text-align: center; }
          .error { color: red; margin: 20px 0; }
          .note { font-size: 14px; color: #666; margin-top: 20px; }
        </style>
      </head>
      <body>
        <h2>地图加载错误</h2>
        <p class="error">百度地图API密钥未配置</p>
        <p class="note">请在app.json中配置baiduMapAK</p>
      </body>
      </html>
      `;
    }

    // 筛选当前区域的文物点
    const filteredSites = selectedRegion 
      ? relicSites.filter(site => site.regionId === selectedRegion.id)
      : relicSites;
    
    // 生成标记点的JS代码
    const markersCode = filteredSites.map(site => `
      var marker${site.id} = new BMapGL.Marker(new BMapGL.Point(${site.longitude}, ${site.latitude}));
      map.addOverlay(marker${site.id});
      var content${site.id} = '<div style="padding:10px;border-radius:5px;background:#fff;color:#333;"><p style="margin:0;font-weight:bold;font-size:14px;">${site.name}</p></div>';
      var infoWindow${site.id} = new BMapGL.InfoWindow(content${site.id});
      marker${site.id}.addEventListener('click', function() {
        map.openInfoWindow(infoWindow${site.id}, new BMapGL.Point(${site.longitude}, ${site.latitude}));
        window.ReactNativeWebView.postMessage(JSON.stringify({type: 'relicSite', id: '${site.id}'}));
      });
    `).join('\n');
    
    // 生成区域标记的JS代码
    const regionsCode = regions.map(region => `
      var regionMarker${region.id} = new BMapGL.Marker(new BMapGL.Point(${region.longitude}, ${region.latitude}), {
        icon: new BMapGL.Icon("https://api.map.baidu.com/images/marker_red.png", new BMapGL.Size(23, 25), {
          offset: new BMapGL.Size(10, 25),
          imageOffset: new BMapGL.Size(0, 0)
        })
      });
      map.addOverlay(regionMarker${region.id});
      var regionContent${region.id} = '<div style="padding:10px;border-radius:5px;background:#fff;color:#333;"><p style="margin:0;font-weight:bold;font-size:14px;">${region.name}</p><p style="margin:5px 0 0;font-size:12px;">${region.description}</p></div>';
      var regionInfoWindow${region.id} = new BMapGL.InfoWindow(regionContent${region.id});
      regionMarker${region.id}.addEventListener('click', function() {
        map.openInfoWindow(regionInfoWindow${region.id}, new BMapGL.Point(${region.longitude}, ${region.latitude}));
        window.ReactNativeWebView.postMessage(JSON.stringify({type: 'region', id: '${region.id}'}));
      });
    `).join('\n');

    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
      <title>中国文物地图</title>
      <style>
        body, html { margin: 0; padding: 0; height: 100%; width: 100%; overflow: hidden; }
        #map { height: 100%; width: 100%; }
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
      </style>
      <script type="text/javascript" src="https://api.map.baidu.com/api?v=1.0&type=webgl&ak=${BAIDU_MAP_AK}"></script>
    </head>
    <body>
      <div id="map"></div>
      <div id="error-display" style="display:none;" class="error-container">
        <div class="error-title">地图加载失败</div>
        <div id="error-message" class="error-message">请检查网络连接和API密钥配置</div>
        <button class="try-again-btn" onclick="location.reload()">重试</button>
      </div>
      <script>
        var map;
        try {
          map = new BMapGL.Map("map");
          var point = new BMapGL.Point(${mapCenter.longitude}, ${mapCenter.latitude});
          map.centerAndZoom(point, ${mapCenter.zoom});
          map.enableScrollWheelZoom(true);
          map.addControl(new BMapGL.ScaleControl());
          map.addControl(new BMapGL.ZoomControl());
          map.addControl(new BMapGL.LocationControl());
          
          // 添加文物点标记
          ${markersCode}
          
          // 添加区域标记
          ${regionsCode}
          
          // 用户位置（如果有）
          ${location ? 
            `var userPoint = new BMapGL.Point(${location.coords.longitude}, ${location.coords.latitude});
             var userMarker = new BMapGL.Marker(userPoint, {
               icon: new BMapGL.Icon("https://api.map.baidu.com/images/marker_red_sprite.png", new BMapGL.Size(19, 25))
             });
             map.addOverlay(userMarker);
             var userInfoWindow = new BMapGL.InfoWindow("当前位置");
             userMarker.addEventListener('click', function() {
               map.openInfoWindow(userInfoWindow, userPoint);
             });` 
            : ''}

          // 告诉React Native地图已成功加载
          window.ReactNativeWebView.postMessage(JSON.stringify({type: 'mapLoaded', success: true}));
        } catch (error) {
          document.getElementById('error-display').style.display = 'block';
          document.getElementById('error-message').innerText = '错误信息: ' + error.message;
          window.ReactNativeWebView.postMessage(JSON.stringify({type: 'mapError', message: error.message}));
        }
      </script>
    </body>
    </html>
    `;
  };

  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        
        // 请求位置权限
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setErrorMsg('需要位置权限来显示您在地图上的位置');
          setIsLoading(false);
          return;
        }

        try {
          // 获取当前位置
          let location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
            timeInterval: 10000
          });
          setLocation(location);
        } catch (locError) {
          console.error('获取位置失败:', locError);
          setErrorMsg('无法获取您的位置，默认显示中国地图。请确保已开启位置服务。');
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('位置服务初始化失败:', error);
        setErrorMsg('位置服务初始化失败，请检查权限设置');
        setIsLoading(false);
      }
    })();
  }, []);
  
  // WebView消息处理
  const handleWebViewMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      
      if (data.type === 'mapError') {
        setMapError(`地图加载错误: ${data.message}`);
        return;
      }
      
      if (data.type === 'region') {
        const region = regions.find(r => r.id === data.id);
        if (region) {
          setSelectedRegion(region);
          setMapCenter({
            latitude: region.latitude,
            longitude: region.longitude,
            zoom: region.zoom
          });
          // 重新加载WebView来更新地图中心
          webViewRef.current?.reload();
        }
      } else if (data.type === 'relicSite') {
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
          map.centerAndZoom(new BMapGL.Point(${region.longitude}, ${region.latitude}), ${region.zoom});
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
    router.push(`/relic/${relicId}`);
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
        map.centerAndZoom(new BMapGL.Point(104.1954, 35.8617), 4);
        true;
      } catch(error) {
        false;
      }
    `;
    webViewRef.current?.injectJavaScript(js);
  };

  const openLocationSettings = () => {
    // 打开设备位置设置
    if (Platform.OS === 'ios') {
      Linking.openURL('app-settings:');
    } else {
      Linking.openSettings();
    }
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
      
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8B4513" />
          <Text style={styles.loadingText}>加载地图中...</Text>
        </View>
      ) : (
        <View style={styles.mapContainer}>
          <WebView
            ref={webViewRef}
            originWhitelist={['*']}
            source={{ html: generateMapHTML() }}
            style={styles.map}
            onMessage={handleWebViewMessage}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            startInLoadingState={true}
            onError={(error) => {
              console.error('WebView错误:', error);
              setMapError('地图加载失败，请检查网络连接');
            }}
            renderLoading={() => (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#8B4513" />
                <Text style={styles.loadingText}>加载地图中...</Text>
              </View>
            )}
          />
          
          {/* 区域选择按钮 */}
          <View style={styles.regionsButtonContainer}>
            <Text style={styles.regionsTitle}>文物区域</Text>
            <View style={styles.regionsButtons}>
              {regions.map(region => (
                <TouchableOpacity
                  key={region.id}
                  style={[
                    styles.regionButton,
                    selectedRegion?.id === region.id && styles.selectedRegionButton
                  ]}
                  onPress={() => handleRegionPress(region.id)}
                >
                  <Text 
                    style={[
                      styles.regionButtonText,
                      selectedRegion?.id === region.id && styles.selectedRegionButtonText
                    ]}
                  >
                    {region.name}
                  </Text>
                </TouchableOpacity>
              ))}
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
      )}
      
      {errorMsg && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{errorMsg}</Text>
          <TouchableOpacity 
            style={styles.locationSettingsButton}
            onPress={openLocationSettings}
          >
            <Text style={styles.locationSettingsButtonText}>打开位置设置</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5EFE0',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8B4513',
    textAlign: 'center',
  },
  backButton: {
    position: 'absolute',
    right: 16,
    backgroundColor: '#8B4513',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  backButtonText: {
    fontSize: 14,
    color: '#FFF',
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
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  regionsButtonContainer: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 8,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  regionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#8B4513',
    marginBottom: 8,
  },
  regionsButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  regionButton: {
    backgroundColor: '#FFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#8B4513',
  },
  selectedRegionButton: {
    backgroundColor: '#8B4513',
  },
  regionButtonText: {
    fontSize: 14,
    color: '#8B4513',
  },
  selectedRegionButtonText: {
    color: '#FFF',
  },
  errorContainer: {
    padding: 16,
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    margin: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  errorText: {
    color: '#D32F2F',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 10,
  },
  locationSettingsButton: {
    backgroundColor: '#8B4513',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    marginTop: 8,
  },
  locationSettingsButtonText: {
    color: 'white',
    fontSize: 14,
  },
  mapErrorContainer: {
    position: 'absolute',
    top: '50%',
    left: 16,
    right: 16,
    transform: [{ translateY: -70 }],
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  mapErrorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#D32F2F',
    marginBottom: 8,
  },
  mapErrorText: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#8B4513',
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 6,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
  },
});

export default MapScreen; 