class WebflowMagicTOC {
  localOptions = {}
  defaultOptions = {
    TOC_ELEMENT_SELECTOR: '#toc',
    TOC_LIST_TAG: 'ol',
    TOC_LIST_ITEM_CLASSLIST: '',
    HEADING_ELEMENTS_SELECTOR: 'h2,h3,h4,h5,h6',
    CONTENT_ELEMENTS_SELECTOR: '.w-richtext',

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
    let TOC = document.querySelector(this.localOptions.TOC_ELEMENT_SELECTOR),
      headingSelector = this.localOptions.HEADING_ELEMENTS_SELECTOR.split(",").map(el => `${this.localOptions.CONTENT_ELEMENTS_SELECTOR} ${el}`).join(","),
      headingNodes = document.querySelectorAll(headingSelector),
      parentLevel = 0,
      currentNode = TOC;
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
        let ulNode = document.createElement(this.localOptions.TOC_LIST_TAG)
        ulNode.className = "toc-gen";
        containerLiNode.appendChild(ulNode);
        currentNode = ulNode;
        parentLevel = newLevel;
      }
      if (diff < 0) {
        while (0 !== diff++) currentNode = currentNode.closest('.toc-gen');
        parentLevel = newLevel;
      }
      let id = this.formatTOCLinkSlug(textContent),
        idx = 1;
      while (true) {
        if (!document.getElementById(id)) break;
        id = this.formatTOCLinkSlug(`${textContent} ${idx}`);
        idx++;
      }
      let liNode = document.createElement('LI');
      // if (!currentHeadingNode.hasAttribute('id')) currentHeadingNode.id = id;
      let anchorNode = document.createElement('A');
      anchorNode.id = id;
      anchorNode.className = "toc-anchor";
      currentHeadingNode.parentElement.insertBefore(anchorNode, currentHeadingNode);
      let link = document.createElement('A');
      link.setAttribute('href', '#' + id);
      link.appendChild(document.createTextNode(this.formatTOCLinkText(textContent)))
      liNode.appendChild(link);
      currentNode.appendChild(liNode);
      this.processHeading(currentHeadingNode);
    }
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
    return text.match(this.localOptions.HIDE_REGEX);
  }
  processHeading(node) {
    node.textContent = this.cleanupHeadingText(node.textContent);
  }
  toKebabCase(str) {
    return str && str.match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g).map(x => x.toLowerCase()).join('-');
  }

}
