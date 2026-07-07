// services/peerService.js
import Peer from 'peerjs';

let peerInstance = null;

export const createPeer = (id) => {
  if (peerInstance) peerInstance.destroy();
  peerInstance = new Peer(id, {
    host: '0.peerjs.com',
    port: 443,
    secure: true,
  });
  return peerInstance;
};

export const getPeer = () => peerInstance;