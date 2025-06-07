'use client'

import * as React from 'react'

import LoginForm from '@/views/Login' // Assuming this is the path to your LoginForm component

export default function LoginPage() {
  // Since LoginForm now handles redirection internally and doesn't
  // require an onLoginSuccess prop, this function is no longer needed
  // unless you have other specific logic to execute in the parent
  // component after a successful login that isn't redirection.
  // const handleLoginSuccess = () => {
  //   console.log('Login successful! LoginForm handles redirection.');
  // };

  // Pass the 'mode' prop if your LoginForm (now 'Login' component) expects it.
  // Assuming 'dark' or 'light' is appropriate for your theme context.
  // You might need to derive this from a theme context if available.
  return <LoginForm mode={'light'} />
}
