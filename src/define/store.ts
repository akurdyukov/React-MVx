import { collectSpecs } from './typeSpecs'
import { Store } from 'type-r'
import { StateMixin, UpdateOnNestedChangesMixin } from './state'

export default function process( spec, baseProto ){
    const store = collectSpecs( spec, 'store' );

    if( store ){
        delete spec.store;

        if( store instanceof Store ){
            // Direct reference to an existing store. Put it to the prototype.
            spec.store = store;
            spec.mixins.push( ExternalStoreMixin );
        }
        else {
            spec.Store = store;
            spec.mixins.push( InternalStoreMixin );
            spec.mixins.push( UpdateOnNestedChangesMixin );
        }

        spec.mixins.push( ExposeStoreMixin );
    }
}

/**
 * Attached whenever the store declaration of any form is present in the component.
 */
const ExposeStoreMixin = {
    childContext : {
        _nestedStore : Store
    },

    getChildContext(){
        return { _nestedStore : this.store };
    },

    getStore(){
        return this.store;
    },

    // Will be called by the store when the lookup will fail.
    get( key ){
        // Ask upper store.
        const store = StateMixin.getStore.call( this, key );
        return store && store.get( key );
    }
};

/**
 * External store must just track the changes and trigger render.
 * TBD: don't use it yet.
 */
const ExternalStoreMixin = {
    componentDidMount(){
        // Start UI updates on state changes.
        this.listenTo( this.store, 'change', this.asyncUpdate );
    }
};

const InternalStoreMixin = {
    componentWillMount(){
        var store = this.store = new this.Store();
        store._owner = this;
        store._ownerKey = 'store';
    },

    componentWillUnmount(){
        this.store._ownerKey = this.store._owner = void 0;
        this.store.dispose();
        this.store = void 0;
    }
};
