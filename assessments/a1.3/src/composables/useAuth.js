import { computed, ref } from 'vue'

const currentUser = ref(null)
const authError = ref('')

const USERS_KEY = 'circularMelbourneUsers'
const CURRENT_USER_KEY = 'circularMelbourneCurrentUser'

function getStoredUsers() {
  const savedUsers = localStorage.getItem(USERS_KEY)

  if (!savedUsers) {
    return []
  }

  try {
    const users = JSON.parse(savedUsers)
    return Array.isArray(users) ? users : []
  } catch {
    localStorage.removeItem(USERS_KEY)
    return []
  }
}

function saveStoredUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

async function hashPassword(password) {
  const encodedPassword = new TextEncoder().encode(password)

  const hashBuffer = await crypto.subtle.digest(
    'SHA-256',
    encodedPassword
  )

  return Array.from(new Uint8Array(hashBuffer))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}

function createSessionUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role
  }
}

function saveCurrentUser(user) {
  const sessionUser = createSessionUser(user)

  currentUser.value = sessionUser

  localStorage.setItem(
    CURRENT_USER_KEY,
    JSON.stringify(sessionUser)
  )
}

function restoreSession() {
  const savedUser = localStorage.getItem(CURRENT_USER_KEY)

  if (!savedUser) {
    return
  }

  try {
    currentUser.value = JSON.parse(savedUser)
  } catch {
    localStorage.removeItem(CURRENT_USER_KEY)
  }
}

async function register(name, email, password) {
  authError.value = ''

  const cleanName = name.trim()
  const cleanEmail = email.trim().toLowerCase()

  const users = getStoredUsers()

  const accountExists = users.some(
    (user) => user.email.toLowerCase() === cleanEmail
  )

  if (accountExists) {
    authError.value = 'An account with this email already exists.'
    return false
  }

  const passwordHash = await hashPassword(password)

  const newUser = {
    id: crypto.randomUUID(),
    name: cleanName,
    email: cleanEmail,
    passwordHash,
    role: 'user'
  }

  users.push(newUser)

  saveStoredUsers(users)
  saveCurrentUser(newUser)

  return true
}

async function login(email, password) {
  authError.value = ''

  const cleanEmail = email.trim().toLowerCase()
  const users = getStoredUsers()

  const user = users.find(
    (storedUser) =>
      storedUser.email.toLowerCase() === cleanEmail
  )

  if (!user) {
    authError.value = 'Invalid email or password.'
    return false
  }

  const passwordHash = await hashPassword(password)

  if (passwordHash !== user.passwordHash) {
    authError.value = 'Invalid email or password.'
    return false
  }

  saveCurrentUser(user)

  return true
}

function logout() {
  currentUser.value = null
  authError.value = ''

  localStorage.removeItem(CURRENT_USER_KEY)
}

function clearAuthError() {
  authError.value = ''
}

const isAuthenticated = computed(
  () => currentUser.value !== null
)

const isAdmin = computed(
  () => currentUser.value?.role === 'admin'
)

restoreSession()

export function useAuth() {
  return {
    currentUser,
    authError,
    isAuthenticated,
    isAdmin,
    register,
    login,
    logout,
    clearAuthError
  }
}