module.exports = function (fileName, mode) {
    function Character(characterName, options, ssmlDocument) {
        options = options || {};
        var my = this;
        this.ssmlDocument = ssmlDocument;
        this.name = characterName;
        
        this.voice = {};
        if (undefined !== options["xml:lang"]) {
            this.voice['xml:lang'] = options["xml:lang"];
        }
        if (undefined !== options.name) {
            this.voice.name = options.name;
        }
        if (undefined !== options.age) {
            this.voice.age = options.age;
        }
        if (undefined !== options.variant) {
            this.voice.variant = options.variant;
        }
        if (undefined !== options.gender) {
            this.voice.gender = options.gender;
        }

        this.prosody = {};
        if (undefined !== options.rate) {
            this.prosody.rate = options.rate;
        }
        if (undefined !== options.volume) {
            this.prosody.volume = options.volume;
        }
        if (undefined !== options.pitch) {
            this.prosody.pitch = options.pitch;
        }
        if (undefined !== options.range) {
            this.prosody.range = options.range;
        }

        this.generateCommentElement = function generateCommentElement() {
            return document.createComment(' ' + my.name + ' ');
        };
        this.generateVoiceElement = function generateVoiceElement(options) {
            options = options || {};
            var voice = document.createElement('voice');
            Object.keys(my.voice).forEach(function (key) {
                voice.setAttribute(key, my.voice[key]);
            });
            Object.keys(options).forEach(function (key) {
                if(key === 'lang') {
                    key = 'xml:lang';
                    options['xml:lang'] = options.lang;
                }
                if(my.ssmlDocument.validOptions.voice.indexOf(key) !== -1) {
                    voice.setAttribute(key, options[key]);
                }
            });
            return voice;
        };
        this.generateProsodyElement = function generateProsodyElement(html, options) {
            options = options || {};
            var prosody = document.createElement('prosody');
            Object.keys(my.prosody).forEach(function (key) {
                prosody.setAttribute(key, my.prosody[key]);
            });
            Object.keys(options).forEach(function (key) {
                if(my.ssmlDocument.validOptions.prosody.indexOf(key) !== -1) {
                    prosody.setAttribute(key, options[key]);
                }
            });
            prosody.innerHTML = html.trim();
            my.emphasize(prosody.children[0]);
            return prosody;
        };
        this.emphasize = function (element) {
            function emph (element, level) {
                var emphasis = '';
                emphasis = document.createElement('emphasis');
                emphasis.setAttribute('level', level);
                emphasis.innerHTML = element.innerHTML.trim();
                element.parentNode.replaceChild(emphasis, element);
            }
            
            var tags = Array.prototype.slice.call(element.getElementsByTagName('*'));
            
            tags.forEach(function (el) {
                if(el.getAttribute('ssml') === null) {
                    switch (el.tagName.toLowerCase()) {
                        case 's' : 
                                emph(el, 'reduced');
                            break;
                        case 'sub' :
                            if(el.getAttribute('alias') === null) {
                                emph(el, 'reduced');
                            }
                            break;
                        case 'i' :
                        case 'em' :
                        case 'q' :
                        case 'blockquote' : 
                        case 'cite' : 
                        case 'del' : 
                        case 'strike' : 
                        case 'sup' : 
                        case 'summary' : 
                        case 'caption' : 
                        case 'figcaption' : 
                                emph(el, 'reduced');
                                break;
                        case 'b' :
                        case 'strong' : 
                        case 'dt' : 
                        case 'dfn' : 
                        case 'u' :
                        case 'li' : 
                        case 'mark' : 
                        case 'th' : 
                        case 'title' : 
                        case 'var' : 
                                emph(el, 'moderate');
                            break;
                        default :
                            break;
                    }
                } else {
                    el.removeAttribute('ssml');
                }
            });
        };
        this.say = function say(html, options) {
            var name = my.generateCommentElement();
            var part = my.generateVoiceElement(options);
            part.appendChild(my.generateProsodyElement(html, options));
            my.ssmlDocument.speak.appendChild(name);
            my.ssmlDocument.speak.appendChild(part);
        };
    }

    function SSMLDocument() {
        var my = this;
        this.validOptions = {
            'voice' : [
                'xml:lang',
                'name',
                'age',
                'variant',
                'gender'
            ],
            'prosody' : [
                'rate',
                'volume',
                'pitch',
                'range'
            ],
            'say-as' : [
                'interpret-as',
                'format'
            ],
            'mark' : [
                'name'
            ],
            's' : [
                'xml:lang'
            ],
            'p' : [
                'xml:lang'
            ],
            'sub' : [
                'alias'
            ],
            'audio' : [
                'src'
            ],
            'emphasis' : [
                'level'
            ],
            'break' : [
                'strength',
                'time'
            ]
        };
        this.characters = {};
        this.speak = document.createElement('speak');
        this.addCharacter = function (characterName, options) {
            var character = new Character(
                    characterName, options, my);
            my.characters[characterName] = character;
        };
        this.classProcessors = {
            "ssml:voice" : voice,
            "ssml:prosody" : prosody,
            "ssml:sub" : sub,
            "ssml:sayas" : sayAs,
            "ssml:mark" : mark,
            "ssml:s" : ssmlS,
            "ssml:p" : ssmlP,
            "ssml:tts:style" : ttsStyle,
            "ssml:audio" : audio,
            "ssml:emphasis" : emphasis,
            "ssml:break" : ssmlBreak
        };
        function elementGen (element, genTag) {
            var sub = document.createElement(genTag);
            my.validOptions[genTag].forEach(function (attr) {
                if(element.getAttribute(attr)) {
                    sub.setAttribute(attr, element.getAttribute(attr));
                }
                if(element.getAttribute(attr) === '') {
                    sub.setAttribute(attr, '');
                }
            });
            sub.innerHTML = element.innerHTML.trim();
            element.parentNode.replaceChild(sub, element);
        }
        function voice(element) {
            elementGen(element, 'voice');
        }
        function prosody(element) {
            elementGen(element, 'prosody');
        }
        function sub(element) {
            elementGen(element, 'sub');
        }
        function sayAs(element) {
            elementGen(element, 'say-as');
        }
        function mark(element) {
            elementGen(element, 'mark');
        }
        function ssmlS(element) {
            elementGen(element, 's');
        }
        function ssmlP(element) {
            elementGen(element, 'p');
        }
        function ttsStyle(element) {
            elementGen(element, 'tts:style');
        }
        function audio(element) {
            elementGen(element, 'audio');
        }
        function emphasis(element) {
            elementGen(element, 'emphasis');
        }
        function ssmlBreak(element) {
            elementGen(element, 'break');
        }

        this.speak.setAttribute('version', '1.0');
        this.speak.setAttribute('xmlns', 'http://www.w3.org/2001/10/synthesis');
        this.speak.setAttribute('xmlns:xsi',
            'http://www.w3.org/2001/XMLSchema-instance');
        this.speak.setAttribute('xsi:schemaLocation',
            'http://www.w3.org/TR/speech-synthesis/synthesis.xsd');
        this.speak.setAttribute('xml:lang', 'en-us');
        this.addCharacter('narrator', {
            "voiceName" : "en+m4",
            "pitch" : "x-low",
            "rate" : "normal",
            "volume" : "soft"
        });
    }

    function htmlToSsml(mode) {
        var my = this;
        this.mode = mode || 's'; // may be p or s for paragraph or sentence mode.
        this.ssml = new SSMLDocument();
        var options = JSON.parse(document.getElementById('ssmlconversionoptions').textContent.replace(/(<!\[CDATA\[|\]\]>)/g, '').trim());
        function addCharacters() {
            Object.keys(options.characters).forEach(function (characterName) {
                my.ssml.addCharacter(characterName, options.characters[characterName]);
            });
        }

        function processTags() {
            var tags = Array.prototype.slice.call(document.getElementsByTagName('*'));

            tags.forEach(function (el) {
                var cList = Array.prototype.slice.call(el.classList);
                cList.forEach(function (eClass) {
                    if (eClass in my.ssml.characters) {
                        var sayOptions = {};
                        var spoken = document.createElement(my.mode);
                        // process children of element to be spoken
                        Array.prototype.slice.call(el.getElementsByTagName('*')).forEach(function (el) {
                            var cList = Array.prototype.slice.call(el.classList);
                            cList.forEach(function (eClass) {
                                if (eClass in my.ssml.classProcessors) {
                                    my.ssml.classProcessors[eClass](el);
                                }
                            });
                        });
                        // generate sayOptions object and say something
                        Array.prototype.slice.call(el.attributes).forEach(function (obj) {
                            sayOptions[obj.name] = obj.value;
                        });
                        spoken.innerHTML = el.innerHTML.trim();
                        my.ssml.characters[eClass].say(spoken.outerHTML, sayOptions);
                    }
                });
            });
        }

        addCharacters();
        processTags();
    }


    var my = this;
    my.fileName = fileName;
    my.mode = mode;

    var fs = require('fs');
    var path = require('path');
    var jsdom = require("jsdom").jsdom;
    var tidy = require('htmltidy').tidy;
    var tidyOptions = require('htmltidy-options');
    var classListShim = require(path.resolve(__dirname, './classListShim'));
    
    var rawhtml = fs.readFileSync(path.resolve(my.fileName), 'utf8');
    var document, window;
    
    tidy(rawhtml, tidyOptions['Kastor tidy - XHTML page UTF-8'], function(err, html) {
        document = jsdom(html, null, {
            features: {
                FetchExternalResources : false,
                ProcessExternalResources : false
            }
        });
        window = document.createWindow();
        
        classListShim(window);
        var converter = new htmlToSsml(my.mode);
        tidy(converter.ssml.speak.outerHTML, tidyOptions['Kastor tidy - XML Reindent UTF-8'], function(err, html) {
            fs.writeFileSync(path.resolve(my.fileName + '.ssml'), html, 'utf8');
        });
    });
}
