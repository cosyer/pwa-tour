const cacheName = "lvmama_7.10.8";
const filesToCache = ["./index.html", "./scripts/demo.js", "./styles/demo.css"];

// 注册->安装 apiname e.waitUntil()
self.addEventListener("install", e => {
  console.log("[ServiceWorker] Install");
  e.waitUntil(
    // keyname
    caches
      .open(cacheName)
      .then(cache => {
        console.log("[ServiceWorker] Caching app shell");
        return cache.addAll(filesToCache);
      })
      // 可加
      .then(() => {
        console.log("skip waiting");
        return self.skipWaiting();
      })
  );
});

// 激活 缓存更新
self.addEventListener("activate", e => {
  console.log("[ServiceWorker] Activate");
  e.waitUntil(
    caches
      .keys()
      .then(keyList =>
        Promise.all(
          keyList.map(key => {
            if (key !== cacheName) {
              console.log("[ServiceWorker] Removing old cache", key);
              return caches.delete(key);
            }
          })
        )
      )
      // 可加
      .then(() => {
        return self.clients.matchAll().then(clients => {
          if (clients && clients.length) {
            clients.forEach((v, i) => {
              // 发送字符串'sw.update'
              v.postMessage("sw " + i + " update");
            });
          }
        });
      })
  );
  return self.clients.claim();
});

// 添加事件监听捕获请求
self.addEventListener("fetch", e => {
  console.log("[Service Worker] Fetch", e.request.url);
  if (/logo\.png$/.test(e.request.url)) {
    // 作为替代来响应请求
    // e.respondWith(
    //     fetch('http://localhost:5500/images/user.png')
    // );
    if (e.request.headers.get("save-data")) {
      // 节省流量
      // 自定义响应
      e.respondWith(
        new Response("", {
          status: 407,
          statusText: "save data"
        })
      );
    }
  } else {
    // 缓存中存在从缓存中加载
    e.respondWith(
      caches.match(e.request).then(response => response || fetch(e.request))
    );
    // e.respondWith(
    //     caches.match(e.request)
    //         .then(response => {
    //             if(response) {
    //                 return response; // || fetch(e.request)
    //             }
    //             // 新的内容添加到缓存中
    //             // 复制请求 请求是一个流 只能使用一次
    //             var requestToCache = e.request.clone();
    //             return fetch(requestToCache).then(function(response){
    //                 if(!response || response.status !==200) {
    //                     // 错误信息立即返回
    //                     return response;
    //                 }
    //                 var responseToCache = response.clone();
    //                 // 将响应添加到缓存中
    //                 caches.open(cacheName).then(function (cache){
    //                     cache.put(requestToCache, responseToCache);
    //                 })
    //             })
    //         })
    // );
  }
});

// 点击通知事件
self.addEventListener("notificationclick", e => {
  console.log("[Service Worker] Notification click Received.");
  e.notification.close();
  if (e.action === "eTicket") {
    e.waitUntil(clients.openWindow("./index.html?action=eTicket"));
  } else if (e.action === "lvmm") {
    e.waitUntil(clients.openWindow("./index.html?action=lvmm"));
  } else {
    e.waitUntil(clients.openWindow("./index.html"));
  }
});

self.addEventListener("message", e => {
  console.log("message222222", e.data);
});
