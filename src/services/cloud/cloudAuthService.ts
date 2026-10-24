import { getFirebaseInstances } from './firebaseClient';
import type { User } from 'firebase/auth';
import { storageService } from '../storageService';

export interface DoctorUserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

type AuthCallback = (user: DoctorUserProfile | null) => void;

const CLOUD_AUTH_ACTIVE_KEY = 'prescmed_cloud_auth_active';

class CloudAuthService {
  private currentUser: DoctorUserProfile | null = null;
  private listeners: Set<AuthCallback> = new Set();
  private isInitialized = false;

  /**
   * Dispara o fluxo de autenticação com a conta Google via Popup.
   */
  async loginWithGoogle(): Promise<DoctorUserProfile> {
    const { auth } = await getFirebaseInstances();
    const { GoogleAuthProvider, signInWithPopup } = await import('firebase/auth');

    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });

    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    this.currentUser = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL
    };

    storageService.saveRawString(CLOUD_AUTH_ACTIVE_KEY, 'true');

    this.notifyListeners();
    return this.currentUser;
  }

  /**
   * Encerra a sessão ativa no Firebase.
   * Quando `options.clearLocalSession` for verdadeiro (ex.: encerramento de plantão em computador compartilhado),
   * higieniza também os dados de paciente, receita e rascunhos clínicos no `localStorage`.
   */
  async logout(options?: { clearLocalSession?: boolean }): Promise<void> {
    try {
      const { auth } = await getFirebaseInstances();
      const { signOut } = await import('firebase/auth');
      await signOut(auth);
    } catch (err) {
      console.warn('[CloudAuth] Falha ao desconectar sessão Firebase:', err);
    } finally {
      this.currentUser = null;
      storageService.removeItem(CLOUD_AUTH_ACTIVE_KEY);
      if (options?.clearLocalSession) {
        [
          'prescmed_patient',
          'prescmed_prescription',
          'prescmed_exams',
          'prescmed_exam_indication',
          'prescmed_certificate',
          'prescmed_referral',
          'prescmed_draft_referral',
          'prescmed_draft_certificate',
        ].forEach((key) => storageService.removeItem(key));
      }
      this.notifyListeners();
    }
  }

  /**
   * Inscreve a interface para escutar mudanças no estado do usuário.
   * Se o usuário nunca tiver logado, não baixa o chunk do Firebase no boot.
   */
  async subscribe(callback: AuthCallback): Promise<() => void> {
    this.listeners.add(callback);
    callback(this.currentUser);

    const hasPreviousSession = typeof window !== 'undefined' && localStorage.getItem(CLOUD_AUTH_ACTIVE_KEY) === 'true';

    if (!this.isInitialized && hasPreviousSession) {
      this.isInitialized = true;
      try {
        const { auth } = await getFirebaseInstances();
        const { onAuthStateChanged } = await import('firebase/auth');

        onAuthStateChanged(auth, (user: User | null) => {
          if (user) {
            this.currentUser = {
              uid: user.uid,
              email: user.email,
              displayName: user.displayName,
              photoURL: user.photoURL
            };
          } else {
            this.currentUser = null;
            storageService.removeItem(CLOUD_AUTH_ACTIVE_KEY);
          }
          this.notifyListeners();
        });
      } catch (err) {
        console.warn('[CloudAuth] Modo local ativo ou offline. Firebase não carregado.');
      }
    }

    return () => {
      this.listeners.delete(callback);
    };
  }

  getCurrentUser(): DoctorUserProfile | null {
    return this.currentUser;
  }

  private notifyListeners(): void {
    this.listeners.forEach(cb => cb(this.currentUser));
  }
}

export const cloudAuthService = new CloudAuthService();
