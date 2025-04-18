"use client";
import { useEffect, useState, useCallback } from "react";
import { createWorker, Worker } from "tesseract.js";
import { motion } from "motion/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import FileDropzone from "@/app/components/dropzone/dropzone";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@radix-ui/react-label";
// import { Input } from "@/components/ui/input";
// import { Badge } from "@/components/ui/badge";
// import { X } from "lucide-react";

interface OcrResults {
  [key: string]: string;
}

// const renderFilters = (
//   keywords: string[],
//   setKeywords: (arg: string[]) => void,
//   inputValue: string,
//   setInputValue: (arg: string) => void,
//   tableColumns: string[],
//   setTableColumns: (arg: string[]) => void,
//   inputTableColumns: string,
//   setInputTableColumns: (arg: string) => void
// ) => {
//   const addKeyword = () => {
//     setKeywords([...keywords, inputValue]);
//     setInputValue("");
//   };

//   const addTableColumn = () => {
//     setTableColumns([...tableColumns, inputTableColumns]);
//     setInputTableColumns("");
//   };

//   const removeKeyword = (keywordToRemove: string) => {
//     setKeywords(keywords.filter((keyword) => keyword !== keywordToRemove));
//   };

//   const removeColumn = (keywordToRemove: string) => {
//     setTableColumns(
//       tableColumns.filter((keyword) => keyword !== keywordToRemove)
//     );
//   };

//   return (
//     <>
//       <div className="w-full max-w-md mx-auto space-y-4">
//         <h2 className="text-xl font-bold">Input Fields</h2>

//         <div className="flex gap-2">
//           <Input
//             type="text"
//             placeholder="Enter a Fields"
//             value={inputValue}
//             onChange={(e) => setInputValue(e.target.value)}
//             className="flex-1"
//           />
//           <Button onClick={addKeyword} type="button">
//             Add
//           </Button>
//         </div>

//         {keywords.length > 0 && (
//           <div className="flex flex-wrap gap-2 mt-4">
//             {keywords.map((keyword, index) => (
//               <Badge
//                 key={index}
//                 variant={"secondary"}
//                 className="px-3 py-1.5 text-sm"
//               >
//                 {keyword}
//                 <button
//                   onClick={() => removeKeyword(keyword)}
//                   className="ml-2 rounded-full hover:bg-muted/60 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
//                   aria-label={`Remove ${keyword}`}
//                 >
//                   <X className="h-3 w-3" />
//                 </button>
//               </Badge>
//             ))}
//           </div>
//         )}

//         {keywords.length > 0 && (
//           <div className="text-sm text-muted-foreground mt-2">
//             {keywords.length} column{keywords.length !== 1 ? "s" : ""} added
//           </div>
//         )}
//       </div>
//       <div className="w-full max-w-md mx-auto space-y-4">
//         <h2 className="text-xl font-bold">Input Columns</h2>

//         <div className="flex gap-2">
//           <Input
//             type="text"
//             placeholder="Enter a Column"
//             value={inputTableColumns}
//             onChange={(e) => setInputTableColumns(e.target.value)}
//             className="flex-1"
//           />
//           <Button onClick={addTableColumn} type="button">
//             Add
//           </Button>
//         </div>

//         {tableColumns.length > 0 && (
//           <div className="flex flex-wrap gap-2 mt-4">
//             {keywords.map((column, index) => (
//               <Badge
//                 key={index}
//                 variant={"secondary"}
//                 className="px-3 py-1.5 text-sm"
//               >
//                 {column}
//                 <button
//                   onClick={() => removeColumn(column)}
//                   className="ml-2 rounded-full hover:bg-muted/60 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
//                   aria-label={`Remove ${column}`}
//                 >
//                   <X className="h-3 w-3" />
//                 </button>
//               </Badge>
//             ))}
//           </div>
//         )}

//         {tableColumns.length > 0 && (
//           <div className="text-sm text-muted-foreground mt-2">
//             {keywords.length} keyword{keywords.length !== 1 ? "s" : ""} added
//           </div>
//         )}
//       </div>
//     </>
//   );
// };

