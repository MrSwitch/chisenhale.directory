---
title: Chisenhale Primary School's Little Black Book
layout: layout.html
heroImg: https://files.schudio.com/chisenhale-primary-school/images/banners/Copy_of_DSC04158.jpg
---

## Sponsors

<section>
{% for item in collections.companies %}
<article>
    <img src="{{item.data.heroImg}}" />
    <h1><a href="{{ item.url }}">{{ item.data.title }}</a></h1> 
</article>
{% endfor %}
</section>

<i>Disclaimer: Neither Chisenhale Primary School nor any of its staff gives any representation, assurance or guarantee with respect to the services advertised in this directory and accepts no liability for any damage or loss sustained as a result of the provision of any servcies to you by those advertising in the directory</i>
