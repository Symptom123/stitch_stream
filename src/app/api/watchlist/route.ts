import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'data', 'watchlists.json');

function readDB(): Record<string, unknown[]> {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, '{}', 'utf-8');
    }
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function writeDB(data: Record<string, unknown[]>) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

// GET /api/watchlist?user=username
export async function GET(req: NextRequest) {
  const user = req.nextUrl.searchParams.get('user')?.toLowerCase().trim();
  if (!user) return NextResponse.json({ error: 'Missing user param' }, { status: 400 });
  const db = readDB();
  return NextResponse.json({ watchlist: db[user] ?? [] });
}

// POST /api/watchlist  body: { user, watchlist }
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const user = (body.user as string)?.toLowerCase().trim();
    const watchlist = body.watchlist;
    if (!user || !Array.isArray(watchlist)) {
      return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
    }
    const db = readDB();
    db[user] = watchlist;
    writeDB(db);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
