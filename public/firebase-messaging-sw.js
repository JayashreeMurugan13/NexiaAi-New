// Firebase Cloud Messaging Service Worker
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBnHba2lvT-FEkXbb5cS8PPRnCuCUNdVCk",
  authDomain: "nexiai-59052.firebaseapp.com",
  projectId: "nexiai-59052",
  storageBucket: "nexiai-59052.firebasestorage.app",
  messagingSenderId: "76408736177",
  appId: "1:76408736177:web:6e26e50914d262e4571590"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: 'nexia-habit-reminder',
    requireInteraction: true,
    actions: [
      {
        action: 'open',
        title: 'Check Habits'
      }
    ]
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});