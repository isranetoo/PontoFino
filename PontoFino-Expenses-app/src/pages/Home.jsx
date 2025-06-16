
import React from 'react';
import Footer from '../components/Footer';
import HomeNavBar from '../components/HomeNavBar';
import HeroSection from '../components/HeroSection';
import PlatformInfo from '../components/PlatformInfo';
import ToolsSection from '../components/ToolsSection';
import FutureProjects from '../components/FutureProjects';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 via-blue-900 to-[#0096fd]">
      <HomeNavBar />
      <div className="container mx-auto px-4 py-8 flex-1 w-full">
        <HeroSection />
        <div className="h-10 sm:h-14" />
        <PlatformInfo />
        <div className="h-10 sm:h-14" />
        <ToolsSection />
        <div className="h-10 sm:h-14" />
        <FutureProjects />
      </div>
      <Footer />
    </div>
  );
}
 