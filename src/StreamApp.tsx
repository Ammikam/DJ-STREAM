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
import { signOut, onAuthStateChanged } from "firebase/auth";
import type { User } from "firebase/auth";
import { Navigate } from "react-router-dom";
import useUser from "./hooks/useUser";

const apiKey = "cynaurb9zvhy";
const callId = "livestream_772e30a7-d0e8-4c11-a85f-f25ef256b3c0";

const StreamApp = () => {
  const [client, setClient] = useState<StreamVideoClient | null>(null);
  const [call, setCall] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [role, setRole] = useState(localStorage.getItem("role") || "viewer");
  const { user } = useUser();

  const isBroadcaster = role === "broadcaster";

  useEffect(() => {
    const setup = async () => {
      if (!user) {
        setError("No authenticated user.");
        // navigate("/Authpage");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      // const user = {
      //   id: user.uid, // you can use email instead if preferred
      //   role,
      // };

      try {
        const res = await fetch("http://localhost:3000/generate-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user.id,
            role: user.role,
          }),
        });

        const data = await res.json();
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
          await newCall.join({ create: true });
        }

        setLoading(false);
      } catch (err: any) {
        console.error("Error initializing video session:", err);
        setError("Failed to connect. Please try again.");
        setLoading(false);
      }
    };

    setup();

    return () => {
      client?.disconnectUser().catch(() => {});
    };
  }, [role, user]);

  const switchRole = () => {
    const newRole = isBroadcaster ? "viewer" : "broadcaster";
    localStorage.setItem("role", newRole);
    setClient(null);
    setCall(null);
    setRole(newRole);
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem("role");
      window.location.reload();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  if (!user) return <Navigate to="/Authpage" />;

  return (
    <>
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {client && call && (
        <StreamVideo client={client}>
          {isBroadcaster ? (
            <StreamCall call={call}>
              <LivestreamLayout />
              <CallControls />
            </StreamCall>
          ) : (
            <LivestreamPlayer callType="livestream" callId={callId} />
          )}
          <button
            onClick={switchRole}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
          >
            Switch to {isBroadcaster ? "Viewer" : "Broadcaster"}
          </button>
        </StreamVideo>
      )}
      <button
        onClick={handleSignOut}
        className="mt-4 px-4 py-2 bg-red-600 text-white rounded"
      >
        Sign Out
      </button>
    </>
  );
};

export default StreamApp;
