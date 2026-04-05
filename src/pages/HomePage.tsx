import { useLocation } from "wouter";

export default function HomePage() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex flex-col items-center justify-center p-6">
      <div className="max-w-2xl w-full text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl mb-6 shadow-lg">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-3">Passport Photo Maker</h1>
        <p className="text-lg text-gray-500">Create professional passport photos ready for printing on A4 paper</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-2xl">
        <button
          onClick={() => setLocation("/single")}
          className="group relative bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 p-8 text-left hover:border-primary/40 hover:-translate-y-0.5"
        >
          <div className="flex items-center justify-center w-14 h-14 bg-blue-50 rounded-xl mb-5 group-hover:bg-blue-100 transition-colors">
            <svg className="w-7 h-7 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Single Photo</h2>
          <p className="text-sm text-gray-500 leading-relaxed">Upload one photo, adjust the crop, add optional name & date, then generate a full A4 sheet of identical passport photos.</p>
          <div className="mt-5 inline-flex items-center text-sm font-medium text-primary">
            Get started
            <svg className="ml-1.5 w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </button>

        <button
          onClick={() => setLocation("/multi")}
          className="group relative bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 p-8 text-left hover:border-primary/40 hover:-translate-y-0.5"
        >
          <div className="flex items-center justify-center w-14 h-14 bg-indigo-50 rounded-xl mb-5 group-hover:bg-indigo-100 transition-colors">
            <svg className="w-7 h-7 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Multiple Photos</h2>
          <p className="text-sm text-gray-500 leading-relaxed">Upload up to 6 different people's photos. Each row on the A4 sheet will repeat one person's photo side by side.</p>
          <div className="mt-5 inline-flex items-center text-sm font-medium text-indigo-600">
            Get started
            <svg className="ml-1.5 w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </button>
      </div>

      <p className="mt-10 text-xs text-gray-400">Supports A4 paper (210 × 297 mm) · 35 × 45 mm standard passport size</p>
    </div>
  );
}
