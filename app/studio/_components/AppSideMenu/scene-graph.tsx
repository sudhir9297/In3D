"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Material, Mesh, Object3D, Group } from "three";
import {
  ArrowDown01Icon,
  ArrowRight01Icon,
  BoundingBoxIcon,
  CircleIcon,
  ColorPickerIcon,
  Folder01Icon,
  FolderOpenIcon,
  Layers01Icon,
} from "@hugeicons/core-free-icons";
import { AnimatePresence } from "motion/react";

import { Icon } from "@/components/ui/huge-icon";

import { useModelStore } from "../../store/modelStore";

const OUTLINE_GUTTER = 8;

function collectNodeIds(object: Object3D, ids: Set<string>) {
  ids.add(object.uuid);
  object.children.forEach((child) => collectNodeIds(child, ids));
}

function isDescendantOf(node: Object3D, ancestor: Object3D) {
  let current = node.parent;

  while (current) {
    if (current === ancestor) {
      return true;
    }
    current = current.parent;
  }

  return false;
}

type VisibilityOptions = {
  horizontalAlign?: "nearest" | "start";
};

const SceneGraph = () => {
  const { objects, selectedObject, setSelectedObject } = useModelStore();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef(new Map<string, HTMLLIElement>());
  const pendingCollapseRef = useRef<{
    nodeId: string;
    resetLeft: boolean;
  } | null>(null);

  const rootIds = useMemo(() => objects.map((object) => object.uuid), [objects]);
  const allNodeIds = useMemo(() => {
    const ids = new Set<string>();
    objects.forEach((object) => collectNodeIds(object, ids));
    return ids;
  }, [objects]);

  const [expandedIds, setExpandedIds] = useState<Set<string>>(
    () => new Set(rootIds),
  );

  const registerRowRef = useCallback(
    (nodeId: string) => (node: HTMLLIElement | null) => {
      if (node) {
        rowRefs.current.set(nodeId, node);
        return;
      }

      rowRefs.current.delete(nodeId);
    },
    [],
  );

  const ensureRowVisible = useCallback(
    (nodeId: string, options: VisibilityOptions = {}) => {
      const row = rowRefs.current.get(nodeId);
      const scrollContainer = scrollContainerRef.current;

      if (!row || !scrollContainer) {
        return;
      }

      const horizontalAlign = options.horizontalAlign ?? "nearest";
      const containerRect = scrollContainer.getBoundingClientRect();
      const rowRect = row.getBoundingClientRect();
      const rowTop =
        rowRect.top - containerRect.top + scrollContainer.scrollTop;
      const rowBottom = rowTop + rowRect.height;
      const rowLeft =
        rowRect.left - containerRect.left + scrollContainer.scrollLeft;
      const rowRight = rowLeft + rowRect.width;

      let nextTop = scrollContainer.scrollTop;
      let nextLeft = scrollContainer.scrollLeft;

      if (rowTop < nextTop) {
        nextTop = Math.max(0, rowTop - OUTLINE_GUTTER);
      } else if (rowBottom > nextTop + scrollContainer.clientHeight) {
        nextTop = Math.max(
          0,
          rowBottom - scrollContainer.clientHeight + OUTLINE_GUTTER,
        );
      }

      if (horizontalAlign === "start") {
        nextLeft = Math.max(0, rowLeft - OUTLINE_GUTTER);
      } else if (rowLeft < nextLeft) {
        nextLeft = Math.max(0, rowLeft - OUTLINE_GUTTER);
      } else if (rowRight > nextLeft + scrollContainer.clientWidth) {
        nextLeft = Math.max(
          0,
          rowRight - scrollContainer.clientWidth + OUTLINE_GUTTER,
        );
      }

      if (
        nextTop !== scrollContainer.scrollTop ||
        nextLeft !== scrollContainer.scrollLeft
      ) {
        scrollContainer.scrollTo({
          top: nextTop,
          left: nextLeft,
          behavior: "auto",
        });
      }
    },
    [],
  );

  useEffect(() => {
    setExpandedIds((previous) => {
      const next = new Set<string>();

      previous.forEach((nodeId) => {
        if (allNodeIds.has(nodeId)) {
          next.add(nodeId);
        }
      });

      rootIds.forEach((rootId) => next.add(rootId));

      return next;
    });
  }, [allNodeIds, rootIds]);

  useEffect(() => {
    if (!selectedObject || allNodeIds.has(selectedObject.uuid)) {
      return;
    }

    setSelectedObject(null);
  }, [allNodeIds, selectedObject, setSelectedObject]);

  useEffect(() => {
    if (!selectedObject) {
      return;
    }

    ensureRowVisible(selectedObject.uuid);
  }, [ensureRowVisible, selectedObject]);

  useEffect(() => {
    const pendingCollapse = pendingCollapseRef.current;

    if (!pendingCollapse) {
      return;
    }

    pendingCollapseRef.current = null;

    if (pendingCollapse.resetLeft && scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft = 0;
      ensureRowVisible(pendingCollapse.nodeId, { horizontalAlign: "start" });
      return;
    }

    ensureRowVisible(pendingCollapse.nodeId);
  }, [ensureRowVisible, expandedIds]);

  const handleSelect = useCallback(
    (object: Object3D) => {
      setSelectedObject(object);
      ensureRowVisible(object.uuid);
    },
    [ensureRowVisible, setSelectedObject],
  );

  const handleToggle = useCallback(
    (object: Object3D, isRoot = false) => {
      const nodeId = object.uuid;
      const isExpanded = expandedIds.has(nodeId);

      if (!isExpanded) {
        setExpandedIds((previous) => {
          const next = new Set(previous);
          next.add(nodeId);
          return next;
        });
        return;
      }

      if (selectedObject && isDescendantOf(selectedObject, object)) {
        setSelectedObject(object);
      }

      pendingCollapseRef.current = {
        nodeId,
        resetLeft: isRoot,
      };

      setExpandedIds((previous) => {
        const next = new Set(previous);
        next.delete(nodeId);
        return next;
      });
    },
    [expandedIds, selectedObject, setSelectedObject],
  );

  if (objects.length === 0) {
    return (
      <div className="p-6 text-center">
        <p className="mb-2 font-medium">No models In the Scene</p>
        <p className="mt-4 text-muted-foreground">
          Drag and drop 3D model files to view their scene graph.
        </p>
      </div>
    );
  }

  return (
    <div ref={scrollContainerRef} className="h-full overflow-auto px-2 pb-4">
      <div className="inline-block min-w-full w-max align-top">
        {objects.map((object) => (
          <ul key={object.uuid}>
            <SceneNode
              expandedIds={expandedIds}
              filename={object.userData?.fileName}
              isLast={false}
              isRoot
              level={0}
              object={object}
              onSelect={handleSelect}
              onToggle={handleToggle}
              registerRowRef={registerRowRef}
              selectedObject={selectedObject}
            />
          </ul>
        ))}
      </div>
    </div>
  );
};

