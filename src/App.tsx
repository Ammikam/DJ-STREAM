import {
  LivestreamPlayer,
  StreamVideo,
  StreamVideoClient,
  StreamCall,
} from "@stream-io/video-react-sdk";
import type { User } from "@stream-io/video-client";

const apiKey = "cynaurb9zvhy";
const token =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJAc3RyZWFtLWlvL2Rhc2hib2FyZCIsImlhdCI6MTc0OTczMDkyNCwiZXhwIjoxNzQ5ODE3MzI0LCJ1c2VyX2lkIjoiIWFub24iLCJyb2xlIjoidmlld2VyIiwiY2FsbF9jaWRzIjpbImxpdmVzdHJlYW06bGl2ZXN0cmVhbV83NzJlMzBhNy1kMGU4LTRjMTEtYTg1Zi1mMjVlZjI1NmIzYzAiXX0.V0Pi_3nvkvVPs_FeaGh5BI3RyzI7dhXQfGTMhxo6mJw";
const callId = "livestream_772e30a7-d0e8-4c11-a85f-f25ef256b3c0";

const user: User = { type: "anonymous" };
const client = new StreamVideoClient({ apiKey, user, token });
const call = client.call("livestream", callId);

export default function App() {
  return (
    <StreamVideo client={client}>
      <LivestreamPlayer callType="livestream" callId={callId} />
    </StreamVideo>
  );
}
