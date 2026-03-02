import React from "react";
import { TabInnerScroll } from "../../../src";
import styles from "../index.module.css";

export type ThirdLevelTab = {
  id: string;
  name: string;
  title: string;
  color: string;
  Render: React.ComponentType<{ color: string }>;
};

function docPanelStyle(color: string) {
  return {
    background: `linear-gradient(145deg, ${color}21 0%, #ffffff 46%, ${color}12 100%)`,
  } as const;
}

function InlineCode({ children }: { children: React.ReactNode }) {
  return <code className={styles.cyanInlineCode}>{children}</code>;
}

function CodeSnippet({ text }: { text: string }) {
  return (
    <TabInnerScroll
      direction="horizontal"
      className={styles.cyanCodeBlock}
      as="pre"
    >
      {text}
    </TabInnerScroll>
  );
}

function storyCard(title: string, body: React.ReactNode) {
  return (
    <div className={styles.cyanStoryCard}>
      <h4 className={styles.cyanStoryTitle}>{title}</h4>
      <p className={styles.cyanParagraph}>{body}</p>
    </div>
  );
}

function CyanPanelIntro({ color }: { color: string }) {
  return (
    <div className={styles.cyanPanel} style={docPanelStyle(color)}>
      <div className={styles.cyanHero}>
        <div className={styles.cyanKicker}>MOBILE GESTURE CORE</div>
        <h2 className={styles.cyanDocTitle}>react-app-tabs</h2>
        <p className={styles.cyanLead}>
          这个库处理手势分配。多层页面、横向切换、内部滚动容器并存时，手势会按层级和边界状态流转。
        </p>
      </div>
      <div className={styles.cyanQuote}>
        <span className={styles.cyanQuoteMark}>👋</span>
        <p className={styles.cyanQuoteText}>
          试试向左向右滑动可以切换不同层级的Tab!
        </p>
      </div>
      <section className={styles.cyanSection}>
        <h3 className={styles.cyanSectionTitle}>这个库解决的问题</h3>
        <div className={styles.cyanStoryGrid}>
          {storyCard(
            "嵌套滑动切换",
            "支持多层标签页的横向滑动手势，子层级滑到底才交给父层级，切换体验更自然。",
          )}
          {storyCard(
            "滚动冲突",
            "自动判断滚动边界，防止内部滚动和外部标签切换手势的冲突，确保操作顺畅。",
          )}
          {storyCard(
            "移动端优先",
            "针对移动端交互优化，手势流转逻辑简洁，兼容多种触控场景。",
          )}
        </div>
      </section>
    </div>
  );
}

function CyanPanelBasicTabBar({ color }: { color: string }) {
  return (
    <div className={styles.cyanPanel} style={docPanelStyle(color)}>
      <div className={styles.cyanHeroMini}>
        <div className={styles.cyanKicker}>STEP 01</div>
        <h2 className={styles.cyanDocTitle}>Tabs 接入</h2>
        <p className={styles.cyanLeadMini}>
          起步配置：<InlineCode>TabBarItemRenderer</InlineCode>
          {" + "}
          <InlineCode>TabBarClassName</InlineCode>。
        </p>
      </div>

      <section className={styles.cyanSection}>
        <p className={styles.cyanParagraph}>
          这个方案适合统一结构的标签栏。你只写 item
          的渲染，组件处理状态、切换、过渡。
        </p>
        <figure className={styles.cyanCodeFigure}>
          <figcaption className={styles.cyanCodeCaption}>起步版本</figcaption>
          <CodeSnippet
            text={`<Tabs
  tabs={tabs}
  keyExtractor={(tab) => tab.id}
  TabBarClassName={styles.tabBar}
  TabBarItemRenderer={(tab, meta) => (
    <button
      type="button"
      onClick={meta.onClick}
      style={{ opacity: meta.active ? 1 : 0.58 }}
    >
      {tab.title}
    </button>
  )}
  TabPanelRenderer={(tab) => <Panel tab={tab} />}
/>`}
          />
          <div className={styles.cyanCodeLang}>tsx</div>
        </figure>
      </section>
    </div>
  );
}

