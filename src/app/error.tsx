"use client";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <div className="text-center max-w-sm">
        <div className="text-4xl mb-4">😅</div>
        <h1 className="text-xl font-bold mb-2">出错了</h1>
        <p className="text-sm text-muted-foreground mb-6">
          页面加载出现了点问题，请重试
        </p>
        <button
          onClick={reset}
          className="px-6 py-2.5 rounded-xl bg-primary text-white font-medium hover:bg-primary-dark transition-colors"
        >
          重试
        </button>
      </div>
    </div>
  );
}
