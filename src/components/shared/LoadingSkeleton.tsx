import React from 'react'

export const ProjectCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-150 dark:border-neutral-800 p-5 shadow-xs animate-pulse flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="h-6 bg-neutral-200 dark:bg-neutral-800 rounded w-1/2"></div>
        <div className="h-5 bg-neutral-200 dark:bg-neutral-800 rounded-full w-16"></div>
      </div>
      <div className="flex flex-col gap-2">
        <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-full"></div>
        <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-5/6"></div>
      </div>
      <div className="flex items-center justify-between border-t border-neutral-100 dark:border-neutral-800 pt-4 mt-2">
        <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-28"></div>
        <div className="flex -space-x-2">
          <div className="h-6 w-6 bg-neutral-200 dark:bg-neutral-800 rounded-full"></div>
          <div className="h-6 w-6 bg-neutral-200 dark:bg-neutral-800 rounded-full"></div>
          <div className="h-6 w-6 bg-neutral-200 dark:bg-neutral-800 rounded-full"></div>
        </div>
      </div>
    </div>
  )
}

export const StoryRowSkeleton: React.FC = () => {
  return (
    <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-3.5 shadow-xs animate-pulse flex items-center justify-between gap-4">
      <div className="flex items-center gap-3 flex-1">
        <div className="h-4 w-4 bg-neutral-200 dark:bg-neutral-800 rounded shrink-0"></div>
        <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-2/3"></div>
      </div>
      <div className="flex items-center gap-2">
        <div className="h-5 bg-neutral-200 dark:bg-neutral-800 rounded-full w-12"></div>
        <div className="h-6 w-6 bg-neutral-200 dark:bg-neutral-800 rounded-full"></div>
      </div>
    </div>
  )
}

export const TaskCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-3.5 shadow-xs animate-pulse flex flex-col gap-3">
      <div className="flex justify-between">
        <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-2/3"></div>
        <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded-full w-8"></div>
      </div>
      <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-full"></div>
      <div className="flex items-center justify-between pt-1">
        <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-16"></div>
        <div className="h-6 w-6 bg-neutral-200 dark:bg-neutral-800 rounded-full"></div>
      </div>
    </div>
  )
}

export const PageSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col gap-6 w-full animate-pulse p-2 font-sans">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <div className="h-7 w-48 bg-neutral-200 dark:bg-neutral-800 rounded-lg"></div>
          <div className="h-4 w-72 bg-neutral-200 dark:bg-neutral-800 rounded-md"></div>
        </div>
        <div className="h-9 w-32 bg-neutral-200 dark:bg-neutral-800 rounded-xl"></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ProjectCardSkeleton />
        <ProjectCardSkeleton />
        <ProjectCardSkeleton />
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
