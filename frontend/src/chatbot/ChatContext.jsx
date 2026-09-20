import { createContext, useContext, useMemo, useState } from 'react'

/** Open/closed state for Leo's panel, shared by the sidebar entry and the chat widget. */
const ChatContext = createContext(null)

export function ChatProvider({ children }) {
  const [open, setOpen] = useState(false)
  const value = useMemo(() => ({ open, setOpen }), [open])
  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
}

export function useChat() {
  const ctx = useContext(ChatContext)
  if (!ctx) throw new Error('useChat must be used inside <ChatProvider>')
  return ctx
}
