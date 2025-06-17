import { useEffect, useState } from "react";
import { auth } from "../config/firebase";
import { onAuthStateChanged } from "firebase/auth";
import AuthPage from "./Authpage";
import StreamApp from "./StreamApp.tsx";
import { formatUser } from "./utils/functions.ts";
import { Route, Routes } from "react-router-dom";
import UserContext from "./contexts/UserContext.ts";

export interface User {
  email: string;
  id: string;
  role: string;
  token: string;
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  console.log("user", user);
  useEffect(() => {
    return onAuthStateChanged(auth, (user) => {
      if (user) setUser(formatUser(user));
    });
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      <Routes>
        <Route path="/Authpage" element={<AuthPage user={user} />} />
        <Route path="/stream" element={<StreamApp />} />
      </Routes>
    </UserContext.Provider>
  );
}
