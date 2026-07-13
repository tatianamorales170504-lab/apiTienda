import admin from 'firebase-admin';

if (admin.apps.length === 0) {

    const serviceAccount = JSON.parse(
        process.env.FIREBASE_SERVICE_ACCOUNT.replace(/\\n/g, '\n')
    );

    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });

}

export default admin;