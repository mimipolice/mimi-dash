"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { IconArrowRight } from "@tabler/icons-react";

const pale_blue = "#95A9E0";
const pink = "rgb(187, 130, 240)";

const dark_purple = "#311130";

export default function HomePage() {
  const [isHovered, setIsHovered] = useState(false);

  const buttonStyle = {
    backgroundColor: isHovered ? dark_purple : pink,
    transition: "background-color 0.4s ease-in-out, transform 0.2s ease-in-out",
    transform: isHovered ? "scale(1.05)" : "scale(1)",
  };

  return (
    <div
      className="flex w-screen h-screen overflow-hidden"
      style={{ backgroundColor: pale_blue }}
    >
      {/* Left side: Video */}
      <div className="w-1/2 h-full">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
        >
          <source src="/videos/Fox2🦊.webm" type="video/webm" />
          Your browser does not support the video tag.
        </video>
      </div>

      {/* Right side: Content */}
      <div className="w-1/2 h-full flex items-center justify-center p-4 relative">
        <div className="relative z-20 text-white text-center">
          <div className="bg-black bg-opacity-50 p-10 rounded-2xl backdrop-blur-sm">
            <h1
              className="text-5xl md:text-7xl font-bold mb-4"
              style={{ textShadow: "2px 2px 8px rgba(0,0,0,0.7)" }}
            >
              Welcome to the Fox Den!
            </h1>
            <p
              className="text-lg md:text-2xl mb-8"
              style={{
                color: "#95A9E0",
                textShadow: "1px 1px 4px rgba(0,0,0,0.7)",
              }}
            >
              A place of joy and endless dancing.
            </p>
            <Link href="/dashboard">
              <Button
                size="lg"
                className="text-white font-bold py-3 px-6 rounded-lg"
                style={buttonStyle}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                Enter Dashboard
                <IconArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
