import { redirect } from 'next/navigation'

// /account opens the Profile tab by default
export default function AccountIndex() {
  redirect('/account/profile')
}