import React, { useState, createContext, useContext } from "react";
import { useModelStore } from "../../store/modelStore";
import { Material, Mesh, Object3D, Group } from "three";
import {
  ChevronDown,
  ChevronRight,
  Folder,
  Layers,
  Palette,
  Pentagon,
  Cuboid,
} from "lucide-react";

// Create a context for selection state
type SceneSelectionContextType = {
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
};

const SceneSelectionContext = createContext<SceneSelectionContextType>({
  selectedId: null,
  setSelectedId: () => {},
});

const SceneGraph = () => {
  const { objects } = useModelStore();
  const [selectedId, setSelectedId] = useState<string | null>(null);

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
    <SceneSelectionContext.Provider value={{ selectedId, setSelectedId }}>
      <div className="">
        {objects.map((object, index) => (
          <div key={`${object.userData?.fileName}-${index}`} className="">
            <ul className="pl-2">
              <SceneNode
                object={object}
                level={0}
                isRoot
                modelIndex={index}
                filename={object.userData?.fileName}
                isLast={index === objects.length - 1}
              />
            </ul>
          </div>
        ))}
      </div>
    </SceneSelectionContext.Provider>
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
}

function SceneNode({
  object,
  level,
  isRoot,
  filename,
  isLast = false,
}: SceneNodeProps) {
  const [expanded, setExpanded] = useState(isRoot);
  const { selectedId, setSelectedId } = useContext(SceneSelectionContext);
  const hasChildren = object.children.length > 0;
  const isSelected = selectedId === object.uuid;

  const toggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    setExpanded(!expanded);
  };

  const handleClick = () => {
    setSelectedId(object.uuid);
  };

  const getNodeIcon = () => {
    if (isRoot) return <Pentagon className="w-4 h-4" />;
    if (object instanceof Mesh) return <Cuboid className="w-4 h-4 " />;
    if (object instanceof Group) return <Folder className="w-4 h-4 " />;
    if (object instanceof Material) return <Palette className="w-4 h-4 " />;
    return <Layers className="w-4 h-4 " />;
  };

  return (
    <li className="relative">
      {/* Vertical line from parent to this item's position */}
      {level > 0 && (
        <div
          className="absolute left-[-16px] top-0 w-[1px] bg-gray-300 dark:bg-gray-600"
          style={{
            height: isLast && !hasChildren ? "15px" : "100%",
          }}
        />
      )}

      {/* Horizontal line to this item */}
      {level > 0 && (
        <div
          className="absolute h-[1px] bg-gray-300 dark:bg-gray-600"
          style={{ left: "-16px", top: "14px", width: "16px" }}
        />
      )}

      <div
        className={`flex items-center py-1 cursor-pointer group  ${
          isSelected ? "text-green-500" : ""
        }`}
        onClick={handleClick}
      >
        <button
          onClick={toggleExpand}
          className={`w-5 h-5 flex items-center justify-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 ${
            !hasChildren ? "invisible" : ""
          }`}
          aria-label={expanded ? "Collapse" : "Expand"}
        >
          {expanded ? (
            <ChevronDown size={16} strokeWidth={1.5} />
          ) : (
            <ChevronRight size={16} strokeWidth={1.5} />
          )}
        </button>

        <div className="flex items-center ml-1 text-sm w-full justify-between pr-2">
          <div className="flex items-center">
            <span className="mr-1.5">{getNodeIcon()}</span>

            <span
              className={`group-hover:underline truncate ${
                isSelected
                  ? "text-green-500"
                  : "text-gray-700 dark:text-gray-200"
              }`}
              style={{ maxWidth: "160px" }}
            >
              {isRoot ? filename : object.name || object.type}
            </span>
          </div>

          {object instanceof Mesh && (
            <span className="text-[10px] text-muted-foreground">
              {(
                object.geometry.attributes.position?.count || 0
              ).toLocaleString()}{" "}
              verts
            </span>
          )}
        </div>
      </div>

      {expanded && hasChildren && (
        <ul className="pl-4 ml-2 ">
          {object.children.map((child, index) => (
            <SceneNode
              key={`${child.uuid}-${index}`}
              object={child}
              level={level + 1}
              isLast={index === object.children.length - 1}
            />
          ))}
        </ul>
      )}
    </li>
  );
}
