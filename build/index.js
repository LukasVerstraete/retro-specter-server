"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var http_1 = __importDefault(require("http"));
var socket_io_1 = __importDefault(require("socket.io"));
var app = express_1.default();
var http = http_1.default.createServer(app);
var io = socket_io_1.default(http);
var PORT = process.env.PORT || 8080;
var world = { players: [] };
io.on('connection', function (socket) {
    console.log('a user connected');
    socket.on('disconnect', function () {
        OnDisconnect(socket);
    });
    registerAction('JOIN', socket, AddPlayer);
    registerAction('CHANGE_DIRECTION', socket, ChangePlayerDirection);
});
http.listen(PORT, function () {
    console.log("listening on *:" + PORT);
});
function registerAction(action, socket, callback) {
    socket.on(action, function (data) {
        callback(socket, data);
    });
}
function AddPlayer(socket, data) {
    var player = {
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
        players: world.players.map(function (player) {
            player.isCurrent = player.id === socket.id;
            return player;
        })
    });
}
function ChangePlayerDirection(socket, data) {
    var currentPlayer = world.players.find(function (player) { return player.id === socket.id; });
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
function OnDisconnect(socket) {
    world.players = world.players.filter(function (player) { return player.id !== socket.id; });
}
