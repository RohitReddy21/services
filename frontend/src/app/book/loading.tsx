export default function Loading() {
  return (
    <div className="min-h-[calc(100vh-4.5rem)] bg-linear-to-b from-sky-50 via-white to-slate-25">
      <div className="container-ags py-6 lg:py-8">
        <header className="grid gap-5 border-b border-brand-100 pb-5 md:grid-cols-[minmax(0,1fr)_auto]">
          <div>
            <div className="h-3 w-36 rounded-full bg-brand-100 ags-shimmer" />
            <div className="mt-3 h-9 w-64 max-w-full rounded-lg bg-slate-200 ags-shimmer" />
            <div className="mt-3 h-4 w-full max-w-md rounded-full bg-slate-100 ags-shimmer" />
          </div>
          <div className="h-24 rounded-lg border border-slate-200 bg-white p-4 shadow-sm shadow-navy-900/5 md:w-64">
            <div className="h-3 w-20 rounded-full bg-slate-100 ags-shimmer" />
            <div className="mt-4 h-4 w-36 rounded-full bg-slate-200 ags-shimmer" />
            <div className="mt-3 h-3 w-44 rounded-full bg-slate-100 ags-shimmer" />
          </div>
        </header>

        <div className="mt-5 rounded-lg border border-brand-100 bg-white px-3 py-4 shadow-sm shadow-navy-900/5">
          <div className="grid grid-cols-6 gap-2">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="flex flex-col items-center gap-2">
                <div className="size-8 rounded-full bg-brand-100 ags-shimmer" />
                <div className="h-3 w-16 rounded-full bg-slate-100 ags-shimmer" />
              </div>
            ))}
          </div>
        </div>

        <section className="mt-5 overflow-hidden rounded-lg border border-brand-100 bg-white shadow-xl shadow-navy-900/10">
          <div className="flex items-center justify-between border-b border-slate-100 bg-slate-25 px-4 py-3 sm:px-6">
            <div className="h-4 w-36 rounded-full bg-brand-100 ags-shimmer" />
            <div className="hidden h-3 w-56 rounded-full bg-slate-100 ags-shimmer sm:block" />
          </div>
          <div className="p-4 sm:p-6 lg:p-7">
            <div className="h-4 w-28 rounded-full bg-brand-100 ags-shimmer" />
            <div className="mt-4 h-7 w-64 max-w-full rounded-lg bg-slate-200 ags-shimmer" />
            <div className="mt-7 grid gap-4 sm:grid-cols-2">
              {Array.from({ length: 2 }).map((_, index) => (
                <div key={index} className="h-36 rounded-lg bg-slate-100 ags-shimmer" />
              ))}
            </div>
            <div className="mt-8 flex justify-between">
              <div className="h-11 w-24 rounded-lg bg-slate-100 ags-shimmer" />
              <div className="h-11 w-36 rounded-lg bg-brand-100 ags-shimmer" />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
