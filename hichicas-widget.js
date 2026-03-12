/* Hichicas.com AI Widget JS | github.com/tosharetoday007/hichicas */
(function(){

  var AFFILIATE_TAG = 'latestfotocom-20';
  var PROXY_URL = 'https://script.google.com/macros/s/AKfycbwX5TIkIg55a0aM5cDv7ESS20xlBiC6qPc0ZEVuifSLVm6BnlkKuf0jo-JPIflccPCY/exec';

  /* ============================================================
     STEP 1 - Read page context: title, labels, body text
  ============================================================ */
  function getPageContext(){
    var title = '';
    var titleEl = document.querySelector('.post-title') ||
                  document.querySelector('h1.entry-title') ||
                  document.querySelector('h3.post-title') ||
                  document.querySelector('h1') ||
                  document.querySelector('title');
    if(titleEl){ title = titleEl.textContent.trim(); }

    var labelEls = document.querySelectorAll('.post-labels a, .labels a, a[rel="tag"]');
    var labels = [];
    for(var i = 0; i < labelEls.length; i++){
      labels.push(labelEls[i].textContent.trim().toLowerCase());
    }

    var bodyText = '';
    var bodyEl = document.querySelector('.post-body') ||
                 document.querySelector('.entry-content') ||
                 document.querySelector('article');
    if(bodyEl){ bodyText = bodyEl.textContent.replace(/\s+/g,' ').trim().substring(0, 500); }

    return {
      title: title,
      titleLower: title.toLowerCase(),
      labels: labels,
      body: bodyText.toLowerCase()
    };
  }

  /* ============================================================
     STEP 2 - Detect topic from page content
  ============================================================ */
  function detectTopic(ctx){
    var combined = ctx.titleLower + ' ' + ctx.labels.join(' ') + ' ' + ctx.body;

    var topics = [
      { name:'handbag',   keywords:['handbag','purse','bag','tote','clutch','satchel','luxury bag','designer bag'] },
      { name:'shoe',      keywords:['shoe','sneaker','heel','boot','sandal','footwear'] },
      { name:'watch',     keywords:['watch','timepiece','rolex','omega','seiko'] },
      { name:'jewelry',   keywords:['jewelry','jewellery','necklace','bracelet','ring','earring','diamond'] },
      { name:'perfume',   keywords:['perfume','fragrance','cologne','scent','eau de'] },
      { name:'skincare',  keywords:['skin care','skincare','lotion','moisturizer','cream','serum','cetaphil','cerave','eczema'] },
      { name:'makeup',    keywords:['makeup','lipstick','foundation','mascara','eyeshadow','blush','concealer'] },
      { name:'haircare',  keywords:['hair','shampoo','conditioner','hair care','haircare'] },
      { name:'clothing',  keywords:['dress','shirt','jeans','outfit','fashion','clothing','wear'] },
      { name:'sunglasses',keywords:['sunglasses','glasses','eyewear','lens','frames'] },
      { name:'tech',      keywords:['phone','laptop','tablet','gadget','tech','electronic','smart'] },
      { name:'travel',    keywords:['travel','luggage','suitcase','vacation','trip','hotel'] },
      { name:'fitness',   keywords:['fitness','workout','gym','exercise','yoga','protein'] },
      { name:'food',      keywords:['recipe','food','cooking','eat','meal','diet','nutrition'] },
      { name:'home',      keywords:['home','decor','furniture','interior','room','kitchen'] }
    ];

    for(var t = 0; t < topics.length; t++){
      var topic = topics[t];
      for(var k = 0; k < topic.keywords.length; k++){
        if(combined.indexOf(topic.keywords[k]) !== -1){ return topic.name; }
      }
    }
    return 'general';
  }

  /* ============================================================
     STEP 3 - Dynamic questions by topic
  ============================================================ */
  var questionsByTopic = {
    handbag:  [
      'What makes a luxury handbag worth the price?',
      'How do I authenticate a designer handbag?',
      'Which luxury handbag brands hold their value best?',
      'What is the best starter luxury handbag?',
      'How do I care for a leather handbag?',
      'Louis Vuitton vs Gucci - which is better value?'
    ],
    shoe: [
      'Which luxury shoe brands are worth buying?',
      'How do I care for leather shoes?',
      'Best shoes for comfort and style?',
      'How to spot fake designer shoes?',
      'Which sneaker brands hold their value?',
      'Best shoe brands for women?'
    ],
    watch: [
      'Which watch brands are best for investment?',
      'Rolex vs Omega - which should I buy?',
      'How do I spot a fake luxury watch?',
      'Best entry level luxury watch?',
      'How often should a watch be serviced?',
      'Best watches for women?'
    ],
    jewelry: [
      'How do I care for gold jewelry?',
      'What is the best metal for everyday jewelry?',
      'How to spot real diamonds?',
      'Best jewelry brands for investment?',
      'How do I clean silver jewelry at home?',
      'Are lab diamonds worth buying?'
    ],
    perfume: [
      'How do I choose the right perfume for me?',
      'What is the difference between EDP and EDT?',
      'Which perfumes last the longest?',
      'Best perfumes for women in 2025?',
      'How do I make perfume last longer on skin?',
      'Best luxury perfume brands?'
    ],
    skincare: [
      'What is the best body lotion for dry skin?',
      'Cetaphil vs CeraVe - which is better?',
      'Best lotion for diabetic skin?',
      'What lotion is best for eczema?',
      'How do I fix cracked heels?',
      'Best lotion for sensitive skin?'
    ],
    makeup: [
      'What are the best luxury makeup brands?',
      'How do I choose the right foundation shade?',
      'Best long lasting lipstick brands?',
      'How do I build a basic makeup kit?',
      'What is the best mascara for volume?',
      'Best drugstore vs luxury makeup?'
    ],
    haircare: [
      'What are the best shampoos for dry hair?',
      'How do I repair damaged hair?',
      'Best hair oils for growth?',
      'How often should I wash my hair?',
      'Best luxury hair care brands?',
      'Best hair treatments for color treated hair?'
    ],
    clothing: [
      'What are the best luxury clothing brands?',
      'How do I build a capsule wardrobe?',
      'What are the fashion trends for 2025?',
      'How do I care for designer clothing?',
      'Best sustainable fashion brands?',
      'What are the must have wardrobe basics?'
    ],
    tech: [
      'What are the best smartphones in 2025?',
      'Is the latest iPhone worth buying?',
      'Best laptops for everyday use?',
      'How do I choose a smartwatch?',
      'Best budget tech gadgets?',
      'Apple vs Samsung - which is better?'
    ],
    travel: [
      'What is the best carry on luggage brand?',
      'How do I pack efficiently for a trip?',
      'Best travel accessories for women?',
      'What are the best luxury travel bags?',
      'How do I choose a travel backpack?',
      'Best luggage brands for frequent travelers?'
    ],
    fitness: [
      'What are the best workout clothes brands?',
      'Best fitness accessories for home workouts?',
      'How do I choose the right gym bag?',
      'Best running shoes for women?',
      'What fitness equipment is worth buying?',
      'Best yoga mat brands?'
    ],
    food: [
      'What are the best kitchen tools to have?',
      'Best cookware brands for home cooking?',
      'How do I start eating healthier?',
      'Best meal prep containers?',
      'What kitchen appliances are worth buying?',
      'Best food storage solutions?'
    ],
    home: [
      'What are the best home decor trends in 2025?',
      'How do I make a small room look bigger?',
      'Best affordable home decor brands?',
      'How do I choose the right sofa?',
      'Best scented candle brands for home?',
      'What are must have home accessories?'
    ],
    general: [
      'What are the best luxury brands in 2025?',
      'How do I spot fake luxury products?',
      'What luxury items are worth the investment?',
      'Best luxury gifts for women?',
      'Which luxury brands have the best resale value?',
      'What are the most popular luxury trends right now?'
    ]
  };

  function getDynamicQuestions(topic, ctx){
    var base = questionsByTopic[topic] || questionsByTopic['general'];
    var combined = ctx.titleLower + ' ' + ctx.labels.join(' ') + ' ' + ctx.body;
    var matched = [];
    var seen = {};

    for(var i = 0; i < base.length; i++){
      var q = base[i];
      var words = q.toLowerCase().replace(/[^a-z0-9 ]/g,'').split(' ');
      var hits = 0;
      for(var w = 0; w < words.length; w++){
        if(words[w].length > 4 && combined.indexOf(words[w]) !== -1){ hits++; }
      }
      if(hits > 0 && !seen[q]){
        seen[q] = true;
        matched.push({q:q, hits:hits});
      }
    }

    matched.sort(function(a,b){ return b.hits - a.hits; });
    var result = [];
    for(var m = 0; m < matched.length; m++){ result.push(matched[m].q); }

    for(var b = 0; b < base.length && result.length < 6; b++){
      if(!seen[base[b]]){ result.push(base[b]); seen[base[b]] = true; }
    }

    return result.slice(0, 6);
  }

  /* ============================================================
     STEP 4 - Build widget HTML
  ============================================================ */
  function buildWidget(){
    var ctx = getPageContext();
    var topic = detectTopic(ctx);
    var questions = getDynamicQuestions(topic, ctx);

    var pillsHtml = '';
    for(var i = 0; i < questions.length; i++){
      pillsHtml += '<span class="hc-sug-pill">' + questions[i] + '</span>';
    }

    var topicHint = ctx.title ? ' about "' + ctx.title + '"' : '';

    var wrap = document.getElementById('hcAiWidget');
    if(!wrap){ return; }

    wrap.innerHTML =
      '<div class="hc-ai-header">' +
        '<div class="hc-ai-avatar">&#129302;</div>' +
        '<div class="hc-ai-header-text">' +
          '<h3>Ask Hichicas AI Assistant</h3>' +
          '<p>Your personal shopping &amp; style advisor</p>' +
        '</div>' +
        '<div class="hc-ai-status"><div class="hc-ai-dot"></div> Online</div>' +
      '</div>' +
      '<div class="hc-suggestions">' +
        '<span class="hc-sug-label">&#128161; Questions about this article</span>' +
        '<div class="hc-sug-pills" id="hcSugPills">' + pillsHtml + '</div>' +
      '</div>' +
      '<div class="hc-chat-area" id="hcChatArea">' +
        '<div class="hc-msg ai">' +
          '<div class="hc-msg-avatar">&#129302;</div>' +
          '<div class="hc-msg-bubble">' +
            '&#128075; <strong>Hello! I am the Hichicas AI Assistant.</strong><br/><br/>' +
            'I have read the article' + topicHint + '. Ask me anything and I will also suggest the best products on Amazon! &#127749;' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div class="hc-input-wrap">' +
        '<div class="hc-input-row">' +
          '<textarea class="hc-input" id="hcInput" placeholder="Ask anything about this article..." rows="1"></textarea>' +
          '<button class="hc-send-btn" id="hcSendBtn" title="Send">&#10148;</button>' +
        '</div>' +
      '</div>';
  }

  /* ============================================================
     STEP 5 - Amazon product logic
  ============================================================ */
  function amazonUrl(keyword){
    return 'https://www.amazon.com/s?k=' + encodeURIComponent(keyword.trim()) + '&tag=' + AFFILIATE_TAG;
  }

  function extractProductKeywords(aiText, userQuestion, topic){
    var keywords = [];
    var combined = (aiText + ' ' + userQuestion).toLowerCase();

    var topicDefaults = {
      handbag:   ['luxury handbag women','designer tote bag','leather crossbody bag'],
      shoe:      ['luxury shoes women','designer sneakers','leather heels'],
      watch:     ['luxury watch women','automatic watch','designer watch men'],
      jewelry:   ['gold jewelry women','diamond necklace','luxury bracelet'],
      perfume:   ['luxury perfume women','long lasting fragrance','designer cologne'],
      skincare:  ['body lotion dry skin','CeraVe moisturizer','Cetaphil body lotion'],
      makeup:    ['luxury foundation','long lasting lipstick','designer mascara'],
      haircare:  ['hair growth serum','luxury shampoo','hair repair treatment'],
      clothing:  ['luxury fashion women','designer dress','capsule wardrobe essentials'],
      tech:      ['best smartphone 2025','laptop women','smartwatch'],
      travel:    ['carry on luggage','travel accessories women','weekender bag'],
      fitness:   ['workout clothes women','yoga mat','gym bag'],
      food:      ['cookware set','meal prep containers','kitchen appliances'],
      home:      ['home decor','scented candles','throw pillows'],
      general:   ['luxury gifts women','best luxury products 2025','designer accessories']
    };

    var brands = [
      'louis vuitton','gucci','prada','chanel','hermes','dior','burberry','coach',
      'michael kors','kate spade','tory burch','versace','fendi','balenciaga',
      'rolex','omega','cartier','tiffany','louboutin','jimmy choo',
      'cetaphil','cerave','nivea','neutrogena','aveeno','eucerin'
    ];

    for(var b = 0; b < brands.length; b++){
      if(combined.indexOf(brands[b]) !== -1 && keywords.indexOf(brands[b]) === -1){
        keywords.push(brands[b]);
      }
    }

    if(keywords.length === 0){
      var defaults = topicDefaults[topic] || topicDefaults['general'];
      keywords.push(defaults[0]);
      if(defaults[1]){ keywords.push(defaults[1]); }
    }

    return keywords.slice(0, 3);
  }

  function buildProductCards(keywords){
    if(!keywords || keywords.length === 0){ return ''; }
    var html = '<div class="hc-products"><span class="hc-prod-label">&#128722; Recommended on Amazon</span>';
    for(var i = 0; i < keywords.length; i++){
      var kw = keywords[i];
      var displayName = kw.replace(/\b\w/g, function(c){ return c.toUpperCase(); });
      html += '<a href="' + amazonUrl(kw) + '" target="_blank" rel="noopener" class="hc-product-card">';
      html += '<span class="hc-product-icon">&#128722;</span>';
      html += '<div class="hc-product-info"><span class="hc-product-name">' + displayName + '</span>';
      html += '<span class="hc-product-desc"></span></div>';
      html += '<span class="hc-product-cta">Shop &rarr;</span></a>';
    }
    html += '</div>';
    return html;
  }

  /* ============================================================
     STEP 6 - Chat logic
  ============================================================ */
  function addMsg(role, html){
    var area = document.getElementById('hcChatArea');
    var div = document.createElement('div');
    div.className = 'hc-msg ' + role;
    var icon = (role === 'ai') ? '&#129302;' : '&#128100;';
    div.innerHTML = '<div class="hc-msg-avatar">' + icon + '</div><div class="hc-msg-bubble">' + html + '</div>';
    area.appendChild(div);
    area.scrollTop = area.scrollHeight;
    return div;
  }

  function showTyping(){
    var area = document.getElementById('hcChatArea');
    var div = document.createElement('div');
    div.className = 'hc-msg ai hc-typing';
    div.id = 'hcTyping';
    div.innerHTML = '<div class="hc-msg-avatar">&#129302;</div><div class="hc-msg-bubble"><div class="hc-typing-dots"><span></span><span></span><span></span></div></div>';
    area.appendChild(div);
    area.scrollTop = area.scrollHeight;
  }

  function removeTyping(){
    var t = document.getElementById('hcTyping');
    if(t){ t.parentNode.removeChild(t); }
  }

  function callAI(userMessage){
    var ctx = getPageContext();
    var topic = detectTopic(ctx);

    var systemPrompt =
      'You are the Hichicas AI Assistant on hichicas.com - a friendly expert shopping and lifestyle advisor. ' +
      'The visitor is reading an article titled: "' + ctx.title + '". ' +
      'Article topic category: ' + topic + '. ' +
      'Article labels: ' + (ctx.labels.length ? ctx.labels.join(', ') : 'general') + '. ' +
      'Answer questions related to this article topic - whether it is handbags, shoes, watches, jewelry, skincare, fashion, tech or any other lifestyle topic. ' +
      'Be warm, helpful and conversational. Keep answers to 3-5 sentences. ' +
      'Always mention 1-3 relevant product names or brands when helpful. ' +
      'Do not use markdown headers or bullet points. ' +
      'End with a brief encouraging note. ' +
      'Be AdSense-safe always.';

    return fetch(PROXY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({
        system: systemPrompt,
        messages: [{ role: 'user', content: userMessage }]
      })
    }).then(function(r){ return r.json(); })
    .then(function(data){
      if(data && data.content && data.content[0]){ return data.content[0].text; }
      return 'I could not process that right now. Please try again!';
    });
  }

  function sendMessage(text){
    if(!text || !text.trim()){ return; }
    var btn = document.getElementById('hcSendBtn');
    var input = document.getElementById('hcInput');
    var ctx = getPageContext();
    var topic = detectTopic(ctx);

    addMsg('user', text);
    input.value = '';
    input.style.height = 'auto';
    btn.disabled = true;
    showTyping();

    callAI(text).then(function(aiText){
      removeTyping();
      var keywords = extractProductKeywords(aiText, text, topic);
      var formatted = aiText.replace(/\n\n/g,'<br><br>').replace(/\n/g,'<br>');
      addMsg('ai', formatted + buildProductCards(keywords));
      btn.disabled = false;
      input.focus();
    }).catch(function(){
      removeTyping();
      addMsg('ai','&#128533; Sorry, something went wrong. Please try again!');
      btn.disabled = false;
      input.focus();
    });
  }

  /* ============================================================
     STEP 7 - Init
  ============================================================ */
  function init(){
    buildWidget();

    document.getElementById('hcSendBtn').addEventListener('click', function(){
      sendMessage(document.getElementById('hcInput').value.trim());
    });

    document.getElementById('hcInput').addEventListener('keydown', function(e){
      if(e.key === 'Enter' && !e.shiftKey){ e.preventDefault(); sendMessage(this.value.trim()); }
    });

    document.getElementById('hcInput').addEventListener('input', function(){
      this.style.height = 'auto';
      this.style.height = Math.min(this.scrollHeight, 120) + 'px';
    });

    document.getElementById('hcSugPills').addEventListener('click', function(e){
      if(e.target.className.indexOf('hc-sug-pill') !== -1){ sendMessage(e.target.textContent); }
    });
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
