import React from 'react';
import TestUtils from 'react-dom/test-utils';
import {
  TestBasic,
  TestNest,
  TestSanitize,
  TestReactifyAttributes,
  TestNullPredicate,
  TestCustomComponent,
  TestCustomComponentWithChildren,
  TestCustomFunctionalComponentWithChildren,
  TestReactifyAttributesFunctionExport,
  TestMultiSiblingRoot
} from './test_classes';

it('renders basic html', () => {
  const result = TestUtils.renderIntoDocument(<TestBasic />);
  const h1 = TestUtils.findRenderedDOMComponentWithTag(result, 'h1');
  expect(h1.textContent).toBe('hello world');
});

it('renders nested html', () => {
  const result = TestUtils.renderIntoDocument(<TestNest />);
  const divs = TestUtils.scryRenderedDOMComponentsWithTag(result, 'div');
  expect(divs.length).toBe(6);
});

it('sanitizes script tags', () => {
  const result = TestUtils.renderIntoDocument(<TestSanitize />);
  const scripts = TestUtils.scryRenderedDOMComponentsWithTag(result, 'script');
  expect(scripts.length).toBe(0);
});

it('adds attributes as props to react components', () => {
  const result = TestUtils.renderIntoDocument(<TestReactifyAttributes />);
  const part1 = TestUtils.findRenderedDOMComponentWithClass(result, 'part1');
  expect(part1).toBeDefined();
  const part2 = TestUtils.findRenderedDOMComponentWithClass(result, 'part2');
  expect(part2).toBeDefined();
  const part3 = TestUtils.findRenderedDOMComponentWithClass(result, 'part3');
  expect(part3.tagName).toBe('INPUT');
  expect(part3.defaultValue).toBe('america');
});

it('should not render elements where the predicate returns null', () => {
  const result = TestUtils.renderIntoDocument(<TestNullPredicate />);
  const removeMe = TestUtils.scryRenderedDOMComponentsWithClass(result, 'remove-me');
  const divs = TestUtils.scryRenderedDOMComponentsWithTag(result, 'div');
  expect(divs.length).toBe(1);
  expect(removeMe.length).toBe(0);
});

it('renders a custom component with its props', () => {
  const result = TestUtils.renderIntoDocument(<TestCustomComponent />);
  const h1 = TestUtils.findRenderedDOMComponentWithTag(result, 'h1');
  expect(h1.textContent).toBe('IM SOME TEXT');
});

it('renders a custom component with its children', () => {
  const result = TestUtils.renderIntoDocument(<TestCustomComponentWithChildren />);
  const h1 = TestUtils.findRenderedDOMComponentWithTag(result, 'h1');
  expect(h1.textContent).toBe('I SHOULD BE AN H1');
});

it('renders a custom component with its children', () => {
  const result = TestUtils.renderIntoDocument(<TestCustomFunctionalComponentWithChildren />);
  const h1 = TestUtils.findRenderedDOMComponentWithTag(result, 'h1');
  expect(h1.textContent).toBe('I SHOULD BE AN H1');
});

it('lets you use the exported reactify attributes', () => {
  const result = TestUtils.renderIntoDocument(<TestReactifyAttributesFunctionExport />);
  const h1 = TestUtils.findRenderedDOMComponentWithTag(result, 'h1');
  expect(h1.className).toBe('custom-class');
});

it('renders non nested root components', () => {
  const result = TestUtils.renderIntoDocument(<TestMultiSiblingRoot />);
  const divs = TestUtils.scryRenderedDOMComponentsWithTag(result, 'div');
  expect(divs.length).toBe(3);
});
