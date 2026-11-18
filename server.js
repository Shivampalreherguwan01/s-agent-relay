const WebSocket = require('ws');

const PORT = process.env.PORT || 3000;
const wss = new WebSocket.Server({ port: PORT });

const agents = new Map();
const controllers = new Map();

console.log(`S Agent Relay running on port ${PORT}`);

wss.on('connection', (ws) => {
  let clientType = null;
  let clientId = null;

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message.toString());

      if (data.type === 'register') {
        clientType = data.role;
        clientId = data.id;

        if (clientType === 'agent') {
          agents.set(clientId, ws);
          console.log(`Agent connected: ${clientId}`);
        } else if (clientType === 'controller') {
          controllers.set(clientId, ws);
          console.log(`Controller connected: ${clientId}`);
        }

        ws.send(JSON.stringify({ type: 'registered', role: clientType, id: clientId }));
        return;
      }

      if (data.type === 'command' && clientType === 'controller') {
        const agentWs = agents.get(data.targetAgentId);
        if (agentWs && agentWs.readyState === WebSocket.OPEN) {
          agentWs.send(JSON.stringify({
            type: 'command',
            action: data.action,
            x: data.x,
            y: data.y,
            x2: data.x2,
            y2: data.y2,
            duration: data.duration
          }));
        }
      }
    } catch (err) {
      console.error('Error:', err.message);
    }
  });

  ws.on('close', () => {
    if (clientType === 'agent' && clientId) {
      agents.delete(clientId);
      console.log(`Agent disconnected: ${clientId}`);
    }
    if (clientType === 'controller' && clientId) {
      controllers.delete(clientId);
      console.log(`Controller disconnected: ${clientId}`);
    }
  });
});
