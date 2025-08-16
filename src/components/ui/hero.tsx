"use client";
 
import { motion } from "framer-motion";
 
export default function Globe3D() {
  return (
    <section
      className="relative w-full overflow-hidden bg-[#0a0613] pb-10 pt-32 font-light text-white antialiased md:pb-16 md:pt-20"
      style={{
        background: "linear-gradient(135deg, #0a0613 0%, #150d27 100%)",
      }}
    >
      <div
        className="absolute right-0 top-0 h-1/2 w-1/2"
        style={{
          background:
            "radial-gradient(circle at 70% 30%, rgba(155, 135, 245, 0.15) 0%, rgba(13, 10, 25, 0) 60%)",
        }}
      />
      <div
        className="absolute left-0 top-0 h-1/2 w-1/2 -scale-x-100"
        style={{
          background:
            "radial-gradient(circle at 70% 30%, rgba(155, 135, 245, 0.15) 0%, rgba(13, 10, 25, 0) 60%)",
        }}
      />
 
      <div className="container relative z-10 mx-auto max-w-2xl px-4 text-center md:max-w-4xl md:px-6 lg:max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <span className="mb-6 inline-block rounded-full border border-[#9b87f5]/30 px-3 py-1 text-xs text-[#9b87f5]">
            NEXT GENERATION OF EVENT TICKETING
          </span>
          <h1 className="mx-auto mb-6 max-w-4xl text-4xl font-light md:text-5xl lg:text-7xl">
            The Future of{" "}
            <span className="text-[#9b87f5]">Event Ticketing</span>
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-lg text-white/60 md:text-xl">
            NeonGate combines blockchain technology with cutting-edge event management
            to help you discover, organize, and attend amazing events with
            security and transparency.
          </p>
 
          <div className="mb-10 sm:mb-0 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              href="/events"
              className="neumorphic-button hover:shadow-[0_0_20px_rgba(155, 135, 245, 0.5)] relative w-full overflow-hidden rounded-full border border-white/10 bg-gradient-to-b from-white/10 to-white/5 px-8 py-4 text-white shadow-lg transition-all duration-300 hover:border-[#9b87f5]/30 sm:w-auto"
            >
              Explore Events
            </a>
            <a
              href="/organize"
              className="flex w-full items-center justify-center gap-2 text-white/70 transition-colors hover:text-white sm:w-auto"
            >
              <span>Organize Event</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m6 9 6 6 6-6"></path>
              </svg>
            </a>
          </div>
        </motion.div>
        <motion.div
          className="relative"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
        >
          <div className="w-full flex h-40 md:h-64 relative overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?w=800&h=600&fit=crop&crop=center"
              alt="Event Stage"
              className="absolute px-4 top-0 left-1/2 -translate-x-1/2 mx-auto -z-10 opacity-80"
            />
          </div>
          <div className="relative z-10 mx-auto max-w-5xl overflow-hidden rounded-lg shadow-[0_0_50px_rgba(155,135,245,0.2)]">
            <img
              src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1920&h=1080&fit=crop&crop=center"
              alt="NeonGate Event Dashboard"
              className="h-auto w-full rounded-lg border border-white/10"
            />
          </div>
        </motion.div>
        
        {/* Key Features */}
        <motion.div
          className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.6 }}
        >
          <div className="text-center p-4 rounded-lg border border-white/10 bg-white/5 backdrop-blur-sm">
            <div className="w-12 h-12 mx-auto mb-3 bg-[#9b87f5]/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-[#9b87f5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Anti-Fraud NFTs</h3>
            <p className="text-white/70 text-sm">Every ticket is a unique NFT on the blockchain</p>
          </div>
          
          <div className="text-center p-4 rounded-lg border border-white/10 bg-white/5 backdrop-blur-sm">
            <div className="w-12 h-12 mx-auto mb-3 bg-[#9b87f5]/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-[#9b87f5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Instant Transfers</h3>
            <p className="text-white/70 text-sm">Transfer tickets securely in seconds</p>
          </div>
          
          <div className="text-center p-4 rounded-lg border border-white/10 bg-white/5 backdrop-blur-sm">
            <div className="w-12 h-12 mx-auto mb-3 bg-[#9b87f5]/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-[#9b87f5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Verifiable Ownership</h3>
            <p className="text-white/70 text-sm">Prove ticket authenticity instantly</p>
          </div>
        </motion.div>
        
        {/* Statistics */}
        <motion.div
          className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.9 }}
        >
          <div>
            <div className="text-3xl md:text-4xl font-bold text-[#9b87f5] mb-2">10K+</div>
            <div className="text-white/70 text-sm">Events Created</div>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-bold text-[#9b87f5] mb-2">500K+</div>
            <div className="text-white/70 text-sm">Tickets Sold</div>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-bold text-[#9b87f5] mb-2">Zero</div>
            <div className="text-white/70 text-sm">Fraud Cases</div>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-bold text-[#9b87f5] mb-2">24/7</div>
            <div className="text-white/70 text-sm">Availability</div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
