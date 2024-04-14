import { useState, useEffect } from "react";
import { Peer } from "peerjs";

export function PeerApp({ id, users }: any) {
  useEffect(() => {
    const peer = new Peer(id);

    console.log("xyz", Object.values(users));
  }, []);
  return (
    <>
      <div style={{ border: "1px solid", padding: "1rem" }}>
        <div>webrtc-peerjs</div>
        {/* {Object.values(users).map((id: any) => (
          <button>{JSON.stringify(id)}</button>
        ))} */}
      </div>
    </>
  );
}
