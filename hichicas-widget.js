/* Hichicas.com AI Widget JS | github.com/tosharetoday007/hichicas */
(function(){

  var AFFILIATE_TAG = 'latestfotocom-20';
  var PROXY_URL = 'https://script.google.com/macros/s/AKfycbwX5TIkIg55a0aM5cDv7ESS20xlBiC6qPc0ZEVuifSLVm6BnlkKuf0jo-JPIflccPCY/exec';

  /* ============================================================
     STEP 1 - Read page context
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
      labels.push(labelEls[i].textContent.trim());
    }

    var bodyText = '';
    var bodyEl = document.querySelector('.post-body') ||
                 document.querySelector('.entry-content') ||
                 document.querySelector('article');
    if(bodyEl){ bodyText = bodyEl.textContent.replace(/\s+/g,' ').trim().substring(0, 600); }

    return {
      title: title,
      labels: labels,
      body: bodyText
    };
  }

  /* ============================================================
     STEP 2 - Call Groq to generate questions and product keywords
  ============================================================ */
  function callProxy(systemPrompt, userMessage, callback){
    fetch(PROXY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({
        system: systemPrompt,
        max_tokens: 400,
        messages: [{ role: 'user', content: userMessage }],
        origin: window.location.hostname
      })
    }).then(function(r){ return r.json(); })
    .then(function(data){
      if(data && data.content && data.content[0]){
        callback(null, data.content[0].text);
      } else {
        callback('No response', null);
      }
    }).catch(function(err){
      callback(err, null);
    });
  }

  /* ============================================================
     STEP 3 - Build widget shell first, then load questions
  ============================================================ */
  function buildWidget(){
    var ctx = getPageContext();
    var topicHint = ctx.title ? ' about "' + ctx.title + '"' : '';

    var wrap = document.getElementById('hcAiWidget');
    if(!wrap){ return; }

    // Build shell with loading state for pills
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
        '<div class="hc-sug-pills" id="hcSugPills"><span class="hc-sug-pill" style="opacity:0.5">Loading questions...</span></div>' +
      '</div>' +
      '<div class="hc-chat-area" id="hcChatArea">' +
        '<div class="hc-msg ai">' +
          '<div class="hc-msg-avatar">&#129302;</div>' +
          '<div class="hc-msg-bubble">' +
            '&#128075; <strong>Hello! I am the Hichicas AI Assistant.</strong><br/><br/>' +
            'I have read the article' + topicHint + '. Ask me anything and I will suggest helpful products! &#127749;' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div class="hc-input-wrap">' +
        '<div class="hc-input-row">' +
          '<textarea class="hc-input" id="hcInput" placeholder="Ask anything about this article..." rows="1"></textarea>' +
          '<button class="hc-send-btn" id="hcSendBtn" title="Send">&#10148;</button>' +
        '</div>' +
      '</div>';

    // Now load dynamic questions from Groq
    loadDynamicQuestions(ctx);

    // Attach events
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

  /* ============================================================
     STEP 4 - Load questions dynamically from Groq
  ============================================================ */
  function loadDynamicQuestions(ctx){
    var systemPrompt =
      'You are a question generator. Given an article title, labels and excerpt, ' +
      'generate exactly 6 short natural questions a reader would ask after reading this article. ' +
      'Questions must be directly about the article topic - if it is about lehenga, all questions about lehenga. ' +
      'If it is about visa, all questions about visa. If it is about cameras, all about cameras. ' +
      'Keep each question under 10 words. ' +
      'Return ONLY a JSON array of 6 strings. No explanation. No markdown. Example: ' +
      '["Question 1?","Question 2?","Question 3?","Question 4?","Question 5?","Question 6?"]';

    var userMsg =
      'Article title: ' + ctx.title + '\n' +
      'Labels: ' + ctx.labels.join(', ') + '\n' +
      'Excerpt: ' + ctx.body.substring(0, 300);

    callProxy(systemPrompt, userMsg, function(err, response){
      var pills = document.getElementById('hcSugPills');
      if(!pills){ return; }

      if(err || !response){
        pills.innerHTML = '<span class="hc-sug-pill">Tell me about ' + ctx.title + '</span>';
        return;
      }

      try {
        // Clean response and parse JSON
        var clean = response.trim().replace(/```json|```/g,'').trim();
        var questions = JSON.parse(clean);
        if(!Array.isArray(questions)){ throw new Error('Not array'); }

        var html = '';
        for(var i = 0; i < questions.length && i < 6; i++){
          html += '<span class="hc-sug-pill">' + questions[i] + '</span>';
        }
        pills.innerHTML = html;
      } catch(e){
        // Fallback - use title based question
        pills.innerHTML = '<span class="hc-sug-pill">Tell me more about ' + ctx.title + '</span>';
      }
    });
  }

  /* ============================================================
     STEP 5 - Amazon product logic - keywords from Groq
  ============================================================ */
  function amazonUrl(keyword){
    return 'https://www.amazon.com/s?k=' + encodeURIComponent(keyword.trim()) + '&tag=' + AFFILIATE_TAG;
  }

  function getAmazonKeywords(aiText, userQuestion, ctx, callback){
    var systemPrompt =
      'You are an Amazon product keyword generator. ' +
      'Given an article topic and an AI answer, generate 2-3 Amazon search keywords for products directly related to the topic. ' +
      'If article is about lehenga - return lehenga keywords. ' +
      'If about visa - return immigration books. ' +
      'If about cameras - return camera keywords. ' +
      'Keep each keyword under 6 words. ' +
      'Return ONLY a JSON array. No explanation. No markdown. Example: ' +
      '["lehenga for women","bridal lehenga choli","designer lehenga 2025"]';

    var userMsg =
      'Article title: ' + ctx.title + '\n' +
      'Labels: ' + ctx.labels.join(', ') + '\n' +
      'User question: ' + userQuestion + '\n' +
      'AI answer summary: ' + aiText.substring(0, 200);

    callProxy(systemPrompt, userMsg, function(err, response){
      if(err || !response){
        callback([ctx.title]);
        return;
      }
      try {
        var clean = response.trim().replace(/```json|```/g,'').trim();
        var keywords = JSON.parse(clean);
        if(!Array.isArray(keywords) || keywords.length === 0){ throw new Error('Bad array'); }
        callback(keywords.slice(0, 3));
      } catch(e){
        callback([ctx.title]);
      }
    });
  }

  function buildProductCards(keywords){
    if(!keywords || keywords.length === 0){ return ''; }
    var html = '<div class="hc-products">';
    for(var i = 0; i < keywords.length; i++){
      var kw = keywords[i];
      var displayName = kw.replace(/\b\w/g, function(c){ return c.toUpperCase(); });
      html += '<a href="' + amazonUrl(kw) + '" target="_blank" rel="noopener" class="hc-product-card">';
      html += '<span class="hc-product-icon">&#128722;</span>';
      html += '<div class="hc-product-info"><span class="hc-product-name">' + displayName + '</span></div>';
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

  function callAI(userMessage, ctx){
    var systemPrompt =
      'You are the Hichicas AI Assistant on hichicas.com - a friendly expert shopping and lifestyle advisor. ' +
      'The visitor is reading an article titled: "' + ctx.title + '". ' +
      'Article labels: ' + (ctx.labels.length ? ctx.labels.join(', ') : 'general') + '. ' +
      'IMPORTANT: Answer questions ONLY about the topic of this article. ' +
      'If the article is about lehenga - answer about lehenga. ' +
      'If about cameras - answer about cameras. ' +
      'If about ayurvedic medicine - answer about ayurvedic medicine. ' +
      'Be warm, helpful and conversational. Keep answers to 3-5 sentences. ' +
      'Always mention 1-3 specific relevant product names or brands. ' +
      'Do not use markdown headers or bullet points. ' +
      'End with a brief encouraging note. ' +
      'Be AdSense-safe always.';

    return fetch(PROXY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({
        system: systemPrompt,
        messages: [{ role: 'user', content: userMessage }],
        origin: window.location.hostname
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

    addMsg('user', text);
    input.value = '';
    input.style.height = 'auto';
    btn.disabled = true;
    showTyping();

    callAI(text, ctx).then(function(aiText){
      removeTyping();
      var formatted = aiText.replace(/\n\n/g,'<br><br>').replace(/\n/g,'<br>');

      // Get Amazon keywords from Groq then show response
      getAmazonKeywords(aiText, text, ctx, function(keywords){
        addMsg('ai', formatted + buildProductCards(keywords));
        btn.disabled = false;
        input.focus();
      });
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
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', buildWidget);
  } else {
    buildWidget();
  }

})();
