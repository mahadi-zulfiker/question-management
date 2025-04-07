"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import * as XLSX from "xlsx";
import Head from "next/head";
import dynamic from "next/dynamic";
import { convert } from "mathml-to-latex";

// Dynamically import react-mathquill components
const EditableMathField = dynamic(() => import("react-mathquill").then((mod) => mod.EditableMathField), { ssr: false });
const StaticMathField = dynamic(() => import("react-mathquill").then((mod) => mod.StaticMathField), { ssr: false });

// Normalize text to Unicode NFC
const normalizeText = (text) => text.normalize("NFC");

// Compute the Greatest Common Divisor (GCD) using Euclidean algorithm
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

// Simplify a fraction
const simplifyFraction = (numerator, denominator) => {
  const divisor = gcd(numerator, denominator);
  return {
    numerator: numerator / divisor,
    denominator: denominator / divisor,
  };
};

// Convert a repeating decimal to a fraction
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
  // Step 1: Normalize text and replace special characters
  text = text.replace(/[\u00A0\u202F]/g, " ").replace(/\u2044/g, "/").normalize("NFC");

  // Step 2: Normalize multiple spaces to single space
  text = text.replace(/\s+/g, " ");

  // Step 3: Handle repeating decimals (e.g., "5.23457 ̇" where "7" has the dot)
  text = text.replace(/(\d*\.\d+)( ̇)+/g, (match, number) => {
    const parts = number.split(".");
    const wholePart = parts[0];
    const decimalPart = parts[1];
    const dotCount = (match.match(/ ̇/g) || []).length;

    // The last 'dotCount' digits have the dot over them
    const repeatingStart = decimalPart.length - dotCount;
    const nonRepeatingPart = decimalPart.slice(0, repeatingStart > 0 ? repeatingStart : 0);
    const repeatingPart = decimalPart.slice(repeatingStart > 0 ? repeatingStart : 0);

    if (repeatingPart) {
      // Apply \dot{} to each repeating digit individually
      const repeatingWithDots = repeatingPart
        .split("")
        .map((digit) => `\\dot{${digit}}`)
        .join("");
      return `${wholePart}.${nonRepeatingPart}${repeatingWithDots}`;
    }
    return number;
  });

  // Step 4: Add space between numbers and Bangla text
  text = text.replace(
    /(\d+\.\d*|\d+|\d*\.\d+\\dot\{\d+\})([ক-ঢ়ঁ-ঃা-ৄে-ৈো-ৌ০-৯])/g,
    "$1\\ $2"
  );

  // Step 5: Wrap Bangla text in \text{}
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

  // Step 6: Handle fractions and mixed numbers
  text = text.replace(/(\d+)\s+(\d+)\/(\d+)/g, (match, whole, num, denom) => {
    const { numerator, denominator } = simplifyFraction(parseInt(num), parseInt(denom));
    return `${whole}\\ \\frac{${numerator}}{${denominator}}`;
  });
  text = text.replace(/(\d+)\/(\d+)/g, (match, num, denom) => {
    const { numerator, denominator } = simplifyFraction(parseInt(num), parseInt(denom));
    return `\\frac{${numerator}}{${denominator}}`;
  });

  // Step 7: Handle superscripts, roots, and symbols
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

// Function to extract fraction from HTML elements (e.g., <sup> and <sub>)
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

// Function to extract fraction from MathML <m:f> element
const extractFractionFromMathML = (element) => {
  const fractionElements = Array.from(element.querySelectorAll("*")).filter(
    (el) => el.localName === "f" && el.namespaceURI === "http://schemas.microsoft.com/office/2004/12/omml"
  );
  if (fractionElements.length > 0) {
    const fractionElement = fractionElements[0];
    const numerator = fractionElement
      .querySelector("*[local-name()='num'] *[local-name()='r']")
      ?.textContent.trim();
    const denominator = fractionElement
      .querySelector("*[local-name()='den'] *[local-name()='r']")
      ?.textContent.trim();
    if (numerator && denominator && !isNaN(numerator) && !isNaN(denominator)) {
      return `${numerator}/${denominator}`;
    }
  }
  return null;
};

