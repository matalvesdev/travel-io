'use client';

import * as React from 'react';

interface UserAvatarProps {
  src: string | null | undefined;
  name: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-16 w-16 text-lg',
};

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function UserAvatar({ src, name, size = 'md', className }: UserAvatarProps) {
  const initials = getInitials(name);

  return (
    <div
      className={`relative inline-flex items-center justify-center overflow-hidden rounded-full bg-muted ${sizeClasses[size]} ${className}`}
    >
      {src ? (
        <img
          src={src}
          alt={name}
          className="h-full w-full object-cover"
        />
      ) : (
        <span className="font-medium text-muted-foreground">{initials}</span>
      )}
    </div>
  );
}
