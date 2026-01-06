// Store d'authentification avec Firebase + synchronisation backend
import { create } from "zustand";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { auth } from "../auth/firebase";
import { authService } from "../services/authService";

export const useAuthStore = create((set, get) => ({
  user: null,
  loading: true,
  error: null,

  // Initialise le listener Firebase
  initAuth: () => {
    return onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        set({
          user: {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
          },
          loading: false,
        });
      } else {
        set({ user: null, loading: false });
      }
    });
  },

  // Inscription avec Firebase + enregistrement backend
  register: async (email, password, role = "renter") => {
    set({ loading: true, error: null });
    try {
      // 1. Inscription Firebase
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      
      // 2. Enregistrement dans le backend .NET
      await authService.registerInBackend(email, password, role);

      set({
        user: {
          uid: credential.user.uid,
          email: credential.user.email,
          role,
        },
        loading: false,
      });

      return credential.user;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Connexion avec Firebase
  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const credential = await signInWithEmailAndPassword(auth, email, password);
      
      set({
        user: {
          uid: credential.user.uid,
          email: credential.user.email,
        },
        loading: false,
      });

      return credential.user;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Déconnexion
  logout: async () => {
    set({ loading: true });
    try {
      await signOut(auth);
      set({ user: null, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Clear error
  clearError: () => set({ error: null }),
}));

export default useAuthStore;