function CyanPanelCustomTabBar({ color }: { color: string }) {
  return (
    <div className={styles.cyanPanel} style={docPanelStyle(color)}>
      <div className={styles.cyanHeroMini}>
        <div className={styles.cyanKicker}>STEP 02</div>
        <h2 className={styles.cyanDocTitle}>完全自定义 TabBar</h2>
        <p className={styles.cyanLeadMini}>
          需要复合头部时，使用 <InlineCode>TabBarRenderer</InlineCode>。
        </p>
      </div>

      <section className={styles.cyanSection}>
        <p className={styles.cyanParagraph}>
          这里可以控制整条 Bar：标题、角标、右侧操作区、分层动画都能加入。
        </p>
        <figure className={styles.cyanCodeFigure}>
          <figcaption className={styles.cyanCodeCaption}>
            带 extra 区域的结构
          </figcaption>
          <CodeSnippet
            text={`<Tabs
  tabs={tabs}
  keyExtractor={(tab) => tab.id}
  TabBarRenderer={(meta) => (
    <div className={styles.customBar}>
      <div className={styles.items}>{/* 滚动标签区 */}</div>
      <div className={styles.extra}>Release Notes</div>
    </div>
  )}
  TabPanelRenderer={(tab) => <Panel tab={tab} />}
/>`}
          />
          <div className={styles.cyanCodeLang}>tsx</div>
        </figure>
      </section>

      <section className={styles.cyanSection}>
        <h3 className={styles.cyanSectionTitle}>0 刷新动画更新</h3>
        <p className={styles.cyanParagraph}>
          <InlineCode>meta.callback.onSwipe</InlineCode>
          {" / "}
          <InlineCode>onChange</InlineCode>
          可以直接驱动 DOM
          动画，不需要额外刷新状态。指示线、进度片段都能跟手势移动。
        </p>
        <p className={styles.cyanTip}>
          可以点击上面的Purple栏，再滑动回当前页面
          <br />
          观察 <b>无React刷新</b>的动画线
        </p>
      </section>

      <section className={styles.cyanSection}>
        <h3 className={styles.cyanSectionTitle}>TabBar 自动滚动到视口</h3>
        <p className={styles.cyanTip}>
          👉 继续往右划两下，观察⬆ TabBar 的滚动。
        </p>
        <p className={styles.cyanParagraph}>
          自定义 TabBar 时，可以在激活项变化后把目标按钮滚到可见范围。示例里使用
          <InlineCode>ensureItemVisible</InlineCode>
          处理。
        </p>
        <figure className={styles.cyanCodeFigure}>
          <figcaption className={styles.cyanCodeCaption}>
            示例：activeIndex 变化时滚动到当前项
          </figcaption>
          <CodeSnippet
            text={`const barRef = useRef<HTMLDivElement | null>(null);\nconst itemRefs = useRef<Array<HTMLButtonElement | null>>([]);\n\nuseEffect(() => {\n  ensureItemVisible(barRef.current, itemRefs.current[activeIndex] ?? null);\n}, [activeIndex]);\n\n<TabInnerScroll\n  ref={barRef}\n  direction=\"horizontal\"\n  className={styles.secondLevelItemsScroller}\n>\n  {meta.items.map((item) => (\n    <button\n      key={item.key}\n      ref={(node) => {\n        itemRefs.current[item.index] = node;\n      }}\n      onClick={item.onClick}\n    >\n      {item.tab.name}\n    </button>\n  ))}\n</TabInnerScroll>`}
          />
          <div className={styles.cyanCodeLang}>tsx</div>
        </figure>
      </section>
    </div>
  );
}

function CyanPanelInnerScroll({ color }: { color: string }) {
  return (
    <div className={styles.cyanPanel} style={docPanelStyle(color)}>
      <div className={styles.cyanHeroMini}>
        <div className={styles.cyanKicker}>STEP 03</div>
        <h2 className={styles.cyanDocTitle}>TabInnerScroll</h2>
        <p className={styles.cyanLeadMini}>
          用法接近 <InlineCode>div</InlineCode>，同时处理滚动边界和手势交接。
        </p>
        <p className={styles.cyanTip}>
          ⬆ 试试手动拖动上面TabBar 滚动，他没滚到头不会触发Panel滚动。
        </p>
      </div>

      <section className={styles.cyanSection}>
        <p className={styles.cyanParagraph}>
          把横向或纵向滚动区域包进来即可，不需要改业务结构。
        </p>
        <figure className={styles.cyanCodeFigure}>
          <figcaption className={styles.cyanCodeCaption}>
            把滚动容器替换成 TabInnerScroll
          </figcaption>
          <CodeSnippet
            text={`<TabInnerScroll direction="horizontal" className={styles.barScroller}>
  {items.map((item) => (
    <button key={item.key} onClick={item.onClick}>
      {item.tab.title}
    </button>
  ))}
</TabInnerScroll>`}
          />
          <div className={styles.cyanCodeLang}>tsx</div>
        </figure>
      </section>

      <section className={styles.cyanSection}>
        <h3 className={styles.cyanSectionTitle}>参数说明</h3>
        <div className={styles.cyanStoryGrid}>
          {storyCard("as", "默认是 div ,可以改变 DOM 元素")}
          {storyCard(
            "stopPropagation",
            "默认为false, true: 永远不允许在此组件内滑动到外部面板",
          )}
          {storyCard("其他参数", "与 div 相同 ")}
        </div>
      </section>
      <section className={styles.cyanSection}>
        <h3 className={styles.cyanSectionTitle}>冲突处理流程</h3>
        <div className={styles.cyanStoryGrid}>
          {storyCard("还能滚", "先交给内部容器。")}
          {storyCard("到边界", "再把控制权交给外层 Tabs。")}
          {storyCard("连续手势", "滚动和切页在一次动作里连上。")}
        </div>
      </section>
    </div>
  );
}

