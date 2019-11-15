# Delegates focus polyfill

This package adds support for the `delegatesFocus` flad to the `HTMLElement.attachShadowRoot` method. Setting the value to `true` will allow the shadow host to delegate its focus events and calls to the first focusable element inside the shadow DOM.

This article on MDN will illustarate how to use the feature and browser support. The syntax is as follows.

```javascript
someElement.attachShadow({
  mode: 'open',
  delegatesFocus: true
});
```

This will also add the `delegatesFocus` property to the shadow root object with the value associated with the flag.

```javascript
someElement.shadowRoot.delegatesFocus === true; // would evaluate to true
```