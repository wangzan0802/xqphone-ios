// ===== APK 运行时配置（打包时覆盖 assets/www/config.js）=====
// 修改后重新执行打包脚本，或直接替换 APK 内 assets/www/config.js。
// 手机需与下列地址同网段（或 VPN）。

// ---- 后端接口地址 ----
// 需求主接口（/app/**，原 /reqapi 代理的后端）
var reqApi = "http://192.168.80.18:9090";
// 调度/方案接口（原 apil）
var schedApi = "http://192.168.1.147:8088";
// 规划接口（原 apip）
var planApi = "http://192.168.1.147:8082";

// ---- 离线演示模式 ----
// MOCK_ONLY=true：完全离线，不向后端发任何请求，所有页面直接展示演示数据
// （改回 false 或删除此行：优先连真实后端，连不上时再降级为演示数据，由 MOCK_ON_FAIL 控制）
var MOCK_ONLY = true;
// MOCK_ON_FAIL=true：后端连不上时自动展示演示数据，联网后自动恢复真实数据
var MOCK_ON_FAIL = true;

// ---- 地图底图 ----
// 在线底图（高德道路图，无需 key，手机可直接上外网即可）
// 注意：高德瓦片为 GCJ-02 坐标，与需求的 WGS84 经纬度存在约 500m 系统偏移，仅作演示用途；
// 如需无偏移请改用天地图（WGS84，需申请 tk）：https://console.tianditu.gov.cn
// mapLayers = [
//   { url: "https://t{s}.tianditu.gov.cn/DataServer?T=img_w&x={x}&y={y}&l={z}&tk=你的tk", subdomains: "01234567", maxNativeZoom: 18 },
//   { url: "https://t{s}.tianditu.gov.cn/DataServer?T=cia_w&x={x}&y={y}&l={z}&tk=你的tk", subdomains: "01234567", maxNativeZoom: 18 }
// ];
mapLayers = [
  { url: "https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}", subdomains: "1234", maxNativeZoom: 18 }
];
// 卫星影像（高德，同样有 GCJ-02 偏移）：
// mapLayers = [ { url: "https://webst0{s}.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}", subdomains: "1234", maxNativeZoom: 18 } ];
// 方式二：单图层 XYZ 模板（mapLayers 未配置时生效，这里保留内网瓦片作为备用）
var mapApi = "http://192.168.100.237:30899/mapdata/{z}/{x}/{y}.png";
