# dangerously-atomic-html

## Introduction
Sometimes you can't avoid having to do dangerouslySetInnerHtml in your React apps. But, once you have dangerously set some html in react you lose all control of that part of the DOM. Dangerously Atomic Html takes html and dynamically turns it into react components at run time. This is useful for working with output from tools like tinyMCE or when looking at search results from elastic search.

## Installation
dangerously-atomic-html has a peer dependency of `"react": ">=14.0.0`

To install run `yarn add dangerously-atomic-html`

## Basic Usage
```javascript
import React from 'react';
import dangerouslyAtomicHtml from 'dangerously-atomic-html';

class Example extends React.Component {
  render(){
    const html = '<h1 class="title">Hello, world!</h1>';
    return dangerouslyAtomicHtml(html);
    /* the same as doing
    return (
      <h1 className="title">Hello, world</h1>
    );
    */
  }
}

```
Take note that dangerouslyAtomicHtml does not wrap your html in a div or any other tag. Consider the following example:

```javascript
render(){
  const html = '<label for="input1">Email</label><input id="input1">';
  return dangerouslyAtomicHtml(html); // invariant violation
  /* to correct this you need to do
  return <some tag>{dangerouslyAtomicHtml(...)}</some tag>;
  */
}
```

## Advanced Usage
dangerouslyAtomicHtml accepts a second argument which is function that is a visitor for each DOM node in the html. Those who have worked with babel or eslint plugins will be familiar with this pattern. The visitor function accepts an html node as the only argument and returns an object that describes how you want to transform that node. For example:
```javascript
function visitor(domNode){
  if(domNode.nodeName === 'H1'){ // text nodes will have a node name of `#text`
    return {
      type: 'node', // one of ['node', 'text], use node when returning anything that is not raw text.
      Component: domNode.nodeName, // can be a string that is the the name of an html node, or a react component,
      props: { className: 'custom-class-name' }
    }
  }
}

dangerouslyAtomicHtml('<h1>Welcome!</h1>', visitor);

```
This example adds the class "custom-class-name" to all the h1 tags in the document.

You can also return a react component from the visitor, for example:
```javascript
const html = (
`
<ul>
<li>Item 1</li>
<li>Item 2</li>
<li>Item 3</li>
<li>Item 4</li>
</ul>
`
);

class CustomLi extends React.Component {
  render(){
    // return some custom react stuff
  }
}

function visitor(domNode){
  if(domNode.nodeName === 'LI'){
    return {
      type: 'node',
      Component: CustomLi,
      // the props value is optional
    }
  }
}

dangerouslyAtomicHtml(html, visitor);

/* this would be the same as if you wrote in react
<ul>
  <CustomLi>Item 1</CustomLi>
  <CustomLi>Item 2</CustomLi>
  <CustomLi>Item 3</CustomLi>
  <CustomLi>Item 4</CustomLi>
</ul>
*/

```
Note that if you return a react component for a node that has children then it is up to your react component to handle rendering the children via `this.props.children`.

We also provided a function that will give a hash of the attributes preset on the dom node but in the react format. It takes the node as the only argument. For example:
```javascript
import dangerouslyAtomicHtml, { reactifyAttributes } from 'dangerously-atomic-html'

function visitor(domNode){
  if(domNode.nodeName === 'LI'){
    return {
      type: 'node',
      Component: CustomLi,
      props: reactifyAttributes(domNode)
    }
  }
}
```

This is useful when you want to keep all of the current attributes on a node but maybe modify one of them.

If you are using dangerouslyAtomicHtml more than once in your app you must also provide a third argument that is the key that the component will use, for example:
```javascript
render(){
  return (
    <div>
      {dangerouslyAtomicHtml(someHtml, someVistor, 'component1')}
      {dangerouslyAtomicHtml(someOtherHtml, null, 'component2')}
    </div>
  )
}
```
You must do that because the way react handles iterated components.
## Gotchas

* If a dom node has an onclick attribute (or any other event) then dangerouslyAtomicHtml will throw an error. Event attributes have no meaning when going from html to react. If you suspect that the html you will be transforming has event attributes in it then you will need to have a visitor function that handles those nodes.
* Try to avoid traversing a node's tree in your visitor. Each node has direct access to its parent node. For example instead of having a visitor for a table tag then checking to see if one of its rows has some property, have a visitor on the row and check to see if the parent has some property.
* Beware trailing or leading spaces / newline chars in strings, whitespace is considered a text node in html. For example:
```javascript
render(){
  const html = ' <div></div>';
  return dangerouslyAtomicHtml(html); // invariant violation
  /* this is same as doing
  return [
    ' ',
    <div />
  ]
  which obviously would make react mad
  */
}
```


## Other Ideas of How to Use
* Manipulating text of text nodes. Maybe you have have a comment box that uses tinyMCE and you want to add a link to another user's page when they are mentioned in a comment via @userName. You could find that in a text node and instead render a react component that links you to the users page.
* Templating or theming user created content.

## The Future
* Add support for aria tags
* Transform inline styles to react inline styles

## Contributing
Feel free to submit pull requests and we will look at them as soon as we can.
