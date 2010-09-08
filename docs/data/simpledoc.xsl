<?xml version="1.0"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

<xsl:template match="/">
  <div id="page">
    <header>
      <h1><xsl:value-of select="simpledoc/title"/></h1>
      <p id="subtitle">EpicJS - simpledoc</p>
    </header>
    <nav></nav>

    <section id="content">
      <div id="components">
				<xsl:for-each select="simpledoc/component">
					<xsl:call-template name="component" />
				</xsl:for-each>      
      </div>
      <aside id="sidebar">
        <section>
          <header>
            <h2>Topics</h2>
          </header>
					<xsl:for-each select="simpledoc/topic">
						<xsl:call-template name="topic" />
					</xsl:for-each>          
        </section>

			</aside>
    </section>
  </div>
  <div id="copyright">
    <strong><xsl:value-of select="simpledoc/copyright"/></strong>
  </div>
</xsl:template>

<xsl:template match="topic" name="topic">
<xsl:if test="@name">
<p>
	<a title="{@description}"><xsl:value-of select="@name"/></a>
	<xsl:for-each select="topic">
		<xsl:call-template name="topic" />
	</xsl:for-each>	
</p>
</xsl:if>
<xsl:if test="not(@name)">
<h3><xsl:value-of select="@header"/></h3>
</xsl:if>
</xsl:template>

<xsl:template match="component" name="component">
<div class="component" name="{@name}">
	<xsl:for-each select="section">
		<xsl:call-template name="section" />
	</xsl:for-each>	
</div>
</xsl:template>

<xsl:template match="section" name="section">
<div class="section">
	<h2><xsl:value-of select="@name"/></h2>
	<div class="desc"><xsl:value-of select="description" /></div>
	<xsl:for-each select="code">
		<xsl:call-template name="code" />
	</xsl:for-each>
	<xsl:call-template name="attributes">
		<xsl:with-param name="attributesTitle" select="'Attributes'"/>
	</xsl:call-template>
	<xsl:call-template name="events" />
	<xsl:call-template name="methods" />
</div>
</xsl:template>

<xsl:template name="events">
<xsl:if test="event">
	<div class="events">
		<h3>Events</h3>
		<xsl:for-each select="event">	
		<div class="event">
			<h4><span><xsl:value-of select="@name"/></span></h4>
			<h5><xsl:value-of select="description"/></h5>
			<xsl:call-template name="attributes">
				<xsl:with-param name="attributesTitle" select="'Parameters'"/>
			</xsl:call-template>
			<xsl:for-each select="code">
				<xsl:call-template name="code" />
			</xsl:for-each>
		</div>
		</xsl:for-each>
	</div>	
</xsl:if>
</xsl:template>

<xsl:template match="method" name="methods">
<xsl:if test="method">
	<div class="methods">
		<h3>Methods</h3>
		<xsl:for-each select="method">
		<div class="method">
			<h4>
				<span class="name"><xsl:value-of select="@name"/></span>
				<span class="returns">Returns: <xsl:value-of select="returns"/></span>
			</h4>
			<h5><xsl:value-of select="description"/></h5>
			<xsl:call-template name="signatures" />
			<xsl:for-each select="code">
				<xsl:call-template name="code" />
			</xsl:for-each>
		</div>
		</xsl:for-each>
	</div>
</xsl:if>
</xsl:template>

<xsl:template name="signatures">
<xsl:if test="signature">
	<xsl:for-each select="signature">
	<div class="signature">
		<code class="def"><xsl:value-of select="definition"/></code>
		<div class="desc"><xsl:value-of select="description"/></div>
		<xsl:call-template name="attributes">
			<xsl:with-param name="attributesTitle" select="'Parameters'"/>
		</xsl:call-template>
		<xsl:for-each select="code">
			<xsl:call-template name="code" />
		</xsl:for-each>	
	</div>
	</xsl:for-each>
</xsl:if>
</xsl:template>

<xsl:template name="attributes">
<xsl:param name="attributesTitle" />
<xsl:if test="attribute">
	<div class="attributes">
		<h3><xsl:value-of select="$attributesTitle"/></h3>
		<table>
		<tbody>
		<xsl:for-each select="attribute">
		<tr class="attribute">
			<td><a title="{description}"><xsl:value-of select="@name"/></a></td>
			<td>
				<xsl:if test="@required">
				<em>(required)</em>
				</xsl:if>
			</td>
			<td>
				<xsl:if test="@type">
				<span>&lt; <xsl:value-of select="@type"/> &gt;</span>
				</xsl:if>
			</td>
			<td width="100%"><p><xsl:value-of select="description"/></p></td>
			<xsl:if test="code">
			<td><a class="toggle">show code</a></td>
			</xsl:if>
		</tr>
		<xsl:if test="code">
		<tr class="code">
			<td colspan="5">
				<xsl:for-each select="code">
					<xsl:call-template name="code" />
				</xsl:for-each>
			</td>
		</tr>
		</xsl:if>
		</xsl:for-each>
		</tbody>
		</table>
	</div>
</xsl:if>
</xsl:template>

<xsl:template match="code" name="code">
<div class="code">
	<h4><xsl:value-of select="@name"/></h4>
	<xsl:for-each select="block">
	<h5><xsl:value-of select="@name"/></h5>
	<pre class="brush: {@language};">
		<xsl:if test="@src">
			<xsl:attribute name="data-src">
				<xsl:value-of select="@src" />
			</xsl:attribute>
		</xsl:if>
		<xsl:value-of select="."/>
	</pre>
	</xsl:for-each>
</div>
</xsl:template>

</xsl:stylesheet>