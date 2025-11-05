# excalidraw 箭头相关位置计算逻辑梳理

## 变量说明
- `startEle` - 起点绑定的元素
- `endEle` - 终点绑定的元素
- `arrow` - 箭头元素

## 属性和计算公式
- 箭头起点x = `arrow.x`
- 箭头起点y = `arrow.y`
- 箭头终点x = `arrow.x + arrow.width`
- 箭头终点y = `arrow.y + arrow.height`

## 核心计算逻辑

### 距离变量定义
```javascript
const dx = startX - endX;  // 或 endX - startX (取决于计算哪个元素)
const dy = startY - endY;  // 或 endY - startY (取决于计算哪个元素)
const absDx = Math.abs(dx);
const absDy = Math.abs(dy);
```

### 边缘中点计算公式
- **左边缘中点**: `{ x: element.x, y: element.y + element.height / 2 }`
- **右边缘中点**: `{ x: element.x + element.width, y: element.y + element.height / 2 }`
- **上边缘中点**: `{ x: element.x + element.width / 2, y: element.y }`
- **下边缘中点**: `{ x: element.x + element.width / 2, y: element.y + element.height }`

---

## 如何确定箭头起点坐标
箭头起点坐标的位置应为 `startEle` 的边缘的中点位置。

### 计算 startEle 的边缘选择逻辑
通过比较 `startEle` 和 `endEle` 的相对位置，以及横向距离和纵向距离的大小关系，确定应该使用 `startEle` 的哪条边缘：

```javascript
const dx = startX - endX;
const dy = startY - endY;
const absDx = Math.abs(dx);
const absDy = Math.abs(dy);
```

#### 特殊情况：水平对齐 (dy === 0)
```javascript
if (dy === 0) {
  if (dx < 0) {
    // startEle 在 endEle 正左方 → 右边缘
    return { x: startX + startWidth, y: startY + startHeight / 2 };
  } else if (dx > 0) {
    // startEle 在 endEle 正右方 → 左边缘
    return { x: startX, y: startY + startHeight / 2 };
  }
}
```

#### 特殊情况：垂直对齐 (dx === 0)
```javascript
if (dx === 0) {
  if (dy < 0) {
    // startEle 在 endEle 正上方 → 下边缘
    return { x: startX + startWidth / 2, y: startY + startHeight };
  } else if (dy > 0) {
    // startEle 在 endEle 正下方 → 上边缘
    return { x: startX + startWidth / 2, y: startY };
  }
}
```

#### 一般情况：startEle 在 endEle 的左上方
```javascript
if (dx < 0 && dy < 0) {
  if (absDx > absDy) {
    // 右边缘
    return { x: startX + startWidth, y: startY + startHeight / 2 };
  } else {
    // 下边缘
    return { x: startX + startWidth / 2, y: startY + startHeight };
  }
}
```

#### 一般情况：startEle 在 endEle 的右上方
```javascript
if (dx > 0 && dy < 0) {
  if (absDx > absDy) {
    // 左边缘
    return { x: startX, y: startY + startHeight / 2 };
  } else {
    // 下边缘
    return { x: startX + startWidth / 2, y: startY + startHeight };
  }
}
```

#### 一般情况：startEle 在 endEle 的左下方
```javascript
if (dx < 0 && dy > 0) {
  if (absDx > absDy) {
    // 右边缘
    return { x: startX + startWidth, y: startY + startHeight / 2 };
  } else {
    // 上边缘
    return { x: startX + startWidth / 2, y: startY };
  }
}
```

#### 一般情况：startEle 在 endEle 的右下方
```javascript
if (dx > 0 && dy > 0) {
  if (absDx > absDy) {
    // 左边缘
    return { x: startX, y: startY + startHeight / 2 };
  } else {
    // 上边缘
    return { x: startX + startWidth / 2, y: startY };
  }
}
```

---

## 如何确定箭头终点坐标
箭头终点坐标的位置应为 `endEle` 的边缘的中点位置。

### 计算 endEle 的边缘选择逻辑
通过比较 `endEle` 和 `startEle` 的相对位置，以及横向距离和纵向距离的大小关系，确定应该使用 `endEle` 的哪条边缘：

```javascript
const dx = endX - startX;
const dy = endY - startY;
const absDx = Math.abs(dx);
const absDy = Math.abs(dy);
```

#### 特殊情况：水平对齐 (dy === 0)
```javascript
if (dy === 0) {
  if (dx < 0) {
    // endEle 在 startEle 正左方 → 右边缘
    return { x: endX + endWidth, y: endY + endHeight / 2 };
  } else if (dx > 0) {
    // endEle 在 startEle 正右方 → 左边缘
    return { x: endX, y: endY + endHeight / 2 };
  }
}
```

#### 特殊情况：垂直对齐 (dx === 0)
```javascript
if (dx === 0) {
  if (dy < 0) {
    // endEle 在 startEle 正上方 → 下边缘
    return { x: endX + endWidth / 2, y: endY + endHeight };
  } else if (dy > 0) {
    // endEle 在 startEle 正下方 → 上边缘
    return { x: endX + endWidth / 2, y: endY };
  }
}
```

#### 一般情况：endEle 在 startEle 的左上方
```javascript
if (dx < 0 && dy < 0) {
  if (absDx > absDy) {
    // 右边缘
    return { x: endX + endWidth, y: endY + endHeight / 2 };
  } else {
    // 下边缘
    return { x: endX + endWidth / 2, y: endY + endHeight };
  }
}
```

#### 一般情况：endEle 在 startEle 的右上方
```javascript
if (dx > 0 && dy < 0) {
  if (absDx > absDy) {
    // 左边缘
    return { x: endX, y: endY + endHeight / 2 };
  } else {
    // 下边缘
    return { x: endX + endWidth / 2, y: endY + endHeight };
  }
}
```

#### 一般情况：endEle 在 startEle 的左下方
```javascript
if (dx < 0 && dy > 0) {
  if (absDx > absDy) {
    // 右边缘
    return { x: endX + endWidth, y: endY + endHeight / 2 };
  } else {
    // 上边缘
    return { x: endX + endWidth / 2, y: endY };
  }
}
```

#### 一般情况：endEle 在 startEle 的右下方
```javascript
if (dx > 0 && dy > 0) {
  if (absDx > absDy) {
    // 左边缘
    return { x: endX, y: endY + endHeight / 2 };
  } else {
    // 上边缘
    return { x: endX + endWidth / 2, y: endY };
  }
}
```

---

## 最终箭头坐标计算

```javascript
// 1. 计算起点边缘中点
const startEdgeCenter = getStartEdgeCenter(startEle, endEle);
arrow.x = startEdgeCenter.x;
arrow.y = startEdgeCenter.y;

// 2. 计算终点边缘中点
const endEdgeCenter = getEndEdgeCenter(endEle, startEle);
arrow.width = endEdgeCenter.x - startEdgeCenter.x;
arrow.height = endEdgeCenter.y - startEdgeCenter.y;

// 3. 修复 Excalidraw 渲染 bug：宽度为 0 时设为 1
if (arrow.width === 0) {
  arrow.width = 1;
}
```

## 实现位置
完整实现见：`lib/optimizeArrows.js`