// Function to extract repeating decimal from MathML <m:acc> element
const extractRepeatingDecimalFromMathML = (element) => {
  const accElements = Array.from(element.querySelectorAll("*")).filter(
    (el) => el.localName === "acc" && el.namespaceURI === "http://schemas.microsoft.com/office/2004/12/omml"
  );
  if (accElements.length > 0) {
    let digits = "";
    let dotCount = 0;
    const parent = element.closest("*[local-name()='r']");
    if (parent) {
      const siblings = Array.from(parent.childNodes);
      let currentDigits = "";
      siblings.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE && node.localName === "acc") {
          const chr = node.querySelector("*[local-name()='accPr'] *[local-name()='chr']")?.getAttribute("m:val");
          const base = node.querySelector("*[local-name()='e'] *[local-name()='r']")?.textContent.trim();
          if (chr === "̇" && base) {
            currentDigits += base;
            dotCount += 1;
          }
        } else if (node.nodeType === Node.ELEMENT_NODE && node.localName === "t") {
          const text = node.textContent.trim();
          if (text && /\d/.test(text)) {
            currentDigits += text;
          }
        }
      });
      digits = currentDigits;
    }
    if (digits) {
      return `${digits}${dotCount > 0 ? " ̇".repeat(dotCount) : ""}`;
    }
  }
  return null;
};

