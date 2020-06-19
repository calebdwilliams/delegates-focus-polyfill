const attachShadow = HTMLElement.prototype.attachShadow;

const _div = document.createElement('div');
_div.attachShadow({ mode: 'open', delegatesFocus: true });

if (!_div.shadowRoot.delegatesFocus) {
  Object.defineProperty(HTMLElement.prototype, 'attachShadow', {
    value(config) {
      const shadowRoot = attachShadow.bind(this)(config);
      shadowRoot.delegatesFocus = config.delegatesFocus;
      if (config.delegatesFocus) {
        const focus = this.focus;

        this.focus = function() {
          const focusable = shadowRoot.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
          focus.bind(this)();
          focusable[0].focus();
        }
      }
      return shadowRoot;
    }
  });
}
