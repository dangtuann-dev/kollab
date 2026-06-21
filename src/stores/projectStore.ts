import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { Project, Sprint } from '../types'

interface ProjectState {
  currentProject: Project | null
  projects: Project[]
  currentSprint: Sprint | null
  setCurrentProject: (project: Project | null) => void
  setProjects: (projects: Project[]) => void
  setCurrentSprint: (sprint: Sprint | null) => void
}

export const useProjectStore = create<ProjectState>()(
  devtools(
    (set) => ({
      currentProject: null,
      projects: [],
      currentSprint: null,
      setCurrentProject: (project) => set({ currentProject: project }),
      setProjects: (projects) => set({ projects }),
      setCurrentSprint: (sprint) => set({ currentSprint: sprint }),
    })
  )
)
