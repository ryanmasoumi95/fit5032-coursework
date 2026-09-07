import { computed, ref } from 'vue'

const USERS_KEY = 'circularMelbourneUsers'
const CURRENT_USER_KEY = 'circularMelbourneCurrentUser'

const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]')

const currentUser = ref(
  JSON.parse(localStorage.getItem(CURRENT_USER_KEY) || 'null')
)

const authError = ref('')

const DEMO_ADMIN = {
  id: 'admin-001',
  name: 'Circular Melbourne Admin',
  email: 'admin@circularmelbourne.org.au',
  passwordHash:
    '3eb3fe66b31e3b4d10fa70b5cad49c7112294af6ae4e476a1c405155d45aa121',
  role: 'admin'
}

function saveUsers() {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

function saveSession({ id, name, email, role }) {
  const session = { id, name, email, role }

  currentUser.value = session
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(session))
}

async function hashPassword(password) {
  const hash = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(password)
  )

  return [...new Uint8Array(hash)]
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}

if (!users.some((user) => user.email === DEMO_ADMIN.email)) {
  users.push(DEMO_ADMIN)
  saveUsers()
}

async function register(name, email, password) {
  authError.value = ''
  email = email.trim().toLowerCase()

  if (users.some((user) => user.email === email)) {
    authError.value = 'An account with this email already exists.'
    return false
  }

  const user = {
    id: crypto.randomUUID(),
    name: name.trim(),
    email,
    passwordHash: await hashPassword(password),
    role: 'user'
  }

  users.push(user)
  saveUsers()
  saveSession(user)

  return true
}

async function login(email, password) {
  authError.value = ''
  email = email.trim().toLowerCase()

  const passwordHash = await hashPassword(password)

  const user = users.find(
    (user) =>
      user.email === email &&
      user.passwordHash === passwordHash
  )

  if (!user) {
    authError.value = 'Invalid email or password.'
    return false
  }

  saveSession(user)
  return true
}

function logout() {
  currentUser.value = null
  localStorage.removeItem(CURRENT_USER_KEY)
}

const isAdmin = computed(
  () => currentUser.value?.role === 'admin'
)

export function useAuth() {
  return {
    currentUser,
    authError,
    isAdmin,
    register,
    login,
    logout
  }
}