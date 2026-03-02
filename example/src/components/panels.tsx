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
  return <span className={styles.cyanInlineCode}>{children}</span>;
}

function CodeSnippet({ text }: { text: string }) {
  return (
    <TabInnerScroll direction="horizontal" className={styles.cyanCodeBlock}>
      {text}
    </TabInnerScroll>
  );
}

function storyCard(title: string, body: string) {
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

      <div className={styles.cyanDocIntro}>
        <p className={styles.cyanParagraph}>
          这是一份可滑动文档。直接向左或向右滑动，就能感受交互链路。
        </p>
        <p className={styles.cyanParagraph}>
          每一页都对应一个使用场景，读完后可以直接落到项目里。
        </p>
      </div>

      <section className={styles.cyanSection}>
        <h3 className={styles.cyanSectionTitle}>这个库处理的问题</h3>
        <div className={styles.cyanStoryGrid}>
          {storyCard("误触切页", "用户想滚动内容，却触发了外层切页。")}
          {storyCard("边界断层", "内层滚动到边缘后，交接不顺，拖拽会发涩。")}
          {storyCard("层级混乱", "同一个动作在不同层表现不一致，预期被打断。")}
        </div>
      </section>

      <p className={styles.cyanFooter}>继续滑动进入 Tabs 接入页。</p>
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

      <div className={styles.cyanQuote}>
        <span className={styles.cyanQuoteMark}>“</span>
        <p className={styles.cyanQuoteText}>
          先把交互跑通，再按业务风格补视觉。
        </p>
      </div>
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
        <p className={styles.cyanTip}>这套方式适合高频交互的顶部导航。</p>
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
        <h2 className={styles.cyanDocTitle}>属性与调参</h2>
        <p className={styles.cyanLeadMini}>
          <InlineCode>fit</InlineCode>、<InlineCode>duration</InlineCode>、
          <InlineCode>direction</InlineCode> 会直接影响切换手感。
        </p>
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
            <p className={styles.cyanParagraph}>控制松手后的吸附速度。</p>
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
    title: "其他选项",
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
