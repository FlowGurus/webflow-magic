class WebflowMagic_CMSAnchorLinks {
  localOptions = {}
  defaultOptions = {
    TOP_OFFSET: null,
    ATTRIBUTE_PREFIX: 'magic-anchorlinks-',
    LINK_SELECTOR: 'a',
  }

  linkSlugList = [];
  anchorSlugList = [];

  constructor(options) {
    if (options && typeof options === 'object') {
      Object.entries(this.defaultOptions).forEach(([option, value]) => {
        this.localOptions[option] = options[option] == null ? value : options[option];
      });
    } else {
      this.localOptions = { ...this.defaultOptions };
    }

    this.mount();
  }

  mount() {
    const linksContainerNodes = document.querySelectorAll(`[${this.localOptions.ATTRIBUTE_PREFIX}element=links]`);
    linksContainerNodes.forEach(linkContainerNode => {
      const linkNodes = linkContainerNode.querySelectorAll(this.localOptions.LINK_SELECTOR);
      if (linkNodes.length === 0) {
        console.warn(`Links container does not contain a single link with LINK_SELECTOR='${this.localOptions.LINK_SELECTOR}'!`, linkContainerNode);
      }
      linkNodes.forEach(linkNode => {
        const slug = this.slugify(
          linkNode.querySelector(`[${this.localOptions.ATTRIBUTE_PREFIX}element=link]`)?.textContent 
          ?? linkNode.textContent
        );
        if (!slug) {
          console.warn(`Link element with empty slug found!`, linkNode);
          return;
        }
        this.linkSlugList.push(slug);
        this.setlinkUrl(linkNode, `#${slug}`);
      });
    });
    
    const anchorsContainerNodes = document.querySelectorAll(`[${this.localOptions.ATTRIBUTE_PREFIX}element=anchors]`);
    anchorsContainerNodes.forEach(anchorsContainerNode => {
      const anchorNodes = anchorsContainerNode.querySelectorAll(`[${this.localOptions.ATTRIBUTE_PREFIX}element=anchor]`);
      if (anchorNodes.length === 0) {
        console.warn(`Anchors container does not contain a single element with attribute [${this.localOptions.ATTRIBUTE_PREFIX}element=anchor] to assign anchor to!`, anchorsContainerNode);
      }
      anchorNodes.forEach(anchorNode => {
        const slug = this.slugify(anchorNode.textContent);
        if (!slug) {
          console.warn(`Anchor element with empty slug found!`, anchorNode);
          return;
        }
        const generatedAnchorNode = document.createElement('div');
        generatedAnchorNode.style.position = 'absolute';
        this.anchorSlugList.push(slug);
        generatedAnchorNode.id = slug;
        if (this.localOptions.TOP_OFFSET) {
          generatedAnchorNode.style.marginTop = `-${this.localOptions.TOP_OFFSET}`;
        }
        anchorNode.insertBefore(generatedAnchorNode, anchorNode.firstChild);
      });
    });
    
    const brokenLinks = this.linkSlugList.filter(el => !this.anchorSlugList.includes(el));
    if (brokenLinks.length) console.warn(`LINKS with no matching ANCHORS found: ${brokenLinks.join(', ')}`)
    const brokenAnchors = this.anchorSlugList.filter(el => !this.linkSlugList.includes(el));
    if (brokenAnchors.length) console.warn(`ANCHORS with no matching LINKS found: ${brokenAnchors.join(', ')}`)  
  }

  setlinkUrl(linkEl, url) {
    linkEl.href = url;
  }

  slugify(str) {
    return str && str.match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g).join('-');
  }
}
