class Input {
    constructor(input, placeholder) {
        this.isFocused = false;
        this.size = 30;
        this.animation = "zoomIn";
        this.hiddenField = $("#hiddenInput");
    

        $(input).addClass("input");
        this.$element = $(document.createElement("div"));
        this.$element.addClass("textZone");
        this.$element.attr("tabindex", 0);
        $(input).append(this.$element);
      //  $('#hiddenInput').value()
        this.cursor = new Cursor(this);
        this.setEvents();
        Keyboard.readCharacters(this);
        Keyboard.readSpecialCharacters(this);
        this.placeholder = new Placeholder(placeholder, this);
    }
    
    setEvents() {
        var input = this;
        
        this.$element.on("click", function(event) {
            input.focus();
            event.stopPropagation();
        });
        
        $(document).on("click", function(event) {
            input.unfocus();    
        });
    }
    
    focus() {
        if (this.size == 30) {
            this.$element.prepend(this.cursor.$element);
        } else {
            this.cursor.$element.insertAfter(this.$element.children().last());
        }
        this.cursor.show();
        this.isFocused = true;
    }
        
    unfocus() {
        if (this.size == 30) {
            this.placeholder.show();
        }
        this.cursor.hide();
        this.isFocused = false;
    }
    
    write(character) {
       // this.size++;
        this.size--;
        this.placeholder.hide();
        character.setEvents(this);
        character.$element.insertAfter(this.cursor.$element);
       
        character.animate(this.animation);
      
       //  console.log(character.$element[0].innerText)
         console.log(this.$element[0].innerText)
         this.hiddenField.val(this.$element[0].innerText);
      //   document.getElementById("texens").value = "tinkumaster";
         console.log(this.hiddenField.val())
        this.cursor.move("right");
    }
    
    erase() {
        var last = this.cursor.$element.prev();
        if (last.length && this.size > 0) {
            this.size--;
            this.cursor.move("left");
            last.remove();
          //  this.written=)this.written.length - 1);
            if (this.size == 30) {
                this.placeholder.show();
            }
        }
    }
    
    suppress() {
        var next = this.cursor.$element.next();
        if (next.length && this.size > 0) {
            this.size--;
            next.remove();
            if (this.size == 30) {
                this.placeholder.show();
            }
        }
    }
}

class Placeholder {
    constructor(placeholder, input) {
        this.input = input;
        this.$element = $(document.createElement("div"));
        this.$element.text(placeholder);
        this.$element.addClass("placeholder");
        this.show();
    }
    
    show() {
        this.input.$element.append(this.$element);
    }
    
    hide() {
        this.$element.remove();
    }
    
    
}

class Keyboard {    
    
    static space(){
    	return 32;
    } 
    static backspace(){
    	return 8;
    }  
    static leftArrow(){
    	return 37;
    } 
    static rightArrow(){
    	return 39;
    } 
    static suppress(){
    	return 46;
    } 
    static to(){
    	return 36;
    }  
    static end(){
    	return 35;
    } 
    
    static readCharacters(input) {
        input.$element.on("keypress", function(event) {
            event.preventDefault();
            input.write(new Character(String.fromCharCode(event.which)));
           // console.log(String.fromCharCode(event.which))
        });
    }

    static readSpecialCharacters(input) {
        input.$element.on("keydown", function(event) {
            switch(event.keyCode) {
                case Keyboard.backspace:
                    event.preventDefault();
                    input.erase();
                    break;
                case Keyboard.leftArrow:
                    input.cursor.move("left");
                    break;
                case Keyboard.rightArrow:
                    input.cursor.move("right");
                    break;
                case Keyboard.suppress:
                    input.suppress();
                    break;
                case Keyboard.top:
                    input.cursor.goTo("top");
                    break;
                case Keyboard.end:
                    input.cursor.goTo("end");
                    break;
                default:
                    break;
            }         
        });
    }
}

class Cursor {
    constructor(input) {
        this.$element = $(document.createElement("div"));
        this.$element.addClass("cursor");
        this.$element.addClass("hidden");
        input.$element.prepend(this.$element);
    }
    
    show() {
        this.$element.removeClass("hidden");
    }
    
    hide() {
        this.$element.addClass("hidden");
    }
    
    move(direction) {
        var offSet = this.$element.get(0).offsetLeft;
        var textZone = this.$element.parent();
        
        if (direction == "right") {
            var next = this.$element.next();
            this.$element.insertAfter(next);
            if (offSet > textZone.width() * 0.99) {
                var scroll = textZone.scrollLeft();
                textZone.animate({scrollLeft: scroll+'100'}, 1000);
            }
        } else if (direction == "left") {
            var prev = this.$element.prev();
            this.$element.insertBefore(prev);
        }          
    }
    
    goTo(point) {
        if (point == "top") {
            this.$element.parent().prepend(this.$element);
        } else if (point == "end") {
            this.$element.parent().append(this.$element);
        }
    }
}

class Character {
    constructor(character) {
        this.$element = $(document.createElement("div"));
        if (character != " ") {
            this.$element.addClass("character");
            this.$element.text(character);
        } else {
            this.$element.addClass("space");
        }
    }
    
    setEvents(input) {
        var character = this;
        this.$element.on("click", function(event) {
            input.cursor.$element.insertBefore(character.$element);
            if (!input.isFocused) {
                input.cursor.show();
            }
            event.stopPropagation();
        });
    }
    
    animate(animation) {
        this.$element.css("animation", animation + " 500ms, colorTransition 500ms");
    }
}


var input = new Input("#myInput", "Enter your email");
input.animation = 'scaleIn';
/*new Selector("#selector", [
    "bounce",
    "fadeIn",
    "fadeInDown",
    "fadeInUp",
    "fadeInLeft",
    "fadeInRight",
    "flash",
    "jello",
    "lightSpeedIn",
    "pulse",
    "rollIn",
    "rotateIn",
    "rotateInDownLeft",
    "rotateInDownRight",
    "rotateInUpLeft",
    "rotateInUpRight",
    "rubberBand",
    "shake",
    "slideInDown",
    "slideInUp",
    "slideInLeft",
    "slideInRight",
    "swing",
    "tada",
    "wobble",
    "zoomIn",
    "scaleIn"
], "scaleIn", function(selection){
        input.animation = selection;
});
*/
//
//