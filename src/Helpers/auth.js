const API_URL = import.meta.env.VITE_API_URL || "http://192.168.8.171:5000";

let sessionTimer = null;

export function logout() {
  localStorage.removeItem("user");
  window.location.reload();
}

export function isTokenExpired(token, bufferSeconds = 30) {
  if (!token) return true;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const now = Date.now() / 1000;
    return payload.exp < now + bufferSeconds;
  } catch {
    return true;
  }
}

export function scheduleSessionExpiryCheck(token) {
  if (sessionTimer) {
    clearTimeout(sessionTimer);
  }
  if (!token) {
    return;
  }

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const msUntilRefresh = payload.exp * 1000 - Date.now() - 30_000;

    sessionTimer = setTimeout(() => {
      getToken();
    }, Math.max(0, msUntilRefresh));
  } catch {
    logout();
  }
}

export async function getToken() {
  const user = localStorage.getItem("user");
  let token = user ? JSON.parse(user).token : null;

  if (!token) {
    if (user) {
      logout();
    }
    return null;
  }

  if (isTokenExpired(token)) {
    try {
      const res = await fetch(`${API_URL}/refresh-token`, {
        method: "POST",
        credentials: "include",
      });

      if (!res.ok) {
        logout();
        return null;
      }

      const data = await res.json();
      localStorage.setItem(
        "user",
        JSON.stringify({ ...JSON.parse(user), token: data.accessToken })
      );
      token = data.accessToken;
    } catch (err) {
      console.error("Error refreshing token:", err);
      logout();
      return null;
    }
  }

  scheduleSessionExpiryCheck(token);
  return token;
}
