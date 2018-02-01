import React from 'react';
import _ from 'lodash';

export default function dynamicReact(html, visitorFunc = () => (false), key = 'dynamic_component'){
  const root = document.createElement('div');
  root.innerHTML = html;
  const combinedVisitor = (node)=>{
    const result = visitorFunc && visitorFunc(node);
    if(visitorFunc !== null && (result || result === null)){ // return null to not render something for the node
      return result;
    }
    return defaultVisitorFunc(node);
  }
  if(root.childNodes.length === 1) {
    return recursiveDynamicReact(root.childNodes[0], combinedVisitor, key);
  } else {
    return _.map(root.childNodes, (childNode, index) => recursiveDynamicReact(childNode, combinedVisitor, key, 0, index));
  }
}

function recursiveDynamicReact(node, visitorFunc, key, level = 0, index = 0){
  const result = visitorFunc(node);
  if(!result) {
    return null;
  }

  if(result.type === 'text'){
    return result.Component;
  }

  const { Component } = result;
  if(result.isVoidTag) {
    return <Component key={`${key}_${level}_${index}`} {...result.props} />;
  }

  return (
    <Component key={`${key}_${level}_${index}`} {...result.props}>
      {_.map(node.childNodes, (childNode, i) => recursiveDynamicReact(childNode, visitorFunc, level + 1, i))}
    </Component>
  );
}

const voidTags = ['IMG', 'INPUT', 'BR', 'AREA', 'BASE', 'META', 'COL', 'HR', 'PARAM', 'LINK', 'COMMAND', 'KEYGEN', 'SOURCE'];
function defaultVisitorFunc(node){
  if (node.nodeName === '#text') {
    return {
      type: 'text',
      Component: node.textContent,
    }
  }

  if (node.nodeName === 'SCRIPT') {
    return null;
  }
  return {
    type: 'node',
    isVoidTag: _.includes(voidTags, node.nodeName),
    props: reactifyAttributes(node),
    Component: node.nodeName
  };
}
const mapAttrs = {
  defaultvalue: 'defaultValue',
  defaultchecked: 'defaultChecked',
  class: 'className',
  for: 'htmlFor',
}

function caseKey(key) {
  // React rules for naming inline styles:
  // https://react-cn.github.io/react/tips/inline-styles.html
  let newKey = _.camelCase(key);
  if (key.charAt(0) == '-' && !_.startsWith(key, '-ms')) {
    newKey = _.upperFirst(newKey);
  }
  return newKey;
}

export function reactifyAttributes(node){
  const attrs = _.reduce(node.attributes, (result, value) => {
    if (mapAttrs[value.nodeName]){
      result[mapAttrs[value.nodeName]] = value.textContent;
    } else {
      if (value.nodeName == 'style') {
        result.style = _(value.textContent.trim().split(';'))
          .compact()
          .reduce((acc, key) => {
            const parts = key.trim().split(':');
            acc[caseKey(parts[0])] = parts[1].trim();
            return acc;
          }, {}
        );
      } else {
        result[value.nodeName] = value.textContent;
      }
    }
    return result;
  }, {})
  return attrs;
}
