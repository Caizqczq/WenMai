# 文脉 - 中国文物互动探索应用

"文脉"是一款融合地域、人物和历史事件的文物类移动应用，通过交互式游戏体验让用户了解文物背后的历史故事。

## 应用特色

- **地图导航**：通过中国地图界面，探索各地区的代表性文物
- **文物百科**：详细展示文物信息、历史背景和相关知识
- **互动故事**：第一人称视角体验文物背后的历史故事
- **成就系统**：完成各种任务获取积分和成就徽章

## 技术架构

- **前端框架**：React Native (Expo)
- **导航系统**：React Navigation
- **状态管理**：Redux + Redux Toolkit
- **数据存储**：AsyncStorage + 远程API

## 项目结构

```
/app
  /(tabs)        - 底部标签页
  /screens       - 应用页面组件
  /components    - UI组件
  /store         - Redux状态管理
  /services      - API服务
  /models        - 数据模型
/assets
  /images        - 图片资源
  /fonts         - 字体资源
```

## 主要页面

1. **启动页**：展示应用logo和品牌名称
2. **地图页**：中国地图交互界面，显示各地区文物分布
3. **区域详情页**：展示特定地区的文化特色和代表性文物
4. **文物详情页**：展示文物的详细信息、图片和历史背景
5. **互动故事页**：第一人称视角的互动体验，了解文物背后的故事
6. **文物库页**：按分类浏览所有文物
7. **个人中心页**：用户收藏、浏览历史和成就展示

## 开发指南

### 环境配置

1. 确保已安装Node.js (v14+)和npm
2. 安装Expo CLI: `npm install -g expo-cli`
3. 克隆项目: `git clone [仓库地址]`
4. 安装依赖: `cd WenHua && npm install`
5. 启动开发服务器: `npm start`

### 运行应用

- **Android**: `npm run android`
- **iOS**: `npm run ios`
- **Web**: `npm run web`

## 参与贡献

1. Fork 项目
2. 创建特性分支: `git checkout -b feature/your-feature`
3. 提交更改: `git commit -m 'Add some feature'`
4. 推送到分支: `git push origin feature/your-feature`
5. 提交Pull Request

## 许可证

本项目采用 MIT 许可证
