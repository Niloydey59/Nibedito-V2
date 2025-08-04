"use client";

import Image from "next/image";
import Link from "next/link";
import { DUMMY_IMAGES } from "@/constants/dummyData";

interface HeroSectionProps {
  user?: any;
}

export default function HeroSection({ user }: HeroSectionProps) {
  return (
    <section className="flex items-center justify-between px-[5%] py-16 lg:py-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 min-h-screen lg:h-[calc(100vh-72px)] relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-rose-400/20 to-rose-600/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-rose-600/20 to-rose-700/20 rounded-full blur-3xl"></div>
      </div>

      <div className="flex flex-col lg:flex-row items-center justify-between w-full max-w-7xl mx-auto relative z-10">
        {/* Content */}
        <div className="flex-1 max-w-2xl text-center lg:text-left mb-8 lg:mb-0">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
            <span className="bg-gradient-to-r from-rose-700 to-rose-600 bg-clip-text text-transparent">
              Perfect
            </span>{" "}
            <span className="text-slate-900 dark:text-gray-100">
              Gifts for Every
            </span>{" "}
            <span className="text-rose-600 text-5xl md:text-6xl lg:text-7xl">
              Occasion
            </span>
          </h1>

          <p className="text-lg md:text-xl text-slate-600 dark:text-gray-300 mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed">
            Discover thoughtfully curated gifts that create lasting memories.
            From personalized treasures to luxury collections.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
            <Link
              href="/products"
              className="group relative inline-flex items-center justify-center px-8 py-3 bg-gradient-to-r from-rose-700 to-rose-600 text-white font-medium rounded-lg overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-105"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-600"></span>
              <span className="relative">Shop Now</span>
            </Link>

            <Link
              href="/categories"
              className="relative inline-flex items-center justify-center px-8 py-3 border-2 border-rose-600 text-rose-700 dark:text-rose-400 font-medium rounded-lg overflow-hidden z-10 transition-all duration-300 hover:text-white dark:hover:text-white group"
            >
              <span className="absolute inset-0 bg-rose-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left z-[-1]"></span>
              <span className="relative">Browse Categories</span>
            </Link>
          </div>
        </div>

        {/* Hero Image */}
        <div className="flex-1 flex justify-center lg:justify-end mt-8 lg:mt-0">
          <div className="relative w-full max-w-lg lg:max-w-xl">
            <div className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl transform rotate-2 hover:rotate-0 transition-transform duration-500">
              <Image
                src={DUMMY_IMAGES.hero}
                alt="Gift collection"
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
