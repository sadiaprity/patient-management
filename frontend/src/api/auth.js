import client from "./client";

export const login = async (mobile, password) => {
  const response = await client.post("/auth/login/", { mobile, password });

  const { access, refresh } = response.data;

  if (access) localStorage.setItem("accessToken", access);
  if (refresh) localStorage.setItem("refreshToken", refresh);

  return response.data;
};

export const logout = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  window.location.href = "/login";
};
