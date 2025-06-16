import React from "react";
import { Toolbar } from "../Viewport/toolbar";

const LeftSideBar = () => {
  return (
    <div className="absolute border  left-0 top-0 bg-white z-50 h-full py-2 pl-2">
      <Toolbar />
      hello
    </div>
  );
};

export default LeftSideBar;
