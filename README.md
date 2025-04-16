# 文脉 - 中国文物互动探索应用

"文脉"是一款融合地域、人物和历史事件的文物类移动应用，通过交互式游戏体验让用户了解文物背后的历史故事。

## 应用特色

- **地图导航**：通过中国地图界面，探索各地区的代表性文物
- **文物百科**：详细展示文物信息、历史背景和相关知识
- **互动故事**：第一人称视角体验文物背后的历史故事 (互动式)
- **扫描识别**: 通过手机扫描快速识别文物
- **点亮足迹**: 记录用户通过扫描发现的文物
- **成就系统**：完成各种任务获取积分和成就徽章

## 技术架构

- **前端框架**：React Native (Expo)
- **导航系统**：Expo Router (基于文件系统的路由)
- **状态管理**：(根据实际情况填写，例如 Context API, Zustand, Redux 等)
- **数据存储**：(根据实际情况填写，例如 AsyncStorage, MMKV, SQLite 等) + 远程API

## 项目结构

```
/app
  /(tabs)           - 底部 Tab 导航页面 (探索, 文物, 收藏, 我的)
  /screens          - 其他独立页面组件 (如 StoryExperienceScreen)
  /story/[id].tsx   - 互动故事体验页面
  /relic/[id].tsx   - 文物详情页面 (推测)
  /museum/[id].tsx  - 博物馆详情页面 (推测)
  /region/[id].tsx  - 区域详情页面 (推测)
  /scan.tsx         - 扫描识别页面
  /map.tsx          - 地图页面
  /_layout.tsx      - 应用根布局和全局配置
  /index.tsx        - 应用入口 (通常重定向到 Tab 首页)
/assets
  /images           - 图片资源
  /fonts            - 字体资源
/components
  /story            - 互动故事相关组件 (对话框, 选择, 角色头像等)
  /ui               - 通用 UI 组件
  /home             - 首页相关组件 (推测)
  /RelicDetailHeader.tsx - 文物详情页头部 (推测)
  ...               - 其他可复用组件
/constants          - 常量定义 (如颜色, API 地址等)
/data               - 数据管理 (服务, 类型定义, 模拟数据等)
/hooks              - 自定义 Hooks
/utils              - 工具函数
```

*(注意: `android` 和 `ios` 目录是在执行本地构建的 `prebuild` 步骤时生成的，通常不包含在版本控制中，已被添加到 `.gitignore`)*

## 主要页面/功能流

1.  **启动页 (`splash.tsx`)**: 应用加载时的初始展示。
2.  **底部 Tab 导航 (`app/(tabs)`)**:
    *   `探索 (explore.tsx)`: 发现新内容、推荐故事或文物。
    *   `文物 (relics.tsx)`: 文物列表、分类、搜索。
    *   `收藏 (collection.tsx)`: 用户收藏的文物、故事等。
    *   `我的 (profile.tsx)`: 用户信息、设置、点亮的文物足迹、成就。
3.  **地图 (`map.tsx`)**: 显示地理位置相关的文物或博物馆信息。
4.  **扫描识别 (`scan.tsx`)**: 启动相机进行文物识别。
5.  **互动故事 (`app/story/[id].tsx` + `StoryExperienceScreen`)**: 沉浸式的互动叙事体验。
6.  **文物详情 (`app/relic/[id].tsx` 推测)**: 展示单个文物的详细信息和相关故事入口。
7.  **博物馆/区域详情 (推测)**: 展示特定博物馆或区域的信息。

## 开发指南

### 环境配置

1.  确保已安装 Node.js (推荐 LTS 版本) 和 npm/yarn。
2.  安装 Expo CLI: `npm install -g expo-cli`
3.  克隆项目: `git clone [仓库地址]`
4.  安装依赖: `cd [项目目录] && npm install` (或 `yarn install`)
5.  (可选) 如果需要原生模块或特定配置，可能需要安装 Watchman (macOS/Linux) 和 CocoaPods (macOS for iOS)。

### 运行应用 (开发模式)

使用 Expo Go 应用在真机或模拟器上快速运行和调试：

```bash
npm start
# 或者
yarn start
```

然后根据终端提示操作：
- **Android**: 扫描二维码 (使用 Expo Go 应用) 或按 `a` (如果在连接的设备/模拟器上运行)。
- **iOS**: 扫描二维码 (使用 Expo Go 应用) 或按 `i` (如果在连接的设备/模拟器上运行)。
- **Web**: 按 `w`。

## 本地构建安装包 (Local Build)

如果您需要生成独立的安装包 (APK/AAB 或 IPA) 并在没有 Expo Go 的情况下运行，或者需要包含自定义原生代码，可以进行本地构建。

**警告:** 本地构建需要配置完整的原生开发环境 (Android SDK, Xcode 等)，过程相对复杂。

### 1. 生成原生项目 (Prebuild)

首先，使用 Expo Prebuild 命令在您的项目中生成 `android` 和 `ios` 目录。这将把您的 Expo 配置转换为原生项目文件。
**这些生成的目录 (`android/` 和 `ios/`) 包含了特定平台的代码和配置，通常不应提交到 Git，我们已将它们添加到了 `.gitignore` 文件中。**

```bash
npx expo prebuild
```

**注意:**
*   运行 `prebuild` 前，请确保您的代码没有错误，并且所有依赖都已正确安装。
*   `prebuild` 会修改 `.gitignore` 文件，建议在运行前提交所有更改。
*   每次更改了 `app.json/app.config.js` 中的原生配置或安装/卸载了包含原生代码的库后，通常需要重新运行 `prebuild` (可以先删除 `android` 和 `ios` 目录，或者使用 `--clean` 参数: `npx expo prebuild --clean`)。

### 2. 构建 Android 安装包 (APK/AAB)

**需要:** 安装配置好 Android Studio 和 Android SDK。

进入 `android` 目录，使用 Gradle 进行构建：

```bash
cd android

# 构建 Debug APK (用于测试)
./gradlew assembleDebug

# 构建 Release AAB (用于上传 Google Play)
# 需要配置签名密钥，请参考 Android 官方文档
./gradlew bundleRelease

# 构建 Release APK
# ./gradlew assembleRelease

cd ..
```

构建成功后，APK 文件通常位于 `android/app/build/outputs/apk/debug/` 或 `android/app/build/outputs/apk/release/`，AAB 文件位于 `android/app/build/outputs/bundle/release/`。

### 3. 构建 iOS 安装包 (IPA)

**需要:** macOS 系统和安装配置好 Xcode。

使用 Xcode 打开 `ios` 目录下的 `.xcworkspace` 文件：

```bash
open ios/WenMai.xcworkspace
# (将 WenMai 替换为您的实际项目名)
```

在 Xcode 中：
1.  选择您的目标设备或 "Any iOS Device (arm64)".
2.  配置好开发者账号、Bundle Identifier、签名证书和描述文件。
3.  选择菜单栏的 `Product` > `Archive`.
4.  归档成功后，会弹出 Organizer 窗口。
5.  在 Organizer 窗口中，选择刚刚归档的版本，点击 `Distribute App`.
6.  根据您的分发目标（App Store Connect, Ad Hoc, Development 等）选择相应的选项并按提示操作，最终会生成 IPA 文件。

## 参与贡献

1. Fork 项目
2. 创建特性分支: `git checkout -b feature/your-feature`
3. 提交更改: `git commit -m 'Add some feature'`
4. 推送到分支: `git push origin feature/your-feature`
5. 提交Pull Request

## 许可证

本项目采用 MIT 许可证
