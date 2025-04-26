import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import { PDFDocument, rgb } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";

// Sanitize question data based on segment type
const sanitizeQuestion = (q, segmentName) => {
  try {
    const sanitized = { ...q };
    if (segmentName === "MCQ") {
      sanitized.question = q.question?.trim() || "N/A";
      sanitized.options = Array.isArray(q.options)
        ? q.options.map((opt) => (opt?.trim() || "N/A")).slice(0, 4)
        : ["N/A", "N/A", "N/A", "N/A"];
    } else if (segmentName === "CQ") {
      sanitized.passage = q.passage?.trim() || "N/A";
      sanitized.questions = Array.isArray(q.questions)
        ? q.questions.map((ques) => (ques?.trim() || "N/A"))
        : ["N/A"];
      sanitized.marks = Array.isArray(q.marks)
        ? q.marks.map((mark) => Number(mark) || 0)
        : sanitized.questions.map(() => 0);
    } else if (segmentName === "SQ") {
      sanitized.question = q.question?.trim() || "N/A";
      sanitized.type = q.type?.trim() || "N/A";
    }
    return sanitized;
  } catch (error) {
    console.error(`Error sanitizing question for ${segmentName}:`, error);
    throw new Error("Invalid question data format");
  }
};

// Convert LaTeX to plain text for PDF rendering
const convertLatexToText = (latex) => {
  if (!latex || typeof latex !== "string") return "N/A";
  try {
    return latex
      .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, "($1)/($2)")
      .replace(/\{([^}]+)\}/g, "$1")
      .replace(/\^2/g, "²")
      .replace(/\^3/g, "³")
      .replace(/\^(\d+)/g, "^$1")
      .replace(/\\sqrt\{([^}]+)\}/g, "√($1)")
      .replace(/\\times/g, "×")
      .replace(/\\div/g, "÷")
      .replace(/\\alpha/g, "α")
      .replace(/\\beta/g, "β")
      .replace(/\\gamma/g, "γ")
      .replace(/\\pi/g, "π")
      .replace(/\\infty/g, "∞")
      .replace(/\\leq/g, "≤")
      .replace(/\\geq/g, "≥")
      .replace(/\\neq/g, "≠")
      .replace(/\\pm/g, "±")
      .replace(/\\[a-zA-Z]+/g, "");
  } catch (error) {
    console.error("Error converting LaTeX:", error);
    return latex;
  }
};

// Detect if text contains non-Latin characters
const hasNonLatinCharacters = (text) => {
  if (!text) return false;
  return /[^-\u007F]/.test(text); // Matches any character outside ASCII range
};

