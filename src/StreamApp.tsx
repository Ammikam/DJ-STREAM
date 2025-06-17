import { useEffect, useState } from "react";
import {
  StreamVideo,
  StreamVideoClient,
  StreamCall,
  LivestreamLayout,
  CallControls,
  LivestreamPlayer,
} from "@stream-io/video-react-sdk";
import { auth } from "../config/firebase";
import { signOut } from "firebase/auth";
import { Navigate } from "react-router-dom";
import useUser from "./hooks/useUser";
import { generateToken } from "./auth/token";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../config/firebase";

const apiKey = "cynaurb9zvhy";
const callId = "livestream_772e30a7-d0e8-4c11-a85f-f25ef256b3c0";

// Define types
type Role = "viewer" | "broadcaster";

interface TokenStore {
  [key: string]: string;
  viewer?: string;
  broadcaster?: string;
}

interface UserDoc {
  tokens?: TokenStore;
  role?: Role;
  updatedAt?: Date;
}

const StreamApp = () => {
  const [client, setClient] = useState<StreamVideoClient | null>(null);
  const [call, setCall] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [role, setRole] = useState<Role>(
    (localStorage.getItem("role") as Role) || "viewer"
  );
  const { user } = useUser();

  const isBroadcaster = role === "broadcaster";

  useEffect(() => {
    const setup = async () => {
      console.log("Setup started with user:", user);

      if (!user) {
        setError("No authenticated user.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        console.log("Requesting token for:", {
          userId: user.id,
          role: user.role,
        });

        const res = await fetch("http://localhost:3000/generate-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user.id,
            role: user.role, // Make sure user.role exists
          }),
        });

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const data = await res.json();
        console.log("Token response:", data);

        if (data.error || !data.token) {
          throw new Error(data.error || "Token missing");
        }

        const newClient = new StreamVideoClient({
          apiKey,
          user,
          token: data.token,
        });

        const newCall = newClient.call("livestream", callId);

        setClient(newClient);
        setCall(newCall);

        if (isBroadcaster) {
          console.log("Joining call as broadcaster");
          await newCall.join({ create: true });
        } else {
          console.log("Joining call as viewer");
          await newCall.join();
        }

        setLoading(false);
      } catch (err: unknown) {
        console.error("Error initializing video session:", err);
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error occurred";
        setError(`Failed to connect: ${errorMessage}`);
        setLoading(false);
      }
    };

    setup();

    return () => {
      console.log("Cleaning up client connection");
      if (client) {
        client.disconnectUser().catch((err) => {
          console.error("Error disconnecting:", err);
        });
      }
    };
  }, [role, user, isBroadcaster]); // Added isBroadcaster to dependencies

  const switchRole = async () => {
    console.log("Switching role from", role);

    const newRole: Role = isBroadcaster ? "viewer" : "broadcaster";
    const userId = user?.id || localStorage.getItem("userId") || "anon";

    try {
      const userRef = doc(db, "users", userId);
      const userSnap = await getDoc(userRef);

      let tokens: TokenStore = {};
      if (userSnap.exists()) {
        const userData = userSnap.data() as UserDoc;
        tokens = userData.tokens || {};
      }

      // If token for the new role doesn't exist, generate and save it
      if (!tokens[newRole]) {
        console.log("Generating new token for role:", newRole);

        const res = await fetch("http://localhost:3000/generate-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, role: newRole }),
        });

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const tokenResponse = await res.json();

        if (!tokenResponse.token) {
          throw new Error("Token not received from server");
        }

        tokens[newRole] = tokenResponse.token;

        const updateData: UserDoc = {
          tokens,
          role: newRole,
          updatedAt: new Date(),
        };

        await setDoc(userRef, updateData, { merge: true });
      }

      localStorage.setItem("role", newRole);

      // Clean up current client
      if (client) {
        await client.disconnectUser();
      }

      setClient(null);
      setCall(null);
      setRole(newRole);

      console.log("Role switched to:", newRole);
    } catch (err: unknown) {
      console.error("Failed to switch role:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error occurred";
      setError(`Failed to switch role: ${errorMessage}`);
    }
  };

  const handleSignOut = async () => {
    try {
      // Clean up client connection before signing out
      if (client) {
        await client.disconnectUser();
      }

      await signOut(auth);
      localStorage.removeItem("role");
      localStorage.removeItem("userId");
      window.location.reload();
    } catch (error: unknown) {
      console.error("Error signing out:", error);
      setError("Failed to sign out");
    }
  };

  const genToken = async () => {
    if (!user) {
      alert("You must be logged in to generate a token");
      return;
    }

    try {
      console.log("Generating token for user:", user.id);
      const token = await generateToken(user.id, "broadcaster");
      console.log("Generated token:", token);
    } catch (err: unknown) {
      console.error("Error generating token:", err);
    }
  };

  // Debug user state
  console.log("Current state:", {
    user,
    role,
    loading,
    error,
    client: !!client,
    call: !!call,
  });

  if (!user) return <Navigate to="/Authpage" />;

  return (
    <div style={{ padding: "20px" }}>
      <div style={{ marginBottom: "20px" }}>
        <h2>Stream App Debug</h2>
        <p>User: {user?.id || "No user"}</p>
        <p>Role: {role}</p>
        <p>Is Broadcaster: {isBroadcaster ? "Yes" : "No"}</p>
        <p>Client Connected: {client ? "Yes" : "No"}</p>
        <p>Call Ready: {call ? "Yes" : "No"}</p>
      </div>

      <button
        onClick={genToken}
        style={{ marginRight: "10px", padding: "8px 16px" }}
      >
        Get token
      </button>

      {loading && <p>Loading...</p>}
      {error && (
        <div
          style={{
            color: "red",
            padding: "10px",
            background: "#ffe6e6",
            border: "1px solid #ff9999",
            borderRadius: "4px",
          }}
        >
          <strong>Error:</strong> {error}
        </div>
      )}

      {client && call && (
        <StreamVideo client={client}>
          <div style={{ marginBottom: "20px" }}>
            {isBroadcaster ? (
              <StreamCall call={call}>
                <LivestreamLayout />
                <CallControls />
              </StreamCall>
            ) : (
              <LivestreamPlayer callType="livestream" callId={callId} />
            )}
          </div>

          <button
            onClick={switchRole}
            disabled={loading}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded disabled:bg-gray-400"
          >
            Switch to {isBroadcaster ? "Viewer" : "Broadcaster"}
          </button>
        </StreamVideo>
      )}

      <button
        onClick={handleSignOut}
        className="mt-4 ml-2 px-4 py-2 bg-red-600 text-white rounded"
      >
        Sign Out
      </button>
    </div>
  );
};

export default StreamApp;
