import express from 'express';
import httpServer from 'http';
import ioServer from 'socket.io';
import { Action } from './models/Actions';
import { World } from './models/World';
import { Player } from './models/Player';

const app = express();
const http: httpServer.Server = httpServer.createServer(app);
const io: ioServer.Server = ioServer(http);

const PORT = process.env.PORT || 8080;

const world: World = {players: []};

io.on('connection', (socket: ioServer.Socket) => {
    console.log('a user connected');
    socket.on('disconnect', () => {
        OnDisconnect(socket);
    });
    registerAction('JOIN', socket, AddPlayer);
    registerAction('CHANGE_DIRECTION', socket, ChangePlayerDirection);
});

http.listen(PORT, () => {
    console.log(`listening on *:${PORT}`);
});

function registerAction(action: Action, socket: ioServer.Socket, callback: (socket: ioServer.Socket, data: any) => void): void {
    socket.on(action, (data: any) => {
        callback(socket, data); 
    });
}

function AddPlayer(socket: ioServer.Socket, data: any): void {
    const player: Player = {
        id: socket.id,
        name: data.name,
        directionX: 0,
        directionY: 0,
        x: data.x,
        y: data.y
    };
    world.players.push(player);
    socket.broadcast.emit('JOIN', player);
    socket.emit('PLAYER_LIST', {
        players: world.players.map((player: Player) => {
            player.isCurrent = player.id === socket.id;
            return player;
        })
    });
}

function ChangePlayerDirection(socket: ioServer.Socket, data: any): void {
    const currentPlayer: Player = world.players.find((player: Player) => player.id === socket.id) as Player;
    currentPlayer.x = data.x;
    currentPlayer.y = data.y;
    currentPlayer.directionX = data.dx;
    currentPlayer.directionY = data.dy;

    io.emit('CHANGE_DIRECTION', {
        id: currentPlayer.id, 
        x: currentPlayer.x,
        y: currentPlayer.y,
        dx: currentPlayer.directionX,
        dy: currentPlayer.directionY
    });
}

function OnDisconnect(socket: ioServer.Socket): void {
    world.players = world.players.filter((player: Player) => player.id !== socket.id);
}