"use client";

import React from 'react';
import { formatNumber } from '@/lib/textAnalysis';
import type { TextStats } from '@/lib/textAnalysis';
import '../components/MagicBento.css';

interface StatsBentoProps {
  stats: TextStats;
}

export const StatsBento: React.FC<StatsBentoProps> = ({ stats }) => {
  const statsCards = [
    {
      title: formatNumber(stats.charactersWithSpaces),
      description: 'Characters',
      label: 'Total',
      color: '#1e40af', // blue-800
    },
    {
      title: formatNumber(stats.words),
      description: 'Words',
      label: 'Count',
      color: '#7c3aed', // violet-600
    },
    {
      title: formatNumber(stats.sentences),
      description: 'Sentences',
      label: 'Structure',
      color: '#059669', // emerald-600
    },
    {
      title: stats.readingTime,
      description: 'Reading Time',
      label: 'Estimate',
      color: '#dc2626', // red-600
    },
    {
      title: formatNumber(stats.paragraphs),
      description: 'Paragraphs',
      label: 'Blocks',
      color: '#ea580c', // orange-600
    },
    {
      title: formatNumber(stats.uniqueWords),
      description: 'Unique Words',
      label: 'Vocabulary',
      color: '#0891b2', // cyan-600
    },
  ];

  // Add readability card if available
  if (stats.readability) {
    statsCards.push({
      title: stats.readability.fleschKincaidScore.toString(),
      description: 'Readability',
      label: stats.readability.gradeLevel,
      color: '#8B5CF6', // purple-500
    });
  }

  return (
    <div className="space-y-4 w-full">
      {/* Main statistics grid - first 6 cards */}
      <div className="grid grid-cols-2 gap-4 w-full">
        {statsCards.slice(0, 6).map((card, index) => (
          <div
            key={index}
            className="stats-card rounded-xl p-4 flex flex-col justify-between h-full"
            style={{
              backgroundColor: card.color,
              '--glow-color': card.color.replace('#', ''),
              minHeight: '160px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            } as React.CSSProperties}
          >
            <div className="text-left">
              <div className="card__label text-white/70 text-sm">{card.label}</div>
            </div>
            <div className="text-right mt-auto">
              <h2 className="card__title text-white text-2xl sm:text-3xl font-bold text-shadow-light">{card.title}</h2>
              <p className="card__description text-white/80 text-xs sm:text-sm text-shadow-light">{card.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Readability card - displayed separately when available */}
      {statsCards.length > 6 && (
        <div className="grid grid-cols-1 gap-4 w-full">
          {statsCards.slice(6).map((card, index) => (
            <div
              key={index + 6}
              className="stats-card rounded-xl p-4 flex flex-col justify-between h-full"
              style={{
                backgroundColor: card.color,
                '--glow-color': card.color.replace('#', ''),
                minHeight: '120px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              } as React.CSSProperties}
            >
              <div className="text-left">
                <div className="card__label text-white/70 text-sm">{card.label}</div>
              </div>
              <div className="text-right mt-auto">
                <h2 className="card__title text-white text-2xl sm:text-3xl font-bold text-shadow-light">{card.title}</h2>
                <p className="card__description text-white/80 text-xs sm:text-sm text-shadow-light">{card.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};