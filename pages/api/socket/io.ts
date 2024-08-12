import { Server as NetServer } from "http";
import { NextApiRequest, NextApiResponse } from "next";
import { Server as ServerIO } from "socket.io";

import { NextApiResponseServerIo } from "@/types";

// Disabling body parsing to handle raw WebSocket connections
export const config = {
  api: {
    bodyParser: false,
  },
};

const ioHandler = (req: NextApiRequest, res: NextApiResponseServerIo) => {
  if (!res.socket.server.io) {
    const path = "/api/socket/io";
    const httpServer: NetServer = res.socket.server as any;
    const io = new ServerIO(httpServer, {
      path: path,
      addTrailingSlash: false,
    });

    // Attach the Socket.IO server to the Next.js server
    res.socket.server.io = io;

    // Add Socket.IO event listeners here if needed
    io.on("connection", (socket) => {
      console.log("New client connected");

      socket.on("disconnect", () => {
        console.log("Client disconnected");
      });
    });
  }

  // End the request to prevent Next.js from hanging
  res.end();
};

// Export the handler as default to make it a valid API route
export default ioHandler;
