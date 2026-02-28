import 'dotenv/config'
import path from 'node:path'
import { defineConfig } from 'prisma/config'

export default defineConfig({
  earlyAccess: true,
  schema: path.join(__dirname, 'prisma', 'schema.prisma'),

  datasource: {
    url: process.env.DATABASE_URL ?? 'postgresql://crmall0125:xx123654@192.168.110.246:5433/crmall0125?schema=public',
  },
})
