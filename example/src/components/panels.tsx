import React from 'react';
import styles from '../index.module.css';

export type ThirdLevelTab = {
  id: string;
  name: string;
  title: string;
  color: string;
  Render: React.ComponentType<{ color: string }>;
};

function CyanPanelWelcome({ color }: { color: string }) {
  const panelStyle = {
    background: `linear-gradient(140deg, ${color}22, #ffffff 44%, ${color}14 100%)`,
  } as const;

  return (
    <div className={styles.cyanPanel} style={panelStyle}>
      <h2 className={styles.cyanDocTitle}>欢迎</h2>
      <div className={styles.cyanDocIntro}>
        <p className={styles.cyanParagraph}>
          React App Tabs 是一个面向移动端交互的 Tabs 容器。它解决的问题不是简单的“点击切换”，而是多层嵌套场景下，内部滚动与外部切页之间的手势冲突。
        </p>
        <p className={styles.cyanParagraph}>
          这套组件默认不提供重视觉样式，核心是提供稳定的交互能力。你可以按自己的设计系统去渲染 TabBar、Panel 和内容区，但手势与切换逻辑保持一致。
        </p>
      </div>

      <section className={styles.cyanSection}>
        <h3 className={styles.cyanSectionTitle}>能力边界</h3>
        <p className={styles.cyanParagraph}>
          Tabs 负责状态和切换，TabInnerScroll 负责内部滚动优先。两者组合后，既能处理横向面板切换，也能处理 Bar 或内容区的横向/纵向原生滚动。
        </p>
        <ul className={styles.cyanPoints}>
          <li className={styles.cyanPoint}>移动端优先：围绕 touch 体验和边界手感设计。</li>
          <li className={styles.cyanPoint}>无样式内核：视觉外观完全由业务控制。</li>
          <li className={styles.cyanPoint}>可扩展：支持多层嵌套与完整自定义 TabBar。</li>
        </ul>
      </section>

      <section className={styles.cyanSection}>
        <h3 className={styles.cyanSectionTitle}>最小接入示例</h3>
        <p className={styles.cyanParagraph}>
          建议先跑通最小闭环，再逐步加入定制 Bar 与嵌套滚动。这样你可以把“行为正确性”与“视觉定制”分两步验证。
        </p>
        <figure className={styles.cyanCodeFigure}>
          <figcaption className={styles.cyanCodeCaption}>最小 Tabs 使用方式</figcaption>
          <pre className={styles.cyanCodeBlock}>
            <code>{`const tabs = [{ id: 'home', title: '首页' }, { id: 'doc', title: '文档' }];\n\n<Tabs\n  tabs={tabs}\n  activeIndex={active}\n  keyExtractor={(item) => item.id}\n  onChange={(next) => {\n    setActive(next);\n    return true;\n  }}\n  TabPanelRenderer={(item) => <Page tab={item} />}\n/>`}</code>
          </pre>
          <div className={styles.cyanCodeLang}>tsx</div>
        </figure>
      </section>

      <p className={styles.cyanFooter}>继续左滑查看“两个组件”，了解 Tabs 和 TabInnerScroll 的职责分工。</p>
    </div>
  );
}

