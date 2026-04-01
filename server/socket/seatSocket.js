export const initSeatSocket = (io) => {
  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    // Client joins a show-specific room
    socket.on('join_show', ({ showId }) => {
      socket.join(`show_${showId}`);
      console.log(`   → ${socket.id} joined room: show_${showId}`);
    });

    socket.on('leave_show', ({ showId }) => {
      socket.leave(`show_${showId}`);
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Socket disconnected: ${socket.id}`);
    });
  });
};

// Called from seat controller after any status change
// Broadcasts to all clients watching that show
export const broadcastSeatUpdate = (io, showId, updatedSeats) => {
  io.to(`show_${showId}`).emit('seats_updated', {
    seats: updatedSeats.map((s) => ({
      id: s._id,
      label: s.label,
      status: s.status,
      row: s.row,
      col: s.col,
    })),
  });
};

export const broadcastSeatCount = (io, showId, available) => {
  io.to(`show_${showId}`).emit('seat_count', { available });
};
