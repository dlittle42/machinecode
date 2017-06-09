/**
 * TextFx.js
 * http://www.codrops.com
 *
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 * 
 * Copyright 2016, Codrops
 * http://www.codrops.com
 */
;(function(window) {

	'use strict';

	/**
	 * Equation of a line.
	 */
	function lineEq(y2, y1, x2, x1, currentVal) {
		// y = mx + b
		var m = (y2 - y1) / (x2 - x1),
			b = y1 - m * x1;

		return m * currentVal + b;
	}

	function TextFx(el) {
		this.el = el;
		this._init();
	}

	TextFx.prototype.effects = {
		
		'fx7' : {
			in: {
				duration: 250,
				delay: function(el, index) { return 100+index*50; },
				easing: 'easeOutCubic',
				opacity: 1,
				translateY: ['20%','0%']
			},
			out: {
				duration: 250,
				delay: function(el, index) { return index*25; },
				easing: 'easeOutCubic',
				opacity: 0,
				translateY: '-20%'
			}
		},
		
	};

	TextFx.prototype._init = function() {
		this.el.classList.add('letter-effect');
		// Split word(s) into letters/spans.
		charming(this.el, {classPrefix: 'letter'});
		this.letters = [].slice.call(this.el.querySelectorAll('span'));
		this.lettersTotal = this.letters.length;
	};
	
	TextFx.prototype._stop = function() {
		anime.remove(this.letters);
		this.letters.forEach(function(letter) { letter.style.WebkitTransform = letter.style.transform = ''; });
	};

	TextFx.prototype.show = function(effect, callback) {
		this._stop();
		arguments.length ? this._animate('in', effect, callback) : this.letters.forEach(function(letter) { letter.style.opacity = 1; });
	};

	TextFx.prototype.hide = function(effect, callback) {
		this._stop();
		arguments.length ? this._animate('out', effect, callback) : this.letters.forEach(function(letter) { letter.style.opacity = 0; });
	};

	TextFx.prototype._animate = function(direction, effect, callback) {
		var effecSettings = typeof effect === 'string' ? this.effects[effect] : effect;

		if( effecSettings.perspective != undefined ) {
			this.el.style.WebkitPerspective = this.el.style.perspective = effecSettings.perspective + 'px';
		}
		if( effecSettings.origin != undefined ) {
			this.letters.forEach(function(letter) { 
				letter.style.WebkitTransformOrigin = letter.style.transformOrigin = effecSettings.origin;
			});
		}

		// Custom effect
		var iscustom = this._checkCustomFx(direction, effect, callback);

		var animOpts = effecSettings[direction],
			target = this.letters;
		
		target.forEach(function(t,p) { 
			if( t.innerHTML === ' ' ) {
				target.splice(p, 1);
			}
		});

		animOpts.targets = target;
		
		if( !iscustom ) {
			animOpts.complete = callback;
		}

		anime(animOpts);
	};

	/**
	 * Extra stuff for an effect.. this is just an example for effect 17.
	 * TODO! (for now, just some quick way to implement something different only for fx17)
	 */
	TextFx.prototype._checkCustomFx = function(direction, effect, callback) {
		var custom = typeof effect === 'string' && effect === 'fx17' && direction === 'out';
		
		if( custom ) {
			var tmp = document.createElement('div');
			tmp.style.width = tmp.style.height = '100%';
			tmp.style.top = tmp.style.left = 0;
			tmp.style.background = '#e24b1e';
			tmp.style.position = 'absolute';
			tmp.style.WebkitTransform = tmp.style.transform = 'scale3d(0,1,1)';
			tmp.style.WebkitTransformOrigin = tmp.style.transformOrigin = '0% 50%';
			this.el.appendChild(tmp);
			var self = this;
			anime({
				targets: tmp,
				duration: 400,
				easing: 'easeInOutCubic',
				scaleX: [0,1],
				complete: function() {
					tmp.style.WebkitTransformOrigin = tmp.style.transformOrigin = '100% 50%';
					anime({
						targets: tmp,
						duration: 400,
						easing: 'easeInOutCubic',
						scaleX: [1,0],
						complete: function() {
							self.el.removeChild(tmp);
							if( typeof callback === 'function' ) {
								callback();
							}
						}
					});
				}
			});
		}

		return custom;
	};

	window.TextFx = TextFx;

})(window);