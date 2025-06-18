---
# title: Little Black Book
layout: layout.html
heroImg: /assets/chisenhale-hero.webp
---

## Gold Sponsors

<section>
{% for item in collections.sponsors %}
{% if item.data.tier == 1 %}
<a href="{{ item.url }}">
<article>
    <img src="{{item.data.heroImg}}" alt=""/>
    <h1 style="view-transition-name: heading-{{ forloop.index }};">{{ item.data.title }}</h1> 
    {% if item.data.strapline %}<p>{{ item.data.strapline }}</p> {% endif %}
</article>
</a>
{% endif %}
{% endfor %}
</section>

## Silver Sponsors

<section>
{% for item in collections.sponsors %}
{% if item.data.tier != 1 %}
<a href="{{ item.url }}">
<article>
    <img src="{{item.data.heroImg}}" alt=""/>
    <h1 style="view-transition-name: heading-{{ forloop.index }};">{{ item.data.title }}</h1> 
     {% if item.data.strapline %}<p>{{ item.data.strapline }}</p> {% endif %}
</article>
</a>
{% endif %}
{% endfor %}
</section>
