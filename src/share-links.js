class WebflowMagic_ShareLinks {
  localOptions = {}
  defaultOptions = {
    ATTRIBUTE_PREFIX: 'magic-sharelinks-',
    ADD_UTM: false,
    SET_TARGET_BLANK: true,
    SET_UTM_SOURCE: true,
    UTM_STATIC_DATA: {
      utm_medium: 'share-link',
    },
    POPUP_TIMEOUT: 3000,
    POPUP_PROMPT_TEXT: "You can copy the link over here",
    //obsolete options
    LINK_CLASS: 'share-link',
    LINK_CLASS_CLIPBOARD: 'clipboard',
    LINK_CLASS_FACEBOOK: 'facebook',
    LINK_CLASS_LINKEDIN: 'linkedin',
    LINK_CLASS_TWITTER: 'twitter',
    LINK_CLASS_REDDIT: 'reddit',
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
    document.querySelectorAll(`[${this.localOptions.ATTRIBUTE_PREFIX}target]`).forEach(linkEl => this.processLinkEl(linkEl));
    
    // support of obsolete logic
    document.querySelectorAll(`.${this.localOptions.LINK_CLASS}`).forEach(linkEl => this.processLinkEl(linkEl));
  }
  processLinkEl(linkEl) {
    const url = new URL(`${location.origin}${location.pathname}`);
    const searchParams = new URLSearchParams(location.search);
    const utmStaticEntries = Object.entries(this.localOptions.UTM_STATIC_DATA);
    const destinationType = this.getDestinationType(linkEl);
    const postTitle = this.getPostTitle(linkEl) ?? '';
    
    if (this.localOptions.ADD_UTM) {
      utmStaticEntries.forEach(([param, value]) => {
        searchParams.set(param, value);
      });
    }
    if (this.localOptions.ADD_UTM && this.localOptions.SET_UTM_SOURCE) searchParams.set('utm_source', destinationType);
    
    url.search = searchParams.toString();

    if (destinationType === 'clipboard') linkEl.addEventListener('click', (e) => {
      e.preventDefault();
      this.copyTextToClipboard(url.toString());
    });
    const urlString = this.generateShareLink(destinationType, url.toString(), postTitle)

    if (urlString) {
      this.setlinkUrl(linkEl, urlString);
      if (this.localOptions.SET_TARGET_BLANK) linkEl.target = '_blank';  
    }
  }
  setlinkUrl(linkEl, url) {
    linkEl.href = url;
  }
  getDestinationType(linkEl) {
    const destinationType = linkEl.getAttribute(`${this.localOptions.ATTRIBUTE_PREFIX}target`);
    if (destinationType) return destinationType;
    // support of obsolete logic
    const classList = linkEl.classList;
    if (classList.contains(this.localOptions.LINK_CLASS_CLIPBOARD)) return 'clipboard';
    if (classList.contains(this.localOptions.LINK_CLASS_FACEBOOK)) return 'facebook';
    if (classList.contains(this.localOptions.LINK_CLASS_LINKEDIN)) return 'linkedin';
    if (classList.contains(this.localOptions.LINK_CLASS_TWITTER)) return 'twitter';
    if (classList.contains(this.localOptions.LINK_CLASS_REDDIT)) return 'reddit';
  }
  getPostTitle(linkEl) {
    const title = linkEl.getAttribute(`${this.localOptions.ATTRIBUTE_PREFIX}title`);
    return title;
  }
  generateShareLink(destinationType, url, text='') {
    switch (destinationType) {
      case 'clipboard': return 'javascript:;';
      case 'facebook': return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
      case 'linkedin': return `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(url)}`;
      case 'twitter': return `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
      case 'reddit': return `https://www.reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(text)}`;
      default: 
        console.error(`There is no rule for link generation defined for target '${destinationType}'`, url);
        return;
    }
  }
  fallbackCopyTextToClipboard(text) {
    let isSuccess = true;
    var textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";

    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
  
    try {
      document.execCommand('copy');
    } catch (ex) {
      console.error('Fallback: Oops, unable to copy', ex);
      isSuccess = false
    }
    document.body.removeChild(textArea);
    return isSuccess;
  }
  copyTextToClipboard(text) {
    if (!navigator.clipboard) {
      this.showPopup(this.fallbackCopyTextToClipboard(text));
    } else {
      navigator.clipboard.writeText(text).then(() => {
        this.showPopup();
      }, () => {
        try {
          window.prompt(this.localOptions.POPUP_PROMPT_TEXT, text);
        } catch (ex) {
          console.error('Fallback: Oops, unable to copy', ex);
          this.showPopup(false);
        }
      });
    }
  }
  showPopup(isSuccess = true) {
    const selector = (isSuccess) 
      ? `[${this.localOptions.ATTRIBUTE_PREFIX}popup=success]`
      : `[${this.localOptions.ATTRIBUTE_PREFIX}popup=fail]`
    ;
    const popupEl = document.querySelector(selector);
    if (popupEl) {
      popupEl.style.display = 'block';
      setTimeout(() => {
        popupEl.style.display = 'none';
      }, this.localOptions.POPUP_TIMEOUT);
    } else {
      console.warn(`No popup elements found by selector ${selector}`);
    }
  }
}