const OcrPage = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [processedFiles, setProcessedFiles] = useState<File[]>([]);
  const [ocrResults, setOcrResults] = useState<OcrResults>({});
  const [progress, setProgress] = useState<number>(0);
  const [worker, setWorker] = useState<Worker | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [compressedFiles, setCompressedFiles] = useState<boolean>(false);
  const [threshold, setThreshold] = useState<number | undefined>(128);

  useEffect(() => {
    const initWorker = async () => {
      try {
        const newWorker = await createWorker("ind+eng", 1, {
          logger: (m) => {
            if (m.status === "recognizing text") {
              setProgress(Math.round(m.progress * 100));
            }
          },
        });
        setWorker(newWorker);
      } catch (error) {
        console.error("Error initializing Tesseract worker:", error);
      }
    };

    initWorker();

    return () => {
      if (worker) {
        worker.terminate();
      }
    };
    // eslint-disable-next-line
  }, []);

  const getFileKey = useCallback((file: File): string => {
    return `${file.lastModified}-${file.name}`;
  }, []);

  const processImage = useCallback(
    async (file: File) => {
      if (!worker) return;

      const fileKey = getFileKey(file);

      if (ocrResults[fileKey]) return;

      try {
        setIsProcessing(true);
        const imageUrl = URL.createObjectURL(file);

        const { data } = await worker.recognize(imageUrl);

        setOcrResults((prev) => ({
          ...prev,
          [fileKey]: data.text,
        }));

        URL.revokeObjectURL(imageUrl);
      } catch (error) {
        console.error(`OCR processing error for ${file.name}:`, error);
        setOcrResults((prev) => ({
          ...prev,
          [fileKey]: "Error processing image",
        }));
      } finally {
        setIsProcessing(false);
        setProgress(0);
      }
    },
    [worker, ocrResults, getFileKey]
  );

  const processAllImages = useCallback(async () => {
    if (!worker || files.length === 0) return;

    setIsProcessing(true);
    for (const file of files) {
      await processImage(file);
    }
    setIsProcessing(false);

    setProcessedFiles((prev) => [...prev, ...files]);
    setFiles([]);
  }, [files, worker, processImage]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      processAllImages();
    },
    [processAllImages]
  );

  const clearResults = useCallback(() => {
    setProcessedFiles([]);
    setOcrResults({});
  }, []);

  return (
    <Card className="mx-auto max-w-5xl w-full bg-background">
      <CardHeader className="flex">
        <div>
          <CardTitle>OCR Document Scanner</CardTitle>
          <CardDescription>
            Upload image files to extract text using OCR technology.
          </CardDescription>
        </div>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2  justify-between">
            <div className="flex items-center gap-4">
              <Checkbox
                onCheckedChange={(e) => setCompressedFiles(e as boolean)}
                className="cursor-pointer border-black size-5"
              />
              <label
                htmlFor="terms"
                className="text-md font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {"Compress Images Before Process"}
              </label>
            </div>
            <div>
              <Label htmlFor="threshold">Input Threshold</Label>
              <Input
                id="threshold"
                type="number"
                placeholder="Enter threshold (128 recomended)"
                value={threshold || ""}
                onChange={(e) => {
                  const value = e.target.value;
                  setThreshold(Number(value));
                }}
              />
            </div>
          </div>
          <FileDropzone
            compressedImages={compressedFiles}
            placeholder="Drag and drop images here, or click to select files"
            onFilesAdded={setFiles}
            files={files}
            accept=".jpg,.jpeg,.png,.pdf,.docx"
            threshold={threshold}
          />
        </CardContent>
        <CardFooter className="flex justify-between mt-4">
          <div>
            {isProcessing && (
              <span className="text-sm">Processing... {progress}%</span>
            )}
          </div>
          <div className="flex gap-4">
            <Button
              type="submit"
              disabled={files.length === 0 || isProcessing || !worker}
            >
              {isProcessing
                ? "Processing..."
                : `Scan Text ${files.length > 0 ? `(${files.length})` : ""}`}
            </Button>
            {processedFiles.length > 0 && (
              <Button
                variant="destructive"
                onClick={clearResults}
                disabled={isProcessing}
              >
                Clear Results ({processedFiles.length})
              </Button>
            )}
          </div>
        </CardFooter>
      </form>

      {processedFiles.length > 0 && (
        <div className="mt-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">OCR Results</CardTitle>
          </CardHeader>
          {processedFiles.map((file) => (
            <motion.div key={self.crypto.randomUUID()}>
              <CardContent>
                <div className="mb-4 p-3 border rounded-md bg-white shadow-sm">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-sm font-medium">
                      File: <span className="text-primary">{file.name}</span>
                    </h4>
                    <span className="text-xs text-muted-foreground">
                      {(file.size / 1024).toFixed(2)} KB
                    </span>
                  </div>
                  <div className="bg-muted/30 p-3 rounded">
                    <pre className="text-xs whitespace-pre-wrap max-h-40 overflow-y-auto">
                      {ocrResults[getFileKey(file)] || "Processing..."}
                    </pre>
                  </div>
                </div>
              </CardContent>
            </motion.div>
          ))}
        </div>
      )}
    </Card>
  );
};

export default OcrPage;
