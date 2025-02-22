"use client";
import Image from "next/image";
import img from "../../../public/course.jpg"

const InfoCards = () => {
  const courses = [
    {
      title: "ওয়েব ডেভেলপমেন্ট বুটক্যাম্প",
      description: "এই বুটক্যাম্পে HTML, CSS, JavaScript এবং React",
      image: "https://i.ibb.co.com/b5zHS4P2/4528493-3809.jpg",
      instructor: "সারাহ জনসন",
      duration: "১২ সপ্তাহ",
    },
    {
      title: "ডাটা সায়েন্স প্রাথমিক কোর্স",
      description: "পাইথন, ডাটা অ্যানালাইসিস এবং মেশিন লার্নিং শিখুন।",
      image: "https://i.ibb.co.com/b5zHS4P2/4528493-3809.jpg",
      instructor: "মার্ক উইলিয়ামস",
      duration: "৮ সপ্তাহ",
    },
    {
      title: "ইউআই/ইউএক্স ডিজাইন মাস্টারি",
      description: "ফিগমা ও অ্যাডোবি এক্সডি ব্যবহার",
      image: "https://i.ibb.co.com/b5zHS4P2/4528493-3809.jpg",
      instructor: "এমিলি রবার্টস",
      duration: "৬ সপ্তাহ",
    },
    {
      title: "সাইবার সিকিউরিটি বেসিকস",
      description: "সিস্টেম ও নেটওয়ার্ক সুরক্ষার মূলনীতি শিখুন।",
      image: "https://i.ibb.co.com/b5zHS4P2/4528493-3809.jpg",
      instructor: "ড্যানিয়েল লি",
      duration: "১০ সপ্তাহ",
    },
  ];

  return (
    <div className="container mx-auto px-6 py-20">
      <h2 className="text-3xl font-bold text-gray-800 text-center mb-6">আমাদের কোর্সগুলো দেখুন</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {courses.map((course, index) => (
          <div key={index} className="max-w-sm rounded-lg overflow-hidden shadow-lg bg-white">
            <Image 
              className="w-full"
              src={img}
              alt={course.title}
              width={400}
              height={200}
              priority
            />
            <div className="px-6 py-4">
              <h3 className="font-bold text-lg text-gray-900">{course.title}</h3>
              <p className="text-gray-700 text-sm mt-2">{course.description}</p>
            </div>
            <div className="px-6 pb-4">
              <span className="inline-block bg-blue-200 text-blue-700 rounded-full px-3 py-1 text-xs font-semibold mr-2">
                {course.instructor}
              </span>
              <span className="inline-block bg-gray-200 text-gray-700 rounded-full px-3 py-1 text-xs font-semibold">
                {course.duration}
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
