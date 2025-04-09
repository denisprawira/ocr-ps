import { create } from "zustand";

interface FileTypeStore {
  file: File | undefined;
  setFile: (fileType: File | undefined) => void;
}

const useFileStore = create<FileTypeStore>((set) => ({
  file: undefined,
  setFile: (fileType) => set({ file: fileType }),
}));

export default useFileStore;
