import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ActivityIndicator, Platform, Dimensions, Linking, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { WebView } from 'react-native-webview';
import Constants from 'expo-constants';
import { Region, RelicSite } from '@/data/types';
import { regionService } from '@/data/services';
import LoadingIndicator from '@/components/ui/LoadingIndicator';

// 从expo配置中获取百度地图API密钥
const BAIDU_MAP_AK = Constants.expoConfig?.extra?.baiduMapAK || '';

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
  
  // 数据状态
  const [regions, setRegions] = useState<Region[]>([]);
  const [relicSites, setRelicSites] = useState<RelicSite[]>([]);
  const [dataLoaded, setDataLoaded] = useState(false);

  // 加载区域和点位数据
  useEffect(() => {
    const loadData = async () => {
      try {
        const [regionsData, sitesData] = await Promise.all([
          regionService.getAllRegions(),
          regionService.getAllRelicSites()
        ]);
        
        setRegions(regionsData);
        setRelicSites(sitesData);
        setDataLoaded(true);
      } catch (error) {
        console.error('加载地图数据失败:', error);
        Alert.alert('数据加载错误', '无法加载地图数据，请稍后重试');
      }
    };
    
    loadData();
  }, []);

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
        // 获取位置权限
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setErrorMsg('未授予位置权限');
          return;
        }

        // 获取当前位置
        let location = await Location.getCurrentPositionAsync({});
        setLocation(location);
      } catch (error) {
        console.log("获取位置失败", error);
        setErrorMsg('获取位置信息失败');
      }
    })();
  }, []);

  // 处理来自WebView的消息
  const handleWebViewMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      
      switch (data.type) {
        case 'mapLoaded':
          setIsLoading(false);
          break;
        case 'mapError':
          setMapError(data.message);
          setIsLoading(false);
          break;
        case 'region':
          handleRegionSelect(data.id);
          break;
        case 'relicSite':
          handleRelicSiteSelect(data.id);
          break;
      }
    } catch (error) {
      console.error('处理WebView消息失败:', error);
    }
  };

  // 处理区域选择
  const handleRegionSelect = async (regionId: string) => {
    try {
      const region = await regionService.getRegionById(regionId);
      if (region) {
        setSelectedRegion(region);
        setMapCenter({
          latitude: region.latitude,
          longitude: region.longitude,
          zoom: region.zoom
        });
        
        // 重新加载包含该区域标记的地图
        setTimeout(() => {
          webViewRef.current?.reload();
        }, 100);
      }
    } catch (error) {
      console.error('获取区域数据失败:', error);
    }
  };

  // 处理文物点位选择
  const handleRelicSiteSelect = async (siteId: string) => {
    try {
      const site = await regionService.getRelicSiteById(siteId);
      if (site) {
        setSelectedRelicSite(site);
        // 可以在这里导航到点位详情页或显示弹窗
        // router.push(`/site/${siteId}`);
      }
    } catch (error) {
      console.error('获取点位数据失败:', error);
    }
  };

  // 返回全国视图
  const handleResetMapView = () => {
    setSelectedRegion(null);
    setMapCenter({
      latitude: 35.8617,
      longitude: 104.1954,
      zoom: 4
    });
    webViewRef.current?.reload();
  };

  // 加载状态
  if (isLoading || !dataLoaded) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        <View style={styles.loadingContainer}>
          <LoadingIndicator 
            type="page" 
            message="正在加载地图..." 
            color="#8B4513" 
          />
        </View>
      </SafeAreaView>
    );
  }

  // 错误状态
  if (mapError) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>地图加载失败</Text>
          <Text style={styles.errorMessage}>{mapError}</Text>
          <TouchableOpacity 
            style={styles.tryAgainButton}
            onPress={() => {
              setMapError(null);
              setIsLoading(true);
              webViewRef.current?.reload();
            }}
          >
            <Text style={styles.tryAgainButtonText}>重试</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // 正常显示地图
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      {/* 百度地图WebView */}
      <WebView
        ref={webViewRef}
        source={{ html: generateMapHTML() }}
        style={styles.map}
        onMessage={handleWebViewMessage}
        javaScriptEnabled={true}
        geolocationEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        renderLoading={() => (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#8B4513" />
            <Text style={styles.loadingText}>加载地图中...</Text>
          </View>
        )}
      />
      
      {/* 重置视图按钮 */}
      {selectedRegion && (
        <TouchableOpacity
          style={styles.resetButton}
          onPress={handleResetMapView}
        >
          <Text style={styles.resetButtonText}>返回全国</Text>
        </TouchableOpacity>
      )}
      
      {/* 点位信息卡片 */}
      {selectedRelicSite && (
        <TouchableOpacity 
          style={styles.siteInfoCard}
          onPress={() => {
            if (selectedRelicSite.relicIds && selectedRelicSite.relicIds.length > 0) {
              router.push(`/relic/${selectedRelicSite.relicIds[0]}`);
            }
          }}
        >
          <View style={styles.siteInfoHeader}>
            <Text style={styles.siteInfoTitle}>{selectedRelicSite.name}</Text>
            <TouchableOpacity
              onPress={() => setSelectedRelicSite(null)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>
          {selectedRelicSite.description && (
            <Text style={styles.siteInfoDescription}>{selectedRelicSite.description}</Text>
          )}
          <View style={styles.siteInfoActions}>
            <TouchableOpacity 
              style={styles.siteInfoButton}
              onPress={() => {
                if (selectedRelicSite.relicIds && selectedRelicSite.relicIds.length > 0) {
                  router.push(`/relic/${selectedRelicSite.relicIds[0]}`);
                }
              }}
            >
              <Text style={styles.siteInfoButtonText}>查看文物</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F6F0',
  },
  map: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#8B4513',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#D32F2F',
    marginBottom: 10,
  },
  errorMessage: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  tryAgainButton: {
    backgroundColor: '#8B4513',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  tryAgainButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  resetButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: 'rgba(139, 69, 19, 0.9)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  resetButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  siteInfoCard: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  siteInfoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  siteInfoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8B4513',
    flex: 1,
  },
  closeButton: {
    fontSize: 18,
    color: '#888',
    padding: 5,
  },
  siteInfoDescription: {
    fontSize: 14,
    color: '#333',
    marginBottom: 15,
  },
  siteInfoActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  siteInfoButton: {
    backgroundColor: '#8B4513',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
  },
  siteInfoButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default MapScreen; 