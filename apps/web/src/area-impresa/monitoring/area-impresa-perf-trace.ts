const PERF_PREFIX =
  "[esigenta-perf]"

type PerfMeasurement = {
  operation: string
  durationMs: number
}

function formatDuration(
  durationMs: number,
) {
  return `${durationMs.toFixed(1)}ms`
}

function formatPercent(
  durationMs: number,
  totalMs: number,
) {
  if (totalMs <= 0) {
    return "0.0%"
  }

  return `${((durationMs / totalMs) * 100).toFixed(1)}%`
}

function formatMeta(
  meta?: Record<string, string | number | boolean | null | undefined>,
) {
  if (!meta) {
    return ""
  }

  const entries =
    Object.entries(meta)
      .filter(
        ([, value]) =>
          value !== null &&
          value !== undefined &&
          value !== "",
      )
      .map(
        ([key, value]) =>
          `${key}=${String(value)}`,
      )

  return entries.length > 0
    ? ` ${entries.join(" ")}`
    : ""
}

export function createPerfTrace({
  scope,
  meta,
}: {
  scope: string
  meta?: Record<string, string | number | boolean | null | undefined>
}) {
  const startedAt =
    performance.now()
  const measurements: PerfMeasurement[] = []

  console.info(
    `${PERF_PREFIX} [${scope}] START${formatMeta(meta)}`,
  )

  function add(
    operation: string,
    durationMs: number,
  ) {
    measurements.push({
      operation,
      durationMs,
    })
  }

  async function measure<T>(
    operation: string,
    task: () => Promise<T>,
  ): Promise<T> {
    const start =
      performance.now()

    try {
      return await task()
    } finally {
      add(
        operation,
        performance.now() - start,
      )
    }
  }

  function measureSync<T>(
    operation: string,
    task: () => T,
  ): T {
    const start =
      performance.now()

    try {
      return task()
    } finally {
      add(
        operation,
        performance.now() - start,
      )
    }
  }

  function finish(
    finishMeta?: Record<string, string | number | boolean | null | undefined>,
  ) {
    const totalMs =
      performance.now() - startedAt
    const ranked =
      [...measurements].sort(
        (left, right) =>
          right.durationMs - left.durationMs,
      )

    for (const measurement of measurements) {
      console.info(
        `${PERF_PREFIX} [${scope}] ${measurement.operation}: ${formatDuration(
          measurement.durationMs,
        )} (${formatPercent(measurement.durationMs, totalMs)})`,
      )
    }

    console.info(
      `${PERF_PREFIX} [${scope}] total: ${formatDuration(totalMs)} (100.0%)`,
    )

    console.info(
      `${PERF_PREFIX} [${scope}] bottlenecks: ${
        ranked.length > 0
          ? ranked
              .slice(0, 5)
              .map(
                (measurement) =>
                  `${measurement.operation} ${formatDuration(
                    measurement.durationMs,
                  )} (${formatPercent(measurement.durationMs, totalMs)})`,
              )
              .join(" > ")
          : "none"
      }`,
    )

    console.info(
      `${PERF_PREFIX} [${scope}] END${formatMeta({
        ...meta,
        ...finishMeta,
      })}`,
    )
  }

  return {
    add,
    finish,
    measure,
    measureSync,
  }
}
