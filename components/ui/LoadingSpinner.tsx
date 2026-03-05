export function LoadingSpinner({ className }: { className?: string }) {
  return (
    <div
      className={`animate-spin rounded-full border-2 border-gray-300 border-t-brand-500 ${className ?? "h-5 w-5"}`}
    />
  );
}

export function PageLoader() {
  return (
    <div className="flex items-center justify-center h-64">
      <LoadingSpinner className="h-8 w-8" />
    </div>
  );
}
