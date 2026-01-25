import { createDirectus, rest, authentication, readItems, readMe } from "@directus/sdk"

export interface DirectusConfig {
  url: string
  token?: string
}

const directusUrl = process.env.DIRECTUS_URL || "http://localhost:8055"

export const directus = createDirectus(directusUrl)
  .with(rest())
  .with(authentication())

export async function getDirectusClient(token?: string) {
  if (token) {
    return createDirectus(directusUrl)
      .with(rest())
      .with(authentication())
  }
  return directus
}

export { readItems, readMe }
