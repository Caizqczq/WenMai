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
import mapIconUtils from '../../utils/mapIconUtils';

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
  const [markerIconUris, setMarkerIconUris] = useState<Record<string, string>>({});

  // 获取当前筛选后的点位
  const filteredRelicSites = useMemo(() => {
    // 首先筛选出只有博物馆类型的点位
    const museumSites = relicSites.filter(site => site.type === 'museum');
    
    // 然后根据所选地区进一步筛选
    if (!selectedRegion) return museumSites;
    return museumSites.filter(site => site.regionId === selectedRegion);
  }, [relicSites, selectedRegion]);

  // 新增 useEffect: 获取筛选后点位的图标 URI
  useEffect(() => {
    const fetchIconUris = async () => {
      if (filteredRelicSites.length > 0) {
        console.log('开始获取地图标记图标 URI...');
        const uris: Record<string, string> = {};
        // 使用 Promise.all 并行获取所有图标
        await Promise.all(filteredRelicSites.map(async (site) => {
          try {
            // 调用异步函数获取图标 URI (可能是 URL 或 Data URI)
            const uri = await mapIconUtils.getMapIconUrlAsync(site.id, site.type);
            uris[site.id] = uri;
          } catch (error) {
            console.error(`获取点位 ${site.id} (${site.name}) 的图标失败:`, error);
            // 可以设置一个默认或错误图标
            uris[site.id] = mapIconUtils.DEFAULT_ICON; // 使用导入的默认图标
          }
        }));
        setMarkerIconUris(uris);
        console.log('地图标记图标 URI 获取完成:', Object.keys(uris).length, '个');
      }
    };

    fetchIconUris();
  }, [filteredRelicSites]); // 当筛选后的点位变化时重新获取图标

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

  // 生成地图HTML内容 - 现在依赖 markerIconUris
  const generateMapHtml = useMemo(() => {
    console.log('重新生成地图 HTML，点位数量:', filteredRelicSites.length);
    
    // 按区域收集点位，用于高亮城市/区域
    const regionsWithMuseums = new Set<string>();
    filteredRelicSites.forEach(site => {
      if (site.regionId) {
        regionsWithMuseums.add(site.regionId);
      }
    });
    
    // 获取区域名称映射
    const regionIdToName: Record<string, string> = {};
    regions.forEach(region => {
      regionIdToName[region.id] = region.name;
    });
    
    // 创建文字标记代码
    const markersCode = filteredRelicSites.length > 0
      ? filteredRelicSites.map((site, index) => {
        // 根据博物馆中藏品数量调整字体大小和权重
        const hasRelics = site.relicIds && Array.isArray(site.relicIds) && site.relicIds.length > 0;
        const relicCount = hasRelics ? site.relicIds!.length : 0;
        const fontSize = relicCount > 50 ? 14 : relicCount > 20 ? 13 : 12;
        const fontWeight = relicCount > 30 ? 'bold' : 'normal';
        
        // 根据博物馆重要性设置不同的样式
        const isImportant = relicCount > 30;
        
        return `
        // 创建文字标记 - ${site.name}
        var label_${site.id} = new BMap.Label("${site.name}", {
          position: new BMap.Point(${site.longitude}, ${site.latitude}),
          offset: new BMap.Size(-50, -15)
        });
        
        // 设置文字标记样式
        label_${site.id}.setStyle({
          color: "${isImportant ? '#8B4513' : '#555555'}",
          fontSize: "${fontSize}px",
          fontWeight: "${fontWeight}",
          border: "1px solid ${isImportant ? '#D2B48C' : '#E4D5B7'}",
          padding: "${isImportant ? '5px 10px' : '4px 8px'}",
          borderRadius: "10px",
          backgroundColor: "rgba(255, 255, 255, ${isImportant ? 0.95 : 0.9})",
          boxShadow: "${isImportant ? '0 3px 6px rgba(0,0,0,0.15)' : '0 2px 4px rgba(0,0,0,0.1)'}",
          zIndex: ${isImportant ? 9999 : 9000}
        });
        
        map.addOverlay(label_${site.id});
        
        // 为重要博物馆添加黄色圆点标记
        ${isImportant ? `
        var circle_${site.id} = new BMap.Circle(
          new BMap.Point(${site.longitude}, ${site.latitude}), 
          1000, 
          {
            strokeColor: "#FF8C00",
            strokeWeight: 2,
            strokeOpacity: 0.8,
            fillColor: "#FFD700",
            fillOpacity: 0.3
          }
        );
        map.addOverlay(circle_${site.id});
        ` : ''}
        
        // 为标记添加点击事件
        label_${site.id}.addEventListener('click', function() {
          // 创建自定义信息窗口内容
          var infoContent = \`
            <div style="padding: 15px; max-width: 300px; font-family: 'Microsoft YaHei', Arial, sans-serif; box-shadow: 0 2px 8px rgba(0,0,0,0.1); border-radius: 6px;">
              <div style="font-weight: bold; font-size: 16px; color: #8B4513; margin-bottom: 12px; border-bottom: 1px solid #e0e0e0; padding-bottom: 10px;">${site.name}</div>
              \${${site.description ? `"<div style='font-size: 14px; line-height: 1.6; margin-bottom: 12px; color: #333;'>${site.description}</div>"` : "''"}}
              \${${site.type ? `"<div style='font-size: 12px; color: #666; margin-bottom: 10px;'><span style='background-color: #f5f0e6; padding: 3px 8px; border-radius: 12px; color: #8B4513;'>${site.type === 'museum' ? '博物馆' : (site.type === 'site' ? '遗址' : '纪念碑')}</span></div>"` : "''"}}
              \${${site.relicIds && site.relicIds.length > 0 ? 
                `"<div style='font-size: 13px; color: #666; margin-bottom: 12px;'>收藏 <b>${site.relicIds.length}</b> 件文物</div><button onclick=\\"window.ReactNativeWebView.postMessage(JSON.stringify({type: 'viewDetails', id: '${site.id}'}));\\" style='background-color: #8B4513; color: white; border: none; border-radius: 20px; padding: 8px 16px; margin-top: 8px; float: right; font-size: 14px; cursor: pointer; box-shadow: 0 2px 4px rgba(139,69,19,0.2);'>查看博物馆详情</button>"` 
                : 
                `"<button onclick=\\"window.ReactNativeWebView.postMessage(JSON.stringify({type: 'viewDetails', id: '${site.id}'}));\\" style='background-color: #8B4513; color: white; border: none; border-radius: 20px; padding: 8px 16px; margin-top: 8px; float: right; font-size: 14px; cursor: pointer; box-shadow: 0 2px 4px rgba(139,69,19,0.2);'>查看博物馆详情</button>"`
              }}
              <div style="clear: both;"></div>
            </div>
          \`;
          
          var infoWindow = new BMap.InfoWindow(infoContent, {
            width: 300,
            height: 0,
            enableMessage: false,
            borderColor: "#f5f0e6",
            padding: 0
          });
          
          map.openInfoWindow(infoWindow, new BMap.Point(${site.longitude}, ${site.latitude}));
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'markerClick', 
            id: '${site.id}',
            name: '${site.name}'
          }));
        });
      `}).join('\n')
      : ''; // 如果没有点位，则不生成标记代码
    
    // 高亮区域代码
    const highlightRegionsCode = regionsWithMuseums.size > 0 ? `
      // 高亮有博物馆的区域 - 使用简化方法
      var highlightTimer = setTimeout(function() {
        // 确保地图已经完全加载
        if (!map || typeof map.getZoom !== 'function') {
          console.log('地图实例未就绪，延迟执行高亮代码');
          clearTimeout(highlightTimer);
          setTimeout(arguments.callee, 1000);
          return;
        }

        // 定义高亮区域的通用样式
        var highlightPolygonStyle = {
          strokeColor: "#FF8C00",
          strokeWeight: 2,
          strokeOpacity: 0.8,
          fillColor: "#FFD700",
          fillOpacity: 0.3
        };
        
        // 已创建高亮区域的城市集合
        var highlightedCities = {};
        
        // 为每个博物馆创建一个高亮圆圈
        ${filteredRelicSites.map(site => `
          // 创建唯一标识，避免重复创建高亮区域
          var cityKey = "${site.name.replace(/博物馆|纪念馆|展览馆/g, '')}";
          
          // 如果该城市还没有高亮，则创建一个高亮圆圈
          if (!highlightedCities[cityKey]) {
            console.log("创建城市高亮:", cityKey);
            
            // 创建城市高亮圆圈
            var cityCircle = new BMap.Circle(
              new BMap.Point(${site.longitude}, ${site.latitude}),
              25000, // 25公里半径，覆盖城市主要区域
              {
                strokeColor: "#FF8C00",
                strokeWeight: 2,
                strokeOpacity: 0.8,
                fillColor: "#FFD700",
                fillOpacity: 0.2
              }
            );
            map.addOverlay(cityCircle);
            
            // 如果是重要博物馆，添加城市名称标签
            ${(site.relicIds && site.relicIds.length > 30) ? `
            var cityLabel = new BMap.Label(cityKey, {
              position: new BMap.Point(${site.longitude - 0.05}, ${site.latitude + 0.02}),
              offset: new BMap.Size(0, 0)
            });
            cityLabel.setStyle({
              color: "#FF8C00",
              fontSize: "16px",
              fontWeight: "bold",
              border: "none",
              backgroundColor: "transparent"
            });
            map.addOverlay(cityLabel);
            ` : ''}
            
            // 标记该城市已高亮
            highlightedCities[cityKey] = true;
          }
        `).join('\n')}
      }, 1500);
    ` : '';
    
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
        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23ffffff' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='12' cy='12' r='10' fill='%232196F3'/%3E%3Ccircle cx='12' cy='12' r='3' fill='white'/%3E%3C/svg%3E", 
        new BMap.Size(36, 36),
        {
          imageSize: new BMap.Size(24, 24),
          anchor: new BMap.Size(12, 12)
        }
      );
      
      var userPoint = new BMap.Point(${userLocation.coords.longitude}, ${userLocation.coords.latitude});
      
      // 添加一个更美观的位置标记
      var userMarker = new BMap.Marker(userPoint, {
        icon: userIcon,
        enableMassClear: false
      });
      map.addOverlay(userMarker);
      
      // 添加位置精度圆圈
      var circle = new BMap.Circle(userPoint, 100, {
        strokeColor: "rgba(33, 150, 243, 0.6)",
        strokeWeight: 2,
        strokeOpacity: 0.8,
        fillColor: "rgba(33, 150, 243, 0.2)",
        fillOpacity: 0.4
      });
      map.addOverlay(circle);
      
      // 添加脉动动画效果
      var pulse = new BMap.Circle(userPoint, 15, {
        strokeColor: "rgba(33, 150, 243, 0.6)",
        strokeWeight: 2,
        strokeOpacity: 0.8,
        fillColor: "rgba(33, 150, 243, 0.4)",
        fillOpacity: 0.4
      });
      map.addOverlay(pulse);
      
      // 实现脉动效果
      var pulsate = function() {
        var currentRadius = 15;
        var maxRadius = 50;
        var timer = setInterval(function() {
          currentRadius += 2;
          pulse.setRadius(currentRadius);
          if (currentRadius >= maxRadius) {
            clearInterval(timer);
            map.removeOverlay(pulse);
            setTimeout(pulsate, 100);
          }
        }, 50);
      };
      pulsate();
      
      // 为用户位置添加信息窗口
      var userInfoWindow = new BMap.InfoWindow(
        "<div style='padding: 10px; text-align: center; font-family: Microsoft YaHei, sans-serif;'>" + 
        "<div style='font-weight: bold; margin-bottom: 5px;'>当前位置</div>" +
        "<div style='font-size: 12px; color: #666;'>经度: " + ${userLocation.coords.longitude}.toFixed(6) + "</div>" +
        "<div style='font-size: 12px; color: #666;'>纬度: " + ${userLocation.coords.latitude}.toFixed(6) + "</div>" +
        "</div>",
        {
          width: 180,
          height: 0,
          enableMessage: false,
          borderColor: "#f5f0e6",
          padding: 0
        }
      );
      
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
            font-family: 'Microsoft YaHei', Arial, sans-serif;
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
          /* 美化地图控件 */
          .BMap_stdMpZoom {
            border-radius: 4px;
            overflow: hidden;
            box-shadow: 0 2px 6px rgba(0,0,0,0.15);
          }
          .BMap_stdMpZoomBtn {
            background-color: white !important;
          }
          .BMap_stdMpZoomBtn:hover {
            background-color: #f5f0e6 !important;
          }
          .BMap_scaleCtrl {
            background-color: rgba(255,255,255,0.8) !important;
            border-radius: 2px;
            padding: 2px;
          }
        </style>
        <script type="text/javascript" src="https://api.map.baidu.com/api?v=3.0&ak=${BAIDU_MAP_API_KEY}"></script>
      </head>
      <body>
        <div id="container"></div>
        
        <script>
          function log(msg) {
            console.log(msg);
            try {
              window.ReactNativeWebView.postMessage('LOG:' + msg);
            } catch(e) {}
          }
          
          function initMap() {
            try {
              log('初始化地图...');
              var map = new BMap.Map('container', {
                enableMapClick: true // 允许地图点击
              });
              window.map = map; // 保存全局引用以便后续注入脚本使用
              var point = new BMap.Point(${defaultCenter});
              map.centerAndZoom(point, ${defaultZoom});
              
              // 缩放限制设置 - 允许捏合缩放但限制最大级别
              var minZoom = 4;  // 最小缩放级别
              var maxZoom = 7;  // 最大缩放级别
              
              // 设置缩放级别限制
              map.setMinZoom(minZoom);
              map.setMaxZoom(maxZoom);
              
              // 允许所有缩放功能
              map.enableScrollWheelZoom();    // 启用滚轮缩放
              map.enableDoubleClickZoom();    // 启用双击缩放
              map.enablePinchToZoom();        // 启用捏合缩放
              map.disableContinuousZoom();    // 禁用连续缩放，可以更好地控制缩放效果
              
              // 限制缩放 - 对多个事件进行监听
              function restrictZoom() {
                var currentZoom = map.getZoom();
                // 强制限制在我们允许的范围内
                if (currentZoom < minZoom) {
                  map.setZoom(minZoom);
                } else if (currentZoom > maxZoom) {
                  map.setZoom(maxZoom);
                }
              }
              
              // 监听缩放结束事件
              map.addEventListener('zoomend', restrictZoom);
              
              // 监听拖动结束事件（有时拖动会导致缩放变化）
              map.addEventListener('dragend', restrictZoom);
              
              // 监听地图加载完成事件
              map.addEventListener('tilesloaded', restrictZoom);
              
              // 移除阻止多点触摸和手势事件的代码，允许捏合缩放
              // 但任然监听缩放事件以确保不超出限制范围
              
              // 添加简化后的缩放控件
              map.addControl(new BMap.NavigationControl({
                anchor: BMAP_ANCHOR_TOP_RIGHT,
                type: BMAP_NAVIGATION_CONTROL_SMALL
              }));
              
              map.addControl(new BMap.ScaleControl({
                anchor: BMAP_ANCHOR_BOTTOM_RIGHT,
                offset: new BMap.Size(10, 10)
              }));
              
              // 其他地图设置
              map.disableInertialDragging();   // 禁用惯性拖拽
              
              // 自定义地图样式
              var styleJson = [
                {
                  "featureType": "all",
                  "elementType": "all",
                  "stylers": {
                    "lightness": 10,
                    "saturation": -100
                  }
                },
                {
                  "featureType": "land",
                  "elementType": "geometry",
                  "stylers": {
                    "color": "#f5f0e6"
                  }
                },
                {
                  "featureType": "water",
                  "elementType": "geometry",
                  "stylers": {
                    "color": "#cad7e4"
                  }
                },
                {
                  "featureType": "building",
                  "elementType": "geometry",
                  "stylers": {
                    "color": "#e4e0d5"
                  }
                },
                {
                  "featureType": "green",
                  "elementType": "geometry",
                  "stylers": {
                    "color": "#e2efe0"
                  }
                },
                {
                  "featureType": "highway",
                  "elementType": "geometry.fill",
                  "stylers": {
                    "color": "#e3d5bc"
                  }
                },
                {
                  "featureType": "arterial",
                  "elementType": "geometry.fill",
                  "stylers": {
                    "color": "#e7dbc8"
                  }
                },
                {
                  "featureType": "poi",
                  "elementType": "all",
                  "stylers": {
                    "visibility": "on"
                  }
                },
                {
                  "featureType": "poilabel",
                  "elementType": "labels",
                  "stylers": {
                    "visibility": "off"
                  }
                },
                {
                  "featureType": "districtlabel",
                  "elementType": "labels",
                  "stylers": {
                    "visibility": "on"
                  }
                },
                {
                  "featureType": "railway",
                  "elementType": "geometry",
                  "stylers": {
                    "visibility": "off"
                  }
                }
              ];
              map.setMapStyleV2({styleJson: styleJson});
              
              ${markersCode}
              
              ${userLocationCode}
              
              ${highlightRegionsCode}
              
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
  }, [filteredRelicSites, regions, selectedRegion, userLocation, markerIconUris, BAIDU_MAP_API_KEY]); // 依赖项更新

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
          // 查找点位并跳转到博物馆详情页
          const site = relicSites.find(site => site.id === jsonData.id);
          if (site) {
            // 直接跳转到博物馆详情页
            router.push(`/museum/${site.id}` as any);
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
  const moveToPoint = (longitude: number, latitude: number, zoom: number = 6) => {
    if (!webViewRef.current) return;
    
    const script = `
      try {
        if (window.map) {
          var point = new BMap.Point(${longitude}, ${latitude});
          
          // 确保缩放级别在允许的范围内
          var minZoom = 4;
          var maxZoom = 8; // 使用相同的限制
          var validZoom = Math.max(minZoom, Math.min(maxZoom, ${zoom}));
          
          map.centerAndZoom(point, validZoom);
          console.log('已移动到新位置，缩放级别:', validZoom);
        } else {
          console.log('地图实例不可用');
        }
      } catch(e) {
        console.error('移动位置出错:', e.message);
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
      // 限制最大缩放级别为8
      const zoom = Math.min(region.zoom || 6, 8);
      moveToPoint(region.longitude, region.latitude, zoom);
    }
  };
  
  // 移动到全国视图
  const moveToNationalView = () => {
    moveToPoint(104.1954, 35.8617, 4); // 中国中心点，使用最小缩放级别
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
    
    // 使用适中的缩放级别
    moveToPoint(userLocation.coords.longitude, userLocation.coords.latitude, 8);
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
          "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23ffffff' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='12' cy='12' r='10' fill='%232196F3'/%3E%3Ccircle cx='12' cy='12' r='3' fill='white'/%3E%3C/svg%3E", 
          new BMap.Size(36, 36),
          {
            imageSize: new BMap.Size(24, 24),
            anchor: new BMap.Size(12, 12)
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
          strokeColor: "rgba(33, 150, 243, 0.6)",
          strokeWeight: 2,
          strokeOpacity: 0.8,
          fillColor: "rgba(33, 150, 243, 0.2)",
          fillOpacity: 0.4
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

      {/* 添加审图号和版权信息显示 */}
      <View style={styles.mapInfoContainer}>
        <Text style={styles.mapInfoText}>
          地图审图号：GS(2022)460号|测绘资质：甲测资字11111342号
        </Text>
      </View>
      
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
    marginBottom: 70,
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
  mapInfoContainer: {
    position: 'absolute',
    bottom: 70,
    left: 70,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 3,
    zIndex: 10,
  },
  mapInfoText: {
    fontSize: 10,
    color: '#666666',
  },
});

export default MapScreen;