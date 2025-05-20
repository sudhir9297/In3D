import React, { useState } from "react";
import { useModelStore } from "../../store/modelStore";
import { Material, Mesh, Object3D, Group } from "three";
import {
  Box,
  ChevronDown,
  ChevronRight,
  Eye,
  EyeOff,
  Folder,
  Globe,
  Layers,
  Palette,
  Pentagon,
} from "lucide-react";

const SceneGraph = () => {
  const { objects } = useModelStore();

  if (objects.length === 0) {
    return (
      <div className="p-6 text-center ">
        <p className="font-medium mb-2">No models In the Scene</p>
        <p className="mt-4  text-muted-foreground">
          Drag and drop 3D model files to view their scene graph.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {objects.map((object, index) => (
        <div
          key={`${object.userData?.fileName}-${index}`}
          className="border-b border-border  last:border-b-0"
        >
          <SceneNode
            object={object}
            level={0}
            isRoot
            modelIndex={index}
            filename={object.userData?.fileName}
          />
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
}

function SceneNode({ object, level, isRoot, filename }: SceneNodeProps) {
  const [expanded, setExpanded] = useState(isRoot);
  const hasChildren = object.children.length > 0;
  const indentation = level * 14;

  const toggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    setExpanded(!expanded);
  };

  const getNodeIcon = () => {
    if (isRoot) return <Globe className="w-4 h-4 " />;
    if (object instanceof Mesh)
      return <Box strokeWidth={1.5} className="w-4 h-4 text-primary" />;
    if (object instanceof Group)
      return <Folder className="w-4 h-4 text-green-500" />;
    if (object instanceof Material)
      return <Palette className="w-4 h-4 text-primary" />;
    return <Layers className="w-4 h-4 text-primary" />;
  };

  return (
    <div>
      <div
        className={
          "flex items-center py-1 px-2 rounded cursor-pointer transition-colors"
        }
        style={{ paddingLeft: `${indentation}px` }}
      >
        {hasChildren && (
          <button onClick={toggleExpand} className="px-0.5">
            {expanded ? (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            )}
          </button>
        )}
        {!hasChildren && <div className="w-5" />}

        {getNodeIcon()}

        <span className="ml-2 truncate text-sm">
          {isRoot ? filename : object.name || object.type}
        </span>

        {object instanceof Mesh && (
          <span className="ml-auto text-[10px] text-muted-foreground">
            {(object.geometry.attributes.position?.count || 0).toLocaleString()}{" "}
            verts
          </span>
        )}
      </div>
      {expanded && hasChildren && (
        <div>
          {object.children.map((child, index) => (
            <SceneNode
              key={`${child.uuid}-${index}`}
              object={child}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
