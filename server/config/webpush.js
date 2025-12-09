const webpush = require('web-push');
const vapidPublicKey = process.env.VAPID_PUBLIC_KEY; 
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY; 

if (vapidPublicKey && vapidPrivateKey) {
    webpush.setVapidDetails(
        'mailto:l4track@ya.ru', 
        vapidPublicKey,
        vapidPrivateKey
    );
} else {
    console.warn('VAPID keys not found. Push notifications will not work.');
}

module.exports = webpush;