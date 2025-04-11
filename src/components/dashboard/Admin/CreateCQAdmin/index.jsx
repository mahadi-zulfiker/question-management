"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import * as XLSX from "xlsx";
import Head from "next/head";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import DecoupledEditor from "@ckeditor/ckeditor5-build-decoupled-document";
import { convert } from "mathml-to-latex";

// Utility Functions (unchanged from your original)
const normalizeText = (text) => text.normalize("NFC");

const gcd = (a, b) => {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) {
    const temp = b;
    b = a % b;
    a = temp;
  }
  return a;
};

const simplifyFraction = (numerator, denominator) => {
  const divisor = gcd(numerator, denominator);
  return {
    numerator: numerator / divisor,
    denominator: denominator / divisor,
  };
};

const repeatingDecimalToFraction = (decimalStr) => {
  const match = decimalStr.match(/^(\d*)\.(\d*?)(\d*?)̇$/);
  if (!match) return null;

  const wholePart = match[1] ? parseInt(match[1]) : 0;
  const nonRepeatingPart = match[2] || "";
  const repeatingPart = match[3] || "";
  const nonRepeatingLength = nonRepeatingPart.length;
  const repeatingLength = repeatingPart.length;

  if (repeatingLength === 0) {
    if (nonRepeatingPart) {
      const numerator = parseInt(nonRepeatingPart);
      const denominator = Math.pow(10, nonRepeatingLength);
      const { numerator: simplifiedNum, denominator: simplifiedDenom } = simplifyFraction(
        numerator + wholePart * denominator,
        denominator
      );
      return `\\frac{${simplifiedNum}}{${simplifiedDenom}}`;
    }
    return null;
  }

  let numerator = parseInt(repeatingPart);
  let denominator = Math.pow(10, repeatingLength) - 1;

  if (nonRepeatingLength > 0) {
    const nonRepeatingValue = parseInt(nonRepeatingPart);
    numerator += nonRepeatingValue * (Math.pow(10, repeatingLength) - 1);
    denominator *= Math.pow(10, nonRepeatingLength);
    numerator += wholePart * denominator;
  } else {
    numerator += wholePart * denominator;
  }

  const { numerator: simplifiedNum, denominator: simplifiedDenom } = simplifyFraction(numerator, denominator);
  return `\\frac{${simplifiedNum}}{${simplifiedDenom}}`;
};

const cleanTextForLatex = (text) => {
  text = text.replace(/[\u00A0\u202F]/g, " ").replace(/\u2044/g, "/").normalize("NFC");
  text = text.replace(/\s+/g, " ");
  text = text.replace(/(\d*\.\d+)( ̇)+/g, (match, number) => {
    const parts = number.split(".");
    const wholePart = parts[0];
    const decimalPart = parts[1];
    const dotCount = (match.match(/ ̇/g) || []).length;
    const repeatingStart = decimalPart.length - dotCount;
    const nonRepeatingPart = decimalPart.slice(0, repeatingStart > 0 ? repeatingStart : 0);
    const repeatingPart = decimalPart.slice(repeatingStart > 0 ? repeatingStart : 0);

    if (repeatingPart) {
      const repeatingWithDots = repeatingPart
        .split("")
        .map((digit) => `${digit}\\rdot`)
        .join("");
      return `${wholePart}.${nonRepeatingPart}${repeatingWithDots}`;
    }
    return number;
  });
  text = text.replace(
    /(\d+\.\d*|\d+|\d*\.\d+\\rdot)([ক-ঢ়ঁ-ঃা-ৄে-ৈো-ৌ০-৯])/g,
    "$1\\ $2"
  );
  text = text.replace(
    /([ক-ঢ়ঁ-ঃা-ৄে-ৈো-ৌ০-৯]+(?:\s+[ক-ঢ়ঁ-ঃা-ৄে-ৈো-ৌ০-৯]+)*(?:[।,:;]|\s|$))/g,
    (match) => {
      const content = match.trim();
      const trailing = match.slice(content.length);
      if (!/^\d+$/.test(content) && !content.includes("/")) {
        return `\\text{${content}}${trailing}`;
      }
      return match;
    }
  );
  text = text.replace(/(\d+)\s+(\d+)\/(\d+)/g, (match, whole, num, denom) => {
    const { numerator, denominator } = simplifyFraction(parseInt(num), parseInt(denom));
    return `${whole}\\ \\frac{${numerator}}{${denominator}}`;
  });
  text = text.replace(/(\d+)\/(\d+)/g, (match, num, denom) => {
    const { numerator, denominator } = simplifyFraction(parseInt(num), parseInt(denom));
    return `\\frac{${numerator}}{${denominator}}`;
  });
  text = text.replace(/\^(\d+|\w+)/g, "^{$1}");
  text = text.replace(/\((.*?)\)\^(\d+|\w+)/g, "($1)^{$2}");
  text = text.replace(/sqrt\((.*?)\)/g, "\\sqrt{$1}");
  text = text.replace(/½/g, "\\frac{1}{2}");
  text = text.replace(/²/g, "^{2}");
  text = text.replace(/³/g, "^{3}");
  text = text.replace(/≥/g, "\\geq");
  text = text.replace(/≤/g, "\\leq");
  text = text.replace(/≠/g, "\\neq");
  return text;
};

