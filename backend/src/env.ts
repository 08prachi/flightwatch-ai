import dotenv from "dotenv";
import path from "path";

// Load .env IMMEDIATELY before anything else
const envPath = path.join(__dirname, '../../.env');
console.log('📂 [ENV] Loading .env from:', envPath);
const result = dotenv.config({ path: envPath });
console.log('📂 [ENV] Dotenv loaded:', result.parsed ? 'SUCCESS' : 'FAILED');
console.log('📂 [ENV] SERPAPI_API_KEY present:', !!process.env.SERPAPI_API_KEY);
