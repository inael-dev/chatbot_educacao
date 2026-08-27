import { getCapabilities } from "@/lib/ai/models";

export function GET() {
  const headers = {
    "Cache-Control": "public, max-age=86400, s-maxage=86400",
  };

  return Response.json(getCapabilities(), { headers });
}
