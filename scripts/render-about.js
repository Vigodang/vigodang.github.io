// A normal-flow photo essay. The images retain their complete source frames;
// optional motion belongs to the surrounding group, never to an image crop.
export function renderAbout({ p, esc, link, pdfLink, portrait }) {
  const photo = (name, alt, { wide = false, eager = false, caption = '' } = {}) =>
    `<figure class="about-frame"><img src="assets/about/${name}.webp" width="${wide ? 2048 : 1365}" height="${wide ? 1365 : 2048}" alt="${esc(alt)}" loading="${eager ? 'eager' : 'lazy'}"${eager ? ' fetchpriority="high"' : ''} decoding="async">${caption ? `<figcaption>${esc(caption)}</figcaption>` : ''}</figure>`;

  return `<div class="about-editorial">
    <section class="about-arrival wrap" aria-labelledby="about-title">
      <div class="about-arrival-heading">
        <p class="label">About me</p>
        <h1 id="about-title">Hi, I’m Vigo.<br><span>Beyond the projects.</span></h1>
        <div class="about-arrival-intro"><p>I’m from Vietnam.<br> Now at home in Brisbane.</p><p>I work on data and cloud projects. Away from the screen, I like travelling, finding new places to eat and taking photos.</p></div>
      </div>
      <div class="about-arrival-bottom">
        <div class="about-side-note" data-reveal><span class="about-note-line" aria-hidden="true"></span><p>I enjoy dressing well.<br> I don’t mind a silly photo either.</p></div>
        <div class="about-arrival-photos" data-parallax="media">
          ${photo('everyday-celery', 'Vigo playfully posing with a large bunch of celery in a supermarket.', { eager: true })}
          ${photo('coffee-candid', 'Vigo taking a sip from a takeaway cup, wearing a rust-coloured polo.', { eager: true })}
        </div>
      </div>
    </section>

    <section class="about-everyday" aria-labelledby="about-food-title">
      <div class="about-everyday-inner wrap">
        <div class="about-food-photos" data-parallax="media">
          ${photo('fries-candid', 'A candid close-up of Vigo taking a bite of food.')}
          ${photo('sushi-candid', 'Vigo holding sushi with chopsticks and making a playful expression.')}
        </div>
        <div class="about-chapter-copy" data-reveal><p class="label">The everyday side</p><h2 id="about-food-title">Good food.<br>Funny photos.</h2><p>I enjoy going out for a meal and trying food I haven’t had before. I take photos along the way, and I like keeping the funny ones too.</p></div>
      </div>
    </section>

    <section class="about-places wrap" aria-labelledby="about-travel-title">
      <div class="about-places-heading" data-reveal><p class="label">A change of scenery</p><h2 id="about-travel-title">A little<br>further afield.</h2><p>I’ve travelled to Đà Nẵng, Huế and Hội An. I like exploring a place, trying the food and stopping for a photo when something catches my eye.</p></div>
      <div class="about-places-photos" data-parallax="media">
        ${photo('table-by-the-water', 'Vigo seated at an outdoor table with a meal and water in the background.', { wide: true, caption: 'Travelling in Vietnam.' })}
        ${photo('hoi-an-stop', 'Vigo holding a drink outside a leafy shop with a Hội An sign.', { wide: true, caption: 'A stop in Hội An.' })}
      </div>
    </section>

    <section class="about-together" aria-labelledby="about-team-title">
      <div class="about-together-inner wrap">
        <div class="about-chapter-copy" data-reveal><p class="label">Working with me</p><h2 id="about-team-title">Listen first.<br>Build together.</h2><p>I’m easygoing and I like a laugh. In a team, I try to listen before jumping in, ask questions when I’m unsure, and take feedback seriously.</p><p>I’m looking for an internship or graduate role in Data or Cloud Engineering. I’d like to join a team that shares ideas, gives useful feedback and takes care with its work.</p><div class="about-together-links">${link('work.html', 'View my projects')}${link('contact.html', 'Contact me')}</div></div>
        <div class="about-together-photos" data-parallax="media">
          ${photo('travel-wander', 'Vigo wearing sunglasses and a dark shirt beside a stone wall and trees.')}
          ${photo('sushi-portrait', 'Vigo looking at the camera with a relaxed expression while holding sushi.')}
        </div>
      </div>
    </section>

    <section class="about-foundation wrap" aria-labelledby="about-education-title">
      <div class="about-foundation-heading" data-reveal><p class="label">The foundations</p><h2 id="about-education-title">Always learning.</h2><div class="about-signature">${portrait('story-signoff-photo', '96px')}<p><strong>${esc(p.fullName)}</strong><span>${esc(p.positioning.role)}</span><span>${esc(p.location)}</span></p></div></div>
      <div class="about-education" data-reveal><p class="about-education-date">Expected graduation · ${esc(p.graduation)}</p><h3>${esc(p.university)}</h3><p>${esc(p.degree)}<br>Minor: ${esc(p.minor)}</p><p class="about-award">${esc(p.award)}</p><div class="about-foundation-links">${link('experience.html', 'Education & project experience')}${pdfLink('', 'text-link')}</div></div>
      <details class="about-technical"><summary><span>Technical skills</span><span class="about-technical-hint">Programming, cloud &amp; machine learning</span><span class="about-technical-toggle" aria-hidden="true">+</span></summary><div class="about-technical-content"><p>My projects span desktop prediction workflows, asynchronous cloud processing and source-linked retrieval.</p><dl>${p.skills.map(group => `<div><dt>${esc(group.label)}</dt><dd>${esc(group.items)}</dd></div>`).join('')}</dl><p>My deep learning work includes RGB and elevation inputs, a TensorFlow/Keras segmentation model and tiled inference for drone imagery.</p>${link(p.deepLearningSource, 'View the segmentation implementation')}</div></details>
    </section>
  </div>`;
}
