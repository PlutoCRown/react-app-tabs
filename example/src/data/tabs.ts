export type ColorTab = {
  id: string;
  name: string;
  color: string;
};

export const levelOneTabs: ColorTab[] = [
  { id: 'blue', name: '使用教程', color: '#0a66ff' },
  { id: 'red', name: '一些测试', color: '#f5365c' },
  { id: 'green', name: '凑数的', color: '#27ae60' },
  { id: 'yellow', name: '正常来说是4个', color: '#f6c445' },
];

export const levelTwoTabs: ColorTab[] = [
  { id: 'sky', name: 'Sky', color: '#55c3ff' },
  { id: 'cyan', name: 'Cyan', color: '#00d5d5' },
  { id: 'purple', name: 'Purple', color: '#7a6bff' },
  { id: 'midnight', name: 'Midnight', color: '#191970' },
];
