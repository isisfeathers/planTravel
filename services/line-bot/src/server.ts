import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { webhookRouter } from './webhook';
import { pushRouter } from './pushService';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3003;

app.use(cors());

// Crucial: capture raw body buffer before it gets parsed as JSON.
// This raw body is required for verifying HMAC-SHA256 x-line-signature!
app.use(express.json({
  verify: (req: any, res, buf) => {
    req.rawBody = buf;
  }
}));

// Route mappings for resilience (supporting both versioned and root endpoints)
app.use('/api/v1/line', webhookRouter); // POST /api/v1/line/webhook
app.use('/', webhookRouter);            // POST /webhook (flexible support)
app.use('/api/v1/line', pushRouter);    // POST /api/v1/line/push

// Simple health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    service: 'Atrip LINE Bot Microservice',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`==================================================================`);
  console.log(`🚀 Atrip LINE Bot Microservice has started on Port ${PORT}`);
  console.log(`👉 Webhook Endpoints:`);
  console.log(`   - http://localhost:${PORT}/webhook`);
  console.log(`   - http://localhost:${PORT}/api/v1/line/webhook`);
  console.log(`👉 Push Message Endpoint:`);
  console.log(`   - http://localhost:${PORT}/api/v1/line/push`);
  console.log(`==================================================================`);
});
export default app;
