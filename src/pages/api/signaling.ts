import { Server } from "ws";

let wss: Server | null = null;

export default function handler(req: any, res: any) {
  if (!res.socket.server.wss) {
    wss = new Server({ server: res.socket.server });
    res.socket.server.wss = wss;
    wss.on("connection", (ws) => {
      ws.on("message", (message) => {
        // Broadcast a todos menos el remitente
        wss?.clients.forEach((client) => {
          if (client !== ws && client.readyState === ws.OPEN) {
            client.send(message);
          }
        });
      });
    });
  }
  res.end();
}

export const config = {
  api: {
    bodyParser: false,
  },
};
