THREE.DragControls = function ( _objects, _camera, _domElement ) {

if ( _objects instanceof THREE.Camera ) {


    console.warn( 'THREE.DragControls: Constructor now expects ( objects, camera, domElement )' );
    var temp = _objects; _objects = _camera; _camera = temp;

}

var _plane = new THREE.Plane();
var _raycaster = new THREE.Raycaster();

var _mouse = new THREE.Vector2();
var _offset = new THREE.Vector3();
var _intersection = new THREE.Vector3();

var _selected = null, _hovered = null;



//

var scope = this;

function activate() {

    alert('activate')

    _domElement.addEventListener( 'mousemove', onDocumentMouseMove, false );
    _domElement.addEventListener( 'mousedown', onDocumentMouseDown, false );
    _domElement.addEventListener( 'mouseup', onDocumentMouseUp, false );

    _domElement.addEventListener( 'touchmove', onDocumentTouchmove, false );
    _domElement.addEventListener( 'touchstart', onDocumentTouchstart, false );
    _domElement.addEventListener( 'touchend', onDocumentTouchend, false );

}

function deactivate() {

    _domElement.removeEventListener( 'mousemove', onDocumentMouseMove, false );
    _domElement.removeEventListener( 'mousedown', onDocumentMouseDown, false );
    _domElement.removeEventListener( 'mouseup', onDocumentMouseUp, false );

    _domElement.removeEventListener( 'touchmove', onDocumentTouchmove, false );
    _domElement.removeEventListener( 'touchstart', onDocumentTouchstart, false );
    _domElement.removeEventListener( 'touchend', onDocumentTouchend, false );

}

function dispose() {

    deactivate();

}

function onDocumentMouseMove( event ) {

    event.preventDefault();

    var rect = _domElement.getBoundingClientRect();

    _mouse.x = ( (event.clientX - rect.left) / rect.width ) * 2 - 1;
    _mouse.y = - ( (event.clientY - rect.top) / rect.height ) * 2 + 1;

    _raycaster.setFromCamera( _mouse, _camera );

    if ( _selected && scope.enabled ) {

        if ( _raycaster.ray.intersectPlane( _plane, _intersection ) ) {

            _selected.position.copy( _intersection.sub( _offset ) );

        }

        scope.dispatchEvent( { type: 'drag', object: _selected } );

        return;

    }

    _raycaster.setFromCamera( _mouse, _camera );

    var intersects = _raycaster.intersectObjects( _objects );

    if ( intersects.length > 0 ) {

        var object = intersects[ 0 ].object;

        _plane.setFromNormalAndCoplanarPoint( _camera.getWorldDirection( _plane.normal ), object.position );

        if ( _hovered !== object ) {

            scope.dispatchEvent( { type: 'hoveron', object: object } );

            _domElement.style.cursor = 'pointer';
            _hovered = object;

        }

    } else {

        if ( _hovered !== null ) {

            scope.dispatchEvent( { type: 'hoveroff', object: _hovered } );

            _domElement.style.cursor = 'auto';
            _hovered = null;

        }

    }

}

function onDocumentTouchmove( event ) {

    event.preventDefault();

    var rect = _domElement.getBoundingClientRect();

    _mouse.x = + ( (event.targetTouches[ 0 ].pageX - rect.left) / rect.width ) * 2 - 1;
    _mouse.y = - ( (event.targetTouches[ 0 ].pageY - rect.top) / rect.height ) * 2 + 1;

    _raycaster.setFromCamera( _mouse, _camera );

    if ( _selected && scope.enabled ) {

        if ( _raycaster.ray.intersectPlane( _plane, _intersection ) ) {

            _selected.position.copy( _intersection.sub( _offset ) );

        }

        scope.dispatchEvent( { type: 'drag', object: _selected } );

        return;

    }

}

function onDocumentMouseDown( event ) {

    event.preventDefault();

    _raycaster.setFromCamera( _mouse, _camera );

    var intersects = _raycaster.intersectObjects( _objects );

    if ( intersects.length > 0 ) {

        _selected = intersects[ 0 ].object;

        if ( _raycaster.ray.intersectPlane( _plane, _intersection ) ) {

            _offset.copy( _intersection ).sub( _selected.position );

        }

        _domElement.style.cursor = 'move';

        scope.dispatchEvent( { type: 'dragstart', object: _selected } );

    }

}

function onDocumentTouchstart( event ) {

    event.preventDefault();

    var rect = _domElement.getBoundingClientRect();

    _mouse.x = + ( (event.targetTouches[ 0 ].pageX - rect.left) / rect.width ) * 2 - 1;
    _mouse.y = - ( (event.targetTouches[ 0 ].pageY - rect.top) / rect.height ) * 2 + 1;

    _raycaster.setFromCamera( _mouse, _camera );

    var intersects = _raycaster.intersectObjects( _objects );

    if ( intersects.length > 0 ) {

        var object = intersects[ 0 ].object;

        _plane.setFromNormalAndCoplanarPoint( _camera.getWorldDirection( _plane.normal ), object.position );

        if ( _hovered !== object ) {

            scope.dispatchEvent( { type: 'hoveron', object: object } );

            _domElement.style.cursor = 'pointer';
            _hovered = object;

        }

    } else {

        if ( _hovered !== null ) {

            scope.dispatchEvent( { type: 'hoveroff', object: _hovered } );

            _domElement.style.cursor = 'auto';
            _hovered = null;

        }

    }

    if ( intersects.length > 0 ) {

        _selected = intersects[ 0 ].object;

        if ( _raycaster.ray.intersectPlane( _plane, _intersection ) ) {

            _offset.copy( _intersection ).sub( _selected.position );

        }

        _domElement.style.cursor = 'move';

        scope.dispatchEvent( { type: 'dragstart', object: _selected } );

    }

}

function onDocumentMouseUp( event ) {

    event.preventDefault();

    if ( _selected ) {

        scope.dispatchEvent( { type: 'dragend', object: _selected } );

        _selected = null;

    }

    _domElement.style.cursor = 'auto';

}

function onDocumentTouchend( event ) {

    event.preventDefault();

    if ( _selected ) {

        scope.dispatchEvent( { type: 'dragend', object: _selected } );

        _selected = null;

    }

    _domElement.style.cursor = 'auto';

}

activate();

// API

this.enabled = true;

this.activate = activate;
this.deactivate = deactivate;
this.dispose = dispose;

// Backward compatibility

this.setObjects = function () {

    console.error( 'THREE.DragControls: setObjects() has been removed.' );

};

this.on = function ( type, listener ) {

    console.warn( 'THREE.DragControls: on() has been deprecated. Use addEventListener() instead.' );
    scope.addEventListener( type, listener );

};

this.off = function ( type, listener ) {

    console.warn( 'THREE.DragControls: off() has been deprecated. Use removeEventListener() instead.' );
    scope.removeEventListener( type, listener );

};

this.notify = function ( type ) {

    console.error( 'THREE.DragControls: notify() has been deprecated. Use dispatchEvent() instead.' );
    scope.dispatchEvent( { type: type } );

};

};

THREE.DragControls.prototype = Object.create( 
THREE.EventDispatcher.prototype );
THREE.DragControls.prototype.constructor = THREE.DragControls;