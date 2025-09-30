import {
  createImagePreviews,
  FILE_ACCEPT_MAP,
  revokeObjectURLs,
  validateFile,
} from "@/utils/file";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

interface UseFileInputProps {
  initialUrl?: string;
  maxSizeMB?: number;
  onError?: (message: string) => void;
}

export const useCustomAvatar = ({
  initialUrl = "",
  maxSizeMB = 5,
  onError,
}: UseFileInputProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState<string>(initialUrl);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const blobUrlRef = useRef<string | null>(null);
  const initialUrlRef = useRef(initialUrl);

  const currentAccept = FILE_ACCEPT_MAP["image"] ?? "*";

  const preview = useMemo(() => blobUrl || url || null, [blobUrl, url]);

  const handleFilesChange = useCallback(
    (selectedFiles: FileList | File[]) => {
      const selected = Array.from(selectedFiles);
      const selectedFile = selected[0];

      if (!selectedFile) return;

      const { isValid, errors } = validateFile(
        selectedFile,
        currentAccept,
        maxSizeMB,
      );

      if (!isValid) {
        const msg = errors.join("; ");
        setError(msg);
        onError?.(msg);
        return;
      }

      // Revoga a URL anterior (se houver)
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
      }

      const newBlobUrl = createImagePreviews([selectedFile])[0];

      setFile(selectedFile);
      setBlobUrl(newBlobUrl);
      setUrl(""); // Zera a url inicial
      setError(null);
      blobUrlRef.current = newBlobUrl;
    },
    [currentAccept, maxSizeMB, onError],
  );

  const removeFile = useCallback(() => {
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }

    setFile(null);
    setBlobUrl(null);
    setUrl("");
    setError(null);
  }, []);

  const reset = useCallback(() => {
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }

    setFile(null);
    setBlobUrl(null);
    setUrl(initialUrlRef.current);
    setError(null);
  }, []);

  useEffect(() => {
    initialUrlRef.current = initialUrl;
    setUrl(initialUrl);
  }, [initialUrl]);

  useEffect(() => {
    return () => {
      revokeObjectURLs(blobUrlRef.current ? [blobUrlRef.current] : []);
    };
  }, []);

  return {
    value: file ?? url ?? null, // pode ser File ou string (url)
    preview,
    error,
    hasError: !!error,
    handleFilesChange,
    removeFile,
    reset,
    currentAccept,
  };
};
