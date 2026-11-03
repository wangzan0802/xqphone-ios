# 不用 $99 开发者账号：免费 Apple ID + Sideloadly 安装 iOS App

> 原理：iOS 强制要求 App 带 **Apple 签发的签名**才允许安装，但"签名"不等于"付费账号"。
> 任何 Apple ID（免费）都自带一个 **Personal Team**，可以签 7 天有效期的开发版 App。
> 本目录提供的是一条完整链路：
>
> **GitHub 免费 macOS runner 编译原生壳 → 产出未签名 ipa → Windows 用 Sideloadly 以你的免费 Apple ID 重签 → 装进 iPhone**

---

## 一、先认清限制（决定你是否接受）

| 项目 | 免费 Apple ID（本方案） | 付费 $99 账号 |
|---|---|---|
| App 有效期 | **7 天**，到期需重签（可自动续签） | 1 年（Ad Hoc/Development） |
| 同时安装数 | 最多 **3 个**自签 App | 无限制 |
| 新建 App ID | 每 7 天最多 **10 个** | 无限制 |
| 设备数量 | 你的设备即可（无需登记 UDID） | Ad Hoc 限 100 台 |
| 需要电脑 | **需要**：重签时电脑要能连到手机（USB 或同 WiFi） | 不需要 |
| 费用 | 0 元 | $99/年 + 云打包费 |

结论：**适合演示/内部试用，不适合长期交付给客户**。给客户长期用，还是 $99 账号 + TestFlight。

---

## 二、本地准备（Windows）

### 1. 把最新 H5 同步进来

```bash
cd A:\十三五前端\移动端\phone
bash build-ios-h5.sh          # 构建 H5（config.js 已是 MOCK_ONLY=true 离线模式）
bash ios-wrapper/sync-www.sh  # 同步到 ios-wrapper/www
```

### 2. 推到 GitHub 建仓库（免费）

`ios-wrapper/` 是一个**独立仓库**（自带 `.github/workflows`），只需推这一个目录：

1. 打开 https://github.com/new ，仓库名如 `xqphone-ios`，选 **Private** 或 Public 均可
   - Public 仓库的 macOS 构建完全免费
   - Private 仓库每月 2000 分钟额度，macOS 按 10 倍计费 → 约 200 分钟/月，够用 6–10 次构建
2. 本地执行（把 URL 换成你的）：

```bash
cd A:\十三五前端\移动端\phone\ios-wrapper
git init
git add .
git commit -m "feat: iOS WKWebView 壳工程 + 云构建"
git branch -M main
git remote add origin https://github.com/<你的账号>/xqphone-ios.git
git push -u origin main
```

> 若 git 首次使用需要身份，先执行：
> `git config --global user.name "你的名字"` 和 `git config --global user.email "你的邮箱"`

### 3. 触发构建

- 进入仓库 → **Actions** 标签 → 左侧 `build-unsigned-ipa` → 右侧 **Run workflow** → Run
- 约 3–5 分钟完成（首次含 brew 安装 xcodegen，稍慢）
- 构建成功后，在该次运行页面底部 **Artifacts** 下载 `XQPhone-unsigned-ipa.zip`，解压得到 `XQPhone-unsigned.ipa`

---

## 三、用 Sideloadly 签名并安装

### 1. Windows 端安装依赖
1. 从 https://sideloadly.io 下载 Windows 版（免费，Patreon 支持）
2. 先装 **Apple 官网的 iTunes 与 iCloud（"网页版"安装包，不是 Microsoft Store 版）**
   - Store 版会导致 Sideloadly 找不到设备，务必卸载 Store 版再装官网版
3. 数据线连接 iPhone → 手机上点"信任此电脑"

