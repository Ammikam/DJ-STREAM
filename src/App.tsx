import { useState, useEffect } from "react";
import {
  StreamVideo,
  StreamVideoClient,
  LivestreamPlayer,
  StreamCall,
  LivestreamLayout,
  CallControls,
} from "@stream-io/video-react-sdk";

const apiKey = "cynaurb9zvhy";
const viewerToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiZGpfdXNlcl9pZCIsInJvbGUiOiJicm9hZGNhc3RlciIsImNhbGxfY2lkcyI6WyJsaXZlc3RyZWFtOmxpdmVzdHJlYW1fNzcyZTMwYTctZDBlOC00YzExLWE4NWYtZjI1ZWYyNTZiM2MwIl0sImlzcyI6IkBzdHJlYW0taW8vZGFzaGJvYXJkIiwiaWF0IjoxNzUwMDYwMDgyLCJleHAiOjE3NTAwNjM2ODJ9.YIjf4g5rYSbmfvWhTdhpNB7VjtsTfhetdlp6TfYDft0";
const callId = "livestream_772e30a7-d0e8-4c11-a85f-f25ef256b3c0";

const App = () => {
  const [isBroadcaster, setIsBroadcaster] = useState(false);
  const [token, setToken] = useState(viewerToken);
  const [error, setError] = useState<string | null>(null);
  const user = isBroadcaster
    ? { id: "dj_user_id", role: "broadcaster" }
    : { type: "anonymous" };
  const client = new StreamVideoClient({ apiKey, user, token });
  const call = client.call("livestream", callId);

  useEffect(() => {
    if (isBroadcaster) {
      fetch("http://localhost:3000/generate-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: "dj_user_id", role: "broadcaster" }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.error) {
            throw new Error(data.details || data.error);
          }
          setToken(data.token);
          call.join({ create: true }).catch((err: any) => {
            console.error("Failed to join call:", err);
            setError("Failed to start broadcast");
          });
        })
        .catch((err) => {
          console.error("Failed to fetch token:", err);
          setError("Failed to get broadcaster token");
        });
    } else {
      setToken(viewerToken);
      setError(null);
    }
  }, [isBroadcaster, call]);

  return (
    <StreamVideo client={client}>
      {error && <div style={{ color: "red" }}>{error}</div>}
      {isBroadcaster ? (
        <StreamCall call={call}>
          <LivestreamLayout />
          <CallControls />
        </StreamCall>
      ) : (
        <LivestreamPlayer callType="livestream" callId={callId} />
      )}
      <button onClick={() => setIsBroadcaster(!isBroadcaster)}>
        Switch to {isBroadcaster ? "Viewer" : "Broadcaster"} Mode
      </button>
    </StreamVideo>
  );
};

export default App;
