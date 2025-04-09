import { Button } from "@/components/ui/button";
import React from "react";
import { useDropzone } from "react-dropzone";
import { Image as ImageIcon, X } from "lucide-react";
import imageCompression from "browser-image-compression";

const renderDroppedFile = (
  index: number,
  file: File,
  handleRemoveFile: (index: number) => void
) => {
  return (
    <div
      key={self.crypto.randomUUID()}
      className="p-2 border-2 border-muted-foreground/10 bg-white rounded-lg flex justify-between items-center w-fit"
    >
      {file.type.includes("image") && <ImageIcon />}
      {file.name.length > 20 ? `${file.name.slice(0, 40)}...` : file.name}
      <Button
        variant={"ghost"}
        className="cursor-pointer"
        onClick={(e) => {
          e.preventDefault();
          handleRemoveFile(index);
        }}
      >
        <X />
      </Button>
    </div>
  );
};

interface InputDropzoneProps {
  placeholder: string;
  onFilesAdded: (files: File[]) => void;
  files?: File[];
  accept?: string;
  compressedImages?: boolean;
}

const FileDropzone = ({
  placeholder,
  onFilesAdded,
  files = [],
  accept,
  compressedImages = false,
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

      const newFiles = [
        ...files,
        ...(compressedImages ? compressedFiles : acceptedFiles),
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
