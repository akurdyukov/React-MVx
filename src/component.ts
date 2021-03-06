/**
 * React components
 */

import * as React from 'react'
import { Record, Store, extendable, mergeProps, mixinRules, tools, Mixable, MixinRules } from 'type-r'
import Link from './Link'
import processSpec, { TypeSpecs } from './define'

const reactMixinRules : MixinRules = {
    componentWillMount        : 'reverse',
    componentDidMount         : 'reverse',
    componentWillReceiveProps : 'reverse',
    shouldComponentUpdate     : 'some',
    componentWillUpdate       : 'reverse',
    componentDidUpdate        : 'reverse',
    componentWillUnmount      : 'sequence',
    state                     : 'merge',
    store                     : 'merge',
    props                     : 'merge',
    context                   : 'merge',
    childContext              : 'merge',
    getChildContext           : 'mergeSequence'
};

@extendable
@mixinRules( reactMixinRules )
export abstract class Component<P> extends React.Component<P, Record> {
    static state? : TypeSpecs | typeof Record
    static store? : TypeSpecs | typeof Store
    static props? : TypeSpecs
    static autobind? : string
    static context? : TypeSpecs
    static childContext? : TypeSpecs
    static pureRender? : boolean

    private static propTypes: any;
    private static defaultProps: any;
    private static contextTypes : any;
    private static childContextTypes : any;

    linkAt( key : string ) : Link< any> {
        // Quick and dirty hack to suppres type error - refactor later.
        return (<any>this.state).linkAt( key );
    }

    linkAll( ...keys : string[] ) : { [ key : string ] : Link<any> }
    linkAll(){
        // Quick and dirty hack to suppres type error - refactor later.
        return (<any>this.state).linkAll.apply( this, arguments );
    }

    static define( protoProps, staticProps ){
        var BaseClass          = tools.getBaseClass( this ),
            staticsDefinition = tools.getChangedStatics( this, 'state', 'store', 'props', 'autobind', 'context', 'childContext', 'pureRender' ),
            combinedDefinition = tools.assign( staticsDefinition, protoProps || {} );

        var definition = processSpec( combinedDefinition, this.prototype );

        const { getDefaultProps, propTypes, contextTypes, childContextTypes, ...protoDefinition } = definition;

        if( getDefaultProps ) this.defaultProps = definition.getDefaultProps();
        if( propTypes ) this.propTypes = propTypes;
        if( contextTypes ) this.contextTypes = contextTypes;
        if( childContextTypes ) this.childContextTypes = childContextTypes;

        Mixable.define.call( this, protoDefinition, staticProps );

        return this;
    }

    readonly state : Record
    readonly store? : Store

    assignToState( x, key ){
        this.state.assignFrom({ [ key ] : x });
    }
}

/**
 * ES5 components definition factory
 */
export function createClass( a_spec ){
    const { mixins = [], ...spec } = processSpec( a_spec );
    
    // We have the reversed sequence for the majority of the lifecycle hooks.
    // So, mixins lifecycle methods works first. It's important.
    // To make it consistent with class mixins implementation, we override React mixins.
    for( let mixin of mixins ){
        mergeProps( spec, mixin, reactMixinRules );
    }

    return React.createClass( spec );
}