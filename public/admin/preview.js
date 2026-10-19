// Shows the real site in the editor's preview pane. The page that matches the
// entry being edited loads in a frame (?cms-preview), and every change to the
// draft is posted into it so the text updates as you type (see
// src/lib/preview-bridge.ts). New items, reordering and layout changes appear
// after saving, once the page rebuilds.
(() => {
  const PAGES = {
    home: '/', tours: '/tours/', military: '/military-battlefield-studies/', tracing: '/tracing-a-relative/',
    testimonials: '/testimonials/', gallery: '/gallery/', reading: '/reading-list/', contact: '/contact/',
    'not-found': '/404.html', about: '/about/', faqs: '/faqs/',
  };
  const GALLERY_PAGES = { home: '/', about: '/about/', testimonials: '/testimonials/', 'general-reading-list': '/reading-list/', 'regiment-core': '/reading-list/' };

  // 'src/content/tours/cassino.json' -> { source: 'tours:cassino', url: '/cassino/' }
  function locate(path) {
    const m = /src\/content\/([^/]+)\/([^/]+)\.json$/.exec(path || '');
    if (!m) return null;
    const [, folder, name] = m;
    const source = `${folder}:${name}`;
    let url = '/';
    if (folder === 'tours' || folder === 'stands') url = `/${name}/`;
    else if (folder === 'pages') url = PAGES[name] || '/';
    else if (folder === 'testimonials') url = '/testimonials/';
    else if (folder === 'books') url = '/reading-list/';
    else if (folder === 'galleries') url = GALLERY_PAGES[name] || `/gallery/#${name}`;
    else if (folder === 'settings') url = name === 'wording' ? '/cassino/' : '/contact/';
    return { source, url };
  }
  const toJS = (x) => (x && typeof x.toJS === 'function' ? x.toJS() : x);

  const Preview = createClass({
    componentDidMount() {
      this.onMessage = (e) => { if (e.data && e.data.type === 'cms-preview-ready') this.post(); };
      window.addEventListener('message', this.onMessage);
      // The preview pane may itself be a frame; listen there too.
      if (this.props.window && this.props.window !== window) this.props.window.addEventListener('message', this.onMessage);
    },
    componentWillUnmount() {
      window.removeEventListener('message', this.onMessage);
      if (this.props.window && this.props.window !== window) this.props.window.removeEventListener('message', this.onMessage);
    },
    componentDidUpdate() { this.post(); },
    entry() { return toJS(this.props.entry) || {}; },
    post() {
      const e = this.entry(); const where = locate(e.path);
      const frame = this.frame;
      if (!where || !frame || !frame.contentWindow) return;
      frame.contentWindow.postMessage({ type: 'cms-preview', source: where.source, data: e.data || {} }, location.origin);
    },
    render() {
      const e = this.entry(); const where = locate(e.path);
      if (!where) {
        return h('p', { style: { font: '15px/1.5 system-ui, sans-serif', padding: '24px', color: '#47524b' } },
          'Save this new entry to see it on the site.');
      }
      const [page, hash] = where.url.split('#');
      const src = `${page}${page.includes('?') ? '&' : '?'}cms-preview${hash ? '#' + hash : ''}`;
      return h('iframe', {
        src, title: 'Site preview', ref: (el) => { this.frame = el; },
        onLoad: () => this.post(),
        style: { display: 'block', width: '100%', height: '100vh', border: '0', background: '#f3f3ef' },
      });
    },
  });

  const names = ['tours', 'testimonials', 'galleries', 'books', 'stands', 'home', 'tours_page', 'military', 'tracing',
    'testimonials_page', 'gallery', 'reading', 'contact', 'not-found', 'about', 'faqs', 'site', 'wording'];
  names.forEach((n) => CMS.registerPreviewTemplate(n, Preview));
  CMS.registerPreviewStyle('html, body { margin: 0; padding: 0; height: 100%; overflow: hidden; }', { raw: true });
})();
