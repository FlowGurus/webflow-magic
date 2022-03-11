class ShareLinks {
  localOptions = {}
  defaultOptions = {
    LINK_CLASS: 'share-link',
    LINK_CLASS_CLIPBOARD: 'clipboard',
    LINK_CLASS_FACEBOOK: 'facebook',
    LINK_CLASS_LINKEDIN: 'linkedin',
    LINK_CLASS_TWITTER: 'twitter',
    ADD_UTM: false,
    SET_TARGET_BLANK: true,
    SET_UTM_SOURCE: true,
    UTM_STATIC_DATA: {
      utm_medium: 'share-link',
    },
  }


  constructor(options) {
    this.localOptions = options;
    if (options && isObject(options)) {
      Object.entries(this.defaultOptions).forEach(([option, value]) => {
        this.localOptions[option] = value;
      })
    } else {
      this.localOptions = { ...this.defaultOptions };
    }

    const utmStaticEntries = Object.entries(this.localOptions.UTM_STATIC_DATA);
    const searchParams = new URLSearchParams(location.search);
    
    if (this.localOptions.ADD_UTM) {
      utmStaticEntries.forEach(([param, value]) => {
        searchParams.set(param, value);
      });
    }

    const url = new URL(`${location.origin}${location.pathname}`);
    document.querySelectorAll(`.${this.localOptions.LINK_CLASS}`).forEach(linkEl => {
      const destinationType = this.getDestinationType(linkEl);
      
      if (this.localOptions.ADD_UTM && this.localOptions.SET_UTM_SOURCE) searchParams.set('utm_source', destinationType);
      
      url.search = searchParams.toString();

      if (destinationType === 'clipboard') linkEl.addEventListener('click', (e) => {
        e.preventDefault();
        this.copyTextToClipboard(url);
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
    }
    document.body.removeChild(textArea);
  }
  copyTextToClipboard(text) {
    if (!navigator.clipboard) {
      this.fallbackCopyTextToClipboard(text);
    } else navigator.clipboard.writeText(text);
  }
}


