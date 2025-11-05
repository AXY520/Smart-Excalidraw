/**
 * System prompt for generating Excalidraw diagrams
 */

export const SYSTEM_PROMPT = `## 任务

根据用户的需求，基于 ExcalidrawElementSkeleton API 的规范，合理运用**绑定（Binding）、容器（Containment）、组合（Grouping）与框架（Framing）**等核心机制来绘制出结构清晰、布局优美、信息传达高效的 Excalidraw 图像。

## 输入

用户需求，可能是一个指令，也可能是一篇文章，或者是一张需要分析和转换的图片。

## 输出

基于 ExcalidrawElementSkeleton 的 JSON 代码。

### 输出约束
除了json代码外，不要输出任何其他内容。

## 图片处理特殊说明

如果输入包含图片，请：
1. 仔细分析图片中的视觉元素、文字、结构和关系
2. 识别图表类型（流程图、思维导图、组织架构、数据图表等）
3. 提取关键信息和逻辑关系
4. 将图片内容准确转换为Excalidraw格式
5. 保持原始设计的意图和信息完整性

## 执行步骤

### 步骤1：需求分析
- 理解并分析用户的需求，如果是一个简单的指令，首先根据指令创作一篇文章。
- 针对用户输入的文章或你创作的文章，仔细阅读并理解文章的整体结构和逻辑。

### 步骤2：可视化创作
- 针对文章，提取关键概念、数据或流程，设计清晰的视觉呈现方案。
- 使用 Excalidraw 代码绘制图像

## 最佳实践提醒

### Excalidraw 代码规范
- **箭头/连线**：箭头或连线必须双向链接到对应的元素上（也即需要绑定 id），大部分情况下，应该是起点和终点链接的元素的边缘的中间位置
- **坐标规划**：预先规划布局，避免元素重叠
- **间距充分**：确保元素之间的间距足够大，应**大于 800px**
- **尺寸一致性**：同类型元素保持相似尺寸，建立视觉节奏

### 内容准确性
- 严格遵循原文内容，不添加原文未提及的信息
- 保留所有关键细节、数据和论点,并保持原文的逻辑关系和因果链条

### 可视化质量
- 图像需具备独立的信息传达能力,图文结合，用视觉语言解释抽象概念
- 适合科普教育场景，降低理解门槛

## 视觉风格指南
- **风格定位**: 科学教育、专业严谨、清晰简洁
- **文字辅助**: 包含必要的文字标注和说明
- **色彩方案**: 使用 2-4 种主色，保持视觉统一
- **留白原则**: 保持适当留白，避免视觉拥挤


## ExcalidrawElementSkeleton 元素与属性

以下为 ExcalidrawElementSkeleton 的必填/可选属性，生成的实际元素由系统自动补全。

### 1) 矩形/椭圆/菱形（rectangle / ellipse / diamond）
- **必填**：\`type\`, \`x\`, \`y\`
- **可选**：\`width\`, \`height\`, \`strokeColor\`, \`backgroundColor\`, \`strokeWidth\`, \`strokeStyle\` (solid|dashed|dotted), \`fillStyle\` (hachure|solid|zigzag|cross-hatch), \`roughness\`, \`opacity\`, \`angle\` (旋转角度), \`roundness\` (圆角), \`locked\`, \`link\`
- **文本容器**：提供 \`label.text\` 即可。若未提供 \`width/height\`，会依据标签文本自动计算容器尺寸。
  - label 可选属性：\`fontSize\`, \`fontFamily\`, \`strokeColor\`, \`textAlign\` (left|center|right), \`verticalAlign\` (top|middle|bottom)

### 2) 文本（text）
- **必填**：\`type\`, \`x\`, \`y\`, \`text\`
- **自动**：\`width\`, \`height\` 由测量自动计算（不要手动提供）
- **可选**：\`fontSize\`, \`fontFamily\` (1|2|3), \`strokeColor\` (文本颜色), \`opacity\`, \`angle\`, \`textAlign\` (left|center|right), \`verticalAlign\` (top|middle|bottom)

### 3) 线（line）
- **必填**：\`type\`, \`x\`, \`y\`
- **可选**：\`width\`, \`height\`（默认 100×0），\`strokeColor\`, \`strokeWidth\`, \`strokeStyle\`, \`polygon\` (是否闭合)
- **说明**：line 不支持 \`start/end\` 绑定；\`points\` 始终由系统生成。

### 4) 箭头（arrow）
- **必填**：\`type\`, \`x\`, \`y\`
- **可选**：\`width\`, \`height\`（默认 100×0），\`strokeColor\`, \`strokeWidth\`, \`strokeStyle\`, \`elbowed\` (肘形箭头)
- **箭头头部**：\`startArrowhead\`/\`endArrowhead\` 可选值：arrow, bar, circle, circle_outline, triangle, triangle_outline, diamond, diamond_outline（默认 end=arrow，start 无）
- **绑定**（仅 arrow 支持）：\`start\`/\`end\` 可选；若提供，必须包含 \`type\` 或 \`id\` 之一
  - 通过 \`type\` 自动创建：支持 rectangle/ellipse/diamond/text（text 需 \`text\`）
  - 通过 \`id\` 绑定已有元素
  - 可选提供 x/y/width/height，未提供时按箭头位置自动推断
- **标签**：可提供 \`label.text\` 为箭头添加标签
- **禁止**：不要传 \`points\`（系统根据 width/height 自动生成并归一化）

### 5) 自由绘制（freedraw）
- **必填**：\`type\`, \`x\`, \`y\`
- **可选**：\`strokeColor\`, \`strokeWidth\`, \`opacity\`
- **说明**：\`points\` 由系统生成，用于手绘风格线条。

### 6) 图片（image）
- **必填**：\`type\`, \`x\`, \`y\`, \`fileId\`
- **可选**：\`width\`, \`height\`, \`scale\` (翻转), \`crop\` (裁剪), \`angle\`, \`locked\`, \`link\`

### 7) 框架（frame）
- **必填**：\`type\`, \`children\`（元素 id 列表）
- **可选**：\`x\`, \`y\`, \`width\`, \`height\`, \`name\`
- **说明**：若未提供坐标/尺寸，系统会依据 children 自动计算，并包含 10px 内边距。

### 8) 通用属性
- **分组**：使用 \`groupIds\` 数组将多个元素组合在一起
- **锁定**：\`locked: true\` 防止元素被编辑
- **链接**：\`link\` 为元素添加超链接

## 高质量 ExcalidrawElementSkeleton 用例

### 1) 基础形状
\`\`\`json
{
  "type": "rectangle",
  "x": 100,
  "y": 200,
  "width": 180,
  "height": 80,
  "backgroundColor": "#e3f2fd",
  "strokeColor": "#1976d2"
}
\`\`\`

### 2) 文本（自动测量尺寸）
\`\`\`json
{
  "type": "text",
  "x": 100,
  "y": 100,
  "text": "标题文本",
  "fontSize": 20
}
\`\`\`

### 3) 文本容器（容器尺寸自动基于标签文本）
\`\`\`json
{
  "type": "rectangle",
  "x": 100,
  "y": 150,
  "label": { "text": "项目管理", "fontSize": 18 },
  "backgroundColor": "#e8f5e9"
}
\`\`\`

### 4) 箭头 + 标签 + 自动创建绑定
\`\`\`json
{
  "type": "arrow",
  "x": 255,
  "y": 239,
  "label": { "text": "影响" },
  "start": { "type": "rectangle" },
  "end": { "type": "ellipse" },
  "strokeColor": "#2e7d32"
}
\`\`\`

### 5) 线/箭头（附加属性）
\`\`\`json
[
  { "type": "arrow", "x": 450, "y": 20, "startArrowhead": "dot", "endArrowhead": "triangle", "strokeColor": "#1971c2", "strokeWidth": 2 },
  { "type": "line", "x": 450, "y": 60, "strokeColor": "#2f9e44", "strokeWidth": 2, "strokeStyle": "dotted" }
]
\`\`\`

### 6) 文本容器（高级排版）
\`\`\`json
[
  { "type": "diamond", "x": -120, "y": 100, "width": 270, "backgroundColor": "#fff3bf", "strokeWidth": 2, "label": { "text": "STYLED DIAMOND TEXT CONTAINER", "strokeColor": "#099268", "fontSize": 20 } },
  { "type": "rectangle", "x": 180, "y": 150, "width": 200, "strokeColor": "#c2255c", "label": { "text": "TOP LEFT ALIGNED RECTANGLE TEXT CONTAINER", "textAlign": "left", "verticalAlign": "top", "fontSize": 20 } },
  { "type": "ellipse", "x": 400, "y": 130, "strokeColor": "#f08c00", "backgroundColor": "#ffec99", "width": 200, "label": { "text": "STYLED ELLIPSE TEXT CONTAINER", "strokeColor": "#c2255c" } }
]
\`\`\`

### 7) 箭头绑定文本端点（通过 type）
\`\`\`json
{
  "type": "arrow",
  "x": 255,
  "y": 239,
  "start": { "type": "text", "text": "HEYYYYY" },
  "end": { "type": "text", "text": "WHATS UP ?" }
}
\`\`\`

### 8) 通过 id 绑定已有元素
\`\`\`json
[
  { "type": "ellipse", "id": "ellipse-1", "strokeColor": "#66a80f", "x": 390, "y": 356, "width": 150, "height": 150, "backgroundColor": "#d8f5a2" },
  { "type": "diamond", "id": "diamond-1", "strokeColor": "#9c36b5", "width": 100, "x": -30, "y": 380 },
  { "type": "arrow", "x": 100, "y": 440, "width": 295, "height": 35, "strokeColor": "#1864ab", "start": { "type": "rectangle", "width": 150, "height": 150 }, "end": { "id": "ellipse-1" } },
  { "type": "arrow", "x": 60, "y": 420, "width": 330, "strokeColor": "#e67700", "start": { "id": "diamond-1" }, "end": { "id": "ellipse-1" } }
]
\`\`\`

### 9) 框架（children 必填；坐标/尺寸可自动计算）
\`\`\`json
[
  { "type": "rectangle", "id": "rect-1", "x": 10, "y": 10 },
  { "type": "diamond", "id": "diamond-1", "x": 120, "y": 20 },
  { "type": "frame", "children": ["rect-1", "diamond-1"], "name": "功能模块组" }
]
\`\`\`
`;

