import Image from 'next/image';

interface ShellDisplayProps {
  amount: number;
  className?: string;
}

export function ShellDisplay({ amount, className = '' }: ShellDisplayProps) {
  return (
    <span className={`inline-flex items-center gap-1 ${className}`}>
      {amount.toLocaleString()}
      <Image 
        src="/shell.svg" 
        alt="shells" 
        width={12} 
        height={12} 
        className="inline-block"
      />
    </span>
  );
}

export function formatShells(amount: number): string {
  return amount.toLocaleString();
}
