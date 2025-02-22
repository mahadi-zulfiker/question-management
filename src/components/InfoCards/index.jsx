"use client";
import Image from "next/image";
import img from "../../../public/course.jpg";
import img1 from "../../../public/subject1.jpg";
import img2 from "../../../public/subject2.jpg";
import img3 from "../../../public/subject3.jpg";

const InfoCards = () => {
  const subjects = [
    {
      title: "বাংলা বিষয়ের প্রস্তুতি",
      description: "বাংলা ব্যাকরণ, সাহিত্য এবং রচনামূলক প্রশ্ন সমাধান করুন।",
      image: img,
      instructor: "মোঃ হাসান আলী",
      duration: "১০ সপ্তাহ",
    },
    {
      title: "ইংরেজি বিষয়ের প্রস্তুতি",
      description: "গ্রামার, রিডিং কম্প্রিহেনশন ও রাইটিং প্র্যাকটিস করুন।",
      image: img1,
      instructor: "সারাহ রহমান",
      duration: "৮ সপ্তাহ",
    },
    {
      title: "গণিত বিষয়ের প্রস্তুতি",
      description: "MCQ এবং CQ প্রশ্নের মাধ্যমে গণিত চর্চা করুন।",
      image: img2,
      instructor: "রাকিবুল ইসলাম",
      duration: "১২ সপ্তাহ",
    },
    {
      title: "বিজ্ঞান বিষয়ের প্রস্তুতি",
      description: "পদার্থবিজ্ঞান, রসায়ন ও জীববিজ্ঞানের প্রশ্ন সমাধান করুন।",
      image: img3,
      instructor: "তানিয়া সুলতানা",
      duration: "৯ সপ্তাহ",
    },
  ];

  return (
    <div className="container mx-auto px-6 py-20">
      <h2 className="text-3xl font-bold text-gray-800 text-center mb-6">আমাদের বিষয়ভিত্তিক কোর্স দেখুন</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {subjects.map((subject, index) => (
          <div key={index} className="max-w-sm rounded-lg overflow-hidden shadow-lg bg-white">
            <Image 
              className="w-full"
              src={subject.image}
              alt={subject.title}
              width={400}
              height={200}
              priority
            />
            <div className="px-6 py-4">
              <h3 className="font-bold text-lg text-gray-900">{subject.title}</h3>
              <p className="text-gray-700 text-sm mt-2">{subject.description}</p>
            </div>
            <div className="px-6 pb-4">
              <span className="inline-block bg-blue-200 text-blue-700 rounded-full px-3 py-1 text-xs font-semibold mr-2">
                {subject.instructor}
              </span>
              <span className="inline-block bg-gray-200 text-gray-700 rounded-full px-3 py-1 text-xs font-semibold">
                {subject.duration}
              </span>
            </div>
            <div className="px-6 pb-4">
              <button className="w-full bg-gradient-to-r from-blue-400 to-purple-500 text-white font-bold py-2 px-4 rounded">
                এখন ভর্তি হন
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InfoCards;