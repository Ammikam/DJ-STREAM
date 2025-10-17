import React, { useEffect, useState } from "react";
import { useCall } from "@stream-io/video-react-sdk";
import type { CallRecording } from "@stream-io/video-react-sdk";

export const CallEnded = () => {
  const call = useCall();

  const [recordings, setRecordings] = useState<CallRecording[]>([]);

  useEffect(() => {
    let cancel = false;

    call.queryRecordings(call.state.session?.id).then(({ recordings }) => {
      if (!cancel) {
        setRecordings((prev) => [...prev, ...recordings]);
      }
    });

    const unsubscribe = call.on("call.recording_ready", (event) => {
      setRecordings((prev) => [...prev, event.call_recording]);
    });

    return () => {
      cancel = true;
      unsubscribe();
      setRecordings([]);
    };
  }, [call]);

  return (
    <div className="call-ended">
      <h2>The livestream has ended</h2>

      {recordings.length > 0 && (
        <>
          <h3>Watch recordings</h3>
          <ul>
            {recordings.map((recording) => {
              <a key={recording.start_time} href={recording.url}>
                {recording.start_time} - {recording.end_time}
              </a>;
            })}
          </ul>
        </>
      )}
    </div>
  );
};
