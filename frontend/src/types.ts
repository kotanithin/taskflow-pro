export type TaskStatus = 'todo' | 'in-progress' | 'completed' | 'blocked' | 'cancelled' | 'archived'
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical'
export type FriendStatus = 'pending' | 'accepted' | 'blocked'
export type Availability = 'online' | 'away' | 'offline'

export interface ChecklistItem {
  id: string
  label: string
  done: boolean
}

export interface UserProfile {
  uid: string
  name: string
  photo: string
  email: string
  college: string
  department: string
  year: string
  phone: string
  bio: string
  skills: string[]
  github: string
  linkedin: string
  leetcode: string
  hackerrank: string
  joinedDate: string
  lastSeen: string
  onlineStatus: Availability
  theme: 'dark' | 'light' | 'system'
  notificationsEnabled: boolean
}

export interface StudyTask {
  id: string
  title: string
  description: string
  createdBy: string
  createdByName: string
  assignedTo: string
  assignedToName: string
  priority: TaskPriority
  status: TaskStatus
  dueDate: string
  startDate: string
  estimatedHours: string
  actualHours: string
  subject: string
  tags: string[]
  checklist: ChecklistItem[]
  attachmentUrl?: string
  attachmentName?: string
  reminder: boolean
  repeat: string
  groupId?: string
  memberIds: string[]
  archived: boolean
  createdAt: string
  updatedAt: string
}

export interface StudyGroup {
  id: string
  name: string
  description: string
  ownerId: string
  memberIds: string[]
  avatarUrl: string
  bannerUrl: string
  inviteCode: string
  createdAt: string
  updatedAt: string
}

export interface StudyLog {
  id: string
  userId: string
  hours: number
  topics: string
  difficulty: string
  mood: string
  notes: string
  createdAt: string
}

export interface FriendRequest {
  id: string
  senderId: string
  senderEmail: string
  recipientId?: string
  recipientEmail: string
  status: FriendStatus
  createdAt: string
}

export interface NotificationItem {
  id: string
  recipientId: string
  title: string
  message: string
  type: 'friend' | 'task' | 'group' | 'reminder' | 'system'
  createdAt: string
  read: boolean
}
