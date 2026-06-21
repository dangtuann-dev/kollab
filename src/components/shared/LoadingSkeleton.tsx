import React from 'react'

export const ProjectCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-xl border border-neutral-150 p-5 shadow-sm animate-pulse flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="h-6 bg-neutral-200 rounded w-1/2"></div>
        <div className="h-5 bg-neutral-200 rounded-full w-16"></div>
      </div>
      <div className="flex flex-col gap-2">
        <div className="h-4 bg-neutral-200 rounded w-full"></div>
        <div className="h-4 bg-neutral-200 rounded w-5/6"></div>
      </div>
      <div className="flex items-center justify-between border-t border-neutral-100 pt-4 mt-2">
        <div className="h-4 bg-neutral-200 rounded w-28"></div>
        <div className="flex -space-x-2">
          <div className="h-6 w-6 bg-neutral-200 rounded-full"></div>
          <div className="h-6 w-6 bg-neutral-200 rounded-full"></div>
          <div className="h-6 w-6 bg-neutral-200 rounded-full"></div>
        </div>
      </div>
    </div>
  )
}

export const StoryCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-lg border border-neutral-200 p-4 shadow-sm animate-pulse flex gap-3">
      <div className="h-4 w-4 bg-neutral-200 rounded shrink-0"></div>
      <div className="flex-1 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="h-4 bg-neutral-200 rounded w-20"></div>
          <div className="h-5 bg-neutral-200 rounded-full w-14"></div>
        </div>
        <div className="h-5 bg-neutral-200 rounded w-5/6"></div>
        <div className="flex items-center justify-between pt-2">
          <div className="flex gap-2">
            <div className="h-5 bg-neutral-200 rounded w-8"></div>
            <div className="h-5 bg-neutral-200 rounded w-16"></div>
          </div>
          <div className="h-6 w-6 bg-neutral-200 rounded-full"></div>
        </div>
      </div>
    </div>
  )
}

export const TaskCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-lg border border-neutral-200 p-3.5 shadow-sm animate-pulse flex flex-col gap-3">
      <div className="flex justify-between">
        <div className="h-4 bg-neutral-200 rounded w-2/3"></div>
        <div className="h-4 bg-neutral-200 rounded-full w-8"></div>
      </div>
      <div className="h-4 bg-neutral-200 rounded w-full"></div>
      <div className="flex items-center justify-between pt-1">
        <div className="h-4 bg-neutral-200 rounded w-16"></div>
        <div className="h-6 w-6 bg-neutral-200 rounded-full"></div>
      </div>
    </div>
  )
}

export const SkeletonGrid: React.FC<{ count?: number }> = ({ count = 3 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ProjectCardSkeleton key={i} />
      ))}
    </div>
  )
}
