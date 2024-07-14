import { Injectable } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import { Socket, io } from 'socket.io-client';
import { AccountService } from '../accounts/accounts.service';
import { User } from '../auth/user.model';

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  socket = io('http://localhost:3000');
  private currentSocket = new BehaviorSubject<Socket | null>(null); //Socket
  getCurrentSocket = this.currentSocket.asObservable();
  setCurrentSocket(socket: Socket | null) {
    if (socket) {
      socket.connect();
    }
    this.currentSocket.next(socket);
  }

  private onlineUsers = new BehaviorSubject<
    { userId: string; socketId: string }[] | null
  >([]); //Các online users hiện tại
  getCurrentOnlineUsers = this.onlineUsers.asObservable();
  setOnlineUsers(
    updatedOnlineUsers: { userId: string; socketId: string }[] | null
  ) {
    this.onlineUsers.next(updatedOnlineUsers);
  }

  private subscriptions: Subscription[] = [];
  constructor(private accountService: AccountService) {
    this.accountService.getCurrentUser.subscribe((user) => {
      if (user) {
        this.emittingAddingMeToOnlineUsers(user);
        this.onGettingOnlineUsers();
      }
    });
  }

  //Connect to the socket
  initiateSocket() {
    console.log('Initiating socket...');
    this.setCurrentSocket(this.socket);

    // return () => {
    //   this.socket.disconnect();
    // };
  }

  //Disconnects the socket
  disconnectToSocket(): void {
    console.log('disconnecting from socket:', this.socket.disconnected);
    this.socket.disconnect();
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

  //Socket event's name: 'addNewUser'
  emittingAddingMeToOnlineUsers(user: User) {
    this.getCurrentSocket.subscribe((socket) => {
      if (socket) {
        socket.emit('addNewUser', { userId: user._id, role: 2 });
      }
    });
  }

  //Socket event's name: 'getOnlineUsers'
  onGettingOnlineUsers = () => {
    this.getCurrentSocket.subscribe((socket) => {
      if (socket) {
        socket.on('getOnlineUsers', (onlineUsers: any) => {
          console.log(
            '🚀 ~ ChatBotService1 ~ socket.on ~ onlineUsers:',
            onlineUsers
          );
          this.setOnlineUsers(onlineUsers);
          return () => {
            socket.off('getOnlineUsers');
          };
        });
      }
    });
  };
}
