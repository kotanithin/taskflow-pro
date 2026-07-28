export type TaskStatus = 'todo' | 'doing' | 'done'
export type TaskPriority = 'low' | 'medium' | 'high'

export interface StudyTask {
  id: string
  title: string
  description: string
  group: string
  assignedTo: string
  createdBy: string
  priority: TaskPriority
  status: TaskStatus
  dueDate: string
  progress: number
  remarks: string
  createdAt: string
  updatedAt: string
}

export interface StudyGroup {
  id: string
  name: string
  description: string
  createdAt: string
}
