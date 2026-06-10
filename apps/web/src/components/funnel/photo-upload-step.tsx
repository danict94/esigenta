"use client";

import Image from "next/image";
import Link from "next/link";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Badge,
  Button,
  Card,
  cn,
  tokens,
} from "@esigenta/ui";

import {
  REQUEST_PHOTO_ACCEPT,
  REQUEST_PHOTO_MAX_FILES,
  REQUEST_PHOTO_MAX_SIZE_LABEL,
  readRequestPhotoMetadata,
  validateRequestPhotoAnswer,
  validateRequestPhotoFile,
} from "@esigenta/uploads";

import type {
  RequestPhotoFileValidationError,
  RequestPhotoMetadata,
} from "@esigenta/uploads";

import {
  useUploadThing,
} from "../../lib/uploadthing";

type PhotoUploadStatus =
  | "idle"
  | "uploading"
  | "uploaded"
  | "error";

type PhotoUploadItem = {
  id: string;
  fileName: string;
  previewUrl?: string;
  status: PhotoUploadStatus;
  metadata?: RequestPhotoMetadata;
};

type PhotoUploadStepProps = {
  value: unknown;
  onChange: (value: RequestPhotoMetadata[]) => void;
  onUploadingChange: (isUploading: boolean) => void;
};

function getFileErrorMessage(
  error: RequestPhotoFileValidationError,
) {
  switch (error) {
    case "too_large":
      return `Ogni foto deve pesare al massimo ${REQUEST_PHOTO_MAX_SIZE_LABEL}.`;

    case "unsupported_type":
      return "Carica solo immagini JPEG, PNG o WebP.";

    case "empty_file":
      return "Una delle immagini selezionate e vuota.";

    case "invalid_file_name":
      return "Una delle immagini ha un nome file non valido.";
  }
}

function getInitialItems(
  value: unknown,
): PhotoUploadItem[] {
  const validation =
    validateRequestPhotoAnswer(value);

  if (!validation.ok) {
    return [];
  }

  return validation.photos.map(
    (photo) => ({
      id: photo.uploadId,
      fileName: photo.fileName,
      metadata: photo,
      status: "uploaded",
    }),
  );
}

function getUploadedPhotos(
  items: PhotoUploadItem[],
): RequestPhotoMetadata[] {
  return items.flatMap((item) =>
    item.metadata ? [item.metadata] : [],
  );
}

function getStatusLabel(
  status: PhotoUploadStatus,
) {
  switch (status) {
    case "idle":
      return "In attesa";

    case "uploading":
      return "Caricamento";

    case "uploaded":
      return "Caricata";

    case "error":
      return "Errore";
  }
}

function getStatusVariant(
  status: PhotoUploadStatus,
): "neutral" | "success" | "danger" {
  switch (status) {
    case "uploaded":
      return "success";

    case "error":
      return "danger";

    default:
      return "neutral";
  }
}

