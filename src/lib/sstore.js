import { writable } from 'svelte/store';

export const socket = new WebSocket('ws://localhost:5555');
export const messageStore = writable('');
export const sendMessage = (
  /** @type {string | ArrayBufferLike | Blob | ArrayBufferView<ArrayBufferLike>} */ message,
) => {
  if (socket.readyState <= 1) {
    socket.send(message);
  }
};
