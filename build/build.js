'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = dynamicReact;
exports.reactifyAttributes = reactifyAttributes;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function dynamicReact(html) {
  var visitorFunc = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : function () {
    return false;
  };
  var key = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'dynamic_component';

  var root = document.createElement('div');
  root.innerHTML = html;
  var combinedVisitor = function combinedVisitor(node) {
    var result = visitorFunc && visitorFunc(node);
    if (visitorFunc !== null && (result || result === null)) {
      // return null to not render something for the node
      return result;
    }
    return defaultVisitorFunc(node);
  };
  if (root.childNodes.length === 1) {
    return recursiveDynamicReact(root.childNodes[0], combinedVisitor, key);
  } else {
    return _lodash2.default.map(root.childNodes, function (childNode, index) {
      return recursiveDynamicReact(childNode, combinedVisitor, key, 0, index);
    });
  }
}

function recursiveDynamicReact(node, visitorFunc, key) {
  var level = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;
  var index = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 0;

  var result = visitorFunc(node);
  if (!result) {
    return null;
  }

  if (result.type === 'text') {
    return result.Component;
  }

  var Component = result.Component;

  if (result.isVoidTag) {
    return _react2.default.createElement(Component, Object.assign({ key: key + '_' + level + '_' + index }, result.props));
  }

  return _react2.default.createElement(
    Component,
    Object.assign({ key: key + '_' + level + '_' + index }, result.props),
    _lodash2.default.map(node.childNodes, function (childNode, i) {
      return recursiveDynamicReact(childNode, visitorFunc, level + 1, i);
    })
  );
}

var voidTags = ['IMG', 'INPUT', 'BR', 'AREA', 'BASE', 'META', 'COL', 'HR', 'PARAM', 'LINK', 'COMMAND', 'KEYGEN', 'SOURCE'];
function defaultVisitorFunc(node) {
  if (node.nodeName === '#text') {
    return {
      type: 'text',
      Component: node.textContent
    };
  }

  if (node.nodeName === 'SCRIPT') {
    return null;
  }
  return {
    type: 'node',
    isVoidTag: _lodash2.default.includes(voidTags, node.nodeName),
    props: reactifyAttributes(node),
    Component: node.nodeName
  };
}
var mapAttrs = {
  defaultvalue: 'defaultValue',
  defaultchecked: 'defaultChecked',
  class: 'className',
  for: 'htmlFor'
};

function reactifyAttributes(node) {
  var attrs = _lodash2.default.reduce(node.attributes, function (result, value) {
    if (mapAttrs[value.nodeName]) {
      result[mapAttrs[value.nodeName]] = value.textContent;
    } else {
      result[value.nodeName] = value.textContent;
    }
    return result;
  }, {});
  return attrs;
}
