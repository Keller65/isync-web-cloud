import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import axios from "axios"
import { LoginRequest, LoginResponse } from "@/types/api-types"

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  secret: process.env.AUTH_SECRET,

  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60, // 8 horas
  },

  providers: [
    Credentials({
      name: "Credenciales",
      credentials: {
        employeeCode: { label: "Código de Vendedor", type: "number" },
        password: { label: "Contraseña", type: "password" },
      },

      authorize: async (credentials) => {
        if (!credentials?.employeeCode || !credentials?.password) {
          return null
        }

        try {
          const payload: LoginRequest = {
            employeeCode: Number(credentials.employeeCode),
            password: credentials.password as string,
          }

          const apiHost = process.env.NEXT_PUBLIC_API_HOST
          if (!apiHost) return null

          const response = await axios.post<LoginResponse>(
            `${apiHost}/auth/employee`,
            payload
          )

          if (response.status === 200 || response.status === 201) {
            const apiData = response.data

            return {
              id: String(apiData.salesPersonCode),
              salesPersonCode: apiData.salesPersonCode,
              token: apiData.token,
              fullName: apiData.fullName,
              u_WhsCode: apiData.u_WhsCode,
              u_SerieCot: apiData.u_SerieCot,
              email: `${apiData.salesPersonCode}@isync.local`,
            }
          }
        } catch (error) {
          return null
        }

        return null
      },
    }),
  ],

  pages: {
    signIn: "/",
  },

  callbacks: {
    async jwt({ token, user }) {
      // Solo en login
      if (user) {
        token.salesPersonCode = user.salesPersonCode
        token.token = user.token
        token.fullName = user.fullName
        token.u_WhsCode = user.u_WhsCode
        token.u_SerieCot = user.u_SerieCot
      }

      return token
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.salesPersonCode = token.salesPersonCode
        session.user.token = token.token
        session.user.fullName = token.fullName
        session.user.name = token.fullName
        session.user.u_WhsCode = token.u_WhsCode
        session.user.u_SerieCot = token.u_SerieCot
      }

      return session
    },
  },
})