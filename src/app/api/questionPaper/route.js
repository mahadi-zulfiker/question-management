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
        sanitized.type = q.type || "N/A";
    }
    return sanitized;
};

const convertLatexToText = (latex) => {
    if (!latex) return "N/A";
    return latex
        .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, "($1)/($2)") // Fractions
        .replace(/\{([^}]+)\}/g, "$1")
        .replace(/\^2/g, "²") // Superscripts
        .replace(/\^3/g, "³")
        .replace(/\^(\d+)/g, "^$1")
        .replace(/\\sqrt\{([^}]+)\}/g, "√($1)") // Square roots
        .replace(/\\times/g, "×") // Multiplication
        .replace(/\\div/g, "÷") // Division
        .replace(/\\alpha/g, "α") // Greek letters
        .replace(/\\beta/g, "β")
        .replace(/\\gamma/g, "γ")
        .replace(/\\pi/g, "π")
        .replace(/\\infty/g, "∞")
        .replace(/\\leq/g, "≤") // Inequalities
        .replace(/\\geq/g, "≥")
        .replace(/\\neq/g, "≠")
        .replace(/\\pm/g, "±")
        .replace(/\\[a-zA-Z]+/g, ""); // Remove unsupported commands
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
            const classNumbers = [...new Set(classes.map(cls => cls.classNumber))].sort((a, b) => a - b);
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
            questionSetNumber,
            subjectCodeNumber,
            information,
            selectedQuestions,
        } = await req.json();

        if (
            !schoolName ||
            !schoolAddress ||
            !examName ||
            !examTime ||
            !examMarks ||
            !subjectName ||
            !segmentName ||
            !selectedQuestions
        ) {
            return NextResponse.json({ error: "❌ সমস্ত প্রয়োজনীয় তথ্য প্রদান করুন!" }, { status: 400 });
        }

        const parsedExamTime = parseInt(examTime, 10);
        const parsedExamMarks = parseInt(examMarks, 10);
        if (isNaN(parsedExamTime) || isNaN(parsedExamMarks)) {
            return NextResponse.json({ error: "❌ পরীক্ষার সময় এবং পূর্ণমান সংখ্যা হতে হবে!" }, { status: 400 });
        }

        if (!Array.isArray(selectedQuestions) || selectedQuestions.length === 0) {
            return NextResponse.json(
                { error: "❌ নির্বাচিত প্রশ্ন অবশ্যই একটি অ্যারে হতে হবে এবং খালি থাকতে পারবে না!" },
                { status: 400 }
            );
        }

        const sanitizedQuestions = selectedQuestions.map((q) => sanitizeQuestion(q, segmentName));

        const db = await connectMongoDB();
        const formattedQuestionPaper = {
            schoolName,
            schoolAddress,
            examName,
            examTime: parsedExamTime,
            examMarks: parsedExamMarks,
            subjectName,
            segmentName,
            questionSetNumber,
            subjectCodeNumber,
            information,
            selectedQuestions: sanitizedQuestions,
            createdAt: new Date(),
        };
        await db.collection("formattedQuestionPapers").insertOne(formattedQuestionPaper);

        const pdfDoc = await PDFDocument.create();
        let page = pdfDoc.addPage([595, 842]); // A4 size in points
        pdfDoc.registerFontkit(fontkit);

        const fontPath = path.join(
            __dirname,
            "..",
            "..",
            "..",
            "..",
            "public",
            "fonts",
            "NotoSansBengali-VariableFont_wdth,wght.ttf"
        );
        let font;
        try {
            const fontBytes = fs.readFileSync(fontPath);
            font = await pdfDoc.embedFont(fontBytes, { subset: true });
        } catch (fontError) {
            console.error("Error loading custom font, falling back to Helvetica:", fontError);
            font = await pdfDoc.embedFont(PDFDocument.Font.Helvetica);
        }

        const margin = 30;
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
            let currentLine = "";
            const words = text.split(" ");

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

            const align = options.align || "left";
            let xPosition = margin;
            if (options.x) {
                xPosition = options.x;
            } else if (align === "center") {
                const lineWidth = font.widthOfTextAtSize(lines[0], size);
                xPosition = margin + (contentWidth - lineWidth) / 2;
            } else if (align === "right") {
                const lineWidth = font.widthOfTextAtSize(lines[0], size);
                xPosition = margin + contentWidth - lineWidth;
            }

            for (const line of lines) {
                page.drawText(line, {
                    x: xPosition,
                    y: yPosition,
                    size: size,
                    font: font,
                    color: rgb(0, 0, 0),
                });
                yPosition -= size + 1;
            }
            return lines.length * (size + 1);
        };

        // Header
        drawText(schoolName || "N/A", 14, { align: "center" });
        drawText(schoolAddress || "N/A", 10, { align: "center" });
        yPosition -= 5;
        drawText(examName || "N/A", 12, { align: "center" });
        drawText(`বিষয়: ${subjectName || "N/A"}`, 10, { align: "center" });
        yPosition -= 5;
        if (questionSetNumber || subjectCodeNumber) {
            let codeText = "";
            if (questionSetNumber) codeText += `বিভাগ কোড: ${questionSetNumber}`;
            if (subjectCodeNumber) codeText += `${questionSetNumber ? "  " : ""}বিষয় কোড: ${subjectCodeNumber}`;
            drawText(codeText, 10, { align: "right" });
        }
        drawText(`সময়: ${examTime} মিনিট`, 10, { x: margin });
        drawText(`পূর্ণমান: ${examMarks}`, 10, { align: "right" });

        if (information) {
            yPosition -= 5;
            drawText("বিশেষ নির্দেশাবলী:", 10);
            drawText(information, 9);
            yPosition -= 5;
        }

        drawText(`বিভাগ: ${segmentName}`, 11, { align: "center" });
        yPosition -= 10;

        // Questions
        if (segmentName === "MCQ") {
            const columnWidth = contentWidth / 2 - 5;
            let currentColumn = 0;
            let xPosition = margin;
            let columnHeight = yPosition;

            sanitizedQuestions.forEach((q, index) => {
                const questionText = convertLatexToText(q.question);
                const questionHeight = drawText(`${index + 1}. ${questionText}`, 8, { width: columnWidth, x: xPosition });

                let optionsHeight = 0;
                const optionPairs = [];
                for (let j = 0; j < (q.options || []).length; j += 2) {
                    optionPairs.push(q.options.slice(j, j + 2));
                }

                optionPairs.forEach((pair, pairIndex) => {
                    const option1 = pair[0] ? `${String.fromCharCode(2453 + pairIndex * 2)}) ${convertLatexToText(pair[0])}` : "";
                    const option2 = pair[1] ? `${String.fromCharCode(2453 + pairIndex * 2 + 1)}) ${convertLatexToText(pair[1])}` : "";
                    if (option1) {
                        optionsHeight += drawText(option1, 7, { width: columnWidth / 2 - 2, x: xPosition });
                    }
                    if (option2) {
                        optionsHeight += drawText(option2, 7, { width: columnWidth / 2 - 2, x: xPosition + columnWidth / 2 + 2 });
                    }
                });

                const totalHeight = questionHeight + optionsHeight + 8;
                columnHeight -= totalHeight;

                if (columnHeight < margin + 40) {
                    currentColumn++;
                    if (currentColumn > 1) {
                        page = pdfDoc.addPage([595, 842]);
                        yPosition = pageHeight - margin;
                        currentColumn = 0;
                    }
                    xPosition = margin + (currentColumn * (columnWidth + 10));
                    columnHeight = yPosition;
                    yPosition -= totalHeight;
                } else {
                    yPosition -= 8;
                }
            });
        } else if (segmentName === "CQ") {
            sanitizedQuestions.forEach((q, index) => {
                if (yPosition < margin + 80) {
                    page = pdfDoc.addPage([595, 842]);
                    yPosition = pageHeight - margin;
                }

                drawText(`প্রশ্ন ${index + 1}:`, 10);
                yPosition -= 3;
                drawText(`উদ্দীপক: ${convertLatexToText(q.passage)}`, 9);
                yPosition -= 5;

                (q.questions || []).forEach((ques, i) => {
                    drawText(`${String.fromCharCode(2453 + i)}) ${convertLatexToText(ques)} (${q.marks[i] || 0} নম্বর)`, 9, { x: margin + 10 });
                    yPosition -= 5;
                });

                yPosition -= 10;
            });
        } else if (segmentName === "SQ") {
            sanitizedQuestions.forEach((q, index) => {
                if (yPosition < margin + 40) {
                    page = pdfDoc.addPage([595, 842]);
                    yPosition = pageHeight - margin;
                }

                drawText(`${index + 1}. (${q.type}) ${convertLatexToText(q.question)}`, 9);
                yPosition -= 8;
            });
        }

        // Footer
        const pages = pdfDoc.getPages();
        pages.forEach((p, index) => {
            p.drawText(`পৃষ্ঠা ${index + 1} / ${pages.length}`, {
                x: pageWidth - margin - 60,
                y: margin - 10,
                size: 8,
                font: font,
                color: rgb(0, 0, 0),
            });
            p.drawText(`${examName || "N/A"} - ${subjectName || "N/A"}`, {
                x: margin,
                y: margin - 10,
                size: 8,
                font: font,
                color: rgb(0, 0, 0),
            });
        });

        const pdfBytes = await pdfDoc.save();
        return new NextResponse(pdfBytes, {
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `attachment; filename="${examName}-${subjectName}.pdf"`,
            },
        });
    } catch (error) {
        console.error("Error in POST /api/questionPaper:", error);
        return NextResponse.json({ error: `❌ সার্ভারে সমস্যা হয়েছে: ${error.message}` }, { status: 500 });
    }
}