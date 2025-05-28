import React, { useCallback } from "react";
import { useState } from "react";
import { useModelStore } from "../../store/modelStore";
import { loadGlbModel } from "../../utils/modelLoaders";
import { cn } from "@/lib/utils";

const Dropzone = () => {
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const { addObject } = useModelStore();

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);

      Array.from(e.dataTransfer.files).forEach(async (file) => {
        const object = await loadGlbModel(file);
        if (object) addObject(object);
      });
    },
    [addObject]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files || files.length === 0) return;

      Array.from(files).forEach(async (file) => {
        const object = await loadGlbModel(file);
        if (object) addObject(object);
      });
    },
    [addObject]
  );

  return (
    <div
      className={cn(
        "w-full z-40 h-full flex flex-col absolute top-0 left-0  items-center justify-center p-8 transition-all duration-300",
        isDragging ? "bg-gray-100" : "bg-gray-50"
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <h2 className="text-lg font-medium mb-2 text-center">
        {isDragging ? "Drop to load models" : "Drag & Drop 3D Models"}
      </h2>

      <p className="text-xs text-muted-foreground mb-8 text-center max-w-md">
        Drag and drop your 3D model files (.glb or .gltf) here, or click the
        button below to select files
      </p>

      <label className="bg-primary text-primary-foreground hover:bg-primary/90 py-2 px-4 rounded-md transition-colors cursor-pointer text-xs">
        Select 3D Models
        <input
          type="file"
          accept=".glb,.gltf"
          multiple
          className="hidden"
          onChange={handleFileSelect}
        />
      </label>
    </div>
  );
};

export default Dropzone;
