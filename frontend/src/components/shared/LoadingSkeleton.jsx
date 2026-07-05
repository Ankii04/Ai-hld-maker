export const LoadingSkeleton = ({ className = '' }) => (
  <div className={`skeleton ${className}`} />
)

export const CardSkeleton = () => (
  <div className="bg-[#12121a] border border-[#2a2a3d] rounded-xl p-5 flex flex-col h-[200px]">
    <div className="flex justify-between items-start mb-4">
      <LoadingSkeleton className="w-32 h-6 rounded-md" />
      <LoadingSkeleton className="w-6 h-6 rounded-full" />
    </div>
    <LoadingSkeleton className="w-full h-12 rounded-md mb-auto" />
    <div className="flex justify-between items-center mt-4 pt-4 border-t border-[#2a2a3d]">
      <LoadingSkeleton className="w-20 h-4 rounded-sm" />
      <LoadingSkeleton className="w-16 h-6 rounded-full" />
    </div>
  </div>
)
