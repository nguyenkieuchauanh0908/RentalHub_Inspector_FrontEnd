import { Injectable } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import { Socket, io } from 'socket.io-client';

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  socket = io('http://localhost:3000');
  private currentSocket = new BehaviorSubject<Socket | null>(null); //Socket
  getCurrentSocket = this.currentSocket.asObservable();
  setCurrentSocket(socket: Socket | null) {
    this.currentSocket.next(null);
    this.currentSocket.next(socket);
  }

  private subscriptions: Subscription[] = [];
  constructor() {}

  //Connect to the socket
  initiateSocket() {
    this.setCurrentSocket(this.socket);

    return () => {
      this.socket.disconnect();
    };
  }

  //Disconnects the socket
  disconnectToSocket(): void {
    this.getCurrentSocket.subscribe((socket) => {
      if (socket) {
        socket.disconnect();
        console.log('socket disconnected!');
      }
    });
  }

  //destroy
  destroy() {
    console.log('destroying subscription of chat service!');
    this.subscriptions.forEach((sub) => {
      sub.unsubscribe();
    });
    console.log(
      'destroying subscription of chat service!',
      this.subscriptions.length
    );
  }
}