const extractFractionFromHTML = (element) => {
  const sup = element.querySelector("sup");
  const sub = element.querySelector("sub");
  if (sup && sub) {
    const numerator = sup.textContent.trim();
    const denominator = sub.textContent.trim();
    if (numerator && denominator && !isNaN(numerator) && !isNaN(denominator)) {
      return `${numerator}/${denominator}`;
    }
  }
  return null;
};

const extractFractionFromMathML = (element) => {
  const fractionElements = Array.from(element.querySelectorAll("*")).filter(
    (el) => el.localName === "f" && el.namespaceURI === "http://schemas.microsoft.com/office/2004/12/omml"
  );
  if (fractionElements.length > 0) {
    const fractionElement = fractionElements[0];
    const numerator = fractionElement
      .querySelector("*[localName='num'] *[localName='r']")
      ?.textContent.trim();
    const denominator = fractionElement
      .querySelector("*[localName='den'] *[localName='r']")
      ?.textContent.trim();
    if (numerator && denominator && !isNaN(numerator) && !isNaN(denominator)) {
      return `${numerator}/${denominator}`;
    }
  }
  return null;
};

const extractRepeatingDecimalFromMathML = (element) => {
  const accElements = Array.from(element.querySelectorAll("*")).filter(
    (el) => el.localName === "acc" && el.namespaceURI === "http://schemas.microsoft.com/office/2004/12/omml"
  );
  if (accElements.length === 0) return null;

  let wholePart = "";
  let decimalPart = "";
  let repeatingPart = "";
  let isRepeating = false;

  const parent = element.closest("*[localName='r']");
  if (!parent) return null;

  const siblings = Array.from(parent.childNodes);
  siblings.forEach((node) => {
    if (node.nodeType === Node.ELEMENT_NODE) {
      if (node.localName === "t") {
        const text = node.textContent.trim();
        if (text) {
          if (!isRepeating) {
            if (text.includes(".")) {
              const [whole, decimal] = text.split(".");
              wholePart = whole || "0";
              decimalPart += decimal || "";
            } else {
              if (decimalPart) {
                decimalPart += text;
              } else {
                wholePart += text;
              }
            }
          } else {
            repeatingPart += text;
          }
        }
      } else if (node.localName === "acc") {
        const chr = node.querySelector("*[localName='accPr'] *[localName='chr']")?.getAttribute("m:val");
        const base = node.querySelector("*[localName='e'] *[localName='r']")?.textContent.trim();
        if (chr === "̇" && base) {
          if (!isRepeating) isRepeating = true;
          repeatingPart += base;
        }
      }
    }
  });

  if (!wholePart && !decimalPart && !repeatingPart) return null;

  const dotCount = repeatingPart.length;
  if (dotCount === 0) return null;

  return `${wholePart || "0"}${decimalPart || repeatingPart ? "." : ""}${decimalPart}${repeatingPart}${" ̇".repeat(dotCount)}`;
};

const extractMatrixFromMathML = (element) => {
  const mtable = element.querySelector("mtable");
  if (!mtable) return null;

  const rows = Array.from(mtable.querySelectorAll("mtr"));
  if (rows.length === 0) return null;

  const matrixRows = rows.map((row) => {
    const cells = Array.from(row.querySelectorAll("mtd"));
    return cells
      .map((cell) => cell.textContent.trim() || "0")
      .join(" & ");
  });

  return `\\begin{bmatrix} ${matrixRows.join(" \\\\ ")} \\end{bmatrix}`;
};

