import { ref } from 'vue'

export const isAuthenticated = ref(false)

const validUsername = 'admin'
const validPassword = 'password123'

export const login = (username, password) => {
  if (
    username === validUsername &&
    password === validPassword
  ) {
    isAuthenticated.value = true
    return true
  }

  return false
}

export const logout = () => {
  isAuthenticated.value = false
}