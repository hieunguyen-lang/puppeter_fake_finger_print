const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const fs = require('fs');
puppeteer.use(StealthPlugin());
const path = require('path');

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Fake fingerprint giống thật nhất theo thông tin bạn cung cấp
const fakeFingerprint = {
  platform: 'Win32',
  vendor: 'Google Inc.',
  
  deviceMemory: 16,
  maxTouchPoints: 1,
  width: 1920,
  height: 1080,
  devicePixelRatio: 1,
  webglVendor: 'Google Inc. (NVIDIA)',
  webglRenderer: 'ANGLE (NVIDIA, NVIDIA GeForce RTX 3060 Ti Direct3D11 vs_5_0 ps_5_0, D3D11)',
  webglVersion: 'WebGL 1.0 (OpenGL ES 2.0 Chromium)', // Thêm dòng này
  audioSampleRate: 48000,
  timeZone: 'Asia/Ho_Chi_Minh',
  language: 'en-US',
  languages: ['en-US', 'en'],
  hardwareConcurrency: 16,
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36',
  canvasDataUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA', // Bạn có thể thay bằng base64 canvas thật nếu lấy được
  profileName: 'HieuNK Test Profile'
};

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', // Đường dẫn Chrome thật
    userDataDir: './hieunk',
    defaultViewport: null,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--window-size=1280,800'
    ]
  });

  const page = await browser.newPage();

  // Fake fingerprint bằng script JS
  await page.evaluateOnNewDocument(fp => {
     if (!window.chrome) window.chrome = {};

  // Fake chrome.runtime
  window.chrome.runtime = {
  connect: function() {
    throw new TypeError(
      "Error in invocation of runtime.connect(optional string extensionId, optional object connectInfo): " +
      "chrome.runtime.connect() called from a webpage must specify an Extension ID (string) for its first argument."
    );
  },
  sendMessage: function() {
    throw new TypeError(
      "Error in invocation of runtime.sendMessage(optional string extensionId, any message, optional object options, optional function responseCallback): No matching signature."
    );
  },
  id: undefined
};

  // Fake chrome.webstore
  window.chrome.webstore = {
    install: function() {},
    onInstallStageChanged: {},
    onDownloadProgress: {}
  };

  // Fake chrome.csi
  window.chrome.csi = function() { return {}; };

  // Fake chrome.loadTimes
  window.chrome.loadTimes = function() { return {}; };

  // Fake chrome.app
  window.chrome.app = {
    isInstalled: false,
    InstallState: { DISABLED: 'disabled', INSTALLED: 'installed', NOT_INSTALLED: 'not_installed' },
    RunningState: { CANNOT_RUN: 'cannot_run', READY_TO_RUN: 'ready_to_run', RUNNING: 'running' },
    getDetails: function() { return null; },
    getIsInstalled: function() { return false; },
    runningState: function() { return 'running'; }
  };
    // Fake navigator properties
    Object.defineProperty(navigator, 'platform', { get: () => fp.platform });
    Object.defineProperty(navigator, 'userAgent', { get: () => fp.userAgent });
    Object.defineProperty(navigator, 'language', { get: () => fp.language });
    Object.defineProperty(navigator, 'languages', { get: () => fp.languages });
    Object.defineProperty(navigator, 'hardwareConcurrency', { get: () => fp.hardwareConcurrency });
    Object.defineProperty(navigator, 'deviceMemory', { get: () => fp.deviceMemory });
    Object.defineProperty(navigator, 'maxTouchPoints', { get: () => fp.maxTouchPoints });
    Object.defineProperty(navigator, 'vendor', { get: () => fp.vendor });

    // Fake timezone
    Intl.DateTimeFormat = class extends Intl.DateTimeFormat {
      resolvedOptions() {
        return { timeZone: fp.timeZone };
      }
    };

    // Fake screen
    Object.defineProperty(window.screen, 'width', { get: () => fp.width });
    Object.defineProperty(window.screen, 'height', { get: () => fp.height });
    Object.defineProperty(window.screen, 'availWidth', { get: () => fp.width });
    Object.defineProperty(window.screen, 'availHeight', { get: () => fp.height });
    Object.defineProperty(window, 'devicePixelRatio', { get: () => fp.devicePixelRatio });

    // Fake WebGL metadata
    const getParameter = WebGLRenderingContext.prototype.getParameter;
    WebGLRenderingContext.prototype.getParameter = function(parameter) {
      if (parameter === 37445) return fp.webglVendor; // UNMASKED_VENDOR_WEBGL
      if (parameter === 37446) return fp.webglRenderer; // UNMASKED_RENDERER_WEBGL
      if (parameter === 0x1F02) return fp.webglVersion; // VERSION
      return getParameter.call(this, parameter);
    };

    window.OfflineAudioContext = function() { return { sampleRate: fp.audioSampleRate }; };
    window.AudioContext = function() { return { sampleRate: fp.audioSampleRate }; };

    // Fake AudioContext fingerprint (noise)
    const copyToChannel = AudioBuffer.prototype.copyToChannel;
    AudioBuffer.prototype.copyToChannel = function(source, channelNumber, startInChannel) {
      // Thêm nhiễu vào buffer để hash khác đi
      if (source && source.length) {
        for (let i = 0; i < source.length; i++) {
          source[i] = source[i] + (Math.random() - 0.5) * 1e-7;
        }
      }
      return copyToChannel.call(this, source, channelNumber, startInChannel);
    };
    // Fake AudioContext
    window.OfflineAudioContext = function() { return { sampleRate: fp.audioSampleRate }; };

    // Fake fonts (not perfect, but can help)
    document.fonts = {
      check: () => true,
      forEach: () => {},
      size: 0
    };
    // Ẩn webdriver
  Object.defineProperty(navigator, 'webdriver', { get: () => false });

  // Fake plugins
  Object.defineProperty(navigator, 'plugins', {
    get: () => [1, 2, 3, 4, 5]
  });

  // Fake mimeTypes
  Object.defineProperty(navigator, 'mimeTypes', {
    get: () => [1, 2, 3]
  });

  // Fake permissions
  const originalQuery = window.navigator.permissions.query;
  window.navigator.permissions.query = (parameters) =>
    parameters.name === 'notifications'
      ? Promise.resolve({ state: Notification.permission })
      : originalQuery(parameters);

  // Fake outerWidth/outerHeight
  Object.defineProperty(window, 'outerWidth', { get: () => window.innerWidth });
  Object.defineProperty(window, 'outerHeight', { get: () => window.innerHeight });

  // Fake mediaDevices
  navigator.mediaDevices = {
    enumerateDevices: async () => [{ kind: 'audioinput' }, { kind: 'videoinput' }]
  };
    // Fake Bluetooth
    navigator.bluetooth = undefined;

    // Fake WebRTC
    Object.defineProperty(window, 'RTCPeerConnection', { get: () => undefined });

    // Fake Canvas
    const toDataURL = HTMLCanvasElement.prototype.toDataURL;
    HTMLCanvasElement.prototype.toDataURL = function() {
      return fp.canvasDataUrl || toDataURL.apply(this, arguments);
    };
    window.addEventListener('DOMContentLoaded', () => {
      // Thêm tên profile vào góc phải trên cùng
      const div = document.createElement('div');
      div.textContent = `👤 ${fp.profileName}`;
      div.style.position = 'fixed';
      div.style.top = '10px';
      div.style.right = '10px';
      div.style.background = 'rgba(255,255,255,0.9)';
      div.style.color = '#d0021b';
      div.style.fontWeight = 'bold';
      div.style.fontSize = '16px';
      div.style.padding = '6px 16px';
      div.style.zIndex = 99999;
      div.style.borderRadius = '8px';
      div.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
      document.body.appendChild(div);

      // Nếu muốn thêm vào ô search:
      const searchInput = document.querySelector('input[type="search"], input[placeholder*="Tìm kiếm"]');
      if (searchInput) {
        searchInput.value = `[${fp.profileName}] `;
      }
    });
  }, fakeFingerprint);

  await page.goto('https://shopee.vn/', { waitUntil: 'networkidle2' });

  // ...phần code crawl Shopee của bạn...
  console.log("Lấy xong dữ liệu từ Shopee thành công!");
  // await browser.close();
})();
