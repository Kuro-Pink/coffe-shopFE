export default function LoadingSpinner() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-300 bg-opacity-70">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-teal-600 border-t-transparent" />
    </div>
  );
}
