import { useState } from 'react'
import { Notice } from './ui'

/** Message state that remembers whether it is an error. */
export function useNotice() {
  const [notice, setNotice] = useState<{ tone: 'info' | 'error' | 'success'; text: string } | null>(null)
  return {
    notice,
    clear: () => setNotice(null),
    info: (text: string) => setNotice({ tone: 'info', text }),
    success: (text: string) => setNotice({ tone: 'success', text }),
    error: (text: string) => setNotice({ tone: 'error', text }),
    node: notice ? <Notice tone={notice.tone}>{notice.text}</Notice> : null,
  }
}
