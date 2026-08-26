import { jsPDF } from "jspdf";

export interface WardPdfData {
    candidateId: string | number;
    candidateName: string;
    partyName: string;
    wardNo: number;
    education: string;
    activeCases: number;
    closedCases: number;
    averageRating: number | null;
    totalRatings: number;
    promises: { promise_text: string; category: string }[];
    contactMobile: string | null;
    contactEmail: string | null;
}

/**
 * Generates a styled corporator report card PDF server-side using jsPDF.
 * Returns the PDF as a Buffer ready for upload.
 */
export function generateWardPdf(data: WardPdfData): Buffer {
    const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
    });

    const pageWidth = 210;
    const margin = 15;
    const contentWidth = pageWidth - 2 * margin;
    let y = margin;

    // ── Background ──────────────────────────────────────────
    doc.setFillColor(251, 234, 192); // #FBEAC0
    doc.rect(0, 0, 210, 297, "F");

    // ── Eyebrow strip ───────────────────────────────────────
    doc.setFontSize(7);
    doc.setFont("courier", "bold");
    doc.setTextColor(140, 130, 110);
    doc.text("MUMBAITRACKER  ·  BMC CIVIC REPORT CARD", margin, y);
    const ticketNo = String(data.candidateId ?? "0").toString().padStart(6, "0");
    doc.text(`NO. ${ticketNo}`, pageWidth - margin, y, { align: "right" });
    y += 6;

    // ── Thin separator ──────────────────────────────────────
    doc.setDrawColor(180, 170, 155);
    doc.setLineWidth(0.4);
    doc.line(margin, y, pageWidth - margin, y);
    y += 10;

    // ── Candidate Name ──────────────────────────────────────
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(28, 23, 16);
    const nameLines = doc.splitTextToSize(
        data.candidateName.toUpperCase(),
        contentWidth - 40
    );
    doc.text(nameLines, margin, y);
    y += nameLines.length * 8;

    // ── Party badge ─────────────────────────────────────────
    y += 1;
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    const partyTextWidth = doc.getTextWidth(data.partyName) + 6;
    doc.setFillColor(251, 192, 45); // #FBC02D
    doc.rect(margin, y - 3.5, partyTextWidth, 5.5, "F");
    doc.setTextColor(28, 23, 16);
    doc.text(data.partyName, margin + 3, y);

    // ── Ward number box (top-right) ─────────────────────────
    const wardBoxW = 22;
    const wardBoxX = pageWidth - margin - wardBoxW;
    const wardBoxY = y - 18;

    doc.setFontSize(6);
    doc.setFont("courier", "bold");
    doc.setTextColor(140, 130, 110);
    doc.text("WARD NO.", wardBoxX + wardBoxW / 2, wardBoxY, { align: "center" });

    doc.setFillColor(251, 192, 45);
    doc.setDrawColor(28, 23, 16);
    doc.setLineWidth(0.5);
    doc.rect(wardBoxX, wardBoxY + 2, wardBoxW, 13, "FD");

    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(28, 23, 16);
    doc.text(String(data.wardNo), wardBoxX + wardBoxW / 2, wardBoxY + 11, {
        align: "center",
    });

    y += 10;

    // ── Separator ───────────────────────────────────────────
    doc.setDrawColor(180, 170, 155);
    doc.setLineWidth(0.4);
    doc.line(margin, y, pageWidth - margin, y);
    y += 8;

    // ── Stats Grid (3 columns) ──────────────────────────────
    const gap = 4;
    const colWidth = (contentWidth - gap * 2) / 3;
    const statsHeight = 20;

    // Format education
    let education = data.education || "Not Available";
    if (/^\d+$/.test(education.trim())) {
        education = `${education.trim()}th Pass`;
    }

    drawStatBox(doc, margin, y, colWidth, statsHeight, "EDUCATION", education.toUpperCase());

    const hasLegalCases = data.activeCases > 0 || data.closedCases > 0;
    const legalValue = `${data.activeCases} Pending, ${data.closedCases} Convicted`;
    drawStatBox(
        doc,
        margin + colWidth + gap,
        y,
        colWidth,
        statsHeight,
        hasLegalCases ? "⚠ LEGAL HISTORY" : "LEGAL HISTORY",
        hasLegalCases ? legalValue : "Clean Record"
    );

    const ratingValue =
        data.averageRating !== null
            ? `${data.averageRating.toFixed(1)} / 5`
            : "N/A";
    const ratingSub =
        data.totalRatings > 0 ? `${data.totalRatings} reviews` : "";
    drawStatBox(
        doc,
        margin + 2 * (colWidth + gap),
        y,
        colWidth,
        statsHeight,
        "AVG RATING",
        ratingValue,
        ratingSub
    );

    y += statsHeight + 8;

    // ── Separator ───────────────────────────────────────────
    doc.setDrawColor(180, 170, 155);
    doc.line(margin, y, pageWidth - margin, y);
    y += 8;

    // ── Promises Section ────────────────────────────────────
    if (data.promises.length > 0) {
        // Section heading with accent bar
        doc.setFillColor(251, 192, 45);
        doc.rect(margin, y - 3, 1.5, 5, "F");

        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(28, 23, 16);
        doc.text("CANDIDATE PROMISES", margin + 5, y);
        y += 8;

        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");

        for (const promise of data.promises) {
            if (y > 265) break; // leave room for footer

            const bulletText = `•  ${promise.promise_text}`;
            const lines = doc.splitTextToSize(bulletText, contentWidth - 8);

            doc.setTextColor(40, 35, 25);
            doc.text(lines, margin + 3, y);
            y += lines.length * 4;

            // Category tag
            doc.setFontSize(7);
            doc.setFont("courier", "normal");
            doc.setTextColor(140, 130, 110);
            doc.text(`(${promise.category})`, margin + 7, y);
            y += 5;

            doc.setFontSize(9);
            doc.setFont("helvetica", "normal");
        }
        y += 2;
    } else {
        doc.setFontSize(9);
        doc.setFont("helvetica", "italic");
        doc.setTextColor(140, 130, 110);
        doc.text("No promises recorded yet.", margin, y);
        y += 8;
    }

    // ── Separator ───────────────────────────────────────────
    doc.setDrawColor(180, 170, 155);
    doc.line(margin, y, pageWidth - margin, y);
    y += 8;

    // ── Contact Section ─────────────────────────────────────
    doc.setFontSize(6);
    doc.setFont("courier", "bold");
    doc.setTextColor(140, 130, 110);
    doc.text("CONTACT DETAILS", margin, y);
    y += 5;

    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(28, 23, 16);

    const phone = data.contactMobile || "Not available";
    const email = data.contactEmail || "Not available";
    doc.text(`Phone:  ${phone}`, margin, y);
    doc.text(`Email:  ${email}`, margin + contentWidth / 2, y);
    y += 10;

    // ── Footer ──────────────────────────────────────────────
    doc.setDrawColor(180, 170, 155);
    doc.line(margin, y, pageWidth - margin, y);
    y += 5;

    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(140, 130, 110);
    doc.text("Generated by mumbaitracker.in", margin, y);
    doc.text(
        `Full profile: mumbaitracker.in/candidates/${data.candidateId}`,
        pageWidth - margin,
        y,
        { align: "right" }
    );
    y += 4;
    doc.setFontSize(6);
    doc.text("By Ansh Shetty  |  samaaj.foundation", margin, y);

    // ── Return as Buffer ────────────────────────────────────
    const arrayBuffer = doc.output("arraybuffer");
    return Buffer.from(arrayBuffer);
}

function drawStatBox(
    doc: jsPDF,
    x: number,
    y: number,
    w: number,
    h: number,
    label: string,
    value: string,
    subtext?: string
) {
    // Box background
    doc.setFillColor(248, 243, 232);
    doc.setDrawColor(200, 190, 170);
    doc.setLineWidth(0.3);
    doc.roundedRect(x, y, w, h, 1.5, 1.5, "FD");

    // Label
    doc.setFontSize(5.5);
    doc.setFont("courier", "bold");
    doc.setTextColor(140, 130, 110);
    doc.text(label, x + 3, y + 4.5);

    // Value (may need wrapping)
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(28, 23, 16);
    const valueLines = doc.splitTextToSize(value, w - 6);
    doc.text(valueLines, x + 3, y + 11);

    // Subtext
    if (subtext) {
        doc.setFontSize(5.5);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(160, 150, 135);
        doc.text(subtext, x + 3, y + h - 2.5);
    }
}
