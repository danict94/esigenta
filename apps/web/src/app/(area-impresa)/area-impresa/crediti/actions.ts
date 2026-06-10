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
  areaLog,
  isAreaMonitoringEnabled,
} from "../../../../lib/area-monitoring"

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
  const monitored = isAreaMonitoringEnabled()
  const actionStart = performance.now()

  if (monitored) {
    areaLog("area.credits.checkout.start", {})
  }

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
          actor.company.id,
        ...getStripeRuntimeDebugConfig(),
      },
    )

    if (monitored) {
      areaLog("area.credits.checkout.end", {
        result: "config-error",
        errorStep: "base_url_missing",
        durationMs: Math.round(performance.now() - actionStart),
      })
    }

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
          actor.company.id,
        error:
          error instanceof Error
            ? error.message
            : "unknown_error",
      },
    )

    if (monitored) {
      areaLog("area.credits.checkout.end", {
        result: "config-error",
        errorStep: "stripe_client_unavailable",
        durationMs: Math.round(performance.now() - actionStart),
      })
    }

    redirect(
      "/area-impresa/crediti?checkout=config",
    )
  }

  const orderResult =
    await createPendingCreditOrder({
      companyId:
        actor.company.id,
      packageId,
    })

  if (!orderResult.ok) {
    logStripeDebug(
      "checkout.order_creation_failed",
      {
        companyId:
          actor.company.id,
        packageId,
        code: orderResult.code,
      },
    )

    if (monitored) {
      areaLog("area.credits.checkout.end", {
        result: orderResult.code,
        errorStep: "order_creation_failed",
        durationMs: Math.round(performance.now() - actionStart),
      })
    }

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
          actor.company.id,
        order,
      })
  } catch (error) {
    logStripeDebug(
      "checkout.session_creation_failed",
      {
        companyId:
          actor.company.id,
        creditOrderId:
          order.orderId,
        error:
          error instanceof Error
            ? error.message
            : "unknown_error",
      },
    )

    if (monitored) {
      areaLog("area.credits.checkout.end", {
        result: "stripe-error",
        errorStep: "session_creation_failed",
        durationMs: Math.round(performance.now() - actionStart),
      })
    }

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
        actor.company.id,
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
          actor.company.id,
        creditOrderId:
          order.orderId,
        checkoutSessionId:
          session.id,
        code: markResult.code,
      },
    )

    if (monitored) {
      areaLog("area.credits.checkout.end", {
        result: markResult.code,
        errorStep: "order_attach_failed",
        durationMs: Math.round(performance.now() - actionStart),
      })
    }

    redirect(
      "/area-impresa/crediti?checkout=error",
    )
  }

  if (!session.url) {
    logStripeDebug(
      "checkout.session_url_missing",
      {
        companyId:
          actor.company.id,
        creditOrderId:
          order.orderId,
        checkoutSessionId:
          session.id,
      },
    )

    if (monitored) {
      areaLog("area.credits.checkout.end", {
        result: "stripe-error",
        errorStep: "session_url_missing",
        durationMs: Math.round(performance.now() - actionStart),
      })
    }

    redirect(
      "/area-impresa/crediti?checkout=error",
    )
  }

  if (monitored) {
    areaLog("area.credits.checkout.end", {
      result: "ok",
      durationMs: Math.round(performance.now() - actionStart),
      // session.url intentionally not logged
    })
  }

  redirect(session.url)
}