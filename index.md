---
# title: Little Black Book
layout: layout.html
heroImg: /assets/chisenhale.jpg
---

## Gold Sponsors

<section>
{% for item in collections.companies %}
{% if item.data.tier == 1 %}
<a href="{{ item.url }}">
    <article>
        <img src="{{item.data.heroImg}}" />
        <h1>{{ item.data.title }}</h1> 
        {% if item.data.strapline %}<p>{{ item.data.strapline }}</p> {% endif %}
    </article>
</a>
{% endif %}
{% endfor %}
</section>

## Silver Sponsors

<section>
{% for item in collections.companies %}
{% if item.data.tier != 1 %}
<a href="{{ item.url }}">
<article>
    <img src="{{item.data.heroImg}}" />
    <h1>{{ item.data.title }}</h1> 
     {% if item.data.strapline %}<p>{{ item.data.strapline }}</p> {% endif %}
</article>
</a>
{% endif %}
{% endfor %}
</section>
