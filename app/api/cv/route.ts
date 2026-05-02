import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");
  if (!url) return new NextResponse("Missing url", { status: 400 });

  if (!url.startsWith("https://res.cloudinary.com/")) {
    return new NextResponse("Invalid url", { status: 400 });
  }

  try {
    const response = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
    });

    if (!response.ok) {
      return new NextResponse("Failed to fetch from Cloudinary", { status: 502 });
    }

    const buffer = await response.arrayBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "inline; filename=\"cv.pdf\"",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (err) {
    console.error("CV proxy error:", err);
    return new NextResponse("Failed to fetch file", { status: 500 });
  }
}