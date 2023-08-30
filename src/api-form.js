class WebflowMagic_ApiForm {
  localOptions = {}
  defaultOptions = {
    ATTRIBUTE_PREFIX: 'magic-apiform-',
    IP_FIELD_NAME: null,
    METHOD: 'JSONP', // GET, POST, JSONP
    HEADERS: { // not available for JSONP
      'Content-Type': 'application/json',
    },
    DATA_PROCESSING_FUNCTION: (data) => { return data },
    AFTER_SUBMIT_FUNCTION: async (response, {url, data}) => { 
      console.info('WebflowMagic_ApiForm submited:', {url, data, response});
    }, 
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
    const FORMS_SELECTOR = `form[${this.localOptions.ATTRIBUTE_PREFIX}url]`;
    if (this.localOptions.IP_FIELD_NAME) {
      // set all IP fields to client's IP addr
      fetch('https://api.ipify.org?format=json')
        .then((response) => response.json())
        .then((json) => {
          if (json.ip) {
            document.querySelectorAll(`${FORMS_SELECTOR} [name=${this.localOptions.IP_FIELD_NAME}]`).forEach(el => el.value = json.ip);
          }
        })
      ;
    }

    document.querySelectorAll(FORMS_SELECTOR).forEach(formEl => {
      formEl.addEventListener('submit', async (event) => {
        event.preventDefault();

        const apiUrl = formEl.getAttribute(`${this.localOptions.ATTRIBUTE_PREFIX}url`);

        if (!apiUrl || !this.isValidWebUrl(apiUrl)) {
          console.error(`Form should have attribute '${this.localOptions.ATTRIBUTE_PREFIX}url' with valid url.`, formEl);
          return;
        }

        const formDataJson = {};
        const formData = new FormData(formEl);
        formData.forEach((value, key) => {
          formDataJson[key] = value;
        });

        try {
          await this.sendData(apiUrl, this.localOptions.DATA_PROCESSING_FUNCTION(formDataJson))
        } catch (error) {
          console.error('WebflowMagic_ApiForm submit ERROR:', error);
        }

      })
    }); 
  }

  async sendData(url, data) {
    if (this.localOptions.METHOD.toUpperCase() === 'JSONP') {
      const jsonpUrl = new URL(url);
      
      for (const key in data) {
        jsonpUrl.searchParams.set(key, data[key]);
      }

      this.jsonp(jsonpUrl.toString(), 'aTmpCallback', (response) => {
        this.localOptions.AFTER_SUBMIT_FUNCTION(response, {url, data});
      });
    } else {
      const response = await fetch(url, {
        method: this.localOptions.METHOD,
        headers: this.localOptions.HEADERS,
        body: JSON.stringify(data),
      });
      this.localOptions.AFTER_SUBMIT_FUNCTION(response, {url, data}); 
    }
  }
  
  jsonp(url, dummyCallbackName, successCallback) {
    const script = document.createElement('script');
    script.src = url + (url.indexOf('?') >= 0 ? '&' : '?') + 'callback=' + dummyCallbackName;
    document.body.appendChild(script);
    // Define the callback function in the global scope
    window[dummyCallbackName] = function(data) {
      successCallback(data);
      document.body.removeChild(script); // Clean up the added script tag
      delete window[dummyCallbackName]; // Clean up the global callback function
    };
  }
 
  isValidWebUrl(str) {
    try {
      const newUrl = new URL(str);
      return ['https:', 'http:'].includes(newUrl.protocol);
    } catch (err) {
      return false;
    }
  }
}