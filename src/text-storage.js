class WebflowMagic_TextStorage {
  localOptions = {}
  defaultOptions = {
    ATTRIBUTE_NAME: 'magic-textstorage',
    INPUT_TYPES: ['text', 'password', 'number', 'email', 'tel', 'url', 'search', 'date', 'datetime', 'datetime-local', 'time', 'month', 'week'],
    VALUE_FILTERS: {},
  }
  storageData = null
  valueFilters = {
    'first-name': (value) => typeof value === 'string' ? value.split(' ')[0] : null,
    'last-name': (value) => typeof value === 'string' ? value.split(' ').pop() : null, 
  }

  constructor(options) {
    if (options && typeof options === 'object') {
      Object.entries(this.defaultOptions).forEach(([option, value]) => {
        this.localOptions[option] = options[option] == null ? value : options[option];
      });
    } else {
      this.localOptions = { ...this.defaultOptions };
    }

    for (const fnName in this.localOptions.VALUE_FILTERS) {
      if (typeof this.localOptions.VALUE_FILTERS[fnName] !== 'function') {
        console.error(`VALUE_FILTERS['${fnName}'] is not a function.`);
        return;
      }
      this.valueFilters[fnName] = this.localOptions.VALUE_FILTERS[fnName];
    }
    
    this.mount();
  }

  mount() {
    this.getStorageData();

    const processElement = (element) => {
      const key = element.getAttribute(this.localOptions.ATTRIBUTE_NAME);
      let value = element.value;
      const placeholderValue = element.getAttribute(`${this.localOptions.ATTRIBUTE_NAME}-placeholder`);
      if (!value && placeholderValue) {
        value = placeholderValue;
        element.value = placeholderValue;
      }
      if (key && this.setStorageValue(key, value)) {
        this.setElementsValues(key, value);
      }
    }

    const textFieldUpdateHandler = (event) => {
      processElement(event.target);
    }

    document.querySelectorAll(`[${this.localOptions.ATTRIBUTE_NAME}]`).forEach(element => {
      const storageKey = element.getAttribute(this.localOptions.ATTRIBUTE_NAME);
      const storedValue = this.storageData[storageKey];

      if (storedValue) this.setElementsValues(storageKey, storedValue);

      if (this.isElementEditableTextField(element)) {
        element.addEventListener('keyup', textFieldUpdateHandler);
      }
    });

    document.querySelectorAll(`[${this.localOptions.ATTRIBUTE_NAME}-placeholder]`).forEach(element => {
      const storageKey = element.getAttribute(this.localOptions.ATTRIBUTE_NAME);

      if (storageKey) return;
      
      const placeholderValue = element.getAttribute(`${this.localOptions.ATTRIBUTE_NAME}-placeholder`);
      this.setElementValue(element, placeholderValue);

      if (this.isElementEditableTextField(element)) {
        element.addEventListener('keyup', textFieldUpdateHandler);
        this.overrideElementValueChange(element, (value) => {
          if (value) return;
          this.setElementValue(element, placeholderValue);
        });
      
      }
    });
  }

  overrideElementValueChange(element, handler) {
    const desc = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value");
    Object.defineProperty(element, "value", {
      get: desc.get,
      set: function(v) {
        desc.set.call(this, v);
        handler(v);
      }
    });

  }
  
  getStorageData() {
    this.storageData = JSON.parse(localStorage.getItem(this.localOptions.ATTRIBUTE_NAME));
    if (this.storageData == null) this.storageData = {};
  }

  setElementValue(element, value) {
    const filterFnName = element.getAttribute(`${this.localOptions.ATTRIBUTE_NAME}-filter`);
    const filterFn = this.valueFilters[filterFnName];
    if (filterFnName && filterFn == null) console.error(`Filter function '${filterFnName}' does not exists`);
    
    if (this.isElementEditableTextField(element)) {
      element.value = value;
      if (filterFn != null) console.error(`Text filter functions (${this.localOptions.ATTRIBUTE_NAME}-filter="${filterFnName}") can only be aplied to non-editable elements.`);
    } else {
      element.textContent = (filterFn != null) ? filterFn(value) : value;
    }
  }
  
  setElementsValues(key, value) {
    document.querySelectorAll(`[${this.localOptions.ATTRIBUTE_NAME}=${key}]`).forEach(element => {
      this.setElementValue(element, value);
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
