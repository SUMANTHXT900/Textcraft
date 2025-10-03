"use client";

import React from 'react';
import { TextGenerateEffect } from './ui/text-generate-effect';

interface LiveTextareaProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder: string;
  className?: string;
  style?: React.CSSProperties;
}

export const LiveTextarea: React.FC<LiveTextareaProps> = ({ value, onChange, placeholder, className, style }) => {
  return (
    <div className="relative w-full h-full">
      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`${className} bg-transparent text-transparent caret-blue-500`}
        style={style}
      />
      <div className="absolute top-0 left-0 w-full h-full p-4 pointer-events-none overflow-y-auto">
        <TextGenerateEffect words={value || placeholder} />
      </div>
    </div>
  );
};
