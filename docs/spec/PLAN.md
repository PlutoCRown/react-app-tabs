# React-App-Tabs
这是一个面向移动端、0样式的Tabs组件
他提供完全自定义的样式、内置的嵌套滑动手势管理、完全动态的配置

```tsx
// 完全自定义的Item结构
type TabItem<T> = T
type Key = string | number
// Tabs组件的参数
type Props<T> = {
    // 数据
    tabs: TabItem<T>[]
    keyExtractor: (tab:TabItem<T>) => Key
    // 渲染这一块
    TabBarRenderer: (tab:TabItem<T>) => React.ReactNode
    TabPanelRenderer: (tab:TabItem<T>) => React.ReactNode
    TabBarClassName?: string // 控制 样式
    TabBarStyle?: CSSProperties
    // 回调(参数还没定)
    onSwipe?: () => void
    onChange?: () => undefined | boolean
    onAfterChange?: () => void
    // 其他
    defaultIndex?: number 
    activeIndex?: number // 受控，需要搭配onChange使用
    // 配置
    swipable?: boolean // 是否可滑动
    fit?: 'container' | 'content' = 'container'
    direction?: 'bottom' | 'left' | 'right' | 'top' = 'bottom'
    lazyLoadDistance?: number = 3;
}

// 大致实现：如果会导致子组件不应该的刷新，你可以更改里面的字段
type ReactAppTabsContext = {
    layer: number
    activeIndex: number
    getConfig: () => TabItem<any>
    getPrevLayer: () => ReactAppTabsContext
}

```

# 开发
这是一个 npm 包
使用 bun 作为包管理器
你需要实现 src / example / README.md 这几部分

## 实现
1. 你需要实现Tabs组件，按照上面提供的Props类型
2. Tab支持滑动，但是只在Panel层监听 [touce/mouse][down/up] 事件。move事件挂在document，并且只有一个
3. Tab中有一个内置的Context，提供的数据类型如上面所示。使得Tab知道自己在哪个层级中
   1. 当Tab知道自己在哪后，优先相应子Panel的swipe，此时外层Panel就不要响应滑动。


## 测试
> 只在测试的包里安装React
构建一个3层的Tabs
- 第一层是底部4个Tab，name=[Blue,Red,Green,Yellow]
- Blue Panel 里面渲染 一个顶部Tab，name=[Sky,Cyan,Purple] 默认选择Cyan
- Cyan Panel 里面渲染 一个顶部Tab, name=[随机生成10个]

- 上面没提到的Panel 都直接渲染一个div，内容是中心渐变，从某颜色到透明，height/width 都 100%
- 所有Tab支持滑动