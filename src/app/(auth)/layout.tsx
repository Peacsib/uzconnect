import Image from "next/image"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-20 w-72 h-72 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 rounded-full bg-white/10 blur-3xl" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
              <span className="text-indigo-600 font-bold text-lg">UZ</span>
            </div>
            <span className="text-white font-bold text-xl">UZConnect</span>
          </div>
        </div>
        <div className="relative z-10">
          <h1 className="text-4xl font-bold text-white leading-tight mb-4">
            Work-Related Learning, Simplified.
          </h1>
          <p className="text-indigo-100 text-lg">
            Track placements, logbooks, assessments, and supervisors — all in one place.
          </p>
        </div>
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex -space-x-2">
            {["S","L","C"].map((l, i) => (
              <div key={i} className="w-9 h-9 rounded-full bg-white/20 border-2 border-white flex items-center justify-center text-white text-xs font-semibold">
                {l}
              </div>
            ))}
          </div>
          <p className="text-indigo-100 text-sm">Trusted by students, lecturers, supervisors & coordinators</p>
        </div>
      </div>

      {/* Right panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">UZ</span>
            </div>
            <span className="font-bold text-lg">UZConnect</span>
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}