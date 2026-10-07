"use client";

export function PrintButton() {
  return (
    <div className="print:hidden">
      <button
        onClick={() => window.print()}
        className="border border-fg px-6 py-2 text-xs tracking-wide uppercase hover:bg-fg hover:text-bg transition-colors"
      >
        Print
      </button>
    </div>
  );
}