export default SceneGraph;

interface SceneNodeProps {
  expandedIds: Set<string>;
  filename?: string;
  isLast: boolean;
  isRoot?: boolean;
  level: number;
  object: Object3D;
  onSelect: (object: Object3D) => void;
  onToggle: (object: Object3D, isRoot?: boolean) => void;
  registerRowRef: (nodeId: string) => (node: HTMLLIElement | null) => void;
  selectedObject: Object3D | null;
}

function SceneNode({
  expandedIds,
  filename,
  isLast,
  isRoot,
  level,
  object,
  onSelect,
  onToggle,
  registerRowRef,
  selectedObject,
}: SceneNodeProps) {
  const isExpanded = expandedIds.has(object.uuid);
  const hasChildren = object.children.length > 0;
  const isSelected = selectedObject === object;

  const getNodeIcon = (isOpen: boolean, isActive: boolean) => {
    if (isRoot || object instanceof Group) {
      return (
        <AnimatePresence mode="wait">
          {isOpen ? (
            <Icon icon={FolderOpenIcon} className="h-4 w-4" />
          ) : (
            <Icon icon={Folder01Icon} className="h-4 w-4" />
          )}
        </AnimatePresence>
      );
    }

    if (object instanceof Mesh) {
      return (
        <AnimatePresence mode="wait">
          {isActive ? (
            <Icon icon={BoundingBoxIcon} className="h-4 w-4" />
          ) : (
            <Icon icon={CircleIcon} className="h-4 w-4" />
          )}
        </AnimatePresence>
      );
    }

    if (object instanceof Material) {
      return <Icon icon={ColorPickerIcon} className="h-4 w-4" />;
    }

    return <Icon icon={Layers01Icon} className="h-4 w-4" />;
  };

  return (
    <li ref={registerRowRef(object.uuid)} className="relative w-max">
      {level > 0 ? (
        <div
          className="absolute left-[-16px] top-0 w-px bg-border"
          style={{
            height: isLast && !hasChildren ? "16px" : "100%",
          }}
        />
      ) : null}

      {level > 0 ? (
        <div
          className="absolute h-px bg-border"
          style={{
            left: "-16px",
            top: "16px",
            width: "16px",
          }}
        />
      ) : null}

      <div
        className={`inline-flex items-center rounded-md ${
          isSelected ? "bg-accent text-chart-2" : ""
        }`}
      >
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onToggle(object, isRoot);
          }}
          className={`flex h-5 w-5 items-center justify-center text-muted-foreground ${
            hasChildren ? "" : "invisible"
          }`}
          aria-label={isExpanded ? "Collapse" : "Expand"}
        >
          {isExpanded ? (
            <Icon icon={ArrowDown01Icon} size={16} />
          ) : (
            <Icon icon={ArrowRight01Icon} size={16} />
          )}
        </button>

        <button
          type="button"
          onClick={() => onSelect(object)}
          className={`flex min-w-max items-center rounded-md px-2 py-1 text-sm hover:bg-accent ${
            isSelected ? "text-chart-2" : "text-foreground"
          }`}
        >
          <span className="mr-1.5">{getNodeIcon(isExpanded, isSelected)}</span>
          <span className="whitespace-nowrap">
            {isRoot ? filename : object.name || object.type}
          </span>
        </button>
      </div>

      {isExpanded && hasChildren ? (
        <ul className="ml-4 pl-4">
          {object.children.map((child, index) => (
            <SceneNode
              key={child.uuid}
              expandedIds={expandedIds}
              isLast={index === object.children.length - 1}
              level={level + 1}
              object={child}
              onSelect={onSelect}
              onToggle={onToggle}
              registerRowRef={registerRowRef}
              selectedObject={selectedObject}
            />
          ))}
        </ul>
      ) : null}
    </li>
  );
}
