/* global hexo */
'use strict';

// 渲染首页的「按分类的文章列表」：{% home_posts %}
hexo.extend.tag.register('home_posts', function () {
  const posts = hexo.locals.get('posts').sort('-date');
  const groups = {};

  posts.forEach(post => {
    const cats = post.categories && post.categories.length
      ? post.categories.toArray()
      : [{ name: 'Uncategorized' }];
    cats.forEach(cat => {
      if (!groups[cat.name]) groups[cat.name] = [];
      groups[cat.name].push(post);
    });
  });

  let out = '<div class="home-categories">';
  Object.keys(groups).sort((a, b) => a.localeCompare(b)).forEach(name => {
    out += '<h3>' + name + '</h3><ul>';
    groups[name].forEach(post => {
      out += '<li><a href="/' + post.path.replace(/^\/+/, '') + '">' + post.title + '</a></li>';
    });
    out += '</ul>';
  });
  out += '</div>';
  return out;
}, { ends: false });
