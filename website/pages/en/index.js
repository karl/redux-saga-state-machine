const React = require('react');

const CompLibrary = require('../../core/CompLibrary.js');

const MarkdownBlock = CompLibrary.MarkdownBlock; /* Used to read markdown */
const Container = CompLibrary.Container;
const GridBlock = CompLibrary.GridBlock;

const siteConfig = require(`${process.cwd()}/siteConfig.js`);

function imgUrl(img) {
  return `${siteConfig.baseUrl}img/${img}`;
}

function docUrl(doc, language) {
  return `${siteConfig.baseUrl}docs/${language ? `${language}/` : ''}${doc}`;
}

function pageUrl(page, language) {
  return siteConfig.baseUrl + (language ? `${language}/` : '') + page;
}

class Button extends React.Component {
  render() {
    return (
      <div className="pluginWrapper buttonWrapper">
        <a className="button" href={this.props.href} target={this.props.target}>
          {this.props.children}
        </a>
      </div>
    );
  }
}

Button.defaultProps = {
  target: '_self',
};

const SplashContainer = props => (
  <div className="homeContainer">
    <div className="homeSplashFade">
      <div className="wrapper homeWrapper">{props.children}</div>
    </div>
  </div>
);

const Logo = props => (
  <div className="projectLogo">
    <img src={props.img_src} alt="Project Logo" />
  </div>
);

const ProjectTitle = () => (
  <h2 className="projectTitle">
    {siteConfig.title}
    <small>{siteConfig.tagline}</small>
    <div style={{ fontSize: '1rem', color: '#666666' }}>
      <b>⚠️ A work in progress!</b>
    </div>
  </h2>
);

const PromoSection = props => (
  <div className="section promoSection">
    <div className="promoRow">
      <div className="pluginRowBlock">{props.children}</div>
    </div>
  </div>
);

class HomeSplash extends React.Component {
  render() {
    const language = this.props.language || '';
    return (
      <SplashContainer>
        <Logo img_src={imgUrl('logo.svg')} />
        <div className="inner">
          <ProjectTitle />
          <PromoSection>
            <Button href={pageUrl('example', language)}>Example</Button>
            <Button href="https://codesandbox.io/s/ol1rko7l35?expanddevtools=1">Try it out on Code Sandbox</Button>
          </PromoSection>
        </div>
      </SplashContainer>
    );
  }
}

const Features = () => (
  <Container
    padding={['bottom']}>
    <MarkdownBlock>{`
## Example

https://redux-saga-state-machine.netlify.com

## Installing

\`\`\`
yarn add redux-saga-state-machine
\`\`\`

You'll also need to install the peer dependencies of Redux, Redux Saga, and xstate (if you haven't already)

\`\`\`
yarn add redux redux-saga xstate
\`\`\`

## Using

See a [minimal example on Code Sandbox](https://codesandbox.io/s/ol1rko7l35?expanddevtools=1)

\`\`\`js
import { applyMiddleware, createStore } from 'redux';
import createSagaMiddleware from 'redux-saga';
import { createStateMachineSaga } from 'redux-saga-state-machine';

const setStateMachineState = stateMachineState => {
  return { type: 'SET_STATE', payload: stateMachineState };
};
const press = () => {
  return { type: 'PRESS' };
};

const reducer = (state, action) => {
  switch (action.type) {
    case 'SET_STATE':
      return {
        ...state,
        stateMachineState: action.payload,
      };
    default:
      return state;
  }
};

const saga = createStateMachineSaga({
  initial: 'CLOSED',
  setState: setStateMachineState,
  states: {
    CLOSED: {
      on: {
        PRESS: 'OPEN',
      },
    },
    OPEN: {
      on: {
        PRESS: 'CLOSED',
      },
    },
  },
});

const sagaMiddleware = createSagaMiddleware();
const store = createStore(reducer, applyMiddleware(sagaMiddleware));

sagaMiddleware.run(saga, {
  getState: store.getState,
  dispatch: store.dispatch,
});

console.log(store.getState().stateMachineState);
// 'CLOSED'

store.dispatch(press());
console.log(store.getState().stateMachineState);
// 'OPEN'

store.dispatch(press());
console.log(store.getState().stateMachineState);
// 'CLOSED'
\`\`\`
`}
    </MarkdownBlock>
  </Container>
);

class Index extends React.Component {
  render() {
    const language = this.props.language || '';

    return (
      <div>
        <HomeSplash language={language} />
        <div className="mainContainer">
          <Features />
        </div>
      </div>
    );
  }
}

module.exports = Index;
