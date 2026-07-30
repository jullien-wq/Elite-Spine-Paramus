// ============================================================
//  Blog post renderer — reads ?post=slug, renders from BLOG_POSTS
// ============================================================
(function () {
  var posts = window.BLOG_POSTS || {};
  var params = new URLSearchParams(location.search);
  var slug = params.get('post');
  var post = slug && posts[slug];

  // Fallback: unknown/missing slug → send to blog index
  if (!post) {
    location.replace('blog.html');
    return;
  }

  function set(id, val) {
    var el = document.getElementById(id);
    if (el) el.textContent = val;
  }

  // Head + hero
  document.title = post.title + ' — Elite Spine & Sports Care | Paramus, NJ';
  var metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc && post.excerpt) metaDesc.setAttribute('content', post.excerpt);

  var heroImg = document.getElementById('artHeroImg');
  if (heroImg) { heroImg.src = post.hero; heroImg.alt = post.title; }
  set('artTag', post.category);
  set('artDate', post.date);
  set('artRead', post.read);
  set('artTitle', post.title);
  set('artCrumb', post.category);

  // Body blocks
  var body = document.getElementById('artBody');
  if (body && Array.isArray(post.body)) {
    post.body.forEach(function (block) {
      var node;
      if (block.h2) {
        node = document.createElement('h2');
        node.textContent = block.h2;
      } else if (block.p) {
        node = document.createElement('p');
        node.textContent = block.p;
      } else if (block.list) {
        node = document.createElement('ul');
        block.list.forEach(function (item) {
          var li = document.createElement('li');
          li.textContent = item;
          node.appendChild(li);
        });
      }
      if (node) body.appendChild(node);
    });
  }

  // "More from the clinic" — up to 3 other posts
  var grid = document.getElementById('moreGrid');
  if (grid) {
    var others = Object.keys(posts).filter(function (k) { return k !== slug; }).slice(0, 3);
    others.forEach(function (k) {
      var p = posts[k];
      var a = document.createElement('a');
      a.className = 'bcard';
      a.href = 'blog-post.html?post=' + k;
      a.innerHTML =
        '<div class="bcard__img"><img src="' + p.hero + '" alt="' + p.title.replace(/"/g, '&quot;') + '" /></div>' +
        '<div class="bcard__body">' +
          '<div class="bcard__meta"><span>' + p.category + '</span><span class="dot"></span><span>' + p.read + '</span></div>' +
          '<h3>' + p.title + '</h3>' +
          '<p>' + p.excerpt + '</p>' +
          '<span class="bcard__more">Read More' +
            '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 5l7 7-7 7"/></svg>' +
          '</span>' +
        '</div>';
      grid.appendChild(a);
    });
  }

  // Reset scroll to top (in case of in-site navigation between posts)
  window.scrollTo(0, 0);
})();
