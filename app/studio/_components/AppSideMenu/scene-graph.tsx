import React, { useState } from "react";
import { useModelStore } from "../../store/modelStore";
import { Material, Mesh, Object3D, Group } from "three";
import {
  ChevronDown,
  ChevronRight,
  Folder,
  Layers,
  Palette,
  Circle,
  FolderOpen,
  CircleDashed,
} from "lucide-react";

import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/animate-ui/base/toggle-group";

import { AnimatePresence } from "motion/react";

const SceneGraph = () => {
  const { objects, selectedObject, setSelectedObject } = useModelStore();

  if (objects.length === 0) {
    return (
      <div className="p-6 text-center">
        <p className="font-medium mb-2">No models In the Scene</p>
        <p className="mt-4 text-muted-foreground">
          Drag and drop 3D model files to view their scene graph.
        </p>
      </div>
    );
  }

  return (
    <div className="h-full">
      {objects.map((object, index) => (
        <div key={`${object.userData?.fileName}-${index}`} className="">
          <ul>
            <ToggleGroup
              defaultValue={[object.userData?.fileName]}
              toggleMultiple={false}
            >
              <SceneNode
                object={object}
                level={0}
                isRoot
                modelIndex={index}
                filename={object.userData?.fileName}
                isLast={index === objects.length - 1}
                selectedObject={selectedObject}
                setSelectedObject={setSelectedObject}
              />
            </ToggleGroup>
          </ul>
        </div>
      ))}
    </div>
  );
};

export default SceneGraph;

interface SceneNodeProps {
  object: Object3D;
  level: number;
  isRoot?: boolean;
  filename?: string;
  modelIndex?: number;
  isLast?: boolean;
  selectedObject: Object3D | null;
  setSelectedObject: (object: Object3D | null) => void;
}

function SceneNode({
  object,
  level,
  isRoot,
  filename,
  isLast = false,
  selectedObject,
  setSelectedObject,
}: SceneNodeProps) {
  const [expanded, setExpanded] = useState(isRoot);

  const hasChildren = object.children.length > 0;
  const isSelected = selectedObject === object;

  const toggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    setExpanded(!expanded);
  };

  const handleClick = () => {
    setSelectedObject(object);
  };

  const getNodeIcon = (isOpen: boolean | undefined, isActive: boolean) => {
    if (isRoot || object instanceof Group)
      return (
        <AnimatePresence mode="wait">
          {isOpen && isOpen ? (
            <FolderOpen className="w-4 h-4" />
          ) : (
            <Folder className="w-4 h-4" />
          )}
        </AnimatePresence>
      );

    if (object instanceof Mesh)
      return (
        <AnimatePresence mode="wait">
          {isActive ? (
            <CircleDashed className="w-4 h-4" />
          ) : (
            <Circle className="w-4 h-4" />
          )}
        </AnimatePresence>
      );

    if (object instanceof Material) return <Palette className="w-4 h-4 " />;
    return <Layers className="w-4 h-4 " />;
  };

  return (
    <li className="relative w-full">
      {/* Vertical line from parent to this item's position */}
      {level > 0 && (
        <div
          className="absolute left-[-16px] top-0 w-[1px] bg-gray-300 dark:bg-gray-600 "
          style={{
            height: isLast && !hasChildren ? "16px" : "100%",
          }}
        />
      )}

      {/* Horizontal line to this item */}
      {level > 0 && (
        <div
          className="absolute h-[1px] bg-gray-300 dark:bg-gray-600"
          style={{
            left: "-16px",
            top: "16px",
            width: "16px",
          }}
        />
      )}

      <div
        className={`flex items-center cursor-pointer group rounded-md hover:bg-accent  ${
          isSelected ? "text-chart-2 bg-accent rounded-md" : ""
        }`}
        onClick={handleClick}
      >
        <ToggleGroupItem
          value={isRoot ? filename || object.type : object.name || object.type}
          aria-label="Toggle bold"
          className="w-full px-2"
        >
          <div
            onClick={toggleExpand}
            className={`w-5 h-5 flex  items-center justify-center ${
              !hasChildren ? "invisible" : ""
            }`}
            aria-label={expanded ? "Collapse" : "Expand"}
          >
            {expanded ? (
              <ChevronDown size={16} strokeWidth={1.5} />
            ) : (
              <ChevronRight size={16} strokeWidth={1.5} />
            )}
          </div>

          <div className="flex items-center  text-sm w-full justify-between  pr-2 ">
            <div className="flex items-center">
              <span className="mr-1.5">
                {getNodeIcon(expanded, isSelected)}
              </span>

              <span
                className={`truncate ${
                  isSelected
                    ? "text-chart-2"
                    : "text-gray-700 dark:text-gray-200"
                }`}
                style={{ maxWidth: "160px" }}
              >
                {isRoot ? filename : object.name || object.type}
              </span>
            </div>

            {/* {object instanceof Mesh && (
              <span className="text-[10px] text-muted-foreground">
                {(
                  object.geometry.attributes.position?.count || 0
                ).toLocaleString()}{" "}
                verts
              </span>
            )} */}
          </div>
        </ToggleGroupItem>
      </div>

      {expanded && hasChildren && (
        <ul className="pl-4 ml-4 ">
          {object.children.map((child, index) => (
            <SceneNode
              key={`${child.uuid}-${index}`}
              object={child}
              level={level + 1}
              isLast={index === object.children.length - 1}
              selectedObject={selectedObject}
              setSelectedObject={setSelectedObject}
            />
          ))}
        </ul>
      )}
    </li>
  );
}
