import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import axios from "axios"
import { LoginRequest, LoginResponse } from "@/app/types/api-types"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "Credenciales",
      credentials: {
        employeeCode: { label: "Código de Empleado", type: "number" },
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
          if (!apiHost) {
            console.error("La variable de entorno NEXT_PUBLIC_API_HOST no está definida.")
            return null
          }

          const response = await axios.post<LoginResponse>(
            `${apiHost}/auth/employee`,
            payload,
          )

          // Asumimos que si la respuesta tiene datos, es un login exitoso.
          // ADVERTENCIA: Ajusta 'response.data' según la estructura real que devuelve tu API.
          // NextAuth espera que retornes un objeto 'User'.
          if (response.status === 200 || response.status === 201) {
            const apiData = response.data;
            
            return {
              id: String(apiData.salesPersonCode),
              name: apiData.fullName,
              salesPersonCode: apiData.salesPersonCode,
              token: apiData.token,
              fullName: apiData.fullName,
              email: `${apiData.salesPersonCode}@sistema.local` // Email dummy opcional
            }
          }
        } catch (error) {
          if (axios.isAxiosError(error)) {
            console.error("Error API Login:", error.response?.data || error.message)
          } else {
            console.error("Error desconocido en login:", error)
          }
        }

        return null
      },
    }),
  ],
  pages: {
    signIn: "/", // Ruta de login ahora es la raíz
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.salesPersonCode = user.salesPersonCode
        token.token = user.token
        token.fullName = user.fullName
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.salesPersonCode = token.salesPersonCode
        session.user.token = token.token
        session.user.fullName = token.fullName
        session.user.name = token.fullName
      }
      return session
    },
  },
})