// GET handler for fetching questions or filters
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
      const classNumbers = [...new Set(classes.map((cls) => cls.classNumber))].sort((a, b) => a - b);
      const subjects = [...new Set(classes.map((cls) => cls.subject))];
      const chapters = [...new Set(classes.map((cls) => ({ number: cls.chapterNumber, name: cls.chapterName })))]
        .filter((ch) => ch.number && ch.name)
        .sort((a, b) => a.number - b.number);

      return NextResponse.json({
        success: true,
        data: { classNumbers, subjects, chapters },
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
          { questions: { $elemMatch: { $regex: search, $options: "i" } } },
        ],
      };
      query = { $and: [query, searchQuery] };
    }

    let questions = [];
    if (type === "mcq") {
      questions = await db.collection("mcqs").find(query).toArray();
      questions = questions.map((q) => ({ ...q, type: "mcq" }));
    } else if (type === "cq") {
      questions = await db.collection("cqs").find(query).toArray();
      questions = questions.map((q) => ({ ...q, type: "cq" }));
    } else if (type === "sq") {
      questions = await db.collection("SQ").find(query).toArray();
      questions = questions.map((q) => ({ ...q, type: "sq" }));
    } else {
      const mcqs = await db.collection("mcqs").find(query).toArray();
      const cqs = await db.collection("cqs").find(query).toArray();
      const sqs = await db.collection("SQ").find(query).toArray();

      questions = [
        ...mcqs.map((q) => ({ ...q, type: "mcq" })),
        ...cqs.map((q) => ({ ...q, type: "cq" })),
        ...sqs.map((q) => ({ ...q, type: "sq" })),
      ];
    }

    return NextResponse.json({ success: true, data: questions });
  } catch (error) {
    console.error("Error in GET /api/questionPaper:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST handler for generating PDF
export async function POST(req) {
  console.log("POST /api/questionPaper called");
  try {
    // Parse request body
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

    // Validate required fields
    if (
      !schoolName?.trim() ||
      !schoolAddress?.trim() ||
      !examName?.trim() ||
      !examTime?.trim() ||
      !examMarks?.trim() ||
      !subjectName?.trim() ||
      !segmentName?.trim() ||
      !Array.isArray(selectedQuestions) ||
      selectedQuestions.length === 0
    ) {
      return NextResponse.json({ error: "All required fields must be provided and questions must be selected!" }, { status: 400 });
    }

    const parsedExamTime = parseInt(examTime, 10);
    const parsedExamMarks = parseInt(examMarks, 10);
    if (isNaN(parsedExamTime) || isNaN(parsedExamMarks) || parsedExamTime <= 0 || parsedExamMarks <= 0) {
      return NextResponse.json({ error: "Exam time and marks must be valid positive numbers!" }, { status: 400 });
    }

    // Validate segmentName
    if (!["MCQ", "CQ", "SQ"].includes(segmentName)) {
      return NextResponse.json({ error: "Invalid segment name!" }, { status: 400 });
    }

    // Sanitize questions
    const sanitizedQuestions = selectedQuestions.map((q) => sanitizeQuestion(q, segmentName));

    // Check for non-Latin characters
    const allTextFields = [
      schoolName,
      schoolAddress,
      examName,
      subjectName,
      questionSetNumber,
      subjectCodeNumber,
      information,
      ...sanitizedQuestions.flatMap((q) =>
        segmentName === "MCQ"
          ? [q.question, ...q.options]
          : segmentName === "CQ"
          ? [q.passage, ...q.questions]
          : [q.question, q.type]
      ),
    ].filter(Boolean);

    const hasBengaliText = allTextFields.some(hasNonLatinCharacters);

    // Save to database
    const db = await connectMongoDB();
    const formattedQuestionPaper = {
      schoolName: schoolName.trim(),
      schoolAddress: schoolAddress.trim(),
      examName: examName.trim(),
      examTime: parsedExamTime,
      examMarks: parsedExamMarks,
      subjectName: subjectName.trim(),
      segmentName,
      questionSetNumber: questionSetNumber?.trim() || "",
      subjectCodeNumber: subjectCodeNumber?.trim() || "",
      information: information?.trim() || "",
      selectedQuestions: sanitizedQuestions,
      createdAt: new Date(),
    };
    await db.collection("formattedQuestionPapers").insertOne(formattedQuestionPaper);

    // Initialize PDF document
    const pdfDoc = await PDFDocument.create();
    let page = pdfDoc.addPage([595, 842]); // A4 size
    pdfDoc.registerFontkit(fontkit);

    // Load font dynamically from Google Drive
    let font;
    const fontUrl = "https://drive.google.com/uc?export=download&id=18qSzEkOu1ZuHRimR-MzSnljDsLJp-XE5";
    try {
      console.log(`Attempting to fetch font from: ${fontUrl}`);
      const fontResponse = await fetch(fontUrl);
      if (!fontResponse.ok) {
        throw new Error(`Failed to fetch font: ${fontResponse.statusText}`);
      }
      const fontBytes = await fontResponse.arrayBuffer();
      font = await pdfDoc.embedFont(fontBytes, { subset: true });
      console.log("Noto Sans Bengali font loaded successfully");
    } catch (fontError) {
      console.error("Failed to load Noto Sans Bengali font:", fontError);
      if (hasBengaliText) {
        return NextResponse.json(
          { error: "Cannot generate PDF: Font required for Bengali text could not be loaded." },
          { status: 500 }
        );
      }
      console.warn("Falling back to Helvetica due to font loading failure");
      font = await pdfDoc.embedFont("Helvetica");
    }

    // PDF layout constants
    const margin = 30;
    const pageWidth = 595;
    const pageHeight = 842;
    const contentWidth = pageWidth - 2 * margin;
    let yPosition = pageHeight - margin;

    // Helper function to draw text with word wrapping
    const drawText = (text, size, options = {}) => {
      if (yPosition < margin + size) {
        page = pdfDoc.addPage([595, 842]);
        yPosition = pageHeight - margin;
      }

      const maxWidth = options.width || contentWidth;
      const lines = [];
      let currentLine = "";
      const words = (text || "").split(" ");

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
        try {
          page.drawText(line, {
            x: xPosition,
            y: yPosition,
            size,
            font,
            color: rgb(0, 0, 0),
          });
        } catch (drawError) {
          console.error(`Error drawing text: "${line}"`, drawError);
          if (hasNonLatinCharacters(line)) {
            throw new Error("Failed to render Bengali text. Ensure Noto Sans Bengali font is used.");
          }
          // Skip problematic text but continue rendering
        }
        yPosition -= size + 2;
      }
      return lines.length * (size + 2);
    };

    // Draw header
    drawText(schoolName.trim(), 14, { align: "center" });
    drawText(schoolAddress.trim(), 10, { align: "center" });
    yPosition -= 5;
    drawText(examName.trim(), 12, { align: "center" });
    drawText(`Subject: ${subjectName.trim()}`, 10, { align: "center" });
    yPosition -= 5;

    if (questionSetNumber || subjectCodeNumber) {
      const codeText = [
        questionSetNumber ? `Section Code: ${questionSetNumber.trim()}` : "",
        subjectCodeNumber ? `Subject Code: ${subjectCodeNumber.trim()}` : "",
      ]
        .filter(Boolean)
        .join("  ");
      drawText(codeText, 10, { align: "right" });
    }

    drawText(`Time: ${parsedExamTime} minutes`, 10, { x: margin });
    drawText(`Total Marks: ${parsedExamMarks}`, 10, { align: "right" });

    if (information) {
      yPosition -= 5;
      drawText("Special Instructions:", 10);
      drawText(information.trim(), 9);
      yPosition -= 5;
    }

    drawText(`Section: ${segmentName}`, 11, { align: "center" });
    yPosition -= 10;

    // Draw questions based on segment type
    if (segmentName === "MCQ") {
      const columnWidth = contentWidth / 2 - 5;
      let currentColumn = 0;
      let xPosition = margin;
      let columnHeight = yPosition;

      sanitizedQuestions.forEach((q, index) => {
        const questionText = convertLatexToText(q.question);
        const questionHeight = drawText(`${index + 1}. ${questionText}`, 8, { width: columnWidth, x: xPosition });

        let optionsHeight = 0;
        q.options.forEach((opt, i) => {
          const optionText = `${String.fromCharCode(97 + i)}) ${convertLatexToText(opt)}`;
          optionsHeight += drawText(optionText, 7, { width: columnWidth - 10, x: xPosition + 10 });
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
          xPosition = margin + currentColumn * (columnWidth + 10);
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

        drawText(`Question ${index + 1}:`, 10);
        yPosition -= 3;
        drawText(`Passage: ${convertLatexToText(q.passage)}`, 9);
        yPosition -= 5;

        q.questions.forEach((ques, i) => {
          const mark = q.marks[i] || 0;
          drawText(`${String.fromCharCode(97 + i)}) ${convertLatexToText(ques)} (${mark} marks)`, 9, { x: margin + 10 });
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

    // Add footer to all pages
    const pages = pdfDoc.getPages();
    pages.forEach((p, index) => {
      p.drawText(`Page ${index + 1} / ${pages.length}`, {
        x: pageWidth - margin - 60,
        y: margin - 10,
        size: 8,
        font,
        color: rgb(0, 0, 0),
      });
      p.drawText(`${examName.trim()} - ${subjectName.trim()}`, {
        x: margin,
        y: margin - 10,
        size: 8,
        font,
        color: rgb(0, 0, 0),
      });
    });

    // Save and return PDF
    const pdfBytes = await pdfDoc.save();
    return new NextResponse(pdfBytes, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${examName.trim()}-${subjectName.trim()}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Error in POST /api/questionPaper:", error);
    return NextResponse.json({ error: `Server error: ${error.message}` }, { status: 500 });
  }
}