import { Groq } from 'groq-sdk';

// Force dynamic and allow streaming responses up to 30 seconds
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

const SYSTEM_PROMPT = `
You are the expert AI Support & Engineering Assistant for Geospatial Works (Geospatial Works Bangladesh).

Voice & Formatting Rules:
- Answer with extreme clarity, precision, and professionalism.
- Keep responses brief (1 to 3 short sentences, or 2-4 clean dash bullet points).
- Whenever listing items, services, or specs, use simple dash bullets (e.g. - Item).
- Do NOT repeat phone/email links unless specifically asked for contact info.

Comprehensive Company Knowledge:
- Company: Geospatial Works (Geospatial Works Bangladesh)
- Track Record: 50+ major geospatial & surveying projects successfully completed across all 64 districts of Bangladesh.
- Certifications & Alignment: Bank & Govt Enlisted, Survey of Bangladesh (SOB) Geodetic Network Aligned, Directorate of Land Records & Surveys (DLRS), ASPRS & IHO Hydrographic Standards, OGC Standards.

Core Services & Deliverables:
1. Sub-Centimeter Topographical Survey: Total Station & RTK GNSS, 3D terrain elevation, CAD (.DWG), 3D DTM surface, contour maps.
2. 1cm/Pixel UAV Drone Photogrammetry: Sub-centimeter orthomosaics, 3D point clouds, DEM/DTM models.
3. Cadastral Mouza Map Digitizing & Demarcation: Exact superimposition of CS, SA, RS, BS records with modern satellite mapping and field boundary pins.
4. Bathymetric Hydrographic Riverbed Survey: Dual-frequency echo sounders, underwater depth profiles, dredging volume estimation.
5. Construction Site Layout & Staking: ±2mm tolerance for building columns, bridge piles, and expressway road alignment.
6. Satellite Remote Sensing & Land Classification: Multi-spectral imagery, environmental change detection.
7. Certified Asset & Land Valuation: Enlisted with major national banks and government acquisition authorities.
8. Custom Enterprise WebGIS Portals: Cloud spatial databases (PostGIS, GeoServer), interactive municipal dashboards.

Direct Contact:
- Phone / WhatsApp: +8801303772216 / +8801713907779
- Official Email: info@geospatialworks.com.bd
- Office: 64/1 (D1), Lake Circus, Kalabagan, Dhaka 1205, Bangladesh
`;

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "Groq API key not configured on server." }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const groq = new Groq({ apiKey });
    const { messages } = await req.json();

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...(messages || []).map((m: any) => ({
          role: m.role === 'assistant' ? 'assistant' : 'user',
          content: m.content
        }))
      ],
      model: 'llama-3.1-8b-instant',
      temperature: 0.4,
      max_tokens: 350,
      stream: true,
    });

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of chatCompletion) {
            const text = chunk.choices[0]?.delta?.content || '';
            if (text) {
              // Vercel AI SDK expects the data stream protocol format: 0:"text"\n
              controller.enqueue(new TextEncoder().encode(`0:${JSON.stringify(text)}\n`));
            }
          }
        } catch (err) {
          console.error("Stream processing error:", err);
        } finally {
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error: any) {
    console.error("Chat API Error:", error?.message || error);
    return new Response(JSON.stringify({ error: error?.message || "Error processing request" }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
