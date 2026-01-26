// Socket State Storage
// Shared mutable state for Socket.IO connections

export const connections = {};
export const messages = {};
export const timeOnline = {};
export const users = {}; // socket.id -> { name, role }
export const activeClasses = {}; // roomId -> { teacherId, startTime, courseId }
