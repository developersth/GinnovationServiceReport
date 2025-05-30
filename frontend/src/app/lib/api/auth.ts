// src/lib/auth.ts
// import { User } from "../../types"; // Uncomment if User type is used elsewhere in this file
// import { API_BASE_URL } from "../utils"; // Uncomment if API_BASE_URL is imported from a separate utils file

// No longer importing jwt_decode
import { API_BASE_URL } from "../utils";
// UPDATED: JwtPayload interface to accurately reflect the ACTUAL JWT claims
interface JwtPayload {
  nameid: string; // User ID from the JWT
  unique_name: string; // The username from the JWT
  role?: string; // Role from the JWT
  exp?: number; // Expiration time (Unix timestamp) from the JWT
  nbf?: number; // Not Before time (Unix timestamp) from the JWT
  iat?: number; // Issued At time (Unix timestamp) from the JWT
}

/**
 * Decodes a JWT token manually without external libraries.
 * It expects a standard JWT format: header.payload.signature.
 * IMPORTANT: This function only decodes the payload; it DOES NOT verify the token's signature.
 * Token verification for security MUST be done on the backend.
 */
const decodeJwtManually = <T>(token: string): T => {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) {
      throw new Error("Invalid JWT format: token must have 3 parts (header.payload.signature).");
    }

    const payload = parts[1];
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const paddedBase64 = base64.padEnd(base64.length + (4 - base64.length % 4) % 4, '=');

    const decodedPayloadString = decodeURIComponent(
      atob(paddedBase64)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );

    return JSON.parse(decodedPayloadString) as T;
  } catch (e) {
    console.error("Failed to decode JWT:", e);
    throw new Error("Failed to decode JWT token. It might be malformed or invalid.");
  }
};

export const login = async (
  username: string,
  password: string
): Promise<boolean> => {
  try {

    const response = await fetch(`${API_BASE_URL}/api/Auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || "ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง"
      );
    }

    const data = await response.json();
    const token = data.token;

    if (!token) {
      throw new Error("ไม่ได้รับโทเค็นจากเซิร์ฟเวอร์ (No token received from server).");
    }

    // Decode the JWT to get claims like 'exp' and 'role'
    const decoded = decodeJwtManually<JwtPayload>(token);

    // Optional: Basic client-side check for token expiration
    if (decoded.exp && Date.now() >= decoded.exp * 1000) {
      console.warn("JWT token has expired on the client side.");
      throw new Error("โทเค็นหมดอายุ กรุณาเข้าสู่ระบบอีกครั้ง (Token has expired. Please log in again).");
    }

    // Store token and user details from the DIRECT API response
    localStorage.setItem("token", token);
    localStorage.setItem("username", data.username); // Directly from API response
    localStorage.setItem("name", data.name);         // Directly from API response

    // Store user role from the DECODED JWT (if present)
    if (decoded.role) {
      localStorage.setItem("userRole", decoded.role);
    }

    localStorage.setItem("isLoggedIn", "true");

    return true;
  } catch (error: any) {
    console.error("Login failed:", error.message || error);
    return Promise.reject(error.message || "เกิดข้อผิดพลาดในการเข้าสู่ระบบ (Login failed due to an unexpected error).");
  }
};

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("username");
  localStorage.removeItem("name"); // Remove 'name' from localStorage
  localStorage.removeItem("userRole");
  localStorage.removeItem("isLoggedIn");
};

export const checkAuth = (): boolean => {
  const isLoggedInFlag = localStorage.getItem("isLoggedIn") === "true";
  const token = localStorage.getItem("token");

  if (!isLoggedInFlag || !token) {
    return false;
  }

  try {
    const decoded = decodeJwtManually<JwtPayload>(token);
    if (decoded.exp && Date.now() >= decoded.exp * 1000) {
      console.warn("Stored JWT token has expired.");
      logout();
      return false;
    }
  } catch (e) {
    console.error("Invalid token found in localStorage:", e);
    logout();
    return false;
  }

  return true;
};


export const getUsername = (): string | null => {
  return localStorage.getItem("username");
};

export const getName = (): string | null => {
  return localStorage.getItem("name");
};

export const getUserRole = (): string | null => {
  return localStorage.getItem("userRole");
};