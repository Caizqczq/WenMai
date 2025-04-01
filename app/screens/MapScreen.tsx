import React, { useState, useRef, useEffect, useMemo } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ActivityIndicator, Platform, ScrollView, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import Constants from 'expo-constants';
import { Region, RelicSite } from '../../data/types';
import { regionService } from '../../data/services';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
// 导入地图图标工具
import { getMapIconUrl } from '../../utils/mapIconUtils';

// 修改百度地图API密钥，直接使用字符串避免编码问题
const BAIDU_MAP_API_KEY = "Q8PGQJZ0llabSmb3OMnsx5HRobi4HdtZ";

const MapScreen = () => {
  const webViewRef = useRef<WebView>(null);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // 添加数据状态
  const [regions, setRegions] = useState<Region[]>([]);
  const [relicSites, setRelicSites] = useState<RelicSite[]>([]);
  const [dataLoaded, setDataLoaded] = useState(false);
  
  // 添加选中的文物点位状态
  const [selectedRelicSite, setSelectedRelicSite] = useState<RelicSite | null>(null);
  
  // 添加区域筛选状态
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  
  // 地图全屏状态
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // 用户位置状态
  const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);

  // 获取当前筛选后的点位
  const filteredRelicSites = useMemo(() => {
    // 首先筛选出只有博物馆类型的点位
    const museumSites = relicSites.filter(site => site.type === 'museum');
    
    // 然后根据所选地区进一步筛选
    if (!selectedRegion) return museumSites;
    return museumSites.filter(site => site.regionId === selectedRegion);
  }, [relicSites, selectedRegion]);

  // 添加数据加载逻辑
  useEffect(() => {
    const loadData = async () => {
      try {
        const [regionsData, sitesData] = await Promise.all([
          regionService.getAllRegions(),
          regionService.getRelicSitesByType('museum') // 只加载博物馆类型的点位
        ]);
        
        setRegions(regionsData);
        setRelicSites(sitesData);
        setDataLoaded(true);
        console.log(`加载了 ${regionsData.length} 个地区和 ${sitesData.length} 个博物馆点位`);
        
        // 数据加载完成后尝试请求位置权限
        requestLocationPermission();
      } catch (error) {
        console.error('加载地图数据失败:', error);
        setErrorMessage('无法加载地图数据，请稍后重试');
      }
    };
    
    loadData();
  }, []);
  
  // 监听选中区域变化，重新加载地图
  useEffect(() => {
    if (dataLoaded && webViewRef.current) {
      // 重新加载地图以显示筛选后的点位
      setIsLoading(true);
      webViewRef.current.reload();
    }
  }, [selectedRegion, dataLoaded]);

  // 监听用户位置变化，在地图加载完成后添加位置标记
  useEffect(() => {
    if (userLocation && !isLoading && dataLoaded) {
      addUserLocationMarker(userLocation.coords.longitude, userLocation.coords.latitude);
    }
  }, [userLocation, isLoading, dataLoaded]);

  // 生成地图HTML内容
  const generateMapHtml = useMemo(() => {
    // 生成筛选后的文物点位的标记代码
    const markersCode = filteredRelicSites.map(site => {
      // 获取自定义图标URL或本地资源
      const iconSource = getMapIconUrl(site.id, site.type);
      
      // 处理图标URL - 如果是本地资源，则获取其URI
      let iconUrl = '';
      if (typeof iconSource === 'string') {
        // 在线图标，直接使用URL
        iconUrl = iconSource;
      } else {
        // 本地图片资源，获取URI
        try {
          const resolvedSource = Image.resolveAssetSource(iconSource);
          iconUrl = resolvedSource.uri;
        } catch (error) {
          console.error('处理本地图标出错:', error);
          // 出错使用默认图标
          iconUrl = 'https://img.icons8.com/color/48/000000/marker.png';
        }
      }
      
      return `
      // 创建标记 - ${site.name}
      var customIcon_${site.id} = new BMap.Icon(
        "${iconUrl}", 
        new BMap.Size(48, 48),  // 图标大小，调整为适中大小
        {
          imageSize: new BMap.Size(48, 48),  // 图片大小
          anchor: new BMap.Size(16, 32)      // 锚点位置，底部中心
        }
      );
      
      // 创建自定义标记
      var marker_${site.id} = new BMap.Marker(
        new BMap.Point(${site.longitude}, ${site.latitude}),
        {icon: customIcon_${site.id}}
      );
      
      // 添加标记到地图
      map.addOverlay(marker_${site.id});
      
      // 为标记添加悬停效果
      marker_${site.id}.addEventListener('mouseover', function() {
        this.setTop(true);
        this.setZIndex(9999);
      });
      
      marker_${site.id}.addEventListener('mouseout', function() {
        this.setTop(false);
        this.setZIndex(1);
      });
      
      // 为标记创建信息窗口内容
      var infoContent_${site.id} = \`
        <div style="padding: 12px; max-width: 280px; font-family: Arial, sans-serif;">
          <div style="font-weight: bold; font-size: 16px; color: #8B4513; margin-bottom: 10px; border-bottom: 1px solid #e0e0e0; padding-bottom: 8px;">${site.name}</div>
          ${site.description ? `<div style="font-size: 14px; line-height: 1.5; margin-bottom: 10px; color: #333;">${site.description}</div>` : ''}
          ${site.type ? `<div style="font-size: 12px; color: #666; margin-bottom: 8px;"><span style="background-color: #f0f0f0; padding: 2px 6px; border-radius: 10px; color: #8B4513;">${site.type === 'museum' ? '博物馆' : (site.type === 'site' ? '遗址' : '纪念碑')}</span></div>` : ''}
          ${site.relicIds && site.relicIds.length > 0 ? 
            `<div style="font-size: 13px; color: #666; margin-bottom: 10px;">收藏 <b>${site.relicIds.length}</b> 件文物</div>
             <button 
               onclick="window.ReactNativeWebView.postMessage(JSON.stringify({type: 'viewDetails', id: '${site.id}'}))" 
               style="background-color: #8B4513; color: white; border: none; border-radius: 4px; padding: 8px 14px; margin-top: 6px; float: right; font-size: 14px; cursor: pointer;">
               查看详情
             </button>` 
            : 
            `<button 
               onclick="window.ReactNativeWebView.postMessage(JSON.stringify({type: 'viewDetails', id: '${site.id}'}))" 
               style="background-color: #8B4513; color: white; border: none; border-radius: 4px; padding: 8px 14px; margin-top: 6px; float: right; font-size: 14px; cursor: pointer;">
               查看详情
             </button>`
          }
          <div style="clear: both;"></div>
        </div>
      \`;
      
      // 创建信息窗口对象
      var infoWindow_${site.id} = new BMap.InfoWindow(infoContent_${site.id}, {
        width: 280,
        height: 0,
        enableMessage: false
      });
      
      // 添加点击事件
      marker_${site.id}.addEventListener('click', function() {
        map.openInfoWindow(infoWindow_${site.id}, new BMap.Point(${site.longitude}, ${site.latitude}));
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'markerClick', 
          id: '${site.id}',
          name: '${site.name}'
        }));
      });
    `}).join('\n');
    
    // 确定地图中心点和缩放级别
    let defaultCenter, defaultZoom;
    
    if (selectedRegion) {
      // 如果选择了地区，使用该地区的中心点和缩放级别
      const region = regions.find(r => r.id === selectedRegion);
      if (region) {
        defaultCenter = `${region.longitude}, ${region.latitude}`;
        defaultZoom = region.zoom || 10;
      } else {
        defaultCenter = '104.1954, 35.8617'; // 中国中心
        defaultZoom = 5;
      }
    } else if (filteredRelicSites.length > 0) {
      // 如果有点位但没选择地区，使用第一个点位的位置
      defaultCenter = `${filteredRelicSites[0].longitude}, ${filteredRelicSites[0].latitude}`;
      defaultZoom = 5;
    } else {
      // 默认中国中心
      defaultCenter = '104.1954, 35.8617';
      defaultZoom = 5;
    }
    
    // 生成用户位置标记代码 - 改进用户位置图标和样式
    const userLocationCode = userLocation ? `
      // 添加用户位置标记
      var userIcon = new BMap.Icon(
        "https://api.map.baidu.com/images/geolocation-control/position-icon-14x14.png", 
        new BMap.Size(28, 28),
        {
          imageSize: new BMap.Size(14, 14),
          anchor: new BMap.Size(7, 7)
        }
      );
      
      var userPoint = new BMap.Point(${userLocation.coords.longitude}, ${userLocation.coords.latitude});
      
      // 添加一个更明显的位置标记
      var userMarker = new BMap.Marker(userPoint, {
        icon: userIcon,
        enableMassClear: false
      });
      map.addOverlay(userMarker);
      
      // 添加位置精度圆圈
      var circle = new BMap.Circle(userPoint, 100, {
        strokeColor: "rgba(24, 144, 255, 0.5)",
        strokeWeight: 1,
        strokeOpacity: 0.5,
        fillColor: "rgba(24, 144, 255, 0.2)",
        fillOpacity: 0.3
      });
      map.addOverlay(circle);
      
      // 为用户位置添加信息窗口
      var userInfoWindow = new BMap.InfoWindow("<div style='padding: 5px; text-align: center;'>当前位置</div>");
      userMarker.addEventListener('click', function() {
        map.openInfoWindow(userInfoWindow, userPoint);
      });
    ` : '';
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>博物馆地图</title>
        <style>
          body, html {
            margin: 0;
            padding: 0;
            height: 100%;
            width: 100%;
            overflow: hidden;
          }
          #container {
            height: 100%;
            width: 100%;
          }
          #status {
            position: absolute;
            bottom: 10px;
            left: 10px;
            right: 10px;
            padding: 8px;
            background: rgba(255,255,255,0.7);
            text-align: center;
            border-radius: 4px;
            z-index: 9999;
            display: none; /* 默认隐藏状态栏 */
          }
          #mapTitle {
            position: absolute;
            top: 10px;
            left: 50%;
            transform: translateX(-50%);
            padding: 8px 15px;
            background: rgba(255,255,255,0.9);
            border-radius: 20px;
            font-weight: bold;
            color: #8B4513;
            z-index: 9999;
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
          }
        </style>
        <script type="text/javascript" src="https://api.map.baidu.com/api?v=3.0&ak=${BAIDU_MAP_API_KEY}"></script>
      </head>
      <body>
        <div id="container"></div>
        <div id="status">加载中...</div>
        <div id="mapTitle">博物馆地图</div>
        
        <script>
          function log(msg) {
            console.log(msg);
            var statusEl = document.getElementById('status');
            statusEl.innerText = msg;
            
            // 只在加载或错误时显示状态
            if (msg.includes('错误') || msg.includes('加载中') || msg.includes('初始化')) {
              statusEl.style.display = 'block';
            } else {
              // 3秒后自动隐藏成功消息
              setTimeout(function() {
                statusEl.style.display = 'none';
              }, 3000);
            }
            
            try {
              window.ReactNativeWebView.postMessage('LOG:' + msg);
            } catch(e) {}
          }
          
          function initMap() {
            try {
              log('初始化地图...');
              var map = new BMap.Map('container');
              window.map = map; // 保存全局引用以便后续注入脚本使用
              var point = new BMap.Point(${defaultCenter});
              map.centerAndZoom(point, ${defaultZoom});
              map.enableScrollWheelZoom();
              map.addControl(new BMap.NavigationControl());
              map.addControl(new BMap.ScaleControl());
              
              ${markersCode}
              
              ${userLocationCode}
              
              log('地图加载成功!');
              window.ReactNativeWebView.postMessage('SUCCESS');
            } catch(e) {
              log('初始化地图出错: ' + e.message);
              window.ReactNativeWebView.postMessage('ERROR:' + e.message);
            }
          }
          
          window.onload = function() {
            log('页面加载完成，准备初始化地图...');
            // 延时确保BMap加载完成
            setTimeout(initMap, 1000);
          };
        </script>
      </body>
      </html>
    `;
  }, [filteredRelicSites, regions, selectedRegion, userLocation]);

  // 处理WebView消息
  const handleMessage = (event: WebViewMessageEvent) => {
    const { data } = event.nativeEvent;
    // 减少日志输出，只在开发环境输出
    if (__DEV__) {
      console.log("WebView消息:", data);
    }
    
    if (data === 'SUCCESS') {
      setIsLoading(false);
    } else if (data.startsWith('ERROR:')) {
      setIsLoading(false);
      setErrorMessage(data.substring(6));
    } else if (data.startsWith('LOG:')) {
      // 只在开发环境输出日志
      if (__DEV__) {
        console.log("地图:", data.substring(4));
      }
    } else {
      // 尝试解析JSON消息
      try {
        const jsonData = JSON.parse(data);
        if (jsonData.type === 'markerClick') {
          // 在地图上已经显示了信息窗口，不需要单独设置selectedRelicSite
        } else if (jsonData.type === 'viewDetails') {
          // 查找点位并跳转到详情页
          const site = relicSites.find(site => site.id === jsonData.id);
          if (site && site.relicIds && site.relicIds.length > 0) {
            const relicId = site.relicIds[0];
            router.push(`/relic/${relicId}`);
          }
        }
      } catch (e) {
        // 忽略解析错误
      }
    }
  };

  // 尝试注入JS刷新BMap
  const injectRefreshScript = () => {
    const refreshScript = `
      document.getElementById('status').innerText = '正在重新加载...';
      setTimeout(function() {
        if (typeof BMap !== 'undefined') {
          initMap();
        } else {
          document.getElementById('status').innerText = 'BMap未定义，重新加载页面';
          location.reload();
        }
      }, 1000);
      true;
    `;
    
    webViewRef.current?.injectJavaScript(refreshScript);
  };

  // 刷新地图
  const refreshMap = () => {
    setIsLoading(true);
    setSelectedRelicSite(null);
    if (webViewRef.current) {
      webViewRef.current.reload();
    }
  };
  
  // 注入JavaScript来移动地图中心点
  const moveToPoint = (longitude: number, latitude: number, zoom: number = 15) => {
    if (!webViewRef.current) return;
    
    const script = `
      try {
        var map = document.getElementsByTagName('script')[0].map;
        if (map) {
          var point = new BMap.Point(${longitude}, ${latitude});
          map.centerAndZoom(point, ${zoom});
          document.getElementById('status').innerText = '已移动到新位置';
        } else {
          document.getElementById('status').innerText = '地图实例不可用';
        }
      } catch(e) {
        document.getElementById('status').innerText = '移动位置出错: ' + e.message;
      }
      true;
    `;
    
    webViewRef.current.injectJavaScript(script);
  };
  
  // 移动到选中区域
  const moveToSelectedRegion = () => {
    if (!selectedRegion) return;
    
    const region = regions.find(r => r.id === selectedRegion);
    if (region) {
      moveToPoint(region.longitude, region.latitude, region.zoom || 10);
    }
  };
  
  // 移动到全国视图
  const moveToNationalView = () => {
    moveToPoint(104.1954, 35.8617, 5); // 中国中心点
  };

  // 请求并获取用户位置
  const requestLocationPermission = async () => {
    try {
      // 不显示"请求中"状态，避免不必要的UI闪烁
      
      // 先检查位置服务是否启用
      const enabled = await Location.hasServicesEnabledAsync();
      if (!enabled) {
        console.log('位置服务未启用');
        return;
      }
      
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        console.log('位置权限被拒绝');
        return;
      }
      
      try {
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Low
        });
        setUserLocation(location);
        
        // 如果已经有地图实例，则直接添加位置标记
        if (webViewRef.current && dataLoaded) {
          addUserLocationMarker(location.coords.longitude, location.coords.latitude);
        }
      } catch (locationError) {
        console.log('获取位置出错');
        
        // 尝试使用最后已知位置
        try {
          const lastKnownPosition = await Location.getLastKnownPositionAsync();
          if (lastKnownPosition) {
            console.log('使用最后已知位置');
            setUserLocation(lastKnownPosition);
            
            if (webViewRef.current && dataLoaded) {
              addUserLocationMarker(lastKnownPosition.coords.longitude, lastKnownPosition.coords.latitude);
            }
          }
        } catch (e) {
          console.log('无法获取位置');
        }
      }
    } catch (error) {
      console.log('位置权限错误');
    }
  };
  
  // 添加用户位置标记
  const addUserLocationMarker = (longitude: number, latitude: number) => {
    if (!webViewRef.current) return;
    
    const script = `
      try {
        // 清除当前可能存在的用户位置标记
        var overlays = map.getOverlays();
        for (var i = 0; i < overlays.length; i++) {
          if (overlays[i]._isUserLocation) {
            map.removeOverlay(overlays[i]);
          }
        }
        
        // 创建自定义图标
        var userIcon = new BMap.Icon(
          "https://api.map.baidu.com/images/geolocation-control/position-icon-14x14.png", 
          new BMap.Size(30, 30),
          {
            imageSize: new BMap.Size(15, 15),
            anchor: new BMap.Size(7.5, 7.5)
          }
        );
        
        // 添加用户位置标记
        var userPoint = new BMap.Point(${longitude}, ${latitude});
        var userMarker = new BMap.Marker(userPoint, {
          icon: userIcon,
          enableMassClear: false
        });
        userMarker._isUserLocation = true; // 添加标记以便后续识别
        map.addOverlay(userMarker);
        
        // 添加位置精度圆圈
        var circle = new BMap.Circle(userPoint, 100, {
          strokeColor: "rgba(24, 144, 255, 0.5)",
          strokeWeight: 1,
          strokeOpacity: 0.5,
          fillColor: "rgba(24, 144, 255, 0.2)",
          fillOpacity: 0.3
        });
        circle._isUserLocation = true;
        map.addOverlay(circle);
      } catch(e) {
        console.error('添加用户位置标记出错: ' + e.message);
      }
      true;
    `;
    
    webViewRef.current.injectJavaScript(script);
  };
  
  // 移动到用户位置
  const moveToUserLocation = () => {
    if (!userLocation) {
      // 显示提示
      Alert.alert(
        '定位服务',
        '正在尝试获取您的位置...',
        [
          { text: '取消', style: 'cancel' },
          { 
            text: '重试', 
            onPress: requestLocationPermission 
          }
        ]
      );
      return;
    }
    
    moveToPoint(userLocation.coords.longitude, userLocation.coords.latitude, 16);
    addUserLocationMarker(userLocation.coords.longitude, userLocation.coords.latitude);
  };

  return (
    <SafeAreaView style={[styles.container, isFullscreen && styles.fullscreenContainer]}>
      <StatusBar style="dark" />
      
      <WebView
        ref={webViewRef}
        source={{ html: generateMapHtml, baseUrl: Platform.OS === 'android' ? 'file:///android_asset/' : '' }}
        style={styles.webview}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        originWhitelist={['*']}
        scrollEnabled={false}
        bounces={false}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        onMessage={handleMessage}
        onLoadStart={() => console.log("WebView开始加载")}
        onLoadEnd={() => console.log("WebView加载完成")}
        onError={(error) => {
          console.error("WebView错误:", error.nativeEvent);
          setIsLoading(false);
          setErrorMessage(`WebView加载失败: ${error.nativeEvent.description}`);
        }}
      />
      
      {/* 区域选择器 - 重新设计 */}
      {!isFullscreen && (
        <View style={styles.regionSelectorContainer}>
          <View style={styles.regionHeader}>
            <Text style={styles.regionTitle}>博物馆地图</Text>
          </View>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            style={styles.regionSelector}
            contentContainerStyle={styles.regionSelectorContent}
          >
            <TouchableOpacity
              style={[styles.regionButton, selectedRegion === null && styles.activeRegion]}
              onPress={() => setSelectedRegion(null)}
            >
              <Text style={[styles.regionButtonText, selectedRegion === null && styles.activeRegionText]}>全部博物馆</Text>
            </TouchableOpacity>
            
            {regions.map(region => (
              <TouchableOpacity
                key={region.id}
                style={[styles.regionButton, selectedRegion === region.id && styles.activeRegion]}
                onPress={() => setSelectedRegion(region.id)}
              >
                <Text style={[styles.regionButtonText, selectedRegion === region.id && styles.activeRegionText]}>
                  {region.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
      
      {/* 地图控制工具栏 */}
      <View style={styles.toolbarContainer}>
        <TouchableOpacity 
          style={styles.toolButton}
          onPress={refreshMap}
        >
          <Ionicons name="refresh" size={22} color="#8B4513" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.toolButton}
          onPress={() => setIsFullscreen(!isFullscreen)}
        >
          <Ionicons name={isFullscreen ? "contract" : "expand"} size={22} color="#8B4513" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.toolButton}
          onPress={moveToNationalView}
        >
          <Ionicons name="globe-outline" size={22} color="#8B4513" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.toolButton, !userLocation && styles.disabledButton]}
          onPress={moveToUserLocation}
        >
          <Ionicons 
            name="locate" 
            size={22} 
            color={userLocation ? "#8B4513" : "#CCCCCC"} 
          />
          {!userLocation && (
            <View style={styles.warningDot}>
              <Ionicons name="alert-circle" size={10} color="#FF6B6B" />
            </View>
          )}
        </TouchableOpacity>
        
        {selectedRegion && (
          <TouchableOpacity 
            style={styles.toolButton}
            onPress={moveToSelectedRegion}
          >
            <Ionicons name="location" size={22} color="#8B4513" />
          </TouchableOpacity>
        )}
      </View>
      
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#8B4513" />
          <Text style={styles.loadingText}>加载地图中...</Text>
        </View>
      )}
      
      {errorMessage && (
        <View style={styles.errorOverlay}>
          <Text style={styles.errorTitle}>加载失败</Text>
          <Text style={styles.errorMessage}>{errorMessage}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => {
              setIsLoading(true);
              setErrorMessage(null);
              injectRefreshScript();
            }}
          >
            <Text style={styles.retryButtonText}>重试</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F6F0',
  },
  fullscreenContainer: {
    paddingTop: 0,
  },
  webview: {
    flex: 1,
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
  errorOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
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
  retryButton: {
    backgroundColor: '#8B4513',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  // 优化区域选择器样式
  regionSelectorContainer: {
    position: 'absolute',
    top: 50,
    left: 10,
    right: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 5,
    zIndex: 10,
    maxHeight: 120,
  },
  regionHeader: {
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  regionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#8B4513',
  },
  regionSelector: {
    maxHeight: 75,
  },
  regionSelectorContent: {
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  regionButton: {
    backgroundColor: 'white',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  activeRegion: {
    backgroundColor: '#8B4513',
    borderColor: '#8B4513',
  },
  regionButtonText: {
    fontSize: 14,
    color: '#333',
  },
  activeRegionText: {
    color: 'white',
    fontWeight: '500',
  },
  // 工具栏样式
  toolbarContainer: {
    position: 'absolute',
    right: 10,
    top: 170,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 10,
    padding: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 5,
    zIndex: 10,
  },
  toolButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 2,
  },
  disabledButton: {
    opacity: 0.8,
  },
  warningDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 2,
  },
});

export default MapScreen;