function CyanPanelComponents({ color }: { color: string }) {
  const panelStyle = {
    background: `linear-gradient(140deg, ${color}22, #ffffff 44%, ${color}14 100%)`,
  } as const;

  return (
    <div className={styles.cyanPanel} style={panelStyle}>
      <h2 className={styles.cyanDocTitle}>两个组件</h2>
      <div className={styles.cyanDocIntro}>
        <p className={styles.cyanParagraph}>
          这个库的核心只有两个组件：Tabs 和 TabInnerScroll。组件数少，但每个组件职责明确，便于在复杂场景里排查问题。
        </p>
      </div>

      <section className={styles.cyanSection}>
        <h3 className={styles.cyanSectionTitle}>Tabs: 管理“页”的状态与过渡</h3>
        <p className={styles.cyanParagraph}>
          Tabs 接收 activeIndex 并驱动 panelTrack transform。拖动过程中是实时位移预览；松手后会根据阈值和目标页应用 transition，过渡结束再触发 onAfterChange。
        </p>
        <p className={styles.cyanParagraph}>
          它还通过 direction 和 fit 参数控制布局行为，支持上下左右四向结构，也支持容器填充与内容自适应两种尺寸策略。
        </p>
        <ul className={styles.cyanPoints}>
          <li className={styles.cyanPoint}>`duration` 控制松手后的过渡时长，默认 300ms。</li>
          <li className={styles.cyanPoint}>`onChange` 决定是否接受目标索引。</li>
          <li className={styles.cyanPoint}>`onAfterChange` 在过渡完成后触发，更适合埋点与联动。</li>
        </ul>
      </section>

      <section className={styles.cyanSection}>
        <h3 className={styles.cyanSectionTitle}>TabInnerScroll: 管理“内部先滚动”</h3>
        <p className={styles.cyanParagraph}>
          TabInnerScroll 会把自己注册到 gesture manager。只要内部在当前方向还有滚动空间，就优先消费手势；到边界后再把机会交给外层 Tabs。
        </p>
        <figure className={styles.cyanCodeFigure}>
          <figcaption className={styles.cyanCodeCaption}>二级/三级 TabBar 推荐包裹方式</figcaption>
          <pre className={styles.cyanCodeBlock}>
            <code>{`<TabInnerScroll direction=\"horizontal\" className={styles.barScroller}>\n  {items.map((item) => (\n    <button key={item.key} onClick={item.onClick}>\n      {item.tab.title}\n    </button>\n  ))}\n</TabInnerScroll>`}</code>
          </pre>
          <div className={styles.cyanCodeLang}>tsx</div>
        </figure>
        <p className={styles.cyanTip}>这能避免“用户想拖动 Bar，但外层 Panel 先动了”的误触问题。</p>
      </section>
    </div>
  );
}

function CyanPanelNestedScroll({ color }: { color: string }) {
  const panelStyle = {
    background: `linear-gradient(140deg, ${color}22, #ffffff 44%, ${color}14 100%)`,
  } as const;

  return (
    <div className={styles.cyanPanel} style={panelStyle}>
      <h2 className={styles.cyanDocTitle}>嵌套滚动</h2>
      <div className={styles.cyanDocIntro}>
        <p className={styles.cyanParagraph}>
          嵌套滚动的关键不是“绑更多事件”，而是“把接管决策做成可解释流程”。当前实现里，gesture manager 负责统一收集候选并决策 owner。
        </p>
      </div>

      <section className={styles.cyanSection}>
        <h3 className={styles.cyanSectionTitle}>决策与复用</h3>
        <p className={styles.cyanParagraph}>
          在一次手势会话中，owner 一旦确认，不会在每一帧都重算。这样可以避免触发源在边界附近来回跳变，造成“卡顿感”或方向错乱。
        </p>
        <p className={styles.cyanParagraph}>
          当 owner 认为自己已经到边界时，会通过回调通知 manager 触发重选。重选后，下一个最合适的容器接管剩余手势。
        </p>
        <figure className={styles.cyanCodeFigure}>
          <figcaption className={styles.cyanCodeCaption}>owner 重选的核心思路</figcaption>
          <pre className={styles.cyanCodeBlock}>
            <code>{`if (!session.owner) {\n  session.owner = pickOwner(session.candidates, gesture);\n}\n\nsession.owner.onMove(gesture, () => {\n  session.owner = pickOwner(session.candidates, gesture);\n});`}</code>
          </pre>
          <div className={styles.cyanCodeLang}>ts</div>
        </figure>
      </section>

      <section className={styles.cyanSection}>
        <h3 className={styles.cyanSectionTitle}>调试方式</h3>
        <p className={styles.cyanParagraph}>
          为 Tabs 与 TabInnerScroll 配置 `__test_name`，可以在控制台观察完整接管链路，例如“Bar_3 拒绝，Tab_3 接管”等，这比只看最终结果更容易定位问题。
        </p>
        <ul className={styles.cyanPoints}>
          <li className={styles.cyanPoint}>确认候选是否完成注册。</li>
          <li className={styles.cyanPoint}>确认可滚动判定是否基于实时 scrollLeft/scrollTop。</li>
          <li className={styles.cyanPoint}>确认边界回调是否正确触发重选。</li>
        </ul>
      </section>
    </div>
  );
}

