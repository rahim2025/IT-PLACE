import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../utils/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState("loading"); // "loading" | "ready"

  const refresh = useCallback(async () => {
    try {
      const data = await api.get("/auth/me");
      setUser(data.user);
    } catch {
      setUser(null);
    } finally {
      setStatus("ready");
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const login = useCallback(async ({ email, password, rememberMe }) => {
    const data = await api.post("/auth/login", { email, password, rememberMe });
    setUser(data.user);
    return data.user;
  }, []);

  const signup = useCallback(async ({ name, email, password, confirmPassword }) => {
    // No session is issued here — the account stays unverified until the
    // emailed link is clicked, which is what actually logs the user in.
    return api.post("/auth/signup", { name, email, password, confirmPassword });
  }, []);

  const logout = useCallback(async () => {
    await api.post("/auth/logout");
    setUser(null);
  }, []);

  const verifyEmail = useCallback(async (email, code) => {
    const data = await api.post("/auth/verify-email", { email, code });
    setUser(data.user);
    return data.user;
  }, []);

  const resendVerification = useCallback((email) => api.post("/auth/resend-verification", { email }), []);

  const forgotPassword = useCallback((email) => api.post("/auth/forgot-password", { email }), []);

  const resetPassword = useCallback(
    (token, password, confirmPassword) => api.post(`/auth/reset-password/${token}`, { password, confirmPassword }),
    []
  );

  const updatePassword = useCallback(
    (currentPassword, newPassword, confirmPassword) =>
      api.put("/auth/update-password", { currentPassword, newPassword, confirmPassword }),
    []
  );

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isAdmin: user?.role === "admin",
      loading: status === "loading",
      login,
      signup,
      logout,
      refresh,
      verifyEmail,
      resendVerification,
      forgotPassword,
      resetPassword,
      updatePassword,
    }),
    [
      user,
      status,
      login,
      signup,
      logout,
      refresh,
      verifyEmail,
      resendVerification,
      forgotPassword,
      resetPassword,
      updatePassword,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
