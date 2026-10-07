const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

export function getToken() {
  return localStorage.getItem("token");
}

export function getUser() {
  try {
    return JSON.parse(localStorage.getItem("user"));
  } catch {
    return null;
  }
}

export function isLoggedIn() {
  return Boolean(getToken());
}

export function getDisplayName() {
  const user = getUser();

  if (!user) {
    return "";
  }

  return user.name || (user.email ? user.email.split("@")[0] : "");
}

export function saveUser(user) {
  localStorage.setItem("user", JSON.stringify(user));
}

export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

export async function authFetch(path, options = {}) {
  const token = getToken();

  if (!token) {
    logout();
    window.location.replace("/login");
    throw new Error("Authentication required");
  }

  const headers = {
    ...options.headers,
    Authorization: `Bearer ${token}`,
  };

  if (options.body && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    logout();
    window.location.replace("/login");
    throw new Error("Session expired");
  }

  return response;
}