function CyanPanelOtherProps({ color }: { color: string }) {
  return (
    <div className={styles.cyanPanel} style={docPanelStyle(color)}>
      <div className={styles.cyanHeroMini}>
        <div className={styles.cyanKicker}>STEP 04</div>
        <h2 className={styles.cyanDocTitle}>其他参数</h2>
      </div>

      <section className={styles.cyanSection}>
        <div className={styles.cyanPropGrid}>
          <div className={styles.cyanPropItem}>
            <div className={styles.cyanPropKey}>fit</div>
            <p className={styles.cyanParagraph}>
              <InlineCode>container</InlineCode> 让内容跟容器拉满，
              <InlineCode>content</InlineCode> 保持内容天然尺寸。
            </p>
          </div>
          <div className={styles.cyanPropItem}>
            <div className={styles.cyanPropKey}>duration</div>
            <p className={styles.cyanParagraph}>控制滑动切换过渡时间</p>
          </div>
          <div className={styles.cyanPropItem}>
            <div className={styles.cyanPropKey}>swtichDuration</div>
            <p className={styles.cyanParagraph}>
              控制点击TabBar后的切换过渡时间
            </p>
          </div>
          <div className={styles.cyanPropItem}>
            <div className={styles.cyanPropKey}>direction</div>
            <p className={styles.cyanParagraph}>
              控制 Bar 位置与排布：
              <InlineCode>top / bottom / left / right</InlineCode>。
            </p>
          </div>
        </div>

        <figure className={styles.cyanCodeFigure}>
          <figcaption className={styles.cyanCodeCaption}>参数示例</figcaption>
          <CodeSnippet
            text={`<Tabs
  fit="container"
  direction="top"
  duration={280}
  swipable
  lazyLoadDistance={2}
  ...
/>`}
          />
          <div className={styles.cyanCodeLang}>tsx</div>
        </figure>
      </section>
    </div>
  );
}

function CyanPanelFinal({ color }: { color: string }) {
  return (
    <div className={styles.cyanPanel} style={docPanelStyle(color)}>
      <div className={styles.cyanHero}>
        <div className={styles.cyanKicker}>FINAL</div>
        <h2 className={styles.cyanDocTitle}>继续滑动做验收</h2>
        <p className={styles.cyanLead}>
          再向左或向右滑动几次，重点看嵌套层和边界位置的交接是否连贯。
        </p>
      </div>

      <section className={styles.cyanSection}>
        <h3 className={styles.cyanSectionTitle}>回到 GitHub</h3>
        <p className={styles.cyanParagraph}>
          项目主页：
          <a
            className={styles.cyanAnchor}
            href="https://github.com/plutocrown/react-app-tabs"
            target="_blank"
            rel="noreferrer"
          >
            https://github.com/plutocrown/react-app-tabs
          </a>
        </p>
      </section>

      <p className={styles.cyanFooter}>
        继续左右滑动，体验跨层 Tab 的接管与交接。
      </p>
    </div>
  );
}

export const thirdLevelTabs: ThirdLevelTab[] = [
  {
    id: "cyan-1",
    name: "Cyan-1",
    title: "欢迎",
    color: "#00d5d5",
    Render: CyanPanelIntro,
  },
  {
    id: "cyan-2",
    name: "Cyan-2",
    title: "基础用法",
    color: "#4bc7ff",
    Render: CyanPanelBasicTabBar,
  },
  {
    id: "cyan-3",
    name: "Cyan-3",
    title: "自定义状态栏",
    color: "#7d9dff",
    Render: CyanPanelCustomTabBar,
  },
  {
    id: "cyan-4",
    name: "Cyan-4",
    title: "处理内部滚动",
    color: "#8a79ff",
    Render: CyanPanelInnerScroll,
  },
  {
    id: "cyan-5",
    name: "Cyan-5",
    title: "其他参数",
    color: "#48c88f",
    Render: CyanPanelOtherProps,
  },
  {
    id: "cyan-6",
    name: "Cyan-6",
    title: "最后一页",
    color: "#ff9f62",
    Render: CyanPanelFinal,
  },
];

export function gradientPanel(color: string, label: string) {
  return (
    <div
      className={styles.gradientPanel}
      style={{
        background: `radial-gradient(circle at 50% 30%, ${color}, transparent 72%)`,
      }}
    >
      <div className={styles.gradientLabel}>{label}</div>
    </div>
  );
}
