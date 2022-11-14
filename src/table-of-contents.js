class WebflowMagic_TableOfContents {
  localOptions = {}
  defaultOptions = {
    TOC_ELEMENT_SELECTOR: '#toc',
    TOC_WRAP_ELEMENT_SELECTOR: '.table-of-contents',
    TOC_LIST_TAG: 'ol',
    TOC_LIST_ITEM_CLASSLIST: '',
    HEADING_ELEMENTS_SELECTOR: 'h2,h3,h4,h5,h6',
    CONTENT_ELEMENTS_SELECTOR: '.w-richtext',
    TOP_OFFSET: null,

    ANCHOR_CLASSNAME: 'toc-anchor',
    LINK_LIST_CLASSNAME: 'toc-gen',
    // CURRENT_LINK_CLASSNAME: 'w--current',
    // HEADING_LIST_ITEM_CLASSNAMES: {
    //   1: 'toc-gen-h1',
    //   2: 'toc-gen-h2',
    //   3: 'toc-gen-h3',
    //   4: 'toc-gen-h4',
    //   5: 'toc-gen-h5',
    //   6: 'toc-gen-h6',
    // },

    SHOW_TOC_WRAP_WHEN_NO_HEADINGS: false,
    HIDE_EMPTY: true,
    HIDE_REGEX: /.*-\s*$/, // Headings with - at the end will be hidden from TOC
    HIDE_REPLACE_REGEX: /(.*)-\s*$/gm,
    HIDE_REPLACE_WITH: '$1',
    CUSTOM_TITLE_REGEX: /.*\{([^\}]*)\}.*/gm,
    CUSTOM_TITLE_REPLACE_REGEX: /(.*)\s*\{[^\}]*\}.*/gm,
    CUSTOM_TITLE_REPLACE_WITH: '$1',
    SLUG_REGEX: /.*##([0-9A-Za-z\?\/\:\@\-\.\_\~\!\$\&\'\(\)\*\+\,\,\=\%]*).*/gm,
    SLUG_REPLACE_REGEX: /(.*)(##[0-9A-Za-z\?\/\:\@\-\.\_\~\!\$\&\'\(\)\*\+\,\,\=\%]*)(.*)/gm,
    SLUG_REPLACE_WITH: '$1$3',
  }

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
    const TOCRootNode = document.querySelector(this.localOptions.TOC_ELEMENT_SELECTOR);
    const headingSelector = this.localOptions.HEADING_ELEMENTS_SELECTOR
      .split(",").map(el => `${this.localOptions.CONTENT_ELEMENTS_SELECTOR} ${el}`).join(",");
    const headingNodes = document.querySelectorAll(headingSelector);
    if (headingNodes.length === 0 && !this.localOptions.SHOW_TOC_WRAP_WHEN_NO_HEADINGS) {
      document.querySelector(this.localOptions.TOC_WRAP_ELEMENT_SELECTOR).style.display = 'none';
    }
    let parentLevel = 0,
      currentNode = TOCRootNode;

    // const observer = new IntersectionObserver(entries => {
    //   entries.forEach(entry => {
    //     const id = entry.target.getAttribute('id');
    //     const el = document.querySelector(`${this.localOptions.TOC_ELEMENT_SELECTOR} a[href="#${id}"]`);
    //     console.log(id, el)
        
    //     if (entry.intersectionRatio > 0) {
    //       el.classList.add(this.localOptions.CURRENT_LINK_CLASSNAME);
    //     } else {
    //       el.classList.remove(this.localOptions.CURRENT_LINK_CLASSNAME);
    //     }
    //   });
    // });

    for (let i = 0, len = headingNodes.length; i < len; ++i) {
      let currentHeadingNode = headingNodes[i];
      let textContent = currentHeadingNode.textContent;
      if (this.shouldSkipHeading(textContent)) {
        this.processHeading(currentHeadingNode);
        console.info('skipped heading', textContent, currentHeadingNode);
        continue;
      }
      let newLevel = parseInt(currentHeadingNode.tagName.substr(1, 1));
      let diff = newLevel - parentLevel;
      if (parentLevel === 0 || diff > 0) {
        let containerLiNode = currentNode.lastChild || currentNode;
        let ulNode = document.createElement(this.localOptions.TOC_LIST_TAG);
        ulNode.className = this.localOptions.LINK_LIST_CLASSNAME;
        containerLiNode.appendChild(ulNode);
        currentNode = ulNode;
        parentLevel = newLevel;
      }
      if (diff < 0) {
        while (0 !== diff) {
          currentNode = currentNode.parentNode.closest('.' + this.localOptions.LINK_LIST_CLASSNAME);
          diff++;
        }
        parentLevel = newLevel;
      }
      const idValue = this.getFreeIdValue(textContent);
      const listItemNode = document.createElement('LI');
      listItemNode.classList = this.localOptions.TOC_LIST_ITEM_CLASSLIST;
      // const headingClassname = this.localOptions.HEADING_LIST_ITEM_CLASSNAMES?.[newLevel];
      // console.log(headingClassname);
      // if (headingClassname) listItemNode.classList.add(headingClassname);
      // if (!currentHeadingNode.hasAttribute('id')) currentHeadingNode.id = id;
      const anchorNode = document.createElement('A');
      anchorNode.id = idValue;
      anchorNode.className = this.localOptions.ANCHOR_CLASSNAME;
      if (this.localOptions.TOP_OFFSET) {
        anchorNode.style.marginTop = `-${this.localOptions.TOP_OFFSET}`;
        anchorNode.style.position = 'absolute';
      }
      // observer.observe(anchorNode);
      currentHeadingNode.parentElement.insertBefore(anchorNode, currentHeadingNode);
      const linkNode = document.createElement('A');
      linkNode.setAttribute('href', '#' + idValue);
      linkNode.appendChild(document.createTextNode(this.formatTOCLinkText(textContent)))
      listItemNode.appendChild(linkNode);
      currentNode.appendChild(listItemNode);
      this.processHeading(currentHeadingNode);
    }
    // const links = document.querySelectorAll('#toc a');
    // const anchors = document.querySelectorAll('a.toc-anchor');

    // function changeLinkState() {
    //   console.log('ass')
    //   let index = anchors.length;

    //   while(--index && window.scrollY + 50 < anchors[index].offsetTop) {}
      
    //   links.forEach((link) => link.classList.remove(this.localOptions.CURRENT_LINK_CLASSNAME));
    //   links[index].classList.add(this.localOptions.CURRENT_LINK_CLASSNAME);
    // }

    // changeLinkState();
    // window.addEventListener('scroll', changeLinkState);
  }
  getFreeIdValue(textContent) {
    let idValue = this.formatTOCLinkSlug(textContent),
      nextFreeIdx = 1;

    while (true) {
      if (!document.getElementById(idValue)) break;
      idValue = this.formatTOCLinkSlug(`${textContent} ${nextFreeIdx}`);
      nextFreeIdx++;
    }
    return idValue;
  }
  cleanupHeadingText(text) {
    text = text.replace(this.localOptions.HIDE_REPLACE_REGEX, this.localOptions.HIDE_REPLACE_WITH);
    text = text.replace(this.localOptions.CUSTOM_TITLE_REPLACE_REGEX, this.localOptions.CUSTOM_TITLE_REPLACE_WITH);
    text = text.replace(this.localOptions.SLUG_REPLACE_REGEX, this.localOptions.SLUG_REPLACE_WITH);
    return text;
  }
  formatTOCLinkText(text) {
    let customTitle = text.replace(this.localOptions.CUSTOM_TITLE_REGEX, '$1');
    let clean = text.replace(this.localOptions.SLUG_REPLACE_REGEX, this.localOptions.SLUG_REPLACE_WITH);
    clean = clean.replace(/[\:\,\;\s]*$/,'');
    return text.match(this.localOptions.CUSTOM_TITLE_REGEX) ? customTitle : clean;
  }
  formatTOCLinkSlug(text) {
    let slug = text.replace(this.localOptions.SLUG_REGEX, '$1');
    let customTitle = text.replace(this.localOptions.CUSTOM_TITLE_REGEX, '$1');
    return text.match(this.localOptions.SLUG_REGEX) ? slug : this.toKebabCase(this.cleanupHeadingText(text.match(this.localOptions.CUSTOM_TITLE_REGEX) ? customTitle : text));
  }
  shouldSkipHeading(text) {
    return (this.localOptions.HIDE_EMPTY && text.replace(/\s/g, '') === '' ) || text.match(this.localOptions.HIDE_REGEX);
  }
  processHeading(node) {
    node.textContent = this.cleanupHeadingText(node.textContent);
  }
  toKebabCase(str) {
    return str && str.match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g).map(x => x.toLowerCase()).join('-');
  }

}
