const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Shared state for the song
let timeline = {
    isPlaying: false,
    timestamp: 0
};
const songDuration = 120; // Duration of the song in seconds (placeholder value)

// Serve static files
app.use(express.static('public')); // Serves files from the 'public' directory

io.on('connection', (socket) => {
    console.log('A user connected');

    // Send current timeline to the newly connected user
    socket.emit('sync_state', timeline);

    socket.on('play', () => {
        timeline.isPlaying = true;
        timeline.timestamp = Date.now() / 1000;
        io.emit('update_state', timeline);
    });

    socket.on('pause', () => {
        if (timeline.isPlaying) {
            const elapsedTime = (Date.now() / 1000) - timeline.timestamp;
            timeline.timestamp = Math.min(timeline.timestamp + elapsedTime, songDuration);
            timeline.isPlaying = false;
        }
        io.emit('update_state', timeline);
    });

    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
