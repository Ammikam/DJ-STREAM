import {
  StreamVideoClient,
  StreamCall,
  LivestreamLayout,
  CallControls,
} from '@stream-io/video-react-sdk';

interface BroadcasterProps {
  client: StreamVideoClient;
  callId: string;
}

const Broadcaster = ({ client, callId }: BroadcasterProps) => {
  const call = client.call('livestream', callId);

  return (
    <StreamCall call={call}>
      <LivestreamLayout />
      <CallControls />
    </StreamCall>
  );
};