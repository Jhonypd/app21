"use client";

import React, {
  useState,
  useRef,
  ChangeEvent,
  useEffect,
  useCallback,
} from "react";
import {
  FileImage,
  FileVideo,
  File,
  FileAudio,
  Trash2,
  HardDriveDownload,
  Upload,
  Fullscreen,
  Undo2,
  ImagePlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useFileInput } from "./hook-input-file";
import { FileType } from "@/utils/file";

interface FileItem {
  type: "file" | "url";
  value: File | string;
}
interface FileInputProps {
  label?: string;
  name?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  multiple?: boolean;
  maxFiles?: number;
  enableDownload?: boolean;
  initialUrls?: string[];
  fileType?: FileType;
  maxSizeMB?: number;
  onError?: (error: string) => void;
  error?: boolean;
  value: FileItem[];
  onChange: (files: File[]) => void;
}

const getFileNameFromUrl = (url: string) => {
  return url.substring(url.lastIndexOf("/") + 1);
};

export const FileInput: React.FC<FileInputProps> = ({
  label = "Arquivo",
  name = "file",
  placeholder = "Selecione ou arraste o arquivo",
  disabled = false,
  className = "",
  multiple = false,
  maxFiles = 5,
  enableDownload = true,
  initialUrls = [],
  fileType = "all",
  maxSizeMB = 5,
  onError,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const {
    previews,
    errors,
    removeFile,
    reset,
    handleFilesChange,
    currentAccept,
    allFiles,
  } = useFileInput({
    initialUrls,
    fileType,
    maxSizeMB,
    maxFiles,
    multiple,
    onError,
  });

  console.log({ allFiles, initialUrls });

  // Atualiza o índice selecionado quando as previews mudam
  useEffect(() => {
    if (previews.length === 0) {
      setSelectedIndex(-1);
    } else if (selectedIndex >= previews.length) {
      setSelectedIndex(previews.length - 1);
    } else if (selectedIndex === -1 && previews.length > 0) {
      setSelectedIndex(0);
    }
  }, [previews, selectedIndex]);

  const handleFileChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      if (!e.target.files) return;
      handleFilesChange(e.target.files);
      e.target.value = "";

      // Seleciona automaticamente o primeiro arquivo novo

      if (multiple) {
        setSelectedIndex(previews.length + e.target.files.length - 1);
      } else {
        setSelectedIndex(0);
      }
    },
    [handleFilesChange, multiple, previews.length],
  );

  const handleRemoveFile = useCallback(
    (index: number) => {
      removeFile(index);

      // Ajusta o índice selecionado
      if (allFiles.length === 1) {
        setSelectedIndex(-1);
      } else if (index === selectedIndex) {
        setSelectedIndex(Math.max(0, selectedIndex - 1));
      } else if (index < selectedIndex) {
        setSelectedIndex(selectedIndex - 1);
      }
    },
    [removeFile, selectedIndex, allFiles.length],
  );

  const handleAddMoreFiles = useCallback(() => {
    inputRef.current?.click();
  }, []);

  // Função para renderizar o preview principal
  const renderMainPreview = useCallback(() => {
    if (selectedIndex === -1 || !previews[selectedIndex]) {
      return (
        <div className="relative flex h-48 w-full items-center justify-center rounded-md border">
          <div className="flex flex-col items-center gap-2">
            <Upload size={24} />
            <p>{placeholder}</p>
          </div>
        </div>
      );
    }

    // Removemos a declaração não utilizada de fileItem
    const preview = previews[selectedIndex];
    const isImage =
      preview &&
      (preview.startsWith("blob:") ||
        /\.(png|jpg|jpeg|webp|gif|svg)$/i.test(preview));
    const isVideo = preview && /\.(mp4|webm|mov|avi|mkv)$/i.test(preview);
    const isAudio = preview && /\.(mp3|wav|ogg|m4a|flac)$/i.test(preview);

    return (
      <div className="relative mt-2 h-48 w-full rounded-md border">
        {isImage ? (
          <Image
            src={preview}
            alt={`preview-${selectedIndex}`}
            fill
            className="rounded-md object-contain"
          />
        ) : isVideo ? (
          <video
            src={preview}
            controls
            className="h-full w-full object-contain"
          />
        ) : isAudio ? (
          <audio src={preview} controls className="h-full w-full" />
        ) : (
          <div className="flex h-full items-center justify-center">
            <File size={48} className="text-primary" />
          </div>
        )}

        <div className="absolute right-2 top-2 flex gap-2">
          <Button
            size="icon"
            variant="ghost"
            className="h-10 w-10 cursor-pointer rounded-full text-primary hover:bg-primary/20 hover:text-primary"
            onClick={() => window.open(preview, "_blank")}
            aria-label="Visualizar arquivo"
          >
            <Fullscreen size={24} />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-10 w-10 cursor-pointer rounded-full text-red-500 hover:bg-red-600/20 hover:text-red-500"
            onClick={() => handleRemoveFile(selectedIndex)}
            aria-label="Remover arquivo"
          >
            <Trash2 size={24} />
          </Button>
        </div>
      </div>
    );
  }, [previews, selectedIndex, handleRemoveFile, placeholder]);

  const getIconByMimeType = useCallback((urlOrType: string) => {
    if (urlOrType.startsWith("http") || urlOrType.startsWith("blob:")) {
      // É uma URL - verifica pela extensão
      if (/\.(png|jpg|jpeg|webp|gif|svg)$/i.test(urlOrType)) {
        return <FileImage className="text-primary" />;
      }
      if (/\.(mp4|webm|mov|avi|mkv)$/i.test(urlOrType)) {
        return <FileVideo className="text-primary" />;
      }
      if (/\.(mp3|wav|ogg|m4a|flac)$/i.test(urlOrType)) {
        return <FileAudio className="text-primary" />;
      }
      return <File className="text-primary" />;
    }

    // É um tipo MIME
    if (urlOrType.startsWith("image/"))
      return <FileImage className="text-primary" />;
    if (urlOrType.startsWith("video/"))
      return <FileVideo className="text-primary" />;
    if (urlOrType.startsWith("audio/"))
      return <FileAudio className="text-primary" />;
    return <File className="text-primary" />;
  }, []);

  // Renderiza a lista de arquivos
  const renderFileList = useCallback(() => {
    if (allFiles.length === 0) return null;

    return (
      <ul
        className={`mt-2 flex flex-col gap-2 ${multiple && allFiles.length > 3 ? "max-h-48 overflow-y-auto" : ""}`}
      >
        {allFiles.map((item, index) => (
          <li
            key={`${item.type}-${index}`}
            className={cn(
              "flex cursor-pointer items-center justify-between rounded-md border px-3 py-2",
              selectedIndex === index && "border-2 border-primary/60",
            )}
            onClick={() => setSelectedIndex(index)}
          >
            <div className="flex items-center gap-2">
              {getIconByMimeType(
                item.type === "url" ? item.value : item.value.type,
              )}
              <span className="text-sm font-medium text-gray-500">
                {item.type === "url"
                  ? getFileNameFromUrl(item.value)
                  : item.value.name}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {enableDownload && (
                <Button
                  size="icon"
                  variant="ghost"
                  className="cursor-pointer rounded-full text-green-500 hover:bg-green-600/20 hover:text-green-500"
                  onClick={(e) => {
                    e.stopPropagation();
                    alert(
                      `Download do arquivo: ${
                        item.type === "url"
                          ? getFileNameFromUrl(item.value)
                          : item.value.name
                      }`,
                    );
                  }}
                  aria-label={`Download do arquivo ${
                    item.type === "url"
                      ? getFileNameFromUrl(item.value)
                      : item.value.name
                  }`}
                >
                  <HardDriveDownload size={16} />
                </Button>
              )}
              <Button
                size="icon"
                variant="ghost"
                className="cursor-pointer rounded-full text-red-500 hover:bg-red-600/20 hover:text-red-500"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveFile(index);
                }}
                aria-label={`Remover arquivo ${
                  item.type === "url"
                    ? getFileNameFromUrl(item.value)
                    : item.value.name
                }`}
              >
                <Trash2 size={16} />
              </Button>
            </div>
          </li>
        ))}
      </ul>
    );
  }, [
    allFiles,
    selectedIndex,
    enableDownload,
    getIconByMimeType,
    handleRemoveFile,
  ]);

  // Calcula se pode adicionar mais arquivos
  const canAddMore = multiple
    ? allFiles.length < maxFiles
    : allFiles.length === 0;

  const hasItems = allFiles.length > 0;

  return (
    <div
      className={cn("relative w-full rounded-md border px-2 py-3", className)}
    >
      <Label
        htmlFor={name}
        className={`absolute -top-[11px] left-10 z-10 bg-background px-1 text-sm font-medium text-gray-600 ${errors.length > 0 ? "text-red-500" : ""}`}
      >
        {label}
      </Label>

      {/* Preview principal */}
      {hasItems && renderMainPreview()}

      {/* Área de upload (só aparece se não houver itens) */}
      {!hasItems && (
        <label
          htmlFor={name}
          className={cn(
            "mt-2 flex h-48 w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-md border p-4 text-center text-sm text-muted-foreground hover:border-primary",
            disabled && "cursor-not-allowed opacity-50",
            errors.length > 0 && "border-red-500",
          )}
        >
          <Upload size={24} />
          <p>{placeholder}</p>
          <p className="text-xs text-muted-foreground">
            Formatos aceitos: {currentAccept}
          </p>
          <p className="text-xs text-muted-foreground">
            Tamanho máx: {maxSizeMB}MB
          </p>
        </label>
      )}

      <Input
        ref={inputRef}
        id={name}
        name={name}
        type="file"
        accept={currentAccept}
        disabled={disabled}
        className="hidden"
        onChange={handleFileChange}
        multiple={multiple}
      />

      {errors.length > 0 && (
        <div className="mt-1 text-sm text-red-500">
          {errors.map((error, i) => (
            <p key={i}>{error}</p>
          ))}
        </div>
      )}

      {/* Lista de arquivos */}
      {hasItems && renderFileList()}

      {/* Botões de ação */}
      <div className="mt-2 flex flex-row gap-2">
        <Button
          type="button"
          variant="secondary"
          onClick={reset}
          disabled={
            disabled || (allFiles.length === 0 && initialUrls.length === 0)
          }
          className="min-w-32 max-w-48 cursor-pointer"
          aria-label="Resetar seleção de arquivos"
        >
          <Undo2 size={16} className="mr-2" />
          Resetar
        </Button>

        <Button
          type="button"
          variant="default"
          onClick={handleAddMoreFiles}
          className="min-w-32 max-w-48 cursor-pointer"
          disabled={disabled || !canAddMore}
          aria-label="Adicionar mais arquivos"
        >
          <ImagePlus size={16} className="mr-2" />
          Adicionar
        </Button>
      </div>
    </div>
  );
};
