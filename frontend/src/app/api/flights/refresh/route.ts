import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const flightServiceUrl = process.env.FLIGHT_SERVICE_URL || 'https://atrip-flight-service-1096361179847.asia-east1.run.app';
    const res = await fetch(`${flightServiceUrl}/api/v1/flights/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(3000),
    });

    if (res.ok) {
      const json = await res.json();
      return NextResponse.json(json);
    }
  } catch (e) {}

  // Fallback if flight-service is unreachable
  return NextResponse.json({
    valid: true,
    current_price: 0,
    warning: undefined,
  });
}
