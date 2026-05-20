import React from 'react';

export function Button({ className, variant = 'default', ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'default' | 'outline' | 'ghost' | 'danger' | 'primary' }) {
  const variants = {
    default: 'bg-black hover:bg-gray-900 text-white shadow-lg shadow-black/10',
    primary: 'bg-primary hover:opacity-90 text-white shadow-lg shadow-orange-500/20',
    outline: 'border border-gray-200 bg-transparent hover:bg-gray-50 text-gray-900',
    ghost: 'bg-transparent hover:bg-gray-50 text-gray-500 hover:text-black',
    danger: 'bg-red-50 border border-red-100 text-red-600 hover:bg-red-100',
  };

  return (
    <button
      className={`inline-flex items-center justify-center rounded-[8px] text-sm font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50 disabled:pointer-events-none px-5 py-2.5 ${variants[variant]} ${className}`}
      {...props}
    />
  );
}

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`flex h-11 w-full rounded-[8px] border border-gray-200 bg-white px-4 py-2 text-sm text-black ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/5 transition-all ${className}`}
      {...props}
    />
  );
}

export function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={`text-sm font-bold leading-none text-gray-500 peer-disabled:cursor-not-allowed peer-disabled:opacity-70 mb-1 block ${className}`}
      {...props}
    />
  );
}

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-[8px] border border-gray-100 bg-white text-black shadow-sm ${className}`}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={`flex flex-col space-y-1.5 p-6 ${className}`} {...props} />;
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={`text-xl font-black leading-none tracking-tight text-black ${className}`} {...props} />;
}

export function CardDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={`text-sm font-medium text-gray-500 ${className}`} {...props} />;
}

export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={`p-6 pt-0 ${className}`} {...props} />;
}
