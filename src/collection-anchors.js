class WebflowMagic_CollectionAnchors {
  localOptions = {}
  defaultOptions = {
    PILLS_CONTAINER_SELECTOR: '.collection-anchor-links',
    CARDS_CONTAINER_SELECTOR: '.collection-anchors',
    ITEM_SELECTOR: '[role=listitem]',
    ITEM_SLUG_SELECTOR: '.item-slug',
    ITEM_TEXT_SELECTOR: null,
    TOP_OFFSET: null,
  }

  pillSlugList = [];
  cardSlugList = [];

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
    
    const pillsContainers = document.querySelectorAll(this.localOptions.PILLS_CONTAINER_SELECTOR);
    pillsContainers.forEach(containerEl => {
      containerEl.querySelectorAll(this.localOptions.ITEM_SELECTOR).forEach(itemEl => {
        const slug = this.slugify(itemEl.querySelector(this.localOptions.ITEM_SLUG_SELECTOR)?.textContent ?? itemEl.textContent);
        const anchorEl = itemEl.querySelector('a');
        if (!anchorEl) console.warn('Link container does not contain link to assign anchor!')
        this.pillSlugList.push(slug);
        this.setlinkUrl(anchorEl, `#${slug}`);
      });
    });
    
    const cardsContainers = document.querySelectorAll(this.localOptions.CARDS_CONTAINER_SELECTOR);
    cardsContainers.forEach(containerEl => {
      containerEl.querySelectorAll(this.localOptions.ITEM_SELECTOR).forEach(itemEl => {
        let slugText = itemEl.querySelector(this.localOptions.ITEM_SLUG_SELECTOR)?.textContent;
        if (!slugText) {
          if (!this.localOptions.ITEM_TEXT_SELECTOR) {
            throw Error(`WM_CollectionAnchors ERROR: Unable to match pill and card anchors.
pills and cards collection items must be set up one of the way below:
- to contain div with selector "${this.localOptions.ITEM_SLUG_SELECTOR}"
- or if you do not use the slug you should specify the ITEM_TEXT_SELECTOR param
with the same text as pill text for anchors to match, for example:
new WM_CollectionAnchors({ ITEM_TEXT_SELECTOR: '.some-selector-here', ... });`);
          }
          slugText = itemEl.querySelector(this.localOptions.ITEM_TEXT_SELECTOR)?.textContent
        }
        const slug = this.slugify(slugText);
        const anchorEl = document.createElement('div');
        anchorEl.style.position = 'absolute';
        
        if (!slug) {
          return;
        }
        this.cardSlugList.push(slug);
        anchorEl.id = slug;
        anchorEl.className = "ass";
        if (this.localOptions.TOP_OFFSET) {
          anchorEl.style.marginTop = `-${this.localOptions.TOP_OFFSET}`;

        }
        itemEl.insertBefore(anchorEl, itemEl.firstChild);
        
      });
    });

    const pillsBrokenLinks = this.pillSlugList.filter(el => !this.cardSlugList.includes(el));
    if (pillsBrokenLinks.length) console.warn(`PILLS with no matching CARDS found: ${pillsBrokenLinks.join(', ')}`)
    const cardsBrokenLinks = this.cardSlugList.filter(el => !this.pillSlugList.includes(el));
    if (cardsBrokenLinks.length) console.warn(`CARDS with no matching PILLS found: ${cardsBrokenLinks.join(', ')}`)  
  }

  setlinkUrl(linkEl, url) {
    linkEl.href = url;
  }

  slugify(str) {
    return str && str.match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g).join('-');
  }
}
