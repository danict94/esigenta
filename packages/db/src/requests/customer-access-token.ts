import type {
  Prisma,
} from "@prisma/client"

import {
  randomBytes,
} from "node:crypto"

import {
  prisma,
} from "../prisma/client"

import {
  hashVerificationToken,
} from "./verification-token"

export type RequestVerificationAccessToken = {
  id: string
  email: string
  requestId: string | null
}

export type RequestStatusAccessToken = {
  id: string
  email: string
  requestId: string | null
  expiresAt: Date
}

type CustomerAccessTokenClient = Pick<
  Prisma.TransactionClient,
  "customerAccessToken"
>

function createRawCustomerToken(): string {
  return randomBytes(32).toString("hex")
}

export async function createRequestVerificationAccessToken({
  tx,
  email,
  requestId,
  tokenHash,
  expiresAt,
}: {
  tx: Prisma.TransactionClient
  email: string
  requestId: string
  tokenHash: string
  expiresAt: Date
}) {
  return tx.customerAccessToken.create({
    data: {
      tokenHash,
      purpose: "REQUEST_VERIFICATION",
      email,
      requestId,
      expiresAt,
    },
  })
}

export async function createRequestStatusAccessToken({
  client = prisma,
  email,
  requestId,
  expiresAt,
}: {
  client?: CustomerAccessTokenClient
  email: string
  requestId: string | null
  expiresAt: Date
}): Promise<{
  token: string
  tokenHash: string
  expiresAt: Date
}> {
  const token =
    createRawCustomerToken()

  const tokenHash =
    hashVerificationToken(token)

  await client.customerAccessToken.create({
    data: {
      tokenHash,
      purpose: "REQUEST_STATUS",
      email,
      requestId,
      expiresAt,
    },
  })

  return {
    token,
    tokenHash,
    expiresAt,
  }
}

export async function findValidRequestVerificationAccessToken({
  tokenHash,
  now,
}: {
  tokenHash: string
  now: Date
}): Promise<RequestVerificationAccessToken | null> {
  return prisma.customerAccessToken.findFirst({
    where: {
      tokenHash,
      purpose: "REQUEST_VERIFICATION",
      usedAt: null,
      expiresAt: {
        gt: now,
      },
    },
    select: {
      id: true,
      email: true,
      requestId: true,
    },
  })
}

export async function findValidRequestStatusAccessToken({
  tokenHash,
  now,
}: {
  tokenHash: string
  now: Date
}): Promise<RequestStatusAccessToken | null> {
  return prisma.customerAccessToken.findFirst({
    where: {
      tokenHash,
      purpose: "REQUEST_STATUS",
      usedAt: null,
      expiresAt: {
        gt: now,
      },
    },
    select: {
      id: true,
      email: true,
      requestId: true,
      expiresAt: true,
    },
  })
}

export async function consumeRequestVerificationAccessToken({
  tx,
  tokenId,
  usedAt,
}: {
  tx: Prisma.TransactionClient
  tokenId: string
  usedAt: Date
}) {
  return tx.customerAccessToken.updateMany({
    where: {
      id: tokenId,
      usedAt: null,
    },
    data: {
      usedAt,
    },
  })
}