### 2. 签名安装
1. 打开 Sideloadly，顶部应能识别到你的设备
2. 把 `XQPhone-unsigned.ipa` 拖进窗口
3. `Apple account` 填你的 **Apple ID（免费账号即可）**
4. 点 **Start** → 输入密码（若开了双重认证，填收到的验证码；部分账号需用 App 专用密码）
5. 勾选 **Automatic app refreshing**（可选，自动续签，见下）
6. 装完后手机上：**设置 → 通用 → VPN与设备管理 → 你的 Apple ID → 信任**
7. iOS 16 及以上还要开 **设置 → 隐私与安全性 → 开发者模式** → 重启手机

打开 App，应该直接进入"卫星需求服务"首页，纯离线演示数据。

---

## 四、7 天过期怎么办

三选一：

1. **Sideloadly 自动续签**：安装时勾选自动刷新，电脑保持联网且能通过 USB/WiFi 连到手机，后台守护进程会在到期前重签（需在 iTunes 里开启"通过 WiFi 同步"）
2. **手动重签**：同一 ipa、同一 Apple ID 再点一次 Start，覆盖安装，**数据保留**
3. **到期后重新装**：会丢本地缓存数据（本项目无后端，影响可忽略）

---

## 五、工程结构说明

```
ios-wrapper/
├── project.yml                    # XcodeGen 工程描述（CI 里生成 .xcodeproj）
├── Sources/
│   ├── AppDelegate.swift          # 启动入口
│   └── WebViewController.swift    # WKWebView 容器：加载内置 www/index.html
├── Resources/
│   ├── Info.plist                 # 显示名、Bundle ID、竖屏、ATS 允许 http、隐私描述
│   └── LaunchScreen.storyboard    # 启动图（缺失会导致 App 以 3.5 寸尺寸渲染）
├── www/                           # H5 产物（由 sync-www.sh 同步，33 MB）
├── sync-www.sh                    # 同步脚本
└── .github/workflows/build-unsigned-ipa.yml
```

关键实现点（`WebViewController.swift`）：

- `loadFileURL(_:allowingReadAccessTo:)` 加载内置 www，`map.html` 等相对路径页面正常工作
- 打开 `allowFileAccessFromFileURLs` / `allowUniversalAccessFromFileURLs`，否则 file:// 页面无法发 http 请求
- 实现 `WKUIDelegate` 的 alert/confirm，保证 Vant/Mint 弹窗正常
- 竖屏锁定 + `UIRequiresFullScreen`

---

## 六、已知风险与排查

| 现象 | 原因 / 处理 |
|---|---|
| CI 报 `xcodegen: command not found` | brew 安装超时，重跑一次 workflow |
| CI 报找不到 scheme | `project.yml` 的 target 名必须是 `XQPhone`；改过名字要同步改 workflow |
| Sideloadly 提示 "无法读取 IPA / 无效的包" | 确认 ipa 内含 Mach-O：`unzip -l` 看 `Payload/XQPhone.app/XQPhone` 大小应 > 100 KB |
| Sideloadly 提示 Apple ID 认证失败 | 到 appleid.apple.com 生成 **App 专用密码**再用；确认账号未开启高级数据保护 |
| 装完点开闪退 | 未信任证书 / 未开开发者模式；或 bundle id 冲突（重装前先删旧 App） |
| 打开白屏 | www 未打进包：检查 `unzip -l` 是否有 `Payload/XQPhone.app/www/index.html` |
| 地图不显示 | 瓦片走高德公网，手机需能上外网 |
| 提示"超过 3 个 App" | 免费账号上限，删掉其它自签 App |

> **重要**：本工程在 Windows 上无法编译验证，Swift/Xcode 部分是按标准 WKWebView 容器写法编写的，
> 首次 CI 构建如报错，请把 Actions 日志里 `xcodebuild` 的 error 行发我，我按实际报错修正。

---

## 七、如果这条链路走不通的备选

1. **PWA 加主屏**（零成本，已可用）：`bash serve-ios-h5.sh` → iPhone Safari 打开 → 添加到主屏幕
2. **AltStore**（同一免费 Apple ID 机制，手机上刷新，需 Windows 常开 AltServer）
3. **$99 个人账号 + HBuilderX 云打包**：见 `../README-苹果开发者账号申请.md`，一劳永逸
