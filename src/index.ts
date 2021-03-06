import * as React from 'react'
import { define, Record, Store, mixins, mixinRules, ChainableAttributeSpec } from 'type-r'
import processSpec, { Node, Element, TypeSpecs } from './define'
import Link from './link'
import { Component, createClass } from './component'

interface ReactMVx{
    // It's ES6 module
    default : ReactMVx
    
    // MixtureJS decorators...
    define : typeof define
    mixins : typeof mixins
    mixinRules : typeof mixinRules

    // Overriden components
    createClass : typeof createClass
    Component : typeof Component

    // additional ReactMVx types
    Link : typeof Link
    Node : ChainableAttributeSpec
    Element : ChainableAttributeSpec

    // Helper methods
    assignToState : typeof Component.prototype.assignToState
}

// extend React namespace
const ReactMVx : ReactMVx = Object.create( React );

// Make it compatible with ES6 module format.
ReactMVx.default = ReactMVx;
export default ReactMVx;

// listenToProps, listenToState, model, attributes, Model
ReactMVx.createClass = createClass;
ReactMVx.define = define;
ReactMVx.mixins = mixins;

ReactMVx.Node = Node.value( null );
ReactMVx.Element = Element.value( null );
ReactMVx.Link = Link;

ReactMVx.Component = Component;
ReactMVx.assignToState = Component.prototype.assignToState;