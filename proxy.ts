
import { NextRequest, NextResponse } from "next/server"
import { importSPKI, jwtVerify } from "jose"

type UserRole = "ADMIN" | "USER"

// Mengambil dan mempersiapkan public key dari environment
async function getPublicKey() {
  const encodedKey = process.env.JWT_PUBLIC_KEY

  if (!encodedKey) {
    throw new Error("JWT_PUBLIC_KEY belum dikonfigurasi")
  }

  // Mendukung public key PEM biasa maupun Base64
  const publicKey = encodedKey.includes("-----BEGIN PUBLIC KEY-----")
    ? encodedKey.replace(/\\n/g, "\n").trim()
    : Buffer.from(encodedKey.trim(), "base64").toString("utf8").trim()

  return importSPKI(publicKey, "RS256")
}

// Memverifikasi access token dan mengambil role
async function getUserRole(token: string): Promise<UserRole | null> {
  try {
    const publicKey = await getPublicKey()

    const { payload } = await jwtVerify(token, publicKey, {
      algorithms: ["RS256"],
    })

    const role = payload.role

    if (role === "ADMIN" || role === "USER") {
      return role
    }

    return null
  } catch (error) {
    console.error("Access token tidak valid:", error)
    return null
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  const accessToken = request.cookies.get("access_token")?.value

  // Halaman login
  const isPublicPath = pathname === "/"

  // Halaman admin
  const isAdminPath =
    pathname === "/admin" || pathname.startsWith("/admin/")

  // Halaman user
  const isUserPath =
    pathname === "/user" || pathname.startsWith("/user/")

  // Halaman yang membutuhkan autentikasi
  const isProtectedPath = isAdminPath || isUserPath

  // Jika tidak ada access token
  if (!accessToken) {
    if (isProtectedPath) {
      return NextResponse.redirect(new URL("/", request.url))
    }

    return NextResponse.next()
  }

  // Verifikasi token dan ambil role
  const role = await getUserRole(accessToken)

  // Token tidak valid atau sudah expired
  if (!role) {
    const response = isProtectedPath
      ? NextResponse.redirect(new URL("/", request.url))
      : NextResponse.next()

    response.cookies.delete("access_token")
    response.cookies.delete("refresh_token")

    return response
  }

  // Jika sudah login dan membuka halaman login
  if (isPublicPath) {
    const destination =
      role === "ADMIN" ? "/admin/dashboard" : "/user/dashboard"

    return NextResponse.redirect(new URL(destination, request.url))
  }

  // Admin tidak boleh membuka halaman user
  if (role === "ADMIN" && isUserPath) {
    return NextResponse.redirect(
      new URL("/admin/dashboard", request.url)
    )
  }

  // User tidak boleh membuka halaman admin
  if (role === "USER" && isAdminPath) {
    return NextResponse.redirect(
      new URL("/user/dashboard", request.url)
    )
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/",
    "/admin/:path*",
    "/user/:path*",
  ],
}
