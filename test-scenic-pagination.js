const fs = require('fs');
const path = require('path');

console.log('=== 核心景观分页功能自动化测试 ===\n');

// 读取 HTML 文件
const htmlPath = path.join(__dirname, 'index.html');
let html;
try {
  html = fs.readFileSync(htmlPath, 'utf8');
  console.log('✓ 成功读取 index.html');
} catch(e) {
  console.log('✗ 无法读取 index.html:', e.message);
  process.exit(1);
}

// 测试1: 检查 scenicData 配置
console.log('\n--- 测试1: 检查 scenicData 配置 ---');
const scenicDataMatch = html.match(/var scenicData = \[([\s\S]*?)\];/);
if (!scenicDataMatch) {
  console.log('✗ 未找到 scenicData 定义');
  process.exit(1);
}
console.log('✓ 找到 scenicData 定义');

// 统计景点数量
const itemMatches = scenicDataMatch[0].match(/id:\s*'/g);
const scenicCount = itemMatches ? itemMatches.length : 0;
console.log(`✓ 找到 ${scenicCount} 个核心景观`);

if (scenicCount !== 10) {
  console.log(`⚠ 预期 10 个景观，实际找到 ${scenicCount} 个`);
}

// 测试2: 检查图片路径
console.log('\n--- 测试2: 检查图片路径 ---');
const imgRegex = /img:\s*'([^']+\.(jpg|png|jpeg))'/g;
let imgMatch;
const imgPaths = [];
while ((imgMatch = imgRegex.exec(scenicDataMatch[0])) !== null) {
  imgPaths.push(imgMatch[1]);
}

console.log(`✓ 找到 ${imgPaths.length} 个图片路径`);
let allImagesExist = true;
imgPaths.forEach(imgPath => {
  const fullPath = path.join(__dirname, imgPath);
  const exists = fs.existsSync(fullPath);
  if (!exists) {
    console.log(`✗ 图片不存在: ${imgPath}`);
    allImagesExist = false;
  }
});
if (allImagesExist) {
  console.log('✓ 所有图片文件都存在');
}

// 测试3: 检查 renderScenic 函数
console.log('\n--- 测试3: 检查 renderScenic 函数 ---');
const renderScenicMatch = html.match(/function renderScenic\(\)\s*\{[\s\S]*?pagination\.innerHTML/);
if (!renderScenicMatch) {
  console.log('✗ 未找到 renderScenic 函数');
} else {
  console.log('✓ 找到 renderScenic 函数');
  
  // 检查是否添加了 .visible 类
  if (renderScenicMatch[0].includes('classList.add(\'visible\')')) {
    console.log('✓ 函数中包含添加 .visible 类的逻辑');
  } else {
    console.log('✗ 函数中不包含添加 .visible 类的逻辑');
  }
  
  // 检查分页计算
  if (renderScenicMatch[0].includes('itemsPerPage') && renderScenicMatch[0].includes('totalPages')) {
    console.log('✓ 包含分页计算逻辑');
  } else {
    console.log('✗ 缺少分页计算逻辑');
  }
}

// 测试4: 检查 goToScenicPage 函数
console.log('\n--- 测试4: 检查 goToScenicPage 函数 ---');
if (html.includes('function goToScenicPage(page)')) {
  console.log('✓ 找到 goToScenicPage 函数');
  
  if (html.includes('AppState.scenicPage = page') && html.includes('renderScenic()')) {
    console.log('✓ 函数正确更新状态并调用 renderScenic()');
  } else {
    console.log('✗ 函数可能未正确更新状态或调用 renderScenic()');
  }
} else {
  console.log('✗ 未找到 goToScenicPage 函数');
}

// 测试5: 检查 CSS 动画类
console.log('\n--- 测试5: 检查 CSS 动画类 ---');
if (html.includes('.fade-up') && html.includes('.fade-up.visible')) {
  console.log('✓ 找到 .fade-up 和 .fade-up.visible 样式');
} else {
  console.log('✗ 未找到完整的 CSS 动画类定义');
}

// 测试6: 检查分页圆点点击事件
console.log('\n--- 测试6: 检查分页圆点 ---');
const dotMatches = html.match(/onclick="goToScenicPage\(\d+\)"/g);
if (dotMatches) {
  console.log(`✓ 找到 ${dotMatches.length} 个分页圆点点击事件`);
} else {
  console.log('⚠ 未找到分页圆点点击事件（可能在 JS 中动态生成）');
  
  if (html.includes('pagination-dot') && html.includes('onclick="goToScenicPage(')) {
    console.log('✓ JS 动态生成分页圆点');
  }
}

console.log('\n=== 测试完成 ===');
console.log('\n问题诊断:');
console.log('1. 如果所有测试通过，问题可能在浏览器运行时');
console.log('2. 建议添加 console.log 调试信息');
console.log('3. 检查浏览器控制台是否有错误\n');
