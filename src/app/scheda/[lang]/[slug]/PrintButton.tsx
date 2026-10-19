"use client";
export function PrintButton({ label }: { label: string }) {
  return <button className="btn" onClick={() => window.print()}>{label}</button>;
}
