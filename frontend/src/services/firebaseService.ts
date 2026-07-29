import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  updateProfile,
  type User,
} from 'firebase/auth'
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore'
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { auth, db, googleProvider, storage } from '../firebase'
import type { FriendRequest, NotificationItem, StudyGroup, StudyLog, StudyTask, UserProfile } from '../types'

const ensureAuth = () => {
  if (!auth) throw new Error('Firebase auth is not configured')
  return auth
}

const ensureDb = () => {
  if (!db) throw new Error('Firebase Firestore is not configured')
  return db
}

const ensureStorage = () => {
  if (!storage) throw new Error('Firebase Storage is not configured')
  return storage
}

export const signUpWithEmail = async (email: string, password: string, name: string) => {
  const authInstance = ensureAuth()
  const userCredential = await createUserWithEmailAndPassword(authInstance, email, password)
  await updateProfile(userCredential.user, { displayName: name })
  await createUserProfile(userCredential.user, name)
  await sendEmailVerification(userCredential.user)
  return userCredential.user
}

export const signInWithEmail = async (email: string, password: string) => {
  const authInstance = ensureAuth()
  return signInWithEmailAndPassword(authInstance, email, password)
}

export const signInWithGoogle = async () => {
  const authInstance = ensureAuth()
  const result = await signInWithPopup(authInstance, googleProvider)
  await createUserProfile(result.user)
  return result.user
}

export const resetPassword = async (email: string) => {
  const authInstance = ensureAuth()
  await sendPasswordResetEmail(authInstance, email)
}

export const logout = async () => {
  const authInstance = ensureAuth()
  await firebaseSignOut(authInstance)
}

export const createUserProfile = async (user: User, name?: string) => {
  const firestore = ensureDb()
  const profileRef = doc(firestore, 'users', user.uid)
  const existing = await getDoc(profileRef)
  if (existing.exists()) return

  const profile: UserProfile = {
    uid: user.uid,
    name: name ?? user.displayName ?? 'StudyTrack User',
    photo: user.photoURL ?? '',
    email: user.email ?? '',
    college: '',
    department: '',
    year: '',
    phone: '',
    bio: '',
    skills: [],
    github: '',
    linkedin: '',
    leetcode: '',
    hackerrank: '',
    joinedDate: new Date().toISOString(),
    lastSeen: new Date().toISOString(),
    onlineStatus: 'online',
    theme: 'dark',
    notificationsEnabled: true,
  }

  await setDoc(profileRef, profile)
}

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  const firestore = ensureDb()
  const profileRef = doc(firestore, 'users', uid)
  const snapshot = await getDoc(profileRef)
  return snapshot.exists() ? (snapshot.data() as UserProfile) : null
}

export const updateUserProfile = async (uid: string, updates: Partial<UserProfile>) => {
  const firestore = ensureDb()
  await updateDoc(doc(firestore, 'users', uid), { ...updates, lastSeen: new Date().toISOString() })
}

export const listenToUserProfile = (uid: string, onChange: (profile: UserProfile | null) => void) => {
  const firestore = ensureDb()
  return onSnapshot(doc(firestore, 'users', uid), (snapshot) => {
    onChange(snapshot.exists() ? (snapshot.data() as UserProfile) : null)
  })
}

export const createTask = async (task: Omit<StudyTask, 'id' | 'createdAt' | 'updatedAt'>) => {
  const firestore = ensureDb()
  const payload = {
    ...task,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  const ref = await addDoc(collection(firestore, 'tasks'), payload)
  return ref.id
}

export const updateTask = async (taskId: string, updates: Partial<StudyTask>) => {
  const firestore = ensureDb()
  await updateDoc(doc(firestore, 'tasks', taskId), { ...updates, updatedAt: new Date().toISOString() })
}

export const deleteTask = async (taskId: string) => {
  const firestore = ensureDb()
  await deleteDoc(doc(firestore, 'tasks', taskId))
}

export const listenToTasks = (uid: string, onChange: (tasks: StudyTask[]) => void) => {
  const firestore = ensureDb()
  const q = query(collection(firestore, 'tasks'), where('memberIds', 'array-contains', uid), orderBy('createdAt', 'desc'))
  return onSnapshot(q, (snapshot) => {
    onChange(snapshot.docs.map((doc) => ({ id: doc.id, ...(doc.data() as Omit<StudyTask, 'id'>) })))
  })
}

export const createGroup = async (group: Omit<StudyGroup, 'id' | 'createdAt' | 'updatedAt'>) => {
  const firestore = ensureDb()
  const payload = {
    ...group,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  const ref = await addDoc(collection(firestore, 'groups'), payload)
  return ref.id
}

export const listenToGroups = (uid: string, onChange: (groups: StudyGroup[]) => void) => {
  const firestore = ensureDb()
  const q = query(collection(firestore, 'groups'), where('memberIds', 'array-contains', uid), orderBy('createdAt', 'desc'))
  return onSnapshot(q, (snapshot) => {
    onChange(snapshot.docs.map((doc) => ({ id: doc.id, ...(doc.data() as Omit<StudyGroup, 'id'>) })))
  })
}

export const createStudyLog = async (log: Omit<StudyLog, 'id'>) => {
  const firestore = ensureDb()
  await addDoc(collection(firestore, 'studyLogs'), log)
}

export const listenToStudyLogs = (uid: string, onChange: (logs: StudyLog[]) => void) => {
  const firestore = ensureDb()
  const q = query(collection(firestore, 'studyLogs'), where('userId', '==', uid), orderBy('createdAt', 'desc'))
  return onSnapshot(q, (snapshot) => {
    onChange(snapshot.docs.map((doc) => ({ id: doc.id, ...(doc.data() as Omit<StudyLog, 'id'>) })))
  })
}

export const createFriendRequest = async (senderId: string, recipientEmail: string) => {
  const firestore = ensureDb()
  const payload: FriendRequest = {
    id: '',
    senderId,
    senderEmail: '',
    recipientEmail,
    status: 'pending',
    createdAt: new Date().toISOString(),
  }
  const ref = await addDoc(collection(firestore, 'friendRequests'), payload)
  return ref.id
}

export const listenToFriendRequests = (uid: string, onChange: (requests: FriendRequest[]) => void) => {
  const firestore = ensureDb()
  const q = query(collection(firestore, 'friendRequests'), where('recipientEmail', '==', uid), orderBy('createdAt', 'desc'))
  return onSnapshot(q, (snapshot) => {
    onChange(snapshot.docs.map((doc) => ({ id: doc.id, ...(doc.data() as Omit<FriendRequest, 'id'>) })))
  })
}

export const createNotification = async (notification: Omit<NotificationItem, 'id'>) => {
  const firestore = ensureDb()
  await addDoc(collection(firestore, 'notifications'), notification)
}

export const listenToNotifications = (uid: string, onChange: (items: NotificationItem[]) => void) => {
  const firestore = ensureDb()
  const q = query(collection(firestore, 'notifications'), where('recipientId', '==', uid), orderBy('createdAt', 'desc'))
  return onSnapshot(q, (snapshot) => {
    onChange(snapshot.docs.map((doc) => ({ id: doc.id, ...(doc.data() as Omit<NotificationItem, 'id'>) })))
  })
}

export const uploadFile = async (file: File, path: string) => {
  const storageInstance = ensureStorage()
  const storageRef = ref(storageInstance, path)
  await uploadBytes(storageRef, file)
  return getDownloadURL(storageRef)
}
