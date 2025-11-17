---
title: "Publications"
permalink: /publications/
author_profile: true
layout: single
---

A full publication list is available at 
<a href="https://dblp.org/pers/n/Nayak:Satya_Prakash.html" style="text-decoration:none">dblp</a> and 
<a href="https://scholar.google.com/citations?user=SG0LVmYAAAAJ&hl=en" style="text-decoration:none">google scholar</a>.<br>
My <a href="https://en.wikipedia.org/wiki/Erd%C5%91s_number" style="text-decoration:none">Erdős number</a> is 
<a href="https://www.csauthors.net/satya-prakash-nayak/" style="text-decoration:none">4</a>.

Most of my papers list all authors in alphabetic or 
<a href="https://www.aeaweb.org/journals/policies/random-author-order/search?RandomAuthorsSearch%5Bsearch%5D=nayak" style="text-decoration:none;">randomized</a> 
order, indicated by <span style="font-size: smaller;">&#x24d0;</span> or 
<span style="font-size: smaller;">&#x24e1;</span>, respectively. If you are wondering why one would do this, see 
<a href="http://www.ams.org/profession/leaders/CultureStatement04.pdf" style="text-decoration:none;">this</a> article by the American Mathematical Society.

---

<h2 style="display:flex;justify-content:space-between;align-items:center;">
  <span>📘 Papers</span>
  <button id="toggleAll"
    onclick="toggleAllDetails()"
    style="font-size:0.75rem;padding:1px 6px;border-radius:4px;background:none;border:1px solid #ddd;cursor:pointer;">
    …
  </button>
</h2>

<script>
(function() {
  const btn = document.getElementById('toggleAll');

  function allOpen() {
    const d = document.querySelectorAll('details');
    if (!d.length) return true;
    return Array.from(d).every(el => el.open);
  }

  function setAll(open) {
    document.querySelectorAll('details').forEach(el => { el.open = open; });
  }

  function updateLabel() {
    btn.textContent = allOpen() ? 'Collapse all' : 'Expand all';
  }

  window.toggleAllDetails = function() {
    // If at least one is closed, expand all; otherwise collapse all.
    const shouldOpen = !allOpen();
    setAll(shouldOpen);
    updateLabel();
  };

  // Keep the button label in sync if user manually toggles any section.
  document.addEventListener('toggle', function(e) {
    if (e.target && e.target.tagName && e.target.tagName.toLowerCase() === 'details') {
      updateLabel();
    }
  }, true);

  // Initialize the correct label on load.
  document.addEventListener('DOMContentLoaded', updateLabel);
  // If this script runs after DOMContentLoaded, call immediately too:
  updateLabel();
})();
</script>

{% assign under_sub = site.data.pubs | where: "status", "submission" %}
{% if under_sub and under_sub.size > 0 %}
<details open>
<summary><h3 style="display:inline;">Under submission</h3></summary>

{% for p in under_sub %}
* **{{ p.title }}** <br>
{% if p.order_flag == "alpha" %}
<span style="font-size: smaller;">&#x24d0;</span>
{% elsif p.order_flag == "rand" %}
<span style="font-size: smaller;">&#x24e1;</span>
{% endif %}
{{ p.authors }} <br>
[ {% for l in p.links %}
<a href="{{ l.url }}" style="text-decoration:none;font-family:'Times';">{{ l.label }}</a>{% if forloop.last == false %} | {% endif %}
{% endfor %} ]
{% endfor %}

</details>
---
{% endif %}

{% assign pubs = site.data.pubs | where: "status", "published" | sort: "year" | reverse %}
{% assign years = pubs | map: "year" | uniq %}
{% assign current_year = site.time | date: "%Y" | plus: 0 %}
{% assign recent_threshold = current_year | minus: 1 %}

{% for y in years %}
<details {% if y >= recent_threshold %}open{% endif %}>
<summary><h3 style="display:inline;">{{ y }}</h3></summary>

{% for p in pubs %}
{% if p.year == y %}
* **{{ p.title }}** <br>
{% if p.order_flag == "alpha" %}
<span style="font-size: smaller;">&#x24d0;</span>
{% elsif p.order_flag == "rand" %}
<span style="font-size: smaller;">&#x24e1;</span>
{% endif %}
{{ p.authors }} <br>
[ {% for l in p.links %}
<a href="{{ l.url }}" style="text-decoration:none;font-family:'Times';">{{ l.label }}</a>{% if forloop.last == false %} | {% endif %}
{% endfor %} ]
{% if p.note %}
<br><b style="font-family:'Times New Roman'; color:red">{{ p.note }}</b>
{% endif %}
{% endif %}
{% endfor %}

</details>
---
{% endfor %}

## 🧰 Tools

{% for t in site.data.tools %}
* <b style="font-family:'Georgia'">{{ t.name }}</b> : {{ t.full_name | markdownify | strip_newlines }} <br>
[ {% for l in t.links %}
<a href="{{ l.url }}" style="text-decoration:none;font-family:'Times';">{{ l.label }}</a>{% if forloop.last == false %} | {% endif %}
{% endfor %} ]
{% endfor %}
