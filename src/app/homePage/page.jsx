"use client";
import Banner from "@/components/Banner";
import Chat from "@/components/Chat";
import Counter from "@/components/Counter";
import ExtraInfo from "@/components/ExtraInfo";
import FAQ from "@/components/FAQ";
import FeaturesSection from "@/components/FeaturesSection";
import Footer from "@/components/Footer";
import HowToUse from "@/components/HowToUse";
import InfoCards from "@/components/InfoCards";
import Navbar from "@/components/Navbar";
import Questions from "@/components/Questions";
import Services from "@/components/Services";
import SoftwareInfo from "@/components/SoftwareInfo";
import Testimonials from "@/components/Testimonials";
import React from "react";

function HomePage() {
  return (
    <div className="bg-gradient-to-r from-white-50 to-indigo-50">
      <Navbar />
      <Banner />
      <FeaturesSection />
      <SoftwareInfo />
      <HowToUse />
      <InfoCards />
      <Testimonials />
      <Questions />
      <ExtraInfo />
      <Counter />
      <Services />
      <FAQ />
      <Footer />
      <Chat />
    </div>
  );
}

export default HomePage;
