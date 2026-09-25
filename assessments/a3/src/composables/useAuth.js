import { computed, ref } from 'vue'
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile
} from 'firebase/auth'
import {
  doc,
  getDoc,
  setDoc
} from 'firebase/firestore'
import { auth, db } from '../firebase'

const currentUser = ref(null)
const authError = ref('')
const authReady = ref(false)

async function loadUserProfile(firebaseUser) {
  const profileRef = doc(db, 'users', firebaseUser.uid)
  const profileSnapshot = await getDoc(profileRef)

  if (!profileSnapshot.exists()) {
    currentUser.value = {
      id: firebaseUser.uid,
      name: firebaseUser.displayName || firebaseUser.email,
      email: firebaseUser.email,
      role: 'user'
    }

    return
  }

  const profile = profileSnapshot.data()

  currentUser.value = {
    id: firebaseUser.uid,
    name:
      profile.name ||
      firebaseUser.displayName ||
      firebaseUser.email,
    email: firebaseUser.email,
    role: profile.role || 'user'
  }
}

const initialAuthState = new Promise((resolve) => {
  onAuthStateChanged(auth, async (firebaseUser) => {
    try {
      if (firebaseUser) {
        await loadUserProfile(firebaseUser)
      } else {
        currentUser.value = null
      }
    } catch {
      currentUser.value = null
      authError.value = 'Unable to load your account profile.'
    } finally {
      authReady.value = true
      resolve()
    }
  })
})

function setAuthError(error) {
  if (error.code === 'auth/email-already-in-use') {
    authError.value = 'An account with this email already exists.'
  } else if (error.code === 'auth/invalid-credential') {
    authError.value = 'Invalid email or password.'
  } else if (error.code === 'auth/too-many-requests') {
    authError.value =
      'Too many login attempts. Please try again later.'
  } else {
    authError.value =
      'Authentication failed. Please try again.'
  }
}

async function register(name, email, password) {
  authError.value = ''

  try {
    const trimmedName = name.trim()
    const normalisedEmail = email.trim().toLowerCase()

    const credential =
      await createUserWithEmailAndPassword(
        auth,
        normalisedEmail,
        password
      )

    await updateProfile(credential.user, {
      displayName: trimmedName
    })

    const profile = {
      name: trimmedName,
      email: normalisedEmail,
      role: 'user'
    }

    await setDoc(
      doc(db, 'users', credential.user.uid),
      profile
    )

    currentUser.value = {
      id: credential.user.uid,
      ...profile
    }

    return true
  } catch (error) {
    setAuthError(error)
    return false
  }
}

async function login(email, password) {
  authError.value = ''

  try {
    const credential =
      await signInWithEmailAndPassword(
        auth,
        email.trim().toLowerCase(),
        password
      )

    await loadUserProfile(credential.user)

    return true
  } catch (error) {
    setAuthError(error)
    return false
  }
}

async function logout() {
  authError.value = ''

  try {
    await signOut(auth)
    currentUser.value = null
  } catch {
    authError.value = 'Unable to log out. Please try again.'
  }
}

function waitForAuth() {
  return authReady.value
    ? Promise.resolve()
    : initialAuthState
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
    logout,
    waitForAuth
  }
}