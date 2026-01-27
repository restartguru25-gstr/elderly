/* eslint-disable no-restricted-globals */
importScripts('https://www.gstatic.com/firebasejs/11.9.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/11.9.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: 'AIzaSyCWV40qsMqCQyLYHEc_wC1S4sXVE9xnH_Q',
  projectId: 'studio-7755060677-3cbb9',
  messagingSenderId: '629445737796',
  appId: '1:629445737796:web:65d6baa909ebed310fab11',
  authDomain: 'studio-7755060677-3cbb9.firebaseapp.com',
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const opts = { body: payload.notification?.body || '', icon: '/favicon.ico' };
  if (self.registration?.showNotification) {
    self.registration.showNotification(payload.notification?.title || 'ElderLink', opts);
  }
});