export default function CreateCQAdmin() {
  // State Management
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [subjectParts, setSubjectParts] = useState([]);
  const [selectedSubjectPart, setSelectedSubjectPart] = useState("");
  const [chapters, setChapters] = useState([]);
  const [selectedChapterNumber, setSelectedChapterNumber] = useState("");
  const [selectedChapterName, setSelectedChapterName] = useState("");
  const [cqType, setCQType] = useState("");
  const [isMultipleCQs, setIsMultipleCQs] = useState(false);

  const [cqs, setCQs] = useState([
    {
      passage: "",
      questions: ["", "", "", ""],
      answers: ["", "", "", ""],
      image: null,
      imageAlignment: "center",
      videoLink: "",
    },
  ]);

  // Reset CQs when cqType changes
  useEffect(() => {
    setCQs([
      {
        passage: "",
        questions: cqType === "mathCQ" ? ["", "", ""] : ["", "", "", ""],
        answers: cqType === "mathCQ" ? ["", "", ""] : ["", "", "", ""],
        image: null,
        imageAlignment: "center",
        videoLink: "",
      },
    ]);
  }, [cqType]);

  // Fetch Classes
  useEffect(() => {
    async function fetchClasses() {
      try {
        const res = await fetch("/api/cq");
        const data = await res.json();
        setClasses(data);
      } catch (error) {
        toast.error("❌ ক্লাস লোড করতে সমস্যা হয়েছে!");
      }
    }
    fetchClasses();
  }, []);

  // Fetch Class Data
  useEffect(() => {
    async function fetchClassData() {
      if (!selectedClass) {
        setSubjects([]);
        setSubjectParts([]);
        setChapters([]);
        setSelectedSubject("");
        setSelectedSubjectPart("");
        setSelectedChapterNumber("");
        setSelectedChapterName("");
        return;
      }

      try {
        const res = await fetch(`/api/cq?classNumber=${selectedClass}`);
        const data = await res.json();

        if (data.length > 0) {
          const subjects = [...new Set(data.map((item) => item.subject))];
          const subjectParts = [...new Set(data.map((item) => item.subjectPart).filter(Boolean))];
          const chapters = [
            ...new Set(
              data.map((item) => ({
                chapterNumber: item.chapterNumber,
                chapterName: item.chapterName,
              }))
            ),
          ];
          setSubjects(subjects);
          setSubjectParts(subjectParts);
          setChapters(chapters);
        } else {
          setSubjects([]);
          setSubjectParts([]);
          setChapters([]);
          toast.info("⚠️ এই ক্লাসের জন্য কোনো ডেটা নেই।");
        }
      } catch (error) {
        toast.error("❌ ডেটা লোড করতে সমস্যা হয়েছে!");
      }
    }
    fetchClassData();
  }, [selectedClass]);

  // Handlers
  const addNewCQ = useCallback(() => {
    setCQs((prev) => [
      ...prev,
      {
        passage: "",
        questions: cqType === "mathCQ" ? ["", "", ""] : ["", "", "", ""],
        answers: cqType === "mathCQ" ? ["", "", ""] : ["", "", "", ""],
        image: null,
        imageAlignment: "center",
        videoLink: "",
      },
    ]);
  }, [cqType]);

  const handleFieldChange = useCallback((cqIndex, field, index, data) => {
    setCQs((prev) => {
      const newCQs = [...prev];
      if (field === "passage") {
        newCQs[cqIndex].passage = data;
      } else if (field === "question") {
        newCQs[cqIndex].questions[index] = data;
      } else if (field === "answer") {
        newCQs[cqIndex].answers[index] = data;
      }
      return newCQs;
    });
  }, []);

  const handleImageChange = useCallback((index, e) => {
    const file = e.target.files[0];
    if (file) {
      setCQs((prev) => {
        const newCQs = [...prev];
        newCQs[index].image = file;
        return newCQs;
      });
    }
  }, []);

  const handleImageAlignmentChange = useCallback((index, value) => {
    setCQs((prev) => {
      const newCQs = [...prev];
      newCQs[index].imageAlignment = value;
      return newCQs;
    });
  }, []);

  const handleVideoLinkChange = useCallback((index, value) => {
    setCQs((prev) => {
      const newCQs = [...prev];
      newCQs[index].videoLink = value;
      return newCQs;
    });
  }, []);

  const handlePaste = useCallback(
    (cqIndex, field, index, editor, clipboardData) => {
      let pastedData = "";

      const mathml = clipboardData.getData("application/mathml+xml");
      if (mathml) {
        try {
          pastedData = convert(mathml);
        } catch (error) {
          console.error("MathML conversion error:", error);
          toast.error("❌ MathML প্রক্রিয়া করা যায়নি। LaTeX ফরম্যাটে লিখুন।");
        }
      }

      if (!pastedData) {
        const html = clipboardData.getData("text/html");
        if (html) {
          const parser = new DOMParser();
          const doc = parser.parseFromString(html, "text/html");

          const mathmlElement = doc.querySelector("math");
          if (mathmlElement) {
            try {
              const matrixLatex = extractMatrixFromMathML(mathmlElement);
              pastedData = matrixLatex || convert(new XMLSerializer().serializeToString(mathmlElement));
            } catch (error) {
              console.error("HTML MathML conversion error:", error);
              toast.error("❌ HTML থেকে MathML প্রক্রিয়া করা যায়নি। LaTeX ফরম্যাটে লিখুন।");
            }
          } else {
            const body = doc.body;
            let textParts = [];
            let currentNumber = "";

            const traverseDOM = (node, visited = new Set()) => {
              if (visited.has(node)) return;
              visited.add(node);

              if (node.nodeType === Node.TEXT_NODE) {
                let text = node.textContent.trim();
                if (text) {
                  text = text.replace(/[\u200B-\u200F\uFEFF]/g, "");
                  if (currentNumber && /[\d.]/.test(text)) {
                    currentNumber += text;
                  } else {
                    if (currentNumber) {
                      textParts.push(currentNumber);
                      currentNumber = "";
                    }
                    textParts.push(text);
                  }
                }
              } else if (node.nodeType === Node.ELEMENT_NODE) {
                if (["SPAN", "P", "DIV"].includes(node.tagName)) {
                  let text = node.textContent.trim();
                  if (text && !node.querySelector("sup, sub, acc") && !visited.has(text)) {
                    if (currentNumber) {
                      textParts.push(currentNumber);
                      currentNumber = "";
                    }
                    text = text.replace(/[\u200B-\u200F\uFEFF]/g, "");
                    textParts.push(text);
                    visited.add(text);
                    return;
                  }
                }

                const fraction = extractFractionFromHTML(node);
                if (fraction) {
                  if (currentNumber) {
                    textParts.push(currentNumber);
                    currentNumber = "";
                  }
                  textParts.push(fraction);
                } else {
                  const mathMLFraction = extractFractionFromMathML(node);
                  if (mathMLFraction) {
                    if (currentNumber) {
                      textParts.push(currentNumber);
                      currentNumber = "";
                    }
                    textParts.push(mathMLFraction);
                  } else {
                    const repeatingDecimal = extractRepeatingDecimalFromMathML(node);
                    if (repeatingDecimal) {
                      if (currentNumber) {
                        currentNumber = "";
                      }
                      textParts.push(repeatingDecimal);
                    } else {
                      if (node.tagName === "SPAN" && node.style.fontFamily?.includes("Cambria Math")) {
                        const text = node.textContent.trim();
                        if (text) {
                          if (currentNumber && /[\d.]/.test(text)) {
                            currentNumber += text;
                          } else {
                            if (currentNumber) {
                              textParts.push(currentNumber);
                              currentNumber = "";
                            }
                            currentNumber = text;
                          }
                        }
                      }
                      node.childNodes.forEach((child) => traverseDOM(child, visited));
                    }
                  }
                }
              }
            };

            traverseDOM(body);
            if (currentNumber) textParts.push(currentNumber);
            const extractedText = textParts.join(" ").trim();

            if (extractedText && !extractedText.match(/^\d+$/)) {
              pastedData = cleanTextForLatex(extractedText);
            }
          }
        }
      }

      if (!pastedData) {
        let plainText = clipboardData.getData("text/plain");
        if (plainText) {
          plainText = plainText.replace(/[\u200B-\u200F\uFEFF]/g, "");
          pastedData = cleanTextForLatex(plainText);
        }
      }

      if (pastedData) {
        setCQs((prev) => {
          const newCQs = [...prev];
          if (field === "passage") {
            newCQs[cqIndex].passage = pastedData;
          } else if (field === "question") {
            newCQs[cqIndex].questions[index] = pastedData;
          } else if (field === "answer") {
            newCQs[cqIndex].answers[index] = pastedData;
          }
          return newCQs;
        });
        editor.setData(pastedData);
      } else {
        toast.error("❌ পেস্ট করা ডেটা প্রক্রিয়া করা যায়নি। LaTeX ফরম্যাটে লিখুন।");
      }
    },
    []
  );

  const downloadExcelTemplate = () => {
    const templateData = [
      {
        Class: "",
        Subject: "",
        "Subject Part": "",
        "Chapter Number": "",
        "Chapter Name": "",
        "CQ Type": "",
        Passage: "",
        "Knowledge Question": "",
        "Knowledge Answer": "",
        "Comprehension Question": "",
        "Comprehension Answer": "",
        "Application Question": "",
        "Application Answer": "",
        "Higher Skills Question": "",
        "Higher Skills Answer": "",
        "Image Alignment": "center",
        "Video Link": "",
      },
      {
        Class: 9,
        Subject: "General Science",
        "Subject Part": "",
        "Chapter Number": 1,
        "Chapter Name": "Introduction",
        "CQ Type": "generalCQ",
        Passage: "The sun is the primary source of energy...",
        "Knowledge Question": "What is the primary source of energy?",
        "Knowledge Answer": "The Sun.",
        "Comprehension Question": "Explain how energy is transferred.",
        "Comprehension Answer": "Through radiation.",
        "Application Question": "How can solar energy be used daily?",
        "Application Answer": "Using solar panels.",
        "Higher Skills Question": "Evaluate solar energy’s impact.",
        "Higher Skills Answer": "Reduces emissions.",
        "Image Alignment": "center",
        "Video Link": "https://example.com/video",
      },
      {
        Class: 10,
        Subject: "Mathematics",
        "Subject Part": "",
        "Chapter Number": 2,
        "Chapter Name": "Algebra",
        "CQ Type": "mathCQ",
        Passage: "\\frac{1}{2} + \\frac{1}{3}",
        "Knowledge Question": "Simplify \\frac{1}{2} + \\frac{1}{3}",
        "Knowledge Answer": "\\frac{5}{6}",
        "Comprehension Question": "",
        "Comprehension Answer": "",
        "Application Question": "Solve \\frac{x}{2} = \\frac{5}{6}",
        "Application Answer": "x = \\frac{5}{3}",
        "Higher Skills Question": "Prove the simplification.",
        "Higher Skills Answer": "\\frac{3}{6} + \\frac{2}{6} = \\frac{5}{6}",
        "Image Alignment": "center",
        "Video Link": "",
      },
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "CQ Template");
    XLSX.writeFile(wb, "CQ_Upload_Template.xlsx");
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const binaryStr = event.target.result;
        const workbook = XLSX.read(binaryStr, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(sheet);

        if (data.length > 0) {
          const extractedQuestions = data.map((row) => ({
            classNumber: row.Class || selectedClass,
            subject: row.Subject || selectedSubject,
            subjectPart: row["Subject Part"] || selectedSubjectPart,
            chapterNumber: row["Chapter Number"] || selectedChapterNumber,
            chapterName: row["Chapter Name"] || selectedChapterName,
            cqType: row["CQ Type"] || cqType,
            passage: normalizeText(row.Passage || ""),
            questions:
              row["CQ Type"] === "mathCQ"
                ? [
                    normalizeText(row["Knowledge Question"] || ""),
                    normalizeText(row["Application Question"] || ""),
                    normalizeText(row["Higher Skills Question"] || ""),
                  ]
                : [
                    normalizeText(row["Knowledge Question"] || ""),
                    normalizeText(row["Comprehension Question"] || ""),
                    normalizeText(row["Application Question"] || ""),
                    normalizeText(row["Higher Skills Question"] || ""),
                  ],
            answers:
              row["CQ Type"] === "mathCQ"
                ? [
                    normalizeText(row["Knowledge Answer"] || ""),
                    normalizeText(row["Application Answer"] || ""),
                    normalizeText(row["Higher Skills Answer"] || ""),
                  ]
                : [
                    normalizeText(row["Knowledge Answer"] || ""),
                    normalizeText(row["Comprehension Answer"] || ""),
                    normalizeText(row["Application Answer"] || ""),
                    normalizeText(row["Higher Skills Answer"] || ""),
                  ],
            imageAlignment: row["Image Alignment"] || "center",
            videoLink: row["Video Link"] || "",
          }));

          const response = await fetch("/api/cq/import", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ questions: extractedQuestions }),
          });

          if (response.ok) {
            toast.success("✅ প্রশ্ন সফলভাবে ডাটাবেজে সংরক্ষিত হয়েছে!");
          } else {
            const errorData = await response.json();
            toast.error(`❌ ডাটাবেজে সংরক্ষণ ব্যর্থ: ${errorData.error}`);
          }
        } else {
          toast.error("❌ এক্সেল ফাইল খালি বা ভুল ফরম্যাটে আছে!");
        }
      } catch (error) {
        toast.error("❌ ফাইল প্রক্রিয়াকরণে ত্রুটি!");
      }
    };
    reader.readAsBinaryString(file);
  };

  const resetForm = useCallback(() => {
    setSelectedClass("");
    setSubjects([]);
    setSelectedSubject("");
    setSubjectParts([]);
    setSelectedSubjectPart("");
    setChapters([]);
    setSelectedChapterNumber("");
    setSelectedChapterName("");
    setCQType("");
    setIsMultipleCQs(false);
    setCQs([
      {
        passage: "",
        questions: ["", "", "", ""],
        answers: ["", "", "", ""],
        image: null,
        imageAlignment: "center",
        videoLink: "",
      },
    ]);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedClass || !selectedSubject || !selectedChapterNumber || !cqType) {
      toast.error("❌ সকল প্রয়োজনীয় ক্ষেত্র পূরণ করুন!");
      return;
    }

    const formData = new FormData();
    formData.append("classNumber", selectedClass);
    formData.append("subject", selectedSubject);
    formData.append("subjectPart", selectedSubjectPart || "");
    formData.append("chapterNumber", selectedChapterNumber);
    formData.append("chapterName", selectedChapterName);
    formData.append("teacherEmail", "admin");
    formData.append("cqType", cqType);

    cqs.forEach((cq, index) => {
      formData.append(`cqs[${index}][passage]`, cq.passage);
      formData.append(`cqs[${index}][questions]`, JSON.stringify(cq.questions));
      formData.append(`cqs[${index}][answers]`, JSON.stringify(cq.answers));
      if (cq.image) {
        formData.append(`cqs[${index}][image]`, cq.image);
      }
      formData.append(`cqs[${index}][imageAlignment]`, cq.imageAlignment);
      formData.append(`cqs[${index}][videoLink]`, cq.videoLink || "");
    });

    try {
      const response = await fetch("/api/cq/import", {
        method: "POST",
        body: formData,
      });

      const responseData = await response.json();
      if (response.ok) {
        toast.success(`✅ ${cqs.length}টি প্রশ্ন সফলভাবে যোগ করা হয়েছে!`);
        resetForm();
      } else {
        toast.error(`❌ ${responseData.error || "কিছু সমস্যা হয়েছে!"}`);
      }
    } catch (error) {
      toast.error("❌ সার্ভারে সমস্যা!");
    }
  };

  const editorConfig = useMemo(
    () => ({
      toolbar: {
        items: [
          "heading",
          "|",
          "fontFamily",
          "fontSize",
          "fontColor",
          "|",
          "bold",
          "italic",
          "underline",
          "|",
          "alignment",
          "|",
          "bulletedList",
          "numberedList",
          "|",
          "imageUpload",
          "insertTable",
          "link",
          "|",
          "undo",
          "redo",
        ],
      },
      fontFamily: {
        options: ["Noto Sans Bengali", "Kalpurush", "Arial", "Times New Roman"],
        supportAllValues: true,
      },
      fontSize: {
        options: [12, 14, 16, 18, "default", 22, 24],
      },
      image: {
        toolbar: ["imageTextAlternative", "imageStyle:inline", "imageStyle:block", "imageStyle:side"],
      },
      table: {
        contentToolbar: ["tableColumn", "tableRow", "mergeTableCells"],
      },
      placeholder: "লিখুন বা পেস্ট করুন (LaTeX সমর্থিত, যেমন: \\frac{1}{2})",
      pasteFromOffice: true,
    }),
    []
  );

  const shouldRenderMathAsBlock = (content) => {
    const trimmedContent = content.trim();
    return (
      trimmedContent.startsWith("\\") &&
      trimmedContent.endsWith("}") &&
      !trimmedContent.includes(" ")
    );
  };

  return (
    <>
      <Head>
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Kalpurush&display=swap" rel="stylesheet" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              MathJax = {
                tex: {
                  inlineMath: [['$', '$'], ['\\(', '\\)']],
                  tags: 'ams',
                  macros: {
                    rdot: "{\\\\mathrel{\\\\dot{\\\\hphantom{0}}}}"
                  }
                },
                chtml: {
                  scale: 1.1,
                  mtextInheritFont: true,
                }
              };
            `,
          }}
        />
        <script src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js" async></script>
      </Head>
      <style jsx global>{`
        .ck-editor__editable {
          min-height: 120px !important;
          max-height: 250px !important;
          overflow-y: auto !important;
          font-family: 'Kalpurush', 'Noto Sans Bengali', sans-serif !important;
          font-size: 16px !important;
          line-height: 1.5 !important;
          border: 1px solid #d1d5db !important;
          border-radius: 6px !important;
          padding: 10px !important;
          box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.05) !important;
        }
        .ck.ck-editor__top .ck-toolbar {
          background: #f7fafc !important;
          border: 1px solid #d1d5db !important;
          border-bottom: none !important;
          border-top-left-radius: 6px !important;
          border-top-right-radius: 6px !important;
        }
        .ck-content {
          font-family: 'Kalpurush', 'Noto Sans Bengali', sans-serif !important;
          white-space: pre-wrap !important;
          word-wrap: break-word !important;
        }
        .ck-content p {
          margin: 0 0 0.5em !important;
        }
        .bangla-text {
          font-family: 'Kalpurush', 'Noto Sans Bengali', sans-serif !important;
        }
        .preview-section {
          margin-bottom: 1rem;
          overflow-x: auto;
          max-width: 100%;
          word-wrap: break-word;
        }
        .preview-section .mathjax {
          display: inline-block;
          vertical-align: middle;
          margin: 0 0.2rem;
        }
        .preview-section .mathjax.block {
          display: block;
          margin: 0.5rem 0;
          text-align: center;
        }
        .preview-section img {
          max-width: 100%;
          height: auto;
        }
      `}</style>
      <div className="min-h-screen bg-gradient-to-br from-gray-100 to-blue-50 p-6">
        <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
        <motion.h1
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-3xl font-bold text-center text-blue-700 mb-8 bangla-text"
        >
          📝 সৃজনশীল প্রশ্ন তৈরি করুন
        </motion.h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-xl shadow-lg p-6 border border-gray-200"
          >
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label className="block text-gray-700 font-semibold mb-2 bangla-text">
                  এক্সেল ফাইল থেকে আমদানি
                </label>
                <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-blue-400 transition-colors">
                  <input
                    type="file"
                    accept=".xlsx, .xls"
                    onChange={handleFileUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <p className="text-center text-gray-500 bangla-text">
                    এক্সেল ফাইল টেনে আনুন বা ক্লিক করুন
                  </p>
                </div>
                <motion.button
                  type="button"
                  onClick={downloadExcelTemplate}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="mt-2 w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition shadow-md bangla-text"
                >
                  📥 টেমপ্লেট ডাউনলোড করুন
                </motion.button>
              </div>
              <p className="text-center text-gray-500 mb-4 bangla-text">অথবা</p>

              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 font-semibold mb-1 bangla-text">ক্লাস</label>
                  <select
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white shadow-sm bangla-text"
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(Number(e.target.value))}
                    required
                  >
                    <option value="">ক্লাস নির্বাচন করুন</option>
                    {classes.map((cls) => (
                      <option key={cls.classNumber} value={cls.classNumber}>
                        ক্লাস {cls.classNumber}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedClass && subjects.length > 0 && (
                  <div>
                    <label className="block text-gray-700 font-semibold mb-1 bangla-text">বিষয়</label>
                    <select
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white shadow-sm bangla-text"
                      value={selectedSubject}
                      onChange={(e) => setSelectedSubject(e.target.value)}
                      required
                    >
                      <option value="">বিষয় নির্বাচন করুন</option>
                      {subjects.map((subject) => (
                        <option key={subject} value={subject}>{subject}</option>
                      ))}
                    </select>
                  </div>
                )}

                {selectedSubject && subjectParts.length > 0 && (
                  <div>
                    <label className="block text-gray-700 font-semibold mb-1 bangla-text">বিষয়ের অংশ</label>
                    <select
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white shadow-sm bangla-text"
                      value={selectedSubjectPart}
                      onChange={(e) => setSelectedSubjectPart(e.target.value)}
                    >
                      <option value="">বিষয়ের অংশ (যদি থাকে)</option>
                      {subjectParts.map((part) => (
                        <option key={part} value={part}>{part}</option>
                      ))}
                    </select>
                  </div>
                )}

                {selectedSubject && chapters.length > 0 && (
                  <div>
                    <label className="block text-gray-700 font-semibold mb-1 bangla-text">অধ্যায়</label>
                    <select
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white shadow-sm bangla-text"
                      value={selectedChapterNumber}
                      onChange={(e) => {
                        const selected = chapters.find((chap) => chap.chapterNumber === parseInt(e.target.value));
                        setSelectedChapterNumber(e.target.value);
                        setSelectedChapterName(selected?.chapterName || "");
                      }}
                      required
                    >
                      <option value="">অধ্যায় নির্বাচন করুন</option>
                      {chapters.map((chapter) => (
                        <option key={chapter.chapterNumber} value={chapter.chapterNumber}>
                          {chapter.chapterNumber} - {chapter.chapterName}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-gray-700 font-semibold mb-1 bangla-text">প্রশ্নের ধরণ</label>
                  <select
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white shadow-sm bangla-text"
                    value={cqType}
                    onChange={(e) => setCQType(e.target.value)}
                    required
                  >
                    <option value="">প্রশ্নের ধরণ নির্বাচন করুন</option>
                    <option value="generalCQ">সাধারণ সৃজনশীল প্রশ্ন</option>
                    <option value="mathCQ">গাণিতিক সৃজনশীল প্রশ্ন</option>
                  </select>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={isMultipleCQs}
                    onChange={(e) => setIsMultipleCQs(e.target.checked)}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label className="ml-2 text-gray-700 font-medium bangla-text">
                    একাধিক প্রশ্ন যোগ করুন
                  </label>
                </div>
              </div>

              {cqs.map((cq, cqIndex) => (
                <motion.div
                  key={cqIndex}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mt-6 p-4 bg-gray-50 rounded-lg shadow-sm border border-gray-200"
                >
                  <h3 className="text-lg font-semibold text-gray-800 mb-3 bangla-text">
                    প্রশ্ন {cqIndex + 1}
                  </h3>
                  <div className="mb-4">
                    <label className="block text-gray-700 font-semibold mb-1 bangla-text">উদ্দীপক</label>
                    <CKEditor
                      editor={DecoupledEditor}
                      config={editorConfig}
                      data={cq.passage}
                      onReady={(editor) => {
                        const toolbarContainer = document.createElement("div");
                        toolbarContainer.className = `ck-toolbar-container-${cqIndex}-passage`;
                        editor.ui.view.editable.element.parentElement.prepend(toolbarContainer);
                        toolbarContainer.appendChild(editor.ui.view.toolbar.element);
                      }}
                      onChange={(event, editor) => handleFieldChange(cqIndex, "passage", null, editor.getData())}
                      onPaste={(event, editor) => handlePaste(cqIndex, "passage", null, editor, event.data.dataTransfer)}
                    />
                    <p className="text-sm text-gray-500 mt-1 bangla-text">
                      * গাণিতিক প্রশ্নের জন্য LaTeX ব্যবহার করুন (যেমন: \frac{1}{2})
                    </p>
                  </div>

                  <div className="mb-4">
                    <label className="block text-gray-700 font-semibold mb-1 bangla-text">
                      ভিডিও লিঙ্ক (ঐচ্ছিক)
                    </label>
                    <input
                      type="url"
                      placeholder="উদাহরণ: https://example.com/video"
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white shadow-sm bangla-text"
                      value={cq.videoLink}
                      onChange={(e) => handleVideoLinkChange(cqIndex, e.target.value)}
                    />
                  </div>

                  {/* Restored Image Uploading System */}
                  <div className="mb-4">
                    <label className="block text-gray-700 font-semibold mb-1 bangla-text">
                      ছবি (ঐচ্ছিক)
                    </label>
                    <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-blue-400 transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageChange(cqIndex, e)}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                      <p className="text-center text-gray-500 bangla-text">
                        {cq.image ? cq.image.name : "ছবি টেনে আনুন বা ক্লিক করুন"}
                      </p>
                    </div>
                  </div>

                  {cq.image && (
                    <div className="mb-4">
                      <label className="block text-gray-700 font-semibold mb-1 bangla-text">
                        ছবির অ্যালাইনমেন্ট
                      </label>
                      <select
                        value={cq.imageAlignment}
                        onChange={(e) => handleImageAlignmentChange(cqIndex, e.target.value)}
                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white shadow-sm bangla-text"
                      >
                        <option value="left">বামে</option>
                        <option value="center">মাঝে</option>
                        <option value="right">ডানে</option>
                      </select>
                    </div>
                  )}

                  {(cqType === "mathCQ" ? cq.questions.slice(0, 3) : cq.questions).map((_, i) => (
                    <div key={i} className="mb-4">
                      <label className="block text-gray-700 font-semibold mb-1 bangla-text">
                        {i === 0
                          ? "জ্ঞানমূলক প্রশ্ন"
                          : i === 1
                          ? cqType === "mathCQ"
                            ? "প্রয়োগমূলক প্রশ্ন"
                            : "অনুধাবনমূলক প্রশ্ন"
                          : i === 2
                          ? "উচ্চতর দক্ষতা"
                          : "উচ্চতর দক্ষতা"}
                      </label>
                      <CKEditor
                        editor={DecoupledEditor}
                        config={editorConfig}
                        data={cq.questions[i]}
                        onReady={(editor) => {
                          const toolbarContainer = document.createElement("div");
                          toolbarContainer.className = `ck-toolbar-container-${cqIndex}-q${i}`;
                          editor.ui.view.editable.element.parentElement.prepend(toolbarContainer);
                          toolbarContainer.appendChild(editor.ui.view.toolbar.element);
                        }}
                        onChange={(event, editor) => handleFieldChange(cqIndex, "question", i, editor.getData())}
                        onPaste={(event, editor) => handlePaste(cqIndex, "question", i, editor, event.data.dataTransfer)}
                      />
                      <p className="text-sm text-gray-500 mt-1 bangla-text">
                        * গাণিতিক প্রশ্নের জন্য LaTeX ব্যবহার করুন (যেমন: \frac{1}{2})
                      </p>

                      <label className="block text-gray-700 font-semibold mb-1 mt-2 bangla-text">
                        উত্তর (ঐচ্ছিক)
                      </label>
                      <CKEditor
                        editor={DecoupledEditor}
                        config={editorConfig}
                        data={cq.answers[i]}
                        onReady={(editor) => {
                          const toolbarContainer = document.createElement("div");
                          toolbarContainer.className = `ck-toolbar-container-${cqIndex}-a${i}`;
                          editor.ui.view.editable.element.parentElement.prepend(toolbarContainer);
                          toolbarContainer.appendChild(editor.ui.view.toolbar.element);
                        }}
                        onChange={(event, editor) => handleFieldChange(cqIndex, "answer", i, editor.getData())}
                        onPaste={(event, editor) => handlePaste(cqIndex, "answer", i, editor, event.data.dataTransfer)}
                      />
                      <p className="text-sm text-gray-500 mt-1 bangla-text">
                        * গাণিতিক উত্তরের জন্য LaTeX ব্যবহার করুন (যেমন: \frac{1}{2})
                      </p>
                    </div>
                  ))}
                </motion.div>
              ))}

              {isMultipleCQs && (
                <motion.button
                  type="button"
                  onClick={addNewCQ}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-green-600 text-white py-2 mt-4 rounded-lg hover:bg-green-700 transition shadow-md bangla-text flex items-center justify-center"
                >
                  <span className="mr-2">+</span> নতুন প্রশ্ন যোগ করুন
                </motion.button>
              )}

              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-blue-600 text-white py-2 mt-4 rounded-lg hover:bg-blue-700 transition shadow-md bangla-text"
              >
                ✅ সাবমিট করুন
              </motion.button>
            </form>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-xl shadow-lg p-6 border border-gray-200"
          >
            <h2 className="text-xl font-bold text-blue-700 mb-4 bangla-text">প্রিভিউ</h2>
            {cqs.map((cq, cqIndex) => (
              <motion.div
                key={cqIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="preview-section mb-4 p-4 bg-gray-50 rounded-lg shadow-sm border border-gray-100"
              >
                <p className="text-sm font-semibold text-blue-600 bg-blue-100 px-2 py-1 rounded inline-block mb-2 bangla-text">
                  CQ {cqIndex + 1}
                </p>
                <p className="text-base font-semibold text-gray-900 mb-2 bangla-text">উদ্দীপক:</p>
                <div
                  className="text-gray-700 mb-2 bangla-text"
                  dangerouslySetInnerHTML={{ __html: cq.passage || "উদ্দীপক লিখুন" }}
                />

                {cq.image && (
                  <div
                    className={`mb-2 ${
                      cq.imageAlignment === "left"
                        ? "text-left"
                        : cq.imageAlignment === "right"
                        ? "text-right"
                        : "text-center"
                    }`}
                  >
                    <img
                      src={URL.createObjectURL(cq.image)}
                      alt={`CQ ${cqIndex + 1} Image`}
                      className="rounded-lg shadow-md max-h-48 inline-block"
                    />
                  </div>
                )}

                {cq.videoLink && (
                  <div className="mb-2">
                    <a
                      href={cq.videoLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline hover:text-blue-800 bangla-text"
                    >
                      📹 ভিডিও দেখুন
                    </a>
                  </div>
                )}

                <div className="text-gray-700">
                  {(cqType === "mathCQ" ? cq.questions.slice(0, 3) : cq.questions).map((ques, i) => (
                    <div key={i} className="mb-2">
                      <p className="bangla-text">
                        {String.fromCharCode(2453 + i)}) <span dangerouslySetInnerHTML={{ __html: ques || "প্রশ্ন লিখুন" }} />{" "}
                        {cqType === "mathCQ" ? `(${[3, 3, 4][i]} নম্বর)` : `(${[1, 2, 3, 4][i]} নম্বর)`}
                      </p>
                      {cq.answers[i] && (
                        <p className="text-gray-600 ml-6 bangla-text">
                          <span className="font-semibold">উত্তর:</span>{" "}
                          <span dangerouslySetInnerHTML={{ __html: cq.answers[i] }} />
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                <p className="text-sm text-gray-500 mt-2 bangla-text">
                  ক্লাস: {selectedClass || "N/A"} | বিষয়: {selectedSubject || "N/A"} | অংশ: {selectedSubjectPart || "N/A"} | অধ্যায়: {selectedChapterName || "N/A"} | ধরণ: {cqType || "N/A"}
                </p>
              </motion.div>
            ))}
            {cqs.length === 0 && (
              <p className="text-gray-500 text-center bangla-text">প্রিভিউ দেখতে প্রশ্ন যোগ করুন</p>
            )}
          </motion.div>
        </div>
      </div>
    </>
  );
}