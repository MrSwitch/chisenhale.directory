---
# title: Little Black Book
layout: layout.html
heroImg: /assets/chisenhale-hero.webp
---

## Welcome to Chisenhale Primary School’s Little Black Book.

Created by the school’s PTA, its aim is to both promote local businesses to our community and raise funds for the school.

Want to be featured? Get in touch at {% obfuscate"chisenhalelbb@gmail.com" %}

## Sponsors

<section>
{% for item in collections.sponsors %}
<a href="{{ item.url }}">
<article>
    <img src="{{item.data.heroImg}}" alt=""/>
    <h1 style="view-transition-name: heading-{{ forloop.index }};">{{ item.data.title }}</h1> 
    {% if item.data.strapline %}<p>{{ item.data.strapline }}</p> {% endif %}
</article>
</a>
{% endfor %}
</section>
