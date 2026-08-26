import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { generateWardPdf, WardPdfData } from "@/lib/generate-ward-pdf";

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN!;
const WHATSAPP_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN!;
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID!;

// Use service role key for server-side queries (bypasses RLS)
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const mode = searchParams.get("hub.mode");
    const token = searchParams.get("hub.verify_token");
    const challenge = searchParams.get("hub.challenge");

    if (mode === "subscribe" && token === VERIFY_TOKEN) {
        console.log("✅ Webhook verified!");
        return new NextResponse(challenge, { status: 200 });
    }
    return new NextResponse("Forbidden", { status: 403 });
}

export async function POST(req: NextRequest) {
    const body = await req.json();

    const message = body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];

    if (!message) {
        return NextResponse.json({ status: "ignored" });
    }

    const from = message.from;
    const type = message.type;

    console.log(`📱 Message from ${from}, type: ${type}`);

    if (type === "text") {
        const text = message.text.body.trim();

        // Check if it's a number (ward number)
        if (/^\d+$/.test(text)) {
            const wardNumber = parseInt(text, 10);

            if (wardNumber < 1 || wardNumber > 227) {
                await sendMessage(
                    from,
                    "⚠️ Invalid ward number. Please enter a number between 1 and 227."
                );
            } else {
                // Send immediate acknowledgment, then generate PDF in the background
                await sendMessage(
                    from,
                    `✅ Ward ${wardNumber} — generating your corporator's report card PDF...`
                );
                // Don't await this — let it run while we respond 200 to WhatsApp
                handleWardPdf(from, wardNumber).catch((err) =>
                    console.error("❌ PDF flow error:", err)
                );
            }
        } else {
            await sendWelcomeMessage(from);
        }
    }

    return NextResponse.json({ status: "ok" });
}

// ── Main PDF flow ───────────────────────────────────────────

async function handleWardPdf(to: string, wardNumber: number) {
    try {
        // 1. Query the winner (corporator) for this ward
        const { data: candidate, error } = await supabase
            .from("bmc_candidates")
            .select(
                `
                id,
                candidate_name,
                party_name,
                ward_no,
                winnner,
                case_info:bmc_candidate_case_info!bmc_candidate_case_info_candidate_id_fkey(education, active_cases, closed_cases)
            `
            )
            .eq("ward_no", wardNumber)
            .eq("winnner", true)
            .single();

        if (error || !candidate) {
            console.error("❌ No winner found for ward", wardNumber, error);
            await sendMessage(
                to,
                `⚠️ Sorry, we couldn't find the corporator for Ward ${wardNumber}. Try another ward number.`
            );
            return;
        }

        // 2. Fetch promises, contact info, and ratings in parallel
        const [
            { data: promisesData },
            { data: contactData },
            { data: ratingsData },
        ] = await Promise.all([
            supabase
                .from("candidate_promises")
                .select("promise_text, category")
                .eq("candidate_id", candidate.id),
            supabase
                .from("corporator_contact")
                .select("mobile, email")
                .eq("candidate_id", candidate.id),
            supabase
                .from("candidate_ratings")
                .select("rating")
                .eq("candidate_id", candidate.id)
                .eq("status", "published"),
        ]);

        const caseInfo = Array.isArray(candidate.case_info)
            ? candidate.case_info[0]
            : candidate.case_info;

        const contactInfo =
            contactData && contactData.length > 0 ? contactData[0] : null;

        const ratings = ratingsData || [];
        const averageRating =
            ratings.length > 0
                ? ratings.reduce((sum: number, r: any) => sum + r.rating, 0) /
                ratings.length
                : null;

        // 3. Build PDF data
        const pdfData: WardPdfData = {
            candidateId: candidate.id,
            candidateName: candidate.candidate_name,
            partyName: candidate.party_name,
            wardNo: candidate.ward_no,
            education: caseInfo?.education || "Not Available",
            activeCases: caseInfo?.active_cases ?? 0,
            closedCases: caseInfo?.closed_cases ?? 0,
            averageRating,
            totalRatings: ratings.length,
            promises: promisesData || [],
            contactMobile: contactInfo?.mobile || null,
            contactEmail: contactInfo?.email || null,
        };

        // 4. Generate PDF
        console.log(`📄 Generating PDF for ${candidate.candidate_name} (Ward ${wardNumber})...`);
        const pdfBuffer = generateWardPdf(pdfData);
        console.log(`📄 PDF generated: ${pdfBuffer.length} bytes`);

        // 5. Upload PDF to WhatsApp Media API
        const filename = `ward-${wardNumber}-${candidate.candidate_name
            .replace(/[^a-z0-9]/gi, "_")
            .toLowerCase()}.pdf`;

        const mediaId = await uploadMediaToWhatsApp(pdfBuffer, filename);

        if (!mediaId) {
            // Fallback: send text with profile link
            await sendMessage(
                to,
                `⚠️ Couldn't send the PDF, but here's the corporator info:\n\n` +
                `👤 ${candidate.candidate_name}\n` +
                `🏛️ ${candidate.party_name}\n` +
                `🗳️ Ward ${wardNumber}\n\n` +
                `View full profile: https://mumbaitracker.in/candidates/${candidate.id}`
            );
            return;
        }

        // 6. Send document message
        await sendDocumentMessage(
            to,
            mediaId,
            filename,
            `📋 ${candidate.candidate_name} — Ward ${wardNumber} Corporator Report Card\n\nView full profile: mumbaitracker.in/candidates/${candidate.id}`
        );

        console.log(`✅ PDF sent to ${to} for ward ${wardNumber}`);
    } catch (err) {
        console.error("❌ handleWardPdf error:", err);
        await sendMessage(
            to,
            `⚠️ Something went wrong generating the report card. Please try again later.`
        );
    }
}

