"use client";
import Banner from '@/components/Banner';
import Counter from '@/components/Counter';
import ExtraInfo from '@/components/ExtraInfo';
import FAQ from '@/components/FAQ';
import Footer from '@/components/Footer';
import InfoCards from '@/components/InfoCards';
import Navbar from '@/components/Navbar'
import Questions from '@/components/Questions';
import Services from '@/components/Services';
import Testimonials from '@/components/Testimonials';
import React from 'react'

function HomePage() {
    return (
        <div className='bg-gradient-to-r from-white-50 to-indigo-50'>
            <Navbar />
            <Banner />
            <InfoCards />
            <Testimonials />
            <Questions />
            <ExtraInfo />
            <Counter />
            <Services />
            <FAQ />
            <Footer />
        </div>
    )
}

export default HomePage