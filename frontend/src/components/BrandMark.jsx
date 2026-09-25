function BrandMark({ light = false }) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-xl ${
          light ? "bg-white/15" : "bg-[#E8F0E7]"
        }`}
      >
        <span className="text-xl">🥬</span>
      </div>

      <div>
        <p
          className={`text-lg font-bold tracking-tight ${
            light ? "text-white" : "text-[#1F4D3A]"
          }`}
        >
          FBDMS
        </p>

        <p
          className={`text-[10px] font-medium uppercase tracking-[0.18em] ${
            light ? "text-white/70" : "text-[#6C786F]"
          }`}
        >
          Eat well. Live well.
        </p>
      </div>
    </div>
  );
}

export default BrandMark;