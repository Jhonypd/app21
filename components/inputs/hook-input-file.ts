import {
  createImagePreviews,
  FILE_ACCEPT_MAP,
  FileType,
  revokeObjectURLs,
  validateFile,
} from "@/utils/file";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

interface UseFileInputProps {
  initialUrls?: string[];
  fileType?: FileType;
  maxSizeMB?: number;
  maxFiles?: number;
  multiple?: boolean;
  onError?: (message: string) => void;
}

export const useFileInput = ({
  initialUrls = [],
  fileType = "all",
  maxSizeMB = 5,
  maxFiles = 5,
  multiple = false,
  onError,
}: UseFileInputProps) => {
  // Estados
  const [files, setFiles] = useState<File[]>([]);
  const [initialUrlsState, setInitialUrlsState] =
    useState<string[]>(initialUrls);
  const [blobUrls, setBlobUrls] = useState<string[]>([]);
  const [errors, setErrors] = useState<string[]>([]);

  // Referências
  const initialUrlsRef = useRef(initialUrls);
  const initialFilesRef = useRef<File[]>([]);
  const blobUrlsRef = useRef<string[]>([]);

  // Previews combina URLs iniciais e blob URLs
  const previews = useMemo(
    () => [...initialUrlsState, ...blobUrls],
    [initialUrlsState, blobUrls],
  );

  // Aceitação de arquivos
  const currentAccept = useMemo(
    () => FILE_ACCEPT_MAP[fileType] || "*",
    [fileType],
  );

  // Função para processar arquivos selecionados
  const processFiles = useCallback(
    (validFiles: File[]) => {
      if (!multiple) {
        // Modo single: substitui tudo
        const newBlobUrls = createImagePreviews(validFiles.slice(0, 1));
        revokeObjectURLs(blobUrlsRef.current);

        setFiles(validFiles.slice(0, 1));
        setBlobUrls(newBlobUrls);
        setInitialUrlsState([]);
        blobUrlsRef.current = newBlobUrls;
      } else {
        // Modo múltiplo: adiciona até o limite
        const availableSlots =
          maxFiles - (initialUrlsState.length + files.length);

        if (availableSlots <= 0) {
          const errorMsg = `Limite máximo de ${maxFiles} arquivos atingido`;
          setErrors((prev) => [...prev, errorMsg]);
          onError?.(errorMsg);
          return;
        }

        const filesToAdd = validFiles.slice(0, Math.max(0, availableSlots));
        const newBlobUrls = createImagePreviews(filesToAdd);

        setFiles((prev) => [...prev, ...filesToAdd]);
        setBlobUrls((prev) => [...prev, ...newBlobUrls]);
        blobUrlsRef.current = [...blobUrlsRef.current, ...newBlobUrls];
      }
    },
    [multiple, maxFiles, initialUrlsState.length, files.length, onError],
  );

  // Handler principal para mudança de arquivos
  const handleFilesChange = useCallback(
    (selectedFiles: FileList | File[]) => {
      const selected = Array.from(selectedFiles);
      const validFiles: File[] = [];
      const newErrors: string[] = [];

      // Validação de arquivos
      for (const file of selected) {
        const { isValid, errors: fileErrors } = validateFile(
          file,
          currentAccept,
          maxSizeMB,
        );
        if (!isValid) newErrors.push(...fileErrors);
        else validFiles.push(file);
      }

      setErrors(newErrors);
      if (newErrors.length > 0) {
        onError?.(newErrors.join("; "));
      }

      if (validFiles.length > 0) {
        processFiles(validFiles);
      }
    },
    [currentAccept, maxSizeMB, onError, processFiles],
  );

  // Função para remover arquivo
  const removeFile = useCallback(
    (index: number) => {
      if (index < initialUrlsState.length) {
        // Remove URL inicial
        setInitialUrlsState((prev) => prev.filter((_, i) => i !== index));
      } else {
        // Remove arquivo selecionado
        const blobIndex = index - initialUrlsState.length;

        // Revoga URL se necessário
        if (blobUrls[blobIndex]?.startsWith("blob:")) {
          URL.revokeObjectURL(blobUrls[blobIndex]);
        }

        // Atualiza estados
        setFiles((prev) => prev.filter((_, i) => i !== blobIndex));
        setBlobUrls((prev) => prev.filter((_, i) => i !== blobIndex));
        blobUrlsRef.current = blobUrlsRef.current.filter(
          (_, i) => i !== blobIndex,
        );
      }
    },
    [initialUrlsState.length, blobUrls],
  );

  // Reset
  const reset = useCallback(() => {
    revokeObjectURLs(blobUrlsRef.current);
    blobUrlsRef.current = [];

    setFiles(initialFilesRef.current);
    setBlobUrls([]);
    setInitialUrlsState(initialUrlsRef.current);
    setErrors([]);
  }, []);

  // Efeitos de inicialização e limpeza
  useEffect(() => {
    // Configuração inicial
    initialFilesRef.current = [...files];
    initialUrlsRef.current = [...initialUrls];

    return () => {
      // Limpeza ao desmontar
      revokeObjectURLs(blobUrlsRef.current);
    };
  }, []);

  // Atualização segura de URLs iniciais
  useEffect(() => {
    const urlsChanged =
      initialUrls.length !== initialUrlsRef.current.length ||
      initialUrls.some((url, i) => url !== initialUrlsRef.current[i]);

    if (urlsChanged) {
      initialUrlsRef.current = initialUrls;
      setInitialUrlsState(initialUrls);
    }
  }, [initialUrls]);

  // Lista combinada de arquivos
  const allFiles = useMemo(
    () => [
      ...initialUrlsState.map((url) => ({ type: "url" as const, value: url })),
      ...files.map((file) => ({ type: "file" as const, value: file })),
    ],
    [initialUrlsState, files],
  );

  return {
    allFiles,
    previews,
    errors,
    hasError: errors.length > 0,
    handleFilesChange,
    removeFile,
    reset,
    fileType,
    maxSizeMB,
    maxFiles,
    multiple,
    currentAccept,
  };
};
