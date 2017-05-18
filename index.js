import React from 'react';
import _ from 'lodash';

export default function dynamicReact(html, predicate = () => (false), key = 'dynamic_component'){
  const root = document.createElement('div');
  root.innerHTML = html;
  const combinedPredicate = (node)=>{
    const result = predicate(node);
    if(result || result === null){ // return null to not render something for the node
      return result;
    }
    return defaultPredicate(node);
  }
  return recursiveDynamicReact(root, combinedPredicate, key);
}

function recursiveDynamicReact(node, predicate, key, level = 0, index = 0){
  const result = predicate(node);
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
      {_.map(node.childNodes, (childNode, i) => recursiveDynamicReact(childNode, predicate, level + 1, i))}
    </Component>
  );
}

const voidTags = ['IMG', 'INPUT'];
function defaultPredicate(node){
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

export function reactifyAttributes(node){
  const attrs = _.reduce(node.attributes, (result, value) => {
    if (mapAttrs[value.nodeName]){
      result[mapAttrs[value.nodeName]] = value.textContent;
    } else {
      result[value.nodeName] = value.textContent;
    }
    return result;
  }, {})
  return attrs;
}
