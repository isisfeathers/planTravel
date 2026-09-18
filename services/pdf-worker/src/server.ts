import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { pdfQueue, generateAndSendPDF } from './pdfWorker';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3004;

app.use(cors());
app.use(express.json());

// Main PDF export triggers (supporting Supabase Edge Function URL format and custom versioned routes)
app.post(
  ['/functions/v1/export-pdf-line', '/api/v1/pdf/export', '/export'],
  async (req: express.Request, res: express.Response) => {
    const { itinerary_id, line_user_id } = req.body;

    if (!itinerary_id) {
      return res.status(400).json({ error: 'Missing required itinerary_id parameter.' });
    }

    try {
      console.log(`[PDF Server] Enqueueing PDF export for itinerary ID: ${itinerary_id}`);
      
      // Process using the concurrency limiting queue
      const result = await pdfQueue.add(() => generateAndSendPDF(itinerary_id, line_user_id));

      return res.status(200).json(result);

    } catch (err: any) {
      console.error(`[PDF Server] Failed to export and send PDF for itinerary ${itinerary_id}:`, err);
      return res.status(500).json({
        error: 'Failed to generate or deliver PDF itinerary.',
        details: err.message
      });
    }
  }
);

// Simple health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    service: 'Atrip PDF Worker Service',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`==================================================================`);
  console.log(`🚀 Atrip PDF Worker Service has started on Port ${PORT}`);
  console.log(`👉 Export Endpoints:`);
  console.log(`   - http://localhost:${PORT}/functions/v1/export-pdf-line`);
  console.log(`   - http://localhost:${PORT}/api/v1/pdf/export`);
  console.log(`==================================================================`);
});

export default app;
