import React from 'react';
import Footer from '../components/Footer';
import HomeNavBar from '../components/HomeNavBar';
import HeroSection from '../components/HeroSection';
import PlatformInfo from '../components/PlatformInfo';
import ToolsSection from '../components/ToolsSection';
import SubscriptionSection from '../components/SubscriptionSection';
import FutureProjects from '../components/FutureProjects';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 via-blue-900 to-[#0096fd]">
      <HomeNavBar />
      <div className="container mx-auto px-3 sm:px-6 md:px-10 py-6 sm:py-10 md:py-16 flex-1 w-full">
        <HeroSection />
        <div className="h-4 sm:h-8 md:h-12" />
        <PlatformInfo />
        <div className="h-4 sm:h-8 md:h-12" />        <ToolsSection />
        <div className="h-4 sm:h-8 md:h-12" />
        <SubscriptionSection />
        <div className="h-4 sm:h-8 md:h-12" />
        <FutureProjects />
      </div>
      <Footer />
    </div>
  );
}
