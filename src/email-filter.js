class WebflowMagic_EmailFilter {
  localOptions = {}
  defaultOptions = {
    BLACKLISTED_DOMAINS: 'gmail.com|yahoo.com|hotmail.com',
    EMAIL_INPUT_SELECTOR: '[type=email]',
    ERROR_MESSAGE: 'Please enter busyness email',
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
    document.querySelectorAll(this.localOptions.EMAIL_INPUT_SELECTOR).forEach(el => {
      el.pattern = '.*@(?!(' +  this.localOptions.BLACKLISTED_DOMAINS + ')).*';
      el.oninput = (event) => {
        event.target.setCustomValidity('');
        event.target.reportValidity();
      }
      el.oninvalid = (event) => {
        event.target.setCustomValidity(this.localOptions.ERROR_MESSAGE);
      }
    });
  }
}
