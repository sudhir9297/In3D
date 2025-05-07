import { ArchiveX, File, Inbox, Send, Trash2 } from "lucide-react";
import React from "react";

const RightSideBar = () => {
  const data = [
    {
      title: "Inbox",
      url: "#",
      icon: Inbox,
    },
    {
      title: "Drafts",
      url: "#",
      icon: File,
      isActive: false,
    },
    {
      title: "Sent",
      url: "#",
      icon: Send,
    },
    {
      title: "Junk",
      url: "#",
      icon: ArchiveX,
    },
    {
      title: "Trash",
      url: "#",
      icon: Trash2,
    },
  ];

  return (
    <div className="border-b md:border-l md:h-full">
      <div className="flex  md:flex-col gap-2 p-1">
        {data.map((item) => (
          <a
            key={item.title}
            href={item.url}
            className="flex items-center gap-2 p-2"
          >
            <item.icon size={20} />
          </a>
        ))}
      </div>
    </div>
  );
};

export default RightSideBar;
