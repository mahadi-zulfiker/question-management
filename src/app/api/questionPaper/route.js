import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import { PDFDocument, rgb } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sanitizeQuestion = (q, segmentName) => {
    const sanitized = { ...q };
    if (segmentName === "MCQ") {
        sanitized.question = q.question || "N/A";
        sanitized.options = Array.isArray(q.options) ? q.options.map(opt => opt || "N/A") : ["N/A", "N/A", "N/A", "N/A"];
    } else if (segmentName === "CQ") {
        sanitized.passage = q.passage || "N/A";
        sanitized.questions = Array.isArray(q.questions) ? q.questions.map(ques => ques || "N/A") : ["N/A"];
        sanitized.marks = Array.isArray(q.marks) ? q.marks.map(mark => mark || 0) : sanitized.questions.map(() => 0);
    } else if (segmentName === "SQ") {
        sanitized.question = q.question || "N/A";
        sanitized.type = q.type || "sq";
    }
    return sanitized;
};

export async function GET(req) {
    console.log("GET /api/questionPaper called with query:", req.url);
    try {
        const db = await connectMongoDB();
        const url = new URL(req.url);
        const fetchFilters = url.searchParams.get("fetchFilters");
        const type = url.searchParams.get("type");
        const classNumber = url.searchParams.get("classNumber");
        const subject = url.searchParams.get("subject");
        const chapterNumber = url.searchParams.get("chapterNumber");
        const search = url.searchParams.get("search") || "";

        if (fetchFilters === "true") {
            console.log("Fetching filter options...");
            const classes = await db.collection("classes").find().toArray();
            const classNumbers = [...new Set(classes.map(cls => cls.classNumber * 10))].sort((a, b) => a - b);
            const subjects = [...new Set(classes.map(cls => cls.subject))];
            const chapters = [...new Set(classes.map(cls => ({ number: cls.chapterNumber, name: cls.chapterName })))]
                .filter(ch => ch.number && ch.name)
                .sort((a, b) => a.number - b.number);

            return NextResponse.json({
                success: true,
                data: { classNumbers, subjects, chapters }
            });
        }

        let query = {};
        if (classNumber) query.classNumber = parseInt(classNumber, 10);
        if (subject) query.subject = subject;
        if (chapterNumber) query.chapterNumber = parseInt(chapterNumber, 10);

        let searchQuery = {};
        if (search) {
            searchQuery = {
                $or: [
                    { question: { $regex: search, $options: "i" } },
                    { passage: { $regex: search, $options: "i" } },
                    { questions: { $elemMatch: { $regex: search, $options: "i" } } }
                ]
            };
            query = { $and: [query, searchQuery] };
        }

        let questions = [];
        if (type === "mcq") {
            questions = await db.collection("mcqs").find(query).toArray();
            questions = questions.map(q => ({ ...q, type: "mcq" }));
        } else if (type === "cq") {
            questions = await db.collection("cqs").find(query).toArray();
            questions = questions.map(q => ({ ...q, type: "cq" }));
        } else if (type === "sq") {
            questions = await db.collection("SQ").find(query).toArray();
            questions = questions.map(q => ({ ...q, type: "sq" }));
        } else {
            const mcqs = await db.collection("mcqs").find(query).toArray();
            const cqs = await db.collection("cqs").find(query).toArray();
            const sqs = await db.collection("SQ").find(query).toArray();

            questions = [
                ...mcqs.map(q => ({ ...q, type: "mcq" })),
                ...cqs.map(q => ({ ...q, type: "cq" })),
                ...sqs.map(q => ({ ...q, type: "sq" }))
            ];
        }

        return NextResponse.json({ success: true, data: questions });
    } catch (error) {
        console.error("Error in GET /api/questionPaper:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(req) {
    console.log("POST /api/questionPaper called");
    try {
        const {
            schoolName,
            schoolAddress,
            examName,
            examTime,
            examMarks,
            subjectName,
            segmentName,
            selectedQuestions
        } = await req.json();

        if (!schoolName || !schoolAddress || !examName || !examTime || !examMarks || !subjectName || !segmentName || !selectedQuestions) {
            return NextResponse.json({ error: "❌ সমস্ত প্রয়োজনীয় তথ্য প্রদান করুন!" }, { status: 400 });
        }

        const parsedExamTime = parseInt(examTime, 10);
        const parsedExamMarks = parseInt(examMarks, 10);
        if (isNaN(parsedExamTime) || isNaN(parsedExamMarks)) {
            return NextResponse.json({ error: "❌ পরীক্ষার সময় এবং পূর্ণমান সংখ্যা হতে হবে!" }, { status: 400 });
        }

        if (!Array.isArray(selectedQuestions) || selectedQuestions.length === 0) {
            return NextResponse.json({ error: "❌ নির্বাচিত প্রশ্ন অবশ্যই একটি অ্যারে হতে হবে এবং খালি থাকতে পারবে না!" }, { status: 400 });
        }

        const sanitizedQuestions = selectedQuestions.map(q => sanitizeQuestion(q, segmentName));

        const db = await connectMongoDB();
        const formattedQuestionPaper = {
            schoolName,
            schoolAddress,
            examName,
            examTime: parsedExamTime,
            examMarks: parsedExamMarks,
            subjectName,
            segmentName,
            selectedQuestions: sanitizedQuestions,
            createdAt: new Date()
        };
        await db.collection("formattedQuestionPapers").insertOne(formattedQuestionPaper);

        const pdfDoc = await PDFDocument.create();
        let page = pdfDoc.addPage([595, 842]);
        pdfDoc.registerFontkit(fontkit);

        const fontPath = path.join(__dirname, "..", "..", "..", "..", "public", "fonts", "NotoSansBengali-VariableFont_wdth,wght.ttf");
        let font;
        try {
            const fontBytes = fs.readFileSync(fontPath);
            font = await pdfDoc.embedFont(fontBytes, { subset: true });
        } catch (fontError) {
            console.error("Error loading custom font, falling back to Helvetica:", fontError);
            font = await pdfDoc.embedFont(PDFDocument.Font.Helvetica);
        }

        const margin = 40;
        const pageWidth = 595;
        const pageHeight = 842;
        const contentWidth = pageWidth - 2 * margin;
        let yPosition = pageHeight - margin;

        const drawText = (text, size, options = {}) => {
            if (yPosition < margin + size) {
                page = pdfDoc.addPage([595, 842]);
                yPosition = pageHeight - margin;
            }

            const maxWidth = options.width || contentWidth;
            const lines = [];
            let currentLine = '';
            const words = text.split(' ');

            for (const word of words) {
                const testLine = currentLine ? `${currentLine} ${word}` : word;
                const testWidth = font.widthOfTextAtSize(testLine, size);
                if (testWidth <= maxWidth) {
                    currentLine = testLine;
                } else {
                    if (currentLine) lines.push(currentLine);
                    currentLine = word;
                }
            }
            if (currentLine) lines.push(currentLine);

            const align = options.align || 'left';
            for (const line of lines) {
                let xPosition = margin;
                const lineWidth = font.widthOfTextAtSize(line, size);
                if (align === 'center') {
                    xPosition = margin + (contentWidth - lineWidth) / 2;
                } else if (align === 'right') {
                    xPosition = margin + contentWidth - lineWidth;
                }

                page.drawText(line, {
                    x: xPosition,
                    y: yPosition,
                    size: size,
                    font: font,
                });
                yPosition -= size + 5;
            }
            return lines.length * (size + 5);
        };

        const drawLine = () => {
            if (yPosition < margin + 10) {
                page = pdfDoc.addPage([595, 842]);
                yPosition = pageHeight - margin;
            }
            page.drawLine({
                start: { x: margin, y: yPosition },
                end: { x: pageWidth - margin, y: yPosition },
                thickness: 1.5,
                color: rgb(0, 0, 0),
            });
            yPosition -= 15;
        };

        // Header
        drawText(schoolName || "N/A", 16, { align: 'center' });
        drawText(schoolAddress || "N/A", 12, { align: 'center' });
        yPosition -= 10;
        drawText(examName || "N/A", 14, { align: 'center' });
        drawLine();
        drawText(`বিষয়: ${subjectName || "N/A"}`, 12, { align: 'center' });
        drawText(`সময়: ${parsedExamTime} মিনিট`, 12, { align: 'center' });
        drawText(`পূর্ণমান: ${parsedExamMarks}`, 12, { align: 'center' });
        yPosition -= 10;
        drawText(`বিভাগ: ${segmentName}`, 14, { align: 'center' });
        drawLine();
        yPosition -= 20;

        // Questions
        if (segmentName === "MCQ") {
            sanitizedQuestions.forEach((q, index) => {
                // Question
                drawText(`${index + 1}. ${q.question}`, 12, { align: 'left' });
                yPosition -= 5;

                // Options in two columns (ক, খ) and (গ, ঘ)
                const optionPairs = [];
                for (let i = 0; i < q.options.length; i += 2) {
                    optionPairs.push(q.options.slice(i, i + 2));
                }

                optionPairs.forEach((pair, pairIndex) => {
                    const option1 = pair[0] ? `${String.fromCharCode(2453 + pairIndex * 2)}) ${pair[0]}` : '';
                    const option2 = pair[1] ? `${String.fromCharCode(2453 + pairIndex * 2 + 1)}) ${pair[1]}` : '';
                    
                    // Calculate widths for alignment
                    const option1Width = font.widthOfTextAtSize(option1, 12);
                    const option2Width = font.widthOfTextAtSize(option2, 12);
                    const halfWidth = contentWidth / 2;

                    // Draw first option (ক or গ)
                    if (option1) {
                        page.drawText(option1, {
                            x: margin,
                            y: yPosition,
                            size: 12,
                            font: font,
                        });
                    }

                    // Draw second option (খ or ঘ) if exists
                    if (option2) {
                        page.drawText(option2, {
                            x: margin + halfWidth,
                            y: yPosition,
                            size: 12,
                            font: font,
                        });
                    }

                    yPosition -= 20;
                });

                yPosition -= 10;
            });
        } else if (segmentName === "CQ") {
            sanitizedQuestions.forEach((q, index) => {
                drawText(`প্রশ্ন ${index + 1}:`, 12, { align: 'left' });
                drawText(`উদ্দীপক: ${q.passage}`, 12, { align: 'left' });
                yPosition -= 10;

                q.questions.forEach((ques, i) => {
                    drawText(`    ${String.fromCharCode(2453 + i)}) ${ques} (${q.marks[i]} নম্বর)`, 12, { align: 'left' });
                    yPosition -= 5;
                });

                yPosition -= 15;
            });
        } else if (segmentName === "SQ") {
            sanitizedQuestions.forEach((q, index) => {
                drawText(`${index + 1}. (${q.type}) ${q.question}`, 12, { align: 'left' });
                yPosition -= 15;
            });
        }

        // Footer
        const pages = pdfDoc.getPages();
        pages.forEach((p, index) => {
            p.drawText(`পৃষ্ঠা ${index + 1} / ${pages.length}`, {
                x: pageWidth - margin - 60,
                y: margin - 15,
                size: 10,
                font: font,
                color: rgb(0.5, 0.5, 0.5),
            });
            p.drawText(`${examName} - ${subjectName}`, {
                x: margin,
                y: margin - 15,
                size: 10,
                font: font,
                color: rgb(0.5, 0.5, 0.5),
            });
        });

        const pdfBytes = await pdfDoc.save();
        return new NextResponse(pdfBytes, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="${examName}-${subjectName}.pdf"`,
            },
        });
    } catch (error) {
        console.error("Error in POST /api/questionPaper:", error);
        return NextResponse.json({ error: `❌ সার্ভারে সমস্যা হয়েছে: ${error.message}` }, { status: 500 });
    }
}