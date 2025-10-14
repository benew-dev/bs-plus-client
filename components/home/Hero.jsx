"use client";

import Link from "next/link";
import {
  ShoppingBag,
  TrendingUp,
  Shield,
  Zap,
  ArrowRight,
  Sparkles,
} from "lucide-react";

const Hero = () => {
  const features = [
    {
      icon: <ShoppingBag className="w-6 h-6" />,
      title: "50K+ Produits",
      color: "bg-blue-500",
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "10K+ Clients",
      color: "bg-green-500",
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "100% Sécurisé",
      color: "bg-purple-500",
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Livraison Express",
      color: "bg-orange-500",
    },
  ];

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -right-1/4 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute -bottom-1/2 -left-1/4 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative container max-w-[1440px] mx-auto px-4 py-16 md:py-24">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          {/* Content */}
          <div className="flex-1 text-center lg:text-left z-10">
            {/* Main Title */}
            <div className="mb-6">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 mb-4">
                Bienvenue sur Buy It Now
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 font-semibold mb-2">
                Votre destination shopping de confiance
              </p>
              <p className="text-lg text-gray-500">
                Découvrez des milliers de produits de qualité à des prix
                imbattables
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link
                href="/shop"
                className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl flex items-center justify-center"
              >
                Parcourir la boutique
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/about"
                className="px-8 py-4 bg-white text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors shadow-lg border border-gray-200 flex items-center justify-center"
              >
                En savoir plus
              </Link>
            </div>
          </div>

          {/* Visual Element */}
          <div className="flex-1 relative z-10">
            <div className="relative bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl shadow-2xl p-12">
              {/* Decorative Elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/20 rounded-full blur-2xl"></div>
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-white/20 rounded-full blur-2xl"></div>

              {/* Icon */}
              <div className="text-white text-center mb-6">
                <ShoppingBag className="w-12 h-12 mx-auto" />
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4">
                {features.map((feature, index) => (
                  <div
                    key={index}
                    className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center hover:bg-white/20 transition-colors"
                  >
                    <div
                      className={`${feature.color} w-12 h-12 rounded-full flex items-center justify-center text-white mx-auto mb-2 shadow-lg`}
                    >
                      {feature.icon}
                    </div>
                    <p className="text-white font-semibold text-sm">
                      {feature.title}
                    </p>
                  </div>
                ))}
              </div>

              {/* Decorative Pattern */}
              <div className="absolute inset-0 bg-white/5 rounded-3xl backdrop-blur-3xl"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Wave Separator */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg
          viewBox="0 0 1440 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-auto"
        >
          <path
            d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
            fill="white"
          />
        </svg>
      </div>

      {/* Add animations to globals.css */}
      <style jsx>{`
        @keyframes blob {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </section>
  );
};

export default Hero;
