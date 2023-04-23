class WebflowMagic_TextStorage {
  localOptions = {}
  defaultOptions = {
    ATTRIBUTE_NAME: 'magic-textstorage',
    INPUT_TYPES: ['text', 'password', 'number', 'email', 'tel', 'url', 'search', 'date', 'datetime', 'datetime-local', 'time', 'month', 'week'],
  }
  storageData = null

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
    this.getStorageData();

    document.querySelectorAll(`[${this.localOptions.ATTRIBUTE_NAME}]`).forEach(element => {
      const storageKey = element.getAttribute(this.localOptions.ATTRIBUTE_NAME);
      const storedValue = this.storageData[storageKey];
      const placeholderValue = element.getAttribute(`${this.localOptions.ATTRIBUTE_NAME}-placeholder`);

      if (storedValue) this.setValues(storageKey, storedValue);
      else if (placeholderValue) this.setValues(storageKey, placeholderValue);

      if (this.isElementEditableTextField(element)) {
        element.addEventListener('keyup', (event) => {
          const key = event.target.getAttribute(this.localOptions.ATTRIBUTE_NAME);
          let value = event.target.value;
          if (!value && placeholderValue) {
            value = placeholderValue;
            event.target.value = placeholderValue;
          }
          if (this.setStorageValue(key, value)) {
            this.setValues(key, value);
          }
        });
      }
    });
  }
  
  getStorageData() {
    this.storageData = JSON.parse(localStorage.getItem(this.localOptions.ATTRIBUTE_NAME));
    if (this.storageData == null) this.storageData = {};
  }

  setValues(key, value) {
    document.querySelectorAll(`[${this.localOptions.ATTRIBUTE_NAME}=${key}]`).forEach(element => {
      if (this.isElementEditableTextField(element)) {
        element.value = value;
      } else {
        element.textContent = value;
      }
    });
  }
  
  setStorageValue(key, value) {
    this.getStorageData();
    if (key && this.storageData[key] !== value) {
      this.storageData[key] = value;
      localStorage.setItem(this.localOptions.ATTRIBUTE_NAME, JSON.stringify(this.storageData));
      return true;
    }
    return false;
  }

  isElementEditableTextField(element) {
    const tagName = element.tagName.toLowerCase();
    if (tagName === 'textarea') return true;
    if (tagName !== 'input') return false;
    const type = element.getAttribute('type').toLowerCase();
    return this.localOptions.INPUT_TYPES.includes(type);
  }
}
