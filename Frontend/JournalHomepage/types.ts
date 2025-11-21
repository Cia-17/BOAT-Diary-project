import React from 'react';

export type ScreenType = 'home' | 'stats' | 'entry';

export interface NavItemProps {
  icon: React.ElementType;
  label: string;
  isActive?: boolean;
  onClick: () => void;
  isCenter?: boolean;
}

export interface EmotionData {
  name: string;
  value: number;
  fill: string;
}