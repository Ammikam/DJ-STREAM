import React from "react";
import { useCallStateHooks } from "@stream-io/video-react-sdk";

export const Backstage = () => {
  const { useCallSession, useCallStartsAt } = useCallStateHooks();
  const startsAt = useCallStartsAt();
  const session = useCallSession();

  // viewers who have joined the call before it went live
  const waitingCount = session?.participants_count_by_role["user"] ?? 0;

  return (
    <div className="backstage">
      {startsAt ? (
        <div className="starts-at">
          Livestream starting at {new Date(startsAt).toLocaleDateString()}
        </div>
      ) : (
        <div className="starts-at">Livestream starting soon</div>
      )}

      {waitingCount > 0 && (
        <div className="waiting-count">{waitingCount} viewers waiting</div>
      )}
    </div>
  );
};