export function PhotoUploadStep({
  value,
  onChange,
  onUploadingChange,
}: PhotoUploadStepProps) {
  const [items, setItems] =
    useState<PhotoUploadItem[]>(() =>
      getInitialItems(value),
    );

  const [error, setError] =
    useState<string | null>(null);

  const [isUploading, setIsUploading] =
    useState(false);

  const previewUrls =
    useRef(new Set<string>());

  const lastUploadError =
    useRef<string | null>(null);

  const {
    startUpload,
  } = useUploadThing(
    "requestPhotoUploader",
    {
      onUploadError: (uploadError) => {
        lastUploadError.current =
          uploadError.message;
      },
    },
  );

  useEffect(() => {
    onUploadingChange(isUploading);

    return () => {
      onUploadingChange(false);
    };
  }, [isUploading, onUploadingChange]);

  useEffect(() => {
    const urls =
      previewUrls.current;

    return () => {
      for (const url of urls) {
        URL.revokeObjectURL(url);
      }
    };
  }, []);

  function revokePreview(
    item: PhotoUploadItem,
  ) {
    if (
      item.previewUrl &&
      previewUrls.current.delete(
        item.previewUrl,
      )
    ) {
      URL.revokeObjectURL(
        item.previewUrl,
      );
    }
  }

  function removeItem(
    item: PhotoUploadItem,
  ) {
    if (isUploading) {
      return;
    }

    revokePreview(item);

    const nextItems =
      items.filter(
        (candidate) =>
          candidate.id !== item.id,
      );

    setItems(nextItems);
    onChange(
      getUploadedPhotos(nextItems),
    );
    setError(null);
  }

  async function selectFiles(
    files: File[],
  ) {
    if (files.length === 0) {
      return;
    }

    if (
      items.length + files.length >
      REQUEST_PHOTO_MAX_FILES
    ) {
      setError(
        `Puoi caricare al massimo ${REQUEST_PHOTO_MAX_FILES} foto.`,
      );
      return;
    }

    for (const file of files) {
      const validationError =
        validateRequestPhotoFile({
          fileName: file.name,
          mimeType: file.type,
          sizeBytes: file.size,
        });

      if (validationError) {
        setError(
          getFileErrorMessage(
            validationError,
          ),
        );
        return;
      }
    }

    const pendingItems =
      files.map((file) => {
        const previewUrl =
          URL.createObjectURL(file);

        previewUrls.current.add(
          previewUrl,
        );

        return {
          id: crypto.randomUUID(),
          fileName: file.name,
          previewUrl,
          status: "idle" as const,
        };
      });

    const pendingIds =
      new Set(
        pendingItems.map(
          (item) => item.id,
        ),
      );

    setError(null);
    lastUploadError.current = null;
    setIsUploading(true);
    setItems((current) => [
      ...current,
      ...pendingItems,
    ]);

    await Promise.resolve();

    setItems((current) =>
      current.map((item) =>
        pendingIds.has(item.id)
          ? {
              ...item,
              status:
                "uploading",
            }
          : item,
      ),
    );

    try {
      const uploaded =
        await startUpload(files);

      if (
        !uploaded ||
        uploaded.length !==
          pendingItems.length
      ) {
        throw new Error(
          "Il caricamento delle foto non e stato completato.",
        );
      }

      const uploadedMetadata: RequestPhotoMetadata[] =
        [];

      for (
        let index = 0;
        index < uploaded.length;
        index += 1
      ) {
        const response =
          uploaded[index];

        const metadata =
          response
            ? readRequestPhotoMetadata(
                response.serverData,
              )
            : null;

        if (!metadata) {
          throw new Error(
            "La risposta del caricamento foto non e valida.",
          );
        }

        uploadedMetadata.push(
          metadata,
        );
      }

      setItems((current) =>
        current.map((item) => {
          const pendingIndex =
            pendingItems.findIndex(
              (pending) =>
                pending.id ===
                item.id,
            );

          const metadata =
            pendingIndex >= 0
              ? uploadedMetadata[
                  pendingIndex
                ]
              : undefined;

          if (!metadata) {
            return item;
          }

          return {
            ...item,
            metadata,
            fileName:
              metadata.fileName,
            status: "uploaded",
          };
        }),
      );

      onChange([
        ...getUploadedPhotos(items),
        ...uploadedMetadata,
      ]);
    } catch (uploadError) {
      setItems((current) =>
        current.map((item) =>
          pendingIds.has(item.id)
            ? {
                ...item,
                status:
                  "error",
              }
            : item,
        ),
      );

      setError(
        lastUploadError.current ??
          (uploadError instanceof Error
            ? uploadError.message
            : "Non siamo riusciti a caricare le foto."),
      );
    } finally {
      lastUploadError.current = null;
      setIsUploading(false);
    }
  }

  return (
    <div className="grid gap-4">
      <label
        className={cn(
          "flex min-h-36 cursor-pointer flex-col items-center justify-center gap-3 border border-dashed border-border-primary bg-surface-primary px-5 py-8 text-center transition-colors hover:border-border-focus hover:bg-surface-secondary",
          isUploading &&
            "pointer-events-none opacity-60",
          tokens.radius.lg,
        )}
      >
        <span className="flex size-11 items-center justify-center rounded-full bg-surface-elevated text-brand-primary">
          +
        </span>

        <span className="text-sm font-semibold text-text-primary">
          Aggiungi foto, se le hai
        </span>

        <span className="max-w-sm text-xs leading-5 text-text-muted">
          JPEG, PNG o WebP. Massimo {REQUEST_PHOTO_MAX_FILES} foto da{" "}
          {REQUEST_PHOTO_MAX_SIZE_LABEL} ciascuna.
        </span>

        <input
          type="file"
          multiple
          accept={REQUEST_PHOTO_ACCEPT}
          className="sr-only"
          disabled={
            isUploading ||
            items.length >=
              REQUEST_PHOTO_MAX_FILES
          }
          onChange={(event) => {
            const files =
              Array.from(
                event.target.files ??
                  [],
              );

            event.target.value = "";

            void selectFiles(files);
          }}
        />
      </label>

      <p className="text-xs leading-5 text-text-muted">
        Le foto caricate saranno usate per descrivere la richiesta e possono
        essere gestite tramite provider di upload indicato nella{" "}
        <Link href="/privacy" className="font-medium text-brand-primary" prefetch={false}>
          privacy policy
        </Link>
        .
      </p>

      {items.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {items.map((item) => (
            <Card
              key={item.id}
              className="overflow-hidden"
            >
              {item.previewUrl ? (
                <div className="relative aspect-video bg-surface-secondary">
                  <Image
                    src={item.previewUrl}
                    alt=""
                    fill
                    unoptimized
                    sizes="(max-width: 640px) 100vw, 50vw"
                    className="object-cover"
                  />
                </div>
              ) : null}

              <div className="flex items-center gap-3 p-3">
                <div className="min-w-0 flex-1 space-y-2">
                  <p className="truncate text-sm font-medium text-text-primary">
                    {item.fileName}
                  </p>

                  <Badge
                    size="sm"
                    variant={getStatusVariant(
                      item.status,
                    )}
                  >
                    {getStatusLabel(
                      item.status,
                    )}
                  </Badge>
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={isUploading}
                  onClick={() => {
                    removeItem(item);
                  }}
                >
                  Rimuovi
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : null}

      {error ? (
        <p className="text-sm text-brand-primary">
          {error}
        </p>
      ) : null}
    </div>
  );
}
