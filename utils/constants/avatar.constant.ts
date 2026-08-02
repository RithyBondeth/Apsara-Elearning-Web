import {
  Bird, Bot, Brain, Cat, Fish, Flame, Flower2, Ghost, Leaf, Music, Rocket, Star,
} from "lucide-react"

/**
 * Mirrors `AVATAR_PRESETS` in the API
 * (`libs/contracts/src/constants/domain/avatar.constant.ts`) — keep in sync.
 *
 * The API stores only the key; the artwork below is the client's business, so
 * avatars can be restyled without migrating stored data.
 */
export const AVATAR_PRESETS = [
  "rocket",
  "star",
  "flower",
  "cat",
  "bird",
  "fish",
  "ghost",
  "bot",
  "brain",
  "flame",
  "leaf",
  "music",
] as const

export type TAvatarPreset = (typeof AVATAR_PRESETS)[number]

/** Used when a student has not picked one yet. */
export const DEFAULT_AVATAR: TAvatarPreset = "rocket"

/**
 * Icon and gradient per preset. Violet is deliberately absent — `globals.css`
 * overrides that palette to neutral grey.
 */
export const AVATAR_STYLE: Record<
  TAvatarPreset,
  { icon: React.ElementType; gradient: string }
> = {
  rocket: { icon: Rocket,  gradient: "from-blue-500 to-cyan-400"     },
  star:   { icon: Star,    gradient: "from-amber-400 to-orange-500"  },
  flower: { icon: Flower2, gradient: "from-pink-500 to-rose-400"     },
  cat:    { icon: Cat,     gradient: "from-orange-400 to-red-400"    },
  bird:   { icon: Bird,    gradient: "from-sky-400 to-blue-500"      },
  fish:   { icon: Fish,    gradient: "from-teal-400 to-cyan-500"     },
  ghost:  { icon: Ghost,   gradient: "from-indigo-400 to-blue-600"   },
  bot:    { icon: Bot,     gradient: "from-slate-400 to-slate-600"   },
  brain:  { icon: Brain,   gradient: "from-fuchsia-500 to-pink-500"  },
  flame:  { icon: Flame,   gradient: "from-red-500 to-orange-400"    },
  leaf:   { icon: Leaf,    gradient: "from-emerald-400 to-green-500" },
  music:  { icon: Music,   gradient: "from-rose-500 to-pink-600"     },
}

/**
 * Resolves any stored value to a known preset. Accounts for accounts created
 * before presets existed, whose `avatar` may hold a URL, initials, or null.
 */
export function toAvatarPreset(value: string | null | undefined): TAvatarPreset {
  return AVATAR_PRESETS.includes(value as TAvatarPreset)
    ? (value as TAvatarPreset)
    : DEFAULT_AVATAR
}
