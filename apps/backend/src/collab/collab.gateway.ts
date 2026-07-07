import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import * as Y from 'yjs';
import { PrismaService } from '../prisma/prisma.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class CollabGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  // Active documents in memory
  private activeDocs = new Map<string, Y.Doc>();
  // Debounce timers for database persist
  private saveDebouncers = new Map<string, NodeJS.Timeout>();

  constructor(private prisma: PrismaService) {}

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join-room')
  async handleJoinRoom(
    @MessageBody() data: { projectId: string; documentId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { documentId } = data;
    const roomName = `doc:${documentId}`;
    client.join(roomName);

    console.log(`Client ${client.id} joined room ${roomName}`);

    // Load or initialize Y.Doc
    let doc = this.activeDocs.get(documentId);
    if (!doc) {
      doc = new Y.Doc();
      
      // Fetch from DB
      const dbDoc = await this.prisma.document.findUnique({
        where: { id: documentId },
      });

      if (dbDoc && dbDoc.contentYjs) {
        Y.applyUpdate(doc, new Uint8Array(dbDoc.contentYjs));
      }
      this.activeDocs.set(documentId, doc);
    }

    // Send the current server document state as a sync update back to the joining client
    const stateUpdate = Y.encodeStateAsUpdate(doc);
    client.emit('init-state', Buffer.from(stateUpdate));
  }

  @SubscribeMessage('sync-update')
  handleSyncUpdate(
    @MessageBody() data: { documentId: string; update: number[] | Buffer },
    @ConnectedSocket() client: Socket,
  ) {
    const { documentId, update } = data;
    const roomName = `doc:${documentId}`;

    const doc = this.activeDocs.get(documentId);
    if (!doc) return;

    // Apply the incoming update to the server doc representation
    const updateBytes = new Uint8Array(update);
    Y.applyUpdate(doc, updateBytes);

    // Broadcast the update to all other users in the room
    client.to(roomName).emit('sync-update', Buffer.from(updateBytes));

    // Debounce database writing
    this.scheduleSave(documentId, doc);
  }

  @SubscribeMessage('cursor-move')
  handleCursorMove(
    @MessageBody() data: { documentId: string; userId: string; cursor: any },
    @ConnectedSocket() client: Socket,
  ) {
    const { documentId } = data;
    const roomName = `doc:${documentId}`;
    // Broadcast cursor position changes to everyone else in the room
    client.to(roomName).emit('cursor-update', data);
  }

  private scheduleSave(documentId: string, doc: Y.Doc) {
    // Clear existing timer if any
    const existing = this.saveDebouncers.get(documentId);
    if (existing) {
      clearTimeout(existing);
    }

    // Set a new timer (2 seconds inactivity debounce)
    const timeout = setTimeout(async () => {
      this.saveDebouncers.delete(documentId);
      
      const update = Y.encodeStateAsUpdate(doc);
      // We can also extract the flat text for indexing / search
      // Assuming a single 'text' type named 'content' inside the Y.Doc
      const ytext = doc.getText('content');
      const textContent = ytext.toString();

      try {
        await this.prisma.document.update({
          where: { id: documentId },
          data: {
            contentYjs: Buffer.from(update),
            contentText: textContent,
          },
        });
        console.log(`Successfully saved document ${documentId} to database.`);
      } catch (err) {
        console.error(`Failed to save document ${documentId}:`, err);
      }
    }, 2000);

    this.saveDebouncers.set(documentId, timeout);
  }
}
