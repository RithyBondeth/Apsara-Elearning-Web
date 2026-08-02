"use client"

import { NextIntlClientProvider } from "next-intl"
import { useLanguageStore } from "@/stores/languages/language-store"
import { useEffect, useState, useRef } from "react"
import type { IWithChildren } from "@/utils/interfaces"
import type { TLanguage } from "@/utils/types/app"
import enMessages from "@/language/en.json"
import kmMessages from "@/language/km.json"

const messages: Record<TLanguage, typeof enMessages> = {
  en: enMessages,
  km: kmMessages,
}

interface IProps extends IWithChildren {
  initialLang: TLanguage
}

export function LanguageProviderClient({ children, initialLang }: IProps) {
  const storedLanguage = useLanguageStore((s) => s.language)
  const [language, setLanguage] = useState<TLanguage>(initialLang)
  const synced = useRef(false)

  useEffect(() => {
    if (!synced.current) {
      // First hydration: keep server-rendered language unless user
      // previously saved a non-default preference in localStorage
      if (storedLanguage !== language && storedLanguage !== "en") {
        // Sync the server locale with the persisted browser preference.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setLanguage(storedLanguage)
        document.documentElement.lang = storedLanguage
      }
      synced.current = true
    } else if (storedLanguage !== language) {
      // User toggled language — update immediately
      setLanguage(storedLanguage)
      document.documentElement.lang = storedLanguage
    }
  }, [storedLanguage, language])

  return (
    <NextIntlClientProvider key={language} locale={language} messages={messages[language]} timeZone="Asia/Phnom_Penh">
      {children}
    </NextIntlClientProvider>
  )
}
