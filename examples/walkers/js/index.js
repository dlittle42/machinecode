var buttons = 256,
	rows = 16;
var cols = rows;
var wLoaded = false,
	nLoaded = false;

$(document).ready(function() {
	var holder = $('#board .holder'),
		note = $('.note');
	var notes = [];

	for (var i = 0; i < rows; i++) {
		notes[i] = new Howl({
			urls: ['https://s3-us-west-2.amazonaws.com/s.cdpn.io/380275/' + i + '.mp3',
				'https://s3-us-west-2.amazonaws.com/s.cdpn.io/380275/' + i + '.ogg'
			],
			onload: loadCount(i + 1)
		});
	}

	$(window).load(function() {
		bindUserActions();
		initControls();

		wLoaded = true;
		if (nLoaded)
			$('#board').removeClass('loading').addClass('forward');

		for (var i = 0; i < rows; i++) {
			bindNote(i);
		}
	});

	function loadCount(i) {

		if (i === rows) {
			nLoaded = true;
			if (wLoaded)
				$('#board').removeClass('loading').addClass('forward');
		}
	}

	function bindNote(currNote) {
		$('#board .holder:nth-child(' + cols + 'n + ' + currNote + ')')
		.on('webkitAnimationIteration mozAnimationIteration animationiteration', 
		function() {
			if ($(this).hasClass('active')) {
				var currNote = $(this).attr('data-note');
				notes[currNote].play();

				$(this).find('.ripple').addClass('huzzar').delay(500).queue(function() {
					$(this).removeClass('huzzar').dequeue();
				});
			}
		});
	}

	function bindUserActions() {
		$(note).mousedown(function() {
			$(this).toggleClass("active");
			$(this).parent().toggleClass("active");
		});
		$(document).mousedown(function() {
			$(note).bind('mouseover', function() {
				$(this).toggleClass("active");
				$(this).parent().toggleClass("active");
			});
		}).mouseup(function() {
			$(note).unbind('mouseover');
		});
		
	}

	function initControls() {
		$('#reset').on('click', function() {
			$('.active').removeClass('active');
		});
		$('#audio').on('click', function() {
			if ($(this).hasClass("mute"))
				Howler.unmute();
			else
				Howler.mute();
			$(this).toggleClass('mute');
		});


	}

});