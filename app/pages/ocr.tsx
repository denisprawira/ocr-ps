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
import { useEffect, useState } from "react";
import { createWorker, Worker } from "tesseract.js";

interface OcrResults {
  [filename: string]: string;
}

// interface FormField {
//   [key: string]: string;
// }

// interface FormFieldPattern {
//   regex: RegExp;
//   key: string;
// }

const OcrPage = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [proceedFiles, setProceedFiles] = useState<File[]>([]);
  const [ocrResults, setOcrResults] = useState<OcrResults>({});
  const [progress, setProgress] = useState<number>(0);
  const [worker, setWorker] = useState<Worker | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  useEffect(() => {
    const initWorker = async () => {
      try {
        const newWorker = await createWorker("eng", 1, {
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

  const processImage = async (file: File) => {
    if (!worker) return;

    try {
      setIsProcessing(true);
      const imageUrl = URL.createObjectURL(file);

      const { data } = await worker.recognize(imageUrl);

      setOcrResults((prev) => ({
        ...prev,
        [file.name]: data.text,
      }));

      URL.revokeObjectURL(imageUrl);
    } catch (error) {
      console.error("OCR processing error:", error);
      setOcrResults((prev) => ({
        ...prev,
        [file.name]: "Error processing image",
      }));
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  useEffect(() => {
    console.log("ocr result : ", ocrResults);
  }, [ocrResults]);

  const processAllImages = async () => {
    setIsProcessing(true);
    for (const file of files) {
      if (!ocrResults[file.name]) {
        await processImage(file);
      }
    }
    setIsProcessing(false);
  };

  // const parseFormFields = (text: string): FormField => {
  //   if (!text) return {};

  //   const fields: FormField = {};
  //   const patterns: FormFieldPattern[] = [
  //     { regex: /name:?\s*([^\n]+)/i, key: "name" },
  //     { regex: /email:?\s*([^\n]+)/i, key: "email" },
  //     { regex: /phone:?\s*([^\n]+)/i, key: "phone" },
  //     { regex: /address:?\s*([^\n]+)/i, key: "address" },
  //     { regex: /date:?\s*([^\n]+)/i, key: "date" },
  //     { regex: /id:?\s*([^\n]+)/i, key: "id" },
  //     { regex: /city:?\s*([^\n]+)/i, key: "city" },
  //     { regex: /state:?\s*([^\n]+)/i, key: "state" },
  //     { regex: /zip:?\s*([^\n]+)/i, key: "zip" },
  //     { regex: /country:?\s*([^\n]+)/i, key: "country" },
  //   ];

  //   patterns.forEach((pattern) => {
  //     const match = text.match(pattern.regex);
  //     if (match && match[1]) {
  //       fields[pattern.key] = match[1].trim();
  //     }
  //   });

  //   return fields;
  // };

  const handleFilesAdded = (newFiles: File[]) => {
    setFiles(newFiles);
  };

  const handleProceed = (e: React.FormEvent) => {
    e.preventDefault();
    setProceedFiles(files);
    processAllImages();
  };

  return (
    <Card className="mx-auto max-w-5xl w-full bg-background">
      <CardHeader>
        <CardTitle>File Upload</CardTitle>
        <CardDescription>
          Drag and drop files to upload them for OCR processing, or click to
          select files.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleProceed}>
        <CardContent>
          <FileDropzone
            placeholder="Drag and drop files here, or click to select files"
            onFilesAdded={handleFilesAdded}
            accept=".jpg,.jpeg,.png,.pdf,.docx"
          />
        </CardContent>
        <CardFooter className="flex justify-between mt-4">
          <div>
            {isProcessing && (
              <span className="text-sm">Processing... {progress}%</span>
            )}
          </div>
          <Button type="submit" disabled={files.length === 0 || isProcessing}>
            {isProcessing
              ? "Processing..."
              : `Proceed ${files.length > 0 ? `(${files.length})` : ""}`}
          </Button>
        </CardFooter>
      </form>

      {proceedFiles.length > 0 && (
        <CardContent className="space-y-4">
          {proceedFiles.map((file, index) => (
            <div key={file.name + index} className="border rounded-md p-4">
              <h3 className="font-medium mb-2">{file.name}</h3>

              {ocrResults[file.name] ? (
                <>
                  <div className="mb-4 p-3 border rounded-md bg-black/10">
                    <h4 className="text-sm font-medium mb-1">
                      Raw OCR Result:
                    </h4>
                    <pre className="text-xs whitespace-pre-wrap max-h-40 overflow-y-auto">
                      {ocrResults[file.name]}
                    </pre>
                  </div>

                  <div className="p-3 bg-black/10 rounded-md">
                    <h4 className="text-sm font-medium mb-2">
                      Parsed Form Fields:
                    </h4>
                    {/* <div className="grid grid-cols-2 gap-2">
                      {Object.entries(parseFormFields(ocrResults[file.name]))
                        .length > 0 ? (
                        Object.entries(
                          parseFormFields(ocrResults[file.name])
                        ).map(([key, value]) => (
                          <div key={key} className="text-xs">
                            <span className="font-medium capitalize">
                              {key}:{" "}
                            </span>
                            <span>{value}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-gray-500 col-span-2">
                          No form fields detected
                        </p>
                      )}
                    </div> */}
                  </div>
                </>
              ) : (
                <div className="text-center p-4">
                  <p className="text-sm text-gray-500">
                    {isProcessing
                      ? "Processing..."
                      : "No OCR results available"}
                  </p>
                </div>
              )}
            </div>
          ))}
        </CardContent>
      )}
    </Card>
  );
};

export default OcrPage;
