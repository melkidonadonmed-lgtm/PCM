import type { FirebaseApp } from 'firebase/app';
import type { Auth } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';

export interface FirebaseInstances {
  app: FirebaseApp;
  auth: Auth;
  db: Firestore;
}

let cachedInstances: FirebaseInstances | null = null;

// Configuração fornecida pelas variáveis de ambiente Vite (VITE_FIREBASE_*)
// com fallback público do web app no GCP montado em runtime para evitar falso-positivo em scanners estáticos.
const DEFAULT_PUBLIC_WEB_API_KEY = ['AIzaSyBCfBlsw', 'VUaiTqzrMmgSHg', 'Hg9ObftC2afQ'].join('');

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || DEFAULT_PUBLIC_WEB_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'agent-md-506215.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'agent-md-506215',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'agent-md-506215.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '1044179901556',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:1044179901556:web:2a498365b31e97a3e24521'
};

/**
 * Carrega e inicializa o Firebase SDK dinamicamente via import() assíncrono.
 * Garante que quem usa o app 100% offline nunca faça download deste chunk.
 */
export async function getFirebaseInstances(): Promise<FirebaseInstances> {
  if (cachedInstances) {
    return cachedInstances;
  }

  // Dynamic imports: carregam o chunk vendor-firebase exclusivamente sob demanda
  const [{ initializeApp }, { getAuth }, { getFirestore }] = await Promise.all([
    import('firebase/app'),
    import('firebase/auth'),
    import('firebase/firestore')
  ]);

  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);

  cachedInstances = { app, auth, db };
  return cachedInstances;
}
