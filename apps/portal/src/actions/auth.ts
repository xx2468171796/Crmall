"use server"

import { signIn } from "@nexus/auth"
import { prisma } from "@nexus/db"
import { hash } from "bcryptjs"

interface LoginInput {
  email: string
  password: string
}

interface RegisterInput {
  name: string
  email: string
  password: string
}

export async function login(input: LoginInput) {
  try {
    await signIn("credentials", {
      email: input.email,
      password: input.password,
      redirect: false,
    })
    return { success: true }
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("CredentialsSignin")) {
        return { error: "邮箱或密码错误" }
      }
    }
    return { error: "登录失败，请稍后重试" }
  }
}

export async function register(input: RegisterInput) {
  try {
    const existingUser = await prisma.user.findUnique({
      where: { email: input.email },
    })

    if (existingUser) {
      return { error: "该邮箱已被注册" }
    }

    const passwordHash = await hash(input.password, 12)

    await prisma.user.create({
      data: {
        name: input.name,
        email: input.email,
        passwordHash,
      },
    })

    return { success: true }
  } catch {
    return { error: "注册失败，请稍后重试" }
  }
}