// Chart type display names mapping
// Only includes chart types that have corresponding visual specifications
const CHART_TYPE_NAMES = {
  auto: '自动',
  flowchart: '流程图',
  mindmap: '思维导图',
  orgchart: '组织架构图',
  sequence: '时序图',
  class: 'UML类图',
  er: 'ER图',
  gantt: '甘特图',
  timeline: '时间线',
  tree: '树形图',
  network: '网络拓扑图',
  architecture: '架构图',
  dataflow: '数据流图',
  state: '状态图',
  swimlane: '泳道图',
  concept: '概念图',
  fishbone: '鱼骨图',
  swot: 'SWOT分析图',
  pyramid: '金字塔图',
  funnel: '漏斗图',
  venn: '韦恩图',
  matrix: '矩阵图',
  infographic: '信息图',
};

// Visual specifications for different chart types
const CHART_VISUAL_SPECS = {
  flowchart: `
### 流程图视觉规范
- **形状约定**：开始/结束用 ellipse，处理步骤用 rectangle，判断用 diamond
- **连接**：使用 arrow 连接各节点，箭头需绑定到元素
- **布局**：自上而下或从左到右的流向，保持清晰的流程方向
- **色彩**：使用蓝色系作为主色调，决策点可用橙色突出`,

  mindmap: `
### 思维导图视觉规范
- **结构**：中心主题用 ellipse，分支用 rectangle
- **层级**：通过尺寸和颜色深浅体现层级关系
- **布局**：放射状布局，主分支均匀分布在中心周围
- **色彩**：每个主分支使用不同色系，便于区分主题`,

  orgchart: `
### 组织架构图视觉规范
- **形状**：统一使用 rectangle 表示人员或职位
- **层级**：通过颜色深浅和尺寸体现职级高低
- **布局**：严格的树形层级结构，自上而下
- **连接**：使用 arrow 垂直向下连接上下级关系`,

  sequence: `
### 时序图视觉规范
- **参与者**：顶部使用 rectangle 表示各参与者
- **生命线**：使用虚线 line 从参与者向下延伸
- **消息**：使用 arrow 表示消息传递，label 标注消息内容
- **布局**：参与者横向排列，消息按时间从上到下`,

  class: `
### UML类图视觉规范
- **类**：使用 rectangle 分三部分（类名、属性、方法）
- **关系**：继承用空心三角箭头，关联用普通箭头，聚合/组合用菱形箭头
- **布局**：父类在上，子类在下，相关类横向排列`,

  er: `
### ER图视觉规范
- **实体**：使用 rectangle 表示实体
- **属性**：使用 ellipse 表示属性，主键可用特殊样式标识
- **关系**：使用 diamond 表示关系，用 arrow 连接
- **基数**：在连接线上标注关系基数（1, N, M等）`,

  gantt: `
### 甘特图视觉规范
- **时间轴**：顶部标注时间刻度
- **任务条**：使用 rectangle 表示任务，长度表示时间跨度
- **状态**：用不同颜色区分任务状态（未开始、进行中、已完成）
- **布局**：任务纵向排列，时间横向展开`,

  timeline: `
### 时间线视觉规范
- **主轴**：使用 line 作为时间主轴
- **节点**：使用 ellipse 标记时间节点
- **事件**：使用 rectangle 展示事件内容
- **布局**：时间轴居中，事件卡片交错分布在两侧`,

  tree: `
### 树形图视觉规范
- **节点**：根节点用 ellipse，其他节点用 rectangle
- **层级**：通过颜色渐变体现层级深度
- **连接**：使用 arrow 从父节点指向子节点
- **布局**：根节点在顶部，子节点均匀分布`,

  network: `
### 网络拓扑图视觉规范
- **设备**：不同设备类型使用不同形状（rectangle、ellipse、diamond）
- **层级**：通过颜色和尺寸区分设备重要性
- **连接**：使用 line 表示网络连接，线宽可表示带宽
- **布局**：核心设备居中，其他设备按层级或功能分组`,

  architecture: `
### 架构图视觉规范
- **分层**：使用 frame 区分不同层级（表示层、业务层、数据层等）
- **组件**：使用 rectangle 表示组件或服务
- **连接**：只会有同层级内的连接，不同层级不需要连接，实线表示同步调用，虚线表示异步调用
- **布局**：分层布局，自上而下`,

  dataflow: `
### 数据流图视觉规范
- **实体**：外部实体用 rectangle，处理过程用 ellipse
- **存储**：数据存储用特殊样式的 rectangle
- **数据流**：使用 arrow 表示数据流向，label 标注数据名称
- **布局**：外部实体在边缘，处理过程居中`,

  state: `
### 状态图视觉规范
- **状态**：使用 rectangle 带圆角表示状态
- **初始/终止**：初始状态用实心圆，终止状态用双圆圈
- **转换**：使用 arrow 表示状态转换，label 标注触发条件
- **布局**：按状态转换的逻辑流程排列`,

  swimlane: `
### 泳道图视觉规范
- **泳道**：使用 frame 划分泳道，每个泳道代表一个角色或部门
- **活动**：使用 rectangle 表示活动，diamond 表示决策
- **流程**：使用 arrow 连接活动，可跨越泳道
- **布局**：泳道平行排列，活动按时间顺序排列`,

  concept: `
### 概念图视觉规范
- **概念**：核心概念用 ellipse，其他概念用 rectangle
- **关系**：使用 arrow 连接概念，label 标注关系类型
- **层级**：通过尺寸和颜色体现概念的重要性
- **布局**：核心概念居中，相关概念围绕分布`,

  fishbone: `
### 鱼骨图视觉规范
- **主干**：使用粗 arrow 作为主干，指向问题或结果
- **分支**：使用 arrow 作为分支，斜向连接到主干
- **分类**：主要分支使用不同颜色区分类别
- **布局**：从左到右，分支交替分布在主干上下`,

  swot: `
### SWOT分析图视觉规范
- **四象限**：使用 frame 或 rectangle 创建四个象限
- **分类**：优势(S)、劣势(W)、机会(O)、威胁(T) 使用不同颜色
- **内容**：每个象限内列出相关要点
- **布局**：2x2 矩阵布局，四个象限等大`,

  pyramid: `
### 金字塔图视觉规范
- **层级**：使用 rectangle 表示各层，宽度从上到下递增
- **颜色**：使用渐变色体现层级关系
- **布局**：垂直居中对齐，形成金字塔形状`,

  funnel: `
### 漏斗图视觉规范
- **层级**：使用 rectangle 表示各阶段，宽度从上到下递减
- **数据**：标注每层的数量或百分比
- **颜色**：使用渐变色表示转化过程
- **布局**：垂直居中，形成漏斗形状`,

  venn: `
### 韦恩图视觉规范
- **集合**：使用 ellipse 表示集合，部分重叠
- **颜色**：使用半透明背景色，交集区域颜色自然混合
- **标签**：标注集合名称和元素
- **布局**：圆形适当重叠，形成明显的交集区域`,

  matrix: `
### 矩阵图视觉规范
- **网格**：使用 rectangle 创建行列网格
- **表头**：使用深色背景区分表头
- **数据**：单元格可用颜色深浅表示数值大小
- **布局**：规整的矩阵结构，行列对齐`,

  infographic: `
### 信息图视觉规范
- **模块化**：使用 frame 和 rectangle 创建独立的信息模块
- **视觉层次**：通过尺寸、颜色和位置建立清晰的信息层次
- **数据可视化**：包含图表、图标、数字等视觉元素
- **色彩丰富**：使用多种颜色区分不同信息模块，保持视觉吸引力
- **图文结合**：文本与图形元素紧密结合，提高信息传达效率
- **布局灵活**：可根据内容需要采用网格、卡片或自由布局`,

};

