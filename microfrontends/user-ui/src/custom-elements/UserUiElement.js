import './public-path';
import React from 'react';
import { createRoot } from 'react-dom/client';
import UserUi from '../UserUi';
import KeycloakContext from '../KeycloakContext';

const KEYCLOAK_EVENT_TYPE = 'keycloak';

const getKeycloakInstance = () =>
  (window &&
    window.entando &&
    window.entando.keycloak &&
    { ...window.entando.keycloak, initialized: true }
  ) || { initialized: false };

const ATTRIBUTES = {
  config: 'config'
};

class UserUiElement extends HTMLElement {
  mountPoint;
  root;

  keycloak = getKeycloakInstance();

  constructor() {
    super();

    this.handleKeycloakUpdate = this.handleKeycloakUpdate.bind(this);
  }

  static get observedAttributes() {
    return Object.values(ATTRIBUTES);
  }

  connectedCallback() {
    this.mountPoint = document.createElement('div');
    this.appendChild(this.mountPoint);
    this.root = createRoot(this.mountPoint);

    this.keycloak = { ...getKeycloakInstance(), initialized: true };

    window.addEventListener(KEYCLOAK_EVENT_TYPE, this.handleKeycloakUpdate);

    this.render();
  }

  attributeChangedCallback(attribute, oldValue, newValue) {
    if (!UserUiElement.observedAttributes.includes(attribute)) {
      throw new Error(`Untracked changed attributes: ${attribute}`)
    }
    if (this.mountPoint && newValue !== oldValue) {
      this.render();
    }
  }

  disconnectedCallback() {
    window.removeEventListener(KEYCLOAK_EVENT_TYPE, this.handleKeycloakUpdate)
  }

  handleKeycloakUpdate() {
    this.keycloak = { ...getKeycloakInstance(), initialized: true };
    this.render();
  }

  render() {
    const attributeConfig = this.getAttribute(ATTRIBUTES.config);
    const config = attributeConfig && JSON.parse(attributeConfig);

    this.root.render(
      <KeycloakContext.Provider value={this.keycloak}>
        <UserUi config={config} />
      </KeycloakContext.Provider>
    );
  }
}

customElements.define('user-ui', UserUiElement);