// ── WhatsApp helpers ────────────────────────────────────────

async function sendWelcomeMessage(to: string) {
    await sendMessage(
        to,
        "काय मंडळी? Welcome to MumbaiTracker!\n\nReply with your ward number (1-227) to get your corporator's report card PDF."
    );
}

async function sendMessage(to: string, text: string) {
    const res = await fetch(
        `https://graph.facebook.com/v21.0/${PHONE_NUMBER_ID}/messages`,
        {
            method: "POST",
            headers: {
                Authorization: `Bearer ${WHATSAPP_TOKEN}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                messaging_product: "whatsapp",
                to,
                type: "text",
                text: { body: text },
            }),
        }
    );

    if (!res.ok) {
        console.error("❌ sendMessage error:", await res.text());
    } else {
        console.log(`✅ Message sent to ${to}`);
    }
}

async function uploadMediaToWhatsApp(
    pdfBuffer: Buffer,
    filename: string
): Promise<string | null> {
    try {
        const formData = new FormData();
        formData.append(
            "file",
            new Blob([new Uint8Array(pdfBuffer)], { type: "application/pdf" }),
            filename
        );
        formData.append("type", "application/pdf");
        formData.append("messaging_product", "whatsapp");

        const res = await fetch(
            `https://graph.facebook.com/v21.0/${PHONE_NUMBER_ID}/media`,
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${WHATSAPP_TOKEN}`,
                },
                body: formData,
            }
        );

        if (!res.ok) {
            console.error("❌ Media upload error:", await res.text());
            return null;
        }

        const data = await res.json();
        console.log(`📤 Media uploaded, id: ${data.id}`);
        return data.id;
    } catch (err) {
        console.error("❌ uploadMedia error:", err);
        return null;
    }
}

async function sendDocumentMessage(
    to: string,
    mediaId: string,
    filename: string,
    caption: string
) {
    const res = await fetch(
        `https://graph.facebook.com/v21.0/${PHONE_NUMBER_ID}/messages`,
        {
            method: "POST",
            headers: {
                Authorization: `Bearer ${WHATSAPP_TOKEN}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                messaging_product: "whatsapp",
                to,
                type: "document",
                document: {
                    id: mediaId,
                    filename,
                    caption,
                },
            }),
        }
    );

    if (!res.ok) {
        console.error("❌ sendDocument error:", await res.text());
    } else {
        console.log(`✅ Document sent to ${to}`);
    }
}