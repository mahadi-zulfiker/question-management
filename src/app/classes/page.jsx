'use client';
import { useState } from 'react';
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import Image from 'next/image';
import banner from '../../../public/questionBanner.jpg';

const subjectsData = {
    'Class 4': { General: [{ id: 1, name: 'বাংলা', chapters: ['ব্যাকরণ', 'রচনা', 'শব্দার্থ'] }] },
    'Class 5': { General: [{ id: 2, name: 'গণিত', chapters: ['যোগ', 'বিয়োগ', 'গুণ', 'ভাগ'] }] },
    'Class 6': { General: [{ id: 3, name: 'বিজ্ঞান', chapters: ['দেহতত্ত্ব', 'জীবজগৎ', 'পদার্থ'] }] },
    'Class 7': { General: [{ id: 4, name: 'ইংরেজি', chapters: ['ব্যাকরণ', 'লেখনী', 'পাঠ্য'] }] },
    'Class 8': { General: [{ id: 5, name: 'ইতিহাস', chapters: ['প্রাচীন যুগ', 'মধ্যযুগ', 'আধুনিক যুগ'] }] },
    'SSC': {
        Science: [
            { id: 6, name: 'উচ্চতর গণিত', chapters: ['সেট ও ফাংশন', 'বীজগণিতিক রাশি', 'জ্যামিতি', 'সম্ভাবনা'] },
            { id: 7, name: 'পদার্থ বিজ্ঞান', chapters: ['গতিবিদ্যা', 'তাপগতিবিদ্যা', 'বিদ্যুৎ ও চুম্বক'] },
            { id: 8, name: 'রসায়ন বিজ্ঞান', chapters: ['পরমাণুর গঠন', 'রাসায়নিক বন্ধন', 'অক্সিডেশন-রিডাকশন'] }
        ],
        Commerce: [
            { id: 9, name: 'হিসাব বিজ্ঞান', chapters: ['হিসাবের ধারণা', 'জার্নাল', 'লেজার', 'আর্থিক বিবরণী'] },
            { id: 10, name: 'ব্যবসায় সংগঠন', chapters: ['ব্যবসার সংজ্ঞা', 'উদ্যোক্তা', 'প্রশাসন'] }
        ],
        Arts: [
            { id: 11, name: 'বাংলাদেশ ও বিশ্বপরিচয়', chapters: ['ভূগোল', 'ইতিহাস', 'রাজনীতি'] },
            { id: 12, name: 'অর্থনীতি', chapters: ['অর্থনীতির মৌলিক ধারণা', 'বাজার ব্যবস্থা', 'টাকা ও ব্যাংকিং'] }
        ]
    },
    'HSC': {
        Science: [
            { id: 13, name: 'উচ্চতর গণিত', chapters: ['ডিফারেনশিয়াল ক্যালকুলাস', 'ইন্টিগ্রাল ক্যালকুলাস', 'কমপ্লেক্স নাম্বার'] },
            { id: 14, name: 'পদার্থ বিজ্ঞান', chapters: ['তরঙ্গ', 'পরমাণু ও নিউক্লিয়ার পদার্থবিজ্ঞান'] },
            { id: 15, name: 'রসায়ন বিজ্ঞান', chapters: ['অজৈব রসায়ন', 'জৈব রসায়ন'] }
        ],
        Commerce: [
            { id: 16, name: 'ব্যবস্থাপনা', chapters: ['সংগঠনের ভিত্তি', 'মানব সম্পদ ব্যবস্থাপনা'] },
            { id: 17, name: 'অর্থনীতি', chapters: ['মুদ্রা ও ব্যাংকিং', 'আন্তর্জাতিক অর্থনীতি'] }
        ],
        Arts: [
            { id: 18, name: 'রাষ্ট্রবিজ্ঞান', chapters: ['রাষ্ট্রের সংজ্ঞা', 'সংবিধান', 'গণতন্ত্র'] },
            { id: 19, name: 'সামাজিক বিজ্ঞান', chapters: ['সমাজবিজ্ঞান', 'মানব সমাজের বিবর্তন'] }
        ]
    }
};

export default function SubjectsList() {
    const [selectedClass, setSelectedClass] = useState('SSC');
    const [selectedGroup, setSelectedGroup] = useState('Science');
    const [selectedSubject, setSelectedSubject] = useState(null);

    const toggleSubject = (id) => {
        setSelectedSubject(selectedSubject === id ? null : id);
    };

    const isSSCOrHSC = ['SSC', 'HSC'].includes(selectedClass);
    const subjects = isSSCOrHSC ? subjectsData[selectedClass][selectedGroup] : subjectsData[selectedClass]?.General;

    return (
        <div>
            <Navbar />
            {/* Banner Section */}
            <div className="relative w-full h-60 mb-5 flex items-center justify-center bg-gray-900">
                <Image src={banner} layout="fill" objectFit="cover" alt="Banner" className="opacity-50" />
                <h1 className="absolute text-white text-3xl font-bold bg-black bg-opacity-50 px-6 py-2 rounded-lg">একাডেমিক বিষয়সমূহ</h1>
            </div>

            {/* Dropdowns */}
            <div className="max-w-5xl mx-auto p-5">
                <div className="flex justify-center gap-4 mb-5">
                    <select className="border rounded-lg px-4 py-2 bg-white shadow-md" value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}>
                        {Object.keys(subjectsData).map((classLevel) => (
                            <option key={classLevel}>{classLevel}</option>
                        ))}
                    </select>

                    {isSSCOrHSC && (
                        <select className="border rounded-lg px-4 py-2 bg-white shadow-md" value={selectedGroup} onChange={(e) => setSelectedGroup(e.target.value)}>
                            {Object.keys(subjectsData[selectedClass]).map((group) => (
                                <option key={group}>{group}</option>
                            ))}
                        </select>
                    )}
                </div>

                {/* Subjects List */}
                <div className="grid md:grid-cols-2 gap-6">
                    {subjects?.map((subject) => (
                        <div key={subject.id} className="border rounded-lg p-5 shadow-md bg-white hover:shadow-xl transition transform hover:-translate-y-1">
                            <div className="flex justify-between items-center cursor-pointer text-lg font-semibold" onClick={() => toggleSubject(subject.id)}>
                                <span>{subject.name}</span>
                                <span className="text-blue-500 text-xl">{selectedSubject === subject.id ? '−' : '+'}</span>
                            </div>
                            {selectedSubject === subject.id && (
                                <ul className="mt-3 border-t pt-3 space-y-2">
                                    {subject.chapters.map((chapter, index) => (
                                        <li key={index} className="pl-3 border-l-4 border-blue-500 text-gray-700">{chapter}</li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    ))}
                </div>
            </div>
            <Footer />
        </div>
    );
}
