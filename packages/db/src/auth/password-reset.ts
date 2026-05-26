import {
  createHash,
  randomBytes,
} from "node:crypto"

import {
  hashPassword,
} from "better-auth/crypto"

import {
  getResendClient,
  getResendFromEmail,
} from "../email/resend-client"
import {
  prisma,
} from "../prisma/client"

export type PasswordResetAudience =
  | "company"
  | "admin"

export type RequestPasswordResetResult =
  | {
      ok: true
    }
  | {
      ok: false
      code:
        | "invalid_email"
        | "email_failed"
        | "missing_base_url"
      message: string
    }

export type PasswordResetTokenStateResult =
  | {
      ok: true
      userId: string
      expiresAt: Date
    }
  | {
      ok: false
      code:
        | "missing_token"
        | "invalid_token"
        | "token_expired"
      message: string
    }

export type ResetPasswordResult =
  | {
      ok: true
    }
  | {
      ok: false
      code:
        | "missing_token"
        | "invalid_token"
        | "token_expired"
        | "password_too_short"
        | "password_too_long"
      message: string
    }

const PASSWORD_RESET_TOKEN_BYTES =
  32
const PASSWORD_RESET_EXPIRES_IN_MS =
  1000 * 60 * 60
const MIN_PASSWORD_LENGTH =
  8
const MAX_PASSWORD_LENGTH =
  128

function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function createPasswordResetToken() {
  return randomBytes(
    PASSWORD_RESET_TOKEN_BYTES,
  ).toString("hex")
}

function hashResetToken(token: string) {
  return createHash("sha256")
    .update(token)
    .digest("hex")
}

function getResetIdentifier({
  audience,
  token,
}: {
  audience: PasswordResetAudience
  token: string
}) {
  return `password-reset:${audience}:${hashResetToken(token)}`
}

function getResetIdentifierPrefix(
  audience: PasswordResetAudience,
) {
  return `password-reset:${audience}:`
}

function getBaseUrl(
  audience: PasswordResetAudience,
) {
  const baseUrl =
    audience === "admin"
      ? process.env.FIXPRO_ADMIN_URL
      : process.env.FIXPRO_WEB_URL ??
        process.env.FIXPRO_APP_URL ??
        process.env.NEXT_PUBLIC_APP_URL

  if (baseUrl) {
    return baseUrl
  }

  if (process.env.NODE_ENV !== "production") {
    return audience === "admin"
      ? "http://localhost:3001"
      : "http://localhost:3000"
  }

  return null
}

function buildPasswordResetUrl({
  audience,
  token,
}: {
  audience: PasswordResetAudience
  token: string
}) {
  const baseUrl =
    getBaseUrl(audience)

  if (!baseUrl) {
    return null
  }

  const url =
    new URL(
      audience === "admin"
        ? "/admin/reimposta-password"
        : "/area-impresa/reimposta-password",
      baseUrl,
    )

  url.searchParams.set(
    "token",
    token,
  )

  return url.toString()
}

async function findAudienceUser({
  audience,
  email,
}: {
  audience: PasswordResetAudience
  email: string
}) {
  return prisma.user.findFirst({
    where: {
      email,
      isActive: true,
      deletedAt: null,
      ...(audience === "admin"
        ? {
            adminProfile: {
              isNot: null,
            },
          }
        : {
            companyMemberships: {
              some: {},
            },
          }),
    },
    select: {
      id: true,
      email: true,
      name: true,
    },
  })
}

async function sendPasswordResetEmail({
  audience,
  email,
  name,
  resetUrl,
}: {
  audience: PasswordResetAudience
  email: string
  name: string | null
  resetUrl: string
}) {
  const label =
    audience === "admin"
      ? "admin FixPro"
      : "area impresa FixPro"
  const subject =
    "Reimposta la password FixPro"
  const greeting =
    name?.trim() || "ciao"
  const text =
    `Ciao ${greeting},\n\n` +
    `abbiamo ricevuto una richiesta per reimpostare la password del tuo accesso ${label}.\n\n` +
    `Apri questo link per scegliere una nuova password:\n${resetUrl}\n\n` +
    "Il link scade tra 60 minuti. Se non hai richiesto tu il reset, puoi ignorare questa email."
  const html =
    `<p>Ciao ${greeting},</p>` +
    `<p>Abbiamo ricevuto una richiesta per reimpostare la password del tuo accesso ${label}.</p>` +
    `<p><a href="${resetUrl}">Reimposta la password</a></p>` +
    "<p>Il link scade tra 60 minuti. Se non hai richiesto tu il reset, puoi ignorare questa email.</p>"

  await getResendClient().emails.send({
    from:
      getResendFromEmail(),
    to:
      email,
    subject,
    text,
    html,
  })
}

