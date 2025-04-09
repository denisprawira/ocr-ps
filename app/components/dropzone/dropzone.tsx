import { Button } from "@/components/ui/button";
import React, { useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { X } from "lucide-react";
import imageCompression from "browser-image-compression";
import { applyThresholdToFile } from "@/app/utils/image-processing";
import Image from "next/image";
import Hint from "@/app/components/hint/hint";

const renderDroppedFile = (
  index: number,
  file: File,
  handleRemoveFile: (index: number) => void
) => {
  const imageUrl = URL.createObjectURL(file);

  return (
    <div
      key={self.crypto.randomUUID()}
      className="p-2 border-2 border-muted-foreground/10 bg-white rounded-lg flex items-center gap-4 w-fit max-w-xs"
    >
      {file.type.includes("image") && (
        <Hint
          title={file.name}
          content={
            <Image alt={file.name} src={imageUrl} height={300} width={300} />
          }
        >
          <Image
            src={imageUrl}
            alt={file.name}
            width={50}
            height={50}
            className=" size-14 object-cover rounded-md"
          />
        </Hint>
      )}

      <div className="flex  flex-grow truncate">
        <span className="text-sm font-medium truncate">
          {file.name.length > 40 ? `${file.name.slice(0, 40)}...` : file.name}
        </span>
        <Button
          variant={"ghost"}
          className="self-start mt-1 p-1 h-auto text-red-500"
          onClick={(e) => {
            e.preventDefault();
            handleRemoveFile(index);
          }}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

interface InputDropzoneProps {
  placeholder: string;
  onFilesAdded: (files: File[]) => void;
  files?: File[];
  accept?: string;
  compressedImages?: boolean;
  threshold?: number;
}

const FileDropzone = ({
  placeholder,
  onFilesAdded,
  files = [],
  accept,
  compressedImages = false,
  threshold = 0,
}: InputDropzoneProps) => {
  const { getRootProps, getInputProps } = useDropzone({
    onDrop: (acceptedFiles) => {
      handleDropped(
        acceptedFiles.map((file) =>
          Object.assign(file, {
            preview: URL.createObjectURL(file),
          })
        )
      );
    },
  });

  const handleDropped = async (acceptedFiles: File[]) => {
    const options = {
      maxSizeMB: 2,
      maxWidthOrHeight: 500,
      useWebWorker: true,
    };

    try {
      let compressedFiles: File[] = [];
      if (compressedFiles) {
        compressedFiles = await Promise.all(
          acceptedFiles.map((file) => imageCompression(file, options))
        );
      }

      const thresholdedFiles = await Promise.all(
        (compressedImages ? compressedFiles : acceptedFiles).map(
          async (file) => {
            const thresholdedBlob = await applyThresholdToFile(
              file,
              threshold || 0
            );
            return new File([thresholdedBlob], file.name, {
              type: "image/png",
            });
          }
        )
      );

      const newFiles = [
        ...files,
        ...(threshold > 0
          ? thresholdedFiles
          : compressedImages
          ? compressedFiles
          : acceptedFiles),
      ];
      onFilesAdded(newFiles);
    } catch (error) {
      console.error("Image compression failed:", error);
    }
  };

  const handleRemoveFile = (indexToRemove: number) => {
    const newFiles = files.filter((_, index) => index !== indexToRemove);
    onFilesAdded(newFiles);
  };

  useEffect(() => {
    console.log("threshold: ", threshold);
  }, [threshold]);

  return (
    <section className="w-full h-full relative space-y-4">
      <div
        {...getRootProps()}
        className=" border-3 border-dashed  w-full h-full min-h-60 rounded-sm px-4 py-2 flex justify-center items-center "
      >
        <input {...getInputProps()} accept={accept} />
        {files.length > 0 ? (
          <p className="text-wrap text-muted-foreground">{`${files.length} Files Dropped`}</p>
        ) : (
          <p className="text-wrap text-muted-foreground">{placeholder}</p>
        )}
      </div>
      <div className=" grid gap-2 max-w-full grid-cols-2 max-sm:grid-cols-1">
        {files.map((file: File, index) =>
          renderDroppedFile(index, file, handleRemoveFile)
        )}
      </div>
    </section>
  );
};

export default FileDropzone;
