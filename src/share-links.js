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
    const utmStaticEntries = Object.entries(this.localOptions.UTM_STATIC_DATA);
    const searchParams = new URLSearchParams(location.search);
    
    if (this.localOptions.ADD_UTM) {
      utmStaticEntries.forEach(([param, value]) => {
        searchParams.set(param, value);
      });
    }

    const url = new URL(`${location.origin}${location.pathname}`);

    
    document.querySelectorAll(`[${this.localOptions.ATTRIBUTE_PREFIX}target]`).forEach(linkEl => {
      const destinationType = linkEl.getAttribute(`${this.localOptions.ATTRIBUTE_PREFIX}target`);
      
      if (this.localOptions.ADD_UTM && this.localOptions.SET_UTM_SOURCE) searchParams.set('utm_source', destinationType);
      
      url.search = searchParams.toString();

      if (destinationType === 'clipboard') linkEl.addEventListener('click', (e) => {
        e.preventDefault();
        this.copyTextToClipboard(url.toString());
      });
      
      this.setlinkUrl(linkEl, this.getShareLink(destinationType, url.toString()));
      if (this.localOptions.SET_TARGET_BLANK) linkEl.target = '_blank';
    });
    
    // support of obsolete logic
    document.querySelectorAll(`.${this.localOptions.LINK_CLASS}`).forEach(linkEl => {
      const destinationType = this.getDestinationType(linkEl);
      
      if (this.localOptions.ADD_UTM && this.localOptions.SET_UTM_SOURCE) searchParams.set('utm_source', destinationType);
      
      url.search = searchParams.toString();

      if (destinationType === 'clipboard') linkEl.addEventListener('click', (e) => {
        e.preventDefault();
        this.copyTextToClipboard(url.toString());
      });
      
      this.setlinkUrl(linkEl, this.getShareLink(destinationType, url.toString()));
      if (this.localOptions.SET_TARGET_BLANK) linkEl.target = '_blank';
    });
  }
  setlinkUrl(linkEl, url) {
    linkEl.href = url;
  }
  getDestinationType(linkEl) {
    const classList = linkEl.classList;
    if (classList.contains(this.localOptions.LINK_CLASS_CLIPBOARD)) return 'clipboard';
    if (classList.contains(this.localOptions.LINK_CLASS_FACEBOOK)) return 'facebook';
    if (classList.contains(this.localOptions.LINK_CLASS_LINKEDIN)) return 'linkedin';
    if (classList.contains(this.localOptions.LINK_CLASS_TWITTER)) return 'twitter';
  }
  getShareLink(destinationType, url, text='') {
    switch (destinationType) {
      case 'clipboard': return 'javascript:;';
      case 'facebook': return `https://www.facebook.com/sharer/sharer.php?u=${url}`;
      case 'linkedin': return `https://www.linkedin.com/shareArticle?mini=true&url=${url}`;
      case 'twitter': return `https://twitter.com/intent/tweet?url=${url}&text=${text}`;
      default: return;
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


