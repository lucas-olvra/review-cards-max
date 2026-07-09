export default function TopicsLoading() {
  return (
    <div className="space-y-4">
      {[0, 1, 2].map((i) => (
        <div key={i} className="animate-pulse rounded-xl border border-slate-800 bg-slate-900 p-6">
          <div className="h-5 w-1/3 rounded bg-slate-800" />
          <div className="mt-4 flex gap-2">
            <div className="h-9 w-20 rounded-md bg-slate-800" />
            <div className="h-9 w-20 rounded-md bg-slate-800" />
            <div className="h-9 w-20 rounded-md bg-slate-800" />
          </div>
        </div>
      ))}
    </div>
  );
}
