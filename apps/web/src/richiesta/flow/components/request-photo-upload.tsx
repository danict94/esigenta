"use client";

import Image from "next/image";
import Link from "next/link";

import { useEffect, useRef, useState, } from "react";

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
} from "../../../platform/uploads/uploadthing";

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

type RequestPhotoUploadProps = {
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

function getStatusClass(
  status: PhotoUploadStatus,
) {
  switch (status) {
    case "uploaded":
      return "border-eg-salvia text-eg-salvia";

    case "error":
      return "border-eg-cotto text-eg-cotto-dark";

    default:
      return "border-eg-hairline text-eg-ardesia";
  }
}

function joinClasses(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function RequestPhotoUpload({
  value,
  onChange,
  onUploadingChange,
}: RequestPhotoUploadProps) {
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
        className={joinClasses(
          "flex min-h-36 cursor-pointer flex-col items-center justify-center gap-3 border border-dashed border-eg-hairline bg-eg-calce px-5 py-8 text-center transition-colors hover:border-eg-cotto hover:bg-eg-calce-2",
          isUploading &&
            "pointer-events-none opacity-60",
        )}
      >
        <span className="flex size-11 items-center justify-center rounded-full bg-eg-calce-2 text-eg-cotto-dark">
          +
        </span>

        <span className="text-sm font-medium text-eg-terra">
          Aggiungi foto
        </span>

        <span className="max-w-sm text-xs leading-5 text-eg-ardesia">
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

      <p className="eg-form-help">
        Le foto caricate saranno usate per descrivere la richiesta e possono
        essere gestite tramite provider di upload indicato nella{" "}
        <Link href="/privacy" className="font-medium text-eg-cotto-dark" prefetch={false}>
          privacy policy
        </Link>
        .
      </p>

      {items.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {items.map((item) => (
            <div
              key={item.id}
              className="overflow-hidden border border-eg-hairline bg-eg-calce"
            >
              {item.previewUrl ? (
                <div className="relative aspect-video bg-eg-calce-2">
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
                  <p className="truncate text-sm font-medium text-eg-terra">
                    {item.fileName}
                  </p>

                  <span
                    className={joinClasses(
                      "inline-flex min-h-7 items-center rounded-full border px-2 text-[11px] font-medium uppercase tracking-[0.12em]",
                      getStatusClass(item.status),
                    )}
                  >
                    {getStatusLabel(
                      item.status,
                    )}
                  </span>
                </div>

                <button
                  type="button"
                  className="eg-button-ghost min-h-9 px-3 disabled:pointer-events-none disabled:opacity-50"
                  disabled={isUploading}
                  onClick={() => {
                    removeItem(item);
                  }}
                >
                  Rimuovi
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {error ? (
        <p className="text-sm text-eg-cotto-dark">
          {error}
        </p>
      ) : null}
    </div>
  );
}