export async function requestPasswordReset({
  audience,
  email,
}: {
  audience: PasswordResetAudience
  email: string
}): Promise<RequestPasswordResetResult> {
  const normalizedEmail =
    normalizeEmail(email)

  if (!isValidEmail(normalizedEmail)) {
    return {
      ok: false,
      code: "invalid_email",
      message: "Inserisci un indirizzo email valido.",
    }
  }

  const user =
    await findAudienceUser({
      audience,
      email:
        normalizedEmail,
    })

  if (!user) {
    return {
      ok: true,
    }
  }

  const token =
    createPasswordResetToken()
  const resetUrl =
    buildPasswordResetUrl({
      audience,
      token,
    })

  if (!resetUrl) {
    return {
      ok: false,
      code: "missing_base_url",
      message: "URL applicazione non configurato.",
    }
  }

  const now =
    new Date()
  const expiresAt =
    new Date(
      now.getTime() +
        PASSWORD_RESET_EXPIRES_IN_MS,
    )
  const identifier =
    getResetIdentifier({
      audience,
      token,
    })

  await prisma.$transaction(
    async (tx) => {
      await tx.verification.deleteMany({
        where: {
          value:
            user.id,
          identifier: {
            startsWith:
              getResetIdentifierPrefix(audience),
          },
        },
      })

      await tx.verification.create({
        data: {
          identifier,
          value:
            user.id,
          expiresAt,
        },
      })
    },
  )

  try {
    await sendPasswordResetEmail({
      audience,
      email:
        user.email,
      name:
        user.name,
      resetUrl,
    })
  } catch {
    await prisma.verification.deleteMany({
      where: {
        identifier,
      },
    })

    return {
      ok: false,
      code: "email_failed",
      message: "Non siamo riusciti a inviare l'email di reset.",
    }
  }

  return {
    ok: true,
  }
}

export async function getPasswordResetTokenState({
  audience,
  token,
}: {
  audience: PasswordResetAudience
  token: string
}): Promise<PasswordResetTokenStateResult> {
  const trimmedToken =
    token.trim()

  if (!trimmedToken) {
    return {
      ok: false,
      code: "missing_token",
      message: "Link di reset mancante.",
    }
  }

  const verification =
    await prisma.verification.findFirst({
      where: {
        identifier:
          getResetIdentifier({
            audience,
            token:
              trimmedToken,
          }),
      },
      select: {
        value: true,
        expiresAt: true,
      },
    })

  if (!verification) {
    return {
      ok: false,
      code: "invalid_token",
      message: "Link di reset non valido.",
    }
  }

  if (verification.expiresAt <= new Date()) {
    return {
      ok: false,
      code: "token_expired",
      message: "Il link di reset è scaduto.",
    }
  }

  return {
    ok: true,
    userId:
      verification.value,
    expiresAt:
      verification.expiresAt,
  }
}

export async function resetPasswordWithToken({
  audience,
  token,
  password,
}: {
  audience: PasswordResetAudience
  token: string
  password: string
}): Promise<ResetPasswordResult> {
  const trimmedToken =
    token.trim()

  if (!trimmedToken) {
    return {
      ok: false,
      code: "missing_token",
      message: "Link di reset mancante.",
    }
  }

  if (password.length < MIN_PASSWORD_LENGTH) {
    return {
      ok: false,
      code: "password_too_short",
      message: "La password deve contenere almeno 8 caratteri.",
    }
  }

  if (password.length > MAX_PASSWORD_LENGTH) {
    return {
      ok: false,
      code: "password_too_long",
      message: "La password è troppo lunga.",
    }
  }

  const identifier =
    getResetIdentifier({
      audience,
      token:
        trimmedToken,
    })
  const hashedPassword =
    await hashPassword(password)
  const now =
    new Date()

  return prisma.$transaction(
    async (tx) => {
      const verification =
        await tx.verification.findFirst({
          where: {
            identifier,
          },
          select: {
            value: true,
            expiresAt: true,
          },
        })

      if (!verification) {
        return {
          ok: false,
          code: "invalid_token",
          message: "Link di reset non valido.",
        }
      }

      if (verification.expiresAt <= now) {
        return {
          ok: false,
          code: "token_expired",
          message: "Il link di reset è scaduto.",
        }
      }

      const user =
        await tx.user.findFirst({
          where: {
            id:
              verification.value,
            isActive: true,
            deletedAt: null,
            ...(audience === "admin"
              ? {
                  adminProfile: {
                    isNot: null,
                  },
                }
              : {
                  companyMemberships: {
                    some: {},
                  },
                }),
          },
          select: {
            id: true,
          },
        })

      if (!user) {
        await tx.verification.deleteMany({
          where: {
            identifier,
          },
        })

        return {
          ok: false,
          code: "invalid_token",
          message: "Link di reset non valido.",
        }
      }

      const consumeResult =
        await tx.verification.deleteMany({
          where: {
            identifier,
            expiresAt: {
              gt: now,
            },
          },
        })

      if (consumeResult.count !== 1) {
        return {
          ok: false,
          code: "invalid_token",
          message: "Link di reset non valido.",
        }
      }

      const credentialAccount =
        await tx.account.findFirst({
          where: {
            userId:
              user.id,
            providerId:
              "credential",
          },
          select: {
            id: true,
          },
        })

      if (credentialAccount) {
        await tx.account.update({
          where: {
            id:
              credentialAccount.id,
          },
          data: {
            password:
              hashedPassword,
          },
        })
      } else {
        await tx.account.create({
          data: {
            userId:
              user.id,
            providerId:
              "credential",
            accountId:
              user.id,
            password:
              hashedPassword,
          },
        })
      }

      await tx.session.deleteMany({
        where: {
          userId:
            user.id,
        },
      })

      return {
        ok: true,
      }
    },
  )
}