function CyanPanelTabBar({ color }: { color: string }) {
  const panelStyle = {
    background: `linear-gradient(140deg, ${color}22, #ffffff 44%, ${color}14 100%)`,
  } as const;

  return (
    <div className={styles.cyanPanel} style={panelStyle}>
      <h2 className={styles.cyanDocTitle}>TabBar</h2>
      <div className={styles.cyanDocIntro}>
        <p className={styles.cyanParagraph}>
          TabBar 有两种渲染模式：`TabBarItemRenderer` 与 `TabBarRenderer`。它们不是替代关系，而是复杂度分层。简单头部用前者，复合头部用后者。
        </p>
      </div>

      <section className={styles.cyanSection}>
        <h3 className={styles.cyanSectionTitle}>TabBarItemRenderer</h3>
        <p className={styles.cyanParagraph}>
          ItemRenderer 按 item 渲染，适合统一结构。现在组件不会再强绑 button DOM，交互节点由你自己决定。第二参数会给到 onClick 与 active。
        </p>
        <figure className={styles.cyanCodeFigure}>
          <figcaption className={styles.cyanCodeCaption}>ItemRenderer 的推荐写法</figcaption>
          <pre className={styles.cyanCodeBlock}>
            <code>{`TabBarItemRenderer={(tab, meta) => (\n  <div role=\"button\" onClick={meta.onClick} data-active={meta.active ? 'yes' : 'no'}>\n    {tab.title}\n  </div>\n)}`}</code>
          </pre>
          <div className={styles.cyanCodeLang}>tsx</div>
        </figure>
      </section>

      <section className={styles.cyanSection}>
        <h3 className={styles.cyanSectionTitle}>TabBarRenderer</h3>
        <p className={styles.cyanParagraph}>
          当你需要“左侧可滚动标签 + 右侧固定标题”这种布局时，直接用 TabBarRenderer 接管整条 bar。示例里的二级 Tab 已经采用这种方式。
        </p>
        <p className={styles.cyanTip}>只要你提供 TabBarRenderer，TabBarClassName/TabBarStyle/TabBarItemRenderer 就不再需要。</p>
      </section>
    </div>
  );
}

function CyanPanelSizeDirection({ color }: { color: string }) {
  const panelStyle = {
    background: `linear-gradient(140deg, ${color}22, #ffffff 44%, ${color}14 100%)`,
  } as const;

  return (
    <div className={styles.cyanPanel} style={panelStyle}>
      <h2 className={styles.cyanDocTitle}>大小和方向</h2>
      <div className={styles.cyanDocIntro}>
        <p className={styles.cyanParagraph}>
          `direction` 和 `fit` 共同决定了布局行为。你之前已经把内部抽象成 fixedDir/flexDir，这个模型是正确的：fixedDir 永远 100%，fit 只影响 flexDir。
        </p>
      </div>

      <section className={styles.cyanSection}>
        <h3 className={styles.cyanSectionTitle}>direction</h3>
        <p className={styles.cyanParagraph}>
          top/bottom 场景下，Bar 与 Panel 纵向排列，横向切页；left/right 场景下，Bar 与 Panel 横向排列，纵向切页。方向变化不仅影响布局，也影响手势轴判定。
        </p>
      </section>

      <section className={styles.cyanSection}>
        <h3 className={styles.cyanSectionTitle}>fit</h3>
        <p className={styles.cyanParagraph}>
          fit=container 时，组件在 flexDir 上也会拉满 100%，让外部容器决定最终尺寸。fit=content 时，不强制 flexDir，由内部内容自然撑开。
        </p>
        <figure className={styles.cyanCodeFigure}>
          <figcaption className={styles.cyanCodeCaption}>你定义的尺寸策略（语义保持）</figcaption>
          <pre className={styles.cyanCodeBlock}>
            <code>{`const style: CSSProperties = { [fixedDir]: '100%' };\nif (fit === 'container') {\n  style[flexDir] = '100%';\n}`}</code>
          </pre>
          <div className={styles.cyanCodeLang}>ts</div>
        </figure>
      </section>
    </div>
  );
}

