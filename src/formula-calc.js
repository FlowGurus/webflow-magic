class WebflowMagic_FormulaCalc {
  localOptions = {}
  defaultOptions = {
    DEFAULT_DATA: null,
    CALC_FUNCTION: (calcData) => { return calcData },
    ATTRIBUTE_PREFIX: 'magic-var-',
    LAZY_REACTIVITY: false,
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
    document.querySelectorAll(`input[${this.localOptions.ATTRIBUTE_PREFIX}name]`).forEach(el => {
      el.addEventListener(this.localOptions.LAZY_REACTIVITY ? 'change' : 'input', () => {
        this.fillVarElements(this.calculateVars());
      });
    });
  
    this.fillVarElements(this.calculateVars(true));
  }

  fillVarElements(calcData) {
    document.querySelectorAll(`[${this.localOptions.ATTRIBUTE_PREFIX}name]`).forEach(el => {
      const varName = el.attributes[`${this.localOptions.ATTRIBUTE_PREFIX}name`].value;
      this.setElementValue(el, calcData[varName]);
    });
  }

  calculateVars(initial=false) {
    let localCalcData = this.getCalcData();
    const defaultCalcData = this.localOptions.DEFAULT_DATA;

    if (defaultCalcData && typeof defaultCalcData === 'object') {
      Object.entries(defaultCalcData).forEach(([varName, value]) => {
        if (!localCalcData.hasOwnProperty(varName) || ( initial && localCalcData[varName] === '' )) {
          localCalcData[varName] = defaultCalcData[varName];
        }
      });
    }

    localCalcData = this.localOptions.CALC_FUNCTION(localCalcData);
    
    return localCalcData;
  }

  getCalcData() {
    const calcData = {};
    document.querySelectorAll(`[${this.localOptions.ATTRIBUTE_PREFIX}name]`).forEach(el => {
      const varName = el.attributes[`${this.localOptions.ATTRIBUTE_PREFIX}name`].value;
      if (!calcData.hasOwnProperty(varName)) {
        calcData[varName] = this.getElementValue(el);
      }
    });
    
    return calcData;
  }

  getElementValue(element) {
    const attributeName = element.getAttribute(`${this.localOptions.ATTRIBUTE_PREFIX}attribute`);

    return (attributeName) 
      ? element.getAttribute(attributeName)
      : (element?.tagName?.toLowerCase() === 'input')
        ? element?.value
        : element?.textContent?.trim()
    ;
  }

  setElementValue(element, value) {
    const attributeName = element.getAttribute(`${this.localOptions.ATTRIBUTE_PREFIX}attribute`);
    if (attributeName) {
      element.setAttribute(attributeName, value);
    } else {
      if (element?.tagName?.toLowerCase() === 'input') {
        element.value = value;
      } else {
        element.textContent = value;
      }
    }
  }


  
}
