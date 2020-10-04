import express from 'express';
import httpServer from 'http';
import ioServer from 'socket.io';

const app = express();
const http: httpServer.Server = httpServer.createServer(app);
const io: ioServer.Server = ioServer(http);

app.get('/', (req: any, res: any) => {
    res.send('<h1>Hello Worldo</h1>');
});

io.on('connection', (socket) => {
    console.log('a user connected');
    socket.on('disconnect', () => {
        console.log('A user disconnected');
    })
});

http.listen(3000, () => {
    console.log('listening on *:3000');
});