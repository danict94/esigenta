"use server"

import {
  redirect,
} from "next/navigation"

import {
  createPendingCreditOrder,
  markCreditOrderCheckoutCreated,
} from "@esigenta/db"

import {
  requireCompanyActor,
} from "../../../../auth/server"

import {
  createStripeCreditPackageCheckoutSession,
  getAppUrl,
} from "../../../../lib/stripe/credit-checkout"

import {
  getStripeServerClient,
} from "../../../../lib/stripe/server"

import {
  getStripeRuntimeDebugConfig,
  getUrlHost,
  logStripeDebug,
} from "../../../../lib/stripe/debug"

export async function createCreditPackageCheckoutAction(
  formData: FormData,
) {
  const actor =
    await requireCompanyActor()

  const packageId =
    String(
      formData.get("packageId") ?? "",
    ).trim()

  const appUrl =
    getAppUrl()

  if (!appUrl) {
    logStripeDebug(
      "checkout.base_url_missing",
      {
        companyId:
          actor.companyId,
        ...getStripeRuntimeDebugConfig(),
      },
    )

    redirect(
      "/area-impresa/crediti?checkout=config",
    )
  }

  let stripe: ReturnType<
    typeof getStripeServerClient
  >

  try {
    stripe =
      getStripeServerClient()
  } catch (error) {
    logStripeDebug(
      "checkout.stripe_client_unavailable",
      {
        companyId:
          actor.companyId,
        error:
          error instanceof Error
            ? error.message
            : "unknown_error",
      },
    )

    redirect(
      "/area-impresa/crediti?checkout=config",
    )
  }

  const orderResult =
    await createPendingCreditOrder({
      companyId:
        actor.companyId,
      packageId,
    })

  if (!orderResult.ok) {
    logStripeDebug(
      "checkout.order_creation_failed",
      {
        companyId:
          actor.companyId,
        packageId,
        code: orderResult.code,
      },
    )

    redirect(
      "/area-impresa/crediti?checkout=unavailable",
    )
  }

  const order =
    orderResult.data

  let checkoutResult: Awaited<
    ReturnType<
      typeof createStripeCreditPackageCheckoutSession
    >
  >

  try {
    checkoutResult =
      await createStripeCreditPackageCheckoutSession({
        stripe,
        appUrl,
        companyId:
          actor.companyId,
        order,
      })
  } catch (error) {
    logStripeDebug(
      "checkout.session_creation_failed",
      {
        companyId:
          actor.companyId,
        creditOrderId:
          order.orderId,
        error:
          error instanceof Error
            ? error.message
            : "unknown_error",
      },
    )

    redirect(
      "/area-impresa/crediti?checkout=error",
    )
  }

  const {
    session,
    providerPaymentIntentId,
    successUrl,
    cancelUrl,
  } = checkoutResult

  logStripeDebug(
    "checkout.session_created",
    {
      companyId:
        actor.companyId,
      creditOrderId:
        order.orderId,
      packageId:
        order.packageId,
      checkoutSessionId:
        session.id,
      providerPaymentIntentId,
      baseUrl:
        appUrl,
      successUrlHost:
        getUrlHost(successUrl),
      cancelUrlHost:
        getUrlHost(cancelUrl),
      ...getStripeRuntimeDebugConfig(),
    },
  )

  const markResult =
    await markCreditOrderCheckoutCreated({
      creditOrderId:
        order.orderId,
      providerCheckoutId:
        session.id,
      providerPaymentIntentId,
    })

  if (!markResult.ok) {
    logStripeDebug(
      "checkout.order_attach_failed",
      {
        companyId:
          actor.companyId,
        creditOrderId:
          order.orderId,
        checkoutSessionId:
          session.id,
        code: markResult.code,
      },
    )

    redirect(
      "/area-impresa/crediti?checkout=error",
    )
  }

  if (!session.url) {
    logStripeDebug(
      "checkout.session_url_missing",
      {
        companyId:
          actor.companyId,
        creditOrderId:
          order.orderId,
        checkoutSessionId:
          session.id,
      },
    )

    redirect(
      "/area-impresa/crediti?checkout=error",
    )
  }

  redirect(session.url)
}