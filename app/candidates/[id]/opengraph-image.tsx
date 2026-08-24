import { ImageResponse } from 'next/og';
import { createClient } from "@supabase/supabase-js";

// Route segment config
export const runtime = 'edge';

// Image metadata
export const alt = 'Candidate Profile';
export const size = {
    width: 1200,
    height: 630,
};

export const contentType = 'image/png';

export default async function Image({ params }: { params: { id: string } }) {
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
        const supabaseClient = createClient(supabaseUrl, supabaseKey);

        const { data: candidate, error } = await supabaseClient
            .from('bmc_candidates')
            .select('*')
            .eq('id', params.id)
            .single();

        if (error || !candidate) {
            return new ImageResponse(
                (
                    <div
                        style={{
                            fontSize: 60,
                            color: 'black',
                            background: 'white',
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        Candidate Not Found
                    </div>
                ),
                { ...size }
            );
        }

        return new ImageResponse(
            (
                <div
                    style={{
                        background: candidate.winnner ? '#f3f4f6' : '#1c1917',
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        justifyContent: 'center',
                        padding: '80px',
                        fontFamily: 'sans-serif',
                        color: candidate.winnner ? '#1f2937' : '#f9fafb',
                    }}
                >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div style={{ fontSize: 32, textTransform: 'uppercase', letterSpacing: '2px', opacity: 0.8, color: candidate.winnner ? '#4b5563' : '#9ca3af' }}>
                            Passenger / Candidate
                        </div>
                        <div style={{ fontSize: 80, fontWeight: 800, lineHeight: 1.1, marginBottom: '20px' }}>
                            {candidate.candidate_name}
                        </div>
                        
                        <div style={{ display: 'flex', gap: '60px', marginTop: '20px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <div style={{ fontSize: 24, textTransform: 'uppercase', letterSpacing: '2px', opacity: 0.8, color: candidate.winnner ? '#4b5563' : '#9ca3af' }}>
                                    Issued By
                                </div>
                                <div style={{ fontSize: 40, fontWeight: 600, marginTop: '8px' }}>
                                    {candidate.party_name}
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <div style={{ fontSize: 24, textTransform: 'uppercase', letterSpacing: '2px', opacity: 0.8, color: candidate.winnner ? '#4b5563' : '#9ca3af' }}>
                                    Ward No.
                                </div>
                                <div style={{ fontSize: 40, fontWeight: 700, marginTop: '8px', color: candidate.winnner ? '#1f2937' : '#fbbf24' }}>
                                    {candidate.ward_no}
                                </div>
                            </div>
                        </div>
                        
                        {candidate.winnner && (
                            <div style={{ 
                                marginTop: '40px', 
                                padding: '10px 20px', 
                                border: '4px solid #047857', 
                                color: '#047857', 
                                fontSize: 32, 
                                fontWeight: 'bold',
                                textTransform: 'uppercase',
                                transform: 'rotate(-5deg)',
                                width: 'fit-content'
                            }}>
                                ✓ Elected
                            </div>
                        )}
                        
                        {!candidate.winnner && candidate.is_women_reserved && (
                            <div style={{ 
                                marginTop: '40px', 
                                padding: '10px 20px', 
                                border: '4px solid #f472b6', 
                                color: '#f472b6', 
                                fontSize: 32, 
                                fontWeight: 'bold',
                                textTransform: 'uppercase',
                                transform: 'rotate(-5deg)',
                                width: 'fit-content'
                            }}>
                                Women Reserved
                            </div>
                        )}
                    </div>
                </div>
            ),
            {
                ...size,
            }
        );
    } catch (e) {
        return new ImageResponse(
            (
                <div style={{ background: 'white', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    Error generating image
                </div>
            ),
            { ...size }
        );
    }
}
