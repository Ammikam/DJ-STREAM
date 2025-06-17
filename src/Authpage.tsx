import { useState } from "react";
import { auth, db } from "../config/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { generateToken } from "./auth/token";
import { Navigate, NavLink, useNavigate } from "react-router-dom";
import type { User } from "./App";
import useUser from "./hooks/useUser";

interface AuthPageProps {
  user: User | null;
}

export default function AuthPage({ user }: AuthPageProps) {
  const { setUser } = useUser();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState(""); // Used as userId
  const [role, setRole] = useState("viewer");
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate(); // Assuming you have a custom hook for navigation

  const register = async () => {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const uid = userCredential.user.uid;

    const token = await generateToken(uid, role);
    console.log("Generated token:", token);
    // Store additional data
    await setDoc(doc(db, "users", uid), {
      email,
      userId: uid,
      role,
      token,
    });

    setUser({
      email,
      id: uid,
      role,
      token,
    });

    localStorage.setItem("userId", username);
    localStorage.setItem("role", role);
  };

  const login = async () => {
    console.log("Logging in with email:", email);
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const uid = userCredential.user.uid;

    // 🔁 Fetch user metadata from Firestore
    const userDoc = await getDoc(doc(db, "users", uid));
    if (userDoc.exists()) {
      const userData = userDoc.data();

      setUser({
        email,
        id: uid,
        role,
        token: userData.token || "",
      });
      localStorage.setItem("userId", userData.userId);
      localStorage.setItem("role", userData.role);
    }
  };

  const handleAuth = async () => {
    try {
      isLogin ? login() : register();
      navigate("/stream");
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (user?.email)
    return (
      <>
        <p>You're already signed in</p>
        <NavLink to="/stream">Go to Stream</NavLink>
      </>
    );

  return (
    <div className="flex flex-col gap-2">
      {!isLogin && (
        <>
          <input
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="broadcaster">Broadcaster</option>
            <option value="viewer">Viewer</option>
          </select>
        </>
      )}
      <input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        placeholder="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handleAuth}>{isLogin ? "Login" : "Sign Up"}</button>
      <p onClick={() => setIsLogin(!isLogin)}>
        {isLogin ? "Need an account? Sign Up" : "Have one? Login"}
      </p>
    </div>
  );
}
