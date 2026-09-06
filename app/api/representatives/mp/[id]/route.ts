import { NextResponse, NextRequest } from 'next/server';
import { getMumbaiMPDataById } from '@/lib/services/mpService';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await getMumbaiMPDataById(id);
    
    if (!data) {
      return NextResponse.json(
        { error: 'Failed to fetch MP data' },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error(`Error in GET /api/representatives/mp/[id]:`, error);
    return NextResponse.json(
      { error: 'Failed to fetch MP data' },
      { status: 500 }
    );
  }
}
