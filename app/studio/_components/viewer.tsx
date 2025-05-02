import React from "react";

export const ViewerWrapper = () => {
  return (
    <div className="w-full h-full">
      <div
        className="h-full w-full"
        style={{
          backgroundImage:
            "radial-gradient(circle, #d9d9d9 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      ></div>
    </div>
  );
};