// Main CreateSQAdmin Component
export default function CreateSQAdmin() {
  useEffect(() => {
    (async () => {
      const { addStyles } = await import("react-mathquill");
      addStyles();
    })();
  }, []);

  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [subjectParts, setSubjectParts] = useState([]);
  const [selectedSubjectPart, setSelectedSubjectPart] = useState("");
  const [chapters, setChapters] = useState([]);
  const [selectedChapterNumber, setSelectedChapterNumber] = useState("");
  const [selectedChapterName, setSelectedChapterName] = useState("");
  const [isMultipleSQs, setIsMultipleSQs] = useState(false);

  const [sqs, setSQs] = useState([
    {
      type: "জ্ঞানমূলক",
      question: "",
      answer: "",
      image: null,
      imageAlignment: "center",
      videoLink: "",
    },
  ]);

  useEffect(() => {
    async function fetchClasses() {
      try {
        const res = await fetch("/api/sq");
        const data = await res.json();
        setClasses(data);
      } catch (error) {
        toast.error("❌ ক্লাস লোড করতে সমস্যা হয়েছে!");
      }
    }
    fetchClasses();
  }, []);

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
        const res = await fetch(`/api/sq?classNumber=${selectedClass}`);
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

  const addNewSQ = () => {
    setSQs([
      ...sqs,
      {
        type: "জ্ঞানমূলক",
        question: "",
        answer: "",
        image: null,
        imageAlignment: "center",
        videoLink: "",
      },
    ]);
  };

  const handleTypeChange = (index, value) => {
    const newSQs = [...sqs];
    newSQs[index].type = value;
    setSQs(newSQs);
  };

  const handleQuestionChange = (index, value) => {
    const newSQs = [...sqs];
    newSQs[index].question = value;
    setSQs(newSQs);
  };

  const handleAnswerChange = (index, value) => {
    const newSQs = [...sqs];
    newSQs[index].answer = value;
    setSQs(newSQs);
  };

  const handleImageChange = (index, e) => {
    const newSQs = [...sqs];
    newSQs[index].image = e.target.files[0];
    setSQs(newSQs);
  };

  const handleImageAlignmentChange = (index, value) => {
    const newSQs = [...sqs];
    newSQs[index].imageAlignment = value;
    setSQs(newSQs);
  };

  const handleVideoLinkChange = (index, value) => {
    const newSQs = [...sqs];
    newSQs[index].videoLink = value;
    setSQs(newSQs);
  };

  const handlePaste = (index, fieldType, e) => {
    e.preventDefault();

    const clipboardData = e.clipboardData;
    let pastedData = "";

    const mathml = clipboardData.getData("application/mathml+xml");
    if (mathml) {
      try {
        pastedData = convert(mathml);
      } catch (error) {
        toast.error("❌ MathML প্রক্রিয়া করা যায়নি। দয়া করে LaTeX ফরম্যাটে লিখুন।");
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
            const mathmlString = new XMLSerializer().serializeToString(mathmlElement);
            pastedData = convert(mathmlString);
          } catch (error) {
            toast.error("❌ HTML থেকে MathML প্রক্রিয়া করা যায়নি। দয়া করে LaTeX ফরম্যাটে লিখুন।");
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
              if (node.tagName === "SPAN" || node.tagName === "P" || node.tagName === "DIV") {
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
                    const cleanRepeating = repeatingDecimal.replace(/( ̇)+$/, "").replace(/ ̇/g, "");
                    if (currentNumber) {
                      currentNumber += cleanRepeating;
                    } else {
                      currentNumber = cleanRepeating;
                    }
                  } else {
                    if (node.tagName === "SPAN" && node.style.fontFamily.includes("Cambria Math")) {
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
          if (currentNumber) {
            textParts.push(currentNumber);
          }
          const extractedText = textParts.join(" ").trim();

          const looksIncomplete = extractedText.match(/^\d+$/) || (!extractedText.includes("/") && !extractedText.includes("̇"));
          if (extractedText && !looksIncomplete) {
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
      const newSQs = [...sqs];
      if (fieldType === "question") {
        newSQs[index].question = pastedData;
      } else if (fieldType === "answer") {
        newSQs[index].answer = pastedData;
      }
      setSQs(newSQs);
    } else {
      toast.error("❌ পেস্ট করা ডেটা প্রক্রিয়া করা যায়নি। দয়া করে LaTeX ফরম্যাটে লিখুন।");
    }
  };

  const downloadExcelTemplate = () => {
    const templateData = [
      {
        Class: "",
        Subject: "",
        "Subject Part": "",
        "Chapter Number": "",
        "Chapter Name": "",
        Type: "",
        Question: "",
        Answer: "",
        "Image Alignment": "center",
        "Video Link": "",
      },
      {
        Class: 9,
        Subject: "General Science",
        "Subject Part": "",
        "Chapter Number": 1,
        "Chapter Name": "Chapter 1",
        Type: "জ্ঞানমূলক",
        Question: "প্রাথমিক শক্তির উৎস কী?",
        Answer: "সূর্য।",
        "Image Alignment": "center",
        "Video Link": "https://drive.google.com/file/d/example",
      },
      {
        Class: 9,
        Subject: "General Science",
        "Subject Part": "",
        "Chapter Number": 1,
        "Chapter Name": "Chapter 1",
        Type: "অনুধাবনমূলক",
        Question: "\\frac{1}{2} + \\frac{1}{3} = ?",
        Answer: "\\frac{5}{6}",
        "Image Alignment": "center",
        "Video Link": "",
      },
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "SQ Template");
    XLSX.writeFile(wb, "SQ_Upload_Template.xlsx");
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
            type: row.Type || "জ্ঞানমূলক",
            question: normalizeText(row.Question || ""),
            answer: normalizeText(row.Answer || ""),
            classLevel: row.Class || selectedClass,
            subjectName: row.Subject || selectedSubject,
            subjectPart: row["Subject Part"] || selectedSubjectPart,
            chapterNumber: row["Chapter Number"] || selectedChapterNumber,
            chapterName: row["Chapter Name"] || selectedChapterName,
            imageAlignment: row["Image Alignment"] || "center",
            videoLink: row["Video Link"] || "",
          }));

          const response = await fetch("/api/sq/import", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ questions: extractedQuestions }),
          });

          if (response.ok) {
            toast.success("প্রশ্ন সফলভাবে ডাটাবেজে সংরক্ষিত হয়েছে!");
          } else {
            toast.error("❌ ডাটাবেজে প্রশ্ন সংরক্ষণ ব্যর্থ হয়েছে!");
          }
        } else {
          toast.error("❌ এক্সেল ফাইল খালি বা ভুল ফরম্যাটে আছে!");
        }
      } catch (error) {
        toast.error("❌ ফাইল প্রসেসিংয়ে ত্রুটি!");
      }
    };
    reader.readAsBinaryString(file);
  };

  const resetForm = () => {
    setSelectedClass("");
    setSubjects([]);
    setSelectedSubject("");
    setSubjectParts([]);
    setSelectedSubjectPart("");
    setChapters([]);
    setSelectedChapterNumber("");
    setSelectedChapterName("");
    setIsMultipleSQs(false);
    setSQs([
      {
        type: "জ্ঞানমূলক",
        question: "",
        answer: "",
        image: null,
        imageAlignment: "center",
        videoLink: "",
      },
    ]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("classLevel", selectedClass);
    formData.append("subjectName", selectedSubject);
    formData.append("subjectPart", selectedSubjectPart || "");
    formData.append("chapterNumber", selectedChapterNumber);
    formData.append("chapterName", selectedChapterName);
    formData.append("teacherEmail", "admin");

    sqs.forEach((sq, index) => {
      formData.append(`sqs[${index}][type]`, sq.type);
      formData.append(`sqs[${index}][question]`, sq.question);
      formData.append(`sqs[${index}][answer]`, sq.answer);
      if (sq.image) formData.append(`sqs[${index}][image]`, sq.image);
      formData.append(`sqs[${index}][imageAlignment]`, sq.imageAlignment);
      formData.append(`sqs[${index}][videoLink]`, sq.videoLink || "");
    });

    try {
      const response = await fetch("/api/sq/import", {
        method: "POST",
        body: formData,
      });

      const responseData = await response.json();
      if (response.ok) {
        toast.success(`✅ ${sqs.length}টি সংক্ষিপ্ত প্রশ্ন সফলভাবে যোগ করা হয়েছে!`);
        resetForm();
      } else {
        toast.error(`❌ ${responseData.error || "কিছু সমস্যা হয়েছে!"}`);
      }
    } catch (error) {
      toast.error("❌ সার্ভারের সাথে সংযোগে সমস্যা!");
    }
  };

  return (
    <>
      <Head>
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Kalpurush&display=swap" rel="stylesheet" />
        <script>
          {`
            MathJax = {
              tex: {
                inlineMath: [['$', '$'], ['\\(', '\\)']],
                tags: 'ams',
              },
              chtml: {
                scale: 1.1,
                mtextInheritFont: true,
              }
            };
          `}
        </script>
        <script src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js" async></script>
      </Head>
      <style jsx global>{`
        .bangla-text {
          font-family: 'Kalpurush', 'Noto Sans Bengali', sans-serif !important;
          direction: ltr;
          unicode-bidi: embed;
        }

        .mq-editable-field {
          min-height: 50px !important;
          height: auto !important;
          overflow-y: auto !important;
          max-height: 200px !important;
          white-space: pre-wrap !important;
          word-wrap: break-word !important;
          padding: 12px !important;
          box-sizing: border-box !important;
          font-family: 'Kalpurush', 'Noto Sans Bengali', sans-serif !important;
          font-size: 18px !important;
          line-height: 1.5 !important;
          border: 1px solid #d1d5db !important;
          border-radius: 6px !important;
          box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.05) !important;
        }

        .mq-editable-field .mq-root-block {
          white-space: pre-wrap !important;
          word-wrap: break-word !important;
          font-family: 'Kalpurush', 'Noto Sans Bengali', sans-serif !important;
        }

        .mq-static-field {
          white-space: pre-wrap !important;
          word-wrap: break-word !important;
          font-family: 'Kalpurush', 'Noto Sans Bengali', sans-serif !important;
          font-size: 18px !important;
          line-height: 1.5 !important;
        }

        .MathJax .mtext {
          font-family: 'Kalpurush', 'Noto Sans Bengali', sans-serif !important;
          white-space: pre-wrap !important;
          margin-right: 0.25em !important;
          margin-left: 0.25em !important;
        }

        .MathJax .mspace {
          width: 0.5em !important;
        }

        .MathJax .mo {
          font-size: 1.2em !important;
          vertical-align: top !important;
        }
      `}</style>
      <div className="min-h-screen bg-gradient-to-br from-gray-100 to-blue-50 p-6">
        <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
        <motion.h1
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl font-extrabold text-center text-blue-700 mb-8 bangla-text"
        >
          📝 সংক্ষিপ্ত প্রশ্ন তৈরি করুন
        </motion.h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
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
                  📥 এক্সেল টেমপ্লেট ডাউনলোড করুন
                </motion.button>
              </div>
              <p className="text-center text-gray-500 mb-4 bangla-text">অথবা</p>

              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 font-semibold mb-1 bangla-text">ক্লাস</label>
                  <select
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white shadow-sm bangla-text"
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(Number(e.target.value))}
                    required
                  >
                    <option value="">ক্লাস নির্বাচন করুন</option>
                    {classes.map((cls) => (
                      <option key={cls.classNumber} value={cls.classNumber}>
                        ক্লাস <span>{cls.classNumber}</span>
                      </option>
                    ))}
                  </select>
                </div>

                {selectedClass && subjects.length > 0 && (
                  <div>
                    <label className="block text-gray-700 font-semibold mb-1 bangla-text">বিষয়</label>
                    <select
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white shadow-sm bangla-text"
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
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white shadow-sm bangla-text"
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
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white shadow-sm bangla-text"
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
                          <span>{chapter.chapterNumber}</span> - <span>{chapter.chapterName}</span>
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={isMultipleSQs}
                    onChange={(e) => setIsMultipleSQs(e.target.checked)}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label className="ml-2 text-gray-700 font-medium bangla-text">
                    একাধিক সংক্ষিপ্ত প্রশ্ন যোগ করুন
                  </label>
                </div>
              </div>

              {sqs.map((sq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mt-6 p-5 bg-gray-50 rounded-lg shadow-sm border border-gray-200"
                >
                  <h3 className="text-lg font-semibold text-gray-800 mb-3 bangla-text">
                    সংক্ষিপ্ত প্রশ্ন <span>{index + 1}</span>
                  </h3>
                  <div>
                    <label className="block text-gray-700 font-semibold mb-1 bangla-text">প্রশ্নের ধরণ</label>
                    <select
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white shadow-sm mb-4 bangla-text"
                      value={sq.type}
                      onChange={(e) => handleTypeChange(index, e.target.value)}
                      required
                    >
                      <option value="জ্ঞানমূলক">জ্ঞানমূলক</option>
                      <option value="অনুধাবনমূলক">অনুধাবনমূলক</option>
                      <option value="প্রয়োগমূলক">প্রয়োগমূলক</option>
                      <option value="উচ্চতর দক্ষতা">উচ্চতর দক্ষতা</option>
                    </select>
                  </div>

                  <div className="mb-4">
                    <label className="block text-gray-700 font-semibold mb-1 bangla-text">প্রশ্ন লিখুন</label>
                    <EditableMathField
                      latex={sq.question}
                      onChange={(mathField) => handleQuestionChange(index, mathField.latex())}
                      onPaste={(e) => handlePaste(index, "question", e)}
                      className="border p-2 rounded-md w-full text-lg"
                    />
                    <p className="text-sm text-gray-500 mt-1 bangla-text">
                      * Word থেকে পেস্ট করলে সঠিকভাবে না দেখালে LaTeX ফরম্যাটে লিখুন (যেমন: \frac{1}{2})
                    </p>
                  </div>

                  <div className="mb-4">
                    <label className="block text-gray-700 font-semibold mb-1 bangla-text">উত্তর লিখুন (ঐচ্ছিক)</label>
                    <EditableMathField
                      latex={sq.answer}
                      onChange={(mathField) => handleAnswerChange(index, mathField.latex())}
                      onPaste={(e) => handlePaste(index, "answer", e)}
                      className="border p-2 rounded-md w-full text-lg"
                    />
                    <p className="text-sm text-gray-500 mt-1 bangla-text">
                      * Word থেকে পেস্ট করলে সঠিকভাবে না দেখালে LaTeX ফরম্যাটে লিখুন (যেমন: \frac{1}{2})
                    </p>
                  </div>

                  <div className="mb-4">
                    <label className="block text-gray-700 font-semibold mb-2 bangla-text">
                      ভিডিও লিঙ্ক যুক্ত করুন (ঐচ্ছিক)
                    </label>
                    <input
                      type="url"
                      placeholder="উদাহরণ: https://drive.google.com/file/d/..."
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white shadow-sm bangla-text"
                      value={sq.videoLink}
                      onChange={(e) => handleVideoLinkChange(index, e.target.value)}
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-gray-700 font-semibold mb-2 bangla-text">
                      ছবি যুক্ত করুন (ঐচ্ছিক)
                    </label>
                    <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-blue-400 transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageChange(index, e)}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                      <p className="text-center text-gray-500 bangla-text">
                        {sq.image ? sq.image.name : "ছবি টেনে আনুন বা ক্লিক করুন"}
                      </p>
                    </div>
                  </div>

                  {sq.image && (
                    <div className="mb-4">
                      <label className="block text-gray-700 font-semibold mb-2 bangla-text">
                        ছবির অ্যালাইনমেন্ট
                      </label>
                      <select
                        value={sq.imageAlignment}
                        onChange={(e) => handleImageAlignmentChange(index, e.target.value)}
                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white shadow-sm bangla-text"
                      >
                        <option value="left">বামে</option>
                        <option value="center">মাঝে</option>
                        <option value="right">ডানে</option>
                      </select>
                    </div>
                  )}
                </motion.div>
              ))}

              {isMultipleSQs && (
                <motion.button
                  type="button"
                  onClick={addNewSQ}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-green-600 text-white py-3 mt-4 rounded-lg hover:bg-green-700 transition flex items-center justify-center shadow-md bangla-text"
                >
                  <span className="text-xl mr-2">+</span> নতুন সংক্ষিপ্ত প্রশ্ন যোগ করুন
                </motion.button>
              )}

              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-blue-600 text-white py-3 mt-4 rounded-lg hover:bg-blue-700 transition shadow-md bangla-text"
              >
                ✅ সাবমিট করুন
              </motion.button>
            </form>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-xl shadow-lg p-8 border border-gray-200"
          >
            <h2 className="text-2xl font-bold text-blue-700 mb-6 bangla-text">প্রিভিউ</h2>
            {sqs.map((sq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="mb-6 p-6 bg-gray-50 rounded-lg shadow-sm border border-gray-100"
              >
                <p className="text-sm font-semibold text-blue-600 bg-blue-100 px-2 py-1 rounded inline-block mb-3 bangla-text">
                  SQ <span>{index + 1}</span>
                </p>
                <p className="text-lg font-semibold text-gray-900 mb-2 bangla-text" style={{ padding: '0.25rem 0' }}>
                  প্রশ্ন: <span>{sq.type}</span>
                </p>
                <StaticMathField className="text-gray-700 mb-4">
                  {sq.question || "প্রশ্ন লিখুন"}
                </StaticMathField>

                {sq.videoLink && (
                  <div className="mb-4">
                    <a
                      href={sq.videoLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline hover:text-blue-800 bangla-text"
                    >
                      📹 ভিডিও দেখুন
                    </a>
                  </div>
                )}

                {sq.image && (
                  <div
                    className={`mb-4 ${sq.imageAlignment === "left" ? "text-left" : sq.imageAlignment === "right" ? "text-right" : "text-center"}`}
                  >
                    <img
                      src={URL.createObjectURL(sq.image)}
                      alt={`SQ preview ${index + 1}`}
                      className="rounded-lg shadow-md max-h-64 inline-block"
                    />
                  </div>
                )}

                {sq.answer && (
                  <div className="text-gray-700 mb-4">
                    <p className="font-semibold bangla-text">উত্তর:</p>
                    <StaticMathField className="text-gray-700">
                      {sq.answer || "উত্তর লিখুন"}
                    </StaticMathField>
                  </div>
                )}

                <p className="text-sm text-gray-500 mt-4 bangla-text">
                  ক্লাস: <span>{selectedClass || "N/A"}</span> | বিষয়: <span>{selectedSubject || "N/A"}</span> | অংশ: <span>{selectedSubjectPart || "N/A"}</span> | অধ্যায়: <span>{selectedChapterName || "N/A"}</span>
                </p>
              </motion.div>
            ))}
            {sqs.length === 0 && (
              <p className="text-gray-500 text-center text-lg bangla-text">প্রিভিউ দেখতে প্রশ্ন যোগ করুন</p>
            )}
          </motion.div>
        </div>
      </div>
    </>
  );
}