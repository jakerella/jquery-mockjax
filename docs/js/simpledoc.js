Epic = $.extend({}, {simpledoc: {}});

$(document).ready(function(){
	
	$(document.body).xslt(Epic.simpledoc.xmlPath || 'data/simpledoc.xml', Epic.simpledoc.xslPath || 'data/simpledoc.xsl', function(){
		
		document.title += ' - ' + $('header:eq(0) h1').html();

		function shPath() {
			var args = arguments,
				result = [];
					 
			for(var i = 0; i < args.length; i++)
					result.push(args[i].replace('@', 'js/SyntaxHighlighter/'));
					 
			return result
		};
		 
		SyntaxHighlighter.autoloader.apply(null, shPath(
			'applescript            @shBrushAppleScript.js',
			'actionscript3 as3      @shBrushAS3.js',
			'bash shell             @shBrushBash.js',
			'coldfusion cf          @shBrushColdFusion.js',
			'cpp c                  @shBrushCpp.js',
			'c# c-sharp csharp      @shBrushCSharp.js',
			'css                    @shBrushCss.js',
			'delphi pascal          @shBrushDelphi.js',
			'diff patch pas         @shBrushDiff.js',
			'erl erlang             @shBrushErlang.js',
			'groovy                 @shBrushGroovy.js',
			'java                   @shBrushJava.js',
			'jfx javafx             @shBrushJavaFX.js',
			'js jscript javascript  @shBrushJScript.js',
			'perl pl                @shBrushPerl.js',
			'php                    @shBrushPhp.js',
			'text plain             @shBrushPlain.js',
			'py python              @shBrushPython.js',
			'ruby rails ror rb      @shBrushRuby.js',
			'sass scss              @shBrushSass.js',
			'scala                  @shBrushScala.js',
			'sql                    @shBrushSql.js',
			'vb vbnet               @shBrushVb.js',
			'xml xhtml xslt html    @shBrushXml.js'
		));
		
		$('pre[data-src]').each(function(){
			var e = $(this),
				src = e.attr('data-src');
			e.data('class', e.attr('class'));
			e.removeAttr('class');
			
			$.get('external.txt', function(data) {
				e.html(data).attr('class', e.data('class'));
				SyntaxHighlighter.highlight(null, e[0]);
			});
			
		});		
		
		$('a.toggle').click(function(){
			var e = $(this),
				tr = e.closest('tr').next();
				
			if(tr.is(':hidden')){
				e.text('hide code');
				tr.show();
			}
			else{
				e.text('show code');
				tr.hide();
			}
		});
		
		$('#sidebar p a').click(function(){
			var e = $(this).addClass('active'),
				route = e.text().replace(/ /g,"_"),
				loc = window.location.href,
				path = loc.split('#')[0];
			
			$('#sidebar p a').removeClass('active');
			
			window.location.href = path + '#' + route;
			$('.component').hide();
			$('.component[name="' + e.text() + '"]').show();
		})
		.eq(0).click();
		
		SyntaxHighlighter.all();
		
	});

});