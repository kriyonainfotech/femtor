const { WebSocketServer } = require('ws');
const url = require('url');
const { redisClient } = require('../redis/redis'); // Adjust this path to your Redis client file

// This map will store the WebSocket connection for each logged-in user.
const userConnections = new Map();

// function initializeWebSocket(server) {
//     console.log('[WebSocket] Initializing WebSocket server...');

//     // Create a WebSocketServer with noServer: true.
//     // This allows us to manually handle the connection handshake.
//     const wss = new WebSocketServer({ noServer: true });

//     // Listen for the raw 'upgrade' event on the main HTTP server.
//     // This event happens BEFORE any Express middleware runs.
//     server.on('upgrade', (request, socket, head) => {
//         console.log('[WebSocket] Received an "upgrade" request. Attempting to handle handshake...');

//         // Here we could add authentication logic if we wanted,
//         // like checking a token in the request headers or cookies.
//         // For now, we approve all WebSocket upgrade requests.

//         wss.handleUpgrade(request, socket, head, (ws) => {
//             console.log('[WebSocket] Handshake successful. Emitting "connection" event.');
//             // If the handshake is successful, we pass the connection to our main logic.
//             wss.emit('connection', ws, request);
//         });
//     });

//     wss.on('connection', (ws, req) => {
//         try {
//             const { query } = url.parse(req.url, true);
//             const userId = query.userId;

//             if (!userId) {
//                 console.warn('[WebSocket] Connection rejected: No userId provided in the URL query.');
//                 return ws.close();
//             }

//             console.log(`[WebSocket] Client successfully connected for user: ${userId}`);
//             userConnections.set(userId, ws);

//             ws.send(JSON.stringify({ message: `Welcome! Connection established for user ${userId}.` }));

//             ws.on('close', () => {
//                 console.log(`[WebSocket] Client disconnected for user: ${userId}`);
//                 userConnections.delete(userId);
//             });

//             ws.on('error', (error) => {
//                 console.error(`[WebSocket] Error for user ${userId}:`, error);
//             });
//         } catch (error) {
//             console.error('[WebSocket] Critical error during "connection" event:', error);
//             ws.close();
//         }
//     });

//     console.log('[WebSocket] Server is initialized and listening for upgrade requests.');
// }

function initializeWebSocket(server) {
    console.log('[WebSocket] Initializing WebSocket server...');
    const wss = new WebSocketServer({ noServer: true });

    server.on('upgrade', (request, socket, head) => {
        console.log('[WebSocket] Received an "upgrade" request. Attempting to handle handshake...');
        wss.handleUpgrade(request, socket, head, (ws) => {
            console.log('[WebSocket] Handshake successful. Emitting "connection" event.');
            wss.emit('connection', ws, request);
        });
    });

    // --- 2. MAKE THE CONNECTION HANDLER ASYNC ---
    wss.on('connection', async (ws, req) => { // <-- Added async
        try {
            const { query } = url.parse(req.url, true);
            const userId = query.userId;

            if (!userId) {
                console.warn('[WebSocket] Connection rejected: No userId provided.');
                return ws.close();
            }

            console.log(`[WebSocket] Client successfully connected for user: ${userId}`);
            userConnections.set(userId, ws);

            // --- 3. CHECK THE REDIS MAILBOX FOR PENDING MESSAGES ---
            const redisKey = `notifications:${userId}`;
            const pendingMessages = await redisClient.lrange(redisKey, 0, -1);

            if (pendingMessages && pendingMessages.length > 0) {
                console.log(`[Redis] Found ${pendingMessages.length} pending message(s) for user ${userId}. Sending now...`);

                // Send each pending message
                pendingMessages.forEach(messageString => {
                    ws.send(messageString);
                });

                // Clear the mailbox after sending
                await redisClient.del(redisKey);
                console.log(`[Redis] Mailbox for user ${userId} has been cleared.`);
            }
            // --- END OF MAILBOX CHECK ---


            ws.on('close', () => {
                console.log(`[WebSocket] Client disconnected for user: ${userId}`);
                userConnections.delete(userId);
            });

            ws.on('error', (error) => {
                console.error(`[WebSocket] Error for user ${userId}:`, error);
            });
        } catch (error) {
            console.error('[WebSocket] Critical error during "connection" event:', error);
            ws.close();
        }
    });

    console.log('[WebSocket] Server is initialized and listening for upgrade requests.');
}

module.exports = {
    initializeWebSocket,
    userConnections,
};

