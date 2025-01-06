import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { meetingService } from './services/meetingService';
import { Participant } from './types/meeting';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: process.env.CORS_ORIGIN,
        methods: ['GET', 'POST']
    }
});

app.use(cors());
app.use(express.json());

// REST API endpoints
app.post('/api/meetings', (req, res) => {
    const { name, hostId, settings } = req.body;
    const meeting = meetingService.createMeeting(name, hostId, settings);
    res.json(meeting);
});

app.get('/api/meetings/:id', (req, res) => {
    const meeting = meetingService.getMeeting(req.params.id);
    if (!meeting) {
        return res.status(404).json({ error: 'Meeting not found' });
    }
    res.json(meeting);
});

// Socket.IO events
io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('join-meeting', (data: { meetingId: string, participant: Participant }) => {
        const { meetingId, participant } = data;
        const meeting = meetingService.getMeeting(meetingId);
        
        if (!meeting) {
            socket.emit('error', { message: 'Meeting not found' });
            return;
        }

        socket.join(meetingId);
        meetingService.addParticipant(meetingId, participant);
        
        // Notify others in the meeting
        socket.to(meetingId).emit('participant-joined', participant);
        
        // Send current participants to the new joiner
        socket.emit('meeting-data', meeting);
    });

    socket.on('leave-meeting', (data: { meetingId: string, participantId: string }) => {
        const { meetingId, participantId } = data;
        meetingService.removeParticipant(meetingId, participantId);
        socket.leave(meetingId);
        io.to(meetingId).emit('participant-left', participantId);
    });

    socket.on('toggle-audio', (data: { meetingId: string, participantId: string, enabled: boolean }) => {
        const { meetingId, participantId, enabled } = data;
        meetingService.updateParticipantStatus(meetingId, participantId, { audioEnabled: enabled });
        io.to(meetingId).emit('audio-toggled', { participantId, enabled });
    });

    socket.on('toggle-video', (data: { meetingId: string, participantId: string, enabled: boolean }) => {
        const { meetingId, participantId, enabled } = data;
        meetingService.updateParticipantStatus(meetingId, participantId, { videoEnabled: enabled });
        io.to(meetingId).emit('video-toggled', { participantId, enabled });
    });

    socket.on('start-screen-share', (data: { meetingId: string, participantId: string }) => {
        const { meetingId, participantId } = data;
        meetingService.updateParticipantStatus(meetingId, participantId, { screenSharing: true });
        io.to(meetingId).emit('screen-share-started', participantId);
    });

    socket.on('stop-screen-share', (data: { meetingId: string, participantId: string }) => {
        const { meetingId, participantId } = data;
        meetingService.updateParticipantStatus(meetingId, participantId, { screenSharing: false });
        io.to(meetingId).emit('screen-share-stopped', participantId);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
