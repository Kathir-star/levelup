importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

// Initialize Firebase compat app in service worker with project parameters
firebase.initializeApp({
  apiKey: "AIzaSyDkLYsZiMpoStQbZebCkqsvEonusg0ZumY",
  authDomain: "axon-494807.firebaseapp.com",
  projectId: "axon-494807",
  storageBucket: "axon-494807.firebasestorage.app",
  messagingSenderId: "777634313914",
  appId: "1:777634313914:web:d743cef55d333c4197b483"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Background message: ', payload);
  const notificationTitle = payload.notification?.title || 'LevelUp Update 🚀';
  const notificationOptions = {
    body: payload.notification?.body || 'New version available! Open app to update.',
    icon: 'https://res.cloudinary.com/df2ejdvcz/image/upload/v1778747229/logo_ihy7qo.jpg',
    badge: 'https://res.cloudinary.com/df2ejdvcz/image/upload/v1778747229/logo_ihy7qo.jpg',
    data: {
      click_action: '/',
      ...payload.data
    }
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Watch notification taps to focus application window and force update trigger
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Look for already open instances and focus
      for (const client of clientList) {
        if ('focus' in client) {
          client.postMessage({ type: 'TRIGGER_FORCE_UPDATE' });
          return client.focus();
        }
      }
      // Or open clean new page with URL flag
      if (clients.openWindow) {
        return clients.openWindow('/?update=true');
      }
    })
  );
});
