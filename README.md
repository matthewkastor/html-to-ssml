#html-to-ssml

A utility for converting HTML to SSML.

This handy little utility will help you convert your HTML documents into SSML. 
I'm currently using it to convert HTML into the SSML supported by 
[eSpeak](http://espeak.sourceforge.net/)

## Install it on node from npm

`npm install html-to-ssml`

or better yet, install it globally and call it from anywhere.

`npm install -g html-to-ssml`

If you have trouble installing and see failures with contextify, you probably
 don't have visual studio installed or maybe node-gyp isn't configured.
 https://github.com/TooTallNate/node-gyp/blob/master/README.md
 
 Pro tip, set the version of VS you have installed with
 `npm config set msvs_version 2010 --global`
 `npm config set msvs_version 2012 --global`
 or
 `npm config set msvs_version 2013 --global`

## Usage

This module exports a single function so there really isn't a whole lot to it.
All you do is give it a file name and path. The generated SSML will be created 
in the same directory as the given file, it will also have the same name as the 
file with the addition of a `.ssml` extension. There are a couple requirements 
for your HTML files that are easy to meet. Mostly, you add some definitions for 
the voices you want to use in your document and, add attributes to your HTML 
Elements so this program knows which voice you want to use on specific parts of 
your text.

### Specify voices to use in your markup

Voices are specified in the HTML page using a script tag with an id of 
ssmlconversionoptions and it's type set to application/json. The voice configs 
are just an anonymous object with a characters property. The characters 
property has each characters name as a property and those names are objects 
which have properties corresponding to the attributes available for `voice` and 
`prosody` elements in SSML. The names you give your characters will be applied 
to the class attribute of any element which you wish for that character to read.

```
<script id="ssmlconversionoptions" type="application/json">
{
    "characters" : {
        "narrator" : {
            "gender" : "male",
            "variant" : "4",
            "age" : "50",
            "pitch" : "x-low",
            "range" : "low",
            "rate" : "normal",
            "volume" : "soft"
        },
        "tammz" : {
            "name" : "en-us+F1",
            "pitch" : "80Hz",
            "rate" : "1",
            "volume" : "100"
        },
        "kastor": {
            "name" : "en+m7",
            "pitch" : "40Hz",
            "rate" : "0.94",
            "volume" : "100"
        }
    }
}
</script>

<p class="kastor">
    <b class="ssml:sub" alias="">Matthew Kastor</b> She followed me to <span class="ssml:sub" alias="flaccid book">FB</span> But the whole <i>"oh look this is a picture my ex sent me"</i> and my <i>"ha ha ha ha she's got zitty titties on the toilet"</i> made her mad
</p>

<p class="tammz">
    <b class="ssml:sub" alias="">Tammy Knott</b> hahaha
</p>

<p class="kastor">
    <b class="ssml:sub" alias="">Matthew Kastor</b> That and I was making fun of her facepaint. So she quit <span class="ssml:sub" alias="flaccid book">FB</span> and went back to <span class="ssml:sub" alias="allpooetry">AP</span>. She thought I thought she was a dude.
</p>

<p class="tammz">
    <b class="ssml:sub" alias="">Tammy Knott</b> I see
</p>

<p class="kastor">
    <b class="ssml:sub" alias="">Matthew Kastor</b> umhmmm... So anyway, back at <span class="ssml:sub" alias="allpooetry">AP</span> after she disappeared for a few months, she returned because I'm <b>so Glorious.</b>
</p>

<p class="tammz">
    <b class="ssml:sub" alias="">Tammy Knott</b> hahaha
</p>

<p class="kastor">
    <b class="ssml:sub" alias="">Matthew Kastor</b> Then the missions started. **it got crazy. She got troll's remorse and ended up befriending her former targets.
</p>

<p class="tammz">
    <b class="ssml:sub" alias="">Tammy Knott</b> hahaha And then she met me and everything went to hell in a hand basket
</p>

<p class="kastor">
    <b class="ssml:sub" alias="">Matthew Kastor</b> Then I returned. Supposedly carrying the motherlode of hacktronix with a big fat Destory grin on my face... No we already covered when she met you with the <i>"befriending former targets"</i> part. 
</p>
```

### Simple conversion

```
var converter = require('html-to-ssml');
converter('myfile.html'); // the output file will be myfile.html.ssml
```
There is an optional second parameter which can be either 'p' or 's' which will 
wrap your text in either a paragraph or sentence element. The default is to 
wrap things in sentence elements.

If you install this module globally then you can call it from the command line 
anywhere on your machine. It's easy.

```
html-to-ssml myfile.html
```

If you prefer not to install things globally you can still use this module from 
the command line. Just go to the `node_modules/.bin` directory and run it

```
node_modules/.bin/html-to-ssml.cmd "C:/Users/Billy Bob/Desktop/myfile.html"
```

Now that you know the basics. Let's do some advanced stuff.

### Advanced Stuff

Basically I mapped the SSML elements supported in eSpeak to classes you can 
apply to whatever element suits your fancy. If you look in the example above, 
you'll see that the voice names are specified as classes on the paragraph 
elements. What happens is that I rip the guts out of the paragraph, wrap it up 
with voice and prose elements per your specifications, and write it out to a 
file. All for free. But wait, there's more. I was so bored today that I went 
ahead and did you one better. You can put classes on HTML elements and have 
them converted to SSML elements on the fly! POW. I'll rip the guts out of 
anything and wrap it up in a bow for you because I'm super nice and really, 
really, awesome.

#### Class List For Converting Elements

All you do is give your element a class from the left side of the list and it 
will be converted to the element on the right side of the list.

```
classProcessors = {
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
}
```

Add any properties to the element that are applicable to the SSML element and 
they'll be carried over in the translation. See the spans and bold tags in the 
example above? I convert many of them into SSML `sub` elements and provide an 
alternate pronunciation. It makes sense to list the person's name when they're 
speaking in a text, but not so much sense when you're listening to it being 
read. So I mute them. Then there are acronyms that sound better as words 
as opposed to letters, so I substitute the full names in the audio. It's good 
stuff.

#### Emphasizing Certain Tags Automatically

See, I know when something is written in bold, italics, underlines, etc., that 
the text should be read a little differently. So I went and made a huge list of 
tags that should have a slight emphasis or de-emphasis when read. The list is 
as follows:

**Reduced Emphasis**

s
sub
i
em
q
blockquote
cite
del
strike
sup
summary
caption
figcaption

**Moderate Emphasis**

b
strong
dt
dfn
u
li
mark
th
title
var

If you would like to suppress automatic emphasis just add the ssml property to 
the element and it will be ignored

```
<p class="billy">
    I am Billy! I <b>know</b> how to count 1 <sub ssml>2</sub> 3...
</p>
```

Well, that about wraps it up.

## Contact Info

If you have any questions or want to help improve this module you can write me
at [matthewkastor@gmail.com](mailto:matthewkastor@gmail.com)
Source is available at [https://github.com/matthewkastor/html-to-ssml/](https://github.com/matthewkastor/html-to-ssml/)