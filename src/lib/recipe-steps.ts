export const STEPS = [
  { id: 1, label: "Kuwento", tagalog: "Ang Kuwento" },
  { id: 2, label: "Detalye", tagalog: "Detalye" },
  { id: 3, label: "Sangkap", tagalog: "Mga Sangkap" },
  { id: 4, label: "Hakbang", tagalog: "Hakbang" },
  { id: 5, label: "Luto Na!", tagalog: "Luto Na!" },
] as const

export type StepID = (typeof STEPS)[number]["id"]
