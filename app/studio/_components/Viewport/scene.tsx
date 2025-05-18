import React from "react";
import { useModelStore } from "../../store/modelStore";

const Scene = () => {
  return <Model />;
};

export default Scene;

function Model() {
  const objects = useModelStore((state) => state.objects);

  return (
    <>
      {objects.map((object, index) => {
        return <primitive key={index} object={object} />;
      })}
    </>
  );
}
