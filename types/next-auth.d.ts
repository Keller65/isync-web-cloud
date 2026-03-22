import NextAuth, { DefaultSession } from "next-auth"
import { JWT } from "next-auth/jwt"

declare module "next-auth" {
  interface Session {
    user: {
      salesPersonCode: number
      token: string
      fullName: string
      u_WhsCode: string,
      u_SerieCot: string
    } & DefaultSession["user"]
  }

  interface User {
    salesPersonCode: number
    token: string
    fullName: string,
    u_WhsCode: string,
    u_SerieCot: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    salesPersonCode: number
    token: string
    fullName: string,
    u_WhsCode: string,
    u_SerieCot: string
  }
}
