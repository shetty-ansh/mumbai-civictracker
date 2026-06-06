import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'data', 'flooding-data.json');
    const fileContents = await fs.readFile(filePath, 'utf8');
    return new NextResponse(fileContents, {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to load flooding data' }, { status: 500 });
  }
}
