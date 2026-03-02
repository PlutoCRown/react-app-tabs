import React from "react";
import Guide1 from "./guide1";
import Guide2 from "./guide2";
import Guide3 from "./guide3";
import Guide4 from "./guide4";
import Guide5 from "./guide5";
import Guide6 from "./guide6";

export type GuideTab = {
  id: string;
  name: string;
  title: string;
  color: string;
  Render: React.ComponentType<{ color: string }>;
};

export const guideTabs: GuideTab[] = [
  {
    id: "guide-1",
    name: "Guide-1",
    title: "欢迎",
    color: "#00d5d5",
    Render: Guide1,
  },
  {
    id: "guide-2",
    name: "Guide-2",
    title: "基础用法",
    color: "#4bc7ff",
    Render: Guide2,
  },
  {
    id: "guide-3",
    name: "Guide-3",
    title: "自定义TabBar",
    color: "#7d9dff",
    Render: Guide3,
  },
  {
    id: "guide-4",
    name: "Guide-4",
    title: "内部滚动",
    color: "#8a79ff",
    Render: Guide4,
  },
  {
    id: "guide-5",
    name: "Guide-5",
    title: "其他参数",
    color: "#48c88f",
    Render: Guide5,
  },
  {
    id: "guide-6",
    name: "Guide-6",
    title: "最后一页",
    color: "#ff9f62",
    Render: Guide6,
  },
];
