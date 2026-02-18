// Service Worker for background notifications
self.addEventListener('install', (event) => {
  console.log('Service Worker installed');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activated');
  event.waitUntil(self.clients.claim());
});

// Handle background sync for notifications
self.addEventListener('sync', (event) => {
  if (event.tag === 'habit-reminder') {
    event.waitUntil(sendHabitReminder());
  }
});

// Send habit reminder notification
async function sendHabitReminder() {
  try {
    // Get habits from IndexedDB or localStorage
    const habits = await getStoredHabits();
    const incompleteHabits = habits.filter(h => !h.completedToday);
    const currentHour = new Date().getHours();
    
    // Only send during active hours
    if (currentHour >= 8 && currentHour <= 22 && incompleteHabits.length > 0) {
      const messages = [
        `🎯 ${incompleteHabits.length} habits waiting! Time to make progress!`,
        `⏰ Don't forget your goals! ${incompleteHabits.length} habits need attention.`,
        `🌟 Your future self will thank you! Complete your ${incompleteHabits.length} habits.`,
        `💪 Stay consistent! ${incompleteHabits.length} habits ready to be conquered.`,
        `🚀 Keep building! ${incompleteHabits.length} habits are waiting for you.`
      ];
      
      const randomMessage = messages[Math.floor(Math.random() * messages.length)];
      
      await self.registration.showNotification('NEXIA - Goal Reminder', {
        body: randomMessage,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'habit-reminder',
        requireInteraction: true,
        actions: [
          {
            action: 'open',
            title: 'Check Habits'
          },
          {
            action: 'dismiss',
            title: 'Later'
          }
        ]
      });
    }
  } catch (error) {
    console.error('Error sending habit reminder:', error);
  }
}

// Get habits from storage
async function getStoredHabits() {
  try {
    // Try to get from localStorage via message to main thread
    const clients = await self.clients.matchAll();
    if (clients.length > 0) {
      clients[0].postMessage({ type: 'GET_HABITS' });
      return new Promise((resolve) => {
        self.addEventListener('message', (event) => {
          if (event.data.type === 'HABITS_DATA') {
            resolve(event.data.habits || []);
          }
        });
      });
    }
    return [];
  } catch (error) {
    console.error('Error getting stored habits:', error);
    return [];
  }
}

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      self.clients.openWindow('/')
    );
  }
});

// Handle messages from main thread
self.addEventListener('message', (event) => {
  if (event.data.type === 'SCHEDULE_REMINDER') {
    // Schedule background sync
    self.registration.sync.register('habit-reminder');
  }
});