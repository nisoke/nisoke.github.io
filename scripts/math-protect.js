/* global hexo */
'use strict';

// 保护公式，避免 hexo-renderer-marked 把公式里的 `_`、`*` 等当成 markdown 语法。
// before_post_render 阶段把 $...$ / $$...$$ 替换成占位符，
// after_post_render 阶段再原样还原，交给前端 MathJax 渲染。

function protect(content, store) {
  // 块级公式 $$...$$
  content = content.replace(/\$\$([\s\S]*?)\$\$/g, function (m) {
    store.push(m);
    return '\n\n<div data-mjx-block="' + (store.length - 1) + '"></div>\n\n';
  });
  // 行内公式 $...$
  content = content.replace(/\$([^$\n]+?)\$/g, function (m) {
    store.push(m);
    return '<span data-mjx-inline="' + (store.length - 1) + '"></span>';
  });
  return content;
}

hexo.extend.filter.register('before_post_render', function (data) {
  const store = [];
  data._mjxStore = store;
  data.content = protect(data.content || '', store);
  return data;
});

hexo.extend.filter.register('after_post_render', function (data) {
  const store = data._mjxStore || [];
  data.content = (data.content || '')
    .replace(/<div data-mjx-block="(\d+)"[^>]*><\/div>/g, function (m, i) {
      return store[+i] || m;
    })
    .replace(/<span data-mjx-inline="(\d+)"[^>]*><\/span>/g, function (m, i) {
      return store[+i] || m;
    });
  data._mjxStore = null;
  return data;
});
