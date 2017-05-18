import React from 'react';
import ReactDOM from 'react-dom';
import dangerouslyAtomicHtml, { reactifyAttributes } from './';

export class TestBasic extends React.Component {
  render(){
    return dangerouslyAtomicHtml('<h1>hello world</h1>');
  }
}

export class TestNest extends React.Component {
  render(){
    const html = (
`<div>
  <div>
    <div>
      <h2>Hello</h2>
      <div>
      </div>
    </div>
    <div>
      <div>
      </div>
    </div>
  </div>
</div>
`
  );
    return dangerouslyAtomicHtml(html);
  }
}

export class TestSanitize extends React.Component {
  render(){
    const html = '<div><script>console.log("Im a cross site scripting attack")</script></div>';
    return dangerouslyAtomicHtml(html);
  }
}

export class TestReactifyAttributes extends React.Component {
  render(){
    const html = '<div class="part1"><div class="part2"><input type="text" class="part3" defaultvalue="america"></div></div>';
    return dangerouslyAtomicHtml(html);
  }
}

export class TestNullPredicate extends React.Component {
  render(){
    const predicate = (node) => {
      if(node.className === 'remove-me'){
        return null;
      }
    }
    const html = '<div><div class="remove-me"></div><div class="remove-me"></div></div>';
    return dangerouslyAtomicHtml(html, predicate);
  }
}

export class TestCustomComponent extends React.Component {
  render(){
    class CustomH1 extends React.Component {
      render(){
        return <h1>{this.props.text}</h1>;
      }
    }
    const predicate = (node) => {
      if(node.className === 'replace-me'){
        return {
          type: 'node',
          Component: CustomH1,
          props: { text: 'IM SOME TEXT' },
        };
      }
    }
    const html = '<div><div class="replace-me"></div></div>';
    return dangerouslyAtomicHtml(html, predicate);
  }
}


export class TestCustomComponentWithChildren extends React.Component {
  render(){
    class CustomH1 extends React.Component {
      render(){
        return <h1>{this.props.children}</h1>;
      }
    }
    const predicate = (node) => {
      if(node.className === 'replace-me'){
        return {
          type: 'node',
          Component: CustomH1,
        };
      }
    }
    const html = '<div><div class="replace-me">I SHOULD BE AN H1</div></div>';
    return dangerouslyAtomicHtml(html, predicate);
  }
}

export class TestCustomFunctionalComponentWithChildren extends React.Component {
  render(){
    function CustomH1(props) {
      return <h1>{props.children}</h1>;
    }
    const predicate = (node) => {
      if(node.className === 'replace-me'){
        return {
          type: 'node',
          Component: CustomH1,
        };
      }
    }
    const html = '<div><div class="replace-me">I SHOULD BE AN H1</div></div>';
    return dangerouslyAtomicHtml(html, predicate);
  }
}

export class TestReactifyAttributesFunctionExport extends React.Component {
  render(){
    function CustomH1(props) {
      return <h1 className={props.className}>{props.children}</h1>;
    }
    const predicate = (node) => {
      if(node.className === 'custom-class'){
        return {
          type: 'node',
          Component: CustomH1,
          props: reactifyAttributes(node),
        };
      }
    }
    const html = '<div><div class="custom-class">I SHOULD BE AN H1</div></div>';
    return dangerouslyAtomicHtml(html, predicate);
  }
}
