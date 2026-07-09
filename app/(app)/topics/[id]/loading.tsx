export default function TopicLoading() {
  return (
    <div className="animate-pulse">
      <div className="mb-4 h-4 w-16 rounded bg-slate-800" />
      <div className="mb-6 h-8 w-2/3 rounded bg-slate-800" />
      {[0, 1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="mb-3 h-14 rounded-lg border border-slate-800 bg-slate-900"
        />
      ))}
    </div>
  );
}
