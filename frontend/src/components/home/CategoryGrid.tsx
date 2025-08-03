"use client";

import Image from "next/image";
import Link from "next/link";
import { DUMMY_IMAGES } from "@/constants/dummyData";

export default function CategoryGrid() {
  return (
    <section className="py-16 lg:py-24 px-[5%] bg-gradient-to-br from-gray-50 to-white dark:from-slate-800 dark:to-slate-900 relative">
      {/* Background decoration */}
      <div className="absolute top-8 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-red-600 to-orange-500 rounded-full"></div>

      <div className="max-w-7xl mx-auto bg-white dark:bg-slate-800 rounded-3xl shadow-lg p-8 lg:p-12 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-400 to-red-500 rounded-full transform translate-x-16 -translate-y-16"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-br from-red-400 to-orange-500 rounded-full transform -translate-x-16 translate-y-16"></div>
        </div>

        {/* Section Header */}
        <div className="text-center mb-12 relative z-10">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-gray-900 to-orange-500 dark:from-gray-100 dark:to-orange-400 bg-clip-text text-transparent">
              Shop by
            </span>{" "}
            <span className="text-orange-500 text-4xl lg:text-5xl">
              Category
            </span>
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Find the perfect gift for any occasion
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
          {DUMMY_IMAGES.categories.slice(0, 8).map((category) => (
            <Link
              key={category.id}
              href={`/categories/${category.slug}`}
              className="group relative overflow-hidden rounded-2xl bg-white dark:bg-slate-700 shadow-md hover:shadow-xl transition-all duration-500 hover:-translate-y-2"
            >
              {/* Category Image */}
              <div className="relative h-64 overflow-hidden">
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

                {/* Category Info */}
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <h3 className="text-xl font-bold mb-2 group-hover:text-orange-300 transition-colors duration-300">
                    {category.name}
                  </h3>
                  <p className="text-sm opacity-90 flex items-center gap-2">
                    <span>Explore Collection</span>
                    <svg
                      className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 8l4 4m0 0l-4 4m4-4H3"
                      />
                    </svg>
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* View All Categories Button */}
        <div className="text-center mt-12 relative z-10">
          <Link
            href="/categories"
            className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-red-600 to-orange-500 text-white font-medium rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-300"
          >
            View All Categories
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
