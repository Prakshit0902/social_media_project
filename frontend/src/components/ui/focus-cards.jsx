"use client";
import React, { useState } from "react";
import { cn } from "../../lib/utils";
import { IconHeart, IconMessageCircle, IconShare } from '@tabler/icons-react';

export const Card = React.memo(({
  card,
  index,
  hovered,
  setHovered
}) => (
  <div
    onMouseEnter={() => setHovered(index)}
    onMouseLeave={() => setHovered(null)}
    className={cn(
      "rounded-lg relative bg-gray-100 dark:bg-neutral-900 overflow-hidden h-60 md:h-96 w-full transition-all duration-300 ease-out",
      hovered !== null && hovered !== index && "blur-sm scale-[0.98]"
    )}>
    <img src={card.src} alt={card.title} className="object-cover absolute inset-0 w-full h-full" />
    
    {/* Dark overlay when hovered */}
    <div
      className={cn(
        "absolute inset-0 bg-black/60 transition-opacity duration-300",
        hovered === index ? "opacity-100" : "opacity-0"
      )}
    />
    
    {/* Stats in center */}
    <div
      className={cn(
        "absolute inset-0 flex items-center justify-center transition-all duration-300",
        hovered === index ? "opacity-100 scale-100" : "opacity-0 scale-95"
      )}>
      <div className="flex gap-8 text-white">
        {/* Likes */}
        <div className="flex flex-col items-center gap-2 hover:scale-110 transition-transform">
          <IconHeart size={40} stroke={2} />
          <span className="text-sm md:text-base font-semibold">{card.likes || 0}</span>
        </div>
        
        {/* Comments */}
        <div className="flex flex-col items-center gap-2 hover:scale-110 transition-transform">
          <IconMessageCircle size={40} stroke={2} />
          <span className="text-sm md:text-base font-semibold">{card.comments || 0}</span>
        </div>
        
        {/* Shares */}
        <div className="flex flex-col items-center gap-2 hover:scale-110 transition-transform">
          <IconShare size={40} stroke={2} />
          <span className="text-sm md:text-base font-semibold">{card.shares || 0}</span>
        </div>
      </div>
    </div>
    
    {/* Title at bottom */}
    <div
      className={cn(
        "absolute bottom-0 left-0 right-0 p-4 md:p-6 transition-all duration-300",
        hovered === index ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
      )}>
      <div className="text-xl md:text-2xl font-medium text-white">
        {card.title}
      </div>
    </div>
  </div>
));

Card.displayName = "Card";

export function FocusCards({ cards }) {
  const [hovered, setHovered] = useState(null);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-5xl mx-auto md:px-8 w-full">
      {cards.map((card, index) => (
        <Card
          key={card.key}
          card={card}
          index={index}
          hovered={hovered}
          setHovered={setHovered}
        />
      ))}
    </div>
  );
}