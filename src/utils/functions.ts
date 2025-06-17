import type { User as Firebase } from "firebase/auth";
import type { User } from "../App";

export function formatUser(user: Firebase | null): User {
  return {
    email: user?.email || "",
    id: user?.uid || "",
    role: localStorage.getItem("role") || "viewer",
    token: "",
  };
}
