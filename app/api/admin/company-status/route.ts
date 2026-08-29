import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { companyId, status, rejectionReason } = body;

    if (!companyId || !status) {
      return NextResponse.json(
        { error: 'companyId and status are required' },
        { status: 400 }
      );
    }

    if (!['ACTIVE', 'PENDING', 'REJECTED'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status value. Must be ACTIVE, PENDING, or REJECTED.' },
        { status: 400 }
      );
    }

    const supabaseAdmin = getSupabaseAdmin();

    const updatePayload: any = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (rejectionReason !== undefined) {
      updatePayload.rejection_reason = rejectionReason;
    } else if (status === 'ACTIVE') {
      updatePayload.rejection_reason = null;
    }

    const { data: updatedCompany, error } = await supabaseAdmin
      .from('courier_companies')
      .update(updatePayload)
      .eq('id', companyId)
      .select()
      .single();

    if (error) {
      console.error('Admin company status update error:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to update company status' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      company: updatedCompany,
    });
  } catch (err: any) {
    console.error('Company status route error:', err);
    return NextResponse.json(
      { error: err.message || 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
