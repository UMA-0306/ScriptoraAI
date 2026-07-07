import { Socket } from 'socket.io-client';
import * as Y from 'yjs';

export class SocketIOProvider {
  constructor(
    private socket: Socket,
    private doc: Y.Doc,
    private documentId: string
  ) {
    // Join the document room
    this.socket.emit('join-room', { documentId });

    // Receive document initialization state
    this.socket.on('init-state', (stateUpdate: ArrayBuffer) => {
      Y.applyUpdate(this.doc, new Uint8Array(stateUpdate), this);
    });

    // Receive concurrent sync updates
    this.socket.on('sync-update', (update: ArrayBuffer) => {
      Y.applyUpdate(this.doc, new Uint8Array(update), this);
    });

    // Observe local edits and transmit to server
    this.doc.on('update', (update: Uint8Array, origin: any) => {
      if (origin !== this) {
        this.socket.emit('sync-update', {
          documentId: this.documentId,
          update: Array.from(update),
        });
      }
    });
  }

  destroy() {
    this.socket.off('init-state');
    this.socket.off('sync-update');
  }
}
