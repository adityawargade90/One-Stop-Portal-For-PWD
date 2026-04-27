/**
 * useAuth hook — Firebase Authentication provider
 *
 * Drop-in replacement for the previous Supabase-based auth context.
 * The public interface (user, loading, signOut) is unchanged so that
 * all consuming components continue to work without modification.
 */

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { User } from "firebase/auth";
import { watchAuthState, signOut as firebaseSignOut } from "@/integrations/firebase";

// ─── Context Shape ────────────────────────────────────────────────────────────

interface AuthContextType {
  /** Currently signed-in Firebase user, or null when logged out */
  user: User | null;
  /** True while the initial auth state is being resolved */
  loading: boolean;
  /** Sign the current user out */
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
});

// ─── Provider ────────────────────────────────────────────────────────────────

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Subscribe to Firebase auth state changes
    const unsubscribe = watchAuthState((firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signOut = async () => {
    await firebaseSignOut();
  };

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
