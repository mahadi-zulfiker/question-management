import Head from "next/head";
import { BookOpen, Edit, Users, FileText, Search, Award, MessageCircle, Download } from "lucide-react";

export default function FeaturesSection() {
  const studentFeatures = [
    {
      icon: <BookOpen className="w-10 h-10 text-blue-600" />,
      title: "পরীক্ষা দিন",
      description: "অনলাইনে মডেল টেস্ট এবং ভর্তি পরীক্ষায় অংশ নিন, আপনার প্রস্তুতি যাচাই করুন।",
    },
    {
      icon: <Search className="w-10 h-10 text-blue-600" />,
      title: "প্রশ্ন ব্যাংক",
      description: "বিশাল প্রশ্ন ব্যাংক থেকে এমসিকিউ, সৃজনশীল এবং সংক্ষিপ্ত প্রশ্ন দেখুন এবং অনুশীলন করুন।",
    },
    {
      icon: <MessageCircle className="w-10 h-10 text-blue-600" />,
      title: "শিক্ষকের সাথে পরামর্শ",
      description: "শিক্ষকদের সাথে সরাসরি যোগাযোগ করুন, পরামর্শ নিন এবং আপনার প্রশ্নের সমাধান পান।",
    },
    {
      icon: <Award className="w-10 h-10 text-blue-600" />,
      title: "মডেল ও ভর্তি টেস্ট",
      description: "বিভিন্ন মডেল টেস্ট এবং ভর্তি পরীক্ষার প্রশ্ন দিয়ে নিজেকে প্রস্তুত করুন।",
    },
  ];

  const teacherFeatures = [
    {
      icon: <Edit className="w-10 h-10 text-green-600" />,
      title: "পরীক্ষা তৈরি",
      description: "প্রাক-নির্ধারিত প্রশ্ন থেকে সহজেই পরীক্ষা তৈরি করুন এবং কাস্টম প্রশ্ন যোগ করুন।",
    },
    {
      icon: <Download className="w-10 h-10 text-green-600" />,
      title: "প্রশ্নপত্র ডাউনলোড",
      description: "পরীক্ষার প্রশ্নপত্র তৈরি করে পিডিএফ হিসেবে ডাউনলোড করুন, সহজে শেয়ার করুন।",
    },
    {
      icon: <Users className="w-10 h-10 text-green-600" />,
      title: "ছাত্র সার্কেল",
      description: "ছাত্রদের ব্যাচ পরিচালনা করুন, তাদের অগ্রগতি ট্র্যাক করুন এবং নম্বর দিন।",
    },
    {
      icon: <FileText className="w-10 h-10 text-green-600" />,
      title: "প্রিমিয়াম প্রশ্ন",
      description: "বিশাল প্রশ্নের সংগ্রহে অ্যাক্সেস পান, প্রিমিয়াম প্ল্যানের মাধ্যমে আরও সুবিধা।",
    },
  ];

  return (
    <>
      <Head>
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali&display=swap" rel="stylesheet" />
        <style>{`
          .bangla-text {
            font-family: 'Noto Sans Bengali', sans-serif;
          }
          .feature-card {
            transition: transform 0.3s ease, box-shadow 0.3s ease;
          }
          .feature-card:hover {
            transform: translateY(-8px);
            box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15);
          }
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>
      </Head>
      <section className="py-16 bg-gradient-to-br from-gray-100 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-extrabold text-blue-800 bangla-text">
              আমাদের বৈশিষ্ট্যসমূহ
            </h2>
            <p className="mt-4 text-lg md:text-xl text-gray-600 bangla-text">
              ছাত্র এবং শিক্ষকদের জন্য সেরা শিক্ষা সমাধান—আপনার শিক্ষার যাত্রা আরও সহজ করুন!
            </p>
          </div>

          {/* Student Features */}
          <div className="mb-16">
            <h3 className="text-2xl md:text-3xl font-bold text-blue-700 mb-8 text-center bangla-text">
              ছাত্রদের জন্য
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {studentFeatures.map((feature, index) => (
                <div
                  key={index}
                  className="feature-card bg-white p-6 rounded-lg shadow-md flex flex-col items-center text-center"
                  style={{ animation: `fadeInUp 0.3s ease-out ${index * 0.1}s both` }}
                >
                  <div className="mb-4">{feature.icon}</div>
                  <h4 className="text-xl font-semibold text-gray-900 mb-2 bangla-text">
                    {feature.title}
                  </h4>
                  <p className="text-gray-600 bangla-text">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Teacher Features */}
          <div>
            <h3 className="text-2xl md:text-3xl font-bold text-green-700 mb-8 text-center bangla-text">
              শিক্ষকদের জন্য
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {teacherFeatures.map((feature, index) => (
                <div
                  key={index}
                  className="feature-card bg-white p-6 rounded-lg shadow-md flex flex-col items-center text-center"
                  style={{ animation: `fadeInUp 0.3s ease-out ${(index + studentFeatures.length) * 0.1}s both` }}
                >
                  <div className="mb-4">{feature.icon}</div>
                  <h4 className="text-xl font-semibold text-gray-900 mb-2 bangla-text">
                    {feature.title}
                  </h4>
                  <p className="text-gray-600 bangla-text">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Call to Action */}
          <div className="mt-12 text-center">
            <p className="text-gray-700 mb-6 text-xl font-medium bangla-text">
              আজই যোগ দিন এবং আমাদের শিক্ষামূলক প্ল্যাটফর্মের সম্পূর্ণ সুবিধা নিন!
            </p>
            <a
              href="/signUp"
              className="inline-block bg-gradient-to-r from-blue-500 to-blue-700 text-white px-8 py-4 rounded-full text-lg font-semibold hover:scale-105 hover:shadow-lg transition-all duration-300 bangla-text"
            >
              এখনই শুরু করুন
            </a>
          </div>
        </div>
      </section>
    </>
  );
}