/**
 * Generate user prompt based on input and chart type
 * @param {string} userInput - User's input/requirements
 * @param {string} chartType - Chart type (default: 'auto')
 * @returns {string} Complete user prompt
 */
export const USER_PROMPT_TEMPLATE = (userInput, chartType = 'auto') => {
  const promptParts = [];

  // Handle chart type specification
  if (chartType && chartType !== 'auto') {
    const chartTypeName = CHART_TYPE_NAMES[chartType];

    // Only proceed if the chart type is valid and has a display name
    if (chartTypeName) {
      // Add chart type instruction
      promptParts.push(`请创建一个${chartTypeName}类型的 Excalidraw 图表。`);

      // Add visual specifications if available
      const visualSpec = CHART_VISUAL_SPECS[chartType];
      if (visualSpec) {
        promptParts.push(visualSpec.trim());
        promptParts.push(
          `请严格遵循以上视觉规范来设计图表，确保：\n` +
          `- 使用规范中指定的形状类型和颜色\n` +
          `- 遵循规范中的布局要求\n` +
          `- 应用规范中的样式属性（strokeWidth、fontSize等）\n` +
          `- 保持视觉一致性和专业性`
        );
      }
    }
  } else {
    // Auto mode: let AI decide the best visualization
    promptParts.push(
      '请根据用户需求，智能选择最合适的一种或多种图表类型来呈现信息。并绘制 Excalidraw 图像。\n\n' +
      '## 可选图表类型\n' +
      '- **流程图 (flowchart)**：适合展示流程、步骤、决策逻辑\n' +
      '- **思维导图 (mindmap)**：适合展示概念关系、知识结构、头脑风暴\n' +
      '- **组织架构图 (orgchart)**：适合展示组织结构、层级关系\n' +
      '- **时序图 (sequence)**：适合展示系统交互、消息传递、时间顺序\n' +
      '- **UML类图 (class)**：适合展示类结构、继承关系、面向对象设计\n' +
      '- **ER图 (er)**：适合展示数据库实体关系、数据模型\n' +
      '- **甘特图 (gantt)**：适合展示项目进度、任务时间安排\n' +
      '- **时间线 (timeline)**：适合展示历史事件、发展历程\n' +
      '- **树形图 (tree)**：适合展示层级结构、分类关系\n' +
      '- **网络拓扑图 (network)**：适合展示网络结构、节点连接\n' +
      '- **架构图 (architecture)**：适合展示系统架构、技术栈、分层设计\n' +
      '- **数据流图 (dataflow)**：适合展示数据流转、处理过程\n' +
      '- **状态图 (state)**：适合展示状态转换、生命周期\n' +
      '- **泳道图 (swimlane)**：适合展示跨部门流程、职责划分\n' +
      '- **概念图 (concept)**：适合展示概念关系、知识图谱\n' +
      '- **鱼骨图 (fishbone)**：适合展示因果分析、问题根源\n' +
      '- **SWOT分析图 (swot)**：适合展示优劣势分析、战略规划\n' +
      '- **金字塔图 (pyramid)**：适合展示层级结构、优先级\n' +
      '- **漏斗图 (funnel)**：适合展示转化流程、筛选过程\n' +
      '- **韦恩图 (venn)**：适合展示集合关系、交集并集\n' +
      '- **矩阵图 (matrix)**：适合展示多维对比、关系矩阵\n' +
      '- **信息图 (infographic)**：适合展示数据可视化、信息展示、创意图表\n' +
      '## 选择指南\n' +
      '1. 分析用户需求的核心内容和目标\n' +
      '2. 选择最能清晰表达信息的图表类型（可以是一种或多种组合）\n' +
      '3. 如果选择了特定图表类型，请严格遵循该类型的视觉规范\n' +
      '4. 确保图表能够独立传达信息，布局清晰美观'
    );
  }

  // Add user input
  promptParts.push(`用户需求：\n${userInput}`);

  // Join all parts with double newlines for better readability
  return promptParts.join('\n\n');
};

