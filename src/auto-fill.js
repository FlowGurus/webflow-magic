class WebflowMagic_AutoFill {
  localOptions = {}
  defaultOptions = {
    HIDE_QUERY_PARAMS: false,
    ATTRIBUTE_PREFIX: 'magic-autofill-',
    QUERY_PARAM_PREFIX: 'magic_',
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
    // loop thru magic-autofill-element="item" nodes
    document.querySelectorAll(`[${this.localOptions.ATTRIBUTE_PREFIX}element=item]`).forEach((itemNode) => {
      // find magic-autofill-element="link" nodes
      const linkNodes = itemNode.querySelectorAll(`[${this.localOptions.ATTRIBUTE_PREFIX}element=link]`);
      if (linkNodes.length === 0) {
        console.warn(`No elements with attribute "${this.localOptions.ATTRIBUTE_PREFIX}element"="link" was found inside item`, itemNode);
        return;
      }
      // find inputs for params (magic-autofill-text="some_param_name")
      const paramInputNodes = this.getItemInputNodes(itemNode);
      paramInputNodes.forEach(el => {
        // prevent that inputs from submitting the form by Enter keypress
        el.addEventListener('keypress', (event) => {
          const key = event.charCode || event.keyCode || 0;     
          if (key === 13) event.preventDefault();
        });
      });

      // draft concept: submit form if there's one inside the item when magic-autofill-submit="true"
      const submitForm = (document.querySelector(`[${this.localOptions.ATTRIBUTE_PREFIX}submit]`)?.attributes[`${this.localOptions.ATTRIBUTE_PREFIX}submit`]?.value === 'true');
      
      if (this.localOptions.HIDE_QUERY_PARAMS) {
        // add click handlers for link nodes
        linkNodes.forEach(linkNode => {
          const clickHandler = (event) => {
            if (event.buttons === 1) return; // skip mousedown when normal click
            const params = this.getItemParams(itemNode);
            localStorage.setItem(`${this.localOptions.ATTRIBUTE_PREFIX}data`, JSON.stringify(params));
            
            paramInputNodes.forEach(inputNode => {
              if (!inputNode.validity.valid) event.preventDefault();
              else if (submitForm) {
                const formNode = inputNode.closest('form');
                if (formNode) {
                  if (formNode.action) {
                    event.preventDefault();
                    // draft concept: submit form
                    fetch(formNode.action, { mode: 'no-cors', method: formNode.method, body: new URLSearchParams(new FormData(formNode)) })
                    .then(() => {
                      if (event.type === 'click') {
                        location.href = linkNode.href;
                      }
                    });
                  }
                }
              }
            });            
          }
          linkNode.addEventListener('mousedown', clickHandler);
          linkNode.addEventListener('click', clickHandler);
        });
      } else {
        const params = this.getItemParams(itemNode, this.localOptions.QUERY_PARAM_PREFIX);
        
        linkNodes.forEach(el => {
          const newUrl = new URL(el.href);
          for(let [key, value] of Object.entries(params)) {
            newUrl.searchParams.set(key,value);
          }
          el.href = newUrl.toString();
        });
      }
    });

    document.querySelectorAll(`[${this.localOptions.ATTRIBUTE_PREFIX}element=form]`).forEach((formNode) => {
      if (this.localOptions.HIDE_QUERY_PARAMS) {
        const params = JSON.parse(localStorage.getItem(`${this.localOptions.ATTRIBUTE_PREFIX}data`));
        if (params && typeof params === 'object') {
          for(let [fieldName, value] of Object.entries(params)) {
            this.setFormFieldValue(formNode, fieldName, value); 
          }
        }
      } else {
        const url = new URL(window.location);
        url.searchParams.forEach((value, key) => {
          if (key.startsWith(this.localOptions.QUERY_PARAM_PREFIX)) {
            const fieldName = key.replace(this.localOptions.QUERY_PARAM_PREFIX, '');
            this.setFormFieldValue(formNode, fieldName, value);
          }
        });
      }
    });
  }
  
  getItemParams(itemNode, namePrefix='') {
    const params = {};
    const paramNodes = itemNode.querySelectorAll(`[${this.localOptions.ATTRIBUTE_PREFIX}text]`);
    if (paramNodes.length === 0) {
      console.warn(`No elements with attribute "${this.localOptions.ATTRIBUTE_PREFIX}text" was found inside item`, itemNode);
      return;
    }
    paramNodes.forEach((el) => {
      const attributeName = el.attributes[`${this.localOptions.ATTRIBUTE_PREFIX}attribute`]?.value;
      const value = (attributeName) 
        ? el.attributes[attributeName]?.value ?? el[attributeName]
        : (el?.tagName?.toLowerCase() === 'input')
          ? el?.value
          : el?.textContent?.trim()
      ;
      const name = el.attributes[`${this.localOptions.ATTRIBUTE_PREFIX}text`]?.value?.trim();
      if (name) params[namePrefix+name] = value;
    });
    return params;
  }
  getItemInputNodes(itemNode) {
    return itemNode.querySelectorAll(`[${this.localOptions.ATTRIBUTE_PREFIX}text][name]`);
  }

  setFormFieldValue(formNode, fieldName, value) {
    // for now only textareas and input type=text|email|tel|hidden is supported
    let inputNode = formNode.querySelector(`textarea[name=${fieldName}],input[type=text][name=${fieldName}],input[type=email][name=${fieldName}],input[type=tel][name=${fieldName}],input[type=hidden][name=${fieldName}]`);
    if (inputNode == null) {
      inputNode = document.createElement('input');
      inputNode.type = 'hidden';
      inputNode.name = fieldName;
      formNode.append(inputNode);
    }
    inputNode.value = value;
  }

}