function CyanPanelFinal({ color }: { color: string }) {
  const panelStyle = {
    background: `linear-gradient(140deg, ${color}22, #ffffff 44%, ${color}14 100%)`,
  } as const;

  return (
    <div className={styles.cyanPanel} style={panelStyle}>
      <h2 className={styles.cyanDocTitle}>最后一页啦</h2>
      <div className={styles.cyanDocIntro}>
        <p className={styles.cyanParagraph}>
          这一页用于验收跨层滑动行为。你可以把它当成回归测试清单，重点关注“边界后交接”“反向先复位再回交”“过渡结束触发 onAfterChange”。
        </p>
      </div>

      <section className={styles.cyanSection}>
        <h3 className={styles.cyanSectionTitle}>建议验证步骤</h3>
        <ol className={styles.cyanOrderedList}>
          <li className={styles.cyanPoint}>从最后一页继续向左，确认可切到上一级 Tab。</li>
          <li className={styles.cyanPoint}>反向向右时，先观察外层是否复位，再交还内层滚动。</li>
          <li className={styles.cyanPoint}>在 Bar 区域拖动到边界，确认不会突兀跳变。</li>
          <li className={styles.cyanPoint}>检查 onAfterChange 触发时机是否在 transitionend 之后。</li>
        </ol>
      </section>

      <section className={styles.cyanSection}>
        <h3 className={styles.cyanSectionTitle}>上线建议</h3>
        <p className={styles.cyanParagraph}>
          在真机上做至少两轮验证：一轮关注交互正确性，一轮关注性能与稳定性。建议保留可切换的手势日志开关，便于线上问题复盘。
        </p>
        <p className={styles.cyanTip}>交互链路越复杂，可观察性就越重要。</p>
      </section>
    </div>
  );
}

export const thirdLevelTabs: ThirdLevelTab[] = [
  { id: 'cyan-1', name: 'Cyan-1', title: '欢迎', color: '#00d5d5', Render: CyanPanelWelcome },
  { id: 'cyan-2', name: 'Cyan-2', title: '两个组件', color: '#4bc7ff', Render: CyanPanelComponents },
  { id: 'cyan-3', name: 'Cyan-3', title: '嵌套滚动', color: '#7d9dff', Render: CyanPanelNestedScroll },
  { id: 'cyan-4', name: 'Cyan-4', title: 'TabBar', color: '#8a79ff', Render: CyanPanelTabBar },
  { id: 'cyan-5', name: 'Cyan-5', title: '大小和方向', color: '#48c88f', Render: CyanPanelSizeDirection },
  { id: 'cyan-6', name: 'Cyan-6', title: '最后一页啦', color: '#ff9f62', Render: CyanPanelFinal },
];

export function gradientPanel(color: string, label: string) {
  return (
    <div
      className={styles.gradientPanel}
      style={{ background: `radial-gradient(circle at 50% 30%, ${color}, transparent 72%)` }}
    >
      <div className={styles.gradientLabel}>{label}</div>
    </div>
  );
}
