import { useState, useEffect } from "react";
import { Peer } from "peerjs";

export function PeerApp({ id, users }) {
  useEffect(() => {
    const peer = new Peer(id);

    console.log("xyz");
  }, []);
  return (
    <>
      <div style={{ border: "1px solid", padding: "1rem" }}>
        <div>webrtc-peerjs</div>
        {users.map((userid) => {
          <button>{userid}</button>;
        })}
      </div>
    </>
  );
}
